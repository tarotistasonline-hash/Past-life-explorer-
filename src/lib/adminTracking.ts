import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * Creator & Admin Traffic Filter Utility & Exclusive Configuration Access.
 * Strictly requires a verified Firebase Google Sign-In for tarotistasonline@gmail.com.
 */

export const OWNER_EMAIL = "tarotistasonline@gmail.com";
const STORAGE_KEY = "ouija_creator_exclude_visits_v2";
const LEGACY_AUTH_KEY = "ouija_admin_authorized_tarotista";

if (typeof window !== "undefined") {
  try {
    // Purge legacy unverified email-only auth flag if present
    localStorage.removeItem(LEGACY_AUTH_KEY);
  } catch {
    // ignore
  }
}

export function isAuthorizedAdmin(): boolean {
  if (typeof window === "undefined") return false;
  const user = auth.currentUser;
  return Boolean(
    user &&
      user.email?.toLowerCase() === OWNER_EMAIL &&
      user.emailVerified === true
  );
}

export function subscribeAdminAuth(
  callback: (isAdmin: boolean) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  return onAuthStateChanged(auth, (user) => {
    const ok = Boolean(
      user &&
        user.email?.toLowerCase() === OWNER_EMAIL &&
        user.emailVerified === true
    );
    callback(ok);
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
  });
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

    window.dispatchEvent(
      new CustomEvent("ouija-admin-auth-change", {
        detail: { isAuthorized: true },
      })
    );
    window.dispatchEvent(
      new CustomEvent("ouija-creator-mode-change", {
        detail: { isAdmin: true },
      })
    );
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
      error: "No se pudo verificar tu cuenta de Google. Intenta nuevamente.",
    };
  }
}

export async function deauthorizeAdmin(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LEGACY_AUTH_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  await signOut(auth).catch(() => {});
  window.dispatchEvent(
    new CustomEvent("ouija-admin-auth-change", {
      detail: { isAuthorized: false },
    })
  );
  window.dispatchEvent(
    new CustomEvent("ouija-creator-mode-change", {
      detail: { isAdmin: false },
    })
  );
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
  if (!isAuthorizedAdmin() || !auth.currentUser) return {};
  try {
    const token = await auth.currentUser.getIdToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (isAdminSession()) {
      headers["x-admin-exclude"] = "true";
    }
    return headers;
  } catch {
    return {};
  }
}

export function getAdminHeaders(): Record<string, string> {
  if (isAdminSession()) {
    return { "x-admin-exclude": "true" };
  }
  return {};
}
