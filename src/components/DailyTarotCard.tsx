import React, { useState, useEffect, useRef } from "react";
import { DailyArcana, TarotDailyResponse } from "../types";
import { MAJOR_ARCANA, getUniversalArcanaForDate, getRandomArcana, getLocalizedArcana } from "../lib/tarotData";
import { MarseilleCardArt } from "./MarseilleCardArt";
import { DeckShuffleAnimation } from "./DeckShuffleAnimation";
import { audio } from "../lib/audio";
import { useLanguage } from "../context/LanguageContext";
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
  Calendar
} from "lucide-react";

interface DailyTarotCardProps {
  onSendToOuija?: (cardName: string) => void;
}

export const DailyTarotCard: React.FC<DailyTarotCardProps> = ({ onSendToOuija }) => {
  const { t, language } = useLanguage();
  const [currentArcana, setCurrentArcana] = useState<DailyArcana>(() => getUniversalArcanaForDate());
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [viewMode, setViewMode] = useState<"UNIVERSAL" | "PERSONAL">("UNIVERSAL");
  const [personalName, setPersonalName] = useState("");
  const [personalFocus, setPersonalFocus] = useState("");
  const [activeTab, setActiveTab] = useState<"MESSAGE" | "MARSEILLE" | "LIGHT_SHADOW" | "ADVICE" | "MEDITATION">("MESSAGE");
  
  // Natural Voice Narration State
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [narrationSection, setNarrationSection] = useState<string>("");
  
  const [isCopied, setIsCopied] = useState(false);
  const [showArcanario, setShowArcanario] = useState(false);
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
      startNaturalNarration(currentArcana);
    }
  };

  const handleNarrateSpecificSection = (sectionType: "MESSAGE" | "MARSEILLE" | "ADVICE" | "LIGHT_SHADOW") => {
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
    setIsFlipping(true);
    const willBeFlipped = !isFlipped;
    
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

      if (autoNarrateTimeoutRef.current) clearTimeout(autoNarrateTimeoutRef.current);
      autoNarrateTimeoutRef.current = setTimeout(() => {
        startNaturalNarration(newCard);
      }, 600);
    }, 1850);
  };

  const handleDrawPersonalCard = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isShuffling || isDrawing) return;
    setIsDrawing(true);
    setIsShuffling(true);
    handleStopVoice();
    setIsFlipped(false);
    audio.playFullDeckShuffle();

    try {
      const res = await fetch("/api/tarot/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seekerName: personalName || "Buscador",
          focusQuery: personalFocus,
          excludeId: currentArcana.id,
          lang: language,
        }),
      });

      let nextCard: DailyArcana;
      if (res.ok) {
        const data: TarotDailyResponse = await res.json();
        nextCard = data.arcana;
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
    const local = getUniversalArcanaForDate();
    setCurrentArcana(local);
    setViewMode("UNIVERSAL");
    setIsFlipped(true);
    setTimeout(() => setIsFlipping(false), 700);

    if (autoNarrateTimeoutRef.current) clearTimeout(autoNarrateTimeoutRef.current);
    autoNarrateTimeoutRef.current = setTimeout(() => {
      startNaturalNarration(local);
    }, 600);
  };

  const handleSelectCardFromDeck = (card: DailyArcana) => {
    if (isShuffling) return;
    handleStopVoice();
    setIsFlipping(true);
    audio.playCardShuffle();
    setCurrentArcana({ ...card, isPersonalDraw: false });
    setIsFlipped(true);
    setTimeout(() => setIsFlipping(false), 700);

    if (autoNarrateTimeoutRef.current) clearTimeout(autoNarrateTimeoutRef.current);
    autoNarrateTimeoutRef.current = setTimeout(() => {
      startNaturalNarration(card);
    }, 600);
  };

  const handleCopyMessage = () => {
    const text = `✨ Arcano: ${currentArcana.marseilleTitle || currentArcana.name} (${currentArcana.romanNumber}) ✨\nArquetipo: ${currentArcana.archetype}\nElemento: ${currentArcana.element} • ${currentArcana.astrologicalSign}\n\n📜 ${t("tarotDailyMessage")}: ${currentArcana.dailyMessage}\n\n🌟 ${t("tarotPracticalAdvice")}: ${currentArcana.practicalAdvice}\n\n🔮 ${t("tarotDailyAffirmation")}: "${currentArcana.dailyAffirmation}"`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <section className="w-full max-w-4xl bg-[#0d0718]/90 border border-purple-800/50 rounded-3xl p-4 sm:p-7 backdrop-blur-xl shadow-2xl relative overflow-hidden my-4 text-purple-100">
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
        </div>
      </div>

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
              className="relative w-64 sm:w-72 h-[410px] sm:h-[430px] cursor-pointer group perspective-1000 transition-transform hover:scale-[1.03] duration-300 select-none"
              title="Toca para revelar el arcano"
            >
              {/* Card Inner Wrapper with 3D Rotate */}
              <div
                className={`w-full h-full rounded-2xl relative transition-all duration-700 transform-style-3d shadow-2xl ${
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
          <div className="flex items-center space-x-3 mt-3.5">
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
          </div>
        </div>

        {/* Right: Rich Esoteric Guidance & Wisdom */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
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

            {/* Copy / Share Button */}
            <button
              onClick={handleCopyMessage}
              className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-purple-950 border border-purple-800 text-purple-300 text-xs font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer ml-auto"
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

            {/* Toggle Arcanario (Gallery of 22 Cards) */}
            <button
              onClick={() => setShowArcanario(!showArcanario)}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-purple-800/60 text-purple-400 hover:text-purple-200 text-xs font-cinzel font-semibold transition flex items-center space-x-1 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showArcanario ? "Ocultar" : t("tarotViewAllArcana")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Arcanario: 22 Major Arcana Deck Grid Explorer */}
      {showArcanario && (
        <div className="mt-6 pt-5 border-t border-purple-900/60 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-cinzel font-bold uppercase tracking-wider text-purple-300 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("tarotAllArcanaTitle")}</span>
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
            {MAJOR_ARCANA.map((card) => {
              const isSelected = currentArcana.id === card.id;
              return (
                <button
                  key={card.id}
                  onClick={() => handleSelectCardFromDeck(card)}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-between h-28 cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? "bg-purple-900/80 border-amber-400 shadow-lg shadow-purple-900/50"
                      : "bg-[#181024] border-purple-900/60 hover:border-purple-600 hover:bg-purple-950/40"
                  }`}
                  style={{
                    borderColor: isSelected ? card.colorHex : undefined,
                  }}
                >
                  <span className="text-[10px] font-cinzel font-bold text-amber-300">
                    {card.romanNumber}
                  </span>
                  <div className="text-[9px] font-cinzel font-bold text-amber-100/90 tracking-tighter truncate max-w-full px-1">
                    {card.marseilleTitle || card.name}
                  </div>
                  <span className="text-base group-hover:scale-110 transition-transform">
                    {card.symbolGlyph.split(" ")[0]}
                  </span>
                  <span className="text-[8px] font-gothic font-medium text-purple-300 line-clamp-1">
                    {card.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
