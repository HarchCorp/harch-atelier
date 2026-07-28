'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Bot,
  Search,
  Zap,
  Globe,
  DollarSign,
  Settings,
  Code2,
  AlertCircle,
  Tag,
  Phone,
} from 'lucide-react';
import { FadeIn } from '@/components/ui/motion';
import { geoAeoArticles } from '@/data/generated/geo-aeo-articles';

const categoryIcons: Record<
  string,
  React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
> = {
  'GEO Basics': Sparkles,
  'Practical Guides': Bot,
  Comparisons: Search,
  'Technical Guides': Code2,
  'Problem-Solving': AlertCircle,
  'Google-Specific': Search,
  'Market-Specific': Globe,
  Technology: Zap,
  Pricing: DollarSign,
};

const categoryAccents: Record<string, string> = {
  'GEO Basics': 'text-emerald-400',
  'Practical Guides': 'text-sky-400',
  Comparisons: 'text-violet-400',
  'Technical Guides': 'text-cyan-400',
  'Problem-Solving': 'text-rose-400',
  'Google-Specific': 'text-amber-400',
  'Market-Specific': 'text-teal-400',
  Technology: 'text-indigo-400',
  Pricing: 'text-stone-400',
};

const allCategories = ['All', ...Array.from(new Set(geoAeoArticles.map((a) => a.category)))];

const heroStats = [
  { label: 'Articles', value: '10' },
  { label: 'Answer Engines Covered', value: '4' },
  { label: 'Avg Read Time', value: '8 min' },
  { label: 'Updated', value: 'Jul 2026' },
];

export default function GeoAeoBlogPageClient() {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredArticles =
    activeCategory === 'All'
      ? geoAeoArticles
      : geoAeoArticles.filter((a) => a.category === activeCategory);

  return (
    <div className="bg-[#0D0D0D] min-h-screen">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-[#0D0D0D]">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <FadeIn>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#999999] hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </Link>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.18)] text-[10px] font-bold tracking-[0.16em] uppercase text-emerald-400 mb-6">
              <Sparkles size={11} />
              GEO / AEO · AI Search Visibility
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-3xl md:text-5xl lg:text-[56px] font-extrabold text-white tracking-[-0.025em] leading-[1.05] mb-6">
              The blog that makes your business
              <br />
              <span className="text-emerald-400">appear in AI answers.</span>
            </h1>
            <div className="accent-line mb-6" />
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="text-[16px] md:text-[18px] text-[#CCCCCC] leading-[1.7] max-w-3xl">
              Ten practical guides on Generative Engine Optimization (GEO) and Answer Engine
              Optimization (AEO). Real numbers, real playbooks, real citations across ChatGPT,
              Perplexity, Google AI Overviews, and GLM — powered by GLM-4 by Z.ai and written by the
              team at <Link href="/subsidiaries/atelier" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-400/40">Harch Atelier</Link>.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {heroStats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4"
                >
                  <div className="text-2xl font-bold text-white font-[family-name:var(--font-space-mono)]">
                    {s.value}
                  </div>
                  <div className="text-[10px] tracking-[0.12em] uppercase text-[#666666] mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ DIVIDER ═══ */}
      <div className="max-w-[1100px] mx-auto px-6 md:px-12">
        <div className="h-px bg-white/[0.04]" />
      </div>

      {/* ═══ CATEGORY FILTER ═══ */}
      <section className="py-10 bg-[#0D0D0D] sticky top-0 z-20 backdrop-blur-md bg-[#0D0D0D]/85 border-b border-white/[0.04]">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-md text-[11px] font-semibold tracking-[0.06em] uppercase transition-all border ${
                    isActive
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/[0.02] border-white/[0.06] text-[#999999] hover:text-white hover:border-white/[0.12]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ ARTICLE LIST ═══ */}
      <section className="py-16 md:py-24 bg-[#0D0D0D]">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <div className="grid gap-4 md:gap-5">
            {filteredArticles.map((article, i) => {
              const Icon = categoryIcons[article.category] || Tag;
              const accent = categoryAccents[article.category] || 'text-emerald-400';
              return (
                <FadeIn key={article.slug} delay={i * 0.04}>
                  <Link
                    href={`/blog/geo-aeo/${article.slug}`}
                    className="group block p-6 md:p-7 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.015)] hover:border-[rgba(16,185,129,0.25)] hover:bg-[rgba(16,185,129,0.025)] transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[rgba(139,157,175,0.06)] border border-[rgba(139,157,175,0.12)] text-[9px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">
                            <Icon size={10} className={accent} />
                            {article.category}
                          </span>
                          <span className="text-[10px] text-[#666666] flex items-center gap-1 font-[family-name:var(--font-space-mono)]">
                            <Calendar size={9} />
                            {article.date}
                          </span>
                          <span className="text-[10px] text-[#666666] flex items-center gap-1 font-[family-name:var(--font-space-mono)]">
                            <Clock size={9} />
                            {article.readTime}
                          </span>
                        </div>
                        <h2 className="text-[18px] md:text-[22px] font-bold text-white group-hover:text-emerald-300 transition-colors leading-[1.3] mb-2.5">
                          {article.title}
                        </h2>
                        <p className="text-[14px] text-[#999999] leading-[1.65] line-clamp-2">
                          {article.description}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                          Read article
                          <ArrowRight
                            size={12}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 md:py-28 bg-[#121212] border-t border-white/[0.04]">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-8 md:p-12 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold tracking-[0.16em] uppercase text-emerald-400 mb-5">
                <Settings size={11} />
                Free 5-minute audit
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-[-0.02em] mb-4">
                See what ChatGPT, Perplexity, and GLM say about you.
              </h2>
              <p className="text-[15px] text-[#999999] leading-[1.7] max-w-2xl mx-auto mb-8">
                We run your business across all four answer engines and send you a real before-state
                report. No commitment, no credit card, no Stripe — bank transfer (RIB) only when you
                decide to proceed.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/subsidiaries/atelier"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 text-black font-bold text-[14px] hover:bg-emerald-400 transition-colors"
                >
                  Request free audit
                  <ArrowRight size={14} />
                </Link>
                <a
                  href="tel:+212684440682"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/[0.12] text-white font-semibold text-[14px] hover:border-white/[0.2] transition-colors"
                >
                  <Phone size={14} />
                  +212 684 440 682
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
