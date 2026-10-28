"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PromptData } from '@/types';
import PromptCard from '@/components/PromptCard';
import { useTranslation } from '../lib/i18n';
import { useLanguage } from '../context/LanguageContext';
import styles from '@/app/prompts/popular/page.module.css';

interface PopularPromptsContentProps {
    prompts: PromptData[];
}

export default function PopularPromptsContent({ prompts }: PopularPromptsContentProps) {
    const { locale } = useLanguage();
    const { t, isLoaded } = useTranslation();
    const [loading, setLoading] = useState(true);
    // Current sort method
    const [sortMethod, setSortMethod] = useState<'rating' | 'date'>('rating');
    // Creation dates of the 9 most recent prompts
    const [recentPromptDates, setRecentPromptDates] = useState<Date[]>([]);

    useEffect(() => {
        if (isLoaded) {
            setLoading(false);
        }

        // Collect the creation dates of the 9 most recent prompts
        if (prompts.length > 0) {
            const dates = [...prompts]
                .sort((a, b) => {
                    if (a.createdAt && b.createdAt) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }
                    return 0;
                })
                .slice(0, 9)
                .map(p => p.createdAt ? new Date(p.createdAt) : new Date());

            setRecentPromptDates(dates);
        }
    }, [isLoaded, prompts]);

    // Is this prompt one of the new ones?
    const isNewPrompt = (prompt: PromptData) => {
        if (!prompt.createdAt) return false;
        const promptDate = new Date(prompt.createdAt);
        return recentPromptDates.some(date =>
            date.getTime() === promptDate.getTime() ||
            // Allow 1s of slack to work around precision issues
            Math.abs(date.getTime() - promptDate.getTime()) < 1000
        );
    };

    // Sorting
    const sortPrompts = (promptList: PromptData[], sortMethod: 'rating' | 'date'): PromptData[] => {
        try {
            if (sortMethod === 'rating') {
                return [...promptList].sort((a, b) => {
                    if (a.rating !== undefined && b.rating !== undefined) {
                        return b.rating - a.rating; // Descending, highest rated first
                    }
                    // No rating: rated prompts come first
                    if (a.rating !== undefined) return -1;
                    if (b.rating !== undefined) return 1;
                    return 0;
                });
            } else {
                // Sort by date
                return [...promptList].sort((a, b) => {
                    if (a.createdAt && b.createdAt) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }
                    // No date: dated prompts come first
                    if (a.createdAt) return -1;
                    if (b.createdAt) return 1;
                    return 0;
                });
            }
        } catch (error) {
            console.error('排序过程中出错:', error);
            return promptList; // Fall back to the original list on error
        }
    };

    // Handle a change of sort method
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortMethod(e.target.value as 'rating' | 'date');
    };

    // Sort the prompts
    const sortedPrompts = sortPrompts(prompts, sortMethod);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className={styles['page-header']}>
                    <h1 className={styles['page-title']}>...</h1>
                    <p className={styles['page-description']}>...</p>
                </div>

                <div className={`${styles['filter-bar']} skeleton-loading`}>
                    <div className="skeleton"></div>
                </div>

                <div className={`${styles['prompt-grid']} skeleton-loading`}>
                    {[...Array(9)].map((_, index) => (
                        <div key={index} className="prompt-card skeleton"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className={styles['page-header']}>
                <h1 className={styles['page-title']}>{t('popular.title')}</h1>
                <p className={styles['page-description']}>
                    {t('popular.subtitle')}
                </p>
            </div>

            {/* Filter / sort menu */}
            <div className={styles['filter-bar']}>
                <div className={styles['filter-menu']}>
                    <span className={styles['filter-label']}>{t('ui.sort_by')}：</span>
                    <select
                        className={styles['filter-select']}
                        value={sortMethod}
                        onChange={handleSortChange}
                    >
                        <option value="rating">{t('ui.sort_by_popularity')}</option>
                        <option value="date">{t('ui.sort_by_date')}</option>
                    </select>
                </div>
                <div className={styles['results-count']}>{t('search.results_count', { count: sortedPrompts.length.toString() })}</div>
            </div>

            {/* Prompt list */}
            {sortedPrompts.length > 0 ? (
                <div className={styles['prompt-grid']}>
                    {sortedPrompts.slice(0, 9).map((prompt) => (
                        <PromptCard
                            key={prompt.slug}
                            prompt={prompt}
                            featured={prompt.featured}
                            isNew={isNewPrompt(prompt)}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles['empty-state']}>
                    <div className={styles['empty-icon']}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 10H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M15 10H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <p className={styles['empty-title']}>{t('ui.no_popular_prompts')}</p>
                    <p className={styles['empty-description']}>
                        {t('ui.popular_prompts_coming_soon')}
                    </p>
                    <Link href="/prompts" className={styles['view-button']}>
                        {t('ui.browse_all_prompts')}
                    </Link>
                </div>
            )}

            {/* Bottom navigation */}
            <div className={styles.pagination}>
                <Link href="/prompts" className={styles['pagination-link']}>
                    <i className="fa-solid fa-arrow-left"></i> {t('ui.all_prompts')}
                </Link>
                <Link href="/categories" className={styles['pagination-link']}>
                    {t('ui.browse_by_category')} <i className="fa-solid fa-arrow-right"></i>
                </Link>
            </div>
        </div>
    );
} 