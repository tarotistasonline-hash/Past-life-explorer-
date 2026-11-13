import { DEFAULT_MP_LINK } from "./monetization";

const STORAGE_KEY = "ouija_coffee_link";
export const DEFAULT_COFFEE_LINK = DEFAULT_MP_LINK;

export function getDonationLink(): string {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim().startsWith("http")) {
        return saved.trim();
      }
    } catch {
      // ignore
    }
  }
  return DEFAULT_COFFEE_LINK;
}

export function setDonationLink(newLink: string): void {
  if (typeof window !== "undefined") {
    try {
      if (!newLink || !newLink.trim()) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, newLink.trim());
      }
      window.dispatchEvent(new Event("ouija_coffee_link_updated"));
    } catch {
      // ignore
    }
  }
}
