"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PromptData } from '@/types';
import { useTranslation } from '../lib/i18n';
import { useLanguage } from '../context/LanguageContext';
import PromptActions from '@/components/PromptActions';
import { getCategoryNameKey } from '@/config/categories';

interface PromptDetailContentProps {
    prompt: PromptData;
}

export default function PromptDetailContent({ prompt }: PromptDetailContentProps) {
    const { locale } = useLanguage();
    const { t, isLoaded } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [needsToggle, setNeedsToggle] = useState(false);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

    useEffect(() => {
        if (isLoaded) {
            setLoading(false);
        }
    }, [isLoaded]);

    // Work out whether the content needs an expand/collapse button
    useEffect(() => {
        if (contentRef.current) {
            // Show the expand/collapse button when the content overflows its container
            const checkOverflow = () => {
                if (contentRef.current) {
                    const isOverflowing = contentRef.current.scrollHeight > contentRef.current.clientHeight;
                    setNeedsToggle(isOverflowing);
                }
            };

            // Initial check
            checkOverflow();

            // Re-check when the window is resized
            window.addEventListener('resize', checkOverflow);

            return () => {
                window.removeEventListener('resize', checkOverflow);
            };
        }
    }, [loading, prompt.content]);

    // Watch scrolling to detect when the content is scrolled to the bottom
    useEffect(() => {
        const contentElement = contentRef.current;
        if (!contentElement) return;

        const handleScroll = () => {
            if (contentElement) {
                // At the bottom? (2px tolerance)
                const scrollPosition = contentElement.scrollHeight - contentElement.scrollTop - contentElement.clientHeight;
                const isAtBottom = scrollPosition < 2;

                // Only update on a real change, to avoid needless re-renders
                if (isAtBottom !== isScrolledToBottom) {
                    setIsScrolledToBottom(isAtBottom);
                }
            }
        };

        contentElement.addEventListener('scroll', handleScroll);

        // Initial check
        handleScroll();

        return () => {
            contentElement.removeEventListener('scroll', handleScroll);
        };
    }, [isScrolledToBottom]);

    // Toggle between expanded and collapsed
    const toggleContent = () => {
        setIsExpanded(!isExpanded);
        // Reset the scroll state
        setIsScrolledToBottom(false);
    };

    // Decide how to display the category name
    const categoryKey = getCategoryNameKey(prompt.category);
    const categoryName = categoryKey ? t(categoryKey) : prompt.category;

    // Format a date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return locale === 'zh'
                ? date.toLocaleDateString('zh-CN')
                : date.toLocaleDateString('en-US');
        } catch (e) {
            return dateString;
        }
    };

    if (loading) {
        return (
            <main className="prompt-detail">
                <section className="prompt-header">
                    <Link href="/prompts" className="back-link skeleton" prefetch={true}>
                        <i className="fa-solid fa-arrow-left"></i> ...
                    </Link>
                    <h1 className="skeleton">...</h1>
                    <div className="prompt-meta">
                        <span className="category skeleton">...</span>
                        <span className="popularity skeleton">...</span>
                        <span className="date skeleton">...</span>
                    </div>
                </section>

                <section className="prompt-content">
                    <div className="description">
                        <h2 className="skeleton">...</h2>
                        <p className="skeleton">...</p>
                    </div>

                    <div className="content">
                        <h2 className="skeleton">...</h2>
                        <div className="markdown-content skeleton">...</div>
                    </div>

                    <div className="usage">
                        <h2 className="skeleton">...</h2>
                        <p className="skeleton">...</p>
                    </div>
                </section>

                <section className="prompt-actions">
                    <button className="copy-button skeleton" disabled>
                        <i className="fa-solid fa-copy"></i> ...
                    </button>
                    <button className="share-button skeleton" disabled>
                        <i className="fa-solid fa-share-nodes"></i> ...
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="prompt-detail">
            <section className="prompt-header">
                <Link href="/prompts" className="back-link" prefetch={true}>
                    <i className="fa-solid fa-arrow-left"></i> {t('ui.back_to_all_prompts')}
                </Link>
                <h1>{prompt.title}</h1>
                <div className="prompt-meta">
                    <span className="category">{categoryName}</span>
                    {prompt.rating && (
                        <span className="popularity">
                            <i className="fa-solid fa-star"></i> {prompt.rating}
                        </span>
                    )}
                    {prompt.createdAt && (
                        <span className="date">
                            {t('prompt_card.created')}: {formatDate(prompt.createdAt)}
                        </span>
                    )}
                </div>
            </section>

            <section className="prompt-content">
                <div className="description">
                    <h2>{t('prompt_detail.description')}</h2>
                    <p>{prompt.description}</p>
                </div>

                <div className="content">
                    <h2>{t('prompt_detail.content')}</h2>
                    <div className="content-container">
                        <div
                            ref={contentRef}
                            className={`markdown-content ${isExpanded ? 'expanded' : ''} ${isScrolledToBottom && !isExpanded ? 'scrolled-bottom' : ''}`}
                            dangerouslySetInnerHTML={{ __html: prompt.content || '' }}
                        />
                        {!isExpanded && <div className={`content-mask ${isScrolledToBottom ? 'hidden' : ''}`}></div>}
                    </div>
                    {needsToggle && (
                        <div className="content-toggle">
                            <button
                                onClick={toggleContent}
                                className={isExpanded ? 'expanded' : ''}
                                data-expanded={isExpanded}
                            >
                                <span>{isExpanded ? t('ui.collapse') : t('ui.expand')}</span>
                                {isExpanded ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="18 15 12 9 6 15"></polyline>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                <div className="usage">
                    <h2>{t('prompt_detail.usage')}</h2>
                    <p>{t('prompt_detail.usage_text')}</p>
                </div>
            </section>

            <PromptActions prompt={prompt} />
        </main>
    );
} 