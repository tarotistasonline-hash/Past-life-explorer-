import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Moon, HelpCircle, X, Eye, Sparkles, Mic, Play, Check } from "lucide-react";
import { audio, VoiceOption } from "../lib/audio";
import { VisitsStats } from "../types";

interface AtmosphereControlsProps {
  fogOn: boolean;
  setFogOn: (on: boolean) => void;
  onOpenWelcome: () => void;
  visitsStats: VisitsStats | null;
}

export const AtmosphereControls: React.FC<AtmosphereControlsProps> = ({
  fogOn,
  setFogOn,
  onOpenWelcome,
  visitsStats,
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isDroneActive, setIsDroneActive] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showVisitsModal, setShowVisitsModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [isPlayingTestVoice, setIsPlayingTestVoice] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const voices = audio.getAvailableMaleVoices();
      setAvailableVoices(voices);
      setSelectedVoiceURI(audio.getSelectedVoiceURI());
    };

    loadVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

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

  const formattedVisits = visitsStats?.totalVisits !== undefined
    ? visitsStats.totalVisits.toLocaleString("es-AR")
    : "1";

  return (
    <>
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#0c0816]/90 border border-purple-900/50 rounded-2xl backdrop-blur-md mb-4 shadow-2xl text-purple-200">
        {/* Title / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-purple-950/90 border border-purple-500/60 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <span className="text-xs font-bold text-purple-300 font-cinzel">RA</span>
          </div>
          <div>
            <h1 className="font-decorative font-bold text-sm sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-indigo-200 to-purple-300 tracking-wide">
              TABLA OUIJA INTERACTIVA
            </h1>
            <p className="text-[10px] text-purple-300/80 font-gothic font-medium hidden sm:block tracking-widest uppercase">
              Oráculo de Registros Akáshicos & Vidas Pasadas
            </p>
          </div>
        </div>

        {/* Live Visitor Counter Badge */}
        <button
          onClick={() => setShowVisitsModal(true)}
          title="Contador de Visitas Reales y Almas en el Portal"
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 border border-purple-600/40 text-purple-200 text-xs font-gothic transition cursor-pointer shadow-[0_0_12px_rgba(147,51,234,0.25)] group"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Eye className="w-3.5 h-3.5 text-purple-300 group-hover:text-purple-100 transition" />
          <span className="font-cinzel font-semibold text-purple-100">{formattedVisits}</span>
          <span className="hidden md:inline text-[11px] text-purple-300/80">visitas reales</span>
        </button>

        {/* Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-gothic">
          {/* Solemn Male Voice Settings Button */}
          <button
            onClick={() => setShowVoiceModal(true)}
            title="Ajustes de Voz Masculina Solemne"
            className="px-2.5 py-1.5 rounded-xl border border-purple-800/60 bg-purple-950/50 hover:bg-purple-900/70 text-purple-200 flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden lg:inline text-[11px]">Voz Solemne</span>
          </button>

          {/* Audio Drone Theta Tone */}
          <button
            onClick={toggleDrone}
            title="Música Binaural de Fondo (432Hz)"
            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition cursor-pointer ${
              isDroneActive
                ? "bg-purple-900/60 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                : "bg-neutral-900/80 border-purple-900/40 text-neutral-400 hover:text-purple-200"
            }`}
          >
            <span className="hidden md:inline font-medium">Música Ethereal</span>
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            title="Efectos de Sonido"
            className={`p-2 rounded-xl border flex items-center transition cursor-pointer ${
              !isAudioMuted
                ? "bg-purple-950/60 border-purple-800 text-purple-300"
                : "bg-neutral-900 border-neutral-800 text-neutral-500"
            }`}
          >
            {!isAudioMuted ? <Volume2 className="w-4 h-4 text-purple-300" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fog Toggle */}
          <button
            onClick={() => setFogOn(!fogOn)}
            title="Bruma Mística"
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
            title="Abrir Registros Akáshicos"
            className="px-3 py-1.5 bg-gradient-to-r from-purple-800 to-indigo-700 hover:from-purple-700 hover:to-indigo-600 border border-purple-500/40 rounded-xl text-purple-100 font-medium flex items-center space-x-1 transition cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.2)]"
          >
            <span className="hidden md:inline">Registros Akáshicos</span>
          </button>

          {/* Guide Modal Trigger */}
          <button
            onClick={() => setShowGuide(true)}
            className="p-2 sm:px-3 sm:py-1.5 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 rounded-xl text-purple-200 font-medium flex items-center space-x-1 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-purple-300" />
            <span className="hidden sm:inline">Guía</span>
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
              <span>Contador de Visitas Reales</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-purple-950/50 border border-purple-800/40 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase text-purple-400 font-semibold tracking-wider block">
                  Total Visitas Reales
                </span>
                <span className="text-2xl font-cinzel font-bold text-purple-100 mt-1 block">
                  {visitsStats?.totalVisits !== undefined ? visitsStats.totalVisits.toLocaleString("es-AR") : "1"}
                </span>
              </div>

              <div className="bg-purple-950/50 border border-purple-800/40 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase text-purple-400 font-semibold tracking-wider block">
                  Visitas Hoy
                </span>
                <span className="text-2xl font-cinzel font-bold text-purple-100 mt-1 block">
                  {visitsStats?.todayVisits !== undefined ? visitsStats.todayVisits.toLocaleString("es-AR") : "1"}
                </span>
              </div>

              <div className="bg-purple-950/50 border border-purple-800/40 rounded-xl p-3 text-center col-span-2">
                <span className="text-[10px] uppercase text-purple-400 font-semibold tracking-wider block">
                  Consultas Akáshicas Canalizadas
                </span>
                <span className="text-xl font-cinzel font-bold text-indigo-200 mt-1 block">
                  {visitsStats?.totalConsultations !== undefined ? visitsStats.totalConsultations.toLocaleString("es-AR") : "0"} canalizaciones
                </span>
              </div>
            </div>

            <div className="text-xs text-purple-300/80 font-gothic leading-relaxed bg-neutral-950/60 p-3 rounded-xl border border-purple-900/30">
              <p className="flex items-center space-x-1.5 text-purple-300 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Registro Oficial del Portal</span>
              </p>
              <p>
                Este contador registra en tiempo real cada alma que accede al oráculo y realiza una consulta de vidas pasadas a través de la tabla Ouija.
              </p>
            </div>

            <button
              onClick={() => setShowVisitsModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-cinzel font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Cerrar Registro
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
              <span>Voz Solemne y Neutra de Hombre</span>
            </div>

            <div className="text-xs text-purple-200/90 font-gothic space-y-2">
              <p>
                El oráculo utiliza una <strong>voz masculina solemne, calmada y de tono neutro</strong> con cadencia deliberada para transmitir las revelaciones de los Registros Akáshicos.
              </p>
            </div>

            {/* Test Voice Button */}
            <div className="bg-purple-950/60 border border-purple-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-cinzel font-bold text-purple-100 block">
                  Probar Voz Masculina Solemne
                </span>
                <span className="text-[11px] text-purple-300/80 font-gothic block mt-0.5">
                  Escucha una muestra del tono y solemnidad del guardián
                </span>
              </div>
              <button
                onClick={handleTestVoice}
                disabled={isPlayingTestVoice}
                className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white text-xs font-cinzel font-semibold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow disabled:opacity-50 shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isPlayingTestVoice ? "Reproduciendo..." : "Escuchar Muestra"}</span>
              </button>
            </div>

            {/* Available Masculine Voices List */}
            <div className="space-y-2">
              <span className="text-xs uppercase text-purple-400 font-semibold tracking-wider block font-cinzel">
                Voces Masculinas Disponibles en tu Dispositivo
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
                    <span className="block font-medium">✨ Selección Automática Óptima (Hombre Solemne Neutro)</span>
                    <span className="text-[10px] text-purple-400/80">Tono profundo, ritmo pausado y solemne</span>
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
                      <span className="text-[10px] text-purple-400/80">{v.lang} {v.isPreferredMale ? "• Masculina identificada" : ""}</span>
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
              Guardar y Cerrar
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
              <span>Guía del Portal Akáshico</span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-purple-200/90 leading-relaxed font-gothic">
              <p>
                <strong>1. Lectura de Vidas Pasadas:</strong> Ingresa tu nombre e intención opcional. Al pulsar "Revelar Vida Pasada", la plancheta se moverá físicamente sobre la Ouija para deletrear las claves de tu encarnación anterior.
              </p>
              <p>
                <strong>2. Consultas por Micrófono:</strong> Puedes dictar tus intenciones o preguntas directamente hablando a través de tu micrófono. La plancheta Ouija se desplazará automáticamente sobre la tabla para responderte.
              </p>
              <p>
                <strong>3. Codex del Alma:</strong> Cada vida pasada descubierta incluye su época, relato histórico, causa de transición y lección kármica.
              </p>
              <p>
                <strong>4. Voz Masculina Solemne y Atmósfera:</strong> Escucha los mensajes dictados solemnemente por el guardián y activa la bruma mística para una inmersión completa.
              </p>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-cinzel font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Comprender y Entrar al Portal
            </button>
          </div>
        </div>
      )}
    </>
  );
};

