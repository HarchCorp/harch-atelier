import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, BookOpen } from 'lucide-react';
import { blogArticles } from '@/data/pricing-blog-guides';
import { glossaryTerms } from '@/data/glossary-terms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = blogArticles.find((a) => a.slug === slug);
  if (!article) return { title: 'Not found' };

  return {
    title: `${article.title} | Harch Corp`,
    description: article.metaDescription,
    keywords: article.keywords,
    alternates: { canonical: `https://www.harchcorp.com/learn/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.shortDesc,
      url: `https://www.harchcorp.com/learn/${article.slug}`,
      type: 'article',
    },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = blogArticles.find((a) => a.slug === slug);
  if (!article) notFound();

  const relatedGlossary = (article.relatedGlossary || [])
    .map((s) => glossaryTerms.find((t) => t.slug === s))
    .filter(Boolean);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.shortDesc,
    author: { '@type': 'Organization', name: 'Harch Corp' },
    publisher: { '@type': 'Organization', name: 'Harch Corp' },
    articleSection: article.category,
    wordCount: article.sections.reduce((s, sec) => s + sec.content.split(' ').length, 0),
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <JsonLd data={jsonLd} />

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/learn" className="hover:text-white">Learn</Link>
          <span>/</span>
          <span className="text-zinc-300 truncate">{article.title}</span>
        </nav>

        <Link href="/learn" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          All Articles
        </Link>

        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <BookOpen className="mr-1 h-3 w-3" />
            {article.category}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{article.title}</h1>
          <p className="mt-4 text-lg text-zinc-300">{article.shortDesc}</p>
          <div className="mt-4 flex items-center gap-3 text-sm text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {article.readTime} min read
            </span>
            <span>·</span>
            <span>{article.sections.length} sections</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {article.sections.map((section, i) => (
            <section key={i}>
              <h2 className="mb-3 text-2xl font-bold text-emerald-400">{section.heading}</h2>
              <p className="text-zinc-300 leading-relaxed">{section.content}</p>
            </section>
          ))}
        </div>

        {/* Related glossary */}
        {relatedGlossary.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-semibold text-white">Related Terms</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedGlossary.map((term) => (
                <Link key={term!.slug} href={`/glossary/${term!.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30 hover:bg-white/10">
                  <div>
                    <div className="font-medium text-white group-hover:text-emerald-400">{term!.term}</div>
                    <div className="text-xs text-zinc-500 line-clamp-1">{term!.shortDef}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Other articles */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">More Articles</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {blogArticles.filter((a) => a.slug !== article.slug).slice(0, 4).map((a) => (
              <Link key={a.slug} href={`/learn/${a.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30 hover:bg-white/10">
                <div className="font-medium text-white group-hover:text-emerald-400 line-clamp-1">{a.title}</div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-zinc-600 group-hover:text-emerald-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Build on Harch Corp</h2>
          <p className="mb-4 text-zinc-400">Apply these insights on our carbon-aware GPU cloud.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/intelligence"><Button>Explore Platform</Button></Link>
            <Link href="/pricing"><Button variant="outline">View Pricing</Button></Link>
            <Link href="/contact"><Button variant="ghost">Contact Sales</Button></Link>
          </div>
        </div>
      </article>
    </main>
  );
}
