'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

export default function CookiesPageClient() {
  const t = useTranslations('legal');

  const cookieTypes = t.raw('cookies.cookieTypes') as { category: string; description: string; examples: string; duration: string }[];
  const cookieTable = t.raw('cookies.cookieTable') as { name: string; purpose: string; category: string; duration: string }[];

  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('title')}</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">{t('cookies.title')}</h1>
            <div className="accent-line mb-8" />
            <p className="text-base md:text-lg text-[#999999] leading-relaxed max-w-2xl">{t('cookies.description')}</p>
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">{t('cookies.lastUpdated')}</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">{t('cookies.whatAreCookiesTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('cookies.whatAreCookiesDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">{t('cookies.howWeUseTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-6">
                {t('cookies.howWeUseIntro')}
              </p>
              <div className="space-y-6">
                {cookieTypes.map((cookie, i) => (
                  <div key={cookie.category} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <h3 className="text-[15px] font-semibold text-white mb-2">{cookie.category}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.8] mb-3">{cookie.description}</p>
                    <p className="text-[13px] text-[#666666]"><span className="text-white font-medium">{t('cookies.examplesLabel')}</span> {cookie.examples}</p>
                    <p className="text-[13px] text-[#666666] mt-1"><span className="text-white font-medium">{t('cookies.durationLabel')}</span> {cookie.duration}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">{t('cookies.thirdPartyTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('cookies.thirdPartyDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">{t('cookies.managingTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('cookies.managingDescription1')}
              </p>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('cookies.managingDescription2')}
              </p>
              <ul className="list-disc list-inside text-[14px] text-[#999999] leading-[2] ml-2">
                {(t.raw('cookies.browserInstructions') as string[]).map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">{t('cookies.tableTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('cookies.tableIntro')}
              </p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('cookies.tableHeaderName')}</th>
                      <th>{t('cookies.tableHeaderPurpose')}</th>
                      <th>{t('cookies.tableHeaderCategory')}</th>
                      <th>{t('cookies.tableHeaderDuration')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cookieTable.map((cookie) => (
                      <tr key={cookie.name}>
                        <td className="font-mono text-[13px]">{cookie.name}</td>
                        <td className="text-[13px] text-[#999999] font-normal">{cookie.purpose}</td>
                        <td className="text-[13px] font-normal">{cookie.category}</td>
                        <td className="text-[13px] text-[#999999] font-normal">{cookie.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h2 className="text-lg font-bold text-white mb-3">{t('cookies.updatesTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('cookies.updatesDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.35}>
              <h2 className="text-lg font-bold text-white mb-3">{t('cookies.contactTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('cookies.contactDescription')}
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">{t('cookies.footerNote')}</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
