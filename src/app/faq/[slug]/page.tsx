import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { faqPages } from '@/data/faq-calculators';
import { expandedFaqPages } from '@/data/generated/faq-expanded';

const allFaqs = [...faqPages, ...expandedFaqPages];
import { glossaryTerms } from '@/data/glossary-terms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allFaqs.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const faq = allFaqs.find((f) => f.slug === slug);
  if (!faq) return { title: 'Not found' };

  return {
    title: `${faq.title} | Harch Corp`,
    description: faq.metaDescription,
    keywords: faq.keywords,
    alternates: { canonical: `https://www.harchcorp.com/faq/${faq.slug}` },
    openGraph: {
      title: faq.title,
      description: faq.shortDesc,
      url: `https://www.harchcorp.com/faq/${faq.slug}`,
      type: 'article',
    },
  };
}

export default async function FAQDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const faq = allFaqs.find((f) => f.slug === slug);
  if (!faq) notFound();

  const relatedGlossary = ((faq as any).relatedGlossary || [])
    .map((s) => glossaryTerms.find((t) => t.slug === s))
    .filter(Boolean);

  // JSON-LD FAQ structured data for rich snippets
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <JsonLd data={faqJsonLd} />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/faq" className="hover:text-white">FAQ</Link>
          <span>/</span>
          <span className="text-zinc-300 truncate">{faq.title}</span>
        </nav>

        <Link href="/faq" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          All FAQs
        </Link>

        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <HelpCircle className="mr-1 h-3 w-3" />
            {faq.category}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{faq.title}</h1>
          <p className="mt-4 text-lg text-zinc-300">{faq.shortDesc}</p>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          {faq.faqs.map((item, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-3 text-lg font-semibold text-emerald-400">
                {item.question}
              </h2>
              <p className="text-zinc-300 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>

        {/* Related glossary */}
        {relatedGlossary.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-semibold text-white">Related Terms</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedGlossary.map((term) => (
                <Link
                  key={term!.slug}
                  href={`/glossary/${term!.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30 hover:bg-white/10"
                >
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

        {/* Other FAQs */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Other FAQs</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {allFaqs.filter((f) => f.slug !== faq.slug).slice(0, 4).map((f) => (
              <Link
                key={f.slug}
                href={`/faq/${f.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30 hover:bg-white/10"
              >
                <div className="font-medium text-white group-hover:text-emerald-400 line-clamp-1">{f.title}</div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-zinc-600 group-hover:text-emerald-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Ready to Get Started?</h2>
          <p className="mb-4 text-zinc-400">
            Explore Harch Corp&apos;s GPU cloud and datacenter infrastructure.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/intelligence"><Button>Explore Platform</Button></Link>
            <Link href="/pricing"><Button variant="outline">View Pricing</Button></Link>
            <Link href="/contact"><Button variant="ghost">Contact Sales</Button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
