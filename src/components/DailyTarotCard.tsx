import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { DailyArcana, TarotDailyResponse } from "../types";
import { MAJOR_ARCANA, getUniversalArcanaForDate, getRandomArcana, getLocalizedArcana } from "../lib/tarotData";
import { MarseilleCardArt } from "./MarseilleCardArt";
import { DeckShuffleAnimation } from "./DeckShuffleAnimation";
import { KarmicThreeCardSpread } from "./KarmicThreeCardSpread";
import { audio } from "../lib/audio";
import { useLanguage } from "../context/LanguageContext";
import { isAdminSession, getAdminHeaders } from "../lib/adminTracking";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";
import { downloadParchmentImage, copyMysticShareText } from "../lib/parchmentExport";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Compass,
  RotateCcw,
  Sun,
  Moon,
  HelpCircle,
  Share2,
  Check,
  BookOpen,
  Eye,
  Scroll,
  AudioLines,
  Shuffle,
  Calendar,
  Layers,
  Download,
  X
} from "lucide-react";

interface DailyTarotCardProps {
  onSendToOuija?: (cardName: string) => void;
}

export const DailyTarotCard: React.FC<DailyTarotCardProps> = ({ onSendToOuija }) => {
  const { t, language } = useLanguage();
  const [currentArcana, setCurrentArcana] = useState<DailyArcana>(() => getUniversalArcanaForDate());
  const [isFlipped, setIsFlipped] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [viewMode, setViewMode] = useState<"UNIVERSAL" | "PERSONAL" | "KARMIC_SPREAD">("UNIVERSAL");
  const [personalName, setPersonalName] = useState("");
  const [personalFocus, setPersonalFocus] = useState("");
  const [activeTab, setActiveTab] = useState<"MESSAGE" | "MARSEILLE" | "LIGHT_SHADOW" | "ADVICE" | "MEDITATION">("MESSAGE");
  
  // Natural Voice Narration State
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [narrationSection, setNarrationSection] = useState<string>("");
  
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showArcanario, setShowArcanario] = useState(false);
  const [arcanarioDeck, setArcanarioDeck] = useState<DailyArcana[]>(() => MAJOR_ARCANA);
  const [revealedArcanarioIds, setRevealedArcanarioIds] = useState<number[]>([]);
  const [justFlippedArcanarioId, setJustFlippedArcanarioId] = useState<number | null>(null);
  const [selectedArcanarioCard, setSelectedArcanarioCard] = useState<DailyArcana | null>(null);
  const [cosmicDateStr, setCosmicDateStr] = useState("");

  const autoNarrateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const locale = language === "en" ? "en-US" : language === "pt" ? "pt-BR" : language === "fr" ? "fr-FR" : language === "it" ? "it-IT" : language === "de" ? "de-DE" : "es-AR";

  // Fetch or initialize Universal daily card
  useEffect(() => {
    // Immediately update in-memory card localization
    setCurrentArcana((prev) => getLocalizedArcana(prev, language));

    const fetchDaily = async () => {
      try {
        const res = await fetch(`/api/tarot/daily?lang=${language}`);
        if (res.ok) {
          const data: TarotDailyResponse = await res.json();
          setCurrentArcana(data.arcana);
          setCosmicDateStr(data.cosmicDate);
        } else {
          const local = getUniversalArcanaForDate(new Date(), language);
          setCurrentArcana(local);
          setCosmicDateStr(new Date().toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
        }
      } catch {
        const local = getUniversalArcanaForDate(new Date(), language);
        setCurrentArcana(local);
        setCosmicDateStr(new Date().toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
      }
    };
    fetchDaily();

    return () => {
      audio.stopTarotNarration();
      if (autoNarrateTimeoutRef.current) clearTimeout(autoNarrateTimeoutRef.current);
    };
  }, [locale, language]);

  useEffect(() => {
    if (!showArcanario) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowArcanario(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showArcanario]);

  const startNaturalNarration = (arcanaToNarrate = currentArcana) => {
    audio.stopTarotNarration();
    setIsPlayingVoice(true);

    const localizedCard = getLocalizedArcana(arcanaToNarrate, language);

    audio.speakTarotInterpretation(
      localizedCard,
      {
        onStart: () => {
          setIsPlayingVoice(true);
        },
        onSectionChange: (section) => {
          switch (section) {
            case "MESSAGE":
              setNarrationSection(t("tarotDailyMessage"));
              setActiveTab("MESSAGE");
              break;
            case "MARSEILLE":
              setNarrationSection(t("tarotMarseilleTitle"));
              setActiveTab("MARSEILLE");
              break;
            case "LIGHT_SHADOW":
              setNarrationSection(`${t("tarotLightAspect")} & ${t("tarotShadowAspect")}`);
              setActiveTab("LIGHT_SHADOW");
              break;
            case "ADVICE":
            case "AFFIRMATION":
              setNarrationSection(t("tarotPracticalAdvice"));
              setActiveTab("ADVICE");
              break;
            default:
              setNarrationSection("");
          }
        },
        onEnd: () => {
          setIsPlayingVoice(false);
          setNarrationSection("");
        },
      },
      0.82, // Solemn natural cadence
      language
    );
  };

  const handleStopVoice = () => {
    audio.stopTarotNarration();
    setIsPlayingVoice(false);
    setNarrationSection("");
  };

  const toggleVoicePlayback = () => {
    if (isPlayingVoice) {
      handleStopVoice();
    } else {
      audio.fadeOutForSelection();
      startNaturalNarration(currentArcana);
    }
  };

  const handleNarrateSpecificSection = (sectionType: "MESSAGE" | "MARSEILLE" | "ADVICE" | "LIGHT_SHADOW") => {
    audio.fadeOutForSelection();
    audio.stopTarotNarration();
    setIsPlayingVoice(true);
    let textToSpeak = "";

    if (sectionType === "MESSAGE") {
      setActiveTab("MESSAGE");
      setNarrationSection(t("tarotDailyMessage"));
      textToSpeak = `${currentArcana.marseilleTitle || currentArcana.name}: ${currentArcana.dailyMessage}. ${currentArcana.cosmicEnergy}`;
    } else if (sectionType === "MARSEILLE") {
      setActiveTab("MARSEILLE");
      setNarrationSection(t("tarotMarseilleTitle"));
      textToSpeak = `${currentArcana.marseilleTitle || currentArcana.name}: ${currentArcana.marseilleDetails || ""}. ${currentArcana.astrologicalSign}. ${currentArcana.element}.`;
    } else if (sectionType === "LIGHT_SHADOW") {
      setActiveTab("LIGHT_SHADOW");
      setNarrationSection(`${t("tarotLightAspect")} & ${t("tarotShadowAspect")}`);
      textToSpeak = `${t("tarotLightAspect")}: ${currentArcana.lightAspect}. ${t("tarotShadowAspect")}: ${currentArcana.shadowAspect}.`;
    } else if (sectionType === "ADVICE") {
      setActiveTab("ADVICE");
      setNarrationSection(t("tarotPracticalAdvice"));
      textToSpeak = `${t("tarotPracticalAdvice")}: ${currentArcana.practicalAdvice}. ${currentArcana.dailyAffirmation}. ${currentArcana.meditationQuestion || ""}.`;
    }

    audio.speakSpiritText(
      textToSpeak,
      () => setIsPlayingVoice(true),
      () => {
        setIsPlayingVoice(false);
        setNarrationSection("");
      }
    );
  };

  const handleFlipCard = () => {
    if (isShuffling) return;
    triggerHaptic(HAPTIC_PATTERNS.tarotCardFlip);
    setIsFlipping(true);
    const willBeFlipped = !isFlipped;
    if (willBeFlipped) {
      audio.fadeOutForSelection();
    }
    
    if (!isFlipped) {
      audio.playCardShuffle();
      setTimeout(() => {
        audio.playTarotReveal();
      }, 250);
    }
    setIsFlipped(willBeFlipped);

    // Natural revelation narration
    if (willBeFlipped) {
      if (autoNarrateTimeoutRef.current) clearTimeout(autoNarrateTimeoutRef.current);
      autoNarrateTimeoutRef.current = setTimeout(() => {
        startNaturalNarration(currentArcana);
      }, 650);
    } else {
      handleStopVoice();
    }

    setTimeout(() => {
      setIsFlipping(false);
    }, 700);
  };

  const handleShuffleDeck = () => {
    if (isShuffling) return;
    audio.fadeOutForSelection();
    triggerHaptic(HAPTIC_PATTERNS.tarotShuffle);
    handleStopVoice();
    setIsShuffling(true);
    setIsFlipped(false);
    audio.playFullDeckShuffle();

    const newCard = getRandomArcana(currentArcana.id, language);

    setTimeout(() => {
      setCurrentArcana(newCard);
      setIsShuffling(false);
      setIsFlipped(true);
      audio.playTarotReveal();
      triggerHaptic(HAPTIC_PATTERNS.revelationUnlock);

      if (autoNarrateTimeoutRef.current) clearTimeout(autoNarrateTimeoutRef.current);
      autoNarrateTimeoutRef.current = setTimeout(() => {
        startNaturalNarration(newCard);
      }, 600);
    }, 1850);
  };

  const handleDrawPersonalCard = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isShuffling || isDrawing) return;
    audio.fadeOutForSelection();
    setIsDrawing(true);
    setIsShuffling(true);
    handleStopVoice();
    setIsFlipped(false);
    audio.playFullDeckShuffle();

    try {
      const res = await fetch("/api/tarot/draw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({
          seekerName: personalName || "Buscador",
          focusQuery: personalFocus,
          excludeId: currentArcana.id,
          lang: language,
          isAdmin: isAdminSession(),
        }),
      });

      let nextCard: DailyArcana;
      if (res.ok) {
        const data: TarotDailyResponse = await res.json();
        nextCard = data.arcana;
        window.dispatchEvent(new CustomEvent("ouija-consultation-recorded"));
      } else {
        nextCard = getRandomArcana(currentArcana.id, language);
      }

      setTimeout(() => {
        setCurrentArcana(nextCard);
        setIsDrawing(false);
        setIsShuffling(false);
        setIsFlipped(true);
        audio.playTarotReveal();

        if (autoNarrateTimeoutRef.current) clearTimeout(autoNarrateTimeoutRef.current);
        autoNarrateTimeoutRef.current = setTimeout(() => {
          startNaturalNarration(nextCard);
        }, 600);
      }, 1850);
    } catch {
      // Fallback
      setTimeout(() => {
        const nextCard = getRandomArcana(currentArcana.id, language);
        setCurrentArcana(nextCard);
        setIsDrawing(false);
        setIsShuffling(false);
        setIsFlipped(true);
        audio.playTarotReveal();

        if (autoNarrateTimeoutRef.current) clearTimeout(autoNarrateTimeoutRef.current);
        autoNarrateTimeoutRef.current = setTimeout(() => {
          startNaturalNarration(nextCard);
        }, 600);
      }, 1850);
    }
  };

  const handleResetToUniversal = () => {
    handleStopVoice();
    setIsFlipping(true);
    audio.playCardShuffle();
    const local = getUniversalArcanaForDate(new Date(), language);
    setCurrentArcana(local);
    setViewMode("UNIVERSAL");
    setIsFlipped(true);
    setTimeout(() => setIsFlipping(false), 700);

    if (autoNarrateTimeoutRef.current) clearTimeout(autoNarrateTimeoutRef.current);
    autoNarrateTimeoutRef.current = setTimeout(() => {
      startNaturalNarration(local);
    }, 600);
  };

  const buildShuffledLocalizedDeck = () => {
    const localized = MAJOR_ARCANA.map((c) => getLocalizedArcana(c, language));
    for (let i = localized.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [localized[i], localized[j]] = [localized[j], localized[i]];
    }
    return localized;
  };

  const openArcanarioPanel = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    setArcanarioDeck(buildShuffledLocalizedDeck());
    setRevealedArcanarioIds([]);
    setJustFlippedArcanarioId(null);
    setSelectedArcanarioCard(null);
    setShowArcanario(true);
  };

  const handleShuffleArcanario = () => {
    triggerHaptic(HAPTIC_PATTERNS.tarotShuffle);
    audio.playFullDeckShuffle();
    setRevealedArcanarioIds([]);
    setJustFlippedArcanarioId(null);
    setSelectedArcanarioCard(null);
    setArcanarioDeck(buildShuffledLocalizedDeck());
  };

  const handleToggleAllArcanario = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    if (revealedArcanarioIds.length === arcanarioDeck.length) {
      setRevealedArcanarioIds([]);
      setSelectedArcanarioCard(null);
    } else {
      audio.playCardShuffle();
      setRevealedArcanarioIds(arcanarioDeck.map((c) => c.id));
    }
  };

  const handleSelectCardFromDeck = (card: DailyArcana) => {
    if (isShuffling) return;
    const localized = getLocalizedArcana(card, language);
    audio.fadeOutForSelection();
    handleStopVoice();
    setIsFlipping(true);
    audio.playCardShuffle();
    setTimeout(() => {
      audio.playTarotReveal();
    }, 250);
    setCurrentArcana({ ...localized, isPersonalDraw: false });
    setIsFlipped(true);
    setTimeout(() => setIsFlipping(false), 700);

    if (autoNarrateTimeoutRef.current) clearTimeout(autoNarrateTimeoutRef.current);
    autoNarrateTimeoutRef.current = setTimeout(() => {
      startNaturalNarration(localized);
    }, 650);
  };

  const handleRevealArcanarioCard = (card: DailyArcana) => {
    const localized = getLocalizedArcana(card, language);
    const alreadyRevealed = revealedArcanarioIds.includes(localized.id);

    triggerHaptic(alreadyRevealed ? HAPTIC_PATTERNS.click : HAPTIC_PATTERNS.tarotCardFlip);
    setSelectedArcanarioCard(localized);

    if (!alreadyRevealed) {
      setRevealedArcanarioIds((prev) => [...prev, localized.id]);
      setJustFlippedArcanarioId(localized.id);
      setTimeout(() => {
        setJustFlippedArcanarioId((prev) => (prev === localized.id ? null : prev));
      }, 750);
      handleSelectCardFromDeck(localized);
    } else {
      audio.fadeOutForSelection();
      setCurrentArcana({ ...localized, isPersonalDraw: false });
      setIsFlipped(true);
    }
  };

  const handleCopyMessage = async () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    const body = `🏛️ *Arquetipo:* ${currentArcana.archetype}\n🔮 *Elemento:* ${currentArcana.element} • ${currentArcana.astrologicalSign}\n\n📜 *Mensaje:* ${currentArcana.dailyMessage}\n\n🌟 *Consejo Práctico:* ${currentArcana.practicalAdvice}\n\n💫 *Afirmación:* "${currentArcana.dailyAffirmation}"`;
    const ok = await copyMysticShareText({
      title: `${currentArcana.marseilleTitle || currentArcana.name} (${currentArcana.romanNumber})`,
      seekerName: personalName || "Alma Buscadora",
      bodyText: body,
      type: "TAROT",
    });
    if (ok) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleDownloadParchment = async () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    setIsDownloading(true);
    await downloadParchmentImage("daily-tarot-card-parchment", `arcano-${currentArcana.name.toLowerCase().replace(/\s+/g, "_")}.png`);
    setIsDownloading(false);
  };

  return (
    <section 
      id="daily-tarot-card-parchment"
      className="w-full max-w-4xl bg-[#0d0718]/90 border border-purple-800/50 rounded-3xl p-4 sm:p-7 backdrop-blur-xl shadow-2xl relative overflow-hidden my-4 text-purple-100"
    >
      {/* Mystical Background Radiant Aura */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: currentArcana.colorHex }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: currentArcana.colorHex }}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-900/50 pb-4 mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-950/80 border border-purple-700/60 rounded-2xl shadow-inner text-amber-300">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-cinzel font-bold text-amber-200 tracking-wide">
              {t("tarotTitle")}
            </h2>
            <p className="text-xs text-purple-300/80 font-gothic">
              {cosmicDateStr || t("tarotSubtitle")}
            </p>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Direct Shuffle Button in Header */}
          <button
            onClick={handleShuffleDeck}
            disabled={isShuffling}
            className="px-3 py-1.5 rounded-xl text-xs font-cinzel font-bold transition flex items-center space-x-1.5 cursor-pointer bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-amber-200 border border-amber-500/40 shadow-[0_0_12px_rgba(251,191,36,0.2)] disabled:opacity-50"
            title={t("tarotShuffleBtn")}
          >
            <Shuffle className={`w-3.5 h-3.5 text-amber-300 ${isShuffling ? "animate-spin" : ""}`} />
            <span>{isShuffling ? t("tarotShuffling") : t("tarotShuffleBtn")}</span>
          </button>

          {/* Subtle Audio Toggle */}
          <button
            onClick={toggleVoicePlayback}
            className={`p-2 rounded-xl text-xs transition flex items-center justify-center cursor-pointer border ${
              isPlayingVoice
                ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(251,191,36,0.3)] animate-pulse"
                : "bg-purple-950/40 text-purple-400 border-purple-900/40 hover:text-purple-200 hover:border-purple-700"
            }`}
            title={isPlayingVoice ? "Silenciar voz" : "Escuchar arcano"}
          >
            {isPlayingVoice ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-purple-400" />
            )}
          </button>

          <button
            onClick={() => {
              setViewMode("UNIVERSAL");
              handleResetToUniversal();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition cursor-pointer flex items-center space-x-1 ${
              viewMode === "UNIVERSAL"
                ? "bg-purple-800 text-purple-100 shadow-md border border-purple-500/50"
                : "bg-purple-950/40 text-purple-400 hover:text-purple-200"
            }`}
            title={t("tarotUniversalTitle")}
          >
            <Calendar className="w-3 h-3" />
            <span>{t("tarotUniversalTitle")}</span>
          </button>
          <button
            onClick={() => setViewMode("PERSONAL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition cursor-pointer ${
              viewMode === "PERSONAL"
                ? "bg-gradient-to-r from-amber-600 to-purple-700 text-amber-100 shadow-md border border-amber-400/50"
                : "bg-purple-950/40 text-purple-400 hover:text-purple-200"
            }`}
          >
            {t("tarotPersonalDrawTitle")}
          </button>
          <button
            onClick={() => setViewMode("KARMIC_SPREAD")}
            className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              viewMode === "KARMIC_SPREAD"
                ? "bg-gradient-to-r from-indigo-700 to-purple-800 text-indigo-100 shadow-md border border-indigo-400/50"
                : "bg-purple-950/40 text-purple-400 hover:text-purple-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-300" />
            <span>Tirada 3 Cartas</span>
          </button>
          <button
            type="button"
            onClick={openArcanarioPanel}
            className="px-3 py-1.5 rounded-xl text-xs font-cinzel font-bold transition cursor-pointer flex items-center space-x-1.5 bg-gradient-to-r from-amber-700/70 to-purple-800/80 hover:from-amber-600/80 hover:to-purple-700 text-amber-100 border border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.25)]"
            title={t("tarotViewAllArcana")}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>{t("tarotViewAllArcana")}</span>
          </button>
        </div>
      </div>

      {/* Render 3-Card Karmic Spread If Selected */}
      {viewMode === "KARMIC_SPREAD" ? (
        <KarmicThreeCardSpread onSendToOuija={onSendToOuija} />
      ) : (
        <>
          {/* Personal Draw Form If Personal Mode */}
          {viewMode === "PERSONAL" && (
        <form
          onSubmit={handleDrawPersonalCard}
          className="mb-6 p-4 rounded-2xl bg-black/40 border border-purple-900/60 flex flex-col sm:flex-row items-center gap-3 animate-fade-in"
        >
          <input
            type="text"
            value={personalName}
            onChange={(e) => setPersonalName(e.target.value)}
            placeholder={t("inputYourName")}
            className="px-3.5 py-2 bg-black/60 border border-purple-800/60 rounded-xl text-xs text-purple-100 placeholder-purple-500 focus:outline-none focus:border-purple-400 w-full sm:w-1/3"
          />
          <input
            type="text"
            value={personalFocus}
            onChange={(e) => setPersonalFocus(e.target.value)}
            placeholder={t("inputFeeling")}
            className="px-3.5 py-2 bg-black/60 border border-purple-800/60 rounded-xl text-xs text-purple-100 placeholder-purple-500 focus:outline-none focus:border-purple-400 flex-1"
          />
          <button
            type="submit"
            disabled={isDrawing || isShuffling}
            className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isShuffling || isDrawing ? t("tarotShuffling") : t("tarotShuffleBtn")}</span>
          </button>
        </form>
      )}

      {/* Main Interactive Grid: Sacred Card & Wisdom Deck */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Interactive 3D Tarot Card OR Live 3D Deck Shuffling Animation */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          {isShuffling ? (
            <DeckShuffleAnimation targetColor={currentArcana.colorHex} />
          ) : (
            <div
              onClick={handleFlipCard}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative w-64 sm:w-72 h-[410px] sm:h-[430px] cursor-pointer group perspective-1000 select-none animate-tarot-float"
              title="Toca para voltear o revelar el arcano"
            >
              {/* Card Inner Wrapper with 3D Rotate */}
              <div
                className={`w-full h-full rounded-2xl relative transition-transform duration-700 transform-style-3d shadow-2xl group-hover:scale-[1.03] ${
                  isFlipped ? "rotate-y-0" : "rotate-y-180"
                }`}
              >
                {/* === CARD FRONT (Tarot de Marsella Woodcut with Living Candlelight Flicker) === */}
                <div
                  className="absolute inset-0 w-full h-full rounded-2xl p-2.5 flex flex-col justify-between backface-hidden border-2 bg-gradient-to-b from-[#180e2b] via-[#120822] to-[#0a0414] overflow-hidden"
                  style={{
                    borderColor: currentArcana.colorHex,
                    boxShadow: `0 0 35px ${currentArcana.colorHex}60, inset 0 0 25px ${currentArcana.colorHex}40, 0 0 15px rgba(251,191,36,0.5)`,
                  }}
                >
                  <MarseilleCardArt
                    cardId={currentArcana.id}
                    romanNumber={currentArcana.romanNumber}
                    marseilleTitle={currentArcana.marseilleTitle}
                    name={currentArcana.name}
                    colorHex={currentArcana.colorHex}
                    isFlipping={isFlipping}
                    isHovered={isHovered}
                  />
                </div>

                {/* === CARD BACK === */}
                <div className="absolute inset-0 w-full h-full rounded-2xl p-3 flex flex-col justify-between backface-hidden rotate-y-180 border-2 border-amber-500/60 bg-gradient-to-b from-[#1a0f30] via-[#0f071d] to-[#07030e] shadow-[0_0_25px_rgba(168,85,247,0.35)]">
                  <div className="w-full h-full border-2 border-amber-400/50 rounded-xl p-3 flex flex-col items-center justify-between relative bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.2),transparent_70%)]">
                    <div className="w-full flex justify-between text-amber-400/70 text-xs">
                      <span>✦</span>
                      <span>☽</span>
                      <span>✦</span>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-3 text-center">
                      <div className="w-22 h-22 rounded-full border-2 border-amber-400/50 flex items-center justify-center bg-purple-950/70 relative shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                        <div className="absolute inset-2 rounded-full border border-purple-400/40 animate-spin-reverse" />
                        <Eye className="w-8 h-8 text-amber-300 animate-pulse" />
                      </div>
                      <span className="text-xs font-cinzel font-bold uppercase tracking-[0.2em] text-amber-300 drop-shadow">
                        Tarot de Marsella
                      </span>
                      <span className="text-[10px] text-purple-300 font-gothic italic">
                        Toca para revelar el arcano
                      </span>
                    </div>

                    <div className="w-full flex justify-between text-amber-400/70 text-xs">
                      <span>✦</span>
                      <span>☉</span>
                      <span>✦</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar Under Card */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5">
            <button
              onClick={handleShuffleDeck}
              disabled={isShuffling}
              className="px-3.5 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 text-amber-300 text-xs font-cinzel font-bold tracking-wide transition flex items-center space-x-1.5 cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.3)] disabled:opacity-50"
            >
              <Shuffle className={`w-3.5 h-3.5 text-amber-400 ${isShuffling ? "animate-spin" : ""}`} />
              <span>{isShuffling ? t("tarotShuffling") : t("tarotShuffleBtn")}</span>
            </button>

            <button
              onClick={handleFlipCard}
              disabled={isShuffling}
              className="px-3 py-1.5 rounded-xl bg-black/50 hover:bg-purple-950/60 border border-purple-800/60 text-purple-300 text-xs font-cinzel transition flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
              <span>Voltear</span>
            </button>

            <button
              type="button"
              onClick={openArcanarioPanel}
              className="px-3 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/60 text-amber-200 text-xs font-cinzel font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>22 Arcanos</span>
            </button>
          </div>
        </div>

        {/* Right: Rich Esoteric Guidance & Wisdom */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          {!isFlipped || isShuffling ? (
            <div className="bg-black/45 border border-purple-800/60 rounded-2xl p-6 sm:p-8 min-h-[300px] flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full border-2 border-amber-400/50 bg-purple-950/70 flex items-center justify-center shadow-[0_0_24px_rgba(251,191,36,0.25)]">
                <Eye className="w-7 h-7 text-amber-300 animate-pulse" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-lg sm:text-xl font-cinzel font-bold text-amber-200">
                  {isShuffling ? "Barajando los Arcanos Mayores..." : "El Arcano está revertido"}
                </h3>
                <p className="text-xs sm:text-sm font-gothic text-purple-300/90 leading-relaxed">
                  {isShuffling
                    ? "Concentra tu intención mientras las cartas giran en el plano astral."
                    : "Toca la carta o presiona el botón para darla vuelta y revelar su figura junto con su mensaje."}
                </p>
              </div>
              {!isShuffling && (
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleFlipCard}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-purple-700 hover:from-amber-500 hover:to-purple-600 text-white text-xs font-cinzel font-bold tracking-wide transition flex items-center space-x-1.5 cursor-pointer shadow-lg"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Voltear y Revelar Mensaje</span>
                  </button>
                  <button
                    type="button"
                    onClick={openArcanarioPanel}
                    className="px-4 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-amber-500/60 text-amber-200 text-xs font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t("tarotViewAllArcana")}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
          {/* Card Title & Keywords */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-cinzel font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Arcano {currentArcana.romanNumber}
                </span>
                <span className="text-xs font-cinzel font-bold px-2 py-0.5 rounded-lg bg-red-950/70 text-amber-200 border border-amber-700/50">
                  {currentArcana.marseilleTitle || currentArcana.name}
                </span>
                <span className="text-xs font-gothic px-2 py-0.5 rounded-lg bg-purple-950 text-purple-300 border border-purple-800">
                  {currentArcana.astrologicalSign}
                </span>
                {currentArcana.isPersonalDraw && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-indigo-900/70 text-indigo-200 border border-indigo-600/50">
                    {t("tarotPersonalDrawTitle")}
                  </span>
                )}
              </div>

              {/* Natural Audio Waveform Indicator */}
              {isPlayingVoice && (
                <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-300 animate-fade-in">
                  <AudioLines className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <div className="flex items-center space-x-0.5 h-3">
                    <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-0.5 h-2 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-0.5 h-3.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="w-0.5 h-1.5 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "450ms" }} />
                  </div>
                  {narrationSection && (
                    <span className="text-[10px] font-cinzel text-amber-200 pl-1">{narrationSection}</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-2xl sm:text-3xl font-bold font-cinzel text-purple-100 tracking-wide">
                {currentArcana.name}
              </h3>
              <button
                onClick={toggleVoicePlayback}
                className={`p-1.5 rounded-xl transition cursor-pointer border ${
                  isPlayingVoice
                    ? "text-amber-300 bg-amber-950/50 border-amber-500/50 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                    : "text-purple-400 hover:text-amber-300 bg-purple-950/40 border-purple-800/40 hover:border-purple-600"
                }`}
                title={isPlayingVoice ? "Silenciar voz" : "Escuchar arcano"}
              >
                {isPlayingVoice ? (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-purple-400" />
                )}
              </button>
            </div>
            
            <p className="text-xs sm:text-sm text-purple-300/90 font-gothic italic">
              {currentArcana.archetype}
            </p>

            {/* Keyword Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {currentArcana.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-[10px] font-gothic font-medium px-2 py-0.5 rounded-md bg-purple-950/70 border border-purple-800/50 text-purple-200"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation Tabs for Wisdom Details */}
          <div className="flex border-b border-purple-900/60 gap-2 text-xs font-cinzel font-semibold overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab("MESSAGE")}
              className={`pb-2 px-1 transition border-b-2 cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
                activeTab === "MESSAGE"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-purple-400 hover:text-purple-200"
              }`}
            >
              <span>{t("tarotDailyMessage")}</span>
            </button>
            <button
              onClick={() => setActiveTab("MARSEILLE")}
              className={`pb-2 px-1 transition border-b-2 cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
                activeTab === "MARSEILLE"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-purple-400 hover:text-purple-200"
              }`}
            >
              <span>{t("tarotMarseilleTitle")}</span>
            </button>
            <button
              onClick={() => setActiveTab("LIGHT_SHADOW")}
              className={`pb-2 px-1 transition border-b-2 cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
                activeTab === "LIGHT_SHADOW"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-purple-400 hover:text-purple-200"
              }`}
            >
              <span>{t("tarotLightAspect")} & {t("tarotShadowAspect")}</span>
            </button>
            <button
              onClick={() => setActiveTab("ADVICE")}
              className={`pb-2 px-1 transition border-b-2 cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
                activeTab === "ADVICE"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-purple-400 hover:text-purple-200"
              }`}
            >
              <span>{t("tarotPracticalAdvice")}</span>
            </button>
            <button
              onClick={() => setActiveTab("MEDITATION")}
              className={`pb-2 px-1 transition border-b-2 cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
                activeTab === "MEDITATION"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-purple-400 hover:text-purple-200"
              }`}
            >
              <span>{t("tarotMeditationQuestion")}</span>
            </button>
          </div>

          {/* Tab Content Box */}
          <div className="bg-black/40 border border-purple-900/50 rounded-2xl p-4 min-h-[145px] flex flex-col justify-center text-sm font-gothic relative">
            {activeTab === "MESSAGE" && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-cinzel font-bold text-amber-300 uppercase">
                    {t("tarotDailyMessage")}
                  </span>
                  <button
                    onClick={() => handleNarrateSpecificSection("MESSAGE")}
                    className="text-purple-400 hover:text-amber-300 p-1 rounded-md transition cursor-pointer"
                    title="Escuchar"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-purple-100/95 leading-relaxed italic">
                  "{currentArcana.dailyMessage}"
                </p>
                <div className="text-[11px] text-amber-300/80 font-cinzel pt-1 flex items-center space-x-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{currentArcana.cosmicEnergy}</span>
                </div>
              </div>
            )}

            {activeTab === "MARSEILLE" && (
              <div className="space-y-2.5 animate-fade-in text-xs">
                <div className="flex items-center justify-between text-amber-300 font-cinzel font-bold uppercase text-[11px]">
                  <div className="flex items-center space-x-2">
                    <Scroll className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t("tarotMarseilleWoodcut")} ({currentArcana.marseilleTitle || currentArcana.name})</span>
                  </div>
                  <button
                    onClick={() => handleNarrateSpecificSection("MARSEILLE")}
                    className="text-purple-400 hover:text-amber-300 p-1 rounded-md transition cursor-pointer"
                    title="Escuchar"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-purple-200/95 leading-relaxed bg-purple-950/40 p-3 rounded-xl border border-purple-800/40">
                  {currentArcana.marseilleDetails || "Grabado tradicional de madera con paleta alquímica de rojos, azules y ocres medievales."}
                </p>
                <div className="flex items-center space-x-2 text-[10px] text-purple-300/80 font-cinzel">
                  <span>{t("tarotAstro")}: {currentArcana.astrologicalSign}</span>
                  <span>•</span>
                  <span>{t("tarotElement")}: {currentArcana.element}</span>
                </div>
              </div>
            )}

            {activeTab === "LIGHT_SHADOW" && (
              <div className="space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-cinzel font-bold text-amber-300 uppercase">
                    Polaridades & Arquetipo
                  </span>
                  <button
                    onClick={() => handleNarrateSpecificSection("LIGHT_SHADOW")}
                    className="text-purple-400 hover:text-amber-300 p-1 rounded-md transition cursor-pointer"
                    title="Escuchar"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 space-y-1">
                    <div className="flex items-center space-x-1 text-emerald-300 font-cinzel font-bold uppercase text-[10px]">
                      <Sun className="w-3 h-3 text-amber-400" />
                      <span>{t("tarotLightAspect")}</span>
                    </div>
                    <p className="text-purple-200/90 leading-relaxed">
                      {currentArcana.lightAspect}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-950/50 border border-purple-800/40 space-y-1">
                    <div className="flex items-center space-x-1 text-purple-300 font-cinzel font-bold uppercase text-[10px]">
                      <Moon className="w-3 h-3 text-purple-400" />
                      <span>{t("tarotShadowAspect")}</span>
                    </div>
                    <p className="text-purple-200/90 leading-relaxed">
                      {currentArcana.shadowAspect}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ADVICE" && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-cinzel font-bold text-amber-300 uppercase">
                    {t("tarotPracticalAdvice")}
                  </span>
                  <button
                    onClick={() => handleNarrateSpecificSection("ADVICE")}
                    className="text-purple-400 hover:text-amber-300 p-1 rounded-md transition cursor-pointer"
                    title="Escuchar"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-700/40">
                  <div className="text-[10px] font-cinzel font-bold uppercase text-amber-300 tracking-wider mb-1">
                    {t("tarotPracticalAdvice")}
                  </div>
                  <p className="text-purple-100 text-xs sm:text-sm leading-relaxed">
                    {currentArcana.practicalAdvice}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-700/40">
                  <div className="text-[10px] font-cinzel font-bold uppercase text-purple-300 tracking-wider mb-1">
                    {t("tarotDailyAffirmation")}
                  </div>
                  <p className="text-amber-200 text-xs sm:text-sm italic font-medium">
                    "{currentArcana.dailyAffirmation}"
                  </p>
                </div>
              </div>
            )}

            {activeTab === "MEDITATION" && (
              <div className="space-y-3 animate-fade-in">
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-700/40">
                  <div className="text-[10px] font-cinzel font-bold uppercase text-indigo-300 tracking-wider mb-1.5 flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t("tarotMeditationQuestion")}</span>
                  </div>
                  <p className="text-purple-100 text-xs sm:text-sm italic leading-relaxed">
                    "{currentArcana.meditationQuestion}"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Ask Ouija About This Card */}
            {onSendToOuija && (
              <button
                onClick={() => onSendToOuija(currentArcana.name)}
                className="px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-600/60 text-indigo-200 text-xs font-cinzel font-semibold tracking-wide transition flex items-center space-x-1.5 cursor-pointer shadow"
                title="Canalizar este Arcano en la Tabla Ouija"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>{t("askOuijaBtn")}</span>
              </button>
            )}

            {/* Download Parchment Button */}
            <button
              onClick={handleDownloadParchment}
              disabled={isDownloading}
              className="px-3.5 py-2 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-600/50 text-amber-200 text-xs font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer ml-auto"
              title="Descargar Carta como Pergamino PNG"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{isDownloading ? "Generando..." : "Descargar PNG"}</span>
            </button>

            {/* Copy / Share Button */}
            <button
              onClick={handleCopyMessage}
              className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-purple-950 border border-purple-800 text-purple-300 text-xs font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">{t("tarotCardCopied")}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t("tarotShareCard")}</span>
                </>
              )}
            </button>

            {/* Open Arcanario Panel (Gallery of 22 Major Arcana) */}
            <button
              type="button"
              onClick={openArcanarioPanel}
              className="px-3.5 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-amber-500/60 text-amber-200 hover:text-amber-100 text-xs font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>{t("tarotViewAllArcana")}</span>
            </button>
          </div>
            </>
          )}
        </div>
      </div>
        </>
      )}

      {/* Arcanario Panel Modal (rendered in document.body so parent overflow/backdrop-blur never clips it) */}
      {showArcanario &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
            onClick={() => setShowArcanario(false)}
          >
            <div
              className="relative w-full max-w-5xl max-h-[90vh] bg-[#0e081a] border border-purple-500/50 rounded-2xl p-4 sm:p-6 text-purple-100 flex flex-col shadow-[0_0_60px_rgba(147,51,234,0.45)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-900/60 pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <div>
                    <h4 className="text-sm sm:text-base font-cinzel font-bold uppercase tracking-wider text-amber-200">
                      {t("tarotAllArcanaTitle")}
                    </h4>
                    <p className="text-[11px] font-gothic text-purple-300/85">
                      Los 22 arcanos están boca abajo: elige uno para darlo vuelta y revelar su figura y mensaje.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShuffleArcanario}
                    className="px-2.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-600/60 text-amber-200 text-[11px] font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer"
                    title="Mezclar y volver a ocultar los 22 arcanos"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-amber-300" />
                    <span>Mezclar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleAllArcanario}
                    className="px-2.5 py-1.5 rounded-xl bg-black/50 hover:bg-purple-950 border border-purple-800/70 text-purple-200 text-[11px] font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-purple-300" />
                    <span>
                      {revealedArcanarioIds.length === arcanarioDeck.length ? "Ocultar Todas" : "Revelar Todas"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowArcanario(false)}
                    className="p-1.5 rounded-full bg-purple-950 text-purple-300 hover:text-white hover:bg-purple-900 transition cursor-pointer"
                    aria-label="Cerrar panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content: 22 Face-Down Flippable Cards */}
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-1 pb-2">
                  {arcanarioDeck.map((card, idx) => {
                    const isRevealed = revealedArcanarioIds.includes(card.id);
                    const isSelected = selectedArcanarioCard?.id === card.id;
                    const isCardFlipping = justFlippedArcanarioId === card.id;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => handleRevealArcanarioCard(card)}
                        className="relative h-40 sm:h-44 w-full cursor-pointer group perspective-1000 select-none animate-tarot-float text-left"
                        style={{
                          animationDelay: `${(idx % 6) * 0.45}s`,
                        }}
                        title={isRevealed ? `${card.name} — Ver mensaje` : "Toca para dar vuelta y revelar el mensaje"}
                      >
                        <div
                          className={`w-full h-full rounded-xl relative transition-transform duration-700 transform-style-3d group-hover:scale-[1.03] ${
                            isRevealed ? "rotate-y-0" : "rotate-y-180"
                          }`}
                        >
                          {/* FRONT FACE: Revealed Tarot de Marsella Figure */}
                          <div
                            className={`absolute inset-0 w-full h-full rounded-xl p-1 backface-hidden border overflow-hidden ${
                              isSelected
                                ? "bg-purple-900/90 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] ring-1 ring-amber-400/80"
                                : "bg-[#181024] border-purple-700/70"
                            }`}
                            style={{
                              borderColor: isSelected ? card.colorHex : undefined,
                            }}
                          >
                            <MarseilleCardArt
                              arcana={card}
                              compact
                              isHovered={isSelected}
                              isFlipping={isCardFlipping}
                            />
                          </div>

                          {/* BACK FACE: Reverted / Face-Down Mystic Tarot Card */}
                          <div className="absolute inset-0 w-full h-full rounded-xl p-1.5 flex flex-col justify-between backface-hidden rotate-y-180 border-2 border-amber-500/55 group-hover:border-amber-300 bg-gradient-to-b from-[#1d1036] via-[#100821] to-[#07030e] shadow-[0_0_16px_rgba(168,85,247,0.3)] group-hover:shadow-[0_0_22px_rgba(251,191,36,0.4)] transition-colors">
                            <div className="w-full h-full border border-amber-400/45 rounded-lg p-1.5 flex flex-col items-center justify-between relative bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.22),transparent_72%)]">
                              <div className="w-full flex justify-between text-amber-400/75 text-[9px]">
                                <span>✦</span>
                                <span>☽</span>
                                <span>✦</span>
                              </div>

                              <div className="flex flex-col items-center justify-center space-y-1.5 text-center">
                                <div className="w-11 h-11 rounded-full border border-amber-400/55 flex items-center justify-center bg-purple-950/75 relative shadow-[0_0_12px_rgba(251,191,36,0.25)]">
                                  <div className="absolute inset-1 rounded-full border border-purple-400/40 animate-spin-reverse" />
                                  <Eye className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-[8px] font-cinzel font-bold uppercase tracking-[0.16em] text-amber-300/90">
                                  Arcano ?
                                </span>
                                <span className="text-[8px] text-purple-300/90 font-gothic italic leading-tight">
                                  Toca para revelar
                                </span>
                              </div>

                              <div className="w-full flex justify-between text-amber-400/75 text-[9px]">
                                <span>✦</span>
                                <span>☉</span>
                                <span>✦</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedArcanarioCard && (
                <div className="mt-3 shrink-0 rounded-2xl border border-amber-500/55 bg-gradient-to-r from-purple-950/95 via-[#160b29] to-indigo-950/90 p-3 sm:p-4 shadow-[0_0_25px_rgba(251,191,36,0.22)] animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-800/60 pb-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-cinzel font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Arcano {selectedArcanarioCard.romanNumber}
                      </span>
                      <span className="text-sm sm:text-base font-cinzel font-bold text-amber-100">
                        {selectedArcanarioCard.marseilleTitle || selectedArcanarioCard.name} — {selectedArcanarioCard.name}
                      </span>
                      <span className="text-[11px] font-gothic text-purple-300">
                        • {selectedArcanarioCard.astrologicalSign}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleVoicePlayback}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-cinzel transition flex items-center space-x-1 cursor-pointer border ${
                          isPlayingVoice
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/60"
                            : "bg-purple-950/70 text-purple-200 border-purple-700/60 hover:border-amber-400/60"
                        }`}
                      >
                        {isPlayingVoice ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        <span>{isPlayingVoice ? "Silenciar" : "Escuchar"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowArcanario(false)}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-purple-700 hover:from-amber-500 hover:to-purple-600 text-white text-[11px] font-cinzel font-bold transition cursor-pointer shadow"
                      >
                        Ver Lectura Completa
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-gothic italic text-purple-100 leading-relaxed mb-2">
                    "{selectedArcanarioCard.dailyMessage}"
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-gothic">
                    <div className="p-2 rounded-xl bg-black/35 border border-purple-800/50 text-purple-200">
                      <span className="font-cinzel font-bold text-amber-300 uppercase text-[10px] block mb-0.5">
                        {t("tarotPracticalAdvice")}
                      </span>
                      {selectedArcanarioCard.practicalAdvice}
                    </div>
                    <div className="p-2 rounded-xl bg-black/35 border border-amber-700/40 text-amber-200 italic">
                      <span className="font-cinzel font-bold text-amber-300 uppercase not-italic text-[10px] block mb-0.5">
                        {t("tarotDailyAffirmation")}
                      </span>
                      "{selectedArcanarioCard.dailyAffirmation}"
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};
