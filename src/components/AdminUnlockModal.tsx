import React, { useState } from "react";
import { X, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { signInOwnerWithGoogle, OWNER_EMAIL } from "../lib/adminTracking";
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    setErrorMsg("");
    setIsLoading(true);
    try {
      const res = await signInOwnerWithGoogle();
      if (res.ok) {
        onSuccess();
      } else {
        setErrorMsg(res.error || "Acceso denegado. Cuenta no autorizada.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#0e0a18] border border-amber-500/40 rounded-3xl p-6 text-purple-100 shadow-[0_0_40px_rgba(245,158,11,0.2)] space-y-4">
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
              Acceso de Administración
            </h3>
            <p className="text-[11px] font-gothic text-purple-300/80">
              Protegido con Google Sign-In
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-purple-200/90 font-gothic leading-relaxed">
          <p>
            Para proteger tus cobros de Mercado Pago, PayPal y el Modo Creador, este acceso solo se abre mediante inicio de sesión real con tu cuenta verificada de Google:
          </p>
          <p className="font-mono text-[11px] text-amber-300 bg-black/45 px-2.5 py-1.5 rounded-lg border border-amber-500/30 text-center">
            {OWNER_EMAIL}
          </p>
        </div>

        {errorMsg && (
          <p className="text-red-300 text-xs font-gothic bg-red-950/50 p-2.5 rounded-xl border border-red-700/50">
            {errorMsg}
          </p>
        )}

        <button
          type="button"
          disabled={isLoading}
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando con Google...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Ingresar con Google (Propietario)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
