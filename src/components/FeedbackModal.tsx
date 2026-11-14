import React, { useState } from "react";
import { X, MessageSquareHeart, Send, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { triggerHaptic, HAPTIC_PATTERNS } from "../lib/haptics";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(HAPTIC_PATTERNS.click);
    if (!message.trim()) return;

    try {
      const stored = JSON.parse(localStorage.getItem("ouija_user_feedback_list") || "[]");
      stored.push({
        name: name.trim() || "Anónimo",
        message: message.trim(),
        at: Date.now(),
        lang: language,
      });
      localStorage.setItem("ouija_user_feedback_list", JSON.stringify(stored));
    } catch {
      // ignore
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setMessage("");
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
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
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-base text-amber-200">
              Buzón de Opiniones y Sugerencias
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
                Opinión, Sugerencia o Comentario
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe aquí tus sugerencias para mejorar el portal..."
                required
                className="w-full px-3 py-2 bg-purple-950/40 border border-purple-700/60 rounded-xl text-purple-100 placeholder-purple-400/40 text-xs font-gothic focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-purple-800 hover:from-amber-500 hover:to-purple-700 text-white font-cinzel font-bold text-xs uppercase tracking-wider rounded-xl shadow transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>Enviar Sugerencia</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
