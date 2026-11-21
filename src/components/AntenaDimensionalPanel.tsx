import React, { useState } from "react";
import { Antenna, ExternalLink, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import type { SupportedLanguage } from "../types";
import antenaBgImg from "../assets/images/antena_dimensional_bg.jpg";

const ANTENA_URL = "https://antena-dimensional.vercel.app/";
const FALLBACK_BG_IMAGE = "/assets/aistudio/Screenshot_20261120_225226_Chrome_b06f130e.jpg";

interface AntenaCopy {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  badge: string;
}

const COPY: Record<SupportedLanguage, AntenaCopy> = {
  es: {
    eyebrow: "Frecuencia Interestelar • Portal Externo",
    title: "Antena Dimensional",
    description:
      "¿Listo para ir más allá del plano terrestre? Sintoniza la Antena Dimensional para contactar con otras inteligencias, conciencias cósmicas y civilizaciones estelares.",
    cta: "Contactar con Otras Inteligencias",
    badge: "Transceptor Activo • 432Hz Astral",
  },
  en: {
    eyebrow: "Interstellar Frequency • External Portal",
    title: "Dimensional Antenna",
    description:
      "Ready to reach beyond the earthly veil? Tune into the Dimensional Antenna to connect with cosmic intelligences and distant civilizations.",
    cta: "Contact Other Intelligences",
    badge: "Transceiver Active • 432Hz Astral",
  },
  pt: {
    eyebrow: "Frequência Interestelar • Portal Externo",
    title: "Antena Dimensional",
    description:
      "Pronto para ir além do plano terrestre? Sintonize a Antena Dimensional para contatar outras inteligências e civilizações cósmicas.",
    cta: "Contatar Outras Inteligências",
    badge: "Transceptor Ativo • 432Hz Astral",
  },
  fr: {
    eyebrow: "Fréquence Interstellaire • Portail Externe",
    title: "Antenne Dimensionnelle",
    description:
      "Prêt à dépasser le plan terrestre ? Syntonisez l'Antenne Dimensionnelle pour contacter d'autres intelligences et civilisations cosmiques.",
    cta: "Contacter d'Autres Intelligences",
    badge: "Émetteur-Récepteur Actif • 432Hz Astral",
  },
  it: {
    eyebrow: "Frequenza Interstellare • Portale Esterno",
    title: "Antenna Dimensionale",
    description:
      "Pronto a superare il piano terrestre? Sintonizzati sull'Antenna Dimensionale per contattare altre intelligenze e civiltà cosmiche.",
    cta: "Contatta Altre Intelligenze",
    badge: "Ricetrasmettitore Attivo • 432Hz Astrale",
  },
  de: {
    eyebrow: "Interstellare Frequenz • Externes Portal",
    title: "Dimensionale Antenne",
    description:
      "Bereit, über die irdische Ebene hinauszugehen? Verbinde dich über die Dimensionale Antenne mit kosmischen Intelligenzen und fremden Zivilisationen.",
    cta: "Andere Intelligenzen Kontaktieren",
    badge: "Transceiver Aktiv • 432Hz Astral",
  },
};

export const AntenaDimensionalPanel: React.FC = () => {
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.es;
  const [imgSrc, setImgSrc] = useState<string>(antenaBgImg || FALLBACK_BG_IMAGE);

  return (
    <section
      id="antena-dimensional-section"
      aria-label={copy.title}
      className="w-full max-w-4xl rounded-3xl border-2 border-cyan-400/60 shadow-[0_0_50px_rgba(34,211,238,0.28)] relative overflow-hidden min-h-[380px] sm:min-h-[460px] flex flex-col justify-between p-4 sm:p-7 group transition-all duration-300"
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
          alt="Antena Dimensional - Contacto Interestelar"
          onError={() => setImgSrc(FALLBACK_BG_IMAGE)}
          className="w-full h-full object-cover object-[center_30%] filter brightness-95 contrast-105 saturate-110 transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Soft atmospheric gradients that keep the phone & glowing waveforms fully visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060212]/95 via-[#060212]/20 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.25),transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.2),transparent_60%)] pointer-events-none" />
      </div>

      {/* Top Bar Badges */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-cyan-400/60 text-xs font-cinzel font-semibold uppercase tracking-[0.18em] text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.3)] backdrop-blur-md">
          <Antenna className="w-4 h-4 text-cyan-300 animate-pulse" />
          <span>{copy.eyebrow}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300/90 shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>{copy.badge}</span>
        </div>
      </div>

      {/* Center visual breathing space - showcases the glowing phone, waveforms & hands */}
      <div className="relative z-10 my-auto py-4 pointer-events-none flex justify-center items-center">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-cyan-400/20 animate-ping opacity-25" />
      </div>

      {/* Bottom Floating Glass Card with clear title, description & CTA */}
      <div className="relative z-10 bg-black/80 sm:bg-black/70 border border-cyan-500/50 rounded-2xl p-4 sm:p-6 backdrop-blur-lg shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h3 className="font-cinzel font-bold text-lg sm:text-2xl text-white tracking-wide drop-shadow-md">
              {copy.title}
            </h3>
          </div>
          <p className="font-gothic text-xs sm:text-sm text-cyan-100/90 leading-relaxed drop-shadow">
            {copy.description}
          </p>
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
          <a
            href={ANTENA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 hover:from-cyan-300 hover:via-sky-400 hover:to-indigo-500 text-slate-950 font-cinzel font-bold text-xs sm:text-sm tracking-wide border border-cyan-200/90 shadow-[0_0_25px_rgba(34,211,238,0.5)] transition flex items-center justify-center gap-2.5 whitespace-nowrap transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Antenna className="w-4 h-4" />
            <span>{copy.cta}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <span className="text-[11px] font-mono text-cyan-300/80 text-center sm:text-right drop-shadow-sm">
            antena-dimensional.vercel.app
          </span>
        </div>
      </div>
    </section>
  );
};
