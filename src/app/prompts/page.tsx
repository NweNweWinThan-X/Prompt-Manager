import { Metadata } from 'next';
import { getAllPrompts } from '@/lib/prompts';
import dynamic from 'next/dynamic';
import { PromptData } from '@/types';

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
    title: '专业文章生成器',
    description: '创建结构化、专业的文章，包含引人入胜的标题、精确的小标题和丰富的内容。',
    category: '内容创作',
    rating: 9.8,
    createdAt: '2023-01-15',
    featured: true
  },
  {
    slug: 'code-optimization-assistant',
    title: '代码优化助手',
    description: '分析并优化您的代码，提供性能改进建议和最佳实践指导。',
    category: '编程开发',
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
    console.error('获取提示词数据时出错:', error);
    // On error, use the fallback data
    initialPrompts = fallbackPrompts;
  }

  // Pass only the first page as the initial data
  const initialPageData = initialPrompts.slice(0, 9);
  const totalPages = Math.ceil(initialPrompts.length / 9);

  return (
    <main>
      <section className="page-header">
        <h1>所有提示词</h1>
        <p>浏览我们完整的AI提示词集合，找到适合您需求的完美提示词</p>
      </section>

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