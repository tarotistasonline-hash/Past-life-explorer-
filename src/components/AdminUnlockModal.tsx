import React, { useState, useEffect } from "react";
import { X, Lock, ShieldCheck, Loader2, Fingerprint, KeyRound, CheckCircle2 } from "lucide-react";
import {
  signInOwnerWithGoogle,
  getAdminAuthCapabilities,
  setupInitialAdminPin,
  loginAdminWithPin,
  loginAdminWithBiometric,
  isBiometricSupported,
  AdminAuthCapabilities,
  OWNER_EMAIL,
} from "../lib/adminTracking";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";

interface AdminUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminUnlockModal: React.FC<AdminUnlockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [caps, setCaps] = useState<AdminAuthCapabilities | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [isLoadingPin, setIsLoadingPin] = useState(false);
  const [isLoadingBio, setIsLoadingBio] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setPinInput("");
    setConfirmPinInput("");
    setErrorMsg("");
    getAdminAuthCapabilities().then(setCaps);
  }, [isOpen]);

  if (!isOpen) return null;

  const biometricReady = Boolean(caps?.webauthnConfigured) && isBiometricSupported();
  const isInitialPinSetup = Boolean(caps?.canSetupInitialPin);
  const busy = isLoadingPin || isLoadingBio || isLoadingGoogle;

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(HAPTIC_PATTERNS.click);
    setErrorMsg("");

    const cleanPin = pinInput.trim();
    if (!/^\d{4,12}$/.test(cleanPin)) {
      setErrorMsg("El código numérico debe tener entre 4 y 12 dígitos (solo números).");
      return;
    }

    if (isInitialPinSetup && cleanPin !== confirmPinInput.trim()) {
      setErrorMsg("Los códigos numéricos no coinciden.");
      return;
    }

    setIsLoadingPin(true);
    try {
      const res = isInitialPinSetup
        ? await setupInitialAdminPin(cleanPin)
        : await loginAdminWithPin(cleanPin);

      if (res.ok) {
        onSuccess();
      } else {
        setErrorMsg(res.error || "Código numérico incorrecto.");
      }
    } finally {
      setIsLoadingPin(false);
    }
  };

  const handleBiometricLogin = async () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    setErrorMsg("");
    setIsLoadingBio(true);
    try {
      const res = await loginAdminWithBiometric();
      if (res.ok) {
        onSuccess();
      } else {
        setErrorMsg(res.error || "No se pudo verificar tu huella digital.");
      }
    } finally {
      setIsLoadingBio(false);
    }
  };

  const handleGoogleLogin = async () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    setErrorMsg("");
    setIsLoadingGoogle(true);
    try {
      const res = await signInOwnerWithGoogle();
      if (res.ok) {
        onSuccess();
      } else {
        setErrorMsg(res.error || "Acceso denegado. Cuenta no autorizada.");
      }
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-sm bg-[#0e0a18] border border-amber-500/40 rounded-3xl p-6 text-purple-100 shadow-[0_0_40px_rgba(245,158,11,0.2)] space-y-4 my-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-purple-950 text-purple-300 hover:bg-purple-900 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 border-b border-purple-900/60 pb-3">
          <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-sm text-amber-200">
              Acceso del Creador
            </h3>
            <p className="text-[11px] font-gothic text-purple-300/80">
              Huella digital, código PIN o Google
            </p>
          </div>
        </div>

        {/* Biometric / Fingerprint quick button */}
        {biometricReady ? (
          <button
            type="button"
            disabled={busy}
            onClick={handleBiometricLogin}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.25)] transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2.5"
          >
            {isLoadingBio ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Leyendo huella...</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-5 h-5" />
                <span>Ingresar con Huella Digital</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-950/25 border border-emerald-500/25 text-[11px] font-gothic text-emerald-200/85">
            <Fingerprint className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              ¿Quieres entrar con tu <strong>huella digital</strong>? Ingresa una vez con tu código numérico o Google y actívala dentro del panel.
            </span>
          </div>
        )}

        {/* Numeric PIN Form */}
        <form onSubmit={handlePinSubmit} className="space-y-2.5 p-3.5 rounded-2xl bg-purple-950/35 border border-purple-800/45">
          <div className="flex items-center justify-between">
            <span className="text-xs font-cinzel font-bold text-amber-200 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>{isInitialPinSetup ? "Crea tu Código Numérico (PIN)" : "Código Numérico (PIN)"}</span>
            </span>
            {isInitialPinSetup && (
              <span className="text-[10px] font-gothic text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Primera vez
              </span>
            )}
          </div>

          {isInitialPinSetup && (
            <p className="text-[11px] font-gothic text-purple-200/80 leading-relaxed">
              Elige un PIN secreto de 4 a 12 números que solo tú conozcas para entrar rápido desde cualquier dispositivo.
            </p>
          )}

          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={12}
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value.replace(/\D/g, ""));
              if (errorMsg) setErrorMsg("");
            }}
            placeholder={isInitialPinSetup ? "Nuevo PIN (4 a 12 dígitos)..." : "Ingresa tu código numérico..."}
            className="w-full px-3 py-2 rounded-xl bg-black/55 border border-amber-500/40 text-sm font-mono tracking-widest text-amber-100 placeholder:text-purple-300/40 placeholder:tracking-normal focus:outline-none focus:border-amber-400 text-center"
            autoFocus={!biometricReady}
          />

          {isInitialPinSetup && (
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={12}
              value={confirmPinInput}
              onChange={(e) => {
                setConfirmPinInput(e.target.value.replace(/\D/g, ""));
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Repite tu código PIN..."
              className="w-full px-3 py-2 rounded-xl bg-black/55 border border-amber-500/40 text-sm font-mono tracking-widest text-amber-100 placeholder:text-purple-300/40 placeholder:tracking-normal focus:outline-none focus:border-amber-400 text-center"
            />
          )}

          <button
            type="submit"
            disabled={busy || pinInput.length < 4}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.25)] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoadingPin ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isInitialPinSetup ? "Guardar PIN y Entrar" : "Desbloquear con PIN"}</span>
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <p className="text-red-300 text-xs font-gothic bg-red-950/50 p-2.5 rounded-xl border border-red-700/50">
            {errorMsg}
          </p>
        )}

        {/* Google Fallback */}
        <div className="pt-1 border-t border-purple-900/50 space-y-1.5">
          <button
            type="button"
            disabled={busy}
            onClick={handleGoogleLogin}
            className="w-full py-2 px-3 bg-purple-950/60 hover:bg-purple-900/70 border border-purple-700/50 text-purple-200 font-cinzel font-semibold text-[11px] rounded-xl transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoadingGoogle ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verificando con Google...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Ingresar con Google ({OWNER_EMAIL})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
