'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, type CSSProperties } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CountUp,
} from '@/components/ui/motion';
import {
  ArrowRight,
  ArrowLeft,
  Shield,
  Leaf,
  Award,
  Zap,
  Target,
  Eye,
  Heart,
  Scale,
  Users,
  Briefcase,
  TrendingUp,
  Building2,
  MapPin,
  Quote,
  TreePine,
  Cpu,
  Sun,
  Mountain,
  Factory,
  Droplets,
  Sprout,
  Banknote,
  Plug,
} from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';
import type { LucideIcon } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   HELPER COMPONENTS — Harch brand primitives
   ═══════════════════════════════════════════════════════════════ */

function SectionLabel({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="block h-px w-10 bg-emerald-500" aria-hidden />
      <p
        className={`font-mono text-xs font-semibold uppercase tracking-[0.2em] ${
          light ? 'text-emerald-600' : 'text-emerald-500'
        }`}
      >
        {children}
      </p>
    </div>
  );
}

function HarchHeroBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-neutral-800 bg-neutral-950/70 px-4 py-1.5 backdrop-blur">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-neutral-200">
        {children}
      </span>
    </span>
  );
}

function GridPattern({ light = false }: { light?: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: light
          ? 'linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)'
          : 'linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage:
          'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 80%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 80%)',
      }}
    />
  );
}

function MarkerPulse({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute z-10"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-emerald-500 bg-neutral-950" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TYPES — kept at module scope (no runtime data, no translation needed)
   ═══════════════════════════════════════════════════════════════ */

type TimelineStatus = 'Done' | 'Planned' | 'Vision';

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT — 18 brand-compliant sections
   Rhythm: D-L-D-L-D-L-D-L-D-L-D-L-D-L-D-L-D-D-D
   ═══════════════════════════════════════════════════════════════ */

export default function AboutPageClient() {
  const t = useTranslations('about');
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  /* ─── Localized data arrays ─── */
  const heroStats: { value: number; label: string; suffix: string }[] = [
    { value: 2024, label: t('heroStats.founded'), suffix: '' },
    { value: 8, label: t('heroStats.verticals'), suffix: '' },
    { value: 2400, label: t('heroStats.pipeline'), suffix: '' },
    { value: 25, label: t('heroStats.countries'), suffix: '+' },
  ];

  const trustStrip: { value: string; label: string }[] = [
    { value: '2024', label: t('trustStrip.founded') },
    { value: 'Casablanca', label: t('trustStrip.headquarters') },
    { value: 'Building in Public', label: t('trustStrip.capital') },
    { value: '8', label: t('trustStrip.filiales') },
    { value: '5', label: t('trustStrip.countriesBy2030') },
    { value: '$2.4B', label: t('trustStrip.pipeline') },
    { value: '1,798', label: t('trustStrip.gpus') },
  ];

  const missionPillars: {
    icon: LucideIcon;
    title: string;
    tag: string;
    desc: string;
  }[] = [
    {
      icon: Shield,
      title: t('missionPillars.sovereignty.title'),
      tag: t('missionPillars.sovereignty.tag'),
      desc: t('missionPillars.sovereignty.desc'),
    },
    {
      icon: Leaf,
      title: t('missionPillars.sustainability.title'),
      tag: t('missionPillars.sustainability.tag'),
      desc: t('missionPillars.sustainability.desc'),
    },
    {
      icon: Award,
      title: t('missionPillars.excellence.title'),
      tag: t('missionPillars.excellence.tag'),
      desc: t('missionPillars.excellence.desc'),
    },
  ];

  const historyStats: { value: string; label: string }[] = [
    { value: '2024', label: t('historyStats.founded') },
    { value: 'Casablanca', label: t('historyStats.headquarters') },
    { value: '8', label: t('historyStats.plannedVerticals') },
    { value: '$2.4B', label: t('historyStats.investmentPipeline') },
    { value: '5', label: t('historyStats.countriesBy2030') },
    { value: '25,000+', label: t('historyStats.jobsBy2030') },
    { value: '100', label: t('historyStats.yearVision') },
    { value: 'Solo', label: t('historyStats.founderLed') },
  ];

  const timeline: {
    year: string;
    title: string;
    status: TimelineStatus;
    desc: string;
  }[] = [
    {
      year: '2024',
      title: t('timeline.2024.title'),
      status: 'Done',
      desc: t('timeline.2024.desc'),
    },
    {
      year: '2026',
      title: t('timeline.2026.title'),
      status: 'Planned',
      desc: t('timeline.2026.desc'),
    },
    {
      year: '2028',
      title: t('timeline.2028.title'),
      status: 'Planned',
      desc: t('timeline.2028.desc'),
    },
    {
      year: '2030',
      title: t('timeline.2030.title'),
      status: 'Planned',
      desc: t('timeline.2030.desc'),
    },
    {
      year: '2035',
      title: t('timeline.2035.title'),
      status: 'Vision',
      desc: t('timeline.2035.desc'),
    },
    {
      year: '2050',
      title: t('timeline.2050.title'),
      status: 'Vision',
      desc: t('timeline.2050.desc'),
    },
  ];

  const values: { icon: LucideIcon; title: string; desc: string }[] = [
    { icon: Shield, title: t('valuesList.sovereignty.title'), desc: t('valuesList.sovereignty.desc') },
    { icon: Zap, title: t('valuesList.speed.title'), desc: t('valuesList.speed.desc') },
    { icon: Target, title: t('valuesList.integration.title'), desc: t('valuesList.integration.desc') },
    { icon: Eye, title: t('valuesList.transparency.title'), desc: t('valuesList.transparency.desc') },
    { icon: Heart, title: t('valuesList.stewardship.title'), desc: t('valuesList.stewardship.desc') },
    { icon: Scale, title: t('valuesList.discipline.title'), desc: t('valuesList.discipline.desc') },
  ];

  const leadershipTeam: {
    name: string;
    title: string;
    desc: string;
    image: string;
  }[] = [
    {
      name: t('leadershipTeam.founder.name'),
      title: t('leadershipTeam.founder.title'),
      desc: t('leadershipTeam.founder.desc'),
      image: '',
    },
    {
      name: t('leadershipTeam.coo.name'),
      title: t('leadershipTeam.coo.title'),
      desc: t('leadershipTeam.coo.desc'),
      image: '',
    },
    {
      name: t('leadershipTeam.cto.name'),
      title: t('leadershipTeam.cto.title'),
      desc: t('leadershipTeam.cto.desc'),
      image: '',
    },
    {
      name: t('leadershipTeam.cfo.name'),
      title: t('leadershipTeam.cfo.title'),
      desc: t('leadershipTeam.cfo.desc'),
      image: '',
    },
    {
      name: t('leadershipTeam.vpIntel.name'),
      title: t('leadershipTeam.vpIntel.title'),
      desc: t('leadershipTeam.vpIntel.desc'),
      image: '',
    },
    {
      name: t('leadershipTeam.vpSust.name'),
      title: t('leadershipTeam.vpSust.title'),
      desc: t('leadershipTeam.vpSust.desc'),
      image: '',
    },
    {
      name: t('leadershipTeam.advisor.name'),
      title: t('leadershipTeam.advisor.title'),
      desc: t('leadershipTeam.advisor.desc'),
      image: '',
    },
  ];

  const buildInPublicPrinciples = [
    {
      title: t('buildInPublicPrinciples.publicRoadmap.title'),
      desc: t('buildInPublicPrinciples.publicRoadmap.desc'),
    },
    {
      title: t('buildInPublicPrinciples.openMetrics.title'),
      desc: t('buildInPublicPrinciples.openMetrics.desc'),
    },
    {
      title: t('buildInPublicPrinciples.honestFailures.title'),
      desc: t('buildInPublicPrinciples.honestFailures.desc'),
    },
    {
      title: t('buildInPublicPrinciples.noVaporPartnerships.title'),
      desc: t('buildInPublicPrinciples.noVaporPartnerships.desc'),
    },
  ];

  const verticals: {
    name: string;
    tag: string;
    metric: string;
    icon: LucideIcon;
    href: string;
  }[] = [
    { name: t('verticalsList.intelligence.name'), tag: t('verticalsList.intelligence.tag'), metric: t('verticalsList.intelligence.metric'), icon: Cpu, href: '/subsidiaries/intelligence' },
    { name: t('verticalsList.energy.name'), tag: t('verticalsList.energy.tag'), metric: t('verticalsList.energy.metric'), icon: Sun, href: '/subsidiaries/energy' },
    { name: t('verticalsList.mining.name'), tag: t('verticalsList.mining.tag'), metric: t('verticalsList.mining.metric'), icon: Mountain, href: '/subsidiaries/mining' },
    { name: t('verticalsList.cement.name'), tag: t('verticalsList.cement.tag'), metric: t('verticalsList.cement.metric'), icon: Factory, href: '/subsidiaries/cement' },
    { name: t('verticalsList.agriculture.name'), tag: t('verticalsList.agriculture.tag'), metric: t('verticalsList.agriculture.metric'), icon: Sprout, href: '/subsidiaries/agriculture' },
    { name: t('verticalsList.water.name'), tag: t('verticalsList.water.tag'), metric: t('verticalsList.water.metric'), icon: Droplets, href: '/subsidiaries/water' },
    { name: t('verticalsList.technology.name'), tag: t('verticalsList.technology.tag'), metric: t('verticalsList.technology.metric'), icon: Plug, href: '/subsidiaries/technology' },
    { name: t('verticalsList.finance.name'), tag: t('verticalsList.finance.tag'), metric: t('verticalsList.finance.metric'), icon: Banknote, href: '/subsidiaries/finance' },
  ];

  const esgCards: {
    icon: LucideIcon;
    title: string;
    metric: string;
    desc: string;
  }[] = [
    { icon: Leaf, title: t('esgCards.carbon.title'), metric: t('esgCards.carbon.metric'), desc: t('esgCards.carbon.desc') },
    { icon: Users, title: t('esgCards.community.title'), metric: t('esgCards.community.metric'), desc: t('esgCards.community.desc') },
    { icon: Scale, title: t('esgCards.governance.title'), metric: t('esgCards.governance.metric'), desc: t('esgCards.governance.desc') },
    { icon: TreePine, title: t('esgCards.biodiversity.title'), metric: t('esgCards.biodiversity.metric'), desc: t('esgCards.biodiversity.desc') },
  ];

  const partners: { name: string; type: string }[] = [
    { name: t('partnersList.kingdomOfMorocco.name'), type: t('partnersList.kingdomOfMorocco.type') },
    { name: t('partnersList.republicOfGambia.name'), type: t('partnersList.republicOfGambia.type') },
    { name: t('partnersList.ocpGroup.name'), type: t('partnersList.ocpGroup.type') },
    { name: t('partnersList.masen.name'), type: t('partnersList.masen.type') },
    { name: t('partnersList.afdb.name'), type: t('partnersList.afdb.type') },
    { name: t('partnersList.eib.name'), type: t('partnersList.eib.type') },
    { name: t('partnersList.ifc.name'), type: t('partnersList.ifc.type') },
    { name: t('partnersList.worldBank.name'), type: t('partnersList.worldBank.type') },
    { name: t('partnersList.ameaPower.name'), type: t('partnersList.ameaPower.type') },
    { name: t('partnersList.afc.name'), type: t('partnersList.afc.type') },
  ];

  const careersStats: {
    icon: LucideIcon;
    label: string;
    value: string;
    note: string;
  }[] = [
    { icon: Briefcase, label: t('careersStats.openRoles.label'), value: '0', note: t('careersStats.openRoles.note') },
    { icon: Users, label: t('careersStats.plannedBy2030.label'), value: '3,200', note: t('careersStats.plannedBy2030.note') },
    { icon: TrendingUp, label: t('careersStats.pipeline.label'), value: '$2.4B', note: t('careersStats.pipeline.note') },
    { icon: Building2, label: t('careersStats.filiales.label'), value: '8', note: t('careersStats.filiales.note') },
  ];

  const investorStats: { label: string; value: string }[] = [
    { label: t('investorStats.capitalStructure'), value: 'Building in Public' },
    { label: t('investorStats.pipeline'), value: '$2.4B' },
    { label: t('investorStats.horizon'), value: '100 yrs' },
    { label: t('investorStats.filiales'), value: '8' },
  ];

  const timelineStatusLabel = (s: TimelineStatus) =>
    s === 'Done' ? t('timelineSection.statusDone') : s === 'Planned' ? t('timelineSection.statusPlanned') : t('timelineSection.statusVision');

  return (
    <div
      className="bg-neutral-950 font-sans"
      style={
        { '--font-mono': 'var(--font-space-mono), monospace' } as CSSProperties
      }
    >
      {/* ═══════ SECTION 1 — HERO (DARK) ═══════ */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] overflow-hidden bg-neutral-950 pb-20 pt-32 md:pb-32 md:pt-44"
      >
        <GridPattern />
        <motion.div
          aria-hidden
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="pointer-events-none absolute -top-32 left-1/4 h-[500px] w-[700px] rounded-full bg-emerald-500/[0.06] blur-[120px]"
        />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <HarchHeroBadge>{t('heroBadge')}</HarchHeroBadge>
          </FadeIn>
          <motion.div style={{ y: heroTextY }} className="mt-8">
            <FadeIn delay={0.1}>
              <h1 className="max-w-5xl text-5xl font-extrabold leading-[0.95] tracking-[-0.03em] text-white md:text-7xl lg:text-[88px]">
                {t('hero.titleLine1')}
                <br />
                {t('hero.titleLine2')}
                <span className="text-emerald-500">.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-300 md:text-xl">
                {t('heroLead')}
              </p>
              <p className="mt-4 max-w-xl text-[15px] leading-[1.7] text-neutral-500">
                {t('heroBody')}
              </p>
            </FadeIn>
          </motion.div>

          <FadeIn delay={0.3}>
            <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-neutral-800 bg-neutral-800 md:grid-cols-4">
              {heroStats.map((stat) => (
                <div key={stat.label} className="bg-neutral-950 p-6 md:p-8">
                  <p className="mb-2 font-mono text-3xl font-extrabold text-white md:text-4xl">
                    <CountUp to={stat.value} suffix={stat.suffix} duration={2} />
                  </p>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="mt-10 flex max-w-3xl flex-col gap-6 rounded-lg border border-neutral-800 bg-neutral-900 p-6 md:flex-row md:items-center md:p-8">
              <div className="h-40 w-full shrink-0 md:w-72">
                <VideoPlayer
                  src="/videos/v1_brand.mp4"
                  variant="modal-trigger"
                  label={t('hero.videoLabel')}
                  className="h-full w-full"
                />
              </div>
              <div>
                <SectionLabel>{t('hero.storyLabel')}</SectionLabel>
                <p className="text-[15px] leading-relaxed text-neutral-300">
                  {t('hero.storyText')}
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ SECTION 2 — TRUST STRIP (LIGHT) ═══════ */}
      <section className="border-y border-neutral-200 bg-white py-12">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 lg:grid-cols-7">
              {trustStrip.map((item) => (
                <div key={item.label} className="text-center sm:text-left">
                  <p className="font-mono text-2xl font-bold text-neutral-950">
                    {item.value}
                  </p>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ SECTION 3 — MISSION STATEMENT (DARK) ═══════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 md:py-32">
        <GridPattern />
        <div className="relative z-10 mx-auto max-w-[900px] px-6 md:px-12">
          <FadeIn>
            <div className="mb-8 border-l-2 border-emerald-500 border-b border-neutral-800 pb-8 pl-8 md:pl-12">
              <Quote
                className="mb-4 h-8 w-8 text-emerald-500"
                strokeWidth={1.5}
              />
              <p className="text-[20px] font-light leading-[1.5] text-white md:text-[28px]">
                &ldquo;{t('mission.quote')}&rdquo;
              </p>
              <p className="mt-6 font-mono text-[12px] font-bold uppercase tracking-[0.15em] text-emerald-500">
                {t('mission.quoteAuthor')}
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="max-w-2xl space-y-6">
              <p className="text-[15px] leading-[1.8] text-neutral-400">
                {t('mission.introParagraph1')}
              </p>
              <p className="text-[15px] leading-[1.8] text-neutral-400">
                {t('mission.introParagraph2')}
              </p>
              <p className="text-[15px] leading-[1.8] text-neutral-400">
                {t('mission.introParagraph3')}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ SECTION 4 — FOUNDER SPOTLIGHT (LIGHT) ═══════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <FadeIn direction="right">
              <div className="relative">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200">
                  {/* Portrait photo replaced with a typographic monogram tile.
                      The original  asset was removed from
                      the repo and no suitable replacement photo is available.
                      Keeping the layout slot intact preserves the founder
                      spotlight design while we source a real headshot. */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-[120px] md:text-[160px] font-extrabold leading-none tracking-[-0.04em] text-neutral-900/90 select-none">
                      AH
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-neutral-200/80 bg-white/90 px-4 py-3 backdrop-blur">
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                        {t('founder.roleLabel')}
                      </p>
                      <p className="text-sm font-bold text-neutral-950">
                        {t('founder.name')}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-neutral-500">
                      {t('founder.tenure')}
                    </span>
                  </div>
                </div>
                {/* Floating stat card */}
                <div className="absolute -right-4 -top-4 hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-lg md:block">
                  <p className="font-mono text-3xl font-extrabold text-emerald-600">
                    16
                  </p>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                    {t('founder.ageAtVisionLabel')}
                  </p>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <SectionLabel light>{t('founder.label')}</SectionLabel>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950 md:text-5xl">
                {t('founder.title')}
              </h2>
              <p className="mt-4 text-lg text-neutral-500">
                {t('founder.subtitle')}
              </p>
              <div className="mt-8 space-y-5 text-[15px] leading-[1.8] text-neutral-500">
                <p>
                  {t('founder.paragraph1')}
                </p>
                <p>
                  {t('founder.paragraph2')}
                </p>
                <p>
                  {t('founder.paragraph3')}
                </p>
              </div>
              <blockquote className="mt-8 border-l-2 border-emerald-500 bg-emerald-50 px-6 py-4">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                  {t('founder.noteLabel')}
                </p>
                <p className="mt-2 text-[15px] italic leading-relaxed text-neutral-950">
                  &ldquo;{t('founder.quote')}&rdquo;
                </p>
              </blockquote>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="font-mono text-2xl font-extrabold text-neutral-950">
                    2024
                  </p>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                    {t('founder.founded')}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="font-mono text-2xl font-extrabold text-neutral-950">
                    100M
                  </p>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                    {t('founder.madCapital')}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <p className="font-mono text-2xl font-extrabold text-neutral-950">
                    100
                  </p>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                    {t('founder.yearHorizon')}
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 5 — THREE PILLARS (DARK) ═══════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 md:py-32">
        <GridPattern />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <SectionLabel>{t('mission.label')}</SectionLabel>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              {t('pillars.titleLine1')}
              <br />
              {t('pillars.titleLine2')}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              {t('pillars.subtitle')}
            </p>
          </FadeIn>
          <StaggerContainer
            staggerDelay={0.12}
            className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {missionPillars.map((pillar) => (
              <StaggerItem key={pillar.title}>
                <div className="group h-full rounded-2xl border border-neutral-800 bg-neutral-900 p-8 transition-colors hover:border-emerald-500/30 hover:bg-neutral-800">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-800 bg-emerald-500/10 text-emerald-500">
                      <pillar.icon size={20} strokeWidth={1.5} />
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                      {pillar.tag}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">
                    {pillar.title}
                  </h3>
                  <span className="mb-4 block h-px w-10 bg-emerald-500" />
                  <p className="text-[14px] leading-[1.7] text-neutral-400">
                    {pillar.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ SECTION 6 — HISTORY / FOUNDING (LIGHT) ═══════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
            <FadeIn>
              <SectionLabel light>{t('historySection.label')}</SectionLabel>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950 md:text-5xl">
                {t('historySection.titleLine1')}
                <br />
                {t('historySection.titleLine2')}
              </h2>
              <span className="mt-6 block h-px w-12 bg-emerald-500" />
              <div className="mt-6 space-y-5 text-[15px] leading-[1.8] text-neutral-500">
                <p>
                  {t('historySection.paragraph1')}
                </p>
                <p>
                  {t('historySection.paragraph2')}
                </p>
                <p>
                  {t('historySection.paragraph3')}
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {historyStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-neutral-200 bg-neutral-50 p-5"
                  >
                    <p className="mb-1 font-mono text-2xl font-bold text-neutral-950">
                      {stat.value}
                    </p>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 7 — TIMELINE (DARK) ═══════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 md:py-32">
        <GridPattern />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <SectionLabel>{t('timelineSection.label')}</SectionLabel>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              {t('timelineSection.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              {t('timelineSection.subtitle')}
            </p>
          </FadeIn>
          <div className="relative mt-16">
            <div className="absolute bottom-0 left-5 top-0 w-px bg-neutral-800 md:left-10" />
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ originY: 0 }}
              className="absolute bottom-0 left-5 top-0 w-px bg-emerald-500 md:left-10"
            />
            <div className="space-y-10">
              {timeline.map((item, i) => (
                <FadeIn key={item.year} delay={i * 0.06}>
                  <div className="relative flex gap-6 md:gap-12">
                    <div className="relative z-10 w-10 shrink-0 md:w-20">
                      <div
                        className={`mt-1.5 h-3.5 w-3.5 rounded-full border-2 ${
                          item.status === 'Done'
                            ? 'border-emerald-500 bg-emerald-500'
                            : item.status === 'Planned'
                              ? 'border-emerald-500 bg-neutral-950'
                              : 'border-neutral-600 bg-neutral-950'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-3">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                          {item.year}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] ${
                            item.status === 'Done'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : item.status === 'Planned'
                                ? 'bg-neutral-800 text-neutral-300'
                                : 'bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {timelineStatusLabel(item.status)}
                        </span>
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-white md:text-xl">
                        {item.title}
                      </h3>
                      <p className="max-w-lg text-[13px] leading-relaxed text-neutral-400">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 8 — VALUES (LIGHT) ═══════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <SectionLabel light>{t('valuesSection.label')}</SectionLabel>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950 md:text-5xl">
              {t('valuesSection.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              {t('valuesSection.subtitle')}
            </p>
          </FadeIn>
          <StaggerContainer
            staggerDelay={0.08}
            className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <div className="group h-full rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition-all hover:border-emerald-500/30 hover:bg-white hover:shadow-md">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                    <value.icon size={18} strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-neutral-950">
                    {value.title}
                  </h3>
                  <p className="text-[13px] leading-[1.7] text-neutral-500">
                    {value.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ SECTION 9 — LEADERSHIP TEAM (DARK) ═══════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 md:py-32">
        <GridPattern />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <SectionLabel>{t('leadershipSection.label')}</SectionLabel>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              {t('leadershipSection.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              {t('leadershipSection.subtitle')}
            </p>
          </FadeIn>
          <StaggerContainer
            staggerDelay={0.08}
            className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {leadershipTeam.map((person) => (
              <StaggerItem key={person.name}>
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition-colors hover:border-emerald-500/30 hover:bg-neutral-800">
                  <div className="relative aspect-square overflow-hidden border-b border-neutral-800 bg-neutral-800">
                    <Image
                      src={person.image}
                      alt={`${person.name} — ${person.title}`}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-1 text-base font-bold text-white">
                      {person.name}
                    </h3>
                    <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-emerald-500">
                      {person.title}
                    </p>
                    <span className="mb-3 block h-px w-8 bg-emerald-500" />
                    <p className="flex-1 text-[13px] leading-[1.7] text-neutral-400">
                      {person.desc}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <FadeIn delay={0.2}>
            <div className="mt-10 max-w-3xl rounded-r-md border-l-2 border-emerald-500 bg-emerald-500/[0.06] px-6 py-4">
              <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                {t('leadershipSection.noteLabel')}
              </p>
              <p className="text-[14px] leading-[1.7] text-neutral-300">
                {t('leadershipSection.noteText')}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ SECTION 10 — BUILD IN PUBLIC (LIGHT) ═══════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <SectionLabel light>{t('buildInPublic.label')}</SectionLabel>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950 md:text-5xl">
              {t('buildInPublic.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              {t('buildInPublic.subtitle')}
            </p>
          </FadeIn>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
            {buildInPublicPrinciples.map((principle, i) => (
              <FadeIn key={principle.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-neutral-200 bg-neutral-50 p-8 transition-all hover:bg-white hover:shadow-md">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-[11px] font-bold text-neutral-400">
                      0{i + 1}
                    </span>
                    <span className="block h-px w-8 bg-emerald-500" />
                    <h3 className="text-lg font-bold text-neutral-950">
                      {principle.title}
                    </h3>
                  </div>
                  <p className="text-[14px] leading-[1.7] text-neutral-500">
                    {principle.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 11 — GLOBAL PRESENCE (DARK) ═══════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 md:py-32">
        <GridPattern />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <SectionLabel>{t('globalPresence.label')}</SectionLabel>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              {t('globalPresence.headline')}.
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              {t('globalPresence.subtitle')}
            </p>
          </FadeIn>
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
            <FadeIn direction="right" className="lg:col-span-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                <Image
                  src="/images/africa-map-dark.png"
                  alt={t('globalPresence.mapAlt')}
                  fill
                  className="object-cover opacity-80"
                  sizes="(min-width: 1024px) 800px, 100vw"
                />
                {/* Markers */}
                <MarkerPulse x={45} y={20} />
                <MarkerPulse x={25} y={45} />
                <MarkerPulse x={22} y={50} />
                <MarkerPulse x={55} y={55} />
                <div className="absolute left-4 top-4 rounded-lg border border-neutral-800 bg-neutral-950/80 px-4 py-2 backdrop-blur">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                    {t('globalPresence.activeLabel')}
                  </p>
                  <p className="font-mono text-[10px] text-neutral-400">
                    {t('globalPresence.pipelineLabel')}
                  </p>
                </div>
              </div>
            </FadeIn>
            <div className="space-y-4 lg:col-span-2">
              {[
                {
                  name: t('globalPresence.moroccoName'),
                  role: t('globalPresence.moroccoRole'),
                  note: t('globalPresence.moroccoNote'),
                },
                {
                  name: t('globalPresence.senegalName'),
                  role: t('globalPresence.senegalRole'),
                  note: t('globalPresence.senegalNote'),
                },
                {
                  name: t('globalPresence.gambiaName'),
                  role: t('globalPresence.gambiaRole'),
                  note: t('globalPresence.gambiaNote'),
                },
                {
                  name: t('globalPresence.sahelName'),
                  role: t('globalPresence.sahelRole'),
                  note: t('globalPresence.sahelNote'),
                },
              ].map((c, i) => (
                <FadeIn key={c.name} delay={i * 0.08}>
                  <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition-colors hover:border-emerald-500/30 hover:bg-neutral-800">
                    <div className="flex items-center gap-4">
                      <MapPin
                        className="h-5 w-5 text-emerald-500"
                        strokeWidth={1.5}
                      />
                      <div>
                        <p className="text-base font-bold text-white">
                          {c.name}
                        </p>
                        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                          {c.role}
                        </p>
                      </div>
                    </div>
                    <p className="font-mono text-[11px] text-neutral-400">
                      {c.note}
                    </p>
                  </div>
                </FadeIn>
              ))}
              <FadeIn delay={0.4}>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                    {t('globalPresence.expansionLabel')}
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    {t('globalPresence.expansion')}
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 12 — VERTICALS GRID (LIGHT) ═══════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <SectionLabel light>{t('verticals.label')}</SectionLabel>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950 md:text-5xl">
              {t('verticals.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              {t('verticals.subtitle')}
            </p>
          </FadeIn>
          <StaggerContainer
            staggerDelay={0.06}
            className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4"
          >
            {verticals.map((v) => (
              <StaggerItem key={v.name}>
                <Link
                  href={v.href}
                  className="group flex h-full flex-col bg-white p-6 transition-colors hover:bg-neutral-50"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                      <v.icon size={18} strokeWidth={1.5} />
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                      {v.tag}
                    </span>
                  </div>
                  <h3 className="mb-2 text-base font-bold text-neutral-950">
                    {v.name}
                  </h3>
                  <p className="font-mono text-sm font-bold text-emerald-600">
                    {v.metric}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-neutral-400 transition-colors group-hover:text-emerald-600">
                    {t('verticals.explore')}
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ SECTION 13 — ESG (DARK) ═══════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 md:py-32">
        <GridPattern />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <SectionLabel>{t('esg.label')}</SectionLabel>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              {t('esg.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              {t('esg.subtitle')}
            </p>
          </FadeIn>
          <StaggerContainer
            staggerDelay={0.08}
            className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-800 sm:grid-cols-2 lg:grid-cols-4"
          >
            {esgCards.map((card) => (
              <StaggerItem key={card.title}>
                <div className="group h-full bg-neutral-900 p-8 transition-colors hover:bg-neutral-800">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                    <card.icon size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-white">
                    {card.title}
                  </h3>
                  <p className="mb-4 font-mono text-xl font-bold text-emerald-500">
                    {card.metric}
                  </p>
                  <span className="mb-4 block h-px w-8 bg-neutral-700" />
                  <p className="text-[13px] leading-[1.7] text-neutral-400">
                    {card.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ SECTION 14 — PARTNERS (LIGHT) ═══════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <SectionLabel light>{t('partnersSection.label')}</SectionLabel>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950 md:text-5xl">
              {t('partnersSection.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              {t('partnersSection.subtitle')}
            </p>
          </FadeIn>
          <StaggerContainer
            staggerDelay={0.05}
            className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 sm:grid-cols-3 lg:grid-cols-5"
          >
            {partners.map((p) => (
              <StaggerItem key={p.name}>
                <div className="flex h-full min-h-[140px] flex-col justify-between bg-white p-6 transition-colors hover:bg-neutral-50">
                  <div>
                    <p className="text-base font-bold text-neutral-950">
                      {p.name}
                    </p>
                  </div>
                  <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600">
                    {p.type}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ SECTION 15 — CORPORATE STRUCTURE (DARK) ═══════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 md:py-32">
        <GridPattern />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <SectionLabel>{t('structure.label')}</SectionLabel>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              {t('structure.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              {t('structure.subtitle')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mt-16 rounded-2xl border border-neutral-800 bg-neutral-900 p-8 md:p-12">
              {/* Holdco node */}
              <div className="flex flex-col items-center">
                <div className="rounded-xl border border-emerald-500 bg-emerald-500/10 px-8 py-4 text-center">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                    {t('structure.holdingLabel')}
                  </p>
                  <p className="text-xl font-bold text-white">{t('structure.holdingName')}</p>
                  <p className="font-mono text-[11px] text-neutral-400">
                    {t('structure.holdingDetail')}
                  </p>
                </div>
                {/* Connector line */}
                <div className="h-8 w-px bg-neutral-700" />
                <div className="h-px w-full max-w-3xl bg-neutral-700" />
                <div className="grid w-full max-w-3xl grid-cols-2 gap-px md:grid-cols-4">
                  {verticals.map((v) => (
                    <div key={v.name} className="relative">
                      <div className="absolute -top-8 left-1/2 h-8 w-px -translate-x-1/2 bg-neutral-700" />
                      <div className="m-1 rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-center">
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-500">
                          {v.tag}
                        </p>
                        <p className="mt-1 text-[12px] font-bold text-white">
                          {v.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-neutral-800 pt-8 md:grid-cols-4">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                    {t('structure.methodologyLabel')}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {t('structure.methodologyValue')}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                    {t('structure.disciplineLabel')}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {t('structure.disciplineValue')}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                    {t('structure.activationLabel')}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {t('structure.activationValue')}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                    {t('structure.horizonLabel')}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {t('structure.horizonValue')}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ SECTION 16 — CAREERS (LIGHT) ═══════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <FadeIn>
              <SectionLabel light>{t('careers.label')}</SectionLabel>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-950 md:text-5xl">
                {t('careers.title')}
              </h2>
              <p className="mt-6 max-w-lg text-[15px] leading-[1.7] text-neutral-500">
                {t('careers.subtitle')}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/careers"
                  className="inline-flex items-center gap-2.5 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-600"
                >
                  {t('careers.viewCareers')} <ArrowRight size={14} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2.5 border border-neutral-300 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-neutral-950 transition-colors hover:bg-neutral-100"
                >
                  {t('careers.expressInterest')} <ArrowRight size={14} />
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {careersStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-neutral-200 bg-neutral-50 p-6"
                  >
                    <stat.icon
                      size={18}
                      className="mb-3 text-emerald-600"
                      strokeWidth={1.5}
                    />
                    <p className="mb-1 font-mono text-2xl font-bold text-neutral-950">
                      {stat.value}
                    </p>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-[11px] text-neutral-400">
                      {stat.note}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 17 — INVESTOR RELATIONS (DARK) ═══════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 md:py-32">
        <GridPattern />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-emerald-500/[0.08] blur-3xl"
        />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <FadeIn direction="right">
              <SectionLabel>{t('investors.label')}</SectionLabel>
              <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                {t('investors.title')}
              </h2>
              <p className="mt-6 max-w-lg text-[15px] leading-[1.7] text-neutral-400">
                {t('investors.subtitle')}
              </p>
              <p className="mt-4 max-w-lg text-[15px] leading-[1.7] text-neutral-400">
                {t('investors.paragraph')}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/investors"
                  className="inline-flex items-center gap-2.5 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-600"
                >
                  {t('investors.ctaPrimary')} <ArrowRight size={14} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2.5 border border-neutral-800 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-neutral-900"
                >
                  {t('investors.ctaSecondary')} <ArrowRight size={14} />
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-800">
                {investorStats.map((s) => (
                  <div key={s.label} className="bg-neutral-900 p-6">
                    <p className="mb-1 font-mono text-3xl font-extrabold text-white">
                      {s.value}
                    </p>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                    {t('investors.statusLabel')}
                  </p>
                </div>
                <p className="text-[14px] leading-[1.7] text-neutral-400">
                  {t('investors.statusText')}
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 18 — FINAL CTA (DARK) ═══════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-28 md:py-36">
        <GridPattern />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.06] blur-3xl"
        />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 text-center md:px-12">
          <FadeIn>
            <div className="flex justify-center">
              <HarchHeroBadge>{t('heroBadge')}</HarchHeroBadge>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-8 font-mono text-xs font-bold uppercase tracking-[0.2em] text-emerald-500">
              {t('finalCta.label')}
            </p>
            <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-[64px]">
              {t('finalCta.title')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              {t('finalCta.subtitle')}
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-600"
              >
                {t('finalCta.primaryCta')} <ArrowRight size={14} />
              </Link>
              <Link
                href="/subsidiaries"
                className="inline-flex items-center gap-2.5 border border-neutral-800 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-neutral-900"
              >
                {t('finalCta.secondaryCta')} <ArrowRight size={14} />
              </Link>
              <Link
                href="/investors"
                className="inline-flex items-center gap-2.5 border border-neutral-800 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-neutral-900"
              >
                {t('finalCta.tertiaryCta')} <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="mt-16 flex items-center justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-white"
              >
                <ArrowLeft size={14} />
                {t('finalCta.backHome')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
