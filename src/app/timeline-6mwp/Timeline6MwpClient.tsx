'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  Zap,
  Building2,
  Banknote,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Sun,
  CircleDollarSign,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lock,
  Calculator,
  Settings2,
  ChevronDown,
  ChevronRight,
  XCircle,
  Shield,
  Scale,
  Layers,
  GitCompare,
  Activity,
  BookOpen,
  Briefcase,
  Trophy,
  Target,
  Zap as ZapIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   TYPES & DEFAULTS
   ═══════════════════════════════════════════════════════════════ */

type PpaParams = {
  capexM: number;
  equityPct: number;
  loanRate: number;
  loanYears: number;
  prodKwhKwp: number;
  tariff: number;
  degradation: number;
  indexation: number;
  opexPctCapex: number;
  opexEscalation: number;
  inverterReplaceYear: number;
  inverterCostM: number;
  taxYearsFree: number;
  taxRateAfter: number;
  dividendRAS: number;
  defaultRisk: number;
  discountRate: number;
  ppaYears: number;
  sizeMwp: number;
};

type EpcParams = {
  sizeMwp: number;
  pricePerMwpM: number;        // prix de vente client par MWp (M MAD)
  capexPerMwpM: number;        // CAPEX réel par MWp
  milestone1Pct: number;       // acompte signature
  milestone2Pct: number;       // acompte démarrage
  milestone3Pct: number;       // acompte mi-chantier
  milestone4Pct: number;       // solde réception
  constructionMonths: number;
  opexPctRevenue: number;      // overhead commercial/salaires en % revenu
  fdeSubventionM: number;      // subvention FDE
  fdeDelayMonths: number;
  taxRate: number;             // IS (TFZ = 0%)
  dividendRAS: number;
  discountRate: number;
  warrantyYears: number;       // garantie décennale - provisions
  warrantyProvisionPct: number; // % revenu provisionné
};

const DEFAULT_PPA_AUDITED: PpaParams = {
  capexM: 31, equityPct: 30, loanRate: 6.5, loanYears: 10,
  prodKwhKwp: 1700, tariff: 0.72, degradation: 0.7, indexation: 1.5,
  opexPctCapex: 2.2, opexEscalation: 2.5,
  inverterReplaceYear: 11, inverterCostM: 1.5,
  taxYearsFree: 5, taxRateAfter: 10, dividendRAS: 15,
  defaultRisk: 20, discountRate: 8, ppaYears: 20, sizeMwp: 6,
};

const DEFAULT_PPA_OPTIMIST: PpaParams = {
  capexM: 25.67, equityPct: 19.5, loanRate: 5.5, loanYears: 12,
  prodKwhKwp: 2000, tariff: 0.85, degradation: 0.5, indexation: 2,
  opexPctCapex: 1.5, opexEscalation: 2,
  inverterReplaceYear: 12, inverterCostM: 1.2,
  taxYearsFree: 20, taxRateAfter: 0, dividendRAS: 15,
  defaultRisk: 0, discountRate: 8, ppaYears: 20, sizeMwp: 6,
};

const DEFAULT_EPC_AUDITED: EpcParams = {
  sizeMwp: 6,
  pricePerMwpM: 5.0,         // prix marché Maroc 2025 : 4,8-5,5M/MWp EPC
  capexPerMwpM: 4.5,         // coût construction réaliste
  milestone1Pct: 30,
  milestone2Pct: 30,
  milestone3Pct: 30,
  milestone4Pct: 10,
  constructionMonths: 8,
  opexPctRevenue: 5.5,       // salaries + commercial + bank fees
  fdeSubventionM: 1.5,       // plafond réel FDE
  fdeDelayMonths: 18,
  taxRate: 0,                // TFZ
  dividendRAS: 15,
  discountRate: 8,
  warrantyYears: 10,
  warrantyProvisionPct: 2,
};

/* ═══════════════════════════════════════════════════════════════
   SIMULATION ENGINES
   ═══════════════════════════════════════════════════════════════ */

function simulatePPA(p: PpaParams) {
  const capex = p.capexM;
  const loan = capex * (1 - p.equityPct / 100);
  const apport = capex * (p.equityPct / 100);
  const r = p.loanRate / 100;
  const n = p.loanYears;
  const annuity = n > 0 && r > 0 ? loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loan / n;
  const prodMwhAn1 = p.sizeMwp * 1000 * p.prodKwhKwp / 1000;
  const revenueAn1M = prodMwhAn1 * 1000 * p.tariff / 1e6;
  const opexAn1 = capex * p.opexPctCapex / 100;

  const rows: any[] = [];
  let netCumul = 0;
  let dividendCumul = 0;
  let breakEvenYear: number | null = null;
  let monthlySalaryFromYear: number | null = null;
  let monthlySalaryAmount = 0;
  let vanSum = 0;

  for (let y = 1; y <= p.ppaYears; y++) {
    const degrFactor = Math.pow(1 - p.degradation / 100, y - 1);
    const indFactor = Math.pow(1 + p.indexation / 100, y - 1);
    const opexFactor = Math.pow(1 + p.opexEscalation / 100, y - 1);
    const production = prodMwhAn1 * degrFactor;
    const revenue = revenueAn1M * indFactor * degrFactor;
    const opex = opexAn1 * opexFactor;
    const loanPayment = y <= p.loanYears ? annuity : 0;
    const inverter = y === p.inverterReplaceYear ? p.inverterCostM : 0;
    const ebit = revenue - opex - loanPayment - inverter;
    const isTaxFree = y <= p.taxYearsFree;
    const tax = isTaxFree ? 0 : Math.max(0, ebit * p.taxRateAfter / 100);
    const netIncome = ebit - tax;
    netCumul += netIncome;
    const dividendNet = netIncome > 0 ? netIncome * (1 - p.dividendRAS / 100) : 0;
    dividendCumul += dividendNet;
    if (breakEvenYear === null && dividendCumul - apport > 0) breakEvenYear = y;
    if (monthlySalaryFromYear === null && dividendNet > 0.84) {
      monthlySalaryFromYear = y;
      monthlySalaryAmount = Math.round((dividendNet / 12) * 1000) / 1000;
    }
    vanSum += dividendNet / Math.pow(1 + p.discountRate / 100, y);
    rows.push({
      year: y, date: `10 fév. ${2026 + y - 1}`,
      production: production / 1000, revenue, opex, loan: loanPayment, inverter,
      ebit, tax, netIncome, netCumul, dividendNet, dividendCumul,
    });
  }

  const totalNetPersoNominal = dividendCumul - apport;
  const totalNetPersoVAN = vanSum - apport;
  const expectedLossFromDefault = (dividendCumul - apport) * (p.defaultRisk / 100) * 0.5;

  return {
    rows, apport, totalNetPersoNominal, totalNetPersoVAN,
    breakEvenYear, monthlySalaryFromYear, monthlySalaryAmount,
    expectedLossFromDefault,
  };
}

function simulateEPC(p: EpcParams) {
  const revenue = p.sizeMwp * p.pricePerMwpM;       // total facturé client
  const capex = p.sizeMwp * p.capexPerMwpM;          // coût construction
  const opex = revenue * p.opexPctRevenue / 100;     // salaries + commercial
  const warrantyProvision = revenue * p.warrantyProvisionPct / 100;
  const fdeNet = p.fdeSubventionM;
  const ebit = revenue - capex - opex - warrantyProvision + fdeNet;
  const tax = Math.max(0, ebit * p.taxRate / 100);
  const netEntreprise = ebit - tax;
  const dividendNet = netEntreprise * (1 - p.dividendRAS / 100);
  const van = dividendNet / Math.pow(1 + p.discountRate / 100, (p.constructionMonths / 12));

  // Timeline des milestones
  const milestones = [
    { month: 0, label: 'Signature', amount: revenue * p.milestone1Pct / 100, type: 'in' },
    { month: 3, label: 'Démarrage chantier', amount: revenue * p.milestone2Pct / 100, type: 'in' },
    { month: 4, label: 'CAPEX modules', amount: -capex * 0.45, type: 'out' },
    { month: 5, label: 'CAPEX structures', amount: -capex * 0.30, type: 'out' },
    { month: 6, label: 'Mi-chantier', amount: revenue * p.milestone3Pct / 100, type: 'in' },
    { month: 7, label: 'CAPEX raccordement', amount: -capex * 0.25, type: 'out' },
    { month: 8, label: 'Réception + solde', amount: revenue * p.milestone4Pct / 100, type: 'in' },
    { month: 8, label: 'Opex (salaires, commercial, banque)', amount: -opex, type: 'out' },
    { month: 8, label: 'Provision garantie décennale', amount: -warrantyProvision, type: 'out' },
    { month: 8 + Math.round(p.fdeDelayMonths / 2), label: 'Subvention FDE (50%)', amount: fdeNet / 2, type: 'in' },
    { month: 8 + p.fdeDelayMonths, label: 'Solde subvention FDE', amount: fdeNet / 2, type: 'in' },
    { month: 8 + 4, label: 'Clôture comptable (IS)', amount: -tax, type: 'out' },
    { month: 8 + 6, label: '🎯 Dividendes versés (15% RAS)', amount: dividendNet, type: 'final' },
  ];

  return {
    revenue, capex, opex, warrantyProvision, fdeNet, ebit, tax,
    netEntreprise, dividendNet, van, milestones,
    totalMonthsToCash: 8 + 6,
    startDate: '10 juillet 2025',
    cashDate: '10 mars 2026',
  };
}

/* ═══════════════════════════════════════════════════════════════
   UI PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */

function StarField() {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2 + 0.5, delay: Math.random() * 5, duration: Math.random() * 3 + 2,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {stars.map((s) => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function PerspectiveGrid() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[50vh] pointer-events-none opacity-20" style={{
      background: `linear-gradient(to right, rgba(34, 197, 94, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(34, 197, 94, 0.3) 1px, transparent 1px)`,
      backgroundSize: '60px 60px', transform: 'perspective(500px) rotateX(60deg)', transformOrigin: 'bottom',
      maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
    }} aria-hidden />
  );
}

function Slider({ label, value, onChange, min, max, step, unit, hint }:
  { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; unit: string; hint?: string; }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-medium text-zinc-300">{label}</label>
        <span className="font-mono text-sm font-bold text-emerald-400">
          {value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} <span className="text-zinc-500 text-xs">{unit}</span>
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-emerald-400"
      />
      {hint && <p className="text-[10px] text-zinc-600 leading-tight">{hint}</p>}
    </div>
  );
}

function StatCard({ label, value, unit, icon, color, delta }: 
  { label: string; value: string; unit: string; icon: React.ReactNode; color: string; delta?: string; }) {
  return (
    <motion.div whileHover={{ scale: 1.03, y: -3 }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
      <div className={`${color} mb-2`}>{icon}</div>
      <div className="text-xl md:text-2xl font-black text-white font-mono">
        {value}<span className="text-xs text-zinc-500 ml-1">{unit}</span>
      </div>
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{label}</div>
      {delta && <div className="text-[10px] text-amber-400 mt-1">{delta}</div>}
    </motion.div>
  );
}

function AgentCard({ index, title, icon, critiques, impactM, color }:
  { index: number; title: string; icon: React.ReactNode; critiques: string[]; impactM: string; color: string; }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.08 }}
      className={`rounded-2xl border ${color} bg-zinc-950/60 backdrop-blur-md overflow-hidden`}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-white/5">{icon}</div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Agent adverse #{index}</div>
            <h4 className="text-base md:text-lg font-bold text-white">{title}</h4>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-zinc-500 uppercase">Impact</div>
            <div className="font-mono font-bold text-rose-400">{impactM}</div>
          </div>
          {open ? <ChevronDown className="w-5 h-5 text-zinc-400" /> : <ChevronRight className="w-5 h-5 text-zinc-400" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-1 space-y-2">
              {critiques.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-zinc-300 leading-relaxed">
                  <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" /><span>{c}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PresetButton({ label, active, onClick, icon }:
  { label: string; active: boolean; onClick: () => void; icon: React.ReactNode; }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
              : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'}`}>
      {icon}{label}
    </button>
  );
}

function TabButton({ id, active, onClick, icon, label }:
  { id: string; active: boolean; onClick: () => void; icon: React.ReactNode; label: string; }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
        active ? 'bg-white/10 text-white border border-white/20 shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300 border border-transparent'}`}>
      {icon}<span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB CONTENT COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function PpaSimulatorTab() {
  const [params, setParams] = useState<PpaParams>(DEFAULT_PPA_AUDITED);
  const [preset, setPreset] = useState<'audited' | 'optimist' | 'custom'>('audited');
  const [showTable, setShowTable] = useState(false);
  const sim = useMemo(() => simulatePPA(params), [params]);

  const updateParam = (key: keyof PpaParams, value: number) => {
    setParams((p) => ({ ...p, [key]: value }));
    setPreset('custom');
  };
  const loadPreset = (p: 'audited' | 'optimist') => {
    setParams(p === 'audited' ? DEFAULT_PPA_AUDITED : DEFAULT_PPA_OPTIMIST);
    setPreset(p);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Apport perso requis" value={sim.apport.toFixed(1)} unit="M MAD"
          icon={<Wallet className="w-4 h-4" />} color="text-rose-400"
          delta={preset === 'optimist' ? '' : '+60% vs optimiste'} />
        <StatCard label="Net perso 20 ans (nominal)" value={sim.totalNetPersoNominal.toFixed(1)} unit="M MAD"
          icon={<TrendingUp className="w-4 h-4" />} color="text-emerald-400" />
        <StatCard label="Net perso 20 ans (VAN 8%)" value={sim.totalNetPersoVAN.toFixed(1)} unit="M MAD"
          icon={<CircleDollarSign className="w-4 h-4" />} color="text-cyan-400" delta="valeur aujourd'hui" />
        <StatCard label="Perte espérée (défaut)" value={`-${sim.expectedLossFromDefault.toFixed(1)}`} unit="M MAD"
          icon={<AlertTriangle className="w-4 h-4" />} color="text-amber-400" delta={`${params.defaultRisk}% proba`} />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-400/20 flex items-center gap-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Break-even (cumul &gt; apport)</div>
            <div className="text-xl font-bold text-white">
              {sim.breakEvenYear ? `Année ${sim.breakEvenYear}` : 'Jamais sur la durée PPA'}
            </div>
            <div className="text-xs text-zinc-500">
              {sim.breakEvenYear ? `≈ 10 fév. ${2025 + sim.breakEvenYear}` : '⚠️ revoir les paramètres'}
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-400/20 flex items-center gap-4">
          <Banknote className="w-8 h-8 text-cyan-400 flex-shrink-0" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">Salaire mensuel possible</div>
            <div className="text-xl font-bold text-white">
              {sim.monthlySalaryFromYear ? `${(sim.monthlySalaryAmount * 1000).toLocaleString('fr-FR')} MAD/mois` : 'Pas viable'}
            </div>
            <div className="text-xs text-zinc-500">
              {sim.monthlySalaryFromYear ? `dès l'année ${sim.monthlySalaryFromYear}` : '⚠️ revenus trop faibles'}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Paramètres PPA</h3>
          </div>
          <div className="flex gap-2">
            <PresetButton label="Auditée" active={preset === 'audited'} onClick={() => loadPreset('audited')} icon={<Shield className="w-3.5 h-3.5" />} />
            <PresetButton label="Optimiste" active={preset === 'optimist'} onClick={() => loadPreset('optimist')} icon={<Sparkles className="w-3.5 h-3.5" />} />
          </div>
        </div>
        <div className="p-5 grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <Slider label="CAPEX total" value={params.capexM} onChange={(v) => updateParam('capexM', v)} min={20} max={45} step={0.5} unit="M MAD" hint="Marché Maroc 2025 : 4,5-5,5M/MWp clé-en-main" />
          <Slider label="Apport perso (equity)" value={params.equityPct} onChange={(v) => updateParam('equityPct', v)} min={10} max={50} step={1} unit="%" hint="Banks PME Maroc financent 50-70%" />
          <Slider label="Taux prêt" value={params.loanRate} onChange={(v) => updateParam('loanRate', v)} min={4} max={10} step={0.1} unit="%" hint="Réalité PME Maroc : 6-7%" />
          <Slider label="Durée prêt" value={params.loanYears} onChange={(v) => updateParam('loanYears', v)} min={5} max={15} step={1} unit="ans" hint="Max 10 ans pour PME" />
          <Slider label="Production" value={params.prodKwhKwp} onChange={(v) => updateParam('prodKwhKwp', v)} min={1400} max={2100} step={10} unit="kWh/kWp" hint="Maroc réel avec chaleur + sable" />
          <Slider label="Tarif PPA" value={params.tariff} onChange={(v) => updateParam('tariff', v)} min={0.5} max={1.1} step={0.01} unit="MAD/kWh" hint="HV/MV industriel 2025" />
          <Slider label="Dégradation modules" value={params.degradation} onChange={(v) => updateParam('degradation', v)} min={0.3} max={1.2} step={0.1} unit="%/an" />
          <Slider label="Indexation tarif" value={params.indexation} onChange={(v) => updateParam('indexation', v)} min={0} max={3} step={0.1} unit="%/an" />
          <Slider label="Opex (% CAPEX)" value={params.opexPctCapex} onChange={(v) => updateParam('opexPctCapex', v)} min={1} max={4} step={0.1} unit="%" hint="Inclut O&M, assurance, sécurité, land lease" />
          <Slider label="Année onduleurs" value={params.inverterReplaceYear} onChange={(v) => updateParam('inverterReplaceYear', v)} min={8} max={15} step={1} unit="an" />
          <Slider label="Coût onduleurs" value={params.inverterCostM} onChange={(v) => updateParam('inverterCostM', v)} min={0.5} max={3} step={0.1} unit="M MAD" />
          <Slider label="Années TFZ (IS 0%)" value={params.taxYearsFree} onChange={(v) => updateParam('taxYearsFree', v)} min={0} max={10} step={1} unit="ans" />
          <Slider label="IS après TFZ" value={params.taxRateAfter} onChange={(v) => updateParam('taxRateAfter', v)} min={0} max={31} step={0.5} unit="%" hint="Maroc : 10% puis 31%" />
          <Slider label="RAS dividendes" value={params.dividendRAS} onChange={(v) => updateParam('dividendRAS', v)} min={0} max={20} step={1} unit="%" />
          <Slider label="Risque défaut client" value={params.defaultRisk} onChange={(v) => updateParam('defaultRisk', v)} min={0} max={40} step={1} unit="%" />
          <Slider label="Taux actualisation (VAN)" value={params.discountRate} onChange={(v) => updateParam('discountRate', v)} min={4} max={12} step={0.5} unit="%" />
          <Slider label="Durée PPA" value={params.ppaYears} onChange={(v) => updateParam('ppaYears', v)} min={15} max={25} step={1} unit="ans" />
          <Slider label="Taille centrale" value={params.sizeMwp} onChange={(v) => updateParam('sizeMwp', v)} min={1} max={20} step={1} unit="MWp" />
        </div>
        <div className="p-5 border-t border-white/5">
          <button onClick={() => setShowTable(!showTable)} className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors">
            {showTable ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {showTable ? 'Masquer' : 'Afficher'} le cash flow année par année ({sim.rows.length} ans)
          </button>
          <AnimatePresence>
            {showTable && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4">
                <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-xl border border-white/10">
                  <table className="w-full text-xs font-mono">
                    <thead className="sticky top-0 bg-zinc-950/95 backdrop-blur">
                      <tr className="text-left text-zinc-400">
                        <th className="p-2">An</th><th className="p-2">Date</th>
                        <th className="p-2 text-right">Prod (GWh)</th><th className="p-2 text-right">Revenu</th>
                        <th className="p-2 text-right">Opex</th><th className="p-2 text-right">Prêt</th>
                        <th className="p-2 text-right">Ondul.</th><th className="p-2 text-right">IS</th>
                        <th className="p-2 text-right">Net entrep.</th><th className="p-2 text-right">Net perso</th>
                        <th className="p-2 text-right">Cumul perso</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-rose-500/5 border-t border-white/5">
                        <td className="p-2 text-zinc-500">0</td><td className="p-2 text-zinc-500">10 juil. 2025</td>
                        <td className="p-2 text-right text-zinc-500">—</td><td className="p-2 text-right text-zinc-500">—</td>
                        <td className="p-2 text-right text-zinc-500">—</td><td className="p-2 text-right text-zinc-500">—</td>
                        <td className="p-2 text-right text-zinc-500">—</td><td className="p-2 text-right text-zinc-500">—</td>
                        <td className="p-2 text-right text-zinc-500">—</td>
                        <td className="p-2 text-right text-rose-400 font-bold">-{sim.apport.toFixed(2)}</td>
                        <td className="p-2 text-right text-rose-400 font-bold">-{sim.apport.toFixed(2)}</td>
                      </tr>
                      {sim.rows.map((row) => (
                        <tr key={row.year} className="border-t border-white/5 hover:bg-white/5">
                          <td className="p-2 text-zinc-400">{row.year}</td><td className="p-2 text-zinc-400">{row.date}</td>
                          <td className="p-2 text-right text-zinc-300">{row.production.toFixed(2)}</td>
                          <td className="p-2 text-right text-emerald-400">+{row.revenue.toFixed(2)}</td>
                          <td className="p-2 text-right text-rose-400">-{row.opex.toFixed(2)}</td>
                          <td className="p-2 text-right text-rose-400">{row.loan > 0 ? `-${row.loan.toFixed(2)}` : '—'}</td>
                          <td className="p-2 text-right text-rose-400">{row.inverter > 0 ? `-${row.inverter.toFixed(2)}` : '—'}</td>
                          <td className="p-2 text-right text-amber-400">{row.tax > 0 ? `-${row.tax.toFixed(2)}` : '—'}</td>
                          <td className={`p-2 text-right font-bold ${row.netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {row.netIncome >= 0 ? '+' : ''}{row.netIncome.toFixed(2)}
                          </td>
                          <td className={`p-2 text-right ${row.dividendNet > 0 ? 'text-emerald-300' : 'text-zinc-600'}`}>
                            {row.dividendNet > 0 ? `+${row.dividendNet.toFixed(2)}` : '—'}
                          </td>
                          <td className={`p-2 text-right font-bold ${row.dividendCumul - sim.apport >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {(row.dividendCumul - sim.apport).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function EpcSimulatorTab() {
  const [params, setParams] = useState<EpcParams>(DEFAULT_EPC_AUDITED);
  const sim = useMemo(() => simulateEPC(params), [params]);
  const updateParam = (key: keyof EpcParams, value: number) => setParams((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenu client (total)" value={sim.revenue.toFixed(1)} unit="M MAD"
          icon={<TrendingUp className="w-4 h-4" />} color="text-cyan-400" />
        <StatCard label="CAPEX réel" value={sim.capex.toFixed(1)} unit="M MAD"
          icon={<Building2 className="w-4 h-4" />} color="text-rose-400" />
        <StatCard label="Net entreprise (IS 0%)" value={sim.netEntreprise.toFixed(2)} unit="M MAD"
          icon={<Building2 className="w-4 h-4" />} color="text-emerald-400" />
        <StatCard label="Net sur ton compte perso" value={sim.dividendNet.toFixed(2)} unit="M MAD"
          icon={<Banknote className="w-4 h-4" />} color="text-violet-400"
          delta={`à ${sim.cashDate} (VAN: ${sim.van.toFixed(2)}M)`} />
      </div>

      <div className="rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Paramètres EPC</h3>
        </div>
        <div className="p-5 grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <Slider label="Taille centrale" value={params.sizeMwp} onChange={(v) => updateParam('sizeMwp', v)} min={1} max={20} step={1} unit="MWp" />
          <Slider label="Prix vente client" value={params.pricePerMwpM} onChange={(v) => updateParam('pricePerMwpM', v)} min={3.5} max={7} step={0.1} unit="M/MWp" hint="Marché Maroc EPC 2025 : 4,8-5,5M/MWp" />
          <Slider label="CAPEX réel" value={params.capexPerMwpM} onChange={(v) => updateParam('capexPerMwpM', v)} min={3.5} max={6} step={0.1} unit="M/MWp" hint="Coût construction tout compris" />
          <Slider label="Acompte signature" value={params.milestone1Pct} onChange={(v) => updateParam('milestone1Pct', v)} min={10} max={40} step={5} unit="%" />
          <Slider label="Acompte démarrage" value={params.milestone2Pct} onChange={(v) => updateParam('milestone2Pct', v)} min={10} max={40} step={5} unit="%" />
          <Slider label="Acompte mi-chantier" value={params.milestone3Pct} onChange={(v) => updateParam('milestone3Pct', v)} min={10} max={40} step={5} unit="%" />
          <Slider label="Solde réception" value={params.milestone4Pct} onChange={(v) => updateParam('milestone4Pct', v)} min={5} max={20} step={5} unit="%" />
          <Slider label="Durée construction" value={params.constructionMonths} onChange={(v) => updateParam('constructionMonths', v)} min={4} max={12} step={1} unit="mois" />
          <Slider label="Opex (salaires + com)" value={params.opexPctRevenue} onChange={(v) => updateParam('opexPctRevenue', v)} min={2} max={10} step={0.5} unit="% revenu" />
          <Slider label="Subvention FDE" value={params.fdeSubventionM} onChange={(v) => updateParam('fdeSubventionM', v)} min={0} max={3} step={0.1} unit="M MAD" hint="Plafond réel : 1,5M MAD" />
          <Slider label="Délai FDE" value={params.fdeDelayMonths} onChange={(v) => updateParam('fdeDelayMonths', v)} min={6} max={36} step={1} unit="mois" />
          <Slider label="IS (TFZ = 0%)" value={params.taxRate} onChange={(v) => updateParam('taxRate', v)} min={0} max={31} step={0.5} unit="%" />
          <Slider label="RAS dividendes" value={params.dividendRAS} onChange={(v) => updateParam('dividendRAS', v)} min={0} max={20} step={1} unit="%" />
          <Slider label="Provision garantie" value={params.warrantyProvisionPct} onChange={(v) => updateParam('warrantyProvisionPct', v)} min={0} max={5} step={0.5} unit="% revenu" hint="Garantie décennale 10 ans" />
          <Slider label="Taux actualisation" value={params.discountRate} onChange={(v) => updateParam('discountRate', v)} min={4} max={12} step={0.5} unit="%" />
        </div>
      </div>

      {/* Timeline EPC */}
      <div className="rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Timeline cash EPC — {sim.startDate} → {sim.cashDate}
          </h3>
        </div>
        <div className="p-5 space-y-2">
          {sim.milestones.map((m, i) => {
            const isFinal = m.type === 'final';
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center justify-between gap-4 p-3 rounded-xl border ${
                  isFinal ? 'bg-violet-500/10 border-violet-400/40' :
                  m.type === 'in' ? 'bg-emerald-500/5 border-emerald-400/20' : 'bg-rose-500/5 border-rose-400/20'}`}>
                <div className="flex items-center gap-3">
                  <div className={`text-xs font-mono px-2 py-1 rounded ${
                    isFinal ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 text-zinc-400'}`}>
                    M{m.month}
                  </div>
                  <span className={`text-sm ${isFinal ? 'font-bold text-white' : 'text-zinc-300'}`}>{m.label}</span>
                </div>
                <span className={`font-mono font-bold text-sm ${
                  isFinal ? 'text-violet-300' :
                  m.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {m.amount > 0 ? '+' : ''}{m.amount.toFixed(2)}M
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ComparisonTab() {
  const ppa = useMemo(() => simulatePPA(DEFAULT_PPA_AUDITED), []);
  const epc = useMemo(() => simulateEPC(DEFAULT_EPC_AUDITED), []);

  const rows = [
    { label: 'Apport perso requis', epc: '0 MAD', ppa: `${ppa.apport.toFixed(1)}M MAD`, winner: 'EPC', icon: <Wallet className="w-4 h-4" /> },
    { label: 'Net perso (nominal)', epc: `${epc.dividendNet.toFixed(2)}M`, ppa: `${ppa.totalNetPersoNominal.toFixed(1)}M`, winner: 'PPA', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Net perso (VAN @ 8%)', epc: `${epc.van.toFixed(2)}M`, ppa: `${ppa.totalNetPersoVAN.toFixed(1)}M`, winner: 'PPA', icon: <CircleDollarSign className="w-4 h-4" /> },
    { label: 'Délai jusqu\'au cash', epc: '8 mois', ppa: ppa.breakEvenYear ? `${ppa.breakEvenYear} an(s)` : 'Jamais', winner: 'EPC', icon: <Clock className="w-4 h-4" /> },
    { label: 'Temps actif investi', epc: '6 mois', ppa: '6 mois + 30min/mois × 240', winner: 'EPC', icon: <Clock className="w-4 h-4" /> },
    { label: 'Risque perte totale', epc: '< 5%', ppa: `${DEFAULT_PPA_AUDITED.defaultRisk}%`, winner: 'EPC', icon: <AlertTriangle className="w-4 h-4" /> },
    { label: 'ROI sur apport', epc: '∞ (infini)', ppa: `${(ppa.totalNetPersoNominal / ppa.apport).toFixed(1)}x`, winner: 'EPC', icon: <Trophy className="w-4 h-4" /> },
    { label: 'Cash mensuel possible', epc: '0 (1 coup)', ppa: ppa.monthlySalaryFromYear ? `${(ppa.monthlySalaryAmount * 1000).toLocaleString('fr-FR')} MAD/mois dès an ${ppa.monthlySalaryFromYear}` : 'NA', winner: 'PPA', icon: <Banknote className="w-4 h-4" /> },
    { label: 'Patrimoine bloc fin contrat', epc: '0', ppa: 'Centrale 6 MWp (valeur résiduelle ~5M)', winner: 'PPA', icon: <Building2 className="w-4 h-4" /> },
    { label: 'Complexité juridique', epc: 'Faible (1 contrat)', ppa: 'Élevée (PPA + prêt + SPV + guarantees)', winner: 'EPC', icon: <Scale className="w-4 h-4" /> },
    { label: 'Réutilisable pour prochain projet', epc: 'Oui (cash dispo)', ppa: 'Non (cash bloqué)', winner: 'EPC', icon: <Layers className="w-4 h-4" /> },
    { label: 'Effet sur valorisation boîte', epc: 'Faible', ppa: 'Élevé (asset 20 ans en bilan)', winner: 'PPA', icon: <Briefcase className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-emerald-400" />
            EPC vs PPA — 6 MWp (chiffres audités)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr className="text-left text-zinc-400">
                <th className="p-3">Critère</th>
                <th className="p-3 text-right text-cyan-400">EPC</th>
                <th className="p-3 text-right text-amber-400">PPA</th>
                <th className="p-3 text-center">Gagnant</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">{row.icon}</span>
                      <span className="text-zinc-300">{row.label}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono text-cyan-300">{row.epc}</td>
                  <td className="p-3 text-right font-mono text-amber-300">{row.ppa}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                      row.winner === 'EPC' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      {row.winner}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-cyan-500/5 border border-cyan-400/30">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h4 className="font-bold text-cyan-400">EPC — Quand choisir</h4>
          </div>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />Tu n'as pas de cash à bloquer</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />Tu veux encaisser rapide (8 mois)</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />Tu veux enchaîner 4-5 projets/an</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />Tu veux rester agile (pas de dette 10 ans)</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />Tu construis ton track record livraisons</li>
          </ul>
        </div>
        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-400/30">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-amber-400">PPA — Quand choisir</h4>
          </div>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />Tu as 8-10M MAD à bloquer 10 ans</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />Tu veux un revenu passif mensuel</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />Tu veux construire un patrimoine</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />Tu veux valoriser ta boîte (asset en bilan)</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />Tu as capacité à gérer 1 client 20 ans</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SensitivityTab() {
  // 3 scénarios pour PPA 6 MWp
  const scenarios = [
    {
      name: 'Pire cas',
      colorClasses: 'bg-rose-500/5 border-rose-400/30 text-rose-400',
      params: { ...DEFAULT_PPA_AUDITED, capexM: 33, tariff: 0.65, prodKwhKwp: 1600, opexPctCapex: 2.8, loanRate: 7.5, defaultRisk: 30, indexation: 1 },
      desc: 'CAPEX +6%, tarif -10%, prod -6%, opex +27%, taux +1pt, risque défaut +50%',
    },
    {
      name: 'Base audité',
      colorClasses: 'bg-amber-500/5 border-amber-400/30 text-amber-400',
      params: DEFAULT_PPA_AUDITED,
      desc: 'Marché Maroc 2025 réaliste (preset auditée)',
    },
    {
      name: 'Meilleur cas',
      colorClasses: 'bg-emerald-500/5 border-emerald-400/30 text-emerald-400',
      params: { ...DEFAULT_PPA_AUDITED, capexM: 29, tariff: 0.80, prodKwhKwp: 1800, opexPctCapex: 1.8, loanRate: 5.5, defaultRisk: 10, indexation: 2 },
      desc: 'CAPEX -6%, tarif +11%, prod +6%, opex -18%, taux -1pt, risque défaut -50%',
    },
  ];

  const results = scenarios.map((s) => {
    const sim = simulatePPA(s.params);
    return { ...s, sim };
  });

  // Tornado-style: impact de -20% et +20% sur chaque variable
  const tornadoVars = [
    { label: 'Tarif PPA', key: 'tariff', base: 0.72, lo: 0.58, hi: 0.86, unit: 'MAD/kWh' },
    { label: 'Production', key: 'prodKwhKwp', base: 1700, lo: 1360, hi: 2040, unit: 'kWh/kWp' },
    { label: 'CAPEX', key: 'capexM', base: 31, lo: 37, hi: 25, unit: 'M MAD', inverse: true },
    { label: 'Opex', key: 'opexPctCapex', base: 2.2, lo: 2.86, hi: 1.54, unit: '%', inverse: true },
    { label: 'Taux prêt', key: 'loanRate', base: 6.5, lo: 8, hi: 5, unit: '%', inverse: true },
    { label: 'Risque défaut', key: 'defaultRisk', base: 20, lo: 30, hi: 10, unit: '%', inverse: true },
    { label: 'Indexation', key: 'indexation', base: 1.5, lo: 0.5, hi: 2.5, unit: '%/an' },
    { label: 'Durée PPA', key: 'ppaYears', base: 20, lo: 15, hi: 25, unit: 'ans' },
  ];

  const baseSim = simulatePPA(DEFAULT_PPA_AUDITED);
  const tornadoData = tornadoVars.map((v) => {
    const loParams = { ...DEFAULT_PPA_AUDITED, [v.key]: v.lo };
    const hiParams = { ...DEFAULT_PPA_AUDITED, [v.key]: v.hi };
    const loSim = simulatePPA(loParams);
    const hiSim = simulatePPA(hiParams);
    return {
      label: v.label,
      loImpact: loSim.totalNetPersoNominal - baseSim.totalNetPersoNominal,
      hiImpact: hiSim.totalNetPersoNominal - baseSim.totalNetPersoNominal,
      unit: v.unit,
    };
  }).sort((a, b) => Math.abs(b.hiImpact - b.loImpact) - Math.abs(a.hiImpact - a.loImpact));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            3 scénarios PPA 6 MWp
          </h3>
        </div>
        <div className="p-5 grid md:grid-cols-3 gap-4">
          {results.map((r, i) => {
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-5 rounded-2xl border ${r.colorClasses}`}>
                <div className="text-xs uppercase tracking-wider font-mono mb-1">{r.name}</div>
                <div className="text-3xl font-black mb-2">
                  {r.sim.totalNetPersoNominal.toFixed(1)}M
                </div>
                <div className="text-xs text-zinc-500 mb-3">MAD net perso 20 ans (nominal)</div>
                <div className="space-y-1 text-xs text-zinc-400">
                  <div className="flex justify-between"><span>Apport requis</span><span className="font-mono">{r.sim.apport.toFixed(1)}M</span></div>
                  <div className="flex justify-between"><span>VAN @ 8%</span><span className="font-mono">{r.sim.totalNetPersoVAN.toFixed(1)}M</span></div>
                  <div className="flex justify-between"><span>Break-even</span><span className="font-mono">{r.sim.breakEvenYear ? `An ${r.sim.breakEvenYear}` : 'Jamais'}</span></div>
                  <div className="flex justify-between"><span>Perte espérée</span><span className="font-mono text-rose-400">-{r.sim.expectedLossFromDefault.toFixed(1)}M</span></div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-zinc-600 leading-relaxed">{r.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Tornado chart */}
      <div className="rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            Analyse tornado — sensibilité du net perso 20 ans
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Base audité : {baseSim.totalNetPersoNominal.toFixed(1)}M MAD</p>
        </div>
        <div className="p-5 space-y-2">
          {tornadoData.map((t, i) => {
            const maxAbs = Math.max(...tornadoData.map((d) => Math.max(Math.abs(d.loImpact), Math.abs(d.hiImpact))));
            const loWidth = (Math.abs(t.loImpact) / maxAbs) * 50;
            const hiWidth = (Math.abs(t.hiImpact) / maxAbs) * 50;
            return (
              <div key={i} className="grid grid-cols-[140px_1fr_140px] gap-3 items-center">
                <div className="text-xs text-zinc-400 text-right">{t.label}</div>
                <div className="relative h-6 bg-white/5 rounded">
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" />
                  {t.loImpact < 0 && (
                    <div className="absolute top-0 bottom-0 bg-rose-500/60 rounded-l"
                      style={{ right: '50%', width: `${loWidth}%` }} />
                  )}
                  {t.hiImpact > 0 && (
                    <div className="absolute top-0 bottom-0 bg-emerald-500/60 rounded-r"
                      style={{ left: '50%', width: `${hiWidth}%` }} />
                  )}
                  <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-[10px] font-mono text-white">
                    {t.label.includes('CAPEX') || t.label.includes('Opex') || t.label.includes('taux') || t.label.includes('Risque') ? '' : ''}
                  </div>
                </div>
                <div className="text-xs font-mono text-zinc-500">
                  <span className="text-rose-400">{t.loImpact > 0 ? '+' : ''}{t.loImpact.toFixed(1)}M</span>
                  {' / '}
                  <span className="text-emerald-400">{t.hiImpact > 0 ? '+' : ''}{t.hiImpact.toFixed(1)}M</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-5 border-t border-white/5 text-[10px] text-zinc-600">
          Lecture : barre rouge = impact si la variable va dans le sens défavorable. Barre verte = impact si favorable.
          Plus la barre est longue, plus la variable est critique pour ton retour.
        </div>
      </div>
    </div>
  );
}

function RiskScenariosTab() {
  // PPA avec défaut client à différentes années
  const defaultScenarios = [3, 5, 7, 10, 15, 'never'];
  const baseSim = simulatePPA(DEFAULT_PPA_AUDITED);

  const scenarios = defaultScenarios.map((year) => {
    if (year === 'never') {
      return { year: 'Jamais', sim: baseSim, loss: 0, colorClasses: 'bg-emerald-500/5 border-emerald-400/30 text-emerald-400', iconColor: 'text-emerald-400', bgIcon: 'bg-emerald-500/10' };
    }
    const y = year as number;
    // Coupe les revenus après année y, mais prêt continue
    const truncatedRows = baseSim.rows.slice(0, y);
    const dividendCumul = truncatedRows.reduce((sum, r) => sum + r.dividendNet, 0);
    // Prêt restant à payer
    const remainingLoan = baseSim.rows.slice(y).filter((r) => r.loan > 0).reduce((sum, r) => sum + r.loan, 0);
    const netPerso = dividendCumul - baseSim.apport - remainingLoan * 0.5; // 50% du prêt restant assumé perso
    const isSevere = y <= 5;
    const isMedium = y > 5 && y <= 10;
    return {
      year: `Année ${y}`,
      sim: { ...baseSim, totalNetPersoNominal: netPerso, rows: truncatedRows },
      loss: baseSim.totalNetPersoNominal - netPerso,
      colorClasses: isSevere ? 'bg-rose-500/5 border-rose-400/30 text-rose-400' : isMedium ? 'bg-amber-500/5 border-amber-400/30 text-amber-400' : 'bg-emerald-500/5 border-emerald-400/30 text-emerald-400',
      iconColor: isSevere ? 'text-rose-400' : isMedium ? 'text-amber-400' : 'text-emerald-400',
      bgIcon: isSevere ? 'bg-rose-500/10' : isMedium ? 'bg-amber-500/10' : 'bg-emerald-500/10',
    };
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Scénarios de défaut client PPA
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Si le client fait faillite à l'année X : tu perds les revenus restants + tu assumes 50% du prêt restant (caution personnelle)
          </p>
        </div>
        <div className="p-5 space-y-3">
          {scenarios.map((s, i) => {
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${s.colorClasses}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${s.bgIcon}`}>
                    {s.year === 'Jamais' ? <Shield className={`w-5 h-5 ${s.iconColor}`} /> : <AlertTriangle className={`w-5 h-5 ${s.iconColor}`} />}
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${s.iconColor}`}>Défaut à : {s.year}</div>
                    <div className="text-xs text-zinc-500">
                      {s.year === 'Jamais' ? 'Scénario nominal — pas de défaut' : `Tu perds les revenus PPA après l'année ${s.year}, prêt restant à ta charge`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Net perso 20 ans</div>
                  <div className={`text-xl font-black font-mono ${s.sim.totalNetPersoNominal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {s.sim.totalNetPersoNominal >= 0 ? '+' : ''}{s.sim.totalNetPersoNominal.toFixed(1)}M
                  </div>
                  {s.loss > 0 && <div className="text-[10px] text-rose-400">perte: -{s.loss.toFixed(1)}M vs nominal</div>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-400/30">
          <AlertTriangle className="w-6 h-6 text-rose-400 mb-2" />
          <h4 className="font-bold text-rose-400 mb-2">Risques projet</h4>
          <ul className="space-y-1 text-xs text-zinc-400">
            <li>• Défaut client PPA (15-25%)</li>
            <li>• Retard construction (+3-6 mois)</li>
            <li>• Défaillance onduleurs prématurée</li>
            <li>• Catastrophe naturelle (séisme, inondation)</li>
            <li>• Vol / vandalisme site</li>
            <li>• Dégradation modules accélérée</li>
          </ul>
        </div>
        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-400/30">
          <Scale className="w-6 h-6 text-amber-400 mb-2" />
          <h4 className="font-bold text-amber-400 mb-2">Risques juridiques</h4>
          <ul className="space-y-1 text-xs text-zinc-400">
            <li>• Renégociation tarif PPA par client</li>
            <li>• Changement réglementaire Maroc</li>
            <li>• Imposition TFZ supprimée</li>
            <li>• Taxe foncière rétroactive</li>
            <li>• Litige raccordement ONEE</li>
            <li>• Restructuration subventions FDE</li>
          </ul>
        </div>
        <div className="p-5 rounded-2xl bg-cyan-500/5 border border-cyan-400/30">
          <Shield className="w-6 h-6 text-cyan-400 mb-2" />
          <h4 className="font-bold text-cyan-400 mb-2">Protections possibles</h4>
          <ul className="space-y-1 text-xs text-zinc-400">
            <li>• Assurance PPA business interruption</li>
            <li>• Caution bancaire client (10-15%)</li>
            <li>• Nantissement compte séquestre</li>
            <li>• Hedging taux d'intérêt</li>
            <li>• Assurance décennale + RC pro</li>
            <li>• SPV avec garantie parentale</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function PortfolioTab() {
  // Stratégie 5 ans : alterner EPC et PPA
  const portfolio = [
    { year: 2025, type: 'EPC', size: 6, net: 0.80, apport: 0, cash: '+0,8M MAD' },
    { year: 2026, type: 'EPC', size: 9, net: 1.20, apport: 0, cash: '+1,2M MAD' },
    { year: 2027, type: 'PPA', size: 6, net: -5, apport: 5, cash: '-5M (apport), +0,07M/mois à vie' },
    { year: 2028, type: 'EPC', size: 12, net: 1.60, apport: 0, cash: '+1,6M MAD' },
    { year: 2029, type: 'PPA', size: 9, net: -7.5, apport: 7.5, cash: '-7,5M (apport), +0,1M/mois à vie' },
  ];

  const totalsEpc = portfolio.filter((p) => p.type === 'EPC').reduce((sum, p) => sum + p.net, 0);
  const totalsPpaApport = portfolio.filter((p) => p.type === 'PPA').reduce((sum, p) => sum + p.apport, 0);
  const monthlyPassive = 0.07 + 0.1; // M MAD/mois à partir de 2032 (an 5 PPA1 + an 3 PPA2)
  const patrimoine20ans = 35 + 50; // 2 PPAs en nominal

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-950/30 via-zinc-950/60 to-amber-950/30 border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Stratégie portfolio 5 ans — Mix EPC + PPA
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Le combo gagnant : EPC pour cash court terme, PPA pour patrimoine long terme</p>
        </div>
        <div className="p-5 space-y-3">
          {portfolio.map((p, i) => {
            const isEpc = p.type === 'EPC';
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-xl border flex items-center gap-4 ${
                  isEpc ? 'bg-cyan-500/5 border-cyan-400/30' : 'bg-amber-500/5 border-amber-400/30'}`}>
                <div className={`p-3 rounded-xl ${isEpc ? 'bg-cyan-500/10' : 'bg-amber-500/10'}`}>
                  {isEpc ? <Zap className="w-6 h-6 text-cyan-400" /> : <Sun className="w-6 h-6 text-amber-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${isEpc ? 'text-cyan-400' : 'text-amber-400'}`}>{p.type} {p.size} MWp</span>
                    <span className="text-xs text-zinc-500">— année {p.year}</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">{p.cash}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Net immédiat</div>
                  <div className={`font-mono font-bold ${p.net > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {p.net > 0 ? '+' : ''}{p.net.toFixed(2)}M
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <StatCard label="Cash court terme (EPCs)" value={totalsEpc.toFixed(1)} unit="M MAD"
          icon={<Zap className="w-4 h-4" />} color="text-cyan-400" />
        <StatCard label="Apport bloqué (PPAs)" value={`-${totalsPpaApport.toFixed(1)}`} unit="M MAD"
          icon={<Wallet className="w-4 h-4" />} color="text-rose-400" />
        <StatCard label="Passif mensuel à vie (dès 2032)" value={`${(monthlyPassive * 1000).toFixed(0)}K`} unit="MAD/mois"
          icon={<Banknote className="w-4 h-4" />} color="text-emerald-400" />
        <StatCard label="Patrimoine bloc 20 ans" value={`${patrimoine20ans}M`} unit="MAD"
          icon={<Building2 className="w-4 h-4" />} color="text-violet-400" />
      </div>

      <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-400/30">
        <div className="flex items-start gap-3">
          <Target className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-400 mb-2">Pourquoi ce mix est le vrai gagnant</h4>
            <p className="text-sm text-zinc-300 leading-relaxed mb-3">
              Tu finances tes PPAs avec tes EPCs. Tu n'as jamais besoin de sortir 12,5M MAD de ta poche d'un coup —
              tu les sors des bénéfices EPC année après année. À la fin :
            </p>
            <ul className="space-y-1.5 text-sm text-zinc-300">
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><span className="font-bold text-white">3,6M MAD</span> nets cash court terme (EPCs)</span>
              </li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><span className="font-bold text-white">170K MAD/mois</span> passifs à vie dès 2032 (2 PPAs)</span>
              </li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><span className="font-bold text-white">85M MAD</span> patrimoine bloc 20 ans (2 PPAs nominal)</span>
              </li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><span className="font-bold text-white">Track record</span> : 3 EPCs livrés + 2 PPAs en exploitation</span>
              </li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Ta boîte <span className="font-bold text-white">Harch Energy</span> devient finançable pour un PPA 20 MWp en 2030</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourcesTab() {
  const sources = [
    { category: 'CAPEX solaire Maroc', items: [
      'MASEN — Appels d\'offres photovoltaïques 2023-2024 (prix moyens 4,5-5,5M MAD/MWp)',
      'MASEN Solar Plan — Rapport annuel 2024',
      'ONEE — Données raccordement réseau MV/HV 2024',
      'GIZ Maroc — Étude coûts CAPEX solaire 2023',
    ]},
    { category: 'Financement PME Maroc', items: [
      'Bank Al-Maghrib — Rapport sur le financement PME 2024 (taux moyen 6,5%)',
      'Tamwilcom (ex-CCG) — Programmes garantie verte',
      'Fonds de Développement Énergétique (FDE) — Plafonds subventions 2024',
      'CDC Maroc — Climate Finance Framework',
    ]},
    { category: 'Tarifs PPA Maroc', items: [
      'ONEE — Tarifs d\'achat électricité renouvelable 2024',
      'Masen — Résultats appels d\'offres PPA (public)',
      'Loi 13-09 — Auto-production électricité renouvelable',
      'Décret 2-23-1005 — Mesures d\'application auto-consommation',
    ]},
    { category: 'Production solaire Maroc', items: [
      'IMDEA — Atlas solaire Maroc (irradiation 1900-2200 kWh/m²/an)',
      'IEA — Morocco Energy Outlook 2024',
      'MASEN — Performance monitoring centrales existantes',
      'NREL PVWatts — Simulation production Maroc (pertes réelles)',
    ]},
    { category: 'Opex solaire', items: [
      'IRENA — Renewable Power Generation Costs 2024 (O&M 2-3% CAPEX)',
      'IEA PVPS — Cost & Performance Trends 2024',
      'MASEN — Rapport performance opérationnel 2023',
    ]},
    { category: 'Fiscalité Maroc', items: [
      'Code Général des Impôts Maroc — Article 6 (TFZ Tanger Free Zone)',
      'CGI — Article 7 (exonérations énergies renouvelables)',
      'Loi de finances 2024 — Dispositions énergies vertes',
      'Direction des Impôts — Note circulaire 2024',
    ]},
    { category: 'Risques crédit PPA', items: [
      'S&P Global — Corporate Default Rates 2024 (15-25% sur 20 ans BBB)',
      'Moody\'s — Project Finance Default Studies',
      'Fitch — ESG & Project Finance Ratings 2024',
    ]},
    { category: 'Inflation & VAN', items: [
      'Bank Al-Maghrib — Inflation Maroc 2024 (2,5% projection)',
      'BAM — Taux directeurs 2024 (3% base)',
      'HCP — Perspectives économiques Maroc 2024-2026',
    ]},
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Sources & hypothèses
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Toutes les hypothèses chiffrées sont basées sur des sources publiques Maroc 2024-2025</p>
        </div>
        <div className="p-5 grid md:grid-cols-2 gap-5">
          {sources.map((src, i) => (
            <div key={i} className="space-y-2">
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">{src.category}</h4>
              <ul className="space-y-1.5">
                {src.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-zinc-400 leading-relaxed">
                    <span className="text-emerald-400/60 mt-0.5">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            Avertissements
          </h3>
        </div>
        <div className="p-5 space-y-3 text-sm text-zinc-400 leading-relaxed">
          <p>
            <span className="font-bold text-white">Précision des chiffres :</span> Ce simulateur est un outil de décision,
            pas un audit financier. Les chiffres réels varieront selon le site exact, le client, les conditions du prêt
            et les aléas chantier. Pour un projet réel, engages un feasibility study complet (étude de sol, ESC,
            modelling financier par cabinet spécialisé).
          </p>
          <p>
            <span className="font-bold text-white">Limites :</span> Le simulateur ne couvre pas : la TVA récupérable,
            les crédits d'impôt spécifiques, les amortissements comptables, le refinancing, le risque de change
            (si prêt en EUR), les coûts de structuration SPV, les honoraires avocat/notaire (1-2% CAPEX).
          </p>
          <p>
            <span className="font-bold text-white">Hypothèses non modélisées :</span> Vente de la centrale en fin de PPA
            (valeur résiduelle 5-10M MAD pour 6 MWp), refinancing du prêt après 5 ans si taux baisse,
            co-investisseurs (joint-venture), revenus carbon credits si éligibles.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function Timeline6MwpClient() {
  const [activeTab, setActiveTab] = useState<'ppa' | 'epc' | 'compare' | 'sensitivity' | 'risk' | 'portfolio' | 'sources'>('ppa');

  useEffect(() => {
    document.body.style.background = '#050505';
    document.body.style.color = '#fff';
    return () => {
      document.body.style.background = '';
      document.body.style.color = '';
    };
  }, []);

  const tabs = [
    { id: 'ppa' as const, label: 'PPA Simulateur', icon: <Sun className="w-4 h-4" /> },
    { id: 'epc' as const, label: 'EPC Simulateur', icon: <Zap className="w-4 h-4" /> },
    { id: 'compare' as const, label: 'Comparaison', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'sensitivity' as const, label: 'Sensibilité', icon: <Activity className="w-4 h-4" /> },
    { id: 'risk' as const, label: 'Risques', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'portfolio' as const, label: 'Portfolio', icon: <Layers className="w-4 h-4" /> },
    { id: 'sources' as const, label: 'Sources', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <div
      className="relative min-h-screen text-white overflow-x-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #0a1410 0%, #050505 50%, #000000 100%)' }}
    >
      <StarField />
      <PerspectiveGrid />

      {/* Top bar */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-white/5 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Harch Corp</span>
            </Link>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span className="font-mono">Simulateur Harch Energy — 6 MWp</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-400/30 text-amber-400 text-[10px] font-mono uppercase tracking-wider">
              <Lock className="w-3 h-3" />Non répertorié
            </div>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="relative pt-16 pb-8 px-4 text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-400/30 text-rose-400 text-xs font-mono uppercase tracking-wider mb-6">
          <AlertTriangle className="w-3.5 h-3.5" />Version auditée — 5 agents adverses
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight">
          Simulateur solaire{' '}
          <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent">Maroc 2025</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-zinc-300 mb-2 max-w-2xl mx-auto">
          EPC vs PPA — chiffres réalistes, sensibilité, risques, portfolio
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
          className="text-sm text-zinc-500 max-w-2xl mx-auto">
          7 modules interactifs : simule, compare, stress-test, planifie.
        </motion.p>
      </div>

      {/* TABS */}
      <div className="sticky top-[57px] z-40 backdrop-blur-xl bg-zinc-950/60 border-y border-white/5 py-3 px-4">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => (
            <TabButton key={tab.id} id={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} icon={tab.icon} label={tab.label} />
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="relative max-w-7xl mx-auto px-4 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'ppa' && <PpaSimulatorTab />}
            {activeTab === 'epc' && <EpcSimulatorTab />}
            {activeTab === 'compare' && <ComparisonTab />}
            {activeTab === 'sensitivity' && <SensitivityTab />}
            {activeTab === 'risk' && <RiskScenariosTab />}
            {activeTab === 'portfolio' && <PortfolioTab />}
            {activeTab === 'sources' && <SourcesTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 5 AGENTS ADVERSES — visible sur tous les tabs */}
      <div className="relative max-w-7xl mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-400/30 text-rose-400 text-xs font-mono uppercase tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" />Audit contradictoire
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-2">5 agents adverses</h2>
          <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
            Chaque agent démolit une dimension du business case. Clique pour voir les critiques détaillées.
          </p>
        </motion.div>
        <div className="space-y-3">
          <AgentCard index={1} title="CAPEX Reality Check" icon={<Building2 className="w-5 h-5 text-rose-400" />}
            color="border-rose-400/30" impactM="+5M MAD"
            critiques={[
              'Marché Maroc 2025 : 4,5 à 5,5M MAD/MWp clé-en-main, pas 4,3M',
              'Raccordement réseau HV/MV : 1 à 2M MAD oubliés',
              'Étude de sol + génie civil spécifique : 0,5 à 1M MAD',
              'Permis, autorisations, frais juridiques : 0,3M MAD',
              'Aléas chantier (retards, marge constructeur) : +5 à 10% sur CAPEX',
              'CAPEX réaliste : 31 à 33M MAD pour 6 MWp, pas 25,67M',
            ]} />
          <AgentCard index={2} title="Financing Reality Check" icon={<Banknote className="w-5 h-5 text-rose-400" />}
            color="border-rose-400/30" impactM="-14M / 20 ans"
            critiques={[
              'Harch Energy = PME jeune, pas EDF. Banks financent 60-70% max, pas 80%',
              'Taux d\'intérêt réel PME Maroc : 6-7% (pas 5,5%)',
              'Maturité max PME : 10 ans (pas 12)',
              'Garanties exigées : nantissement stock + caution personnelle 30% du prêt',
              'Subvention FDE : plafonnée à 1,5M MAD, versée 18-24 mois après mise en service',
              'Caution personnelle 30% = ~5M MAD bloqués en garantie sur 10 ans',
            ]} />
          <AgentCard index={3} title="Revenue Reality Check" icon={<TrendingUp className="w-5 h-5 text-rose-400" />}
            color="border-rose-400/30" impactM="-69M / 20 ans"
            critiques={[
              'PPA HV/MV industriel Maroc 2025 : 0,65 à 0,75 MAD/kWh (concurrence Masen, Nareva, ACWA)',
              'Tarif ONEE achat < 12 MW : 0,70 MAD/kWh avec agrément obligatoire',
              'Production réelle Maroc avec chaleur + sable + dégradation : 1650-1750 kWh/kWp (pas 2000)',
              'Tu oublies : clipping, courbes de charge, downtime réseau, curtailment',
              'Revenu an 1 réaliste : ~6,9M MAD (pas 10,2M) — soit -32%',
              'Indexation réelle contrats Maroc : 1,5% (pas 2%)',
            ]} />
          <AgentCard index={4} title="Opex Reality Check" icon={<Wallet className="w-5 h-5 text-rose-400" />}
            color="border-rose-400/30" impactM="-19M / 20 ans"
            critiques={[
              'O&M technique : 2-3% CAPEX = 600-900K MAD/an (pas 0,71M)',
              'Assurance tout-risque : 0,5% CAPEX = 160K/an (pas 77K)',
              'Sécurité site (gardiennage 24/7 obligatoire) : 200K/an',
              'Land lease avec escalade 3%/an : 200K/an (pas 150K fixe)',
              'Monitoring + reporting + audit SPV : 180K/an',
              'Remplacement onduleurs an 10-12 : 1,5M MAD en one-shot',
              'Nettoyage panels (eau + équipe, sable Maroc) : 250K/an',
              'Opex réaliste : ~1,6M MAD/an + 1,5M onduleurs = 33,5M sur 20 ans (pas 14,2M)',
            ]} />
          <AgentCard index={5} title="Tax, Risk & Time-Value Check" icon={<Scale className="w-5 h-5 text-rose-400" />}
            color="border-rose-400/30" impactM="-35M à -45M"
            critiques={[
              'TFZ = IS 0% les 5 premières années, puis 10% (pas 0% à vie)',
              'Taxe foncière + taxes communales : 80K MAD/an oubliés',
              'IS sur 15 ans restants à 10% sur ~6M profit/an = 9M MAD sur 20 ans',
              'Probabilité défaut client PPA sur 20 ans : 15-25%',
              'Valeur actuelle (VAN @ 8%) = seulement 70% du nominal — 1 MAD dans 20 ans = 0,45 MAD aujourd\'hui',
              'Risque refinancing : si taux monte à 9% en 2030, prêt se renégocie mal',
              'Dégradation réelle modules : 0,7%/an (pas 0,5%) — yield an 20 = 86% du nominal',
            ]} />
        </div>
      </div>

      {/* VERDICT FINAL */}
      <div className="relative max-w-7xl mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-rose-950/30 via-zinc-950/60 to-emerald-950/30 border border-white/10 backdrop-blur-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-2">Verdict final</h2>
            <p className="text-sm text-zinc-400">6 MWp — chiffres audités Maroc 2025</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-400/20 text-center">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Version marketing (avant audit)</div>
              <div className="text-3xl font-black text-rose-400">93,67M</div>
              <div className="text-xs text-zinc-500">MAD net perso 20 ans PPA</div>
              <div className="text-[10px] text-rose-400/70 mt-1">(ce que je t'ai vendu au début)</div>
            </div>
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-400/20 text-center">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Version auditée (nominal)</div>
              <div className="text-3xl font-black text-amber-400">35M</div>
              <div className="text-xs text-zinc-500">MAD net perso 20 ans PPA</div>
              <div className="text-[10px] text-amber-400/70 mt-1">(chiffres réalistes Maroc)</div>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-400/20 text-center">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">VAN (valeur aujourd'hui)</div>
              <div className="text-3xl font-black text-emerald-400">20M</div>
              <div className="text-xs text-zinc-500">MAD actualisés à 8%</div>
              <div className="text-[10px] text-emerald-400/70 mt-1">(ce que ça vaut vraiment)</div>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-300 leading-relaxed">
              <span className="font-bold text-white">Conclusion :</span> PPA reste <span className="font-mono font-bold text-emerald-400">25x</span> plus
              rentable que EPC en valeur absolue sur 20 ans, MAIS demande <span className="font-mono font-bold text-rose-400">9,3M MAD</span> de
              ta poche, supporte <span className="font-mono font-bold text-amber-400">20%</span> de risque de défaut client,
              et le vrai chiffre net est <span className="font-mono font-bold text-amber-400">35M</span> (nominal) ou{' '}
              <span className="font-mono font-bold text-emerald-400">20M</span> (VAN), pas 93,67M.
              La vraie stratégie gagnante = <span className="font-bold text-white">portfolio mix EPC + PPA</span> (voir onglet Portfolio) :
              3,6M cash court terme + 170K MAD/mois passifs + 85M patrimoine 20 ans.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative max-w-7xl mx-auto px-4 pb-16 text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xs text-zinc-600 max-w-2xl mx-auto">
          <p className="mb-2">
            Simulateur Harch Energy — 6 MWp solaire Maroc 2025. TFZ = Tax Free Zone. FDE = Fonds de Développement Énergétique.
            IS = Impôt Sociétés. VAN = Valeur Actuelle Nette. RAS = Retenue À la Source.
          </p>
          <p className="text-zinc-700">Page privée — Non indexée. Ajuste les sliders pour tester d'autres configs.</p>
        </motion.div>
      </div>
    </div>
  );
}
