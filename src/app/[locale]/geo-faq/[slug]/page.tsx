import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, HelpCircle, Sparkles } from 'lucide-react';
import { geoFaqPages } from '@/data/generated/geo-faq';
import { geoGlossaryTerms } from '@/data/generated/geo-glossary';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  return geoFaqPages.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const faq = geoFaqPages.find((f) => f.slug === slug);
  if (!faq) return { title: 'Not found' };

  const url = `https://www.harchcorp.com/geo-faq/${faq.slug}`;

  return {
    title: `${faq.question} | Harch Atelier GEO FAQ`,
    description: faq.answer.slice(0, 155),
    keywords: faq.keywords,
    alternates: {
      canonical: url,
      languages: {
        en: url,
        fr: `https://www.harchcorp.com/fr/geo-faq/${faq.slug}`,
        'x-default': url,
      },
    },
    openGraph: {
      title: faq.question,
      description: faq.answer.slice(0, 200),
      url,
      type: 'article',
    },
  };
}

export default async function GeoFaqDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const faq = geoFaqPages.find((f) => f.slug === slug);
  if (!faq) notFound();

  const others = geoFaqPages.filter((f) => f.slug !== faq.slug).slice(0, 6);

  // Surface related glossary terms by scanning the answer for keyword matches
  const relatedGlossary = geoGlossaryTerms.filter((t) =>
    faq.keywords.some(
      (k) =>
        t.term.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(t.term.toLowerCase().split(' ')[0]) ||
        t.slug.includes(k.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
    ),
  ).slice(0, 4);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      },
    ],
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'GEO FAQ', item: 'https://www.harchcorp.com/geo-faq' },
      { '@type': 'ListItem', position: 3, name: faq.question, item: `https://www.harchcorp.com/geo-faq/${faq.slug}` },
    ],
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/geo-faq" className="hover:text-white">GEO FAQ</Link>
          <span>/</span>
          <span className="truncate text-zinc-300">{faq.question}</span>
        </nav>

        <Link
          href="/geo-faq"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          All FAQs
        </Link>

        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <HelpCircle className="mr-1 h-3 w-3" />
            {faq.category}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            {faq.question}
          </h1>
        </div>

        {/* Answer */}
        <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-stone-500">Answer</h2>
          <p className="text-base leading-relaxed text-zinc-200">{faq.answer}</p>

          {/* Keyword tags */}
          <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-6">
            {faq.keywords.map((k) => (
              <span
                key={k}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-zinc-400"
              >
                {k}
              </span>
            ))}
          </div>
        </article>

        {/* Related glossary terms */}
        {relatedGlossary.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-semibold text-white">Related glossary terms</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedGlossary.map((t) => (
                <Link
                  key={t.slug}
                  href={`/geo-glossary/${t.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-500/30 hover:bg-white/[0.06]"
                >
                  <div>
                    <div className="font-medium text-white transition group-hover:text-emerald-400">{t.term}</div>
                    <div className="line-clamp-1 text-xs text-zinc-500">{t.shortDefinition}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-zinc-600 transition group-hover:text-emerald-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Other FAQs */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Other FAQs</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/geo-faq/${o.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-500/30 hover:bg-white/[0.06]"
              >
                <div className="font-medium text-white transition group-hover:text-emerald-400 line-clamp-1">
                  {o.question}
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-zinc-600 transition group-hover:text-emerald-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">
            See what AI says about your business
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
