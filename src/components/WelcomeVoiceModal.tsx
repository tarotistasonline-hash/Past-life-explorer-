import React, { useState, useEffect, useCallback } from "react";
import { X, Ghost, Volume2 } from "lucide-react";
import { audio } from "../lib/audio";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";
import { useLanguage } from "../context/LanguageContext";
import akashicCoverImg from "../assets/images/akashic_portal_violet_1785780487126.jpg";
import pastLifeSoulImg from "../assets/images/past_life_soul_1785774959422.jpg";
import planchetteSealImg from "../assets/images/planchette_seal_1785715428714.jpg";
import akashicCodexImg from "../assets/images/akashic_tome_violet_1785780498883.jpg";

interface WelcomeVoiceModalProps {
  isOpen: boolean;
  onClose: (keepPlayingSpeech?: boolean) => void;
}

export const WelcomeVoiceModal: React.FC<WelcomeVoiceModalProps> = ({ isOpen, onClose }) => {
  const { t, language, setLanguage, options } = useLanguage();
  const [isPlayingWelcome, setIsPlayingWelcome] = useState(false);

  const welcomeSpeech = t("welcomeVoiceText");

  const handleClose = useCallback((e?: React.MouseEvent, keepPlayingSpeech: boolean = false) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!keepPlayingSpeech) {
      try {
        audio.stopSpeech();
      } catch (err) {
        console.warn("Error stopping speech", err);
      }
      setIsPlayingWelcome(false);
    }
    onClose(keepPlayingSpeech);
  }, [onClose]);

  const triggerSpontaneousSpeech = useCallback(() => {
    try {
      audio.speakSpiritText(
        welcomeSpeech,
        () => setIsPlayingWelcome(true),
        () => setIsPlayingWelcome(false),
        language
      );
    } catch (e) {
      console.warn("Spontaneous speech error:", e);
    }
  }, [welcomeSpeech, language]);

  const toggleSpeech = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    triggerHaptic(HAPTIC_PATTERNS.click);
    if (isPlayingWelcome) {
      audio.stopSpeech();
      setIsPlayingWelcome(false);
    } else {
      triggerSpontaneousSpeech();
    }
  }, [isPlayingWelcome, triggerSpontaneousSpeech]);

  // Handle Escape key to exit modal anytime
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose(undefined, false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Auto-play attempt on open with browser autoplay fallback
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        triggerSpontaneousSpeech();
      }, 200);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isOpen, triggerSpontaneousSpeech]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => handleClose(e, false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto cursor-pointer"
    >
      {/* Cosmic Aura Glow */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-50 filter blur-3xl animate-pulse"
        style={{
          background: "radial-gradient(circle at 50% 30%, #a855f7 0%, #3b82f6 40%, transparent 75%)",
          animationDuration: "8s",
        }}
      />

      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#0e0a18] border border-purple-500/30 rounded-3xl p-0 text-purple-100 shadow-[0_0_90px_rgba(168,85,247,0.3)] cursor-default my-auto transition-all duration-500"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, #1e1132 0%, #090510 100%)`,
        }}
      >
        {/* Language Switcher in Welcome Modal */}
        <div className="absolute top-3.5 left-3.5 z-20 flex items-center bg-black/80 border border-purple-500/50 rounded-2xl p-1 backdrop-blur-md shadow-2xl">
          {options.map((opt) => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => setLanguage(opt.code)}
                title={`${opt.nativeName} (${opt.label})`}
                className={`px-2 py-1 rounded-xl text-xs font-cinzel transition flex items-center space-x-1 cursor-pointer ${
                  isSelected
                    ? "bg-purple-800 text-white font-bold border border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)] scale-105"
                    : "text-purple-300/80 hover:text-purple-100 hover:bg-purple-950/60"
                }`}
              >
                <span className="text-sm leading-none">{opt.flag}</span>
                <span className="text-[11px] uppercase font-bold">{opt.code}</span>
              </button>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => handleClose(e, false)}
          aria-label="Cerrar ventana"
          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-black/75 hover:bg-purple-950 text-purple-300 hover:text-purple-100 border border-purple-500/40 transition cursor-pointer z-20 backdrop-blur-md shadow-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Artwork Banner */}
        <div className="relative w-full h-60 sm:h-64 overflow-hidden border-b border-purple-500/30">
          <img
            src={akashicCoverImg}
            alt="Registros Akáshicos y Vidas Pasadas"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-105 contrast-110 animate-kenburns origin-center pointer-events-none"
          />
          
          {/* Subtle Mystical Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a18] via-transparent to-black/40" />

          {/* Central Pulsing Seal Emblem - Interactive Mystical Seal */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center animate-float-slow">
            <button
              type="button"
              onClick={toggleSpeech}
              aria-label="Sello Akáshico"
              className="relative cursor-pointer group focus:outline-none"
            >
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 p-1 bg-neutral-950/90 backdrop-blur-md overflow-hidden flex items-center justify-center transition-all duration-300 ${
                isPlayingWelcome 
                  ? "border-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.85)] scale-105" 
                  : "border-purple-600/70 shadow-[0_0_25px_rgba(168,85,247,0.5)] group-hover:border-purple-400 group-hover:scale-105"
              }`}>
                <img
                  src={planchetteSealImg}
                  alt="Sello Akáshico"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full animate-spin-slow"
                  style={{ animationDuration: isPlayingWelcome ? "15s" : "30s" }}
                />
              </div>
              {isPlayingWelcome ? (
                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-purple-500 items-center justify-center text-white text-[10px]">
                    <Volume2 className="w-3 h-3 animate-pulse" />
                  </span>
                </span>
              ) : (
                <span className="absolute -bottom-1 right-0 p-1 rounded-full bg-purple-950 border border-purple-500/70 text-purple-300 shadow group-hover:text-purple-100">
                  <Ghost className="w-3.5 h-3.5 animate-pulse" />
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="px-5 pb-6 pt-7 space-y-4">
          {/* Main Title & Subtitle */}
          <div className="flex flex-col items-center text-center space-y-1.5">
            <h2 className="font-decorative font-bold text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-purple-200 to-indigo-200 tracking-wide drop-shadow-md">
              {t("welcomeModalTitle")}
            </h2>
            <p className="text-xs sm:text-sm font-gothic text-purple-200/90 font-normal tracking-wide max-w-md leading-relaxed">
              {t("welcomeModalSubtitle")}
            </p>
          </div>

          {/* Voice Indicator Badge */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={toggleSpeech}
              className={`px-3 py-1.5 rounded-full border text-xs font-gothic flex items-center space-x-2 transition cursor-pointer ${
                isPlayingWelcome
                  ? "bg-purple-900/60 border-purple-400 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse"
                  : "bg-black/60 border-purple-800/60 text-purple-300 hover:text-purple-100 hover:border-purple-500"
              }`}
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingWelcome ? "text-purple-300 animate-spin-slow" : "text-purple-400"}`} />
              <span>
                {isPlayingWelcome ? "Relatando: Voz de Ultratumba (Fenrir)" : "Tocar para escuchar el relato de bienvenida"}
              </span>
            </button>
          </div>

          {/* Rich Visual Feature Grid - Real Image Cards */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="relative group overflow-hidden rounded-2xl border border-purple-500/30 bg-neutral-950/80 p-2.5 transition duration-300 hover:border-purple-400/80 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] flex flex-col items-center text-center space-y-2">
              <div className="w-full h-20 rounded-xl overflow-hidden relative">
                <img 
                  src={pastLifeSoulImg} 
                  alt="Viaje del Alma" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              <span className="text-xs font-medium text-purple-200 tracking-wide font-gothic">
                {t("welcomeCard1")}
              </span>
            </div>

            <div className="relative group overflow-hidden rounded-2xl border border-purple-500/30 bg-neutral-950/80 p-2.5 transition duration-300 hover:border-purple-400/80 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] flex flex-col items-center text-center space-y-2">
              <div className="w-full h-20 rounded-xl overflow-hidden relative">
                <img 
                  src={akashicCodexImg} 
                  alt="Codex de Vidas" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              <span className="text-xs font-medium text-purple-200 tracking-wide font-gothic">
                {t("welcomeCard2")}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={(e) => {
                // If not speaking yet, start speaking on this click gesture
                if (!isPlayingWelcome) {
                  triggerSpontaneousSpeech();
                }
                handleClose(e, true);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 text-white font-cinzel font-bold uppercase text-xs sm:text-sm tracking-wider rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.4)] border border-purple-400/30 transition cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
            >
              <Volume2 className="w-4 h-4 text-purple-200" />
              <span>Entrar al Portal y Escuchar Relato</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleClose(e, false)}
              className="w-full py-1.5 text-xs font-gothic text-purple-300/70 hover:text-purple-200 transition cursor-pointer text-center"
            >
              Entrar en silencio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
