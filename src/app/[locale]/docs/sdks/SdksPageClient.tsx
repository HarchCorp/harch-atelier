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
import { useTranslations } from 'next-intl';

/* ─── MAIN COMPONENT ─── */
export default function SdksPageClient() {
  const t = useTranslations('docs');
  const [activeSdk, setActiveSdk] = useState('typescript');
  const [copied, setCopied] = useState(false);

  const sdks = [
    {
      id: 'python',
      name: t('sdks.items.0.name'),
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
        t('sdks.items.0.features.0'),
        t('sdks.items.0.features.1'),
        t('sdks.items.0.features.2'),
        t('sdks.items.0.features.3'),
        t('sdks.items.0.features.4'),
        t('sdks.items.0.features.5'),
      ],
    },
    {
      id: 'typescript',
      name: t('sdks.items.1.name'),
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
        t('sdks.items.1.features.0'),
        t('sdks.items.1.features.1'),
        t('sdks.items.1.features.2'),
        t('sdks.items.1.features.3'),
        t('sdks.items.1.features.4'),
        t('sdks.items.1.features.5'),
      ],
    },
    {
      id: 'go',
      name: t('sdks.items.2.name'),
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
        t('sdks.items.2.features.0'),
        t('sdks.items.2.features.1'),
        t('sdks.items.2.features.2'),
        t('sdks.items.2.features.3'),
        t('sdks.items.2.features.4'),
        t('sdks.items.2.features.5'),
      ],
    },
    {
      id: 'rust',
      name: t('sdks.items.3.name'),
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
        t('sdks.items.3.features.0'),
        t('sdks.items.3.features.1'),
        t('sdks.items.3.features.2'),
        t('sdks.items.3.features.3'),
        t('sdks.items.3.features.4'),
        t('sdks.items.3.features.5'),
      ],
    },
  ];

  const cliCommands = [
    { cmd: 'harchos auth login', desc: t('sdks.cliCommands.0.desc') },
    { cmd: 'harchos workloads list', desc: t('sdks.cliCommands.1.desc') },
    { cmd: 'harchos workloads deploy --gpu H100 --count 8', desc: t('sdks.cliCommands.2.desc') },
    { cmd: 'harchos workloads scale <id> --count 16', desc: t('sdks.cliCommands.3.desc') },
    { cmd: 'harchos models deploy <model> --hub dakhla', desc: t('sdks.cliCommands.4.desc') },
    { cmd: 'harchos hubs status', desc: t('sdks.cliCommands.5.desc') },
    { cmd: 'harchos energy report', desc: t('sdks.cliCommands.6.desc') },
    { cmd: 'harchos logs tail <workload-id>', desc: t('sdks.cliCommands.7.desc') },
  ];

  const comparisonFeatures = [
    { feature: t('sdks.comparison.0.feature'), python: true, typescript: true, go: true, rust: true },
    { feature: t('sdks.comparison.1.feature'), python: true, typescript: true, go: true, rust: true },
    { feature: t('sdks.comparison.2.feature'), python: true, typescript: true, go: true, rust: false },
    { feature: t('sdks.comparison.3.feature'), python: true, typescript: true, go: true, rust: true },
    { feature: t('sdks.comparison.4.feature'), python: t('sdks.comparison.4.python'), typescript: true, go: true, rust: true },
    { feature: t('sdks.comparison.5.feature'), python: true, typescript: true, go: true, rust: true },
    { feature: t('sdks.comparison.6.feature'), python: true, typescript: true, go: true, rust: false },
    { feature: t('sdks.comparison.7.feature'), python: true, typescript: true, go: true, rust: false },
    { feature: t('sdks.comparison.8.feature'), python: t('sdks.comparison.8.python'), typescript: t('sdks.comparison.8.typescript'), go: t('sdks.comparison.8.go'), rust: t('sdks.comparison.8.rust') },
    { feature: t('sdks.comparison.9.feature'), python: t('sdks.comparison.9.python'), typescript: t('sdks.comparison.9.typescript'), go: t('sdks.comparison.9.go'), rust: t('sdks.comparison.9.rust') },
  ];

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
            <p className="section-label mb-6 text-[#8B9DAF]">{t('sdks.hero.label')}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              {t('sdks.title')}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed">
              {t('sdks.description')}
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('sdks.chooseSdk.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('sdks.chooseSdk.title')}
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
                      {t('sdks.comingSoon')}
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
                      <h3 className="text-base font-bold text-white">{t('sdks.installation')}</h3>
                      <button
                        onClick={() => handleCopy(activeSdkData.install)}
                        className="flex items-center gap-1.5 text-[12px] text-[#666666] hover:text-white transition-colors"
                      >
                        {copied ? <CheckCircle2 size={12} className="text-[#10B981]" /> : <Copy size={12} />}
                        {copied ? t('sdks.copied') : t('sdks.copy')}
                      </button>
                    </div>
                    <div className="bg-[#0D0D0D] border border-white/[0.06] rounded-lg px-5 py-3">
                      <code className="text-[13px] text-[#10B981] font-[family-name:var(--font-space-mono)]">{activeSdkData.install}</code>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-[12px] text-[#666666]">
                      <span>{t('sdks.package')}: <code className="text-[#999999] font-[family-name:var(--font-space-mono)]">{activeSdkData.package}</code></span>
                      <span className="text-[#333333]">|</span>
                      <span>{t('sdks.versionLabel')}: <code className="text-[#999999] font-[family-name:var(--font-space-mono)]">{activeSdkData.version}</code></span>
                      <span className="text-[#333333]">|</span>
                      <span className={activeSdkData.status === 'stable' ? 'text-[#10B981]' : 'text-[#F59E0B]'}>{activeSdkData.status === 'stable' ? t('sdks.stable') : t('sdks.comingSoon')}</span>
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
                  <h3 className="text-base font-bold text-white mb-4">{t('sdks.keyFeatures')}</h3>
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
                      {t('sdks.viewApiReference')} <ArrowRight size={14} />
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('sdks.cli.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('sdks.cli.title')}
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-8">
              {t('sdks.cli.description')}
            </p>
          </FadeIn>

          {/* Installation commands */}
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <div className="card p-5">
                <p className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)] mb-2">{t('sdks.osLabels.macos')}</p>
                <code className="text-[13px] text-[#10B981] font-[family-name:var(--font-space-mono)]">brew install harchos/tap/harchos</code>
              </div>
              <div className="card p-5">
                <p className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)] mb-2">{t('sdks.osLabels.linux')}</p>
                <code className="text-[13px] text-[#10B981] font-[family-name:var(--font-space-mono)]">curl -fsSL https://get.harchos.ai | sh</code>
              </div>
              <div className="card p-5">
                <p className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)] mb-2">{t('sdks.osLabels.windows')}</p>
                <code className="text-[13px] text-[#10B981] font-[family-name:var(--font-space-mono)]">winget install HarchOS.HarchOS</code>
              </div>
            </div>
          </FadeIn>

          {/* Command Reference */}
          <FadeIn>
            <div className="card overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
                <Terminal size={16} className="text-[#8B9DAF]" />
                <h3 className="text-base font-bold text-white">{t('sdks.cli.commandReference')}</h3>
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('sdks.comparison.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('sdks.comparison.title')}
            </h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <FadeIn>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('sdks.comparison.table.feature')}</th>
                      <th>{t('sdks.comparison.table.python')}</th>
                      <th>{t('sdks.comparison.table.typescript')}</th>
                      <th>{t('sdks.comparison.table.go')}</th>
                      <th>{t('sdks.comparison.table.rust')}</th>
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
