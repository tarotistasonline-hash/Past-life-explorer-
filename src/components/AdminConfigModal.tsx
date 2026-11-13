import React, { useState, useEffect } from "react";
import {
  X,
  Volume2,
  Ghost,
  Shield,
  ShieldCheck,
  LogOut,
  Check,
  Play,
  Link2,
  Copy,
  Coffee,
  ExternalLink,
  RotateCcw,
  Globe,
  HelpCircle,
  Stars,
} from "lucide-react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { audio } from "../lib/audio";
import { useLanguage } from "../context/LanguageContext";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";
import { VisitsStats } from "../types";
import { deauthorizeAdmin } from "../lib/adminTracking";
import { CANONICAL_PUBLIC_URL } from "../lib/constants";
import {
  useMonetizationConfig,
  saveMonetizationConfigToFirestore,
  DEFAULT_MONETIZATION_CONFIG,
  MonetizationConfig,
  getEffectiveMpUrl,
  getEffectiveKofiUrl,
  sha256Hex,
  sha256ExactHex,
  resetFreeConsultationsUsed,
} from "../lib/monetization";
import { setDonationLink, DEFAULT_COFFEE_LINK } from "../lib/donationLink";

interface AdminConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitsStats: VisitsStats | null;
  isCreatorMode: boolean;
  onToggleCreatorMode: () => void;
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
    badge: "Voz Original • Predeterminada",
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

const OWNER_EMAIL = "tarotistasonline@gmail.com";

export const AdminConfigModal: React.FC<AdminConfigModalProps> = ({
  isOpen,
  onClose,
  visitsStats,
  isCreatorMode,
  onToggleCreatorMode,
}) => {
  const { t, language } = useLanguage();
  const cloudConfig = useMonetizationConfig();

  const [selectedVoice, setSelectedVoice] = useState<string>(audio.getSelectedAiVoice());
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);
  const [isPlayingWelcome, setIsPlayingWelcome] = useState<boolean>(false);
  const [isWelcomeActive, setIsWelcomeActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem("ouija_welcome_speech_active") !== "false";
    } catch {
      return true;
    }
  });

  const ADMIN_RETURN_TOKEN_KEY = "ouija_admin_auto_return_token_v1";

  const [formCfg, setFormCfg] = useState<MonetizationConfig>(cloudConfig);
  const [unlockCodeInput, setUnlockCodeInput] = useState<string>("");
  const [autoReturnToken, setAutoReturnToken] = useState<string>(() => {
    try {
      const existing = localStorage.getItem(ADMIN_RETURN_TOKEN_KEY);
      if (existing && existing.length >= 12) return existing;
      const arr = new Uint8Array(12);
      crypto.getRandomValues(arr);
      const generated = "ak_" + Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
      localStorage.setItem(ADMIN_RETURN_TOKEN_KEY, generated);
      return generated;
    } catch {
      return "ak_7f9a3e2c8b41d059";
    }
  });
  const [copiedAutoUrl, setCopiedAutoUrl] = useState<boolean>(false);
  const [paymentCapabilities, setPaymentCapabilities] = useState<{
    mpCheckoutProReady: boolean;
    kofiWebhookReady: boolean;
  }>({ mpCheckoutProReady: false, kofiWebhookReady: false });
  const [showKofiHelp, setShowKofiHelp] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [isSavingCloud, setIsSavingCloud] = useState<boolean>(false);
  const [isFirebaseAdminAuth, setIsFirebaseAdminAuth] = useState<boolean>(
    () =>
      auth.currentUser?.email?.toLowerCase() === OWNER_EMAIL &&
      auth.currentUser?.emailVerified === true
  );

  useEffect(() => {
    setFormCfg(cloudConfig);
  }, [cloudConfig]);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/payments/capabilities")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setPaymentCapabilities({
            mpCheckoutProReady: Boolean(d.mpCheckoutProReady),
            kofiWebhookReady: Boolean(d.kofiWebhookReady),
          });
        }
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const valid =
        user?.email?.toLowerCase() === OWNER_EMAIL && user?.emailVerified === true;
      setIsFirebaseAdminAuth(valid);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleConnectGoogle = async () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    setSaveStatus(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ login_hint: OWNER_EMAIL });
      const res = await signInWithPopup(auth, provider);
      const email = (res.user?.email || "").toLowerCase();
      if (email !== OWNER_EMAIL || !res.user?.emailVerified) {
        await signOut(auth).catch(() => {});
        setSaveStatus({
          type: "err",
          msg: `Debes iniciar sesión con ${OWNER_EMAIL} para publicar cambios globales.`,
        });
      } else {
        setSaveStatus({
          type: "ok",
          msg: "Cuenta Google verificada. Ya puedes publicar cambios para todos los usuarios.",
        });
      }
    } catch {
      setSaveStatus({
        type: "err",
        msg: "No se pudo completar el inicio de sesión con Google.",
      });
    }
  };

  const handleSaveMonetization = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(HAPTIC_PATTERNS.click);
    setSaveStatus(null);

    if (!isFirebaseAdminAuth) {
      setSaveStatus({
        type: "err",
        msg: "Conecta primero tu cuenta Google (botón arriba) para guardar estos enlaces en la nube para todos los visitantes.",
      });
      return;
    }

    setIsSavingCloud(true);
    try {
      let nextCfg = { ...formCfg };
      if (unlockCodeInput.trim()) {
        nextCfg.unlockCodeHash = await sha256Hex(unlockCodeInput);
      }
      if (autoReturnToken.trim()) {
        nextCfg.autoReturnTokenHash = await sha256ExactHex(autoReturnToken);
      }
      const saved = await saveMonetizationConfigToFirestore(nextCfg);
      setFormCfg(saved);
      setUnlockCodeInput("");
      setDonationLink(saved.mpLink);
      setSaveStatus({
        type: "ok",
        msg: "¡Publicado en Firestore! El desbloqueo automático y tus límites ya están activos para todos los visitantes.",
      });
      setTimeout(() => setSaveStatus(null), 5000);
    } catch {
      setSaveStatus({
        type: "err",
        msg: "Error de permisos en la nube. Verifica haber iniciado sesión con Google como tarotistasonline@gmail.com.",
      });
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleRegenerateAutoReturnToken = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    const arr = new Uint8Array(12);
    crypto.getRandomValues(arr);
    const nextToken = "ak_" + Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
    setAutoReturnToken(nextToken);
    try {
      localStorage.setItem(ADMIN_RETURN_TOKEN_KEY, nextToken);
    } catch {
      // ignore
    }
    setSaveStatus({
      type: "ok",
      msg: "Se generó un nuevo enlace de retorno automático. Pulsa 'Guardar y Publicar para Todos' y actualiza el redirect en Mercado Pago / Ko-fi.",
    });
  };

  const handleResetMonetization = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    setFormCfg({ ...DEFAULT_MONETIZATION_CONFIG });
    setUnlockCodeInput("");
    setDonationLink(DEFAULT_COFFEE_LINK);
    setSaveStatus({
      type: "ok",
      msg: "Valores restablecidos en el formulario. Pulsa 'Publicar para Todos' para aplicarlos en la nube.",
    });
  };

  const handleSelectVoice = (voiceId: string) => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    setSelectedVoice(voiceId);
    audio.setSelectedAiVoice(voiceId);
  };

  const handleToggleWelcome = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    const nextVal = !isWelcomeActive;
    setIsWelcomeActive(nextVal);
    try {
      localStorage.setItem("ouija_welcome_speech_active", nextVal ? "true" : "false");
      window.dispatchEvent(
        new CustomEvent("ouija-welcome-settings-change", { detail: { active: nextVal } })
      );
    } catch {}
  };

  const handleTestWelcomeMessage = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    if (isPlayingWelcome) {
      audio.stopSpeech();
      setIsPlayingWelcome(false);
      return;
    }

    setIsPlayingWelcome(true);
    const welcomeNarrative = t("welcomeVoiceText");
    audio.speakSpiritText(
      welcomeNarrative,
      () => setIsPlayingWelcome(true),
      () => setIsPlayingWelcome(false),
      language
    );
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
    const sampleText =
      t("voiceSampleUltratumbaText") ||
      "Hablo desde el umbral de ultratumba... El velo se ha rasgado y los ecos de tu alma vuelven a la luz.";

    audio.testMaleVoice(
      voiceId,
      () => setTestingVoiceId(voiceId),
      () => setTestingVoiceId(null),
      sampleText,
      language
    );
  };

  const handleLogout = async () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    await signOut(auth).catch(() => {});
    deauthorizeAdmin();
    onClose();
  };

  const totalVisitsVal = visitsStats?.totalVisits ?? 0;
  const todayVisitsVal = visitsStats?.todayVisits ?? 0;
  const totalConsultationsVal = visitsStats?.totalConsultations ?? 0;
  const uniqueVisitorsVal = visitsStats?.uniqueVisitorsCount ?? 0;

  const previewMpTipUrl = getEffectiveMpUrl(formCfg, "tip");
  const previewKofiTipUrl = getEffectiveKofiUrl(formCfg);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e0919] border border-amber-500/40 rounded-3xl p-5 sm:p-7 text-purple-100 shadow-[0_0_50px_rgba(245,158,11,0.2)] space-y-6 my-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-cinzel font-bold text-amber-200">
                Panel Exclusivo de Configuración
              </h2>
              <p className="text-xs font-gothic text-purple-300/80">
                Acceso restringido: <span className="text-amber-300 font-mono">{OWNER_EMAIL}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-purple-950/80 hover:bg-purple-900 text-purple-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Voice Configuration */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs uppercase font-cinzel font-semibold text-purple-300 tracking-wider">
            <Ghost className="w-4 h-4 text-purple-400" />
            <span>Configuración de Voz Solemne (Predeterminada del Sistema)</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {SPIRITUAL_AI_VOICES.map((v) => {
              const isSelected = selectedVoice === v.id;
              const isTesting = testingVoiceId === v.id;

              return (
                <div
                  key={v.id}
                  onClick={() => handleSelectVoice(v.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-purple-950/70 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "bg-[#130b22]/70 border-purple-900/50 hover:border-purple-700/60"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-cinzel font-bold text-sm text-purple-100">{v.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-300 border border-purple-700/50">
                        {v.badge}
                      </span>
                    </div>
                    <p className="text-xs text-purple-300/80 font-gothic">{v.desc}</p>
                    <span className="text-[10px] text-amber-300/80 font-mono block">{v.timbre}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => handleTestVoice(v.id, e)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold border flex items-center space-x-1.5 transition cursor-pointer ${
                        isTesting
                          ? "bg-amber-600 text-black border-amber-400 animate-pulse"
                          : "bg-purple-900/60 hover:bg-purple-800 text-purple-200 border-purple-600/50"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isTesting ? "Probando..." : "Probar"}</span>
                    </button>
                    {isSelected && (
                      <div className="w-7 h-7 rounded-xl bg-purple-600/40 border border-purple-400 flex items-center justify-center text-purple-200">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Welcome Message Autoplay & Preview Controls */}
          <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/50 space-y-2.5 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span className="font-cinzel text-xs font-bold text-amber-200">
                  Mensaje de Bienvenida al Iniciar la App
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleWelcome}
                className={`px-3 py-1 rounded-xl text-xs font-cinzel font-semibold border transition cursor-pointer flex items-center space-x-1.5 ${
                  isWelcomeActive
                    ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                    : "bg-neutral-900 border-neutral-700 text-neutral-400"
                }`}
              >
                <span>{isWelcomeActive ? "Activado" : "Desactivado"}</span>
              </button>
            </div>

            <p className="text-[11px] text-purple-300/80 font-gothic italic">
              "{t("welcomeVoiceText")}"
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-purple-900/40">
              <span className="text-[10px] text-purple-400 font-gothic">
                Voz activa: <strong className="text-amber-300">{selectedVoice}</strong>
              </span>
              <button
                type="button"
                onClick={handleTestWelcomeMessage}
                className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold border flex items-center space-x-1.5 transition cursor-pointer ${
                  isPlayingWelcome
                    ? "bg-amber-600 text-black border-amber-400 animate-pulse"
                    : "bg-purple-900/80 hover:bg-purple-800 text-purple-100 border-purple-600/60"
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isPlayingWelcome ? "Detener Mensaje" : "Escuchar Bienvenida Ahora"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Creator Traffic Exclusion & Detailed Metrics */}
        <div className="space-y-3 pt-2 border-t border-purple-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs uppercase font-cinzel font-semibold text-purple-300 tracking-wider">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Filtro de Tráfico del Creador</span>
            </div>
            <button
              type="button"
              onClick={onToggleCreatorMode}
              className={`px-3 py-1 rounded-xl text-xs font-cinzel font-semibold border transition cursor-pointer flex items-center space-x-1.5 ${
                isCreatorMode
                  ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                  : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isCreatorMode ? "Exclusión Activada" : "Modo Visitante"}</span>
            </button>
          </div>
          <p className="text-xs text-purple-300/70 font-gothic">
            Cuando la exclusión está activada, tus propias visitas y consultas de prueba no alteran las estadísticas públicas reales.
          </p>

          {/* Metrics Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-center">
              <span className="text-[10px] text-purple-400 uppercase font-cinzel block">Visitas Totales</span>
              <span className="text-xl font-cinzel font-bold text-purple-100">{totalVisitsVal}</span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-center">
              <span className="text-[10px] text-purple-400 uppercase font-cinzel block">Visitas Hoy</span>
              <span className="text-xl font-cinzel font-bold text-amber-300">{todayVisitsVal}</span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-center">
              <span className="text-[10px] text-purple-400 uppercase font-cinzel block">Consultas</span>
              <span className="text-xl font-cinzel font-bold text-purple-100">{totalConsultationsVal}</span>
            </div>
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-center">
              <span className="text-[10px] text-purple-400 uppercase font-cinzel block">Únicos</span>
              <span className="text-xl font-cinzel font-bold text-emerald-300">{uniqueVisitorsVal}</span>
            </div>
          </div>

          {/* Section 3: Global Monetization (Mercado Pago + Ko-fi + Private Readings) */}
          <form
            onSubmit={handleSaveMonetization}
            className="p-4 bg-black/45 border border-amber-500/35 rounded-2xl space-y-3.5 mt-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-xs font-cinzel font-bold text-amber-300">
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>Monetización Global (Mercado Pago + Ko-fi)</span>
              </div>
              {isFirebaseAdminAuth ? (
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-cinzel flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Google Conectado</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-white hover:bg-neutral-200 text-neutral-900 font-cinzel font-bold flex items-center space-x-1 cursor-pointer transition"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Conectar Google para Publicar</span>
                </button>
              )}
            </div>

            {/* Ko-fi Quick Setup Helper Toggle */}
            <div className="rounded-xl bg-[#240d18]/70 border border-rose-500/35 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-cinzel font-semibold text-rose-200">
                  <Globe className="w-4 h-4 text-rose-400" />
                  <span>¿Cómo activar Ko-fi en 1 minuto?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKofiHelp(!showKofiHelp)}
                  className="text-[11px] text-rose-300 hover:text-white flex items-center space-x-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showKofiHelp ? "Ocultar guía" : "Ver pasos"}</span>
                </button>
              </div>

              {showKofiHelp && (
                <div className="text-[11px] font-gothic text-rose-100/90 space-y-1 pt-1 border-t border-rose-800/50">
                  <p>
                    Crea tu página gratis en{" "}
                    <a
                      href="https://ko-fi.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-rose-300 hover:text-white"
                    >
                      ko-fi.com
                    </a>{" "}
                    con tu correo <code className="text-amber-200">tarotistasonline@gmail.com</code>, vincula tu método de cobro dentro de Ko-fi y pega abajo tu enlace o usuario (ej. <code className="text-amber-200">https://ko-fi.com/tunombre</code>).
                  </p>
                </div>
              )}
            </div>

            {/* Payment Links Row: ONLY Mercado Pago + Ko-fi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-cinzel text-amber-200">
                    Link Mercado Pago
                  </label>
                  {previewMpTipUrl && (
                    <a
                      href={previewMpTipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-amber-300 hover:underline flex items-center space-x-0.5"
                    >
                      <span>Probar</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={formCfg.mpLink}
                  onChange={(e) => setFormCfg({ ...formCfg, mpLink: e.target.value })}
                  placeholder="https://mpago.la/2cv7Gii"
                  className="w-full px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800 text-xs text-purple-100 placeholder-purple-400/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-cinzel text-rose-200">
                    Página Ko-fi (Enlace o usuario)
                  </label>
                  {previewKofiTipUrl && (
                    <a
                      href={previewKofiTipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-rose-300 hover:underline flex items-center space-x-0.5"
                    >
                      <span>Probar Ko-fi</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={formCfg.kofiLink}
                  onChange={(e) => setFormCfg({ ...formCfg, kofiLink: e.target.value })}
                  placeholder="https://ko-fi.com/tuusuario"
                  className="w-full px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800 text-xs text-purple-100 placeholder-purple-400/40 focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            {/* Free Limit & Paywall Config (Past Lives + Questions) */}
            <div className="pt-2 border-t border-purple-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-cinzel font-bold text-purple-200">
                  <Stars className="w-4 h-4 text-amber-300" />
                  <span>Cobro tras Consultas Gratuitas (Vidas Pasadas y Preguntas)</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormCfg({
                      ...formCfg,
                      paywallEnabled: !formCfg.paywallEnabled,
                    })
                  }
                  className={`px-3 py-1 rounded-xl text-[11px] font-cinzel font-semibold border cursor-pointer transition ${
                    formCfg.paywallEnabled
                      ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                      : "bg-neutral-900 border-neutral-700 text-neutral-400"
                  }`}
                >
                  {formCfg.paywallEnabled ? "Activado" : "Desactivado"}
                </button>
              </div>

              <div className={`grid grid-cols-1 ${paymentCapabilities.mpCheckoutProReady ? "sm:grid-cols-4" : "sm:grid-cols-3"} gap-2.5`}>
                <div>
                  <label className="text-[10px] font-cinzel text-purple-300 block mb-1">
                    Consultas Gratis
                  </label>
                  <select
                    value={formCfg.freeConsultationsLimit}
                    onChange={(e) =>
                      setFormCfg({
                        ...formCfg,
                        freeConsultationsLimit: Number(e.target.value) || 2,
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800 text-xs text-purple-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value={1}>1 consulta gratis</option>
                    <option value={2}>2 consultas gratis</option>
                    <option value={3}>3 consultas gratis</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-cinzel text-purple-300 block mb-1">
                    Precio Pase Mercado Pago
                  </label>
                  <input
                    type="text"
                    value={formCfg.passPriceArs}
                    onChange={(e) =>
                      setFormCfg({ ...formCfg, passPriceArs: e.target.value })
                    }
                    placeholder="$3.500 ARS"
                    className="w-full px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800 text-xs text-purple-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                {paymentCapabilities.mpCheckoutProReady && (
                  <div>
                    <label className="text-[10px] font-cinzel text-purple-300 block mb-1">
                      Monto ARS Numérico
                    </label>
                    <input
                      type="number"
                      min={100}
                      value={formCfg.passAmountArs}
                      onChange={(e) =>
                        setFormCfg({
                          ...formCfg,
                          passAmountArs: Number(e.target.value) || 3500,
                        })
                      }
                      placeholder="3500"
                      className="w-full px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800 text-xs text-purple-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-cinzel text-purple-300 block mb-1">
                    Precio Pase Ko-fi
                  </label>
                  <input
                    type="text"
                    value={formCfg.passPriceUsd}
                    onChange={(e) =>
                      setFormCfg({ ...formCfg, passPriceUsd: e.target.value })
                    }
                    placeholder="4 USD"
                    className="w-full px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800 text-xs text-purple-100 focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              {/* Automatic Post-Payment Return URL Generator (Works 100% with Payment Links, No API needed) */}
              <div className="p-3 rounded-xl bg-emerald-950/35 border border-emerald-500/40 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-cinzel font-bold text-emerald-300">
                    Desbloqueo Automático desde tus Links (Sin API)
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {formCfg.autoReturnTokenHash && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-200 font-mono">
                        ✓ Activo en Firestore
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] font-gothic text-emerald-100/85 leading-relaxed space-y-1">
                  <p>
                    <strong>1. En Mercado Pago:</strong> Editá tu link de pago → <em>Más opciones</em> → <em>Redireccionar cuando el pago sea aprobado</em> y pegá esta URL. Quien abone vuelve solo y la lectura arranca al instante.
                  </p>
                  <p>
                    <strong>2. En Ko-fi:</strong> En <em>Settings → Payment → Thank You Message</em> (gratis), pegá esta misma URL para que quien pague haga clic y se desbloquee al momento.
                  </p>
                </div>

                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    readOnly
                    value={`${CANONICAL_PUBLIC_URL}/?pago_aprobado=1&token=${autoReturnToken}`}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/60 border border-emerald-700/50 text-[10px] font-mono text-emerald-200 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(HAPTIC_PATTERNS.click);
                      navigator.clipboard.writeText(
                        `${CANONICAL_PUBLIC_URL}/?pago_aprobado=1&token=${autoReturnToken}`
                      );
                      setCopiedAutoUrl(true);
                      setTimeout(() => setCopiedAutoUrl(false), 2500);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-cinzel font-bold flex items-center space-x-1 cursor-pointer shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedAutoUrl ? "Copiado" : "Copiar URL"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateAutoReturnToken}
                    title="Regenerar enlace automático"
                    className="p-1.5 rounded-lg bg-purple-900/70 hover:bg-purple-800 border border-purple-700/50 text-purple-200 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-cinzel text-purple-300 block mb-1">
                    Link Mercado Pago para Pase (opcional)
                  </label>
                  <input
                    type="text"
                    value={formCfg.passMpLink}
                    onChange={(e) =>
                      setFormCfg({ ...formCfg, passMpLink: e.target.value })
                    }
                    placeholder="Si queda vacío usa https://mpago.la/2cv7Gii"
                    className="w-full px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800 text-xs text-purple-100 placeholder-purple-400/40 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-cinzel text-purple-300">
                      Código Manual de Respaldo (opcional)
                    </label>
                    {formCfg.unlockCodeHash && (
                      <span className="text-[9px] text-emerald-300 font-mono">
                        ✓ Configurado
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={unlockCodeInput}
                    onChange={(e) => setUnlockCodeInput(e.target.value)}
                    placeholder="Ej: LUZ2026 (opcional)"
                    className="w-full px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800 text-xs text-purple-100 placeholder-purple-400/40 focus:outline-none focus:border-amber-400 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[11px] font-gothic text-purple-200/85 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>
                  Prueba el flujo completo como visitante reiniciando tu cupo local de consultas gratuitas.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(HAPTIC_PATTERNS.click);
                    resetFreeConsultationsUsed();
                    setSaveStatus({
                      type: "ok",
                      msg: "Tu contador y pase locales volvieron a 0. (Recuerda desactivar 'Exclusión Activada' arriba para probar el bloqueo como visitante).",
                    });
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-900/80 hover:bg-purple-800 border border-purple-600/50 text-[10px] font-cinzel text-amber-200 shrink-0 cursor-pointer"
                >
                  Reiniciar prueba local
                </button>
              </div>
            </div>

            {saveStatus && (
              <div
                className={`text-xs font-gothic p-2.5 rounded-xl border ${
                  saveStatus.type === "ok"
                    ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/50 border-red-500/40 text-red-300"
                }`}
              >
                {saveStatus.msg}
              </div>
            )}

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="submit"
                disabled={isSavingCloud}
                className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-cinzel font-bold transition cursor-pointer disabled:opacity-60"
              >
                {isSavingCloud ? "Publicando en Firestore..." : "Guardar y Publicar para Todos"}
              </button>
              <button
                type="button"
                onClick={handleResetMonetization}
                title="Restablecer valores por defecto"
                className="p-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-300 border border-purple-700/50 cursor-pointer transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Official URLs & SEO Indexing */}
          <div className="p-3.5 bg-black/40 border border-amber-500/30 rounded-2xl space-y-2.5 mt-3">
            <div className="flex items-center space-x-2 text-xs font-cinzel font-bold text-amber-300">
              <Link2 className="w-4 h-4 text-amber-400" />
              <span>Enlaces Oficiales para Compartir e Indexar</span>
            </div>

            <div className="space-y-1.5 text-xs font-gothic">
              <div className="flex items-center justify-between">
                <span className="text-purple-300/80">Enlace Público Oficial para Visitantes:</span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(HAPTIC_PATTERNS.click);
                    navigator.clipboard.writeText(CANONICAL_PUBLIC_URL);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700/50 flex items-center space-x-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar</span>
                </button>
              </div>
              <p className="font-mono text-[11px] text-emerald-300 bg-black/60 p-1.5 rounded border border-purple-900/50 break-all select-all">
                {CANONICAL_PUBLIC_URL}
              </p>
            </div>

            <div className="pt-2 border-t border-purple-900/40 text-xs space-y-1">
              <span className="text-amber-300 font-cinzel font-semibold flex items-center space-x-1">
                <span>✓ Verificación Google Search Console:</span>
              </span>
              <p className="text-[11px] text-purple-200/90 leading-relaxed font-gothic">
                El servidor está configurado para responder automáticamente al método <strong>Archivo HTML</strong> de Google Search Console.
              </p>
            </div>

            <div className="text-[11px] text-purple-300/70 pt-1 border-t border-purple-900/40">
              💡 Para ingresar a este panel: Haz clic en el botón circular <strong className="text-amber-300">RA</strong> arriba a la izquierda e inicia sesión con <strong className="text-amber-300">{OWNER_EMAIL}</strong>.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-purple-900/60">
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 rounded-xl text-red-300 text-xs font-cinzel flex items-center space-x-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión de Administración</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-purple-900/80 hover:bg-purple-800 border border-purple-600/60 rounded-xl text-purple-100 text-xs font-cinzel font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
