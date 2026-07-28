import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Target } from 'lucide-react';
import { useCases, serviceLines } from '@/data/seo-pages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return useCases.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const uc = useCases.find((u) => u.slug === slug);
  if (!uc) return { title: 'Not found' };

  return {
    title: `${uc.title} | Harch Corp`,
    description: uc.shortDesc,
    keywords: [
      uc.slug.replace(/-/g, ' '),
      uc.industry.toLowerCase(),
      'ai infrastructure',
      'gpu cloud use case',
    ],
    alternates: { canonical: `https://www.harchcorp.com/use-cases/${uc.slug}` },
    openGraph: {
      title: uc.title,
      description: uc.shortDesc,
      url: `https://www.harchcorp.com/use-cases/${uc.slug}`,
      type: 'article',
    },
  };
}

export default async function UseCasePage({ params }: PageProps) {
  const { slug } = await params;
  const uc = useCases.find((u) => u.slug === slug);
  if (!uc) notFound();

  const relatedServices = serviceLines.filter((s) => uc.relatedServices.includes(s.slug));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'UseCase',
    name: uc.title,
    description: uc.longDesc,
    industry: uc.industry,
    provider: { '@type': 'Organization', name: 'Harch Corp' },
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/use-cases" className="hover:text-white">Use Cases</Link>
          <span>/</span>
          <span className="text-zinc-300 truncate">{uc.title}</span>
        </nav>

        <Link href="/use-cases" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          All Use Cases
        </Link>

        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <Target className="mr-1 h-3 w-3" />
            {uc.industry}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{uc.title}</h1>
          <p className="mt-4 text-lg text-zinc-300">{uc.shortDesc}</p>
        </div>

        {/* Overview */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Overview</h2>
          <p className="text-zinc-300 leading-relaxed">{uc.longDesc}</p>
        </div>

        {/* Challenges */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 md:p-8 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Challenges
          </h2>
          <ul className="space-y-2">
            {uc.challenges.map((ch, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="mt-0.5 text-rose-400">▸</span>
                {ch}
              </li>
            ))}
          </ul>
        </div>

        {/* Solutions */}
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 md:p-8 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-cyan-400">Harch Corp Solutions</h2>
          <ul className="space-y-2">
            {uc.solutions.map((sol, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                {sol}
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 md:p-8 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-emerald-400">Benefits</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {uc.benefits.map((ben, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                <span className="text-sm text-zinc-300">{ben}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related services */}
        {relatedServices.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-white">Related Services</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedServices.map((s) => (
                <Link
                  key={s.slug}
                  href={`/morocco/casablanca/${s.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30 hover:bg-white/10"
                >
                  <div>
                    <div className="font-medium text-white group-hover:text-emerald-400">{s.name}</div>
                    <div className="text-xs text-zinc-500 line-clamp-1">{s.shortDesc}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Other use cases */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Other Use Cases</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {useCases.filter((u) => u.slug !== uc.slug).slice(0, 4).map((u) => (
              <Link
                key={u.slug}
                href={`/use-cases/${u.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30 hover:bg-white/10"
              >
                <div>
                  <div className="font-medium text-white group-hover:text-emerald-400">{u.title}</div>
                  <div className="text-xs text-zinc-500">{u.industry}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Build Your Use Case</h2>
          <p className="mb-4 text-zinc-400">
            Deploy this solution on Harch Corp&apos;s carbon-aware GPU cloud.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact"><Button>Talk to an Expert</Button></Link>
            <Link href="/pricing"><Button variant="outline">View Pricing</Button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
