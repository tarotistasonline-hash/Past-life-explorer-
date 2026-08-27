import React, { useState, useEffect, useCallback } from "react";
import { BoardMode, PastLifeDetails, PastLifeRevelation, SpiritResponse, VisitsStats } from "./types";
import { OuijaBoard } from "./components/OuijaBoard";
import { SpiritOracleForm } from "./components/SpiritOracleForm";
import { PastLifeModal } from "./components/PastLifeModal";
import { PastLifeCodex } from "./components/PastLifeCodex";
import { AtmosphereControls } from "./components/AtmosphereControls";
import { WelcomeVoiceModal } from "./components/WelcomeVoiceModal";
import { ShieldAlert, Volume2, Eye, Sparkles } from "lucide-react";
import { audio } from "./lib/audio";

export default function App() {
  const [mode, setMode] = useState<BoardMode>("IDLE");
  const [spelledWord, setSpelledWord] = useState("");
  const [activeChar, setActiveChar] = useState("");
  const [currentPastLife, setCurrentPastLife] = useState<PastLifeDetails | null>(null);
  const [currentSpiritResponse, setCurrentSpiritResponse] = useState<SpiritResponse | null>(null);
  const [seekerName, setSeekerName] = useState("Buscador");
  const [savedRecords, setSavedRecords] = useState<PastLifeRevelation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visitsStats, setVisitsStats] = useState<VisitsStats | null>(null);
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
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Error en la conexión con los Registros Akáshicos");
      }

      const json = await res.json();
      setCurrentPastLife(json.pastLifeDetails);
      setSpelledWord(json.spelledWord || "VIDA PASADA");
      setMode("SPELLING");
      fetchVisitsStats(); // Refresh stats with updated consultation count
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg("No se pudo conectar con los Registros Akáshicos. Por favor reintenta tu consulta.");
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
        body: JSON.stringify({ question, seekerName: name }),
      });

      if (!res.ok) {
        throw new Error("Error en la respuesta del oráculo");
      }

      const json: SpiritResponse = await res.json();
      setCurrentSpiritResponse(json);
      setSpelledWord(json.spelledWord || "SI");
      setMode("SPELLING");
      fetchVisitsStats(); // Refresh stats with updated consultation count
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg("No se pudo canalizar la información de los Registros Akáshicos.");
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
        `Respuesta de los Registros Akáshicos: ${currentSpiritResponse.spelledWord}. ${currentSpiritResponse.spiritMessage}`
      );
    }
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

      {/* Header Bar with Visitor Counter & Solemn Male Voice Controls */}
      <AtmosphereControls
        fogOn={fogOn}
        setFogOn={setFogOn}
        onOpenWelcome={() => setIsWelcomeOpen(true)}
        visitsStats={visitsStats}
      />

      {/* Main Content Area */}
      <main className="w-full max-w-4xl flex flex-col items-center space-y-6 z-20 my-auto">
        {/* Error Alert if any */}
        {errorMsg && (
          <div className="w-full max-w-2xl bg-purple-950/80 border border-purple-700/80 rounded-xl p-3 text-purple-200 text-xs sm:text-sm flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

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
              <span>Mensaje Canalizado de los Registros Akáshicos</span>
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
                      `Respuesta de los Registros Akáshicos: ${currentSpiritResponse.spelledWord}. ${currentSpiritResponse.spiritMessage}`
                    );
                  }
                }}
                className="px-4 py-2 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-600/60 rounded-xl text-xs uppercase font-cinzel font-semibold tracking-wide transition flex items-center space-x-2 cursor-pointer shadow"
              >
                <Volume2 className="w-4 h-4 text-purple-300" />
                <span>Escuchar con Voz Solemne</span>
              </button>

              <button
                onClick={() => {
                  audio.stopSpeech();
                  setMode("IDLE");
                  setCurrentSpiritResponse(null);
                }}
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-purple-300 border border-purple-800/60 rounded-xl text-xs uppercase font-cinzel font-semibold tracking-wide transition cursor-pointer"
              >
                Realizar Otra Consulta
              </button>
            </div>
          </div>
        )}

        {/* Form Inputs (Lectura de Vida Pasada y Consulta Akáshica) */}
        <SpiritOracleForm
          onPastLifeConsult={handlePastLifeConsult}
          onGeneralConsult={handleGeneralConsult}
          isLoading={isLoading}
        />

        {/* Codex of Past Lives Logged */}
        <PastLifeCodex
          records={savedRecords}
          onSelectRecord={(rec) => {
            setCurrentPastLife(rec.pastLifeDetails);
            setSeekerName(rec.seekerName);
            setIsModalOpen(true);
          }}
          onClearCodex={handleClearCodex}
        />
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

      {/* Footer with Real Visitor Counter */}
      <footer className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between py-4 text-[11px] font-gothic text-purple-400/70 z-20 border-t border-purple-900/30 mt-6 gap-2">
        <p>Tabla Ouija Interactiva • Registros Akáshicos y Lectura de Vidas Pasadas</p>
        <div className="flex items-center space-x-2 text-purple-300/80">
          <Eye className="w-3.5 h-3.5 text-purple-400" />
          <span>
            <strong>{visitsStats?.totalVisits !== undefined ? visitsStats.totalVisits.toLocaleString("es-AR") : "1"}</strong> visitas reales registradas
          </span>
        </div>
      </footer>
    </div>
  );
}

