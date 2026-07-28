'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Users,
  Rocket,
  Handshake,
  MessageSquare,
  CheckCircle,
  Globe,
  Cpu,
  Building2,
  MapPin,
  ChevronDown,
  Sparkles,
  Zap,
  Trophy,
  Crown,
  Compass,
  Hammer,
  LineChart,
} from 'lucide-react';

import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CountUp,
} from '@/components/ui/motion';

/* ═══════════════════════════════════════════════════════════════
   WHAT WE OFFER — program pillars
   ═══════════════════════════════════════════════════════════════ */

const offerings = [
  {
    icon: Cpu,
    title: 'GPU Compute Credits',
    description:
      'Free access to HarchOS clusters — NVIDIA H100/H200 GPUs scheduled with carbon-aware orchestration. Enough capacity to train LLMs, run inference at scale, and validate your product on sovereign infrastructure.',
    details: [
      'H100 / H200 SXM5 GPU hours',
      'Carbon-aware scheduler access',
      'HBM3 memory & InfiniBand fabric',
      'Optional reserved capacity',
    ],
  },
  {
    icon: Users,
    title: 'Technical Mentorship',
    description:
      'Direct access to Harch engineers who have built and scaled sovereign infrastructure across Morocco and the wider continent. Dedicated solutions architect, bi-weekly architecture reviews, code reviews on demand.',
    details: [
      'Dedicated solutions architect',
      'Bi-weekly architecture reviews',
      'Code & infra review sessions',
      'Carbon-aware design workshops',
    ],
  },
  {
    icon: Building2,
    title: 'Infrastructure Access',
    description:
      'Production-grade infrastructure across 5 Moroccan hubs (Dakhla, Tanger, Casablanca, Marrakech, Agadir). Tier IV data center semantics, redundant networking, sovereign storage compliant with Loi 09-08 / CNDP.',
    details: [
      '5-region Moroccan footprint',
      'Tier IV data center semantics',
      'Sovereign storage (CNDP compliant)',
      'Submarine cable POP access',
    ],
  },
  {
    icon: Handshake,
    title: 'Co-Marketing & GTM',
    description:
      'Leverage the Harch Corp brand to accelerate your go-to-market. Co-market your solution to our enterprise customer base across Africa — joint case studies, event speaking slots, customer introductions.',
    details: [
      'Joint case study features',
      'Event speaking slots',
      'Customer introductions',
      'Harch Corp blog amplification',
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   BENEFIT TIERS — three-tier program
   ═══════════════════════════════════════════════════════════════ */

const tiers = [
  {
    name: 'Explorer',
    icon: Compass,
    tagline: 'Validate. Prototype. Iterate.',
    credit: '$5,000',
    creditSuffix: '',
    period: '/ 6 months',
    price: 'Free',
    highlight: false,
    features: [
      'GPU credits on H100/H200',
      'Community Slack access',
      'Self-serve HarchOS dashboard',
      'Public docs & quickstarts',
      'Email support (48h SLA)',
      'Quarterly office hours',
    ],
    cta: 'Start Free',
    accent: '#8B9DAF',
  },
  {
    name: 'Builder',
    icon: Hammer,
    tagline: 'Build. Train. Launch.',
    credit: '50,000',
    creditPrefix: '$',
    creditSuffix: '',
    period: '/ 12 months',
    price: 'Equity-free',
    highlight: true,
    features: [
      'Everything in Explorer',
      'Dedicated solutions architect',
      'Reserved GPU capacity',
      'Bi-weekly architecture reviews',
      'Co-marketing introduction',
      'Priority support (4h SLA)',
      'Investor network access',
    ],
    cta: 'Apply for Builder',
    accent: '#8B9DAF',
  },
  {
    name: 'Scale',
    icon: Crown,
    tagline: 'Scale. Monetize. Lead.',
    credit: '200,000',
    creditPrefix: '$',
    creditSuffix: '',
    period: '/ 18 months',
    price: 'Equity-free',
    highlight: false,
    features: [
      'Everything in Builder',
      'Multi-region deployment',
      'Custom SLA & dedicated capacity',
      'Demo Day + investor intros',
      'Joint go-to-market campaigns',
      'Harch Ventures fast-track',
      'White-glove migration support',
    ],
    cta: 'Apply for Scale',
    accent: '#8B9DAF',
  },
];

/* ═══════════════════════════════════════════════════════════════
   ELIGIBILITY — who should apply
   ═══════════════════════════════════════════════════════════════ */

const eligibilityRequirements = [
  {
    title: 'Africa-Focused',
    desc: 'Founded in Africa, or primarily serving African markets (Morocco, Senegal, Gambia, Egypt, Côte d’Ivoire, Kenya, Nigeria, and beyond).',
  },
  {
    title: 'AI / Energy / Agri Tech',
    desc: 'Building at the intersection of artificial intelligence, renewable energy, agriculture, water, fintech, or sovereign infrastructure.',
  },
  {
    title: 'Pre-Series A',
    desc: 'Raised less than $5M in total funding. Pre-revenue startups with strong technical teams and clear roadmaps are welcome.',
  },
  {
    title: 'Technical Product',
    desc: 'Software, AI, or deep-tech product that can benefit from HarchOS infrastructure — training, inference, simulation, or data-heavy workloads.',
  },
  {
    title: 'Sovereign Mindset',
    desc: 'Committed to data sovereignty and keeping African data on African infrastructure, in compliance with CNDP / Loi 09-08.',
  },
  {
    title: 'Active Development',
    desc: 'Working prototype or MVP, or in active development with a clear 12-month technical and commercial roadmap.',
  },
];

/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO COMPANIES — placeholder showcase
   ═══════════════════════════════════════════════════════════════ */

const portfolioCompanies = [
  {
    name: 'DataSaheel',
    sector: 'AI Agriculture',
    description:
      'AI-powered agricultural analytics platform using satellite imagery and HarchOS GPU clusters to deliver crop predictions to farmers across West Africa.',
    location: 'Dakar, Senegal',
    tier: 'Builder',
    metric: '50K+ farmers served',
    metricLabel: 'users',
  },
  {
    name: 'NileSecure',
    sector: 'Cybersecurity',
    description:
      'Zero-trust cybersecurity platform built on HarchOS sovereign infrastructure, serving African financial institutions and government agencies.',
    location: 'Cairo, Egypt',
    tier: 'Scale',
    metric: '12',
    metricLabel: 'enterprise clients',
  },
  {
    name: 'KoraHealth',
    sector: 'HealthTech',
    description:
      'Telemedicine and AI diagnostics platform running on HarchOS, delivering healthcare access to remote communities across Morocco and the Sahel.',
    location: 'Casablanca, Morocco',
    tier: 'Builder',
    metric: '200K+',
    metricLabel: 'consultations',
  },
  {
    name: 'SahelGrid',
    sector: 'Energy',
    description:
      'Smart-grid optimization platform for off-grid and mini-grid operators in the Sahel — predictive load balancing powered by carbon-aware scheduling.',
    location: 'Bamako, Mali',
    tier: 'Explorer',
    metric: '4 MW',
    metricLabel: 'optimized',
  },
  {
    name: 'MREPay',
    sector: 'Fintech',
    description:
      'Cross-border remittance and digital wallet for the 5.5M Moroccan diaspora, leveraging Harch Corp’s sovereign cloud for compliance and latency.',
    location: 'Paris → Casablanca',
    tier: 'Scale',
    metric: '€18M',
    metricLabel: 'processed',
  },
  {
    name: 'AtlasGenomics',
    sector: 'BioTech',
    description:
      'Genomic analysis platform for African populations, training custom models on HarchOS H100 clusters to advance precision medicine on the continent.',
    location: 'Rabat, Morocco',
    tier: 'Builder',
    metric: '14K',
    metricLabel: 'genomes analyzed',
  },
];

/* ═══════════════════════════════════════════════════════════════
   APPLICATION PROCESS — 3 steps
   ═══════════════════════════════════════════════════════════════ */

const applicationSteps = [
  {
    step: '01',
    title: 'Apply',
    description:
      'Submit your application with company details, product overview, and how you plan to use HarchOS infrastructure. Applications are reviewed on a rolling basis — no deadline.',
    icon: Rocket,
  },
  {
    step: '02',
    title: 'Interview',
    description:
      'Selected startups meet our team for a 45-minute technical interview within 10 business days. We assess technical readiness, market potential, and alignment with sovereign infrastructure values.',
    icon: MessageSquare,
  },
  {
    step: '03',
    title: 'Onboard',
    description:
      'Upon acceptance, you receive your HarchOS credits, are paired with a solutions architect, and join the private startup community. Build, iterate, and scale on sovereign infrastructure.',
    icon: Trophy,
  },
];

/* ═══════════════════════════════════════════════════════════════
   FAQ — 5 questions
   ═══════════════════════════════════════════════════════════════ */

const faqs = [
  {
    q: 'Do you take equity in exchange for the credits?',
    a: 'No. The Harch Corp Startup Program is entirely equity-free. Credits, mentorship, and infrastructure access are provided to accelerate African startups building on sovereign infrastructure — without dilution or warrants. We win when you scale on HarchOS.',
  },
  {
    q: 'What types of workloads can I run on the GPU credits?',
    a: 'Largely any AI/ML workload: LLM training and fine-tuning, inference, computer vision, genomic analysis, scientific simulation, reinforcement learning, and more. We support PyTorch, JAX, TensorFlow, vLLM, DeepSpeed, and Hugging Face libraries out of the box. Workloads must comply with our Acceptable Use Policy.',
  },
  {
    q: 'Can I apply if my startup is not based in Morocco?',
    a: 'Yes. The program is open to startups across Africa — Morocco, Senegal, Egypt, Kenya, Nigeria, Côte d’Ivoire, Gambia, and beyond. As long as your startup is Africa-focused or Africa-founded and meets the eligibility criteria, we encourage you to apply. International teams serving African markets are also welcome.',
  },
  {
    q: 'What happens when my credit allowance runs out?',
    a: 'You can request an extension, upgrade to a higher tier (Builder → Scale), or transition to standard HarchOS pricing with a 30% startup discount for 12 months. Many of our alumni leverage the program to raise their next funding round with concrete infrastructure cost savings on their cap table.',
  },
  {
    q: 'Is the HarchOS infrastructure really sovereign?',
    a: 'Yes. HarchOS runs exclusively on Moroccan territory — across 5 hubs (Dakhla, Tanger, Casablanca, Marrakech, Agadir). All data, code, and AI workloads stay under Moroccan jurisdiction (Loi 09-08 / CNDP). No data transits to foreign jurisdictions. This is the foundation of the sovereign cloud value proposition.',
  },
];

/* ═══════════════════════════════════════════════════════════════
   PROGRAM STATS — hero strip
   ═══════════════════════════════════════════════════════════════ */

const heroStats = [
  { value: 255, prefix: '$', suffix: 'K', label: 'Total credits available' },
  { value: 6, suffix: '', label: 'Portfolio companies' },
  { value: 5, suffix: '', label: 'Moroccan regions' },
  { value: 0, suffix: '%', label: 'Equity taken' },
];

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function StartupProgramPageClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-[#0D0D0D]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Startup Program</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Harch Corp<br />Startup Program
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Empowering Africa&apos;s most ambitious founders with up to $200,000 in HarchOS GPU
              credits, technical mentorship, and the network to scale — on sovereign infrastructure
              that keeps African data on African soil. Equity-free. Carbon-aware. Built in Public.
            </p>
          </FadeIn>
          <FadeIn delay={0.12}>
            <div className="flex flex-col sm:flex-row items-start gap-4 mt-8">
              <Link
                href="#apply"
                className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all"
              >
                Apply Now <ArrowRight size={14} />
              </Link>
              <Link
                href="#tiers"
                className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all"
              >
                View Tiers
              </Link>
            </div>
          </FadeIn>

          {/* Stats strip */}
          <FadeIn delay={0.18}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-14 bg-white/[0.06] rounded-lg overflow-hidden">
              {heroStats.map((stat) => (
                <div key={stat.label} className="bg-[#0D0D0D] p-5">
                  <p className="text-[28px] md:text-[34px] font-extrabold text-white leading-none mb-2">
                    <CountUp
                      to={stat.value}
                      prefix={stat.prefix ?? ''}
                      suffix={stat.suffix}
                      duration={2}
                    />
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#666666] font-semibold">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ WHAT WE OFFER ═══ */}
      <section id="benefits" className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">What we offer</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Four Pillars of Support
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              More than credits — a comprehensive support system designed to help African startups
              build, launch, and grow on sovereign infrastructure. Every pillar is operational from
              day one of acceptance.
            </p>
          </FadeIn>
          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            staggerDelay={0.08}
          >
            {offerings.map((offer) => (
              <StaggerItem key={offer.title}>
                <div className="card p-8 h-full group">
                  <div className="flex items-start gap-5 mb-5">
                    <span className="w-11 h-11 rounded-lg bg-[rgba(139,157,175,0.1)] border border-[rgba(139,157,175,0.18)] flex items-center justify-center text-[#8B9DAF] shrink-0">
                      <offer.icon size={20} strokeWidth={1.5} />
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">{offer.title}</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.7]">
                        {offer.description}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2 border-t border-white/[0.06] pt-4">
                    {offer.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-center gap-2 text-[12px] text-[#999999]"
                      >
                        <span className="text-white/30 shrink-0">
                          <CheckCircle size={10} />
                        </span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ ELIGIBILITY ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <FadeIn>
              <p className="section-label mb-4">Eligibility</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-6">
                Who Should Apply
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[16px] text-[#999999] leading-[1.7] mb-8">
                The Harch Corp Startup Program is designed for early-stage technology companies
                building on or migrating to HarchOS sovereign infrastructure. We prioritize startups
                solving problems that matter for Africa — AI, energy, agri-tech, water, fintech,
                healthtech, and beyond.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Globe, label: 'Africa-focused' },
                  { icon: Zap, label: 'AI / Energy / Agri' },
                  { icon: LineChart, label: 'Pre-Series A' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="border border-white/[0.06] bg-[rgba(255,255,255,0.02)] rounded-lg p-4 text-center"
                  >
                    <span className="inline-flex text-[#8B9DAF] mb-2">
                      <item.icon size={20} strokeWidth={1.5} />
                    </span>
                    <p className="text-[11px] uppercase tracking-[0.08em] text-[#999999] font-semibold">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card p-8">
                <h3 className="text-lg font-bold text-white mb-6">Requirements</h3>
                <div className="space-y-5">
                  {eligibilityRequirements.map((req) => (
                    <div key={req.title} className="flex items-start gap-3">
                      <span className="text-white/50 mt-0.5 shrink-0">
                        <CheckCircle size={16} />
                      </span>
                      <div>
                        <p className="text-[14px] font-semibold text-white">{req.title}</p>
                        <p className="text-[13px] text-[#999999] leading-relaxed">{req.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ BENEFIT TIERS ═══ */}
      <section id="tiers" className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Benefit Tiers</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Three Tiers. One Trajectory.
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              From first prototype to continental scale — pick the tier that matches your stage.
              Upgrade anytime as your needs grow. All tiers are equity-free.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {tiers.map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 0.1}>
                <div
                  className={`card p-8 h-full flex flex-col relative ${
                    tier.highlight
                      ? 'border-[rgba(139,157,175,0.4)] bg-[rgba(139,157,175,0.04)]'
                      : ''
                  }`}
                >
                  {tier.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#8B9DAF] text-black text-[10px] font-bold uppercase tracking-[0.1em]">
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-11 h-11 rounded-lg bg-[rgba(255,255,255,0.04)] border border-white/[0.06] flex items-center justify-center text-[#8B9DAF]">
                      <tier.icon size={20} strokeWidth={1.5} />
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.1em] text-[#666666] font-semibold">
                      {tier.price}
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mb-1">{tier.name}</h3>
                  <p className="text-[13px] text-[#999999] mb-6">{tier.tagline}</p>
                  <div className="mb-6 pb-6 border-b border-white/[0.06]">
                    <div className="flex items-baseline gap-1">
                      {tier.creditPrefix && (
                        <span className="text-[28px] font-bold text-white">
                          {tier.creditPrefix}
                        </span>
                      )}
                      <span className="text-[44px] font-extrabold text-white leading-none">
                        {tier.credit}
                      </span>
                      {tier.creditSuffix && (
                        <span className="text-[28px] font-bold text-white">
                          {tier.creditSuffix}
                        </span>
                      )}
                      <span className="text-[12px] text-[#666666] ml-2">{tier.period}</span>
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.1em] text-[#666666] font-semibold mt-1">
                      HarchOS GPU Credits
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-[13px] text-[#CCCCCC]"
                      >
                        <span className="text-[#8B9DAF] mt-0.5 shrink-0">
                          <CheckCircle size={13} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="#apply"
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[12px] font-bold tracking-[0.06em] uppercase transition-all ${
                      tier.highlight
                        ? 'bg-white text-black hover:bg-[#CCCCCC]'
                        : 'bg-[rgba(255,255,255,0.04)] border border-white/[0.08] text-white hover:bg-[rgba(255,255,255,0.08)]'
                    }`}
                  >
                    {tier.cta} <ArrowRight size={12} />
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PORTFOLIO COMPANIES ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Portfolio Companies</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Startups Scaling on HarchOS
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              From AI agriculture in Senegal to sovereign cybersecurity in Egypt — African startups
              building the future on Harch infrastructure. A snapshot of our current cohort.
            </p>
          </FadeIn>
          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            staggerDelay={0.07}
          >
            {portfolioCompanies.map((company) => (
              <StaggerItem key={company.name}>
                <article className="card p-7 h-full group">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-12 h-12 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)] flex items-center justify-center text-[#8B9DAF]">
                      <Building2 size={20} strokeWidth={1.5} />
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{company.name}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-[#666666]">
                        <MapPin size={10} />
                        {company.location}
                      </div>
                    </div>
                  </div>
                  <p className="text-[12px] uppercase tracking-[0.1em] text-[#8B9DAF] font-semibold mb-3">
                    {company.sector}
                  </p>
                  <p className="text-[13px] text-[#999999] leading-[1.7] mb-5">
                    {company.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                    <span className="px-2.5 py-1 rounded-md bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)] text-[10px] font-bold text-[#8B9DAF] tracking-[0.08em] uppercase">
                      {company.tier}
                    </span>
                    <div className="text-right">
                      <p className="text-[16px] text-white font-bold leading-none">
                        {company.metric}
                      </p>
                      <p className="text-[10px] text-[#666666] uppercase tracking-[0.08em] mt-1">
                        {company.metricLabel}
                      </p>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <FadeIn delay={0.1}>
            <p className="text-center text-[12px] text-[#666666] mt-12 italic">
              Portfolio snapshots shown with permission. Some metrics aggregated for confidentiality.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ HOW TO APPLY ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">How to Apply</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Three Steps to Sovereign Infrastructure
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              A straightforward application process designed to get you building on HarchOS as
              quickly as possible — typically under three weeks from application to onboarding.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {applicationSteps.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.1}>
                <div className="card p-8 h-full relative">
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-[48px] font-extrabold text-white/[0.06] leading-none stat-mono">
                      {step.step}
                    </span>
                    <span className="w-10 h-10 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)] flex items-center justify-center text-[#8B9DAF]">
                      <step.icon size={18} strokeWidth={1.5} />
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">FAQ</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Everything we get asked most. If your question isn&apos;t here, reach out at{' '}
              <a
                href="mailto:startup@harchcorp.com"
                className="text-[#8B9DAF] underline underline-offset-4 hover:text-white transition-colors"
              >
                startup@harchcorp.com
              </a>
              .
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="space-y-3">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={faq.q}
                    className={`card overflow-hidden transition-colors ${
                      isOpen ? 'border-[rgba(139,157,175,0.25)]' : ''
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-[15px] font-semibold text-white flex-1">
                        {faq.q}
                      </span>
                      <span
                        className={`text-[#8B9DAF] shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      >
                        <ChevronDown size={18} />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6">
                        <p className="text-[14px] text-[#999999] leading-[1.75]">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section
        id="apply"
        className="py-28 md:py-36 bg-[#000000] relative overflow-hidden"
      >
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <span className="inline-flex text-[#8B9DAF] mb-6">
              <Sparkles size={28} strokeWidth={1.5} />
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">
              Ready to Build on Sovereign Infrastructure?
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/40 leading-relaxed mb-12">
              Join Africa&apos;s most ambitious startups building on HarchOS. Up to $200,000 in GPU
              credits, technical mentorship, and the network to scale — apply today. Equity-free,
              carbon-aware, built in public.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all"
              >
                Apply Now <ArrowRight size={14} />
              </Link>
              <Link
                href="mailto:startup@harchcorp.com"
                className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all"
              >
                Contact Startup Team
              </Link>
            </div>
            <p className="mt-10 text-[11px] uppercase tracking-[0.12em] text-[#444444] font-semibold">
              Rolling applications · Decisions in under 3 weeks · Equity-free
            </p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
