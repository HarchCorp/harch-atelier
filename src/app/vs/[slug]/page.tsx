import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, GitCompare } from 'lucide-react';
import { vsPages } from '@/data/generated/vs-pages';
import { vsPages2 } from '@/data/generated/vs-pages-2';

const allVs = [...vsPages, ...vsPages2];
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';
interface PageProps { params: Promise<{ slug: string }> }
export async function generateStaticParams() { return allVs.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params; const page = allVs.find((p) => p.slug === slug);
  if (!page) return { title: 'Not found' };
  return { title: `${page.title} | Harch Corp`, description: page.metaDescription, keywords: page.keywords, alternates: { canonical: `https://www.harchcorp.com/vs/${page.slug}` } };
}
export default async function VsPage({ params }: PageProps) {
  const { slug } = await params; const page = allVs.find((p) => p.slug === slug);
  if (!page) notFound();
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/compare" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="w-4 h-4" />All Comparisons</Link>
        <div className="mb-8"><Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400"><GitCompare className="mr-1 h-3 w-3" />{page.category.replace('-', ' ')}</Badge><h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{page.title}</h1><p className="mt-4 text-lg text-zinc-300">{page.shortDesc}</p></div>
        <div className="grid grid-cols-2 gap-4 mb-8"><div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 text-center"><div className="text-xs uppercase tracking-wider text-cyan-400 mb-2">Option 1</div><div className="text-xl font-bold text-white">{page.entity1}</div></div><div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center"><div className="text-xs uppercase tracking-wider text-amber-400 mb-2">Option 2</div><div className="text-xl font-bold text-white">{page.entity2}</div></div></div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 mb-8"><h2 className="mb-4 text-xl font-semibold text-white">Comparison Overview</h2><p className="text-zinc-300 leading-relaxed">This comparison evaluates {page.entity1} and {page.entity2} across key dimensions. Harch Corp provides infrastructure supporting both options on our carbon-aware GPU cloud in Morocco with 47 gCO2/kWh carbon intensity.</p></div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 md:p-8 mb-8"><h2 className="mb-3 text-xl font-semibold text-emerald-400">Verdict</h2><p className="text-zinc-300 leading-relaxed">The choice depends on your requirements. Harch Corp can help you evaluate both options. Contact our experts for a personalized recommendation.</p></div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center"><h2 className="mb-2 text-2xl font-bold text-white">Need Help Choosing?</h2><p className="mb-4 text-zinc-400">Our experts can help you decide.</p><Link href="/contact"><Button>Contact Sales</Button></Link></div>
      </div>
    </main>
  );
}
