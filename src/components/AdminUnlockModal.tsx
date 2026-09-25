import React, { useState } from "react";
import { X, Lock, Key, ShieldCheck } from "lucide-react";
import { authorizeAdmin } from "../lib/adminTracking";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";

interface AdminUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminUnlockModal: React.FC<AdminUnlockModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [inputVal, setInputVal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

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

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
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
              autoFocus
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
