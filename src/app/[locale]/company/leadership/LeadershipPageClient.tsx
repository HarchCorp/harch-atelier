'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Linkedin,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

export default function LeadershipPageClient() {
  const t = useTranslations('company');

  const executives = [
    {
      name: t('leadership.executives.0.name'),
      title: t('leadership.executives.0.title'),
      bio: t('leadership.executives.0.bio'),
      linkedin: '#', // LinkedIn not yet created — replace with real URL when available
    },
  ];

  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('leadership.label')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('leadership.heroTitle1')}<br />{t('leadership.heroTitle2')}
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('leadership.heroDescription')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Executive Team */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('leadership.execTeamLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              {t('leadership.execTeamTitle')}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {executives.map((exec, i) => (
              <FadeIn key={exec.name} delay={i * 0.06}>
                <div className="card p-8 h-full group">
                  <h3 className="text-xl font-bold text-white mb-1">{exec.name}</h3>
                  <p className="text-[12px] font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-4">{exec.title}</p>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-5">{exec.bio}</p>
                  {exec.linkedin !== '#' ? (
                    <a href={exec.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[12px] text-[#666666] hover:text-white transition-colors">
                      <Linkedin size={14} /> {t('leadership.linkedin')}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-[12px] text-[#666666]">
                      <Linkedin size={14} /> {t('leadership.linkedin')}
                    </span>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Team CTA */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">
              {t('leadership.ctaTitle')}
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              {t('leadership.ctaDescription')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/careers" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                {t('leadership.ctaButton1')} <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('leadership.ctaButton2')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
