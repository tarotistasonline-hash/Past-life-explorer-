import { SupportedLanguage } from "../types";

export interface TranslationDictionary {
  // App Navigation & Header
  appTitle: string;
  appSubtitle: string;
  navAll: string;
  navOuija: string;
  navTarot: string;
  navCodex: string;
  tabOuija: string;
  tabTarot: string;
  tabCodex: string;
  tabAudio: string;
  
  // Atmosphere & Stats
  realVisits: string;
  realVisitsTitle: string;
  visitsModalTitle: string;
  totalRealVisits: string;
  visitsToday: string;
  channeledConsultations: string;
  portalOfficialRecord: string;
  portalRecordDesc: string;
  closeRecord: string;
  solemnVoice: string;
  etherealMusic: string;
  mysticFog: string;
  akashicRecordsBtn: string;
  guideBtn: string;
  guideTitle: string;
  guideStep1Title: string;
  guideStep1Desc: string;
  guideStep2Title: string;
  guideStep2Desc: string;
  guideStep3Title: string;
  guideStep3Desc: string;
  guideStep4Title: string;
  guideStep4Desc: string;
  enterPortalBtn: string;
  
  // Voice Modal
  voiceModalTitle: string;
  voiceModalDesc: string;
  testVoiceTitle: string;
  testVoiceDesc: string;
  playSample: string;
  playingSample: string;
  availableVoices: string;
  autoVoiceOptimal: string;
  autoVoiceDesc: string;
  saveAndClose: string;
  
  // Welcome Modal
  welcomeGreeting: string;
  welcomeIntro: string;
  welcomeWarning: string;
  welcomeClose: string;
  welcomeListenVoice: string;
  welcomeStopVoice: string;
  welcomeVoiceText: string;
  welcomeModalTitle: string;
  welcomeModalSubtitle: string;
  welcomeCard1: string;
  welcomeCard2: string;
  enterBoardBtn: string;
  skipWelcomeBtn: string;

  // Ouija Board Canvas & Status
  ouijaBoardTitle: string;
  ouijaSpelling: string;
  ouijaPlanchetteIdle: string;
  ouijaPlanchetteReady: string;
  ouijaSpelledWord: string;
  ouijaYes: string;
  ouijaNo: string;
  ouijaGoodbye: string;
  channeledSymbols: string;
  invokingSpirits: string;
  makeYourConsultation: string;
  moon: string;
  sun: string;
  yes: string;
  no: string;
  goodbye: string;

  // Spirit Oracle Form
  askTheSpirits: string;
  pastLifeSearch: string;
  inputYourName: string;
  inputYourQuestion: string;
  inputBirthEra: string;
  inputFeeling: string;
  revealPastLifeBtn: string;
  askOuijaBtn: string;
  revealingSpirit: string;
  micListening: string;
  micSpeakNow: string;
  micTooltip: string;
  micNotSupported: string;
  micDenied: string;
  micError: string;
  listeningVoice: string;
  stopMic: string;
  tabPastLife: string;
  tabSpiritOracle: string;
  inputNameLabel: string;
  inputBirthYearLabel: string;
  inputFocusQueryLabel: string;
  pastLifeDescBanner: string;
  useMic: string;
  quickConsultsTitle: string;
  preset1: string;
  preset2: string;
  preset3: string;
  preset4: string;
  consultByVoice: string;
  channelingMsg: string;
  oracleQuestionLabel: string;
  oracleQuestionPlaceholder: string;
  
  // Daily Tarot (Marseille)
  tarotTitle: string;
  tarotSubtitle: string;
  tarotUniversalTitle: string;
  tarotPersonalDrawTitle: string;
  tarotShuffleBtn: string;
  tarotShuffling: string;
  tarotMarseilleWoodcut: string;
  tarotMarseilleTitle: string;
  tarotKeywords: string;
  tarotElement: string;
  tarotAstro: string;
  tarotArchetype: string;
  tarotDailyMessage: string;
  tarotLightAspect: string;
  tarotShadowAspect: string;
  tarotPracticalAdvice: string;
  tarotDailyAffirmation: string;
  tarotMeditationQuestion: string;
  tarotShareCard: string;
  tarotCardCopied: string;
  tarotViewAllArcana: string;
  tarotAllArcanaTitle: string;
  
  // Past Life Modal & Codex
  pastLifeModalTitle: string;
  pastLifeModalReadingFor: string;
  pastLifeModalSoulAura: string;
  pastLifeModalVision: string;
  pastLifeModalListen: string;
  pastLifeModalIdentity: string;
  pastLifeModalChronicle: string;
  pastLifeModalTransition: string;
  pastLifeModalKarma: string;
  pastLifeModalRelic: string;
  pastLifeModalSaved: string;
  pastLifeModalSaveCodex: string;
  pastLifeModalClose: string;
  pastLifeEra: string;
  pastLifeRole: string;
  pastLifeNarrative: string;
  pastLifeDeath: string;
  pastLifeKarma: string;
  pastLifeSoulConnection: string;
  pastLifeRelic: string;
  pastLifeSaveToCodex: string;
  pastLifeSaved: string;
  pastLifeShare: string;
  pastLifeClose: string;
  codexTitle: string;
  codexSubtitle: string;
  codexEmpty: string;
  codexEmptyDesc: string;
  codexView: string;
  codexViewDetails: string;
  codexDelete: string;
  clearCodex: string;

  // Spirit Responses & Alerts in App
  channeledMessageTitle: string;
  listenSolemnVoice: string;
  makeAnotherConsultation: string;
  errorAkashicConnection: string;
  errorOracleConnection: string;
  askCardMessage: string;
  
  // Mystic Coffee Offering
  coffeeOfferTitle: string;
  coffeeOfferDesc: string;
  coffeeOfferBtn: string;
  coffeeFooterLink: string;
  
  // Footer
  footerDisclaimer: string;
  footerTitle: string;
  footerCoffeeLink: string;
  footerRights: string;
  languageSelect: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  es: {
    appTitle: "TABLA OUIJA INTERACTIVA",
    appSubtitle: "Oráculo de Registros Akáshicos & Vidas Pasadas",
    navAll: "Todo el Portal",
    navOuija: "Tabla Ouija & Oráculo",
    navTarot: "Arcano del Día (Tarot)",
    navCodex: "Códice",
    tabOuija: "Tabla Ouija",
    tabTarot: "Arcano de Marsella",
    tabCodex: "Codex del Alma",
    tabAudio: "Atmósfera",
    
    realVisits: "visitas reales",
    realVisitsTitle: "Contador de Visitas Reales y Almas en el Portal",
    visitsModalTitle: "Contador de Visitas Reales",
    totalRealVisits: "Total Visitas Reales",
    visitsToday: "Visitas Hoy",
    channeledConsultations: "Consultas Akáshicas Canalizadas",
    portalOfficialRecord: "Registro Oficial del Portal",
    portalRecordDesc: "Este contador registra en tiempo real cada alma que accede al oráculo y realiza una consulta de vidas pasadas a través de la tabla Ouija.",
    closeRecord: "Cerrar Registro",
    solemnVoice: "Voz Solemne",
    etherealMusic: "Música Ethereal",
    mysticFog: "Bruma Mística",
    akashicRecordsBtn: "Registros Akáshicos",
    guideBtn: "Guía",
    guideTitle: "Guía del Portal Akáshico",
    guideStep1Title: "1. Lectura de Vidas Pasadas:",
    guideStep1Desc: "Ingresa tu nombre e intención opcional. Al pulsar 'Revelar Vida Pasada', la plancheta se moverá físicamente sobre la Ouija para deletrear las claves de tu encarnación anterior.",
    guideStep2Title: "2. Consultas por Micrófono:",
    guideStep2Desc: "Puedes dictar tus intenciones o preguntas directamente hablando a través de tu micrófono. La plancheta Ouija se desplazará automáticamente sobre la tabla para responderte.",
    guideStep3Title: "3. Codex del Alma:",
    guideStep3Desc: "Cada vida pasada descubierta incluye su época, relato histórico, causa de transición y lección kármica.",
    guideStep4Title: "4. Voz Masculina Solemne y Atmósfera:",
    guideStep4Desc: "Escucha los mensajes dictados solemnemente por el guardián y activa la bruma mística para una inmersión completa.",
    enterPortalBtn: "Comprender y Entrar al Portal",
    
    voiceModalTitle: "Voz Solemne y Neutra de Hombre",
    voiceModalDesc: "El oráculo utiliza una voz masculina solemne, calmada y de tono neutro con cadencia deliberada para transmitir las revelaciones de los Registros Akáshicos.",
    testVoiceTitle: "Probar Voz Masculina Solemne",
    testVoiceDesc: "Escucha una muestra del tono y solemnidad del guardián",
    playSample: "Escuchar Muestra",
    playingSample: "Reproduciendo...",
    availableVoices: "Voces Masculinas Disponibles en tu Dispositivo",
    autoVoiceOptimal: "✨ Selección Automática Óptima (Hombre Solemne Neutro)",
    autoVoiceDesc: "Tono profundo, ritmo pausado y solemne",
    saveAndClose: "Guardar y Cerrar",
    
    welcomeGreeting: "Bienvenido al Umbral Akáshico",
    welcomeIntro: "Estás a punto de conectar con la memoria primordial del alma. La tabla Ouija y el Tarot de Marsella actúan como puentes sutiles entre planos de consciencia.",
    welcomeWarning: "Formula tus preguntas con respeto e introspección. Cada respuesta deletreada por la plancheta porta una lección para tu momento presente.",
    welcomeClose: "Iniciar Experiencia",
    welcomeListenVoice: "Escuchar Voz del Guardián",
    welcomeStopVoice: "Detener Voz",
    welcomeVoiceText: "Te damos la bienvenida a la consulta de Registros Akáshicos y Vidas Pasadas. Descubre quién fuiste en tus encarnaciones anteriores y la sabiduría ancestral de tu alma a través de la canalización de la plancheta.",
    welcomeModalTitle: "Registros Akáshicos",
    welcomeModalSubtitle: "Descubre quién fuiste en tus encarnaciones pasadas y la sabiduría ancestral de tu alma",
    welcomeCard1: "Encarnaciones Pasadas",
    welcomeCard2: "Codex de Tu Alma",
    enterBoardBtn: "Ingresar a la Tabla Ouija",
    skipWelcomeBtn: "Saltar e ir directamente a la consulta",

    ouijaBoardTitle: "Oráculo de la Tabla Ouija",
    ouijaSpelling: "La plancheta está canalizando el mensaje...",
    ouijaPlanchetteIdle: "Plancheta en reposo sobre el centro cósmico",
    ouijaPlanchetteReady: "Canalización completada",
    ouijaSpelledWord: "Palabra Deletreada",
    ouijaYes: "SÍ",
    ouijaNo: "NO",
    ouijaGoodbye: "ADIÓS",
    channeledSymbols: "Símbolos Canalizados:",
    invokingSpirits: "Invocando espíritus...",
    makeYourConsultation: "Haz tu consulta mediante el micrófono o el formulario...",
    moon: "LUNA",
    sun: "SOL",
    yes: "SÍ",
    no: "NO",
    goodbye: "ADIÓS",

    askTheSpirits: "Consultar a los Registros Akáshicos",
    pastLifeSearch: "Canalizar Vida Pasada",
    inputYourName: "Ej: Sofia / Alejandro",
    inputYourQuestion: "¿Qué deseas preguntar a los Registros?",
    inputBirthEra: "Año de nacimiento (opcional)",
    inputFeeling: "¿Qué emoción o inquietud buscas aclarar hoy?",
    revealPastLifeBtn: "Revelar Vida Pasada",
    askOuijaBtn: "Preguntar a la Tabla",
    revealingSpirit: "Canalizando desde el Akasha...",
    micListening: "Escuchando tu voz... habla con claridad",
    micSpeakNow: "Dictar con la voz",
    micTooltip: "Haz clic para hablar y formular tu pregunta directamente con el micrófono",
    micNotSupported: "El reconocimiento de voz no está soportado en este navegador. Puedes escribir tu consulta.",
    micDenied: "Permiso de micrófono denegado. Por favor aprueba el acceso al micrófono.",
    micError: "No se pudo detectar voz clara. Intenta pulsar de nuevo e intentar hablar.",
    listeningVoice: "Escuchando tu voz... Formula tu consulta a los Registros Akáshicos",
    stopMic: "Detener",
    tabPastLife: "Lectura Vidas Pasadas",
    tabSpiritOracle: "Consulta Akáshica Abierta",
    inputNameLabel: "Nombre o Apodo (Opcional)",
    inputBirthYearLabel: "Año de Nacimiento (Opcional)",
    inputFocusQueryLabel: "Pregunta o Intención Especial (Opcional)",
    pastLifeDescBanner: "Los Registros Akáshicos revelarán la vida pasada y memoria ancestral que habita en tu alma.",
    useMic: "Usar Micrófono",
    quickConsultsTitle: "Consultas Rápidas a los Registros:",
    preset1: "¿Quién fui en mi vida anterior?",
    preset2: "¿Cuál es mi lección kármica principal?",
    preset3: "¿Dónde viví en mi vida pasada?",
    preset4: "¿Qué talento traigo de otra época?",
    consultByVoice: "Consultar por Micrófono",
    channelingMsg: "Canalizando Registros Akáshicos...",
    oracleQuestionLabel: "Formula tu Pregunta por Voz o Texto",
    oracleQuestionPlaceholder: "Ej: ¿Cuál es el aprendizaje o propósito de mi alma en esta encarnación?",
    
    tarotTitle: "ARCANO DEL DÍA • TAROT DE MARSELLA",
    tarotSubtitle: "Xilografía Sagrada de Marsella y Revelación Akáshica",
    tarotUniversalTitle: "Energía Universal del Día",
    tarotPersonalDrawTitle: "Tu Tirada Personal",
    tarotShuffleBtn: "Barajar y Tirar Arcano",
    tarotShuffling: "Barajando mazo marsellés...",
    tarotMarseilleWoodcut: "Xilografía Tradicional Francesa (Siglo XVIII)",
    tarotMarseilleTitle: "Título en Marsella",
    tarotKeywords: "Claves Arquetípicas",
    tarotElement: "Elemento",
    tarotAstro: "Astro / Correspondencia",
    tarotArchetype: "Arquetipo Universal",
    tarotDailyMessage: "Mensaje Akáshico del Día",
    tarotLightAspect: "Aspecto de Luz",
    tarotShadowAspect: "Aspecto de Sombra",
    tarotPracticalAdvice: "Consejo Práctico para Hoy",
    tarotDailyAffirmation: "Afirmación Cuántica",
    tarotMeditationQuestion: "Pregunta de Meditación",
    tarotShareCard: "Compartir Arcano",
    tarotCardCopied: "¡Mensaje copiado al portapapeles!",
    tarotViewAllArcana: "Ver los 22 Arcanos Mayores",
    tarotAllArcanaTitle: "Los 22 Arcanos Mayores de Marsella",
    
    pastLifeModalTitle: "Revelación Akáshica: Memoria de tu Vida Pasada",
    pastLifeModalReadingFor: "Lectura Akáshica para",
    pastLifeModalSoulAura: "Aura del Alma",
    pastLifeModalVision: "Visión Mística de la Encarnación",
    pastLifeModalListen: "Escuchar Relato Completo en Voz Solemne",
    pastLifeModalIdentity: "Identidad y Ocupación del Alma",
    pastLifeModalChronicle: "Crónica de la Encarnación",
    pastLifeModalTransition: "Paso Terrenal",
    pastLifeModalKarma: "Lección Kármica Actual",
    pastLifeModalRelic: "Objeto Canalizador del Alma",
    pastLifeModalSaved: "Guardado en Codex",
    pastLifeModalSaveCodex: "Guardar en Codex del Alma",
    pastLifeModalClose: "Cerrar Lectura",
    pastLifeEra: "Época y Lugar de Encarnación",
    pastLifeRole: "Identidad y Rol del Alma",
    pastLifeNarrative: "Relato Histórico del Alma",
    pastLifeDeath: "Momento de Transición",
    pastLifeKarma: "Lección Kármica para el Presente",
    pastLifeSoulConnection: "Resonancia y Vínculos de Alma",
    pastLifeRelic: "Reliquia Espiritual Canalizadora",
    pastLifeSaveToCodex: "Guardar en mi Codex",
    pastLifeSaved: "¡Guardado en el Codex!",
    pastLifeShare: "Compartir Revelación",
    pastLifeClose: "Cerrar Revelación",
    codexTitle: "Codex de Vidas Pasadas",
    codexSubtitle: "Compendio de encarnaciones y memorias akáshicas canalizadas",
    codexEmpty: "Codex del Alma Vacío",
    codexEmptyDesc: "Realiza una consulta a los Registros Akáshicos para descubrir y registrar tus encarnaciones pasadas.",
    codexView: "Ver",
    codexViewDetails: "Ver Relato Completo",
    codexDelete: "Eliminar del Codex",
    clearCodex: "Limpiar Codex",

    channeledMessageTitle: "Mensaje Canalizado de los Registros Akáshicos",
    listenSolemnVoice: "Escuchar con Voz Solemne",
    makeAnotherConsultation: "Realizar Otra Consulta",
    errorAkashicConnection: "No se pudo conectar con los Registros Akáshicos. Por favor reintenta tu consulta.",
    errorOracleConnection: "No se pudo canalizar la información de los Registros Akáshicos.",
    askCardMessage: "¿Cuál es el mensaje del Arcano",
    
    coffeeOfferTitle: "¿Un cafecito humeante para calmar a las entidades?",
    coffeeOfferDesc: "Ofrenda voluntaria para apaciguar espíritus y sostener los oráculos.",
    coffeeOfferBtn: "Invitar Cafecito",
    coffeeFooterLink: "Cafecito para el Médium",
    
    footerDisclaimer: "Tabla Ouija Interactiva • Registros Akáshicos y Lectura de Vidas Pasadas",
    footerTitle: "Tabla Ouija Interactiva • Registros Akáshicos y Lectura de Vidas Pasadas",
    footerCoffeeLink: "Cafecito para el Médium",
    footerRights: "Experiencia espiritual y oracular interactiva",
    languageSelect: "Idioma",
  },
  en: {
    appTitle: "INTERACTIVE OUIJA BOARD",
    appSubtitle: "Akashic Records Oracle & Past Lives Revelations",
    navAll: "Full Portal",
    navOuija: "Ouija Board & Oracle",
    navTarot: "Arcana of the Day (Tarot)",
    navCodex: "Codex",
    tabOuija: "Ouija Board",
    tabTarot: "Marseille Arcana",
    tabCodex: "Soul Codex",
    tabAudio: "Atmosphere",
    
    realVisits: "real visitors",
    realVisitsTitle: "Counter of Real Visitors and Souls in the Portal",
    visitsModalTitle: "Real Visitor Counter",
    totalRealVisits: "Total Real Visits",
    visitsToday: "Visits Today",
    channeledConsultations: "Channeled Akashic Consultations",
    portalOfficialRecord: "Official Portal Registry",
    portalRecordDesc: "This counter registers in real time every soul that accesses the oracle and conducts a past life consultation through the Ouija board.",
    closeRecord: "Close Registry",
    solemnVoice: "Solemn Voice",
    etherealMusic: "Ethereal Music",
    mysticFog: "Mystic Mist",
    akashicRecordsBtn: "Akashic Records",
    guideBtn: "Guide",
    guideTitle: "Akashic Portal Guide",
    guideStep1Title: "1. Past Life Reading:",
    guideStep1Desc: "Enter your name and optional intention. Upon clicking 'Reveal Past Life', the planchette physically glides over the Ouija board to spell out the keys to your previous incarnation.",
    guideStep2Title: "2. Voice Consultations:",
    guideStep2Desc: "You can speak your intentions or inquiries directly through your microphone. The Ouija planchette will automatically move across the board to answer you.",
    guideStep3Title: "3. Soul Codex:",
    guideStep3Desc: "Each discovered past life includes its historical era, narrative, transition moment, and karmic lesson.",
    guideStep4Title: "4. Solemn Male Voice & Atmosphere:",
    guideStep4Desc: "Listen to the revelations spoken solemnly by the guardian and enable mystical mist for total immersion.",
    enterPortalBtn: "Understand and Enter Portal",
    
    voiceModalTitle: "Solemn & Neutral Male Voice",
    voiceModalDesc: "The oracle uses a solemn, calm, neutral-toned masculine voice with deliberate cadence to deliver Akashic revelations.",
    testVoiceTitle: "Test Solemn Male Voice",
    testVoiceDesc: "Listen to a sample of the guardian's tone and solemnity",
    playSample: "Listen to Sample",
    playingSample: "Playing...",
    availableVoices: "Available Male Voices on Your Device",
    autoVoiceOptimal: "✨ Optimal Automatic Selection (Neutral Solemn Male)",
    autoVoiceDesc: "Deep tone, deliberate pace and solemn presence",
    saveAndClose: "Save and Close",
    
    welcomeGreeting: "Welcome to the Akashic Threshold",
    welcomeIntro: "You are about to connect with primordial soul memory. The Ouija board and the Tarot of Marseille act as subtle bridges between realms of consciousness.",
    welcomeWarning: "Frame your questions with reverence and introspection. Every message spelled by the planchette carries a lesson for your present path.",
    welcomeClose: "Begin Experience",
    welcomeListenVoice: "Listen to Guardian Voice",
    welcomeStopVoice: "Stop Voice",
    welcomeVoiceText: "We welcome you to the Akashic Records and Past Lives consultation. Discover who you were in your past incarnations and the ancient wisdom of your soul through the channeling of the planchette.",
    welcomeModalTitle: "Akashic Records",
    welcomeModalSubtitle: "Discover who you were in your past incarnations and your soul's ancestral wisdom",
    welcomeCard1: "Past Incarnations",
    welcomeCard2: "Soul Codex",
    enterBoardBtn: "Enter the Ouija Board",
    skipWelcomeBtn: "Skip and go directly to consultation",

    ouijaBoardTitle: "Ouija Board Oracle",
    ouijaSpelling: "The planchette is channeling the message...",
    ouijaPlanchetteIdle: "Planchette resting at the cosmic center",
    ouijaPlanchetteReady: "Channeling completed",
    ouijaSpelledWord: "Spelled Word",
    ouijaYes: "YES",
    ouijaNo: "NO",
    ouijaGoodbye: "GOODBYE",
    channeledSymbols: "Channeled Symbols:",
    invokingSpirits: "Invoking spirits...",
    makeYourConsultation: "Make your inquiry using the microphone or form...",
    moon: "MOON",
    sun: "SUN",
    yes: "YES",
    no: "NO",
    goodbye: "GOODBYE",

    askTheSpirits: "Consult the Akashic Records",
    pastLifeSearch: "Channel Past Life",
    inputYourName: "E.g. Sophia / Alexander",
    inputYourQuestion: "What do you wish to ask the Records?",
    inputBirthEra: "Birth year (optional)",
    inputFeeling: "What emotion or question are you seeking clarity on today?",
    revealPastLifeBtn: "Reveal Past Life",
    askOuijaBtn: "Ask the Board",
    revealingSpirit: "Channeling from the Akasha...",
    micListening: "Listening to your voice... speak clearly",
    micSpeakNow: "Speak with Voice",
    micTooltip: "Click to speak and ask your question directly using your microphone",
    micNotSupported: "Speech recognition is not supported on this browser. You can type your inquiry.",
    micDenied: "Microphone permission denied. Please approve microphone access.",
    micError: "Could not detect clear voice. Try clicking again and speaking.",
    listeningVoice: "Listening to your voice... Formulate your Akashic inquiry",
    stopMic: "Stop",
    tabPastLife: "Past Life Reading",
    tabSpiritOracle: "Open Akashic Consultation",
    inputNameLabel: "Name or Alias (Optional)",
    inputBirthYearLabel: "Birth Year (Optional)",
    inputFocusQueryLabel: "Special Question or Intention (Optional)",
    pastLifeDescBanner: "The Akashic Records will reveal the past life and ancestral memory residing in your soul.",
    useMic: "Use Microphone",
    quickConsultsTitle: "Quick Inquiries to the Records:",
    preset1: "Who was I in my previous life?",
    preset2: "What is my primary karmic lesson?",
    preset3: "Where did I live in my past life?",
    preset4: "What talent do I bring from another era?",
    consultByVoice: "Consult by Microphone",
    channelingMsg: "Channeling Akashic Records...",
    oracleQuestionLabel: "Formulate Your Question by Voice or Text",
    oracleQuestionPlaceholder: "E.g. What is the spiritual purpose of my soul in this incarnation?",
    
    tarotTitle: "ARCANA OF THE DAY • TAROT OF MARSEILLE",
    tarotSubtitle: "Sacred Marseille Woodcut & Akashic Revelation",
    tarotUniversalTitle: "Universal Energy of the Day",
    tarotPersonalDrawTitle: "Your Personal Draw",
    tarotShuffleBtn: "Shuffle & Draw Arcana",
    tarotShuffling: "Shuffling Marseille deck...",
    tarotMarseilleWoodcut: "Traditional French Woodcut (18th Century)",
    tarotMarseilleTitle: "Marseille Title",
    tarotKeywords: "Archetypal Keywords",
    tarotElement: "Element",
    tarotAstro: "Astro / Correspondence",
    tarotArchetype: "Universal Archetype",
    tarotDailyMessage: "Akashic Message of the Day",
    tarotLightAspect: "Light Aspect",
    tarotShadowAspect: "Shadow Aspect",
    tarotPracticalAdvice: "Practical Advice for Today",
    tarotDailyAffirmation: "Quantum Affirmation",
    tarotMeditationQuestion: "Meditation Inquiry",
    tarotShareCard: "Share Arcana",
    tarotCardCopied: "Message copied to clipboard!",
    tarotViewAllArcana: "View All 22 Major Arcana",
    tarotAllArcanaTitle: "The 22 Major Arcana of Marseille",
    
    pastLifeModalTitle: "Akashic Revelation: Memory of Your Past Life",
    pastLifeModalReadingFor: "Akashic Reading for",
    pastLifeModalSoulAura: "Soul Aura",
    pastLifeModalVision: "Mystic Vision of Incarnation",
    pastLifeModalListen: "Listen to Full Narrative in Solemn Voice",
    pastLifeModalIdentity: "Soul Identity & Occupation",
    pastLifeModalChronicle: "Chronicle of Incarnation",
    pastLifeModalTransition: "Earthly Transition",
    pastLifeModalKarma: "Current Karmic Lesson",
    pastLifeModalRelic: "Soul Channeling Relic",
    pastLifeModalSaved: "Saved in Codex",
    pastLifeModalSaveCodex: "Save to Soul Codex",
    pastLifeModalClose: "Close Reading",
    pastLifeEra: "Incarnation Era and Location",
    pastLifeRole: "Soul Identity and Role",
    pastLifeNarrative: "Historical Soul Chronicle",
    pastLifeDeath: "Moment of Transition",
    pastLifeKarma: "Karmic Lesson for the Present",
    pastLifeSoulConnection: "Soul Resonance and Bonds",
    pastLifeRelic: "Channeling Spiritual Relic",
    pastLifeSaveToCodex: "Save to My Codex",
    pastLifeSaved: "Saved in Codex!",
    pastLifeShare: "Share Revelation",
    pastLifeClose: "Close Revelation",
    codexTitle: "Past Life Codex",
    codexSubtitle: "Compendium of channeled incarnations and akashic memories",
    codexEmpty: "Soul Codex is Empty",
    codexEmptyDesc: "Make a consultation to the Akashic Records to uncover and record your past incarnations.",
    codexView: "View",
    codexViewDetails: "View Full Chronicle",
    codexDelete: "Remove from Codex",
    clearCodex: "Clear Codex",

    channeledMessageTitle: "Channeled Message from the Akashic Records",
    listenSolemnVoice: "Listen in Solemn Voice",
    makeAnotherConsultation: "Make Another Consultation",
    errorAkashicConnection: "Could not connect to the Akashic Records. Please retry your inquiry.",
    errorOracleConnection: "Could not channel information from the Akashic Records.",
    askCardMessage: "What is the message of Arcana",
    
    coffeeOfferTitle: "A steaming cup of coffee to soothe the entities?",
    coffeeOfferDesc: "Voluntary offering to appease spirits and sustain the oracles.",
    coffeeOfferBtn: "Treat to Coffee",
    coffeeFooterLink: "Coffee for the Medium",
    
    footerDisclaimer: "Interactive Ouija Board • Akashic Records & Past Life Reading",
    footerTitle: "Interactive Ouija Board • Akashic Records & Past Life Reading",
    footerCoffeeLink: "Coffee for the Medium",
    footerRights: "Interactive spiritual and oracular experience",
    languageSelect: "Language",
  },
  pt: {
    appTitle: "TABULEIRO OUIJA INTERATIVO",
    appSubtitle: "Oráculo de Registros Akáshicos & Vidas Passadas",
    navAll: "Portal Completo",
    navOuija: "Tabuleiro Ouija & Oráculo",
    navTarot: "Arcano do Dia (Tarô)",
    navCodex: "Códex",
    tabOuija: "Tabuleiro Ouija",
    tabTarot: "Arcano de Marselha",
    tabCodex: "Códex da Alma",
    tabAudio: "Atmosfera",
    
    realVisits: "visitas reais",
    realVisitsTitle: "Contador de Visitas Reais e Almas no Portal",
    visitsModalTitle: "Contador de Visitas Reais",
    totalRealVisits: "Total de Visitas Reais",
    visitsToday: "Visitas Hoje",
    channeledConsultations: "Consultas Akáshicas Canalizadas",
    portalOfficialRecord: "Registro Oficial do Portal",
    portalRecordDesc: "Este contador registra em tempo real cada alma que acessa o oráculo e realiza uma consulta de vidas passadas pelo tabuleiro Ouija.",
    closeRecord: "Fechar Registro",
    solemnVoice: "Voz Solene",
    etherealMusic: "Música Etérea",
    mysticFog: "Névoa Mística",
    akashicRecordsBtn: "Registros Akáshicos",
    guideBtn: "Guia",
    guideTitle: "Guia do Portal Akáshico",
    guideStep1Title: "1. Leitura de Vidas Passadas:",
    guideStep1Desc: "Insira seu nome e intenção opcional. Ao clicar em 'Revelar Vida Passada', a prancheta deslizará sobre a Ouija para soletrar as chaves de sua encarnação anterior.",
    guideStep2Title: "2. Consultas por Voz:",
    guideStep2Desc: "Você pode ditar suas intenções ou perguntas diretamente pelo microfone. A prancheta Ouija se moverá automaticamente para responder.",
    guideStep3Title: "3. Códex da Alma:",
    guideStep3Desc: "Cada vida passada descoberta inclui sua época histórica, narrativa, momento de transição e lição cármica.",
    guideStep4Title: "4. Voz Masculina Solene e Atmosfera:",
    guideStep4Desc: "Ouça as revelações ditadas solenemente pelo guardião e ative a névoa mística para imersão total.",
    enterPortalBtn: "Compreender e Entrar no Portal",
    
    voiceModalTitle: "Voz Solene e Neutra Masculina",
    voiceModalDesc: "O oráculo utiliza uma voz masculina solene, calma e neutra para transmitir as revelações dos Registros Akáshicos.",
    testVoiceTitle: "Testar Voz Masculina Solene",
    testVoiceDesc: "Ouça uma amostra do tom e da solenidade do guardião",
    playSample: "Ouvir Amostra",
    playingSample: "Reproduzindo...",
    availableVoices: "Vozes Masculinas Disponíveis no Dispositivo",
    autoVoiceOptimal: "✨ Seleção Automática Ideal (Homem Solene Neutro)",
    autoVoiceDesc: "Tom profundo, ritmo pausado e solene",
    saveAndClose: "Salvar e Fechar",
    
    welcomeGreeting: "Bem-vindo ao Limiar Akáshico",
    welcomeIntro: "Você está prestes a se conectar com a memória primordial da alma. O tabuleiro Ouija e o Tarô de Marselha atuam como pontes sutis entre planos de consciência.",
    welcomeWarning: "Formule suas perguntas com respeito e introspecção. Cada resposta soletrada pela prancheta traz uma lição para o seu momento presente.",
    welcomeClose: "Iniciar Experiência",
    welcomeListenVoice: "Ouvir Voz do Guardião",
    welcomeStopVoice: "Parar Voz",
    welcomeVoiceText: "Damos-lhe as boas-vindas à consulta dos Registos Akáshicos e Vidas Passadas. Descubra quem foi nas suas encarnações anteriores e a sabedoria ancestral da sua alma através da canalização da prancheta.",
    welcomeModalTitle: "Registros Akáshicos",
    welcomeModalSubtitle: "Descubra quem você foi em suas encarnações passadas e a sabedoria ancestral da sua alma",
    welcomeCard1: "Encarnações Passadas",
    welcomeCard2: "Códex da Alma",
    enterBoardBtn: "Entrar no Tabuleiro Ouija",
    skipWelcomeBtn: "Pular e ir direto à consulta",

    ouijaBoardTitle: "Oráculo do Tabuleiro Ouija",
    ouijaSpelling: "A prancheta está canalizando a mensagem...",
    ouijaPlanchetteIdle: "Prancheta em repouso no centro cósmico",
    ouijaPlanchetteReady: "Canalização concluída",
    ouijaSpelledWord: "Palavra Soletrada",
    ouijaYes: "SIM",
    ouijaNo: "NÃO",
    ouijaGoodbye: "ADEUS",
    channeledSymbols: "Símbolos Canalizados:",
    invokingSpirits: "Invocando espíritos...",
    makeYourConsultation: "Faça sua consulta pelo microfone ou formulário...",
    moon: "LUA",
    sun: "SOL",
    yes: "SIM",
    no: "NÃO",
    goodbye: "ADEUS",

    askTheSpirits: "Consultar os Registros Akáshicos",
    pastLifeSearch: "Canalizar Vida Passada",
    inputYourName: "Ex: Sofia / Alexandre",
    inputYourQuestion: "O que deseja perguntar aos Registros?",
    inputBirthEra: "Ano de nascimento (opcional)",
    inputFeeling: "Qual emoção ou dúvida busca esclarecer hoje?",
    revealPastLifeBtn: "Revelar Vida Passada",
    askOuijaBtn: "Perguntar ao Tabuleiro",
    revealingSpirit: "Canalizando a partir do Akasha...",
    micListening: "Ouvindo sua voz... fale com clareza",
    micSpeakNow: "Falar com a Voz",
    micTooltip: "Clique para falar e formular sua pergunta diretamente com o microfone",
    micNotSupported: "O reconhecimento de voz não é suportado neste navegador. Você pode digitar sua consulta.",
    micDenied: "Permissão de microfone negada. Por favor, aprove o acesso ao microfone.",
    micError: "Não foi possível detectar uma voz clara. Tente clicar novamente e falar.",
    listeningVoice: "Ouvindo sua voz... Formule sua consulta aos Registros Akáshicos",
    stopMic: "Parar",
    tabPastLife: "Leitura Vidas Passadas",
    tabSpiritOracle: "Consulta Akáshica Aberta",
    inputNameLabel: "Nome ou Apelido (Opcional)",
    inputBirthYearLabel: "Ano de Nascimento (Opcional)",
    inputFocusQueryLabel: "Pergunta ou Intenção Especial (Opcional)",
    pastLifeDescBanner: "Os Registros Akáshicos revelarão a vida passada e memória ancestral que habita em sua alma.",
    useMic: "Usar Microfone",
    quickConsultsTitle: "Consultas Rápidas aos Registros:",
    preset1: "Quem fui eu na minha vida anterior?",
    preset2: "Qual é a minha lição cármica principal?",
    preset3: "Onde vivi na minha vida passada?",
    preset4: "Qual talento trago de outra época?",
    consultByVoice: "Consultar por Microfone",
    channelingMsg: "Canalizando Registros Akáshicos...",
    oracleQuestionLabel: "Formule sua Pergunta por Voz ou Texto",
    oracleQuestionPlaceholder: "Ex: Qual é o aprendizado ou propósito da minha alma nesta encarnação?",
    
    tarotTitle: "ARCANO DO DIA • TARÔ DE MARSELHA",
    tarotSubtitle: "Xilogravura Sagrada de Marselha & Revelação Akáshica",
    tarotUniversalTitle: "Energia Universal do Dia",
    tarotPersonalDrawTitle: "Sua Tiragem Pessoal",
    tarotShuffleBtn: "Embaralhar e Tirar Arcano",
    tarotShuffling: "Embaralhando baralho de Marselha...",
    tarotMarseilleWoodcut: "Xilogravura Tradicional Francesa (Século XVIII)",
    tarotMarseilleTitle: "Título em Marselha",
    tarotKeywords: "Chaves Arquetípicas",
    tarotElement: "Elemento",
    tarotAstro: "Astro / Correspondência",
    tarotArchetype: "Arquétipo Universal",
    tarotDailyMessage: "Mensagem Akáshica do Dia",
    tarotLightAspect: "Aspecto de Luz",
    tarotShadowAspect: "Aspecto de Sombra",
    tarotPracticalAdvice: "Conselho Prático para Hoje",
    tarotDailyAffirmation: "Afirmação Quântica",
    tarotMeditationQuestion: "Pergunta de Meditação",
    tarotShareCard: "Compartilhar Arcano",
    tarotCardCopied: "Mensagem copiada para a área de transferência!",
    tarotViewAllArcana: "Ver os 22 Arcanos Maiores",
    tarotAllArcanaTitle: "Os 22 Arcanos Maiores de Marselha",
    
    pastLifeModalTitle: "Revelação Akáshica: Memória de sua Vida Passada",
    pastLifeModalReadingFor: "Leitura Akáshica para",
    pastLifeModalSoulAura: "Aura da Alma",
    pastLifeModalVision: "Visão Mística da Encarnação",
    pastLifeModalListen: "Ouvir Relato Completo em Voz Solene",
    pastLifeModalIdentity: "Identidade e Ocupação da Alma",
    pastLifeModalChronicle: "Crônica da Encarnação",
    pastLifeModalTransition: "Passagem Terrena",
    pastLifeModalKarma: "Lição Cármica Atual",
    pastLifeModalRelic: "Objeto Canalizador da Alma",
    pastLifeModalSaved: "Salvo no Códex",
    pastLifeModalSaveCodex: "Salvar no Códex da Alma",
    pastLifeModalClose: "Fechar Leitura",
    pastLifeEra: "Época e Local da Encarnação",
    pastLifeRole: "Identidade e Papel da Alma",
    pastLifeNarrative: "Relato Histórico da Alma",
    pastLifeDeath: "Momento de Transição",
    pastLifeKarma: "Lição Cármica para o Presente",
    pastLifeSoulConnection: "Ressonância e Vínculos de Alma",
    pastLifeRelic: "Relíquia Espiritual Canalizadora",
    pastLifeSaveToCodex: "Salvar no meu Códex",
    pastLifeSaved: "Salvo no Códex!",
    pastLifeShare: "Compartilhar Revelação",
    pastLifeClose: "Fechar Revelação",
    codexTitle: "Códex de Vidas Passadas",
    codexSubtitle: "Compêndio de encarnações e memórias akáshicas canalizadas",
    codexEmpty: "Códex da Alma Vazio",
    codexEmptyDesc: "Realize uma consulta aos Registros Akáshicos para descobrir e registrar suas encarnações passadas.",
    codexView: "Ver",
    codexViewDetails: "Ver Relato Completo",
    codexDelete: "Remover do Códex",
    clearCodex: "Limpar Códex",

    channeledMessageTitle: "Mensagem Canalizada dos Registros Akáshicos",
    listenSolemnVoice: "Ouvir com Voz Solene",
    makeAnotherConsultation: "Realizar Outra Consulta",
    errorAkashicConnection: "Não foi possível conectar aos Registros Akáshicos. Por favor, tente novamente.",
    errorOracleConnection: "Não foi possível canalizar as informações dos Registros Akáshicos.",
    askCardMessage: "Qual é a mensagem do Arcano",
    
    coffeeOfferTitle: "Um cafezinho fumegante para acalmar as entidades?",
    coffeeOfferDesc: "Oferenda voluntária para apaziguar espíritos e sustentar os oráculos.",
    coffeeOfferBtn: "Oferecer Cafezinho",
    coffeeFooterLink: "Cafezinho para o Médium",
    
    footerDisclaimer: "Tabuleiro Ouija Interativo • Registros Akáshicos e Leitura de Vidas Passadas",
    footerTitle: "Tabuleiro Ouija Interativo • Registros Akáshicos e Leitura de Vidas Passadas",
    footerCoffeeLink: "Cafezinho para o Médium",
    footerRights: "Experiência espiritual e oracular interativa",
    languageSelect: "Idioma",
  },
  fr: {
    appTitle: "PLANCHE OUIJA INTERACTIVE",
    appSubtitle: "Oracle des Annales Akashiques & Vies Antérieures",
    navAll: "Tout le Portail",
    navOuija: "Planche Ouija & Oracle",
    navTarot: "Arcane du Jour (Tarot)",
    navCodex: "Codex",
    tabOuija: "Planche Ouija",
    tabTarot: "Arcane de Marseille",
    tabCodex: "Codex de l'Âme",
    tabAudio: "Atmosphère",
    
    realVisits: "visiteurs réels",
    realVisitsTitle: "Compteur de Visiteurs Réels et d'Âmes dans le Portail",
    visitsModalTitle: "Compteur de Visites Réelles",
    totalRealVisits: "Total Visites Réelles",
    visitsToday: "Visites Aujourd'hui",
    channeledConsultations: "Consultations Akashiques Canalisées",
    portalOfficialRecord: "Registre Officiel du Portail",
    portalRecordDesc: "Ce compteur enregistre en temps réel chaque âme qui accède à l'oracle et effectue une consultation de vie antérieure via la planche Ouija.",
    closeRecord: "Fermer le Registre",
    solemnVoice: "Voix Solennelle",
    etherealMusic: "Musique Éthérée",
    mysticFog: "Brume Mystique",
    akashicRecordsBtn: "Annales Akashiques",
    guideBtn: "Guide",
    guideTitle: "Guide du Portail Akashique",
    guideStep1Title: "1. Lecture de Vies Antérieures:",
    guideStep1Desc: "Entrez votre nom et votre intention. En cliquant sur 'Révéler Vie Antérieure', la goutte se déplace physiquement sur la Ouija pour épeler les clés de votre incarnation précédente.",
    guideStep2Title: "2. Consultations Vocales:",
    guideStep2Desc: "Vous pouvez énoncer vos intentions directement au microphone. La goutte se déplacera automatiquement pour vous répondre.",
    guideStep3Title: "3. Codex de l'Âme:",
    guideStep3Desc: "Chaque vie antérieure découverte comprend son époque historique, son récit, son moment de transition et sa leçon karmique.",
    guideStep4Title: "4. Voix Masculine Solennelle & Atmosphère:",
    guideStep4Desc: "Écoutez les révélations dictées solennellement par le gardien et activez la brume mystique pour une immersion totale.",
    enterPortalBtn: "Comprendre et Entrer",
    
    voiceModalTitle: "Voix Masculine Solennelle et Neutre",
    voiceModalDesc: "L'oracle utilise une voix masculine calme, solennelle et posée pour délivrer les révélations akashiques.",
    testVoiceTitle: "Tester la Voix Solennelle",
    testVoiceDesc: "Écoutez un extrait du ton et de la solennité du gardien",
    playSample: "Écouter l'Extrait",
    playingSample: "Lecture...",
    availableVoices: "Voix Masculines Disponibles sur votre Appareil",
    autoVoiceOptimal: "✨ Sélection Automatique Optimale (Homme Solennel)",
    autoVoiceDesc: "Ton profond, rythme posé et solennel",
    saveAndClose: "Enregistrer et Fermer",
    
    welcomeGreeting: "Bienvenue au Seuil Akashique",
    welcomeIntro: "Vous êtes sur le point de vous connecter à la mémoire primordiale de l'âme. La planche Ouija et le Tarot de Marseille sont des ponts subtils entre les plans de conscience.",
    welcomeWarning: "Posez vos questions avec respect et introspection. Chaque message épelé par la goutte porte un enseignement pour votre présent.",
    welcomeClose: "Commencer l'Expérience",
    welcomeListenVoice: "Écouter la Voix du Gardien",
    welcomeStopVoice: "Arrêter la Voix",
    welcomeVoiceText: "Nous vous souhaitons la bienvenue à la consultation des Annales Akashiques et des Vies Antérieures. Découvrez qui vous étiez dans vos incarnations précédentes et la sagesse ancestrale de votre âme grâce à la canalisation de la goutte.",
    welcomeModalTitle: "Annales Akashiques",
    welcomeModalSubtitle: "Découvrez qui vous étiez dans vos incarnations passées et la sagesse ancestrale de votre âme",
    welcomeCard1: "Incarnations Passées",
    welcomeCard2: "Codex de l'Âme",
    enterBoardBtn: "Entrer sur la Planche Ouija",
    skipWelcomeBtn: "Passer et aller directement à la consultation",

    ouijaBoardTitle: "Oracle de la Planche Ouija",
    ouijaSpelling: "La goutte canalise le message...",
    ouijaPlanchetteIdle: "Goutte au repos sur le centre cosmique",
    ouijaPlanchetteReady: "Canalisation terminée",
    ouijaSpelledWord: "Mot Épelé",
    ouijaYes: "OUI",
    ouijaNo: "NON",
    ouijaGoodbye: "AU REVOIR",
    channeledSymbols: "Symboles Canalisés:",
    invokingSpirits: "Invocation des esprits...",
    makeYourConsultation: "Faites votre consultation au microphone ou via le formulaire...",
    moon: "LUNE",
    sun: "SOLEIL",
    yes: "OUI",
    no: "NON",
    goodbye: "AU REVOIR",

    askTheSpirits: "Consulter les Annales Akashiques",
    pastLifeSearch: "Canaliser une Vie Antérieure",
    inputYourName: "Ex: Sophie / Alexandre",
    inputYourQuestion: "Que souhaitez-vous demander aux Annales ?",
    inputBirthEra: "Année de naissance (optionnel)",
    inputFeeling: "Quelle émotion ou question cherchez-vous à éclairer ?",
    revealPastLifeBtn: "Révéler Vie Antérieure",
    askOuijaBtn: "Demander à la Planche",
    revealingSpirit: "Canalisation depuis l'Akasha...",
    micListening: "Écoute en cours... parlez clairement",
    micSpeakNow: "Parler au Micro",
    micTooltip: "Cliquez pour parler et poser votre question directement au micro",
    micNotSupported: "La reconnaissance vocale n'est pas prise en charge sur ce navigateur. Vous pouvez saisir votre demande.",
    micDenied: "Autorisation du microphone refusée. Veuillez approuver l'accès au micro.",
    micError: "Impossible de détecter une voix claire. Réessayez en cliquant à nouveau.",
    listeningVoice: "Écoute de votre voix... Formulez votre requête akashique",
    stopMic: "Arrêter",
    tabPastLife: "Lecture Vies Antérieures",
    tabSpiritOracle: "Consultation Akashique Ouverte",
    inputNameLabel: "Nom ou Pseudonyme (Optionnel)",
    inputBirthYearLabel: "Année de Naissance (Optionnel)",
    inputFocusQueryLabel: "Question ou Intention Spéciale (Optionnel)",
    pastLifeDescBanner: "Les Annales Akashiques révéleront la vie antérieure et la mémoire ancestrale de votre âme.",
    useMic: "Utiliser Micro",
    quickConsultsTitle: "Consultations Rapides aux Annales:",
    preset1: "Qui étais-je dans ma vie précédente ?",
    preset2: "Quelle est ma principale leçon karmique ?",
    preset3: "Où ai-je vécu dans ma vie passée ?",
    preset4: "Quel talent ai-je hérité d'une autre époque ?",
    consultByVoice: "Consulter au Micro",
    channelingMsg: "Canalisation des Annales Akashiques...",
    oracleQuestionLabel: "Formulez votre Question par Voix ou Texte",
    oracleQuestionPlaceholder: "Ex: Quel est l'apprentissage spirituel de mon âme dans cette incarnation ?",
    
    tarotTitle: "ARCANE DU JOUR • TAROT DE MARSEILLE",
    tarotSubtitle: "Xylogravure Sacrée de Marseille & Révélation Akashique",
    tarotUniversalTitle: "Énergie Universelle du Jour",
    tarotPersonalDrawTitle: "Votre Tirage Personnel",
    tarotShuffleBtn: "Mélanger et Tirer un Arcane",
    tarotShuffling: "Mélange du jeu de Marseille...",
    tarotMarseilleWoodcut: "Xylogravure Traditionnelle Française (XVIIIe Siècle)",
    tarotMarseilleTitle: "Titre en Marseille",
    tarotKeywords: "Clés Archétypales",
    tarotElement: "Élément",
    tarotAstro: "Astre / Correspondance",
    tarotArchetype: "Archétype Universel",
    tarotDailyMessage: "Message Akashique du Jour",
    tarotLightAspect: "Aspect Lumineux",
    tarotShadowAspect: "Aspect d'Ombre",
    tarotPracticalAdvice: "Conseil Pratique pour Aujourd'hui",
    tarotDailyAffirmation: "Affirmation Quantique",
    tarotMeditationQuestion: "Question de Méditation",
    tarotShareCard: "Partager l'Arcane",
    tarotCardCopied: "Message copié dans le presse-papiers !",
    tarotViewAllArcana: "Voir les 22 Arcanes Majeurs",
    tarotAllArcanaTitle: "Les 22 Arcanes Majeurs de Marseille",
    
    pastLifeModalTitle: "Révélation Akashique: Mémoire de Vie Antérieure",
    pastLifeModalReadingFor: "Lecture Akashique pour",
    pastLifeModalSoulAura: "Aura de l'Âme",
    pastLifeModalVision: "Vision Mystique de l'Incarnation",
    pastLifeModalListen: "Écouter le Récit Complet en Voix Solennelle",
    pastLifeModalIdentity: "Identité et Rôle de l'Âme",
    pastLifeModalChronicle: "Chronique de l'Incarnation",
    pastLifeModalTransition: "Transition Terrestre",
    pastLifeModalKarma: "Leçon Karmique Actuelle",
    pastLifeModalRelic: "Objet Canalisateur de l'Âme",
    pastLifeModalSaved: "Enregistré dans le Codex",
    pastLifeModalSaveCodex: "Sauvegarder dans le Codex de l'Âme",
    pastLifeModalClose: "Fermer la Lecture",
    pastLifeEra: "Époque et Lieu d'Incarnation",
    pastLifeRole: "Identité et Rôle de l'Âme",
    pastLifeNarrative: "Récit Historique de l'Âme",
    pastLifeDeath: "Moment de Transition",
    pastLifeKarma: "Leçon Karmique pour le Présent",
    pastLifeSoulConnection: "Résonance et Liens d'Âme",
    pastLifeRelic: "Relique Spirituelle Canalisatrice",
    pastLifeSaveToCodex: "Sauvegarder dans mon Codex",
    pastLifeSaved: "Enregistré dans le Codex !",
    pastLifeShare: "Partager la Révélation",
    pastLifeClose: "Fermer la Révélation",
    codexTitle: "Codex des Vies Antérieures",
    codexSubtitle: "Recueil d'incarnations et de mémoires akashiques canalisées",
    codexEmpty: "Codex de l'Âme Vide",
    codexEmptyDesc: "Effectuez une consultation des Annales Akashiques pour découvrir et enregistrer vos vies passées.",
    codexView: "Voir",
    codexViewDetails: "Voir le Récit Complet",
    codexDelete: "Supprimer du Codex",
    clearCodex: "Effacer le Codex",

    channeledMessageTitle: "Message Canalisé des Annales Akashiques",
    listenSolemnVoice: "Écouter en Voix Solennelle",
    makeAnotherConsultation: "Faire une Autre Consultation",
    errorAkashicConnection: "Impossible de se connecter aux Annales Akashiques. Veuillez réessayer.",
    errorOracleConnection: "Impossible de canaliser les informations des Annales Akashiques.",
    askCardMessage: "Quel est le message de l'Arcane",
    
    coffeeOfferTitle: "Un café fumant pour apaiser les entités ?",
    coffeeOfferDesc: "Offrande volontaire pour apaiser les esprits et maintenir les oracles.",
    coffeeOfferBtn: "Offrir un Café",
    coffeeFooterLink: "Café pour le Médium",
    
    footerDisclaimer: "Planche Ouija Interactive • Annales Akashiques & Vies Antérieures",
    footerTitle: "Planche Ouija Interactive • Annales Akashiques & Vies Antérieures",
    footerCoffeeLink: "Café pour le Médium",
    footerRights: "Expérience spirituelle et oraculaire interactive",
    languageSelect: "Langue",
  },
  it: {
    appTitle: "TAVOLA OUIJA INTERATTIVA",
    appSubtitle: "Oracolo dei Registri Akashici & Vite Passate",
    navAll: "Tutto il Portale",
    navOuija: "Tavola Ouija & Oracolo",
    navTarot: "Arcano del Giorno (Tarocchi)",
    navCodex: "Codex",
    tabOuija: "Tavola Ouija",
    tabTarot: "Arcano di Marsiglia",
    tabCodex: "Codex dell'Anima",
    tabAudio: "Atmosfera",
    
    realVisits: "visite reali",
    realVisitsTitle: "Contatore di Visite Reali e Anime nel Portale",
    visitsModalTitle: "Contatore di Visite Reali",
    totalRealVisits: "Totale Visite Reali",
    visitsToday: "Visite Oggi",
    channeledConsultations: "Consultazioni Akashiche Canalizzate",
    portalOfficialRecord: "Registro Ufficiale del Portale",
    portalRecordDesc: "Questo contatore registra in tempo reale ogni anima che accede all'oracolo ed esegue una consultazione di vite passate tramite la tavola Ouija.",
    closeRecord: "Chiudi Registro",
    solemnVoice: "Voce Solenne",
    etherealMusic: "Musica Eterea",
    mysticFog: "Nebbia Mistica",
    akashicRecordsBtn: "Registri Akashici",
    guideBtn: "Guida",
    guideTitle: "Guida al Portale Akashico",
    guideStep1Title: "1. Lettura delle Vite Passate:",
    guideStep1Desc: "Inserisci il tuo nome e intenzione facoltativa. Cliccando su 'Rivela Vita Passata', la planchette si muoverà fisicamente sulla Ouija per comporre le chiavi della tua incarnazione precedente.",
    guideStep2Title: "2. Consultazioni Vocali:",
    guideStep2Desc: "Puoi pronunciare le tue intenzioni direttamente al microfono. La planchette Ouija si sposterà automaticamente per risponderti.",
    guideStep3Title: "3. Codex dell'Anima:",
    guideStep3Desc: "Ogni vita passata scoperta include epoca storica, racconto, momento di transizione e lezione karmica.",
    guideStep4Title: "4. Voce Maschile Solenne & Atmosfera:",
    guideStep4Desc: "Ascolta i messaggi dettati solennemente dal guardiano e attiva la nebbia mistica per un'immersione completa.",
    enterPortalBtn: "Comprendi ed Entra",
    
    voiceModalTitle: "Voce Maschile Solenne e Neutra",
    voiceModalDesc: "L'oracolo utilizza una voce maschile solenne, calma e posata per trasmettere le rivelazioni dei Registri Akashici.",
    testVoiceTitle: "Prova Voce Maschile Solenne",
    testVoiceDesc: "Ascolta un campione del tono e della solennità del guardiano",
    playSample: "Ascolta Campione",
    playingSample: "In riproduzione...",
    availableVoices: "Voci Maschili Disponibili sul tuo Dispositivo",
    autoVoiceOptimal: "✨ Selezione Automatica Ottimale (Uomo Solenne)",
    autoVoiceDesc: "Tono profondo, ritmo pacato e solenne",
    saveAndClose: "Salva e Chiudi",
    
    welcomeGreeting: "Benvenuto alla Soglia Akashica",
    welcomeIntro: "Stai per connetterti con la memoria primordiale dell'anima. La tavola Ouija e i Tarocchi di Marsiglia fungono da ponti sottili tra i piani di coscienza.",
    welcomeWarning: "Poni le tue domande con rispetto e introspezione. Ogni messaggio composto dalla planchette reca un insegnamento per il tuo presente.",
    welcomeClose: "Inizia Esperienza",
    welcomeListenVoice: "Ascolta Voce del Guardiano",
    welcomeStopVoice: "Ferma Voce",
    welcomeVoiceText: "Ti diamo il benvenuto alla consultazione dei Registri Akashici e delle Vite Passate. Scopri chi eri nelle tue precedenti incarnazioni e la saggezza ancestrale della tua anima attraverso la canalizzazione della planchette.",
    welcomeModalTitle: "Registri Akashici",
    welcomeModalSubtitle: "Scopri chi eri nelle tue incarnazioni passate e la saggezza ancestrale della tua anima",
    welcomeCard1: "Incarnazioni Passate",
    welcomeCard2: "Codex dell'Anima",
    enterBoardBtn: "Entra nella Tavola Ouija",
    skipWelcomeBtn: "Salta e vai direttamente alla consultazione",

    ouijaBoardTitle: "Oracolo della Tavola Ouija",
    ouijaSpelling: "La planchette sta canalizzando il messaggio...",
    ouijaPlanchetteIdle: "Planchette a riposo al centro cosmico",
    ouijaPlanchetteReady: "Canalizzazione completata",
    ouijaSpelledWord: "Parola Composta",
    ouijaYes: "SÌ",
    ouijaNo: "NO",
    ouijaGoodbye: "ADDIO",
    channeledSymbols: "Simboli Canalizzati:",
    invokingSpirits: "Invocando spiriti...",
    makeYourConsultation: "Fai la tua consultazione con il microfono o il modulo...",
    moon: "LUNA",
    sun: "SOLE",
    yes: "SÌ",
    no: "NO",
    goodbye: "ADDIO",

    askTheSpirits: "Consulta i Registri Akashici",
    pastLifeSearch: "Canalizza Vita Passata",
    inputYourName: "Es: Sofia / Alessandro",
    inputYourQuestion: "Cosa desideri chiedere ai Registri?",
    inputBirthEra: "Anno di nascita (facoltativo)",
    inputFeeling: "Quale emozione o dubbio cerchi di chiarire oggi?",
    revealPastLifeBtn: "Rivela Vita Passata",
    askOuijaBtn: "Chiedi alla Tavola",
    revealingSpirit: "Canalizzando dall'Akasha...",
    micListening: "In ascolto della tua voce... parla chiaramente",
    micSpeakNow: "Parla al Microfono",
    micTooltip: "Clicca per parlare e formulare la tua domanda direttamente con il microfono",
    micNotSupported: "Il riconoscimento vocale non è supportato in questo browser. Puoi digitare la tua domanda.",
    micDenied: "Permesso microfono negato. Autorizza l'accesso al microfono.",
    micError: "Voce non rilevata chiaramente. Riprova cliccando nuovamente.",
    listeningVoice: "In ascolto della tua voce... Formula la tua richiesta akashica",
    stopMic: "Ferma",
    tabPastLife: "Lettura Vite Passate",
    tabSpiritOracle: "Consultazione Akashica Aperta",
    inputNameLabel: "Nome o Pseudonimo (Facoltativo)",
    inputBirthYearLabel: "Anno di Nascita (Facoltativo)",
    inputFocusQueryLabel: "Domanda o Intenzione Speciale (Facoltativo)",
    pastLifeDescBanner: "I Registri Akashici riveleranno la vita passata e la memoria ancestrale della tua anima.",
    useMic: "Usa Microfono",
    quickConsultsTitle: "Consultazioni Rapide ai Registri:",
    preset1: "Chi ero nella mia vita precedente?",
    preset2: "Qual è la mia lezione karmica principale?",
    preset3: "Dove ho vissuto nella mia vita passata?",
    preset4: "Quale talento porto da un'altra epoca?",
    consultByVoice: "Consulta con Microfono",
    channelingMsg: "Canalizzando Registri Akashici...",
    oracleQuestionLabel: "Formula la tua Domanda con Voce o Testo",
    oracleQuestionPlaceholder: "Es: Qual è lo scopo spirituale della mia anima in questa incarnazione?",
    
    tarotTitle: "ARCANO DEL GIORNO • TAROCCHI DI MARSIGLIA",
    tarotSubtitle: "Xilografia Sacra di Marsiglia & Rivelazione Akashica",
    tarotUniversalTitle: "Energia Universale del Giorno",
    tarotPersonalDrawTitle: "La Tua Estrazione Personale",
    tarotShuffleBtn: "Mischia ed Estrai Arcano",
    tarotShuffling: "Mescolando il mazzo marsigliese...",
    tarotMarseilleWoodcut: "Xilografia Tradizionale Francese (XVIII Secolo)",
    tarotMarseilleTitle: "Titolo in Marsiglia",
    tarotKeywords: "Chiavi Archetipiche",
    tarotElement: "Elemento",
    tarotAstro: "Astro / Corrispondenza",
    tarotArchetype: "Archetipo Universale",
    tarotDailyMessage: "Messaggio Akashico del Giorno",
    tarotLightAspect: "Aspetto di Luce",
    tarotShadowAspect: "Aspetto d'Ombra",
    tarotPracticalAdvice: "Consiglio Pratico per Oggi",
    tarotDailyAffirmation: "Affermazione Quantica",
    tarotMeditationQuestion: "Domanda di Meditazione",
    tarotShareCard: "Condividi Arcano",
    tarotCardCopied: "Messaggio copiato negli appunti!",
    tarotViewAllArcana: "Visualizza i 22 Arcani Maggiori",
    tarotAllArcanaTitle: "I 22 Arcani Maggiori di Marsiglia",
    
    pastLifeModalTitle: "Rivelazione Akashica: Memoria della tua Vita Passata",
    pastLifeModalReadingFor: "Lettura Akashica per",
    pastLifeModalSoulAura: "Aura dell'Anima",
    pastLifeModalVision: "Visione Mistica dell'Incarnazione",
    pastLifeModalListen: "Ascolta il Racconto Completo in Voce Solenne",
    pastLifeModalIdentity: "Identità e Ruolo dell'Anima",
    pastLifeModalChronicle: "Cronaca dell'Incarnazione",
    pastLifeModalTransition: "Passaggio Terreno",
    pastLifeModalKarma: "Lezione Karmica Attuale",
    pastLifeModalRelic: "Oggetto Canalizzatore dell'Anima",
    pastLifeModalSaved: "Salvato nel Codex",
    pastLifeModalSaveCodex: "Salva nel Codex dell'Anima",
    pastLifeModalClose: "Chiudi Lettura",
    pastLifeEra: "Epoca e Luogo di Incarnazione",
    pastLifeRole: "Identità e Ruolo dell'Anima",
    pastLifeNarrative: "Cronaca Storica dell'Anima",
    pastLifeDeath: "Momento di Transizione",
    pastLifeKarma: "Lezione Karmica per il Presente",
    pastLifeSoulConnection: "Risonanza e Legami d'Anima",
    pastLifeRelic: "Reliquia Spirituale Canalizzatrice",
    pastLifeSaveToCodex: "Salva nel mio Codex",
    pastLifeSaved: "Salvato nel Codex!",
    pastLifeShare: "Condividi Rivelazione",
    pastLifeClose: "Chiudi Rivelazione",
    codexTitle: "Codex delle Vite Passate",
    codexSubtitle: "Raccolta di incarnazioni e memorie akashiche canalizzate",
    codexEmpty: "Codex dell'Anima Vuoto",
    codexEmptyDesc: "Effettua una consultazione dei Registri Akashici per scoprire e registrare le tue vite passate.",
    codexView: "Vedi",
    codexViewDetails: "Vedi Racconto Completo",
    codexDelete: "Rimuovi dal Codex",
    clearCodex: "Pulisci Codex",

    channeledMessageTitle: "Messaggio Canalizzato dai Registri Akashici",
    listenSolemnVoice: "Ascolta in Voce Solenne",
    makeAnotherConsultation: "Fai un'Altra Consultazione",
    errorAkashicConnection: "Impossibile connettersi ai Registri Akashici. Riprova.",
    errorOracleConnection: "Impossibile canalizzare le informazioni dai Registri Akashici.",
    askCardMessage: "Qual è il messaggio dell'Arcano",
    
    coffeeOfferTitle: "Un caffè fumante per placare le entità?",
    coffeeOfferDesc: "Offerta volontaria per pacificare gli spiriti e sostenere gli oracoli.",
    coffeeOfferBtn: "Offri un Caffè",
    coffeeFooterLink: "Caffè per il Medium",
    
    footerDisclaimer: "Tavola Ouija Interattiva • Registri Akashici e Vite Passate",
    footerTitle: "Tavola Ouija Interattiva • Registri Akashici e Vite Passate",
    footerCoffeeLink: "Caffè per il Medium",
    footerRights: "Esperienza spirituale e oracolare interattiva",
    languageSelect: "Lingua",
  },
  de: {
    appTitle: "INTERAKTIVES OUIJA-BRETT",
    appSubtitle: "Akasha-Chronik Orakel & Frühere Leben",
    navAll: "Gesamtes Portal",
    navOuija: "Ouija-Brett & Orakel",
    navTarot: "Tages-Arkanum (Tarot)",
    navCodex: "Kodex",
    tabOuija: "Ouija-Brett",
    tabTarot: "Marseille-Arkanum",
    tabCodex: "Seelen-Kodex",
    tabAudio: "Atmosphäre",
    
    realVisits: "echte Besucher",
    realVisitsTitle: "Zähler für Echte Besucher und Seelen im Portal",
    visitsModalTitle: "Zähler Echter Besucher",
    totalRealVisits: "Gesamte Echte Besuche",
    visitsToday: "Besuche Heute",
    channeledConsultations: "Gechannelte Akasha-Konsultationen",
    portalOfficialRecord: "Offizielles Portal-Register",
    portalRecordDesc: "Dieser Zähler erfasst in Echtzeit jede Seele, die auf das Orakel zugreift und eine Reinkarnationsabfrage über das Ouija-Brett durchführt.",
    closeRecord: "Register Schließen",
    solemnVoice: "Feierliche Stimme",
    etherealMusic: "Ätherische Musik",
    mysticFog: "Mystischer Nebel",
    akashicRecordsBtn: "Akasha-Chronik",
    guideBtn: "Anleitung",
    guideTitle: "Leitfaden für das Akasha-Portal",
    guideStep1Title: "1. Lesung Früherer Leben:",
    guideStep1Desc: "Gib deinen Namen und deine Absicht ein. Mit Klick auf 'Früheres Leben Enthüllen' bewegt sich die Planchette über das Brett, um die Schlüssel deiner Reinkarnation zu buchstabieren.",
    guideStep2Title: "2. Sprach-Konsultationen:",
    guideStep2Desc: "Du kannst deine Fragen direkt über dein Mikrofon sprechen. Die Planchette bewegt sich automatisch, um dir zu antworten.",
    guideStep3Title: "3. Seelen-Kodex:",
    guideStep3Desc: "Jedes entdeckte Vorleben enthält historische Epoche, Erzählung, Übergangsmoment und karmische Lektion.",
    guideStep4Title: "4. Feierliche Männerstimme & Atmosphäre:",
    guideStep4Desc: "Höre dir die feierlich gesprochenen Botschaften des Wächters an und aktiviere den Nebel für volle Immersion.",
    enterPortalBtn: "Verstehen und Eintreten",
    
    voiceModalTitle: "Feierliche & Neutrale Männerstimme",
    voiceModalDesc: "Das Orakel nutzt eine ruhige, feierliche Männerstimme, um die Botschaften der Akasha-Chronik zu übermitteln.",
    testVoiceTitle: "Feierliche Stimme Testen",
    testVoiceDesc: "Höre eine Hörprobe des Wächters",
    playSample: "Hörprobe Abspielen",
    playingSample: "Wiedergabe...",
    availableVoices: "Verfügbare Stimmen auf deinem Gerät",
    autoVoiceOptimal: "✨ Optimale Automatische Auswahl (Feierlicher Mann)",
    autoVoiceDesc: "Tiefer Ton, bedächtiges Tempo und feierliche Präsenz",
    saveAndClose: "Speichern und Schließen",
    
    welcomeGreeting: "Willkommen an der Akasha-Schwelle",
    welcomeIntro: "Du bist dabei, dich mit der Seelenerinnerung zu verbinden. Das Ouija-Brett und das Marseille-Tarot dienen als subtile Brücken zwischen den Bewusstseinsebenen.",
    welcomeWarning: "Stelle deine Fragen mit Respekt und innerer Einkehr. Jede buchstabierte Antwort birgt eine Lehre für deine Gegenwart.",
    welcomeClose: "Erlebnis Starten",
    welcomeListenVoice: "Wächterstimme Anhören",
    welcomeStopVoice: "Stimme Stoppen",
    welcomeVoiceText: "Wir heißen Sie herzlich willkommen zur Konsultation der Akasha-Chronik und früherer Leben. Entdecken Sie durch das Channeling der Planchette, wer Sie in Ihren früheren Inkarnationen waren und die Weisheit Ihrer Seele.",
    welcomeModalTitle: "Akasha-Chronik",
    welcomeModalSubtitle: "Entdecke, wer du in deinen vergangenen Inkarnationen warst und die uralte Weisheit deiner Seele",
    welcomeCard1: "Frühere Inkarnationen",
    welcomeCard2: "Seelen-Kodex",
    enterBoardBtn: "Ouija-Brett Betreten",
    skipWelcomeBtn: "Überspringen und direkt zur Abfrage",

    ouijaBoardTitle: "Ouija-Brett Orakel",
    ouijaSpelling: "Die Planchette channelt die Botschaft...",
    ouijaPlanchetteIdle: "Planchette ruht im kosmischen Zentrum",
    ouijaPlanchetteReady: "Channeling abgeschlossen",
    ouijaSpelledWord: "Buchstabiertes Wort",
    ouijaYes: "JA",
    ouijaNo: "NEIN",
    ouijaGoodbye: "LEBEWOHL",
    channeledSymbols: "Gechannelte Symbole:",
    invokingSpirits: "Geister werden angerufen...",
    makeYourConsultation: "Stelle deine Frage per Mikrofon oder Formular...",
    moon: "MOND",
    sun: "SONNE",
    yes: "JA",
    no: "NEIN",
    goodbye: "LEBEWOHL",

    askTheSpirits: "Akasha-Chronik Befragen",
    pastLifeSearch: "Früheres Leben Channeln",
    inputYourName: "Z.B. Sophia / Alexander",
    inputYourQuestion: "Was möchtest du die Chronik fragen?",
    inputBirthEra: "Geburtsjahr (optional)",
    inputFeeling: "Welche Frage oder welches Gefühl möchtest du klären?",
    revealPastLifeBtn: "Früheres Leben Enthüllen",
    askOuijaBtn: "Das Brett Befragen",
    revealingSpirit: "Channeling aus dem Akasha...",
    micListening: "Höre zu... bitte deutlich sprechen",
    micSpeakNow: "Mit Stimme Sprechen",
    micTooltip: "Klicken, um Frage direkt über das Mikrofon einzusprechen",
    micNotSupported: "Spracherkennung wird in diesem Browser nicht unterstützt. Du kannst deine Frage eintippen.",
    micDenied: "Mikrofonberechtigung verweigert. Bitte erlaube den Mikrofonzugriff.",
    micError: "Keine deutliche Stimme erkannt. Klicke erneut und sprich.",
    listeningVoice: "Höre deine Stimme... Formuliere deine Akasha-Frage",
    stopMic: "Stopp",
    tabPastLife: "Lesung Früherer Leben",
    tabSpiritOracle: "Offene Akasha-Konsultation",
    inputNameLabel: "Name oder Pseudonym (Optional)",
    inputBirthYearLabel: "Geburtsjahr (Optional)",
    inputFocusQueryLabel: "Besondere Frage oder Absicht (Optional)",
    pastLifeDescBanner: "Die Akasha-Chronik wird das frühere Leben und die Seelenerinnerung enthüllen.",
    useMic: "Mikrofon Nutzen",
    quickConsultsTitle: "Schnelle Fragen an die Chronik:",
    preset1: "Wer war ich in meinem vorherigen Leben?",
    preset2: "Was ist meine wichtigste karmische Lektion?",
    preset3: "Wo habe ich in meinem früheren Leben gelebt?",
    preset4: "Welches Talent bringe ich aus einer anderen Epoche mit?",
    consultByVoice: "Per Mikrofon Befragen",
    channelingMsg: "Akasha-Chronik wird gechannelt...",
    oracleQuestionLabel: "Formuliere deine Frage per Sprache oder Text",
    oracleQuestionPlaceholder: "Z.B. Was ist der spirituelle Zweck meiner Seele in dieser Inkarnation?",
    
    tarotTitle: "TAGES-ARKANUM • TAROT VON MARSEILLE",
    tarotSubtitle: "Heiliger Marseille-Holzschnitt & Akasha-Offenbarung",
    tarotUniversalTitle: "Universelle Tagesenergie",
    tarotPersonalDrawTitle: "Deine Persönliche Ziehung",
    tarotShuffleBtn: "Mischen & Arkanum Ziehen",
    tarotShuffling: "Marseille-Deck wird gemischt...",
    tarotMarseilleWoodcut: "Traditioneller Französischer Holzschnitt (18. Jh.)",
    tarotMarseilleTitle: "Marseille-Titel",
    tarotKeywords: "Archetypische Schlüssel",
    tarotElement: "Element",
    tarotAstro: "Astro / Entsprechung",
    tarotArchetype: "Universeller Archetyp",
    tarotDailyMessage: "Akasha-Tagesbotschaft",
    tarotLightAspect: "Licht-Aspekt",
    tarotShadowAspect: "Schatten-Aspekt",
    tarotPracticalAdvice: "Praktischer Rat für Heute",
    tarotDailyAffirmation: "Quanten-Affirmation",
    tarotMeditationQuestion: "Meditationsfrage",
    tarotShareCard: "Arkanum Teilen",
    tarotCardCopied: "Botschaft in die Zwischenablage kopiert!",
    tarotViewAllArcana: "Alle 22 Großen Arkana Ansehen",
    tarotAllArcanaTitle: "Die 22 Großen Arkana von Marseille",
    
    pastLifeModalTitle: "Akasha-Offenbarung: Erinnerung an dein Früheres Leben",
    pastLifeModalReadingFor: "Akasha-Lesung für",
    pastLifeModalSoulAura: "Seelenaura",
    pastLifeModalVision: "Mystische Vision der Inkarnation",
    pastLifeModalListen: "Vollständige Erzählung mit feierlicher Stimme anhören",
    pastLifeModalIdentity: "Seelenidentität & Berufung",
    pastLifeModalChronicle: "Chronik der Inkarnation",
    pastLifeModalTransition: "Irdischer Übergang",
    pastLifeModalKarma: "Aktuelle karmische Lektion",
    pastLifeModalRelic: "Seelen-Channeling-Objekt",
    pastLifeModalSaved: "Im Kodex Gespeichert",
    pastLifeModalSaveCodex: "Im Seelen-Kodex Speichern",
    pastLifeModalClose: "Lesung Schließen",
    pastLifeEra: "Epoche und Ort der Inkarnation",
    pastLifeRole: "Seelenidentität und Rolle",
    pastLifeNarrative: "Historische Seelenchronik",
    pastLifeDeath: "Moment des Übergangs",
    pastLifeKarma: "Karmische Lektion für die Gegenwart",
    pastLifeSoulConnection: "Seelenresonanz und Bündnisse",
    pastLifeRelic: "Spirituelle Channeling-Reliquie",
    pastLifeSaveToCodex: "In meinem Kodex Speichern",
    pastLifeSaved: "Im Kodex Gespeichert!",
    pastLifeShare: "Offenbarung Teilen",
    pastLifeClose: "Offenbarung Schließen",
    codexTitle: "Kodex Früherer Leben",
    codexSubtitle: "Sammlung gechannelter Reinkarnationen und Akasha-Erinnerungen",
    codexEmpty: "Seelen-Kodex ist Leer",
    codexEmptyDesc: "Führe eine Akasha-Abfrage durch, um deine früheren Leben zu enthüllen und aufzuzeichnen.",
    codexView: "Ansehen",
    codexViewDetails: "Vollständige Chronik Ansehen",
    codexDelete: "Aus Kodex Löschen",
    clearCodex: "Kodex Leeren",

    channeledMessageTitle: "Gechannelte Botschaft aus der Akasha-Chronik",
    listenSolemnVoice: "Mit Feierlicher Stimme Anhören",
    makeAnotherConsultation: "Weitere Konsultation Durchführen",
    errorAkashicConnection: "Verbindung zur Akasha-Chronik fehlgeschlagen. Bitte erneut versuchen.",
    errorOracleConnection: "Informationen aus der Akasha-Chronik konnten nicht gechannelt werden.",
    askCardMessage: "Was ist die Botschaft von Arkanum",
    
    coffeeOfferTitle: "Ein dampfender Kaffee zur Beruhigung der Entitäten?",
    coffeeOfferDesc: "Freiwillige Gabe zur Besänftigung der Geister und Erhaltung der Orakel.",
    coffeeOfferBtn: "Kaffee Spendieren",
    coffeeFooterLink: "Kaffee für das Medium",
    
    footerDisclaimer: "Interaktives Ouija-Brett • Akasha-Chronik & Frühere Leben",
    footerTitle: "Interaktives Ouija-Brett • Akasha-Chronik & Frühere Leben",
    footerCoffeeLink: "Kaffee für das Medium",
    footerRights: "Interaktives spirituelles und orakelhaftes Erlebnis",
    languageSelect: "Sprache",
  },
};

export const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string; flag: string; nativeName: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸", nativeName: "Español" },
  { code: "en", label: "English", flag: "🇬🇧", nativeName: "English" },
  { code: "pt", label: "Português", flag: "🇧🇷", nativeName: "Português" },
  { code: "fr", label: "Français", flag: "🇫🇷", nativeName: "Français" },
  { code: "it", label: "Italiano", flag: "🇮🇹", nativeName: "Italiano" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", nativeName: "Deutsch" },
];
