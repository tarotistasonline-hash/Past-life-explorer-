import { SupportedLanguage } from "../types";

export interface MoonPhaseInfo {
  phaseName: string;
  phaseCode: "NEW" | "WAXING_CRESCENT" | "FIRST_QUARTER" | "WAXING_GIBBOUS" | "FULL" | "WANING_GIBBOUS" | "LAST_QUARTER" | "WANING_CRESCENT";
  illuminationPct: number;
  symbol: string;
  mysticInfluence: string;
  astrologicalAdvice: string;
  ageDays: number;
}

/**
 * Calculates current Moon phase based on synodic month (~29.53058867 days)
 */
export function getMoonPhase(date: Date = new Date(), lang: SupportedLanguage = "es"): MoonPhaseInfo {
  // Known reference new moon: 2000-01-06 18:14 UTC
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0)).getTime();
  const synodicMonthMs = 29.53058867 * 24 * 60 * 60 * 1000;
  
  const diff = date.getTime() - knownNewMoon;
  const phaseCycles = (diff % synodicMonthMs + synodicMonthMs) % synodicMonthMs;
  const ageDays = phaseCycles / (24 * 60 * 60 * 1000);
  
  // Normalized 0..1 phase
  const normalized = ageDays / 29.53058867;
  
  // Illumination percentage approximation (0 to 100%)
  const illuminationPct = Math.round((1 - Math.cos(normalized * 2 * Math.PI)) / 2 * 100);

  let phaseCode: MoonPhaseInfo["phaseCode"] = "NEW";
  let symbol = "🌑";

  if (normalized >= 0.97 || normalized < 0.03) {
    phaseCode = "NEW";
    symbol = "🌑";
  } else if (normalized < 0.22) {
    phaseCode = "WAXING_CRESCENT";
    symbol = "🌒";
  } else if (normalized < 0.28) {
    phaseCode = "FIRST_QUARTER";
    symbol = "🌓";
  } else if (normalized < 0.47) {
    phaseCode = "WAXING_GIBBOUS";
    symbol = "🌔";
  } else if (normalized < 0.53) {
    phaseCode = "FULL";
    symbol = "🌕";
  } else if (normalized < 0.72) {
    phaseCode = "WANING_GIBBOUS";
    symbol = "🌖";
  } else if (normalized < 0.78) {
    phaseCode = "LAST_QUARTER";
    symbol = "🌗";
  } else {
    phaseCode = "WANING_CRESCENT";
    symbol = "🌘";
  }

  const translations: Record<SupportedLanguage, Record<MoonPhaseInfo["phaseCode"], { name: string; influence: string; advice: string }>> = {
    es: {
      NEW: {
        name: "Luna Nueva",
        influence: "Velo de Introspección y Nuevos Comienzos",
        advice: "El cosmos te invita a sembrar intenciones en silencio. Los recuerdos del alma emergen como semillas en la oscuridad.",
      },
      WAXING_CRESCENT: {
        name: "Luna Creciente",
        influence: "Impulso Creativo y Despertar de la Intuición",
        advice: "Las energías invisibles comienzan a brotar. Es momento de dar los primeros pasos hacia lo que el oráculo te susurra.",
      },
      FIRST_QUARTER: {
        name: "Cuarto Creciente",
        influence: "Decisión Kármica y Superación de Obstáculos",
        advice: "Tus vidas pasadas te recuerdan el coraje de actuar ante la incertidumbre. Confía en tu fuerza interior.",
      },
      WAXING_GIBBOUS: {
        name: "Gibosa Creciente",
        influence: "Afinamiento Espiritual y Revelación Progresiva",
        advice: "Los patrones del destino se clarifican. Mantén la devoción hacia tu verdad más profunda.",
      },
      FULL: {
        name: "Luna Llena",
        influence: "Máximo Poder Canalizador y Velo Transparente",
        advice: "Los canales espirituales están en su punto culminante. Las revelaciones son lúcidas, directas y sanadoras.",
      },
      WANING_GIBBOUS: {
        name: "Gibosa Menguante",
        influence: "Gratitud, Integración y Sabiduría Ancestral",
        advice: "Momento propicio para asimilar las lecciones de vidas pasadas y compartir luz con tu entorno.",
      },
      LAST_QUARTER: {
        name: "Cuarto Menguante",
        influence: "Liberación de Lazos y Perdón Kármico",
        advice: "Corta con votos y patrones antiguos que ya no sirven a tu evolución. El pasado te libera si lo aceptas.",
      },
      WANING_CRESCENT: {
        name: "Luna Balsámica (Menguante)",
        influence: "Reposo Místico y Purificación del Alma",
        advice: "Limpia tus energías y descansa tu mente. Los guías espirituales te preparan para un nuevo ciclo de luz.",
      },
    },
    en: {
      NEW: {
        name: "New Moon",
        influence: "Veil of Introspection and New Beginnings",
        advice: "The cosmos invites you to plant seeds in silence. Soul memories stir in the sacred darkness.",
      },
      WAXING_CRESCENT: {
        name: "Waxing Crescent",
        influence: "Creative Spark & Awakening Intuition",
        advice: "Subtle currents are rising. Take your first deliberate steps toward what the oracle reveals.",
      },
      FIRST_QUARTER: {
        name: "First Quarter",
        influence: "Karmic Resolve & Breakthrough",
        advice: "Your past incarnations echo courage in the face of doubt. Trust your internal guidance.",
      },
      WAXING_GIBBOUS: {
        name: "Waxing Gibbous",
        influence: "Spiritual Refinement & Deepening Insight",
        advice: "Destiny's tapestry is becoming clear. Cultivate patient devotion to your inner calling.",
      },
      FULL: {
        name: "Full Moon",
        influence: "Peak Channeling & The Thinning Veil",
        advice: "Spiritual conduits are wide open. Revelations arrive with lucid, luminous healing power.",
      },
      WANING_GIBBOUS: {
        name: "Waning Gibbous",
        influence: "Ancestral Wisdom & Soul Integration",
        advice: "Assimilate past life lessons with gratitude. Release what has completed its cycle.",
      },
      LAST_QUARTER: {
        name: "Last Quarter",
        influence: "Karmic Forgiveness & Severing Ties",
        advice: "Dissolve obsolete soul contracts. The past unlocks when you forgive and surrender.",
      },
      WANING_CRESCENT: {
        name: "Balsamic Moon",
        influence: "Mystic Rest & Spiritual Cleansing",
        advice: "Rest your thoughts in sacred silence. Spirit guides prepare you for the next luminous dawn.",
      },
    },
    pt: {
      NEW: {
        name: "Lua Nova",
        influence: "Véu de Introspecção e Novos Começos",
        advice: "O cosmos convida a plantar intenções em silêncio.",
      },
      WAXING_CRESCENT: {
        name: "Lua Crescente",
        influence: "Despertar da Intuição e Movimento",
        advice: "As energias sutis fluem a favor do seu despertar.",
      },
      FIRST_QUARTER: {
        name: "Quarto Crescente",
        influence: "Decisão e Resolução Cármica",
        advice: "Confie na sabedoria acumulada em suas vidas passadas.",
      },
      WAXING_GIBBOUS: {
        name: "Gibosa Crescente",
        influence: "Refinamento Espiritual",
        advice: "Os caminhos do destino tornam-se mais nítidos.",
      },
      FULL: {
        name: "Lua Cheia",
        influence: "Máximo Poder de Canalização",
        advice: "O véu entre os mundos é tênue e as mensagens são vívidas.",
      },
      WANING_GIBBOUS: {
        name: "Gibosa Minguante",
        influence: "Sabedoria Ancestral e Gratidão",
        advice: "Integre as lições com serenidade e compaixão.",
      },
      LAST_QUARTER: {
        name: "Quarto Minguante",
        influence: "Libertação Cármica e Perdão",
        advice: "Corte amarras do passado que já cumpriram seu papel.",
      },
      WANING_CRESCENT: {
        name: "Lua Balsâmica",
        influence: "Purificação e Silêncio Interior",
        advice: "Descanse a mente e prepare seu espírito.",
      },
    },
    fr: {
      NEW: {
        name: "Nouvelle Lune",
        influence: "Voile d'Introspection et Renouveau",
        advice: "Plantez vos graines dans le silence sacré.",
      },
      WAXING_CRESCENT: {
        name: "Premier Croissant",
        influence: "Éveil Intuitif et Élan Créateur",
        advice: "Écoutez les premiers murmures de l'oracle.",
      },
      FIRST_QUARTER: {
        name: "Premier Quartier",
        influence: "Décision Karmique et Courage",
        advice: "Vos incarnations passées vous transmettent leur force.",
      },
      WAXING_GIBBOUS: {
        name: "Lune Gibbeuse Croissante",
        influence: "Raffinement Spirituel",
        advice: "Les vérités de l'âme se révèlent peu à peu.",
      },
      FULL: {
        name: "Pleine Lune",
        influence: "Puissance Maximale de Canalisation",
        advice: "Le voile est transparent, la clairvoyance est totale.",
      },
      WANING_GIBBOUS: {
        name: "Lune Gibbeuse Décroissante",
        influence: "Sagesse Ancestrale et Intégration",
        advice: "Intégrez les leçons reçues avec bienveillance.",
      },
      LAST_QUARTER: {
        name: "Dernier Quartier",
        influence: "Pardon et Libération des Liens",
        advice: "Libérez les schémas qui entravent votre envol.",
      },
      WANING_CRESCENT: {
        name: "Dernier Croissant",
        influence: "Repos Mystique et Purification",
        advice: "Méditez dans la paix avant le renouveau.",
      },
    },
    it: {
      NEW: {
        name: "Luna Nuova",
        influence: "Velo d'Introspezione e Nuovi Inizi",
        advice: "Semina intenzioni nel silenzio sacro.",
      },
      WAXING_CRESCENT: {
        name: "Luna Crescente",
        influence: "Risveglio Intuitivo",
        advice: "Fidati del sussurro che l'oracolo porta al tuo cuore.",
      },
      FIRST_QUARTER: {
        name: "Primo Quarto",
        influence: "Risoluzione e Azione Carmica",
        advice: "L'anima ritrova la sua antica determinazione.",
      },
      WAXING_GIBBOUS: {
        name: "Gibbosa Crescente",
        influence: "Chiarificazione Spirituale",
        advice: "La luce interiore illumina il sentiero.",
      },
      FULL: {
        name: "Luna Piena",
        influence: "Massima Canalizzazione e Velo Sottile",
        advice: "La connessione con il mondo invisibile è al culmine.",
      },
      WANING_GIBBOUS: {
        name: "Gibbosa Calante",
        influence: "Saggezza Ancestrale",
        advice: "Accogli con gratitudine la memoria akashica.",
      },
      LAST_QUARTER: {
        name: "Ultimo Quarto",
        influence: "Perdono e Liberazione",
        advice: "Lascia andare ciò che appartiene al passato.",
      },
      WANING_CRESCENT: {
        name: "Luna Balsamica",
        influence: "Purificazione e Pace",
        advice: "Riposa il tuo spirito in attesa della nuova luce.",
      },
    },
    de: {
      NEW: {
        name: "Neumond",
        influence: "Schleier der Einkehr & Neuanfänge",
        advice: "Säe deine Absichten in heiliger Stille.",
      },
      WAXING_CRESCENT: {
        name: "Zunehmende Sichel",
        influence: "Erwachen der Intuition",
        advice: "Höre auf das Flüstern deiner Seele.",
      },
      FIRST_QUARTER: {
        name: "Erstes Viertel",
        influence: "Karmischer Mut & Tatkraft",
        advice: "Deine vergangenen Leben schenken dir Zuversicht.",
      },
      WAXING_GIBBOUS: {
        name: "Zunehmender Mond",
        influence: "Geistige Reifung",
        advice: "Das Schicksal entfaltet seine Wahrheit.",
      },
      FULL: {
        name: "Vollmond",
        influence: "Höchste Hellsichtigkeit & Dünner Schleier",
        advice: "Die spirituellen Kanäle sind weit geöffnet.",
      },
      WANING_GIBBOUS: {
        name: "Abnehmender Mond",
        influence: "Ahnenweisheit & Dankbarkeit",
        advice: "Integriere die Botschaften in dein Herz.",
      },
      LAST_QUARTER: {
        name: "Letztes Viertel",
        influence: "Karmische Erlösung & Vergebung",
        advice: "Löse alte Seelenverträge in Frieden auf.",
      },
      WANING_CRESCENT: {
        name: "Balsamischer Mond",
        influence: "Mystische Reinigung",
        advice: "Finde Ruhe vor dem nächsten Lichtzyklus.",
      },
    },
  };

  const localizedData = (translations[lang] || translations.es)[phaseCode];

  return {
    phaseName: localizedData.name,
    phaseCode,
    illuminationPct,
    symbol,
    mysticInfluence: localizedData.influence,
    astrologicalAdvice: localizedData.advice,
    ageDays: Math.round(ageDays * 10) / 10,
  };
}
