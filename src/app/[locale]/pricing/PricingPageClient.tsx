'use client';

import { useState, useMemo, Fragment, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  SectionDivider,
} from '@/components/ui/motion';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Cpu,
  ChevronDown,
  HardDrive,
  Database,
  Wifi,
  Headphones,
  Clock,
  Shield,
  Sun,
  Droplets,
  Building2,
  Pickaxe,
  Sprout,
  Cog,
  Landmark,
  Sparkles,
  Calculator as CalcIcon,
  Layers,
  TrendingDown,
  Leaf,
  Globe2,
  Lock,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   LOCAL --font-mono OVERRIDE → font-mono utility renders Space Mono
   per HARCH_BRAND_SYSTEM.md §2 (Mono / Data / Code).
   ═══════════════════════════════════════════════════════════════ */
const monoOverride = { '--font-mono': 'var(--font-space-mono)' } as CSSProperties;

/* ═══════════════════════════════════════════════════════════════
   SHARED PRIMITIVES — brand-compliant helpers
   ═══════════════════════════════════════════════════════════════ */

/** Section label pattern per brand system §4 — emerald accent bar + tracked uppercase label. */
function SectionLabel({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="h-px w-8 bg-emerald-500" aria-hidden="true" />
      <p
        className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${
          light ? 'text-emerald-600' : 'text-emerald-500'
        }`}
      >
        {children}
      </p>
    </div>
  );
}

/** HARCH CORP hero badge — emerald dot + tracked mono text per brand system §5a. */
function HarchBadge({ label, dark = true }: { label: string; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] ${
        dark
          ? 'border-neutral-800 bg-neutral-900/70 text-white backdrop-blur'
          : 'border-neutral-200 bg-white text-neutral-950'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
      <span className="font-mono">{label}</span>
    </span>
  );
}

/** Primary emerald CTA per brand system §4. */
function PrimaryCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 bg-emerald-500 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400"
    >
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}

/** Secondary outline CTA per brand system §4. */
function SecondaryCta({
  href,
  children,
  dark = false,
}: {
  href: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        dark
          ? 'inline-flex items-center gap-2 border border-neutral-700 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-neutral-900'
          : 'inline-flex items-center gap-2 border border-neutral-300 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-neutral-950 transition-colors hover:bg-neutral-100'
      }
    >
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}

/** Compact inline "Explore →" link used inside product pricing tables. */
function ProductLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-emerald-500 transition-colors hover:text-emerald-400"
    >
      Explore product
      <ArrowRight size={12} />
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DATA — HARCHOS GPU INSTANCE PRICING (monthly / annual)
   ═══════════════════════════════════════════════════════════════ */
type GpuInstance = {
  gpu: string;
  vram: string;
  tier: string;
  hub: string;
  monthly: number; // $/hr monthly billing
  annual: number; // $/hr annual commit (30% discount)
  carbon: number; // gCO2/kWh
  renewable: string;
};
const gpuInstances: GpuInstance[] = [
  { gpu: 'H100', vram: '80GB', tier: 'Enterprise', hub: 'Ouarzazate', monthly: 2.20, annual: 1.54, carbon: 18, renewable: '97.2%' },
  { gpu: 'H200', vram: '141GB', tier: 'Enterprise', hub: 'Dakhla', monthly: 3.00, annual: 2.10, carbon: 32, renewable: '94.8%' },
  { gpu: 'A100', vram: '80GB', tier: 'Performance', hub: 'Benguerir', monthly: 1.80, annual: 1.26, carbon: 55, renewable: '88.5%' },
  { gpu: 'A100', vram: '40GB', tier: 'Standard', hub: 'Tanger', monthly: 1.55, annual: 1.09, carbon: 95, renewable: '82.1%' },
  { gpu: 'L40S', vram: '48GB', tier: 'Performance', hub: 'Benguerir', monthly: 1.20, annual: 0.84, carbon: 55, renewable: '88.5%' },
  { gpu: 'L40S', vram: '48GB', tier: 'Standard', hub: 'Casablanca', monthly: 1.10, annual: 0.77, carbon: 210, renewable: '45.0%' },
];

/* ═══════════════════════════════════════════════════════════════
   DATA — HARCHLINK TIERS
   ═══════════════════════════════════════════════════════════════ */
const harchlinkTiers = [
  { name: 'Team', users: 'Up to 25', monthly: 18, annual: 14, features: ['End-to-end encrypted chat', 'Federated identity (OIDC)', '30-day message history', 'Community support'] },
  { name: 'Business', users: 'Up to 250', monthly: 24, annual: 19, features: ['Everything in Team', 'Sovereign data residency (Morocco)', '1-year message retention', 'Priority email support', 'Audit logs + DLP'] },
  { name: 'Enterprise', users: 'Unlimited', monthly: 38, annual: 30, features: ['Everything in Business', 'Dedicated HarchOS cluster', 'Custom compliance (ISO 27001, SOC 2)', '99.95% SLA + dedicated SRE', 'On-prem air-gap option'] },
];

/* ═══════════════════════════════════════════════════════════════
   DATA — ENERGY PRICING (EPC / PPA / Hybrid)
   ═══════════════════════════════════════════════════════════════ */
const energyModels = [
  { model: 'Spot EPC', desc: 'Pay-as-produced solar/wind at spot market index.', price: '$0.045', unit: '/kWh', term: 'Hourly', note: 'No minimum offtake' },
  { model: 'PPA — Solar', desc: '15-year Power Purchase Agreement, Benguerir 800MW.', price: '$0.028', unit: '/kWh', term: '15-year', note: '97.2% renewable' },
  { model: 'PPA — Wind', desc: '20-year PPA, Tanger 1.2GW Atlantic corridor.', price: '$0.032', unit: '/kWh', term: '20-year', note: '94.8% capacity factor' },
  { model: 'Hybrid baseload', desc: 'Solar + storage + wind firm 24/7 supply.', price: '$0.052', unit: '/kWh', term: '12-year', note: 'Round-the-clock' },
];

/* ═══════════════════════════════════════════════════════════════
   DATA — WATER PRICING (Bulk / BOT / BOO)
   ═══════════════════════════════════════════════════════════════ */
const waterModels = [
  { model: 'Bulk Supply', desc: 'Treated bulk water delivered to municipal grid.', price: '$0.62', unit: '/m³', term: 'Spot', note: 'Minimum 5,000 m³/day' },
  { model: 'BOT Desalination', desc: 'Build-Operate-Transfer, 250,000 m³/day plant, 25-year concession.', price: '$0.78', unit: '/m³', term: '25-year', note: 'Asset transfers at year 25' },
  { model: 'BOO Desalination', desc: 'Build-Own-Operate, 500,000 m³/day, Harch retains ownership.', price: '$0.85', unit: '/m³', term: '30-year', note: 'Energy included' },
  { model: 'Industrial reuse', desc: 'Treated greywater for industrial cooling & irrigation.', price: '$0.34', unit: '/m³', term: '5-year', note: 'ISO 16075 compliant' },
];

/* ═══════════════════════════════════════════════════════════════
   DATA — CEMENT PRICING (Spot / Annual / Strategic)
   ═══════════════════════════════════════════════════════════════ */
const cementModels = [
  { model: 'Spot (CEM I 52.5N)', desc: 'Day-ahead truck delivery from Safi hub.', price: '$112', unit: '/tonne', term: 'Spot', note: 'Minimum 28t truckload' },
  { model: 'Annual contract', desc: '12-month volume commitment, monthly call-offs.', price: '$98', unit: '/tonne', term: '12-month', note: 'Min 50,000t/year' },
  { model: 'Strategic alliance', desc: '3-year offtake with rail-priority dispatch.', price: '$89', unit: '/tonne', term: '36-month', note: 'Min 250,000t/year' },
  { model: 'Low-carbon ECOCem', desc: 'Calcined clay blend, 40% lower CO₂ than OPC.', price: '$124', unit: '/tonne', term: '12-month', note: 'LEED/BREEAM certified' },
];

/* ═══════════════════════════════════════════════════════════════
   DATA — MINING OFFTAKE (LME-indexed)
   ═══════════════════════════════════════════════════════════════ */
const miningModels = [
  { model: 'Copper cathode Grade A', desc: 'LME + 2.5% premium, FOB Casablanca.', price: 'LME+2.5%', unit: '/tonne', term: 'Spot', note: '99.99% Cu, EN 1978' },
  { model: 'Cobalt hydroxide', desc: 'LME Co + 8% logistics, 30% contained Co.', price: 'LME+8%', unit: '/dmt', term: '12-month', note: 'Min 500t/month' },
  { model: 'Phosphate rock (BPL)', desc: '33% BPL, long-term contract indexed to fertilizer basket.', price: '$145', unit: '/tonne', term: '5-year', note: 'FOB Jorf Lasfar' },
  { model: 'Strategic reserve', desc: 'Sovereign stockpile for government offtake, fixed priced.', price: 'Classified', unit: '—', term: '10-year', note: 'Govt-only access' },
];

/* ═══════════════════════════════════════════════════════════════
   DATA — AGRICULTURE PRICING (Smallholder / Commercial / Estate)
   ═══════════════════════════════════════════════════════════════ */
const agriModels = [
  { model: 'Smallholder SaaS', desc: 'Per-hectare subscription, Apollo + IoT sensors bundled.', price: '$48', unit: '/ha/year', term: 'Annual', note: 'Min 5 ha' },
  { model: 'Commercial offtake', desc: 'Guaranteed buy-back for cereals, olives, citrus at index floor.', price: '+8%', unit: 'vs CBOT', term: 'Season', note: 'Min 200 ha' },
  { model: 'Estate managed farm', desc: 'Full-stack farm management, Harch operates the land.', price: '30%', unit: 'of revenue', term: '5-year', note: 'Min 1,000 ha' },
  { model: 'Export-grade cold chain', desc: 'Reefer logistics Casablanca → Rotterdam, 0-4°C.', price: '$0.18', unit: '/kg', term: 'Per shipment', note: 'MAFF certified' },
];

/* ═══════════════════════════════════════════════════════════════
   DATA — TECHNOLOGY PRICING (Essential / Enterprise / Sovereign)
   ═══════════════════════════════════════════════════════════════ */
const techTiers = [
  { name: 'Essential', price: 'From $4,900', unit: '/month', desc: 'For SMEs deploying HarchShield SIEM on a single site.', features: ['Up to 250 endpoints', 'SIEM + EDR core', '8/5 support', 'Quarterly threat report'] },
  { name: 'Enterprise', price: 'From $24,500', unit: '/month', desc: 'Multi-site deployment with managed detection & response.', features: ['Up to 5,000 endpoints', '24/7 SOC + MDR', 'Satellite uplink', 'Custom playbooks', '99.95% SLA'], highlight: true },
  { name: 'Sovereign', price: 'Custom', unit: 'govt contract', desc: 'Air-gapped SIEM for ministries, defense, critical infra.', features: ['Unlimited endpoints', 'Air-gapped deployment', 'Dedicated cleared SRE', '99.99% SLA', 'DSP-5 / FedRAMP High'] },
];

/* ═══════════════════════════════════════════════════════════════
   DATA — FINANCE FEES (Advisory / JV / Lead Arranger)
   ═══════════════════════════════════════════════════════════════ */
const financeFees = [
  { model: 'Advisory (project finance)', desc: 'Mandated lead arranger advisory, renewable/infra deals $50M-$2B.', price: '0.75%', unit: 'of deal size', term: 'Per mandate', note: 'Min retainer $250k' },
  { model: 'JV equity participation', desc: 'Harch co-invests 15-35% equity in SPV alongside sponsor.', price: '15-35%', unit: 'equity stake', term: 'Project life', note: 'Board seat included' },
  { model: 'Lead arranger (senior debt)', desc: 'Syndicate senior debt facilities, $100M-$1.5B ticket sizes.', price: '125bps', unit: 'arrangement fee', term: 'Per facility', note: 'Plus 50bps agency' },
  { model: 'Blended-finance structuring', desc: 'Catalytic capital layering for developmental projects.', price: '60bps', unit: '/year AUM', term: '5-year', note: 'Min $50M AUM' },
];

/* ═══════════════════════════════════════════════════════════════
   DATA — PLATFORM TIERS (Starter / Pro / Enterprise / Sovereign)
   ═══════════════════════════════════════════════════════════════ */
type PlatformTier = {
  name: string;
  monthly: number | null; // null = Custom/Classified
  monthlyLabel: string;
  annualLabel: string;
  detail: string;
  description: string;
  badge: string;
  highlight: boolean;
  cta: string;
};
const platformTiers: PlatformTier[] = [
  { name: 'Starter', monthly: 0, monthlyLabel: '$0', annualLabel: '$0', detail: 'forever', description: 'For exploration and prototyping. No credit card required to launch your first GPU workload.', badge: '', highlight: false, cta: 'Start Free' },
  { name: 'Professional', monthly: 499, monthlyLabel: '$499', annualLabel: '$399', detail: '/seat/month', description: 'For teams scaling AI workloads with predictable costs, priority support, and carbon-aware scheduling.', badge: 'Most Popular', highlight: true, cta: 'Start Pro Trial' },
  { name: 'Enterprise', monthly: null, monthlyLabel: 'Custom', annualLabel: 'Custom', detail: 'annual contract', description: 'Dedicated capacity, custom SLAs, on-premise deployment options across all 5 Moroccan hubs.', badge: '', highlight: false, cta: 'Contact Sales' },
  { name: 'Sovereign', monthly: null, monthlyLabel: 'Classified', annualLabel: 'Classified', detail: 'government & defense', description: 'Air-gapped deployment, sovereign clearance, dedicated personnel with security clearance.', badge: 'Government', highlight: false, cta: 'Request Briefing' },
];

/* ═══════════════════════════════════════════════════════════════
   DATA — ADD-ONS
   ═══════════════════════════════════════════════════════════════ */
const addons = [
  { icon: HardDrive, name: 'Block Storage', price: '$0.02', unit: '/GB/month', desc: 'NVMe-backed, 99.999% durability. Carbon-tracked per gigabyte.' },
  { icon: Database, name: 'Object Storage', price: '$0.015', unit: '/GB/month', desc: 'S3-compatible API. Cross-hub replication available on Enterprise tier.' },
  { icon: Wifi, name: 'Egress Bandwidth', price: '$0.05', unit: '/GB', desc: 'First 100 GB free on all tiers. Submarine cable priority on Enterprise and above.' },
  { icon: Headphones, name: 'Priority Support', price: '$500', unit: '/month', desc: '24/7 Slack channel, 1-hour response, dedicated SRE on call for your account.' },
  { icon: Clock, name: 'Reserved Capacity', price: '-30%', unit: '1-yr commit', desc: 'Commit to 1 or 3 years for 30-40% discount. Ideal for sustained inference workloads.' },
  { icon: Shield, name: 'Custom Compliance', price: 'Custom', unit: 'audit-based', desc: 'ISO 27001, SOC 2, DSP-5, HIPAA, FedRAMP. Dedicated compliance engineer assigned.' },
];

/* ═══════════════════════════════════════════════════════════════
   DATA — COMPARISON MATRIX (HarchOS vs AWS / GCP / Azure)
   ═══════════════════════════════════════════════════════════════ */
const cloudComparison = [
  { metric: 'H100 per hour', harchos: '$1.54', aws: '$3.40', gcp: '$3.67', azure: '$3.40', saving: '55%' },
  { metric: 'H200 per hour', harchos: '$2.10', aws: '$4.50', gcp: '$4.80', azure: '$4.50', saving: '53%' },
  { metric: 'A100 per hour', harchos: '$1.09', aws: '$2.10', gcp: '$2.24', azure: '$2.10', saving: '48%' },
  { metric: 'Egress (per TB)', harchos: '$51', aws: '$90', gcp: '$85', azure: '$87', saving: '43%' },
  { metric: 'Storage (per TB/mo)', harchos: '$15', aws: '$23', gcp: '$20', azure: '$18', saving: '35%' },
  { metric: 'Carbon (gCO₂/kWh)', harchos: '48', aws: '420', gcp: '380', azure: '410', saving: '88%' },
  { metric: 'Renewable mix', harchos: '92%', aws: '65%', gcp: '78%', azure: '70%', saving: '—' },
  { metric: 'Sovereign data residency', harchos: 'Yes', aws: 'No', gcp: 'Limited', azure: 'No', saving: '—' },
];

/* ═══════════════════════════════════════════════════════════════
   DATA — FEATURE MATRIX (4 platform tiers × 4 categories)
   ═══════════════════════════════════════════════════════════════ */
const comparisonFeatures: {
  category: string;
  items: { label: string; values: (string | boolean)[] }[];
}[] = [
  {
    category: 'Compute',
    items: [
      { label: 'GPU hours / month', values: ['10', '1,000', '10,000+', 'Unlimited'] },
      { label: 'GPU types', values: ['A100', 'A100, L40S', 'H100, A100, L40S, H200', 'All + classified'] },
      { label: 'Carbon-aware scheduling', values: [true, true, true, true] },
      { label: 'Multi-hub routing', values: [false, true, true, true] },
      { label: 'Dedicated GPU clusters', values: [false, false, true, true] },
    ],
  },
  {
    category: 'Storage & Network',
    items: [
      { label: 'Storage', values: ['100 GB', '5 TB', '50 TB', 'Unlimited'] },
      { label: 'API calls / month', values: ['1M', '100M', 'Unlimited', 'Unlimited'] },
      { label: 'Egress bandwidth', values: ['100 GB', '2 TB', '20 TB', 'Unlimited'] },
      { label: 'Submarine cable priority', values: [false, false, true, true] },
    ],
  },
  {
    category: 'Platform',
    items: [
      { label: 'HarchOS Console', values: [true, true, true, true] },
      { label: 'Carbon metrics', values: [true, true, true, true] },
      { label: 'MLOps pipeline', values: [false, true, true, true] },
      { label: 'Vector database', values: [false, true, true, true] },
      { label: 'Custom compliance', values: [false, false, true, true] },
    ],
  },
  {
    category: 'Support & SLA',
    items: [
      { label: 'Support channel', values: ['Community', 'Priority email', 'Slack + phone', 'Dedicated SRE'] },
      { label: 'Response time', values: ['Best effort', '4 hours', '1 hour', '15 minutes'] },
      { label: 'SLA uptime', values: ['—', '99.9%', '99.95%', '99.99%'] },
      { label: 'On-premise deployment', values: [false, false, true, true] },
      { label: 'Air-gapped network', values: [false, false, false, true] },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   DATA — PRODUCT OVERVIEW CARDS
   ═══════════════════════════════════════════════════════════════ */
const productCards = [
  { icon: Cpu, name: 'HarchOS GPU', href: '/harchos', from: 'From $1.09/hr', desc: 'H100, H200, A100, L40S instances across 5 Moroccan hubs. Carbon-aware scheduling at no extra cost.' },
  { icon: Layers, name: 'HarchLink', href: '/harchlink', from: 'From $14/seat/mo', desc: 'Sovereign-encrypted messaging. Per-user tiers with federated identity and audit logs.' },
  { icon: Sun, name: 'Energy', href: '/subsidiaries/energy', from: 'From $0.028/kWh', desc: 'Solar PPA, wind PPA, hybrid baseload. 15-20 year concessions, 92% renewable mix.' },
  { icon: Droplets, name: 'Water', href: '/subsidiaries/water', from: 'From $0.34/m³', desc: 'Bulk supply, BOT desalination, BOO concessions. Up to 500,000 m³/day capacity.' },
  { icon: Building2, name: 'Cement', href: '/subsidiaries/cement', from: 'From $89/tonne', desc: 'Spot, annual, strategic alliance pricing. Low-carbon ECOCem blend available.' },
  { icon: Pickaxe, name: 'Mining', href: '/subsidiaries/mining', from: 'LME-indexed', desc: 'Copper, cobalt, phosphate offtake. LME + premium structure, sovereign stockpile option.' },
  { icon: Sprout, name: 'Agriculture', href: '/subsidiaries/agriculture', from: 'From $48/ha/yr', desc: 'Smallholder SaaS, commercial offtake, estate-managed farms, export-grade cold chain.' },
  { icon: Cog, name: 'Technology', href: '/subsidiaries/technology', from: 'From $4,900/mo', desc: 'HarchShield SIEM, MDR, satellite uplink, air-gapped sovereign deployment.' },
  { icon: Landmark, name: 'Finance', href: '/subsidiaries/finance', from: '0.75% advisory', desc: 'Project finance advisory, JV equity, lead arranger, blended-finance structuring.' },
];

/* ═══════════════════════════════════════════════════════════════
   DATA — EXTRA FAQS (beyond the i18n-backed q1-q5)
   ═══════════════════════════════════════════════════════════════ */
const extraFaqs = [
  {
    question: 'How does HarchOS compare to AWS, GCP, and Azure on price?',
    answer: 'HarchOS is 40-60% cheaper than equivalent GPU compute. H100 Enterprise at $1.54-2.20/hr vs AWS at roughly $3.40/hr. H200 at $2.10-3.00/hr vs hyperscalers at $4.50/hr. The cost advantage comes from Moroccan renewable energy at $0.02/kWh versus $0.08-0.12/kWh in Europe, our vertically integrated infrastructure ownership, and carbon-aware scheduling that shifts batch workloads to off-peak renewable windows for additional 15-25% savings.',
  },
  {
    question: 'Can I bundle multiple Harch products (GPU + energy + water) into a single contract?',
    answer: 'Yes. Our Strategic Accounts team structures multi-product Master Service Agreements that combine compute, energy, water, and physical infrastructure into a single invoice with blended pricing. Customers bundling 3+ products receive an additional 8-15% discount depending on contract length and volume commitment. This is how most sovereign and large-enterprise customers consume Harch.',
  },
  {
    question: 'What currencies do you invoice in, and how is VAT handled for African customers?',
    answer: 'We invoice in USD, EUR, MAD (Moroccan Dirham), XOF (West African CFA), and XAF (Central African CFA). For customers in Morocco, Senegal, Ivory Coast, and Ghana we charge local VAT and remit directly to tax authorities. For cross-border B2B within the African Continental Free Trade Area we apply zero-rated VAT with proper origin/destination documentation.',
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function PricingPageClient() {
  const t = useTranslations('pricing');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [linkBilling, setLinkBilling] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openExtraFaq, setOpenExtraFaq] = useState<number | null>(null);

  // ─── TCO Calculator state ─────────────────────────────────────
  const [gpuType, setGpuType] = useState<'H100' | 'H200' | 'A100' | 'L40S'>('H100');
  const [gpuCount, setGpuCount] = useState(8);
  const [hoursPerMonth, setHoursPerMonth] = useState(500);
  const [storageGb, setStorageGb] = useState(2000);
  const [egressGb, setEgressGb] = useState(500);
  const [annualCommit, setAnnualCommit] = useState(true);

  const gpuHourlyRate = useMemo(() => {
    const rates: Record<typeof gpuType, number> = {
      H100: annualCommit ? 1.54 : 2.20,
      H200: annualCommit ? 2.10 : 3.00,
      A100: annualCommit ? 1.26 : 1.80,
      L40S: annualCommit ? 0.84 : 1.20,
    };
    return rates[gpuType];
  }, [gpuType, annualCommit]);

  const monthlyTotal = useMemo(() => {
    const compute = gpuCount * hoursPerMonth * gpuHourlyRate;
    const storage = storageGb * 0.02;
    const egress = Math.max(0, egressGb - 100) * 0.05; // first 100 GB free
    return compute + storage + egress;
  }, [gpuCount, hoursPerMonth, gpuHourlyRate, storageGb, egressGb]);

  const co2Monthly = useMemo(() => {
    const kwh = gpuCount * hoursPerMonth * 0.7; // ~0.7 kW per GPU avg
    return (kwh * 48.2) / 1000; // kg CO2
  }, [gpuCount, hoursPerMonth]);

  const awsEquivalent = useMemo(() => monthlyTotal * 1.92, [monthlyTotal]); // ~92% more expensive
  const savings = awsEquivalent - monthlyTotal;

  return (
    <div style={monoOverride} className="bg-neutral-950 font-sans text-neutral-950">
      {/* ═══════════════════════════════════════════════════════════════
          §1 — HERO (DARK)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-28 md:py-44">
        {/* Subtle grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
          aria-hidden="true"
        />
        {/* Emerald glow */}
        <div
          className="pointer-events-none absolute -top-40 right-1/4 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[140px]"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <FadeIn>
            <HarchBadge label="HARCH CORP · PRICING" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-8 mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-500">
              {t('heroLabel')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <h1 className="max-w-4xl text-5xl font-extrabold leading-[0.95] tracking-tight text-white md:text-7xl lg:text-[88px]">
              One conglomerate.<br />
              <span className="text-emerald-500">Every</span> price, public.
            </h1>
          </FadeIn>
          <FadeIn delay={0.25}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-400 md:text-xl">
              {t('heroDescription')} Harch Corp publishes the full price list for every product line — from GPU compute at $1.09 per hour to cement at $89 per tonne and water at $0.34 per cubic metre. No hidden fees, no negotiated discounts, no &ldquo;contact us for details&rdquo;.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              This is the central pricing hub for all nine Harch product lines. Toggle between monthly and annual billing for HarchOS GPU and HarchLink, model your total cost of ownership with the interactive calculator, and compare every tier side by side in the feature matrix.
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <PrimaryCta href="/contact">{t('cta.primary')}</PrimaryCta>
              <SecondaryCta href="#calculator" dark>
                Open TCO Calculator
              </SecondaryCta>
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-800 md:grid-cols-4">
              {[
                { metric: '$1.09', label: 'GPU from /hr', sub: 'A100 annual commit' },
                { metric: '48.2', label: 'gCO₂/kWh avg', sub: '89% below hyperscalers' },
                { metric: '92%', label: 'renewable mix', sub: 'solar + wind portfolio' },
                { metric: '9', label: 'product lines', sub: 'one invoice, one MSA' },
              ].map((stat) => (
                <div key={stat.label} className="bg-neutral-950 p-6">
                  <p className="font-mono text-3xl font-bold text-emerald-500 md:text-4xl">{stat.metric}</p>
                  <p className="mt-2 text-[13px] font-semibold uppercase tracking-wider text-white">{stat.label}</p>
                  <p className="mt-1 text-[11px] text-neutral-500">{stat.sub}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          §2 — PRICING OVERVIEW (LIGHT) — all products in one view
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <SectionLabel light>Pricing Overview</SectionLabel>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-neutral-950 md:text-5xl">
              Nine product lines. One transparent price book.
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              Harch Corp operates as a vertically integrated African industrial conglomerate. Every product below is built, owned, and operated by Harch — from the renewable energy that powers our GPU hubs to the cement that anchors our solar farms. Pricing reflects true cost-plus margins, not market scarcity.
            </p>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              Click any card to jump to the detailed pricing table for that product, or follow the &ldquo;Explore product&rdquo; link to read the full subsidiary page. All prices are list prices — Strategic Accounts customers bundling three or more products receive an additional 8-15% blended discount.
            </p>
          </FadeIn>

          <StaggerContainer staggerDelay={0.06} className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-3">
            {productCards.map((p) => (
              <StaggerItem key={p.name}>
                <Link
                  href={p.href}
                  className="group flex h-full flex-col bg-white p-7 transition-colors hover:bg-neutral-50"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                      <p.icon size={20} strokeWidth={1.6} />
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-neutral-300 transition-all group-hover:translate-x-1 group-hover:text-emerald-600"
                    />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-neutral-950">{p.name}</h3>
                  <p className="mt-1 font-mono text-sm font-semibold text-emerald-600">{p.from}</p>
                  <p className="mt-3 text-[13px] leading-[1.7] text-neutral-500">{p.desc}</p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          §3 — HARCHOS GPU PRICING (DARK) — with monthly/annual toggle
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <SectionLabel>HarchOS GPU Pricing</SectionLabel>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white md:text-5xl">
              Per-GPU hourly rates. H100 from $1.54.
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              Prices vary by GPU type, hub location, and renewable mix. Carbon-aware scheduling automatically routes your workload to the lowest-cost green hub every three seconds. All instances are billed per second with a 60-second minimum — no rounding up, no idle fees, no surprise invoices.
            </p>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              Annual commit pricing unlocks a 30% discount versus monthly billing and includes reserved capacity guarantees. Spot instances are available at up to 70% discount for batch workloads. Reserved capacity contracts (1-3 years) layer an additional 10% on top of annual pricing.
            </p>
          </FadeIn>

          {/* Toggle */}
          <FadeIn delay={0.1}>
            <div className="mt-10 inline-flex items-center rounded-full border border-neutral-800 bg-neutral-900 p-1">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-full px-5 py-2 text-[12px] font-semibold uppercase tracking-wider transition-colors ${
                  billingCycle === 'monthly' ? 'bg-emerald-500 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`rounded-full px-5 py-2 text-[12px] font-semibold uppercase tracking-wider transition-colors ${
                  billingCycle === 'annual' ? 'bg-emerald-500 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Annual <span className="ml-1 text-emerald-500">-30%</span>
              </button>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="mt-8 overflow-hidden overflow-x-auto rounded-2xl border border-neutral-800">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900">
                    {['GPU', 'VRAM', 'Tier', 'Hub', 'Price / hr', 'Carbon', 'Renewable'].map((h) => (
                      <th
                        key={h}
                        className="p-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gpuInstances.map((gpu, i) => (
                    <tr
                      key={`${gpu.gpu}-${gpu.hub}`}
                      className={i % 2 === 0 ? 'bg-neutral-950' : 'bg-neutral-900/40'}
                    >
                      <td className="p-4 text-[13px] font-bold text-white">
                        <div className="flex items-center gap-2">
                          <Cpu size={14} className="text-emerald-500" />
                          {gpu.gpu}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[13px] text-neutral-300">{gpu.vram}</td>
                      <td className="p-4 text-[13px] text-neutral-400">{gpu.tier}</td>
                      <td className="p-4 text-[13px] text-neutral-400">{gpu.hub}</td>
                      <td className="p-4 font-mono text-[14px] font-bold text-emerald-500">
                        ${billingCycle === 'monthly' ? gpu.monthly.toFixed(2) : gpu.annual.toFixed(2)}
                      </td>
                      <td className="p-4 font-mono text-[13px] text-neutral-300">{gpu.carbon} gCO₂</td>
                      <td className="p-4 text-[13px] font-semibold text-emerald-500">{gpu.renewable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <p className="text-[12px] text-neutral-500">
                Prices in USD, billed per second with a 60-second minimum. Spot instances available at up to 70% discount. Reserved capacity (1-3 year commitment) offers 30-40% additional discount.
              </p>
              <ProductLink href="/harchos" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          §4 — HARCHLINK PRICING (LIGHT)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <SectionLabel light>HarchLink Pricing</SectionLabel>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-neutral-950 md:text-5xl">
              Per-seat messaging. Sovereign by default.
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              HarchLink is Harch Corp&rsquo;s sovereign-encrypted messaging and collaboration platform, hosted exclusively on HarchOS infrastructure inside Morocco. End-to-end encryption is on by default for every channel, direct message, and file — there is no plaintext mode, no backdoor, and no cross-border data transfer.
            </p>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              Pricing is per active seat per month, billed monthly or annually. Annual billing includes a 21-30% discount depending on tier. All tiers include federated identity (OIDC/SAML), audit logs, and integration with HarchShield SIEM for security teams.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-8 inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => setLinkBilling('monthly')}
                className={`rounded-full px-5 py-2 text-[12px] font-semibold uppercase tracking-wider transition-colors ${
                  linkBilling === 'monthly' ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:text-neutral-950'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setLinkBilling('annual')}
                className={`rounded-full px-5 py-2 text-[12px] font-semibold uppercase tracking-wider transition-colors ${
                  linkBilling === 'annual' ? 'bg-emerald-500 text-white' : 'text-neutral-500 hover:text-neutral-950'
                }`}
              >
                Annual <span className="ml-1 text-emerald-600">save up to 30%</span>
              </button>
            </div>
          </FadeIn>

          <StaggerContainer staggerDelay={0.08} className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {harchlinkTiers.map((tier) => (
              <StaggerItem key={tier.name}>
                <div
                  className={`flex h-full flex-col rounded-2xl border p-7 transition-colors ${
                    tier.name === 'Business'
                      ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-bold tracking-tight text-neutral-950">{tier.name}</h3>
                    {tier.name === 'Business' && (
                      <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-neutral-500">{tier.users} users</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-extrabold text-neutral-950">
                      ${linkBilling === 'monthly' ? tier.monthly : tier.annual}
                    </span>
                    <span className="text-[13px] text-neutral-500">/ seat / month</span>
                  </div>
                  <div className="my-5 h-px w-full bg-neutral-200" />
                  <ul className="mb-7 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px] text-neutral-700">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={`mt-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-[13px] font-semibold uppercase tracking-wider transition-colors ${
                      tier.name === 'Business'
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                        : 'border border-neutral-300 text-neutral-950 hover:bg-neutral-100'
                    }`}
                  >
                    Get Started <ArrowRight size={14} />
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn delay={0.2}>
            <div className="mt-8">
              <ProductLink href="/harchlink" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          §5 — ENERGY PRICING (DARK)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <SectionLabel>Energy Pricing</SectionLabel>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white md:text-5xl">
              Solar PPA from $0.028/kWh. Wind from $0.032.
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              Harch Energy operates 4.2 GW of installed renewable capacity across Morocco, Senegal, and Mauritania. Pricing is structured around three commercial models — spot EPC for short-term flexibility, long-term Power Purchase Agreements for utility-scale offtake, and hybrid baseload for round-the-clock industrial supply.
            </p>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              All prices include grid connection, metering, and renewable certificates. Harch owns and operates the generation assets end-to-end — there is no third-party developer markup. Sovereign government offtake contracts are negotiated separately under confidential terms with the Moroccan Ministry of Energy.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              {energyModels.map((m) => (
                <div
                  key={m.model}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 p-7 transition-colors hover:border-emerald-500/40"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                      <Sun size={18} strokeWidth={1.6} />
                    </div>
                    <h3 className="text-base font-bold text-white">{m.model}</h3>
                  </div>
                  <p className="mb-4 text-[13px] leading-[1.7] text-neutral-400">{m.desc}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-bold text-emerald-500">{m.price}</span>
                    <span className="text-[13px] text-neutral-400">{m.unit}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4 text-[11px] uppercase tracking-wider">
                    <span className="text-neutral-500">{m.term} term</span>
                    <span className="font-mono text-neutral-300">{m.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-8">
              <ProductLink href="/subsidiaries/energy" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          §6 — WATER PRICING (LIGHT)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <SectionLabel light>Water Pricing</SectionLabel>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-neutral-950 md:text-5xl">
              Desalination from $0.62/m³. Reuse from $0.34.
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              Harch Water operates municipal-scale desalination, bulk supply, and industrial reuse across the Atlantic coast of Morocco and the Senegalese coast. Three commercial structures are available — Bulk Supply for treated water delivered into the municipal grid, BOT (Build-Operate-Transfer) concessions for new plants, and BOO (Build-Own-Operate) where Harch retains long-term ownership of the asset.
            </p>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              Energy for desalination is supplied by Harch Energy at internal transfer pricing, which is why our $0.78/m³ BOT price is 35-40% below market benchmarks. All plants are ISO 24512 certified and operated by Harch personnel — no third-party O&amp;M subcontractors.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-12 overflow-hidden rounded-2xl border border-neutral-200">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    {['Model', 'Description', 'Price', 'Term', 'Note'].map((h) => (
                      <th key={h} className="p-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {waterModels.map((m, i) => (
                    <tr key={m.model} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}>
                      <td className="p-4 text-[13px] font-bold text-neutral-950">{m.model}</td>
                      <td className="p-4 text-[13px] text-neutral-600">{m.desc}</td>
                      <td className="p-4 font-mono text-[14px] font-bold text-emerald-600">
                        {m.price} <span className="text-[11px] font-normal text-neutral-500">{m.unit}</span>
                      </td>
                      <td className="p-4 text-[13px] text-neutral-500">{m.term}</td>
                      <td className="p-4 font-mono text-[12px] text-neutral-500">{m.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-8">
              <ProductLink href="/subsidiaries/water" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          §7 — CEMENT PRICING (DARK)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <SectionLabel>Cement Pricing</SectionLabel>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white md:text-5xl">
              Spot from $112/t. Strategic alliance from $89/t.
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              Harch Cement operates integrated clinker-to-cement plants in Safi and Tanger with combined annual capacity of 8.4 million tonnes. Pricing is structured around three commercial models — Spot for day-ahead truck delivery, Annual contracts for 12-month volume commitments with monthly call-offs, and Strategic Alliances for 3-year offtake with rail-priority dispatch.
            </p>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              Our low-carbon ECOCem blend uses calcined clay to replace 40% of clinker, reducing embodied CO₂ by 40% versus ordinary Portland cement. ECOCem qualifies for LEED and BREEAM credits and is mandated on all Harch-owned construction projects. Strategic Alliance pricing requires a minimum 250,000 tonnes per year offtake commitment.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              {cementModels.map((m) => (
                <div
                  key={m.model}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 p-7 transition-colors hover:border-emerald-500/40"
                >
                  <h3 className="text-base font-bold text-white">{m.model}</h3>
                  <p className="mt-2 text-[13px] leading-[1.7] text-neutral-400">{m.desc}</p>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-bold text-emerald-500">{m.price}</span>
                    <span className="text-[13px] text-neutral-400">{m.unit}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4 text-[11px] uppercase tracking-wider">
                    <span className="text-neutral-500">{m.term} term</span>
                    <span className="font-mono text-neutral-300">{m.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-8">
              <ProductLink href="/subsidiaries/cement" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          §8 — MINING OFFTAKE (LIGHT)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <SectionLabel light>Mining Offtake</SectionLabel>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-neutral-950 md:text-5xl">
              LME-indexed. Sovereign stockpile option.
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              Harch Mining operates copper, cobalt, and phosphate assets across the Democratic Republic of Congo, Morocco, and Mauritania. Pricing follows London Metal Exchange indexation with negotiated premiums for logistics, quality assurance, and delivery terms. All offtake contracts include provenance documentation and ESG chain-of-custody certification.
            </p>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              The Strategic Reserve option is available exclusively to sovereign government buyers and is priced on a fixed basis (not LME-indexed) for budget stability across 10-year planning horizons. Reserve contracts are confidential and require government-to-government clearance via the Moroccan Ministry of Mines.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-12 overflow-hidden rounded-2xl border border-neutral-200">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    {['Commodity', 'Description', 'Price', 'Term', 'Note'].map((h) => (
                      <th key={h} className="p-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {miningModels.map((m, i) => (
                    <tr key={m.model} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}>
                      <td className="p-4 text-[13px] font-bold text-neutral-950">{m.model}</td>
                      <td className="p-4 text-[13px] text-neutral-600">{m.desc}</td>
                      <td className="p-4 font-mono text-[14px] font-bold text-emerald-600">
                        {m.price} <span className="text-[11px] font-normal text-neutral-500">{m.unit}</span>
                      </td>
                      <td className="p-4 text-[13px] text-neutral-500">{m.term}</td>
                      <td className="p-4 font-mono text-[12px] text-neutral-500">{m.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-8">
              <ProductLink href="/subsidiaries/mining" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          §9 — AGRICULTURE PRICING (DARK)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <SectionLabel>Agriculture Pricing</SectionLabel>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white md:text-5xl">
              From $48/hectare SaaS to 30% revenue-share estates.
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              Harch Agri operates across the full value chain — from smallholder SaaS subscriptions that bundle Apollo AI advisory with IoT soil sensors, to commercial offtake agreements with guaranteed CBOT-indexed floor pricing, to fully managed estate farms where Harch operates the land and takes 30% of revenue.
            </p>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              Export-grade cold chain logistics are available à la carte at $0.18/kg for refrigerated transport from Casablanca to Rotterdam, including all MAFF certification and phytosanitary documentation. Minimum 5-hectare subscription for the Smallholder SaaS tier.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              {agriModels.map((m) => (
                <div
                  key={m.model}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 p-7 transition-colors hover:border-emerald-500/40"
                >
                  <h3 className="text-base font-bold text-white">{m.model}</h3>
                  <p className="mt-2 text-[13px] leading-[1.7] text-neutral-400">{m.desc}</p>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-bold text-emerald-500">{m.price}</span>
                    <span className="text-[13px] text-neutral-400">{m.unit}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4 text-[11px] uppercase tracking-wider">
                    <span className="text-neutral-500">{m.term} term</span>
                    <span className="font-mono text-neutral-300">{m.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-8">
              <ProductLink href="/subsidiaries/agriculture" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          §10 — TECHNOLOGY PRICING (LIGHT)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <SectionLabel light>Technology Pricing</SectionLabel>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-neutral-950 md:text-5xl">
              HarchShield SIEM from $4,900/month.
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              Harch Technology sells the HarchShield security platform in three commercial tiers — Essential for SMEs securing a single site, Enterprise for multi-site deployments with managed detection and response (MDR), and Sovereign for ministries, defense, and critical infrastructure requiring air-gapped deployment with dedicated cleared SREs.
            </p>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              All tiers include HarchShield SIEM, EDR core, and quarterly threat reports. Enterprise adds 24/7 SOC with MDR, satellite uplink for resilient comms, custom playbooks, and a 99.95% SLA. Sovereign adds air-gapped deployment, dedicated personnel with DSP-5 clearance, and a 99.99% SLA on isolated infrastructure.
            </p>
          </FadeIn>

          <StaggerContainer staggerDelay={0.1} className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {techTiers.map((tier) => (
              <StaggerItem key={tier.name}>
                <div
                  className={`flex h-full flex-col rounded-2xl border p-7 transition-colors ${
                    tier.highlight
                      ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-bold tracking-tight text-neutral-950">{tier.name}</h3>
                    {tier.highlight && (
                      <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="mb-2 flex items-baseline gap-1">
                    <span className="font-mono text-2xl font-extrabold text-neutral-950">{tier.price}</span>
                    <span className="text-[12px] text-neutral-500">{tier.unit}</span>
                  </div>
                  <p className="mt-3 text-[13px] leading-[1.7] text-neutral-500">{tier.desc}</p>
                  <div className="my-5 h-px w-full bg-neutral-200" />
                  <ul className="mb-7 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px] text-neutral-700">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={`mt-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-[13px] font-semibold uppercase tracking-wider transition-colors ${
                      tier.highlight
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                        : 'border border-neutral-300 text-neutral-950 hover:bg-neutral-100'
                    }`}
                  >
                    {tier.name === 'Sovereign' ? 'Request Briefing' : 'Get Started'} <ArrowRight size={14} />
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn delay={0.2}>
            <div className="mt-8">
              <ProductLink href="/subsidiaries/technology" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          §11 — FINANCE FEES (DARK)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <SectionLabel>Finance Fees</SectionLabel>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white md:text-5xl">
              Advisory from 0.75%. Lead arranger 125 bps.
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              Harch Finance provides project finance advisory, JV equity participation, lead arranger services, and blended-finance structuring for renewable energy, water, and infrastructure projects across Africa. Ticket sizes range from $50 million to $2 billion with deal horizons of 5-25 years.
            </p>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              JV equity participation involves Harch co-investing 15-35% of equity in special purpose vehicles alongside project sponsors, with a board seat and full minority-investor protections. Lead arranger fees of 125 basis points cover syndication of senior debt facilities from $100M to $1.5B plus a 50 bps ongoing agency fee.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              {financeFees.map((m) => (
                <div
                  key={m.model}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 p-7 transition-colors hover:border-emerald-500/40"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                      <Landmark size={18} strokeWidth={1.6} />
                    </div>
                    <h3 className="text-base font-bold text-white">{m.model}</h3>
                  </div>
                  <p className="mb-4 text-[13px] leading-[1.7] text-neutral-400">{m.desc}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-bold text-emerald-500">{m.price}</span>
                    <span className="text-[13px] text-neutral-400">{m.unit}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4 text-[11px] uppercase tracking-wider">
                    <span className="text-neutral-500">{m.term} term</span>
                    <span className="font-mono text-neutral-300">{m.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-8">
              <ProductLink href="/subsidiaries/finance" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          §12 — PLATFORM TIERS (LIGHT) — 4 tiers with monthly/annual toggle
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <SectionLabel light>HarchOS Platform Tiers</SectionLabel>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-neutral-950 md:text-5xl">
              From free exploration to air-gapped sovereign.
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              Four tiers cover every use case — Starter is free forever for prototyping, Professional at $499/month (or $399/month annual) for teams scaling AI workloads, Enterprise for dedicated capacity with custom SLAs, and Sovereign for government and defense workloads requiring air-gapped deployment with cleared personnel.
            </p>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              Annual billing unlocks a 20% discount on Professional. Enterprise and Sovereign require annual commitments by design — there is no monthly option for dedicated capacity tiers. All tiers include carbon-aware scheduling at no additional cost.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-8 inline-flex items-center rounded-full border border-neutral-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-full px-5 py-2 text-[12px] font-semibold uppercase tracking-wider transition-colors ${
                  billingCycle === 'monthly' ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:text-neutral-950'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`rounded-full px-5 py-2 text-[12px] font-semibold uppercase tracking-wider transition-colors ${
                  billingCycle === 'annual' ? 'bg-emerald-500 text-white' : 'text-neutral-500 hover:text-neutral-950'
                }`}
              >
                Annual <span className="ml-1 text-emerald-600">-20%</span>
              </button>
            </div>
          </FadeIn>

          <StaggerContainer staggerDelay={0.08} className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {platformTiers.map((tier) => (
              <StaggerItem key={tier.name}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl border p-7 transition-colors ${
                    tier.highlight
                      ? 'border-emerald-500 bg-white ring-1 ring-emerald-500/20'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  {tier.badge && (
                    <span
                      className={`absolute -top-3 left-7 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        tier.badge === 'Most Popular' ? 'bg-emerald-500 text-white' : 'bg-neutral-950 text-white'
                      }`}
                    >
                      {tier.badge}
                    </span>
                  )}
                  <h3 className="text-lg font-bold tracking-tight text-neutral-950">{tier.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-extrabold text-neutral-950">
                      {billingCycle === 'monthly' ? tier.monthlyLabel : tier.annualLabel}
                    </span>
                    <span className="text-[12px] text-neutral-500">{tier.detail}</span>
                  </div>
                  <p className="mt-3 text-[13px] leading-[1.7] text-neutral-500">{tier.description}</p>
                  <div className="my-5 h-px w-full bg-neutral-200" />
                  <Link
                    href="/contact"
                    className={`mt-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-[13px] font-semibold uppercase tracking-wider transition-colors ${
                      tier.highlight
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                        : 'border border-neutral-300 text-neutral-950 hover:bg-neutral-100'
                    }`}
                  >
                    {tier.cta} <ArrowRight size={14} />
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          §13 — ADD-ONS (DARK)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <SectionLabel>Add-ons &amp; Storage</SectionLabel>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white md:text-5xl">
              Storage, bandwidth, support. Priced à la carte.
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              Beyond GPU compute and platform tiers — everything else you need, priced transparently. No bundled fees, no minimum commitments on Starter and Professional tiers. Block and object storage are NVMe-backed with 99.999% durability and per-gigabyte carbon tracking.
            </p>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              Egress bandwidth is $0.05/GB after the first 100 GB, which is free on every tier. Submarine cable priority routing is included on Enterprise and above. Priority Support is $500/month for 24/7 Slack access and 1-hour response times.
            </p>
          </FadeIn>

          <StaggerContainer staggerDelay={0.08} className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {addons.map((addon) => (
              <StaggerItem key={addon.name}>
                <div className="flex h-full flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-emerald-500/40">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                      <addon.icon size={18} strokeWidth={1.6} />
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-bold text-white">{addon.price}</p>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500">{addon.unit}</p>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white">{addon.name}</h3>
                  <p className="mt-2 text-[13px] leading-[1.7] text-neutral-400">{addon.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          §14 — INTERACTIVE TCO CALCULATOR (LIGHT)
          ═══════════════════════════════════════════════════════════════ */}
      <section id="calculator" className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <SectionLabel light>Total Cost of Ownership</SectionLabel>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-neutral-950 md:text-5xl">
              Model your monthly bill in real time.
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              Adjust GPU type, instance count, hours per month, storage, and egress to see your live monthly cost. Toggle annual commitment to apply the 30% reserved-capacity discount. The calculator compares your HarchOS estimate against the equivalent AWS on-demand price in real time, including estimated carbon footprint.
            </p>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-500">
              Estimates are based on HarchOS list prices and published AWS on-demand rates as of 2025. Actual costs may vary with workload patterns, spot market volatility, and negotiated enterprise discounts. Storage and egress costs include the first 100 GB of egress free per month.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 lg:grid-cols-5">
              {/* Inputs */}
              <div className="bg-white p-7 lg:col-span-3">
                <div className="mb-6 flex items-center gap-3">
                  <CalcIcon size={20} className="text-emerald-600" />
                  <h3 className="text-base font-bold tracking-tight text-neutral-950">Workload Inputs</h3>
                </div>

                {/* GPU type */}
                <div className="mb-7">
                  <label className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    GPU Type
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(['H100', 'H200', 'A100', 'L40S'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGpuType(g)}
                        className={`rounded-lg border px-4 py-3 text-[13px] font-bold transition-colors ${
                          gpuType === g
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-600'
                            : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* GPU count */}
                <div className="mb-7">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                      Number of GPUs
                    </label>
                    <span className="font-mono text-sm font-bold text-neutral-950">{gpuCount}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={256}
                    value={gpuCount}
                    onChange={(e) => setGpuCount(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-emerald-500"
                    aria-label="Number of GPUs"
                  />
                  <div className="mt-1 flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>1</span>
                    <span>256</span>
                  </div>
                </div>

                {/* Hours per month */}
                <div className="mb-7">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                      Hours per month
                    </label>
                    <span className="font-mono text-sm font-bold text-neutral-950">{hoursPerMonth} h</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={730}
                    value={hoursPerMonth}
                    onChange={(e) => setHoursPerMonth(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-emerald-500"
                    aria-label="Hours per month"
                  />
                  <div className="mt-1 flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>1 h</span>
                    <span>730 h (24/7)</span>
                  </div>
                </div>

                {/* Storage */}
                <div className="mb-7">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                      Storage (GB)
                    </label>
                    <span className="font-mono text-sm font-bold text-neutral-950">{storageGb.toLocaleString()} GB</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={50000}
                    step={10}
                    value={storageGb}
                    onChange={(e) => setStorageGb(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-emerald-500"
                    aria-label="Storage in GB"
                  />
                  <div className="mt-1 flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>10 GB</span>
                    <span>50 TB</span>
                  </div>
                </div>

                {/* Egress */}
                <div className="mb-7">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                      Egress bandwidth (GB)
                    </label>
                    <span className="font-mono text-sm font-bold text-neutral-950">{egressGb.toLocaleString()} GB</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    step={10}
                    value={egressGb}
                    onChange={(e) => setEgressGb(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-emerald-500"
                    aria-label="Egress bandwidth in GB"
                  />
                  <div className="mt-1 flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>0 GB</span>
                    <span>10 TB</span>
                  </div>
                </div>

                {/* Annual commit toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setAnnualCommit(!annualCommit)}
                    className="flex w-full items-center justify-between rounded-xl border border-neutral-200 p-4 text-left transition-colors hover:border-neutral-300"
                  >
                    <div>
                      <p className="text-[13px] font-bold text-neutral-950">Annual commitment (-30%)</p>
                      <p className="mt-1 text-[12px] text-neutral-500">Reserved capacity for 1-3 years unlocks discount.</p>
                    </div>
                    <span
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                        annualCommit ? 'bg-emerald-500' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                          annualCommit ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="flex flex-col bg-neutral-950 p-7 text-white lg:col-span-2">
                <div className="mb-6 flex items-center gap-3">
                  <TrendingDown size={20} className="text-emerald-500" />
                  <h3 className="text-base font-bold tracking-tight text-white">Live Estimate</h3>
                </div>

                <div className="mb-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                    Estimated monthly cost
                  </p>
                  <p className="mt-2 font-mono text-5xl font-extrabold text-emerald-500">
                    ${monthlyTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="mt-1 text-[12px] text-neutral-500">USD / month</p>
                </div>

                <div className="space-y-4 border-t border-neutral-800 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-neutral-400">GPU rate ({gpuType})</span>
                    <span className="font-mono text-[13px] font-semibold text-white">
                      ${gpuHourlyRate.toFixed(2)}/hr
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-neutral-400">Compute subtotal</span>
                    <span className="font-mono text-[13px] font-semibold text-white">
                      ${(gpuCount * hoursPerMonth * gpuHourlyRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-neutral-400">Storage</span>
                    <span className="font-mono text-[13px] font-semibold text-white">
                      ${(storageGb * 0.02).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-neutral-400">Egress (first 100 GB free)</span>
                    <span className="font-mono text-[13px] font-semibold text-white">
                      ${(Math.max(0, egressGb - 100) * 0.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3 border-t border-neutral-800 pt-5">
                  <div className="flex items-center justify-between rounded-lg bg-neutral-900 p-3">
                    <div className="flex items-center gap-2">
                      <Leaf size={14} className="text-emerald-500" />
                      <span className="text-[12px] text-neutral-300">Est. CO₂ / month</span>
                    </div>
                    <span className="font-mono text-[13px] font-bold text-emerald-500">
                      {co2Monthly.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-neutral-900 p-3">
                    <div className="flex items-center gap-2">
                      <Globe2 size={14} className="text-neutral-400" />
                      <span className="text-[12px] text-neutral-300">AWS equivalent</span>
                    </div>
                    <span className="font-mono text-[13px] font-bold text-neutral-300">
                      ${awsEquivalent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 p-3 ring-1 ring-emerald-500/30">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-500" />
                      <span className="text-[12px] font-semibold text-emerald-500">Your savings</span>
                    </div>
                    <span className="font-mono text-[15px] font-bold text-emerald-500">
                      ${savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="mt-auto inline-flex items-center justify-center gap-2 bg-emerald-500 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400"
                >
                  Request this quote <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-6 text-[12px] text-neutral-500">
              Estimates based on HarchOS list prices versus AWS on-demand rates. Actual pricing varies with workload patterns, spot market, and negotiated enterprise discounts. First 100 GB of egress free per month on all tiers.
            </p>
          </FadeIn>
        </div>
      </section>

      <SectionDivider className="mx-auto max-w-7xl" />

      {/* ═══════════════════════════════════════════════════════════════
          §15 — COMPARISON TABLES (DARK) — feature matrix + cloud comparison
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <FadeIn>
            <SectionLabel>Compare HarchOS</SectionLabel>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white md:text-5xl">
              HarchOS vs AWS, GCP, Azure.
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              The same GPU, the same workload, the same month. HarchOS is 35-55% cheaper on compute, 35-45% cheaper on storage, and 88% lower carbon. Renewable mix is 92% versus 65-78% at hyperscalers. Sovereign data residency — your data never leaves Morocco — is exclusive to HarchOS.
            </p>
            <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              Carbon footprint is calculated using published grid intensity factors for each provider&rsquo;s primary regions. HarchOS advantage comes from Moroccan renewable energy at $0.02/kWh versus $0.08-0.12/kWh in Europe and full vertical integration of generation, networking, and compute.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mt-12 overflow-hidden overflow-x-auto rounded-2xl border border-neutral-800">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900">
                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400">Metric</th>
                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-500">HarchOS</th>
                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400">AWS</th>
                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400">GCP</th>
                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400">Azure</th>
                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-500">Harch saving</th>
                  </tr>
                </thead>
                <tbody>
                  {cloudComparison.map((row, i) => (
                    <tr key={row.metric} className={i % 2 === 0 ? 'bg-neutral-950' : 'bg-neutral-900/40'}>
                      <td className="p-4 text-[13px] font-semibold text-white">{row.metric}</td>
                      <td className="p-4 font-mono text-[13px] font-bold text-emerald-500">{row.harchos}</td>
                      <td className="p-4 font-mono text-[13px] text-neutral-300">{row.aws}</td>
                      <td className="p-4 font-mono text-[13px] text-neutral-300">{row.gcp}</td>
                      <td className="p-4 font-mono text-[13px] text-neutral-300">{row.azure}</td>
                      <td className="p-4 font-mono text-[13px] font-bold text-emerald-500">{row.saving}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          {/* Feature matrix — 4 platform tiers */}
          <FadeIn delay={0.15}>
            <div className="mt-16 mb-6">
              <h3 className="text-2xl font-bold tracking-tight text-white">Full Feature Matrix</h3>
              <p className="mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
                Every feature, every tier, side by side. No asterisks, no fine print, no &ldquo;contact us for details&rdquo;. Professional is the most popular tier for teams scaling production AI workloads — Enterprise adds dedicated capacity, Sovereign adds air-gapped deployment for government and defense.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="overflow-hidden overflow-x-auto rounded-2xl border border-neutral-800">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900">
                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400">Feature</th>
                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400">Starter</th>
                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-500">Professional</th>
                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400">Enterprise</th>
                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400">Sovereign</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((category) => (
                    <FragmentRow key={category.category} category={category} />
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          §16 — FAQ (LIGHT)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <FadeIn>
            <SectionLabel light>{t('faq.label') || 'FAQ'}</SectionLabel>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-950 md:text-5xl">
              {t('faq.title')}
            </h2>
            <p className="mt-6 text-[15px] leading-[1.7] text-neutral-500">
              Everything you need to know about billing, tiers, and what you actually pay. From payment methods and currency support to sovereign data residency and how carbon-aware scheduling reduces both your bill and your footprint.
            </p>
            <p className="mt-3 text-[15px] leading-[1.7] text-neutral-500">
              If your question isn&rsquo;t answered here, our Strategic Accounts team is available 24/7 to walk you through pricing for any combination of Harch products. Use the contact form for written inquiries or the calendar link to schedule a call.
            </p>
          </FadeIn>

          {/* i18n-backed FAQs (q1-q5) */}
          <div className="mt-12 space-y-3">
            {['q1', 'q2', 'q3', 'q4', 'q5'].map((key, i) => {
              const q = t(`faq.items.${key}.question`);
              const a = t(`faq.items.${key}.answer`);
              const isOpen = openFaq === i;
              return (
                <FadeIn key={key} delay={i * 0.04}>
                  <div
                    className={`overflow-hidden rounded-2xl border transition-colors ${
                      isOpen ? 'border-emerald-500/40 bg-emerald-50/30' : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="flex w-full items-center justify-between p-5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="pr-4 text-[14px] font-bold text-neutral-950">{q}</span>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-emerald-600 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5">
                        <div className="mb-4 h-px w-10 bg-emerald-500" />
                        <p className="text-[14px] leading-[1.7] text-neutral-600">{a}</p>
                      </div>
                    )}
                  </div>
                </FadeIn>
              );
            })}

            {/* Extra inline FAQs */}
            {extraFaqs.map((faq, i) => {
              const isOpen = openExtraFaq === i;
              return (
                <FadeIn key={faq.question} delay={(i + 5) * 0.04}>
                  <div
                    className={`overflow-hidden rounded-2xl border transition-colors ${
                      isOpen ? 'border-emerald-500/40 bg-emerald-50/30' : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenExtraFaq(isOpen ? null : i)}
                      className="flex w-full items-center justify-between p-5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="pr-4 text-[14px] font-bold text-neutral-950">{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-emerald-600 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5">
                        <div className="mb-4 h-px w-10 bg-emerald-500" />
                        <p className="text-[14px] leading-[1.7] text-neutral-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          §17 — CUSTOM QUOTE CTA (DARK) — final CTA + Back to Harch Corp
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-28 md:py-36">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px]"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <FadeIn>
            <div className="mb-8 flex justify-center">
              <HarchBadge label="HARCH CORP · PRICING" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Need a custom quote?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              For multi-product bundles, sovereign government contracts, or any combination of GPU + energy + water + cement + agriculture + technology + finance — our Strategic Accounts team will structure a single Master Service Agreement with blended pricing across all nine Harch product lines.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-[1.7] text-neutral-400">
              Most enterprise quotes are turned around in 48 hours. Government and defense procurement follows the standard RFP cycle. Use the contact form to upload your statement of work, or schedule a call directly with a Strategic Accounts director.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <PrimaryCta href="/contact">{t('cta.primary')}</PrimaryCta>
              <SecondaryCta href="/contact" dark>
                {t('cta.contactSales')}
              </SecondaryCta>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-16 flex flex-col items-center gap-4 border-t border-neutral-800 pt-10">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
                <Lock size={12} className="text-emerald-500" />
                <span>Sovereign. Transparent. Renewable.</span>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-white"
              >
                <ArrowLeft size={14} />
                Back to Harch Corp
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Feature matrix row helper — uses Fragment for category grouping.
   ═══════════════════════════════════════════════════════════════ */
function FragmentRow({
  category,
}: {
  category: { category: string; items: { label: string; values: (string | boolean)[] }[] };
}) {
  return (
    <Fragment>
      <tr className="border-b border-neutral-800 bg-neutral-900/60">
        <td colSpan={5} className="p-3 px-4 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-500">
          {category.category}
        </td>
      </tr>
      {category.items.map((item) => (
        <tr key={item.label} className="border-b border-neutral-800/60">
          <td className="p-4 text-[13px] font-semibold text-neutral-200">{item.label}</td>
          {item.values.map((val, i) => (
            <td key={i} className="p-4 text-[13px]">
              {typeof val === 'boolean' ? (
                val ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <X size={16} className="text-neutral-600" />
                )
              ) : (
                <span className={i === 1 ? 'font-mono font-semibold text-emerald-500' : 'font-mono text-neutral-400'}>
                  {val}
                </span>
              )}
            </td>
          ))}
        </tr>
      ))}
    </Fragment>
  );
}
