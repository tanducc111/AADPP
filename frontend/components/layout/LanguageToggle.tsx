"use client";

import { Globe2 } from "lucide-react";

import type { AppLanguage } from "@/constants/i18n";
import { useLanguage } from "@/hooks/useLanguage";

export function LanguageToggle() {
  const { language, setLanguage, translate } = useLanguage();
  const nextLanguage: AppLanguage = language === "en" ? "vi" : "en";
  const languageLabel = language === "en" ? "ENG" : "VIE";

  return (
    <button
      aria-label={translate("language")}
      className="inline-flex h-10 items-center gap-1.5 rounded-md border border-input bg-white/80 px-3 font-mono text-xs font-bold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:text-primary"
      onClick={() => setLanguage(nextLanguage)}
      title={translate("language")}
      type="button"
    >
      <Globe2 className="h-4 w-4 text-primary" aria-hidden="true" />
      {languageLabel}
    </button>
  );
}
