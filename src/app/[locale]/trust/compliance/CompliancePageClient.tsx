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
import { useTranslations, useLocale } from 'next-intl';

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

export default function CompliancePageClient() {
  const t = useTranslations('trust');
  const locale = useLocale();

  const certifications: Certification[] = [
    {
      name: 'SOC 2 Type II',
      fullName: t('compliance.certifications.soc2.fullName'),
      description: t('compliance.certifications.soc2.description'),
      status: 'In Progress',
      region: t('compliance.regionGlobal'),
      nextAudit: t('compliance.auditDates.q3_2026'),
      scope: t('compliance.certifications.soc2.scope'),
    },
    {
      name: 'ISO 27001',
      fullName: t('compliance.certifications.iso27001.fullName'),
      description: t('compliance.certifications.iso27001.description'),
      status: 'In Progress',
      region: t('compliance.regionGlobal'),
      nextAudit: t('compliance.auditDates.q4_2026'),
      scope: t('compliance.certifications.iso27001.scope'),
    },
    {
      name: 'ISO 22301',
      fullName: t('compliance.certifications.iso22301.fullName'),
      description: t('compliance.certifications.iso22301.description'),
      status: 'In Progress',
      region: t('compliance.regionGlobal'),
      nextAudit: t('compliance.auditDates.q4_2026'),
      scope: t('compliance.certifications.iso22301.scope'),
    },
    {
      name: 'GDPR',
      fullName: t('compliance.certifications.gdpr.fullName'),
      description: t('compliance.certifications.gdpr.description'),
      status: 'Achieved',
      region: t('compliance.regionEU'),
      lastAudit: t('compliance.ongoing'),
      nextAudit: t('compliance.continuous'),
      scope: t('compliance.certifications.gdpr.scope'),
    },
    {
      name: 'CCPA',
      fullName: t('compliance.certifications.ccpa.fullName'),
      description: t('compliance.certifications.ccpa.description'),
      status: 'Achieved',
      region: t('compliance.regionUS'),
      lastAudit: t('compliance.ongoing'),
      nextAudit: t('compliance.continuous'),
      scope: t('compliance.certifications.ccpa.scope'),
    },
    {
      name: 'Moroccan DPA',
      fullName: t('compliance.certifications.moroccanDpa.fullName'),
      description: t('compliance.certifications.moroccanDpa.description'),
      status: 'Achieved',
      region: t('compliance.regionMorocco'),
      auditor: t('compliance.certifications.moroccanDpa.auditor'),
      lastAudit: t('compliance.auditDates.jun_2025'),
      nextAudit: t('compliance.auditDates.jun_2026'),
      scope: t('compliance.certifications.moroccanDpa.scope'),
    },
    {
      name: 'ISO 27017',
      fullName: t('compliance.certifications.iso27017.fullName'),
      description: t('compliance.certifications.iso27017.description'),
      status: 'In Progress',
      region: t('compliance.regionGlobal'),
      nextAudit: t('compliance.auditDates.q2_2026'),
      scope: t('compliance.certifications.iso27017.scope'),
    },
    {
      name: 'ISO 27018',
      fullName: t('compliance.certifications.iso27018.fullName'),
      description: t('compliance.certifications.iso27018.description'),
      status: 'In Progress',
      region: t('compliance.regionGlobal'),
      nextAudit: t('compliance.auditDates.q2_2026'),
      scope: t('compliance.certifications.iso27018.scope'),
    },
    {
      name: 'PCI DSS',
      fullName: t('compliance.certifications.pciDss.fullName'),
      description: t('compliance.certifications.pciDss.description'),
      status: 'In Progress',
      region: t('compliance.regionGlobal'),
      nextAudit: t('compliance.auditDates.q3_2026'),
      scope: t('compliance.certifications.pciDss.scope'),
    },
    {
      name: 'CSA STAR Level 2',
      fullName: t('compliance.certifications.csaStar.fullName'),
      description: t('compliance.certifications.csaStar.description'),
      status: 'In Progress',
      region: t('compliance.regionGlobal'),
      nextAudit: t('compliance.auditDates.q3_2026'),
      scope: t('compliance.certifications.csaStar.scope'),
    },
    {
      name: 'HITRUST CSF',
      fullName: t('compliance.certifications.hitrust.fullName'),
      description: t('compliance.certifications.hitrust.description'),
      status: 'Planned',
      region: t('compliance.regionGlobal'),
      nextAudit: t('compliance.auditDates.q1_2027'),
      scope: t('compliance.certifications.hitrust.scope'),
    },
    {
      name: 'FedRAMP',
      fullName: t('compliance.certifications.fedramp.fullName'),
      description: t('compliance.certifications.fedramp.description'),
      status: 'Planned',
      region: t('compliance.regionUS'),
      nextAudit: t('compliance.auditDates.q2_2027'),
      scope: t('compliance.certifications.fedramp.scope'),
    },
  ];

  const regions = [
    {
      name: t('compliance.regions.morocco.name'),
      flag: 'MA',
      description: t('compliance.regions.morocco.description'),
      certs: [t('compliance.regions.morocco.cert1'), t('compliance.regions.morocco.cert2'), t('compliance.regions.morocco.cert3'), t('compliance.regions.morocco.cert4')],
    },
    {
      name: t('compliance.regions.eu.name'),
      flag: 'EU',
      description: t('compliance.regions.eu.description'),
      certs: [t('compliance.regions.eu.cert1'), t('compliance.regions.eu.cert2'), t('compliance.regions.eu.cert3'), t('compliance.regions.eu.cert4')],
    },
    {
      name: t('compliance.regions.africa.name'),
      flag: 'AF',
      description: t('compliance.regions.africa.description'),
      certs: [t('compliance.regions.africa.cert1'), t('compliance.regions.africa.cert2'), t('compliance.regions.africa.cert3'), t('compliance.regions.africa.cert4')],
    },
    {
      name: t('compliance.regions.global.name'),
      flag: 'GL',
      description: t('compliance.regions.global.description'),
      certs: [t('compliance.regions.global.cert1'), t('compliance.regions.global.cert2'), t('compliance.regions.global.cert3'), t('compliance.regions.global.cert4')],
    },
  ];

  const auditReports = [
    { name: t('compliance.auditReports.soc2Readiness.name'), period: t('compliance.auditReports.soc2Readiness.period'), auditor: t('compliance.auditReports.soc2Readiness.auditor'), type: t('compliance.auditReports.soc2Readiness.type'), available: true },
    { name: t('compliance.auditReports.iso27001Gap.name'), period: t('compliance.auditReports.iso27001Gap.period'), auditor: t('compliance.auditReports.iso27001Gap.auditor'), type: t('compliance.auditReports.iso27001Gap.type'), available: true },
    { name: t('compliance.auditReports.pentest.name'), period: t('compliance.auditReports.pentest.period'), auditor: t('compliance.auditReports.pentest.auditor'), type: t('compliance.auditReports.pentest.type'), available: true },
    { name: t('compliance.auditReports.cloudSecurity.name'), period: t('compliance.auditReports.cloudSecurity.period'), auditor: t('compliance.auditReports.cloudSecurity.auditor'), type: t('compliance.auditReports.cloudSecurity.type'), available: true },
    { name: t('compliance.auditReports.gdprDpia.name'), period: t('compliance.auditReports.gdprDpia.period'), auditor: t('compliance.auditReports.gdprDpia.auditor'), type: t('compliance.auditReports.gdprDpia.type'), available: true },
    { name: t('compliance.auditReports.cndpRegistration.name'), period: t('compliance.auditReports.cndpRegistration.period'), auditor: t('compliance.auditReports.cndpRegistration.auditor'), type: t('compliance.auditReports.cndpRegistration.type'), available: true },
    { name: t('compliance.auditReports.bcTest.name'), period: t('compliance.auditReports.bcTest.period'), auditor: t('compliance.auditReports.bcTest.auditor'), type: t('compliance.auditReports.bcTest.type'), available: true },
  ];

  function StatusBadge({ status }: { status: CertStatus }) {
    if (status === 'Achieved') {
      return (
        <span className="status-badge status-badge-active">
          <CheckCircle2 size={10} />{t('statusAchieved')}
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className="status-badge status-badge-engineering">
          <Clock size={10} />{t('statusInProgress')}
        </span>
      );
    }
    return (
      <span className="status-badge status-badge-design">
        <CalendarClock size={10} />{t('statusPlanned')}
      </span>
    );
  }

  return (
    <div className="bg-[#0D0D0D]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-center gap-2 mb-4">
              <Link href="/trust" className="text-[12px] text-[#666666] hover:text-white transition-colors">{t('title')}</Link>
              <ChevronRight size={12} className="text-[#444444]" />
              <span className="text-[12px] text-white">{t('compliance.title')}</span>
            </div>
            <p className="section-label mb-4">{t('compliance.title')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('compliance.heroTitle')}
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('compliance.heroDescription')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CERTIFICATIONS LIST ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('compliance.certifications.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('compliance.certifications.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('compliance.certifications.description')}
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
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-1">{t('compliance.scopeLabel')}</p>
                      <p className="text-[12px] text-white">{cert.scope}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-1">{t('compliance.regionLabel')}</p>
                      <p className="text-[12px] text-white">{cert.region}</p>
                    </div>
                    {cert.auditor && (
                      <div>
                        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-1">{t('compliance.auditorLabel')}</p>
                        <p className="text-[12px] text-white">{cert.auditor}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-1">{t('compliance.lastAuditLabel')}</p>
                      <p className="text-[12px] text-white">{cert.lastAudit || t('compliance.pending')}</p>
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
            <p className="section-label mb-4">{t('compliance.regionalPrograms')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('compliance.regions.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('compliance.regions.description')}
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
                        <MapPin size={10} />{t('compliance.regionalPrograms')}
                      </div>
                    </div>
                  </div>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-6">{region.description}</p>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666]">{t('compliance.activeCertifications')}</p>
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
            <p className="section-label mb-4">{t('compliance.auditReports.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('compliance.auditReports.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('compliance.auditReports.description')}
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-[#0D0D0D] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('compliance.auditReports.tableDocument')}</th>
                      <th>{t('compliance.auditReports.tablePeriod')}</th>
                      <th>{t('compliance.auditReports.tableAuditor')}</th>
                      <th>{t('compliance.auditReports.tableType')}</th>
                      <th>{t('compliance.auditReports.tableAccess')}</th>
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
                              <Download size={12} />{t('compliance.auditReports.requestAccess')}
                            </button>
                          ) : (
                            <span className="text-[12px] text-[#666666]">{t('compliance.pending')}</span>
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
              <p className="section-label mb-4">{t('compliance.dpa.label')}</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
                {t('compliance.dpa.title')}
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[15px] text-[#999999] leading-relaxed mb-6">
                {t('compliance.dpa.description')}
              </p>
              <div className="space-y-4 mb-8">
                {[
                  t('compliance.dpa.feature1'),
                  t('compliance.dpa.feature2'),
                  t('compliance.dpa.feature3'),
                  t('compliance.dpa.feature4'),
                  t('compliance.dpa.feature5'),
                  t('compliance.dpa.feature6'),
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-white/40 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="text-[13px] text-[#999999]">{item}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    try {
                      const url = `/api/pdf/security-overview?locale=${locale}`;
                      const response = await fetch(url);
                      if (!response.ok) throw new Error('Failed to generate PDF');
                      const blob = await response.blob();
                      const downloadUrl = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = downloadUrl;
                      link.download = `harchcorp-security-overview-${locale}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(downloadUrl);
                    } catch (error) {
                      console.error('PDF download error:', error);
                    }
                  }}
                  className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all"
                >
                  <Download size={14} /> {t('compliance.dpa.downloadPdf')}
                </button>
                <button className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                  <BookOpen size={14} /> {t('compliance.dpa.summary')}
                </button>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card p-8">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#666666] mb-6">{t('compliance.dpa.quickReference')}</p>
                <div className="space-y-4">
                  {[
                    { label: t('compliance.dpa.ref.governingLaw'), value: t('compliance.dpa.ref.governingLawValue') },
                    { label: t('compliance.dpa.ref.dataController'), value: t('compliance.dpa.ref.dataControllerValue') },
                    { label: t('compliance.dpa.ref.dataProcessor'), value: t('compliance.dpa.ref.dataProcessorValue') },
                    { label: t('compliance.dpa.ref.subProcessors'), value: t('compliance.dpa.ref.subProcessorsValue') },
                    { label: t('compliance.dpa.ref.breachNotification'), value: t('compliance.dpa.ref.breachNotificationValue') },
                    { label: t('compliance.dpa.ref.auditRight'), value: t('compliance.dpa.ref.auditRightValue') },
                    { label: t('compliance.dpa.ref.dataDeletion'), value: t('compliance.dpa.ref.dataDeletionValue') },
                    { label: t('compliance.dpa.ref.crossBorder'), value: t('compliance.dpa.ref.crossBorderValue') },
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
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">{t('compliance.cta.title')}</h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              {t('compliance.cta.description')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                {t('requestBriefing')} <ArrowRight size={14} />
              </Link>
              <Link href="/trust" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('compliance.cta.backToTrust')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
