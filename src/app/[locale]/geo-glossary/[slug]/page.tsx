import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { geoGlossaryTerms } from '@/data/generated/geo-glossary';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  return geoGlossaryTerms.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const term = geoGlossaryTerms.find((t) => t.slug === slug);
  if (!term) return { title: 'Not found' };

  const url = `https://www.harchcorp.com/geo-glossary/${term.slug}`;

  return {
    title: `${term.term} — Definition | Harch Atelier GEO Glossary`,
    description: term.shortDefinition,
    keywords: [
      term.term.toLowerCase(),
      `${term.term.toLowerCase()} definition`,
      `${term.term.toLowerCase()} meaning`,
      'GEO glossary',
      'AEO glossary',
      'AI search visibility',
    ],
    alternates: {
      canonical: url,
      languages: {
        en: url,
        fr: `https://www.harchcorp.com/fr/geo-glossary/${term.slug}`,
        'x-default': url,
      },
    },
    openGraph: {
      title: `${term.term} — GEO Glossary`,
      description: term.shortDefinition,
      url,
      type: 'article',
    },
  };
}

export default async function GeoGlossaryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const term = geoGlossaryTerms.find((t) => t.slug === slug);
  if (!term) notFound();

  const related = term.relatedTerms
    .map((name) =>
      geoGlossaryTerms.find(
        (t) => t.term.toLowerCase() === name.toLowerCase() || t.slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      ),
    )
    .filter(Boolean);

  const others = geoGlossaryTerms.filter((t) => t.slug !== term.slug).slice(0, 6);

  const definedTermJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.term,
    description: term.shortDefinition,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'GEO & AEO Glossary',
      url: 'https://www.harchcorp.com/geo-glossary',
    },
    url: `https://www.harchcorp.com/geo-glossary/${term.slug}`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'GEO Glossary', item: 'https://www.harchcorp.com/geo-glossary' },
      { '@type': 'ListItem', position: 3, name: term.term, item: `https://www.harchcorp.com/geo-glossary/${term.slug}` },
    ],
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <JsonLd data={definedTermJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/geo-glossary" className="hover:text-white">GEO Glossary</Link>
          <span>/</span>
          <span className="truncate text-zinc-300">{term.term}</span>
        </nav>

        <Link
          href="/geo-glossary"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          All glossary terms
        </Link>

        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <BookOpen className="mr-1 h-3 w-3" />
            {term.category}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{term.term}</h1>
          <p className="mt-4 text-lg text-zinc-300">{term.shortDefinition}</p>
        </div>

        {/* Full definition */}
        <article className="prose prose-invert max-w-none">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-stone-500">Full definition</h2>
            <p className="text-base leading-relaxed text-zinc-200">{term.fullDefinition}</p>
          </div>
        </article>

        {/* Related terms */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-semibold text-white">Related terms</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r!.slug}
                  href={`/geo-glossary/${r!.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-500/30 hover:bg-white/[0.06]"
                >
                  <div>
                    <div className="font-medium text-white transition group-hover:text-emerald-400">{r!.term}</div>
                    <div className="line-clamp-1 text-xs text-zinc-500">{r!.shortDefinition}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-zinc-600 transition group-hover:text-emerald-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Other terms */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Browse other terms</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/geo-glossary/${o.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-500/30 hover:bg-white/[0.06]"
              >
                <div className="font-medium text-white transition group-hover:text-emerald-400 line-clamp-1">
                  {o.term}
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-zinc-600 transition group-hover:text-emerald-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">
            Get your brand cited inside AI answers
          </h2>
          <p className="mb-6 mx-auto max-w-2xl text-zinc-400">
            Harch Atelier, powered by GLM-4, runs GEO programs from Casablanca that get enterprises
            cited by ChatGPT, Perplexity, Google AI Overviews, and Claude. Five-minute free audit.
          </p>
          <Link
            href="/subsidiaries/atelier"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            <Sparkles className="h-4 w-4" />
            Visit Harch Atelier
          </Link>
        </div>
      </div>
    </main>
  );
}
