import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Trophy, Star, Check, X } from 'lucide-react';
import { alternativesPages } from '@/data/alternatives-pages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Best GPU Cloud Providers & Alternatives 2025 | Harch Corp',
  description: 'Compare the best GPU cloud providers and alternatives to AWS, vLLM, and more. Rankings by price, performance, and carbon footprint.',
  keywords: ['best gpu cloud', 'aws alternatives', 'gpu cloud comparison', 'vllm alternatives', 'best gpu provider 2025'],
  alternates: { canonical: 'https://www.harchcorp.com/alternatives' },
  openGraph: {
    title: 'Best GPU Cloud Providers & Alternatives 2025',
    description: 'Ranked comparisons of GPU cloud providers, AWS alternatives, and LLM serving frameworks.',
    url: 'https://www.harchcorp.com/alternatives',
  },
};

const categoryLabels: Record<string, string> = {
  'gpu-cloud': 'GPU Cloud',
  'datacenter': 'Datacenter',
  'ai-tools': 'AI Tools',
  'cloud-provider': 'Cloud Providers',
};

export default function AlternativesIndexPage() {
  const categories = [...new Set(alternativesPages.map((p) => p.category))];

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Comparisons</span>
        </nav>

        <div className="mb-12">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <Trophy className="mr-1.5 h-3 w-3" />
            {alternativesPages.length} ranked comparisons
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            Best GPU Cloud Providers<br />& Alternatives 2025
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Independent rankings of GPU cloud providers, AWS alternatives, and AI tools.
            Compare by price, performance, carbon footprint, and features.
          </p>
        </div>

        {categories.map((category) => {
          const catPages = alternativesPages.filter((p) => p.category === category);
          return (
            <div key={category} className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-emerald-400">
                {categoryLabels[category] || category}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {catPages.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/alternatives/${page.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-emerald-500/30 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400">
                        {page.title}
                      </h3>
                      <ArrowRight className="h-5 w-5 flex-shrink-0 text-zinc-600 group-hover:text-emerald-400" />
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2">{page.shortDesc}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-[10px]">
                        {page.alternatives.length} compared
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Need Help Choosing?</h2>
          <p className="mb-4 text-zinc-400">Our experts can help you select the right infrastructure.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact"><Button size="lg">Talk to an Expert</Button></Link>
            <Link href="/pricing"><Button size="lg" variant="outline">View Pricing</Button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
