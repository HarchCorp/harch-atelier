import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Cpu, CheckCircle2 } from 'lucide-react';
import { bestGpuPages } from '@/data/generated/best-gpu-pages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';
interface PageProps { params: Promise<{ slug: string }> }
export async function generateStaticParams() { return bestGpuPages.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params; const page = bestGpuPages.find((p) => p.slug === slug);
  if (!page) return { title: 'Not found' };
  return { title: `${page.title} | Harch Corp`, description: page.metaDescription, keywords: page.keywords, alternates: { canonical: `https://www.harchcorp.com/best-gpu-for/${page.slug}` } };
}
export default async function BestGpuPage({ params }: PageProps) {
  const { slug } = await params; const page = bestGpuPages.find((p) => p.slug === slug);
  if (!page) notFound();
  const related = bestGpuPages.filter((p) => p.task === page.task && p.slug !== page.slug).slice(0, 5);
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/pricing" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="w-4 h-4" />All GPU Pricing</Link>
        <div className="mb-8"><Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400"><Cpu className="mr-1 h-3 w-3" />{page.gpu}</Badge><h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{page.title}</h1><p className="mt-4 text-lg text-zinc-300">{page.shortDesc}</p></div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 md:p-8 mb-8"><h2 className="mb-3 text-xl font-semibold text-emerald-400 flex items-center gap-2"><CheckCircle2 className="h-5 w-5" />Verdict</h2><p className="text-zinc-300 leading-relaxed">{page.verdict}</p></div>
        {related.length > 0 && (<div className="mb-8"><h2 className="mb-4 text-xl font-semibold text-white">Other GPUs for {page.task}</h2><div className="grid gap-3 sm:grid-cols-2">{related.map((rp) => (<Link key={rp.slug} href={`/best-gpu-for/${rp.slug}`} className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30"><div><div className="font-medium text-white group-hover:text-emerald-400">{rp.gpu}</div><div className="text-xs text-zinc-500">{rp.task}</div></div><ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400" /></Link>))}</div></div>)}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center"><h2 className="mb-2 text-2xl font-bold text-white">Deploy {page.gpu} on Harch Corp</h2><p className="mb-4 text-zinc-400">Carbon-aware GPU cloud powered by 100% renewable energy.</p><div className="flex flex-wrap justify-center gap-3"><Link href="/pricing"><Button>View Pricing</Button></Link><Link href="/contact"><Button variant="outline">Contact Sales</Button></Link></div></div>
      </div>
    </main>
  );
}
