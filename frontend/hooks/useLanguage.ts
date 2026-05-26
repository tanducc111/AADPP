"use client";

import { useContext } from "react";

import { LanguageContext } from "@/components/providers/LanguageProvider";

export function useLanguage() {
  const languageContext = useContext(LanguageContext);

  if (!languageContext) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }

  return languageContext;
}
