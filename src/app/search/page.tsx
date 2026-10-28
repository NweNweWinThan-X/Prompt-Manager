"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../lib/i18n';
import { useLanguage } from '../../context/LanguageContext';
import { withBasePath } from '../../config/site';

// Shape of a search result
interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  path: string;
}

// Shape of an entry in the search index
interface IndexItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string;
}

// Strips HTML tags
function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '');
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const router = useRouter();
  const { t, isLoaded: translationsLoaded } = useTranslation('common');
  const { locale } = useLanguage();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState<IndexItem[]>([]);
  const [indexLoaded, setIndexLoaded] = useState(false);

  // Refs rather than state, so a re-render can't trigger a second load
  const hasLoadedIndex = useRef(false);
  const hasSearched = useRef(false);

  // Load the index file
  useEffect(() => {
    // Skip if the index is already loaded or a load is in flight
    if (hasLoadedIndex.current || loading) return;

    async function loadIndex() {
      if (hasLoadedIndex.current) return;

      hasLoadedIndex.current = true;
      setLoading(true);

      try {
        // Fetch the index by absolute URL
        const baseUrl = window.location.origin;
        const indexUrl = `${baseUrl}${withBasePath('/data/prompts-index.json')}`;

        const response = await fetch(indexUrl);
        if (!response.ok) {
          throw new Error(`Failed to load index: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setIndex(data);
        setIndexLoaded(true);

        // Search straight away if the URL already carries a query
        if (query) {
          performSearch(data, query);
        }
      } catch (error) {
        console.error(`Error loading the index:`, error);
        hasLoadedIndex.current = false;
      } finally {
        setLoading(false);
      }
    }

    loadIndex();
  }, [query]); // Only reload when the query changes

  // Runs the search
  const performSearch = useCallback((indexData: IndexItem[], searchQuery: string) => {
    if (!searchQuery || !indexData.length || hasSearched.current) return;

    hasSearched.current = true;
    setLoading(true);

    try {
      // Pick the matching entries out of the index
      const possibleMatches = indexData.filter(item => {
        if (!item.slug || typeof item.slug !== 'string') {
          return false;
        }

        return item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      });

      // Turn them into search results
      const searchResults = possibleMatches.map(item => ({
        id: item.slug,
        title: item.title,
        excerpt: item.description || t('ui.no_data'),
        path: `/prompts/${item.slug}`
      }));

      setResults(searchResults);
    } catch (error) {
      console.error(`Error during search:`, error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Search once the index has loaded and there is a query
  useEffect(() => {
    if (indexLoaded && query && !hasSearched.current) {
      performSearch(index, query);
    }
  }, [indexLoaded, query, index, performSearch]);

  // Reset the search state when the route changes
  useEffect(() => {
    return () => {
      hasSearched.current = false; // Reset on unmount
    };
  }, [query]);

  // Handle the search form submit
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    hasSearched.current = false; // Allow the next search to run
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('q')?.toString() || '';
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [router]);

  // Handle clicks on a link
  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation(); // Stop the bubble only; let the link navigate
  }, []);

  // Handle clicks on a result card
  const handleResultClick = useCallback((path: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Let the link handle it if the click landed on one
    if (target.tagName === 'A' || target.closest('a')) {
      return;
    }

    // Otherwise navigate by hand
    router.push(path);
  }, [router]);

  // Message shown when nothing matched
  const emptySearchDescription = (
    <>
      {t('ui.try_again')} {t('ui.browse_by_category')}
      <Link
        href="/categories"
        className="text-link"
      >
        {t('nav.categories')}
      </Link>
    </>
  );

  return (
    <main>
      <section className="search-page-header">
        <h1 className="search-title">{t('search.title')}</h1>
        {query && <p className="search-query">{t('hero.search_placeholder')}: "{query}"</p>}
      </section>

      {/* Search form */}
      <section>
        <form className="mb-8" onSubmit={handleSubmit}>
          <div className="search-container mx-auto max-w-3xl flex items-center border rounded-full shadow-lg overflow-hidden bg-white">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder={t('hero.search_placeholder')}
              className="flex-grow p-4 text-lg border-none focus:outline-none focus:ring-0 w-full"
            />
            <button
              type="submit"
              className="search-button py-4 px-8 text-lg font-medium bg-blue-500 hover:bg-blue-600 transition-colors text-white"
              aria-label={t('hero.search_button')}
            >
              {t('hero.search_button')}
            </button>
          </div>
        </form>
      </section>

      {/* Search results */}
      <section>
        {loading ? (
          <div className="loading-container">
            <div className="loading">
              <div className="spinner"></div>
              <p>{t('ui.loading')}</p>
            </div>
          </div>
        ) : (
          <div className="search-results-wrapper">
            {results.length > 0 ? (
              <>
                <p className="search-results-count">{t('search.results_count', { count: results.length.toString() })}</p>
                <div className="prompt-grid">
                  {results.map(result => (
                    <div
                      key={result.id}
                      className="prompt-card"
                      onClick={(e) => handleResultClick(result.path, e)}
                    >
                      <h2 className="prompt-card-title">
                        <Link
                          href={result.path}
                          className="prompt-title-link"
                          onClick={handleLinkClick}
                        >
                          {result.title}
                        </Link>
                      </h2>
                      <p className="prompt-card-excerpt">{result.excerpt}</p>
                      <Link
                        href={result.path}
                        className="view-button"
                        onClick={handleLinkClick}
                      >
                        {t('prompt_card.view_button')}
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            ) : query ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 2C5.14585 2 2 5.14585 2 9C2 12.8541 5.14585 16 9 16C10.748 16 12.345 15.348 13.5742 14.2813L14 14.707V16L20 22L22 20L16 14H14.707L14.2813 13.5742C15.348 12.345 16 10.748 16 9C16 5.14585 12.8541 2 9 2ZM9 4C11.7733 4 14 6.22673 14 9C14 11.7733 11.7733 14 9 14C6.22673 14 4 11.7733 4 9C4 6.22673 6.22673 4 9 4Z" fill="#ccc" />
                  </svg>
                </div>
                <h2 className="empty-title">{t('search.no_results')}</h2>
                <p className="empty-description">
                  {emptySearchDescription}
                </p>
              </div>
            ) : (
              <div className="empty-state">
                <h2 className="empty-title">{t('search.enter_query')}</h2>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}