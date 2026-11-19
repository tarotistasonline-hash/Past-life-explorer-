import { Body, GeoVector, Ecliptic, SiderealTime } from "astronomy-engine";
import type {
  AstroElement,
  AstroModality,
  NatalAspect,
  NatalBodyPosition,
  NatalChartData,
  NatalChartReading,
  NatalHouseCusp,
  NatalTimezoneResolution,
  SupportedLanguage,
} from "../types";

export interface ZodiacSignMeta {
  id: string;
  nameEs: string;
  nameEn: string;
  symbol: string;
  element: AstroElement;
  modality: AstroModality;
  startDeg: number;
  ruler: string;
  freq: number;
}

export const ZODIAC_SIGNS: ZodiacSignMeta[] = [
  { id: "aries", nameEs: "Aries", nameEn: "Aries", symbol: "♈", element: "Fuego", modality: "Cardinal", startDeg: 0, ruler: "Marte", freq: 528 },
  { id: "tauro", nameEs: "Tauro", nameEn: "Taurus", symbol: "♉", element: "Tierra", modality: "Fijo", startDeg: 30, ruler: "Venus", freq: 432 },
  { id: "geminis", nameEs: "Géminis", nameEn: "Gemini", symbol: "♊", element: "Aire", modality: "Mutable", startDeg: 60, ruler: "Mercurio", freq: 639 },
  { id: "cancer", nameEs: "Cáncer", nameEn: "Cancer", symbol: "♋", element: "Agua", modality: "Cardinal", startDeg: 90, ruler: "Luna", freq: 741 },
  { id: "leo", nameEs: "Leo", nameEn: "Leo", symbol: "♌", element: "Fuego", modality: "Fijo", startDeg: 120, ruler: "Sol", freq: 528 },
  { id: "virgo", nameEs: "Virgo", nameEn: "Virgo", symbol: "♍", element: "Tierra", modality: "Mutable", startDeg: 150, ruler: "Mercurio", freq: 432 },
  { id: "libra", nameEs: "Libra", nameEn: "Libra", symbol: "♎", element: "Aire", modality: "Cardinal", startDeg: 180, ruler: "Venus", freq: 639 },
  { id: "escorpio", nameEs: "Escorpio", nameEn: "Scorpio", symbol: "♏", element: "Agua", modality: "Fijo", startDeg: 210, ruler: "Plutón", freq: 852 },
  { id: "sagitario", nameEs: "Sagitario", nameEn: "Sagittarius", symbol: "♐", element: "Fuego", modality: "Mutable", startDeg: 240, ruler: "Júpiter", freq: 963 },
  { id: "capricornio", nameEs: "Capricornio", nameEn: "Capricorn", symbol: "♑", element: "Tierra", modality: "Cardinal", startDeg: 270, ruler: "Saturno", freq: 396 },
  { id: "acuario", nameEs: "Acuario", nameEn: "Aquarius", symbol: "♒", element: "Aire", modality: "Fijo", startDeg: 300, ruler: "Urano", freq: 741 },
  { id: "piscis", nameEs: "Piscis", nameEn: "Pisces", symbol: "♓", element: "Agua", modality: "Mutable", startDeg: 330, ruler: "Neptuno", freq: 852 },
];

export const HOUSE_LIFE_AREAS: Record<number, string> = {
  1: "La Identidad, Vitalidad y Presencia Terrenal",
  2: "Recursos, Talentos, Autoestima y Abundancia Material",
  3: "Mente Concreta, Comunicación, Aprendizaje y Entorno Cercano",
  4: "Hogar, Raíces Emocionales, Linaje Familiar y Refugio del Alma",
  5: "Creatividad, Pasión, Autoexpresión, Alegría y Amor",
  6: "Salud, Hábitos Cotidianos, Servicio y Maestría del Detalle",
  7: "Relaciones, Vínculos Sagrados, Empatía y Encuentro",
  8: "Transformación Profunda, Regeneración y Resiliencia Interior",
  9: "Filosofía de Vida, Sabiduría Superior, Viajes y Consciencia",
  10: "Gran Vocación, Misión en el Mundo, Realización y Legado",
  11: "Comunidad, Ideales Colectivos, Sueños y Amistades del Alma",
  12: "Inconsciente, Espiritualidad Trascendente, Sueños y Conexión Mística",
};

export interface CityEntry {
  aliases: string[];
  city: string;
  country: string;
  lat: number;
  lon: number;
  tz: number; // modern standard offset
  ianaZone: string;
}

export const CITY_CATALOG: CityEntry[] = [
  // Argentina (with regional IANA timezones for accurate 1930-2009 provincial DST!)
  { aliases: ["buenos aires", "caba", "capital federal", "baires", "avellaneda", "lanus", "quilmes", "moron", "san isidro", "tigre", "lomas de zamora"], city: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816, tz: -3, ianaZone: "America/Argentina/Buenos_Aires" },
  { aliases: ["la plata", "berisso", "ensenada"], city: "La Plata", country: "Argentina", lat: -34.9205, lon: -57.9536, tz: -3, ianaZone: "America/Argentina/Buenos_Aires" },
  { aliases: ["mar del plata", "tandil", "bahia blanca", "necochea"], city: "Mar del Plata", country: "Argentina", lat: -38.0055, lon: -57.5562, tz: -3, ianaZone: "America/Argentina/Buenos_Aires" },
  { aliases: ["rosario", "santa fe", "venado tuerto", "rafaela"], city: "Rosario", country: "Argentina", lat: -32.9468, lon: -60.6393, tz: -3, ianaZone: "America/Argentina/Cordoba" },
  { aliases: ["cordoba", "villa carlos paz", "rio cuarto", "villa maria"], city: "Córdoba", country: "Argentina", lat: -31.4201, lon: -64.1888, tz: -3, ianaZone: "America/Argentina/Cordoba" },
  { aliases: ["mendoza", "san rafael", "godoy cruz"], city: "Mendoza", country: "Argentina", lat: -32.8908, lon: -68.8272, tz: -3, ianaZone: "America/Argentina/Mendoza" },
  { aliases: ["san juan"], city: "San Juan", country: "Argentina", lat: -31.5375, lon: -68.5364, tz: -3, ianaZone: "America/Argentina/San_Juan" },
  { aliases: ["san luis", "villa mercedes"], city: "San Luis", country: "Argentina", lat: -33.3017, lon: -66.3378, tz: -3, ianaZone: "America/Argentina/San_Luis" },
  { aliases: ["tucuman", "san miguel de tucuman"], city: "Tucumán", country: "Argentina", lat: -26.8083, lon: -65.2176, tz: -3, ianaZone: "America/Argentina/Tucuman" },
  { aliases: ["salta"], city: "Salta", country: "Argentina", lat: -24.7821, lon: -65.4232, tz: -3, ianaZone: "America/Argentina/Salta" },
  { aliases: ["jujuy", "san salvador de jujuy"], city: "San Salvador de Jujuy", country: "Argentina", lat: -24.1858, lon: -65.2995, tz: -3, ianaZone: "America/Argentina/Jujuy" },
  { aliases: ["catamarca"], city: "Catamarca", country: "Argentina", lat: -28.4696, lon: -65.7795, tz: -3, ianaZone: "America/Argentina/Catamarca" },
  { aliases: ["la rioja"], city: "La Rioja", country: "Argentina", lat: -29.4131, lon: -66.8558, tz: -3, ianaZone: "America/Argentina/La_Rioja" },
  { aliases: ["neuquen", "cipolletti"], city: "Neuquén", country: "Argentina", lat: -38.9516, lon: -68.0591, tz: -3, ianaZone: "America/Argentina/Salta" },
  { aliases: ["bariloche", "san carlos de bariloche", "viedma"], city: "Bariloche", country: "Argentina", lat: -41.1335, lon: -71.3103, tz: -3, ianaZone: "America/Argentina/Salta" },
  { aliases: ["corrientes", "resistencia", "posadas", "parana"], city: "Corrientes / Litoral", country: "Argentina", lat: -27.4692, lon: -58.8306, tz: -3, ianaZone: "America/Argentina/Cordoba" },
  { aliases: ["rio gallegos", "comodoro rivadavia", "trelew"], city: "Río Gallegos", country: "Argentina", lat: -51.623, lon: -69.2168, tz: -3, ianaZone: "America/Argentina/Rio_Gallegos" },
  { aliases: ["ushuaia", "rio grande", "tierra del fuego"], city: "Ushuaia", country: "Argentina", lat: -54.8019, lon: -68.303, tz: -3, ianaZone: "America/Argentina/Ushuaia" },

  // Cono Sur & LatAm
  { aliases: ["montevideo", "uruguay", "punta del este", "maldonado"], city: "Montevideo", country: "Uruguay", lat: -34.9011, lon: -56.1645, tz: -3, ianaZone: "America/Montevideo" },
  { aliases: ["santiago", "valparaiso", "vina del mar", "chile", "concepcion"], city: "Santiago", country: "Chile", lat: -33.4489, lon: -70.6693, tz: -4, ianaZone: "America/Santiago" },
  { aliases: ["asuncion", "paraguay"], city: "Asunción", country: "Paraguay", lat: -25.2637, lon: -57.5759, tz: -4, ianaZone: "America/Asuncion" },
  { aliases: ["la paz", "santa cruz", "bolivia", "cochabamba"], city: "La Paz", country: "Bolivia", lat: -16.4897, lon: -68.1193, tz: -4, ianaZone: "America/La_Paz" },
  { aliases: ["sao paulo", "rio de janeiro", "brasilia", "brasil", "brazil", "curitiba", "porto alegre"], city: "São Paulo", country: "Brasil", lat: -23.5505, lon: -46.6333, tz: -3, ianaZone: "America/Sao_Paulo" },
  { aliases: ["lima", "cusco", "arequipa", "peru"], city: "Lima", country: "Perú", lat: -12.0464, lon: -77.0428, tz: -5, ianaZone: "America/Lima" },
  { aliases: ["quito", "guayaquil", "ecuador"], city: "Quito", country: "Ecuador", lat: -0.1807, lon: -78.4678, tz: -5, ianaZone: "America/Guayaquil" },
  { aliases: ["bogota", "medellin", "cali", "cartagena", "colombia"], city: "Bogotá", country: "Colombia", lat: 4.711, lon: -74.0721, tz: -5, ianaZone: "America/Bogota" },
  { aliases: ["caracas", "maracaibo", "venezuela"], city: "Caracas", country: "Venezuela", lat: 10.4806, lon: -66.9036, tz: -4, ianaZone: "America/Caracas" },
  { aliases: ["cdmx", "ciudad de mexico", "mexico", "distrito federal"], city: "Ciudad de México", country: "México", lat: 19.4326, lon: -99.1332, tz: -6, ianaZone: "America/Mexico_City" },
  { aliases: ["guadalajara", "jalisco"], city: "Guadalajara", country: "México", lat: 20.6597, lon: -103.3496, tz: -6, ianaZone: "America/Mexico_City" },
  { aliases: ["monterrey", "nuevo leon"], city: "Monterrey", country: "México", lat: 25.6866, lon: -100.3161, tz: -6, ianaZone: "America/Monterrey" },
  { aliases: ["san jose", "costa rica"], city: "San José", country: "Costa Rica", lat: 9.9281, lon: -84.0907, tz: -6, ianaZone: "America/Costa_Rica" },
  { aliases: ["panama", "ciudad de panama"], city: "Ciudad de Panamá", country: "Panamá", lat: 8.9824, lon: -79.5199, tz: -5, ianaZone: "America/Panama" },
  { aliases: ["puerto rico"], city: "San Juan", country: "Puerto Rico", lat: 18.4655, lon: -66.1057, tz: -4, ianaZone: "America/Puerto_Rico" },
  { aliases: ["santo domingo", "republica dominicana"], city: "Santo Domingo", country: "Rep. Dominicana", lat: 18.4861, lon: -69.9312, tz: -4, ianaZone: "America/Santo_Domingo" },
  { aliases: ["guatemala"], city: "Guatemala", country: "Guatemala", lat: 14.6349, lon: -90.5069, tz: -6, ianaZone: "America/Guatemala" },
  { aliases: ["la habana", "habana", "cuba"], city: "La Habana", country: "Cuba", lat: 23.1136, lon: -82.3666, tz: -5, ianaZone: "America/Havana" },

  // Spain & Europe
  { aliases: ["madrid", "espana", "spain", "toledo"], city: "Madrid", country: "España", lat: 40.4168, lon: -3.7038, tz: 1, ianaZone: "Europe/Madrid" },
  { aliases: ["barcelona", "catalunya", "girona"], city: "Barcelona", country: "España", lat: 41.3851, lon: 2.1734, tz: 1, ianaZone: "Europe/Madrid" },
  { aliases: ["valencia", "alicante"], city: "Valencia", country: "España", lat: 39.4699, lon: -0.3763, tz: 1, ianaZone: "Europe/Madrid" },
  { aliases: ["sevilla", "andalucia", "cordoba espana"], city: "Sevilla", country: "España", lat: 37.3891, lon: -5.9845, tz: 1, ianaZone: "Europe/Madrid" },
  { aliases: ["bilbao", "vizcaya"], city: "Bilbao", country: "España", lat: 43.263, lon: -2.935, tz: 1, ianaZone: "Europe/Madrid" },
  { aliases: ["malaga"], city: "Málaga", country: "España", lat: 36.7213, lon: -4.4214, tz: 1, ianaZone: "Europe/Madrid" },
  { aliases: ["zaragoza"], city: "Zaragoza", country: "España", lat: 41.6488, lon: -0.8891, tz: 1, ianaZone: "Europe/Madrid" },
  { aliases: ["canarias", "las palmas", "tenerife"], city: "Las Palmas", country: "España", lat: 28.1235, lon: -15.4363, tz: 0, ianaZone: "Atlantic/Canary" },
  { aliases: ["paris", "francia", "france", "lyon", "marsella"], city: "París", country: "Francia", lat: 48.8566, lon: 2.3522, tz: 1, ianaZone: "Europe/Paris" },
  { aliases: ["roma", "milan", "italia", "italy", "napoles", "florencia"], city: "Roma", country: "Italia", lat: 41.9028, lon: 12.4964, tz: 1, ianaZone: "Europe/Rome" },
  { aliases: ["lisboa", "porto", "portugal"], city: "Lisboa", country: "Portugal", lat: 38.7223, lon: -9.1393, tz: 0, ianaZone: "Europe/Lisbon" },
  { aliases: ["londres", "london", "reino unido", "uk", "manchester"], city: "Londres", country: "Reino Unido", lat: 51.5074, lon: -0.1278, tz: 0, ianaZone: "Europe/London" },
  { aliases: ["berlin", "munich", "alemania", "germany", "hamburgo"], city: "Berlín", country: "Alemania", lat: 52.52, lon: 13.405, tz: 1, ianaZone: "Europe/Berlin" },

  // North America & World
  { aliases: ["new york", "nueva york", "nyc", "brooklyn", "boston"], city: "New York", country: "EE.UU.", lat: 40.7128, lon: -74.006, tz: -5, ianaZone: "America/New_York" },
  { aliases: ["miami", "orlando", "florida"], city: "Miami", country: "EE.UU.", lat: 25.7617, lon: -80.1918, tz: -5, ianaZone: "America/New_York" },
  { aliases: ["los angeles", "california", "san francisco"], city: "Los Angeles", country: "EE.UU.", lat: 34.0522, lon: -118.2437, tz: -8, ianaZone: "America/Los_Angeles" },
  { aliases: ["chicago", "texas", "houston", "dallas"], city: "Chicago", country: "EE.UU.", lat: 41.8781, lon: -87.6298, tz: -6, ianaZone: "America/Chicago" },
  { aliases: ["toronto", "montreal", "canada"], city: "Toronto", country: "Canadá", lat: 43.6532, lon: -79.3832, tz: -5, ianaZone: "America/Toronto" },
  { aliases: ["tokio", "tokyo", "japon", "japan"], city: "Tokio", country: "Japón", lat: 35.6762, lon: 139.6503, tz: 9, ianaZone: "Asia/Tokyo" },
];

export const QUICK_CITIES: Array<{ label: string; city: string; country: string }> = [
  { label: "Buenos Aires, AR", city: "Buenos Aires", country: "Argentina" },
  { label: "Córdoba, AR", city: "Córdoba", country: "Argentina" },
  { label: "Rosario, AR", city: "Rosario", country: "Argentina" },
  { label: "Mendoza, AR", city: "Mendoza", country: "Argentina" },
  { label: "Tucumán, AR", city: "Tucumán", country: "Argentina" },
  { label: "Salta, AR", city: "Salta", country: "Argentina" },
  { label: "Montevideo, UY", city: "Montevideo", country: "Uruguay" },
  { label: "Santiago, CL", city: "Santiago", country: "Chile" },
  { label: "Madrid, ES", city: "Madrid", country: "España" },
  { label: "Ciudad de México, MX", city: "Ciudad de México", country: "México" },
  { label: "Bogotá, CO", city: "Bogotá", country: "Colombia" },
  { label: "Lima, PE", city: "Lima", country: "Perú" },
];

function normalizeText(value: string): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function lookupCityLocation(cityInput = "", countryInput = ""): {
  latitude: number;
  longitude: number;
  staticTz: number;
  ianaZone: string;
  cityDisplay: string;
  countryDisplay: string;
} {
  const normCity = normalizeText(cityInput);
  const normCountry = normalizeText(countryInput);
  const combined = `${normCity} ${normCountry}`.trim();

  let matched: CityEntry | undefined;

  if (normCity) {
    matched = CITY_CATALOG.find((entry) =>
      entry.aliases.some((alias) => normCity.includes(alias))
    );
  }
  if (!matched && combined) {
    matched = CITY_CATALOG.find((entry) =>
      entry.aliases.some((alias) => combined.includes(alias))
    );
  }
  if (!matched && normCountry) {
    if (normCountry.includes("argentin")) matched = CITY_CATALOG[0];
    else if (normCountry.includes("espana") || normCountry.includes("spain")) {
      matched = CITY_CATALOG.find((e) => e.city === "Madrid");
    } else if (normCountry.includes("mex")) {
      matched = CITY_CATALOG.find((e) => e.city === "Ciudad de México");
    } else if (normCountry.includes("eeuu") || normCountry.includes("usa") || normCountry.includes("estados unidos")) {
      matched = CITY_CATALOG.find((e) => e.city === "New York");
    }
  }

  if (!matched) {
    // Default to Buenos Aires if Argentine user omits city, else Madrid (matching original ref)
    const fallback = normCountry.includes("argentin")
      ? CITY_CATALOG[0]
      : CITY_CATALOG.find((e) => e.city === "Buenos Aires")!;
    return {
      latitude: fallback.lat,
      longitude: fallback.lon,
      staticTz: fallback.tz,
      ianaZone: fallback.ianaZone,
      cityDisplay: cityInput.trim() || fallback.city,
      countryDisplay: countryInput.trim() || fallback.country,
    };
  }

  return {
    latitude: matched.lat,
    longitude: matched.lon,
    staticTz: matched.tz,
    ianaZone: matched.ianaZone,
    cityDisplay: cityInput.trim() ? cityInput.trim() : matched.city,
    countryDisplay: countryInput.trim() ? countryInput.trim() : matched.country,
  };
}

function parseIsoDate(dateStr?: string): { year: number; month: number; day: number } {
  if (!dateStr) return { year: 1995, month: 5, day: 15 };
  const trimmed = dateStr.trim();
  const iso = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (iso) {
    return {
      year: parseInt(iso[1], 10),
      month: parseInt(iso[2], 10),
      day: parseInt(iso[3], 10),
    };
  }
  const dmy = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) {
    return {
      day: parseInt(dmy[1], 10),
      month: parseInt(dmy[2], 10),
      year: parseInt(dmy[3], 10),
    };
  }
  return { year: 1995, month: 5, day: 15 };
}

function formatOffsetLabel(offsetHours: number): string {
  const sign = offsetHours >= 0 ? "+" : "-";
  const abs = Math.abs(offsetHours);
  const whole = Math.floor(abs);
  const mins = Math.round((abs - whole) * 60);
  if (mins === 0) return `UTC${sign}${whole}`;
  return `UTC${sign}${whole}:${String(mins).padStart(2, "0")}`;
}

/**
 * Queries Intl.DateTimeFormat for the exact GMT offset (in hours) of an IANA zone at a given UTC Date.
 */
function getIanaOffsetHoursAtUtc(utcDate: Date, ianaZone: string): number | null {
  try {
    const formatted = new Intl.DateTimeFormat("en-US", {
      timeZone: ianaZone,
      timeZoneName: "longOffset",
    }).format(utcDate);
    const match = formatted.match(/GMT([+-])(\d{2}):(\d{2})/);
    if (match) {
      const sign = match[1] === "+" ? 1 : -1;
      return sign * (parseInt(match[2], 10) + parseInt(match[3], 10) / 60);
    }
    if (formatted.includes("GMT")) return 0;
  } catch {
    // ignore unsupported zone
  }
  return null;
}

/**
 * Iterative local wall-clock to UTC offset resolver using IANA historical tzdata.
 */
function resolveIanaWallClockOffset(
  ianaZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): number | null {
  const approxUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  const firstGuess = getIanaOffsetHoursAtUtc(new Date(approxUtcMs), ianaZone);
  if (firstGuess === null) return null;
  const refinedUtcMs = approxUtcMs - firstGuess * 3600 * 1000;
  const secondGuess = getIanaOffsetHoursAtUtc(new Date(refinedUtcMs), ianaZone);
  if (secondGuess === null) return firstGuess;
  const finalUtcMs = approxUtcMs - secondGuess * 3600 * 1000;
  return getIanaOffsetHoursAtUtc(new Date(finalUtcMs), ianaZone) ?? secondGuess;
}

/**
 * Explicit historical decree table for Argentina (1920-present, including all post-1940 Horario de Verano).
 * Cross-checks and supplements browser ICU tzdata so pre-1970 & 1974/1988-1993/2007-2009 DST rules work everywhere.
 */
function resolveArgentinaHistoricalRule(
  ianaZone: string,
  year: number,
  month: number,
  day: number
): { offsetHours: number; standardOffsetHours: number; isDst: boolean; dstNote: string } | null {
  if (!ianaZone.startsWith("America/Argentina/")) return null;

  const ymd = year * 10000 + month * 100 + day;

  // Before 1920-05-01: Córdoba Mean Time (-4h 16m 48s)
  if (ymd < 19200501) {
    return {
      offsetHours: -4.28,
      standardOffsetHours: -4.28,
      isDst: false,
      dstNote: "Hora solar histórica de Córdoba previa a mayo de 1920 (UTC-4:17)",
    };
  }

  // Era 1: 1920-05-01 to 1969-10-04 -> Official standard time was UTC-4, with Horario de Verano UTC-3!
  if (ymd < 19691005) {
    const dstRangesPre1969: Array<[number, number, string]> = [
      [19301201, 19310331, "Horario de Verano 1930–1931 (UTC-3)"],
      [19311015, 19320229, "Horario de Verano 1931–1932 (UTC-3)"],
      [19321101, 19330228, "Horario de Verano 1932–1933 (UTC-3)"],
      [19331101, 19340228, "Horario de Verano 1933–1934 (UTC-3)"],
      [19341101, 19350228, "Horario de Verano 1934–1935 (UTC-3)"],
      [19351101, 19360229, "Horario de Verano 1935–1936 (UTC-3)"],
      [19361101, 19370228, "Horario de Verano 1936–1937 (UTC-3)"],
      [19371101, 19380228, "Horario de Verano 1937–1938 (UTC-3)"],
      [19381101, 19390228, "Horario de Verano 1938–1939 (UTC-3)"],
      [19391101, 19400229, "Horario de Verano 1939–1940 (UTC-3)"],
      [19400701, 19410614, "Horario de Verano prolongado 1940–1941 (UTC-3)"],
      [19411015, 19430731, "Horario de Verano prolongado 1941–1943 (UTC-3)"],
      [19431015, 19460228, "Horario de Verano prolongado 1943–1946 (UTC-3)"],
      [19461001, 19630930, "Horario de Verano continuo 1946–1963 (UTC-3 sobre huso UTC-4)"],
      [19631215, 19640229, "Horario de Verano 1963–1964 (UTC-3)"],
      [19641015, 19650228, "Horario de Verano 1964–1965 (UTC-3)"],
      [19651015, 19660228, "Horario de Verano 1965–1966 (UTC-3)"],
      [19661015, 19670401, "Horario de Verano 1966–1967 (UTC-3)"],
      [19671001, 19680406, "Horario de Verano 1967–1968 (UTC-3)"],
      [19681006, 19690405, "Horario de Verano 1968–1969 (UTC-3)"],
    ];
    const hit = dstRangesPre1969.find(([start, end]) => ymd >= start && ymd <= end);
    if (hit) {
      return {
        offsetHours: -3,
        standardOffsetHours: -4,
        isDst: true,
        dstNote: hit[2],
      };
    }
    return {
      offsetHours: -4,
      standardOffsetHours: -4,
      isDst: false,
      dstNote: "Huso oficial estándar argentino 1920–1969 (UTC-4)",
    };
  }

  // Era 2: 1969-10-05 to present -> Official standard time is UTC-3, with Horario de Verano UTC-2!
  const no2008SecondWaveZones = new Set([
    "America/Argentina/Mendoza",
    "America/Argentina/San_Juan",
    "America/Argentina/Salta",
    "America/Argentina/Jujuy",
    "America/Argentina/Catamarca",
    "America/Argentina/La_Rioja",
    "America/Argentina/Rio_Gallegos",
    "America/Argentina/Ushuaia",
  ]);

  const dstRangesPost1969: Array<[number, number, string, boolean]> = [
    [19740123, 19740430, "Horario de Verano Nacional 1974 (UTC-2)", true],
    [19881201, 19890304, "Horario de Verano Nacional 1988–1989 (UTC-2)", true],
    [19891015, 19900303, "Horario de Verano Nacional 1989–1990 (UTC-2)", true],
    [19901021, 19910302, "Horario de Verano 1990–1991 (UTC-2)", true],
    [19911020, 19920229, "Horario de Verano 1991–1992 (UTC-2)", true],
    [19921018, 19930306, "Horario de Verano 1992–1993 (UTC-2)", true],
    [20071230, 20080315, "Horario de Verano 2007–2008 (UTC-2)", true],
    [20081019, 20090314, "Horario de Verano 2008–2009 (UTC-2)", !no2008SecondWaveZones.has(ianaZone)],
  ];

  // San Luis special historical shift (UTC-4 winters in 2008-2009)
  if (ianaZone === "America/Argentina/San_Luis") {
    if (ymd >= 20080121 && ymd <= 20080315) {
      return { offsetHours: -3, standardOffsetHours: -4, isDst: true, dstNote: "Régimen especial San Luis 2008 (UTC-3)" };
    }
    if (ymd >= 20080316 && ymd <= 20081011) {
      return { offsetHours: -4, standardOffsetHours: -4, isDst: false, dstNote: "Huso invernal San Luis 2008 (UTC-4)" };
    }
    if (ymd >= 20081012 && ymd <= 20090314) {
      return { offsetHours: -3, standardOffsetHours: -4, isDst: true, dstNote: "Régimen verano San Luis 2008–2009 (UTC-3)" };
    }
    if (ymd >= 20090315 && ymd <= 20091010) {
      return { offsetHours: -4, standardOffsetHours: -4, isDst: false, dstNote: "Huso invernal San Luis 2009 (UTC-4)" };
    }
  }

  const hitPost = dstRangesPost1969.find(([start, end, , applies]) => applies && ymd >= start && ymd <= end);
  if (hitPost) {
    return {
      offsetHours: -2,
      standardOffsetHours: -3,
      isDst: true,
      dstNote: hitPost[2],
    };
  }

  return {
    offsetHours: -3,
    standardOffsetHours: -3,
    isDst: false,
    dstNote:
      ymd >= 20081019 && ymd <= 20090314 && no2008SecondWaveZones.has(ianaZone)
        ? "Esta provincia mantuvo UTC-3 en el verano 2008–2009"
        : "Hora estándar oficial de Argentina (UTC-3)",
  };
}

export function resolveHistoricalTimezone(
  ianaZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  staticFallbackTz: number,
  manualOffsetHours?: number | null
): NatalTimezoneResolution {
  if (typeof manualOffsetHours === "number" && Number.isFinite(manualOffsetHours)) {
    return {
      ianaZone,
      offsetHours: manualOffsetHours,
      offsetLabel: formatOffsetLabel(manualOffsetHours),
      standardOffsetHours: staticFallbackTz,
      isDst: manualOffsetHours !== staticFallbackTz,
      dstNote: `Ajuste manual aplicado (${formatOffsetLabel(manualOffsetHours)})`,
      resolutionMethod: "manual-override",
    };
  }

  const argRule = resolveArgentinaHistoricalRule(ianaZone, year, month, day);
  if (argRule) {
    // Compare with live IANA ICU lookup for exact transition-hour consistency if inside modern era
    const ianaExact = resolveIanaWallClockOffset(ianaZone, year, month, day, hour, minute);
    const offset = ianaExact !== null && year >= 1970 ? ianaExact : argRule.offsetHours;
    const isDst = offset !== argRule.standardOffsetHours;
    return {
      ianaZone,
      offsetHours: offset,
      offsetLabel: formatOffsetLabel(offset),
      standardOffsetHours: argRule.standardOffsetHours,
      isDst,
      dstNote: argRule.dstNote,
      resolutionMethod: "argentina-historical",
    };
  }

  const ianaOffset = resolveIanaWallClockOffset(ianaZone, year, month, day, hour, minute);
  if (ianaOffset !== null) {
    const janOff = getIanaOffsetHoursAtUtc(new Date(Date.UTC(year, 0, 15, 12, 0)), ianaZone) ?? ianaOffset;
    const julOff = getIanaOffsetHoursAtUtc(new Date(Date.UTC(year, 6, 15, 12, 0)), ianaZone) ?? ianaOffset;
    const standardOffset = Math.min(janOff, julOff);
    const isDst = janOff !== julOff && ianaOffset > standardOffset;
    return {
      ianaZone,
      offsetHours: ianaOffset,
      offsetLabel: formatOffsetLabel(ianaOffset),
      standardOffsetHours: standardOffset,
      isDst,
      dstNote: isDst
        ? `Horario de Verano histórico activo (${formatOffsetLabel(ianaOffset)})`
        : `Hora estándar histórica (${formatOffsetLabel(ianaOffset)})`,
      resolutionMethod: "iana-historical",
    };
  }

  return {
    ianaZone,
    offsetHours: staticFallbackTz,
    offsetLabel: formatOffsetLabel(staticFallbackTz),
    standardOffsetHours: staticFallbackTz,
    isDst: false,
    dstNote: `Huso estándar estimado (${formatOffsetLabel(staticFallbackTz)})`,
    resolutionMethod: "static-fallback",
  };
}

export function previewLocationAndTimezone(params: {
  birthDate: string;
  birthTime: string;
  hasExactTime: boolean;
  birthCity: string;
  birthCountry: string;
  manualOffsetHours?: number | null;
}) {
  const { year, month, day } = parseIsoDate(params.birthDate);
  const [hStr, mStr] = (params.birthTime || "12:00").split(":");
  const hNum = parseInt(hStr, 10);
  const mNum = parseInt(mStr, 10);
  const hour = params.hasExactTime && !isNaN(hNum) ? hNum : 12;
  const minute = params.hasExactTime && !isNaN(mNum) ? mNum : 0;

  const loc = lookupCityLocation(params.birthCity, params.birthCountry);
  const tzInfo = resolveHistoricalTimezone(
    loc.ianaZone,
    year,
    month,
    day,
    hour,
    minute,
    loc.staticTz,
    params.manualOffsetHours
  );
  return { ...loc, tzInfo };
}

function julianDay(year: number, month: number, day: number, hourFloat = 0): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFrac = day + hourFloat / 24;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFrac + B - 1524.5;
}

export function degreeToSignInfo(lon: number) {
  const normalized = ((lon % 360) + 360) % 360;
  const signIdx = Math.floor(normalized / 30);
  const meta = ZODIAC_SIGNS[signIdx] || ZODIAC_SIGNS[0];
  const signDeg = normalized % 30;
  const degree = Math.floor(signDeg);
  const minutes = Math.floor((signDeg - degree) * 60);
  return {
    sign: meta.nameEs,
    signEn: meta.nameEn,
    signId: meta.id,
    symbol: meta.symbol,
    element: meta.element,
    modality: meta.modality,
    ruler: meta.ruler,
    degree,
    minutes,
    totalDegree: normalized,
    freq: meta.freq,
  };
}

function describeAspect(
  p1: NatalBodyPosition,
  p2: NatalBodyPosition,
  aspectType: NatalAspect["type"],
  lang: SupportedLanguage
): { title: string; description: string; evolutionaryGift: string; symbol: string; nature: "harmonic" | "dynamic" } {
  const isEs = lang === "es";
  const symbols: Record<NatalAspect["type"], string> = {
    Conjunción: "☌",
    Sextil: "⚹",
    Cuadratura: "□",
    Trígono: "△",
    Oposición: "☍",
  };
  const symbol = symbols[aspectType] || "☌";
  const isHarmonic =
    aspectType === "Trígono" ||
    aspectType === "Sextil" ||
    (aspectType === "Conjunción" &&
      !["saturn", "mars", "pluto"].includes(p1.id) &&
      !["saturn", "mars", "pluto"].includes(p2.id));
  const nature: "harmonic" | "dynamic" = isHarmonic ? "harmonic" : "dynamic";
  const pair = [p1.id, p2.id].sort().join("-");

  if (pair === "moon-sun") {
    if (aspectType === "Conjunción") {
      return {
        title: isEs
          ? "Sol y Luna en Conjunción: Integración de Voluntad y Sentimientos"
          : "Sun & Moon Conjunction: Alignment of Will & Emotion",
        description: isEs
          ? "Tus metas conscientes y tus necesidades emocionales van de la mano. Actúas con franqueza y claridad de propósito, facilitando decisiones firmes y coherentes."
          : "Your conscious goals and emotional needs work hand-in-hand, allowing for authentic action and grounded direction.",
        evolutionaryGift: isEs
          ? "Coherencia natural entre lo que sientes y lo que decides."
          : "Coherence between inner feelings and conscious action.",
        symbol,
        nature,
      };
    }
    if (aspectType === "Trígono" || aspectType === "Sextil") {
      return {
        title: isEs
          ? "Sol y Luna en Armonía: Estabilidad Afectiva y Equilibrio Cotidiano"
          : "Sun & Moon Harmony: Emotional Stability & Balance",
        description: isEs
          ? "Existe una buena sintonía entre tus raíces familiares y tus objetivos personales, ayudándote a resolver desacuerdos con serenidad."
          : "Natural alignment between family roots and personal ambition supports steady relationships.",
        evolutionaryGift: isEs
          ? "Equilibrio emocional y resiliencia serena en la vida diaria."
          : "Emotional poise and calm resilience.",
        symbol,
        nature,
      };
    }
    return {
      title: isEs
        ? "Sol y Luna en Tensión: Diálogo entre Razón y Sensibilidad"
        : "Sun & Moon Tension: Mind vs. Heart Polarity",
      description: isEs
        ? "A veces sientes un tironeo entre lo que quieres lograr y lo que tu mundo emocional necesita para sentirse seguro. Integrar ambos polos es tu gran fuente de crecimiento."
        : "A creative tension between personal ambition and emotional security pushes you toward deeper self-awareness.",
      evolutionaryGift: isEs
        ? "Escuchar tus emociones antes de tomar decisiones exigentes."
        : "Honoring emotional needs alongside personal ambition.",
      symbol,
      nature: "dynamic",
    };
  }

  if (p1.id === "ascendant" || p2.id === "ascendant") {
    const other = p1.id === "ascendant" ? p2 : p1;
    return {
      title: isEs
        ? `${other.name} en ${aspectType} al Ascendente: Sello Personal`
        : `${other.name} ${aspectType} Ascendant: Personal Presence`,
      description: isEs
        ? `La energía de ${other.name} moldea tu presencia física, tu tono de voz y la primera impresión que irradias al llegar a un lugar.`
        : `${other.name}'s signature directly shapes your body language, charisma, and first impressions.`,
      evolutionaryGift: isEs
        ? `Expresar con autenticidad las cualidades prácticas de ${other.name}.`
        : `Projecting authentic confidence through ${other.name}.`,
      symbol,
      nature,
    };
  }

  if (p1.id === "midheaven" || p2.id === "midheaven") {
    const other = p1.id === "midheaven" ? p2 : p1;
    return {
      title: isEs
        ? `${other.name} en ${aspectType} al Medio Cielo: Brújula Vocacional`
        : `${other.name} ${aspectType} Midheaven: Vocational Compass`,
      description: isEs
        ? `Este vínculo orienta las cualidades de ${other.name} hacia tu trabajo, tu reputación pública y tu realización profesional.`
        : `This alignment channels ${other.name}'s gifts directly into your career path and lasting public legacy.`,
      evolutionaryGift: isEs
        ? `Construir un camino profesional sólido apoyado en ${other.name}.`
        : `Building a resilient vocation anchored in ${other.name}.`,
      symbol,
      nature,
    };
  }

  return {
    title: isEs
      ? `${p1.name} en ${aspectType} con ${p2.name}`
      : `${p1.name} ${aspectType} ${p2.name}`,
    description: isEs
      ? `La interacción entre ${p1.name} y ${p2.name} ${
          isHarmonic
            ? "favorece el entendimiento, la fluidez creativa y el talento natural"
            : "despierta tensión constructiva que te impulsa a madurar y definir límites claros"
        } en tus decisiones cotidianas.`
      : `The dialogue between ${p1.name} and ${p2.name} ${
          isHarmonic
            ? "supports natural flow and creative ease"
            : "generates dynamic friction that builds maturity and clear boundaries"
        }.`,
    evolutionaryGift: isEs
      ? `Integrar con equilibrio la fuerza de ${p1.name} y ${p2.name}.`
      : `Balancing the impulses of ${p1.name} and ${p2.name}.`,
    symbol,
    nature,
  };
}

export function calculateNatalChart(input: {
  name?: string;
  birthDate?: string;
  birthTime?: string;
  hasExactTime?: boolean;
  birthCity?: string;
  birthCountry?: string;
  latitudeOverride?: number | null;
  longitudeOverride?: number | null;
  manualOffsetHours?: number | null;
  language?: SupportedLanguage;
}): NatalChartData {
  const name = (input.name || "Consultante").trim() || "Consultante";
  const birthDate = input.birthDate || "1995-05-15";
  const hasExactTime = input.hasExactTime !== false;
  const birthTime = input.birthTime || "12:00";
  const birthCity = input.birthCity || "";
  const birthCountry = input.birthCountry || "";
  const lang = input.language || "es";

  const { year, month, day } = parseIsoDate(birthDate);
  const [hStr, mStr] = birthTime.split(":");
  const hNum = parseInt(hStr, 10);
  const mNum = parseInt(mStr, 10);
  const localHour = hasExactTime && !isNaN(hNum) ? hNum : 12;
  const localMin = hasExactTime && !isNaN(mNum) ? mNum : 0;

  const loc = lookupCityLocation(birthCity, birthCountry);
  const latitude =
    typeof input.latitudeOverride === "number" && Number.isFinite(input.latitudeOverride)
      ? input.latitudeOverride
      : loc.latitude;
  const longitude =
    typeof input.longitudeOverride === "number" && Number.isFinite(input.longitudeOverride)
      ? input.longitudeOverride
      : loc.longitude;

  const tzInfo = resolveHistoricalTimezone(
    loc.ianaZone,
    year,
    month,
    day,
    localHour,
    localMin,
    loc.staticTz,
    input.manualOffsetHours
  );

  // Convert local wall clock to exact UTC instant using the resolved historical offset
  const utcHours = localHour + localMin / 60 - tzInfo.offsetHours;
  const utcMs = Date.UTC(year, month - 1, day, 0, 0, 0) + utcHours * 3600 * 1000;
  const dateObj = new Date(utcMs);

  // One-hour probe for retrograde detection
  const prevHourDate = new Date(utcMs - 3600 * 1000);
  const nextHourDate = new Date(utcMs + 3600 * 1000);

  const jd = julianDay(year, month, day, utcHours);
  const T = (jd - 2451545.0) / 36525.0;

  const getLon = (body: Body, d: Date = dateObj): number => {
    const vec = GeoVector(body, d, true);
    return ((Ecliptic(vec).elon % 360) + 360) % 360;
  };

  const isRetro = (body: Body): boolean => {
    const l1 = getLon(body, prevHourDate);
    const l2 = getLon(body, nextHourDate);
    let diff = l2 - l1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff < 0;
  };

  const sunLon = getLon(Body.Sun);
  const moonLon = getLon(Body.Moon);
  const mercLon = getLon(Body.Mercury);
  const venLon = getLon(Body.Venus);
  const marsLon = getLon(Body.Mars);
  const jupLon = getLon(Body.Jupiter);
  const satLon = getLon(Body.Saturn);
  const uraLon = getLon(Body.Uranus);
  const nepLon = getLon(Body.Neptune);
  const pluLon = getLon(Body.Pluto);

  const nodeLon = ((125.04452 - 1934.136261 * T + 0.0020708 * T * T) % 360 + 360) % 360;

  // Local Sidereal Time (RAMC) & true obliquity of the ecliptic
  const ramcDeg = ((SiderealTime(dateObj) * 15 + longitude) % 360 + 360) % 360;
  const ramcRad = (ramcDeg * Math.PI) / 180;
  const epsRad = (23.4392911 - 0.0130042 * T) * (Math.PI / 180);
  const latRad = (latitude * Math.PI) / 180;

  // Midheaven (MC)
  const mcLon =
    ((Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsRad)) * 180) / Math.PI % 360 + 360) % 360;

  // Ascendant (ASC)
  let ascLon =
    ((Math.atan2(
      Math.cos(ramcRad),
      -(Math.sin(epsRad) * Math.tan(latRad) + Math.cos(epsRad) * Math.sin(ramcRad))
    ) *
      180) /
      Math.PI %
      360 +
      360) %
    360;
  if (((ascLon - mcLon) % 360 + 360) % 360 > 180) {
    ascLon = (ascLon + 180) % 360;
  }
  if (!hasExactTime) {
    ascLon = (sunLon + 90) % 360;
  }

  // Porphyry 3-part quadrant house cusps (exact formula used on ouija-interactiva.netlify.app)
  const icLon = (mcLon + 180) % 360;
  const dscLon = (ascLon + 180) % 360;
  const q1 = (((icLon - ascLon) % 360 + 360) % 360) / 3;
  const q2 = (((dscLon - icLon) % 360 + 360) % 360) / 3;
  const q3 = (((mcLon - dscLon) % 360 + 360) % 360) / 3;
  const q4 = (((ascLon - mcLon) % 360 + 360) % 360) / 3;

  const cusps = [
    0,
    ascLon,
    ((ascLon + q1) % 360 + 360) % 360,
    ((ascLon + 2 * q1) % 360 + 360) % 360,
    icLon,
    ((icLon + q2) % 360 + 360) % 360,
    ((icLon + 2 * q2) % 360 + 360) % 360,
    dscLon,
    ((dscLon + q3) % 360 + 360) % 360,
    ((dscLon + 2 * q3) % 360 + 360) % 360,
    mcLon,
    ((mcLon + q4) % 360 + 360) % 360,
    ((mcLon + 2 * q4) % 360 + 360) % 360,
  ];

  const getHouseForDegree = (lon: number): number => {
    for (let h = 1; h <= 12; h++) {
      const start = cusps[h];
      const next = h === 12 ? 1 : h + 1;
      const span = ((cusps[next] - start) % 360 + 360) % 360;
      const diff = ((lon - start) % 360 + 360) % 360;
      if (diff >= 0 && diff < span) return h;
    }
    return 1;
  };

  const houses: NatalHouseCusp[] = [];
  for (let h = 1; h <= 12; h++) {
    const info = degreeToSignInfo(cusps[h]);
    houses.push({
      house: h,
      sign: info.sign,
      signId: info.signId,
      signSymbol: info.symbol,
      degree: info.degree,
      minutes: info.minutes,
      totalDegree: cusps[h],
      ruler: info.ruler,
      lifeArea: HOUSE_LIFE_AREAS[h] || "",
    });
  }

  const makeBody = (
    id: string,
    planetName: string,
    glyph: string,
    lon: number,
    meaning: string,
    houseOverride?: number,
    retro?: boolean
  ): NatalBodyPosition => {
    const info = degreeToSignInfo(lon);
    return {
      id,
      name: planetName,
      glyph,
      sign: info.sign,
      signId: info.signId,
      signSymbol: info.symbol,
      degree: info.degree,
      minutes: info.minutes,
      totalDegree: lon,
      house: houseOverride ?? getHouseForDegree(lon),
      element: info.element,
      modality: info.modality,
      ruler: info.ruler,
      meaning,
      isRetrograde: retro,
    };
  };

  const sun = makeBody("sun", "Sol", "☉", sunLon, "Esencia, Consciencia, Vitalidad y Luz del Yo");
  const moon = makeBody("moon", "Luna", "☽", moonLon, "Mundo Emocional, Inconsciente, Memoria Álmica e Intuición");
  const ascendant = makeBody("ascendant", "Ascendente", "ASC", ascLon, "Presencia Terrenal, Máscara Sagrada y Camino de Vida", 1);
  const midheaven = makeBody("midheaven", "Medio Cielo", "MC", mcLon, "Cumbre Vocacional, Realización Pública y Legado", 10);
  const northNode = makeBody("north_node", "Nodo Norte", "☊", nodeLon, "Destino Kármico, Dirección del Alma y Evolución");

  const innerPlanets: NatalBodyPosition[] = [
    makeBody("mercury", "Mercurio", "☿", mercLon, "Intelecto, Comunicación, Percepción y Pensamiento", undefined, isRetro(Body.Mercury)),
    makeBody("venus", "Venus", "♀", venLon, "Amor, Valores Sagrados, Belleza y Armonía", undefined, isRetro(Body.Venus)),
    makeBody("mars", "Marte", "♂", marsLon, "Voluntad, Impulso de Acción, Coraje y Determinación", undefined, isRetro(Body.Mars)),
    makeBody("jupiter", "Júpiter", "♃", jupLon, "Expansión, Sabiduría, Fortuna y Crecimiento", undefined, isRetro(Body.Jupiter)),
    makeBody("saturn", "Saturno", "♄", satLon, "Maestría del Tiempo, Estructura Kármica y Disciplina", undefined, isRetro(Body.Saturn)),
    makeBody("uranus", "Urano", "♅", uraLon, "Innovación, Despertar, Libertad y Visión Original", undefined, isRetro(Body.Uranus)),
    makeBody("neptune", "Neptuno", "♆", nepLon, "Misticismo, Sueños, Intuición e Imaginación", undefined, isRetro(Body.Neptune)),
    makeBody("pluto", "Plutón", "♇", pluLon, "Metamorfosis, Poder Interior, Regeneración y Alquimia", undefined, isRetro(Body.Pluto)),
  ];

  const allPlanets: NatalBodyPosition[] = [sun, moon, ascendant, midheaven, northNode, ...innerPlanets];

  // Calculate major planetary aspects
  const aspects: NatalAspect[] = [];
  const aspectBodies = [sun, moon, ascendant, midheaven, ...innerPlanets];
  for (let i = 0; i < aspectBodies.length; i++) {
    for (let j = i + 1; j < aspectBodies.length; j++) {
      const b1 = aspectBodies[i];
      const b2 = aspectBodies[j];
      const rawDiff = Math.abs(b1.totalDegree - b2.totalDegree);
      const diff = rawDiff > 180 ? 360 - rawDiff : rawDiff;

      let type: NatalAspect["type"] | null = null;
      let orb = 0;

      if (diff <= 8) {
        type = "Conjunción";
        orb = parseFloat(diff.toFixed(1));
      } else if (Math.abs(diff - 60) <= 5) {
        type = "Sextil";
        orb = parseFloat(Math.abs(diff - 60).toFixed(1));
      } else if (Math.abs(diff - 90) <= 6) {
        type = "Cuadratura";
        orb = parseFloat(Math.abs(diff - 90).toFixed(1));
      } else if (Math.abs(diff - 120) <= 7) {
        type = "Trígono";
        orb = parseFloat(Math.abs(diff - 120).toFixed(1));
      } else if (Math.abs(diff - 180) <= 7) {
        type = "Oposición";
        orb = parseFloat(Math.abs(diff - 180).toFixed(1));
      }

      if (type) {
        const desc = describeAspect(b1, b2, type, lang);
        aspects.push({
          planet1: b1.name,
          planet2: b2.name,
          planet1Id: b1.id,
          planet2Id: b2.id,
          planet1Glyph: b1.glyph,
          planet2Glyph: b2.glyph,
          type,
          symbol: desc.symbol,
          angle: Math.round(diff),
          orb,
          nature: desc.nature,
          title: desc.title,
          description: desc.description,
          evolutionaryGift: desc.evolutionaryGift,
        });
      }
    }
  }
  aspects.sort((a, b) => a.orb - b.orb);

  // Elements & modalities distribution
  const elemCounts: Record<AstroElement, number> = { Fuego: 0, Tierra: 0, Aire: 0, Agua: 0 };
  const modCounts: Record<AstroModality, number> = { Cardinal: 0, Fijo: 0, Mutable: 0 };
  allPlanets.forEach((b) => {
    elemCounts[b.element]++;
    modCounts[b.modality]++;
  });

  const totalBodies = allPlanets.length;
  const elements = {
    fuego: Math.round((elemCounts.Fuego / totalBodies) * 100),
    tierra: Math.round((elemCounts.Tierra / totalBodies) * 100),
    aire: Math.round((elemCounts.Aire / totalBodies) * 100),
    agua: Math.round((elemCounts.Agua / totalBodies) * 100),
  };

  let dominantElement: AstroElement = "Fuego";
  let maxEl = elements.fuego;
  if (elements.tierra > maxEl) { dominantElement = "Tierra"; maxEl = elements.tierra; }
  if (elements.aire > maxEl) { dominantElement = "Aire"; maxEl = elements.aire; }
  if (elements.agua > maxEl) { dominantElement = "Agua"; }

  const modalities = {
    cardinal: Math.round((modCounts.Cardinal / totalBodies) * 100),
    fijo: Math.round((modCounts.Fijo / totalBodies) * 100),
    mutable: Math.round((modCounts.Mutable / totalBodies) * 100),
  };

  let dominantModality: AstroModality = "Cardinal";
  let maxMod = modalities.cardinal;
  if (modalities.fijo > maxMod) { dominantModality = "Fijo"; maxMod = modalities.fijo; }
  if (modalities.mutable > maxMod) { dominantModality = "Mutable"; }

  const latDir = latitude >= 0 ? "N" : "S";
  const lonDir = longitude >= 0 ? "E" : "O";
  const locationSummary = `${loc.cityDisplay}, ${loc.countryDisplay} (${Math.abs(latitude).toFixed(2)}°${latDir}, ${Math.abs(longitude).toFixed(2)}°${lonDir} • ${tzInfo.offsetLabel}${tzInfo.isDst ? " Verano" : ""})`;

  const sunUpper = sun.sign.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const moonUpper = moon.sign.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return {
    seekerName: name,
    birthDate,
    birthTime: hasExactTime ? birthTime : "12:00 (Aprox)",
    hasExactTime,
    birthCity: loc.cityDisplay,
    birthCountry: loc.countryDisplay,
    locationSummary,
    latitude,
    longitude,
    timezone: tzInfo.offsetHours,
    timezoneInfo: tzInfo,
    utcIso: dateObj.toISOString(),
    sun,
    moon,
    ascendant,
    midheaven,
    northNode,
    planets: allPlanets,
    houses,
    aspects: aspects.slice(0, 12),
    elements,
    dominantElement,
    modalities,
    dominantModality,
    solfeggioFrequency: degreeToSignInfo(sunLon).freq,
    boardKeyword: `${sunUpper} ${moonUpper}`,
  };
}

const SUN_ESSENCE_ES: Record<string, string> = {
  Aries: "Tu identidad consciente se define por una necesidad directa de iniciativa, franqueza y autonomía. Posees determinación para abrir caminos nuevos, siendo tu desafío templar la impaciencia.",
  Tauro: "Tu identidad se sustenta en el pragmatismo, la constancia y la edificación de seguridad tangible. Tienes talento natural para consolidar proyectos paso a paso con paciencia firme.",
  Géminis: "Tu identidad se expresa mediante la curiosidad intelectual, la versatilidad mental y la comunicación ágil. Conectas ideas y personas con facilidad, cuidando de no dispersar tu enfoque.",
  Cáncer: "Tu identidad está ligada al sentido de pertenencia, la protección del círculo íntimo y la memoria afectiva. Aportas profunda lealtad y sostén emocional a quienes te rodean.",
  Leo: "Tu identidad brilla a través de la autoexpresión auténtica, la dignidad personal y el liderazgo cálido. Irradies generosidad y coraje creativo cuando actúas desde el corazón.",
  Virgo: "Tu identidad se apoya en el discernimiento crítico, la utilidad práctica y el perfeccionamiento metódico. Resuelves problemas complejos con rigor, cuidando no excederte en la autocrítica.",
  Libra: "Tu identidad busca el equilibrio, la justicia en el trato y la armonía relacional. Posees gran talento diplomático, con el reto de sostener decisiones propias sin postergarte.",
  Escorpio: "Tu identidad se forja en la introspección profunda, la firmeza de convicciones y la capacidad de regeneración tras cada crisis. Tu perspicacia psicológica es excepcional.",
  Sagitario: "Tu identidad se orienta hacia la expansión de horizontes, la búsqueda ética de sentido y la libertad de pensamiento. Aportas optimismo y visión estratégica a largo plazo.",
  Capricornio: "Tu identidad se estructura en la madurez, la autosuficiencia y la ambición constructiva. Eres un edificador incansable cuyo desafío es permitirte disfrutar el presente.",
  Acuario: "Tu identidad late con originalidad, pensamiento analítico y compromiso con ideales colectivos. Brillas por tu visión innovadora y tu espíritu independiente.",
  Piscis: "Tu identidad se distingue por una honda sensibilidad intuitiva, empatía humana e imaginación creadora. Comprendes las motivaciones profundas del alma con naturalidad.",
};

const MOON_SANCTUARY_ES: Record<string, string> = {
  Aries: "Emocionalmente reaccionas con intensidad inmediata y honestidad frontal. Necesitas movimiento y autonomía para procesar lo que sientes.",
  Tauro: "Tu refugio afectivo busca calma, estabilidad sensorial y lealtad duradera. Floreces en ambientes armónicos y predecibles.",
  Géminis: "Procesas tus sentimientos poniéndolos en palabras y analizando lo que ocurre. El diálogo sincero es tu mejor medicina emocional.",
  Cáncer: "Tu mundo emocional es profundo, protector y receptivo. La familia, la memoria y la intimidad del hogar nutren tu bienestar vital.",
  Leo: "Amas con calidez expresiva y lealtad generosa. Necesitas sentir reconocimiento genuino en tus vínculos más cercanos.",
  Virgo: "Expresas cuidado a través de gestos concretos y orden cotidiano. Te da tranquilidad sentir que todo está resuelto con claridad.",
  Libra: "Buscas paz afectiva, reciprocidad y belleza compartida. Tiendes a evitar tensiones bruscas y valoras los vínculos dialogados.",
  Escorpio: "Sientes con profundidad magnética e intensidad transformadora. Valoras la verdad sin máscaras y la entrega emocional auténtica.",
  Sagitario: "Tu ánimo se renueva con espacios abiertos, optimismo y propósito filosófico. Necesitas libertad para no sentirte asfixiado.",
  Capricornio: "Manejas tus afectos con sobriedad, responsabilidad y prudencia. Construyes confianza lenta pero inquebrantable.",
  Acuario: "Aprecias los vínculos basados en la amistad, la libertad mental y el respeto mutuo sin posesividad.",
  Piscis: "Tu radar empático absorbe el clima emocional del entorno. El arte, el silencio y la espiritualidad restauran tu energía.",
};

export function buildLocalNatalReading(chart: NatalChartData, lang: SupportedLanguage = "es"): NatalChartReading {
  const isEs = lang === "es";
  const sunSign = chart.sun.sign;
  const moonSign = chart.moon.sign;
  const ascSign = chart.ascendant.sign;
  const mcSign = chart.midheaven.sign;

  const sunEssence = isEs
    ? `${SUN_ESSENCE_ES[sunSign] || ""} Con el Sol en Casa ${chart.sun.house}, expresas tu vitalidad a través de: ${HOUSE_LIFE_AREAS[chart.sun.house]?.toLowerCase()}.`
    : `Your Sun in ${sunSign} (House ${chart.sun.house}) anchors your conscious vitality, sense of identity, and creative life direction.`;

  const moonSanctuary = isEs
    ? `${MOON_SANCTUARY_ES[moonSign] || ""} Ubicada en Casa ${chart.moon.house}, tu sensibilidad encuentra refugio en: ${HOUSE_LIFE_AREAS[chart.moon.house]?.toLowerCase()}.`
    : `Your Moon in ${moonSign} (House ${chart.moon.house}) reveals your emotional sanctuary, intuitive instincts, and deepest inner needs.`;

  const ascendantDestiny = isEs
    ? `Tu Ascendente en ${ascSign} (${chart.ascendant.degree}°${String(chart.ascendant.minutes).padStart(2, "0")}') es la puerta por la que interactúas con el mundo, regido por ${chart.ascendant.ruler}. Proyectas una energía de elemento ${chart.ascendant.element} y cualidad ${chart.ascendant.modality.toLowerCase()}.`
    : `Your Ascendant in ${ascSign} (${chart.ascendant.degree}°${String(chart.ascendant.minutes).padStart(2, "0")}') shapes how the world first meets your spirit, guided by ${chart.ascendant.ruler}.`;

  const vocationalLegacy = isEs
    ? `Tu Medio Cielo en ${mcSign} orienta tu propósito profesional hacia metas ligadas al signo de ${mcSign} (regido por ${chart.midheaven.ruler}), mientras tu Nodo Norte en ${chart.northNode.sign} (Casa ${chart.northNode.house}) señala la dirección evolutiva de tu alma.`
    : `Your Midheaven in ${mcSign} guides your vocation and enduring legacy, supported by your North Node in ${chart.northNode.sign} (House ${chart.northNode.house}).`;

  const elementalBalance = isEs
    ? `Tu mapa astral muestra predominio de ${chart.dominantElement} (${chart.elements[chart.dominantElement.toLowerCase() as keyof typeof chart.elements]}%) y modalidad ${chart.dominantModality} (${chart.modalities[chart.dominantModality.toLowerCase() as keyof typeof chart.modalities]}%): Fuego ${chart.elements.fuego}%, Tierra ${chart.elements.tierra}%, Aire ${chart.elements.aire}%, Agua ${chart.elements.agua}%.`
    : `Your chart is anchored by ${chart.dominantElement} energy and ${chart.dominantModality} modality (Fire ${chart.elements.fuego}%, Earth ${chart.elements.tierra}%, Air ${chart.elements.aire}%, Water ${chart.elements.agua}%).`;

  const topAspects = chart.aspects.slice(0, 3);
  const aspectsInterpretation = topAspects.length > 0
    ? topAspects.map((a) => `${a.planet1} ${a.symbol} ${a.planet2} (${a.orb}°): ${a.description}`).join(" ")
    : isEs
      ? "Tus planetas operan en equilibrio autónomo con aspectos suaves y definidos."
      : "Your planetary placements interact in clear, balanced symmetry.";

  const energyHeadline = isEs
    ? `Alquimia de ${sunSign}, sensibilidad ${moonSign} y destino ${ascSign}`
    : `${sunSign} Essence, ${moonSign} Heart & ${ascSign} Path`;

  const grandNarrative = `${sunEssence} ${moonSanctuary} ${ascendantDestiny} ${vocationalLegacy}`;

  const cosmicAffirmation = isEs
    ? `Honro mi luz de ${sunSign}, abrazo la sabiduría de mi Luna en ${moonSign} y camino con firmeza hacia mi propósito en ${ascSign}.`
    : `I honor my ${sunSign} essence, trust my ${moonSign} intuition, and walk boldly along my ${ascSign} path.`;

  return {
    energyHeadline,
    sunEssence,
    moonSanctuary,
    ascendantDestiny,
    vocationalLegacy,
    lifePurpose: vocationalLegacy,
    elementalBalance,
    aspectsInterpretation,
    grandNarrative,
    cosmicAffirmation,
    isAiEnhanced: false,
  };
}

export interface SpokenNatalParseResult {
  name?: string;
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  birthCountry?: string;
}

const MONTH_NAME_MAP: Record<string, number> = {
  enero: 1, ene: 1, january: 1, jan: 1, janeiro: 1, janvier: 1, gennaio: 1, januar: 1,
  febrero: 2, feb: 2, february: 2, fevereiro: 2, fevrier: 2, febbraio: 2, februar: 2,
  marzo: 3, mar: 3, march: 3, marco: 3, mars: 3, marz: 3,
  abril: 4, abr: 4, april: 4, apr: 4, avril: 4, aprile: 4,
  mayo: 5, may: 5, maio: 5, mai: 5, maggio: 5,
  junio: 6, jun: 6, june: 6, junho: 6, juin: 6, giugno: 6, juni: 6,
  julio: 7, jul: 7, july: 7, julho: 7, juillet: 7, luglio: 7, juli: 7,
  agosto: 8, ago: 8, august: 8, aug: 8, aout: 8,
  septiembre: 9, setiembre: 9, sep: 9, sept: 9, september: 9, setembro: 9, septembre: 9, settembre: 9,
  octubre: 10, oct: 10, october: 10, outubro: 10, octobre: 10, ottobre: 10, oktober: 10,
  noviembre: 11, nov: 11, november: 11, novembro: 11, novembre: 11,
  diciembre: 12, dic: 12, december: 12, dec: 12, dezembro: 12, decembre: 12, dicembre: 12, dezember: 12,
};

export function parseSpokenNatalInput(transcript: string): SpokenNatalParseResult {
  const raw = (transcript || "").trim();
  const norm = normalizeText(raw);
  const result: SpokenNatalParseResult = {};
  if (!norm) return result;

  // 1. Parse Date: "15 de enero de 1990" / "15 enero 1990"
  const monthRegex = new RegExp(
    `(\\d{1,2})\\s*(?:de\\s+|of\\s+)?(${Object.keys(MONTH_NAME_MAP).join("|")})\\s*(?:de\\s+|del\\s+|of\\s+)?(\\d{4})`,
    "i"
  );
  const monthMatch = norm.match(monthRegex);
  if (monthMatch) {
    const dayNum = Math.min(31, Math.max(1, parseInt(monthMatch[1], 10)));
    const monNum = MONTH_NAME_MAP[monthMatch[2].toLowerCase()];
    const yearNum = parseInt(monthMatch[3], 10);
    if (monNum && yearNum >= 1850 && yearNum <= 2100) {
      result.birthDate = `${yearNum}-${String(monNum).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    }
  } else {
    // Fallback numeric dates: "15/01/1990" or "1990-01-15"
    const isoMatch = norm.match(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
    const dmyMatch = norm.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/);
    if (isoMatch) {
      result.birthDate = `${isoMatch[1]}-${String(parseInt(isoMatch[2], 10)).padStart(2, "0")}-${String(parseInt(isoMatch[3], 10)).padStart(2, "0")}`;
    } else if (dmyMatch) {
      result.birthDate = `${dmyMatch[3]}-${String(parseInt(dmyMatch[2], 10)).padStart(2, "0")}-${String(parseInt(dmyMatch[1], 10)).padStart(2, "0")}`;
    }
  }

  // 2. Parse Time: "14:30", "a las 14 30", "a las 2 y media de la tarde", "a las 9 de la noche"
  if (/\bmediodia\b|\bnoon\b/.test(norm)) {
    result.birthTime = "12:00";
  } else if (/\bmedianoche\b|\bmidnight\b/.test(norm)) {
    result.birthTime = "00:00";
  } else {
    const colonTime = norm.match(/\b(\d{1,2}):(\d{2})(?:\s*(am|pm))?\b/i);
    if (colonTime) {
      let hh = parseInt(colonTime[1], 10);
      const mm = Math.min(59, parseInt(colonTime[2], 10));
      const mer = (colonTime[3] || "").toLowerCase();
      if (mer === "pm" && hh < 12) hh += 12;
      if (mer === "am" && hh === 12) hh = 0;
      if (hh >= 0 && hh <= 23) {
        result.birthTime = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
      }
    } else {
      const spokenTime = norm.match(
        /(?:a\s+las|las|at|hora)\s+(\d{1,2})(?:\s*(?:horas?|hs|h))?(?:\s*(?:y\s+media|y\s+cuarto|y\s+(\d{1,2})|menos\s+cuarto|(\d{2})))?(?:\s*(?:de\s+la\s+(manana|tarde|noche|madrugada)|am|pm))?/i
      );
      if (spokenTime) {
        let hh = parseInt(spokenTime[1], 10);
        let mm = 0;
        const fullPhrase = spokenTime[0].toLowerCase();
        if (fullPhrase.includes("y media")) mm = 30;
        else if (fullPhrase.includes("y cuarto")) mm = 15;
        else if (fullPhrase.includes("menos cuarto")) {
          hh = (hh + 23) % 24;
          mm = 45;
        } else if (spokenTime[2]) {
          mm = Math.min(59, parseInt(spokenTime[2], 10));
        } else if (spokenTime[3]) {
          mm = Math.min(59, parseInt(spokenTime[3], 10));
        }

        const period = (spokenTime[4] || "").toLowerCase();
        if ((period === "tarde" || period === "noche" || fullPhrase.includes("pm")) && hh >= 1 && hh <= 11) {
          hh += 12;
        } else if ((period === "madrugada" || period === "manana" || fullPhrase.includes("am")) && hh === 12) {
          hh = 0;
        }
        if (hh >= 0 && hh <= 23) {
          result.birthTime = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
        }
      }
    }
  }

  // 3. Parse City & Country from CITY_CATALOG aliases (prefer longest alias match)
  let bestAliasLen = 0;
  let bestEntry: CityEntry | null = null;
  for (const entry of CITY_CATALOG) {
    for (const alias of entry.aliases) {
      if (alias.length > bestAliasLen && norm.includes(alias)) {
        bestAliasLen = alias.length;
        bestEntry = entry;
      }
    }
  }
  if (bestEntry) {
    result.birthCity = bestEntry.city;
    result.birthCountry = bestEntry.country;
  }

  // 4. Extract Name if spoken before date/birth trigger words
  const nameCleaned = raw
    .replace(/^(?:hola|soy|me llamo|mi nombre es|para|carta natal de|my name is|i am)\s+/i, "")
    .trim();
  const splitBeforeTrigger = nameCleaned.split(
    /\s*(?:,|naci|nacido|nacida|born|el\s+\d|fecha|\d{1,2}\s+de\s+|\d{4}[-/])/i
  )[0]?.trim();
  if (splitBeforeTrigger && splitBeforeTrigger.length >= 2 && splitBeforeTrigger.length <= 42 && !/^\d+$/.test(splitBeforeTrigger)) {
    result.name = splitBeforeTrigger;
  }

  return result;
}

export function buildNatalSpokenScript(
  chart: NatalChartData,
  reading: NatalChartReading,
  lang: SupportedLanguage = "es"
): string {
  const clean = (val?: string) => (val || "").replace(/\bundefined\b/gi, "").trim();
  const isEs = lang === "es";

  if (!isEs) {
    return [
      `Natal Birth Chart for ${clean(chart.seekerName)}.`,
      `Born on ${chart.birthDate} at ${chart.birthTime} in ${chart.birthCity}, ${chart.birthCountry}.`,
      `Time zone resolved: ${chart.timezoneInfo.offsetLabel}, ${clean(chart.timezoneInfo.dstNote)}.`,
      `Sun in ${chart.sun.sign}, House ${chart.sun.house}. Moon in ${chart.moon.sign}, House ${chart.moon.house}. Ascendant in ${chart.ascendant.sign}. Midheaven in ${chart.midheaven.sign}.`,
      clean(reading.energyHeadline),
      clean(reading.sunEssence),
      clean(reading.moonSanctuary),
      clean(reading.ascendantDestiny),
      clean(reading.vocationalLegacy),
      clean(reading.elementalBalance),
      clean(reading.aspectsInterpretation),
      clean(reading.cosmicAffirmation),
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [
    `Carta Natal de ${clean(chart.seekerName)}.`,
    `Nacimiento el ${chart.birthDate}, a las ${chart.birthTime} horas, en ${chart.birthCity}, ${chart.birthCountry}.`,
    `Huso horario histórico aplicado: ${chart.timezoneInfo.offsetLabel}. ${clean(chart.timezoneInfo.dstNote)}.`,
    `Tu tríada natal: Sol en ${chart.sun.sign} en Casa ${chart.sun.house}, Luna en ${chart.moon.sign} en Casa ${chart.moon.house}, y Ascendente en ${chart.ascendant.sign}. Medio Cielo en ${chart.midheaven.sign} y Nodo Norte en ${chart.northNode.sign}.`,
    clean(reading.energyHeadline),
    clean(reading.sunEssence),
    clean(reading.moonSanctuary),
    clean(reading.ascendantDestiny),
    clean(reading.vocationalLegacy),
    clean(reading.elementalBalance),
    clean(reading.aspectsInterpretation),
    `Afirmación natal: ${clean(reading.cosmicAffirmation)}`,
  ]
    .filter(Boolean)
    .join(" ");
}

async function rasterizeNatalWheelSvgToPng(): Promise<string | null> {
  if (typeof document === "undefined") return null;
  const svgEl = document.getElementById("natal-wheel-svg") as unknown as SVGSVGElement | null;
  if (!svgEl) return null;

  try {
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", "880");
    clone.setAttribute("height", "880");
    const serialized = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    try {
      const img = new Image();
      const loaded = await new Promise<boolean>((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
      if (!loaded) return null;

      const canvas = document.createElement("canvas");
      canvas.width = 880;
      canvas.height = 880;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = "#090514";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/png");
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return null;
  }
}

export async function exportNatalChartPdf(
  chart: NatalChartData,
  reading: NatalChartReading,
  lang: SupportedLanguage = "es"
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
  doc.setFontSize(18);
  doc.setTextColor(76, 29, 149);
  doc.text(isEs ? "INFORME DE CARTA NATAL" : "NATAL BIRTH CHART REPORT", pageWidth / 2, y, { align: "center" });
  y += 6.5;

  doc.setFont("times", "italic");
  doc.setFontSize(10.5);
  doc.setTextColor(75, 85, 99);
  doc.text(
    `${chart.seekerName} • ${chart.birthDate} • ${chart.birthTime} hs • ${chart.birthCity}, ${chart.birthCountry}`,
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 5;

  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(146, 64, 14);
  doc.text(
    `${chart.timezoneInfo.ianaZone} (${chart.timezoneInfo.offsetLabel}) — ${chart.timezoneInfo.dstNote}`,
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 5.5;

  doc.setDrawColor(168, 85, 247);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6.5;

  // Triad Box
  doc.setFillColor(248, 245, 255);
  doc.setDrawColor(196, 181, 253);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");
  doc.setFont("times", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(46, 16, 101);
  doc.text(`Sol: ${chart.sun.sign} (${chart.sun.degree}°${String(chart.sun.minutes).padStart(2, "0")}' • Casa ${chart.sun.house})`, margin + 5, y + 7.5);
  doc.text(`Luna: ${chart.moon.sign} (${chart.moon.degree}°${String(chart.moon.minutes).padStart(2, "0")}' • Casa ${chart.moon.house})`, margin + contentWidth / 2 + 2, y + 7.5);
  doc.text(`Ascendente: ${chart.ascendant.sign} (${chart.ascendant.degree}°${String(chart.ascendant.minutes).padStart(2, "0")}')`, margin + 5, y + 16.5);
  doc.text(`Medio Cielo: ${chart.midheaven.sign} (${chart.midheaven.degree}°${String(chart.midheaven.minutes).padStart(2, "0")}')`, margin + contentWidth / 2 + 2, y + 16.5);
  y += 30;

  // Embed live Natal Wheel SVG rasterized as high-DPI PNG if rendered in DOM
  const wheelPng = await rasterizeNatalWheelSvgToPng();
  if (wheelPng) {
    const wheelSizeMm = 88;
    ensureSpace(wheelSizeMm + 8);
    const wheelX = (pageWidth - wheelSizeMm) / 2;
    doc.setDrawColor(139, 92, 246);
    doc.setLineWidth(0.4);
    doc.roundedRect(wheelX - 1.5, y - 1.5, wheelSizeMm + 3, wheelSizeMm + 3, 2, 2, "S");
    doc.addImage(wheelPng, "PNG", wheelX, y, wheelSizeMm, wheelSizeMm);
    y += wheelSizeMm + 8;
  }

  // Narrative Sections
  const sections: Array<[string, string]> = [
    [isEs ? "Arquetipo Central" : "Core Archetype", reading.energyHeadline],
    [isEs ? "Esencia Solar" : "Solar Essence", reading.sunEssence],
    [isEs ? "Santuario Lunar" : "Lunar Sanctuary", reading.moonSanctuary],
    [isEs ? "Ascendente y Presencia" : "Ascendant & Path", reading.ascendantDestiny],
    [isEs ? "Vocación y Nodo Norte" : "Vocation & North Node", reading.vocationalLegacy],
    [isEs ? "Balance Elemental" : "Elemental Balance", reading.elementalBalance],
    [isEs ? "Aspectos Destacados" : "Key Aspects", reading.aspectsInterpretation],
  ];

  for (const [heading, body] of sections) {
    if (!body) continue;
    const lines = doc.splitTextToSize(body, contentWidth);
    ensureSpace(10 + lines.length * 5);
    doc.setFont("times", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(88, 28, 135);
    doc.text(heading, margin, y);
    y += 5;
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 3.5;
  }

  if (reading.cosmicAffirmation) {
    const affLines = doc.splitTextToSize(`"${reading.cosmicAffirmation}"`, contentWidth - 10);
    const boxH = 11 + affLines.length * 5;
    ensureSpace(boxH + 4);
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, y, contentWidth, boxH, 2, 2, "FD");
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(146, 64, 14);
    doc.text(isEs ? "Afirmación Natal" : "Natal Affirmation", margin + 5, y + 6);
    doc.setFont("times", "italic");
    doc.setTextColor(67, 20, 7);
    doc.text(affLines, margin + 5, y + 11.5);
    y += boxH + 6;
  }

  // Planetary Positions Table
  ensureSpace(18 + chart.planets.length * 5.2);
  doc.setFont("times", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(88, 28, 135);
  doc.text(isEs ? "Posiciones Planetarias y Puntos Clave (VSOP87)" : "Planetary Positions (VSOP87)", margin, y);
  y += 5.5;

  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(31, 41, 55);
  for (const p of chart.planets) {
    ensureSpace(5.5);
    const retroTag = p.isRetrograde ? " (Rx)" : "";
    const row = `${p.name}${retroTag}: ${p.sign} ${String(p.degree).padStart(2, "0")}°${String(p.minutes).padStart(2, "0")}'  •  Casa ${p.house}  •  ${p.element}`;
    doc.text(row, margin + 2, y);
    y += 5;
  }
  y += 4;

  // 12 Astrological Houses Table
  ensureSpace(24);
  doc.setFont("times", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(88, 28, 135);
  doc.text(isEs ? "Cúspides de las 12 Casas Astrológicas" : "12 Astrological Houses Cusps", margin, y);
  y += 5.5;

  doc.setFont("times", "normal");
  doc.setFontSize(9.2);
  doc.setTextColor(31, 41, 55);
  for (let i = 0; i < chart.houses.length; i += 2) {
    ensureSpace(5.5);
    const hLeft = chart.houses[i];
    const hRight = chart.houses[i + 1];
    doc.text(
      `Casa ${hLeft.house}: ${hLeft.sign} ${String(hLeft.degree).padStart(2, "0")}°${String(hLeft.minutes).padStart(2, "0")}' (Reg. ${hLeft.ruler})`,
      margin + 2,
      y
    );
    if (hRight) {
      doc.text(
        `Casa ${hRight.house}: ${hRight.sign} ${String(hRight.degree).padStart(2, "0")}°${String(hRight.minutes).padStart(2, "0")}' (Reg. ${hRight.ruler})`,
        margin + contentWidth / 2 + 2,
        y
      );
    }
    y += 5;
  }

  const safeName = chart.seekerName.replace(/[^a-zA-Z0-9_-]/g, "_") || "Carta_Natal";
  doc.save(`Carta_Natal_${safeName}_${chart.birthDate}.pdf`);
  return true;
}
