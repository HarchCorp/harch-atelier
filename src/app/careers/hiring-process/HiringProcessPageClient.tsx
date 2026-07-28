'use client';

import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  Phone,
  Code,
  Users,
  Crown,
  CheckCircle,
  Shield,
  Zap,
  Handshake,
  Lightbulb,
  Clock,
  Mail,
  Accessibility,
  BookOpen,
  Target,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const processSteps = [
  {
    step: '01',
    icon: FileText,
    title: 'Application',
    description: 'Submit your application online. Include your resume and a brief note on why Harch Corp and why this role. We review every application — no automated rejections.',
    timeline: 'Anytime',
    detail: 'We read every application personally. No keyword filters, no auto-reject algorithms. A real human reviews your materials within 5 business days.',
  },
  {
    step: '02',
    icon: Phone,
    title: 'Initial Screen',
    description: 'A 30-minute conversation with a recruiter to discuss your background, interests, and alignment with the role. This is as much for you to learn about us as for us to learn about you.',
    timeline: '30 minutes',
    detail: 'We want to understand your story, your motivations, and what you\'re looking for. Come with questions — this is a two-way conversation.',
  },
  {
    step: '03',
    icon: Code,
    title: 'Technical Assessment',
    description: 'A role-specific challenge designed to reflect real work you\'d do at Harch Corp. Engineers code, architects design, operators plan. We assess how you think, not just what you know.',
    timeline: '2–4 hours',
    detail: 'No trick questions, no whiteboard puzzles. The assessment mirrors actual Harch Corp work. You\'ll have clear instructions and can use any resources you\'d use on the job.',
  },
  {
    step: '04',
    icon: Users,
    title: 'Team Interview',
    description: 'Meet 2–3 members of the team you\'d be joining. Conversations focus on collaboration, problem-solving, and cultural alignment. We want to see how you work with others.',
    timeline: '60 minutes',
    detail: 'This is about mutual fit. You\'ll discuss past projects, how you handle disagreements, and what great teamwork looks like to you. Be yourself.',
  },
  {
    step: '05',
    icon: Crown,
    title: 'Leadership Interview',
    description: 'A conversation with a senior leader in your vertical. They assess strategic thinking, sovereignty mindset, and long-term potential. This is also your chance to understand the vision directly.',
    timeline: '45 minutes',
    detail: 'Our leaders are accessible and genuinely curious about the people who might join. Come prepared to discuss the bigger picture — where Africa\'s infrastructure is headed and how you want to contribute.',
  },
  {
    step: '06',
    icon: CheckCircle,
    title: 'Offer',
    description: 'Decision within 5 business days of your final interview. If yes, you\'ll receive a comprehensive offer with transparent compensation details, equity information, and a clear onboarding plan.',
    timeline: '5 business days',
    detail: 'We move fast because we respect your time. If we make an offer, you\'ll have all the information you need to make your decision — no hidden terms, no pressure tactics.',
  },
];

const traits = [
  {
    icon: Shield,
    title: 'Sovereignty Mindset',
    description: 'You think like an owner and care about Africa\'s self-determination. Every decision you make considers the long-term impact on the continent\'s independence. You don\'t just build products — you build infrastructure that empowers.',
    color: 'rgba(139, 157, 175, 0.7)',
  },
  {
    icon: Target,
    title: 'Technical Excellence',
    description: 'You hold yourself to world-class standards and have the track record to prove it. You write code that scales, design systems that don\'t fail, and solve problems that others consider impossible. Competence is non-negotiable.',
    color: 'rgba(0, 255, 136, 0.7)',
  },
  {
    icon: Zap,
    title: 'Bias for Action',
    description: 'The continent cannot wait. You move fast, make decisions with incomplete information, and iterate your way to the right answer. Analysis paralysis is not in your vocabulary. You ship.',
    color: 'rgba(255, 200, 0, 0.7)',
  },
  {
    icon: Handshake,
    title: 'Collaborative Spirit',
    description: 'Our 7 verticals succeed because they work together. You seek out cross-functional perspectives, share knowledge generously, and measure success by collective outcomes. Ego stays at the door.',
    color: 'rgba(255, 100, 100, 0.7)',
  },
];

const tips = [
  {
    number: '01',
    title: 'Understand Our Thesis',
    description: 'Read about our verticals, our sovereignty mission, and why we exist. The best candidates show they understand not just the role, but the bigger picture of what Harch Corp is building for Africa.',
  },
  {
    number: '02',
    title: 'Be Specific About Impact',
    description: 'Don\'t just list skills — tell us what you\'ve built and what outcome it produced. We care about measurable impact: systems scaled, revenue generated, problems solved. Numbers speak louder than adjectives.',
  },
  {
    number: '03',
    title: 'Show Your Thinking Process',
    description: 'During technical assessments, narrate your approach. We\'re more interested in how you think than in perfect answers. Trade-offs, edge cases, and questioning assumptions demonstrate seniority.',
  },
  {
    number: '04',
    title: 'Ask Hard Questions',
    description: 'The best interviews are conversations. Ask about our technical challenges, our strategy, our failures. Candidates who challenge our thinking stand out — we want people who make us better.',
  },
  {
    number: '05',
    title: 'Be Honest About Gaps',
    description: 'Nobody knows everything. If you don\'t have experience with a specific technology or domain, say so — and explain how you\'d learn it. Intellectual honesty beats manufactured confidence every time.',
  },
];

export default function HiringProcessPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">How We Hire</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Transparent by<br />Design
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              We believe candidates deserve clarity. Our hiring process is transparent, fair, and designed to give you every opportunity to show your best work. No black boxes, no ghosting, no surprises.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex items-center gap-6 mt-8 text-[13px] text-[#666666]">
              <span className="flex items-center gap-2"><Clock size={14} /> Average: 3–4 weeks</span>
              <span className="flex items-center gap-2"><Mail size={14} /> Response within 5 business days</span>
              <span className="flex items-center gap-2"><Eye size={14} /> Every application reviewed by a human</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Our Hiring Philosophy */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <p className="section-label mb-4">Our Philosophy</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-8">
                Hiring Is the Most Important Thing We Do
              </h2>
              <p className="text-[16px] text-[#999999] leading-[1.8]">
                Every person who joins Harch Corp shapes the future of Africa&apos;s industrial infrastructure. That&apos;s why we treat hiring with the same rigor and intentionality as everything else we build. We look for people who combine world-class capability with a genuine commitment to the continent&apos;s sovereignty. We evaluate fairly, move quickly, and communicate honestly throughout the process. If you&apos;re talented and driven, we want to make it as easy as possible for you to join us.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">The Process</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Six Steps to Harch Corp
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              A clear, predictable process so you always know where you stand.
            </p>
          </FadeIn>
          <div className="space-y-6">
            {processSteps.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.06}>
                <div className="card p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
                    <div className="flex items-start gap-4 md:min-w-[280px]">
                      <div className="w-12 h-12 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center shrink-0">
                        <step.icon size={20} className="text-white" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-[#666666] stat-mono uppercase tracking-wider">Step {step.step}</span>
                        <h3 className="text-xl font-bold text-white mt-0.5">{step.title}</h3>
                        <span className="text-[11px] text-[#666666] flex items-center gap-1 mt-1"><Clock size={10} /> {step.timeline}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] text-[#999999] leading-[1.7] mb-3">{step.description}</p>
                      <p className="text-[13px] text-[#666666] leading-[1.6] border-l-2 border-white/[0.06] pl-4">{step.detail}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* What We Look For */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">What We Look For</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Four Core Traits
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Skills can be taught. Mindset cannot. We hire for these four traits above all else.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {traits.map((trait, i) => (
              <FadeIn key={trait.title} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-5">
                    <trait.icon size={18} style={{ color: trait.color }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{trait.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{trait.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Tips for Success */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Tips for Success</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Set Yourself Apart
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              What distinguishes great candidates from good ones. These tips come directly from our hiring managers.
            </p>
          </FadeIn>
          <div className="space-y-4">
            {tips.map((tip, i) => (
              <FadeIn key={tip.number} delay={i * 0.06}>
                <div className="vertical-row group flex flex-col md:flex-row md:items-start gap-4 py-6 px-4">
                  <span className="text-[36px] font-extrabold text-white/[0.06] leading-none stat-mono shrink-0">{tip.number}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{tip.title}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.7]">{tip.description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Accommodations */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="section-label mb-4">Accessibility</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-6">
                Accommodations
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[16px] text-[#999999] leading-[1.7] mb-8">
                We are committed to making our hiring process accessible to everyone. If you need any accommodation during the interview process — whether for a disability, religious observance, or any other reason — please let us know. We will work with you to ensure you have every opportunity to demonstrate your abilities.
              </p>
              <div className="space-y-5">
                {[
                  'Request accommodations at any stage — no questions asked about the reason',
                  'Alternative interview formats available (video, phone, asynchronous)',
                  'Extended time on assessments when needed',
                  'Accessible document formats and communication methods',
                  'Dedicated accommodations coordinator for every candidate',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Accessibility size={16} className="text-white/30 mt-0.5 shrink-0" />
                    <p className="text-[14px] text-[#999999]">{item}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Mail size={24} className="text-white" strokeWidth={1.5} />
                  <h3 className="text-lg font-bold text-white">Request an Accommodation</h3>
                </div>
                <p className="text-[14px] text-[#999999] leading-[1.7] mb-6">
                  Contact our accommodations team at any point during your interview process. All requests are confidential and have no impact on hiring decisions.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <span className="text-[13px] text-[#999999]">Email</span>
                    <a href="mailto:accommodations@harchcorp.com" className="text-[14px] font-semibold text-[rgba(139,157,175,0.7)] hover:text-[#8B9DAF] transition-colors">
                      accommodations@harchcorp.com
                    </a>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <span className="text-[13px] text-[#999999]">Response Time</span>
                    <span className="text-[14px] font-bold text-white stat-mono">Within 24 hours</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                    <span className="text-[13px] text-[#999999]">Confidentiality</span>
                    <span className="text-[14px] font-bold text-white stat-mono">100%</span>
                  </div>
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
              Ready to Join?
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              The process is clear. The mission is compelling. Africa&apos;s industrial future needs builders like you.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/careers" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                View Open Positions <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Ask a Question
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
