import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Load the client component dynamically
const AboutContent = dynamic(() => import('@/components/AboutContent'), {
  ssr: false,
  loading: () => (
    <main className="about-page">
      <section className="page-header">
        <h1>About Prompt Library</h1>
        <p>Explore the art of AI prompting</p>
      </section>
      <section className="content-section skeleton-loading">
        <div className="skeleton"></div>
        <div className="skeleton"></div>
        <div className="skeleton"></div>
      </section>
    </main>
  )
});

export const metadata: Metadata = {
  title: 'About - Prompt Library',
  description: 'Learn about the origin, goals and vision of the Prompt Library project',
};

export default function AboutPage() {
  return <AboutContent />;
}