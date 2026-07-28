'use client';

import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  ArrowRight, Terminal, Code2, Package, Layout, FlaskConical,
  Activity, Github, MessageCircle, BookOpen, Zap, Key,
  Shield, Clock, BarChart3, CheckCircle2, Star, GitBranch,
  ExternalLink, Users, ChevronRight, Box, Cpu, Cloud, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── DATA ─── */
const quickStartSteps = [
  {
    step: '01',
    title: 'Create Account',
    description: 'Sign up for a free HarchOS developer account. No credit card required. Instant access to the Starter tier with 10 GPU hours/month free tier.',
    icon: Users,
    color: '#8B9DAF',
  },
  {
    step: '02',
    title: 'Get API Key',
    description: 'Generate your API key from the dashboard. Install the SDK with a single command. Authenticate in seconds with our streamlined onboarding.',
    icon: Key,
    color: '#8B5CF6',
  },
  {
    step: '03',
    title: 'Deploy First Model',
    description: 'Deploy your first AI model to the HarchOS mesh in under 4 minutes. Choose your GPU type, region, and sovereignty level. Go live instantly.',
    icon: Zap,
    color: '#10B981',
  },
];

const developerTools = [
  {
    icon: Terminal,
    title: 'HarchOS CLI',
    description: 'Command-line interface for deploying, managing, and monitoring workloads. Terraform provider and Kubernetes operator included for infrastructure-as-code workflows.',
    tags: ['Terraform Provider', 'K8s Operator', 'CI/CD Integration'],
    color: '#8B9DAF',
  },
  {
    icon: Code2,
    title: 'SDKs',
    description: 'Native SDKs for Python, TypeScript, Go, and Rust. Full type safety, async support, and automatic retry logic built in. Install and start building in seconds.',
    tags: ['Python', 'TypeScript', 'Go', 'Rust'],
    color: '#8B5CF6',
  },
  {
    icon: Layout,
    title: 'VS Code Extension',
    description: 'Deploy directly from your editor. Syntax highlighting for HarchOS configs, inline documentation, and one-click deployment to any mesh hub.',
    tags: ['IntelliSense', 'One-Click Deploy', 'Live Logs'],
    color: '#10B981',
  },
  {
    icon: FlaskConical,
    title: 'API Playground',
    description: 'Interactive sandbox to test API endpoints, build requests, and explore responses. Auto-generates code snippets in curl, Python, TypeScript, and Go.',
    tags: ['Interactive', 'Code Generation', 'Real-time'],
    color: '#F59E0B',
  },
  {
    icon: Activity,
    title: 'Observability Suite',
    description: 'Integrated Grafana dashboards, Prometheus metrics, and Jaeger distributed tracing. Full visibility into workload performance, GPU utilization, and carbon metrics.',
    tags: ['Grafana', 'Prometheus', 'Jaeger'],
    color: '#EF4444',
  },
];

const dxMetrics = [
  { label: 'API Response Time', value: '12ms', sublabel: 'p99 latency', icon: Clock, color: '#8B9DAF' },
  { label: 'SDK Satisfaction', value: '94%', sublabel: 'developer survey', icon: BarChart3, color: '#8B5CF6' },
  { label: 'Documentation Coverage', value: '87%', sublabel: 'API endpoints documented', icon: BookOpen, color: '#10B981' },
  { label: 'First Deploy Time', value: '4.2min', sublabel: 'average onboarding', icon: Zap, color: '#F59E0B' },
];

const openSourceProjects = [
  { name: 'harchos-sdk-python', description: 'Official Python SDK for HarchOS. Full async support with automatic retry, streaming, and type-safe models.', githubUrl: '', language: 'Python', languageColor: '#3572A5', comingSoon: true },
  { name: 'harchos-sdk-js', description: 'TypeScript/JavaScript SDK with full IntelliSense support. Works in Node.js and modern browsers.', githubUrl: '', language: 'TypeScript', languageColor: '#2B7489', comingSoon: true },
  { name: 'harchos-cli', description: 'Command-line interface for HarchOS. Deploy, manage, and monitor workloads from your terminal.', githubUrl: '', language: 'Go', languageColor: '#00ADD8', comingSoon: true },
  { name: 'harchos-terraform-provider', description: 'Terraform provider for managing HarchOS infrastructure as code. Full resource and data source support.', githubUrl: '', language: 'Go', languageColor: '#00ADD8', comingSoon: true },
];

/* ─── MAIN COMPONENT ─── */
export default function DevelopersPageClient() {
  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#8B9DAF]/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6 text-[#8B9DAF]">Developer Center /0.2</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[88px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              Build on<br/>HarchOS<span className="text-[#8B9DAF]">.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-4">
              The complete developer platform for sovereign AI infrastructure.
            </p>
            <p className="text-[15px] text-[#999999] max-w-xl leading-[1.7] mb-10">
              SDKs, CLI tools, API playground, and comprehensive documentation. Deploy your first model in under 4 minutes on 100% renewable GPU compute across Morocco.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link href="/developers/playground" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all">
                Get API Key <ArrowRight size={14} />
              </Link>
              <Link href="/developers/open-source" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                <Github size={16} /> Open Source
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          QUICK START
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Quick Start</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              From Zero to<br/>Deployed in Minutes
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Three steps to get your first AI workload running on the HarchOS mesh. No credit card required for the Starter tier.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickStartSteps.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.1}>
                <div className="card p-8 h-full group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${step.color}12` }}>
                      <step.icon size={22} style={{ color: step.color }} />
                    </div>
                    <span className="text-[11px] font-bold font-[family-name:var(--font-space-mono)] text-[#666666]">STEP {step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Terminal preview */}
          <FadeIn>
            <div className="mt-12 card overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-3 border-b border-white/[0.04]">
                <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <span className="w-3 h-3 rounded-full bg-[#28CA41]" />
                <span className="ml-4 text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">terminal</span>
              </div>
              <div className="p-6 font-mono text-[13px] leading-[2]">
                <p><span className="text-[#999999]">$</span> <span className="text-[#8B9DAF]">pip install</span> <span className="text-[#98C379]">harchos</span></p>
                <p className="text-[#666666]">  Successfully installed harchos-0.2.1</p>
                <p><span className="text-[#999999]">$</span> <span className="text-[#8B9DAF]">harchos</span> <span className="text-[#98C379]">--api-key hsk_... carbon MA</span></p>
                <p className="text-[#666666]">  Morocco: 47.0 gCO2/kWh | Renewable: 82.3%</p>
                <p><span className="text-[#999999]">$</span> <span className="text-[#8B9DAF]">harchos</span> <span className="text-[#98C379]">hubs</span></p>
                <p className="text-[#666666]">  5 hubs | 1,798 GPUs | 100% carbon-aware</p>
                <p><span className="text-[#999999]">$</span></p>
              </div>
            </div>
          </FadeIn>

          {/* Install Badges + Code Example */}
          <FadeIn>
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Python SDK */}
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#3572A5]/15 flex items-center justify-center">
                    <Code2 size={20} className="text-[#3572A5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Python SDK</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border border-[rgba(245,158,11,0.2)]">Coming Soon</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#0D0D0D] rounded-lg p-4 font-mono text-[12px] leading-[1.8] overflow-x-auto">
                  <p className="text-[#666666]">{'# Install'}</p>
                  <p><span className="text-[#8B9DAF]">pip install</span> <span className="text-[#98C379]">harchos</span></p>
                  <br/>
                  <p className="text-[#666666]">{'# Use'}</p>
                  <p><span className="text-[#C678DD]">from</span> harchos <span className="text-[#C678DD]">import</span> <span className="text-[#E5C07B]">HarchOSClient</span></p>
                  <br/>
                  <p><span className="text-[#C678DD]">with</span> <span className="text-[#E5C07B]">HarchOSClient</span>(<span className="text-[#98C379]">api_key</span>=<span className="text-[#98C379]">&quot;hsk_...&quot;</span>) <span className="text-[#C678DD]">as</span> client:</p>
                  <p>&nbsp;&nbsp;carbon = client.carbon.get_intensity(<span className="text-[#98C379]">&quot;MA&quot;</span>)</p>
                  <p>&nbsp;&nbsp;<span className="text-[#E5C07B]">print</span>(<span className="text-[#98C379]">f&quot;Morocco: </span><span className="text-[#8B9DAF]">{'{carbon.carbon_intensity_gco2_kwh}'}</span><span className="text-[#98C379]"> gCO2/kWh&quot;</span>)</p>
                  <p>&nbsp;&nbsp;<span className="text-[#E5C07B]">print</span>(<span className="text-[#98C379]">f&quot;Renewable: </span><span className="text-[#8B9DAF]">{'{carbon.renewable_percentage}'}</span><span className="text-[#98C379]">%&quot;</span>)</p>
                </div>
              </div>

              {/* TypeScript SDK */}
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#2B7489]/15 flex items-center justify-center">
                    <Code2 size={20} className="text-[#2B7489]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">TypeScript SDK</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border border-[rgba(245,158,11,0.2)]">Coming Soon</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#0D0D0D] rounded-lg p-4 font-mono text-[12px] leading-[1.8] overflow-x-auto">
                  <p className="text-[#666666]">{'// Install'}</p>
                  <p><span className="text-[#8B9DAF]">npm install</span> <span className="text-[#98C379]">@harchos/sdk</span></p>
                  <br/>
                  <p className="text-[#666666]">{'// Use'}</p>
                  <p><span className="text-[#C678DD]">import</span> {'{'} <span className="text-[#E5C07B]">HarchOSClient</span> {'}'} <span className="text-[#C678DD]">from</span> <span className="text-[#98C379]">&quot;@harchos/sdk&quot;</span>;</p>
                  <br/>
                  <p><span className="text-[#C678DD]">const</span> client = <span className="text-[#C678DD]">new</span> <span className="text-[#E5C07B]">HarchOSClient</span>({'{'} <span className="text-[#98C379]">apiKey</span>: <span className="text-[#98C379]">&quot;hsk_...&quot;</span> {'}'});</p>
                  <p><span className="text-[#C678DD]">const</span> carbon = <span className="text-[#C678DD]">await</span> client.carbon.getIntensity(<span className="text-[#98C379]">&quot;MA&quot;</span>);</p>
                  <p>console.<span className="text-[#E5C07B]">log</span>(<span className="text-[#98C379]">`Morocco: </span><span className="text-[#8B9DAF]">{'${carbon.carbonIntensityGco2Kwh}'}</span><span className="text-[#98C379]"> gCO2/kWh`</span>);</p>
                  <p>console.<span className="text-[#E5C07B]">log</span>(<span className="text-[#98C379]">`Renewable: </span><span className="text-[#8B9DAF]">{'${carbon.renewablePercentage}'}</span><span className="text-[#98C379]">%`</span>);</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DEVELOPER TOOLS
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Developer Tools</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Everything You Need<br/>to Build
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Purpose-built tools for sovereign AI development. From CLI to IDE extensions, every workflow is covered.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developerTools.map((tool, i) => (
              <FadeIn key={tool.title} delay={i * 0.08}>
                <div className="card p-8 h-full group">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5" style={{ backgroundColor: `${tool.color}12` }}>
                    <tool.icon size={22} style={{ color: tool.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{tool.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-5">{tool.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded text-[10px] font-semibold bg-[rgba(255,255,255,0.04)] text-[#999999] border border-white/[0.04]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          API PLAYGROUND PREVIEW
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">API Playground</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Explore the API<span className="text-[#8B9DAF]">.</span>
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              Test endpoints, build requests, and explore responses in our interactive sandbox. Auto-generates code in every language.
            </p>
          </FadeIn>

          <FadeIn>
            <div className="card overflow-hidden">
              {/* Playground Header */}
              <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.04] bg-[rgba(255,255,255,0.02)]">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#10B981]/15 text-[#10B981] text-[12px] font-bold font-[family-name:var(--font-space-mono)]">
                  POST
                </div>
                <span className="text-[13px] text-white font-[family-name:var(--font-space-mono)]">/v1/compute/deploy</span>
                <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)] ml-auto">API v1.4.2</span>
              </div>

              {/* Request/Response Split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.04]">
                {/* Request */}
                <div className="p-6">
                  <p className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-bold mb-4 font-[family-name:var(--font-space-mono)]">Request Body</p>
                  <div className="font-mono text-[13px] leading-[1.9]">
                    <p className="text-[#999999]">{'{'}</p>
                    <p className="ml-4"><span className="text-[#E06C75]">&quot;gpu_type&quot;</span>: <span className="text-[#98C379]">&quot;H100&quot;</span>,</p>
                    <p className="ml-4"><span className="text-[#E06C75]">&quot;count&quot;</span>: <span className="text-[#D19A66]">8</span>,</p>
                    <p className="ml-4"><span className="text-[#E06C75]">&quot;region&quot;</span>: <span className="text-[#98C379]">&quot;morocco-dakhla&quot;</span>,</p>
                    <p className="ml-4"><span className="text-[#E06C75]">&quot;sovereignty&quot;</span>: <span className="text-[#98C379]">&quot;strict&quot;</span>,</p>
                    <p className="ml-4"><span className="text-[#E06C75]">&quot;carbon_aware&quot;</span>: <span className="text-[#D19A66]">true</span>,</p>
                    <p className="ml-4"><span className="text-[#E06C75]">&quot;image&quot;</span>: <span className="text-[#98C379]">&quot;pytorch/2.2.0-cuda12.1&quot;</span></p>
                    <p className="text-[#999999]">{'}'}</p>
                  </div>
                </div>

                {/* Response */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] font-[family-name:var(--font-space-mono)]">200 OK</span>
                    <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">12ms</span>
                  </div>
                  <div className="font-mono text-[13px] leading-[1.9]">
                    <p className="text-[#999999]">{'{'}</p>
                    <p className="ml-4"><span className="text-[#E06C75]">&quot;deployment_id&quot;</span>: <span className="text-[#98C379]">&quot;d-7f3a2b1c&quot;</span>,</p>
                    <p className="ml-4"><span className="text-[#E06C75]">&quot;status&quot;</span>: <span className="text-[#98C379]">&quot;running&quot;</span>,</p>
                    <p className="ml-4"><span className="text-[#E06C75]">&quot;hub&quot;</span>: <span className="text-[#98C379]">&quot;harch-alpha&quot;</span>,</p>
                    <p className="ml-4"><span className="text-[#E06C75]">&quot;gpu_nodes&quot;</span>: <span className="text-[#D19A66]">8</span>,</p>
                    <p className="ml-4"><span className="text-[#E06C75]">&quot;carbon_score&quot;</span>: <span className="text-[#98C379]">&quot;A+&quot;</span>,</p>
                    <p className="ml-4"><span className="text-[#E06C75]">&quot;endpoint&quot;</span>: <span className="text-[#98C379]">&quot;mesh.harchos.com/d-7f3a2b1c&quot;</span></p>
                    <p className="text-[#999999]">{'}'}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-white/[0.04] flex items-center justify-between">
                <Link href="/developers/playground" className="inline-flex items-center gap-2 text-[13px] text-[#8B9DAF] font-semibold hover:text-[#8B9DAF]/80 transition-colors">
                  Open Full Playground <ChevronRight size={14} />
                </Link>
                <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">No auth required for sandbox</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CODE EXAMPLE
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <div>
                <p className="section-label mb-4 text-[#8B9DAF]">Code Example</p>
                <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-6">
                  Deploy in<br/>Three Lines<span className="text-[#8B9DAF]">.</span>
                </h2>
                <div className="accent-line mb-6" />
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-8">
                  The <code className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[#8B9DAF] text-[13px] font-[family-name:var(--font-space-mono)]">@harchos/sdk</code> provides a clean, intuitive API that gets out of your way. Type-safe, async-first, and built for production workloads.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Shield, text: 'Sovereign-by-default data residency' },
                    { icon: Zap, text: 'Carbon-aware scheduling built in' },
                    { icon: Activity, text: 'Real-time metrics and monitoring API' },
                    { icon: CheckCircle2, text: 'Automatic failover and migration' },
                    { icon: BarChart3, text: 'Pricing API ($1.40-$2.35/gpu-hr)' },
                    { icon: Globe, text: 'Regions API with carbon intensity data' },
                  ].map((feature) => (
                    <div key={feature.text} className="flex items-center gap-3">
                      <feature.icon size={16} className="text-[#8B9DAF]" />
                      <span className="text-[14px] text-[#CCCCCC]">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-3 border-b border-white/[0.04]">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <span className="w-3 h-3 rounded-full bg-[#28CA41]" />
                  <span className="ml-4 text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">deploy-model.ts</span>
                </div>
                <div className="p-6 font-mono text-[13px] leading-[2]">
                  <p><span className="text-[#C678DD]">import</span> <span className="text-[#E5C07B]">HarchOS</span> <span className="text-[#C678DD]">from</span> <span className="text-[#98C379]">&apos;@harchos/sdk&apos;</span>;</p>
                  <p className="mt-2"><span className="text-[#5C6370]">{'// Initialize with sovereign defaults'}</span></p>
                  <p><span className="text-[#C678DD]">const</span> <span className="text-[#61AFEF]">harch</span> = <span className="text-[#C678DD]">await</span> <span className="text-[#E5C07B]">HarchOS</span>.<span className="text-[#61AFEF]">create</span>({'{'}</p>
                  <p className="ml-4"><span className="text-[#E06C75]">region</span>: <span className="text-[#98C379]">&apos;morocco&apos;</span>,</p>
                  <p className="ml-4"><span className="text-[#E06C75]">sovereignty</span>: <span className="text-[#98C379]">&apos;strict&apos;</span>,</p>
                  <p className="ml-4"><span className="text-[#E06C75]">carbonAware</span>: <span className="text-[#D19A66]">true</span>,</p>
                  <p>{'}'});</p>
                  <p className="mt-2"><span className="text-[#5C6370]">{'// Deploy an H100 cluster with carbon-optimal scheduling'}</span></p>
                  <p><span className="text-[#C678DD]">const</span> <span className="text-[#61AFEF]">job</span> = <span className="text-[#C678DD]">await</span> <span className="text-[#61AFEF]">harch</span>.<span className="text-[#61AFEF]">deploy</span>({'{'}</p>
                  <p className="ml-4"><span className="text-[#E06C75]">gpu</span>: <span className="text-[#98C379]">&apos;H100&apos;</span>,</p>
                  <p className="ml-4"><span className="text-[#E06C75]">count</span>: <span className="text-[#D19A66]">256</span>,</p>
                  <p className="ml-4"><span className="text-[#E06C75]">schedule</span>: <span className="text-[#98C379]">&apos;carbon-optimal&apos;</span>,</p>
                  <p className="ml-4"><span className="text-[#E06C75]">image</span>: <span className="text-[#98C379]">&apos;pytorch/2.2.0-cuda12.1&apos;</span>,</p>
                  <p>{'}'});</p>
                  <p className="mt-2"><span className="text-[#61AFEF]">console</span>.<span className="text-[#61AFEF]">log</span>(<span className="text-[#98C379]">`Deployed to <span className="text-[#E06C75]">${'{'}</span>job.hub<span className="text-[#E06C75]">{'}'}</span>`</span>);</p>
                  <p className="text-[#5C6370]">{'// → Deployed to harch-alpha'}</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DX METRICS
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Developer Experience</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              DX by the<br/>Numbers<span className="text-[#8B9DAF]">.</span>
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              We obsess over developer experience. Every millisecond of latency, every API design decision, every documentation page is measured and optimized.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dxMetrics.map((metric, i) => (
              <FadeIn key={metric.label} delay={i * 0.08}>
                <div className="card p-8 text-center h-full">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: `${metric.color}12` }}>
                    <metric.icon size={22} style={{ color: metric.color }} />
                  </div>
                  <p className="text-4xl font-bold text-white stat-mono mb-2">{metric.value}</p>
                  <p className="text-[13px] text-[#CCCCCC] font-semibold mb-1">{metric.label}</p>
                  <p className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">{metric.sublabel}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          OPEN SOURCE
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Open Source</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Built in the<br/>Open<span className="text-[#8B9DAF]">.</span>
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Our core SDKs and tooling are open source. Contribute, fork, or audit every line of code that runs your sovereign infrastructure.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {openSourceProjects.map((project, i) => (
              <FadeIn key={project.name} delay={i * 0.08}>
                {project.comingSoon ? (
                  <div className="card p-8 h-full group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <GitBranch size={18} className="text-[#8B9DAF]" />
                        <h3 className="text-lg font-bold text-white">{project.name}</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/20">Coming Soon</span>
                    </div>
                    <p className="text-[14px] text-[#999999] leading-[1.7] mb-5">{project.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.languageColor }} />
                        <span className="text-[11px] text-[#999999] font-[family-name:var(--font-space-mono)]">{project.language}</span>
                      </div>
                      <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">Apache 2.0</span>
                    </div>
                  </div>
                ) : (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="card p-8 h-full group block hover:border-[#8B9DAF]/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <GitBranch size={18} className="text-[#8B9DAF]" />
                        <h3 className="text-lg font-bold text-white group-hover:text-[#8B9DAF] transition-colors">{project.name}</h3>
                      </div>
                      <ExternalLink size={14} className="text-[#666666] group-hover:text-[#8B9DAF] transition-colors" />
                    </div>
                    <p className="text-[14px] text-[#999999] leading-[1.7] mb-5">{project.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.languageColor }} />
                        <span className="text-[11px] text-[#999999] font-[family-name:var(--font-space-mono)]">{project.language}</span>
                      </div>
                      <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">Apache 2.0</span>
                    </div>
                  </a>
                )}
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="mt-8 text-center">
              <Link href="/developers/open-source" className="inline-flex items-center gap-2 text-[14px] text-[#8B9DAF] font-semibold hover:text-[#8B9DAF]/80 transition-colors">
                View All Open Source Projects <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COMMUNITY
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Community</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Join the Mesh<span className="text-[#8B9DAF]">.</span>
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Connect with thousands of developers building sovereign AI infrastructure. Get help, share knowledge, and shape the future of HarchOS.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: MessageCircle,
                title: 'Discord',
                description: 'Real-time conversations with 4,200+ developers. Get help, share projects, and connect with the core team.',
                members: 'Coming soon',
                link: 'Coming soon',
                color: '#5865F2',
              },
              {
                icon: Github,
                title: 'GitHub Discussions',
                description: 'Feature requests, RFCs, and deep technical discussions. Shape the roadmap with your input.',
                members: 'Coming soon',
                link: 'Coming soon',
                color: '#FFFFFF',
              },
              {
                icon: BookOpen,
                title: 'Stack Overflow',
                description: 'Find answers to common questions. Tag [harchos] for visibility with our developer advocates.',
                members: 'Coming soon',
                link: 'Coming soon',
                color: '#F48024',
              },
            ].map((community, i) => (
              <FadeIn key={community.title} delay={i * 0.08}>
                <div className="card p-8 h-full group cursor-pointer">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5" style={{ backgroundColor: `${community.color}12` }}>
                    <community.icon size={22} style={{ color: community.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{community.title}</h3>
                  <p className="text-[11px] text-[#8B9DAF] font-[family-name:var(--font-space-mono)] mb-3">{community.members} members</p>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-5">{community.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-[#666666] font-[family-name:var(--font-space-mono)] group-hover:text-[#999999] transition-colors">
                    {community.link} <ExternalLink size={10} />
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B9DAF]/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-[900px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <p className="section-label mb-6 text-[#8B9DAF]">Start Building</p>
            <h2 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Your Next Deploy<br/>is One Command Away<span className="text-[#8B9DAF]">.</span>
            </h2>
            <p className="text-[16px] text-[#999999] max-w-lg mx-auto leading-[1.7] mb-10">
              Free Starter tier with 10 GPU hours/month free tier. No credit card required. Deploy on 100% renewable sovereign infrastructure with carbon-aware scheduling, real-time monitoring, and pricing APIs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/developers/playground" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all">
                Start Building <ArrowRight size={14} />
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
