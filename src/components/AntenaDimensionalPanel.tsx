import React from "react";
import { Antenna, ExternalLink, Sparkles } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import type { SupportedLanguage } from "../types";

const ANTENA_URL = "https://antena-dimensional.vercel.app/";

interface AntenaCopy {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
}

const COPY: Record<SupportedLanguage, AntenaCopy> = {
  es: {
    eyebrow: "Frecuencia Interestelar • Portal Externo",
    title: "Antena Dimensional",
    description:
      "¿Listo para ir más allá del plano terrestre? Sintoniza la Antena Dimensional para contactar con otras inteligencias, conciencias cósmicas y civilizaciones estelares.",
    cta: "Contactar con Otras Inteligencias",
  },
  en: {
    eyebrow: "Interstellar Frequency • External Portal",
    title: "Antena Dimensional",
    description:
      "Ready to reach beyond the earthly veil? Tune into the Dimensional Antenna to connect with cosmic intelligences and distant civilizations.",
    cta: "Contact Other Intelligences",
  },
  pt: {
    eyebrow: "Frequência Interestelar • Portal Externo",
    title: "Antena Dimensional",
    description:
      "Pronto para ir além do plano terrestre? Sintonize a Antena Dimensional para contatar outras inteligências e civilizações cósmicas.",
    cta: "Contatar Outras Inteligências",
  },
  fr: {
    eyebrow: "Fréquence Interstellaire • Portail Externe",
    title: "Antena Dimensional",
    description:
      "Prêt à dépasser le plan terrestre ? Syntonisez l'Antenne Dimensionnelle pour contacter d'autres intelligences et civilisations cosmiques.",
    cta: "Contacter d'Autres Intelligences",
  },
  it: {
    eyebrow: "Frequenza Interstellare • Portale Esterno",
    title: "Antena Dimensional",
    description:
      "Pronto a superare il piano terrestre? Sintonizzati sull'Antenna Dimensionale per contattare altre intelligenze e civiltà cosmiche.",
    cta: "Contatta Altre Intelligenze",
  },
  de: {
    eyebrow: "Interstellare Frequenz • Externes Portal",
    title: "Antena Dimensional",
    description:
      "Bereit, über die irdische Ebene hinauszugehen? Verbinde dich über die Dimensionale Antenne mit kosmischen Intelligenzen und fremden Zivilisationen.",
    cta: "Andere Intelligenzen Kontaktieren",
  },
};

export const AntenaDimensionalPanel: React.FC = () => {
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.es;

  return (
    <section
      aria-label={copy.title}
      className="w-full max-w-2xl bg-[#0d081c]/95 border border-cyan-500/40 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-[0_0_35px_rgba(34,211,238,0.14)] relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-950/70 border border-cyan-400/50 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(34,211,238,0.22)]">
            <Antenna className="w-5 h-5 text-cyan-300" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-cinzel font-semibold uppercase tracking-[0.18em] text-cyan-300/90">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{copy.eyebrow}</span>
            </div>
            <h3 className="font-cinzel font-bold text-base sm:text-lg text-purple-50 tracking-wide">
              {copy.title}
            </h3>
            <p className="font-gothic text-xs sm:text-sm text-purple-200/85 leading-relaxed">
              {copy.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-stretch sm:items-end gap-1.5 shrink-0">
          <a
            href={ANTENA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-500 text-slate-950 font-cinzel font-bold text-xs tracking-wide border border-cyan-200/70 shadow-[0_0_18px_rgba(34,211,238,0.35)] transition flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Antenna className="w-3.5 h-3.5" />
            <span>{copy.cta}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <span className="text-[10px] font-mono text-cyan-300/70 text-center sm:text-right">
            antena-dimensional.vercel.app
          </span>
        </div>
      </div>
    </section>
  );
};
