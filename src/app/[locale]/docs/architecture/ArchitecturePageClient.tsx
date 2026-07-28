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
import { useTranslations } from 'next-intl';

/* ─── MAIN COMPONENT ─── */
export default function ArchitecturePageClient() {
  const t = useTranslations('docs');
  const [activeLayer, setActiveLayer] = useState('sense');

  const architectureLayers = [
    {
      id: 'sense',
      name: 'SENSE',
      tag: t('architecture.layers.sense.tag'),
      icon: Eye,
      color: '#8B9DAF',
      description: t('architecture.layers.sense.description'),
      capabilities: [
        t('architecture.layers.sense.capabilities.0'),
        t('architecture.layers.sense.capabilities.1'),
        t('architecture.layers.sense.capabilities.2'),
        t('architecture.layers.sense.capabilities.3'),
        t('architecture.layers.sense.capabilities.4'),
        t('architecture.layers.sense.capabilities.5'),
      ],
      specs: [
        { label: t('architecture.layers.sense.specs.0.label'), value: t('architecture.layers.sense.specs.0.value') },
        { label: t('architecture.layers.sense.specs.1.label'), value: t('architecture.layers.sense.specs.1.value') },
        { label: t('architecture.layers.sense.specs.2.label'), value: t('architecture.layers.sense.specs.2.value') },
        { label: t('architecture.layers.sense.specs.3.label'), value: t('architecture.layers.sense.specs.3.value') },
      ],
    },
    {
      id: 'think',
      name: 'THINK',
      tag: t('architecture.layers.think.tag'),
      icon: Brain,
      color: '#8B5CF6',
      description: t('architecture.layers.think.description'),
      capabilities: [
        t('architecture.layers.think.capabilities.0'),
        t('architecture.layers.think.capabilities.1'),
        t('architecture.layers.think.capabilities.2'),
        t('architecture.layers.think.capabilities.3'),
        t('architecture.layers.think.capabilities.4'),
        t('architecture.layers.think.capabilities.5'),
      ],
      specs: [
        { label: t('architecture.layers.think.specs.0.label'), value: t('architecture.layers.think.specs.0.value') },
        { label: t('architecture.layers.think.specs.1.label'), value: t('architecture.layers.think.specs.1.value') },
        { label: t('architecture.layers.think.specs.2.label'), value: t('architecture.layers.think.specs.2.value') },
        { label: t('architecture.layers.think.specs.3.label'), value: t('architecture.layers.think.specs.3.value') },
      ],
    },
    {
      id: 'act',
      name: 'ACT',
      tag: t('architecture.layers.act.tag'),
      icon: Zap,
      color: '#10B981',
      description: t('architecture.layers.act.description'),
      capabilities: [
        t('architecture.layers.act.capabilities.0'),
        t('architecture.layers.act.capabilities.1'),
        t('architecture.layers.act.capabilities.2'),
        t('architecture.layers.act.capabilities.3'),
        t('architecture.layers.act.capabilities.4'),
        t('architecture.layers.act.capabilities.5'),
      ],
      specs: [
        { label: t('architecture.layers.act.specs.0.label'), value: t('architecture.layers.act.specs.0.value') },
        { label: t('architecture.layers.act.specs.1.label'), value: t('architecture.layers.act.specs.1.value') },
        { label: t('architecture.layers.act.specs.2.label'), value: t('architecture.layers.act.specs.2.value') },
        { label: t('architecture.layers.act.specs.3.label'), value: t('architecture.layers.act.specs.3.value') },
      ],
    },
  ];

  const activeLayerData = architectureLayers.find(l => l.id === activeLayer)!;

  const referenceArchitectures = [
    {
      title: t('architecture.referenceArchs.0.title'),
      desc: t('architecture.referenceArchs.0.desc'),
      icon: Shield,
      accent: '#8B9DAF',
      components: [
        t('architecture.referenceArchs.0.components.0'),
        t('architecture.referenceArchs.0.components.1'),
        t('architecture.referenceArchs.0.components.2'),
        t('architecture.referenceArchs.0.components.3'),
        t('architecture.referenceArchs.0.components.4'),
        t('architecture.referenceArchs.0.components.5'),
      ],
      useCase: t('architecture.referenceArchs.0.useCase'),
    },
    {
      title: t('architecture.referenceArchs.1.title'),
      desc: t('architecture.referenceArchs.1.desc'),
      icon: Radio,
      accent: '#8B5CF6',
      components: [
        t('architecture.referenceArchs.1.components.0'),
        t('architecture.referenceArchs.1.components.1'),
        t('architecture.referenceArchs.1.components.2'),
        t('architecture.referenceArchs.1.components.3'),
        t('architecture.referenceArchs.1.components.4'),
        t('architecture.referenceArchs.1.components.5'),
      ],
      useCase: t('architecture.referenceArchs.1.useCase'),
    },
    {
      title: t('architecture.referenceArchs.2.title'),
      desc: t('architecture.referenceArchs.2.desc'),
      icon: Network,
      accent: '#10B981',
      components: [
        t('architecture.referenceArchs.2.components.0'),
        t('architecture.referenceArchs.2.components.1'),
        t('architecture.referenceArchs.2.components.2'),
        t('architecture.referenceArchs.2.components.3'),
        t('architecture.referenceArchs.2.components.4'),
        t('architecture.referenceArchs.2.components.5'),
      ],
      useCase: t('architecture.referenceArchs.2.useCase'),
    },
    {
      title: t('architecture.referenceArchs.3.title'),
      desc: t('architecture.referenceArchs.3.desc'),
      icon: Cloud,
      accent: '#F59E0B',
      components: [
        t('architecture.referenceArchs.3.components.0'),
        t('architecture.referenceArchs.3.components.1'),
        t('architecture.referenceArchs.3.components.2'),
        t('architecture.referenceArchs.3.components.3'),
        t('architecture.referenceArchs.3.components.4'),
        t('architecture.referenceArchs.3.components.5'),
      ],
      useCase: t('architecture.referenceArchs.3.useCase'),
    },
  ];

  const pillars = [
    {
      name: t('architecture.pillars.0.name'),
      icon: Lock,
      accent: '#EF4444',
      description: t('architecture.pillars.0.description'),
      principles: [
        t('architecture.pillars.0.principles.0'),
        t('architecture.pillars.0.principles.1'),
        t('architecture.pillars.0.principles.2'),
        t('architecture.pillars.0.principles.3'),
        t('architecture.pillars.0.principles.4'),
      ],
    },
    {
      name: t('architecture.pillars.1.name'),
      icon: Shield,
      accent: '#8B9DAF',
      description: t('architecture.pillars.1.description'),
      principles: [
        t('architecture.pillars.1.principles.0'),
        t('architecture.pillars.1.principles.1'),
        t('architecture.pillars.1.principles.2'),
        t('architecture.pillars.1.principles.3'),
        t('architecture.pillars.1.principles.4'),
      ],
    },
    {
      name: t('architecture.pillars.2.name'),
      icon: Gauge,
      accent: '#8B5CF6',
      description: t('architecture.pillars.2.description'),
      principles: [
        t('architecture.pillars.2.principles.0'),
        t('architecture.pillars.2.principles.1'),
        t('architecture.pillars.2.principles.2'),
        t('architecture.pillars.2.principles.3'),
        t('architecture.pillars.2.principles.4'),
      ],
    },
    {
      name: t('architecture.pillars.3.name'),
      icon: Leaf,
      accent: '#10B981',
      description: t('architecture.pillars.3.description'),
      principles: [
        t('architecture.pillars.3.principles.0'),
        t('architecture.pillars.3.principles.1'),
        t('architecture.pillars.3.principles.2'),
        t('architecture.pillars.3.principles.3'),
        t('architecture.pillars.3.principles.4'),
      ],
    },
    {
      name: t('architecture.pillars.4.name'),
      icon: Activity,
      accent: '#F59E0B',
      description: t('architecture.pillars.4.description'),
      principles: [
        t('architecture.pillars.4.principles.0'),
        t('architecture.pillars.4.principles.1'),
        t('architecture.pillars.4.principles.2'),
        t('architecture.pillars.4.principles.3'),
        t('architecture.pillars.4.principles.4'),
      ],
    },
  ];

  const designPatterns = [
    {
      name: t('architecture.designPatterns.0.name'),
      desc: t('architecture.designPatterns.0.desc'),
      category: t('architecture.designPatterns.0.category'),
    },
    {
      name: t('architecture.designPatterns.1.name'),
      desc: t('architecture.designPatterns.1.desc'),
      category: t('architecture.designPatterns.1.category'),
    },
    {
      name: t('architecture.designPatterns.2.name'),
      desc: t('architecture.designPatterns.2.desc'),
      category: t('architecture.designPatterns.2.category'),
    },
    {
      name: t('architecture.designPatterns.3.name'),
      desc: t('architecture.designPatterns.3.desc'),
      category: t('architecture.designPatterns.3.category'),
    },
    {
      name: t('architecture.designPatterns.4.name'),
      desc: t('architecture.designPatterns.4.desc'),
      category: t('architecture.designPatterns.4.category'),
    },
    {
      name: t('architecture.designPatterns.5.name'),
      desc: t('architecture.designPatterns.5.desc'),
      category: t('architecture.designPatterns.5.category'),
    },
  ];

  const bestPractices = [
    {
      title: t('architecture.bestPractices.0.title'),
      desc: t('architecture.bestPractices.0.desc'),
    },
    {
      title: t('architecture.bestPractices.1.title'),
      desc: t('architecture.bestPractices.1.desc'),
    },
    {
      title: t('architecture.bestPractices.2.title'),
      desc: t('architecture.bestPractices.2.desc'),
    },
    {
      title: t('architecture.bestPractices.3.title'),
      desc: t('architecture.bestPractices.3.desc'),
    },
    {
      title: t('architecture.bestPractices.4.title'),
      desc: t('architecture.bestPractices.4.desc'),
    },
    {
      title: t('architecture.bestPractices.5.title'),
      desc: t('architecture.bestPractices.5.desc'),
    },
  ];

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
            <p className="section-label mb-6 text-[#8B9DAF]">{t('architecture.hero.label')}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              {t('architecture.title')}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-8">
              {t('architecture.description')}
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap gap-3">
              <Link href="/docs/quickstarts" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                {t('architecture.tryQuickstart')} <ArrowRight size={14} />
              </Link>
              <Link href="/docs/api" className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('architecture.apiReference')}
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('architecture.overview.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('architecture.overview.title')}
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              {t('architecture.overview.description')}
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
                <h4 className="text-[12px] text-[#666666] uppercase tracking-[0.15em] font-bold mb-3">{t('architecture.keyCapabilities')}</h4>
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
                <h4 className="text-[12px] text-[#666666] uppercase tracking-[0.15em] font-bold mb-4">{t('architecture.techSpecs')}</h4>
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
                    <span className="text-[#8B9DAF] font-semibold">{t('architecture.dataFlow.title')}:</span> {activeLayer === 'sense' ? t('architecture.dataFlow.sense') : activeLayer === 'think' ? t('architecture.dataFlow.think') : t('architecture.dataFlow.act')}
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('architecture.referenceArchs.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('architecture.referenceArchs.title')}
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              {t('architecture.referenceArchs.description')}
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
                  <h4 className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-bold mb-3">{t('architecture.components')}</h4>
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
                      <span className="text-[#999999] font-semibold">{t('architecture.bestFor')}:</span> {arch.useCase}
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('architecture.framework.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('architecture.framework.title')}
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              {t('architecture.framework.description')}
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
                      <h4 className="text-[11px] text-[#666666] uppercase tracking-[0.15em] font-bold mb-3">{t('architecture.designPrinciples')}</h4>
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('architecture.designPatterns.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('architecture.designPatterns.title')}
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              {t('architecture.designPatterns.description')}
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('architecture.bestPractices.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('architecture.bestPractices.title')}
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
