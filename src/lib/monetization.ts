import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";

export const DEFAULT_MP_LINK = "https://mpago.la/2cv7Gii";

export interface MonetizationConfig {
  mpLink: string;
  kofiLink: string;
  paywallEnabled: boolean;
  freeConsultationsLimit: number;
  passPriceUsd: string;
  passPriceArs: string;
  passAmountArs: number;
  passMpLink: string;
  unlockCodeHash: string;
  autoReturnTokenHash: string;
}

export const DEFAULT_MONETIZATION_CONFIG: MonetizationConfig = {
  mpLink: DEFAULT_MP_LINK,
  kofiLink: "",
  paywallEnabled: true,
  freeConsultationsLimit: 2,
  passPriceUsd: "4 USD",
  passPriceArs: "$3.500 ARS",
  passAmountArs: 3500,
  passMpLink: "",
  unlockCodeHash: "",
  autoReturnTokenHash: "",
};

export type PendingConsultation =
  | {
      id: string;
      type: "past-life";
      data: {
        name: string;
        birthYear: string;
        focusQuery: string;
        feeling: string;
      };
      createdAt: number;
    }
  | {
      id: string;
      type: "spirit-question";
      question: string;
      name: string;
      createdAt: number;
    };

const LOCAL_FALLBACK_KEY = "ouija_monetization_cache_v5";
const FREE_USED_KEY = "ouija_free_consultations_used_v1";
const PASS_UNLOCKED_KEY = "ouija_pass_unlocked_hash_v1";
const PASS_UNLOCKED_PROOF_KEY = "ouija_pass_unlocked_proof_v2";
const PENDING_CONSULTATION_KEY = "ouija_pending_consultation_v1";
const CLAIMED_PENDING_KEY = "ouija_claimed_pending_id_v1";
const PAYWALL_HEARTBEAT_KEY = "ouija_paywall_heartbeat_v1";
const ACTIVE_SESSION_ID_KEY = "ouija_active_payment_session_v1";
const PAYMENT_CHANNEL_NAME = "ouija_payment_channel";

export function normalizeHttpsUrl(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "";
  if (/^https:\/\//i.test(trimmed)) return trimmed.slice(0, 300);
  if (/^http:\/\//i.test(trimmed)) return ("https://" + trimmed.slice(7)).slice(0, 300);
  if (/^(www\.)?(mpago\.la|mercadopago\.com|cafecito\.app|ko-fi\.com)\//i.test(trimmed)) {
    return `https://${trimmed}`.slice(0, 300);
  }
  return "";
}

export function normalizeKofiUrl(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "";
  const asHttps = normalizeHttpsUrl(trimmed);
  if (asHttps) return asHttps;
  if (!trimmed.includes("@") && /^[a-zA-Z0-9._-]{2,64}$/.test(trimmed)) {
    return `https://ko-fi.com/${trimmed}`.slice(0, 300);
  }
  return "";
}

export function normalizeHash(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const cleaned = raw.trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(cleaned) ? cleaned : "";
}

export function sanitizeMonetizationConfig(input: Partial<MonetizationConfig>): MonetizationConfig {
  const rawLimit = Number(input.freeConsultationsLimit);
  const clampedLimit = Number.isFinite(rawLimit)
    ? Math.min(10, Math.max(1, Math.round(rawLimit)))
    : 2;

  const rawAmount = Number(input.passAmountArs);
  const clampedAmount = Number.isFinite(rawAmount) && rawAmount >= 100
    ? Math.min(10000000, Math.round(rawAmount))
    : 3500;

  return {
    mpLink: normalizeHttpsUrl(input.mpLink ?? DEFAULT_MP_LINK) || DEFAULT_MP_LINK,
    kofiLink: normalizeKofiUrl(input.kofiLink ?? ""),
    paywallEnabled: typeof input.paywallEnabled === "boolean" ? input.paywallEnabled : true,
    freeConsultationsLimit: clampedLimit,
    passPriceUsd: (input.passPriceUsd ?? "4 USD").trim().slice(0, 32),
    passPriceArs: (input.passPriceArs ?? "$3.500 ARS").trim().slice(0, 32),
    passAmountArs: clampedAmount,
    passMpLink: normalizeHttpsUrl(input.passMpLink ?? ""),
    unlockCodeHash: normalizeHash(input.unlockCodeHash ?? ""),
    autoReturnTokenHash: normalizeHash(input.autoReturnTokenHash ?? ""),
  };
}

export function getEffectiveKofiUrl(cfg: MonetizationConfig): string {
  return cfg.kofiLink || "";
}

export function getEffectiveMpUrl(
  cfg: MonetizationConfig,
  mode: "tip" | "pass"
): string {
  if (mode === "pass" && cfg.passMpLink) {
    return cfg.passMpLink;
  }
  return cfg.mpLink || DEFAULT_MP_LINK;
}

export async function sha256Hex(plain: string): Promise<string> {
  const normalized = plain.trim().toUpperCase();
  if (!normalized) return "";
  const encoded = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256ExactHex(plain: string): Promise<string> {
  const normalized = plain.trim();
  if (!normalized) return "";
  const encoded = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "vis_anon";
  try {
    const stored = localStorage.getItem("ouija_visitor_id");
    if (stored && /^[a-zA-Z0-9_\-]{4,128}$/.test(stored)) {
      return stored;
    }
    const created = `vis_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    localStorage.setItem("ouija_visitor_id", created);
    return created;
  } catch {
    return `vis_anon_${Date.now()}`;
  }
}

export function getFreeConsultationsUsed(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(FREE_USED_KEY);
    const num = Number(raw);
    return Number.isFinite(num) && num >= 0 ? Math.floor(num) : 0;
  } catch {
    return 0;
  }
}

export function incrementFreeConsultationsUsed(): number {
  const next = getFreeConsultationsUsed() + 1;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(FREE_USED_KEY, String(next));
      window.dispatchEvent(new Event("ouija_consultation_allowance_changed"));
    } catch {
      // ignore
    }
  }
  return next;
}

export function resetFreeConsultationsUsed(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(FREE_USED_KEY);
      localStorage.removeItem(PASS_UNLOCKED_KEY);
      localStorage.removeItem(PASS_UNLOCKED_PROOF_KEY);
      localStorage.removeItem(PENDING_CONSULTATION_KEY);
      localStorage.removeItem(CLAIMED_PENDING_KEY);
      localStorage.removeItem(ACTIVE_SESSION_ID_KEY);
      window.dispatchEvent(new Event("ouija_consultation_allowance_changed"));
    } catch {
      // ignore
    }
  }
}

export function broadcastPaymentUnlock(proof: string, sessionId?: string): void {
  if (typeof window === "undefined") return;
  try {
    if ("BroadcastChannel" in window) {
      const ch = new BroadcastChannel(PAYMENT_CHANNEL_NAME);
      ch.postMessage({ type: "PASS_UNLOCKED", proof, sessionId, at: Date.now() });
      ch.close();
    }
  } catch {
    // ignore
  }
}

export function subscribePaymentBroadcast(
  onUnlocked: (payload: { proof?: string; sessionId?: string }) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  let ch: BroadcastChannel | null = null;
  try {
    if ("BroadcastChannel" in window) {
      ch = new BroadcastChannel(PAYMENT_CHANNEL_NAME);
      ch.onmessage = (ev) => {
        if (ev?.data?.type === "PASS_UNLOCKED") {
          onUnlocked({ proof: ev.data.proof, sessionId: ev.data.sessionId });
        }
      };
    }
  } catch {
    // ignore
  }
  const onStorage = (ev: StorageEvent) => {
    if (ev.key === PASS_UNLOCKED_PROOF_KEY && ev.newValue) {
      onUnlocked({ proof: ev.newValue });
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    ch?.close();
    window.removeEventListener("storage", onStorage);
  };
}

export function markConsultationPassUnlocked(proof: string, sessionId?: string): void {
  if (typeof window === "undefined") return;
  try {
    const cleanProof = (proof || "").trim() || `verified_${Date.now()}`;
    localStorage.setItem(PASS_UNLOCKED_PROOF_KEY, cleanProof);
    window.dispatchEvent(new Event("ouija_consultation_allowance_changed"));
    broadcastPaymentUnlock(cleanProof, sessionId);
  } catch {
    // ignore
  }
}

export function isConsultationPassUnlocked(cfg: MonetizationConfig): boolean {
  if (typeof window === "undefined") return false;
  try {
    const serverProof = localStorage.getItem(PASS_UNLOCKED_PROOF_KEY);
    if (serverProof && serverProof.length >= 10) {
      return true;
    }
    const storedHash = localStorage.getItem(PASS_UNLOCKED_KEY);
    if (!storedHash) return false;
    if (cfg.unlockCodeHash) {
      return storedHash === cfg.unlockCodeHash;
    }
    return storedHash === "manual_unlocked";
  } catch {
    return false;
  }
}

export async function verifyAndUnlockPass(
  rawCode: string,
  cfg: MonetizationConfig
): Promise<boolean> {
  const clean = rawCode.trim();
  if (!clean) return false;

  // Try server verification first (handles autoReturnTokenHash, unlockCodeHash, or MP payment lookup)
  try {
    const visitorId = getOrCreateVisitorId();
    const sessionId = getActivePaymentSessionId();
    const res = await fetch("/api/payments/verify-return", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: clean, sessionId, visitorId }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.approved && json?.approvalProof) {
        markConsultationPassUnlocked(json.approvalProof, json.sessionId);
        return true;
      }
    }
  } catch {
    // Fallback to client hash check below
  }

  const candidateUpper = await sha256Hex(clean);
  const candidateExact = await sha256ExactHex(clean);
  const matchesUnlock = Boolean(cfg.unlockCodeHash && candidateUpper === cfg.unlockCodeHash);
  const matchesReturn = Boolean(
    cfg.autoReturnTokenHash &&
      (candidateExact === cfg.autoReturnTokenHash || candidateUpper === cfg.autoReturnTokenHash)
  );

  if (matchesUnlock || matchesReturn) {
    try {
      localStorage.setItem(PASS_UNLOCKED_KEY, matchesUnlock ? candidateUpper : candidateExact);
      markConsultationPassUnlocked(`local_${candidateUpper.slice(0, 24)}`);
    } catch {
      // ignore
    }
    return true;
  }
  return false;
}

export function savePendingConsultation(item: PendingConsultation): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PENDING_CONSULTATION_KEY, JSON.stringify(item));
  } catch {
    // ignore
  }
}

export function getPendingConsultation(): PendingConsultation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_CONSULTATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingConsultation;
    if (!parsed || !parsed.id || !parsed.type) return null;
    // Expire pending consultations older than 2 hours
    if (Date.now() - (parsed.createdAt || 0) > 2 * 60 * 60 * 1000) {
      localStorage.removeItem(PENDING_CONSULTATION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingConsultation(id?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (id) {
      const current = getPendingConsultation();
      if (current && current.id !== id) return;
    }
    localStorage.removeItem(PENDING_CONSULTATION_KEY);
  } catch {
    // ignore
  }
}

export function claimPendingConsultation(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const already = localStorage.getItem(CLAIMED_PENDING_KEY);
    if (already === id) return false;
    localStorage.setItem(CLAIMED_PENDING_KEY, id);
    localStorage.removeItem(PENDING_CONSULTATION_KEY);
    return true;
  } catch {
    return true;
  }
}

export function setActivePaymentSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_SESSION_ID_KEY, sessionId);
  } catch {
    // ignore
  }
}

export function getActivePaymentSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(ACTIVE_SESSION_ID_KEY) || "";
  } catch {
    return "";
  }
}

const TAB_INSTANCE_ID =
  typeof window !== "undefined"
    ? `tab_${Math.random().toString(36).slice(2, 10)}`
    : "tab_ssr";

export function setPaywallModalHeartbeat(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      PAYWALL_HEARTBEAT_KEY,
      JSON.stringify({ tabId: TAB_INSTANCE_ID, ts: Date.now() })
    );
  } catch {
    // ignore
  }
}

export function clearPaywallModalHeartbeat(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PAYWALL_HEARTBEAT_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.tabId === TAB_INSTANCE_ID) {
      localStorage.removeItem(PAYWALL_HEARTBEAT_KEY);
    }
  } catch {
    // ignore
  }
}

export function isPaywallModalActiveInAnotherTab(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(PAYWALL_HEARTBEAT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.tabId === TAB_INSTANCE_ID) return false;
    return Date.now() - Number(parsed.ts || 0) < 4500;
  } catch {
    return false;
  }
}

export function getRemainingFreeConsultations(cfg: MonetizationConfig): number {
  if (!cfg.paywallEnabled) return Infinity;
  const used = getFreeConsultationsUsed();
  return Math.max(0, cfg.freeConsultationsLimit - used);
}

export function canPerformConsultation(
  cfg: MonetizationConfig,
  isCreatorOrAdmin: boolean
): boolean {
  if (isCreatorOrAdmin) return true;
  if (!cfg.paywallEnabled) return true;
  if (isConsultationPassUnlocked(cfg)) return true;
  return getRemainingFreeConsultations(cfg) > 0;
}

let currentConfig: MonetizationConfig = (() => {
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(LOCAL_FALLBACK_KEY);
      if (cached) {
        return sanitizeMonetizationConfig(JSON.parse(cached));
      }
    } catch {
      // ignore
    }
  }
  return { ...DEFAULT_MONETIZATION_CONFIG };
})();

const listeners = new Set<(cfg: MonetizationConfig) => void>();
let firestoreUnsub: (() => void) | null = null;

function notifyAll() {
  listeners.forEach((cb) => cb(currentConfig));
}

function startFirestoreSync() {
  if (firestoreUnsub) return;
  const configRef = doc(db, "config", "monetization");
  firestoreUnsub = onSnapshot(
    configRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<MonetizationConfig>;
        currentConfig = sanitizeMonetizationConfig(data);
        try {
          localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(currentConfig));
        } catch {
          // ignore
        }
        notifyAll();
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, "config/monetization");
      } catch {
        // Logged via handleFirestoreError
      }
    }
  );
}

export function useMonetizationConfig(): MonetizationConfig {
  const [config, setConfig] = useState<MonetizationConfig>(currentConfig);

  useEffect(() => {
    listeners.add(setConfig);
    startFirestoreSync();
    setConfig(currentConfig);

    return () => {
      listeners.delete(setConfig);
      if (listeners.size === 0 && firestoreUnsub) {
        firestoreUnsub();
        firestoreUnsub = null;
      }
    };
  }, []);

  return config;
}

export async function saveMonetizationConfigToFirestore(
  input: Partial<MonetizationConfig>
): Promise<MonetizationConfig> {
  const clean = sanitizeMonetizationConfig(input);
  const configRef = doc(db, "config", "monetization");
  try {
    await setDoc(configRef, {
      ...clean,
      updatedAt: serverTimestamp(),
    });
    currentConfig = clean;
    try {
      localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(clean));
    } catch {
      // ignore
    }
    notifyAll();
    return clean;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "config/monetization");
  }
}
