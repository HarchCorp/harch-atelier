'use client';

import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Leaf, Zap, Clock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type CalcType = 'gpu-cost' | 'tco' | 'pue' | 'carbon' | 'training-time' | 'inference-throughput';

const gpuPricing = {
  'H100': { onDemand: 2.80, spot: 1.00, memory: 80, power: 700 },
  'H200': { onDemand: 4.20, spot: 1.50, memory: 141, power: 700 },
  'A100-80GB': { onDemand: 2.00, spot: 0.70, memory: 80, power: 400 },
  'A100-40GB': { onDemand: 1.60, spot: 0.55, memory: 40, power: 400 },
  'B200': { onDemand: 6.50, spot: 2.30, memory: 192, power: 1000 },
};

export function CalculatorEngine({ type }: { type: CalcType }) {
  if (type === 'gpu-cost') return <GPUCostCalculator />;
  if (type === 'tco') return <TCOCalculator />;
  if (type === 'pue') return <PUECalculator />;
  if (type === 'carbon') return <CarbonCalculator />;
  if (type === 'training-time') return <TrainingTimeCalculator />;
  if (type === 'inference-throughput') return <InferenceThroughputCalculator />;
  return null;
}

function Slider({ label, value, onChange, min, max, step, unit }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; unit: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm text-zinc-300">{label}</label>
        <span className="font-mono text-sm font-bold text-emerald-400">
          {value.toLocaleString()} <span className="text-xs text-zinc-500">{unit}</span>
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-emerald-400" />
    </div>
  );
}

function Select<T extends string>({ label, value, onChange, options }: {
  label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-zinc-300">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-400/50">
        {options.map((o) => <option key={o.value} value={o.value} className="bg-zinc-900">{o.label}</option>)}
      </select>
    </div>
  );
}

function ResultCard({ label, value, unit, icon, color = 'emerald' }: {
  label: string; value: string; unit: string; icon: React.ReactNode; color?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose';
}) {
  const colorClasses = {
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    cyan: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
    violet: 'border-violet-500/20 bg-violet-500/5 text-violet-400',
    amber: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
    rose: 'border-rose-500/20 bg-rose-500/5 text-rose-400',
  };
  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white font-mono">
        {value}<span className="text-sm text-zinc-500 ml-1">{unit}</span>
      </div>
    </div>
  );
}

function GPUCostCalculator() {
  const [gpu, setGpu] = useState<keyof typeof gpuPricing>('H100');
  const [numGpus, setNumGpus] = useState(8);
  const [hours, setHours] = useState(24);
  const [days, setDays] = useState(30);
  const [mode, setMode] = useState<'on-demand' | 'spot'>('on-demand');

  const pricing = gpuPricing[gpu];
  const hourlyRate = mode === 'on-demand' ? pricing.onDemand : pricing.spot;
  const hourlyCost = numGpus * hourlyRate;
  const dailyCost = hourlyCost * hours;
  const monthlyCost = dailyCost * days;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Select label="GPU Model" value={gpu} onChange={setGpu}
          options={Object.keys(gpuPricing).map((g) => ({ value: g as keyof typeof gpuPricing, label: `${g} (${gpuPricing[g as keyof typeof gpuPricing].memory}GB)` }))} />
        <Select label="Pricing Mode" value={mode} onChange={setMode}
          options={[{ value: 'on-demand' as const, label: 'On-Demand (guaranteed)' }, { value: 'spot' as const, label: 'Spot (60-70% cheaper)' }]} />
      </div>
      <Slider label="Number of GPUs" value={numGpus} onChange={setNumGpus} min={1} max={256} step={1} unit="GPUs" />
      <Slider label="Hours per day" value={hours} onChange={setHours} min={1} max={24} step={1} unit="hrs" />
      <Slider label="Days per month" value={days} onChange={setDays} min={1} max={31} step={1} unit="days" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <ResultCard label="Hourly" value={`$${hourlyCost.toFixed(2)}`} unit="/hr" icon={<Zap className="h-4 w-4" />} />
        <ResultCard label="Daily" value={`$${dailyCost.toFixed(2)}`} unit="/day" icon={<Clock className="h-4 w-4" />} color="cyan" />
        <ResultCard label="Monthly" value={`$${monthlyCost.toFixed(0)}`} unit="/mo" icon={<TrendingUp className="h-4 w-4" />} color="violet" />
        <ResultCard label="Rate" value={`$${hourlyRate.toFixed(2)}`} unit={`/GPU/hr`} icon={<Calculator className="h-4 w-4" />} color="amber" />
      </div>

      <div className="rounded-xl bg-white/5 p-4 text-sm text-zinc-400">
        <strong className="text-white">{gpu}</strong> specs: {pricing.memory}GB HBM, {pricing.power}W TDP.
        Spot pricing saves {((1 - pricing.spot / pricing.onDemand) * 100).toFixed(0)}% vs on-demand.
      </div>
    </div>
  );
}

function TCOCalculator() {
  const [workload, setWorkload] = useState<'training' | 'inference' | 'mixed'>('training');
  const [utilization, setUtilization] = useState(50);
  const [numGpus, setNumGpus] = useState(8);
  const [years, setYears] = useState(3);

  // Cloud costs
  const cloudHourly = numGpus * 2.80; // H100 on-demand
  const cloudAnnual = cloudHourly * 24 * 365 * (utilization / 100);
  const cloudTotal = cloudAnnual * years;

  // On-premises costs
  const gpuCost = numGpus * 30000; // $30K per H100
  const serverCost = numGpus * 5000; // server overhead
  const datacenterCost = numGpus * 8000; // datacenter buildout per GPU
  const powerCost = numGpus * 0.7 * 24 * 365 * 0.10 * years; // 700W * $0.10/kWh
  const staffCost = 200000 * years; // 2 FTE
  const maintenanceCost = (gpuCost + serverCost) * 0.10 * years;
  const onPremTotal = gpuCost + serverCost + datacenterCost + powerCost + staffCost + maintenanceCost;

  const recommendation = cloudTotal < onPremTotal ? 'GPU Cloud' : 'On-Premises';
  const savings = Math.abs(cloudTotal - onPremTotal);

  return (
    <div className="space-y-6">
      <Select label="Workload Type" value={workload} onChange={setWorkload}
        options={[
          { value: 'training' as const, label: 'AI Training' },
          { value: 'inference' as const, label: 'AI Inference' },
          { value: 'mixed' as const, label: 'Mixed (Training + Inference)' },
        ]} />
      <Slider label="GPU Utilization" value={utilization} onChange={setUtilization} min={10} max={95} step={5} unit="%" />
      <Slider label="Number of H100 GPUs" value={numGpus} onChange={setNumGpus} min={1} max={64} step={1} unit="GPUs" />
      <Slider label="Time Horizon" value={years} onChange={setYears} min={1} max={5} step={1} unit="years" />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <div className="text-xs uppercase tracking-wider text-cyan-400 mb-2">GPU Cloud (Harch Corp)</div>
          <div className="text-2xl font-bold text-white font-mono">${(cloudTotal / 1000).toFixed(0)}K</div>
          <div className="text-xs text-zinc-500 mt-1">{years} years total</div>
          <div className="text-xs text-zinc-500">No upfront · OPEX</div>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="text-xs uppercase tracking-wider text-amber-400 mb-2">On-Premises</div>
          <div className="text-2xl font-bold text-white font-mono">${(onPremTotal / 1000).toFixed(0)}K</div>
          <div className="text-xs text-zinc-500 mt-1">{years} years total</div>
          <div className="text-xs text-zinc-500">High upfront · CAPEX</div>
        </div>
      </div>

      <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
        <div className="text-sm text-zinc-300">
          <strong className="text-emerald-400">Recommendation: {recommendation}</strong>
          <br />
          Save <strong className="text-white">${(savings / 1000).toFixed(0)}K</strong> over {years} years.
          {utilization < 50 && ' Low utilization favors cloud (pay per use).'}
          {utilization >= 50 && utilization < 70 && ' Medium utilization — both options are viable.'}
          {utilization >= 70 && ' High utilization favors on-premises (amortize hardware).'}
        </div>
      </div>
    </div>
  );
}

function PUECalculator() {
  const [itPower, setItPower] = useState(500);
  const [coolingPower, setCoolingPower] = useState(150);
  const [otherPower, setOtherPower] = useState(50);

  const totalPower = itPower + coolingPower + otherPower;
  const pue = totalPower / itPower;

  let rating = 'Poor';
  let colorClass = 'border-rose-500/20 bg-rose-500/5 text-rose-400';
  if (pue <= 1.20) { rating = 'Excellent'; colorClass = 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'; }
  else if (pue <= 1.40) { rating = 'Good'; colorClass = 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400'; }
  else if (pue <= 1.60) { rating = 'Average'; colorClass = 'border-amber-500/20 bg-amber-500/5 text-amber-400'; }

  return (
    <div className="space-y-6">
      <Slider label="IT Equipment Power" value={itPower} onChange={setItPower} min={100} max={5000} step={50} unit="kW" />
      <Slider label="Cooling Power" value={coolingPower} onChange={setCoolingPower} min={0} max={2000} step={10} unit="kW" />
      <Slider label="Other (lighting, UPS, etc.)" value={otherPower} onChange={setOtherPower} min={0} max={500} step={10} unit="kW" />

      <div className={`rounded-xl border p-6 text-center ${colorClass}`}>
        <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Your PUE</div>
        <div className="text-5xl font-bold text-white font-mono">{pue.toFixed(2)}</div>
        <div className="mt-2 text-sm font-semibold">{rating}</div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="rounded-lg bg-white/5 p-3">
          <div className="text-zinc-500">Total Power</div>
          <div className="font-mono text-white">{totalPower} kW</div>
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <div className="text-zinc-500">Cooling %</div>
          <div className="font-mono text-white">{((coolingPower / totalPower) * 100).toFixed(0)}%</div>
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <div className="text-zinc-500">Efficiency</div>
          <div className="font-mono text-emerald-400">{((1 / pue) * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="rounded-xl bg-white/5 p-4 text-sm text-zinc-400">
        <strong className="text-white">Benchmark:</strong> Industry average PUE = 1.55. Hyperscale best-in-class = 1.10-1.20.
        Harch Corp achieves <strong className="text-emerald-400">PUE 1.08-1.24</strong> with liquid cooling and free cooling.
      </div>
    </div>
  );
}

function CarbonCalculator() {
  const [gpu, setGpu] = useState<keyof typeof gpuPricing>('H100');
  const [numGpus, setNumGpus] = useState(8);
  const [hours, setHours] = useState(1000);
  const [provider, setProvider] = useState<'harch' | 'aws' | 'azure' | 'gcp'>('harch');

  const carbonIntensities = { harch: 47, aws: 350, azure: 380, gcp: 320 };
  const intensity = carbonIntensities[provider];
  const powerPerGPU = gpuPricing[gpu].power / 1000; // kW
  const totalEnergy = numGpus * powerPerGPU * hours; // kWh
  const carbon = (totalEnergy * intensity) / 1000; // kg CO2

  const harchCarbon = (totalEnergy * 47) / 1000;
  const savings = carbon - harchCarbon;
  const treesEquivalent = Math.round(carbon / 21); // 1 tree absorbs ~21kg CO2/year

  return (
    <div className="space-y-6">
      <Select label="GPU Model" value={gpu} onChange={setGpu}
        options={Object.keys(gpuPricing).map((g) => ({ value: g as keyof typeof gpuPricing, label: g }))} />
      <Select label="Cloud Provider" value={provider} onChange={setProvider}
        options={[
          { value: 'harch' as const, label: 'Harch Corp (47 gCO2/kWh)' },
          { value: 'aws' as const, label: 'AWS (350 gCO2/kWh avg)' },
          { value: 'azure' as const, label: 'Azure (380 gCO2/kWh avg)' },
          { value: 'gcp' as const, label: 'Google Cloud (320 gCO2/kWh avg)' },
        ]} />
      <Slider label="Number of GPUs" value={numGpus} onChange={setNumGpus} min={1} max={256} step={1} unit="GPUs" />
      <Slider label="Total Hours" value={hours} onChange={setHours} min={1} max={10000} step={1} unit="hrs" />

      <div className="grid grid-cols-2 gap-3">
        <ResultCard label="Carbon Footprint" value={carbon.toFixed(1)} unit="kg CO₂" icon={<Leaf className="h-4 w-4" />} color="emerald" />
        <ResultCard label="Trees to Offset" value={treesEquivalent.toString()} unit="trees/yr" icon={<Leaf className="h-4 w-4" />} color="emerald" />
      </div>

      {provider !== 'harch' && (
        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
          <div className="text-sm text-zinc-300">
            <strong className="text-emerald-400">Switch to Harch Corp:</strong> Save{' '}
            <strong className="text-white">{savings.toFixed(1)} kg CO₂</strong> ({((1 - harchCarbon / carbon) * 100).toFixed(0)}% reduction).
            Equivalent to planting <strong className="text-white">{Math.round(savings / 21)}</strong> trees.
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white/5 p-4 text-sm text-zinc-400">
        <strong className="text-white">Calculation:</strong> {numGpus} {gpu} × {gpuPricing[gpu].power}W × {hours}h × {intensity} gCO2/kWh.
        Harch Corp uses 100% renewable energy (solar + wind PPAs), achieving the lowest carbon intensity in the industry.
      </div>
    </div>
  );
}

function TrainingTimeCalculator() {
  const [modelSize, setModelSize] = useState(70);
  const [numGpus, setNumGpus] = useState(64);
  const [gpu, setGpu] = useState<'H100' | 'H200' | 'A100-80GB'>('H100');
  const [tokens, setTokens] = useState(1500);

  // Simplified: training time scales with model size and tokens, inversely with GPU count
  const gpuSpeed: Record<string, number> = { 'H100': 1.0, 'H200': 1.3, 'A100-80GB': 0.3 };
  const baseHours = (modelSize * 0.1 * tokens) / (numGpus * gpuSpeed[gpu]);
  const cost = baseHours * numGpus * (gpu === 'H100' ? 2.80 : gpu === 'H200' ? 4.20 : 2.00);

  return (
    <div className="space-y-6">
      <Slider label="Model Size" value={modelSize} onChange={setModelSize} min={1} max={175} step={1} unit="B params" />
      <Select label="GPU Type" value={gpu} onChange={setGpu}
        options={[
          { value: 'H100' as const, label: 'NVIDIA H100 (1.0x speed)' },
          { value: 'H200' as const, label: 'NVIDIA H200 (1.3x speed)' },
          { value: 'A100-80GB' as const, label: 'NVIDIA A100 80GB (0.3x speed)' },
        ]} />
      <Slider label="Number of GPUs" value={numGpus} onChange={setNumGpus} min={1} max={512} step={1} unit="GPUs" />
      <Slider label="Training Tokens" value={tokens} onChange={setTokens} min={100} max={5000} step={50} unit="B tokens" />

      <div className="grid grid-cols-2 gap-3">
        <ResultCard label="Training Time" value={baseHours < 24 ? baseHours.toFixed(1) : (baseHours / 24).toFixed(1)} unit={baseHours < 24 ? 'hours' : 'days'} icon={<Clock className="h-4 w-4" />} color="cyan" />
        <ResultCard label="Est. Cost" value={`$${(cost / 1000).toFixed(1)}K`} unit="" icon={<TrendingUp className="h-4 w-4" />} color="emerald" />
      </div>

      <div className="rounded-xl bg-white/5 p-4 text-sm text-zinc-400">
        <strong className="text-white">Estimate:</strong> Training a {modelSize}B parameter model on {tokens}B tokens
        with {numGpus} {gpu} GPUs. Actual time varies based on sequence length, batch size, and optimization techniques.
        Use distributed training (Megatron-LM, DeepSpeed) for models &gt;30B.
      </div>
    </div>
  );
}

function InferenceThroughputCalculator() {
  const [modelSize, setModelSize] = useState(13);
  const [gpu, setGpu] = useState<'H100' | 'H200' | 'A100-80GB'>('H100');
  const [numGpus, setNumGpus] = useState(1);
  const [precision, setPrecision] = useState<'FP16' | 'FP8' | 'INT8'>('FP16');

  // Simplified: tokens/second scales with GPU and inversely with model size
  const gpuPerf: Record<string, number> = { 'H100': 4000, 'H200': 6000, 'A100-80GB': 1500 };
  const precisionMult: Record<string, number> = { 'FP16': 1.0, 'FP8': 2.0, 'INT8': 2.5 };
  const throughput = (gpuPerf[gpu] / modelSize) * numGpus * precisionMult[precision];
  const costPer1M = (2.80 * 1000000) / (throughput * 3600); // $2.80/hr, 1M tokens

  return (
    <div className="space-y-6">
      <Slider label="Model Size" value={modelSize} onChange={setModelSize} min={1} max={175} step={1} unit="B params" />
      <Select label="GPU Type" value={gpu} onChange={setGpu}
        options={[
          { value: 'H100' as const, label: 'NVIDIA H100' },
          { value: 'H200' as const, label: 'NVIDIA H200 (1.5x faster)' },
          { value: 'A100-80GB' as const, label: 'NVIDIA A100 80GB (0.4x speed)' },
        ]} />
      <Slider label="Number of GPUs" value={numGpus} onChange={setNumGpus} min={1} max={64} step={1} unit="GPUs" />
      <Select label="Precision" value={precision} onChange={setPrecision}
        options={[
          { value: 'FP16' as const, label: 'FP16 (16-bit, baseline)' },
          { value: 'FP8' as const, label: 'FP8 (8-bit, 2x faster)' },
          { value: 'INT8' as const, label: 'INT8 (8-bit quantized, 2.5x faster)' },
        ]} />

      <div className="grid grid-cols-2 gap-3">
        <ResultCard label="Throughput" value={throughput.toFixed(0)} unit="tokens/sec" icon={<Activity className="h-4 w-4" />} color="cyan" />
        <ResultCard label="Cost per 1M tokens" value={`$${costPer1M.toFixed(2)}`} unit="" icon={<TrendingUp className="h-4 w-4" />} color="emerald" />
      </div>

      <div className="rounded-xl bg-white/5 p-4 text-sm text-zinc-400">
        <strong className="text-white">Estimate:</strong> Serving {modelSize}B model on {numGpus} {gpu} with {precision}.
        Actual throughput depends on sequence length, batching, and framework (vLLM, TensorRT-LLM, Triton).
        Use vLLM with PagedAttention for best results.
      </div>
    </div>
  );
}
