'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const legalContent = [
  { title: '1. Company Information', text: 'Harch Corp is a Moroccan limited company (Société Anonyme / Public Limited Company) registered in Casablanca, Morocco. Capital: 100,000,000 MAD. Registered office: 123 Boulevard Mohammed V, Casablanca 20000, Morocco. Registration number: RC-123456. VAT number: MA123456789.' },
  { title: '2. Intellectual Property', text: 'All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of Harch Corp and is protected by international copyright, trademark, and other intellectual property laws. Unauthorized use, reproduction, or distribution of any content is strictly prohibited.' },
  { title: '3. Limitation of Liability', text: 'The information on this website is provided for general informational purposes only. While we strive to keep the information up to date and correct, Harch Corp makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics contained on this website.' },
  { title: '4. Forward-Looking Statements', text: 'This website contains forward-looking statements that involve risks and uncertainties. Actual results may differ materially from those expressed or implied in such statements. Factors that could cause actual results to differ include, but are not limited to, changes in economic conditions, regulatory environments, and project execution risks.' },
  { title: '5. Governing Law', text: 'These terms and conditions are governed by and construed in accordance with the laws of the Kingdom of Morocco. Any disputes arising from the use of this website shall be subject to the exclusive jurisdiction of the courts of Casablanca, Morocco.' },
  { title: '6. Contact', text: 'For any legal inquiries, please contact: legal@harchcorp.com or Harch Corp, 123 Boulevard Mohammed V, Casablanca 20000, Morocco.' },
];

export default function LegalPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">Legal Notice</h1>
            <div className="accent-line mb-8" />
          </FadeIn>
          <div className="space-y-10">
            {legalContent.map((section, i) => (
              <FadeIn key={section.title} delay={i * 0.05}>
                <h2 className="text-lg font-bold text-white mb-3">{section.title}</h2>
                <p className="text-[14px] text-[#999999] leading-[1.8]">{section.text}</p>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">Last updated: January 2026</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
