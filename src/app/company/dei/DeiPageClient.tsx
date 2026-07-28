'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Users,
  Heart,
  Scale,
  Globe,
  TrendingUp,
  Shield,
  BookOpen,
  Handshake,
  Award,
  FileText,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const deiStats = [
  { value: '80%+', label: 'African Workforce Target', desc: 'Our commitment to ensuring the vast majority of our team is African, building by Africans for Africa.' },
  { value: '40%', label: 'Women in Engineering by 2028', desc: 'Ambitious target to achieve gender parity in our technical teams within four years.' },
  { value: '5', label: 'Countries Represented', desc: 'Team members from Morocco, Senegal, Gambia, Mauritania, and Mali — with expansion planned.' },
  { value: '100%', label: 'Equal Pay Commitment', desc: 'Annual pay equity audits ensure compensation is based on role and impact, never identity.' },
];

const initiatives = [
  {
    icon: MapPin,
    title: 'Africa First Hiring',
    description: 'We maintain an 80%+ African workforce target across all levels — from entry-level engineers to the C-suite. Every role is posted locally first, and we invest in training programs to develop talent from within the communities we serve.',
    metric: '80%+',
    metricLabel: 'African workforce target',
    color: 'rgba(139, 157, 175, 0.7)',
  },
  {
    icon: Sparkles,
    title: 'Women in Tech',
    description: 'We are committed to reaching 40% women in engineering roles by 2028. Our approach includes targeted recruitment, mentorship programs, returnship opportunities for career breaks, and partnerships with African women-in-STEM organizations.',
    metric: '40%',
    metricLabel: 'Women in engineering by 2028',
    color: 'rgba(0, 255, 136, 0.7)',
  },
  {
    icon: Scale,
    title: 'Inclusive Leadership',
    description: 'Mandatory unconscious bias training for all hiring managers and leaders. Diverse interview panels for every role. Leadership development programs specifically designed to build the next generation of African tech leaders.',
    metric: '100%',
    metricLabel: 'Bias training completion',
    color: 'rgba(255, 200, 0, 0.7)',
  },
  {
    icon: Heart,
    title: 'Community Investment',
    description: 'We commit 5% of annual profits to the communities where we operate. This funds STEM education, infrastructure development, and economic empowerment programs in underserved areas across our operating regions.',
    metric: '5%',
    metricLabel: 'Profits to communities',
    color: 'rgba(255, 100, 100, 0.7)',
  },
];

const ergs = [
  {
    name: 'Women@Harch',
    description: 'Empowering women across all verticals through mentorship, skill-building workshops, and leadership development. Regular speaker series featuring women leaders from across African industry and technology.',
    members: '150+',
  },
  {
    name: 'AfricaTech',
    description: 'Celebrating and amplifying African perspectives in technology. Connecting team members across our 5 operating countries to share cultural insights, regional expertise, and build cross-border collaboration.',
    members: '200+',
  },
  {
    name: 'Veterans@Harch',
    description: 'Supporting military veterans transitioning to civilian careers in technology and industrial infrastructure. Leveraging the discipline and leadership skills gained in service to strengthen our operations.',
    members: '60+',
  },
];

export default function DeiPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Diversity, Equity & Inclusion</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Built by Africa,<br />for Africa
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Harch Corp exists to serve the African continent — and that mission starts with building a team that reflects the communities we serve. Diversity is not a program; it is the foundation of our sovereignty thesis.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <p className="section-label mb-4">Our Commitment</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-8">
                Sovereignty Begins with Representation
              </h2>
              <p className="text-[16px] text-[#999999] leading-[1.8]">
                We believe that Africa&apos;s industrial sovereignty cannot be achieved without the full participation of all its people. Our commitment to diversity, equity, and inclusion is not separate from our business strategy — it is our business strategy. The best solutions for Africa&apos;s challenges will come from teams that reflect the continent&apos;s diversity of experience, perspective, and talent. We hold ourselves accountable with measurable goals, transparent reporting, and a culture where every voice matters.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* DEI by the Numbers */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">By the Numbers</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              Measurable Commitments
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deiStats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08}>
                <div className="card p-8 h-full text-center">
                  <p className="text-5xl md:text-6xl font-bold text-white mb-2 stat-mono">{stat.value}</p>
                  <div className="accent-line mx-auto mb-4" />
                  <p className="text-[14px] font-semibold text-white mb-2">{stat.label}</p>
                  <p className="text-[13px] text-[#999999] leading-relaxed">{stat.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Key Initiatives */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Key Initiatives</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Action, Not Words
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Concrete programs with measurable outcomes. We track progress quarterly and report annually.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initiatives.map((initiative, i) => (
              <FadeIn key={initiative.title} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                      <initiative.icon size={18} style={{ color: initiative.color }} strokeWidth={1.5} />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white stat-mono">{initiative.metric}</p>
                      <p className="text-[10px] text-[#666666] uppercase tracking-wider">{initiative.metricLabel}</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{initiative.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{initiative.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Employee Resource Groups */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Employee Resource Groups</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Community & Belonging
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Employee-led groups that foster inclusion, provide support, and amplify voices across the organization.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ergs.map((erg, i) => (
              <FadeIn key={erg.name} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{erg.name}</h3>
                    <span className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.04)] text-[11px] font-semibold text-[#999999] tracking-wide">
                      {erg.members} members
                    </span>
                  </div>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{erg.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency Report */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="section-label mb-4">Transparency</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-6">
                Annual DEI Report
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[16px] text-[#999999] leading-[1.7] mb-8">
                We publish a comprehensive annual DEI report with data on workforce demographics, pay equity, hiring outcomes, and progress against our commitments. Transparency is not optional — it is how we hold ourselves accountable.
              </p>
              <div className="space-y-4">
                {[
                  'Workforce demographics by gender, nationality, and role level',
                  'Pay equity analysis with gap identification and remediation plans',
                  'Hiring funnel data from application to offer acceptance',
                  'ERG participation and impact metrics',
                  'Community investment allocation and outcomes',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <FileText size={16} className="text-white/30 mt-0.5 shrink-0" />
                    <p className="text-[14px] text-[#999999]">{item}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Award size={24} className="text-white" strokeWidth={1.5} />
                  <h3 className="text-lg font-bold text-white">Our Commitments</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Annual DEI Report Published', value: 'Q1 each year' },
                    { label: 'Pay Equity Audits', value: 'Bi-annual' },
                    { label: 'Bias Training Completion', value: '100%' },
                    { label: 'DEI Goal Progress Reviews', value: 'Quarterly' },
                    { label: 'Community Impact Report', value: 'Annual' },
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

      {/* CTA */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">
              Join Our Mission
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              Building Africa&apos;s sovereign infrastructure requires every perspective, every talent, and every voice. Your uniqueness is our strength.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/careers" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                View Open Positions <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Contact DEI Team
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
