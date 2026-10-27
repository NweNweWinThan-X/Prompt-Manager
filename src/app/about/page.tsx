import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// 动态导入客户端组件
const AboutContent = dynamic(() => import('@/components/AboutContent'), {
  ssr: false,
  loading: () => (
    <main className="about-page">
      <section className="page-header">
        <h1>关于Prompt Library</h1>
        <p>探索AI提示的艺术</p>
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