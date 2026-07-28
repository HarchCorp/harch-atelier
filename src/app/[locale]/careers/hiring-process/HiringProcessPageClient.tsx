'use client';

import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  Phone,
  Code,
  Users,
  Crown,
  CheckCircle,
  Shield,
  Zap,
  Handshake,
  Lightbulb,
  Clock,
  Mail,
  Accessibility,
  BookOpen,
  Target,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

export default function HiringProcessPageClient() {
  const t = useTranslations('hiringProcess');

  const processSteps = [
    {
      key: 'application',
      step: '01',
      icon: FileText,
      title: t('steps.application.title'),
      description: t('steps.application.description'),
      timeline: t('steps.application.timeline'),
      detail: t('steps.application.detail'),
    },
    {
      key: 'initialScreen',
      step: '02',
      icon: Phone,
      title: t('steps.initialScreen.title'),
      description: t('steps.initialScreen.description'),
      timeline: t('steps.initialScreen.timeline'),
      detail: t('steps.initialScreen.detail'),
    },
    {
      key: 'technicalAssessment',
      step: '03',
      icon: Code,
      title: t('steps.technicalAssessment.title'),
      description: t('steps.technicalAssessment.description'),
      timeline: t('steps.technicalAssessment.timeline'),
      detail: t('steps.technicalAssessment.detail'),
    },
    {
      key: 'teamInterview',
      step: '04',
      icon: Users,
      title: t('steps.teamInterview.title'),
      description: t('steps.teamInterview.description'),
      timeline: t('steps.teamInterview.timeline'),
      detail: t('steps.teamInterview.detail'),
    },
    {
      key: 'leadershipInterview',
      step: '05',
      icon: Crown,
      title: t('steps.leadershipInterview.title'),
      description: t('steps.leadershipInterview.description'),
      timeline: t('steps.leadershipInterview.timeline'),
      detail: t('steps.leadershipInterview.detail'),
    },
    {
      key: 'offer',
      step: '06',
      icon: CheckCircle,
      title: t('steps.offer.title'),
      description: t('steps.offer.description'),
      timeline: t('steps.offer.timeline'),
      detail: t('steps.offer.detail'),
    },
  ];

  const traits = [
    {
      key: 'sovereigntyMindset',
      icon: Shield,
      title: t('traits.sovereigntyMindset.title'),
      description: t('traits.sovereigntyMindset.description'),
      color: 'rgba(139, 157, 175, 0.7)',
    },
    {
      key: 'technicalExcellence',
      icon: Target,
      title: t('traits.technicalExcellence.title'),
      description: t('traits.technicalExcellence.description'),
      color: 'rgba(0, 255, 136, 0.7)',
    },
    {
      key: 'biasForAction',
      icon: Zap,
      title: t('traits.biasForAction.title'),
      description: t('traits.biasForAction.description'),
      color: 'rgba(255, 200, 0, 0.7)',
    },
    {
      key: 'collaborativeSpirit',
      icon: Handshake,
      title: t('traits.collaborativeSpirit.title'),
      description: t('traits.collaborativeSpirit.description'),
      color: 'rgba(255, 100, 100, 0.7)',
    },
  ];

  const tips = [
    {
      key: 'understandThesis',
      number: '01',
      title: t('tips.understandThesis.title'),
      description: t('tips.understandThesis.description'),
    },
    {
      key: 'specificImpact',
      number: '02',
      title: t('tips.specificImpact.title'),
      description: t('tips.specificImpact.description'),
    },
    {
      key: 'showThinking',
      number: '03',
      title: t('tips.showThinking.title'),
      description: t('tips.showThinking.description'),
    },
    {
      key: 'askHardQuestions',
      number: '04',
      title: t('tips.askHardQuestions.title'),
      description: t('tips.askHardQuestions.description'),
    },
    {
      key: 'honestAboutGaps',
      number: '05',
      title: t('tips.honestAboutGaps.title'),
      description: t('tips.honestAboutGaps.description'),
    },
  ];

  const accommodationItems = [
    t('accommodations.item0'),
    t('accommodations.item1'),
    t('accommodations.item2'),
    t('accommodations.item3'),
    t('accommodations.item4'),
  ];

  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('heroLabel')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('heroTitleLine1')}<br />{t('heroTitleLine2')}
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('heroDescription')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex items-center gap-6 mt-8 text-[13px] text-[#666666]">
              <span className="flex items-center gap-2"><Clock size={14} /> {t('heroAverage')}</span>
              <span className="flex items-center gap-2"><Mail size={14} /> {t('heroResponse')}</span>
              <span className="flex items-center gap-2"><Eye size={14} /> {t('heroHumanReview')}</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Our Hiring Philosophy */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <p className="section-label mb-4">{t('philosophyLabel')}</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-8">
                {t('philosophyTitle')}
              </h2>
              <p className="text-[16px] text-[#999999] leading-[1.8]">
                {t('philosophyDescription')}
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('processLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('processTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('processDescription')}
            </p>
          </FadeIn>
          <div className="space-y-6">
            {processSteps.map((step, i) => (
              <FadeIn key={step.key} delay={i * 0.06}>
                <div className="card p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
                    <div className="flex items-start gap-4 md:min-w-[280px]">
                      <div className="w-12 h-12 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center shrink-0">
                        <step.icon size={20} className="text-white" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-[#666666] stat-mono uppercase tracking-wider">{t('stepLabel')} {step.step}</span>
                        <h3 className="text-xl font-bold text-white mt-0.5">{step.title}</h3>
                        <span className="text-[11px] text-[#666666] flex items-center gap-1 mt-1"><Clock size={10} /> {step.timeline}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] text-[#999999] leading-[1.7] mb-3">{step.description}</p>
                      <p className="text-[13px] text-[#666666] leading-[1.6] border-l-2 border-white/[0.06] pl-4">{step.detail}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* What We Look For */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('traitsLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('traitsTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('traitsDescription')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {traits.map((trait, i) => (
              <FadeIn key={trait.key} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-5">
                    <trait.icon size={18} style={{ color: trait.color }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{trait.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{trait.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Tips for Success */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('tipsLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('tipsTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('tipsDescription')}
            </p>
          </FadeIn>
          <div className="space-y-4">
            {tips.map((tip, i) => (
              <FadeIn key={tip.key} delay={i * 0.06}>
                <div className="vertical-row group flex flex-col md:flex-row md:items-start gap-4 py-6 px-4">
                  <span className="text-[36px] font-extrabold text-white/[0.06] leading-none stat-mono shrink-0">{tip.number}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{tip.title}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.7]">{tip.description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Accommodations */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="section-label mb-4">{t('accessibilityLabel')}</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-6">
                {t('accommodationsTitle')}
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[16px] text-[#999999] leading-[1.7] mb-8">
                {t('accommodationsDescription')}
              </p>
              <div className="space-y-5">
                {accommodationItems.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Accessibility size={16} className="text-white/30 mt-0.5 shrink-0" />
                    <p className="text-[14px] text-[#999999]">{item}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Mail size={24} className="text-white" strokeWidth={1.5} />
                  <h3 className="text-lg font-bold text-white">{t('requestAccommodation')}</h3>
                </div>
                <p className="text-[14px] text-[#999999] leading-[1.7] mb-6">
                  {t('accommodationCardDescription')}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <span className="text-[13px] text-[#999999]">{t('accommodationEmailLabel')}</span>
                    <a href="mailto:careers@harchcorp.com" className="text-[14px] font-semibold text-[rgba(139,157,175,0.7)] hover:text-[#8B9DAF] transition-colors">
                      careers@harchcorp.com
                    </a>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <span className="text-[13px] text-[#999999]">{t('accommodationResponseLabel')}</span>
                    <span className="text-[14px] font-bold text-white stat-mono">{t('accommodationResponseValue')}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <span className="text-[13px] text-[#999999]">{t('accommodationConfidentialityLabel')}</span>
                    <span className="text-[14px] font-bold text-white stat-mono">{t('accommodationConfidentialityValue')}</span>
                  </div>
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
              {t('ctaTitle')}
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              {t('ctaDescription')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/careers" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                {t('ctaPrimary')} <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('ctaSecondary')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
