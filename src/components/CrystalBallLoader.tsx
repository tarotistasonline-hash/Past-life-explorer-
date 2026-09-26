import React from "react";
import { Sparkles } from "lucide-react";

interface CrystalBallLoaderProps {
  /**
   * 'banner' / 'full': Large atmospheric glowing crystal ball with base, aura, and description
   * 'inline': Miniature glowing orb with flickering core, perfect for buttons
   */
  variant?: "full" | "banner" | "inline";
  text?: string;
  subtext?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const CrystalBallLoader: React.FC<CrystalBallLoaderProps> = ({
  variant = "full",
  text = "El oráculo contempla la bola de cristal...",
  subtext = "Canalizando las visiones del alma en el éter...",
  size = "md",
  className = "",
}) => {
  if (variant === "inline") {
    return (
      <span className={`inline-flex items-center justify-center relative select-none ${className}`}>
        {/* Outer glowing aura */}
        <span className="absolute -inset-1 rounded-full bg-purple-500/40 blur-xs animate-crystal-flicker-fast" />

        {/* Miniature Orb */}
        <span className="relative w-5 h-5 rounded-full overflow-hidden border border-purple-300/80 shadow-[0_0_12px_rgba(168,85,247,0.8),inset_0_0_8px_rgba(236,72,153,0.5)] bg-gradient-to-br from-[#2a104e] via-[#0f0728] to-[#1e1b4b] flex items-center justify-center animate-crystal-flicker">
          {/* Swirling mist inside */}
          <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(216,180,254,0.7)_0%,rgba(147,51,234,0.4)_50%,transparent_80%)] animate-crystal-mist" />

          {/* Internal core spark */}
          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#fff] animate-ping" />

          {/* Specular glass reflection */}
          <span className="absolute top-0.5 left-0.5 w-2 h-1 rounded-full bg-white/70 -rotate-45 blur-[0.4px]" />
          <span className="absolute bottom-0.5 right-0.5 w-1 h-0.5 rounded-full bg-pink-400/60 blur-[0.3px]" />
        </span>
      </span>
    );
  }

  // Full / Banner Atmospheric Display
  const orbSizes = {
    sm: "w-20 h-20",
    md: "w-28 h-28 sm:w-32 sm:h-32",
    lg: "w-36 h-36 sm:w-44 sm:h-44",
  };

  return (
    <div
      className={`w-full flex flex-col items-center justify-center py-6 px-4 select-none animate-fade-in ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Outer Floating Glow Stage */}
      <div className="relative flex flex-col items-center justify-center animate-float-slow">
        {/* Pulsing Ethereal Atmospheric Aura Background */}
        <div className="absolute w-44 h-44 sm:w-56 sm:h-56 -top-6 rounded-full bg-gradient-to-r from-purple-600/30 via-fuchsia-500/20 to-indigo-600/30 blur-2xl animate-crystal-aura pointer-events-none" />

        {/* Celestial Zodiac / Runes Rotating Ring */}
        <div className="absolute w-36 h-36 sm:w-44 sm:h-44 -top-2 rounded-full border border-dashed border-purple-400/30 animate-crystal-ring pointer-events-none opacity-70 flex items-center justify-center">
          <div className="absolute -top-1 w-1.5 h-1.5 bg-amber-300 rounded-full shadow-[0_0_6px_#fde047]" />
          <div className="absolute -bottom-1 w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_6px_#67e8f9]" />
          <div className="absolute -left-1 w-1.5 h-1.5 bg-purple-300 rounded-full shadow-[0_0_6px_#d8b4fe]" />
          <div className="absolute -right-1 w-1.5 h-1.5 bg-pink-300 rounded-full shadow-[0_0_6px_#f472b6]" />
        </div>

        {/* Counter-Rotating Celestial Dust Ring */}
        <div className="absolute w-40 h-40 sm:w-48 sm:h-48 -top-4 rounded-full border border-dotted border-indigo-400/20 animate-crystal-mist-reverse pointer-events-none opacity-60" />

        {/* The Crystal Ball Sphere */}
        <div
          className={`relative ${orbSizes[size]} rounded-full overflow-hidden cursor-default shadow-[0_0_40px_rgba(168,85,247,0.7),inset_0_0_30px_rgba(192,132,252,0.6),inset_0_-15px_30px_rgba(236,72,153,0.5)] border-2 border-purple-300/60 bg-gradient-to-br from-[#180a30] via-[#09031a] to-[#120826] animate-crystal-flicker z-10`}
        >
          {/* Internal Swirling Nebular Fog Layer 1 (Violet / Cyan) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(192,132,252,0.85)_0%,rgba(99,102,241,0.5)_40%,transparent_75%)] animate-crystal-mist mix-blend-screen" />

          {/* Internal Swirling Nebular Fog Layer 2 (Fuchsia / Gold) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_65%,rgba(244,114,182,0.7)_0%,rgba(168,85,247,0.45)_45%,transparent_80%)] animate-crystal-mist-reverse mix-blend-screen" />

          {/* Core Occult Energy Nucleus */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-purple-200 via-pink-100 to-indigo-200 opacity-90 blur-[2px] animate-crystal-aura shadow-[0_0_25px_#fff]" />
            <div className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-[0_0_12px_#ffffff] animate-ping" />
          </div>

          {/* Twinkling Internal Astral Glints / Stars */}
          <div className="absolute top-4 left-6 animate-crystal-glint">
            <Sparkles className="w-4 h-4 text-white drop-shadow-[0_0_8px_#ffffff]" />
          </div>
          <div className="absolute bottom-5 right-6 animate-crystal-glint [animation-delay:1.2s]">
            <Sparkles className="w-3.5 h-3.5 text-pink-200 drop-shadow-[0_0_6px_#f472b6]" />
          </div>
          <div className="absolute top-8 right-5 animate-crystal-glint [animation-delay:0.6s]">
            <span className="block w-1.5 h-1.5 bg-amber-200 rounded-full shadow-[0_0_6px_#fde047]" />
          </div>

          {/* Primary Curved Specular Reflection (Glass High Gloss) */}
          <div className="absolute top-2 left-3 w-8 h-4 sm:w-12 sm:h-6 rounded-full bg-gradient-to-b from-white/90 via-white/40 to-transparent -rotate-30 blur-[0.6px] pointer-events-none" />

          {/* Secondary Rim Reflection */}
          <div className="absolute bottom-2 right-4 w-6 h-2 sm:w-8 sm:h-3 rounded-full bg-gradient-to-t from-pink-300/60 to-transparent rotate-20 blur-[0.8px] pointer-events-none" />
          <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/30 pointer-events-none" />
        </div>

        {/* Ornate Antique Claw Pedestal / Crescent Base */}
        <div className="relative -mt-3 sm:-mt-4 z-20 flex flex-col items-center">
          {/* Crescent Moon Cradle holding the sphere */}
          <div className="w-16 sm:w-20 h-4 border-b-2 border-x-2 border-amber-500/80 rounded-b-full bg-gradient-to-b from-transparent to-[#180a2c] shadow-[0_4px_12px_rgba(245,158,11,0.3)] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
          </div>

          {/* Carved Gothic Metal Stand Base */}
          <div className="w-20 sm:w-24 h-5 sm:h-6 bg-gradient-to-b from-[#2e1d4d] via-[#1a0e30] to-[#0e061b] border border-amber-600/60 rounded-b-xl shadow-2xl flex items-center justify-around px-2">
            <span className="text-[9px] text-amber-400 font-cinzel opacity-80">☾</span>
            <span className="w-1 h-1 rounded-full bg-purple-400/80" />
            <span className="text-[10px] text-purple-300 font-cinzel">✦</span>
            <span className="w-1 h-1 rounded-full bg-purple-400/80" />
            <span className="text-[9px] text-amber-400 font-cinzel opacity-80">☽</span>
          </div>

          {/* Stepped Altar Foot */}
          <div className="w-24 sm:w-30 h-2 bg-gradient-to-r from-purple-950 via-amber-950/80 to-purple-950 border-t border-purple-800/60 rounded-full shadow-lg" />
        </div>

        {/* Ethereal Ground Reflection / Ground Fog */}
        <div className="w-32 sm:w-40 h-3 bg-purple-500/25 blur-md rounded-full -mt-1 animate-pulse" />
      </div>

      {/* Narrative Status Caption */}
      <div className="mt-5 text-center space-y-1.5 max-w-md px-4">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <h4 className="font-cinzel font-bold text-sm sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 tracking-wide animate-crystal-flicker">
            {text}
          </h4>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
        </div>

        {subtext && (
          <p className="text-xs sm:text-sm font-gothic text-purple-300/80 italic animate-pulse">
            {subtext}
          </p>
        )}

        {/* Flowing mystic progress dots */}
        <div className="flex items-center justify-center space-x-1.5 pt-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping [animation-duration:1.4s]" />
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping [animation-duration:1.6s] [animation-delay:0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping [animation-duration:1.8s] [animation-delay:0.6s]" />
        </div>
      </div>
    </div>
  );
};
