// SEO Pricing Pages — GPU × Location × Duration combinations
// Generates pages like /pricing/h100-casablanca, /pricing/h200-rabat-monthly, etc.

export type GPUModel = {
  slug: string;
  name: string;
  memory: string;
  onDemandHourly: number;
  spotHourly: number;
  reservedHourly: number; // 1-year commitment
  tdp: number;
  bestFor: string;
  releaseYear: number;
};

export type PricingLocation = {
  slug: string;
  name: string;
  powerMultiplier: number; // 1.0 = base, <1 = cheaper, >1 = more expensive
  carbonIntensity: number; // gCO2/kWh
};

export const gpuModels: GPUModel[] = [
  {
    slug: 'h100',
    name: 'NVIDIA H100',
    memory: '80GB HBM3',
    onDemandHourly: 2.80,
    spotHourly: 1.00,
    reservedHourly: 2.10,
    tdp: 700,
    bestFor: 'Large model training (70B+), LLM inference, distributed training',
    releaseYear: 2023,
  },
  {
    slug: 'h200',
    name: 'NVIDIA H200',
    memory: '141GB HBM3e',
    onDemandHourly: 4.20,
    spotHourly: 1.50,
    reservedHourly: 3.15,
    tdp: 700,
    bestFor: 'Trillion-parameter models, very large LLMs, cutting-edge research',
    releaseYear: 2024,
  },
  {
    slug: 'a100-80gb',
    name: 'NVIDIA A100 80GB',
    memory: '80GB HBM2e',
    onDemandHourly: 2.00,
    spotHourly: 0.70,
    reservedHourly: 1.50,
    tdp: 400,
    bestFor: 'Inference, fine-tuning, cost-effective training on <30B models',
    releaseYear: 2020,
  },
  {
    slug: 'a100-40gb',
    name: 'NVIDIA A100 40GB',
    memory: '40GB HBM2e',
    onDemandHourly: 1.60,
    spotHourly: 0.55,
    reservedHourly: 1.20,
    tdp: 400,
    bestFor: 'Inference on smaller models, development, testing',
    releaseYear: 2020,
  },
  {
    slug: 'b200',
    name: 'NVIDIA B200',
    memory: '192GB HBM3e',
    onDemandHourly: 6.50,
    spotHourly: 2.30,
    reservedHourly: 4.88,
    tdp: 1000,
    bestFor: 'Next-gen trillion-parameter models, multi-modal AI, 2025 cutting edge',
    releaseYear: 2025,
  },
  {
    slug: 'l40s',
    name: 'NVIDIA L40S',
    memory: '48GB GDDR6',
    onDemandHourly: 1.20,
    spotHourly: 0.40,
    reservedHourly: 0.90,
    tdp: 350,
    bestFor: 'Inference, graphics, video AI, cost-effective vision workloads',
    releaseYear: 2023,
  },
  {
    slug: 'a10g',
    name: 'NVIDIA A10G',
    memory: '24GB GDDR6',
    onDemandHourly: 0.80,
    spotHourly: 0.25,
    reservedHourly: 0.60,
    tdp: 300,
    bestFor: 'Small model inference, development, cost-sensitive workloads',
    releaseYear: 2022,
  },
];

export const pricingLocations: PricingLocation[] = [
  { slug: 'casablanca', name: 'Casablanca', powerMultiplier: 1.0, carbonIntensity: 47 },
  { slug: 'rabat', name: 'Rabat', powerMultiplier: 0.98, carbonIntensity: 47 },
  { slug: 'tanger', name: 'Tangier', powerMultiplier: 0.92, carbonIntensity: 45 },
  { slug: 'marrakech', name: 'Marrakech', powerMultiplier: 0.95, carbonIntensity: 47 },
  { slug: 'agadir', name: 'Agadir', powerMultiplier: 0.90, carbonIntensity: 46 },
  { slug: 'dakhla', name: 'Dakhla', powerMultiplier: 0.85, carbonIntensity: 42 },
];

// Generate all GPU × Location pricing combinations
export function generatePricingPages() {
  const pages: { gpu: GPUModel; location: PricingLocation; slug: string }[] = [];
  for (const gpu of gpuModels) {
    for (const location of pricingLocations) {
      pages.push({
        gpu,
        location,
        slug: `${gpu.slug}-${location.slug}`,
      });
    }
  }
  return pages;
}

// Blog SEO articles
export type BlogArticle = {
  slug: string;
  title: string;
  category: 'gpu-cloud' | 'datacenter' | 'ai' | 'energy' | 'morocco' | 'business';
  shortDesc: string;
  metaDescription: string;
  keywords: string[];
  readTime: number;
  sections: { heading: string; content: string }[];
  relatedGlossary?: string[];
};

export const blogArticles: BlogArticle[] = [
  {
    slug: 'how-to-choose-gpu-for-ai-training',
    title: 'How to Choose the Right GPU for AI Training in 2025',
    category: 'gpu-cloud',
    shortDesc: 'Complete guide to choosing GPUs for AI training. Compare H100, H200, A100, B200. Memory, bandwidth, cost, and use cases explained.',
    metaDescription: 'GPU buying guide for AI training: H100 vs H200 vs A100 vs B200. Memory requirements, cost analysis, and recommendations for every model size.',
    keywords: ['best gpu for ai training', 'h100 vs h200', 'gpu selection guide', 'ai training gpu comparison'],
    readTime: 12,
    sections: [
      {
        heading: 'Why GPU Choice Matters for AI Training',
        content: 'Choosing the right GPU for AI training can mean the difference between a model that trains in 8 hours vs 30 days, and costs of $200 vs $500,000. The GPU you select affects: (1) Training speed — H100 is 4x faster than A100, (2) Maximum model size — H200 (141GB) can hold models 1.76x larger than H100 (80GB), (3) Cost — A100 spot at $0.70/hr is 4x cheaper than H200 on-demand at $4.20/hr, (4) Power consumption — B200 (1000W) needs liquid cooling, A10G (300W) can use air cooling. This guide helps you choose the optimal GPU for your specific workload, budget, and timeline.',
      },
      {
        heading: 'GPU Memory: The Most Important Spec',
        content: 'GPU memory (VRAM) determines the maximum model size you can train. Rule of thumb: model parameters × 2 bytes (FP16) + optimizer states + activations. Examples: (1) 7B model: needs ~28GB → A100 40GB or H100 80GB, (2) 13B model: needs ~52GB → A100 80GB or H100 80GB, (3) 70B model: needs ~140GB → H200 141GB or 2x H100 80GB with tensor parallelism, (4) 175B model: needs ~350GB → 4x H200 or 5x H100 with pipeline parallelism. If memory is your bottleneck, choose H200 (141GB) or wait for B200 (192GB).',
      },
      {
        heading: 'H100 vs H200 vs A100: Performance Comparison',
        content: 'Performance benchmarks (training throughput, higher is better): (1) 7B model training: A100 = 1.0x baseline, H100 = 3.5x, H200 = 4.0x, B200 = 12x, (2) 70B model training: A100 = 1.0x, H100 = 3.8x, H200 = 5.5x (memory advantage), B200 = 15x, (3) Inference (tokens/sec): A100 = 1.0x, H100 = 5x, H200 = 7x (FP8), B200 = 20x. The H100 offers the best price/performance for most workloads. H200 is worth the premium for very large models. B200 is for cutting-edge 2025 workloads.',
      },
      {
        heading: 'Cost Analysis: Total Training Cost',
        content: 'Example: Training a 13B parameter model on 1.5T tokens. (1) A100 80GB (8 GPUs, 72 hours): 8 × $2.00 × 72 = $1,152, (2) H100 (8 GPUs, 20 hours): 8 × $2.80 × 20 = $448, (3) H200 (4 GPUs, 15 hours): 4 × $4.20 × 15 = $252. Counterintuitively, H200 is cheapest because fewer GPUs needed (more memory) and faster (more bandwidth). Always calculate total cost, not just hourly rate.',
      },
      {
        heading: 'Spot vs On-Demand vs Reserved',
        content: 'Pricing modes: (1) On-demand — pay full price, guaranteed availability, best for inference and interactive workloads, (2) Spot — 60-70% discount, can be interrupted with 2-min notice, best for batch training with checkpointing, (3) Reserved — 25% discount for 1-year commitment, best for steady-state workloads. Strategy: Use spot for training experiments, on-demand for production inference, reserved for baseline capacity. Harch Corp offers all three modes.',
      },
      {
        heading: 'When to Choose Each GPU',
        content: 'Decision tree: (1) Training 70B+ models → H200 (141GB memory), (2) Training 13B-70B models → H100 (best price/performance), (3) Training 7B-13B models → A100 80GB (cost-effective), (4) Fine-tuning <7B models → A100 40GB or L40S, (5) Inference on 70B+ models → H100 or H200, (6) Inference on 13B-70B → A100 80GB, (7) Inference on <13B → L40S or A10G, (8) Cutting-edge 2025 research → B200. When in doubt, start with H100 — it\'s the versatile workhorse.',
      },
      {
        heading: 'Multi-GPU Considerations',
        content: 'For models larger than single GPU memory, use multi-GPU setups. (1) NVLink — 900 GB/s GPU-to-GPU (H100/H200), essential for tensor parallelism, (2) InfiniBand 400G — 50 GB/s node-to-node, for distributed training across nodes, (3) PCIe 5.0 — 64 GB/s, slower but cheaper. Harch Corp provides H100/H200 clusters with NVLink and 400G InfiniBand for maximum distributed training performance.',
      },
      {
        heading: 'Power and Cooling Requirements',
        content: 'High-end GPUs require significant power and cooling: (1) H100 SXM5 (700W) — requires liquid cooling, 50kW/rack density, (2) H200 (700W) — same as H100, (3) B200 (1000W) — requires advanced liquid cooling, 80kW/rack, (4) A100 (400W) — can use air cooling up to 20kW/rack, (5) L40S (350W) — air cooling standard. If your datacenter doesn\'t have liquid cooling, you\'re limited to A100 or L40S. Harch Corp provides liquid-cooled GPU racks up to 50kW.',
      },
      {
        heading: 'Recommendations by Use Case',
        content: 'By use case: (1) AI startup training first LLM: H100 spot (8 GPUs), $200-500 per experiment, (2) Enterprise fine-tuning: A100 80GB (cost-effective), (3) Research lab training 70B+: H200 (memory advantage), (4) Production inference (7B-13B): L40S (best $/token), (5) Production inference (70B+): H100 with TensorRT-LLM, (6) Government/sovereign AI: H100 in Morocco (data sovereignty), (7) Cutting-edge research: B200 (when available). Contact Harch Corp for custom recommendations.',
      },
    ],
    relatedGlossary: ['h100-gpu', 'h200-gpu', 'a100-gpu', 'b200-gpu', 'gpu-cloud', 'distributed-training'],
  },
  {
    slug: 'datacenter-pue-guide',
    title: 'Datacenter PUE: The Complete Guide to Power Usage Effectiveness',
    category: 'datacenter',
    shortDesc: 'Everything about PUE: calculation, benchmarks, optimization strategies. How to achieve PUE 1.08 like Harch Corp.',
    metaDescription: 'Complete PUE guide: formula, benchmarks (industry 1.55, best 1.10), optimization (liquid cooling, free cooling, AI HVAC). Achieve PUE 1.08.',
    keywords: ['pue guide', 'power usage effectiveness', 'datacenter efficiency', 'pue optimization', 'lower pue'],
    readTime: 10,
    sections: [
      {
        heading: 'What is PUE and Why It Matters',
        content: 'PUE (Power Usage Effectiveness) is the industry standard metric for datacenter energy efficiency, defined as: PUE = Total Facility Power ÷ IT Equipment Power. A PUE of 1.0 means all power goes to IT equipment (impossible in practice — some overhead is always needed). The closer to 1.0, the more efficient. PUE matters because: (1) Lower PUE = lower operating costs, (2) Lower PUE = lower carbon footprint, (3) PUE is a key metric for ESG reporting, (4) Many customers require PUE < 1.3 for sustainability commitments.',
      },
      {
        heading: 'How to Calculate PUE',
        content: 'PUE calculation: (1) Measure total facility power — includes IT equipment, cooling, lighting, UPS losses, (2) Measure IT equipment power — servers, storage, networking, (3) Divide: PUE = Total ÷ IT. Example: If your datacenter uses 1000kW total, and IT equipment uses 650kW, PUE = 1000 ÷ 650 = 1.54. The 350kW overhead is cooling (200kW), UPS losses (100kW), and lighting/other (50kW). Measure continuously — PUE varies with outside temperature and IT load.',
      },
      {
        heading: 'PUE Benchmarks: What\'s Good?',
        content: 'PUE benchmarks: (1) Industry average (2024): 1.55 (Uptime Institute), (2) Older datacenters (pre-2010): 2.0-3.0, (3) Typical enterprise: 1.6-1.8, (4) Modern hyperscale (AWS, Google, Azure): 1.10-1.20, (5) Best-in-class: 1.08-1.15, (6) Harch Corp Morocco: 1.08-1.24 (varies by season). If your PUE is above 1.6, there\'s significant room for improvement. If above 2.0, your datacenter is extremely inefficient by modern standards.',
      },
      {
        heading: 'Strategies to Lower PUE',
        content: 'PUE optimization strategies (by impact): (1) Liquid cooling — reduces PUE by 0.2-0.4 (from 1.6 to 1.2-1.4), (2) Free cooling (air-side economizer) — reduces PUE by 0.1-0.2 in temperate climates, (3) Hot/cold aisle containment — reduces PUE by 0.1-0.15, (4) AI-optimized HVAC — reduces PUE by 0.05-0.10, (5) Higher IT load (efficiency improves at higher utilization) — reduces PUE by 0.05-0.10, (6) Upgrade to modern UPS (97%+ efficiency) — reduces PUE by 0.05. Combine all for maximum savings.',
      },
      {
        heading: 'Liquid Cooling: The Biggest PUE Win',
        content: 'Liquid cooling is the single most effective PUE optimization. Types: (1) Direct-to-chip — cold plates on CPUs/GPUs, removes 60-70% of heat, (2) Immersion cooling — servers submerged in dielectric fluid, removes 95%+ of heat, (3) Rear-door heat exchangers — liquid-cooled doors on racks. Liquid cooling benefits: (1) PUE 1.05-1.15 (vs 1.4-1.6 for air), (2) Supports 50-100kW/rack density (vs 15-20kW for air), (3) Quieter operation, (4) Reduced HVAC energy. Harch Corp uses direct-to-chip liquid cooling for all GPU clusters.',
      },
      {
        heading: 'Free Cooling: Using Outside Air',
        content: 'Free cooling (air-side economization) uses outside air when temperature is below 24°C to cool datacenters, eliminating mechanical chillers. Suitability by climate: (1) Morocco — 5,000+ free cooling hours/year (excellent), (2) Ireland — 7,000+ hours (world-class), (3) Singapore — 500 hours (poor), (4) UAE — 1,500 hours (moderate). Morocco\'s temperate climate is ideal for free cooling, contributing to Harch Corp\'s low PUE. Combine with liquid cooling for year-round efficiency.',
      },
      {
        heading: 'AI-Optimized HVAC Control',
        content: 'Modern datacenters use AI to optimize cooling: (1) Predictive models forecast cooling needs based on IT load and weather, (2) Reinforcement learning adjusts setpoints in real-time, (3) Google\'s DeepMind reduced datacenter cooling energy by 40% with AI. Harch Corp uses AI-optimized HVAC that: (1) Monitors 10,000+ sensors in real-time, (2) Predicts cooling needs 1 hour ahead, (3) Optimizes CRAC setpoints, (4) Reduces cooling energy by 25-30%.',
      },
      {
        heading: 'Case Study: Harch Corp\'s PUE 1.08',
        content: 'How Harch Corp achieves PUE 1.08-1.24: (1) Direct-to-chip liquid cooling for all GPUs (removes 70% of heat), (2) Air-side free cooling when outside temp < 24°C (5,000 hours/year in Morocco), (3) AI-optimized HVAC (25% cooling energy reduction), (4) Hot aisle containment (prevents hot/cold air mixing), (5) High-efficiency UPS (97.5%), (6) High IT load (75%+ utilization). Result: PUE 1.08 in winter, 1.24 in summer (when mechanical cooling is needed). This is among the lowest in the world.',
      },
    ],
    relatedGlossary: ['pue', 'datacenter', 'liquid-cooling', 'carbon-intensity', 'renewable-energy'],
  },
  {
    slug: 'sovereign-ai-guide',
    title: 'Sovereign AI: A Complete Guide for Nations and Enterprises',
    category: 'ai',
    shortDesc: 'Complete guide to sovereign AI: what it is, why it matters, how to build it. Country case studies and implementation roadmap.',
    metaDescription: 'Sovereign AI guide: definition, importance, implementation. Case studies (France, China, India, Morocco). Build national AI infrastructure.',
    keywords: ['sovereign ai guide', 'ai sovereignty', 'national ai strategy', 'sovereign ai infrastructure'],
    readTime: 15,
    sections: [
      {
        heading: 'What is Sovereign AI?',
        content: 'Sovereign AI is a nation\'s capability to develop, deploy, and control artificial intelligence infrastructure within its borders, without dependence on foreign providers. It encompasses four pillars: (1) Compute infrastructure — domestic GPU clouds and datacenters, (2) Data sovereignty — data stored and processed locally, (3) AI models — locally trained and fine-tuned models, (4) Talent — domestic AI engineers and researchers. Sovereign AI is not about isolation — it\'s about having the option to be independent when needed.',
      },
      {
        heading: 'Why Sovereign AI Matters in 2025',
        content: 'Sovereign AI has become critical due to: (1) Geopolitical tensions — US-China chip restrictions show AI infrastructure is a strategic asset, (2) Data sovereignty laws — GDPR, Law 09-08 (Morocco), PIPL (China) require local data processing, (3) National security — defense and intelligence AI cannot depend on foreign clouds, (4) Economic independence — renting compute from hyperscalers drains foreign exchange, (5) Strategic autonomy — control over AI capabilities is control over the future. Nations without sovereign AI risk becoming AI colonies.',
      },
      {
        heading: 'Country Case Studies',
        content: 'Sovereign AI initiatives worldwide: (1) France — Jean Zay supercomputer (A100 cluster), DINUM AI strategy, €2.5B AI investment, (2) China — Baidu, Alibaba, Tencent clouds; Huawei Ascend chips; complete AI sovereignty, (3) India — AI Mission $1.2B investment, GPU procurement for researchers, sovereign LLMs (BharatGPT), (4) Saudi Arabia — SDAIA, HUMAIN ($40B AI investment), sovereign GPT models in Arabic, (5) UAE — G42, Falcon LLM, sovereign AI strategy, (6) Morocco — Harch Corp GPU cloud (1,798 GPUs), AI Movement at UM6P, Law 09-08 data sovereignty.',
      },
      {
        heading: 'Building Sovereign AI: 5-Step Roadmap',
        content: 'Implementation roadmap: (1) Assess needs — identify critical AI workloads (government, defense, healthcare, finance), (2) Build infrastructure — GPU cloud datacenters (100-10,000 GPUs), (3) Establish data sovereignty — laws and regulations requiring local data processing, (4) Develop talent — universities, coding schools, AI research centers, (5) Deploy applications — sovereign LLMs, government AI services, enterprise AI. Timeline: 2-3 years for initial capability, 5-10 years for full sovereignty. Budget: $50M-1B+ depending on scale.',
      },
      {
        heading: 'Sovereign AI Infrastructure Costs',
        content: 'Sovereign AI infrastructure costs: (1) Small nation (100 GPUs): $5-10M — basic AI capability, fine-tuning, inference, (2) Medium nation (1,000 GPUs): $50-100M — LLM training, research, government AI, (3) Large nation (10,000 GPUs): $500M-1B — foundation model training, full AI ecosystem, (4) Superpower (100,000+ GPUs): $5-10B — GPT-4 scale training, global AI leadership. Costs include: GPU hardware ($30K-40K per H100), datacenter ($5-15M per MW), networking, software, 5-year operations. Harch Corp offers sovereign AI as a service — no upfront investment.',
      },
      {
        heading: 'Data Sovereignty Laws by Country',
        content: 'Data sovereignty regulations: (1) EU GDPR — personal data must be protected per EU standards, transfers outside EU restricted, (2) China PIPL + DSL — critical data must stay in China, (3) Russia — personal data must be stored in Russia (Federal Law 242-FZ), (4) India DPDP Act 2023 — personal data restrictions, (5) Morocco Law 09-08 — personal data of Moroccan residents must be stored in Morocco, (6) Saudi Arabia PDPL — data localization requirements, (7) Brazil LGPD — Brazil\'s GDPR equivalent. Check local laws before deploying AI infrastructure.',
      },
      {
        heading: 'Sovereign AI vs Cloud AI: Trade-offs',
        content: 'Trade-offs: Sovereign AI advantages: (1) Data sovereignty (data never leaves country), (2) National security (no foreign dependency), (3) Regulatory compliance, (4) Lower latency for domestic users, (5) No egress fees, (6) ESG benefits (renewable energy). Sovereign AI disadvantages: (1) Higher upfront cost, (2) Limited scale vs hyperscalers, (3) Fewer managed services, (4) Requires skilled talent. Recommendation: Use sovereign AI for government, defense, healthcare, finance. Use cloud AI for R&D, experiments, non-sensitive workloads.',
      },
      {
        heading: 'Morocco\'s Sovereign AI Strategy',
        content: 'Morocco is positioning itself as Africa\'s sovereign AI hub: (1) Harch Corp — 1,798 GPUs across 5 hubs, carbon-aware, 47 gCO2/kWh, (2) AI Movement at UM6P — AI research center, (3) 1337 and YouCode — coding schools (free, no prerequisites), (4) Morocco Digital 2025 — national digital strategy, (5) Law 09-08 — data protection (Morocco\'s GDPR), (6) CFC tax benefits — 15% IS for tech companies. Morocco ranks 4th in Africa on AI readiness. Harch Corp provides sovereign AI infrastructure for Moroccan government and enterprises.',
      },
      {
        heading: 'Enterprise Sovereign AI',
        content: 'Enterprises also need sovereign AI for: (1) Financial services — banking regulations require data sovereignty, (2) Healthcare — patient data privacy (HIPAA, local laws), (3) Defense contractors — classified workloads, (4) Critical infrastructure — utilities, telecom, transportation. Enterprise sovereign AI options: (1) On-premises GPU cluster (full control, high cost), (2) Sovereign cloud (Harch Corp — data stays in Morocco, no foreign access), (3) Hybrid (on-prem for sensitive, cloud for elastic). Harch Corp serves enterprises with sovereign AI infrastructure compliant with Law 09-08.',
      },
    ],
    relatedGlossary: ['sovereign-ai', 'data-sovereignty', 'digital-sovereignty', 'data-residency', 'law-09-08'],
  },
  {
    slug: 'morocco-datacenter-guide',
    title: 'Morocco Datacenter Guide: Why Morocco is Africa\'s AI Hub',
    category: 'morocco',
    shortDesc: 'Complete guide to Morocco datacenters: locations, energy, costs, connectivity, regulations. Why Morocco beats Europe and Africa.',
    metaDescription: 'Morocco datacenter guide: 8 cities, renewable energy, 47 gCO2/kWh, $0.08/kWh power, 8ms to Europe. Why Morocco is Africa\'s AI infrastructure hub.',
    keywords: ['morocco datacenter guide', 'morocco cloud infrastructure', 'casablanca datacenter', 'africa datacenter hub'],
    readTime: 14,
    sections: [
      {
        heading: 'Why Morocco for Datacenters?',
        content: 'Morocco offers unique advantages for datacenter and AI infrastructure: (1) Strategic location — 14km from Europe (8ms latency to Madrid), gateway to Africa, (2) Excellent renewable energy — solar (Noor Ouarzazate 580MW), wind (Tarfaya 300MW), 47 gCO2/kWh at Harch Corp, (3) Competitive costs — power $0.08-0.12/kWh (30-40% cheaper than Western Europe), (4) Cool climate — 5,000+ free cooling hours/year, (5) Political stability — constitutional monarchy, pro-business government, (6) Data sovereignty — Law 09-08, (7) Tax incentives — CFC (15% IS), free zones, (8) Talent — multilingual (FR/EN/AR), 50K+ STEM graduates/year.',
      },
      {
        heading: 'Morocco Datacenter Locations',
        content: 'Strategic datacenter locations in Morocco: (1) Casablanca — economic capital, CFC, 8 submarine cables, 3.3M population, (2) Rabat — political capital, government cloud, universities, (3) Tangier — 14km from Europe, 8ms to Madrid, Tanger Med free zone, (4) Marrakech — solar energy hub, tourism, growing tech, (5) Agadir — southern hub, solar+wind, West Africa connectivity, (6) Dakhla — world-class wind (9.5 m/s), 500MW hyperscale campus planned, (7) Fès — central inland, geographic redundancy, (8) Oujda — eastern gateway, Mediterranean connectivity. Harch Corp operates in all 8 cities.',
      },
      {
        heading: 'Energy: Morocco\'s Renewable Advantage',
        content: 'Morocco\'s renewable energy infrastructure: (1) Noor Ouarzazate — 580MW solar (CSP+PV), world\'s largest, (2) Noor Midelt — 800MW hybrid solar, (3) Tarfaya — 300MW wind, (4) Akhfennir — 200MW wind, (5) Total renewable capacity: 4.5GW (2024), target 10GW by 2030 (52% of electricity). Morocco\'s renewable energy is ideal for datacenters: (1) Low carbon (47 gCO2/kWh at Harch Corp vs 350+ at AWS), (2) Low cost ($0.04-0.06/kWh via PPA), (3) 24/7 availability (solar + wind + storage). Harch Corp uses 100% renewable PPAs.',
      },
      {
        heading: 'Connectivity: Submarine Cables',
        content: 'Morocco\'s international connectivity: (1) AAE-1 (Asia-Africa-Europe-1) — connects to Europe, Middle East, Asia, (2) MAROC Telecom cable — Spain-France direct, (3) Mendall — Marseille to Morocco, (4) Atlas Offshore — Morocco to Portugal, (5) I-ME-WE — India-Middle East-Western Europe. Total: 8+ submarine cable systems. Latency: (1) Tangier to Madrid: 8ms, (2) Casablanca to Paris: 20ms, (3) Casablanca to London: 25ms, (4) Casablanca to Frankfurt: 30ms, (5) Casablanca to New York: 95ms. Excellent for serving both European and African markets.',
      },
      {
        heading: 'Costs: Morocco vs Europe',
        content: 'Datacenter cost comparison (per rack/month, 10kW): (1) Morocco (Harch Corp): $600-1,000, (2) Frankfurt: $1,200-1,800, (3) Paris: $1,100-1,700, (4) London: $1,300-2,000, (5) Dublin: $1,000-1,500, (6) Amsterdam: $1,100-1,600. Morocco is 40-50% cheaper than Western Europe. Power costs: (1) Morocco: $0.08-0.12/kWh, (2) Germany: $0.25-0.35/kWh, (3) France: $0.15-0.20/kWh, (4) UK: $0.20-0.30/kWh. Morocco\'s renewable PPAs at $0.04-0.06/kWh are among the cheapest globally.',
      },
      {
        heading: 'Regulatory Environment',
        content: 'Morocco datacenter regulations: (1) Law 09-08 — data protection (Morocco\'s GDPR), personal data must be stored in Morocco, (2) CNDP — Commission Nationale de Contrôle de la Protection des Données, enforces Law 09-08, (3) CFC — Casablanca Finance City, 15% IS for first 5 years, (4) Free zones — Tanger, Dakhla, tax exemptions, (5) MOWAKABA — 90% digitalization subsidy (up to 400K MAD), (6) Innov Invest — 500K MAD prêts d\'honneur, (7) Intelika — 1.2M MAD loans at 2%. Morocco is pro-business with strong data protection.',
      },
      {
        heading: 'Tax Incentives for Datacenters',
        content: 'Morocco tax incentives for datacenter investment: (1) CFC status — 15% IS (vs 31%) for 5 years, then 15% flat, (2) Free zone (Tanger, Dakhla) — exemption from IS, IR, VAT for 5 years, (3) MOWAKABA — 90% subsidy on digitalization costs, up to 400K MAD, (4) Innov Invest — 500K MAD prêts d\'honneur (0% interest), 170K MAD prime, (5) Intelika — 1.2M MAD loans at 2% interest, (6) Damane Technologie — 70% guarantee on bank loans, (7) Awrach — 1,500 MAD/month subsidy per employee for 24 months. Total incentives can cover 50-70% of initial investment.',
      },
      {
        heading: 'Morocco vs Other Datacenter Locations',
        content: 'Comparison: (1) Morocco vs Ireland — Morocco: lower carbon (47 vs 300+ gCO2/kWh), lower cost ($0.08 vs $0.20/kWh), better climate. Ireland: more established ecosystem. (2) Morocco vs Singapore — Morocco: cheaper power, more land, less regulation. Singapore: better APAC connectivity. (3) Morocco vs UAE — Morocco: cheaper power, closer to Europe. UAE: more capital, more established. (4) Morocco vs South Africa — Morocco: closer to Europe, lower carbon. South Africa: larger African market. Morocco wins for Europe-Africa bridge use cases.',
      },
      {
        heading: 'Harch Corp: Morocco\'s GPU Cloud Leader',
        content: 'Harch Corp is Morocco\'s leading GPU cloud provider: (1) 1,798 GPUs across 5 hubs (Casablanca, Rabat, Tangier, Marrakech, Dakhla), (2) H100, H200, A100, B200 GPUs available, (3) 47 gCO2/kWh carbon intensity (lowest in industry), (4) PUE 1.08-1.24 (industry-leading), (5) 100% renewable energy (solar + wind PPAs), (6) Tier III+ datacenters, (7) 400G InfiniBand networking, (8) Law 09-08 compliant (data sovereignty), (9) CFC tax benefits. Harch Corp serves AI startups, enterprises, governments, and research institutions across Africa and Europe.',
      },
    ],
    relatedGlossary: ['morocco-tech', 'casablanca-finance-city', 'noor-ouarzazate', 'law-09-08', 'africa-datacenter'],
  },
  {
    slug: 'gpu-cloud-cost-optimization',
    title: 'GPU Cloud Cost Optimization: 10 Strategies to Cut Your AI Bill',
    category: 'gpu-cloud',
    shortDesc: '10 proven strategies to reduce GPU cloud costs by 60-80%. Spot instances, mixed precision, gradient checkpointing, and more.',
    metaDescription: 'GPU cloud cost optimization: spot instances (60% off), mixed precision (2x speedup), gradient checkpointing, auto-scaling. Cut AI costs 60-80%.',
    keywords: ['gpu cost optimization', 'reduce gpu cloud costs', 'ai cost savings', 'gpu cloud optimization'],
    readTime: 11,
    sections: [
      {
        heading: 'Why GPU Cloud Costs Spiral Out of Control',
        content: 'GPU cloud costs can easily spiral: (1) Leaving instances running when not needed, (2) Using on-demand when spot would work, (3) Over-provisioning (H100 when A100 suffices), (4) Not using mixed precision, (5) Inefficient code (no gradient checkpointing), (6) No cost monitoring. A typical AI team wastes 40-60% of GPU spend. This guide shows 10 strategies to cut costs by 60-80% without sacrificing performance.',
      },
      {
        heading: 'Strategy 1: Use Spot Instances',
        content: 'Spot instances (preemptible) offer 60-70% discount but can be interrupted. Use cases: (1) Batch training with checkpointing — save every 30 min, resume after interruption, (2) Hyperparameter tuning — each trial is independent, (3) Data preprocessing — embarrassingly parallel. NOT for: (1) Production inference, (2) Interactive notebooks, (3) Long training runs without checkpointing. Harch Corp: H100 spot $1.00/hr (vs $2.80 on-demand). Potential savings: $10K-100K/year for typical AI team.',
      },
      {
        heading: 'Strategy 2: Right-Size Your GPUs',
        content: 'Don\'t use H100 when A100 suffices. Right-sizing: (1) 7B model training → A100 80GB (not H100), (2) Inference <13B → L40S (not A100), (3) Development → A10G (not A100), (4) Fine-tuning with LoRA → A100 40GB (not 80GB). Right-sizing can save 40-60%. Use Harch Corp\'s GPU cost calculator to compare. Start with the cheapest GPU that fits your model in memory, upgrade only if training is too slow.',
      },
      {
        heading: 'Strategy 3: Mixed Precision Training',
        content: 'Mixed precision (FP16/BF16) delivers 2x speedup with no accuracy loss. Enable in PyTorch: `torch.cuda.amp.autocast()`. H100 also supports FP8 for 4x speedup (with Transformer Engine). Benefits: (1) 2x faster training = 50% cost reduction, (2) 50% less memory = smaller GPUs needed, (3) No accuracy loss (FP32 master weights). Almost all modern models use mixed precision. If you\'re not using it, you\'re wasting 50% of your GPU spend.',
      },
      {
        heading: 'Strategy 4: Gradient Checkpointing',
        content: 'Gradient checkpointing trades compute for memory: recompute activations during backprop instead of storing them. Benefits: (1) 3-5x larger models on same GPU, (2) Use smaller (cheaper) GPUs. Cost: 20-30% slower training. Enable: `model.gradient_checkpointing_enable()`. Use when: (1) GPU memory is the bottleneck, (2) Training large models on limited GPUs, (3) Want to use spot instances (smaller GPUs = more spot availability). Net savings can be 40-60%.',
      },
      {
        heading: 'Strategy 5: Reserved Instances for Steady Workloads',
        content: 'Reserved instances offer 25% discount for 1-year commitment. Use for: (1) Production inference (always-on), (2) Baseline training capacity, (3) CI/CD GPU runners. Harch Corp reserved: H100 at $2.10/hr (vs $2.80 on-demand). For 24/7 inference, reserved saves $5K+/year per GPU. Combine: reserved for baseline, spot for bursts, on-demand for unexpected spikes.',
      },
      {
        heading: 'Strategy 6: Auto-Scaling',
        content: 'Auto-scaling adjusts GPU count based on demand. For inference: (1) Scale up during peak hours, (2) Scale to zero at night (dev environments), (3) Use Kubernetes with GPU autoscaler. For training: (1) Use spot instances that auto-recover, (2) Scale based on queue depth. Harch Corp provides managed Kubernetes with GPU auto-scaling. Savings: 30-50% for workloads with variable demand.',
      },
      {
        heading: 'Strategy 7: Efficient Data Loading',
        content: 'GPU idle time = wasted money. Optimize data loading: (1) Use num_workers > 0 in DataLoader, (2) Pre-fetch data with pin_memory=True, (3) Use fast storage (NVMe, not HDD), (4) Pre-process data offline (don\'t do it in training loop), (5) Use webdataset for large datasets. Goal: GPU utilization > 80%. If your GPU is at 30% utilization, you\'re wasting 50%+ of your spend.',
      },
      {
        heading: 'Strategy 8: Distributed Training Optimization',
        content: 'For multi-GPU training: (1) Use the right parallelism (data, tensor, pipeline), (2) Optimize batch size (larger = more efficient), (3) Use gradient accumulation for effective larger batch, (4) Minimize communication overhead (overlap compute and communication), (5) Use NCCL for GPU-to-GPU. Inefficient distributed training can waste 30-50% of GPU time. Use tools like PyTorch Profiler to identify bottlenecks.',
      },
      {
        heading: 'Strategy 9: Model Optimization',
        content: 'Reduce model size and inference cost: (1) Quantization — FP16, INT8, INT4 (2-4x speedup), (2) Pruning — remove unimportant weights (30-50% smaller), (3) Distillation — train smaller model to mimic large one, (4) LoRA — train small adapters instead of full model. For inference, quantized models can be 4x cheaper to serve. Use TensorRT-LLM or vLLM for optimized serving.',
      },
      {
        heading: 'Strategy 10: Monitor and Alert',
        content: 'You can\'t optimize what you don\'t measure. Implement: (1) Real-time cost dashboard (GPU hours × rate), (2) Alerts for cost spikes (>20% above average), (3) Tag resources by project/team for chargeback, (4) Weekly cost review meetings, (5) Automated shutdown of idle instances. Harch Corp provides cost monitoring tools. Teams that actively monitor costs typically reduce spend by 20-30% in the first month.',
      },
    ],
    relatedGlossary: ['gpu-cloud', 'gpu-as-a-service', 'training', 'inference', 'quantization'],
  },
  {
    slug: 'carbon-aware-ai-guide',
    title: 'Carbon-Aware AI: How to Reduce Your AI Carbon Footprint by 60%',
    category: 'energy',
    shortDesc: 'Complete guide to carbon-aware AI: workload scheduling, renewable energy, efficient models. Reduce AI CO2 by 60%.',
    metaDescription: 'Carbon-aware AI guide: workload scheduling, renewable energy, model efficiency. Reduce AI carbon footprint 60% with Harch Corp\'s 47 gCO2/kWh.',
    keywords: ['carbon aware ai', 'green ai guide', 'ai carbon footprint', 'sustainable ai'],
    readTime: 13,
    sections: [
      {
        heading: 'The AI Carbon Problem',
        content: 'AI has a significant carbon footprint: (1) GPT-3 training: ~552 tonnes CO2 (120 cars/year equivalent), (2) GPT-4 training: ~5,000+ tonnes CO2 (estimated), (3) LLaMA 2 70B: ~150 tonnes CO2, (4) Global AI datacenters: 1% of world electricity, growing 30%/year. The problem is real. But solutions exist: carbon-aware computing can reduce AI carbon by 30-60% without sacrificing performance. This guide shows how.',
      },
      {
        heading: 'Understanding Carbon Intensity',
        content: 'Carbon intensity measures CO2 per kWh of electricity: gCO2/kWh. Examples: (1) Norway: 30 (hydro), (2) France: 85 (nuclear), (3) Harch Corp Morocco: 47 (solar+wind), (4) Morocco grid: 350 (mixed), (5) Germany: 380 (coal+gas+renewables), (6) Poland: 700 (coal), (7) AWS avg: 350+, (8) Azure avg: 380+. Lower carbon intensity = cleaner AI. Harch Corp\'s 47 gCO2/kWh is among the lowest globally, 7-10x lower than typical cloud providers.',
      },
      {
        heading: 'Strategy 1: Choose Low-Carbon Datacenters',
        content: 'The single biggest carbon reduction comes from choosing the right datacenter. (1) Harch Corp Morocco: 47 gCO2/kWh (solar+wind), (2) Google Finland: 50 (wind+hydro), (3) AWS Sweden: 50 (hydro), (4) Azure France: 85 (nuclear), (5) AWS Ireland: 350 (mixed), (6) AWS Virginia: 380 (mixed), (7) AWS Singapore: 500 (gas), (8) AWS UAE: 500 (gas). Choosing Harch Corp over AWS Ireland reduces carbon by 85%. Always check the carbon intensity of your cloud region.',
      },
      {
        heading: 'Strategy 2: Carbon-Aware Workload Scheduling',
        content: 'Carbon-aware scheduling runs workloads when carbon intensity is lowest: (1) Monitor real-time grid carbon intensity, (2) Predict renewable energy availability (solar peaks midday, wind varies), (3) Schedule flexible workloads (batch training) for low-carbon periods, (4) Pause or migrate workloads during high-carbon periods. Harch Corp\'s carbon-aware scheduler reduces carbon by 40% on average. Example: Train at noon (solar peak) instead of midnight (fossil backup).',
      },
      {
        heading: 'Strategy 3: Use Efficient Models',
        content: 'Model choice affects carbon: (1) Smaller models = less training compute = less carbon, (2) Distilled models (e.g., DistilBERT) — 40% smaller, 60% faster, same performance, (3) Quantized models (INT8, INT4) — 4x faster inference, (4) Sparse models (Mixture of Experts) — only activate relevant parameters. Choose the smallest model that meets your accuracy needs. A 7B model produces 5-10x less carbon than a 70B model for the same task.',
      },
      {
        heading: 'Strategy 4: Mixed Precision and Optimization',
        content: 'Training efficiency reduces carbon: (1) Mixed precision (FP16/BF16) — 2x faster = 50% less carbon, (2) FP8 on H100 — 4x faster = 75% less carbon, (3) Gradient checkpointing — train larger models on fewer GPUs, (4) Efficient data loading — maximize GPU utilization, (5) Distributed training with optimized communication. Every optimization that reduces training time also reduces carbon. Efficient code is green code.',
      },
      {
        heading: 'Strategy 5: Renewable Energy PPAs',
        content: 'Power Purchase Agreements (PPAs) directly fund renewable energy: (1) Harch Corp signs solar/wind PPAs for 100% renewable power, (2) 24/7 matching (not just annual offsets), (3) Additional — funds NEW renewable capacity, (4) Verifiable with energy certificates. This is better than carbon offsets (which may fund existing projects). When choosing a cloud provider, ask: "Do you use PPAs for 24/7 renewable matching, or just buy offsets?"',
      },
      {
        heading: 'Strategy 6: Reduce, Reuse, Recycle Models',
        content: 'Reduce AI carbon through model lifecycle: (1) Reduce — train smaller, more efficient models, (2) Reuse — fine-tune pre-trained models instead of training from scratch (100x less carbon), (3) Recycle — use model zoos (HuggingFace) instead of training your own, (4) Share — publish models so others don\'t retrain. Fine-tuning LLaMA 2 7B produces 100x less carbon than training a 7B model from scratch. Always start with a pre-trained model.',
      },
      {
        heading: 'Measuring AI Carbon Footprint',
        content: 'Measure to manage: (1) Track GPU hours by workload, (2) Multiply by power consumption (H100 = 700W), (3) Multiply by carbon intensity (Harch Corp: 47 gCO2/kWh), (4) Report in tonnes CO2. Tools: (1) CodeCarbon — open-source Python package, (2) Harch Corp carbon dashboard — built-in, (3) Cloud provider reports — AWS/Azure/GCP carbon tools. Set carbon budgets for AI projects, just like financial budgets.',
      },
      {
        heading: 'Case Study: Harch Corp\'s 47 gCO2/kWh',
        content: 'How Harch Corp achieves 47 gCO2/kWh: (1) 100% renewable PPAs (solar + wind), (2) Carbon-aware workload scheduling (40% reduction), (3) Liquid cooling (PUE 1.08 — less wasted energy), (4) Morocco location (excellent renewables, free cooling), (5) Efficient GPUs (H100 with FP8), (6) 24/7 renewable matching (not just offsets). Result: 7-10x lower carbon than typical cloud providers. Training GPT-3 at Harch Corp: 80 tonnes CO2 (vs 552 at typical provider).',
      },
      {
        heading: 'The Future of Green AI',
        content: 'Green AI trends: (1) More efficient model architectures (Mamba, RWKV, hybrid), (2) Specialized AI chips (less power than GPUs), (3) Better carbon-aware scheduling algorithms, (4) Stricter ESG reporting requirements, (5) Carbon pricing (makes high-carbon AI expensive), (6. Renewable energy growth (cheaper every year). The future of AI is green. Companies that don\'t decarbonize their AI will face regulatory, financial, and reputational risks. Harch Corp is positioned as the leader in carbon-aware AI infrastructure.',
      },
    ],
    relatedGlossary: ['carbon-aware-gpu', 'carbon-intensity', 'pue', 'renewable-energy', 'net-zero'],
  },
  {
    slug: 'llm-inference-guide',
    title: 'LLM Inference Guide: How to Serve Large Language Models at Scale',
    category: 'ai',
    shortDesc: 'Complete guide to LLM inference: serving frameworks (vLLM, TensorRT-LLM), optimization, cost reduction, and production deployment.',
    metaDescription: 'LLM inference guide: vLLM, TensorRT-LLM, Triton. Optimize tokens/second, reduce latency, cut serving costs. Production LLM deployment.',
    keywords: ['llm inference guide', 'llm serving', 'vllm', 'tensorrt llm', 'llm deployment'],
    readTime: 14,
    sections: [
      {
        heading: 'LLM Inference Challenges',
        content: 'Serving LLMs in production is challenging: (1) Large memory requirements — 70B model = 140GB+ in FP16, (2) Variable latency — autoregressive generation is sequential, (3) High throughput needed — thousands of concurrent users, (4) Cost management — GPUs are expensive, (5) Model updates — deploy new versions without downtime. This guide covers frameworks, optimization, and deployment strategies for production LLM serving.',
      },
      {
        heading: 'Memory Requirements by Model Size',
        content: 'LLM memory requirements (FP16, 2 bytes per parameter): (1) 7B model: 14GB → fits on A100 40GB or L40S 48GB, (2) 13B model: 26GB → A100 40GB or H100 80GB, (3) 30B model: 60GB → H100 80GB, (4) 70B model: 140GB → 2x H100 80GB (tensor parallelism) or 1x H200 141GB, (5) 175B model: 350GB → 4-5x H100/H200 (pipeline parallelism). With quantization (INT8): halve memory. With INT4: quarter memory. Choose GPU based on model size and desired batch size.',
      },
      {
        heading: 'LLM Serving Frameworks Compared',
        content: 'Top LLM serving frameworks: (1) vLLM — PagedAttention, high throughput, easy to use, open-source, (2) TensorRT-LLM — NVIDIA\'s optimized engine, fastest inference, FP8 support, (3) Triton Inference Server — production-grade, multi-model, Kubernetes-native, (4) TGI (Text Generation Inference) — HuggingFace, easy model loading, (5) SGLang — structured generation, latest research. Recommendation: vLLM for most use cases, TensorRT-LLM for maximum performance, Triton for production multi-model serving.',
      },
      {
        heading: 'vLLM: The Recommended Framework',
        content: 'vLLM is the most popular LLM serving framework: (1) PagedAttention — manages KV cache like virtual memory, 2-4x throughput improvement, (2) Continuous batching — processes new requests without waiting for batch to complete, (3) Tensor parallelism — split model across GPUs, (4) Streaming — token-by-token output, (5) OpenAI-compatible API — drop-in replacement. Install: `pip install vllm`. Serve: `python -m vllm.entrypoints.openai.api_server --model meta-llama/Llama-2-7b`. Harch Corp provides pre-configured vLLM environments.',
      },
      {
        heading: 'TensorRT-LLM: Maximum Performance',
        content: 'TensorRT-LLM is NVIDIA\'s optimized LLM inference engine: (1) 3-5x faster than vanilla PyTorch, (2) FP8 support on H100 — 2x speedup over FP16, (3) Kernel fusion — combines operations for efficiency, (4) In-flight batching — dynamic batch sizing, (5) Plugin architecture — custom kernels. Use TensorRT-LLM when: (1) You need maximum throughput, (2) You\'re on H100/H200 (FP8), (3) You have engineering resources to optimize. Harch Corp provides TensorRT-LLM environments with expert support.',
      },
      {
        heading: 'Quantization for Inference',
        content: 'Quantization reduces model size and increases speed: (1) FP16 (16-bit) — baseline, 2x smaller than FP32, (2) INT8 (8-bit) — 2x smaller than FP16, 2x faster, minimal accuracy loss, (3) INT4 (4-bit) — 4x smaller than FP16, 3-4x faster, slight accuracy loss, (4) FP8 (8-bit float, H100 only) — 2x faster than FP16, no accuracy loss. Methods: GPTQ, AWQ, SmoothQuant. Use INT8 for most production deployments. Use INT4 for cost-sensitive inference on smaller models.',
      },
      {
        heading: 'Throughput vs Latency Optimization',
        content: 'Two modes of LLM serving: (1) Throughput-optimized — maximize tokens/second, batch many requests, good for batch processing, (2) Latency-optimized — minimize time-to-first-token, smaller batches, good for interactive chat. Throughput: use large batch sizes (64+), continuous batching. Latency: use small batch sizes (1-4), speculative decoding. Harch Corp can configure your serving for either mode. Monitor: tokens/second (throughput), time-to-first-token (latency), p99 latency.',
      },
      {
        heading: 'Auto-Scaling LLM Serving',
        content: 'Scale LLM serving based on demand: (1) Kubernetes Horizontal Pod Autoscaler — scale based on GPU utilization or request queue, (2) GPU auto-scaling — add/remove GPU instances, (3) Predictive scaling — scale before peak hours, (4) Scale-to-zero — for dev environments. Challenges: (1) Cold start time (loading model takes 30-60s), (2) GPU availability (especially spot), (3) Cost of idle capacity. Harch Corp provides managed Kubernetes with GPU auto-scaling for LLM serving.',
      },
      {
        heading: 'Cost Optimization for LLM Serving',
        content: 'LLM serving costs: (1) GPU cost — H100 $2.80/hr, A100 $2.00/hr, (2) Throughput — 70B model on H100: ~500 tokens/sec, (3) Cost per 1M tokens — $1.50-3.00. Optimization: (1) Use spot instances for non-critical serving, (2) Quantize models (INT8 = 2x throughput), (3) Use smaller models when possible (13B instead of 70B), (4) Batch requests (continuous batching), (5) Cache common queries. Harch Corp achieves $1.50/1M tokens for LLaMA 70B — among the cheapest globally.',
      },
      {
        heading: 'Production Deployment Checklist',
        content: 'Production LLM deployment checklist: (1) Choose model (size, open-source vs proprietary), (2) Choose framework (vLLM, TensorRT-LLM, TGI), (3) Choose GPU (H100 for 70B+, A100 for 13B-70B, L40S for <13B), (4) Quantize (INT8 for production), (5) Set up auto-scaling, (6) Implement monitoring (Prometheus + Grafana), (7) Set up load balancing, (8) Implement rate limiting, (9) Add content moderation, (10) Set up CI/CD for model updates, (11) Implement fallback (smaller model if primary fails), (12) Load test before production. Harch Corp provides end-to-end LLM deployment services.',
      },
    ],
    relatedGlossary: ['llm-serving', 'inference', 'llm', 'quantization', 'tensorrt'],
  },
];

// Guides (tutorials)
export type Guide = {
  slug: string;
  title: string;
  category: 'deployment' | 'optimization' | 'security' | 'migration';
  shortDesc: string;
  metaDescription: string;
  keywords: string[];
  readTime: number;
  steps: { title: string; description: string }[];
};

export const guides: Guide[] = [
  {
    slug: 'deploy-llm-vllm-harch-corp',
    title: 'How to Deploy an LLM with vLLM on Harch Corp GPU Cloud',
    category: 'deployment',
    shortDesc: 'Step-by-step guide to deploying LLaMA, Mistral, or any HuggingFace LLM with vLLM on Harch Corp GPU cloud.',
    metaDescription: 'Deploy LLM with vLLM: step-by-step tutorial. Install vLLM, load model, configure API, auto-scale on Harch Corp GPU cloud.',
    keywords: ['deploy llm vllm', 'vllm tutorial', 'llm deployment guide', 'harch corp llm'],
    readTime: 8,
    steps: [
      { title: 'Create a Harch Corp GPU instance', description: 'Sign up at harchcorp.com, create an H100 or A100 instance with your preferred OS (Ubuntu 22.04 recommended). Choose spot for 60% discount if you can handle interruptions.' },
      { title: 'Install vLLM and dependencies', description: 'SSH into your instance. Install vLLM: `pip install vllm`. Install CUDA toolkit if not pre-installed. Verify GPU: `nvidia-smi` should show your H100/A100.' },
      { title: 'Download your model', description: 'Choose a model from HuggingFace (e.g., meta-llama/Llama-2-7b-chat-hf). Set HF_TOKEN environment variable if using gated models. vLLM will download automatically on first run.' },
      { title: 'Start the vLLM server', description: 'Run: `python -m vllm.entrypoints.openai.api_server --model meta-llama/Llama-2-7b-chat-hf --tensor-parallel-size 1`. For multi-GPU, set tensor-parallel-size to the number of GPUs.' },
      { title: 'Test the API', description: 'Send a test request: `curl http://localhost:8000/v1/completions -H "Content-Type: application/json" -d \'{"model": "meta-llama/Llama-2-7b-chat-hf", "prompt": "Hello, world!", "max_tokens": 50}\'`. You should get a JSON response with generated text.' },
      { title: 'Optimize for production', description: 'Enable continuous batching (default), set max_num_seqs for batch size, use AWQ or GPTQ quantized models for 2x throughput. Monitor with vLLM\'s built-in Prometheus metrics.' },
      { title: 'Set up auto-scaling', description: 'Deploy vLLM in Kubernetes with Harch Corp\'s managed K8s. Use Horizontal Pod Autoscaler to scale based on GPU utilization or request queue. Set up load balancer for traffic distribution.' },
      { title: 'Monitor and maintain', description: 'Use Prometheus + Grafana for monitoring (throughput, latency, GPU utilization). Set up alerts for high latency or low throughput. Update models with rolling deployments (zero downtime).' },
    ],
  },
  {
    slug: 'migrate-aws-to-harch-corp',
    title: 'How to Migrate from AWS to Harch Corp GPU Cloud',
    category: 'migration',
    shortDesc: 'Complete migration guide: move AI workloads from AWS to Harch Corp. Save 30-50% and reduce carbon by 85%.',
    metaDescription: 'AWS to Harch Corp migration guide: assess workloads, transfer data, update code, switch DNS. Save 30-50% on GPU costs, reduce carbon 85%.',
    keywords: ['aws to harch corp migration', 'cloud migration guide', 'gpu cloud migration', 'switch from aws'],
    readTime: 10,
    steps: [
      { title: 'Assess your AWS workloads', description: 'Identify GPU workloads to migrate: EC2 P4/G5 instances, SageMaker training jobs, ECS/EKS GPU tasks. Document instance types, AMIs, storage volumes, and networking requirements.' },
      { title: 'Create Harch Corp account', description: 'Sign up at harchcorp.com. Verify your account. Create API keys. Familiarize yourself with the dashboard and CLI tools.' },
      { title: 'Provision equivalent resources', description: 'Map AWS instances to Harch Corp: p4d.24xlarge (8x A100) → Harch 8x A100, p5.48xlarge (8x H100) → Harch 8x H100. Provision storage (equivalent to EBS), networking (equivalent to VPC).' },
      { title: 'Transfer your data', description: 'Use rsync or AWS S3 sync to transfer data. For large datasets, Harch Corp provides direct transfer from S3. Estimate transfer time: 1TB over 1Gbps = ~2.5 hours.' },
      { title: 'Update your code', description: 'Update endpoints, IAM roles, and SDK calls. Harch Corp uses OpenStack-compatible API (similar to AWS). Most code changes are minimal: update instance IDs, regions, and API endpoints.' },
      { title: 'Test your workloads', description: 'Run test jobs on Harch Corp before switching production. Verify: training convergence, inference latency, data pipeline, auto-scaling. Benchmark performance vs AWS.' },
      { title: 'Switch production traffic', description: 'Use DNS (Route 53) to gradually switch traffic: 10% → 50% → 100% over 1-2 weeks. Monitor for issues. Keep AWS as fallback for 30 days.' },
      { title: 'Decommission AWS resources', description: 'After 30 days of stable operation on Harch Corp, terminate AWS instances, delete EBS volumes, clean up S3 buckets. Save 30-50% on GPU costs and reduce carbon by 85%.' },
    ],
  },
  {
    slug: 'secure-gpu-cloud-deployment',
    title: 'How to Secure Your GPU Cloud Deployment',
    category: 'security',
    shortDesc: 'Security best practices for GPU cloud: network security, access control, encryption, compliance, monitoring.',
    metaDescription: 'GPU cloud security guide: VPC setup, IAM roles, encryption, firewall, monitoring, compliance (GDPR, SOC 2, ISO 27001).',
    keywords: ['gpu cloud security', 'secure gpu deployment', 'cloud security best practices', 'ai infrastructure security'],
    readTime: 9,
    steps: [
      { title: 'Set up a private network (VPC)', description: 'Create a Virtual Private Cloud. Place GPU instances in private subnets (no internet access). Use a bastion host or VPN for SSH access. Configure security groups to allow only necessary ports.' },
      { title: 'Implement IAM and access control', description: 'Use IAM roles with least privilege. Enable MFA for all users. Use SSH keys (not passwords). Rotate keys regularly. Implement role-based access for different teams (dev, prod, admin).' },
      { title: 'Encrypt everything', description: 'Encrypt data at rest (AES-256 for storage volumes). Encrypt data in transit (TLS 1.3 for all network traffic). Use KMS for key management. Enable GPU memory encryption if available (H100 supports it).' },
      { title: 'Configure firewall rules', description: 'Deny all inbound by default. Allow only: SSH (from bastion only), HTTPS (from load balancer), monitoring ports (from monitoring server). Use Web Application Firewall (WAF) for public-facing APIs.' },
      { title: 'Set up monitoring and logging', description: 'Enable CloudTrail-equivalent audit logging (all API calls). Send logs to immutable storage (7-year retention for compliance). Set up SIEM for real-time threat detection. Monitor GPU utilization for anomaly detection.' },
      { title: 'Implement network segmentation', description: 'Separate environments (dev, staging, prod) in different VPCs or subnets. Use network policies (Kubernetes) to restrict pod-to-pod communication. Implement zero-trust architecture — never trust, always verify.' },
      { title: 'Ensure compliance', description: 'GDPR: data residency in EU or Morocco (Law 09-08 equivalent). SOC 2: implement controls for security, availability, confidentiality. ISO 27001: implement ISMS. PCI-DSS: if processing payments. Harch Corp provides compliant infrastructure.' },
      { title: 'Regular security audits', description: 'Conduct quarterly security assessments. Perform annual penetration testing. Use automated vulnerability scanners (Nessus, Qualys). Implement bug bounty program. Stay updated on CVEs for your software stack.' },
    ],
  },
  {
    slug: 'optimize-distributed-training',
    title: 'How to Optimize Distributed Training for Large Models',
    category: 'optimization',
    shortDesc: 'Optimize distributed training: choose parallelism strategy, tune batch size, minimize communication overhead, profile performance.',
    metaDescription: 'Distributed training optimization: data, tensor, pipeline parallelism. Batch size tuning, gradient accumulation, profiling. Train 70B+ models efficiently.',
    keywords: ['distributed training optimization', 'parallelism strategies', 'multi-gpu training', 'large model training'],
    readTime: 11,
    steps: [
      { title: 'Choose the right parallelism strategy', description: 'Data parallelism (each GPU processes different batches), tensor parallelism (split model layers across GPUs), pipeline parallelism (split model into stages). For 70B+ models: use 3D parallelism (all three combined). Use Megatron-LM or DeepSpeed.' },
      { title: 'Tune your batch size', description: 'Global batch size = per-GPU batch size × number of GPUs × gradient accumulation steps. Target: 4M tokens for LLM training. Increase per-GPU batch until GPU memory is 90% full. Use gradient accumulation for effective larger batch.' },
      { title: 'Minimize communication overhead', description: 'Overlap computation and communication (compute next layer while communicating previous gradient). Use gradient bucketing (group small gradients). Choose NCCL for GPU-to-GPU communication. Use InfiniBand (400G) over Ethernet for multi-node.' },
      { title: 'Use mixed precision', description: 'Enable FP16 or BF16 for forward/backward passes (2x speedup, 50% memory). Keep FP32 master weights for accuracy. On H100, enable FP8 with Transformer Engine for 4x speedup. Mixed precision is the single biggest optimization.' },
      { title: 'Implement gradient checkpointing', description: 'Trade compute for memory: recompute activations during backprop instead of storing. Enables 3-5x larger models on same GPU. 20-30% slower but allows using fewer GPUs. Use when memory is the bottleneck.' },
      { title: 'Optimize data loading', description: 'Use num_workers > 0 in DataLoader. Pre-fetch with pin_memory=True. Use fast storage (NVMe). Pre-process data offline. Use webdataset for large datasets. Goal: GPU utilization > 80% (not waiting for data).' },
      { title: 'Profile your training', description: 'Use PyTorch Profiler to identify bottlenecks: (1) GPU compute time, (2) Communication time, (3) Data loading time, (4) CPU overhead. Optimize the bottleneck. Re-profile after each optimization. Common issues: data loading, small batch sizes, frequent synchronization.' },
      { title: 'Monitor and tune', description: 'Monitor: GPU utilization (>80% target), memory usage (<90%), communication overhead (<30% of total time), training throughput (samples/sec). Use Weights & Biases or MLflow for experiment tracking. Iterate on optimizations based on data.' },
    ],
  },
  {
    slug: 'set-up-kubernetes-gpu-cluster',
    title: 'How to Set Up a GPU Kubernetes Cluster on Harch Corp',
    category: 'deployment',
    shortDesc: 'Step-by-step guide to setting up a GPU Kubernetes cluster on Harch Corp for AI/ML workloads.',
    metaDescription: 'GPU Kubernetes setup guide: install K8s, NVIDIA GPU operator, configure autoscaling, deploy AI workloads on Harch Corp.',
    keywords: ['gpu kubernetes setup', 'k8s gpu cluster', 'nvidia gpu operator', 'kubernetes ai workloads'],
    readTime: 10,
    steps: [
      { title: 'Provision GPU instances', description: 'Create Harch Corp GPU instances (H100 or A100) with Ubuntu 22.04. Minimum 3 nodes for HA. Choose instance sizes based on your workload (e.g., 8x H100 per node for large model training).' },
      { title: 'Install Kubernetes', description: 'Use kubeadm to initialize the control plane on the master node. Join worker nodes to the cluster. Install Calico or Cilium for networking. Install MetalLB for load balancing (bare metal).' },
      { title: 'Install NVIDIA GPU Operator', description: 'The GPU Operator automates GPU management on Kubernetes: `kubectl apply -f https://raw.githubusercontent.com/NVIDIA/gpu-operator/main/deployments/gpu-operator/nvidia-gpu-operator.yml`. This installs GPU drivers, container runtime, device plugin, and DCGM monitoring.' },
      { title: 'Verify GPU access', description: 'Run a test pod: `kubectl run gpu-test --image=nvidia/cuda:12.0-base --command -- nvidia-smi`. Verify the pod can see GPUs. Check node capacity: `kubectl describe node | grep -A 10 Capacity` should show nvidia.com/gpu.' },
      { title: 'Set up storage', description: 'Install a storage provider (Longhorn, Rook/Ceph, or NFS). Create PersistentVolumes for model weights, datasets, and checkpoints. Use NVMe storage for high-performance I/O (training data).' },
      { title: 'Configure autoscaling', description: 'Install Cluster Autoscaler to add/remove nodes based on demand. Install NVIDIA GPU Autoscaler for GPU-specific scaling. Set up Horizontal Pod Autoscaler for workload scaling. Configure scale-to-zero for dev environments.' },
      { title: 'Deploy your AI workload', description: 'Create a Kubernetes Deployment with GPU resource requests: `resources: limits: nvidia.com/gpu: 8`. Use ConfigMaps for configuration, Secrets for API keys. Set up Services for networking, Ingress for external access.' },
      { title: 'Set up monitoring', description: 'Install Prometheus + Grafana for cluster monitoring. Install NVIDIA DCGM-Exporter for GPU metrics. Set up alerting for: GPU utilization, memory usage, node health, pod failures. Use Loki for log aggregation.' },
    ],
  },
];
