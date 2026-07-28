'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  Lock,
  KeyRound,
  AlertTriangle,
  Server,
  Fingerprint,
  Cloud,
  Database,
  Eye,
  Wifi,
  Scan,
  Bug,
  FileCheck,
  ChevronRight,
  CheckCircle2,
  Clock,
  Activity,
  AlertOctagon,
  RefreshCw,
  Users,
  Zap,
  Globe,
  Building2,
  Radio,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const securityBulletins = [
  {
    id: 'HCSB-2025-008',
    title: 'TLS Certificate Rotation — HarchOS Control Plane',
    severity: 'Low',
    date: 'Dec 15, 2025',
    status: 'Resolved',
  },
  {
    id: 'HCSB-2025-007',
    title: 'Rate Limiting Update for API Gateway v2',
    severity: 'Low',
    date: 'Nov 28, 2025',
    status: 'Resolved',
  },
  {
    id: 'HCSB-2025-006',
    title: 'Kernel Patch — CVE-2025-3072 Remediation',
    severity: 'Medium',
    date: 'Oct 12, 2025',
    status: 'Resolved',
  },
  {
    id: 'HCSB-2025-005',
    title: 'Network Segmentation Enhancement — East/West Traffic',
    severity: 'Low',
    date: 'Sep 20, 2025',
    status: 'Resolved',
  },
  {
    id: 'HCSB-2025-004',
    title: 'Dependency Update — Log4j Variant Remediation',
    severity: 'High',
    date: 'Aug 5, 2025',
    status: 'Resolved',
  },
];

const incidentResponseSteps = [
  {
    phase: 'Detection',
    sla: '<15 min',
    description: 'Automated detection via SIEM, IDS/IPS, and anomaly detection. 24/7 SOC monitoring with real-time alerting.',
    actions: ['SIEM correlation triggers', 'IDS/IPS alert validation', 'Threat intelligence matching', 'Anomaly detection scoring'],
  },
  {
    phase: 'Triage',
    sla: '<30 min',
    description: 'Security analyst validates the alert, assigns severity, and activates the appropriate incident response playbook.',
    actions: ['Alert validation & classification', 'Severity assignment (P1-P4)', 'Playbook activation', 'War room provisioning'],
  },
  {
    phase: 'Containment',
    sla: '<1 hr',
    description: 'Immediate containment actions to prevent spread. Short-term and long-term containment strategies deployed in parallel.',
    actions: ['Network isolation of affected systems', 'Credential rotation', 'Traffic filtering & blocking', 'Evidence preservation'],
  },
  {
    phase: 'Eradication',
    sla: '<4 hrs',
    description: 'Root cause identification and complete removal of threat actor presence. All compromised assets identified and remediated.',
    actions: ['Root cause analysis', 'Malware removal & system hardening', 'Vulnerability patching', 'Threat actor eviction verification'],
  },
  {
    phase: 'Recovery',
    sla: '<8 hrs',
    description: 'Services restored with enhanced monitoring. Validation testing confirms threat elimination and service integrity.',
    actions: ['Staged service restoration', 'Enhanced monitoring deployment', 'Integrity verification', 'Performance validation'],
  },
  {
    phase: 'Post-Incident',
    sla: '<5 days',
    description: 'Comprehensive post-incident review. Lessons learned documented and shared. Controls updated to prevent recurrence.',
    actions: ['Post-mortem report', 'Control gap remediation', 'Playbook updates', 'Transparency report update'],
  },
];

export default function SecurityPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-center gap-2 mb-4">
              <Link href="/trust" className="text-[12px] text-[#666666] hover:text-white transition-colors">Trust Center</Link>
              <ChevronRight size={12} className="text-[#444444]" />
              <span className="text-[12px] text-white">Security</span>
            </div>
            <p className="section-label mb-4">Security</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Security Architecture
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Harch Corp security is designed from the ground up — not bolted on. Every component, from physical data center perimeters to application code, is built with defense in depth and zero-trust principles.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ INFRASTRUCTURE SECURITY ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Infrastructure</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Physical & Network Security
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Our data centers are sovereign fortresses — physically secured, network-isolated, and continuously monitored. Every byte that enters or leaves is inspected.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FadeIn delay={0.05}>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Building2 size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Physical Security</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Access Control', desc: 'Multi-factor biometric authentication (fingerprint + iris + badge). Mantrap entry points with interlocking doors. Visitor escort required at all times.' },
                    { label: 'Surveillance', desc: '24/7 CCTV with 90-day retention. AI-powered anomaly detection on all camera feeds. No blind spots in data halls.' },
                    { label: 'Environmental', desc: 'N+1 cooling redundancy. Fire suppression with VESDA early warning. Seismic-rated construction for all critical facilities.' },
                    { label: 'Personnel', desc: 'Background-checked security staff 24/7. Regular physical penetration testing. Strict tailgating prevention policies.' },
                  ].map((item) => (
                    <div key={item.label} className="pb-4 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                      <p className="text-[14px] font-semibold text-white mb-1">{item.label}</p>
                      <p className="text-[13px] text-[#999999] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Wifi size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Network Security</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'DDoS Protection', desc: 'Multi-layer DDoS mitigation with 10Tbps+ scrubbing capacity. Always-on protection with automatic traffic rerouting during volumetric attacks.' },
                    { label: 'Micro-Segmentation', desc: 'Zero-trust network architecture. Every workload isolated in its own security zone. East-west traffic encrypted and authenticated.' },
                    { label: 'WAF & API Gateway', desc: 'Next-gen WAF with ML-powered threat detection. API gateway with rate limiting, schema validation, and bot protection.' },
                    { label: 'Submarine Cable Security', desc: 'Dedicated fiber paths with tamper detection. Encrypted point-to-point links between Morocco and EU landing stations.' },
                  ].map((item) => (
                    <div key={item.label} className="pb-4 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                      <p className="text-[14px] font-semibold text-white mb-1">{item.label}</p>
                      <p className="text-[13px] text-[#999999] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ APPLICATION SECURITY ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Application</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Secure by Default
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Every line of code is reviewed, every dependency is scanned, every deployment is tested. Security is not a phase — it is a continuous practice embedded in our development lifecycle.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Scan,
                title: 'Code Review & SAST',
                desc: 'Every merge request requires security review. Static analysis (SAST) scans for vulnerabilities, secrets, and misconfigurations before code reaches production. Zero-trust in the CI/CD pipeline.',
                metrics: [
                  { label: 'Avg Review Time', value: '<4 hrs' },
                  { label: 'SAST Coverage', value: '100%' },
                  { label: 'False Positive Rate', value: '<3%' },
                ],
              },
              {
                icon: Bug,
                title: 'Penetration Testing',
                desc: 'Annual third-party penetration testing by NCC Group, plus continuous automated DAST scanning. Bug bounty program supplements with real-world attack simulation by ethical hackers.',
                metrics: [
                  { label: 'Annual Pentests', value: '4+' },
                  { label: 'Critical Findings', value: '0 in 2025' },
                  { label: 'Remediation SLA', value: '<72 hrs' },
                ],
              },
              {
                icon: RefreshCw,
                title: 'Vulnerability Management',
                desc: 'Continuous vulnerability scanning of all infrastructure and applications. Risk-based prioritization with automated patching for critical CVEs within 24 hours of disclosure.',
                metrics: [
                  { label: 'Scan Frequency', value: 'Continuous' },
                  { label: 'Critical Patch SLA', value: '<24 hrs' },
                  { label: 'SBOM Coverage', value: '100%' },
                ],
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <div className="card p-8 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
                    <item.icon size={20} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-6 flex-1">{item.desc}</p>
                  <div className="space-y-2 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                    {item.metrics.map((metric) => (
                      <div key={metric.label} className="flex items-center justify-between">
                        <span className="text-[12px] text-[#666666]">{metric.label}</span>
                        <span className="text-[12px] font-semibold text-white stat-mono">{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DATA SECURITY ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Data</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Encryption Everywhere
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Data is encrypted at every stage — at rest, in transit, and during processing. Customer-managed keys give you full control over your encryption boundaries.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn delay={0.05}>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Database size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Encryption at Rest</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Algorithm', value: 'AES-256-GCM' },
                    { label: 'Key Management', value: 'HSM-backed KMS' },
                    { label: 'Key Rotation', value: 'Automatic, 90-day' },
                    { label: 'Customer-Managed Keys', value: 'Supported (CMK)' },
                    { label: 'Volume Encryption', value: 'All storage volumes' },
                    { label: 'Backup Encryption', value: 'Encrypted at rest' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)]">
                      <span className="text-[13px] text-[#666666]">{item.label}</span>
                      <span className="text-[13px] font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Radio size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Encryption in Transit</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Protocol', value: 'TLS 1.3 (minimum)' },
                    { label: 'Certificate Authority', value: 'DigiCert / Internal CA' },
                    { label: 'Certificate Rotation', value: 'Automated, 90-day' },
                    { label: 'Perfect Forward Secrecy', value: 'Enabled' },
                    { label: 'Internal Service Mesh', value: 'mTLS (Istio)' },
                    { label: 'Submarine Links', value: 'MACsec + IPsec' },
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

      {/* ═══ IDENTITY & ACCESS MANAGEMENT ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Identity & Access</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Zero-Trust Identity
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Never trust, always verify. Every access request is authenticated, authorized, and encrypted — regardless of origin. Identity is the new perimeter.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: KeyRound, title: 'Multi-Factor Authentication', desc: 'MFA enforced for all users — no exceptions. Support for TOTP, WebAuthn/FIDO2, hardware keys, and push notifications. Phishing-resistant authentication options available.' },
              { icon: Users, title: 'Role-Based Access Control', desc: 'Fine-grained RBAC with least-privilege defaults. Custom roles for complex organizational structures. Just-in-time access provisioning with automatic expiration.' },
              { icon: Fingerprint, title: 'Privileged Access Management', desc: 'All privileged sessions recorded and audited. Just-in-time elevation with approval workflows. Automated credential rotation for service accounts.' },
              { icon: Shield, title: 'Conditional Access Policies', desc: 'Context-aware access decisions based on device posture, location, risk score, and time of access. Automatic step-up authentication for high-risk operations.' },
              { icon: Cloud, title: 'Single Sign-On (SSO)', desc: 'SAML 2.0 and OIDC integration with all major identity providers. SCIM-based user provisioning and deprovisioning. Session management across all Harch Corp services.' },
              { icon: Eye, title: 'Audit & Compliance', desc: 'Every authentication and authorization event logged immutably. Real-time alerting on suspicious access patterns. Quarterly access reviews with automated deprovisioning.' },
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

      {/* ═══ SECURITY BULLETINS ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Bulletins</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Security Bulletins
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Transparent disclosure of security updates, patches, and vulnerability remediations. We publish every relevant security event — not just the ones that make us look good.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-[#0D0D0D] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Severity</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityBulletins.map((bulletin) => (
                      <tr key={bulletin.id}>
                        <td className="font-[family-name:var(--font-space-mono)] text-[12px]">{bulletin.id}</td>
                        <td>{bulletin.title}</td>
                        <td>
                          <span className={`status-badge ${bulletin.severity === 'High' ? 'status-badge-active' : bulletin.severity === 'Medium' ? 'status-badge-engineering' : 'status-badge-design'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${bulletin.severity === 'High' ? 'bg-white' : bulletin.severity === 'Medium' ? 'bg-[#999999]' : 'bg-[#666666]'}`} />
                            {bulletin.severity}
                          </span>
                        </td>
                        <td className="text-[13px] text-[#999999]">{bulletin.date}</td>
                        <td>
                          <span className="status-badge status-badge-active">
                            <CheckCircle2 size={10} />{bulletin.status}
                          </span>
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

      {/* ═══ INCIDENT RESPONSE ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Incident Response</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Rapid. Structured. Transparent.
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Our incident response process is designed for speed and accountability. Every phase has defined SLAs, clear ownership, and mandatory documentation.
            </p>
          </FadeIn>
          <div className="space-y-4">
            {incidentResponseSteps.map((step, i) => (
              <FadeIn key={step.phase} delay={i * 0.06}>
                <div className="card p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center border border-[rgba(255,255,255,0.06)]">
                        <span className="text-[11px] font-bold text-white/30 font-[family-name:var(--font-space-mono)]">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <div>
                        <h3 className="text-[17px] font-bold text-white">{step.phase}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={12} className="text-white/30" />
                          <span className="text-[12px] stat-mono text-white/50">SLA: {step.sla}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] text-[#999999] leading-[1.7] mb-4">{step.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {step.actions.map((action) => (
                          <div key={action} className="flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-white/25 flex-shrink-0" strokeWidth={1.5} />
                            <span className="text-[12px] text-[#666666]">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">Security Questions?</h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              Our security team is available for detailed architecture reviews, threat model discussions, and custom security assessments.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Contact Security Team <ArrowRight size={14} />
              </Link>
              <Link href="/trust/vulnerability-disclosure" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Vulnerability Disclosure <AlertTriangle size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
