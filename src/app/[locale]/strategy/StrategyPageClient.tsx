'use client';

import Link from 'next/link';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CountUp,
  SectionDivider,
  Card3D,
} from '@/components/ui/motion';
import {
  ArrowRight,
  Cpu,
  Factory,
  Zap,
  Shield,
  Mountain,
  Wheat,
  Droplets,
  Banknote,
  ArrowDownRight,
  ArrowUpRight,
  Globe,
  Flag,
  Calendar,
  CheckCircle2,
  Circle,
  Lock,
} from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const heroStats = [
  { value: 2.4, label: '$B Pipeline', suffix: '', decimals: 1 },
  { value: 5.8, label: '% WACC', suffix: '', decimals: 1 },
  { value: 8, label: 'Filiales Planned', suffix: '' },
  { value: 25, label: '% Target IRR', suffix: '' },
];

const phases = [
  {
    phase: '01',
    period: '2026-2027',
    title: 'Harch Research',
    status: 'Active',
    desc: 'Think tank, analytical publications, newsletter, consulting. Establishing the brand and the analytical foundation. First revenue target.',
    capex: '$2M',
    milestone: 'First paying consulting client',
  },
  {
    phase: '02',
    period: '2028-2030',
    title: 'Harch Intelligence',
    status: 'Planned',
    desc: 'Carbon-aware GPU cloud in reseller + orchestration mode. 1,798 GPUs across 5 Moroccan hubs. First paying customers.',
    capex: '$780M',
    milestone: 'Series A 2029',
  },
  {
    phase: '03',
    period: '2030-2033',
    title: 'Harch Energy',
    status: 'Planned',
    desc: 'Solar EPC B2B operations. 2GW+ renewable pipeline. Loi 82-21 effective June 2026. Powering internal + external customers.',
    capex: '$580M',
    milestone: 'ONSSA validation 2031',
  },
  {
    phase: '04',
    period: '2031-2034',
    title: 'Harch Cement',
    status: 'Planned',
    desc: '500kT/yr cement production in Gambia. Vertically integrated from quarry to delivery. West Africa construction boom.',
    capex: '$195M',
    milestone: 'First kiln operational 2032',
  },
  {
    phase: '05',
    period: '2033-2036',
    title: 'Harch Mining',
    status: 'Planned',
    desc: 'Strategic minerals — phosphates, cobalt, rare earths. In-country processing to capture the value chain.',
    capex: '$195M',
    milestone: 'First export-grade refined batch 2034',
  },
  {
    phase: '06',
    period: '2036-2040',
    title: 'Harch Agri + Water',
    status: 'Vision',
    desc: 'Precision agriculture, vertical farming, 200M m³/yr desalination. Food + water sovereignty at continental scale.',
    capex: '$290M',
    milestone: '200M m³/yr capacity 2038',
  },
];

const subsidiaries = [
  { icon: Cpu, name: 'Harch Intelligence', version: '/0.1', investment: '$780M', desc: '1,798 GPU carbon-aware data center platform across Morocco.', href: '/subsidiaries/intelligence' },
  { icon: Factory, name: 'Harch Cement', version: '/0.2', investment: '$195M', desc: '500kT/yr cement production in Gambia for West Africa.', href: '/subsidiaries/cement' },
  { icon: Zap, name: 'Harch Energy', version: '/0.3', investment: '$580M', desc: '2GW+ renewable pipeline: solar, wind, green hydrogen.', href: '/subsidiaries/energy' },
  { icon: Shield, name: 'Harch Technology', version: '/0.4', investment: '$390M', desc: 'Sovereign tech stack: AI platforms, cybersecurity, satellite comms.', href: '/subsidiaries/technology' },
  { icon: Mountain, name: 'Harch Mining', version: '/0.5', investment: '$195M', desc: 'Phosphates, cobalt, rare earths. In-country processing.', href: '/subsidiaries/mining' },
  { icon: Wheat, name: 'Harch Agri', version: '/0.6', investment: '$145M', desc: 'Precision agriculture and vertical farming at scale.', href: '/subsidiaries/agriculture' },
  { icon: Droplets, name: 'Harch Water', version: '/0.7', investment: '$145M', desc: '200M m³/yr desalination with AI-optimized distribution.', href: '/subsidiaries/water' },
  { icon: Banknote, name: 'Harch Finance', version: '/0.8', investment: 'TBD', desc: 'Sovereign capital orchestration. Internal treasury + external LP.', href: '/subsidiaries/finance' },
];

const capitalAllocation = [
  { vertical: 'Harch Intelligence', amount: 780, pct: 33, color: '#8B9DAF' },
  { vertical: 'Harch Energy', amount: 580, pct: 24, color: '#4A7B5F' },
  { vertical: 'Harch Technology', amount: 390, pct: 16, color: '#C4964A' },
  { vertical: 'Harch Cement', amount: 195, pct: 8, color: '#A87878' },
  { vertical: 'Harch Mining', amount: 195, pct: 8, color: '#6888A8' },
  { vertical: 'Harch Agri', amount: 145, pct: 6, color: '#6BAF6B' },
  { vertical: 'Harch Water', amount: 145, pct: 6, color: '#666666' },
];

const integrationFlows = [
  { from: 'Harch Energy', to: 'Harch Intelligence', flow: 'Zero-carbon electricity → GPU hubs', value: '$0.02/kWh' },
  { from: 'Harch Mining', to: 'Harch Technology', flow: 'Refined minerals → components', value: 'In-country' },
  { from: 'Harch Water', to: 'Harch Cement', flow: 'Desalinated water → cement plant', value: '200M m³/yr' },
  { from: 'Harch Energy', to: 'Harch Cement', flow: 'Solar power → kiln operations', value: '-40% cost' },
  { from: 'Harch Intelligence', to: 'All Filiales', flow: 'AI optimization → operations', value: 'HarchOS' },
  { from: 'Harch Finance', to: 'All Filiales', flow: 'Capital orchestration → deployment', value: '5.8% WACC' },
];

const geographicFootprint = [
  { country: 'Morocco', role: 'Headquarters + GPU hubs + Energy', status: 'Active', flag: 'MA' },
  { country: 'Gambia', role: 'Cement production — 500kT/yr', status: 'Planned', flag: 'GM' },
  { country: 'Senegal', role: 'West Africa expansion — energy + agri', status: 'Vision', flag: 'SN' },
  { country: 'Mauritania', role: 'Mining — iron ore, rare earths', status: 'Vision', flag: 'MR' },
  { country: 'Côte d\'Ivoire', role: 'West Africa logistics hub', status: 'Vision', flag: 'CI' },
];

const criticalMilestones = [
  { date: '2026', title: 'Harch Research Phase 1 Launch', status: 'Planned', desc: 'First revenue-generating filiale.' },
  { date: '2027', title: 'Public Site & Build-in-Public Dashboard', status: 'Planned', desc: 'Live metrics published.' },
  { date: '2029', title: 'Series A — Harch Intelligence', status: 'Planned', desc: 'Capital raise for GPU hub buildout.' },
  { date: '2031', title: 'ONSSA Validation — Energy Operations', status: 'Planned', desc: 'Regulatory clearance for solar EPC.' },
  { date: '2032', title: 'First Kiln Operational — Banjul', status: 'Planned', desc: 'Cement plant reaches capacity.' },
  { date: '2033', title: '5 Filiales Active', status: 'Planned', desc: 'Half of the vertical strategy live.' },
  { date: '2035', title: 'Continental Expansion Begins', status: 'Vision', desc: 'Operations beyond Morocco.' },
  { date: '2040', title: '8 Filiales, $680M Revenue Target', status: 'Vision', desc: 'Full vertical strategy operational.' },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function StrategyPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 data-grid-pattern opacity-20" />
        <div className="absolute top-0 right-1/4 w-[700px] h-[500px] bg-[#8B9DAF]/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6">Strategy /0.0</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[88px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              Build One<br />At A Time<span className="text-[#8B9DAF]">.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-4">
              The operator model. One filiale. One profit milestone. One activation at a time.
            </p>
            <p className="text-[15px] text-[#999999] max-w-xl leading-[1.7]">
              Harch Corp deploys $2.4B across 8 vertically integrated subsidiaries between 2026 and 2040. No filiale launches until the previous one reaches profitability. Disciplined capital allocation, structural cost advantages, sovereign by design.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-16 bg-white/[0.06] border border-white/[0.06] rounded-lg overflow-hidden">
              {heroStats.map((stat) => (
                <div key={stat.label} className="bg-[#0D0D0D] p-6 md:p-8">
                  <p className="text-3xl md:text-4xl font-extrabold text-white stat-mono mb-2">
                    <CountUp to={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} duration={2} />
                  </p>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666]">{stat.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="mt-10 flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 bg-[#0F0F0F] border border-[rgba(139,157,175,0.18)] rounded-lg max-w-3xl">
              <div className="w-full md:w-72 h-40 shrink-0">
                <VideoPlayer
                  src="/videos/v2_build_one.mp4"
                  variant="modal-trigger"
                  label="Watch: Build One At A Time (40s)"
                  className="w-full h-full"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2">Operator Doctrine</p>
                <p className="text-[15px] text-white/80 leading-relaxed">
                  The operator model. One filiale. One profit milestone. One activation at a time.
                  No filiale launches until the previous one reaches profitability. Watch the 40-second brief.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ 6 PHASES TIMELINE ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Deployment Phases</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              6 Phases. 2026 — 2040.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Each phase is a filiale activation. Each activation has a capital commitment, a revenue target, and a profitability milestone. No phase begins until the previous one is on track.
            </p>
          </FadeIn>
          <StaggerContainer staggerDelay={0.08} className="space-y-4">
            {phases.map((phase) => (
              <StaggerItem key={phase.phase}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 md:p-8 hover:border-[#8B9DAF]/20 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 md:gap-8 items-start">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-extrabold text-[#8B9DAF]/40 stat-mono">{phase.phase}</span>
                      <div>
                        <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666] font-[family-name:var(--font-space-mono)]">{phase.period}</p>
                        <h3 className="text-xl font-bold text-white">{phase.title}</h3>
                      </div>
                    </div>
                    <div>
                      <p className="text-[14px] text-[#999999] leading-[1.7] mb-3">{phase.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-[rgba(255,255,255,0.04)] text-[11px] font-semibold text-[#999999]">CAPEX: {phase.capex}</span>
                        <span className="px-2.5 py-1 rounded-md bg-[rgba(139,157,175,0.08)] text-[11px] font-semibold text-[#8B9DAF]">Milestone: {phase.milestone}</span>
                      </div>
                    </div>
                    <div className="md:text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.1em] uppercase ${
                        phase.status === 'Active' ? 'bg-[rgba(74,123,95,0.15)] text-[#4A7B5F]' :
                        phase.status === 'Planned' ? 'bg-[rgba(139,157,175,0.15)] text-[#8B9DAF]' :
                        'bg-[rgba(255,255,255,0.05)] text-[#666666]'
                      }`}>
                        {phase.status}
                      </span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ 8 SUBSIDIARIES ═══════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Eight Subsidiaries</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              The Vertical Stack.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Each filiale is designed to reinforce the others — creating a self-reinforcing industrial ecosystem where each vertical strengthens the next.
            </p>
          </FadeIn>
          <StaggerContainer staggerDelay={0.06} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subsidiaries.map((sub) => (
              <StaggerItem key={sub.name}>
                <Link href={sub.href} className="block bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 h-full hover:border-[#8B9DAF]/20 hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[#8B9DAF]/15 flex items-center justify-center">
                      <sub.icon size={18} className="text-[#8B9DAF]" strokeWidth={1.5} />
                    </div>
                    <span className="version-tag">{sub.version}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#CCCCCC] transition-colors">{sub.name}</h3>
                  <p className="text-[12px] text-[#8B9DAF] font-bold mb-3 font-[family-name:var(--font-space-mono)]">{sub.investment}</p>
                  <p className="text-[13px] text-[#999999] leading-[1.6]">{sub.desc}</p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <SectionDivider className="max-w-[1400px] mx-auto" />

      {/* ═══════ ALLOCATION DU CAPITAL ═══════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Capital Allocation</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              $2.4B Pipeline.<br />5.8% WACC.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Capital is allocated by phase, not by aspiration. Each filiale receives a defined capex envelope, with deployment gated by the profitability milestone of the previous phase.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Capital bar chart */}
            <FadeIn delay={0.1}>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-8">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#666666] mb-6">Allocation by Vertical ($M)</p>
                <div className="space-y-4">
                  {capitalAllocation.map((item) => (
                    <div key={item.vertical}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] text-white font-semibold">{item.vertical}</span>
                        <span className="text-[13px] text-[#999999] font-[family-name:var(--font-space-mono)]">${item.amount}M · {item.pct}%</span>
                      </div>
                      <div className="h-2 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${item.pct * 3}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">Total Pipeline</span>
                  <span className="text-2xl font-extrabold text-white stat-mono">$2,430M</span>
                </div>
              </div>
            </FadeIn>

            {/* WACC breakdown */}
            <FadeIn delay={0.2}>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-8 h-full">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#666666] mb-6">Cost of Capital Structure</p>
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                    <div>
                      <p className="text-[14px] font-bold text-white">Weighted Avg Cost of Capital</p>
                      <p className="text-[12px] text-[#999999]">Blended across filiales + geographies</p>
                    </div>
                    <p className="text-3xl font-extrabold text-[#8B9DAF] stat-mono">5.8%</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] text-[#666666] uppercase tracking-[0.1em] font-bold mb-1">Target IRR</p>
                      <p className="text-xl font-bold text-white stat-mono">20-25%</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#666666] uppercase tracking-[0.1em] font-bold mb-1">Equity Multiple</p>
                      <p className="text-xl font-bold text-white stat-mono">3.2x</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#666666] uppercase tracking-[0.1em] font-bold mb-1">Payback Period</p>
                      <p className="text-xl font-bold text-white stat-mono">5.4 yrs</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#666666] uppercase tracking-[0.1em] font-bold mb-1">Debt / Equity</p>
                      <p className="text-xl font-bold text-white stat-mono">35 / 65</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/[0.06]">
                    <p className="text-[11px] text-[#666666] uppercase tracking-[0.1em] font-bold mb-2">Capital Sources</p>
                    <div className="space-y-2">
                      {[
                        { src: 'Founder capital', pct: 5 },
                        { src: 'Series A (2029)', pct: 15 },
                        { src: 'Strategic LPs', pct: 35 },
                        { src: 'Sovereign funds', pct: 25 },
                        { src: 'Debt financing', pct: 20 },
                      ].map((src) => (
                        <div key={src.src} className="flex items-center justify-between text-[13px]">
                          <span className="text-[#CCCCCC]">{src.src}</span>
                          <span className="text-white font-[family-name:var(--font-space-mono)]">{src.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ INTÉGRATION VERTICALE ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Vertical Integration</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Inter-Filiale Flows.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              The structural cost advantage of Harch Corp comes from inter-filiale flows — energy, materials, water, AI optimization, and capital moving inside the group at internal transfer prices, not market prices.
            </p>
          </FadeIn>
          <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrationFlows.map((flow) => (
              <StaggerItem key={flow.from + flow.to}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-5 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-[rgba(139,157,175,0.08)] text-[11px] font-bold text-[#8B9DAF]">{flow.from}</span>
                    <ArrowRight size={14} className="text-[#666666]" />
                    <span className="px-2.5 py-1 rounded-md bg-[rgba(139,157,175,0.08)] text-[11px] font-bold text-[#8B9DAF]">{flow.to}</span>
                  </div>
                  <p className="text-[13px] text-[#CCCCCC] mb-2">{flow.flow}</p>
                  <p className="text-[11px] text-[#4A7B5F] font-[family-name:var(--font-space-mono)] font-bold">{flow.value}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ GEOGRAPHIC FOOTPRINT ═══════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Geographic Footprint</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Morocco + 4 Countries.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Anchored in Morocco. Expanding into West Africa on a phased timeline — each country entered only when the operational groundwork is in place.
            </p>
          </FadeIn>
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {geographicFootprint.map((geo) => (
              <StaggerItem key={geo.country}>
                <Card3D className="p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold text-[#8B9DAF]/40 stat-mono">{geo.flag}</span>
                    {geo.status === 'Active' ? (
                      <CheckCircle2 size={16} className="text-[#4A7B5F]" />
                    ) : (
                      <Circle size={16} className="text-[#666666]" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{geo.country}</h3>
                  <p className="text-[12px] text-[#999999] leading-[1.6] mb-3">{geo.role}</p>
                  <span className={`text-[10px] font-bold tracking-[0.1em] uppercase ${
                    geo.status === 'Active' ? 'text-[#4A7B5F]' : 'text-[#666666]'
                  }`}>
                    {geo.status}
                  </span>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ JALONS CRITIQUES ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Critical Milestones</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              What Must Happen.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Eight non-negotiable milestones between 2026 and 2040. Each one a gate — failing to hit it delays the next phase, not the next press release.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalMilestones.map((m, i) => (
              <FadeIn key={m.title} delay={i * 0.05}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-5 flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-[rgba(139,157,175,0.06)] border border-[#8B9DAF]/15 flex flex-col items-center justify-center">
                    <Calendar size={14} className="text-[#8B9DAF] mb-0.5" />
                    <span className="text-[10px] font-bold text-[#8B9DAF] font-[family-name:var(--font-space-mono)]">{m.date}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[15px] font-bold text-white">{m.title}</h3>
                      <span className={`text-[9px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 rounded ${
                        m.status === 'Planned' ? 'bg-[rgba(139,157,175,0.1)] text-[#8B9DAF]' :
                        'bg-[rgba(255,255,255,0.05)] text-[#666666]'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#999999] leading-[1.6]">{m.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 data-grid-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <Lock className="mx-auto mb-6 text-[#8B9DAF]" size={32} strokeWidth={1.5} />
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] mb-6">
              The Strategy is Clear.
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/40 leading-relaxed mb-12">
              Institutional investors may request a briefing. We engage selectively with partners who share our conviction — and our patience.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/investors" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Investor Briefing <ArrowRight size={14} />
              </Link>
              <Link href="/thesis" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Read the Thesis
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
