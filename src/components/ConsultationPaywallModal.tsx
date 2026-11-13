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
  ChevronDown,
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useLanguage } from "../context/LanguageContext";
import { SupportedLanguage } from "../types";
import {
  useMonetizationConfig,
  getEffectiveMpUrl,
  getEffectiveKofiUrl,
  verifyAndUnlockPass,
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
  payKofi: string;
  kofiRefHint: string;
  waitingAutoTitle: string;
  waitingAutoDesc: string;
  checkNowBtn: string;
  checkingBtn: string;
  notYetApproved: string;
  fallbackSummary: string;
  fallbackPlaceholder: string;
  fallbackBtn: string;
  invalidRecovery: string;
  successMsg: string;
  close: string;
}

const COPY: Record<SupportedLanguage, PaywallCopy> = {
  es: {
    badge: "Pase de Consultas Akáshicas",
    titleLimitReached: "Has completado tus consultas gratuitas",
    titleUpgrade: "Desbloquea Lecturas de Vidas Pasadas y Preguntas Ilimitadas",
    subtitle:
      "Al abonar, esta pantalla detectará tu pago y desbloqueará automáticamente la consulta solicitada.",
    queuedPastLife: "Tu lectura de vida pasada está lista y comenzará automáticamente al confirmarse el pago.",
    queuedQuestion: "Tu pregunta a la Tabla Ouija está lista y se responderá automáticamente al confirmarse el pago.",
    includes1: "Lecturas completas de vidas pasadas con narración de voz y pergamino.",
    includes2: "Preguntas ilimitadas en la Tabla Ouija sobre tu historia y respuestas.",
    includes3: "Desbloqueo 100% automático e inmediato al completar el pago.",
    payStepTitle: "Abona para desbloquear automáticamente",
    payMp: "Abonar con Mercado Pago",
    payKofi: "Abonar con Ko-fi (Internacional)",
    kofiRefHint: "Si pagas por Ko-fi sin redirección, incluye esta referencia en tu mensaje:",
    waitingAutoTitle: "Esperando confirmación automática del pago...",
    waitingAutoDesc: "No cierres esta ventana: apenas finalices el pago se desbloqueará y ejecutará tu lectura.",
    checkNowBtn: "Comprobar ahora",
    checkingBtn: "Verificando...",
    notYetApproved: "Aún no recibimos la confirmación del pago. Completa el pago en la ventana abierta o espera unos segundos.",
    fallbackSummary: "¿Ya abonaste y no se desbloqueó automáticamente?",
    fallbackPlaceholder: "Código de desbloqueo...",
    fallbackBtn: "Desbloquear",
    invalidRecovery: "Código no válido. Verifica tu enlace de retorno o el código recibido.",
    successMsg: "¡Pago confirmado! Desbloqueando y revelando tu lectura ahora...",
    close: "Volver",
  },
  en: {
    badge: "Akashic Consultation Pass",
    titleLimitReached: "You have used your free consultations",
    titleUpgrade: "Unlock Unlimited Past-Life Readings & Questions",
    subtitle:
      "Once you complete your payment, your requested reading will unlock and start automatically.",
    queuedPastLife: "Your past-life reading is queued and will start automatically as soon as payment is confirmed.",
    queuedQuestion: "Your Ouija question is queued and will be answered automatically once payment is confirmed.",
    includes1: "Full past-life readings with voice narration and parchment export.",
    includes2: "Unlimited follow-up questions on the Interactive Ouija Board.",
    includes3: "Instant automatic unlock right after payment completes.",
    payStepTitle: "Pay to unlock automatically",
    payMp: "Pay with Mercado Pago (LATAM)",
    payKofi: "Pay with Ko-fi (Worldwide)",
    kofiRefHint: "If paying via Ko-fi, you can include this reference in your note:",
    waitingAutoTitle: "Waiting for automatic payment confirmation...",
    waitingAutoDesc: "Keep this window open: your reading will unlock and begin automatically once paid.",
    checkNowBtn: "Check status now",
    checkingBtn: "Checking...",
    notYetApproved: "Payment confirmation has not arrived yet. Please finish checkout in the opened tab.",
    fallbackSummary: "Already paid and didn't redirect automatically?",
    fallbackPlaceholder: "Unlock code...",
    fallbackBtn: "Unlock",
    invalidRecovery: "Invalid code. Please check your confirmation message or return link.",
    successMsg: "Payment confirmed! Unlocking and starting your reading now...",
    close: "Back",
  },
  pt: {
    badge: "Passe de Consultas Akáshicas",
    titleLimitReached: "Você usou suas consultas gratuitas",
    titleUpgrade: "Desbloqueie Leituras de Vidas Passadas e Perguntas Ilimitadas",
    subtitle:
      "Ao concluir o pagamento, sua leitura solicitada será desbloqueada e iniciada automaticamente.",
    queuedPastLife: "Sua leitura de vida passada está pronta e começará automaticamente após o pagamento.",
    queuedQuestion: "Sua pergunta na Tábua Ouija está pronta e será respondida automaticamente após o pagamento.",
    includes1: "Leituras completas de vidas pasadas com narração e pergaminho.",
    includes2: "Perguntas ilimitadas na Tábua Ouija sobre suas revelações.",
    includes3: "Desbloqueio automático imediato ao finalizar o pagamento.",
    payStepTitle: "Pague para desbloquear automaticamente",
    payMp: "Pagar com Mercado Pago",
    payKofi: "Pagar com Ko-fi (Internacional)",
    kofiRefHint: "Se pagar pelo Ko-fi, inclua esta referência na sua mensagem:",
    waitingAutoTitle: "Aguardando confirmação automática do pagamento...",
    waitingAutoDesc: "Mantenha esta janela aberta: sua leitura começará automaticamente após o pagamento.",
    checkNowBtn: "Verificar agora",
    checkingBtn: "Verificando...",
    notYetApproved: "Ainda não recebemos a confirmação do pagamento. Conclua o pagamento na aba aberta.",
    fallbackSummary: "Já pagou e não desbloqueou automaticamente?",
    fallbackPlaceholder: "Código de desbloqueio...",
    fallbackBtn: "Desbloquear",
    invalidRecovery: "Código inválido. Verifique sua confirmação de pagamento.",
    successMsg: "Pagamento confirmado! Desbloqueando e iniciando sua leitura agora...",
    close: "Voltar",
  },
  fr: {
    badge: "Pass Consultations Akashiques",
    titleLimitReached: "Vous avez utilisé vos consultations gratuites",
    titleUpgrade: "Débloquez les Vies Antérieures et Questions Illimitées",
    subtitle:
      "Dès que le paiement est validé, votre lecture demandée se débloque et démarre automatiquement.",
    queuedPastLife: "Votre lecture de vie antérieure est prête et démarrera automatiquement après le paiement.",
    queuedQuestion: "Votre question Ouija est prête et recevra sa réponse automatiquement après le paiement.",
    includes1: "Lectures complètes de vies antérieures avec voix et parchemin.",
    includes2: "Questions illimitées sur la planche Ouija interactive.",
    includes3: "Déblocage automatique immédiat après paiement.",
    payStepTitle: "Réglez pour débloquer automatiquement",
    payMp: "Payer avec Mercado Pago (LATAM)",
    payKofi: "Payer avec Ko-fi (International)",
    kofiRefHint: "Si vous payez via Ko-fi, indiquez cette référence dans votre message :",
    waitingAutoTitle: "En attente de confirmation automatique du paiement...",
    waitingAutoDesc: "Gardez cette fenêtre ouverte : votre lecture démarrera automatiquement dès validation.",
    checkNowBtn: "Vérifier maintenant",
    checkingBtn: "Vérification...",
    notYetApproved: "Confirmation de paiement non reçue pour l'instant. Finalisez le paiement dans l'onglet ouvert.",
    fallbackSummary: "Déjà payé sans redirection automatique ?",
    fallbackPlaceholder: "Code de déblocage...",
    fallbackBtn: "Débloquer",
    invalidRecovery: "Code invalide. Vérifiez votre message de confirmation.",
    successMsg: "Paiement confirmé ! Déblocage et lancement de votre lecture...",
    close: "Retour",
  },
  it: {
    badge: "Pass Consulti Akashici",
    titleLimitReached: "Hai esaurito i consulti gratuiti",
    titleUpgrade: "Sblocca Vite Passate e Domande Illimitate",
    subtitle:
      "Al completamento del pagamento, la lettura richiesta si sbloccherà e partirà automaticamente.",
    queuedPastLife: "La tua lettura delle vite passate è pronta e inizierà automaticamente dopo il pagamento.",
    queuedQuestion: "La tua domanda Ouija è pronta e riceverà risposta automaticamente dopo il pagamento.",
    includes1: "Letture complete delle vite passate con voce e pergamena.",
    includes2: "Domande illimitate sulla Tavola Ouija interattiva.",
    includes3: "Sblocco automatico immediato a pagamento avvenuto.",
    payStepTitle: "Paga per sbloccare automaticamente",
    payMp: "Paga con Mercado Pago (LATAM)",
    payKofi: "Paga con Ko-fi (Internazionale)",
    kofiRefHint: "Se paghi con Ko-fi, inserisci questo riferimento nel messaggio:",
    waitingAutoTitle: "In attesa di conferma automatica del pagamento...",
    waitingAutoDesc: "Tieni aperta questa finestra: la lettura inizierà automaticamente appena confermato.",
    checkNowBtn: "Verifica ora",
    checkingBtn: "Verifica...",
    notYetApproved: "Conferma non ancora ricevuta. Completa il pagamento nella scheda aperta.",
    fallbackSummary: "Hai già pagato ma non si è sbloccato automaticamente?",
    fallbackPlaceholder: "Codice di sblocco...",
    fallbackBtn: "Sblocca",
    invalidRecovery: "Codice non valido. Controlla il messaggio di conferma.",
    successMsg: "Pagamento confermato! Sblocco e avvio della tua lettura...",
    close: "Indietro",
  },
  de: {
    badge: "Akasha-Beratungspass",
    titleLimitReached: "Deine kostenlosen Abfragen sind aufgebraucht",
    titleUpgrade: "Unbegrenzte Frühere-Leben-Lesungen & Fragen freischalten",
    subtitle:
      "Sobald die Zahlung abgeschlossen ist, wird deine angeforderte Lesung automatisch freigeschaltet und gestartet.",
    queuedPastLife: "Deine Lesung über ein früheres Leben steht bereit und startet nach Zahlung automatisch.",
    queuedQuestion: "Deine Ouija-Frage steht bereit und wird nach Zahlung automatisch beantwortet.",
    includes1: "Vollständige Lesungen früherer Leben mit Stimme und Pergament.",
    includes2: "Unbegrenzte Rückfragen auf dem interaktiven Ouija-Brett.",
    includes3: "Sofortige automatische Freischaltung nach der Zahlung.",
    payStepTitle: "Zahlen für automatische Freischaltung",
    payMp: "Mit Mercado Pago zahlen (LATAM)",
    payKofi: "Mit Ko-fi zahlen (Weltweit)",
    kofiRefHint: "Falls du mit Ko-fi zahlst, gib bitte diese Referenz in deiner Nachricht an:",
    waitingAutoTitle: "Warte auf automatische Zahlungsbestätigung...",
    waitingAutoDesc: "Lass dieses Fenster offen: Deine Lesung startet sofort automatisch nach Zahlung.",
    checkNowBtn: "Jetzt prüfen",
    checkingBtn: "Wird geprüft...",
    notYetApproved: "Noch keine Zahlungsbestätigung erhalten. Bitte schließe die Zahlung im offenen Tab ab.",
    fallbackSummary: "Bereits bezahlt, aber nicht automatisch freigeschaltet?",
    fallbackPlaceholder: "Freischaltcode...",
    fallbackBtn: "Freischalten",
    invalidRecovery: "Ungültiger Code. Bitte prüfe deine Zahlungsbestätigung.",
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
  const [refCode, setRefCode] = useState<string>("");
  const [dynamicMpUrl, setDynamicMpUrl] = useState<string>("");
  const [capabilities, setCapabilities] = useState<{
    mpCheckoutProReady: boolean;
    kofiWebhookReady: boolean;
  }>({ mpCheckoutProReady: false, kofiWebhookReady: false });
  const [awaitingPayment, setAwaitingPayment] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [unlockedDone, setUnlockedDone] = useState<boolean>(false);

  const [manualInput, setManualInput] = useState<string>("");
  const [manualError, setManualError] = useState<string>("");

  const unlockedOnceRef = useRef<boolean>(false);

  const triggerUnlockSuccess = useCallback(
    (proof: string, approvedSessionId?: string) => {
      if (unlockedOnceRef.current) return;
      unlockedOnceRef.current = true;
      setUnlockedDone(true);
      setStatusMessage("");
      setManualError("");
      markConsultationPassUnlocked(proof, approvedSessionId || sessionId);
      setTimeout(() => {
        onUnlocked?.();
        onClose();
      }, 900);
    },
    [onClose, onUnlocked, sessionId]
  );

  // Reset state whenever modal opens
  useEffect(() => {
    if (!isOpen) {
      clearPaywallModalHeartbeat();
      return;
    }
    unlockedOnceRef.current = false;
    setUnlockedDone(false);
    setStatusMessage("");
    setManualError("");
    setAwaitingPayment(false);

    setPaywallModalHeartbeat();
    const hbInterval = setInterval(() => {
      setPaywallModalHeartbeat();
    }, 1500);

    let cancelled = false;
    const initSession = async () => {
      try {
        fetch("/api/payments/capabilities")
          .then((r) => (r.ok ? r.json() : null))
          .then((c) => {
            if (!cancelled && c) {
              setCapabilities({
                mpCheckoutProReady: Boolean(c.mpCheckoutProReady),
                kofiWebhookReady: Boolean(c.kofiWebhookReady),
              });
            }
          })
          .catch(() => {});

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
        if (data?.refCode) setRefCode(data.refCode);
        if (data?.mpUrl) setDynamicMpUrl(data.mpUrl);
      } catch {
        // Fallback to static link
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

  // Real-time listeners: SSE + Firestore onSnapshot + BroadcastChannel + focus check + polling
  useEffect(() => {
    if (!isOpen) return;

    const unsubBroadcast = subscribePaymentBroadcast(({ proof, sessionId: sid }) => {
      if (proof) {
        triggerUnlockSuccess(proof, sid);
      }
    });

    let eventSource: EventSource | null = null;
    let unsubFirestore: (() => void) | null = null;

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

      try {
        unsubFirestore = onSnapshot(
          doc(db, "payment_sessions", sessionId),
          (snap) => {
            if (snap.exists()) {
              const d = snap.data();
              if (d?.status === "approved" && typeof d?.approvalProof === "string" && d.approvalProof.length === 64) {
                checkSessionStatusNow(true);
              }
            }
          },
          () => {
            // Ignore transient listener warnings while pending
          }
        );
      } catch {
        // ignore
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
      unsubFirestore?.();
      window.removeEventListener("focus", onFocus);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [isOpen, sessionId, awaitingPayment, checkSessionStatusNow, triggerUnlockSuccess]);

  if (!isOpen) return null;

  const copy = COPY[language] || COPY.es;
  const mpUrl = dynamicMpUrl || getEffectiveMpUrl(cfg, "pass");
  const kofiUrl = getEffectiveKofiUrl(cfg);
  const isSpanish = language === "es";
  const used = getFreeConsultationsUsed();
  const limitReached = used >= cfg.freeConsultationsLimit;

  const handlePaymentClick = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    setAwaitingPayment(true);
    setStatusMessage("");
  };

  const handleManualRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(HAPTIC_PATTERNS.click);
    setManualError("");
    const raw = manualInput.trim();
    if (!raw) return;

    setIsChecking(true);
    try {
      // 1. If numeric (looks like a Mercado Pago operation ID), verify with Mercado Pago API
      if (/^\d{6,20}$/.test(raw)) {
        const mpRes = await fetch("/api/payments/mercadopago/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: raw, sessionId }),
        });
        if (mpRes.ok) {
          const mpJson = await mpRes.json();
          if (mpJson?.approved && mpJson?.approvalProof) {
            triggerUnlockSuccess(mpJson.approvalProof, mpJson.sessionId);
            return;
          }
        }
      }

      // 2. Otherwise verify as return token or backup code
      const ok = await verifyAndUnlockPass(raw, cfg);
      if (ok) {
        triggerUnlockSuccess(`verified_${Date.now()}`, sessionId);
        return;
      }

      setManualError(copy.invalidRecovery);
    } finally {
      setIsChecking(false);
    }
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
            {/* Payment buttons (Mercado Pago + Ko-fi ONLY) */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider">
                  {copy.payStepTitle}
                </span>
                <div className="flex items-center space-x-2 text-[11px] font-mono text-amber-200/90 shrink-0">
                  {cfg.passPriceArs && <span>{cfg.passPriceArs}</span>}
                  {cfg.passPriceArs && cfg.passPriceUsd && <span>•</span>}
                  {cfg.passPriceUsd && <span>{cfg.passPriceUsd}</span>}
                </div>
              </div>

              <div className={`grid grid-cols-1 ${kofiUrl ? "sm:grid-cols-2" : ""} gap-2.5`}>
                {!isSpanish && kofiUrl && (
                  <a
                    href={kofiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handlePaymentClick}
                    className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#ff5e5b] to-[#d9383a] hover:from-[#ff7370] hover:to-[#e64648] text-white font-cinzel font-bold text-xs shadow-lg transition cursor-pointer"
                  >
                    <span>☕</span>
                    <span>{copy.payKofi}</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                )}

                <a
                  href={mpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handlePaymentClick}
                  className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-cinzel font-bold text-xs shadow-lg transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{copy.payMp}</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>

                {isSpanish && kofiUrl && (
                  <a
                    href={kofiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handlePaymentClick}
                    className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#ff5e5b] to-[#d9383a] hover:from-[#ff7370] hover:to-[#e64648] text-white font-cinzel font-bold text-xs shadow-lg transition cursor-pointer"
                  >
                    <span>☕</span>
                    <span>{copy.payKofi}</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                )}
              </div>

              {kofiUrl && refCode && capabilities.kofiWebhookReady && (
                <p className="text-[11px] font-gothic text-purple-300/75 text-center">
                  {copy.kofiRefHint}{" "}
                  <strong className="text-amber-300 font-mono select-all">{refCode}</strong>
                </p>
              )}
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

            {/* Discreet expandable fallback ONLY if backup code or MP API is configured */}
            {(Boolean(cfg.unlockCodeHash) || capabilities.mpCheckoutProReady) && (
              <details className="pt-1 border-t border-purple-900/50 text-xs">
                <summary className="cursor-pointer text-[11px] font-gothic text-purple-300/70 hover:text-purple-200 flex items-center space-x-1 select-none py-1">
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>{copy.fallbackSummary}</span>
                </summary>
                <form onSubmit={handleManualRecoverySubmit} className="space-y-2 pt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder={copy.fallbackPlaceholder}
                      className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-purple-700/60 text-xs text-purple-100 placeholder-purple-400/40 focus:outline-none focus:border-amber-400 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isChecking || !manualInput.trim()}
                      className="px-3.5 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-white font-cinzel font-bold text-xs transition cursor-pointer disabled:opacity-60 whitespace-nowrap"
                    >
                      {copy.fallbackBtn}
                    </button>
                  </div>
                  {manualError && (
                    <p className="text-[11px] font-gothic text-red-300">{manualError}</p>
                  )}
                </form>
              </details>
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
