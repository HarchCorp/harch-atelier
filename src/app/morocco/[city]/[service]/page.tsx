import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MapPin, Server, CheckCircle2 } from 'lucide-react';
import { moroccanCities, serviceLines } from '@/data/seo-pages';
import { glossaryTerms } from '@/data/glossary-terms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ city: string; service: string }>;
}

export async function generateStaticParams() {
  return moroccanCities.flatMap((city) =>
    serviceLines.map((service) => ({
      city: city.slug,
      service: service.slug,
    }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug, service: serviceSlug } = await params;
  const city = moroccanCities.find((c) => c.slug === citySlug);
  const service = serviceLines.find((s) => s.slug === serviceSlug);
  if (!city || !service) return { title: 'Not found' };

  const title = `${service.name} in ${city.name} | Harch Corp`;
  const description = `${service.shortDesc} Available in ${city.name}, Morocco. ${city.strategicAdvantages[0]}.`;

  return {
    title,
    description,
    keywords: [
      `${service.slug} ${city.name.toLowerCase()}`,
      `${service.slug} morocco`,
      `${service.name.toLowerCase()} ${city.name.toLowerCase()}`,
      `${city.name.toLowerCase()} datacenter`,
      `${city.name.toLowerCase()} gpu cloud`,
      'morocco cloud infrastructure',
    ],
    alternates: {
      canonical: `https://www.harchcorp.com/morocco/${city.slug}/${service.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.harchcorp.com/morocco/${city.slug}/${service.slug}`,
      type: 'website',
    },
  };
}

export default async function LocationServicePage({ params }: PageProps) {
  const { city: citySlug, service: serviceSlug } = await params;
  const city = moroccanCities.find((c) => c.slug === citySlug);
  const service = serviceLines.find((s) => s.slug === serviceSlug);
  if (!city || !service) notFound();

  const relatedGlossary = glossaryTerms
    .filter((t) => t.category === service.category)
    .slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.name} in ${city.name}`,
    description: service.longDesc,
    provider: { '@type': 'Organization', name: 'Harch Corp' },
    areaServed: { '@type': 'City', name: city.name },
    serviceType: service.name,
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Does Harch Corp offer ${service.name.toLowerCase()} in ${city.name}?`,
        acceptedAnswer: { '@type': 'Answer', text: `Yes, Harch Corp provides ${service.name.toLowerCase()} in ${city.name}, Morocco. ${service.shortDesc}` },
      },
      {
        '@type': 'Question',
        name: `What are the advantages of ${city.name} for ${service.name.toLowerCase()}?`,
        acceptedAnswer: { '@type': 'Answer', text: city.strategicAdvantages.join('. ') },
      },
      {
        '@type': 'Question',
        name: `What is the latency from ${city.name} to Europe?`,
        acceptedAnswer: { '@type': 'Answer', text: `Latency from ${city.name} to Europe: ${city.keyStats.latencyToEurope || 'N/A'}.` },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      <JsonLd data={jsonLd} />
      <JsonLd data={faqJsonLd} />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/morocco" className="hover:text-white">Morocco</Link>
          <span>/</span>
          <Link href={`/morocco/${city.slug}`} className="hover:text-white">{city.name}</Link>
          <span>/</span>
          <span className="text-zinc-300">{service.name}</span>
        </nav>

        <Link href={`/morocco/${city.slug}`} className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to {city.name}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
              <MapPin className="mr-1 h-3 w-3" />
              {city.name}, Morocco
            </Badge>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
              {service.category}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            {service.name} in {city.name}
          </h1>
          <p className="mt-4 text-lg text-zinc-300">{service.shortDesc}</p>
        </div>

        {/* Description */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Overview</h2>
          <p className="text-zinc-300 leading-relaxed mb-4">{service.longDesc}</p>
          <p className="text-zinc-300 leading-relaxed">
            Our {service.name.toLowerCase()} infrastructure in {city.name} leverages the city&apos;s strategic advantages: {city.strategicAdvantages.slice(0, 2).join(' and ')}.
          </p>
        </div>

        {/* City stats */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-400" />
            Why {city.name}?
          </h2>
          <p className="text-zinc-400 mb-4">{city.description}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {city.strategicAdvantages.map((adv, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                <span className="text-sm text-zinc-300">{adv}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {city.keyStats.latencyToEurope && (
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-xs text-zinc-500">Latency to Europe</div>
                <div className="font-mono text-sm text-emerald-400">{city.keyStats.latencyToEurope}</div>
              </div>
            )}
            {city.keyStats.powerCost && (
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-xs text-zinc-500">Power Cost</div>
                <div className="font-mono text-sm text-emerald-400">{city.keyStats.powerCost}</div>
              </div>
            )}
            {city.keyStats.renewablePercentage && (
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-xs text-zinc-500">Renewable Energy</div>
                <div className="font-mono text-sm text-emerald-400">{city.keyStats.renewablePercentage}</div>
              </div>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
            <Server className="h-5 w-5 text-cyan-400" />
            Key Benefits
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {service.keyBenefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                <span className="text-sm text-zinc-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Target customers */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Who Is This For?</h2>
          <div className="flex flex-wrap gap-2">
            {service.targetCustomers.map((cust, i) => (
              <span key={i} className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-zinc-300">
                {cust}
              </span>
            ))}
          </div>
        </div>

        {/* Other services in this city */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Other Services in {city.name}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {serviceLines.filter((s) => s.slug !== service.slug).slice(0, 6).map((s) => (
              <Link
                key={s.slug}
                href={`/morocco/${city.slug}/${s.slug}`}
                className="group rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30 hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white group-hover:text-emerald-400">{s.name}</span>
                  <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400" />
                </div>
                <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{s.shortDesc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Related glossary */}
        {relatedGlossary.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-white">Related Concepts</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedGlossary.map((term) => (
                <Link
                  key={term.slug}
                  href={`/glossary/${term.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30 hover:bg-white/10"
                >
                  <div>
                    <div className="font-medium text-white group-hover:text-emerald-400">{term.term}</div>
                    <div className="text-xs text-zinc-500 line-clamp-1">{term.shortDef}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-white">
            Deploy in {city.name} Today
          </h2>
          <p className="mb-4 text-zinc-400">
            Get started with {service.name.toLowerCase()} in {city.name}. Carbon-aware infrastructure powered by 100% renewable energy.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/intelligence"><Button>Explore Platform</Button></Link>
            <Link href="/pricing"><Button variant="outline">View Pricing</Button></Link>
            <Link href="/contact"><Button variant="ghost">Contact Sales</Button></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
