import React, { useState } from "react";
import { Hand, ExternalLink, Sparkles, Copy, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import type { SupportedLanguage } from "../types";
import quiroBgImg from "../assets/images/quirologia_hands_bg_1795565782727.jpg";

const QUIRO_URL = "https://ais-pre-ze5luqq3teeexqfxj2s7rp-172786148761.us-east1.run.app/";
const FALLBACK_BG_IMAGE = "/assets/aistudio/Screenshot_20261122_144850_Chrome_2f1f363b.jpg";

interface QuiroCopy {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  badge: string;
  copyBtn: string;
  copiedBtn: string;
}

const COPY: Record<SupportedLanguage, QuiroCopy> = {
  es: {
    eyebrow: "Quiromancia Astral • Lectura de Manos",
    title: "Tus manos hablan",
    description:
      "Descubre los secretos ocultos en las líneas de tus manos, montes planetarios y geometría astral. Explora el mapa de tu destino grabado en tus palmas.",
    cta: "Ingresar al Oráculo",
    badge: "Líneas Astrales Activas • Quiromancia",
    copyBtn: "Copiar Link",
    copiedBtn: "¡Copiado!",
  },
  en: {
    eyebrow: "Astral Palmistry • Hand Reading",
    title: "Your Hands Speak",
    description:
      "Discover the hidden secrets within the lines of your hands, planetary mounts, and astral geometry. Explore the map of your destiny written in your palms.",
    cta: "Enter Oracle",
    badge: "Astral Lines Active • Palmistry",
    copyBtn: "Copy Link",
    copiedBtn: "Copied!",
  },
  pt: {
    eyebrow: "Quiromancia Astral • Leitura de Mãos",
    title: "Suas mãos falam",
    description:
      "Descubra os segredos ocultos nas linhas de suas mãos, montes planetários e geometria astral. Explore o mapa do seu destino gravado em suas palmas.",
    cta: "Entrar no Oráculo",
    badge: "Linhas Astrais Ativas • Quiromancia",
    copyBtn: "Copiar Link",
    copiedBtn: "Copiado!",
  },
  fr: {
    eyebrow: "Chiromancie Astrale • Lecture des Mains",
    title: "Vos mains parlent",
    description:
      "Découvrez les secrets cachés dans les lignes de vos mains, monts planétaires et géométrie astrale. Explorez la carte de votre destin gravée dans vos paumes.",
    cta: "Entrer dans l'Oracle",
    badge: "Lignes Astrales Actives • Chiromancie",
    copyBtn: "Copier le Lien",
    copiedBtn: "Copié !",
  },
  it: {
    eyebrow: "Chiromanzia Astrale • Lettura della Mano",
    title: "Le tue mani parlano",
    description:
      "Scopri i segreti nascosti nelle linee delle tue mani, monti planetari e geometria astrale. Esplora la mappa del tuo destino scritta nei tuoi palmi.",
    cta: "Entra nell'Oracolo",
    badge: "Linee Astrali Attive • Chiromanzia",
    copyBtn: "Copia Link",
    copiedBtn: "Copiato!",
  },
  de: {
    eyebrow: "Astrale Handlesekunst • Handlesen",
    title: "Deine Hände sprechen",
    description:
      "Entdecke die verborgenen Geheimnisse in den Linien deiner Hände, Planetenberge und astralischen Geometrie. Erforsche die Karte deines Schicksals.",
    cta: "Orakel Betreten",
    badge: "Astrale Linien Aktiv • Handlesen",
    copyBtn: "Link Kopieren",
    copiedBtn: "Kopiert!",
  },
};

export const QuirologiaPanel: React.FC = () => {
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.es;
  const [imgSrc, setImgSrc] = useState<string>(quiroBgImg || FALLBACK_BG_IMAGE);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(QUIRO_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <section
      id="quirologia-section"
      aria-label={copy.title}
      className="w-full max-w-4xl rounded-3xl border-2 border-rose-400/60 shadow-[0_0_50px_rgba(244,63,94,0.28)] relative overflow-hidden min-h-[380px] sm:min-h-[460px] flex flex-col justify-between p-4 sm:p-7 group transition-all duration-300 my-4"
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
          alt="Tus manos hablan - Lectura de Manos"
          onError={() => setImgSrc(FALLBACK_BG_IMAGE)}
          className="w-full h-full object-cover object-[center_30%] filter brightness-95 contrast-105 saturate-110 transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Soft atmospheric gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060212]/95 via-[#060212]/30 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(244,63,94,0.22),transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.2),transparent_60%)] pointer-events-none" />
      </div>

      {/* Top Bar Badges */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-rose-400/60 text-xs font-cinzel font-semibold uppercase tracking-[0.18em] text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)] backdrop-blur-md">
          <Hand className="w-4 h-4 text-rose-300 animate-pulse" />
          <span>{copy.eyebrow}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-[11px] font-mono text-rose-200/90 shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block" />
          <span>{copy.badge}</span>
        </div>
      </div>

      {/* Center visual breathing space */}
      <div className="relative z-10 my-auto py-4 pointer-events-none flex justify-center items-center">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-rose-400/20 animate-ping opacity-25" />
      </div>

      {/* Bottom Floating Glass Card */}
      <div className="relative z-10 bg-black/85 sm:bg-black/80 border border-rose-500/60 rounded-2xl p-4 sm:p-6 backdrop-blur-lg shadow-[0_10px_35px_rgba(0,0,0,0.85)] flex flex-col gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-300" />
            <h3 className="font-cinzel font-bold text-lg sm:text-2xl text-rose-100 tracking-wide drop-shadow-md">
              {copy.title}
            </h3>
          </div>
          <p className="font-gothic text-xs sm:text-sm text-rose-100/90 leading-relaxed drop-shadow">
            {copy.description}
          </p>
        </div>

        {/* Real URL Box and Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-rose-900/60">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-950/70 border border-rose-700/60 overflow-hidden flex-1">
            <span className="text-[11px] font-mono text-rose-300 truncate select-all">
              {QUIRO_URL}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="ml-auto px-2.5 py-1 rounded-lg bg-rose-900 hover:bg-rose-800 text-amber-200 text-xs font-cinzel font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition"
              title="Copiar enlace"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
              <span>{copied ? copy.copiedBtn : copy.copyBtn}</span>
            </button>
          </div>

          <a
            href={QUIRO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-700 hover:from-rose-400 hover:via-pink-500 hover:to-rose-600 text-white font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase border border-rose-200/80 shadow-[0_0_25px_rgba(244,63,94,0.45)] transition flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
          >
            <Hand className="w-4 h-4 text-amber-300" />
            <span>{copy.cta}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
