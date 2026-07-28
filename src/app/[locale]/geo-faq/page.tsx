import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, HelpCircle, Sparkles } from 'lucide-react';
import { geoFaqPages } from '@/data/generated/geo-faq';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'GEO & AEO FAQ — 15 AI Search Visibility Questions Answered',
  description:
    'Fifteen practical answers to the most-searched Generative Engine Optimization and Answer Engine Optimization questions — how to appear in ChatGPT answers, what GEO costs, how long GEO takes, how to optimize for Perplexity, how to get cited by Google AI Overviews, and more. By Harch Atelier, Casablanca.',
  keywords: [
    'GEO FAQ',
    'AEO FAQ',
    'how to appear in ChatGPT answers',
    'what is GEO',
    'how much does GEO cost',
    'how long does GEO take',
    'is GEO different from SEO',
    'how to optimize for Perplexity',
    'how to get cited by Google AI Overviews',
    'what is AEO',
    'AI search visibility FAQ',
    'multilingual AI search',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/geo-faq',
    languages: {
      en: 'https://www.harchcorp.com/geo-faq',
      fr: 'https://www.harchcorp.com/fr/geo-faq',
      'x-default': 'https://www.harchcorp.com/geo-faq',
    },
  },
  openGraph: {
    title: 'GEO & AEO FAQ — 15 Practical Answers',
    description:
      'Fifteen practical answers to the most-searched GEO and AEO questions — ChatGPT visibility, GEO cost, GEO timeline, Perplexity optimization, Google AI Overviews citations, and more. By Harch Atelier, Casablanca.',
    url: 'https://www.harchcorp.com/geo-faq',
    type: 'website',
  },
};

export default function GeoFaqListingPage() {
  const categories = Array.from(new Set(geoFaqPages.map((f) => f.category)));

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: geoFaqPages.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'GEO & AEO FAQ',
    numberOfItems: geoFaqPages.length,
    itemListElement: geoFaqPages.map((f, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: f.question,
      url: `https://www.harchcorp.com/geo-faq/${f.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <JsonLd data={faqJsonLd} />
      <JsonLd data={itemListJsonLd} />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">GEO FAQ</span>
        </nav>

        {/* Hero */}
        <div className="mb-12 border-b border-white/10 pb-10">
          <Badge variant="outline" className="mb-4 border-emerald-500/30 text-emerald-400">
            <HelpCircle className="mr-1 h-3 w-3" />
            FAQ · 15 questions
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            GEO &amp; AEO FAQ
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-zinc-300">
            Fifteen practical answers to the most-searched Generative Engine Optimization and Answer
            Engine Optimization questions. Written by Harch Atelier, the Casablanca-based GEO practice
            powered by GLM-4.
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
              href="/geo-glossary"
              className="inline-flex items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-emerald-500/40 hover:text-white"
            >
              Browse the glossary
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Category chips */}
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

        {/* FAQ grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {geoFaqPages.map((f) => (
            <Link
              key={f.slug}
              href={`/geo-faq/${f.slug}`}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-500/30 hover:bg-white/[0.06]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full border border-stone-500/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-stone-400">
                  {f.category}
                </span>
                <ArrowRight className="h-4 w-4 text-zinc-600 transition group-hover:text-emerald-400" />
              </div>
              <h2 className="mb-2 text-base font-semibold text-white group-hover:text-emerald-400">
                {f.question}
              </h2>
              <p className="line-clamp-3 text-sm text-zinc-400">
                {f.answer.slice(0, 180)}…
              </p>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">
            Still have questions about GEO?
          </h2>
          <p className="mb-6 mx-auto max-w-2xl text-zinc-400">
            Harch Atelier answers every GEO question with a five-minute free audit powered by GLM-4.
            See exactly what ChatGPT, Perplexity, Google AI Overviews, and Claude say about your
            business today.
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
