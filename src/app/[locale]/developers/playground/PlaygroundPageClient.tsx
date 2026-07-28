'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import { useTranslations } from 'next-intl';
import {
  ArrowRight, ArrowLeft, Play, Copy, ChevronDown, Key,
  Clock, Shield, Zap, Code2, Terminal, CheckCircle2,
  AlertCircle, Info
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── MAIN COMPONENT ─── */
export default function PlaygroundPageClient() {
  const t = useTranslations('developers');
  const [activeGroup, setActiveGroup] = useState('compute');
  const [activeMethod, setActiveMethod] = useState('POST');
  const [activeCodeTab, setActiveCodeTab] = useState('curl');
  const [urlValue, setUrlValue] = useState('https://api.harchos.com/v1/compute/deploy');
  const [copied, setCopied] = useState(false);

  const apiGroups = [
    { id: 'compute', label: t('playground.apiGroups.0.label'), description: t('playground.apiGroups.0.description') },
    { id: 'data', label: t('playground.apiGroups.1.label'), description: t('playground.apiGroups.1.description') },
    { id: 'models', label: t('playground.apiGroups.2.label'), description: t('playground.apiGroups.2.description') },
    { id: 'operations', label: t('playground.apiGroups.3.label'), description: t('playground.apiGroups.3.description') },
  ];

  const endpoints: Record<string, { method: string; path: string; description: string }[]> = {
    compute: [
      { method: 'POST', path: '/v1/compute/deploy', description: t('playground.endpoints.compute.0') },
      { method: 'GET', path: '/v1/compute/deployments', description: t('playground.endpoints.compute.1') },
      { method: 'GET', path: '/v1/compute/deployments/{id}', description: t('playground.endpoints.compute.2') },
      { method: 'PUT', path: '/v1/compute/deployments/{id}/scale', description: t('playground.endpoints.compute.3') },
      { method: 'DELETE', path: '/v1/compute/deployments/{id}', description: t('playground.endpoints.compute.4') },
      { method: 'POST', path: '/v1/compute/migrate', description: t('playground.endpoints.compute.5') },
    ],
    data: [
      { method: 'POST', path: '/v1/data/upload', description: t('playground.endpoints.data.0') },
      { method: 'GET', path: '/v1/data/datasets', description: t('playground.endpoints.data.1') },
      { method: 'GET', path: '/v1/data/datasets/{id}', description: t('playground.endpoints.data.2') },
      { method: 'DELETE', path: '/v1/data/datasets/{id}', description: t('playground.endpoints.data.3') },
      { method: 'POST', path: '/v1/data/pipelines', description: t('playground.endpoints.data.4') },
    ],
    models: [
      { method: 'POST', path: '/v1/models/register', description: t('playground.endpoints.models.0') },
      { method: 'GET', path: '/v1/models', description: t('playground.endpoints.models.1') },
      { method: 'POST', path: '/v1/models/{id}/infer', description: t('playground.endpoints.models.2') },
      { method: 'POST', path: '/v1/models/{id}/finetune', description: t('playground.endpoints.models.3') },
      { method: 'GET', path: '/v1/models/{id}/versions', description: t('playground.endpoints.models.4') },
    ],
    operations: [
      { method: 'GET', path: '/v1/ops/metrics', description: t('playground.endpoints.operations.0') },
      { method: 'GET', path: '/v1/ops/alerts', description: t('playground.endpoints.operations.1') },
      { method: 'POST', path: '/v1/ops/alerts/rules', description: t('playground.endpoints.operations.2') },
      { method: 'GET', path: '/v1/ops/hubs', description: t('playground.endpoints.operations.3') },
      { method: 'GET', path: '/v1/ops/carbon', description: t('playground.endpoints.operations.4') },
    ],
  };

  const methodColors: Record<string, string> = {
    GET: '#10B981',
    POST: '#8B9DAF',
    PUT: '#F59E0B',
    DELETE: '#EF4444',
  };

  const sampleResponse = {
    id: 'd-7f3a2b1c4e5f',
    status: 'running',
    created_at: '2025-03-15T14:32:00Z',
    hub: {
      name: 'harch-alpha',
      location: 'Dakhla, Morocco',
      energy_source: 'offshore wind',
    },
    gpu: {
      type: 'H100',
      count: 8,
      utilization: 0.87,
      memory_used_gb: 640,
      memory_total_gb: 800,
    },
    networking: {
      endpoint: 'https://mesh.harchos.com/d-7f3a2b1c4e5f',
      latency_ms: 12,
      bandwidth_gbps: 100,
    },
    sustainability: {
      carbon_score: 'A+',
      renewable_percentage: 100,
      co2_saved_kg: 127.4,
    },
  };

  const codeSnippets: Record<string, string> = {
    curl: `curl -X POST https://api.harchos.com/v1/compute/deploy \\
  -H "Authorization: Bearer harch_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "gpu_type": "H100",
    "count": 8,
    "region": "morocco-dakhla",
    "sovereignty": "strict",
    "carbon_aware": true,
    "image": "pytorch/2.2.0-cuda12.1"
  }'`,
    python: `import harchos

client = harchos.Client(
    region="morocco",
    sovereignty="strict",
    carbon_aware=True,
)

job = client.compute.deploy(
    gpu_type="H100",
    count=8,
    region="morocco-dakhla",
    image="pytorch/2.2.0-cuda12.1",
)

print(f"Deployed to {job.hub}")  # → harch-alpha`,
    typescript: `import HarchOS from '@harchos/sdk';

const harch = await HarchOS.create({
  region: 'morocco',
  sovereignty: 'strict',
  carbonAware: true,
});

const job = await harch.compute.deploy({
  gpu: 'H100',
  count: 8,
  region: 'morocco-dakhla',
  image: 'pytorch/2.2.0-cuda12.1',
});

console.log(\`Deployed to \${job.hub}\`); // → harch-alpha`,
    go: `package main

import (
    "fmt"
    "github.com/harchos/sdk-go/pkg/client"
)

func main() {
    client := harchos.NewClient(
        harchos.WithRegion("morocco"),
        harchos.WithSovereignty("strict"),
        harchos.WithCarbonAware(true),
    )

    job, err := client.Compute.Deploy(ctx, &harchos.DeployRequest{
        GPUType: "H100",
        Count:   8,
        Region:  "morocco-dakhla",
        Image:   "pytorch/2.2.0-cuda12.1",
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Deployed to %s\\n", job.Hub)
}`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <Link href="/developers" className="inline-flex items-center gap-2 text-[13px] text-[#666666] hover:text-white transition-colors mb-8">
              <ArrowLeft size={14} /> {t('playground.backToDevelopers')}
            </Link>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="section-label mb-6 text-[#8B9DAF]">{t('playground.heroLabel')}</p>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              {t('playground.heroTitle')}<span className="text-[#8B9DAF]">.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed">
              {t('playground.heroDescription')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PLAYGROUND MAIN
          ═══════════════════════════════════════════ */}
      <section className="pb-28 md:pb-36">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* ─── Left Sidebar: Endpoint Groups ─── */}
              <div className="lg:col-span-3">
                <div className="card p-4 lg:sticky lg:top-24">
                  <p className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-bold mb-4 font-[family-name:var(--font-space-mono)]">{t('playground.apiGroupsLabel')}</p>
                  <div className="space-y-1">
                    {apiGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => { setActiveGroup(group.id); setActiveMethod('POST'); if (group.id === 'compute') setUrlValue('https://api.harchos.com/v1/compute/deploy'); else if (group.id === 'data') setUrlValue('https://api.harchos.com/v1/data/upload'); else if (group.id === 'models') setUrlValue('https://api.harchos.com/v1/models/register'); else setUrlValue('https://api.harchos.com/v1/ops/metrics'); }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all text-[13px] ${
                          activeGroup === group.id
                            ? 'bg-[rgba(139,157,175,0.08)] text-white border border-[rgba(139,157,175,0.15)]'
                            : 'text-[#999999] hover:text-white hover:bg-[rgba(255,255,255,0.02)] border border-transparent'
                        }`}
                      >
                        <span className="font-semibold">{group.label}</span>
                        <p className="text-[11px] text-[#666666] mt-0.5">{group.description}</p>
                      </button>
                    ))}
                  </div>

                  {/* Endpoint List */}
                  <div className="mt-6 pt-6 border-t border-white/[0.04]">
                    <p className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-bold mb-4 font-[family-name:var(--font-space-mono)]">{t('playground.endpointsLabel')}</p>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {endpoints[activeGroup]?.map((ep, i) => (
                        <button
                          key={i}
                          onClick={() => { setActiveMethod(ep.method); setUrlValue(`https://api.harchos.com${ep.path}`); }}
                          className="w-full text-left px-3 py-2 rounded transition-all hover:bg-[rgba(255,255,255,0.03)]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold font-[family-name:var(--font-space-mono)] w-10" style={{ color: methodColors[ep.method] }}>{ep.method}</span>
                            <span className="text-[12px] text-[#CCCCCC] font-[family-name:var(--font-space-mono)] truncate">{ep.path}</span>
                          </div>
                          <p className="text-[10px] text-[#666666] ml-12 truncate">{ep.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Main Content: Request Builder ─── */}
              <div className="lg:col-span-9 space-y-6">

                {/* Request Builder */}
                <div className="card overflow-hidden">
                  {/* URL Bar */}
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.04] bg-[rgba(255,255,255,0.02)]">
                    <div className="relative">
                      <select
                        value={activeMethod}
                        onChange={(e) => setActiveMethod(e.target.value)}
                        className="appearance-none bg-transparent text-[12px] font-bold font-[family-name:var(--font-space-mono)] px-3 py-1.5 rounded border border-white/[0.08] pr-7 cursor-pointer focus:outline-none focus:border-[#8B9DAF]/50"
                        style={{ color: methodColors[activeMethod] }}
                      >
                        <option value="GET" className="bg-[#1E1E1E]">GET</option>
                        <option value="POST" className="bg-[#1E1E1E]">POST</option>
                        <option value="PUT" className="bg-[#1E1E1E]">PUT</option>
                        <option value="DELETE" className="bg-[#1E1E1E]">DELETE</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" />
                    </div>
                    <input
                      type="text"
                      value={urlValue}
                      onChange={(e) => setUrlValue(e.target.value)}
                      className="flex-1 bg-transparent text-[13px] text-white font-[family-name:var(--font-space-mono)] focus:outline-none placeholder:text-[#444444]"
                      placeholder={t('playground.urlPlaceholder')}
                    />
                    <button className="inline-flex items-center gap-2 bg-[#8B9DAF] text-black px-5 py-2 rounded-lg text-[12px] font-bold hover:bg-[#8B9DAF]/90 transition-all">
                      <Play size={12} /> {t('playground.send')}
                    </button>
                  </div>

                  {/* Tabs: Headers / Body / Auth */}
                  <div className="border-b border-white/[0.04]">
                    <div className="flex px-6">
                      {[t('playground.headers'), t('playground.body'), t('playground.auth')].map((tab, idx) => (
                        <button
                          key={tab}
                          className="px-4 py-3 text-[12px] font-semibold text-[#999999] hover:text-white border-b-2 border-transparent transition-all first:border-b-2 first:border-[#8B9DAF] first:text-white"
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Headers Editor */}
                  <div className="p-6">
                    <p className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-bold mb-4 font-[family-name:var(--font-space-mono)]">{t('playground.requestHeaders')}</p>
                    <div className="space-y-3">
                      {[
                        { key: 'Authorization', value: 'Bearer harch_sk_••••••••••••••••' },
                        { key: 'Content-Type', value: 'application/json' },
                        { key: 'X-Sovereignty', value: 'strict' },
                        { key: 'X-Carbon-Aware', value: 'true' },
                      ].map((header) => (
                        <div key={header.key} className="flex items-center gap-3">
                          <input
                            type="text"
                            defaultValue={header.key}
                            readOnly
                            className="w-1/3 bg-[rgba(255,255,255,0.03)] border border-white/[0.06] rounded px-3 py-2 text-[12px] text-[#999999] font-[family-name:var(--font-space-mono)] focus:outline-none"
                          />
                          <input
                            type="text"
                            defaultValue={header.value}
                            readOnly
                            className="flex-1 bg-[rgba(255,255,255,0.03)] border border-white/[0.06] rounded px-3 py-2 text-[12px] text-[#CCCCCC] font-[family-name:var(--font-space-mono)] focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-bold mt-8 mb-4 font-[family-name:var(--font-space-mono)]">{t('playground.requestBody')}</p>
                    <div className="bg-[rgba(0,0,0,0.3)] rounded-lg p-5 font-mono text-[13px] leading-[1.9] border border-white/[0.04]">
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
                </div>

                {/* Response */}
                <div className="card overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04] bg-[rgba(255,255,255,0.02)]">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] font-[family-name:var(--font-space-mono)]">200 OK</span>
                      <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)] flex items-center gap-1.5"><Clock size={10} /> 12ms</span>
                      <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">1.2 KB</span>
                    </div>
                    <button onClick={handleCopy} className="inline-flex items-center gap-1.5 text-[11px] text-[#999999] hover:text-white transition-colors">
                      {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                      {copied ? t('playground.copied') : t('playground.copy')}
                    </button>
                  </div>
                  <div className="p-6 font-mono text-[12px] leading-[1.8] max-h-80 overflow-y-auto">
                    <pre className="text-[#CCCCCC]">{JSON.stringify(sampleResponse, null, 2)}</pre>
                  </div>
                </div>

                {/* Authentication */}
                <div className="card p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(139,157,175,0.08)] flex items-center justify-center">
                      <Key size={18} className="text-[#8B9DAF]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{t('playground.authTitle')}</h3>
                  </div>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-6">
                    {t('playground.authDescription')}
                  </p>
                  <div className="bg-[rgba(0,0,0,0.3)] rounded-lg p-4 font-mono text-[13px] border border-white/[0.04]">
                    <p><span className="text-[#E06C75]">Authorization</span>: <span className="text-[#98C379]">Bearer harch_sk_your_api_key_here</span></p>
                  </div>
                  <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-[rgba(139,157,175,0.04)] border border-[rgba(139,157,175,0.1)]">
                    <Info size={14} className="text-[#8B9DAF] mt-0.5 shrink-0" />
                    <p className="text-[12px] text-[#999999]">{t('playground.authWarning')}</p>
                  </div>
                </div>

                {/* Code Generation */}
                <div className="card overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.04] bg-[rgba(255,255,255,0.02)]">
                    <Code2 size={16} className="text-[#8B9DAF]" />
                    <span className="text-[13px] font-semibold text-white">{t('playground.codeGenTitle')}</span>
                  </div>
                  <div className="flex border-b border-white/[0.04]">
                    {['curl', 'python', 'typescript', 'go'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveCodeTab(lang)}
                        className={`px-5 py-3 text-[12px] font-semibold capitalize transition-all ${
                          activeCodeTab === lang
                            ? 'text-white border-b-2 border-[#8B9DAF]'
                            : 'text-[#666666] hover:text-[#999999]'
                        }`}
                      >
                        {lang === 'typescript' ? 'TypeScript' : lang === 'python' ? 'Python' : lang === 'curl' ? 'cURL' : 'Go'}
                      </button>
                    ))}
                  </div>
                  <div className="p-6 font-mono text-[12px] leading-[1.8] max-h-72 overflow-y-auto">
                    <pre className="text-[#CCCCCC] whitespace-pre-wrap">{codeSnippets[activeCodeTab]}</pre>
                  </div>
                </div>

                {/* Rate Limits */}
                <div className="card p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(245,158,11,0.08)] flex items-center justify-center">
                      <Zap size={18} className="text-[#F59E0B]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{t('playground.rateLimitsTitle')}</h3>
                  </div>
                  <div className="accent-line mb-6" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      { tier: t('playground.rateLimits.0.tier'), limit: t('playground.rateLimits.0.limit'), burst: t('playground.rateLimits.0.burst') },
                      { tier: t('playground.rateLimits.1.tier'), limit: t('playground.rateLimits.1.limit'), burst: t('playground.rateLimits.1.burst') },
                      { tier: t('playground.rateLimits.2.tier'), limit: t('playground.rateLimits.2.limit'), burst: t('playground.rateLimits.2.burst') },
                    ].map((rate) => (
                      <div key={rate.tier} className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/[0.04]">
                        <p className="text-[13px] font-bold text-white mb-2">{rate.tier}</p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-[11px] text-[#666666]">{t('playground.rateLimitLabel')}</span>
                            <span className="text-[11px] text-[#CCCCCC] font-[family-name:var(--font-space-mono)]">{rate.limit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[11px] text-[#666666]">{t('playground.burstLabel')}</span>
                            <span className="text-[11px] text-[#CCCCCC] font-[family-name:var(--font-space-mono)]">{rate.burst}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[12px] text-[#666666] mt-4">
                    {t('playground.rateLimitsDescription')}
                  </p>
                </div>

              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
