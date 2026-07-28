import { Metadata } from 'next';
import { articles } from '@/data/articles';
import ArticlePageClient from './ArticlePageClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find(a => a.slug === slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${article.title} | Harch Corp Newsroom`,
    description: article.excerpt,
    keywords: article.seoKeywords,
    alternates: {
      canonical: `https://www.harchcorp.com/newsroom/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: `https://www.harchcorp.com/newsroom/${slug}`,
      siteName: 'Harch Corp',
      publishedTime: new Date(article.date).toISOString(),
      section: article.tag,
      tags: article.seoKeywords,
      images: [
        {
          url: article.image,
          width: 1200,
          height: 630,
          alt: article.imageAlt || article.title,
        },
      ],
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
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = articles.find(a => a.slug === slug);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Newsroom', item: 'https://www.harchcorp.com/newsroom' },
      { '@type': 'ListItem', position: 3, name: article?.title || 'Article', item: `https://www.harchcorp.com/newsroom/${slug}` },
    ],
  };

  // NewsArticle JSON-LD for Google News & Search
  const newsArticleSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
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
      name: 'Harch Corp',
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
      '@id': `https://www.harchcorp.com/newsroom/${slug}`,
    },
    articleSection: article.tag,
    keywords: article.seoKeywords?.join(', '),
    isAccessibleForFree: true,
  } : null;

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {newsArticleSchema && (
        <script
          type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
        />
      )}
      <ArticlePageClient slug={slug} />
    </>
  );
}
