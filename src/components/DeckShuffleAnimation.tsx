import React, { useEffect, useState } from "react";
import { Eye, Sparkles } from "lucide-react";

interface DeckShuffleAnimationProps {
  onShuffleComplete?: () => void;
  targetColor?: string;
}

export const DeckShuffleAnimation: React.FC<DeckShuffleAnimationProps> = ({
  targetColor = "#a855f7",
}) => {
  const [phase, setPhase] = useState<"FAN" | "RIFFLE" | "CUT" | "DRAW">("FAN");
  const [shuffleStep, setShuffleStep] = useState(0);

  useEffect(() => {
    // Cycle through real physical deck shuffling phases
    const t1 = setTimeout(() => {
      setPhase("RIFFLE");
    }, 450);

    const t2 = setTimeout(() => {
      setPhase("CUT");
    }, 1050);

    const t3 = setTimeout(() => {
      setPhase("DRAW");
    }, 1500);

    const interval = setInterval(() => {
      setShuffleStep((s) => (s + 1) % 22);
    }, 85);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, []);

  // 9 simulated cards representing the physical Marseille deck
  const cards = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

  return (
    <div className="relative w-64 sm:w-72 h-[410px] sm:h-[430px] flex flex-col items-center justify-center select-none overflow-visible">
      {/* Radiant Shuffling Energy Vortex Background */}
      <div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none"
        style={{ backgroundColor: targetColor }}
      />

      {/* 3D Shuffling Card Deck Stage */}
      <div className="relative w-56 h-84 flex items-center justify-center perspective-1000">
        {cards.map((cardIndex, i) => {
          let transformStyle = "";
          let zIndex = 10 + i;
          let opacity = 1;

          if (phase === "FAN") {
            // Fan out in an arch
            const rot = cardIndex * 9;
            const xOffset = cardIndex * 22;
            const yOffset = Math.abs(cardIndex) * 8 - 10;
            transformStyle = `translateX(${xOffset}px) translateY(${yOffset}px) rotate(${rot}deg)`;
          } else if (phase === "RIFFLE") {
            // Riffle shuffle: left pile vs right pile interleaving and sliding
            const isLeft = i % 2 === 0;
            const sideShift = isLeft ? -45 : 45;
            const yWobble = (i % 3) * 6 - 8;
            const rotWobble = isLeft ? -12 + (i % 3) * 4 : 12 - (i % 3) * 4;
            transformStyle = `translateX(${sideShift}px) translateY(${yWobble}px) rotate(${rotWobble}deg) scale(0.96)`;
          } else if (phase === "CUT") {
            // Cut the deck: central deck stack with top cut sliding over
            if (i < 3) {
              transformStyle = `translateX(-35px) translateY(-18px) rotate(-6deg)`;
            } else if (i > 5) {
              transformStyle = `translateX(35px) translateY(18px) rotate(6deg)`;
            } else {
              transformStyle = `translateX(0px) translateY(0px) rotate(0deg)`;
            }
          } else if (phase === "DRAW") {
            // Top chosen card rises with golden aura
            if (i === 4) {
              zIndex = 50;
              transformStyle = `translateY(-25px) scale(1.08) rotate(0deg)`;
            } else {
              opacity = 0.5;
              const rot = cardIndex * 4;
              const xOffset = cardIndex * 6;
              transformStyle = `translateX(${xOffset}px) translateY(15px) rotate(${rot}deg) scale(0.92)`;
            }
          }

          return (
            <div
              key={cardIndex}
              className="absolute w-48 sm:w-52 h-76 sm:h-80 rounded-2xl p-2.5 flex flex-col justify-between border-2 border-amber-500/70 bg-gradient-to-b from-[#1b0e32] via-[#0f061d] to-[#07020d] shadow-2xl transition-all duration-300 ease-out"
              style={{
                transform: transformStyle,
                zIndex,
                opacity,
                boxShadow:
                  phase === "DRAW" && i === 4
                    ? `0 0 35px ${targetColor}, 0 0 15px rgba(251,191,36,0.8)`
                    : "0 10px 25px rgba(0,0,0,0.6)",
              }}
            >
              {/* Marseille Card Back Design */}
              <div className="w-full h-full border-2 border-amber-400/50 rounded-xl p-2.5 flex flex-col items-center justify-between relative bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.25),transparent_70%)]">
                <div className="w-full flex justify-between text-amber-400/70 text-[10px]">
                  <span>✦</span>
                  <span>☽</span>
                  <span>✦</span>
                </div>

                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                  <div className="w-14 h-14 rounded-full border border-amber-400/60 flex items-center justify-center bg-purple-950/80 relative shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                    <div className="absolute inset-1 rounded-full border border-purple-400/40 animate-spin-reverse" />
                    <Eye className="w-6 h-6 text-amber-300 animate-pulse" />
                  </div>
                  <span className="text-[9px] font-cinzel font-bold uppercase tracking-[0.2em] text-amber-300 drop-shadow">
                    Marsella
                  </span>
                </div>

                <div className="w-full flex justify-between text-amber-400/70 text-[10px]">
                  <span>✦</span>
                  <span>☉</span>
                  <span>✦</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shuffling Status & Real-time mixing indicator */}
      <div className="mt-4 flex flex-col items-center text-center space-y-1 z-20">
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-950/90 border border-purple-600/60 shadow-lg text-amber-300 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span className="text-xs font-cinzel font-bold tracking-wider">
            {phase === "FAN" && "Abriendo el Mazo Sagrado..."}
            {phase === "RIFFLE" && "Mezclando los 22 Arcanos..."}
            {phase === "CUT" && "Cortando en 3 Puntos Cardinales..."}
            {phase === "DRAW" && "Extrayendo Arcano del Destino..."}
          </span>
        </div>
        <span className="text-[10px] font-gothic text-purple-300/80">
          Sincronía Akáshica • Arcano #{((shuffleStep + 1) % 22) + 1} de 22
        </span>
      </div>
    </div>
  );
};
