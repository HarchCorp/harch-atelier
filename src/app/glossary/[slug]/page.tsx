import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { glossaryTerms, glossaryCategories } from '@/data/glossary-terms';
import { expandedGlossaryTerms } from '@/data/generated/glossary-expanded';
import { glossaryExpanded2 } from '@/data/generated/glossary-expanded-2';

const allTerms = [...glossaryTerms, ...expandedGlossaryTerms, ...glossaryExpanded2];
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allTerms.map((term) => ({ slug: term.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const term = allTerms.find((t) => t.slug === slug);
  if (!term) return { title: 'Term not found' };

  return {
    title: `${term.term} — Definition & Guide | Harch Corp Glossary`,
    description: term.shortDef,
    keywords: term.keywords,
    alternates: {
      canonical: `https://www.harchcorp.com/glossary/${term.slug}`,
      languages: {
        en: `https://www.harchcorp.com/glossary/${term.slug}`,
        'x-default': `https://www.harchcorp.com/glossary/${term.slug}`,
      },
    },
    openGraph: {
      title: `${term.term} — Definition | Harch Corp`,
      description: term.shortDef,
      url: `https://www.harchcorp.com/glossary/${term.slug}`,
      type: 'article',
    },
    other: {
      'article:section': term.category,
    },
  };
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const { slug } = await params;
  const term = allTerms.find((t) => t.slug === slug);
  if (!term) notFound();

  const category = glossaryCategories.find((c) => c.slug === term.category);
  const relatedTerms = (term.relatedTerms || [])
    .map((slug) => allTerms.find((t) => t.slug === slug))
    .filter(Boolean);

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.term,
    description: term.shortDef,
    url: `https://www.harchcorp.com/glossary/${term.slug}`,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Harch Corp Glossary',
      url: 'https://www.harchcorp.com/glossary',
    },
    termCode: term.slug,
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${term.term}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: term.longDef,
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <JsonLd data={jsonLd} />
      <JsonLd data={faqJsonLd} />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/glossary" className="hover:text-white">Glossary</Link>
          <span>/</span>
          <span className="text-zinc-300">{term.term}</span>
        </nav>

        {/* Back link */}
        <Link
          href="/glossary"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Glossary
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
              {category?.label || term.category}
            </Badge>
            <span className="text-xs text-zinc-500 font-mono">{term.slug}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            {term.term}
          </h1>
          <p className="mt-4 text-lg text-zinc-300">{term.shortDef}</p>
        </div>

        {/* Long definition */}
        <div className="prose prose-invert max-w-none">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white">Definition</h2>
            <p className="text-zinc-300 leading-relaxed">{term.longDef}</p>
          </div>
        </div>

        {/* Keywords */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Related Keywords
          </h2>
          <div className="flex flex-wrap gap-2">
            {term.keywords.map((kw, i) => (
              <span
                key={i}
                className="rounded-lg bg-white/5 px-3 py-1 text-xs font-mono text-zinc-400"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Related terms */}
        {relatedTerms.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Related Terms
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedTerms.map((rt) => (
                <Link
                  key={rt!.slug}
                  href={`/glossary/${rt!.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30 hover:bg-white/10"
                >
                  <div>
                    <div className="font-medium text-white">{rt!.term}</div>
                    <div className="text-xs text-zinc-500 line-clamp-1">{rt!.shortDef}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
          <h2 className="mb-2 text-xl font-bold text-white">
            Explore Harch Corp&apos;s GPU Cloud
          </h2>
          <p className="mb-4 text-sm text-zinc-400">
            Leverage {term.term.toLowerCase()} in our carbon-aware GPU cloud infrastructure in Morocco.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/intelligence">
              <Button>Explore Platform</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline">View Pricing</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
