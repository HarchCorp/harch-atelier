'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

export default function AccessibilityPageClient() {
  const t = useTranslations('legal');

  const accessibilityFeatures = t.raw('accessibility.features') as { feature: string; description: string }[];
  const knownLimitations = t.raw('accessibility.limitations') as { limitation: string; description: string }[];

  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('title')}</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">{t('accessibility.title')}</h1>
            <div className="accent-line mb-8" />
            <p className="text-base md:text-lg text-[#999999] leading-relaxed max-w-2xl">{t('accessibility.description')}</p>
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">{t('accessibility.lastUpdated')}</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">{t('accessibility.commitmentTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('accessibility.commitmentDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">{t('accessibility.standardsTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]" dangerouslySetInnerHTML={{ __html: t('accessibility.standardsDescription') }} />
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">{t('accessibility.featuresTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('accessibility.featuresIntro')}
              </p>
              <div className="space-y-4">
                {accessibilityFeatures.map((feature) => (
                  <div key={feature.feature} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <h3 className="text-[15px] font-semibold text-white mb-2">{feature.feature}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">{feature.description}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">{t('accessibility.limitationsTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('accessibility.limitationsIntro')}
              </p>
              <div className="space-y-4">
                {knownLimitations.map((item) => (
                  <div key={item.limitation} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <h3 className="text-[15px] font-semibold text-white mb-2">{item.limitation}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">{item.description}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">{t('accessibility.feedbackTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('accessibility.feedbackDescription')}
              </p>
              <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <p className="text-[14px] text-white font-medium mb-2">{t('accessibility.contactTeam')}</p>
                <p className="text-[14px] text-[#999999]">{t('accessibility.contactEmailLabel')} <a href="mailto:legal@harchcorp.com" className="text-white hover:underline">legal@harchcorp.com</a></p>
                <p className="text-[14px] text-[#999999]">{t('accessibility.contactPhone')}</p>
                <p className="text-[14px] text-[#999999]">{t('accessibility.contactAddress')}</p>
                <p className="text-[14px] text-[#999999] mt-2">{t('accessibility.contactResponseTime')}</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.3}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">{t('accessibility.footerNote')}</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
