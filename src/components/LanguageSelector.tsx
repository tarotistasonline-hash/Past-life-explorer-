import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Globe, ChevronDown, Check } from "lucide-react";
import { SupportedLanguage } from "../types";

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { language, setLanguage, options, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = (options && options.find((o) => o.code === language)) || (options && options[0]) || { code: "es", flag: "🇪🇸", nativeName: "Español", label: "Español" };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center space-x-1" ref={dropdownRef}>
      {/* Quick 1-click Language Pills for Easy Access on md+ screens */}
      {!compact && (
        <div className="hidden lg:flex items-center bg-black/40 border border-purple-900/60 rounded-xl p-0.5 space-x-0.5 shadow-inner">
          {options.map((opt) => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                onClick={() => setLanguage(opt.code)}
                title={`${opt.nativeName} (${opt.label})`}
                className={`px-2 py-1 rounded-lg text-xs font-cinzel transition flex items-center space-x-1 cursor-pointer ${
                  isSelected
                    ? "bg-purple-900/90 text-purple-100 font-bold border border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.35)]"
                    : "text-purple-300/70 hover:text-purple-100 hover:bg-purple-950/50"
                }`}
              >
                <span className="text-xs leading-none">{opt.flag}</span>
                <span className="text-[10px] uppercase font-semibold">{opt.code}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Dropdown Menu Trigger */}
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title={t("languageSelect")}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-purple-800/60 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 text-xs font-gothic transition cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.15)] group ${
            isOpen ? "ring-1 ring-purple-400 bg-purple-900/80 text-purple-100" : ""
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-sm leading-none">{currentOption.flag}</span>
          <span className="font-medium uppercase tracking-wider text-[11px] text-purple-100">
            {currentOption.code.toUpperCase()}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-purple-400 transition-transform duration-200 group-hover:text-purple-200 ${
              isOpen ? "rotate-180 text-purple-200" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-[#0e071c] border border-purple-500/40 p-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl z-50 animate-fade-in divide-y divide-purple-900/40">
            <div className="px-2.5 py-1.5 text-[10px] uppercase font-cinzel font-bold text-purple-400 tracking-widest flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>{t("languageSelect")}</span>
            </div>

            <div className="pt-1 space-y-0.5">
              {options.map((opt) => {
                const isSelected = opt.code === language;
                return (
                  <button
                    key={opt.code}
                    onClick={() => handleSelect(opt.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-gothic transition cursor-pointer ${
                      isSelected
                        ? "bg-purple-900/70 text-purple-100 font-semibold border border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                        : "text-purple-300/90 hover:bg-purple-950/80 hover:text-purple-100"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-base leading-none">{opt.flag}</span>
                      <span className="text-xs font-medium">{opt.nativeName}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-300" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
