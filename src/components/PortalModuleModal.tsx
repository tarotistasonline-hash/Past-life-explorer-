import React, { useEffect } from "react";
import { Sparkles, Orbit, Compass, Antenna, X, ArrowLeft } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { SupportedLanguage } from "../types";
import { audio } from "../lib/audio";

export type PortalPanelId = "TAROT" | "NATAL" | "CABALA" | "ANTENA";

interface PortalModuleModalProps {
  activePanel: PortalPanelId | null;
  onSelectPanel: (panel: PortalPanelId) => void;
  onClose: () => void;
  children: React.ReactNode;
}

const PANEL_LABELS: Record<
  SupportedLanguage,
  {
    cabala: string;
    antena: string;
    backToBoard: string;
    closeAria: string;
  }
> = {
  es: {
    cabala: "Misión Cábala",
    antena: "Antena Dimensional",
    backToBoard: "Volver a Tabla Ouija",
    closeAria: "Cerrar panel",
  },
  en: {
    cabala: "Kabbalah Mission",
    antena: "Dimensional Antenna",
    backToBoard: "Back to Ouija Board",
    closeAria: "Close panel",
  },
  pt: {
    cabala: "Missão Cabala",
    antena: "Antena Dimensional",
    backToBoard: "Voltar à Tábua Ouija",
    closeAria: "Fechar painel",
  },
  fr: {
    cabala: "Mission Kabbale",
    antena: "Antenne Dimensionnelle",
    backToBoard: "Retour au Ouija",
    closeAria: "Fermer le panneau",
  },
  it: {
    cabala: "Missione Kabbalah",
    antena: "Antenna Dimensionale",
    backToBoard: "Torna alla Tavola Ouija",
    closeAria: "Chiudi pannello",
  },
  de: {
    cabala: "Kabbala-Mission",
    antena: "Dimensionale Antenne",
    backToBoard: "Zurück zum Ouija",
    closeAria: "Panel schließen",
  },
};

export const PortalModuleModal: React.FC<PortalModuleModalProps> = ({
  activePanel,
  onSelectPanel,
  onClose,
  children,
}) => {
  const { t, language } = useLanguage();
  const labels = PANEL_LABELS[language] || PANEL_LABELS.es;

  useEffect(() => {
    if (!activePanel) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        audio.stopSpeech();
        audio.stopTarotNarration();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePanel, onClose]);

  if (!activePanel) return null;

  const handleClose = () => {
    audio.stopSpeech();
    audio.stopTarotNarration();
    onClose();
  };

  const handleSwitch = (nextPanel: PortalPanelId) => {
    if (nextPanel === activePanel) return;
    audio.stopSpeech();
    audio.stopTarotNarration();
    onSelectPanel(nextPanel);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md overflow-y-auto p-3 sm:p-6 flex flex-col items-center animate-fade-in"
      onClick={handleClose}
    >
      {/* Sticky Top Panel Switcher Bar */}
      <div
        className="sticky top-0 z-20 w-full max-w-4xl mb-4 flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-[#110821]/95 border border-purple-500/45 shadow-[0_8px_32px_rgba(0,0,0,0.65)] backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => handleSwitch("TAROT")}
            className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-cinzel font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activePanel === "TAROT"
                ? "bg-gradient-to-r from-violet-600 to-purple-700 text-white border border-violet-300/60 shadow-md"
                : "text-violet-300 hover:text-white hover:bg-purple-950/70 border border-transparent"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-200" />
            <span>{t("navTarot")}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitch("NATAL")}
            className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-cinzel font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activePanel === "NATAL"
                ? "bg-purple-900/90 text-amber-100 border border-amber-400/65 shadow-md"
                : "text-amber-200/85 hover:text-amber-100 hover:bg-purple-950/70 border border-transparent"
            }`}
          >
            <Orbit className="w-3.5 h-3.5 text-amber-300" />
            <span>{t("navNatal")}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitch("CABALA")}
            className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-cinzel font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activePanel === "CABALA"
                ? "bg-amber-950/90 text-amber-100 border border-amber-400/75 shadow-md"
                : "text-amber-200/85 hover:text-amber-100 hover:bg-amber-950/40 border border-transparent"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>{labels.cabala}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitch("ANTENA")}
            className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-cinzel font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activePanel === "ANTENA"
                ? "bg-cyan-950/90 text-cyan-100 border border-cyan-400/75 shadow-md"
                : "text-cyan-300/90 hover:text-cyan-100 hover:bg-cyan-950/40 border border-transparent"
            }`}
          >
            <Antenna className="w-3.5 h-3.5 text-cyan-300" />
            <span>{labels.antena}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[40px] px-3 py-2 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-purple-700/60 text-purple-200 hover:text-white text-xs font-cinzel font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{labels.backToBoard}</span>
            <X className="w-3.5 h-3.5 sm:hidden" />
          </button>
          <button
            type="button"
            onClick={handleClose}
            aria-label={labels.closeAria}
            className="hidden sm:flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-300 hover:text-white transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Module Panel Content */}
      <div
        className="w-full max-w-4xl pb-8 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
