import React, { useState } from "react";
import { Antenna, ExternalLink, Sparkles, Copy, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import type { SupportedLanguage } from "../types";
import antenaBgImg from "../assets/images/antena_dimensional_bg.jpg";

const ANTENA_URL = "https://ais-pre-nyechboxmcgvyajxokompy-172786148761.us-east1.run.app/";
const FALLBACK_BG_IMAGE = "/assets/aistudio/Screenshot_20261120_225226_Chrome_b06f130e.jpg";

interface AntenaCopy {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  badge: string;
  copyBtn: string;
  copiedBtn: string;
}

const COPY: Record<SupportedLanguage, AntenaCopy> = {
  es: {
    eyebrow: "Frecuencia Interestelar • Portal Externo",
    title: "Receptor Interestelar",
    description:
      "¿Listo para ir más allá del plano terrestre? Sintoniza el Receptor Interestelar para contactar con otras inteligencias, conciencias cósmicas y civilizaciones estelares.",
    cta: "Ingresar al Receptor",
    badge: "Transceptor Activo • 432Hz Astral",
    copyBtn: "Copiar Link",
    copiedBtn: "¡Copiado!",
  },
  en: {
    eyebrow: "Interstellar Frequency • External Portal",
    title: "Interstellar Receiver",
    description:
      "Ready to reach beyond the earthly veil? Tune into the Interstellar Receiver to connect with cosmic intelligences and distant civilizations.",
    cta: "Enter Receiver",
    badge: "Transceiver Active • 432Hz Astral",
    copyBtn: "Copy Link",
    copiedBtn: "Copied!",
  },
  pt: {
    eyebrow: "Frequência Interestelar • Portal Externo",
    title: "Receptor Interestelar",
    description:
      "Pronto para ir além do plano terrestre? Sintonize o Receptor Interestelar para contatar outras inteligências e civilizações cósmicas.",
    cta: "Entrar no Receptor",
    badge: "Transceptor Ativo • 432Hz Astral",
    copyBtn: "Copiar Link",
    copiedBtn: "Copiado!",
  },
  fr: {
    eyebrow: "Fréquence Interstellaire • Portail Externe",
    title: "Récepteur Interstellaire",
    description:
      "Prêt à dépasser le plan terrestre ? Syntonisez le Récepteur Interstellaire pour contacter d'autres intelligences et civilisations cosmiques.",
    cta: "Entrer dans le Récepteur",
    badge: "Émetteur-Récepteur Actif • 432Hz Astral",
    copyBtn: "Copier le Lien",
    copiedBtn: "Copié !",
  },
  it: {
    eyebrow: "Frequenza Interstellare • Portale Esterno",
    title: "Ricevitore Interstellare",
    description:
      "Pronto a superare il piano terrestre? Sintonizzati sul Ricevitore Interstellare per contattare altre intelligenze e civiltà cosmiche.",
    cta: "Entra nel Ricevitore",
    badge: "Ricetrasmettitore Attivo • 432Hz Astral",
    copyBtn: "Copia Link",
    copiedBtn: "Copiato!",
  },
  de: {
    eyebrow: "Interstellare Frequenz • Externes Portal",
    title: "Interstellarer Empfänger",
    description:
      "Bereit, über die irdische Ebene hinauszugehen? Verbinde dich über den Interstellaren Empfänger mit kosmischen Intelligenzen und fremden Zivilisationen.",
    cta: "Empfänger Betreten",
    badge: "Transceiver Aktiv • 432Hz Astral",
    copyBtn: "Link Kopieren",
    copiedBtn: "Kopiert!",
  },
};

export const AntenaDimensionalPanel: React.FC = () => {
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.es;
  const [imgSrc, setImgSrc] = useState<string>(antenaBgImg || FALLBACK_BG_IMAGE);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(ANTENA_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <section
      id="antena-dimensional-section"
      aria-label={copy.title}
      className="w-full max-w-4xl rounded-3xl border-2 border-cyan-400/60 shadow-[0_0_50px_rgba(34,211,238,0.28)] relative overflow-hidden min-h-[380px] sm:min-h-[460px] flex flex-col justify-between p-4 sm:p-7 group transition-all duration-300 my-4"
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
          alt="Receptor Interestelar - Contacto Interestelar"
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
      <div className="relative z-10 bg-black/85 sm:bg-black/80 border border-cyan-500/60 rounded-2xl p-4 sm:p-6 backdrop-blur-lg shadow-[0_10px_35px_rgba(0,0,0,0.85)] flex flex-col gap-4">
        <div className="space-y-1.5">
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

        {/* Real URL Box and Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-cyan-900/60">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-950/70 border border-cyan-700/60 overflow-hidden flex-1">
            <span className="text-[11px] font-mono text-cyan-300 truncate select-all">
              {ANTENA_URL}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="ml-auto px-2.5 py-1 rounded-lg bg-cyan-900 hover:bg-cyan-800 text-amber-200 text-xs font-cinzel font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition"
              title="Copiar enlace"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
              <span>{copied ? copy.copiedBtn : copy.copyBtn}</span>
            </button>
          </div>

          <a
            href={ANTENA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 hover:from-cyan-300 hover:via-sky-400 hover:to-indigo-500 text-slate-950 font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase border border-cyan-200/90 shadow-[0_0_25px_rgba(34,211,238,0.5)] transition flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
          >
            <Antenna className="w-4 h-4" />
            <span>{copy.cta}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
