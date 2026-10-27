// Supported interface languages. English is the primary language; the others
// are optional translations that fall back to English for missing keys.
export interface LanguageOption {
  code: string;
  // Name of the language written in that language
  nativeName: string;
  // Short label used in the compact switcher
  shortLabel: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', nativeName: 'English', shortLabel: 'EN' },
  { code: 'ja', nativeName: '日本語', shortLabel: 'JA' },
  { code: 'zh', nativeName: '中文', shortLabel: 'ZH' },
  { code: 'my', nativeName: 'မြန်မာ', shortLabel: 'MY' },
];

export const SUPPORTED_LOCALES = LANGUAGES.map((l) => l.code);

export const DEFAULT_LOCALE = 'en';

export const FALLBACK_LOCALE = 'en';

export const isSupportedLocale = (locale: string) =>
  SUPPORTED_LOCALES.includes(locale);
