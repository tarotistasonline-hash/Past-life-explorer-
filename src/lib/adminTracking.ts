import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from "@simplewebauthn/browser";
import { auth } from "./firebase";

/**
 * Creator & Admin Authentication Utility.
 * Supports:
 * 1) Verified Numeric PIN (scrypt-hashed on server, Bearer session token in JS memory only)
 * 2) Biometric / Fingerprint Passkey (WebAuthn verified on server, Bearer session token in JS memory only)
 * 3) Verified Firebase Google Sign-In for tarotistasonline@gmail.com
 */

export const OWNER_EMAIL = "tarotistasonline@gmail.com";
const STORAGE_KEY = "ouija_creator_exclude_visits_v2";
const LEGACY_AUTH_KEY = "ouija_admin_authorized_tarotista";

// Server-signed admin session token held strictly in JS memory (never in localStorage/sessionStorage)
let memoryAdminToken: string | null = null;
let memoryAdminExpiresAt = 0;

if (typeof window !== "undefined") {
  try {
    localStorage.removeItem(LEGACY_AUTH_KEY);
  } catch {
    // ignore
  }
}

export interface AdminAuthCapabilities {
  pinConfigured: boolean;
  pinEnvConfigured: boolean;
  canSetupInitialPin: boolean;
  webauthnConfigured: boolean;
  webauthnTotalCount: number;
  webauthnRpId: string | null;
}

function hasValidMemoryAdminToken(): boolean {
  if (!memoryAdminToken) return false;
  if (Date.now() >= memoryAdminExpiresAt) {
    memoryAdminToken = null;
    memoryAdminExpiresAt = 0;
    return false;
  }
  return true;
}

function isFirebaseOwnerSignedIn(): boolean {
  if (typeof window === "undefined") return false;
  const user = auth.currentUser;
  return Boolean(
    user &&
      user.email?.toLowerCase() === OWNER_EMAIL &&
      user.emailVerified === true
  );
}

function emitAuthStateChanged() {
  if (typeof window === "undefined") return;
  const ok = isAuthorizedAdmin();
  window.dispatchEvent(
    new CustomEvent("ouija-admin-auth-change", {
      detail: { isAuthorized: ok },
    })
  );
  window.dispatchEvent(
    new CustomEvent("ouija-creator-mode-change", {
      detail: { isAdmin: ok && isAdminSession() },
    })
  );
}

function applyMemoryAdminToken(token: string, expiresAt: number) {
  memoryAdminToken = token;
  memoryAdminExpiresAt = expiresAt;
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // ignore
  }
  emitAuthStateChanged();
}

export function isAuthorizedAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return isFirebaseOwnerSignedIn() || hasValidMemoryAdminToken();
}

export function subscribeAdminAuth(
  callback: (isAdmin: boolean) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  return onAuthStateChanged(auth, () => {
    const ok = isAuthorizedAdmin();
    callback(ok);
    emitAuthStateChanged();
  });
}

export async function getAdminAuthCapabilities(): Promise<AdminAuthCapabilities> {
  try {
    const res = await fetch("/api/admin/auth-capabilities", { cache: "no-store" });
    if (res.ok) {
      return (await res.json()) as AdminAuthCapabilities;
    }
  } catch {
    // fallback below
  }
  return {
    pinConfigured: false,
    pinEnvConfigured: false,
    canSetupInitialPin: false,
    webauthnConfigured: false,
    webauthnTotalCount: 0,
    webauthnRpId: null,
  };
}

export async function setupInitialAdminPin(
  pin: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/pin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pin.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok || !data?.token) {
      return { ok: false, error: data?.error || "No se pudo crear el PIN." };
    }
    applyMemoryAdminToken(data.token, Number(data.expiresAt) || Date.now() + 12 * 3600 * 1000);
    return { ok: true };
  } catch {
    return { ok: false, error: "Error de conexión al guardar el PIN." };
  }
}

export async function loginAdminWithPin(
  pin: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/pin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pin.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok || !data?.token) {
      return { ok: false, error: data?.error || "Código numérico incorrecto." };
    }
    applyMemoryAdminToken(data.token, Number(data.expiresAt) || Date.now() + 12 * 3600 * 1000);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo verificar el código numérico." };
  }
}

export async function changeAdminPin(
  pin: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const authHeaders = await getAdminAuthHeaders();
    const res = await fetch("/api/admin/pin/change", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ pin: pin.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      return { ok: false, error: data?.error || "No se pudo actualizar el PIN." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Error de conexión al actualizar el PIN." };
  }
}

export function isBiometricSupported(): boolean {
  return typeof window !== "undefined" && browserSupportsWebAuthn();
}

export async function registerAdminBiometric(
  label?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isBiometricSupported()) {
    return {
      ok: false,
      error: "Este navegador o dispositivo no soporta huella digital / biometría web.",
    };
  }
  try {
    const authHeaders = await getAdminAuthHeaders();
    const optRes = await fetch("/api/admin/webauthn/register-options", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({}),
    });
    const optData = await optRes.json().catch(() => ({}));
    if (!optRes.ok || !optData?.options || !optData?.challengeId) {
      return {
        ok: false,
        error: optData?.error || "No se pudo iniciar el registro biométrico.",
      };
    }

    const attResp = await startRegistration({ optionsJSON: optData.options });

    const verRes = await fetch("/api/admin/webauthn/register-verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({
        challengeId: optData.challengeId,
        response: attResp,
        label: label || navigator.userAgent.slice(0, 48),
      }),
    });
    const verData = await verRes.json().catch(() => ({}));
    if (!verRes.ok || !verData?.ok) {
      return {
        ok: false,
        error: verData?.error || "No se pudo guardar la huella digital.",
      };
    }
    return { ok: true };
  } catch (err: any) {
    const name = err?.name || "";
    const msg = String(err?.message || "");
    if (name === "NotAllowedError") {
      if (msg.toLowerCase().includes("iframe") || window.self !== window.top) {
        return {
          ok: false,
          error:
            "El lector de huellas requiere abrir la app directamente en una pestaña del navegador (no dentro de la vista previa). Mientras tanto puedes usar tu código PIN.",
        };
      }
      return { ok: false, error: "Registro de huella cancelado o no autorizado." };
    }
    if (name === "InvalidStateError") {
      return { ok: false, error: "Este dispositivo ya tiene su huella registrada." };
    }
    return {
      ok: false,
      error: "No se pudo registrar la huella en este navegador. Puedes usar tu código PIN.",
    };
  }
}

export async function loginAdminWithBiometric(): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!isBiometricSupported()) {
    return {
      ok: false,
      error: "Tu navegador actual no soporta biometría web. Usa tu código PIN.",
    };
  }
  try {
    const optRes = await fetch("/api/admin/webauthn/login-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const optData = await optRes.json().catch(() => ({}));
    if (!optRes.ok || !optData?.options || !optData?.challengeId) {
      return {
        ok: false,
        error:
          optData?.error ||
          "Todavía no hay una huella registrada en este enlace. Entra primero con tu PIN o Google para activarla.",
      };
    }

    const assertion = await startAuthentication({ optionsJSON: optData.options });

    const verRes = await fetch("/api/admin/webauthn/login-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengeId: optData.challengeId,
        response: assertion,
      }),
    });
    const verData = await verRes.json().catch(() => ({}));
    if (!verRes.ok || !verData?.ok || !verData?.token) {
      return { ok: false, error: verData?.error || "Huella no reconocida." };
    }
    applyMemoryAdminToken(verData.token, Number(verData.expiresAt) || Date.now() + 12 * 3600 * 1000);
    return { ok: true };
  } catch (err: any) {
    const name = err?.name || "";
    if (name === "NotAllowedError") {
      if (window.self !== window.top) {
        return {
          ok: false,
          error:
            "El lector de huellas solo funciona abriendo el enlace directo en Chrome/Safari (fuera de la vista previa). Usa tu PIN aquí.",
        };
      }
      return { ok: false, error: "Lectura de huella cancelada." };
    }
    return { ok: false, error: "No se pudo verificar la huella. Intenta con tu código PIN." };
  }
}

export async function signInOwnerWithGoogle(): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (typeof window === "undefined") {
    return { ok: false, error: "Entorno no disponible." };
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
      login_hint: OWNER_EMAIL,
    });

    const result = await signInWithPopup(auth, provider);
    const email = result.user.email?.toLowerCase() || "";

    if (email !== OWNER_EMAIL || !result.user.emailVerified) {
      await signOut(auth).catch(() => {});
      return {
        ok: false,
        error: `Acceso denegado. Debes iniciar sesión con la cuenta verificada ${OWNER_EMAIL}.`,
      };
    }

    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }

    emitAuthStateChanged();
    return { ok: true };
  } catch (err: any) {
    const code = err?.code || "";
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return { ok: false, error: "Inicio de sesión cancelado." };
    }
    if (code === "auth/popup-blocked") {
      return {
        ok: false,
        error: "El navegador bloqueó la ventana emergente. Permite popups para iniciar sesión.",
      };
    }
    return {
      ok: false,
      error: "No se pudo verificar tu cuenta de Google. Intenta con tu PIN numérico.",
    };
  }
}

export async function deauthorizeAdmin(): Promise<void> {
  if (typeof window === "undefined") return;
  memoryAdminToken = null;
  memoryAdminExpiresAt = 0;
  try {
    localStorage.removeItem(LEGACY_AUTH_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  await signOut(auth).catch(() => {});
  emitAuthStateChanged();
}

export function isAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  if (!isAuthorizedAdmin()) return false;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "false") return false;
    return true;
  } catch {
    return true;
  }
}

export function setAdminSession(enabled: boolean): void {
  if (typeof window === "undefined") return;
  if (!isAuthorizedAdmin()) return;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
    window.dispatchEvent(
      new CustomEvent("ouija-creator-mode-change", {
        detail: { isAdmin: enabled },
      })
    );
  } catch (e) {
    console.warn("Could not save creator mode state", e);
  }
}

export async function getAdminAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  if (isFirebaseOwnerSignedIn() && auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers.Authorization = `Bearer ${token}`;
    } catch {
      // fall through to memory token if present
    }
  }

  if (!headers.Authorization && hasValidMemoryAdminToken() && memoryAdminToken) {
    headers.Authorization = `Bearer ${memoryAdminToken}`;
  }

  if (!headers.Authorization) return {};

  if (isAdminSession()) {
    headers["x-admin-exclude"] = "true";
  }
  return headers;
}

export function getAdminHeaders(): Record<string, string> {
  if (isAdminSession()) {
    return { "x-admin-exclude": "true" };
  }
  return {};
}
