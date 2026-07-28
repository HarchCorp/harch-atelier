'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

export default function GDPRPageClient() {
  const t = useTranslations('legal');

  const legalBases = t.raw('gdpr.legalBases') as { basis: string; description: string }[];
  const dataSubjectRights = t.raw('gdpr.dataSubjectRights') as { right: string; article: string; description: string }[];

  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('title')}</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">{t('gdpr.title')}</h1>
            <div className="accent-line mb-8" />
            <p className="text-base md:text-lg text-[#999999] leading-relaxed max-w-2xl">{t('gdpr.description')}</p>
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">{t('gdpr.lastUpdated')}</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">{t('gdpr.commitmentTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('gdpr.commitmentDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">{t('gdpr.legalBasisTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('gdpr.legalBasisIntro')}
              </p>
              <div className="space-y-4">
                {legalBases.map((basis, i) => (
                  <div key={basis.basis} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <h3 className="text-[15px] font-semibold text-white mb-2">{i + 1}. {basis.basis}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">{basis.description}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">{t('gdpr.dataSubjectRightsTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('gdpr.dataSubjectRightsIntro')}
              </p>
              <div className="space-y-4">
                {dataSubjectRights.map((right, i) => (
                  <div key={right.right} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-[15px] font-semibold text-white">{right.right}</h3>
                      <span className="text-[12px] text-[#666666] font-mono-tag shrink-0 ml-4">{right.article}</span>
                    </div>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">{right.description}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">{t('gdpr.dpaTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('gdpr.dpaDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">{t('gdpr.internationalTransfersTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('gdpr.internationalTransfersIntro')}
              </p>
              <div className="space-y-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('gdpr.sccTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('gdpr.sccDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('gdpr.adequacyTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('gdpr.adequacyDescription')}</p>
                </div>
              </div>
              <p className="text-[14px] text-[#999999] leading-[1.8] mt-4">
                {t('gdpr.internationalTransfersNote')}
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h2 className="text-lg font-bold text-white mb-3">{t('gdpr.dpoTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('gdpr.dpoDescription')}
              </p>
              <div className="mt-4 border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <p className="text-[14px] text-white font-medium mb-2">{t('gdpr.dpoContactLabel')}</p>
                <p className="text-[14px] text-[#999999]">{t('gdpr.dpoEmailLabel')} <a href="mailto:legal@harchcorp.com" className="text-white hover:underline">legal@harchcorp.com</a></p>
                <p className="text-[14px] text-[#999999]">{t('gdpr.dpoAddress')}</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.35}>
              <h2 className="text-lg font-bold text-white mb-3">{t('gdpr.supervisoryAuthorityTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('gdpr.supervisoryAuthorityDescription')}
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">{t('gdpr.footerNote')}</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
