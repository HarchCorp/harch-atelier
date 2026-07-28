import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { guides } from '@/data/pricing-blog-guides';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'AI Infrastructure Guides & Tutorials | Harch Corp',
  description: 'Step-by-step guides for deploying LLMs, migrating to GPU cloud, securing AI infrastructure, optimizing distributed training, and setting up GPU Kubernetes.',
  keywords: ['ai infrastructure guide', 'gpu cloud tutorial', 'llm deployment guide', 'kubernetes gpu guide'],
  alternates: { canonical: 'https://www.harchcorp.com/guides' },
  openGraph: {
    title: 'AI Infrastructure Guides | Harch Corp',
    description: 'Step-by-step guides for AI infrastructure deployment and optimization.',
    url: 'https://www.harchcorp.com/guides',
  },
};

const categoryLabels: Record<string, string> = {
  'deployment': 'Deployment',
  'optimization': 'Optimization',
  'security': 'Security',
  'migration': 'Migration',
};

export default function GuidesIndexPage() {
  const categories = [...new Set(guides.map((g) => g.category))];

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Guides</span>
        </nav>

        <div className="mb-12">
          <Badge variant="outline" className="mb-3 border-cyan-500/30 text-cyan-400">
            <BookOpen className="mr-1 h-3 w-3" />
            {guides.length} step-by-step guides
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            AI Infrastructure<br />Guides
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Practical, step-by-step guides for deploying, optimizing, and securing AI infrastructure
            on Harch Corp&apos;s carbon-aware GPU cloud.
          </p>
        </div>

        {categories.map((category) => {
          const catGuides = guides.filter((g) => g.category === category);
          return (
            <div key={category} className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-cyan-400">
                {categoryLabels[category] || category}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {catGuides.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-cyan-500/30 hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400">
                        {guide.title}
                      </h3>
                      <ArrowRight className="h-5 w-5 flex-shrink-0 text-zinc-600 group-hover:text-cyan-400" />
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2">{guide.shortDesc}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {guide.readTime} min read
                      </span>
                      <span>·</span>
                      <span>{guide.steps.length} steps</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* CTA */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Need Help?</h2>
          <p className="mb-4 text-zinc-400">Our experts can help you implement these guides.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact"><Button size="lg">Talk to an Expert</Button></Link>
            <Link href="/intelligence"><Button size="lg" variant="outline">Explore Platform</Button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
