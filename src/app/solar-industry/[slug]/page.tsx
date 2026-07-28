import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';
interface PageProps { params: Promise<{ slug: string }> }

export default async function GenericSolarPage({ params }: PageProps) {
  const { slug } = await params;
  // Dynamic import based on route
  const route: string = 'solar-industry';
  let page: any = null;

  try {
    if (route === 'solar-industry') {
      const { solarIndustryPages } = await import('@/data/generated/solar-industry-pages');
      page = solarIndustryPages.find((p) => p.slug === slug);
    } else if (route === 'energy-blog') {
      const { energyArticles } = await import('@/data/generated/energy-articles');
      page = energyArticles.find((p) => p.slug === slug);
    } else if (route === 'solar-faq') {
      const { solarFaqPages } = await import('@/data/generated/solar-faq-pages');
      page = solarFaqPages.find((p) => p.slug === slug);
    } else if (route === 'solar-compare') {
      const { solarComparisonPages } = await import('@/data/generated/solar-comparison-pages');
      page = solarComparisonPages.find((p) => p.slug === slug);
    } else if (route === 'morocco-solar') {
      const { moroccoSolarPages } = await import('@/data/generated/morocco-solar-pages');
      page = moroccoSolarPages.find((p) => p.slug === slug);
    }
  } catch (e) {}

  if (!page) notFound();

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/subsidiaries/energy" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="w-4 h-4" />Harch Energy</Link>
        <div className="mb-8"><Badge variant="outline" className="mb-3 border-amber-500/30 text-amber-400"><Sun className="mr-1 h-3 w-3" />Solaire B2B Maroc</Badge><h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{page.title}</h1><p className="mt-4 text-lg text-zinc-300">{page.shortDesc || page.metaDescription}</p></div>
        {page.intro && <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 mb-8"><p className="text-zinc-300 leading-relaxed">{page.intro}</p></div>}
        {page.sections && <div className="space-y-8">{page.sections.map((s: any, i: number) => (<section key={i}><h2 className="mb-3 text-2xl font-bold text-amber-400">{s.heading}</h2><p className="text-zinc-300 leading-relaxed">{s.content}</p></section>))}</div>}
        {page.faqs && <div className="space-y-4 mb-8">{page.faqs.map((f: any, i: number) => (<div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5"><h3 className="mb-2 font-semibold text-amber-400">{f.question}</h3><p className="text-zinc-300 text-sm">{f.answer}</p></div>))}</div>}
        {page.entity1 && page.entity2 && <div className="grid grid-cols-2 gap-4 mb-8"><div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 text-center"><div className="text-xl font-bold text-white">{page.entity1}</div></div><div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center"><div className="text-xl font-bold text-white">{page.entity2}</div></div></div>}
        <div className="mt-12 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center"><h2 className="mb-2 text-2xl font-bold text-white">Réduisez votre facture ONEE de 40 à 60%</h2><p className="mb-4 text-zinc-400">Devis gratuit sous 48h. Sans engagement.</p><div className="flex flex-wrap justify-center gap-3"><Link href="/quote?vertical=energy"><Button className="bg-amber-500 text-black hover:bg-amber-400">Demander mon devis</Button></Link><a href="tel:+212684440682"><Button variant="outline">Appelez: +212 684 440 682</Button></a></div></div>
      </div>
    </main>
  );
}
