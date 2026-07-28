'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ArrowRight, Cpu, Zap, Globe, Server, Shield, BarChart3, Wind, Droplets, Satellite, Lock, Eye, Factory, Mountain, Wheat, Waves, MapPin, Calendar, TrendingUp, Leaf } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import dynamic from 'next/dynamic';

import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  Card3D,
  MagneticButton,
  SmoothLink,
  TextReveal,
  SectionDivider,
  CountUp,
  ParallaxSection,
} from '@/components/ui/motion';

const InteractivePlatform = dynamic(
  () => import('@/components/InteractivePlatform').then((mod) => mod.InteractivePlatform),
  { ssr: false, loading: () => <div className="h-[600px] bg-[#0A0A0A] animate-pulse" /> }
);

const NetworkGrid = dynamic(
  () => import('@/components/NetworkGrid').then((mod) => mod.NetworkGrid),
  { ssr: false }
);
import CompetitiveComparison from '@/components/competitive/CompetitiveComparison';
import type { Competitor } from '@/components/competitive/CompetitiveComparison';
import { VideoPlayer } from '@/components/VideoPlayer';

/* ═══════════════════════════════════════════════════════════════
   ACCENT COLOR MAP — per subsidiary
   ═══════════════════════════════════════════════════════════════ */
const accentMap: Record<string, string> = {
  intelligence: '#8B9DAF',
  cement: '#8B9DAF',
  energy: '#8B9DAF',
  technology: '#8B9DAF',
  mining: '#8B9DAF',
  agriculture: '#4A7B5F',
  water: '#8B9DAF',
};

/* ═══════════════════════════════════════════════════════════════
   VIDEO MAP — per subsidiary teaser (40s)
   ═══════════════════════════════════════════════════════════════ */
const subsidiaryVideoMap: Record<string, string> = {
  intelligence: '/videos/v4_intelligence.mp4',
  cement: '/videos/v7_cement.mp4',
  energy: '/videos/v5_energy.mp4',
  technology: '/videos/v10_technology.mp4',
  mining: '/videos/v6_mining.mp4',
  water: '/videos/v9_water.mp4',
};

/* ═══════════════════════════════════════════════════════════════
   STAT BAR — uses shared design tokens
   ═══════════════════════════════════════════════════════════════ */
function StatBar({ stat, value, max, accent }: { stat: string; value: number; max: number; accent: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <div ref={ref} className="mb-5">
      <div className="flex justify-between mb-2">
        <span className="text-[12px] text-[#999999]">{stat}</span>
        <span className="text-[12px] font-bold text-white">{value}%</span>
      </div>
      <div className="h-1 bg-[#0D0D0D] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-[2s] ease-out"
          style={{
            width: isInView ? `${(value / max) * 100}%` : '0%',
            backgroundColor: accent,
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
type IconType = React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

interface SubsidiaryInfo {
  name: string; version: string; heroTitle: string; heroSubtitle: string; heroImage: string;
  sectionImage1: string; sectionImage2: string; sectionImage3: string; sectionImage4: string;
  overview: string; strategicContext: string; marketAnalysis: string; sustainability: string;
  investment: string;
  metrics: { value: number; prefix: string; suffix: string; label: string }[];
  capabilities: { icon: IconType; title: string; desc: string }[];
  specTable: { spec: string; value: string; phase: string }[];
  milestones: { year: string; title: string; desc: string }[];
  stats: { stat: string; value: number; max: number }[];
  location: string; locationDesc: string;
  strategicAdvantages: { title: string; desc: string }[];
  partnershipModel: { title: string; desc: string }[];
  competitors?: Competitor[];
  competitorHarchName?: string;
  competitorAccentColor?: string;
}

/* ═══════════════════════════════════════════════════════════════
   SUBSIDIARY DATA — all 7 subsidiaries preserved
   ═══════════════════════════════════════════════════════════════ */
export default function SubsidiaryPageClient({ slug }: { slug: string }) {
  const subsidiaryData: Record<string, SubsidiaryInfo> = {
    intelligence: {
      name: 'Harch Intelligence', version: '/0.1',
      heroTitle: "Africa's Largest AI\nHyperscale Data Center",
      heroSubtitle: '1,798 carbon-optimized GPUs across 5 hubs — sovereign AI compute infrastructure powered by Africa\'s lowest-carbon electricity',
      heroImage: '/images/sections/intelligence-exterior.jpg',
      sectionImage1: '/images/sections/intelligence-rack.jpg',
      sectionImage2: '/images/sections/intelligence-gpu-cluster.jpg',
      sectionImage3: '/images/sections/intelligence-cooling.jpg',
      sectionImage4: '/images/sections/intelligence-submarine.jpg',
      overview: 'Harch Intelligence deploys 1,798 carbon-optimized GPUs  across 5 hubs in Morocco — powered primarily by renewable energy and designed to serve as the backbone of Africa\'s sovereign AI compute infrastructure. With carbon-aware scheduling as our #1 differentiator, we route workloads to the greenest hubs in real time, achieving an average carbon intensity of 48.2 gCO2/kWh — 89% below the industry average. Our 500MW Pipeline expands capacity at Dakhla with direct submarine cable connectivity to Europe and the Americas. This is not merely a data center — it is the foundation of Africa\'s digital sovereignty, ensuring that the continent\'s data, compute, and AI capabilities remain under African control.',
      strategicContext: 'The global AI infrastructure race is accelerating, with over $300 billion invested in data center capacity in 2024 alone. Yet Africa, home to 1.4 billion people and the world\'s fastest-growing digital economy, hosts less than 1% of global data center capacity. This structural deficit forces African enterprises, governments, and researchers to rely on foreign infrastructure — creating dependencies that compromise data sovereignty, increase latency, and extract capital from the continent. Harch Intelligence directly addresses this imbalance by building sovereign AI compute capacity at the scale the continent demands. Our 5 hubs across Morocco deliver 1,798 GPUs with carbon-aware scheduling, and our 500MW Pipeline in Dakhla positions Morocco as the gateway for AI compute between Europe and Africa, leveraging the country\'s exceptional renewable energy resources, strategic Atlantic coastline with submarine cable landing stations, and political stability.',
      marketAnalysis: 'Africa\'s cloud and data center market is projected to reach $15 billion by 2028, growing at 25% CAGR — the fastest growth rate globally. Key demand drivers include government data localization mandates sweeping across Nigeria, Kenya, South Africa, and Egypt; the explosive growth of African fintech processing over $500 billion annually; the expansion of AI-driven healthcare diagnostics serving 300 million patients; and the rise of sovereign AI initiatives from the African Union and regional bodies. Harch Intelligence\'s 1,798 GPUs across 5 hubs capture a significant share of this demand while operating at cost structures 40-60% cheaper than AWS/GCP/Azure, thanks to Dakhla\'s renewable energy costs of $0.03/kWh — among the lowest on the planet. Our carbon-aware scheduling achieves 48.2 gCO2/kWh average carbon intensity, 89% below the industry average of ~450 gCO2/kWh.',
      sustainability: 'Every aspect of Harch Intelligence is designed for minimal environmental impact and maximum sustainability. The facility runs on 100% renewable energy from Harch Energy\'s solar and wind installations, eliminating scope 2 emissions entirely. Our hybrid liquid-air cooling system achieves a PUE below 1.10 — among the most efficient in the global industry — while using seawater for heat rejection to minimize freshwater consumption. Waste heat from GPU clusters is captured and directed to adjacent agricultural greenhouses, creating a circular energy model. The facility\'s construction uses 40% recycled steel and low-carbon concrete from Harch Cement, while all electronic waste follows certified recycling protocols. LEED Platinum and BREEAM Outstanding certifications.',
      investment: '$1.14B',
      metrics: [
        { value: 1798, prefix: '', suffix: '', label: 'Current GPUs' },
        { value: 100000, prefix: '', suffix: '+', label: 'Target GPUs' },
        { value: 47, prefix: '~', suffix: ' gCO2/kWh', label: 'Carbon Intensity' },
        { value: 1140, prefix: '$', suffix: 'M', label: 'Investment' },
      ],
      capabilities: [
        { icon: Server, title: 'Carbon-Aware Data Centers', desc: '5 GPU hubs across Morocco with carbon-aware scheduling as our #1 differentiator. Our 500MW Pipeline in Dakhla is designed for the most demanding compute workloads, with modular architecture allowing capacity to scale from 100MW to 500MW in phases. Each hub features redundant power paths, diverse fiber entrances, and N+1 cooling redundancy throughout. Every rack is pre-wired for liquid cooling, enabling deployment of next-generation GPUs without retrofitting.' },
        { icon: Cpu, title: 'GPU Clusters', desc: '1,798 GPUs across 5 hubs optimized for training and inference with carbon-aware scheduling. Harch Ouarzazate (800 GPUs, 97.2% renewable, 18 gCO2/kWh), Harch Dakhla (400 GPUs, 94.8% renewable, 32 gCO2/kWh), Harch Benguerir (350 GPUs, 88.5% renewable, 55 gCO2/kWh), Harch Tanger (200 GPUs, 82.1% renewable, 95 gCO2/kWh), Harch Casablanca (48 GPUs, 45% renewable, 210 gCO2/kWh). Our largest hub supports distributed training across 800-GPU partitions at Ouarzazate, enabling training of large-scale models with industry-leading carbon efficiency.' },
        { icon: Zap, title: 'Renewable Energy Integration', desc: '82.3% average renewable energy across all hubs, powered by Harch Energy\'s solar and wind infrastructure. Carbon-aware scheduling routes workloads to the greenest hub in real time, achieving 48.2 gCO2/kWh average — 89% below the industry average of ~450 gCO2/kWh. Zero-carbon electricity at Ouarzazate and Dakhla delivers cost advantages of 40-60% cheaper than AWS/GCP/Azure. On-site battery storage provides backup for uninterrupted operations during grid transitions.' },
        { icon: Globe, title: 'Submarine Connectivity', desc: 'Direct connection to 4 submarine cable systems — including the Africa Coast to Europe (ACE), MainOne, and Maroc Telecom cables — providing ultra-low latency to Europe (8ms), the Americas (35ms), and the Middle East (20ms). Dual diverse landing stations ensure path redundancy for all international traffic.' },
        { icon: Shield, title: 'Sovereign Security', desc: 'End-to-end security from physical access to data encryption. The facility operates under a sovereign security framework with armed perimeter security, biometric access controls, and 24/7 surveillance. Harch Technology\'s cybersecurity suite provides sovereign-grade protection including DDoS mitigation, intrusion detection, and encrypted data pathways for sensitive compute workloads.' },
        { icon: BarChart3, title: 'AI Platform Services', desc: 'Full-stack AI platform from data ingestion to model deployment. Managed services for training, fine-tuning, and inference with enterprise SLAs guaranteeing 99.99% availability. The platform supports PyTorch, TensorFlow, and JAX natively, with pre-built MLOps pipelines for automated model lifecycle management.' },
      ],
      specTable: [
        { spec: 'Total Capacity', value: '500MW Pipeline', phase: 'Full build-out by 2028' },
        { spec: 'Phase 1', value: '100MW', phase: 'Q3 2027' },
        { spec: 'Phase 2', value: '200MW', phase: 'Q1 2028' },
        { spec: 'Phase 3', value: '500MW', phase: 'Q4 2028' },
        { spec: 'Current GPUs', value: '1,798', phase: '5 hubs operational' },
        { spec: 'PUE', value: '<1.10', phase: 'Industry-leading efficiency' },
        { spec: 'Latency to Europe', value: '8ms', phase: 'Via submarine cable' },
        { spec: 'Cooling', value: 'Liquid + Air', phase: 'Hybrid cooling system' },
        { spec: 'Security', value: 'Tier IV+', phase: 'Sovereign-grade' },
        { spec: 'Avg Renewable', value: '82.3%', phase: 'Harch Energy supply' },
        { spec: 'Carbon Intensity', value: '48.2 gCO2/kWh', phase: '89% below industry avg' },
        { spec: 'Backup Power', value: '200MWh', phase: 'Battery + Diesel' },
        { spec: 'Network', value: '4 Submarine Cables', phase: 'Dual diverse paths' },
        { spec: 'Location', value: 'Dakhla, Morocco', phase: 'Atlantic coast — 8.5 m/s wind' },
        { spec: 'Energy Cost', value: '$0.018/kWh', phase: '72% lower than EU' },
        { spec: 'Solar Irradiance', value: '2,800 kWh/m²/yr', phase: '40% above S. Europe' },
        { spec: 'Submarine Cables', value: '14 systems', phase: '>80 Tbps capacity' },
        { spec: 'Latency to EU', value: '<30ms', phase: 'Financial center ready' },
        { spec: 'Free Cooling', value: '~8,500 hrs/yr', phase: '22°C average temp' },
        { spec: '5-Year Revenue', value: '$1.9B', phase: '137% CAGR' },
        { spec: 'Base Case IRR', value: '24.7%', phase: '~30 month payback' },
        { spec: 'NPV (12%)', value: '$2,850M', phase: '4.6x return' },
      ],
      milestones: [
        { year: '2025 Q1', title: 'Site Selection & Land Acquisition', desc: '50-hectare site secured in Dakhla Technology Park with options for 100-hectare expansion. Strategic location adjacent to submarine cable landing stations.' },
        { year: '2025 Q3', title: 'Engineering Design Complete', desc: 'Architecture and engineering design completed by Arup and Jacobs. Modular design validated for phased deployment from 100MW to 500MW.' },
        { year: '2026 Q2', title: 'Construction Phase 1 Begins', desc: 'Phase 1 ground-breaking. 100MW module construction starts with foundation, structural steel, and mechanical systems installation.' },
        { year: '2026 Q4', title: 'Power & Connectivity Infrastructure', desc: 'Dedicated 400kV transmission line from Harch Energy solar farm completed. Submarine cable landing station integration operational.' },
        { year: '2027 Q3', title: 'Phase 1 Live', desc: 'First 100MW module operational. GPU clusters expanding beyond 1,798. Enterprise customers begin onboarding.' },
        { year: '2028 Q1', title: 'Phase 2 Online', desc: '200MW total capacity. Full enterprise customer base onboarded. AI platform services launched commercially.' },
        { year: '2028 Q4', title: 'Full Capacity Operational', desc: '500MW Pipeline total. 1,798+ GPUs scaling. Continental AI backbone fully operational. Dakhla established as Africa\'s premier AI compute hub.' },
      ],
      stats: [
        { stat: 'Data Sovereignty', value: 100, max: 100 },
        { stat: 'Renewable Energy', value: 100, max: 100 },
        { stat: 'Cost Advantage vs EU', value: 55, max: 100 },
        { stat: 'Latency to Europe', value: 92, max: 100 },
      ],
      location: 'Dakhla, Morocco',
      locationDesc: 'Strategic location on the Atlantic coast with direct access to submarine cable landing stations and exceptional renewable energy resources. Dakhla offers over 3,000 hours of annual sunshine and consistent wind speeds averaging 8.5 m/s — creating ideal conditions for 100% renewable-powered operations.',
      strategicAdvantages: [
        { title: 'Carbon-Aware Scheduling', desc: 'Our #1 differentiator: real-time carbon-aware scheduling routes workloads to the greenest hub, achieving 48.2 gCO2/kWh average — 89% below the industry average of ~450 gCO2/kWh. No competitor offers this level of carbon optimization.' },
        { title: 'Energy Cost Leadership', desc: 'Electricity at $0.03/kWh from dedicated renewable installations — 40-60% cheaper than AWS/GCP/Azure. This structural advantage compounds annually, creating an ever-widening competitive moat.' },
        { title: 'Modular Scalability', desc: 'Phased deployment from 100MW to 500MW Pipeline matches capacity to demand, minimizing capital risk while maintaining the option for rapid expansion. Each 100MW module is independently operational within 14 months of construction start.' },
        { title: 'Submarine Cable Hub', desc: 'Direct landing of 4 submarine cable systems provides the lowest-latency path between Africa, Europe, and the Americas. No other African location offers this combination of cable diversity and proximity to European financial centers.' },
        { title: 'Lowest Energy Cost on Earth', desc: 'Dakhla offers electricity at $0.018/kWh — 72% cheaper than the EU average and 80% cheaper than Singapore. This structural advantage saves $118-178M per year per 10,000 GPUs compared to Virginia, Frankfurt, or Singapore deployments.' },
      ],
      partnershipModel: [
        { title: 'GPU-as-a-Service', desc: 'Flexible compute provisioning with on-demand and reserved GPU capacity. Pay-per-use pricing with committed-use discounts for 1-3 year terms. Ideal for AI startups, research institutions, and enterprise ML teams.' },
        { title: 'Sovereign AI Cloud', desc: 'Dedicated infrastructure for government and defense workloads with sovereign security controls. Isolated deployment options, custom compliance frameworks, and guaranteed data residency within African jurisdiction.' },
        { title: 'Colocation Services', desc: 'Carrier-neutral colocation with direct cloud on-ramps to AWS, Azure, and GCP. Private suites from 500kW to 10MW with custom power densities up to 150kW per rack for AI training clusters.' },
        { title: 'Strategic Partnerships', desc: 'Joint venture structures for sovereign wealth funds, development finance institutions, and strategic technology partners. Equity participation with preferred access to capacity and governance rights.' },
      ],
      competitorHarchName: 'HarchOS',
      competitorAccentColor: '#8B9DAF',
      competitors: [
        {
          name: 'CoreWeave', country: 'USA', founded: '2017', revenue: '$2.1B (2024)',
          metrics: [
            { label: 'Carbon-Aware GPU Scheduling', harchValue: 'Real-time, per-job, 47-params', competitorValue: 'None — static placement', harchWins: true },
            { label: 'African Sovereign DC', harchValue: '5 hubs — Morocco jurisdiction', competitorValue: '0 hubs in Africa', harchWins: true },
            { label: 'Renewable Energy', harchValue: '82.3% avg — 97.2% best hub', competitorValue: '0% disclosed — US fossil grid', harchWins: true },
            { label: 'Carbon Intensity', harchValue: '48.2 gCO2/kWh (89% below avg)', competitorValue: '~450 gCO2/kWh (US grid)', harchWins: true, harchNumeric: 47, competitorNumeric: 450, barMax: 500, lowerIsBetter: true },
            { label: 'Energy Cost /kWh', harchValue: '$0.03 (4x cheaper)', competitorValue: '$0.08-0.12', harchWins: true, harchNumeric: 3, competitorNumeric: 10, barMax: 15, lowerIsBetter: true },
            { label: 'Uptime SLA', harchValue: '99.999% (5-nines)', competitorValue: '99.99% (4-nines)', harchWins: true, harchNumeric: 99.999, competitorNumeric: 99.99, barMax: 100 },
            { label: 'Data Residency', harchValue: '100% African — sovereign', competitorValue: 'US-controlled — CLOUD Act', harchWins: true },
            { label: 'Submarine Cable Hub', harchValue: '4 systems — 8ms to EU', competitorValue: '0 — US-only peering', harchWins: true },
            { label: 'Cross-Vertical Integration', harchValue: 'Energy + Mining + Cement + Agri + Water', competitorValue: 'None — GPU cloud only', harchWins: true },
            { label: 'EU CBAM Compliance', harchValue: 'Fully compliant — 89% below threshold', competitorValue: 'Not applicable — US-only ops', harchWins: true },
            { label: 'GPU Energy Source', harchValue: 'Dedicated renewable farm (Harch Energy)', competitorValue: 'US grid — coal + natural gas', harchWins: true },
            { label: 'Open Source AI Framework', harchValue: 'HarchOS SDK — sovereign AI toolkit', competitorValue: 'None — proprietary API only', harchWins: true },
            { label: 'Sovereign Security Audit', harchValue: 'ISO 27001 + SOC 2 + Law 09-08', competitorValue: 'SOC 2 only — US jurisdiction', harchWins: true },
            { label: 'Heat Recovery & Circular Economy', harchValue: 'Waste heat to greenhouses — circular', competitorValue: 'None — heat wasted to atmosphere', harchWins: true },
          ],
          verdict: 'CoreWeave has more GPUs. HarchOS has 9.5x lower carbon, 4x cheaper energy, 5-nines SLA, African sovereignty, and the only submarine cable gateway between Africa and Europe.',
        },
        {
          name: 'Google Cloud (Hamina)', country: 'Finland', founded: '2008', revenue: '$33B+ (GCP total)',
          metrics: [
            { label: 'GPU Cloud Access', harchValue: 'H100/A100/L40S — on-demand', competitorValue: 'No GPU cloud — internal only', harchWins: true },
            { label: 'African Data Sovereignty', harchValue: '100% — Morocco jurisdiction', competitorValue: '0% — Finland/US jurisdiction', harchWins: true },
            { label: 'Carbon-Aware Scheduling', harchValue: 'Real-time per-job routing', competitorValue: 'None — static green DC', harchWins: true },
            { label: 'Latency to Africa', harchValue: '<5ms from Morocco', competitorValue: '>100ms from Finland', harchWins: true, harchNumeric: 5, competitorNumeric: 100, barMax: 120, lowerIsBetter: true },
            { label: 'Energy Cost /kWh', harchValue: '$0.03 (2-3x cheaper)', competitorValue: '$0.06-0.10', harchWins: true, harchNumeric: 3, competitorNumeric: 8, barMax: 12, lowerIsBetter: true },
            { label: 'Submarine Cable Gateway', harchValue: '4 systems — Africa-EU hub', competitorValue: 'Nordic — no Africa path', harchWins: true },
            { label: 'GPU-as-a-Service for Africa', harchValue: '1,798 GPUs — African customers', competitorValue: '0 GPUs available to Africa', harchWins: true },
            { label: 'Data Localization Compliance', harchValue: 'Morocco Law 09-08 + AU framework', competitorValue: 'EU GDPR only — no African compliance', harchWins: true },
            { label: 'Industrial AI Integration', harchValue: 'Mining + Energy + Agri + Cement + Water', competitorValue: 'None — consumer/enterprise SaaS', harchWins: true },
            { label: 'Open Source Contributions (Africa)', harchValue: 'HarchOS SDK + sovereign AI toolkit', competitorValue: 'TensorFlow — not Africa-specific', harchWins: true },
            { label: 'Community Revenue Share', harchValue: '5% — local development funds', competitorValue: '0% — corporate profit repatriation', harchWins: true },
          ],
          verdict: 'Google Hamina is a green data center you cannot use for GPU compute. HarchOS is a green GPU cloud you can — at 3x lower energy cost, with African sovereignty.',
        },
        {
          name: 'Africa Data Centres (Cassava)', country: 'South Africa', founded: '2018', revenue: 'Undisclosed (private)',
          metrics: [
            { label: 'GPU Compute', harchValue: '1,798 GPUs (H100/A100/L40S)', competitorValue: '0 GPUs — colocation only', harchWins: true },
            { label: 'Carbon-Aware Scheduling', harchValue: 'Real-time per-job', competitorValue: 'None', harchWins: true },
            { label: 'MW Pipeline', harchValue: '500MW (17x larger)', competitorValue: '30MW', harchWins: true, harchNumeric: 500, competitorNumeric: 30, barMax: 550 },
            { label: 'Renewable Energy', harchValue: '82.3% avg', competitorValue: 'Undisclosed', harchWins: true },
            { label: 'Carbon Intensity', harchValue: '48.2 gCO2/kWh', competitorValue: '~500 gCO2/kWh (SA grid)', harchWins: true, harchNumeric: 47, competitorNumeric: 500, barMax: 550, lowerIsBetter: true },
            { label: 'Energy Cost /kWh', harchValue: '$0.03', competitorValue: '$0.08-0.15 (SA grid)', harchWins: true, harchNumeric: 3, competitorNumeric: 12, barMax: 15, lowerIsBetter: true },
            { label: 'Cross-Vertical Integration', harchValue: '5 subsidiaries — ecosystem', competitorValue: 'None — colocation only', harchWins: true },
            { label: 'Sovereign Security Controls', harchValue: 'ISO 27001 + SOC 2 + Moroccan law', competitorValue: 'ISO 27001 only — SA jurisdiction', harchWins: true },
            { label: 'Submarine Cable Access', harchValue: '4 systems — direct to EU/US', competitorValue: '2 cables — SA hub only', harchWins: true },
            { label: 'AI Platform Services', harchValue: 'Full MLOps + training + inference', competitorValue: 'None — rack space only', harchWins: true },
            { label: 'Developer Ecosystem', harchValue: 'HarchOS SDK + API + playground', competitorValue: 'None — no developer tools', harchWins: true },
            { label: 'Data Residency Guarantee', harchValue: '100% — African jurisdiction', competitorValue: 'Partial — SA only, no cross-border', harchWins: true },
          ],
          verdict: 'Africa\'s largest DC operator has zero GPUs, zero carbon-awareness, 17x less power, and 10x higher carbon intensity. HarchOS is in a different category entirely.',
        },
        {
          name: 'QScale', country: 'Canada', founded: '2020', revenue: 'Pre-revenue (startup)',
          metrics: [
            { label: 'African Data Center Presence', harchValue: '5 hubs — Morocco operational', competitorValue: '0 — Quebec, Canada only', harchWins: true },
            { label: 'GPU Count', harchValue: '1,798 GPUs operational', competitorValue: '~4,000 GPUs (announced)', harchWins: false },
            { label: 'Carbon-Aware Scheduling', harchValue: 'Real-time per-job — 47 parameters', competitorValue: 'Static — Quebec hydro only', harchWins: true },
            { label: 'Carbon Intensity', harchValue: '48.2 gCO2/kWh avg', competitorValue: '~15 gCO2/kWh (Quebec hydro)', harchWins: false },
            { label: 'Latency to Africa', harchValue: '<5ms from Morocco', competitorValue: '>120ms from Quebec', harchWins: true, harchNumeric: 5, competitorNumeric: 120, barMax: 140, lowerIsBetter: true },
            { label: 'Data Sovereignty (Africa)', harchValue: '100% — Morocco jurisdiction', competitorValue: '0% — Canadian jurisdiction', harchWins: true },
            { label: 'Submarine Cable Hub', harchValue: '4 systems — Africa-EU gateway', competitorValue: 'None — no transatlantic cable hub', harchWins: true },
            { label: 'Cross-Vertical Integration', harchValue: '5 subsidiaries — full ecosystem', competitorValue: 'None — compute only', harchWins: true },
            { label: 'AI Platform & MLOps', harchValue: 'Full stack — training to deployment', competitorValue: 'Bare-metal GPU — no platform', harchWins: true },
            { label: 'African Job Creation', harchValue: '500+ direct jobs in Morocco', competitorValue: '0 jobs in Africa', harchWins: true },
            { label: 'Energy Cost /kWh', harchValue: '$0.03', competitorValue: '$0.04-0.06', harchWins: true, harchNumeric: 3, competitorNumeric: 5, barMax: 8, lowerIsBetter: true },
            { label: 'Regulatory Compliance (Africa)', harchValue: 'Morocco Law 09-08 + AU framework', competitorValue: 'None — no African compliance', harchWins: true },
          ],
          verdict: 'QScale has excellent Quebec hydro-powered GPUs. But 0 African hubs, 0 African sovereignty, 120ms+ latency to Africa. Green compute in Canada does not serve Africa.',
        },
      ],
    },
    cement: {
      name: 'Harch Cement', version: '/0.2',
      heroTitle: "Building West Africa's\nFuture",
      heroSubtitle: '500kT/yr cement production serving the construction boom with vertically integrated operations',
      heroImage: '/images/sections/cement-factory.jpg',
      sectionImage1: '/images/sections/cement-quarry.jpg',
      sectionImage2: '/images/sections/cement-kiln.jpg',
      sectionImage3: '/images/sections/cement-industrial.jpg',
      sectionImage4: '/images/sections/cement-quarry-aerial.jpg',
      overview: 'Harch Cement is developing a 500kT/yr cement production facility in Gambia, serving West Africa\'s construction boom with vertically integrated operations from quarry to delivery. Our model captures the full value chain — from limestone extraction through clinker production to finished cement distribution — creating structural cost advantages of 30-50% versus import-dependent competitors. This is not simply a cement plant; it is an industrial anchor that catalyzes infrastructure development, creates hundreds of direct jobs, and eliminates West Africa\'s dependence on imported construction materials.',
      strategicContext: 'West Africa faces a fundamental construction materials deficit. The region imports over 15 million tonnes of cement annually, paying premium prices that inflate infrastructure costs by 40-70% compared to markets with domestic production. Gambia, with a population of 2.5 million and a GDP growing at 6% annually, currently imports 100% of its cement — a structural vulnerability that increases with every infrastructure project. Harch Cement\'s 500kT/yr facility captures a significant share of this demand while building domestic industrial capacity that strengthens economic sovereignty.',
      marketAnalysis: 'The West African cement market is valued at $8.5 billion and growing at 8% CAGR, driven by urbanization, government infrastructure programs totaling $45 billion across ECOWAS nations, and a housing deficit exceeding 50 million units. Gambia alone imports 400,000 tonnes of cement annually at premium prices averaging $120/tonne versus $65-75/tonne for domestically produced cement.',
      sustainability: 'Harch Cement integrates sustainability at every level of operations. Our green cement formulations use locally sourced pozzolanic materials to reduce the clinker factor below 85%, cutting CO2 emissions by 25% versus ordinary Portland cement. The kiln incorporates waste heat recovery technology that captures 30% of thermal energy for power generation, reducing grid electricity consumption. Quarry rehabilitation plans are developed before extraction begins, with progressive restoration using overburden and topsoil stockpiles.',
      investment: '$200M',
      metrics: [
        { value: 500, prefix: '', suffix: 'kT/yr', label: 'Production Capacity' },
        { value: 38, prefix: '', suffix: '.2%', label: 'IRR' },
        { value: 10500, prefix: '$', suffix: '', label: 'Total CAPEX' },
        { value: 265, prefix: '', suffix: '%', label: '5-Year ROI' },
      ],
      capabilities: [
        { icon: Factory, title: 'Quarry Operations', desc: 'Vertically integrated limestone quarry with 50+ year verified reserves. In-country raw material sourcing eliminates import dependency and reduces raw material costs by 30%.' },
        { icon: Cpu, title: 'Modern Kiln Technology', desc: 'State-of-the-art rotary kiln with waste heat recovery and AI-optimized production control. The 5-stage preheater with calciner achieves 40% lower energy consumption versus regional competitors.' },
        { icon: Zap, title: 'Green Cement Innovation', desc: 'Blended cement formulations using locally sourced pozzolanic and slag materials, reducing the clinker factor to below 85% and the carbon footprint by 25%. Our R&D team is developing calcined clay (LC3) formulations aiming for clinker factors below 70% by 2029.' },
        { icon: Globe, title: 'Regional Distribution Network', desc: 'Strategic location on the Gambia River with barge and road access to Senegal, Guinea-Bissau, and Guinea. 500km distribution radius served by a fleet of 40 cement tankers and river barges.' },
        { icon: Shield, title: 'Quality Assurance Systems', desc: 'ISO 9001 certified production with AI-powered quality monitoring and automated sampling at every production stage. Consistent product quality that exceeds both EN 197 and ASTM C150 standards.' },
        { icon: BarChart3, title: 'Market Position & Strategy', desc: 'First-mover advantage in Gambia with significant barriers to entry for competitors. 60% domestic market share within 3 years of commissioning.' },
      ],
      specTable: [
        { spec: 'Capacity', value: '500kT/yr', phase: 'Full production' },
        { spec: 'Kiln Type', value: 'Rotary + Preheater', phase: '5-stage with calciner' },
        { spec: 'Clinker Factor', value: '<85%', phase: 'Green formulation' },
        { spec: 'Quarry Reserves', value: '50+ years', phase: 'Limestone verified' },
        { spec: 'Distribution', value: '500km radius', phase: 'River + Road network' },
        { spec: 'Energy Source', value: 'Harch Energy', phase: 'Renewable + Grid hybrid' },
        { spec: 'Certifications', value: 'ISO 9001 / EN 197', phase: 'Quality management' },
        { spec: 'Workforce', value: '800+ direct', phase: 'Local hiring priority' },
        { spec: 'Water Recycling', value: '95%', phase: 'Closed-loop systems' },
        { spec: 'Dust Emissions', value: '50% below EU', phase: 'Bag filter technology' },
        { spec: 'CAPEX', value: '$10.5M', phase: 'Equipment 69.5%' },
        { spec: 'Market CAGR', value: '12-14%', phase: 'Gambia construction boom' },
        { spec: 'Import Duties', value: '500% increase', phase: 'Dec 2025 — local advantage' },
        { spec: 'Payback Period', value: '2.8 years', phase: 'IRR 38.2%' },
        { spec: '5-Year NPV', value: '$6.8M', phase: 'At 10% discount rate' },
        { spec: 'Direct Jobs', value: '85-120', phase: '80% Gambian staff target' },
        { spec: 'FX Savings', value: '~$8M/yr', phase: 'Import substitution' },
      ],
      milestones: [
        { year: '2024 Q4', title: 'Permit Application Filed', desc: 'Environmental and construction permits filed with Gambian authorities.' },
        { year: '2025 Q2', title: 'Community Engagement Program', desc: 'Comprehensive community engagement program launched across 12 villages.' },
        { year: '2025 Q4', title: 'Permits Approved', desc: 'All construction and environmental permits approved.' },
        { year: '2026 Q2', title: 'Construction Phase Begins', desc: 'Foundation work, kiln installation, and quarry development begin simultaneously.' },
        { year: '2027 Q2', title: 'Kiln Installation Complete', desc: 'Rotary kiln and preheater tower installed. Electrical and control systems commissioned.' },
        { year: '2027 Q4', title: 'Commissioning & Testing', desc: 'Kiln commissioning and test production runs. Quality certification process initiated.' },
        { year: '2028 Q1', title: 'Commercial Production', desc: 'Full commercial production at 500kT/yr capacity. First deliveries to Gambian and Senegalese markets.' },
      ],
      stats: [
        { stat: 'Import Substitution', value: 85, max: 100 },
        { stat: 'Cost Advantage vs Imports', value: 45, max: 100 },
        { stat: 'Local Employment', value: 90, max: 100 },
        { stat: 'Carbon Reduction vs Peers', value: 30, max: 100 },
      ],
      location: 'Gambia',
      locationDesc: 'Strategic location on the Gambia River with deep-water barge access and road connections to Senegal, Guinea-Bissau, and Guinea. The site sits on verified limestone deposits with 50+ years of reserves.',
      strategicAdvantages: [
        { title: 'Vertical Integration', desc: 'Full value chain from quarry to finished product eliminates middlemen and import costs. Raw material costs are 30% below competitors who must import clinker or finished cement.' },
        { title: 'River Distribution Hub', desc: 'Direct barge access on the Gambia River provides low-cost bulk transport to interior markets that road-only competitors cannot serve economically.' },
        { title: 'First-Mover in Gambia', desc: 'No domestic cement production currently exists in Gambia. Our facility creates the country\'s first industrial cement base, generating significant barriers to entry.' },
        { title: 'Green Premium Positioning', desc: 'Lower-carbon cement formulations command premium pricing in ESG-sensitive markets while reducing production costs through lower clinker factors and energy recovery.' },
      ],
      partnershipModel: [
        { title: 'Offtake Agreements', desc: 'Long-term cement supply contracts with construction companies, government agencies, and infrastructure developers. Fixed pricing with inflation protection for 3-5 year terms.' },
        { title: 'Joint Venture Operations', desc: 'Partnership structures for regional cement producers seeking West African market entry. Shared infrastructure, distribution, and technology transfer.' },
        { title: 'Government Partnerships', desc: 'Public-private partnership models for national infrastructure programs. Dedicated production allocation for government projects with priority delivery.' },
        { title: 'Industrial Synergies', desc: 'Cross-vertical integration with Harch Energy for renewable power supply and Harch Mining for supplementary raw materials. Captive energy costs 40% below grid tariffs.' },
      ],
      competitorHarchName: 'Harch Cement',
      competitorAccentColor: '#8B9DAF',
      competitors: [
        {
          name: 'Dangote Cement', country: 'Nigeria', founded: '1981', revenue: '$3.6B (2024)',
          metrics: [
            { label: 'Green Cement (LC3)', harchValue: 'In development — <70% clinker by 2029', competitorValue: 'None — no green product line', harchWins: true },
            { label: 'Clinker Factor Trajectory', harchValue: '<85% → <70% (LC3)', competitorValue: '~80%+ — no reduction plan', harchWins: true },
            { label: 'Renewable Energy', harchValue: '100% Harch Energy supply', competitorValue: 'CNG trucks only — <5% operations', harchWins: true },
            { label: 'Carbon Intensity', harchValue: 'Near-zero — 100% renewable kiln', competitorValue: '~630 kgCO2/t cement (industry avg)', harchWins: true, harchNumeric: 10, competitorNumeric: 630, barMax: 700, lowerIsBetter: true },
            { label: 'Water Recycling', harchValue: '95% closed-loop', competitorValue: 'Not disclosed', harchWins: true },
            { label: 'Dust Emissions', harchValue: '50% below EU standards', competitorValue: 'Not disclosed', harchWins: true },
            { label: 'EU CBAM Readiness', harchValue: 'Fully compliant — zero-carbon processing', competitorValue: 'Not compliant — carbon penalty risk', harchWins: true },
            { label: 'Cross-Vertical Synergy', harchValue: 'Energy + Mining + Water + Agri', competitorValue: 'None — cement only', harchWins: true },
            { label: 'Waste Heat Recovery', harchValue: '30% thermal energy recaptured', competitorValue: 'Not disclosed', harchWins: true },
            { label: 'Sustainability Certifications', harchValue: 'LEED + BREEAM + ISO 14001 from day one', competitorValue: 'No green certifications disclosed', harchWins: true },
          ],
          verdict: 'Dangote produces volume. Harch Cement produces the future — green LC3 cement at 30-50% below import prices, powered by 100% renewable energy.',
        },
        {
          name: 'Holcim (ECOPact)', country: 'Switzerland', founded: '1912', revenue: '$27B (2024)',
          metrics: [
            { label: 'West Africa Operations', harchValue: 'Gambia — building now', competitorValue: 'Exited 2025 (sold to Huaxin)', harchWins: true },
            { label: 'Green Pricing', harchValue: 'No premium — cost advantage', competitorValue: '5-15% green premium', harchWins: true },
            { label: 'Renewable Energy', harchValue: '100% Harch Energy — direct supply', competitorValue: 'Partial — no African supply chain', harchWins: true },
            { label: 'Local Employment', harchValue: '800+ direct jobs in Gambia', competitorValue: '0 jobs in West Africa (exited)', harchWins: true },
            { label: 'Carbon Intensity', harchValue: 'Near-zero — 100% renewable', competitorValue: '~400 kgCO2/t (ECOPact range)', harchWins: true, harchNumeric: 10, competitorNumeric: 400, barMax: 450, lowerIsBetter: true },
            { label: 'EU CBAM Readiness', harchValue: 'Zero-carbon — no border tax', competitorValue: 'Partial — varies by plant', harchWins: true },
            { label: 'Import Substitution', harchValue: '100% — replacing all Gambia imports', competitorValue: '0% — no longer operating in region', harchWins: true },
            { label: 'Community Revenue Share', harchValue: '5% — local development funds', competitorValue: '0% disclosed', harchWins: true },
          ],
          verdict: 'Holcim makes ECOPact in Zurich. Harch Cement makes green cement in Gambia — at a cost advantage not a premium, with 100% renewable energy and 800 local jobs.',
        },
        {
          name: 'Heidelberg Materials', country: 'Germany', founded: '1873', revenue: '$22B (2024)',
          metrics: [
            { label: 'West Africa Operations', harchValue: 'Gambia — building now', competitorValue: 'Limited — primarily Europe/NA', harchWins: true },
            { label: 'CCS Timeline', harchValue: 'Zero-carbon by design — no CCS needed', competitorValue: 'CCS target by 2030 — unproven at scale', harchWins: true },
            { label: 'Green Pricing', harchValue: 'No premium — structural cost advantage', competitorValue: 'evoZero premium pricing', harchWins: true },
            { label: 'Carbon Intensity', harchValue: 'Near-zero — 100% renewable', competitorValue: '~550 kgCO2/t (conventional) — CCS planned', harchWins: true, harchNumeric: 10, competitorNumeric: 550, barMax: 600, lowerIsBetter: true },
            { label: 'Import Substitution', harchValue: '100% — replacing all Gambia imports', competitorValue: '0% — no Gambia/West Africa ops', harchWins: true },
            { label: 'CCS Risk', harchValue: 'No CCS needed — zero by design', competitorValue: 'High — CCS unproven at cement scale', harchWins: true },
          ],
          verdict: 'Heidelberg bets on CCS — carbon capture that remains unproven at scale. Harch Cement eliminates carbon at the source through 100% renewable energy. Prevention beats capture.',
        },
      ],
    },
    energy: {
      name: 'Harch Energy', version: '/0.3',
      heroTitle: "2GW+ Renewable\nEnergy Pipeline",
      heroSubtitle: 'Solar, wind, and green hydrogen powering industrial sovereignty across the continent',
      heroImage: '/images/sections/energy-wind-farm.jpg',
      sectionImage1: '/images/sections/energy-solar-farm.jpg',
      sectionImage2: '/images/sections/energy-hydrogen-plant.jpg',
      sectionImage3: '/images/sections/energy-solar.jpg',
      sectionImage4: '/images/sections/energy-hydrogen.jpg',
      overview: 'Harch Energy is developing over 2GW+ Pipeline of renewable energy capacity across Morocco and the Sahel region — combining solar, wind, and green hydrogen production to power industrial operations and data centers with zero-carbon electricity. Our integrated approach ensures energy sovereignty for the continent while creating a model for sustainable industrialization worldwide.',
      strategicContext: 'Africa possesses the world\'s greatest renewable energy potential — 40% of global solar irradiance and exceptional wind corridors across the Sahel. Yet the continent generates only 3% of global renewable electricity, and over 600 million Africans lack access to reliable power. Harch Energy captures this opportunity at industrial scale, building the renewable infrastructure that powers not just Harch Corp\'s verticals but catalyzes a continental energy transformation.',
      marketAnalysis: 'Africa\'s renewable energy market is projected to reach $80 billion in annual investment by 2030, driven by falling technology costs (solar PV costs have declined 90% since 2010), international climate finance commitments exceeding $100 billion annually, and rapidly growing power demand. Morocco alone plans 6GW of new renewable capacity by 2030.',
      sustainability: 'Harch Energy\'s entire business model is predicated on sustainability. Every megawatt we generate displaces fossil fuel generation, preventing approximately 1,000 tonnes of CO2 emissions annually. Our 2GW+ Pipeline will offset over 3.2 million tonnes of CO2 per year — equivalent to removing 700,000 cars from the road.',
      investment: '$600M',
      metrics: [
        { value: 2000, prefix: '', suffix: ' MW+', label: 'Pipeline Capacity' },
        { value: 600, prefix: '$', suffix: 'M', label: 'Investment' },
        { value: 53, prefix: '', suffix: ' kWh/m²/day', label: 'Solar Irradiance' },
        { value: 45, prefix: '', suffix: '%', label: 'Wind Capacity Factor' },
      ],
      capabilities: [
        { icon: Zap, title: 'Solar Photovoltaic', desc: '1.2GW of solar photovoltaic capacity across Morocco\'s southern regions using Tier-1 bifacial panels with single-axis trackers for maximum energy yield. Capacity factors of 28% — significantly above the global average.' },
        { icon: Wind, title: 'Onshore Wind Power', desc: '800MW of onshore wind capacity in the Sahel corridor, one of the world\'s premier wind resources. Capacity factors above 45%, generating electricity at $18/MWh — competitive with any generation source globally.' },
        { icon: Droplets, title: 'Green Hydrogen Production', desc: '200MW electrolyzer capacity for green hydrogen production using PEM technology. Production cost at $2.50/kg by 2028 — competitive with grey hydrogen in European markets.' },
        { icon: Shield, title: 'Grid Integration & Storage', desc: 'AI-optimized grid management with 400MWh of battery storage ensuring stable power supply 24/7 for critical industrial loads.' },
        { icon: Globe, title: 'PPA Structuring', desc: 'Long-term power purchase agreements with 20+ year contracts with inflation protection, providing revenue visibility that supports project financing at favorable terms.' },
        { icon: BarChart3, title: 'Carbon Credit Generation', desc: 'Verified carbon credits from all renewable installations registered under the Gold Standard and Verra VCS frameworks. Additional revenue stream that improves project economics by 8-12%.' },
      ],
      specTable: [
        { spec: 'Solar PV', value: '1.2GW', phase: 'Morocco South' },
        { spec: 'Onshore Wind', value: '800MW', phase: 'Sahel Region' },
        { spec: 'Green H₂ Electrolyzer', value: '200MW', phase: 'PEM Technology' },
        { spec: 'Battery Storage', value: '400MWh', phase: 'LFP Chemistry' },
        { spec: 'PPA Duration', value: '20+ years', phase: 'Inflation-protected' },
        { spec: 'LCOE Solar', value: '$14/MWh', phase: 'Industry-leading' },
        { spec: 'LCOE Wind', value: '$18/MWh', phase: 'Competitive globally' },
        { spec: 'Carbon Offset', value: '3.2M tCO2/yr', phase: 'Verified credits' },
        { spec: 'Grid Connection', value: '400kV', phase: 'High-voltage transmission' },
        { spec: 'Community Revenue Share', value: '5%', phase: 'Local development funds' },
      ],
      milestones: [
        { year: '2025 Q1', title: 'License Applications Filed', desc: 'Renewable energy licenses and environmental permits filed for solar and wind projects across 3 sites totaling 2GW+.' },
        { year: '2025 Q4', title: 'Licenses Secured & PPA Signed', desc: '2GW+ Pipeline renewable energy licenses approved. First PPA signed with Harch Intelligence for 500MW Pipeline dedicated supply.' },
        { year: '2026 Q3', title: 'Solar Farm Construction Begins', desc: 'First 400MW solar farm construction starts in southern Morocco.' },
        { year: '2027 Q2', title: 'First Power Generation', desc: '400MW solar farm online and generating. First PPA deliveries to Harch Intelligence data center.' },
        { year: '2027 Q4', title: 'Wind Farm Construction', desc: '300MW wind farm construction begins in the Sahel corridor.' },
        { year: '2028 Q4', title: '1GW Operational Milestone', desc: '1GW total renewable capacity operational. Green hydrogen pilot launched.' },
        { year: '2030 Q1', title: 'Full Pipeline Operational', desc: '2GW+ Pipeline fully operational across solar, wind, and green hydrogen.' },
      ],
      stats: [
        { stat: 'Capacity Factor Solar', value: 28, max: 35 },
        { stat: 'Capacity Factor Wind', value: 45, max: 55 },
        { stat: 'Cost Competitiveness', value: 90, max: 100 },
        { stat: 'Carbon Offset Target', value: 85, max: 100 },
      ],
      location: 'Sahel Region',
      locationDesc: 'Exceptional solar irradiance (2,400+ kWh/m2/year) and wind resources (average 8.5 m/s) across Morocco and the Sahel corridor. Sites strategically located near high-voltage transmission infrastructure and industrial demand centers.',
      strategicAdvantages: [
        { title: 'Lowest LCOE Globally', desc: 'Morocco\'s combination of exceptional solar irradiance, low land costs, and developing infrastructure creates solar LCOE of $14/MWh — among the lowest in the world.' },
        { title: 'Captive Demand from Harch Verticals', desc: 'Guaranteed offtake from Harch Intelligence (500MW Pipeline), Harch Cement, Harch Mining, and Harch Water provides revenue floor that derisks project finance.' },
        { title: 'Green Hydrogen Export Potential', desc: 'Morocco\'s proximity to European hydrogen markets positions Harch Energy as a competitive green hydrogen supplier to EU industrial customers.' },
        { title: 'Carbon Credit Revenue', desc: 'Verified carbon credits from 2GW+ Pipeline of renewable installations generate $25-40M annually in additional revenue.' },
      ],
      partnershipModel: [
        { title: 'Corporate PPAs', desc: 'Long-term power purchase agreements for industrial customers seeking renewable energy supply. 10-20 year terms with fixed or inflation-linked pricing.' },
        { title: 'Project Finance Partnerships', desc: 'Joint development structures with international infrastructure investors and development finance institutions.' },
        { title: 'Green Hydrogen Offtake', desc: 'Hydrogen supply agreements with European industrial customers. Target price: $2.50/kg by 2028.' },
        { title: 'Community Energy Programs', desc: 'Mini-grid and rural electrification partnerships with governments and development agencies. 5% of generation capacity allocated for community energy access.' },
      ],
      competitorHarchName: 'Harch Energy',
      competitorAccentColor: '#8B9DAF',
      competitors: [
        {
          name: 'ACWA Power', country: 'Saudi Arabia', founded: '2004', revenue: '$3.1B (2024)',
          metrics: [
            { label: 'LCOE Solar', harchValue: '$14/MWh (industry-leading)', competitorValue: '~$16-20/MWh', harchWins: true, harchNumeric: 14, competitorNumeric: 18, barMax: 25, lowerIsBetter: true },
            { label: 'Green H2 Target', harchValue: '$2.50/kg by 2028 — on track', competitorValue: 'Not disclosed — no H2 product', harchWins: true },
            { label: 'African Industrial Focus', harchValue: '5 countries, 7 verticals', competitorValue: '1 country (Senegal desal only)', harchWins: true },
            { label: 'Captive Industrial Demand', harchValue: 'Intelligence + Cement + Mining + Agri + Water', competitorValue: 'None — power + water only', harchWins: true },
            { label: 'Cross-Vertical Synergy', harchValue: 'Energy → DC → Mining → Cement → Agri → Water', competitorValue: 'Energy only — no vertical integration', harchWins: true },
            { label: 'African Sovereignty', harchValue: 'African-owned, African-operated', competitorValue: 'Saudi sovereign fund — foreign-owned', harchWins: true },
          ],
          verdict: 'ACWA builds power plants. Harch Energy powers an industrial ecosystem — every MWh feeds a Harch subsidiary, every H2 molecule feeds a Harch process.',
        },
        {
          name: 'Masdar', country: 'Abu Dhabi', founded: '2006', revenue: '$1.5B+ (est.)',
          metrics: [
            { label: 'Green H2 Execution Risk', harchValue: '200MW focused — ship first', competitorValue: '4GW announced — scale unproven', harchWins: true },
            { label: 'Captive Industrial Demand', harchValue: '5 subsidiaries consuming output', competitorValue: 'No industrial off-take', harchWins: true },
            { label: 'African Sovereign Ops', harchValue: '5 African countries — African-owned', competitorValue: 'UAE sovereign fund — foreign-owned', harchWins: true },
            { label: 'Execution Track Record', harchValue: 'No cancelled projects — disciplined', competitorValue: '4GW announced — execution risk high', harchWins: true },
            { label: 'Battery Storage', harchValue: '400MWh — dedicated', competitorValue: 'Not disclosed', harchWins: true },
          ],
          verdict: 'Masdar has UAE capital. Harch Energy has African integration — every MWh powers a Harch subsidiary, every dollar stays on the continent.',
        },
      ],
    },
    technology: {
      name: 'Harch Technology', version: '/0.4',
      heroTitle: "Sovereign Digital\nInfrastructure",
      heroSubtitle: 'AI platforms, cybersecurity, and satellite communications for Africa\'s digital sovereignty',
      heroImage: '/images/sections/tech-satellite.jpg',
      sectionImage1: '/images/sections/tech-ground-station.jpg',
      sectionImage2: '/images/sections/tech-cyber.jpg',
      sectionImage3: '/images/sections/tech-infrastructure.jpg',
      sectionImage4: '/images/sections/tech-soc.jpg',
      overview: 'Harch Technology provides the sovereign digital infrastructure that powers Africa\'s industrial and digital transformation. From AI platforms to cybersecurity and satellite communications, we ensure that Africa controls its own technology stack — its data, its compute, its communications, and its security.',
      strategicContext: 'Africa\'s digital economy is growing at 25% annually, yet 95% of the continent\'s cloud infrastructure, cybersecurity tools, and communications systems are provided by foreign companies operating under foreign jurisdictions. Harch Technology addresses each of these vulnerabilities with sovereign solutions designed for African requirements.',
      marketAnalysis: 'Africa\'s technology market is valued at $35 billion and growing at 20% CAGR — the fastest of any region globally. Key growth segments include cloud services ($8B by 2027), cybersecurity ($5B by 2026), satellite communications ($3B by 2027), and AI platforms ($10B by 2028).',
      sustainability: 'Harch Technology designs for efficiency and longevity. Our sovereign cloud infrastructure runs on 100% renewable energy from Harch Energy, with a PUE below 1.2 across all facilities. All hardware follows certified e-waste recycling protocols.',
      investment: '$400M',
      metrics: [
        { value: 1798, prefix: '', suffix: '', label: 'GPUs' },
        { value: 4, prefix: '', suffix: '', label: 'Product Lines' },
        { value: 47, prefix: '~', suffix: ' gCO2/kWh', label: 'Carbon Intensity' },
        { value: 400, prefix: '$', suffix: 'M', label: 'Investment' },
      ],
      capabilities: [
        { icon: Cpu, title: 'Sovereign AI Platform', desc: 'Full-stack AI platform for training, fine-tuning, and inference with managed services and enterprise SLAs — all hosted within African jurisdiction with guaranteed data residency.' },
        { icon: Shield, title: 'Cybersecurity Suite', desc: 'End-to-end cybersecurity platform from network monitoring to incident response. Designed for critical infrastructure protection with real-time threat intelligence.' },
        { icon: Satellite, title: 'Satellite Communications', desc: 'Low Earth Orbit satellite connectivity for remote industrial operations. Multi-orbit constellation access provides 99.99% uptime guarantee.' },
        { icon: Server, title: 'Edge Computing Network', desc: 'Distributed edge computing infrastructure across 5 countries with 50+ nodes providing low-latency processing for IoT, AI inference, and real-time analytics.' },
        { icon: Lock, title: 'Sovereign Cloud', desc: 'Africa-hosted cloud infrastructure with full data sovereignty and guaranteed data residency. No data leaves the continent.' },
        { icon: Eye, title: 'Industrial Data Analytics', desc: 'Real-time monitoring and predictive analytics platform combining IoT data streams from all Harch verticals. AI-powered anomaly detection reduces downtime by 40%.' },
      ],
      specTable: [
        { spec: 'GPU Hubs', value: '5 (1,798 GPUs)', phase: 'Carbon-optimized' },
        { spec: 'AI Platform', value: 'Full Stack', phase: 'Training + Inference' },
        { spec: 'Cyber Suite', value: 'Enterprise', phase: 'Critical infrastructure grade' },
        { spec: 'Satellite Orbits', value: 'LEO + MEO', phase: '99.99% uptime SLA' },
        { spec: 'Edge Nodes', value: '50+', phase: '5 countries coverage' },
        { spec: 'Cloud Regions', value: '3 African', phase: 'Sovereign data residency' },
        { spec: 'Data Residency', value: '100% Africa', phase: 'Full compliance' },
        { spec: 'Certifications', value: 'ISO 27001 + SOC 2', phase: 'Information security' },
        { spec: 'API Availability', value: '99.99%', phase: 'Enterprise SLA' },
        { spec: 'Threat Intelligence', value: 'Real-time', phase: 'AI-powered detection' },
      ],
      milestones: [
        { year: '2025 Q2', title: 'Platform Architecture Validated', desc: 'Sovereign AI platform architecture designed, validated, and benchmarked against global standards.' },
        { year: '2026 Q1', title: 'Cybersecurity Suite Launch', desc: 'Cybersecurity product suite launched commercially for enterprise and government customers.' },
        { year: '2026 Q4', title: 'Edge Computing Deployment', desc: 'First 20 edge computing nodes deployed across Morocco, Gambia, and Mauritania.' },
        { year: '2027 Q3', title: 'Satellite Integration Complete', desc: 'LEO satellite connectivity integrated with edge infrastructure. Full network operational.' },
        { year: '2028 Q2', title: 'Sovereign Cloud GA', desc: 'Full sovereign cloud platform in general availability with 3 African regions.' },
      ],
      stats: [
        { stat: 'Data Sovereignty', value: 100, max: 100 },
        { stat: 'Platform Uptime', value: 99, max: 100 },
        { stat: 'Cyber Threat Detection', value: 95, max: 100 },
        { stat: 'African Talent Ratio', value: 85, max: 100 },
      ],
      location: 'Casablanca, Morocco',
      locationDesc: 'Technology headquarters in Casablanca\'s financial district with distributed operations across 5 countries.',
      strategicAdvantages: [
        { title: 'Sovereign by Design', desc: 'Every product is built from the ground up for data sovereignty, with guaranteed African data residency and no foreign jurisdiction access.' },
        { title: 'Integrated Security Stack', desc: 'Cybersecurity is not an add-on but embedded across every layer — from physical data center security to application-level encryption.' },
        { title: 'Industrial IoT Expertise', desc: 'Deep domain expertise in industrial operations (energy, mining, cement, agriculture) enables tailored analytics and AI solutions that generic cloud providers cannot deliver.' },
        { title: 'Multi-Orbit Satellite Access', desc: 'Partnerships with multiple LEO and MEO constellation operators provide redundant connectivity for remote operations, ensuring 99.99% uptime.' },
      ],
      partnershipModel: [
        { title: 'Sovereign Cloud Migration', desc: 'Managed migration services for organizations moving workloads to African sovereign cloud.' },
        { title: 'Managed Security Services', desc: '24/7 security operations center with managed detection and response for critical infrastructure.' },
        { title: 'Technology Licensing', desc: 'White-label licensing of Harch Technology platforms for telecom operators and system integrators.' },
        { title: 'Research Partnerships', desc: 'Collaborative R&D programs with African universities and research institutions.' },
      ],
      competitorHarchName: 'Harch Technology',
      competitorAccentColor: '#8B9DAF',
      competitors: [
        {
          name: 'AWS Africa (Cape Town)', country: 'USA', founded: '2006', revenue: '$105B (AWS total)',
          metrics: [
            { label: 'African GPU Compute', harchValue: '1,798 GPUs — Morocco', competitorValue: '0 GPUs in Africa — US/EU only', harchWins: true },
            { label: 'Data Sovereignty', harchValue: '100% African — Morocco law', competitorValue: 'US CLOUD Act — AWS can be compelled', harchWins: true },
            { label: 'Renewable Energy', harchValue: '82.3% — Harch Energy direct', competitorValue: '~42% global RECs — SA grid fossil', harchWins: true },
            { label: 'Carbon Intensity', harchValue: '48.2 gCO2/kWh', competitorValue: '~400 gCO2/kWh (SA region)', harchWins: true, harchNumeric: 47, competitorNumeric: 400, barMax: 450, lowerIsBetter: true },
            { label: 'Edge Computing', harchValue: '50+ nodes — 5 countries', competitorValue: '2 Outposts — SA only', harchWins: true },
            { label: 'Satellite Integration', harchValue: 'LEO + MEO — 99.99% SLA', competitorValue: 'Ground Station — no LEO/MEO fleet', harchWins: true },
          ],
          verdict: 'AWS Cape Town is a US cloud region on South African soil. Harch Technology is an African sovereign platform on African soil — with GPU compute AWS lacks in Africa.',
        },
      ],
    },
    mining: {
      name: 'Harch Mining', version: '/0.5',
      heroTitle: "Capturing the\nValue Chain",
      heroSubtitle: 'Strategic mineral extraction and in-country processing for the energy transition',
      heroImage: '/images/sections/mining-open-pit.jpg',
      sectionImage1: '/images/sections/mining-processing.jpg',
      sectionImage2: '/images/sections/mining-smelter.jpg',
      sectionImage3: '/images/sections/mining-phosphate.jpg',
      sectionImage4: '/images/sections/mining-lab.jpg',
      overview: 'Harch Mining extracts and processes strategic minerals — phosphates, cobalt, and rare earths — building in-country processing capacity that captures the value chain for Africa. While the continent holds 30% of global mineral reserves, it captures less than 5% of the value. We change that equation by processing minerals where they are extracted.',
      strategicContext: 'The global energy transition is creating unprecedented demand for critical minerals. Electric vehicle batteries require cobalt and rare earths; solar panels need silicon and tellurium; wind turbines depend on rare earth permanent magnets; and fertilizer production requires phosphate. Africa holds world-class reserves of all these minerals, yet remains primarily a raw material exporter.',
      marketAnalysis: 'The global critical minerals market is valued at $320 billion and growing at 12% CAGR. Africa\'s share of global reserves is staggering: 75% of phosphate (Morocco), 60% of cobalt (DRC), and significant rare earth deposits. Harch Mining\'s strategy of in-country processing captures 5-8x more value per tonne versus raw ore export.',
      sustainability: 'Harch Mining operates under a zero-harm environmental framework. All operations are ISO 14001 certified with zero tailings discharge through dry stacking technology. Progressive rehabilitation plans restore mined land within 5 years. All processing is powered by Harch Energy\'s renewable infrastructure.',
      investment: '$200M',
      metrics: [
        { value: 75, prefix: '', suffix: '%', label: 'World Phosphates (Morocco)' },
        { value: 70, prefix: '', suffix: '%', label: 'World Cobalt (DRC)' },
        { value: 3, prefix: '', suffix: '', label: 'Target Minerals' },
        { value: 200, prefix: '$', suffix: 'M', label: 'Investment' },
      ],
      capabilities: [
        { icon: Mountain, title: 'Phosphate Mining & Processing', desc: 'Large-scale phosphate extraction and processing for fertilizer production from Morocco\'s world-class deposits. Integrated operation mines, beneficiates, and processes phosphate rock into merchant-grade products — capturing 5x more value than raw ore export.' },
        { icon: Cpu, title: 'Cobalt Extraction & Refining', desc: 'Cobalt extraction and refining for battery production from Mauritanian deposits. Hydrometallurgical processing plant produces battery-grade cobalt sulfate and cobalt hydroxide.' },
        { icon: Globe, title: 'Rare Earth Element Processing', desc: 'Rare earth element extraction and separation for electronics and defense applications. In-country processing eliminates dependency on Chinese supply chains. Separation plant produces individual rare earth oxides to 99.9% purity.' },
        { icon: Shield, title: 'Environmental Stewardship', desc: 'ISO 14001 environmental management with zero tailings discharge through dry stacking technology. Progressive rehabilitation programs restore mined land within 5 years.' },
        { icon: Zap, title: 'Renewable-Powered Processing', desc: 'All mining and processing powered by Harch Energy\'s renewable infrastructure. Zero-carbon minerals for the energy transition — 80% lower lifecycle emissions than Chinese-processed alternatives.' },
        { icon: BarChart3, title: 'Export Infrastructure', desc: 'Port and rail infrastructure for efficient mineral export to European and Asian markets. Direct shipping routes reduce logistics costs by 30%.' },
      ],
      specTable: [
        { spec: 'Phosphate Output', value: '5M t/yr', phase: 'Morocco operations' },
        { spec: 'Cobalt Output', value: '10K t/yr', phase: 'Mauritania operations' },
        { spec: 'Rare Earths', value: '2K t/yr', phase: 'Exploration phase' },
        { spec: 'Processing', value: 'In-country', phase: 'Full refining to product' },
        { spec: 'Environmental Standard', value: 'ISO 14001', phase: 'Zero discharge' },
        { spec: 'Energy Source', value: '100% Renewable', phase: 'Harch Energy supply' },
        { spec: 'Export Routes', value: '3 Atlantic Ports', phase: 'Direct shipping access' },
        { spec: 'Rehabilitation', value: 'Progressive', phase: '5-year restoration cycle' },
        { spec: 'Value Capture vs Export', value: '5-8x', phase: 'Refined product premium' },
        { spec: 'Carbon vs Chinese Processing', value: '80% lower', phase: 'Green premium eligible' },
      ],
      milestones: [
        { year: '2025 Q3', title: 'Exploration Rights Secured', desc: 'Mining exploration rights secured in Mauritania for cobalt deposits.' },
        { year: '2026 Q2', title: 'Resource Assessment Complete', desc: 'Full geological survey and JORC-compliant resource assessment completed. Resources exceed initial projections by 25%.' },
        { year: '2027 Q1', title: 'Mining Permits Approved', desc: 'Extraction and processing permits approved by Mauritanian Ministry of Mines.' },
        { year: '2027 Q4', title: 'Processing Plant Construction', desc: 'Hydrometallurgical processing plant construction begins.' },
        { year: '2028 Q2', title: 'Processing Plant Operational', desc: 'Mineral processing plant construction completed and commissioned. First cobalt sulfate and hydroxide production.' },
        { year: '2029 Q1', title: 'Full Production Achieved', desc: 'All three minerals in production. Export operations via Nouakchott port fully operational.' },
      ],
      stats: [
        { stat: 'Value Capture vs Raw Export', value: 85, max: 100 },
        { stat: 'Renewable Energy Usage', value: 100, max: 100 },
        { stat: 'Carbon Reduction vs Peers', value: 80, max: 100 },
        { stat: 'Supply Chain Independence', value: 75, max: 100 },
      ],
      location: 'Mauritania',
      locationDesc: 'Rich mineral deposits in Mauritania\'s Archean greenstone belts with Atlantic port access at Nouakchott for efficient export. Proximity to European markets reduces shipping time and costs.',
      strategicAdvantages: [
        { title: 'In-Country Processing Premium', desc: 'Refining minerals where they are extracted captures 5-8x more value per tonne versus raw ore export. This model creates industrial jobs, generates tax revenue, and builds domestic processing expertise.' },
        { title: 'Zero-Carbon Minerals', desc: '100% renewable-powered processing gives Harch Mining an 80% carbon advantage versus Chinese-processed minerals, commanding green premiums of 10-15% in ESG-sensitive markets.' },
        { title: 'Non-Chinese Supply Chain', desc: 'Rare earth and cobalt processing outside Chinese jurisdiction provides supply chain security for Western defense and technology customers.' },
        { title: 'Integrated Harch Energy Supply', desc: 'Dedicated renewable energy from Harch Energy at $0.03/kWh eliminates energy cost volatility — the single largest operating cost in mineral processing.' },
      ],
      partnershipModel: [
        { title: 'Strategic Mineral Offtake', desc: 'Long-term supply agreements with battery manufacturers, electronics companies, and defense contractors.' },
        { title: 'Joint Mining Ventures', desc: 'Partnership structures with international mining companies seeking African market entry.' },
        { title: 'Government Revenue Sharing', desc: 'Transparent revenue sharing with host governments exceeding industry standards.' },
        { title: 'Circular Mineral Flows', desc: 'Partnerships with battery recyclers and electronics manufacturers for end-of-life mineral recovery.' },
      ],
      competitorHarchName: 'Harch Mining',
      competitorAccentColor: '#8B9DAF',
      competitors: [
        {
          name: 'Glencore', country: 'Switzerland', founded: '1974', revenue: '$230B (2024)',
          metrics: [
            { label: 'Renewable-Powered Processing', harchValue: '100% — Harch Energy', competitorValue: '<15% — mostly fossil', harchWins: true },
            { label: 'Carbon vs Chinese Processing', harchValue: '80% lower', competitorValue: 'Industry average — no advantage', harchWins: true, harchNumeric: 20, competitorNumeric: 100, barMax: 100, lowerIsBetter: true },
            { label: 'Value Capture per Tonne', harchValue: '5-8x vs raw ore export', competitorValue: '2-3x', harchWins: true },
            { label: 'Green Premium (EU CBAM)', harchValue: '10-15% premium eligible', competitorValue: 'No green premium — carbon penalty risk', harchWins: true },
            { label: 'Energy Cost /kWh', harchValue: '$0.03 (Harch Energy)', competitorValue: '$0.06-0.10 (grid/market)', harchWins: true, harchNumeric: 3, competitorNumeric: 8, barMax: 12, lowerIsBetter: true },
            { label: 'Tailings Management', harchValue: 'Dry stacking — zero discharge', competitorValue: 'Conventional — dam failure risk', harchWins: true },
            { label: 'Cross-Vertical Integration', harchValue: 'Energy + Technology + Water + Cement', competitorValue: 'None — mining only', harchWins: true },
          ],
          verdict: 'Glencore mines more cobalt. Harch Mining mines smarter — 100% renewable, 80% lower carbon, 5-8x value capture, green premium eligible from day one.',
        },
        {
          name: 'OCP Group', country: 'Morocco', founded: '1920', revenue: '$11.4B (2025)',
          metrics: [
            { label: 'Green Processing', harchValue: '100% renewable — day one', competitorValue: '$13B green plan — target 2040', harchWins: true },
            { label: 'Mineral Diversity', harchValue: '3 strategic minerals for energy transition', competitorValue: '1 mineral (phosphate) — food security only', harchWins: true },
            { label: 'EU CBAM Readiness', harchValue: 'Already compliant — zero-carbon processing', competitorValue: 'Transitioning — carbon penalties until 2040', harchWins: true },
            { label: 'Cobalt Processing', harchValue: 'Battery-grade cobalt sulfate — direct', competitorValue: 'None — phosphate only', harchWins: true },
            { label: 'Rare Earth Processing', harchValue: '99.9% purity — non-Chinese supply', competitorValue: 'None — no REE capability', harchWins: true },
          ],
          verdict: 'OCP dominates phosphate. Harch Mining dominates the energy transition mineral stack — cobalt for batteries, rare earths for defense, phosphate for food.',
        },
      ],
    },
    agriculture: {
      name: 'Harch Agri', version: '/0.6',
      heroTitle: "Precision Agriculture\nfor Africa",
      heroSubtitle: 'IoT, drones, vertical farms, and carbon credits — 5 countries, 11,800+ sensors, 24,700+ hectares',
      heroImage: '/images/sections/agri-aerial-drone.jpg',
      sectionImage1: '/images/sections/agri-drone.jpg',
      sectionImage2: '/images/sections/agri-iot-sensor.jpg',
      sectionImage3: '/images/sections/agri-vertical-farm.jpg',
      sectionImage4: '/images/sections/agri-green-crops-aerial.jpg',
      overview: 'Harch Agri deploys precision farming, IoT sensors, and vertical farming technology across Africa\'s 60% of the world\'s uncultivated arable land. Our approach combines cutting-edge technology with deep local knowledge to convert untapped potential into food security and export revenue.',
      strategicContext: 'Africa holds 60% of the world\'s uncultivated arable land — approximately 600 million hectares — yet the continent remains a net food importer, spending $35 billion annually on food imports. This paradox results from low yields, limited irrigation, and post-harvest losses exceeding 30%. Harch Agri addresses each of these constraints with technology-driven solutions.',
      marketAnalysis: 'Africa\'s agriculture and food market is valued at $280 billion and growing at 6% CAGR. The addressable opportunity includes $35 billion in current food import substitution, $50 billion in export potential for high-value crops, and $20 billion in agricultural technology services.',
      sustainability: 'Sustainability is foundational to Harch Agri\'s business model. Precision irrigation systems reduce water usage by 60% while increasing yields by 30%. Drone-enabled precision spraying reduces chemical usage by 90%. Vertical farming uses 95% less water and 99% less land than field agriculture. All energy is supplied by Harch Energy\'s renewable infrastructure.',
      investment: '$150M',
      metrics: [
        { value: 60, prefix: '', suffix: '%', label: 'Uncultivated Arable Land' },
        { value: 50, prefix: '$', suffix: 'B/yr', label: 'Food Import Bill' },
        { value: 100000, prefix: '', suffix: ' ha', label: 'Target by 2030' },
        { value: 150, prefix: '$', suffix: 'M', label: 'Investment' },
      ],
      capabilities: [
        { icon: Cpu, title: 'Precision Farming Platform', desc: 'IoT sensor networks and AI-optimized crop management. Real-time monitoring enables precision application of water, fertilizer, and crop protection — reducing inputs by 40% while increasing yields by 30%.' },
        { icon: Globe, title: 'Autonomous Drone Fleet', desc: 'Autonomous drone fleets for crop surveillance, pest detection, and precision spraying. 50+ drone fleet covers 5,000 hectares daily with multispectral imaging. 10x faster than traditional methods with 90% less chemical usage.' },
        { icon: Wheat, title: 'Vertical Farming Facilities', desc: 'Indoor vertical farming for high-value crops. 95% less water, 10x yield per square meter, year-round production. Our first 3 facilities serve European export markets with premium organic produce.' },
        { icon: Shield, title: 'Farm-to-Market Supply Chain', desc: 'Integrated supply chain infrastructure from farm gate to export market. Cold chain logistics, processing facilities, and export networks. Post-harvest loss rate below 5% versus African average of 30%+.' },
        { icon: Droplets, title: 'AI-Optimized Irrigation', desc: 'Smart irrigation systems reducing water usage by 60% while increasing yields by 30%. Powered by Harch Water desalination infrastructure and solar-powered pumps.' },
        { icon: BarChart3, title: 'Market Intelligence Platform', desc: 'AI-powered commodity pricing and demand forecasting enabling farmers to time sales for maximum revenue and plan crops for optimal market conditions.' },
      ],
      specTable: [
        { spec: 'Trial Area', value: '5,000 ha', phase: 'Senegal River Valley' },
        { spec: 'IoT Sensors', value: '10,000+', phase: 'Soil + weather + crop' },
        { spec: 'Drone Fleet', value: '50+ units', phase: 'Autonomous operations' },
        { spec: 'Vertical Farms', value: '3 Facilities', phase: 'Under development' },
        { spec: 'Water Reduction', value: '60%', phase: 'vs. traditional irrigation' },
        { spec: 'Yield Increase', value: '30%', phase: 'vs. traditional farming' },
        { spec: 'Chemical Reduction', value: '90%', phase: 'Drone precision spraying' },
        { spec: 'Export Crops', value: '12 Types', phase: 'High-value organic' },
        { spec: 'Post-Harvest Loss', value: '<5%', phase: 'vs. 30% African average' },
        { spec: 'Energy Source', value: '100% Renewable', phase: 'Harch Energy supply' },
      ],
      milestones: [
        { year: '2025 Q2', title: 'Precision Farming Trial Launch', desc: '5,000-hectare precision farming trial launched in Senegal River Valley.' },
        { year: '2026 Q1', title: 'IoT Network Fully Deployed', desc: '10,000+ IoT sensors deployed. Data pipeline and AI analytics platform operational.' },
        { year: '2026 Q4', title: 'First Harvest Results', desc: 'First precision farming harvest demonstrates 25% yield improvement and 50% water savings.' },
        { year: '2027 Q2', title: 'Drone Fleet Operational', desc: 'Autonomous drone fleet operational for crop monitoring and precision spraying.' },
        { year: '2028 Q1', title: 'Vertical Farm Commissioning', desc: 'First vertical farming facility commissioned and producing. European export contracts signed.' },
        { year: '2029 Q2', title: 'Full Agricultural Operations', desc: 'All Agri systems operational at scale. Export revenue flowing. Second phase expansion initiated.' },
      ],
      stats: [
        { stat: 'Yield Improvement', value: 75, max: 100 },
        { stat: 'Water Efficiency', value: 85, max: 100 },
        { stat: 'Chemical Reduction', value: 90, max: 100 },
        { stat: 'Post-Harvest Loss Reduction', value: 83, max: 100 },
      ],
      location: 'Senegal',
      locationDesc: 'Prime agricultural land in the Senegal River Valley with year-round growing seasons, reliable irrigation water, and proximity to Dakar port for European export.',
      strategicAdvantages: [
        { title: 'Technology-Driven Yield Gap Closure', desc: 'Africa\'s yield gap represents the largest untapped agricultural opportunity globally. Precision farming technology can close 60-80% of this gap within 3 growing seasons.' },
        { title: 'Integrated Water-Energy-Agri Nexus', desc: 'Harch Water provides desalinated irrigation water, Harch Energy supplies solar-powered pumps, and Harch Technology delivers IoT and AI analytics — an integrated stack no standalone agri company can replicate.' },
        { title: 'European Export Proximity', desc: 'Senegal\'s location provides 4-day shipping to European markets versus 14+ days from Asian and South American competitors.' },
        { title: 'Food Security Mandate', desc: 'Government food security programs across West Africa provide guaranteed offtake and subsidy support for domestic food production.' },
      ],
      partnershipModel: [
        { title: 'Contract Farming', desc: 'Managed farming services for landowners and investors. Guaranteed minimum returns with profit sharing above threshold.' },
        { title: 'AgTech Licensing', desc: 'Precision farming platform licensing for agricultural cooperatives and development organizations. SaaS model with per-hectare pricing.' },
        { title: 'Export Joint Ventures', desc: 'Partnerships with European food distributors and retailers for premium African produce.' },
        { title: 'Development Finance Partnerships', desc: 'Collaborative programs with IFAD, AfDB, and bilateral development agencies for smallholder farmer technology transfer.' },
      ],
      competitorHarchName: 'Harch Agri',
      competitorAccentColor: '#4A7B5F',
      competitors: [
        {
          name: 'AeroFarms', country: 'USA', founded: '2004', revenue: 'Post-Ch.11 restructuring',
          metrics: [
            { label: 'Integrated Product Stack', harchValue: '5 products (Drone+IoT+Vertical+Carbon+Kit)', competitorValue: '1 product (aeroponic farm only)', harchWins: true },
            { label: 'Financial Stability', harchValue: '$150M pipeline — growing', competitorValue: 'Chapter 11 in 2023 — rescued', harchWins: true },
            { label: 'African Operations', harchValue: 'Senegal + Morocco — building now', competitorValue: 'None — USA only', harchWins: true },
            { label: 'Energy Cost', harchValue: '$0.03/kWh (Harch Energy solar)', competitorValue: '$0.12-0.18/kWh (US grid)', harchWins: true, harchNumeric: 3, competitorNumeric: 15, barMax: 20, lowerIsBetter: true },
            { label: 'Carbon Credits Revenue', harchValue: 'Yes — Verra VCS + Gold Standard', competitorValue: 'None', harchWins: true },
            { label: 'Cross-Vertical Synergy', harchValue: 'Harch Energy + Water + Technology', competitorValue: 'None — standalone farm', harchWins: true },
            { label: 'Drone Fleet', harchValue: '50+ autonomous drones', competitorValue: '0 — no drone capability', harchWins: true },
            { label: 'IoT Network', harchValue: '10,000+ sensors — real-time', competitorValue: '0 — no IoT capability', harchWins: true },
          ],
          verdict: '3 of 4 major vertical farm competitors went bankrupt. Harch Agri enters at market bottom with 5 integrated products, 4x lower energy costs, and 30M underserved African farmers.',
        },
        {
          name: 'CropX / Climate Corp', country: 'USA / Israel', founded: '2013 / 2006', revenue: '$50B+ (Bayer total)',
          metrics: [
            { label: 'Smallholder Focus', harchValue: 'Yes — 30M African smallholders', competitorValue: 'No — US/BR large farms only', harchWins: true },
            { label: 'Drone-as-a-Service', harchValue: 'Yes — $50/ha/month', competitorValue: 'None — software platform only', harchWins: true },
            { label: 'IoT + Irrigation Integration', harchValue: 'Full stack — sensors + irrigation + AI', competitorValue: 'Partial — sensing only, no irrigation', harchWins: true },
            { label: 'Carbon Credits for Farmers', harchValue: 'Yes — 2% commission, Verra VCS', competitorValue: 'Indigo Ag (US only, not Africa)', harchWins: true },
            { label: 'African Operations', harchValue: '5,000 ha trials — Senegal + Morocco', competitorValue: '0 hectares in Africa', harchWins: true },
            { label: 'Starter Kit Price', harchValue: '$200 — 3 sensors + LoRaWAN gateway', competitorValue: '$749-$1,499/year (US pricing)', harchWins: true, harchNumeric: 200, competitorNumeric: 749, barMax: 1500, lowerIsBetter: true },
          ],
          verdict: 'CropX and Climate Corp serve American commercial farms at $749/year. Harch Agri serves 30M African smallholders at $200 — with drones, IoT irrigation, carbon credits, and vertical farms they don\'t offer.',
        },
      ],
    },
    water: {
      name: 'Harch Water', version: '/0.7',
      heroTitle: "Solving Africa's\nWater Crisis",
      heroSubtitle: '200M m3/yr desalination with AI-optimized distribution for industrial and community needs',
      heroImage: '/images/sections/water-desal-plant.jpg',
      sectionImage1: '/images/sections/water-desal.jpg',
      sectionImage2: '/images/sections/water-treatment.jpg',
      sectionImage3: '/images/sections/water-control-room.jpg',
      sectionImage4: '/images/sections/water-dam.jpg',
      overview: 'Harch Water deploys 200M m3/yr desalination capacity with AI-optimized distribution, solving Africa\'s water security crisis at continental scale. Every project allocates 10% of capacity for community use at no cost, ensuring that industrial development and human needs are met simultaneously.',
      strategicContext: 'Over 400 million Africans lack access to clean water, and 700 million lack adequate sanitation. Climate change is intensifying water stress across the Sahel and North Africa. Desalination powered by renewable energy represents the only scalable, climate-resilient solution. Harch Water builds this solution at the scale the continent requires.',
      marketAnalysis: 'Africa\'s water infrastructure market is valued at $25 billion annually and growing at 10% CAGR. Desalination specifically is the fastest-growing segment, with Africa\'s installed capacity projected to grow from 6M m3/day to 25M m3/day by 2030.',
      sustainability: 'Harch Water\'s desalination plants are powered entirely by Harch Energy\'s renewable infrastructure. Energy recovery devices reduce power consumption to 2.5 kWh/m3 — 40% below industry average. Brine management follows best-practice diffusion protocols that protect marine ecosystems. The 10% community allocation provides clean water for 50M+ people at zero cost.',
      investment: '$150M',
      metrics: [
        { value: 200, prefix: '', suffix: 'M m³/yr', label: 'Desalination Capacity' },
        { value: 400, prefix: '', suffix: 'M', label: 'People Without Safe Water' },
        { value: 25, prefix: '', suffix: '', label: 'Water-Stressed Countries' },
        { value: 150, prefix: '$', suffix: 'M', label: 'Investment' },
      ],
      capabilities: [
        { icon: Waves, title: 'Reverse Osmosis Desalination', desc: 'Latest-generation reverse osmosis desalination plants powered by Harch Energy\'s renewable infrastructure. 200M m3/yr capacity with energy consumption of just 2.5 kWh/m3.' },
        { icon: Cpu, title: 'AI-Optimized Distribution', desc: 'AI-optimized water distribution networks that reduce waste by 40% and ensure equitable allocation between industrial and community users.' },
        { icon: Globe, title: 'Smart Network Monitoring', desc: 'IoT-enabled water distribution networks with real-time monitoring, leak detection, and predictive maintenance. 10,000+ sensors with 99.5% network uptime.' },
        { icon: Shield, title: 'Water Quality Assurance', desc: 'Multi-stage filtration and continuous quality monitoring ensuring WHO-standard drinking water for all community allocations.' },
        { icon: Zap, title: 'Energy Recovery Systems', desc: 'Advanced energy recovery devices reducing energy consumption by 40% versus conventional systems. Powered by Harch Energy at $0.03/kWh — producing water at $0.45/m3.' },
        { icon: BarChart3, title: 'Community Water Access', desc: '10% of all desalination capacity allocated for community use at zero cost — providing clean water for 50M+ people across our operating regions.' },
      ],
      specTable: [
        { spec: 'Total Capacity', value: '200M m3/yr', phase: 'Full build-out' },
        { spec: 'Technology', value: 'Reverse Osmosis', phase: 'Latest generation membranes' },
        { spec: 'Energy Use', value: '2.5 kWh/m3', phase: 'Industry-leading efficiency' },
        { spec: 'Recovery Rate', value: '45%', phase: 'High-efficiency membranes' },
        { spec: 'Community Allocation', value: '10% Free', phase: '20M m3/yr for communities' },
        { spec: 'Network Uptime', value: '99.5%', phase: 'IoT monitoring systems' },
        { spec: 'Water Quality', value: 'WHO Standard', phase: 'Continuous monitoring' },
        { spec: 'Leak Detection', value: 'AI-Powered', phase: 'Real-time alerting' },
        { spec: 'Production Cost', value: '$0.45/m3', phase: 'Renewable energy powered' },
        { spec: 'Brine Management', value: 'Diffusion Protocol', phase: 'Marine ecosystem protection' },
      ],
      milestones: [
        { year: '2025 Q3', title: 'Pilot Desalination Launch', desc: 'Pilot desalination project launched in southern Morocco. 10,000 m3/day capacity validating technology.' },
        { year: '2026 Q2', title: 'Pilot Results Validated', desc: 'Pilot project achieves all performance targets: 2.5 kWh/m3 energy consumption, 45% recovery rate.' },
        { year: '2026 Q4', title: 'AI Distribution Platform', desc: 'AI-optimized distribution system validated. Leak detection reducing losses by 35%.' },
        { year: '2027 Q3', title: 'First Full-Scale Plant', desc: 'First full-scale 50M m3/yr desalination plant construction begins.' },
        { year: '2029 Q1', title: 'First Plant Online', desc: 'First desalination plant operational. 50M m3/yr capacity serving industrial and community needs.' },
        { year: '2030 Q4', title: 'Full 200M m3/yr Capacity', desc: '200M m3/yr total capacity operational. 50M+ people receiving community water access.' },
      ],
      stats: [
        { stat: 'Energy Efficiency vs Average', value: 90, max: 100 },
        { stat: 'Network Loss Reduction', value: 85, max: 100 },
        { stat: 'Community Access Target', value: 75, max: 100 },
        { stat: 'Cost Competitiveness', value: 88, max: 100 },
      ],
      location: 'Mali',
      locationDesc: 'Operations across water-stressed regions of West Africa with critical community needs. Initial deployment in southern Morocco with expansion to Mali and the Sahel corridor.',
      strategicAdvantages: [
        { title: 'Renewable-Powered Cost Leadership', desc: 'Desalination at $0.45/m3 — 40% below grid-powered plants — thanks to Harch Energy\'s $0.03/kWh renewable electricity. This structural cost advantage is permanent.' },
        { title: 'Cross-Vertical Integration', desc: 'Every Harch vertical requires water — for cooling data centers, mixing cement, irrigating crops, and processing minerals. Captive demand base provides revenue floor.' },
        { title: 'AI-Optimized Distribution', desc: 'Proprietary AI distribution platform reduces network losses to <5% versus the African average of 40%+.' },
        { title: 'Community Mandate', desc: 'The 10% free community allocation builds social license, government support, and development finance eligibility that purely commercial operators cannot access.' },
      ],
      partnershipModel: [
        { title: 'Industrial Water Supply', desc: 'Long-term water supply agreements with mining companies, industrial parks, and agricultural operations.' },
        { title: 'Government Water Concessions', desc: 'Public-private partnerships for municipal water supply and distribution. Build-operate-transfer models.' },
        { title: 'Community Water Programs', desc: 'Collaborative programs with UNICEF, WaterAid, and government agencies for rural water access.' },
        { title: 'Development Finance Partnerships', desc: 'Project finance structures with AfDB, IFC, and bilateral development finance institutions.' },
      ],
      competitorHarchName: 'Harch Water',
      competitorAccentColor: '#8B9DAF',
      competitors: [
        {
          name: 'Veolia', country: 'France', founded: '1853', revenue: '$45B (2024)',
          metrics: [
            { label: 'Production Cost', harchValue: '$0.45/m³', competitorValue: '$0.60-1.00/m³', harchWins: true, harchNumeric: 45, competitorNumeric: 80, barMax: 100, lowerIsBetter: true },
            { label: 'Energy Use', harchValue: '2.5 kWh/m³', competitorValue: '3.0-4.0 kWh/m³', harchWins: true, harchNumeric: 2.5, competitorNumeric: 3.5, barMax: 5, lowerIsBetter: true },
            { label: 'Network Losses', harchValue: '<5%', competitorValue: '15-25% typical', harchWins: true },
            { label: 'AI Distribution', harchValue: 'Proprietary — real-time', competitorValue: 'Limited (Xylem third-party)', harchWins: true },
            { label: 'Community Allocation', harchValue: '10% free', competitorValue: '0% — commercial only', harchWins: true },
            { label: 'Renewable Energy', harchValue: '100% — Harch Energy', competitorValue: 'Grid mix — partial', harchWins: true },
            { label: 'Carbon Intensity', harchValue: 'Near-zero — 100% renewable', competitorValue: 'High — fossil-fueled plants', harchWins: true },
            { label: 'Cross-Vertical Integration', harchValue: '5 subsidiaries — industrial ecosystem', competitorValue: 'None — standalone water', harchWins: true },
            { label: 'Delivered Cost', harchValue: '$0.50/m³ (all-in)', competitorValue: '$0.75-1.20/m³ (with distribution losses)', harchWins: true, harchNumeric: 50, competitorNumeric: 97, barMax: 120, lowerIsBetter: true },
          ],
          verdict: 'Veolia builds the biggest desal plant in Africa at 2x our cost and 3x our energy use, losing 20% of water in distribution. Harch Water builds the smartest — 40% cheaper, 60% less energy, 5x fewer network losses.',
        },
        {
          name: 'IDE Technologies', country: 'Israel', founded: '1965', revenue: '$1B+ (est.)',
          metrics: [
            { label: 'Production Cost', harchValue: '$0.45/m³', competitorValue: '$0.50-0.60/m³', harchWins: true, harchNumeric: 45, competitorNumeric: 55, barMax: 70, lowerIsBetter: true },
            { label: 'Energy Use', harchValue: '2.5 kWh/m³', competitorValue: '3.0-3.5 kWh/m³', harchWins: true, harchNumeric: 2.5, competitorNumeric: 3.25, barMax: 4.5, lowerIsBetter: true },
            { label: 'AI Distribution', harchValue: 'Proprietary platform — 10K+ sensors', competitorValue: 'None — no distribution tech', harchWins: true },
            { label: 'Community Allocation', harchValue: '10% free — 20M m³/yr', competitorValue: '0%', harchWins: true },
            { label: 'Africa Operations', harchValue: 'Mali + Morocco — building now', competitorValue: 'None — Israel/Middle East only', harchWins: true },
            { label: 'Renewable Energy', harchValue: '100% — Harch Energy', competitorValue: 'Grid-powered — no renewable supply', harchWins: true },
          ],
          verdict: 'IDE builds excellent desal plants — in Israel. Harch Water builds excellent desal systems in Africa — plant + AI distribution + community allocation + 100% renewable power. Plant vs system. No contest.',
        },
      ],
    },
  };

  const data = subsidiaryData[slug];
  if (!data) return <div className="pt-40 pb-20 text-center"><h1 className="text-2xl font-bold">Page not found</h1></div>;

  const accent = accentMap[slug] ?? '#8B9DAF';

  /* ═══════════════════════════════════════════════════════════════
      RENDERING — unified design system + real images + animations
      ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[85vh] flex items-end overflow-hidden">
        <ParallaxSection speed={0.25} className="absolute inset-0">
          <Image
            src={data.heroImage}
            alt={data.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/80 to-[#0D0D0D]/30" />
        </ParallaxSection>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pb-20 md:pb-32 w-full">
          <FadeIn>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
                <span className="version-tag">{data.name} {data.version}</span>
              </span>
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm"
                style={{ backgroundColor: `${accent}20`, border: `1px solid ${accent}40` }}
              >
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: accent }}>
                  {data.investment} Investment
                </span>
              </span>
            </div>
          </FadeIn>

          <TextReveal
            text={data.heroTitle}
            className="text-4xl md:text-5xl lg:text-[72px] font-extrabold text-white leading-[1.05] tracking-[-0.02em] mb-4 whitespace-pre-line"
          />

          <FadeIn delay={0.4}>
            <p className="text-lg md:text-xl text-white/70 max-w-xl mb-8">{data.heroSubtitle}</p>
            <MagneticButton>
              <SmoothLink href="/subsidiaries" className="text-white/80 text-sm">
                Explore All Subsidiaries
              </SmoothLink>
            </MagneticButton>
          </FadeIn>

          {subsidiaryVideoMap[slug] && (
            <FadeIn delay={0.55}>
              <div className="mt-10 w-full max-w-md">
                <VideoPlayer
                  src={subsidiaryVideoMap[slug]}
                  variant="modal-trigger"
                  label="Watch teaser (40s)"
                  className="w-full aspect-video"
                />
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════ INTERACTIVE PLATFORM ═══════════════ */}
      <InteractivePlatform slug={slug} accent={accent} />

      <SectionDivider />

      {/* ═══════════════ OVERVIEW — Image Left + Text Right ═══════════════ */}
      <section className="py-28 md:py-36 bg-[#111111]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <FadeIn direction="left">
              <div className="relative aspect-[4/3] rounded-[12px] overflow-hidden">
                <Image
                  src={data.sectionImage1}
                  alt={`${data.name} overview`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/40 to-transparent" />
              </div>
            </FadeIn>

            <div>
              <FadeIn>
                <p className="section-label mb-4" style={{ color: accent }}>Overview</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">{data.name}</h2>
                <div className="accent-line mb-6" />
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-8">{data.overview}</p>
              </FadeIn>

              <StaggerContainer className="grid grid-cols-2 gap-4" staggerDelay={0.1}>
                {data.metrics.map((m) => (
                  <StaggerItem key={m.label}>
                    <div className="card p-5 text-center">
                      <p className="text-2xl md:text-3xl font-bold text-white stat-mono">
                        <CountUp to={m.value} prefix={m.prefix} suffix={m.suffix} duration={2.5} />
                      </p>
                      <p className="text-[10px] text-[#666666] uppercase tracking-[0.1em] font-bold mt-1">{m.label}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ STRATEGIC CONTEXT — Reversed Split ═══════════════ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="lg:order-2">
              <FadeIn direction="right">
                <div className="relative aspect-[4/3] rounded-[12px] overflow-hidden">
                  <Image
                    src={data.sectionImage2}
                    alt={`${data.name} strategic context`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/40 to-transparent" />
                </div>
              </FadeIn>
            </div>

            <div className="lg:order-1">
              <FadeIn>
                <p className="section-label mb-4" style={{ color: accent }}>Strategic Context</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">Why This Matters</h2>
                <div className="accent-line mb-6" />
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">{data.strategicContext}</p>
                <SmoothLink href="/subsidiaries" className="text-sm" style={{ color: accent }}>
                  See All Subsidiaries
                </SmoothLink>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════ CAPABILITIES GRID ═══════════════ */}
      <section className="py-28 md:py-36 bg-[#111111]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4" style={{ color: accent }}>Capabilities</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">What We Build</h2>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
            {data.capabilities.map((cap) => (
              <StaggerItem key={cap.title}>
                <Card3D className="h-full" glareEnabled>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${accent}15` }}>
                    <span style={{ color: accent }}><cap.icon size={18} strokeWidth={1.5} /></span>
                  </div>
                  <h3 className="text-[14px] font-bold text-white mb-2">{cap.title}</h3>
                  <p className="text-[12px] text-[#999999] leading-relaxed">{cap.desc}</p>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════ STRATEGIC ADVANTAGES + STATS ═══════════════ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <FadeIn>
                <p className="section-label mb-4" style={{ color: accent }}>Strategic Advantages</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">Competitive Edge</h2>
                <div className="accent-line mb-8" />
              </FadeIn>

              <StaggerContainer className="space-y-4" staggerDelay={0.08}>
                {data.strategicAdvantages.map((adv) => (
                  <StaggerItem key={adv.title}>
                    <div className="card p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: accent }} />
                        <div>
                          <h4 className="text-[14px] font-bold text-white mb-1">{adv.title}</h4>
                          <p className="text-[12px] text-[#999999] leading-relaxed">{adv.desc}</p>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>

            <div>
              <FadeIn delay={0.15}>
                <p className="section-label mb-4" style={{ color: accent }}>Performance Metrics</p>
                <h3 className="text-2xl font-bold text-white mb-8">By the Numbers</h3>
              </FadeIn>

              <div className="space-y-2">
                {data.stats.map((s) => (
                  <StatBar key={s.stat} stat={s.stat} value={s.value} max={s.max} accent={accent} />
                ))}
              </div>

              <FadeIn delay={0.3}>
                <div className="mt-10 relative aspect-[4/3] rounded-[12px] overflow-hidden">
                  <Image
                    src={data.sectionImage3}
                    alt={`${data.name} performance`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/60 to-transparent" />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════ INVESTMENT & LOCATION ═══════════════ */}
      <section className="py-28 md:py-36 bg-[#111111]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <FadeIn>
              <p className="section-label mb-4" style={{ color: accent }}>Investment</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">Capital Deployment</h2>
              <div className="accent-line mb-8" />

              <div className="space-y-4 mb-8">
                <div className="card p-5">
                  <p className="text-[10px] text-[#666666] uppercase tracking-[0.1em] font-bold mb-1">Total Investment</p>
                  <p className="text-4xl font-bold text-white stat-mono" style={{ color: accent }}>{data.investment}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {data.metrics.slice(0, 2).map((m) => (
                    <div key={m.label} className="card p-4 text-center">
                      <p className="text-xl font-bold text-white stat-mono">
                        <CountUp to={m.value} prefix={m.prefix} suffix={m.suffix} duration={2} />
                      </p>
                      <p className="text-[10px] text-[#666666] uppercase tracking-[0.08em] font-bold mt-1">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <p className="section-label mb-4" style={{ color: accent }}>Location</p>
              <h3 className="text-2xl font-bold text-white mb-6">Strategic Position</h3>

              <div className="card p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span style={{ color: accent }}><MapPin size={18} /></span>
                  <span className="text-[14px] font-bold text-white">{data.location}</span>
                </div>
                <p className="text-[13px] text-[#999999] leading-[1.7]">{data.locationDesc}</p>
              </div>

              <div className="relative aspect-[16/9] rounded-[12px] overflow-hidden">
                <Image
                  src={data.sectionImage4}
                  alt={`${data.name} location`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full pulse-glow" style={{ backgroundColor: accent }} />
                  <span className="text-[11px] font-bold text-white tracking-[0.1em] uppercase">{data.location}</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════ TECH SPECS TABLE ═══════════════ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4" style={{ color: accent }}>Technical Specifications</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">Spec Sheet</h2>
            <div className="accent-line mb-10" />
          </FadeIn>

          <div className="card overflow-hidden !p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    <th className="text-left text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] px-6 py-4 w-[35%]">Specification</th>
                    <th className="text-left text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] px-6 py-4 w-[30%]">Value</th>
                    <th className="text-left text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] px-6 py-4 w-[35%]">Phase</th>
                  </tr>
                </thead>
                <tbody>
                  {data.specTable.map((row, i) => (
                    <motion.tr
                      key={row.spec}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className="border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    >
                      <td className="px-6 py-3.5 text-[13px] text-[#CCCCCC]">{row.spec}</td>
                      <td className="px-6 py-3.5 text-[13px] font-bold text-white stat-mono">{row.value}</td>
                      <td className="px-6 py-3.5 text-[12px] text-[#666666]">{row.phase}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════ SUSTAINABILITY ═══════════════ */}
      <section className="py-28 md:py-36 bg-[#111111]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <FadeIn>
              <p className="section-label mb-4" style={{ color: '#4A7B5F' }}>Sustainability</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">Built to Last</h2>
              <div className="accent-line mb-6" />
              <p className="text-[15px] text-[#999999] leading-[1.7]">{data.sustainability}</p>

              <div className="flex flex-wrap gap-2 mt-6">
                {['100% Renewable', 'Carbon-Aware', 'Circular Economy', 'Zero Waste'].map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.1em] uppercase"
                    style={{ backgroundColor: '#4A7B5F20', color: '#4A7B5F', border: '1px solid #4A7B5F30' }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="relative aspect-[4/3] rounded-[12px] overflow-hidden">
                <Image
                  src={data.sectionImage2}
                  alt={`${data.name} sustainability`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/50 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <Leaf size={14} className="text-[#4A7B5F]" />
                  <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#4A7B5F]">Sustainable by Design</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════ TIMELINE / MILESTONES ═══════════════ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4" style={{ color: accent }}>Timeline</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">Key Milestones</h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <div className="relative">
            {/* Animated vertical line */}
            <div className="absolute left-[19px] md:left-[23px] top-0 bottom-0 w-px bg-[rgba(255,255,255,0.06)]">
              <motion.div
                className="w-full"
                style={{ backgroundColor: accent, originY: 0 }}
                initial={{ height: '0%' }}
                whileInView={{ height: '100%' }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            <StaggerContainer className="space-y-8" staggerDelay={0.1}>
              {data.milestones.map((ms) => (
                <StaggerItem key={ms.year + ms.title}>
                  <div className="flex gap-6 md:gap-8 pl-0">
                    <div className="flex-shrink-0 relative z-10">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}20`, border: `2px solid ${accent}` }}>
                        <span style={{ color: accent }}><Calendar size={14} /></span>
                      </div>
                    </div>
                    <div className="pb-2">
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: accent }}>{ms.year}</p>
                      <h4 className="text-[15px] font-bold text-white mb-1">{ms.title}</h4>
                      <p className="text-[12px] text-[#999999] leading-relaxed">{ms.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════════ COMPETITIVE COMPARISON ═══════════════ */}
      {data.competitors && data.competitors.length > 0 && (
        <CompetitiveComparison
          title={`${data.competitorHarchName ?? data.name} vs Competition`}
          subtitle="Every dimension. Every metric. Every competitor."
          accentColor={data.competitorAccentColor ?? accent}
          sectionLabel="Competitive Landscape"
          competitors={data.competitors}
          harchName={data.competitorHarchName ?? data.name}
        />
      )}

      {/* ═══════════════ PARTNERSHIP MODEL ═══════════════ */}
      <section className="py-28 md:py-36 bg-[#111111]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4" style={{ color: accent }}>Partnership</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">How to Work With Us</h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.1}>
            {data.partnershipModel.map((pm) => (
              <StaggerItem key={pm.title}>
                <Card3D className="h-full" glareEnabled>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                    <h4 className="text-[14px] font-bold text-white">{pm.title}</h4>
                  </div>
                  <p className="text-[12px] text-[#999999] leading-relaxed">{pm.desc}</p>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D] via-[#0D0D0D] to-[#0D0D0D]" />
        <NetworkGrid nodeCount={30} maxDistance={100} opacity={0.04} />

        <div className="relative z-10 max-w-[800px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <p className="section-label mb-4" style={{ color: accent }}>{data.name}</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6">
              Ready to Build the Future?
            </h2>
            <p className="text-[15px] text-[#999999] leading-[1.7] mb-10">
              {data.name} is actively seeking strategic partners, investors, and customers who share our vision for African industrial sovereignty.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton className="inline-block">
                <Link
                  href={`/quote?vertical=${slug}`}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[13px] font-bold tracking-[0.05em] uppercase text-black bg-white transition-all duration-300 hover:scale-105"
                >
                  Request a Quote
                  <ArrowRight size={16} />
                </Link>
              </MagneticButton>
              <MagneticButton className="inline-block">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[13px] font-bold tracking-[0.05em] uppercase text-white border border-[rgba(255,255,255,0.15)] hover:border-[rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-105"
                >
                  Request Briefing
                  <ArrowRight size={16} />
                </Link>
              </MagneticButton>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
