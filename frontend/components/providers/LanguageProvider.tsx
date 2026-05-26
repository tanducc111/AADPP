"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  LANGUAGE_STORAGE_KEY,
  TRANSLATIONS,
  type AppLanguage,
  type TranslationKey,
} from "@/constants/i18n";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (nextLanguage: AppLanguage) => void;
  translate: (translationKey: TranslationKey) => string;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

type LanguageProviderProps = {
  children: ReactNode;
};

function getInitialLanguage(): AppLanguage {
  if (typeof window === "undefined") {
    return "en";
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  return storedLanguage === "vi" ? "vi" : "en";
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<AppLanguage>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
  }, []);

  const translate = useCallback(
    (translationKey: TranslationKey) => TRANSLATIONS[language][translationKey],
    [language],
  );

  const languageContextValue = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      translate,
    }),
    [language, setLanguage, translate],
  );

  return (
    <LanguageContext.Provider value={languageContextValue}>{children}</LanguageContext.Provider>
  );
}
