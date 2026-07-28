'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  Code2, Terminal, ArrowRight, CheckCircle2, Copy, ChevronRight,
  Package, Zap, Shield, Globe, Box, Layers, Monitor,
  FileText, Cpu, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── DATA ─── */
const sdks = [
  {
    id: 'python',
    name: 'Python SDK',
    package: 'harchos',
    install: 'pip install harchos',
    version: '0.1.0',
    status: 'coming-soon',
    accent: '#3776AB',
    quickStart: `import harchos

# Initialize client with sovereign defaults
client = harchos.Client(
    api_key="hrch_live_sk_abc123",
    region="morocco",
    sovereignty="strict",
    carbon_aware=True,
)

# Deploy a compute workload
workload = client.compute.create_workload(
    name="training-run-001",
    gpu="H100",
    count=8,
    hub="dakhla",
    schedule="carbon-optimal",
)

# Stream real-time metrics
for event in workload.stream_metrics():
    print(f"GPU Util: {event.gpu_util}% | Power: {event.power_w}W")`,
    features: [
      'Async/await support with httpx',
      'Full type hints and Pydantic models',
      'Streaming API with async generators',
      'Built-in retry with exponential backoff',
      'Context manager support for resource cleanup',
      'Native pandas DataFrame integration',
    ],
  },
  {
    id: 'typescript',
    name: 'TypeScript/JavaScript SDK',
    package: '@harchos/sdk',
    install: 'npm install @harchos/sdk',
    version: '0.1.0',
    status: 'coming-soon',
    accent: '#3178C6',
    quickStart: `import { HarchOS } from '@harchos/sdk';

// Initialize client with sovereign defaults
const client = await HarchOS.create({
  apiKey: 'hrch_live_sk_abc123',
  region: 'morocco',
  sovereignty: 'strict',
  carbonAware: true,
});

// Deploy a compute workload
const workload = await client.compute.createWorkload({
  name: 'training-run-001',
  gpu: 'H100',
  count: 8,
  hub: 'dakhla',
  schedule: 'carbon-optimal',
});

// Stream real-time metrics via WebSocket
for await (const event of workload.streamMetrics()) {
  console.log(\`GPU Util: \${event.gpuUtil}% | Power: \${event.powerW}W\`);
}`,
    features: [
      'Full TypeScript types with zero any',
      'Works in Node.js 18+ and modern browsers',
      'WebSocket streaming with async iterators',
      'Tree-shakeable ESM build',
      'Built-in retry and circuit breaker',
      'React hooks package: @harchos/react',
    ],
  },
  {
    id: 'go',
    name: 'Go SDK',
    package: 'harchos-cli',
    install: 'go get github.com/harchos/sdk-go/pkg/client',
    version: '0.1.0',
    status: 'coming-soon',
    accent: '#00ADD8',
    quickStart: `package main

import (
    "context"
    "fmt"
    "log"

    harchos "github.com/harchos/sdk-go/pkg/client"
)

func main() {
    client, err := harchos.NewClient(harchos.Config{
        APIKey:      "hrch_live_sk_abc123",
        Region:      "morocco",
        Sovereignty: "strict",
        CarbonAware: true,
    })
    if err != nil {
        log.Fatal(err)
    }

    workload, err := client.Compute.CreateWorkload(
        context.Background(),
        &harchos.CreateWorkloadRequest{
            Name:     "training-run-001",
            GPU:      "H100",
            Count:    8,
            Hub:      "dakhla",
            Schedule: "carbon-optimal",
        },
    )
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Workload %s deployed on %s\\n", workload.ID, workload.Hub)
}`,
    features: [
      'Idiomatic Go with context.Context',
      'Graceful cancellation and timeout support',
      'Connection pooling with configurable limits',
      'Struct-based request/response types',
      'Built-in retry with jitter',
      'gRPC client for streaming operations',
    ],
  },
  {
    id: 'rust',
    name: 'Rust SDK',
    package: 'harchos-sdk',
    install: 'cargo add harchos-sdk',
    version: '0.1.0',
    status: 'coming-soon',
    accent: '#DEA584',
    quickStart: `use harchos_sdk::{Client, Config, CreateWorkloadRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new(Config {
        api_key: "hrch_live_sk_abc123".to_string(),
        region: "morocco".to_string(),
        sovereignty: "strict".to_string(),
        carbon_aware: true,
    }).await?;

    let workload = client
        .compute()
        .create_workload(CreateWorkloadRequest {
            name: "training-run-001".to_string(),
            gpu: "H100".to_string(),
            count: 8,
            hub: "dakhla".to_string(),
            schedule: "carbon-optimal".to_string(),
        })
        .await?;

    println!("Workload {} deployed on {}", workload.id, workload.hub);
    Ok(())
}`,
    features: [
      'Zero-cost abstractions with async/await',
      'Tokio runtime with zero-copy parsing',
      'Serde-based serialization/deserialization',
      'Compile-time type safety guarantees',
      'Minimal dependency tree',
      'Native gRPC support via tonic',
    ],
  },
];

const cliCommands = [
  { cmd: 'harchos auth login', desc: 'Authenticate with your HarchOS account' },
  { cmd: 'harchos workloads list', desc: 'List all compute workloads' },
  { cmd: 'harchos workloads deploy --gpu H100 --count 8', desc: 'Deploy a new compute workload' },
  { cmd: 'harchos workloads scale <id> --count 16', desc: 'Scale a running workload' },
  { cmd: 'harchos models deploy <model> --hub dakhla', desc: 'Deploy a model to an inference endpoint' },
  { cmd: 'harchos hubs status', desc: 'Check status of all compute hubs' },
  { cmd: 'harchos energy report', desc: 'View energy consumption and carbon metrics' },
  { cmd: 'harchos logs tail <workload-id>', desc: 'Stream logs from a workload' },
];

const comparisonFeatures = [
  { feature: 'REST API Support', python: true, typescript: true, go: true, rust: true },
  { feature: 'gRPC Streaming', python: true, typescript: true, go: true, rust: true },
  { feature: 'WebSocket Events', python: true, typescript: true, go: true, rust: false },
  { feature: 'Async/Await', python: true, typescript: true, go: true, rust: true },
  { feature: 'Type Safety', python: 'Partial', typescript: true, go: true, rust: true },
  { feature: 'Retry Logic', python: true, typescript: true, go: true, rust: true },
  { feature: 'Carbon-Aware Scheduling', python: true, typescript: true, go: true, rust: false },
  { feature: 'Sovereignty Engine', python: true, typescript: true, go: true, rust: false },
  { feature: 'Framework Integration', python: 'PyTorch/JAX', typescript: 'React/Next.js', go: '—', rust: '—' },
  { feature: 'Package Manager', python: 'pip', typescript: 'npm', go: 'go mod', rust: 'cargo' },
];

/* ─── MAIN COMPONENT ─── */
export default function SdksPageClient() {
  const [activeSdk, setActiveSdk] = useState('typescript');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeSdkData = sdks.find(s => s.id === activeSdk)!;

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
            <p className="section-label mb-6 text-[#8B9DAF]">Developer Tools /0.1</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              SDKs & Libraries
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed">
              Native SDKs for every major language. Install in seconds, deploy your first workload in minutes. Full type safety, async support, and carbon-aware scheduling built in.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SDK SELECTOR + DETAIL
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Choose Your SDK</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              Language SDKs
            </h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          {/* SDK Tabs */}
          <FadeIn>
            <div className="flex flex-wrap gap-2 mb-8">
              {sdks.map((sdk) => (
                <button
                  key={sdk.id}
                  onClick={() => setActiveSdk(sdk.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold border transition-all ${
                    activeSdk === sdk.id
                      ? 'bg-[rgba(255,255,255,0.06)] border-white/15 text-white'
                      : 'border-transparent text-[#999999] hover:text-white hover:bg-[rgba(255,255,255,0.02)]'
                  }`}
                >
                  {sdk.name}
                  {sdk.status === 'coming-soon' && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border border-[rgba(245,158,11,0.2)]">
                      Coming Soon
                    </span>
                  )}
                </button>
              ))}
            </div>
          </FadeIn>

          {/* SDK Detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSdk}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Install & Code */}
                <div className="space-y-6">
                  {/* Installation */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-white">Installation</h3>
                      <button
                        onClick={() => handleCopy(activeSdkData.install)}
                        className="flex items-center gap-1.5 text-[12px] text-[#666666] hover:text-white transition-colors"
                      >
                        {copied ? <CheckCircle2 size={12} className="text-[#10B981]" /> : <Copy size={12} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="bg-[#0D0D0D] border border-white/[0.06] rounded-lg px-5 py-3">
                      <code className="text-[13px] text-[#10B981] font-[family-name:var(--font-space-mono)]">{activeSdkData.install}</code>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-[12px] text-[#666666]">
                      <span>Package: <code className="text-[#999999] font-[family-name:var(--font-space-mono)]">{activeSdkData.package}</code></span>
                      <span className="text-[#333333]">|</span>
                      <span>Version: <code className="text-[#999999] font-[family-name:var(--font-space-mono)]">{activeSdkData.version}</code></span>
                      <span className="text-[#333333]">|</span>
                      <span className={activeSdkData.status === 'stable' ? 'text-[#10B981]' : 'text-[#F59E0B]'}>{activeSdkData.status === 'stable' ? 'Stable' : 'Coming Soon'}</span>
                    </div>
                  </div>

                  {/* Quick Start Code */}
                  <div className="card overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-3 border-b border-white/[0.04]">
                      <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                      <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                      <span className="w-3 h-3 rounded-full bg-[#28CA41]" />
                      <span className="ml-4 text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">quickstart.{activeSdk === 'python' ? 'py' : activeSdk === 'typescript' ? 'ts' : activeSdk === 'go' ? 'go' : 'rs'}</span>
                    </div>
                    <div className="p-6 bg-[#0D0D0D]">
                      <pre className="font-mono text-[12px] leading-[1.8] text-[#CCCCCC] overflow-x-auto whitespace-pre max-h-96 overflow-y-auto">
                        {activeSdkData.quickStart}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Right: Features */}
                <div className="card p-6">
                  <h3 className="text-base font-bold text-white mb-4">Key Features</h3>
                  <div className="accent-line mb-6" />
                  <div className="space-y-3">
                    {activeSdkData.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 py-2">
                        <CheckCircle2 size={14} className="text-[#10B981] mt-0.5 shrink-0" />
                        <span className="text-[14px] text-[#CCCCCC] leading-[1.5]">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/[0.04]">
                    <Link href="/docs/api" className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#8B9DAF] hover:text-white transition-colors">
                      View full API reference <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CLI TOOL
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">CLI Tool</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              HarchOS CLI
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-8">
              The HarchOS command-line interface for deployment, management, and monitoring. Available for macOS, Linux, and Windows.
            </p>
          </FadeIn>

          {/* Installation commands */}
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <div className="card p-5">
                <p className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)] mb-2">macOS</p>
                <code className="text-[13px] text-[#10B981] font-[family-name:var(--font-space-mono)]">brew install harchos/tap/harchos</code>
              </div>
              <div className="card p-5">
                <p className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)] mb-2">Linux</p>
                <code className="text-[13px] text-[#10B981] font-[family-name:var(--font-space-mono)]">curl -fsSL https://get.harchos.ai | sh</code>
              </div>
              <div className="card p-5">
                <p className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)] mb-2">Windows</p>
                <code className="text-[13px] text-[#10B981] font-[family-name:var(--font-space-mono)]">winget install HarchOS.HarchOS</code>
              </div>
            </div>
          </FadeIn>

          {/* Command Reference */}
          <FadeIn>
            <div className="card overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
                <Terminal size={16} className="text-[#8B9DAF]" />
                <h3 className="text-base font-bold text-white">Command Reference</h3>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {cliCommands.map((cmd) => (
                  <div key={cmd.cmd} className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 px-6 py-3 hover:bg-white/[0.01] transition-colors">
                    <code className="text-[13px] text-[#8B9DAF] font-[family-name:var(--font-space-mono)] shrink-0">{cmd.cmd}</code>
                    <span className="text-[12px] text-[#666666]">{cmd.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COMPARISON TABLE
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Feature Comparison</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              SDK Comparison
            </h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <FadeIn>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Python</th>
                      <th>TypeScript</th>
                      <th>Go</th>
                      <th>Rust</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((row) => (
                      <tr key={row.feature}>
                        <td>{row.feature}</td>
                        <td className="font-[family-name:var(--font-space-mono)]">
                          {typeof row.python === 'boolean' ? (
                            row.python ? <CheckCircle2 size={14} className="text-[#10B981]" /> : <span className="text-[#666666]">—</span>
                          ) : (
                            <span className="text-[12px]">{row.python}</span>
                          )}
                        </td>
                        <td className="font-[family-name:var(--font-space-mono)]">
                          {typeof row.typescript === 'boolean' ? (
                            row.typescript ? <CheckCircle2 size={14} className="text-[#10B981]" /> : <span className="text-[#666666]">—</span>
                          ) : (
                            <span className="text-[12px]">{row.typescript}</span>
                          )}
                        </td>
                        <td className="font-[family-name:var(--font-space-mono)]">
                          {typeof row.go === 'boolean' ? (
                            row.go ? <CheckCircle2 size={14} className="text-[#10B981]" /> : <span className="text-[#666666]">—</span>
                          ) : (
                            <span className="text-[12px]">{row.go}</span>
                          )}
                        </td>
                        <td className="font-[family-name:var(--font-space-mono)]">
                          {typeof row.rust === 'boolean' ? (
                            row.rust ? <CheckCircle2 size={14} className="text-[#10B981]" /> : <span className="text-[#666666]">—</span>
                          ) : (
                            <span className="text-[12px]">{row.rust}</span>
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

    </div>
  );
}
