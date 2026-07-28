'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ArrowRight, Server, Zap, Factory, Mountain, Wheat, Droplets, Cpu, Landmark } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem, Card3D, SectionDivider } from '@/components/ui/motion';
import ImmersiveHero from '@/components/ImmersiveHero';
import { PortfolioDistributionChart } from '@/components/charts/PortfolioDistributionChart';
import { InvestmentPipelineChart } from '@/components/charts/InvestmentPipelineChart';
import { OperationalMetricsChart } from '@/components/charts/OperationalMetricsChart';

const NetworkOntology = dynamic(
  () => import('@/components/NetworkOntology'),
  { ssr: false, loading: () => <div className="h-[400px] bg-[#0D0D0D] animate-pulse rounded-lg" /> }
);

const subsidiaries = [
  {
    name: 'Harch Intelligence',
    slug: 'intelligence',
    version: '/0.1',
    desc: 'Carbon-Aware GPU Cloud — 1,798 GPUs across 5 Moroccan hubs at 48.2 gCO2/kWh. Sovereign AI compute with carbon-aware scheduling.',
    stat: '1,798 GPUs',
    icon: Server,
    accent: '#8B9DAF',
    image: '/images/sections/intelligence-exterior.jpg',
  },
  {
    name: 'Harch Cement',
    slug: 'cement',
    version: '/0.2',
    desc: '500kT/yr cement production in Gambia — vertically integrated from quarry to delivery, serving West Africa\'s construction boom.',
    stat: '500kT/yr',
    icon: Factory,
    accent: '#8B9DAF',
    image: '/images/sections/cement-factory.jpg',
  },
  {
    name: 'Harch Energy',
    slug: 'energy',
    version: '/0.3',
    desc: '2GW+ renewable energy pipeline — solar, wind, and green hydrogen across Morocco and the Sahel. Zero-carbon industrial electricity.',
    stat: '2GW+',
    icon: Zap,
    accent: '#6B9F6B',
    image: '/images/sections/energy-solar-farm.jpg',
  },
  {
    name: 'Harch Technology',
    slug: 'technology',
    version: '/0.4',
    desc: 'Sovereign technology stack — carbon-aware GPU cloud, cybersecurity, satellite communications, and developer platform.',
    stat: '1,798 GPUs',
    icon: Cpu,
    accent: '#7888A8',
    image: '/images/sections/tech-ground-station.jpg',
  },
  {
    name: 'Harch Mining',
    slug: 'mining',
    version: '/0.5',
    desc: 'Strategic mineral extraction — phosphates, cobalt, and rare earths. Capturing the full value chain from mine to market.',
    stat: '3 Minerals',
    icon: Mountain,
    accent: '#A87878',
    image: '/images/sections/mining-smelter.jpg',
  },
  {
    name: 'Harch Agri',
    slug: 'agriculture',
    version: '/0.6',
    desc: 'Precision agriculture — IoT sensors, drone monitoring, and vertical farming across 60% of the world\'s uncultivated arable land.',
    stat: '$35B Market',
    icon: Wheat,
    accent: '#6BAF6B',
    image: '/images/sections/agri-vertical-farm.jpg',
  },
  {
    name: 'Harch Water',
    slug: 'water',
    version: '/0.7',
    desc: '200M m³/yr desalination capacity with smart distribution networks. Solving Africa\'s water security crisis at scale.',
    stat: '200M m³/yr',
    icon: Droplets,
    accent: '#6888A8',
    image: '/images/sections/water-desal.jpg',
  },
  {
    name: 'Harch Finance',
    slug: 'finance',
    version: '/0.8',
    desc: 'Green bonds, project finance, trade finance, and Islamic finance for sovereign infrastructure across the continent.',
    stat: '$2.37B',
    icon: Landmark,
    accent: '#8B9DAF',
    image: '/images/sections/finance-trading.jpg',
  },
];

export default function SubsidiariesPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* Immersive Hero */}
      <ImmersiveHero
        title="VERTICALS"
        subtitle="8 Verticals. One Mission."
        version="/0.8"
        metaLabel="HARCH CORP SUBSIDIARIES"
      />

      {/* Network Ontology */}
      <section className="py-16 md:py-24 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <NetworkOntology />
        </div>
      </section>

      <SectionDivider />

      {/* Data Visualization — Portfolio Overview */}
      <section className="py-16 md:py-24 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="mb-10">
              <span className="section-label">Analytics</span>
              <h2 className="section-title mt-2">Portfolio Intelligence</h2>
              <p className="section-subtitle mt-2">
                Real-time capital allocation and operational performance across all verticals.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FadeIn delay={0.1}>
              <PortfolioDistributionChart />
            </FadeIn>
            <FadeIn delay={0.2}>
              <InvestmentPipelineChart />
            </FadeIn>
          </div>
          <div className="mt-6">
            <FadeIn delay={0.3}>
              <OperationalMetricsChart />
            </FadeIn>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="mb-10">
              <span className="section-label">Operating Verticals</span>
              <h2 className="section-title mt-2">8 Verticals. One Mission.</h2>
            </div>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.1}>
            {subsidiaries.map((sub) => {
              const Icon = sub.icon;
              return (
                <StaggerItem key={sub.slug}>
                  <Link href={`/subsidiaries/${sub.slug}`} className="group block">
                    <Card3D className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden hover:border-[rgba(255,255,255,0.12)] transition-all duration-500">
                      <div className="relative h-[200px] overflow-hidden">
                        <Image src={sub.image} alt={sub.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 rounded text-[9px] font-bold tracking-[0.15em] uppercase font-[family-name:var(--font-space-mono)] bg-[rgba(0,0,0,0.6)] backdrop-blur-md" style={{ color: sub.accent, border: `1px solid ${sub.accent}30` }}>{sub.version}</span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold tracking-[0.1em] stat-mono bg-[rgba(0,0,0,0.6)] text-white/70 backdrop-blur-md border border-[rgba(255,255,255,0.06)]">{sub.stat}</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${sub.accent}15`, border: `1px solid ${sub.accent}30` }}>
                            <Icon size={16} style={{ color: sub.accent }} />
                          </div>
                          <h3 className="text-lg font-bold text-white tracking-tight">{sub.name}</h3>
                        </div>
                        <p className="text-[13px] text-[rgba(255,255,255,0.45)] leading-relaxed mb-4">{sub.desc}</p>
                        <div className="pt-4 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between">
                          <span className="text-[10px] font-bold tracking-[0.15em] uppercase font-[family-name:var(--font-space-mono)]" style={{ color: `${sub.accent}90` }}>Explore Platform</span>
                          <ArrowRight size={12} className="text-[rgba(255,255,255,0.25)] group-hover:translate-x-1 group-hover:text-white transition-all" />
                        </div>
                      </div>
                    </Card3D>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
