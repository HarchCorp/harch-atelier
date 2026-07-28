'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Shield,
  Lock,
  Server,
  Factory,
  Zap,
  Cpu,
  Mountain,
  Wheat,
  Droplets,
  Landmark,
  CheckCircle2,
  Building2,
  Users,
  Globe,
  Clock,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/components/ui/motion';

const verticals = [
  {
    id: 'intelligence',
    name: 'Harch Intelligence',
    slug: 'intelligence',
    icon: Server,
    version: '/0.1',
    stat: '1,798 GPUs ',
    desc: 'AI-GPU compute infrastructure, sovereign data centers, and national intelligence platforms.',
    capabilities: ['GPU Clusters', 'AI Training', 'Inference at Scale', 'Sovereign Cloud'],
  },
  {
    id: 'cement',
    name: 'Harch Cement',
    slug: 'cement',
    icon: Factory,
    version: '/0.2',
    stat: '500kT/yr',
    desc: 'Integrated cement production with predictive AI optimization and regional supply chain dominance.',
    capabilities: ['Clinker Production', 'AI-Optimized Kilns', 'Regional Distribution', 'Green Cement'],
  },
  {
    id: 'energy',
    name: 'Harch Energy',
    slug: 'energy',
    icon: Zap,
    version: '/0.3',
    stat: '2GW+',
    desc: 'Solar, wind, and hybrid energy infrastructure powering Africa\'s industrial transformation.',
    capabilities: ['Solar Farms', 'Wind Turbines', 'Hybrid Plants', 'Grid Integration'],
  },
  {
    id: 'technology',
    name: 'Harch Technology',
    slug: 'technology',
    icon: Cpu,
    version: '/0.4',
    stat: '1,798 GPUs ',
    desc: 'Sovereign technology stack — from semiconductor design to ground station networks.',
    capabilities: ['Ground Stations', 'Satellite Comms', 'Edge Computing', 'IoT Platforms'],
  },
  {
    id: 'mining',
    name: 'Harch Mining',
    slug: 'mining',
    icon: Mountain,
    version: '/0.5',
    stat: '3 Minerals',
    desc: 'Strategic mineral extraction — phosphate, cobalt, and lithium for the global energy transition.',
    capabilities: ['Phosphate Mining', 'Cobalt Extraction', 'Lithium Processing', 'AI Exploration'],
  },
  {
    id: 'agriculture',
    name: 'Harch Agri',
    slug: 'agriculture',
    icon: Wheat,
    version: '/0.6',
    stat: '$35B Market',
    desc: 'Precision agriculture and vertical farming technology for food sovereignty across Africa.',
    capabilities: ['Vertical Farms', 'Precision Agri', 'Supply Chain AI', 'Food Processing'],
  },
  {
    id: 'water',
    name: 'Harch Water',
    slug: 'water',
    icon: Droplets,
    version: '/0.7',
    stat: '200M m\u00B3/yr',
    desc: 'Desalination, water treatment, and distribution infrastructure for water security.',
    capabilities: ['Desalination', 'Water Treatment', 'Distribution Networks', 'Smart Metering'],
  },
  {
    id: 'finance',
    name: 'Harch Finance',
    slug: 'finance',
    icon: Landmark,
    version: '/0.8',
    stat: '$2.37B',
    desc: 'Sovereign capital allocation, infrastructure finance, and strategic investment across 8 verticals.',
    capabilities: ['Project Finance', 'Capital Advisory', 'Risk Modeling', 'Islamic Finance'],
  },
];

const projectTypes: Record<string, { label: string; examples: string[] }[]> = {
  intelligence: [
    { label: 'GPU Cluster Deployment', examples: ['Training cluster', 'Inference farm', 'Hybrid cloud'] },
    { label: 'Sovereign AI Platform', examples: ['National AI strategy', 'Government platform', 'Defense intelligence'] },
    { label: 'Data Center Infrastructure', examples: ['Greenfield DC', 'Colocation', 'Edge DC'] },
  ],
  cement: [
    { label: 'New Cement Plant', examples: ['Greenfield plant', 'Expansion', 'Modernization'] },
    { label: 'AI-Optimized Production', examples: ['Kiln optimization', 'Predictive maintenance', 'Quality AI'] },
    { label: 'Supply Chain Integration', examples: ['Regional distribution', 'Logistics AI', 'Last-mile'] },
  ],
  energy: [
    { label: 'Solar Farm Development', examples: ['Utility-scale solar', 'Rooftop C&I', 'Hybrid plant'] },
    { label: 'Wind Energy Project', examples: ['Onshore wind', 'Offshore assessment', 'Hybrid wind-solar'] },
    { label: 'Grid Infrastructure', examples: ['Transmission lines', 'Substation', 'Smart grid'] },
  ],
  technology: [
    { label: 'Ground Station Network', examples: ['Satellite comms', 'Earth observation', 'TT&C station'] },
    { label: 'Edge Computing Deploy', examples: ['Edge nodes', 'IoT gateway', '5G edge'] },
    { label: 'Sovereign Tech Stack', examples: ['Custom silicon', 'OS platform', 'Security stack'] },
  ],
  mining: [
    { label: 'Mineral Extraction', examples: ['Phosphate mining', 'Cobalt extraction', 'Lithium processing'] },
    { label: 'AI-Driven Exploration', examples: ['Geological survey', 'Seismic analysis', 'Resource mapping'] },
    { label: 'Processing & Refining', examples: ['Ore processing', 'Concentrate plant', 'Refinery'] },
  ],
  agriculture: [
    { label: 'Vertical Farm Setup', examples: ['Indoor farming', 'Greenhouse tech', 'Hydroponics'] },
    { label: 'Precision Agriculture', examples: ['Drone monitoring', 'Soil sensors', 'Yield prediction'] },
    { label: 'Food Processing', examples: ['Packaging plant', 'Cold chain', 'Quality control'] },
  ],
  water: [
    { label: 'Desalination Plant', examples: ['SWRO plant', 'Brackish water', 'Containerized'] },
    { label: 'Water Treatment', examples: ['Wastewater treatment', 'Purification', 'Recycling'] },
    { label: 'Distribution Network', examples: ['Pipeline network', 'Smart metering', 'Reservoir'] },
  ],
  finance: [
    { label: 'Project Finance', examples: ['Greenfield financing', 'PPP structure', 'ECA-backed'] },
    { label: 'Capital Advisory', examples: ['Capital raise', 'Debt restructuring', 'IPO advisory'] },
    { label: 'Islamic Finance', examples: ['Sukuk issuance', 'Murabaha', 'Ijarah structure'] },
  ],
};

const budgetRanges = [
  'Under $100K',
  '$100K — $500K',
  '$500K — $1M',
  '$1M — $10M',
  '$10M — $50M',
  '$50M — $100M',
  '$100M — $500M',
  '$500M+',
];

const timelines = [
  'Immediate (< 3 months)',
  'Short-term (3 — 6 months)',
  'Medium-term (6 — 12 months)',
  'Long-term (12 — 24 months)',
  'Strategic (24+ months)',
];

type Step = 1 | 2 | 3 | 4;

export default function QuotePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [transmitStep, setTransmitStep] = useState(0);

  const [selectedVertical, setSelectedVertical] = useState<string | null>(null);
  const [selectedProjectType, setSelectedProjectType] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(null);
  const [projectDesc, setProjectDesc] = useState('');

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    organization: '',
    designation: '',
    country: '',
    phone: '',
  });

  // Pre-select vertical from URL param
  useEffect(() => {
    const vertical = searchParams.get('vertical');
    if (vertical && verticals.find((v) => v.id === vertical)) {
      setSelectedVertical(vertical);
      setCurrentStep(2);
    }
  }, [searchParams]);

  const selectedVerticalData = verticals.find((v) => v.id === selectedVertical);
  const projectTypeOptions = selectedVertical ? projectTypes[selectedVertical] || [] : [];

  const canProceedStep1 = selectedVertical !== null;
  const canProceedStep2 = selectedProjectType !== null && selectedBudget !== null && selectedTimeline !== null;
  const canProceedStep3 = formState.name !== '' && formState.email !== '' && formState.organization !== '';

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    setTransmitStep(1);
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          vertical: selectedVertical,
          projectType: selectedProjectType,
          budget: selectedBudget,
          timeline: selectedTimeline,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setTransmitStep(2);
      setTimeout(() => setTransmitStep(3), 600);
      setTimeout(() => {
        setTransmitStep(0);
        router.push(`/quote/received?ref=${data.reference || ''}`);
      }, 1400);
    } catch (err) {
      setTransmitStep(0);
      setSubmitError(err instanceof Error ? err.message : 'An error occurred. Please email amine@harchcorp.com');
    }
  }, [router, formState, selectedVertical, selectedProjectType, selectedBudget, selectedTimeline]);

  const stepLabels = ['Vertical', 'Project', 'Details', 'Review'];

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-center gap-3 mb-6">
              <Shield size={14} className="text-[#8B9DAF]" />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8B9DAF]">Secure Proposal Request</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Request a Quote
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7] mb-10">
              Select your vertical, define your project scope, and receive a customized proposal.
              Every request is encrypted end-to-end on sovereign infrastructure.
            </p>
          </FadeIn>

          {/* Progress Steps */}
          <FadeIn delay={0.1}>
            <div className="flex items-center gap-0 max-w-3xl">
              {stepLabels.map((label, i) => {
                const step = (i + 1) as Step;
                const isActive = currentStep === step;
                const isCompleted = currentStep > step;
                return (
                  <div key={label} className="flex items-center flex-1">
                    <button
                      onClick={() => { if (isCompleted) setCurrentStep(step); }}
                      disabled={!isCompleted && !isActive}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)]'
                          : isCompleted
                          ? 'bg-[rgba(74,123,95,0.06)] border border-[rgba(74,123,95,0.12)] cursor-pointer hover:bg-[rgba(74,123,95,0.1)]'
                          : 'bg-transparent border border-[rgba(255,255,255,0.04)]'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isActive
                            ? 'bg-[#8B9DAF] text-black'
                            : isCompleted
                            ? 'bg-[#4A7B5F] text-white'
                            : 'bg-[rgba(255,255,255,0.04)] text-[#666666]'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 size={12} /> : step}
                      </span>
                      <span
                        className={`text-[11px] font-semibold tracking-wide ${
                          isActive ? 'text-white' : isCompleted ? 'text-[#4A7B5F]' : 'text-[#444444]'
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                    {i < stepLabels.length - 1 && (
                      <div className={`flex-1 h-px mx-2 ${currentStep > step ? 'bg-[#4A7B5F]' : 'bg-[rgba(255,255,255,0.06)]'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Step Content */}
      <section className="py-16 md:py-24 bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <AnimatePresence mode="wait">
            {/* STEP 1: Select Vertical */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <p className="section-label mb-4">Step 1 of 4</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-[-0.01em] mb-3">
                  Which vertical are you interested in?
                </h2>
                <p className="text-[14px] text-[#666666] mb-10">
                  Select the Harch Corp subsidiary that aligns with your project requirements.
                </p>

                <div className="h-px bg-[rgba(255,255,255,0.06)] mb-2" />

                {verticals.map((v, i) => (
                  <FadeIn key={v.id} delay={i * 0.04}>
                    <button
                      onClick={() => setSelectedVertical(v.id)}
                      className={`w-full text-left py-5 px-4 md:px-6 border-b border-[rgba(255,255,255,0.04)] transition-all duration-300 flex items-center gap-4 md:gap-6 ${
                        selectedVertical === v.id
                          ? 'border-l-2 border-l-[#8B9DAF] bg-[rgba(255,255,255,0.02)]'
                          : 'border-l-2 border-l-transparent hover:bg-[rgba(255,255,255,0.015)]'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          selectedVertical === v.id ? 'bg-[rgba(139,157,175,0.08)]' : 'bg-[rgba(255,255,255,0.04)]'
                        }`}
                      >
                        <v.icon
                          size={18}
                          className={selectedVertical === v.id ? 'text-[#8B9DAF]' : 'text-[#666666]'}
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`text-[15px] font-bold ${selectedVertical === v.id ? 'text-white' : 'text-[#999999]'}`}>
                            {v.name}
                          </h3>
                          <span className="text-[9px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)]">
                            {v.version}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#666666] leading-relaxed">{v.desc}</p>
                        {selectedVertical === v.id && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {v.capabilities.map((cap) => (
                              <span
                                key={cap}
                                className="px-2 py-0.5 bg-[rgba(139,157,175,0.06)] border border-[rgba(139,157,175,0.1)] rounded text-[9px] font-semibold text-[#8B9DAF] tracking-wide"
                              >
                                {cap}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[9px] font-bold tracking-[0.1em] text-[#444444] font-[family-name:var(--font-space-mono)]">
                          {v.stat}
                        </span>
                        <ChevronRight
                          size={14}
                          className={selectedVertical === v.id ? 'text-[#8B9DAF]' : 'text-[#333333]'}
                        />
                      </div>
                    </button>
                  </FadeIn>
                ))}

                <div className="flex justify-end mt-10">
                  <button
                    onClick={() => canProceedStep1 && setCurrentStep(2)}
                    disabled={!canProceedStep1}
                    className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-lg text-sm font-semibold transition-all ${
                      canProceedStep1
                        ? 'bg-white text-black hover:bg-[#CCCCCC]'
                        : 'bg-[rgba(255,255,255,0.04)] text-[#444444] cursor-not-allowed'
                    }`}
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Project Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8B9DAF]">Step 2 of 4</span>
                  <span className="text-[9px] text-[#444444] font-[family-name:var(--font-space-mono)]">[{selectedVerticalData?.name}]</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-[-0.01em] mb-3">
                  Define your project scope
                </h2>
                <p className="text-[14px] text-[#666666] mb-10">
                  Tell us about the type, scale, and timeline of your project.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-10">
                    {/* Project Type */}
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">Project Type *</p>
                      <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                      <div className="space-y-3">
                        {projectTypeOptions.map((pt) => (
                          <button
                            key={pt.label}
                            onClick={() => setSelectedProjectType(pt.label)}
                            className={`w-full text-left py-4 px-5 rounded-lg border transition-all ${
                              selectedProjectType === pt.label
                                ? 'border-[rgba(139,157,175,0.2)] bg-[rgba(139,157,175,0.04)]'
                                : 'border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.02)]'
                            }`}
                          >
                            <h4 className={`text-[14px] font-bold mb-1 ${selectedProjectType === pt.label ? 'text-white' : 'text-[#999999]'}`}>
                              {pt.label}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {pt.examples.map((ex) => (
                                <span key={ex} className="text-[10px] text-[#666666]">{ex}</span>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget Range */}
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">Estimated Budget *</p>
                      <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                      <div className="flex flex-wrap gap-2">
                        {budgetRanges.map((range) => (
                          <button
                            key={range}
                            onClick={() => setSelectedBudget(range)}
                            className={`px-4 py-2.5 rounded-lg border text-[12px] font-semibold transition-all ${
                              selectedBudget === range
                                ? 'border-[rgba(139,157,175,0.2)] bg-[rgba(139,157,175,0.06)] text-white'
                                : 'border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] text-[#666666] hover:bg-[rgba(255,255,255,0.03)]'
                            }`}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">Project Timeline *</p>
                      <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                      <div className="space-y-2">
                        {timelines.map((t) => (
                          <button
                            key={t}
                            onClick={() => setSelectedTimeline(t)}
                            className={`w-full text-left py-3 px-5 rounded-lg border text-[13px] font-medium transition-all ${
                              selectedTimeline === t
                                ? 'border-[rgba(139,157,175,0.2)] bg-[rgba(139,157,175,0.04)] text-white'
                                : 'border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] text-[#666666] hover:bg-[rgba(255,255,255,0.02)]'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Project Description */}
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">Project Description</p>
                      <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                      <textarea
                        rows={5}
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors resize-none placeholder:text-[#333333]"
                        placeholder="Describe your project requirements, objectives, and any specific constraints."
                      />
                    </div>
                  </div>

                  {/* Right sidebar */}
                  <div className="space-y-6">
                    <FadeIn delay={0.1}>
                      <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4">
                          {selectedVerticalData && <selectedVerticalData.icon
                            size={14}
                            className="text-[#8B9DAF]"
                            strokeWidth={1.5}
                          />}
                          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8B9DAF]">
                            {selectedVerticalData?.name}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#999999] leading-relaxed mb-4">
                          {selectedVerticalData?.desc}
                        </p>
                        <div className="text-[20px] font-extrabold text-white font-[family-name:var(--font-space-mono)]">
                          {selectedVerticalData?.stat}
                        </div>
                        <p className="text-[10px] text-[#666666] mt-1">Current capacity</p>
                      </div>
                    </FadeIn>

                    <FadeIn delay={0.15}>
                      <div className="card p-6">
                        <p className="section-label mb-4">Capabilities</p>
                        <div className="space-y-2">
                          {selectedVerticalData?.capabilities.map((cap) => (
                            <div key={cap} className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-[#8B9DAF]" />
                              <span className="text-[12px] text-[#999999]">{cap}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                      <div className="card p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Lock size={12} className="text-[#8B9DAF]" />
                          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">Encrypted</span>
                        </div>
                        <p className="text-[12px] text-[#666666] leading-relaxed">
                          All quote requests are encrypted with AES-256 at rest and TLS 1.3 in transit. Data processed on sovereign Moroccan infrastructure.
                        </p>
                      </div>
                    </FadeIn>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-10">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-2 text-[13px] text-[#666666] hover:text-white transition-colors"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    onClick={() => canProceedStep2 && setCurrentStep(3)}
                    disabled={!canProceedStep2}
                    className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-lg text-sm font-semibold transition-all ${
                      canProceedStep2
                        ? 'bg-white text-black hover:bg-[#CCCCCC]'
                        : 'bg-[rgba(255,255,255,0.04)] text-[#444444] cursor-not-allowed'
                    }`}
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Your Information */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <p className="section-label mb-4">Step 3 of 4</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-[-0.01em] mb-3">
                  Your information
                </h2>
                <p className="text-[14px] text-[#666666] mb-10">
                  Provide your details so our team can prepare and deliver your proposal.
                </p>

                <div className="max-w-2xl">
                  {/* Personal Information */}
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">Personal Information</p>
                    <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                          Full Name <span className="text-[#A0524B]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors placeholder:text-[#333333]"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                          Email Address <span className="text-[#A0524B]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors placeholder:text-[#333333]"
                          placeholder="you@organization.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Organization */}
                  <div className="mt-8">
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">Organization</p>
                    <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                          Organization <span className="text-[#A0524B]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.organization}
                          onChange={(e) => setFormState({ ...formState, organization: e.target.value })}
                          className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors placeholder:text-[#333333]"
                          placeholder="Organization name"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                          Designation
                        </label>
                        <input
                          type="text"
                          value={formState.designation}
                          onChange={(e) => setFormState({ ...formState, designation: e.target.value })}
                          className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors placeholder:text-[#333333]"
                          placeholder="Title / Role"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="mt-8">
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">Additional Details</p>
                    <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                          Country <span className="text-[#A0524B]">*</span>
                        </label>
                        <select
                          value={formState.country}
                          onChange={(e) => setFormState({ ...formState, country: e.target.value })}
                          className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#0D0D0D]">Select your country</option>
                          <option value="Morocco" className="bg-[#0D0D0D]">Morocco (Maroc)</option>
                          <option value="Senegal" className="bg-[#0D0D0D]">Senegal (Senegal)</option>
                          <option value="Gambia" className="bg-[#0D0D0D]">Gambia</option>
                          <option value="Cote d'Ivoire" className="bg-[#0D0D0D]">Cote d&apos;Ivoire</option>
                          <option value="Nigeria" className="bg-[#0D0D0D]">Nigeria</option>
                          <option value="Ghana" className="bg-[#0D0D0D]">Ghana</option>
                          <option value="Mali" className="bg-[#0D0D0D]">Mali</option>
                          <option value="Guinea" className="bg-[#0D0D0D]">Guinea</option>
                          <option value="Burkina Faso" className="bg-[#0D0D0D]">Burkina Faso</option>
                          <option value="Tunisia" className="bg-[#0D0D0D]">Tunisia</option>
                          <option value="Algeria" className="bg-[#0D0D0D]">Algeria</option>
                          <option value="Egypt" className="bg-[#0D0D0D]">Egypt</option>
                          <option value="Mauritania" className="bg-[#0D0D0D]">Mauritania</option>
                          <option value="UAE" className="bg-[#0D0D0D]">United Arab Emirates</option>
                          <option value="Saudi Arabia" className="bg-[#0D0D0D]">Saudi Arabia</option>
                          <option value="France" className="bg-[#0D0D0D]">France</option>
                          <option value="United Kingdom" className="bg-[#0D0D0D]">United Kingdom</option>
                          <option value="United States" className="bg-[#0D0D0D]">United States</option>
                          <option value="Other" className="bg-[#0D0D0D]">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                          Phone / WhatsApp
                        </label>
                        <input
                          type="tel"
                          value={formState.phone}
                          onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                          className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors placeholder:text-[#333333]"
                          placeholder="+212 / +221 / +220 ..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Direct Contact */}
                  <div className="mt-8 p-4 border border-[rgba(74,123,95,0.15)] bg-[rgba(74,123,95,0.03)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-[13px]">📧</span>
                      <div>
                        <p className="text-[12px] text-white/70">Have a question? Reach us by email</p>
                        <a
                          href="mailto:contact@harchcorp.com"
                          className="text-[12px] text-[#4A7B5F] hover:text-[#5A9B7F] font-semibold transition-colors"
                        >
                          Contact us via email →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-10">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 text-[13px] text-[#666666] hover:text-white transition-colors"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    onClick={() => canProceedStep3 && setCurrentStep(4)}
                    disabled={!canProceedStep3}
                    className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-lg text-sm font-semibold transition-all ${
                      canProceedStep3
                        ? 'bg-white text-black hover:bg-[#CCCCCC]'
                        : 'bg-[rgba(255,255,255,0.04)] text-[#444444] cursor-not-allowed'
                    }`}
                  >
                    Review <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Review & Submit */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <p className="section-label mb-4">Step 4 of 4</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-[-0.01em] mb-3">
                  Review and submit
                </h2>
                <p className="text-[14px] text-[#666666] mb-10">
                  Confirm your request details before submitting your encrypted proposal request.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Vertical Summary */}
                    <div className="card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="section-label">Selected Vertical</p>
                        <button onClick={() => setCurrentStep(1)} className="text-[11px] text-[#8B9DAF] hover:text-white transition-colors">Edit</button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[rgba(139,157,175,0.08)] flex items-center justify-center">
                          {selectedVerticalData && <selectedVerticalData.icon size={18} className="text-[#8B9DAF]" strokeWidth={1.5} />}
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-white">{selectedVerticalData?.name}</h3>
                          <p className="text-[12px] text-[#666666]">{selectedVerticalData?.stat} capacity</p>
                        </div>
                      </div>
                    </div>

                    {/* Project Summary */}
                    <div className="card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="section-label">Project Scope</p>
                        <button onClick={() => setCurrentStep(2)} className="text-[11px] text-[#8B9DAF] hover:text-white transition-colors">Edit</button>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)] w-20 shrink-0 pt-0.5">TYPE</span>
                          <span className="text-[14px] text-white">{selectedProjectType}</span>
                        </div>
                        <div className="flex items-start gap-4">
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)] w-20 shrink-0 pt-0.5">BUDGET</span>
                          <span className="text-[14px] text-white">{selectedBudget}</span>
                        </div>
                        <div className="flex items-start gap-4">
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)] w-20 shrink-0 pt-0.5">TIMELINE</span>
                          <span className="text-[14px] text-white">{selectedTimeline}</span>
                        </div>
                        {projectDesc && (
                          <div className="flex items-start gap-4">
                            <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)] w-20 shrink-0 pt-0.5">DETAILS</span>
                            <span className="text-[13px] text-[#999999] leading-relaxed">{projectDesc}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Summary */}
                    <div className="card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="section-label">Contact Information</p>
                        <button onClick={() => setCurrentStep(3)} className="text-[11px] text-[#8B9DAF] hover:text-white transition-colors">Edit</button>
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                        <div>
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)]">NAME</span>
                          <p className="text-[14px] text-white mt-1">{formState.name}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)]">EMAIL</span>
                          <p className="text-[14px] text-white mt-1">{formState.email}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)]">ORG</span>
                          <p className="text-[14px] text-white mt-1">{formState.organization}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)]">DESIGNATION</span>
                          <p className="text-[14px] text-white mt-1">{formState.designation || '—'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)]">COUNTRY</span>
                          <p className="text-[14px] text-white mt-1">{formState.country || '—'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)]">PHONE</span>
                          <p className="text-[14px] text-white mt-1">{formState.phone || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-6">
                    <FadeIn delay={0.1}>
                      <div className="card p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock size={12} className="text-[#8B9DAF]" />
                          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">Response Time</span>
                        </div>
                        <p className="text-[24px] font-extrabold text-white font-[family-name:var(--font-space-mono)]">24h</p>
                        <p className="text-[12px] text-[#666666] mt-1">Maximum response time for all quote requests</p>
                      </div>
                    </FadeIn>

                    <FadeIn delay={0.15}>
                      <div className="card p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield size={12} className="text-[#8B9DAF]" />
                          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">Data Sovereignty</span>
                        </div>
                        <p className="text-[12px] text-[#999999] leading-relaxed">
                          All data processed on sovereign Moroccan infrastructure. AES-256 at rest, TLS 1.3 in transit. Law 09-08 compliant.
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {['AES-256', 'TLS 1.3', 'SOC 2', 'ISO 27001'].map((b) => (
                            <span key={b} className="px-2 py-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded text-[9px] font-semibold text-[#999999] tracking-wide">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </FadeIn>
                  </div>
                </div>

                {/* Transmit animation */}
                {transmitStep > 0 && (
                  <div className="mt-8 px-4 py-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <Radio size={12} className="text-[#8B9DAF] animate-pulse" />
                      <span className="text-[11px] text-[#8B9DAF] font-[family-name:var(--font-space-mono)]">
                        {transmitStep === 1 && 'Encrypting payload...'}
                        {transmitStep === 2 && 'Routing through secure channel...'}
                        {transmitStep === 3 && 'Transmitting to secure intake...'}
                      </span>
                    </div>
                    <div className="mt-2 w-full h-1 rounded-full bg-[rgba(255,255,255,0.06)]">
                      <div
                        className="h-full rounded-full bg-[#8B9DAF] transition-all duration-700"
                        style={{ width: `${transmitStep * 33}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-10">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 text-[13px] text-[#666666] hover:text-white transition-colors"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Lock size={10} className="text-[#666666]" />
                      <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">End-to-end encrypted</span>
                    </div>
                    <button
                      onClick={handleSubmit}
                      className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold hover:bg-[#CCCCCC] transition-all"
                    >
                      Submit Quote Request <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
