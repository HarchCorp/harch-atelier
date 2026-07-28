'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { FadeIn } from '@/components/ui/motion';
import {
  ArrowLeft, ArrowRight, Cpu, Database, Network, Globe,
  Download, Calculator, CheckCircle2, TrendingDown, Zap,
  Shield, BarChart3, Info
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── MAIN COMPONENT ─── */
export default function CalculatorPageClient() {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const tCommon = useTranslations('common');

  const [gpuType, setGpuType] = useState('H100');
  const [gpuCount, setGpuCount] = useState(8);
  const [gpuHours, setGpuHours] = useState(730);
  const [storageType, setStorageType] = useState('NVMe');
  const [storageCapacity, setStorageCapacity] = useState(2000);
  const [egressBandwidth, setEgressBandwidth] = useState(5);
  const [cdnEnabled, setCdnEnabled] = useState(false);
  const [region, setRegion] = useState('morocco');

  const gpuPrices: Record<string, number> = {
    A100: 1.80,
    H100: 2.10,
    L40S: 1.40,
  };

  const gpuCarbonIntensity: Record<string, number> = {
    A100: 95,
    H100: 18,
    L40S: 32,
  };

  const regions = [
    { id: 'morocco', name: t('calculator.regions.morocco'), hubs: 5, gpus: 1798, avgCarbon: 47, avgRenewable: 81.5 },
    { id: 'algeria', name: t('calculator.regions.algeria'), hubs: 0, gpus: 0, avgCarbon: 450, avgRenewable: 1.5 },
    { id: 'tunisia', name: t('calculator.regions.tunisia'), hubs: 0, gpus: 0, avgCarbon: 420, avgRenewable: 3.0 },
    { id: 'egypt', name: t('calculator.regions.egypt'), hubs: 0, gpus: 0, avgCarbon: 380, avgRenewable: 12.0 },
    { id: 'nigeria', name: t('calculator.regions.nigeria'), hubs: 0, gpus: 0, avgCarbon: 350, avgRenewable: 18.0 },
    { id: 'kenya', name: t('calculator.regions.kenya'), hubs: 0, gpus: 0, avgCarbon: 280, avgRenewable: 75.0 },
    { id: 'south-africa', name: t('calculator.regions.southAfrica'), hubs: 0, gpus: 0, avgCarbon: 500, avgRenewable: 8.0 },
    { id: 'senegal', name: t('calculator.regions.senegal'), hubs: 0, gpus: 0, avgCarbon: 380, avgRenewable: 22.0 },
    { id: 'ghana', name: t('calculator.regions.ghana'), hubs: 0, gpus: 0, avgCarbon: 320, avgRenewable: 28.0 },
    { id: 'ethiopia', name: t('calculator.regions.ethiopia'), hubs: 0, gpus: 0, avgCarbon: 150, avgRenewable: 90.0 },
    { id: 'ivory-coast', name: t('calculator.regions.ivoryCoast'), hubs: 0, gpus: 0, avgCarbon: 360, avgRenewable: 25.0 },
  ];

  const cloudComparison: Record<string, { aws: number; gcp: number; azure: number }> = {
    A100: { aws: 0.90, gcp: 0.85, azure: 0.88 },
    H100: { aws: 3.50, gcp: 3.30, azure: 3.40 },
    L40S: { aws: 1.20, gcp: 1.10, azure: 1.15 },
  };

  const storagePrices: Record<string, number> = {
    SSD: 0.02,
    NVMe: 0.04,
  };

  const costs = useMemo(() => {
    const computeCost = gpuPrices[gpuType] * gpuCount * gpuHours;
    const carbonIntensity = gpuCarbonIntensity[gpuType];
    const estimatedCO2 = (carbonIntensity * gpuCount * 0.3 * gpuHours / 1000).toFixed(1); // rough estimate: 0.3 kWh per GPU-hour
    const storageCost = storagePrices[storageType] * storageCapacity;
    const networkCost = egressBandwidth * 0.05 * 730 + (cdnEnabled ? 50 : 0);
    const totalMonthly = computeCost + storageCost + networkCost;
    const totalAnnual = totalMonthly * 12;
    const annualWithDiscount = totalAnnual * 0.7;

    const awsCost = cloudComparison[gpuType].aws * gpuCount * gpuHours + storageCost * 1.4 + networkCost * 1.3;
    const gcpCost = cloudComparison[gpuType].gcp * gpuCount * gpuHours + storageCost * 1.35 + networkCost * 1.25;
    const azureCost = cloudComparison[gpuType].azure * gpuCount * gpuHours + storageCost * 1.38 + networkCost * 1.28;

    return {
      computeCost,
      storageCost,
      networkCost,
      totalMonthly,
      totalAnnual,
      annualWithDiscount,
      awsCost,
      gcpCost,
      azureCost,
      savingsVsAws: Math.round((1 - totalMonthly / awsCost) * 100),
      savingsVsGcp: Math.round((1 - totalMonthly / gcpCost) * 100),
      savingsVsAzure: Math.round((1 - totalMonthly / azureCost) * 100),
      carbonIntensity,
      estimatedCO2,
    };
  }, [gpuType, gpuCount, gpuHours, storageType, storageCapacity, egressBandwidth, cdnEnabled, region]);

  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <Link href="/pricing" className="inline-flex items-center gap-2 text-[13px] text-[#666666] hover:text-white transition-colors mb-8">
              <ArrowLeft size={14} /> {t('calculator.backToPricing')}
            </Link>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="section-label mb-6 text-[#10B981]">{t('calculator.heroLabel')}</p>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              {t('calculator.heroTitle')}<span className="text-[#10B981]">.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed">
              {t('calculator.heroSubtitle')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CALCULATOR
          ═══════════════════════════════════════════ */}
      <section className="pb-28 md:pb-36">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* ─── Left: Configuration ─── */}
              <div className="lg:col-span-2 space-y-6">

                {/* Compute */}
                <div className="card p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(139,157,175,0.08)] flex items-center justify-center">
                      <Cpu size={20} className="text-[#8B9DAF]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{t('calculator.computeTitle')}</h3>
                  </div>

                  {/* GPU Type */}
                  <div className="mb-6">
                    <label className="text-[12px] text-[#666666] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)] mb-3 block">{t('calculator.gpuType')}</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['A100', 'H100', 'L40S'].map((gpu) => (
                        <button
                          key={gpu}
                          onClick={() => setGpuType(gpu)}
                          className={`px-4 py-3 rounded-lg text-[13px] font-semibold transition-all border ${
                            gpuType === gpu
                              ? 'bg-[rgba(139,157,175,0.08)] border-[rgba(139,157,175,0.3)] text-white'
                              : 'border-white/[0.06] text-[#999999] hover:border-white/12 hover:text-white'
                          }`}
                        >
                          <p className="font-bold">{gpu}</p>
                          <p className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)] mt-0.5">${gpuPrices[gpu]}/{t('calculator.pricePerHour')}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* GPU Count */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[12px] text-[#666666] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)]">{t('calculator.gpuCount')}</label>
                      <span className="text-[13px] text-[#8B9DAF] font-[family-name:var(--font-space-mono)] stat-mono">{gpuCount}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={800}
                      step={1}
                      value={gpuCount}
                      onChange={(e) => setGpuCount(Number(e.target.value))}
                      className="w-full h-1.5 bg-[rgba(255,255,255,0.08)] rounded-full appearance-none cursor-pointer accent-[#8B9DAF]"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-[#666666]">1</span>
                      <span className="text-[10px] text-[#666666]">800</span>
                    </div>
                  </div>

                  {/* Hours per Month */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[12px] text-[#666666] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)]">{t('calculator.hoursPerMonth')}</label>
                      <span className="text-[13px] text-[#8B9DAF] font-[family-name:var(--font-space-mono)] stat-mono">{gpuHours}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={730}
                      step={1}
                      value={gpuHours}
                      onChange={(e) => setGpuHours(Number(e.target.value))}
                      className="w-full h-1.5 bg-[rgba(255,255,255,0.08)] rounded-full appearance-none cursor-pointer accent-[#8B9DAF]"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-[#666666]">{t('calculator.hoursRangeMin')}</span>
                      <span className="text-[10px] text-[#666666]">{t('calculator.hoursRangeMax')}</span>
                    </div>
                  </div>
                </div>

                {/* Storage */}
                <div className="card p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(139,92,246,0.08)] flex items-center justify-center">
                      <Database size={20} className="text-[#8B5CF6]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{t('calculator.storageTitle')}</h3>
                  </div>

                  {/* Storage Type */}
                  <div className="mb-6">
                    <label className="text-[12px] text-[#666666] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)] mb-3 block">{t('calculator.storageType')}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['SSD', 'NVMe'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setStorageType(type)}
                          className={`px-4 py-3 rounded-lg text-[13px] font-semibold transition-all border ${
                            storageType === type
                              ? 'bg-[rgba(139,92,246,0.08)] border-[rgba(139,92,246,0.3)] text-white'
                              : 'border-white/[0.06] text-[#999999] hover:border-white/12 hover:text-white'
                          }`}
                        >
                          <p className="font-bold">{type}</p>
                          <p className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)] mt-0.5">${storagePrices[type]}/{t('calculator.pricePerGbMo')}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Capacity */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[12px] text-[#666666] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)]">{t('calculator.capacityLabel')}</label>
                      <span className="text-[13px] text-[#8B5CF6] font-[family-name:var(--font-space-mono)] stat-mono">{storageCapacity >= 1000 ? `${(storageCapacity / 1000).toFixed(1)} TB` : `${storageCapacity} GB`}</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={50000}
                      step={10}
                      value={storageCapacity}
                      onChange={(e) => setStorageCapacity(Number(e.target.value))}
                      className="w-full h-1.5 bg-[rgba(255,255,255,0.08)] rounded-full appearance-none cursor-pointer accent-[#8B5CF6]"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-[#666666]">{t('calculator.storageRangeMin')}</span>
                      <span className="text-[10px] text-[#666666]">{t('calculator.storageRangeMax')}</span>
                    </div>
                  </div>
                </div>

                {/* Network */}
                <div className="card p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(245,158,11,0.08)] flex items-center justify-center">
                      <Network size={20} className="text-[#F59E0B]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{t('calculator.networkTitle')}</h3>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[12px] text-[#666666] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)]">{t('calculator.egressBandwidth')}</label>
                      <span className="text-[13px] text-[#F59E0B] font-[family-name:var(--font-space-mono)] stat-mono">{egressBandwidth} Gbps</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={egressBandwidth}
                      onChange={(e) => setEgressBandwidth(Number(e.target.value))}
                      className="w-full h-1.5 bg-[rgba(255,255,255,0.08)] rounded-full appearance-none cursor-pointer accent-[#F59E0B]"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-[#666666]">{t('calculator.bandwidthRangeMin')}</span>
                      <span className="text-[10px] text-[#666666]">{t('calculator.bandwidthRangeMax')}</span>
                    </div>
                  </div>

                  {/* CDN Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/[0.04]">
                    <div>
                      <p className="text-[13px] font-semibold text-white">{t('calculator.cdnLabel')}</p>
                      <p className="text-[11px] text-[#666666]">{t('calculator.cdnDescription')}</p>
                    </div>
                    <button
                      onClick={() => setCdnEnabled(!cdnEnabled)}
                      className={`w-11 h-6 rounded-full transition-all relative ${cdnEnabled ? 'bg-[#10B981]' : 'bg-[rgba(255,255,255,0.1)]'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${cdnEnabled ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>

                {/* Region Selector */}
                <div className="card p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(16,185,129,0.08)] flex items-center justify-center">
                      <Globe size={20} className="text-[#10B981]" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{t('calculator.regionTitle')}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {regions.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setRegion(r.id)}
                        className={`px-4 py-3 rounded-lg text-[13px] font-semibold transition-all border text-left ${
                          region === r.id
                            ? 'bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.3)] text-white'
                            : 'border-white/[0.06] text-[#999999] hover:border-white/12 hover:text-white'
                        }`}
                      >
                        <p className="font-bold">{r.name}</p>
                        <p className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)] mt-0.5">
                          {r.hubs > 0 ? `${r.gpus} ${t('calculator.gpus')} • ${r.avgCarbon} ${t('calculator.gco2kwh')}` : tCommon('comingSoon')}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ─── Right: Cost Summary ─── */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24 space-y-6">
                  {/* Monthly Estimate */}
                  <div className="card p-8">
                    <p className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-bold mb-6 font-[family-name:var(--font-space-mono)]">{t('calculator.monthlyEstimate')}</p>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-[#999999]">{t('calculator.computeTitle')}</span>
                        <span className="text-[13px] text-white font-[family-name:var(--font-space-mono)] stat-mono">${costs.computeCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-[#999999]">{t('calculator.storageTitle')}</span>
                        <span className="text-[13px] text-white font-[family-name:var(--font-space-mono)] stat-mono">${costs.storageCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-[#999999]">{t('calculator.networkTitle')}</span>
                        <span className="text-[13px] text-white font-[family-name:var(--font-space-mono)] stat-mono">${costs.networkCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="h-px bg-white/[0.06] mb-4" />

                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[15px] font-bold text-white">{t('calculator.totalPerMonth')}</span>
                      <span className="text-2xl font-extrabold text-white stat-mono">${costs.totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-[11px] text-[#666666]">{t('calculator.estimatedExcludesTaxes')}</p>
                  </div>

                  {/* Carbon Intensity Estimate */}
                  <div className="card p-8 border-[rgba(139,157,175,0.15)]">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 size={16} className="text-[#8B9DAF]" />
                      <p className="text-[10px] text-[#8B9DAF] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)]">{t('calculator.carbonEstimate')}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-[#999999]">{t('calculator.carbonIntensity')}</span>
                        <span className={`text-[13px] font-bold font-[family-name:var(--font-space-mono)] ${costs.carbonIntensity <= 50 ? 'text-[#10B981]' : costs.carbonIntensity <= 100 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>
                          {costs.carbonIntensity} {t('calculator.gco2kwh')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-[#999999]">{t('calculator.estCo2Monthly')}</span>
                        <span className="text-[13px] text-white font-[family-name:var(--font-space-mono)] stat-mono">{costs.estimatedCO2} kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] text-[#999999]">{t('calculator.vsIndustryAvg')}</span>
                        <span className="text-[13px] text-[#10B981] font-semibold">{t('calculator.lowerPercent')}</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-[rgba(139,157,175,0.04)] border border-[rgba(139,157,175,0.1)]">
                      <p className="text-[11px] text-[#999999]">{t('calculator.carbonAwareDescription')}</p>
                    </div>
                  </div>

                  {/* Annual Savings */}
                  <div className="card p-8 border-[rgba(16,185,129,0.15)]">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingDown size={16} className="text-[#10B981]" />
                      <p className="text-[10px] text-[#10B981] uppercase tracking-[0.15em] font-bold font-[family-name:var(--font-space-mono)]">{t('calculator.annualPricing')}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-[12px] text-[#666666] mb-1">{t('calculator.monthlyNoCommitment')}</p>
                      <p className="text-[16px] text-white stat-mono">${costs.totalAnnual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-[12px] text-[#666666]">/{t('calculator.yearUnit')}</span></p>
                    </div>
                    <div className="mb-4">
                      <p className="text-[12px] text-[#10B981] mb-1 font-semibold">{t('calculator.annualDiscount')}</p>
                      <p className="text-[20px] font-bold text-white stat-mono">${costs.annualWithDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-[12px] text-[#666666]">/{t('calculator.yearUnit')}</span></p>
                    </div>
                    <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.04)] border border-[rgba(16,185,129,0.1)]">
                      <p className="text-[11px] text-[#10B981] font-semibold">
                        {t('calculator.saveWithAnnual', { amount: (costs.totalAnnual - costs.annualWithDiscount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) })}
                      </p>
                    </div>
                  </div>

                  {/* Cloud Comparison */}
                  <div className="card p-8">
                    <p className="text-[10px] text-[#666666] uppercase tracking-[0.15em] font-bold mb-6 font-[family-name:var(--font-space-mono)]">{t('calculator.cloudComparison')}</p>

                    <div className="space-y-4">
                      {/* HarchOS */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.15)]">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-[#10B981]" />
                          <span className="text-[13px] font-bold text-white">{t('calculator.providers.harchos')}</span>
                        </div>
                        <span className="text-[14px] font-bold text-[#10B981] stat-mono">${costs.totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{t('calculator.monthUnit')}</span>
                      </div>

                      {/* AWS */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/[0.04]">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] text-[#999999]">{t('calculator.providers.aws')}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[13px] text-[#999999] stat-mono">${costs.awsCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{t('calculator.monthUnit')}</span>
                          <span className="ml-2 text-[11px] font-bold text-[#EF4444]">+{costs.savingsVsAws > 0 ? Math.abs(costs.savingsVsAws) : 0}%</span>
                        </div>
                      </div>

                      {/* GCP */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/[0.04]">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] text-[#999999]">{t('calculator.providers.gcp')}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[13px] text-[#999999] stat-mono">${costs.gcpCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{t('calculator.monthUnit')}</span>
                          <span className="ml-2 text-[11px] font-bold text-[#EF4444]">+{costs.savingsVsGcp > 0 ? Math.abs(costs.savingsVsGcp) : 0}%</span>
                        </div>
                      </div>

                      {/* Azure */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/[0.04]">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] text-[#999999]">{t('calculator.providers.azure')}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[13px] text-[#999999] stat-mono">${costs.azureCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{t('calculator.monthUnit')}</span>
                          <span className="ml-2 text-[11px] font-bold text-[#EF4444]">+{costs.savingsVsAzure > 0 ? Math.abs(costs.savingsVsAzure) : 0}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-[rgba(139,157,175,0.04)] border border-[rgba(139,157,175,0.1)]">
                      <Info size={14} className="text-[#8B9DAF] mt-0.5 shrink-0" />
                      <p className="text-[11px] text-[#999999]">{t('calculator.comparisonDisclaimer')}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Link href="/developers" className="w-full inline-flex items-center justify-center gap-2.5 bg-white text-black px-6 py-4 rounded-lg text-[13px] font-semibold hover:bg-white/90 transition-all">
                      {t('calculator.startFreeTrial')} <ArrowRight size={14} />
                    </Link>
                    <Link href="/contact" className="w-full inline-flex items-center justify-center gap-2.5 border border-white/12 text-white px-6 py-4 rounded-lg text-[13px] font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                      {t('calculator.contactSales')}
                    </Link>
                    <button
                      onClick={async () => {
                        try {
                          const url = `/api/pdf/gpu-compute-datasheet?locale=${locale}`;
                          const response = await fetch(url);
                          if (!response.ok) throw new Error('Failed to generate PDF');
                          const blob = await response.blob();
                          const downloadUrl = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = downloadUrl;
                          link.download = `harchcorp-gpu-compute-datasheet-${locale}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(downloadUrl);
                        } catch (error) {
                          console.error('PDF download error:', error);
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 text-[12px] text-[#666666] hover:text-[#999999] transition-colors py-2"
                    >
                      <Download size={12} /> {t('calculator.downloadEstimatePdf')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
