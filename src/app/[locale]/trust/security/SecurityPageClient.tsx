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
import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

export default function SecurityPageClient() {
  const t = useTranslations('trust');

  const securityBulletins = [
    {
      id: 'HCSB-2025-008',
      title: t('security.bulletins.bulletin8.title'),
      severity: t('security.bulletins.severityLow'),
      date: t('security.bulletins.bulletin8.date'),
      status: t('security.bulletins.statusResolved'),
    },
    {
      id: 'HCSB-2025-007',
      title: t('security.bulletins.bulletin7.title'),
      severity: t('security.bulletins.severityLow'),
      date: t('security.bulletins.bulletin7.date'),
      status: t('security.bulletins.statusResolved'),
    },
    {
      id: 'HCSB-2025-006',
      title: t('security.bulletins.bulletin6.title'),
      severity: t('security.bulletins.severityMedium'),
      date: t('security.bulletins.bulletin6.date'),
      status: t('security.bulletins.statusResolved'),
    },
    {
      id: 'HCSB-2025-005',
      title: t('security.bulletins.bulletin5.title'),
      severity: t('security.bulletins.severityLow'),
      date: t('security.bulletins.bulletin5.date'),
      status: t('security.bulletins.statusResolved'),
    },
    {
      id: 'HCSB-2025-004',
      title: t('security.bulletins.bulletin4.title'),
      severity: t('security.bulletins.severityHigh'),
      date: t('security.bulletins.bulletin4.date'),
      status: t('security.bulletins.statusResolved'),
    },
  ];

  const incidentResponseSteps = [
    {
      phase: t('security.incidentResponse.detection.phase'),
      sla: t('security.incidentResponse.detection.sla'),
      description: t('security.incidentResponse.detection.description'),
      actions: [
        t('security.incidentResponse.detection.action1'),
        t('security.incidentResponse.detection.action2'),
        t('security.incidentResponse.detection.action3'),
        t('security.incidentResponse.detection.action4'),
      ],
    },
    {
      phase: t('security.incidentResponse.triage.phase'),
      sla: t('security.incidentResponse.triage.sla'),
      description: t('security.incidentResponse.triage.description'),
      actions: [
        t('security.incidentResponse.triage.action1'),
        t('security.incidentResponse.triage.action2'),
        t('security.incidentResponse.triage.action3'),
        t('security.incidentResponse.triage.action4'),
      ],
    },
    {
      phase: t('security.incidentResponse.containment.phase'),
      sla: t('security.incidentResponse.containment.sla'),
      description: t('security.incidentResponse.containment.description'),
      actions: [
        t('security.incidentResponse.containment.action1'),
        t('security.incidentResponse.containment.action2'),
        t('security.incidentResponse.containment.action3'),
        t('security.incidentResponse.containment.action4'),
      ],
    },
    {
      phase: t('security.incidentResponse.eradication.phase'),
      sla: t('security.incidentResponse.eradication.sla'),
      description: t('security.incidentResponse.eradication.description'),
      actions: [
        t('security.incidentResponse.eradication.action1'),
        t('security.incidentResponse.eradication.action2'),
        t('security.incidentResponse.eradication.action3'),
        t('security.incidentResponse.eradication.action4'),
      ],
    },
    {
      phase: t('security.incidentResponse.recovery.phase'),
      sla: t('security.incidentResponse.recovery.sla'),
      description: t('security.incidentResponse.recovery.description'),
      actions: [
        t('security.incidentResponse.recovery.action1'),
        t('security.incidentResponse.recovery.action2'),
        t('security.incidentResponse.recovery.action3'),
        t('security.incidentResponse.recovery.action4'),
      ],
    },
    {
      phase: t('security.incidentResponse.postIncident.phase'),
      sla: t('security.incidentResponse.postIncident.sla'),
      description: t('security.incidentResponse.postIncident.description'),
      actions: [
        t('security.incidentResponse.postIncident.action1'),
        t('security.incidentResponse.postIncident.action2'),
        t('security.incidentResponse.postIncident.action3'),
        t('security.incidentResponse.postIncident.action4'),
      ],
    },
  ];

  return (
    <div className="bg-[#0D0D0D]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-center gap-2 mb-4">
              <Link href="/trust" className="text-[12px] text-[#666666] hover:text-white transition-colors">{t('title')}</Link>
              <ChevronRight size={12} className="text-[#444444]" />
              <span className="text-[12px] text-white">{t('security.title')}</span>
            </div>
            <p className="section-label mb-4">{t('security.title')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('security.heroTitle')}
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('security.heroDescription')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ INFRASTRUCTURE SECURITY ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('security.infrastructure.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('security.infrastructure.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('security.infrastructure.description')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FadeIn delay={0.05}>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Building2 size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white">{t('security.infrastructure.physical.title')}</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: t('security.infrastructure.physical.accessControl.label'), desc: t('security.infrastructure.physical.accessControl.desc') },
                    { label: t('security.infrastructure.physical.surveillance.label'), desc: t('security.infrastructure.physical.surveillance.desc') },
                    { label: t('security.infrastructure.physical.environmental.label'), desc: t('security.infrastructure.physical.environmental.desc') },
                    { label: t('security.infrastructure.physical.personnel.label'), desc: t('security.infrastructure.physical.personnel.desc') },
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
                  <h3 className="text-lg font-bold text-white">{t('security.infrastructure.network.title')}</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: t('security.infrastructure.network.ddos.label'), desc: t('security.infrastructure.network.ddos.desc') },
                    { label: t('security.infrastructure.network.microSegmentation.label'), desc: t('security.infrastructure.network.microSegmentation.desc') },
                    { label: t('security.infrastructure.network.waf.label'), desc: t('security.infrastructure.network.waf.desc') },
                    { label: t('security.infrastructure.network.submarine.label'), desc: t('security.infrastructure.network.submarine.desc') },
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
            <p className="section-label mb-4">{t('security.application.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('security.application.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('security.application.description')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Scan,
                title: t('security.application.codeReview.title'),
                desc: t('security.application.codeReview.desc'),
                metrics: [
                  { label: t('security.application.codeReview.metric1Label'), value: t('security.application.codeReview.metric1Value') },
                  { label: t('security.application.codeReview.metric2Label'), value: t('security.application.codeReview.metric2Value') },
                  { label: t('security.application.codeReview.metric3Label'), value: t('security.application.codeReview.metric3Value') },
                ],
              },
              {
                icon: Bug,
                title: t('security.application.pentest.title'),
                desc: t('security.application.pentest.desc'),
                metrics: [
                  { label: t('security.application.pentest.metric1Label'), value: t('security.application.pentest.metric1Value') },
                  { label: t('security.application.pentest.metric2Label'), value: t('security.application.pentest.metric2Value') },
                  { label: t('security.application.pentest.metric3Label'), value: t('security.application.pentest.metric3Value') },
                ],
              },
              {
                icon: RefreshCw,
                title: t('security.application.vulnManagement.title'),
                desc: t('security.application.vulnManagement.desc'),
                metrics: [
                  { label: t('security.application.vulnManagement.metric1Label'), value: t('security.application.vulnManagement.metric1Value') },
                  { label: t('security.application.vulnManagement.metric2Label'), value: t('security.application.vulnManagement.metric2Value') },
                  { label: t('security.application.vulnManagement.metric3Label'), value: t('security.application.vulnManagement.metric3Value') },
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
            <p className="section-label mb-4">{t('security.data.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('security.data.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('security.data.description')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn delay={0.05}>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Database size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white">{t('security.data.encryptionAtRest.title')}</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: t('security.data.encryptionAtRest.algorithm.label'), value: t('security.data.encryptionAtRest.algorithm.value') },
                    { label: t('security.data.encryptionAtRest.keyManagement.label'), value: t('security.data.encryptionAtRest.keyManagement.value') },
                    { label: t('security.data.encryptionAtRest.keyRotation.label'), value: t('security.data.encryptionAtRest.keyRotation.value') },
                    { label: t('security.data.encryptionAtRest.cmk.label'), value: t('security.data.encryptionAtRest.cmk.value') },
                    { label: t('security.data.encryptionAtRest.volumeEncryption.label'), value: t('security.data.encryptionAtRest.volumeEncryption.value') },
                    { label: t('security.data.encryptionAtRest.backupEncryption.label'), value: t('security.data.encryptionAtRest.backupEncryption.value') },
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
                  <h3 className="text-lg font-bold text-white">{t('security.data.encryptionInTransit.title')}</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: t('security.data.encryptionInTransit.protocol.label'), value: t('security.data.encryptionInTransit.protocol.value') },
                    { label: t('security.data.encryptionInTransit.certificateAuthority.label'), value: t('security.data.encryptionInTransit.certificateAuthority.value') },
                    { label: t('security.data.encryptionInTransit.certRotation.label'), value: t('security.data.encryptionInTransit.certRotation.value') },
                    { label: t('security.data.encryptionInTransit.forwardSecrecy.label'), value: t('security.data.encryptionInTransit.forwardSecrecy.value') },
                    { label: t('security.data.encryptionInTransit.serviceMesh.label'), value: t('security.data.encryptionInTransit.serviceMesh.value') },
                    { label: t('security.data.encryptionInTransit.submarineLinks.label'), value: t('security.data.encryptionInTransit.submarineLinks.value') },
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
            <p className="section-label mb-4">{t('security.identity.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('security.identity.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('security.identity.description')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: KeyRound, title: t('security.identity.mfa.title'), desc: t('security.identity.mfa.desc') },
              { icon: Users, title: t('security.identity.rbac.title'), desc: t('security.identity.rbac.desc') },
              { icon: Fingerprint, title: t('security.identity.pam.title'), desc: t('security.identity.pam.desc') },
              { icon: Shield, title: t('security.identity.conditionalAccess.title'), desc: t('security.identity.conditionalAccess.desc') },
              { icon: Cloud, title: t('security.identity.sso.title'), desc: t('security.identity.sso.desc') },
              { icon: Eye, title: t('security.identity.auditCompliance.title'), desc: t('security.identity.auditCompliance.desc') },
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
            <p className="section-label mb-4">{t('security.bulletins.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('security.bulletins.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('security.bulletins.description')}
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-[#0D0D0D] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('tableId')}</th>
                      <th>{t('security.bulletins.tableTitle')}</th>
                      <th>{t('security.bulletins.tableSeverity')}</th>
                      <th>{t('security.bulletins.tableDate')}</th>
                      <th>{t('security.bulletins.tableStatus')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityBulletins.map((bulletin) => (
                      <tr key={bulletin.id}>
                        <td className="font-[family-name:var(--font-space-mono)] text-[12px]">{bulletin.id}</td>
                        <td>{bulletin.title}</td>
                        <td>
                          <span className={`status-badge ${bulletin.severity === t('security.bulletins.severityHigh') ? 'status-badge-active' : bulletin.severity === t('security.bulletins.severityMedium') ? 'status-badge-engineering' : 'status-badge-design'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${bulletin.severity === t('security.bulletins.severityHigh') ? 'bg-white' : bulletin.severity === t('security.bulletins.severityMedium') ? 'bg-[#999999]' : 'bg-[#666666]'}`} />
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
            <p className="section-label mb-4">{t('security.incidentResponse.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('security.incidentResponse.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('security.incidentResponse.description')}
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
                          <span className="text-[12px] stat-mono text-white/50">{t('slaLabel')} {step.sla}</span>
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
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">{t('security.cta.title')}</h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              {t('security.cta.description')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                {t('security.cta.contactTeam')} <ArrowRight size={14} />
              </Link>
              <Link href="/trust/vulnerability-disclosure" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('vulnerability.title')} <AlertTriangle size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
