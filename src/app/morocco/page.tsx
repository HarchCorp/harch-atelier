import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { moroccanCities } from '@/data/seo-pages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Datacenter, GPU Cloud & AI Infrastructure in Morocco | Harch Corp',
  description: 'Harch Corp operates carbon-aware GPU cloud, datacenter, and AI infrastructure across Morocco — Casablanca, Rabat, Tangier, Marrakech, Agadir, Dakhla, Fès, Oujda. Powered by 100% renewable energy.',
  keywords: [
    'morocco datacenter',
    'morocco gpu cloud',
    'morocco ai infrastructure',
    'casablanca datacenter',
    'tanger datacenter',
    'carbon-aware computing morocco',
    'sovereign ai morocco',
    'north africa cloud infrastructure',
  ],
  alternates: {
    canonical: 'https://www.harchcorp.com/morocco',
  },
  openGraph: {
    title: 'Carbon-Aware Infrastructure in Morocco | Harch Corp',
    description: '8 strategic locations across Morocco. 100% renewable energy. 47 gCO2/kWh carbon intensity.',
    url: 'https://www.harchcorp.com/morocco',
  },
};

export default function MoroccoPage() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-zinc-300">Morocco</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <MapPin className="mr-1 h-3 w-3" />
            8 strategic locations
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            Carbon-Aware Infrastructure<br />Across Morocco
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Harch Corp operates GPU cloud, datacenter, and AI infrastructure across {moroccanCities.length} strategic Moroccan cities.
            Powered by 100% renewable energy with 47 gCO2/kWh carbon intensity — among the lowest in the world.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-12">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Locations</div>
            <div className="mt-1 font-mono text-2xl text-emerald-400">{moroccanCities.length}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Carbon Intensity</div>
            <div className="mt-1 font-mono text-2xl text-emerald-400">47 gCO₂/kWh</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wider text-zinc-500">PUE Range</div>
            <div className="mt-1 font-mono text-2xl text-emerald-400">1.08-1.24</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Renewable Energy</div>
            <div className="mt-1 font-mono text-2xl text-emerald-400">100%</div>
          </div>
        </div>

        {/* Cities grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {moroccanCities.map((city) => (
            <Link
              key={city.slug}
              href={`/morocco/${city.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-emerald-500/30 hover:bg-white/10"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-xl font-bold text-white group-hover:text-emerald-400">{city.name}</h2>
                <ArrowRight className="h-5 w-5 text-zinc-600 group-hover:text-emerald-400" />
              </div>
              <p className="text-xs text-zinc-500 mb-3">{city.region} · Pop. {city.population.toLocaleString()}</p>
              <p className="text-sm text-zinc-400 line-clamp-3">{city.description}</p>
              {city.keyStats.latencyToEurope && (
                <div className="mt-3 text-xs font-mono text-emerald-400">
                  ⚡ {city.keyStats.latencyToEurope}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Build in Morocco</h2>
          <p className="mb-4 text-zinc-400">
            Strategic location between Europe and Africa. 100% renewable energy. Sovereign infrastructure.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/intelligence"><Button size="lg">Explore Platform</Button></Link>
            <Link href="/pricing"><Button size="lg" variant="outline">View Pricing</Button></Link>
            <Link href="/contact"><Button size="lg" variant="ghost">Contact Sales</Button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
