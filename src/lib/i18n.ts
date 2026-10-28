import { useLanguage } from '../context/LanguageContext';
import { withBasePath } from '../config/site';
import { FALLBACK_LOCALE, SUPPORTED_LOCALES } from '../config/languages';
import { useEffect, useState } from 'react';

// Looser types for translation data
type TranslationValue = string | Record<string, any>;
type TranslationsType = Record<string, Record<string, any>>;
type LoadedStateType = Record<string, Record<string, boolean>>;
type LoadingPromisesType = Record<string, Record<string, Promise<any> | undefined>>;

// Cache of translation strings, filled in per locale as they load
const translations: TranslationsType = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [locale, {}])
);

// Tracks which translations have been loaded
const loadedTranslations: LoadedStateType = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [locale, {}])
);

// In-flight translation loads
const loadingPromises: LoadingPromisesType = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [locale, {}])
);

// Preload a translation
export const loadTranslation = async (locale: string, namespace: string = 'common') => {
  // Translation files are fetched by relative path, so they only load in the browser;
  // fetching a relative URL during server rendering throws ERR_INVALID_URL
  if (typeof window === 'undefined') {
    return {};
  }

  // If this translation is already loading, return the existing promise
  const currentPromise = loadingPromises[locale]?.[namespace];
  if (currentPromise !== undefined) {
    return currentPromise;
  }

  // If it has already loaded and has content, return it directly
  if (loadedTranslations[locale]?.[namespace] === true && 
      translations[locale]?.[namespace] && 
      Object.keys(translations[locale][namespace]).length > 0) {
    return translations[locale][namespace];
  }

  // Make sure the cache objects exist
  if (!translations[locale]) translations[locale] = {};
  if (!loadedTranslations[locale]) loadedTranslations[locale] = {};
  if (!loadingPromises[locale]) loadingPromises[locale] = {};

  // Create the loading promise
  const loadPromise = (async () => {
    try {
      // Fetch the translation file from static assets, with a cache-busting parameter
      const timestamp = new Date().getTime();
      const response = await fetch(withBasePath(`/locales/${locale}/${namespace}.json?_=${timestamp}`), {
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch translation file: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data || Object.keys(data).length === 0) {
        throw new Error('Translation data is empty');
      }
      
      translations[locale][namespace] = data;
      loadedTranslations[locale][namespace] = true;
      
      console.log(`Successfully loaded translation for ${locale}/${namespace}`);
      return data;
    } catch (error) {
      console.error(`Failed to load translation for ${locale}/${namespace}`, error);
      // Clear the loading state so the next call can retry
      loadingPromises[locale][namespace] = undefined;
      throw error;
    }
  })();

  // Store the promise reference
  loadingPromises[locale][namespace] = loadPromise;
  
  try {
    return await loadPromise;
  } finally {
    // Clear the promise reference once it settles
    loadingPromises[locale][namespace] = undefined;
  }
};

// Force a translation to reload
export const reloadTranslation = async (locale: string, namespace: string = 'common') => {
  if (loadedTranslations[locale]?.[namespace] === true) {
    loadedTranslations[locale][namespace] = false;
  }
  
  // Reset the loading promise
  if (loadingPromises[locale]) {
    loadingPromises[locale][namespace] = undefined;
  }
  
  return loadTranslation(locale, namespace);
};

// Translation hook for use in components
export const useTranslation = (namespace: string = 'common') => {
  const { locale, isChangingLanguage } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Whenever the locale changes, make sure its translation is loaded (plus English as the fallback)
    const ensureTranslationLoaded = async () => {
      try {
        if (locale !== FALLBACK_LOCALE) {
          loadTranslation(FALLBACK_LOCALE, namespace).catch(() => undefined);
        }
        await loadTranslation(locale, namespace);
        setIsLoaded(true);
      } catch (error) {
        console.error(`Failed to load translation in useEffect: ${locale}/${namespace}`, error);
      }
    };

    ensureTranslationLoaded();
  }, [locale, namespace]);

  // Look a key up in a given locale's translations, returning undefined if it is missing
  const lookup = (lang: string, key: string): string | undefined => {
    let value: any = translations[lang]?.[namespace];

    for (const k of key.split('.')) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }

    return typeof value === 'string' ? value : undefined;
  };

  const t = (key: string, params?: Record<string, string>) => {
    // If the translation has not loaded yet, kick off the load and return the key
    if (!translations[locale] || 
        !translations[locale][namespace] || 
        isChangingLanguage) {
      
      // Check whether a load is already in flight
      const currentPromise = loadingPromises[locale]?.[namespace];
      if (!currentPromise) {
        // Load the translation asynchronously
        setTimeout(() => loadTranslation(locale, namespace), 0);
      }
      return key;
    }

    // Handle nested keys such as 'nav.home'; fall back to English when the current locale lacks the key
    const value = lookup(locale, key) ?? lookup(FALLBACK_LOCALE, key);

    if (value === undefined) {
      // If the key does not exist, return the key itself
      return key;
    }

    // Apply interpolation parameters
    if (params) {
      return Object.entries(params).reduce(
        (str: string, [paramKey, paramValue]) => 
          str.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue),
        value as string
      );
    }

    return value;
  };

  return { t, isLoaded };
}; 