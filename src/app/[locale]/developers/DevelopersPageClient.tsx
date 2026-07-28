'use client';

import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import { useTranslations } from 'next-intl';
import {
  ArrowRight, Terminal, Code2, Package, Layout, FlaskConical,
  Activity, Github, MessageCircle, BookOpen, Zap, Key,
  Shield, Clock, BarChart3, CheckCircle2, Star, GitBranch,
  ExternalLink, Users, ChevronRight, Box, Cpu, Cloud, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── MAIN COMPONENT ─── */
export default function DevelopersPageClient() {
  const t = useTranslations('developers');

  const quickStartSteps = [
    {
      step: '01',
      title: t('quickStart.0.title'),
      description: t('quickStart.0.description'),
      icon: Users,
      color: '#8B9DAF',
    },
    {
      step: '02',
      title: t('quickStart.1.title'),
      description: t('quickStart.1.description'),
      icon: Key,
      color: '#8B5CF6',
    },
    {
      step: '03',
      title: t('quickStart.2.title'),
      description: t('quickStart.2.description'),
      icon: Zap,
      color: '#10B981',
    },
  ];

  const developerTools = [
    {
      icon: Terminal,
      title: t('tools.0.title'),
      description: t('tools.0.description'),
      tags: [t('tools.0.tags.0'), t('tools.0.tags.1'), t('tools.0.tags.2')],
      color: '#8B9DAF',
    },
    {
      icon: Code2,
      title: t('tools.1.title'),
      description: t('tools.1.description'),
      tags: [t('tools.1.tags.0'), t('tools.1.tags.1'), t('tools.1.tags.2'), t('tools.1.tags.3')],
      color: '#8B5CF6',
    },
    {
      icon: Layout,
      title: t('tools.2.title'),
      description: t('tools.2.description'),
      tags: [t('tools.2.tags.0'), t('tools.2.tags.1'), t('tools.2.tags.2')],
      color: '#10B981',
    },
    {
      icon: FlaskConical,
      title: t('tools.3.title'),
      description: t('tools.3.description'),
      tags: [t('tools.3.tags.0'), t('tools.3.tags.1'), t('tools.3.tags.2')],
      color: '#F59E0B',
    },
    {
      icon: Activity,
      title: t('tools.4.title'),
      description: t('tools.4.description'),
      tags: [t('tools.4.tags.0'), t('tools.4.tags.1'), t('tools.4.tags.2')],
      color: '#EF4444',
    },
  ];

  const dxMetrics = [
    { label: t('dxMetrics.0.label'), value: t('dxMetrics.0.value'), sublabel: t('dxMetrics.0.sublabel'), icon: Clock, color: '#8B9DAF' },
    { label: t('dxMetrics.1.label'), value: t('dxMetrics.1.value'), sublabel: t('dxMetrics.1.sublabel'), icon: BarChart3, color: '#8B5CF6' },
    { label: t('dxMetrics.2.label'), value: t('dxMetrics.2.value'), sublabel: t('dxMetrics.2.sublabel'), icon: BookOpen, color: '#10B981' },
    { label: t('dxMetrics.3.label'), value: t('dxMetrics.3.value'), sublabel: t('dxMetrics.3.sublabel'), icon: Zap, color: '#F59E0B' },
  ];

  const openSourceProjects = [
    { name: 'harchos-sdk-python', description: t('openSourceProjects.0.description'), githubUrl: '', language: 'Python', languageColor: '#3572A5', comingSoon: true },
    { name: 'harchos-sdk-js', description: t('openSourceProjects.1.description'), githubUrl: '', language: 'TypeScript', languageColor: '#2B7489', comingSoon: true },
    { name: 'harchos-cli', description: t('openSourceProjects.2.description'), githubUrl: '', language: 'Go', languageColor: '#00ADD8', comingSoon: true },
    { name: 'harchos-terraform-provider', description: t('openSourceProjects.3.description'), githubUrl: '', language: 'Go', languageColor: '#00ADD8', comingSoon: true },
  ];

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
            <p className="section-label mb-6 text-[#8B9DAF]">{t('heroLabel')}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[88px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              {t('heroTitle1')}<br/>{t('heroTitle2')}<span className="text-[#8B9DAF]">.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-4">
              {t('heroSubtitle')}
            </p>
            <p className="text-[15px] text-[#999999] max-w-xl leading-[1.7] mb-10">
              {t('heroDescription')}
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link href="/developers/playground" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all">
                {t('heroButton1')} <ArrowRight size={14} />
              </Link>
              <Link href="/developers/open-source" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                <Github size={16} /> {t('heroButton2')}
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('quickStartLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              {t('quickStartTitle1')}<br/>{t('quickStartTitle2')}
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              {t('quickStartDescription')}
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
                    <span className="text-[11px] font-bold font-[family-name:var(--font-space-mono)] text-[#666666]">{t('stepLabel')} {step.step}</span>
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
                <span className="ml-4 text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">{t('terminalLabel')}</span>
              </div>
              <div className="p-6 font-mono text-[13px] leading-[2]">
                <p><span className="text-[#999999]">$</span> <span className="text-[#8B9DAF]">pip install</span> <span className="text-[#98C379]">harchos</span></p>
                <p className="text-[#666666]">  {t('terminal.installSuccess')}</p>
                <p><span className="text-[#999999]">$</span> <span className="text-[#8B9DAF]">harchos</span> <span className="text-[#98C379]">--api-key hsk_... carbon MA</span></p>
                <p className="text-[#666666]">  {t('terminal.carbonOutput')}</p>
                <p><span className="text-[#999999]">$</span> <span className="text-[#8B9DAF]">harchos</span> <span className="text-[#98C379]">hubs</span></p>
                <p className="text-[#666666]">  {t('terminal.hubsOutput')}</p>
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
                    <h3 className="text-lg font-bold text-white">{t('pythonSdkTitle')}</h3>
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
                    <h3 className="text-lg font-bold text-white">{t('typescriptSdkTitle')}</h3>
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('toolsLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              {t('toolsTitle1')}<br/>{t('toolsTitle2')}
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              {t('toolsDescription')}
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('playground.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              {t('playground.title')}<span className="text-[#8B9DAF]">.</span>
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              {t('playground.description')}
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
                <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)] ml-auto">{t('playground.apiVersion')}</span>
              </div>

              {/* Request/Response Split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.04]">
                {/* Request */}
                <div className="p-6">
                  <p className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-bold mb-4 font-[family-name:var(--font-space-mono)]">{t('playground.requestBody')}</p>
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
                  {t('playground.openFull')} <ChevronRight size={14} />
                </Link>
                <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">{t('playground.noAuthRequired')}</span>
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
                <p className="section-label mb-4 text-[#8B9DAF]">{t('codeExampleLabel')}</p>
                <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-6">
                  {t('codeExampleTitle1')}<br/>{t('codeExampleTitle2')}<span className="text-[#8B9DAF]">.</span>
                </h2>
                <div className="accent-line mb-6" />
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-8">
                  {t('codeExampleDescription')}
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Shield, text: t('codeFeatures.0') },
                    { icon: Zap, text: t('codeFeatures.1') },
                    { icon: Activity, text: t('codeFeatures.2') },
                    { icon: CheckCircle2, text: t('codeFeatures.3') },
                    { icon: BarChart3, text: t('codeFeatures.4') },
                    { icon: Globe, text: t('codeFeatures.5') },
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('dxMetricsLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              {t('dxMetricsTitle1')}<br/>{t('dxMetricsTitle2')}<span className="text-[#8B9DAF]">.</span>
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              {t('dxMetricsDescription')}
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('openSource.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              {t('openSource.title1')}<br/>{t('openSource.title2')}<span className="text-[#8B9DAF]">.</span>
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              {t('openSource.description')}
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
                {t('openSource.viewAll')} <ArrowRight size={14} />
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('community.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('community.title')}<span className="text-[#8B9DAF]">.</span>
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              {t('community.description')}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: MessageCircle,
                title: t('community.0.title'),
                description: t('community.0.description'),
                members: t('community.0.members'),
                link: 'Coming soon',
                color: '#5865F2',
              },
              {
                icon: Github,
                title: t('community.1.title'),
                description: t('community.1.description'),
                members: t('community.1.members'),
                link: 'Coming soon',
                color: '#FFFFFF',
              },
              {
                icon: BookOpen,
                title: t('community.2.title'),
                description: t('community.2.description'),
                members: t('community.2.members'),
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
                  <p className="text-[11px] text-[#8B9DAF] font-[family-name:var(--font-space-mono)] mb-3">{community.members} {t('community.membersLabel')}</p>
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
            <p className="section-label mb-6 text-[#8B9DAF]">{t('cta.label')}</p>
            <h2 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('cta.title1')}<br/>{t('cta.title2')}<span className="text-[#8B9DAF]">.</span>
            </h2>
            <p className="text-[16px] text-[#999999] max-w-lg mx-auto leading-[1.7] mb-10">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/developers/playground" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all">
                {t('cta.button1')} <ArrowRight size={14} />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('cta.button2')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
