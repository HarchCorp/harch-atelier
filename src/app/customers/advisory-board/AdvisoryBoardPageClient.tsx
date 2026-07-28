'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  ArrowRight,
  Star,
  TrendingUp,
  Users,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Globe,
  Lightbulb,
  Handshake,
  Award,
  UserPlus,
  Building2,
  Sparkles,
  Target,
  MessageSquare,
} from 'lucide-react';

const howItWorks = [
  {
    step: '01',
    title: 'Nominate',
    description: 'Customers are nominated by their account team or self-nominate through the application process. We look for organizations with strategic deployments and visionary leadership.',
    icon: UserPlus,
  },
  {
    step: '02',
    title: 'Select',
    description: 'Our selection committee reviews nominees based on deployment maturity, strategic alignment, and willingness to invest time in co-creation. We maintain a diverse board across verticals and geographies.',
    icon: Target,
  },
  {
    step: '03',
    title: 'Collaborate',
    description: 'Board members participate in quarterly working sessions, product previews, and strategic discussions. Your input directly shapes feature prioritization and product direction.',
    icon: Handshake,
  },
  {
    step: '04',
    title: 'Shape the Roadmap',
    description: 'Your feedback doesn\'t go into a black box. Every board recommendation is tracked, responded to, and incorporated into our public roadmap with attribution to the advisory board.',
    icon: Lightbulb,
  },
];

const currentMembers = [
  {
    organization: 'Regional Central Bank (Illustrative)',
    fullName: 'Regional Central Bank — Illustrative Scenario',
    representative: 'Amadou Diallo',
    title: 'Chief Technology Officer',
    sector: 'Finance',
  },
  {
    organization: 'ONEE',
    fullName: 'ONEE (National Office of Electricity and Water)',
    representative: 'Fatima Zahra El Amrani',
    title: 'Director of Operations',
    sector: 'Energy',
  },
  {
    organization: 'National Phosphate Operator (Illustrative)',
    fullName: 'National Phosphate Operator — Illustrative Scenario',
    representative: 'Youssef Benkirane',
    title: 'VP Digital Transformation',
    sector: 'Mining',
  },
  {
    organization: 'Senegal Ministry of Agriculture',
    fullName: 'Senegal Ministry of Agriculture',
    representative: 'Mamadou Ndiaye',
    title: 'Permanent Secretary',
    sector: 'Government',
  },
  {
    organization: 'Attijariwafa Bank',
    fullName: 'Attijariwafa Bank',
    representative: 'Kenza Alaoui',
    title: 'Chief Risk Officer',
    sector: 'Finance',
  },
  {
    organization: 'RAMED',
    fullName: 'RAMED (Meknes Water Distribution Authority)',
    representative: 'Omar Tazi',
    title: 'General Director',
    sector: 'Water',
  },
];

const benefits = [
  {
    icon: Star,
    title: 'Early Access',
    description: 'Preview features 6 months before general availability. Test, validate, and provide input on upcoming capabilities in a private preview environment. Your teams get a head start on integration and your feedback shapes the final release.',
    details: ['Private beta access to all new products', '6-month advance preview window', 'Direct feedback channel to product teams', 'Dedicated preview environment'],
  },
  {
    icon: TrendingUp,
    title: 'Direct Influence',
    description: 'Your requirements don\'t compete with a thousand feature requests — they sit at the top of our product team\'s priority list. Board recommendations are formally tracked and publicly responded to within 2 weeks.',
    details: ['Feature request priority weighting', '2-week formal response guarantee', 'Quarterly roadmap review sessions', 'Named product team liaison'],
  },
  {
    icon: Users,
    title: 'Executive Networking',
    description: 'Connect with C-suite and VP-level peers across 5 African countries who are solving the same sovereign infrastructure challenges. Annual summit, private roundtables, and curated introductions.',
    details: ['Annual advisory board summit', 'Private executive roundtables', 'Curated peer introductions', 'Cross-sector knowledge sharing'],
  },
  {
    icon: BarChart3,
    title: 'Strategic Insights',
    description: 'Receive exclusive market intelligence, trend analyses, and technology briefings prepared by our research team. Understand where African infrastructure is heading before your competitors do.',
    details: ['Quarterly market intelligence reports', 'Technology trend briefings', 'Regulatory landscape analysis', 'Competitive positioning insights'],
  },
];

export default function AdvisoryBoardPageClient() {
  return (
    <div className="bg-[#121212]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-center gap-2 mb-4">
              <Link href="/customers" className="text-[12px] text-[#666666] hover:text-white transition-colors">Customer Stories</Link>
              <ChevronRight size={12} className="text-[#444444]" />
              <span className="text-[12px] text-white">Advisory Board</span>
            </div>
            <p className="section-label mb-4">Co-Creation</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Customer Advisory<br />Board
            </h1>
            <div className="accent-line mb-6" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              No other industrial conglomerate in Africa offers this level of customer participation 
              in product development. The Harch Corp Advisory Board is where our most strategic customers 
              co-create the future of sovereign African infrastructure.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/2">
              <FadeIn>
                <p className="section-label mb-4">About</p>
                <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
                  Why an Advisory Board?
                </h2>
                <div className="accent-line mb-6" />
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">
                  The best products are built with — not for — the people who use them. Our Customer Advisory Board 
                  ensures that every strategic decision at Harch Corp is informed by the organizations that depend 
                  on our infrastructure.
                </p>
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">
                  This isn\'t a feedback form or a quarterly survey. It\'s a structured co-creation program where 
                  senior leaders from our most strategic accounts have a direct line to our product, engineering, 
                  and executive teams. Board members shape features, influence priorities, and hold us accountable 
                  to delivering value.
                </p>
                <p className="text-[15px] text-[#999999] leading-[1.7]">
                  The result: products that solve real problems, built by people who understand the 
                  operational realities of African infrastructure. Every feature on our roadmap has been 
                  validated by the people who will deploy it.
                </p>
              </FadeIn>
            </div>
            <div className="lg:w-1/2">
              <FadeIn delay={0.1}>
                <div className="card p-8">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { value: '12', label: 'Board Members' },
                      { value: '6', label: 'Countries Represented' },
                      { value: '7', label: 'Verticals Covered' },
                      { value: '47', label: 'Features Influenced' },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-4 bg-[rgba(255,255,255,0.03)] rounded-xl">
                        <p className="stat-mono text-3xl font-bold text-white mb-1">{stat.value}</p>
                        <p className="text-[11px] text-[#666666]">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Process</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              How It Works
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              A structured program designed for busy executives. Clear expectations, measurable impact, 
              and respect for your time.
            </p>
          </FadeIn>

          <div className="space-y-4">
            {howItWorks.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.08}>
                <div className="card p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center border border-[rgba(255,255,255,0.06)]">
                        <span className="text-[11px] font-bold text-white/30 stat-mono">{step.step}</span>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                        <step.icon size={18} className="text-white" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[17px] font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.7]">{step.description}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CURRENT MEMBERS ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Members</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Current Board Members
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Leaders from Africa&apos;s most important organizations, representing every vertical 
              in our portfolio.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMembers.map((member, i) => (
              <FadeIn key={member.organization} delay={i * 0.06}>
                <div className="card p-6 h-full">
                  <div className="flex items-center gap-4 mb-4">
                    {/* Logo placeholder */}
                    <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center border border-[rgba(255,255,255,0.08)]">
                      <Building2 size={20} className="text-white/40" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-white truncate">{member.organization}</p>
                      <p className="text-[11px] text-[#666666] truncate">{member.fullName}</p>
                    </div>
                  </div>
                  <div className="pb-4 border-b border-[rgba(255,255,255,0.04)] mb-4">
                    <span className="status-badge status-badge-engineering">
                      {member.sector}
                    </span>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white">{member.representative}</p>
                    <p className="text-[12px] text-[#666666]">{member.title}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Benefits</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Why Join the Board
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Board membership is a strategic advantage. Here&apos;s what you gain — and what we gain from your participation.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, i) => (
              <FadeIn key={benefit.title} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                      <benefit.icon size={18} className="text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[18px] font-bold text-white">{benefit.title}</h3>
                  </div>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-6">{benefit.description}</p>
                  <div className="space-y-2 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                    {benefit.details.map((detail) => (
                      <div key={detail} className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-white/25 flex-shrink-0" strokeWidth={1.5} />
                        <span className="text-[12px] text-[#666666]">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MEETING CADENCE ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Cadence</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              Meeting Cadence
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn delay={0.05}>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Calendar size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[18px] font-bold text-white">Quarterly Working Sessions</h3>
                </div>
                <p className="text-[14px] text-[#999999] leading-[1.7] mb-6">
                  Virtual working sessions held every quarter, lasting 2 hours. Each session focuses on 
                  a specific product area or strategic theme. Product teams present roadmaps, demo previews, 
                  and collect structured feedback. All sessions are recorded and summarized with action items 
                  distributed within 48 hours.
                </p>
                <div className="space-y-2 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                  {[
                    'Q1: Product Roadmap Review & Prioritization',
                    'Q2: Technology Preview & Feedback',
                    'Q3: Strategic Planning & Market Direction',
                    'Q4: Annual Review & Goal Setting',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-white/25 flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-[12px] text-[#666666]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Globe size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[18px] font-bold text-white">Annual Summit</h3>
                </div>
                <p className="text-[14px] text-[#999999] leading-[1.7] mb-6">
                  An in-person summit held annually in Casablanca, bringing together all board members 
                  for a full day of strategic discussions, product deep-dives, and executive networking. 
                  The summit features keynote presentations from Harch Corp leadership, hands-on workshops 
                  with upcoming products, and private roundtable discussions.
                </p>
                <div className="space-y-2 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                  {[
                    'Full-day in-person event in Casablanca',
                    'Keynote from CEO and CTO',
                    'Product deep-dive workshops',
                    'Executive networking dinner',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-white/25 flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-[12px] text-[#666666]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ APPLY ═══ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden border-t border-[rgba(255,255,255,0.06)]">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <FadeIn>
                <p className="section-label mb-4">Apply</p>
                <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">
                  Join the Board
                </h2>
                <p className="text-[15px] text-white/30 leading-[1.7] mb-8">
                  We accept applications on a rolling basis. The selection committee reviews nominees 
                  quarterly and extends invitations to organizations that bring diverse perspectives 
                  and a commitment to co-creation.
                </p>
              </FadeIn>
            </div>
            <div className="lg:w-1/2 w-full">
              <FadeIn delay={0.15}>
                <div className="card p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">Full Name</label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        className="w-full bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[#444444] focus:border-white/20 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">Organization</label>
                      <input
                        type="text"
                        placeholder="Your organization name"
                        className="w-full bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[#444444] focus:border-white/20 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">Title / Role</label>
                      <input
                        type="text"
                        placeholder="Your title or role"
                        className="w-full bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[#444444] focus:border-white/20 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">Why Do You Want to Join?</label>
                      <textarea
                        placeholder="Tell us about your interest in the advisory board and what you hope to contribute."
                        rows={4}
                        className="w-full bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[#444444] focus:border-white/20 focus:outline-none transition-colors resize-none"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-3.5 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all">
                        Submit Application <ArrowRight size={14} />
                      </button>
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center gap-2 border border-white/12 text-white px-8 py-3.5 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all"
                      >
                        <MessageSquare size={14} />
                        Talk to Us First
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
