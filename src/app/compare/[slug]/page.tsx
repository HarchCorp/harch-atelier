import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, GitCompare, Check, X } from 'lucide-react';
import { comparisons } from '@/data/seo-pages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comp = comparisons.find((c) => c.slug === slug);
  if (!comp) return { title: 'Not found' };

  return {
    title: `${comp.title} | Harch Corp`,
    description: comp.shortDesc,
    keywords: [
      comp.slug.replace(/-/g, ' '),
      `${comp.entity1.name.toLowerCase()} vs ${comp.entity2.name.toLowerCase()}`,
      comp.entity1.name.toLowerCase(),
      comp.entity2.name.toLowerCase(),
    ],
    alternates: {
      canonical: `https://www.harchcorp.com/compare/${comp.slug}`,
    },
    openGraph: {
      title: comp.title,
      description: comp.shortDesc,
      url: `https://www.harchcorp.com/compare/${comp.slug}`,
      type: 'article',
    },
  };
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const comp = comparisons.find((c) => c.slug === slug);
  if (!comp) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: comp.title,
    description: comp.shortDesc,
    author: { '@type': 'Organization', name: 'Harch Corp' },
    publisher: { '@type': 'Organization', name: 'Harch Corp' },
    mainEntity: {
      '@type': 'Thing',
      name: `${comp.entity1.name} vs ${comp.entity2.name}`,
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${comp.entity1.name} vs ${comp.entity2.name}: which is better?`,
        acceptedAnswer: { '@type': 'Answer', text: comp.verdict },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <JsonLd data={jsonLd} />
      <JsonLd data={faqJsonLd} />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/compare" className="hover:text-white">Comparisons</Link>
          <span>/</span>
          <span className="text-zinc-300 truncate">{comp.entity1.name} vs {comp.entity2.name}</span>
        </nav>

        <Link href="/compare" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          All Comparisons
        </Link>

        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <GitCompare className="mr-1 h-3 w-3" />
            {comp.category.replace('-', ' ')}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            {comp.title}
          </h1>
          <p className="mt-4 text-lg text-zinc-300">{comp.shortDesc}</p>
        </div>

        {/* Overview */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Overview</h2>
          <p className="text-zinc-300 leading-relaxed">{comp.longDesc}</p>
        </div>

        {/* Comparison table */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {/* Entity 1 */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
            <h2 className="mb-4 text-2xl font-bold text-cyan-400">{comp.entity1.name}</h2>

            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">Pros</h3>
            <ul className="mb-4 space-y-1">
              {comp.entity1.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                  {pro}
                </li>
              ))}
            </ul>

            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-rose-400">Cons</h3>
            <ul className="mb-4 space-y-1">
              {comp.entity1.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
                  {con}
                </li>
              ))}
            </ul>

            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">Key Specs</h3>
            <div className="space-y-1">
              {Object.entries(comp.entity1.keySpecs).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-white/5 pb-1 text-sm">
                  <span className="text-zinc-500">{key}</span>
                  <span className="font-mono text-zinc-300">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Entity 2 */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
            <h2 className="mb-4 text-2xl font-bold text-amber-400">{comp.entity2.name}</h2>

            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">Pros</h3>
            <ul className="mb-4 space-y-1">
              {comp.entity2.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                  {pro}
                </li>
              ))}
            </ul>

            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-rose-400">Cons</h3>
            <ul className="mb-4 space-y-1">
              {comp.entity2.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
                  {con}
                </li>
              ))}
            </ul>

            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">Key Specs</h3>
            <div className="space-y-1">
              {Object.entries(comp.entity2.keySpecs).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-white/5 pb-1 text-sm">
                  <span className="text-zinc-500">{key}</span>
                  <span className="font-mono text-zinc-300">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 md:p-8 mb-8">
          <h2 className="mb-3 text-xl font-semibold text-emerald-400">Verdict</h2>
          <p className="text-zinc-300 leading-relaxed">{comp.verdict}</p>
        </div>

        {/* Other comparisons */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Other Comparisons</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {comparisons.filter((c) => c.slug !== comp.slug).slice(0, 4).map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30 hover:bg-white/10"
              >
                <div className="font-medium text-white group-hover:text-emerald-400">{c.title}</div>
                <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Ready to Choose?</h2>
          <p className="mb-4 text-zinc-400">
            Talk to our infrastructure experts for personalized recommendations.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact"><Button>Contact Sales</Button></Link>
            <Link href="/pricing"><Button variant="outline">View Pricing</Button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
