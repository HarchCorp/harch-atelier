'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { ArrowUpRight, Cpu, Zap, Globe, Server, Shield, BarChart3, Wind, Droplets, Satellite, Lock, Eye, Factory, Mountain, Wheat, Waves, DollarSign, Download } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import dynamic from 'next/dynamic';

import {
  FadeIn,
  CountUp,
} from '@/components/ui/motion';
import { VideoPlayer } from '@/components/VideoPlayer';

const InteractivePlatform = dynamic(
  () => import('@/components/InteractivePlatform').then((mod) => mod.InteractivePlatform),
  { ssr: false, loading: () => <div className="h-[600px] bg-neutral-100 animate-pulse" /> }
);

import CompetitiveComparison from '@/components/competitive/CompetitiveComparison';
import type { Competitor } from '@/components/competitive/CompetitiveComparison';

/* ═══════════════════════════════════════════════════════════════
   ACCENT COLOR MAP — per subsidiary
   ═══════════════════════════════════════════════════════════════ */
const accentMap: Record<string, string> = {
  intelligence: '#8B9DAF',  // Slate blue
  cement: '#A08878',         // Warm stone
  energy: '#6B9F6B',         // Muted green
  technology: '#7888A8',     // Steel blue
  mining: '#A87878',         // Terra cotta
  agriculture: '#4A7B5F',    // Sage green
  water: '#6888A8',          // Water blue
};

/* ═══════════════════════════════════════════════════════════════
   STAT BAR — uses shared design tokens
   ═══════════════════════════════════════════════════════════════ */
function StatBar({ stat, value, max, accent }: { stat: string; value: number; max: number; accent: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <div ref={ref} className="mb-5">
      <div className="flex justify-between mb-2">
        <span className="text-[12px] text-neutral-500">{stat}</span>
        <span className="text-[12px] font-bold text-neutral-900">{value}%</span>
      </div>
      <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-[2s] ease-out"
          style={{
            width: isInView ? `${(value / max) * 100}%` : '0%',
            backgroundColor: accent,
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
type IconType = React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

interface SubsidiaryInfo {
  name: string; version: string; heroTitle: string; heroSubtitle: string; heroImage: string;
  sectionImage1: string; sectionImage2: string; sectionImage3: string; sectionImage4: string;
  overview: string; strategicContext: string; marketAnalysis: string; sustainability: string;
  investment: string;
  metrics: { value: number; prefix: string; suffix: string; label: string }[];
  capabilities: { icon: IconType; title: string; desc: string }[];
  specTable: { spec: string; value: string; phase: string }[];
  milestones: { year: string; title: string; desc: string }[];
  stats: { stat: string; value: number; max: number }[];
  location: string; locationDesc: string;
  strategicAdvantages: { title: string; desc: string }[];
  partnershipModel: { title: string; desc: string }[];
  competitors?: Competitor[];
  competitorHarchName?: string;
  competitorAccentColor?: string;
}

/* ═══════════════════════════════════════════════════════════════
   IMAGE MAP — per subsidiary (file paths cannot be in translation JSON)
   ═══════════════════════════════════════════════════════════════ */
const subsidiaryVideoMap: Record<string, string> = {
  intelligence: '/videos/v4_intelligence.mp4',
  cement: '/videos/v7_cement.mp4',
  energy: '/videos/v5_energy.mp4',
  technology: '/videos/v10_technology.mp4',
  mining: '/videos/v6_mining.mp4',
  water: '/videos/v9_water.mp4',
};

const imageMap: Record<string, { heroImage: string; sectionImage1: string; sectionImage2: string; sectionImage3: string; sectionImage4: string }> = {
  intelligence: {
    heroImage: '/images/sections/intelligence-exterior.jpg',
    sectionImage1: '/images/sections/intelligence-rack.jpg',
    sectionImage2: '/images/sections/intelligence-gpu-cluster.jpg',
    sectionImage3: '/images/sections/intelligence-cooling.jpg',
    sectionImage4: '/images/sections/intelligence-submarine.jpg',
  },
  cement: {
    heroImage: '/images/sections/cement-factory.jpg',
    sectionImage1: '/images/sections/cement-quarry.jpg',
    sectionImage2: '/images/sections/cement-kiln.jpg',
    sectionImage3: '/images/sections/cement-industrial.jpg',
    sectionImage4: '/images/sections/cement-quarry-aerial.jpg',
  },
  energy: {
    heroImage: '/images/sections/energy-solar-farm.jpg',
    sectionImage1: '/images/sections/energy-wind-farm.jpg',
    sectionImage2: '/images/sections/energy-hydrogen-plant.jpg',
    sectionImage3: '/images/sections/energy-solar.jpg',
    sectionImage4: '/images/sections/energy-hydrogen.jpg',
  },
  technology: {
    heroImage: '/images/sections/tech-satellite.jpg',
    sectionImage1: '/images/sections/tech-ground-station.jpg',
    sectionImage2: '/images/sections/tech-cyber.jpg',
    sectionImage3: '/images/sections/tech-infrastructure.jpg',
    sectionImage4: '/images/sections/tech-soc.jpg',
  },
  mining: {
    heroImage: '/images/sections/mining-open-pit.jpg',
    sectionImage1: '/images/sections/mining-processing.jpg',
    sectionImage2: '/images/sections/mining-smelter.jpg',
    sectionImage3: '/images/sections/mining-phosphate.jpg',
    sectionImage4: '/images/sections/mining-lab.jpg',
  },
  agriculture: {
    heroImage: '/images/sections/agri-aerial-drone.jpg',
    sectionImage1: '/images/sections/agri-drone.jpg',
    sectionImage2: '/images/sections/agri-iot-sensor.jpg',
    sectionImage3: '/images/sections/agri-vertical-farm.jpg',
    sectionImage4: '/images/sections/agri-green-crops-aerial.jpg',
  },
  water: {
    heroImage: '/images/sections/water-desal-plant.jpg',
    sectionImage1: '/images/sections/water-desal.jpg',
    sectionImage2: '/images/sections/water-treatment.jpg',
    sectionImage3: '/images/sections/water-control-room.jpg',
    sectionImage4: '/images/sections/water-dam.jpg',
  },
};

/* ═══════════════════════════════════════════════════════════════
   ICON MAP — per subsidiary (Lucide icons cannot be serialized to JSON)
   ═══════════════════════════════════════════════════════════════ */
const iconMap: Record<string, IconType[]> = {
  intelligence: [Server, Cpu, Zap, Globe, Shield, BarChart3, DollarSign],
  cement: [Factory, Cpu, Zap, Globe, Shield, BarChart3],
  energy: [Zap, Wind, Droplets, Shield, Globe, BarChart3],
  technology: [Cpu, Shield, Satellite, Server, Lock, Eye],
  mining: [Mountain, Cpu, Globe, Shield, Zap, BarChart3],
  agriculture: [Cpu, Globe, Wheat, Shield, Droplets, BarChart3],
  water: [Waves, Cpu, Globe, Shield, Zap, BarChart3],
};

/* ═══════════════════════════════════════════════════════════════
   SUBSIDIARY DATA — loaded from translations, merged with icons & images
   ═══════════════════════════════════════════════════════════════ */
export default function SubsidiaryPageClient({ slug }: { slug: string }) {
  const t = useTranslations('subsidiaryDetail');
  const ts = useTranslations('subsidiaries');

  // Get raw translated data for this subsidiary
  const rawData = t.raw(slug) as Record<string, unknown> | undefined;
  const images = imageMap[slug];
  const icons = iconMap[slug];

  if (!rawData || !images || !icons) {
    return <div className="pt-40 pb-20 text-center"><h1 className="text-2xl font-bold">{ts('pageNotFound')}</h1></div>;
  }

  // Merge translated text data with icons and images
  const data: SubsidiaryInfo = {
    name: rawData.name as string,
    version: rawData.version as string,
    heroTitle: rawData.heroTitle as string,
    heroSubtitle: rawData.heroSubtitle as string,
    heroImage: images.heroImage,
    sectionImage1: images.sectionImage1,
    sectionImage2: images.sectionImage2,
    sectionImage3: images.sectionImage3,
    sectionImage4: images.sectionImage4,
    overview: rawData.overview as string,
    strategicContext: rawData.strategicContext as string,
    marketAnalysis: rawData.marketAnalysis as string,
    sustainability: rawData.sustainability as string,
    investment: rawData.investment as string,
    metrics: (rawData.metrics as { value: number; prefix: string; suffix: string; label: string }[]),
    capabilities: (rawData.capabilities as { title: string; desc: string }[]).map((cap, i) => ({
      icon: icons[i] || BarChart3,
      title: cap.title,
      desc: cap.desc,
    })),
    specTable: rawData.specTable as { spec: string; value: string; phase: string }[],
    milestones: rawData.milestones as { year: string; title: string; desc: string }[],
    stats: rawData.stats as { stat: string; value: number; max: number }[],
    location: rawData.location as string,
    locationDesc: rawData.locationDesc as string,
    strategicAdvantages: rawData.strategicAdvantages as { title: string; desc: string }[],
    partnershipModel: rawData.partnershipModel as { title: string; desc: string }[],
    competitors: rawData.competitors as Competitor[] | undefined,
    competitorHarchName: rawData.competitorHarchName as string | undefined,
    competitorAccentColor: rawData.competitorAccentColor as string | undefined,
  };

  const accent = accentMap[slug] ?? '#8B9DAF';

  /* ═══════════════════════════════════════════════════════════════
      RENDERING — Palantir-style clean corporate layout
      ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="bg-white text-neutral-900">

      {/* ═══════════════ 1. HERO ═══════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Image
          src={data.heroImage}
          alt={data.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: accent }}>
              {data.name} {data.version}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <h1 className="text-4xl md:text-6xl lg:text-[80px] font-bold text-white leading-[1.05] tracking-[-0.02em] mb-6 whitespace-pre-line">
              {data.heroTitle}
            </h1>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              {data.heroSubtitle}
            </p>
          </FadeIn>
          <FadeIn delay={0.45}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/quote?vertical=${slug}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-neutral-900 text-[13px] font-semibold tracking-[0.05em] uppercase rounded-none hover:bg-neutral-100 transition-colors"
              >
                {t('requestQuote')}
                <ArrowUpRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white text-[13px] font-semibold tracking-[0.05em] uppercase rounded-none hover:bg-neutral-800 transition-colors"
              >
                {t('requestBriefing')}
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </FadeIn>
          {subsidiaryVideoMap[slug] && (
            <FadeIn delay={0.6}>
              <div className="mt-10 mx-auto w-full max-w-md">
                <VideoPlayer
                  src={subsidiaryVideoMap[slug]}
                  variant="modal-trigger"
                  label="Watch teaser (40s)"
                  className="w-full aspect-video"
                />
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ═══════════════ INTERACTIVE PLATFORM ═══════════════ */}
      <InteractivePlatform slug={slug} accent={accent} />

      {/* ═══════════════ 2. OVERVIEW ═══════════════ */}
      <section className="py-24 md:py-32 bg-white border-t border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <FadeIn direction="left">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={data.sectionImage1}
                  alt={`${data.name} overview`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </FadeIn>

            <div>
              <FadeIn>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>
                  {t('overview')}
                </p>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">{data.name}</h2>
                <div className="w-12 h-px bg-neutral-300 mb-6" />
                <p className="text-[15px] text-neutral-600 leading-[1.8] mb-10">{data.overview}</p>
              </FadeIn>

              <div className="grid grid-cols-2 gap-6">
                {data.metrics.map((m, i) => (
                  <FadeIn key={m.label} delay={0.1 * i}>
                    <div>
                      <p className="text-3xl md:text-4xl font-bold tracking-tight">
                        <CountUp to={m.value} prefix={m.prefix} suffix={m.suffix} duration={2.5} />
                      </p>
                      <p className="text-[11px] text-neutral-500 uppercase tracking-[0.1em] font-semibold mt-1">{m.label}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 3. CAPABILITIES LIST ═══════════════ */}
      <section className="py-24 md:py-32 bg-white border-t border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>
              {t('capabilities')}
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16">{t('whatWeBuild')}</h2>
          </FadeIn>

          <div className="space-y-0">
            {data.capabilities.map((cap, i) => {
              const num = `/0.${i + 1}`;
              const Icon = cap.icon;
              return (
                <FadeIn key={cap.title} delay={0.05 * i}>
                  <div className="py-10 first:pt-0 last:pb-0 border-b border-neutral-100 last:border-0 group">
                    <div className="flex items-start gap-5 md:gap-8">
                      {/* Icon + Number */}
                      <div className="flex-shrink-0 pt-1">
                        <div
                          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-neutral-200 group-hover:border-neutral-300 transition-colors"
                          style={{ color: accent }}
                        >
                          <Icon size={20} strokeWidth={1.5} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg md:text-xl font-bold tracking-tight">{cap.title}</h3>
                          <span className="text-[10px] font-semibold tracking-[0.15em] text-neutral-300 font-[family-name:var(--font-space-mono)]">
                            {num}
                          </span>
                        </div>
                        <p className="text-[14px] text-neutral-500 leading-[1.8] max-w-[780px] group-hover:text-neutral-600 transition-colors">
                          {cap.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ 4. STRATEGIC CONTEXT ═══════════════ */}
      <section className="py-24 md:py-32 bg-[#F5F5F5] border-t border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <FadeIn>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>
                  {t('strategicContext')}
                </p>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">{t('whyThisMatters')}</h2>
                <div className="w-12 h-px bg-neutral-300 mb-6" />
                <p className="text-[15px] text-neutral-600 leading-[1.8]">{data.strategicContext}</p>
              </FadeIn>
            </div>

            <FadeIn direction="right">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={data.sectionImage2}
                  alt={`${data.name} strategic context`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════ MID-SCROLL CTA (energy only) ═══════════════ */}
      {slug === 'energy' && (
        <section className="py-12 bg-neutral-900 border-t border-neutral-800">
          <div className="max-w-[1200px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-white text-lg md:text-xl font-bold">Convaincu ? Devis gratuit sous 48h, sans engagement.</p>
              <p className="text-neutral-400 text-sm mt-1">Budget FDE 2025 limité — réservez votre dossier maintenant.</p>
            </div>
            <Link
              href="/quote?vertical=energy"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#2ECC71] text-white text-[13px] font-semibold tracking-[0.05em] uppercase rounded-none hover:bg-[#27AE60] transition-colors whitespace-nowrap"
            >
              Demander mon devis gratuit
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* ═══════════════ 5. SPEC TABLE ═══════════════ */}
      <section className="py-24 md:py-32 bg-white border-t border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>
              {t('technicalSpecifications')}
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">{t('specSheet')}</h2>
            <div className="w-12 h-px bg-neutral-300 mb-10" />
          </FadeIn>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-neutral-300">
                  <th className="text-left text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-500 px-0 py-4 w-[35%]">{t('specification')}</th>
                  <th className="text-left text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-500 px-0 py-4 w-[30%]">{t('value')}</th>
                  <th className="text-left text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-500 px-0 py-4 w-[35%]">{t('phase')}</th>
                </tr>
              </thead>
              <tbody>
                {data.specTable.map((row, i) => (
                  <motion.tr
                    key={row.spec}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ duration: 0.3, delay: i * 0.02 }}
                    className="border-b border-neutral-100 last:border-0"
                  >
                    <td className="px-0 py-3 text-[13px] text-neutral-700">{row.spec}</td>
                    <td className="px-0 py-3 text-[13px] font-bold text-neutral-900">{row.value}</td>
                    <td className="px-0 py-3 text-[12px] text-neutral-500">{row.phase}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════ 6. SUSTAINABILITY ═══════════════ */}
      <section className="py-24 md:py-32 bg-white border-t border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <FadeIn>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: '#4A7B5F' }}>
                  {t('sustainability')}
                </p>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">{t('builtToLast')}</h2>
                <div className="w-12 h-px bg-neutral-300 mb-6" />
                <p className="text-[15px] text-neutral-600 leading-[1.8] mb-6">{data.sustainability}</p>

                <div className="flex flex-wrap gap-2">
                  {[t('badges.renewable'), t('badges.carbonAware'), t('badges.circularEconomy'), t('badges.zeroWaste')].map((badge) => (
                    <span
                      key={badge}
                      className="px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-[0.08em] uppercase bg-[#4A7B5F10] text-[#4A7B5F] border border-[#4A7B5F25]"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.15}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={data.sectionImage2}
                  alt={`${data.name} sustainability`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════ 7. MILESTONES ═══════════════ */}
      <section className="py-24 md:py-32 bg-white border-t border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>
              {t('timeline')}
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">{t('keyMilestones')}</h2>
            <div className="w-12 h-px bg-neutral-300 mb-12" />
          </FadeIn>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-0 bottom-0 w-px bg-neutral-200" />

            <div className="space-y-10">
              {data.milestones.map((ms, i) => (
                <FadeIn key={ms.year + ms.title} delay={0.05 * i}>
                  <div className="flex gap-6 md:gap-8">
                    <div className="flex-shrink-0 relative z-10 mt-1.5">
                      <div className="w-[15px] h-[15px] rounded-full border-2 bg-white" style={{ borderColor: accent }} />
                    </div>
                    <div className="pb-2">
                      <p className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-1" style={{ color: accent }}>{ms.year}</p>
                      <h3 className="text-lg font-bold text-neutral-900 mb-1">{ms.title}</h3>
                      <p className="text-[14px] text-neutral-600 leading-relaxed">{ms.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 8. COMPETITIVE COMPARISON ═══════════════ */}
      {data.competitors && data.competitors.length > 0 && (
        <CompetitiveComparison
          title={`${data.competitorHarchName ?? data.name} vs Competition`}
          subtitle={ts('detailSubtitle')}
          accentColor={data.competitorAccentColor ?? accent}
          sectionLabel={t('competitiveLandscape')}
          competitors={data.competitors}
          harchName={data.competitorHarchName ?? data.name}
        />
      )}

      {/* ═══════════════ 9. PARTNERSHIP MODEL ═══════════════ */}
      <section className="py-24 md:py-32 bg-white border-t border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>
              {t('partnership')}
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">{t('howToWorkWithUs')}</h2>
            <div className="w-12 h-px bg-neutral-300 mb-12" />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.partnershipModel.map((pm, i) => (
              <FadeIn key={pm.title} delay={0.08 * i}>
                <div className="border border-neutral-200 p-6 h-full hover:border-neutral-300 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                    <h3 className="text-[15px] font-bold text-neutral-900">{pm.title}</h3>
                  </div>
                  <p className="text-[13px] text-neutral-600 leading-relaxed">{pm.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 10. PDF DOWNLOAD ═══════════════ */}
      <section className="py-16 md:py-20 bg-[#F5F5F5] border-t border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>
              {t('downloads')}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">{t('downloadTitle')}</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Company Overview */}
            <FadeIn delay={0.05}>
              <a
                href="/pdfs/harchcorp-company-overview.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 bg-white border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 flex items-center justify-center border border-neutral-200 group-hover:border-neutral-300 transition-colors shrink-0" style={{ color: accent }}>
                  <Download size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-neutral-900 mb-1">{t('companyOverview')}</h3>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">{t('companyOverviewDesc')}</p>
                  <span className="inline-block mt-2 text-[10px] font-semibold tracking-[0.1em] uppercase text-neutral-400">PDF — 7 pages</span>
                </div>
              </a>
            </FadeIn>

            {/* Datasheet */}
            <FadeIn delay={0.1}>
              <a
                href="/pdfs/harch-energy-datasheet.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 bg-white border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 flex items-center justify-center border border-neutral-200 group-hover:border-neutral-300 transition-colors shrink-0" style={{ color: accent }}>
                  <Download size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-neutral-900 mb-1">{t('datasheet')}</h3>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">{t('datasheetDesc')}</p>
                  <span className="inline-block mt-2 text-[10px] font-semibold tracking-[0.1em] uppercase text-neutral-400">PDF — 6 pages</span>
                </div>
              </a>
            </FadeIn>

            {/* Whitepaper */}
            <FadeIn delay={0.15}>
              <a
                href="/pdfs/harch-intelligence-whitepaper.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 bg-white border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 flex items-center justify-center border border-neutral-200 group-hover:border-neutral-300 transition-colors shrink-0" style={{ color: accent }}>
                  <Download size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-neutral-900 mb-1">{t('whitepaper')}</h3>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">{t('whitepaperDesc')}</p>
                  <span className="inline-block mt-2 text-[10px] font-semibold tracking-[0.1em] uppercase text-neutral-400">PDF — 7 pages</span>
                </div>
              </a>
            </FadeIn>

            {/* AI Solutions Brochure */}
            <FadeIn delay={0.2}>
              <a
                href="/pdfs/harch-intelligence-ai-solutions.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 bg-white border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 flex items-center justify-center border border-neutral-200 group-hover:border-neutral-300 transition-colors shrink-0" style={{ color: accent }}>
                  <Download size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-neutral-900 mb-1">{t('aiSolutions')}</h3>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">{t('aiSolutionsDesc')}</p>
                  <span className="inline-block mt-2 text-[10px] font-semibold tracking-[0.1em] uppercase text-neutral-400">PDF — 5 pages</span>
                </div>
              </a>
            </FadeIn>

            {/* Sustainability Report */}
            <FadeIn delay={0.25}>
              <a
                href="/pdfs/harch-sustainability-report.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 bg-white border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 flex items-center justify-center border border-neutral-200 group-hover:border-neutral-300 transition-colors shrink-0" style={{ color: '#4A7B5F' }}>
                  <Download size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-neutral-900 mb-1">{t('sustainabilityReport')}</h3>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">{t('sustainabilityReportDesc')}</p>
                  <span className="inline-block mt-2 text-[10px] font-semibold tracking-[0.1em] uppercase text-neutral-400">PDF — 7 pages</span>
                </div>
              </a>
            </FadeIn>

            {/* Energy Datasheet */}
            <FadeIn delay={0.3}>
              <a
                href="/pdfs/harch-energy-datasheet.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 bg-white border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 flex items-center justify-center border border-neutral-200 group-hover:border-neutral-300 transition-colors shrink-0" style={{ color: '#4A7B5F' }}>
                  <Download size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-neutral-900 mb-1">{t('energyDatasheet')}</h3>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">{t('energyDatasheetDesc')}</p>
                  <span className="inline-block mt-2 text-[10px] font-semibold tracking-[0.1em] uppercase text-neutral-400">PDF — 6 pages</span>
                </div>
              </a>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════ 11. CTA ═══════════════ */}
      <section className="py-24 md:py-32 bg-white border-t border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          {slug === 'energy' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary CTA - 2/3 width */}
              <FadeIn className="md:col-span-2">
                <Link
                  href="/quote?vertical=energy"
                  className="block bg-[#2ECC71] text-white p-10 md:p-14 group hover:bg-[#27AE60] transition-colors h-full"
                >
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4 text-white/80">
                    Harch Energy
                  </p>
                  <h3 className="text-2xl md:text-4xl font-bold tracking-tight mb-3">
                    Devis gratuit sous 48h
                  </h3>
                  <p className="text-white/80 text-sm mb-6">Audit technique gratuit. Chiffres précis : économie mensuelle, ROI, subventions. Sans engagement, sans pression.</p>
                  <div className="flex items-center gap-2 text-white group-hover:gap-3 transition-all">
                    <span className="text-[14px] font-semibold">Demander mon devis maintenant</span>
                    <ArrowUpRight size={16} />
                  </div>
                </Link>
              </FadeIn>
              {/* Phone CTA - 1/3 width */}
              <FadeIn delay={0.1}>
                <a
                  href="tel:+212684440682"
                  className="block bg-neutral-900 text-white p-10 md:p-14 group hover:bg-neutral-800 transition-colors h-full"
                >
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: '#2ECC71' }}>
                    Appel direct
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                    Appelez maintenant
                  </h3>
                  <p className="text-neutral-400 text-sm mb-6">On vous dit combien vous économisez en 10 min.</p>
                  <div className="flex items-center gap-2 text-[#2ECC71] group-hover:gap-3 transition-all">
                    <span className="text-[14px] font-semibold font-mono">+212 684 440 682</span>
                  </div>
                </a>
              </FadeIn>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FadeIn>
                <Link
                  href={`/quote?vertical=${slug}`}
                  className="block bg-white border border-neutral-200 p-10 md:p-14 group hover:border-neutral-400 transition-colors"
                >
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>
                    {data.name}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                    {t('requestQuote')}
                  </h3>
                  <div className="flex items-center gap-2 text-neutral-500 group-hover:text-neutral-900 transition-colors">
                    <span className="text-[13px] font-semibold">{t('requestBriefing')}</span>
                    <ArrowUpRight size={14} />
                  </div>
                </Link>
              </FadeIn>
              <FadeIn delay={0.1}>
                <Link
                  href="/contact"
                  className="block bg-neutral-900 text-white p-10 md:p-14 group hover:bg-neutral-800 transition-colors"
                >
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>
                    {t('partnership')}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                    {t('seekingPartners')}
                  </h3>
                  <div className="flex items-center gap-2 text-neutral-400 group-hover:text-white transition-colors">
                    <span className="text-[13px] font-semibold">{t('readyToBuildTheFuture')}</span>
                    <ArrowUpRight size={14} />
                  </div>
                </Link>
              </FadeIn>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
