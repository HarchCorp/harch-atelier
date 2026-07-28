'use client';

import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Zap,
  Users,
  Heart,
  GraduationCap,
  Globe,
  TrendingUp,
  Building2,
  Shield,
  Crosshair,
  Fingerprint,
  ChevronRight,
  Target,
  Skull,
  Flame,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const positions = [
  { title: 'Sovereign Infrastructure Engineer', department: 'Intelligence', location: 'Dakhla, Morocco', type: 'Full-time', level: 'Senior', clearance: true },
  { title: 'AI/ML Defense Systems Lead', department: 'Technology', location: 'Casablanca, Morocco', type: 'Full-time', level: 'Lead', clearance: true },
  { title: 'Renewable Energy Operations Lead', department: 'Energy', location: 'Sahel Region', type: 'Full-time', level: 'Senior', clearance: false },
  { title: 'Cement Plant Operations Director', department: 'Cement', location: 'Gambia', type: 'Full-time', level: 'Director', clearance: false },
  { title: 'Mining Geologist', department: 'Mining', location: 'Mauritania', type: 'Full-time', level: 'Mid', clearance: false },
  { title: 'Precision Agriculture Specialist', department: 'Agri', location: 'Senegal', type: 'Full-time', level: 'Mid', clearance: false },
  { title: 'Water Desalination Engineer', department: 'Water', location: 'Morocco', type: 'Full-time', level: 'Senior', clearance: false },
  { title: 'Cybersecurity Architect', department: 'Technology', location: 'Casablanca, Morocco', type: 'Full-time', level: 'Lead', clearance: true },
  { title: 'Corporate Finance Analyst', department: 'Corporate', location: 'Casablanca, Morocco', type: 'Full-time', level: 'Mid', clearance: false },
  { title: 'ESG & Sovereign Compliance Manager', department: 'Corporate', location: 'Casablanca, Morocco', type: 'Full-time', level: 'Senior', clearance: false },
  { title: 'Construction Site Director', department: 'Cement', location: 'Gambia', type: 'Full-time', level: 'Senior', clearance: false },
  { title: 'Satellite Communications Engineer', department: 'Technology', location: 'Casablanca, Morocco', type: 'Full-time', level: 'Mid', clearance: true },
];

const benefits = [
  { icon: TrendingUp, title: 'Above-Market Compensation', desc: 'Above-market compensation. Equity participation for senior roles. Your net worth should reflect your impact.' },
  { icon: Heart, title: 'Operational Health', desc: 'Comprehensive health insurance because you can\'t build sovereignty if you\'re not operational. Mental health included \u2014 the work is demanding.' },
  { icon: GraduationCap, title: 'Skills Development', desc: 'Unlimited learning budget. Conference attendance. Direct mentorship from engineers who have built infrastructure at scale. We invest in your growth.' },
  { icon: Globe, title: 'Global Assignment', desc: 'Work across 5 countries and 7 verticals. Relocation support. The mission takes you where you are needed.' },
  { icon: Zap, title: 'Sovereign Impact', desc: 'Every project directly contributes to Africa\'s industrial sovereignty. Your code, your concrete, your energy \u2014 reshaping a continent.' },
  { icon: Building2, title: 'Zero Bureaucracy', desc: 'State-of-the-art equipment and zero bureaucracy. You get what you need to execute. No procurement committees.' },
];

const selectionSteps = [
  { step: '01', title: 'Application Review', desc: 'We review every application. Most don\'t make it past this stage.', icon: Fingerprint },
  { step: '02', title: 'Technical Assessment', desc: 'A real engineering problem, not a coding puzzle. Show us how you think under pressure.', icon: Crosshair },
  { step: '03', title: 'Mission Alignment', desc: 'Can you articulate why sovereign infrastructure matters? If not, this ends here.', icon: Target },
  { step: '04', title: 'Final Interview', desc: 'With the team you\'ll work with. Cultural fit is mission-critical.', icon: Shield },
];

const cultureCards = [
  {
    title: 'Mission First',
    desc: 'We optimize for impact. The continent can\'t wait for convenience. If you need a ping-pong table, this isn\'t the place.',
    icon: Flame,
  },
  {
    title: 'Sovereign Mindset',
    desc: 'Every line of code, every concrete pour, every watt generated serves one purpose: African self-determination. If you don\'t understand sovereignty, you won\'t survive here.',
    icon: Shield,
  },
  {
    title: 'Cross-Domain Integration',
    desc: 'Our engineers don\'t stay in lanes. Energy engineers debug AI models. Cement specialists review satellite data. The problems are interconnected. So are we.',
    icon: Crosshair,
  },
  {
    title: 'Merit Without Compromise',
    desc: 'We don\'t care about your pedigree. We care about your output. The best idea wins. The worst performers leave. There is no middle ground.',
    icon: Skull,
  },
];

const departments = ['All', 'Technology', 'Intelligence', 'Energy', 'Cement', 'Mining', 'Agri', 'Water', 'Corporate'];

export default function CareersPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D] relative overflow-hidden">
        <div className="absolute inset-0 data-grid-pattern opacity-60" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            {/* Background Check Banner */}
            <div className="inline-flex items-center gap-2.5 mb-8 px-4 py-2 border border-[rgba(139,157,175,0.2)] bg-[rgba(139,157,175,0.04)] rounded-sm">
              <Shield size={12} className="text-[#8B9DAF]" />
              <span className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold tracking-[0.25em] text-[#8B9DAF] uppercase">Background Check: Sovereign</span>
            </div>
            <p className="section-label mb-4">Careers</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              We Don&apos;t Write Code.<br />We Build Digital Sovereignty.
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Join the architects of the new African infrastructure. 3,200+ positions. 7 verticals. 5 countries. Zero room for mediocrity.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* The Mission */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">The Mission</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              Not Just a Job.<br />An Assignment.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: '3,200+', label: 'Positions by 2028', desc: 'Every one directly impacting sovereign infrastructure.' },
              { value: '7', label: 'Industrial Verticals', desc: 'One integrated stack. Energy powers the compute. Compute optimizes the cement. Cement builds the data centers. The flywheel is real.' },
              { value: '5', label: 'Countries', desc: '5 countries today. 12+ by 2030. We are not expanding — we are onboarding.' },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.1}>
                <div className="card p-8 h-full text-center">
                  <p className="text-5xl md:text-6xl font-bold text-white mb-2 stat-mono">{item.value}</p>
                  <div className="accent-line mx-auto mb-4" />
                  <p className="text-[14px] font-semibold text-white mb-2">{item.label}</p>
                  <p className="text-[13px] text-[#999999] leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Open Positions</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Open Positions
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-4">Every role is mission-critical. There is no bench.</p>
          </FadeIn>

          {/* Department Filter Bar */}
          <FadeIn delay={0.05}>
            <div className="flex flex-wrap items-center gap-2 mb-10 pb-6 border-b border-[rgba(255,255,255,0.04)]">
              {departments.map((dept, i) => (
                <button
                  key={dept}
                  className={`px-3 py-1.5 rounded-sm text-[11px] font-semibold tracking-wide uppercase transition-all ${
                    i === 0
                      ? 'bg-[rgba(139,157,175,0.12)] text-[#8B9DAF] border border-[rgba(139,157,175,0.2)]'
                      : 'bg-transparent text-[#666666] border border-[rgba(255,255,255,0.04)] hover:text-[#999999] hover:border-[rgba(255,255,255,0.08)]'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </FadeIn>

          <div className="space-y-0">
            {positions.map((pos, i) => (
              <FadeIn key={pos.title} delay={i * 0.03}>
                <div className="vertical-row group flex flex-col md:flex-row md:items-center justify-between py-5 px-4 cursor-pointer">
                  <div className="flex-1 min-w-0 mb-2 md:mb-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-[15px] font-bold text-white group-hover:text-[#CCCCCC] transition-colors">{pos.title}</h3>
                      {pos.clearance && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)] text-[9px] font-bold tracking-[0.15em] text-[#8B9DAF] uppercase font-[family-name:var(--font-space-mono)]">
                          <Shield size={9} /> Background Check Req.
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[11px] text-[#666666] font-semibold uppercase tracking-wide">{pos.department}</span>
                      <span className="text-[11px] text-[#666666] flex items-center gap-1"><MapPin size={10} />{pos.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-md bg-[rgba(255,255,255,0.04)] text-[10px] font-semibold text-[#999999] tracking-wide">{pos.type}</span>
                    <span className="px-3 py-1 rounded-md bg-[rgba(255,255,255,0.04)] text-[10px] font-semibold text-[#999999] tracking-wide">{pos.level}</span>
                    <ChevronRight size={14} className="vertical-arrow text-[rgba(255,255,255,0.1)] group-hover:text-white transition-all" />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Selection Process */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Selection Process</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Four Gates. No Shortcuts.
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">Every candidate passes through the same process. No exceptions. No fast tracks.</p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {selectionSteps.map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.1}>
                <div className="card p-6 md:p-8 h-full relative">
                  {/* Step number */}
                  <span className="font-[family-name:var(--font-space-mono)] text-[11px] font-bold tracking-[0.2em] text-[rgba(139,157,175,0.35)] uppercase block mb-5">Phase {step.step}</span>
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.1)] flex items-center justify-center mb-4">
                    <step.icon size={18} className="text-[#8B9DAF]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[15px] font-bold text-white mb-2">{step.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[13px] text-[#999999] leading-[1.7]">{step.desc}</p>
                  {/* Connector line to next step */}
                  {i < selectionSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-[rgba(255,255,255,0.06)]" />
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* The Standard */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">The Standard</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              What We Demand.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cultureCards.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.1)] flex items-center justify-center">
                      <item.icon size={16} className="text-[#8B9DAF]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  </div>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">What You Get</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              The Toolkit.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <FadeIn key={b.title} delay={i * 0.06}>
                <div className="card p-6 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-3">
                    <b.icon size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{b.title}</h4>
                  <p className="text-[12px] text-[#999999] leading-relaxed">{b.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 data-grid-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">The Continent Doesn&apos;t Wait.</h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-4">If you&apos;re reading this, you&apos;re either the caliber of engineer we need \u2014 or you&apos;re not. There&apos;s only one way to find out.</p>
            <p className="text-[13px] text-[#666666] font-[family-name:var(--font-space-mono)] mb-12">General applications: <a href="mailto:careers@harchcorp.com" className="text-[rgba(139,157,175,0.7)] hover:text-[#8B9DAF] transition-colors">careers@harchcorp.com</a></p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">Apply Now <ArrowRight size={14} /></Link>
              <Link href="/about" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">About Harch Corp</Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
