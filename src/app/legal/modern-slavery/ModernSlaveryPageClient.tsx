'use client';

import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

export default function ModernSlaveryPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">Modern Slavery Statement</h1>
            <div className="accent-line mb-8" />
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">Fiscal Year 2025 | Published: January 2026</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">Statement from the CEO</h2>
              <div className="border-l-2 border-white pl-6">
                <p className="text-[14px] text-[#999999] leading-[1.8] italic mb-4">
                  &ldquo;At Harch Corp, we believe that the dignity of every human being is non-negotiable. Modern slavery, in all its forms — forced labor, human trafficking, debt bondage, and child labor — represents a fundamental violation of human rights that has no place in our operations or supply chain. As a Moroccan industrial conglomerate operating across seven verticals and multiple geographies, we recognize both our responsibility and our influence to drive positive change.
                </p>
                <p className="text-[14px] text-[#999999] leading-[1.8] italic mb-4">
                  Our commitment goes beyond compliance. We actively seek to identify and eradicate modern slavery risks throughout our value chain, from the mines that supply our raw materials to the technology partners who power our digital infrastructure. We invest in due diligence, training, and remediation because we understand that building Africa&apos;s industrial sovereignty must be built on a foundation of respect for human rights.
                </p>
                <p className="text-[14px] text-[#999999] leading-[1.8] italic">
                  This statement sets out the steps we have taken during the fiscal year 2025 to prevent modern slavery and human trafficking in our business and supply chains, and it reflects our unwavering commitment to continuous improvement.&rdquo;
                </p>
                <p className="text-[15px] text-white font-semibold mt-4">Amine Harch El Korane</p>
                <p className="text-[13px] text-[#666666]">Founder &amp; Chief Executive Officer, Harch Corp</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">Our Business and Supply Chain</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                Harch Corp is a Moroccan multi-sector industrial conglomerate headquartered in Casablanca, Morocco. We operate across seven core verticals: AI data centers and intelligence infrastructure (1,798 GPU capacity target), renewable energy generation and distribution (2GW+ Renewable Pipeline), cement and construction materials manufacturing, sovereign technology and cybersecurity services, strategic mining operations including phosphates and critical minerals, precision agriculture and vertical farming, and water infrastructure including desalination and treatment. Our supply chain spans multiple countries across Africa, Europe, the Middle East, and Asia, and includes raw material suppliers, equipment manufacturers, construction contractors, technology providers, logistics companies, and professional service firms. The diversity and scale of our operations present inherent modern slavery risks, particularly in labor-intensive sectors such as construction, mining, and agriculture, and in regions where regulatory frameworks may be less robust.
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">Policies and Due Diligence</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                We have established a comprehensive framework of policies and due diligence processes to identify, prevent, and mitigate modern slavery risks:
              </p>
              <div className="space-y-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Supplier Code of Conduct</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">All suppliers and contractors are required to acknowledge and comply with our Supplier Code of Conduct, which explicitly prohibits forced labor, child labor, human trafficking, and all forms of modern slavery. The code requires suppliers to provide fair wages, safe working conditions, and freedom of movement for all workers.</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Supplier Due Diligence</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">All new suppliers undergo a risk-based due diligence assessment before onboarding, which includes screening for modern slavery indicators, review of labor practices and working conditions, verification of recruitment agencies and labor intermediaries, assessment of geographic and sector-specific risks, and evaluation of the supplier&apos;s own policies and monitoring mechanisms. High-risk suppliers are subject to enhanced due diligence, including on-site audits conducted by independent third-party auditors.</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Internal Controls</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">Our internal controls include rigorous recruitment and employment practices that verify the identity and legal right to work of all employees, prohibition of recruitment fees charged to workers, direct payment of wages to employees through transparent payroll systems, regular monitoring of working hours and conditions, and accessible grievance mechanisms for all workers, including subcontracted labor.</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">Risk Assessment</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                We conduct annual risk assessments to identify and evaluate modern slavery risks across our operations and supply chain. Our risk assessment methodology considers:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                  <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                  <span><span className="text-white font-medium">Sector-specific risks:</span> Mining, construction, and agriculture are identified as higher-risk sectors due to the prevalence of migrant labor, informal employment practices, and hazardous working conditions.</span>
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                  <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                  <span><span className="text-white font-medium">Geographic risks:</span> Operations and supply chains in regions with weaker labor protections, high levels of migration, or conflict-affected areas receive heightened scrutiny.</span>
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                  <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                  <span><span className="text-white font-medium">Labor provider risks:</span> The use of third-party labor providers, recruitment agencies, and subcontractors introduces additional risks that are managed through enhanced due diligence and contractual safeguards.</span>
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                  <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                  <span><span className="text-white font-medium">Raw material risks:</span> The sourcing of critical minerals and raw materials, particularly from artisanal and small-scale mining operations, carries inherent risks that require specialized monitoring and traceability measures.</span>
                </li>
              </ul>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">Key Actions Taken</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                During fiscal year 2025, we took the following actions to combat modern slavery in our operations and supply chain:
              </p>
              <div className="space-y-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">01</span>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">Conducted 47 on-site supplier audits across all seven verticals, with 12 audits specifically focused on high-risk suppliers in the construction and mining sectors. Identified 3 non-conformities related to working hours documentation and took immediate corrective action.</p>
                  </div>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">02</span>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">Implemented a digital supply chain traceability platform for our mining and agriculture verticals, enabling end-to-end visibility of labor practices from raw material extraction to final delivery.</p>
                  </div>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">03</span>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">Terminated relationships with 2 suppliers who failed to demonstrate adequate controls against modern slavery after a remediation period. These terminations were conducted in accordance with our responsible exit protocol to minimize adverse impacts on workers.</p>
                  </div>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">04</span>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">Established a dedicated Human Rights and Supply Chain Integrity team within the Compliance Office, staffed with specialists in labor rights, supply chain management, and social auditing.</p>
                  </div>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">05</span>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">Adopted the Employer Pays Principle across all our operations, ensuring that no worker bears the cost of recruitment to obtain employment with Harch Corp or its suppliers.</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h2 className="text-lg font-bold text-white mb-3">Training and Awareness</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                During fiscal year 2025, we delivered modern slavery awareness training to 100% of our employees and key contractor personnel. Training programs included mandatory e-learning modules for all employees on identifying and reporting modern slavery, specialized in-person workshops for procurement and supply chain teams, targeted training for site managers and supervisors on labor rights and worker welfare, training for HR professionals on ethical recruitment practices and the Employer Pays Principle, and awareness sessions for senior leadership on emerging regulatory requirements and best practices. In total, over 2,800 hours of training were delivered, and we achieved a 96% completion rate across all mandatory modules.
              </p>
            </FadeIn>

            <FadeIn delay={0.35}>
              <h2 className="text-lg font-bold text-white mb-3">Effectiveness Measurement</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                We measure the effectiveness of our actions to combat modern slavery through the following key performance indicators:
              </p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Indicator</th>
                      <th>FY 2025 Target</th>
                      <th>FY 2025 Actual</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-[13px]">Supplier audits completed</td>
                      <td className="text-[13px] text-[#999999] font-normal">40</td>
                      <td className="text-[13px] font-normal">47</td>
                    </tr>
                    <tr>
                      <td className="text-[13px]">High-risk suppliers audited</td>
                      <td className="text-[13px] text-[#999999] font-normal">100%</td>
                      <td className="text-[13px] font-normal">100%</td>
                    </tr>
                    <tr>
                      <td className="text-[13px]">Employee training completion</td>
                      <td className="text-[13px] text-[#999999] font-normal">95%</td>
                      <td className="text-[13px] font-normal">96%</td>
                    </tr>
                    <tr>
                      <td className="text-[13px]">Non-conformities identified and resolved</td>
                      <td className="text-[13px] text-[#999999] font-normal">N/A</td>
                      <td className="text-[13px] font-normal">3 identified, 3 resolved</td>
                    </tr>
                    <tr>
                      <td className="text-[13px]">Grievances related to labor practices received</td>
                      <td className="text-[13px] text-[#999999] font-normal">N/A</td>
                      <td className="text-[13px] font-normal">7 received, 7 investigated</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <h2 className="text-lg font-bold text-white mb-3">Next Steps</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                Looking ahead to fiscal year 2026, we plan to:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                  <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                  Expand our digital supply chain traceability platform to cover 100% of our tier-1 and tier-2 suppliers across all verticals.
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                  <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                  Implement worker voice technology in our mining and agriculture operations to enable direct and anonymous feedback from workers.
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                  <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                  Commission an independent third-party assessment of our modern slavery due diligence framework and implement its recommendations.
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                  <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                  Enhance collaboration with industry peers, civil society organizations, and government agencies to share best practices and drive systemic change.
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                  <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                  Conduct a comprehensive review of our recruitment agency framework across all operations, with particular focus on cross-border labor migration pathways.
                </li>
              </ul>
            </FadeIn>

            <FadeIn delay={0.45}>
              <h2 className="text-lg font-bold text-white mb-3">Approval and Signature</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                This Modern Slavery Statement has been approved by the Board of Directors of Harch Corp and is published in accordance with the UK Modern Slavery Act 2015, Section 54, the Australian Modern Slavery Act 2018 (Cth), and our voluntary commitment to transparency under the Kingdom of Morocco&apos;s legal framework.
              </p>
              <div className="mt-6 border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <p className="text-[15px] text-white font-semibold">Amine Harch El Korane</p>
                <p className="text-[13px] text-[#999999]">Founder &amp; Chief Executive Officer</p>
                <p className="text-[13px] text-[#999999]">Harch Corp</p>
                <p className="text-[13px] text-[#666666] mt-2">Date: January 2026</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.5}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">Published: January 2026 | This statement is governed by the laws of the Kingdom of Morocco.</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
