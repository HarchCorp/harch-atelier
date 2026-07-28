'use client';

import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  ArrowRight, ChevronRight, Sparkles, Wrench, Bug, AlertTriangle,
  Clock, Tag, Calendar, Rocket, CheckCircle2, Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

/* ─── MAIN COMPONENT ─── */
export default function ChangelogPageClient() {
  const t = useTranslations('docs');

  const versions = [
    {
      version: 'v0.2.0',
      date: t('changelog.versions.0.date'),
      status: 'upcoming',
      statusLabel: t('changelog.versions.0.statusLabel'),
      description: t('changelog.versions.0.description'),
      sections: {
        newFeatures: [
          t('changelog.versions.0.newFeatures.0'),
          t('changelog.versions.0.newFeatures.1'),
          t('changelog.versions.0.newFeatures.2'),
          t('changelog.versions.0.newFeatures.3'),
          t('changelog.versions.0.newFeatures.4'),
          t('changelog.versions.0.newFeatures.5'),
          t('changelog.versions.0.newFeatures.6'),
          t('changelog.versions.0.newFeatures.7'),
        ],
        improvements: [
          t('changelog.versions.0.improvements.0'),
          t('changelog.versions.0.improvements.1'),
          t('changelog.versions.0.improvements.2'),
          t('changelog.versions.0.improvements.3'),
          t('changelog.versions.0.improvements.4'),
        ],
        bugFixes: [
          t('changelog.versions.0.bugFixes.0'),
          t('changelog.versions.0.bugFixes.1'),
          t('changelog.versions.0.bugFixes.2'),
        ],
        breakingChanges: [
          t('changelog.versions.0.breakingChanges.0'),
          t('changelog.versions.0.breakingChanges.1'),
          t('changelog.versions.0.breakingChanges.2'),
        ],
        deprecations: [
          t('changelog.versions.0.deprecations.0'),
          t('changelog.versions.0.deprecations.1'),
          t('changelog.versions.0.deprecations.2'),
        ],
      },
    },
    {
      version: 'v0.1.1',
      date: t('changelog.versions.1.date'),
      status: 'current',
      statusLabel: t('changelog.versions.1.statusLabel'),
      description: t('changelog.versions.1.description'),
      sections: {
        newFeatures: [
          t('changelog.versions.1.newFeatures.0'),
          t('changelog.versions.1.newFeatures.1'),
          t('changelog.versions.1.newFeatures.2'),
          t('changelog.versions.1.newFeatures.3'),
        ],
        improvements: [
          t('changelog.versions.1.improvements.0'),
          t('changelog.versions.1.improvements.1'),
          t('changelog.versions.1.improvements.2'),
          t('changelog.versions.1.improvements.3'),
          t('changelog.versions.1.improvements.4'),
          t('changelog.versions.1.improvements.5'),
        ],
        bugFixes: [
          t('changelog.versions.1.bugFixes.0'),
          t('changelog.versions.1.bugFixes.1'),
          t('changelog.versions.1.bugFixes.2'),
          t('changelog.versions.1.bugFixes.3'),
          t('changelog.versions.1.bugFixes.4'),
          t('changelog.versions.1.bugFixes.5'),
        ],
        breakingChanges: [],
        deprecations: [
          t('changelog.versions.1.deprecations.0'),
        ],
      },
    },
    {
      version: 'v0.1.0',
      date: t('changelog.versions.2.date'),
      status: 'released',
      statusLabel: t('changelog.versions.2.statusLabel'),
      description: t('changelog.versions.2.description'),
      sections: {
        newFeatures: [
          t('changelog.versions.2.newFeatures.0'),
          t('changelog.versions.2.newFeatures.1'),
          t('changelog.versions.2.newFeatures.2'),
          t('changelog.versions.2.newFeatures.3'),
          t('changelog.versions.2.newFeatures.4'),
          t('changelog.versions.2.newFeatures.5'),
          t('changelog.versions.2.newFeatures.6'),
          t('changelog.versions.2.newFeatures.7'),
          t('changelog.versions.2.newFeatures.8'),
          t('changelog.versions.2.newFeatures.9'),
          t('changelog.versions.2.newFeatures.10'),
          t('changelog.versions.2.newFeatures.11'),
          t('changelog.versions.2.newFeatures.12'),
          t('changelog.versions.2.newFeatures.13'),
          t('changelog.versions.2.newFeatures.14'),
          t('changelog.versions.2.newFeatures.15'),
          t('changelog.versions.2.newFeatures.16'),
          t('changelog.versions.2.newFeatures.17'),
          t('changelog.versions.2.newFeatures.18'),
          t('changelog.versions.2.newFeatures.19'),
        ],
        improvements: [],
        bugFixes: [],
        breakingChanges: [],
        deprecations: [],
      },
    },
  ];

  const sectionConfig: Record<string, { icon: typeof Sparkles; label: string; color: string }> = {
    newFeatures: { icon: Sparkles, label: t('changelog.sections.newFeatures'), color: '#8B9DAF' },
    improvements: { icon: Wrench, label: t('changelog.sections.improvements'), color: '#8B5CF6' },
    bugFixes: { icon: Bug, label: t('changelog.sections.bugFixes'), color: '#F59E0B' },
    breakingChanges: { icon: AlertTriangle, label: t('changelog.sections.breakingChanges'), color: '#EF4444' },
    deprecations: { icon: Clock, label: t('changelog.sections.deprecations'), color: '#666666' },
  };

  const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
    upcoming: { bg: 'rgba(245,158,11,0.08)', text: '#F59E0B', border: 'rgba(245,158,11,0.2)' },
    current: { bg: 'rgba(139,157,175,0.08)', text: '#8B9DAF', border: 'rgba(139,157,175,0.2)' },
    released: { bg: 'rgba(255,255,255,0.04)', text: '#999999', border: 'rgba(255,255,255,0.06)' },
  };

  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#000000] overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#000000]/95 to-[#0D0D0D]" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6 text-[#8B9DAF]">{t('changelog.hero.label')}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              {t('changelog.title')}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-8">
              {t('changelog.description')}
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex items-center gap-4 text-[13px]">
              <span className="text-[#666666]">{t('changelog.latestVersion')}</span>
              <span className="font-[family-name:var(--font-space-mono)] text-[#8B9DAF] font-semibold">v0.1.1</span>
              <span className="text-[#333333]">|</span>
              <Link href="/docs" className="text-[#999999] hover:text-white transition-colors nav-link">{t('changelog.backToDocs')}</Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          VERSION TIMELINE
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] lg:left-[23px] top-0 bottom-0 w-px bg-white/[0.06]" />

            <div className="space-y-16">
              {versions.map((version, vi) => (
                <FadeIn key={version.version} delay={vi * 0.1}>
                  <div className="relative pl-14 lg:pl-16">
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1 w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 flex items-center justify-center z-10" style={{ borderColor: statusStyles[version.status].border, backgroundColor: statusStyles[version.status].bg }}>
                      <span style={{ color: statusStyles[version.status].text }}><Package size={16} /></span>
                    </div>

                    {/* Version Card */}
                    <div className="card overflow-hidden">
                      {/* Version Header */}
                      <div className="px-6 py-5 border-b border-white/[0.06]">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                          <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-space-mono)]">{version.version}</h2>
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider w-fit" style={{ backgroundColor: statusStyles[version.status].bg, color: statusStyles[version.status].text, border: `1px solid ${statusStyles[version.status].border}` }}>
                            {version.statusLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[12px] text-[#666666]">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} /> {version.date}
                          </span>
                        </div>
                        <p className="text-[14px] text-[#999999] leading-[1.6] mt-3">{version.description}</p>
                      </div>

                      {/* Version Sections */}
                      <div className="divide-y divide-white/[0.03]">
                        {(Object.entries(version.sections) as [keyof typeof sectionConfig, string[]][]).map(([sectionKey, items]) => {
                          if (!items || items.length === 0) return null;
                          const config = sectionConfig[sectionKey];
                          if (!config) return null;
                          const Icon = config.icon;

                          return (
                            <div key={sectionKey} className="px-6 py-5">
                              <div className="flex items-center gap-2.5 mb-3">
                                <Icon size={14} style={{ color: config.color }} />
                                <h3 className="text-[13px] font-bold uppercase tracking-[0.08em]" style={{ color: config.color }}>{config.label}</h3>
                                <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">({items.length})</span>
                              </div>
                              <div className="space-y-2">
                                {items.map((item, i) => (
                                  <div key={i} className="flex items-start gap-2.5">
                                    <span className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ backgroundColor: config.color }} />
                                    <span className="text-[13px] text-[#CCCCCC] leading-[1.6]">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
