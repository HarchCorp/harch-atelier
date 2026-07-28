import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, ArrowRight } from 'lucide-react';
import { moroccanCities, serviceLines } from '@/data/seo-pages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return moroccanCities.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = moroccanCities.find((c) => c.slug === citySlug);
  if (!city) return { title: 'Not found' };

  return {
    title: `Datacenter, GPU Cloud & AI Infrastructure in ${city.name} | Harch Corp`,
    description: `Harch Corp provides carbon-aware GPU cloud, datacenter colocation, and AI infrastructure in ${city.name}, Morocco. ${city.strategicAdvantages[0]}.`,
    keywords: [
      `${city.name.toLowerCase()} datacenter`,
      `${city.name.toLowerCase()} gpu cloud`,
      `${city.name.toLowerCase()} cloud infrastructure`,
      `${city.name.toLowerCase()} ai infrastructure`,
      `${city.name.toLowerCase()} colocation`,
      'morocco datacenter',
    ],
    alternates: {
      canonical: `https://www.harchcorp.com/morocco/${city.slug}`,
    },
    openGraph: {
      title: `Infrastructure in ${city.name} | Harch Corp`,
      description: `Carbon-aware GPU cloud and datacenter services in ${city.name}, Morocco.`,
      url: `https://www.harchcorp.com/morocco/${city.slug}`,
    },
  };
}

export default async function CityPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const city = moroccanCities.find((c) => c.slug === citySlug);
  if (!city) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: city.name,
    description: city.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressRegion: city.region,
      addressCountry: 'MA',
    },
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/morocco" className="hover:text-white">Morocco</Link>
          <span>/</span>
          <span className="text-zinc-300">{city.name}</span>
        </nav>

        <Link href="/morocco" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Morocco
        </Link>

        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400">
            <MapPin className="mr-1 h-3 w-3" />
            {city.region}, Morocco
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Infrastructure in {city.name}
          </h1>
          <p className="mt-4 text-lg text-zinc-300">{city.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
          {city.keyStats.latencyToEurope && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Latency to EU</div>
              <div className="mt-1 font-mono text-lg text-emerald-400">{city.keyStats.latencyToEurope}</div>
            </div>
          )}
          {city.keyStats.powerCost && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Power Cost</div>
              <div className="mt-1 font-mono text-lg text-emerald-400">{city.keyStats.powerCost}</div>
            </div>
          )}
          {city.keyStats.renewablePercentage && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Renewables</div>
              <div className="mt-1 font-mono text-lg text-emerald-400">{city.keyStats.renewablePercentage}</div>
            </div>
          )}
          {city.keyStats.fiberConnections && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wider text-zinc-500">Fiber Links</div>
              <div className="mt-1 font-mono text-lg text-emerald-400">{city.keyStats.fiberConnections}</div>
            </div>
          )}
        </div>

        {/* Strategic advantages */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Strategic Advantages of {city.name}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {city.strategicAdvantages.map((adv, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="mt-0.5 text-emerald-400">▸</span>
                {adv}
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Available Services in {city.name}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {serviceLines.map((service) => (
              <Link
                key={service.slug}
                href={`/morocco/${city.slug}/${service.slug}`}
                className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:border-emerald-500/30 hover:bg-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white group-hover:text-emerald-400">{service.name}</h3>
                  <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400" />
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2">{service.shortDesc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">Build in {city.name}</h2>
          <p className="mb-4 text-zinc-400">
            Carbon-aware infrastructure powered by 100% renewable energy.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/intelligence"><Button>Explore Platform</Button></Link>
            <Link href="/contact"><Button variant="outline">Contact Sales</Button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
