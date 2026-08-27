import React, { useState, useEffect, useRef } from "react";
import { User, Calendar, MessageSquare, Mic, MicOff, Radio, Compass } from "lucide-react";
import { audio } from "../lib/audio";

interface SpiritOracleFormProps {
  onPastLifeConsult: (data: { name: string; birthYear: string; focusQuery: string; feeling: string }) => void;
  onGeneralConsult: (question: string, name: string) => void;
  isLoading: boolean;
}

export const SpiritOracleForm: React.FC<SpiritOracleFormProps> = ({
  onPastLifeConsult,
  onGeneralConsult,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<"PAST_LIFE" | "SPIRIT_ORACLE">("PAST_LIFE");
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [focusQuery, setFocusQuery] = useState("");
  const [feeling, setFeeling] = useState("");
  const [generalQuestion, setGeneralQuestion] = useState("");

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [micError, setMicError] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
    }
  }, []);

  const toggleMicrophone = () => {
    setMicError("");
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicSupported(false);
      setMicError("El reconocimiento de voz no está soportado en este navegador. Puedes escribir tu consulta.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        audio.playChime(600);
      };

      recognition.onresult = (event: any) => {
        const transcriptText = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");

        if (activeTab === "PAST_LIFE") {
          setFocusQuery(transcriptText);
        } else {
          setGeneralQuestion(transcriptText);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setMicError("Permiso de micrófono denegado. Por favor aprueba el acceso al micrófono.");
        } else {
          setMicError("No se pudo detectar voz clara. Intenta pulsar de nuevo e intentar hablar.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        audio.playChime(432);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
      setMicError("Error al iniciar el micrófono.");
    }
  };

  const handlePastLifeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onPastLifeConsult({
      name: name.trim() || "Buscador de la Verdad",
      birthYear: birthYear.trim() || "Desconocido",
      focusQuery: focusQuery.trim() || "¿Quién fui en mi vida pasada?",
      feeling: feeling.trim() || "Intención de autoconocimiento",
    });
  };

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuestion = generalQuestion.trim() || "¿Cuál es el mensaje o guía que los Registros tienen para mi alma hoy?";
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onGeneralConsult(finalQuestion, name.trim() || "Buscador");
  };

  const handlePresetPastLife = (queryText: string) => {
    setFocusQuery(queryText);
    onPastLifeConsult({
      name: name.trim() || "Buscador de la Verdad",
      birthYear: birthYear.trim() || "Desconocido",
      focusQuery: queryText,
      feeling: "Consulta rápida a los Registros",
    });
  };

  return (
    <div className="w-full max-w-2xl bg-[#0f0918]/90 border border-purple-900/50 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-2xl">
      {/* Voice Status Alert / Banner */}
      {isListening && (
        <div className="mb-4 p-3 bg-red-950/80 border border-red-500/80 rounded-xl flex items-center justify-between text-red-200 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <Radio className="w-5 h-5 text-red-400 animate-bounce" />
            <span className="font-gothic text-xs sm:text-sm font-semibold tracking-wide">
              Escuchando tu voz... Formula tu consulta a los Registros Akáshicos
            </span>
          </div>
          <button
            type="button"
            onClick={toggleMicrophone}
            className="px-2.5 py-1 bg-red-900/80 hover:bg-red-800 text-red-100 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Detener
          </button>
        </div>
      )}

      {micError && (
        <div className="mb-4 p-2.5 bg-purple-950/70 border border-purple-700/60 rounded-xl text-purple-200 text-xs text-center">
          {micError}
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-purple-900/50 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab("PAST_LIFE")}
          className={`flex-1 py-3 text-xs sm:text-sm font-cinzel font-semibold tracking-wide flex items-center justify-center space-x-2 border-b-2 transition cursor-pointer ${
            activeTab === "PAST_LIFE"
              ? "border-purple-400 text-purple-200 bg-purple-950/50"
              : "border-transparent text-neutral-400 hover:text-purple-200"
          }`}
        >
          <span>Lectura Vidas Pasadas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SPIRIT_ORACLE")}
          className={`flex-1 py-3 text-xs sm:text-sm font-cinzel font-semibold tracking-wide flex items-center justify-center space-x-2 border-b-2 transition cursor-pointer ${
            activeTab === "SPIRIT_ORACLE"
              ? "border-indigo-400 text-indigo-200 bg-indigo-950/50"
              : "border-transparent text-neutral-400 hover:text-indigo-200"
          }`}
        >
          <span>Consulta Akáshica Abierta</span>
        </button>
      </div>

      {activeTab === "PAST_LIFE" ? (
        <form onSubmit={handlePastLifeSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-gothic text-purple-300 font-medium mb-1.5 flex items-center space-x-1.5 tracking-wide">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Nombre o Apodo (Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Sofia / Alejandro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#080410] border border-purple-900/50 rounded-xl px-3.5 py-2.5 text-sm text-purple-100 placeholder-purple-900/60 focus:outline-none focus:border-purple-400 font-gothic"
              />
            </div>

            <div>
              <label className="block text-xs font-gothic text-purple-300 font-medium mb-1.5 flex items-center space-x-1.5 tracking-wide">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Año de Nacimiento (Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej: 1995"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="w-full bg-[#080410] border border-purple-900/50 rounded-xl px-3.5 py-2.5 text-sm text-purple-100 placeholder-purple-900/60 focus:outline-none focus:border-purple-400 font-gothic"
              />
            </div>
          </div>

          <p className="text-xs text-purple-200/80 font-gothic text-center py-2 px-3 bg-purple-950/40 border border-purple-900/40 rounded-xl">
            Los Registros Akáshicos revelarán la vida pasada y memoria ancestral que habita en tu alma.
          </p>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-gothic text-purple-300 font-medium flex items-center space-x-1.5 tracking-wide">
                <span>Pregunta o Intención Especial (Opcional)</span>
              </label>
              {/* Mic Indicator Button */}
              <button
                type="button"
                onClick={toggleMicrophone}
                title="Hablar por Micrófono"
                className={`px-2.5 py-1 rounded-lg text-xs font-gothic font-medium flex items-center space-x-1.5 transition border cursor-pointer ${
                  isListening
                    ? "bg-red-950 border-red-500 text-red-300 animate-pulse"
                    : "bg-purple-950/80 hover:bg-purple-900/80 border-purple-700/60 text-purple-300"
                }`}
              >
                {isListening ? (
                  <>
                    <Mic className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                    <span>Escuchando...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-purple-400" />
                    <span>Usar Micrófono</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder={isListening ? "Escuchando tu voz... Habla ahora..." : "Opcional: Ej. ¿Dónde viví? ¿Qué talento heredé?"}
                value={focusQuery}
                onChange={(e) => setFocusQuery(e.target.value)}
                className={`w-full bg-[#080410] border rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-purple-100 placeholder-purple-900/60 focus:outline-none font-gothic ${
                  isListening ? "border-red-500 bg-red-950/20" : "border-purple-900/50 focus:border-purple-400"
                }`}
              />
              <button
                type="button"
                onClick={toggleMicrophone}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-purple-400 hover:text-purple-200 transition cursor-pointer"
              >
                {isListening ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-purple-400" />}
              </button>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="pt-1">
            <div className="text-[11px] font-gothic text-purple-300/80 mb-1.5 font-medium tracking-wide">
              Consultas Rápidas a los Registros:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "¿Quién fui en mi vida anterior?",
                "¿Cuál es mi lección kármica principal?",
                "¿Dónde viví en mi vida pasada?",
                "¿Qué talento traigo de otra época?"
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetPastLife(preset)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-purple-950/50 hover:bg-purple-900/70 border border-purple-800/40 rounded-xl text-xs font-gothic text-purple-200 transition cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
            <button
              type="button"
              onClick={toggleMicrophone}
              className={`py-3 px-4 font-gothic font-semibold text-xs uppercase tracking-wider rounded-xl border flex items-center justify-center space-x-2 transition cursor-pointer ${
                isListening
                  ? "bg-red-900/90 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  : "bg-purple-950/80 hover:bg-purple-900 border-purple-700/60 text-purple-200"
              }`}
            >
              <Mic className={`w-4 h-4 ${isListening ? "animate-bounce text-white" : "text-purple-400"}`} />
              <span>{isListening ? "Escuchando Voz..." : "Consultar por Micrófono"}</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="py-3 px-4 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 text-white font-cinzel font-semibold text-xs sm:text-sm tracking-wide rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-purple-400/30 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Compass className="w-4 h-4 animate-spin text-purple-200" />
                  <span>Canalizando Registros Akáshicos...</span>
                </>
              ) : (
                <span>Revelar Vida Pasada</span>
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleGeneralSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-gothic text-indigo-300 font-medium flex items-center space-x-1.5 tracking-wide">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Formula tu Pregunta por Voz o Texto</span>
              </label>
              <button
                type="button"
                onClick={toggleMicrophone}
                className={`px-2.5 py-1 rounded-lg text-xs font-gothic font-medium flex items-center space-x-1.5 transition border cursor-pointer ${
                  isListening
                    ? "bg-red-950 border-red-500 text-red-300 animate-pulse"
                    : "bg-indigo-950/80 hover:bg-indigo-900/80 border-indigo-700/60 text-indigo-300"
                }`}
              >
                {isListening ? (
                  <>
                    <Mic className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                    <span>Escuchando...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Usar Micrófono</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                placeholder={isListening ? "Escuchando tu voz... Di tu pregunta libremente..." : "Ej: ¿Cuál es el aprendizaje o propósito de mi alma en esta encarnación?"}
                value={generalQuestion}
                onChange={(e) => setGeneralQuestion(e.target.value)}
                className={`w-full bg-[#080410] border rounded-xl p-3 pr-10 text-sm text-indigo-100 placeholder-indigo-900/60 focus:outline-none font-gothic resize-none ${
                  isListening ? "border-red-500 bg-red-950/20" : "border-indigo-900/50 focus:border-indigo-400"
                }`}
              />
              <button
                type="button"
                onClick={toggleMicrophone}
                className="absolute right-3 top-3 p-1 text-indigo-400 hover:text-indigo-200 transition cursor-pointer"
              >
                {isListening ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-indigo-400" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={toggleMicrophone}
              className={`py-3 px-4 font-gothic font-semibold text-xs uppercase tracking-wider rounded-xl border flex items-center justify-center space-x-2 transition cursor-pointer ${
                isListening
                  ? "bg-red-900/90 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  : "bg-indigo-950/80 hover:bg-indigo-900 border-indigo-700/60 text-indigo-200"
              }`}
            >
              <Mic className={`w-4 h-4 ${isListening ? "animate-bounce text-white" : "text-indigo-400"}`} />
              <span>{isListening ? "Escuchando..." : "Dictar por Micrófono"}</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="py-3 px-4 bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-800 hover:from-indigo-600 hover:to-purple-500 text-white font-cinzel font-semibold text-xs sm:text-sm tracking-wide rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-indigo-400/30 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Compass className="w-4 h-4 animate-spin text-indigo-200" />
                  <span>Canalizando respuesta...</span>
                </>
              ) : (
                <span>Preguntar a la Tabla</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
