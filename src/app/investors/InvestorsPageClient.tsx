'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FadeIn } from '@/components/ui/motion';
import { InvestmentPipelineChart } from '@/components/charts/InvestmentPipelineChart';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { OperationalMetricsChart } from '@/components/charts/OperationalMetricsChart';
import { VideoPlayer } from '@/components/VideoPlayer';

export default function InvestorsPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-32 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6">Investor Relations</p>
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-8">
              Investor Relations
            </h1>
            <div className="accent-line mb-8" />
            <p className="text-[18px] md:text-[20px] text-txt-secondary leading-[1.7] max-w-2xl">
              Harch Corp is a privately held sovereign infrastructure company. We are not currently raising public capital.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Statement — Pattern 4: Impact Study divider */}
      <section className="py-20 md:py-28 bg-[#0F0F0F]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="border-l-2 border-[rgba(139,157,175,0.3)] pl-8 md:pl-12 mb-8 pb-8 border-b border-[rgba(255,255,255,0.04)]">
              <p className="text-[20px] md:text-[24px] text-white leading-[1.6] font-light">
                Institutional investors may request a briefing.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="space-y-6 max-w-2xl mt-8">
              <p className="text-[15px] text-txt-secondary leading-[1.8]">
                Harch Corp operates across eight verticals — intelligence, cement, energy, technology, mining, agriculture, water, and finance — with a combined investment pipeline exceeding $2.37 billion. Our vertically integrated model creates structural cost advantages that compound over time.
              </p>
              <p className="text-[15px] text-txt-secondary leading-[1.8]">
                We engage selectively with institutional partners who share our thesis: that Africa&apos;s industrial sovereignty is the defining opportunity of this decade. We do not pursue retail capital. We do not advertise returns. We build infrastructure.
              </p>
              <p className="text-[15px] text-txt-secondary leading-[1.8]">
                If your institution has the mandate and the patience to invest in sovereign infrastructure at scale, we will make time for a conversation.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Key Figures — Pattern 6: Large Stat Display */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-12">Selected Figures</p>
          </FadeIn>
          <div className="grid grid-cols-2 gap-x-12 gap-y-12 md:gap-y-16">
            {[
              { value: '$2.37B', label: 'Investment Pipeline' },
              { value: '8', label: 'Verticals' },
              { value: '5', label: 'Countries' },
              { value: '20-25%', label: 'Weighted IRR' },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08}>
                <div className="pb-8 border-b border-[rgba(255,255,255,0.04)]">
                  <p className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-white tracking-tight leading-none mb-4 stat-mono">{stat.value}</p>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-txt-dim">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Pipeline Visualization */}
      <section className="py-20 md:py-28 bg-[#0F0F0F]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Capital Allocation</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">
              Investment by Vertical
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FadeIn delay={0.15}>
              <InvestmentPipelineChart />
            </FadeIn>
            <FadeIn delay={0.25}>
              <RevenueChart />
            </FadeIn>
          </div>
          <div className="mt-6">
            <FadeIn delay={0.35}>
              <OperationalMetricsChart />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA — Pattern 7: "There is so much left to build" style */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[900px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-bold text-white tracking-tight mb-12 leading-tight">
              Ready to Build Sovereign Infrastructure?
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all"
              >
                Request Briefing <ArrowRight size={14} />
              </Link>
              <Link
                href="/trust/security"
                className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all"
              >
                View Trust Center
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Investment Thesis */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="data-label mb-6">Investment Thesis</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
              Why Harch Corp
            </h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-md bg-[rgba(74,123,95,0.15)] border border-[rgba(74,123,95,0.3)] flex items-center justify-center shrink-0 mt-1">
                  <span className="text-[#4A7B5F] text-sm font-bold">01</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white mb-2">Vertical Integration</h3>
                  <p className="text-[14px] text-[#999] leading-[1.8]">Energy powers data centers. Cement builds them. Mining supplies raw materials. Water sustains operations. Finance orchestrates capital. Every link controlled, creating 30-50% structural cost advantages.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-md bg-[rgba(139,157,175,0.15)] border border-[rgba(139,157,175,0.3)] flex items-center justify-center shrink-0 mt-1">
                  <span className="text-[#8B9DAF] text-sm font-bold">02</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white mb-2">Sovereign by Design</h3>
                  <p className="text-[14px] text-[#999] leading-[1.8]">Infrastructure that Africa owns and controls. No dependency on foreign operators. No extraction of value. Data residency, local compliance, and international standards from day one.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-md bg-[rgba(196,150,74,0.15)] border border-[rgba(196,150,74,0.3)] flex items-center justify-center shrink-0 mt-1">
                  <span className="text-[#C4964A] text-sm font-bold">03</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white mb-2">Carbon-First Strategy</h3>
                  <p className="text-[14px] text-[#999] leading-[1.8]">48.2 gCO2/kWh — 89% below industry average. Carbon-aware scheduling routes workloads to the greenest hubs in real time. No competitor offers this level of carbon optimization.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-md bg-[rgba(168,120,120,0.15)] border border-[rgba(168,120,120,0.3)] flex items-center justify-center shrink-0 mt-1">
                  <span className="text-[#A87878] text-sm font-bold">04</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white mb-2">Build One At A Time</h3>
                  <p className="text-[14px] text-[#999] leading-[1.8]">Phase 1: Harch Research (publications). Phase 2: Harch Intelligence (GPU cloud). Phase 3: Harch Energy (solar EPC). Each filiale reaches profitability before the next activates. Disciplined capital allocation.</p>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-12 flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 bg-[#0D0D0D] border border-white/[0.06] rounded-lg">
              <div className="w-full md:w-72 h-40 shrink-0">
                <VideoPlayer
                  src="/videos/v1_brand.mp4"
                  variant="modal-trigger"
                  label="Our Story — Brand Film"
                  className="w-full h-full"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2">Vision & Story</p>
                <p className="text-[15px] text-white/80 leading-relaxed">
                  Founded 2024 in Casablanca by Amine Harch El Korane with a 100-year vision: build the
                  vertically integrated industrial backbone that Africa has always deserved — one filiale
                  at a time, owned and operated by Africans. Watch the brand film.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="data-label mb-6">Key Metrics</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="fine-card p-8 rounded-lg">
                <p className="text-3xl font-extrabold text-[#8B9DAF] mb-2">$2.37B</p>
                <p className="data-label">Investment Pipeline</p>
              </div>
              <div className="fine-card p-8 rounded-lg">
                <p className="text-3xl font-extrabold text-[#4A7B5F] mb-2">24,700+</p>
                <p className="data-label">Jobs by 2030</p>
              </div>
              <div className="fine-card p-8 rounded-lg">
                <p className="text-3xl font-extrabold text-white mb-2">7</p>
                <p className="data-label">Verticals</p>
              </div>
              <div className="fine-card p-8 rounded-lg">
                <p className="text-3xl font-extrabold text-[#C4964A] mb-2">5</p>
                <p className="data-label">Countries</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-8 flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 bg-[#0F0F0F] border border-[rgba(139,157,175,0.18)] rounded-lg">
              <div className="w-full md:w-72 h-40 shrink-0">
                <VideoPlayer
                  src="/videos/v23_2_4B.mp4"
                  variant="modal-trigger"
                  label="Watch: $2.4B Pipeline (40s)"
                  className="w-full h-full"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2">Executive Video Brief</p>
                <p className="text-[15px] text-white/80 leading-relaxed">
                  $2.4B vertically integrated investment pipeline across 8 industrial verticals and 5 countries.
                  Watch the 40-second executive brief covering capital allocation, deployment phases, and the
                  Build-One-At-A-Time discipline.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ DOCUMENTS DOWNLOAD ═══ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="data-label mb-6">Documents</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Corporate Documents
            </h2>
            <p className="text-[14px] text-[#999] mb-12 max-w-2xl leading-relaxed">
              Download our corporate documents: company overview, technical datasheets,
              whitepapers, and sustainability report. All documents are confidential —
              investor edition.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Company Overview', desc: '8 subsidiaries, $2.4B pipeline, governance', pages: '29 pages', file: 'harchcorp-company-overview.pdf', accent: '#8B9DAF' },
                { name: 'Energy Datasheet', desc: '2 GW+ renewable, LCOE $14/MWh', pages: '31 pages', file: 'harch-energy-datasheet.pdf', accent: '#4A7B5F' },
                { name: 'Intelligence Datasheet', desc: '1,798 GPUs, 5 hubs, PUE <1.15', pages: '34 pages', file: 'harch-intelligence-datasheet.pdf', accent: '#5B6E80' },
                { name: 'AI Solutions Brochure', desc: 'Enterprise AI compute platform', pages: '38 pages', file: 'harch-intelligence-ai-solutions.pdf', accent: '#C4964A' },
                { name: 'GPU Compute Whitepaper', desc: 'Technical & economic analysis', pages: '40 pages', file: 'harch-intelligence-whitepaper.pdf', accent: '#A89682' },
                { name: 'Platform Whitepaper', desc: 'Sovereign AI infrastructure', pages: '40 pages', file: 'harch-platform-whitepaper.pdf', accent: '#666666' },
                { name: 'Sustainability Report', desc: 'Carbon-neutral infrastructure', pages: '44 pages', file: 'harch-sustainability-report.pdf', accent: '#6BAF6B' },
                { name: 'Research Portfolio 2026', desc: '7 dossiers synthèse + 25 graphiques', pages: '35 pages', file: 'portfolio-2026.pdf', accent: '#8B9DAF', path: '/dossiers/' },
                { name: 'Series A Pitch Deck', desc: '13 slides — $200M raise, Apple Keynote style', pages: 'PPTX', file: 'harch-corp-series-a-pitch-deck.pptx', accent: '#8B9DAF' },
              ].map((doc) => (
                <a
                  key={doc.name}
                  href={`${doc.path || '/pdfs/'}${doc.file}`}
                  download
                  className="group relative block p-5 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:bg-white/[0.04] hover:border-white/[0.15] transition-all"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-lg" style={{ background: doc.accent }} />
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: `${doc.accent}20`, border: `1px solid ${doc.accent}40` }}>
                      <svg className="w-5 h-5" fill="none" stroke={doc.accent} strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-[10px] text-[#666] font-mono uppercase tracking-wider">{doc.pages}</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-white mb-1 group-hover:text-white">{doc.name}</h4>
                  <p className="text-[11px] text-[#888] leading-snug mb-3">{doc.desc}</p>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: doc.accent }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download {doc.pages === 'PPTX' ? 'PPTX' : 'PDF'}
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-8 p-5 bg-[rgba(139,157,175,0.05)] border border-[rgba(139,157,175,0.15)] rounded-lg">
              <p className="text-[12px] text-[#999] leading-relaxed">
                <span className="font-bold text-white">Total:</span> 7 corporate documents + 1 research portfolio ·
                <span className="font-bold text-white"> 291 pages + 13-slide pitch deck</span> of analysis ·
                Confidential — Investor Edition · © 2026 Harch Corp
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Research Portal CTA */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Explore Harch Research
            </h2>
            <p className="text-[15px] text-[#999] mb-10 max-w-xl mx-auto leading-relaxed">
              7 open data investment dossiers on Morocco and Africa business opportunities.
              309 pages of analysis with financial models, public subsidies, and execution plans.
              Free download.
            </p>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#8B9DAF] text-[#0D0D0D] font-bold text-[14px] rounded-md hover:bg-white transition-all hover:scale-105"
            >
              Browse Research Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
