'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  Lock,
  KeyRound,
  AlertTriangle,
  FileCheck,
  Brain,
  Eye,
  Scale,
  ChevronRight,
  CheckCircle2,
  Clock,
  CalendarClock,
  Server,
  Fingerprint,
  Cloud,
  Database,
  Globe,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const securityOverview = [
  {
    icon: Server,
    title: 'Infrastructure Security',
    desc: 'HarchOS data centers are secured with multi-layer physical access controls, 24/7 surveillance, and sovereign compute infrastructure isolated from foreign interception.',
    link: '/trust/security',
  },
  {
    icon: Lock,
    title: 'Data Protection',
    desc: 'AES-256 encryption at rest, TLS 1.3 in transit, and customer-managed encryption keys. All data residency enforced within Moroccan and African borders.',
    link: '/trust/security',
  },
  {
    icon: KeyRound,
    title: 'Access Control',
    desc: 'Zero-trust architecture with RBAC, MFA enforcement, and privileged access management. Every access request is authenticated, authorized, and audited.',
    link: '/trust/security',
  },
  {
    icon: AlertTriangle,
    title: 'Incident Response',
    desc: '24/7 SOC with <15min detection, <1hr containment SLA. Automated playbooks, war-room protocols, and transparent post-incident reporting.',
    link: '/trust/security',
  },
];

const certifications = [
  { name: 'SOC 2 Type II', scope: 'Security, Availability, Confidentiality', status: 'In Progress' as const, region: 'Global' },
  { name: 'ISO 27001', scope: 'Information Security Management — Aligned', status: 'In Progress' as const, region: 'Global' },
  { name: 'ISO 22301', scope: 'Business Continuity Management', status: 'In Progress' as const, region: 'Global' },
  { name: 'GDPR', scope: 'EU Data Protection Regulation', status: 'Achieved' as const, region: 'EU' },
  { name: 'CCPA', scope: 'California Consumer Privacy Act', status: 'Achieved' as const, region: 'US' },
  { name: 'Moroccan DPA', scope: 'Law 09-08 Data Protection', status: 'Achieved' as const, region: 'Morocco' },
  { name: 'ISO 27017', scope: 'Cloud Security Controls', status: 'In Progress' as const, region: 'Global' },
  { name: 'ISO 27018', scope: 'PII in Public Cloud', status: 'In Progress' as const, region: 'Global' },
  { name: 'HITRUST CSF', scope: 'Healthcare Security Framework', status: 'Planned' as const, region: 'Global' },
  { name: 'FedRAMP', scope: 'US Federal Authorization', status: 'Planned' as const, region: 'US' },
  { name: 'PCI DSS', scope: 'Payment Card Security', status: 'In Progress' as const, region: 'Global' },
  { name: 'CSA STAR Level 2', scope: 'Cloud Security Alliance', status: 'In Progress' as const, region: 'Global' },
];

const securityLayers = [
  { layer: 'L1', name: 'Physical Security', desc: 'Biometric access, 24/7 CCTV, mantraps, armed security' },
  { layer: 'L2', name: 'Network Security', desc: 'DDoS protection, WAF, micro-segmentation, zero-trust' },
  { layer: 'L3', name: 'Platform Security', desc: 'HarchOS hardened runtime, container isolation, SBOM' },
  { layer: 'L4', name: 'Application Security', desc: 'SAST/DAST, pen testing, code review, dependency scanning' },
  { layer: 'L5', name: 'Data Security', desc: 'AES-256 at rest, TLS 1.3 in transit, CMK, tokenization' },
  { layer: 'L6', name: 'Identity & Access', desc: 'MFA, RBAC, PAM, SSO, conditional access policies' },
  { layer: 'L7', name: 'Monitoring & Response', desc: '24/7 SOC, SIEM, automated playbooks, threat intel' },
];

const sharedResponsibility = {
  harch: [
    'Physical data center security',
    'Network infrastructure protection',
    'HarchOS platform security',
    'Hypervisor isolation',
    'Default encryption at rest & in transit',
    'Infrastructure monitoring & incident response',
    'DDoS mitigation & WAF',
    'Identity provider (SSO/MFA)',
    'Compliance certification maintenance',
  ],
  customer: [
    'User access management & hygiene',
    'Application-level security',
    'Data classification & labeling',
    'API key & credential management',
    'Customer-managed encryption keys (optional)',
    'Workload configuration hardening',
    'Audit log review & alerting',
    'Third-party integration security',
  ],
};

export default function TrustPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Trust Center</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Security. Compliance.<br />Transparency.
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Trust is the foundation of sovereign infrastructure. Harch Corp maintains the highest standards of security, compliance, and operational transparency — so our partners and customers can build with confidence.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/trust/security" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Security Overview <ArrowRight size={14} />
              </Link>
              <Link href="/trust/compliance" className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Compliance Certifications
              </Link>
              <Link href="/trust/vulnerability-disclosure" className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Vulnerability Disclosure
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SECURITY OVERVIEW ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Security</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Defense in Depth
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Every layer of Harch Corp infrastructure is designed with security-first principles — from physical data center perimeters to application-level controls.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityOverview.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <Link href={item.link} className="card p-8 h-full block group">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4 group-hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                    <item.icon size={20} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-4">{item.desc}</p>
                  <span className="inline-flex items-center gap-1 text-[12px] text-white/50 group-hover:text-white/80 transition-colors">
                    Learn more <ChevronRight size={12} />
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPLIANCE CERTIFICATIONS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Compliance</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Certified. Audited. Verified.
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Our compliance program spans Moroccan, African, European, and global frameworks — with continuous auditing and third-party verification.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert, i) => (
              <FadeIn key={cert.name} delay={i * 0.05}>
                <div className="card p-6 h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                        <FileCheck size={18} className="text-white" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-white">{cert.name}</h3>
                        <p className="text-[11px] text-[#666666] tracking-wide">{cert.region}</p>
                      </div>
                    </div>
                    {cert.status === 'Achieved' ? (
                      <span className="status-badge status-badge-active">
                        <CheckCircle2 size={10} />Achieved
                      </span>
                    ) : cert.status === 'In Progress' ? (
                      <span className="status-badge status-badge-engineering">
                        <Clock size={10} />In Progress
                      </span>
                    ) : (
                      <span className="status-badge status-badge-design">
                        <CalendarClock size={10} />Planned
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#999999] leading-relaxed">{cert.scope}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div className="mt-8 text-center">
              <Link href="/trust/compliance" className="inline-flex items-center gap-2 text-[14px] text-white/60 hover:text-white transition-colors">
                View all compliance details <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SECURITY ARCHITECTURE ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Architecture</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              HarchOS Security Layers
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Seven concentric security layers protect every workload, every data point, every transaction. From the concrete perimeter to the application runtime.
            </p>
          </FadeIn>
          <div className="space-y-3">
            {securityLayers.map((layer, i) => (
              <FadeIn key={layer.layer} delay={i * 0.06}>
                <div className="card p-5 flex items-center gap-6 group hover:bg-[rgba(255,255,255,0.02)]">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center border border-[rgba(255,255,255,0.06)] group-hover:border-[rgba(255,255,255,0.12)] transition-colors">
                    <span className="text-[11px] font-bold tracking-wider text-white/40 font-[family-name:var(--font-space-mono)]">{layer.layer}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-white mb-1">{layer.name}</h3>
                    <p className="text-[13px] text-[#666666] leading-relaxed">{layer.desc}</p>
                  </div>
                  <div className="flex-shrink-0 hidden sm:block">
                    <div className="w-32 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-white/30 to-white/10"
                        style={{ width: `${100 - i * 8}%` }}
                      />
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VULNERABILITY DISCLOSURE ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <FadeIn>
              <p className="section-label mb-4">Vulnerability Disclosure</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
                Help Us Get Stronger
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[15px] text-[#999999] leading-relaxed mb-6">
                We believe in collaborative security. If you discover a vulnerability in Harch Corp systems, we want to hear from you. Our bug bounty program rewards responsible disclosure and recognizes security researchers.
              </p>
              <p className="text-[14px] text-[#666666] leading-relaxed mb-8">
                We commit to acknowledging receipt within 24 hours, providing an initial assessment within 72 hours, and keeping you informed throughout the remediation process.
              </p>
              <Link href="/trust/vulnerability-disclosure" className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Full Disclosure Policy <ArrowRight size={14} />
              </Link>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="space-y-4">
                {[
                  { step: '01', title: 'Identify', desc: 'Discover a potential vulnerability in Harch Corp systems or infrastructure.' },
                  { step: '02', title: 'Report', desc: 'Submit details to security@harchcorp.com with reproducible steps.' },
                  { step: '03', title: 'Validate', desc: 'Our security team acknowledges and triages within 24 hours.' },
                  { step: '04', title: 'Remediate', desc: 'We develop and deploy a fix, keeping you informed of progress.' },
                  { step: '05', title: 'Recognize', desc: 'Eligible researchers receive bounty rewards and Hall of Fame recognition.' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.04)] flex items-center justify-center text-[11px] font-bold text-white/30 font-[family-name:var(--font-space-mono)]">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-[14px] font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-[13px] text-[#666666] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ AI ETHICS & RESPONSIBLE TECH ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">AI Ethics</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Responsible AI by Design
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              As Africa builds its sovereign AI capabilities, Harch Corp commits to fairness, transparency, and human oversight in every model we deploy.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <FadeIn delay={0.05}>
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Scale size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[15px] font-bold text-white">Fairness Score</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-1 stat-mono">0.94</p>
                <p className="text-[12px] text-[#666666]">Across all protected attributes</p>
                <div className="mt-4 w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)]">
                  <div className="h-full rounded-full bg-white/30" style={{ width: '94%' }} />
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Eye size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[15px] font-bold text-white">Model Transparency</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-1 stat-mono">87%</p>
                <p className="text-[12px] text-[#666666]">Of models with explainability reports</p>
                <div className="mt-4 w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)]">
                  <div className="h-full rounded-full bg-white/30" style={{ width: '87%' }} />
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Brain size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[15px] font-bold text-white">Bias Incidents</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-1 stat-mono">0</p>
                <p className="text-[12px] text-[#666666]">Critical bias incidents in 2025</p>
                <div className="mt-4 w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)]">
                  <div className="h-full rounded-full bg-white/30" style={{ width: '100%' }} />
                </div>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.2}>
            <div className="text-center">
              <Link href="/trust/ai-ethics" className="inline-flex items-center gap-2 text-[14px] text-white/60 hover:text-white transition-colors">
                Explore AI Ethics Framework <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ DATA PRIVACY FRAMEWORK ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Data Privacy</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Your Data. Your Sovereignty.
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Harch Corp enforces data residency, cross-border transfer controls, and processing transparency — aligned with Moroccan Law 09-08, GDPR, and emerging African data protection frameworks.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Database, title: 'Data Residency', desc: 'All customer data stored and processed within Morocco by default. Regional options available for Senegal, Gambia, and EU jurisdictions.' },
              { icon: Fingerprint, title: 'Consent Management', desc: 'Granular consent frameworks with audit trails. Full compliance with Moroccan DPA opt-in requirements and GDPR consent standards.' },
              { icon: Cloud, title: 'Cross-Border Transfer', desc: 'Standard contractual clauses, binding corporate rules, and adequacy decisions for all international data transfers.' },
              { icon: Shield, title: 'Data Processing Agreements', desc: 'Pre-signed DPAs available for all customers. Covers sub-processor management, breach notification, and data subject rights.' },
              { icon: Eye, title: 'Subject Rights', desc: 'Full support for access, rectification, erasure, portability, and objection rights. Automated fulfillment within 30-day SLA.' },
              { icon: Globe, title: 'African Framework Alignment', desc: 'Compliant with Cote d\'Ivoire Law No. 2013-450, Kenya Data Protection Act 2019, and South Africa POPIA for pan-African operations.' },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.06}>
                <div className="card p-6 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
                    <item.icon size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[15px] font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-[13px] text-[#999999] leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TRANSPARENCY REPORT ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="section-label mb-4">Transparency</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
                Quarterly Security<br />Transparency Report
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[15px] text-[#999999] leading-relaxed mb-6">
                Every quarter, we publish a comprehensive transparency report covering security incidents, government data requests, compliance status updates, and vulnerability metrics. Transparency is not optional — it is operational.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  { label: 'Security Incidents (Q4 2025)', value: '0 Critical' },
                  { label: 'Government Data Requests', value: '2 — Both Challenged' },
                  { label: 'Mean Time to Detect', value: '<12 min' },
                  { label: 'Mean Time to Contain', value: '<45 min' },
                  { label: 'Uptime SLA Achievement', value: '99.997%' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)]">
                    <span className="text-[13px] text-[#999999]">{item.label}</span>
                    <span className="text-[13px] font-semibold text-white stat-mono">{item.value}</span>
                  </div>
                ))}
              </div>
              <button className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Download Q4 2025 Report <ExternalLink size={14} />
              </button>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card p-8">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#666666] mb-6">Report Archive</p>
                <div className="space-y-3">
                  {[
                    { quarter: 'Q4 2025', date: 'January 2026', status: 'Latest' },
                    { quarter: 'Q3 2025', date: 'October 2025', status: 'Published' },
                    { quarter: 'Q2 2025', date: 'July 2025', status: 'Published' },
                    { quarter: 'Q1 2025', date: 'April 2025', status: 'Published' },
                  ].map((report) => (
                    <div key={report.quarter} className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                      <div className="flex items-center gap-3">
                        <FileCheck size={16} className="text-white/30" strokeWidth={1.5} />
                        <div>
                          <p className="text-[14px] font-semibold text-white">{report.quarter}</p>
                          <p className="text-[11px] text-[#666666]">{report.date}</p>
                        </div>
                      </div>
                      {report.status === 'Latest' ? (
                        <span className="status-badge status-badge-active">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />Latest
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#666666]">PDF</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ SHARED RESPONSIBILITY MODEL ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Shared Responsibility</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Security Is a Partnership
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              While Harch Corp secures the infrastructure, customers retain responsibility for how they configure, manage, and operate within the platform. Clarity drives accountability.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FadeIn delay={0.05}>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Shield size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Harch Corp Secures</h3>
                    <p className="text-[11px] text-[#666666]">Infrastructure & Platform Layer</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {sharedResponsibility.harch.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-white/40 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <p className="text-[13px] text-[#999999]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <KeyRound size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Customer Secures</h3>
                    <p className="text-[11px] text-[#666666]">Application & Configuration Layer</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {sharedResponsibility.customer.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-white/40 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <p className="text-[13px] text-[#999999]">{item}</p>
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
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">Questions About Trust?</h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              Our security team is available to discuss compliance requirements, security architecture, and partnership opportunities.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Request Briefing <ArrowRight size={14} />
              </Link>
              <a href="mailto:security@harchcorp.com" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                <Mail size={14} /> security@harchcorp.com
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
