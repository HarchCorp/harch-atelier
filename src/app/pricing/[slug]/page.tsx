import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, DollarSign, Zap, Clock, TrendingDown } from 'lucide-react';
import { gpuModels, pricingLocations, generatePricingPages } from '@/data/pricing-blog-guides';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return generatePricingPages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = generatePricingPages().find((p) => p.slug === slug);
  if (!page) return { title: 'Not found' };

  const { gpu, location } = page;
  const title = `${gpu.name} GPU Cloud Pricing in ${location.name} | Harch Corp`;
  const description = `${gpu.name} (${gpu.memory}) GPU cloud in ${location.name}, Morocco. On-demand $${gpu.onDemandHourly}/hr, spot $${gpu.spotHourly}/hr. Carbon intensity: ${location.carbonIntensity} gCO2/kWh.`;

  return {
    title,
    description,
    keywords: [
      `${gpu.slug} price ${location.name.toLowerCase()}`,
      `${gpu.name.toLowerCase()} cost`,
      `${gpu.slug} cloud pricing`,
      `gpu cloud ${location.name.toLowerCase()}`,
      `${location.name.toLowerCase()} gpu cloud`,
    ],
    alternates: { canonical: `https://www.harchcorp.com/pricing/${slug}` },
    openGraph: { title, description, url: `https://www.harchcorp.com/pricing/${slug}` },
  };
}

export default async function PricingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = generatePricingPages().find((p) => p.slug === slug);
  if (!page) notFound();

  const { gpu, location } = page;
  const locationMultiplier = location.powerMultiplier;
  const onDemand = (gpu.onDemandHourly * locationMultiplier).toFixed(2);
  const spot = (gpu.spotHourly * locationMultiplier).toFixed(2);
  const reserved = (gpu.reservedHourly * locationMultiplier).toFixed(2);

  const monthlyOnDemand = (parseFloat(onDemand) * 24 * 30).toFixed(0);
  const monthlySpot = (parseFloat(spot) * 24 * 30).toFixed(0);
  const monthlyReserved = (parseFloat(reserved) * 24 * 30).toFixed(0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'PriceSpecification',
    priceCurrency: 'USD',
    price: onDemand,
    unitText: 'per GPU per hour',
    description: `${gpu.name} GPU cloud pricing in ${location.name}`,
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/pricing" className="hover:text-white">Pricing</Link>
          <span>/</span>
          <span className="text-zinc-300">{gpu.name} · {location.name}</span>
        </nav>

        <Link href="/pricing" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          All Pricing
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
              <DollarSign className="mr-1 h-3 w-3" />
              GPU Cloud Pricing
            </Badge>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">{location.name}, Morocco</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            {gpu.name} in {location.name}
          </h1>
          <p className="mt-4 text-lg text-zinc-300">
            {gpu.memory} · {gpu.tdp}W TDP · Released {gpu.releaseYear}
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
            <div className="text-xs uppercase tracking-wider text-cyan-400 mb-2">On-Demand</div>
            <div className="text-3xl font-bold text-white font-mono">${onDemand}<span className="text-sm text-zinc-500">/hr</span></div>
            <div className="mt-2 text-sm text-zinc-400">Guaranteed availability</div>
            <div className="mt-3 text-xs text-zinc-500">≈ ${monthlyOnDemand}/month (24/7)</div>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
            <div className="text-xs uppercase tracking-wider text-amber-400 mb-2">Spot (Preemptible)</div>
            <div className="text-3xl font-bold text-white font-mono">${spot}<span className="text-sm text-zinc-500">/hr</span></div>
            <div className="mt-2 text-sm text-zinc-400">{((1 - parseFloat(spot) / parseFloat(onDemand)) * 100).toFixed(0)}% off · can be interrupted</div>
            <div className="mt-3 text-xs text-zinc-500">≈ ${monthlySpot}/month (24/7)</div>
          </div>
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
            <div className="text-xs uppercase tracking-wider text-violet-400 mb-2">Reserved (1-year)</div>
            <div className="text-3xl font-bold text-white font-mono">${reserved}<span className="text-sm text-zinc-500">/hr</span></div>
            <div className="mt-2 text-sm text-zinc-400">{((1 - parseFloat(reserved) / parseFloat(onDemand)) * 100).toFixed(0)}% off · 1-year commit</div>
            <div className="mt-3 text-xs text-zinc-500">≈ ${monthlyReserved}/month (24/7)</div>
          </div>
        </div>

        {/* Specs */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">{gpu.name} Specifications</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-zinc-500">Memory</span>
              <span className="font-mono text-white">{gpu.memory}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-zinc-500">TDP</span>
              <span className="font-mono text-white">{gpu.tdp}W</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-zinc-500">Release Year</span>
              <span className="font-mono text-white">{gpu.releaseYear}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-zinc-500">Best For</span>
              <span className="text-white text-sm">{gpu.bestFor}</span>
            </div>
          </div>
        </div>

        {/* Location info */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Why {location.name}?</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-zinc-500">Carbon Intensity</div>
              <div className="font-mono text-emerald-400 text-lg">{location.carbonIntensity} gCO₂/kWh</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">Power Cost Index</div>
              <div className="font-mono text-emerald-400 text-lg">{(location.powerMultiplier * 100).toFixed(0)}% of base</div>
            </div>
          </div>
        </div>

        {/* Cost examples */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Cost Examples</h2>
          <div className="space-y-3">
            {[
              { gpus: 1, hours: 100, label: '1 GPU × 100 hours (experiment)' },
              { gpus: 8, hours: 24, label: '8 GPUs × 24 hours (fine-tuning)' },
              { gpus: 64, hours: 168, label: '64 GPUs × 1 week (training)' },
            ].map((ex, i) => (
              <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-zinc-300">{ex.label}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-white">${(parseFloat(onDemand) * ex.gpus * ex.hours).toFixed(0)}</div>
                  <div className="text-xs text-zinc-500">on-demand</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other GPUs in this location */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Other GPUs in {location.name}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gpuModels.filter((g) => g.slug !== gpu.slug).slice(0, 6).map((g) => (
              <Link key={g.slug} href={`/pricing/${g.slug}-${location.slug}`}
                className="group rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30 hover:bg-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white group-hover:text-emerald-400">{g.name}</span>
                  <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400" />
                </div>
                <div className="text-xs text-zinc-500 mt-1">${(g.onDemandHourly * locationMultiplier).toFixed(2)}/hr</div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Deploy {gpu.name} in {location.name}</h2>
          <p className="mb-4 text-zinc-400">Carbon-aware GPU cloud powered by 100% renewable energy.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact"><Button>Get Started</Button></Link>
            <Link href="/calculators/gpu-cloud-cost-calculator"><Button variant="outline">Cost Calculator</Button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
