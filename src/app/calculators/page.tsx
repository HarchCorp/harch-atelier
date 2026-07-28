import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator as CalcIcon } from 'lucide-react';
import { calculators } from '@/data/faq-calculators';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Free AI Infrastructure Calculators | Harch Corp',
  description: 'Free calculators: GPU cloud cost, TCO comparison, PUE, AI carbon footprint, LLM training time, inference throughput. Plan your AI infrastructure.',
  keywords: [
    'gpu cost calculator',
    'tco calculator',
    'pue calculator',
    'ai carbon footprint calculator',
    'llm training time calculator',
    'inference throughput calculator',
  ],
  alternates: { canonical: 'https://www.harchcorp.com/calculators' },
  openGraph: {
    title: 'Free AI Infrastructure Calculators | Harch Corp',
    description: 'Plan your AI infrastructure with our free calculators.',
    url: 'https://www.harchcorp.com/calculators',
  },
};

const categoryLabels: Record<string, string> = {
  'cost': 'Cost',
  'performance': 'Performance',
  'sustainability': 'Sustainability',
};

export default function CalculatorsIndexPage() {
  const categories = [...new Set(calculators.map((c) => c.category))];

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Calculators</span>
        </nav>

        <div className="mb-12">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <CalcIcon className="mr-1 h-3 w-3" />
            {calculators.length} free calculators
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            AI Infrastructure<br />Calculators
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Free interactive calculators for GPU cloud costs, TCO comparison, datacenter efficiency,
            AI carbon footprint, and model performance. Plan your infrastructure with precision.
          </p>
        </div>

        {categories.map((category) => {
          const catCalcs = calculators.filter((c) => c.category === category);
          return (
            <div key={category} className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-emerald-400">
                {categoryLabels[category] || category}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {catCalcs.map((calc) => (
                  <Link
                    key={calc.slug}
                    href={`/calculators/${calc.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-emerald-500/30 hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400">
                        {calc.title}
                      </h3>
                      <ArrowRight className="h-5 w-5 flex-shrink-0 text-zinc-600 group-hover:text-emerald-400" />
                    </div>
                    <p className="text-sm text-zinc-400">{calc.shortDesc}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* CTA */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Need Custom Calculations?</h2>
          <p className="mb-4 text-zinc-400">
            Our experts can help with custom TCO analysis and infrastructure planning.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact"><Button size="lg">Talk to an Expert</Button></Link>
            <Link href="/pricing"><Button size="lg" variant="outline">View Pricing</Button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
