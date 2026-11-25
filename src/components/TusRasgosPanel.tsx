import React, { useState } from "react";
import { ScanFace, ExternalLink, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import type { SupportedLanguage } from "../types";
import rasgosBgImg from "../assets/images/tus_rasgos_expresan_bg_1795620362355.jpg";

const RASGOS_URL = "https://ais-pre-slyubtbbhup2dldv7ygx42-172786148761.us-east1.run.app";
const FALLBACK_BG_IMAGE = "/assets/aistudio/Screenshot_20261122_144850_Chrome_2f1f363b.jpg";

interface RasgosCopy {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  badge: string;
}

const COPY: Record<SupportedLanguage, RasgosCopy> = {
  es: {
    eyebrow: "Fisiognomía Mística • Lectura del Alma",
    title: "Tus rasgos expresan",
    description:
      "Descubre qué revelan la forma de tu rostro, tu mirada, tus facciones y gestos sobre tu esencia interior, carácter astral y vibración energética.",
    cta: "Explorar Tus Rasgos",
    badge: "Geometría Facial Activa • Esencia",
  },
  en: {
    eyebrow: "Mystical Physiognomy • Soul Reading",
    title: "Your Features Express",
    description:
      "Discover what the contours of your face, gaze, features, and expression reveal about your inner essence, astral character, and energetic vibration.",
    cta: "Explore Your Features",
    badge: "Facial Geometry Active • Essence",
  },
  pt: {
    eyebrow: "Fisiognomia Mística • Leitura da Alma",
    title: "Seus traços expressam",
    description:
      "Descubra o que o formato do seu rosto, olhar, traços e gestos revelam sobre sua essência interior, caráter astral e vibração energética.",
    cta: "Explorar Seus Traços",
    badge: "Geometria Facial Ativa • Essência",
  },
  fr: {
    eyebrow: "Physiognomonie Mystique • Lecture de l'Âme",
    title: "Vos traits expriment",
    description:
      "Découvrez ce que la forme de votre visage, votre regard et vos expressions révèlent sur votre essence intérieure, votre caractère astral et votre vibration.",
    cta: "Explorer Vos Traits",
    badge: "Géométrie Faciale Active • Essence",
  },
  it: {
    eyebrow: "Fisiognomica Mistica • Lettura dell'Anima",
    title: "I tuoi tratti esprimono",
    description:
      "Scopri cosa rivelano la forma del tuo viso, il tuo sguardo e le tue espressioni sulla tua essenza interiore, sul carattere astrale e sulla tua vibrazione.",
    cta: "Esplora i Tuoi Tratti",
    badge: "Geometria Facciale Attiva • Essenza",
  },
  de: {
    eyebrow: "Mystische Physiognomie • Seelenlesung",
    title: "Deine Züge drücken aus",
    description:
      "Entdecke, was die Konturen deines Gesichts, dein Blick und deine Mimik über dein inneres Wesen, deinen astralen Charakter und deine Energie verraten.",
    cta: "Deine Züge Erkunden",
    badge: "Gesichtsgeometrie Aktiv • Essenz",
  },
};

export const TusRasgosPanel: React.FC = () => {
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.es;
  const [imgSrc, setImgSrc] = useState<string>(rasgosBgImg || FALLBACK_BG_IMAGE);

  return (
    <section
      id="tus-rasgos-section"
      aria-label={copy.title}
      className="w-full max-w-4xl rounded-3xl border-2 border-blue-400/60 shadow-[0_0_50px_rgba(59,130,246,0.28)] relative overflow-hidden min-h-[380px] sm:min-h-[460px] flex flex-col justify-between p-4 sm:p-7 group transition-all duration-300"
      style={{
        backgroundImage: `url(${FALLBACK_BG_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
      }}
    >
      {/* Background Image layer with subtle cinematic hover zoom */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={imgSrc}
          alt="Tus rasgos expresan - Fisiognomía Mística"
          referrerPolicy="no-referrer"
          onError={() => setImgSrc(FALLBACK_BG_IMAGE)}
          className="w-full h-full object-cover object-[center_30%] filter brightness-95 contrast-105 saturate-110 transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Soft atmospheric gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#04091a]/95 via-[#04091a]/30 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.25),transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.2),transparent_60%)] pointer-events-none" />
      </div>

      {/* Top Bar Badges */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-blue-400/60 text-xs font-cinzel font-semibold uppercase tracking-[0.18em] text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)] backdrop-blur-md">
          <ScanFace className="w-4 h-4 text-blue-300 animate-pulse" />
          <span>{copy.eyebrow}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-[11px] font-mono text-blue-200/90 shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping inline-block" />
          <span>{copy.badge}</span>
        </div>
      </div>

      {/* Center visual breathing space */}
      <div className="relative z-10 my-auto py-4 pointer-events-none flex justify-center items-center">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-blue-400/20 animate-ping opacity-25" />
      </div>

      {/* Bottom Floating Glass Card */}
      <div className="relative z-10 bg-black/80 sm:bg-black/70 border border-blue-500/50 rounded-2xl p-4 sm:p-6 backdrop-blur-lg shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-300" />
            <h3 className="font-cinzel font-bold text-lg sm:text-2xl text-blue-100 tracking-wide drop-shadow-md">
              {copy.title}
            </h3>
          </div>
          <p className="font-gothic text-xs sm:text-sm text-blue-100/90 leading-relaxed drop-shadow">
            {copy.description}
          </p>
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
          <a
            href={RASGOS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700 hover:from-blue-400 hover:via-indigo-500 hover:to-blue-600 text-white font-cinzel font-bold text-xs sm:text-sm tracking-wide border border-blue-200/80 shadow-[0_0_25px_rgba(59,130,246,0.45)] transition flex items-center justify-center gap-2.5 whitespace-nowrap transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <ScanFace className="w-4 h-4" />
            <span>{copy.cta}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <span className="text-[11px] font-mono text-blue-300/85 text-center sm:text-right drop-shadow-sm">
            tus-rasgos-expresan.app
          </span>
        </div>
      </div>
    </section>
  );
};
