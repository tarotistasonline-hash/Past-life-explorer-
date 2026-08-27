import React, { createContext, useContext, useState, useEffect } from "react";
import { SupportedLanguage } from "../types";
import { TRANSLATIONS, TranslationDictionary, LANGUAGE_OPTIONS } from "../lib/translations";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof TranslationDictionary) => string;
  options: typeof LANGUAGE_OPTIONS;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem("ouija_language") as SupportedLanguage;
      if (saved && TRANSLATIONS[saved]) {
        return saved;
      }
      // Detect browser language
      const browserLang = navigator.language?.slice(0, 2).toLowerCase();
      if (browserLang && (browserLang === "es" || browserLang === "en" || browserLang === "pt" || browserLang === "fr" || browserLang === "it" || browserLang === "de")) {
        return browserLang as SupportedLanguage;
      }
    } catch {
      // ignore
    }
    return "es";
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("ouija_language", lang);
    } catch {
      // ignore
    }
  };

  const t = (key: keyof TranslationDictionary): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.es;
    return dict[key] || TRANSLATIONS.es[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, options: LANGUAGE_OPTIONS }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
