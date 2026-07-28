'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

export default function DpaPageClient() {
  const t = useTranslations('legal');

  const keyProvisions = t.raw('dpa.keyProvisions') as { title: string; description: string }[];

  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('title')}</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">{t('dpa.title')}</h1>
            <div className="accent-line mb-8" />
            <p className="text-base md:text-lg text-[#999999] leading-relaxed max-w-2xl">{t('dpa.description')}</p>
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">{t('dpa.lastUpdated')}</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">{t('dpa.overviewTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('dpa.overviewDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">{t('dpa.keyProvisionsTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('dpa.keyProvisionsIntro')}
              </p>
              <div className="space-y-4">
                {keyProvisions.map((provision, i) => (
                  <div key={provision.title} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <h3 className="text-[15px] font-semibold text-white mb-2">{i + 1}. {provision.title}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">{provision.description}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">{t('dpa.downloadTitle')}</h2>
              <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-6 bg-[#1E1E1E]">
                <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                  {t('dpa.downloadDescription')}
                </p>
                <a
                  href="mailto:legal@harchcorp.com"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[13px] font-semibold rounded-md hover:bg-[#e0e0e0] transition-colors"
                >
                  {t('dpa.contactLegalTeam')}
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">{t('dpa.contactTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('dpa.contactDescription')}
              </p>
              <div className="mt-4 border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <p className="text-[14px] text-white font-medium mb-2">{t('dpa.contactDepartment')}</p>
                <p className="text-[14px] text-[#999999]">{t('dpa.contactEmailLabel')} <a href="mailto:legal@harchcorp.com" className="text-white hover:underline">legal@harchcorp.com</a></p>
                <p className="text-[14px] text-[#999999]">{t('dpa.contactAddress')}</p>
                <p className="text-[14px] text-[#999999]">{t('dpa.contactResponseTime')}</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.25}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">{t('dpa.footerNote')}</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
