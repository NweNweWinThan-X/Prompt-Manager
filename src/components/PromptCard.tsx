"use client";

import Link from 'next/link';
import { PromptData } from '@/types';
import { useTranslation } from '../lib/i18n';
import { useLanguage } from '../context/LanguageContext';
import { getCategoryNameKey } from '@/config/categories';

interface PromptCardProps {
  prompt: PromptData;
  featured?: boolean;
  isNew?: boolean;
}

export default function PromptCard({ prompt, featured = false, isNew = false }: PromptCardProps) {
  const { locale } = useLanguage();
  const { t } = useTranslation();

  // Decide how to display the category name
  const categoryKey = getCategoryNameKey(prompt.category);
  const categoryName = categoryKey ? t(categoryKey) : prompt.category;

  // Render the labels
  const renderLabels = () => {
    if (featured && isNew) {
      // Both featured and new: show a combined label
      return (
        <div className="prompt-label combined">
          <span className="new-part">{t('prompt_card.new')}</span>
          <span className="featured-part">{t('prompt_card.featured')}</span>
        </div>
      );
    } else if (featured) {
      // featured only
      return <div className="prompt-label">{t('prompt_card.featured')}</div>;
    } else if (isNew) {
      // new only
      return <div className="prompt-label new">{t('prompt_card.new')}</div>;
    }
    return null;
  };

  return (
    <div className={`prompt-card ${featured ? 'featured' : ''}`}>
      {renderLabels()}
      <h3>{prompt.title}</h3>
      <p>{prompt.description}</p>
      <div className="prompt-meta">
        <span className="category">{categoryName}</span>
        {prompt.rating && (
          <span className="popularity">
            <i className="fa-solid fa-star"></i> {prompt.rating}
          </span>
        )}
        {prompt.createdAt && (
          <span className="date">{prompt.createdAt}</span>
        )}
      </div>
      <Link href={`/prompts/${prompt.slug}`} className="view-button" prefetch={true}>
        {t('prompt_card.view_button')}
      </Link>
    </div>
  );
}