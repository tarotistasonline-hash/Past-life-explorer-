import React, { useState, useEffect } from "react";
import { X, Volume2, Ghost, Check, Play, Square, Sparkles, ShieldCheck } from "lucide-react";
import { audio } from "../lib/audio";
import { useLanguage } from "../context/LanguageContext";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    badge: "Voz Original • Recomendada",
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

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const [selectedVoice, setSelectedVoice] = useState<string>(audio.getSelectedAiVoice());
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedVoice(audio.getSelectedAiVoice());
    } else {
      if (testingVoiceId) {
        audio.stopSpeech();
        setTestingVoiceId(null);
      }
    }
  }, [isOpen]);

  const handleSelectVoice = (voiceId: string) => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    setSelectedVoice(voiceId);
    audio.setSelectedAiVoice(voiceId);
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

  const handleClose = () => {
    if (testingVoiceId) {
      audio.stopSpeech();
      setTestingVoiceId(null);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0e0a18] border border-purple-500/40 rounded-3xl p-5 sm:p-6 text-purple-100 shadow-[0_0_60px_rgba(168,85,247,0.35)] max-h-[92vh] overflow-y-auto"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 0%, #1e1132 0%, #090510 100%)",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 p-2 rounded-full bg-purple-950/80 text-purple-300 hover:text-purple-100 hover:bg-purple-900 border border-purple-700/50 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-purple-900/50 pb-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-950/90 border border-purple-500/60 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Ghost className="w-5 h-5 text-purple-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-purple-200 to-indigo-200">
              Voz Masculina de Ultratumba
            </h2>
            <p className="text-xs text-purple-300/80 font-gothic">
              Selecciona el timbre masculino original del oráculo para las canalizaciones
            </p>
          </div>
        </div>

        {/* Distinct Spiritual AI Voices */}
        <div className="space-y-3 mb-5">
          {SPIRITUAL_AI_VOICES.map((v) => {
            const isSelected = selectedVoice === v.id;
            const isPlayingThis = testingVoiceId === v.id;

            return (
              <div
                key={v.id}
                onClick={() => handleSelectVoice(v.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-purple-900/50 border-purple-400 text-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.35)] ring-1 ring-purple-400/50"
                    : "bg-neutral-950/70 border-purple-900/40 text-purple-300/80 hover:bg-purple-950/40 hover:text-purple-100 hover:border-purple-700/50"
                }`}
              >
                {/* Header row with badge and check */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-cinzel font-bold text-sm text-purple-100 flex items-center space-x-1.5">
                      <span>{v.title}</span>
                    </span>
                  </div>
                  {isSelected && (
                    <span className="shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-purple-600/40 border border-purple-400 text-purple-200 text-[10px] font-cinzel font-semibold">
                      <Check className="w-3 h-3 text-purple-300" />
                      <span>Activa</span>
                    </span>
                  )}
                </div>

                {/* Subtitle / Timbre badge */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                    v.isOriginal 
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 font-semibold"
                      : "bg-purple-950/80 text-purple-300 border border-purple-800/40"
                  }`}>
                    {v.badge}
                  </span>
                  <span className="text-[10px] text-purple-400/70 font-gothic">
                    {v.timbre}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-purple-200/80 font-gothic leading-relaxed mb-3">
                  {v.desc}
                </p>

                {/* Action buttons inside card */}
                <div className="flex items-center justify-between pt-2 border-t border-purple-900/40">
                  <button
                    type="button"
                    onClick={(e) => handleTestVoice(v.id, e)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold tracking-wide flex items-center space-x-1.5 transition cursor-pointer border ${
                      isPlayingThis
                        ? "bg-purple-600 text-white border-purple-400 animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                        : "bg-purple-950/80 hover:bg-purple-900 text-purple-200 border-purple-700/60"
                    }`}
                  >
                    {isPlayingThis ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Detener Muestra</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Escuchar Muestra</span>
                      </>
                    )}
                  </button>

                  {!isSelected && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectVoice(v.id);
                      }}
                      className="text-xs font-cinzel text-purple-300 hover:text-purple-100 hover:underline px-2 py-1 cursor-pointer"
                    >
                      Elegir esta voz
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-purple-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-purple-300/80 font-gothic">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Voz de alta fidelidad guardada automáticamente</span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-700 hover:from-purple-700 hover:to-indigo-600 border border-purple-500/50 text-white text-xs font-cinzel font-bold uppercase tracking-wider transition cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] text-center"
          >
            Aceptar y Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
