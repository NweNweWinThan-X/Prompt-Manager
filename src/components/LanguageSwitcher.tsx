"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { loadTranslation, reloadTranslation } from '../lib/i18n';
import { LANGUAGES } from '../config/languages';

export default function LanguageSwitcher() {
    const { locale, changeLanguage, isChangingLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const { t, isLoaded } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);

    // Load the current language's translations once the component is mounted
    useEffect(() => {
        loadTranslation(locale).catch((error) => {
            console.error('Failed to prepare translations:', error);
        });
    }, [locale]);

    // Close the dropdown on an outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleLanguageChange = useCallback(async (newLocale: string) => {
        setIsOpen(false);
        if (newLocale === locale || isChangingLanguage) return;

        try {
            // Reload the target language's translations first, so we switch to the latest version
            await reloadTranslation(newLocale);
            changeLanguage(newLocale);
        } catch (error) {
            console.error(`Failed to switch to language ${newLocale}:`, error);
            // Switch anyway, even if that failed
            changeLanguage(newLocale);
        }
    }, [locale, changeLanguage, isChangingLanguage]);

    const current = LANGUAGES.find((lang) => lang.code === locale) ?? LANGUAGES[0];

    return (
        <div className="language-switcher" ref={containerRef}>
            <button
                type="button"
                className="language-trigger"
                onClick={() => setIsOpen((open) => !open)}
                disabled={isChangingLanguage}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={isLoaded ? t('language.select') : 'Select language'}
            >
                <span className={`fi fi-${current.flag}`} aria-hidden="true"></span>
                <span className="language-code">{current.shortLabel}</span>
            </button>
            {isOpen && (
                <ul className="language-menu" role="listbox">
                    {LANGUAGES.map((lang) => (
                        <li key={lang.code}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={lang.code === locale}
                                className={lang.code === locale ? 'active' : ''}
                                onClick={() => handleLanguageChange(lang.code)}
                                disabled={isChangingLanguage}
                            >
                                <span className={`fi fi-${lang.flag}`} aria-hidden="true"></span>
                                <span className="language-name">{lang.nativeName}</span>
                                <span className="language-code">{lang.shortLabel}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
