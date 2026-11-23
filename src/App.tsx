import React, { useState, useEffect, useCallback, useRef } from "react";
import { BoardMode, PastLifeDetails, PastLifeRevelation, SpiritResponse, VisitsStats } from "./types";
import { OuijaBoard } from "./components/OuijaBoard";
import { SpiritOracleForm } from "./components/SpiritOracleForm";
import { PastLifeModal } from "./components/PastLifeModal";
import { AntenaDimensionalPanel } from "./components/AntenaDimensionalPanel";
import { AtmosphereControls } from "./components/AtmosphereControls";
import { DailyTarotCard } from "./components/DailyTarotCard";
import { NatalChartSection, NatalRequestPayload } from "./components/NatalChartSection";
import { KabbalahMissionSection } from "./components/KabbalahMissionSection";
import { CrystalBallLoader } from "./components/CrystalBallLoader";
import { StarfieldBackground } from "./components/StarfieldBackground";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { savePastLifeToGrimorio } from "./lib/grimorioStorage";
import { useLanguage } from "./context/LanguageContext";
import { ShieldAlert, Eye, Sparkles, Radio, Compass, Layers, Globe, Lock, Orbit, Antenna } from "lucide-react";
import { audio } from "./lib/audio";
import { isAdminSession, getAdminHeaders, isAuthorizedAdmin } from "./lib/adminTracking";
import {
  useMonetizationConfig,
  canPerformConsultation,
  getRemainingFreeConsultations,
  incrementFreeConsultationsUsed,
  isConsultationPassUnlocked,
  PendingConsultation,
  savePendingConsultation,
  getPendingConsultation,
  clearPendingConsultation,
  claimPendingConsultation,
  markConsultationPassUnlocked,
  isPaywallModalActiveInAnotherTab,
  getOrCreateVisitorId,
  getEffectiveMpUrl,
} from "./lib/monetization";
import { ConsultationPaywallModal } from "./components/ConsultationPaywallModal";
import { doc, onSnapshot, runTransaction } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./lib/firebase";

const CACHE_VISITS_KEY = "ouija_real_visits_clean";

const getInitialVisitsStats = (): VisitsStats => {
  if (typeof window !== "undefined") {
    try {
      // Remove any legacy simulation keys
      localStorage.removeItem("ouija_cached_visits_stats");
      localStorage.removeItem("ouija_cached_visits_stats_v2");
      localStorage.removeItem("ouija_cached_real_visits_v3");

      const cached = localStorage.getItem(CACHE_VISITS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.totalVisits === "number") {
          return {
            totalVisits: Number(parsed.totalVisits) || 0,
            todayVisits: Number(parsed.todayVisits) || 0,
            totalConsultations: Number(parsed.totalConsultations) || 0,
            uniqueVisitorsCount: Number(parsed.uniqueVisitorsCount) || 0,
            onlineVisitors: typeof parsed.onlineVisitors === "number" ? Math.max(0, parsed.onlineVisitors) : 0,
            lastUpdated: parsed.lastUpdated || new Date().toISOString(),
          };
        }
      }
    } catch (e) {
      console.warn("Could not read cached visits", e);
    }
  }
  return {
    totalVisits: 0,
    todayVisits: 0,
    totalConsultations: 0,
    uniqueVisitorsCount: 0,
    onlineVisitors: 0,
  };
};

export default function App() {
  const { t, language, setLanguage, options } = useLanguage();
  const [activeMainSection, setActiveMainSection] = useState<"ALL" | "OUIJA" | "TAROT" | "NATAL" | "CABALA" | "ANTENA">("ALL");
  const [mode, setMode] = useState<BoardMode>("IDLE");
  const [spelledWord, setSpelledWord] = useState("");
  const [activeChar, setActiveChar] = useState("");
  const [currentPastLife, setCurrentPastLife] = useState<PastLifeDetails | null>(null);
  const [currentSpiritResponse, setCurrentSpiritResponse] = useState<SpiritResponse | null>(null);
  const [seekerName, setSeekerName] = useState("Buscador");
  const [savedRecords, setSavedRecords] = useState<PastLifeRevelation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visitsStats, setVisitsStats] = useState<VisitsStats>(getInitialVisitsStats);
  const [prefilledOuijaQuestion, setPrefilledOuijaQuestion] = useState("");
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [pendingConsultation, setPendingConsultation] = useState<PendingConsultation | null>(
    () => getPendingConsultation()
  );
  const [pendingNatalExecution, setPendingNatalExecution] = useState<{
    id: string;
    data: NatalRequestPayload;
  } | null>(null);
  const [paymentSuccessBanner, setPaymentSuccessBanner] = useState<string>("");
  const [allowanceTick, setAllowanceTick] = useState(0);
  const monetizationCfg = useMonetizationConfig();

  useEffect(() => {
    const bump = () => setAllowanceTick((v) => v + 1);
    window.addEventListener("ouija_consultation_allowance_changed", bump);
    window.addEventListener("ouija-creator-mode-change", bump);
    window.addEventListener("ouija-admin-auth-change", bump);
    return () => {
      window.removeEventListener("ouija_consultation_allowance_changed", bump);
      window.removeEventListener("ouija-creator-mode-change", bump);
      window.removeEventListener("ouija-admin-auth-change", bump);
    };
  }, []);

  void allowanceTick;
  const isCreatorOrAdmin = isAdminSession() || isAuthorizedAdmin();
  const isPassUnlocked = isConsultationPassUnlocked(monetizationCfg);
  const remainingFree = getRemainingFreeConsultations(monetizationCfg);

  // Spoken welcome narration and soft ambient music until user picks a reading/record
  useEffect(() => {
    audio.startBrowsingMusicIfWaiting();
    audio.playWelcomeSpeech(language);

    const gestureEvents = ["pointerdown", "touchstart", "touchend", "mousedown", "keydown", "click"];
    const unlockOnGesture = async () => {
      if (audio.getIsMuted()) return;
      const started = await audio.resumeAndStartWaitingMusic();
      audio.playWelcomeSpeech(language);
      if (started || audio.getAudioContextState() === "running") {
        gestureEvents.forEach((ev) => {
          window.removeEventListener(ev, unlockOnGesture, true);
          document.removeEventListener(ev, unlockOnGesture, true);
        });
      }
    };

    gestureEvents.forEach((ev) => {
      window.addEventListener(ev, unlockOnGesture, { capture: true, passive: true });
      document.addEventListener(ev, unlockOnGesture, { capture: true, passive: true });
    });
    return () => {
      gestureEvents.forEach((ev) => {
        window.removeEventListener(ev, unlockOnGesture, true);
        document.removeEventListener(ev, unlockOnGesture, true);
      });
    };
  }, [language]);
  const [isLoading, setIsLoading] = useState(false);
  const [fogOn, setFogOn] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const locale = language === "en" ? "en-US" : language === "pt" ? "pt-BR" : language === "fr" ? "fr-FR" : language === "it" ? "it-IT" : language === "de" ? "de-DE" : "es-AR";

  const visitRegisteredRef = useRef(false);

  // Authoritative real visit updater from Firestore / server
  const mergeVisitsStats = useCallback((incoming?: Partial<VisitsStats> | null) => {
    if (!incoming) return;
    setVisitsStats((prev) => {
      const incomingTotal = typeof incoming.totalVisits === "number" ? incoming.totalVisits : prev.totalVisits;
      const incomingToday = typeof incoming.todayVisits === "number" ? incoming.todayVisits : prev.todayVisits;
      const incomingConsultations = typeof incoming.totalConsultations === "number" ? incoming.totalConsultations : prev.totalConsultations;
      const incomingUniques = typeof incoming.uniqueVisitorsCount === "number" ? incoming.uniqueVisitorsCount : prev.uniqueVisitorsCount;
      const incomingOnline =
        typeof incoming.onlineVisitors === "number"
          ? Math.max(0, incoming.onlineVisitors)
          : prev.onlineVisitors ?? 0;

      const next: VisitsStats = {
        totalVisits: incomingTotal > 0 ? incomingTotal : prev.totalVisits,
        todayVisits: incomingToday,
        totalConsultations: incomingConsultations > 0 ? incomingConsultations : prev.totalConsultations,
        uniqueVisitorsCount: incomingUniques > 0 ? incomingUniques : prev.uniqueVisitorsCount,
        onlineVisitors: incomingOnline,
        lastUpdated: incoming.lastUpdated || new Date().toISOString(),
      };
      try {
        localStorage.setItem(CACHE_VISITS_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  }, []);

  // Fetch real statistics without HTTP cache
  const fetchVisitsStats = useCallback(async () => {
    try {
      const res = await fetch("/api/visits", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        mergeVisitsStats(data);
      }
    } catch (e) {
      console.warn("Could not fetch visits stats:", e);
    }
  }, [mergeVisitsStats]);

  // Real-time Firestore listener for live portal metrics across all users and devices
  useEffect(() => {
    const metricsRef = doc(db, "metrics", "global");
    const getLocalDateKey = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };

    const unsubscribe = onSnapshot(
      metricsRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const todayKey = getLocalDateKey();
          mergeVisitsStats({
            totalVisits: Number(data.totalVisits) || 0,
            todayVisits: data.todayKey === todayKey ? Number(data.todayVisits) || 0 : 0,
            totalConsultations: Number(data.totalConsultations) || 0,
            uniqueVisitorsCount: Number(data.uniqueVisitorsCount) || 0,
            lastUpdated: typeof data.lastUpdated === "string" ? data.lastUpdated : new Date().toISOString(),
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "metrics/global");
      }
    );

    return () => unsubscribe();
  }, [mergeVisitsStats]);

  useEffect(() => {
    if (visitRegisteredRef.current) return;
    visitRegisteredRef.current = true;

    const registerVisit = async () => {
      let visitorId = "vis_anon_" + Date.now();
      try {
        const storedId = localStorage.getItem("ouija_visitor_id");
        if (storedId && /^[a-zA-Z0-9_\-]{4,128}$/.test(storedId)) {
          visitorId = storedId;
        } else {
          visitorId = "vis_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
          localStorage.setItem("ouija_visitor_id", visitorId);
        }
      } catch {
        // ignore storage restrictions
      }

      const isAdmin = isAdminSession() || isAuthorizedAdmin();

      try {
        const isNewSession = !sessionStorage.getItem("ouija_session_logged");
        if (isNewSession) {
          sessionStorage.setItem("ouija_session_logged", "true");
        }

        const res = await fetch("/api/visits/hit", {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
          },
          body: JSON.stringify({
            visitorId,
            isNewSession,
            isAdmin,
          }),
        });

        if (res.ok) {
          const stats = await res.json();
          mergeVisitsStats(stats);
          return;
        }
      } catch (e) {
        console.warn("Server visit hit failed, attempting direct Firestore fallback:", e);
      }

      // Direct Firestore transaction fallback if backend endpoint was unreachable
      if (!isAdmin) {
        try {
          const d = new Date();
          const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const nowIso = d.toISOString();
          const metricsRef = doc(db, "metrics", "global");
          const visitorRef = doc(db, "visitors", visitorId);

          await runTransaction(db, async (tx) => {
            const mSnap = await tx.get(metricsRef);
            const vSnap = await tx.get(visitorRef);
            if (!mSnap.exists()) return;
            const current = mSnap.data();
            const isNewUnique = !vSnap.exists();
            if (isNewUnique) {
              tx.set(visitorRef, { visitorId, firstSeenAt: nowIso });
            }
            tx.update(metricsRef, {
              totalVisits: (Number(current.totalVisits) || 0) + 1,
              todayVisits: current.todayKey === todayKey ? (Number(current.todayVisits) || 0) + 1 : 1,
              todayKey,
              uniqueVisitorsCount: (Number(current.uniqueVisitorsCount) || 0) + (isNewUnique ? 1 : 0),
              lastUpdated: nowIso,
            });
          });
        } catch (fsErr) {
          console.warn("Direct Firestore fallback error:", fsErr);
          fetchVisitsStats();
        }
      } else {
        fetchVisitsStats();
      }
    };

    registerVisit();

    const sendHeartbeat = async (leave = false) => {
      const visitorId = getOrCreateVisitorId();
      const isAdmin = isAdminSession() || isAuthorizedAdmin();
      if (leave && typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        try {
          const blob = new Blob(
            [JSON.stringify({ visitorId, isAdmin, leave: true })],
            { type: "application/json" }
          );
          navigator.sendBeacon("/api/visits/heartbeat", blob);
          return;
        } catch {
          // fallback below
        }
      }
      try {
        const res = await fetch("/api/visits/heartbeat", {
          method: "POST",
          cache: "no-store",
          keepalive: leave,
          headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
          },
          body: JSON.stringify({ visitorId, isAdmin, leave }),
        });
        if (res.ok && !leave) {
          const stats = await res.json();
          mergeVisitsStats(stats);
        }
      } catch {
        // fallback to basic stats fetch
        if (!leave) fetchVisitsStats();
      }
    };

    // Keep real-time online count updated & exclude creator immediately on auth change
    const visitsInterval = setInterval(() => {
      sendHeartbeat(false);
    }, 15000);

    const onVisibilityOrAuthChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat(false);
      }
    };
    const onCreatorChange = () => {
      sendHeartbeat(false);
    };
    const onPageHide = () => {
      sendHeartbeat(true);
    };

    document.addEventListener("visibilitychange", onVisibilityOrAuthChange);
    window.addEventListener("ouija-creator-mode-change", onCreatorChange);
    window.addEventListener("ouija-admin-auth-change", onCreatorChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      clearInterval(visitsInterval);
      document.removeEventListener("visibilitychange", onVisibilityOrAuthChange);
      window.removeEventListener("ouija-creator-mode-change", onCreatorChange);
      window.removeEventListener("ouija-admin-auth-change", onCreatorChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [fetchVisitsStats, mergeVisitsStats]);

  // Listen for real-time consultation events across components
  useEffect(() => {
    const handleConsultationEvent = () => {
      fetchVisitsStats();
    };
    window.addEventListener("ouija-consultation-recorded", handleConsultationEvent);
    return () => window.removeEventListener("ouija-consultation-recorded", handleConsultationEvent);
  }, [fetchVisitsStats]);

  // Load saved codex records from localStorage & listen for history clear events
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ouija_past_lives_codex");
      if (stored) {
        setSavedRecords(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load past life codex", e);
    }

    const handleHistoryCleared = () => {
      setSavedRecords([]);
      setCurrentPastLife(null);
      setCurrentSpiritResponse(null);
      setSpelledWord("");
      setMode("IDLE");
      setIsModalOpen(false);
      setErrorMsg("");
    };

    window.addEventListener("ouija-history-cleared", handleHistoryCleared);
    return () => window.removeEventListener("ouija-history-cleared", handleHistoryCleared);
  }, []);

  const handleSaveToCodex = () => {
    if (!currentPastLife) return;
    const newRecord: PastLifeRevelation = {
      id: "life_" + Date.now(),
      timestamp: Date.now(),
      seekerName: seekerName || "Buscador",
      spelledWord: spelledWord,
      pastLifeDetails: currentPastLife,
    };

    const updated = [newRecord, ...savedRecords];
    setSavedRecords(updated);
    try {
      localStorage.setItem("ouija_past_lives_codex", JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save codex", e);
    }

    // Save into central Grimorio
    savePastLifeToGrimorio(newRecord, locale);
  };

  // Execute Past Life Channeling API call
  const executePastLifeConsult = useCallback(
    async (data: {
      name: string;
      birthYear: string;
      focusQuery: string;
      feeling: string;
    }) => {
      const adminBypass = isAdminSession() || isAuthorizedAdmin();
      audio.fadeOutForSelection();
      audio.stopSpeech();
      setActiveMainSection("OUIJA");
      setIsLoading(true);
      setErrorMsg("");
      setSeekerName(data.name || "Buscador");
      setCurrentSpiritResponse(null);

      try {
        const res = await fetch("/api/ouija/past-life", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
          },
          body: JSON.stringify({ ...data, lang: language, isAdmin: isAdminSession() }),
        });

        if (!res.ok) {
          throw new Error("Error en la conexión con los Registros Akáshicos");
        }

        const json = await res.json();
        setCurrentPastLife(json.pastLifeDetails);
        setSpelledWord(json.spelledWord || "VIDA PASADA");
        setMode("SPELLING");
        if (!adminBypass && !isConsultationPassUnlocked(monetizationCfg)) {
          incrementFreeConsultationsUsed();
        }
        fetchVisitsStats();
      } catch (err: unknown) {
        console.error(err);
        setErrorMsg(t("errorAkashicConnection"));
      } finally {
        setIsLoading(false);
      }
    },
    [fetchVisitsStats, language, monetizationCfg, t]
  );

  // Execute Spirit Oracle Question API call
  const executeGeneralConsult = useCallback(
    async (question: string, name: string) => {
      const adminBypass = isAdminSession() || isAuthorizedAdmin();
      audio.fadeOutForSelection();
      audio.stopSpeech();
      setActiveMainSection("OUIJA");
      setIsLoading(true);
      setErrorMsg("");
      setSeekerName(name);
      setCurrentPastLife(null);

      try {
        const res = await fetch("/api/ouija/spirit-question", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
          },
          body: JSON.stringify({ question, seekerName: name, lang: language, isAdmin: isAdminSession() }),
        });

        if (!res.ok) {
          throw new Error("Error en la respuesta del oráculo");
        }

        const rawJson: any = await res.json();
        const spelledClean =
          String(rawJson.spelledWord || rawJson.spelled || "SI")
            .replace(/\bundefined\b/gi, "")
            .trim() || "SI";

        const defaultMsg =
          language === "en"
            ? "The portal opens. The spirit confirms peace and clarity along your journey."
            : "El portal de ultratumba se abre. El espíritu confirma serenidad y claridad en tu camino.";

        const messageClean =
          String(rawJson.spiritMessage || rawJson.spirit || defaultMsg)
            .replace(/\bundefined\b/gi, "")
            .trim() || defaultMsg;

        const normalized: SpiritResponse = {
          spelledWord: spelledClean,
          answerType: (rawJson.answerType || rawJson.type || "SPELLOUT") as "YES" | "NO" | "SPELLOUT",
          spiritMessage: messageClean,
          spiritName:
            String(
              rawJson.spiritName ||
                rawJson.name ||
                (language === "en" ? "Akashic Guardian" : "Guardián Akáshico")
            )
              .replace(/\bundefined\b/gi, "")
              .trim() || "Guardián Akáshico",
        };

        setCurrentSpiritResponse(normalized);
        setSpelledWord(normalized.spelledWord);
        setMode("SPELLING");
        if (!adminBypass && !isConsultationPassUnlocked(monetizationCfg)) {
          incrementFreeConsultationsUsed();
        }
        fetchVisitsStats();
      } catch (err: unknown) {
        console.error(err);
        setErrorMsg(t("errorOracleConnection"));
      } finally {
        setIsLoading(false);
      }
    },
    [fetchVisitsStats, language, monetizationCfg, t]
  );

  // Immediately execute any pending past-life reading, spirit question, or natal chart after payment unlock
  const runPendingConsultationIfAny = useCallback(() => {
    const queued = getPendingConsultation() || pendingConsultation;
    if (!queued) return false;
    if (!claimPendingConsultation(queued.id)) {
      setPendingConsultation(null);
      return false;
    }
    setPendingConsultation(null);
    clearPendingConsultation(queued.id);

    if (queued.type === "past-life") {
      executePastLifeConsult(queued.data);
    } else if (queued.type === "spirit-question") {
      executeGeneralConsult(queued.question, queued.name);
    } else if (queued.type === "natal-chart") {
      setActiveMainSection((prev) => (prev === "ALL" ? "ALL" : "NATAL"));
      setPendingNatalExecution({ id: queued.id, data: queued.data });
    }
    return true;
  }, [executeGeneralConsult, executePastLifeConsult, pendingConsultation]);

  // Automatic post-payment return handler (Mercado Pago Auto-Return URL)
  const paymentReturnHandledRef = useRef(false);
  useEffect(() => {
    if (paymentReturnHandledRef.current) return;
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const mpPaymentStatus = params.get("mp_payment") || params.get("collection_status") || params.get("status");
    const paymentId = params.get("payment_id") || params.get("collection_id");
    const sessionIdParam = params.get("session_id") || "";
    const autoToken = params.get("token") || params.get("auto_unlock") || "";
    const isAutoApprovedFlag = params.get("pago_aprobado") === "1";

    if (!autoToken && !paymentId && mpPaymentStatus !== "success" && mpPaymentStatus !== "approved") {
      return;
    }

    paymentReturnHandledRef.current = true;

    const handleReturn = async () => {
      let approvedProof = "";
      let approvedSessionId = sessionIdParam;

      if (autoToken || isAutoApprovedFlag) {
        try {
          const res = await fetch("/api/payments/verify-return", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: autoToken,
              sessionId: sessionIdParam,
              visitorId: getOrCreateVisitorId(),
            }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json?.approved && json?.approvalProof) {
              approvedProof = json.approvalProof;
              approvedSessionId = json.sessionId || approvedSessionId;
            }
          }
        } catch {
          // ignore
        }
      }

      if (!approvedProof && paymentId && (mpPaymentStatus === "success" || mpPaymentStatus === "approved" || !mpPaymentStatus)) {
        try {
          const res = await fetch("/api/payments/mercadopago/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId,
              sessionId: sessionIdParam,
              visitorId: getOrCreateVisitorId(),
            }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json?.approved && json?.approvalProof) {
              approvedProof = json.approvalProof;
              approvedSessionId = json.sessionId || approvedSessionId;
            }
          }
        } catch {
          // ignore
        }
      }

      // Clean payment params from URL
      try {
        window.history.replaceState({}, "", window.location.pathname);
      } catch {
        // ignore
      }

      if (approvedProof) {
        const otherTabActive = isPaywallModalActiveInAnotherTab();
        markConsultationPassUnlocked(approvedProof, approvedSessionId);
        setAllowanceTick((v) => v + 1);
        setIsPaywallOpen(false);

        if (otherTabActive) {
          setPaymentSuccessBanner(
            language === "en"
              ? "Payment verified! Your consultation unlocked automatically in your main tab."
              : "¡Pago confirmado! Tu lectura solicitada ya se desbloqueó y comenzó automáticamente en la ventana principal."
          );
          setTimeout(() => setPaymentSuccessBanner(""), 8000);
        } else {
          const ran = runPendingConsultationIfAny();
          if (!ran) {
            setPaymentSuccessBanner(
              language === "en"
                ? "Access unlocked automatically! Unlimited readings and App Installation are now active."
                : "¡Acceso desbloqueado automáticamente! Ya puedes realizar lecturas ilimitadas e instalar la App en tu dispositivo."
            );
            setTimeout(() => setPaymentSuccessBanner(""), 7000);
          }
        }
      }
    };

    handleReturn();
  }, [language, runPendingConsultationIfAny]);

  // Past Life Channeling trigger (queues & prompts payment when free limit reached)
  const handlePastLifeConsult = async (data: {
    name: string;
    birthYear: string;
    focusQuery: string;
    feeling: string;
  }) => {
    const adminBypass = isAdminSession() || isAuthorizedAdmin();
    if (!canPerformConsultation(monetizationCfg, adminBypass)) {
      const queued: PendingConsultation = {
        id: `pend_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: "past-life",
        data,
        createdAt: Date.now(),
      };
      savePendingConsultation(queued);
      setPendingConsultation(queued);
      audio.stopSpeech();
      setIsPaywallOpen(true);
      return;
    }

    await executePastLifeConsult(data);
  };

  // Spirit Oracle Question trigger (queues & prompts payment when free limit reached)
  const handleGeneralConsult = async (question: string, name: string) => {
    const adminBypass = isAdminSession() || isAuthorizedAdmin();
    if (!canPerformConsultation(monetizationCfg, adminBypass)) {
      const queued: PendingConsultation = {
        id: `pend_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: "spirit-question",
        question,
        name,
        createdAt: Date.now(),
      };
      savePendingConsultation(queued);
      setPendingConsultation(queued);
      audio.stopSpeech();
      setIsPaywallOpen(true);
      return;
    }

    await executeGeneralConsult(question, name);
  };

  const handleSpellingComplete = () => {
    setMode("REVEALED");
    if (currentPastLife) {
      setIsModalOpen(true);
    } else if (currentSpiritResponse) {
      const spelled = (currentSpiritResponse.spelledWord || "").replace(/\bundefined\b/gi, "").trim();
      const message = (currentSpiritResponse.spiritMessage || "").replace(/\bundefined\b/gi, "").trim();
      const phrase = spelled && message ? `${spelled}. ${message}` : message || spelled || "El oráculo de ultratumba ha hablado.";
      audio.speakSpiritText(
        phrase,
        undefined,
        undefined,
        language
      );
    }
  };

  const handleSendCardToOuija = (cardName: string) => {
    setActiveMainSection("OUIJA");
    setPrefilledOuijaQuestion(`${t("askCardMessage")} ${cardName}?`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSendNatalToOuija = (query: string) => {
    setActiveMainSection("OUIJA");
    setPrefilledOuijaQuestion(query);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isCurrentSaved = savedRecords.some(
    (r) => r.pastLifeDetails.title === currentPastLife?.title
  );

  return (
    <div className="min-h-screen bg-[#07040d] text-purple-100 flex flex-col items-center justify-between p-3 sm:p-6 relative overflow-x-hidden selection:bg-purple-600 selection:text-white font-gothic">
      {/* Dynamic Starfield Canvas & Stardust Backdrop Layer */}
      <StarfieldBackground
        isLoading={isLoading}
        isOracleActive={isLoading || mode === "SPELLING" || mode === "REVEALED" || isModalOpen}
      />

      {/* Mystical Cosmic Glow & Drifting Ether Layers */}
      {fogOn && (
        <>
          <div className="fixed inset-0 pointer-events-none z-10 mix-blend-screen bg-[radial-gradient(circle_at_35%_30%,rgba(139,92,246,0.22),transparent_62%)] animate-ethereal-mist" />
          <div className="fixed inset-0 pointer-events-none z-10 mix-blend-screen bg-[radial-gradient(circle_at_70%_70%,rgba(245,158,11,0.12),transparent_60%)] animate-ethereal-mist-alt" />
        </>
      )}

      {/* Prominent Global Multi-language Switcher Bar */}
      <aside aria-label={t("languageSelect")} className="w-full max-w-4xl flex items-center justify-between gap-2 px-3 py-2 mb-2.5 bg-[#100922]/95 border border-purple-500/50 rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(168,85,247,0.25)] z-30 overflow-hidden">
        <div className="flex items-center space-x-2 text-xs font-cinzel font-bold text-purple-200 shrink-0">
          <Globe className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="hidden sm:inline tracking-wider uppercase">{t("languageSelect")}:</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          {options.map((opt) => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => setLanguage(opt.code)}
                title={`${opt.nativeName} (${opt.label})`}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-cinzel transition flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-purple-700 text-white font-bold border border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.6)] scale-105"
                    : "bg-purple-950/60 hover:bg-purple-900/80 text-purple-300/90 hover:text-white border border-purple-900/60"
                }`}
              >
                <span className="text-sm leading-none">{opt.flag}</span>
                <span className="font-semibold text-xs">{opt.nativeName}</span>
                <span className="text-[10px] opacity-70 uppercase hidden md:inline">({opt.code})</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Header Bar with Atmosphere & Settings Controls */}
      <AtmosphereControls
        fogOn={fogOn}
        setFogOn={setFogOn}
        onOpenKabbalah={() => {
          setActiveMainSection("CABALA");
          setTimeout(() => {
            document.getElementById("kabbalah-mission-section")?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        }}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        visitsStats={visitsStats}
      />

      {/* Portal Main Navigation Switcher */}
      <nav aria-label="Navegación del Portal Místico" className="w-full max-w-4xl flex items-center justify-center gap-1 sm:gap-2 mb-3 z-20 overflow-x-auto py-1 px-2 bg-black/40 border border-purple-900/40 rounded-2xl backdrop-blur-md">
        <button
          onClick={() => setActiveMainSection("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeMainSection === "ALL"
              ? "bg-purple-900/80 text-purple-100 border border-purple-500/60 shadow-md"
              : "text-purple-400 hover:text-purple-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t("navAll")}</span>
        </button>

        <button
          onClick={() => setActiveMainSection("OUIJA")}
          className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeMainSection === "OUIJA"
              ? "bg-purple-900/80 text-purple-100 border border-purple-500/60 shadow-md"
              : "text-purple-400 hover:text-purple-200"
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-purple-400" />
          <span>{t("navOuija")}</span>
        </button>

        <button
          onClick={() => setActiveMainSection("TAROT")}
          className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeMainSection === "TAROT"
              ? "bg-gradient-to-r from-violet-600 to-purple-700 text-white border border-violet-300/60 shadow-md"
              : "text-violet-300 hover:text-violet-100"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-200" />
          <span>{t("navTarot")}</span>
        </button>

        <button
          onClick={() => setActiveMainSection("NATAL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeMainSection === "NATAL"
              ? "bg-purple-900/80 text-purple-100 border border-amber-400/60 shadow-md"
              : "text-amber-200/90 hover:text-amber-100"
          }`}
        >
          <Orbit className="w-3.5 h-3.5 text-amber-300" />
          <span>{t("navNatal")}</span>
        </button>

        <button
          onClick={() => {
            setActiveMainSection("ANTENA");
            setTimeout(() => {
              document.getElementById("antena-dimensional-section")?.scrollIntoView({ behavior: "smooth" });
            }, 50);
          }}
          title="Ver Portal de Antena Dimensional"
          className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeMainSection === "ANTENA"
              ? "bg-cyan-950/90 text-cyan-200 border border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
              : "text-cyan-300 hover:text-cyan-100 hover:bg-cyan-950/40 border border-cyan-500/35"
          }`}
        >
          <Antenna className="w-3.5 h-3.5 text-cyan-300" />
          <span>Antena Dimensional</span>
        </button>

        <button
          onClick={() => {
            setActiveMainSection("CABALA");
            setTimeout(() => {
              document.getElementById("kabbalah-mission-section")?.scrollIntoView({ behavior: "smooth" });
            }, 50);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeMainSection === "CABALA"
              ? "bg-amber-950/85 text-amber-100 border border-amber-400/75 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              : "text-amber-200/90 hover:text-amber-100 hover:bg-amber-950/35 border border-amber-500/35"
          }`}
          title="Tu Misión de Vida según la Cábala (Árbol de la Vida)"
        >
          <Compass className="w-3.5 h-3.5 text-amber-300" />
          <span>Misión Cábala</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl flex flex-col items-center space-y-6 z-20 my-auto">
        {/* Error Alert if any */}
        {errorMsg && (
          <div className="w-full max-w-2xl bg-purple-950/80 border border-purple-700/80 rounded-xl p-3 text-purple-200 text-xs sm:text-sm flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section: Ouija Board & Oracle (Shown if ALL or OUIJA) */}
        {(activeMainSection === "ALL" || activeMainSection === "OUIJA") && (
          <div className="w-full flex flex-col items-center space-y-6 animate-fade-in">
            {/* Physical Ouija Board Component */}
            <OuijaBoard
              mode={mode}
              spelledWord={spelledWord}
              onSpellingComplete={handleSpellingComplete}
              activeChar={activeChar}
              setActiveChar={setActiveChar}
            />

            {/* General Spirit Message Card (If Spirit Query) */}
            {currentSpiritResponse && mode === "REVEALED" && (
              <div className="w-full max-w-2xl bg-[#0f0918]/95 border border-purple-500/50 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-2xl text-center space-y-3 animate-word-emerge">
                <div className="text-xs uppercase tracking-[0.2em] text-purple-300 font-cinzel font-semibold animate-rune-breath">
                  <span>{t("channeledMessageTitle")}</span>
                </div>

                <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-100 to-amber-300 animate-spectral-shimmer py-1 font-cinzel">
                  "{currentSpiritResponse.spelledWord}"
                </div>

                <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed italic font-gothic animate-fade-in">
                  {currentSpiritResponse.spiritMessage}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      audio.stopSpeech();
                      setMode("IDLE");
                      setCurrentSpiritResponse(null);
                    }}
                    className="px-6 py-2.5 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/60 rounded-xl text-xs uppercase font-cinzel font-semibold tracking-wide transition cursor-pointer shadow-lg"
                  >
                    {t("makeAnotherConsultation")}
                  </button>
                </div>
              </div>
            )}

            {/* When Oracle is processing: Custom Glowing & Flickering Crystal Ball Animation */}
            {isLoading && (
              <div className="w-full max-w-2xl bg-[#0c0717]/95 border border-purple-500/60 rounded-3xl p-5 sm:p-7 backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.35)] text-center animate-fade-in relative overflow-hidden">
                <div className="absolute -top-16 -left-16 w-44 h-44 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

                <CrystalBallLoader
                  variant="full"
                  size="md"
                  text="El oráculo contempla las visiones en la bola de cristal..."
                  subtext="Canalizando los Registros Akáshicos y los ecos del tiempo..."
                />
              </div>
            )}

            {/* Form Inputs (Lectura de Vida Pasada y Consulta Akáshica) */}
            <SpiritOracleForm
              onPastLifeConsult={handlePastLifeConsult}
              onGeneralConsult={handleGeneralConsult}
              isLoading={isLoading}
              externalPreFillQuery={prefilledOuijaQuestion}
              isPaywallEnabled={monetizationCfg.paywallEnabled}
              freeLimit={monetizationCfg.freeConsultationsLimit}
              remainingFree={remainingFree}
              isPassUnlocked={isPassUnlocked}
              isCreatorUnlimited={isCreatorOrAdmin}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              mpLink={getEffectiveMpUrl(monetizationCfg)}
              passPriceArs={monetizationCfg.passPriceArs}
            />
          </div>
        )}

        {/* Section: Daily Tarot Card / Arcano del Día (Shown if ALL or TAROT) */}
        {(activeMainSection === "ALL" || activeMainSection === "TAROT") && (
          <DailyTarotCard onSendToOuija={handleSendCardToOuija} />
        )}

        {/* Section: Natal Chart / Carta Natal (Shown if ALL or NATAL) */}
        {(activeMainSection === "ALL" || activeMainSection === "NATAL") && (
          <NatalChartSection
            onSendToOuija={handleSendNatalToOuija}
            isPaywallEnabled={monetizationCfg.paywallEnabled}
            freeLimit={monetizationCfg.freeConsultationsLimit}
            remainingFree={remainingFree}
            isPassUnlocked={isPassUnlocked}
            isCreatorUnlimited={isCreatorOrAdmin}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onConsumeFreeConsultation={() => {
              incrementFreeConsultationsUsed();
              setAllowanceTick((v) => v + 1);
            }}
            onQueuePendingNatal={(data) => {
              const queued: PendingConsultation = {
                id: `pend_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                type: "natal-chart",
                data,
                createdAt: Date.now(),
              };
              savePendingConsultation(queued);
              setPendingConsultation(queued);
            }}
            pendingNatalExecution={pendingNatalExecution}
            onPendingNatalHandled={(id) => {
              setPendingNatalExecution((curr) => (curr?.id === id ? null : curr));
            }}
            mpLink={getEffectiveMpUrl(monetizationCfg)}
            passPriceArs={monetizationCfg.passPriceArs}
          />
        )}

        {/* Section: Misión de Vida según la Cábala (Árbol de la Vida) */}
        {(activeMainSection === "ALL" || activeMainSection === "CABALA") && (
          <KabbalahMissionSection onSendToOuija={handleSendNatalToOuija} />
        )}

        {/* Section: Antena Dimensional (External Interstellar Contact Portal) */}
        {(activeMainSection === "ALL" || activeMainSection === "ANTENA") && (
          <AntenaDimensionalPanel />
        )}
      </main>

      {/* Past Life Revelation Modal */}
      {isModalOpen && currentPastLife && (
        <PastLifeModal
          details={currentPastLife}
          seekerName={seekerName}
          onClose={() => {
            setIsModalOpen(false);
            setMode("IDLE");
          }}
          onSaveToCodex={handleSaveToCodex}
          isSaved={isCurrentSaved}
        />
      )}

      {/* Auto-unlock confirmation banner */}
      {paymentSuccessBanner && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] px-4 py-3 rounded-2xl bg-emerald-950/95 border border-emerald-400/60 text-emerald-100 text-xs font-cinzel text-center shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-fade-in">
          {paymentSuccessBanner}
        </div>
      )}

      {/* Unified Unlock Panel Modal (Mercado Pago & PayPal) */}
      <ConsultationPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        pendingConsultation={pendingConsultation}
        onUnlocked={() => {
          setAllowanceTick((v) => v + 1);
          runPendingConsultationIfAny();
        }}
      />

      {/* Consolidated Unlock Panel Banner */}
      {monetizationCfg.paywallEnabled && (
        <section
          aria-label="Panel de Desbloqueo"
          className="w-full max-w-4xl mt-6 bg-[#0f0918]/90 border border-amber-500/35 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-20 text-xs font-gothic"
        >
          {isCreatorOrAdmin ? (
            <>
              <div className="space-y-1">
                <span className="font-cinzel font-bold text-sm text-amber-200 block">
                  Modo Creador activo · Panel de Desbloqueo
                </span>
                <p className="text-purple-300/85 text-xs leading-relaxed">
                  Tienes acceso completo sin cobro. Tus visitantes ven las opciones de Mercado Pago (Argentina) y PayPal (USD / EUR / GBP) dentro del Panel de Desbloqueo tras{" "}
                  {monetizationCfg.freeConsultationsLimit}{" "}
                  {monetizationCfg.freeConsultationsLimit === 1 ? "consulta gratuita" : "consultas gratuitas"}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaywallOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:via-orange-400 hover:to-amber-500 text-neutral-950 border border-amber-200/70 font-cinzel font-bold text-xs transition shadow-[0_0_16px_rgba(245,158,11,0.35)] flex items-center justify-center space-x-2 cursor-pointer shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Abrir Panel de Desbloqueo</span>
              </button>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <span className="font-cinzel font-bold text-sm text-amber-200 block">
                  Panel de Desbloqueo · Consultas ilimitadas e instalación de App
                </span>
                <p className="text-purple-300/85 text-xs leading-relaxed">
                  {monetizationCfg.freeConsultationsLimit === 1
                    ? "Tu primera consulta (Carta Natal, Ouija o Vida Pasada) es 100% gratis. Desbloquea el acceso completo con Mercado Pago o PayPal (USD / EUR / GBP)."
                    : `Primeras ${monetizationCfg.freeConsultationsLimit} consultas 100% gratis. Desbloquea el acceso completo con Mercado Pago o PayPal (USD / EUR / GBP).`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaywallOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:via-orange-400 hover:to-amber-500 text-neutral-950 border border-amber-200/70 font-cinzel font-bold text-xs transition shadow-[0_0_18px_rgba(245,158,11,0.4)] flex items-center justify-center space-x-2 cursor-pointer shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Desbloqueo</span>
              </button>
            </>
          )}
        </section>
      )}

      {/* Footer with Real Visitor Counter */}
      <footer className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between py-4 text-[11px] font-gothic text-purple-400/70 z-20 border-t border-purple-900/30 mt-6 gap-3">
        <div className="flex items-center space-x-3">
          <p>{t("footerTitle")}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center space-x-1.5 text-purple-300/80">
            <Eye className="w-3.5 h-3.5 text-purple-400" />
            <span>
              <strong>{visitsStats?.totalVisits !== undefined ? visitsStats.totalVisits.toLocaleString(locale) : "1"}</strong> {t("realVisits")}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-300/90">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong>{(visitsStats?.onlineVisitors ?? 0).toLocaleString(locale)}</strong> {t("onlineNowLabel")}
            </span>
          </div>
        </div>
      </footer>

      {/* Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}
