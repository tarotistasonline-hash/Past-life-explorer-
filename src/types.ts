export type SupportedLanguage = "es" | "en" | "pt" | "fr" | "it" | "de";

export interface PastLifeDetails {
  title: string;
  eraLocation: string;
  identityRole: string;
  narrative: string;
  deathTransition: string;
  karmicLesson: string;
  soulConnection: string;
  soulRelic: string;
  vibeColor: string;
  imageUrl?: string;
}

export interface PastLifeRevelation {
  id: string;
  timestamp: number;
  seekerName: string;
  spelledWord: string;
  pastLifeDetails: PastLifeDetails;
}

export interface SpiritResponse {
  spelledWord: string;
  answerType: "YES" | "NO" | "SPELLOUT";
  spiritMessage: string;
  spiritName: string;
}

export interface LetterCoord {
  char: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export type BoardMode = "IDLE" | "SPELLING" | "REVEALED" | "MANUAL";

export interface VisitsStats {
  totalVisits: number;
  todayVisits: number;
  totalConsultations: number;
  uniqueVisitorsCount: number;
  lastUpdated?: string;
}

export interface DailyArcana {
  id: number; // 0 to 21
  romanNumber: string;
  name: string;
  englishName: string;
  archetype: string;
  element: "Fuego" | "Agua" | "Aire" | "Tierra" | "Éter";
  astrologicalSign: string;
  keywords: string[];
  colorHex: string;
  symbolGlyph: string;
  cosmicEnergy: string;
  dailyMessage: string;
  lightAspect: string;
  shadowAspect: string;
  practicalAdvice: string;
  dailyAffirmation: string;
  meditationQuestion: string;
  marseilleTitle?: string;
  marseilleDetails?: string;
  dateKey?: string;
  isPersonalDraw?: boolean;
}

export interface TarotDailyResponse {
  arcana: DailyArcana;
  isAiEnhanced: boolean;
  cosmicDate: string;
  dayAspect: string;
}


