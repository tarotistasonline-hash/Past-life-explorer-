import React, { useState } from "react";
import { X, Volume2, Ghost, Shield, ShieldCheck, Eye, LogOut, Check, Play, Sparkles, Link2, Copy } from "lucide-react";
import { audio } from "../lib/audio";
import { useLanguage } from "../context/LanguageContext";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";
import { VisitsStats } from "../types";
import { deauthorizeAdmin, setAdminSession } from "../lib/adminTracking";
import { CANONICAL_PUBLIC_URL, getPublicPortalUrl } from "../lib/constants";

interface AdminConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitsStats: VisitsStats | null;
  isCreatorMode: boolean;
  onToggleCreatorMode: () => void;
}

interface SpiritualVoiceDef {
  id: "Fenrir" | "Puck" | "Charon";
  name: string;
  title: string;
  badge: string;
  isOriginal: boolean;
  desc: string;
  timbre: string;
}

const SPIRITUAL_AI_VOICES: SpiritualVoiceDef[] = [
  {
    id: "Fenrir",
    name: "Fenrir",
    title: "Voz Masculina de Ultratumba (Solemne & Profunda)",
    badge: "Voz Original • Predeterminada",
    isOriginal: true,
    desc: "Tono masculino solemne, profundo, sagrado y ceremonial. La voz predilecta y original del portal akáshico con presencia sepulcral natural.",
    timbre: "Barítono Solemne • Reverberación Espectral",
  },
  {
    id: "Puck",
    name: "Puck",
    title: "Voz Masculina Espectral (Clara & Mística)",
    badge: "Espectral",
    isOriginal: false,
    desc: "Tono masculino sereno, elocuente y místico. Cadencia clara y reflexiva para canalizaciones límpidas.",
    timbre: "Medio Natural • Fluidez Sagrada",
  },
  {
    id: "Charon",
    name: "Charon",
    title: "Voz de la Cripta (Cavernosa & Sombría)",
    badge: "Cavernosa",
    isOriginal: false,
    desc: "Tono masculino rasgado, grave, antiguo y sepulcral del abismo.",
    timbre: "Bajo Cavernoso • Resonancia Oscura",
  },
];

export const AdminConfigModal: React.FC<AdminConfigModalProps> = ({
  isOpen,
  onClose,
  visitsStats,
  isCreatorMode,
  onToggleCreatorMode,
}) => {
  const { t, language } = useLanguage();
  const [selectedVoice, setSelectedVoice] = useState<string>(audio.getSelectedAiVoice());
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);
  const [isPlayingWelcome, setIsPlayingWelcome] = useState<boolean>(false);
  const [isWelcomeActive, setIsWelcomeActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem("ouija_welcome_speech_active") !== "false";
    } catch {
      return true;
    }
  });

  if (!isOpen) return null;

  const handleSelectVoice = (voiceId: string) => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    setSelectedVoice(voiceId);
    audio.setSelectedAiVoice(voiceId);
  };

  const handleToggleWelcome = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    const nextVal = !isWelcomeActive;
    setIsWelcomeActive(nextVal);
    try {
      localStorage.setItem("ouija_welcome_speech_active", nextVal ? "true" : "false");
      window.dispatchEvent(new CustomEvent("ouija-welcome-settings-change", { detail: { active: nextVal } }));
    } catch {}
  };

  const handleTestWelcomeMessage = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    if (isPlayingWelcome) {
      audio.stopSpeech();
      setIsPlayingWelcome(false);
      return;
    }

    setIsPlayingWelcome(true);
    const welcomeNarrative = t("welcomeVoiceText");
    audio.speakSpiritText(
      welcomeNarrative,
      () => setIsPlayingWelcome(true),
      () => setIsPlayingWelcome(false),
      language
    );
  };

  const handleTestVoice = (voiceId: "Fenrir" | "Puck" | "Charon", e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(HAPTIC_PATTERNS.click);

    if (testingVoiceId === voiceId) {
      audio.stopSpeech();
      setTestingVoiceId(null);
      return;
    }

    setTestingVoiceId(voiceId);
    const sampleText = t("voiceSampleUltratumbaText") || "Hablo desde el umbral de ultratumba... El velo se ha rasgado y los ecos de tu alma vuelven a la luz.";

    audio.testMaleVoice(
      voiceId,
      () => setTestingVoiceId(voiceId),
      () => setTestingVoiceId(null),
      sampleText,
      language
    );
  };

  const handleLogout = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    deauthorizeAdmin();
    onClose();
  };

  const totalVisitsVal = visitsStats?.totalVisits ?? 0;
  const todayVisitsVal = visitsStats?.todayVisits ?? 0;
  const totalConsultationsVal = visitsStats?.totalConsultations ?? 0;
  const uniqueVisitorsVal = visitsStats?.uniqueVisitorsCount ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e0919] border border-amber-500/40 rounded-3xl p-5 sm:p-7 text-purple-100 shadow-[0_0_50px_rgba(245,158,11,0.2)] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-cinzel font-bold text-amber-200">
                Panel Exclusivo de Configuración
              </h2>
              <p className="text-xs font-gothic text-purple-300/80">
                Acceso restringido: <span className="text-amber-300 font-mono">tarotistasonline@gmail.com</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-purple-950/80 hover:bg-purple-900 text-purple-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Voice Configuration */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs uppercase font-cinzel font-semibold text-purple-300 tracking-wider">
            <Ghost className="w-4 h-4 text-purple-400" />
            <span>Configuración de Voz Solemne (Predeterminada del Sistema)</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {SPIRITUAL_AI_VOICES.map((v) => {
              const isSelected = selectedVoice === v.id;
              const isTesting = testingVoiceId === v.id;

              return (
                <div
                  key={v.id}
                  onClick={() => handleSelectVoice(v.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-purple-950/70 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "bg-[#130b22]/70 border-purple-900/50 hover:border-purple-700/60"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-cinzel font-bold text-sm text-purple-100">{v.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-300 border border-purple-700/50">
                        {v.badge}
                      </span>
                    </div>
                    <p className="text-xs text-purple-300/80 font-gothic">{v.desc}</p>
                    <span className="text-[10px] text-amber-300/80 font-mono block">{v.timbre}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => handleTestVoice(v.id, e)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold border flex items-center space-x-1.5 transition cursor-pointer ${
                        isTesting
                          ? "bg-amber-600 text-black border-amber-400 animate-pulse"
                          : "bg-purple-900/60 hover:bg-purple-800 text-purple-200 border-purple-600/50"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isTesting ? "Probando..." : "Probar"}</span>
                    </button>
                    {isSelected && (
                      <div className="w-7 h-7 rounded-xl bg-purple-600/40 border border-purple-400 flex items-center justify-center text-purple-200">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Welcome Message Autoplay & Preview Controls */}
          <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/50 space-y-2.5 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span className="font-cinzel text-xs font-bold text-amber-200">
                  Mensaje de Bienvenida al Iniciar la App
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleWelcome}
                className={`px-3 py-1 rounded-xl text-xs font-cinzel font-semibold border transition cursor-pointer flex items-center space-x-1.5 ${
                  isWelcomeActive
                    ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                    : "bg-neutral-900 border-neutral-700 text-neutral-400"
                }`}
              >
                <span>{isWelcomeActive ? "Activado" : "Desactivado"}</span>
              </button>
            </div>
            
            <p className="text-[11px] text-purple-300/80 font-gothic italic">
              "{t("welcomeVoiceText")}"
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-purple-900/40">
              <span className="text-[10px] text-purple-400 font-gothic">
                Voz activa: <strong className="text-amber-300">{selectedVoice}</strong>
              </span>
              <button
                type="button"
                onClick={handleTestWelcomeMessage}
                className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold border flex items-center space-x-1.5 transition cursor-pointer ${
                  isPlayingWelcome
                    ? "bg-amber-600 text-black border-amber-400 animate-pulse"
                    : "bg-purple-900/80 hover:bg-purple-800 text-purple-100 border-purple-600/60"
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isPlayingWelcome ? "Detener Mensaje" : "Escuchar Bienvenida Ahora"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Creator Traffic Exclusion & Detailed Metrics */}
        <div className="space-y-3 pt-2 border-t border-purple-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs uppercase font-cinzel font-semibold text-purple-300 tracking-wider">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Filtro de Tráfico del Creador</span>
            </div>
            <button
              type="button"
              onClick={onToggleCreatorMode}
              className={`px-3 py-1 rounded-xl text-xs font-cinzel font-semibold border transition cursor-pointer flex items-center space-x-1.5 ${
                isCreatorMode
                  ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                  : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isCreatorMode ? "Exclusión Activada" : "Modo Visitante"}</span>
            </button>
          </div>
          <p className="text-xs text-purple-300/70 font-gothic">
            Cuando la exclusión está activada, tus propias visitas y consultas de prueba no alteran las estadísticas públicas reales.
          </p>

          {/* Metrics Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-center">
              <span className="text-[10px] text-purple-400 uppercase font-cinzel block">Visitas Totales</span>
              <span className="text-xl font-cinzel font-bold text-purple-100">{totalVisitsVal}</span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-center">
              <span className="text-[10px] text-purple-400 uppercase font-cinzel block">Visitas Hoy</span>
              <span className="text-xl font-cinzel font-bold text-amber-300">{todayVisitsVal}</span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-center">
              <span className="text-[10px] text-purple-400 uppercase font-cinzel block">Consultas</span>
              <span className="text-xl font-cinzel font-bold text-purple-100">{totalConsultationsVal}</span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-center">
              <span className="text-[10px] text-purple-400 uppercase font-cinzel block">Únicos</span>
              <span className="text-xl font-cinzel font-bold text-emerald-300">{uniqueVisitorsVal}</span>
            </div>
          </div>

          {/* Official URLs & SEO Indexing */}
          <div className="p-3.5 bg-black/40 border border-amber-500/30 rounded-2xl space-y-2.5 mt-3">
            <div className="flex items-center space-x-2 text-xs font-cinzel font-bold text-amber-300">
              <Link2 className="w-4 h-4 text-amber-400" />
              <span>Enlaces Oficiales para Compartir e Indexar</span>
            </div>
            
            <div className="space-y-1.5 text-xs font-gothic">
              <div className="flex items-center justify-between">
                <span className="text-purple-300/80">Enlace Público Oficial para Visitantes:</span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(HAPTIC_PATTERNS.click);
                    navigator.clipboard.writeText(CANONICAL_PUBLIC_URL);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700/50 flex items-center space-x-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar</span>
                </button>
              </div>
              <p className="font-mono text-[11px] text-emerald-300 bg-black/60 p-1.5 rounded border border-purple-900/50 break-all select-all">
                {CANONICAL_PUBLIC_URL}
              </p>
            </div>

            <div className="text-[11px] text-purple-300/70 pt-1 border-t border-purple-900/40">
              💡 Para ingresar a este panel: Haz clic en el botón circular <strong className="text-amber-300">AR</strong> arriba a la izquierda e ingresa tu correo <strong className="text-amber-300">tarotistasonline@gmail.com</strong>.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-purple-900/60">
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 rounded-xl text-red-300 text-xs font-cinzel flex items-center space-x-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión de Administración</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-purple-900/80 hover:bg-purple-800 border border-purple-600/60 rounded-xl text-purple-100 text-xs font-cinzel font-bold transition cursor-pointer"
          >
            Listo / Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
