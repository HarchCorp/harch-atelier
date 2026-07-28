import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { faqPages } from '@/data/faq-calculators';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'FAQ — GPU Cloud, Datacenter, AI, Morocco | Harch Corp',
  description: 'Complete FAQs on GPU cloud pricing, H100 specs, datacenter PUE, sovereign AI, Morocco infrastructure, carbon-aware computing, and AI training. All your questions answered.',
  keywords: [
    'gpu cloud faq',
    'datacenter faq',
    'h100 faq',
    'sovereign ai faq',
    'morocco datacenter faq',
    'carbon aware computing faq',
    'ai training faq',
  ],
  alternates: { canonical: 'https://www.harchcorp.com/faq' },
  openGraph: {
    title: 'FAQ — GPU Cloud, Datacenter, AI | Harch Corp',
    description: 'Comprehensive FAQs on GPU cloud, datacenter, AI, and Morocco infrastructure.',
    url: 'https://www.harchcorp.com/faq',
  },
};

const categoryLabels: Record<string, string> = {
  'pricing': 'Pricing',
  'gpu': 'GPU',
  'datacenter': 'Datacenter',
  'ai': 'AI',
  'morocco': 'Morocco',
  'energy': 'Energy',
};

export default function FAQIndexPage() {
  const categories = [...new Set(faqPages.map((f) => f.category))];

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">FAQ</span>
        </nav>

        <div className="mb-12">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <HelpCircle className="mr-1 h-3 w-3" />
            {faqPages.length} FAQ guides · {faqPages.reduce((s, f) => s + f.faqs.length, 0)} questions
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            Frequently Asked<br />Questions
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Comprehensive FAQs on GPU cloud, datacenter, AI, Morocco infrastructure, and carbon-aware computing.
            All your technical and pricing questions, answered.
          </p>
        </div>

        {categories.map((category) => {
          const catFAQs = faqPages.filter((f) => f.category === category);
          return (
            <div key={category} className="mb-12">
              <h2 className="mb-4 text-2xl font-bold text-emerald-400">
                {categoryLabels[category] || category}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {catFAQs.map((faq) => (
                  <Link
                    key={faq.slug}
                    href={`/faq/${faq.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-emerald-500/30 hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400">
                        {faq.title}
                      </h3>
                      <ArrowRight className="h-5 w-5 flex-shrink-0 text-zinc-600 group-hover:text-emerald-400" />
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2">{faq.shortDesc}</p>
                    <div className="mt-3 text-xs text-zinc-500 font-mono">
                      {faq.faqs.length} questions
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* CTA */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Still Have Questions?</h2>
          <p className="mb-4 text-zinc-400">
            Our experts are here to help. Get personalized answers for your specific use case.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact"><Button size="lg">Contact Sales</Button></Link>
            <Link href="/intelligence"><Button size="lg" variant="outline">Explore Platform</Button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
