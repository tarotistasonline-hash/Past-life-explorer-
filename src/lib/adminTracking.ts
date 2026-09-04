/**
 * Creator & Admin Traffic Filter Utility
 * Allows the website creator/owner to optionally exclude their visits and test consultations
 * from public metrics if explicitly chosen via the Atmosphere Controls menu.
 */

const STORAGE_KEY = "ouija_creator_exclude_visits_v2";

export function isAdminSession(): boolean {
  if (typeof window === "undefined") return false;

  try {
    // Clear legacy automatic exclusion key that falsely locked dev/test users out of the counter
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

  // By default, ALL visits and consultations count towards real traffic metrics
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

