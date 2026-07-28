import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sun, Zap, Server, Building2 } from 'lucide-react';
import { keywordLandingPages } from '@/data/generated/keyword-landing-pages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';
interface PageProps { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return keywordLandingPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = keywordLandingPages.find((p) => p.slug === slug);
  if (!page) return { title: 'Not found' };
  return {
    title: `${page.title} | Harch Corp`,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: { canonical: `https://www.harchcorp.com/kw/${page.slug}` },
    openGraph: { title: page.title, description: page.shortDesc, url: `https://www.harchcorp.com/kw/${page.slug}` },
  };
}

export default async function KeywordLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = keywordLandingPages.find((p) => p.slug === slug);
  if (!page) notFound();

  const icon = page.category === 'solaire' ? <Sun className="h-5 w-5 text-amber-400" />
    : page.category === 'gpu-cloud' ? <Zap className="h-5 w-5 text-emerald-400" />
    : page.category === 'datacenter' ? <Server className="h-5 w-5 text-cyan-400" />
    : <Building2 className="h-5 w-5 text-violet-400" />;

  // Find related pages
  const related = keywordLandingPages
    .filter((p) => p.category === page.category && p.slug !== page.slug)
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />Harch Corp
        </Link>

        <div className="mb-8">
          <Badge variant="outline" className={`mb-3 ${page.category === 'solaire' ? 'border-amber-500/30 text-amber-400' : page.category === 'gpu-cloud' ? 'border-emerald-500/30 text-emerald-400' : page.category === 'datacenter' ? 'border-cyan-500/30 text-cyan-400' : 'border-violet-500/30 text-violet-400'}`}>
            {icon}
            <span className="ml-1.5">{page.category}</span>
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{page.title}</h1>
          <p className="mt-4 text-lg text-zinc-300">{page.shortDesc}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 mb-8">
          <p className="text-zinc-300 leading-relaxed">{page.intro}</p>
        </div>

        <div className="space-y-8 mb-8">
          {page.sections.map((s, i) => (
            <section key={i}>
              <h2 className="mb-3 text-2xl font-bold text-emerald-400">{s.heading}</h2>
              <p className="text-zinc-300 leading-relaxed">{s.content}</p>
            </section>
          ))}
        </div>

        {/* Direct CTA */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center mb-8">
          <h2 className="mb-2 text-2xl font-bold text-white">{page.ctaText}</h2>
          <p className="mb-4 text-zinc-400">Devis gratuit sous 48h. Sans engagement.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={page.ctaLink}>
              <Button className="bg-emerald-500 text-black hover:bg-emerald-400">{page.ctaText}</Button>
            </Link>
            <a href="tel:+212684440682">
              <Button variant="outline">Appelez: +212 684 440 682</Button>
            </a>
          </div>
        </div>

        {/* Related keywords */}
        {related.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-white">Recherches similaires</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link key={r.slug} href={`/kw/${r.slug}`} className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30">
                  <span className="text-sm text-white group-hover:text-emerald-400">{r.keyword}</span>
                  <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
