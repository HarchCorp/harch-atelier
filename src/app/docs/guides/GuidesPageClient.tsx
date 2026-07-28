'use client';

import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  Rocket, Database, Brain, Zap, ChevronRight, ArrowRight,
  Activity, Shield, Satellite, Radio, Cloud, BarChart3,
  Lock, Eye, Server, Cpu, Globe, Monitor, AlertTriangle,
  CheckCircle2, Clock, FileText, Settings, Users, Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── DATA ─── */
const guideCategories = [
  {
    title: 'Getting Started',
    description: 'Fundamental guides for new HarchOS users. Go from zero to production.',
    icon: Rocket,
    accent: '#8B9DAF',
    guides: [
      {
        title: 'Deploy Your First Model',
        desc: 'Learn how to package, deploy, and serve an AI model on the HarchOS mesh using carbon-aware scheduling. Walk through model registration, hub selection, and inference endpoint creation.',
        time: '15 min',
        difficulty: 'Beginner',
        tags: ['Compute', 'Inference'],
      },
      {
        title: 'Set Up a Data Pipeline',
        desc: 'Create your first SENSE data pipeline to ingest, transform, and store streaming data. Covers IoT sensor data, API webhooks, and batch file ingestion patterns.',
        time: '20 min',
        difficulty: 'Beginner',
        tags: ['Data', 'SENSE'],
      },
      {
        title: 'Configure Monitoring',
        desc: 'Set up Prometheus metrics, Grafana dashboards, and alert rules for your workloads. Learn how to monitor GPU utilization, power consumption, and inference latency.',
        time: '12 min',
        difficulty: 'Beginner',
        tags: ['Observability', 'Monitoring'],
      },
      {
        title: 'Scale Your Deployment',
        desc: 'Understand auto-scaling policies, manual scaling, and carbon-aware scheduling strategies for production workloads. Configure scale-up triggers and scale-down cool-down periods.',
        time: '18 min',
        difficulty: 'Intermediate',
        tags: ['Compute', 'Scaling'],
      },
    ],
  },
  {
    title: 'Data & Integration',
    description: 'Connect external data sources and build robust ingestion pipelines.',
    icon: Database,
    accent: '#8B5CF6',
    guides: [
      {
        title: 'Ingest IoT Data Streams',
        desc: 'Configure SENSE to ingest real-time IoT sensor data from industrial equipment. Supports MQTT, AMQP, and HTTP protocols with schema validation and data enrichment.',
        time: '25 min',
        difficulty: 'Intermediate',
        tags: ['IoT', 'SENSE', 'Streaming'],
      },
      {
        title: 'Connect Satellite Feeds',
        desc: 'Integrate satellite imagery and geospatial data feeds into HarchOS. Configure NDVI computation, change detection, and automated alert triggers for agricultural and mining use cases.',
        time: '30 min',
        difficulty: 'Intermediate',
        tags: ['Satellite', 'Geospatial'],
      },
      {
        title: 'Set Up API Integrations',
        desc: 'Connect third-party APIs to the SENSE layer. Configure webhook receivers, polling schedules, rate limit handling, and data transformation pipelines.',
        time: '20 min',
        difficulty: 'Beginner',
        tags: ['API', 'Integration'],
      },
      {
        title: 'Configure a Data Lake',
        desc: 'Provision and configure a HarchOS data lake for petabyte-scale storage. Set up partitioning strategies, lifecycle policies, cross-hub replication, and point-in-time snapshots.',
        time: '35 min',
        difficulty: 'Advanced',
        tags: ['Storage', 'Data Lake'],
      },
    ],
  },
  {
    title: 'AI & ML',
    description: 'Train, deploy, and optimize AI models on the sovereign compute mesh.',
    icon: Brain,
    accent: '#10B981',
    guides: [
      {
        title: 'Train Custom Models',
        desc: 'Launch distributed training jobs across multiple HarchOS hubs. Configure data parallelism, model parallelism, gradient accumulation, and checkpoint strategies for large-scale training.',
        time: '40 min',
        difficulty: 'Advanced',
        tags: ['Training', 'Distributed'],
      },
      {
        title: 'Deploy Inference Endpoints',
        desc: 'Create production-grade inference endpoints with auto-scaling, A/B traffic splitting, and canary deployments. Configure model versioning and rollback strategies.',
        time: '25 min',
        difficulty: 'Intermediate',
        tags: ['Inference', 'Production'],
      },
      {
        title: 'Set Up Auto-Scaling',
        desc: 'Configure intelligent auto-scaling based on inference latency, queue depth, and carbon intensity signals. Learn how THINK predicts demand and ACT provisions resources in advance.',
        time: '20 min',
        difficulty: 'Intermediate',
        tags: ['Scaling', 'THINK', 'ACT'],
      },
      {
        title: 'Implement A/B Testing',
        desc: 'Deploy multiple model versions and route traffic for A/B experiments. Configure statistical significance tests, automated winner selection, and gradual traffic migration.',
        time: '22 min',
        difficulty: 'Intermediate',
        tags: ['A/B Testing', 'Inference'],
      },
    ],
  },
  {
    title: 'Operations',
    description: 'Operational guides for production reliability, security, and compliance.',
    icon: Zap,
    accent: '#F59E0B',
    guides: [
      {
        title: 'Configure Alerts',
        desc: 'Set up multi-channel alerting with PagerDuty, Slack, and email integrations. Configure alert rules for hub health, GPU thermal thresholds, energy anomalies, and workload failures.',
        time: '15 min',
        difficulty: 'Beginner',
        tags: ['Alerting', 'Monitoring'],
      },
      {
        title: 'Set Up Disaster Recovery',
        desc: 'Implement cross-hub disaster recovery with automated failover. Configure RPO/RTO targets, geo-redundant backups, and runbook automation for critical workload continuity.',
        time: '45 min',
        difficulty: 'Advanced',
        tags: ['DR', 'Failover', 'Reliability'],
      },
      {
        title: 'Manage Access Control',
        desc: 'Implement zero-trust access control with RBAC policies, service accounts, and mTLS. Configure fine-grained permissions for teams, projects, and sovereignty zones.',
        time: '30 min',
        difficulty: 'Intermediate',
        tags: ['Security', 'RBAC', 'Zero Trust'],
      },
      {
        title: 'Audit Your Infrastructure',
        desc: 'Configure immutable audit logging, SIEM integration, and compliance reporting. Set up continuous compliance checks for GDPR, ISO 27001, and Law 09-08 requirements.',
        time: '25 min',
        difficulty: 'Intermediate',
        tags: ['Compliance', 'Audit', 'Security'],
      },
    ],
  },
];

const difficultyColors: Record<string, string> = {
  Beginner: '#10B981',
  Intermediate: '#F59E0B',
  Advanced: '#EF4444',
};

/* ─── MAIN COMPONENT ─── */
export default function GuidesPageClient() {
  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#000000] overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#000000]/95 to-[#0D0D0D]" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6 text-[#8B9DAF]">How-to Guides /0.1</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              How-to Guides
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-8">
              Step-by-step guides for every stage of building on HarchOS. From your first deployment to enterprise-grade operations.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap gap-3">
              <Link href="/docs/quickstarts" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Start with Quickstarts <ArrowRight size={14} />
              </Link>
              <Link href="/docs/api" className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                API Reference
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          GUIDE CATEGORIES
          ═══════════════════════════════════════════ */}
      {guideCategories.map((category, ci) => (
        <section key={category.title} className={`py-20 md:py-28 ${ci % 2 === 0 ? 'bg-[#0D0D0D]' : 'bg-[#121212]'}`}>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${category.accent}12` }}>
                  <category.icon size={16} style={{ color: category.accent }} />
                </div>
                <p className="section-label" style={{ color: category.accent }}>{category.title}</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
                {category.title}
              </h2>
              <div className="accent-line mb-4" />
              <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-12">
                {category.description}
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.guides.map((guide, gi) => (
                <FadeIn key={guide.title} delay={gi * 0.08}>
                  <div className="card p-6 h-full group hover:border-white/15 cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${difficultyColors[guide.difficulty]}12`, color: difficultyColors[guide.difficulty] }}>
                          {guide.difficulty}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-[#666666]">
                          <Clock size={10} /> {guide.time}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#8B9DAF] transition-colors">{guide.title}</h3>
                    <p className="text-[13px] text-[#999999] leading-[1.6] mb-4">{guide.desc}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {guide.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[rgba(255,255,255,0.04)] text-[#666666]">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <ArrowRight size={14} className="text-[#333333] group-hover:text-[#8B9DAF] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      ))}

    </div>
  );
}
