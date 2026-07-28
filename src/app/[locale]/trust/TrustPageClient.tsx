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
import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

export default function TrustPageClient() {
  const t = useTranslations('trust');

  const securityOverview = [
    {
      icon: Server,
      title: t('securityOverview.infrastructure.title'),
      desc: t('securityOverview.infrastructure.desc'),
      link: '/trust/security',
    },
    {
      icon: Lock,
      title: t('securityOverview.dataProtection.title'),
      desc: t('securityOverview.dataProtection.desc'),
      link: '/trust/security',
    },
    {
      icon: KeyRound,
      title: t('securityOverview.accessControl.title'),
      desc: t('securityOverview.accessControl.desc'),
      link: '/trust/security',
    },
    {
      icon: AlertTriangle,
      title: t('securityOverview.incidentResponse.title'),
      desc: t('securityOverview.incidentResponse.desc'),
      link: '/trust/security',
    },
  ];

  const certifications = [
    { name: 'SOC 2 Type II', scope: t('certifications.soc2.scope'), status: 'In Progress' as const, region: t('certifications.regionGlobal') },
    { name: 'ISO 27001', scope: t('certifications.iso27001.scope'), status: 'In Progress' as const, region: t('certifications.regionGlobal') },
    { name: 'ISO 22301', scope: t('certifications.iso22301.scope'), status: 'In Progress' as const, region: t('certifications.regionGlobal') },
    { name: 'GDPR', scope: t('certifications.gdpr.scope'), status: 'Achieved' as const, region: t('certifications.regionEU') },
    { name: 'CCPA', scope: t('certifications.ccpa.scope'), status: 'Achieved' as const, region: t('certifications.regionUS') },
    { name: 'Moroccan DPA', scope: t('certifications.moroccanDpa.scope'), status: 'Achieved' as const, region: t('certifications.regionMorocco') },
    { name: 'ISO 27017', scope: t('certifications.iso27017.scope'), status: 'In Progress' as const, region: t('certifications.regionGlobal') },
    { name: 'ISO 27018', scope: t('certifications.iso27018.scope'), status: 'In Progress' as const, region: t('certifications.regionGlobal') },
    { name: 'HITRUST CSF', scope: t('certifications.hitrust.scope'), status: 'Planned' as const, region: t('certifications.regionGlobal') },
    { name: 'FedRAMP', scope: t('certifications.fedramp.scope'), status: 'Planned' as const, region: t('certifications.regionUS') },
    { name: 'PCI DSS', scope: t('certifications.pcidss.scope'), status: 'In Progress' as const, region: t('certifications.regionGlobal') },
    { name: 'CSA STAR Level 2', scope: t('certifications.csaStar.scope'), status: 'In Progress' as const, region: t('certifications.regionGlobal') },
  ];

  const securityLayers = [
    { layer: 'L1', name: t('securityLayers.physical.name'), desc: t('securityLayers.physical.desc') },
    { layer: 'L2', name: t('securityLayers.network.name'), desc: t('securityLayers.network.desc') },
    { layer: 'L3', name: t('securityLayers.platform.name'), desc: t('securityLayers.platform.desc') },
    { layer: 'L4', name: t('securityLayers.application.name'), desc: t('securityLayers.application.desc') },
    { layer: 'L5', name: t('securityLayers.data.name'), desc: t('securityLayers.data.desc') },
    { layer: 'L6', name: t('securityLayers.identity.name'), desc: t('securityLayers.identity.desc') },
    { layer: 'L7', name: t('securityLayers.monitoring.name'), desc: t('securityLayers.monitoring.desc') },
  ];

  const sharedResponsibility = {
    harch: [
      t('sharedResponsibility.harch.physical'),
      t('sharedResponsibility.harch.network'),
      t('sharedResponsibility.harch.platform'),
      t('sharedResponsibility.harch.hypervisor'),
      t('sharedResponsibility.harch.encryption'),
      t('sharedResponsibility.harch.monitoring'),
      t('sharedResponsibility.harch.ddos'),
      t('sharedResponsibility.harch.identityProvider'),
      t('sharedResponsibility.harch.compliance'),
    ],
    customer: [
      t('sharedResponsibility.customer.accessManagement'),
      t('sharedResponsibility.customer.applicationSecurity'),
      t('sharedResponsibility.customer.dataClassification'),
      t('sharedResponsibility.customer.apiKeyManagement'),
      t('sharedResponsibility.customer.customerKeys'),
      t('sharedResponsibility.customer.workloadHardening'),
      t('sharedResponsibility.customer.auditLogReview'),
      t('sharedResponsibility.customer.thirdPartySecurity'),
    ],
  };

  return (
    <div className="bg-[#0D0D0D]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('title')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('heroTitle')}
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('description')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/trust/security" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                {t('security.title')} <ArrowRight size={14} />
              </Link>
              <Link href="/trust/compliance" className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('compliance.subtitle')}
              </Link>
              <Link href="/trust/vulnerability-disclosure" className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('vulnerability.title')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SECURITY OVERVIEW ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('security.title')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('defenseInDepth')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('securityOverviewDescription')}
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
                    {t('learnMore')} <ChevronRight size={12} />
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
            <p className="section-label mb-4">{t('compliance.title')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('certifiedAuditedVerified')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('complianceDescription')}
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
                        <CheckCircle2 size={10} />{t('statusAchieved')}
                      </span>
                    ) : cert.status === 'In Progress' ? (
                      <span className="status-badge status-badge-engineering">
                        <Clock size={10} />{t('statusInProgress')}
                      </span>
                    ) : (
                      <span className="status-badge status-badge-design">
                        <CalendarClock size={10} />{t('statusPlanned')}
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
                {t('viewAllCompliance')} <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SECURITY ARCHITECTURE ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('architecture')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('securityLayersTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('securityLayersDescription')}
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
              <p className="section-label mb-4">{t('vulnerability.title')}</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
                {t('vulnerability.helpUsTitle')}
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[15px] text-[#999999] leading-relaxed mb-6">
                {t('vulnerability.description')}
              </p>
              <p className="text-[14px] text-[#666666] leading-relaxed mb-8">
                {t('vulnerability.commitment')}
              </p>
              <Link href="/trust/vulnerability-disclosure" className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('vulnerability.fullPolicy')} <ArrowRight size={14} />
              </Link>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="space-y-4">
                {[
                  { step: '01', title: t('vulnerability.step1Title'), desc: t('vulnerability.step1Desc') },
                  { step: '02', title: t('vulnerability.step2Title'), desc: t('vulnerability.step2Desc') },
                  { step: '03', title: t('vulnerability.step3Title'), desc: t('vulnerability.step3Desc') },
                  { step: '04', title: t('vulnerability.step4Title'), desc: t('vulnerability.step4Desc') },
                  { step: '05', title: t('vulnerability.step5Title'), desc: t('vulnerability.step5Desc') },
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
            <p className="section-label mb-4">{t('aiEthics.title')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('aiEthics.responsibleAI')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('aiEthics.description')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <FadeIn delay={0.05}>
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Scale size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[15px] font-bold text-white">{t('aiEthics.fairnessScore')}</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-1 stat-mono">0.94</p>
                <p className="text-[12px] text-[#666666]">{t('aiEthics.acrossProtectedAttributes')}</p>
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
                  <h3 className="text-[15px] font-bold text-white">{t('aiEthics.modelTransparency')}</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-1 stat-mono">87%</p>
                <p className="text-[12px] text-[#666666]">{t('aiEthics.explainabilityReports')}</p>
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
                  <h3 className="text-[15px] font-bold text-white">{t('aiEthics.biasIncidents')}</h3>
                </div>
                <p className="text-3xl font-bold text-white mb-1 stat-mono">0</p>
                <p className="text-[12px] text-[#666666]">{t('aiEthics.criticalBias2025')}</p>
                <div className="mt-4 w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)]">
                  <div className="h-full rounded-full bg-white/30" style={{ width: '100%' }} />
                </div>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.2}>
            <div className="text-center">
              <Link href="/trust/ai-ethics" className="inline-flex items-center gap-2 text-[14px] text-white/60 hover:text-white transition-colors">
                {t('aiEthics.exploreFramework')} <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ DATA PRIVACY FRAMEWORK ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('dataPrivacy')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('dataPrivacyTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('dataPrivacyDescription')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Database, title: t('dataPrivacyItems.residency.title'), desc: t('dataPrivacyItems.residency.desc') },
              { icon: Fingerprint, title: t('dataPrivacyItems.consent.title'), desc: t('dataPrivacyItems.consent.desc') },
              { icon: Cloud, title: t('dataPrivacyItems.crossBorder.title'), desc: t('dataPrivacyItems.crossBorder.desc') },
              { icon: Shield, title: t('dataPrivacyItems.dpa.title'), desc: t('dataPrivacyItems.dpa.desc') },
              { icon: Eye, title: t('dataPrivacyItems.subjectRights.title'), desc: t('dataPrivacyItems.subjectRights.desc') },
              { icon: Globe, title: t('dataPrivacyItems.africanFramework.title'), desc: t('dataPrivacyItems.africanFramework.desc') },
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
              <p className="section-label mb-4">{t('transparency.title')}</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
                {t('transparencyReportTitle')}
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[15px] text-[#999999] leading-relaxed mb-6">
                {t('transparencyReportDescription')}
              </p>
              <div className="space-y-3 mb-8">
                {[
                  { label: t('transparency.securityIncidents'), value: t('transparency.securityIncidentsValue') },
                  { label: t('transparency.governmentRequests'), value: t('transparency.governmentRequestsValue') },
                  { label: t('transparency.meanTimeToDetect'), value: t('transparency.meanTimeToDetectValue') },
                  { label: t('transparency.meanTimeToContain'), value: t('transparency.meanTimeToContainValue') },
                  { label: t('transparency.uptimeSla'), value: t('transparency.uptimeSlaValue') },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)]">
                    <span className="text-[13px] text-[#999999]">{item.label}</span>
                    <span className="text-[13px] font-semibold text-white stat-mono">{item.value}</span>
                  </div>
                ))}
              </div>
              <button className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('transparency.downloadReport')} <ExternalLink size={14} />
              </button>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card p-8">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#666666] mb-6">{t('transparency.reportArchive')}</p>
                <div className="space-y-3">
                  {[
                    { quarter: t('transparency.reportQ4.date'), date: t('transparency.reportQ4.release'), status: 'Latest' },
                    { quarter: t('transparency.reportQ3.date'), date: t('transparency.reportQ3.release'), status: 'Published' },
                    { quarter: t('transparency.reportQ2.date'), date: t('transparency.reportQ2.release'), status: 'Published' },
                    { quarter: t('transparency.reportQ1.date'), date: t('transparency.reportQ1.release'), status: 'Published' },
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
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />{t('transparency.latest')}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#666666]">{t('pdf')}</span>
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
            <p className="section-label mb-4">{t('sharedResponsibility.title')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('sharedResponsibilityTitle')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('sharedResponsibilityDescription')}
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
                    <h3 className="text-lg font-bold text-white">{t('harchCorpSecures')}</h3>
                    <p className="text-[11px] text-[#666666]">{t('infrastructurePlatformLayer')}</p>
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
                    <h3 className="text-lg font-bold text-white">{t('customerSecures')}</h3>
                    <p className="text-[11px] text-[#666666]">{t('applicationConfigLayer')}</p>
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
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">{t('ctaTitle')}</h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              {t('ctaDescription')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                {t('requestBriefing')} <ArrowRight size={14} />
              </Link>
              <a href={`mailto:${t('contactEmail')}`} className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                <Mail size={14} /> {t('contactEmail')}
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
