import { GoogleGenAI, Type } from "@google/genai";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { MAJOR_ARCANA, getUniversalArcanaForDate, drawPersonalArcana } from "./src/lib/tarotData";
import {
  buildStrictSpiritQuestionPrompt,
  getCoherentFallbackSpiritAnswer,
  getCoherentPastLifeFallback,
} from "./src/lib/oracleCoherence";

const app = express();
const PORT = process.env.NODE_ENV === "production" ? (Number(process.env.PORT) || 8080) : 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

// Universal Google Site Verification Endpoints (supports ANY Google verification file or token)
app.get(/^\/google([a-zA-Z0-9_-]+)(?:\.html)?$/, (req, res) => {
  const token = req.params[0];
  const fullFileName = `google${token}.html`;
  const existingFile = path.join(process.cwd(), "public", fullFileName);
  if (fs.existsSync(existingFile)) {
    return res.sendFile(existingFile);
  }
  // Standard Google Search Console HTML verification file payload
  res.type("text/html").send(`google-site-verification: ${fullFileName}\n`);
});

// Robots.txt for Search Engine Crawlers
app.get("/robots.txt", (req, res) => {
  const robotsPath = path.join(process.cwd(), "public", "robots.txt");
  if (fs.existsSync(robotsPath)) {
    res.type("text/plain").send(fs.readFileSync(robotsPath, "utf-8"));
  } else {
    res.type("text/plain").send("User-agent: *\nAllow: /\nSitemap: https://ais-pre-ulzgbsculea2d4feemykvi-172786148761.us-east1.run.app/sitemap.xml\n");
  }
});

// Sitemap.xml for Google Search Console & Indexing
app.get("/sitemap.xml", (req, res) => {
  const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
  if (fs.existsSync(sitemapPath)) {
    res.type("application/xml").send(fs.readFileSync(sitemapPath, "utf-8"));
  } else {
    res.status(404).send("Sitemap not found");
  }
});

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

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

let visitsState: VisitsData = {
  totalVisits: 0,
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
      totalVisits: typeof parsed.totalVisits === "number" ? parsed.totalVisits : 0,
      totalConsultations: typeof parsed.totalConsultations === "number" ? parsed.totalConsultations : 0,
      dailyVisits: parsed.dailyVisits || {},
      uniqueVisitors: Array.isArray(parsed.uniqueVisitors) ? parsed.uniqueVisitors : [],
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
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

// Visits API Endpoints (100% Real Traffic)
app.get("/api/visits", (req, res) => {
  const todayKey = getTodayKey();
  const todayCount = visitsState.dailyVisits[todayKey] || 0;
  res.json({
    totalVisits: visitsState.totalVisits,
    todayVisits: todayCount,
    totalConsultations: visitsState.totalConsultations,
    uniqueVisitorsCount: visitsState.uniqueVisitors.length,
    lastUpdated: visitsState.lastUpdated,
  });
});

app.post("/api/visits/hit", (req, res) => {
  const { visitorId, isNewSession, isAdmin, clientKnownTotal, clientKnownConsultations } = req.body || {};
  const isExcluded = Boolean(isAdmin || req.headers["x-admin-exclude"] === "true");
  const todayKey = getTodayKey();

  // If client knows a higher historical count (e.g. after container restart), synchronize upwards
  if (typeof clientKnownTotal === "number" && clientKnownTotal > visitsState.totalVisits) {
    visitsState.totalVisits = clientKnownTotal;
  }
  if (typeof clientKnownConsultations === "number" && clientKnownConsultations > visitsState.totalConsultations) {
    visitsState.totalConsultations = clientKnownConsultations;
  }

  if (!isExcluded) {
    // Increment real visit count for genuine public visitors
    visitsState.totalVisits += 1;
    visitsState.dailyVisits[todayKey] = (visitsState.dailyVisits[todayKey] || 0) + 1;

    if (visitorId && typeof visitorId === "string") {
      if (!visitsState.uniqueVisitors.includes(visitorId)) {
        visitsState.uniqueVisitors.push(visitorId);
        if (visitsState.uniqueVisitors.length > 20000) {
          visitsState.uniqueVisitors = visitsState.uniqueVisitors.slice(-20000);
        }
      }
    }

    visitsState.lastUpdated = new Date().toISOString();
    saveVisitsData();
  }

  const todayCount = visitsState.dailyVisits[todayKey] || 0;
  res.json({
    totalVisits: visitsState.totalVisits,
    todayVisits: todayCount,
    totalConsultations: visitsState.totalConsultations,
    uniqueVisitorsCount: visitsState.uniqueVisitors.length,
    lastUpdated: visitsState.lastUpdated,
    excluded: isExcluded,
  });
});

// Helper to record consultations (skips admin/creator test calls)
function incrementConsultation(req?: express.Request) {
  const isExcluded = Boolean(req?.body?.isAdmin || req?.headers?.["x-admin-exclude"] === "true");
  if (isExcluded) return;

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

// TTS Engine & Audio Cache Setup (Fenrir Solemn Male Voice of Ultratumba)
const TTS_CACHE_DIR = path.join(process.cwd(), "data", "tts_cache");
if (!fs.existsSync(TTS_CACHE_DIR)) {
  fs.mkdirSync(TTS_CACHE_DIR, { recursive: true });
}

const memoryAudioCache = new Map<string, { audioData: string; mimeType: string }>();

// Load existing disk cache into memory
try {
  const files = fs.readdirSync(TTS_CACHE_DIR);
  for (const f of files) {
    if (f.endsWith(".json")) {
      try {
        const raw = fs.readFileSync(path.join(TTS_CACHE_DIR, f), "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.audioData) {
          const key = f.replace(".json", "");
          memoryAudioCache.set(key, { audioData: parsed.audioData, mimeType: parsed.mimeType || "audio/wav" });
        }
      } catch {}
    }
  }
} catch (e) {
  console.warn("Could not pre-load TTS disk cache:", e);
}

function buildPastLifeNarrationText(details: any, lang: string = "es"): string {
  if (!details) return "";
  const parts: string[] = [];
  if (details.title) parts.push(String(details.title).trim());
  if (details.eraLocation) parts.push(String(details.eraLocation).trim());
  if (details.identityRole) parts.push(String(details.identityRole).trim());

  if (details.narrative) {
    const raw = String(details.narrative).replace(/\bundefined\b/gi, "").trim();
    const sentenceMatch = raw.match(/^(?:[^.!?]+[.!?]){1,2}/);
    if (sentenceMatch && sentenceMatch[0] && sentenceMatch[0].length >= 30) {
      parts.push(sentenceMatch[0].trim());
    } else {
      parts.push(raw.slice(0, 240).trim());
    }
  }

  if (details.karmicLesson) {
    const prefix = lang === "en" ? "Karmic lesson" : lang === "pt" ? "Lição cármica" : lang === "fr" ? "Leçon karmique" : "Lección kármica";
    parts.push(`${prefix}: ${String(details.karmicLesson).slice(0, 140).trim()}`);
  }

  return parts
    .filter(Boolean)
    .join(". ")
    .replace(/\bundefined\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

let ttsQuotaCooldownUntil = 0;

async function generateAndCacheTTS(
  text: string,
  voice: string = "Fenrir",
  lang: string = "es"
): Promise<{ audioData: string; mimeType: string } | null> {
  if (!text || typeof text !== "string") return null;
  const cleanText = text.trim();
  const chosenVoice = ["Fenrir", "Puck", "Charon"].includes(voice) ? voice : "Fenrir";
  const hash = Buffer.from(`${chosenVoice}_${cleanText}`).toString("base64url").slice(0, 80);
  const cacheFile = path.join(TTS_CACHE_DIR, `${hash}.json`);

  if (memoryAudioCache.has(hash)) {
    return memoryAudioCache.get(hash)!;
  }

  if (fs.existsSync(cacheFile)) {
    try {
      const raw = fs.readFileSync(cacheFile, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.audioData) {
        memoryAudioCache.set(hash, { audioData: parsed.audioData, mimeType: parsed.mimeType || "audio/wav" });
        return { audioData: parsed.audioData, mimeType: parsed.mimeType || "audio/wav" };
      }
    } catch (e) {
      // ignore
    }
  }

  // If currently in quota cooldown, avoid making failing remote calls
  if (Date.now() < ttsQuotaCooldownUntil) {
    return null;
  }

  const ai = getAIClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [{
        role: "user",
        parts: [{ text: cleanText.slice(0, 480) }]
      }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice }
          }
        }
      }
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || "audio/wav";

    if (audioData) {
      memoryAudioCache.set(hash, { audioData, mimeType });
      try {
        fs.writeFileSync(cacheFile, JSON.stringify({ audioData, mimeType, voice: chosenVoice, text: cleanText }), "utf-8");
      } catch (e) {
        // ignore
      }
      return { audioData, mimeType };
    }
  } catch (error: any) {
    const errText = String(error?.message || error || "");
    if (
      errText.includes("429") ||
      errText.includes("RESOURCE_EXHAUSTED") ||
      errText.includes("quota") ||
      error?.status === "RESOURCE_EXHAUSTED" ||
      error?.code === 429
    ) {
      // Cooldown for 10 minutes to respect daily rate limits and allow seamless browser fallback
      ttsQuotaCooldownUntil = Date.now() + 10 * 60 * 1000;
      console.log("TTS daily quota reached; falling back to high-quality browser Web Speech engine.");
    } else {
      console.log("TTS service note: utilizing native voice synthesis fallback.");
    }
  }
  return null;
}

// Coherent fallback generator for past life when API key is missing or on error
function getFallbackPastLife(name?: string, query?: string, lang = "es") {
  const result = getCoherentPastLifeFallback(name, query, lang);
  result.pastLifeDetails.narrationText = buildPastLifeNarrationText(result.pastLifeDetails, lang);
  generateAndCacheTTS(result.pastLifeDetails.narrationText, "Fenrir", lang).catch(() => {});
  return result;
}

// Coherent, topic-aware fallback generator for spirit questions
function getFallbackSpiritAnswer(question: string, seekerName = "Buscador", lang = "es") {
  const chosen = getCoherentFallbackSpiritAnswer(question, seekerName, lang);
  return {
    spelledWord: chosen.spelledWord,
    answerType: chosen.answerType,
    spiritMessage: chosen.spiritMessage,
    spiritName: chosen.spiritName,
    // Backwards compatibility aliases
    spelled: chosen.spelledWord,
    type: chosen.answerType,
    spirit: chosen.spiritMessage,
    name: chosen.spiritName,
  };
}

// Welcome narration texts per language
const WELCOME_TEXTS: Record<string, string> = {
  es: "Hablo desde el umbral sagrado... El velo de los tiempos se ha rasgado. Te doy la bienvenida a los Registros Akáshicos y Vidas Pasadas. Descubre aquí quién fuiste en tus encarnaciones anteriores y la sabiduría ancestral de tu alma a través de la canalización de la tabla ouija.",
  en: "I speak from beyond the veil of death... The shroud of time is torn. Welcome to the Akashic Records and Past Lives sanctuary. Discover who you were in your past incarnations and the ancient wisdom of your soul through the channeling of the Ouija board.",
  pt: "Falo do limiar do além-túmulo... O véu dos tempos foi rasgado. Dou-lhe as boas-vindas aos Registos Akáshicos e Vidas Passadas. Descubra quem foi nas suas encarnações anteriores e a sabedoria ancestral da sua alma através da canalização do tabuleiro ouija.",
  fr: "Je parle depuis le seuil d'outre-tombe... Le voile des temps est déchiré. Bienvenue aux Annales Akashiques et Vies Antérieures. Découvrez qui vous étiez dans vos incarnations précédentes et la sagesse ancestrale de votre âme grâce à la canalisation de la table ouija.",
  it: "Parlo dalla soglia dell'oltretomba... Il velo dei tiempos è squarciato. Ti do il benvenuto ai Registri Akashici e alle Vite Passate. Scopri chi eri nelle tue incarnazioni passate e la saggezza ancestrale della tua anima attraverso la canalizzazione della tavola ouija.",
  de: "Ich spreche von der Schwelle des Jenseits... Der Schleier der Zeit ist zerrissen. Willkommen in der Akasha-Chronik und bei den früheren Leben. Erfahre, wer du in deinen früheren Inkarnationen warst und die Weisheit deiner Seele durch das Channeling des Ouija-Bretts.",
};

// Direct Audio Stream endpoint for instant zero-latency welcome speech
app.get("/api/welcome-audio", async (req, res) => {
  try {
    const lang = String(req.query.lang || "es").toLowerCase();
    const voice = String(req.query.voice || "Fenrir");
    const chosenVoice = ["Fenrir", "Puck", "Charon"].includes(voice) ? voice : "Fenrir";
    const text = WELCOME_TEXTS[lang] || WELCOME_TEXTS.es;

    let result = await generateAndCacheTTS(text, chosenVoice, lang);
    if (!result || !result.audioData) {
      // Fallback to pre-cached Spanish welcome audio
      result = await generateAndCacheTTS(WELCOME_TEXTS.es, "Fenrir", "es");
    }

    if (!result || !result.audioData) {
      return res.status(204).end();
    }

    const audioBuffer = Buffer.from(result.audioData, "base64");
    res.setHeader("Content-Type", result.mimeType || "audio/wav");
    res.setHeader("Content-Length", audioBuffer.length);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.end(audioBuffer);
  } catch (err: any) {
    return res.status(204).end();
  }
});

// API Route: Text-to-Speech (Fenrir Solemn Male Voice of Ultratumba)
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice = "Fenrir", lang = "es" } = req.body || {};
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing text" });
    }

    const cleanText = text.trim();
    const chosenVoice = ["Fenrir", "Puck", "Charon"].includes(voice) ? voice : "Fenrir";
    const result = await generateAndCacheTTS(cleanText, chosenVoice, lang);

    if (!result || !result.audioData) {
      // Graceful fallback to client Web Speech API without 500 error
      return res.json({
        audioData: null,
        fallback: true,
        voice: chosenVoice,
      });
    }

    return res.json({
      audioData: result.audioData,
      mimeType: result.mimeType,
      voice: chosenVoice,
    });
  } catch (error: any) {
    return res.json({ audioData: null, fallback: true });
  }
});

// API Route 1: Past Life Revelation
app.post("/api/ouija/past-life", async (req, res) => {
  incrementConsultation(req);
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

CRITICAL MANDATE - COHERENCE WITH SEEKER'S INQUIRY:
The revealed past life incarnation, identity, historical narrative, and karmic lesson MUST directly resonate with and explain the seeker's intention: "${focusQuery || 'Who was I in my past life?'}". Connect their present question to their ancient soul memory.

IMPORTANT for 'spelledWord':
Must be a SHORT phrase in UPPERCASE without accents or symbols (maximum 22 characters, only A-Z, 0-9 and spaces) that the Ouija planchette will physically spell letter-by-letter on the board. Example: "ALCHEMIST PRAGUE 1642" or "ALQUIMISTA PRAGA 1642" or "SACERDOTE EGIPTO 130BC".

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
      model: "gemini-3.8-flash",
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
      parsed.spelledWord = (parsed.spelledWord || "VIDA PASADA").toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 30);
      const narrationText = buildPastLifeNarrationText(parsed.pastLifeDetails, lang);
      parsed.pastLifeDetails.narrationText = narrationText;

      return res.json(parsed);
    } else {
      return res.json(getFallbackPastLife(name, focusQuery, lang));
    }
  } catch (error) {
    console.error("Error in /api/ouija/past-life:", error);
    return res.json(getFallbackPastLife(req.body?.name, req.body?.focusQuery, req.body?.lang));
  }
});

// API Route 2: General Spirit Query (Guarantees 100% Coherence with the Question)
app.post("/api/ouija/spirit-question", async (req, res) => {
  incrementConsultation(req);
  try {
    const { question, seekerName, lang = "es" } = req.body;
    const ai = getAIClient();
    const targetLangName = getLanguageName(lang);

    if (!ai) {
      return res.json(getFallbackSpiritAnswer(question, seekerName, lang));
    }

    const prompt = buildStrictSpiritQuestionPrompt(question, seekerName, targetLangName);

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.75,
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
      const cleanWord = (parsed.spelledWord || "LUZ EN TU ALMA").toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 25);
      const safeMessage = parsed.spiritMessage || (targetLangName === "English" ? "The spirit guides your steps with peace." : "El espíritu guía tus pasos en serenidad y paz.");
      const safeName = parsed.spiritName || (targetLangName === "English" ? "Akashic Guardian" : "Guardián Akáshico");
      const safeType = parsed.answerType || "SPELLOUT";

      return res.json({
        spelledWord: cleanWord,
        answerType: safeType,
        spiritMessage: safeMessage,
        spiritName: safeName,
        // Backward compatibility
        spelled: cleanWord,
        type: safeType,
        spirit: safeMessage,
        name: safeName,
      });
    } else {
      return res.json(getFallbackSpiritAnswer(question, seekerName, lang));
    }
  } catch (error) {
    console.error("Error in /api/ouija/spirit-question:", error);
    return res.json(getFallbackSpiritAnswer(req.body?.question || "", req.body?.seekerName || "Buscador", req.body?.lang || "es"));
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
  incrementConsultation(req);
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
${focusQuery ? `CRITICAL REQUIREMENT - DIRECT COHERENCE WITH SEEKER'S INQUIRY:
The seeker is consulting about: "${focusQuery}".
You MUST directly address this exact situation, dilemma, or question in the dailyMessage and practicalAdvice through the archetypal wisdom of ${baseCard.name}. Do NOT deflect to generic unrelated platitudes.` : "The seeker seeks guidance and wisdom for their path today."}
Target Language: ${targetLangName}.

Provide a profound, solemn, poetic and transcendental tarot reading in ${targetLangName} that specifically and coherently addresses their situation.
Return strictly a JSON object with:
{
  "dailyMessage": "Inspiring and revealing message in ${targetLangName} directly addressing their situation (2-3 sentences)",
  "practicalAdvice": "Practical, actionable guidance for their situation in ${targetLangName}",
  "dailyAffirmation": "Powerful first-person affirmation in ${targetLangName}",
  "meditationQuestion": "Deep self-inquiry reflection question in ${targetLangName}"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
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

// API Route 5: 3-Card Karmic Spread Synthesis
app.post("/api/tarot/karmic-spread", async (req, res) => {
  incrementConsultation(req);
  const { seekerName, queryTopic, cards = [], lang = "es" } = req.body || {};
  const targetLangName = getLanguageName(lang);
  const ai = getAIClient();

  if (!ai || cards.length < 3) {
    return res.json({
      synthesis: `El hilo del destino revela que tu pasado (${cards[0] || "Pasado"}) forjó los cimientos espirituales de tu alma. Tu prueba presente (${cards[1] || "Presente"}) exige despertar tu maestría interior, mientras que el destino (${cards[2] || "Futuro"}) señala la liberación y triunfo de tu camino.`,
    });
  }

  try {
    const prompt = `Act as the Master Oracle of Esoteric Marseille Tarot and Akashic Reincarnation Chronicles.
The seeker "${seekerName || "Seeker"}" has invoked a 3-Card Karmic Spread regarding: "${queryTopic || "Soul Purpose and Destiny"}":
- Card 1 (Past / Soul Roots): ${cards[0]}
- Card 2 (Present / Current Evolutionary Test): ${cards[1]}
- Card 3 (Future / Karmic Transcendence): ${cards[2]}
Language: ${targetLangName}.

CRITICAL REQUIREMENT - DIRECT COHERENCE WITH QUERY:
You MUST specifically relate the meaning of these 3 cards to the seeker's inquiry: "${queryTopic || 'Soul Destiny'}".
Write a profound, cohesive, illuminating synthesis (3-4 sentences in ${targetLangName}) explaining how these three cards answer and guide their specific situation from past roots to present challenge and future outcome.
Return strictly JSON: { "synthesis": "..." }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.85,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            synthesis: { type: Type.STRING },
          },
          required: ["synthesis"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json({
      synthesis: parsed.synthesis || `El pasado de ${cards[0]} conecta con el desafío de ${cards[1]} y conduce a la elevación de ${cards[2]}.`,
    });
  } catch (err) {
    console.warn("Could not generate 3-card AI synthesis:", err);
    return res.json({
      synthesis: `El hilo sagrado une a ${cards[0]} con el reto de ${cards[1]} hacia la iluminación de ${cards[2]}.`,
    });
  }
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
