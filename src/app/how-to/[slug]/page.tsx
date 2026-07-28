import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { howToPages } from '@/data/generated/how-to-pages';
import { howToPages2 } from '@/data/generated/how-to-pages-2';

const allHowTo = [...howToPages, ...howToPages2];
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';
interface PageProps { params: Promise<{ slug: string }> }
export async function generateStaticParams() { return allHowTo.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params; const page = allHowTo.find((p) => p.slug === slug);
  if (!page) return { title: 'Not found' };
  return { title: `${page.title} | Harch Corp`, description: page.metaDescription, keywords: page.keywords, alternates: { canonical: `https://www.harchcorp.com/how-to/${page.slug}` } };
}
export default async function HowToPage({ params }: PageProps) {
  const { slug } = await params; const page = allHowTo.find((p) => p.slug === slug);
  if (!page) notFound();
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/guides" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="w-4 h-4" />All Guides</Link>
        <div className="mb-8"><Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400"><BookOpen className="mr-1 h-3 w-3" />How-To Guide</Badge><h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{page.title}</h1><p className="mt-4 text-lg text-zinc-300">{page.shortDesc}</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 mb-8"><p className="text-zinc-300 leading-relaxed">{page.intro}</p></div>
        <div className="space-y-4 mb-8">{page.steps.map((step, i) => (<div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5"><div className="flex items-start gap-4"><div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold">{i + 1}</div><p className="text-zinc-300 leading-relaxed pt-1">{step}</p></div></div>))}</div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center"><h2 className="mb-2 text-2xl font-bold text-white">Try on Harch Corp</h2><p className="mb-4 text-zinc-400">Deploy {page.tool} on our carbon-aware GPU cloud.</p><Link href="/pricing"><Button>View Pricing</Button></Link></div>
      </div>
    </main>
  );
}
