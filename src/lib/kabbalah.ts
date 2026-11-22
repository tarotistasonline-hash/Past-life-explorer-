import type { SupportedLanguage } from "../types";

export type KabbalahPillar = "Misericordia (Derecho)" | "Equilibrio (Central)" | "Severidad (Izquierdo)";

export interface SephiraInfo {
  number: number; // 1 to 10
  name: string;
  hebrewName: string;
  meaning: string;
  pillar: KabbalahPillar;
  archangel: string;
  planet: string;
  colorClass: string;
  accentHex: string;
  // Relative coordinates on the Tree of Life illustration (%)
  xPercent: number;
  yPercent: number;
  essence: string;
  missionCore: string;
  tikkunChallenge: string;
  spiritualGift: string;
  dailyPractice: string;
}

export interface HebrewPathInfo {
  index: number; // 0 to 21
  letter: string;
  hebrewChar: string;
  meaning: string;
  pathTitle: string;
  guidance: string;
}

export interface KabbalahProfile {
  fullName: string;
  birthDate: string;
  lifePathRaw: number;
  lifePathNumber: number; // 1-9 or 11, 22, 33
  nameGematriaRaw: number;
  nameNumber: number; // 1-9 or 11, 22, 33
  soulUrgeNumber: number;
  expressionNumber: number;
  primarySephira: SephiraInfo;
  nameSephira: SephiraInfo;
  hebrewPath: HebrewPathInfo;
  dominantPillar: KabbalahPillar;
  masterNumberNote: string | null;
}

export interface KabbalahReading {
  headline: string;
  lifeMissionSummary: string;
  sephiraConnection: string;
  nameVibrationInsight: string;
  tikkunLesson: string;
  soulGifts: string[];
  practicalAlignment: string;
  kabbalisticAffirmation: string;
  isAiEnhanced?: boolean;
}

export const SEPHIROTH: SephiraInfo[] = [
  {
    number: 1,
    name: "Kéter",
    hebrewName: "כתר",
    meaning: "La Corona · Voluntad Suprema",
    pillar: "Equilibrio (Central)",
    archangel: "Metatrón",
    planet: "Primum Mobile · Luz Infinita",
    colorClass: "text-amber-100",
    accentHex: "#fef3c7",
    xPercent: 50,
    yPercent: 13.5,
    essence: "Origen puro de la conciencia, conexión directa con la fuente creadora y propósito trascendente.",
    missionCore: "Actuar como canal de claridad, unidad e inspiración elevada, elevando la conciencia de quienes te rodean sin perder humildad.",
    tikkunChallenge: "Evitar el aislamiento espiritual o sentir que el mundo material es ajeno a tu propósito; encarnar la luz en acciones cotidianas.",
    spiritualGift: "Visión unificadora, serenidad ante las crisis y capacidad de percibir el sentido oculto detrás de cada acontecimiento.",
    dailyPractice: "Dedica 10 minutos en silencio al amanecer para alinear tu intención del día con un propósito que beneficie a otros.",
  },
  {
    number: 2,
    name: "Jojmá",
    hebrewName: "חכמה",
    meaning: "Sabiduría · Chispa Creadora",
    pillar: "Misericordia (Derecho)",
    archangel: "Raziel",
    planet: "Esfera del Zodíaco · Urano",
    colorClass: "text-amber-200",
    accentHex: "#fde68a",
    xPercent: 74.5,
    yPercent: 24,
    essence: "Relámpago de intuición pura, semilla creativa y sabiduría que precede a las palabras.",
    missionCore: "Sembrar ideas renovadoras, abrir caminos inéditos y despertar la creatividad dormida en proyectos y personas.",
    tikkunChallenge: "Transformar tus destellos geniales en constancia; no abandonar tus inspiraciones antes de darles forma tangible.",
    spiritualGift: "Intuición fulgurante, originalidad genuina y don para anticipar tendencias y verdades profundas.",
    dailyPractice: "Lleva un cuaderno para anotar ideas espontáneas y elige una sola cada semana para llevarla hasta su culminación.",
  },
  {
    number: 3,
    name: "Biná",
    hebrewName: "בינה",
    meaning: "Entendimiento · Madre Cósmica",
    pillar: "Severidad (Izquierdo)",
    archangel: "Tzaphkiel",
    planet: "Saturno",
    colorClass: "text-sky-200",
    accentHex: "#bae6fd",
    xPercent: 25.5,
    yPercent: 24,
    essence: "Matriz de comprensión profunda que convierte la inspiración en estructura, orden y sabiduría madura.",
    missionCore: "Comprender sistemas complejos, sostener procesos de largo aliento y guiar a otros con criterio sereno y estructurado.",
    tikkunChallenge: "Soltar la autoexigencia excesiva, la melancolía o el miedo a equivocarte antes de actuar.",
    spiritualGift: "Inteligencia analítica, paciencia constructiva, profundidad psicológica y capacidad de contención.",
    dailyPractice: "Antes de juzgar una situación difícil, pregúntate qué estructura oculta intenta enseñarte paciencia y madurez.",
  },
  {
    number: 4,
    name: "Jésed",
    hebrewName: "חסד",
    meaning: "Misericordia · Amor Expansivo",
    pillar: "Misericordia (Derecho)",
    archangel: "Tzadkiel",
    planet: "Júpiter",
    colorClass: "text-blue-200",
    accentHex: "#93c5fd",
    xPercent: 74.5,
    yPercent: 42,
    essence: "Generosidad incondicional, abundancia que fluye y liderazgo que protege y nutre la vida.",
    missionCore: "Expandir el bienestar colectivo mediante la generosidad, la enseñanza optimista, la hospitalidad y la cooperación.",
    tikkunChallenge: "Aprender a decir 'no' a tiempo; equilibrar el dar con el recibir para no agotarte rescatando a todos.",
    spiritualGift: "Magnetismo benévolo, fe inquebrantable, visión amplia y capacidad natural de sanar mediante el afecto.",
    dailyPractice: "Realiza un acto de generosidad consciente sin esperar reconocimiento y agradece lo recibido cada noche.",
  },
  {
    number: 5,
    name: "Guevurá",
    hebrewName: "גבורה",
    meaning: "Fuerza · Discernimiento Sagrado",
    pillar: "Severidad (Izquierdo)",
    archangel: "Kamael",
    planet: "Marte",
    colorClass: "text-rose-200",
    accentHex: "#fda4af",
    xPercent: 25.5,
    yPercent: 42,
    essence: "Valor interior, disciplina consciente, justicia y capacidad de cortar lo que ya no sirve al crecimiento.",
    missionCore: "Defender la verdad con integridad, establecer límites sanos y transformar obstáculos en temple espiritual.",
    tikkunChallenge: "Templar la dureza hacia ti mismo y hacia los demás; usar tu fuerza para proteger y ordenar, nunca desde la ira.",
    spiritualGift: "Determinación inquebrantable, coraje moral, foco láser y poder de depuración energética.",
    dailyPractice: "Canaliza tu energía física en movimiento disciplinado y practica hablar con firmeza serena en lugar de reaccionar.",
  },
  {
    number: 6,
    name: "Tiféret",
    hebrewName: "תפארת",
    meaning: "Belleza · Corazón del Árbol",
    pillar: "Equilibrio (Central)",
    archangel: "Rafael",
    planet: "Sol",
    colorClass: "text-amber-300",
    accentHex: "#fcd34d",
    xPercent: 50,
    yPercent: 50,
    essence: "Centro solar del Árbol de la Vida donde se reconcilian la misericordia y la fuerza en pura armonía.",
    missionCore: "Ser puente reconciliador, irradiar autenticidad desde el corazón y sanar divisiones mediante la belleza y la verdad.",
    tikkunChallenge: "Superar la vanidad o el deseo de aprobación externa; brillar por coherencia interior más que por aplauso.",
    spiritualGift: "Carisma equilibrado, talento sanador y artístico, empatía lúcida y capacidad de inspirar paz.",
    dailyPractice: "Lleva la mano al corazón al tomar decisiones importantes y elige aquello que honre tanto tu verdad como el bien común.",
  },
  {
    number: 7,
    name: "Nétsaj",
    hebrewName: "נצח",
    meaning: "Victoria · Eternidad Creativa",
    pillar: "Misericordia (Derecho)",
    archangel: "Haniel",
    planet: "Venus",
    colorClass: "text-emerald-200",
    accentHex: "#6ee7b7",
    xPercent: 74.5,
    yPercent: 61,
    essence: "Impulso vital, pasión estética, perseverancia emocional y amor por la belleza de la existencia.",
    missionCore: "Triunfar a través de la constancia apasionada, el arte, la música, la naturaleza y la inspiración emocional.",
    tikkunChallenge: "No dejarte arrastrar por impulsos pasajeros ni dispersar tu deseo; enfocar tu pasión en metas duraderas.",
    spiritualGift: "Sensibilidad artística, resiliencia afectiva, magnetismo creativo y entusiasmo contagioso.",
    dailyPractice: "Nutre tus sentidos con música, naturaleza o creación artística como ritual sagrado de renovación.",
  },
  {
    number: 8,
    name: "Hod",
    hebrewName: "הוד",
    meaning: "Esplendor · Verbo y Mente",
    pillar: "Severidad (Izquierdo)",
    archangel: "Miguel",
    planet: "Mercurio",
    colorClass: "text-orange-200",
    accentHex: "#fdba74",
    xPercent: 25.5,
    yPercent: 61,
    essence: "Luminosidad intelectual, comunicación precisa, estudio sagrado y capacidad de nombrar lo invisible.",
    missionCore: "Estudiar, decodificar y comunicar conocimientos profundos con honestidad, elocuencia y servicio a la verdad.",
    tikkunChallenge: "Evitar la hiper-racionalización, la duda crónica o el uso de palabras hirientes; unir mente y corazón.",
    spiritualGift: "Oratoria clara, escritura lúcida, memoria aguda y talento para traducir misterios en lenguaje comprensible.",
    dailyPractice: "Cuida la impecabilidad de tu palabra: escribe o expresa cada día una verdad constructiva con gratitud.",
  },
  {
    number: 9,
    name: "Yesod",
    hebrewName: "יסוד",
    meaning: "Fundamento · Puente Lunar",
    pillar: "Equilibrio (Central)",
    archangel: "Gabriel",
    planet: "Luna",
    colorClass: "text-indigo-200",
    accentHex: "#a5b4fc",
    xPercent: 50,
    yPercent: 70.5,
    essence: "Canal de las imágenes del alma, sueños proféticos, sexualidad sagrada y cohesión entre lo sutil y lo real.",
    missionCore: "Conectar mundos, sostener vínculos auténticos, interpretar símbolos del inconsciente y dar base fértil a los ideales.",
    tikkunChallenge: "Liberarte de espejismos emocionales, apegos ilusorios o miedos heredados para habitar relaciones sanas.",
    spiritualGift: "Intuición nocturna, empatía profunda, memoria simbólica y magnetismo conciliador.",
    dailyPractice: "Registra tus sueños o sincronicidades al despertar y fortalece tus hábitos de descanso y pureza emocional.",
  },
  {
    number: 10,
    name: "Maljut",
    hebrewName: "מלכות",
    meaning: "El Reino · Manifestación Viva",
    pillar: "Equilibrio (Central)",
    archangel: "Sandalfón",
    planet: "Tierra",
    colorClass: "text-amber-200",
    accentHex: "#fcd34d",
    xPercent: 50,
    yPercent: 85.5,
    essence: "Culminación sagrada donde toda luz espiritual toma cuerpo en obras reales, oficio, hogar y prosperidad.",
    missionCore: "Materializar visiones espirituales en proyectos concretos, cuidar la Tierra, construir legado y dignificar lo cotidiano.",
    tikkunChallenge: "Trascender el escepticismo o el apego excesivo al control material; recordar lo sagrado dentro de la materia.",
    spiritualGift: "Practicidad luminosa, capacidad ejecutiva, presencia firme y talento para convertir ideales en realidad.",
    dailyPractice: "Honra tu cuerpo, tu hogar y tu trabajo como un templo vivo: ordena un espacio concreto hoy con gratitud.",
  },
];

export const HEBREW_PATHS: HebrewPathInfo[] = [
  { index: 0, letter: "Álef", hebrewChar: "א", meaning: "Aliento Primordial", pathTitle: "Sendero del Espíritu Libre", guidance: "Confía en el salto hacia lo nuevo cuando tu alma perciba verdad." },
  { index: 1, letter: "Bet", hebrewChar: "ב", meaning: "Casa · Receptáculo", pathTitle: "Sendero del Arquitecto Interior", guidance: "Tu mente y tu hogar son templos donde la sabiduría busca habitar." },
  { index: 2, letter: "Guímel", hebrewChar: "ג", meaning: "Camello · Travesía", pathTitle: "Sendero de la Intuición Silenciosa", guidance: "Cruza el desierto de las dudas guiado por tu voz interior." },
  { index: 3, letter: "Dálet", hebrewChar: "ד", meaning: "Puerta · Fertilidad", pathTitle: "Sendero de la Puerta Abierta", guidance: "Cuando cultivas belleza y humildad, la abundancia encuentra tu puerta." },
  { index: 4, letter: "He", hebrewChar: "ה", meaning: "Ventana · Revelación", pathTitle: "Sendero de la Visión Clara", guidance: "Observa más allá de las apariencias; allí reside tu respuesta." },
  { index: 5, letter: "Vav", hebrewChar: "ו", meaning: "Clavo · Vínculo", pathTitle: "Sendero del Mediador", guidance: "Tu misión une el cielo de las ideas con la tierra de los afectos." },
  { index: 6, letter: "Zain", hebrewChar: "ז", meaning: "Espada · Elección", pathTitle: "Sendero del Discernimiento", guidance: "Elige con el corazón despierto y separa lo esencial de lo accesorio." },
  { index: 7, letter: "Jet", hebrewChar: "ח", meaning: "Cerco · Impulso Vital", pathTitle: "Sendero de la Victoria Interior", guidance: "Domina tus emociones con serenidad para avanzar imparable." },
  { index: 8, letter: "Tet", hebrewChar: "ט", meaning: "Bondad Oculta", pathTitle: "Sendero de la Fuerza Serena", guidance: "La verdadera fortaleza nace de la compasión y la templanza." },
  { index: 9, letter: "Yod", hebrewChar: "י", meaning: "Mano · Semilla de Luz", pathTitle: "Sendero del Maestro Solitario", guidance: "Tu ejemplo silencioso ilumina más que mil discursos." },
  { index: 10, letter: "Kaf", hebrewChar: "כ", meaning: "Palma · Giro del Destino", pathTitle: "Sendero de los Ciclos Sagrados", guidance: "Acepta los giros del tiempo; cada cambio te acerca a tu centro." },
  { index: 11, letter: "Lámed", hebrewChar: "ל", meaning: "Estímulo · Enseñanza", pathTitle: "Sendero del Equilibrio Justo", guidance: "Aprender y enseñar con equidad es la llave de tu evolución." },
  { index: 12, letter: "Mem", hebrewChar: "מ", meaning: "Aguas Profundas", pathTitle: "Sendero de la Transformación", guidance: "Suelta las viejas certezas para renacer con sabiduría fluida." },
  { index: 13, letter: "Nun", hebrewChar: "נ", meaning: "Pez · Continuidad", pathTitle: "Sendero de la Alquimia del Alma", guidance: "Incluso en la oscuridad germina tu renovación espiritual." },
  { index: 14, letter: "Sámej", hebrewChar: "ס", meaning: "Sostén · Círculo", pathTitle: "Sendero del Alquimista", guidance: "Integra tus opuestos internos hasta convertirlos en oro interior." },
  { index: 15, letter: "Ayin", hebrewChar: "ע", meaning: "Ojo · Mirada Profunda", pathTitle: "Sendero de la Liberación", guidance: "Reconoce tus ataduras invisibles para recuperar tu soberanía." },
  { index: 16, letter: "Pe", hebrewChar: "פ", meaning: "Boca · Verbo Creador", pathTitle: "Sendero del Despertar Súbito", guidance: "Habla tu verdad; cuando derrumbas lo falso, emerge tu luz." },
  { index: 17, letter: "Tsade", hebrewChar: "צ", meaning: "Anzuelo · Esperanza", pathTitle: "Sendero de la Estrella Guía", guidance: "Eres faro de esperanza y renovación para tu entorno." },
  { index: 18, letter: "Qof", hebrewChar: "ק", meaning: "Ojo de la Aguja", pathTitle: "Sendero del Misterio Nocturno", guidance: "Confía mientras atraviesas la penumbra; el alba ya se gesta." },
  { index: 19, letter: "Resh", hebrewChar: "ר", meaning: "Cabeza · Sol Radiante", pathTitle: "Sendero de la Plenitud Solar", guidance: "Comparte tu alegría y vitalidad sin reservas." },
  { index: 20, letter: "Shin", hebrewChar: "ש", meaning: "Fuego del Espíritu", pathTitle: "Sendero del Renacimiento", guidance: "Responde al llamado superior que transforma tu historia." },
  { index: 21, letter: "Tav", hebrewChar: "ת", meaning: "Sello · Totalidad", pathTitle: "Sendero de la Realización Cósmica", guidance: "Cierra ciclos con gratitud y corona tu obra en la Tierra." },
];

const LETTER_VALUES: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5, ñ: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function normalizeText(input: string): string {
  return (input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zñ]/g, "");
}

export function reduceKabbalahNumber(n: number, preserveMaster = true): number {
  let current = Math.abs(Math.floor(n));
  if (current === 0) return 1;
  while (current > 9) {
    if (preserveMaster && (current === 11 || current === 22 || current === 33)) {
      return current;
    }
    current = String(current)
      .split("")
      .reduce((acc, d) => acc + Number(d), 0);
  }
  return current;
}

function mapNumberToSephiraIndex(num: number, secondarySeed: number): number {
  if (num === 11) return 1; // Kéter / Jojmá crown bridge (1 -> Kéter)
  if (num === 22) return 10; // Maljut (master builder on earth)
  if (num === 33) return 6; // Tiféret (master healer of the heart)
  if (num === 1 && secondarySeed % 2 === 0) return 1; // Kéter
  if (num === 1) return 10; // Maljut when grounded
  return Math.min(10, Math.max(1, num));
}

export function calculateKabbalahProfile(fullName: string, birthDate: string): KabbalahProfile {
  const cleanName = (fullName || "Buscador de Luz").trim() || "Buscador de Luz";
  const normalizedName = normalizeText(cleanName) || "buscadordeluz";

  let nameRaw = 0;
  let vowelsRaw = 0;
  let consonantsRaw = 0;

  for (const ch of normalizedName) {
    const val = LETTER_VALUES[ch] || 0;
    nameRaw += val;
    if (VOWELS.has(ch)) {
      vowelsRaw += val;
    } else {
      consonantsRaw += val;
    }
  }

  const nameNumber = reduceKabbalahNumber(nameRaw, true);
  const soulUrgeNumber = reduceKabbalahNumber(vowelsRaw || nameRaw, true);
  const expressionNumber = reduceKabbalahNumber(consonantsRaw || nameRaw, true);

  const dateDigits = (birthDate || "1990-01-15").replace(/\D/g, "");
  const lifePathRaw = dateDigits
    .split("")
    .reduce((acc, d) => acc + Number(d), 0) || 15;
  const lifePathNumber = reduceKabbalahNumber(lifePathRaw, true);

  const primarySephiraNum = mapNumberToSephiraIndex(lifePathNumber, lifePathRaw);
  const nameSephiraNum = mapNumberToSephiraIndex(nameNumber, nameRaw);

  const primarySephira = SEPHIROTH.find((s) => s.number === primarySephiraNum) || SEPHIROTH[5];
  const nameSephira = SEPHIROTH.find((s) => s.number === nameSephiraNum) || SEPHIROTH[7];

  const pathIdx = (lifePathRaw + nameRaw) % HEBREW_PATHS.length;
  const hebrewPath = HEBREW_PATHS[pathIdx];

  let masterNumberNote: string | null = null;
  if (lifePathNumber === 11 || nameNumber === 11) {
    masterNumberNote = "Número Maestro 11 (Iluminación e Intuición): puente directo entre Kéter y el plano terrestre.";
  } else if (lifePathNumber === 22 || nameNumber === 22) {
    masterNumberNote = "Número Maestro 22 (Arquitecto del Mundo): misión de construir obras duraderas en Maljut.";
  } else if (lifePathNumber === 33 || nameNumber === 33) {
    masterNumberNote = "Número Maestro 33 (Maestro Compasivo): servicio amoroso y sanación desde Tiféret.";
  }

  return {
    fullName: cleanName,
    birthDate: birthDate || "1990-01-15",
    lifePathRaw,
    lifePathNumber,
    nameGematriaRaw: nameRaw,
    nameNumber,
    soulUrgeNumber,
    expressionNumber,
    primarySephira,
    nameSephira,
    hebrewPath,
    dominantPillar: primarySephira.pillar,
    masterNumberNote,
  };
}

export function buildLocalKabbalahReading(
  profile: KabbalahProfile,
  _language: SupportedLanguage = "es"
): KabbalahReading {
  const { fullName, primarySephira, nameSephira, hebrewPath, lifePathNumber, nameNumber } = profile;

  const headline = `${fullName}: Misión en ${primarySephira.name} (${primarySephira.hebrewName}) y Sendero ${hebrewPath.letter}`;

  const lifeMissionSummary = `Tu fecha de nacimiento (${profile.birthDate}) traza el Sendero ${lifePathNumber} del Árbol de la Vida, anclado en la Sefirá ${primarySephira.name} (${primarySephira.meaning}), sobre el ${primarySephira.pillar}. ${primarySephira.missionCore}`;

  const sephiraConnection = `La unión entre tu Sefirá Natal (${primarySephira.name}) y la Sefirá de tu Nombre (${nameSephira.name}, valor ${nameNumber}) activa el sendero de la letra hebrea ${hebrewPath.letter} (${hebrewPath.hebrewChar} — "${hebrewPath.meaning}"). ${hebrewPath.guidance}`;

  const nameVibrationInsight = `Tu nombre completo suma una vibración cabalística de ${profile.nameGematriaRaw} (reducido a ${nameNumber}), con un anhelo interior del alma en ${profile.soulUrgeNumber} y una expresión externa en ${profile.expressionNumber}. Esto indica que tu don se manifiesta al unir ${nameSephira.essence.toLowerCase()}`;

  const tikkunLesson = `Tikkún del Alma (Corrección Kármica): ${primarySephira.tikkunChallenge} Al superar esta prueba, tu energía se alinea naturalmente con el Arcángel ${primarySephira.archangel}.`;

  const soulGifts = [
    primarySephira.spiritualGift,
    `Resonancia de ${nameSephira.name}: ${nameSephira.spiritualGift}`,
    `Sendero ${hebrewPath.letter} (${hebrewPath.hebrewChar}): ${hebrewPath.pathTitle}`,
  ];

  const practicalAlignment = primarySephira.dailyPractice;
  const kabbalisticAffirmation = `En el equilibrio de ${primarySephira.name} y la luz de ${hebrewPath.letter}, honro mi misión de vida con claridad, entrega y paz.`;

  return {
    headline,
    lifeMissionSummary,
    sephiraConnection,
    nameVibrationInsight,
    tikkunLesson,
    soulGifts,
    practicalAlignment,
    kabbalisticAffirmation,
    isAiEnhanced: false,
  };
}

export function buildKabbalahSpokenScript(
  profile: KabbalahProfile,
  reading: KabbalahReading,
  lang: SupportedLanguage = "es"
): string {
  const clean = (val?: string) => (val || "").replace(/\bundefined\b/gi, "").trim();
  const isEs = lang === "es";

  if (!isEs) {
    return [
      `Kabbalistic Life Mission for ${clean(profile.fullName)}, born on ${profile.birthDate}.`,
      `Birth Sephira: ${profile.primarySephira.name}. Name Sephira: ${profile.nameSephira.name}. Hebrew Path: ${profile.hebrewPath.letter}.`,
      clean(reading.headline),
      clean(reading.lifeMissionSummary),
      clean(reading.sephiraConnection),
      clean(reading.nameVibrationInsight),
      clean(reading.tikkunLesson),
      reading.soulGifts?.length ? `Spiritual gifts: ${reading.soulGifts.join(". ")}.` : "",
      clean(reading.practicalAlignment),
      `Kabbalistic affirmation: ${clean(reading.kabbalisticAffirmation)}`,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [
    `Misión de Vida según la Cábala para ${clean(profile.fullName)}, nacimiento el ${profile.birthDate}.`,
    `Tu Sefirá Natal es ${profile.primarySephira.name}, en el ${profile.dominantPillar}. Tu Sefirá del Nombre es ${profile.nameSephira.name}, y tu Sendero Hebreo es ${profile.hebrewPath.letter}.`,
    clean(reading.headline),
    clean(reading.lifeMissionSummary),
    clean(reading.sephiraConnection),
    clean(reading.nameVibrationInsight),
    clean(reading.tikkunLesson),
    reading.soulGifts?.length ? `Dones espirituales: ${reading.soulGifts.join(". ")}.` : "",
    `Práctica diaria recomendada: ${clean(reading.practicalAlignment)}`,
    `Afirmación cabalística: ${clean(reading.kabbalisticAffirmation)}`,
  ]
    .filter(Boolean)
    .join(" ");
}

async function loadImageAsDataUrl(src?: string): Promise<string | null> {
  if (!src || typeof document === "undefined") return null;
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const loaded = await new Promise<boolean>((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
    if (!loaded || !img.naturalWidth || !img.naturalHeight) return null;

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch {
    return null;
  }
}

export async function exportKabbalahPdf(
  profile: KabbalahProfile,
  reading: KabbalahReading,
  lang: SupportedLanguage = "es",
  treeImageSrc?: string
): Promise<boolean> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;
  const isEs = lang === "es";

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 18) {
      doc.addPage();
      y = 18;
    }
  };

  // Header
  doc.setFont("times", "bold");
  doc.setFontSize(17);
  doc.setTextColor(120, 53, 15);
  doc.text(
    isEs ? "INFORME CABALÍSTICO · MISIÓN DE VIDA" : "KABBALAH LIFE MISSION REPORT",
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 6.5;

  doc.setFont("times", "italic");
  doc.setFontSize(10.5);
  doc.setTextColor(75, 85, 99);
  doc.text(
    `${profile.fullName}  •  ${profile.birthDate}  •  ${profile.dominantPillar}`,
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 5.5;

  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6.5;

  // Coordinates Summary Box
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(67, 20, 7);
  doc.text(
    `${isEs ? "Sefirá Natal" : "Birth Sephira"}: ${profile.primarySephira.number}. ${profile.primarySephira.name} (${profile.primarySephira.meaning})`,
    margin + 4,
    y + 7.5
  );
  doc.text(
    `${isEs ? "Sefirá del Nombre" : "Name Sephira"}: ${profile.nameSephira.number}. ${profile.nameSephira.name} (${isEs ? "Gematría" : "Gematria"}: ${profile.nameGematriaRaw} -> ${profile.nameNumber})`,
    margin + 4,
    y + 14
  );
  doc.text(
    `${isEs ? "Sendero Hebreo" : "Hebrew Path"}: ${profile.hebrewPath.letter} (${profile.hebrewPath.meaning})  •  ${isEs ? "Sendero Natal" : "Life Path"}: ${profile.lifePathNumber}`,
    margin + 4,
    y + 20.5
  );
  y += 30;

  // Embed Tree of Life Artwork if available
  const treeDataUrl = await loadImageAsDataUrl(treeImageSrc);
  if (treeDataUrl) {
    const imgWidthMm = 68;
    const imgHeightMm = 90;
    ensureSpace(imgHeightMm + 8);
    const imgX = (pageWidth - imgWidthMm) / 2;
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.4);
    doc.roundedRect(imgX - 1.5, y - 1.5, imgWidthMm + 3, imgHeightMm + 3, 2, 2, "S");
    doc.addImage(treeDataUrl, "JPEG", imgX, y, imgWidthMm, imgHeightMm);
    y += imgHeightMm + 8;
  }

  // Narrative Sections
  const sections: Array<[string, string]> = [
    [isEs ? "Síntesis del Alma" : "Soul Headline", reading.headline],
    [isEs ? "Propósito y Misión de Vida" : "Life Mission & Purpose", reading.lifeMissionSummary],
    [isEs ? "Puente entre Nacimiento y Nombre" : "Birth & Name Connection", reading.sephiraConnection],
    [isEs ? "Gematría y Vibración del Nombre" : "Name Gematria & Vibration", reading.nameVibrationInsight],
    [isEs ? "Tikkún (Aprendizaje del Alma)" : "Tikkun (Soul Correction)", reading.tikkunLesson],
    [isEs ? "Práctica de Alineación Diaria" : "Daily Alignment Practice", reading.practicalAlignment],
  ];

  for (const [heading, body] of sections) {
    if (!body) continue;
    const lines = doc.splitTextToSize(body, contentWidth);
    ensureSpace(10 + lines.length * 5);
    doc.setFont("times", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(120, 53, 15);
    doc.text(heading, margin, y);
    y += 5;
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 3.5;
  }

  // Spiritual Gifts list
  if (reading.soulGifts?.length) {
    ensureSpace(12 + reading.soulGifts.length * 6);
    doc.setFont("times", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(120, 53, 15);
    doc.text(isEs ? "Dones Espirituales" : "Spiritual Gifts", margin, y);
    y += 5.5;
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    for (const gift of reading.soulGifts) {
      const giftLines = doc.splitTextToSize(`• ${gift}`, contentWidth - 4);
      ensureSpace(giftLines.length * 5 + 2);
      doc.text(giftLines, margin + 2, y);
      y += giftLines.length * 5 + 1.5;
    }
    y += 3;
  }

  // Kabbalistic Affirmation Box
  if (reading.kabbalisticAffirmation) {
    const affLines = doc.splitTextToSize(`"${reading.kabbalisticAffirmation}"`, contentWidth - 10);
    const boxH = 11 + affLines.length * 5;
    ensureSpace(boxH + 4);
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, y, contentWidth, boxH, 2, 2, "FD");
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(146, 64, 14);
    doc.text(isEs ? "Afirmación Cabalística" : "Kabbalistic Affirmation", margin + 5, y + 6);
    doc.setFont("times", "italic");
    doc.setTextColor(67, 20, 7);
    doc.text(affLines, margin + 5, y + 11.5);
    y += boxH + 6;
  }

  const safeName = profile.fullName.replace(/[^a-zA-Z0-9_-]/g, "_") || "Mision_Cabala";
  doc.save(`Mision_Cabala_${safeName}_${profile.birthDate}.pdf`);
  return true;
}
