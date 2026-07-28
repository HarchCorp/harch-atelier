'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  FadeIn,
  CountUp,
} from '@/components/ui/motion';
import { VideoPlayer } from '@/components/VideoPlayer';

/* ═══════════════════════════════════════════════════════════════
   HARCH CORP — HOMEPAGE (POLISHED)
   Sections:
   1. HERO — Full-screen drone video + centered headline
   2. VERTICALS SHOWCASE — Tags row + big image (click to switch)
   3. TEXT — Dark bg, centered statement
   4. FEATURE LIST — Numbered items with /0.x indicators
   5. SPLIT — Image LEFT + text RIGHT
   6. NUMBERS — Four big stats
   7. STAT VIDEO GRID — 4 key stats in 40s each
   8. VIDEO BREAK — Infrastructure footage
   9. ACTIVE PHASE — Harch Research (Building in Public)
   10. CTA — Two doors side by side
   ═══════════════════════════════════════════════════════════════ */

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function HomePageClient() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const prefersReducedMotion = useReducedMotion();

  const [activeVertical, setActiveVertical] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  // Parallax — spring-smoothed for cinematic feel
  const rawScale = useTransform(scrollYProgress, [0, 1], [1, 1.10]);
  const heroScale = useSpring(rawScale, { stiffness: 120, damping: 30, mass: 0.4 });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const heroContentY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  /* ─── Verticals data ─── */
  const verticals = [
    { num: '/01', name: t('verticals.intelligence.name'), tagline: t('verticals.intelligence.tagline'), stat: t('verticals.intelligence.stat'), headline: t('verticals.intelligence.headline'), description: t('verticals.intelligence.description'), href: '/subsidiaries/intelligence', image: '/images/sections/intelligence-rack.jpg', accent: '#8B9DAF' },
    { num: '/02', name: t('verticals.cement.name'), tagline: t('verticals.cement.tagline'), stat: t('verticals.cement.stat'), headline: t('verticals.cement.headline'), description: t('verticals.cement.description'), href: '/subsidiaries/cement', image: '/images/sections/cement-kiln.jpg', accent: '#A08878' },
    { num: '/03', name: t('verticals.energy.name'), tagline: t('verticals.energy.tagline'), stat: t('verticals.energy.stat'), headline: t('verticals.energy.headline'), description: t('verticals.energy.description'), href: '/subsidiaries/energy', image: '/images/sections/energy-solar-farm.jpg', accent: '#6B9F6B' },
    { num: '/04', name: t('verticals.technology.name'), tagline: t('verticals.technology.tagline'), stat: t('verticals.technology.stat'), headline: t('verticals.technology.headline'), description: t('verticals.technology.description'), href: '/subsidiaries/technology', image: '/images/sections/tech-ground-station.jpg', accent: '#7888A8' },
    { num: '/05', name: t('verticals.mining.name'), tagline: t('verticals.mining.tagline'), stat: t('verticals.mining.stat'), headline: t('verticals.mining.headline'), description: t('verticals.mining.description'), href: '/subsidiaries/mining', image: '/images/sections/mining-smelter.jpg', accent: '#A87878' },
    { num: '/06', name: t('verticals.agriculture.name'), tagline: t('verticals.agriculture.tagline'), stat: t('verticals.agriculture.stat'), headline: t('verticals.agriculture.headline'), description: t('verticals.agriculture.description'), href: '/subsidiaries/agriculture', image: '/images/sections/agri-vertical-farm.jpg', accent: '#6BAF6B' },
    { num: '/07', name: t('verticals.water.name'), tagline: t('verticals.water.tagline'), stat: t('verticals.water.stat'), headline: t('verticals.water.headline'), description: t('verticals.water.description'), href: '/subsidiaries/water', image: '/images/sections/water-treatment.jpg', accent: '#6888A8' },
    { num: '/08', name: t('verticals.finance.name'), tagline: t('verticals.finance.tagline'), stat: t('verticals.finance.stat'), headline: t('verticals.finance.headline'), description: t('verticals.finance.description'), href: '/subsidiaries/finance', image: '/images/sections/finance-trading.jpg', accent: '#8B9DAF' },
    { num: '/09', name: t('verticals.atelier.name'), tagline: t('verticals.atelier.tagline'), stat: t('verticals.atelier.stat'), headline: t('verticals.atelier.headline'), description: t('verticals.atelier.description'), href: '/subsidiaries/atelier', image: '/images/company/innovation-lab.jpg', accent: '#787878' },
  ];

  /* ─── Feature items for the numbered list ─── */
  const features = [
    { label: t('operatorPrinciples.sovereignByDesign.title'), description: t('operatorPrinciples.sovereignByDesign.description') },
    { label: t('operatorPrinciples.verticalIntegration.title'), description: t('operatorPrinciples.verticalIntegration.description') },
    { label: t('operatorPrinciples.speedAtScale.title'), description: t('operatorPrinciples.speedAtScale.description') },
    { label: t('operatorPrinciples.worldClassStandards.title'), description: t('operatorPrinciples.worldClassStandards.description') },
  ];

  /* ─── Stable focus ring class for keyboard users ─── */
  const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

  /* ─── Scroll indicator: hide after the user starts scrolling ─── */
  const [showScrollCue, setShowScrollCue] = useState(true);
  useEffect(() => {
    const onScroll = () => setShowScrollCue(window.scrollY < 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onSelectVertical = useCallback((i: number) => setActiveVertical(i), []);

  return (
    <div className="bg-[#0A0A0A] antialiased">

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1 — HERO: Full-screen drone video + centered headline
          ═══════════════════════════════════════════════════════════ */}
      <motion.section
        ref={heroRef}
        style={{ opacity: prefersReducedMotion ? 1 : heroOpacity }}
        className="relative h-[100dvh] min-h-[560px] w-full overflow-hidden bg-black"
        aria-label={t('heroTitle')}
      >
        {/* Video background — poster shows instantly, preload="auto" prioritizes the first frames */}
        <motion.div
          style={{ scale: prefersReducedMotion ? 1 : heroScale }}
          className="absolute inset-0 will-change-transform"
        >
          <video
            key="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/sections/overview-casablanca.jpg"
            className="h-full w-full object-cover"
            aria-hidden="true"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Cinematic gradient overlays — top + bottom for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-black/55" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

        {/* Hero content — centered like Palantir */}
        <motion.div
          style={{ y: prefersReducedMotion ? 0 : heroContentY }}
          className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col items-center justify-center px-6 text-center md:px-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.15 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/70">
              {t('heroBadge')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE_OUT_EXPO, delay: 0.3 }}
            className="max-w-4xl text-[clamp(2.25rem,7vw,6rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white"
          >
            {t('heroTitle')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.5 }}
            className="mt-6 max-w-2xl text-[clamp(1rem,2vw,1.35rem)] font-normal leading-relaxed text-white/65"
          >
            {t('heroSubtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.7 }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              href="/subsidiaries/intelligence"
              className={`group inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 text-[14px] font-semibold text-black transition-colors duration-200 hover:bg-white/90 active:scale-[0.98] sm:w-auto ${focusRing}`}
            >
              {t('ctaPrimary')}
              <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/contact"
              className={`group inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/30 bg-transparent px-6 py-3.5 text-[14px] font-semibold text-white backdrop-blur-sm transition-colors duration-200 hover:border-white/60 hover:bg-white/[0.06] active:scale-[0.98] sm:w-auto ${focusRing}`}
            >
              {t('ctaSecondary')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll cue — fades after the user starts scrolling */}
        <AnimatePresence>
          {showScrollCue && !prefersReducedMotion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 md:bottom-8"
              aria-hidden="true"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/40">
                  {t('scroll')}
                </span>
                <div className="relative h-9 w-[1px] overflow-hidden bg-white/15">
                  <motion.div
                    className="absolute left-0 top-0 h-3 w-[1px] bg-white/70"
                    animate={{ y: [-12, 36] }}
                    transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2 — VERTICALS SHOWCASE: Tags + Big Image
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#0D0D0D]" aria-labelledby="verticals-heading">
        <span id="verticals-heading" className="sr-only">{t('sectionLabels.verticals')}</span>
        {/* Tags row — horizontally scrollable on mobile, wraps on desktop */}
        <div className="mx-auto max-w-[1400px] px-6 pb-6 pt-16 md:px-12 md:pt-20">
          <div className="-mx-6 flex items-center gap-2 overflow-x-auto px-6 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {verticals.map((v, i) => {
              const isActive = i === activeVertical;
              return (
                <button
                  key={v.num}
                  type="button"
                  onClick={() => onSelectVertical(i)}
                  aria-pressed={isActive}
                  aria-label={`${v.num} ${v.name}`}
                  className={`relative shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-300 ${focusRing} ${
                    isActive ? 'text-black' : 'text-white/50 hover:bg-white/10 hover:text-white/85'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-vertical-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-white"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="mr-1.5 font-mono text-[10px] opacity-50">{v.num}</span>
                  {v.name}
                </button>
              );
            })}
            <Link
              href="/subsidiaries/intelligence"
              className={`ml-auto hidden shrink-0 items-center gap-1 px-4 py-2 text-[13px] font-medium text-white/30 transition-colors hover:text-white/60 md:inline-flex ${focusRing}`}
            >
              {t('sectionLabels.verticals')}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Big image with overlay text */}
        <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden md:h-[75vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeVertical}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.0 }}
              transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
              className="absolute inset-0 will-change-transform"
            >
              <Image
                src={verticals[activeVertical].image}
                alt={verticals[activeVertical].name}
                fill
                className="object-cover"
                sizes="100vw"
                priority={activeVertical === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Gradient overlay for text */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          {/* Vertical accent bar — top-left subtle mark */}
          <div className="pointer-events-none absolute left-6 top-6 z-10 flex items-center gap-2 md:left-12 md:top-12">
            <span
              className="h-[2px] w-8"
              style={{ background: verticals[activeVertical].accent }}
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
              {verticals[activeVertical].num}
            </span>
          </div>

          {/* Overlay text — bottom-left */}
          <div className="absolute bottom-0 left-0 right-0 z-10 mx-auto max-w-[1400px] px-6 pb-12 md:px-12 md:pb-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeVertical}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              >
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                  {verticals[activeVertical].tagline}
                </span>
                <Link
                  href={verticals[activeVertical].href}
                  className={`group inline-flex max-w-full items-center gap-3 ${focusRing}`}
                  aria-label={verticals[activeVertical].headline}
                >
                  <span className="text-[clamp(1.6rem,4vw,3.5rem)] font-bold leading-tight tracking-[-0.02em] text-white transition-colors group-hover:text-white">
                    {verticals[activeVertical].headline}
                  </span>
                  <ArrowUpRight
                    size={28}
                    className="shrink-0 text-white/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                  />
                </Link>
                <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-white/60">
                  {verticals[activeVertical].stat} — {verticals[activeVertical].description.split('—')[0].trim()}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3 — TEXT: Dark bg, centered statement
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#0A0A0A] py-24 md:py-36" aria-label={t('statement')}>
        <div className="mx-auto max-w-[900px] px-6 text-center md:px-12">
          <FadeIn>
            <p className="text-[clamp(1.6rem,4vw,3rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-white/90">
              {t('statement')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4 — FEATURE LIST: Numbered items with /0.x
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-white/5 bg-[#0A0A0A] py-24 md:py-32" aria-labelledby="principles-heading">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <p id="principles-heading" className="section-label mb-16">
              {t('sectionLabels.principles')}
            </p>
          </FadeIn>

          <div className="space-y-0">
            {features.map((f, i) => (
              <FadeIn key={f.label} delay={i * 0.08}>
                <div className="group flex items-start justify-between border-b border-white/5 py-8 transition-colors duration-300 hover:border-white/15 md:py-10">
                  <div className="flex-1 pr-8">
                    <h3 className="mb-2 text-[clamp(1.2rem,2.5vw,2rem)] font-bold tracking-[-0.01em] text-white/90 transition-colors group-hover:text-white">
                      {f.label}
                    </h3>
                    <p className="max-w-xl text-[15px] leading-relaxed text-white/50">
                      {f.description}
                    </p>
                  </div>
                  <span className="shrink-0 pt-2 font-mono text-[12px] font-medium tracking-tight text-white/20 transition-colors group-hover:text-white/40">
                    /0.{i + 1}
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5 — SPLIT: Image LEFT + text RIGHT
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#0A0A0A]" aria-label={t('splitImageAlt')}>
        <div className="mx-auto max-w-[1400px]">
          <div className="grid min-h-[60vh] grid-cols-1 md:grid-cols-2">
            {/* Image LEFT */}
            <div className="relative h-[50vh] overflow-hidden md:h-auto">
              <Image
                src="/images/sections/energy-wind-farm.jpg"
                alt={t('splitImageAlt')}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
            </div>

            {/* Text RIGHT */}
            <div className="flex flex-col justify-center bg-[#0D0D0D] px-8 py-16 md:px-16 md:py-20 lg:px-20">
              <FadeIn>
                <blockquote className="mb-6 text-[clamp(1.4rem,3vw,2.5rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-white/90">
                  {t('ceoQuote.text')}
                </blockquote>
                <div className="mb-8">
                  <p className="text-[14px] font-semibold text-white/80">{t('ceoQuote.author')}</p>
                  <p className="text-[13px] text-white/40">{t('ceoQuote.title')}</p>
                </div>
                <Link
                  href="/about"
                  className={`group inline-flex items-center gap-2 text-[14px] font-semibold text-white/70 transition-colors hover:text-white ${focusRing}`}
                >
                  {tCommon('learnMore')}
                  <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6 — NUMBERS: Four big stats (Space Mono)
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-white/5 bg-[#0A0A0A] py-24 md:py-32" aria-labelledby="numbers-heading">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <p id="numbers-heading" className="section-label mb-16">
              {t('sectionLabels.inNumbers')}
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 gap-x-8 gap-y-16 md:grid-cols-4 md:gap-x-8 md:gap-y-20">
            {[
              { value: 2400, prefix: '$', suffix: 'M+', label: t('stats.investmentPipeline.label') },
              { value: 47, prefix: '~', suffix: '', label: t('stats.carbonIntensity.label') },
              { value: 82.3, prefix: '', suffix: '%', label: t('stats.renewableEnergy.label'), decimals: 1 },
              { value: 24700, prefix: '', suffix: '+', label: t('stats.employment2030.label') },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08}>
                <p className="stat-mono mb-3 text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-none tracking-[-0.03em] text-white">
                  <CountUp to={stat.value} prefix={stat.prefix} suffix={stat.suffix} duration={2.4} decimals={stat.decimals ?? 0} />
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                  {stat.label}
                </p>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <div className="mt-16 flex max-w-3xl flex-col items-start gap-6 rounded-lg border border-white/[0.06] bg-[#0D0D0D] p-6 md:flex-row md:items-center md:p-8">
              <div className="h-36 w-full shrink-0 md:w-64">
                <VideoPlayer
                  src="/videos/v23_2_4B.mp4"
                  variant="modal-trigger"
                  label={t('videoBrief.label')}
                  className="h-full w-full"
                />
              </div>
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF]">{t('videoBrief.title')}</p>
                <p className="text-[15px] leading-relaxed text-white/80">
                  {t('videoBrief.description')}
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ STAT VIDEO GRID — 4 key stats in 40s each ═══ */}
      <section className="border-t border-white/[0.04] bg-[#0D0D0D] py-20" aria-labelledby="stat-video-grid-heading">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <p id="stat-video-grid-heading" className="section-label mb-4">{t('statVideoGrid.title')}</p>
            <h2 className="mb-4 text-[clamp(1.5rem,3vw,2.5rem)] font-bold tracking-tight text-white">
              {t('statVideoGrid.heading')}
            </h2>
            <div className="accent-line mb-12" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <VideoPlayer src="/videos/v19_122mrd.mp4" variant="modal-trigger" label={t('statVideoGrid.videos.v122mrd')} className="aspect-video w-full" />
              <VideoPlayer src="/videos/v20_89carbon.mp4" variant="modal-trigger" label={t('statVideoGrid.videos.v89carbon')} className="aspect-video w-full" />
              <VideoPlayer src="/videos/v21_8ms.mp4" variant="modal-trigger" label={t('statVideoGrid.videos.v8ms')} className="aspect-video w-full" />
              <VideoPlayer src="/videos/v22_3200jobs.mp4" variant="modal-trigger" label={t('statVideoGrid.videos.v3200jobs')} className="aspect-video w-full" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 7 — VIDEO BREAK: Infrastructure footage
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-[50vh] min-h-[360px] w-full overflow-hidden bg-black md:h-[70vh]" aria-label={t('sectionLabels.eightVerticals')}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/sections/overview-port.jpg"
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        >
          <source src="/videos/infrastructure.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 z-10 mx-auto max-w-[1400px] px-6 pb-12 md:px-12 md:pb-16">
          <FadeIn>
            <p className="max-w-xl text-[clamp(1.4rem,3.5vw,2.5rem)] font-bold leading-tight tracking-[-0.02em] text-white/90">
              {t('sectionLabels.eightVerticals')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 7.5 — ACTIVE PHASE: Harch Research (Building in Public)
          ═══════════════════════════════════════════════════════════ */}
      <section className="border-t border-white/[0.04] bg-[#0D0D0D] py-20 md:py-28" aria-labelledby="research-heading">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <div className="mb-6 flex items-center gap-3">
              <span className="rounded bg-[#4A7B5F] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                {t('research.badge')}
              </span>
              <span className="font-mono text-[12px] text-[#8B9DAF]">{t('research.phaseLabel')}</span>
              <span className="pulse-dot" style={{ background: '#4A7B5F', color: '#4A7B5F' }} />
            </div>
            <h2 id="research-heading" className="mb-4 text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-white">
              {t('research.title')}
            </h2>
            <p className="mb-10 max-w-2xl text-[15px] leading-relaxed text-white/50">
              {t('research.description')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="fine-card rounded-md p-6">
                <p className="data-label mb-2">{t('research.stats.published.label')}</p>
                <p className="stat-mono text-3xl font-bold text-white">{t('research.stats.published.value')}</p>
                <p className="mt-1 text-[12px] text-white/40">{t('research.stats.published.detail')}</p>
              </div>
              <div className="fine-card rounded-md p-6">
                <p className="data-label mb-2">{t('research.stats.pipeline.label')}</p>
                <p className="stat-mono text-3xl font-bold text-white">{t('research.stats.pipeline.value')}</p>
                <p className="mt-1 text-[12px] text-white/40">{t('research.stats.pipeline.detail')}</p>
              </div>
              <div className="fine-card rounded-md p-6">
                <p className="data-label mb-2">{t('research.stats.vision.label')}</p>
                <p className="stat-mono text-3xl font-bold text-white">{t('research.stats.vision.value')}</p>
                <p className="mt-1 text-[12px] text-white/40">{t('research.stats.vision.detail')}</p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/research"
                className={`inline-flex items-center gap-2 rounded-md bg-[#8B9DAF] px-5 py-2.5 text-[13px] font-bold text-[#0D0D0D] transition-colors hover:bg-white active:scale-[0.98] ${focusRing}`}
              >
                {t('research.browseDossiers')}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/launch"
                className={`inline-flex items-center gap-2 rounded-md border border-white/[0.12] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:border-white/25 hover:bg-white/[0.04] active:scale-[0.98] ${focusRing}`}
              >
                {t('research.watchLaunchFilm')}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 8 — CTA: Two doors side by side
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#0D0D0D] py-24 md:py-32" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12">
          <FadeIn>
            <p id="cta-heading" className="section-label mb-10">{t('sectionLabels.cta')}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Link
                href="/contact"
                className={`group relative flex items-center justify-between overflow-hidden rounded-lg border border-white/5 bg-white/5 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.08] active:translate-y-0 md:p-12 ${focusRing}`}
              >
                <div className="relative z-10">
                  <p className="mb-2 text-[clamp(1.25rem,2vw,1.75rem)] font-bold tracking-[-0.01em] text-white">
                    {t('cta.requestBriefing')}
                  </p>
                  <p className="text-[14px] text-white/40">
                    {t('cta.requestBriefingDesc')}
                  </p>
                </div>
                <ArrowUpRight
                  size={24}
                  className="relative z-10 ml-4 shrink-0 text-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/70"
                />
                {/* Subtle gradient sheen on hover */}
                <span
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                  aria-hidden="true"
                />
              </Link>

              <Link
                href="/subsidiaries/intelligence"
                className={`group relative flex items-center justify-between overflow-hidden rounded-lg border border-white/5 bg-[#0A0A0A] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-[#101010] active:translate-y-0 md:p-12 ${focusRing}`}
              >
                <div className="relative z-10">
                  <p className="mb-2 text-[clamp(1.25rem,2vw,1.75rem)] font-bold tracking-[-0.01em] text-white">
                    {t('cta.explorePlatform')}
                  </p>
                  <p className="text-[14px] text-white/40">
                    {t('cta.explorePlatformDesc')}
                  </p>
                </div>
                <ArrowUpRight
                  size={24}
                  className="relative z-10 ml-4 shrink-0 text-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/70"
                />
                <span
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
