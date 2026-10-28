"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { loadTranslation } from '../lib/i18n';
import { DEFAULT_LOCALE, isSupportedLocale } from '../config/languages';

type LanguageContextType = {
    locale: string;
    changeLanguage: (newLocale: string) => void;
    isChangingLanguage: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [locale, setLocale] = useState<string>(DEFAULT_LOCALE);
    const [isChangingLanguage, setIsChangingLanguage] = useState(false);
    const [translationsReady, setTranslationsReady] = useState(false);

    // Load the current language on startup
    useEffect(() => {
        const initializeLanguage = async () => {
            // Use the language saved in localStorage, if there is one
            const savedLocale = localStorage.getItem('language');
            let selectedLocale = DEFAULT_LOCALE;

            if (savedLocale && isSupportedLocale(savedLocale)) {
                selectedLocale = savedLocale;
            } else {
                // Fall back to the browser language
                const browserLocale = navigator.language.split('-')[0];
                if (isSupportedLocale(browserLocale)) {
                    selectedLocale = browserLocale;
                    localStorage.setItem('language', browserLocale);
                } else {
                    // Fall back to the default language
                    localStorage.setItem('language', DEFAULT_LOCALE);
                }
            }

            // Set the initial language
            setLocale(selectedLocale);

            // Preload the translations
            try {
                await loadTranslation(selectedLocale);
                setTranslationsReady(true);
            } catch (err) {
                console.error('Failed to preload translation:', err);
            }
        };

        initializeLanguage();
    }, []);

    // Keep <html lang> in sync with the current language
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    const changeLanguage = async (newLocale: string) => {
        if (isSupportedLocale(newLocale) && newLocale !== locale && !isChangingLanguage) {
            setIsChangingLanguage(true);

            try {
                // Load the translations first, so we know the fetch succeeded
                const data = await loadTranslation(newLocale, 'common');

                // Only change the language once the translations have loaded
                if (data && Object.keys(data).length > 0) {
                    setLocale(newLocale);
                    localStorage.setItem('language', newLocale);
                } else {
                    throw new Error('Translation data is empty');
                }
            } catch (error) {
                console.error(`Failed to load translation for ${newLocale}:`, error);
            } finally {
                setIsChangingLanguage(false);
            }
        }
    };

    return (
        <LanguageContext.Provider value={{ locale, changeLanguage, isChangingLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};
