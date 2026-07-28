'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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

function getVerticals(t: ReturnType<typeof useTranslations<'quote'>>) {
  return [
  {
    id: 'intelligence',
    icon: Server,
    version: '/0.1',
    stat: t('step1.verticals.intelligence.stat'),
    capabilityKeys: ['step1.verticals.intelligence.capabilities.gpuClusters', 'step1.verticals.intelligence.capabilities.aiTraining', 'step1.verticals.intelligence.capabilities.inferenceScale', 'step1.verticals.intelligence.capabilities.sovereignCloud'],
  },
  {
    id: 'cement',
    icon: Factory,
    version: '/0.2',
    stat: t('step1.verticals.cement.stat'),
    capabilityKeys: ['step1.verticals.cement.capabilities.clinkerProduction', 'step1.verticals.cement.capabilities.aiKilns', 'step1.verticals.cement.capabilities.regionalDistribution', 'step1.verticals.cement.capabilities.greenCement'],
  },
  {
    id: 'energy',
    icon: Zap,
    version: '/0.3',
    stat: t('step1.verticals.energy.stat'),
    capabilityKeys: ['step1.verticals.energy.capabilities.solarFarms', 'step1.verticals.energy.capabilities.windTurbines', 'step1.verticals.energy.capabilities.hybridPlants', 'step1.verticals.energy.capabilities.gridIntegration'],
  },
  {
    id: 'technology',
    icon: Cpu,
    version: '/0.4',
    stat: t('step1.verticals.technology.stat'),
    capabilityKeys: ['step1.verticals.technology.capabilities.groundStations', 'step1.verticals.technology.capabilities.satelliteComms', 'step1.verticals.technology.capabilities.edgeComputing', 'step1.verticals.technology.capabilities.iotPlatforms'],
  },
  {
    id: 'mining',
    icon: Mountain,
    version: '/0.5',
    stat: t('step1.verticals.mining.stat'),
    capabilityKeys: ['step1.verticals.mining.capabilities.phosphateMining', 'step1.verticals.mining.capabilities.cobaltExtraction', 'step1.verticals.mining.capabilities.lithiumProcessing', 'step1.verticals.mining.capabilities.aiExploration'],
  },
  {
    id: 'agriculture',
    icon: Wheat,
    version: '/0.6',
    stat: t('step1.verticals.agriculture.stat'),
    capabilityKeys: ['step1.verticals.agriculture.capabilities.verticalFarms', 'step1.verticals.agriculture.capabilities.precisionAgri', 'step1.verticals.agriculture.capabilities.supplyChainAi', 'step1.verticals.agriculture.capabilities.foodProcessing'],
  },
  {
    id: 'water',
    icon: Droplets,
    version: '/0.7',
    stat: t('step1.verticals.water.stat'),
    capabilityKeys: ['step1.verticals.water.capabilities.desalination', 'step1.verticals.water.capabilities.waterTreatment', 'step1.verticals.water.capabilities.distributionNetworks', 'step1.verticals.water.capabilities.smartMetering'],
  },
  {
    id: 'finance',
    icon: Landmark,
    version: '/0.8',
    stat: t('step1.verticals.finance.stat'),
    capabilityKeys: ['step1.verticals.finance.capabilities.projectFinance', 'step1.verticals.finance.capabilities.capitalAdvisory', 'step1.verticals.finance.capabilities.riskModeling', 'step1.verticals.finance.capabilities.islamicFinance'],
  },
  ];
}

const projectTypes: Record<string, { labelKey: string; exampleKeys: string[] }[]> = {
  intelligence: [
    { labelKey: 'step2.projectTypes.intelligence.gpuCluster.label', exampleKeys: ['step2.projectTypes.intelligence.gpuCluster.ex1', 'step2.projectTypes.intelligence.gpuCluster.ex2', 'step2.projectTypes.intelligence.gpuCluster.ex3'] },
    { labelKey: 'step2.projectTypes.intelligence.sovereignAi.label', exampleKeys: ['step2.projectTypes.intelligence.sovereignAi.ex1', 'step2.projectTypes.intelligence.sovereignAi.ex2', 'step2.projectTypes.intelligence.sovereignAi.ex3'] },
    { labelKey: 'step2.projectTypes.intelligence.dataCenter.label', exampleKeys: ['step2.projectTypes.intelligence.dataCenter.ex1', 'step2.projectTypes.intelligence.dataCenter.ex2', 'step2.projectTypes.intelligence.dataCenter.ex3'] },
  ],
  cement: [
    { labelKey: 'step2.projectTypes.cement.newPlant.label', exampleKeys: ['step2.projectTypes.cement.newPlant.ex1', 'step2.projectTypes.cement.newPlant.ex2', 'step2.projectTypes.cement.newPlant.ex3'] },
    { labelKey: 'step2.projectTypes.cement.aiOptimized.label', exampleKeys: ['step2.projectTypes.cement.aiOptimized.ex1', 'step2.projectTypes.cement.aiOptimized.ex2', 'step2.projectTypes.cement.aiOptimized.ex3'] },
    { labelKey: 'step2.projectTypes.cement.supplyChain.label', exampleKeys: ['step2.projectTypes.cement.supplyChain.ex1', 'step2.projectTypes.cement.supplyChain.ex2', 'step2.projectTypes.cement.supplyChain.ex3'] },
  ],
  energy: [
    { labelKey: 'step2.projectTypes.energy.solarFarm.label', exampleKeys: ['step2.projectTypes.energy.solarFarm.ex1', 'step2.projectTypes.energy.solarFarm.ex2', 'step2.projectTypes.energy.solarFarm.ex3'] },
    { labelKey: 'step2.projectTypes.energy.windEnergy.label', exampleKeys: ['step2.projectTypes.energy.windEnergy.ex1', 'step2.projectTypes.energy.windEnergy.ex2', 'step2.projectTypes.energy.windEnergy.ex3'] },
    { labelKey: 'step2.projectTypes.energy.gridInfra.label', exampleKeys: ['step2.projectTypes.energy.gridInfra.ex1', 'step2.projectTypes.energy.gridInfra.ex2', 'step2.projectTypes.energy.gridInfra.ex3'] },
  ],
  technology: [
    { labelKey: 'step2.projectTypes.technology.groundStation.label', exampleKeys: ['step2.projectTypes.technology.groundStation.ex1', 'step2.projectTypes.technology.groundStation.ex2', 'step2.projectTypes.technology.groundStation.ex3'] },
    { labelKey: 'step2.projectTypes.technology.edgeComputing.label', exampleKeys: ['step2.projectTypes.technology.edgeComputing.ex1', 'step2.projectTypes.technology.edgeComputing.ex2', 'step2.projectTypes.technology.edgeComputing.ex3'] },
    { labelKey: 'step2.projectTypes.technology.sovereignTech.label', exampleKeys: ['step2.projectTypes.technology.sovereignTech.ex1', 'step2.projectTypes.technology.sovereignTech.ex2', 'step2.projectTypes.technology.sovereignTech.ex3'] },
  ],
  mining: [
    { labelKey: 'step2.projectTypes.mining.mineralExtraction.label', exampleKeys: ['step2.projectTypes.mining.mineralExtraction.ex1', 'step2.projectTypes.mining.mineralExtraction.ex2', 'step2.projectTypes.mining.mineralExtraction.ex3'] },
    { labelKey: 'step2.projectTypes.mining.aiExploration.label', exampleKeys: ['step2.projectTypes.mining.aiExploration.ex1', 'step2.projectTypes.mining.aiExploration.ex2', 'step2.projectTypes.mining.aiExploration.ex3'] },
    { labelKey: 'step2.projectTypes.mining.processing.label', exampleKeys: ['step2.projectTypes.mining.processing.ex1', 'step2.projectTypes.mining.processing.ex2', 'step2.projectTypes.mining.processing.ex3'] },
  ],
  agriculture: [
    { labelKey: 'step2.projectTypes.agriculture.verticalFarm.label', exampleKeys: ['step2.projectTypes.agriculture.verticalFarm.ex1', 'step2.projectTypes.agriculture.verticalFarm.ex2', 'step2.projectTypes.agriculture.verticalFarm.ex3'] },
    { labelKey: 'step2.projectTypes.agriculture.precisionAgri.label', exampleKeys: ['step2.projectTypes.agriculture.precisionAgri.ex1', 'step2.projectTypes.agriculture.precisionAgri.ex2', 'step2.projectTypes.agriculture.precisionAgri.ex3'] },
    { labelKey: 'step2.projectTypes.agriculture.foodProcessing.label', exampleKeys: ['step2.projectTypes.agriculture.foodProcessing.ex1', 'step2.projectTypes.agriculture.foodProcessing.ex2', 'step2.projectTypes.agriculture.foodProcessing.ex3'] },
  ],
  water: [
    { labelKey: 'step2.projectTypes.water.desalination.label', exampleKeys: ['step2.projectTypes.water.desalination.ex1', 'step2.projectTypes.water.desalination.ex2', 'step2.projectTypes.water.desalination.ex3'] },
    { labelKey: 'step2.projectTypes.water.treatment.label', exampleKeys: ['step2.projectTypes.water.treatment.ex1', 'step2.projectTypes.water.treatment.ex2', 'step2.projectTypes.water.treatment.ex3'] },
    { labelKey: 'step2.projectTypes.water.distribution.label', exampleKeys: ['step2.projectTypes.water.distribution.ex1', 'step2.projectTypes.water.distribution.ex2', 'step2.projectTypes.water.distribution.ex3'] },
  ],
  finance: [
    { labelKey: 'step2.projectTypes.finance.projectFinance.label', exampleKeys: ['step2.projectTypes.finance.projectFinance.ex1', 'step2.projectTypes.finance.projectFinance.ex2', 'step2.projectTypes.finance.projectFinance.ex3'] },
    { labelKey: 'step2.projectTypes.finance.capitalAdvisory.label', exampleKeys: ['step2.projectTypes.finance.capitalAdvisory.ex1', 'step2.projectTypes.finance.capitalAdvisory.ex2', 'step2.projectTypes.finance.capitalAdvisory.ex3'] },
    { labelKey: 'step2.projectTypes.finance.islamicFinance.label', exampleKeys: ['step2.projectTypes.finance.islamicFinance.ex1', 'step2.projectTypes.finance.islamicFinance.ex2', 'step2.projectTypes.finance.islamicFinance.ex3'] },
  ],
};

const budgetRangeKeys = ['under1M', '1Mto5M', '5Mto25M', '25Mto100M', '100Mto500M', 'over500M'] as const;

const timelineKeys = ['immediate', 'shortTerm', 'mediumTerm', 'longTerm', 'extended'] as const;

type Step = 1 | 2 | 3 | 4;

export default function QuotePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('quote');
  const verticals = getVerticals(t);
  const tc = useTranslations('common');

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [transmitStep, setTransmitStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setTransmitStep(1);

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          organization: formState.organization,
          designation: formState.designation,
          country: formState.country,
          phone: formState.phone,
          vertical: selectedVertical,
          projectType: selectedProjectType,
          budgetRange: selectedBudget,
          timeline: selectedTimeline,
          projectDescription: projectDesc,
        }),
      });

      setTransmitStep(2);

      const data = await response.json();

      if (!response.ok || !data.success) {
        setTransmitStep(0);
        setSubmitError(data.error || t('step4.submitError'));
        setIsSubmitting(false);
        return;
      }

      setTransmitStep(3);

      setTimeout(() => {
        setTransmitStep(0);
        setIsSubmitting(false);
        router.push('/quote/received');
      }, 800);
    } catch {
      setTransmitStep(0);
      setSubmitError(t('step4.submitError'));
      setIsSubmitting(false);
    }
  }, [router, formState, selectedVertical, selectedProjectType, selectedBudget, selectedTimeline, projectDesc]);

  const stepLabels = [t('step1.title'), t('step2.title'), t('step3.title'), t('step4.title')];

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-center gap-3 mb-6">
              <Shield size={14} className="text-[#8B9DAF]" />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8B9DAF]">{tc('encrypted')} {tc('security')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              {t('title')}
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7] mb-10">
              {t('subtitle')}
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
                  <div key={i} className="flex items-center flex-1">
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
                <p className="section-label mb-4">{t('progress.step')} 1 {t('progress.of')} 4</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-[-0.01em] mb-3">
                  {t('step1.title')}
                </h2>
                <p className="text-[14px] text-[#666666] mb-10">
                  {t('step1.description')}
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
                            {t(`step1.verticals.${v.id}.name`)}
                          </h3>
                          <span className="text-[9px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)]">
                            {v.version}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#666666] leading-relaxed">{t(`step1.verticals.${v.id}.description`)}</p>
                        {selectedVertical === v.id && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {v.capabilityKeys.map((capKey) => (
                              <span
                                key={capKey}
                                className="px-2 py-0.5 bg-[rgba(139,157,175,0.06)] border border-[rgba(139,157,175,0.1)] rounded text-[9px] font-semibold text-[#8B9DAF] tracking-wide"
                              >
                                {t(capKey)}
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
                    {tc('continue')} <ArrowRight size={14} />
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
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8B9DAF]">{t('progress.step')} 2 {t('progress.of')} 4</span>
                  <span className="text-[9px] text-[#444444] font-[family-name:var(--font-space-mono)]">[{selectedVertical && t(`step1.verticals.${selectedVertical}.name`)}]</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-[-0.01em] mb-3">
                  {t('step2.title')}
                </h2>
                <p className="text-[14px] text-[#666666] mb-10">
                  {t('step2.description')}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-10">
                    {/* Project Type */}
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">{t('step2.projectType')} *</p>
                      <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                      <div className="space-y-3">
                        {projectTypeOptions.map((pt) => (
                          <button
                            key={pt.labelKey}
                            onClick={() => setSelectedProjectType(pt.labelKey)}
                            className={`w-full text-left py-4 px-5 rounded-lg border transition-all ${
                              selectedProjectType === pt.labelKey
                                ? 'border-[rgba(139,157,175,0.2)] bg-[rgba(139,157,175,0.04)]'
                                : 'border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] hover:bg-[rgba(255,255,255,0.02)]'
                            }`}
                          >
                            <h4 className={`text-[14px] font-bold mb-1 ${selectedProjectType === pt.labelKey ? 'text-white' : 'text-[#999999]'}`}>
                              {t(pt.labelKey)}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {pt.exampleKeys.map((exKey) => (
                                <span key={exKey} className="text-[10px] text-[#666666]">{t(exKey)}</span>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget Range */}
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">{t('step2.budgetRange')} *</p>
                      <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                      <div className="flex flex-wrap gap-2">
                        {budgetRangeKeys.map((key) => (
                          <button
                            key={key}
                            onClick={() => setSelectedBudget(key)}
                            className={`px-4 py-2.5 rounded-lg border text-[12px] font-semibold transition-all ${
                              selectedBudget === key
                                ? 'border-[rgba(139,157,175,0.2)] bg-[rgba(139,157,175,0.06)] text-white'
                                : 'border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] text-[#666666] hover:bg-[rgba(255,255,255,0.03)]'
                            }`}
                          >
                            {t(`step2.budgetRanges.${key}`)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">{t('step2.timeline')} *</p>
                      <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                      <div className="space-y-2">
                        {timelineKeys.map((key) => (
                          <button
                            key={key}
                            onClick={() => setSelectedTimeline(key)}
                            className={`w-full text-left py-3 px-5 rounded-lg border text-[13px] font-medium transition-all ${
                              selectedTimeline === key
                                ? 'border-[rgba(139,157,175,0.2)] bg-[rgba(139,157,175,0.04)] text-white'
                                : 'border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] text-[#666666] hover:bg-[rgba(255,255,255,0.02)]'
                            }`}
                          >
                            {t(`step2.timelines.${key}`)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Project Description */}
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">{t('step2.description')}</p>
                      <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                      <textarea
                        rows={5}
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors resize-none placeholder:text-[#333333]"
                        placeholder={t('step2.descriptionPlaceholder')}
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
                            {selectedVertical && t(`step1.verticals.${selectedVertical}.name`)}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#999999] leading-relaxed mb-4">
                          {selectedVertical && t(`step1.verticals.${selectedVertical}.description`)}
                        </p>
                        <div className="text-[20px] font-extrabold text-white font-[family-name:var(--font-space-mono)]">
                          {selectedVerticalData?.stat}
                        </div>
                        <p className="text-[10px] text-[#666666] mt-1">{tc('capacity')}</p>
                      </div>
                    </FadeIn>

                    <FadeIn delay={0.15}>
                      <div className="card p-6">
                        <p className="section-label mb-4">{tc('capabilities')}</p>
                        <div className="space-y-2">
                          {selectedVerticalData?.capabilityKeys.map((capKey) => (
                            <div key={capKey} className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-[#8B9DAF]" />
                              <span className="text-[12px] text-[#999999]">{t(capKey)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                      <div className="card p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Lock size={12} className="text-[#8B9DAF]" />
                          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">{tc('encrypted')}</span>
                        </div>
                        <p className="text-[12px] text-[#666666] leading-relaxed">
                          {t('step2.encryptedDescription')}
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
                    <ArrowLeft size={14} /> {tc('back')}
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
                    {tc('continue')} <ArrowRight size={14} />
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
                <p className="section-label mb-4">{t('progress.step')} 3 {t('progress.of')} 4</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-[-0.01em] mb-3">
                  {t('step3.title')}
                </h2>
                <p className="text-[14px] text-[#666666] mb-10">
                  {t('step3.description')}
                </p>

                <div className="max-w-2xl">
                  {/* Personal Information */}
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">{t('step3.firstName')}</p>
                    <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                          {t('step3.firstName')} <span className="text-[#A0524B]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors placeholder:text-[#333333]"
                          placeholder={t('step3.firstName')}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                          {t('step3.email')} <span className="text-[#A0524B]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors placeholder:text-[#333333]"
                          placeholder={t('step3.emailPlaceholder')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Organization */}
                  <div className="mt-8">
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">{t('step3.organization')}</p>
                    <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                          {t('step3.organization')} <span className="text-[#A0524B]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.organization}
                          onChange={(e) => setFormState({ ...formState, organization: e.target.value })}
                          className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors placeholder:text-[#333333]"
                          placeholder={t('step3.organization')}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                          {t('step3.jobTitle')}
                        </label>
                        <input
                          type="text"
                          value={formState.designation}
                          onChange={(e) => setFormState({ ...formState, designation: e.target.value })}
                          className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors placeholder:text-[#333333]"
                          placeholder={t('step3.jobTitle')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="mt-8">
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">{t('step2.country')}</p>
                    <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                          {t('step2.country')} <span className="text-[#A0524B]">*</span>
                        </label>
                        <select
                          value={formState.country}
                          onChange={(e) => setFormState({ ...formState, country: e.target.value })}
                          className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#0D0D0D]">{t('step2.country')}</option>
                          <option value="morocco" className="bg-[#0D0D0D]">{t('step2.countries.morocco')}</option>
                          <option value="senegal" className="bg-[#0D0D0D]">{t('step2.countries.senegal')}</option>
                          <option value="gambia" className="bg-[#0D0D0D]">{t('step2.countries.gambia')}</option>
                          <option value="ivoryCoast" className="bg-[#0D0D0D]">{t('step2.countries.ivoryCoast')}</option>
                          <option value="nigeria" className="bg-[#0D0D0D]">{t('step2.countries.nigeria')}</option>
                          <option value="ghana" className="bg-[#0D0D0D]">{t('step2.countries.ghana')}</option>
                          <option value="mali" className="bg-[#0D0D0D]">{t('step2.countries.mali')}</option>
                          <option value="guinea" className="bg-[#0D0D0D]">{t('step2.countries.guinea')}</option>
                          <option value="burkinaFaso" className="bg-[#0D0D0D]">{t('step2.countries.burkinaFaso')}</option>
                          <option value="tunisia" className="bg-[#0D0D0D]">{t('step2.countries.tunisia')}</option>
                          <option value="algeria" className="bg-[#0D0D0D]">{t('step2.countries.algeria')}</option>
                          <option value="egypt" className="bg-[#0D0D0D]">{t('step2.countries.egypt')}</option>
                          <option value="mauritania" className="bg-[#0D0D0D]">{t('step2.countries.mauritania')}</option>
                          <option value="uae" className="bg-[#0D0D0D]">{t('step2.countries.uae')}</option>
                          <option value="saudiArabia" className="bg-[#0D0D0D]">{t('step2.countries.saudiArabia')}</option>
                          <option value="france" className="bg-[#0D0D0D]">{t('step2.countries.france')}</option>
                          <option value="unitedKingdom" className="bg-[#0D0D0D]">{t('step2.countries.unitedKingdom')}</option>
                          <option value="unitedStates" className="bg-[#0D0D0D]">{t('step2.countries.unitedStates')}</option>
                          <option value="other" className="bg-[#0D0D0D]">{t('step2.countries.other')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                          {t('step3.phone')}
                        </label>
                        <input
                          type="tel"
                          value={formState.phone}
                          onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                          className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors placeholder:text-[#333333]"
                          placeholder={t('step3.phonePlaceholder')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Direct Contact */}
                  <div className="mt-8 p-4 border border-[rgba(74,123,95,0.15)] bg-[rgba(74,123,95,0.03)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-[13px]">📧</span>
                      <div>
                        <p className="text-[12px] text-white/70">{t('step3.whatsappText')}</p>
                        <a
                          href="mailto:contact@harchcorp.com"
                          className="text-[12px] text-[#4A7B5F] hover:text-[#5A9B7F] font-semibold transition-colors"
                        >
                          {t('step3.whatsappLink')}
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
                    <ArrowLeft size={14} /> {tc('back')}
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
                    {t('step4.title')} <ArrowRight size={14} />
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
                <p className="section-label mb-4">{t('progress.step')} 4 {t('progress.of')} 4</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-[-0.01em] mb-3">
                  {t('step4.title')}
                </h2>
                <p className="text-[14px] text-[#666666] mb-10">
                  {t('step4.description')}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Vertical Summary */}
                    <div className="card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="section-label">{t('step4.selectedVertical')}</p>
                        <button onClick={() => setCurrentStep(1)} className="text-[11px] text-[#8B9DAF] hover:text-white transition-colors">{t('step4.edit')}</button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[rgba(139,157,175,0.08)] flex items-center justify-center">
                          {selectedVerticalData && <selectedVerticalData.icon size={18} className="text-[#8B9DAF]" strokeWidth={1.5} />}
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-white">{selectedVertical && t(`step1.verticals.${selectedVertical}.name`)}</h3>
                          <p className="text-[12px] text-[#666666]">{selectedVerticalData?.stat} {tc('capacity')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Project Summary */}
                    <div className="card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="section-label">{t('step4.projectDetails')}</p>
                        <button onClick={() => setCurrentStep(2)} className="text-[11px] text-[#8B9DAF] hover:text-white transition-colors">{t('step4.edit')}</button>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)] w-20 shrink-0 pt-0.5">{t('form.type')}</span>
                          <span className="text-[14px] text-white">{selectedProjectType}</span>
                        </div>
                        <div className="flex items-start gap-4">
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)] w-20 shrink-0 pt-0.5">{t('form.budget')}</span>
                          <span className="text-[14px] text-white">{selectedBudget && t(`step2.budgetRanges.${selectedBudget}`)}</span>
                        </div>
                        <div className="flex items-start gap-4">
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)] w-20 shrink-0 pt-0.5">{t('form.timeline')}</span>
                          <span className="text-[14px] text-white">{selectedTimeline && t(`step2.timelines.${selectedTimeline}`)}</span>
                        </div>
                        {projectDesc && (
                          <div className="flex items-start gap-4">
                            <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)] w-20 shrink-0 pt-0.5">{t('form.details')}</span>
                            <span className="text-[13px] text-[#999999] leading-relaxed">{projectDesc}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Summary */}
                    <div className="card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="section-label">{t('step4.contactInfo')}</p>
                        <button onClick={() => setCurrentStep(3)} className="text-[11px] text-[#8B9DAF] hover:text-white transition-colors">{t('step4.edit')}</button>
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                        <div>
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)]">{t('form.name')}</span>
                          <p className="text-[14px] text-white mt-1">{formState.name}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)]">{t('form.email')}</span>
                          <p className="text-[14px] text-white mt-1">{formState.email}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)]">{t('form.org')}</span>
                          <p className="text-[14px] text-white mt-1">{formState.organization}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)]">{t('form.designation')}</span>
                          <p className="text-[14px] text-white mt-1">{formState.designation || '—'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)]">{t('form.country')}</span>
                          <p className="text-[14px] text-white mt-1">{formState.country || '—'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold tracking-[0.12em] text-[#444444] font-[family-name:var(--font-space-mono)]">{t('form.phone')}</span>
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
                          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">{t('responseTime')}</span>
                        </div>
                        <p className="text-[24px] font-extrabold text-white font-[family-name:var(--font-space-mono)]">24h</p>
                        <p className="text-[12px] text-[#666666] mt-1">{t('responseTimeDesc')}</p>
                      </div>
                    </FadeIn>

                    <FadeIn delay={0.15}>
                      <div className="card p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield size={12} className="text-[#8B9DAF]" />
                          <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">{t('dataSovereignty')}</span>
                        </div>
                        <p className="text-[12px] text-[#999999] leading-relaxed">
                          {t('dataSovereigntyDesc')}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {t.raw('badges').map((b: string) => (
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
                        {transmitStep === 1 && t('encrypting')}
                        {transmitStep === 2 && t('routing')}
                        {transmitStep === 3 && t('transmitting')}
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

                {submitError && (
                  <div className="mt-6 px-4 py-3 bg-[rgba(160,82,75,0.08)] border border-[rgba(160,82,75,0.15)] rounded-lg">
                    <span className="text-[12px] text-[#A0524B]">{submitError}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-10">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 text-[13px] text-[#666666] hover:text-white transition-colors"
                  >
                    <ArrowLeft size={14} /> {tc('back')}
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Lock size={10} className="text-[#666666]" />
                      <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">{tc('encrypted')}</span>
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold hover:bg-[#CCCCCC] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? t('step4.submitting') || 'Submitting...' : t('step4.submit')} <ArrowRight size={14} />
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
