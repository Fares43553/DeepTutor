import i18n, { type Resource } from "i18next";
import { initReactI18next } from "react-i18next";

// Static imports for English (default, always loaded)
import enApp from "@/locales/en/app.json";

// Caching system for dynamically loaded resources
class LocaleCache {
  private cache: Map<string, any> = new Map();
  private loading: Map<string, Promise<any>> = new Map();
  
  constructor() {
    // Pre-populate with English
    this.cache.set("en", { app: enApp });
  }
  
  isLoaded(language: string): boolean {
    return this.cache.has(language);
  }
  
  async get(language: string): Promise<any> {
    // Return from cache if available
    if (this.cache.has(language)) {
      return this.cache.get(language);
    }
    
    // Return existing promise if already loading
    if (this.loading.has(language)) {
      return this.loading.get(language);
    }
    
    // Start new load
    const promise = this.load(language);
    this.loading.set(language, promise);
    
    try {
      const result = await promise;
      this.cache.set(language, result);
      return result;
    } finally {
      this.loading.delete(language);
    }
  }
  
  private async load(language: string): Promise<any> {
    try {
      let localeModule;
      if (language === "zh") {
        localeModule = await import("@/locales/zh/app.json");
      } else if (language === "ar") {
        localeModule = await import("@/locales/ar/app.json");
      } else {
        localeModule = await import("@/locales/en/app.json");
      }
      
      const appData = localeModule.default || localeModule;
      return { app: appData };
    } catch (error) {
      console.error(`Failed to load language resource for ${language}:`, error);
      // Fallback to English
      return this.cache.get("en");
    }
  }
}

const localeCache = new LocaleCache();

export type AppLanguage = "en" | "zh" | "ar";

export function normalizeLanguage(lang: unknown): AppLanguage {
  if (!lang) return "en";
  const s = String(lang).toLowerCase();
  if (s === "zh" || s === "cn" || s === "chinese") return "zh";
  if (s === "ar" || s === "arabic") return "ar";
  return "en";
}

/**
 * Add a language resource to i18n.
 * Used when switching languages dynamically.
 */
async function ensureLanguageLoaded(language: AppLanguage): Promise<void> {
  if (localeCache.isLoaded(language) && i18n.hasResourceBundle(language, "app")) {
    return; // Already loaded and added
  }

  try {
    const resource = await localeCache.get(language);
    if (resource && !i18n.hasResourceBundle(language, "app")) {
      i18n.addResourceBundle(language, "app", resource.app, true, true);
    }
  } catch (error) {
    console.error(`Failed to ensure language ${language} is loaded:`, error);
    // Fallback to English
    if (!i18n.hasResourceBundle(language, "app")) {
      const enResource = await localeCache.get("en");
      i18n.addResourceBundle(language, "app", enResource.app, true, true);
    }
  }
}

let _initialized = false;

export function initI18n(language?: unknown) {
  if (_initialized) return i18n;

  const initialLanguage = normalizeLanguage(language);

  // Start with English as the base resource
  const resources: Resource = {
    en: { app: enApp },
  };

  i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: "en",
    // Use a single default namespace to keep lookups simple.
    // We intentionally keep keySeparator disabled so keys like "Generating..." remain valid.
    defaultNS: "app",
    ns: ["app"],
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
    returnNull: false,
  });

  _initialized = true;

  // If initial language is not English, ensure it's loaded in the background
  if (initialLanguage !== "en") {
    ensureLanguageLoaded(initialLanguage).catch((err) => {
      console.warn(`Failed to preload ${initialLanguage}:`, err);
    });
  }

  return i18n;
}

/**
 * Change the active language.
 * Loads the language resource dynamically if not already loaded.
 * Should be called from language selector components.
 */
export async function changeLanguage(language: AppLanguage): Promise<void> {
  await ensureLanguageLoaded(language);
  await i18n.changeLanguage(language);
}
