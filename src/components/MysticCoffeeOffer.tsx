import React from "react";
import { Sparkles, ExternalLink, Lock } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { SupportedLanguage } from "../types";
import {
  useMonetizationConfig,
  getEffectiveMpUrl,
  getEffectiveKofiUrl,
  isConsultationPassUnlocked,
} from "../lib/monetization";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";

interface MysticCoffeeOfferProps {
  onOpenPaywall?: () => void;
}

const UNLOCK_CTA_LABEL: Record<SupportedLanguage, string> = {
  es: "Desbloquear Consultas",
  en: "Unlock Unlimited",
  pt: "Desbloquear Consultas",
  fr: "Débloquer l'Accès",
  it: "Sblocca Consulti",
  de: "Vollzugang Freischalten",
};

const KOFI_BTN_LABEL: Record<SupportedLanguage, string> = {
  es: "Ko-fi",
  en: "Support on Ko-fi",
  pt: "Apoiar no Ko-fi",
  fr: "Soutenir sur Ko-fi",
  it: "Sostieni su Ko-fi",
  de: "Auf Ko-fi unterstützen",
};

export const MysticCoffeeOffer: React.FC<MysticCoffeeOfferProps> = ({ onOpenPaywall }) => {
  const { t, language } = useLanguage();
  const cfg = useMonetizationConfig();

  const mpUrl = getEffectiveMpUrl(cfg, "tip");
  const kofiUrl = getEffectiveKofiUrl(cfg);
  const isSpanish = language === "es";
  const isUnlocked = isConsultationPassUnlocked(cfg);

  return (
    <div className="w-full max-w-3xl mx-auto my-4 relative overflow-hidden rounded-2xl border border-amber-500/35 bg-gradient-to-r from-[#170c26]/90 via-[#10061c]/95 to-[#0b0314]/90 p-3 sm:p-4 shadow-[0_0_20px_rgba(251,191,36,0.08)] backdrop-blur-md text-purple-100 transition-all duration-300 hover:border-amber-500/50">
      <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full bg-purple-600/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center space-x-3.5 flex-1 min-w-0">
          <div className="relative flex-shrink-0 animate-coffee-cup">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-7 pointer-events-none flex justify-center items-end space-x-1 z-20 overflow-visible">
              <span className="w-1 h-3.5 bg-gradient-to-t from-amber-300/80 via-amber-200/50 to-transparent rounded-full blur-[0.6px] animate-steam-1 inline-block" />
              <span className="w-1.5 h-5 bg-gradient-to-t from-amber-100/90 via-amber-300/60 to-transparent rounded-full blur-[0.6px] animate-steam-2 inline-block" />
              <span className="w-1 h-4 bg-gradient-to-t from-amber-300/80 via-amber-200/50 to-transparent rounded-full blur-[0.6px] animate-steam-3 inline-block" />
            </div>

            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-600/25 to-purple-950/85 border border-amber-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.3)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-amber-950/60 via-amber-600/10 to-transparent animate-coffee-shimmer pointer-events-none" />
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)] fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round transition-transform duration-300 group-hover:scale-110"
              >
                <path d="M6 2v2" className="animate-steam-1" />
                <path d="M10 1v3" className="animate-steam-2" />
                <path d="M14 2v2" className="animate-steam-3" />
                <path d="M18 8H4a2 2 0 0 0-2 2v6a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5v-6a2 2 0 0 0-2-2z" fill="rgba(251,191,36,0.15)" />
                <path d="M18 10h1a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h-1" />
                <line x1="2" y1="21" x2="18" y2="21" />
              </svg>
            </div>

            <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-purple-950 border border-amber-400/60 rounded-full text-amber-300">
              <Sparkles className="w-2.5 h-2.5 animate-spin-slow" />
            </div>
          </div>

          <div className="text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start space-x-1.5 mb-0.5">
              <h4 className="text-xs sm:text-sm font-bold font-cinzel text-amber-200 truncate">
                {t("coffeeOfferTitle")}
              </h4>
            </div>
            <p className="text-[11px] text-purple-300/80 font-gothic leading-tight line-clamp-2 sm:line-clamp-1">
              {t("coffeeOfferDesc")}
            </p>
          </div>
        </div>

        {/* Right: Mercado Pago + Ko-fi + Unlock Pass */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 flex-shrink-0">
          {!isSpanish && kofiUrl && (
            <a
              href={kofiUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic(HAPTIC_PATTERNS.click)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#ff5e5b] to-[#d9383a] hover:from-[#ff7370] hover:to-[#e64648] text-white font-cinzel font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
              title="Ko-fi"
            >
              <span>☕</span>
              <span>{KOFI_BTN_LABEL[language] || "Ko-fi"}</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          )}

          <a
            href={mpUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => triggerHaptic(HAPTIC_PATTERNS.click)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-purple-700 hover:from-amber-400 hover:to-purple-600 text-neutral-950 font-cinzel font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_14px_rgba(251,191,36,0.35)] hover:shadow-[0_0_20px_rgba(251,191,36,0.55)] flex items-center space-x-1.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            title={t("coffeeOfferBtn")}
          >
            <span className="text-sm">☕</span>
            <span>{t("coffeeOfferBtn")}</span>
            <ExternalLink className="w-3 h-3 text-neutral-950 ml-0.5" />
          </a>

          {isSpanish && kofiUrl && (
            <a
              href={kofiUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerHaptic(HAPTIC_PATTERNS.click)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#ff5e5b] to-[#d9383a] hover:from-[#ff7370] hover:to-[#e64648] text-white font-cinzel font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
              title="Ko-fi"
            >
              <span>☕</span>
              <span>Ko-fi</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          )}

          {cfg.paywallEnabled && !isUnlocked && onOpenPaywall && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(HAPTIC_PATTERNS.click);
                onOpenPaywall();
              }}
              className="px-3.5 py-2 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-amber-400/50 text-amber-200 font-cinzel font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap shadow-[0_0_12px_rgba(168,85,247,0.25)]"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>{UNLOCK_CTA_LABEL[language] || UNLOCK_CTA_LABEL.es}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
