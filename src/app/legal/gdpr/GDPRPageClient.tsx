'use client';

import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const legalBases = [
  {
    basis: 'Consent',
    description: 'Where you have given clear, affirmative consent to the processing of your personal data for one or more specific purposes. You may withdraw your consent at any time without affecting the lawfulness of processing based on consent before its withdrawal.',
  },
  {
    basis: 'Contractual Necessity',
    description: 'Where processing is necessary for the performance of a contract to which you are a party, or in order to take steps at your request prior to entering into a contract. This includes processing needed to deliver our services under signed agreements.',
  },
  {
    basis: 'Legal Obligation',
    description: 'Where processing is necessary for compliance with a legal obligation to which Harch Corp is subject, including obligations under Moroccan law, EU regulations, and other applicable jurisdictions where we operate.',
  },
  {
    basis: 'Vital Interests',
    description: 'Where processing is necessary to protect the vital interests of a natural person, including life-threatening situations or emergencies where the data subject is incapable of giving consent.',
  },
  {
    basis: 'Public Interest',
    description: 'Where processing is necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller, applicable in our capacity as a critical infrastructure operator.',
  },
  {
    basis: 'Legitimate Interests',
    description: 'Where processing is necessary for the purposes of the legitimate interests pursued by Harch Corp or a third party, except where such interests are overridden by the interests or fundamental rights and freedoms of the data subject. We conduct Legitimate Interest Assessments (LIAs) for all processing under this basis.',
  },
];

const dataSubjectRights = [
  {
    right: 'Right of Access',
    article: 'Article 15',
    description: 'You have the right to obtain confirmation as to whether or not personal data concerning you is being processed, and where that is the case, access to the personal data and information about the purposes, categories, recipients, retention period, and your right to lodge a complaint.',
  },
  {
    right: 'Right to Rectification',
    article: 'Article 16',
    description: 'You have the right to obtain the rectification of inaccurate personal data concerning you without undue delay. Taking into account the purposes of processing, you also have the right to have incomplete personal data completed, including by means of providing a supplementary statement.',
  },
  {
    right: 'Right to Erasure',
    article: 'Article 17',
    description: 'You have the right to obtain the erasure of personal data concerning you without undue delay where the data is no longer necessary, you withdraw consent, you object to processing, or the data has been unlawfully processed. This is subject to certain exceptions, including legal obligations and the establishment, exercise, or defense of legal claims.',
  },
  {
    right: 'Right to Restriction of Processing',
    article: 'Article 18',
    description: 'You have the right to obtain restriction of processing where you contest the accuracy of the data, processing is unlawful but you oppose erasure, we no longer need the data but you require it for legal claims, or you have objected to processing pending verification of our legitimate grounds.',
  },
  {
    right: 'Right to Data Portability',
    article: 'Article 20',
    description: 'You have the right to receive personal data concerning you which you have provided to us in a structured, commonly used, and machine-readable format, and have the right to transmit that data to another controller without hindrance. This right applies where processing is based on consent or contract and is carried out by automated means.',
  },
  {
    right: 'Right to Object',
    article: 'Article 21',
    description: 'You have the right to object at any time to processing of personal data concerning you which is based on legitimate interests or public interest, including profiling. We shall cease processing unless we demonstrate compelling legitimate grounds or the data is needed for legal claims. You also have the right to object to processing for direct marketing at any time.',
  },
  {
    right: 'Rights Regarding Automated Decision-Making',
    article: 'Article 22',
    description: 'You have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects or similarly significantly affects you. Where such decisions are made, you have the right to obtain human intervention, express your point of view, and contest the decision.',
  },
  {
    right: 'Right to Withdraw Consent',
    article: 'Article 7(3)',
    description: 'Where processing is based on consent, you have the right to withdraw that consent at any time without affecting the lawfulness of processing based on consent before its withdrawal. Withdrawal of consent does not affect the legality of processing performed prior to the withdrawal. We make it easy to withdraw consent through our privacy settings or by contacting our DPO.',
  },
];

export default function GDPRPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">GDPR Compliance</h1>
            <div className="accent-line mb-8" />
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">Last updated: January 2026</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">Our GDPR Commitment</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                Harch Corp is committed to ensuring compliance with the General Data Protection Regulation (EU) 2016/679 (GDPR) and the Kingdom of Morocco&apos;s Law No. 09-08 on the Protection of Individuals with Regard to the Processing of Personal Data. Although headquartered in Casablanca, Morocco, we recognize that our operations, partnerships, and services may involve the processing of personal data of individuals within the European Economic Area (EEA). We have implemented comprehensive data protection measures, appointed a Data Protection Officer, and established robust processes to ensure that the personal data of EU data subjects is processed lawfully, fairly, and transparently.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">Legal Basis for Processing</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                Under Article 6 of the GDPR, we process personal data only when we have a valid legal basis. The following are the legal bases upon which we rely:
              </p>
              <div className="space-y-4">
                {legalBases.map((basis, i) => (
                  <div key={basis.basis} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <h3 className="text-[15px] font-semibold text-white mb-2">{i + 1}. {basis.basis}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">{basis.description}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">Data Subject Rights</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                We respect and uphold the rights of data subjects as guaranteed under the GDPR. The following rights are available to all individuals whose personal data we process:
              </p>
              <div className="space-y-4">
                {dataSubjectRights.map((right, i) => (
                  <div key={right.right} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-[15px] font-semibold text-white">{right.right}</h3>
                      <span className="text-[12px] text-[#666666] font-mono-tag shrink-0 ml-4">{right.article}</span>
                    </div>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">{right.description}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">Data Processing Agreement</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                In accordance with Article 28 of the GDPR, Harch Corp maintains Data Processing Agreements (DPAs) with all processors and sub-processors who process personal data on our behalf. Our DPA template incorporates all mandatory provisions required by the GDPR, including the subject matter and duration of processing, the nature and purpose of processing, the type of personal data and categories of data subjects, and the obligations and rights of the controller. We make our DPA available to all business partners and clients upon request. To request a copy of our DPA template, please contact our legal team at legal@harchcorp.com.
              </p>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">International Data Transfers</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                As a Moroccan company with global operations and partnerships, we may transfer personal data outside the EEA. We ensure that all international transfers comply with Chapter V of the GDPR through the following mechanisms:
              </p>
              <div className="space-y-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Standard Contractual Clauses (SCCs)</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">We use the European Commission&apos;s approved Standard Contractual Clauses (Controller-to-Processor and Controller-to-Controller) as the primary mechanism for transferring personal data to countries that do not have an adequacy decision. All our SCCs incorporate the latest modules and supplementary measures as required by the Schrems II decision.</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Adequacy Decisions</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">Where the European Commission has issued an adequacy decision recognizing that a country provides an adequate level of data protection, we rely on such decisions for transfers to those jurisdictions. We continuously monitor the status of adequacy decisions, including the EU-Morocco data protection framework developments.</p>
                </div>
              </div>
              <p className="text-[14px] text-[#999999] leading-[1.8] mt-4">
                Prior to any international transfer, we conduct Transfer Impact Assessments (TIAs) to evaluate the laws and practices of the destination country and implement supplementary measures where necessary to ensure an essentially equivalent level of data protection.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h2 className="text-lg font-bold text-white mb-3">Data Protection Officer</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                Harch Corp has appointed a Data Protection Officer (DPO) in accordance with Article 37 of the GDPR. Our DPO operates independently, reports directly to senior management, and is responsible for monitoring our compliance with data protection laws, advising on data protection impact assessments, and serving as the point of contact for data subjects and supervisory authorities.
              </p>
              <div className="mt-4 border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <p className="text-[14px] text-white font-medium mb-2">Contact our Data Protection Officer:</p>
                <p className="text-[14px] text-[#999999]">Email: <a href="mailto:dpo@harchcorp.com" className="text-white hover:underline">dpo@harchcorp.com</a></p>
                <p className="text-[14px] text-[#999999]">Address: Harch Corp, 123 Boulevard Mohammed V, Casablanca 20000, Morocco</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.35}>
              <h2 className="text-lg font-bold text-white mb-3">Supervisory Authority</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                If you are an EU data subject and believe that our processing of your personal data infringes the GDPR, you have the right to lodge a complaint with a supervisory authority in the EU Member State of your habitual residence, place of work, or the place of the alleged infringement. In Morocco, the relevant authority is the National Commission for the Control of Personal Data Protection (CNDP — Commission Nationale de Contrôle de la Protection des Données à Caractère Personnel). We are committed to cooperating fully with any supervisory authority in the resolution of complaints.
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">Last updated: January 2026 | This statement is governed by the laws of the Kingdom of Morocco and the GDPR where applicable.</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
