"use client";

import { useEffect } from "react";
import i18n from "i18next";

import { initI18n, normalizeLanguage, changeLanguage, type AppLanguage } from "./init";

export function I18nProvider({
  language,
  children,
}: {
  language: AppLanguage | string;
  children: React.ReactNode;
}) {
  // Ensure initialized on client once
  initI18n(language);

  useEffect(() => {
    const nextLang = normalizeLanguage(language);
    if (i18n.language !== nextLang) {
      // Use the new lazy-loading changeLanguage function
      changeLanguage(nextLang).catch((err) => {
        console.error("Failed to change language:", err);
        // Fallback: change language without lazy-loading
        i18n.changeLanguage(nextLang);
      });
    }

    // Keep <html lang="..."> and dir="..." in sync for accessibility & RTL support
    if (typeof document !== "undefined") {
      document.documentElement.lang = nextLang;
      document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
    }
  }, [language]);

  return children;
}
