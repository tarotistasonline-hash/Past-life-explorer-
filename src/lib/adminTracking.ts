/**
 * Creator & Admin Traffic Filter Utility & Exclusive Configuration Access
 * Strictly restricts configuration and creator options to tarotistasonline@gmail.com
 */

const STORAGE_KEY = "ouija_creator_exclude_visits_v2";
const AUTH_KEY = "ouija_admin_authorized_tarotista";

export function isAuthorizedAdmin(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const isAuth = localStorage.getItem(AUTH_KEY);
    return isAuth === "true";
  } catch (e) {
    return false;
  }
}

export function authorizeAdmin(input: string): boolean {
  if (typeof window === "undefined") return false;
  const clean = input.trim().toLowerCase();
  
  // STRICT SECURITY: Only the verified owner email can unlock
  if (clean === "tarotistasonline@gmail.com") {
    localStorage.setItem(AUTH_KEY, "true");
    window.dispatchEvent(new CustomEvent("ouija-admin-auth-change", { detail: { isAuthorized: true } }));
    return true;
  }
  return false;
}

export function deauthorizeAdmin(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new CustomEvent("ouija-admin-auth-change", { detail: { isAuthorized: false } }));
}

export function isAdminSession(): boolean {
  if (typeof window === "undefined") return false;

  try {
    if (localStorage.getItem("ouija_creator_mode_v1") !== null) {
      localStorage.removeItem("ouija_creator_mode_v1");
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") return true;
    if (saved === "false") return false;

    // Only exclude if explicitly requested via query parameter
    const search = window.location.search || "";
    if (search.includes("creator_exclude=true") || search.includes("admin_exclude=true")) {
      localStorage.setItem(STORAGE_KEY, "true");
      return true;
    }
  } catch (e) {
    // ignore
  }

  return false;
}

export function setAdminSession(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
    window.dispatchEvent(new CustomEvent("ouija-creator-mode-change", { detail: { isAdmin: enabled } }));
  } catch (e) {
    console.warn("Could not save creator mode state", e);
  }
}

export function getAdminHeaders(): Record<string, string> {
  if (isAdminSession()) {
    return { "x-admin-exclude": "true" };
  }
  return {};
}

