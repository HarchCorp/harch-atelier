import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, GitCompare } from 'lucide-react';
import { comparisons } from '@/data/seo-pages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'GPU & Infrastructure Comparisons | Harch Corp',
  description: 'Compare GPU models (H100 vs H200, H100 vs A100), cloud providers (Harch Corp vs AWS), datacenter locations (Morocco vs Ireland), and cooling technologies. Make informed infrastructure decisions.',
  keywords: [
    'h100 vs h200',
    'h100 vs a100',
    'gpu comparison',
    'gpu cloud comparison',
    'morocco vs ireland datacenter',
    'liquid cooling vs air cooling',
    'infiniband vs ethernet',
    'gpu cloud vs on premises',
  ],
  alternates: { canonical: 'https://www.harchcorp.com/compare' },
  openGraph: {
    title: 'GPU & Infrastructure Comparisons | Harch Corp',
    description: 'Detailed comparisons of GPU models, cloud providers, and infrastructure technologies.',
    url: 'https://www.harchcorp.com/compare',
  },
};

const categoryLabels: Record<string, string> = {
  'gpu-comparison': 'GPU Comparison',
  'provider-comparison': 'Provider Comparison',
  'tech-comparison': 'Technology Comparison',
  'cost-comparison': 'Cost Comparison',
};

export default function CompareIndexPage() {
  const categories = [...new Set(comparisons.map((c) => c.category))];

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Comparisons</span>
        </nav>

        <div className="mb-12">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <GitCompare className="mr-1 h-3 w-3" />
            {comparisons.length} comparisons
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            GPU & Infrastructure<br />Comparisons
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Compare GPU models, cloud providers, datacenter locations, and infrastructure technologies.
            Make informed decisions for your AI and cloud workloads.
          </p>
        </div>

        {categories.map((category) => {
          const catComparisons = comparisons.filter((c) => c.category === category);
          return (
            <div key={category} className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-emerald-400">
                {categoryLabels[category] || category}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {catComparisons.map((comp) => (
                  <Link
                    key={comp.slug}
                    href={`/compare/${comp.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-emerald-500/30 hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400">
                        {comp.title}
                      </h3>
                      <ArrowRight className="h-5 w-5 flex-shrink-0 text-zinc-600 group-hover:text-emerald-400" />
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2">{comp.shortDesc}</p>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-[10px]">
                        {comp.entity1.name}
                      </Badge>
                      <span className="text-zinc-500 text-xs">vs</span>
                      <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px]">
                        {comp.entity2.name}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* CTA */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Need Help Choosing?</h2>
          <p className="mb-4 text-zinc-400">
            Our experts can help you select the right GPU, provider, and infrastructure for your workloads.
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
