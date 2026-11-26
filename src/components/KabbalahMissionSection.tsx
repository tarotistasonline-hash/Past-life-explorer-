import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles,
  Calendar,
  User,
  Volume2,
  Square,
  Share2,
  Check,
  RotateCcw,
  ArrowUpRight,
  Compass,
  BookOpen,
  Download,
  Lock,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import type { SupportedLanguage } from "../types";
import {
  SEPHIROTH,
  KabbalahProfile,
  KabbalahReading,
  SephiraInfo,
  calculateKabbalahProfile,
  buildLocalKabbalahReading,
  buildKabbalahSpokenScript,
  exportKabbalahPdf,
} from "../lib/kabbalah";
import { audio } from "../lib/audio";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";
import { copyMysticShareText } from "../lib/parchmentExport";
import { getAdminAuthHeaders, isAdminSession } from "../lib/adminTracking";
import treeOfLifeImg from "../assets/images/kabbalah_tree_attractive_1795389197170.jpg";

export const KABBALAH_STORAGE_KEY = "ouija_kabbalah_mission_v1";

interface KabbalahMissionSectionProps {
  onSendToOuija?: (query: string) => void;
  isPaywallEnabled?: boolean;
  freeLimit?: number;
  remainingFree?: number;
  isPassUnlocked?: boolean;
  isCreatorUnlimited?: boolean;
  onOpenPaywall?: () => void;
  onConsumeFreeConsultation?: () => void;
}

interface KabbalahCopy {
  kicker: string;
  title: string;
  subtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  birthDateLabel: string;
  submitBtn: string;
  calculatingBtn: string;
  resetBtn: string;
  speakBtn: string;
  stopSpeakBtn: string;
  copyBtn: string;
  copiedBtn: string;
  askOuijaBtn: string;
  treeCaption: string;
  inspectHint: string;
  birthSephiraLabel: string;
  nameSephiraLabel: string;
  hebrewPathLabel: string;
  pillarLabel: string;
  missionSectionTitle: string;
  connectionSectionTitle: string;
  nameVibrationTitle: string;
  tikkunTitle: string;
  giftsTitle: string;
  practiceTitle: string;
  affirmationTitle: string;
  emptyPromptTitle: string;
  emptyPromptDesc: string;
  gematriaLabel: string;
  lifePathLabel: string;
  soulUrgeLabel: string;
  expressionLabel: string;
}

const COPY: Record<SupportedLanguage, KabbalahCopy> = {
  es: {
    kicker: "Cábala Mística · Árbol de la Vida (Etz Jaim)",
    title: "Tu Misión de Vida según la Cábala",
    subtitle:
      "Descubre la Sefirá de tu alma, el Sendero Hebreo que guía tu encarnación y el Tikkún o propósito sagrado que tu nombre completo y fecha de nacimiento revelan en el Árbol de la Vida.",
    nameLabel: "Nombre y Apellido completo",
    namePlaceholder: "Ej. Sofía Valentina Gómez",
    birthDateLabel: "Fecha de nacimiento",
    submitBtn: "Revelar Misión de Vida",
    calculatingBtn: "Descifrando el Árbol de la Vida...",
    resetBtn: "Nueva consulta",
    speakBtn: "Escuchar",
    stopSpeakBtn: "Detener voz",
    copyBtn: "Copiar lectura",
    copiedBtn: "Copiado",
    askOuijaBtn: "Profundizar en la Ouija",
    treeCaption: "Etz Jaim · Las Diez Sefirot y los Veintidós Senderos",
    inspectHint: "Pulsa cualquier Sefirá del árbol para contemplar su arquetipo",
    birthSephiraLabel: "Sefirá Natal",
    nameSephiraLabel: "Sefirá del Nombre",
    hebrewPathLabel: "Sendero Hebreo",
    pillarLabel: "Pilar del Alma",
    missionSectionTitle: "Propósito y Misión de Vida",
    connectionSectionTitle: "Puente entre tu Nacimiento y tu Nombre",
    nameVibrationTitle: "Gematría y Vibración del Nombre",
    tikkunTitle: "Tikkún (Aprendizaje del Alma)",
    giftsTitle: "Dones Espirituales",
    practiceTitle: "Práctica de Alineación Diaria",
    affirmationTitle: "Afirmación Cabalística",
    emptyPromptTitle: "El Árbol de la Vida aguarda tus coordenadas",
    emptyPromptDesc:
      "Ingresa tu nombre completo y tu fecha de nacimiento para calcular tu Gematría personal, ubicar tu Sefirá regente y revelar tu misión espiritual.",
    gematriaLabel: "Gematría",
    lifePathLabel: "Sendero Natal",
    soulUrgeLabel: "Anhelo del Alma",
    expressionLabel: "Expresión",
  },
  en: {
    kicker: "Mystical Kabbalah · Tree of Life (Etz Chaim)",
    title: "Your Life Mission in Kabbalah",
    subtitle:
      "Uncover your soul's guiding Sephira, Hebrew Path, and Tikkun (spiritual purpose) revealed by your full name and birth date on the Tree of Life.",
    nameLabel: "Full Name",
    namePlaceholder: "e.g. Sophia Evelyn Brooks",
    birthDateLabel: "Birth Date",
    submitBtn: "Reveal Life Mission",
    calculatingBtn: "Reading the Tree of Life...",
    resetBtn: "New reading",
    speakBtn: "Listen",
    stopSpeakBtn: "Stop voice",
    copyBtn: "Copy reading",
    copiedBtn: "Copied",
    askOuijaBtn: "Explore in Ouija",
    treeCaption: "Etz Chaim · The Ten Sephiroth & Twenty-Two Paths",
    inspectHint: "Select any Sephira on the tree to inspect its archetype",
    birthSephiraLabel: "Birth Sephira",
    nameSephiraLabel: "Name Sephira",
    hebrewPathLabel: "Hebrew Path",
    pillarLabel: "Soul Pillar",
    missionSectionTitle: "Life Mission & Purpose",
    connectionSectionTitle: "Bridge Between Birth & Name",
    nameVibrationTitle: "Name Gematria & Vibration",
    tikkunTitle: "Tikkun (Soul Correction)",
    giftsTitle: "Spiritual Gifts",
    practiceTitle: "Daily Alignment Practice",
    affirmationTitle: "Kabbalistic Affirmation",
    emptyPromptTitle: "The Tree of Life awaits your coordinates",
    emptyPromptDesc:
      "Enter your full name and date of birth to compute your Gematria, locate your ruling Sephira, and unveil your sacred mission.",
    gematriaLabel: "Gematria",
    lifePathLabel: "Life Path",
    soulUrgeLabel: "Soul Urge",
    expressionLabel: "Expression",
  },
  pt: {
    kicker: "Cabala Mística · Árvore da Vida (Etz Chaim)",
    title: "Sua Missão de Vida segundo a Cabala",
    subtitle:
      "Descubra a Sefirá da sua alma, o Caminho Hebraico e o Tikkun revelados pelo seu nome completo e data de nascimento na Árvore da Vida.",
    nameLabel: "Nome completo",
    namePlaceholder: "Ex. Sofia Valentina Silva",
    birthDateLabel: "Data de nascimento",
    submitBtn: "Revelar Missão de Vida",
    calculatingBtn: "Decifrando a Árvore da Vida...",
    resetBtn: "Nova consulta",
    speakBtn: "Ouvir",
    stopSpeakBtn: "Parar voz",
    copyBtn: "Copiar leitura",
    copiedBtn: "Copiado",
    askOuijaBtn: "Aprofundar na Ouija",
    treeCaption: "Etz Chaim · As Dez Sefirot e os Vinte e Dois Caminhos",
    inspectHint: "Toque em qualquer Sefirá para contemplar seu arquétipo",
    birthSephiraLabel: "Sefirá Natal",
    nameSephiraLabel: "Sefirá do Nome",
    hebrewPathLabel: "Caminho Hebraico",
    pillarLabel: "Pilar da Alma",
    missionSectionTitle: "Propósito e Missão de Vida",
    connectionSectionTitle: "Ponte entre Nascimento e Nome",
    nameVibrationTitle: "Gematria e Vibração do Nome",
    tikkunTitle: "Tikkun (Correção da Alma)",
    giftsTitle: "Dons Espirituais",
    practiceTitle: "Prática Diária de Alinhamento",
    affirmationTitle: "Afirmação Cabalística",
    emptyPromptTitle: "A Árvore da Vida aguarda suas coordenadas",
    emptyPromptDesc:
      "Informe seu nome completo e data de nascimento para calcular sua Gematria pessoal e revelar sua missão espiritual.",
    gematriaLabel: "Gematria",
    lifePathLabel: "Caminho Natal",
    soulUrgeLabel: "Anseio da Alma",
    expressionLabel: "Expressão",
  },
  fr: {
    kicker: "Kabbale Mystique · Arbre de Vie (Etz Haïm)",
    title: "Votre Mission de Vie selon la Kabbale",
    subtitle:
      "Découvrez la Sephira de votre âme, le Sentier Hébraïque et le Tikkoun révélés par votre nom complet et votre date de naissance sur l'Arbre de Vie.",
    nameLabel: "Nom complet",
    namePlaceholder: "Ex. Camille Élodie Laurent",
    birthDateLabel: "Date de naissance",
    submitBtn: "Révéler ma Mission",
    calculatingBtn: "Lecture de l'Arbre de Vie...",
    resetBtn: "Nouvelle lecture",
    speakBtn: "Écouter",
    stopSpeakBtn: "Arrêter la voix",
    copyBtn: "Copier",
    copiedBtn: "Copié",
    askOuijaBtn: "Approfondir sur Ouija",
    treeCaption: "Etz Haïm · Les Dix Sephiroth et Vingt-Deux Sentiers",
    inspectHint: "Sélectionnez une Sephira pour explorer son archétype",
    birthSephiraLabel: "Sephira Natale",
    nameSephiraLabel: "Sephira du Nom",
    hebrewPathLabel: "Sentier Hébraïque",
    pillarLabel: "Pilier de l'Âme",
    missionSectionTitle: "Mission de Vie & But",
    connectionSectionTitle: "Lien entre Naissance et Nom",
    nameVibrationTitle: "Gématrie du Nom",
    tikkunTitle: "Tikkoun (Évolution de l'Âme)",
    giftsTitle: "Dons Spirituels",
    practiceTitle: "Pratique Quotidienne",
    affirmationTitle: "Affirmation Kabbalistique",
    emptyPromptTitle: "L'Arbre de Vie attend vos coordonnées",
    emptyPromptDesc:
      "Saisissez votre nom complet et votre date de naissance pour calculer votre gématrie et révéler votre mission spirituelle.",
    gematriaLabel: "Gématrie",
    lifePathLabel: "Chemin de Vie",
    soulUrgeLabel: "Élan de l'Âme",
    expressionLabel: "Expression",
  },
  it: {
    kicker: "Cabala Mistica · Albero della Vita (Etz Chaim)",
    title: "La Tua Missione di Vita secondo la Cabala",
    subtitle:
      "Scopri la Sefira della tua anima, il Sentiero Ebraico e il Tikkun rivelati dal tuo nome completo e dalla tua data di nascita nell'Albero della Vita.",
    nameLabel: "Nome completo",
    namePlaceholder: "Es. Sofia Elena Conti",
    birthDateLabel: "Data di nascita",
    submitBtn: "Rivela Missione di Vita",
    calculatingBtn: "Lettura dell'Albero della Vita...",
    resetBtn: "Nuova lettura",
    speakBtn: "Ascolta",
    stopSpeakBtn: "Ferma voce",
    copyBtn: "Copia",
    copiedBtn: "Copiato",
    askOuijaBtn: "Esplora nella Ouija",
    treeCaption: "Etz Chaim · Le Dieci Sefirot e i Ventidue Sentieri",
    inspectHint: "Seleziona una Sefira per esplorarne l'archetipo",
    birthSephiraLabel: "Sefira Natale",
    nameSephiraLabel: "Sefira del Nome",
    hebrewPathLabel: "Sentiero Ebraico",
    pillarLabel: "Pilastro dell'Anima",
    missionSectionTitle: "Scopo e Missione di Vita",
    connectionSectionTitle: "Ponte tra Nascita e Nome",
    nameVibrationTitle: "Gematria e Vibrazione del Nome",
    tikkunTitle: "Tikkun (Lezione dell'Anima)",
    giftsTitle: "Doni Spirituali",
    practiceTitle: "Pratica Quotidiana",
    affirmationTitle: "Affermazione Cabalistica",
    emptyPromptTitle: "L'Albero della Vita attende le tue coordinate",
    emptyPromptDesc:
      "Inserisci nome completo e data di nascita per calcolare la tua Gematria e rivelare la tua missione spirituale.",
    gematriaLabel: "Gematria",
    lifePathLabel: "Sentiero Natale",
    soulUrgeLabel: "Desiderio dell'Anima",
    expressionLabel: "Espressione",
  },
  de: {
    kicker: "Mystische Kabbala · Lebensbaum (Etz Chaim)",
    title: "Deine Lebensmission nach der Kabbala",
    subtitle:
      "Entdecke die leitende Sephira deiner Seele, den Hebräischen Pfad und dein Tikkun anhand deines vollständigen Namens und Geburtsdatums.",
    nameLabel: "Vollständiger Name",
    namePlaceholder: "z. B. Sophia Maria Weber",
    birthDateLabel: "Geburtsdatum",
    submitBtn: "Lebensmission enthüllen",
    calculatingBtn: "Lebensbaum wird gedeutet...",
    resetBtn: "Neue Abfrage",
    speakBtn: "Anhören",
    stopSpeakBtn: "Stimme stoppen",
    copyBtn: "Kopieren",
    copiedBtn: "Kopiert",
    askOuijaBtn: "Im Ouija vertiefen",
    treeCaption: "Etz Chaim · Die Zehn Sephiroth & Zweiundzwanzig Pfade",
    inspectHint: "Wähle eine Sephira auf dem Baum aus, um ihren Archetyp zu sehen",
    birthSephiraLabel: "Geburts-Sephira",
    nameSephiraLabel: "Namens-Sephira",
    hebrewPathLabel: "Hebräischer Pfad",
    pillarLabel: "Seelensäule",
    missionSectionTitle: "Lebensmission & Bestimmung",
    connectionSectionTitle: "Brücke zwischen Geburt & Name",
    nameVibrationTitle: "Namens-Gematria & Schwingung",
    tikkunTitle: "Tikkun (Seelenaufgabe)",
    giftsTitle: "Spirituelle Gaben",
    practiceTitle: "Tägliche Ausrichtung",
    affirmationTitle: "Kabbalistische Affirmation",
    emptyPromptTitle: "Der Lebensbaum erwartet deine Koordinaten",
    emptyPromptDesc:
      "Gib deinen vollständigen Namen und dein Geburtsdatum ein, um deine Gematria und spirituelle Mission zu berechnen.",
    gematriaLabel: "Gematria",
    lifePathLabel: "Lebenspfad",
    soulUrgeLabel: "Seelendrang",
    expressionLabel: "Ausdruck",
  },
};

export const KabbalahMissionSection: React.FC<KabbalahMissionSectionProps> = ({
  onSendToOuija,
  isPaywallEnabled = false,
  freeLimit = 2,
  remainingFree = 2,
  isPassUnlocked = false,
  isCreatorUnlimited = false,
  onOpenPaywall,
  onConsumeFreeConsultation,
}) => {
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.es;

  const [fullName, setFullName] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("1990-01-15");
  const [profile, setProfile] = useState<KabbalahProfile | null>(null);
  const [reading, setReading] = useState<KabbalahReading | null>(null);
  const [inspectedSephira, setInspectedSephira] = useState<SephiraInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoNarrate, setAutoNarrate] = useState<boolean>(true);
  const autoNarrateRef = useRef<boolean>(true);
  useEffect(() => {
    autoNarrateRef.current = autoNarrate;
  }, [autoNarrate]);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  const speakReadingNow = useCallback(
    (profileData: KabbalahProfile, readingData: KabbalahReading) => {
      const script = buildKabbalahSpokenScript(profileData, readingData, language);
      setIsSpeaking(true);
      audio.speakSpiritText(
        script,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        language
      );
    },
    [language]
  );

  // Restore last saved Kabbalah Mission reading on mount
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(KABBALAH_STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed?.profile && parsed?.reading) {
          setFullName(parsed.profile.fullName || "");
          setBirthDate(parsed.profile.birthDate || "1990-01-15");
          setProfile(parsed.profile);
          setReading(parsed.reading);
          setInspectedSephira(parsed.profile.primarySephira || null);
        }
      }
    } catch {
      // ignore invalid cache
    }
  }, []);

  // Listen to global clear-history event
  useEffect(() => {
    const handleCleared = () => {
      setProfile(null);
      setReading(null);
      setInspectedSephira(null);
      setFullName("");
      setIsSpeaking(false);
      audio.stopSpeech();
    };
    window.addEventListener("ouija-history-cleared", handleCleared);
    return () => window.removeEventListener("ouija-history-cleared", handleCleared);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    if (!trimmedName || !birthDate) {
      setFormError(
        language === "en"
          ? "Please enter your full name and birth date."
          : "Por favor ingresa tu nombre completo y tu fecha de nacimiento."
      );
      return;
    }

    if (isPaywallEnabled && !isCreatorUnlimited && !isPassUnlocked && remainingFree <= 0) {
      onOpenPaywall?.();
      return;
    }
    if (!isCreatorUnlimited && !isPassUnlocked) {
      onConsumeFreeConsultation?.();
    }

    setFormError("");
    triggerHaptic(HAPTIC_PATTERNS.click);
    audio.fadeOutForSelection();
    audio.stopSpeech();
    audio.primeSpeech();
    audio.playChime(528);
    setIsSpeaking(false);
    setIsCalculating(true);

    const localProfile = calculateKabbalahProfile(trimmedName, birthDate);
    const localReading = buildLocalKabbalahReading(localProfile, language);

    let finalProfile: KabbalahProfile = localProfile;
    let finalReading: KabbalahReading = localReading;

    try {
      const authHeaders = isAdminSession() ? await getAdminAuthHeaders() : {};
      const res = await fetch("/api/kabbalah/mission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          fullName: trimmedName,
          birthDate,
          language,
          isAdmin: isAdminSession(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        finalProfile = data.profile || localProfile;
        finalReading = data.reading || localReading;
        setProfile(finalProfile);
        setReading(finalReading);
        setInspectedSephira(finalProfile.primarySephira);
        window.dispatchEvent(new CustomEvent("ouija-consultation-recorded"));
        try {
          localStorage.setItem(
            KABBALAH_STORAGE_KEY,
            JSON.stringify({ profile: finalProfile, reading: finalReading })
          );
        } catch {
          // ignore storage quota errors
        }
      } else {
        setProfile(finalProfile);
        setReading(finalReading);
        setInspectedSephira(finalProfile.primarySephira);
      }
    } catch {
      setProfile(finalProfile);
      setReading(finalReading);
      setInspectedSephira(finalProfile.primarySephira);
    } finally {
      setIsCalculating(false);
      triggerHaptic(HAPTIC_PATTERNS.revelationUnlock);
      audio.playChime(639);
      if (autoNarrateRef.current) {
        speakReadingNow(finalProfile, finalReading);
      }
    }
  };

  const handleToggleSpeech = useCallback(() => {
    if (!profile || !reading) return;
    triggerHaptic(HAPTIC_PATTERNS.click);
    if (isSpeaking) {
      audio.stopSpeech();
      setIsSpeaking(false);
      return;
    }
    audio.primeSpeech();
    speakReadingNow(profile, reading);
  }, [isSpeaking, profile, reading, speakReadingNow]);

  const handleDownloadPdf = async () => {
    if (!profile || !reading) return;
    triggerHaptic(HAPTIC_PATTERNS.click);
    setIsExportingPdf(true);
    try {
      await exportKabbalahPdf(profile, reading, language, treeOfLifeImg);
      audio.playChime(639);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCopyReading = async () => {
    if (!profile || !reading) return;
    triggerHaptic(HAPTIC_PATTERNS.click);
    const ok = await copyMysticShareText({
      title: reading.headline,
      seekerName: profile.fullName,
      bodyText: `${reading.lifeMissionSummary}\n\n${reading.sephiraConnection}\n\n${reading.nameVibrationInsight}\n\n${reading.tikkunLesson}`,
      karmicLesson: reading.practicalAlignment,
      relic: `${profile.primarySephira.name} (${profile.primarySephira.hebrewName}) · ${profile.hebrewPath.letter} (${profile.hebrewPath.hebrewChar})`,
      type: "PAST_LIFE",
    });
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleReset = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    audio.stopSpeech();
    setIsSpeaking(false);
    setProfile(null);
    setReading(null);
    setInspectedSephira(null);
    try {
      localStorage.removeItem(KABBALAH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const activeShowcaseSephira = inspectedSephira || profile?.primarySephira || SEPHIROTH[5];

  return (
    <section
      id="kabbalah-mission-section"
      aria-label={copy.title}
      className="w-full max-w-4xl rounded-3xl bg-[#0b0714]/95 border border-amber-500/35 p-5 sm:p-8 backdrop-blur-md shadow-[0_0_50px_rgba(245,158,11,0.12)] space-y-6 animate-fade-in relative overflow-hidden"
    >
      {/* Background Photo layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
        <img
          src={treeOfLifeImg}
          alt="Árbol de la Vida - Cábala"
          className="w-full h-full object-cover object-center filter brightness-85 contrast-105 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0714]/95 via-[#0b0714]/70 to-[#0b0714]/60" />
      </div>

      <div className="relative z-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-amber-500/20 pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs font-cinzel tracking-[0.16em] text-amber-300/90">
            {copy.kicker}
          </p>
          <h2 className="font-decorative text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-purple-200 text-balance">
            {copy.title}
          </h2>
          <p className="font-gothic text-xs sm:text-sm text-purple-200/85 leading-relaxed">
            {copy.subtitle}
          </p>
        </div>

        {reading && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleSpeech}
              className={`px-3.5 py-2 rounded-xl border text-xs font-cinzel font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
                isSpeaking
                  ? "bg-amber-950/80 border-amber-400 text-amber-200"
                  : "bg-purple-950/70 hover:bg-purple-900 border-purple-700/60 text-purple-100"
              }`}
            >
              {isSpeaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-300" />}
              <span>{isSpeaking ? copy.stopSpeakBtn : copy.speakBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-xl bg-amber-950/75 hover:bg-amber-900/75 border border-amber-500/50 text-amber-100 text-xs font-cinzel font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {isExportingPdf
                  ? language === "en"
                    ? "Exporting..."
                    : "Generando PDF..."
                  : language === "en"
                  ? "Export PDF"
                  : "Exportar PDF"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleCopyReading}
              className="px-3.5 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700/60 text-purple-100 text-xs font-cinzel font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-300" />}
              <span>{copied ? copy.copiedBtn : copy.copyBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-purple-800/50 text-purple-300 text-xs font-cinzel font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{copy.resetBtn}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main 2-Column Split: Left = Tree of Life Visual, Right = Form & Revelation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tree of Life Sacred Artwork & Interactive Sephiroth */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-[#07040f] shadow-[0_12px_35px_rgba(0,0,0,0.65)] aspect-[3/4]">
            {!imgError ? (
              <img
                src={treeOfLifeImg}
                alt="Árbol de la Vida de la Cábala (Etz Jaim) con sus Diez Sefirot"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#110a24] via-[#0c0718] to-[#080410]">
                <Compass className="w-14 h-14 text-amber-300/70 mb-3" />
                <p className="font-cinzel text-sm font-bold text-amber-200">
                  Etz Jaim · Árbol de la Vida
                </p>
                <p className="font-gothic text-xs text-purple-300/75 mt-1">
                  Diez Sefirot Sagradas y Veintidós Senderos de Luz
                </p>
              </div>
            )}

            {/* Subtle contrast scrim at bottom for caption */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

            {/* Interactive Sephiroth Hotspots Overlay */}
            <div className="absolute inset-0">
              {SEPHIROTH.map((seph) => {
                const isBirth = profile?.primarySephira.number === seph.number;
                const isName = profile?.nameSephira.number === seph.number;
                const isInspected = activeShowcaseSephira.number === seph.number;
                return (
                  <button
                    key={seph.number}
                    type="button"
                    onClick={() => {
                      triggerHaptic(HAPTIC_PATTERNS.click);
                      setInspectedSephira(seph);
                    }}
                    style={{
                      left: `${seph.xPercent}%`,
                      top: `${seph.yPercent}%`,
                    }}
                    title={`${seph.number}. ${seph.name} (${seph.hebrewName}) — ${seph.meaning}`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-mono tabular-nums font-bold transition-transform duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                      isBirth
                        ? "bg-amber-400/35 text-white ring-4 ring-amber-300 scale-115 shadow-[0_0_24px_rgba(251,191,36,0.95)] backdrop-blur-[1px]"
                        : isName
                        ? "bg-purple-500/35 text-white ring-3 ring-purple-300 scale-110 shadow-[0_0_20px_rgba(168,85,247,0.9)] backdrop-blur-[1px]"
                        : isInspected
                        ? "bg-black/35 text-amber-200 ring-2 ring-amber-300/90 scale-105"
                        : "bg-black/15 hover:bg-black/45 text-white/85 border border-amber-300/35 hover:border-amber-200"
                    }`}
                  >
                    <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">{seph.number}</span>
                  </button>
                );
              })}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-3.5 pointer-events-none">
              <p className="font-cinzel text-xs font-semibold text-amber-200 tracking-wide">
                {copy.treeCaption}
              </p>
              <p className="font-gothic text-[11px] text-purple-200/80">
                {copy.inspectHint}
              </p>
            </div>
          </div>

          {/* Active Sephira Archetype Card below Image */}
          <div className="rounded-2xl bg-black/50 border border-purple-800/45 p-4 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="font-cinzel font-bold text-sm text-amber-200">
                {activeShowcaseSephira.number}. {activeShowcaseSephira.name} ({activeShowcaseSephira.hebrewName})
              </div>
              <span className="text-xs font-gothic text-purple-300/85">
                {activeShowcaseSephira.planet}
              </span>
            </div>
            <div className="text-xs font-gothic text-amber-100/80">
              {activeShowcaseSephira.meaning} · {activeShowcaseSephira.pillar}
            </div>
            <p className="text-xs font-gothic text-purple-200/85 leading-relaxed pt-1">
              {activeShowcaseSephira.essence}
            </p>
          </div>
        </div>

        {/* Right Column: Input Form + Kabbalah Life Mission Revelation */}
        <div className="lg:col-span-7 space-y-5">
          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-[#120b21]/85 border border-purple-800/45 p-4 sm:p-5 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="kabbalah-full-name"
                  className="flex items-center gap-1.5 text-xs font-cinzel font-semibold text-purple-200"
                >
                  <User className="w-3.5 h-3.5 text-amber-300" />
                  <span>{copy.nameLabel}</span>
                </label>
                <input
                  id="kabbalah-full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (formError) setFormError("");
                  }}
                  placeholder={copy.namePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-purple-700/60 focus:border-amber-400 focus:outline-none text-sm font-gothic text-purple-100 placeholder:text-purple-400/45"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="kabbalah-birth-date"
                  className="flex items-center gap-1.5 text-xs font-cinzel font-semibold text-purple-200"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-300" />
                  <span>{copy.birthDateLabel}</span>
                </label>
                <input
                  id="kabbalah-birth-date"
                  type="date"
                  value={birthDate}
                  onChange={(e) => {
                    setBirthDate(e.target.value);
                    if (formError) setFormError("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-purple-700/60 focus:border-amber-400 focus:outline-none text-sm font-mono tabular-nums text-purple-100"
                  required
                />
              </div>
            </div>

            {formError && (
              <p className="text-xs font-gothic text-rose-300">{formError}</p>
            )}

            <label className="flex items-center gap-2 text-xs text-purple-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoNarrate}
                onChange={(e) => setAutoNarrate(e.target.checked)}
                className="accent-amber-400 rounded"
              />
              <Volume2 className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {language === "en"
                  ? "Narrate Kabbalah reading aloud automatically"
                  : "Narrar lectura de Cábala por voz automáticamente"}
              </span>
            </label>

            <button
              type="submit"
              disabled={isCalculating}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:via-amber-300 hover:to-orange-400 text-neutral-950 font-cinzel font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_24px_rgba(245,158,11,0.35)] transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isCalculating ? copy.calculatingBtn : copy.submitBtn}</span>
            </button>
          </form>

          {/* Reading Output or Empty State */}
          {!profile || !reading ? (
            <div className="rounded-2xl bg-black/40 border border-purple-900/45 p-6 sm:p-8 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-amber-300/60 mx-auto" />
              <h3 className="font-cinzel font-bold text-base sm:text-lg text-amber-100">
                {copy.emptyPromptTitle}
              </h3>
              <p className="font-gothic text-xs sm:text-sm text-purple-200/80 max-w-md mx-auto leading-relaxed">
                {copy.emptyPromptDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Headline & Key Numerical Coordinates */}
              <div className="rounded-2xl bg-[#140c24]/90 border border-amber-500/40 p-5 space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-gothic text-amber-200/85">
                    {profile.fullName} · {profile.birthDate} · {profile.dominantPillar}
                  </div>
                  <h3 className="font-decorative text-xl sm:text-2xl font-bold text-amber-100 leading-snug text-balance">
                    {reading.headline}
                  </h3>
                </div>

                {profile.masterNumberNote && (
                  <p className="text-xs font-gothic text-amber-200 bg-amber-950/40 border border-amber-500/35 rounded-xl px-3.5 py-2.5">
                    {profile.masterNumberNote}
                  </p>
                )}

                {/* Tabular Key Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="rounded-xl bg-black/45 border border-purple-800/40 p-3">
                    <div className="text-[11px] font-gothic text-purple-300/80">
                      {copy.birthSephiraLabel}
                    </div>
                    <div className="font-cinzel font-bold text-sm text-amber-200 tabular-nums mt-0.5">
                      {profile.primarySephira.number}. {profile.primarySephira.name}
                    </div>
                    <div className="text-[11px] font-gothic text-purple-300/75">
                      {profile.primarySephira.hebrewName}
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/45 border border-purple-800/40 p-3">
                    <div className="text-[11px] font-gothic text-purple-300/80">
                      {copy.nameSephiraLabel}
                    </div>
                    <div className="font-cinzel font-bold text-sm text-purple-100 tabular-nums mt-0.5">
                      {profile.nameSephira.number}. {profile.nameSephira.name}
                    </div>
                    <div className="text-[11px] font-gothic text-purple-300/75">
                      {copy.gematriaLabel}: {profile.nameGematriaRaw} → {profile.nameNumber}
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/45 border border-purple-800/40 p-3">
                    <div className="text-[11px] font-gothic text-purple-300/80">
                      {copy.hebrewPathLabel}
                    </div>
                    <div className="font-cinzel font-bold text-sm text-amber-200 mt-0.5">
                      {profile.hebrewPath.letter} ({profile.hebrewPath.hebrewChar})
                    </div>
                    <div className="text-[11px] font-gothic text-purple-300/75 truncate">
                      {profile.hebrewPath.meaning}
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/45 border border-purple-800/40 p-3">
                    <div className="text-[11px] font-gothic text-purple-300/80">
                      {copy.lifePathLabel} · {copy.soulUrgeLabel}
                    </div>
                    <div className="font-mono font-bold text-sm text-purple-100 tabular-nums mt-0.5">
                      {profile.lifePathNumber} · {profile.soulUrgeNumber} · {profile.expressionNumber}
                    </div>
                    <div className="text-[11px] font-gothic text-purple-300/75">
                      {copy.expressionLabel}
                    </div>
                  </div>
                </div>
              </div>

              {/* Narrative Blocks separated cleanly by whitespace & hairline dividers */}
              <div className="rounded-2xl bg-black/45 border border-purple-800/40 p-5 space-y-5 divide-y divide-purple-900/45">
                <div className="space-y-1.5">
                  <h4 className="font-cinzel font-bold text-sm text-amber-200">
                    {copy.missionSectionTitle}
                  </h4>
                  <p className="font-gothic text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                    {reading.lifeMissionSummary}
                  </p>
                </div>

                <div className="pt-4 space-y-1.5">
                  <h4 className="font-cinzel font-bold text-sm text-amber-200">
                    {copy.connectionSectionTitle}
                  </h4>
                  <p className="font-gothic text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                    {reading.sephiraConnection}
                  </p>
                </div>

                <div className="pt-4 space-y-1.5">
                  <h4 className="font-cinzel font-bold text-sm text-amber-200">
                    {copy.nameVibrationTitle}
                  </h4>
                  <p className="font-gothic text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                    {reading.nameVibrationInsight}
                  </p>
                </div>

                <div className="pt-4 space-y-1.5">
                  <h4 className="font-cinzel font-bold text-sm text-amber-200">
                    {copy.tikkunTitle}
                  </h4>
                  <p className="font-gothic text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                    {reading.tikkunLesson}
                  </p>
                </div>

                <div className="pt-4 space-y-2">
                  <h4 className="font-cinzel font-bold text-sm text-amber-200">
                    {copy.giftsTitle}
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm font-gothic text-purple-100/90 list-disc list-inside">
                    {reading.soulGifts.map((gift, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {gift}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 space-y-1.5">
                  <h4 className="font-cinzel font-bold text-sm text-amber-200">
                    {copy.practiceTitle}
                  </h4>
                  <p className="font-gothic text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                    {reading.practicalAlignment}
                  </p>
                </div>

                <div className="pt-4 space-y-2">
                  <h4 className="font-cinzel font-bold text-xs text-purple-300">
                    {copy.affirmationTitle}
                  </h4>
                  <p className="font-cinzel italic text-sm sm:text-base text-amber-100 leading-relaxed">
                    “{reading.kabbalisticAffirmation}”
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-cinzel font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                    isSpeaking
                      ? "bg-amber-950/80 border-amber-400 text-amber-200"
                      : "bg-purple-950/80 hover:bg-purple-900 border-purple-700/60 text-purple-100"
                  }`}
                >
                  {isSpeaking ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
                  <span>{isSpeaking ? copy.stopSpeakBtn : copy.speakBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isExportingPdf}
                  className="px-4 py-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900/80 border border-amber-500/60 text-amber-100 text-xs font-cinzel font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap disabled:opacity-60"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>
                    {isExportingPdf
                      ? language === "en"
                        ? "Exporting..."
                        : "Generando PDF..."
                      : language === "en"
                      ? "Export PDF"
                      : "Exportar PDF"}
                  </span>
                </button>

                {onSendToOuija && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(HAPTIC_PATTERNS.click);
                      onSendToOuija(
                        `Según mi Misión de Vida en la Cábala (${profile.primarySephira.name} y Sendero ${profile.hebrewPath.letter}) para ${profile.fullName}, ¿qué paso concreto me aconseja el oráculo hoy?`
                      );
                    }}
                    className="px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-600/50 text-purple-100 text-xs font-cinzel font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                  >
                    <span>{copy.askOuijaBtn}</span>
                    <ArrowUpRight className="w-4 h-4 text-amber-300" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unified Consultation Pass Status Bar */}
      {isPaywallEnabled && (
        <div className="pt-3 border-t border-purple-900/40 text-[11px] font-gothic">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {isCreatorUnlimited ? (
              <>
                <span className="text-amber-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {language === "en"
                      ? "Creator Mode active: unlimited Kabbalah readings & PDF enabled."
                      : "Modo Creador activo: lecturas de Cábala y PDF ilimitadas."}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onOpenPaywall?.()}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:via-orange-400 hover:to-amber-500 text-neutral-950 border border-amber-200/70 font-cinzel font-bold text-[10px] uppercase tracking-wider transition cursor-pointer shadow-[0_0_16px_rgba(245,158,11,0.4)]"
                >
                  {language === "en" ? "Unlock Panel" : "Panel de Desbloqueo"}
                </button>
              </>
            ) : isPassUnlocked ? (
              <span className="text-emerald-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {language === "en"
                    ? "Akashic Pass active: unlimited Kabbalah & portal readings unlocked."
                    : "Pase Akáshico activo: Cábala y todas las consultas desbloqueadas."}
                </span>
              </span>
            ) : remainingFree > 0 ? (
              <>
                <span className="text-purple-300/85">
                  {language === "en"
                    ? `Free consultations remaining (valid for all portal readings): ${remainingFree} of ${freeLimit}`
                    : `Consultas gratuitas disponibles (para todo tipo de consultas): ${remainingFree} de ${freeLimit}`}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenPaywall?.()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:via-orange-400 hover:to-amber-500 text-neutral-950 border border-amber-200/70 font-cinzel font-bold text-[10px] uppercase tracking-wider transition cursor-pointer shadow-[0_0_16px_rgba(245,158,11,0.4)] flex items-center space-x-1.5"
                >
                  <Lock className="w-3 h-3" />
                  <span>{language === "en" ? "Unlock" : "Desbloqueo"}</span>
                </button>
              </>
            ) : (
              <>
                <span className="text-amber-300 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {language === "en"
                      ? `Free consultations used (${freeLimit}/${freeLimit})`
                      : `Consultas gratuitas agotadas (${freeLimit}/${freeLimit})`}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onOpenPaywall?.()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:via-orange-400 hover:to-amber-500 text-neutral-950 border border-amber-200/70 font-cinzel font-bold text-[10px] uppercase tracking-wider transition cursor-pointer shadow-[0_0_18px_rgba(245,158,11,0.45)] flex items-center space-x-1.5"
                >
                  <Lock className="w-3 h-3" />
                  <span>{language === "en" ? "Unlock" : "Desbloqueo"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
      </div>
    </section>
  );
};
