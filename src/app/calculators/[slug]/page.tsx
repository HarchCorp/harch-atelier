import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calculator as CalcIcon } from 'lucide-react';
import { calculators } from '@/data/faq-calculators';
import { CalculatorEngine } from '../CalculatorEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return calculators.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const calc = calculators.find((c) => c.slug === slug);
  if (!calc) return { title: 'Not found' };

  return {
    title: `${calc.title} | Harch Corp`,
    description: calc.metaDescription,
    keywords: calc.keywords,
    alternates: { canonical: `https://www.harchcorp.com/calculators/${calc.slug}` },
    openGraph: {
      title: calc.title,
      description: calc.shortDesc,
      url: `https://www.harchcorp.com/calculators/${calc.slug}`,
      type: 'website',
    },
  };
}

export default async function CalculatorPage({ params }: PageProps) {
  const { slug } = await params;
  const calc = calculators.find((c) => c.slug === slug);
  if (!calc) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: calc.title,
    description: calc.shortDesc,
    applicationCategory: 'Calculator',
    provider: { '@type': 'Organization', name: 'Harch Corp' },
    url: `https://www.harchcorp.com/calculators/${calc.slug}`,
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/calculators" className="hover:text-white">Calculators</Link>
          <span>/</span>
          <span className="text-zinc-300 truncate">{calc.title}</span>
        </nav>

        <Link href="/calculators" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          All Calculators
        </Link>

        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <CalcIcon className="mr-1 h-3 w-3" />
            {calc.category}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{calc.title}</h1>
          <p className="mt-4 text-lg text-zinc-300">{calc.shortDesc}</p>
        </div>

        {/* Calculator */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          <CalculatorEngine type={calc.type} />
        </div>

        {/* Disclaimer */}
        <div className="mt-6 rounded-xl bg-white/5 p-4 text-xs text-zinc-500">
          <strong>Note:</strong> These calculators provide estimates based on typical configurations and pricing.
          Actual costs and performance may vary. Contact Harch Corp for detailed quotes and custom infrastructure planning.
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Ready to Deploy?</h2>
          <p className="mb-4 text-zinc-400">
            Get a custom quote based on your specific workload requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact"><Button>Get a Quote</Button></Link>
            <Link href="/pricing"><Button variant="outline">View Pricing</Button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
