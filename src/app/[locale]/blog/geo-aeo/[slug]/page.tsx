import { Metadata } from 'next';
import { marked } from 'marked';
import { geoAeoArticles } from '@/data/generated/geo-aeo-articles';
import GeoAeoArticlePageClient from './GeoAeoArticlePageClient';

// Configure marked: GitHub-flavored markdown, line breaks as <br>
marked.setOptions({
  gfm: true,
  breaks: false,
});

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = geoAeoArticles.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: 'Article Not Found | Harch Atelier GEO/AEO Blog',
    };
  }

  const url = `https://www.harchcorp.com/blog/geo-aeo/${slug}`;
  const description = article.description;

  return {
    title: `${article.title} | Harch Atelier`,
    description,
    keywords: article.keywords,
    alternates: {
      canonical: url,
      languages: {
        en: url,
        fr: `https://www.harchcorp.com/fr/blog/geo-aeo/${slug}`,
        'x-default': url,
      },
    },
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      url,
      siteName: 'Harch Corp',
      publishedTime: new Date(article.date).toISOString(),
      modifiedTime: new Date(article.date).toISOString(),
      tags: article.keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
    },
  };
}

export function generateStaticParams() {
  return geoAeoArticles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function GeoAeoArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = geoAeoArticles.find((a) => a.slug === slug);

  if (!article) {
    return <GeoAeoArticlePageClient slug={slug} html="" />;
  }

  // Render markdown to HTML on the server
  const html = marked.parse(article.content) as string;

  // Breadcrumb JSON-LD
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.harchcorp.com/blog' },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'GEO / AEO',
        item: 'https://www.harchcorp.com/blog/geo-aeo',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: article.title,
        item: `https://www.harchcorp.com/blog/geo-aeo/${slug}`,
      },
    ],
  };

  // Article JSON-LD for Google Search rich results + AI answer engine extraction
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: new Date(article.date).toISOString(),
    dateModified: new Date(article.date).toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Harch Atelier',
      url: 'https://www.harchcorp.com/subsidiaries/atelier',
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
      '@id': `https://www.harchcorp.com/blog/geo-aeo/${slug}`,
    },
    articleSection: article.category,
    keywords: article.keywords.join(', '),
    wordCount: article.content.split(/\s+/).length,
    inLanguage: 'en',
    isAccessibleForFree: true,
  };

  return (
    <>
      <script
        type="application/ld+json"
        async={true}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        async={true}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <GeoAeoArticlePageClient slug={slug} html={html} />
    </>
  );
}
