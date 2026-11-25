import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Download,
  Volume2,
  Square,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  ArrowUpRight,
  Orbit,
  SlidersHorizontal,
  Image as ImageIcon,
  Mic,
  MicOff,
  Lock,
} from "lucide-react";
import type { NatalChartData, NatalChartReading } from "../types";
import {
  QUICK_CITIES,
  buildLocalNatalReading,
  buildNatalSpokenScript,
  calculateNatalChart,
  exportNatalChartPdf,
  parseSpokenNatalInput,
  previewLocationAndTimezone,
} from "../lib/natalChart";
import { NatalWheelSvg } from "./NatalWheelSvg";
import { useLanguage } from "../context/LanguageContext";
import { audio } from "../lib/audio";
import { downloadParchmentImage } from "../lib/parchmentExport";
import { getAdminHeaders } from "../lib/adminTracking";
import natalChartBgImg from "../assets/images/natal_chart_bg_1795566263288.jpg";

export interface NatalRequestPayload {
  name: string;
  birthDate: string;
  birthTime: string;
  hasExactTime: boolean;
  birthCity: string;
  birthCountry: string;
  latitudeOverride?: number | null;
  longitudeOverride?: number | null;
  manualOffsetHours?: number | null;
}

interface NatalChartSectionProps {
  onSendToOuija?: (query: string) => void;
  isPaywallEnabled?: boolean;
  freeLimit?: number;
  remainingFree?: number;
  isPassUnlocked?: boolean;
  isCreatorUnlimited?: boolean;
  onOpenPaywall?: () => void;
  onConsumeFreeConsultation?: () => void;
  onQueuePendingNatal?: (data: NatalRequestPayload) => void;
  pendingNatalExecution?: { id: string; data: NatalRequestPayload } | null;
  onPendingNatalHandled?: (id: string) => void;
  mpLink?: string;
  passPriceArs?: string;
}

const SAVED_CHART_KEY = "ouija_natal_chart_saved_v1";

export const NatalChartSection: React.FC<NatalChartSectionProps> = ({
  onSendToOuija,
  isPaywallEnabled = false,
  freeLimit = 2,
  remainingFree = 2,
  isPassUnlocked = false,
  isCreatorUnlimited = false,
  onOpenPaywall,
  onConsumeFreeConsultation,
  onQueuePendingNatal,
  pendingNatalExecution,
  onPendingNatalHandled,
  mpLink = "https://mpago.la/2cv7Gii",
  passPriceArs = "",
}) => {
  const { t, language } = useLanguage();

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("1990-01-15");
  const [birthTime, setBirthTime] = useState("14:30");
  const [hasExactTime, setHasExactTime] = useState(true);
  const [birthCity, setBirthCity] = useState("Buenos Aires");
  const [birthCountry, setBirthCountry] = useState("Argentina");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useManualCoords, setUseManualCoords] = useState(false);
  const [manualLat, setManualLat] = useState("-34.6037");
  const [manualLon, setManualLon] = useState("-58.3816");
  const [useManualOffset, setUseManualOffset] = useState(false);
  const [manualOffset, setManualOffset] = useState("-3");

  const [autoNarrate, setAutoNarrate] = useState(true);
  const autoNarrateRef = useRef(true);
  useEffect(() => {
    autoNarrateRef.current = autoNarrate;
  }, [autoNarrate]);

  // Voice Dictation State
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [micTranscript, setMicTranscript] = useState("");
  const [micFeedback, setMicFeedback] = useState("");
  const recognitionRef = useRef<any>(null);

  const [chart, setChart] = useState<NatalChartData | null>(null);
  const [reading, setReading] = useState<NatalChartReading | null>(null);
  const [activeTab, setActiveTab] = useState<"wheel" | "positions" | "aspects" | "reading">("wheel");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_CHART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.chart && parsed?.reading) {
          setChart(parsed.chart);
          setReading(parsed.reading);
          if (parsed.chart.seekerName && parsed.chart.seekerName !== "Consultante") {
            setName(parsed.chart.seekerName);
          }
          if (parsed.chart.birthDate) setBirthDate(parsed.chart.birthDate);
          if (parsed.chart.hasExactTime !== undefined) setHasExactTime(parsed.chart.hasExactTime);
          if (parsed.chart.birthTime && !String(parsed.chart.birthTime).includes("Aprox")) {
            setBirthTime(parsed.chart.birthTime);
          }
          if (parsed.chart.birthCity) setBirthCity(parsed.chart.birthCity);
          if (parsed.chart.birthCountry) setBirthCountry(parsed.chart.birthCountry);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    const handleVoiceState = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail.isSpeaking === "boolean") {
        setIsSpeaking(detail.isSpeaking);
      }
    };
    const handleHistoryCleared = () => {
      audio.stopSpeech();
      setIsSpeaking(false);
      setChart(null);
      setReading(null);
      setMicTranscript("");
      setMicFeedback("");
      setFormError("");
    };
    window.addEventListener("ouija_voice_state", handleVoiceState);
    window.addEventListener("ouija-history-cleared", handleHistoryCleared);
    return () => {
      window.removeEventListener("ouija_voice_state", handleVoiceState);
      window.removeEventListener("ouija-history-cleared", handleHistoryCleared);
    };
  }, []);

  const livePreview = useMemo(() => {
    const parsedManualOff = useManualOffset ? parseFloat(manualOffset) : null;
    return previewLocationAndTimezone({
      birthDate,
      birthTime,
      hasExactTime,
      birthCity,
      birthCountry,
      manualOffsetHours: parsedManualOff !== null && Number.isFinite(parsedManualOff) ? parsedManualOff : null,
    });
  }, [birthDate, birthTime, hasExactTime, birthCity, birthCountry, useManualOffset, manualOffset]);

  const getRecognitionLang = () => {
    switch (language) {
      case "en":
        return "en-US";
      case "pt":
        return "pt-BR";
      case "fr":
        return "fr-FR";
      case "it":
        return "it-IT";
      case "de":
        return "de-DE";
      default:
        return "es-AR";
    }
  };

  const applySpokenTranscript = useCallback(
    (transcriptText: string, isFinal: boolean) => {
      setMicTranscript(transcriptText);
      const parsed = parseSpokenNatalInput(transcriptText);
      const tags: string[] = [];

      if (parsed.name) {
        setName(parsed.name);
        tags.push(`Nombre: ${parsed.name}`);
      }
      if (parsed.birthDate) {
        setBirthDate(parsed.birthDate);
        tags.push(`Fecha: ${parsed.birthDate}`);
      }
      if (parsed.birthTime) {
        setHasExactTime(true);
        setBirthTime(parsed.birthTime);
        tags.push(`Hora: ${parsed.birthTime}`);
      }
      if (parsed.birthCity) {
        setBirthCity(parsed.birthCity);
        if (parsed.birthCountry) setBirthCountry(parsed.birthCountry);
        tags.push(`Lugar: ${parsed.birthCity}`);
      }

      if (isFinal) {
        setMicFeedback(
          tags.length > 0
            ? `Datos detectados por voz: ${tags.join(" • ")}`
            : language === "en"
            ? "Could not parse date or city clearly. Try: Name, 15 January 1990 at 14:30 in Buenos Aires."
            : "Di tu nombre, fecha, hora y ciudad (ej: Elena Montes, 15 de enero de 1990 a las 14:30 en Buenos Aires)."
        );
      }
    },
    [language]
  );

  const toggleMicrophone = () => {
    setFormError("");
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicSupported(false);
      setMicFeedback(t("micNotSupported"));
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    audio.stopSpeech();
    setMicFeedback("");
    setMicTranscript("");

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = getRecognitionLang();
      recognition.interimResults = true;
      recognition.continuous = false;

      let latestTranscript = "";

      recognition.onstart = () => {
        setIsListening(true);
        audio.playChime(600);
      };

      recognition.onresult = (event: any) => {
        latestTranscript = Array.from(event.results)
          .map((res: any) => res[0])
          .map((res: any) => res.transcript)
          .join(" ")
          .trim();
        const isFinal = Boolean(event.results[event.results.length - 1]?.isFinal);
        applySpokenTranscript(latestTranscript, isFinal);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === "not-allowed") {
          setMicFeedback(t("micDenied"));
        } else {
          setMicFeedback(t("micError"));
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (latestTranscript) {
          applySpokenTranscript(latestTranscript, true);
        }
        audio.playChime(432);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setMicFeedback("No se pudo iniciar el micrófono.");
    }
  };

  const speakReadingNow = useCallback(
    (chartData: NatalChartData, readingData: NatalChartReading) => {
      const script = buildNatalSpokenScript(chartData, readingData, language);
      setIsSpeaking(true);
      audio.speakSpiritText(
        script,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        language
      );
    },
    [language]
  );

  const executeNatalCalculation = useCallback(
    async (payload: NatalRequestPayload, consumeFreeAllowance: boolean) => {
      audio.fadeOutForSelection();
      audio.stopSpeech();
      audio.primeSpeech();
      audio.playChime(528);

      const computed = calculateNatalChart({
        name: payload.name || "Consultante",
        birthDate: payload.birthDate,
        birthTime: payload.hasExactTime ? payload.birthTime : "12:00",
        hasExactTime: payload.hasExactTime,
        birthCity: payload.birthCity,
        birthCountry: payload.birthCountry,
        latitudeOverride: payload.latitudeOverride ?? null,
        longitudeOverride: payload.longitudeOverride ?? null,
        manualOffsetHours: payload.manualOffsetHours ?? null,
        language,
      });

      const localReading = buildLocalNatalReading(computed, language);
      setChart(computed);
      setReading(localReading);
      setActiveTab("wheel");

      if (consumeFreeAllowance) {
        onConsumeFreeConsultation?.();
      }

      try {
        localStorage.setItem(SAVED_CHART_KEY, JSON.stringify({ chart: computed, reading: localReading }));
      } catch {
        // ignore
      }

      let finalReading = localReading;
      setIsEnhancing(true);
      try {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 9000);
        const res = await fetch("/api/natal-chart/interpret", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
          },
          body: JSON.stringify({
            chart: computed,
            language,
          }),
        });
        window.clearTimeout(timer);
        if (res.ok) {
          const data = await res.json();
          if (data?.reading) {
            finalReading = {
              ...localReading,
              ...data.reading,
              isAiEnhanced: Boolean(data.isAiEnhanced),
            };
            setReading(finalReading);
            try {
              localStorage.setItem(SAVED_CHART_KEY, JSON.stringify({ chart: computed, reading: finalReading }));
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // gracefully keep deterministic reading
      } finally {
        setIsEnhancing(false);
        if (autoNarrateRef.current) {
          speakReadingNow(computed, finalReading);
        }
      }
    },
    [language, onConsumeFreeConsultation, speakReadingNow]
  );

  // Execute queued Natal Chart automatically right after Mercado Pago unlock
  useEffect(() => {
    if (!pendingNatalExecution) return;
    const { id, data } = pendingNatalExecution;
    setName(data.name === "Consultante" ? "" : data.name);
    setBirthDate(data.birthDate);
    setBirthTime(data.birthTime);
    setHasExactTime(data.hasExactTime);
    setBirthCity(data.birthCity);
    setBirthCountry(data.birthCountry);
    onPendingNatalHandled?.(id);
    executeNatalCalculation(data, false);
  }, [pendingNatalExecution, onPendingNatalHandled, executeNatalCalculation]);

  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (!birthDate) {
      setFormError(t("natalMissingDate"));
      return;
    }

    setFormError("");
    audio.primeSpeech();

    const parsedLat = useManualCoords ? parseFloat(manualLat) : null;
    const parsedLon = useManualCoords ? parseFloat(manualLon) : null;
    const parsedOff = useManualOffset ? parseFloat(manualOffset) : null;

    const payload: NatalRequestPayload = {
      name: name.trim() || "Consultante",
      birthDate,
      birthTime: hasExactTime ? birthTime : "12:00",
      hasExactTime,
      birthCity,
      birthCountry,
      latitudeOverride: parsedLat !== null && Number.isFinite(parsedLat) ? parsedLat : null,
      longitudeOverride: parsedLon !== null && Number.isFinite(parsedLon) ? parsedLon : null,
      manualOffsetHours: parsedOff !== null && Number.isFinite(parsedOff) ? parsedOff : null,
    };

    const blockedByPaywall =
      isPaywallEnabled && !isCreatorUnlimited && !isPassUnlocked && remainingFree <= 0;

    if (blockedByPaywall) {
      audio.stopSpeech();
      onQueuePendingNatal?.(payload);
      onOpenPaywall?.();
      return;
    }

    const shouldConsumeFree = isPaywallEnabled && !isCreatorUnlimited && !isPassUnlocked;
    await executeNatalCalculation(payload, shouldConsumeFree);
  };

  const handleToggleSpeech = () => {
    if (!chart || !reading) return;
    if (isSpeaking) {
      audio.stopSpeech();
      setIsSpeaking(false);
      return;
    }
    audio.primeSpeech();
    speakReadingNow(chart, reading);
  };

  const handleDownloadPdf = async () => {
    if (!chart || !reading) return;
    setIsExportingPdf(true);
    try {
      await exportNatalChartPdf(chart, reading, language);
      audio.playChime(639);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!chart) return;
    setIsExportingPng(true);
    try {
      const safeName = chart.seekerName.replace(/[^a-zA-Z0-9_-]/g, "_") || "carta-natal";
      await downloadParchmentImage("natal-chart-export-card", `carta-natal-${safeName}.png`);
      audio.playChime(528);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleReset = () => {
    audio.stopSpeech();
    setIsSpeaking(false);
    setChart(null);
    setReading(null);
    setFormError("");
    try {
      localStorage.removeItem(SAVED_CHART_KEY);
    } catch {
      // ignore
    }
  };

  const paywallLocked = isPaywallEnabled && !isCreatorUnlimited && !isPassUnlocked && remainingFree <= 0;

  return (
    <section
      aria-label={t("natalTitle")}
      className="w-full max-w-4xl bg-[#0c0716]/95 border border-purple-700/45 rounded-2xl p-4 sm:p-6 shadow-[0_0_40px_rgba(88,28,135,0.28)] backdrop-blur-md space-y-6 relative overflow-hidden"
    >
      {/* Background Photo layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-2xl">
        <img
          src={natalChartBgImg}
          alt="Carta Natal - Rueda Astrológica"
          className="w-full h-full object-cover object-center filter brightness-85 contrast-105 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0716]/95 via-[#0c0716]/70 to-[#0c0716]/60" />
      </div>

      <div className="relative z-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/50 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/90 border border-amber-500/45 flex items-center justify-center shrink-0">
            <Orbit className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-cinzel font-bold text-purple-100 tracking-wide">
              {t("natalTitle")}
            </h2>
            <p className="text-xs text-purple-300/80 font-gothic">
              {t("natalSubtitle")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {micSupported && (
            <button
              type="button"
              onClick={toggleMicrophone}
              className={`px-3 py-1.5 rounded-lg border text-xs font-cinzel font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                isListening
                  ? "bg-rose-950/90 border-rose-400 text-rose-100 shadow-[0_0_14px_rgba(244,63,94,0.4)]"
                  : "bg-purple-950/80 hover:bg-purple-900 border-amber-500/45 text-amber-200"
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5 text-rose-300" /> : <Mic className="w-3.5 h-3.5 text-amber-300" />}
              <span>
                {isListening
                  ? language === "en"
                    ? "Listening..."
                    : "Escuchando..."
                  : language === "en"
                  ? "Dictate by Voice"
                  : "Dictar por Voz"}
              </span>
            </button>
          )}

          {chart && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-cinzel font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t("natalNewChart")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Voice Dictation Banner */}
      {(isListening || micFeedback || micTranscript) && (
        <div
          className={`px-3.5 py-2.5 rounded-xl border text-xs space-y-1 ${
            isListening
              ? "bg-rose-950/40 border-rose-500/50 text-rose-100"
              : "bg-purple-950/60 border-purple-600/50 text-purple-200"
          }`}
        >
          {isListening && (
            <div className="font-cinzel font-semibold text-rose-200">
              {language === "en"
                ? 'Speak clearly, e.g.: "Elena Montes, 15 January 1990 at 14:30 in Buenos Aires"'
                : 'Habla ahora, ej: "Elena Montes, 15 de enero de 1990 a las 14:30 en Buenos Aires"'}
            </div>
          )}
          {micTranscript && <div className="italic text-purple-200/90">"{micTranscript}"</div>}
          {micFeedback && <div className="text-[11px] text-amber-300 font-medium">{micFeedback}</div>}
        </div>
      )}

      {/* Birth Data Form */}
      <form onSubmit={handleCalculate} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Name */}
          <div className="space-y-1">
            <label htmlFor="natal-name" className="block text-[11px] font-cinzel font-semibold text-purple-200 uppercase tracking-wider">
              {t("natalNameLabel")}
            </label>
            <input
              id="natal-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("natalNamePlaceholder")}
              className="w-full bg-[#130b22] border border-purple-800/60 focus:border-amber-400/80 rounded-xl px-3 py-2 text-sm text-purple-100 placeholder-purple-500/60 focus:outline-none"
            />
          </div>

          {/* Birth Date */}
          <div className="space-y-1">
            <label htmlFor="natal-date" className="flex items-center gap-1.5 text-[11px] font-cinzel font-semibold text-purple-200 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{t("natalDateLabel")}</span>
            </label>
            <input
              id="natal-date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-[#130b22] border border-purple-800/60 focus:border-amber-400/80 rounded-xl px-3 py-2 text-sm font-mono tabular-nums text-purple-100 focus:outline-none"
            />
          </div>

          {/* Birth Time */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="natal-time" className="flex items-center gap-1.5 text-[11px] font-cinzel font-semibold text-purple-200 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{t("natalTimeLabel")}</span>
              </label>
              <label className="flex items-center gap-1 text-[11px] text-purple-300/80 cursor-pointer whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={!hasExactTime}
                  onChange={(e) => setHasExactTime(!e.target.checked)}
                  className="accent-amber-400 rounded"
                />
                <span>{t("natalUnknownTime")}</span>
              </label>
            </div>
            <input
              id="natal-time"
              type="time"
              disabled={!hasExactTime}
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className={`w-full bg-[#130b22] border border-purple-800/60 focus:border-amber-400/80 rounded-xl px-3 py-2 text-sm font-mono tabular-nums text-purple-100 focus:outline-none ${
                hasExactTime ? "" : "opacity-40 cursor-not-allowed"
              }`}
            />
          </div>

          {/* Birth City & Country */}
          <div className="space-y-1">
            <label htmlFor="natal-city" className="flex items-center gap-1.5 text-[11px] font-cinzel font-semibold text-purple-200 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{t("natalPlaceLabel")}</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                id="natal-city"
                type="text"
                value={birthCity}
                onChange={(e) => setBirthCity(e.target.value)}
                placeholder={t("natalCityPlaceholder")}
                className="w-full bg-[#130b22] border border-purple-800/60 focus:border-amber-400/80 rounded-xl px-2.5 py-2 text-xs text-purple-100 placeholder-purple-500/60 focus:outline-none"
              />
              <input
                aria-label={t("natalCountryPlaceholder")}
                type="text"
                value={birthCountry}
                onChange={(e) => setBirthCountry(e.target.value)}
                placeholder={t("natalCountryPlaceholder")}
                className="w-full bg-[#130b22] border border-purple-800/60 focus:border-amber-400/80 rounded-xl px-2.5 py-2 text-xs text-purple-100 placeholder-purple-500/60 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quick City Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] text-purple-400 font-cinzel shrink-0 mr-1">{t("natalQuickCities")}:</span>
          {QUICK_CITIES.map((qc) => {
            const active =
              birthCity.toLowerCase().trim() === qc.city.toLowerCase() &&
              birthCountry.toLowerCase().trim() === qc.country.toLowerCase();
            return (
              <button
                key={qc.label}
                type="button"
                onClick={() => {
                  setBirthCity(qc.city);
                  setBirthCountry(qc.country);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-gothic border transition cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? "bg-purple-800/70 border-amber-400/70 text-amber-100"
                    : "bg-[#130b22]/80 border-purple-800/50 text-purple-300 hover:text-white hover:border-purple-600"
                }`}
              >
                {qc.label}
              </button>
            );
          })}
        </div>

        {/* Live Historical Timezone & DST Detection Strip */}
        <div className="px-3.5 py-2.5 rounded-xl bg-[#120a20] border border-purple-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono tabular-nums text-purple-200">
              {livePreview.cityDisplay}, {livePreview.countryDisplay} ({Math.abs(livePreview.latitude).toFixed(2)}°{livePreview.latitude >= 0 ? "N" : "S"}, {Math.abs(livePreview.longitude).toFixed(2)}°{livePreview.longitude >= 0 ? "E" : "O"})
            </span>
            <span className="font-mono tabular-nums px-2 py-0.5 rounded bg-purple-950 border border-purple-600/50 text-amber-200 font-semibold">
              {livePreview.tzInfo.offsetLabel}
            </span>
          </div>
          <div className={`text-[11px] font-gothic ${livePreview.tzInfo.isDst ? "text-amber-300 font-medium" : "text-purple-300/85"}`}>
            {livePreview.tzInfo.dstNote}
          </div>
        </div>

        {/* Advanced Toggle & Auto-Voice Narration Option */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-[11px] font-cinzel text-purple-300 hover:text-amber-200 flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t("natalAdvancedToggle")}</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <label className="flex items-center gap-2 text-xs text-purple-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoNarrate}
              onChange={(e) => setAutoNarrate(e.target.checked)}
              className="accent-amber-400 rounded"
            />
            <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {language === "en"
                ? "Narrate birth chart aloud automatically"
                : "Narrar carta por voz automáticamente"}
            </span>
          </label>
        </div>

        {showAdvanced && (
          <div className="p-3 rounded-xl bg-[#10081c] border border-purple-800/50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-purple-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useManualCoords}
                  onChange={(e) => setUseManualCoords(e.target.checked)}
                  className="accent-amber-400"
                />
                <span>Coordenadas manuales</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  disabled={!useManualCoords}
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  placeholder="Lat (-34.60)"
                  className="bg-[#180d29] border border-purple-800/60 rounded-lg px-2 py-1.5 font-mono text-purple-100 disabled:opacity-40"
                />
                <input
                  type="text"
                  disabled={!useManualCoords}
                  value={manualLon}
                  onChange={(e) => setManualLon(e.target.value)}
                  placeholder="Lon (-58.38)"
                  className="bg-[#180d29] border border-purple-800/60 rounded-lg px-2 py-1.5 font-mono text-purple-100 disabled:opacity-40"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-purple-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useManualOffset}
                  onChange={(e) => setUseManualOffset(e.target.checked)}
                  className="accent-amber-400"
                />
                <span>Forzar Huso UTC manual</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="-12"
                max="14"
                disabled={!useManualOffset}
                value={manualOffset}
                onChange={(e) => setManualOffset(e.target.value)}
                className="w-full bg-[#180d29] border border-purple-800/60 rounded-lg px-2.5 py-1.5 font-mono text-purple-100 disabled:opacity-40"
              />
            </div>

            <div className="text-[11px] text-purple-300/80 flex items-center">
              El sistema ya resuelve automáticamente horarios de verano históricos argentinos (1940–1969, 1974, 1988–1993, 2007–2009) e IANA mundial.
            </div>
          </div>
        )}

        {formError && (
          <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-700/60 rounded-xl px-3 py-2">
            {formError}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            className={`px-6 py-2.5 rounded-xl font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              paywallLocked
                ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 border border-amber-200/80 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                : "bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white border border-violet-300/60 shadow-[0_0_20px_rgba(139,92,246,0.35)]"
            }`}
          >
            {paywallLocked ? <Lock className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-amber-200" />}
            <span>
              {paywallLocked
                ? language === "en"
                  ? "Unlock & Calculate Chart"
                  : "Desbloquear y Calcular Carta"
                : t("natalCalculateBtn")}
            </span>
          </button>

          {chart && reading && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSpeech}
                className={`px-3.5 py-2 rounded-xl border text-xs font-cinzel font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isSpeaking
                    ? "bg-rose-950/85 hover:bg-rose-900 border-rose-400/70 text-rose-100"
                    : "bg-purple-950/85 hover:bg-purple-900 border-purple-600/70 text-purple-100"
                }`}
              >
                {isSpeaking ? <Square className="w-3.5 h-3.5 text-rose-300" /> : <Volume2 className="w-3.5 h-3.5 text-amber-300" />}
                <span>{isSpeaking ? t("natalStopVoice") : t("natalListenBtn")}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="px-3.5 py-2 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 border border-amber-400/60 text-amber-200 text-xs font-cinzel font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingPdf ? "..." : t("natalExportPdf")}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={isExportingPng}
                className="px-3 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-cinzel font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{isExportingPng ? "..." : "PNG"}</span>
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Calculated Natal Chart Results */}
      {chart && reading && (
        <div id="natal-chart-export-card" className="space-y-5 pt-2 border-t border-purple-900/50">
          {/* Primary Triad Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-[#130a24] border border-amber-500/35">
              <div className="flex items-center justify-between text-[11px] font-cinzel text-amber-300/90">
                <span>Sol</span>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="mt-1 text-base font-cinzel font-bold text-white">
                {chart.sun.signSymbol} {chart.sun.sign}
              </div>
              <div className="text-[11px] font-mono tabular-nums text-purple-300/80">
                {String(chart.sun.degree).padStart(2, "0")}°{String(chart.sun.minutes).padStart(2, "0")}' • Casa {chart.sun.house}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#130a24] border border-sky-500/35">
              <div className="flex items-center justify-between text-[11px] font-cinzel text-sky-300/90">
                <span>Luna</span>
                <Moon className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="mt-1 text-base font-cinzel font-bold text-white">
                {chart.moon.signSymbol} {chart.moon.sign}
              </div>
              <div className="text-[11px] font-mono tabular-nums text-purple-300/80">
                {String(chart.moon.degree).padStart(2, "0")}°{String(chart.moon.minutes).padStart(2, "0")}' • Casa {chart.moon.house}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#130a24] border border-rose-500/35">
              <div className="flex items-center justify-between text-[11px] font-cinzel text-rose-300/90">
                <span>Ascendente</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="mt-1 text-base font-cinzel font-bold text-white">
                {chart.ascendant.signSymbol} {chart.ascendant.sign}
              </div>
              <div className="text-[11px] font-mono tabular-nums text-purple-300/80">
                {String(chart.ascendant.degree).padStart(2, "0")}°{String(chart.ascendant.minutes).padStart(2, "0")}' • Reg. {chart.ascendant.ruler}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#130a24] border border-purple-500/40">
              <div className="flex items-center justify-between text-[11px] font-cinzel text-purple-300/90">
                <span>Medio Cielo (MC)</span>
                <span className="font-mono text-[10px] text-amber-300">{chart.timezoneInfo.offsetLabel}</span>
              </div>
              <div className="mt-1 text-base font-cinzel font-bold text-white">
                {chart.midheaven.signSymbol} {chart.midheaven.sign}
              </div>
              <div className="text-[11px] font-mono tabular-nums text-purple-300/80">
                {String(chart.midheaven.degree).padStart(2, "0")}°{String(chart.midheaven.minutes).padStart(2, "0")}' • ☊ {chart.northNode.sign}
              </div>
            </div>
          </div>

          {/* Sub-navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-purple-900/50">
            {(
              [
                ["wheel", t("natalTabWheel")],
                ["positions", t("natalTabPositions")],
                ["aspects", `${t("natalTabAspects")} (${chart.aspects.length})`],
                ["reading", t("natalTabReading")],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-cinzel font-semibold transition cursor-pointer whitespace-nowrap shrink-0 border-b-2 ${
                  activeTab === key
                    ? "bg-purple-900/50 text-white border-amber-400"
                    : "text-purple-300/80 hover:text-white border-transparent"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* TAB 1: SVG WHEEL + TELEMETRY (kept mounted offscreen on other tabs so PDF always embeds wheel PNG) */}
          <div
            className={
              activeTab === "wheel"
                ? "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
                : "fixed -left-[9999px] top-0 w-[440px] opacity-0 pointer-events-none"
            }
          >
            <div className="lg:col-span-7">
              <NatalWheelSvg chart={chart} />
            </div>

            {activeTab === "wheel" && (
              <div className="lg:col-span-5 space-y-4">
                {/* Astronomical Chronology Verification Box */}
                <div className="p-3.5 rounded-xl bg-[#110820] border border-purple-800/50 space-y-1.5 text-xs">
                  <div className="font-cinzel font-bold text-amber-200 flex items-center justify-between">
                    <span>Registro Cronológico</span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300">
                      {chart.timezoneInfo.offsetLabel}
                    </span>
                  </div>
                  <div className="text-purple-200/90">{chart.timezoneInfo.dstNote}</div>
                  <div className="font-mono tabular-nums text-[11px] text-purple-400">
                    Zona IANA: {chart.timezoneInfo.ianaZone}
                  </div>
                  <div className="font-mono tabular-nums text-[11px] text-purple-400">
                    Instante UTC: {chart.utcIso.replace("T", " ").slice(0, 19)}Z
                  </div>
                </div>

                {/* Elements Balance */}
                <div className="p-3.5 rounded-xl bg-[#110820] border border-purple-800/50 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between font-cinzel font-bold text-purple-100">
                    <span>Balance Elemental</span>
                    <span className="text-amber-300">{chart.dominantElement} dominante</span>
                  </div>
                  {(
                    [
                      ["Fuego", chart.elements.fuego, "#f59e0b"],
                      ["Tierra", chart.elements.tierra, "#34d399"],
                      ["Aire", chart.elements.aire, "#38bdf8"],
                      ["Agua", chart.elements.agua, "#a78bfa"],
                    ] as const
                  ).map(([elName, pct, fill]) => (
                    <div key={elName} className="space-y-1">
                      <div className="flex justify-between font-mono tabular-nums text-[11px] text-purple-200">
                        <span>{elName}</span>
                        <span>{pct}%</span>
                      </div>
                      <svg viewBox="0 0 100 4" className="w-full h-1.5 rounded overflow-hidden bg-purple-950/90">
                        <rect x="0" y="0" width={Math.max(2, pct)} height="4" rx="2" fill={fill} />
                      </svg>
                    </div>
                  ))}
                  <div className="pt-1 border-t border-purple-900/50 flex justify-between font-mono tabular-nums text-[11px] text-purple-300">
                    <span>Cardinal {chart.modalities.cardinal}%</span>
                    <span>Fijo {chart.modalities.fijo}%</span>
                    <span>Mutable {chart.modalities.mutable}%</span>
                  </div>
                </div>

                {/* Key Headline, Voice & Ouija Bridge */}
                <div className="p-3.5 rounded-xl bg-[#140b26] border border-violet-500/40 space-y-2.5 text-xs">
                  <div className="font-cinzel font-bold text-amber-200 flex items-center justify-between gap-2">
                    <span>{reading.energyHeadline}</span>
                    {isEnhancing && <span className="text-[10px] font-mono text-purple-300">canalizando...</span>}
                  </div>
                  <p className="text-purple-200/90 leading-relaxed line-clamp-4">{reading.grandNarrative}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab("reading")}
                      className="px-3 py-1.5 rounded-lg bg-purple-900/70 hover:bg-purple-800 border border-purple-500/50 text-purple-100 text-[11px] font-cinzel font-semibold cursor-pointer"
                    >
                      Leer informe completo
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleSpeech}
                      className="px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-amber-200 text-[11px] font-cinzel font-semibold cursor-pointer flex items-center gap-1"
                    >
                      {isSpeaking ? <Square className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-amber-300" />}
                      <span>{isSpeaking ? t("natalStopVoice") : "Voz"}</span>
                    </button>
                    {onSendToOuija && (
                      <button
                        type="button"
                        onClick={() =>
                          onSendToOuija(
                            `¿Qué mensaje espiritual guardan mi Sol en ${chart.sun.sign}, Luna en ${chart.moon.sign} y Ascendente en ${chart.ascendant.sign}?`
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 text-amber-200 text-[11px] font-cinzel font-semibold cursor-pointer"
                      >
                        Consultar en Ouija
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TAB 2: PLANETS & 12 HOUSES TABLES */}
          {activeTab === "positions" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-[#110820] border border-purple-800/50 overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-purple-900/60 font-cinzel font-bold text-amber-200">
                  Posiciones Planetarias (Efemérides VSOP87)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-purple-900/50 text-[11px] font-cinzel text-purple-300/80">
                        <th className="py-2 px-3">Astro</th>
                        <th className="py-2 px-2">Signo</th>
                        <th className="py-2 px-2">Grado</th>
                        <th className="py-2 px-2 text-right">Casa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/40">
                      {chart.planets.map((p) => (
                        <tr key={p.id} className="hover:bg-purple-950/40">
                          <td className="py-2 px-3 font-medium text-purple-100 flex items-center gap-2">
                            <span className="text-amber-300 w-5 text-center font-bold">{p.glyph}</span>
                            <span>{p.name}</span>
                            {p.isRetrograde && (
                              <span className="text-[10px] font-mono px-1 rounded bg-rose-950/80 text-rose-300 border border-rose-700/50">
                                Rx
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-purple-200">
                            {p.signSymbol} {p.sign}
                          </td>
                          <td className="py-2 px-2 font-mono tabular-nums text-purple-300">
                            {String(p.degree).padStart(2, "0")}°{String(p.minutes).padStart(2, "0")}'
                          </td>
                          <td className="py-2 px-2 font-mono tabular-nums text-right text-amber-200">
                            {p.house}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl bg-[#110820] border border-purple-800/50 overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-purple-900/60 font-cinzel font-bold text-amber-200">
                  Cúspides de las 12 Casas Astrológicas
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-purple-900/50 text-[11px] font-cinzel text-purple-300/80">
                        <th className="py-2 px-3">Casa</th>
                        <th className="py-2 px-2">Signo</th>
                        <th className="py-2 px-2">Grado</th>
                        <th className="py-2 px-2 text-right">Regente</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/40">
                      {chart.houses.map((h) => (
                        <tr key={h.house} className="hover:bg-purple-950/40">
                          <td className="py-2 px-3 font-mono tabular-nums text-amber-200 font-semibold">
                            Casa {h.house}
                          </td>
                          <td className="py-2 px-2 text-purple-200">
                            {h.signSymbol} {h.sign}
                          </td>
                          <td className="py-2 px-2 font-mono tabular-nums text-purple-300">
                            {String(h.degree).padStart(2, "0")}°{String(h.minutes).padStart(2, "0")}'
                          </td>
                          <td className="py-2 px-2 text-right text-purple-300">
                            {h.ruler}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ASPECTS */}
          {activeTab === "aspects" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {chart.aspects.length === 0 ? (
                <div className="col-span-full p-4 rounded-xl bg-[#110820] border border-purple-800/50 text-purple-300">
                  No se detectaron aspectos mayores dentro del orbe configurado.
                </div>
              ) : (
                chart.aspects.map((asp, idx) => (
                  <div
                    key={`${asp.planet1Id}-${asp.planet2Id}-${idx}`}
                    className={`p-3.5 rounded-xl bg-[#110820] border ${
                      asp.nature === "harmonic" ? "border-sky-500/40" : "border-rose-500/40"
                    } space-y-1.5`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-cinzel font-bold text-purple-100">
                        {asp.planet1Glyph} {asp.planet1} {asp.symbol} {asp.planet2Glyph} {asp.planet2}
                      </span>
                      <span
                        className={`font-mono tabular-nums text-[11px] px-2 py-0.5 rounded border ${
                          asp.nature === "harmonic"
                            ? "bg-sky-950/70 border-sky-500/40 text-sky-200"
                            : "bg-rose-950/70 border-rose-500/40 text-rose-200"
                        }`}
                      >
                        {asp.type} • Orbe {asp.orb}°
                      </span>
                    </div>
                    <p className="text-purple-200/90 leading-relaxed">{asp.description}</p>
                    <div className="text-[11px] text-amber-300/90 italic">{asp.evolutionaryGift}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: FULL READING */}
          {activeTab === "reading" && (
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-[#140b26] border border-amber-500/40 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-cinzel uppercase tracking-wider text-amber-300">
                    Síntesis del Diseño Natal
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleSpeech}
                      className="px-2.5 py-1 rounded-lg bg-purple-950/90 hover:bg-purple-900 border border-purple-600/60 text-amber-200 text-[11px] font-cinzel font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {isSpeaking ? <Square className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3" />}
                      <span>{isSpeaking ? t("natalStopVoice") : t("natalListenBtn")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={isExportingPdf}
                      className="px-2.5 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 text-amber-200 text-[11px] font-cinzel font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-cinzel font-bold text-white">
                  {reading.energyHeadline}
                </h3>
                <p className="text-purple-200/95 leading-relaxed">{reading.grandNarrative}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#110820] border border-purple-800/50 space-y-1">
                  <div className="font-cinzel font-bold text-amber-300">☉ Identidad Solar ({chart.sun.sign})</div>
                  <p className="text-purple-200/90 leading-relaxed text-xs">{reading.sunEssence}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#110820] border border-purple-800/50 space-y-1">
                  <div className="font-cinzel font-bold text-sky-300">☽ Mundo Emocional Lunar ({chart.moon.sign})</div>
                  <p className="text-purple-200/90 leading-relaxed text-xs">{reading.moonSanctuary}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#110820] border border-purple-800/50 space-y-1">
                  <div className="font-cinzel font-bold text-rose-300">ASC Camino Terrenal ({chart.ascendant.sign})</div>
                  <p className="text-purple-200/90 leading-relaxed text-xs">{reading.ascendantDestiny}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#110820] border border-purple-800/50 space-y-1">
                  <div className="font-cinzel font-bold text-purple-300">MC Vocación & Nodo Norte ({chart.midheaven.sign})</div>
                  <p className="text-purple-200/90 leading-relaxed text-xs">{reading.vocationalLegacy}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#110820] border border-purple-800/50 space-y-1">
                <div className="font-cinzel font-bold text-amber-200 text-xs">Balance Elemental y Aspectos</div>
                <p className="text-purple-200/90 leading-relaxed text-xs">{reading.elementalBalance}</p>
                <p className="text-purple-300/85 leading-relaxed text-xs pt-1">{reading.aspectsInterpretation}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-center">
                <span className="text-[11px] font-cinzel uppercase tracking-wider text-amber-300 block mb-1">
                  Afirmación Natal
                </span>
                <p className="italic text-amber-100 font-gothic">"{reading.cosmicAffirmation}"</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unified Mercado Pago Consultation Pass Status Bar */}
      {isPaywallEnabled && (
        <div className="pt-3 border-t border-purple-900/40 text-[11px] font-gothic">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {isCreatorUnlimited ? (
              <>
                <span className="text-amber-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {language === "en"
                      ? "Creator Mode active: unlimited natal charts, voice & PDF enabled."
                      : "Modo Creador activo: cartas natales por voz y PDF ilimitadas."}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onOpenPaywall?.()}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:via-orange-400 hover:to-amber-500 text-neutral-950 border border-amber-200/70 font-cinzel font-bold text-[10px] uppercase tracking-wider transition cursor-pointer shadow-[0_0_16px_rgba(245,158,11,0.4)]"
                >
                  {language === "en" ? "Unlock Panel" : "Panel de Desbloqueo"}
                </button>
              </>
            ) : isPassUnlocked ? (
              <span className="text-emerald-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {language === "en"
                    ? "Akashic Pass active: unlimited natal charts, voice readings & PDFs unlocked."
                    : "Pase Akáshico activo: cartas natales por voz y PDF desbloqueadas."}
                </span>
              </span>
            ) : remainingFree > 0 ? (
              <>
                <span className="text-purple-300/85">
                  {language === "en"
                    ? `Free consultations remaining: ${remainingFree} of ${freeLimit}`
                    : `Consultas gratuitas disponibles (incluye Carta Natal): ${remainingFree} de ${freeLimit}`}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenPaywall?.()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:via-orange-400 hover:to-amber-500 text-neutral-950 border border-amber-200/70 font-cinzel font-bold text-[10px] uppercase tracking-wider transition cursor-pointer shadow-[0_0_16px_rgba(245,158,11,0.4)] flex items-center space-x-1.5"
                >
                  <Lock className="w-3 h-3" />
                  <span>{language === "en" ? "Unlock" : "Desbloqueo"}</span>
                </button>
              </>
            ) : (
              <>
                <span className="text-amber-300 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {language === "en"
                      ? `Free consultations used (${freeLimit}/${freeLimit})`
                      : `Consultas gratuitas agotadas (${freeLimit}/${freeLimit})`}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onOpenPaywall?.()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:via-orange-400 hover:to-amber-500 text-neutral-950 border border-amber-200/70 font-cinzel font-bold text-[10px] uppercase tracking-wider transition cursor-pointer shadow-[0_0_18px_rgba(245,158,11,0.45)] flex items-center space-x-1.5"
                >
                  <Lock className="w-3 h-3" />
                  <span>{language === "en" ? "Unlock" : "Desbloqueo"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
      </div>
    </section>
  );
};
