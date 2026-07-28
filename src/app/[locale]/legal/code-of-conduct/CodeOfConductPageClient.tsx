'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

export default function CodeOfConductPageClient() {
  const t = useTranslations('legal');

  const keyPolicies = t.raw('codeOfConduct.keyPolicies') as { policy: string; description: string }[];

  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('title')}</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">{t('codeOfConduct.title')}</h1>
            <div className="accent-line mb-8" />
            <p className="text-base md:text-lg text-[#999999] leading-relaxed max-w-2xl">{t('codeOfConduct.description')}</p>
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">{t('codeOfConduct.lastUpdated')}</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">{t('codeOfConduct.purposeAndScope')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('codeOfConduct.purposeAndScopeDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">{t('codeOfConduct.ourValuesInAction')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('codeOfConduct.ourValuesIntro')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('codeOfConduct.valueIntegrity')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('codeOfConduct.valueIntegrityDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('codeOfConduct.valueExcellence')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('codeOfConduct.valueExcellenceDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('codeOfConduct.valueRespect')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('codeOfConduct.valueRespectDescription')}</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">{t('codeOfConduct.valueAccountability')}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">{t('codeOfConduct.valueAccountabilityDescription')}</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">{t('codeOfConduct.ethicalFramework')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('codeOfConduct.ethicalFrameworkIntro')}
              </p>
              <div className="space-y-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">01</span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">{t('codeOfConduct.ethicalStep1Title')}</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.8]">{t('codeOfConduct.ethicalStep1Description')}</p>
                    </div>
                  </div>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">02</span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">{t('codeOfConduct.ethicalStep2Title')}</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.8]">{t('codeOfConduct.ethicalStep2Description')}</p>
                    </div>
                  </div>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">03</span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">{t('codeOfConduct.ethicalStep3Title')}</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.8]">{t('codeOfConduct.ethicalStep3Description')}</p>
                    </div>
                  </div>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">04</span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">{t('codeOfConduct.ethicalStep4Title')}</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.8]">{t('codeOfConduct.ethicalStep4Description')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">{t('codeOfConduct.keyPoliciesTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('codeOfConduct.keyPoliciesIntro')}
              </p>
              <div className="space-y-4">
                {keyPolicies.map((policy) => (
                  <div key={policy.policy} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <h3 className="text-[15px] font-semibold text-white mb-2">{policy.policy}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">{policy.description}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">{t('codeOfConduct.reportingConcerns')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                {t('codeOfConduct.reportingConcernsDescription')}
              </p>
              <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <p className="text-[14px] text-white font-medium mb-2">{t('codeOfConduct.ethicsHotline')}</p>
                <p className="text-[14px] text-[#999999]">{t('codeOfConduct.reportingEmailLabel')} <a href="mailto:legal@harchcorp.com" className="text-white hover:underline">legal@harchcorp.com</a></p>
                <p className="text-[14px] text-[#999999]">{t('codeOfConduct.reportingPhone')}</p>
                <p className="text-[14px] text-[#999999]">{t('codeOfConduct.reportingOnline')}</p>
                <p className="text-[14px] text-[#999999] mt-2">{t('codeOfConduct.reportingAlternative')}</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h2 className="text-lg font-bold text-white mb-3">{t('codeOfConduct.nonRetaliationTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('codeOfConduct.nonRetaliationDescription')}
              </p>
            </FadeIn>

            <FadeIn delay={0.35}>
              <h2 className="text-lg font-bold text-white mb-3">{t('codeOfConduct.waiversTitle')}</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                {t('codeOfConduct.waiversDescription')}
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">{t('codeOfConduct.footerNote')}</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
