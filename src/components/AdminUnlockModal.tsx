import React, { useState } from "react";
import { X, Lock, Key, ShieldCheck } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { authorizeAdmin } from "../lib/adminTracking";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";

interface AdminUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const OWNER_EMAIL = "tarotistasonline@gmail.com";

export const AdminUnlockModal: React.FC<AdminUnlockModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [inputVal, setInputVal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    setErrorMsg("");
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ login_hint: OWNER_EMAIL });
      const result = await signInWithPopup(auth, provider);
      const email = (result.user?.email || "").trim().toLowerCase();
      if (email === OWNER_EMAIL && result.user?.emailVerified) {
        authorizeAdmin(email);
        onSuccess();
      } else {
        await signOut(auth).catch(() => {});
        setErrorMsg(`Solo la cuenta verificada ${OWNER_EMAIL} puede modificar la configuración global.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("popup-closed-by-user")) {
        setErrorMsg("Ventana de inicio de sesión cerrada antes de completar.");
      } else {
        setErrorMsg("No se pudo abrir la ventana de Google. Puedes usar tu correo abajo para ver el panel.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(HAPTIC_PATTERNS.click);

    const ok = authorizeAdmin(inputVal);
    if (ok) {
      setErrorMsg("");
      setInputVal("");
      onSuccess();
    } else {
      setErrorMsg("Acceso denegado. Correo no autorizado.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#0e0a18] border border-amber-500/40 rounded-3xl p-6 text-purple-100 shadow-[0_0_40px_rgba(245,158,11,0.2)] space-y-4">
        <button
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
            <h3 className="font-cinzel font-bold text-sm text-amber-200">Acceso de Administración</h3>
            <p className="text-[11px] font-gothic text-purple-300/80">Exclusivo para el propietario</p>
          </div>
        </div>

        {/* Google Sign-In (Required by Firestore Security Rules to publish global PayPal/MP links) */}
        <div className="space-y-2">
          <button
            type="button"
            disabled={isGoogleLoading}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-3 bg-white hover:bg-neutral-100 text-neutral-900 font-cinzel font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-60"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {isGoogleLoading ? "Conectando con Google..." : "Entrar con Google (Recomendado)"}
            </span>
          </button>
          <p className="text-[10px] text-purple-300/75 font-gothic text-center">
            Permite publicar tus enlaces de Mercado Pago y Ko-fi en la nube para todos los visitantes.
          </p>
        </div>

        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-purple-900/60" />
          <span className="px-2 text-[10px] font-cinzel text-purple-400 uppercase">o acceso rápido</span>
          <div className="flex-grow border-t border-purple-900/60" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="text-xs font-gothic text-purple-200 block">
            Introduce tu correo de propietario:
          </label>
          <div className="relative">
            <input
              type="email"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-3 py-2 bg-purple-950/40 border border-purple-700/60 rounded-xl text-purple-100 placeholder-purple-400/40 text-xs focus:outline-none focus:border-amber-400"
            />
            <Key className="w-3.5 h-3.5 text-purple-400 absolute right-3 top-2.5" />
          </div>

          {errorMsg && (
            <p className="text-red-400 text-xs font-gothic bg-red-950/40 p-2 rounded-xl border border-red-800/40">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-purple-800 hover:from-amber-500 hover:to-purple-700 text-white font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl shadow transition cursor-pointer"
          >
            Desbloquear Configuración
          </button>
        </form>
      </div>
    </div>
  );
};
