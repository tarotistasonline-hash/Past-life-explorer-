import React, { useState } from "react";
import { getMoonPhase, MoonPhaseInfo } from "../lib/moonPhase";
import { useLanguage } from "../context/LanguageContext";
import { Moon, Sparkles, X, Compass, Info } from "lucide-react";

export const MoonPhaseWidget: React.FC = () => {
  const { language, t } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const moonInfo: MoonPhaseInfo = getMoonPhase(new Date(), language);

  return (
    <>
      {/* Discreet Trigger Button on Header / Bar */}
      <button
        onClick={() => setShowDetails(true)}
        className="px-2.5 py-1 rounded-full bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-200 text-xs font-cinzel transition flex items-center space-x-1.5 cursor-pointer backdrop-blur-md shadow-sm"
        title="Fase Lunar en Tiempo Real e Influencia Astral"
      >
        <span className="text-sm leading-none">{moonInfo.symbol}</span>
        <span className="font-semibold text-indigo-100 hidden sm:inline">{moonInfo.phaseName}</span>
        <span className="text-[10px] text-indigo-300/80 font-mono">({moonInfo.illuminationPct}%)</span>
      </button>

      {/* Moon Phase Modal / Popover */}
      {showDetails && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowDetails(false)}
        >
          <div 
            className="relative w-full max-w-md bg-[#0e0a1a] border border-indigo-500/60 rounded-2xl p-5 text-indigo-100 shadow-[0_0_50px_rgba(99,102,241,0.3)] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Moon Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-600/20 rounded-full filter blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-indigo-900/60 pb-3 relative z-10">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{moonInfo.symbol}</span>
                <div>
                  <h3 className="font-cinzel text-base font-bold text-indigo-100">
                    {moonInfo.phaseName}
                  </h3>
                  <div className="text-[11px] font-gothic text-indigo-300/80">
                    Iluminación: {moonInfo.illuminationPct}% • Edad: {moonInfo.ageDays} días
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1.5 rounded-full bg-indigo-950 text-indigo-300 hover:text-white hover:bg-indigo-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-gothic text-xs sm:text-sm leading-relaxed relative z-10">
              {/* Influence Box */}
              <div className="bg-indigo-950/50 border border-indigo-800/50 p-3.5 rounded-xl">
                <div className="text-[11px] font-cinzel font-semibold text-indigo-300 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Influencia en el Oráculo</span>
                </div>
                <p className="text-indigo-100 font-medium">{moonInfo.mysticInfluence}</p>
              </div>

              {/* Divination Advice */}
              <div className="bg-[#090514]/80 border border-purple-900/50 p-3.5 rounded-xl">
                <div className="text-[11px] font-cinzel font-semibold text-purple-300 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  <span>Guía para tu Consulta</span>
                </div>
                <p className="text-purple-200/90 italic">{moonInfo.astrologicalAdvice}</p>
              </div>
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="w-full py-2 bg-gradient-to-r from-indigo-700 to-purple-600 hover:from-indigo-600 hover:to-purple-500 text-white font-cinzel font-semibold text-xs rounded-xl transition cursor-pointer relative z-10"
            >
              Comprendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
