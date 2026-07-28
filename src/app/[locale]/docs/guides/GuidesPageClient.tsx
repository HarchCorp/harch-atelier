'use client';

import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  Rocket, Database, Brain, Zap, ChevronRight, ArrowRight,
  Activity, Shield, Satellite, Radio, Cloud, BarChart3,
  Lock, Eye, Server, Cpu, Globe, Monitor, AlertTriangle,
  CheckCircle2, Clock, FileText, Settings, Users, Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

/* ─── MAIN COMPONENT ─── */
export default function GuidesPageClient() {
  const t = useTranslations('docs');

  const guideCategories = [
    {
      title: t('guides.categories.0.title'),
      description: t('guides.categories.0.description'),
      icon: Rocket,
      accent: '#8B9DAF',
      guides: [
        {
          title: t('guides.categories.0.guides.0.title'),
          desc: t('guides.categories.0.guides.0.desc'),
          time: t('guides.categories.0.guides.0.time'),
          difficulty: t('guides.categories.0.guides.0.difficulty'),
          tags: [t('guides.categories.0.guides.0.tags.0'), t('guides.categories.0.guides.0.tags.1')],
        },
        {
          title: t('guides.categories.0.guides.1.title'),
          desc: t('guides.categories.0.guides.1.desc'),
          time: t('guides.categories.0.guides.1.time'),
          difficulty: t('guides.categories.0.guides.1.difficulty'),
          tags: [t('guides.categories.0.guides.1.tags.0'), t('guides.categories.0.guides.1.tags.1')],
        },
        {
          title: t('guides.categories.0.guides.2.title'),
          desc: t('guides.categories.0.guides.2.desc'),
          time: t('guides.categories.0.guides.2.time'),
          difficulty: t('guides.categories.0.guides.2.difficulty'),
          tags: [t('guides.categories.0.guides.2.tags.0'), t('guides.categories.0.guides.2.tags.1')],
        },
        {
          title: t('guides.categories.0.guides.3.title'),
          desc: t('guides.categories.0.guides.3.desc'),
          time: t('guides.categories.0.guides.3.time'),
          difficulty: t('guides.categories.0.guides.3.difficulty'),
          tags: [t('guides.categories.0.guides.3.tags.0'), t('guides.categories.0.guides.3.tags.1')],
        },
      ],
    },
    {
      title: t('guides.categories.1.title'),
      description: t('guides.categories.1.description'),
      icon: Database,
      accent: '#8B5CF6',
      guides: [
        {
          title: t('guides.categories.1.guides.0.title'),
          desc: t('guides.categories.1.guides.0.desc'),
          time: t('guides.categories.1.guides.0.time'),
          difficulty: t('guides.categories.1.guides.0.difficulty'),
          tags: [t('guides.categories.1.guides.0.tags.0'), t('guides.categories.1.guides.0.tags.1'), t('guides.categories.1.guides.0.tags.2')],
        },
        {
          title: t('guides.categories.1.guides.1.title'),
          desc: t('guides.categories.1.guides.1.desc'),
          time: t('guides.categories.1.guides.1.time'),
          difficulty: t('guides.categories.1.guides.1.difficulty'),
          tags: [t('guides.categories.1.guides.1.tags.0'), t('guides.categories.1.guides.1.tags.1')],
        },
        {
          title: t('guides.categories.1.guides.2.title'),
          desc: t('guides.categories.1.guides.2.desc'),
          time: t('guides.categories.1.guides.2.time'),
          difficulty: t('guides.categories.1.guides.2.difficulty'),
          tags: [t('guides.categories.1.guides.2.tags.0'), t('guides.categories.1.guides.2.tags.1')],
        },
        {
          title: t('guides.categories.1.guides.3.title'),
          desc: t('guides.categories.1.guides.3.desc'),
          time: t('guides.categories.1.guides.3.time'),
          difficulty: t('guides.categories.1.guides.3.difficulty'),
          tags: [t('guides.categories.1.guides.3.tags.0'), t('guides.categories.1.guides.3.tags.1')],
        },
      ],
    },
    {
      title: t('guides.categories.2.title'),
      description: t('guides.categories.2.description'),
      icon: Brain,
      accent: '#10B981',
      guides: [
        {
          title: t('guides.categories.2.guides.0.title'),
          desc: t('guides.categories.2.guides.0.desc'),
          time: t('guides.categories.2.guides.0.time'),
          difficulty: t('guides.categories.2.guides.0.difficulty'),
          tags: [t('guides.categories.2.guides.0.tags.0'), t('guides.categories.2.guides.0.tags.1')],
        },
        {
          title: t('guides.categories.2.guides.1.title'),
          desc: t('guides.categories.2.guides.1.desc'),
          time: t('guides.categories.2.guides.1.time'),
          difficulty: t('guides.categories.2.guides.1.difficulty'),
          tags: [t('guides.categories.2.guides.1.tags.0'), t('guides.categories.2.guides.1.tags.1')],
        },
        {
          title: t('guides.categories.2.guides.2.title'),
          desc: t('guides.categories.2.guides.2.desc'),
          time: t('guides.categories.2.guides.2.time'),
          difficulty: t('guides.categories.2.guides.2.difficulty'),
          tags: [t('guides.categories.2.guides.2.tags.0'), t('guides.categories.2.guides.2.tags.1'), t('guides.categories.2.guides.2.tags.2')],
        },
        {
          title: t('guides.categories.2.guides.3.title'),
          desc: t('guides.categories.2.guides.3.desc'),
          time: t('guides.categories.2.guides.3.time'),
          difficulty: t('guides.categories.2.guides.3.difficulty'),
          tags: [t('guides.categories.2.guides.3.tags.0'), t('guides.categories.2.guides.3.tags.1')],
        },
      ],
    },
    {
      title: t('guides.categories.3.title'),
      description: t('guides.categories.3.description'),
      icon: Zap,
      accent: '#F59E0B',
      guides: [
        {
          title: t('guides.categories.3.guides.0.title'),
          desc: t('guides.categories.3.guides.0.desc'),
          time: t('guides.categories.3.guides.0.time'),
          difficulty: t('guides.categories.3.guides.0.difficulty'),
          tags: [t('guides.categories.3.guides.0.tags.0'), t('guides.categories.3.guides.0.tags.1')],
        },
        {
          title: t('guides.categories.3.guides.1.title'),
          desc: t('guides.categories.3.guides.1.desc'),
          time: t('guides.categories.3.guides.1.time'),
          difficulty: t('guides.categories.3.guides.1.difficulty'),
          tags: [t('guides.categories.3.guides.1.tags.0'), t('guides.categories.3.guides.1.tags.1'), t('guides.categories.3.guides.1.tags.2')],
        },
        {
          title: t('guides.categories.3.guides.2.title'),
          desc: t('guides.categories.3.guides.2.desc'),
          time: t('guides.categories.3.guides.2.time'),
          difficulty: t('guides.categories.3.guides.2.difficulty'),
          tags: [t('guides.categories.3.guides.2.tags.0'), t('guides.categories.3.guides.2.tags.1'), t('guides.categories.3.guides.2.tags.2')],
        },
        {
          title: t('guides.categories.3.guides.3.title'),
          desc: t('guides.categories.3.guides.3.desc'),
          time: t('guides.categories.3.guides.3.time'),
          difficulty: t('guides.categories.3.guides.3.difficulty'),
          tags: [t('guides.categories.3.guides.3.tags.0'), t('guides.categories.3.guides.3.tags.1'), t('guides.categories.3.guides.3.tags.2')],
        },
      ],
    },
  ];

  const difficultyColors: Record<string, string> = {
    [t('guides.difficulty.beginner')]: '#10B981',
    [t('guides.difficulty.intermediate')]: '#F59E0B',
    [t('guides.difficulty.advanced')]: '#EF4444',
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
            <p className="section-label mb-6 text-[#8B9DAF]">{t('guides.hero.label')}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              {t('guides.title')}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-8">
              {t('guides.description')}
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap gap-3">
              <Link href="/docs/quickstarts" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                {t('guides.startWithQuickstarts')} <ArrowRight size={14} />
              </Link>
              <Link href="/docs/api" className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('guides.apiReference')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          GUIDE CATEGORIES
          ═══════════════════════════════════════════ */}
      {guideCategories.map((category, ci) => (
        <section key={category.title} className={`py-20 md:py-28 ${ci % 2 === 0 ? 'bg-[#0D0D0D]' : 'bg-[#121212]'}`}>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${category.accent}12` }}>
                  <category.icon size={16} style={{ color: category.accent }} />
                </div>
                <p className="section-label" style={{ color: category.accent }}>{category.title}</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
                {category.title}
              </h2>
              <div className="accent-line mb-4" />
              <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-12">
                {category.description}
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.guides.map((guide, gi) => (
                <FadeIn key={guide.title} delay={gi * 0.08}>
                  <div className="card p-6 h-full group hover:border-white/15 cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${difficultyColors[guide.difficulty] || '#10B981'}12`, color: difficultyColors[guide.difficulty] || '#10B981' }}>
                          {guide.difficulty}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-[#666666]">
                          <Clock size={10} /> {guide.time}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#8B9DAF] transition-colors">{guide.title}</h3>
                    <p className="text-[13px] text-[#999999] leading-[1.6] mb-4">{guide.desc}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {guide.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[rgba(255,255,255,0.04)] text-[#666666]">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <ArrowRight size={14} className="text-[#333333] group-hover:text-[#8B9DAF] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      ))}

    </div>
  );
}
