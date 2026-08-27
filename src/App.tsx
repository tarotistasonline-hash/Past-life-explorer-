import React, { useState, useEffect, useCallback } from "react";
import { BoardMode, PastLifeDetails, PastLifeRevelation, SpiritResponse, VisitsStats } from "./types";
import { OuijaBoard } from "./components/OuijaBoard";
import { SpiritOracleForm } from "./components/SpiritOracleForm";
import { PastLifeModal } from "./components/PastLifeModal";
import { PastLifeCodex } from "./components/PastLifeCodex";
import { AtmosphereControls } from "./components/AtmosphereControls";
import { WelcomeVoiceModal } from "./components/WelcomeVoiceModal";
import { DailyTarotCard } from "./components/DailyTarotCard";
import { MysticCoffeeOffer } from "./components/MysticCoffeeOffer";
import { useLanguage } from "./context/LanguageContext";
import { ShieldAlert, Volume2, Eye, Sparkles, Radio, BookOpen, Layers, Coffee, Globe } from "lucide-react";
import { audio } from "./lib/audio";

export default function App() {
  const { t, language, setLanguage, options } = useLanguage();
  const [activeMainSection, setActiveMainSection] = useState<"ALL" | "OUIJA" | "TAROT" | "CODEX">("ALL");
  const [mode, setMode] = useState<BoardMode>("IDLE");
  const [spelledWord, setSpelledWord] = useState("");
  const [activeChar, setActiveChar] = useState("");
  const [currentPastLife, setCurrentPastLife] = useState<PastLifeDetails | null>(null);
  const [currentSpiritResponse, setCurrentSpiritResponse] = useState<SpiritResponse | null>(null);
  const [seekerName, setSeekerName] = useState("Buscador");
  const [savedRecords, setSavedRecords] = useState<PastLifeRevelation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visitsStats, setVisitsStats] = useState<VisitsStats | null>(null);
  const [prefilledOuijaQuestion, setPrefilledOuijaQuestion] = useState("");
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => {
    return !sessionStorage.getItem("ouija_welcome_dismissed");
  });

  const handleCloseWelcome = () => {
    setIsWelcomeOpen(false);
    sessionStorage.setItem("ouija_welcome_dismissed", "true");
  };
  const [isLoading, setIsLoading] = useState(false);
  const [fogOn, setFogOn] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const locale = language === "en" ? "en-US" : language === "pt" ? "pt-BR" : language === "fr" ? "fr-FR" : language === "it" ? "it-IT" : language === "de" ? "de-DE" : "es-AR";

  // Record visitor count and retrieve real stats
  const fetchVisitsStats = useCallback(async () => {
    try {
      const res = await fetch("/api/visits");
      if (res.ok) {
        const data = await res.json();
        setVisitsStats(data);
      }
    } catch (e) {
      console.warn("Could not fetch visits stats:", e);
    }
  }, []);

  useEffect(() => {
    const registerVisit = async () => {
      try {
        let visitorId = localStorage.getItem("ouija_visitor_id");
        if (!visitorId) {
          visitorId = "vis_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
          localStorage.setItem("ouija_visitor_id", visitorId);
        }

        const isNewSession = !sessionStorage.getItem("ouija_session_logged");
        if (isNewSession) {
          sessionStorage.setItem("ouija_session_logged", "true");
        }

        const res = await fetch("/api/visits/hit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId, isNewSession }),
        });

        if (res.ok) {
          const stats = await res.json();
          setVisitsStats(stats);
        } else {
          fetchVisitsStats();
        }
      } catch (e) {
        console.warn("Error registering visit:", e);
        fetchVisitsStats();
      }
    };

    registerVisit();
  }, [fetchVisitsStats]);

  // Load saved codex records from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ouija_past_lives_codex");
      if (stored) {
        setSavedRecords(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load past life codex", e);
    }
  }, []);

  const handleSaveToCodex = () => {
    if (!currentPastLife) return;
    const newRecord: PastLifeRevelation = {
      id: "life_" + Date.now(),
      timestamp: Date.now(),
      seekerName: seekerName || "Buscador",
      spelledWord: spelledWord,
      pastLifeDetails: currentPastLife,
    };

    const updated = [newRecord, ...savedRecords];
    setSavedRecords(updated);
    try {
      localStorage.setItem("ouija_past_lives_codex", JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save codex", e);
    }
  };

  const handleClearCodex = () => {
    setSavedRecords([]);
    try {
      localStorage.removeItem("ouija_past_lives_codex");
    } catch (e) {
      console.warn("Failed to clear codex", e);
    }
  };

  // Past Life Channeling API call
  const handlePastLifeConsult = async (data: {
    name: string;
    birthYear: string;
    focusQuery: string;
    feeling: string;
  }) => {
    setIsLoading(true);
    setErrorMsg("");
    setSeekerName(data.name || "Buscador");
    setCurrentSpiritResponse(null);

    try {
      const res = await fetch("/api/ouija/past-life", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, lang: language }),
      });

      if (!res.ok) {
        throw new Error("Error en la conexión con los Registros Akáshicos");
      }

      const json = await res.json();
      setCurrentPastLife(json.pastLifeDetails);
      setSpelledWord(json.spelledWord || "VIDA PASADA");
      setMode("SPELLING");
      fetchVisitsStats();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(t("errorAkashicConnection"));
    } finally {
      setIsLoading(false);
    }
  };

  // Free Spirit Oracle API Call
  const handleGeneralConsult = async (question: string, name: string) => {
    setIsLoading(true);
    setErrorMsg("");
    setSeekerName(name);
    setCurrentPastLife(null);

    try {
      const res = await fetch("/api/ouija/spirit-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, seekerName: name, lang: language }),
      });

      if (!res.ok) {
        throw new Error("Error en la respuesta del oráculo");
      }

      const json: SpiritResponse = await res.json();
      setCurrentSpiritResponse(json);
      setSpelledWord(json.spelledWord || "SI");
      setMode("SPELLING");
      fetchVisitsStats();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(t("errorOracleConnection"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpellingComplete = () => {
    setMode("REVEALED");
    if (currentPastLife) {
      setIsModalOpen(true);
    } else if (currentSpiritResponse) {
      audio.speakSpiritText(
        `${currentSpiritResponse.spelledWord}. ${currentSpiritResponse.spiritMessage}`,
        undefined,
        undefined,
        language
      );
    }
  };

  const handleSendCardToOuija = (cardName: string) => {
    setActiveMainSection("OUIJA");
    setPrefilledOuijaQuestion(`${t("askCardMessage")} ${cardName}?`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isCurrentSaved = savedRecords.some(
    (r) => r.pastLifeDetails.title === currentPastLife?.title
  );

  return (
    <div className="min-h-screen bg-[#07040d] text-purple-100 flex flex-col items-center justify-between p-3 sm:p-6 relative overflow-x-hidden selection:bg-purple-600 selection:text-white font-gothic">
      {/* Mystical Cosmic Glow Particle Effect Layer */}
      {fogOn && (
        <div className="fixed inset-0 pointer-events-none z-10 opacity-30 mix-blend-screen bg-[radial-gradient(circle_at_50%_40%,rgba(139,92,246,0.2),transparent_70%)] animate-pulse" />
      )}

      {/* Prominent Global Multi-language Switcher Bar */}
      <aside aria-label={t("languageSelect")} className="w-full max-w-4xl flex items-center justify-between gap-2 px-3 py-2 mb-2.5 bg-[#100922]/95 border border-purple-500/50 rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(168,85,247,0.25)] z-30 overflow-hidden">
        <div className="flex items-center space-x-2 text-xs font-cinzel font-bold text-purple-200 shrink-0">
          <Globe className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="hidden sm:inline tracking-wider uppercase">{t("languageSelect")}:</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          {options.map((opt) => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => setLanguage(opt.code)}
                title={`${opt.nativeName} (${opt.label})`}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-cinzel transition flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-purple-700 text-white font-bold border border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.6)] scale-105"
                    : "bg-purple-950/60 hover:bg-purple-900/80 text-purple-300/90 hover:text-white border border-purple-900/60"
                }`}
              >
                <span className="text-sm leading-none">{opt.flag}</span>
                <span className="font-semibold text-xs">{opt.nativeName}</span>
                <span className="text-[10px] opacity-70 uppercase hidden md:inline">({opt.code})</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Header Bar with Visitor Counter & Solemn Male Voice Controls */}
      <AtmosphereControls
        fogOn={fogOn}
        setFogOn={setFogOn}
        onOpenWelcome={() => setIsWelcomeOpen(true)}
        visitsStats={visitsStats}
      />

      {/* Portal Main Navigation Switcher */}
      <nav aria-label="Navegación del Portal Místico" className="w-full max-w-4xl flex items-center justify-center gap-1 sm:gap-2 mb-3 z-20 overflow-x-auto py-1 px-2 bg-black/40 border border-purple-900/40 rounded-2xl backdrop-blur-md">
        <button
          onClick={() => setActiveMainSection("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeMainSection === "ALL"
              ? "bg-purple-900/80 text-purple-100 border border-purple-500/60 shadow-md"
              : "text-purple-400 hover:text-purple-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t("navAll")}</span>
        </button>

        <button
          onClick={() => setActiveMainSection("OUIJA")}
          className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeMainSection === "OUIJA"
              ? "bg-purple-900/80 text-purple-100 border border-purple-500/60 shadow-md"
              : "text-purple-400 hover:text-purple-200"
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-purple-400" />
          <span>{t("navOuija")}</span>
        </button>

        <button
          onClick={() => setActiveMainSection("TAROT")}
          className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeMainSection === "TAROT"
              ? "bg-gradient-to-r from-amber-600/60 to-purple-800/80 text-amber-200 border border-amber-500/60 shadow-md"
              : "text-amber-400/80 hover:text-amber-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t("navTarot")}</span>
        </button>

        <button
          onClick={() => setActiveMainSection("CODEX")}
          className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeMainSection === "CODEX"
              ? "bg-purple-900/80 text-purple-100 border border-purple-500/60 shadow-md"
              : "text-purple-400 hover:text-purple-200"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          <span>{t("navCodex")} ({savedRecords.length})</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl flex flex-col items-center space-y-6 z-20 my-auto">
        {/* Error Alert if any */}
        {errorMsg && (
          <div className="w-full max-w-2xl bg-purple-950/80 border border-purple-700/80 rounded-xl p-3 text-purple-200 text-xs sm:text-sm flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section: Ouija Board & Oracle (Shown if ALL or OUIJA) */}
        {(activeMainSection === "ALL" || activeMainSection === "OUIJA") && (
          <div className="w-full flex flex-col items-center space-y-6 animate-fade-in">
            {/* Physical Ouija Board Component */}
            <OuijaBoard
              mode={mode}
              spelledWord={spelledWord}
              onSpellingComplete={handleSpellingComplete}
              activeChar={activeChar}
              setActiveChar={setActiveChar}
            />

            {/* General Spirit Message Card (If Spirit Query) */}
            {currentSpiritResponse && mode === "REVEALED" && (
              <div className="w-full max-w-2xl bg-[#0f0918]/95 border border-purple-500/50 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-2xl text-center space-y-3 animate-fade-in">
                <div className="text-xs uppercase tracking-[0.2em] text-purple-300 font-cinzel font-semibold">
                  <span>{t("channeledMessageTitle")}</span>
                </div>

                <div className="text-xl sm:text-2xl font-bold text-purple-100 py-1 font-cinzel">
                  "{currentSpiritResponse.spelledWord}"
                </div>

                <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed italic font-gothic">
                  {currentSpiritResponse.spiritMessage}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (currentSpiritResponse) {
                        audio.speakSpiritText(
                          `${currentSpiritResponse.spelledWord}. ${currentSpiritResponse.spiritMessage}`
                        );
                      }
                    }}
                    className="px-4 py-2 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-600/60 rounded-xl text-xs uppercase font-cinzel font-semibold tracking-wide transition flex items-center space-x-2 cursor-pointer shadow"
                  >
                    <Volume2 className="w-4 h-4 text-purple-300" />
                    <span>{t("listenSolemnVoice")}</span>
                  </button>

                  <button
                    onClick={() => {
                      audio.stopSpeech();
                      setMode("IDLE");
                      setCurrentSpiritResponse(null);
                    }}
                    className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-purple-300 border border-purple-800/60 rounded-xl text-xs uppercase font-cinzel font-semibold tracking-wide transition cursor-pointer"
                  >
                    {t("makeAnotherConsultation")}
                  </button>
                </div>
              </div>
            )}

            {/* Form Inputs (Lectura de Vida Pasada y Consulta Akáshica) */}
            <SpiritOracleForm
              onPastLifeConsult={handlePastLifeConsult}
              onGeneralConsult={handleGeneralConsult}
              isLoading={isLoading}
              externalPreFillQuery={prefilledOuijaQuestion}
            />
          </div>
        )}

        {/* Section: Daily Tarot Card / Arcano del Día (Shown if ALL or TAROT) */}
        {(activeMainSection === "ALL" || activeMainSection === "TAROT") && (
          <DailyTarotCard onSendToOuija={handleSendCardToOuija} />
        )}

        {/* Section: Codex of Past Lives Logged (Shown if ALL or CODEX) */}
        {(activeMainSection === "ALL" || activeMainSection === "CODEX") && (
          <PastLifeCodex
            records={savedRecords}
            onSelectRecord={(rec) => {
              setCurrentPastLife(rec.pastLifeDetails);
              setSeekerName(rec.seekerName);
              setIsModalOpen(true);
            }}
            onClearCodex={handleClearCodex}
          />
        )}
      </main>

      {/* Past Life Revelation Modal */}
      {isModalOpen && currentPastLife && (
        <PastLifeModal
          details={currentPastLife}
          seekerName={seekerName}
          onClose={() => {
            setIsModalOpen(false);
            setMode("IDLE");
          }}
          onSaveToCodex={handleSaveToCodex}
          isSaved={isCurrentSaved}
        />
      )}

      {/* Spoken Welcome Voice Modal */}
      <WelcomeVoiceModal
        isOpen={isWelcomeOpen}
        onClose={handleCloseWelcome}
      />

      {/* Section: Mystic Coffee Offering / Invitación a Cafecito */}
      <MysticCoffeeOffer />

      {/* Footer with Real Visitor Counter */}
      <footer className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between py-4 text-[11px] font-gothic text-purple-400/70 z-20 border-t border-purple-900/30 mt-4 gap-3">
        <div className="flex items-center space-x-3">
          <p>{t("footerTitle")}</p>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href="https://mpago.la/2m7bcUT"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 transition"
            title="Invitar un Cafecito por Mercado Pago"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span>{t("footerCoffeeLink")}</span>
          </a>

          <div className="flex items-center space-x-1.5 text-purple-300/80">
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>
              <strong>{visitsStats?.totalVisits !== undefined ? visitsStats.totalVisits.toLocaleString(locale) : "1"}</strong> {t("realVisits")}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
