import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticlePage from "./ArticlePage";
import { ARTICLES, getArticleBySlug, getAllSlugs } from "../articles";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) {
    return {
      title: { absolute: "Article not found | Harch Atelier Blog" },
    };
  }
  return {
    title: { absolute: `${article.title} | Harch Atelier Blog` },
    description: article.excerpt,
    alternates: {
      canonical: `https://atelier.harchcorp.com/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      tags: article.tags,
    },
    keywords: article.tags,
  };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  // ─── JSON-LD: Article schema (per-article) ───────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    datePublished: article.date,
    dateModified: article.date,
    publisher: {
      "@type": "Organization",
      name: "Harch Atelier",
      url: "https://atelier.harchcorp.com",
      logo: {
        "@type": "ImageObject",
        url: "https://atelier.harchcorp.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://atelier.harchcorp.com/blog/${article.slug}`,
    },
    url: `https://atelier.harchcorp.com/blog/${article.slug}`,
    image: `https://atelier.harchcorp.com/blog/${article.slug}/og.png`,
    articleSection: article.category,
    keywords: article.tags.join(", "),
    inLanguage: "en",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticlePage article={article} />
    </>
  );
}
