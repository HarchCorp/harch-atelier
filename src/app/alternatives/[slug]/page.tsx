import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Star, Check, X, Trophy } from 'lucide-react';
import { alternativesPages } from '@/data/alternatives-pages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return alternativesPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = alternativesPages.find((p) => p.slug === slug);
  if (!page) return { title: 'Not found' };

  return {
    title: `${page.title} | Harch Corp`,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: { canonical: `https://www.harchcorp.com/alternatives/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.shortDesc,
      url: `https://www.harchcorp.com/alternatives/${page.slug}`,
      type: 'article',
    },
  };
}

export default async function AlternativesDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = alternativesPages.find((p) => p.slug === slug);
  if (!page) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.shortDesc,
    author: { '@type': 'Organization', name: 'Harch Corp' },
    publisher: { '@type': 'Organization', name: 'Harch Corp' },
    articleSection: page.category,
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: page.title,
        acceptedAnswer: { '@type': 'Answer', text: page.verdict },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <JsonLd data={jsonLd} id="article-jsonld" />
      <JsonLd data={faqJsonLd} id="faq-jsonld" />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/alternatives" className="hover:text-white">Comparisons</Link>
          <span>/</span>
          <span className="text-zinc-300 truncate">{page.title}</span>
        </nav>

        <Link href="/alternatives" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          All Comparisons
        </Link>

        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <Trophy className="mr-1 h-3 w-3" />
            {page.category.replace('-', ' ')}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{page.title}</h1>
          <p className="mt-4 text-lg text-zinc-300">{page.shortDesc}</p>
        </div>

        {/* Intro */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 mb-8">
          <p className="text-zinc-300 leading-relaxed">{page.intro}</p>
        </div>

        {/* Alternatives ranked */}
        <div className="space-y-6 mb-8">
          {page.alternatives.map((alt, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                    #{i + 1}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{alt.name}</h2>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`h-3.5 w-3.5 ${j < alt.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500">Pricing</div>
                  <div className="text-sm font-mono text-emerald-400">{alt.pricing}</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">Pros</h3>
                  <ul className="space-y-1">
                    {alt.pros.map((pro, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-zinc-300">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-rose-400">Cons</h3>
                  <ul className="space-y-1">
                    {alt.cons.map((con, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-zinc-300">
                        <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="text-xs text-zinc-500">Best for</div>
                <div className="text-sm text-zinc-300">{alt.bestFor}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 md:p-8 mb-8">
          <h2 className="mb-3 text-xl font-semibold text-emerald-400 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Verdict
          </h2>
          <p className="text-zinc-300 leading-relaxed">{page.verdict}</p>
        </div>

        {/* Other comparisons */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Other Comparisons</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {alternativesPages.filter((p) => p.slug !== page.slug).map((p) => (
              <Link key={p.slug} href={`/alternatives/${p.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30 hover:bg-white/10">
                <div className="font-medium text-white group-hover:text-emerald-400 line-clamp-1">{p.title}</div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-zinc-600 group-hover:text-emerald-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Try Harch Corp GPU Cloud</h2>
          <p className="mb-4 text-zinc-400">Best price/performance GPU cloud with 47 gCO2/kWh carbon intensity.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/pricing"><Button>View Pricing</Button></Link>
            <Link href="/contact"><Button variant="outline">Contact Sales</Button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
