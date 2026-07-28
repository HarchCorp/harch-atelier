'use client';

import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

export default function CCPAPageClient() {
  const t = useTranslations('legal');

  const categories = t.raw('ccpa.categories') as { category: string; examples: string; collected: string }[];
  const ccpaRights = t.raw('ccpa.rights') as { right: string; description: string }[];

  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('title')}</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">{t('ccpa.title')}</h1>
            <div className="accent-line mb-8" />
            <p className="text-base md:text-lg text-[#999999] leading-relaxed max-w-2xl">{t('ccpa.description')}</p>
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">{t('ccpa.lastUpdated')}</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">{t('ccpa.rightsTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('ccpa.rightsDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">{t('ccpa.categoriesTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('ccpa.categoriesDescription')}
              </p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('ccpa.tableCategory')}</th>
                      <th>{t('ccpa.tableExamples')}</th>
                      <th>{t('ccpa.tableCollected')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.category}>
                        <td className="text-[13px]">{cat.category}</td>
                        <td className="text-[13px] text-[#999999] font-normal">{cat.examples}</td>
                        <td className="text-[13px] font-normal">{cat.collected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">{t('ccpa.howWeUseTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('ccpa.howWeUseDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">{t('ccpa.yourRightsTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('ccpa.yourRightsDescription')}
              </p>
              <div className="space-y-4">
                {ccpaRights.map((item) => (
                  <div key={item.right} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <h3 className="text-[15px] font-semibold text-white mb-2">{item.right}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">{item.description}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">{t('ccpa.exerciseTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('ccpa.exerciseDescription1')}
              </p>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('ccpa.exerciseDescription2')}
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h2 className="text-lg font-bold text-white mb-3">{t('ccpa.disclosureTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('ccpa.disclosureDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.35}>
              <h2 className="text-lg font-bold text-white mb-3">{t('ccpa.doNotSellTitle')}</h2>
              <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-6 bg-[#1E1E1E]">
                <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                  {t('ccpa.doNotSellDescription1')}
                </p>
                <p className="text-[14px] text-[#999999] leading-[1.8]">
                  {t('ccpa.doNotSellDescription2')}
                </p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">{t('ccpa.footerNote')}</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
