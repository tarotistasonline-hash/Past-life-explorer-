import React, { useState, useEffect } from "react";
import {
  GrimorioRecord,
  getGrimorioRecords,
  deleteGrimorioRecord,
  clearAllGrimorio,
} from "../lib/grimorioStorage";
import { useLanguage } from "../context/LanguageContext";
import { copyMysticShareText } from "../lib/parchmentExport";
import {
  BookOpen,
  X,
  Trash2,
  Share2,
  Check,
  Sparkles,
  Scroll,
  Calendar,
  Layers,
  ChevronRight,
  Shield,
} from "lucide-react";

interface GrimorioModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onOpenPastLifeDetails?: (record: GrimorioRecord) => void;
}

export const GrimorioModal: React.FC<GrimorioModalProps> = ({
  isOpen = true,
  onClose,
  onOpenPastLifeDetails,
}) => {
  const { t, language } = useLanguage();
  const [records, setRecords] = useState<GrimorioRecord[]>(() => getGrimorioRecords());
  const [selectedRecord, setSelectedRecord] = useState<GrimorioRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setRecords(getGrimorioRecords());
    };
    window.addEventListener("ouija-grimorio-updated", handleUpdate);
    return () => window.removeEventListener("ouija-grimorio-updated", handleUpdate);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteGrimorioRecord(id);
    setRecords(getGrimorioRecords());
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("¿Deseas vaciar todas las memorias registradas en tu Grimorio?")) {
      clearAllGrimorio();
      setRecords([]);
      setSelectedRecord(null);
    }
  };

  const handleShare = async (record: GrimorioRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    let ok = false;
    if (record.type === "PAST_LIFE" && record.pastLifeData) {
      const pl = record.pastLifeData.pastLifeDetails;
      ok = await copyMysticShareText({
        title: pl.title,
        seekerName: record.seekerName,
        bodyText: `${pl.eraLocation} • ${pl.identityRole}\n\n${pl.narrative}`,
        karmicLesson: pl.karmicLesson,
        relic: pl.soulRelic,
        type: "PAST_LIFE",
      });
    } else if (record.type === "THREE_CARD_SPREAD" && record.spreadData) {
      const sp = record.spreadData;
      ok = await copyMysticShareText({
        title: record.title,
        seekerName: record.seekerName,
        bodyText: `Pasado: ${sp.pastCard.name}\nPresente: ${sp.presentCard.name}\nFuturo: ${sp.futureCard.name}\n\nSíntesis: ${sp.synthesis}`,
        type: "SPREAD",
      });
    }

    if (ok) {
      setCopiedId(record.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[88vh] bg-[#0c0816] border border-purple-600/50 rounded-2xl p-5 sm:p-7 text-purple-100 flex flex-col shadow-[0_0_60px_rgba(147,51,234,0.3)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/60 pb-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-600/50 text-purple-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-decorative text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-indigo-200 to-amber-200">
                Grimorio Personal & Ecos del Alma
              </h2>
              <p className="text-xs font-gothic text-purple-300/80">
                Registro sagrado de tus vidas pasadas y tiradas arcanas guardadas.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {records.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1 text-[11px] font-cinzel rounded-lg bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-800/40 transition cursor-pointer"
                title="Vaciar Grimorio"
              >
                Vaciar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-purple-950 text-purple-300 hover:text-white hover:bg-purple-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-purple-400/60 space-y-3">
              <Scroll className="w-12 h-12 stroke-[1.2] text-purple-500/40 animate-pulse" />
              <div className="font-cinzel text-sm font-semibold">Tu Grimorio está en blanco</div>
              <p className="text-xs font-gothic max-w-sm text-purple-300/70">
                Realiza una revelación de vidas pasadas o una tirada kármica para preservar tus memorias espirituales aquí.
              </p>
            </div>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                onClick={() => {
                  if (record.type === "PAST_LIFE" && record.pastLifeData && onOpenPastLifeDetails) {
                    onOpenPastLifeDetails(record);
                  } else {
                    setSelectedRecord(selectedRecord?.id === record.id ? null : record);
                  }
                }}
                className="bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/40 hover:border-purple-500/60 rounded-xl p-4 transition-all duration-300 cursor-pointer group shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-cinzel font-bold uppercase tracking-wider bg-purple-900/70 border border-purple-600/40 text-purple-200">
                      {record.type === "PAST_LIFE" ? "Vida Pasada" : "Tirada Kármica"}
                    </span>
                    <span className="text-xs font-gothic text-purple-300/70">
                      {record.dateFormatted}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleShare(record, e)}
                      className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800/60 transition cursor-pointer"
                      title="Copiar Papiro para Redes"
                    >
                      {copiedId === record.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDelete(record.id, e)}
                      className="p-1.5 rounded-lg text-red-400/80 hover:text-red-200 hover:bg-red-950/60 transition cursor-pointer"
                      title="Eliminar memoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-cinzel text-base font-bold text-purple-100 group-hover:text-purple-200 transition">
                      {record.title}
                    </h4>
                    <div className="text-xs font-gothic text-purple-300/80">
                      Consultante: <span className="text-purple-200 font-semibold">{record.seekerName}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Expanded Accordion Preview if selected */}
                {selectedRecord?.id === record.id && record.type === "THREE_CARD_SPREAD" && record.spreadData && (
                  <div className="pt-3 mt-2 border-t border-purple-900/60 font-gothic text-xs space-y-2 text-purple-200/90 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="p-2 rounded bg-purple-950/50 border border-purple-800/40">
                        <div className="font-cinzel font-bold text-[11px] text-purple-300">1. Pasado</div>
                        <div>{record.spreadData.pastCard.name}</div>
                      </div>
                      <div className="p-2 rounded bg-indigo-950/50 border border-indigo-800/40">
                        <div className="font-cinzel font-bold text-[11px] text-indigo-300">2. Presente</div>
                        <div>{record.spreadData.presentCard.name}</div>
                      </div>
                      <div className="p-2 rounded bg-amber-950/50 border border-amber-800/40">
                        <div className="font-cinzel font-bold text-[11px] text-amber-300">3. Futuro</div>
                        <div>{record.spreadData.futureCard.name}</div>
                      </div>
                    </div>
                    {record.spreadData.synthesis && (
                      <p className="italic text-purple-300/90 leading-relaxed bg-[#0a0514] p-3 rounded-lg border border-purple-900/40">
                        {record.spreadData.synthesis}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-purple-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-cinzel text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Cerrar Grimorio
          </button>
        </div>
      </div>
    </div>
  );
};
