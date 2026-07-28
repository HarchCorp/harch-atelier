'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ArrowRight, Landmark, TrendingUp, Shield, Globe, FileText,
  Leaf, Handshake, Building2, Scale, PiggyBank, BarChart3,
  Clock, AlertTriangle, DollarSign, Wallet, Target, Lock,
  Banknote, CreditCard, Coins, ShieldCheck, MapPin, Users,
} from 'lucide-react';
import {
  FadeIn, AnimatedCounter, StaggerContainer, StaggerItem,
  Card3D, MagneticButton, SmoothLink, TextReveal, SectionDivider,
  CountUp, ParallaxSection,
} from '@/components/ui/motion';
import dynamic from 'next/dynamic';

const InteractivePlatform = dynamic(
  () => import('@/components/InteractivePlatform').then((mod) => mod.InteractivePlatform),
  { ssr: false, loading: () => <div className="h-[600px] bg-[#0A0A0A] animate-pulse" /> }
);
import { VideoPlayer } from '@/components/VideoPlayer';

/* ═══════════════════════════════════════════════════
   HARCH FINANCE — HarchCorp Unified Design System
   Site palette — Slate Blue-Gray accent (#8B9DAF) — Shared CSS classes
   ═══════════════════════════════════════════════════ */

const ACCENT = '#8B9DAF';
const ACCENT_RGB = '139,157,175';

/* ═══════════════════════════════════════════════════
   DATA — Strictly Harch Finance content
   ═══════════════════════════════════════════════════ */

export default function HarchFinancePage() {
  const t = useTranslations('subsidiaries');

const data = {
  name: t('finance.title'),
  version: '/0.8',
  heroTitle: t('finance.heroTitle'),
  heroSubtitle: t('finance.heroSubtitle'),
  heroImage: '/images/sections/finance-district.jpg',

  overview: t('finance.overview'),

  investmentPhilosophy: t('finance.investmentPhilosophy'),

  metrics: [
    { value: 2400, prefix: '$', suffix: 'M', label: t('finance.metrics.investmentPipeline'), display: '$2.4B' },
    { value: 7, prefix: '', suffix: '', label: t('finance.metrics.verticalsCovered'), display: '7' },
    { value: 5, prefix: '', suffix: '', label: t('finance.metrics.countriesActive'), display: '5' },
    { value: 25000, prefix: '', suffix: '+', label: t('finance.metrics.jobsTarget'), display: '24,700+' },
  ],

  financialInstruments: [
    {
      icon: Leaf,
      name: t('finance.instruments.greenBonds.name'),
      tagline: t('finance.instruments.greenBonds.tagline'),
      description: t('finance.instruments.greenBonds.description'),
      features: [
        t('finance.instruments.greenBonds.features.0'),
        t('finance.instruments.greenBonds.features.1'),
        t('finance.instruments.greenBonds.features.2'),
        t('finance.instruments.greenBonds.features.3'),
        t('finance.instruments.greenBonds.features.4'),
      ],
      stats: [
        { label: t('finance.instruments.greenBonds.stats.marketSize.label'), value: '$500B+' },
        { label: t('finance.instruments.greenBonds.stats.spreadAdvantage.label'), value: '15-25bps' },
        { label: t('finance.instruments.greenBonds.stats.tenor.label'), value: '5-15yr' },
      ],
    },
    {
      icon: Landmark,
      name: t('finance.instruments.projectFinance.name'),
      tagline: t('finance.instruments.projectFinance.tagline'),
      description: t('finance.instruments.projectFinance.description'),
      features: [
        t('finance.instruments.projectFinance.features.0'),
        t('finance.instruments.projectFinance.features.1'),
        t('finance.instruments.projectFinance.features.2'),
        t('finance.instruments.projectFinance.features.3'),
        t('finance.instruments.projectFinance.features.4'),
      ],
      stats: [
        { label: t('finance.instruments.projectFinance.stats.avgTenor.label'), value: '7-12yr' },
        { label: t('finance.instruments.projectFinance.stats.ltvRatio.label'), value: '60-75%' },
        { label: t('finance.instruments.projectFinance.stats.dscrTarget.label'), value: '>1.3x' },
      ],
    },
    {
      icon: CreditCard,
      name: t('finance.instruments.tradeFinance.name'),
      tagline: t('finance.instruments.tradeFinance.tagline'),
      description: t('finance.instruments.tradeFinance.description'),
      features: [
        t('finance.instruments.tradeFinance.features.0'),
        t('finance.instruments.tradeFinance.features.1'),
        t('finance.instruments.tradeFinance.features.2'),
        t('finance.instruments.tradeFinance.features.3'),
        t('finance.instruments.tradeFinance.features.4'),
      ],
      stats: [
        { label: t('finance.instruments.tradeFinance.stats.dtaNetwork.label'), value: '60+' },
        { label: t('finance.instruments.tradeFinance.stats.facilitySize.label'), value: '$50-200M' },
        { label: t('finance.instruments.tradeFinance.stats.settlement.label'), value: 'T+1' },
      ],
    },
    {
      icon: Coins,
      name: t('finance.instruments.islamicFinance.name'),
      tagline: t('finance.instruments.islamicFinance.tagline'),
      description: t('finance.instruments.islamicFinance.description'),
      features: [
        t('finance.instruments.islamicFinance.features.0'),
        t('finance.instruments.islamicFinance.features.1'),
        t('finance.instruments.islamicFinance.features.2'),
        t('finance.instruments.islamicFinance.features.3'),
        t('finance.instruments.islamicFinance.features.4'),
      ],
      stats: [
        { label: t('finance.instruments.islamicFinance.stats.globalPool.label'), value: '$4T' },
        { label: t('finance.instruments.islamicFinance.stats.targetCoupon.label'), value: '5-7%' },
        { label: t('finance.instruments.islamicFinance.stats.tenor.label'), value: '5-10yr' },
      ],
    },
    {
      icon: Target,
      name: t('finance.instruments.impactInvestment.name'),
      tagline: t('finance.instruments.impactInvestment.tagline'),
      description: t('finance.instruments.impactInvestment.description'),
      features: [
        t('finance.instruments.impactInvestment.features.0'),
        t('finance.instruments.impactInvestment.features.1'),
        t('finance.instruments.impactInvestment.features.2'),
        t('finance.instruments.impactInvestment.features.3'),
        t('finance.instruments.impactInvestment.features.4'),
      ],
      stats: [
        { label: t('finance.instruments.impactInvestment.stats.sdgsMapped.label'), value: '4' },
        { label: t('finance.instruments.impactInvestment.stats.jobsCovenant.label'), value: '25K+' },
        { label: t('finance.instruments.impactInvestment.stats.irrTarget.label'), value: '15-20%' },
      ],
    },
    {
      icon: Banknote,
      name: t('finance.instruments.carbonCredit.name'),
      tagline: t('finance.instruments.carbonCredit.tagline'),
      description: t('finance.instruments.carbonCredit.description'),
      features: [
        t('finance.instruments.carbonCredit.features.0'),
        t('finance.instruments.carbonCredit.features.1'),
        t('finance.instruments.carbonCredit.features.2'),
        t('finance.instruments.carbonCredit.features.3'),
        t('finance.instruments.carbonCredit.features.4'),
      ],
      stats: [
        { label: t('finance.instruments.carbonCredit.stats.creditValue.label'), value: '$2M+' },
        { label: t('finance.instruments.carbonCredit.stats.growthTarget.label'), value: '20x' },
        { label: t('finance.instruments.carbonCredit.stats.standards.label'), value: 'VCS+GS' },
      ],
    },
  ],

  partnershipModels: [
    {
      icon: Handshake,
      title: t('finance.partnershipModels.coinvestment.title'),
      desc: t('finance.partnershipModels.coinvestment.desc'),
    },
    {
      icon: Shield,
      title: t('finance.partnershipModels.ecaBacked.title'),
      desc: t('finance.partnershipModels.ecaBacked.desc'),
    },
    {
      icon: Building2,
      title: t('finance.partnershipModels.swfPartnerships.title'),
      desc: t('finance.partnershipModels.swfPartnerships.desc'),
    },
    {
      icon: Globe,
      title: t('finance.partnershipModels.dfiPartnerships.title'),
      desc: t('finance.partnershipModels.dfiPartnerships.desc'),
    },
  ],

  strategicAdvantages: [
    {
      icon: Scale,
      title: t('finance.strategicAdvantages.regulatoryFramework.title'),
      desc: t('finance.strategicAdvantages.regulatoryFramework.desc'),
    },
    {
      icon: FileText,
      title: t('finance.strategicAdvantages.doubleTaxationTreaties.title'),
      desc: t('finance.strategicAdvantages.doubleTaxationTreaties.desc'),
    },
    {
      icon: ShieldCheck,
      title: t('finance.strategicAdvantages.migaCoverage.title'),
      desc: t('finance.strategicAdvantages.migaCoverage.desc'),
    },
    {
      icon: Landmark,
      title: t('finance.strategicAdvantages.ohiCompliance.title'),
      desc: t('finance.strategicAdvantages.ohiCompliance.desc'),
    },
  ],

  riskManagement: [
    {
      icon: Shield,
      title: t('finance.riskManagement.politicalRisk.title'),
      desc: t('finance.riskManagement.politicalRisk.desc'),
      riskLevel: t('finance.riskManagement.politicalRisk.riskLevel'),
    },
    {
      icon: BarChart3,
      title: t('finance.riskManagement.currencyHedging.title'),
      desc: t('finance.riskManagement.currencyHedging.desc'),
      riskLevel: t('finance.riskManagement.currencyHedging.riskLevel'),
    },
    {
      icon: FileText,
      title: t('finance.riskManagement.offtakeAgreements.title'),
      desc: t('finance.riskManagement.offtakeAgreements.desc'),
      riskLevel: t('finance.riskManagement.offtakeAgreements.riskLevel'),
    },
    {
      icon: Lock,
      title: t('finance.riskManagement.crossVertical.title'),
      desc: t('finance.riskManagement.crossVertical.desc'),
      riskLevel: t('finance.riskManagement.crossVertical.riskLevel'),
    },
  ],

  pipeline: [
    { vertical: t('finance.pipeline.intelligence.vertical'), instrument: t('finance.pipeline.intelligence.instrument'), amount: '$400M', status: t('finance.pipeline.intelligence.status'), country: t('finance.pipeline.intelligence.country') },
    { vertical: t('finance.pipeline.cement.vertical'), instrument: t('finance.pipeline.cement.instrument'), amount: '$200M', status: t('finance.pipeline.cement.status'), country: t('finance.pipeline.cement.country') },
    { vertical: t('finance.pipeline.energy.vertical'), instrument: t('finance.pipeline.energy.instrument'), amount: '$350M', status: t('finance.pipeline.energy.status'), country: t('finance.pipeline.energy.country') },
    { vertical: t('finance.pipeline.agri.vertical'), instrument: t('finance.pipeline.agri.instrument'), amount: '$50M', status: t('finance.pipeline.agri.status'), country: t('finance.pipeline.agri.country') },
    { vertical: t('finance.pipeline.mining.vertical'), instrument: t('finance.pipeline.mining.instrument'), amount: '$180M', status: t('finance.pipeline.mining.status'), country: t('finance.pipeline.mining.country') },
    { vertical: t('finance.pipeline.water.vertical'), instrument: t('finance.pipeline.water.instrument'), amount: '$120M', status: t('finance.pipeline.water.status'), country: t('finance.pipeline.water.country') },
    { vertical: t('finance.pipeline.crossVertical.vertical'), instrument: t('finance.pipeline.crossVertical.instrument'), amount: '$100M', status: t('finance.pipeline.crossVertical.status'), country: t('finance.pipeline.crossVertical.country') },
  ],

  roadmap: [
    {
      phase: t('finance.roadmap.phase1.phase'), period: '2026', title: t('finance.roadmap.phase1.title'),
      pipelineTarget: '$200M',
      actions: [
        t('finance.roadmap.phase1.actions.0'),
        t('finance.roadmap.phase1.actions.1'),
        t('finance.roadmap.phase1.actions.2'),
        t('finance.roadmap.phase1.actions.3'),
        t('finance.roadmap.phase1.actions.4'),
        t('finance.roadmap.phase1.actions.5'),
      ],
    },
    {
      phase: t('finance.roadmap.phase2.phase'), period: '2027-2028', title: t('finance.roadmap.phase2.title'),
      pipelineTarget: '$800M',
      actions: [
        t('finance.roadmap.phase2.actions.0'),
        t('finance.roadmap.phase2.actions.1'),
        t('finance.roadmap.phase2.actions.2'),
        t('finance.roadmap.phase2.actions.3'),
        t('finance.roadmap.phase2.actions.4'),
        t('finance.roadmap.phase2.actions.5'),
      ],
    },
    {
      phase: t('finance.roadmap.phase3.phase'), period: '2028-2029', title: t('finance.roadmap.phase3.title'),
      pipelineTarget: '$1.6B',
      actions: [
        t('finance.roadmap.phase3.actions.0'),
        t('finance.roadmap.phase3.actions.1'),
        t('finance.roadmap.phase3.actions.2'),
        t('finance.roadmap.phase3.actions.3'),
        t('finance.roadmap.phase3.actions.4'),
        t('finance.roadmap.phase3.actions.5'),
      ],
    },
    {
      phase: t('finance.roadmap.phase4.phase'), period: '2029-2031', title: t('finance.roadmap.phase4.title'),
      pipelineTarget: t('finance.roadmap.phase4.pipelineTarget'),
      actions: [
        t('finance.roadmap.phase4.actions.0'),
        t('finance.roadmap.phase4.actions.1'),
        t('finance.roadmap.phase4.actions.2'),
        t('finance.roadmap.phase4.actions.3'),
        t('finance.roadmap.phase4.actions.4'),
        t('finance.roadmap.phase4.actions.5'),
      ],
    },
  ],

  risks: [
    { risk: t('finance.risks.regulatoryChanges.risk'), probability: t('finance.risks.regulatoryChanges.probability'), impact: t('finance.risks.regulatoryChanges.impact'), mitigation: t('finance.risks.regulatoryChanges.mitigation') },
    { risk: t('finance.risks.currencyDepreciation.risk'), probability: t('finance.risks.currencyDepreciation.probability'), impact: t('finance.risks.currencyDepreciation.impact'), mitigation: t('finance.risks.currencyDepreciation.mitigation') },
    { risk: t('finance.risks.politicalRisk.risk'), probability: t('finance.risks.politicalRisk.probability'), impact: t('finance.risks.politicalRisk.impact'), mitigation: t('finance.risks.politicalRisk.mitigation') },
    { risk: t('finance.risks.marketLiquidity.risk'), probability: t('finance.risks.marketLiquidity.probability'), impact: t('finance.risks.marketLiquidity.impact'), mitigation: t('finance.risks.marketLiquidity.mitigation') },
    { risk: t('finance.risks.carbonVolatility.risk'), probability: t('finance.risks.carbonVolatility.probability'), impact: t('finance.risks.carbonVolatility.impact'), mitigation: t('finance.risks.carbonVolatility.mitigation') },
    { risk: t('finance.risks.talentAcquisition.risk'), probability: t('finance.risks.talentAcquisition.probability'), impact: t('finance.risks.talentAcquisition.impact'), mitigation: t('finance.risks.talentAcquisition.mitigation') },
  ],
};

  return (
    <div className="bg-[#0D0D0D] text-white overflow-x-hidden">
      {/* ═══════════════════════════════════════════
          HERO — Full-screen immersive
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] flex items-end overflow-hidden">
        <Image
          src={data.heroImage}
          alt={t('finance.imageAlt1')}
          fill
          className="object-cover"
          priority
          style={{ filter: 'brightness(0.35) contrast(1.1) saturate(0.5)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/60 via-transparent to-transparent" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pb-20 md:pb-32 w-full">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('finance.heroBadge')}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-[clamp(2.5rem,6vw,6rem)] font-extrabold text-white leading-[0.95] tracking-[-0.03em] mb-6 whitespace-pre-line">
              {data.heroTitle}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-4">{data.heroSubtitle}</p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="mt-10 flex flex-wrap gap-8 md:gap-12">
              {data.metrics.map((m) => (
                <div key={m.label}>
                  <p className="text-[clamp(1.25rem,2.5vw,2rem)] font-bold text-white stat-mono">
                    {m.display}
                  </p>
                  <p className="text-[10px] text-[#666666] uppercase tracking-[0.1em] font-bold mt-1 font-[family-name:var(--font-space-mono)]">{m.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.45}>
            <div className="mt-10 w-full max-w-md">
              <VideoPlayer
                src="/videos/v11_finance.mp4"
                variant="modal-trigger"
                label="Watch teaser (40s)"
                className="w-full aspect-video"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════════════════════════════════
          OVERVIEW
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <FadeIn direction="left">
              <div>
                <p className="section-label mb-4 text-[#8B9DAF]">{t('finance.overviewLabel')}</p>
                <TextReveal as="h2" text={t('finance.overviewTitle')} className="text-[clamp(1.75rem,4vw,3.25rem)] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4" />
                <div className="accent-line mb-6" />
                <p className="text-[15px] text-[#999999] leading-[1.7]">{data.overview}</p>
              </div>
            </FadeIn>
            <FadeIn direction="right" delay={0.15}>
              <StaggerContainer className="grid grid-cols-2 gap-4" staggerDelay={0.08}>
                {data.metrics.map((m) => (
                  <StaggerItem key={m.label}>
                    <Card3D className="p-6">
                      <p className="text-[clamp(1.25rem,2.5vw,2rem)] font-bold text-white stat-mono">
                        {m.display}
                      </p>
                      <p className="text-[10px] text-[#666666] uppercase tracking-[0.1em] font-bold mt-2 font-[family-name:var(--font-space-mono)]">{m.label}</p>
                    </Card3D>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </FadeIn>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════════════════════════════════
          INVESTMENT PHILOSOPHY — Photo + Text
          ═══════════════════════════════════════════ */}
      <section className="bg-[#0D0D0D]">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[45vh] lg:min-h-0 overflow-hidden">
              <Image
                src="/images/sections/finance-trading.jpg"
                alt={t('finance.imageAlt2')}
                fill
                className="object-cover industrial-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0D0D0D]/40 lg:bg-gradient-to-l lg:from-transparent lg:to-[#0D0D0D]" />
            </div>
            <div className="flex items-center px-8 md:px-16 py-20">
              <div className="max-w-lg">
                <FadeIn direction="right">
                  <p className="section-label mb-4 text-[#8B9DAF]">{t('finance.investmentPhilosophyLabel')}</p>
                  <TextReveal as="h2" text={t('finance.investmentPhilosophyTitle')} className="text-[clamp(1.75rem,4vw,3.25rem)] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4" />
                  <div className="accent-line mb-6" />
                  <p className="text-[15px] text-[#999999] leading-[1.7]">{data.investmentPhilosophy}</p>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════════════════════════════════
          FINANCIAL INSTRUMENTS — The 6 Pillars
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('finance.instrumentsLabel')}</p>
            <TextReveal as="h2" text={t('finance.instrumentsTitle')} className="text-[clamp(1.75rem,4vw,3.25rem)] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4" />
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              {t('finance.instrumentsSubtitle')}
            </p>
          </FadeIn>
          <StaggerContainer className="grid md:grid-cols-2 gap-6" staggerDelay={0.08}>
            {data.financialInstruments.map((instrument) => {
              const Icon = instrument.icon;
              return (
                <StaggerItem key={instrument.name}>
                  <Card3D className="p-8 h-full" glareEnabled>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-[rgba(${ACCENT_RGB},0.08)] flex items-center justify-center`}>
                          <Icon size={18} className={`text-[${ACCENT}]`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{instrument.name}</h3>
                          <p className="text-[11px] text-[#666666]">{instrument.tagline}</p>
                        </div>
                      </div>
                    </div>
                    {/* Description */}
                    <p className="text-[14px] text-[#999999] leading-[1.7] mb-6">{instrument.description}</p>
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {instrument.stats.map((stat, j) => (
                        <div key={j} className="text-center p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                          <p className="text-sm font-bold text-white stat-mono">{stat.value}</p>
                          <p className="text-[9px] text-[#666666] uppercase tracking-wider mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {instrument.features.map((feature, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <div className={`mt-1.5 w-1 h-1 rounded-full bg-[rgba(${ACCENT_RGB},0.4)] flex-shrink-0`} />
                          <span className="text-[12px] text-[#999999]">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </Card3D>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PHOTO BREAK — Finance District
          ═══════════════════════════════════════════ */}
      <ParallaxSection speed={0.2} className="photo-section">
        <Image
          src="/images/sections/finance-corporate.jpg"
          alt={t('finance.imageAlt3')}
          fill
          className="object-cover"
          style={{ filter: 'brightness(0.35) contrast(1.1) saturate(0.5)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D] via-transparent to-[#0D0D0D]" />
      </ParallaxSection>

      {/* ═══════════════════════════════════════════
          PIPELINE TABLE
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('finance.pipelineLabel')}</p>
            <TextReveal as="h2" text={t('finance.pipelineTitle')} className="text-[clamp(1.75rem,4vw,3.25rem)] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4" />
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              {t('finance.pipelineSubtitle')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('finance.pipelineTable.vertical')}</th>
                      <th>{t('finance.pipelineTable.instrument')}</th>
                      <th>{t('finance.pipelineTable.amount')}</th>
                      <th>{t('finance.pipelineTable.status')}</th>
                      <th>{t('finance.pipelineTable.country')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pipeline.map((row) => (
                      <tr key={row.vertical + row.instrument}>
                        <td>{row.vertical}</td>
                        <td>{row.instrument}</td>
                        <td className="font-[family-name:var(--font-space-mono)]">{row.amount}</td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                            row.status === 'Structuring' || row.status === 'Mandated'
                              ? `bg-[rgba(${ACCENT_RGB},0.12)] text-[${ACCENT}]`
                              : row.status === 'Fundraising' || row.status === 'Pre-mandate'
                              ? 'bg-[rgba(255,255,255,0.06)] text-[#999999]'
                              : 'bg-[rgba(255,255,255,0.03)] text-[#666666]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              row.status === 'Structuring' || row.status === 'Mandated'
                                ? `bg-[${ACCENT}]`
                                : row.status === 'Fundraising' || row.status === 'Pre-mandate'
                                ? 'bg-[#999999]'
                                : 'bg-[#666666]'
                            }`} />
                            {row.status}
                          </span>
                        </td>
                        <td className="!text-[#666666] !font-normal">{row.country}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
                <p className="text-[10px] text-[#666666]">{t('finance.pipelineTable.footnote')}</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════════════════════════════════
          PARTNERSHIP MODELS
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('finance.partnershipModelsLabel')}</p>
            <TextReveal as="h2" text={t('finance.partnershipModelsTitle')} className="text-[clamp(1.75rem,4vw,3.25rem)] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4" />
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              {t('finance.partnershipModelsSubtitle')}
            </p>
          </FadeIn>
          <StaggerContainer className="grid md:grid-cols-2 gap-6" staggerDelay={0.08}>
            {data.partnershipModels.map((model) => {
              const Icon = model.icon;
              return (
                <StaggerItem key={model.title}>
                  <Card3D className="p-8 h-full">
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`w-10 h-10 rounded-lg bg-[rgba(${ACCENT_RGB},0.08)] flex items-center justify-center`}>
                        <Icon size={18} className={`text-[${ACCENT}]`} />
                      </div>
                      <h3 className="text-lg font-bold text-white">{model.title}</h3>
                    </div>
                    <p className="text-[14px] text-[#999999] leading-[1.7]">{model.desc}</p>
                  </Card3D>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════════════════════════════════
          STRATEGIC ADVANTAGES
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('finance.strategicAdvantagesLabel')}</p>
            <TextReveal as="h2" text={t('finance.strategicAdvantagesTitle')} className="text-[clamp(1.75rem,4vw,3.25rem)] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4" />
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              {t('finance.strategicAdvantagesSubtitle')}
            </p>
          </FadeIn>
          <StaggerContainer className="grid md:grid-cols-2 gap-6" staggerDelay={0.08}>
            {data.strategicAdvantages.map((adv) => {
              const Icon = adv.icon;
              return (
                <StaggerItem key={adv.title}>
                  <Card3D className="p-8 h-full">
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`w-10 h-10 rounded-lg bg-[rgba(${ACCENT_RGB},0.08)] flex items-center justify-center`}>
                        <Icon size={18} className={`text-[${ACCENT}]`} />
                      </div>
                      <h3 className="text-lg font-bold text-white">{adv.title}</h3>
                    </div>
                    <p className="text-[14px] text-[#999999] leading-[1.7]">{adv.desc}</p>
                  </Card3D>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* Cross-Vertical Integration Highlight */}
          <FadeIn delay={0.4}>
            <div className="mt-6 card p-8 border-dashed" style={{ borderColor: `rgba(${ACCENT_RGB},0.25)` }}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg bg-[rgba(${ACCENT_RGB},0.08)] flex items-center justify-center flex-shrink-0`}>
                  <TrendingUp size={18} className={`text-[${ACCENT}]`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{t('finance.crossVerticalTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.7]">
                    {t('finance.crossVerticalDesc')}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════════════════════════════════
          RISK MANAGEMENT
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('finance.riskManagementLabel')}</p>
            <TextReveal as="h2" text={t('finance.riskManagementTitle')} className="text-[clamp(1.75rem,4vw,3.25rem)] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4" />
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              {t('finance.riskManagementSubtitle')}
            </p>
          </FadeIn>
          <StaggerContainer className="grid md:grid-cols-2 gap-6" staggerDelay={0.08}>
            {data.riskManagement.map((rm) => {
              const Icon = rm.icon;
              return (
                <StaggerItem key={rm.title}>
                  <Card3D className="p-8 h-full">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-[rgba(${ACCENT_RGB},0.08)] flex items-center justify-center`}>
                          <Icon size={18} className={`text-[${ACCENT}]`} />
                        </div>
                        <h3 className="text-lg font-bold text-white">{rm.title}</h3>
                      </div>
                      <span className={`text-[10px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 rounded bg-[rgba(${ACCENT_RGB},0.08)] text-[${ACCENT}] font-[family-name:var(--font-space-mono)]`}>
                        {rm.riskLevel}
                      </span>
                    </div>
                    <p className="text-[14px] text-[#999999] leading-[1.7]">{rm.desc}</p>
                  </Card3D>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════════════════════════════════
          ROADMAP
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('finance.roadmapLabel')}</p>
            <TextReveal as="h2" text={t('finance.roadmapTitle')} className="text-[clamp(1.75rem,4vw,3.25rem)] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4" />
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              {t('finance.roadmapSubtitle')}
            </p>
          </FadeIn>
          <StaggerContainer className="space-y-6" staggerDelay={0.08}>
            {data.roadmap.map((phase, i) => (
              <StaggerItem key={phase.phase}>
                <div className="card p-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between mb-5 gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg bg-[rgba(${ACCENT_RGB},0.08)] flex items-center justify-center flex-shrink-0`}>
                        <span className="text-sm font-bold text-[#8B9DAF] stat-mono">{i + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{phase.title}</h3>
                        <p className="text-[11px] text-[#666666]">{phase.phase} · {phase.period}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#666666] uppercase tracking-wider">{t('finance.pipelineTargetLabel')}</p>
                      <p className="text-xl font-bold text-white stat-mono">{phase.pipelineTarget}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {phase.actions.map((action, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <div className={`mt-1.5 w-1 h-1 rounded-full bg-[rgba(${ACCENT_RGB},0.4)] flex-shrink-0`} />
                        <span className="text-[12px] text-[#999999]">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════════════════════════════════
          RISK REGISTER
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('finance.riskRegisterLabel')}</p>
            <TextReveal as="h2" text={t('finance.riskRegisterTitle')} className="text-[clamp(1.75rem,4vw,3.25rem)] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4" />
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              {t('finance.riskRegisterSubtitle')}
            </p>
          </FadeIn>
          <div className="space-y-4">
            {data.risks.map((r, i) => (
              <FadeIn key={r.risk} delay={i * 0.06}>
                <div className="card p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={14} className={`text-[${ACCENT}]`} />
                        <h3 className="font-bold text-white text-[15px]">{r.risk}</h3>
                      </div>
                    </div>
                    <div className="md:col-span-2 flex gap-3">
                      <div>
                        <p className="text-[9px] text-[#666666] uppercase tracking-wider mb-1">{t('finance.probability')}</p>
                        <span className={`text-[11px] font-semibold ${
                          r.probability === 'High' ? 'text-red-400' :
                          r.probability === 'Medium' ? `text-[${ACCENT}]` : 'text-green-400'
                        }`}>{r.probability}</span>
                      </div>
                      <div>
                        <p className="text-[9px] text-[#666666] uppercase tracking-wider mb-1">{t('finance.impact')}</p>
                        <span className={`text-[11px] font-semibold ${
                          r.impact === 'Critical' ? 'text-red-400' :
                          r.impact === 'High' ? `text-[${ACCENT}]` : 'text-green-400'
                        }`}>{r.impact}</span>
                      </div>
                    </div>
                    <div className="md:col-span-6">
                      <p className="text-[13px] text-[#999999] leading-[1.6]">
                        <span className={`text-[10px] text-[${ACCENT}] uppercase tracking-wider font-bold`}>{t('finance.mitigation')}:</span>{' '}
                        {r.mitigation}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('finance.ctaLabel')}</p>
            <TextReveal as="h2" text={t('finance.ctaTitle')} className="text-[clamp(1.75rem,4vw,3.25rem)] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4" />
            <div className="accent-line mx-auto mb-6" />
            <p className="max-w-xl mx-auto text-[15px] text-[#999999] leading-[1.7] mb-10">
              {t('finance.ctaSubtitle')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <MagneticButton>
                <Link
                  href="/contact"
                  className={`inline-flex items-center gap-2 border border-[rgba(${ACCENT_RGB},0.4)] bg-[rgba(${ACCENT_RGB},0.06)] text-[${ACCENT}] text-[11px] tracking-[0.1em] uppercase px-6 py-3 rounded-md font-semibold hover:bg-[rgba(${ACCENT_RGB},0.12)] hover:border-[rgba(${ACCENT_RGB},0.6)] transition-colors font-[family-name:var(--font-space-mono)] min-h-[44px]`}
                >
                  {t('finance.ctaPrimary')}
                  <ArrowRight size={12} />
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  href="/investors"
                  className="inline-flex items-center gap-2 border border-[rgba(255,255,255,0.1)] bg-transparent text-[rgba(255,255,255,0.5)] text-[11px] tracking-[0.1em] uppercase px-6 py-3 rounded-md font-semibold hover:border-[rgba(255,255,255,0.2)] hover:text-white transition-colors font-[family-name:var(--font-space-mono)] min-h-[44px]"
                >
                  {t('finance.ctaSecondary')}
                  <ArrowRight size={12} />
                </Link>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>
      <InteractivePlatform slug="finance" accent="#8B9DAF" />
    </div>
  );
}
