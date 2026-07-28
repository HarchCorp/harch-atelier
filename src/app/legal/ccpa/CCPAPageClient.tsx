'use client';

import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const categories = [
  {
    category: 'Identifiers',
    examples: 'Name, email address, phone number, IP address, account login credentials',
    collected: 'Yes',
  },
  {
    category: 'Personal Information Categories (Cal. Civ. Code § 1798.80(e))',
    examples: 'Name, signature, physical characteristics, address, telephone number, passport number',
    collected: 'Yes',
  },
  {
    category: 'Protected Classification Characteristics',
    examples: 'Age, date of birth, citizenship, immigration status (collected for employment purposes only)',
    collected: 'Limited',
  },
  {
    category: 'Commercial Information',
    examples: 'Records of products or services purchased, investment interests, transaction details',
    collected: 'Yes',
  },
  {
    category: 'Biometric Information',
    examples: 'Fingerprints, voice prints, facial recognition data (collected for facility access only)',
    collected: 'Limited',
  },
  {
    category: 'Internet or Network Activity',
    examples: 'Browsing history, search history, interaction with our website, cookie data',
    collected: 'Yes',
  },
  {
    category: 'Geolocation Data',
    examples: 'Physical location derived from IP address or mobile device (generalized to city level)',
    collected: 'Yes',
  },
  {
    category: 'Professional or Employment Information',
    examples: 'Work history, professional qualifications, employment application data',
    collected: 'Yes',
  },
  {
    category: 'Inferences Drawn from Other Information',
    examples: 'Profile reflecting preferences, characteristics, behavior, or attitudes',
    collected: 'Yes',
  },
];

const ccpaRights = [
  {
    right: 'The Right to Know',
    description: 'You have the right to request that we disclose what personal information we collect, use, and disclose about you over the past 12 months. This includes the categories of personal information collected, the categories of sources, the business or commercial purpose for collecting or selling the information, the categories of third parties with whom we share information, and the specific pieces of personal information we have collected about you. We will verify your identity before disclosing this information.',
  },
  {
    right: 'The Right to Delete',
    description: 'You have the right to request that we delete any personal information about you that we have collected from you, subject to certain exceptions. These exceptions include when the information is necessary to complete a transaction, detect security incidents, protect against fraud, debug or repair errors, exercise free speech, comply with legal obligations, or enable solely internal uses reasonably proportional to your relationship with us. Upon a verified deletion request, we will direct our service providers to delete your personal information from their records.',
  },
  {
    right: 'The Right to Opt-Out of Sale',
    description: 'You have the right to direct us not to sell your personal information at any time. We do not currently sell personal information as defined under the CCPA. However, if our practices change, we will provide clear notice and an opt-out mechanism. You may also authorize an agent to exercise this right on your behalf by providing a signed power of attorney.',
  },
  {
    right: 'The Right to Non-Discrimination',
    description: 'We will not discriminate against you for exercising any of your CCPA rights. This means we will not deny you goods or services, charge you different prices or rates, provide you a different level or quality of goods or services, or suggest that we may do any of the foregoing, because you exercised a CCPA right. We may offer certain financial incentives permitted by the CCPA that are reasonably related to the value of your personal data, provided they are voluntary and clearly described.',
  },
];

export default function CCPAPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">CCPA Compliance</h1>
            <div className="accent-line mb-8" />
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">Last updated: January 2026</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">Your Rights Under CCPA</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                The California Consumer Privacy Act of 2018 (CCPA), as amended by the California Privacy Rights Act (CPRA), provides California residents with specific rights regarding their personal information. Harch Corp is committed to complying with the CCPA/CPRA and respecting the privacy rights of all California consumers. This notice describes the categories of personal information we collect, the purposes for which we use that information, and the rights available to you under California law.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">Categories of Personal Information Collected</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                In the preceding 12 months, we have collected the following categories of personal information:
              </p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Examples</th>
                      <th>Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.category}>
                        <td className="text-[13px]">{cat.category}</td>
                        <td className="text-[13px] text-[#999999] font-normal">{cat.examples}</td>
                        <td className="text-[13px] font-normal">{cat.collected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">How We Use Your Information</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                We may use or disclose the personal information we collect for the following business or commercial purposes: to provide, maintain, and improve our services and website; to process transactions and send related information including confirmations and invoices; to respond to your comments, questions, and requests, and provide customer service and technical support; to communicate with you about products, services, offers, and events offered by Harch Corp; to monitor and analyze trends, usage, and activities in connection with our services; to detect, investigate, and prevent fraudulent transactions and abuse; to personalize and improve your experience on our website; to establish, exercise, or defend legal claims; and to comply with applicable laws, regulations, and legal processes.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">Your Rights Under CCPA</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                As a California resident, you have the following rights under the CCPA:
              </p>
              <div className="space-y-4">
                {ccpaRights.map((right) => (
                  <div key={right.right} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <h3 className="text-[15px] font-semibold text-white mb-2">{right.right}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">{right.description}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">How to Exercise Your Rights</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                To exercise any of the rights described above, please submit a request by emailing us at{' '}
                <a href="mailto:privacy@harchcorp.com" className="text-white hover:underline">privacy@harchcorp.com</a>{' '}
                or by calling our toll-free number (available to California residents). We will respond to your request within 45 days of receipt, as required by the CCPA. If we need more time, we will inform you of the reason and extension period in writing.
              </p>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                You may also designate an authorized agent to make a request on your behalf. To do so, you must provide the authorized agent with written permission to act on your behalf, and we may require verification of your identity and confirmation that you have authorized the agent to make the request. We will verify your identity before processing your request by matching the information you provide with the personal information we maintain about you.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h2 className="text-lg font-bold text-white mb-3">Disclosure of Information</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                In the preceding 12 months, we have disclosed personal information for business purposes to the following categories of third parties: cloud infrastructure and hosting providers, analytics and performance monitoring services, marketing and communication platforms, legal and professional advisors, and regulatory authorities as required by law. We do not sell personal information to third parties. We require all service providers who process personal information on our behalf to comply with strict data protection obligations and to process personal information only for the specific business purposes for which we disclose it to them.
              </p>
            </FadeIn>

            <FadeIn delay={0.35}>
              <h2 className="text-lg font-bold text-white mb-3">Do Not Sell My Personal Information</h2>
              <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-6 bg-[#1E1E1E]">
                <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                  Harch Corp does not sell, rent, or trade personal information to third parties for monetary or other valuable consideration. We have never sold personal information in the past 12 months and do not intend to do so in the future. Should our practices change, we will update this notice and provide a clear and conspicuous &ldquo;Do Not Sell My Personal Information&rdquo; link on our homepage as required by the CCPA.
                </p>
                <p className="text-[14px] text-[#999999] leading-[1.8]">
                  Even though we do not sell personal information, we respect your privacy choices. If you have any concerns about how your information is shared, please contact us at{' '}
                  <a href="mailto:privacy@harchcorp.com" className="text-white hover:underline">privacy@harchcorp.com</a>.
                </p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">Last updated: January 2026 | This notice applies to California residents and is governed by the laws of the Kingdom of Morocco and the State of California where applicable.</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
