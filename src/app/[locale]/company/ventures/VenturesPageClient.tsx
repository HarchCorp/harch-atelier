'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Cpu,
  Zap,
  Leaf,
  Droplets,
  Mountain,
  Building2,
  Globe,
  TrendingUp,
  Handshake,
  Shield,
  CheckCircle,
  DollarSign,
  MapPin,
  Target,
  Lightbulb,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

export default function VenturesPageClient() {
  const t = useTranslations('company');

  const thesisAreas = [
    {
      icon: Cpu,
      title: t('ventures.thesis.0.title'),
      description: t('ventures.thesis.0.description'),
      color: 'rgba(139, 157, 175, 0.7)',
    },
    {
      icon: Zap,
      title: t('ventures.thesis.1.title'),
      description: t('ventures.thesis.1.description'),
      color: 'rgba(0, 255, 136, 0.7)',
    },
    {
      icon: Leaf,
      title: t('ventures.thesis.2.title'),
      description: t('ventures.thesis.2.description'),
      color: 'rgba(255, 200, 0, 0.7)',
    },
    {
      icon: Droplets,
      title: t('ventures.thesis.3.title'),
      description: t('ventures.thesis.3.description'),
      color: 'rgba(100, 180, 255, 0.7)',
    },
    {
      icon: Mountain,
      title: t('ventures.thesis.4.title'),
      description: t('ventures.thesis.4.description'),
      color: 'rgba(255, 160, 60, 0.7)',
    },
  ];

  const portfolioCompanies = [
    {
      name: t('ventures.portfolio.0.name'),
      description: t('ventures.portfolio.0.description'),
      stage: t('ventures.portfolio.0.stage'),
      sector: t('ventures.portfolio.0.sector'),
      location: t('ventures.portfolio.0.location'),
      investment: t('ventures.portfolio.0.investment'),
    },
    {
      name: t('ventures.portfolio.1.name'),
      description: t('ventures.portfolio.1.description'),
      stage: t('ventures.portfolio.1.stage'),
      sector: t('ventures.portfolio.1.sector'),
      location: t('ventures.portfolio.1.location'),
      investment: t('ventures.portfolio.1.investment'),
    },
    {
      name: t('ventures.portfolio.2.name'),
      description: t('ventures.portfolio.2.description'),
      stage: t('ventures.portfolio.2.stage'),
      sector: t('ventures.portfolio.2.sector'),
      location: t('ventures.portfolio.2.location'),
      investment: t('ventures.portfolio.2.investment'),
    },
    {
      name: t('ventures.portfolio.3.name'),
      description: t('ventures.portfolio.3.description'),
      stage: t('ventures.portfolio.3.stage'),
      sector: t('ventures.portfolio.3.sector'),
      location: t('ventures.portfolio.3.location'),
      investment: t('ventures.portfolio.3.investment'),
    },
  ];

  const investmentCriteria = [
    {
      icon: Target,
      title: t('ventures.criteria.0.title'),
      description: t('ventures.criteria.0.description'),
    },
    {
      icon: Lightbulb,
      title: t('ventures.criteria.1.title'),
      description: t('ventures.criteria.1.description'),
    },
    {
      icon: TrendingUp,
      title: t('ventures.criteria.2.title'),
      description: t('ventures.criteria.2.description'),
    },
    {
      icon: Users,
      title: t('ventures.criteria.3.title'),
      description: t('ventures.criteria.3.description'),
    },
  ];

  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('ventures.label')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('ventures.heroTitle1')}<br />{t('ventures.heroTitle2')}
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('ventures.heroDescription')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-start gap-4 mt-8">
              <Link href="#apply" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                {t('ventures.heroButton1')} <ArrowRight size={14} />
              </Link>
              <Link href="#portfolio" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('ventures.heroButton2')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Investment Thesis */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('ventures.thesisLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('ventures.thesisTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('ventures.thesisDescription')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {thesisAreas.map((area, i) => (
              <FadeIn key={area.title} delay={i * 0.06}>
                <div className="card p-8 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-5">
                    <area.icon size={18} style={{ color: area.color }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{area.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{area.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Companies */}
      <section id="portfolio" className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('ventures.portfolioLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('ventures.portfolioTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('ventures.portfolioDescription')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolioCompanies.map((company, i) => (
              <FadeIn key={company.name} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                        <Building2 size={20} className="text-white" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{company.name}</h3>
                        <div className="flex items-center gap-2 text-[11px] text-[#666666]">
                          <MapPin size={10} /> {company.location}
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-md bg-[rgba(255,255,255,0.04)] text-[10px] font-semibold text-[#999999] tracking-wide">
                      {company.stage}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-5">{company.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-[12px]">
                    <span className="text-[#666666]">{company.sector}</span>
                    <span className="text-[#666666] stat-mono">{t('ventures.invested')} {company.investment}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Criteria */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('ventures.criteriaLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('ventures.criteriaTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('ventures.criteriaDescription')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {investmentCriteria.map((criterion, i) => (
              <FadeIn key={criterion.title} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-5">
                    <criterion.icon size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{criterion.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{criterion.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="section-label mb-4">{t('ventures.approachLabel')}</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-6">
                {t('ventures.approachTitle1')}<br />{t('ventures.approachTitle2')}
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[16px] text-[#999999] leading-[1.7] mb-8">
                {t('ventures.approachDescription')}
              </p>
              <div className="space-y-5">
                {[
                  { title: t('ventures.approach.0.title'), desc: t('ventures.approach.0.desc') },
                  { title: t('ventures.approach.1.title'), desc: t('ventures.approach.1.desc') },
                  { title: t('ventures.approach.2.title'), desc: t('ventures.approach.2.desc') },
                  { title: t('ventures.approach.3.title'), desc: t('ventures.approach.3.desc') },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-white/50 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[14px] font-semibold text-white">{item.title}</p>
                      <p className="text-[13px] text-[#999999] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card p-8">
                <h3 className="text-lg font-bold text-white mb-6">{t('ventures.detailsTitle')}</h3>
                <div className="space-y-4">
                  {[
                    { label: t('ventures.details.0.label'), value: t('ventures.details.0.value') },
                    { label: t('ventures.details.1.label'), value: t('ventures.details.1.value') },
                    { label: t('ventures.details.2.label'), value: t('ventures.details.2.value') },
                    { label: t('ventures.details.3.label'), value: t('ventures.details.3.value') },
                    { label: t('ventures.details.4.label'), value: t('ventures.details.4.value') },
                    { label: t('ventures.details.5.label'), value: t('ventures.details.5.value') },
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

      {/* Apply for Funding CTA */}
      <section id="apply" className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">
              {t('ventures.ctaTitle')}
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              {t('ventures.ctaDescription')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                {t('ventures.ctaButton1')} <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('ventures.ctaButton2')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
