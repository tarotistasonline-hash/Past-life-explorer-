import React, { useState } from "react";
import { DailyArcana } from "../types";
import { getRandomArcana, getLocalizedArcana, MAJOR_ARCANA } from "../lib/tarotData";
import { MarseilleCardArt } from "./MarseilleCardArt";
import { audio } from "../lib/audio";
import { useLanguage } from "../context/LanguageContext";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";
import { saveSpreadToGrimorio } from "../lib/grimorioStorage";
import { copyMysticShareText, downloadParchmentImage } from "../lib/parchmentExport";
import { getAdminHeaders, isAdminSession } from "../lib/adminTracking";
import {
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  Share2,
  Check,
  Eye,
  Download,
  Scroll,
  Layers,
  Sparkle
} from "lucide-react";

interface KarmicThreeCardSpreadProps {
  onSendToOuija?: (cardName: string) => void;
}

export const KarmicThreeCardSpread: React.FC<KarmicThreeCardSpreadProps> = ({ onSendToOuija }) => {
  const { t, language } = useLanguage();
  const [seekerName, setSeekerName] = useState("");
  const [queryTopic, setQueryTopic] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const [pastCard, setPastCard] = useState<DailyArcana | null>(null);
  const [presentCard, setPresentCard] = useState<DailyArcana | null>(null);
  const [futureCard, setFutureCard] = useState<DailyArcana | null>(null);

  const [flippedCards, setFlippedCards] = useState<{ past: boolean; present: boolean; future: boolean }>({
    past: false,
    present: false,
    future: false,
  });

  const [synthesisText, setSynthesisText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleStartDraw = async () => {
    setIsDrawing(true);
    triggerHaptic(HAPTIC_PATTERNS.tarotShuffle);
    audio.playMysticSwell();

    // Select 3 unique cards
    const card1 = getRandomArcana(undefined, language);
    const card2 = getRandomArcana(card1.id, language);
    const card3 = getRandomArcana([card1.id, card2.id] as any, language);

    setPastCard(card1);
    setPresentCard(card2);
    setFutureCard(card3);
    setFlippedCards({ past: false, present: false, future: false });

    // Request AI Synthesis or fallback
    try {
      const res = await fetch("/api/tarot/karmic-spread", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({
          seekerName: seekerName || "Buscador",
          queryTopic: queryTopic || "Evolución y Destino del Alma",
          cards: [card1.name, card2.name, card3.name],
          lang: language,
          isAdmin: isAdminSession(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSynthesisText(data.synthesis || generateFallbackSynthesis(card1, card2, card3, seekerName));
        window.dispatchEvent(new CustomEvent("ouija-consultation-recorded"));
      } else {
        setSynthesisText(generateFallbackSynthesis(card1, card2, card3, seekerName));
      }
    } catch {
      setSynthesisText(generateFallbackSynthesis(card1, card2, card3, seekerName));
    }

    setTimeout(() => {
      setIsDrawing(false);
      setHasDrawn(true);
      // Auto flip first card
      flipCard("past", card1);
    }, 1200);
  };

  const generateFallbackSynthesis = (c1: DailyArcana, c2: DailyArcana, c3: DailyArcana, name: string) => {
    return `${name ? name + ", e" : "E"}l hilo de tu destino kármico revela que en tu pasado la energía de ${c1.name} sentó las bases de tus memorias akáshicas. En el presente, ${c2.name} representa la prueba viva que debes abrazar para trascender bloqueos. Finalmente, ${c3.name} ilumina tu sendero futuro como la llave de maestría y elevación espiritual.`;
  };

  const flipCard = (position: "past" | "present" | "future", cardObj?: DailyArcana | null) => {
    if (flippedCards[position]) return;
    triggerHaptic(HAPTIC_PATTERNS.tarotCardFlip);
    audio.playChime(600);

    setFlippedCards((prev) => {
      const next = { ...prev, [position]: true };
      // If all are flipped, auto save to grimorio
      if (next.past && next.present && next.future && pastCard && presentCard && futureCard) {
        triggerHaptic(HAPTIC_PATTERNS.revelationUnlock);
        saveSpreadToGrimorio({
          id: `spread_${Date.now()}`,
          timestamp: Date.now(),
          seekerName: seekerName || "Buscador",
          queryTopic: queryTopic || "Lectura Kármica de 3 Cartas",
          pastCard: pastCard,
          presentCard: presentCard,
          futureCard: futureCard,
          synthesis: synthesisText,
        });
      }
      return next;
    });
  };

  const handleShareWhatsApp = async () => {
    if (!pastCard || !presentCard || !futureCard) return;
    const ok = await copyMysticShareText({
      title: `Tirada Kármica: ${pastCard.name} • ${presentCard.name} • ${futureCard.name}`,
      seekerName: seekerName || "Buscador",
      bodyText: `📜 *PASADO (Origen):* ${pastCard.name} - ${pastCard.archetype}\n⚔️ *PRESENTE (Desafío):* ${presentCard.name} - ${presentCard.dailyMessage}\n🌟 *FUTURO (Trascendencia):* ${futureCard.name} - ${futureCard.dailyAffirmation}\n\n🔮 *Síntesis Akáshica:*\n${synthesisText}`,
      karmicLesson: presentCard.practicalAdvice,
      type: "SPREAD",
    });

    if (ok) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleDownloadParchment = async () => {
    setIsDownloading(true);
    await downloadParchmentImage("karmic-spread-parchment-box", `tirada-karmica-${Date.now()}.png`);
    setIsDownloading(false);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      audio.stopTarotNarration();
      setIsSpeaking(false);
    } else {
      if (!pastCard || !presentCard || !futureCard) return;
      setIsSpeaking(true);
      const textToRead = `Tirada Kármica de 3 Cartas para ${seekerName || "el alma consultante"}. Pasado: ${pastCard.name}. Presente: ${presentCard.name}. Futuro: ${futureCard.name}. ${synthesisText}`;
      audio.speakSpiritText(
        textToRead,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        language
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Consultation Input Form Bar */}
      {!hasDrawn && (
        <div className="bg-purple-950/40 border border-purple-800/60 rounded-2xl p-4 sm:p-6 backdrop-blur-md text-center max-w-xl mx-auto space-y-4 shadow-xl">
          <div className="space-y-1">
            <h3 className="font-cinzel text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-indigo-200 to-amber-200">
              Tirada Kármica de 3 Cartas
            </h3>
            <p className="text-xs font-gothic text-purple-300/80">
              Revela la raíz de tu alma (Pasado), tu desafío evolutivo (Presente) y tu trascendencia (Destino).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div>
              <label className="block text-[11px] font-cinzel text-purple-300 mb-1">
                Tu Nombre o Iniciales
              </label>
              <input
                type="text"
                value={seekerName}
                onChange={(e) => setSeekerName(e.target.value)}
                placeholder="Ej. Helena"
                className="w-full px-3 py-2 bg-neutral-950/80 border border-purple-700/50 rounded-xl text-purple-100 placeholder-purple-600/60 text-xs font-gothic focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-cinzel text-purple-300 mb-1">
                Intención o Pregunta
              </label>
              <input
                type="text"
                value={queryTopic}
                onChange={(e) => setQueryTopic(e.target.value)}
                placeholder="Ej. Amor, Propósito, Sanación"
                className="w-full px-3 py-2 bg-neutral-950/80 border border-purple-700/50 rounded-xl text-purple-100 placeholder-purple-600/60 text-xs font-gothic focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartDraw}
            disabled={isDrawing}
            className="w-full py-3 bg-gradient-to-r from-purple-700 via-indigo-600 to-amber-600 hover:from-purple-600 hover:to-indigo-500 text-white font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase rounded-xl transition cursor-pointer shadow-[0_0_25px_rgba(168,85,247,0.4)] flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
            <span>{isDrawing ? "Invocando los 3 Arcanos..." : "Barajar e Invocar Tirada Kármica"}</span>
          </button>
        </div>
      )}

      {/* 3-Card Display Board */}
      {hasDrawn && pastCard && presentCard && futureCard && (
        <div id="karmic-spread-parchment-box" className="space-y-6 animate-fade-in">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-900/60 pb-3">
            <div>
              <div className="text-[11px] font-cinzel text-purple-300 font-semibold uppercase tracking-wider">
                Lectura Kármica para {seekerName || "Alma Consultante"}
              </div>
              <h3 className="font-decorative text-xl font-bold text-purple-100">
                Pasado • Presente • Futuro
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSpeech}
                title={isSpeaking ? "Silenciar" : "Escuchar Lectura"}
                className={`p-2 rounded-full border transition cursor-pointer ${
                  isSpeaking
                    ? "bg-purple-900 border-purple-400 text-purple-100 animate-pulse"
                    : "bg-purple-950/70 border-purple-800 text-purple-300 hover:text-white"
                }`}
              >
                {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-1.5 rounded-full bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-cinzel transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-purple-400" />}
                <span>{isCopied ? "¡Copiado!" : "Compartir Papiro"}</span>
              </button>

              <button
                onClick={handleDownloadParchment}
                disabled={isDownloading}
                className="px-3 py-1.5 rounded-full bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/50 text-amber-200 text-xs font-cinzel transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>{isDownloading ? "Generando..." : "Descargar PNG"}</span>
              </button>

              <button
                onClick={() => {
                  setHasDrawn(false);
                  audio.stopTarotNarration();
                  setIsSpeaking(false);
                }}
                className="p-2 rounded-full bg-neutral-900 border border-purple-900 text-purple-300 hover:text-white transition cursor-pointer"
                title="Nueva Tirada"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cards 3-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. PAST / RAÍZ */}
            <div className="flex flex-col items-center space-y-3 bg-[#0d0718]/80 border border-purple-900/50 rounded-2xl p-4 shadow-xl">
              <div className="text-center">
                <span className="px-3 py-0.5 rounded-full bg-purple-950 border border-purple-700 text-purple-300 font-cinzel text-[11px] font-bold uppercase tracking-wider">
                  1. Pasado / Raíz Kármica
                </span>
              </div>

              <div 
                onClick={() => flipCard("past", pastCard)}
                className="cursor-pointer transition-transform hover:scale-102"
              >
                {flippedCards.past ? (
                  <div className="w-40 sm:w-48 aspect-[1/1.7] rounded-xl overflow-hidden shadow-[0_0_25px_rgba(168,85,247,0.35)] border-2 border-purple-500/60">
                    <MarseilleCardArt
                      cardId={pastCard.id}
                      romanNumber={pastCard.romanNumber}
                      marseilleTitle={pastCard.marseilleTitle}
                      name={pastCard.name}
                      colorHex={pastCard.colorHex}
                      arcana={pastCard}
                      isFlipped={true}
                    />
                  </div>
                ) : (
                  <div className="w-40 sm:w-48 aspect-[1/1.7] rounded-xl bg-gradient-to-br from-purple-950 via-[#190d2e] to-black border-2 border-dashed border-purple-600/60 flex flex-col items-center justify-center p-4 text-center text-purple-300 animate-pulse">
                    <Sparkles className="w-6 h-6 text-purple-400 mb-2" />
                    <span className="font-cinzel text-xs font-bold">Tocar para Revelar</span>
                  </div>
                )}
              </div>

              {flippedCards.past && (
                <div className="text-center space-y-1 font-gothic text-xs">
                  <div className="font-cinzel font-bold text-purple-200 text-sm">
                    {pastCard.romanNumber} - {pastCard.name}
                  </div>
                  <p className="text-purple-300/80 leading-relaxed italic">
                    "{pastCard.archetype}"
                  </p>
                </div>
              )}
            </div>

            {/* 2. PRESENT / DESAFÍO */}
            <div className="flex flex-col items-center space-y-3 bg-[#0d0718]/80 border border-indigo-900/50 rounded-2xl p-4 shadow-xl">
              <div className="text-center">
                <span className="px-3 py-0.5 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 font-cinzel text-[11px] font-bold uppercase tracking-wider">
                  2. Presente / Desafío Vivo
                </span>
              </div>

              <div 
                onClick={() => flipCard("present", presentCard)}
                className="cursor-pointer transition-transform hover:scale-102"
              >
                {flippedCards.present ? (
                  <div className="w-40 sm:w-48 aspect-[1/1.7] rounded-xl overflow-hidden shadow-[0_0_25px_rgba(99,102,241,0.35)] border-2 border-indigo-500/60">
                    <MarseilleCardArt
                      cardId={presentCard.id}
                      romanNumber={presentCard.romanNumber}
                      marseilleTitle={presentCard.marseilleTitle}
                      name={presentCard.name}
                      colorHex={presentCard.colorHex}
                      arcana={presentCard}
                      isFlipped={true}
                    />
                  </div>
                ) : (
                  <div className="w-40 sm:w-48 aspect-[1/1.7] rounded-xl bg-gradient-to-br from-indigo-950 via-[#120d2e] to-black border-2 border-dashed border-indigo-600/60 flex flex-col items-center justify-center p-4 text-center text-indigo-300 animate-pulse">
                    <Sparkles className="w-6 h-6 text-indigo-400 mb-2" />
                    <span className="font-cinzel text-xs font-bold">Tocar para Revelar</span>
                  </div>
                )}
              </div>

              {flippedCards.present && (
                <div className="text-center space-y-1 font-gothic text-xs">
                  <div className="font-cinzel font-bold text-indigo-200 text-sm">
                    {presentCard.romanNumber} - {presentCard.name}
                  </div>
                  <p className="text-indigo-300/80 leading-relaxed">
                    {presentCard.practicalAdvice}
                  </p>
                </div>
              )}
            </div>

            {/* 3. FUTURE / TRASCENDENCIA */}
            <div className="flex flex-col items-center space-y-3 bg-[#0d0718]/80 border border-amber-900/50 rounded-2xl p-4 shadow-xl">
              <div className="text-center">
                <span className="px-3 py-0.5 rounded-full bg-amber-950 border border-amber-700 text-amber-300 font-cinzel text-[11px] font-bold uppercase tracking-wider">
                  3. Futuro / Trascendencia
                </span>
              </div>

              <div 
                onClick={() => flipCard("future", futureCard)}
                className="cursor-pointer transition-transform hover:scale-102"
              >
                {flippedCards.future ? (
                  <div className="w-40 sm:w-48 aspect-[1/1.7] rounded-xl overflow-hidden shadow-[0_0_25px_rgba(245,158,11,0.35)] border-2 border-amber-500/60">
                    <MarseilleCardArt
                      cardId={futureCard.id}
                      romanNumber={futureCard.romanNumber}
                      marseilleTitle={futureCard.marseilleTitle}
                      name={futureCard.name}
                      colorHex={futureCard.colorHex}
                      arcana={futureCard}
                      isFlipped={true}
                    />
                  </div>
                ) : (
                  <div className="w-40 sm:w-48 aspect-[1/1.7] rounded-xl bg-gradient-to-br from-amber-950 via-[#26150b] to-black border-2 border-dashed border-amber-600/60 flex flex-col items-center justify-center p-4 text-center text-amber-300 animate-pulse">
                    <Sparkles className="w-6 h-6 text-amber-400 mb-2" />
                    <span className="font-cinzel text-xs font-bold">Tocar para Revelar</span>
                  </div>
                )}
              </div>

              {flippedCards.future && (
                <div className="text-center space-y-1 font-gothic text-xs">
                  <div className="font-cinzel font-bold text-amber-200 text-sm">
                    {futureCard.romanNumber} - {futureCard.name}
                  </div>
                  <p className="text-amber-300/80 leading-relaxed italic">
                    "{futureCard.dailyAffirmation}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Integrated Synthesis Box */}
          {synthesisText && (
            <div className="bg-gradient-to-r from-purple-950/80 via-[#150a26] to-indigo-950/80 border border-purple-600/50 rounded-2xl p-5 shadow-2xl space-y-2">
              <div className="flex items-center space-x-2 text-purple-300 font-cinzel text-xs font-bold uppercase tracking-wider">
                <Scroll className="w-4 h-4 text-purple-400" />
                <span>Síntesis Akáshica del Destino</span>
              </div>
              <p className="font-gothic text-purple-100 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {synthesisText}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
