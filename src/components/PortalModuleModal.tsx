import React, { useEffect } from "react";
import { X, Sparkles, Orbit, Compass, Antenna, Hand, ArrowLeft } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export type PortalPanelId = "TAROT" | "NATAL" | "CABALA" | "ANTENA" | "QUIROLOGIA";

interface PortalModuleModalProps {
  activePanel: PortalPanelId | null;
  onSelectPanel: (panel: PortalPanelId) => void;
  onClose: () => void;
  children: React.ReactNode;
}

const MODAL_TITLES: Record<
  string,
  {
    TAROT: string;
    NATAL: string;
    CABALA: string;
    ANTENA: string;
    QUIROLOGIA: string;
    backToOuija: string;
    close: string;
  }
> = {
  es: {
    TAROT: "Tarot & Arcanos",
    NATAL: "Carta Natal",
    CABALA: "Misión Cábala",
    ANTENA: "Antena Dimensional",
    QUIROLOGIA: "Quirología Mística",
    backToOuija: "Volver a la Tabla Ouija",
    close: "Cerrar panel",
  },
  en: {
    TAROT: "Tarot & Arcana",
    NATAL: "Natal Chart",
    CABALA: "Kabbalah Mission",
    ANTENA: "Dimensional Antenna",
    QUIROLOGIA: "Mystical Palmistry",
    backToOuija: "Back to Ouija Board",
    close: "Close panel",
  },
  pt: {
    TAROT: "Tarot & Arcanos",
    NATAL: "Mapa Natal",
    CABALA: "Missão Cabala",
    ANTENA: "Antena Dimensional",
    QUIROLOGIA: "Quirologia Mística",
    backToOuija: "Voltar ao Tabuleiro Ouija",
    close: "Fechar painel",
  },
  fr: {
    TAROT: "Tarot & Arcanes",
    NATAL: "Thème Natal",
    CABALA: "Mission Kabbale",
    ANTENA: "Antenne Dimensionnelle",
    QUIROLOGIA: "Chiromancie Mystique",
    backToOuija: "Retour à la Planche Ouija",
    close: "Fermer le panneau",
  },
  it: {
    TAROT: "Tarocchi & Arcani",
    NATAL: "Tema Natale",
    CABALA: "Missione Kabbalah",
    ANTENA: "Antenna Dimensionale",
    QUIROLOGIA: "Quirologia Mistica",
    backToOuija: "Torna alla Tavola Ouija",
    close: "Chiudi pannello",
  },
  de: {
    TAROT: "Tarot & Arkana",
    NATAL: "Geburtshoroskop",
    CABALA: "Kabbala-Mission",
    ANTENA: "Dimensionale Antenne",
    QUIROLOGIA: "Mystische Quirologie",
    backToOuija: "Zurück zum Ouija-Brett",
    close: "Panel schließen",
  },
};

export const PortalModuleModal: React.FC<PortalModuleModalProps> = ({
  activePanel,
  onSelectPanel,
  onClose,
  children,
}) => {
  const { language, t } = useLanguage();
  const copy = MODAL_TITLES[language] || MODAL_TITLES.es;

  useEffect(() => {
    if (!activePanel) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePanel, onClose]);

  if (!activePanel) return null;

  const tabs: Array<{
    id: PortalPanelId;
    label: string;
    icon: React.ReactNode;
    activeClass: string;
    inactiveClass: string;
  }> = [
    {
      id: "TAROT",
      label: t("navTarot") || copy.TAROT,
      icon: <Sparkles className="w-3.5 h-3.5 text-violet-300" />,
      activeClass: "bg-violet-900/80 text-white border-violet-400/70 shadow-md",
      inactiveClass: "text-purple-300/80 hover:text-white border-transparent hover:bg-purple-950/60",
    },
    {
      id: "NATAL",
      label: t("navNatal") || copy.NATAL,
      icon: <Orbit className="w-3.5 h-3.5 text-amber-300" />,
      activeClass: "bg-amber-950/85 text-amber-100 border-amber-400/70 shadow-md",
      inactiveClass: "text-amber-200/75 hover:text-amber-100 border-transparent hover:bg-purple-950/60",
    },
    {
      id: "CABALA",
      label: copy.CABALA,
      icon: <Compass className="w-3.5 h-3.5 text-amber-300" />,
      activeClass: "bg-amber-950/85 text-amber-100 border-amber-400/70 shadow-md",
      inactiveClass: "text-amber-200/75 hover:text-amber-100 border-transparent hover:bg-purple-950/60",
    },
    {
      id: "QUIROLOGIA",
      label: copy.QUIROLOGIA,
      icon: <Hand className="w-3.5 h-3.5 text-amber-300" />,
      activeClass: "bg-amber-950/85 text-amber-100 border-amber-400/70 shadow-md",
      inactiveClass: "text-amber-200/75 hover:text-amber-100 border-transparent hover:bg-amber-950/40",
    },
    {
      id: "ANTENA",
      label: copy.ANTENA,
      icon: <Antenna className="w-3.5 h-3.5 text-cyan-300" />,
      activeClass: "bg-cyan-950/85 text-cyan-100 border-cyan-400/70 shadow-md",
      inactiveClass: "text-cyan-200/75 hover:text-cyan-100 border-transparent hover:bg-cyan-950/40",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={copy[activePanel]}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0c0716]/98 border border-amber-500/35 shadow-[0_0_50px_rgba(124,58,237,0.3)] overflow-hidden">
        {/* Sticky Modal Header with Module Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-3 border-b border-purple-900/50 bg-[#120a21]/95 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-cinzel text-purple-200 hover:text-amber-200 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/40 transition cursor-pointer shrink-0"
              title={copy.backToOuija}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{copy.backToOuija}</span>
            </button>

            <div className="flex items-center gap-1">
              {tabs.map((tab) => {
                const isActive = activePanel === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectPanel(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-cinzel font-semibold border transition cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive ? tab.activeClass : tab.inactiveClass
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="p-2 rounded-xl text-purple-300 hover:text-amber-200 hover:bg-purple-900/50 border border-purple-800/40 transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Module Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col items-center">
          {children}
        </div>
      </div>
    </div>
  );
};
