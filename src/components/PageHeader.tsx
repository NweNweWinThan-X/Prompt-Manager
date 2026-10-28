"use client";

import { useTranslation } from '../lib/i18n';

interface PageHeaderProps {
  titleKey: string;
  subtitleKey?: string;
  // Shown until the translations arrive — t() returns the raw key before then,
  // and "ui.all_prompts" flashing on screen looks broken.
  fallbackTitle: string;
  fallbackSubtitle?: string;
}

/**
 * Page heading for the server-rendered pages.
 *
 * A React Server Component cannot call the useTranslation hook, so a page that
 * wants its heading to follow the language switcher renders this instead of
 * writing the text inline.
 */
export default function PageHeader({
  titleKey,
  subtitleKey,
  fallbackTitle,
  fallbackSubtitle,
}: PageHeaderProps) {
  const { t, isLoaded } = useTranslation();

  const title = isLoaded ? t(titleKey) : fallbackTitle;
  const subtitle = subtitleKey
    ? (isLoaded ? t(subtitleKey) : fallbackSubtitle)
    : undefined;

  return (
    <section className="page-header">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </section>
  );
}
