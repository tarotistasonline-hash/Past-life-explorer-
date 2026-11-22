import React, { useEffect, useState } from "react";
import { Download, Smartphone, Share, X, ExternalLink, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { useLanguage } from "../context/LanguageContext";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";
import { isAdminSession, isAuthorizedAdmin } from "../lib/adminTracking";
import { isConsultationPassUnlocked, useMonetizationConfig } from "../lib/monetization";

interface PWAInstallButtonProps {
  onOpenPaywall?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onOpenPaywall }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language } = useLanguage();
  const cfg = useMonetizationConfig();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [authTick, setAuthTick] = useState(0);

  useEffect(() => {
    const bump = () => setAuthTick((v) => v + 1);
    window.addEventListener("ouija_consultation_allowance_changed", bump);
    window.addEventListener("ouija-creator-mode-change", bump);
    window.addEventListener("ouija-admin-auth-change", bump);
    return () => {
      window.removeEventListener("ouija_consultation_allowance_changed", bump);
      window.removeEventListener("ouija-creator-mode-change", bump);
      window.removeEventListener("ouija-admin-auth-change", bump);
    };
  }, []);

  void authTick;

  // Already running in standalone installed PWA mode
  if (isInstalled) {
    return null;
  }

  const isUnlocked =
    isAdminSession() ||
    isAuthorizedAdmin() ||
    !cfg.paywallEnabled ||
    isConsultationPassUnlocked(cfg);

  const isEs = language === "es";
  const label = isEs ? "Instalar App" : "Install App";

  const handleClick = async () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    if (!isUnlocked) {
      setShowLockedModal(true);
      return;
    }
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuideModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title={
          isUnlocked
            ? isEs
              ? "Instalar aplicación en tu dispositivo"
              : "Install app on your device"
            : isEs
            ? "Exclusivo al desbloquear tu pase ilimitado"
            : "Available after unlocking your unlimited pass"
        }
        className={
          isUnlocked
            ? "px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-500/50 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-200 flex items-center space-x-1.5 transition cursor-pointer shadow-sm whitespace-nowrap shrink-0"
            : "px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-500/45 bg-amber-950/40 hover:bg-amber-900/55 text-amber-200 flex items-center space-x-1.5 transition cursor-pointer shadow-sm whitespace-nowrap shrink-0"
        }
      >
        {isUnlocked ? (
          <Download className="w-3.5 h-3.5 text-emerald-300" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-amber-300" />
        )}
        <span className="text-[11px] font-cinzel font-semibold">{label}</span>
      </button>

      {/* Modal when user has NOT unlocked yet */}
      {showLockedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setShowLockedModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#0e0a18] border border-amber-500/45 rounded-2xl p-5 sm:p-6 text-purple-100 shadow-[0_0_50px_rgba(245,158,11,0.22)] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowLockedModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-purple-950 text-purple-300 hover:bg-purple-900 transition cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-purple-900/60 pb-3">
              <div className="p-2 rounded-xl bg-amber-950/70 border border-amber-500/45 text-amber-300">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel font-bold text-base text-amber-200">
                  {isEs ? "Instalación Exclusiva con Pase Desbloqueado" : "App Install Included with Full Pass"}
                </h3>
                <p className="text-[11px] font-gothic text-purple-300/80">
                  {isEs ? "Beneficio incluido al desbloquear el portal" : "Unlock once to install on mobile & desktop"}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm font-gothic text-purple-200/90 leading-relaxed">
              <p>
                {isEs
                  ? "Solo quienes desbloquean su pase ilimitado pueden instalar Tabla Ouija & Oráculo Akáshico como aplicación nativa en su celular (Android / iPhone) o computadora."
                  : "Installing the standalone app on Android, iPhone, or desktop is unlocked automatically as soon as you activate your unlimited pass."}
              </p>
              <div className="p-3 rounded-xl bg-purple-950/45 border border-purple-800/50 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{isEs ? "Consultas y lecturas ilimitadas sin restricciones" : "Unlimited consultations & readings"}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{isEs ? "Instalación directa con ícono propio en tu dispositivo" : "Installable home screen app with native icon"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(HAPTIC_PATTERNS.click);
                  setShowLockedModal(false);
                  onOpenPaywall?.();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:via-orange-400 hover:to-amber-500 text-neutral-950 font-cinzel font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEs ? "Desbloquear ahora" : "Unlock now"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowLockedModal(false)}
                className="px-4 py-2.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700/60 text-purple-200 font-cinzel font-semibold text-xs transition cursor-pointer"
              >
                {isEs ? "Cerrar" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install instructions modal when unlocked & native beforeinstallprompt isn't active */}
      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#0e0a18] border border-emerald-500/45 rounded-2xl p-5 sm:p-6 text-purple-100 shadow-[0_0_50px_rgba(16,185,129,0.2)] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-purple-950 text-purple-300 hover:bg-purple-900 transition cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-purple-900/60 pb-3">
              <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel font-bold text-base text-emerald-200">
                  {isEs ? "Instalar Tabla Ouija en tu Dispositivo" : "Install App on Your Device"}
                </h3>
                <p className="text-[11px] font-gothic text-purple-300/80">
                  {isEs ? "Acceso directo en pantalla de inicio y modo aplicación" : "Home screen shortcut & standalone app mode"}
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-2.5 text-xs sm:text-sm font-gothic text-purple-200/90 leading-relaxed">
                <p>
                  <strong>1.</strong> {isEs ? "Abre esta página en" : "Open this page in"} <strong>Safari</strong>.
                </p>
                <p className="flex items-center gap-1.5 flex-wrap">
                  <strong>2.</strong> {isEs ? "Toca el botón" : "Tap the"} <Share className="w-4 h-4 text-sky-300 inline" />{" "}
                  <strong>{isEs ? "Compartir" : "Share"}</strong> {isEs ? "en la barra inferior de Safari." : "in Safari's toolbar."}
                </p>
                <p>
                  <strong>3.</strong> {isEs ? "Desliza hacia abajo y selecciona" : "Scroll down and tap"}{" "}
                  <strong>"{isEs ? "Agregar a inicio" : "Add to Home Screen"}"</strong>.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs sm:text-sm font-gothic text-purple-200/90 leading-relaxed">
                <p>
                  <strong>{isEs ? "En Android (Chrome):" : "On Android (Chrome):"}</strong>{" "}
                  {isEs
                    ? "Toca el menú de 3 puntos (⋮) arriba a la derecha y elige «Instalar aplicación» o «Agregar a la pantalla principal»."
                    : "Tap the 3-dot menu (⋮) and choose «Install app» or «Add to Home screen»."}
                </p>
                <p>
                  <strong>{isEs ? "En PC / Mac (Chrome o Edge):" : "On Desktop (Chrome or Edge):"}</strong>{" "}
                  {isEs
                    ? "Haz clic en el ícono de Instalar (pantalla con flecha) en el extremo derecho de la barra de direcciones, o en el menú (⋮) → «Guardar y compartir» → «Instalar aplicación»."
                    : "Click the Install icon in the address bar or open browser menu → «Install app»."}
                </p>
                {typeof window !== "undefined" && window.self !== window.top && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-2">
                    <p>
                      {isEs
                        ? "Si estás viendo la app dentro de una vista previa embebida, ábrela en su propia pestaña para que el navegador habilite la instalación directa:"
                        : "If viewing inside an embedded preview, open the app directly in a new tab to trigger browser install:"}
                    </p>
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-cinzel font-bold text-amber-300 underline underline-offset-2"
                    >
                      <span>{isEs ? "Abrir en pestaña independiente" : "Open in standalone tab"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] font-gothic text-emerald-300/90 pt-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {isEs
                  ? "Funciona con ícono propio, pantalla completa y caché offline."
                  : "Includes native home screen icon, fullscreen display, and offline cache."}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-cinzel font-semibold text-xs transition cursor-pointer"
            >
              {isEs ? "Entendido" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
