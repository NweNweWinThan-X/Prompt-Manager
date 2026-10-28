"use client";
import { useState, useEffect } from 'react';
import { PromptData } from '@/types';
import PromptCard from './PromptCard';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { withBasePath } from '@/config/site';
import { useTranslation } from '../lib/i18n';

interface PaginationMeta {
    total: number;
    perPage: number;
    totalPages: number;
    category?: string;
}

interface PaginatedPromptsProps {
    type: 'all' | 'category';
    category?: string;
    initialPage?: number;
    initialData?: PromptData[];
    initialMeta?: PaginationMeta;
}

export default function PaginatedPrompts({
    type,
    category,
    initialPage = 1,
    initialData,
    initialMeta
}: PaginatedPromptsProps) {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [loading, setLoading] = useState(false);
    const [prompts, setPrompts] = useState<PromptData[]>(initialData || []);
    const [meta, setMeta] = useState<PaginationMeta | null>(initialMeta || null);
    const [error, setError] = useState<string | null>(null);

    const { t } = useTranslation();

    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Keep the current page in sync with the URL's page param
    useEffect(() => {
        const pageParam = searchParams.get('page');
        if (pageParam) {
            const pageNumber = parseInt(pageParam, 10);
            if (!isNaN(pageNumber) && pageNumber > 0) {
                setCurrentPage(pageNumber);
            }
        } else {
            setCurrentPage(1);
        }
    }, [searchParams]);

    // Reload data whenever the type, category or page changes
    useEffect(() => {
        // Nothing to fetch if we already have the initial data for the first page
        if (initialData && initialMeta && currentPage === initialPage) {
            return;
        }

        async function fetchPageData() {
            setLoading(true);
            setError(null);

            try {
                // Base path for the paginated data files
                const basePath = withBasePath('/data/paginated');

                // Build the concrete path for this type
                let dataPath;
                if (type === 'category' && category) {
                    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
                    dataPath = `${basePath}/categories/${categorySlug}/page-${currentPage}.json`;

                    // Fetch the metadata first if we don't have it yet
                    if (!meta) {
                        const metaResponse = await fetch(`${basePath}/categories/${categorySlug}/meta.json`, { cache: 'no-store' });
                        if (!metaResponse.ok) {
                            throw new Error(`Failed to fetch category metadata: ${metaResponse.status}`);
                        }
                        const metaData = await metaResponse.json();
                        setMeta(metaData);
                    }
                } else {
                    dataPath = `${basePath}/all-prompts-page-${currentPage}.json`;

                    // Fetch the metadata first if we don't have it yet
                    if (!meta) {
                        const metaResponse = await fetch(`${basePath}/all-prompts-meta.json`, { cache: 'no-store' });
                        if (!metaResponse.ok) {
                            throw new Error(`Failed to fetch prompt metadata: ${metaResponse.status}`);
                        }
                        const metaData = await metaResponse.json();
                        setMeta(metaData);
                    }
                }

                // Fetch the current page
                const response = await fetch(dataPath, { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error(`Failed to fetch data for page ${currentPage}: ${response.status}`);
                }

                const pageData = await response.json();
                setPrompts(pageData);
            } catch (err) {
                console.error('Error loading paginated data:', err);
                setError(t('ui.load_failed'));
            } finally {
                setLoading(false);
            }
        }

        fetchPageData();
    }, [type, category, currentPage, initialData, initialMeta, initialPage, meta]);

    // Build a pagination URL
    const buildPageUrl = (page: number) => {
        // Start a fresh URLSearchParams
        const params = new URLSearchParams();

        // Copy every param from the current searchParams
        searchParams.forEach((value, key) => {
            params.set(key, value);
        });

        // Set the new page number
        params.set('page', page.toString());

        return `${pathname}?${params.toString()}`;
    };

    // Build the list of page numbers shown in the pagination nav
    const generatePageNumbers = () => {
        if (!meta) return [];

        const totalPages = meta.totalPages;
        const currentPageNum = currentPage;

        // 5 pages or fewer: show them all
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Otherwise show the pages around the current one
        let startPage = Math.max(currentPageNum - 1, 1);
        let endPage = Math.min(startPage + 2, totalPages);

        if (endPage - startPage < 2) {
            startPage = Math.max(endPage - 2, 1);
        }

        const pages = [];

        // Always show the first page
        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) {
                pages.push('ellipsis');
            }
        }

        // The middle page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Always show the last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push('ellipsis');
            }
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="paginated-prompts">
            {loading ? (
                <div className="loading-container">
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>{t('ui.loading')}</p>
                    </div>
                </div>
            ) : error ? (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-button">
                        {t('ui.try_again')}
                    </button>
                </div>
            ) : (
                <>
                    {/* Prompt list */}
                    {prompts.length > 0 ? (
                        <div className="prompt-grid">
                            {prompts.map(prompt => (
                                <PromptCard
                                    key={prompt.slug}
                                    prompt={prompt}
                                    featured={prompt.featured}
                                    isNew={prompt.isNew}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>{t('ui.no_data')}</p>
                        </div>
                    )}

                    {/* Page indicator above the list on mobile */}
                    {meta && meta.totalPages > 1 && (
                        <div className="mobile-page-indicator">
                            <span className="current-page">{currentPage}</span>
                            <span className="page-separator">/</span>
                            <span className="total-pages">{meta.totalPages}</span>
                        </div>
                    )}

                    {/* Pagination controls */}
                    {meta && meta.totalPages > 1 && (
                        <div className="pagination-controls">
                            {/* Previous page */}
                            {currentPage > 1 ? (
                                <Link
                                    href={buildPageUrl(currentPage - 1)}
                                    className="pagination-button"
                                >
                                    <i className="fa-solid fa-chevron-left"></i> {t('pagination.previous')}
                                </Link>
                            ) : (
                                <span className="pagination-button disabled">
                                    <i className="fa-solid fa-chevron-left"></i> {t('pagination.previous')}
                                </span>
                            )}

                            {/* Desktop page-number nav */}
                            <div className="desktop-page-numbers">
                                {generatePageNumbers().map((pageNum, index) =>
                                    pageNum === 'ellipsis' ? (
                                        <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>
                                    ) : (
                                        <Link
                                            key={pageNum}
                                            href={buildPageUrl(pageNum as number)}
                                            className={`page-number ${pageNum === currentPage ? 'active' : ''}`}
                                        >
                                            {pageNum}
                                        </Link>
                                    )
                                )}
                            </div>

                            {/* Page indicator again, below the list - shown on desktop */}
                            <div className="page-indicators desktop-only">
                                <span className="current-page">{currentPage}</span>
                                <span className="page-separator">/</span>
                                <span className="total-pages">{meta.totalPages}</span>
                            </div>

                            {/* Next page */}
                            {currentPage < meta.totalPages ? (
                                <Link
                                    href={buildPageUrl(currentPage + 1)}
                                    className="pagination-button"
                                >
                                    {t('pagination.next')} <i className="fa-solid fa-chevron-right"></i>
                                </Link>
                            ) : (
                                <span className="pagination-button disabled">
                                    {t('pagination.next')} <i className="fa-solid fa-chevron-right"></i>
                                </span>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 