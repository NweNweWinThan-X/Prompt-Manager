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

    // 确保组件挂载后加载当前语言的翻译
    useEffect(() => {
        loadTranslation(locale).catch((error) => {
            console.error('Failed to prepare translations:', error);
        });
    }, [locale]);

    // 点击外部关闭下拉菜单
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
            // 在切换前重新加载目标语言翻译，确保获取最新版本
            await reloadTranslation(newLocale);
            changeLanguage(newLocale);
        } catch (error) {
            console.error(`Failed to switch to language ${newLocale}:`, error);
            // 即使出错也尝试切换
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
                <i className="fa-solid fa-globe"></i>
                <span>{current.shortLabel}</span>
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
                                {lang.nativeName}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
