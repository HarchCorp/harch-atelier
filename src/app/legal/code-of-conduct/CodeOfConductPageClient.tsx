'use client';

import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const keyPolicies = [
  {
    policy: 'Anti-Corruption and Anti-Bribery',
    description: 'Harch Corp maintains a zero-tolerance policy toward corruption and bribery in all forms, whether involving public officials or private sector counterparts. We comply with the Kingdom of Morocco\'s anti-corruption laws, the UK Bribery Act, the US Foreign Corrupt Practices Act, and all applicable anti-corruption legislation in jurisdictions where we operate. No employee, officer, or agent may offer, promise, give, or accept any bribe, kickback, or improper inducement. All business hospitality and gifts must be reasonable, proportionate, and properly documented. We maintain rigorous due diligence processes for third-party intermediaries, agents, and business partners.',
  },
  {
    policy: 'Conflict of Interest',
    description: 'All directors, officers, and employees are expected to act in the best interests of Harch Corp and to avoid situations where personal interests conflict or appear to conflict with the interests of the company. Conflicts of interest may arise from financial interests in competing or supplier organizations, outside employment or directorships, related-party transactions, or personal relationships that could influence business decisions. Any actual or potential conflict of interest must be disclosed promptly to the Compliance Office and managed transparently. Employees must recuse themselves from decisions where a conflict exists.',
  },
  {
    policy: 'Insider Trading',
    description: 'Trading in securities while in possession of material non-public information about Harch Corp or any company with which we do business is strictly prohibited. Material non-public information includes any information that a reasonable investor would consider important in making an investment decision and that has not been publicly disclosed. This prohibition extends to tipping others who might trade on such information. All employees with access to material non-public information must observe designated trading windows and pre-clearance requirements as specified in our Insider Trading Policy.',
  },
  {
    policy: 'Data Protection and Privacy',
    description: 'We are committed to protecting the personal data of our employees, clients, partners, and other stakeholders. All employees must comply with our data protection policies and applicable privacy laws, including the GDPR, the Kingdom of Morocco\'s Law No. 09-08, and other relevant legislation. Personal data must be collected only for legitimate purposes, processed lawfully and fairly, kept accurate and up to date, retained only as long as necessary, and protected against unauthorized access, disclosure, or loss. Any data breach must be reported immediately to the Data Protection Officer.',
  },
  {
    policy: 'Human Rights',
    description: 'Harch Corp is committed to respecting and promoting human rights in all our operations and business relationships, consistent with the Universal Declaration of Human Rights, the International Labour Organization\'s core conventions, and the UN Guiding Principles on Business and Human Rights. We prohibit forced labor, child labor, and human trafficking in our operations and supply chain. We uphold the principles of non-discrimination, freedom of association, and the right to collective bargaining. We conduct human rights due diligence on our operations and supply chain and engage with stakeholders to identify and address potential impacts.',
  },
  {
    policy: 'Environmental Responsibility',
    description: 'As a multi-sector industrial conglomerate, we recognize our significant environmental footprint and our responsibility to minimize it. We are committed to operating in an environmentally sustainable manner, complying with all applicable environmental laws and regulations, and continuously improving our environmental performance. Our environmental commitments include reducing greenhouse gas emissions in line with science-based targets, minimizing waste and promoting circular economy principles, protecting biodiversity in areas where we operate, investing in clean technologies and renewable energy, and transparently reporting our environmental performance. Each business unit maintains an Environmental Management System aligned with ISO 14001 standards.',
  },
];

export default function CodeOfConductPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">Code of Business Conduct</h1>
            <div className="accent-line mb-8" />
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">Last updated: January 2026</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">Purpose and Scope</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                This Code of Business Conduct (&ldquo;Code&rdquo;) establishes the ethical standards and behavioral expectations that govern the conduct of all directors, officers, employees, contractors, and agents of Harch Corp and its subsidiaries, joint ventures, and affiliated entities worldwide. The Code applies to all business activities and relationships, whether conducted in person, electronically, or through third-party representatives. It reflects our commitment to integrity, transparency, and accountability in everything we do. Compliance with this Code is mandatory, and violations may result in disciplinary action up to and including termination of employment or business relationship, as well as potential legal consequences.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">Our Values in Action</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                At Harch Corp, our values are not abstract principles — they are the foundation of every decision we make and every action we take. We expect all members of the Harch Corp community to embody these values:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Integrity</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">We act honestly, ethically, and transparently in all our dealings. We do the right thing even when no one is watching.</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Excellence</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">We pursue the highest standards of quality and performance in everything we do, from industrial operations to stakeholder engagement.</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Respect</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">We treat every person with dignity and respect, valuing diversity of thought, background, and experience across our organization.</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Accountability</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">We take responsibility for our actions and their consequences. We honor our commitments and own our mistakes, learning from them to improve.</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">Ethical Decision-Making Framework</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                When faced with an ethical dilemma, we encourage all members of the Harch Corp community to use the following framework to guide their decision-making:
              </p>
              <div className="space-y-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">01</span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">Is it legal?</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.8]">Consider whether the proposed action complies with all applicable laws, regulations, and company policies. If it is not legal, do not proceed.</p>
                    </div>
                  </div>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">02</span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">Is it consistent with our values?</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.8]">Does the action align with our core values of integrity, excellence, respect, and accountability? Would you be comfortable seeing this action reported in the media?</p>
                    </div>
                  </div>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">03</span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">Would you be comfortable if everyone did it?</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.8]">Apply the universalizability test: if everyone in your position took the same action, would the outcome be acceptable? If not, reconsider.</p>
                    </div>
                  </div>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">04</span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">Seek guidance when uncertain</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.8]">If you are unsure about the right course of action, consult your manager, the Compliance Office, the Legal Department, or the Ethics Hotline before proceeding. It is always better to ask than to assume.</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">Key Policies</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                The following policies are integral components of our Code of Business Conduct:
              </p>
              <div className="space-y-4">
                {keyPolicies.map((policy) => (
                  <div key={policy.policy} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <h3 className="text-[15px] font-semibold text-white mb-2">{policy.policy}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">{policy.description}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">Reporting Concerns</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                Harch Corp is committed to fostering an environment where employees and stakeholders feel safe to raise concerns about potential violations of this Code, company policies, or applicable laws. We provide multiple channels for reporting concerns, and all reports are taken seriously and investigated promptly.
              </p>
              <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <p className="text-[14px] text-white font-medium mb-2">Ethics Hotline</p>
                <p className="text-[14px] text-[#999999]">Email: <a href="mailto:ethics@harchcorp.com" className="text-white hover:underline">ethics@harchcorp.com</a></p>
                <p className="text-[14px] text-[#999999]">Online: ethics@harchcorp.com (secure, anonymous reporting)</p>
                <p className="text-[14px] text-[#999999] mt-2">You may also report concerns to your direct manager, the Compliance Office, the Legal Department, or the Human Resources Department. All reports will be handled confidentially to the extent possible.</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h2 className="text-lg font-bold text-white mb-3">Non-Retaliation Policy</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                Harch Corp strictly prohibits retaliation against any person who, in good faith, reports a concern about potential misconduct, participates in an investigation, or exercises any right under this Code or applicable law. Retaliation includes any adverse employment action, threat, intimidation, or harassment directed at an individual because they reported a concern or participated in an investigation. Any employee who engages in retaliation will be subject to disciplinary action up to and including termination. If you believe you have experienced retaliation, please report it immediately through any of the reporting channels listed above.
              </p>
            </FadeIn>

            <FadeIn delay={0.35}>
              <h2 className="text-lg font-bold text-white mb-3">Waivers and Amendments</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                Any waiver of this Code for executive officers or directors may be made only by the Board of Directors of Harch Corp and will be promptly disclosed to the extent required by applicable law or regulation. Waivers for other employees may be granted only by the Chief Compliance Officer in writing. The Board of Directors retains the authority to amend this Code at any time. Amendments will be communicated to all employees and stakeholders, and updated versions will be made available on our website and internal compliance portal. Continued employment or engagement with Harch Corp constitutes acceptance of any amendments to this Code.
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">Last updated: January 2026 | Approved by the Board of Directors of Harch Corp | Governed by the laws of the Kingdom of Morocco.</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
