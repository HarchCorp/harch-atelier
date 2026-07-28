'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const privacySections = [
  { title: '1. Information We Collect', text: 'We collect information you provide directly to us, such as when you fill out a contact form, subscribe to our newsletter, or communicate with us. This may include your name, email address, company name, phone number, and any other information you choose to provide. We also automatically collect certain information when you visit our website, including your IP address, browser type, operating system, referring URLs, and information about how you interact with our website.' },
  { title: '2. How We Use Your Information', text: 'We use the information we collect to: provide, maintain, and improve our services; respond to your inquiries and requests; send you technical notices and updates; communicate with you about products, services, and events; monitor and analyze trends and usage; detect, investigate, and prevent fraudulent transactions and abuse; and comply with legal obligations.' },
  { title: '3. Information Sharing', text: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with: service providers who perform services on our behalf; professional advisors; law enforcement when required by law; and business partners with your explicit consent.' },
  { title: '4. Data Security', text: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.' },
  { title: '5. Cookies', text: 'We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.' },
  { title: '6. Your Rights', text: 'Depending on your jurisdiction, you may have the right to: access the personal information we hold about you; request correction of inaccurate data; request deletion of your data; object to processing of your data; request data portability; and withdraw consent at any time. To exercise these rights, please contact privacy@harchcorp.com.' },
  { title: '7. International Transfers', text: 'Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from the laws of your country. We take appropriate safeguards to ensure your data is protected in accordance with this policy and applicable law.' },
  { title: '8. Contact Us', text: 'If you have any questions about this Privacy Policy, please contact us at: privacy@harchcorp.com or Harch Corp, 123 Boulevard Mohammed V, Casablanca 20000, Morocco.' },
];

export default function PrivacyPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Privacy</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">Privacy Policy</h1>
            <div className="accent-line mb-8" />
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">Last updated: January 2026</p>
          </FadeIn>
          <div className="space-y-10">
            {privacySections.map((section, i) => (
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
