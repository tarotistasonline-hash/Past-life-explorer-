import React, { useState, useEffect, useRef } from "react";
import { LetterCoord, BoardMode } from "../types";
import { BOARD_COORDS, getCoordForChar } from "../lib/constants";
import { audio } from "../lib/audio";
import { useLanguage } from "../context/LanguageContext";
import { Sparkles, Compass, Volume2, Eye } from "lucide-react";

interface OuijaBoardProps {
  mode: BoardMode;
  spelledWord: string;
  onSpellingComplete?: () => void;
  activeChar: string;
  setActiveChar: (char: string) => void;
}

export const OuijaBoard: React.FC<OuijaBoardProps> = ({
  mode,
  spelledWord,
  onSpellingComplete,
  activeChar,
  setActiveChar,
}) => {
  const { t } = useLanguage();
  const boardRef = useRef<HTMLDivElement>(null);
  const [planchettePos, setPlanchettePos] = useState<{ x: number; y: number }>({ x: 50, y: 56 });
  const [isSpelling, setIsSpelling] = useState(false);
  const [spelledCharsSoFar, setSpelledCharsSoFar] = useState<string[]>([]);

  // Handle automated spelling when spelledWord changes and mode is SPELLING
  useEffect(() => {
    if (mode === "SPELLING" && spelledWord && !isSpelling) {
      startSpellingSequence(spelledWord);
    } else if (mode === "IDLE") {
      setPlanchettePos({ x: 50, y: 56 });
      setActiveChar("");
      setSpelledCharsSoFar([]);
    }
  }, [mode, spelledWord]);

  const startSpellingSequence = async (word: string) => {
    setIsSpelling(true);
    setSpelledCharsSoFar([]);
    
    // Initial home pos
    setPlanchettePos({ x: 50, y: 56 });
    setActiveChar("•");
    await new Promise((r) => setTimeout(r, 600));

    const chars = word.trim().split("");
    const history: string[] = [];

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const coord = getCoordForChar(char);

      // Move planchette to coordinate
      setPlanchettePos({ x: coord.x, y: coord.y });
      setActiveChar(coord.char);
      audio.playWoodSlide();

      if (char !== " ") {
        history.push(char);
        setSpelledCharsSoFar([...history]);
        audio.playChime(520 + Math.random() * 200);
      }

      // Dwell time on letter
      await new Promise((r) => setTimeout(r, 900));
    }

    // Move to Goodbye or Home at the end
    await new Promise((r) => setTimeout(r, 400));
    const finalCoord = BOARD_COORDS["ADIOS"];
    setPlanchettePos({ x: finalCoord.x, y: finalCoord.y });
    setActiveChar(finalCoord.char);
    audio.playChime(432);
    audio.playMysticSwell();

    await new Promise((r) => setTimeout(r, 800));
    setIsSpelling(false);

    if (onSpellingComplete) {
      onSpellingComplete();
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Live Spelled Transcript Status Bar */}
      <div className="w-full max-w-2xl mb-3 px-4 py-2 bg-neutral-900/90 border border-amber-900/60 rounded-xl backdrop-blur-md flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-2 text-amber-300/80 text-xs sm:text-sm font-serif">
          <Eye className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{t("channeledSymbols")}</span>
        </div>
        <div className="flex items-center space-x-1 font-mono tracking-widest text-amber-200 text-sm sm:text-base font-bold min-h-[24px]">
          {spelledCharsSoFar.length > 0 ? (
            spelledCharsSoFar.map((c, i) => (
              <span key={i} className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-fade-in">
                {c}
              </span>
            ))
          ) : (
            <span className="text-neutral-500 italic text-xs font-serif">
              {isSpelling ? t("invokingSpirits") : t("makeYourConsultation")}
            </span>
          )}
        </div>
        <div className="text-xs text-amber-400/60 font-serif hidden sm:block">
          {activeChar ? `[ ${activeChar} ]` : ""}
        </div>
      </div>

      {/* Main Victorian Ouija Board Canvas Container */}
      <div
        ref={boardRef}
        className="relative w-full max-w-4xl aspect-[16/10] bg-[#1a0f0a] rounded-2xl p-2 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-4 border-[#3d2314] overflow-hidden"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #2b1810 0%, #170d08 70%, #0d0603 100%)`,
        }}
      >
        {/* Intricate Wood Texture Overlay & Filigree Borders */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Brass Filigree Corners */}
        <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-amber-600/60 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-amber-600/60 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-amber-600/60 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-amber-600/60 rounded-br-xl pointer-events-none" />

        {/* Board Top Center Emblem: Eye of Providence & Mystic Sun/Moon */}
        <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 flex items-center space-x-6 text-amber-500/80 pointer-events-none">
          <div className="text-center font-cinzel text-[10px] sm:text-xs tracking-widest text-amber-600 font-bold uppercase">
            ☽ {t("moon")}
          </div>
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 border border-amber-600/50 rounded-full bg-amber-950/40 shadow-[0_0_15px_rgba(217,119,6,0.3)]">
            <Compass className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400 animate-spin" style={{ animationDuration: "25s" }} />
          </div>
          <div className="text-center font-cinzel text-[10px] sm:text-xs tracking-widest text-amber-600 font-bold uppercase">
            {t("sun")} ☼
          </div>
        </div>

        {/* YES (SÍ) & NO Emblems */}
        <div className="absolute top-[14%] left-[18%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className={`font-cinzel text-lg sm:text-2xl font-black tracking-wider ${activeChar === "SÍ" ? "text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,1)] scale-110" : "text-amber-600/90"} transition-all duration-300`}>
            {t("yes")}
          </div>
          <div className="text-[9px] sm:text-xs text-amber-800/80 font-cinzel">YES</div>
        </div>

        <div className="absolute top-[14%] right-[18%] translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className={`font-cinzel text-lg sm:text-2xl font-black tracking-wider ${activeChar === "NO" ? "text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,1)] scale-110" : "text-amber-600/90"} transition-all duration-300`}>
            {t("no")}
          </div>
          <div className="text-[9px] sm:text-xs text-amber-800/80 font-cinzel">NO</div>
        </div>

        {/* Render Alphabet & Numbers Grid on Board */}
        {Object.entries(BOARD_COORDS).map(([key, coord]) => {
          if (["SI", "YES", "NO", "ADIOS", "GOODBYE", "HOME"].includes(key)) return null;
          const isActive = activeChar === coord.char;

          return (
            <div
              key={key}
              className={`absolute -translate-x-1/2 -translate-y-1/2 font-cinzel font-black text-base sm:text-2xl transition-all duration-200 pointer-events-none ${
                isActive
                  ? "text-amber-300 scale-125 font-black drop-shadow-[0_0_16px_rgba(245,158,11,1)] z-20"
                  : "text-amber-600/90 hover:text-amber-400"
              }`}
              style={{
                left: `${coord.x}%`,
                top: `${coord.y}%`,
              }}
            >
              {coord.char}
            </div>
          );
        })}

        {/* ADIÓS (GOODBYE) Emblem */}
        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <div className={`font-cinzel text-base sm:text-xl font-black tracking-[0.25em] ${activeChar === "ADIÓS" ? "text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,1)] scale-110" : "text-amber-700/80"} transition-all duration-300`}>
            {t("goodbye")}
          </div>
          <div className="text-[8px] sm:text-[10px] text-amber-900 font-cinzel tracking-widest">GOODBYE</div>
        </div>

        {/* Physical Planchette (La Plancheta / Gota) */}
        <div
          className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all ${
            isSpelling ? "duration-700 ease-in-out" : "duration-300 ease-out"
          }`}
          style={{
            left: `${planchettePos.x}%`,
            top: `${planchettePos.y}%`,
          }}
        >
          {/* Planchette Body Shape (Victorian Teardrop Wood) */}
          <div className="relative w-20 h-28 sm:w-28 sm:h-36 flex flex-col items-center justify-center filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.95)]">
            {/* Wooden Grain Outer Body */}
            <svg
              viewBox="0 0 100 130"
              className="w-full h-full text-amber-950 fill-current stroke-amber-700 stroke-[2] drop-shadow-md"
            >
              <path d="M 50 5 Q 95 60 85 110 Q 50 128 15 110 Q 5 60 50 5 Z" />
            </svg>

            {/* Inner Brass Rim & Ornate Filigree */}
            <div className="absolute top-3 w-16 h-22 sm:w-22 sm:h-28 border border-amber-600/70 rounded-t-full rounded-b-xl pointer-events-none flex items-center justify-center">
              {/* Glass Eyepiece Window */}
              <div className="relative w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-amber-500 bg-amber-200/10 backdrop-blur-[1px] shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] flex items-center justify-center">
                {/* Glowing Center Glass Lens Sight Ring */}
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-amber-300 bg-amber-400/40 animate-ping opacity-75" />
                <div className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(253,224,71,1)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
