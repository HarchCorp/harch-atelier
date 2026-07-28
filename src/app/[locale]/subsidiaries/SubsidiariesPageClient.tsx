'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/ui/motion';

/* ═══════════════════════════════════════════════════════════════
   PALANTIR "PLATFORMS" STYLE — Subsidiaries Listing
   Like Palantir's Platforms page (Foundry / Gotham / Apollo):
   - Dark background
   - Large "Subsidiaries" title
   - List of subsidiaries: name + tagline + "Explore →"
   - Thin dividers between items
   - Section indicators (01, 02, etc.)
   ═══════════════════════════════════════════════════════════════ */

export default function SubsidiariesPageClient() {
  const t = useTranslations('subsidiaries');

  const subsidiaries = [
    {
      num: '/01',
      name: t('intelligence.name'),
      slug: 'intelligence',
      tagline: t('intelligence.tagline'),
      desc: t('intelligence.desc'),
      stat: t('intelligence.stat'),
    },
    {
      num: '/02',
      name: t('cement.name'),
      slug: 'cement',
      tagline: t('cement.tagline'),
      desc: t('cement.desc'),
      stat: t('cement.stat'),
    },
    {
      num: '/03',
      name: t('energy.name'),
      slug: 'energy',
      tagline: t('energy.tagline'),
      desc: t('energy.desc'),
      stat: t('energy.stat'),
    },
    {
      num: '/04',
      name: t('technology.name'),
      slug: 'technology',
      tagline: t('technology.tagline'),
      desc: t('technology.desc'),
      stat: t('technology.stat'),
    },
    {
      num: '/05',
      name: t('mining.name'),
      slug: 'mining',
      tagline: t('mining.tagline'),
      desc: t('mining.desc'),
      stat: t('mining.stat'),
    },
    {
      num: '/06',
      name: t('agriculture.name'),
      slug: 'agriculture',
      tagline: t('agriculture.tagline'),
      desc: t('agriculture.desc'),
      stat: t('agriculture.stat'),
    },
    {
      num: '/07',
      name: t('water.name'),
      slug: 'water',
      tagline: t('water.tagline'),
      desc: t('water.desc'),
      stat: t('water.stat'),
    },
    {
      num: '/08',
      name: t('finance.name'),
      slug: 'finance',
      tagline: t('finance.tagline'),
      desc: t('finance.desc'),
      stat: t('finance.stat'),
    },
  ];

  return (
    <div className="bg-[#0A0A0A] min-h-screen">

      {/* ═══════════════ HEADER / TITLE ═══════════════ */}
      <section className="pt-24 md:pt-32 pb-8 md:pb-12 bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/50 mb-6">
              {t('operatingVerticalsLabel')}
            </p>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-white tracking-[-0.03em] leading-[1.05]">
              {t('pageTitle')}
            </h1>
            <p className="text-[clamp(1rem,2vw,1.25rem)] text-white/50 mt-6 max-w-2xl leading-relaxed">
              {t('heroSubtitle')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ SUBSIDIARY LIST ═══════════════
          Like Palantir's Platforms page:
          Each subsidiary is a row with name + tagline + "Explore →"
          Separated by thin white dividers
      */}
      <section className="bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          {/* Top border */}
          <div className="border-t border-white/5" />

          {subsidiaries.map((sub, i) => (
            <motion.div
              key={sub.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <Link
                href={`/subsidiaries/${sub.slug}`}
                className="group block border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-300"
              >
                <div className="py-10 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">
                  {/* Left: Number + Name */}
                  <div className="flex items-start md:items-center gap-4 md:gap-6">
                    <span className="text-[11px] font-medium text-white/20 font-mono tracking-tight pt-1 md:pt-0 shrink-0">
                      {sub.num}
                    </span>
                    <div>
                      <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-white/90 tracking-[-0.01em] group-hover:text-white transition-colors">
                        {sub.name}
                      </h2>
                      <p className="text-[14px] md:text-[15px] text-white/40 mt-1 leading-relaxed max-w-md">
                        {sub.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Right: Explore link */}
                  <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-10 md:ml-0">
                    <span className="text-[14px] font-medium text-white/30 group-hover:text-white/70 transition-colors">
                      {t('explorePlatform')}
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════ STATEMENT SECTION ═══════════════
          Like Palantir's centered statement on dark background
      */}
      <section className="py-24 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <p className="text-[clamp(1.75rem,4vw,3rem)] font-semibold text-white/90 leading-[1.2] tracking-[-0.02em]">
              {t('statement')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ FEATURE LIST ═══════════════
          Like Palantir's numbered features with /0.x indicators
      */}
      <section className="py-24 md:py-32 bg-[#0A0A0A] border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/50 mb-16">
              {t('operatorPrinciplesLabel')}
            </p>
          </FadeIn>

          <div className="space-y-0">
            {[
              { label: t('principles.sovereignByDesign.title'), description: t('principles.sovereignByDesign.description') },
              { label: t('principles.verticalIntegration.title'), description: t('principles.verticalIntegration.description') },
              { label: t('principles.speedAtScale.title'), description: t('principles.speedAtScale.description') },
              { label: t('principles.worldClassStandards.title'), description: t('principles.worldClassStandards.description') },
            ].map((f, i) => (
              <FadeIn key={f.label} delay={i * 0.08}>
                <div className="group flex items-start justify-between py-8 md:py-10 border-b border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex-1 pr-8">
                    <h3 className="text-[clamp(1.25rem,2.5vw,2rem)] font-bold text-white/90 tracking-[-0.01em] mb-2">
                      {f.label}
                    </h3>
                    <p className="text-[15px] text-white/50 leading-relaxed max-w-xl">
                      {f.description}
                    </p>
                  </div>
                  <span className="text-[12px] font-medium text-white/20 font-mono tracking-tight pt-2 shrink-0">
                    /0.{i + 1}
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="py-24 md:py-32 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/contact"
                className="group flex items-center justify-between p-8 md:p-12 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/5"
              >
                <div>
                  <p className="text-[clamp(1.25rem,2vw,1.75rem)] font-bold text-white tracking-[-0.01em] mb-2">
                    {t('cta.requestBriefing')}
                  </p>
                  <p className="text-[14px] text-white/40">
                    {t('cta.requestBriefingDesc')}
                  </p>
                </div>
                <ArrowUpRight size={24} className="text-white/20 group-hover:text-white/60 transition-colors shrink-0 ml-4" />
              </Link>

              <Link
                href="/subsidiaries/intelligence"
                className="group flex items-center justify-between p-8 md:p-12 bg-[#0A0A0A] rounded-lg hover:bg-[#0D0D0D] transition-all duration-300"
              >
                <div>
                  <p className="text-[clamp(1.25rem,2vw,1.75rem)] font-bold text-white tracking-[-0.01em] mb-2">
                    {t('cta.explorePlatform')}
                  </p>
                  <p className="text-[14px] text-white/40">
                    {t('cta.explorePlatformDesc')}
                  </p>
                </div>
                <ArrowUpRight size={24} className="text-white/20 group-hover:text-white/60 transition-colors shrink-0 ml-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section indicator */}
      <div className="py-6 bg-[#0A0A0A] border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <p className="text-[11px] font-medium text-white/20 font-mono">
            02 {t('operatingVerticalsLabel')}
          </p>
        </div>
      </div>
    </div>
  );
}
