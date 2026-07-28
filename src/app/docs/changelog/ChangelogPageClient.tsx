'use client';

import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  ArrowRight, ChevronRight, Sparkles, Wrench, Bug, AlertTriangle,
  Clock, Tag, Calendar, Rocket, CheckCircle2, Package
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── DATA ─── */
const versions = [
  {
    version: 'v0.2.0',
    date: 'Q3 2026',
    status: 'upcoming',
    statusLabel: 'Upcoming',
    description: 'Major feature release introducing ACT layer live migration, Kubernetes operator, and expanded multi-hub orchestration capabilities.',
    sections: {
      newFeatures: [
        'ACT layer: Live container migration between hubs with <200ms switchover',
        'Kubernetes operator for native workload management and CRD support',
        'Terraform provider v1.0 for full infrastructure-as-code coverage',
        'Carbon-aware scheduling v2 with spot instance support',
        'VS Code extension with inline documentation and deploy commands',
        'Multi-hub dashboard with real-time mesh topology visualization',
        'Webhook API for event-driven integrations with third-party systems',
        'Model registry with versioning, lineage tracking, and approval workflows',
      ],
      improvements: [
        'SENSE: 2x throughput improvement for IoT data ingestion pipelines',
        'THINK: Reduced decision latency from 50ms to 30ms P99',
        'REST API: New filtering, pagination, and field selection parameters',
        'SDK: Added streaming inference support across all language SDKs',
        'CLI: Interactive mode with autocomplete and context-aware help',
      ],
      bugFixes: [
        'Fixed race condition in concurrent workload scaling operations',
        'Resolved memory leak in WebSocket connection pool manager',
        'Corrected timezone handling for carbon intensity data across hubs',
      ],
      breakingChanges: [
        'REST API v1/compute/workloads response format updated (see migration guide)',
        'Python SDK: Client constructor signature changed (positional → keyword args)',
        'CLI: Deprecated "harchos run" in favor of "harchos workloads deploy"',
      ],
      deprecations: [
        'REST API v1beta1 endpoints will be removed in v0.3.0',
        'Python SDK: harchos.Client.sync() method deprecated, use harchos.Client() directly',
        'CLI: "harchos jobs" command group renamed to "harchos workloads"',
      ],
    },
  },
  {
    version: 'v0.1.1',
    date: 'March 2026',
    status: 'current',
    statusLabel: 'Current',
    description: 'Bug fix and improvement release addressing stability, performance, and usability issues identified since the initial launch.',
    sections: {
      newFeatures: [
        'Added Grafana dashboard templates for common monitoring patterns',
        'New API endpoint: POST /v1/operations/schedule for carbon-aware policies',
        'CLI: Added "harchos energy report" command for carbon metrics',
        'SDK: Added retry with exponential backoff for all API operations',
      ],
      improvements: [
        'SENSE: Improved schema validation error messages with field-level detail',
        'THINK: Optimized model inference for transformer architectures (12% faster)',
        'REST API: Added X-Request-Id header for distributed tracing correlation',
        'Documentation: Expanded API reference with code examples in all SDK languages',
        'SDK: Reduced cold start time for TypeScript SDK by 40%',
        'CLI: Improved error messages with actionable suggestions',
      ],
      bugFixes: [
        'Fixed incorrect GPU memory reporting for MI300X workloads',
        'Resolved authentication token refresh issue causing 401 errors after 1 hour',
        'Fixed data pipeline checkpoint corruption on interrupted ingestion runs',
        'Corrected PUE calculation for Hub Gamma (Ouarzazate) solar-boosted periods',
        'Resolved CLI config file parsing error on Windows with non-ASCII paths',
        'Fixed WebSocket reconnection logic not respecting backoff intervals',
      ],
      breakingChanges: [],
      deprecations: [
        'CLI flag --gpu-type renamed to --gpu (alias maintained until v0.2.0)',
      ],
    },
  },
  {
    version: 'v0.1.0',
    date: 'February 2026',
    status: 'released',
    statusLabel: 'Initial Release',
    description: 'The inaugural public release of HarchOS. Includes the complete SENSE and THINK layers, REST API, Python and TypeScript SDKs, and CLI tool. ACT layer is available in preview mode.',
    sections: {
      newFeatures: [
        'HarchOS kernel v0.1 with SENSE-THINK-ACT architecture foundation',
        'SENSE layer: IoT data ingestion via MQTT, AMQP, and HTTP protocols',
        'SENSE layer: Satellite imagery processing with NDVI computation',
        'SENSE layer: API feed integration with schema validation',
        'THINK layer: Reinforcement learning workload orchestrator',
        'THINK layer: Carbon-aware scheduling with 4-hour prediction horizon',
        'THINK layer: Multi-objective optimization (cost, latency, sovereignty)',
        'ACT layer (preview): Automated workload placement and scaling',
        'REST API v1: Compute, Data, Models, Operations, and Monitoring resources',
        'gRPC API: ComputeService, DataService, ModelService, MeshService, IdentityService',
        'WebSocket API: Real-time event streaming for workloads, metrics, and audit',
        'Python SDK v0.1.0 with async support and type hints',
        'TypeScript SDK v0.1.0 with full type safety and tree-shakeable ESM',
        'Go SDK v0.1.0 with context support and gRPC streaming',
        'HarchOS CLI v0.1.0 for deployment and management operations',
        'Authentication: API keys, OAuth 2.0 (Authorization Code, Client Credentials)',
        'Security: Zero-trust architecture, mTLS, sovereign encryption',
        'Compliance: GDPR, ISO 27001, SOC 2 Type II, Law 09-08 compliance automation',
        'Monitoring: Integrated Prometheus metrics, Grafana dashboards, Jaeger tracing',
        'Five compute hubs: Dakhla, Tanger, Ouarzazate, Casablanca, Benguerir',
      ],
      improvements: [],
      bugFixes: [],
      breakingChanges: [],
      deprecations: [],
    },
  },
];

const sectionConfig: Record<string, { icon: typeof Sparkles; label: string; color: string }> = {
  newFeatures: { icon: Sparkles, label: 'New Features', color: '#8B9DAF' },
  improvements: { icon: Wrench, label: 'Improvements', color: '#8B5CF6' },
  bugFixes: { icon: Bug, label: 'Bug Fixes', color: '#F59E0B' },
  breakingChanges: { icon: AlertTriangle, label: 'Breaking Changes', color: '#EF4444' },
  deprecations: { icon: Clock, label: 'Deprecations', color: '#666666' },
};

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  upcoming: { bg: 'rgba(245,158,11,0.08)', text: '#F59E0B', border: 'rgba(245,158,11,0.2)' },
  current: { bg: 'rgba(139,157,175,0.08)', text: '#8B9DAF', border: 'rgba(139,157,175,0.2)' },
  released: { bg: 'rgba(255,255,255,0.04)', text: '#999999', border: 'rgba(255,255,255,0.06)' },
};

/* ─── MAIN COMPONENT ─── */
export default function ChangelogPageClient() {
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
            <p className="section-label mb-6 text-[#8B9DAF]">Changelog /0.1</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              Release Notes
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-8">
              Track every HarchOS release. New features, improvements, bug fixes, breaking changes, and deprecations — documented in detail.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex items-center gap-4 text-[13px]">
              <span className="text-[#666666]">Latest version:</span>
              <span className="font-[family-name:var(--font-space-mono)] text-[#8B9DAF] font-semibold">v0.1.1</span>
              <span className="text-[#333333]">|</span>
              <Link href="/docs" className="text-[#999999] hover:text-white transition-colors nav-link">Back to docs</Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          VERSION TIMELINE
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] lg:left-[23px] top-0 bottom-0 w-px bg-white/[0.06]" />

            <div className="space-y-16">
              {versions.map((version, vi) => (
                <FadeIn key={version.version} delay={vi * 0.1}>
                  <div className="relative pl-14 lg:pl-16">
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1 w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 flex items-center justify-center z-10" style={{ borderColor: statusStyles[version.status].border, backgroundColor: statusStyles[version.status].bg }}>
                      <span style={{ color: statusStyles[version.status].text }}><Package size={16} /></span>
                    </div>

                    {/* Version Card */}
                    <div className="card overflow-hidden">
                      {/* Version Header */}
                      <div className="px-6 py-5 border-b border-white/[0.06]">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                          <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-space-mono)]">{version.version}</h2>
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider w-fit" style={{ backgroundColor: statusStyles[version.status].bg, color: statusStyles[version.status].text, border: `1px solid ${statusStyles[version.status].border}` }}>
                            {version.statusLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[12px] text-[#666666]">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} /> {version.date}
                          </span>
                        </div>
                        <p className="text-[14px] text-[#999999] leading-[1.6] mt-3">{version.description}</p>
                      </div>

                      {/* Version Sections */}
                      <div className="divide-y divide-white/[0.03]">
                        {(Object.entries(version.sections) as [keyof typeof sectionConfig, string[]][]).map(([sectionKey, items]) => {
                          if (!items || items.length === 0) return null;
                          const config = sectionConfig[sectionKey];
                          if (!config) return null;
                          const Icon = config.icon;

                          return (
                            <div key={sectionKey} className="px-6 py-5">
                              <div className="flex items-center gap-2.5 mb-3">
                                <Icon size={14} style={{ color: config.color }} />
                                <h3 className="text-[13px] font-bold uppercase tracking-[0.08em]" style={{ color: config.color }}>{config.label}</h3>
                                <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">({items.length})</span>
                              </div>
                              <div className="space-y-2">
                                {items.map((item, i) => (
                                  <div key={i} className="flex items-start gap-2.5">
                                    <span className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ backgroundColor: config.color }} />
                                    <span className="text-[13px] text-[#CCCCCC] leading-[1.6]">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
