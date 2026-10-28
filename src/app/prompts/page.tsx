import { Metadata } from 'next';
import { getAllPrompts } from '@/lib/prompts';
import dynamic from 'next/dynamic';
import { PromptData } from '@/types';
import PageHeader from '@/components/PageHeader';

// Load the client component dynamically to avoid server-render errors
const PaginatedPrompts = dynamic(() => import('@/components/PaginatedPrompts'), { ssr: false });

export const metadata: Metadata = {
  title: 'All Prompts - Prompt Library',
  description: 'Browse the complete AI prompt collection and find the prompt that fits your needs',
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

export default function PromptsPage() {
  // Fetch every prompt as the initial data, falling back if it throws.
  // Note: during a static build this is what the HTML is generated from.
  // On the client, PaginatedPrompts fetches the JSON for the page being viewed.
  let initialPrompts: PromptData[] = [];
  try {
    initialPrompts = getAllPrompts();
    // Use the fallback data if no prompts came back
    if (initialPrompts.length === 0) {
      initialPrompts = fallbackPrompts;
    }
  } catch (error) {
    console.error('Error loading prompt data:', error);
    // On error, use the fallback data
    initialPrompts = fallbackPrompts;
  }

  // Pass only the first page as the initial data
  const initialPageData = initialPrompts.slice(0, 9);
  const totalPages = Math.ceil(initialPrompts.length / 9);

  return (
    <main>
      <PageHeader
        titleKey="ui.all_prompts"
        subtitleKey="ui.all_prompts_subtitle"
        fallbackTitle="All Prompts"
        fallbackSubtitle="Browse the complete prompt collection and find the one that fits your needs"
      />

      <section className="prompts-list">
        <PaginatedPrompts
          type="all"
          initialData={initialPageData}
          initialMeta={{
            total: initialPrompts.length,
            perPage: 9,
            totalPages: totalPages
          }}
        />
      </section>
    </main>
  );
}