import React, { useState, useEffect } from "react";
import { PastLifeDetails } from "../types";
import { BookOpen, Scroll, Shield, Key, Volume2, VolumeX, X, Sparkles, Maximize2, Eye } from "lucide-react";
import { audio } from "../lib/audio";
import { useLanguage } from "../context/LanguageContext";

import pastLifeVisionImg from "../assets/images/past_life_vision_1787797379948.jpg";
import ancientSoulPortraitImg from "../assets/images/ancient_soul_portrait_1787797394501.jpg";
import mysticRelicVisionImg from "../assets/images/mystic_relic_vision_1787797407472.jpg";

interface PastLifeModalProps {
  details: PastLifeDetails;
  seekerName: string;
  onClose: () => void;
  onSaveToCodex: () => void;
  isSaved?: boolean;
}

export const PastLifeModal: React.FC<PastLifeModalProps> = ({
  details,
  seekerName,
  onClose,
  onSaveToCodex,
  isSaved = false,
}) => {
  const { t, language } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  useEffect(() => {
    const speechText = `${details.title}. ${details.eraLocation}. ${details.identityRole}. ${details.narrative}`;
    setIsSpeaking(true);
    audio.speakSpiritText(
      speechText,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      language
    );

    return () => {
      audio.stopSpeech();
    };
  }, [details, seekerName, language]);

  const toggleSpeech = () => {
    if (isSpeaking) {
      audio.stopSpeech();
      setIsSpeaking(false);
    } else {
      const speechText = `${details.title}. ${details.eraLocation}. ${details.identityRole}. ${details.narrative}`;
      setIsSpeaking(true);
      audio.speakSpiritText(
        speechText,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        language
      );
    }
  };

  const auraColor = details.vibeColor || "#8b5cf6";

  const resolveArtwork = () => {
    if (details.imageUrl) return details.imageUrl;
    const text = `${details.title} ${details.identityRole} ${details.eraLocation} ${details.narrative}`.toLowerCase();
    
    if (
      text.includes("sacerdot") ||
      text.includes("astrónom") ||
      text.includes("astronom") ||
      text.includes("sanador") ||
      text.includes("reina") ||
      text.includes("oráculo") ||
      text.includes("oraculo") ||
      text.includes("chamán") ||
      text.includes("chaman") ||
      text.includes("místic")
    ) {
      return ancientSoulPortraitImg;
    }

    if (
      text.includes("viajer") ||
      text.includes("guardián") ||
      text.includes("guardian") ||
      text.includes("cartógraf") ||
      text.includes("cartograf") ||
      text.includes("explorad") ||
      text.includes("navegant") ||
      text.includes("guerrer") ||
      text.includes("caballer")
    ) {
      return mysticRelicVisionImg;
    }

    return pastLifeVisionImg;
  };

  const selectedArtwork = resolveArtwork();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Outer Subtle Soul Aura Background Glow */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000 opacity-30 filter blur-3xl animate-pulse"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${auraColor} 0%, transparent 65%)`,
          animationDuration: "5s",
        }}
      />

      {/* Cosmic Modal Box Container */}
      <div 
        className="relative w-full max-w-2xl bg-[#0e0a18]/95 border rounded-2xl p-5 sm:p-7 text-purple-100 my-8 overflow-hidden transition-all duration-700 z-10 backdrop-blur-xl"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, #1e1233 0%, #080410 100%)`,
          borderColor: `${auraColor}88`,
          boxShadow: `0 0 70px ${auraColor}30, inset 0 0 40px ${auraColor}15`,
        }}
      >
        {/* Inner Radial Ambient Soul Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none opacity-25 filter blur-3xl transition-colors duration-1000"
          style={{ backgroundColor: auraColor }}
        />

        {/* Header Action Controls */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
          {/* Voice Speech Control */}
          <button
            onClick={toggleSpeech}
            title={isSpeaking ? "Silenciar Voz" : "Escuchar Lectura Akáshica"}
            className={`p-2 rounded-full border transition flex items-center justify-center cursor-pointer ${
              isSpeaking
                ? "bg-purple-900 border-purple-400 text-purple-100 animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                : "bg-purple-950/80 border-purple-800 text-purple-300 hover:text-purple-100 hover:bg-purple-900"
            }`}
          >
            {isSpeaking ? <Volume2 className="w-5 h-5 text-purple-200 animate-bounce" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Close Button */}
          <button
            onClick={() => {
              audio.stopSpeech();
              onClose();
            }}
            className="p-2 rounded-full bg-purple-950/60 text-purple-300 hover:text-purple-100 hover:bg-purple-900/80 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Header */}
        <div className="flex flex-col items-center text-center mb-5 z-10 relative">
          <div className="text-xs font-gothic text-purple-300 font-medium mb-1 tracking-wide">
            {t("pastLifeModalReadingFor")} {seekerName || "Buscador"}
          </div>

          <h2 className="text-2xl sm:text-3xl font-decorative font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-indigo-200 to-purple-300">
            {details.title}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-purple-950/60 border border-purple-800/50 rounded-full text-xs font-cinzel text-purple-200 font-semibold">
              <Scroll className="w-3.5 h-3.5 text-purple-400" />
              <span>{details.eraLocation}</span>
            </div>

            {/* Soul Aura Color Pill Badge */}
            <div
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-cinzel font-semibold border shadow-sm transition-all"
              style={{
                backgroundColor: `${auraColor}25`,
                borderColor: `${auraColor}88`,
                color: '#f3e8ff',
              }}
            >
              <div className="relative flex items-center justify-center w-2.5 h-2.5">
                <span className="absolute w-2.5 h-2.5 rounded-full animate-ping opacity-75" style={{ backgroundColor: auraColor }} />
                <span className="relative w-2.5 h-2.5 rounded-full" style={{ backgroundColor: auraColor, boxShadow: `0 0 8px ${auraColor}` }} />
              </div>
              <span>{t("pastLifeModalSoulAura")}</span>
            </div>
          </div>
        </div>

        {/* Mystical Visual Representation of the Past Life */}
        <div className="relative mb-5 rounded-2xl overflow-hidden border border-purple-500/40 group shadow-[0_0_30px_rgba(139,92,246,0.25)] bg-[#07030d]">
          <div className="relative aspect-video sm:h-56 w-full overflow-hidden">
            <img
              src={selectedArtwork}
              alt={`Representación visual de la encarnación: ${details.title}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 brightness-95 contrast-105"
            />
            {/* Ethereal Glow & Gradient Vignette Overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0e0a18] via-transparent to-black/40 pointer-events-none"
              style={{
                background: `linear-gradient(to top, #0e0a18 0%, rgba(14, 10, 24, 0.4) 40%, transparent 70%), radial-gradient(circle at 50% 50%, transparent 60%, ${auraColor}33 100%)`
              }}
            />

            {/* Top Vision Badge */}
            <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/75 border border-purple-400/50 backdrop-blur-md text-[11px] font-cinzel font-semibold text-purple-200 shadow-md">
              <Sparkles className="w-3 h-3 text-purple-300 animate-spin-slow" />
              <span>{t("pastLifeModalVision")}</span>
            </div>

            {/* Expand / Lightbox Trigger Button */}
            <button
              onClick={() => setIsImageZoomed(true)}
              title="Expandir retrato visual en alta resolución"
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/75 border border-purple-500/50 text-purple-200 hover:text-white hover:bg-purple-900/80 transition backdrop-blur-md cursor-pointer shadow-md"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Bottom In-Image Legend */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-purple-200/90 font-gothic pointer-events-none drop-shadow">
              <span className="truncate pr-2 font-medium">
                {details.identityRole} • {details.eraLocation}
              </span>
              <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] text-purple-300/80 font-cinzel">
                <Eye className="w-3 h-3 text-purple-400" />
                <span>Memoria Akáshica</span>
              </span>
            </div>
          </div>
        </div>

        {/* Voice Indicator Banner */}
        <div className="mb-4 flex items-center justify-center">
          <button
            onClick={toggleSpeech}
            className="px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-700/50 text-xs font-gothic text-purple-200 flex items-center space-x-2 hover:bg-purple-900/90 transition cursor-pointer shadow"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "text-purple-300 animate-bounce" : "text-purple-400"}`} />
            <span>{isSpeaking ? "Pausar narración" : t("pastLifeModalListen")}</span>
          </button>
        </div>

        {/* Identity & Narrative Grid */}
        <div className="space-y-4 font-gothic text-sm sm:text-base leading-relaxed">
          {/* Identity & Role */}
          <div className="bg-purple-950/40 border-l-4 border-purple-500 p-3.5 sm:p-4 rounded-r-xl">
            <div className="text-xs font-cinzel font-semibold text-purple-300 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>{t("pastLifeModalIdentity")}</span>
            </div>
            <p className="text-purple-100 font-semibold font-gothic text-base sm:text-lg">{details.identityRole}</p>
          </div>

          {/* Narrative Chronicle */}
          <div className="bg-[#080410]/80 border border-purple-900/50 p-4 sm:p-5 rounded-xl shadow-inner">
            <div className="text-xs font-cinzel font-semibold text-purple-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>{t("pastLifeModalChronicle")}</span>
            </div>
            <p className="text-purple-100/90 text-sm sm:text-base leading-relaxed whitespace-pre-line font-gothic">
              {details.narrative}
            </p>
          </div>

          {/* Transition & Karma Split Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Death / Transition */}
            <div className="bg-purple-950/30 border border-purple-900/40 p-3.5 rounded-xl">
              <div className="text-xs font-cinzel font-semibold text-purple-300 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                <span>{t("pastLifeModalTransition")}</span>
              </div>
              <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-gothic">{details.deathTransition}</p>
            </div>

            {/* Karmic Lesson */}
            <div className="bg-purple-950/30 border border-purple-900/40 p-3.5 rounded-xl">
              <div className="text-xs font-cinzel font-semibold text-purple-300 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>{t("pastLifeModalKarma")}</span>
              </div>
              <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-gothic">{details.karmicLesson}</p>
            </div>
          </div>

          {/* Soul Relic & Connections */}
          <div className="p-3.5 bg-gradient-to-r from-purple-950/80 via-indigo-950/40 to-purple-950/80 border border-purple-700/50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-900/80 border border-purple-500 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-purple-200 font-cinzel">OA</span>
              </div>
              <div>
                <div className="text-[11px] font-cinzel font-semibold text-purple-300 uppercase tracking-wider">
                  {t("pastLifeModalRelic")}
                </div>
                <div className="text-xs sm:text-sm text-purple-100 font-semibold font-gothic">{details.soulRelic}</div>
              </div>
            </div>

            <div className="text-xs text-purple-200/90 italic font-gothic border-t sm:border-t-0 sm:border-l border-purple-800/60 pt-2 sm:pt-0 sm:pl-3">
              {details.soulConnection}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-purple-900/50">
          <button
            onClick={onSaveToCodex}
            disabled={isSaved}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-cinzel text-xs font-semibold tracking-wide uppercase flex items-center justify-center space-x-2 transition ${
              isSaved
                ? "bg-purple-950/50 text-purple-400 border border-purple-900/60 cursor-default"
                : "bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white border border-purple-400/40 shadow-lg cursor-pointer"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isSaved ? t("pastLifeModalSaved") : t("pastLifeModalSaveCodex")}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-cinzel text-xs font-semibold tracking-wide uppercase bg-neutral-900 hover:bg-neutral-800 text-purple-200 border border-purple-800/50 transition cursor-pointer"
          >
            {t("pastLifeModalClose")}
          </button>
        </div>
      </div>

      {/* Expanded Lightbox Modal for High-Res Visual Inspection */}
      {isImageZoomed && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in cursor-zoom-out"
          onClick={() => setIsImageZoomed(false)}
        >
          <div 
            className="relative max-w-4xl w-full bg-[#0c0816] border border-purple-500/60 rounded-2xl p-4 sm:p-6 shadow-[0_0_80px_rgba(168,85,247,0.4)] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
              <div>
                <h3 className="font-cinzel text-base sm:text-lg font-bold text-purple-100 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>{details.title}</span>
                </h3>
                <p className="text-xs font-gothic text-purple-300/80">
                  {details.identityRole} • {details.eraLocation}
                </p>
              </div>
              <button
                onClick={() => setIsImageZoomed(false)}
                className="p-2 rounded-full bg-purple-950 text-purple-300 hover:text-white hover:bg-purple-900 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-purple-800/60 shadow-2xl max-h-[70vh] flex items-center justify-center bg-black">
              <img
                src={selectedArtwork}
                alt={details.title}
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
