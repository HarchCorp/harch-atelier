import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { guides } from '@/data/pricing-blog-guides';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) return { title: 'Not found' };

  return {
    title: `${guide.title} | Harch Corp`,
    description: guide.metaDescription,
    keywords: guide.keywords,
    alternates: { canonical: `https://www.harchcorp.com/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.shortDesc,
      url: `https://www.harchcorp.com/guides/${guide.slug}`,
      type: 'article',
    },
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: guide.title,
    description: guide.shortDesc,
    step: guide.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.title,
      text: step.description,
    })),
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <JsonLd data={jsonLd} />

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/guides" className="hover:text-white">Guides</Link>
          <span>/</span>
          <span className="text-zinc-300 truncate">{guide.title}</span>
        </nav>

        <Link href="/guides" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          All Guides
        </Link>

        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3 border-cyan-500/30 text-cyan-400">
            <BookOpen className="mr-1 h-3 w-3" />
            {guide.category}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{guide.title}</h1>
          <p className="mt-4 text-lg text-zinc-300">{guide.shortDesc}</p>
          <div className="mt-4 flex items-center gap-3 text-sm text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {guide.readTime} min read
            </span>
            <span>·</span>
            <span>{guide.steps.length} steps</span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {guide.steps.map((step, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h2 className="mb-2 text-lg font-semibold text-white">{step.title}</h2>
                  <p className="text-zinc-300 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Other guides */}
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-white">More Guides</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {guides.filter((g) => g.slug !== guide.slug).slice(0, 4).map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-cyan-500/30 hover:bg-white/10">
                <div className="font-medium text-white group-hover:text-cyan-400 line-clamp-1">{g.title}</div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-zinc-600 group-hover:text-cyan-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Ready to Implement?</h2>
          <p className="mb-4 text-zinc-400">Get started on Harch Corp&apos;s GPU cloud today.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact"><Button>Get Started</Button></Link>
            <Link href="/pricing"><Button variant="outline">View Pricing</Button></Link>
          </div>
        </div>
      </article>
    </main>
  );
}
