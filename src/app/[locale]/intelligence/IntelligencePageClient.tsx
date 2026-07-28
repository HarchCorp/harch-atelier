'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Cpu, Server, Zap } from 'lucide-react';
import { FadeIn } from '@/components/ui/motion';
import { GPUUtilizationChart } from '@/components/charts/GPUUtilizationChart';
import { CarbonIntensityChart } from '@/components/charts/CarbonIntensityChart';

export default function IntelligencePageClient() {
  const t = useTranslations('intelligence');
  const tc = useTranslations('common');

  const products = [
    {
      name: 'HarchOS',
      tag: t('keyFeatures.title'),
      version: '/0.1',
      href: '/intelligence/harchos',
      desc: t('description'),
      icon: Cpu,
      color: '#8B9DAF',
    },
    {
      name: t('keyFeatures.gpuClusters.title'),
      tag: t('specs.title'),
      version: '/0.2',
      href: '/subsidiaries/intelligence',
      desc: t('keyFeatures.gpuClusters.description'),
      icon: Server,
      color: '#8B9DAF',
    },
    {
      name: t('heroBadge'),
      tag: t('pricing.title'),
      version: '/0.3',
      href: '/subsidiaries/intelligence',
      desc: t('keyFeatures.carbonAware.description'),
      icon: Zap,
      color: '#8B9DAF',
    },
  ];

  const intelligenceMetrics = [
    { label: t('specs.totalGpus'), value: 1798, trend: 'up' as const, sparkline: [1650, 1700, 1720, 1760, 1780, 1798] },
    { label: t('specs.carbonIntensity'), value: 47, unit: 'gCO2/kWh', trend: 'down' as const, sparkline: [55, 52, 50, 49, 48, 47] },
    { label: t('specs.renewableShare'), value: 81.5, unit: '%', trend: 'up' as const, decimals: 1, sparkline: [78, 79, 80, 80.5, 81, 81.5] },
    { label: t('specs.latency'), value: 12, unit: 'ms', trend: 'stable' as const, sparkline: [12, 13, 12, 11, 12, 12] },
    { label: t('specs.hubs'), value: 5, unit: '/5', trend: 'stable' as const },
    { label: t('specs.uptime'), value: 99.97, unit: '%', trend: 'up' as const, decimals: 2, sparkline: [99.95, 99.96, 99.96, 99.97, 99.97, 99.97] },
  ];

  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-8 md:pb-12 bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/50 mb-4">{t('heroBadge').toUpperCase()}</p>
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-white tracking-[-0.03em] leading-[1.05]">{t('title').toUpperCase()}</h1>
          <p className="text-[clamp(1rem,2vw,1.25rem)] text-white/50 mt-6 max-w-2xl leading-relaxed">{t('subtitle')}</p>
          <span className="version-tag mt-4 inline-block">/0.1</span>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-16 md:py-24 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {intelligenceMetrics.map((m) => (
              <div key={m.label} className="card p-4 text-center">
                <p className="text-2xl md:text-3xl font-bold text-white stat-mono">{m.value}{m.unit ? <span className="text-sm text-white/40 ml-1">{m.unit}</span> : null}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.1em] mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Visualizations */}
      <section className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('specs.title')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-12">
              {t('description')}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FadeIn delay={0.1}>
              <GPUUtilizationChart />
            </FadeIn>
            <FadeIn delay={0.2}>
              <CarbonIntensityChart />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Products — Pattern 1: Explore Solutions Cards */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('keyFeatures.title')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-12">
              {t('title')}
            </h2>
          </FadeIn>

          <div className="space-y-6">
            {products.map((product, i) => (
              <FadeIn key={product.name} delay={i * 0.1}>
                <div className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded-lg p-6 md:p-8 hover:border-[rgba(255,255,255,0.12)] transition-all duration-500">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Icon + header */}
                    <div className="shrink-0">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[rgba(139,157,175,0.08)]">
                        <product.icon size={22} className="text-[#8B9DAF]" />
                      </div>
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-1">
                        <h3 className="text-xl md:text-[20px] font-bold text-white">{product.name}</h3>
                        <span className="version-tag">{product.version}</span>
                      </div>
                      <p className="text-[12px] font-semibold text-[#8B9DAF] tracking-[0.05em] uppercase mb-4">{product.tag}</p>
                      <p className="text-[14px] text-[#999999] leading-relaxed mb-6">{product.desc}</p>
                      {/* Pattern 1: Two buttons side by side */}
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={product.href}
                          className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all"
                        >
                          {t('cta.secondary')}
                        </Link>
                        <Link
                          href={product.href}
                          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all"
                        >
                          {t('cta.primary')} <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">{t('cta.title')}</h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">{t('description')}</p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/intelligence/harchos" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                {t('cta.primary')} <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {tc('contactUs')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
