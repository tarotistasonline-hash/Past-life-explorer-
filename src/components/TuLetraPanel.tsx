import React, { useState } from "react";
import { PenTool, ExternalLink, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import type { SupportedLanguage } from "../types";

const LETRA_URL = "https://ais-pre-kn65okzrrypaw2xcxt7f3o-172786148761.us-east1.run.app/";
const FALLBACK_BG_IMAGE = "/assets/aistudio/Screenshot_20261122_144850_Chrome_2f1f363b.jpg";

interface LetraCopy {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  badge: string;
}

const COPY: Record<SupportedLanguage, LetraCopy> = {
  es: {
    eyebrow: "Grafología Mística • Escritura y Subconsciente",
    title: "Tu letra te delata",
    description:
      "Analiza la forma de tus trazos, la inclinación, presión y espacios de tu escritura para descubrir los secretos más profundos de tu personalidad y estado mental.",
    cta: "Analizar Tu Letra",
    badge: "Grafología Activa • Mente",
  },
  en: {
    eyebrow: "Mystical Graphology • Handwriting & Subconscious",
    title: "Your Handwriting Reveals You",
    description:
      "Analyze your strokes, slope, pressure, and spacing to uncover the deepest secrets of your personality and state of mind.",
    cta: "Analyze Handwriting",
    badge: "Handwriting Geometry Active",
  },
  pt: {
    eyebrow: "Grafologia Mística • Escrita e Subconsciente",
    title: "Sua letra te revela",
    description:
      "Analise seus traços, inclinação, pressão e espaçamento para descobrir os segredos mais profundos de sua personalidade.",
    cta: "Analisar Letra",
    badge: "Grafologia Ativa",
  },
  fr: {
    eyebrow: "Graphologie Mystique • Écriture et Subconscient",
    title: "Votre écriture vous trahit",
    description:
      "Analysez vos traits, votre inclinaison et votre pression pour découvrir les secrets les plus profonds de votre personnalité.",
    cta: "Analyser l'Écriture",
    badge: "Graphologie Active",
  },
  it: {
    eyebrow: "Grafologia Mistica • Scrittura e Subconscio",
    title: "La tua scrittura ti rivela",
    description:
      "Analizza i tuoi tratti, l'inclinazione e la pressione per scoprire i segreti più profondi della tua personalità.",
    cta: "Analizza Scrittura",
    badge: "Grafologia Attiva",
  },
  de: {
    eyebrow: "Mystische Graphologie • Handschrift & Unterbewusstsein",
    title: "Deine Handschrift verrät dich",
    description:
      "Analysiere deine Striche, Neigung und Druck, um die tiefsten Geheimnisse deiner Persönlichkeit zu entdecken.",
    cta: "Handschrift Analysieren",
    badge: "Graphologie Aktiv",
  },
};

export const TuLetraPanel: React.FC = () => {
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.es;
  const [imgSrc, setImgSrc] = useState<string>(FALLBACK_BG_IMAGE);

  return (
    <section
      id="tu-letra-section"
      aria-label={copy.title}
      className="w-full max-w-4xl rounded-3xl border-2 border-purple-400/60 shadow-[0_0_50px_rgba(168,85,247,0.28)] relative overflow-hidden min-h-[380px] sm:min-h-[460px] flex flex-col justify-between p-4 sm:p-7 group transition-all duration-300"
      style={{
        backgroundImage: `url(${FALLBACK_BG_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
      }}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={imgSrc}
          alt="Tu letra te delata - Grafología Mística"
          referrerPolicy="no-referrer"
          onError={() => setImgSrc(FALLBACK_BG_IMAGE)}
          className="w-full h-full object-cover object-[center_30%] filter brightness-90 contrast-110 saturate-110 transition-transform duration-700 ease-out group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#04091a]/95 via-[#04091a]/30 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.25),transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(217,70,239,0.2),transparent_60%)] pointer-events-none" />
      </div>

      {/* Top Bar Badges */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-purple-400/60 text-xs font-cinzel font-semibold uppercase tracking-[0.18em] text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-md">
          <PenTool className="w-4 h-4 text-purple-300 animate-pulse" />
          <span>{copy.eyebrow}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-[11px] font-mono text-purple-200/90 shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping inline-block" />
          <span>{copy.badge}</span>
        </div>
      </div>

      {/* Center Visual Space */}
      <div className="relative z-10 my-auto py-4 pointer-events-none flex justify-center items-center">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-purple-400/20 animate-ping opacity-25" />
      </div>

      {/* Bottom Floating Glass Card */}
      <div className="relative z-10 bg-black/80 sm:bg-black/70 border border-purple-500/50 rounded-2xl p-4 sm:p-6 backdrop-blur-lg shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <h3 className="font-cinzel font-bold text-lg sm:text-2xl text-purple-100 tracking-wide drop-shadow-md">
              {copy.title}
            </h3>
          </div>
          <p className="font-gothic text-xs sm:text-sm text-purple-100/90 leading-relaxed drop-shadow">
            {copy.description}
          </p>
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
          <a
            href={LETRA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-600 to-indigo-700 hover:from-purple-400 hover:via-fuchsia-500 hover:to-indigo-600 text-white font-cinzel font-bold text-xs sm:text-sm tracking-wide border border-purple-200/80 shadow-[0_0_25px_rgba(168,85,247,0.45)] transition flex items-center justify-center gap-2.5 whitespace-nowrap transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            <span>{copy.cta}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <span className="text-[11px] font-mono text-purple-300/85 text-center sm:text-right drop-shadow-sm">
            tu-letra-te-delata.app
          </span>
        </div>
      </div>
    </section>
  );
};
