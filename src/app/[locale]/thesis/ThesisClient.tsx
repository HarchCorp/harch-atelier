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
  Shield,
  Zap,
  Layers,
  Globe,
  Award,
  Leaf,
  TrendingUp,
  Building2,
  Users,
  Scale,
  Target,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const heroStats = [
  { value: 2.4, label: '$B Pipeline', suffix: '', decimals: 1 },
  { value: 25, label: '% Target IRR', suffix: '' },
  { value: 3200, label: 'Jobs by 2030', suffix: '+' },
  { value: 89, label: '% Below Industry Carbon', suffix: '' },
];

const africaChallenge = [
  { stat: '30%', label: 'of global mineral reserves', desc: 'Yet Africa captures <5% of the value chain.' },
  { stat: '60%', label: 'of uncultivated arable land', desc: 'But imports $35B in food annually.' },
  { stat: '40%', label: 'of global solar radiation', desc: 'Generates <2% of solar electricity.' },
  { stat: '400M', label: 'Africans lack clean water', desc: 'Despite vast aquifer systems.' },
  { stat: '95%', label: 'AI compute in US + China', desc: 'Africa controls <1% of GPU capacity.' },
  { stat: '1.4B', label: 'population, median age 19', desc: 'Largest untapped workforce on Earth.' },
];

const moroccoCatalysts = [
  {
    icon: Scale,
    title: 'Regulatory',
    tag: 'Catalyst 01',
    desc: 'Loi 82-21 effective June 2026 — autoconsommation solaire for PMEs. DSP- aligned data residency. Free Zone regimes (Tanger Med, Midparc, AFZ) with 0% IS for 5 years. Green hydrogen framework law 99-21.',
  },
  {
    icon: Globe,
    title: 'Geography',
    tag: 'Catalyst 02',
    desc: '14km from Europe at Gibraltar. Submarine cable connectivity (2Africa, Equiano, Medusa) directly to European internet backbone. World-class solar irradiance (5.5 kWh/m²/day average). Wind resources on Atlantic coast (Dakhla 9 m/s average).',
  },
  {
    icon: Users,
    title: 'Talents',
    tag: 'Catalyst 03',
    desc: '3,500 engineering graduates per year from Moroccan universities. Casablanca Finance City — 3,000+ international finance professionals. French/English/Arabic trilingual talent pool. Lower engineering cost than Europe/US (40-60%).',
  },
  {
    icon: Award,
    title: 'Aides & Incentives',
    tag: 'Catalyst 04',
    desc: 'CDG Capital sovereign fund co-investment. Maroc PME programs. Casablanca Finance City Authority tax incentives. Green Economy Fund (FGE) by Bank Al-Maghrib. Total available incentive stack: 15-30% of capex.',
  },
];

const moats = [
  {
    icon: Zap,
    title: 'Energy Cost Advantage',
    tag: 'Moat 01',
    desc: '$0.02/kWh renewable electricity vs $0.08-0.12/kWh grid in Europe. 75% lower energy cost basis. Compounds across every filiale — data centers, cement, mining, desalination.',
  },
  {
    icon: Layers,
    title: 'Vertical Integration',
    tag: 'Moat 02',
    desc: '8 filiales feeding each other at internal transfer prices. 30-50% structural cost advantage vs standalone operators. Impossible to replicate without building the full stack.',
  },
  {
    icon: Globe,
    title: 'Geographic Position',
    tag: 'Moat 03',
    desc: 'Morocco = the only African country with submarine cable connectivity to both Europe and the Americas. 14km from Europe. First-mover on sovereign AI compute for 1.4B Africans.',
  },
  {
    icon: Shield,
    title: 'Sovereign Tech Stack',
    tag: 'Moat 04',
    desc: 'HarchOS — proprietary carbon-aware scheduler, sovereign identity, hardware-rooted attestation. 5-year engineering lead. Cannot be cloned by hyperscalers without sovereign infrastructure.',
  },
  {
    icon: Award,
    title: 'Brand & Trust',
    tag: 'Moat 05',
    desc: 'Build in Public methodology. Live operational dashboard. Honest failure reporting. The only African infrastructure brand with verifiable transparency — government and sovereign fund credibility.',
  },
];

const benchmarkComparison = [
  { feature: 'GPU Price (H100/hr)', harch: '$2.10', aws: '$3.40', gcp: '$3.67', azure: '$3.40' },
  { feature: 'Carbon Intensity (gCO₂/kWh)', harch: '48.2', aws: '440', gcp: '470', azure: '520' },
  { feature: 'Renewable Mix', harch: '89%', aws: '65%', gcp: '67%', azure: '60%' },
  { feature: 'Data Residency', harch: 'Sovereign (MA)', aws: 'Foreign', gcp: 'Foreign', azure: 'Foreign' },
  { feature: 'Submarine Cable Hops to EU', harch: '1', aws: '4-6', gcp: '4-6', azure: '4-6' },
  { feature: 'Air-Gapped Tier', harch: 'Yes', aws: 'No', gcp: 'No', azure: 'No' },
  { feature: 'Carbon-Aware Scheduler', harch: 'Native', aws: 'Add-on', gcp: 'Add-on', azure: 'No' },
  { feature: 'OpenAI-Compatible API', harch: 'Yes', aws: 'Via Bedrock', gcp: 'Via Vertex', azure: 'Via OpenAI' },
];

const esgMetrics = [
  { icon: Leaf, value: '2030', label: 'Net-Zero Target', desc: 'Across all active filiales — 20 years ahead of Paris Agreement.' },
  { icon: TrendingUp, value: '3,200+', label: 'Jobs by 2030', desc: 'Across 5 filiales. 70% locally hired. 30% women target.' },
  { icon: Building2, value: '48.2', label: 'gCO₂/kWh Avg', desc: '89% below hyperscaler average. Carbon-aware by architecture.' },
  { icon: Users, value: '5', label: 'Countries by 2030', desc: 'Morocco, Gambia, Senegal, Mauritania, Côte d\'Ivoire.' },
];

const returnsProjection = [
  { year: '2027', revenue: 2, ebitda: -3, status: 'Phase 1' },
  { year: '2028', revenue: 8, ebitda: 1, status: 'Phase 2 launch' },
  { year: '2029', revenue: 28, ebitda: 7, status: 'Series A' },
  { year: '2030', revenue: 680, ebitda: 215, status: 'Phase 3' },
  { year: '2032', revenue: 1240, ebitda: 410, status: 'Phase 4' },
  { year: '2035', revenue: 2100, ebitda: 720, status: 'Continental' },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function ThesisClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 data-grid-pattern opacity-20" />
        <div className="absolute top-0 left-1/4 w-[700px] h-[500px] bg-[#8B9DAF]/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6">Investment Thesis</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[88px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              Why Harch Corp<span className="text-[#8B9DAF]">.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-4">
              The defining investment opportunity of this decade: Africa&apos;s industrial sovereignty.
            </p>
            <p className="text-[15px] text-[#999999] max-w-xl leading-[1.7]">
              A $2.4B vertically integrated play across 8 filiales, anchored in Morocco, protected by 5 structural moats, and targeting 20-25% IRR over a 15-year horizon. This is the thesis.
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
                  src="/videos/v23_2_4B.mp4"
                  variant="modal-trigger"
                  label="Watch: $2.4B Pipeline (40s)"
                  className="w-full h-full"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2">Thesis in 40 Seconds</p>
                <p className="text-[15px] text-white/80 leading-relaxed">
                  The defining investment opportunity of this decade: Africa&apos;s industrial sovereignty.
                  $2.4B vertically integrated play across 8 filiales, anchored in Morocco, protected by 5
                  structural moats. Watch the 40-second brief.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ LE DÉFI AFRICAIN ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">The African Challenge</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Sovereignty Requires<br />Industrial Independence.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Political independence without industrial independence is an illusion. When a nation cannot generate its own electricity, process its own minerals, or host its own data, it remains a colony in everything but name.
            </p>
          </FadeIn>
          <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {africaChallenge.map((item) => (
              <StaggerItem key={item.label}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 h-full">
                  <p className="text-4xl font-extrabold text-[#8B9DAF] stat-mono mb-2">{item.stat}</p>
                  <p className="text-[14px] font-bold text-white mb-2">{item.label}</p>
                  <p className="text-[13px] text-[#999999] leading-[1.7]">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ 4 CATALYSEURS MAROC ═══════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Why Morocco</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Four Catalysts.<br />One Geography.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Morocco is not just where Harch Corp is headquartered — it is the only African geography where all four catalysts for sovereign infrastructure align simultaneously.
            </p>
          </FadeIn>
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {moroccoCatalysts.map((cat) => (
              <StaggerItem key={cat.title}>
                <Card3D className="p-8 h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(139,157,175,0.08)] border border-[#8B9DAF]/15 flex items-center justify-center">
                      <cat.icon size={20} className="text-[#8B9DAF]" strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] font-bold text-[#666666] font-[family-name:var(--font-space-mono)] tracking-[0.15em]">{cat.tag}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{cat.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{cat.desc}</p>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <SectionDivider className="max-w-[1400px] mx-auto" />

      {/* ═══════ 5 MOATS COMPÉTITIFS ═══════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Competitive Moats</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Five Structural Moats.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Not features. Not partnerships. Structural advantages that compound over time and cannot be cloned by capital alone.
            </p>
          </FadeIn>
          <div className="space-y-4">
            {moats.map((moat, i) => (
              <FadeIn key={moat.title} delay={i * 0.06}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 md:p-8 hover:border-[#8B9DAF]/20 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
                    <div className="flex items-center gap-5 md:w-64 shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-[rgba(139,157,175,0.08)] border border-[#8B9DAF]/15 flex items-center justify-center">
                        <moat.icon size={20} className="text-[#8B9DAF]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#666666] font-[family-name:var(--font-space-mono)] tracking-[0.15em]">{moat.tag}</span>
                        <h3 className="text-lg font-bold text-white">{moat.title}</h3>
                      </div>
                    </div>
                    <div>
                      <p className="text-[14px] text-[#999999] leading-[1.7]">{moat.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ BENCHMARKS VS CONCURRENTS ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Benchmarks</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Harch vs Hyperscalers.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Side-by-side comparison on the metrics that matter: price, carbon, sovereignty, latency, and architecture.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[rgba(255,255,255,0.02)]">
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">Feature</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#8B9DAF]">HarchOS</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">AWS</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">GCP</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">Azure</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkComparison.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? '' : 'bg-[rgba(255,255,255,0.015)]'}>
                      <td className="p-4 text-[13px] text-[#CCCCCC] font-semibold">{row.feature}</td>
                      <td className="p-4 text-[13px] text-white font-bold">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-[#4A7B5F]" />
                          {row.harch}
                        </div>
                      </td>
                      <td className="p-4 text-[13px] text-[#999999]">{row.aws}</td>
                      <td className="p-4 text-[13px] text-[#999999]">{row.gcp}</td>
                      <td className="p-4 text-[13px] text-[#999999]">{row.azure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { metric: '40-60%', label: 'Cheaper than AWS/GCP/Azure' },
                { metric: '89%', label: 'Lower carbon intensity' },
                { metric: '1 hop', label: 'To European backbone (vs 4-6)' },
              ].map((item) => (
                <div key={item.label} className="bg-[rgba(74,123,95,0.06)] border border-[rgba(74,123,95,0.2)] rounded-lg p-5">
                  <p className="text-2xl font-extrabold text-[#4A7B5F] stat-mono mb-1">{item.metric}</p>
                  <p className="text-[12px] text-[#CCCCCC]">{item.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ IMPACT ESG ═══════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#4A7B5F]">ESG Impact</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Net-Zero 2030.<br />3,200+ Jobs.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              ESG is not a reporting line — it is the operating model. Carbon-first by architecture, jobs-first by hiring, sovereign-first by design.
            </p>
          </FadeIn>
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {esgMetrics.map((metric) => (
              <StaggerItem key={metric.label}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(74,123,95,0.1)] border border-[#4A7B5F]/20 flex items-center justify-center mb-4">
                    <metric.icon size={18} className="text-[#4A7B5F]" strokeWidth={1.5} />
                  </div>
                  <p className="text-3xl font-extrabold text-white stat-mono mb-1">{metric.value}</p>
                  <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#666666] mb-2">{metric.label}</p>
                  <p className="text-[13px] text-[#999999] leading-[1.7]">{metric.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ RETURNS PROJECTION ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Returns Projection</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              $680M Revenue 2030.<br />$215M EBITDA.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Conservative projection based on phase-gated deployment. Each filiale contributes incremental revenue as it reaches activation. No hockey-stick assumptions.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[rgba(255,255,255,0.02)]">
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">Year</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">Revenue ($M)</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">EBITDA ($M)</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">Margin</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">Phase</th>
                  </tr>
                </thead>
                <tbody>
                  {returnsProjection.map((row, i) => {
                    const margin = row.revenue > 0 ? ((row.ebitda / row.revenue) * 100).toFixed(1) : '—';
                    return (
                      <tr key={row.year} className={i % 2 === 0 ? '' : 'bg-[rgba(255,255,255,0.015)]'}>
                        <td className="p-4 text-[13px] text-white font-bold font-[family-name:var(--font-space-mono)]">{row.year}</td>
                        <td className="p-4 text-[13px] text-white stat-mono">${row.revenue}M</td>
                        <td className={`p-4 text-[13px] stat-mono ${row.ebitda < 0 ? 'text-[#A87878]' : 'text-[#4A7B5F]'}`}>
                          {row.ebitda < 0 ? `-$${Math.abs(row.ebitda)}M` : `$${row.ebitda}M`}
                        </td>
                        <td className="p-4 text-[13px] text-[#999999]">{margin}%</td>
                        <td className="p-4 text-[12px] text-[#8B9DAF]">{row.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { metric: '3.2x', label: 'Equity Multiple' },
                { metric: '20-25%', label: 'Target IRR' },
                { metric: '5.4 yrs', label: 'Payback Period' },
                { metric: '5.8%', label: 'Blended WACC' },
              ].map((item) => (
                <div key={item.label} className="bg-[rgba(139,157,175,0.06)] border border-[#8B9DAF]/20 rounded-lg p-5">
                  <p className="text-2xl font-extrabold text-[#8B9DAF] stat-mono mb-1">{item.metric}</p>
                  <p className="text-[12px] text-[#CCCCCC]">{item.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 data-grid-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <Target className="mx-auto mb-6 text-[#8B9DAF]" size={32} strokeWidth={1.5} />
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] mb-6">
              The Thesis is Clear.
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/40 leading-relaxed mb-12">
              Africa&apos;s industrial sovereignty is the defining opportunity of this decade. The only question is whether you&apos;re part of it.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/investors" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Investor Briefing <ArrowRight size={14} />
              </Link>
              <Link href="/research" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Read Research
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
