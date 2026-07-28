'use client';

import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

export default function TrademarkPageClient() {
  const t = useTranslations('legal');

  const trademarks = t.raw('trademark.trademarks') as { mark: string; status: string; registration: string; description: string }[];
  const notAllowed = t.raw('trademark.notAllowedItems') as string[];
  const requestItems = t.raw('trademark.requestItems') as string[];

  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('title')}</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">{t('trademark.title')}</h1>
            <div className="accent-line mb-8" />
            <p className="text-base md:text-lg text-[#999999] leading-relaxed max-w-2xl">{t('trademark.description')}</p>
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">{t('trademark.lastUpdated')}</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">{t('trademark.trademarksTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('trademark.trademarksDescription')}
              </p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('trademark.tableMark')}</th>
                      <th>{t('trademark.tableStatus')}</th>
                      <th>{t('trademark.tableRegistration')}</th>
                      <th>{t('trademark.tableDescription')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trademarks.map((tm) => (
                      <tr key={tm.mark}>
                        <td className="text-[13px] font-semibold">{tm.mark}</td>
                        <td className="text-[13px] font-normal">
                          <span className={tm.status === t('trademark.statusRegistered') ? 'text-white' : 'text-[#999999]'}>{tm.status}</span>
                        </td>
                        <td className="text-[13px] text-[#999999] font-normal font-mono-tag">{tm.registration}</td>
                        <td className="text-[13px] text-[#999999] font-normal">{tm.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">{t('trademark.usageTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('trademark.usageDescription')}
              </p>
              <div className="space-y-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('trademark.usageSymbolTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('trademark.usageSymbolDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('trademark.usageAdjectiveTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('trademark.usageAdjectiveDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('trademark.usageDistinguishTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('trademark.usageDistinguishDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('trademark.usageOwnershipTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('trademark.usageOwnershipDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('trademark.usageAbbreviateTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('trademark.usageAbbreviateDescription')}</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">{t('trademark.logoTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('trademark.logoDescription')}
              </p>
              <div className="space-y-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('trademark.logoClearSpaceTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('trademark.logoClearSpaceDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('trademark.logoMinimumSizeTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('trademark.logoMinimumSizeDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('trademark.logoApprovedVersionsTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('trademark.logoApprovedVersionsDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('trademark.logoBackgroundTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('trademark.logoBackgroundDescription')}</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">{t('trademark.colorTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('trademark.colorDescription')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('trademark.colorPrimaryTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('trademark.colorPrimaryDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('trademark.colorTypographyTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('trademark.colorTypographyDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('trademark.colorAccentTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('trademark.colorAccentDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('trademark.colorProhibitedTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('trademark.colorProhibitedDescription')}</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">{t('trademark.notAllowedTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('trademark.notAllowedDescription')}
              </p>
              <ul className="space-y-2">
                {notAllowed.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                    <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h2 className="text-lg font-bold text-white mb-3">{t('trademark.requestTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('trademark.requestDescription')}
              </p>
              <ul className="space-y-2 mb-4">
                {requestItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                    <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <p className="text-[14px] text-white font-medium mb-2">{t('trademark.requestTeamTitle')}</p>
                <p className="text-[14px] text-[#999999]">{t('trademark.requestEmailLabel')} <a href="mailto:legal@harchcorp.com" className="text-white hover:underline">legal@harchcorp.com</a></p>
                <p className="text-[14px] text-[#999999]">{t('trademark.requestAddress')}</p>
                <p className="text-[14px] text-[#999999] mt-2">{t('trademark.requestResponseTime')}</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.35}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">{t('trademark.footerNote')}</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
