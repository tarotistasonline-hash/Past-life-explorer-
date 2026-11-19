import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Lock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { SupportedLanguage } from "../types";
import {
  useMonetizationConfig,
  getEffectiveMpUrl,
  getFreeConsultationsUsed,
  getOrCreateVisitorId,
  setActivePaymentSessionId,
  markConsultationPassUnlocked,
  subscribePaymentBroadcast,
  setPaywallModalHeartbeat,
  clearPaywallModalHeartbeat,
  PendingConsultation,
} from "../lib/monetization";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";
import { authorizeAdmin } from "../lib/adminTracking";

interface ConsultationPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked?: () => void;
  pendingConsultation?: PendingConsultation | null;
}

interface PaywallCopy {
  badge: string;
  titleLimitReached: (limit: number) => string;
  titleUpgrade: string;
  subtitle: (limit: number) => string;
  queuedPastLife: string;
  queuedQuestion: string;
  queuedNatalChart: string;
  includes1: (limit: number) => string;
  includes2: string;
  includes3: string;
  payMp: string;
  waitingAutoTitle: string;
  waitingAutoDesc: string;
  checkNowBtn: string;
  checkingBtn: string;
  notYetApproved: string;
  successMsg: string;
  close: string;
}

const COPY: Record<SupportedLanguage, PaywallCopy> = {
  es: {
    badge: "Pase de Consultas Akáshicas • Sin Límite",
    titleLimitReached: (n) =>
      n === 1 ? "Has utilizado tu consulta gratuita" : `Has completado tus ${n} consultas gratuitas`,
    titleUpgrade: "Desbloquea Lecturas Ilimitadas",
    subtitle: (n) =>
      n === 1
        ? "Tu primera consulta (Carta Natal, Ouija o Vida Pasada) es 100% gratis. El pase ilimitado aplica a partir de la 2ª consulta mediante Mercado Pago."
        : `Disfruta de tus primeras ${n} consultas 100% gratis. El pase ilimitado aplica a partir de la ${n + 1}ª consulta mediante Mercado Pago.`,
    queuedPastLife: "Tu lectura de vida pasada está lista y comenzará automáticamente al confirmarse tu pago.",
    queuedQuestion: "Tu pregunta a la Tabla Ouija está lista y se responderá automáticamente al confirmarse tu pago.",
    queuedNatalChart: "Tu Carta Natal completa (voz, rueda y PDF) está lista y se revelará automáticamente al confirmarse tu pago.",
    includes1: (n) =>
      n === 1
        ? "Primera consulta 100% gratuita en carta natal, vidas pasadas o tabla ouija."
        : `Primeras ${n} consultas 100% gratuitas en vidas pasadas, tabla ouija y carta natal.`,
    includes2: "Lecturas ilimitadas de vidas pasadas, preguntas akáshicas y cartas natales con PDF.",
    includes3: "Desbloqueo inmediato con Mercado Pago o número de operación.",
    payMp: "Desbloquear con Mercado Pago",
    waitingAutoTitle: "Esperando confirmación automática...",
    waitingAutoDesc: "No cierres esta ventana: apenas finalices el pago se desbloqueará y ejecutará tu lectura.",
    checkNowBtn: "Comprobar ahora",
    checkingBtn: "Verificando...",
    notYetApproved: "Aún no recibimos la confirmación. Completa el pago o ingresa tu número de operación abajo.",
    successMsg: "¡Pago confirmado! Desbloqueando y revelando tu lectura ahora...",
    close: "Volver",
  },
  en: {
    badge: "Akashic Consultation Pass • Unlimited",
    titleLimitReached: (n) =>
      n === 1 ? "You have used your free consultation" : `You have used your ${n} free consultations`,
    titleUpgrade: "Unlock Unlimited Readings",
    subtitle: (n) =>
      n === 1
        ? "Your first consultation (Natal Chart, Ouija, or Past Life) is 100% free. Unlimited access applies from the 2nd consultation via Mercado Pago."
        : `Enjoy your first ${n} consultations 100% free. Unlimited access applies from consultation #${n + 1} via Mercado Pago.`,
    queuedPastLife: "Your past-life reading is queued and will start automatically upon confirmation.",
    queuedQuestion: "Your Ouija question is queued and will be answered automatically upon confirmation.",
    queuedNatalChart: "Your complete Natal Chart (voice, wheel & PDF) is ready and will unlock automatically upon confirmation.",
    includes1: (n) =>
      n === 1
        ? "First consultation 100% free for natal charts, past lives, or Ouija."
        : `First ${n} consultations 100% free for past lives, Ouija, and natal charts.`,
    includes2: "Unlimited past-life readings, Akashic questions, and natal charts with PDF export.",
    includes3: "Instant unlock via Mercado Pago or operation number.",
    payMp: "Unlock with Mercado Pago",
    waitingAutoTitle: "Waiting for automatic confirmation...",
    waitingAutoDesc: "Keep this window open: your reading will unlock automatically once paid.",
    checkNowBtn: "Check status now",
    checkingBtn: "Checking...",
    notYetApproved: "Confirmation not received yet. Please finish checkout or enter your operation number below.",
    successMsg: "Payment confirmed! Unlocking and starting your reading now...",
    close: "Back",
  },
  pt: {
    badge: "Passe de Consultas Akáshicas • Ilimitado",
    titleLimitReached: (n) =>
      n === 1 ? "Você usou sua consulta gratuita" : `Você usou suas ${n} consultas gratuitas`,
    titleUpgrade: "Desbloqueie Leituras Ilimitadas",
    subtitle: (n) =>
      n === 1
        ? "Sua primeira consulta é 100% gratuita. O passe ilimitado se aplica a partir da 2ª consulta via Mercado Pago."
        : `Aproveite suas primeiras ${n} consultas 100% gratuitas. O passe ilimitado se aplica a partir da ${n + 1}ª consulta via Mercado Pago.`,
    queuedPastLife: "Sua leitura de vida passada está pronta e começará automaticamente após a confirmação.",
    queuedQuestion: "Sua pergunta na Tábua Ouija está pronta e será respondida automaticamente após a confirmação.",
    queuedNatalChart: "Seu Mapa Astral completo (voz, roda e PDF) está pronto e será revelado após a confirmação.",
    includes1: (n) =>
      n === 1
        ? "Primeira consulta 100% gratuita em mapa astral, vidas passadas ou Ouija."
        : `Primeiras ${n} consultas 100% gratuitas em vidas passadas, Ouija e mapa astral.`,
    includes2: "Leituras ilimitadas de vidas passadas, perguntas akáshicas e mapas astrais com PDF.",
    includes3: "Desbloqueio instantâneo via Mercado Pago ou número de operação.",
    payMp: "Desbloquear com Mercado Pago",
    waitingAutoTitle: "Aguardando confirmação automática...",
    waitingAutoDesc: "Mantenha esta janela aberta: sua leitura começará automaticamente após o pagamento.",
    checkNowBtn: "Verificar agora",
    checkingBtn: "Verificando...",
    notYetApproved: "Confirmação ainda não recebida. Conclua o pagamento ou informe o número de operação abaixo.",
    successMsg: "Pagamento confirmado! Desbloqueando e iniciando sua leitura agora...",
    close: "Voltar",
  },
  fr: {
    badge: "Pass Consultations Akashiques • Illimité",
    titleLimitReached: (n) =>
      n === 1 ? "Vous avez utilisé votre consultation gratuite" : `Vous avez utilisé vos ${n} consultations gratuites`,
    titleUpgrade: "Débloquez des Lectures Illimitées",
    subtitle: (n) =>
      n === 1
        ? "Votre première consultation est 100% gratuite. L'accès illimité s'applique dès la 2ème consultation via Mercado Pago."
        : `Profitez de vos ${n} premières consultations 100% gratuites. L'accès illimité s'applique dès la ${n + 1}ème consultation via Mercado Pago.`,
    queuedPastLife: "Votre lecture de vie antérieure est prête et démarrera automatiquement.",
    queuedQuestion: "Votre question Ouija est prête et recevra sa réponse automatiquement.",
    queuedNatalChart: "Votre Thème Natal complet (voix, roue et PDF) est prêt et s'ouvrira dès confirmation.",
    includes1: (n) =>
      n === 1
        ? "1ère consultation 100% gratuite pour thème natal, vies antérieures ou Ouija."
        : `${n} premières consultations 100% gratuites pour vies antérieures, Ouija et thème natal.`,
    includes2: "Lectures illimitées de vies antérieures, questions akashiques et thèmes natals en PDF.",
    includes3: "Déblocage instantané via Mercado Pago ou numéro d'opération.",
    payMp: "Débloquer avec Mercado Pago",
    waitingAutoTitle: "En attente de confirmation...",
    waitingAutoDesc: "Gardez cette fenêtre ouverte : votre lecture démarrera automatiquement dès validation.",
    checkNowBtn: "Vérifier maintenant",
    checkingBtn: "Vérification...",
    notYetApproved: "Confirmation non reçue. Finalisez le paiement ou entrez votre numéro d'opération ci-dessous.",
    successMsg: "Paiement confirmé ! Déblocage et lancement de votre lecture...",
    close: "Retour",
  },
  it: {
    badge: "Pass Consulti Akashici • Illimitati",
    titleLimitReached: (n) =>
      n === 1 ? "Hai esaurito il tuo consulto gratuito" : `Hai esaurito i ${n} consulti gratuiti`,
    titleUpgrade: "Sblocca Letture Illimitate",
    subtitle: (n) =>
      n === 1
        ? "Il tuo primo consulto è 100% gratuito. L'accesso illimitato si applica dal 2° consulto tramite Mercado Pago."
        : `Goditi i primi ${n} consulti 100% gratuiti. L'accesso illimitato si applica dal ${n + 1}° consulto tramite Mercado Pago.`,
    queuedPastLife: "La tua lettura delle vite passate è pronta e inizierà automaticamente.",
    queuedQuestion: "La tua domanda Ouija è pronta e riceverà risposta automaticamente.",
    queuedNatalChart: "Il tuo Tema Natale completo (voce, ruota e PDF) è pronto e si sbloccherà dopo il pagamento.",
    includes1: (n) =>
      n === 1
        ? "Primo consulto 100% gratuito per tema natale, vite passate o Ouija."
        : `Primi ${n} consulti 100% gratuiti per vite passate, Ouija e tema natale.`,
    includes2: "Letture illimitate delle vite passate, domande akashiche e temi natali in PDF.",
    includes3: "Sblocco istantaneo tramite Mercado Pago o numero di operazione.",
    payMp: "Sblocca con Mercado Pago",
    waitingAutoTitle: "In attesa di conferma...",
    waitingAutoDesc: "Tieni aperta questa finestra: la lettura inizierà automaticamente dopo il pagamento.",
    checkNowBtn: "Verifica ora",
    checkingBtn: "Verifica...",
    notYetApproved: "Conferma non ancora ricevuta. Completa il pagamento o inserisci il numero di operazione.",
    successMsg: "Pagamento confermato! Sblocco e avvio della tua lettura...",
    close: "Indietro",
  },
  de: {
    badge: "Akasha-Beratungspass • Unbegrenzt",
    titleLimitReached: (n) =>
      n === 1 ? "Du hast deine kostenlose Abfrage aufgebraucht" : `Du hast deine ${n} kostenlosen Abfragen aufgebraucht`,
    titleUpgrade: "Unbegrenzte Lesungen freischalten",
    subtitle: (n) =>
      n === 1
        ? "Deine erste Abfrage ist 100% kostenlos. Der unbegrenzte Zugang gilt ab der 2. Abfrage über Mercado Pago."
        : `Genieße deine ersten ${n} Abfragen 100% kostenlos. Der unbegrenzte Zugang gilt ab Abfrage ${n + 1} über Mercado Pago.`,
    queuedPastLife: "Deine Lesung über ein früheres Leben steht bereit und startet automatisch.",
    queuedQuestion: "Deine Ouija-Frage steht bereit und wird automatisch beantwortet.",
    queuedNatalChart: "Dein vollständiges Geburtshoroskop (Stimme, Rad & PDF) wird nach Zahlung sofort freigeschaltet.",
    includes1: (n) =>
      n === 1
        ? "Erste Abfrage 100% kostenlos für Geburtshoroskop, frühere Leben oder Ouija."
        : `Erste ${n} Abfragen 100% kostenlos für frühere Leben, Ouija und Geburtshoroskop.`,
    includes2: "Unbegrenzte Lesungen früherer Leben, Akasha-Fragen und Geburtshoroskope als PDF.",
    includes3: "Sofortige Freischaltung über Mercado Pago oder Vorgangsnummer.",
    payMp: "Mit Mercado Pago freischalten",
    waitingAutoTitle: "Warte auf Bestätigung...",
    waitingAutoDesc: "Lass dieses Fenster offen: Deine Lesung startet sofort automatisch nach Zahlung.",
    checkNowBtn: "Jetzt prüfen",
    checkingBtn: "Wird geprüft...",
    notYetApproved: "Noch keine Bestätigung erhalten. Bitte schließe die Zahlung ab oder gib deine Vorgangsnummer ein.",
    successMsg: "Zahlung bestätigt! Deine Lesung wird jetzt gestartet...",
    close: "Zurück",
  },
};

export const ConsultationPaywallModal: React.FC<ConsultationPaywallModalProps> = ({
  isOpen,
  onClose,
  onUnlocked,
  pendingConsultation,
}) => {
  const { language } = useLanguage();
  const cfg = useMonetizationConfig();

  const [sessionId, setSessionId] = useState<string>("");
  const [dynamicMpUrl, setDynamicMpUrl] = useState<string>("");
  const [awaitingPayment, setAwaitingPayment] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [unlockedDone, setUnlockedDone] = useState<boolean>(false);

  // Manual operation number state
  const [operationNumber, setOperationNumber] = useState<string>("");
  const [isValidatingOp, setIsValidatingOp] = useState<boolean>(false);
  const [opFeedback, setOpFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // Creator quick-unlock state
  const [showCreatorLogin, setShowCreatorLogin] = useState<boolean>(false);
  const [creatorEmailInput, setCreatorEmailInput] = useState<string>("");
  const [creatorLoginError, setCreatorLoginError] = useState<string>("");

  const unlockedOnceRef = useRef<boolean>(false);

  const triggerUnlockSuccess = useCallback(
    (proof: string, approvedSessionId?: string) => {
      if (unlockedOnceRef.current) return;
      unlockedOnceRef.current = true;
      setUnlockedDone(true);
      setStatusMessage("");
      markConsultationPassUnlocked(proof, approvedSessionId || sessionId);
      setTimeout(() => {
        onUnlocked?.();
        onClose();
      }, 900);
    },
    [onClose, onUnlocked, sessionId]
  );

  useEffect(() => {
    if (!isOpen) {
      clearPaywallModalHeartbeat();
      return;
    }
    unlockedOnceRef.current = false;
    setUnlockedDone(false);
    setStatusMessage("");
    setAwaitingPayment(false);
    setOperationNumber("");
    setOpFeedback(null);
    setShowCreatorLogin(false);
    setCreatorEmailInput("");
    setCreatorLoginError("");

    setPaywallModalHeartbeat();
    const hbInterval = setInterval(() => {
      setPaywallModalHeartbeat();
    }, 1500);

    let cancelled = false;
    const initSession = async () => {
      try {
        const visitorId = getOrCreateVisitorId();
        const res = await fetch("/api/payments/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId,
            pendingType: pendingConsultation?.type || "pass",
            origin: window.location.origin,
          }),
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        if (data?.sessionId) {
          setSessionId(data.sessionId);
          setActivePaymentSessionId(data.sessionId);
        }
        if (data?.mpUrl) setDynamicMpUrl(data.mpUrl);
      } catch {
        // Fallback to static Mercado Pago link
      }
    };

    initSession();

    return () => {
      cancelled = true;
      clearInterval(hbInterval);
      clearPaywallModalHeartbeat();
    };
  }, [isOpen, pendingConsultation?.type]);

  const checkSessionStatusNow = useCallback(
    async (silent = true) => {
      if (!sessionId || unlockedOnceRef.current) return;
      if (!silent) {
        setIsChecking(true);
        setStatusMessage("");
      }
      try {
        const res = await fetch(`/api/payments/session/${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.status === "approved" && json?.approvalProof) {
            triggerUnlockSuccess(json.approvalProof, json.sessionId);
            return;
          }
        }
        if (!silent) {
          setStatusMessage(COPY[language]?.notYetApproved || COPY.es.notYetApproved);
        }
      } catch {
        if (!silent) {
          setStatusMessage(COPY[language]?.notYetApproved || COPY.es.notYetApproved);
        }
      } finally {
        if (!silent) setIsChecking(false);
      }
    },
    [language, sessionId, triggerUnlockSuccess]
  );

  // Manual operation verification handler (verified against real Mercado Pago API)
  const handleValidateOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(HAPTIC_PATTERNS.click);
    const cleanOp = operationNumber.trim();
    if (!cleanOp || cleanOp.length < 4) {
      setOpFeedback({ type: "err", msg: "Por favor ingresa un número de operación válido de Mercado Pago." });
      return;
    }

    setIsValidatingOp(true);
    setOpFeedback(null);
    try {
      const visitorId = getOrCreateVisitorId();
      const res = await fetch("/api/payments/verify-operation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationNumber: cleanOp,
          sessionId,
          visitorId,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.approved && data?.approvalProof) {
        setOpFeedback({ type: "ok", msg: "¡Pago verificado en Mercado Pago! Acceso inmediato concedido." });
        setTimeout(() => {
          triggerUnlockSuccess(data.approvalProof, data.sessionId);
        }, 600);
      } else {
        let errMsg = "No se encontró un pago aprobado en Mercado Pago con ese número de operación.";
        if (data?.reason === "mp_token_not_configured") {
          errMsg =
            "Falta configurar MERCADOPAGO_ACCESS_TOKEN en los Secrets del servidor para validar pagos reales.";
        } else if (data?.reason === "already_claimed") {
          errMsg = "Ese número de operación de Mercado Pago ya fue utilizado anteriormente.";
        } else if (data?.reason === "amount_mismatch") {
          errMsg = "El importe del comprobante no coincide con el valor del pase configurado.";
        } else if (data?.reason === "payment_not_approved" && data?.mpStatus) {
          errMsg = `El pago figura con estado "${data.mpStatus}" en Mercado Pago (debe estar aprobado).`;
        }
        setOpFeedback({ type: "err", msg: errMsg });
      }
    } catch {
      setOpFeedback({ type: "err", msg: "Error de conexión al validar la operación con Mercado Pago." });
    } finally {
      setIsValidatingOp(false);
    }
  };

  // Real-time listeners: SSE + BroadcastChannel + focus check + polling
  useEffect(() => {
    if (!isOpen) return;

    const unsubBroadcast = subscribePaymentBroadcast(({ proof, sessionId: sid }) => {
      if (proof) {
        triggerUnlockSuccess(proof, sid);
      }
    });

    let eventSource: EventSource | null = null;

    if (sessionId) {
      try {
        eventSource = new EventSource(`/api/payments/stream/${encodeURIComponent(sessionId)}`);
        eventSource.onmessage = (ev) => {
          try {
            const parsed = JSON.parse(ev.data);
            if (parsed?.type === "PAYMENT_APPROVED" && parsed?.approvalProof) {
              triggerUnlockSuccess(parsed.approvalProof, parsed.sessionId);
            }
          } catch {
            // ignore
          }
        };
      } catch {
        // ignore SSE fallback
      }
    }

    const onFocus = () => {
      if (sessionId) checkSessionStatusNow(true);
    };
    window.addEventListener("focus", onFocus);

    const pollTimer = awaitingPayment && sessionId
      ? setInterval(() => {
          checkSessionStatusNow(true);
        }, 4000)
      : null;

    return () => {
      unsubBroadcast();
      eventSource?.close();
      window.removeEventListener("focus", onFocus);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [isOpen, sessionId, awaitingPayment, checkSessionStatusNow, triggerUnlockSuccess]);

  if (!isOpen) return null;

  const copy = COPY[language] || COPY.es;
  const mpUrl = getEffectiveMpUrl(cfg) || dynamicMpUrl;
  const used = getFreeConsultationsUsed();
  const limitReached = used >= cfg.freeConsultationsLimit;

  const handlePaymentClick = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    setAwaitingPayment(true);
    setStatusMessage("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#0f081b] border border-amber-500/45 rounded-3xl p-5 sm:p-7 text-purple-100 shadow-[0_0_55px_rgba(245,158,11,0.22)] space-y-4 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-purple-950/80 hover:bg-purple-900 text-purple-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[11px] font-cinzel font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>{copy.badge}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-cinzel font-bold text-amber-100 leading-snug">
            {limitReached ? copy.titleLimitReached(cfg.freeConsultationsLimit) : copy.titleUpgrade}
          </h2>
          <p className="text-xs sm:text-sm font-gothic text-purple-200/85 leading-relaxed">
            {copy.subtitle(cfg.freeConsultationsLimit)}
          </p>
        </div>

        {/* Queued consultation auto-start banner */}
        {pendingConsultation && (
          <div className="p-3 rounded-2xl bg-amber-950/35 border border-amber-500/40 flex items-start space-x-2.5 text-xs font-gothic text-amber-100">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-0.5">
              <p className="font-semibold text-amber-200">
                {pendingConsultation.type === "past-life"
                  ? copy.queuedPastLife
                  : pendingConsultation.type === "natal-chart"
                  ? copy.queuedNatalChart
                  : copy.queuedQuestion}
              </p>
              {pendingConsultation.type === "past-life" && pendingConsultation.data.focusQuery && (
                <p className="text-[11px] text-amber-200/80 italic line-clamp-2">
                  "{pendingConsultation.data.focusQuery}"
                </p>
              )}
              {pendingConsultation.type === "spirit-question" && pendingConsultation.question && (
                <p className="text-[11px] text-amber-200/80 italic line-clamp-2">
                  "{pendingConsultation.question}"
                </p>
              )}
              {pendingConsultation.type === "natal-chart" && (
                <p className="text-[11px] text-amber-200/80 italic line-clamp-2">
                  {pendingConsultation.data.name} • {pendingConsultation.data.birthDate} • {pendingConsultation.data.birthCity}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Benefits & Clarification */}
        <div className="p-3.5 rounded-2xl bg-purple-950/45 border border-purple-800/50 space-y-2 text-xs font-gothic text-purple-200/90">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>{copy.includes1(cfg.freeConsultationsLimit)}</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>{copy.includes2}</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>{copy.includes3}</span>
          </div>
        </div>

        {/* Unlocked success banner */}
        {unlockedDone ? (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 flex items-center space-x-3 text-emerald-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 animate-bounce" />
            <p className="text-xs sm:text-sm font-cinzel font-bold">{copy.successMsg}</p>
          </div>
        ) : (
          <>
            {/* Primary Payment Button: Mercado Pago */}
            <div className="space-y-3 pt-1">
              {/* Mercado Pago Button */}
              <a
                href={mpUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handlePaymentClick}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:via-orange-400 hover:to-amber-500 text-neutral-950 font-cinzel font-bold text-xs sm:text-sm shadow-[0_0_22px_rgba(245,158,11,0.45)] border border-amber-200/70 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{copy.payMp}</span>
                {cfg.passPriceArs.trim() && (
                  <span className="px-2 py-0.5 rounded bg-black/20 text-neutral-950 font-mono text-[11px] font-bold">
                    {cfg.passPriceArs.trim()}
                  </span>
                )}
                <ExternalLink className="w-3.5 h-3.5 opacity-90" />
              </a>
            </div>

            {/* Manual Operation Number Validation Field */}
            <form onSubmit={handleValidateOperation} className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/35 space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-cinzel font-bold text-amber-300">
                <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Validación Rápida por Número de Operación / Comprobante</span>
              </div>
              <p className="text-[11px] font-gothic text-purple-200/80">
                Si ya abonaste en Mercado Pago, ingresa tu número de operación o comprobante para obtener acceso inmediato sin esperar:
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={operationNumber}
                  onChange={(e) => setOperationNumber(e.target.value)}
                  placeholder="Ej. 1234567890 o REF-XYZ"
                  className="flex-1 px-3 py-2 bg-purple-950/60 border border-purple-700/60 rounded-xl text-purple-100 placeholder-purple-400/40 text-xs font-mono focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={isValidatingOp}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-neutral-950 font-cinzel font-bold text-xs transition cursor-pointer disabled:opacity-60 shadow flex items-center space-x-1 shrink-0"
                >
                  {isValidatingOp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Validar</span>}
                </button>
              </div>

              {opFeedback && (
                <div
                  className={`text-[11px] font-gothic p-2 rounded-xl border ${
                    opFeedback.type === "ok"
                      ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-200"
                      : "bg-red-950/70 border-red-500/50 text-red-200"
                  }`}
                >
                  {opFeedback.msg}
                </div>
              )}
            </form>

            {/* Automatic live detection indicator */}
            {awaitingPayment && (
              <div className="p-3 rounded-2xl bg-indigo-950/50 border border-indigo-400/40 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-xs font-cinzel font-bold text-indigo-200">
                    <Loader2 className="w-4 h-4 text-amber-300 animate-spin shrink-0" />
                    <span>{copy.waitingAutoTitle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => checkSessionStatusNow(false)}
                    disabled={isChecking}
                    className="px-2.5 py-1 rounded-lg bg-indigo-800/70 hover:bg-indigo-700 text-[11px] font-cinzel text-indigo-100 flex items-center space-x-1 cursor-pointer shrink-0 disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3 h-3 ${isChecking ? "animate-spin" : ""}`} />
                    <span>{isChecking ? copy.checkingBtn : copy.checkNowBtn}</span>
                  </button>
                </div>
                <p className="text-[11px] font-gothic text-indigo-200/80">
                  {copy.waitingAutoDesc}
                </p>
                {statusMessage && (
                  <p className="text-[11px] font-gothic text-amber-200/90 pt-1">
                    {statusMessage}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Inline Creator Access Unlock */}
        {!unlockedDone && (
          <div className="pt-1 border-t border-purple-900/40">
            {!showCreatorLogin ? (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(HAPTIC_PATTERNS.click);
                  setShowCreatorLogin(true);
                  setCreatorLoginError("");
                }}
                className="w-full py-1.5 text-[11px] font-gothic text-amber-300/80 hover:text-amber-200 underline underline-offset-2 transition cursor-pointer text-center"
              >
                ¿Eres el creador del sitio? Activar consultas ilimitadas de propietario
              </button>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  triggerHaptic(HAPTIC_PATTERNS.click);
                  if (authorizeAdmin(creatorEmailInput)) {
                    setCreatorLoginError("");
                    setShowCreatorLogin(false);
                    setCreatorEmailInput("");
                    onUnlocked?.();
                    onClose();
                  } else {
                    setCreatorLoginError("Correo no autorizado. Ingresa el correo del creador del sitio.");
                  }
                }}
                className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/35 space-y-2"
              >
                <p className="text-[11px] font-cinzel font-semibold text-amber-200">
                  Acceso Exclusivo del Creador
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={creatorEmailInput}
                    onChange={(e) => {
                      setCreatorEmailInput(e.target.value);
                      if (creatorLoginError) setCreatorLoginError("");
                    }}
                    placeholder="Ingresa tu correo de propietario..."
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-black/60 border border-amber-500/40 text-xs font-gothic text-amber-100 placeholder:text-amber-300/40 focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 text-[11px] font-cinzel font-bold transition cursor-pointer shrink-0"
                  >
                    Activar
                  </button>
                </div>
                {creatorLoginError && (
                  <p className="text-[11px] font-gothic text-rose-300">
                    {creatorLoginError}
                  </p>
                )}
              </form>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-purple-800/40 text-xs font-cinzel text-purple-300 transition cursor-pointer"
        >
          {copy.close}
        </button>
      </div>
    </div>
  );
};
