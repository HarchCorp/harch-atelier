'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Shield,
  Cpu,
  Globe,
  Activity,
  ChevronDown,
  Terminal as TerminalIcon,
  FileText,
  Github,
  Zap,
  BookOpen,
  Box,
  Leaf,
  Sun,
  Wind,
  Battery,
  Lock,
  Scale,
  GitBranch,
  Quote,
  MapPin,
  Clock,
  TrendingDown,
  Workflow,
  AlertTriangle,
  Radio,
  CircuitBoard,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   HARCH · HARCHOS — Sovereign GPU Cloud
   Intelligence accent: violet-500 · Primary CTA: emerald-500 (Harch green)
   Inter for type · Space Mono for data · Neutral palette
   19 unique sections · Wave dividers · Diverse real photos
   ═══════════════════════════════════════════════════════════════ */

const ACCENT = '#8b5cf6'; // violet-500

/* ── Section label helper — Harch brand pattern ────────────────── */
function SectionLabel({ n, label, dark = false }: { n?: string; label: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
      {n && <span className={dark ? 'text-neutral-600' : 'text-neutral-400'}>{`// ${n}`}</span>}
      <span className="h-px w-8 bg-violet-500/60" />
      <span className="text-violet-500">{label}</span>
    </div>
  );
}

/* ── Terminal cursor blink — HarchOS subsidiary unique motif ──── */
function TerminalCursor() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.55 }}
      transition={{ duration: 1, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none absolute left-6 bottom-24 md:left-12 md:bottom-32 flex items-center gap-2"
      aria-hidden="true"
    >
      <span className="font-mono text-[11px] tracking-wide text-violet-300/45 select-none">
        harchos@gpu-cluster-01:~$
      </span>
      <span
        className="harchos-cursor inline-block h-[14px] w-[7px] bg-violet-400/70"
        style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.6)' }}
      />
    </motion.div>
  );
}

/* ── Subtle chip decoration ────────────────────────────────────── */
function ChipAccent() {
  return (
    <svg className="pointer-events-none absolute right-6 top-6 h-12 w-12 text-violet-500/10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 2h10a1 1 0 0 1 1 1v3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3V3a1 1 0 0 1 1-1zm0 6v8h10V8H7z" />
    </svg>
  );
}

/* ── Bilingual content (GPU rows, FAQ items, comparison, etc.) ── */
type Bilingual = { en: string; fr: string };
type GpuRow = { gpu: Bilingual; mem: Bilingual; ondemand: string; spot: string; best: Bilingual; popular?: boolean };

const GPU_ROWS: GpuRow[] = [
  { gpu: { en: 'H100 SXM5', fr: 'H100 SXM5' }, mem: { en: '80 GB HBM3', fr: '80 Go HBM3' }, ondemand: '$1.80/hr', spot: '$0.72/hr', best: { en: 'LLM training', fr: 'Entraînement LLM' }, popular: true },
  { gpu: { en: 'H200 SXM5', fr: 'H200 SXM5' }, mem: { en: '141 GB HBM3e', fr: '141 Go HBM3e' }, ondemand: '$2.40/hr', spot: '$0.96/hr', best: { en: 'Long-context inference', fr: 'Inférence contexte long' } },
  { gpu: { en: 'A100 80GB', fr: 'A100 80 Go' }, mem: { en: '80 GB HBM2e', fr: '80 Go HBM2e' }, ondemand: '$1.10/hr', spot: '$0.44/hr', best: { en: 'Fine-tuning', fr: 'Fine-tuning' } },
  { gpu: { en: 'L40S', fr: 'L40S' }, mem: { en: '48 GB GDDR6', fr: '48 Go GDDR6' }, ondemand: '$0.65/hr', spot: '$0.26/hr', best: { en: 'Inference edge', fr: 'Inférence edge' } },
];

const GPU_CALC_OPTIONS = [
  { key: 'h100', name: 'H100 SXM5', priceHr: 1.8, mem: '80 GB' },
  { key: 'h200', name: 'H200 SXM5', priceHr: 2.4, mem: '141 GB' },
  { key: 'a100', name: 'A100 80GB', priceHr: 1.1, mem: '80 GB' },
  { key: 'l40s', name: 'L40S', priceHr: 0.65, mem: '48 GB' },
];

const AWS_MULTIPLIER = 4.95; // AWS p5.48xlarge ~$98/hr for 8 H100s, vs HarchOS $14.40/hr

type ComparisonRow = { label: Bilingual; harchos: boolean; aws: boolean; gcp: boolean; azure: boolean };

const COMPARISON_ROWS: ComparisonRow[] = [
  { label: { en: 'Sovereignty enforced at infra level', fr: 'Souveraineté imposée à l’infra' }, harchos: true, aws: false, gcp: false, azure: false },
  { label: { en: 'No US CLOUD Act exposure', fr: 'Pas d’exposition CLOUD Act US' }, harchos: true, aws: false, gcp: false, azure: false },
  { label: { en: 'Moroccan Law 09-08 compliant', fr: 'Conforme Loi 09-08 marocaine' }, harchos: true, aws: false, gcp: false, azure: false },
  { label: { en: 'Carbon-aware scheduler', fr: 'Scheduler carbone-aware' }, harchos: true, aws: false, gcp: false, azure: false },
  { label: { en: 'Per-job carbon footprint', fr: 'Empreinte carbone par job' }, harchos: true, aws: false, gcp: false, azure: false },
  { label: { en: 'Open-source SDKs + CLI', fr: 'SDK + CLI open-source' }, harchos: true, aws: false, gcp: false, azure: false },
  { label: { en: 'Zero egress between African regions', fr: 'Zéro egress entre régions africaines' }, harchos: true, aws: false, gcp: false, azure: false },
  { label: { en: 'Terraform provider with sovereignty HCL', fr: 'Provider Terraform avec HCL souveraineté' }, harchos: true, aws: false, gcp: false, azure: false },
];

type SovereigntyCard = { title: Bilingual; desc: Bilingual; Icon: typeof Scale };

const SOVEREIGNTY_CARDS: SovereigntyCard[] = [
  { title: { en: 'Law 09-08', fr: 'Loi 09-08' }, desc: { en: 'Full compliance with Morocco’s data protection law. CNDP registered. Personal data never leaves the kingdom.', fr: 'Conformité totale avec la loi marocaine de protection des données. Enregistré CNDP. Données personnelles jamais hors royaume.' }, Icon: Scale },
  { title: { en: 'No CLOUD Act', fr: 'Pas de CLOUD Act' }, desc: { en: 'No US corporate presence. We do not respond to US extraterritorial data requests. Sovereign by jurisdiction.', fr: 'Aucune présence sociétaire US. Nous ne répondons pas aux requêtes extraterritoriales US. Souverain par juridiction.' }, Icon: GitBranch },
  { title: { en: 'Stays in Africa', fr: 'Reste en Afrique' }, desc: { en: 'Workloads, weights, datasets, logs — everything stays on African soil. Replication is continental, never intercontinental.', fr: 'Workloads, poids, datasets, logs — tout reste sur sol africain. Réplication continentale, jamais intercontinentale.' }, Icon: Globe },
];

type CarbonSource = { name: Bilingual; share: number };

const CARBON_SOURCES: CarbonSource[] = [
  { name: { en: 'Solar CSP (Noor)', fr: 'Solaire CSP (Noor)' }, share: 47 },
  { name: { en: 'Wind (Atlantic)', fr: 'Éolien (Atlantique)' }, share: 32 },
  { name: { en: 'Grid (purchased RECs)', fr: 'Réseau (REC achetés)' }, share: 18 },
  { name: { en: 'Battery storage', fr: 'Stockage batterie' }, share: 3 },
];

type ModelCard = { name: string; params: string; langs: Bilingual; license: string; desc: Bilingual };

const MODEL_CARDS: ModelCard[] = [
  { name: 'DarijaBERT-13B', params: '13B', langs: { en: 'Darija · Arabic · French', fr: 'Darija · Arabe · Français' }, license: 'Apache 2.0', desc: { en: 'Moroccan dialect LLM trained on HarchOS. Best for North African NLP.', fr: 'LLM dialecte marocain entraîné sur HarchOS. Idéal pour NLP nord-africain.' } },
  { name: 'Sahel-7B', params: '7B', langs: { en: 'Wolof · Bambara · Fulfulde', fr: 'Wolof · Bambara · Fulfulde' }, license: 'MIT', desc: { en: 'Sahel-region LLM covering 12 West African languages.', fr: 'LLM Sahel couvrant 12 langues ouest-africaines.' } },
  { name: 'Swahili-70B', params: '70B', langs: { en: 'Swahili · English · Kinyarwanda', fr: 'Swahili · Anglais · Kinyarwanda' }, license: 'Apache 2.0', desc: { en: 'East African flagship model. Sub-50ms inference from Abidjan hub.', fr: 'Modèle phare est-africain. Inférence sub-50ms depuis hub Abidjan.' } },
  { name: 'Amazigh-8B', params: '8B', langs: { en: 'Tamazight · Tachelhit · Tarifit', fr: 'Tamazight · Tachelhit · Tarifit' }, license: 'MIT', desc: { en: 'First production-grade Amazigh language model. Indigenous AI matters.', fr: 'Premier modèle amazigh de qualité production. L’IA autochtone compte.' } },
];

type HubItem = { name: string; gpus: Bilingual; energy: Bilingual; renewable: string; image: string };

const HUB_ITEMS: HubItem[] = [
  { name: 'Ouarzazate', gpus: { en: '800 GPUs', fr: '800 GPU' }, energy: { en: 'Solar CSP — Noor Complex', fr: 'Solaire CSP — Complexe Noor' }, renewable: '97%', image: '/images/intelligence/harchos-gpu-cluster.png' },
  { name: 'Dakhla', gpus: { en: '400 GPUs', fr: '400 GPU' }, energy: { en: 'Offshore Wind — Atlantic', fr: 'Éolien offshore — Atlantique' }, renewable: '85%', image: '/images/sections/intelligence-exterior.jpg' },
  { name: 'Benguerir', gpus: { en: '350 GPUs', fr: '350 GPU' }, energy: { en: 'Solar + Wind Hybrid', fr: 'Hybride solaire + éolien' }, renewable: '75%', image: '/images/sections/intelligence-cooling.jpg' },
  { name: 'Tanger', gpus: { en: '200 GPUs', fr: '200 GPU' }, energy: { en: 'Wind + Grid — Mediterranean', fr: 'Éolien + réseau — Méditerranée' }, renewable: '65%', image: '/images/intelligence/harchos-tanger.png' },
  { name: 'Casablanca', gpus: { en: '48 GPUs', fr: '48 GPU' }, energy: { en: 'Grid + Solar — Urban Edge', fr: 'Réseau + solaire — Edge urbain' }, renewable: '40%', image: '/images/sections/intelligence-server-room.jpg' },
];

type Customer = { quote: Bilingual; author: Bilingual; role: Bilingual };

const CUSTOMERS: Customer[] = [
  { quote: { en: 'HarchOS let us train a 13B parameter model on Moroccan soil, under Moroccan law. No US exposure. No GDPR gymnastics. Just compute.', fr: 'HarchOS nous a permis d’entraîner un modèle 13B sur sol marocain, sous droit marocain. Pas d’exposition US. Pas de gymnastique RGPD. Juste du calcul.' }, author: { en: 'Yasmine El Idrissi', fr: 'Yasmine El Idrissi' }, role: { en: 'Head of AI, Moroccan Bank of Commerce', fr: 'Dir. IA, Banque Marocaine du Commerce' } },
  { quote: { en: 'We cut our inference cost by 73% migrating from AWS p5 to HarchOS. Same latency. Carbon-aware by default. Game-changer.', fr: 'Nous avons réduit notre coût d’inférence de 73 % en migrant d’AWS p5 vers HarchOS. Même latence. Carbone-aware par défaut. Change-tout.' }, author: { en: 'Mamadou Diallo', fr: 'Mamadou Diallo' }, role: { en: 'CTO, Noolon AI', fr: 'CTO, Noolon AI' } },
  { quote: { en: 'For phosphate processing analytics, sovereignty is non-negotiable. HarchOS enforces it at the infrastructure level — we audited the code.', fr: 'Pour l’analytique phosphatière, la souveraineté est non-négociable. HarchOS l’impose à l’infra — nous avons audit le code.' }, author: { en: 'Khalid Benjelloun', fr: 'Khalid Benjelloun' }, role: { en: 'VP Engineering, OCP Group', fr: 'VP Engineering, OCP Group' } },
];

type FaqItem = { q: Bilingual; a: Bilingual };

const FAQ_ITEMS: FaqItem[] = [
  { q: { en: 'What does "sovereign by default" actually mean?', fr: 'Que signifie « souverain par défaut » concrètement ?' }, a: { en: 'Every workload deploys with region=morocco, sovereignty=strict, and carbonAware=true — without you setting anything. To run outside Africa, you would have to explicitly opt out. The default is the secure path.', fr: 'Chaque charge démarre avec region=morocco, sovereignty=strict et carbonAware=true — sans rien configurer. Pour sortir d’Afrique, vous devez explicitement désactiver. Le défaut est le chemin sûr.' } },
  { q: { en: 'Can I really scale to 1,024 GPUs in 90 seconds?', fr: 'Puis-je vraiment scaler à 1 024 GPU en 90 s ?' }, a: { en: 'Yes — when capacity is available. The 90-second number is the scheduler-to-first-token time on a pre-warmed pool. Cold-start from empty cluster is closer to 4 minutes. We publish real numbers, not marketing.', fr: 'Oui — quand la capacité est disponible. Le chiffre 90 s est le temps scheduler-à-premier-token sur un pool préchauffé. Le cold-start depuis un cluster vide est plutôt 4 min. Nous publions des chiffres réels, pas marketing.' } },
  { q: { en: 'How is HarchOS different from AWS, GCP, or Azure?', fr: 'Comment HarchOS diffère d’AWS, GCP ou Azure ?' }, a: { en: 'Three things: sovereignty is enforced in code (not policy), carbon-aware scheduling is built into the kernel (not bolted on), and the entire platform is open-source (you can audit every line). Hyperscalers cannot match any of these without fundamentally changing their business model.', fr: 'Trois choses : la souveraineté est imposée dans le code (pas en politique), le scheduling carbone-aware est dans le noyau (pas greffé), et toute la plateforme est open-source (auditable ligne par ligne). Les hyperscalers ne peuvent rien égaler sans changer leur modèle d’affaires.' } },
  { q: { en: 'What about the US CLOUD Act?', fr: 'Qu’en est-il du CLOUD Act US ?' }, a: { en: 'Harch Corp is a Moroccan entity with no US corporate presence. We do not hold US data, we do not respond to US court orders, and we do not have a US subsidiary that could be compelled. Sovereign by jurisdiction, not just by policy.', fr: 'Harch Corp est une entité marocaine sans présence sociétaire US. Nous ne détenons pas de données US, nous ne répondons pas aux injonctions US, et nous n’avons pas de filiale US contraignable. Souverain par juridiction, pas seulement par politique.' } },
  { q: { en: 'Is HarchOS really open-source?', fr: 'HarchOS est-il vraiment open-source ?' }, a: { en: 'Yes. Server, SDKs (Python + JS), CLI, Terraform provider, Grafana plugins, and examples — all on GitHub under Apache 2.0 or MIT. You can fork it, audit it, contribute, or self-host. Sovereign infrastructure requires transparent code.', fr: 'Oui. Serveur, SDK (Python + JS), CLI, provider Terraform, plugins Grafana et examples — tout sur GitHub en Apache 2.0 ou MIT. Forkez, auditez, contribuez, ou auto-hébergez. L’infrastructure souveraine exige du code transparent.' } },
  { q: { en: 'How does carbon-aware scheduling actually work?', fr: 'Comment fonctionne le scheduling carbone-aware ?' }, a: { en: 'The THINK layer predicts carbon intensity 24-48 hours ahead using weather forecasts, solar generation curves, wind predictions, and grid patterns. It then schedules workloads to the greenest available hub at the greenest available time. Same latency, 60-90% less carbon.', fr: 'La couche THINK prédit l’intensité carbone 24-48h à l’avance via prévisions météo, courbes solaires, prédictions éoliennes et patterns réseau. Elle planifie ensuite les charges sur le hub le plus vert au moment le plus vert. Même latence, 60-90 % moins de carbone.' } },
  { q: { en: 'What’s the catch with the $1.80/hr H100 price?', fr: 'Quel est le piège avec le prix H100 à 1,80 $/h ?' }, a: { en: 'No catch. We buy power at industrial renewable rates (~$0.04/kWh via PPA), our PUE is 1.15 (vs hyperscaler 1.3-1.5), and we have no US/EU margins to defend. Spot pricing goes to $0.72/hr. Reserved commits drop another 20%.', fr: 'Pas de piège. Nous achetons l’électricité à tarif renouvelable industriel (~0,04 $/kWh via PPA), notre PUE est 1,15 (vs hyperscaler 1,3-1,5), et nous n’avons pas de marges US/UE à défendre. Spot à 0,72 $/h. Réservé 1 an : -20 % supplémentaires.' } },
  { q: { en: 'What happens if a hub goes down?', fr: 'Que se passe-t-il si un hub tombe ?' }, a: { en: 'Workloads with regional sovereignty auto-migrate to another Moroccan hub within 30 seconds (RTO). Data loss is capped at 15 minutes (RPO). For strict sovereignty workloads, the hub fails closed — no cross-hub migration, by design.', fr: 'Les charges en souveraineté régionale migrent automatiquement vers un autre hub marocain en 30 s (RTO). Perte de données plafonnée à 15 min (RPO). Pour les charges en souveraineté stricte, le hub échoue fermé — pas de migration inter-hub, par design.' } },
];

type ResourceItem = { title: Bilingual; desc: Bilingual; type: string; Icon: typeof Zap };

const RESOURCE_ITEMS: ResourceItem[] = [
  { title: { en: 'Quickstart', fr: 'Quickstart' }, desc: { en: 'From zero to first inference in 5 minutes. Python SDK, CLI, and curl examples.', fr: 'De zéro à la première inférence en 5 min. SDK Python, CLI et exemples curl.' }, type: 'Guide', Icon: Zap },
  { title: { en: 'API Reference', fr: 'Référence API' }, desc: { en: 'Full REST + gRPC API. OpenAPI 3.1 spec. SDKs in Python, TypeScript, Go, Rust.', fr: 'API REST + gRPC complète. Spec OpenAPI 3.1. SDK Python, TypeScript, Go, Rust.' }, type: 'Reference', Icon: BookOpen },
  { title: { en: 'SDK Guide', fr: 'Guide SDK' }, desc: { en: 'Carbon tracking, async workloads, SSE streaming, batch processing. Production patterns.', fr: 'Suivi carbone, workloads async, SSE streaming, batch processing. Patterns production.' }, type: 'Guide', Icon: Box },
  { title: { en: 'Architecture', fr: 'Architecture' }, desc: { en: 'SENSE/THINK/ACT deep dive. Hub topology, scheduler internals, sovereignty enforcement.', fr: 'Plongée SENSE/THINK/ACT. Topologie hub, internes scheduler, imposition souveraineté.' }, type: 'Whitepaper', Icon: Cpu },
];

/* ── Hub pin coordinates on mesh-map (percentages) ── */
const HUB_PINS = [
  { name: 'Tanger', x: 42, y: 18, gpus: '200' },
  { name: 'Casablanca', x: 38, y: 38, gpus: '48' },
  { name: 'Benguerir', x: 35, y: 50, gpus: '350' },
  { name: 'Ouarzazate', x: 38, y: 62, gpus: '800' },
  { name: 'Dakhla', x: 22, y: 82, gpus: '400' },
];

export default function HarchOSPageClient() {
  const t = useTranslations('harchos');
  const locale = useLocale();
  const isFr = locale === 'fr';

  /* Localize a Bilingual field */
  const L = (b: Bilingual) => (isFr ? b.fr : b.en);

  /* ── Pricing calculator state ── */
  const [calcGpu, setCalcGpu] = useState(GPU_CALC_OPTIONS[0]);
  const [calcQty, setCalcQty] = useState(8);
  const [calcHours, setCalcHours] = useState(730);
  const yourMonthly = calcGpu.priceHr * calcQty * calcHours;
  const awsMonthly = yourMonthly * AWS_MULTIPLIER;
  const saveMonthly = awsMonthly - yourMonthly;

  /* ── FAQ accordion state ── */
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  /* ── Dashboard Tesla-style tab state (Today / 7-Day / 30-Day) ── */
  const [dashTab, setDashTab] = useState<0 | 1 | 2>(2); // 30-Day default (matches original violet active styling)

  /* ── Dashboard mockup data — different metrics per Tesla tab ── */
  const dashMetricsByTab = [
    // Today
    [
      { label: isFr ? 'GPU actifs' : 'Active GPUs', value: '742/800', pct: 92 },
      { label: isFr ? 'Jobs en cours' : 'Running jobs', value: '47', pct: 78 },
      { label: isFr ? 'Latence p99' : 'p99 latency', value: '38ms', pct: 88 },
      { label: isFr ? 'Carbone (jour)' : 'Carbon (24h)', value: '4.2 kg', pct: 18 },
    ],
    // 7-Day
    [
      { label: isFr ? 'GPU actifs' : 'Active GPUs', value: '698/800', pct: 87 },
      { label: isFr ? 'Jobs en cours' : 'Running jobs', value: '156', pct: 65 },
      { label: isFr ? 'Latence p99' : 'p99 latency', value: '42ms', pct: 84 },
      { label: isFr ? 'Carbone (7j)' : 'Carbon (7d)', value: '28.6 kg', pct: 22 },
    ],
    // 30-Day
    [
      { label: isFr ? 'GPU actifs' : 'Active GPUs', value: '712/800', pct: 89 },
      { label: isFr ? 'Jobs terminés' : 'Completed jobs', value: '624', pct: 72 },
      { label: isFr ? 'Latence p99' : 'p99 latency', value: '41ms', pct: 86 },
      { label: isFr ? 'Carbone (30j)' : 'Carbon (30d)', value: '118 kg', pct: 19 },
    ],
  ];
  const dashMetrics = dashMetricsByTab[dashTab];

  const dashJobs = [
    { id: 'job_4f7a', name: isFr ? 'darija-13b-ft' : 'darija-13b-ft', gpu: '32× H100', progress: 78, status: 'running' },
    { id: 'job_8b21', name: isFr ? 'inference-batch' : 'inference-batch', gpu: '8× H100', progress: 45, status: 'running' },
    { id: 'job_c904', name: isFr ? 'swahili-70b-train' : 'swahili-70b-train', gpu: '64× H100', progress: 23, status: 'running' },
    { id: 'job_1de5', name: isFr ? 'amazigh-8b-eval' : 'amazigh-8b-eval', gpu: '4× A100', progress: 91, status: 'queued' },
    { id: 'job_77fa', name: isFr ? 'sahel-7b-distill' : 'sahel-7b-distill', gpu: '16× H100', progress: 100, status: 'done' },
  ];

  return (
    <div className="bg-white font-sans text-neutral-950 antialiased selection:bg-violet-500 selection:text-white">

      {/* ═══════════════════════════════════════════════════════════
          1. HERO — Full-bleed facility at night, neutral-950 gradient
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[100svh] w-full overflow-hidden bg-neutral-950">
        <Image
          src="/images/intelligence/harchos-hero.png"
          alt={t('refonte.heroImageAlt')}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/45 to-neutral-950/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 to-transparent" />
        {/* Terminal cursor blink — HarchOS subsidiary unique motif */}
        <TerminalCursor />

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-between px-6 py-16 md:px-12 md:py-24">
          {/* Top — HARCH · HARCHOS badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center md:justify-start"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/40 px-5 py-2 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              <span className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-neutral-200">
                {t('refonte.badge')}
              </span>
            </div>
          </motion.div>

          {/* Center — headline + lead */}
          <div className="flex flex-1 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-5xl text-center md:mx-0 md:text-left"
            >
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                {t('refonte.heroTitle')}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-300 md:mx-0 md:text-xl">
                {t('refonte.heroSubtext')}
              </p>
            </motion.div>
          </div>

          {/* Bottom — stats + emerald CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto w-full max-w-6xl"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-12">
              {[
                { num: t('refonte.heroStat1Num'), label: t('refonte.heroStat1Label') },
                { num: t('refonte.heroStat2Num'), label: t('refonte.heroStat2Label') },
                { num: t('refonte.heroStat3Num'), label: t('refonte.heroStat3Label') },
              ].map((s, i) => (
                <div key={i} className="border-l-2 border-violet-500/50 pl-5 text-left">
                  <div className="font-mono text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                    {s.num}
                  </div>
                  <div className="mt-1 text-xs font-light uppercase tracking-wider text-neutral-400 md:text-sm">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center md:justify-end">
              <Link
                href="/quote"
                aria-label={`${t('refonte.heroCtaPrimary')} — HarchOS`}
                className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('refonte.heroCtaPrimary')}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <BookOpen size={14} aria-hidden="true" />
                {t('refonte.heroCtaSecondary')}
              </Link>
            </div>
          </motion.div>
        </div>

      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. OVERVIEW — clean light section, chip accent
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-32">
        <ChipAccent />
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-12 md:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-5"
          >
            <SectionLabel n="01" label={t('refonte.overviewLabel')} />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('refonte.overviewTitle')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-violet-500" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-7"
          >
            <p className="text-lg font-light leading-relaxed text-neutral-500 md:text-xl">
              {t('refonte.overviewBody')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['Law 09-08', 'CNDP', 'GDPR-aligned', 'Apache 2.0', 'No CLOUD Act'].map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-mono text-xs font-medium text-neutral-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  {b}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. PROBLEM — dark, 3 stat cards with violet left-border
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139,92,246,0.12) 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-600">{'// 02'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('refonte.problemLabel')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('refonte.problemTitle')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('refonte.problemBody')}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {[
              { num: t('refonte.problemStat1Num'), label: t('refonte.problemStat1Label') },
              { num: t('refonte.problemStat2Num'), label: t('refonte.problemStat2Label') },
              { num: t('refonte.problemStat3Num'), label: t('refonte.problemStat3Label') },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="harchos-card-lift rounded-2xl border border-neutral-800 bg-neutral-900 p-8 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5"
              >
                <div className="border-l-2 border-violet-500/60 pl-4">
                  <div className="font-mono text-4xl font-bold text-violet-500 md:text-5xl">
                    {s.num}
                  </div>
                  <div className="mt-2 text-sm font-light text-neutral-400">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. ARCHITECTURE — dark, custom SVG SENSE/THINK/ACT diagram
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-600">{'// 03'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('refonte.archLabel')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('refonte.archTitle')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-neutral-400 md:text-lg">
              {t('refonte.archBody')}
            </p>
          </div>

          {/* Architecture diagram (custom SVG) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-6 md:p-10"
          >
            {/* Diagram */}
            <div className="mb-8 flex items-center justify-center">
              <svg
                viewBox="0 0 1000 200"
                className="w-full max-w-4xl"
                preserveAspectRatio="xMidYMid meet"
                aria-label={t('refonte.archDiagramCode')}
              >
                {/* Connection line */}
                <defs>
                  <linearGradient id="archFlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                  </linearGradient>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill="#8b5cf6" />
                  </marker>
                </defs>
                <line x1="80" y1="100" x2="920" y2="100" stroke="url(#archFlow)" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* 5 nodes */}
                {[
                  { x: 80, label: 'CODE', sub: 'SDK / CLI' },
                  { x: 280, label: 'API', sub: 'scheduler' },
                  { x: 500, label: 'THINK', sub: 'carbone-aware' },
                  { x: 720, label: 'GPU FLEET', sub: '1,798 GPUs planned' },
                  { x: 920, label: 'OUTPUT', sub: 'carbon report' },
                ].map((n, i) => (
                  <motion.g
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.3, type: 'spring' }}
                  >
                    <circle cx={n.x} cy="100" r="32" fill="#0a0a0a" stroke="#8b5cf6" strokeWidth="1.5" />
                    <circle cx={n.x} cy="100" r="6" fill="#8b5cf6" />
                    <text x={n.x} y="60" textAnchor="middle" className="font-mono" fontSize="14" fontWeight="bold" fill="#ffffff">
                      {n.label}
                    </text>
                    <text x={n.x} y="155" textAnchor="middle" className="font-mono" fontSize="11" fill="#a3a3a3">
                      {n.sub}
                    </text>
                  </motion.g>
                ))}
              </svg>
            </div>

            {/* 4 numbered notes */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[
                t('refonte.archNote1'),
                t('refonte.archNote2'),
                t('refonte.archNote3'),
                t('refonte.archNote4'),
              ].map((note, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                  <span className="font-mono text-xs font-bold text-violet-500">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-xs font-light leading-relaxed text-neutral-400">{note}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 3 architecture layers */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                tag: t('refonte.archSenseTag'),
                title: t('refonte.archSenseTitle'),
                desc: t('refonte.archSenseDesc'),
                specs: t('refonte.archSenseSpecs'),
                Icon: Activity,
              },
              {
                tag: t('refonte.archThinkTag'),
                title: t('refonte.archThinkTitle'),
                desc: t('refonte.archThinkDesc'),
                specs: t('refonte.archThinkSpecs'),
                Icon: Cpu,
              },
              {
                tag: t('refonte.archActTag'),
                title: t('refonte.archActTitle'),
                desc: t('refonte.archActDesc'),
                specs: t('refonte.archActSpecs'),
                Icon: Workflow,
              },
            ].map((layer, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="harchos-card-lift flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-6 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5 md:p-8"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 ring-1 ring-violet-500/30">
                    <layer.Icon size={18} className="text-violet-500" />
                  </div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-violet-500">
                    {layer.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">{layer.title}</h3>
                <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-neutral-400">
                  {layer.desc}
                </p>
                <div className="mt-5 border-t border-neutral-800 pt-4 font-mono text-[11px] font-light leading-relaxed text-neutral-500">
                  {layer.specs}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. CODE — dark, Python SDK with manual syntax highlighting
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-5"
            >
              <SectionLabel n="04" label={t('refonte.codeLabel')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
                {t('refonte.codeTitle')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-violet-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('refonte.codeBody')}
              </p>

              <ul className="mt-8 space-y-3">
                {[
                  t('refonte.codeBullet1'),
                  t('refonte.codeBullet2'),
                  t('refonte.codeBullet3'),
                  t('refonte.codeBullet4'),
                ].map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-violet-500" />
                    <span className="text-sm font-light text-neutral-300">{b}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/docs/sdk"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-violet-500 transition-colors hover:text-violet-400"
              >
                <Github size={14} aria-hidden="true" />
                {isFr ? 'Voir sur GitHub' : 'View on GitHub'}
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-7"
            >
              <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-[#0a0a0a] harchos-terminal-glow">
                {/* Title bar */}
                <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-950/60 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-neutral-700" />
                    <div className="h-3 w-3 rounded-full bg-neutral-700" />
                    <div className="h-3 w-3 rounded-full bg-neutral-700" />
                  </div>
                  <div className="ml-3 font-mono text-xs text-neutral-400">train.py — HarchOS SDK</div>
                  <div className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-500">
                    <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="hidden sm:inline">{isFr ? 'Exécuté' : 'Executed'}</span>
                  </div>
                </div>
                {/* Code body — manual syntax highlighting via spans */}
                <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-[1.7] md:p-7 md:text-[14px]">
                  <code>
                    <span className="text-violet-400">from</span>{' '}<span className="text-white">harchos</span>{' '}<span className="text-violet-400">import</span>{' '}<span className="text-white">HarchOS</span>
                    {'\n\n'}
                    <span className="text-neutral-500">{'# Sovereign by default. Carbon-aware by default.'}</span>
                    {'\n'}
                    <span className="text-white">client</span>{' '}<span className="text-neutral-400">=</span>{' '}<span className="text-white">HarchOS</span><span className="text-neutral-400">(</span>
                    {'\n  '}<span className="text-yellow-300">region</span><span className="text-neutral-400">=</span><span className="text-emerald-400">"morocco"</span><span className="text-neutral-400">,</span>
                    {'\n  '}<span className="text-yellow-300">sovereignty</span><span className="text-neutral-400">=</span><span className="text-emerald-400">"strict"</span><span className="text-neutral-400">,</span>
                    {'\n  '}<span className="text-yellow-300">carbon_aware</span><span className="text-neutral-400">=</span><span className="text-orange-400">True</span><span className="text-neutral-400">,</span>
                    {'\n'}<span className="text-neutral-400">)</span>
                    {'\n\n'}
                    <span className="text-neutral-500">{'# Train on 32 H100s — auto-routed to Ouarzazate solar hub'}</span>
                    {'\n'}
                    <span className="text-white">job</span>{' '}<span className="text-neutral-400">=</span>{' '}<span className="text-white">client</span><span className="text-neutral-400">.</span><span className="text-blue-400">train</span><span className="text-neutral-400">(</span>
                    {'\n  '}<span className="text-yellow-300">model</span><span className="text-neutral-400">=</span><span className="text-emerald-400">"darija-13b"</span><span className="text-neutral-400">,</span>
                    {'\n  '}<span className="text-yellow-300">gpus</span><span className="text-neutral-400">=</span><span className="text-orange-400">32</span><span className="text-neutral-400">,</span>
                    {'\n  '}<span className="text-yellow-300">gpu_type</span><span className="text-neutral-400">=</span><span className="text-emerald-400">"h100"</span><span className="text-neutral-400">,</span>
                    {'\n  '}<span className="text-yellow-300">dataset</span><span className="text-neutral-400">=</span><span className="text-emerald-400">"s3://harchos/darija-corpus"</span><span className="text-neutral-400">,</span>
                    {'\n'}<span className="text-neutral-400">)</span>
                    {'\n\n'}
                    <span className="text-white">print</span><span className="text-neutral-400">(</span><span className="text-emerald-400">f"Trained on </span><span className="text-yellow-300">{'{job.hub}'}</span><span className="text-emerald-400">"</span>
                    {'\n  '}<span className="text-emerald-400">f"Carbon: </span><span className="text-yellow-300">{'{job.carbon_gco2}'}</span><span className="text-emerald-400"> gCO₂"</span>
                    {'\n  '}<span className="text-emerald-400">f"Renewable: </span><span className="text-yellow-300">{'{job.renewable_pct}'}</span><span className="text-emerald-400">%"</span><span className="text-neutral-400">)</span>
                  </code>
                </pre>
                {/* Output */}
                <div className="border-t border-neutral-800 bg-neutral-950/40 p-5 font-mono text-xs leading-relaxed text-neutral-500 md:p-7">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Trained on hub:ouarzazate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Carbon: 412 gCO₂ · Renewable: 97%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. GPU FLEET — light, monospace table with 4 GPU rows
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-50 py-20 md:py-32">
        <ChipAccent />
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-400">{'// 05'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('refonte.gpuLabel')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('refonte.gpuTitle')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-violet-500" />
            <p className="mt-6 text-base font-light text-neutral-500 md:text-lg">
              {t('refonte.gpuSubtitle')}
            </p>
          </div>

          {/* GPU table — product-page feel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-neutral-200/60"
          >
            <table className="w-full min-w-[640px] border-collapse font-mono text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                  <th className="p-4 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 md:p-5 md:text-[11px]">
                    {isFr ? 'GPU' : 'GPU'}
                  </th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 md:p-5 md:text-[11px]">
                    {isFr ? 'Mémoire' : 'Memory'}
                  </th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 md:p-5 md:text-[11px]">
                    {isFr ? 'À la demande' : 'On-demand'}
                  </th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 md:p-5 md:text-[11px]">Spot</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 md:p-5 md:text-[11px]">
                    {isFr ? 'Idéal pour' : 'Best for'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {GPU_ROWS.map((row, i) => (
                  <tr
                    key={i}
                    className={`group relative border-b border-neutral-100 transition-colors last:border-0 hover:bg-violet-50/50 ${
                      row.popular ? 'bg-violet-50/30' : ''
                    }`}
                  >
                    {/* Hover left accent bar */}
                    <td className="relative p-4 font-bold text-neutral-950 md:p-5">
                      <span
                        className={`absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100 ${
                          row.popular ? 'bg-violet-500' : 'bg-violet-400/70'
                        }`}
                        aria-hidden="true"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-violet-600">{L(row.gpu)}</span>
                        {row.popular && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-100 px-2 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-wider text-violet-700">
                            <Zap size={9} aria-hidden="true" />
                            {isFr ? 'Populaire' : 'Popular'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-neutral-600 md:p-5">{L(row.mem)}</td>
                    <td className="p-4 md:p-5">
                      <span className="font-bold text-base text-emerald-600 md:text-lg">{row.ondemand}</span>
                    </td>
                    <td className="p-4 text-neutral-500 md:p-5">{row.spot}</td>
                    <td className="p-4 text-neutral-500 md:p-5">{L(row.best)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-xs font-mono text-neutral-500">
            <div className="flex items-center gap-2">
              <CircuitBoard size={14} className="text-violet-500" aria-hidden="true" />
              NVLink · InfiniBand
            </div>
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-violet-500" aria-hidden="true" />
              Liquid cooling · PUE 1.15
            </div>
            <div className="flex items-center gap-2">
              <Leaf size={14} className="text-violet-500" aria-hidden="true" />
              {t('refonte.renewableLabel')}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. NETWORK MAP — dark, mesh-map.png + animated pins + stats
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-5"
            >
              <SectionLabel n="06" label={t('refonte.netLabel')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
                {t('refonte.netTitle')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-violet-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('refonte.netBody')}
              </p>

              {/* Stats grid */}
              <div className="mt-10 grid grid-cols-2 gap-4">
                {[
                  { num: t('refonte.netStat1Num'), label: t('refonte.netStat1Label') },
                  { num: t('refonte.netStat2Num'), label: t('refonte.netStat2Label') },
                  { num: t('refonte.netStat3Num'), label: t('refonte.netStat3Label') },
                  { num: t('refonte.netStat4Num'), label: t('refonte.netStat4Label') },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="harchos-card-lift rounded-xl border border-neutral-800 bg-neutral-900 p-4 hover:border-violet-500/40 hover:bg-neutral-900/60"
                  >
                    <div className="font-mono text-2xl font-bold text-violet-500 md:text-3xl">
                      {s.num}
                    </div>
                    <div className="mt-1 text-xs font-light text-neutral-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Map visualization */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-7"
            >
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                {/* Browser chrome */}
                <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    {t('refonte.liveStatus')}
                  </div>
                </div>
                {/* Map with pins */}
                <div className="relative aspect-[4/3] bg-neutral-950">
                  <Image
                    src="/images/intelligence/harchos-mesh-map.png"
                    alt={isFr ? 'Carte du réseau de hubs HarchOS' : 'HarchOS hub mesh network map'}
                    fill
                    className="object-cover opacity-60"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/30 to-neutral-950/60" />

                  {/* Animated pins */}
                  {HUB_PINS.map((pin, i) => (
                    <motion.div
                      key={pin.name}
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + 0.5, type: 'spring' }}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    >
                      <div className="relative flex flex-col items-center">
                        <span className="relative flex h-4 w-4">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-60" />
                          <span className="relative inline-flex h-4 w-4 rounded-full bg-violet-500 ring-2 ring-white/30" />
                        </span>
                        <div className="mt-1 whitespace-nowrap rounded-md bg-neutral-950/80 px-2 py-1 font-mono text-[10px] font-bold text-white backdrop-blur-sm">
                          {pin.name}
                        </div>
                        <div className="mt-0.5 whitespace-nowrap font-mono text-[9px] text-violet-400">
                          {pin.gpus} GPUs
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Overlay legend */}
                  <div className="absolute bottom-3 left-3 rounded-lg border border-neutral-800 bg-neutral-950/80 px-3 py-1.5 backdrop-blur-sm">
                    <div className="text-[10px] font-light uppercase tracking-wider text-neutral-500">
                      {isFr ? 'Maille HarchOS · Afrique' : 'HarchOS Mesh · Africa'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. DASHBOARD MOCKUP — dark, HTML/CSS dashboard
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 50%, rgba(139,92,246,0.25) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(139,92,246,0.20) 0%, transparent 40%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-600">{'// 07'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('refonte.dashLabel')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
              {t('refonte.dashTitle')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light text-neutral-400 md:text-lg">
              {t('refonte.dashSubtitle')}
            </p>
          </div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="harchos-dash-shadow mt-16 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-950/60 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-neutral-700" />
                <div className="h-3 w-3 rounded-full bg-neutral-700" />
                <div className="h-3 w-3 rounded-full bg-neutral-700" />
              </div>
              <div className="ml-4 flex-1 rounded-md bg-neutral-950/60 px-3 py-1 font-mono text-xs text-neutral-400">
                {t('refonte.dashUrl')}
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {t('refonte.liveStatus')}
              </div>
            </div>

            {/* Dashboard content */}
            <div className="bg-neutral-950 p-4 md:p-6">
              {/* Top bar */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-neutral-500">
                    {t('refonte.dashBrandLabel')}
                  </div>
                  <div className="text-sm font-bold text-white md:text-base">
                    {t('refonte.dashClusterLabel')}
                  </div>
                </div>
                <div className="flex gap-1 rounded-full border border-neutral-800 bg-neutral-950/60 p-1">
                  {([
                    { key: 0 as const, label: t('refonte.today') },
                    { key: 1 as const, label: t('refonte.sevenDay') },
                    { key: 2 as const, label: t('refonte.thirtyDay') },
                  ]).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setDashTab(tab.key)}
                      aria-pressed={dashTab === tab.key}
                      className={`harchos-tab-pill rounded-full px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${
                        dashTab === tab.key
                          ? 'border border-violet-500/40 bg-violet-500/15 text-violet-300'
                          : 'border border-transparent text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metric cards — buttery crossfade on tab change (Tesla interaction) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={dashTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-2 gap-3 md:grid-cols-4"
                >
                  {dashMetrics.map((m, i) => (
                    <div
                      key={i}
                      className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 md:p-4"
                    >
                      <div className="text-[10px] font-light uppercase tracking-wider text-neutral-500 md:text-xs">
                        {m.label}
                      </div>
                      <div className="mt-2 font-mono text-lg font-bold text-violet-400 tabular-nums md:text-2xl">
                        {m.value}
                      </div>
                      {/* Progress bar — premium gradient fill */}
                      <div className="mt-auto pt-3">
                        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${m.pct}%` }}
                            transition={{ duration: 0.7, delay: i * 0.06 + 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Active jobs table */}
              <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-violet-500">
                    <Workflow size={14} aria-hidden="true" />
                    {isFr ? 'Jobs actifs' : 'Active jobs'}
                  </div>
                  <div className="font-mono text-[10px] text-neutral-500">
                    {isFr ? 'Rafraîchi il y a 4 s' : 'Refreshed 4s ago'}
                  </div>
                </div>
                <div className="space-y-2">
                  {dashJobs.map((job, i) => {
                    const styles: Record<string, { bar: string; pill: string; dot: string }> = {
                      done: { bar: 'bg-emerald-500', pill: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500', dot: 'bg-emerald-500' },
                      queued: { bar: 'bg-amber-500', pill: 'border-amber-500/30 bg-amber-500/10 text-amber-500', dot: 'bg-amber-500' },
                      running: { bar: 'bg-violet-500', pill: 'border-violet-500/30 bg-violet-500/10 text-violet-500', dot: 'bg-violet-500 animate-pulse' },
                    };
                    const s = styles[job.status] || styles.running;
                    return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3"
                    >
                      <div className="font-mono text-xs text-neutral-500">{job.id}</div>
                      <div className="flex-1 truncate text-sm font-medium text-white">{job.name}</div>
                      <div className="hidden font-mono text-xs text-neutral-400 sm:block">{job.gpu}</div>
                      <div className="hidden w-32 sm:block">
                        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${job.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: i * 0.06 + 0.3 }}
                            className={`h-full rounded-full ${s.bar}`}
                          />
                        </div>
                      </div>
                      <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400">{job.progress}%</div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${s.pill}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
                        {job.status}
                      </span>
                    </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. PRICING CALCULATOR — dark, interactive sliders
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
            <span className="text-neutral-600">{'// 08'}</span>
            <span className="h-px w-8 bg-violet-500/60" />
            <span className="text-violet-500">{t('refonte.calcLabel')}</span>
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
            {t('refonte.calcTitle')}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base font-light text-neutral-400 md:text-lg">
            {t('refonte.calcSubtitle')}
          </p>

          {/* Calculator */}
          <div className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-left md:p-10">
            {/* GPU type selector */}
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-light text-neutral-400">{t('refonte.calcGpuTypeLabel')}</span>
                <span className="font-mono text-sm font-bold text-violet-500">{calcGpu.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {GPU_CALC_OPTIONS.map((opt) => {
                  const isActive = calcGpu.key === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setCalcGpu(opt)}
                      aria-pressed={isActive}
                      className={`harchos-tab-pill rounded-lg border px-3 py-3 text-center font-mono text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${
                        isActive
                          ? 'border-violet-500 bg-violet-500/10 text-violet-400 shadow-[0_0_0_1px_rgba(139,92,246,0.4),0_8px_24px_-8px_rgba(139,92,246,0.4)]'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      <div>{opt.name}</div>
                      <div className={`mt-1 text-[10px] font-light ${isActive ? 'text-violet-500/80' : 'text-neutral-500'}`}>${opt.priceHr}/hr</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Qty slider */}
            <div className="mb-8">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-sm font-light text-neutral-400">{t('refonte.calcQtyLabel')}</span>
                <span className="font-mono text-2xl font-bold text-violet-500">{calcQty}</span>
              </div>
              <input
                type="range"
                min="1"
                max="256"
                step="1"
                value={calcQty}
                onChange={(e) => setCalcQty(parseInt(e.target.value))}
                className="w-full accent-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                aria-label={t('refonte.calcQtyLabel')}
                aria-valuetext={`${calcQty} GPUs`}
              />
              <div className="mt-2 flex justify-between font-mono text-[10px] font-light uppercase tracking-wider text-neutral-600">
                <span>1 GPU</span>
                <span>256 GPUs</span>
              </div>
            </div>

            {/* Hours slider */}
            <div className="mb-8">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-sm font-light text-neutral-400">{t('refonte.calcHoursLabel')}</span>
                <span className="font-mono text-2xl font-bold text-violet-500">{calcHours}h</span>
              </div>
              <input
                type="range"
                min="1"
                max="730"
                step="1"
                value={calcHours}
                onChange={(e) => setCalcHours(parseInt(e.target.value))}
                className="w-full accent-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                aria-label={t('refonte.calcHoursLabel')}
                aria-valuetext={`${calcHours} hours`}
              />
              <div className="mt-2 flex justify-between font-mono text-[10px] font-light uppercase tracking-wider text-neutral-600">
                <span>1h</span>
                <span>730h (24/7)</span>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="font-mono text-xs font-light uppercase tracking-wider text-neutral-500">
                  {t('refonte.calcYourCost')}
                </div>
                <div className="mt-2 font-mono text-3xl font-bold text-violet-500 md:text-4xl">
                  ${yourMonthly.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className="mt-1 font-mono text-[10px] font-light uppercase tracking-wider text-emerald-500">
                  HarchOS
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="font-mono text-xs font-light uppercase tracking-wider text-neutral-500">
                  {t('refonte.calcAwsCost')}
                </div>
                <div className="mt-2 font-mono text-3xl font-bold text-neutral-500 line-through md:text-4xl">
                  ${awsMonthly.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className="mt-1 font-mono text-[10px] font-light uppercase tracking-wider text-neutral-500">
                  AWS p5.48xlarge
                </div>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                <div className="font-mono text-xs font-light uppercase tracking-wider text-emerald-400">
                  {t('refonte.calcSavings')}
                </div>
                <div className="mt-2 font-mono text-3xl font-bold text-emerald-400 md:text-4xl">
                  ${saveMonthly.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                <div className="mt-1 flex items-center justify-center gap-1 font-mono text-[10px] font-light uppercase tracking-wider text-emerald-400">
                  <TrendingDown size={10} aria-hidden="true" />
                  {t('refonte.calcSavingsPer')}
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs font-light text-neutral-600">{t('refonte.calcDisclaimer')}</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. COMPARISON — light, HarchOS vs hyperscalers matrix
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-400">{'// 09'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('refonte.cmpLabel')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('refonte.cmpTitle')}
            </h2>
            <p className="mt-6 text-base font-light text-neutral-500 md:text-lg">
              {t('refonte.cmpSubtitle')}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-neutral-200/60 md:mt-20"
          >
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-center">
                  <th className="p-4 text-left font-semibold text-neutral-950 md:p-5 md:text-base"></th>
                  <th className="p-4 font-semibold text-violet-600 md:p-5 md:text-base">
                    <div className="flex flex-col items-center gap-1">
                      <Cpu size={16} />
                      HarchOS
                    </div>
                  </th>
                  <th className="p-4 font-semibold text-neutral-500 md:p-5 md:text-base">AWS</th>
                  <th className="p-4 font-semibold text-neutral-500 md:p-5 md:text-base">GCP</th>
                  <th className="p-4 font-semibold text-neutral-500 md:p-5 md:text-base">Azure</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-neutral-100 transition-colors last:border-0 ${
                      i % 2 === 0 ? 'bg-violet-50/30' : ''
                    } hover:bg-violet-50/60`}
                  >
                    <td className="p-4 text-left font-medium text-neutral-700 md:p-5">{L(row.label)}</td>
                    <td className="p-4 text-center md:p-5">
                      {row.harchos ? (
                        <CheckCircle2 size={18} className="mx-auto text-violet-600" aria-label="Yes" />
                      ) : (
                        <span className="mx-auto block h-4 w-4 rounded-full bg-neutral-200" aria-label="No" />
                      )}
                    </td>
                    <td className="p-4 text-center text-neutral-300 md:p-5">
                      {row.aws ? (
                        <CheckCircle2 size={18} className="mx-auto text-neutral-400" />
                      ) : (
                        <span className="mx-auto block h-1 w-3 rounded-full bg-neutral-300" aria-label="No" />
                      )}
                    </td>
                    <td className="p-4 text-center text-neutral-300 md:p-5">
                      {row.gcp ? (
                        <CheckCircle2 size={18} className="mx-auto text-neutral-400" />
                      ) : (
                        <span className="mx-auto block h-1 w-3 rounded-full bg-neutral-300" aria-label="No" />
                      )}
                    </td>
                    <td className="p-4 text-center text-neutral-300 md:p-5">
                      {row.azure ? (
                        <CheckCircle2 size={18} className="mx-auto text-neutral-400" />
                      ) : (
                        <span className="mx-auto block h-1 w-3 rounded-full bg-neutral-300" aria-label="No" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-neutral-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-violet-500" aria-hidden="true" />
              {isFr ? 'Inclus' : 'Included'}
            </div>
            <div className="flex items-center gap-2">
              <span className="block h-1 w-3 rounded-full bg-neutral-300" aria-hidden="true" />
              {isFr ? 'Non disponible' : 'Not available'}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. SOVEREIGNTY — light, 3 cards with violet-100 icon tiles
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-50 py-20 md:py-32">
        <ChipAccent />
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-400">{'// 10'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('refonte.sovLabel')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('refonte.sovTitle')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-violet-500" />
            <p className="mt-6 text-base font-light text-neutral-500 md:text-lg">
              {t('refonte.sovBody')}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {SOVEREIGNTY_CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="harchos-card-lift rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 ring-1 ring-violet-200">
                  <card.Icon size={22} className="text-violet-600" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-neutral-950">{card.title.en}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-neutral-500">{L(card.desc)}</p>
              </motion.div>
            ))}
          </div>

          {/* Sovereignty tier badge */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {[
              { tier: 'STRICT', desc: isFr ? 'Hub unique · isolation max' : 'Single hub · max isolation' },
              { tier: 'REGIONAL', desc: isFr ? 'Maroc · routing carbone' : 'Morocco · carbon routing' },
              { tier: 'GLOBAL', desc: isFr ? 'Panafricain · multi-région' : 'Pan-African · multi-region' },
            ].map((tier) => (
              <div
                key={tier.tier}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center shadow-sm"
              >
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-violet-600">
                  {tier.tier}
                </div>
                <div className="mt-1 text-[11px] font-light text-neutral-500">{tier.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          12. CARBON — dark, energy-mix image + stats + sources bars
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 text-white md:py-32">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 50%, rgba(139,92,246,0.25) 0%, transparent 40%), radial-gradient(circle at 80% 30%, rgba(139,92,246,0.20) 0%, transparent 40%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-7"
            >
              <SectionLabel n="11" label={t('refonte.carbonLabel')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
                {t('refonte.carbonTitle')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-violet-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('refonte.carbonBody')}
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4">
                {[
                  { num: t('refonte.carbonStat1Num'), label: t('refonte.carbonStat1Label') },
                  { num: t('refonte.carbonStat2Num'), label: t('refonte.carbonStat2Label') },
                  { num: t('refonte.carbonStat3Num'), label: t('refonte.carbonStat3Label') },
                  { num: t('refonte.carbonStat4Num'), label: t('refonte.carbonStat4Label') },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="harchos-card-lift rounded-xl border border-neutral-800 bg-neutral-900 p-4 hover:border-violet-500/40 hover:bg-neutral-900/60"
                  >
                    <div className="font-mono text-2xl font-bold text-violet-500 md:text-3xl">
                      {s.num}
                    </div>
                    <div className="mt-1 text-xs font-light text-neutral-400">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Energy mix image + sources panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-5"
            >
              <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src="/images/intelligence/harchos-energy-mix.png"
                    alt={isFr ? 'Mix énergétique renouvelable HarchOS' : 'HarchOS renewable energy mix'}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-violet-500">
                    <Leaf size={14} aria-hidden="true" />
                    {isFr ? 'Mix énergétique' : 'Energy mix'}
                  </div>
                  <div className="mt-6 space-y-5">
                    {CARBON_SOURCES.map((src, i) => (
                      <div key={i}>
                        <div className="mb-2 flex items-baseline justify-between">
                          <span className="text-sm font-semibold text-white">{L(src.name)}</span>
                          <span className="font-mono text-sm font-bold text-violet-500">{src.share}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${src.share}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: i * 0.15 }}
                            className="h-full rounded-full bg-violet-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex items-center gap-4 border-t border-neutral-800 pt-6">
                    <Sun size={20} className="text-violet-500" aria-hidden="true" />
                    <Wind size={20} className="text-violet-500" aria-hidden="true" />
                    <Battery size={20} className="text-violet-500" aria-hidden="true" />
                    <span className="ml-auto font-mono text-xs font-light uppercase tracking-wider text-neutral-400">
                      {t('refonte.renewableLabel')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          13. MODELS — light, 4 African LLM cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-400">{'// 12'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('refonte.modelsLabel')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('refonte.modelsTitle')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-violet-500" />
            <p className="mt-6 text-base font-light text-neutral-500 md:text-lg">
              {t('refonte.modelsBody')}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
            {MODEL_CARDS.map((model, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="harchos-card-lift group flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5 md:p-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xl font-bold text-neutral-950">{model.name}</h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 font-mono text-xs font-semibold text-violet-700">
                    <Cpu size={12} aria-hidden="true" />
                    {model.params}
                  </span>
                </div>
                <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-neutral-500">
                  {L(model.desc)}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4">
                  <span className="font-mono text-xs font-medium text-neutral-600">{L(model.langs)}</span>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-[10px] font-medium text-neutral-600">
                    {model.license}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          14. TERMINAL — dark, full HTML/CSS terminal demo
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 py-20 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-5"
            >
              <SectionLabel n="13" label={t('refonte.termLabel')} dark />
              <h2 className="mt-5 text-2xl font-bold tracking-tight md:text-4xl">
                {t('refonte.termTitle')}
              </h2>
              <div className="mt-6 h-0.5 w-16 bg-violet-500" />
              <p className="mt-6 text-base font-light leading-relaxed text-neutral-400 md:text-lg">
                {t('refonte.termSubtitle')}
              </p>

              <ul className="mt-8 space-y-3">
                {[
                  isFr ? 'Authentification via keyring système' : 'Auth via system keyring',
                  isFr ? 'Allocation GPU carbone-aware' : 'Carbon-aware GPU allocation',
                  isFr ? 'Déploiement en streaming' : 'Streaming deployment',
                  isFr ? 'Empreinte carbone rapportée par job' : 'Per-job carbon footprint',
                ].map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <TerminalIcon size={16} className="mt-0.5 flex-shrink-0 text-violet-500" />
                    <span className="text-sm font-light text-neutral-300">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Terminal mockup — real terminal feel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-7"
            >
              <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-[#0a0a0a] harchos-terminal-glow">
                {/* Title bar — premium with session info + connection status */}
                <div className="flex items-center gap-3 border-b border-neutral-800 bg-neutral-950/80 px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                  </div>
                  <div className="ml-1 flex items-center gap-2 font-mono text-[11px] text-neutral-400">
                    <TerminalIcon size={11} className="text-violet-400" aria-hidden="true" />
                    <span>{t('refonte.terminalTitle')}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-500">
                    <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="hidden sm:inline">{isFr ? 'Connecté' : 'Connected'}</span>
                  </div>
                </div>

                {/* Terminal body — with subtle scanline overlay (CRT feel) */}
                <div className="harchos-scanline relative overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.75] md:p-7 md:text-[13.5px]">
                  <div className="space-y-2.5">
                    {/* Command 1 — auth login */}
                    <div className="flex flex-wrap items-baseline gap-x-1.5">
                      <span className="shrink-0 text-emerald-400">harchos@gpu-cluster-01</span>
                      <span className="shrink-0 text-violet-400">:</span>
                      <span className="shrink-0 text-sky-400">~/workloads</span>
                      <span className="shrink-0 text-neutral-500">$</span>
                      <span className="text-white/90">harchos</span>
                      <span className="text-violet-300">auth</span>
                      <span className="text-white/90">login</span>
                    </div>
                    <div className="flex items-baseline gap-2 pl-1 text-white/55">
                      <span className="text-emerald-400" aria-hidden="true">✓</span>
                      <span>{t('refonte.terminalAuth')}</span>
                    </div>
                    <div className="flex items-baseline gap-2 pl-1 text-white/55">
                      <span className="text-emerald-400" aria-hidden="true">✓</span>
                      <span>{t('refonte.terminalAuth2')}</span>
                    </div>

                    <div className="h-1.5" />

                    {/* Command 2 — compute allocate */}
                    <div className="flex flex-wrap items-baseline gap-x-1.5">
                      <span className="shrink-0 text-emerald-400">harchos@gpu-cluster-01</span>
                      <span className="shrink-0 text-violet-400">:</span>
                      <span className="shrink-0 text-sky-400">~/workloads</span>
                      <span className="shrink-0 text-neutral-500">$</span>
                      <span className="text-white/90">harchos</span>
                      <span className="text-violet-300">compute</span>
                      <span className="text-white/90">allocate</span>
                      <span className="text-amber-300">--gpus</span>
                      <span className="text-orange-300">8</span>
                      <span className="text-amber-300">--type</span>
                      <span className="text-orange-300">H100</span>
                    </div>
                    <div className="flex items-baseline gap-2 pl-1 text-white/55">
                      <span className="text-emerald-400" aria-hidden="true">✓</span>
                      <span>{t('refonte.terminalAlloc')}</span>
                    </div>
                    <div className="flex items-baseline gap-2 pl-1 text-white/55">
                      <span className="text-emerald-400" aria-hidden="true">✓</span>
                      <span>{t('refonte.terminalAlloc2')}</span>
                    </div>

                    <div className="h-1.5" />

                    {/* Command 3 — deploy apply */}
                    <div className="flex flex-wrap items-baseline gap-x-1.5">
                      <span className="shrink-0 text-emerald-400">harchos@gpu-cluster-01</span>
                      <span className="shrink-0 text-violet-400">:</span>
                      <span className="shrink-0 text-sky-400">~/workloads</span>
                      <span className="shrink-0 text-neutral-500">$</span>
                      <span className="text-white/90">harchos</span>
                      <span className="text-violet-300">deploy</span>
                      <span className="text-white/90">apply</span>
                      <span className="text-orange-300">workload.yaml</span>
                    </div>
                    <div className="flex items-baseline gap-2 pl-1 text-violet-300/90">
                      <span className="text-emerald-400" aria-hidden="true">✓</span>
                      <span>{t('refonte.terminalDeploy')}</span>
                    </div>
                    <div className="flex items-baseline gap-2 pl-1 text-white/55">
                      <span className="text-emerald-400" aria-hidden="true">✓</span>
                      <span>{t('refonte.terminalDeploy2')}</span>
                    </div>

                    <div className="h-1" />

                    {/* Final cursor line — authentic terminal blink */}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-emerald-400">harchos@gpu-cluster-01</span>
                      <span className="text-violet-400">:</span>
                      <span className="text-sky-400">~/workloads</span>
                      <span className="text-neutral-500">$</span>
                      <span
                        className="harchos-cursor inline-block h-[14px] w-[7px] translate-y-[1px] bg-violet-300"
                        style={{ boxShadow: '0 0 8px rgba(196, 181, 253, 0.65)' }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Install command below — premium card */}
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 font-mono text-xs text-neutral-300">
                <span className="text-violet-500">$</span>
                <span className="font-semibold text-white/90">brew install harchos</span>
                <span className="ml-auto hidden text-[10px] uppercase tracking-wider text-neutral-600 sm:inline">macOS · Linux · Windows</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          15. HUBS — light, 5 hubs as a horizontal photo timeline
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <ChipAccent />
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-400">{'// 14'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('refonte.hubsLabel')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('refonte.hubsTitle')}
            </h2>
            <div className="mx-auto mt-6 h-0.5 w-16 bg-violet-500" />
            <p className="mt-6 text-base font-light text-neutral-500 md:text-lg">
              {t('refonte.hubsBody')}
            </p>
          </div>

          {/* Hub photo grid */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HUB_ITEMS.map((hub, i) => (
              <motion.div
                key={hub.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="harchos-card-lift group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={hub.image}
                    alt={`${hub.name} hub`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-violet-300">
                        <MapPin size={11} aria-hidden="true" />
                        {isFr ? 'Hub' : 'Hub'}
                      </div>
                      <div className="text-lg font-bold text-white">{hub.name}</div>
                    </div>
                    <div className="rounded-md bg-neutral-950/60 px-2 py-1 font-mono text-xs font-bold text-violet-300 backdrop-blur-sm">
                      {hub.renewable}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-violet-600">
                    {L(hub.gpus)}
                  </div>
                  <div className="mt-1 text-sm font-light text-neutral-500">{L(hub.energy)}</div>
                </div>
              </motion.div>
            ))}

            {/* 6th tile — total */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: HUB_ITEMS.length * 0.08 }}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/50 p-8 text-center"
            >
              <div className="font-mono text-5xl font-bold text-violet-600">1,798</div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-violet-600">
                {isFr ? 'GPU au total' : 'Total GPUs'}
              </div>
              <div className="mt-1 text-xs font-light text-neutral-500">
                {isFr ? '5 hubs · maille panafricaine' : '5 hubs · Pan-African mesh'}
              </div>
            </motion.div>
          </div>

          <div className="mt-8 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-light leading-relaxed text-amber-800">
            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-amber-600" aria-hidden="true" />
            <span>{t('refonte.hubsDisclaimer')}</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          16. CUSTOMERS — light, 3 testimonial cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-400">{'// 15'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('refonte.custLabel')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('refonte.custTitle')}
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {CUSTOMERS.map((tm, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="harchos-card-lift flex flex-col rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5"
              >
                <Quote className="h-8 w-8 text-violet-500/40" aria-hidden="true" />
                <p className="mt-4 flex-1 font-light leading-relaxed text-neutral-700">
                  &ldquo;{L(tm.quote)}&rdquo;
                </p>
                <div className="mt-6 border-t border-neutral-100 pt-4">
                  <div className="font-bold text-neutral-950">{L(tm.author)}</div>
                  <div className="text-sm font-light text-neutral-500">{L(tm.role)}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-xs font-light text-neutral-500">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-violet-500" aria-hidden="true" />
              {isFr ? 'Conforme Loi 09-08' : 'Law 09-08 compliant'}
            </div>
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-violet-500" aria-hidden="true" />
              SOC 2 Type II
            </div>
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-violet-500" aria-hidden="true" />
              {isFr ? 'Souveraineté africaine' : 'African sovereignty'}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          17. FAQ — light, accordion with violet accent
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <ChipAccent />
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em]">
              <span className="text-neutral-400">{'// 16'}</span>
              <span className="h-px w-8 bg-violet-500/60" />
              <span className="text-violet-500">{t('refonte.faqLabel')}</span>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('refonte.faqTitle')}
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-xl border bg-white transition-colors ${
                  openFaq === i ? 'border-violet-500/40 shadow-sm' : 'border-neutral-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                  id={`harchos-faq-button-${i}`}
                  aria-expanded={openFaq === i}
                  aria-controls={`harchos-faq-panel-${i}`}
                >
                  <span className="font-semibold text-neutral-950">{L(item.q)}</span>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 text-violet-500 transition-transform ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                      id={`harchos-faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`harchos-faq-button-${i}`}
                    >
                      <p className="px-5 pb-5 font-light leading-relaxed text-neutral-500">
                        {L(item.a)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          18. RESOURCES — light, 4 doc link cards
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <SectionLabel n="17" label={t('refonte.resLabel')} />
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-neutral-950 md:text-4xl">
              {t('refonte.resTitle')}
            </h2>
            <div className="mt-6 h-0.5 w-16 bg-violet-500" />
            <p className="mt-4 text-base font-light text-neutral-500 md:text-lg">
              {t('refonte.resSubtitle')}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {RESOURCE_ITEMS.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="harchos-card-lift group flex items-start gap-5 rounded-2xl border border-neutral-200 bg-white p-6 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 ring-1 ring-violet-200">
                  <r.Icon size={22} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-neutral-950">{L(r.title)}</h3>
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-xs font-medium text-neutral-600">
                      {r.type}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-light text-neutral-500">{L(r.desc)}</p>
                  <Link
                    href="/docs"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition-colors hover:text-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                    aria-label={`${t('refonte.resDownload')} — ${L(r.title)}`}
                  >
                    <FileText size={14} aria-hidden="true" />
                    {t('refonte.resDownload')}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* GitHub CTA strip */}
          <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-8 text-white sm:flex-row">
            <div className="flex items-center gap-4">
              <Github size={32} className="text-violet-500" aria-hidden="true" />
              <div>
                <div className="text-lg font-bold text-white">github.com/HarchCorp</div>
                <div className="text-sm font-light text-neutral-400">
                  {isFr ? 'Toute la plateforme · Apache 2.0 · MIT' : 'Entire platform · Apache 2.0 · MIT'}
                </div>
              </div>
            </div>
            <Link
              href="https://github.com/HarchCorp"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
            >
              {isFr ? 'Voir sur GitHub' : 'Explore on GitHub'}
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          19. FINAL CTA — full-bleed image + wave divider + Back to Harch Corp
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950">
        <div className="absolute inset-0">
          <Image
            src="/images/intelligence/harchos-facility-night.png"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/60" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 py-24 text-white md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            {/* HARCH · HARCHOS badge — reprise of hero badge */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-neutral-700/60 bg-neutral-950/40 px-4 py-2 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-neutral-200">
                {t('refonte.badge')}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight md:text-4xl">
              {t('refonte.finalTitle')}
            </h2>
            <p className="mt-6 text-base font-light text-neutral-300 md:text-xl">
              {t('refonte.finalSubtitle')}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              {/* Primary CTA — emerald (Harch brand green) */}
              <Link
                href="/quote"
                aria-label={`${t('refonte.finalPrimary')} — HarchOS`}
                className="group inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                {t('refonte.finalPrimary')}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <BookOpen size={16} aria-hidden="true" />
                {t('refonte.finalSecondary')}
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs font-light text-neutral-400">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-violet-500" aria-hidden="true" />
                {t('refonte.trustClock')}
              </div>
              <div className="flex items-center gap-2">
                <Radio size={14} className="text-violet-500" aria-hidden="true" />
                {t('refonte.trustRadio')}
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-violet-500" aria-hidden="true" />
                {t('refonte.trustShield')}
              </div>
            </div>

            {/* "Back to Harch Corp" link — brand anchor */}
            <div className="mt-12 border-t border-neutral-800 pt-6">
              <Link
                href="/"
                aria-label={t('refonte.backToHarch')}
                className="group inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ArrowLeft
                  size={14}
                  className="transition-transform group-hover:-translate-x-1"
                  aria-hidden="true"
                />
                {t('refonte.backToHarch')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
