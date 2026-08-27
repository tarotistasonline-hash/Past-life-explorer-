import { GoogleGenAI, Type } from "@google/genai";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent Real Visitor Counter Storage
const VISITS_DATA_DIR = path.join(process.cwd(), "data");
const VISITS_FILE = path.join(VISITS_DATA_DIR, "visits.json");

interface VisitsData {
  totalVisits: number;
  totalConsultations: number;
  dailyVisits: Record<string, number>; // "YYYY-MM-DD" -> count
  uniqueVisitors: string[]; // hashed/stored visitor IDs
  lastUpdated: string;
}

let visitsState: VisitsData = {
  totalVisits: 1, // Authentic real visits starting with real users
  totalConsultations: 0,
  dailyVisits: {},
  uniqueVisitors: [],
  lastUpdated: new Date().toISOString(),
};

// Initialize visits file
try {
  if (!fs.existsSync(VISITS_DATA_DIR)) {
    fs.mkdirSync(VISITS_DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(VISITS_FILE)) {
    const raw = fs.readFileSync(VISITS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    visitsState = {
      ...visitsState,
      ...parsed,
    };
  } else {
    fs.writeFileSync(VISITS_FILE, JSON.stringify(visitsState, null, 2), "utf-8");
  }
} catch (e) {
  console.warn("Could not load visits.json, using in-memory state:", e);
}

function saveVisitsData() {
  try {
    if (!fs.existsSync(VISITS_DATA_DIR)) {
      fs.mkdirSync(VISITS_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(VISITS_FILE, JSON.stringify(visitsState, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not save visits.json:", e);
  }
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Visits API Endpoints
app.get("/api/visits", (req, res) => {
  const todayKey = getTodayKey();
  const todayCount = visitsState.dailyVisits[todayKey] || 0;
  res.json({
    totalVisits: visitsState.totalVisits,
    todayVisits: todayCount,
    totalConsultations: visitsState.totalConsultations,
    uniqueVisitorsCount: visitsState.uniqueVisitors.length || visitsState.totalVisits,
    lastUpdated: visitsState.lastUpdated,
  });
});

app.post("/api/visits/hit", (req, res) => {
  const { visitorId, isNewSession } = req.body || {};
  const todayKey = getTodayKey();

  // Always increment total visits on hits
  visitsState.totalVisits += 1;
  visitsState.dailyVisits[todayKey] = (visitsState.dailyVisits[todayKey] || 0) + 1;

  if (visitorId && typeof visitorId === "string") {
    if (!visitsState.uniqueVisitors.includes(visitorId)) {
      visitsState.uniqueVisitors.push(visitorId);
      // Keep only last 10000 unique visitor IDs in memory/disk to prevent unlimited growth
      if (visitsState.uniqueVisitors.length > 10000) {
        visitsState.uniqueVisitors = visitsState.uniqueVisitors.slice(-10000);
      }
    }
  }

  visitsState.lastUpdated = new Date().toISOString();
  saveVisitsData();

  const todayCount = visitsState.dailyVisits[todayKey] || 0;
  res.json({
    totalVisits: visitsState.totalVisits,
    todayVisits: todayCount,
    totalConsultations: visitsState.totalConsultations,
    uniqueVisitorsCount: visitsState.uniqueVisitors.length,
    lastUpdated: visitsState.lastUpdated,
  });
});

// Helper to record consultations
function incrementConsultation() {
  visitsState.totalConsultations = (visitsState.totalConsultations || 0) + 1;
  visitsState.lastUpdated = new Date().toISOString();
  saveVisitsData();
}

// Initialize GenAI client safely
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Will return simulated spirit responses if missing.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Fallback generator for past life when API key is missing or on error
function getFallbackPastLife(name?: string, query?: string) {
  const eraOptions = [
    { title: "El Alquimista de Praga", eraLocation: "Praga, Sacro Imperio Romano (1642)", role: "Alquimista y Astrónomo de la Corte", spelled: "ALQUIMISTA PRAGA 1642", color: "#7c3aed" },
    { title: "La Guardiana del Faro de Alejandría", eraLocation: "Egipto Ptolemaico (130 a.C.)", role: "Sacerdotisa de Isis y Astrónoma", spelled: "SACERDOTISA EGIPTO 130AC", color: "#06b6d4" },
    { title: "El Navegante de las Molucas", eraLocation: "Océano Pacífico (1588)", role: "Cartógrafo y Capitán de Goleta", spelled: "NAVEGANTE PACIFICO 1588", color: "#059669" },
    { title: "La Tejedora de Kyoto", eraLocation: "Kyoto, Japón Era Edo (1710)", role: "Artesana de Kimonos y Poetisa", spelled: "TEJEDORA KYOTO 1710", color: "#ec4899" },
    { title: "El Trovador de Provenza", eraLocation: "Francia Medieval (1240)", role: "Poeta Errante y Músico", spelled: "TROVADOR PROVENZA 1240", color: "#d97706" },
    { title: "El Guerrero Jaguar de Tenochtitlan", eraLocation: "Imperio Mexica (1492)", role: "Guardián del Templo del Sol", spelled: "GUERRERO JAGUAR 1492", color: "#b91c1c" }
  ];
  const chosen = eraOptions[Math.floor(Math.random() * eraOptions.length)];
  const seeker = name || "Buscador del Destino";
  return {
    spelledWord: chosen.spelled,
    pastLifeDetails: {
      title: chosen.title,
      eraLocation: chosen.eraLocation,
      identityRole: chosen.role,
      narrative: `En una vida pasada, la alma de ${seeker} caminó bajo las estrellas de ${chosen.eraLocation}. Dedicaste tu existencia a descifrar los secretos de la creación y la armonía celeste. Tu sensibilidad actual y tu curiosidad insaciable nacieron en los pasillos de aquella época lejana.`,
      deathTransition: "Dejaste la vida terrenal pacíficamente durante un eclipse cósmico, rodeado de tus pergaminos y descubrimientos.",
      karmicLesson: "Confiar en la intuición sobre la razón pura. En esta vida presente, debes aprender a plasmar tus visiones sin temor al juicio ajeno.",
      soulConnection: "Sientes una resonancia especial con espíritus creativos y personas que leen la verdad en tus ojos.",
      soulRelic: "Un astrolabio de bronce grabado con inscripciones zodiacales ancianas.",
      vibeColor: chosen.color || "#d97706"
    }
  };
}

function getFallbackSpiritAnswer(question: string) {
  const answers = [
    { spelled: "SI BUSCA EN TU INTERIOR", type: "YES", spirit: "El Portal se abre. Los ancestros confirman que la respuesta vive en tu intuición más profunda.", name: "Guardián de la Bruma" },
    { spelled: "NO TEMAS EL CAMBIO", type: "NO", spirit: "Las sombras revelan que lo que temes no te dañará. Abre los brazos a lo desconocido.", name: "Sombra Benefactora" },
    { spelled: "LA LUZ GUIA TU PASO", type: "SPELLOUT", spirit: "El destino teje hilos dorados en torno a tus decisiones. Sigue el impulso de tu corazón.", name: "Oráculo Celeste" }
  ];
  return answers[Math.floor(Math.random() * answers.length)];
}

// API Route 1: Past Life Revelation
app.post("/api/ouija/past-life", async (req, res) => {
  incrementConsultation();
  try {
    const { name, birthYear, focusQuery, feeling } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json(getFallbackPastLife(name, focusQuery));
    }

    const prompt = `Actúa como una entidad guardiana de los Registros Akáshicos y la memoria del alma comunicándose a través de la Tabla Ouija.
El consultante solicita acceder a su Registro Akáshico y conocer su vida pasada.
Detalles del consultante:
- Nombre / Apodo: ${name || "Buscador Anónimo"}
- Año de Nacimiento u época intuitiva: ${birthYear || "Desconocido"}
- Intención o Pregunta específica: ${focusQuery || "¿Quién fui en mi vida anterior?"}
- Sensación intuitiva: ${feeling || "Búsqueda de propósito"}

Genera una visión profunda, trascendental y seria sobre una vida pasada fascinante (puedes elegir cualquier época histórica realista: Egipto, Japón Edo, Renacimiento, Revolución Industrial, Grecia Antigua, Mayas, etc.).

IMPORTANTE para 'spelledWord':
Debe ser un texto CORTO y contundente en MAYÚSCULAS sin acentos (máximo 25 caracteres, usando solo A-Z, 0-9 y espacios) que la planchette de la Ouija deletreará letra por letra sobre la tabla de madera. Ejemplo: "ALQUIMISTA PRAGA 1642" o "SACERDOTISA EGIPTO 130AC" o "CARTOGRAFO SEVILLA 1520".

Responde estrictamente en formato JSON con la siguiente estructura:
{
  "spelledWord": "TEXTO CORTO PARA DELETREAR EN LA OUIJA",
  "pastLifeDetails": {
    "title": "Título evocador de la vida pasada",
    "eraLocation": "Lugar y Época exacta (ej: Alejandría, Egipto - Siglo II a.C.)",
    "identityRole": "Ocupación o Identidad del alma",
    "narrative": "Relato cautivador de su historia, virtudes, secretos y vivencias.",
    "deathTransition": "Cómo fue el momento del paso terrenal de esa alma.",
    "karmicLesson": "Lección kármica trascendental para su vida presente hoy.",
    "soulConnection": "Conexión con almas gemelas o resonancia de personas en su vida actual.",
    "soulRelic": "Objeto o amuleto espiritual canalizador de esa vida.",
    "vibeColor": "Código de color hexadecimal representativo del aura (ej: #d97706, #7c3aed, #059669, #b91c1c, #2563eb)"
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.9,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            spelledWord: { type: Type.STRING },
            pastLifeDetails: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                eraLocation: { type: Type.STRING },
                identityRole: { type: Type.STRING },
                narrative: { type: Type.STRING },
                deathTransition: { type: Type.STRING },
                karmicLesson: { type: Type.STRING },
                soulConnection: { type: Type.STRING },
                soulRelic: { type: Type.STRING },
                vibeColor: { type: Type.STRING },
              },
              required: ["title", "eraLocation", "identityRole", "narrative", "deathTransition", "karmicLesson", "soulRelic", "vibeColor"],
            },
          },
          required: ["spelledWord", "pastLifeDetails"],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (jsonText) {
      const parsed = JSON.parse(jsonText);
      // Clean spelledWord to only uppercase letters, numbers and spaces
      parsed.spelledWord = (parsed.spelledWord || "VIDA PASADA").toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 30);
      return res.json(parsed);
    } else {
      return res.json(getFallbackPastLife(name, focusQuery));
    }
  } catch (error) {
    console.error("Error in /api/ouija/past-life:", error);
    return res.json(getFallbackPastLife(req.body?.name, req.body?.focusQuery));
  }
});

// API Route 2: General Spirit Query
app.post("/api/ouija/spirit-question", async (req, res) => {
  incrementConsultation();
  try {
    const { question, seekerName } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json(getFallbackSpiritAnswer(question));
    }

    const prompt = `Actúa como la conciencia de los Registros Akáshicos expresada a través de la Tabla Ouija.
Pregunta formulada por ${seekerName || "el consultante"}: "${question || "¿Cuál es la lección de mi alma?"}"

Responde con profunda sabiduría espiritual, tono serio, protector y elevado.
Determina si la respuesta principal es un SI, un NO, o un deletreo corto.
SpelledWord debe ser un texto CORTO (máximo 20 caracteres en MAYÚSCULAS sin tildes ni caracteres especiales, ej: "BUSCA EN TU INTERIOR", "CONFIA EN TU LUZ", "SABIDURIA ANCESTRAL").

Responde strictly en formato JSON con esta estructura:
{
  "spelledWord": "TEXTO CORTO EN MAYÚSCULAS",
  "answerType": "YES" | "NO" | "SPELLOUT",
  "spiritMessage": "Respuesta poética, elevada y reveladora completa del Registro Akáshico",
  "spiritName": "Título del plano o energía canalizadora (ej: Guardián Akáshico, Conciencia del Alma, Guía de Luz)"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.85,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            spelledWord: { type: Type.STRING },
            answerType: { type: Type.STRING, enum: ["YES", "NO", "SPELLOUT"] },
            spiritMessage: { type: Type.STRING },
            spiritName: { type: Type.STRING },
          },
          required: ["spelledWord", "answerType", "spiritMessage", "spiritName"],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (jsonText) {
      const parsed = JSON.parse(jsonText);
      parsed.spelledWord = (parsed.spelledWord || "SENSE").toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 25);
      return res.json(parsed);
    } else {
      return res.json(getFallbackSpiritAnswer(question));
    }
  } catch (error) {
    console.error("Error in /api/ouija/spirit-question:", error);
    return res.json(getFallbackSpiritAnswer(req.body?.question || ""));
  }
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
