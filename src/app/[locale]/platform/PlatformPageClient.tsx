'use client';

import Link from 'next/link';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CountUp,
  SectionDivider,
  Card3D,
} from '@/components/ui/motion';
import {
  ArrowRight,
  Server,
  Cloud,
  Layers,
  Boxes,
  ShieldCheck,
  Cpu,
  Zap,
  Leaf,
  Code2,
  Terminal,
  BookOpen,
  Lock,
  GitBranch,
  Gauge,
  Network,
  Workflow,
  Database,
  Plug,
  CheckCircle2,
} from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';

/* ═══════════════════════════════════════════════════════════════
   DATA — Architecture Layers
   ═══════════════════════════════════════════════════════════════ */

const architectureLayers = [
  {
    id: '04',
    name: 'Applications',
    icon: Boxes,
    desc: 'HarchOS Console, Carbon Analytics, Sovereign LLM Studio, Industry Modules (cement, water, agri).',
    items: ['HarchOS Console', 'Carbon Analytics', 'Sovereign LLM Studio', 'Industry Modules'],
  },
  {
    id: '03',
    name: 'Services',
    icon: Cloud,
    desc: 'Training, Inference, MLOps, Vector DB, Model Registry, Carbon-Aware Scheduler, Identity & Access.',
    items: ['Training API', 'Inference API', 'MLOps Pipeline', 'Vector Database'],
  },
  {
    id: '02',
    name: 'Platform',
    icon: Layers,
    desc: 'Orchestration layer — Kubernetes-native, multi-hub scheduler, workload routing, observability stack.',
    items: ['Multi-Hub Scheduler', 'Workload Router', 'Observability', 'Identity Provider'],
  },
  {
    id: '01',
    name: 'Infrastructure',
    icon: Server,
    desc: '1,798 GPUs across 5 hubs, 2GW+ renewable pipeline, submarine cable connectivity, sovereign data residency.',
    items: ['1,798 GPUs', '2GW+ Renewables', 'Submarine Cables', 'Sovereign Residency'],
  },
];

const gpuHubs = [
  { city: 'Ouarzazate', gpus: 800, renewable: '97.2%', carbon: 18, role: 'Training — flagship' },
  { city: 'Dakhla', gpus: 400, renewable: '94.8%', carbon: 32, role: 'Training — submarine hub' },
  { city: 'Benguerir', gpus: 350, renewable: '88.5%', carbon: 55, role: 'Inference — greenfield' },
  { city: 'Tanger', gpus: 200, renewable: '82.1%', carbon: 95, role: 'Edge — Europe latency' },
  { city: 'Casablanca', gpus: 48, renewable: '45.0%', carbon: 210, role: 'Latency-sensitive workloads' },
];

const securityPillars = [
  { icon: Lock, title: 'Sovereign Data Residency', desc: 'All data stays on African soil. No foreign jurisdiction access. Moroccan DSP- compliance, GDPR-aligned controls.' },
  { icon: ShieldCheck, title: 'Zero-Trust Architecture', desc: 'Every request authenticated, every workload isolated. Hardware-rooted attestation on every GPU node.' },
  { icon: Network, title: 'Air-Gapped Sovereign Tier', desc: 'For government & defense workloads — physically isolated network, no internet egress, dedicated personnel clearance.' },
  { icon: GitBranch, title: 'Reproducible Builds', desc: 'Every model artifact cryptographically signed. Supply-chain attestation from source to deployment.' },
];

const platformServices = [
  {
    icon: Cpu,
    name: 'Training',
    desc: 'Distributed training across 1,798 GPUs. FP8, FP16, BF16. Megatron + DeepSpeed. Carbon-aware job placement.',
    specs: ['Up to 1024-GPU jobs', 'FP8 / FP16 / BF16', 'Megatron + DeepSpeed', 'NCCL over RDMA'],
  },
  {
    icon: Zap,
    name: 'Inference',
    desc: 'Sub-50ms inference at the edge. vLLM, TGI, TensorRT-LLM. Auto-scaling across hubs based on carbon + latency.',
    specs: ['<50ms p99 latency', 'vLLM + TGI + TRT-LLM', 'Multi-hub autoscale', 'Carbon-weighted routing'],
  },
  {
    icon: Workflow,
    name: 'MLOps',
    desc: 'End-to-end pipeline: data versioning, model registry, experiment tracking, drift detection, one-click deploy.',
    specs: ['DVC + MLflow', 'Model registry', 'Drift detection', 'One-click deploy'],
  },
  {
    icon: Code2,
    name: 'SDK',
    desc: 'Python, TypeScript, Go SDKs. Drop-in replacement for OpenAI / Anthropic clients. 5-line hello world.',
    specs: ['Python / TS / Go', 'OpenAI-compatible', 'Streaming + batch', 'Carbon telemetry built-in'],
  },
];

const developerTools = [
  { icon: Terminal, title: 'CLI & APIs', desc: 'harch CLI for everything. REST + gRPC + WebSocket APIs. OpenAPI 3.1 spec auto-generated.' },
  { icon: Code2, title: 'SDKs', desc: 'First-party SDKs in Python, TypeScript, Go, Rust. Community SDKs for Java, Ruby, PHP.' },
  { icon: BookOpen, title: 'Documentation', desc: 'Tutorials, reference architecture, cookbooks, migration guides from AWS / GCP / Azure.' },
  { icon: Plug, title: 'Integrations', desc: 'Hugging Face, LangChain, LlamaIndex, Ray, Modal, Prefect, Airflow, dbt, Kubeflow.' },
];

const pricingPreview = [
  { tier: 'Starter', price: 'Free', desc: '10 GPU hrs/month', highlight: false },
  { tier: 'Professional', price: '$499', desc: 'Per month, 1,000 GPU hrs', highlight: true },
  { tier: 'Enterprise', price: 'Custom', desc: 'Dedicated capacity, SLA 99.95%', highlight: false },
  { tier: 'Sovereign', price: 'Classified', desc: 'Air-gapped, government clearance', highlight: false },
];

const heroStats = [
  { value: 1798, label: 'GPUs Online', suffix: '' },
  { value: 5, label: 'GPU Hubs', suffix: '' },
  { value: 48, label: 'gCO₂ / kWh', suffix: '' },
  { value: 2847, label: 'Sensors Live', suffix: '' },
];

/* ═══════════════════════════════════════════════════════════════
   MOROCCO HUB MAP — Simplified SVG with 5 hub markers
   ═══════════════════════════════════════════════════════════════ */

function MoroccoHubMap() {
  // Approximate normalized positions on a 600x400 canvas
  const hubs = [
    { city: 'Tanger', x: 280, y: 60, size: 8 },
    { city: 'Casablanca', x: 230, y: 140, size: 6 },
    { city: 'Benguerir', x: 220, y: 175, size: 10 },
    { city: 'Ouarzazate', x: 270, y: 230, size: 16 },
    { city: 'Dakhla', x: 130, y: 340, size: 12 },
  ];
  return (
    <div className="relative w-full aspect-[3/2] bg-[rgba(255,255,255,0.02)] border border-white/[0.06] rounded-lg overflow-hidden">
      <svg viewBox="0 0 600 400" className="absolute inset-0 w-full h-full">
        {/* Stylized Morocco outline */}
        <path
          d="M 180 40 L 320 40 L 340 80 L 360 120 L 350 180 L 330 240 L 310 300 L 270 360 L 200 370 L 120 350 L 80 300 L 90 220 L 120 150 L 150 80 Z"
          fill="rgba(139,157,175,0.04)"
          stroke="rgba(139,157,175,0.25)"
          strokeWidth="1"
        />
        {/* Hub connection lines */}
        {hubs.map((h, i) =>
          hubs.slice(i + 1).map((h2, j) => (
            <line
              key={`${i}-${j}`}
              x1={h.x}
              y1={h.y}
              x2={h2.x}
              y2={h2.y}
              stroke="rgba(139,157,175,0.12)"
              strokeWidth="0.5"
              strokeDasharray="2 3"
            />
          ))
        )}
        {/* Hub markers */}
        {hubs.map((h) => (
          <g key={h.city}>
            <circle cx={h.x} cy={h.y} r={h.size + 6} fill="rgba(139,157,175,0.08)" />
            <circle cx={h.x} cy={h.y} r={h.size} fill="#8B9DAF" opacity="0.9" />
            <circle cx={h.x} cy={h.y} r={h.size / 2} fill="#FFFFFF" />
            <text
              x={h.x}
              y={h.y - h.size - 8}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="600"
              fontFamily="var(--font-space-mono), monospace"
            >
              {h.city}
            </text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-3 right-3 text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)] tracking-[0.15em] uppercase">
        HarchOS / Hub Mesh
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CARBON-AWARE SCHEDULER — Visual flow
   ═══════════════════════════════════════════════════════════════ */

function CarbonSchedulerVisual() {
  return (
    <div className="relative w-full bg-[rgba(255,255,255,0.02)] border border-white/[0.06] rounded-lg p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
        {/* Workload input */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#666666]">Incoming Workload</p>
          {['Training job #4821', 'Batch inference #2210', 'Fine-tuning #9384'].map((job) => (
            <div key={job} className="flex items-center gap-3 p-3 rounded-md bg-[rgba(255,255,255,0.03)] border border-white/[0.04]">
              <div className="w-2 h-2 rounded-full bg-[#8B9DAF]" />
              <span className="text-[13px] text-[#CCCCCC] font-[family-name:var(--font-space-mono)]">{job}</span>
            </div>
          ))}
        </div>

        {/* Scheduler */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-[rgba(139,157,175,0.1)] border border-[#8B9DAF]/30 flex items-center justify-center">
            <Leaf size={22} className="text-[#8B9DAF]" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8B9DAF]">Scheduler</span>
          <div className="hidden md:block w-px h-8 bg-gradient-to-b from-[#8B9DAF]/40 to-transparent" />
        </div>

        {/* Hub routing */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#666666]">Routed Hub (lowest carbon)</p>
          {[
            { hub: 'Ouarzazate', carbon: '18 gCO₂/kWh' },
            { hub: 'Dakhla', carbon: '32 gCO₂/kWh' },
            { hub: 'Benguerir', carbon: '55 gCO₂/kWh' },
          ].map((route) => (
            <div key={route.hub} className="flex items-center justify-between p-3 rounded-md bg-[rgba(74,123,95,0.06)] border border-[rgba(74,123,95,0.2)]">
              <span className="text-[13px] text-white font-semibold">{route.hub}</span>
              <span className="text-[11px] text-[#4A7B5F] font-[family-name:var(--font-space-mono)]">{route.carbon}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-white/[0.06] flex flex-wrap gap-x-8 gap-y-2 text-[11px] text-[#999999]">
        <span><span className="text-white font-semibold">89%</span> below industry avg</span>
        <span><span className="text-white font-semibold">25%</span> cost reduction on batch</span>
        <span><span className="text-white font-semibold">3s</span> sampling interval</span>
        <span><span className="text-white font-semibold">100%</span> renewable priority</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function PlatformPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 data-grid-pattern opacity-20" />
        <div className="absolute top-0 right-1/4 w-[700px] h-[500px] bg-[#8B9DAF]/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6">HarchOS /0.3</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[88px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              Sovereign AI<br />Infrastructure<span className="text-[#8B9DAF]">.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-4">
              HarchOS is the operating system for sovereign AI compute.
            </p>
            <p className="text-[15px] text-[#999999] max-w-xl leading-[1.7]">
              One platform spanning five Moroccan GPU hubs, 1,798 carbon-optimized GPUs, and a 2GW+ renewable pipeline. Train, deploy, and scale AI workloads without routing a single byte through foreign jurisdictions.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-10">
              <Link href="/pricing" className="inline-flex items-center gap-2.5 bg-white text-black px-7 py-3.5 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                View Pricing <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-7 py-3.5 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Request Platform Access
              </Link>
            </div>
          </FadeIn>

          {/* Hero stats */}
          <FadeIn delay={0.4}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-16 bg-white/[0.06] border border-white/[0.06] rounded-lg overflow-hidden">
              {heroStats.map((stat) => (
                <div key={stat.label} className="bg-[#0D0D0D] p-6 md:p-8">
                  <p className="text-3xl md:text-4xl font-extrabold text-white stat-mono mb-2">
                    <CountUp to={stat.value} suffix={stat.suffix} duration={2} />
                  </p>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666]">{stat.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="mt-10 flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 bg-[#0F0F0F] border border-[rgba(139,157,175,0.18)] rounded-lg max-w-3xl">
              <div className="w-full md:w-72 h-40 shrink-0">
                <VideoPlayer
                  src="/videos/v4_intelligence.mp4"
                  variant="modal-trigger"
                  label="Watch: Harch Intelligence (40s)"
                  className="w-full h-full"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2">Platform Brief</p>
                <p className="text-[15px] text-white/80 leading-relaxed">
                  HarchOS is the operating system for sovereign AI compute — five Moroccan GPU hubs,
                  1,798 carbon-optimized GPUs, and a 2GW+ renewable pipeline. Watch the 40-second brief.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ ARCHITECTURE OVERVIEW ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Architecture</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Four Layers.<br />One Sovereign Stack.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              HarchOS is built as a layered architecture — every layer owned, operated, and audited by Harch Corp. No foreign dependencies at any level of the stack.
            </p>
          </FadeIn>

          <StaggerContainer staggerDelay={0.1} className="space-y-4">
            {architectureLayers.map((layer) => (
              <StaggerItem key={layer.id}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 md:p-8 hover:border-[#8B9DAF]/20 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-5 md:w-72 shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-[rgba(139,157,175,0.08)] border border-[#8B9DAF]/15 flex items-center justify-center">
                        <layer.icon size={20} className="text-[#8B9DAF]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#666666] font-[family-name:var(--font-space-mono)] tracking-[0.15em]">LAYER {layer.id}</span>
                        <h3 className="text-xl font-bold text-white">{layer.name}</h3>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] text-[#999999] leading-[1.7] mb-3">{layer.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {layer.items.map((item) => (
                          <span key={item} className="px-2.5 py-1 rounded-md bg-[rgba(255,255,255,0.04)] text-[11px] font-semibold text-[#999999]">{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ CARBON-AWARE SCHEDULING ═══════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#4A7B5F]">Carbon-Aware Scheduling</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Every Job Routed<br />to the Greenest Hub.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              The HarchOS Scheduler samples carbon intensity across all five hubs every 3 seconds — renewable mix, grid carbon, real-time PUE — and routes each incoming workload to the hub with the lowest footprint at that exact moment. The result: <span className="text-white font-semibold">48.2 gCO₂/kWh average</span>, 89% below the hyperscaler average of 440 gCO₂/kWh.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <CarbonSchedulerVisual />
          </FadeIn>
        </div>
      </section>

      {/* ═══════ 5 GPU HUBS ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">GPU Hubs</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Five Hubs. One Mesh.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              Strategically placed across Morocco to maximize renewable mix, minimize latency to Europe, and provide redundancy across climate zones. 1,798 GPUs in aggregate — the largest sovereign AI compute footprint on African soil.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <FadeIn delay={0.1}>
              <MoroccoHubMap />
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="space-y-3">
                {gpuHubs.map((hub) => (
                  <div key={hub.city} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-5 hover:border-[#8B9DAF]/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">{hub.city}</h3>
                      <span className="text-[11px] font-bold text-[#8B9DAF] font-[family-name:var(--font-space-mono)]">{hub.gpus} GPUs</span>
                    </div>
                    <p className="text-[12px] text-[#999999] mb-3">{hub.role}</p>
                    <div className="flex gap-4 text-[11px]">
                      <span className="text-[#4A7B5F] font-semibold">{hub.renewable} renewable</span>
                      <span className="text-[#666666]">{hub.carbon} gCO₂/kWh</span>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <SectionDivider className="max-w-[1400px] mx-auto" />

      {/* ═══════ SOVEREIGN SECURITY FRAMEWORK ═══════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Sovereign Security</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Security by Sovereignty.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Security is not a feature — it is the foundation. HarchOS enforces sovereign data residency, zero-trust access, and hardware-rooted attestation at every layer of the stack.
            </p>
          </FadeIn>
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityPillars.map((pillar) => (
              <StaggerItem key={pillar.title}>
                <Card3D className="p-8 h-full">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(139,157,175,0.08)] border border-[#8B9DAF]/15 flex items-center justify-center mb-5">
                    <pillar.icon size={20} className="text-[#8B9DAF]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{pillar.desc}</p>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ AI PLATFORM SERVICES ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Platform Services</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Train. Deploy. Operate.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Four core services cover the full AI lifecycle — from distributed training across hundreds of GPUs to sub-50ms inference at the edge.
            </p>
          </FadeIn>
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {platformServices.map((service) => (
              <StaggerItem key={service.name}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-8 h-full">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(139,157,175,0.08)] border border-[#8B9DAF]/15 flex items-center justify-center">
                      <service.icon size={20} className="text-[#8B9DAF]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{service.name}</h3>
                  </div>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-5">{service.desc}</p>
                  <div className="space-y-2">
                    {service.specs.map((spec) => (
                      <div key={spec} className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-[#4A7B5F] shrink-0" />
                        <span className="text-[13px] text-[#CCCCCC]">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ DEVELOPER EXPERIENCE ═══════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Developer Experience</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Built for Engineers,<br />Not Procurement.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Drop-in compatible with the tools you already use. Migrate from AWS / GCP / Azure in an afternoon — same APIs, same SDKs, lower cost, lower carbon.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {developerTools.map((tool, i) => (
              <FadeIn key={tool.title} delay={i * 0.08}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[#8B9DAF]/15 flex items-center justify-center mb-4">
                    <tool.icon size={18} className="text-[#8B9DAF]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{tool.title}</h3>
                  <p className="text-[13px] text-[#999999] leading-[1.7]">{tool.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Code snippet */}
          <FadeIn delay={0.2}>
            <div className="mt-10 bg-[#0A0A0A] border border-white/[0.06] rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-[rgba(255,255,255,0.02)]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#333333]" />
                </div>
                <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)] ml-2">hello-harch.py</span>
              </div>
              <pre className="p-5 text-[13px] font-[family-name:var(--font-space-mono)] leading-relaxed overflow-x-auto">
<span className="text-[#8B9DAF]">from</span> <span className="text-white">harch</span> <span className="text-[#8B9DAF]">import</span> Client{'\n'}{'\n'}
client = <span className="text-white">Client</span>(api_key=<span className="text-[#4A7B5F]">"sk-harch-..."</span>){'\n'}{'\n'}
<span className="text-[#666666]"># Carbon-aware — picks the greenest hub automatically</span>{'\n'}
response = client.inference.create({'\n'}
{'  '}model=<span className="text-[#4A7B5F]">"harch/harch-llm-70b"</span>,{'\n'}
{'  '}prompt=<span className="text-[#4A7B5F]">"Explain sovereign AI in one sentence."</span>,{'\n'}
{'  '}carbon_aware=<span className="text-[#C4964A]">True</span>,{'\n'}
{'  '}max_tokens=<span className="text-[#C4964A]">128</span>,{'\n'}
){'\n'}{'\n'}
<span className="text-[#666666]"># Returns carbon footprint of this request</span>{'\n'}
<span className="text-[#8B9DAF]">print</span>(response.text){'\n'}
<span className="text-[#8B9DAF]">print</span>(<span className="text-[#4A7B5F]">{'f"Carbon: {response.carbon_gco2} gCO₂"'}</span>)
              </pre>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ PRICING PREVIEW ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Pricing Preview</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Four Tiers. Zero Surprises.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              From free exploration to air-gapped sovereign deployments. Full pricing breakdown on the pricing page.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPreview.map((tier, i) => (
              <FadeIn key={tier.tier} delay={i * 0.08}>
                <div className={`bg-white/[0.02] border rounded-lg p-6 h-full ${tier.highlight ? 'border-[#8B9DAF]/40 ring-1 ring-[#8B9DAF]/20' : 'border-white/[0.06]'}`}>
                  {tier.highlight && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#8B9DAF]/15 text-[#8B9DAF] text-[10px] font-bold mb-3">Most Popular</span>
                  )}
                  <h3 className="text-lg font-bold text-white mb-2">{tier.tier}</h3>
                  <p className="text-3xl font-extrabold text-white stat-mono mb-2">{tier.price}</p>
                  <p className="text-[13px] text-[#999999] leading-[1.6]">{tier.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div className="mt-10 text-center">
              <Link href="/pricing" className="inline-flex items-center gap-2 text-[#8B9DAF] hover:text-white text-sm font-semibold transition-colors">
                View Full Pricing <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 data-grid-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] mb-6">
              Build on Sovereign Soil.
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/40 leading-relaxed mb-12">
              Request platform access. Deploy your first workload in under 24 hours. No credit card required for Starter tier.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Request Access <ArrowRight size={14} />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                View Pricing
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
