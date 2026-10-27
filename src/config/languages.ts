// Supported interface languages. English is the primary language; the others
// are optional translations that fall back to English for missing keys.
export interface LanguageOption {
  code: string;
  // Name of the language written in that language
  nativeName: string;
  // Short label used in the compact switcher
  shortLabel: string;
  // ISO 3166-1 alpha-2 country code for the flag icon (flag-icons uses these)
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', nativeName: 'English', shortLabel: 'EN', flag: 'gb' },
  { code: 'ja', nativeName: '日本語', shortLabel: 'JP', flag: 'jp' },
  { code: 'zh', nativeName: '中文', shortLabel: 'CN', flag: 'cn' },
  { code: 'my', nativeName: 'မြန်မာ', shortLabel: 'MM', flag: 'mm' },
];

export const SUPPORTED_LOCALES = LANGUAGES.map((l) => l.code);

export const DEFAULT_LOCALE = 'en';

export const FALLBACK_LOCALE = 'en';

export const isSupportedLocale = (locale: string) =>
  SUPPORTED_LOCALES.includes(locale);
