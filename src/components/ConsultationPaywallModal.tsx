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
  Globe,
  Fingerprint,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { SupportedLanguage } from "../types";
import {
  useMonetizationConfig,
  getEffectiveMpUrl,
  DEFAULT_PAYPAL_USD_LINK,
  DEFAULT_PAYPAL_EUR_LINK,
  DEFAULT_PAYPAL_GBP_LINK,
  normalizePayPalUrl,
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
import {
  signInOwnerWithGoogle,
  getAdminAuthCapabilities,
  setupInitialAdminPin,
  loginAdminWithPin,
  loginAdminWithBiometric,
  isBiometricSupported,
  AdminAuthCapabilities,
} from "../lib/adminTracking";

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
  includes4: string;
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
    badge: "Panel de Desbloqueo",
    titleLimitReached: (n) =>
      n === 1 ? "Has utilizado tu consulta gratuita" : `Has completado tus ${n} consultas gratuitas`,
    titleUpgrade: "Panel de Desbloqueo · Pase Ilimitado",
    subtitle: (n) =>
      n === 1
        ? "Tu primera consulta (Carta Natal, Ouija o Vida Pasada) es 100% gratis. Desbloquea lecturas ilimitadas e instalación de App con Mercado Pago o PayPal."
        : `Disfruta de tus primeras ${n} consultas 100% gratis. Desbloquea lecturas ilimitadas e instalación de App con Mercado Pago o PayPal.`,
    queuedPastLife: "Tu lectura de vida pasada está lista y comenzará automáticamente al desbloquear.",
    queuedQuestion: "Tu pregunta a la Tabla Ouija está lista y se responderá automáticamente al desbloquear.",
    queuedNatalChart: "Tu Carta Natal completa (voz, rueda y PDF) está lista y se revelará automáticamente al desbloquear.",
    includes1: (n) =>
      n === 1
        ? "Primera consulta 100% gratuita en carta natal, vidas pasadas o tabla ouija."
        : `Primeras ${n} consultas 100% gratuitas en vidas pasadas, tabla ouija y carta natal.`,
    includes2: "Lecturas ilimitadas de vidas pasadas, preguntas akáshicas y cartas natales con PDF.",
    includes3: "Instalación directa como App en tu celular (Android / iPhone) o computadora.",
    includes4: "Elige Mercado Pago (Argentina) o PayPal Internacional (USD / EUR / GBP + código).",
    payMp: "Pagar con Mercado Pago",
    waitingAutoTitle: "Esperando confirmación automática...",
    waitingAutoDesc: "No cierres esta ventana: apenas finalices el pago se desbloqueará y ejecutará tu lectura.",
    checkNowBtn: "Comprobar ahora",
    checkingBtn: "Verificando...",
    notYetApproved: "Aún no recibimos la confirmación. Completa el pago o ingresa tu comprobante o código PayPal.",
    successMsg: "¡Desbloqueo confirmado! Iniciando tu acceso completo ahora...",
    close: "Volver",
  },
  en: {
    badge: "Unlock Panel",
    titleLimitReached: (n) =>
      n === 1 ? "You have used your free consultation" : `You have used your ${n} free consultations`,
    titleUpgrade: "Unlock Panel · Unlimited Pass",
    subtitle: (n) =>
      n === 1
        ? "Your first consultation (Natal Chart, Ouija, or Past Life) is 100% free. Unlock unlimited readings and App installation via Mercado Pago or PayPal."
        : `Enjoy your first ${n} consultations 100% free. Unlock unlimited readings and App installation via Mercado Pago or PayPal.`,
    queuedPastLife: "Your past-life reading is queued and will start automatically once unlocked.",
    queuedQuestion: "Your Ouija question is queued and will be answered automatically once unlocked.",
    queuedNatalChart: "Your complete Natal Chart (voice, wheel & PDF) is ready and will unlock automatically.",
    includes1: (n) =>
      n === 1
        ? "First consultation 100% free for natal charts, past lives, or Ouija."
        : `First ${n} consultations 100% free for past lives, Ouija, and natal charts.`,
    includes2: "Unlimited past-life readings, Akashic questions, and natal charts with PDF export.",
    includes3: "Installable as a standalone App on Android, iPhone, or desktop.",
    includes4: "Choose Mercado Pago (Argentina) or International PayPal (USD / EUR / GBP + unlock code).",
    payMp: "Pay with Mercado Pago",
    waitingAutoTitle: "Waiting for automatic confirmation...",
    waitingAutoDesc: "Keep this window open: your reading will unlock automatically once paid.",
    checkNowBtn: "Check status now",
    checkingBtn: "Checking...",
    notYetApproved: "Confirmation not received yet. Please finish checkout or enter your operation number / PayPal unlock code.",
    successMsg: "Unlock confirmed! Starting your full access now...",
    close: "Back",
  },
  pt: {
    badge: "Painel de Desbloqueio",
    titleLimitReached: (n) =>
      n === 1 ? "Você usou sua consulta gratuita" : `Você usou suas ${n} consultas gratuitas`,
    titleUpgrade: "Painel de Desbloqueio · Passe Ilimitado",
    subtitle: (n) =>
      n === 1
        ? "Sua primeira consulta é 100% gratuita. Desbloqueie leituras ilimitadas e instalação como App via Mercado Pago ou PayPal."
        : `Aproveite suas primeiras ${n} consultas 100% gratuitas. Desbloqueie leituras ilimitadas via Mercado Pago ou PayPal.`,
    queuedPastLife: "Sua leitura de vida passada está pronta e começará automaticamente após o desbloqueio.",
    queuedQuestion: "Sua pergunta na Tábua Ouija está pronta e será respondida automaticamente após o desbloqueio.",
    queuedNatalChart: "Seu Mapa Astral completo (voz, roda e PDF) está pronto e será revelado após o desbloqueio.",
    includes1: (n) =>
      n === 1
        ? "Primeira consulta 100% gratuita em mapa astral, vidas passadas ou Ouija."
        : `Primeiras ${n} consultas 100% gratuitas em vidas passadas, Ouija e mapa astral.`,
    includes2: "Leituras ilimitadas de vidas passadas, perguntas akáshicas e mapas astrais com PDF.",
    includes3: "Instalação como App no celular (Android / iPhone) ou computador.",
    includes4: "Escolha Mercado Pago (Argentina) ou PayPal Internacional (USD / EUR / GBP + código).",
    payMp: "Pagar com Mercado Pago",
    waitingAutoTitle: "Aguardando confirmação automática...",
    waitingAutoDesc: "Mantenha esta janela aberta: sua leitura começará automaticamente após o pagamento.",
    checkNowBtn: "Verificar agora",
    checkingBtn: "Verificando...",
    notYetApproved: "Confirmação ainda não recebida. Conclua o pagamento ou informe o número de operação ou código PayPal.",
    successMsg: "Desbloqueio confirmado! Iniciando seu acesso completo agora...",
    close: "Voltar",
  },
  fr: {
    badge: "Panneau de Déblocage",
    titleLimitReached: (n) =>
      n === 1 ? "Vous avez utilisé votre consultation gratuite" : `Vous avez utilisé vos ${n} consultations gratuites`,
    titleUpgrade: "Panneau de Déblocage · Pass Illimité",
    subtitle: (n) =>
      n === 1
        ? "Votre première consultation est 100% gratuite. Débloquez les lectures illimitées via Mercado Pago ou PayPal."
        : `Profitez de vos ${n} premières consultations 100% gratuites. Débloquez l'accès illimité via Mercado Pago ou PayPal.`,
    queuedPastLife: "Votre lecture de vie antérieure est prête et démarrera automatiquement.",
    queuedQuestion: "Votre question Ouija est prête et recevra sa réponse automatiquement.",
    queuedNatalChart: "Votre Thème Natal complet (voix, roue et PDF) est prêt et s'ouvrira dès confirmation.",
    includes1: (n) =>
      n === 1
        ? "1ère consultation 100% gratuite pour thème natal, vies antérieures ou Ouija."
        : `${n} premières consultations 100% gratuites pour vies antérieures, Ouija et thème natal.`,
    includes2: "Lectures illimitées de vies antérieures, questions akashiques et thèmes natals en PDF.",
    includes3: "Installation directe en tant qu'application sur mobile ou ordinateur.",
    includes4: "Choisissez Mercado Pago ou PayPal International (USD / EUR / GBP + code).",
    payMp: "Payer avec Mercado Pago",
    waitingAutoTitle: "En attente de confirmation...",
    waitingAutoDesc: "Gardez cette fenêtre ouverte : votre lecture démarrera automatiquement dès validation.",
    checkNowBtn: "Vérifier maintenant",
    checkingBtn: "Vérification...",
    notYetApproved: "Confirmation non reçue. Finalisez le paiement ou entrez votre numéro d'opération / code PayPal.",
    successMsg: "Déblocage confirmé ! Lancement de votre accès complet...",
    close: "Retour",
  },
  it: {
    badge: "Pannello di Sblocco",
    titleLimitReached: (n) =>
      n === 1 ? "Hai esaurito il tuo consulto gratuito" : `Hai esaurito i ${n} consulti gratuiti`,
    titleUpgrade: "Pannello di Sblocco · Pass Illimitato",
    subtitle: (n) =>
      n === 1
        ? "Il tuo primo consulto è 100% gratuito. Sblocca letture illimitate e l'app tramite Mercado Pago o PayPal."
        : `Goditi i primi ${n} consulti 100% gratuiti. Sblocca l'accesso illimitato tramite Mercado Pago o PayPal.`,
    queuedPastLife: "La tua lettura delle vite passate è pronta e inizierà automaticamente.",
    queuedQuestion: "La tua domanda Ouija è pronta e riceverà risposta automaticamente.",
    queuedNatalChart: "Il tuo Tema Natale completo (voce, ruota e PDF) è pronto e si sbloccherà dopo il pagamento.",
    includes1: (n) =>
      n === 1
        ? "Primo consulto 100% gratuito per tema natale, vite passate o Ouija."
        : `Primi ${n} consulti 100% gratuiti per vite passate, Ouija e tema natale.`,
    includes2: "Letture illimitate delle vite passate, domande akashiche e temi natali in PDF.",
    includes3: "Installabile come App dedicata su cellulare (Android / iPhone) o PC.",
    includes4: "Scegli Mercado Pago o PayPal Internazionale (USD / EUR / GBP + codice).",
    payMp: "Paga con Mercado Pago",
    waitingAutoTitle: "In attesa di conferma...",
    waitingAutoDesc: "Tieni aperta questa finestra: la lettura inizierà automaticamente dopo il pagamento.",
    checkNowBtn: "Verifica ora",
    checkingBtn: "Verifica...",
    notYetApproved: "Conferma non ancora ricevuta. Completa il pagamento o inserisci il numero di operazione o codice PayPal.",
    successMsg: "Sblocco confermato! Avvio dell'accesso completo...",
    close: "Indietro",
  },
  de: {
    badge: "Freischalt-Panel",
    titleLimitReached: (n) =>
      n === 1 ? "Du hast deine kostenlose Abfrage aufgebraucht" : `Du hast deine ${n} kostenlosen Abfragen aufgebraucht`,
    titleUpgrade: "Freischalt-Panel · Unbegrenzter Pass",
    subtitle: (n) =>
      n === 1
        ? "Deine erste Abfrage ist 100% kostenlos. Schalte unbegrenzte Lesungen und die App-Installation per Mercado Pago oder PayPal frei."
        : `Genieße deine ersten ${n} Abfragen 100% kostenlos. Unbegrenzter Zugang per Mercado Pago oder PayPal.`,
    queuedPastLife: "Deine Lesung über ein früheres Leben steht bereit und startet automatisch.",
    queuedQuestion: "Deine Ouija-Frage steht bereit und wird automatisch beantwortet.",
    queuedNatalChart: "Dein vollständiges Geburtshoroskop (Stimme, Rad & PDF) wird nach Zahlung sofort freigeschaltet.",
    includes1: (n) =>
      n === 1
        ? "Erste Abfrage 100% kostenlos für Geburtshoroskop, frühere Leben oder Ouija."
        : `Erste ${n} Abfragen 100% kostenlos für frühere Leben, Ouija und Geburtshoroskop.`,
    includes2: "Unbegrenzte Lesungen früherer Leben, Akasha-Fragen und Geburtshoroskope als PDF.",
    includes3: "Direkt als App auf Smartphone (Android / iPhone) oder Desktop installierbar.",
    includes4: "Wähle Mercado Pago oder International PayPal (USD / EUR / GBP + Code).",
    payMp: "Mit Mercado Pago zahlen",
    waitingAutoTitle: "Warte auf Bestätigung...",
    waitingAutoDesc: "Lass dieses Fenster offen: Deine Lesung startet sofort automatisch nach Zahlung.",
    checkNowBtn: "Jetzt prüfen",
    checkingBtn: "Wird geprüft...",
    notYetApproved: "Noch keine Bestätigung erhalten. Bitte schließe die Zahlung ab oder gib deine Vorgangsnummer bzw. den PayPal-Code ein.",
    successMsg: "Freischaltung bestätigt! Vollzugriff wird gestartet...",
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

  // Manual operation number state (Mercado Pago)
  const [operationNumber, setOperationNumber] = useState<string>("");
  const [isValidatingOp, setIsValidatingOp] = useState<boolean>(false);
  const [opFeedback, setOpFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // PayPal currency & unlock code state
  const [paypalCurrency, setPaypalCurrency] = useState<"USD" | "EUR" | "GBP">(() =>
    language === "fr" || language === "it" || language === "de" ? "EUR" : "USD"
  );
  const [paypalCode, setPaypalCode] = useState<string>("");
  const [isValidatingPaypalCode, setIsValidatingPaypalCode] = useState<boolean>(false);
  const [paypalFeedback, setPaypalFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // Creator PIN / Biometric / Google unlock state
  const [showCreatorLogin, setShowCreatorLogin] = useState<boolean>(false);
  const [isCreatorSigningIn, setIsCreatorSigningIn] = useState<boolean>(false);
  const [creatorLoginError, setCreatorLoginError] = useState<string>("");
  const [creatorPinInput, setCreatorPinInput] = useState<string>("");
  const [creatorAuthCaps, setCreatorAuthCaps] = useState<AdminAuthCapabilities | null>(null);

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
    setPaypalCode("");
    setPaypalFeedback(null);
    setShowCreatorLogin(false);
    setIsCreatorSigningIn(false);
    setCreatorLoginError("");
    setCreatorPinInput("");
    getAdminAuthCapabilities().then(setCreatorAuthCaps);

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

  // PayPal Unlock Code verification handler (server-verified)
  const handleValidatePaypalCode = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(HAPTIC_PATTERNS.click);
    const cleanCode = paypalCode.trim();
    if (!cleanCode || cleanCode.length < 2) {
      setPaypalFeedback({
        type: "err",
        msg:
          language === "en"
            ? "Please enter the unlock code received after your PayPal payment."
            : "Por favor ingresa el código de desbloqueo recibido tras confirmar tu pago en PayPal.",
      });
      return;
    }

    setIsValidatingPaypalCode(true);
    setPaypalFeedback(null);
    try {
      const visitorId = getOrCreateVisitorId();
      const res = await fetch("/api/payments/verify-unlock-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          sessionId,
          visitorId,
        }),
      });
      const data = await res.json();
      if (res.ok && data?.approved && data?.approvalProof) {
        setPaypalFeedback({
          type: "ok",
          msg:
            language === "en"
              ? "Code verified! Unlocking unlimited readings & app install..."
              : "¡Código verificado! Desbloqueando lecturas ilimitadas e instalación...",
        });
        setTimeout(() => {
          triggerUnlockSuccess(data.approvalProof, data.sessionId);
        }, 500);
      } else if (data?.reason === "rate_limited" || res.status === 429) {
        setPaypalFeedback({
          type: "err",
          msg:
            language === "en"
              ? "Too many incorrect attempts. Please wait a few minutes and try again."
              : "Demasiados intentos incorrectos. Espera unos minutos e intenta nuevamente.",
        });
      } else if (data?.reason === "unlock_code_not_configured") {
        setPaypalFeedback({
          type: "err",
          msg:
            language === "en"
              ? "The site owner has not activated the PayPal unlock code in the Creator Panel yet."
              : "El creador aún no activó el código de desbloqueo en el Panel del Creador (botón RA).",
        });
      } else {
        setPaypalFeedback({
          type: "err",
          msg:
            language === "en"
              ? "Invalid code. Check the unlock code sent after your PayPal payment confirmation."
              : "Código incorrecto. Verifica el código enviado tras confirmarse tu pago por PayPal.",
        });
      }
    } catch {
      setPaypalFeedback({
        type: "err",
        msg:
          language === "en"
            ? "Connection error verifying code. Please try again."
            : "Error de conexión al validar el código. Intenta nuevamente.",
      });
    } finally {
      setIsValidatingPaypalCode(false);
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
        className="relative w-full max-w-2xl bg-[#0f081b] border border-amber-500/45 rounded-3xl p-5 sm:p-7 text-purple-100 shadow-[0_0_55px_rgba(245,158,11,0.22)] space-y-4 my-6"
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
          <div className="flex items-center space-x-2 text-xs font-cinzel font-semibold uppercase tracking-wider text-amber-300">
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
        <div className="p-3.5 rounded-2xl bg-purple-950/45 border border-purple-800/50 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-gothic text-purple-200/90">
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
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>{copy.includes4}</span>
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
            {/* Unified Unlock Methods Grid: Mercado Pago (AR) + PayPal (International) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 items-stretch">
              {/* Method 1: Mercado Pago (Argentina) */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 flex flex-col justify-between gap-3">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-cinzel font-bold text-amber-200">
                      Mercado Pago · Argentina
                    </p>
                    {cfg.passPriceArs.trim() && (
                      <span className="text-[11px] font-mono font-bold text-amber-300">
                        {cfg.passPriceArs.trim()}
                      </span>
                    )}
                  </div>
                  <a
                    href={mpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handlePaymentClick}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:via-orange-400 hover:to-amber-500 text-neutral-950 font-cinzel font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.35)] border border-amber-200/70 transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>{copy.payMp}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-90 shrink-0" />
                  </a>
                </div>

                <form onSubmit={handleValidateOperation} className="space-y-2 pt-2.5 border-t border-amber-500/20">
                  <div className="flex items-center space-x-1.5 text-[11px] font-cinzel font-bold text-amber-200">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Comprobante / N.º de Operación</span>
                  </div>
                  <p className="text-[11px] font-gothic text-purple-200/80 leading-snug">
                    Si ya abonaste en Mercado Pago, ingresa tu número de operación para desbloquear al instante:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={operationNumber}
                      onChange={(e) => setOperationNumber(e.target.value)}
                      placeholder="Ej. 1234567890"
                      className="flex-1 min-w-0 px-3 py-2 bg-purple-950/60 border border-purple-700/60 rounded-xl text-purple-100 placeholder-purple-400/40 text-xs font-mono focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={isValidatingOp}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-cinzel font-bold text-xs transition cursor-pointer disabled:opacity-60 shadow flex items-center space-x-1 shrink-0"
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
              </div>

              {/* Method 2: PayPal.me (International USD / EUR / GBP + Unlock Code) */}
              <div className="p-4 rounded-2xl bg-sky-950/25 border border-sky-400/45 flex flex-col justify-between gap-3">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 text-xs font-cinzel font-bold text-sky-200">
                      <Globe className="w-4 h-4 text-sky-300 shrink-0" />
                      <span>
                        {language === "en"
                          ? "PayPal · International"
                          : language === "pt"
                          ? "PayPal · Internacional"
                          : language === "fr"
                          ? "PayPal · International"
                          : language === "it"
                          ? "PayPal · Internazionale"
                          : language === "de"
                          ? "PayPal · International"
                          : "PayPal · Internacional"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {(
                        [
                          { id: "USD", label: "USD $5" },
                          { id: "EUR", label: "EUR €5" },
                          { id: "GBP", label: "GBP £5" },
                        ] as const
                      ).map((cur) => (
                        <button
                          key={cur.id}
                          type="button"
                          onClick={() => {
                            triggerHaptic(HAPTIC_PATTERNS.click);
                            setPaypalCurrency(cur.id);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer border ${
                            paypalCurrency === cur.id
                              ? "bg-sky-400 text-slate-950 border-sky-200 shadow-sm"
                              : "bg-sky-950/70 text-sky-200/80 border-sky-700/50 hover:bg-sky-900/60"
                          }`}
                        >
                          {cur.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <a
                    href={
                      paypalCurrency === "EUR"
                        ? normalizePayPalUrl(cfg.paypalLinkEur, DEFAULT_PAYPAL_EUR_LINK)
                        : paypalCurrency === "GBP"
                        ? normalizePayPalUrl(cfg.paypalLinkGbp, DEFAULT_PAYPAL_GBP_LINK)
                        : normalizePayPalUrl(cfg.paypalLinkUsd, DEFAULT_PAYPAL_USD_LINK)
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handlePaymentClick}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 hover:from-sky-300 hover:via-blue-400 hover:to-indigo-400 text-slate-950 font-cinzel font-bold text-xs shadow-[0_0_20px_rgba(56,189,248,0.35)] border border-sky-200/80 transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>
                      {language === "en"
                        ? `Pay with PayPal (${paypalCurrency === "EUR" ? "€5 EUR" : paypalCurrency === "GBP" ? "£5 GBP" : "$5 USD"})`
                        : `Pagar con PayPal (${paypalCurrency === "EUR" ? "€5 EUR" : paypalCurrency === "GBP" ? "£5 GBP" : "$5 USD"})`}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-90 shrink-0" />
                  </a>

                  <p className="text-[10px] font-mono text-sky-300/75 text-center truncate">
                    {paypalCurrency === "EUR"
                      ? normalizePayPalUrl(cfg.paypalLinkEur, DEFAULT_PAYPAL_EUR_LINK)
                      : paypalCurrency === "GBP"
                      ? normalizePayPalUrl(cfg.paypalLinkGbp, DEFAULT_PAYPAL_GBP_LINK)
                      : normalizePayPalUrl(cfg.paypalLinkUsd, DEFAULT_PAYPAL_USD_LINK)}
                  </p>
                </div>

                <form onSubmit={handleValidatePaypalCode} className="space-y-2 pt-2.5 border-t border-sky-500/20">
                  <div className="flex items-center space-x-1.5 text-[11px] font-cinzel font-bold text-sky-200">
                    <KeyRound className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                    <span>{language === "en" ? "PayPal Unlock Code" : "Código de Desbloqueo PayPal"}</span>
                  </div>
                  <p className="text-[11px] font-gothic text-sky-100/80 leading-snug">
                    {language === "en"
                      ? "After paying via PayPal, enter your unlock code here:"
                      : "Cuando recibas la confirmación tras abonar por PayPal, ingresa tu código aquí:"}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={paypalCode}
                      onChange={(e) => setPaypalCode(e.target.value)}
                      placeholder={language === "en" ? "Unlock code..." : "Código..."}
                      className="flex-1 min-w-0 px-3 py-2 bg-slate-950/75 border border-sky-500/45 rounded-xl text-sky-100 placeholder-sky-300/40 text-xs font-mono focus:outline-none focus:border-sky-300"
                    />
                    <button
                      type="submit"
                      disabled={isValidatingPaypalCode}
                      className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-cinzel font-bold text-xs transition cursor-pointer disabled:opacity-60 shadow flex items-center space-x-1 shrink-0"
                    >
                      {isValidatingPaypalCode ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>{language === "en" ? "Unlock" : "Desbloquear"}</span>
                      )}
                    </button>
                  </div>

                  {paypalFeedback && (
                    <div
                      className={`text-[11px] font-gothic p-2 rounded-xl border ${
                        paypalFeedback.type === "ok"
                          ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-200"
                          : "bg-red-950/70 border-red-500/50 text-red-200"
                      }`}
                    >
                      {paypalFeedback.msg}
                    </div>
                  )}
                </form>
              </div>
            </div>

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
              <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/35 space-y-2.5">
                <p className="text-[11px] font-cinzel font-semibold text-amber-200">
                  Acceso Exclusivo del Creador
                </p>

                {creatorAuthCaps?.webauthnConfigured && isBiometricSupported() && (
                  <button
                    type="button"
                    disabled={isCreatorSigningIn}
                    onClick={async () => {
                      triggerHaptic(HAPTIC_PATTERNS.click);
                      setCreatorLoginError("");
                      setIsCreatorSigningIn(true);
                      const result = await loginAdminWithBiometric();
                      setIsCreatorSigningIn(false);
                      if (result.ok) {
                        setShowCreatorLogin(false);
                        onUnlocked?.();
                        onClose();
                      } else {
                        setCreatorLoginError(result.error || "No se pudo verificar tu huella digital.");
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-emerald-600/85 hover:bg-emerald-500 disabled:opacity-60 text-white text-[11px] font-cinzel font-bold transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>Ingresar con Huella Digital</span>
                  </button>
                )}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    triggerHaptic(HAPTIC_PATTERNS.click);
                    const cleanPin = creatorPinInput.trim();
                    if (!/^\d{4,12}$/.test(cleanPin)) {
                      setCreatorLoginError("El código numérico debe tener entre 4 y 12 dígitos.");
                      return;
                    }
                    setCreatorLoginError("");
                    setIsCreatorSigningIn(true);
                    const res = creatorAuthCaps?.canSetupInitialPin
                      ? await setupInitialAdminPin(cleanPin)
                      : await loginAdminWithPin(cleanPin);
                    setIsCreatorSigningIn(false);
                    if (res.ok) {
                      setShowCreatorLogin(false);
                      setCreatorPinInput("");
                      onUnlocked?.();
                      onClose();
                    } else {
                      setCreatorLoginError(res.error || "Código numérico incorrecto.");
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={12}
                    value={creatorPinInput}
                    onChange={(e) => {
                      setCreatorPinInput(e.target.value.replace(/\D/g, ""));
                      if (creatorLoginError) setCreatorLoginError("");
                    }}
                    placeholder={
                      creatorAuthCaps?.canSetupInitialPin
                        ? "Crear PIN (4-12 dígitos)..."
                        : "Código PIN de creador..."
                    }
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-black/60 border border-amber-500/40 text-xs font-mono tracking-widest text-amber-100 placeholder:text-amber-300/40 placeholder:tracking-normal focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={isCreatorSigningIn || creatorPinInput.length < 4}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-neutral-950 text-[11px] font-cinzel font-bold transition cursor-pointer shrink-0"
                  >
                    {creatorAuthCaps?.canSetupInitialPin ? "Crear PIN" : "Entrar"}
                  </button>
                </form>

                <button
                  type="button"
                  disabled={isCreatorSigningIn}
                  onClick={async () => {
                    triggerHaptic(HAPTIC_PATTERNS.click);
                    setCreatorLoginError("");
                    setIsCreatorSigningIn(true);
                    const result = await signInOwnerWithGoogle();
                    setIsCreatorSigningIn(false);
                    if (result.ok) {
                      setShowCreatorLogin(false);
                      onUnlocked?.();
                      onClose();
                    } else {
                      setCreatorLoginError(
                        result.error || "No se pudo verificar la cuenta del propietario."
                      );
                    }
                  }}
                  className="w-full px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/70 border border-purple-700/50 disabled:opacity-60 text-purple-200 text-[10px] font-cinzel font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isCreatorSigningIn ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <span>O ingresar con Google</span>
                  )}
                </button>
                {creatorLoginError && (
                  <p className="text-[11px] font-gothic text-rose-300">
                    {creatorLoginError}
                  </p>
                )}
              </div>
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
