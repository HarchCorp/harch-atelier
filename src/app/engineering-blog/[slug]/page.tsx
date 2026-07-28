import { Metadata } from 'next';
import { engArticles } from '@/data/eng-articles';
import EngArticlePageClient from './EngArticlePageClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = engArticles.find(a => a.slug === slug);

  if (!article) {
    return {
      title: 'Article Not Found  | Harch Corp',
    };
  }

  return {
    title: `${article.title} | Harch Corp Engineering Blog`,
    description: article.excerpt,
    keywords: article.seoKeywords,
    alternates: {
      canonical: `https://www.harchcorp.com/engineering-blog/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: `https://www.harchcorp.com/engineering-blog/${slug}`,
      siteName: 'Harch Corp',
      publishedTime: new Date(article.date).toISOString(),
      images: [
        {
          url: article.image,
          width: 1200,
          height: 630,
          alt: article.imageAlt,
        },
      ],
      tags: article.seoKeywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

export function generateStaticParams() {
  return engArticles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function EngArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = engArticles.find(a => a.slug === slug);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Engineering Blog', item: 'https://www.harchcorp.com/engineering-blog' },
      { '@type': 'ListItem', position: 3, name: article?.title || 'Article', item: `https://www.harchcorp.com/engineering-blog/${slug}` },
    ],
  };

  // TechArticle JSON-LD for Google Search rich results
  const techArticleSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.excerpt,
    image: {
      '@type': 'ImageObject',
      url: `https://www.harchcorp.com${article.image}`,
      width: 1344,
      height: 768,
    },
    datePublished: new Date(article.date).toISOString(),
    dateModified: new Date(article.date).toISOString(),
    author: {
      '@type': 'Organization',
      name: article.author || 'Harch Intelligence Engineering',
      url: 'https://www.harchcorp.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Harch Corp',
      url: 'https://www.harchcorp.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.harchcorp.com/logo-512x512.png',
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.harchcorp.com/engineering-blog/${slug}`,
    },
    articleSection: article.category,
    proficiencyLevel: article.difficulty,
    keywords: article.seoKeywords?.join(', '),
    wordCount: article.body?.replace(/<[^>]*>/g, '').split(/\s+/).length || 800,
    isAccessibleForFree: true,
    dependencies: 'HarchOS, Kubernetes, NVIDIA GPU',
  } : null;

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {techArticleSchema && (
        <script
          type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleSchema) }}
        />
      )}
      <EngArticlePageClient slug={slug} />
    </>
  );
}
