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

import { FadeIn } from '@/components/ui/motion';

const aiPrinciples = [
  {
    icon: Scale,
    title: 'Fairness & Non-Discrimination',
    desc: 'We design AI systems that treat all individuals equitably, regardless of race, gender, ethnicity, language, or socioeconomic status. Our models are continuously tested for bias across protected attributes, with corrective action taken when disparities exceed defined thresholds.',
    commitment: 'All production models undergo fairness audits before deployment and quarterly thereafter.',
  },
  {
    icon: Eye,
    title: 'Transparency & Explainability',
    desc: 'We believe users and stakeholders deserve to understand how AI systems make decisions. We provide model cards, explainability reports, and decision audit trails for every AI system in production.',
    commitment: '87% of production models have published explainability reports. Target: 100% by Q2 2026.',
  },
  {
    icon: Shield,
    title: 'Privacy & Data Protection',
    desc: 'AI systems must respect individual privacy and comply with data protection regulations. We apply privacy-by-design principles, minimize data collection, and implement differential privacy techniques where appropriate.',
    commitment: 'All AI training data is audited for compliance with Moroccan DPA and GDPR requirements.',
  },
  {
    icon: Users,
    title: 'Human Oversight & Accountability',
    desc: 'Every AI system has defined human accountability. Critical decisions are never fully automated — humans remain in the loop for high-stakes outcomes, with clear escalation paths and override capabilities.',
    commitment: 'All high-impact AI systems have designated human oversight officers with veto authority.',
  },
  {
    icon: Heart,
    title: 'Social Benefit & Safety',
    desc: 'We build AI to serve humanity — never to harm, manipulate, or exploit. Every AI project at Harch Corp undergoes an ethical impact assessment, and we reserve the right to decline projects that conflict with our values.',
    commitment: 'Ethical impact assessments mandatory for all AI projects. Zero tolerance for harmful AI applications.',
  },
];

const biasTestingMethods = [
  {
    method: 'Pre-Deployment Fairness Audit',
    desc: 'Every AI model undergoes a comprehensive fairness audit before production deployment. We test across 12+ protected attributes using demographic parity, equalized odds, and calibration metrics.',
    frequency: 'Before every deployment',
    status: 'Active',
  },
  {
    method: 'Adversarial Bias Testing',
    desc: 'Red-team style testing where adversarial inputs are designed to surface hidden biases. Includes stress testing with underrepresented demographic groups and edge cases.',
    frequency: 'Quarterly',
    status: 'Active',
  },
  {
    method: 'Continuous Monitoring',
    desc: 'Real-time monitoring of model predictions for statistical drift and bias emergence. Automated alerts trigger when disparity metrics exceed defined thresholds.',
    frequency: 'Continuous',
    status: 'Active',
  },
  {
    method: 'Third-Party Bias Audit',
    desc: 'Annual independent bias audit by external AI ethics organizations. Findings are published in our transparency report with remediation plans.',
    frequency: 'Annual',
    status: 'Active',
  },
  {
    method: 'Community Feedback Integration',
    desc: 'Structured channels for affected communities to report perceived bias or harm. Feedback is triaged by the AI Ethics Review Board within 48 hours.',
    frequency: 'Ongoing',
    status: 'Active',
  },
];

const transparencyItems = [
  {
    title: 'Model Cards',
    desc: 'Every production AI model has a published model card documenting its intended use, training data composition, performance metrics, known limitations, and fairness evaluations.',
    status: 'Published for 87% of models',
  },
  {
    title: 'Decision Audit Trails',
    desc: 'Every automated decision is logged with the input features, model version, confidence score, and decision rationale. Audit trails retained for 7 years.',
    status: '100% implementation',
  },
  {
    title: 'Data Sheets',
    desc: 'Training datasets are documented with datasheets describing collection methodology, demographic representation, consent mechanisms, and known biases.',
    status: 'Published for 92% of datasets',
  },
  {
    title: 'Explainability Reports',
    desc: 'For high-stakes AI applications, we provide feature importance analysis, counterfactual explanations, and SHAP values to enable human understanding of model decisions.',
    status: 'Published for critical models',
  },
];

const oversightFramework = [
  {
    level: 'Level 1',
    title: 'Human-in-the-Loop',
    desc: 'AI provides recommendations; humans make all final decisions. Required for high-stakes domains: healthcare, legal, financial inclusion, and hiring.',
    examples: 'Credit decisioning, medical diagnosis support, recruitment screening',
    color: 'bg-white/8',
  },
  {
    level: 'Level 2',
    title: 'Human-on-the-Loop',
    desc: 'AI makes decisions with human monitoring and intervention capability. Humans can override any automated decision. Alerts triggered for anomalous patterns.',
    examples: 'Energy grid optimization, predictive maintenance, demand forecasting',
    color: 'bg-white/5',
  },
  {
    level: 'Level 3',
    title: 'Human-over-the-Loop',
    desc: 'AI operates autonomously within defined boundaries. Humans set policies, review aggregate outcomes, and intervene when systemic issues are detected.',
    examples: 'Network traffic routing, resource scheduling, environmental monitoring',
    color: 'bg-white/3',
  },
];

const reviewBoardMembers = [
  { role: 'Chief Ethics Officer', name: 'Chair', desc: 'Overall accountability for AI ethics program governance and policy enforcement.' },
  { role: 'Head of AI Research', name: 'Vice Chair', desc: 'Ensures ethical principles are integrated into research methodology and model development.' },
  { role: 'Legal & Compliance Lead', name: 'Member', desc: 'Ensures AI systems comply with Moroccan DPA, GDPR, and emerging AI regulations.' },
  { role: 'External Ethics Advisor', name: 'Member', desc: 'Independent academic providing external perspective on ethical considerations and best practices.' },
  { role: 'Community Representative', name: 'Member', desc: 'Represents the interests of communities affected by Harch Corp AI deployments.' },
  { role: 'Data Privacy Officer', name: 'Member', desc: 'Guards data protection rights and privacy-by-design implementation in AI systems.' },
];

const dashboardMetrics = [
  { category: 'Fairness', metric: 'Demographic Parity Difference', value: '0.032', threshold: '<0.05', status: 'Pass' },
  { category: 'Fairness', metric: 'Equalized Odds Difference', value: '0.028', threshold: '<0.05', status: 'Pass' },
  { category: 'Fairness', metric: 'Calibration Error', value: '0.015', threshold: '<0.03', status: 'Pass' },
  { category: 'Transparency', metric: 'Model Cards Published', value: '87%', threshold: '>80%', status: 'Pass' },
  { category: 'Transparency', metric: 'Data Sheets Published', value: '92%', threshold: '>80%', status: 'Pass' },
  { category: 'Transparency', metric: 'Explainability Reports', value: '74%', threshold: '>70%', status: 'Pass' },
  { category: 'Oversight', metric: 'High-Impact HITL Coverage', value: '100%', threshold: '100%', status: 'Pass' },
  { category: 'Oversight', metric: 'Ethics Reviews Completed', value: '23/23', threshold: '100%', status: 'Pass' },
  { category: 'Safety', metric: 'Critical Bias Incidents', value: '0', threshold: '0', status: 'Pass' },
  { category: 'Safety', metric: 'Harm Reports Received', value: '0', threshold: '0', status: 'Pass' },
  { category: 'Privacy', metric: 'DPA Compliance Score', value: '99.2%', threshold: '>95%', status: 'Pass' },
  { category: 'Privacy', metric: 'Differential Privacy Applied', value: '68%', threshold: '>50%', status: 'Pass' },
];

export default function AIEthicsPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-center gap-2 mb-4">
              <Link href="/trust" className="text-[12px] text-[#666666] hover:text-white transition-colors">Trust Center</Link>
              <ChevronRight size={12} className="text-[#444444]" />
              <span className="text-[12px] text-white">AI Ethics</span>
            </div>
            <p className="section-label mb-4">AI Ethics</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Responsible AI<br />for Africa
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              As Africa builds its sovereign AI capabilities, Harch Corp commits to the highest standards of fairness, transparency, and human oversight. Our AI Ethics framework ensures that every model we deploy serves humanity — never the other way around.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ AI PRINCIPLES ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Principles</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Five Core Principles
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              These principles are non-negotiable. They guide every AI project from research through deployment and monitoring.
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
                        <p className="text-[11px] text-[#666666] mt-1">Principle {i + 1} of 5</p>
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
            <p className="section-label mb-4">Fairness</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Fairness & Bias Testing
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              We deploy a multi-layered approach to bias detection and mitigation. Our testing methodology covers pre-deployment audits, continuous monitoring, and external validation.
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
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-1">Frequency</p>
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
            <p className="section-label mb-4">Transparency</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Model Transparency & Explainability
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Every AI model in production at Harch Corp is documented, auditable, and explainable. We publish model cards, data sheets, and explainability reports to enable informed oversight.
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
            <p className="section-label mb-4">Oversight</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Human Oversight Framework
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Not all AI decisions carry the same risk. Our three-tier oversight framework ensures the right level of human involvement based on the stakes and potential impact of each AI system.
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
                        <p className="text-[11px] text-[#666666] mt-1">{level.level} Oversight</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] text-[#999999] leading-[1.7] mb-4">{level.desc}</p>
                      <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
                        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-2">Example Applications</p>
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
            <p className="section-label mb-4">Governance</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              AI Ethics Review Board
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              The AI Ethics Review Board is an independent governance body with the authority to halt, modify, or reject AI projects that do not meet our ethical standards. The board meets monthly and can convene emergency sessions for urgent matters.
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
                  <h3 className="text-[15px] font-bold text-white mb-1">Board Authority</h3>
                  <p className="text-[13px] text-[#999999]">The Review Board has the authority to halt any AI project, mandate changes, and refer ethical violations to the executive team.</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-[20px] font-bold text-white stat-mono">23</p>
                    <p className="text-[10px] text-[#666666] tracking-wide">Reviews (2025)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[20px] font-bold text-white stat-mono">2</p>
                    <p className="text-[10px] text-[#666666] tracking-wide">Projects Halted</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[20px] font-bold text-white stat-mono">5</p>
                    <p className="text-[10px] text-[#666666] tracking-wide">Modified</p>
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
            <p className="section-label mb-4">Dashboard</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Public AI Ethics Dashboard
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Transparency requires measurement. Our public dashboard tracks key AI ethics metrics across fairness, transparency, oversight, safety, and privacy — updated quarterly.
            </p>
          </FadeIn>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Fairness', score: '0.94', icon: Scale },
              { label: 'Transparency', score: '87%', icon: Eye },
              { label: 'Oversight', score: '100%', icon: Users },
              { label: 'Safety', score: '0 Incidents', icon: Shield },
              { label: 'Privacy', score: '99.2%', icon: Lock },
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
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#666666]">Detailed Metrics — Q4 2025</p>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Metric</th>
                      <th>Value</th>
                      <th>Threshold</th>
                      <th>Status</th>
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
              <p className="text-[12px] text-[#666666]">Last updated: January 2026. Next update: April 2026.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">AI Ethics Matters</h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              We welcome feedback, concerns, and collaboration on AI ethics from researchers, communities, and partners. Responsible AI is a shared endeavor.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="mailto:ethics@harchcorp.com" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                <Mail size={14} /> Contact Ethics Team
              </a>
              <Link href="/trust" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Back to Trust Center <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
