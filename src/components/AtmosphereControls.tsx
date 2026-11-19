import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Moon, HelpCircle, X, Eye, Sparkles, Shield, ShieldCheck, Maximize2, Minimize2, BookOpen, Music, Mail, Trash2 } from "lucide-react";
import { audio } from "../lib/audio";
import { VisitsStats } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSelector } from "./LanguageSelector";
import { MoonPhaseWidget } from "./MoonPhaseWidget";
import { isAdminSession, setAdminSession, isAuthorizedAdmin } from "../lib/adminTracking";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";
import { clearAllGrimorio } from "../lib/grimorioStorage";
import { AdminConfigModal } from "./AdminConfigModal";
import { AdminUnlockModal } from "./AdminUnlockModal";
import { FeedbackModal } from "./FeedbackModal";

interface AtmosphereControlsProps {
  fogOn: boolean;
  setFogOn: (on: boolean) => void;
  onOpenGrimorio?: () => void;
  visitsStats: VisitsStats | null;
}

export const AtmosphereControls: React.FC<AtmosphereControlsProps> = ({
  fogOn,
  setFogOn,
  onOpenGrimorio,
  visitsStats,
}) => {
  const { t, language } = useLanguage();
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isDroneActive, setIsDroneActive] = useState<boolean>(() => audio.getIsDroneRunning());
  const [showGuide, setShowGuide] = useState(false);
  const [showVisitsModal, setShowVisitsModal] = useState(false);
  const [showAdminConfigModal, setShowAdminConfigModal] = useState(false);
  const [showAdminUnlockModal, setShowAdminUnlockModal] = useState(false);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(() => isAuthorizedAdmin());
  const [isCreatorMode, setIsCreatorMode] = useState<boolean>(() => isAdminSession());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [isSpeakingVoice, setIsSpeakingVoice] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [historyClearedBanner, setHistoryClearedBanner] = useState(false);

  useEffect(() => {
    const handleDroneChange = (e: any) => {
      if (e?.detail?.isDroneRunning !== undefined) {
        setIsDroneActive(e.detail.isDroneRunning);
      }
    };
    window.addEventListener("ouija-drone-change", handleDroneChange);
    return () => window.removeEventListener("ouija-drone-change", handleDroneChange);
  }, []);

  useEffect(() => {
    const handleVoiceState = (e: any) => {
      if (e?.detail?.isSpeaking !== undefined) {
        setIsSpeakingVoice(e.detail.isSpeaking);
      }
    };
    window.addEventListener("ouija_voice_state", handleVoiceState);
    return () => window.removeEventListener("ouija_voice_state", handleVoiceState);
  }, []);

  const toggleWelcomeVoice = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    if (isSpeakingVoice) {
      audio.stopSpeech();
      setIsSpeakingVoice(false);
    } else {
      audio.initContext();
      audio.playWelcomeSpeech(language, true);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleAuthChange = (e: any) => {
      setIsAdminAuthorized(isAuthorizedAdmin());
    };
    window.addEventListener("ouija-admin-auth-change", handleAuthChange);
    return () => window.removeEventListener("ouija-admin-auth-change", handleAuthChange);
  }, []);

  useEffect(() => {
    const handleCreatorModeChange = (e: any) => {
      if (e?.detail?.isAdmin !== undefined) {
        setIsCreatorMode(e.detail.isAdmin);
      } else {
        setIsCreatorMode(isAdminSession());
      }
    };

    window.addEventListener("ouija-creator-mode-change", handleCreatorModeChange);
    return () => window.removeEventListener("ouija-creator-mode-change", handleCreatorModeChange);
  }, []);

  const handleToggleCreatorMode = () => {
    const nextVal = !isCreatorMode;
    setIsCreatorMode(nextVal);
    setAdminSession(nextVal);
  };

  const handleLogoClick = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    if (isAdminAuthorized) {
      setShowAdminConfigModal(true);
    } else {
      setShowAdminUnlockModal(true);
    }
  };

  const toggleSound = () => {
    const nextState = !isAudioMuted;
    setIsAudioMuted(nextState);
    audio.setMuted(nextState);
  };

  const toggleDrone = () => {
    const active = audio.toggleDrone();
    setIsDroneActive(active);
  };

  const locale = language === "en" ? "en-US" : language === "pt" ? "pt-BR" : language === "fr" ? "fr-FR" : language === "it" ? "it-IT" : language === "de" ? "de-DE" : "es-AR";

  const totalVisitsVal = visitsStats?.totalVisits ?? 0;
  const formattedVisits = totalVisitsVal.toLocaleString(locale);
  const onlineVisitorsVal = visitsStats?.onlineVisitors ?? 0;
  const formattedOnline = onlineVisitorsVal.toLocaleString(locale);

  return (
    <>
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-3 bg-[#0c0816]/90 border border-purple-900/50 rounded-2xl backdrop-blur-md mb-4 shadow-2xl text-purple-200">
        {/* Title / Logo */}
        <div className="flex items-center space-x-3">
          <div 
            onClick={handleLogoClick}
            title="Tabla Ouija - Registros Akáshicos"
            className="w-8 h-8 rounded-full bg-purple-950/90 border border-purple-500/60 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.3)] shrink-0 cursor-pointer hover:border-amber-400 transition animate-mystic-float"
          >
            <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-amber-200 to-purple-200 animate-spectral-shimmer font-cinzel">RA</span>
          </div>
          <div>
            <h1 className="font-decorative font-bold text-xs sm:text-sm md:text-base text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-100 to-fuchsia-300 animate-spectral-shimmer tracking-wide drop-shadow-[0_0_12px_rgba(192,132,252,0.28)]">
              {t("appTitle")}
            </h1>
            <p className="text-[10px] text-purple-300/85 font-gothic font-medium hidden sm:block tracking-widest uppercase animate-rune-breath">
              {t("appSubtitle")}
            </p>
          </div>
        </div>

        {/* Live Visitor Counter Badge & Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-gothic">
          {/* Visitor Counter Badge */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(HAPTIC_PATTERNS.click);
              setShowVisitsModal(true);
            }}
            title={t("realVisitsTitle")}
            className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/70 border border-purple-600/40 hover:border-purple-400/60 text-purple-200 text-xs font-gothic shadow-[0_0_12px_rgba(147,51,234,0.25)] transition cursor-pointer select-none"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Eye className="w-3.5 h-3.5 text-purple-300" />
            <span className="font-cinzel font-semibold text-purple-100">{formattedVisits}</span>
            <span className="hidden md:inline text-[11px] text-purple-300/80">{t("realVisits")}</span>
            <span className="text-purple-500/70">·</span>
            <span className="font-cinzel font-bold text-emerald-300">{formattedOnline}</span>
            <span className="hidden sm:inline text-[11px] text-emerald-300/90">{t("onlineNowLabel")}</span>
          </button>

          {/* Language Selector Dropdown */}
          <LanguageSelector />

          {/* Moon Phase Real-time Widget */}
          <MoonPhaseWidget />

          {/* Grimorio Personal / Ecos del Alma Trigger */}
          {onOpenGrimorio && (
            <button
              onClick={onOpenGrimorio}
              title="Abrir Grimorio Personal (Lecturas Guardadas)"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-purple-700/60 bg-purple-950/70 hover:bg-purple-900 text-purple-200 flex items-center space-x-1.5 transition cursor-pointer shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden lg:inline text-[11px] font-cinzel font-semibold">Grimorio</span>
            </button>
          )}

          {/* Audio Soft Ambient Music */}
          <button
            onClick={toggleDrone}
            title={t("etherealMusic")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition cursor-pointer ${
              isDroneActive
                ? "bg-purple-900/60 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.45)]"
                : "bg-neutral-900/80 border-purple-900/40 text-neutral-400 hover:text-purple-200"
            }`}
          >
            <Music className={`w-3.5 h-3.5 ${isDroneActive ? "text-amber-300 animate-pulse" : "text-purple-400"}`} />
            <span className="hidden md:inline font-medium">{t("etherealMusic")}</span>
          </button>

          {/* Welcome Voice (Voz) Button */}
          <button
            onClick={toggleWelcomeVoice}
            title={isSpeakingVoice ? "Silenciar Voz" : "Escuchar Voz de Bienvenida"}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition cursor-pointer ${
              isSpeakingVoice
                ? "bg-amber-950/80 border-amber-400 text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.5)] animate-pulse"
                : "bg-purple-950/70 hover:bg-purple-900 border-purple-700/60 text-purple-200 hover:text-amber-300"
            }`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeakingVoice ? "text-amber-300 animate-bounce" : "text-purple-300"}`} />
            <span className="text-[11px] font-cinzel font-semibold hidden md:inline">
              {isSpeakingVoice ? "Silenciar" : "Voz"}
            </span>
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            title="Audio FX"
            className={`p-2 rounded-xl border flex items-center transition cursor-pointer ${
              !isAudioMuted
                ? "bg-purple-950/60 border-purple-800 text-purple-300"
                : "bg-neutral-900 border-neutral-800 text-neutral-500"
            }`}
          >
            {!isAudioMuted ? <Volume2 className="w-4 h-4 text-purple-300" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen / Ambient Ritual Mode */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Salir de Pantalla Completa" : "Modo Ritual / Pantalla Completa"}
            className="p-2 rounded-xl border border-purple-800/60 bg-purple-950/50 hover:bg-purple-900 text-purple-300 flex items-center transition cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-300" /> : <Maximize2 className="w-4 h-4 text-purple-300" />}
          </button>

          {/* Fog Toggle */}
          <button
            onClick={() => setFogOn(!fogOn)}
            title={t("mysticFog")}
            className={`p-2 rounded-xl border flex items-center transition cursor-pointer ${
              fogOn
                ? "bg-purple-950/60 border-purple-600 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                : "bg-neutral-900 border-neutral-800 text-neutral-500"
            }`}
          >
            <Moon className="w-4 h-4 text-purple-300" />
          </button>

          {/* Guide Modal Trigger */}
          <button
            onClick={() => setShowGuide(true)}
            className="p-2 sm:px-3 sm:py-1.5 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 rounded-xl text-purple-200 font-medium flex items-center space-x-1 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-purple-300" />
            <span className="hidden sm:inline">{t("guideBtn")}</span>
          </button>

          {/* Feedback / Message Mailbox Trigger */}
          <button
            onClick={() => setShowFeedbackModal(true)}
            title="Buzón de Mensajes, Opiniones y Sugerencias"
            className="p-2 sm:px-3 sm:py-1.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/50 rounded-xl text-amber-200 font-medium flex items-center space-x-1 transition cursor-pointer"
          >
            <Mail className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Buzón</span>
          </button>

          {/* Clear Local History Trigger */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(HAPTIC_PATTERNS.click);
              setHistoryClearedBanner(false);
              setShowClearHistoryModal(true);
            }}
            title="Limpiar historial guardado (Codex, Grimorio, Carta Natal y Buzón)"
            className="p-2 sm:px-3 sm:py-1.5 bg-red-950/35 hover:bg-red-900/55 border border-red-800/45 rounded-xl text-red-200 font-medium flex items-center space-x-1 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-300" />
            <span className="hidden lg:inline text-[11px] font-cinzel font-semibold">Limpiar historial</span>
          </button>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0e0a18] border border-purple-500/40 rounded-2xl p-6 text-purple-100 shadow-2xl space-y-4">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-purple-950 text-purple-300 hover:bg-purple-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-purple-200 font-cinzel font-semibold text-lg border-b border-purple-900/50 pb-2">
              <span>{t("guideTitle")}</span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-purple-200/90 leading-relaxed font-gothic">
              <p>
                <strong>{t("guideStep1Title")}</strong> {t("guideStep1Desc")}
              </p>
              <p>
                <strong>{t("guideStep2Title")}</strong> {t("guideStep2Desc")}
              </p>
              <p>
                <strong>{t("guideStep3Title")}</strong> {t("guideStep3Desc")}
              </p>
              <p>
                <strong>{t("guideStep4Title")}</strong> {t("guideStep4Desc")}
              </p>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-cinzel font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              {t("enterPortalBtn")}
            </button>
          </div>
        </div>
      )}

      {/* Live Real-Time Visitor Counter Modal */}
      {showVisitsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0e0a18] border border-purple-500/40 rounded-2xl p-6 text-purple-100 shadow-2xl space-y-4">
            <button
              onClick={() => setShowVisitsModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-purple-950 text-purple-300 hover:bg-purple-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-purple-200 font-cinzel font-semibold text-lg border-b border-purple-900/50 pb-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              <span>{t("visitsModalTitle")}</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/35 border border-emerald-500/40 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div>
                  <span className="text-xs font-cinzel font-bold text-emerald-200 block">
                    {t("onlineVisitorsTitle")}
                  </span>
                  <span className="text-[10px] font-gothic text-emerald-300/80">
                    {t("onlineExcludingCreator")}
                  </span>
                </div>
              </div>
              <span className="text-2xl font-cinzel font-bold text-emerald-300">
                {formattedOnline}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-700/40 text-center">
                <span className="text-[10px] uppercase tracking-wider text-purple-300/80 block font-gothic">
                  {t("totalRealVisits")}
                </span>
                <span className="text-2xl font-cinzel font-bold text-purple-100 mt-1 block">
                  {formattedVisits}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-700/40 text-center">
                <span className="text-[10px] uppercase tracking-wider text-purple-300/80 block font-gothic">
                  {t("visitsToday")}
                </span>
                <span className="text-2xl font-cinzel font-bold text-amber-300 mt-1 block">
                  {(visitsStats?.todayVisits ?? 0).toLocaleString(locale)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-700/40 text-center">
                <span className="text-[10px] uppercase tracking-wider text-purple-300/80 block font-gothic">
                  {t("channeledConsultations")}
                </span>
                <span className="text-2xl font-cinzel font-bold text-indigo-200 mt-1 block">
                  {(visitsStats?.totalConsultations ?? 0).toLocaleString(locale)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-700/40 text-center">
                <span className="text-[10px] uppercase tracking-wider text-purple-300/80 block font-gothic">
                  {t("portalOfficialRecord")}
                </span>
                <span className="text-2xl font-cinzel font-bold text-emerald-300 mt-1 block">
                  {(visitsStats?.uniqueVisitorsCount ?? 0).toLocaleString(locale)}
                </span>
              </div>
            </div>

            <p className="text-xs text-purple-200/80 leading-relaxed font-gothic">
              {t("portalRecordDesc")}
            </p>

            {(isCreatorMode || isAdminAuthorized) ? (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 font-gothic space-y-2">
                <div className="flex items-center space-x-2 font-semibold">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {isCreatorMode
                      ? `${t("creatorModeActive")} • Consultas ilimitadas activas`
                      : "Acceso de Creador activo • Consultas ilimitadas activas"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleToggleCreatorMode}
                    className="w-full py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-100 font-cinzel text-[11px] font-semibold transition cursor-pointer"
                  >
                    {t("toggleCreatorModeBtn")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVisitsModal(false);
                      if (isAdminAuthorized) {
                        setShowAdminConfigModal(true);
                      } else {
                        setShowAdminUnlockModal(true);
                      }
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-purple-900/70 hover:bg-purple-800 border border-purple-500/50 text-purple-100 font-cinzel text-[11px] font-semibold transition cursor-pointer"
                  >
                    Panel del Creador
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(HAPTIC_PATTERNS.click);
                  setShowVisitsModal(false);
                  setShowAdminUnlockModal(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-amber-950/35 hover:bg-amber-900/50 border border-amber-500/35 text-amber-200 text-xs font-cinzel font-semibold flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>¿Eres el creador? Activar acceso ilimitado</span>
              </button>
            )}

            <button
              onClick={() => setShowVisitsModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-cinzel font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              {t("closeRecord")}
            </button>
          </div>
        </div>
      )}

      {/* Exclusive Admin Configuration Modal (ONLY for tarotistasonline@gmail.com) */}
      <AdminConfigModal
        isOpen={showAdminConfigModal}
        onClose={() => setShowAdminConfigModal(false)}
        visitsStats={visitsStats}
        isCreatorMode={isCreatorMode}
        onToggleCreatorMode={handleToggleCreatorMode}
      />

      {/* Admin Unlock Modal (Access with email/PIN) */}
      <AdminUnlockModal
        isOpen={showAdminUnlockModal}
        onClose={() => setShowAdminUnlockModal(false)}
        onSuccess={() => {
          setShowAdminUnlockModal(false);
          setShowAdminConfigModal(true);
        }}
      />

      {/* Feedback / Suggestions Mailbox Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      {/* Clear All Local History Confirmation Modal */}
      {showClearHistoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setShowClearHistoryModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#0e0919] border border-red-500/45 rounded-3xl p-6 text-purple-100 shadow-[0_0_50px_rgba(239,68,68,0.2)] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowClearHistoryModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-purple-950/80 hover:bg-purple-900 text-purple-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 border-b border-purple-900/60 pb-3">
              <div className="p-2.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel font-bold text-base text-red-200">
                  Limpiar Historial Local
                </h3>
                <p className="text-[11px] font-gothic text-purple-300/80">
                  Borra las lecturas y mensajes guardados en este dispositivo
                </p>
              </div>
            </div>

            {historyClearedBanner ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-cinzel font-semibold text-center">
                ✓ Historial limpiado correctamente. El portal quedó listo para nuevas consultas.
              </div>
            ) : (
              <>
                <p className="text-xs font-gothic text-purple-200/90 leading-relaxed">
                  Esta acción eliminará el <strong>Codex de Vidas Pasadas</strong>, el <strong>Grimorio</strong>, la última <strong>Carta Natal guardada</strong>, las respuestas visibles en el tablero y los <strong>mensajes guardados del Buzón</strong>. Tu pase desbloqueado y el contador global del portal no se alteran.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowClearHistoryModal(false)}
                    className="px-4 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-200 font-cinzel font-semibold text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(HAPTIC_PATTERNS.click);
                      audio.stopSpeech();
                      clearAllGrimorio();
                      try {
                        localStorage.removeItem("ouija_past_lives_codex");
                        localStorage.removeItem("ouija_natal_chart_saved_v1");
                        localStorage.removeItem("ouija_user_feedback_list");
                      } catch {
                        // ignore
                      }
                      window.dispatchEvent(new CustomEvent("ouija-history-cleared"));
                      setHistoryClearedBanner(true);
                      setTimeout(() => {
                        setHistoryClearedBanner(false);
                        setShowClearHistoryModal(false);
                      }, 1400);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-cinzel font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirmar Limpieza</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
