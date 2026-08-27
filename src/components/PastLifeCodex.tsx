import React from "react";
import { PastLifeRevelation } from "../types";
import { BookOpen, Scroll, Trash2, ExternalLink } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

import pastLifeVisionImg from "../assets/images/past_life_vision_1787797379948.jpg";
import ancientSoulPortraitImg from "../assets/images/ancient_soul_portrait_1787797394501.jpg";
import mysticRelicVisionImg from "../assets/images/mystic_relic_vision_1787797407472.jpg";

interface PastLifeCodexProps {
  records: PastLifeRevelation[];
  onSelectRecord: (record: PastLifeRevelation) => void;
  onClearCodex: () => void;
}

export const PastLifeCodex: React.FC<PastLifeCodexProps> = ({
  records,
  onSelectRecord,
  onClearCodex,
}) => {
  const { t, language } = useLanguage();

  const resolveCodexThumbnail = (rec: PastLifeRevelation) => {
    if (rec.pastLifeDetails.imageUrl) return rec.pastLifeDetails.imageUrl;
    const text = `${rec.pastLifeDetails.title} ${rec.pastLifeDetails.identityRole} ${rec.pastLifeDetails.eraLocation}`.toLowerCase();
    if (text.includes("sacerdot") || text.includes("astrónom") || text.includes("reina") || text.includes("oráculo") || text.includes("sanador")) {
      return ancientSoulPortraitImg;
    }
    if (text.includes("viajer") || text.includes("guardián") || text.includes("cartógraf") || text.includes("explorad") || text.includes("navegant")) {
      return mysticRelicVisionImg;
    }
    return pastLifeVisionImg;
  };

  const locale = language === "en" ? "en-US" : language === "pt" ? "pt-BR" : language === "fr" ? "fr-FR" : language === "it" ? "it-IT" : language === "de" ? "de-DE" : "es-AR";

  if (records.length === 0) {
    return (
      <div className="w-full max-w-2xl bg-[#0f0918]/60 border border-purple-900/40 rounded-2xl p-6 text-center backdrop-blur-md">
        <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2 opacity-60" />
        <h3 className="font-cinzel font-semibold text-purple-300 text-sm">{t("codexEmpty")}</h3>
        <p className="font-gothic text-xs text-purple-300/70 mt-1">
          {t("codexEmptyDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-[#0f0918]/90 border border-purple-900/50 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-purple-900/50 pb-3">
        <div className="flex items-center space-x-2">
          <Scroll className="w-5 h-5 text-purple-400" />
          <h3 className="font-cinzel font-semibold text-purple-200 text-base sm:text-lg">
            {t("codexTitle")} ({records.length})
          </h3>
        </div>
        <button
          onClick={onClearCodex}
          className="text-xs text-purple-400/80 hover:text-red-400 font-cinzel flex items-center space-x-1 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t("clearCodex")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {records.map((rec) => {
          const auraColor = rec.pastLifeDetails.vibeColor || "#8b5cf6";
          const thumbImg = resolveCodexThumbnail(rec);
          return (
            <div
              key={rec.id}
              onClick={() => onSelectRecord(rec)}
              className="group relative bg-purple-950/30 hover:bg-purple-950/60 border rounded-xl p-3.5 cursor-pointer transition shadow-md overflow-hidden flex flex-col justify-between"
              style={{
                borderColor: `${auraColor}40`,
                boxShadow: `0 4px 12px ${auraColor}10`,
              }}
            >
              <div 
                className="absolute top-0 left-0 w-1 h-full rounded-l-xl transition-all group-hover:w-1.5"
                style={{ backgroundColor: auraColor }}
              />

              <div className="flex items-start space-x-3">
                {/* Thumbnail Visual */}
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-purple-800/60 shrink-0 relative bg-black">
                  <img
                    src={thumbImg}
                    alt={rec.pastLifeDetails.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-purple-400/80 uppercase tracking-widest flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ backgroundColor: auraColor, boxShadow: `0 0 6px ${auraColor}` }} />
                      <span>{new Date(rec.timestamp).toLocaleDateString(locale)}</span>
                    </span>
                  </div>
                  <h4 className="font-cinzel font-semibold text-purple-100 text-xs sm:text-sm group-hover:text-purple-300 transition truncate">
                    {rec.pastLifeDetails.title}
                  </h4>
                  <p className="font-gothic text-[11px] text-purple-300/80 italic mt-0.5 truncate">
                    {rec.pastLifeDetails.eraLocation}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-purple-900/40 flex items-center justify-between text-xs text-purple-200/80 font-gothic">
                <span className="truncate max-w-[180px]">{rec.pastLifeDetails.identityRole}</span>
                <div className="flex items-center space-x-1 text-purple-400 group-hover:text-purple-200 transition">
                  <span className="text-[10px] font-cinzel">{t("codexView")}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
