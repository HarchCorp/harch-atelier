'use client';

import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  Search, BookOpen, Code2, Layers, Rocket, Server, Brain, Eye, Zap,
  Globe, Shield, Terminal, Database, Key, Lock, Activity, ChevronRight,
  FileText, Box, Cloud, Cpu, GitBranch, Wrench, Monitor, Network,
  ArrowRight, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

/* ─── MAIN COMPONENT ─── */
export default function DocsPageClient() {
  const t = useTranslations('docs');

  const quickStartCards = [
    {
      icon: Rocket,
      title: t('quickStartCards.0.title'),
      description: t('quickStartCards.0.description'),
      href: '/docs/quickstarts',
      accent: '#8B9DAF',
    },
    {
      icon: Code2,
      title: t('quickStartCards.1.title'),
      description: t('quickStartCards.1.description'),
      href: '/docs/api',
      accent: '#8B5CF6',
    },
    {
      icon: Terminal,
      title: t('quickStartCards.2.title'),
      description: t('quickStartCards.2.description'),
      href: '/docs/sdks',
      accent: '#10B981',
    },
    {
      icon: Layers,
      title: t('quickStartCards.3.title'),
      description: t('quickStartCards.3.description'),
      href: '/docs/architecture',
      accent: '#F59E0B',
    },
  ];

  const docCategories = [
    {
      title: t('docCategories.0.title'),
      icon: Server,
      items: [
        { name: t('docCategories.0.items.0.name'), desc: t('docCategories.0.items.0.desc'), icon: Cpu, href: '/docs/architecture' },
        { name: t('docCategories.0.items.1.name'), desc: t('docCategories.0.items.1.desc'), icon: Eye, href: '/docs/architecture' },
        { name: t('docCategories.0.items.2.name'), desc: t('docCategories.0.items.2.desc'), icon: Brain, href: '/docs/architecture' },
        { name: t('docCategories.0.items.3.name'), desc: t('docCategories.0.items.3.desc'), icon: Zap, href: '/docs/architecture' },
      ],
    },
    {
      title: t('docCategories.1.title'),
      icon: Globe,
      items: [
        { name: t('docCategories.1.items.0.name'), desc: t('docCategories.1.items.0.desc'), icon: Network, href: '/docs/api' },
        { name: t('docCategories.1.items.1.name'), desc: t('docCategories.1.items.1.desc'), icon: Activity, href: '/docs/api' },
        { name: t('docCategories.1.items.2.name'), desc: t('docCategories.1.items.2.desc'), icon: Cloud, href: '/docs/api' },
        { name: t('docCategories.1.items.3.name'), desc: t('docCategories.1.items.3.desc'), icon: Key, href: '/docs/api' },
      ],
    },
    {
      title: t('docCategories.2.title'),
      icon: Code2,
      items: [
        { name: t('docCategories.2.items.0.name'), desc: t('docCategories.2.items.0.desc'), icon: Box, href: '/docs/sdks' },
        { name: t('docCategories.2.items.1.name'), desc: t('docCategories.2.items.1.desc'), icon: FileText, href: '/docs/sdks' },
        { name: t('docCategories.2.items.2.name'), desc: t('docCategories.2.items.2.desc'), icon: Terminal, href: '/docs/sdks' },
        { name: t('docCategories.2.items.3.name'), desc: t('docCategories.2.items.3.desc'), icon: Wrench, href: '/docs/sdks' },
      ],
    },
    {
      title: t('docCategories.3.title'),
      icon: Database,
      items: [
        { name: t('docCategories.3.items.0.name'), desc: t('docCategories.3.items.0.desc'), icon: Server, href: '/docs/guides' },
        { name: t('docCategories.3.items.1.name'), desc: t('docCategories.3.items.1.desc'), icon: Network, href: '/docs/guides' },
        { name: t('docCategories.3.items.2.name'), desc: t('docCategories.3.items.2.desc'), icon: Zap, href: '/docs/guides' },
        { name: t('docCategories.3.items.3.name'), desc: t('docCategories.3.items.3.desc'), icon: Monitor, href: '/docs/guides' },
      ],
    },
    {
      title: t('docCategories.4.title'),
      icon: Shield,
      items: [
        { name: t('docCategories.4.items.0.name'), desc: t('docCategories.4.items.0.desc'), icon: Key, href: '/docs/guides' },
        { name: t('docCategories.4.items.1.name'), desc: t('docCategories.4.items.1.desc'), icon: Lock, href: '/docs/guides' },
        { name: t('docCategories.4.items.2.name'), desc: t('docCategories.4.items.2.desc'), icon: CheckCircle2, href: '/docs/guides' },
        { name: t('docCategories.4.items.3.name'), desc: t('docCategories.4.items.3.desc'), icon: FileText, href: '/docs/guides' },
      ],
    },
    {
      title: t('docCategories.5.title'),
      icon: GitBranch,
      items: [
        { name: t('docCategories.5.items.0.name'), desc: t('docCategories.5.items.0.desc'), icon: Terminal, href: '/docs/sdks' },
        { name: t('docCategories.5.items.1.name'), desc: t('docCategories.5.items.1.desc'), icon: Layers, href: '/docs/sdks' },
        { name: t('docCategories.5.items.2.name'), desc: t('docCategories.5.items.2.desc'), icon: Box, href: '/docs/sdks' },
        { name: t('docCategories.5.items.3.name'), desc: t('docCategories.5.items.3.desc'), icon: Code2, href: '/docs/sdks' },
      ],
    },
  ];

  const popularGuides = [
    { title: t('popularGuides.0.title'), desc: t('popularGuides.0.desc'), time: t('popularGuides.0.time'), href: '/docs/quickstarts' },
    { title: t('popularGuides.1.title'), desc: t('popularGuides.1.desc'), time: t('popularGuides.1.time'), href: '/docs/guides' },
    { title: t('popularGuides.2.title'), desc: t('popularGuides.2.desc'), time: t('popularGuides.2.time'), href: '/docs/architecture' },
    { title: t('popularGuides.3.title'), desc: t('popularGuides.3.desc'), time: t('popularGuides.3.time'), href: '/docs/guides' },
    { title: t('popularGuides.4.title'), desc: t('popularGuides.4.desc'), time: t('popularGuides.4.time'), href: '/docs/guides' },
    { title: t('popularGuides.5.title'), desc: t('popularGuides.5.desc'), time: t('popularGuides.5.time'), href: '/docs/guides' },
  ];

  const apiStatusItems = [
    { name: t('apiStatus.items.0.name'), status: t('apiStatus.items.0.status'), latency: '24ms', uptime: '99.99%' },
    { name: t('apiStatus.items.1.name'), status: t('apiStatus.items.1.status'), latency: '8ms', uptime: '99.99%' },
    { name: t('apiStatus.items.2.name'), status: t('apiStatus.items.2.status'), latency: '3ms', uptime: '99.97%' },
    { name: t('apiStatus.items.3.name'), status: t('apiStatus.items.3.status'), latency: '12ms', uptime: '100%' },
  ];

  const releaseLinks = [
    { label: t('currentRelease.links.0.label'), href: '/docs/changelog', icon: FileText },
    { label: t('currentRelease.links.1.label'), href: '/docs/changelog', icon: ArrowRight },
    { label: t('currentRelease.links.2.label'), href: '/docs/changelog', icon: Code2 },
  ];

  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══════════════════════════════════════════
          HERO — Documentation Hub
          ═══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#000000] overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#000000]/95 to-[#0D0D0D]" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6 text-[#8B9DAF]">{t('hero.label')}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              {t('title')}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-10">
              {t('description')}
            </p>
          </FadeIn>
          {/* Decorative Search Bar */}
          <FadeIn delay={0.3}>
            <div className="max-w-2xl">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" />
                <input
                  type="text"
                  placeholder={t('search')}
                  className="w-full bg-[#121212] border border-white/[0.08] rounded-xl pl-12 pr-4 py-4 text-[15px] text-white placeholder-[#666666] focus:outline-none focus:border-white/20 transition-colors"
                  readOnly
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <kbd className="px-2 py-1 rounded text-[10px] text-[#666666] bg-[rgba(255,255,255,0.04)] border border-white/[0.06] font-[family-name:var(--font-space-mono)]">Ctrl</kbd>
                  <kbd className="px-2 py-1 rounded text-[10px] text-[#666666] bg-[rgba(255,255,255,0.04)] border border-white/[0.06] font-[family-name:var(--font-space-mono)]">K</kbd>
                </div>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="mt-6 flex items-center gap-4 text-[13px]">
              <span className="text-[#666666]">{t('hero.currentVersion')}</span>
              <span className="font-[family-name:var(--font-space-mono)] text-[#8B9DAF] font-semibold">v0.1.0</span>
              <span className="text-[#333333]">|</span>
              <Link href="/docs/changelog" className="text-[#999999] hover:text-white transition-colors nav-link">{t('hero.viewChangelog')}</Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          QUICK START CARDS
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('quickStart.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('quickStart.title')}
            </h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStartCards.map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.08}>
                <Link href={card.href} className="card p-6 h-full block group hover:border-white/15">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5" style={{ backgroundColor: `${card.accent}12` }}>
                    <card.icon size={18} style={{ color: card.accent }} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#8B9DAF] transition-colors">{card.title}</h3>
                  <p className="text-[13px] text-[#999999] leading-[1.6] mb-4">{card.description}</p>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: card.accent }}>
                    {t('quickStart.getStarted')} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DOCUMENTATION CATEGORIES
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('categories.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('categories.title')}
            </h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {docCategories.map((category, i) => (
              <FadeIn key={category.title} delay={i * 0.08}>
                <div className="card p-6 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-[rgba(139,157,175,0.08)] flex items-center justify-center">
                      <category.icon size={16} className="text-[#8B9DAF]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{category.title}</h3>
                  </div>
                  <div className="space-y-0">
                    {category.items.map((item) => (
                      <Link key={item.name} href={item.href} className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0 group/item">
                        <item.icon size={14} className="text-[#666666] mt-0.5 shrink-0 group-hover/item:text-[#8B9DAF] transition-colors" />
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-white group-hover/item:text-[#8B9DAF] transition-colors">{item.name}</p>
                          <p className="text-[12px] text-[#666666] leading-[1.5] mt-0.5">{item.desc}</p>
                        </div>
                        <ChevronRight size={12} className="text-[#333333] mt-1.5 shrink-0 group-hover/item:text-[#8B9DAF] group-hover/item:translate-x-0.5 transition-all ml-auto" />
                      </Link>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          POPULAR GUIDES
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('popularGuides.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('popularGuides.title')}
            </h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <div className="space-y-0">
            {popularGuides.map((guide, i) => (
              <FadeIn key={guide.title} delay={i * 0.06}>
                <Link href={guide.href} className="flex items-center justify-between py-5 border-b border-white/[0.04] group/guide hover:bg-white/[0.01] px-2 -mx-2 rounded-lg transition-colors">
                  <div className="flex items-start gap-4 min-w-0">
                    <span className="text-[12px] font-[family-name:var(--font-space-mono)] text-[#333333] mt-1 shrink-0 w-6 text-right">{String(i + 1).padStart(2, '0')}</span>
                    <div className="min-w-0">
                      <h4 className="text-[15px] font-semibold text-white group-hover/guide:text-[#8B9DAF] transition-colors">{guide.title}</h4>
                      <p className="text-[13px] text-[#666666] mt-1 leading-[1.5]">{guide.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <span className="flex items-center gap-1.5 text-[11px] text-[#666666]">
                      <Clock size={12} /> {guide.time}
                    </span>
                    <ArrowRight size={14} className="text-[#333333] group-hover/guide:text-[#8B9DAF] group-hover/guide:translate-x-1 transition-all" />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          API STATUS + VERSION
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* API Status */}
            <FadeIn>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <Activity size={18} className="text-[#8B9DAF]" />
                  <h3 className="text-lg font-bold text-white">{t('apiStatus.title')}</h3>
                </div>
                <div className="accent-line mb-6" />
                <div className="space-y-4">
                  {apiStatusItems.map((api) => (
                    <div key={api.name} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                        <span className="text-[14px] text-white font-medium">{api.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[12px] text-[#666666] font-[family-name:var(--font-space-mono)]">{api.latency}</span>
                        <span className="text-[12px] text-[#10B981] font-[family-name:var(--font-space-mono)]">{api.uptime}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10B981]" />
                  <span className="text-[12px] text-[#666666]">{t('apiStatus.allOperational')}</span>
                </div>
              </div>
            </FadeIn>

            {/* Version & Resources */}
            <FadeIn delay={0.1}>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen size={18} className="text-[#8B9DAF]" />
                  <h3 className="text-lg font-bold text-white">{t('currentRelease.title')}</h3>
                </div>
                <div className="accent-line mb-6" />
                <div className="mb-6">
                  <p className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)] mb-2">{t('currentRelease.versionLabel')}</p>
                  <p className="text-4xl font-bold text-white font-[family-name:var(--font-space-mono)]">v0.1.0</p>
                  <p className="text-[13px] text-[#666666] mt-2">{t('currentRelease.releaseInfo')}</p>
                </div>
                <div className="space-y-3">
                  {releaseLinks.map((link) => (
                    <Link key={link.label} href={link.href} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0 group/link">
                      <div className="flex items-center gap-2.5">
                        <link.icon size={14} className="text-[#666666] group-hover/link:text-[#8B9DAF] transition-colors" />
                        <span className="text-[14px] text-white group-hover/link:text-[#8B9DAF] transition-colors">{link.label}</span>
                      </div>
                      <ChevronRight size={12} className="text-[#333333] group-hover/link:text-[#8B9DAF] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

    </div>
  );
}
