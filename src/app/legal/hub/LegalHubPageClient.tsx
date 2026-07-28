'use client';

import Link from 'next/link';
import { ArrowRight, FileText, Shield, Cookie, Globe, Scale, Server, Eye, BookOpen, HandHeart, Tag, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const legalPages = [
  {
    title: 'Legal Notice',
    description: 'Company information, intellectual property rights, limitation of liability, and governing law for Harch Corp',
    href: '/legal',
    icon: FileText,
    updated: 'January 2026',
  },
  {
    title: 'Privacy Policy',
    description: 'How we collect, use, share, and protect your personal information in accordance with applicable data protection laws.',
    href: '/privacy',
    icon: Shield,
    updated: 'January 2026',
  },
  {
    title: 'Terms of Service',
    description: 'Terms and conditions governing your use of the Harch Corp website and digital services.',
    href: '/terms',
    icon: Scale,
    updated: 'January 2026',
  },
  {
    title: 'Cookie Policy',
    description: 'How we use cookies and similar technologies, including cookie categories, duration, and how to manage your preferences.',
    href: '/legal/cookies',
    icon: Cookie,
    updated: 'January 2026',
  },
  {
    title: 'GDPR Compliance',
    description: 'Our commitment to GDPR compliance, data subject rights, legal bases for processing, and international data transfers.',
    href: '/legal/gdpr',
    icon: Globe,
    updated: 'January 2026',
  },
  {
    title: 'CCPA Compliance',
    description: 'Your rights under the California Consumer Privacy Act, categories of information collected, and how to exercise your rights.',
    href: '/legal/ccpa',
    icon: AlertCircle,
    updated: 'January 2026',
  },
  {
    title: 'Data Processing Agreement',
    description: 'DPA provisions, key terms, subprocessor management, security measures, and template download.',
    href: '/legal/dpa',
    icon: Server,
    updated: 'January 2026',
  },
  {
    title: 'Service Level Agreement',
    description: 'Service availability targets (99.95% uptime), measurement methodology, service credits, and claims process.',
    href: '/legal/sla',
    icon: Eye,
    updated: 'January 2026',
  },
  {
    title: 'Accessibility Statement',
    description: 'Our commitment to digital accessibility, WCAG 2.1 Level AA compliance, features, and known limitations.',
    href: '/legal/accessibility',
    icon: BookOpen,
    updated: 'January 2026',
  },
  {
    title: 'Code of Business Conduct',
    description: 'Ethical standards, key policies, decision-making framework, reporting mechanisms, and non-retaliation protections.',
    href: '/legal/code-of-conduct',
    icon: BookOpen,
    updated: 'January 2026',
  },
  {
    title: 'Modern Slavery Statement',
    description: 'Our statement on modern slavery and human trafficking, covering due diligence, risk assessment, and actions taken.',
    href: '/legal/modern-slavery',
    icon: HandHeart,
    updated: 'January 2026',
  },
  {
    title: 'Trademark Guidelines',
    description: 'Proper use of Harch Corp trademarks, logo usage rules, color and typography standards, and permission requests.',
    href: '/legal/trademark',
    icon: Tag,
    updated: 'January 2026',
  },
];

export default function LegalHubPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">Legal Hub</h1>
            <div className="accent-line mb-8" />
            <p className="text-[14px] text-[#999999] leading-[1.8] mb-12">
              All legal documents, policies, and compliance information for Harch Corp in one place. Select a document below to view the full details.
            </p>
          </FadeIn>

          <div className="space-y-4">
            {legalPages.map((page, i) => (
              <FadeIn key={page.href} delay={i * 0.04}>
                <Link href={page.href} className="block group">
                  <div className="card p-5 md:p-6 flex items-start gap-4 md:gap-5">
                    <div className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-lg bg-[rgba(255,255,255,0.04)] flex items-center justify-center border border-[rgba(255,255,255,0.06)] group-hover:border-[rgba(255,255,255,0.12)] transition-colors">
                      <page.icon size={18} className="text-[#999999] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-[15px] font-semibold text-white mb-1.5 group-hover:text-white transition-colors">{page.title}</h3>
                          <p className="text-[13px] text-[#999999] leading-[1.7]">{page.description}</p>
                        </div>
                        <ArrowRight size={16} className="text-[#666666] group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                      </div>
                      <p className="text-[11px] text-[#666666] mt-2.5 font-mono-tag">Updated: {page.updated}</p>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666] mb-2">All documents are governed by the laws of the Kingdom of Morocco unless otherwise specified.</p>
              <p className="text-[12px] text-[#666666]">For legal inquiries: <a href="mailto:legal@harchcorp.com" className="text-white hover:underline">legal@harchcorp.com</a> | Harch Corp, 123 Boulevard Mohammed V, Casablanca 20000, Morocco</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
