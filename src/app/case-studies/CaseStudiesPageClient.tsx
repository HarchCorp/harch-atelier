'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, MapPin, Clock, Factory, Landmark, Zap, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { caseStudies } from '@/data/case-studies';

import { FadeIn } from '@/components/ui/motion';

const typeIcons: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  Industrial: Factory,
  Government: Landmark,
  Energy: Zap,
  Infrastructure: Building2,
};

const typeColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  Industrial: {
    bg: 'rgba(74,123,95,0.08)',
    border: 'rgba(74,123,95,0.2)',
    text: '#4A7B5F',
    glow: 'rgba(74,123,95,0.06)',
  },
  Government: {
    bg: 'rgba(139,157,175,0.08)',
    border: 'rgba(139,157,175,0.2)',
    text: '#8B9DAF',
    glow: 'rgba(139,157,175,0.06)',
  },
  Energy: {
    bg: 'rgba(180,140,80,0.08)',
    border: 'rgba(180,140,80,0.2)',
    text: '#B48C50',
    glow: 'rgba(180,140,80,0.06)',
  },
  Infrastructure: {
    bg: 'rgba(110,130,160,0.08)',
    border: 'rgba(110,130,160,0.2)',
    text: '#6E82A0',
    glow: 'rgba(110,130,160,0.06)',
  },
};

export default function CaseStudiesPageClient() {
  return (
    <div className="bg-[#0A0A0A]">

      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Case Studies</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Proof, Not<br/>Promises
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Hyper-realistic case studies with verified metrics, detailed implementation timelines, and client testimonials. No theoretical outcomes. No projected savings. Just results that have already been delivered.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CASE STUDY CARDS ═══ */}
      <section className="py-20 md:py-28 bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Impact Reports</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-16">Delivered Results</h2>
          </FadeIn>

          <div className="space-y-8">
            {caseStudies.map((cs, i) => {
              const Icon = typeIcons[cs.type] || Factory;
              const colors = typeColors[cs.type] || typeColors.Industrial;
              return (
                <FadeIn key={cs.slug} delay={i * 0.1}>
                  <Link href={`/case-studies/${cs.slug}`} className="group block">
                    <div
                      className="relative card overflow-hidden cursor-pointer"
                      style={{
                        borderColor: 'rgba(255,255,255,0.06)',
                        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = colors.border;
                        (e.currentTarget as HTMLElement).style.background = colors.glow;
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                        (e.currentTarget as HTMLElement).style.background = 'var(--card)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Accent Line */}
                      <div className="absolute top-0 left-0 w-1 h-full" style={{ background: colors.text }} />

                      <div className="flex flex-col lg:flex-row">
                        {/* Image */}
                        <div className="relative w-full lg:w-[420px] xl:w-[480px] shrink-0 aspect-[16/10] lg:aspect-auto lg:min-h-[340px] overflow-hidden">
                          <Image
                            src={cs.heroImage}
                            alt={cs.title}
                            fill
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                            sizes="(max-width: 1024px) 100vw, 480px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111111] hidden lg:block" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/60 to-transparent lg:hidden" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-between">
                          <div>
                            {/* Type Badge + Meta */}
                            <div className="flex flex-wrap items-center gap-3 mb-5">
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-[0.12em] uppercase"
                                style={{
                                  background: colors.bg,
                                  border: `1px solid ${colors.border}`,
                                  color: colors.text,
                                }}
                              >
                                <Icon size={10} />
                                {cs.type}
                              </span>
                              <span className="text-[11px] text-[#666666] flex items-center gap-1 font-[family-name:var(--font-space-mono)]">
                                <MapPin size={10} />
                                {cs.location}
                              </span>
                              <span className="text-[11px] text-[#666666] flex items-center gap-1 font-[family-name:var(--font-space-mono)]">
                                <Clock size={10} />
                                {cs.duration}
                              </span>
                            </div>

                            {/* Title & Subtitle */}
                            <h3 className="text-xl md:text-2xl lg:text-[28px] font-bold text-white tracking-tight leading-[1.15] mb-3 group-hover:text-[#CCCCCC] transition-colors">
                              {cs.title}
                            </h3>
                            <p className="text-[14px] text-[#999999] leading-[1.7] mb-6 max-w-2xl">
                              {cs.subtitle}
                            </p>

                            {/* Key Metrics */}
                            <div className="flex flex-wrap gap-4 mb-6">
                              {cs.results.slice(0, 3).map((r) => (
                                <div key={r.label} className="text-center">
                                  <p className="stat-mono text-lg md:text-xl font-bold text-white">{r.value}</p>
                                  <p className="text-[10px] text-[#666666] uppercase tracking-[0.08em] mt-0.5">{r.label}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* CTA Row */}
                          <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.04)]">
                            <span className="text-[12px] text-[#666666] font-[family-name:var(--font-space-mono)]">{cs.client}</span>
                            <span className="inline-flex items-center gap-2 text-sm font-semibold group-hover:text-white transition-colors" style={{ color: colors.text }}>
                              Read Case Study
                              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
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

      {/* ═══ CTA SECTION ═══ */}
      <section className="py-28 md:py-36 bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="relative card overflow-hidden text-center py-16 md:py-20">
              <div className="absolute inset-0 dot-pattern opacity-[0.03]" />
              <div className="relative z-10">
                <p className="section-label mb-4 text-[#8B9DAF]">Engage</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">
                  Your Challenge. Our Infrastructure.
                </h2>
                <p className="text-[15px] text-[#999999] leading-[1.7] max-w-xl mx-auto mb-8">
                  Request a confidential briefing to discuss how Harch Corp can deliver comparable results for your organization.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-white text-black text-[13px] font-semibold tracking-[0.02em] hover:bg-[#E5E5E5] transition-colors"
                >
                  Request a Briefing
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
