import React, { useState } from "react";
import type { NatalBodyPosition, NatalChartData } from "../types";
import { ZODIAC_SIGNS } from "../lib/natalChart";

interface NatalWheelSvgProps {
  chart: NatalChartData;
  onSelectPlanet?: (planet: NatalBodyPosition) => void;
}

export const NatalWheelSvg: React.FC<NatalWheelSvgProps> = ({ chart, onSelectPlanet }) => {
  const [selectedId, setSelectedId] = useState<string>("sun");

  const size = 440;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 202;
  const rSignInner = 166;
  const rHouseInner = 96;
  const rAspect = 92;

  const ascDeg = chart.ascendant.totalDegree;

  // Standard Western Astrology orientation: Ascendant on Left (9 o'clock = 180 deg)
  const toPoint = (eclipticDeg: number, radius: number) => {
    const screenDeg = 180 - (eclipticDeg - ascDeg);
    const rad = (screenDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy - radius * Math.sin(rad),
    };
  };

  // Anti-collision radial offsets for closely conjunct planets
  const sortedPlanets = [...chart.planets].sort((a, b) => a.totalDegree - b.totalDegree);
  const planetRadiusOffsets = new Map<string, number>();
  for (let i = 0; i < sortedPlanets.length; i++) {
    const curr = sortedPlanets[i];
    const prev = sortedPlanets[(i - 1 + sortedPlanets.length) % sortedPlanets.length];
    const next = sortedPlanets[(i + 1) % sortedPlanets.length];
    const dPrev = Math.min(Math.abs(curr.totalDegree - prev.totalDegree), 360 - Math.abs(curr.totalDegree - prev.totalDegree));
    const dNext = Math.min(Math.abs(curr.totalDegree - next.totalDegree), 360 - Math.abs(curr.totalDegree - next.totalDegree));
    let offset = 0;
    if (dPrev < 8 || dNext < 8) {
      offset = i % 3 === 0 ? -15 : i % 3 === 1 ? 0 : 15;
    }
    planetRadiusOffsets.set(curr.id, offset);
  }

  const activeBody = chart.planets.find((p) => p.id === selectedId) || chart.sun;

  const elementStrokeColor: Record<string, string> = {
    Fuego: "#f59e0b",
    Tierra: "#34d399",
    Aire: "#38bdf8",
    Agua: "#a78bfa",
  };

  return (
    <div className="flex flex-col items-center w-full">
      <svg
        id="natal-wheel-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[430px] h-auto select-none"
        role="img"
        aria-label={`Rueda natal astrológica de ${chart.seekerName}`}
      >
        <defs>
          <radialGradient id="natalBackdrop" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#170c2e" />
            <stop offset="68%" stopColor="#0d071b" />
            <stop offset="100%" stopColor="#070410" />
          </radialGradient>
        </defs>

        {/* Outer backdrop & precision structural rings */}
        <circle cx={cx} cy={cy} r={rOuter} fill="url(#natalBackdrop)" stroke="#7c3aed" strokeOpacity="0.45" strokeWidth="1.2" />
        <circle cx={cx} cy={cy} r={rSignInner} fill="none" stroke="#a78bfa" strokeOpacity="0.35" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={rHouseInner} fill="#080412" stroke="#7c3aed" strokeOpacity="0.35" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={22} fill="#110924" stroke="#f59e0b" strokeOpacity="0.65" strokeWidth="1" />

        {/* 12 Zodiac Sign Sectors & Degree Ticks */}
        {ZODIAC_SIGNS.map((sign) => {
          const pOuter = toPoint(sign.startDeg, rOuter);
          const pInner = toPoint(sign.startDeg, rSignInner);
          const pMid = toPoint(sign.startDeg + 15, (rOuter + rSignInner) / 2);
          const accent = elementStrokeColor[sign.element] || "#c4b5fd";

          return (
            <g key={sign.id}>
              <line
                x1={pInner.x}
                y1={pInner.y}
                x2={pOuter.x}
                y2={pOuter.y}
                stroke="#8b5cf6"
                strokeOpacity="0.45"
                strokeWidth="1"
              />
              {/* 10° and 20° subdivision ticks */}
              {[10, 20].map((sub) => {
                const tOut = toPoint(sign.startDeg + sub, rSignInner + 5);
                const tIn = toPoint(sign.startDeg + sub, rSignInner);
                return (
                  <line
                    key={sub}
                    x1={tIn.x}
                    y1={tIn.y}
                    x2={tOut.x}
                    y2={tOut.y}
                    stroke="#a78bfa"
                    strokeOpacity="0.35"
                    strokeWidth="0.8"
                  />
                );
              })}
              <text
                x={pMid.x}
                y={pMid.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={accent}
                fontSize="14"
                fontWeight="600"
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {/* 12 House Cusps & Angles */}
        {chart.houses.map((house) => {
          const isAsc = house.house === 1;
          const isDsc = house.house === 7;
          const isMc = house.house === 10;
          const isIc = house.house === 4;
          const isCardinalAxis = isAsc || isDsc || isMc || isIc;

          const pStart = toPoint(house.totalDegree, isCardinalAxis ? 24 : rHouseInner);
          const pEnd = toPoint(house.totalDegree, rSignInner);

          const nextHouse = chart.houses[house.house % 12];
          const span = ((nextHouse.totalDegree - house.totalDegree) % 360 + 360) % 360;
          const midDeg = (house.totalDegree + span / 2) % 360;
          const pLabel = toPoint(midDeg, rHouseInner + 14);

          return (
            <g key={house.house}>
              <line
                x1={pStart.x}
                y1={pStart.y}
                x2={pEnd.x}
                y2={pEnd.y}
                stroke={isAsc || isDsc ? "#f43f5e" : isMc || isIc ? "#f59e0b" : "#6d28d9"}
                strokeWidth={isCardinalAxis ? "1.6" : "0.9"}
                strokeOpacity={isCardinalAxis ? "0.9" : "0.5"}
                strokeDasharray={isCardinalAxis ? undefined : "2,3"}
              />
              <text
                x={pLabel.x}
                y={pLabel.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#a78bfa"
                fillOpacity="0.7"
                fontSize="9"
                fontFamily="monospace"
              >
                {house.house}
              </text>
            </g>
          );
        })}

        {/* Aspect Chords */}
        {chart.aspects.map((asp, idx) => {
          const b1 = chart.planets.find((p) => p.id === asp.planet1Id);
          const b2 = chart.planets.find((p) => p.id === asp.planet2Id);
          if (!b1 || !b2) return null;
          const p1 = toPoint(b1.totalDegree, rAspect);
          const p2 = toPoint(b2.totalDegree, rAspect);
          const isHighlighted = selectedId === b1.id || selectedId === b2.id;
          const stroke =
            asp.type === "Conjunción"
              ? "#fbbf24"
              : asp.nature === "harmonic"
              ? "#38bdf8"
              : "#fb7185";
          return (
            <line
              key={`${asp.planet1Id}-${asp.planet2Id}-${idx}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={stroke}
              strokeWidth={isHighlighted ? "1.7" : "0.95"}
              strokeOpacity={isHighlighted ? "0.95" : "0.45"}
              strokeDasharray={asp.type === "Sextil" ? "3,3" : undefined}
            />
          );
        })}

        {/* Center Star Emblem */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fde68a"
          fontSize="13"
        >
          ✦
        </text>

        {/* Planets & Cardinal Points */}
        {chart.planets.map((body) => {
          const rOffset = planetRadiusOffsets.get(body.id) || 0;
          const nodeRadius = rHouseInner + 38 + rOffset;
          const pt = toPoint(body.totalDegree, nodeRadius);
          const rimPt = toPoint(body.totalDegree, rSignInner);
          const isSelected = selectedId === body.id;

          const strokeColor =
            body.id === "sun"
              ? "#f59e0b"
              : body.id === "moon"
              ? "#60a5fa"
              : body.id === "ascendant"
              ? "#f43f5e"
              : body.id === "midheaven"
              ? "#fbbf24"
              : "#a855f7";

          return (
            <g
              key={body.id}
              className="cursor-pointer"
              onClick={() => {
                setSelectedId(body.id);
                onSelectPlanet?.(body);
              }}
              onMouseEnter={() => setSelectedId(body.id)}
            >
              <line
                x1={pt.x}
                y1={pt.y}
                x2={rimPt.x}
                y2={rimPt.y}
                stroke={strokeColor}
                strokeWidth={isSelected ? "1.4" : "0.75"}
                strokeOpacity={isSelected ? "0.95" : "0.45"}
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? 12.5 : 10}
                fill="#0b0617"
                stroke={strokeColor}
                strokeWidth={isSelected ? "2" : "1.15"}
              />
              <text
                x={pt.x}
                y={pt.y + 0.5}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isSelected ? "#ffffff" : "#f3e8ff"}
                fontSize={body.glyph.length > 1 ? "7.5" : "11"}
                fontWeight="bold"
              >
                {body.glyph}
              </text>
            </g>
          );
        })}

        {/* Axis Badges (ASC / DSC / MC / IC) */}
        {(() => {
          const pAsc = toPoint(chart.ascendant.totalDegree, rOuter + 10);
          const pDsc = toPoint((chart.ascendant.totalDegree + 180) % 360, rOuter + 10);
          const pMc = toPoint(chart.midheaven.totalDegree, rOuter + 10);
          const pIc = toPoint((chart.midheaven.totalDegree + 180) % 360, rOuter + 10);
          return (
            <g fontFamily="monospace" fontSize="9" fontWeight="700">
              <text x={pAsc.x} y={pAsc.y} textAnchor="middle" dominantBaseline="central" fill="#fb7185">ASC</text>
              <text x={pDsc.x} y={pDsc.y} textAnchor="middle" dominantBaseline="central" fill="#f472b6" opacity="0.8">DSC</text>
              <text x={pMc.x} y={pMc.y} textAnchor="middle" dominantBaseline="central" fill="#fbbf24">MC</text>
              <text x={pIc.x} y={pIc.y} textAnchor="middle" dominantBaseline="central" fill="#d97706" opacity="0.8">IC</text>
            </g>
          );
        })()}
      </svg>

      {/* Active Body Precision Telemetry Readout */}
      <div className="mt-3 w-full px-3.5 py-2.5 rounded-xl bg-[#0b0617]/95 border border-purple-700/50 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-purple-950/90 border border-purple-500/50 flex items-center justify-center text-sm font-bold text-amber-300 shrink-0">
            {activeBody.glyph}
          </span>
          <div>
            <div className="font-cinzel font-bold text-purple-100 flex items-center gap-1.5">
              <span>{activeBody.name} en {activeBody.sign} {activeBody.signSymbol}</span>
              {activeBody.isRetrograde && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300">
                  Rx
                </span>
              )}
            </div>
            <div className="text-[11px] font-mono tabular-nums text-purple-300/85">
              {String(activeBody.degree).padStart(2, "0")}° {String(activeBody.minutes).padStart(2, "0")}' • Casa {activeBody.house} • {activeBody.element} • Regente: {activeBody.ruler}
            </div>
          </div>
        </div>
        <span className="text-[11px] text-purple-300/80 italic max-w-xs">
          {activeBody.meaning}
        </span>
      </div>
    </div>
  );
};
