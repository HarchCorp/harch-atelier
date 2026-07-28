'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Cpu,
  Zap,
  Leaf,
  Droplets,
  Mountain,
  Building2,
  Globe,
  TrendingUp,
  Handshake,
  Shield,
  CheckCircle,
  DollarSign,
  MapPin,
  Target,
  Lightbulb,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const thesisAreas = [
  {
    icon: Cpu,
    title: 'Sovereign AI',
    description: 'AI infrastructure, models, and applications that keep African data on African soil. GPU cloud services, sovereign LLMs, and AI-powered solutions for African-specific problems.',
    color: 'rgba(139, 157, 175, 0.7)',
  },
  {
    icon: Zap,
    title: 'Clean Energy',
    description: 'Renewable energy generation, storage, and distribution technologies. Solar, wind, hydrogen, and grid optimization solutions that accelerate Africa\'s energy transition.',
    color: 'rgba(0, 255, 136, 0.7)',
  },
  {
    icon: Leaf,
    title: 'AgriTech',
    description: 'Precision agriculture, vertical farming, supply chain optimization, and food security technologies. IoT-enabled farming, drone analytics, and climate-adaptive crop solutions.',
    color: 'rgba(255, 200, 0, 0.7)',
  },
  {
    icon: Droplets,
    title: 'WaterTech',
    description: 'Desalination innovation, water recycling, smart irrigation, and water quality monitoring. Technologies that address Africa\'s growing water security challenges.',
    color: 'rgba(100, 180, 255, 0.7)',
  },
  {
    icon: Mountain,
    title: 'MiningTech',
    description: 'Automation, safety systems, mineral processing, and environmental monitoring for the mining sector. Technologies that make African mining safer, more efficient, and more sustainable.',
    color: 'rgba(255, 160, 60, 0.7)',
  },
];

const portfolioCompanies = [
  {
    name: 'SaharaAI',
    description: 'Building Africa\'s first sovereign large language model trained on African languages and datasets. Their models power HarchOS AI services across 5 data center regions.',
    stage: 'Series A',
    sector: 'Sovereign AI',
    location: 'Casablanca, Morocco',
    investment: '2024',
  },
  {
    name: 'SolarGrid',
    description: 'Distributed solar energy platform enabling micro-grids and virtual power plants across West Africa. Currently powering 15,000 homes and 200 businesses in Senegal and Gambia.',
    stage: 'Seed',
    sector: 'Clean Energy',
    location: 'Dakar, Senegal',
    investment: '2024',
  },
  {
    name: 'AgriSense',
    description: 'IoT and satellite-based precision agriculture platform providing real-time crop monitoring, soil analytics, and yield optimization to 30,000+ farmers across the Sahel.',
    stage: 'Pre-Series A',
    sector: 'AgriTech',
    location: 'Bamako, Mali',
    investment: '2025',
  },
  {
    name: 'AquaPure',
    description: 'Next-generation modular desalination technology reducing energy consumption by 60% compared to conventional systems. Piloting in Morocco with plans for 5 additional countries.',
    stage: 'Seed',
    sector: 'WaterTech',
    location: 'Tangier, Morocco',
    investment: '2025',
  },
];

const investmentCriteria = [
  {
    icon: Target,
    title: 'Africa-First Impact',
    description: 'We invest in companies that directly contribute to Africa\'s industrial sovereignty. Your product must serve African markets and ideally be built by African teams. Impact is measured in sovereignty outcomes, not just financial returns.',
  },
  {
    icon: Lightbulb,
    title: 'Technical Depth',
    description: 'We look for startups with genuine technical innovation — not just business model arbitrage. Deep tech, hardware-enabled solutions, and IP-driven companies receive priority consideration.',
  },
  {
    icon: TrendingUp,
    title: 'Scalable Infrastructure',
    description: 'Solutions must be infrastructure-grade: capable of operating at national or continental scale. We favor companies building platforms and systems that become foundational to Africa\'s industrial stack.',
  },
  {
    icon: Users,
    title: 'Exceptional Teams',
    description: 'We back founders with domain expertise, resilience, and a sovereign mindset. Technical founders who understand their market deeply and have the grit to build through Africa\'s unique challenges.',
  },
];

export default function VenturesPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Harch Ventures</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Investing in Africa&apos;s<br />Industrial Future
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Harch Ventures is the strategic investment arm of Harch Corp. We invest in early-stage startups building sovereign infrastructure technology across Africa — from AI and energy to agriculture and water.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-start gap-4 mt-8">
              <Link href="#apply" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Pitch Your Startup <ArrowRight size={14} />
              </Link>
              <Link href="#portfolio" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                View Portfolio
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Investment Thesis */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Investment Thesis</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Where We Invest
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Five sectors where technology can unlock Africa&apos;s sovereignty. Each aligns with Harch Corp&apos;s vertical strategy and offers compounding strategic value.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {thesisAreas.map((area, i) => (
              <FadeIn key={area.title} delay={i * 0.06}>
                <div className="card p-8 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-5">
                    <area.icon size={18} style={{ color: area.color }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{area.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{area.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Companies */}
      <section id="portfolio" className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Portfolio</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Companies We Back
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Strategic investments in startups building critical infrastructure technology for Africa&apos;s sovereignty.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolioCompanies.map((company, i) => (
              <FadeIn key={company.name} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                        <Building2 size={20} className="text-white" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{company.name}</h3>
                        <div className="flex items-center gap-2 text-[11px] text-[#666666]">
                          <MapPin size={10} /> {company.location}
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-md bg-[rgba(255,255,255,0.04)] text-[10px] font-semibold text-[#999999] tracking-wide">
                      {company.stage}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-5">{company.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-[12px]">
                    <span className="text-[#666666]">{company.sector}</span>
                    <span className="text-[#666666] stat-mono">Invested {company.investment}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Criteria */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Criteria</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              What We Look For
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Four principles guide every investment decision. We look for alignment on all four before committing capital.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {investmentCriteria.map((criterion, i) => (
              <FadeIn key={criterion.title} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-5">
                    <criterion.icon size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{criterion.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{criterion.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="section-label mb-4">Our Approach</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-6">
                Strategic Capital,<br />Not Just Checks
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[16px] text-[#999999] leading-[1.7] mb-8">
                Harch Ventures brings more than capital. As the investment arm of Africa&apos;s largest industrial conglomerate, we provide portfolio companies with unmatched strategic advantages.
              </p>
              <div className="space-y-5">
                {[
                  { title: 'Infrastructure Access', desc: 'Portfolio companies get priority access to HarchOS compute, energy infrastructure, and operational facilities across 5 countries.' },
                  { title: 'Customer Introductions', desc: 'Direct introductions to Harch Corp\'s enterprise and government clients across all 7 verticals and operating regions.' },
                  { title: 'Operational Expertise', desc: 'Hands-on support from Harch engineers and operators who have scaled industrial infrastructure across the continent.' },
                  { title: 'Follow-On Capital', desc: 'Strong syndication relationships with African and international VCs, DFIs, and sovereign wealth funds for subsequent rounds.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-white/50 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[14px] font-semibold text-white">{item.title}</p>
                      <p className="text-[13px] text-[#999999] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card p-8">
                <h3 className="text-lg font-bold text-white mb-6">Investment Details</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Check Size', value: '$250K – $5M' },
                    { label: 'Stage', value: 'Pre-Seed to Series A' },
                    { label: 'Geography', value: 'Africa & Middle East' },
                    { label: 'Sectors', value: '5 focus areas' },
                    { label: 'Active Portfolio', value: '4 companies' },
                    { label: 'Annual Deployments', value: '6–10 investments' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                      <span className="text-[13px] text-[#999999]">{item.label}</span>
                      <span className="text-[14px] font-bold text-white stat-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Apply for Funding CTA */}
      <section id="apply" className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">
              Building Africa&apos;s Infrastructure?
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              We want to hear from founders building sovereign technology for Africa. Pitch your startup to Harch Ventures — strategic capital meets industrial scale.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Pitch Your Startup <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Contact Ventures Team
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
