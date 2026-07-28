'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, FileText, Shield, Cookie, Globe, Scale, Server, Eye, BookOpen, HandHeart, Tag, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FileText, Shield, Cookie, Globe, Scale, Server, Eye, BookOpen, HandHeart, Tag, AlertCircle,
};

export default function LegalHubPageClient() {
  const t = useTranslations('legal');

  const legalPages = t.raw('hub.legalPages') as { title: string; description: string; href: string; icon: string; updated: string }[];

  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('title')}</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">{t('hub.title')}</h1>
            <div className="accent-line mb-8" />
            <p className="text-base md:text-lg text-[#999999] leading-relaxed max-w-2xl mb-12">
              {t('hub.subtitle')}
            </p>
          </FadeIn>

          <div className="space-y-4">
            {legalPages.map((page, i) => {
              const IconComp = iconMap[page.icon] || FileText;
              return (
                <FadeIn key={page.href} delay={i * 0.04}>
                  <Link href={page.href} className="block group">
                    <div className="card p-5 md:p-6 flex items-start gap-4 md:gap-5">
                      <div className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-lg bg-[rgba(255,255,255,0.04)] flex items-center justify-center border border-[rgba(255,255,255,0.06)] group-hover:border-[rgba(255,255,255,0.12)] transition-colors">
                        <IconComp size={18} className="text-[#999999] group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-[15px] font-semibold text-white mb-1.5 group-hover:text-white transition-colors">{page.title}</h3>
                            <p className="text-[13px] text-[#999999] leading-[1.7]">{page.description}</p>
                          </div>
                          <ArrowRight size={16} className="text-[#666666] group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                        </div>
                        <p className="text-[11px] text-[#666666] mt-2.5 font-mono-tag">{t('hub.updatedLabel')} {page.updated}</p>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>

          <FadeIn delay={0.5}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666] mb-2">{t('hub.footerGoverningLaw')}</p>
              <p className="text-[12px] text-[#666666]">{t('hub.footerContact')}</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
