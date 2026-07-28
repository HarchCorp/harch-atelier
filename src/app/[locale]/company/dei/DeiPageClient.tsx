'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Users,
  Heart,
  Scale,
  Globe,
  TrendingUp,
  Shield,
  BookOpen,
  Handshake,
  Award,
  FileText,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

export default function DeiPageClient() {
  const t = useTranslations('company');

  const deiStats = [
    { value: t('dei.stats.0.value'), label: t('dei.stats.0.label'), desc: t('dei.stats.0.desc') },
    { value: t('dei.stats.1.value'), label: t('dei.stats.1.label'), desc: t('dei.stats.1.desc') },
    { value: t('dei.stats.2.value'), label: t('dei.stats.2.label'), desc: t('dei.stats.2.desc') },
    { value: t('dei.stats.3.value'), label: t('dei.stats.3.label'), desc: t('dei.stats.3.desc') },
  ];

  const initiatives = [
    {
      icon: MapPin,
      title: t('dei.initiatives.0.title'),
      description: t('dei.initiatives.0.description'),
      metric: t('dei.initiatives.0.metric'),
      metricLabel: t('dei.initiatives.0.metricLabel'),
      color: 'rgba(139, 157, 175, 0.7)',
    },
    {
      icon: Sparkles,
      title: t('dei.initiatives.1.title'),
      description: t('dei.initiatives.1.description'),
      metric: t('dei.initiatives.1.metric'),
      metricLabel: t('dei.initiatives.1.metricLabel'),
      color: 'rgba(0, 255, 136, 0.7)',
    },
    {
      icon: Scale,
      title: t('dei.initiatives.2.title'),
      description: t('dei.initiatives.2.description'),
      metric: t('dei.initiatives.2.metric'),
      metricLabel: t('dei.initiatives.2.metricLabel'),
      color: 'rgba(255, 200, 0, 0.7)',
    },
    {
      icon: Heart,
      title: t('dei.initiatives.3.title'),
      description: t('dei.initiatives.3.description'),
      metric: t('dei.initiatives.3.metric'),
      metricLabel: t('dei.initiatives.3.metricLabel'),
      color: 'rgba(255, 100, 100, 0.7)',
    },
  ];

  const ergs = [
    {
      name: t('dei.ergs.0.name'),
      description: t('dei.ergs.0.description'),
      members: t('dei.ergs.0.members'),
    },
    {
      name: t('dei.ergs.1.name'),
      description: t('dei.ergs.1.description'),
      members: t('dei.ergs.1.members'),
    },
    {
      name: t('dei.ergs.2.name'),
      description: t('dei.ergs.2.description'),
      members: t('dei.ergs.2.members'),
    },
  ];

  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('dei.label')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('dei.heroTitle1')}<br />{t('dei.heroTitle2')}
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('dei.heroDescription')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <p className="section-label mb-4">{t('dei.commitmentLabel')}</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-8">
                {t('dei.commitmentTitle')}
              </h2>
              <p className="text-[16px] text-[#999999] leading-[1.8]">
                {t('dei.commitmentDescription')}
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* DEI by the Numbers */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('dei.numbersLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              {t('dei.numbersTitle')}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deiStats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08}>
                <div className="card p-8 h-full text-center">
                  <p className="text-5xl md:text-6xl font-bold text-white mb-2 stat-mono">{stat.value}</p>
                  <div className="accent-line mx-auto mb-4" />
                  <p className="text-[14px] font-semibold text-white mb-2">{stat.label}</p>
                  <p className="text-[13px] text-[#999999] leading-relaxed">{stat.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Key Initiatives */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('dei.initiativesLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('dei.initiativesTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('dei.initiativesDescription')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initiatives.map((initiative, i) => (
              <FadeIn key={initiative.title} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                      <initiative.icon size={18} style={{ color: initiative.color }} strokeWidth={1.5} />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white stat-mono">{initiative.metric}</p>
                      <p className="text-[10px] text-[#666666] uppercase tracking-wider">{initiative.metricLabel}</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{initiative.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{initiative.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Employee Resource Groups */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('dei.ergsLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('dei.ergsTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('dei.ergsDescription')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ergs.map((erg, i) => (
              <FadeIn key={erg.name} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{erg.name}</h3>
                    <span className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.04)] text-[11px] font-semibold text-[#999999] tracking-wide">
                      {erg.members} {t('dei.members')}
                    </span>
                  </div>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{erg.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency Report */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="section-label mb-4">{t('dei.transparencyLabel')}</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-6">
                {t('dei.transparencyTitle')}
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[16px] text-[#999999] leading-[1.7] mb-8">
                {t('dei.transparencyDescription')}
              </p>
              <div className="space-y-4">
                {[
                  t('dei.transparency.0'),
                  t('dei.transparency.1'),
                  t('dei.transparency.2'),
                  t('dei.transparency.3'),
                  t('dei.transparency.4'),
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <FileText size={16} className="text-white/30 mt-0.5 shrink-0" />
                    <p className="text-[14px] text-[#999999]">{item}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Award size={24} className="text-white" strokeWidth={1.5} />
                  <h3 className="text-lg font-bold text-white">{t('dei.commitmentsTitle')}</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: t('dei.commitments.0.label'), value: t('dei.commitments.0.value') },
                    { label: t('dei.commitments.1.label'), value: t('dei.commitments.1.value') },
                    { label: t('dei.commitments.2.label'), value: t('dei.commitments.2.value') },
                    { label: t('dei.commitments.3.label'), value: t('dei.commitments.3.value') },
                    { label: t('dei.commitments.4.label'), value: t('dei.commitments.4.value') },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                      <span className="text-[13px] text-[#999999]">{item.label}</span>
                      <span className="text-[14px] font-bold text-white stat-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">
              {t('dei.ctaTitle')}
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              {t('dei.ctaDescription')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/careers" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                {t('dei.ctaButton1')} <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('dei.ctaButton2')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
