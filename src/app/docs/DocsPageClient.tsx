'use client';

import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  Search, BookOpen, Code2, Layers, Rocket, Server, Brain, Eye, Zap,
  Globe, Shield, Terminal, Database, Key, Lock, Activity, ChevronRight,
  FileText, Box, Cloud, Cpu, GitBranch, Wrench, Monitor, Network,
  ArrowRight, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── DATA ─── */
const quickStartCards = [
  {
    icon: Rocket,
    title: 'Get Started with HarchOS',
    description: 'Deploy your first workload on the sovereign AI mesh in under 5 minutes.',
    href: '/docs/quickstarts',
    accent: '#8B9DAF',
  },
  {
    icon: Code2,
    title: 'API Reference',
    description: 'Complete reference for REST, gRPC, and WebSocket APIs with code examples.',
    href: '/docs/api',
    accent: '#8B5CF6',
  },
  {
    icon: Terminal,
    title: 'SDK Installation',
    description: 'Install SDKs for Python, TypeScript, Go, and Rust to integrate with HarchOS.',
    href: '/docs/sdks',
    accent: '#10B981',
  },
  {
    icon: Layers,
    title: 'Architecture Guide',
    description: 'Understand the SENSE-THINK-ACT architecture and distributed mesh topology.',
    href: '/docs/architecture',
    accent: '#F59E0B',
  },
];

const docCategories = [
  {
    title: 'Platform Documentation',
    icon: Server,
    items: [
      { name: 'HarchOS Core', desc: 'Kernel, orchestration engine, and mesh controller', icon: Cpu, href: '/docs/architecture' },
      { name: 'SENSE Layer', desc: 'Data ingestion, IoT, satellite, and API feeds', icon: Eye, href: '/docs/architecture' },
      { name: 'THINK Layer', desc: 'AI/ML processing, model training, and inference', icon: Brain, href: '/docs/architecture' },
      { name: 'ACT Layer', desc: 'Execution, automated operations, and control systems', icon: Zap, href: '/docs/architecture' },
    ],
  },
  {
    title: 'API Reference',
    icon: Globe,
    items: [
      { name: 'REST API', desc: 'HTTP endpoints for compute, data, and model management', icon: Network, href: '/docs/api' },
      { name: 'gRPC API', desc: 'High-performance streaming and service definitions', icon: Activity, href: '/docs/api' },
      { name: 'WebSocket API', desc: 'Real-time event streaming and monitoring', icon: Cloud, href: '/docs/api' },
      { name: 'Authentication', desc: 'API keys, OAuth 2.0, and JWT token management', icon: Key, href: '/docs/api' },
    ],
  },
  {
    title: 'SDKs & Libraries',
    icon: Code2,
    items: [
      { name: 'Python SDK', desc: 'Native Python client with async support and type hints', icon: Box, href: '/docs/sdks' },
      { name: 'TypeScript SDK', desc: 'Full TypeScript client for Node.js and browser', icon: FileText, href: '/docs/sdks' },
      { name: 'Go SDK', desc: 'Idiomatic Go client with context and cancellation', icon: Terminal, href: '/docs/sdks' },
      { name: 'Rust SDK', desc: 'Zero-cost abstractions with async runtime', icon: Wrench, href: '/docs/sdks' },
    ],
  },
  {
    title: 'Infrastructure',
    icon: Database,
    items: [
      { name: 'Data Center Operations', desc: 'Hub management, rack configuration, and capacity planning', icon: Server, href: '/docs/guides' },
      { name: 'Network Architecture', desc: 'Backbone, inter-hub connectivity, and latency optimization', icon: Network, href: '/docs/guides' },
      { name: 'Power Management', desc: 'Renewable energy allocation, PUE optimization, and failover', icon: Zap, href: '/docs/guides' },
      { name: 'Cooling Systems', desc: 'Liquid cooling, thermal management, and environmental controls', icon: Monitor, href: '/docs/guides' },
    ],
  },
  {
    title: 'Security',
    icon: Shield,
    items: [
      { name: 'Identity & Access', desc: 'RBAC, service accounts, and zero-trust architecture', icon: Key, href: '/docs/guides' },
      { name: 'Encryption', desc: 'End-to-end encryption, key management, and HSM integration', icon: Lock, href: '/docs/guides' },
      { name: 'Compliance', desc: 'GDPR, ISO 27001, SOC 2 Type II, and Law 09-08', icon: CheckCircle2, href: '/docs/guides' },
      { name: 'Audit Logging', desc: 'Immutable audit trails, SIEM integration, and alerting', icon: FileText, href: '/docs/guides' },
    ],
  },
  {
    title: 'Developer Tools',
    icon: GitBranch,
    items: [
      { name: 'CLI Reference', desc: 'HarchOS CLI commands for deployment and management', icon: Terminal, href: '/docs/sdks' },
      { name: 'Terraform Provider', desc: 'Infrastructure-as-code for HarchOS resources', icon: Layers, href: '/docs/sdks' },
      { name: 'Kubernetes Operator', desc: 'Native K8s integration for workload orchestration', icon: Box, href: '/docs/sdks' },
      { name: 'VS Code Extension', desc: 'Inline docs, syntax highlighting, and deploy commands', icon: Code2, href: '/docs/sdks' },
    ],
  },
];

const popularGuides = [
  { title: 'Deploy Your First AI Model on HarchOS', desc: 'Step-by-step guide to deploying a model on the sovereign AI mesh with carbon-aware scheduling.', time: '10 min read', href: '/docs/quickstarts' },
  { title: 'Setting Up Data Pipelines with SENSE', desc: 'Configure IoT, satellite, and API data ingestion through the SENSE layer.', time: '15 min read', href: '/docs/guides' },
  { title: 'Multi-Hub Workload Distribution', desc: 'Distribute inference workloads across multiple hubs for latency and cost optimization.', time: '12 min read', href: '/docs/architecture' },
  { title: 'Implementing Zero-Trust Security', desc: 'Configure mTLS, RBAC, and network segmentation for sovereign workloads.', time: '20 min read', href: '/docs/guides' },
  { title: 'Carbon-Aware Scheduling Deep Dive', desc: 'Optimize workload placement based on renewable energy availability across hubs.', time: '8 min read', href: '/docs/guides' },
  { title: 'Monitoring and Observability with HarchOS', desc: 'Set up Prometheus, Grafana, and distributed tracing for mesh-wide observability.', time: '14 min read', href: '/docs/guides' },
];

/* ─── MAIN COMPONENT ─── */
export default function DocsPageClient() {
  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══════════════════════════════════════════
          HERO — Documentation Hub
          ═══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#000000] overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#000000]/95 to-[#0D0D0D]" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6 text-[#8B9DAF]">HarchOS Platform /0.1</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              Documentation
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-10">
              Everything you need to build, deploy, and scale on HarchOS — the operating system for sovereign AI infrastructure.
            </p>
          </FadeIn>
          {/* Decorative Search Bar */}
          <FadeIn delay={0.3}>
            <div className="max-w-2xl">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" />
                <input
                  type="text"
                  placeholder="Search documentation, APIs, guides..."
                  className="w-full bg-[#121212] border border-white/[0.08] rounded-xl pl-12 pr-4 py-4 text-[15px] text-white placeholder-[#666666] focus:outline-none focus:border-white/20 transition-colors"
                  readOnly
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <kbd className="px-2 py-1 rounded text-[10px] text-[#666666] bg-[rgba(255,255,255,0.04)] border border-white/[0.06] font-[family-name:var(--font-space-mono)]">Ctrl</kbd>
                  <kbd className="px-2 py-1 rounded text-[10px] text-[#666666] bg-[rgba(255,255,255,0.04)] border border-white/[0.06] font-[family-name:var(--font-space-mono)]">K</kbd>
                </div>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="mt-6 flex items-center gap-4 text-[13px]">
              <span className="text-[#666666]">Current version:</span>
              <span className="font-[family-name:var(--font-space-mono)] text-[#8B9DAF] font-semibold">v0.1.0</span>
              <span className="text-[#333333]">|</span>
              <Link href="/docs/changelog" className="text-[#999999] hover:text-white transition-colors nav-link">View changelog</Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          QUICK START CARDS
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Quick Start</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              Start Building
            </h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStartCards.map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.08}>
                <Link href={card.href} className="card p-6 h-full block group hover:border-white/15">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5" style={{ backgroundColor: `${card.accent}12` }}>
                    <card.icon size={18} style={{ color: card.accent }} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#8B9DAF] transition-colors">{card.title}</h3>
                  <p className="text-[13px] text-[#999999] leading-[1.6] mb-4">{card.description}</p>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: card.accent }}>
                    Get started <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DOCUMENTATION CATEGORIES
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Browse by Category</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              Documentation Categories
            </h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {docCategories.map((category, i) => (
              <FadeIn key={category.title} delay={i * 0.08}>
                <div className="card p-6 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-[rgba(139,157,175,0.08)] flex items-center justify-center">
                      <category.icon size={16} className="text-[#8B9DAF]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{category.title}</h3>
                  </div>
                  <div className="space-y-0">
                    {category.items.map((item) => (
                      <Link key={item.name} href={item.href} className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0 group/item">
                        <item.icon size={14} className="text-[#666666] mt-0.5 shrink-0 group-hover/item:text-[#8B9DAF] transition-colors" />
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-white group-hover/item:text-[#8B9DAF] transition-colors">{item.name}</p>
                          <p className="text-[12px] text-[#666666] leading-[1.5] mt-0.5">{item.desc}</p>
                        </div>
                        <ChevronRight size={12} className="text-[#333333] mt-1.5 shrink-0 group-hover/item:text-[#8B9DAF] group-hover/item:translate-x-0.5 transition-all ml-auto" />
                      </Link>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          POPULAR GUIDES
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Popular Guides</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              Most-Read Guides
            </h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <div className="space-y-0">
            {popularGuides.map((guide, i) => (
              <FadeIn key={guide.title} delay={i * 0.06}>
                <Link href={guide.href} className="flex items-center justify-between py-5 border-b border-white/[0.04] group/guide hover:bg-white/[0.01] px-2 -mx-2 rounded-lg transition-colors">
                  <div className="flex items-start gap-4 min-w-0">
                    <span className="text-[12px] font-[family-name:var(--font-space-mono)] text-[#333333] mt-1 shrink-0 w-6 text-right">{String(i + 1).padStart(2, '0')}</span>
                    <div className="min-w-0">
                      <h4 className="text-[15px] font-semibold text-white group-hover/guide:text-[#8B9DAF] transition-colors">{guide.title}</h4>
                      <p className="text-[13px] text-[#666666] mt-1 leading-[1.5]">{guide.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <span className="flex items-center gap-1.5 text-[11px] text-[#666666]">
                      <Clock size={12} /> {guide.time}
                    </span>
                    <ArrowRight size={14} className="text-[#333333] group-hover/guide:text-[#8B9DAF] group-hover/guide:translate-x-1 transition-all" />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          API STATUS + VERSION
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* API Status */}
            <FadeIn>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <Activity size={18} className="text-[#8B9DAF]" />
                  <h3 className="text-lg font-bold text-white">API Status</h3>
                </div>
                <div className="accent-line mb-6" />
                <div className="space-y-4">
                  {[
                    { name: 'REST API', status: 'Operational', latency: '24ms', uptime: '99.99%' },
                    { name: 'gRPC API', status: 'Operational', latency: '8ms', uptime: '99.99%' },
                    { name: 'WebSocket API', status: 'Operational', latency: '3ms', uptime: '99.97%' },
                    { name: 'Authentication Service', status: 'Operational', latency: '12ms', uptime: '100%' },
                  ].map((api) => (
                    <div key={api.name} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                        <span className="text-[14px] text-white font-medium">{api.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[12px] text-[#666666] font-[family-name:var(--font-space-mono)]">{api.latency}</span>
                        <span className="text-[12px] text-[#10B981] font-[family-name:var(--font-space-mono)]">{api.uptime}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10B981]" />
                  <span className="text-[12px] text-[#666666]">Systems in engineering phase. Last updated Q1 2026.</span>
                </div>
              </div>
            </FadeIn>

            {/* Version & Resources */}
            <FadeIn delay={0.1}>
              <div className="card p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen size={18} className="text-[#8B9DAF]" />
                  <h3 className="text-lg font-bold text-white">Current Release</h3>
                </div>
                <div className="accent-line mb-6" />
                <div className="mb-6">
                  <p className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)] mb-2">HarchOS Version</p>
                  <p className="text-4xl font-bold text-white font-[family-name:var(--font-space-mono)]">v0.1.0</p>
                  <p className="text-[13px] text-[#666666] mt-2">Released February 2026 — Initial public release</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Release Notes', href: '/docs/changelog', icon: FileText },
                    { label: 'Upgrade Guide', href: '/docs/changelog', icon: ArrowRight },
                    { label: 'API Changelog', href: '/docs/changelog', icon: Code2 },
                  ].map((link) => (
                    <Link key={link.label} href={link.href} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0 group/link">
                      <div className="flex items-center gap-2.5">
                        <link.icon size={14} className="text-[#666666] group-hover/link:text-[#8B9DAF] transition-colors" />
                        <span className="text-[14px] text-white group-hover/link:text-[#8B9DAF] transition-colors">{link.label}</span>
                      </div>
                      <ChevronRight size={12} className="text-[#333333] group-hover/link:text-[#8B9DAF] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

    </div>
  );
}
