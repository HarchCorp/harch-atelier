import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { blogArticles, guides } from '@/data/pricing-blog-guides';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'AI Infrastructure Blog & Guides | Harch Corp',
  description: 'In-depth articles on GPU cloud, datacenter, AI training, sovereign AI, and Morocco tech. Guides, tutorials, and best practices for AI infrastructure.',
  keywords: ['ai infrastructure blog', 'gpu cloud guide', 'datacenter guide', 'ai training tutorial', 'morocco tech blog'],
  alternates: { canonical: 'https://www.harchcorp.com/learn' },
  openGraph: {
    title: 'AI Infrastructure Blog & Guides | Harch Corp',
    description: 'In-depth articles and guides on GPU cloud, datacenter, and AI infrastructure.',
    url: 'https://www.harchcorp.com/learn',
  },
};

const categoryLabels: Record<string, string> = {
  'gpu-cloud': 'GPU Cloud',
  'datacenter': 'Datacenter',
  'ai': 'AI',
  'energy': 'Energy',
  'morocco': 'Morocco',
  'business': 'Business',
};

export default function LearnIndexPage() {
  const categories = [...new Set(blogArticles.map((a) => a.category))];

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Learn</span>
        </nav>

        <div className="mb-12">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <BookOpen className="mr-1 h-3 w-3" />
            {blogArticles.length} articles · {guides.length} guides
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            AI Infrastructure<br />Blog & Guides
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            In-depth articles on GPU cloud, datacenter efficiency, AI training, sovereign AI, and Morocco tech.
            Practical guides and best practices from Harch Corp experts.
          </p>
        </div>

        {/* Articles by category */}
        {categories.map((category) => {
          const catArticles = blogArticles.filter((a) => a.category === category);
          return (
            <div key={category} className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-emerald-400">
                {categoryLabels[category] || category}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {catArticles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/learn/${article.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-emerald-500/30 hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400">
                        {article.title}
                      </h3>
                      <ArrowRight className="h-5 w-5 flex-shrink-0 text-zinc-600 group-hover:text-emerald-400" />
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2">{article.shortDesc}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime} min read
                      </span>
                      <span>·</span>
                      <span>{article.sections.length} sections</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* Guides section */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-cyan-400">Step-by-Step Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {guides.map((guide) => (
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

        {/* CTA */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Ready to Build?</h2>
          <p className="mb-4 text-zinc-400">
            Apply what you&apos;ve learned on Harch Corp&apos;s carbon-aware GPU cloud.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/intelligence"><Button size="lg">Explore Platform</Button></Link>
            <Link href="/pricing"><Button size="lg" variant="outline">View Pricing</Button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
