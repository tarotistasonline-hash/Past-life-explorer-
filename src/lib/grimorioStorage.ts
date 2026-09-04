import { PastLifeRevelation, DailyArcana } from "../types";

export interface ThreeCardSpreadResult {
  id: string;
  timestamp: number;
  seekerName: string;
  queryTopic: string;
  pastCard: DailyArcana;
  presentCard: DailyArcana;
  futureCard: DailyArcana;
  synthesis: string;
}

export interface GrimorioRecord {
  id: string;
  timestamp: number;
  type: "PAST_LIFE" | "DAILY_TAROT" | "THREE_CARD_SPREAD";
  title: string;
  seekerName: string;
  dateFormatted: string;
  pastLifeData?: PastLifeRevelation;
  dailyTarotData?: DailyArcana;
  spreadData?: ThreeCardSpreadResult;
}

const GRIMORIO_STORAGE_KEY = "ouija_grimorio_records_v1";

export function getGrimorioRecords(): GrimorioRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GRIMORIO_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Could not read Grimorio storage", e);
    return [];
  }
}

export function savePastLifeToGrimorio(revelation: PastLifeRevelation, langLocale = "es-ES"): GrimorioRecord {
  const records = getGrimorioRecords();
  const existingIdx = records.findIndex((r) => r.id === revelation.id);

  const newRecord: GrimorioRecord = {
    id: revelation.id,
    timestamp: revelation.timestamp || Date.now(),
    type: "PAST_LIFE",
    title: revelation.pastLifeDetails.title,
    seekerName: revelation.seekerName || "Buscador",
    dateFormatted: new Date(revelation.timestamp || Date.now()).toLocaleDateString(langLocale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    pastLifeData: revelation,
  };

  let updated: GrimorioRecord[];
  if (existingIdx >= 0) {
    updated = [...records];
    updated[existingIdx] = newRecord;
  } else {
    updated = [newRecord, ...records];
  }

  try {
    localStorage.setItem(GRIMORIO_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
    window.dispatchEvent(new CustomEvent("ouija-grimorio-updated"));
  } catch (e) {
    console.warn("Could not save to Grimorio", e);
  }

  return newRecord;
}

export function saveSpreadToGrimorio(spread: ThreeCardSpreadResult, langLocale = "es-ES"): GrimorioRecord {
  const records = getGrimorioRecords();
  const newRecord: GrimorioRecord = {
    id: spread.id,
    timestamp: spread.timestamp || Date.now(),
    type: "THREE_CARD_SPREAD",
    title: `${spread.pastCard.name} • ${spread.presentCard.name} • ${spread.futureCard.name}`,
    seekerName: spread.seekerName || "Buscador",
    dateFormatted: new Date(spread.timestamp || Date.now()).toLocaleDateString(langLocale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    spreadData: spread,
  };

  const updated = [newRecord, ...records.filter((r) => r.id !== spread.id)].slice(0, 50);

  try {
    localStorage.setItem(GRIMORIO_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("ouija-grimorio-updated"));
  } catch (e) {
    console.warn("Could not save to Grimorio", e);
  }

  return newRecord;
}

export function deleteGrimorioRecord(id: string): void {
  const records = getGrimorioRecords();
  const filtered = records.filter((r) => r.id !== id);
  try {
    localStorage.setItem(GRIMORIO_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent("ouija-grimorio-updated"));
  } catch (e) {
    console.warn("Could not delete Grimorio record", e);
  }
}

export function clearAllGrimorio(): void {
  try {
    localStorage.removeItem(GRIMORIO_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("ouija-grimorio-updated"));
  } catch (e) {
    console.warn("Could not clear Grimorio", e);
  }
}
