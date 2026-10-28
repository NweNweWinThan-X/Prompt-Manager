import { Metadata } from 'next';
import { getPromptData, getAllPrompts } from '@/lib/prompts';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import dynamic from 'next/dynamic';

// Load the client component dynamically to avoid errors during SSR
const PromptDetailContent = dynamic(() => import('@/components/PromptDetailContent'), {
  ssr: false,
  loading: () => (
    <main className="prompt-detail">
      <section className="prompt-header">
        <div className="back-link skeleton">
          <i className="fa-solid fa-arrow-left"></i> ...
        </div>
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
  )
});

// How often the static page is revalidated
export const revalidate = 3600; // Once an hour

interface PromptPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PromptPageProps): Promise<Metadata> {
  const prompt = await getPromptData(params.slug);

  if (!prompt) {
    return {
      title: 'Prompt Not Found - Prompt Library',
    };
  }

  return {
    title: `${prompt.title} - Prompt Library`,
    description: prompt.description,
  };
}

export async function generateStaticParams() {
  const promptsDirectory = path.join(process.cwd(), 'prompts');

  // Bail out if the directory is missing
  if (!fs.existsSync(promptsDirectory)) {
    return [];
  }

  const files = fs.readdirSync(promptsDirectory);

  const params: Array<{ slug: string }> = [];

  files.forEach((file) => {
    if (file.endsWith('.md')) {
      // The path without the extension
      params.push({
        slug: file.replace(/\.md$/, ''),
      });

      // And the path with it
      params.push({
        slug: file,
      });
    }
  });

  return params;
}

export default async function PromptPage({ params }: PromptPageProps) {
  const prompt = await getPromptData(params.slug);

  if (!prompt) {
    notFound();
  }

  return <PromptDetailContent prompt={prompt} />;
}