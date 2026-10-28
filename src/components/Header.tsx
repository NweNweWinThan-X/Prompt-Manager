"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '../lib/i18n';
import { loadTranslation } from '../lib/i18n';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadError, setIsLoadError] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { locale, isChangingLanguage } = useLanguage();
  const { t, isLoaded: translationsLoaded } = useTranslation();

  useEffect(() => {
    // Update the loading state
    if (translationsLoaded) {
      setIsLoaded(true);
      setIsLoadError(false);
    }
  }, [translationsLoaded]);

  useEffect(() => {
    // Theme: <html data-theme> is the source of truth (layout.tsx sets it before first paint)
    const current = document.documentElement.getAttribute('data-theme');
    setDarkMode(
      current
        ? current === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    // Follow the system preference until the user picks a theme by hand
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', event.matches ? 'dark' : 'light');
        setDarkMode(event.matches);
      }
    };
    media.addEventListener('change', handleSystemChange);

    // Detect mobile devices
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkIfMobile();

    // Watch for window resizes
    window.addEventListener('resize', checkIfMobile);

    // Clean up the listeners
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      media.removeEventListener('change', handleSystemChange);
    };
  }, []);

  const toggleTheme = () => {
    const next = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);
    // Every colour comes from a token on data-theme, so just flip the attribute
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Lock / unlock background scrolling
    if (!mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const handleSearchClick = () => {
    router.push('/search');
    if (mobileMenuOpen) {
      toggleMobileMenu();
    }
  };

  const handleNavLinkClick = () => {
    if (mobileMenuOpen) {
      toggleMobileMenu();
    }
  };

  // On error, fall back to basic navigation
  if (isLoadError) {
    return (
      <header>
        <nav>
          <Link href="/" className="logo">
            Prompt<span>Library</span>
          </Link>
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/prompts/popular">Popular</Link>
            <Link href="/about">About</Link>
          </div>
        </nav>
      </header>
    );
  }

  // While still loading, show a loading indicator or placeholder
  if (!isLoaded) {
    return (
      <header>
        <nav>
          <div className="logo">
            Prompt<span>Library</span>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header>
      <nav>
        <Link href="/" className="logo">
          Prompt<span>Library</span>
        </Link>
        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link
            href="/"
            className={pathname === '/' ? 'active' : ''}
            onClick={handleNavLinkClick}
          >
            {t('nav.home')}
          </Link>
          <Link
            href="/categories"
            className={pathname === '/categories' ? 'active' : ''}
            onClick={handleNavLinkClick}
          >
            {t('nav.categories')}
          </Link>
          <Link
            href="/prompts/popular"
            className={pathname === '/prompts/popular' ? 'active' : ''}
            onClick={handleNavLinkClick}
          >
            {t('nav.popular')}
          </Link>
          <Link
            href="/about"
            className={pathname === '/about' ? 'active' : ''}
            onClick={handleNavLinkClick}
          >
            {t('nav.about')}
          </Link>
        </div>
        <div className="nav-actions">
          <LanguageSwitcher />
          <button onClick={handleSearchClick} className="search-btn">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isLoaded ? t(darkMode ? 'theme.light' : 'theme.dark') : 'Toggle theme'}
            title={isLoaded ? t(darkMode ? 'theme.light' : 'theme.dark') : undefined}
          >
            {/*
              Inline SVG rather than a Font Awesome <i>: the Font Awesome script
              swaps each <i> for an <svg> once, so a class change on re-render
              left the icon showing the previous theme.
            */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {darkMode ? (
                <>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </>
              ) : (
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              )}
            </svg>
          </button>
          {isMobile && (
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}