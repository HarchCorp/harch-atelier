'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Cpu, Landmark, Building, Globe } from 'lucide-react';

import { FadeIn } from '@/components/ui/motion';

const partnerCategories = [
  {
    icon: Cpu,
    title: 'Technology Partners',
    description: 'Leading technology companies providing hardware, software, and AI infrastructure to power Harch Intelligence and Harch Technology operations.',
    partners: ['GPU & Compute Providers', 'Cloud Platform Partners', 'AI/ML Framework Partners', 'Industrial IoT Providers', 'Cybersecurity Partners'],
  },
  {
    icon: Landmark,
    title: 'Financial Partners',
    description: 'International development finance institutions, sovereign wealth funds, and private equity firms providing capital for Harch Corp\'s $2.37B investment pipeline.',
    partners: ['Development Finance Institutions', 'Sovereign Wealth Funds', 'Infrastructure Funds', 'Commercial Banks', 'Export Credit Agencies'],
  },
  {
    icon: Building,
    title: 'Industrial Partners',
    description: 'Engineering firms, EPC contractors, and equipment suppliers collaborating on Harch Corp\'s construction and manufacturing projects.',
    partners: ['EPC Contractors', 'Engineering Consultancies', 'Equipment Manufacturers', 'Mining Services Companies', 'Construction Materials Suppliers'],
  },
  {
    icon: Globe,
    title: 'Government & Institutional Partners',
    description: 'National and regional governments, regulatory bodies, and international organizations supporting Harch Corp\'s mission of African industrial sovereignty.',
    partners: ['National Governments', 'Regional Development Agencies', 'Utility Companies', 'Academic Institutions', 'Industry Associations'],
  },
];

export default function PartnersPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-24 md:pt-40 md:pb-32 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6">Partners</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-[-0.01em] mb-8">
              Partner<br/>Ecosystem
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="max-w-2xl text-base md:text-lg text-[#999999] leading-relaxed">
              Harch Corp works with world-class partners across technology, finance, industry, 
              and government to build Africa&apos;s critical infrastructure.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Partner Categories */}
      <section className="py-24 border-t border-[rgba(255,255,255,0.06)] bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="space-y-20">
            {partnerCategories.map((category, i) => (
              <FadeIn key={category.title} delay={i * 0.15}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <category.icon size={18} className="text-white" strokeWidth={1.5} />
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-[-0.01em]">
                      {category.title}
                    </h2>
                  </div>
                  <p className="text-sm text-[#999999] leading-relaxed mb-8 max-w-2xl">
                    {category.description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {category.partners.map((partner) => (
                      <span
                        key={partner}
                        className="px-4 py-2 border border-[rgba(255,255,255,0.06)] rounded-xl text-xs text-[#999999]"
                      >
                        {partner}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-[rgba(255,255,255,0.06)] bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-6">
              Become a Partner
            </h2>
            <p className="max-w-xl mx-auto text-base text-[#666666] mb-10">
              Join the ecosystem building Africa&apos;s industrial sovereignty. We&apos;re always 
              looking for strategic partners who share our mission.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#0A0F1A] text-white px-8 py-4 rounded-xl text-sm font-medium hover:bg-[#0A0F1A]/90 transition-colors"
            >
              Partner With Us
              <ArrowRight size={14} />
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

      {/* Partnership Models */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Partnership Models</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-16">
              Three Ways to Partner
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FadeIn delay={0.1}>
              <div className="fine-card p-8 rounded-lg">
                <div className="w-10 h-10 rounded-md bg-[rgba(139,157,175,0.1)] border border-[rgba(139,157,175,0.2)] flex items-center justify-center mb-5">
                  <Cpu className="w-5 h-5 text-[#8B9DAF]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Strategic Alliance</h3>
                <p className="text-[14px] text-[#999] leading-relaxed">Deep, long-term partnerships with aligned missions. Co-investment in infrastructure and joint development of sovereign solutions.</p>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="fine-card p-8 rounded-lg">
                <div className="w-10 h-10 rounded-md bg-[rgba(74,123,95,0.1)] border border-[rgba(74,123,95,0.2)] flex items-center justify-center mb-5">
                  <Building className="w-5 h-5 text-[#4A7B5F]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Technology Integration</h3>
                <p className="text-[14px] text-[#999] leading-relaxed">Embed partner technologies into the Harch ecosystem. Seamless interoperability from GPU cloud to energy management.</p>
              </div>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="fine-card p-8 rounded-lg">
                <div className="w-10 h-10 rounded-md bg-[rgba(196,150,74,0.1)] border border-[rgba(196,150,74,0.2)] flex items-center justify-center mb-5">
                  <Globe className="w-5 h-5 text-[#C4964A]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Joint Venture</h3>
                <p className="text-[14px] text-[#999] leading-relaxed">Create shared entities for specific projects or markets. Combine Harch's vertical integration with partner expertise.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Partner Stats */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-extrabold text-white mb-2">5+</p>
                <p className="data-label">Countries</p>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-extrabold text-white mb-2">20+</p>
                <p className="data-label">Target Partners</p>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-extrabold text-[#8B9DAF] mb-2">$2.37B</p>
                <p className="data-label">Pipeline</p>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-extrabold text-[#4A7B5F] mb-2">8</p>
                <p className="data-label">Verticals</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
