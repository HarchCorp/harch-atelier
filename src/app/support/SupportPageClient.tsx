'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  ArrowRight,
  MessageSquare,
  BookOpen,
  Activity,
  Phone,
  Mail,
  FileText,
  Shield,
  Code,
  CreditCard,
  Lock,
  HelpCircle,
  Users,
  CheckCircle2,
  Clock,
  Headphones,
  Star,
  ChevronRight,
  AlertCircle,
  Paperclip,
  Send,
  ExternalLink,
  Zap,
  HeartHandshake,
} from 'lucide-react';

const supportTiers = [
  {
    name: 'Community',
    price: 'Free',
    priceNote: '',
    description: 'Self-service support with community-driven resources for developers and small teams getting started with Harch Corp.',
    features: [
      { label: 'Community Forum', included: true },
      { label: 'Documentation & Guides', included: true },
      { label: '48-hour Response Time', included: true },
      { label: 'Business Hours Coverage', included: true },
      { label: 'Email Support', included: false },
      { label: 'Chat Support', included: false },
      { label: 'Dedicated Engineer', included: false },
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Professional',
    price: '$500',
    priceNote: '/mo',
    description: 'Priority support with dedicated engineers for production deployments requiring guaranteed response times and expert guidance.',
    features: [
      { label: 'Email + Chat Support', included: true },
      { label: '4-hour Response Time', included: true },
      { label: '24/7 for P1 Incidents', included: true },
      { label: 'Dedicated Support Engineer', included: true },
      { label: 'Quarterly Business Reviews', included: true },
      { label: 'Custom SLAs', included: false },
      { label: 'On-site Support', included: false },
    ],
    cta: 'Contact Sales',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceNote: '',
    description: 'White-glove support with a dedicated team, custom SLAs, and executive sponsorship for mission-critical deployments at scale.',
    features: [
      { label: '24/7 Phone + Chat Support', included: true },
      { label: '1-hour P1 Response Time', included: true },
      { label: 'Dedicated Support Team', included: true },
      { label: 'Custom SLAs & KPIs', included: true },
      { label: 'On-site Support', included: true },
      { label: 'Executive Sponsor', included: true },
      { label: 'Proactive Monitoring', included: true },
    ],
    cta: 'Talk to Us',
    highlight: false,
  },
];

const quickActions = [
  { icon: MessageSquare, title: 'Create Ticket', desc: 'Submit a support request and track resolution progress', href: '#submit-ticket' },
  { icon: BookOpen, title: 'Knowledge Base', desc: 'Browse articles, tutorials, and troubleshooting guides', href: '#knowledge-base' },
  { icon: Activity, title: 'System Status', desc: 'Check real-time status of all Harch Corp services', href: '/status' },
  { icon: Phone, title: 'Contact Sales', desc: 'Discuss support tiers, pricing, and enterprise options', href: '/contact' },
];

const knowledgeCategories = [
  { icon: HelpCircle, title: 'Getting Started', articles: 47, desc: 'Setup guides, quickstarts, and initial configuration' },
  { icon: Users, title: 'Account Management', articles: 32, desc: 'Billing, user management, and organization settings' },
  { icon: AlertCircle, title: 'Technical Issues', articles: 89, desc: 'Troubleshooting, error codes, and known issues' },
  { icon: CreditCard, title: 'Billing', articles: 24, desc: 'Invoices, payment methods, and usage reporting' },
  { icon: Shield, title: 'Security', articles: 38, desc: 'Compliance, access control, and incident response' },
  { icon: Code, title: 'API & SDKs', articles: 63, desc: 'Integration guides, API reference, and SDK documentation' },
];

export default function SupportPageClient() {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [ticketDescription, setTicketDescription] = useState('');

  return (
    <div className="bg-[#121212]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Support</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Support Hub
            </h1>
            <div className="accent-line mb-6" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              From self-service resources to dedicated enterprise support, we&apos;re here to ensure 
              your Harch Corp deployment runs flawlessly. Choose the tier that matches your mission criticality.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SUPPORT TIERS ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Plans</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Support Tiers
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Every deployment deserves expert support. Choose the level that matches your operational requirements.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportTiers.map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 0.1}>
                <div className={`card p-8 h-full flex flex-col ${tier.highlight ? 'border-white/20' : ''}`}>
                  {tier.highlight && (
                    <div className="flex items-center gap-2 mb-6">
                      <Star size={12} className="text-white" fill="currentColor" />
                      <span className="text-[11px] font-bold text-white tracking-wider uppercase">Most Popular</span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-1">{tier.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="stat-mono text-3xl font-bold text-white">{tier.price}</span>
                      {tier.priceNote && <span className="text-[14px] text-[#666666]">{tier.priceNote}</span>}
                    </div>
                  </div>
                  <p className="text-[13px] text-[#999999] leading-relaxed mb-8">{tier.description}</p>
                  <div className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <div key={feature.label} className="flex items-center gap-3">
                        <CheckCircle2 size={14} className={feature.included ? 'text-white/60' : 'text-white/15'} strokeWidth={1.5} />
                        <span className={`text-[13px] ${feature.included ? 'text-[#999999]' : 'text-[#444444]'}`}>{feature.label}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={tier.name === 'Community' ? '/docs' : '/contact'}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                      tier.highlight
                        ? 'bg-white text-black hover:bg-white/90'
                        : 'border border-[rgba(255,255,255,0.12)] text-white hover:border-white/25 hover:bg-white/[0.03]'
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ QUICK ACTIONS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Quick Actions</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              What Do You Need?
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, i) => (
              <FadeIn key={action.title} delay={i * 0.08}>
                <Link href={action.href} className="card p-6 h-full block hover:border-[rgba(255,255,255,0.15)] group">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
                    <action.icon size={20} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[15px] font-bold text-white mb-2 group-hover:text-white">{action.title}</h3>
                  <p className="text-[12px] text-[#666666] leading-relaxed">{action.desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-[12px] text-[#666666] group-hover:text-white transition-colors">
                    <span>Go</span>
                    <ChevronRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ KNOWLEDGE BASE ═══ */}
      <section id="knowledge-base" className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Resources</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Knowledge Base
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Self-service resources to help you resolve issues, optimize deployments, and master Harch Corp products.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {knowledgeCategories.map((category, i) => (
              <FadeIn key={category.title} delay={i * 0.06}>
                <div className="card p-6 h-full cursor-pointer hover:border-[rgba(255,255,255,0.15)] group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                      <category.icon size={18} className="text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[15px] font-bold text-white">{category.title}</h3>
                    </div>
                    <span className="stat-mono text-[12px] text-[#666666]">{category.articles} articles</span>
                  </div>
                  <p className="text-[12px] text-[#666666] leading-relaxed">{category.desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-[12px] text-[#666666] group-hover:text-white transition-colors">
                    <span>Browse articles</span>
                    <ChevronRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SUBMIT A TICKET ═══ */}
      <section id="submit-ticket" className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Request</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Submit a Ticket
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Describe your issue and our team will respond according to your support tier SLA.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="card p-8 md:p-10 max-w-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">Subject</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="w-full bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[#444444] focus:border-white/20 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">Priority</label>
                  <div className="flex gap-3">
                    {['Low', 'Medium', 'High', 'Critical'].map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setTicketPriority(priority)}
                        className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-all ${
                          ticketPriority === priority
                            ? 'bg-white text-black'
                            : 'border border-[rgba(255,255,255,0.08)] text-[#999999] hover:border-white/15 hover:text-white'
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder="Describe the issue in detail. Include error messages, steps to reproduce, and expected behavior."
                    rows={6}
                    className="w-full bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[#444444] focus:border-white/20 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">Attachment</label>
                  <div className="border border-dashed border-[rgba(255,255,255,0.12)] rounded-lg p-8 text-center hover:border-white/20 transition-colors cursor-pointer">
                    <Paperclip size={20} className="text-[#444444] mx-auto mb-2" />
                    <p className="text-[13px] text-[#666666]">Drop files here or click to upload</p>
                    <p className="text-[11px] text-[#444444] mt-1">PNG, JPG, PDF, or log files up to 10MB</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all">
                    <Send size={14} />
                    Submit Ticket
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CUSTOMER SUCCESS ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Success</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Customer Success Management
            </h2>
            <div className="accent-line mb-6" />
          </FadeIn>
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="lg:w-1/2">
              <FadeIn delay={0.05}>
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">
                  Our Customer Success team doesn&apos;t just respond to issues — they proactively ensure you&apos;re 
                  extracting maximum value from your Harch Corp deployment. Every Enterprise and Professional 
                  customer is paired with a dedicated success manager who understands your business objectives 
                  and technical architecture.
                </p>
                <p className="text-[15px] text-[#999999] leading-[1.7]">
                  From onboarding through production scaling, your success manager serves as your internal 
                  advocate — coordinating resources across engineering, product, and executive teams to ensure 
                  your deployment delivers measurable outcomes.
                </p>
              </FadeIn>
            </div>
            <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Headphones, label: 'Dedicated Manager', desc: 'A named point of contact who knows your architecture and goals' },
                { icon: Zap, label: 'Proactive Monitoring', desc: 'We identify potential issues before they impact your operations' },
                { icon: FileText, label: 'Quarterly Reviews', desc: 'Structured reviews covering SLAs, KPIs, and optimization opportunities' },
                { icon: HeartHandshake, label: 'Onboarding Support', desc: 'Guided setup and configuration to accelerate time-to-value' },
              ].map((item, i) => (
                <FadeIn key={item.label} delay={i * 0.08}>
                  <div className="card p-6 h-full">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
                      <item.icon size={18} className="text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[14px] font-bold text-white mb-1">{item.label}</h3>
                    <p className="text-[12px] text-[#666666] leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SYSTEM STATUS LINK ═══ */}
      <section className="py-20 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <Link href="/status" className="card p-6 flex items-center justify-between group hover:border-[rgba(255,255,255,0.15)]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00FF88]" style={{ boxShadow: '0 0 6px rgba(0,255,136,0.5)' }} />
                  <span className="text-[14px] font-semibold text-white">Systems in Engineering Phase</span>
                </div>
                <span className="text-[12px] text-[#666666]">99.98% uptime over 90 days</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#666666] group-hover:text-white transition-colors">
                <span>View Status Page</span>
                <ExternalLink size={12} />
              </div>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden border-t border-[rgba(255,255,255,0.06)]">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">
              Need Help?
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              Our support team is available around the clock for critical issues. Don&apos;t hesitate to 
              reach out — we&apos;re here to keep your operations running.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all"
              >
                Contact Support <ArrowRight size={14} />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all"
              >
                Browse Documentation <BookOpen size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
