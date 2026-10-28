import { Metadata } from 'next';
import {
  getFeaturedPrompts,
  getRecentPrompts,
  getAllCategories
} from '@/lib/prompts';
import { PromptData } from '@/types';
import dynamic from 'next/dynamic';

// Load the client component dynamically
const HomeContent = dynamic(() => import('@/components/HomeContent'), {
  ssr: false,
  loading: () => (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h1 className="skeleton"></h1>
          <p className="skeleton"></p>
          <div className="search-container skeleton"></div>
        </div>
      </section>

      <section className="featured">
        <div className="section-header">
          <h2 className="skeleton"></h2>
          <div className="view-all skeleton"></div>
        </div>
        <div className="prompt-grid skeleton-loading">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="prompt-card skeleton"></div>
          ))}
        </div>
      </section>

      <section className="categories">
        <div className="section-header">
          <h2 className="skeleton"></h2>
        </div>
        <div className="category-container skeleton-loading">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="category-item skeleton"></div>
          ))}
        </div>
      </section>
    </main>
  )
});

export const metadata: Metadata = {
  title: 'Prompt Library - AI Prompt Collection',
  description: 'Discover and use a curated collection of high-quality AI prompts to work with AI more effectively',
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

// Static generation settings
export const revalidate = 3600; // Regenerate the page once an hour

export default function Home() {
  // Fetch the data, falling back if it throws
  let featuredPrompts: PromptData[] = [];
  let recentPrompts: PromptData[] = [];

  try {
    featuredPrompts = getFeaturedPrompts();
    if (featuredPrompts.length === 0) {
      featuredPrompts = fallbackPrompts;
    }
  } catch (error) {
    console.error('获取热门提示词时出错:', error);
    featuredPrompts = fallbackPrompts;
  }

  try {
    recentPrompts = getRecentPrompts();
    if (recentPrompts.length === 0) {
      recentPrompts = fallbackPrompts;
    }
  } catch (error) {
    console.error('获取最新提示词时出错:', error);
    recentPrompts = fallbackPrompts;
  }

  const categories = getAllCategories();

  return <HomeContent
    featuredPrompts={featuredPrompts}
    recentPrompts={recentPrompts}
    categories={categories}
  />;
}