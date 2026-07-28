'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const termsSections = [
  { title: '1. Acceptance of Terms', text: 'By accessing and using the Harch Corp website (harchcorp.com), you accept and agree to be bound by the terms and conditions of this agreement. If you do not agree to abide by the above, please do not use this website. These terms apply to all visitors, users, and others who access or use the website.' },
  { title: '2. Use License', text: 'Permission is granted to temporarily access the materials on Harch Corp\'s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose; attempt to decompile or reverse engineer any software contained on the website; remove any copyright or other proprietary notations; or transfer the materials to another person.' },
  { title: '3. Disclaimer', text: 'The materials on Harch Corp\'s website are provided on an \'as is\' basis. Harch Corp makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.' },
  { title: '4. Limitations', text: 'In no event shall Harch Corp or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Harch Corp\'s website, even if Harch Corp has been notified orally or in writing of the possibility of such damage.' },
  { title: '5. Accuracy of Materials', text: 'The materials appearing on Harch Corp\'s website could include technical, typographical, or photographic errors. Harch Corp does not warrant that any of the materials on its website are accurate, complete, or current. Harch Corp may make changes to the materials contained on its website at any time without notice.' },
  { title: '6. Links', text: 'Harch Corp has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Harch Corp of the site. Use of any such linked website is at the user\'s own risk.' },
  { title: '7. Modifications', text: 'Harch Corp may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.' },
  { title: '8. Governing Law', text: 'These terms and conditions are governed by and construed in accordance with the laws of the Kingdom of Morocco and you irrevocably submit to the exclusive jurisdiction of the courts in Casablanca, Morocco.' },
  { title: '9. Contact', text: 'For any questions regarding these terms, please contact: legal@harchcorp.com or Harch Corp, 123 Boulevard Mohammed V, Casablanca 20000, Morocco.' },
];

export default function TermsPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Terms</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">Terms of Service</h1>
            <div className="accent-line mb-8" />
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">Last updated: January 2026</p>
          </FadeIn>
          <div className="space-y-10">
            {termsSections.map((section, i) => (
              <FadeIn key={section.title} delay={i * 0.05}>
                <h2 className="text-lg font-bold text-white mb-3">{section.title}</h2>
                <p className="text-[14px] text-[#999999] leading-[1.8]">{section.text}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
