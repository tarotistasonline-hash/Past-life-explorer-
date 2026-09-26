import React, { useState } from "react";
import { PastLifeDetails } from "../types";
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  MessageCircle,
  Send,
  ExternalLink,
  Layers,
  Link2,
} from "lucide-react";
import { CrystalBallLoader } from "./CrystalBallLoader";
import { useLanguage } from "../context/LanguageContext";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";
import { getPublicPortalUrl } from "../lib/constants";
import {
  shareImageFile,
  copyImageToClipboard,
  copyMysticShareText,
  canShareFiles,
} from "../lib/parchmentExport";

interface PastLifeShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: PastLifeDetails;
  seekerName: string;
  imageDataUrl: string | null;
  imageBlob: Blob | null;
  isGenerating: boolean;
  onDownload: () => void;
}

export const PastLifeShareModal: React.FC<PastLifeShareModalProps> = ({
  isOpen,
  onClose,
  details,
  seekerName,
  imageDataUrl,
  imageBlob,
  isGenerating,
  onDownload,
}) => {
  const { t, language } = useLanguage();
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isSharingNative, setIsSharingNative] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const auraColor = details.vibeColor || "#a855f7";
  const portalUrl = getPublicPortalUrl();
  const sanitizedTitle = details.title || "Revelación Akáshica";
  const shareFilename = `revelacion-${(seekerName || "alma").toLowerCase().replace(/\s+/g, "_")}-${Date.now()}.png`;

  const shareSummaryText = `📜 ✧ Revelación de Vida Pasada en el Oráculo Astral ✧ 📜\n🔮 Consultante: ${
    seekerName || "Alma Buscadora"
  }\n✨ Encarnación: ${details.title}\n🛡️ Rol: ${details.identityRole} (${details.eraLocation})\n🗝️ Lección Kármica: ${
    details.karmicLesson
  }\n🏺 Reliquia: ${details.soulRelic}\n\nDescubre tu vida pasada aquí: ${portalUrl}`;

  const showTemporaryFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3500);
  };

  const handleNativeShare = async () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    if (!imageBlob) {
      onDownload();
      return;
    }

    setIsSharingNative(true);
    try {
      const shared = await shareImageFile({
        blob: imageBlob,
        filename: shareFilename,
        title: `Vida Pasada de ${seekerName || "Alma"}: ${details.title}`,
        text: `Descubre tu vida pasada en el Oráculo Akáshico: ${details.title} - ${details.identityRole}`,
        url: portalUrl,
      });

      if (!shared) {
        // Fallback for browsers without direct file sharing
        onDownload();
        await copyMysticShareText({
          title: details.title,
          seekerName: seekerName || "Buscador",
          bodyText: `📜 *Era & Lugar:* ${details.eraLocation}\n🛡️ *Rol:* ${details.identityRole}\n\n📖 *Crónica:* ${details.narrative}`,
          karmicLesson: details.karmicLesson,
          relic: details.soulRelic,
          type: "PAST_LIFE",
        });
        showTemporaryFeedback(t("pastLifeModalShareTip"));
      }
    } finally {
      setIsSharingNative(false);
    }
  };

  const handleCopyImage = async () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    if (!imageBlob) return;

    const ok = await copyImageToClipboard(imageBlob);
    if (ok) {
      setCopiedImage(true);
      showTemporaryFeedback(t("pastLifeModalImageCopied"));
      setTimeout(() => setCopiedImage(false), 3000);
    } else {
      // If direct image copying is restricted by browser security, download and copy caption
      onDownload();
      showTemporaryFeedback(t("pastLifeModalDownloadImage"));
    }
  };

  const handleCopyText = async () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    const ok = await copyMysticShareText({
      title: details.title,
      seekerName: seekerName || "Buscador",
      bodyText: `📜 *Era & Lugar:* ${details.eraLocation}\n🛡️ *Rol:* ${details.identityRole}\n\n📖 *Crónica:* ${details.narrative}\n\n🕊️ *Transición:* ${details.deathTransition}`,
      karmicLesson: details.karmicLesson,
      relic: details.soulRelic,
      type: "PAST_LIFE",
    });

    if (ok) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    }
  };

  const shareToWhatsApp = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareSummaryText)}`;
    window.open(url, "_blank");
  };

  const shareToTwitter = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    const tweet = `🔮 Los Registros Akáshicos han revelado mi vida pasada: "${details.title}" (${details.identityRole}). Descubre la tuya:`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(portalUrl)}`;
    window.open(url, "_blank");
  };

  const shareToFacebook = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(portalUrl)}`;
    window.open(url, "_blank");
  };

  const shareToTelegram = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    const url = `https://t.me/share/url?url=${encodeURIComponent(portalUrl)}&text=${encodeURIComponent(shareSummaryText)}`;
    window.open(url, "_blank");
  };

  const supportsFileShare = canShareFiles();

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-[#0d0818]/95 border rounded-2xl p-5 sm:p-6 text-purple-100 shadow-[0_0_80px_rgba(168,85,247,0.35)] my-6 overflow-hidden transition-all backdrop-blur-2xl"
        style={{
          borderColor: `${auraColor}99`,
        }}
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: auraColor }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-3.5 mb-4 relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-700/60 text-purple-200">
              <Share2 className="w-5 h-5 text-purple-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-indigo-100 to-amber-200">
                {t("pastLifeModalShareImageTitle")}
              </h3>
              <p className="text-xs font-gothic text-purple-300/80">
                {details.title} • {seekerName || "Alma"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-purple-950/60 text-purple-300 hover:text-white hover:bg-purple-900 transition cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview & Generation State */}
        <div className="relative mb-4 bg-black/60 rounded-xl border border-purple-900/50 p-2 overflow-hidden flex flex-col items-center justify-center min-h-[180px] max-h-[44vh]">
          {isGenerating ? (
            <CrystalBallLoader
              variant="full"
              size="sm"
              text={t("pastLifeModalGeneratingImage") || "Conjurando papiro sagrado..."}
              subtext="Inscribiendo las visiones y memorias del alma..."
            />
          ) : imageDataUrl ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-auto max-h-[42vh] rounded-lg">
              <img
                src={imageDataUrl}
                alt={`Papiro de Vida Pasada: ${sanitizedTitle}`}
                className="max-h-[40vh] w-auto object-contain rounded-lg border border-purple-800/40 shadow-xl"
              />
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-md rounded-md text-[10px] font-cinzel text-purple-200 flex items-center space-x-1 border border-purple-700/40">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>HD Social Card</span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-purple-300 font-cinzel">
              <Layers className="w-8 h-8 text-purple-500 mx-auto mb-2 opacity-60" />
              <span>Preparando imagen del papiro para exportar...</span>
            </div>
          )}
        </div>

        {/* Temporary Feedback Notification */}
        {feedbackMsg && (
          <div className="mb-3 p-2.5 bg-purple-950/90 border border-purple-500/60 rounded-xl text-xs text-purple-100 font-gothic text-center animate-fade-in shadow-md flex items-center justify-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="space-y-2.5 relative z-10 mb-4">
          {/* Main Native Share Button */}
          <button
            onClick={handleNativeShare}
            disabled={isGenerating || isSharingNative}
            className="w-full py-3 px-4 rounded-xl font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:via-indigo-500 hover:to-purple-700 text-white border border-purple-400/50 shadow-[0_0_25px_rgba(168,85,247,0.4)] flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
          >
            {isSharingNative ? (
              <CrystalBallLoader variant="inline" className="mr-1.5" />
            ) : (
              <Share2 className="w-4 h-4 text-purple-100" />
            )}
            <span>
              {supportsFileShare ? t("pastLifeModalNativeShare") : t("pastLifeModalNativeShare")}
            </span>
          </button>

          {/* Secondary Actions Row */}
          <div className="grid grid-cols-3 gap-2">
            {/* Download Image */}
            <button
              onClick={() => {
                triggerHaptic(HAPTIC_PATTERNS.click);
                onDownload();
              }}
              disabled={isGenerating}
              className="py-2.5 px-2 rounded-xl font-cinzel text-[11px] sm:text-xs font-semibold bg-purple-950/70 hover:bg-purple-900 border border-purple-700/60 text-purple-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 transition cursor-pointer shadow-sm text-center"
              title="Descargar imagen en alta resolución"
            >
              <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Descargar PNG</span>
            </button>

            {/* Copy Image to Clipboard */}
            <button
              onClick={handleCopyImage}
              disabled={isGenerating}
              className="py-2.5 px-2 rounded-xl font-cinzel text-[11px] sm:text-xs font-semibold bg-purple-950/70 hover:bg-purple-900 border border-purple-700/60 text-purple-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 transition cursor-pointer shadow-sm text-center"
              title="Copiar imagen al portapapeles para pegar en Instagram/WhatsApp/Twitter"
            >
              {copiedImage ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-purple-300 shrink-0" />
              )}
              <span className="truncate">{copiedImage ? "¡Copiada!" : "Copiar Imagen"}</span>
            </button>

            {/* Copy Mystic Text */}
            <button
              onClick={handleCopyText}
              disabled={isGenerating}
              className="py-2.5 px-2 rounded-xl font-cinzel text-[11px] sm:text-xs font-semibold bg-purple-950/70 hover:bg-purple-900 border border-purple-700/60 text-purple-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 transition cursor-pointer shadow-sm text-center"
              title="Copiar texto místico formateado"
            >
              {copiedText ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              )}
              <span className="truncate">{copiedText ? "¡Copiado!" : "Copiar Texto"}</span>
            </button>
          </div>
        </div>

        {/* 1-Click Direct Social Links */}
        <div className="pt-3 border-t border-purple-900/50 mb-3">
          <div className="text-[11px] font-cinzel text-purple-300/80 mb-2 text-center uppercase tracking-wider">
            Compartir Directo en Redes
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <button
              onClick={shareToWhatsApp}
              className="py-2 px-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/40 text-emerald-200 text-xs font-cinzel flex items-center justify-center space-x-1 transition cursor-pointer"
              title="WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px]">WhatsApp</span>
            </button>

            <button
              onClick={shareToTwitter}
              className="py-2 px-1 rounded-lg bg-sky-950/40 hover:bg-sky-900/60 border border-sky-700/40 text-sky-200 text-xs font-cinzel flex items-center justify-center space-x-1 transition cursor-pointer"
              title="X / Twitter"
            >
              <span className="text-xs font-bold font-sans">𝕏</span>
              <span className="text-[11px]">Twitter</span>
            </button>

            <button
              onClick={shareToFacebook}
              className="py-2 px-1 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-700/40 text-blue-200 text-xs font-cinzel flex items-center justify-center space-x-1 transition cursor-pointer"
              title="Facebook"
            >
              <span className="text-xs font-bold font-sans">f</span>
              <span className="text-[11px]">Facebook</span>
            </button>

            <button
              onClick={shareToTelegram}
              className="py-2 px-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-700/40 text-cyan-200 text-xs font-cinzel flex items-center justify-center space-x-1 transition cursor-pointer"
              title="Telegram"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px]">Telegram</span>
            </button>
          </div>

          {/* Official Link to Share and Index */}
          <div className="bg-purple-950/60 border border-purple-800/60 rounded-xl p-3 space-y-1.5 text-left">
            <div className="flex items-center justify-between text-[11px] font-cinzel text-amber-300">
              <span className="flex items-center space-x-1.5 font-bold">
                <Link2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Enlace Oficial del Portal:</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(HAPTIC_PATTERNS.click);
                  navigator.clipboard.writeText(portalUrl);
                  showTemporaryFeedback("¡Enlace oficial copiado al portapapeles!");
                }}
                className="text-[10px] px-2.5 py-1 rounded bg-purple-900/90 hover:bg-purple-800 text-purple-100 border border-purple-600/60 transition cursor-pointer font-cinzel font-semibold"
              >
                Copiar Enlace
              </button>
            </div>
            <div className="text-[11px] font-mono text-purple-200/90 break-all select-all bg-black/50 p-2 rounded-lg border border-purple-900/60">
              {portalUrl}
            </div>
          </div>
        </div>

        {/* Helpful Tip Footer */}
        <div className="bg-purple-950/30 border border-purple-900/40 rounded-xl p-2.5 text-[11px] font-gothic text-purple-300/80 text-center leading-relaxed">
          <p>{t("pastLifeModalShareTip")}</p>
        </div>
      </div>
    </div>
  );
};
