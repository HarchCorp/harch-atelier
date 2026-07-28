'use client';

import Link from 'next/link';
import {
  ArrowRight,
  DollarSign,
  Users,
  Rocket,
  Handshake,
  MessageSquare,
  Headphones,
  CheckCircle,
  Globe,
  Cpu,
  Zap,
  TrendingUp,
  Building2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const benefits = [
  {
    icon: DollarSign,
    title: '$50,000 in HarchOS Credits',
    description: 'Free GPU compute, storage, and API calls for 12 months. Enough to train models, run inference at scale, and build your product without infrastructure costs.',
    details: ['Free GPU compute (A100 & H100)', '50TB object storage', 'Unlimited API calls', '12-month credit period'],
    color: 'rgba(139, 157, 175, 0.7)',
  },
  {
    icon: Users,
    title: 'Technical Mentorship',
    description: 'Get guidance from Harch engineers who have built and scaled sovereign infrastructure across Africa. Dedicated support to help you architect for scale.',
    details: ['Dedicated solutions architect', 'Architecture reviews', 'Bi-weekly office hours', 'Code review sessions'],
    color: 'rgba(0, 255, 136, 0.7)',
  },
  {
    icon: Rocket,
    title: 'Go-to-Market Support',
    description: 'Leverage Harch Corp\'s network and brand to accelerate your go-to-market. Co-market your solution to our enterprise customer base across Africa.',
    details: ['Co-marketing opportunities', 'Customer introductions', 'Event speaking slots', 'Case study features'],
    color: 'rgba(255, 200, 0, 0.7)',
  },
  {
    icon: Handshake,
    title: 'Investor Network',
    description: 'Access Harch Ventures portfolio companies and our network of development finance institutions, venture capital, and angel investors focused on African tech.',
    details: ['Harch Ventures portfolio access', 'DFI introductions', 'Demo day participation', 'Investor matchmaking'],
    color: 'rgba(255, 100, 100, 0.7)',
  },
  {
    icon: MessageSquare,
    title: 'Community Access',
    description: 'Join a curated community of Africa\'s most ambitious startup founders. Share knowledge, find co-founders, and build relationships that last beyond the program.',
    details: ['Private startup Slack channel', 'Peer networking events', 'Monthly founder meetups', 'Cross-program introductions'],
    color: 'rgba(180, 130, 255, 0.7)',
  },
  {
    icon: Headphones,
    title: 'Priority Support',
    description: 'Faster response times and dedicated support contacts for when things break. Migration assistance to help you move to HarchOS from other clouds.',
    details: ['4-hour response SLA', 'Dedicated support contact', 'Migration assistance', 'Emergency escalation path'],
    color: 'rgba(255, 160, 60, 0.7)',
  },
];

const successStories = [
  {
    name: 'DataSaheel',
    description: 'AI-powered agricultural analytics platform using satellite imagery and HarchOS GPU clusters to deliver crop predictions to 50,000+ farmers across West Africa.',
    location: 'Dakar, Senegal',
    stage: 'Series A',
    metric: '50K+ farmers served',
  },
  {
    name: 'NileSecure',
    description: 'Cybersecurity platform built on HarchOS sovereign infrastructure, providing zero-trust security solutions for African financial institutions and government agencies.',
    location: 'Cairo, Egypt',
    stage: 'Seed',
    metric: '12 enterprise clients',
  },
  {
    name: 'KoraHealth',
    description: 'Telemedicine and AI diagnostics platform running on HarchOS, delivering healthcare access to remote communities across Morocco and the Sahel region.',
    location: 'Casablanca, Morocco',
    stage: 'Pre-Series A',
    metric: '200K+ consultations',
  },
];

const applicationSteps = [
  {
    step: '01',
    title: 'Apply',
    description: 'Submit your application with company details, product overview, and how you plan to use HarchOS infrastructure. Applications are reviewed on a rolling basis.',
  },
  {
    step: '02',
    title: 'Review',
    description: 'Our team reviews your application within 10 business days. We assess technical readiness, market potential, and alignment with sovereign infrastructure values.',
  },
  {
    step: '03',
    title: 'Onboard',
    description: 'Upon acceptance, you\'ll receive your HarchOS credits, be paired with a solutions architect, and get access to the startup community and all program benefits.',
  },
  {
    step: '04',
    title: 'Scale',
    description: 'Build, iterate, and scale on sovereign infrastructure. Access ongoing mentorship, investor introductions, and co-marketing opportunities as you grow.',
  },
];

export default function StartupProgramPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Startup Program</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Build on<br />Sovereign Infrastructure
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Empowering Africa&apos;s most ambitious startups with $50,000 in HarchOS credits, technical mentorship, and the network to scale. Build on infrastructure that keeps your data on the continent.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-start gap-4 mt-8">
              <Link href="#apply" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Apply Now <ArrowRight size={14} />
              </Link>
              <Link href="#benefits" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                View Benefits
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Program Benefits */}
      <section id="benefits" className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Benefits</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Everything You Need to Scale
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              More than credits — a comprehensive support system designed to help African startups build, launch, and grow on sovereign infrastructure.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <FadeIn key={benefit.title} delay={i * 0.06}>
                <div className="card p-8 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-5">
                    <benefit.icon size={18} style={{ color: benefit.color }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-5">{benefit.description}</p>
                  <ul className="space-y-2 border-t border-white/[0.06] pt-4">
                    {benefit.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-[12px] text-[#999999]">
                        <CheckCircle size={10} className="text-white/30 shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="section-label mb-4">Eligibility</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-6">
                Who Should Apply
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[16px] text-[#999999] leading-[1.7]">
                The Harch Startup Program is designed for early-stage technology companies building on or migrating to HarchOS sovereign infrastructure. We prioritize startups solving problems that matter for Africa.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card p-8">
                <h3 className="text-lg font-bold text-white mb-6">Requirements</h3>
                <div className="space-y-5">
                  {[
                    { title: 'African-Founded or Africa-Focused', desc: 'Your startup must be founded in Africa or primarily serving African markets.' },
                    { title: 'Early Stage (Pre-Seed to Series A)', desc: 'Raised less than $5M in total funding. Pre-revenue startups with strong technical teams are welcome.' },
                    { title: 'Technical Product', desc: 'Building a software, AI, or technology product that can benefit from HarchOS infrastructure.' },
                    { title: 'Sovereign Mindset', desc: 'Committed to data sovereignty and keeping African data on African infrastructure.' },
                    { title: 'Active Development', desc: 'Have a working prototype or MVP, or are in active development with a clear roadmap.' },
                  ].map((req) => (
                    <div key={req.title} className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-white/50 mt-0.5 shrink-0" />
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

      {/* Success Stories */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Success Stories</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Startups Scaling on HarchOS
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              From AI agriculture to sovereign cybersecurity — African startups building the future on Harch infrastructure.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story, i) => (
              <FadeIn key={story.name} delay={i * 0.1}>
                <div className="card p-8 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                      <Building2 size={20} className="text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{story.name}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-[#666666]">
                        <MapPin size={10} /> {story.location}
                      </div>
                    </div>
                  </div>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-5">{story.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                    <span className="px-3 py-1 rounded-md bg-[rgba(255,255,255,0.04)] text-[10px] font-semibold text-[#999999] tracking-wide">
                      {story.stage}
                    </span>
                    <span className="text-[12px] text-white font-semibold">{story.metric}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Process</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              How to Join
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              A straightforward application process designed to get you building on sovereign infrastructure as quickly as possible.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {applicationSteps.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.1}>
                <div className="card p-8 h-full relative">
                  <span className="text-[48px] font-extrabold text-white/[0.06] leading-none stat-mono">{step.step}</span>
                  <h3 className="text-xl font-bold text-white mt-2 mb-3">{step.title}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="apply" className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">
              Ready to Build on Sovereign Infrastructure?
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              Join Africa&apos;s most ambitious startups building on HarchOS. $50,000 in credits, technical mentorship, and the network to scale — apply today.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Apply Now <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Contact Startup Team
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
