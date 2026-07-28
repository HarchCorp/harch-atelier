'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  ArrowRight,
  Shield,
  Zap,
  Sprout,
  Mountain,
  Droplets,
  Brain,
  Play,
  ChevronRight,
  Download,
  Users,
  Star,
  TrendingUp,
  Clock,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

const industries = ['All', 'Finance', 'Government', 'Energy', 'Agriculture', 'Mining', 'Water', 'Industrial'];

const caseStudies = [
  {
    organization: "Regional Central Bank (Illustrative)",
    fullName: "Regional Central Bank — Illustrative Scenario",
    useCase: 'Anti-Money Laundering',
    vertical: 'Intelligence',
    sector: 'Finance',
    description: 'Sovereign AI-powered transaction monitoring system processing 12M+ daily transactions across 8 West African nations, detecting previously invisible laundering patterns with 94% accuracy.',
    metric: '94%',
    metricLabel: 'Detection Accuracy',
    icon: Shield,
    result: 'Identified $340M in suspicious transactions in first 6 months. Reduced false positives by 67% compared to legacy rule-based systems.',
  },
  {
    organization: "National Utility Operator (Illustrative)",
    fullName: "National Utility Operator — Illustrative Scenario",
    useCase: 'Grid Optimization',
    vertical: 'Energy',
    sector: 'Energy',
    description: 'AI-driven demand forecasting and grid balancing across Morocco\'s national power network, optimizing 14GW of generation capacity with real-time load distribution.',
    metric: '23%',
    metricLabel: 'Efficiency Gain',
    icon: Zap,
    result: 'Reduced peak load stress by 23% and prevented 147 outage events through predictive maintenance. Annual savings of MAD 890M.',
  },
  {
    organization: 'Senegal Ministry of Agriculture',
    fullName: 'Senegal Ministry of Agriculture',
    useCase: 'Crop Prediction & Yield Optimization',
    vertical: 'Agri',
    sector: 'Agriculture',
    description: 'Satellite-verified crop health monitoring and yield prediction platform covering 3.2M hectares of arable land across Senegal\'s 14 regions.',
    metric: '31%',
    metricLabel: 'Yield Improvement',
    icon: Sprout,
    result: 'Improved smallholder yields by 31% in the Groundnut Basin. Early drought warning saved 45,000 hectares of crops in 2025.',
  },
  {
    organization: "National Phosphate Operator (Illustrative)",
    fullName: "National Phosphate Operator — Illustrative Scenario",
    useCase: 'Mining Analytics & Resource Optimization',
    vertical: 'Mining',
    sector: 'Mining',
    description: 'Geospatial AI for phosphate deposit mapping and extraction optimization across Khouribga, Benguerir, and Gantour mining complexes.',
    metric: '18%',
    metricLabel: 'Extraction Efficiency',
    icon: Mountain,
    result: 'Reduced waste rock extraction by 18%, saving $220M annually. Predictive geological models improved ore grade accuracy by 42%.',
  },
  {
    organization: 'RAMED',
    fullName: 'RAMED (Meknes Water Distribution Authority)',
    useCase: 'Water Distribution Intelligence',
    vertical: 'Water',
    sector: 'Water',
    description: 'IoT sensor network and AI-driven leak detection across 1,200km of distribution infrastructure, reducing non-revenue water losses in the Meknes metropolitan area.',
    metric: '38%',
    metricLabel: 'Leak Reduction',
    icon: Droplets,
    result: 'Reduced non-revenue water from 32% to 19.8%. Identified 847 leaks in first 90 days, recovering 4.2M cubic meters of water annually.',
  },
  {
    organization: "Pan-African Bank (Illustrative)",
    fullName: "Pan-African Bank — Illustrative Scenario",
    useCase: 'Real-Time Fraud Detection',
    vertical: 'Intelligence',
    sector: 'Finance',
    description: 'Neural network-based fraud detection engine processing 8.5M daily card transactions across 12 African countries, with sub-50ms decision latency.',
    metric: '99.7%',
    metricLabel: 'Fraud Catch Rate',
    icon: Brain,
    result: 'Stopped $89M in fraudulent transactions in 2025. False positive rate reduced to 0.03%, improving customer experience and reducing manual review workload by 74%.',
  },
];

const videoTestimonials = [
  {
    name: 'Amadou Diallo',
    title: 'Chief Technology Officer',
    organization: "Regional Central Bank (Illustrative)",
    quote: 'Harch Corp didn\'t just deliver a product — they delivered sovereignty over our financial intelligence.',
  },
  {
    name: 'Fatima Zahra El Amrani',
    title: 'Director of Operations',
    organization: "National Utility Operator (Illustrative)",
    quote: 'The grid optimization platform has transformed how we manage Morocco\'s energy future.',
  },
  {
    name: 'Mamadou Ndiaye',
    title: 'Permanent Secretary',
    organization: 'Senegal Ministry of Agriculture',
    quote: 'For the first time, our farmers have the same analytical power as industrial agriculture — at sovereign scale.',
  },
];

export default function CustomersPageClient() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredStudies = activeFilter === 'All'
    ? caseStudies
    : caseStudies.filter((cs) => cs.sector === activeFilter);

  return (
    <div className="bg-[#121212]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Customer Stories</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Transforming Africa,<br />One System at a Time
            </h1>
            <div className="accent-line mb-6" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              From central banks to national utilities, African organizations are building sovereign 
              capabilities with Harch Corp. These are their stories — measured in outcomes, not promises.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ FEATURED STORY ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Featured</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              Sovereign AI for Anti-Money Laundering
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="card p-8 md:p-12">
              <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                      <Shield size={18} className="text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Regional Central Bank</p>
                      <p className="text-[12px] text-[#666666]">Regional Central Bank (Illustrative Scenario)</p>
                    </div>
                  </div>
                  <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">
                    The Illustrative Scenario needed a sovereign AI system to combat money laundering across 
                    8 nations sharing the CFA franc. Legacy rule-based systems were producing 95% false positives, drowning 
                    analysts in noise while sophisticated laundering networks exploited blind spots between jurisdictions.
                  </p>
                  <p className="text-[15px] text-[#999999] leading-[1.7] mb-8">
                    Harch Corp deployed a purpose-built neural network trained on 14 years of West African transaction patterns, 
                    integrated with each nation&apos;s banking infrastructure through a federated learning architecture that preserves 
                    data sovereignty. The system processes 12M+ transactions daily across 8 countries in real-time, identifying 
                    cross-border laundering patterns that were previously invisible.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[rgba(255,255,255,0.06)]">
                    <div>
                      <p className="stat-mono text-2xl md:text-3xl font-bold text-white mb-1">94%</p>
                      <p className="text-[12px] text-[#666666]">Detection Accuracy</p>
                    </div>
                    <div>
                      <p className="stat-mono text-2xl md:text-3xl font-bold text-white mb-1">$340M</p>
                      <p className="text-[12px] text-[#666666]">Suspicious TXN Identified</p>
                    </div>
                    <div>
                      <p className="stat-mono text-2xl md:text-3xl font-bold text-white mb-1">67%</p>
                      <p className="text-[12px] text-[#666666]">False Positive Reduction</p>
                    </div>
                    <div>
                      <p className="stat-mono text-2xl md:text-3xl font-bold text-white mb-1">12M+</p>
                      <p className="text-[12px] text-[#666666]">Daily Transactions</p>
                    </div>
                  </div>
                </div>
                <div className="lg:w-[400px] flex-shrink-0">
                  <div className="bg-[#0D0D0D] rounded-xl border border-[rgba(255,255,255,0.06)] p-6 h-full">
                    <p className="section-label mb-4">Key Results</p>
                    <div className="space-y-4">
                      {[
                        'Identified $340M in suspicious transactions in first 6 months of operation',
                        'Reduced false positive rate by 67%, freeing 23 analysts for high-value investigations',
                        'Cross-border pattern detection across 8 CFA franc zone nations',
                        'Federated learning preserves data sovereignty for each member state',
                        'Sub-100ms decision latency on real-time transaction screening',
                        'Integrated with existing SWIFT and RTGS infrastructure',
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <CheckCircle2 size={14} className="text-white/40 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                          <p className="text-[13px] text-[#999999] leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ INDUSTRY FILTER + CASE STUDIES ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Case Studies</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              By Industry
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-12">
              Explore how organizations across sectors are deploying Harch Corp solutions 
              to achieve measurable, sovereign outcomes.
            </p>
          </FadeIn>

          {/* Filter Tags */}
          <FadeIn delay={0.1}>
            <div className="flex flex-wrap gap-2 mb-12">
              {industries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => setActiveFilter(industry)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeFilter === industry
                      ? 'bg-white text-black'
                      : 'border border-[rgba(255,255,255,0.08)] text-[#999999] hover:border-[rgba(255,255,255,0.15)] hover:text-white'
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </FadeIn>

          {/* Case Study Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudies.map((study, i) => (
              <FadeIn key={study.organization} delay={i * 0.08}>
                <div className="card p-6 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                      <study.icon size={18} className="text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-white">{study.organization}</p>
                      <p className="text-[11px] text-[#666666]">{study.fullName.length > 40 ? study.fullName.substring(0, 40) + '…' : study.fullName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="status-badge status-badge-active">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      {study.vertical}
                    </span>
                    <span className="status-badge status-badge-engineering">
                      {study.sector}
                    </span>
                  </div>

                  <h3 className="text-[17px] font-bold text-white mb-2">{study.useCase}</h3>
                  <p className="text-[13px] text-[#999999] leading-relaxed mb-6 flex-1">{study.description}</p>

                  <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="stat-mono text-2xl font-bold text-white">{study.metric}</p>
                        <p className="text-[11px] text-[#666666]">{study.metricLabel}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[12px] text-[#666666] hover:text-white transition-colors cursor-pointer">
                        <span>Read case study</span>
                        <ChevronRight size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CUSTOMER ADVISORY BOARD ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/2">
              <FadeIn>
                <p className="section-label mb-4">Co-Creation</p>
                <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
                  Customer Advisory Board
                </h2>
                <div className="accent-line mb-6" />
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">
                  Our Customer Advisory Board brings together senior leaders from our most strategic accounts 
                  to co-create the future of Harch Corp products. No other industrial conglomerate in Africa 
                  offers this level of customer participation in product development.
                </p>
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-8">
                  Board members gain early access to upcoming features, direct influence on product roadmaps, 
                  and executive networking with peers across African industries.
                </p>
                <Link
                  href="/customers/advisory-board"
                  className="inline-flex items-center gap-2 text-[14px] text-white font-medium hover:opacity-80 transition-opacity"
                >
                  Learn about the Advisory Board
                  <ArrowRight size={14} />
                </Link>
              </FadeIn>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              {[
                { icon: Star, label: 'Early Access', desc: 'Preview features 6 months before general availability' },
                { icon: TrendingUp, label: 'Direct Influence', desc: 'Shape product roadmaps with your requirements' },
                { icon: Users, label: 'Executive Networking', desc: 'Connect with C-suite peers across 5 countries' },
                { icon: BarChart3, label: 'Strategic Insights', desc: 'Exclusive market intelligence and trend briefings' },
              ].map((item, i) => (
                <FadeIn key={item.label} delay={i * 0.1}>
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

      {/* ═══ VIDEO TESTIMONIALS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Testimonials</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              In Their Own Words
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Hear directly from the leaders transforming their organizations with Harch Corp.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videoTestimonials.map((testimonial, i) => (
              <FadeIn key={testimonial.name} delay={i * 0.1}>
                <div className="card overflow-hidden h-full flex flex-col">
                  {/* Video placeholder with play button */}
                  <div className="relative h-52 bg-[#0A0A0A] flex items-center justify-center border-b border-[rgba(255,255,255,0.06)]">
                    <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer group">
                      <Play size={24} className="text-white/60 group-hover:text-white/90 transition-colors ml-1" fill="currentColor" />
                    </div>
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                      <Clock size={10} className="text-white/30" />
                      <span className="text-[10px] text-white/30 stat-mono">3:42</span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-[14px] text-[#999999] leading-[1.7] mb-6 flex-1 italic">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
                      <p className="text-[14px] font-bold text-white">{testimonial.name}</p>
                      <p className="text-[12px] text-[#666666]">{testimonial.title}</p>
                      <p className="text-[12px] text-[#444444]">{testimonial.organization}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">
              Ready to Transform?
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              Join the organizations building Africa&apos;s sovereign future. Talk to our team about 
              how Harch Corp can deliver measurable outcomes for your mission.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all"
              >
                Become a Customer <ArrowRight size={14} />
              </Link>
              <button className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                <Download size={14} />
                Download Case Studies
              </button>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
