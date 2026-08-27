import { GoogleGenAI, Type } from "@google/genai";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { MAJOR_ARCANA, getUniversalArcanaForDate, drawPersonalArcana } from "./src/lib/tarotData";

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

// Language map helper
function getLanguageName(lang?: string): string {
  switch (lang?.toLowerCase()) {
    case "en":
      return "English";
    case "pt":
      return "Português";
    case "fr":
      return "Français";
    case "it":
      return "Italiano";
    case "de":
      return "Deutsch";
    case "es":
    default:
      return "Español";
  }
}

// Fallback generator for past life when API key is missing or on error
function getFallbackPastLife(name?: string, query?: string, lang = "es") {
  const language = lang?.toLowerCase() || "es";
  const seeker = name || (language === "en" ? "Soul Seeker" : language === "pt" ? "Buscador de Almas" : language === "fr" ? "Chercheur d'Âme" : language === "it" ? "Cercatore d'Anima" : language === "de" ? "Seelensucher" : "Buscador del Destino");

  const eraOptionsEs = [
    { title: "El Alquimista de Praga", eraLocation: "Praga, Sacro Imperio Romano (1642)", role: "Alquimista y Astrónomo de la Corte", spelled: "ALQUIMISTA PRAGA 1642", color: "#7c3aed", narrative: `En una vida pasada, el alma de ${seeker} caminó bajo las estrellas de Praga. Dedicaste tu existencia a descifrar los secretos de la creación y la armonía celeste.`, death: "Dejaste la vida terrenal pacíficamente durante un eclipse cósmico, rodeado de tus pergaminos.", karma: "Confiar en la intuición sobre la razón pura. En esta vida presente, debes plasmar tus visiones sin temor.", connection: "Sientes una resonancia especial con espíritus creativos y personas que leen la verdad en tus ojos.", relic: "Un astrolabio de bronce grabado con inscripciones zodiacales ancianas." },
    { title: "La Guardiana del Faro de Alejandría", eraLocation: "Egipto Ptolemaico (130 a.C.)", role: "Sacerdotisa de Isis y Astrónoma", spelled: "SACERDOTISA EGIPTO 130AC", color: "#06b6d4", narrative: `Fuiste guardiana de los misterios celestes en las costas de Alejandría, guiando embarcaciones y almas perdidas en la noche del Mediterráneo.`, death: "Trascendiste en oración durante el solsticio de verano junto a las aguas del Nilo.", karma: "Aprender a guiar a otros sin descuidar tu propio fuego interior.", connection: "Atracción magnética hacia el mar, la noche estrellada y los libros antiguos.", relic: "Un amuleto de lapislázuli con el ojo de Horus tallado." },
  ];

  const eraOptionsEn = [
    { title: "The Alchemist of Prague", eraLocation: "Prague, Holy Roman Empire (1642)", role: "Court Alchemist & Astronomer", spelled: "ALCHEMIST PRAGUE 1642", color: "#7c3aed", narrative: `In a past life, the soul of ${seeker} walked beneath the starlit spires of Prague, dedicating their existence to the cosmic arts.`, death: "You passed away peacefully during a celestial eclipse, surrounded by scrolls and arcane instruments.", karma: "Trust spiritual intuition over rigid reason. In this lifetime, express your inner visions without fear.", connection: "You feel an instant resonance with creative and authentic souls.", relic: "A bronze astrolabe engraved with ancient zodiacal symbols." },
    { title: "The High Priestess of Alexandria", eraLocation: "Ptolemaic Egypt (130 BC)", role: "Priestess of Isis & Navigator", spelled: "PRIESTESS EGYPT 130BC", color: "#06b6d4", narrative: `You tended the sacred beacon of Alexandria, guiding lost ships and souls through the waters of antiquity.`, death: "You ascended peacefully at dawn during the summer solstice by the Nile.", karma: "Guide others with empathy without exhausting your own inner light.", connection: "A deep magnetic affinity for the open sea and nocturnal skies.", relic: "A polished lapis lazuli amulet inscribed with the Eye of Horus." },
  ];

  const eraList = language === "en" ? eraOptionsEn : eraOptionsEs;
  const chosen = eraList[Math.floor(Math.random() * eraList.length)];

  return {
    spelledWord: chosen.spelled,
    pastLifeDetails: {
      title: chosen.title,
      eraLocation: chosen.eraLocation,
      identityRole: chosen.role,
      narrative: chosen.narrative,
      deathTransition: chosen.death,
      karmicLesson: chosen.karma,
      soulConnection: chosen.connection,
      soulRelic: chosen.relic,
      vibeColor: chosen.color || "#d97706"
    }
  };
}

function getFallbackSpiritAnswer(question: string, lang = "es") {
  const language = lang?.toLowerCase() || "es";
  if (language === "en") {
    const answersEn = [
      { spelled: "LOOK WITHIN YOUR SOUL", type: "YES" as const, spirit: "The portal opens. The ancestors confirm that the answer resides within your deepest intuition.", name: "Guardian of the Mist" },
      { spelled: "DO NOT FEAR THE UNKNOWN", type: "NO" as const, spirit: "The shadows reveal that what you fear holds no power over your light. Embrace new beginnings.", name: "Benevolent Shadow" },
      { spelled: "LIGHT GUIDES YOUR PATH", type: "SPELLOUT" as const, spirit: "Destiny weaves golden threads around your intentions. Follow your heart's quiet call.", name: "Celestial Oracle" }
    ];
    return answersEn[Math.floor(Math.random() * answersEn.length)];
  }

  const answers = [
    { spelled: "SI BUSCA EN TU INTERIOR", type: "YES" as const, spirit: "El Portal se abre. Los ancestros confirman que la respuesta vive en tu intuición más profunda.", name: "Guardián de la Bruma" },
    { spelled: "NO TEMAS EL CAMBIO", type: "NO" as const, spirit: "Las sombras revelan que lo que temes no te dañará. Abre los brazos a lo desconocido.", name: "Sombra Benefactora" },
    { spelled: "LA LUZ GUIA TU PASO", type: "SPELLOUT" as const, spirit: "El destino teje hilos dorados en torno a tus decisiones. Sigue el impulso de tu corazón.", name: "Oráculo Celeste" }
  ];
  return answers[Math.floor(Math.random() * answers.length)];
}

// API Route 1: Past Life Revelation
app.post("/api/ouija/past-life", async (req, res) => {
  incrementConsultation();
  try {
    const { name, birthYear, focusQuery, feeling, lang = "es" } = req.body;
    const ai = getAIClient();
    const targetLangName = getLanguageName(lang);

    if (!ai) {
      return res.json(getFallbackPastLife(name, focusQuery, lang));
    }

    const prompt = `Act as an ancient guardian entity of the Akashic Records and soul memory communicating through the Ouija Board.
The seeker requests access to their Akashic Record to discover their past life incarnation.
Seeker details:
- Name / Alias: ${name || "Anonymous Seeker"}
- Birth Year or Intuitive Era: ${birthYear || "Unknown"}
- Intention or Question: ${focusQuery || "Who was I in my past life?"}
- Intuitive feeling: ${feeling || "Search for higher purpose"}
- Target Language for output: ${targetLangName} (Translate and formulate all narrative and details in ${targetLangName})

Generate a deep, solemn, transcendental and historical past life revelation.
IMPORTANT for 'spelledWord':
Must be a SHORT phrase in UPPERCASE without accents or symbols (maximum 25 characters, only A-Z, 0-9 and spaces) that the Ouija planchette will physically spell letter-by-letter on the board. Example: "ALCHEMIST PRAGUE 1642" or "ALQUIMISTA PRAGA 1642" or "SACERDOTE EGIPTO 130BC".

Respond strictly in JSON format with this structure:
{
  "spelledWord": "SHORT UPPERCASE TEXT TO SPELL ON OUIJA",
  "pastLifeDetails": {
    "title": "Evocative title in ${targetLangName}",
    "eraLocation": "Exact location and era (e.g., Alexandria, Egypt - 2nd Century BC)",
    "identityRole": "Soul occupation or identity in ${targetLangName}",
    "narrative": "Captivating and solemn historical narrative in ${targetLangName}",
    "deathTransition": "How the soul transitioned into the afterlife in ${targetLangName}",
    "karmicLesson": "Transcendental karmic lesson for their present lifetime in ${targetLangName}",
    "soulConnection": "Soul bonds and connections in ${targetLangName}",
    "soulRelic": "Spiritual channeling relic or talisman in ${targetLangName}",
    "vibeColor": "Hex color code for aura (e.g., #d97706, #7c3aed, #059669, #b91c1c, #2563eb)"
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
      parsed.spelledWord = (parsed.spelledWord || "PAST LIFE").toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 30);
      return res.json(parsed);
    } else {
      return res.json(getFallbackPastLife(name, focusQuery, lang));
    }
  } catch (error) {
    console.error("Error in /api/ouija/past-life:", error);
    return res.json(getFallbackPastLife(req.body?.name, req.body?.focusQuery, req.body?.lang));
  }
});

// API Route 2: General Spirit Query
app.post("/api/ouija/spirit-question", async (req, res) => {
  incrementConsultation();
  try {
    const { question, seekerName, lang = "es" } = req.body;
    const ai = getAIClient();
    const targetLangName = getLanguageName(lang);

    if (!ai) {
      return res.json(getFallbackSpiritAnswer(question, lang));
    }

    const prompt = `Act as the consciousness of the Akashic Records channeled through the Ouija Board.
Question by ${seekerName || "the seeker"}: "${question || "What is the lesson for my soul?"}"
Target Language for response: ${targetLangName}.

Respond with deep spiritual wisdom, solemn, elevated and protective tone.
Determine if the main reply is YES, NO, or a SPELLOUT.
SpelledWord must be SHORT (max 20 chars in UPPERCASE without accents, e.g. "LOOK WITHIN", "CONFIA EN TU LUZ", "SEEK THE LIGHT").

Respond strictly in JSON format:
{
  "spelledWord": "SHORT UPPERCASE TEXT",
  "answerType": "YES" | "NO" | "SPELLOUT",
  "spiritMessage": "Poetic, solemn and revealing message in ${targetLangName}",
  "spiritName": "Title of the channeling plane or energy in ${targetLangName} (e.g. Akashic Guardian, Soul Guide)"
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
      return res.json(getFallbackSpiritAnswer(question, lang));
    }
  } catch (error) {
    console.error("Error in /api/ouija/spirit-question:", error);
    return res.json(getFallbackSpiritAnswer(req.body?.question || "", req.body?.lang));
  }
});

// API Route 3: Universal Arcana of the Day
app.get("/api/tarot/daily", (req, res) => {
  const lang = (req.query.lang as string) || "es";
  const dailyCard = getUniversalArcanaForDate(new Date(), lang);
  const locale = lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : lang === "fr" ? "fr-FR" : lang === "it" ? "it-IT" : lang === "de" ? "de-DE" : "es-AR";
  const aspectPrefix = lang === "en" ? "Archetypal Energy of" : lang === "pt" ? "Energia Arquetípica de" : lang === "fr" ? "Énergie Archétypale de" : lang === "it" ? "Energia Archetipica di" : lang === "de" ? "Archetypische Energie von" : "Energía Arquetípica de";
  res.json({
    arcana: dailyCard,
    isAiEnhanced: false,
    cosmicDate: new Date().toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    dayAspect: `${aspectPrefix} ${dailyCard.name} (${dailyCard.romanNumber})`,
  });
});

// API Route 4: Personal Tarot Daily Draw (with AI enhancement if available)
app.post("/api/tarot/draw", async (req, res) => {
  incrementConsultation();
  const { seekerName, focusQuery, seed, excludeId, lang = "es" } = req.body || {};
  const baseCard = drawPersonalArcana(seed || `${seekerName || "seeker"}_${Date.now()}_${Math.random()}`, excludeId, lang);
  const targetLangName = getLanguageName(lang);
  const locale = lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : lang === "fr" ? "fr-FR" : lang === "it" ? "it-IT" : lang === "de" ? "de-DE" : "es-AR";
  const personalReadingPrefix = lang === "en" ? "Personal Reading of" : lang === "pt" ? "Leitura Pessoal de" : lang === "fr" ? "Lecture Personnelle de" : lang === "it" ? "Lettura Personale di" : lang === "de" ? "Persönliche Lesung von" : "Lectura Personal de";
  const channeledPrefix = lang === "en" ? "Channeled Reading of" : lang === "pt" ? "Leitura Canalizada de" : lang === "fr" ? "Lecture Canalisée de" : lang === "it" ? "Lettura Canalizzata di" : lang === "de" ? "Gechannelte Lesung von" : "Lectura Canalizada de";

  const ai = getAIClient();
  if (!ai) {
    return res.json({
      arcana: baseCard,
      isAiEnhanced: false,
      cosmicDate: new Date().toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      dayAspect: `${personalReadingPrefix} ${baseCard.name}`,
    });
  }

  try {
    const prompt = `Act as the Oracle of the Akashic Records and Master of Esoteric Marseille Tarot.
The seeker "${seekerName || "Seeker"}" has drawn the Major Arcana: "${baseCard.name}" (${baseCard.romanNumber}) / "${baseCard.marseilleTitle || baseCard.englishName}".
Archetype: ${baseCard.archetype}. Element: ${baseCard.element}. Sign/Planet: ${baseCard.astrologicalSign}.
${focusQuery ? `Seeker's inquiry or intention: "${focusQuery}"` : "The seeker seeks guidance and wisdom for their path today."}
Target Language: ${targetLangName}.

Provide a profound, solemn, poetic and transcendental tarot reading in ${targetLangName} personalized for the seeker today.
Return strictly a JSON object with:
{
  "dailyMessage": "Inspiring and revealing message in ${targetLangName} (2-3 sentences)",
  "practicalAdvice": "Practical, actionable guidance for today in ${targetLangName}",
  "dailyAffirmation": "Powerful first-person affirmation in ${targetLangName}",
  "meditationQuestion": "Deep self-inquiry reflection question in ${targetLangName}"
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
            dailyMessage: { type: Type.STRING },
            practicalAdvice: { type: Type.STRING },
            dailyAffirmation: { type: Type.STRING },
            meditationQuestion: { type: Type.STRING },
          },
          required: ["dailyMessage", "practicalAdvice", "dailyAffirmation", "meditationQuestion"],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (jsonText) {
      const parsed = JSON.parse(jsonText);
      const enhancedCard = {
        ...baseCard,
        dailyMessage: parsed.dailyMessage || baseCard.dailyMessage,
        practicalAdvice: parsed.practicalAdvice || baseCard.practicalAdvice,
        dailyAffirmation: parsed.dailyAffirmation || baseCard.dailyAffirmation,
        meditationQuestion: parsed.meditationQuestion || baseCard.meditationQuestion,
      };
      return res.json({
        arcana: enhancedCard,
        isAiEnhanced: true,
        cosmicDate: new Date().toLocaleDateString(lang === "en" ? "en-US" : "es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        dayAspect: `Lectura Personal Canalizada de ${enhancedCard.name}`,
      });
    }
  } catch (err) {
    console.warn("Could not generate AI tarot enhancement, using sacred base arcana:", err);
  }

  return res.json({
    arcana: baseCard,
    isAiEnhanced: false,
    cosmicDate: new Date().toLocaleDateString(lang === "en" ? "en-US" : "es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    dayAspect: `Lectura Personal de ${baseCard.name}`,
  });
});

// API Route 5: All 22 Major Arcana
app.get("/api/tarot/all", (req, res) => {
  res.json({
    cards: MAJOR_ARCANA,
    total: MAJOR_ARCANA.length,
  });
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
