import React, { useMemo } from "react";

interface StarfieldBackgroundProps {
  isOracleActive?: boolean;
  isLoading?: boolean;
}

interface StarSpec {
  id: number;
  left: string;
  top: string;
  size: number;
  twinkleDuration: string;
  twinkleDelay: string;
  driftDuration: string;
  driftDelay: string;
  opacity: number;
  tint: string;
}

interface DustSpec {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: string;
  delay: string;
  tint: string;
}

export const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({
  isOracleActive = false,
  isLoading = false,
}) => {
  const stars = useMemo<StarSpec[]>(() => {
    const tints = ["#f8fafc", "#fde68a", "#e9d5ff", "#c4b5fd", "#fed7aa"];
    return Array.from({ length: 58 }, (_, i) => {
      const seedA = ((i * 73 + 19) % 97) / 97;
      const seedB = ((i * 41 + 37) % 89) / 89;
      const seedC = ((i * 59 + 11) % 83) / 83;
      return {
        id: i,
        left: `${(seedA * 98 + 1).toFixed(2)}%`,
        top: `${(seedB * 98 + 1).toFixed(2)}%`,
        size: i % 7 === 0 ? 3 : i % 3 === 0 ? 2 : 1.4,
        twinkleDuration: `${(2.8 + seedC * 4.2).toFixed(2)}s`,
        twinkleDelay: `${(seedA * 4).toFixed(2)}s`,
        driftDuration: `${(18 + seedB * 22).toFixed(2)}s`,
        driftDelay: `${(seedC * 6).toFixed(2)}s`,
        opacity: 0.35 + seedC * 0.55,
        tint: tints[i % tints.length],
      };
    });
  }, []);

  const stardust = useMemo<DustSpec[]>(() => {
    const tints = [
      "rgba(251, 191, 36, 0.75)",
      "rgba(192, 132, 252, 0.75)",
      "rgba(244, 114, 182, 0.65)",
      "rgba(129, 140, 248, 0.7)",
    ];
    return Array.from({ length: 30 }, (_, i) => {
      const seedA = ((i * 61 + 29) % 97) / 97;
      const seedB = ((i * 47 + 17) % 89) / 89;
      const seedC = ((i * 83 + 23) % 79) / 79;
      return {
        id: i,
        left: `${(seedA * 96 + 2).toFixed(2)}%`,
        top: `${(seedB * 92 + 4).toFixed(2)}%`,
        size: 2.2 + (i % 4) * 1.1,
        duration: `${(6 + seedC * 7).toFixed(2)}s`,
        delay: `${(seedB * 4).toFixed(2)}s`,
        tint: tints[i % tints.length],
      };
    });
  }, []);

  return (
    <>
      {/* Persistent Cosmic Starfield Canvas Behind Main Portal */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      >
        {stars.map((star) => (
          <span
            key={star.id}
            className="absolute rounded-full animate-starfield-drift"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.tint,
              opacity: star.opacity,
              boxShadow: star.size >= 2.5 ? `0 0 8px ${star.tint}` : undefined,
              animationDuration: `${star.driftDuration}, ${star.twinkleDuration}`,
              animationDelay: `${star.driftDelay}, ${star.twinkleDelay}`,
            }}
          />
        ))}
      </div>

      {/* Dynamic Backdrop Blur & Stardust Particle Overlay During Oracle Loading / Results */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 pointer-events-none z-[12] transition-all duration-700 overflow-hidden ${
          isLoading
            ? "backdrop-blur-[4px] bg-purple-950/25 opacity-100"
            : isOracleActive
            ? "backdrop-blur-[2px] bg-indigo-950/15 opacity-95"
            : "opacity-35"
        }`}
      >
        {stardust.map((mote) => (
          <span
            key={mote.id}
            className="absolute rounded-full animate-stardust-rise"
            style={{
              left: mote.left,
              top: mote.top,
              width: `${isLoading ? mote.size * 1.35 : mote.size}px`,
              height: `${isLoading ? mote.size * 1.35 : mote.size}px`,
              backgroundColor: mote.tint,
              boxShadow: `0 0 ${isLoading ? 14 : 9}px ${mote.tint}`,
              animationDuration: mote.duration,
              animationDelay: mote.delay,
            }}
          />
        ))}
      </div>
    </>
  );
};
