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
  CreditCard,
  Heart,
  Check,
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

interface ConsultationPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked?: () => void;
  pendingConsultation?: PendingConsultation | null;
}

interface PaywallCopy {
  badge: string;
  titleLimitReached: string;
  titleUpgrade: string;
  subtitle: string;
  queuedPastLife: string;
  queuedQuestion: string;
  includes1: string;
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
    titleLimitReached: "Has completado tus 2 consultas gratuitas",
    titleUpgrade: "Desbloquea Lecturas Ilimitadas",
    subtitle:
      "Disfruta de tus primeras 2 consultas 100% gratis. El pase ilimitado aplica a partir de la 3ª consulta mediante Mercado Pago, Stripe o Ko-fi.",
    queuedPastLife: "Tu lectura de vida pasada está lista y comenzará automáticamente al confirmarse tu pago.",
    queuedQuestion: "Tu pregunta a la Tabla Ouija está lista y se responderá automáticamente al confirmarse tu pago.",
    includes1: "Primeras 2 consultas 100% gratuitas en vidas pasadas y tabla ouija.",
    includes2: "Lecturas ilimitadas de vidas pasadas y preguntas akáshicas sin restricciones.",
    includes3: "Desbloqueo inmediato con link de Mercado Pago, Stripe o número de operación.",
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
    titleLimitReached: "You have used your 2 free consultations",
    titleUpgrade: "Unlock Unlimited Readings",
    subtitle:
      "Enjoy your first 2 consultations 100% free. Unlimited access applies from the 3rd consultation via Mercado Pago, Stripe, or Ko-fi.",
    queuedPastLife: "Your past-life reading is queued and will start automatically upon confirmation.",
    queuedQuestion: "Your Ouija question is queued and will be answered automatically upon confirmation.",
    includes1: "First 2 consultations 100% free for past lives and Ouija.",
    includes2: "Unlimited past-life readings and Akashic questions without restrictions.",
    includes3: "Instant unlock via Mercado Pago, Stripe, or operation number.",
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
    titleLimitReached: "Você usou suas 2 consultas gratuitas",
    titleUpgrade: "Desbloqueie Leituras Ilimitadas",
    subtitle:
      "Aproveite suas primeiras 2 consultas 100% gratuitas. O passe ilimitado se aplica a partir da 3ª consulta via Mercado Pago, Stripe ou Ko-fi.",
    queuedPastLife: "Sua leitura de vida passada está pronta e começará automaticamente após a confirmação.",
    queuedQuestion: "Sua pergunta na Tábua Ouija está pronta e será respondida automaticamente após a confirmação.",
    includes1: "Primeiras 2 consultas 100% gratuitas em vidas passadas e Ouija.",
    includes2: "Leituras ilimitadas de vidas passadas e perguntas akáshicas.",
    includes3: "Desbloqueio instantâneo via Mercado Pago, Stripe ou número de operação.",
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
    titleLimitReached: "Vous avez utilisé vos 2 consultations gratuites",
    titleUpgrade: "Débloquez des Lectures Illimitées",
    subtitle:
      "Profitez de vos 2 premières consultations 100% gratuites. L'accès illimité s'applique à partir de la 3ème consultation via Mercado Pago, Stripe ou Ko-fi.",
    queuedPastLife: "Votre lecture de vie antérieure est prête et démarrera automatiquement.",
    queuedQuestion: "Votre question Ouija est prête et recevra sa réponse automatiquement.",
    includes1: "2 premières consultations 100% gratuites pour vies antérieures et Ouija.",
    includes2: "Lectures illimitées de vies antérieures et questions akashiques.",
    includes3: "Déblocage instantané via Mercado Pago, Stripe ou numéro d'opération.",
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
    titleLimitReached: "Hai esaurito i 2 consulti gratuiti",
    titleUpgrade: "Sblocca Letture Illimitate",
    subtitle:
      "Goditi i primi 2 consulti 100% gratuiti. L'accesso illimitato si applica dal 3° consulto tramite Mercado Pago, Stripe o Ko-fi.",
    queuedPastLife: "La tua lettura delle vite passate è pronta e inizierà automaticamente.",
    queuedQuestion: "La tua domanda Ouija è pronta e riceverà risposta automaticamente.",
    includes1: "Primi 2 consulti 100% gratuiti per vite passate e Ouija.",
    includes2: "Letture illimitate delle vite passate e domande akashiche.",
    includes3: "Sblocco istantaneo tramite Mercado Pago, Stripe o numero di operazione.",
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
    titleLimitReached: "Du hast deine 2 kostenlosen Abfragen aufgebraucht",
    titleUpgrade: "Unbegrenzte Lesungen freischalten",
    subtitle:
      "Genieße deine ersten 2 Abfragen 100% kostenlos. Der unbegrenzte Zugang gilt ab der 3. Abfrage über Mercado Pago, Stripe oder Ko-fi.",
    queuedPastLife: "Deine Lesung über ein früheres Leben steht bereit und startet automatisch.",
    queuedQuestion: "Deine Ouija-Frage steht bereit und wird automatisch beantwortet.",
    includes1: "Erste 2 Abfragen 100% kostenlos für frühere Leben und Ouija.",
    includes2: "Unbegrenzte Lesungen früherer Leben und Akasha-Fragen.",
    includes3: "Sofortige Freischaltung über Mercado Pago, Stripe oder Vorgangsnummer.",
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

  // Manual operation verification handler
  const handleValidateOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(HAPTIC_PATTERNS.click);
    const cleanOp = operationNumber.trim();
    if (!cleanOp || cleanOp.length < 3) {
      setOpFeedback({ type: "err", msg: "Por favor ingresa un número de operación válido." });
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
        setOpFeedback({ type: "ok", msg: "¡Operación validada con éxito! Acceso inmediato concedido." });
        setTimeout(() => {
          triggerUnlockSuccess(data.approvalProof, data.sessionId);
        }, 600);
      } else {
        setOpFeedback({ type: "err", msg: "No se pudo validar el número de operación. Inténtalo nuevamente." });
      }
    } catch {
      setOpFeedback({ type: "err", msg: "Error de conexión al validar la operación." });
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
            {limitReached ? copy.titleLimitReached : copy.titleUpgrade}
          </h2>
          <p className="text-xs sm:text-sm font-gothic text-purple-200/85 leading-relaxed">
            {copy.subtitle}
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
            </div>
          </div>
        )}

        {/* Benefits & Clarification */}
        <div className="p-3.5 rounded-2xl bg-purple-950/45 border border-purple-800/50 space-y-2 text-xs font-gothic text-purple-200/90">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>{copy.includes1}</span>
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
            {/* Primary Payment Buttons: Mercado Pago, Stripe & Ko-fi */}
            <div className="space-y-2.5 pt-1">
              {/* Mercado Pago Button */}
              <a
                href={mpUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handlePaymentClick}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-[#009EE3] hover:bg-[#008AD0] text-white font-cinzel font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,158,227,0.4)] border border-sky-300/30 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{copy.payMp}</span>
                {cfg.passPriceArs.trim() && (
                  <span className="px-2 py-0.5 rounded bg-black/25 font-mono text-[11px]">
                    {cfg.passPriceArs.trim()}
                  </span>
                )}
                <ExternalLink className="w-3.5 h-3.5 opacity-90" />
              </a>

              {/* Stripe Button */}
              <a
                href="https://buy.stripe.com/test_fZudRa5m20kM6kXfd0gUM00"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handlePaymentClick}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-[#635BFF] hover:bg-[#5851DB] text-white font-cinzel font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(99,91,255,0.35)] border border-indigo-300/30 transition cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pagar con Stripe (Tarjeta / USD)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-90" />
              </a>

              {/* Ko-fi Button */}
              <a
                href="https://ko-fi.com/J3J31XDE6Q"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handlePaymentClick}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-[#29abe0] hover:bg-[#2295c5] text-white font-cinzel font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(41,171,224,0.35)] border border-sky-200/35 transition cursor-pointer"
              >
                <Heart className="w-4 h-4 text-pink-200 fill-pink-200" />
                <span>Apoyar en Ko-fi</span>
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
