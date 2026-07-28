'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

export default function SlaPageClient() {
  const t = useTranslations('legal');

  const serviceCredits = t.raw('sla.serviceCredits') as { uptime: string; credit: string; description: string }[];
  const exclusions = t.raw('sla.exclusions') as string[];

  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('title')}</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">{t('sla.title')}</h1>
            <div className="accent-line mb-8" />
            <p className="text-base md:text-lg text-[#999999] leading-relaxed max-w-2xl">{t('sla.description')}</p>
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">{t('sla.lastUpdated')}</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">{t('sla.serviceAvailabilityTarget')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]" dangerouslySetInnerHTML={{ __html: t('sla.serviceAvailabilityDescription') }} />
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">{t('sla.measurementMethodology')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('sla.measurementMethodologyIntro')}
              </p>
              <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <div className="space-y-3">
                  <p className="text-[14px] text-[#999999] leading-[1.8]" dangerouslySetInnerHTML={{ __html: t('sla.measurementUptime') }} />
                  <p className="text-[14px] text-[#999999] leading-[1.8]" dangerouslySetInnerHTML={{ __html: t('sla.measurementDowntime') }} />
                  <p className="text-[14px] text-[#999999] leading-[1.8]" dangerouslySetInnerHTML={{ __html: t('sla.measurementMonitoring') }} />
                  <p className="text-[14px] text-[#999999] leading-[1.8]" dangerouslySetInnerHTML={{ __html: t('sla.measurementPeriod') }} />
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">{t('sla.scheduledMaintenance')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('sla.scheduledMaintenanceDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">{t('sla.serviceCreditsTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('sla.serviceCreditsIntro')}
              </p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('sla.tableHeaderUptime')}</th>
                      <th>{t('sla.tableHeaderCredit')}</th>
                      <th>{t('sla.tableHeaderType')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceCredits.map((row) => (
                      <tr key={row.uptime}>
                        <td className="text-[13px]">{row.uptime}</td>
                        <td className="text-[13px] font-semibold">{row.credit}</td>
                        <td className="text-[13px] text-[#999999] font-normal">{row.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[14px] text-[#999999] leading-[1.8] mt-4">
                {t('sla.serviceCreditsNote')}
              </p>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">{t('sla.exclusionsTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('sla.exclusionsIntro')}
              </p>
              <ul className="space-y-2">
                {exclusions.map((exclusion) => (
                  <li key={exclusion} className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                    <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                    {exclusion}
                  </li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h2 className="text-lg font-bold text-white mb-3">{t('sla.claimsProcessTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('sla.claimsProcessIntro')}
              </p>
              <div className="space-y-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">01</span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">{t('sla.claimsStep1Title')}</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.8]">{t('sla.claimsStep1Description')}</p>
                    </div>
                  </div>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">02</span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">{t('sla.claimsStep2Title')}</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.8]">{t('sla.claimsStep2Description')}</p>
                    </div>
                  </div>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">03</span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">{t('sla.claimsStep3Title')}</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.8]">{t('sla.claimsStep3Description')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.35}>
              <h2 className="text-lg font-bold text-white mb-3">{t('sla.contactTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('sla.contactIntro')}
              </p>
              <div className="mt-4 border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <p className="text-[14px] text-white font-medium mb-2">{t('sla.contactTeam')}</p>
                <p className="text-[14px] text-[#999999]">{t('sla.contactEmailLabel')} <a href="mailto:legal@harchcorp.com" className="text-white hover:underline">legal@harchcorp.com</a></p>
                <p className="text-[14px] text-[#999999]">{t('sla.contactStatusLabel')} status.harchcorp.com</p>
                <p className="text-[14px] text-[#999999]">{t('sla.contactAddress')}</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">{t('sla.footerNote')}</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
