'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CalendarClock,
  Download,
  FileCheck,
  Globe,
  MapPin,
  ExternalLink,
  Shield,
  ChevronRight,
  BookOpen,
  Award,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

type CertStatus = 'Achieved' | 'In Progress' | 'Planned';

interface Certification {
  name: string;
  fullName: string;
  description: string;
  status: CertStatus;
  region: string;
  auditor?: string;
  lastAudit?: string;
  nextAudit?: string;
  scope: string;
}

const certifications: Certification[] = [
  {
    name: 'SOC 2 Type II',
    fullName: 'System and Organization Controls 2 Type II',
    description: 'Independent audit of our security, availability, and confidentiality controls over a minimum 6-month observation period. Currently in the final audit phase with our auditor.',
    status: 'In Progress',
    region: 'Global',
    nextAudit: 'Q3 2026',
    scope: 'HarchOS Platform, Harch Intelligence Infrastructure',
  },
  {
    name: 'ISO 27001',
    fullName: 'ISO/IEC 27001:2022 — Aligned',
    description: 'International standard for information security management systems (ISMS). Harch Corp is aligned with ISO 27001 controls and frameworks across all operating entities. Formal certification audit scheduled.',
    status: 'In Progress',
    region: 'Global',
    nextAudit: 'Q4 2026',
    scope: 'All Harch Corp Operations',
  },
  {
    name: 'ISO 22301',
    fullName: 'ISO 22301:2019 Business Continuity',
    description: 'Business continuity management system certification ensuring Harch Corp maintains critical operations during disruptions. Currently in implementation phase with tested recovery procedures.',
    status: 'In Progress',
    region: 'Global',
    nextAudit: 'Q4 2026',
    scope: 'All Harch Corp Operations',
  },
  {
    name: 'GDPR',
    fullName: 'EU General Data Protection Regulation',
    description: 'Full compliance with EU data protection regulation for all processing of EU data subjects. Includes DPA availability, cross-border transfer mechanisms, and data subject rights fulfillment.',
    status: 'Achieved',
    region: 'EU',
    lastAudit: 'Ongoing',
    nextAudit: 'Continuous',
    scope: 'All services processing EU personal data',
  },
  {
    name: 'CCPA',
    fullName: 'California Consumer Privacy Act',
    description: 'Compliance with California privacy requirements for US-based data subjects, including right to know, delete, and opt-out of data sale.',
    status: 'Achieved',
    region: 'US',
    lastAudit: 'Ongoing',
    nextAudit: 'Continuous',
    scope: 'Services offered to California residents',
  },
  {
    name: 'Moroccan DPA',
    fullName: 'Moroccan Law 09-08 (Data Protection Act)',
    description: 'Compliance with Moroccan data protection law administered by the CNDP (National Commission for Personal Data Protection). All data processing declared and registered.',
    status: 'Achieved',
    region: 'Morocco',
    auditor: 'CNDP Morocco',
    lastAudit: 'Jun 2025',
    nextAudit: 'Jun 2026',
    scope: 'All Harch Corp Morocco operations',
  },
  {
    name: 'ISO 27017',
    fullName: 'ISO/IEC 27017:2015 Cloud Security',
    description: 'Cloud-specific security controls extending ISO 27001. Covers cloud service shared responsibility, virtual network security, and cloud tenant isolation.',
    status: 'In Progress',
    region: 'Global',
    nextAudit: 'Q2 2026',
    scope: 'HarchOS Cloud Platform',
  },
  {
    name: 'ISO 27018',
    fullName: 'ISO/IEC 27018:2019 PII in Public Cloud',
    description: 'Protection of personally identifiable information in public clouds. Establishes controls for data processing, breach notification, and data subject rights in cloud environments.',
    status: 'In Progress',
    region: 'Global',
    nextAudit: 'Q2 2026',
    scope: 'HarchOS Cloud Platform',
  },
  {
    name: 'PCI DSS',
    fullName: 'Payment Card Industry Data Security Standard',
    description: 'Security standard for organizations that handle credit card data. Ensures secure payment processing across Harch Corp billing and partner transactions.',
    status: 'In Progress',
    region: 'Global',
    nextAudit: 'Q3 2026',
    scope: 'Billing, payment processing systems',
  },
  {
    name: 'CSA STAR Level 2',
    fullName: 'Cloud Security Alliance STAR Level 2',
    description: 'Third-party audit of cloud security controls against CSA Cloud Controls Matrix. Demonstrates transparency and rigorous cloud security practices.',
    status: 'In Progress',
    region: 'Global',
    nextAudit: 'Q3 2026',
    scope: 'HarchOS Cloud Platform',
  },
  {
    name: 'HITRUST CSF',
    fullName: 'HITRUST Common Security Framework',
    description: 'Comprehensive security framework for healthcare and life sciences. Required for Harch Corp health-tech partnerships and medical data processing.',
    status: 'Planned',
    region: 'Global',
    nextAudit: 'Q1 2027',
    scope: 'Health-tech vertical operations',
  },
  {
    name: 'FedRAMP',
    fullName: 'Federal Risk and Authorization Management Program',
    description: 'US government cloud authorization program. Enables Harch Corp to serve US federal agencies and government contractors with sovereign cloud services.',
    status: 'Planned',
    region: 'US',
    nextAudit: 'Q2 2027',
    scope: 'HarchOS US Region (planned)',
  },
];

const regions = [
  {
    name: 'Morocco',
    flag: 'MA',
    description: 'Primary operating jurisdiction. Full compliance with Moroccan Law 09-08, CNDP registration, and all local regulatory requirements.',
    certs: ['Moroccan DPA', 'ISO 27001 (In Progress)', 'SOC 2 Type II (In Progress)', 'ISO 22301 (In Progress)'],
  },
  {
    name: 'European Union',
    flag: 'EU',
    description: 'GDPR compliance for EU data subjects. Standard contractual clauses for data transfers. Adequacy decision alignment for Morocco-EU transfers.',
    certs: ['GDPR', 'ISO 27001 (In Progress)', 'SOC 2 Type II (In Progress)', 'ISO 22301 (In Progress)'],
  },
  {
    name: 'Africa',
    flag: 'AF',
    description: 'Alignment with emerging African data protection frameworks including Cote d\'Ivoire, Kenya, South Africa, and Nigeria regulations.',
    certs: ['ISO 27001 (In Progress)', 'SOC 2 Type II (In Progress)', 'ISO 22301 (In Progress)', 'GDPR (as baseline)'],
  },
  {
    name: 'Global',
    flag: 'GL',
    description: 'International compliance programs for cross-border operations. Designed to meet the most stringent requirements across all operating jurisdictions.',
    certs: ['SOC 2 Type II (In Progress)', 'ISO 27001 (In Progress)', 'ISO 22301 (In Progress)', 'CCPA', 'PCI DSS (In Progress)'],
  },
];

const auditReports = [
  { name: 'SOC 2 Type II Readiness Assessment', period: 'Q1 2026', auditor: 'Internal Audit', type: 'Readiness', available: true },
  { name: 'ISO 27001 Gap Analysis', period: 'Q4 2025', auditor: 'Internal Audit', type: 'Assessment', available: true },
  { name: 'Penetration Test Summary', period: 'Q4 2025', auditor: 'NCC Group', type: 'Test Report', available: true },
  { name: 'Cloud Security Assessment', period: 'Q3 2025', auditor: 'NCC Group', type: 'Assessment', available: true },
  { name: 'GDPR DPIA Summary', period: 'Ongoing', auditor: 'Internal DPO', type: 'Assessment', available: true },
  { name: 'CNDP Registration', period: 'Jun 2025', auditor: 'CNDP Morocco', type: 'Registration', available: true },
  { name: 'Business Continuity Test Results', period: 'Q3 2025', auditor: 'Internal Audit', type: 'Test Report', available: true },
];

function StatusBadge({ status }: { status: CertStatus }) {
  if (status === 'Achieved') {
    return (
      <span className="status-badge status-badge-active">
        <CheckCircle2 size={10} />Achieved
      </span>
    );
  }
  if (status === 'In Progress') {
    return (
      <span className="status-badge status-badge-engineering">
        <Clock size={10} />In Progress
      </span>
    );
  }
  return (
    <span className="status-badge status-badge-design">
      <CalendarClock size={10} />Planned
    </span>
  );
}

export default function CompliancePageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-center gap-2 mb-4">
              <Link href="/trust" className="text-[12px] text-[#666666] hover:text-white transition-colors">Trust Center</Link>
              <ChevronRight size={12} className="text-[#444444]" />
              <span className="text-[12px] text-white">Compliance</span>
            </div>
            <p className="section-label mb-4">Compliance</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Certified Across<br />Every Jurisdiction
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Harch Corp maintains compliance with international and regional standards across Moroccan, European, African, and global jurisdictions. Every certification is independently audited and continuously maintained.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CERTIFICATIONS LIST ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Certifications</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Full Certification Portfolio
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Each certification represents an independent, third-party validation of our security and operational controls.
            </p>
          </FadeIn>
          <div className="space-y-4">
            {certifications.map((cert, i) => (
              <FadeIn key={cert.name} delay={i * 0.04}>
                <div className="card p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center flex-shrink-0">
                          <Award size={18} className="text-white" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="text-[17px] font-bold text-white">{cert.name}</h3>
                          <p className="text-[12px] text-[#666666]">{cert.fullName}</p>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={cert.status} />
                  </div>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-4">{cert.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-1">Scope</p>
                      <p className="text-[12px] text-white">{cert.scope}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-1">Region</p>
                      <p className="text-[12px] text-white">{cert.region}</p>
                    </div>
                    {cert.auditor && (
                      <div>
                        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-1">Auditor</p>
                        <p className="text-[12px] text-white">{cert.auditor}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-1">Last Audit</p>
                      <p className="text-[12px] text-white">{cert.lastAudit || 'Pending'}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPLIANCE BY REGION ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Regional Programs</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Compliance by Region
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Harch Corp operates across multiple jurisdictions, each with specific regulatory requirements. Our compliance program is designed for multi-jurisdictional coverage.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {regions.map((region, i) => (
              <FadeIn key={region.name} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{region.flag}</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{region.name}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#666666]">
                        <MapPin size={10} />Regional Compliance Program
                      </div>
                    </div>
                  </div>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-6">{region.description}</p>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666]">Active Certifications</p>
                    {region.certs.map((cert) => (
                      <div key={cert} className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-white/30" strokeWidth={1.5} />
                        <span className="text-[13px] text-[#999999]">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AUDIT REPORTS ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Audit Reports</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Documentation Available
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Qualified customers and partners can request access to audit reports, certificates, and compliance documentation through our secure document portal.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-[#0D0D0D] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Period</th>
                      <th>Auditor</th>
                      <th>Type</th>
                      <th>Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditReports.map((report) => (
                      <tr key={report.name}>
                        <td>
                          <div className="flex items-center gap-2">
                            <FileCheck size={14} className="text-white/30" strokeWidth={1.5} />
                            <span>{report.name}</span>
                          </div>
                        </td>
                        <td>{report.period}</td>
                        <td>{report.auditor}</td>
                        <td>{report.type}</td>
                        <td>
                          {report.available ? (
                            <button className="inline-flex items-center gap-1.5 text-[12px] text-white/60 hover:text-white transition-colors">
                              <Download size={12} />Request Access
                            </button>
                          ) : (
                            <span className="text-[12px] text-[#666666]">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ DPA DOWNLOAD ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="section-label mb-4">Data Processing Agreement</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
                Standard DPA Available
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[15px] text-[#999999] leading-relaxed mb-6">
                Our pre-signed Data Processing Agreement is available for all customers. It covers GDPR Article 28 requirements, sub-processor management, breach notification procedures, and data subject rights assistance.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  'GDPR Article 28 compliant processing terms',
                  'Sub-processor notification and management',
                  '72-hour breach notification commitment',
                  'Data subject rights assistance (access, deletion, portability)',
                  'Cross-border transfer safeguards (SCCs)',
                  'Moroccan Law 09-08 alignment',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-white/40 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="text-[13px] text-[#999999]">{item}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                  <Download size={14} /> Download DPA (PDF)
                </button>
                <button className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                  <BookOpen size={14} /> DPA Summary
                </button>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card p-8">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#666666] mb-6">DPA Quick Reference</p>
                <div className="space-y-4">
                  {[
                    { label: 'Governing Law', value: 'Moroccan Law / GDPR' },
                    { label: 'Data Controller', value: 'Customer' },
                    { label: 'Data Processor', value: 'Harch Corp' },
                    { label: 'Sub-processors', value: 'Listed in Annex I' },
                    { label: 'Breach Notification', value: '72 hours' },
                    { label: 'Audit Right', value: 'Annual, with notice' },
                    { label: 'Data Deletion', value: 'Within 30 days of termination' },
                    { label: 'Cross-Border Transfer', value: 'SCCs + BCRs' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)]">
                      <span className="text-[13px] text-[#666666]">{item.label}</span>
                      <span className="text-[13px] font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">Need Compliance Documentation?</h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              Our compliance team can provide specific audit reports, certificates, and documentation for qualified requests.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Request Briefing <ArrowRight size={14} />
              </Link>
              <Link href="/trust" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Back to Trust Center
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
