'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  Bot,
  Search,
  Zap,
  Globe,
  DollarSign,
  Code2,
  AlertCircle,
  Tag,
  Phone,
  Settings,
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

interface Props {
  slug: string;
  html: string;
}

export default function GeoAeoArticlePageClient({ slug, html }: Props) {
  const article = geoAeoArticles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="bg-[#0D0D0D] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Article not found</h1>
          <p className="text-[#999999] mb-8">
            The GEO/AEO article you are looking for does not exist.
          </p>
          <Link
            href="/blog/geo-aeo"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-white/80 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to GEO / AEO Blog
          </Link>
        </div>
      </div>
    );
  }

  const Icon = categoryIcons[article.category] || Tag;

  const relatedArticles = geoAeoArticles.filter((a) => a.slug !== slug).slice(0, 4);

  return (
    <div className="bg-[#0D0D0D] min-h-screen">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-[#0D0D0D]">
        <div className="max-w-[820px] mx-auto px-6 md:px-12">
          <FadeIn>
            <Link
              href="/blog/geo-aeo"
              className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#999999] hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              Back to GEO / AEO Blog
            </Link>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] text-[9px] font-bold tracking-[0.12em] uppercase text-emerald-400">
                <Icon size={10} />
                {article.category}
              </span>
              <span className="text-[11px] text-[#666666] flex items-center gap-1 font-[family-name:var(--font-space-mono)]">
                <Calendar size={10} />
                {article.date}
              </span>
              <span className="text-[11px] text-[#666666] flex items-center gap-1 font-[family-name:var(--font-space-mono)]">
                <Clock size={10} />
                {article.readTime}
              </span>
              <span className="text-[11px] text-[#666666] flex items-center gap-1 font-[family-name:var(--font-space-mono)]">
                <Settings size={10} />
                Harch Atelier
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-3xl md:text-4xl lg:text-[44px] font-extrabold text-white tracking-[-0.02em] leading-[1.15] mb-6">
              {article.title}
            </h1>
            <div className="accent-line mb-6" />
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="text-[16px] md:text-[17px] text-[#CCCCCC] leading-[1.7]">{article.description}</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ DIVIDER ═══ */}
      <div className="max-w-[820px] mx-auto px-6 md:px-12">
        <div className="h-px bg-white/[0.04]" />
      </div>

      {/* ═══ ARTICLE BODY ═══ */}
      <section className="py-16 md:py-20 bg-[#121212]">
        <div className="max-w-[820px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div
              className="prose-geo-aeo text-[15px] text-[#CCCCCC] leading-[1.85]"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </FadeIn>

          {/* Keywords */}
          <FadeIn delay={0.1}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#666666] mb-3 font-[family-name:var(--font-space-mono)]">
                Related topics
              </p>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-block px-3 py-1.5 rounded-md bg-[rgba(16,185,129,0.04)] border border-[rgba(16,185,129,0.1)] text-[11px] font-medium text-emerald-300/80 font-[family-name:var(--font-space-mono)]"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* CTA strip */}
          <FadeIn delay={0.15}>
            <div className="mt-12 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] p-6 md:p-7">
              <div className="flex items-start gap-3 mb-3">
                <Settings size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-[15px] font-bold text-white mb-1">
                    Free 5-minute AI search visibility audit
                  </h3>
                  <p className="text-[13px] text-[#999999] leading-[1.6]">
                    See what ChatGPT, Perplexity, Google AI Overviews, and GLM say about your
                    business today. No commitment. Bank transfer (RIB) only when you decide to
                    proceed.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  href="/subsidiaries/atelier"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-black font-semibold text-[12px] hover:bg-emerald-400 transition-colors"
                >
                  Request audit
                  <ArrowRight size={12} />
                </Link>
                <a
                  href="tel:+212684440682"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.1] text-white font-semibold text-[12px] hover:border-white/[0.2] transition-colors"
                >
                  <Phone size={12} />
                  +212 684 440 682
                </a>
              </div>
            </div>
          </FadeIn>

          {/* Back Link */}
          <FadeIn delay={0.2}>
            <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <Link
                href="/blog/geo-aeo"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#999999] hover:text-white transition-colors group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Back to GEO / AEO Blog
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ RELATED ARTICLES ═══ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[820px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-emerald-400/80">More from GEO / AEO</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-[-0.01em] mb-8">
              Continue reading
            </h2>
          </FadeIn>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedArticles.map((a, i) => {
              const AIcon = categoryIcons[a.category] || Tag;
              return (
                <FadeIn key={a.slug} delay={i * 0.05}>
                  <Link
                    href={`/blog/geo-aeo/${a.slug}`}
                    className="group block p-5 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.015)] hover:border-emerald-500/25 transition-all h-full"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(139,157,175,0.06)] border border-[rgba(139,157,175,0.1)] text-[8px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">
                        <AIcon size={8} className="text-emerald-400" />
                        {a.category}
                      </span>
                      <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">
                        {a.readTime}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                      {a.title}
                    </h3>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
