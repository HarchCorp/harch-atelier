'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  Star,
  TrendingUp,
  Users,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Globe,
  Lightbulb,
  Handshake,
  Award,
  UserPlus,
  Building2,
  Sparkles,
  Target,
  MessageSquare,
} from 'lucide-react';

export default function AdvisoryBoardPageClient() {
  const t = useTranslations('customers');

  const howItWorks = [
    {
      step: '01',
      title: t('advisoryBoard.howItWorks.0.title'),
      description: t('advisoryBoard.howItWorks.0.description'),
      icon: UserPlus,
    },
    {
      step: '02',
      title: t('advisoryBoard.howItWorks.1.title'),
      description: t('advisoryBoard.howItWorks.1.description'),
      icon: Target,
    },
    {
      step: '03',
      title: t('advisoryBoard.howItWorks.2.title'),
      description: t('advisoryBoard.howItWorks.2.description'),
      icon: Handshake,
    },
    {
      step: '04',
      title: t('advisoryBoard.howItWorks.3.title'),
      description: t('advisoryBoard.howItWorks.3.description'),
      icon: Lightbulb,
    },
  ];

  const currentMembers = [
    {
      organization: t('advisoryBoard.members.0.organization'),
      fullName: t('advisoryBoard.members.0.fullName'),
      representative: t('advisoryBoard.members.0.representative'),
      title: t('advisoryBoard.members.0.title'),
      sector: t('advisoryBoard.members.0.sector'),
    },
    {
      organization: t('advisoryBoard.members.1.organization'),
      fullName: t('advisoryBoard.members.1.fullName'),
      representative: t('advisoryBoard.members.1.representative'),
      title: t('advisoryBoard.members.1.title'),
      sector: t('advisoryBoard.members.1.sector'),
    },
    {
      organization: t('advisoryBoard.members.2.organization'),
      fullName: t('advisoryBoard.members.2.fullName'),
      representative: t('advisoryBoard.members.2.representative'),
      title: t('advisoryBoard.members.2.title'),
      sector: t('advisoryBoard.members.2.sector'),
    },
    {
      organization: t('advisoryBoard.members.3.organization'),
      fullName: t('advisoryBoard.members.3.fullName'),
      representative: t('advisoryBoard.members.3.representative'),
      title: t('advisoryBoard.members.3.title'),
      sector: t('advisoryBoard.members.3.sector'),
    },
    {
      organization: t('advisoryBoard.members.4.organization'),
      fullName: t('advisoryBoard.members.4.fullName'),
      representative: t('advisoryBoard.members.4.representative'),
      title: t('advisoryBoard.members.4.title'),
      sector: t('advisoryBoard.members.4.sector'),
    },
    {
      organization: t('advisoryBoard.members.5.organization'),
      fullName: t('advisoryBoard.members.5.fullName'),
      representative: t('advisoryBoard.members.5.representative'),
      title: t('advisoryBoard.members.5.title'),
      sector: t('advisoryBoard.members.5.sector'),
    },
  ];

  const benefits = [
    {
      icon: Star,
      title: t('advisoryBoard.benefitsDetail.0.title'),
      description: t('advisoryBoard.benefitsDetail.0.description'),
      details: [
        t('advisoryBoard.benefitsDetail.0.details.0'),
        t('advisoryBoard.benefitsDetail.0.details.1'),
        t('advisoryBoard.benefitsDetail.0.details.2'),
        t('advisoryBoard.benefitsDetail.0.details.3'),
      ],
    },
    {
      icon: TrendingUp,
      title: t('advisoryBoard.benefitsDetail.1.title'),
      description: t('advisoryBoard.benefitsDetail.1.description'),
      details: [
        t('advisoryBoard.benefitsDetail.1.details.0'),
        t('advisoryBoard.benefitsDetail.1.details.1'),
        t('advisoryBoard.benefitsDetail.1.details.2'),
        t('advisoryBoard.benefitsDetail.1.details.3'),
      ],
    },
    {
      icon: Users,
      title: t('advisoryBoard.benefitsDetail.2.title'),
      description: t('advisoryBoard.benefitsDetail.2.description'),
      details: [
        t('advisoryBoard.benefitsDetail.2.details.0'),
        t('advisoryBoard.benefitsDetail.2.details.1'),
        t('advisoryBoard.benefitsDetail.2.details.2'),
        t('advisoryBoard.benefitsDetail.2.details.3'),
      ],
    },
    {
      icon: BarChart3,
      title: t('advisoryBoard.benefitsDetail.3.title'),
      description: t('advisoryBoard.benefitsDetail.3.description'),
      details: [
        t('advisoryBoard.benefitsDetail.3.details.0'),
        t('advisoryBoard.benefitsDetail.3.details.1'),
        t('advisoryBoard.benefitsDetail.3.details.2'),
        t('advisoryBoard.benefitsDetail.3.details.3'),
      ],
    },
  ];

  return (
    <div className="bg-[#121212]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-center gap-2 mb-4">
              <Link href="/customers" className="text-[12px] text-[#666666] hover:text-white transition-colors">{t('heroLabel')}</Link>
              <ChevronRight size={12} className="text-[#444444]" />
              <span className="text-[12px] text-white">{t('advisoryBoard.title')}</span>
            </div>
            <p className="section-label mb-4">{t('advisoryBoard.coCreationLabel')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('advisoryBoard.heroTitle1')}<br />{t('advisoryBoard.heroTitle2')}
            </h1>
            <div className="accent-line mb-6" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('advisoryBoard.heroDescription')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/2">
              <FadeIn>
                <p className="section-label mb-4">{t('advisoryBoard.aboutLabel')}</p>
                <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
                  {t('advisoryBoard.aboutTitle')}
                </h2>
                <div className="accent-line mb-6" />
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">
                  {t('advisoryBoard.aboutDescription1')}
                </p>
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">
                  {t('advisoryBoard.aboutDescription2')}
                </p>
                <p className="text-[15px] text-[#999999] leading-[1.7]">
                  {t('advisoryBoard.aboutDescription3')}
                </p>
              </FadeIn>
            </div>
            <div className="lg:w-1/2">
              <FadeIn delay={0.1}>
                <div className="card p-8">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { value: t('advisoryBoard.aboutStats.0.value'), label: t('advisoryBoard.aboutStats.0.label') },
                      { value: t('advisoryBoard.aboutStats.1.value'), label: t('advisoryBoard.aboutStats.1.label') },
                      { value: t('advisoryBoard.aboutStats.2.value'), label: t('advisoryBoard.aboutStats.2.label') },
                      { value: t('advisoryBoard.aboutStats.3.value'), label: t('advisoryBoard.aboutStats.3.label') },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-4 bg-[rgba(255,255,255,0.03)] rounded-xl">
                        <p className="stat-mono text-3xl font-bold text-white mb-1">{stat.value}</p>
                        <p className="text-[11px] text-[#666666]">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('advisoryBoard.processLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('advisoryBoard.processTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('advisoryBoard.processDescription')}
            </p>
          </FadeIn>

          <div className="space-y-4">
            {howItWorks.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.08}>
                <div className="card p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center border border-[rgba(255,255,255,0.06)]">
                        <span className="text-[11px] font-bold text-white/30 stat-mono">{step.step}</span>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                        <step.icon size={18} className="text-white" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[17px] font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.7]">{step.description}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CURRENT MEMBERS ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('advisoryBoard.membersLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('advisoryBoard.membersTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('advisoryBoard.membersDescription')}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMembers.map((member, i) => (
              <FadeIn key={member.organization} delay={i * 0.06}>
                <div className="card p-6 h-full">
                  <div className="flex items-center gap-4 mb-4">
                    {/* Logo placeholder */}
                    <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center border border-[rgba(255,255,255,0.08)]">
                      <Building2 size={20} className="text-white/40" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-white truncate">{member.organization}</p>
                      <p className="text-[11px] text-[#666666] truncate">{member.fullName}</p>
                    </div>
                  </div>
                  <div className="pb-4 border-b border-[rgba(255,255,255,0.04)] mb-4">
                    <span className="status-badge status-badge-engineering">
                      {member.sector}
                    </span>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white">{member.representative}</p>
                    <p className="text-[12px] text-[#666666]">{member.title}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('advisoryBoard.benefitsLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('advisoryBoard.benefitsTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('advisoryBoard.benefitsDescription')}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, i) => (
              <FadeIn key={benefit.title} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                      <benefit.icon size={18} className="text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[18px] font-bold text-white">{benefit.title}</h3>
                  </div>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-6">{benefit.description}</p>
                  <div className="space-y-2 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                    {benefit.details.map((detail) => (
                      <div key={detail} className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-white/25 flex-shrink-0" strokeWidth={1.5} />
                        <span className="text-[12px] text-[#666666]">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MEETING CADENCE ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('advisoryBoard.cadenceLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              {t('advisoryBoard.cadenceTitle')}
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn delay={0.05}>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Calendar size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[18px] font-bold text-white">{t('advisoryBoard.cadence.0.title')}</h3>
                </div>
                <p className="text-[14px] text-[#999999] leading-[1.7] mb-6">
                  {t('advisoryBoard.cadence.0.description')}
                </p>
                <div className="space-y-2 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                  {[
                    t('advisoryBoard.cadence.0.items.0'),
                    t('advisoryBoard.cadence.0.items.1'),
                    t('advisoryBoard.cadence.0.items.2'),
                    t('advisoryBoard.cadence.0.items.3'),
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-white/25 flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-[12px] text-[#666666]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Globe size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[18px] font-bold text-white">{t('advisoryBoard.cadence.1.title')}</h3>
                </div>
                <p className="text-[14px] text-[#999999] leading-[1.7] mb-6">
                  {t('advisoryBoard.cadence.1.description')}
                </p>
                <div className="space-y-2 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                  {[
                    t('advisoryBoard.cadence.1.items.0'),
                    t('advisoryBoard.cadence.1.items.1'),
                    t('advisoryBoard.cadence.1.items.2'),
                    t('advisoryBoard.cadence.1.items.3'),
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-white/25 flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-[12px] text-[#666666]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ APPLY ═══ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden border-t border-[rgba(255,255,255,0.06)]">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <FadeIn>
                <p className="section-label mb-4">{t('advisoryBoard.applyLabel')}</p>
                <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">
                  {t('advisoryBoard.applyTitle')}
                </h2>
                <p className="text-[15px] text-white/30 leading-[1.7] mb-8">
                  {t('advisoryBoard.applyDescription')}
                </p>
              </FadeIn>
            </div>
            <div className="lg:w-1/2 w-full">
              <FadeIn delay={0.15}>
                <div className="card p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">{t('advisoryBoard.form.fullName')}</label>
                      <input
                        type="text"
                        placeholder={t('advisoryBoard.form.fullNamePlaceholder')}
                        className="w-full bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[#444444] focus:border-white/20 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">{t('advisoryBoard.form.organization')}</label>
                      <input
                        type="text"
                        placeholder={t('advisoryBoard.form.organizationPlaceholder')}
                        className="w-full bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[#444444] focus:border-white/20 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">{t('advisoryBoard.form.titleRole')}</label>
                      <input
                        type="text"
                        placeholder={t('advisoryBoard.form.titleRolePlaceholder')}
                        className="w-full bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[#444444] focus:border-white/20 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">{t('advisoryBoard.form.whyJoin')}</label>
                      <textarea
                        placeholder={t('advisoryBoard.form.whyJoinPlaceholder')}
                        rows={4}
                        className="w-full bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[#444444] focus:border-white/20 focus:outline-none transition-colors resize-none"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-3.5 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all">
                        {t('advisoryBoard.form.submit')} <ArrowRight size={14} />
                      </button>
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center gap-2 border border-white/12 text-white px-8 py-3.5 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all"
                      >
                        <MessageSquare size={14} />
                        {t('advisoryBoard.form.talkToUs')}
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
