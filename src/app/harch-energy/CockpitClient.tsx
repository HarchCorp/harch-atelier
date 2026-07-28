'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Lock, LayoutDashboard, Filter, Building2, Sun, Wallet,
  AlertTriangle, FileText, Truck, Brain, TrendingUp, TrendingDown,
  Plus, Check, X, Clock, Zap, CircleDollarSign, Calendar, Target,
  Shield, Activity, Users, Briefcase, ChevronRight, Bell, Sparkles,
  Edit3, Trash2, Save, Download, AlertCircle, CheckCircle2, XCircle,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type LeadStage = 'lead' | 'qualified' | 'negotiation' | 'signed' | 'construction' | 'commissioned' | 'lost';
type ProjectType = 'EPC' | 'PPA';

type Lead = {
  id: string;
  client: string;
  type: ProjectType;
  sizeMwp: number;
  estValueM: number;
  stage: LeadStage;
  contact: string;
  phone: string;
  city: string;
  notes: string;
  createdDate: string;
  expectedCloseDate: string;
  probability: number;
};

type ActiveProject = {
  id: string;
  client: string;
  type: ProjectType;
  sizeMwp: number;
  contractValueM: number;
  startDate: string;
  endDate: string;
  progress: number;          // 0-100
  capexSpentM: number;
  capexTotalM: number;
  milestones: { name: string; date: string; done: boolean; amountM: number }[];
  currentPhase: string;
  risks: string[];
};

type PpaAsset = {
  id: string;
  client: string;
  sizeMwp: number;
  commissioningDate: string;
  contractEnd: string;
  monthlyRevenueM: number;
  monthlyOpexM: number;
  monthlyLoanM: number;
  productionMwh: number;
  expectedProductionMwh: number;
  availability: number;      // %
  lastMaintenance: string;
  nextMaintenance: string;
  clientHealth: 'green' | 'amber' | 'red';
};

type Supplier = {
  id: string;
  name: string;
  category: 'Modules' | 'Onduleurs' | 'Structures' | 'Génie civil' | 'Câblage' | 'Raccordement' | 'Assurance' | 'Juridique';
  contact: string;
  rating: number;            // 1-5
  unitPriceM: number;        // M MAD per MWp
  leadTimeWeeks: number;
  paymentTerms: string;
  notes: string;
};

type Document = {
  id: string;
  project: string;
  type: string;
  status: 'missing' | 'draft' | 'submitted' | 'approved' | 'expired';
  expiryDate?: string;
  owner: string;
};

type Transaction = {
  id: string;
  date: string;
  label: string;
  category: 'client_payment' | 'capex' | 'opex' | 'loan' | 'fde' | 'salary' | 'dividend' | 'tax';
  amountM: number;           // + in, - out
  projectId?: string;
};

/* ═══════════════════════════════════════════════════════════════
   SEED DATA — Démarrage Harch Energy
   ═══════════════════════════════════════════════════════════════ */

const SEED_LEADS: Lead[] = [
  { id: 'l1', client: 'Groupe Ciments Atlas', type: 'PPA', sizeMwp: 9, estValueM: 38.5, stage: 'negotiation', contact: 'M. Benali', phone: '+212 6 12 34 56 78', city: 'Béni Mellal', notes: 'Client industriel gros consommateur. Veux prix indexé 0,72 MAD/kWh. Négociation sur durée (15 vs 20 ans).', createdDate: '2025-06-01', expectedCloseDate: '2025-08-15', probability: 60 },
  { id: 'l2', client: 'Coopérative Agricole Souss', type: 'EPC', sizeMwp: 4, estValueM: 19.5, stage: 'qualified', contact: 'Mme Tazi', phone: '+212 6 22 33 44 55', city: 'Agadir', notes: 'Pompage solaire irrigation. Budget validé. Compare 3 fournisseurs.', createdDate: '2025-06-15', expectedCloseDate: '2025-09-01', probability: 40 },
  { id: 'l3', client: 'Hôtel Atlas Médina', type: 'EPC', sizeMwp: 1.5, estValueM: 7.5, stage: 'lead', contact: 'M. Idrissi', phone: '+212 5 24 00 00 00', city: 'Marrakech', notes: 'Contact entrant via site web. Autoconsommation + stockage.', createdDate: '2025-07-05', expectedCloseDate: '2025-10-15', probability: 20 },
  { id: 'l4', client: 'Zone Industrielle Tanger', type: 'PPA', sizeMwp: 12, estValueM: 56, stage: 'lead', contact: 'M. Karim B.', phone: '+212 6 70 80 90 10', city: 'Tanger', notes: 'Groupe 3 factories. Besoin 12 MWp. Veux PPA 20 ans. Concurrence ACWA.', createdDate: '2025-07-08', expectedCloseDate: '2025-11-30', probability: 25 },
  { id: 'l5', client: 'Cimenterie Safi', type: 'PPA', sizeMwp: 6, estValueM: 27, stage: 'signed', contact: 'M. Ouazzani', phone: '+212 6 60 50 40 30', city: 'Safi', notes: 'Contrat signé 10 juillet. Démarrage construction septembre. Apport 9,3M MAD à blocker.', createdDate: '2025-05-15', expectedCloseDate: '2025-07-10', probability: 100 },
];

const SEED_PROJECTS: ActiveProject[] = [
  { id: 'p1', client: 'Cimenterie Safi', type: 'PPA', sizeMwp: 6, contractValueM: 27, startDate: '2025-09-01', endDate: '2026-01-15', progress: 0, capexSpentM: 0, capexTotalM: 31, currentPhase: 'Pré-construction (permits)', risks: ['Retard permis ONEE possible', 'Sous-sol rocheux sur 30% surface'], milestones: [
    { name: 'Permis ONEE', date: '2025-09-15', done: false, amountM: 0 },
    { name: 'Permis construction', date: '2025-09-30', done: false, amountM: 0 },
    { name: 'Acompte 30% client', date: '2025-10-01', done: false, amountM: 8.1 },
    { name: 'Commande modules', date: '2025-10-05', done: false, amountM: -9.5 },
    { name: 'Début génie civil', date: '2025-10-15', done: false, amountM: -3 },
    { name: 'Acompte 30% mi-chantier', date: '2025-11-15', done: false, amountM: 8.1 },
    { name: 'Pose structures', date: '2025-11-30', done: false, amountM: -4 },
    { name: 'Pose modules', date: '2025-12-15', done: false, amountM: 0 },
    { name: 'Raccordement', date: '2026-01-05', done: false, amountM: -3.5 },
    { name: 'Commissioning', date: '2026-01-15', done: false, amountM: 0 },
    { name: 'Solde 10% client', date: '2026-01-20', done: false, amountM: 2.7 },
  ]},
];

const SEED_PPA_ASSETS: PpaAsset[] = [];

const SEED_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Jinko Solar Maroc', category: 'Modules', contact: '+212 5 22 00 11 22', rating: 5, unitPriceM: 1.8, leadTimeWeeks: 8, paymentTerms: '30% acompte, 70% BL', notes: 'Tier 1. Négocie volume > 5 MWp -8%.' },
  { id: 's2', name: 'LONGi Maroc', category: 'Modules', contact: '+212 5 22 00 33 44', rating: 5, unitPriceM: 1.85, leadTimeWeeks: 10, paymentTerms: 'L/C 90 jours', notes: 'Top qualité. Délai plus long.' },
  { id: 's3', name: 'Huawei Digital Energy', category: 'Onduleurs', contact: '+212 5 22 00 55 66', rating: 4, unitPriceM: 0.6, leadTimeWeeks: 6, paymentTerms: '50/50', notes: 'SUN2000-330KTL. Bon SAV.' },
  { id: 's4', name: 'Sungrow', category: 'Onduleurs', contact: '+212 5 22 00 77 88', rating: 4, unitPriceM: 0.55, leadTimeWeeks: 8, paymentTerms: '40/60', notes: 'Alternative compétitive.' },
  { id: 's5', name: 'Génie Civil BTP Casablanca', category: 'Génie civil', contact: '+212 6 11 22 33 44', rating: 4, unitPriceM: 0.7, leadTimeWeeks: 4, paymentTerms: 'Monthly', notes: 'Local. Bonne execution.' },
  { id: 's6', name: 'ONEE Raccordement', category: 'Raccordement', contact: 'Agence locale', rating: 3, unitPriceM: 1.5, leadTimeWeeks: 16, paymentTerms: 'Taxe officielle', notes: 'Délai variable selon wilaya. Dépôt dossier complet requis.' },
  { id: 's7', name: 'AXA Maroc Corporate', category: 'Assurance', contact: '+212 5 22 00 99 00', rating: 4, unitPriceM: 0.15, leadTimeWeeks: 2, paymentTerms: 'Annuel', notes: 'TRC + RC pro + business interruption.' },
  { id: 's8', name: 'Cabinet Al Sekhri Law', category: 'Juridique', contact: '+212 5 22 11 22 33', rating: 5, unitPriceM: 0.3, leadTimeWeeks: 4, paymentTerms: 'Forfait', notes: 'Spécialisé énergies renouvelables. PPA + SPV.' },
];

const SEED_DOCUMENTS: Document[] = [
  { id: 'd1', project: 'Cimenterie Safi', type: 'Convention PPA', status: 'approved', owner: 'Cabinet Sekhri', expiryDate: '2046-01-15' },
  { id: 'd2', project: 'Cimenterie Safi', type: 'Permis ONEE raccordement', status: 'submitted', owner: 'Harch Energy' },
  { id: 'd3', project: 'Cimenterie Safi', type: 'Permis de construire', status: 'draft', owner: 'Génie Civil BTP' },
  { id: 'd4', project: 'Cimenterie Safi', type: 'Étude de sol', status: 'approved', owner: 'Génie Civil BTP' },
  { id: 'd5', project: 'Cimenterie Safi', type: 'Convention FDE subvention', status: 'submitted', owner: 'Harch Energy' },
  { id: 'd6', project: 'Cimenterie Safi', type: 'Contrat prêt bancaire', status: 'draft', owner: 'Cabinet Sekhri' },
  { id: 'd7', project: 'Cimenterie Safi', type: 'Création SPV', status: 'missing', owner: 'Cabinet Sekhri' },
  { id: 'd8', project: 'Cimenterie Safi', type: 'Police assurance TRC', status: 'missing', owner: 'AXA Maroc' },
];

const SEED_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2025-07-10', label: 'Signature contrat Cimenterie Safi', category: 'client_payment', amountM: 0, projectId: 'p1' },
  { id: 't2', date: '2025-07-10', label: 'Honoraires Cabinet Sekhri (PPA + SPV)', category: 'opex', amountM: -0.15, projectId: 'p1' },
  { id: 't3', date: '2025-07-12', label: 'Étude de sol Génie Civil', category: 'capex', amountM: -0.25, projectId: 'p1' },
];

/* ═══════════════════════════════════════════════════════════════
   STATE PERSISTENCE
   ═══════════════════════════════════════════════════════════════ */

type AppState = {
  leads: Lead[];
  projects: ActiveProject[];
  assets: PpaAsset[];
  suppliers: Supplier[];
  documents: Document[];
  transactions: Transaction[];
  cashPositionM: number;     // cash entreprise actuel
  initialEquityM: number;    // capital de départ
};

const STORAGE_KEY = 'harch-energy-cockpit-v1';

function loadState(): AppState {
  if (typeof window === 'undefined') {
    return {
      leads: SEED_LEADS, projects: SEED_PROJECTS, assets: SEED_PPA_ASSETS,
      suppliers: SEED_SUPPLIERS, documents: SEED_DOCUMENTS,
      transactions: SEED_TRANSACTIONS, cashPositionM: 12, initialEquityM: 12,
    };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return {
    leads: SEED_LEADS, projects: SEED_PROJECTS, assets: SEED_PPA_ASSETS,
    suppliers: SEED_SUPPLIERS, documents: SEED_DOCUMENTS,
    transactions: SEED_TRANSACTIONS, cashPositionM: 12, initialEquityM: 12,
  };
}

function saveState(state: AppState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

/* ═══════════════════════════════════════════════════════════════
   UI PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */

function StarField() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5, delay: Math.random() * 5, duration: Math.random() * 3 + 2,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50" aria-hidden>
      {stars.map((s) => (
        <motion.div key={s.id} className="absolute rounded-full bg-emerald-400"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function KpiCard({ label, value, unit, icon, color, delta, onClick }: {
  label: string; value: string; unit: string; icon: React.ReactNode; color: string; delta?: string; onClick?: () => void;
}) {
  return (
    <motion.div whileHover={onClick ? { scale: 1.03, y: -3 } : {}} onClick={onClick}
      className={`p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md ${onClick ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={color}>{icon}</div>
        {delta && <span className="text-[10px] text-amber-400 font-mono">{delta}</span>}
      </div>
      <div className="text-2xl md:text-3xl font-black text-white font-mono">
        {value}<span className="text-xs text-zinc-500 ml-1">{unit}</span>
      </div>
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{label}</div>
    </motion.div>
  );
}

function TabButton({ active, onClick, icon, label, badge }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number;
}) {
  return (
    <button onClick={onClick}
      className={`relative flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
        active ? 'bg-white/10 text-white border border-white/20 shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300 border border-transparent'}`}>
      {icon}<span className="hidden sm:inline">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

function Button({ onClick, children, variant = 'default', size = 'md' }: {
  onClick?: () => void; children: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'success'; size?: 'sm' | 'md';
}) {
  const variants = {
    default: 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10',
    primary: 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30',
    danger: 'bg-rose-500/20 border border-rose-400/40 text-rose-300 hover:bg-rose-500/30',
    success: 'bg-violet-500/20 border border-violet-400/40 text-violet-300 hover:bg-violet-500/30',
  };
  const sizes = { sm: 'px-2 py-1 text-xs', md: 'px-3 py-1.5 text-sm' };
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 rounded-lg font-medium transition-all ${variants[variant]} ${sizes[size]}`}>
      {children}
    </button>
  );
}

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-950 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-zinc-950 z-10">
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Input({ label, value, onChange, type = 'text' }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-400/50" />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-400/50">
        {options.map((o) => <option key={o.value} value={o.value} className="bg-zinc-900">{o.label}</option>)}
      </select>
    </div>
  );
}

function Badge({ children, color = 'default' }: {
  children: React.ReactNode; color?: 'default' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet';
}) {
  const colors = {
    default: 'bg-white/10 text-zinc-300',
    emerald: 'bg-emerald-500/20 text-emerald-300',
    amber: 'bg-amber-500/20 text-amber-300',
    rose: 'bg-rose-500/20 text-rose-300',
    cyan: 'bg-cyan-500/20 text-cyan-300',
    violet: 'bg-violet-500/20 text-violet-300',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: DASHBOARD
   ═══════════════════════════════════════════════════════════════ */

function DashboardTab({ state, setTab }: { state: AppState; setTab: (t: any) => void }) {
  const totalPipelineM = state.leads
    .filter((l) => l.stage !== 'lost' && l.stage !== 'commissioned')
    .reduce((sum, l) => sum + l.estValueM * l.probability / 100, 0);

  const activeProjectsCount = state.projects.length;
  const ppaAssetsCount = state.assets.length;
  const totalInstalledMwp = state.projects.reduce((s, p) => s + p.sizeMwp, 0)
    + state.assets.reduce((s, a) => s + a.sizeMwp, 0);

  const monthlyRecurringM = state.assets.reduce((s, a) => s + a.monthlyRevenueM - a.monthlyOpexM - a.monthlyLoanM, 0);

  const upcomingMilestones = state.projects
    .flatMap((p) => p.milestones.filter((m) => !m.done).map((m) => ({ ...m, project: p.client, type: p.type })))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const missingDocs = state.documents.filter((d) => d.status === 'missing' || d.status === 'expired');
  const highRisks = state.projects.filter((p) => p.risks.length > 0).length;

  const alerts = [
    ...missingDocs.map((d) => ({ type: 'doc', msg: `Doc manquant: ${d.type} (${d.project})` })),
    ...state.projects.flatMap((p) => p.risks.map((r) => ({ type: 'risk', msg: `${p.client}: ${r}` }))),
  ];

  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Cash entreprise" value={state.cashPositionM.toFixed(2)} unit="M MAD"
          icon={<Wallet className="w-4 h-4" />} color="text-emerald-400" />
        <KpiCard label="Pipeline pondéré" value={totalPipelineM.toFixed(1)} unit="M MAD"
          icon={<TrendingUp className="w-4 h-4" />} color="text-cyan-400"
          delta={`${state.leads.length} leads`} onClick={() => setTab('pipeline')} />
        <KpiCard label="Capacité installée" value={totalInstalledMwp.toFixed(0)} unit="MWp"
          icon={<Sun className="w-4 h-4" />} color="text-amber-400"
          delta={`${activeProjectsCount} projets`} onClick={() => setTab('projects')} />
        <KpiCard label="Revenu mensuel récurrent" value={monthlyRecurringM.toFixed(2)} unit="M MAD/mois"
          icon={<CircleDollarSign className="w-4 h-4" />} color="text-violet-400"
          delta={`${ppaAssetsCount} PPAs`} onClick={() => setTab('assets')} />
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="rounded-2xl bg-rose-500/5 border border-rose-400/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-rose-400">Alertes ({alerts.length})</h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alerts.slice(0, 8).map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{a.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Prochains milestones */}
        <div className="rounded-2xl bg-zinc-950/60 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white">Prochains milestones</h3>
            </div>
            <Button size="sm" onClick={() => setTab('projects')}>Voir projets</Button>
          </div>
          {upcomingMilestones.length === 0 ? (
            <div className="text-sm text-zinc-500 text-center py-6">Aucun milestone à venir</div>
          ) : (
            <div className="space-y-2">
              {upcomingMilestones.map((m, i) => (
                <div key={i} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-sm text-white">{m.name}</div>
                      <div className="text-[10px] text-zinc-500">{m.project} · {m.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-zinc-400">{m.date}</div>
                    {m.amountM !== 0 && (
                      <div className={`text-xs font-mono ${m.amountM > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {m.amountM > 0 ? '+' : ''}{m.amountM.toFixed(1)}M
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents en retard */}
        <div className="rounded-2xl bg-zinc-950/60 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white">Documents manquants</h3>
            </div>
            <Button size="sm" onClick={() => setTab('docs')}>Voir tout</Button>
          </div>
          {missingDocs.length === 0 ? (
            <div className="text-sm text-zinc-500 text-center py-6">Tous les docs à jour ✓</div>
          ) : (
            <div className="space-y-2">
              {missingDocs.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-rose-500/5 border border-rose-400/20">
                  <div>
                    <div className="text-sm text-white">{d.type}</div>
                    <div className="text-[10px] text-zinc-500">{d.project} · {d.owner}</div>
                  </div>
                  <Badge color="rose">{d.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Funnel pipeline */}
      <div className="rounded-2xl bg-zinc-950/60 border border-white/10 p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-cyan-400" />
          Funnel pipeline
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {(['lead', 'qualified', 'negotiation', 'signed', 'construction', 'commissioned'] as LeadStage[]).map((stage) => {
            const leads = state.leads.filter((l) => l.stage === stage);
            const value = leads.reduce((s, l) => s + l.estValueM, 0);
            return (
              <div key={stage} className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">{stage}</div>
                <div className="text-2xl font-black text-white font-mono mt-1">{leads.length}</div>
                <div className="text-xs text-emerald-400 font-mono">{value.toFixed(1)}M</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: PIPELINE CRM (Kanban)
   ═══════════════════════════════════════════════════════════════ */

const STAGES: { id: LeadStage; label: string; color: string }[] = [
  { id: 'lead', label: 'Lead', color: 'border-zinc-400/30' },
  { id: 'qualified', label: 'Qualifié', color: 'border-cyan-400/30' },
  { id: 'negotiation', label: 'Négociation', color: 'border-amber-400/30' },
  { id: 'signed', label: 'Signé', color: 'border-violet-400/30' },
  { id: 'construction', label: 'Construction', color: 'border-emerald-400/30' },
  { id: 'commissioned', label: 'Commissioné', color: 'border-emerald-400/50' },
];

function PipelineTab({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);

  const [form, setForm] = useState<Partial<Lead>>({
    client: '', type: 'EPC', sizeMwp: 6, estValueM: 30, stage: 'lead',
    contact: '', phone: '', city: '', notes: '', probability: 20,
    createdDate: new Date().toISOString().slice(0, 10),
    expectedCloseDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
  });

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setState({ ...state, leads: state.leads.map((l) => l.id === id ? { ...l, ...updates } : l) });
  };

  const deleteLead = (id: string) => {
    setState({ ...state, leads: state.leads.filter((l) => l.id !== id) });
  };

  const saveLead = () => {
    if (!form.client) return;
    if (editLead) {
      updateLead(editLead.id, form);
    } else {
      const newLead: Lead = { ...form, id: `l${Date.now()}` } as Lead;
      setState({ ...state, leads: [...state.leads, newLead] });
    }
    setShowAdd(false);
    setEditLead(null);
    setForm({
      client: '', type: 'EPC', sizeMwp: 6, estValueM: 30, stage: 'lead',
      contact: '', phone: '', city: '', notes: '', probability: 20,
      createdDate: new Date().toISOString().slice(0, 10),
      expectedCloseDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
    });
  };

  const openEdit = (lead: Lead) => {
    setEditLead(lead);
    setForm(lead);
    setShowAdd(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Pipeline commercial</h2>
          <p className="text-sm text-zinc-500">{state.leads.length} leads · {state.leads.reduce((s, l) => s + l.estValueM, 0).toFixed(1)}M MAD potentiel</p>
        </div>
        <Button variant="primary" onClick={() => { setEditLead(null); setShowAdd(true); }}>
          <Plus className="w-4 h-4" />Nouveau lead
        </Button>
      </div>

      <div className="grid md:grid-cols-6 gap-3">
        {STAGES.map((stage) => {
          const leads = state.leads.filter((l) => l.stage === stage.id);
          return (
            <div key={stage.id} className={`rounded-xl bg-zinc-950/60 border ${stage.color} p-3 min-h-[300px]`}>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>{stage.label}</span>
                <span className="text-zinc-500">{leads.length}</span>
              </div>
              <div className="space-y-2">
                {leads.map((lead) => (
                  <motion.div key={lead.id} layout
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 cursor-pointer"
                    onClick={() => openEdit(lead)}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-sm font-bold text-white leading-tight">{lead.client}</div>
                      <Badge color={lead.type === 'EPC' ? 'cyan' : 'amber'}>{lead.type}</Badge>
                    </div>
                    <div className="text-xs text-zinc-500 mb-2">{lead.city} · {lead.sizeMwp} MWp</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-emerald-400 font-bold">{lead.estValueM.toFixed(1)}M</span>
                      <span className="text-zinc-500 font-mono">{lead.probability}%</span>
                    </div>
                    {lead.notes && <p className="text-[10px] text-zinc-600 mt-2 line-clamp-2">{lead.notes}</p>}
                  </motion.div>
                ))}
                {leads.length === 0 && (
                  <div className="text-center text-xs text-zinc-700 py-4">—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={editLead ? 'Modifier lead' : 'Nouveau lead'}>
        <div className="grid md:grid-cols-2 gap-3">
          <Input label="Client" value={form.client || ''} onChange={(v) => setForm({ ...form, client: v })} />
          <Input label="Contact" value={form.contact || ''} onChange={(v) => setForm({ ...form, contact: v })} />
          <Input label="Téléphone" value={form.phone || ''} onChange={(v) => setForm({ ...form, phone: v })} />
          <Input label="Ville" value={form.city || ''} onChange={(v) => setForm({ ...form, city: v })} />
          <Select label="Type" value={form.type || 'EPC'} onChange={(v) => setForm({ ...form, type: v as ProjectType })}
            options={[{ value: 'EPC', label: 'EPC' }, { value: 'PPA', label: 'PPA' }]} />
          <Input label="Taille (MWp)" type="number" value={form.sizeMwp || 0} onChange={(v) => setForm({ ...form, sizeMwp: parseFloat(v) })} />
          <Input label="Valeur estimée (M MAD)" type="number" value={form.estValueM || 0} onChange={(v) => setForm({ ...form, estValueM: parseFloat(v) })} />
          <Input label="Probabilité (%)" type="number" value={form.probability || 0} onChange={(v) => setForm({ ...form, probability: parseFloat(v) })} />
          <Select label="Stage" value={form.stage || 'lead'} onChange={(v) => setForm({ ...form, stage: v as LeadStage })}
            options={STAGES.map((s) => ({ value: s.id, label: s.label }))} />
          <Input label="Date close prévue" type="date" value={form.expectedCloseDate || ''} onChange={(v) => setForm({ ...form, expectedCloseDate: v })} />
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-zinc-400">Notes</label>
            <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-400/50 min-h-[80px]"
              placeholder="Contexte, besoins client, concurrence..." />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="primary" onClick={saveLead}><Save className="w-4 h-4" />{editLead ? 'Modifier' : 'Ajouter'}</Button>
          {editLead && (
            <Button variant="danger" onClick={() => { deleteLead(editLead.id); setShowAdd(false); }}>
              <Trash2 className="w-4 h-4" />Supprimer
            </Button>
          )}
          <Button onClick={() => setShowAdd(false)}>Annuler</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: PROJETS ACTIFS
   ═══════════════════════════════════════════════════════════════ */

function ProjectsTab({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const [selected, setSelected] = useState<string | null>(state.projects[0]?.id || null);

  const project = state.projects.find((p) => p.id === selected);

  const toggleMilestone = (projectId: string, idx: number) => {
    setState({
      ...state,
      projects: state.projects.map((p) => p.id === projectId ? {
        ...p,
        milestones: p.milestones.map((m, i) => i === idx ? { ...m, done: !m.done } : m),
        progress: Math.round((p.milestones.filter((_, i) => i <= idx).length / p.milestones.length) * 100),
      } : p),
    });
  };

  if (state.projects.length === 0) {
    return <div className="text-center py-20 text-zinc-500">Aucun projet actif. Signe un lead dans le pipeline.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white">Projets en cours ({state.projects.length})</h2>
      </div>

      {/* Project selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {state.projects.map((p) => (
          <button key={p.id} onClick={() => setSelected(p.id)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              selected === p.id ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                              : 'bg-white/5 border border-white/10 text-zinc-400'}`}>
            {p.client} · {p.sizeMwp} MWp
          </button>
        ))}
      </div>

      {project && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Project info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl bg-zinc-950/60 border border-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">{project.client}</h3>
                <Badge color={project.type === 'EPC' ? 'cyan' : 'amber'}>{project.type}</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Taille</span><span className="font-mono text-white">{project.sizeMwp} MWp</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Contrat</span><span className="font-mono text-emerald-400">{project.contractValueM.toFixed(1)}M MAD</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">CAPEX total</span><span className="font-mono text-rose-400">{project.capexTotalM.toFixed(1)}M MAD</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">CAPEX dépensé</span><span className="font-mono text-rose-400">{project.capexSpentM.toFixed(1)}M MAD</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Début</span><span className="font-mono text-white">{project.startDate}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Fin prévue</span><span className="font-mono text-white">{project.endDate}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Phase</span><span className="text-white">{project.currentPhase}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500">Progression</span>
                  <span className="font-mono text-emerald-400">{project.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
            </div>

            {/* Risques */}
            <div className="rounded-2xl bg-rose-500/5 border border-rose-400/30 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-rose-400">Risques ({project.risks.length})</h3>
              </div>
              {project.risks.length === 0 ? (
                <div className="text-sm text-zinc-500">Aucun risque identifié</div>
              ) : (
                <ul className="space-y-2">
                  {project.risks.map((r, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />{r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Milestones */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-zinc-950/60 border border-white/10 p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                Milestones — {project.client}
              </h3>
              <div className="space-y-2">
                {project.milestones.map((m, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${
                    m.done ? 'bg-emerald-500/5 border-emerald-400/30' : 'bg-white/5 border-white/10'
                  }`}>
                    <button onClick={() => toggleMilestone(project.id, i)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        m.done ? 'bg-emerald-500 border-emerald-500' : 'border-white/30 hover:border-emerald-400'
                      }`}>
                      {m.done && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${m.done ? 'text-zinc-400 line-through' : 'text-white'}`}>{m.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{m.date}</div>
                    </div>
                    {m.amountM !== 0 && (
                      <span className={`font-mono font-bold text-sm ${m.amountM > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {m.amountM > 0 ? '+' : ''}{m.amountM.toFixed(1)}M
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: PPA ASSETS (portefeuille en exploitation)
   ═══════════════════════════════════════════════════════════════ */

function AssetsTab({ state }: { state: AppState }) {
  if (state.assets.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-white">Portefeuille PPA en exploitation</h2>
        <div className="rounded-2xl bg-zinc-950/60 border border-white/10 p-12 text-center">
          <Sun className="w-12 h-12 text-amber-400/50 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Aucun actif PPA en exploitation</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-4">
            Une fois ton premier projet PPA commissioné (prévu janvier 2026 pour Cimenterie Safi),
            il apparaîtra ici avec son monitoring temps réel.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-400/30 text-amber-400 text-xs">
            <Clock className="w-3 h-3" />
            <span>Commissioning prévu : 15 janvier 2026</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-white">Portefeuille PPA ({state.assets.length} actifs)</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {state.assets.map((a) => (
          <div key={a.id} className="rounded-2xl bg-zinc-950/60 border border-white/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white">{a.client}</h3>
              <Badge color={a.clientHealth === 'green' ? 'emerald' : a.clientHealth === 'amber' ? 'amber' : 'rose'}>
                {a.clientHealth}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-[10px] text-zinc-500 uppercase">Taille</div><div className="font-mono text-white">{a.sizeMwp} MWp</div></div>
              <div><div className="text-[10px] text-zinc-500 uppercase">Disponibilité</div><div className="font-mono text-emerald-400">{a.availability}%</div></div>
              <div><div className="text-[10px] text-zinc-500 uppercase">Revenu mensuel</div><div className="font-mono text-emerald-400">{a.monthlyRevenueM.toFixed(2)}M</div></div>
              <div><div className="text-[10px] text-zinc-500 uppercase">Opex mensuel</div><div className="font-mono text-rose-400">-{a.monthlyOpexM.toFixed(2)}M</div></div>
              <div><div className="text-[10px] text-zinc-500 uppercase">Prêt mensuel</div><div className="font-mono text-rose-400">-{a.monthlyLoanM.toFixed(2)}M</div></div>
              <div><div className="text-[10px] text-zinc-500 uppercase">Net mensuel</div><div className="font-mono text-violet-400">{(a.monthlyRevenueM - a.monthlyOpexM - a.monthlyLoanM).toFixed(2)}M</div></div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Production: {a.productionMwh} / {a.expectedProductionMwh} MWh</span>
                <span>{((a.productionMwh / a.expectedProductionMwh) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: `${(a.productionMwh / a.expectedProductionMwh) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: FINANCIAL COCKPIT
   ═══════════════════════════════════════════════════════════════ */

function FinanceTab({ state }: { state: AppState }) {
  const totalIn = state.transactions.filter((t) => t.amountM > 0).reduce((s, t) => s + t.amountM, 0);
  const totalOut = state.transactions.filter((t) => t.amountM < 0).reduce((s, t) => s + Math.abs(t.amountM), 0);

  const byCategory = state.transactions.reduce((acc, t) => {
    const key = t.category;
    if (!acc[key]) acc[key] = { in: 0, out: 0 };
    if (t.amountM > 0) acc[key].in += t.amountM;
    else acc[key].out += Math.abs(t.amountM);
    return acc;
  }, {} as Record<string, { in: number; out: number }>);

  const categoryLabels: Record<string, string> = {
    client_payment: 'Paiements client', capex: 'CAPEX', opex: 'OPEX',
    loan: 'Prêts', fde: 'Subvention FDE', salary: 'Salaires',
    dividend: 'Dividendes', tax: 'Impôts',
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-white">Cockpit financier</h2>

      <div className="grid md:grid-cols-3 gap-3">
        <KpiCard label="Cash entreprise" value={state.cashPositionM.toFixed(2)} unit="M MAD"
          icon={<Wallet className="w-4 h-4" />} color="text-emerald-400" />
        <KpiCard label="Total encaissé" value={totalIn.toFixed(2)} unit="M MAD"
          icon={<TrendingUp className="w-4 h-4" />} color="text-cyan-400" />
        <KpiCard label="Total dépensé" value={totalOut.toFixed(2)} unit="M MAD"
          icon={<TrendingDown className="w-4 h-4" />} color="text-rose-400" />
      </div>

      <div className="rounded-2xl bg-zinc-950/60 border border-white/10 p-5">
        <h3 className="font-bold text-white mb-4">Transactions ({state.transactions.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr className="text-left text-zinc-400">
                <th className="p-2">Date</th>
                <th className="p-2">Label</th>
                <th className="p-2">Catégorie</th>
                <th className="p-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {state.transactions.slice().reverse().map((t) => (
                <tr key={t.id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="p-2 font-mono text-zinc-400 text-xs">{t.date}</td>
                  <td className="p-2 text-white">{t.label}</td>
                  <td className="p-2"><Badge>{categoryLabels[t.category] || t.category}</Badge></td>
                  <td className={`p-2 text-right font-mono font-bold ${t.amountM > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.amountM > 0 ? '+' : ''}{t.amountM.toFixed(2)}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-950/60 border border-white/10 p-5">
        <h3 className="font-bold text-white mb-4">Synthèse par catégorie</h3>
        <div className="grid md:grid-cols-4 gap-3">
          {Object.entries(byCategory).map(([cat, vals]) => (
            <div key={cat} className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">{categoryLabels[cat] || cat}</div>
              <div className="font-mono text-emerald-400 mt-1">+{vals.in.toFixed(2)}M</div>
              <div className="font-mono text-rose-400">-{vals.out.toFixed(2)}M</div>
              <div className="text-xs text-zinc-500 mt-1">Net: <span className="font-mono">{(vals.in - vals.out).toFixed(2)}M</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: SUPPLIERS
   ═══════════════════════════════════════════════════════════════ */

function SuppliersTab({ state }: { state: AppState }) {
  const categories = ['Modules', 'Onduleurs', 'Structures', 'Génie civil', 'Câblage', 'Raccordement', 'Assurance', 'Juridique'];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-white">Fournisseurs ({state.suppliers.length})</h2>
      <div className="grid md:grid-cols-2 gap-3">
        {categories.map((cat) => {
          const suppliers = state.suppliers.filter((s) => s.category === cat);
          if (suppliers.length === 0) return null;
          return (
            <div key={cat} className="rounded-2xl bg-zinc-950/60 border border-white/10 p-5">
              <h3 className="font-bold text-emerald-400 mb-3 text-sm uppercase tracking-wider">{cat}</h3>
              <div className="space-y-2">
                {suppliers.map((s) => (
                  <div key={s.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-bold text-white">{s.name}</div>
                      <div className="flex">
                        {[1,2,3,4,5].map((i) => (
                          <span key={i} className={`text-xs ${i <= s.rating ? 'text-amber-400' : 'text-zinc-700'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                      <div><div className="text-zinc-500">Prix</div><div className="font-mono text-emerald-400">{s.unitPriceM.toFixed(2)}M/MWp</div></div>
                      <div><div className="text-zinc-500">Délai</div><div className="font-mono text-white">{s.leadTimeWeeks} sem</div></div>
                      <div><div className="text-zinc-500">Paiement</div><div className="text-white text-[10px]">{s.paymentTerms}</div></div>
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-2">{s.contact}</div>
                    {s.notes && <p className="text-[10px] text-zinc-600 mt-1 italic">{s.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: DOCUMENTS
   ═══════════════════════════════════════════════════════════════ */

function DocumentsTab({ state }: { state: AppState }) {
  const statusColors: Record<string, 'rose' | 'amber' | 'cyan' | 'emerald' | 'default'> = {
    missing: 'rose', expired: 'rose', draft: 'amber', submitted: 'cyan', approved: 'emerald',
  };
  const statusIcons: Record<string, React.ReactNode> = {
    missing: <XCircle className="w-4 h-4" />, expired: <AlertCircle className="w-4 h-4" />,
    draft: <Edit3 className="w-4 h-4" />, submitted: <Clock className="w-4 h-4" />,
    approved: <CheckCircle2 className="w-4 h-4" />,
  };

  const projects = [...new Set(state.documents.map((d) => d.project))];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-white">Documents & conformité</h2>
      <div className="grid md:grid-cols-5 gap-3">
        {(['missing', 'draft', 'submitted', 'approved', 'expired'] as const).map((st) => {
          const count = state.documents.filter((d) => d.status === st).length;
          return (
            <div key={st} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">{st}</div>
              <div className="text-2xl font-black text-white font-mono mt-1">{count}</div>
            </div>
          );
        })}
      </div>

      {projects.map((proj) => (
        <div key={proj} className="rounded-2xl bg-zinc-950/60 border border-white/10 p-5">
          <h3 className="font-bold text-white mb-3">{proj}</h3>
          <div className="space-y-2">
            {state.documents.filter((d) => d.project === proj).map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className={statusColors[d.status] === 'rose' ? 'text-rose-400' : statusColors[d.status] === 'emerald' ? 'text-emerald-400' : statusColors[d.status] === 'amber' ? 'text-amber-400' : 'text-cyan-400'}>
                  {statusIcons[d.status]}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white">{d.type}</div>
                  <div className="text-[10px] text-zinc-500">Owner: {d.owner}{d.expiryDate ? ` · Expire: ${d.expiryDate}` : ''}</div>
                </div>
                <Badge color={statusColors[d.status]}>{d.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: AI CO-PILOT (Recommandations)
   ═══════════════════════════════════════════════════════════════ */

function AITab({ state }: { state: AppState }) {
  // Génération de recommandations basées sur l'état
  const recommendations = useMemo(() => {
    const recs: { priority: 'high' | 'medium' | 'low'; title: string; desc: string; action: string }[] = [];

    // 1. Docs manquants
    const missing = state.documents.filter((d) => d.status === 'missing');
    if (missing.length > 0) {
      recs.push({
        priority: 'high',
        title: `${missing.length} documents critiques manquants`,
        desc: `Documents à initialiser urgemment : ${missing.map((d) => d.type).join(', ')}. Sans ces documents, le projet Cimenterie Safi ne peut pas démarrer la construction.`,
        action: 'Contacter les owners listés dans l\'onglet Documents',
      });
    }

    // 2. Pipeline faible
    const leads = state.leads.filter((l) => l.stage === 'lead' || l.stage === 'qualified');
    if (leads.length < 5) {
      recs.push({
        priority: 'medium',
        title: 'Pipeline en sous-capacité',
        desc: `Seulement ${leads.length} leads actifs. Cible optimale : 8-10 leads pour assurer 1-2 signatures/trimestre. Recommandation : intensifier prospection.`,
        action: 'Lancer campagne outbound : 20 industriels Maroc, focus zones Tanger/Casablanca/Tanger',
      });
    }

    // 3. Concentration client
    const totalValue = state.leads.reduce((s, l) => s + l.estValueM, 0);
    const biggest = state.leads[0];
    if (biggest && biggest.estValueM / totalValue > 0.4) {
      recs.push({
        priority: 'medium',
        title: 'Concentration risque client',
        desc: `${biggest.client} représente ${(biggest.estValueM / totalValue * 100).toFixed(0)}% du pipeline. Si perte = impact majeur sur trésorerie.`,
        action: 'Diversifier : signer 2-3 plus petits projets (3-4 MWp) avant de conclure le gros',
      });
    }

    // 4. Cash runway
    const monthlyBurn = 0.15 + 0.05; // salaries + opex approx
    const runway = state.cashPositionM / monthlyBurn;
    if (runway < 18) {
      recs.push({
        priority: runway < 12 ? 'high' : 'medium',
        title: `Cash runway : ${runway.toFixed(0)} mois`,
        desc: `Au burn actuel (${monthlyBurn.toFixed(2)}M MAD/mois), tu as ${runway.toFixed(0)} mois de cash. Sous 12 mois = risque critique. Sous 18 mois = vigilance.`,
        action: runway < 12
          ? 'URGENT : accélérer signature EPC court terme ou lever 5M MAD'
          : 'Préparer plan de levée ou ligne de crédit standby',
      });
    }

    // 5. PPA vs EPC mix
    const ppaValue = state.leads.filter((l) => l.type === 'PPA').reduce((s, l) => s + l.estValueM, 0);
    const epcValue = state.leads.filter((l) => l.type === 'EPC').reduce((s, l) => s + l.estValueM, 0);
    if (epcValue === 0) {
      recs.push({
        priority: 'high',
        title: 'Aucun EPC dans le pipeline',
        desc: 'Le cash court terme vient des EPCs. Sans EPC, tu dois financer les PPAs sur fonds propres uniquement. Risque de cash squeeze.',
        action: 'Prospecter activement 3-4 leads EPC (autoconsommation industrielle, hôtellerie)',
      });
    }

    // 6. Mix tailles
    const smallProjects = state.leads.filter((l) => l.sizeMwp < 3).length;
    if (smallProjects === 0) {
      recs.push({
        priority: 'low',
        title: 'Aucun petit projet dans le pipeline',
        desc: 'Les petits projets (1-3 MWp) ont une marge inférieure mais signent plus vite et construisent le track record.',
        action: 'Cibler 2 petits projets autoconsommation pour démarrer',
      });
    }

    // 7. Risques projet
    const riskyProjects = state.projects.filter((p) => p.risks.length > 0);
    riskyProjects.forEach((p) => {
      recs.push({
        priority: 'medium',
        title: `Risques sur ${p.client}`,
        desc: p.risks.join(' · '),
        action: 'Mettre en place plan de mitigation pour chaque risque identifié',
      });
    });

    return recs;
  }, [state]);

  const priorityColors: Record<'high' | 'medium' | 'low', string> = {
    high: 'bg-rose-500/5 border-rose-400/30 text-rose-400',
    medium: 'bg-amber-500/5 border-amber-400/30 text-amber-400',
    low: 'bg-cyan-500/5 border-cyan-400/30 text-cyan-400',
  };
  const priorityBadgeColors: Record<'high' | 'medium' | 'low', 'rose' | 'amber' | 'cyan'> = {
    high: 'rose', medium: 'amber', low: 'cyan',
  };
  const priorityLabels = { high: 'Haute', medium: 'Moyenne', low: 'Basse' };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-violet-500/20 border border-violet-400/50">
          <Brain className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Co-pilote IA</h2>
          <p className="text-sm text-zinc-500">{recommendations.length} recommandations stratégiques</p>
        </div>
      </div>

      <div className="rounded-2xl bg-violet-500/5 border border-violet-400/30 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-zinc-300 leading-relaxed">
            Je scanne en continu ton pipeline, tes projets actifs, ta trésorerie et tes documents.
            Je te recommande les 10% que tu dois gérer toi-même : décisions stratégiques, signatures client, négociations.
            Le reste (suivi milestones, relances docs, monitoring) est automatisé.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.sort((a, b) => {
          const order = { high: 0, medium: 1, low: 2 };
          return order[a.priority] - order[b.priority];
        }).map((rec, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={`p-5 rounded-2xl border ${priorityColors[rec.priority]}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-bold text-white">{rec.title}</h3>
              <Badge color={priorityBadgeColors[rec.priority]}>{priorityLabels[rec.priority]}</Badge>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed mb-3">{rec.desc}</p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Target className="w-3.5 h-3.5" />
              <span>{rec.action}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

type TabId = 'dashboard' | 'pipeline' | 'projects' | 'assets' | 'finance' | 'suppliers' | 'docs' | 'ai';

export default function HarchEnergyCockpit() {
  const [state, setStateRaw] = useState<AppState | null>(null);
  const [tab, setTab] = useState<TabId>('dashboard');

  useEffect(() => {
    setStateRaw(loadState());
  }, []);

  const setState = useCallback((s: AppState) => {
    setStateRaw(s);
    saveState(s);
  }, []);

  useEffect(() => {
    document.body.style.background = '#050505';
    document.body.style.color = '#fff';
    return () => {
      document.body.style.background = '';
      document.body.style.color = '';
    };
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-zinc-500">Chargement cockpit...</div>
      </div>
    );
  }

  const missingDocsCount = state.documents.filter((d) => d.status === 'missing').length;
  const activeRisksCount = state.projects.reduce((s, p) => s + p.risks.length, 0);

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'pipeline' as const, label: 'Pipeline', icon: <Filter className="w-4 h-4" /> },
    { id: 'projects' as const, label: 'Projets', icon: <Building2 className="w-4 h-4" /> },
    { id: 'assets' as const, label: 'PPA Assets', icon: <Sun className="w-4 h-4" /> },
    { id: 'finance' as const, label: 'Finance', icon: <Wallet className="w-4 h-4" /> },
    { id: 'suppliers' as const, label: 'Fournisseurs', icon: <Truck className="w-4 h-4" /> },
    { id: 'docs' as const, label: 'Documents', icon: <FileText className="w-4 h-4" />, badge: missingDocsCount },
    { id: 'ai' as const, label: 'Co-pilote IA', icon: <Brain className="w-4 h-4" />, badge: activeRisksCount + missingDocsCount },
  ];

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden"
      style={{ background: 'radial-gradient(ellipse at top, #0a1410 0%, #050505 50%, #000000 100%)' }}>
      <StarField />

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
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="font-mono">Harch Energy — Cockpit</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-400/30 text-amber-400 text-[10px] font-mono uppercase tracking-wider">
              <Lock className="w-3 h-3" />Non répertorié
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-[10px] font-mono uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />Live
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative pt-10 pb-6 px-4 text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none"
        />
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
          Cockpit opérationnel{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">Harch Energy</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-sm text-zinc-500">
          Je gère 90% — tu décides les 10% (signatures, négociations, stratégie)
        </motion.p>
      </div>

      {/* Tabs */}
      <div className="sticky top-[57px] z-40 backdrop-blur-xl bg-zinc-950/60 border-y border-white/5 py-3 px-4">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} icon={t.icon} label={t.label} badge={t.badge} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            {tab === 'dashboard' && <DashboardTab state={state} setTab={setTab} />}
            {tab === 'pipeline' && <PipelineTab state={state} setState={setState} />}
            {tab === 'projects' && <ProjectsTab state={state} setState={setState} />}
            {tab === 'assets' && <AssetsTab state={state} />}
            {tab === 'finance' && <FinanceTab state={state} />}
            {tab === 'suppliers' && <SuppliersTab state={state} />}
            {tab === 'docs' && <DocumentsTab state={state} />}
            {tab === 'ai' && <AITab state={state} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="relative max-w-7xl mx-auto px-4 pb-12 text-center">
        <p className="text-[10px] text-zinc-600">
          Données persistées localement (localStorage). Page privée — non indexée. Harch Energy SA · Casablanca.
        </p>
      </div>
    </div>
  );
}
