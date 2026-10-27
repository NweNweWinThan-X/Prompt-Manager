"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from '../lib/i18n';
import { loadTranslation } from '../lib/i18n';
import { useLanguage } from '../context/LanguageContext';
import { REPO_ISSUES_URL, REPO_README_URL, REPO_URL } from '../config/site';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadError, setIsLoadError] = useState(false);
  const { locale, isChangingLanguage } = useLanguage();
  const { t, isLoaded: translationsLoaded } = useTranslation();

  useEffect(() => {
    // 更新加载状态
    if (translationsLoaded) {
      setIsLoaded(true);
      setIsLoadError(false);
    }
  }, [translationsLoaded]);

  // 如果出错，显示简化版页脚
  if (isLoadError) {
    return (
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            Prompt<span>Library</span>
          </div>
          <div className="footer-bottom">
            <p>© {currentYear} PromptLibrary.</p>
          </div>
        </div>
      </footer>
    );
  }

  // 如果仍在加载中，显示简化版页脚
  if (!isLoaded) {
    return (
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            Prompt<span>Library</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          Prompt<span>Library</span>
        </div>

        <div className="footer-links">
          <div className="footer-links-section">
            <h4>{t('footer.navigation')}</h4>
            <div className="footer-links-items">
              <Link href="/">{t('nav.home')}</Link>
              <Link href="/categories">{t('nav.categories')}</Link>
              <Link href="/prompts/popular">{t('nav.popular')}</Link>
              <Link href="/about">{t('nav.about')}</Link>
            </div>
          </div>

          <div className="footer-links-section">
            <h4>{t('footer.resources')}</h4>
            <div className="footer-links-items">
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">{t('footer.github_repo')}</a>
              <a href={REPO_ISSUES_URL} target="_blank" rel="noopener noreferrer">{t('footer.feedback')}</a>
              <a href={REPO_README_URL} target="_blank" rel="noopener noreferrer">{t('footer.documentation')}</a>
            </div>
          </div>

          <div className="footer-links-section">
            <h4>{t('footer.legal')}</h4>
            <div className="footer-links-items">
              <Link href="/terms">{t('footer.terms')}</Link>
              <Link href="/privacy">{t('footer.privacy')}</Link>
              <Link href="/cookies">{t('footer.cookies')}</Link>
            </div>
          </div>
        </div>

        <div className="footer-social">
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <i className="fa-brands fa-github"></i>
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} PromptLibrary. {t('footer.rights')}</p>
      </div>
    </footer>
  );
}