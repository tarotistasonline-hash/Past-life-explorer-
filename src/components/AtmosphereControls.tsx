import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Moon, HelpCircle, X, Eye, Sparkles, Mic, Play, Check, Shield, ShieldCheck, Maximize2, Minimize2, BookOpen } from "lucide-react";
import { audio, VoiceOption } from "../lib/audio";
import { VisitsStats } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSelector } from "./LanguageSelector";
import { MoonPhaseWidget } from "./MoonPhaseWidget";
import { isAdminSession, setAdminSession } from "../lib/adminTracking";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";

interface AtmosphereControlsProps {
  fogOn: boolean;
  setFogOn: (on: boolean) => void;
  onOpenWelcome: () => void;
  onOpenGrimorio?: () => void;
  visitsStats: VisitsStats | null;
}

export const AtmosphereControls: React.FC<AtmosphereControlsProps> = ({
  fogOn,
  setFogOn,
  onOpenWelcome,
  onOpenGrimorio,
  visitsStats,
}) => {
  const { t, language } = useLanguage();
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isDroneActive, setIsDroneActive] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showVisitsModal, setShowVisitsModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [isPlayingTestVoice, setIsPlayingTestVoice] = useState(false);
  const [isCreatorMode, setIsCreatorMode] = useState<boolean>(() => isAdminSession());
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  useEffect(() => {
    const loadVoices = () => {
      const voices = audio.getAvailableMaleVoices(language);
      setAvailableVoices(voices);
      setSelectedVoiceURI(audio.getSelectedVoiceURI());
    };

    loadVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [language]);

  const toggleSound = () => {
    const nextState = !isAudioMuted;
    setIsAudioMuted(nextState);
    audio.setMuted(nextState);
  };

  const toggleDrone = () => {
    const active = audio.toggleDrone();
    setIsDroneActive(active);
  };

  const handleTestVoice = () => {
    setIsPlayingTestVoice(true);
    audio.testMaleVoice(
      () => setIsPlayingTestVoice(true),
      () => setIsPlayingTestVoice(false)
    );
  };

  const handleSelectVoice = (uri: string | null) => {
    audio.setSelectedVoiceURI(uri);
    setSelectedVoiceURI(uri);
  };

  const locale = language === "en" ? "en-US" : language === "pt" ? "pt-BR" : language === "fr" ? "fr-FR" : language === "it" ? "it-IT" : language === "de" ? "de-DE" : "es-AR";

  const totalVisitsVal = visitsStats?.totalVisits ?? 0;
  const todayVisitsVal = visitsStats?.todayVisits ?? 0;
  const totalConsultationsVal = visitsStats?.totalConsultations ?? 0;

  const formattedVisits = totalVisitsVal.toLocaleString(locale);

  return (
    <>
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-3 bg-[#0c0816]/90 border border-purple-900/50 rounded-2xl backdrop-blur-md mb-4 shadow-2xl text-purple-200">
        {/* Title / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-purple-950/90 border border-purple-500/60 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.3)] shrink-0">
            <span className="text-xs font-bold text-purple-300 font-cinzel">RA</span>
          </div>
          <div>
            <h1 className="font-decorative font-bold text-xs sm:text-sm md:text-base text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-indigo-200 to-purple-300 tracking-wide">
              {t("appTitle")}
            </h1>
            <p className="text-[10px] text-purple-300/80 font-gothic font-medium hidden sm:block tracking-widest uppercase">
              {t("appSubtitle")}
            </p>
          </div>
        </div>

        {/* Live Visitor Counter Badge & Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-gothic">
          {/* Visitor Counter Button */}
          <button
            onClick={() => setShowVisitsModal(true)}
            title={t("realVisitsTitle")}
            className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 border border-purple-600/40 text-purple-200 text-xs font-gothic transition cursor-pointer shadow-[0_0_12px_rgba(147,51,234,0.25)] group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Eye className="w-3.5 h-3.5 text-purple-300 group-hover:text-purple-100 transition" />
            <span className="font-cinzel font-semibold text-purple-100">{formattedVisits}</span>
            <span className="hidden md:inline text-[11px] text-purple-300/80">{t("realVisits")}</span>
            {isCreatorMode && (
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-sans font-medium" title={t("creatorModeActive")}>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="hidden lg:inline">{t("creatorModeBadge")}</span>
              </span>
            )}
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

          {/* Solemn Male Voice Settings Button */}
          <button
            onClick={() => setShowVoiceModal(true)}
            title={t("solemnVoice")}
            className="px-2.5 py-1.5 rounded-xl border border-purple-800/60 bg-purple-950/50 hover:bg-purple-900/70 text-purple-200 flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden xl:inline text-[11px]">{t("solemnVoice")}</span>
          </button>

          {/* Audio Drone Theta Tone */}
          <button
            onClick={toggleDrone}
            title={t("etherealMusic")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition cursor-pointer ${
              isDroneActive
                ? "bg-purple-900/60 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                : "bg-neutral-900/80 border-purple-900/40 text-neutral-400 hover:text-purple-200"
            }`}
          >
            <span className="hidden md:inline font-medium">{t("etherealMusic")}</span>
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

          {/* Spoken Welcome Button */}
          <button
            onClick={onOpenWelcome}
            title={t("akashicRecordsBtn")}
            className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-purple-800 to-indigo-700 hover:from-purple-700 hover:to-indigo-600 border border-purple-500/40 rounded-xl text-purple-100 font-medium flex items-center space-x-1 transition cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.2)]"
          >
            <span className="hidden sm:inline">{t("akashicRecordsBtn")}</span>
          </button>

          {/* Guide Modal Trigger */}
          <button
            onClick={() => setShowGuide(true)}
            className="p-2 sm:px-3 sm:py-1.5 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 rounded-xl text-purple-200 font-medium flex items-center space-x-1 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-purple-300" />
            <span className="hidden sm:inline">{t("guideBtn")}</span>
          </button>
        </div>
      </div>

      {/* Visitor Counter Modal */}
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
              <Eye className="w-5 h-5 text-purple-400" />
              <span>{t("visitsModalTitle")}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-purple-950/50 border border-purple-800/40 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase text-purple-400 font-semibold tracking-wider block">
                  {t("totalRealVisits")}
                </span>
                <span className="text-2xl font-cinzel font-bold text-purple-100 mt-1 block">
                  {totalVisitsVal.toLocaleString(locale)}
                </span>
              </div>

              <div className="bg-purple-950/50 border border-purple-800/40 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase text-purple-400 font-semibold tracking-wider block">
                  {t("visitsToday")}
                </span>
                <span className="text-2xl font-cinzel font-bold text-purple-100 mt-1 block">
                  {todayVisitsVal.toLocaleString(locale)}
                </span>
              </div>

              <div className="bg-purple-950/50 border border-purple-800/40 rounded-xl p-3 text-center col-span-2">
                <span className="text-[10px] uppercase text-purple-400 font-semibold tracking-wider block">
                  {t("channeledConsultations")}
                </span>
                <span className="text-xl font-cinzel font-bold text-indigo-200 mt-1 block">
                  {totalConsultationsVal.toLocaleString(locale)}
                </span>
              </div>
            </div>

            <div className="text-xs text-purple-300/80 font-gothic leading-relaxed bg-neutral-950/60 p-3 rounded-xl border border-purple-900/30">
              <p className="flex items-center space-x-1.5 text-purple-300 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{t("portalOfficialRecord")}</span>
              </p>
              <p>
                {t("portalRecordDesc")}
              </p>
            </div>

            {/* Creator / Owner Traffic Exclusion Setting */}
            <div className="bg-purple-950/40 border border-purple-800/50 rounded-xl p-3 space-y-2 text-xs font-gothic">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-purple-300" />
                  <span className="font-cinzel font-bold text-purple-200">
                    {t("creatorModeTitle")}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold border ${
                    isCreatorMode
                      ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                      : "bg-neutral-900 border-neutral-700 text-neutral-400"
                  }`}
                >
                  {isCreatorMode ? t("creatorModeActive") : t("creatorModeInactive")}
                </span>
              </div>
              <p className="text-[11px] text-purple-300/70 leading-relaxed">
                {t("creatorModeDesc")}
              </p>
              <button
                type="button"
                onClick={handleToggleCreatorMode}
                className="w-full py-1.5 px-3 bg-purple-900/50 hover:bg-purple-800/60 border border-purple-600/40 text-purple-100 rounded-lg text-xs font-gothic transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                <span>{t("toggleCreatorModeBtn")}</span>
              </button>
            </div>

            <button
              onClick={() => setShowVisitsModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-cinzel font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              {t("closeRecord")}
            </button>
          </div>
        </div>
      )}

      {/* Male Solemn Voice Settings Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0e0a18] border border-purple-500/40 rounded-2xl p-6 text-purple-100 shadow-2xl space-y-4">
            <button
              onClick={() => setShowVoiceModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-purple-950 text-purple-300 hover:bg-purple-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-purple-200 font-cinzel font-semibold text-lg border-b border-purple-900/50 pb-2">
              <Mic className="w-5 h-5 text-purple-400" />
              <span>{t("voiceModalTitle")}</span>
            </div>

            <div className="text-xs text-purple-200/90 font-gothic space-y-2">
              <p>
                {t("voiceModalDesc")}
              </p>
            </div>

            {/* Test Voice Button */}
            <div className="bg-purple-950/60 border border-purple-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-cinzel font-bold text-purple-100 block">
                  {t("testVoiceTitle")}
                </span>
                <span className="text-[11px] text-purple-300/80 font-gothic block mt-0.5">
                  {t("testVoiceDesc")}
                </span>
              </div>
              <button
                onClick={handleTestVoice}
                disabled={isPlayingTestVoice}
                className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white text-xs font-cinzel font-semibold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow disabled:opacity-50 shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isPlayingTestVoice ? t("playingSample") : t("playSample")}</span>
              </button>
            </div>

            {/* Available Masculine Voices List */}
            <div className="space-y-2">
              <span className="text-xs uppercase text-purple-400 font-semibold tracking-wider block font-cinzel">
                {t("availableVoices")}
              </span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                <button
                  type="button"
                  onClick={() => handleSelectVoice(null)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-gothic transition flex items-center justify-between cursor-pointer ${
                    selectedVoiceURI === null
                      ? "bg-purple-900/60 border-purple-400 text-purple-100 font-medium"
                      : "bg-neutral-950/60 border-purple-950 hover:border-purple-800 text-purple-300"
                  }`}
                >
                  <div>
                    <span className="block font-medium">{t("autoVoiceOptimal")}</span>
                    <span className="text-[10px] text-purple-400/80">{t("autoVoiceDesc")}</span>
                  </div>
                  {selectedVoiceURI === null && <Check className="w-4 h-4 text-purple-300 shrink-0" />}
                </button>

                {availableVoices.map((v) => (
                  <button
                    key={v.voiceURI}
                    type="button"
                    onClick={() => handleSelectVoice(v.voiceURI)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-gothic transition flex items-center justify-between cursor-pointer ${
                      selectedVoiceURI === v.voiceURI
                        ? "bg-purple-900/60 border-purple-400 text-purple-100 font-medium"
                        : "bg-neutral-950/60 border-purple-950 hover:border-purple-800 text-purple-300"
                    }`}
                  >
                    <div>
                      <span className="block">{v.name}</span>
                      <span className="text-[10px] text-purple-400/80">{v.lang} {v.isPreferredMale ? "• Masculina" : ""}</span>
                    </div>
                    {selectedVoiceURI === v.voiceURI && <Check className="w-4 h-4 text-purple-300 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowVoiceModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-cinzel font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              {t("saveAndClose")}
            </button>
          </div>
        </div>
      )}

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
    </>
  );
};
