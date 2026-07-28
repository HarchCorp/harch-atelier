'use client';

import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

export default function LegalPageClient() {
  const t = useTranslations('legal');

  const legalContent = t.raw('legal.sections') as { title: string; text: string }[];

  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('title')}</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">{t('legal.pageTitle')}</h1>
            <div className="accent-line mb-8" />
            <p className="text-base md:text-lg text-[#999999] leading-relaxed max-w-2xl">{t('description')}</p>
          </FadeIn>
          <div className="space-y-10">
            {legalContent.map((section, i) => (
              <FadeIn key={section.title} delay={i * 0.05}>
                <h2 className="text-lg font-bold text-white mb-3">{section.title}</h2>
                <p className="text-[14px] text-[#999999] leading-[1.8]">{section.text}</p>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">{t('legal.lastUpdated')}</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
