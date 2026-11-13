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
  payStepTitle: string;
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
    badge: "Pase de Consultas Akáshicas • Mercado Pago",
    titleLimitReached: "Has completado tus consultas gratuitas",
    titleUpgrade: "Desbloquea Lecturas de Vidas Pasadas y Preguntas Ilimitadas",
    subtitle:
      "Al abonar por Mercado Pago, esta pantalla detectará tu pago y desbloqueará automáticamente la consulta solicitada.",
    queuedPastLife: "Tu lectura de vida pasada está lista y comenzará automáticamente al confirmarse el pago por Mercado Pago.",
    queuedQuestion: "Tu pregunta a la Tabla Ouija está lista y se responderá automáticamente al confirmarse el pago por Mercado Pago.",
    includes1: "Lecturas completas de vidas pasadas con narración de voz y pergamino.",
    includes2: "Preguntas ilimitadas en la Tabla Ouija sobre tu historia y respuestas.",
    includes3: "Desbloqueo 100% automático e inmediato al completar el pago en Mercado Pago.",
    payStepTitle: "",
    payMp: "Desbloquear con Mercado Pago",
    waitingAutoTitle: "Esperando confirmación automática de Mercado Pago...",
    waitingAutoDesc: "No cierres esta ventana: apenas finalices el pago en Mercado Pago se desbloqueará y ejecutará tu lectura.",
    checkNowBtn: "Comprobar ahora",
    checkingBtn: "Verificando...",
    notYetApproved: "Aún no recibimos la confirmación del pago de Mercado Pago. Completa el pago en la ventana abierta o espera unos segundos.",
    successMsg: "¡Pago de Mercado Pago confirmado! Desbloqueando y revelando tu lectura ahora...",
    close: "Volver",
  },
  en: {
    badge: "Akashic Consultation Pass • Mercado Pago",
    titleLimitReached: "You have used your free consultations",
    titleUpgrade: "Unlock Unlimited Past-Life Readings & Questions",
    subtitle:
      "Once you complete your payment via Mercado Pago, your requested reading will unlock and start automatically.",
    queuedPastLife: "Your past-life reading is queued and will start automatically as soon as Mercado Pago confirms payment.",
    queuedQuestion: "Your Ouija question is queued and will be answered automatically once Mercado Pago confirms payment.",
    includes1: "Full past-life readings with voice narration and parchment export.",
    includes2: "Unlimited follow-up questions on the Interactive Ouija Board.",
    includes3: "Instant automatic unlock right after completing Mercado Pago checkout.",
    payStepTitle: "Pay with Mercado Pago to unlock",
    payMp: "Unlock with Mercado Pago",
    waitingAutoTitle: "Waiting for Mercado Pago automatic confirmation...",
    waitingAutoDesc: "Keep this window open: your reading will unlock and begin automatically once paid on Mercado Pago.",
    checkNowBtn: "Check status now",
    checkingBtn: "Checking...",
    notYetApproved: "Mercado Pago confirmation has not arrived yet. Please finish checkout in the opened tab.",
    successMsg: "Mercado Pago payment confirmed! Unlocking and starting your reading now...",
    close: "Back",
  },
  pt: {
    badge: "Passe de Consultas Akáshicas • Mercado Pago",
    titleLimitReached: "Você usou suas consultas gratuitas",
    titleUpgrade: "Desbloqueie Leituras de Vidas Passadas e Perguntas Ilimitadas",
    subtitle:
      "Ao concluir o pagamento pelo Mercado Pago, sua leitura solicitada será desbloqueada e iniciada automaticamente.",
    queuedPastLife: "Sua leitura de vida passada está pronta e começará automaticamente após o pagamento pelo Mercado Pago.",
    queuedQuestion: "Sua pergunta na Tábua Ouija está pronta e será respondida automaticamente após o pagamento pelo Mercado Pago.",
    includes1: "Leituras completas de vidas passadas com narração e pergaminho.",
    includes2: "Perguntas ilimitadas na Tábua Ouija sobre suas revelações.",
    includes3: "Desbloqueio automático imediato ao finalizar o pagamento no Mercado Pago.",
    payStepTitle: "Pague com Mercado Pago para desbloquear",
    payMp: "Desbloquear com Mercado Pago",
    waitingAutoTitle: "Aguardando confirmação automática do Mercado Pago...",
    waitingAutoDesc: "Mantenha esta janela aberta: sua leitura começará automaticamente após pagar no Mercado Pago.",
    checkNowBtn: "Verificar agora",
    checkingBtn: "Verificando...",
    notYetApproved: "Ainda não recebemos a confirmação do Mercado Pago. Conclua o pagamento na aba aberta.",
    successMsg: "Pagamento confirmado pelo Mercado Pago! Desbloqueando e iniciando sua leitura agora...",
    close: "Voltar",
  },
  fr: {
    badge: "Pass Consultations Akashiques • Mercado Pago",
    titleLimitReached: "Vous avez utilisé vos consultations gratuites",
    titleUpgrade: "Débloquez les Vies Antérieures et Questions Illimitées",
    subtitle:
      "Dès que le paiement via Mercado Pago est validé, votre lecture demandée se débloque et démarre automatiquement.",
    queuedPastLife: "Votre lecture de vie antérieure est prête et démarrera automatiquement après paiement via Mercado Pago.",
    queuedQuestion: "Votre question Ouija est prête et recevra sa réponse automatiquement après paiement via Mercado Pago.",
    includes1: "Lectures complètes de vies antérieures avec voix et parchemin.",
    includes2: "Questions illimitées sur la planche Ouija interactive.",
    includes3: "Déblocage automatique immédiat après paiement sur Mercado Pago.",
    payStepTitle: "Réglez avec Mercado Pago pour débloquer",
    payMp: "Débloquer avec Mercado Pago",
    waitingAutoTitle: "En attente de confirmation Mercado Pago...",
    waitingAutoDesc: "Gardez cette fenêtre ouverte : votre lecture démarrera automatiquement dès validation sur Mercado Pago.",
    checkNowBtn: "Vérifier maintenant",
    checkingBtn: "Vérification...",
    notYetApproved: "Confirmation Mercado Pago non reçue pour l'instant. Finalisez le paiement dans l'onglet ouvert.",
    successMsg: "Paiement Mercado Pago confirmé ! Déblocage et lancement de votre lecture...",
    close: "Retour",
  },
  it: {
    badge: "Pass Consulti Akashici • Mercado Pago",
    titleLimitReached: "Hai esaurito i consulti gratuiti",
    titleUpgrade: "Sblocca Vite Passate e Domande Illimitate",
    subtitle:
      "Al completamento del pagamento con Mercado Pago, la lettura richiesta si sbloccherà e partirà automaticamente.",
    queuedPastLife: "La tua lettura delle vite passate è pronta e inizierà automaticamente dopo il pagamento su Mercado Pago.",
    queuedQuestion: "La tua domanda Ouija è pronta e riceverà risposta automaticamente dopo il pagamento su Mercado Pago.",
    includes1: "Letture complete delle vite passate con voce e pergamena.",
    includes2: "Domande illimitate sulla Tavola Ouija interattiva.",
    includes3: "Sblocco automatico immediato dopo il pagamento su Mercado Pago.",
    payStepTitle: "Paga con Mercado Pago per sbloccare",
    payMp: "Sblocca con Mercado Pago",
    waitingAutoTitle: "In attesa di conferma da Mercado Pago...",
    waitingAutoDesc: "Tieni aperta questa finestra: la lettura inizierà automaticamente appena confermato da Mercado Pago.",
    checkNowBtn: "Verifica ora",
    checkingBtn: "Verifica...",
    notYetApproved: "Conferma da Mercado Pago non ancora ricevuta. Completa il pagamento nella scheda aperta.",
    successMsg: "Pagamento Mercado Pago confermato! Sblocco e avvio della tua lettura...",
    close: "Indietro",
  },
  de: {
    badge: "Akasha-Beratungspass • Mercado Pago",
    titleLimitReached: "Deine kostenlosen Abfragen sind aufgebraucht",
    titleUpgrade: "Unbegrenzte Frühere-Leben-Lesungen & Fragen freischalten",
    subtitle:
      "Sobald die Zahlung per Mercado Pago abgeschlossen ist, wird deine angeforderte Lesung automatisch freigeschaltet.",
    queuedPastLife: "Deine Lesung über ein früheres Leben steht bereit und startet nach Zahlung per Mercado Pago automatisch.",
    queuedQuestion: "Deine Ouija-Frage steht bereit und wird nach Zahlung per Mercado Pago automatisch beantwortet.",
    includes1: "Vollständige Lesungen früherer Leben mit Stimme und Pergament.",
    includes2: "Unbegrenzte Rückfragen auf dem interaktiven Ouija-Brett.",
    includes3: "Sofortige automatische Freischaltung nach Zahlung über Mercado Pago.",
    payStepTitle: "Mit Mercado Pago freischalten",
    payMp: "Mit Mercado Pago freischalten",
    waitingAutoTitle: "Warte auf Bestätigung von Mercado Pago...",
    waitingAutoDesc: "Lass dieses Fenster offen: Deine Lesung startet sofort automatisch nach Zahlung per Mercado Pago.",
    checkNowBtn: "Jetzt prüfen",
    checkingBtn: "Wird geprüft...",
    notYetApproved: "Noch keine Bestätigung von Mercado Pago erhalten. Bitte schließe die Zahlung im offenen Tab ab.",
    successMsg: "Mercado Pago Zahlung bestätigt! Deine Lesung wird jetzt gestartet...",
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

        {/* Benefits */}
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
            {/* Direct Mercado Pago Celeste Unlock Button */}
            <div className="pt-1">
              <a
                href={mpUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handlePaymentClick}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 rounded-xl bg-[#009EE3] hover:bg-[#008AD0] text-white font-cinzel font-bold text-xs sm:text-sm shadow-[0_0_24px_rgba(0,158,227,0.45)] border border-sky-300/40 transition cursor-pointer"
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
            </div>

            {/* Automatic live detection indicator */}
            {awaitingPayment && (
              <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-400/40 space-y-2">
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
