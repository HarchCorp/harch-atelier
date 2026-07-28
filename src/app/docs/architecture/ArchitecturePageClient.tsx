'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  Eye, Brain, Zap, ArrowRight, Shield, Activity, Cpu, Globe,
  Server, Lock, Cloud, Network, Layers, Radio, Database,
  CheckCircle2, Leaf, Gauge, Monitor, Boxes, Key,
  FileText, ChevronRight, AlertTriangle, BoxesIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── DATA ─── */
const architectureLayers = [
  {
    id: 'sense',
    name: 'SENSE',
    tag: 'Data Ingestion Layer',
    icon: Eye,
    color: '#8B9DAF',
    description: 'The perception layer of HarchOS. SENSE captures every signal from the physical and digital world — IoT sensors, satellite imagery, API feeds, and industrial control data. It processes over 50,000 data points per second with 1-second granularity and 4-hour forecast windows.',
    capabilities: [
      'IoT sensor data ingestion via MQTT, AMQP, and HTTP',
      'Satellite imagery processing with NDVI and change detection',
      'Real-time API feed integration with schema validation',
      'Industrial control system monitoring (SCADA/PLC)',
      'Data enrichment, transformation, and routing',
      '4-hour predictive forecasting for energy and demand',
    ],
    specs: [
      { label: 'Throughput', value: '50K+ pts/sec' },
      { label: 'Sensor Types', value: 'IoT, Satellite, API' },
      { label: 'Forecast Window', value: '4 hours' },
      { label: 'Granularity', value: '1-second' },
    ],
  },
  {
    id: 'think',
    name: 'THINK',
    tag: 'AI/ML Processing Layer',
    icon: Brain,
    color: '#8B5CF6',
    description: 'The intelligence layer of HarchOS. THINK runs proprietary ML models for multi-objective optimization, predictive workload placement, and real-time decision-making. It predicts demand 4 hours in advance and optimizes GPU allocation, energy consumption, and data sovereignty simultaneously.',
    capabilities: [
      'Reinforcement learning for workload orchestration',
      'Transformer models for demand prediction',
      'Graph neural networks for mesh topology optimization',
      'Multi-objective optimization (cost, latency, carbon)',
      'Predictive autoscaling with 4-hour horizon',
      'Anomaly detection and root cause analysis',
    ],
    specs: [
      { label: 'Prediction Horizon', value: '4 hours' },
      { label: 'Model Types', value: 'RL, Transformer, GNN' },
      { label: 'Optimization', value: 'Multi-objective' },
      { label: 'Decision Latency', value: '<50ms' },
    ],
  },
  {
    id: 'act',
    name: 'ACT',
    tag: 'Execution Layer',
    icon: Zap,
    color: '#10B981',
    description: 'The execution layer of HarchOS. ACT implements THINK decisions in real-time — live container migration between hubs, GPU context switching, zero-downtime failover, and automated operations. It executes infrastructure changes in under 200ms with 99.999% SLA guarantees.',
    capabilities: [
      'Live container migration between compute hubs',
      'Real-time GPU context switching and allocation',
      'Zero-downtime automatic failover',
      'Carbon-aware workload scheduling and placement',
      'Automated incident response and remediation',
      'SLA enforcement with guaranteed uptime',
    ],
    specs: [
      { label: 'Container Migration', value: 'Live, <200ms' },
      { label: 'Failover', value: 'Zero-downtime' },
      { label: 'GPU Switching', value: 'Real-time context' },
      { label: 'SLA Guarantee', value: '99.999%' },
    ],
  },
];

const referenceArchitectures = [
  {
    title: 'Sovereign AI Cloud',
    desc: 'Complete sovereign AI cloud deployment with all data and compute remaining within Morocco jurisdiction. Full SENSE-THINK-ACT stack deployed across a single hub with dedicated GPU clusters.',
    icon: Shield,
    accent: '#8B9DAF',
    components: ['Dedicated H100 cluster (up to 800 GPUs per hub)', 'SENSE data ingestion pipeline', 'THINK orchestration engine', 'ACT execution controller with carbon-aware scheduling', 'Sovereign encryption (HSM FIPS 140-2 L3)', 'Compliance automation (GDPR, Law 09-08)'],
    useCase: 'Government agencies, defense, critical infrastructure operators requiring absolute data sovereignty.',
  },
  {
    title: 'Edge Computing',
    desc: 'Low-latency edge deployment for real-time inference at the data source. SENSE agents at the edge collect and pre-process data, forwarding to the central THINK layer for decision-making.',
    icon: Radio,
    accent: '#8B5CF6',
    components: ['Edge SENSE agents (lightweight)', 'Local inference endpoints (A100)', 'Intermittent connectivity support', 'Data compression and batching', 'Local ACT executor for critical decisions', 'Sync with central mesh when connected'],
    useCase: 'Mining sites, agricultural fields, remote infrastructure with limited or intermittent connectivity.',
  },
  {
    title: 'Multi-Hub Deployment',
    desc: 'Full mesh deployment across multiple HarchOS hubs for maximum availability, carbon optimization, and geographic redundancy. Workloads migrate between hubs based on THINK optimization.',
    icon: Network,
    accent: '#10B981',
    components: ['3+ HarchOS hubs in active mesh', '400Gbps inter-hub backbone', 'Live workload migration', 'Carbon-aware scheduling across hubs', 'Geo-redundant data storage (3-2-1)', 'Single-pane-of-glass management'],
    useCase: 'Enterprise customers needing high availability, carbon optimization, and sub-5ms latency to multiple regions.',
  },
  {
    title: 'Hybrid Cloud',
    desc: 'Hybrid deployment connecting HarchOS sovereign mesh with public cloud providers for burst capacity or specialized workloads. Data sovereignty is enforced at the orchestration level.',
    icon: Cloud,
    accent: '#F59E0B',
    components: ['HarchOS mesh as primary compute', 'Burst capacity to public cloud', 'Sovereignty engine (data stays in Morocco)', 'Unified monitoring and management', 'Secure VPN/Interconnect', 'Cost optimization engine'],
    useCase: 'Organizations with existing cloud investments requiring sovereign compute with burst capacity to public clouds.',
  },
];

const pillars = [
  {
    name: 'Security',
    icon: Lock,
    accent: '#EF4444',
    description: 'Security is architectural in HarchOS, not additive. Zero-trust authentication, sovereign encryption with locally-managed keys, micro-segmentation, and continuous compliance monitoring are built into every layer.',
    principles: [
      'Zero-trust: authenticate and authorize every request, including inter-service communication',
      'Encryption: end-to-end with RSA-4096 signing and AES-256-GCM data encryption',
      'Sovereignty: data residency enforced at the orchestration layer, not just storage',
      'HSM: FIPS 140-2 Level 3 hardware security modules in every hub',
      'Audit: immutable, append-only audit logs with cryptographic chain verification',
    ],
  },
  {
    name: 'Reliability',
    icon: Shield,
    accent: '#8B9DAF',
    description: 'HarchOS is designed for 99.999% uptime with zero-downtime failover, live migration, and multi-hub redundancy. The ACT layer executes failover in under 200ms.',
    principles: [
      'Multi-hub: workloads replicated across at least 2 hubs with automatic failover',
      'Live migration: containers migrate between hubs without service interruption',
      'Data durability: 11 nines of data durability with geo-redundant replication',
      'Disaster recovery: RPO <1 minute, RTO <5 minutes for critical workloads',
      'Chaos engineering: continuous fault injection to validate resilience',
    ],
  },
  {
    name: 'Performance',
    icon: Gauge,
    accent: '#8B5CF6',
    description: 'HarchOS delivers efficient scaling across 800 GPUs per hub (1,798 total), with sub-5ms latency to Europe and a 400Gbps inter-hub backbone. Carbon-aware scheduling automatically routes workloads to hubs with the lowest carbon intensity (48.2 gCO2/kWh average).',
    principles: [
      'GPU efficiency: efficient scaling across 800 GPU partitions max (1,798 total across 5 hubs)',
      'Network: 400Gbps backbone with 100Gbps dedicated inter-hub links',
      'Inference latency: <50ms P99 for real-time inference endpoints',
      'Decision speed: THINK makes optimization decisions in <50ms',
      'Data pipeline: 50K+ data points per second ingestion throughput',
    ],
  },
  {
    name: 'Cost Optimization',
    icon: Leaf,
    accent: '#10B981',
    description: 'Carbon-aware scheduling reduces energy costs by 35% compared to static scheduling. Workloads automatically follow renewable energy availability across hubs.',
    principles: [
      'Carbon-aware: batch jobs scheduled during peak renewable energy production',
      'Spot instances: up to 70% discount for interruptible batch workloads',
      'Right-sizing: THINK recommends optimal GPU allocation based on utilization patterns',
      'Reserved capacity: committed-use discounts for predictable workloads',
      'Energy arbitrage: move compute to hubs with lowest energy cost in real time',
    ],
  },
  {
    name: 'Operational Excellence',
    icon: Activity,
    accent: '#F59E0B',
    description: 'Automated operations, continuous monitoring, and infrastructure-as-code ensure consistent, repeatable deployments across the mesh.',
    principles: [
      'IaC: Terraform provider for all HarchOS resources with drift detection',
      'GitOps: declarative workload configuration with automated reconciliation',
      'Observability: integrated Prometheus, Grafana, and Jaeger for full-stack visibility',
      'Auto-remediation: ACT resolves common infrastructure issues without human intervention',
      'Runbook automation: encoded operational procedures triggered by alert conditions',
    ],
  },
];

const designPatterns = [
  {
    name: 'Hub-Affinity Routing',
    desc: 'Pin workloads to a specific hub for data sovereignty compliance. THINK respects affinity rules while optimizing within the allowed hub set.',
    category: 'Compute',
  },
  {
    name: 'Carbon-Follow Scheduler',
    desc: 'Schedule batch training jobs to follow peak renewable energy production across time zones. Solar hubs during the day, wind hubs at night.',
    category: 'Scheduling',
  },
  {
    name: 'Pipeline-Fanout',
    desc: 'Ingest data once in SENSE, then fan out to multiple THINK processors and ACT executors in parallel for different use cases.',
    category: 'Data',
  },
  {
    name: 'Canary Deployment',
    desc: 'Deploy new model versions to a small percentage of traffic, monitor for regressions, then gradually increase traffic on confirmation.',
    category: 'Deployment',
  },
  {
    name: 'Circuit Breaker',
    desc: 'Wrap external API calls in a circuit breaker pattern. When a downstream service fails, ACT automatically reroutes to a healthy hub.',
    category: 'Reliability',
  },
  {
    name: 'Event-Sourced Audit',
    desc: 'Store all state changes as immutable events. Enables full audit trail reconstruction, compliance reporting, and time-travel debugging.',
    category: 'Security',
  },
];

const bestPractices = [
  {
    title: 'Start with Sovereignty-First Design',
    desc: 'Define your data residency requirements before choosing architecture. Set sovereignty to "strict" in your client configuration and let HarchOS enforce it at every layer.',
  },
  {
    title: 'Use Carbon-Aware Scheduling for Batch Workloads',
    desc: 'Training and batch processing workloads benefit most from carbon-aware scheduling. Use "carbon-optimal" schedule mode to automatically align compute with renewable energy availability.',
  },
  {
    title: 'Implement Defense in Depth',
    desc: 'Layer your security controls: mTLS between services, RBAC for API access, network micro-segmentation, and HSM-backed encryption. HarchOS provides all of these natively.',
  },
  {
    title: 'Design for Multi-Hub from Day One',
    desc: 'Even if you start with a single hub, architect your workloads for multi-hub deployment. Use hub: "auto" in your deployment config to let THINK choose the optimal placement.',
  },
  {
    title: 'Monitor Carbon Intensity, Not Just Cost',
    desc: 'Track the carbon intensity of your workloads alongside cost. HarchOS exposes energy source and carbon metrics for every inference request and training job.',
  },
  {
    title: 'Automate Everything with Infrastructure-as-Code',
    desc: 'Use the HarchOS Terraform provider for all resource provisioning. Declarative configuration ensures reproducibility, auditability, and eliminates configuration drift.',
  },
];

/* ─── MAIN COMPONENT ─── */
export default function ArchitecturePageClient() {
  const [activeLayer, setActiveLayer] = useState('sense');
  const activeLayerData = architectureLayers.find(l => l.id === activeLayer)!;

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
            <p className="section-label mb-6 text-[#8B9DAF]">Architecture /0.1</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              Architecture Center
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-8">
              Deep dive into the HarchOS architecture. Understand the SENSE-THINK-ACT layers, explore reference architectures, and learn the well-architected framework for sovereign AI infrastructure.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap gap-3">
              <Link href="/docs/quickstarts" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Try the Quickstart <ArrowRight size={14} />
              </Link>
              <Link href="/docs/api" className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                API Reference
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ARCHITECTURE OVERVIEW — SENSE / THINK / ACT
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Architecture Overview</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              SENSE. THINK. ACT.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              HarchOS operates on three interconnected layers: SENSE captures signals from the physical and digital world, THINK makes intelligent decisions using ML models, and ACT executes those decisions in real-time. A complete perception-decision-action cycle in under 200ms.
            </p>
          </FadeIn>

          {/* Layer Visual */}
          <FadeIn>
            <div className="flex flex-col lg:flex-row gap-3 mb-12">
              {architectureLayers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`flex items-center gap-4 px-6 py-5 rounded-xl border transition-all text-left flex-1 ${
                    activeLayer === layer.id
                      ? 'bg-[rgba(255,255,255,0.06)] border-white/15 text-white'
                      : 'border-white/[0.04] text-[#999999] hover:text-white hover:bg-[rgba(255,255,255,0.02)]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${layer.color}12` }}>
                    <layer.icon size={22} style={{ color: layer.color }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: activeLayer === layer.id ? layer.color : 'inherit' }}>{layer.name}</p>
                    <p className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">{layer.tag}</p>
                  </div>
                  {activeLayer !== layer.id && (
                    <ChevronRight size={16} className="text-[#333333] ml-auto shrink-0 hidden lg:block" />
                  )}
                </button>
              ))}
            </div>
          </FadeIn>

          {/* Active Layer Detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLayer}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${activeLayerData.color}15` }}>
                    <activeLayerData.icon size={20} style={{ color: activeLayerData.color }} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{activeLayerData.name}</h3>
                    <p className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">{activeLayerData.tag}</p>
                  </div>
                </div>
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">{activeLayerData.description}</p>
                <h4 className="text-[12px] text-[#666666] uppercase tracking-[0.15em] font-bold mb-3">Key Capabilities</h4>
                <div className="space-y-2">
                  {activeLayerData.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 size={13} className="mt-0.5 shrink-0" style={{ color: activeLayerData.color }} />
                      <span className="text-[13px] text-[#CCCCCC] leading-[1.5]">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-6">
                <h4 className="text-[12px] text-[#666666] uppercase tracking-[0.15em] font-bold mb-4">Technical Specifications</h4>
                <div className="space-y-0">
                  {activeLayerData.specs.map((spec) => (
                    <div key={spec.label} className="flex justify-between items-center py-3 border-b border-white/[0.04] last:border-0">
                      <span className="text-[13px] text-[#999999]">{spec.label}</span>
                      <span className="text-[13px] font-bold text-white font-[family-name:var(--font-space-mono)]">{spec.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-lg bg-[rgba(139,157,175,0.04)] border border-[rgba(139,157,175,0.1)]">
                  <p className="text-[12px] text-[#999999] leading-[1.6]">
                    <span className="text-[#8B9DAF] font-semibold">Data Flow:</span> {activeLayer === 'sense' ? 'Physical world → SENSE → THINK' : activeLayer === 'think' ? 'SENSE → THINK → ACT' : 'THINK → ACT → Physical world'}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          REFERENCE ARCHITECTURES
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Reference Architectures</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              Proven Deployment Patterns
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              Reference architectures for the most common HarchOS deployment scenarios. Each architecture includes component diagrams, configuration templates, and operational runbooks.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {referenceArchitectures.map((arch, i) => (
              <FadeIn key={arch.title} delay={i * 0.08}>
                <div className="card p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${arch.accent}12` }}>
                      <arch.icon size={18} style={{ color: arch.accent }} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{arch.title}</h3>
                  </div>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-5">{arch.desc}</p>
                  <h4 className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-bold mb-3">Components</h4>
                  <div className="space-y-2 mb-5">
                    {arch.components.map((comp, ci) => (
                      <div key={ci} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: arch.accent }} />
                        <span className="text-[13px] text-[#CCCCCC] leading-[1.4]">{comp}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/[0.04]">
                    <p className="text-[12px] text-[#666666]">
                      <span className="text-[#999999] font-semibold">Best for:</span> {arch.useCase}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WELL-ARCHITECTED FRAMEWORK
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Well-Architected Framework</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              Five Pillars of Excellence
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              The HarchOS Well-Architected Framework provides a consistent approach to evaluate architectures against best practices. Each pillar includes design principles, review questions, and remediation guidance.
            </p>
          </FadeIn>

          <div className="space-y-6">
            {pillars.map((pillar, i) => (
              <FadeIn key={pillar.name} delay={i * 0.06}>
                <div className="card p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-64 shrink-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${pillar.accent}12` }}>
                          <pillar.icon size={18} style={{ color: pillar.accent }} />
                        </div>
                        <h3 className="text-lg font-bold text-white">{pillar.name}</h3>
                      </div>
                      <p className="text-[13px] text-[#999999] leading-[1.6]">{pillar.description}</p>
                    </div>
                    <div className="flex-1 lg:pl-6 lg:border-l border-white/[0.04]">
                      <h4 className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-bold mb-3">Design Principles</h4>
                      <div className="space-y-2">
                        {pillar.principles.map((principle, pi) => (
                          <div key={pi} className="flex items-start gap-2.5">
                            <span className="text-[12px] font-bold font-[family-name:var(--font-space-mono)] shrink-0 mt-0.5" style={{ color: pillar.accent }}>{String(pi + 1).padStart(2, '0')}</span>
                            <span className="text-[13px] text-[#CCCCCC] leading-[1.5]">{principle}</span>
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

      {/* ═══════════════════════════════════════════
          DESIGN PATTERNS
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Design Patterns</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              Common Patterns
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              Proven design patterns for HarchOS deployments. Each pattern addresses a specific challenge in sovereign AI infrastructure and can be combined for complex architectures.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designPatterns.map((pattern, i) => (
              <FadeIn key={pattern.name} delay={i * 0.06}>
                <div className="card p-6 h-full group hover:border-white/15">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[rgba(139,157,175,0.06)] text-[#8B9DAF] border border-[rgba(139,157,175,0.12)]">
                      {pattern.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#8B9DAF] transition-colors">{pattern.name}</h3>
                  <p className="text-[13px] text-[#999999] leading-[1.6]">{pattern.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BEST PRACTICES
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Best Practices</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              Key Recommendations
            </h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <div className="space-y-0">
            {bestPractices.map((bp, i) => (
              <FadeIn key={bp.title} delay={i * 0.06}>
                <div className="flex items-start gap-4 py-5 border-b border-white/[0.04] group/bp">
                  <span className="text-[12px] font-[family-name:var(--font-space-mono)] text-[#333333] mt-1 shrink-0 w-6 text-right">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h4 className="text-[15px] font-semibold text-white mb-1">{bp.title}</h4>
                    <p className="text-[13px] text-[#999999] leading-[1.6]">{bp.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
