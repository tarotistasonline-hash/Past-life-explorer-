import React from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useLanguage } from "../context/LanguageContext";

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { language } = useLanguage();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-950/95 border border-amber-500/60 px-3.5 py-2 text-xs font-cinzel font-semibold text-amber-100 shadow-lg backdrop-blur-md">
      <WifiOff className="w-3.5 h-3.5 text-amber-300 shrink-0" />
      <span>
        {language === "en"
          ? "Offline Mode — Cached oracle & saved readings active"
          : "Modo sin conexión — Lecturas guardadas disponibles"}
      </span>
    </div>
  );
};
