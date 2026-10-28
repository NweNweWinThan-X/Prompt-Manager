import { getAllPrompts } from '@/lib/prompts';
import { PromptData } from '@/types';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Load the client component dynamically
const PopularPromptsContent = dynamic(() => import('@/components/PopularPromptsContent'), {
    ssr: false,
    loading: () => (
        <div className="container mx-auto px-4 py-8">
            <div className="page-header">
                <h1 className="page-title">Popular Prompts</h1>
                <p className="page-description">
                    Discover the prompts users love most — community-tested, effective and genuinely useful
                </p>
            </div>

            <div className="filter-bar skeleton-loading">
                <div className="skeleton"></div>
            </div>

            <div className="prompt-grid skeleton-loading">
                {[...Array(9)].map((_, index) => (
                    <div key={index} className="prompt-card skeleton"></div>
                ))}
            </div>
        </div>
    )
});

export const metadata: Metadata = {
    title: 'Popular Prompts - Prompt Library',
    description: 'Discover the AI prompts the community likes most, sorted by popularity'
};

// Sample data to fall back on when the build can't read the filesystem
const fallbackPrompts: PromptData[] = [
    {
        slug: 'professional-article-generator',
        title: 'Professional Article Generator',
        description: 'Create structured, professional articles with compelling titles, precise subheadings and rich content.',
        category: 'Content Creation',
        rating: 9.8,
        createdAt: '2023-01-15',
        featured: true
    },
    {
        slug: 'code-optimization-assistant',
        title: 'Code Optimization Assistant',
        description: 'Analyze and optimize your code, with performance improvement suggestions and best-practice guidance.',
        category: 'Programming',
        rating: 9.5,
        createdAt: '2023-01-20',
        featured: true
    }
];

export default function PopularPromptsPage() {
    // Fetch every prompt, falling back if it throws
    let allPrompts: PromptData[] = [];
    try {
        allPrompts = getAllPrompts();
        // Use the fallback data if no prompts came back
        if (allPrompts.length === 0) {
            allPrompts = fallbackPrompts;
        }
    } catch (error) {
        console.error('Error loading prompt data:', error);
        // On error, use the fallback data
        allPrompts = fallbackPrompts;
    }

    return <PopularPromptsContent prompts={allPrompts} />;
} 