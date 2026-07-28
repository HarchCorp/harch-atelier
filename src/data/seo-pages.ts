// SEO Programmatic Pages — Locations × Services
// Generates pages like /morocco/casablanca/gpu-cloud, /morocco/rabat/datacenter, etc.

export type MoroccanCity = {
  slug: string;
  name: string;
  nameFr: string;
  region: string;
  population: number;
  description: string;
  strategicAdvantages: string[];
  keyStats: {
    latencyToEurope?: string;
    powerCost?: string;
    renewablePercentage?: string;
    fiberConnections?: number;
    universities?: number;
  };
};

export type ServiceLine = {
  slug: string;
  name: string;
  category: 'gpu-cloud' | 'datacenter' | 'ai' | 'energy' | 'sovereignty';
  shortDesc: string;
  longDesc: string;
  keyBenefits: string[];
  targetCustomers: string[];
};

export const moroccanCities: MoroccanCity[] = [
  {
    slug: 'casablanca',
    name: 'Casablanca',
    nameFr: 'Casablanca',
    region: 'Casablanca-Settat',
    population: 3360000,
    description: 'Casablanca is Morocco\'s economic capital and largest city, hosting the headquarters of major banks, the Casablanca Finance City (CFC), and the country\'s main international port. It is the primary business hub for North and West Africa, with excellent fiber connectivity to Europe via multiple submarine cables.',
    strategicAdvantages: [
      'Largest business district in Morocco (Casablanca Finance City)',
      'Major submarine cable landing point (AAE-1, MAROC Telecom, Mendall)',
      'International airport with direct flights to all major European hubs',
      'Home to Morocco\'s largest tech ecosystem with 200+ tech companies',
      'Multiple Tier III datacenter facilities available',
    ],
    keyStats: {
      latencyToEurope: '<20ms to Paris, <25ms to London',
      powerCost: '0.12 USD/kWh (industrial)',
      renewablePercentage: '40% (2024), 60% target by 2027',
      fiberConnections: 8,
      universities: 12,
    },
  },
  {
    slug: 'rabat',
    name: 'Rabat',
    nameFr: 'Rabat',
    region: 'Rabat-Salé-Kénitra',
    population: 577000,
    description: 'Rabat is Morocco\'s political capital and second-largest city, hosting government institutions, foreign embassies, and major research universities. It is a strategic location for government cloud, sovereign AI, and data sovereignty workloads requiring proximity to federal agencies.',
    strategicAdvantages: [
      'Capital city — proximity to government institutions and regulators',
      'Hosts the Moroccan Ministry of Digital Transition',
      'Strong university ecosystem (Mohammed V University, ENSIAS)',
      'Lower operational costs than Casablanca',
      'Strategic location for government cloud and sovereign AI workloads',
    ],
    keyStats: {
      latencyToEurope: '<22ms to Paris',
      powerCost: '0.11 USD/kWh (industrial)',
      renewablePercentage: '38% (2024)',
      fiberConnections: 6,
      universities: 8,
    },
  },
  {
    slug: 'tanger',
    name: 'Tanger',
    nameFr: 'Tanger',
    region: 'Tanger-Tétouan-Al Hoceïma',
    population: 947000,
    description: 'Tangier is Morocco\'s gateway to Europe, located just 14km from Spain across the Strait of Gibraltar. Home to Tanger Med (Africa\'s largest port), Tangier offers unmatched strategic positioning for datacenter and cloud infrastructure serving both European and African markets.',
    strategicAdvantages: [
      '14km from Europe — lowest latency to Spain (8ms to Madrid)',
      'Tanger Med: largest port in Africa, free zone with tax incentives',
      'Excellent wind energy potential (Tarfaya wind farm nearby)',
      'Strategic location for subsea cable landing',
      'Free zone tax benefits for datacenter development',
    ],
    keyStats: {
      latencyToEurope: '<8ms to Madrid, <15ms to Paris',
      powerCost: '0.10 USD/kWh (industrial)',
      renewablePercentage: '55% (wind-heavy region)',
      fiberConnections: 4,
      universities: 5,
    },
  },
  {
    slug: 'marrakech',
    name: 'Marrakech',
    nameFr: 'Marrakech',
    region: 'Marrakech-Safi',
    population: 928000,
    description: 'Marrakech is Morocco\'s premier tourist destination and a growing tech hub, hosting international tech conferences, coworking spaces, and a thriving startup ecosystem. The city offers excellent solar energy potential and serves as a strategic southern hub for datacenter expansion.',
    strategicAdvantages: [
      'International tourism hub — strong global brand recognition',
      'Excellent solar energy potential (2,400 kWh/m²/year)',
      'Growing tech ecosystem with international tech events',
      'Lower cost of operations than Casablanca/Rabat',
      'Strategic southern location for redundancy with northern hubs',
    ],
    keyStats: {
      latencyToEurope: '<25ms to Paris',
      powerCost: '0.11 USD/kWh (industrial)',
      renewablePercentage: '45% (solar-heavy)',
      fiberConnections: 4,
      universities: 6,
    },
  },
  {
    slug: 'agadir',
    name: 'Agadir',
    nameFr: 'Agadir',
    region: 'Souss-Massa',
    population: 421000,
    description: 'Agadir is the economic hub of southern Morocco, with strong agricultural, fishing, and tourism sectors. The city offers excellent solar and wind energy potential, making it ideal for sustainable datacenter operations and edge computing for West Africa.',
    strategicAdvantages: [
      'Excellent solar and wind energy potential (2,500 kWh/m²/year)',
      'Strategic location for West African connectivity',
      'Growing tech ecosystem with university partnerships',
      'Lower cost of operations and land',
      'Ideal for sustainable/edge datacenter deployments',
    ],
    keyStats: {
      latencyToEurope: '<30ms to Paris',
      powerCost: '0.10 USD/kWh (industrial)',
      renewablePercentage: '50% (solar + wind)',
      fiberConnections: 3,
      universities: 4,
    },
  },
  {
    slug: 'dakhla',
    name: 'Dakhla',
    nameFr: 'Dakhla',
    region: 'Dakhla-Oued Ed-Dahab',
    population: 106000,
    description: 'Dakhla is Morocco\'s strategic Atlantic outpost in the Sahara, offering unmatched wind energy potential (one of the world\'s best wind regimes), abundant land, and a strategic location for submarine cable connectivity to West Africa and the Americas.',
    strategicAdvantages: [
      'World-class wind energy potential (avg 9.5 m/s, capacity factor 50%+)',
      'Vast available land at low cost',
      'Strategic location for West Africa submarine cable landing',
      'Cool climate ideal for free cooling (datacenter PUE optimization)',
      'Planned 500MW hyperscale datacenter campus',
    ],
    keyStats: {
      latencyToEurope: '<45ms to Paris via new cable',
      powerCost: '0.08 USD/kWh (renewable wind PPA)',
      renewablePercentage: '95% (wind)',
      fiberConnections: 2,
      universities: 1,
    },
  },
  {
    slug: 'fes',
    name: 'Fès',
    nameFr: 'Fès',
    region: 'Fès-Meknès',
    population: 1112000,
    description: 'Fès is Morocco\'s spiritual and cultural capital, with a growing university ecosystem and strategic central location. The city offers lower operational costs than coastal hubs and serves as an inland redundancy point for datacenter operations.',
    strategicAdvantages: [
      'Central inland location — geographic redundancy from coastal hubs',
      'Strong university ecosystem (Sidi Mohamed Ben Abdellah University)',
      'Lower cost of operations and land than coastal cities',
      'Growing tech talent pool',
      'Strategic for distributed edge computing',
    ],
    keyStats: {
      latencyToEurope: '<28ms to Paris',
      powerCost: '0.11 USD/kWh (industrial)',
      renewablePercentage: '40% (2024)',
      fiberConnections: 3,
      universities: 7,
    },
  },
  {
    slug: 'oujda',
    name: 'Oujda',
    nameFr: 'Oujda',
    region: 'Oriental',
    population: 494000,
    description: 'Oujda is Morocco\'s eastern gateway, bordering Algeria, with strategic positioning for Maghreb connectivity. The city offers growing tech infrastructure and serves as an eastern redundancy point for national datacenter networks.',
    strategicAdvantages: [
      'Eastern gateway — strategic for Maghreb connectivity',
      'Growing tech infrastructure with university partnerships',
      'Lower cost of operations than western hubs',
      'Geographic redundancy for national datacenter networks',
      'Proximity to Mediterranean submarine cable systems',
    ],
    keyStats: {
      latencyToEurope: '<20ms to Marseille',
      powerCost: '0.11 USD/kWh (industrial)',
      renewablePercentage: '38% (2024)',
      fiberConnections: 3,
      universities: 4,
    },
  },
];

export const serviceLines: ServiceLine[] = [
  {
    slug: 'gpu-cloud',
    name: 'GPU Cloud',
    category: 'gpu-cloud',
    shortDesc: 'On-demand GPU compute for AI training and inference, powered by 100% renewable energy.',
    longDesc: 'Harch Corp\'s GPU Cloud provides on-demand access to NVIDIA H100, H200, and B200 GPUs for AI training, inference, and HPC workloads. Our carbon-aware scheduling system routes workloads to renewable energy sources, achieving 47 gCO2/kWh carbon intensity — among the lowest in the world.',
    keyBenefits: [
      'H100/H200/B200 GPUs available on-demand',
      'Carbon-aware workload scheduling (47 gCO2/kWh)',
      '400G InfiniBand networking for distributed training',
      'Per-second billing with spot instance discounts',
      'Pre-built environments for PyTorch, TensorFlow, JAX',
    ],
    targetCustomers: ['AI startups', 'Research labs', 'Enterprise AI teams', 'Government agencies', 'Universities'],
  },
  {
    slug: 'datacenter',
    name: 'Datacenter Colocation',
    category: 'datacenter',
    shortDesc: 'Tier III+ colocation with liquid cooling, 50kW/rack density, and 100% renewable energy.',
    longDesc: 'Harch Corp operates Tier III+ datacenters across Morocco with industry-leading PUE (1.08-1.24), liquid cooling for high-density AI workloads, and 100% renewable energy. Colocation services include rack space, power, cooling, network connectivity, and remote hands support.',
    keyBenefits: [
      'Tier III+ availability (99.982%)',
      'Liquid cooling — up to 50kW/rack',
      'PUE 1.08-1.24 (industry-leading)',
      '100% renewable energy (solar + wind PPAs)',
      '24/7 NOC with remote hands support',
    ],
    targetCustomers: ['Enterprises', 'Cloud providers', 'Financial institutions', 'Government agencies', 'Research institutions'],
  },
  {
    slug: 'sovereign-ai',
    name: 'Sovereign AI Infrastructure',
    category: 'ai',
    shortDesc: 'Domestic AI infrastructure ensuring data sovereignty and national AI independence.',
    longDesc: 'Harch Corp\'s Sovereign AI Infrastructure enables nations and enterprises to build, train, and deploy AI models within their borders. Our Moroccan GPU cloud ensures data sovereignty under Law 09-08, with optional air-gapped deployment for maximum security.',
    keyBenefits: [
      'Data sovereignty under Law 09-08 and GDPR',
      'Air-gapped deployment option',
      'Domestic GPU infrastructure (no foreign dependency)',
      'Sovereign LLM training and fine-tuning',
      'Compliance with national security requirements',
    ],
    targetCustomers: ['Government agencies', 'Defense', 'Critical infrastructure', 'Financial institutions', 'Healthcare'],
  },
  {
    slug: 'edge-computing',
    name: 'Edge Computing',
    category: 'datacenter',
    shortDesc: 'Low-latency edge datacenters for real-time AI inference and IoT applications.',
    longDesc: 'Harch Corp\'s edge computing network deploys micro-datacenters in strategic locations across Morocco, enabling <10ms latency for real-time AI inference, IoT data processing, and 5G mobile edge computing applications.',
    keyBenefits: [
      '<10ms latency for real-time applications',
      'Distributed edge nodes across major cities',
      '5G mobile edge computing ready',
      'IoT data processing at source',
      'Redundancy and failover capabilities',
    ],
    targetCustomers: ['Telecom operators', 'Smart cities', 'Autonomous vehicles', 'IoT deployments', 'Real-time AI applications'],
  },
  {
    slug: 'ai-training',
    name: 'AI Training Infrastructure',
    category: 'gpu-cloud',
    shortDesc: 'High-performance GPU clusters optimized for large-scale AI model training.',
    longDesc: 'Harch Corp\'s AI Training Infrastructure provides dedicated GPU clusters with 400G InfiniBand networking, NVLink, and proven configurations for distributed training of large language models (LLMs) and computer vision models.',
    keyBenefits: [
      'Dedicated H100/H200 GPU clusters (up to 256 GPUs)',
      '400G InfiniBand with NVLink',
      'Pre-configured for Megatron-LM, DeepSpeed, FSDP',
      'Storage optimized for AI workloads (NVMe + object storage)',
      'Expert ML engineering support',
    ],
    targetCustomers: ['AI labs', 'Foundation model developers', 'Enterprise AI teams', 'Research institutions', 'Government AI programs'],
  },
  {
    slug: 'ai-inference',
    name: 'AI Inference Serving',
    category: 'gpu-cloud',
    shortDesc: 'Optimized GPU infrastructure for high-throughput, low-latency AI model serving.',
    longDesc: 'Harch Corp\'s AI Inference Serving provides optimized GPU infrastructure for deploying production AI models with high throughput and low latency. Pre-built environments for vLLM, TensorRT-LLM, and Triton Inference Server.',
    keyBenefits: [
      'Optimized for vLLM, TensorRT-LLM, Triton',
      'Auto-scaling based on traffic',
      'Sub-100ms latency for real-time inference',
      'Quantization support (FP16, INT8, INT4)',
      'Built-in monitoring and observability',
    ],
    targetCustomers: ['SaaS companies', 'E-commerce platforms', 'Chatbot providers', 'Recommendation systems', 'Computer vision applications'],
  },
  {
    slug: 'high-performance-computing',
    name: 'High-Performance Computing (HPC)',
    category: 'gpu-cloud',
    shortDesc: 'HPC infrastructure for scientific computing, simulation, and research workloads.',
    longDesc: 'Harch Corp\'s HPC infrastructure provides high-performance computing resources for scientific simulations, computational fluid dynamics, molecular dynamics, weather forecasting, and other HPC workloads requiring massive parallel processing.',
    keyBenefits: [
      'GPU + CPU hybrid clusters',
      'High-speed parallel filesystems (Lustre, BeeGFS)',
      'Slurm workload scheduler',
      'MPI and OpenMP support',
      'Pre-built scientific software environments',
    ],
    targetCustomers: ['Research institutions', 'Universities', 'Aerospace', 'Oil and gas', 'Pharmaceutical', 'Weather services'],
  },
  {
    slug: 'disaster-recovery',
    name: 'Disaster Recovery & Backup',
    category: 'datacenter',
    shortDesc: 'Geographic disaster recovery with sub-1h RTO and 15-min RPO.',
    longDesc: 'Harch Corp\'s Disaster Recovery services provide geographic redundancy across our Moroccan datacenter locations, with sub-1h Recovery Time Objective (RTO) and 15-minute Recovery Point Objective (RPO) for mission-critical workloads.',
    keyBenefits: [
      'Geographic redundancy across multiple Moroccan cities',
      'Sub-1h RTO, 15-min RPO',
      'Automated failover and failback',
      'Continuous data replication',
      'DR testing and validation services',
    ],
    targetCustomers: ['Financial institutions', 'Healthcare', 'Government', 'E-commerce', 'Critical infrastructure'],
  },
];

// Generate all location × service combinations
export function generateLocationServicePages() {
  const pages: { city: MoroccanCity; service: ServiceLine; slug: string }[] = [];
  for (const city of moroccanCities) {
    for (const service of serviceLines) {
      pages.push({
        city,
        service,
        slug: `${city.slug}/${service.slug}`,
      });
    }
  }
  return pages;
}

// Comparison data
export type Comparison = {
  slug: string;
  title: string;
  category: 'gpu-comparison' | 'provider-comparison' | 'tech-comparison' | 'cost-comparison';
  shortDesc: string;
  longDesc: string;
  entity1: {
    name: string;
    pros: string[];
    cons: string[];
    keySpecs: Record<string, string>;
  };
  entity2: {
    name: string;
    pros: string[];
    cons: string[];
    keySpecs: Record<string, string>;
  };
  verdict: string;
};

export const comparisons: Comparison[] = [
  {
    slug: 'h100-vs-h200',
    title: 'NVIDIA H100 vs H200: Which GPU for AI Workloads?',
    category: 'gpu-comparison',
    shortDesc: 'Complete comparison of NVIDIA H100 and H200 GPUs — performance, memory, pricing, and use cases.',
    longDesc: 'The NVIDIA H100 and H200 are both built on the Hopper architecture, but the H200 offers significant improvements in memory capacity (141GB vs 80GB) and bandwidth (4.8 TB/s vs 3.35 TB/s). This comparison helps you choose the right GPU for your AI workloads.',
    entity1: {
      name: 'NVIDIA H100',
      pros: ['Proven at scale (in production since 2023)', 'Lower cost per GPU', 'Wide software ecosystem support', '80GB HBM3 sufficient for most workloads'],
      cons: ['Limited memory for very large models', 'Lower memory bandwidth than H200', 'Being phased out by newer GPUs'],
      keySpecs: {
        'Architecture': 'Hopper',
        'Memory': '80GB HBM3',
        'Bandwidth': '3.35 TB/s',
        'FP8 Performance': '3,958 TFLOPS',
        'FP16 Performance': '1,979 TFLOPS',
        'TDP': '700W',
        'Interconnect': 'NVLink 4.0 (900 GB/s)',
      },
    },
    entity2: {
      name: 'NVIDIA H200',
      pros: ['141GB HBM3e memory — 1.76x more than H100', '4.8 TB/s bandwidth — 1.43x faster', '1.9x faster LLM inference', 'Better for trillion-parameter models'],
      cons: ['Higher cost per GPU', 'Limited availability (newer)', 'May be overkill for smaller workloads'],
      keySpecs: {
        'Architecture': 'Hopper (enhanced)',
        'Memory': '141GB HBM3e',
        'Bandwidth': '4.8 TB/s',
        'FP8 Performance': '3,958 TFLOPS',
        'FP16 Performance': '1,979 TFLOPS',
        'TDP': '700W',
        'Interconnect': 'NVLink 4.0 (900 GB/s)',
      },
    },
    verdict: 'Choose H100 for cost-effective AI training and inference on models up to 70B parameters. Choose H200 for training and serving very large models (70B+ parameters) where memory capacity and bandwidth are critical. Harch Corp offers both H100 and H200 GPU cloud instances.',
  },
  {
    slug: 'h100-vs-a100',
    title: 'NVIDIA H100 vs A100: Worth the Upgrade for AI?',
    category: 'gpu-comparison',
    shortDesc: 'Performance, cost, and ROI comparison of upgrading from A100 to H100 GPUs.',
    longDesc: 'The NVIDIA A100 has been the workhorse of AI infrastructure since 2020, but the H100 (released 2023) offers 4x faster training and 30x faster inference. This comparison helps you decide if upgrading is worth the investment.',
    entity1: {
      name: 'NVIDIA A100',
      pros: ['Lower cost (especially used market)', 'Mature software ecosystem', '40GB and 80GB variants', 'Good for inference and fine-tuning'],
      cons: ['Older Ampere architecture', 'Slower training (3-4x vs H100)', 'Lower memory bandwidth', 'Being phased out'],
      keySpecs: {
        'Architecture': 'Ampere',
        'Memory': '40GB or 80GB HBM2e',
        'Bandwidth': '1.55 TB/s (80GB) / 1.94 TB/s (40GB)',
        'FP16 Performance': '624 TFLOPS (with sparsity)',
        'TDP': '400W',
        'Interconnect': 'NVLink 3.0 (600 GB/s)',
      },
    },
    entity2: {
      name: 'NVIDIA H100',
      pros: ['4x faster training than A100', '30x faster inference (with FP8)', 'Transformer Engine for LLMs', 'Industry standard for new deployments'],
      cons: ['Higher cost per GPU', 'Requires newer datacenter infrastructure', '700W TDP requires liquid cooling'],
      keySpecs: {
        'Architecture': 'Hopper',
        'Memory': '80GB HBM3',
        'Bandwidth': '3.35 TB/s',
        'FP16 Performance': '1,979 TFLOPS',
        'TDP': '700W',
        'Interconnect': 'NVLink 4.0 (900 GB/s)',
      },
    },
    verdict: 'For new AI training deployments, H100 is the clear choice — 4x faster training means 4x lower total cost despite higher per-GPU cost. For inference-only workloads on smaller models, A100 may still be cost-effective. Harch Corp offers both A100 and H100 GPU cloud instances.',
  },
  {
    slug: 'harch-corp-vs-aws',
    title: 'Harch Corp vs AWS: GPU Cloud Comparison for AI',
    category: 'provider-comparison',
    shortDesc: 'Compare Harch Corp\'s carbon-aware GPU cloud with AWS for AI training and inference workloads.',
    longDesc: 'AWS is the largest cloud provider globally, but Harch Corp offers significant advantages for AI workloads: lower carbon intensity (47 vs 350+ gCO2/kWh), lower costs, data sovereignty in Morocco, and specialized GPU cloud expertise.',
    entity1: {
      name: 'Harch Corp',
      pros: ['47 gCO2/kWh carbon intensity (vs AWS 350+)', 'Lower GPU cloud costs (20-40% cheaper)', 'Data sovereignty in Morocco (Law 09-08)', 'Carbon-aware workload scheduling', 'Specialized GPU cloud expertise'],
      cons: ['Smaller scale than AWS', 'Fewer managed services', 'Morocco-focused (limited global regions)'],
      keySpecs: {
        'GPUs Available': 'H100, H200, B200, A100',
        'Carbon Intensity': '47 gCO2/kWh',
        'PUE': '1.08-1.24',
        'Network': '400G InfiniBand',
        'Locations': 'Morocco (5 hubs)',
        'Data Sovereignty': 'Yes (Law 09-08 compliant)',
      },
    },
    entity2: {
      name: 'AWS',
      pros: ['Global scale (30+ regions)', 'Extensive managed services', 'Mature ecosystem', 'Enterprise credibility'],
      cons: ['High carbon intensity (350+ gCO2/kWh)', 'Expensive GPU instances', 'No data sovereignty in Morocco', 'Complex pricing', 'Vendor lock-in'],
      keySpecs: {
        'GPUs Available': 'H100, A100, T4, L4',
        'Carbon Intensity': '350+ gCO2/kWh (varies by region)',
        'PUE': '1.1-1.3 (varies)',
        'Network': 'EFA (custom)',
        'Locations': '30+ regions globally',
        'Data Sovereignty': 'Varies by region',
      },
    },
    verdict: 'For AI workloads requiring data sovereignty in Morocco/Africa, low carbon footprint, or cost optimization, Harch Corp is the clear winner. For workloads requiring global scale or extensive managed services, AWS may be preferable. Many customers use Harch Corp as a multi-cloud complement to AWS.',
  },
  {
    slug: 'gpu-cloud-vs-on-premises',
    title: 'GPU Cloud vs On-Premises: TCO Comparison for AI',
    category: 'cost-comparison',
    shortDesc: 'Total cost of ownership analysis of GPU cloud vs on-premises GPU infrastructure for AI workloads.',
    longDesc: 'Deciding between GPU cloud and on-premises GPU infrastructure is a critical decision for AI teams. This TCO comparison covers hardware costs, power, cooling, staff, and utilization factors to help you choose the right model.',
    entity1: {
      name: 'GPU Cloud (Harch Corp)',
      pros: ['No upfront CAPEX', 'Pay per use (OPEX model)', 'Elastic scaling', 'Latest GPUs always available', 'No maintenance or staff costs'],
      cons: ['Higher cost per GPU-hour at high utilization', 'Less control over hardware', 'Network dependency'],
      keySpecs: {
        'Upfront Cost': '$0',
        'Cost per H100-hour': '$2.50-4.00',
        'Time to Provision': 'Minutes',
        'Utilization': 'Pay per use',
        'Staff Required': '0',
        'Hardware Refresh': 'Automatic',
      },
    },
    entity2: {
      name: 'On-Premises GPU Cluster',
      pros: ['Lower cost at high utilization (>70%)', 'Full control over hardware', 'No network dependency', 'Data never leaves premises'],
      cons: ['High upfront CAPEX ($30K-40K per GPU)', 'Requires datacenter space and power', 'Needs specialized staff', 'Hardware depreciates (3-5 years)', 'Limited scalability'],
      keySpecs: {
        'Upfront Cost': '$500K-5M+',
        'Cost per H100-hour': '$1.50-2.50 (at 70% utilization)',
        'Time to Provision': 'Months',
        'Utilization': 'Fixed capacity',
        'Staff Required': '2-5 FTE',
        'Hardware Refresh': '3-5 years',
      },
    },
    verdict: 'For AI workloads with <50% utilization or variable compute needs, GPU cloud is cheaper and more flexible. For >70% utilization with stable workloads, on-premises may be cheaper over 3-5 years. Harch Corp offers both GPU cloud and colocation for hybrid deployments.',
  },
  {
    slug: 'infiniband-vs-ethernet',
    title: 'InfiniBand vs Ethernet for GPU Clusters',
    category: 'tech-comparison',
    shortDesc: 'Network comparison for distributed AI training — InfiniBand vs Ethernet (RoCE).',
    longDesc: 'Choosing between InfiniBand and Ethernet (with RoCE) for GPU cluster networking is a critical decision for distributed AI training performance. This comparison covers bandwidth, latency, cost, and use cases.',
    entity1: {
      name: 'InfiniBand (NDR 400G)',
      pros: ['Lowest latency (<1 microsecond)', 'Native RDMA support', 'Superior for distributed training', 'Industry standard for AI supercomputers'],
      cons: ['Higher cost', 'Limited vendor options (NVIDIA/Mellanox)', 'Requires specialized switches'],
      keySpecs: {
        'Bandwidth': '400 Gb/s (NDR)',
        'Latency': '<1 microsecond',
        'RDMA': 'Native',
        'Switch Vendors': 'NVIDIA (Quantum-2)',
        'Cost': 'Premium',
        'Use Case': 'Distributed training, HPC',
      },
    },
    entity2: {
      name: 'Ethernet (RoCE 400G)',
      pros: ['Lower cost', 'Multiple vendor options', 'Easier to manage', 'Familiar to IT teams'],
      cons: ['Higher latency than InfiniBand', 'Requires RoCE for RDMA', 'More complex tuning for AI'],
      keySpecs: {
        'Bandwidth': '400 Gb/s',
        'Latency': '2-5 microseconds',
        'RDMA': 'Via RoCEv2',
        'Switch Vendors': 'Cisco, Arista, NVIDIA, Juniper',
        'Cost': 'Lower',
        'Use Case': 'General datacenter, mixed workloads',
      },
    },
    verdict: 'For large-scale distributed training (>32 GPUs), InfiniBand is the clear choice — its lower latency and native RDMA deliver 20-30% faster training. For smaller clusters or mixed workloads, Ethernet with RoCE may be sufficient and more cost-effective. Harch Corp uses InfiniBand for its GPU cloud clusters.',
  },
  {
    slug: 'morocco-vs-ireland-datacenter',
    title: 'Morocco vs Ireland: Datacenter Location Comparison',
    category: 'provider-comparison',
    shortDesc: 'Compare Morocco and Ireland as datacenter locations — climate, energy, costs, connectivity.',
    longDesc: 'Ireland has been Europe\'s datacenter hub for years, but Morocco offers compelling advantages: lower carbon intensity, lower costs, better climate for free cooling, and strategic positioning between Europe and Africa.',
    entity1: {
      name: 'Morocco',
      pros: ['Lower carbon intensity (47 gCO2/kWh vs 300+)', 'Lower power costs', 'Excellent renewable energy (solar + wind)', 'Strategic location (Europe + Africa)', 'Growing tech ecosystem'],
      cons: ['Less established datacenter market', 'Fewer existing providers', 'Smaller talent pool (growing)'],
      keySpecs: {
        'Carbon Intensity': '47 gCO2/kWh (Harch Corp)',
        'Power Cost': '$0.08-0.12/kWh',
        'Renewable %': '40% (target 52% by 2030)',
        'Latency to Europe': '8-25ms',
        'Free Cooling Hours': '5,000+/year',
        'Data Protection': 'Law 09-08',
      },
    },
    entity2: {
      name: 'Ireland',
      pros: ['Established datacenter ecosystem', 'Major hyperscaler presence (AWS, Azure, Google)', 'Cool climate ideal for free cooling', 'EU data protection (GDPR)', 'Skilled talent pool'],
      cons: ['High carbon intensity (300+ gCO2/kWh)', 'High power costs', 'Grid capacity constraints', 'Datacenter moratorium in Dublin (2023-2025)', 'Cold, wet climate increases humidity issues'],
      keySpecs: {
        'Carbon Intensity': '300+ gCO2/kWh',
        'Power Cost': '$0.15-0.25/kWh',
        'Renewable %': '40% (mostly wind)',
        'Latency to Europe': '5-15ms',
        'Free Cooling Hours': '7,000+/year',
        'Data Protection': 'GDPR',
      },
    },
    verdict: 'Morocco wins on carbon intensity, cost, and renewable energy potential. Ireland wins on ecosystem maturity and EU data protection. For carbon-conscious AI workloads or those serving African markets, Morocco (Harch Corp) is the better choice. For EU-only workloads requiring established ecosystem, Ireland remains viable.',
  },
  {
    slug: 'solar-vs-wind-datacenter',
    title: 'Solar vs Wind Power for Datacenters',
    category: 'tech-comparison',
    shortDesc: 'Compare solar and wind energy for powering datacenters — reliability, cost, location factors.',
    longDesc: 'Both solar and wind power can decarbonize datacenters, but each has different characteristics. Solar is predictable but intermittent (daytime only), while wind is less predictable but can generate 24/7. The best datacenter energy strategy uses both.',
    entity1: {
      name: 'Solar Power',
      pros: ['Predictable daily generation pattern', 'No moving parts (low maintenance)', 'Scalable (small to utility-scale)', 'Falling costs (80% reduction since 2010)'],
      cons: ['Daytime only (needs storage)', 'Lower capacity factor (20-30%)', 'Requires large land area', 'Reduced output in winter/cloudy periods'],
      keySpecs: {
        'Capacity Factor': '20-30%',
        'LCOE': '$0.03-0.06/kWh (utility-scale)',
        'Land Required': '5-10 acres/MW',
        'Maintenance': 'Low (no moving parts)',
        'Lifespan': '25-30 years',
        'Best Regions': 'Morocco, MENA, Australia, US Southwest',
      },
    },
    entity2: {
      name: 'Wind Power',
      pros: ['Can generate 24/7', 'Higher capacity factor (35-50%)', 'Smaller land footprint (per MW)', 'Complements solar (often windy at night)'],
      cons: ['Less predictable', 'Moving parts (higher maintenance)', 'Visual and noise impact', 'Limited to windy regions'],
      keySpecs: {
        'Capacity Factor': '35-50% (onshore), 45-55% (offshore)',
        'LCOE': '$0.03-0.07/kWh (onshore)',
        'Land Required': '0.5-2 acres/MW (turbine footprint)',
        'Maintenance': 'Medium (gearbox, blades)',
        'Lifespan': '20-25 years',
        'Best Regions': 'Morocco (Atlantic coast), Northern Europe, US Great Plains',
      },
    },
    verdict: 'For datacenters, the best strategy is a combination: solar for daytime base load + wind for 24/7 coverage + battery storage for gaps. Harch Corp uses both solar and wind PPAs to achieve 100% renewable energy with 24/7 availability.',
  },
  {
    slug: 'liquid-cooling-vs-air-cooling',
    title: 'Liquid Cooling vs Air Cooling for Datacenters',
    category: 'tech-comparison',
    shortDesc: 'Compare liquid and air cooling for high-density AI datacenter workloads.',
    longDesc: 'As AI workloads push power density beyond 30kW/rack, traditional air cooling becomes inefficient. Liquid cooling offers superior heat removal but adds complexity. This comparison helps you choose the right cooling for your datacenter.',
    entity1: {
      name: 'Liquid Cooling',
      pros: ['Handles 50-100kW/rack density', 'Lower PUE (1.05-1.15)', 'Quieter operation', 'Reduced HVAC energy'],
      cons: ['Higher upfront cost', 'Complexity (leaks, maintenance)', 'Limited vendor ecosystem', 'Requires trained staff'],
      keySpecs: {
        'Max Density': '50-100kW/rack',
        'PUE': '1.05-1.15',
        'Coolant': 'Water or dielectric fluid',
        'Maintenance': 'High',
        'Capex': 'Higher',
        'Opex': 'Lower (energy savings)',
      },
    },
    entity2: {
      name: 'Air Cooling',
      pros: ['Simple and proven', 'Lower upfront cost', 'Familiar to all operators', 'No leak risk'],
      cons: ['Limited to 15-20kW/rack', 'Higher PUE (1.3-1.6)', 'Noisy fans', 'Inefficient at high density'],
      keySpecs: {
        'Max Density': '15-20kW/rack',
        'PUE': '1.3-1.6',
        'Coolant': 'Air',
        'Maintenance': 'Low',
        'Capex': 'Lower',
        'Opex': 'Higher (fan energy)',
      },
    },
    verdict: 'For AI/GPU workloads exceeding 20kW/rack, liquid cooling is mandatory. For traditional IT workloads (5-15kW/rack), air cooling remains cost-effective. Harch Corp uses direct-to-chip liquid cooling for GPU clusters and air cooling for lower-density zones.',
  },
];

// Use case pages
export type UseCase = {
  slug: string;
  title: string;
  industry: string;
  shortDesc: string;
  longDesc: string;
  challenges: string[];
  solutions: string[];
  benefits: string[];
  relatedServices: string[];
};

export const useCases: UseCase[] = [
  {
    slug: 'fintech-ai-fraud-detection',
    title: 'AI Fraud Detection for Fintech',
    industry: 'Financial Services',
    shortDesc: 'Real-time fraud detection using GPU-accelerated ML models for fintech companies.',
    longDesc: 'Fintech companies process millions of transactions per second, requiring real-time fraud detection with sub-100ms latency. Harch Corp\'s GPU cloud provides the infrastructure for training and serving fraud detection models at scale, with data sovereignty compliant with financial regulations.',
    challenges: [
      'Sub-100ms latency for real-time fraud detection',
      'High throughput (millions of transactions/second)',
      'Data sovereignty and regulatory compliance',
      'Model retraining with new fraud patterns',
      'Cost-effective scaling during peak hours',
    ],
    solutions: [
      'GPU-accelerated XGBoost and neural network models',
      'Real-time inference with TensorRT optimization',
      'Data sovereignty in Morocco (Law 09-08 compliant)',
      'Automated MLOps pipeline for model retraining',
      'Auto-scaling GPU instances for peak traffic',
    ],
    benefits: [
      '99.5% fraud detection accuracy',
      '<50ms inference latency',
      '40% reduction in false positives',
      '60% cost savings vs on-premises',
      'Full regulatory compliance',
    ],
    relatedServices: ['gpu-cloud', 'ai-inference', 'sovereign-ai', 'disaster-recovery'],
  },
  {
    slug: 'healthcare-medical-imaging-ai',
    title: 'Medical Imaging AI for Healthcare',
    industry: 'Healthcare',
    shortDesc: 'GPU-accelerated AI for medical image analysis, diagnosis assistance, and research.',
    longDesc: 'Medical imaging AI requires massive GPU compute for training on millions of DICOM images and low-latency inference for real-time diagnosis assistance. Harch Corp provides HIPAA-compatible infrastructure with data sovereignty for healthcare providers.',
    challenges: [
      'Massive datasets (terabytes of DICOM images)',
      'Strict data privacy (HIPAA, GDPR, local health laws)',
      'Long training times for 3D medical models',
      'Real-time inference for clinical use',
      'Regulatory compliance (FDA, CE marking)',
    ],
    solutions: [
      'Multi-GPU training clusters (H100/H200)',
      'Air-gapped deployment for sensitive data',
      'Data sovereignty under Law 09-08',
      'TensorRT-optimized inference servers',
      'Compliance-ready infrastructure',
    ],
    benefits: [
      '10x faster model training',
      '<200ms inference for real-time diagnosis',
      '100% data sovereignty compliance',
      'Improved diagnostic accuracy',
      'Reduced healthcare costs',
    ],
    relatedServices: ['gpu-cloud', 'ai-training', 'ai-inference', 'sovereign-ai'],
  },
  {
    slug: 'agriculture-precision-farming-ai',
    title: 'Precision Farming AI for Agriculture',
    industry: 'Agriculture',
    shortDesc: 'AI-powered crop monitoring, yield prediction, and resource optimization for agriculture.',
    longDesc: 'Precision farming uses AI to analyze satellite imagery, drone data, and IoT sensors for crop health monitoring, yield prediction, and optimal resource allocation. Harch Corp provides GPU cloud infrastructure for training and deploying agricultural AI models.',
    challenges: [
      'Processing massive satellite/drone imagery datasets',
      'Real-time crop health monitoring',
      'Edge deployment for remote farms',
      'Cost-effective AI for smallholder farmers',
      'Integration with IoT sensor networks',
    ],
    solutions: [
      'GPU-accelerated computer vision models',
      'Edge computing for on-farm inference',
      'Satellite imagery processing pipelines',
      'Affordable GPU cloud pricing for agriculture',
      'IoT data integration APIs',
    ],
    benefits: [
      '30% increase in crop yields',
      '25% reduction in water usage',
      '40% reduction in fertilizer costs',
      'Early pest/disease detection',
      'Sustainable farming practices',
    ],
    relatedServices: ['gpu-cloud', 'ai-training', 'edge-computing', 'ai-inference'],
  },
  {
    slug: 'government-sovereign-ai',
    title: 'Sovereign AI for Government',
    industry: 'Government',
    shortDesc: 'Domestic AI infrastructure for government agencies requiring data sovereignty.',
    longDesc: 'Government agencies require AI infrastructure that keeps sensitive data within national borders. Harch Corp\'s sovereign AI provides domestic GPU cloud, air-gapped deployment options, and compliance with national security requirements.',
    challenges: [
      'Strict data sovereignty requirements',
      'National security compliance',
      'Air-gapped deployment for classified workloads',
      'Procurement and regulatory hurdles',
      'Long-term vendor stability',
    ],
    solutions: [
      'Domestic GPU cloud in Morocco',
      'Air-gapped deployment option',
      'Law 09-08 and government compliance',
      'Moroccan-owned and operated',
      'Government procurement ready',
    ],
    benefits: [
      '100% data sovereignty',
      'National AI independence',
      'Compliance with security requirements',
      'Local technical support',
      'Strategic technology partnership',
    ],
    relatedServices: ['sovereign-ai', 'gpu-cloud', 'datacenter', 'disaster-recovery'],
  },
  {
    slug: 'research-university-hpc',
    title: 'HPC for University Research',
    industry: 'Education',
    shortDesc: 'High-performance computing for academic research in AI, science, and engineering.',
    longDesc: 'Universities require HPC infrastructure for research in AI, computational science, engineering, and more. Harch Corp provides affordable GPU cloud and HPC infrastructure with academic pricing and research collaboration support.',
    challenges: [
      'Limited research budgets',
      'Variable compute needs (grant cycles)',
      'Need for latest GPU technology',
      'Collaboration across institutions',
      'Training the next generation of researchers',
    ],
    solutions: [
      'Academic pricing (50%+ discount)',
      'On-demand GPU cloud (no upfront cost)',
      'Latest H100/H200/B200 GPUs',
      'Multi-tenant research environments',
      'Educational resources and training',
    ],
    benefits: [
      '50% cost savings vs on-premises cluster',
      'Access to latest GPU technology',
      'Faster research outcomes',
      'Student and researcher training',
      'Publication-ready infrastructure',
    ],
    relatedServices: ['gpu-cloud', 'high-performance-computing', 'ai-training', 'datacenter'],
  },
  {
    slug: 'media-content-generation-ai',
    title: 'AI Content Generation for Media',
    industry: 'Media & Entertainment',
    shortDesc: 'GPU infrastructure for AI-powered content generation — video, image, audio, text.',
    longDesc: 'Media companies use AI for content generation (video, images, audio, text), post-production, and personalization. Harch Corp provides GPU cloud optimized for generative AI workloads including Stable Diffusion, DALL-E, and LLMs.',
    challenges: [
      'Massive GPU requirements for generative AI',
      'Variable workload (project-based)',
      'Cost pressure in media industry',
      'Need for latest GPU technology',
      'Integration with creative workflows',
    ],
    solutions: [
      'GPU clusters optimized for generative AI',
      'Pre-built environments for Stable Diffusion, LLMs',
      'Spot instances for cost optimization',
      'Latest H100/H200 GPUs',
      'API integration with creative tools',
    ],
    benefits: [
      '10x faster content generation',
      '60% cost savings vs on-premises',
      'Scalable for project-based workloads',
      'Access to latest AI models',
      'Faster time-to-market',
    ],
    relatedServices: ['gpu-cloud', 'ai-training', 'ai-inference', 'high-performance-computing'],
  },
  {
    slug: 'retail-recommendation-engines',
    title: 'AI Recommendation Engines for Retail',
    industry: 'Retail & E-commerce',
    shortDesc: 'Real-time product recommendation AI for e-commerce and retail platforms.',
    longDesc: 'E-commerce platforms require real-time recommendation engines that process user behavior and product catalogs to suggest relevant products. Harch Corp provides GPU cloud infrastructure for training and serving recommendation models at scale.',
    challenges: [
      'Real-time inference (<100ms)',
      'High throughput (millions of users)',
      'A/B testing infrastructure',
      'Cold start problem (new users/products)',
      'Cost-effective scaling',
    ],
    solutions: [
      'GPU-accelerated recommendation models',
      'Real-time inference with TensorRT',
      'Auto-scaling for traffic peaks',
      'Vector database for similarity search',
      'MLOps pipeline for continuous training',
    ],
    benefits: [
      '<50ms recommendation latency',
      '20% increase in conversion rates',
      '15% increase in average order value',
      '50% cost savings vs on-premises',
      'Real-time personalization',
    ],
    relatedServices: ['gpu-cloud', 'ai-inference', 'edge-computing'],
  },
  {
    slug: 'telecom-5g-edge-ai',
    title: '5G Edge AI for Telecom',
    industry: 'Telecommunications',
    shortDesc: 'Edge computing and AI infrastructure for 5G mobile network operators.',
    longDesc: 'Telecom operators deploying 5G networks need edge computing infrastructure for low-latency applications like autonomous vehicles, AR/VR, and IoT. Harch Corp provides edge datacenters and GPU cloud for 5G mobile edge computing.',
    challenges: [
      'Sub-10ms latency for 5G applications',
      'Distributed edge deployment',
      'Integration with 5G core network',
      'Cost management at scale',
      'Regulatory compliance',
    ],
    solutions: [
      'Edge datacenters in strategic locations',
      'GPU cloud for AI inference at edge',
      '5G mobile edge computing (MEC) ready',
      'Network function virtualization (NFV)',
      'Multi-access edge computing (MEC)',
    ],
    benefits: [
      '<10ms latency for 5G applications',
      'New revenue streams (edge AI services)',
      'Reduced backhaul costs',
      'Improved user experience',
      'Competitive differentiation',
    ],
    relatedServices: ['edge-computing', 'datacenter', 'ai-inference', 'gpu-cloud'],
  },
];
