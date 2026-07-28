import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { geoGlossaryTerms } from '@/data/generated/geo-glossary';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'GEO & AEO Glossary — 20 AI Search Visibility Terms Defined',
  description:
    'A practitioner-grade glossary of 20 Generative Engine Optimization and Answer Engine Optimization terms — GEO, AEO, AI Search Visibility, ChatGPT Optimization, Perplexity Optimization, Google AI Overviews, AI Citations, Entity Optimization, Structured Data for AI, and more. Published by Harch Atelier, Casablanca.',
  keywords: [
    'GEO glossary',
    'AEO glossary',
    'AI search visibility definition',
    'Generative Engine Optimization definition',
    'Answer Engine Optimization definition',
    'ChatGPT optimization definition',
    'Perplexity optimization definition',
    'Google AI Overviews definition',
    'AI citation definition',
    'entity optimization definition',
    'structured data for AI definition',
    'LLM visibility definition',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/geo-glossary',
    languages: {
      en: 'https://www.harchcorp.com/geo-glossary',
      fr: 'https://www.harchcorp.com/fr/geo-glossary',
      'x-default': 'https://www.harchcorp.com/geo-glossary',
    },
  },
  openGraph: {
    title: 'GEO & AEO Glossary — 20 AI Search Visibility Terms',
    description:
      'Practitioner-grade definitions for Generative Engine Optimization, Answer Engine Optimization, AI Search Visibility, ChatGPT Optimization, Perplexity Optimization, and 15 more terms. By Harch Atelier, Casablanca.',
    url: 'https://www.harchcorp.com/geo-glossary',
    type: 'website',
  },
};

export default function GeoGlossaryListingPage() {
  const categories = Array.from(new Set(geoGlossaryTerms.map((t) => t.category)));

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'GEO & AEO Glossary',
    numberOfItems: geoGlossaryTerms.length,
    itemListElement: geoGlossaryTerms.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.term,
      url: `https://www.harchcorp.com/geo-glossary/${t.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <JsonLd data={itemListJsonLd} />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">GEO Glossary</span>
        </nav>

        {/* Hero */}
        <div className="mb-12 border-b border-white/10 pb-10">
          <Badge variant="outline" className="mb-4 border-emerald-500/30 text-emerald-400">
            <BookOpen className="mr-1 h-3 w-3" />
            Glossary · 20 terms
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            GEO &amp; AEO Glossary
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-zinc-300">
            Twenty practitioner-grade definitions for Generative Engine Optimization, Answer Engine
            Optimization, and the broader discipline of AI search visibility. Written by Harch Atelier,
            the Casablanca-based GEO practice powered by GLM-4.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/subsidiaries/atelier"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 transition hover:bg-emerald-400"
            >
              <Sparkles className="h-4 w-4" />
              Book a free GEO audit
            </Link>
            <Link
              href="/geo-faq"
              className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-emerald-500/40 hover:text-white"
            >
              Browse the FAQ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Category filter chips */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-zinc-500">Categories:</span>
          {categories.map((c) => (
            <span
              key={c}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"
            >
              {c}
            </span>
          ))}
        </div>

        {/* Terms grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {geoGlossaryTerms.map((t) => (
            <Link
              key={t.slug}
              href={`/geo-glossary/${t.slug}`}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-500/30 hover:bg-white/[0.06]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full border border-stone-500/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-stone-400">
                  {t.category}
                </span>
                <ArrowRight className="h-4 w-4 text-zinc-600 transition group-hover:text-emerald-400" />
              </div>
              <h2 className="mb-2 text-base font-semibold text-white group-hover:text-emerald-400">
                {t.term}
              </h2>
              <p className="line-clamp-3 text-sm text-zinc-400">{t.shortDefinition}</p>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">
            Want these terms to mention your brand?
          </h2>
          <p className="mb-6 mx-auto max-w-2xl text-zinc-400">
            Harch Atelier runs GEO programs that get your brand cited inside ChatGPT, Perplexity,
            Google AI Overviews, and Claude answers. Powered by GLM-4. Five-minute free audit.
          </p>
          <Link
            href="/subsidiaries/atelier"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            Visit Harch Atelier
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
