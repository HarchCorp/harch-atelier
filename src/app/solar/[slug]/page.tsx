import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sun } from 'lucide-react';
import { solarSeoPages } from '@/data/generated/solar-seo-pages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';
interface PageProps { params: Promise<{ slug: string }> }
export async function generateStaticParams() { return solarSeoPages.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params; const page = solarSeoPages.find((p) => p.slug === slug);
  if (!page) return { title: 'Not found' };
  return { title: `${page.title} | Harch Energy`, description: page.metaDescription, keywords: page.keywords, alternates: { canonical: `https://www.harchcorp.com/solar/${page.slug}` } };
}
export default async function SolarSeoPage({ params }: PageProps) {
  const { slug } = await params; const page = solarSeoPages.find((p) => p.slug === slug);
  if (!page) notFound();
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/subsidiaries/energy" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="w-4 h-4" />Harch Energy</Link>
        <div className="mb-8"><Badge variant="outline" className="mb-3 border-amber-500/30 text-amber-400"><Sun className="mr-1 h-3 w-3" />Solaire B2B Maroc</Badge><h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{page.title}</h1><p className="mt-4 text-lg text-zinc-300">{page.shortDesc}</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 mb-8"><p className="text-zinc-300 leading-relaxed">{page.intro}</p></div>
        <div className="space-y-8">{page.sections.map((section, i) => (<section key={i}><h2 className="mb-3 text-2xl font-bold text-amber-400">{section.heading}</h2><p className="text-zinc-300 leading-relaxed">{section.content}</p></section>))}</div>
        <div className="mt-12 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center"><h2 className="mb-2 text-2xl font-bold text-white">Réduisez votre facture ONEE de 40 à 60%</h2><p className="mb-4 text-zinc-400">Devis gratuit sous 48h. Sans engagement.</p><div className="flex flex-wrap justify-center gap-3"><Link href="/quote?vertical=energy"><Button className="bg-amber-500 text-black hover:bg-amber-400">Demander mon devis</Button></Link><a href="tel:+212684440682"><Button variant="outline">Appelez: +212 684 440 682</Button></a></div></div>
      </div>
    </main>
  );
}
