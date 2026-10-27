import { Metadata } from 'next';
import { getAllCategories, getAllPrompts } from '@/lib/prompts';
import { notFound } from 'next/navigation';
import { SLUG_TO_CATEGORY } from '@/config/categories';
import dynamic from 'next/dynamic';

// 动态导入客户端组件
const CategoryDetailContent = dynamic(() => import('@/components/CategoryDetailContent'), {
  ssr: false,
  loading: () => (
    <main>
      <section className="page-header skeleton-loading">
        <div className="back-link skeleton"></div>
        <h1 className="skeleton"></h1>
        <p className="skeleton"></p>
      </section>
      <section className="prompts-list skeleton-loading">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="prompt-card skeleton"></div>
        ))}
      </section>
    </main>
  )
});

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categories = getAllCategories();
  const category = categories.find(cat => cat.slug === params.slug);

  if (!category) {
    return {
      title: 'Category Not Found - Prompt Library',
    };
  }

  return {
    title: `${category.name} - Prompt Library`,
    description: `Browse the AI prompts in the ${category.name} category`,
  };
}

export async function generateStaticParams() {
  const categories = getAllCategories();

  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categories = getAllCategories();
  const category = categories.find(cat => cat.slug === params.slug);

  if (!category) {
    notFound();
  }

  const allPrompts = getAllPrompts();
  const categoryPrompts = allPrompts.filter(prompt =>
    prompt.category === SLUG_TO_CATEGORY[category.slug] ||
    prompt.category === category.name
  );

  return (
    <CategoryDetailContent
      category={category}
      categoryPrompts={categoryPrompts}
    />
  );
}