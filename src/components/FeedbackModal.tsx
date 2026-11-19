import React, { useState, useEffect } from "react";
import { X, Mail, Send, CheckCircle2, Trash2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StoredFeedbackItem {
  name: string;
  message: string;
  at: number;
  lang?: string;
}

const FEEDBACK_STORAGE_KEY = "ouija_user_feedback_list";

function loadStoredFeedback(): StoredFeedbackItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<StoredFeedbackItem[]>(() => loadStoredFeedback());

  useEffect(() => {
    if (isOpen) {
      setHistory(loadStoredFeedback());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleCleared = () => {
      setHistory([]);
    };
    window.addEventListener("ouija-history-cleared", handleCleared);
    return () => window.removeEventListener("ouija-history-cleared", handleCleared);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(HAPTIC_PATTERNS.click);
    if (!message.trim()) return;

    const entry: StoredFeedbackItem = {
      name: name.trim() || "Anónimo",
      message: message.trim(),
      at: Date.now(),
      lang: language,
    };

    try {
      const stored = loadStoredFeedback();
      const updated = [entry, ...stored].slice(0, 50);
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
      setHistory(updated);
    } catch {
      // ignore
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setMessage("");
      onClose();
    }, 1800);
  };

  const handleClearFeedbackHistory = () => {
    triggerHaptic(HAPTIC_PATTERNS.click);
    try {
      localStorage.removeItem(FEEDBACK_STORAGE_KEY);
    } catch {
      // ignore
    }
    setHistory([]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#0e0919] border border-amber-500/40 rounded-3xl p-6 text-purple-100 shadow-[0_0_50px_rgba(245,158,11,0.2)] space-y-4 my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-purple-950/80 hover:bg-purple-900 text-purple-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 border-b border-purple-900/60 pb-3">
          <div className="p-2.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-300">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-base text-amber-200">
              Buzón de Mensajes y Sugerencias
            </h3>
            <p className="text-[11px] font-gothic text-purple-300/80">
              Tu voz guía la evolución de este portal
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 flex flex-col items-center justify-center space-y-2 text-center text-emerald-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
            <p className="font-cinzel font-bold text-sm">¡Gracias por tu mensaje!</p>
            <p className="text-xs font-gothic text-emerald-300/80">
              Tu opinión ha sido guardada y será considerada por el creador.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-gothic text-purple-300 mb-1">
                Tu Nombre o Iniciales (opcional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Alma Buscadora"
                className="w-full px-3 py-2 bg-purple-950/40 border border-purple-700/60 rounded-xl text-purple-100 placeholder-purple-400/40 text-xs font-gothic focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-gothic text-purple-300 mb-1">
                Mensaje, Opinión o Sugerencia
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe aquí tu mensaje o sugerencia para el portal..."
                required
                className="w-full px-3 py-2 bg-purple-950/40 border border-purple-700/60 rounded-xl text-purple-100 placeholder-purple-400/40 text-xs font-gothic focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-purple-800 hover:from-amber-500 hover:to-purple-700 text-white font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl shadow transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>Enviar Mensaje</span>
            </button>
          </form>
        )}

        {history.length > 0 && (
          <div className="pt-3 border-t border-purple-900/50 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-cinzel font-semibold text-purple-300">
                Mensajes enviados ({history.length})
              </span>
              <button
                type="button"
                onClick={handleClearFeedbackHistory}
                className="px-2.5 py-1 rounded-lg bg-red-950/50 hover:bg-red-900/70 border border-red-700/50 text-red-200 text-[10px] font-cinzel font-semibold flex items-center gap-1 cursor-pointer transition"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpiar historial</span>
              </button>
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
              {history.map((item, idx) => (
                <div
                  key={`${item.at}_${idx}`}
                  className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[11px] font-gothic text-purple-200/90"
                >
                  <div className="flex items-center justify-between text-[10px] text-amber-300/80 mb-0.5">
                    <span className="font-semibold">{item.name}</span>
                    <span>{new Date(item.at).toLocaleDateString()}</span>
                  </div>
                  <p className="line-clamp-2">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
