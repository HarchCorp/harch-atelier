'use client';

import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const keyProvisions = [
  {
    title: 'Processing Scope',
    description: 'The DPA clearly defines the subject matter, duration, nature, and purpose of the processing, the types of personal data processed, and the categories of data subjects. All processing activities are documented in an annex that is reviewed and updated quarterly to reflect any changes in our data processing operations.',
  },
  {
    title: 'Subprocessor Management',
    description: 'We maintain an up-to-date list of authorized sub-processors and notify clients of any changes to sub-processors at least 30 days in advance. Clients have the right to object to the appointment of a new sub-processor. All sub-processors are bound by contractual obligations providing at least the same level of data protection as contained in the DPA. We conduct due diligence assessments on all sub-processors before engagement and review their compliance annually.',
  },
  {
    title: 'Data Security',
    description: 'We implement and maintain appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including encryption at rest and in transit (AES-256 and TLS 1.3), access controls and authentication mechanisms (multi-factor authentication, role-based access control), regular security testing and vulnerability assessments (annual penetration tests, quarterly vulnerability scans), employee training and confidentiality obligations, and physical security measures at our data centers and offices. Security measures are documented in our Technical and Organizational Measures (TOMs) annex.',
  },
  {
    title: 'Audit Rights',
    description: 'Clients have the right to audit our compliance with the DPA, subject to reasonable notice of at least 30 business days. Audits may be conducted by the client or by a qualified independent third-party auditor at the client\'s expense. We cooperate fully with audits and provide reasonable access to relevant facilities, systems, and records. We also make available current third-party audit reports, including SOC 2 Type II and ISO 27001 certificates, to reduce the need for on-site audits.',
  },
  {
    title: 'Breach Notification',
    description: 'We notify clients without undue delay and no later than 72 hours after becoming aware of a personal data breach. Notifications include the nature of the breach, the categories and approximate number of data subjects and records concerned, the likely consequences of the breach, and the measures taken or proposed to address the breach and mitigate its effects. We also provide reasonable assistance to clients in meeting their obligation to notify supervisory authorities and affected data subjects under applicable law.',
  },
  {
    title: 'Data Return and Deletion',
    description: 'Upon termination of the DPA or at the client\'s request, we return or securely delete all personal data processed under the DPA within 90 days, unless retention is required by applicable law. We provide written certification of deletion upon request. For data that must be retained for legal compliance, we continue to protect such data in accordance with the DPA and applicable law and process it only for the purpose of compliance.',
  },
];

export default function DpaPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">Data Processing Agreement</h1>
            <div className="accent-line mb-8" />
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">Last updated: January 2026</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">Overview</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                Harch Corp recognizes that data protection is fundamental to our relationships with clients, partners, and stakeholders. Our Data Processing Agreement (DPA) establishes the terms and conditions under which we process personal data on behalf of our clients, ensuring compliance with the General Data Protection Regulation (GDPR), the Kingdom of Morocco&apos;s Law No. 09-08 on the Protection of Personal Data, and other applicable data protection laws. This page outlines the key provisions of our DPA and provides access to our DPA template for review and execution.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">Key Provisions</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                Our DPA incorporates the following key provisions, each designed to ensure robust data protection and compliance with international standards:
              </p>
              <div className="space-y-4">
                {keyProvisions.map((provision, i) => (
                  <div key={provision.title} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <h3 className="text-[15px] font-semibold text-white mb-2">{i + 1}. {provision.title}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">{provision.description}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">Download DPA Template</h2>
              <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-6 bg-[#1E1E1E]">
                <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                  Our standard DPA template is available for review and download. This template incorporates all mandatory provisions required by the GDPR, Moroccan data protection law, and best practices for data processing arrangements. If you require modifications to our standard template or have specific regulatory requirements, our legal team will work with you to address them.
                </p>
                <a
                  href="mailto:legal@harchcorp.com"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[13px] font-semibold rounded-md hover:bg-[#e0e0e0] transition-colors"
                >
                  Contact Legal Team
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">Contact for DPA Execution</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                To initiate the DPA execution process, request a modified DPA, or discuss specific data protection requirements for your engagement with Harch Corp, please contact our legal team:
              </p>
              <div className="mt-4 border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <p className="text-[14px] text-white font-medium mb-2">Legal Department — Data Protection</p>
                <p className="text-[14px] text-[#999999]">Email: <a href="mailto:legal@harchcorp.com" className="text-white hover:underline">legal@harchcorp.com</a></p>
                <p className="text-[14px] text-[#999999]">Address: Harch Corp, 123 Boulevard Mohammed V, Casablanca 20000, Morocco</p>
                <p className="text-[14px] text-[#999999]">Response time: We aim to respond to all DPA inquiries within 5 business days.</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.25}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">Last updated: January 2026 | This DPA is governed by the laws of the Kingdom of Morocco and incorporates GDPR requirements where applicable.</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
