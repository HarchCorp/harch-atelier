'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  MapPin,
  Users,
  Heart,
  GraduationCap,
  Globe,
  TrendingUp,
  Building2,
  Shield,
  Crosshair,
  Fingerprint,
  ChevronRight,
  Target,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Banknote,
  Wifi,
  Clock,
  LayoutGrid,
  Sun,
  Server,
  Leaf,
  Cpu,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CountUp,
} from '@/components/ui/motion'

/* -------------------------------------------------------------------------- */
/*                                  Types                                     */
/* -------------------------------------------------------------------------- */

type Department =
  | 'Energy'
  | 'Intelligence'
  | 'Technology'
  | 'Corporate'
  | 'Agriculture'

interface Position {
  id: string
  title: string
  department: Department
  location: string
  type: string
  salary: string
  equity: boolean
  description: string[]
  responsibilities: string[]
  requirements: string[]
  niceToHave: string[]
}

/* -------------------------------------------------------------------------- */
/*                              Static content                                */
/* -------------------------------------------------------------------------- */

const heroStats = [
  {
    icon: Users,
    value: 3200,
    prefix: '',
    suffix: '',
    label: 'Jobs created by 2030',
    desc: 'Direct employment across 5 hubs and 8 verticals.',
  },
  {
    icon: Globe,
    value: 90,
    prefix: '',
    suffix: '%',
    label: 'Local hires',
    desc: 'Moroccan talent, trained and promoted internally.',
  },
  {
    icon: GraduationCap,
    value: 2,
    prefix: '$',
    suffix: 'K',
    label: 'Annual training per employee',
    desc: 'Conferences, certifications, GPU compute credits.',
  },
  {
    icon: Building2,
    value: 5,
    prefix: '',
    suffix: '',
    label: 'Operational hubs',
    desc: 'Casablanca, Dakhla, Tanger, Laâyoune, Essaouira.',
  },
] as const

const cultureCards = [
  {
    key: 'sovereign',
    title: 'Sovereign by default',
    desc: 'We build infrastructure that Africa owns, operates and defends. Data, compute and energy stay on the continent — no foreign backdoors, no extractive terms. Sovereignty is not a marketing line, it is an engineering constraint.',
    icon: Shield,
  },
  {
    key: 'carbon-aware',
    title: 'Carbon-aware by design',
    desc: 'Every workload, every kilowatt, every cement pour is measured against a carbon budget. We do not buy offsets to feel better — we engineer the carbon out at the source, then verify with third-party LCA.',
    icon: Leaf,
  },
  {
    key: 'merit',
    title: 'Merit over tenure',
    desc: 'A 24-year-old engineer who ships a working carbon scheduler outranks a 50-year-old who has been planning one for two years. Titles are descriptive, not prescriptive. Promotions are based on shipped work, not politics.',
    icon: Target,
  },
  {
    key: 'build-50-years',
    title: 'Build for 50 years',
    desc: 'We are not building a flip. We are building the infrastructure layer that will still be operating in 2075. That means boring choices: redundant power, durable concrete, documented code, real operators.',
    icon: Building2,
  },
] as const

const hiringSteps = [
  {
    step: '01',
    title: 'Application',
    desc: 'Submit your CV and a 200-word note on why this specific role — not any role — is the right fit. Generic cover letters are filtered out.',
    icon: Fingerprint,
    duration: 'Day 0 → Day 3',
  },
  {
    step: '02',
    title: 'Screening call',
    desc: '30-minute call with the hiring manager. We discuss your track record, your motivation, and the realities of working in Dakhla or Casablanca.',
    icon: Crosshair,
    duration: 'Week 1',
  },
  {
    step: '03',
    title: 'Technical / case study',
    desc: 'Half-day deep dive: for engineers, a real production problem; for executives, a 90-day plan; for sales, a live account simulation. We pay for your time.',
    icon: Target,
    duration: 'Week 2 → Week 3',
  },
  {
    step: '04',
    title: 'Final & offer',
    desc: 'Meet 2-3 senior leaders, including the CEO of the relevant subsidiary. Reference checks, offer extended within 5 business days of the final round.',
    icon: Shield,
    duration: 'Week 4',
  },
] as const

const benefits = [
  {
    icon: TrendingUp,
    title: 'Equity for every role',
    desc: 'All full-time employees receive stock options vesting over 4 years. CEOs and C-suite receive meaningful equity aligned with $200M Series A valuation.',
  },
  {
    icon: Heart,
    title: 'Health insurance',
    desc: 'Comprehensive CNSS + private mutuelle covering employee, spouse, and children. Dental and optical included. Valid across Morocco and EU for business travel.',
  },
  {
    icon: GraduationCap,
    title: '$2K annual training',
    desc: 'Self-directed budget for conferences, certifications, courses, or GPU compute credits. No approval needed for amounts under $500.',
  },
  {
    icon: Wifi,
    title: 'Remote 2 days/week',
    desc: 'Hybrid policy for Casablanca-based roles. Dakhla and site-based roles are on-site by nature, with rotational travel covered.',
  },
  {
    icon: Banknote,
    title: 'Competitive base + bonus',
    desc: 'Salaries benchmarked against top Moroccan employers (OCP, INWI, banks) and indexed to inflation. Annual performance bonus up to 25% of base.',
  },
  {
    icon: Clock,
    title: 'Real work-life balance',
    desc: 'No hero culture. 40-hour week, on-call rotation compensated with time off. We hire enough people to avoid burnout cycles.',
  },
] as const

const departments: Array<{ key: 'All' | Department; label: string }> = [
  { key: 'All', label: 'All positions' },
  { key: 'Energy', label: 'Energy' },
  { key: 'Intelligence', label: 'Intelligence' },
  { key: 'Technology', label: 'Technology' },
  { key: 'Agriculture', label: 'Agriculture' },
  { key: 'Corporate', label: 'Corporate' },
]

const positions: Position[] = [
  {
    id: 'ceo-energy',
    title: 'CEO — Harch Energy',
    department: 'Energy',
    location: 'Casablanca, Morocco',
    type: 'CDI',
    salary: '600K MAD / year + equity',
    equity: true,
    description: [
      'Harch Energy is the renewable energy subsidiary of Harch Corp, mandated to build 5 GW of solar, wind and storage across Morocco by 2035. We currently operate 380 MW of contracted capacity and have a 2.1 GW pipeline under development across Dakhla, Laâyoune and Tanger.',
      'As CEO of Harch Energy, you will own the full P&L, the project pipeline, and the regulatory engagement with MASEN, ONEE, AMEE and the Ministry of Energy. You will report directly to the Harch Corp CEO and the Board, and sit on the Harch Corp executive committee.',
      'This is not a strategy role. It is a delivery role. We expect the CEO to close PPAs, break ground on new sites, and ship MW — not produce slideware. You will inherit a team of 38 and grow it to 200+ by 2030, with a focus on Moroccan engineering talent.',
      'You will also be the public face of Harch Energy with the Moroccan government, regulators, and international investors. Series A is closing in 2029; you will be a key participant in the roadshow and the post-money governance.',
    ],
    responsibilities: [
      'Own Harch Energy P&L, balance sheet, and capital allocation across development, construction and operating assets.',
      'Deliver 1.2 GW of new contracted capacity by 2030 — greenfield solar, wind, and BESS — on time and on budget.',
      'Lead regulatory and government engagement with MASEN, ONEE, AMEE, Ministry of Energy and regional wilayas.',
      'Negotiate utility and corporate PPAs with off-takers (OCP, Managem, LafargeHolcim, cement players, mining operators).',
      'Build and lead a 200-person team across development, EPC, O&M, finance and commercial — 90% Moroccan hires.',
      'Represent Harch Energy on the Harch Corp executive committee and at Series A/B investor roadshows.',
    ],
    requirements: [
      '15+ years in energy infrastructure, with at least 5 years in senior leadership (CEO, COO, VP Development or equivalent).',
      'Direct prior experience at MASEN, ONEE, ACWA Power, or comparable utility-scale renewable developer — minimum 1 GW of delivered projects on your track record.',
      'MBA or engineering degree from a recognized institution (Ecole Centrale, Hassania, INPT, HEC, London Business School).',
      'Fluent French and Arabic (classical + darija); professional English for board and investor interactions.',
      'Demonstrated track record of PPA negotiation, project finance structuring, and EPC contract management at scale.',
      'Existing network within the Moroccan industrial off-taker base (cement, mining, phosphate, agri-food).',
      'Comfortable with site-based work — at least 30% of time outside Casablanca, in Dakhla, Laâyoune and Tanger.',
    ],
    niceToHave: [
      'Prior C-suite role at a renewable IPP or developer that achieved a successful exit or strategic round.',
      'Hands-on experience with green hydrogen, ammonia, or desalination-coupled renewable projects.',
      'Relationships with development finance institutions (AfDB, IFC, EBRD, Proparco, KfW).',
      'Public-sector exposure (cabinet minister, agency director, or senior advisor).',
    ],
  },
  {
    id: 'ceo-intelligence',
    title: 'CEO — Harch Intelligence',
    department: 'Intelligence',
    location: 'Casablanca, Morocco',
    type: 'CDI',
    salary: '650K MAD / year + equity',
    equity: true,
    description: [
      'Harch Intelligence operates 1,798 GPUs across 5 carbon-aware hubs in Morocco — Dakhla (flagship, PUE 1.08), Tanger, Laâyoune, Essaouira and Casablanca. We serve sovereign AI workloads for African governments, financial institutions, and research labs that cannot — or will not — run on US/EU hyperscalers.',
      'As CEO, you will define the commercial strategy, the customer success motion, and the infrastructure investment roadmap. You inherit 1,798 GPUs live and a 6,400-GPU expansion plan funded by Series A. You will sign the next wave of customer contracts and own the unit economics.',
      'This is a hyperscaler-grade leadership role adapted to the African context. You will balance the operational discipline of AWS or Google Cloud with the political reality of sovereign clients — including defense, intelligence and central bank workloads.',
      'You will report to the Harch Corp CEO and Board, sit on the Harch Corp executive committee, and be a primary participant in the Series A investor roadshow. You will be expected to articulate the Harch Intelligence thesis to LPs, GPs and sovereign funds.',
    ],
    responsibilities: [
      'Own Harch Intelligence P&L, ARR growth, gross margin, and capacity utilization across 5 hubs.',
      'Sign and deliver on 4+ hyperscale customer contracts per year (>$5M ARR each) across sovereign, BFSI, research and enterprise segments.',
      'Drive the 6,400-GPU expansion plan — site selection, capex, vendor negotiation (NVIDIA, AMD, Supermicro), and commissioning.',
      'Build and lead a 150-person team across commercial, customer success, operations, and engineering — 90% Moroccan hires.',
      'Engage with hyperscaler partnerships (strategic reseller, capacity-sharing, edge federation) without compromising sovereignty commitment.',
      'Represent Harch Intelligence on the Harch Corp executive committee and at Series A/B investor roadshows.',
    ],
    requirements: [
      '15+ years in data center, cloud, or hyperscale infrastructure, with at least 5 years in senior P&L leadership.',
      'Direct prior experience at AWS, Google Cloud, Microsoft Azure, Equinix, Digital Realty, or comparable — at Director level or above.',
      'Track record of scaling infrastructure capacity by >100 MW or signing >$100M in new cloud/colo contracts.',
      'Fluent English (board, vendor, investor); working French; Arabic is a plus but not required.',
      'Demonstrated ability to manage both commercial (sales, contracts) and operational (DC ops, network, security) functions.',
      'Existing relationships with NVIDIA, AMD, or hyperscaler partnership teams.',
      'Bachelor\'s degree in engineering, computer science, or business; MBA preferred for non-engineering backgrounds.',
    ],
    niceToHave: [
      'Prior CTO or GM role at a sovereign cloud, government cloud, or defense-grade infrastructure provider.',
      'Hands-on experience with GPU clusters, RDMA networking, or AI workload scheduling (Kubernetes, Slurm).',
      'Experience leading a subsidiary through a successful Series A or B round.',
      'Network within African central banks, defense ministries, or sovereign wealth funds.',
    ],
  },
  {
    id: 'cto-corp',
    title: 'CTO — Harch Corp',
    department: 'Technology',
    location: 'Casablanca, Morocco',
    type: 'CDI',
    salary: '550K MAD / year + equity',
    equity: true,
    description: [
      'As CTO of Harch Corp (the holding), you will architect and lead HarchOS — the carbon-aware GPU scheduler, billing, customer portal and observability platform that powers Harch Intelligence and serves as the digital backbone across all subsidiaries (energy, cement, mining, agri, water, MRO).',
      'This is a hands-on leadership role. You will write architecture decision records, review critical pull requests, and own the technical strategy across a 200-engineer organization by 2030. You will define hiring standards, technology choices, and the security posture of the entire group.',
      'You will report directly to the Harch Corp CEO and be a primary technical voice in Series A and B investor discussions. Investors will want to understand why HarchOS is defensible — your job is to make it defensible and articulate why.',
      'You will also represent Harch Corp externally in technical forums, open-source communities, and with hyperscaler and vendor partners. Expect public speaking, technical blogging, and direct engagement with senior engineering leaders at NVIDIA, AMD, and major cloud providers.',
    ],
    responsibilities: [
      'Define and own the HarchOS technical architecture — carbon-aware scheduler, billing, customer portal, observability, security.',
      'Hire, mentor and retain a 200-engineer organization across infrastructure, platform, application and security teams by 2030.',
      'Set engineering culture: code review standards, on-call rotations, incident response, architecture review process.',
      'Own security and compliance posture — SOC 2 Type II, ISO 27001, GDPR, Moroccan Loi 09-08 — across all subsidiaries.',
      'Make and defend build-vs-buy decisions on critical platform components (scheduler, billing, IAM, observability).',
      'Be the primary technical interlocutor with investors, partners and customers at the C-suite level.',
    ],
    requirements: [
      '12+ years of full-stack engineering experience, with at least 5 years at staff, principal or CTO level.',
      'Direct prior experience at Stripe, Datadog, Cloudflare, AWS, Google Cloud, or comparable platform company — at senior engineering or engineering leadership level.',
      'Deep hands-on knowledge of distributed systems, billing platforms, multi-tenant SaaS architecture and Kubernetes at scale.',
      'Demonstrated track record of scaling an engineering organization from 30 to 200+ engineers without losing velocity or culture.',
      'Fluent English (technical and executive); working French. Arabic not required but a plus.',
      'Bachelor\'s or Master\'s degree in computer science, engineering, or equivalent demonstrated experience.',
      'Public technical presence: GitHub, conference talks, technical blog, or open-source contributions.',
    ],
    niceToHave: [
      'Prior CTO or VP Engineering role at a venture-backed company that raised Series A or beyond.',
      'GPU, CUDA, or AI workload scheduling expertise (Slurm, Ray, Kubernetes operators).',
      'Experience with carbon-aware computing, green software engineering, or grid-intensity APIs.',
      'Active security clearance or willingness to obtain one for sovereign workloads.',
    ],
  },
  {
    id: 'gpu-infra-eng',
    title: 'Senior GPU Infrastructure Engineer',
    department: 'Intelligence',
    location: 'Dakhla, Morocco (on-site)',
    type: 'CDI',
    salary: '380K MAD / year',
    equity: false,
    description: [
      'You will be a senior member of the on-site operations team at our Dakhla flagship facility — 1.08 PUE, 320 MW IT load, 1,798 GPUs (H100/H200/MI300X). This is not a remote-friendly role: we need someone physically in Dakhla, on the data center floor, daily.',
      'You will own GPU cluster operations: provisioning, monitoring, troubleshooting, capacity planning, and on-call response. You will work closely with the carbon-aware scheduler team in Casablanca to tune workload placement based on real-time grid carbon intensity.',
      'The role requires deep Linux and networking expertise (RDMA, RoCE, InfiniBand), CUDA-level understanding of GPU failures, and the operational discipline of a senior SRE. Expect to write runbooks, post-mortems, and capacity-planning docs — not just patch scripts.',
      'Dakhla is a 4-hour drive from Laâyoune and a 2-hour flight from Casablanca. We provide relocation assistance, housing allowance, and 6 round-trip flights per year to your home city. Spousal and family relocation supported.',
    ],
    responsibilities: [
      'Own day-to-day GPU cluster operations at Dakhla: provisioning, monitoring, incident response, capacity planning.',
      'Tune CUDA kernels, NCCL collectives, and RDMA/RoCE networking for ML training and inference workloads.',
      'Lead post-mortems on GPU failures, network incidents, and cooling/power events. Write runbooks for repeatable operations.',
      'Participate in on-call rotation (1 week out of 4) — paid on-call compensation, comp time for night escalations.',
      'Work with the Casablanca scheduler team to implement carbon-aware workload placement based on grid intensity signals.',
      'Drive capacity planning for the 6,400-GPU expansion: rack layouts, power budget, cooling load, network topology.',
    ],
    requirements: [
      '7+ years of hands-on GPU, HPC, or data center operations experience at scale (≥256 GPUs managed).',
      'Direct prior experience at NVIDIA, AMD, a national lab, a hyperscaler, or a top-tier AI startup — minimum 3 years.',
      'Deep Linux expertise (systemd, cgroups, perf, eBPF), Python and Bash scripting, infrastructure-as-code (Terraform/Ansible).',
      'Production experience with RDMA, RoCE, or InfiniBand networking. You can debug a slow collective without ping-ponging to the network team.',
      'CUDA-level understanding of GPU failures — you can read nvidia-smi, dmesg and XID errors and know what to do.',
      'Willingness to relocate to Dakhla, Morocco, for a minimum 2-year commitment. Relocation package provided.',
      'Fluent French or English. Arabic (darija) strongly preferred for site operations and local vendor management.',
    ],
    niceToHave: [
      'Production experience with Slurm, Kubernetes (Volcano/Kueue), or Ray for ML workload orchestration.',
      'Prior experience with liquid cooling, immersion cooling, or direct-to-chip cooling at scale.',
      'Hands-on experience with H100/H200/MI300X specifically — you know the failure modes by heart.',
      'SCADA or OT networking experience (relevant to our solar/wind integration at the Dakhla site).',
    ],
  },
  {
    id: 'carbon-scheduler-eng',
    title: 'Carbon-Aware Scheduler Engineer',
    department: 'Technology',
    location: 'Casablanca, Morocco',
    type: 'CDI',
    salary: '320K MAD / year',
    equity: false,
    description: [
      'You will design and build the carbon-aware workload scheduler at the heart of HarchOS — the system that routes AI training and inference jobs across our 5 hubs based on real-time grid carbon intensity, hub PUE, renewable availability, and SLA constraints.',
      'This is a foundational engineering role. The scheduler is the technical moat of Harch Intelligence — what allows us to claim 47 gCO2/kWh blended carbon intensity versus 400-500 gCO2/kWh for a typical European hyperscaler. Investors, customers and auditors will scrutinize this code.',
      'You will own the scheduler end-to-end: the algorithms (multi-objective optimization under SLA constraints), the data pipelines (grid intensity from ENTSO-E, ONEE, RTE, WattTime), the APIs (Kubernetes scheduler extender, Slurm plugin, REST/GraphQL), and the observability (carbon accounting per job, per customer, per hub).',
      'You will work from our Casablanca office (hybrid 2 days/week remote), embedded with the platform engineering team and reporting to the Head of Platform. Expect to ship to production in your first 90 days.',
    ],
    responsibilities: [
      'Design and implement the carbon-aware workload scheduler — multi-objective optimization under SLA, cost and carbon constraints.',
      'Build and operate the grid carbon intensity data pipeline — ingest from ONEE (Morocco), ENTSO-E (EU), RTE (France), WattTime (global), with sub-hour granularity.',
      'Define and ship the scheduler APIs — Kubernetes scheduler extender, Slurm plugin, REST/GraphQL for customer integrations.',
      'Implement per-job, per-customer, per-hub carbon accounting — auditable, exportable, compatible with GHG Protocol Scope 2/3 reporting.',
      'Build observability dashboards (Grafana) for scheduler decisions, deferral rates, carbon savings and SLA adherence.',
      'Participate in on-call rotation for the scheduler service (1 week out of 6).',
    ],
    requirements: [
      '5+ years of software engineering experience, with at least 2 years in distributed systems, scheduling, or platform engineering.',
      'Expert Python (3.11+) and Rust (1.70+). You can write a correct async Rust service and a maintainable Python pipeline.',
      'Production experience with Kubernetes — you have written a controller, an operator, or a scheduler plugin before.',
      'Solid grasp of optimization techniques — linear programming, constraint satisfaction, or heuristic search applied to real problems.',
      'Experience building and operating data pipelines (Kafka, Pulsar, or equivalent) with strong data-quality discipline.',
      'Bachelor\'s or Master\'s degree in computer science, engineering, mathematics, or physics.',
      'Fluent English (technical); working French. Arabic not required.',
    ],
    niceToHave: [
      'Prior work on carbon-aware computing, green software engineering, or grid-intensity APIs (WattTime, Electricity Maps, Green Software Foundation).',
      'Experience with ML workload orchestration — Slurm, Ray, Volcano, Kueue, or similar.',
      'Contributions to open-source projects in the cloud-native or sustainability space.',
      'Familiarity with GHG Protocol, SBTi, or CDP reporting frameworks.',
    ],
  },
  {
    id: 'b2b-sales-solar',
    title: 'B2B Sales Manager — Solar',
    department: 'Energy',
    location: 'Casablanca, Morocco',
    type: 'CDI',
    salary: '300K MAD / year + commission',
    equity: false,
    description: [
      'You will drive B2B solar sales to industrial off-takers across Morocco — cement (LafargeHolcim, Ciments du Maroc), mining (OCP, Managem), agri-food (Lesieur, Centrale Laitière), and MRO/industrial groups. The product is utility-scale solar PPAs (10-100 MW) and behind-the-meter solar+storage.',
      'You will own the full sales cycle — from lead generation and qualification to PPA structuring, negotiation, signature and handover to the EPC team. Your 18-month quota is 500 MW of signed PPAs (roughly $400M in contract value), with a 1.2% commission on contracted revenue.',
      'This is a senior individual contributor role with no direct reports initially — but with a clear path to building a 4-person sales team by 2027. You will work closely with Harch Energy\'s CEO, the development team and the project finance team.',
      'You will be based in Casablanca, with an estimated 40% travel across Morocco (mostly to industrial sites in Tanger, Casablanca, Jorf Lasfar, Safi, Laâyoune, and Dakhla). Company car or mileage reimbursement provided.',
    ],
    responsibilities: [
      'Build and own a 500-MW / 18-month PPA pipeline across cement, mining, agri-food and industrial off-takers.',
      'Run the full sales cycle: lead gen, qualification, technical scoping with EPC, PPA structuring with finance, negotiation, signature.',
      'Maintain CRM hygiene (HubSpot) — pipeline reviews, forecast calls, deal reviews with the CEO of Harch Energy.',
      'Develop strategic accounts into multi-site frameworks — convert one-off PPAs into 5-10 year preferred supplier agreements.',
      'Coordinate with regulatory affairs on grid connection, permits, and PPA registration with ANRE and ONEE.',
      'Represent Harch Energy at industry events (Pollutec Morocco, SIE, Maroc Environement) and customer conferences.',
    ],
    requirements: [
      '10+ years of B2B industrial sales experience in Morocco, selling capital equipment, energy, or industrial services.',
      'Existing, demonstrable network in the Moroccan industrial sector — at least 20 senior decision-maker relationships you can name and call.',
      'Fluent French and Arabic (darija + classical); working English for internal coordination with Harch Corp.',
      'Track record of closing deals >100M MAD (≈ $10M) — at least 5 such deals in the last 5 years.',
      'Understanding of PPA structuring (fixed-price, indexed, pay-as-produced, virtual PPA) and project finance basics.',
      'Willingness to travel 40% of time across Morocco, including remote sites (Dakhla, Laâyoune, Tanger).',
      'Bachelor\'s degree in business, engineering, or equivalent; MBA a plus but not required.',
    ],
    niceToHave: [
      'Prior experience selling utility-scale solar, wind, or storage PPAs in Morocco or North Africa.',
      'Existing relationships with procurement and operations directors at OCP, Managem, LafargeHolcim, Ciments du Maroc, or Lesieur.',
      'Experience with green hydrogen, desalination-coupled renewables, or industrial microgrids.',
      'Prior employment at ONEE, MASEN, AMEE, or a major Moroccan IPP (Nareva, ACWA, TAQA Morocco).',
    ],
  },
  {
    id: 'aquaculture-ops',
    title: 'Aquaculture Operations Manager',
    department: 'Agriculture',
    location: 'Dakhla, Morocco (on-site)',
    type: 'CDI',
    salary: '280K MAD / year',
    equity: false,
    description: [
      'You will lead the conchyliculture (oyster and mussel farming) operations in Dakhla bay — currently 200 tons/year, scaling to 1,500 tons/year by 2030 as part of Harch Corp\'s aquaculture vertical. The operation includes a hatchery, nurseries, grow-out longlines, and a processing/packing facility.',
      'This is a hands-on operational role. You will live in Dakhla, manage a 50-person team (75% local hires from Dakhla and the southern provinces), and report to the Head of Agriculture at Harch Corp. Expect to be on the water, in the hatchery, and in the processing plant — weekly.',
      'You will own production planning, hatchery performance, grow-out yields, quality control (ISO 22000, BRC), and export certification (EU, UK, Asia). You will also manage environmental compliance with the Dakhla-Oued Ed-Dahab regional authority and the National Fisheries Office (ONP).',
      'Dakhla is one of the best sites in Africa for shellfish aquaculture — cold upwelling currents, low pollution, year-round growing season. Our 2030 vision is to make Harch Corp the largest premium oyster producer in Africa, exporting to EU and Asian markets.',
    ],
    responsibilities: [
      'Own end-to-end production: hatchery, nursery, grow-out, harvesting, grading, packing — targeting 1,500 tons/year by 2030.',
      'Manage and develop a 50-person operational team, 75% local hires from Dakhla and southern provinces. Build a training pipeline for hatchery technicians and farm operators.',
      'Drive quality and certification — ISO 22000, BRC, EU export approval, HACCP — with a target of zero non-conformities on third-party audits.',
      'Manage environmental compliance with ONP, regional fisheries authority, and the Dakhla-Oued Ed-Dahab wilaya.',
      'Lead capex projects — new longlines, hatchery expansion, processing plant upgrades, cold chain improvements.',
      'Build and maintain customer relationships with EU importers (France, Spain, Italy), UK buyers, and Asian distributors.',
    ],
    requirements: [
      '8+ years of hands-on experience in aquaculture, with at least 5 years in conchyliculture (oysters, mussels, clams).',
      'Demonstrated production track record — you have managed a site producing >200 tons/year and shipped to export markets.',
      'Deep knowledge of hatchery operations — larval rearing, settling, nursery management, broodstock selection.',
      'Familiarity with EU export regulations (Regulation 853/2004, 854/2004), HACCP, ISO 22000, and BRC standards.',
      'Fluent French; working English for export customers. Arabic (darija) strongly preferred for local team management.',
      'Willingness to relocate to Dakhla, Morocco, for a minimum 3-year commitment. Relocation package provided.',
      'Bachelor\'s degree in aquaculture, marine biology, or equivalent demonstrated experience.',
    ],
    niceToHave: [
      'Prior experience building a hatchery from scratch or scaling an existing one by >3x.',
      'Existing relationships with EU shellfish importers (France, Spain, Italy) or Asian distributors (Hong Kong, Singapore, Japan).',
      'Experience with integrated multi-trophic aquaculture (IMTA) or seaweed cultivation as a complementary crop.',
      'Prior management experience in the Dakhla bay or broader southern Morocco context.',
    ],
  },
  {
    id: 'esg-director',
    title: 'ESG & Sustainability Director',
    department: 'Corporate',
    location: 'Casablanca, Morocco',
    type: 'CDI',
    salary: '380K MAD / year',
    equity: false,
    description: [
      'As ESG & Sustainability Director, you will own the sustainability strategy, carbon accounting, and ESG reporting across all Harch Corp subsidiaries — Harch Intelligence (1,798 GPUs, 5 hubs), Harch Energy (5 GW pipeline), cement, mining, agri, water, MRO and finance.',
      'This is a group-level role reporting directly to the Harch Corp CEO. You will sit on the executive committee, lead the ESG committee, and be a primary interlocutor with Series A investors on ESG due diligence. Investors increasingly screen for SBTi, GRI, TCFD and EU SFDR alignment — your job is to make Harch Corp pass that screen with distinction.',
      'You will drive the carbon accounting (Scope 1, 2, 3) across all subsidiaries, submit our SBTi commitment letter (1.5°C pathway), publish the annual sustainability report (GRI + TCFD + IFRS S2 aligned), and run the community impact programs in Dakhla, Laâyoune, and Essaouira.',
      'You will also engage with rating agencies (Sustainalytics, MSCI ESG, ISS ESG), DFIs (IFC, AfDB, EBRD), and Moroccan regulators (AMEE, Ministry of Energy) on ESG positioning. Expect to travel ~25% (mostly within Morocco, 4-6 international trips per year for conferences and investor DD).',
    ],
    responsibilities: [
      'Own group-wide carbon accounting — Scope 1, 2, 3 — across all subsidiaries. Implement a software platform (Persefoni, Watershed, or equivalent) by end of 2026.',
      'Submit and validate the SBTi commitment letter — 1.5°C pathway, with near-term (2030) and net-zero (2050) targets across Scope 1, 2, 3.',
      'Publish the annual Harch Corp sustainability report — GRI Universal, TCFD, IFRS S2, and aligned with EU CSRD where applicable.',
      'Lead ESG due diligence with Series A investors — manage data room, respond to queries, host site visits.',
      'Design and operate community impact programs in Dakhla, Laâyoune and Essaouira — local employment, training, supplier development, infrastructure investment.',
      'Engage with ESG rating agencies (Sustainalytics, MSCI, ISS), DFIs (IFC, AfDB, EBRD, Proparco) and Moroccan regulators (AMEE).',
    ],
    requirements: [
      '10+ years of ESG, sustainability, or corporate responsibility experience, with at least 5 years in a senior role at a listed company, IPP, or DFI.',
      'Demonstrated expertise with ISO 14001, LEED, BREEAM, and comparable certification schemes — you have led at least 3 certifications end-to-end.',
      'Hands-on experience with GRI, TCFD, IFRS S2/SASB reporting frameworks — you have authored a published sustainability report.',
      'Track record of submitting and validating SBTi commitments (near-term and net-zero) for a complex multi-subsidiary organization.',
      'Fluent English (investor and DFI interactions) and French. Arabic a plus for Moroccan regulator engagement.',
      'Bachelor\'s or Master\'s degree in environmental science, engineering, sustainability, or business with sustainability focus.',
      'Willingness to travel ~25% — mostly within Morocco (Dakhla, Laâyoune, Tanger, Essaouira), 4-6 international trips per year.',
    ],
    niceToHave: [
      'Prior experience with green bond issuance, sustainability-linked loans, or blended finance structures.',
      'Existing relationships with Sustainalytics, MSCI ESG, ISS ESG, or comparable rating agencies.',
      'Prior Chief Sustainability Officer or ESG Director role at a renewable energy company, IPP, or infrastructure group.',
      'Experience with biodiversity reporting (TNFD) or human rights due diligence (CSDDD, UNGPs).',
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*                              Helpers / UI                                  */
/* -------------------------------------------------------------------------- */

function departmentBadgeColor(dept: Department): string {
  switch (dept) {
    case 'Energy':
      return 'border-amber-400/30 bg-amber-400/10 text-amber-200'
    case 'Intelligence':
      return 'border-[#8B9DAF]/30 bg-[#8B9DAF]/10 text-[#8B9DAF]'
    case 'Technology':
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
    case 'Corporate':
      return 'border-zinc-400/30 bg-zinc-400/10 text-zinc-200'
    case 'Agriculture':
      return 'border-lime-400/30 bg-lime-400/10 text-lime-200'
    default:
      return 'border-zinc-400/30 bg-zinc-400/10 text-zinc-200'
  }
}

function BulletList({
  items,
  variant = 'default',
}: {
  items: string[]
  variant?: 'default' | 'nice'
}) {
  return (
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2.5 text-[13px] leading-relaxed">
          <span
            className={cn(
              'mt-1 shrink-0',
              variant === 'nice' ? 'text-[#8B9DAF]/60' : 'text-[#8B9DAF]'
            )}
          >
            {variant === 'nice' ? (
              <Sparkles className="h-3 w-3" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
          </span>
          <span
            className={variant === 'nice' ? 'text-zinc-400' : 'text-zinc-300'}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  )
}

function DepartmentIcon({
  dept,
  className,
}: {
  dept: Department
  className?: string
}) {
  switch (dept) {
    case 'Energy':
      return <Sun className={className} />
    case 'Intelligence':
      return <Server className={className} />
    case 'Technology':
      return <Cpu className={className} />
    case 'Agriculture':
      return <Leaf className={className} />
    case 'Corporate':
      return <Building2 className={className} />
    default:
      return <Briefcase className={className} />
  }
}

function PositionCard({ position }: { position: Position }) {
  return (
    <AccordionItem
      value={position.id}
      className="overflow-hidden rounded-xl border border-white/8 bg-[#131316] transition-colors hover:border-white/12 data-[state=open]:border-[#8B9DAF]/30"
    >
      <AccordionTrigger className="px-5 py-4 hover:no-underline">
        <div className="flex w-full flex-col gap-3 text-left md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#8B9DAF]/10 text-[#8B9DAF]">
                <DepartmentIcon dept={position.department} className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-[15px] font-semibold text-white">
                {position.title}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                  departmentBadgeColor(position.department)
                )}
              >
                {position.department}
              </span>
              {position.equity && (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-400/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                  <TrendingUp className="h-3 w-3" /> Equity
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-zinc-400">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {position.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> {position.type}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[12px] text-[#8B9DAF]">
                <Banknote className="h-3 w-3" /> {position.salary}
              </span>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-5 pb-6 pt-2">
        <div className="space-y-6">
          {/* Description */}
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF]">
              The role
            </p>
            <div className="space-y-3">
              {position.description.map((para, idx) => (
                <p
                  key={idx}
                  className="text-[13.5px] leading-[1.75] text-zinc-300"
                >
                  {para}
                </p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 border-t border-white/6 pt-6 lg:grid-cols-2">
            {/* Responsibilities */}
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF]">
                Responsibilities
              </p>
              <BulletList items={position.responsibilities} />
            </div>

            {/* Requirements */}
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF]">
                Requirements
              </p>
              <BulletList items={position.requirements} />
            </div>
          </div>

          {/* Nice to have */}
          <div className="border-t border-white/6 pt-6">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF]/70">
              Nice to have
            </p>
            <BulletList items={position.niceToHave} variant="nice" />
          </div>

          {/* Benefits strip */}
          <div className="flex flex-wrap gap-2 border-t border-white/6 pt-6">
            {[
              { icon: TrendingUp, label: 'Equity participation' },
              { icon: Heart, label: 'Health insurance' },
              { icon: GraduationCap, label: '$2K training/year' },
              { icon: Wifi, label: 'Remote 2 days/week' },
            ].map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-300"
              >
                <b.icon className="h-3 w-3 text-[#8B9DAF]" />
                {b.label}
              </span>
            ))}
          </div>

          {/* Apply CTA */}
          <div className="flex flex-col items-start gap-3 border-t border-white/6 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] text-zinc-500">
              Reference:{' '}
              <span className="font-mono text-zinc-300">
                HARCH-{position.id.toUpperCase()}
              </span>
            </p>
            <Button
              asChild
              size="sm"
              className="bg-[#8B9DAF] text-[#0D0D0D] hover:bg-[#8B9DAF]/85"
            >
              <a
                href={`mailto:careers@harchcorp.com?subject=Application — ${position.title} (HARCH-${position.id.toUpperCase()})`}
              >
                Apply for this role
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Page body                                   */
/* -------------------------------------------------------------------------- */

export default function CareersPageClient() {
  const [activeDept, setActiveDept] = React.useState<'All' | Department>('All')

  const filteredPositions = React.useMemo(() => {
    if (activeDept === 'All') return positions
    return positions.filter((p) => p.department === activeDept)
  }, [activeDept])

  return (
    <main className="flex min-h-screen flex-col bg-[#0D0D0D] text-zinc-100">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-white/6 bg-[#0D0D0D] pb-20 pt-32 md:pb-28 md:pt-40">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[#8B9DAF]/8 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-400/5 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Badge
              variant="outline"
              className="mb-6 border-[#8B9DAF]/30 bg-[#8B9DAF]/10 text-[#8B9DAF]"
            >
              <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-[#8B9DAF]" />
              Careers · 8 open positions · Series A 2029
            </Badge>
            <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[64px]">
              Build Africa&apos;s infrastructure.
              <br />
              <span className="text-[#8B9DAF]">Join Harch Corp.</span>
            </h1>
            <div className="mt-6 h-px w-16 bg-[#8B9DAF]" />
            <p className="mt-6 max-w-2xl text-base leading-[1.7] text-zinc-400 sm:text-lg">
              We are hiring 8 senior roles to close our $200M Series A and deliver
              5 GW of solar, 1,798 GPUs of carbon-aware compute, and 1,500 tons of
              premium oysters — all by 2030. Most of these roles did not exist 24
              months ago. Most will not exist anywhere else in Africa.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="bg-[#8B9DAF] text-[#0D0D0D] hover:bg-[#8B9DAF]/85"
              >
                <a href="#open-positions">
                  View open positions
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/5"
              >
                <a href="mailto:careers@harchcorp.com">
                  Send a general application
                </a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Stats                                                            */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-white/6 bg-[#0F0F0F] py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF]">
              The mission
            </p>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white md:text-4xl">
              3,200 direct jobs in Morocco by 2030.
              <br />
              <span className="text-zinc-500">
                90% locally hired. Trained for life.
              </span>
            </h2>
          </FadeIn>

          <StaggerContainer
            className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            staggerDelay={0.07}
          >
            {heroStats.map((s) => (
              <StaggerItem key={s.label}>
                <div className="h-full rounded-xl border border-white/8 bg-[#131316] p-6">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#8B9DAF]/10 text-[#8B9DAF]">
                    <s.icon className="h-4 w-4" />
                  </span>
                  <p className="mt-4 font-mono text-4xl font-semibold tracking-tight text-white tabular-nums">
                    <CountUp
                      to={s.value}
                      prefix={s.prefix}
                      suffix={s.suffix}
                      duration={1.8}
                    />
                  </p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    {s.label}
                  </p>
                  <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
                    {s.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Culture & values                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-white/6 bg-[#0D0D0D] py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF]">
              Culture & values
            </p>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white md:text-4xl">
              Four principles that decide who stays.
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-400">
              Harch Corp is not for everyone. We work in remote sites, we ship
              infrastructure that lasts 50 years, and we answer to sovereign
              clients who do not tolerate posturing. If these principles do not
              resonate, this is not the right place for you.
            </p>
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            {cultureCards.map((c, i) => (
              <FadeIn key={c.key} delay={i * 0.08}>
                <div className="h-full rounded-xl border border-white/8 bg-[#131316] p-7">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#8B9DAF]/15 bg-[#8B9DAF]/8 text-[#8B9DAF]">
                      <c.icon className="h-4 w-4" />
                    </span>
                    <h3 className="text-lg font-bold text-white">{c.title}</h3>
                  </div>
                  <div className="mt-5 h-px w-10 bg-[#8B9DAF]" />
                  <p className="mt-5 text-[13.5px] leading-[1.75] text-zinc-400">
                    {c.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Open positions                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section
        id="open-positions"
        className="scroll-mt-24 border-b border-white/6 bg-[#0F0F0F] py-20 md:py-28"
      >
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF]">
              Open positions
            </p>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl">
                8 senior roles. Series A 2029.
              </h2>
              <p className="max-w-md text-[14px] leading-relaxed text-zinc-400">
                Filter by department, expand a role to read the full brief, and
                apply directly to{' '}
                <a
                  href="mailto:careers@harchcorp.com"
                  className="text-[#8B9DAF] underline-offset-4 hover:underline"
                >
                  careers@harchcorp.com
                </a>
                .
              </p>
            </div>
          </FadeIn>

          {/* Filter bar */}
          <FadeIn delay={0.05}>
            <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-white/6 pb-6">
              <span className="mr-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <LayoutGrid className="h-3.5 w-3.5" /> Filter
              </span>
              {departments.map((d) => {
                const isActive = activeDept === d.key
                const count =
                  d.key === 'All'
                    ? positions.length
                    : positions.filter((p) => p.department === d.key).length
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setActiveDept(d.key)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                      isActive
                        ? 'border-[#8B9DAF]/30 bg-[#8B9DAF]/12 text-[#8B9DAF]'
                        : 'border-white/6 bg-transparent text-zinc-500 hover:border-white/12 hover:text-zinc-300'
                    )}
                  >
                    {d.label}
                    <span
                      className={cn(
                        'rounded px-1 text-[9px] tabular-nums',
                        isActive
                          ? 'bg-[#8B9DAF]/20 text-[#8B9DAF]'
                          : 'bg-white/5 text-zinc-500'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </FadeIn>

          {/* Positions accordion list */}
          <div className="mt-8">
            <Accordion
              type="single"
              collapsible
              defaultValue={positions[0]?.id}
              className="space-y-3"
            >
              {filteredPositions.map((position, i) => (
                <FadeIn key={position.id} delay={i * 0.04}>
                  <PositionCard position={position} />
                </FadeIn>
              ))}
            </Accordion>

            {filteredPositions.length === 0 && (
              <div className="rounded-xl border border-white/8 bg-[#131316] p-10 text-center">
                <p className="text-sm text-zinc-400">
                  No open positions in this department right now. Send us a
                  general application — we hire for talent before we hire for
                  roles.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Hiring process                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-white/6 bg-[#0D0D0D] py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF]">
              Hiring process
            </p>
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl">
              4 steps. 4 weeks. No ghosting.
            </h2>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-zinc-400">
              We respect your time. Every applicant gets a response within 5
              business days of every step. We pay for case studies at consultant
              rates. We do not run more than 4 rounds.
            </p>
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {hiringSteps.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.08}>
                <div className="relative h-full rounded-xl border border-white/8 bg-[#131316] p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF]/50">
                      Phase {step.step}
                    </span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#8B9DAF]/15 bg-[#8B9DAF]/8 text-[#8B9DAF]">
                      <step.icon className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-white">
                    {step.title}
                  </h3>
                  <div className="mt-3 h-px w-8 bg-[#8B9DAF]" />
                  <p className="mt-3 text-[13px] leading-[1.7] text-zinc-400">
                    {step.desc}
                  </p>
                  <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    <Clock className="h-3 w-3" /> {step.duration}
                  </p>
                  {i < hiringSteps.length - 1 && (
                    <span
                      className="absolute right-[-10px] top-1/2 hidden h-px w-5 -translate-y-1/2 bg-white/8 lg:block"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Benefits                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-white/6 bg-[#0F0F0F] py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF]">
              What you get
            </p>
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl">
              Real compensation. Real benefits. No perks theater.
            </h2>
            <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-zinc-400">
              Every full-time employee — from site operator to CEO — gets the
              same baseline package. Equity, health, training, hybrid work. We
              index salaries to inflation and benchmark against the top of the
              Moroccan market.
            </p>
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <FadeIn key={b.title} delay={i * 0.06}>
                <div className="h-full rounded-xl border border-white/8 bg-[#131316] p-6">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/6 text-white">
                    <b.icon className="h-4 w-4" />
                  </span>
                  <h4 className="mt-4 text-[14px] font-bold text-white">
                    {b.title}
                  </h4>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-zinc-400">
                    {b.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CTA                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#000000] py-24 md:py-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,157,175,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,157,175,0.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-[900px] px-4 text-center sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              Don&apos;t see your role?
              <br />
              <span className="text-[#8B9DAF]">Send us your work.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-zinc-500">
              We hire for talent before we hire for roles. If you have shipped
              something we should know about — a carbon scheduler, a 100 MW
              solar plant, a working hatchery — write to us. We will find a seat.
            </p>
            <p className="mt-4 font-mono text-[13px] text-zinc-500">
              General applications:{' '}
              <a
                href="mailto:careers@harchcorp.com"
                className="text-[#8B9DAF] underline-offset-4 hover:underline"
              >
                careers@harchcorp.com
              </a>
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-[#8B9DAF] text-[#0D0D0D] hover:bg-[#8B9DAF]/85"
              >
                <a href="mailto:careers@harchcorp.com?subject=General application — Harch Corp">
                  Send a general application
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/5"
              >
                <Link href="/">
                  About Harch Corp
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Footer                                                           */}
      {/* ---------------------------------------------------------------- */}
      <footer className="mt-auto border-t border-white/8 bg-[#0D0D0D] px-4 py-8 text-center text-xs text-zinc-600 sm:px-6">
        <div className="mx-auto max-w-[1200px]">
          © 2029 Harch Corp · Series A · Casablanca, Dakhla, Tanger, Laâyoune,
          Essaouira · Powered by Moroccan sun and wind
        </div>
      </footer>
    </main>
  )
}
