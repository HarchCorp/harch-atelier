'use client';

import Link from 'next/link';
import { FadeIn, CountUp } from '@/components/ui/motion';
import { ArrowRight, Download, TrendingUp, MapPin, Building2, DollarSign } from 'lucide-react';
import { VideoPlayer, VideoBadge } from '@/components/VideoPlayer';

const subsidiaries = [
  { name: 'Harch Intelligence', sector: 'AI Infrastructure', capex: '$1.14B', revenue2030: '$285M', irr: '24.7%', phase: 'Phase 1-3', accent: '#8B9DAF', video: '/videos/v4_intelligence.mp4' },
  { name: 'Harch Energy', sector: 'Renewable Energy', capex: '$680M', revenue2030: '$185M', irr: '22%', phase: 'Phase 1-3', accent: '#4A7B5F', video: '/videos/v5_energy.mp4' },
  { name: 'Harch Mining', sector: 'Strategic Minerals', capex: '$220M', revenue2030: '$45M', irr: '18%', phase: 'Phase 2-4', accent: '#A87878', video: '/videos/v6_mining.mp4' },
  { name: 'Harch Water', sector: 'Desalination', capex: '$180M', revenue2030: '$42M', irr: '15%', phase: 'Phase 4-5', accent: '#6888A8', video: '/videos/v9_water.mp4' },
  { name: 'Harch Agri', sector: 'Smart Farming', capex: '$140M', revenue2030: '$58M', irr: '20%', phase: 'Phase 2-4', accent: '#6BAF6B', video: '/videos/v8_agri.mp4' },
  { name: 'Harch Cement', sector: 'Materials', capex: '$95M', revenue2030: '$32M', irr: '16%', phase: 'Phase 1-2', accent: '#A08878', video: '/videos/v7_cement.mp4' },
  { name: 'Harch Technology', sector: 'Platform & Software', capex: '$45M', revenue2030: '$28M', irr: '35%', phase: 'Phase 1-3', accent: '#7888A8', video: '/videos/v10_technology.mp4' },
  { name: 'Harch Finance', sector: 'Capital Structure', capex: '$20M', revenue2030: 'N/A', irr: 'N/A', phase: 'Permanent', accent: '#C4964A', video: '/videos/v11_finance.mp4' },
];

const phases = [
  { phase: 'Phase 1', period: '2024-2025', focus: 'Foundation', capex: '$420M', subs: 'Intelligence + Energy + Cement' },
  { phase: 'Phase 2', period: '2026-2027', focus: 'Scale Digital + Agri', capex: '$380M', subs: 'Mining + Agri + Technology' },
  { phase: 'Phase 3', period: '2028', focus: 'AI Scale-up', capex: '$450M', subs: 'Intelligence scale + Energy ext.' },
  { phase: 'Phase 4', period: '2029', focus: 'Water + Agri ext.', capex: '$320M', subs: 'Water + Agri expansion' },
  { phase: 'Phase 5', period: '2030', focus: 'Build-out Final', capex: '$650M', subs: 'Full build-out' },
  { phase: 'Phase 6+', period: '2031+', focus: 'Maturity + Expansion', capex: '$300M', subs: 'Maintenance + new markets' },
];

const capitalStructure = [
  { source: 'Equity Harch Corp', amount: '$580M', pct: 23, cost: '15% PE' },
  { source: 'Subventions publiques', amount: '$420M', pct: 17, cost: '0% (non-remboursable)' },
  { source: 'Dette projet banques', amount: '$750M', pct: 30, cost: '4.5-6%' },
  { source: 'Dette aidée (Tamwilcom)', amount: '$300M', pct: 12, cost: '2-4%' },
  { source: 'Series A (T1 2029)', amount: '$200M', pct: 8, cost: 'Equity 25%' },
  { source: 'Series B (2031)', amount: '$150M', pct: 6, cost: 'Equity 30%' },
  { source: 'PPP gouvernementaux', amount: '$120M', pct: 5, cost: 'Concessions 25 ans' },
];

export default function InvestorsPortfolioClient() {
  return (
    <div className="bg-[#0D0D0D] min-h-screen pt-14">
      {/* HERO */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-[#0D0D0D] via-[#0F0F0F] to-[#0D0D0D] border-b border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6">Investment Portfolio</p>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              8 Subsidiaries.<br />
              <span className="text-[#8B9DAF]">$2.4B</span> Pipeline.
            </h1>
            <p className="text-[18px] text-[#999] max-w-2xl leading-relaxed mb-10">
              A vertically integrated sovereign infrastructure portfolio across 5 countries.
              Build One At A Time deployment strategy, 2024-2030.
            </p>

            {/* Key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
              {[
                { label: 'Total CAPEX', value: '$2.52B', icon: DollarSign },
                { label: 'Subsidiaries', value: '8', icon: Building2 },
                { label: 'Countries', value: '5', icon: MapPin },
                { label: 'Blended IRR', value: '20-30%', icon: TrendingUp },
              ].map((m) => (
                <div key={m.label} className="border border-white/[0.06] rounded-lg p-5 bg-white/[0.02]">
                  <m.icon className="w-5 h-5 text-[#8B9DAF] mb-3" />
                  <p className="text-2xl font-extrabold text-white">{m.value}</p>
                  <p className="text-[11px] text-[#666] uppercase tracking-wider mt-1">{m.label}</p>
                </div>
              ))}
            </div>

            <FadeIn delay={0.3}>
              <div className="mt-10 flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 bg-[#0F0F0F] border border-[rgba(139,157,175,0.18)] rounded-lg max-w-3xl">
                <div className="w-full md:w-64 h-36 shrink-0">
                  <VideoPlayer
                    src="/videos/v1_brand.mp4"
                    variant="modal-trigger"
                    label="Watch: Harch Corp Brand Film"
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2">Our Story</p>
                  <p className="text-[15px] text-white/80 leading-relaxed">
                    Founded 2024 in Casablanca. A 100-year vision: build Africa&apos;s vertically integrated
                    industrial backbone — one filiale at a time. Watch the brand film to understand the trajectory.
                  </p>
                </div>
              </div>
            </FadeIn>
          </FadeIn>
        </div>
      </section>

      {/* SUBSIDIARIES BREAKDOWN */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Capital Allocation</p>
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold text-white tracking-tight mb-4">
              8 Subsidiaries — CAPEX & Returns
            </h2>
            <p className="text-[14px] text-[#999] mb-12 max-w-2xl leading-relaxed">
              Each subsidiary operates independently but contributes to the vertically integrated ecosystem.
              Capital allocation prioritizes high-IRR, short-payback subsidiaries first.
            </p>
          </FadeIn>

          <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] border-b border-white/[0.06]">
                <tr>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#666] uppercase tracking-wider">Subsidiary</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#666] uppercase tracking-wider">Sector</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#666] uppercase tracking-wider">CAPEX</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#666] uppercase tracking-wider">Revenue 2030</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#666] uppercase tracking-wider">IRR</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#666] uppercase tracking-wider">Phase</th>
                </tr>
              </thead>
              <tbody>
                {subsidiaries.map((s, i) => (
                  <tr key={s.name} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 rounded-full" style={{ background: s.accent }} />
                        <div>
                          <span className="text-[13px] font-bold text-white block">{s.name}</span>
                          <VideoBadge src={s.video} label="Teaser (40s)" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[12px] text-[#999]">{s.sector}</td>
                    <td className="px-5 py-4 text-[13px] font-mono text-white">{s.capex}</td>
                    <td className="px-5 py-4 text-[13px] font-mono text-[#8B9DAF]">{s.revenue2030}</td>
                    <td className="px-5 py-4 text-[13px] font-mono text-white">{s.irr}</td>
                    <td className="px-5 py-4 text-[11px] text-[#666] font-mono">{s.phase}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-white/[0.03] border-t-2 border-white/[0.1]">
                <tr>
                  <td className="px-5 py-4 text-[13px] font-bold text-white" colSpan={2}>TOTAL PORTFOLIO</td>
                  <td className="px-5 py-4 text-[13px] font-mono font-bold text-white">$2.52B</td>
                  <td className="px-5 py-4 text-[13px] font-mono font-bold text-[#8B9DAF]">$675M</td>
                  <td className="px-5 py-4 text-[13px] font-mono font-bold text-white">20-30%</td>
                  <td className="px-5 py-4 text-[11px] text-[#666]">2024-2030</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* DEPLOYMENT PHASES */}
      <section className="py-20 md:py-28 bg-[#0F0F0F]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Build One At A Time</p>
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold text-white tracking-tight mb-4">
              6 Phases — 2024 to 2030+
            </h2>
            <p className="text-[14px] text-[#999] mb-12 max-w-2xl leading-relaxed">
              Sequential deployment by phase. Each phase activates when (i) regulatory framework is favorable,
              (ii) market is mature, (iii) public subsidies maximize leverage, (iv) founding team is recruited.
            </p>
          </FadeIn>

          <div className="space-y-3">
            {phases.map((p, i) => (
              <FadeIn key={p.phase} delay={i * 0.05}>
                <div className="grid grid-cols-12 gap-4 p-5 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:bg-white/[0.03] transition-colors">
                  <div className="col-span-12 md:col-span-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#8B9DAF]/10 border border-[#8B9DAF]/30 flex items-center justify-center">
                      <span className="text-[11px] font-mono text-[#8B9DAF]">{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-white">{p.phase}</p>
                      <p className="text-[10px] text-[#666] font-mono">{p.period}</p>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-3 flex items-center">
                    <p className="text-[13px] text-white">{p.focus}</p>
                  </div>
                  <div className="col-span-12 md:col-span-5 flex items-center">
                    <p className="text-[12px] text-[#999]">{p.subs}</p>
                  </div>
                  <div className="col-span-12 md:col-span-2 flex items-center justify-end">
                    <p className="text-[14px] font-mono font-bold text-[#8B9DAF]">{p.capex}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CAPITAL STRUCTURE */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Financing Structure</p>
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold text-white tracking-tight mb-4">
              Capital Sources — WACC 5.8%
            </h2>
            <p className="text-[14px] text-[#999] mb-12 max-w-2xl leading-relaxed">
              Diversified financing with strong public subsidy leverage (17% of CAPEX non-dilutive).
              Series A planned Q1 2029, Series B 2031.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FadeIn>
              <div className="space-y-3">
                {capitalStructure.map((c, i) => (
                  <div key={c.source} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] text-white font-medium">{c.source}</span>
                      <span className="text-[13px] font-mono text-[#8B9DAF]">{c.amount}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full bg-[#8B9DAF] rounded-full" style={{ width: `${c.pct * 4}%` }} />
                      </div>
                      <span className="text-[11px] text-[#666] font-mono w-12 text-right">{c.pct}%</span>
                    </div>
                    <p className="text-[10px] text-[#555] mt-1.5">{c.cost}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="p-8 bg-gradient-to-br from-[#1a1f2e] via-[#161616] to-[#0D0D0D] rounded-lg border border-[#8B9DAF]/20 h-full flex flex-col justify-center">
                <p className="text-[10px] text-[#666] uppercase tracking-wider mb-3">Blended WACC</p>
                <p className="text-6xl font-extrabold text-white mb-2">
                  <CountUp to={5.8} decimals={1} suffix="%" />
                </p>
                <p className="text-[12px] text-[#999] mb-8">
                  vs 8-12% standalone subsidiaries — diversification + subsidies effect
                </p>

                <div className="space-y-3">
                  {[
                    { label: 'Equity Harch Corp', value: '33%' },
                    { label: 'Subventions (non-dilutive)', value: '17%' },
                    { label: 'Dette (projet + aidée)', value: '42%' },
                    { label: 'Series A + B (PE externe)', value: '14%' },
                    { label: 'PPP gouvernementaux', value: '5%' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                      <span className="text-[12px] text-[#999]">{item.label}</span>
                      <span className="text-[12px] font-mono text-white">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/[0.06]">
                  <p className="text-[10px] text-[#666] uppercase tracking-wider mb-2">Spread vs WACC</p>
                  <p className="text-3xl font-extrabold text-[#4A7B5F]">+14-24 pts</p>
                  <p className="text-[11px] text-[#666] mt-1">Portfolio IRR (20-30%) vs WACC (5.8%)</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* DOWNLOAD CTA */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <div className="w-14 h-14 mx-auto rounded-xl bg-[rgba(139,157,175,0.1)] border border-[rgba(139,157,175,0.2)] flex items-center justify-center mb-8">
              <Download className="w-7 h-7 text-[#8B9DAF]" />
            </div>
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold text-white mb-4 tracking-tight">
              Download Full Company Overview
            </h2>
            <p className="text-[15px] text-[#999] mb-10 max-w-xl mx-auto leading-relaxed">
              31-page PDF with detailed capital allocation, deployment timeline, and risk analysis.
              Confidential — Investor Edition.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="/pdfs/harchcorp-company-overview.pdf"
                download
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#8B9DAF] text-[#0D0D0D] font-bold text-[14px] rounded-md hover:bg-white transition-all hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Company Overview PDF
              </a>
              <Link
                href="/investors"
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/12 text-white font-bold text-[14px] rounded-md hover:border-white/25 hover:bg-white/[0.04] transition-all"
              >
                Back to Investors
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
