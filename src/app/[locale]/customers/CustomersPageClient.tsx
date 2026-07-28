'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  Shield,
  Zap,
  Sprout,
  Mountain,
  Droplets,
  Brain,
  Play,
  ChevronRight,
  Download,
  Users,
  Star,
  TrendingUp,
  Clock,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export default function CustomersPageClient() {
  const t = useTranslations('customers');
  const [activeFilter, setActiveFilter] = useState('All');

  const industries = [
    t('industries.all'),
    t('industries.finance'),
    t('industries.government'),
    t('industries.energy'),
    t('industries.agriculture'),
    t('industries.mining'),
    t('industries.water'),
    t('industries.industrial'),
  ];

  const caseStudies = [
    {
      organization: t('caseStudies.0.organization'),
      fullName: t('caseStudies.0.fullName'),
      useCase: t('caseStudies.0.useCase'),
      vertical: t('caseStudies.0.vertical'),
      sector: t('caseStudies.0.sector'),
      description: t('caseStudies.0.description'),
      metric: t('caseStudies.0.metric'),
      metricLabel: t('caseStudies.0.metricLabel'),
      icon: Shield,
      result: t('caseStudies.0.result'),
    },
    {
      organization: t('caseStudies.1.organization'),
      fullName: t('caseStudies.1.fullName'),
      useCase: t('caseStudies.1.useCase'),
      vertical: t('caseStudies.1.vertical'),
      sector: t('caseStudies.1.sector'),
      description: t('caseStudies.1.description'),
      metric: t('caseStudies.1.metric'),
      metricLabel: t('caseStudies.1.metricLabel'),
      icon: Zap,
      result: t('caseStudies.1.result'),
    },
    {
      organization: t('caseStudies.2.organization'),
      fullName: t('caseStudies.2.fullName'),
      useCase: t('caseStudies.2.useCase'),
      vertical: t('caseStudies.2.vertical'),
      sector: t('caseStudies.2.sector'),
      description: t('caseStudies.2.description'),
      metric: t('caseStudies.2.metric'),
      metricLabel: t('caseStudies.2.metricLabel'),
      icon: Sprout,
      result: t('caseStudies.2.result'),
    },
    {
      organization: t('caseStudies.3.organization'),
      fullName: t('caseStudies.3.fullName'),
      useCase: t('caseStudies.3.useCase'),
      vertical: t('caseStudies.3.vertical'),
      sector: t('caseStudies.3.sector'),
      description: t('caseStudies.3.description'),
      metric: t('caseStudies.3.metric'),
      metricLabel: t('caseStudies.3.metricLabel'),
      icon: Mountain,
      result: t('caseStudies.3.result'),
    },
    {
      organization: t('caseStudies.4.organization'),
      fullName: t('caseStudies.4.fullName'),
      useCase: t('caseStudies.4.useCase'),
      vertical: t('caseStudies.4.vertical'),
      sector: t('caseStudies.4.sector'),
      description: t('caseStudies.4.description'),
      metric: t('caseStudies.4.metric'),
      metricLabel: t('caseStudies.4.metricLabel'),
      icon: Droplets,
      result: t('caseStudies.4.result'),
    },
    {
      organization: t('caseStudies.5.organization'),
      fullName: t('caseStudies.5.fullName'),
      useCase: t('caseStudies.5.useCase'),
      vertical: t('caseStudies.5.vertical'),
      sector: t('caseStudies.5.sector'),
      description: t('caseStudies.5.description'),
      metric: t('caseStudies.5.metric'),
      metricLabel: t('caseStudies.5.metricLabel'),
      icon: Brain,
      result: t('caseStudies.5.result'),
    },
  ];

  const videoTestimonials = [
    {
      name: t('testimonials.0.name'),
      title: t('testimonials.0.title'),
      organization: t('testimonials.0.organization'),
      quote: t('testimonials.0.quote'),
    },
    {
      name: t('testimonials.1.name'),
      title: t('testimonials.1.title'),
      organization: t('testimonials.1.organization'),
      quote: t('testimonials.1.quote'),
    },
    {
      name: t('testimonials.2.name'),
      title: t('testimonials.2.title'),
      organization: t('testimonials.2.organization'),
      quote: t('testimonials.2.quote'),
    },
  ];

  const filteredStudies = activeFilter === industries[0]
    ? caseStudies
    : caseStudies.filter((cs) => cs.sector === activeFilter);

  return (
    <div className="bg-[#121212]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('heroLabel')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('heroTitle1')}<br />{t('heroTitle2')}
            </h1>
            <div className="accent-line mb-6" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('heroDescription')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ FEATURED STORY ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('featuredLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              {t('featuredTitle')}
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="card p-8 md:p-12">
              <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                      <Shield size={18} className="text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{t('featured.orgShort')}</p>
                      <p className="text-[12px] text-[#666666]">{t('featured.orgFull')}</p>
                    </div>
                  </div>
                  <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">
                    {t('featured.paragraph1')}
                  </p>
                  <p className="text-[15px] text-[#999999] leading-[1.7] mb-8">
                    {t('featured.paragraph2')}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[rgba(255,255,255,0.06)]">
                    <div>
                      <p className="stat-mono text-2xl md:text-3xl font-bold text-white mb-1">{t('featured.stat0Value')}</p>
                      <p className="text-[12px] text-[#666666]">{t('featured.stat0Label')}</p>
                    </div>
                    <div>
                      <p className="stat-mono text-2xl md:text-3xl font-bold text-white mb-1">{t('featured.stat1Value')}</p>
                      <p className="text-[12px] text-[#666666]">{t('featured.stat1Label')}</p>
                    </div>
                    <div>
                      <p className="stat-mono text-2xl md:text-3xl font-bold text-white mb-1">{t('featured.stat2Value')}</p>
                      <p className="text-[12px] text-[#666666]">{t('featured.stat2Label')}</p>
                    </div>
                    <div>
                      <p className="stat-mono text-2xl md:text-3xl font-bold text-white mb-1">{t('featured.stat3Value')}</p>
                      <p className="text-[12px] text-[#666666]">{t('featured.stat3Label')}</p>
                    </div>
                  </div>
                </div>
                <div className="lg:w-[400px] flex-shrink-0">
                  <div className="bg-[#0D0D0D] rounded-xl border border-[rgba(255,255,255,0.06)] p-6 h-full">
                    <p className="section-label mb-4">{t('featured.keyResultsLabel')}</p>
                    <div className="space-y-4">
                      {[
                        t('featured.keyResults.0'),
                        t('featured.keyResults.1'),
                        t('featured.keyResults.2'),
                        t('featured.keyResults.3'),
                        t('featured.keyResults.4'),
                        t('featured.keyResults.5'),
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <CheckCircle2 size={14} className="text-white/40 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                          <p className="text-[13px] text-[#999999] leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ INDUSTRY FILTER + CASE STUDIES ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('caseStudiesLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('caseStudiesTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-12">
              {t('caseStudiesDescription')}
            </p>
          </FadeIn>

          {/* Filter Tags */}
          <FadeIn delay={0.1}>
            <div className="flex flex-wrap gap-2 mb-12">
              {industries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => setActiveFilter(industry)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeFilter === industry
                      ? 'bg-white text-black'
                      : 'border border-[rgba(255,255,255,0.08)] text-[#999999] hover:border-[rgba(255,255,255,0.15)] hover:text-white'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </FadeIn>

          {/* Case Study Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudies.map((study, i) => (
              <FadeIn key={study.organization} delay={i * 0.08}>
                <div className="card p-6 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                      <study.icon size={18} className="text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-white">{study.organization}</p>
                      <p className="text-[11px] text-[#666666]">{study.fullName.length > 40 ? study.fullName.substring(0, 40) + '…' : study.fullName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="status-badge status-badge-active">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      {study.vertical}
                    </span>
                    <span className="status-badge status-badge-engineering">
                      {study.sector}
                    </span>
                  </div>

                  <h3 className="text-[17px] font-bold text-white mb-2">{study.useCase}</h3>
                  <p className="text-[13px] text-[#999999] leading-relaxed mb-6 flex-1">{study.description}</p>

                  <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="stat-mono text-2xl font-bold text-white">{study.metric}</p>
                        <p className="text-[11px] text-[#666666]">{study.metricLabel}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[12px] text-[#666666] hover:text-white transition-colors cursor-pointer">
                        <span>{t('readCaseStudy')}</span>
                        <ChevronRight size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CUSTOMER ADVISORY BOARD ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/2">
              <FadeIn>
                <p className="section-label mb-4">{t('advisoryBoard.coCreationLabel')}</p>
                <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
                  {t('advisoryBoard.title')}
                </h2>
                <div className="accent-line mb-6" />
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">
                  {t('advisoryBoard.description1')}
                </p>
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-8">
                  {t('advisoryBoard.description2')}
                </p>
                <Link
                  href="/customers/advisory-board"
                  className="inline-flex items-center gap-2 text-[14px] text-white font-medium hover:opacity-80 transition-opacity"
                >
                  {t('advisoryBoard.learnMore')}
                  <ArrowRight size={14} />
                </Link>
              </FadeIn>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              {[
                { icon: Star, label: t('advisoryBoard.benefits.0.label'), desc: t('advisoryBoard.benefits.0.desc') },
                { icon: TrendingUp, label: t('advisoryBoard.benefits.1.label'), desc: t('advisoryBoard.benefits.1.desc') },
                { icon: Users, label: t('advisoryBoard.benefits.2.label'), desc: t('advisoryBoard.benefits.2.desc') },
                { icon: BarChart3, label: t('advisoryBoard.benefits.3.label'), desc: t('advisoryBoard.benefits.3.desc') },
              ].map((item, i) => (
                <FadeIn key={item.label} delay={i * 0.1}>
                  <div className="card p-6 h-full">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
                      <item.icon size={18} className="text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[14px] font-bold text-white mb-1">{item.label}</h3>
                    <p className="text-[12px] text-[#666666] leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VIDEO TESTIMONIALS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('testimonialsLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('testimonialsTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('testimonialsDescription')}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videoTestimonials.map((testimonial, i) => (
              <FadeIn key={testimonial.name} delay={i * 0.1}>
                <div className="card overflow-hidden h-full flex flex-col">
                  {/* Video placeholder with play button */}
                  <div className="relative h-52 bg-[#0A0A0A] flex items-center justify-center border-b border-[rgba(255,255,255,0.06)]">
                    <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer group">
                      <Play size={24} className="text-white/60 group-hover:text-white/90 transition-colors ml-1" fill="currentColor" />
                    </div>
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                      <Clock size={10} className="text-white/30" />
                      <span className="text-[10px] text-white/30 stat-mono">3:42</span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-[14px] text-[#999999] leading-[1.7] mb-6 flex-1 italic">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
                      <p className="text-[14px] font-bold text-white">{testimonial.name}</p>
                      <p className="text-[12px] text-[#666666]">{testimonial.title}</p>
                      <p className="text-[12px] text-[#444444]">{testimonial.organization}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">
              {t('ctaTitle')}
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              {t('ctaDescription')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all"
              >
                {t('ctaButton1')} <ArrowRight size={14} />
              </Link>
              <button className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                <Download size={14} />
                {t('ctaButton2')}
              </button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
