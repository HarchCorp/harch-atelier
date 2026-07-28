'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ChevronRight,
  Scale,
  Eye,
  Shield,
  Users,
  Heart,
  Brain,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Activity,
  Target,
  Cpu,
  LineChart,
  UserCheck,
  Globe,
  BookOpen,
  Mail,
  Zap,
  Lock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

export default function AIEthicsPageClient() {
  const t = useTranslations('trust');

  const aiPrinciples = [
    {
      icon: Scale,
      title: t('aiEthics.principles.fairness.title'),
      desc: t('aiEthics.principles.fairness.desc'),
      commitment: t('aiEthics.principles.fairness.commitment'),
    },
    {
      icon: Eye,
      title: t('aiEthics.principles.transparency.title'),
      desc: t('aiEthics.principles.transparency.desc'),
      commitment: t('aiEthics.principles.transparency.commitment'),
    },
    {
      icon: Shield,
      title: t('aiEthics.principles.privacy.title'),
      desc: t('aiEthics.principles.privacy.desc'),
      commitment: t('aiEthics.principles.privacy.commitment'),
    },
    {
      icon: Users,
      title: t('aiEthics.principles.humanOversight.title'),
      desc: t('aiEthics.principles.humanOversight.desc'),
      commitment: t('aiEthics.principles.humanOversight.commitment'),
    },
    {
      icon: Heart,
      title: t('aiEthics.principles.socialBenefit.title'),
      desc: t('aiEthics.principles.socialBenefit.desc'),
      commitment: t('aiEthics.principles.socialBenefit.commitment'),
    },
  ];

  const biasTestingMethods = [
    {
      method: t('aiEthics.biasTesting.preDeployment.title'),
      desc: t('aiEthics.biasTesting.preDeployment.desc'),
      frequency: t('aiEthics.biasTesting.preDeployment.frequency'),
      status: t('aiEthics.biasTesting.statusActive'),
    },
    {
      method: t('aiEthics.biasTesting.adversarial.title'),
      desc: t('aiEthics.biasTesting.adversarial.desc'),
      frequency: t('aiEthics.biasTesting.adversarial.frequency'),
      status: t('aiEthics.biasTesting.statusActive'),
    },
    {
      method: t('aiEthics.biasTesting.continuousMonitoring.title'),
      desc: t('aiEthics.biasTesting.continuousMonitoring.desc'),
      frequency: t('aiEthics.biasTesting.continuousMonitoring.frequency'),
      status: t('aiEthics.biasTesting.statusActive'),
    },
    {
      method: t('aiEthics.biasTesting.thirdParty.title'),
      desc: t('aiEthics.biasTesting.thirdParty.desc'),
      frequency: t('aiEthics.biasTesting.thirdParty.frequency'),
      status: t('aiEthics.biasTesting.statusActive'),
    },
    {
      method: t('aiEthics.biasTesting.communityFeedback.title'),
      desc: t('aiEthics.biasTesting.communityFeedback.desc'),
      frequency: t('aiEthics.biasTesting.communityFeedback.frequency'),
      status: t('aiEthics.biasTesting.statusActive'),
    },
  ];

  const transparencyItems = [
    {
      title: t('aiEthics.transparency.modelCards.title'),
      desc: t('aiEthics.transparency.modelCards.desc'),
      status: t('aiEthics.transparency.modelCards.status'),
    },
    {
      title: t('aiEthics.transparency.auditTrails.title'),
      desc: t('aiEthics.transparency.auditTrails.desc'),
      status: t('aiEthics.transparency.auditTrails.status'),
    },
    {
      title: t('aiEthics.transparency.dataSheets.title'),
      desc: t('aiEthics.transparency.dataSheets.desc'),
      status: t('aiEthics.transparency.dataSheets.status'),
    },
    {
      title: t('aiEthics.transparency.explainability.title'),
      desc: t('aiEthics.transparency.explainability.desc'),
      status: t('aiEthics.transparency.explainability.status'),
    },
  ];

  const oversightFramework = [
    {
      level: t('aiEthics.oversight.level1.label'),
      title: t('aiEthics.oversight.level1.title'),
      desc: t('aiEthics.oversight.level1.desc'),
      examples: t('aiEthics.oversight.level1.examples'),
      color: 'bg-white/8',
    },
    {
      level: t('aiEthics.oversight.level2.label'),
      title: t('aiEthics.oversight.level2.title'),
      desc: t('aiEthics.oversight.level2.desc'),
      examples: t('aiEthics.oversight.level2.examples'),
      color: 'bg-white/5',
    },
    {
      level: t('aiEthics.oversight.level3.label'),
      title: t('aiEthics.oversight.level3.title'),
      desc: t('aiEthics.oversight.level3.desc'),
      examples: t('aiEthics.oversight.level3.examples'),
      color: 'bg-white/3',
    },
  ];

  const reviewBoardMembers = [
    { role: t('aiEthics.reviewBoard.chiefEthicsOfficer.role'), name: t('aiEthics.reviewBoard.chiefEthicsOfficer.title'), desc: t('aiEthics.reviewBoard.chiefEthicsOfficer.desc') },
    { role: t('aiEthics.reviewBoard.headOfResearch.role'), name: t('aiEthics.reviewBoard.headOfResearch.title'), desc: t('aiEthics.reviewBoard.headOfResearch.desc') },
    { role: t('aiEthics.reviewBoard.legalLead.role'), name: t('aiEthics.reviewBoard.legalLead.title'), desc: t('aiEthics.reviewBoard.legalLead.desc') },
    { role: t('aiEthics.reviewBoard.externalAdvisor.role'), name: t('aiEthics.reviewBoard.externalAdvisor.title'), desc: t('aiEthics.reviewBoard.externalAdvisor.desc') },
    { role: t('aiEthics.reviewBoard.communityRep.role'), name: t('aiEthics.reviewBoard.communityRep.title'), desc: t('aiEthics.reviewBoard.communityRep.desc') },
    { role: t('aiEthics.reviewBoard.privacyOfficer.role'), name: t('aiEthics.reviewBoard.privacyOfficer.title'), desc: t('aiEthics.reviewBoard.privacyOfficer.desc') },
  ];

  const dashboardMetrics = [
    { category: t('aiEthics.dashboard.categoryFairness'), metric: t('aiEthics.dashboard.demographicParity'), value: '0.032', threshold: '<0.05', status: t('aiEthics.dashboard.statusPass') },
    { category: t('aiEthics.dashboard.categoryFairness'), metric: t('aiEthics.dashboard.equalizedOdds'), value: '0.028', threshold: '<0.05', status: t('aiEthics.dashboard.statusPass') },
    { category: t('aiEthics.dashboard.categoryFairness'), metric: t('aiEthics.dashboard.calibrationError'), value: '0.015', threshold: '<0.03', status: t('aiEthics.dashboard.statusPass') },
    { category: t('aiEthics.dashboard.categoryTransparency'), metric: t('aiEthics.dashboard.modelCardsPublished'), value: '87%', threshold: '>80%', status: t('aiEthics.dashboard.statusPass') },
    { category: t('aiEthics.dashboard.categoryTransparency'), metric: t('aiEthics.dashboard.dataSheetsPublished'), value: '92%', threshold: '>80%', status: t('aiEthics.dashboard.statusPass') },
    { category: t('aiEthics.dashboard.categoryTransparency'), metric: t('aiEthics.dashboard.explainabilityReports'), value: '74%', threshold: '>70%', status: t('aiEthics.dashboard.statusPass') },
    { category: t('aiEthics.dashboard.categoryOversight'), metric: t('aiEthics.dashboard.hitlCoverage'), value: '100%', threshold: '100%', status: t('aiEthics.dashboard.statusPass') },
    { category: t('aiEthics.dashboard.categoryOversight'), metric: t('aiEthics.dashboard.ethicsReviewsCompleted'), value: '23/23', threshold: '100%', status: t('aiEthics.dashboard.statusPass') },
    { category: t('aiEthics.dashboard.categorySafety'), metric: t('aiEthics.dashboard.criticalBiasIncidents'), value: '0', threshold: '0', status: t('aiEthics.dashboard.statusPass') },
    { category: t('aiEthics.dashboard.categorySafety'), metric: t('aiEthics.dashboard.harmReports'), value: '0', threshold: '0', status: t('aiEthics.dashboard.statusPass') },
    { category: t('aiEthics.dashboard.categoryPrivacy'), metric: t('aiEthics.dashboard.dpaComplianceScore'), value: '99.2%', threshold: '>95%', status: t('aiEthics.dashboard.statusPass') },
    { category: t('aiEthics.dashboard.categoryPrivacy'), metric: t('aiEthics.dashboard.differentialPrivacy'), value: '68%', threshold: '>50%', status: t('aiEthics.dashboard.statusPass') },
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
              <span className="text-[12px] text-white">{t('aiEthics.title')}</span>
            </div>
            <p className="section-label mb-4">{t('aiEthics.title')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('aiEthics.heroTitle')}
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('aiEthics.heroDescription')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ AI PRINCIPLES ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('aiEthics.principles.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('aiEthics.principles.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('aiEthics.principles.description')}
            </p>
          </FadeIn>
          <div className="space-y-6">
            {aiPrinciples.map((principle, i) => (
              <FadeIn key={principle.title} delay={i * 0.06}>
                <div className="card p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex items-start gap-4 flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                        <principle.icon size={22} className="text-white" strokeWidth={1.5} />
                      </div>
                      <div className="lg:w-56">
                        <h3 className="text-[17px] font-bold text-white">{principle.title}</h3>
                        <p className="text-[11px] text-[#666666] mt-1">{t('aiEthics.principles.principleOf', { current: i + 1, total: 5 })}</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] text-[#999999] leading-[1.7] mb-4">{principle.desc}</p>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                        <CheckCircle2 size={14} className="text-white/40 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <p className="text-[12px] text-[#999999]">{principle.commitment}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAIRNESS & BIAS TESTING ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('aiEthics.fairness.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('aiEthics.fairness.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('aiEthics.fairness.description')}
            </p>
          </FadeIn>
          <div className="space-y-4">
            {biasTestingMethods.map((method, i) => (
              <FadeIn key={method.method} delay={i * 0.05}>
                <div className="card p-6 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-[15px] font-bold text-white">{method.method}</h3>
                      <span className="status-badge status-badge-active">
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />{method.status}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#999999] leading-relaxed">{method.desc}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-1">{t('aiEthics.fairness.frequencyLabel')}</p>
                    <p className="text-[13px] font-semibold text-white">{method.frequency}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MODEL TRANSPARENCY ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('aiEthics.transparency.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('aiEthics.transparency.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('aiEthics.transparency.description')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transparencyItems.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.06}>
                <div className="card p-8 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                      <FileText size={18} className="text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[15px] font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-[13px] text-[#999999] leading-relaxed mb-4">{item.desc}</p>
                  <div className="flex items-center gap-2 pt-3 border-t border-[rgba(255,255,255,0.04)]">
                    <CheckCircle2 size={12} className="text-white/30" strokeWidth={1.5} />
                    <span className="text-[12px] text-[#666666]">{item.status}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HUMAN OVERSIGHT ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('aiEthics.oversight.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('aiEthics.oversight.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('aiEthics.oversight.description')}
            </p>
          </FadeIn>
          <div className="space-y-6">
            {oversightFramework.map((level, i) => (
              <FadeIn key={level.level} delay={i * 0.08}>
                <div className="card p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center border border-[rgba(255,255,255,0.06)]">
                        <span className="text-[11px] font-bold text-white/30 font-[family-name:var(--font-space-mono)]">L{i + 1}</span>
                      </div>
                      <div className="lg:w-52">
                        <h3 className="text-[17px] font-bold text-white">{level.title}</h3>
                        <p className="text-[11px] text-[#666666] mt-1">{level.level} {t('aiEthics.oversight.oversightLabel')}</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] text-[#999999] leading-[1.7] mb-4">{level.desc}</p>
                      <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-2">{t('aiEthics.oversight.exampleApplications')}</p>
                        <p className="text-[12px] text-[#999999]">{level.examples}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AI ETHICS REVIEW BOARD ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('aiEthics.reviewBoard.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('aiEthics.reviewBoard.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('aiEthics.reviewBoard.description')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviewBoardMembers.map((member, i) => (
              <FadeIn key={member.role} delay={i * 0.06}>
                <div className="card p-6 h-full">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
                    <UserCheck size={20} className="text-white" strokeWidth={1.5} />
                  </div>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-1">{member.name}</p>
                  <h3 className="text-[15px] font-bold text-white mb-2">{member.role}</h3>
                  <p className="text-[13px] text-[#999999] leading-relaxed">{member.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div className="mt-8 card p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[15px] font-bold text-white mb-1">{t('aiEthics.reviewBoard.authority.title')}</h3>
                  <p className="text-[13px] text-[#999999]">{t('aiEthics.reviewBoard.authority.description')}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-[20px] font-bold text-white stat-mono">{t('aiEthics.reviewBoard.authority.reviewsValue')}</p>
                    <p className="text-[10px] text-[#666666] tracking-wide">{t('aiEthics.reviewBoard.authority.reviews')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[20px] font-bold text-white stat-mono">{t('aiEthics.reviewBoard.authority.haltedValue')}</p>
                    <p className="text-[10px] text-[#666666] tracking-wide">{t('aiEthics.reviewBoard.authority.halted')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[20px] font-bold text-white stat-mono">{t('aiEthics.reviewBoard.authority.modifiedValue')}</p>
                    <p className="text-[10px] text-[#666666] tracking-wide">{t('aiEthics.reviewBoard.authority.modified')}</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ PUBLIC AI ETHICS DASHBOARD ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('aiEthics.dashboard.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('aiEthics.dashboard.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('aiEthics.dashboard.description')}
            </p>
          </FadeIn>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: t('aiEthics.dashboard.categoryFairness'), score: '0.94', icon: Scale },
              { label: t('aiEthics.dashboard.categoryTransparency'), score: '87%', icon: Eye },
              { label: t('aiEthics.dashboard.categoryOversight'), score: '100%', icon: Users },
              { label: t('aiEthics.dashboard.categorySafety'), score: t('aiEthics.dashboard.zeroIncidents'), icon: Shield },
              { label: t('aiEthics.dashboard.categoryPrivacy'), score: '99.2%', icon: Lock },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.05}>
                <div className="card p-4 text-center">
                  <item.icon size={16} className="text-white/30 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-[18px] font-bold text-white mb-0.5 stat-mono">{item.score}</p>
                  <p className="text-[10px] text-[#666666] tracking-wide">{item.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Detailed Metrics Table */}
          <FadeIn delay={0.15}>
            <div className="bg-[#121212] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.04)]">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#666666]">{t('aiEthics.dashboard.detailedMetrics')}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('aiEthics.dashboard.tableCategory')}</th>
                      <th>{t('aiEthics.dashboard.tableMetric')}</th>
                      <th>{t('aiEthics.dashboard.tableValue')}</th>
                      <th>{t('aiEthics.dashboard.tableThreshold')}</th>
                      <th>{t('aiEthics.dashboard.tableStatus')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardMetrics.map((metric) => (
                      <tr key={metric.metric}>
                        <td className="text-[12px] text-[#666666]">{metric.category}</td>
                        <td>{metric.metric}</td>
                        <td className="stat-mono font-semibold">{metric.value}</td>
                        <td className="text-[12px] text-[#666666]">{metric.threshold}</td>
                        <td>
                          <span className="status-badge status-badge-active">
                            <CheckCircle2 size={10} />{metric.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="mt-6 text-center">
              <p className="text-[12px] text-[#666666]">{t('aiEthics.dashboard.lastUpdated')}</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">{t('aiEthics.cta.title')}</h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              {t('aiEthics.cta.description')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={`mailto:${t('contactEmail')}`} className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                <Mail size={14} /> {t('contactEmail')}
              </a>
              <Link href="/trust" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('aiEthics.cta.backToTrust')} <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
