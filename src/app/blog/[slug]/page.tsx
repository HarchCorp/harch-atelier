import { Metadata } from 'next';
import { blogArticles } from '@/data/blog-articles';
import { seoArticles } from '@/data/seo-articles';
import BlogArticlePageClient from './BlogArticlePageClient';

export const dynamic = 'force-dynamic';

const allArticles = [...blogArticles, ...seoArticles];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = allArticles.find(a => a.slug === slug);

  if (!article) {
    return {
      title: 'Article Not Found  | Harch Corp',
    };
  }

  return {
    title: `${article.title} | Harch Corp Blog`,
    description: article.excerpt,
    keywords: article.seoKeywords,
    alternates: {
      canonical: `https://www.harchcorp.com/blog/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: `https://www.harchcorp.com/blog/${slug}`,
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
  return allArticles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = allArticles.find(a => a.slug === slug);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.harchcorp.com/blog' },
      { '@type': 'ListItem', position: 3, name: article?.title || 'Article', item: `https://www.harchcorp.com/blog/${slug}` },
    ],
  };

  // Article JSON-LD for Google Search rich results
  const articleSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
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
      '@type': article.author?.includes('Engineering') ? 'Organization' : 'Organization',
      name: article.author || 'Harch Corp',
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
      '@id': `https://www.harchcorp.com/blog/${slug}`,
    },
    articleSection: article.category,
    keywords: article.seoKeywords?.join(', '),
    wordCount: article.body?.replace(/<[^>]*>/g, '').split(/\s+/).length || 800,
    isAccessibleForFree: true,
  } : null;

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {articleSchema && (
        <script
          type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      <BlogArticlePageClient slug={slug} />
    </>
  );
}
