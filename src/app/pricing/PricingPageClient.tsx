'use client';

import { useState, Fragment } from 'react';
import Link from 'next/link';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  SectionDivider,
  Card3D,
} from '@/components/ui/motion';
import {
  ArrowRight,
  CheckCircle2,
  X,
  Zap,
  Shield,
  Lock,
  Server,
  Database,
  Headphones,
  Cpu,
  HelpCircle,
  ChevronDown,
  HardDrive,
  Wifi,
  Clock,
} from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';

/* ═══════════════════════════════════════════════════════════════
   DATA — 4 PRICING TIERS
   ═══════════════════════════════════════════════════════════════ */

const tiers = [
  {
    name: 'Starter',
    price: 'Free',
    priceDetail: 'forever',
    description: 'For exploration and prototyping. No credit card required.',
    badge: '',
    highlight: false,
    cta: 'Start Free',
    ctaHref: '/contact',
    ctaStyle: 'border border-white/12 text-white hover:border-white/25 hover:bg-white/[0.03]',
  },
  {
    name: 'Professional',
    price: '$499',
    priceDetail: '/month',
    description: 'For teams scaling AI workloads with predictable costs and priority support.',
    badge: 'Most Popular',
    highlight: true,
    cta: 'Start Pro Trial',
    ctaHref: '/contact',
    ctaStyle: 'bg-white text-black hover:bg-white/90 border border-white/15',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceDetail: 'annual contract',
    description: 'Dedicated capacity, custom SLAs, on-premise deployment options.',
    badge: '',
    highlight: false,
    cta: 'Contact Sales',
    ctaHref: '/contact',
    ctaStyle: 'border border-white/12 text-white hover:border-white/25 hover:bg-white/[0.03]',
  },
  {
    name: 'Sovereign',
    price: 'Classified',
    priceDetail: 'government & defense',
    description: 'Air-gapped deployment, sovereign clearance, dedicated personnel.',
    badge: 'Government',
    highlight: false,
    cta: 'Request Briefing',
    ctaHref: '/contact',
    ctaStyle: 'border border-[#8B9DAF]/30 text-[#8B9DAF] hover:border-[#8B9DAF]/50 hover:bg-[#8B9DAF]/[0.04]',
  },
];

/* Feature matrix: [feature, Starter, Professional, Enterprise, Sovereign] */
const comparisonFeatures: { category: string; items: { label: string; values: (string | boolean)[] }[] }[] = [
  {
    category: 'Compute',
    items: [
      { label: 'GPU hours / month', values: ['10', '1,000', '10,000+', 'Unlimited'] },
      { label: 'GPU types', values: ['A100', 'A100, L40S', 'H100, A100, L40S, H200', 'All + classified'] },
      { label: 'Carbon-aware scheduling', values: [true, true, true, true] },
      { label: 'Multi-hub routing', values: [false, true, true, true] },
      { label: 'Dedicated GPU clusters', values: [false, false, true, true] },
    ],
  },
  {
    category: 'Storage & Network',
    items: [
      { label: 'Storage', values: ['100 GB', '5 TB', '50 TB', 'Unlimited'] },
      { label: 'API calls / month', values: ['1M', '100M', 'Unlimited', 'Unlimited'] },
      { label: 'Egress bandwidth', values: ['100 GB', '2 TB', '20 TB', 'Unlimited'] },
      { label: 'Submarine cable priority', values: [false, false, true, true] },
    ],
  },
  {
    category: 'Platform',
    items: [
      { label: 'HarchOS Console', values: [true, true, true, true] },
      { label: 'Carbon metrics', values: [true, true, true, true] },
      { label: 'MLOps pipeline', values: [false, true, true, true] },
      { label: 'Vector database', values: [false, true, true, true] },
      { label: 'Custom compliance', values: [false, false, true, true] },
    ],
  },
  {
    category: 'Support & SLA',
    items: [
      { label: 'Support channel', values: ['Community', 'Priority email', 'Slack + phone', 'Dedicated SRE'] },
      { label: 'Response time', values: ['Best effort', '4 hours', '1 hour', '15 minutes'] },
      { label: 'SLA uptime', values: ['—', '99.9%', '99.95%', '99.99%'] },
      { label: 'On-premise deployment', values: [false, false, true, true] },
      { label: 'Air-gapped network', values: [false, false, false, true] },
    ],
  },
];

const gpuPricing = [
  { gpu: 'H100', tier: 'Enterprise', hub: 'Ouarzazate', priceLow: 1.80, priceHigh: 2.20, carbon: 18, renewable: '97.2%', vram: '80GB' },
  { gpu: 'H200', tier: 'Enterprise', hub: 'Dakhla', priceLow: 2.50, priceHigh: 3.00, carbon: 32, renewable: '94.8%', vram: '141GB' },
  { gpu: 'A100', tier: 'Performance', hub: 'Benguerir', priceLow: 1.40, priceHigh: 1.80, carbon: 55, renewable: '88.5%', vram: '80GB' },
  { gpu: 'A100', tier: 'Standard', hub: 'Tanger', priceLow: 1.55, priceHigh: 1.95, carbon: 95, renewable: '82.1%', vram: '80GB' },
  { gpu: 'L40S', tier: 'Performance', hub: 'Benguerir', priceLow: 0.90, priceHigh: 1.20, carbon: 55, renewable: '88.5%', vram: '48GB' },
  { gpu: 'L40S', tier: 'Standard', hub: 'Casablanca', priceLow: 1.10, priceHigh: 1.40, carbon: 210, renewable: '45.0%', vram: '48GB' },
];

const addons = [
  { icon: HardDrive, name: 'Block Storage', price: '$0.02', unit: '/GB/month', desc: 'NVMe-backed, 99.999% durability. Carbon-tracked.' },
  { icon: Database, name: 'Object Storage', price: '$0.015', unit: '/GB/month', desc: 'S3-compatible. Cross-hub replication available.' },
  { icon: Wifi, name: 'Egress Bandwidth', price: '$0.05', unit: '/GB', desc: 'First 100GB free on all tiers. Submarine cable priority on Enterprise+.' },
  { icon: Headphones, name: 'Priority Support', price: '$500', unit: '/month', desc: '24/7 Slack channel, 1-hour response, dedicated SRE on call.' },
  { icon: Clock, name: 'Reserved Capacity', price: '-30%', unit: '1-yr commit', desc: 'Commit to 1 or 3 years for 30-40% discount. Ideal for sustained workloads.' },
  { icon: Shield, name: 'Custom Compliance', price: 'Custom', unit: 'audit-based', desc: 'ISO 27001, SOC 2, DSP-, HIPAA, FedRAMP. Dedicated compliance engineer.' },
];

const faqs = [
  {
    question: 'What GPU types are available on each tier?',
    answer: 'Starter provides A100 access. Professional includes A100 and L40S. Enterprise adds H100 and H200. Sovereign includes all GPU types plus classified configurations for government workloads. All tiers include carbon-aware scheduling at no extra cost.',
  },
  {
    question: 'How does the $499/month Professional plan work?',
    answer: 'Professional is a flat $499/month subscription that includes 1,000 GPU hours, 5TB storage, 100M API calls, and priority support. Additional GPU hours are billed at $0.50/GPU-hour (A100) or $0.90/GPU-hour (L40S). No overage fees — you are billed only for what you use beyond the included quota.',
  },
  {
    question: 'What is the difference between Enterprise and Sovereign?',
    answer: 'Enterprise is for commercial customers needing dedicated capacity, custom SLAs (99.95%), and on-premise deployment. Sovereign is for government and defense workloads — physically air-gapped network, no internet egress, dedicated personnel with security clearance, and 99.99% SLA. Sovereign pricing is classified and requires a formal procurement process.',
  },
  {
    question: 'How does HarchOS pricing compare to AWS, GCP, and Azure?',
    answer: 'HarchOS is 40-60% cheaper than equivalent GPU compute. H100 Enterprise at $1.80-2.20/hr vs AWS ~$3.40/hr. H200 at $2.50-3.00/hr vs hyperscaler ~$4.50/hr. The cost advantage comes from Moroccan renewable energy ($0.02/kWh vs $0.08-0.12/kWh in Europe) and our vertically integrated infrastructure.',
  },
  {
    question: 'What is carbon-aware scheduling and is it really free?',
    answer: 'Yes, completely free on every tier. HarchOS samples carbon intensity across all 5 hubs every 3 seconds and routes your workloads to the greenest hub at that moment. Result: 48.2 gCO₂/kWh average, 89% below hyperscaler average. For batch workloads, this also reduces cost by up to 25% by shifting jobs to off-peak renewable windows.',
  },
  {
    question: 'Can I switch between tiers?',
    answer: 'Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately. Downgrades take effect at the start of your next billing cycle. No penalty fees. Enterprise and Sovereign require annual commitments — early termination is negotiated case by case.',
  },
  {
    question: 'Is there a free trial for paid tiers?',
    answer: 'Yes. All new accounts receive a 30-day free trial of Professional tier features, including 100 GPU hours. No credit card required to start. After the trial, you can choose any tier or continue on the free Starter plan forever.',
  },
  {
    question: 'What SLA guarantees are offered?',
    answer: 'Professional: 99.9% uptime with service credits for violations. Enterprise: 99.95% with custom credit terms and dedicated SRE. Sovereign: 99.99% for air-gapped deployments. All SLAs include response time guarantees: 4 hours (Pro), 1 hour (Enterprise), 15 minutes (Sovereign).',
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function PricingPageClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-[#0D0D0D]">
      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 data-grid-pattern opacity-20" />
        <div className="absolute top-0 right-1/4 w-[700px] h-[500px] bg-[#8B9DAF]/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6">Pricing /0.5</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[88px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              Simple, Transparent<br />Pricing<span className="text-[#8B9DAF]">.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-4">
              No hidden fees. No surprise invoices. No negotiated discounts.
            </p>
            <p className="text-[15px] text-[#999999] max-w-xl leading-[1.7]">
              Four tiers — from free exploration to air-gapped sovereign deployment. 40-60% cheaper than AWS, GCP, and Azure. Powered by 100% renewable energy across Morocco.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap gap-3 mt-10">
              {[
                { metric: '$1.80', label: 'H100/hr from' },
                { metric: '48.2', label: 'gCO₂/kWh avg' },
                { metric: '89%', label: 'below industry carbon' },
                { metric: '40-60%', label: 'cheaper than hyperscalers' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-5 py-3">
                  <span className="text-lg font-bold text-white stat-mono">{stat.metric}</span>
                  <span className="text-[11px] text-[#666666] ml-2">{stat.label}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ 4 PRICING TIERS ═══════ */}
      <section className="pb-20 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <StaggerItem key={tier.name}>
                <div className={`bg-white/[0.02] border rounded-lg p-8 h-full flex flex-col relative ${tier.highlight ? 'border-[#8B9DAF]/40 ring-1 ring-[#8B9DAF]/20' : 'border-white/[0.06]'}`}>
                  {tier.badge && (
                    <span className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-bold ${
                      tier.badge === 'Most Popular' ? 'bg-[#8B9DAF]/15 text-[#8B9DAF]' : 'bg-[rgba(255,255,255,0.05)] text-[#999999]'
                    }`}>
                      {tier.badge}
                    </span>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-white mb-1">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-extrabold text-white stat-mono">{tier.price}</span>
                      {tier.priceDetail && <span className="text-[13px] text-[#999999]">{tier.priceDetail}</span>}
                    </div>
                    <p className="text-[13px] text-[#666666] leading-[1.6]">{tier.description}</p>
                  </div>
                  <div className="accent-line mb-6" />
                  <Link href={tier.ctaHref} className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-[13px] font-semibold transition-all mt-auto ${tier.ctaStyle}`}>
                    {tier.cta} <ArrowRight size={14} />
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ INTELLIGENCE VIDEO BRIEF ═══════ */}
      <section className="py-12 md:py-16 bg-[#0D0D0D] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 bg-[#0F0F0F] border border-[rgba(139,157,175,0.18)] rounded-lg">
              <div className="w-full md:w-80 h-44 shrink-0">
                <VideoPlayer
                  src="/videos/v4_intelligence.mp4"
                  variant="modal-trigger"
                  label="Watch: Harch Intelligence (40s)"
                  className="w-full h-full"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2">Harch Intelligence Brief</p>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">Carbon-Aware Sovereign AI Compute</h3>
                <p className="text-[15px] text-white/70 leading-relaxed">
                  1,798 GPUs across 5 Moroccan hubs at 48.2 gCO₂/kWh — 89% below industry average.
                  Watch the 40-second brief on the platform that powers every tier below.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ COMPARISON TABLE ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Compare Plans</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Full Feature Matrix.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Every feature, every tier, side by side. No asterisks, no fine print, no &ldquo;contact us for details&rdquo;.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[rgba(255,255,255,0.02)]">
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">Feature</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#999999]">Starter</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#8B9DAF]">Professional</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#999999]">Enterprise</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#999999]">Sovereign</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((category) => (
                    <Fragment key={category.category}>
                      <tr className="border-b border-white/[0.04] bg-[rgba(139,157,175,0.03)]">
                        <td colSpan={5} className="p-3 px-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#8B9DAF]">
                          {category.category}
                        </td>
                      </tr>
                      {category.items.map((item) => (
                        <tr key={item.label} className="border-b border-white/[0.04]">
                          <td className="p-4 text-[13px] text-[#CCCCCC] font-semibold">{item.label}</td>
                          {item.values.map((val, i) => (
                            <td key={i} className="p-4 text-[13px]">
                              {typeof val === 'boolean' ? (
                                val ? <CheckCircle2 size={16} className="text-[#4A7B5F]" /> : <X size={16} className="text-[#333333]" />
                              ) : (
                                <span className={i === 1 ? 'text-white font-semibold' : 'text-[#999999]'}>{val}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      <SectionDivider className="max-w-[1400px] mx-auto" />

      {/* ═══════ GPU PRICING ═══════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">GPU Pricing</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Per-GPU Hourly Rates.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Prices vary by GPU type, hub location, and renewable mix. Carbon-aware scheduling automatically routes to the lowest-cost green hub. H100 from $1.80/hr, H200 from $2.50/hr.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[rgba(255,255,255,0.02)]">
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">GPU</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">VRAM</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">Tier</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">Hub</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">Price / hr</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">Carbon</th>
                    <th className="text-left p-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#666666]">Renewable</th>
                  </tr>
                </thead>
                <tbody>
                  {gpuPricing.map((gpu, i) => (
                    <tr key={i} className={i % 2 === 0 ? '' : 'bg-[rgba(255,255,255,0.015)]'}>
                      <td className="p-4 text-[13px] text-white font-bold">
                        <div className="flex items-center gap-2">
                          <Cpu size={14} className="text-[#8B9DAF]" />
                          {gpu.gpu}
                        </div>
                      </td>
                      <td className="p-4 text-[13px] text-[#999999] font-[family-name:var(--font-space-mono)]">{gpu.vram}</td>
                      <td className="p-4 text-[13px] text-[#999999]">{gpu.tier}</td>
                      <td className="p-4 text-[13px] text-[#999999]">{gpu.hub}</td>
                      <td className="p-4 text-[13px] text-[#4A7B5F] font-bold stat-mono">
                        ${gpu.priceLow.toFixed(2)} — ${gpu.priceHigh.toFixed(2)}
                      </td>
                      <td className="p-4 text-[13px] text-[#999999] font-[family-name:var(--font-space-mono)]">{gpu.carbon} gCO₂</td>
                      <td className="p-4 text-[13px] text-[#4A7B5F] font-semibold">{gpu.renewable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-[12px] text-[#666666] mt-4">
              Prices in USD, billed per second with a 60-second minimum. Spot instances available at up to 70% discount. Reserved capacity (1-3 year commitment) offers 30-40% additional discount.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ ADD-ONS ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Add-ons</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Storage, Bandwidth, Support.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Beyond GPU compute — everything else you need, priced transparently. No bundled fees, no minimum commitments on Starter and Professional.
            </p>
          </FadeIn>
          <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addons.map((addon) => (
              <StaggerItem key={addon.name}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[#8B9DAF]/15 flex items-center justify-center">
                      <addon.icon size={18} className="text-[#8B9DAF]" strokeWidth={1.5} />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white stat-mono">{addon.price}</p>
                      <p className="text-[10px] text-[#666666]">{addon.unit}</p>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{addon.name}</h3>
                  <p className="text-[13px] text-[#999999] leading-[1.7]">{addon.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">FAQ</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Pricing Questions.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Everything you need to know about billing, tiers, and what you actually pay. If your question isn&apos;t here, ask us directly.
            </p>
          </FadeIn>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                    aria-expanded={openFaq === i}
                  >
                    <span className="text-[14px] font-bold text-white pr-4">{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`text-[#8B9DAF] shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 pt-1">
                      <div className="accent-line mb-4" />
                      <p className="text-[14px] text-[#999999] leading-[1.7]">{faq.answer}</p>
                    </div>
                  )}
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
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] mb-6">
              Ready to Start?
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/40 leading-relaxed mb-12">
              Start free in under 60 seconds. No credit card required. Upgrade when you&apos;re ready — or talk to us about Enterprise and Sovereign deployments.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Start Free <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Talk to Sales
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
