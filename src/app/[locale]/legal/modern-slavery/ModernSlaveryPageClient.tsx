'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

export default function ModernSlaveryPageClient() {
  const t = useTranslations('legal');

  const riskAssessmentItems = t.raw('modernSlavery.riskAssessmentItems') as { label: string; description: string }[];
  const keyActions = t.raw('modernSlavery.keyActions') as string[];
  const nextSteps = t.raw('modernSlavery.nextSteps') as string[];
  const kpiTable = t.raw('modernSlavery.kpiTable') as { indicator: string; target: string; actual: string }[];

  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('title')}</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">{t('modernSlavery.title')}</h1>
            <div className="accent-line mb-8" />
            <p className="text-base md:text-lg text-[#999999] leading-relaxed max-w-2xl">{t('modernSlavery.description')}</p>
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">{t('modernSlavery.lastUpdated')}</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">{t('modernSlavery.ceoStatementTitle')}</h2>
              <div className="border-l-2 border-white pl-6">
                <p className="text-[14px] text-[#999999] leading-[1.8] italic mb-4">
                  {t('modernSlavery.ceoStatement1')}
                </p>
                <p className="text-[14px] text-[#999999] leading-[1.8] italic mb-4">
                  {t('modernSlavery.ceoStatement2')}
                </p>
                <p className="text-[14px] text-[#999999] leading-[1.8] italic">
                  {t('modernSlavery.ceoStatement3')}
                </p>
                <p className="text-[15px] text-white font-semibold mt-4">{t('modernSlavery.ceoName')}</p>
                <p className="text-[13px] text-[#666666]">{t('modernSlavery.ceoTitle')}</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">{t('modernSlavery.businessTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('modernSlavery.businessDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">{t('modernSlavery.policiesTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('modernSlavery.policiesIntro')}
              </p>
              <div className="space-y-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('modernSlavery.supplierCodeTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('modernSlavery.supplierCodeDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('modernSlavery.supplierDueDiligenceTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('modernSlavery.supplierDueDiligenceDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('modernSlavery.internalControlsTitle')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('modernSlavery.internalControlsDescription')}</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">{t('modernSlavery.riskAssessmentTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('modernSlavery.riskAssessmentIntro')}
              </p>
              <ul className="space-y-2">
                {riskAssessmentItems.map((item) => (
                  <li key={item.label} className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                    <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                    <span><span className="text-white font-medium">{item.label}</span> {item.description}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">{t('modernSlavery.keyActionsTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('modernSlavery.keyActionsIntro')}
              </p>
              <div className="space-y-4">
                {keyActions.map((action, i) => (
                  <div key={i} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <div className="flex items-start gap-4">
                      <span className="text-white font-bold text-[15px] shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <p className="text-[14px] text-[#999999] leading-[1.8]">{action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h2 className="text-lg font-bold text-white mb-3">{t('modernSlavery.trainingTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('modernSlavery.trainingDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.35}>
              <h2 className="text-lg font-bold text-white mb-3">{t('modernSlavery.effectivenessTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('modernSlavery.effectivenessIntro')}
              </p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('modernSlavery.kpiIndicator')}</th>
                      <th>{t('modernSlavery.kpiTarget')}</th>
                      <th>{t('modernSlavery.kpiActual')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpiTable.map((row) => (
                      <tr key={row.indicator}>
                        <td className="text-[13px]">{row.indicator}</td>
                        <td className="text-[13px] text-[#999999] font-normal">{row.target}</td>
                        <td className="text-[13px] font-normal">{row.actual}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <h2 className="text-lg font-bold text-white mb-3">{t('modernSlavery.nextStepsTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('modernSlavery.nextStepsIntro')}
              </p>
              <ul className="space-y-2">
                {nextSteps.map((step) => (
                  <li key={step} className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                    <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                    {step}
                  </li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn delay={0.45}>
              <h2 className="text-lg font-bold text-white mb-3">{t('modernSlavery.approvalTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('modernSlavery.approvalDescription')}
              </p>
              <div className="mt-6 border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <p className="text-[15px] text-white font-semibold">{t('modernSlavery.approvalName')}</p>
                <p className="text-[13px] text-[#999999]">{t('modernSlavery.approvalRole')}</p>
                <p className="text-[13px] text-[#999999]">{t('modernSlavery.approvalCompany')}</p>
                <p className="text-[13px] text-[#666666] mt-2">{t('modernSlavery.approvalDate')}</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.5}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">{t('modernSlavery.footerNote')}</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
