import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Target } from 'lucide-react';
import { useCases } from '@/data/seo-pages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'AI Use Cases by Industry | Harch Corp',
  description: 'Explore AI infrastructure use cases across industries — fintech fraud detection, medical imaging, precision farming, sovereign AI, HPC research, content generation, retail recommendations, and 5G edge AI.',
  keywords: [
    'ai use cases',
    'gpu cloud use cases',
    'fintech ai fraud detection',
    'medical imaging ai',
    'precision farming ai',
    'sovereign ai government',
    'hpc university research',
    'ai content generation',
    'retail recommendation engine',
    '5g edge ai',
  ],
  alternates: { canonical: 'https://www.harchcorp.com/use-cases' },
  openGraph: {
    title: 'AI Use Cases by Industry | Harch Corp',
    description: 'Industry-specific AI infrastructure use cases powered by Harch Corp GPU cloud.',
    url: 'https://www.harchcorp.com/use-cases',
  },
};

export default function UseCasesIndexPage() {
  const industries = [...new Set(useCases.map((u) => u.industry))];

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Use Cases</span>
        </nav>

        <div className="mb-12">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <Target className="mr-1 h-3 w-3" />
            {useCases.length} use cases · {industries.length} industries
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            AI Infrastructure<br />Use Cases
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Industry-specific AI workloads powered by Harch Corp&apos;s carbon-aware GPU cloud.
            Real challenges, real solutions, real benefits.
          </p>
        </div>

        {industries.map((industry) => {
          const industryUseCases = useCases.filter((u) => u.industry === industry);
          return (
            <div key={industry} className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-emerald-400">{industry}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {industryUseCases.map((uc) => (
                  <Link
                    key={uc.slug}
                    href={`/use-cases/${uc.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-emerald-500/30 hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400">
                        {uc.title}
                      </h3>
                      <ArrowRight className="h-5 w-5 flex-shrink-0 text-zinc-600 group-hover:text-emerald-400" />
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-3">{uc.shortDesc}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* CTA */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Have a Unique Use Case?</h2>
          <p className="mb-4 text-zinc-400">
            Our team can help design custom AI infrastructure for your specific workload.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact"><Button size="lg">Talk to an Expert</Button></Link>
            <Link href="/intelligence"><Button size="lg" variant="outline">Explore Platform</Button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
