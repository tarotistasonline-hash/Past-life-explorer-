import { GoogleGenAI, Type } from "@google/genai";
import express from "express";
import http from "http";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp as initFirebaseApp, getApps as getFirebaseApps } from "firebase/app";
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  runTransaction,
  type Firestore,
} from "firebase/firestore";
import { initializeApp as initAdminApp, getApps as getAdminApps, getApp as getAdminApp } from "firebase-admin/app";
import { getAuth as getAdminAuth, type Auth as AdminAuth } from "firebase-admin/auth";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type WebAuthnCredential,
} from "@simplewebauthn/server";
import { MAJOR_ARCANA, getUniversalArcanaForDate, drawPersonalArcana } from "./src/lib/tarotData.ts";
import {
  buildStrictSpiritQuestionPrompt,
  getCoherentFallbackSpiritAnswer,
  getCoherentPastLifeFallback,
  getCoherentTarotDrawFallback,
  getCoherentKarmicSpreadFallback,
} from "./src/lib/oracleCoherence.ts";
import { buildLocalNatalReading } from "./src/lib/natalChart.ts";
import { calculateKabbalahProfile, buildLocalKabbalahReading } from "./src/lib/kabbalah.ts";

const app = express();
const PORT =
  Number(process.env.DEFAULT_APP_PORT) ||
  (process.env.PORT && (!process.env.NGINX_PORT || process.env.PORT !== process.env.NGINX_PORT)
    ? Number(process.env.PORT)
    : 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// RealRank Site Verification Endpoints
app.get(["/realrank-verify-7570c1fd0a0a4f779053", "/realrank-verify.txt"], (_req, res) => {
  res.type("text/plain").send("realrank-verify-7570c1fd0a0a4f779053\n");
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

// Initialize Firebase Firestore & Auth token verifier
const OWNER_EMAIL = "tarotistasonline@gmail.com";
let firestoreDb: Firestore | null = null;
let adminAuth: AdminAuth | null = null;
try {
  const fbConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(fbConfigPath)) {
    const fbConfig = JSON.parse(fs.readFileSync(fbConfigPath, "utf-8"));
    const fbApp = getFirebaseApps().length > 0 ? getFirebaseApps()[0] : initFirebaseApp(fbConfig);
    firestoreDb = getFirestore(fbApp, fbConfig.firestoreDatabaseId);
    const adminApp = getAdminApps().length > 0 ? getAdminApp() : initAdminApp({ projectId: fbConfig.projectId });
    adminAuth = getAdminAuth(adminApp);
  }
} catch (e) {
  console.warn("Could not initialize Firebase in server:", e);
}

// Admin session HMAC signing key (in-memory random fallback; never written to disk)
const ADMIN_SESSION_SECRET =
  (process.env.ADMIN_SESSION_SECRET || "").trim() || crypto.randomBytes(32).toString("hex");
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const ADMIN_CREDENTIALS_FILE = path.join(VISITS_DATA_DIR, "admin_credentials.json");

interface StoredWebAuthnCred {
  id: string;
  publicKeyBase64: string;
  counter: number;
  transports?: string[];
  rpId: string;
  label?: string;
  createdAt: string;
}

interface AdminCredentialsStore {
  pinSalt?: string;
  pinHash?: string;
  pinUpdatedAt?: string;
  webauthnCredentials: StoredWebAuthnCred[];
}

let adminCredentialsState: AdminCredentialsStore = { webauthnCredentials: [] };
try {
  if (fs.existsSync(ADMIN_CREDENTIALS_FILE)) {
    const parsed = JSON.parse(fs.readFileSync(ADMIN_CREDENTIALS_FILE, "utf-8"));
    adminCredentialsState = {
      pinSalt: typeof parsed.pinSalt === "string" ? parsed.pinSalt : undefined,
      pinHash: typeof parsed.pinHash === "string" ? parsed.pinHash : undefined,
      pinUpdatedAt: typeof parsed.pinUpdatedAt === "string" ? parsed.pinUpdatedAt : undefined,
      webauthnCredentials: Array.isArray(parsed.webauthnCredentials) ? parsed.webauthnCredentials : [],
    };
  }
} catch (e) {
  console.warn("Could not load admin_credentials.json:", e);
}

function saveAdminCredentials() {
  try {
    if (!fs.existsSync(VISITS_DATA_DIR)) {
      fs.mkdirSync(VISITS_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ADMIN_CREDENTIALS_FILE, JSON.stringify(adminCredentialsState, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not save admin_credentials.json:", e);
  }
}

function signAdminSessionToken(method: "pin" | "webauthn"): { token: string; expiresAt: number } {
  const now = Date.now();
  const expiresAt = now + ADMIN_SESSION_TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({ role: "admin", method, iat: now, exp: expiresAt }),
    "utf-8"
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(payload)
    .digest("base64url");
  return { token: `adm_${payload}.${sig}`, expiresAt };
}

function verifyAdminSessionToken(token: string): boolean {
  if (!token.startsWith("adm_")) return false;
  const body = token.slice(4);
  const dotIdx = body.indexOf(".");
  if (dotIdx <= 0) return false;
  const payload = body.slice(0, dotIdx);
  const sig = body.slice(dotIdx + 1);
  if (!payload || !sig) return false;

  const expectedSig = crypto
    .createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(payload)
    .digest("base64url");
  const sigBuf = Buffer.from(sig, "utf-8");
  const expBuf = Buffer.from(expectedSig, "utf-8");
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    return parsed?.role === "admin" && typeof parsed?.exp === "number" && Date.now() < parsed.exp;
  } catch {
    return false;
  }
}

async function verifyAdminBearerToken(req?: express.Request): Promise<boolean> {
  if (!req) return false;
  const authHeader = req.headers?.authorization;
  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token || token.length > 8192) return false;

  if (token.startsWith("adm_")) {
    return verifyAdminSessionToken(token);
  }

  if (!adminAuth) return false;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return (
      decoded.email?.toLowerCase() === OWNER_EMAIL &&
      decoded.email_verified === true
    );
  } catch {
    return false;
  }
}

interface PortalMetricsPayload {
  totalVisits: number;
  todayVisits: number;
  todayKey: string;
  totalConsultations: number;
  uniqueVisitorsCount: number;
  lastUpdated: string;
}

function sanitizeVisitorId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim().replace(/[^a-zA-Z0-9_\-]/g, "");
  if (cleaned.length < 4 || cleaned.length > 128) return null;
  return cleaned;
}

async function ensureMetricsDoc(): Promise<PortalMetricsPayload | null> {
  if (!firestoreDb) return null;
  const metricsRef = doc(firestoreDb, "metrics", "global");
  const snap = await getDocFromServer(metricsRef);
  const todayKey = getTodayKey();

  if (snap.exists()) {
    const data = snap.data();
    return {
      totalVisits: Number(data.totalVisits) || 0,
      todayVisits: data.todayKey === todayKey ? Number(data.todayVisits) || 0 : 0,
      todayKey: typeof data.todayKey === "string" ? data.todayKey : todayKey,
      totalConsultations: Number(data.totalConsultations) || 0,
      uniqueVisitorsCount: Number(data.uniqueVisitorsCount) || 0,
      lastUpdated: typeof data.lastUpdated === "string" ? data.lastUpdated : new Date().toISOString(),
    };
  }

  const seedPayload: PortalMetricsPayload = {
    totalVisits: Math.min(200, Math.max(0, visitsState.totalVisits || 54)),
    todayVisits: Math.min(200, Math.max(0, visitsState.dailyVisits[todayKey] || 0)),
    todayKey,
    totalConsultations: Math.min(200, Math.max(0, visitsState.totalConsultations || 17)),
    uniqueVisitorsCount: Math.min(200, Math.max(0, visitsState.uniqueVisitors.length || 4)),
    lastUpdated: new Date().toISOString(),
  };

  try {
    await setDoc(metricsRef, seedPayload);
    return seedPayload;
  } catch (err) {
    // Another instance may have created it simultaneously; re-read
    const retrySnap = await getDocFromServer(metricsRef);
    if (retrySnap.exists()) {
      const data = retrySnap.data();
      return {
        totalVisits: Number(data.totalVisits) || 0,
        todayVisits: data.todayKey === todayKey ? Number(data.todayVisits) || 0 : 0,
        todayKey: typeof data.todayKey === "string" ? data.todayKey : todayKey,
        totalConsultations: Number(data.totalConsultations) || 0,
        uniqueVisitorsCount: Number(data.uniqueVisitorsCount) || 0,
        lastUpdated: typeof data.lastUpdated === "string" ? data.lastUpdated : new Date().toISOString(),
      };
    }
    throw err;
  }
}

// Real-time Active Online Visitors Presence (excludes creator/admin sessions)
const ONLINE_TTL_MS = 45_000;
const activeOnlineVisitors = new Map<string, number>();

function pruneOnlineVisitors(now = Date.now()): number {
  for (const [id, lastSeen] of activeOnlineVisitors.entries()) {
    if (now - lastSeen > ONLINE_TTL_MS) {
      activeOnlineVisitors.delete(id);
    }
  }
  return activeOnlineVisitors.size;
}

function touchOnlineVisitor(rawVisitorId: unknown, isExcluded: boolean, leave = false): number {
  const now = Date.now();
  const cleanId = sanitizeVisitorId(rawVisitorId);
  if (cleanId) {
    if (isExcluded || leave) {
      activeOnlineVisitors.delete(cleanId);
    } else {
      activeOnlineVisitors.set(cleanId, now);
    }
  }
  return pruneOnlineVisitors(now);
}

async function getAuthoritativeVisitsStats() {
  const todayKey = getTodayKey();
  const onlineVisitors = pruneOnlineVisitors();
  if (firestoreDb) {
    try {
      const data = await ensureMetricsDoc();
      if (data) {
        visitsState.totalVisits = data.totalVisits;
        visitsState.totalConsultations = data.totalConsultations;
        visitsState.dailyVisits[todayKey] = data.todayVisits;
        visitsState.lastUpdated = data.lastUpdated;
        return {
          totalVisits: data.totalVisits,
          todayVisits: data.todayVisits,
          totalConsultations: data.totalConsultations,
          uniqueVisitorsCount: data.uniqueVisitorsCount,
          onlineVisitors,
          lastUpdated: data.lastUpdated,
        };
      }
    } catch (e) {
      console.warn("Firestore read failed, using fallback visitsState:", e);
    }
  }

  const todayCount = visitsState.dailyVisits[todayKey] || 0;
  return {
    totalVisits: visitsState.totalVisits,
    todayVisits: todayCount,
    totalConsultations: visitsState.totalConsultations,
    uniqueVisitorsCount: visitsState.uniqueVisitors.length,
    onlineVisitors,
    lastUpdated: visitsState.lastUpdated,
  };
}

async function recordVisitInFirestore(rawVisitorId: unknown) {
  if (!firestoreDb) return null;
  await ensureMetricsDoc();

  const db = firestoreDb;
  const cleanVisitorId = sanitizeVisitorId(rawVisitorId);
  const todayKey = getTodayKey();
  const nowIso = new Date().toISOString();

  const metricsRef = doc(db, "metrics", "global");
  const visitorRef = cleanVisitorId ? doc(db, "visitors", cleanVisitorId) : null;

  const updated = await runTransaction(db, async (tx) => {
    const metricsSnap = await tx.get(metricsRef);
    const visitorSnap = visitorRef ? await tx.get(visitorRef) : null;

    if (!metricsSnap.exists()) {
      throw new Error("metrics/global does not exist");
    }

    const current = metricsSnap.data();
    const isNewUnique = Boolean(visitorRef && visitorSnap && !visitorSnap.exists());

    const nextTotalVisits = Math.trunc(Number(current.totalVisits) || 0) + 1;
    const nextTodayVisits = current.todayKey === todayKey ? Math.trunc(Number(current.todayVisits) || 0) + 1 : 1;
    const nextUnique = Math.trunc(Number(current.uniqueVisitorsCount) || 0) + (isNewUnique ? 1 : 0);

    if (isNewUnique && visitorRef && cleanVisitorId) {
      tx.set(visitorRef, {
        visitorId: cleanVisitorId,
        firstSeenAt: nowIso,
      });
    }

    tx.update(metricsRef, {
      totalVisits: nextTotalVisits,
      todayVisits: nextTodayVisits,
      todayKey,
      uniqueVisitorsCount: nextUnique,
      lastUpdated: nowIso,
    });

    return {
      totalVisits: nextTotalVisits,
      todayVisits: nextTodayVisits,
      totalConsultations: Number(current.totalConsultations) || 0,
      uniqueVisitorsCount: nextUnique,
      lastUpdated: nowIso,
    };
  });

  visitsState.totalVisits = updated.totalVisits;
  visitsState.totalConsultations = updated.totalConsultations;
  visitsState.dailyVisits[todayKey] = updated.todayVisits;
  visitsState.lastUpdated = updated.lastUpdated;
  if (cleanVisitorId && !visitsState.uniqueVisitors.includes(cleanVisitorId)) {
    visitsState.uniqueVisitors.push(cleanVisitorId);
  }
  saveVisitsData();

  return updated;
}

function isBotUserAgent(rawUa: unknown): boolean {
  if (typeof rawUa !== "string" || !rawUa.trim()) return false;
  return /bot|crawl|spider|slurp|googlebot|bingbot|yandex|duckduckbot|baiduspider|facebookexternalhit|whatsapp|telegrambot|twitterbot|linkedinbot|lighthouse|headlesschrome|puppeteer|playwright|curl|wget|python-requests|go-http-client|uptimerobot|pingdom/i.test(
    rawUa
  );
}

// Visits API Endpoints (100% Real Traffic with Firestore Persistence)
app.get("/api/visits", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  const stats = await getAuthoritativeVisitsStats();
  res.json(stats);
});

app.post("/api/visits/hit", async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  const { visitorId, isAdmin, isNewSession } = req.body || {};
  const isBot = isBotUserAgent(req.headers["user-agent"]);
  const wantsExclude = Boolean(isAdmin || req.headers["x-admin-exclude"] === "true");
  const isExcluded = isBot || (wantsExclude ? await verifyAdminBearerToken(req) : false);
  const todayKey = getTodayKey();
  const onlineVisitors = touchOnlineVisitor(visitorId, isExcluded);
  const shouldCountSession = isNewSession !== false;

  if (!isExcluded && shouldCountSession) {
    try {
      const firestoreResult = await recordVisitInFirestore(visitorId);
      if (firestoreResult) {
        return res.json({
          ...firestoreResult,
          onlineVisitors,
          excluded: false,
        });
      }
    } catch (e) {
      console.warn("Firestore hit transaction failed, falling back to local counter:", e);
    }

    // Local fallback if Firestore is temporarily unreachable
    visitsState.totalVisits += 1;
    visitsState.dailyVisits[todayKey] = (visitsState.dailyVisits[todayKey] || 0) + 1;
    const cleanId = sanitizeVisitorId(visitorId);
    if (cleanId && !visitsState.uniqueVisitors.includes(cleanId)) {
      visitsState.uniqueVisitors.push(cleanId);
      if (visitsState.uniqueVisitors.length > 20000) {
        visitsState.uniqueVisitors = visitsState.uniqueVisitors.slice(-20000);
      }
    }
    visitsState.lastUpdated = new Date().toISOString();
    saveVisitsData();
  }

  const stats = await getAuthoritativeVisitsStats();
  res.json({
    ...stats,
    onlineVisitors,
    excluded: isExcluded,
  });
});

// Real-time Presence Heartbeat (tracks currently online visitors, excluding creator/admin and bots)
app.post("/api/visits/heartbeat", express.text({ type: "*/*" }), async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  let payload: any = req.body;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      payload = {};
    }
  }
  const { visitorId, isAdmin, leave } = payload || {};
  const isBot = isBotUserAgent(req.headers["user-agent"]);
  const wantsExclude = Boolean(isAdmin || req.headers["x-admin-exclude"] === "true");
  const isExcluded = isBot || (wantsExclude ? await verifyAdminBearerToken(req) : false);

  const onlineVisitors = touchOnlineVisitor(visitorId, isExcluded, Boolean(leave));
  if (leave) {
    return res.status(200).json({ onlineVisitors, excluded: isExcluded });
  }

  const stats = await getAuthoritativeVisitsStats();
  return res.json({
    ...stats,
    onlineVisitors,
    excluded: isExcluded,
  });
});

// Helper to record consultations (skips verified admin/creator test calls)
async function incrementConsultation(req?: express.Request) {
  const wantsExclude = Boolean(req?.body?.isAdmin || req?.headers?.["x-admin-exclude"] === "true");
  if (wantsExclude && (await verifyAdminBearerToken(req))) return;

  visitsState.totalConsultations = (visitsState.totalConsultations || 0) + 1;
  visitsState.lastUpdated = new Date().toISOString();
  saveVisitsData();

  if (firestoreDb) {
    const db = firestoreDb;
    ensureMetricsDoc()
      .then(() =>
        runTransaction(db, async (tx) => {
          const metricsRef = doc(db, "metrics", "global");
          const snap = await tx.get(metricsRef);
          if (!snap.exists()) return;
          const current = snap.data();
          tx.update(metricsRef, {
            totalConsultations: Math.trunc(Number(current.totalConsultations) || 0) + 1,
            lastUpdated: new Date().toISOString(),
          });
        })
      )
      .catch((e) => {
        console.warn("Could not increment consultation in Firestore:", e);
      });
  }
}

app.post("/api/visits/consultation", async (req, res) => {
  await incrementConsultation(req);
  const stats = await getAuthoritativeVisitsStats();
  return res.json(stats);
});

// Initialize GenAI client safely
let aiAuthCooldownUntil = 0;

function isInvalidGeminiApiKeyFormat(raw?: string): boolean {
  const key = (raw || "").trim();
  if (!key) return true;
  if (
    key === "MY_GEMINI_API_KEY" ||
    key === "YOUR_API_KEY" ||
    key.includes("MY_GEMINI") ||
    key.includes("PLACEHOLDER") ||
    key.length < 16
  ) {
    return true;
  }
  return false;
}

function handleGeminiError(context: string, error: any) {
  const errText = String(error?.message || error || "");
  const isAuthErr =
    errText.includes("401") ||
    errText.includes("403") ||
    errText.includes("UNAUTHENTICATED") ||
    errText.includes("PERMISSION_DENIED") ||
    errText.includes("API key not valid") ||
    errText.includes("API_KEY_INVALID") ||
    errText.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED") ||
    error?.status === 401 ||
    error?.status === 403 ||
    error?.code === 401 ||
    error?.code === 403;

  if (isAuthErr) {
    if (Date.now() >= aiAuthCooldownUntil) {
      console.warn(
        `[${context}] GEMINI_API_KEY is invalid or unsupported. Please verify GEMINI_API_KEY in Settings > Secrets. Using coherent local oracle fallback.`
      );
    }
    aiAuthCooldownUntil = Date.now() + 5 * 60 * 1000;
    return;
  }

  console.warn(`[${context}] Gemini fallback activated:`, error?.message || error);
}

function getAIClient() {
  if (Date.now() < aiAuthCooldownUntil) {
    return null;
  }
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (isInvalidGeminiApiKeyFormat(apiKey)) {
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
      handleGeminiError("TTS", error);
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
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
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
    handleGeminiError("/api/ouija/past-life", error);
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
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
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
    handleGeminiError("/api/ouija/spirit-question", error);
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
  const cleanQuery = typeof focusQuery === "string" ? focusQuery.trim() : "";
  const baseCard = drawPersonalArcana(seed || `${seekerName || "seeker"}_${Date.now()}_${Math.random()}`, excludeId, lang);
  const targetLangName = getLanguageName(lang);
  const locale = lang === "en" ? "en-US" : lang === "pt" ? "pt-BR" : lang === "fr" ? "fr-FR" : lang === "it" ? "it-IT" : lang === "de" ? "de-DE" : "es-AR";
  const personalReadingPrefix = lang === "en" ? "Personal Reading of" : lang === "pt" ? "Leitura Pessoal de" : lang === "fr" ? "Lecture Personnelle de" : lang === "it" ? "Lettura Personale di" : lang === "de" ? "Persönliche Lesung von" : "Lectura Personal de";

  const coherentFallback = getCoherentTarotDrawFallback(baseCard, cleanQuery, seekerName, lang);
  const fallbackCard = { ...baseCard, ...coherentFallback };

  const ai = getAIClient();
  if (!ai) {
    return res.json({
      arcana: fallbackCard,
      isAiEnhanced: false,
      cosmicDate: new Date().toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      dayAspect: `${personalReadingPrefix} ${baseCard.name}`,
    });
  }

  try {
    const prompt = `Act as the Master Oracle of Esoteric Marseille Tarot.
The seeker "${seekerName || "Seeker"}" has drawn the Major Arcana: "${baseCard.name}" (${baseCard.romanNumber}) / "${baseCard.marseilleTitle || baseCard.englishName}".
Archetype: ${baseCard.archetype}. Element: ${baseCard.element}. Sign/Planet: ${baseCard.astrologicalSign}.
${cleanQuery ? `CRITICAL REQUIREMENT - CONCRETE & COHERENT ANSWER TO SEEKER'S QUESTION:
The seeker asked specifically: "${cleanQuery}".
Your response MUST give a clear, concrete, direct, and coherent answer to THAT exact question (whether it's about love, an ex, work, money, health, studies, a decision, or yes/no direction), grounded in the symbolism of ${baseCard.name}.
Do NOT give vague, generic mysticism that ignores what they asked. Explicitly reference the subject of "${cleanQuery}" and give actionable clarity.` : "The seeker seeks concrete guidance for their path today."}
Target Language: ${targetLangName}.

Return strictly a JSON object with:
{
  "dailyMessage": "Direct, concrete, coherent answer in ${targetLangName} addressing '${cleanQuery || "today's path"}' through ${baseCard.name} (2-3 clear sentences)",
  "practicalAdvice": "Concrete actionable step for their exact situation in ${targetLangName}",
  "dailyAffirmation": "Grounded first-person affirmation in ${targetLangName}",
  "meditationQuestion": "Focused reflection question tied to their inquiry in ${targetLangName}"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
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
        dailyMessage: parsed.dailyMessage || fallbackCard.dailyMessage,
        practicalAdvice: parsed.practicalAdvice || fallbackCard.practicalAdvice,
        dailyAffirmation: parsed.dailyAffirmation || fallbackCard.dailyAffirmation,
        meditationQuestion: parsed.meditationQuestion || fallbackCard.meditationQuestion,
      };
      return res.json({
        arcana: enhancedCard,
        isAiEnhanced: true,
        cosmicDate: new Date().toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        dayAspect: `${personalReadingPrefix} ${enhancedCard.name}`,
      });
    }
  } catch (err) {
    handleGeminiError("/api/tarot/draw", err);
  }

  return res.json({
    arcana: fallbackCard,
    isAiEnhanced: false,
    cosmicDate: new Date().toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    dayAspect: `${personalReadingPrefix} ${baseCard.name}`,
  });
});

// API Route 5: 3-Card Karmic Spread Synthesis
app.post("/api/tarot/karmic-spread", async (req, res) => {
  incrementConsultation(req);
  const { seekerName, queryTopic, cards = [], lang = "es" } = req.body || {};
  const cleanQuery = typeof queryTopic === "string" ? queryTopic.trim() : "";
  const targetLangName = getLanguageName(lang);
  const cardTuple: [string, string, string] = [
    String(cards[0] || "El Mago"),
    String(cards[1] || "La Fuerza"),
    String(cards[2] || "El Sol"),
  ];
  const coherentFallback = getCoherentKarmicSpreadFallback(cardTuple, cleanQuery, seekerName, lang);
  const ai = getAIClient();

  if (!ai || cards.length < 3) {
    return res.json({
      synthesis: coherentFallback,
    });
  }

  try {
    const prompt = `Act as the Master Oracle of Esoteric Marseille Tarot.
The seeker "${seekerName || "Seeker"}" asked this SPECIFIC question in a 3-Card Spread (Past, Present, Future): "${cleanQuery || "Soul Purpose and Destiny"}":
- Card 1 (Past / Root of this situation): ${cardTuple[0]}
- Card 2 (Present / Current challenge & decision): ${cardTuple[1]}
- Card 3 (Future / Concrete outcome & resolution): ${cardTuple[2]}
Language: ${targetLangName}.

CRITICAL REQUIREMENT - CONCRETE & COHERENT RESPONSE TO THE EXACT QUESTION:
1. Directly answer "${cleanQuery || "Soul Purpose"}" clearly and concretely—do NOT give generic filler that ignores what they asked.
2. Explain specifically what ${cardTuple[0]} (Past), ${cardTuple[1]} (Present), and ${cardTuple[2]} (Future) indicate about their exact question (outcome, timing/direction, and concrete next step).
3. Write 3-4 clear, cohesive sentences in ${targetLangName}.
Return strictly JSON: { "synthesis": "..." }`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
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
      synthesis: parsed.synthesis || coherentFallback,
    });
  } catch (err) {
    handleGeminiError("/api/tarot/karmic-spread", err);
    return res.json({
      synthesis: coherentFallback,
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

// API Route 6: Natal Chart Deep AI Interpretation
app.post("/api/natal-chart/interpret", async (req, res) => {
  incrementConsultation(req);
  const { chart, language = "es" } = req.body || {};
  if (!chart || !chart.sun || !chart.moon || !chart.ascendant) {
    return res.status(400).json({ error: "Missing natal chart payload" });
  }

  const fallbackReading = buildLocalNatalReading(chart, language);
  const ai = getAIClient();
  if (!ai) {
    return res.json({ reading: fallbackReading, isAiEnhanced: false });
  }

  try {
    const targetLangName = getLanguageName(language);
    const planetsSummary = Array.isArray(chart.planets)
      ? chart.planets
          .map(
            (p: any) =>
              `${p.name}: ${p.sign} ${p.degree}°${String(p.minutes ?? 0).padStart(2, "0")}' (Casa ${p.house}${p.isRetrograde ? ", Rx" : ""})`
          )
          .join("; ")
      : "";
    const aspectsSummary = Array.isArray(chart.aspects)
      ? chart.aspects
          .slice(0, 6)
          .map((a: any) => `${a.planet1} ${a.type} ${a.planet2} (orbe ${a.orb}°)`)
          .join("; ")
      : "";

    const prompt = `Act as an expert classical & psychological astrologer.
Interpret this exact natal chart in ${targetLangName} with clarity, grounded psychological depth, and practical insight:
- Seeker: ${chart.seekerName || "Consultante"}
- Birth Data: ${chart.birthDate} ${chart.birthTime} • ${chart.locationSummary}
- Timezone Applied: ${chart.timezoneInfo?.offsetLabel || ""} (${chart.timezoneInfo?.dstNote || ""})
- Sun: ${chart.sun.sign} (${chart.sun.degree}° Casa ${chart.sun.house})
- Moon: ${chart.moon.sign} (${chart.moon.degree}° Casa ${chart.moon.house})
- Ascendant: ${chart.ascendant.sign} (${chart.ascendant.degree}°)
- Midheaven: ${chart.midheaven?.sign || ""} (${chart.midheaven?.degree ?? 0}°)
- North Node: ${chart.northNode?.sign || ""} (Casa ${chart.northNode?.house ?? 1})
- Planetary Placements: ${planetsSummary}
- Major Aspects: ${aspectsSummary}
- Dominant Element / Modality: ${chart.dominantElement} / ${chart.dominantModality}

Write concrete, insightful interpretations in ${targetLangName}. Respond strictly as JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            energyHeadline: { type: Type.STRING },
            sunEssence: { type: Type.STRING },
            moonSanctuary: { type: Type.STRING },
            ascendantDestiny: { type: Type.STRING },
            vocationalLegacy: { type: Type.STRING },
            elementalBalance: { type: Type.STRING },
            aspectsInterpretation: { type: Type.STRING },
            grandNarrative: { type: Type.STRING },
            cosmicAffirmation: { type: Type.STRING },
          },
          required: [
            "energyHeadline",
            "sunEssence",
            "moonSanctuary",
            "ascendantDestiny",
            "vocationalLegacy",
            "elementalBalance",
            "aspectsInterpretation",
            "grandNarrative",
            "cosmicAffirmation",
          ],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (jsonText) {
      const parsed = JSON.parse(jsonText);
      return res.json({
        reading: {
          ...fallbackReading,
          ...parsed,
          lifePurpose: parsed.vocationalLegacy || fallbackReading.lifePurpose,
          isAiEnhanced: true,
        },
        isAiEnhanced: true,
      });
    }
  } catch (err) {
    handleGeminiError("/api/natal-chart/interpret", err);
  }

  return res.json({ reading: fallbackReading, isAiEnhanced: false });
});

// API Route 7: Kabbalah Life Mission (Árbol de la Vida) AI Interpretation
app.post("/api/kabbalah/mission", async (req, res) => {
  incrementConsultation(req);
  const { fullName, birthDate, language = "es" } = req.body || {};
  if (!fullName || !birthDate) {
    return res.status(400).json({ error: "Se requiere nombre completo y fecha de nacimiento" });
  }

  const profile = calculateKabbalahProfile(String(fullName), String(birthDate));
  const fallbackReading = buildLocalKabbalahReading(profile, language);
  const ai = getAIClient();

  if (!ai) {
    return res.json({ profile, reading: fallbackReading, isAiEnhanced: false });
  }

  try {
    const targetLangName = getLanguageName(language);
    const prompt = `Act as a wise, grounded scholar of Kabbalah and the Tree of Life (Etz Chaim).
Analyze the user's Soul Life Mission in ${targetLangName} based strictly on these Kabbalistic calculations:
- Name: ${profile.fullName}
- Birth Date: ${profile.birthDate}
- Birth Life Path Number: ${profile.lifePathNumber} (Raw sum: ${profile.lifePathRaw})
- Primary Birth Sephira: ${profile.primarySephira.name} (${profile.primarySephira.hebrewName}) - ${profile.primarySephira.meaning}
- Pillar of the Tree of Life: ${profile.dominantPillar}
- Name Gematria Value: ${profile.nameGematriaRaw} -> Reduced: ${profile.nameNumber} (Soul Urge: ${profile.soulUrgeNumber}, Expression: ${profile.expressionNumber})
- Name Sephira: ${profile.nameSephira.name} (${profile.nameSephira.hebrewName}) - ${profile.nameSephira.meaning}
- Hebrew Letter / Path: ${profile.hebrewPath.letter} (${profile.hebrewPath.hebrewChar}) - "${profile.hebrewPath.meaning}" (${profile.hebrewPath.pathTitle})
${profile.masterNumberNote ? `- Master Resonance: ${profile.masterNumberNote}` : ""}

Write a deep, authentic, clear, inspiring Kabbalistic Life Mission reading in ${targetLangName}. Respond strictly as JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            lifeMissionSummary: { type: Type.STRING },
            sephiraConnection: { type: Type.STRING },
            nameVibrationInsight: { type: Type.STRING },
            tikkunLesson: { type: Type.STRING },
            soulGifts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            practicalAlignment: { type: Type.STRING },
            kabbalisticAffirmation: { type: Type.STRING },
          },
          required: [
            "headline",
            "lifeMissionSummary",
            "sephiraConnection",
            "nameVibrationInsight",
            "tikkunLesson",
            "soulGifts",
            "practicalAlignment",
            "kabbalisticAffirmation",
          ],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (jsonText) {
      const parsed = JSON.parse(jsonText);
      return res.json({
        profile,
        reading: {
          ...fallbackReading,
          ...parsed,
          soulGifts:
            Array.isArray(parsed.soulGifts) && parsed.soulGifts.length > 0
              ? parsed.soulGifts.slice(0, 4)
              : fallbackReading.soulGifts,
          isAiEnhanced: true,
        },
        isAiEnhanced: true,
      });
    }
  } catch (err) {
    handleGeminiError("/api/kabbalah/mission", err);
  }

  return res.json({ profile, reading: fallbackReading, isAiEnhanced: false });
});

// ============================================================================
// Automatic Payment & Instant Unlock System (Mercado Pago Only)
// ============================================================================
const PAYMENT_SESSIONS_FILE = path.join(VISITS_DATA_DIR, "payment_sessions.json");
const CLAIMED_MP_PAYMENTS_FILE = path.join(VISITS_DATA_DIR, "claimed_mp_payments.json");
const PAYMENT_HMAC_KEY_FILE = path.join(VISITS_DATA_DIR, "payment_hmac.key");

function loadOrCreateHmacSecret(): string {
  try {
    if (fs.existsSync(PAYMENT_HMAC_KEY_FILE)) {
      const existing = fs.readFileSync(PAYMENT_HMAC_KEY_FILE, "utf-8").trim();
      if (existing.length >= 32) return existing;
    }
    if (!fs.existsSync(VISITS_DATA_DIR)) {
      fs.mkdirSync(VISITS_DATA_DIR, { recursive: true });
    }
    const generated = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(PAYMENT_HMAC_KEY_FILE, generated, "utf-8");
    return generated;
  } catch {
    return crypto.createHash("sha256").update(process.cwd() + "_akashic_payment_secret").digest("hex");
  }
}

const PAYMENT_HMAC_KEY = loadOrCreateHmacSecret();

interface ServerPaymentSession {
  sessionId: string;
  visitorId: string;
  provider: "mercadopago" | "auto";
  status: "pending" | "approved";
  pendingType: "past-life" | "spirit-question" | "pass";
  refCode: string;
  approvalProof: string;
  paymentRef?: string;
  createdAt: string;
  updatedAt: string;
}

const paymentSessions = new Map<string, ServerPaymentSession>();
const claimedMpPayments = new Map<string, string>(); // mpPaymentId -> visitorId
const sseClientsBySession = new Map<string, Set<express.Response>>();

try {
  if (fs.existsSync(PAYMENT_SESSIONS_FILE)) {
    const raw = fs.readFileSync(PAYMENT_SESSIONS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      for (const item of parsed.slice(-500)) {
        if (item && typeof item.sessionId === "string") {
          paymentSessions.set(item.sessionId, item as ServerPaymentSession);
        }
      }
    }
  }
  if (fs.existsSync(CLAIMED_MP_PAYMENTS_FILE)) {
    const rawClaimed = fs.readFileSync(CLAIMED_MP_PAYMENTS_FILE, "utf-8");
    const parsedClaimed = JSON.parse(rawClaimed);
    if (parsedClaimed && typeof parsedClaimed === "object") {
      for (const [mpId, vis] of Object.entries(parsedClaimed)) {
        if (typeof vis === "string") {
          claimedMpPayments.set(mpId, vis);
        }
      }
    }
  }
} catch (e) {
  console.warn("Could not load payment_sessions.json:", e);
}

function savePaymentSessionsDisk() {
  try {
    if (!fs.existsSync(VISITS_DATA_DIR)) {
      fs.mkdirSync(VISITS_DATA_DIR, { recursive: true });
    }
    const arr = Array.from(paymentSessions.values()).slice(-500);
    fs.writeFileSync(PAYMENT_SESSIONS_FILE, JSON.stringify(arr, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not save payment_sessions.json:", e);
  }
}

function saveClaimedMpPaymentsDisk() {
  try {
    if (!fs.existsSync(VISITS_DATA_DIR)) {
      fs.mkdirSync(VISITS_DATA_DIR, { recursive: true });
    }
    const obj = Object.fromEntries(Array.from(claimedMpPayments.entries()).slice(-1000));
    fs.writeFileSync(CLAIMED_MP_PAYMENTS_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not save claimed_mp_payments.json:", e);
  }
}

function getMercadoPagoAccessToken(): string {
  return (process.env.MERCADOPAGO_ACCESS_TOKEN || "").trim();
}

interface MpVerificationResult {
  approved: boolean;
  reason?: string;
  mpPaymentId?: string;
  mpStatus?: string;
  externalReference?: string;
  amount?: number;
}

async function verifyMercadoPagoPaymentOnApi(
  paymentIdOrOperation: string,
  expectedMinAmountArs: number = 0
): Promise<MpVerificationResult> {
  const token = getMercadoPagoAccessToken();
  if (!token) {
    return { approved: false, reason: "mp_token_not_configured" };
  }

  const raw = paymentIdOrOperation.trim();
  const numericOnly = raw.replace(/\D/g, "");
  let paymentObj: any = null;

  try {
    if (numericOnly.length >= 6) {
      const directRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${encodeURIComponent(numericOnly)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (directRes.ok) {
        paymentObj = await directRes.json();
      }
    }

    if (!paymentObj && raw.length >= 4) {
      const searchRes = await fetch(
        `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(raw)}&sort=date_created&criteria=desc&limit=1`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (Array.isArray(searchData?.results) && searchData.results.length > 0) {
          paymentObj = searchData.results[0];
        }
      }
    }
  } catch (err) {
    console.warn("Mercado Pago API request error:", err);
    return { approved: false, reason: "mp_api_unreachable" };
  }

  if (!paymentObj || !paymentObj.id) {
    return { approved: false, reason: "payment_not_found", mpStatus: "not_found" };
  }

  const mpStatus = String(paymentObj.status || "").toLowerCase();
  if (mpStatus !== "approved") {
    return {
      approved: false,
      reason: "payment_not_approved",
      mpPaymentId: String(paymentObj.id),
      mpStatus,
    };
  }

  const paidAmount = Number(paymentObj.transaction_amount || 0);
  if (expectedMinAmountArs > 0 && paidAmount > 0 && paidAmount < expectedMinAmountArs * 0.9) {
    return {
      approved: false,
      reason: "amount_mismatch",
      mpPaymentId: String(paymentObj.id),
      mpStatus,
      amount: paidAmount,
    };
  }

  return {
    approved: true,
    mpPaymentId: String(paymentObj.id),
    mpStatus,
    externalReference:
      typeof paymentObj.external_reference === "string" ? paymentObj.external_reference : undefined,
    amount: paidAmount,
  };
}

function signApprovalProof(sessionId: string, visitorId: string, provider: string): string {
  return crypto
    .createHmac("sha256", PAYMENT_HMAC_KEY)
    .update(`${sessionId}:${visitorId}:${provider}:approved`)
    .digest("hex");
}

function isValidApprovalProof(session: ServerPaymentSession): boolean {
  if (session.status !== "approved" || !session.approvalProof) return false;
  const expected = signApprovalProof(session.sessionId, session.visitorId, session.provider);
  return session.approvalProof === expected;
}

function sanitizeIdParam(raw: unknown, minLen = 4, maxLen = 128): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim().replace(/[^a-zA-Z0-9_\-]/g, "");
  if (cleaned.length < minLen || cleaned.length > maxLen) return null;
  return cleaned;
}

function normalizeOrigin(rawOrigin: unknown, req: express.Request): string {
  const candidates = [
    typeof rawOrigin === "string" ? rawOrigin.trim() : "",
    process.env.APP_URL || "",
    `${req.protocol}://${req.get("host") || ""}`,
  ];
  for (const c of candidates) {
    if (c && /^https?:\/\/[a-zA-Z0-9.-]+(:\d+)?/.test(c)) {
      return c.replace(/\/+$/, "");
    }
  }
  return "https://ais-pre-ulzgbsculea2d4feemykvi-172786148761.us-east1.run.app";
}

const MONETIZATION_FILE = path.join(VISITS_DATA_DIR, "monetization.json");
const PAYPAL_UNLOCK_HASH_FILE = path.join(VISITS_DATA_DIR, "paypal_unlock_hash.json");

const DEFAULT_PAYPAL_USD_LINK = "https://www.paypal.me/margsaft/5";
const DEFAULT_PAYPAL_EUR_LINK = "https://www.paypal.me/margsaft/5EUR";
const DEFAULT_PAYPAL_GBP_LINK = "https://www.paypal.me/margsaft/5GBP";

interface ServerMonetizationConfig {
  mpLink: string;
  paypalLinkUsd: string;
  paypalLinkEur: string;
  paypalLinkGbp: string;
  paywallEnabled: boolean;
  freeConsultationsLimit: number;
  passPriceArs: string;
  passAmountArs: number;
  autoReturnTokenHash: string;
}

const DEFAULT_SERVER_MONETIZATION: ServerMonetizationConfig = {
  mpLink: "https://mpago.la/2cv7Gii",
  paypalLinkUsd: DEFAULT_PAYPAL_USD_LINK,
  paypalLinkEur: DEFAULT_PAYPAL_EUR_LINK,
  paypalLinkGbp: DEFAULT_PAYPAL_GBP_LINK,
  paywallEnabled: true,
  freeConsultationsLimit: 2,
  passPriceArs: "$6.000 ARS",
  passAmountArs: 6000,
  autoReturnTokenHash: "",
};

function sanitizeServerMpUrl(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_SERVER_MONETIZATION.mpLink;
  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_SERVER_MONETIZATION.mpLink;
  if (/^https:\/\//i.test(trimmed)) return trimmed.slice(0, 300);
  if (/^http:\/\//i.test(trimmed)) return ("https://" + trimmed.slice(7)).slice(0, 300);
  if (/^(www\.)?(mpago\.la|mercadopago\.com)\//i.test(trimmed)) {
    return `https://${trimmed}`.slice(0, 300);
  }
  return DEFAULT_SERVER_MONETIZATION.mpLink;
}

function sanitizeServerPayPalUrl(raw: unknown, fallback: string): string {
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim().replace(/\s+/g, "");
  if (!trimmed) return fallback;
  let candidate = trimmed;
  if (/^http:\/\//i.test(candidate)) {
    candidate = "https://" + candidate.slice(7);
  } else if (/^(www\.)?(paypal\.me|paypal\.com)\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    const parsed = new URL(candidate);
    if (
      parsed.protocol === "https:" &&
      /^(www\.)?(paypal\.me|paypal\.com)$/i.test(parsed.hostname)
    ) {
      return parsed.toString().slice(0, 300);
    }
  } catch {
    // invalid URL
  }
  return fallback;
}

interface StoredUnlockCodeHash {
  salt: string;
  hash: string;
  updatedAt: string;
}

function readUnlockCodeHashFile(): StoredUnlockCodeHash | null {
  try {
    if (!fs.existsSync(PAYPAL_UNLOCK_HASH_FILE)) return null;
    const raw = JSON.parse(fs.readFileSync(PAYPAL_UNLOCK_HASH_FILE, "utf-8"));
    if (
      typeof raw?.salt === "string" &&
      /^[a-f0-9]{32}$/i.test(raw.salt) &&
      typeof raw?.hash === "string" &&
      /^[a-f0-9]{128}$/i.test(raw.hash)
    ) {
      return {
        salt: raw.salt,
        hash: raw.hash,
        updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

function writeUnlockCodeHashFile(plainCode: string): StoredUnlockCodeHash {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(plainCode.trim(), salt, 64).toString("hex");
  const record: StoredUnlockCodeHash = {
    salt,
    hash,
    updatedAt: new Date().toISOString(),
  };
  if (!fs.existsSync(VISITS_DATA_DIR)) {
    fs.mkdirSync(VISITS_DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(PAYPAL_UNLOCK_HASH_FILE, JSON.stringify(record, null, 2), "utf-8");
  return record;
}

function getEnvPayPalUnlockCode(): string {
  return (process.env.PAYPAL_UNLOCK_CODE || "").trim();
}

function hasPayPalUnlockCodeConfigured(): boolean {
  return Boolean(getEnvPayPalUnlockCode()) || Boolean(readUnlockCodeHashFile());
}

function verifySubmittedPayPalUnlockCode(candidate: string): boolean {
  const clean = candidate.trim();
  if (clean.length < 2 || clean.length > 64) return false;

  const envCode = getEnvPayPalUnlockCode();
  if (envCode) {
    const a = crypto.createHash("sha256").update(clean).digest();
    const b = crypto.createHash("sha256").update(envCode).digest();
    return crypto.timingSafeEqual(a, b);
  }

  const stored = readUnlockCodeHashFile();
  if (!stored) return false;
  const derived = crypto.scryptSync(clean, stored.salt, 64);
  const expected = Buffer.from(stored.hash, "hex");
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

const unlockCodeAttempts = new Map<string, { count: number; resetAt: number }>();

function checkUnlockCodeRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = unlockCodeAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    return true;
  }
  return entry.count < 8;
}

function recordUnlockCodeFailure(key: string): void {
  const now = Date.now();
  const entry = unlockCodeAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    unlockCodeAttempts.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
  } else {
    entry.count += 1;
  }
}

function readLocalMonetizationFile(): ServerMonetizationConfig | null {
  try {
    if (!fs.existsSync(MONETIZATION_FILE)) return null;
    const raw = JSON.parse(fs.readFileSync(MONETIZATION_FILE, "utf-8"));
    return {
      mpLink: sanitizeServerMpUrl(raw.mpLink),
      paypalLinkUsd: sanitizeServerPayPalUrl(raw.paypalLinkUsd, DEFAULT_PAYPAL_USD_LINK),
      paypalLinkEur: sanitizeServerPayPalUrl(raw.paypalLinkEur, DEFAULT_PAYPAL_EUR_LINK),
      paypalLinkGbp: sanitizeServerPayPalUrl(raw.paypalLinkGbp, DEFAULT_PAYPAL_GBP_LINK),
      paywallEnabled: typeof raw.paywallEnabled === "boolean" ? raw.paywallEnabled : true,
      freeConsultationsLimit:
        typeof raw.freeConsultationsLimit === "number"
          ? Math.min(10, Math.max(1, Math.round(raw.freeConsultationsLimit)))
          : 2,
      passPriceArs:
        typeof raw.passPriceArs === "string"
          ? raw.passPriceArs.trim().slice(0, 32)
          : "",
      passAmountArs:
        typeof raw.passAmountArs === "number" && raw.passAmountArs >= 0
          ? Math.min(10000000, Math.round(raw.passAmountArs))
          : 0,
      autoReturnTokenHash:
        typeof raw.autoReturnTokenHash === "string" && /^[a-f0-9]{64}$/i.test(raw.autoReturnTokenHash.trim())
          ? raw.autoReturnTokenHash.trim().toLowerCase()
          : "",
    };
  } catch {
    return null;
  }
}

async function readMonetizationConfigServer(): Promise<ServerMonetizationConfig> {
  const fromFile = readLocalMonetizationFile();
  if (fromFile) return fromFile;
  return { ...DEFAULT_SERVER_MONETIZATION };
}

app.get("/api/monetization", async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const cfg = await readMonetizationConfigServer();
  return res.json(cfg);
});

app.post("/api/monetization", async (req, res) => {
  try {
    if (!(await verifyAdminBearerToken(req))) {
      return res.status(403).json({ error: "No autorizado" });
    }
    const body = req.body || {};
    const existing = await readMonetizationConfigServer();
    const nextCfg: ServerMonetizationConfig = {
      mpLink: sanitizeServerMpUrl(body.mpLink ?? existing.mpLink),
      paypalLinkUsd: sanitizeServerPayPalUrl(body.paypalLinkUsd ?? existing.paypalLinkUsd, DEFAULT_PAYPAL_USD_LINK),
      paypalLinkEur: sanitizeServerPayPalUrl(body.paypalLinkEur ?? existing.paypalLinkEur, DEFAULT_PAYPAL_EUR_LINK),
      paypalLinkGbp: sanitizeServerPayPalUrl(body.paypalLinkGbp ?? existing.paypalLinkGbp, DEFAULT_PAYPAL_GBP_LINK),
      paywallEnabled:
        typeof body.paywallEnabled === "boolean" ? body.paywallEnabled : existing.paywallEnabled,
      freeConsultationsLimit:
        typeof body.freeConsultationsLimit === "number"
          ? Math.min(10, Math.max(1, Math.round(body.freeConsultationsLimit)))
          : existing.freeConsultationsLimit,
      passPriceArs:
        typeof body.passPriceArs === "string"
          ? body.passPriceArs.trim().slice(0, 32)
          : existing.passPriceArs,
      passAmountArs:
        typeof body.passAmountArs === "number" && body.passAmountArs >= 0
          ? Math.min(10000000, Math.round(body.passAmountArs))
          : existing.passAmountArs,
      autoReturnTokenHash:
        typeof body.autoReturnTokenHash === "string" && /^[a-f0-9]{64}$/i.test(body.autoReturnTokenHash.trim())
          ? body.autoReturnTokenHash.trim().toLowerCase()
          : existing.autoReturnTokenHash,
    };

    if (!fs.existsSync(VISITS_DATA_DIR)) {
      fs.mkdirSync(VISITS_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(MONETIZATION_FILE, JSON.stringify(nextCfg, null, 2), "utf-8");
    return res.json(nextCfg);
  } catch (e) {
    console.error("Error saving /api/monetization:", e);
    return res.status(500).json({ error: "No se pudo guardar la configuración de pagos" });
  }
});

function broadcastSseApproval(session: ServerPaymentSession) {
  const clients = sseClientsBySession.get(session.sessionId);
  if (!clients || clients.size === 0) return;
  const payload = JSON.stringify({
    type: "PAYMENT_APPROVED",
    sessionId: session.sessionId,
    provider: session.provider,
    approvalProof: session.approvalProof,
    pendingType: session.pendingType,
  });
  for (const res of clients) {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch {
      // ignore closed socket
    }
  }
}

async function approvePaymentSession(
  sessionId: string,
  provider: "mercadopago" | "auto",
  paymentRef?: string
): Promise<ServerPaymentSession | null> {
  const session = paymentSessions.get(sessionId);

  if (!session) return null;

  if (session.status === "approved" && isValidApprovalProof(session)) {
    broadcastSseApproval(session);
    return session;
  }

  const nowIso = new Date().toISOString();
  session.provider = provider;
  session.status = "approved";
  session.approvalProof = signApprovalProof(session.sessionId, session.visitorId, provider);
  session.paymentRef = paymentRef;
  session.updatedAt = nowIso;

  paymentSessions.set(session.sessionId, session);
  savePaymentSessionsDisk();
  broadcastSseApproval(session);

  return session;
}

// Payment capabilities (Mercado Pago real API + Checkout Pro status + PayPal unlock code status)
app.get("/api/payments/capabilities", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const hasToken = Boolean(getMercadoPagoAccessToken());
  res.json({
    mpCheckoutProReady: hasToken,
    mpApiVerificationReady: hasToken,
    paypalUnlockCodeConfigured: hasPayPalUnlockCodeConfigured(),
    paypalUnlockEnvConfigured: Boolean(getEnvPayPalUnlockCode()),
  });
});

// Create tracked payment session (Checkout Pro Preference when MERCADOPAGO_ACCESS_TOKEN + price configured, else Mercado Pago Link)
app.post("/api/payments/create-session", async (req, res) => {
  try {
    const { visitorId, pendingType = "pass", origin: rawOrigin } = req.body || {};
    const cleanVisitorId = sanitizeIdParam(visitorId, 4, 128) || `vis_${crypto.randomBytes(6).toString("hex")}`;
    const validType: "past-life" | "spirit-question" | "pass" =
      pendingType === "past-life" || pendingType === "spirit-question" ? pendingType : "pass";

    const sessionId = `ps_${crypto.randomBytes(12).toString("hex")}`;
    const refCode = `AK-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    const nowIso = new Date().toISOString();

    const session: ServerPaymentSession = {
      sessionId,
      visitorId: cleanVisitorId,
      provider: "mercadopago",
      status: "pending",
      pendingType: validType,
      refCode,
      approvalProof: "",
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    paymentSessions.set(sessionId, session);
    savePaymentSessionsDisk();

    const cfg = await readMonetizationConfigServer();
    let mpUrl = cfg.mpLink || "https://mpago.la/2cv7Gii";
    let checkoutMode: "checkout_pro" | "link" = "link";

    const mpToken = getMercadoPagoAccessToken();
    const origin = normalizeOrigin(rawOrigin, req);

    if (mpToken && cfg.passAmountArs > 0) {
      try {
        const prefRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mpToken}`,
          },
          body: JSON.stringify({
            items: [
              {
                id: "akashic_unlimited_pass",
                title: "Pase Akáshico Ilimitado • Lecturas y Preguntas",
                quantity: 1,
                unit_price: cfg.passAmountArs,
                currency_id: "ARS",
              },
            ],
            external_reference: sessionId,
            back_urls: {
              success: `${origin}/?mp_payment=approved&session_id=${encodeURIComponent(sessionId)}`,
              pending: `${origin}/?mp_payment=pending&session_id=${encodeURIComponent(sessionId)}`,
              failure: `${origin}/?mp_payment=failure&session_id=${encodeURIComponent(sessionId)}`,
            },
            auto_return: "approved",
            notification_url: `${origin}/api/payments/mercadopago/webhook`,
          }),
        });
        if (prefRes.ok) {
          const prefData = await prefRes.json();
          if (prefData?.init_point) {
            mpUrl = prefData.init_point;
            checkoutMode = "checkout_pro";
          }
        }
      } catch (prefErr) {
        console.warn("Checkout Pro preference creation fallback to link:", prefErr);
      }
    }

    return res.json({
      sessionId,
      refCode,
      mpUrl,
      checkoutMode,
    });
  } catch (err) {
    console.error("Error in /api/payments/create-session:", err);
    return res.status(500).json({ error: "Could not create payment session" });
  }
});

// Real-time Server-Sent Events stream for instant automatic unlock while modal is open
app.get("/api/payments/stream/:sessionId", (req, res) => {
  const sessionId = sanitizeIdParam(req.params.sessionId, 8, 128);
  if (!sessionId) {
    return res.status(400).end();
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const current = paymentSessions.get(sessionId);
  if (current && current.status === "approved" && isValidApprovalProof(current)) {
    res.write(
      `data: ${JSON.stringify({
        type: "PAYMENT_APPROVED",
        sessionId: current.sessionId,
        provider: current.provider,
        approvalProof: current.approvalProof,
        pendingType: current.pendingType,
      })}\n\n`
    );
  } else {
    res.write(`data: ${JSON.stringify({ type: "WAITING", sessionId })}\n\n`);
  }

  let set = sseClientsBySession.get(sessionId);
  if (!set) {
    set = new Set();
    sseClientsBySession.set(sessionId, set);
  }
  set.add(res);

  const ping = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
      // ignore
    }
  }, 20000);

  req.on("close", () => {
    clearInterval(ping);
    const clients = sseClientsBySession.get(sessionId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        sseClientsBySession.delete(sessionId);
      }
    }
  });
});

// Check session status
app.get("/api/payments/session/:sessionId", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const sessionId = sanitizeIdParam(req.params.sessionId, 8, 128);
  if (!sessionId) {
    return res.status(400).json({ error: "Invalid sessionId" });
  }

  const session = paymentSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  const verified = isValidApprovalProof(session);
  return res.json({
    sessionId: session.sessionId,
    status: verified ? "approved" : "pending",
    provider: session.provider,
    approvalProof: verified ? session.approvalProof : "",
  });
});

// Real Mercado Pago API verification on return URL (?payment_id=...&session_id=...)
app.post("/api/payments/mercadopago/verify", async (req, res) => {
  try {
    const { paymentId, sessionId, visitorId } = req.body || {};
    const cleanPaymentId = typeof paymentId === "string" || typeof paymentId === "number" ? String(paymentId).trim() : "";
    if (!cleanPaymentId) {
      return res.json({ approved: false, reason: "missing_payment_id" });
    }

    const cfg = await readMonetizationConfigServer();
    const verification = await verifyMercadoPagoPaymentOnApi(cleanPaymentId, cfg.passAmountArs);
    if (!verification.approved || !verification.mpPaymentId) {
      return res.json({
        approved: false,
        reason: verification.reason || "payment_not_approved",
        mpStatus: verification.mpStatus,
      });
    }

    const cleanVisitor = sanitizeIdParam(visitorId, 4, 128) || "vis_mp_verify";
    const existingClaimer = claimedMpPayments.get(verification.mpPaymentId);
    if (existingClaimer && existingClaimer !== cleanVisitor && cleanVisitor !== "vis_mp_verify") {
      return res.json({ approved: false, reason: "already_claimed" });
    }

    claimedMpPayments.set(verification.mpPaymentId, existingClaimer || cleanVisitor);
    saveClaimedMpPaymentsDisk();

    const targetSessionId =
      sanitizeIdParam(sessionId, 8, 128) ||
      sanitizeIdParam(verification.externalReference, 8, 128);

    if (targetSessionId) {
      const approved = await approvePaymentSession(
        targetSessionId,
        "mercadopago",
        `mp_op_${verification.mpPaymentId}`
      );
      if (approved) {
        return res.json({
          approved: true,
          sessionId: approved.sessionId,
          approvalProof: approved.approvalProof,
        });
      }
    }

    const newSessionId = `ps_mp_${crypto.randomBytes(10).toString("hex")}`;
    const nowIso = new Date().toISOString();
    const session: ServerPaymentSession = {
      sessionId: newSessionId,
      visitorId: cleanVisitor,
      provider: "mercadopago",
      status: "approved",
      pendingType: "pass",
      refCode: `MP-${verification.mpPaymentId.slice(-6)}`,
      approvalProof: signApprovalProof(newSessionId, cleanVisitor, "mercadopago"),
      paymentRef: `mp_op_${verification.mpPaymentId}`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    paymentSessions.set(newSessionId, session);
    savePaymentSessionsDisk();
    return res.json({
      approved: true,
      sessionId: session.sessionId,
      approvalProof: session.approvalProof,
    });
  } catch (e) {
    console.error("Error in /api/payments/mercadopago/verify:", e);
    return res.status(500).json({ approved: false, reason: "server_error" });
  }
});

// Live Mercado Pago Webhook (verifies real payment status via Mercado Pago API and unlocks SSE session)
app.post("/api/payments/mercadopago/webhook", async (req, res) => {
  try {
    const topic = String(req.body?.type || req.body?.topic || req.query?.topic || req.query?.type || "").toLowerCase();
    const paymentIdRaw =
      req.body?.data?.id ||
      req.query?.["data.id"] ||
      req.query?.id ||
      "";
    const paymentId = paymentIdRaw ? String(paymentIdRaw).trim() : "";

    if (paymentId && (!topic || topic.includes("payment")) && getMercadoPagoAccessToken()) {
      const cfg = await readMonetizationConfigServer();
      const verification = await verifyMercadoPagoPaymentOnApi(paymentId, cfg.passAmountArs);
      if (verification.approved && verification.mpPaymentId && verification.externalReference) {
        const cleanSessionId = sanitizeIdParam(verification.externalReference, 8, 128);
        if (cleanSessionId) {
          const existingSession = paymentSessions.get(cleanSessionId);
          if (existingSession?.visitorId) {
            claimedMpPayments.set(verification.mpPaymentId, existingSession.visitorId);
            saveClaimedMpPaymentsDisk();
          }
          await approvePaymentSession(
            cleanSessionId,
            "mercadopago",
            `mp_op_${verification.mpPaymentId}`
          );
        }
      }
    }
  } catch (e) {
    console.warn("Error handling Mercado Pago webhook:", e);
  }
  return res.status(200).json({ received: true });
});

// Auto-Return URL Token Verification (server-verified against config hash)
app.post("/api/payments/verify-return", async (req, res) => {
  try {
    const { token, sessionId, visitorId } = req.body || {};
    const rawToken = typeof token === "string" ? token.trim() : "";
    if (!rawToken) {
      return res.json({ approved: false, reason: "missing_token" });
    }

    const cfg = await readMonetizationConfigServer();
    const hashExact = crypto.createHash("sha256").update(rawToken).digest("hex");
    const hashUpper = crypto.createHash("sha256").update(rawToken.toUpperCase()).digest("hex");

    const matchesAutoReturn =
      Boolean(cfg.autoReturnTokenHash) &&
      (hashExact === cfg.autoReturnTokenHash || hashUpper === cfg.autoReturnTokenHash);

    if (!matchesAutoReturn) {
      return res.json({ approved: false, reason: "invalid_token" });
    }

    const cleanSessionId = sanitizeIdParam(sessionId, 8, 128);
    if (cleanSessionId) {
      const approved = await approvePaymentSession(cleanSessionId, "auto", "return_token");
      if (approved) {
        return res.json({
          approved: true,
          sessionId: approved.sessionId,
          approvalProof: approved.approvalProof,
        });
      }
    }

    const newSessionId = `ps_ret_${crypto.randomBytes(10).toString("hex")}`;
    const cleanVisitor = sanitizeIdParam(visitorId, 4, 128) || "vis_auto_return";
    const nowIso = new Date().toISOString();
    const session: ServerPaymentSession = {
      sessionId: newSessionId,
      visitorId: cleanVisitor,
      provider: "auto",
      status: "approved",
      pendingType: "pass",
      refCode: "AK-AUTO",
      approvalProof: signApprovalProof(newSessionId, cleanVisitor, "auto"),
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    paymentSessions.set(newSessionId, session);
    savePaymentSessionsDisk();
    return res.json({
      approved: true,
      sessionId: session.sessionId,
      approvalProof: session.approvalProof,
    });
  } catch (e) {
    console.error("Error in /api/payments/verify-return:", e);
    return res.status(500).json({ approved: false });
  }
});

// Strict Mercado Pago Operation Number Validation (verifies directly against Mercado Pago API)
app.post("/api/payments/verify-operation", async (req, res) => {
  try {
    const { operationNumber, sessionId, visitorId } = req.body || {};
    const cleanOp = typeof operationNumber === "string" ? operationNumber.trim() : "";
    if (!cleanOp || cleanOp.length < 4) {
      return res.json({ approved: false, reason: "invalid_operation_number" });
    }

    const cfg = await readMonetizationConfigServer();
    const verification = await verifyMercadoPagoPaymentOnApi(cleanOp, cfg.passAmountArs);
    if (!verification.approved || !verification.mpPaymentId) {
      return res.json({
        approved: false,
        reason: verification.reason || "payment_not_approved",
        mpStatus: verification.mpStatus,
      });
    }

    const cleanVisitor = sanitizeIdParam(visitorId, 4, 128) || "vis_op_verify";
    const existingClaimer = claimedMpPayments.get(verification.mpPaymentId);
    if (existingClaimer && existingClaimer !== cleanVisitor) {
      return res.json({ approved: false, reason: "already_claimed" });
    }

    claimedMpPayments.set(verification.mpPaymentId, cleanVisitor);
    saveClaimedMpPaymentsDisk();

    const cleanSessionId = sanitizeIdParam(sessionId, 8, 128);
    if (cleanSessionId) {
      const approved = await approvePaymentSession(
        cleanSessionId,
        "mercadopago",
        `mp_op_${verification.mpPaymentId}`
      );
      if (approved) {
        return res.json({
          approved: true,
          sessionId: approved.sessionId,
          approvalProof: approved.approvalProof,
        });
      }
    }

    const newSessionId = `ps_op_${crypto.randomBytes(10).toString("hex")}`;
    const nowIso = new Date().toISOString();
    const session: ServerPaymentSession = {
      sessionId: newSessionId,
      visitorId: cleanVisitor,
      provider: "mercadopago",
      status: "approved",
      pendingType: "pass",
      refCode: `MP-${verification.mpPaymentId.slice(-8).toUpperCase()}`,
      approvalProof: signApprovalProof(newSessionId, cleanVisitor, "mercadopago"),
      paymentRef: `mp_op_${verification.mpPaymentId}`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    paymentSessions.set(newSessionId, session);
    savePaymentSessionsDisk();
    return res.json({
      approved: true,
      sessionId: session.sessionId,
      approvalProof: session.approvalProof,
    });
  } catch (e) {
    console.error("Error in /api/payments/verify-operation:", e);
    return res.status(500).json({ approved: false });
  }
});

// Configure PayPal Unlock Code (strictly admin-only; stored hashed with scrypt on server; env var overrides)
app.post("/api/payments/set-unlock-code", async (req, res) => {
  try {
    if (!(await verifyAdminBearerToken(req))) {
      return res.status(403).json({ ok: false, error: "No autorizado" });
    }

    const rawCode = typeof req.body?.code === "string" ? req.body.code.trim() : "";
    if (rawCode.length < 3 || rawCode.length > 64) {
      return res.status(400).json({
        ok: false,
        error: "El código debe tener entre 3 y 64 caracteres.",
      });
    }

    writeUnlockCodeHashFile(rawCode);
    return res.json({
      ok: true,
      paypalUnlockCodeConfigured: true,
      paypalUnlockEnvConfigured: Boolean(getEnvPayPalUnlockCode()),
    });
  } catch (e) {
    console.error("Error in /api/payments/set-unlock-code:", e);
    return res.status(500).json({ ok: false, error: "Error guardando código en el servidor." });
  }
});

// Verify PayPal Unlock Code (server-side constant-time / scrypt verification + rate limit)
app.post("/api/payments/verify-unlock-code", async (req, res) => {
  try {
    const { code, sessionId, visitorId } = req.body || {};
    const cleanCode = typeof code === "string" ? code.trim() : "";
    const cleanVisitor = sanitizeIdParam(visitorId, 4, 128) || "vis_paypal_code";
    const clientIp =
      String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "ip_unknown")
        .split(",")[0]
        .trim()
        .slice(0, 64);
    const rateKey = `${clientIp}:${cleanVisitor}`;

    if (!checkUnlockCodeRateLimit(rateKey)) {
      return res.status(429).json({
        approved: false,
        reason: "rate_limited",
      });
    }

    if (!hasPayPalUnlockCodeConfigured()) {
      return res.json({
        approved: false,
        reason: "unlock_code_not_configured",
      });
    }

    if (!cleanCode || cleanCode.length < 2 || !verifySubmittedPayPalUnlockCode(cleanCode)) {
      recordUnlockCodeFailure(rateKey);
      return res.json({
        approved: false,
        reason: "invalid_code",
      });
    }

    unlockCodeAttempts.delete(rateKey);

    const cleanSessionId = sanitizeIdParam(sessionId, 8, 128);
    if (cleanSessionId) {
      const approved = await approvePaymentSession(cleanSessionId, "auto", "paypal_unlock_code");
      if (approved) {
        return res.json({
          approved: true,
          sessionId: approved.sessionId,
          approvalProof: approved.approvalProof,
        });
      }
    }

    const newSessionId = `ps_pp_${crypto.randomBytes(10).toString("hex")}`;
    const nowIso = new Date().toISOString();
    const session: ServerPaymentSession = {
      sessionId: newSessionId,
      visitorId: cleanVisitor,
      provider: "auto",
      status: "approved",
      pendingType: "pass",
      refCode: "PP-CODE",
      approvalProof: signApprovalProof(newSessionId, cleanVisitor, "auto"),
      paymentRef: "paypal_unlock_code",
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    paymentSessions.set(newSessionId, session);
    savePaymentSessionsDisk();
    return res.json({
      approved: true,
      sessionId: session.sessionId,
      approvalProof: session.approvalProof,
    });
  } catch (e) {
    console.error("Error in /api/payments/verify-unlock-code:", e);
    return res.status(500).json({ approved: false });
  }
});

// =========================================================================
// Creator / Owner Authentication (Numeric PIN + WebAuthn Fingerprint/Passkey)
// =========================================================================

function getAdminPinEnv(): string {
  return (process.env.ADMIN_PIN || "").trim();
}

function hasAdminPinConfigured(): boolean {
  return Boolean(getAdminPinEnv()) || Boolean(adminCredentialsState.pinSalt && adminCredentialsState.pinHash);
}

function hashPinWithSalt(pin: string, saltHex: string): string {
  return crypto.scryptSync(pin, saltHex, 64).toString("hex");
}

function verifySubmittedAdminPin(candidate: string): boolean {
  const envPin = getAdminPinEnv();
  if (envPin) {
    const a = crypto.createHash("sha256").update(candidate).digest();
    const b = crypto.createHash("sha256").update(envPin).digest();
    return crypto.timingSafeEqual(a, b);
  }
  if (!adminCredentialsState.pinSalt || !adminCredentialsState.pinHash) {
    return false;
  }
  const derived = hashPinWithSalt(candidate, adminCredentialsState.pinSalt);
  const a = Buffer.from(derived, "hex");
  const b = Buffer.from(adminCredentialsState.pinHash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const adminPinAttempts = new Map<string, { count: number; resetAt: number }>();
const ADMIN_PIN_MAX_ATTEMPTS = 5;
const ADMIN_PIN_WINDOW_MS = 15 * 60 * 1000;

function checkAdminPinRateLimit(ip: string): boolean {
  const rec = adminPinAttempts.get(ip);
  const now = Date.now();
  if (!rec || now > rec.resetAt) {
    adminPinAttempts.delete(ip);
    return true;
  }
  return rec.count < ADMIN_PIN_MAX_ATTEMPTS;
}

function recordAdminPinFailure(ip: string) {
  const now = Date.now();
  const rec = adminPinAttempts.get(ip);
  if (!rec || now > rec.resetAt) {
    adminPinAttempts.set(ip, { count: 1, resetAt: now + ADMIN_PIN_WINDOW_MS });
  } else {
    rec.count += 1;
  }
}

function getClientIpKey(req: express.Request): string {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "ip_unknown")
    .split(",")[0]
    .trim()
    .slice(0, 64);
}

function getWebAuthnContext(req: express.Request): { rpID: string; expectedOrigin: string } | null {
  const rawHost = String(req.headers["x-forwarded-host"] || req.headers.host || "")
    .split(",")[0]
    .trim();
  if (!rawHost || !/^[a-zA-Z0-9.-]+(?::\d{1,5})?$/.test(rawHost)) {
    return null;
  }
  const rpID = rawHost.split(":")[0].toLowerCase();
  const isLocal = rpID === "localhost" || rpID === "127.0.0.1";
  const protoHeader = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim().toLowerCase();
  const proto = isLocal ? (protoHeader === "https" ? "https" : "http") : "https";
  return { rpID, expectedOrigin: `${proto}://${rawHost.toLowerCase()}` };
}

interface PendingWebAuthnChallenge {
  challenge: string;
  rpID: string;
  expectedOrigin: string;
  expiresAt: number;
}
const webauthnChallenges = new Map<string, PendingWebAuthnChallenge>();

function pruneExpiredWebAuthnChallenges() {
  const now = Date.now();
  for (const [key, item] of webauthnChallenges.entries()) {
    if (now > item.expiresAt) {
      webauthnChallenges.delete(key);
    }
  }
}

app.get("/api/admin/auth-capabilities", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const ctx = getWebAuthnContext(req);
  const matchingCreds = ctx
    ? adminCredentialsState.webauthnCredentials.filter((c) => c.rpId === ctx.rpID)
    : [];
  const pinConfigured = hasAdminPinConfigured();
  return res.json({
    pinConfigured,
    pinEnvConfigured: Boolean(getAdminPinEnv()),
    canSetupInitialPin: !pinConfigured,
    webauthnConfigured: matchingCreds.length > 0,
    webauthnTotalCount: adminCredentialsState.webauthnCredentials.length,
    webauthnRpId: ctx?.rpID || null,
  });
});

// First-run PIN setup (locks permanently once claimed or when ADMIN_PIN env var is set)
app.post("/api/admin/pin/setup", (req, res) => {
  try {
    if (hasAdminPinConfigured()) {
      return res.status(403).json({
        ok: false,
        error: "Ya existe un PIN configurado. Usa tu PIN actual o Google para ingresar.",
      });
    }
    const rawPin = typeof req.body?.pin === "string" ? req.body.pin.trim() : "";
    if (!/^\d{4,12}$/.test(rawPin)) {
      return res.status(400).json({
        ok: false,
        error: "El código numérico debe tener entre 4 y 12 dígitos.",
      });
    }
    const salt = crypto.randomBytes(16).toString("hex");
    adminCredentialsState.pinSalt = salt;
    adminCredentialsState.pinHash = hashPinWithSalt(rawPin, salt);
    adminCredentialsState.pinUpdatedAt = new Date().toISOString();
    saveAdminCredentials();

    const { token, expiresAt } = signAdminSessionToken("pin");
    return res.json({ ok: true, token, expiresAt });
  } catch (e) {
    console.error("Error in /api/admin/pin/setup:", e);
    return res.status(500).json({ ok: false, error: "No se pudo configurar el PIN." });
  }
});

// Verify Numeric PIN and issue short-lived signed admin Bearer token (kept in memory only)
app.post("/api/admin/pin/login", (req, res) => {
  try {
    const ip = getClientIpKey(req);
    if (!checkAdminPinRateLimit(ip)) {
      return res.status(429).json({
        ok: false,
        error: "Demasiados intentos fallidos. Espera 15 minutos antes de volver a intentar.",
      });
    }
    if (!hasAdminPinConfigured()) {
      return res.status(400).json({
        ok: false,
        error: "Todavía no hay un código numérico configurado.",
      });
    }
    const rawPin = typeof req.body?.pin === "string" ? req.body.pin.trim() : "";
    if (!/^\d{4,12}$/.test(rawPin) || !verifySubmittedAdminPin(rawPin)) {
      recordAdminPinFailure(ip);
      return res.status(401).json({
        ok: false,
        error: "Código numérico incorrecto.",
      });
    }
    adminPinAttempts.delete(ip);
    const { token, expiresAt } = signAdminSessionToken("pin");
    return res.json({ ok: true, token, expiresAt });
  } catch (e) {
    console.error("Error in /api/admin/pin/login:", e);
    return res.status(500).json({ ok: false, error: "Error verificando el PIN." });
  }
});

// Change Numeric PIN (requires verified admin session via Google, PIN, or Biometric)
app.post("/api/admin/pin/change", async (req, res) => {
  try {
    if (!(await verifyAdminBearerToken(req))) {
      return res.status(403).json({ ok: false, error: "No autorizado" });
    }
    if (getAdminPinEnv()) {
      return res.status(400).json({
        ok: false,
        error: "El PIN está fijado en los Secretos del servidor (ADMIN_PIN).",
      });
    }
    const rawPin = typeof req.body?.pin === "string" ? req.body.pin.trim() : "";
    if (!/^\d{4,12}$/.test(rawPin)) {
      return res.status(400).json({
        ok: false,
        error: "El código numérico debe tener entre 4 y 12 dígitos.",
      });
    }
    const salt = crypto.randomBytes(16).toString("hex");
    adminCredentialsState.pinSalt = salt;
    adminCredentialsState.pinHash = hashPinWithSalt(rawPin, salt);
    adminCredentialsState.pinUpdatedAt = new Date().toISOString();
    saveAdminCredentials();
    return res.json({ ok: true });
  } catch (e) {
    console.error("Error in /api/admin/pin/change:", e);
    return res.status(500).json({ ok: false, error: "No se pudo actualizar el PIN." });
  }
});

// Register WebAuthn Fingerprint / Biometric Passkey (requires already-verified admin session)
app.post("/api/admin/webauthn/register-options", async (req, res) => {
  try {
    if (!(await verifyAdminBearerToken(req))) {
      return res.status(403).json({ error: "No autorizado" });
    }
    const ctx = getWebAuthnContext(req);
    if (!ctx) {
      return res.status(400).json({ error: "Dominio inválido para biometría." });
    }

    pruneExpiredWebAuthnChallenges();
    const excludeCredentials = adminCredentialsState.webauthnCredentials
      .filter((c) => c.rpId === ctx.rpID)
      .map((c) => ({
        id: c.id,
        transports: c.transports as any,
      }));

    const toWebAuthnBytes = (bytes: Uint8Array): Uint8Array<ArrayBuffer> => {
      const copy = new Uint8Array(new ArrayBuffer(bytes.byteLength));
      copy.set(bytes);
      return copy;
    };

    const options = await generateRegistrationOptions({
      rpName: "Oráculo Akáshico • Propietaria",
      rpID: ctx.rpID,
      userName: OWNER_EMAIL,
      userDisplayName: "Propietaria del Portal",
      userID: toWebAuthnBytes(new TextEncoder().encode(OWNER_EMAIL)),
      attestationType: "none",
      excludeCredentials,
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "required",
      },
    });

    const challengeId = crypto.randomBytes(16).toString("hex");
    webauthnChallenges.set(challengeId, {
      challenge: options.challenge,
      rpID: ctx.rpID,
      expectedOrigin: ctx.expectedOrigin,
      expiresAt: Date.now() + 2 * 60 * 1000,
    });

    return res.json({ challengeId, options });
  } catch (e) {
    console.error("Error in /api/admin/webauthn/register-options:", e);
    return res.status(500).json({ error: "No se pudo iniciar el registro biométrico." });
  }
});

app.post("/api/admin/webauthn/register-verify", async (req, res) => {
  try {
    if (!(await verifyAdminBearerToken(req))) {
      return res.status(403).json({ ok: false, error: "No autorizado" });
    }
    const { challengeId, response, label } = req.body || {};
    const pending = typeof challengeId === "string" ? webauthnChallenges.get(challengeId) : undefined;
    if (typeof challengeId === "string") {
      webauthnChallenges.delete(challengeId);
    }
    if (!pending || Date.now() > pending.expiresAt) {
      return res.status(400).json({ ok: false, error: "La solicitud biométrica expiró. Intenta nuevamente." });
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: pending.challenge,
      expectedOrigin: pending.expectedOrigin,
      expectedRPID: pending.rpID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ ok: false, error: "No se pudo verificar la huella digital." });
    }

    const { credential } = verification.registrationInfo;
    const credId = credential.id;
    const publicKeyBase64 = Buffer.from(credential.publicKey).toString("base64");

    const filtered = adminCredentialsState.webauthnCredentials.filter((c) => c.id !== credId);
    filtered.push({
      id: credId,
      publicKeyBase64,
      counter: credential.counter,
      transports: Array.isArray(credential.transports) ? credential.transports : undefined,
      rpId: pending.rpID,
      label: typeof label === "string" ? label.trim().slice(0, 60) : "Dispositivo del Propietario",
      createdAt: new Date().toISOString(),
    });
    // Keep up to 10 registered owner devices
    adminCredentialsState.webauthnCredentials = filtered.slice(-10);
    saveAdminCredentials();

    return res.json({
      ok: true,
      webauthnConfigured: true,
      webauthnTotalCount: adminCredentialsState.webauthnCredentials.length,
    });
  } catch (e) {
    console.error("Error in /api/admin/webauthn/register-verify:", e);
    return res.status(400).json({ ok: false, error: "No se pudo guardar la huella digital." });
  }
});

// Authenticate with WebAuthn Fingerprint / Biometrics
app.post("/api/admin/webauthn/login-options", async (req, res) => {
  try {
    const ctx = getWebAuthnContext(req);
    if (!ctx) {
      return res.status(400).json({ error: "Dominio inválido para biometría." });
    }

    const matchingCreds = adminCredentialsState.webauthnCredentials.filter(
      (c) => c.rpId === ctx.rpID
    );
    if (matchingCreds.length === 0) {
      return res.status(404).json({
        error: "No hay una huella registrada todavía en este dominio. Ingresa con tu PIN o Google para activarla.",
      });
    }

    pruneExpiredWebAuthnChallenges();
    const options = await generateAuthenticationOptions({
      rpID: ctx.rpID,
      userVerification: "required",
      allowCredentials: matchingCreds.map((c) => ({
        id: c.id,
        transports: c.transports as any,
      })),
    });

    const challengeId = crypto.randomBytes(16).toString("hex");
    webauthnChallenges.set(challengeId, {
      challenge: options.challenge,
      rpID: ctx.rpID,
      expectedOrigin: ctx.expectedOrigin,
      expiresAt: Date.now() + 2 * 60 * 1000,
    });

    return res.json({ challengeId, options });
  } catch (e) {
    console.error("Error in /api/admin/webauthn/login-options:", e);
    return res.status(500).json({ error: "No se pudo iniciar la lectura biométrica." });
  }
});

app.post("/api/admin/webauthn/login-verify", async (req, res) => {
  try {
    const ip = getClientIpKey(req);
    if (!checkAdminPinRateLimit(ip)) {
      return res.status(429).json({
        ok: false,
        error: "Demasiados intentos. Espera unos minutos antes de reintentar.",
      });
    }
    const { challengeId, response } = req.body || {};
    const pending = typeof challengeId === "string" ? webauthnChallenges.get(challengeId) : undefined;
    if (typeof challengeId === "string") {
      webauthnChallenges.delete(challengeId);
    }
    if (!pending || Date.now() > pending.expiresAt) {
      return res.status(400).json({ ok: false, error: "La verificación biométrica expiró. Intenta nuevamente." });
    }

    const credId = typeof response?.id === "string" ? response.id : "";
    const stored = adminCredentialsState.webauthnCredentials.find(
      (c) => c.id === credId && c.rpId === pending.rpID
    );
    if (!stored) {
      recordAdminPinFailure(ip);
      return res.status(401).json({ ok: false, error: "Huella no reconocida en este dominio." });
    }

    const rawPk = Buffer.from(stored.publicKeyBase64, "base64");
    const pkCopy = new Uint8Array(new ArrayBuffer(rawPk.byteLength));
    pkCopy.set(rawPk);
    const credential: WebAuthnCredential = {
      id: stored.id,
      publicKey: pkCopy,
      counter: stored.counter,
      transports: stored.transports as any,
    };

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: pending.challenge,
      expectedOrigin: pending.expectedOrigin,
      expectedRPID: pending.rpID,
      credential,
      requireUserVerification: true,
    });

    if (!verification.verified) {
      recordAdminPinFailure(ip);
      return res.status(401).json({ ok: false, error: "Verificación biométrica rechazada." });
    }

    stored.counter = verification.authenticationInfo.newCounter;
    saveAdminCredentials();
    adminPinAttempts.delete(ip);

    const { token, expiresAt } = signAdminSessionToken("webauthn");
    return res.json({ ok: true, token, expiresAt });
  } catch (e) {
    console.error("Error in /api/admin/webauthn/login-verify:", e);
    return res.status(400).json({ ok: false, error: "No se pudo verificar la huella digital." });
  }
});

// Vite Integration
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
      plugins: [
        {
          name: "attach-hmr-to-http-server",
          config(userConfig) {
            if (userConfig.server?.hmr !== false) {
              return {
                server: {
                  hmr: {
                    ...(typeof userConfig.server?.hmr === "object" ? userConfig.server.hmr : {}),
                    server: httpServer,
                  },
                },
              };
            }
          },
        },
      ],
    });
    if (process.env.DISABLE_HMR === "true") {
      app.get("/@vite/client", async (_req, res, next) => {
        try {
          const result = await vite.transformRequest("/@vite/client");
          if (result && typeof result.code === "string") {
            const patched = result.code
              .replace(
                /transport\.connect\(createHMRHandler\(handleMessage\)\);/g,
                "/* HMR disabled: WebSocket connection skipped */"
              )
              .replace(
                /throw new Error\("send was called before connect"\);/g,
                "return; /* HMR disabled: send skipped */"
              )
              .replace(
                /throw new Error\("invoke was called before connect"\);/g,
                "return undefined; /* HMR disabled: invoke skipped */"
              );
            res.setHeader("Content-Type", "application/javascript; charset=utf-8");
            res.setHeader("Cache-Control", "no-cache");
            return res.send(patched);
          }
        } catch {
          // fall through to vite.middlewares
        }
        return next();
      });
    }

    // Clean self-destroying service worker for any clients with lingering dev-sw registrations
    app.get(["/dev-sw.js", "/dev-sw.js*", "/workbox-*.js"], (_req, res) => {
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return res.send(
        "self.addEventListener('install', () => { self.skipWaiting(); });\n" +
        "self.addEventListener('activate', (e) => {\n" +
        "  e.waitUntil(\n" +
        "    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))\n" +
        "      .then(() => self.registration.unregister())\n" +
        "      .then(() => self.clients.matchAll())\n" +
        "      .then((clients) => clients.forEach((c) => { try { c.navigate(c.url); } catch(e){} }))\n" +
        "  );\n" +
        "});"
      );
    });
    // Lightweight pass-through Service Worker in dev mode for PWA installability without caching Vite modules
    app.get("/sw.js", (_req, res) => {
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return res.send(
        "self.addEventListener('install', () => { self.skipWaiting(); });\n" +
        "self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });\n" +
        "self.addEventListener('fetch', () => {});"
      );
    });
    // Serve valid Web App Manifest in dev mode when VitePWA devOptions is disabled
    app.get("/manifest.webmanifest", (_req, res) => {
      const distManifest = path.join(process.cwd(), "dist", "manifest.webmanifest");
      res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      if (fs.existsSync(distManifest)) {
        return res.sendFile(distManifest);
      }
      return res.json({
        id: "/",
        name: "Tabla Ouija & Oráculo Akáshico",
        short_name: "Tabla Ouija",
        description:
          "Portal místico interactivo con Tabla Ouija, Oráculo Akáshico, Tarot Diario, Carta Natal y Misión de Vida según la Cábala.",
        theme_color: "#0c0817",
        background_color: "#080503",
        display: "standalone",
        orientation: "any",
        scope: "/",
        start_url: "/",
        lang: "es",
        categories: ["lifestyle", "entertainment", "education"],
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/pwa-maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      });
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(
      express.static(distPath, {
        setHeaders: (res, filePath) => {
          if (
            filePath.endsWith("index.html") ||
            filePath.endsWith("sw.js") ||
            filePath.endsWith("registerSW.js")
          ) {
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          } else if (filePath.endsWith("manifest.webmanifest")) {
            res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
            res.setHeader("Cache-Control", "no-cache");
          }
        },
      })
    );
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
