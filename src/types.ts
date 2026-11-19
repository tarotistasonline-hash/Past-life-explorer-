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
  narrationText?: string;
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
  onlineVisitors?: number;
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

export type AstroElement = "Fuego" | "Tierra" | "Aire" | "Agua";
export type AstroModality = "Cardinal" | "Fijo" | "Mutable";

export interface NatalTimezoneResolution {
  ianaZone: string;
  offsetHours: number;
  offsetLabel: string;
  standardOffsetHours: number;
  isDst: boolean;
  dstNote: string;
  resolutionMethod: "argentina-historical" | "iana-historical" | "static-fallback" | "manual-override";
}

export interface NatalBodyPosition {
  id: string;
  name: string;
  glyph: string;
  sign: string;
  signId: string;
  signSymbol: string;
  degree: number;
  minutes: number;
  totalDegree: number;
  house: number;
  element: AstroElement;
  modality: AstroModality;
  ruler: string;
  meaning: string;
  isRetrograde?: boolean;
}

export interface NatalHouseCusp {
  house: number;
  sign: string;
  signId: string;
  signSymbol: string;
  degree: number;
  minutes: number;
  totalDegree: number;
  ruler: string;
  lifeArea: string;
}

export interface NatalAspect {
  planet1: string;
  planet2: string;
  planet1Id: string;
  planet2Id: string;
  planet1Glyph: string;
  planet2Glyph: string;
  type: "Conjunción" | "Sextil" | "Cuadratura" | "Trígono" | "Oposición";
  symbol: string;
  angle: number;
  orb: number;
  nature: "harmonic" | "dynamic";
  title: string;
  description: string;
  evolutionaryGift: string;
}

export interface NatalChartData {
  seekerName: string;
  birthDate: string;
  birthTime: string;
  hasExactTime: boolean;
  birthCity: string;
  birthCountry: string;
  locationSummary: string;
  latitude: number;
  longitude: number;
  timezone: number;
  timezoneInfo: NatalTimezoneResolution;
  utcIso: string;
  sun: NatalBodyPosition;
  moon: NatalBodyPosition;
  ascendant: NatalBodyPosition;
  midheaven: NatalBodyPosition;
  northNode: NatalBodyPosition;
  planets: NatalBodyPosition[];
  houses: NatalHouseCusp[];
  aspects: NatalAspect[];
  elements: {
    fuego: number;
    tierra: number;
    aire: number;
    agua: number;
  };
  dominantElement: AstroElement;
  modalities: {
    cardinal: number;
    fijo: number;
    mutable: number;
  };
  dominantModality: AstroModality;
  solfeggioFrequency: number;
  boardKeyword: string;
}

export interface NatalChartReading {
  energyHeadline: string;
  sunEssence: string;
  moonSanctuary: string;
  ascendantDestiny: string;
  vocationalLegacy: string;
  lifePurpose: string;
  elementalBalance: string;
  aspectsInterpretation: string;
  grandNarrative: string;
  cosmicAffirmation: string;
  isAiEnhanced?: boolean;
}



