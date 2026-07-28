// FAQ pages + calculators data — SEO content

export type FAQItem = {
  question: string;
  answer: string;
};

export type FAQPage = {
  slug: string;
  title: string;
  category: 'pricing' | 'gpu' | 'datacenter' | 'ai' | 'morocco' | 'energy';
  shortDesc: string;
  metaDescription: string;
  keywords: string[];
  faqs: FAQItem[];
  relatedGlossary?: string[];
};

export const faqPages: FAQPage[] = [
  {
    slug: 'gpu-cloud-pricing-faq',
    title: 'GPU Cloud Pricing FAQ — All Your Questions Answered',
    category: 'pricing',
    shortDesc: 'Complete guide to GPU cloud pricing. How much does H100, H200, A100 cost per hour? Spot vs on-demand? Hidden fees? All answered.',
    metaDescription: 'GPU cloud pricing explained: H100 $2.50-4.00/hr, H200 $3.50-5.50/hr, A100 $1.50-2.50/hr. Spot vs on-demand, hidden fees, cost optimization tips.',
    keywords: ['gpu cloud pricing', 'h100 price per hour', 'h200 cost', 'gpu cloud cost', 'a100 pricing', 'gpu rental price'],
    faqs: [
      {
        question: 'How much does an NVIDIA H100 GPU cost per hour in the cloud?',
        answer: 'H100 GPU cloud pricing ranges from $2.50 to $4.00 per hour for on-demand instances. Spot instances (preemptible) can be 60-70% cheaper at $0.80-1.50/hr. Harch Corp offers H100 at $2.80/hr on-demand and $1.00/hr spot, among the most competitive globally.',
      },
      {
        question: 'How much does an NVIDIA H200 GPU cost per hour?',
        answer: 'H200 GPU cloud pricing ranges from $3.50 to $5.50 per hour on-demand. As a newer GPU with 141GB HBM3e memory, it commands a premium over H100. Harch Corp offers H200 at $4.20/hr on-demand, with volume discounts available.',
      },
      {
        question: 'How much does an NVIDIA A100 GPU cost per hour?',
        answer: 'A100 GPU cloud pricing ranges from $1.50 to $2.50 per hour for the 80GB variant. The 40GB variant is slightly cheaper at $1.20-2.00/hr. A100 is the most cost-effective option for inference workloads on models up to 30B parameters.',
      },
      {
        question: 'What is the difference between spot and on-demand GPU instances?',
        answer: 'On-demand GPU instances guarantee availability at a fixed price — you pay the listed hourly rate. Spot instances use spare GPU capacity at 60-70% discount but can be preempted (interrupted) with 2-minute notice. Use spot for batch training jobs that can checkpoint; use on-demand for inference and interactive workloads.',
      },
      {
        question: 'Are there hidden fees in GPU cloud pricing?',
        answer: 'Watch for: (1) Egress fees ($0.05-0.12/GB for data leaving the cloud), (2) Storage fees ($0.10-0.23/GB/month for SSD), (3) Network fees for inter-GPU traffic on some providers, (4) Support tier upgrades. Harch Corp includes free egress up to 5TB/month and free standard support.',
      },
      {
        question: 'How can I reduce my GPU cloud costs?',
        answer: 'Cost optimization strategies: (1) Use spot instances for training (60-70% savings), (2) Right-size your GPUs (don\'t use H100 for small models), (3) Use mixed precision (FP16/FP8) to reduce memory and speed up training, (4) Implement gradient checkpointing, (5) Use Harch Corp\'s carbon-aware scheduler for off-peak discounts.',
      },
      {
        question: 'Do you offer volume discounts for GPU cloud?',
        answer: 'Yes. Harch Corp offers volume discounts: 10% off for >$10K/month commitment, 20% off for >$50K/month, 30% off for >$200K/month. Reserved capacity (1-3 year commitments) offers additional 15-25% savings. Contact sales for enterprise pricing.',
      },
      {
        question: 'Is GPU cloud cheaper than buying my own GPUs?',
        answer: 'For utilization below 50%, GPU cloud is cheaper (no upfront CAPEX, pay per use). For utilization above 70% with stable workloads, on-premises may be cheaper over 3-5 years. Break-even is typically around 60% utilization. Use Harch Corp\'s TCO calculator to compare.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'Harch Corp accepts: credit cards (Visa, Mastercard, Amex), bank transfers (SEPA, SWIFT), PayPal, and invoicing for enterprise customers (NET-30 terms). Moroccan customers can pay via local bank transfer in MAD.',
      },
      {
        question: 'Can I get a free trial or credits?',
        answer: 'Yes. Harch Corp offers $500 in free GPU credits for new customers (valid 30 days). This is enough for ~125 H100-hours or ~200 A100-hours. Sign up at harchcorp.com/pricing to claim your credits. No credit card required for trial.',
      },
    ],
    relatedGlossary: ['gpu-cloud', 'h100-gpu', 'h200-gpu', 'a100-gpu', 'gpu-as-a-service'],
  },
  {
    slug: 'h100-gpu-faq',
    title: 'NVIDIA H100 GPU FAQ — Everything You Need to Know',
    category: 'gpu',
    shortDesc: 'Complete H100 FAQ: specs, performance, pricing, use cases, alternatives. All your H100 questions answered.',
    metaDescription: 'NVIDIA H100 GPU FAQ: 80GB HBM3, 3.35 TB/s bandwidth, 1,979 TFLOPS FP16. Performance, pricing, use cases, alternatives, and buying guide.',
    keywords: ['h100 faq', 'nvidia h100 questions', 'h100 specs', 'h100 performance', 'h100 vs a100'],
    faqs: [
      {
        question: 'What are the NVIDIA H100 GPU specifications?',
        answer: 'H100 specs: Architecture: Hopper. Memory: 80GB HBM3. Bandwidth: 3.35 TB/s. FP8: 3,958 TFLOPS. FP16: 1,979 TFLOPS. FP32: 67 TFLOPS. TDP: 700W. Interconnect: NVLink 4.0 (900 GB/s). Form factor: SXM5 or PCIe 5.0.',
      },
      {
        question: 'How fast is the H100 compared to A100?',
        answer: 'H100 is 3-4x faster than A100 for training and up to 30x faster for inference (with FP8). The Transformer Engine in H100 automatically switches between FP8 and FP16 for optimal LLM performance. For a 175B parameter model: A100 takes ~30 days to train, H100 takes ~8 days.',
      },
      {
        question: 'What is H100 FP8 and why does it matter?',
        answer: 'FP8 (8-bit floating point) is a new precision format in H100 that delivers 2x speedup over FP16 with minimal accuracy loss. For LLM inference, FP8 enables 30x faster throughput vs FP32. The Transformer Engine automatically selects the best precision per layer.',
      },
      {
        question: 'What workloads is the H100 best for?',
        answer: 'H100 excels at: (1) Large language model training (GPT, LLaMA, Claude), (2) LLM inference and serving, (3) Computer vision (stable diffusion, DALL-E), (4) Recommendation systems, (5) Scientific computing (CFD, molecular dynamics), (6) High-frequency trading analytics.',
      },
      {
        question: 'How much power does an H100 GPU consume?',
        answer: 'H100 SXM5 has a TDP of 700W; H100 PCIe has a TDP of 350W. A server with 8x H100 SXM5 consumes ~5.6kW for GPUs alone (plus ~1kW for CPU, memory, networking). This requires liquid cooling in most datacenter environments.',
      },
      {
        question: 'What cooling does the H100 require?',
        answer: 'H100 SXM5 (700W) requires liquid cooling — either direct-to-chip cold plates or immersion cooling. H100 PCIe (350W) can use advanced air cooling but liquid is recommended for density. Harch Corp uses direct-to-chip liquid cooling for all H100 deployments, supporting up to 50kW/rack.',
      },
      {
        question: 'Can I use H100 for inference, not just training?',
        answer: 'Yes. H100 is excellent for inference, especially for large models. With FP8 and TensorRT-LLM, H100 can serve 70B parameter models at 2,000+ tokens/second. For smaller models (7B-13B), A100 or even L4 may be more cost-effective for inference.',
      },
      {
        question: 'What is NVLink and why is it important for H100?',
        answer: 'NVLink 4.0 is NVIDIA\'s high-speed GPU interconnect, providing 900 GB/s bidirectional bandwidth between H100 GPUs (vs 64 GB/s for PCIe 5.0). NVLink enables: (1) Faster distributed training, (2) Larger models that span multiple GPUs, (3) Efficient tensor parallelism for LLMs.',
      },
      {
        question: 'How many H100 GPUs do I need to train a 70B parameter model?',
        answer: 'To train a 70B parameter model (like LLaMA 2 70B): (1) Fine-tuning: 8x H100 (80GB) for ~10 hours, (2) Full training from scratch: 64-256x H100 for 2-4 weeks. Cost estimate: 8x H100 fine-tuning = ~$200; 256x H100 full training = ~$200K-500K.',
      },
      {
        question: 'What are H100 alternatives?',
        answer: 'H100 alternatives: (1) H200 — 141GB memory, better for very large models, (2) A100 — cheaper, good for inference on <30B models, (3) B200 — next-gen Blackwell, 192GB, 4x faster, (4) AMD MI300X — competitive for some workloads, (5) Intel Gaudi 3 — cost-effective alternative.',
      },
    ],
    relatedGlossary: ['h100-gpu', 'h200-gpu', 'a100-gpu', 'gpu-cloud', 'distributed-training'],
  },
  {
    slug: 'datacenter-faq',
    title: 'Datacenter FAQ — PUE, Tier, Cooling, Colocation Explained',
    category: 'datacenter',
    shortDesc: 'Datacenter fundamentals: PUE, Tier ratings, cooling types, colocation costs, redundancy. Complete FAQ.',
    metaDescription: 'Datacenter FAQ: PUE (1.08-1.24), Tier III+ availability, liquid vs air cooling, colocation costs, redundancy. All your datacenter questions answered.',
    keywords: ['datacenter faq', 'pue meaning', 'tier 3 datacenter', 'datacenter cooling', 'colocation cost'],
    faqs: [
      {
        question: 'What is a good PUE for a datacenter?',
        answer: 'PUE (Power Usage Effectiveness) measures datacenter efficiency. Average industry PUE is 1.55 (Uptime Institute 2024). Best-in-class hyperscale: 1.10-1.20. Harch Corp achieves PUE 1.08-1.24 through liquid cooling, free cooling, and AI-optimized HVAC. Lower PUE = more efficient.',
      },
      {
        question: 'What is the difference between Tier I, II, III, and IV datacenters?',
        answer: 'Tier I: 99.671% uptime (28.8h downtime/yr), no redundancy. Tier II: 99.741% (22h), N+1 power. Tier III: 99.982% (1.6h), N+1 power+cooling, concurrently maintainable. Tier IV: 99.995% (26 min), 2N fully redundant, fault tolerant. Harch Corp operates Tier III+ facilities.',
      },
      {
        question: 'How much does datacenter colocation cost?',
        answer: 'Colocation costs vary by location and density: (1) Standard rack (5-10kW): $400-1,500/month, (2) High-density rack (15-20kW): $1,500-4,000/month, (3) GPU rack (30-50kW with liquid cooling): $4,000-12,000/month. Harch Corp offers competitive Morocco pricing: standard rack from $600/month, GPU rack from $5,000/month.',
      },
      {
        question: 'What is liquid cooling and when is it needed?',
        answer: 'Liquid cooling uses liquid (water or dielectric fluid) instead of air to cool servers. It\'s needed when rack power density exceeds 20kW/rack (typical for AI/GPU workloads). Benefits: 40-50% lower PUE, 50kW+/rack density, quieter operation. Harch Corp uses direct-to-chip liquid cooling for all GPU clusters.',
      },
      {
        question: 'What is the difference between N+1 and 2N redundancy?',
        answer: 'N+1 means one backup component for N active components (e.g., 2 UPS for 1 needed). 2N means full duplication (e.g., 2 completely separate power systems). 2N is more reliable but more expensive. Harch Corp uses 2N for power (dual feeds, dual UPS, dual generators) and N+1 for cooling.',
      },
      {
        question: 'How much power does a datacenter consume?',
        answer: 'Datacenter power consumption varies: (1) Small enterprise DC: 100-500kW, (2) Mid-size commercial: 1-5MW, (3) Hyperscale: 50-500MW. A single H100 GPU server (8 GPUs) consumes ~7kW. AI workloads are driving datacenter power demands to unprecedented levels. Harch Corp\'s 5 hubs total 50MW capacity.',
      },
      {
        question: 'What is free cooling and how does it work?',
        answer: 'Free cooling uses outside air or water to cool datacenters instead of mechanical chillers, saving 30-60% on cooling energy. Morocco\'s temperate climate enables 5,000+ hours/year of free cooling. Harch Corp uses air-side economizers (free cooling) when outside temperature is below 24°C, and direct-to-chip liquid cooling year-round.',
      },
      {
        question: 'What is hot aisle/cold aisle containment?',
        answer: 'Hot aisle/cold aisle containment arranges server racks so that hot exhaust air and cool intake air don\'t mix. Cold aisles (front of servers) receive cool air; hot aisles (rear of servers) collect exhaust. This improves cooling efficiency by 15-25%. Harch Corp uses hot aisle containment with liquid-cooled rear doors.',
      },
      {
        question: 'How do I choose a datacenter location?',
        answer: 'Key factors: (1) Latency to users (sub-50ms for real-time apps), (2) Power cost and availability, (3) Climate (free cooling potential), (4) Renewable energy availability, (5) Network connectivity (submarine cables, fiber), (6) Political stability, (7) Data sovereignty laws. Morocco offers an excellent balance.',
      },
      {
        question: 'What is datacenter tier certification?',
        answer: 'Tier certification is awarded by the Uptime Institute based on: (1) Design (Tier I-IV), (2) Construction (Facility), (3) Operational sustainability (Gold/Silver/Bronze). Certification requires independent audits. Harch Corp\'s facilities are designed to Tier III+ standards and pursuing official certification.',
      },
    ],
    relatedGlossary: ['datacenter', 'pue', 'liquid-cooling', 'tier-3-datacenter', 'redundancy'],
  },
  {
    slug: 'sovereign-ai-faq',
    title: 'Sovereign AI FAQ — What It Is and Why It Matters',
    category: 'ai',
    shortDesc: 'Sovereign AI explained: definition, importance, implementation, regulations. Complete FAQ for nations and enterprises.',
    metaDescription: 'Sovereign AI FAQ: what it is, why nations need it, how to build it, regulatory requirements, Morocco\'s sovereign AI strategy.',
    keywords: ['sovereign ai faq', 'ai sovereignty', 'sovereign ai infrastructure', 'national ai strategy'],
    faqs: [
      {
        question: 'What is sovereign AI?',
        answer: 'Sovereign AI is a nation\'s capability to develop, deploy, and control AI infrastructure within its borders, without dependence on foreign providers. It includes: (1) Domestic GPU cloud infrastructure, (2) Data sovereignty (data stored locally), (3) Locally trained AI models, (4) Domestic AI talent. Sovereign AI is critical for national security and economic independence.',
      },
      {
        question: 'Why do nations need sovereign AI?',
        answer: 'Sovereign AI matters because: (1) National security — don\'t depend on foreign AI for defense/intelligence, (2) Data sovereignty — keep citizen data in-country, (3) Economic independence — don\'t rent compute from foreign hyperscalers, (4) Regulatory compliance — some data must stay local, (5) Strategic autonomy — control over AI capabilities.',
      },
      {
        question: 'Which countries are building sovereign AI?',
        answer: 'Countries investing in sovereign AI: (1) France — Jean Zay supercomputer, (2) Germany — Leibniz Supercomputing Centre, (3) China — Baidu, Alibaba, Tencent clouds, (4) India — AI Mission $1.2B investment, (5) Saudi Arabia — SDAIA and HUMAIN, (6) UAE — G42, (7) Morocco — Harch Corp GPU cloud, AI Movement at UM6P.',
      },
      {
        question: 'How much does it cost to build sovereign AI infrastructure?',
        answer: 'Sovereign AI infrastructure costs: (1) Small (100 GPUs): $5-10M, (2) Medium (1,000 GPUs): $50-100M, (3) Large (10,000 GPUs): $500M-1B. Includes: GPU hardware, datacenter, networking, cooling, power infrastructure, software, and 5-year operating costs. Harch Corp offers sovereign AI as a service — no upfront investment.',
      },
      {
        question: 'What is data sovereignty and how does it relate to AI?',
        answer: 'Data sovereignty is the principle that data is subject to the laws of the country where it\'s stored. For AI: (1) Training data must stay in-country, (2) Model inference must run on domestic infrastructure, (3) No data leaves national borders. Morocco\'s Law 09-08 requires personal data of Moroccan residents to be stored in Morocco. Harch Corp provides Law 09-08 compliant AI infrastructure.',
      },
      {
        question: 'Can sovereign AI compete with hyperscaler AI?',
        answer: 'Sovereign AI doesn\'t need to compete on scale — it competes on: (1) Data sovereignty (hyperscalers can\'t guarantee this), (2) Regulatory compliance, (3) National security, (4) Lower latency for domestic users, (5) Lower cost (no data egress fees). For most government and regulated industry workloads, sovereign AI is the only option.',
      },
      {
        question: 'What is the difference between sovereign AI and private AI?',
        answer: 'Sovereign AI = national-level AI infrastructure controlled by a country. Private AI = organization-level AI infrastructure (on-premises or private cloud). Sovereign AI is broader — it serves an entire nation. Harch Corp provides both: sovereign AI for the Moroccan government, private AI for enterprises.',
      },
      {
        question: 'How is Morocco building sovereign AI?',
        answer: 'Morocco\'s sovereign AI strategy: (1) Harch Corp GPU cloud — 1,798 GPUs across 5 hubs, (2) AI Movement at UM6P — AI research, (3) 1337 and YouCode coding schools — talent, (4) Morocco Digital 2025 — national strategy, (5) Law 09-08 — data protection. Morocco ranks 4th in Africa on AI readiness.',
      },
      {
        question: 'What are the risks of not having sovereign AI?',
        answer: 'Risks of AI dependence: (1) Foreign providers can cut off access (geopolitical), (2) Data leaves the country (privacy risk), (3) Foreign laws apply to your data (CLOUD Act), (4) No control over AI model behavior, (5) Economic dependency (rent-seeking), (6) Strategic vulnerability in conflicts.',
      },
      {
        question: 'How can enterprises benefit from sovereign AI infrastructure?',
        answer: 'Enterprise benefits: (1) Regulatory compliance (financial, healthcare, government), (2) Data privacy (customer data stays in-country), (3) Lower latency (domestic infrastructure), (4) No egress fees, (5) Vendor diversification (avoid lock-in), (6) ESG benefits (renewable energy, lower carbon). Harch Corp serves enterprises with sovereign AI infrastructure.',
      },
    ],
    relatedGlossary: ['sovereign-ai', 'data-sovereignty', 'digital-sovereignty', 'data-residency'],
  },
  {
    slug: 'morocco-datacenter-faq',
    title: 'Morocco Datacenter FAQ — Why Morocco for AI Infrastructure',
    category: 'morocco',
    shortDesc: 'Why Morocco for datacenters? Climate, energy, costs, connectivity, regulations. Complete Morocco datacenter FAQ.',
    metaDescription: 'Morocco datacenter FAQ: why Morocco, climate, renewable energy, costs, connectivity, regulations, tax incentives. Strategic location between Europe and Africa.',
    keywords: ['morocco datacenter faq', 'morocco cloud infrastructure', 'casablanca datacenter', 'morocco colocation'],
    faqs: [
      {
        question: 'Why is Morocco a good location for datacenters?',
        answer: 'Morocco offers: (1) Strategic location — 14km from Europe (8ms to Madrid), (2) Excellent renewable energy (solar, wind), (3) Low carbon intensity (47 gCO2/kWh at Harch Corp), (4) Competitive power costs ($0.08-0.12/kWh), (5) Cool climate (5,000+ free cooling hours), (6) Political stability, (7) Data sovereignty (Law 09-08), (8) CFC tax benefits.',
      },
      {
        question: 'What is the latency from Morocco to Europe?',
        answer: 'Morocco to Europe latency: (1) Tangier to Madrid: 8ms, (2) Casablanca to Paris: 20ms, (3) Casablanca to London: 25ms, (4) Casablanca to Frankfurt: 30ms. Morocco is connected to Europe via multiple submarine cables: AAE-1, MAROC Telecom, Mendall, and others.',
      },
      {
        question: 'What data protection laws apply in Morocco?',
        answer: 'Morocco\'s data protection law is Law 09-08 (2009), inspired by GDPR. Key requirements: (1) Consent for data processing, (2) Purpose limitation, (3) Data minimization, (4) Security measures, (5) Data subject rights (access, rectification, opposition), (6) Cross-border transfer restrictions. Enforced by CNDP (Commission Nationale de Contrôle de la Protection des Données).',
      },
      {
        question: 'What renewable energy does Morocco have for datacenters?',
        answer: 'Morocco\'s renewable energy: (1) Noor Ouarzazate — 580MW solar (CSP+PV), (2) Tarfaya — 300MW wind, (3) Akhfennir — 200MW wind, (4) Noor Midelt — 800MW hybrid. Total renewable capacity: 4.5GW (2024), target 10GW by 2030. Harch Corp uses 100% renewable PPAs, achieving 47 gCO2/kWh carbon intensity.',
      },
      {
        question: 'What tax incentives are available for datacenters in Morocco?',
        answer: 'Morocco tax incentives: (1) Casablanca Finance City (CFC) — 15% IS for first 5 years (vs 31%), (2) Free zones (Tanger, Dakhla) — tax exemptions, (3) MOWAKABA — 90% digitalization subsidy (up to 400K MAD), (4) Innov Invest — 500K MAD prêts d\'honneur, (5) Intelika — 1.2M MAD loans at 2%. Harch Corp leverages these for competitive pricing.',
      },
      {
        question: 'How much does electricity cost in Morocco?',
        answer: 'Morocco industrial electricity prices: (1) Standard: $0.12/kWh, (2) High-voltage (datacenter): $0.08-0.10/kWh, (3) Renewable PPA: $0.04-0.06/kWh. Morocco electricity is 30-40% cheaper than Western Europe ($0.15-0.25/kWh) and competitive with Eastern Europe. Harch Corp uses renewable PPAs at $0.05/kWh.',
      },
      {
        question: 'What is the climate like in Morocco for datacenters?',
        answer: 'Morocco climate advantages: (1) Mediterranean/Atlantic coast — temperate, 18-25°C average, (2) 5,000+ free cooling hours/year (when outside temp < 24°C), (3) Low humidity in interior (good for evaporative cooling), (4) Dakhla — cool Atlantic breeze year-round (excellent for free cooling), (5) Atlas Mountains — high altitude = cooler.',
      },
      {
        question: 'What submarine cables connect Morocco to the world?',
        answer: 'Morocco submarine cables: (1) AAE-1 (Asia-Africa-Europe-1) — connects Asia, Africa, Europe, (2) MAROC Telecom cable — Spain-France, (3) Mendall — Marseille to Morocco, (4) Atlas Offshore — Morocco to Portugal, (5) I-ME-WE — India-Middle East-Western Europe. Total: 8+ submarine cable systems provide excellent international connectivity.',
      },
      {
        question: 'Is Morocco politically stable for datacenter investment?',
        answer: 'Yes. Morocco is one of Africa\'s most politically stable countries: (1) Constitutional monarchy since 1956, (2) Peaceful transitions of power, (3) Pro-business government, (4) Strong rule of law, (5) Free trade agreements with EU, US, Turkey, UAE, (6) Investment-grade sovereign rating (BB+ by S&P). Morocco ranks 53rd on World Bank Ease of Doing Business.',
      },
      {
        question: 'What is the datacenter talent pool like in Morocco?',
        answer: 'Morocco has a growing tech talent pool: (1) 12+ universities with computer science programs, (2) 1337 coding school (free, no prerequisites), (3) YouCode — intensive developer training, (4) ENSIAS — top engineering school, (5) UM6P — research university, (6) Multilingual workforce (FR/EN/AR), (7) 50,000+ STEM graduates/year. Harch Corp employs 100+ Moroccan engineers.',
      },
    ],
    relatedGlossary: ['morocco-tech', 'casablanca-finance-city', 'noor-ouarzazate', 'law-09-08', 'africa-datacenter'],
  },
  {
    slug: 'carbon-aware-computing-faq',
    title: 'Carbon-Aware Computing FAQ — Green AI Explained',
    category: 'energy',
    shortDesc: 'Carbon-aware computing FAQ: what it is, how it works, benefits, implementation. Reduce AI carbon footprint 30-60%.',
    metaDescription: 'Carbon-aware computing FAQ: definition, workload scheduling, renewable energy, PUE, carbon intensity. How Harch Corp achieves 47 gCO2/kWh.',
    keywords: ['carbon aware computing faq', 'green ai', 'carbon aware gpu', 'sustainable datacenter', 'green computing'],
    faqs: [
      {
        question: 'What is carbon-aware computing?',
        answer: 'Carbon-aware computing optimizes workload scheduling based on the carbon intensity of the electricity grid. By running GPU-intensive workloads when renewable energy is abundant (e.g., during peak solar hours), carbon-aware platforms can reduce the carbon footprint of AI training by 30-60%. Harch Corp is a pioneer in carbon-aware GPU cloud.',
      },
      {
        question: 'How does carbon-aware workload scheduling work?',
        answer: 'Carbon-aware scheduling: (1) Monitor real-time carbon intensity of electricity grid, (2) Predict renewable energy availability (solar peaks midday, wind varies), (3) Schedule flexible workloads (batch training) for low-carbon periods, (4) Pause or migrate workloads during high-carbon periods, (5) Report carbon savings to users. Harch Corp\'s scheduler reduces carbon by 40% on average.',
      },
      {
        question: 'What is carbon intensity and how is it measured?',
        answer: 'Carbon intensity measures CO2 emissions per unit of electricity: gCO2/kWh (grams CO2 per kilowatt-hour). Global average: ~475 gCO2/kWh. Examples: Norway (30, hydro), France (85, nuclear), Morocco (350, mixed), Harch Corp (47, renewable PPAs), Poland (700, coal), UAE (500, gas). Lower = cleaner.',
      },
      {
        question: 'How much carbon does AI training produce?',
        answer: 'AI training carbon footprint: (1) GPT-3 training: ~552 tonnes CO2 (equivalent to 120 cars/year), (2) GPT-4 training: ~5,000+ tonnes CO2 (estimated), (3) LLaMA 2 70B: ~150 tonnes CO2, (4) Fine-tuning 7B model: ~0.1 tonnes CO2. Carbon-aware computing can reduce these by 30-60%. Harch Corp\'s 47 gCO2/kWh is 7-10x lower than typical cloud providers.',
      },
      {
        question: 'What is the difference between carbon-free and carbon-neutral?',
        answer: 'Carbon-free = directly powered by renewables (solar, wind, hydro) with zero emissions at source. Carbon-neutral = net zero emissions, achieved through offsets (buying carbon credits) but actual operations may emit CO2. Harch Corp is carbon-free (100% renewable PPAs), not just carbon-neutral (no offsets needed).',
      },
      {
        question: 'How can I reduce my AI carbon footprint?',
        answer: 'Reduce AI carbon: (1) Use carbon-aware cloud providers (Harch Corp), (2) Schedule training during low-carbon hours, (3) Use efficient models (smaller, distilled, quantized), (4) Use mixed precision (FP16, FP8), (5) Avoid redundant experiments, (6) Use spot instances (uses spare capacity), (7) Choose datacenters in low-carbon regions.',
      },
      {
        question: 'What is PUE and how does it affect carbon footprint?',
        answer: 'PUE (Power Usage Effectiveness) = Total facility power / IT equipment power. PUE 1.0 means all power goes to IT (impossible). Average PUE: 1.55. Best-in-class: 1.10-1.20. Harch Corp: 1.08-1.24. Lower PUE = less wasted energy = lower carbon footprint. A datacenter with PUE 2.0 uses 2x more total power than its IT equipment needs.',
      },
      {
        question: 'What are the best renewable energy sources for datacenters?',
        answer: 'Best renewables for datacenters: (1) Solar — predictable, scalable, daytime only (needs storage), (2) Wind — higher capacity factor, complements solar, (3) Hydro — 24/7 baseload, but geographically limited, (4) Geothermal — 24/7, location-specific. Best strategy: solar + wind + battery storage for 24/7 renewable. Harch Corp uses solar + wind PPAs.',
      },
      {
        question: 'Do carbon-aware datacenters cost more?',
        answer: 'Not necessarily. Renewable energy is now cheaper than fossil fuels in most markets: (1) Solar LCOE: $0.03-0.06/kWh, (2) Wind LCOE: $0.03-0.07/kWh, (3) Natural gas: $0.05-0.10/kWh, (4) Coal: $0.05-0.08/kWh. Harch Corp\'s renewable-powered datacenters are 20-30% cheaper to operate than fossil-fueled equivalents, with 10x lower carbon.',
      },
      {
        question: 'What is the Paris Agreement and how does it affect datacenters?',
        answer: 'The Paris Agreement (2015) aims to limit global warming to 1.5°C above pre-industrial levels, requiring net zero emissions by 2050. Datacenters (1% of global electricity) are under pressure to decarbonize. Many countries have net-zero targets: EU (2050), Morocco (2030 for electricity), US (2050). Harch Corp targets net zero by 2030 — 20 years ahead.',
      },
    ],
    relatedGlossary: ['carbon-aware-gpu', 'carbon-intensity', 'pue', 'renewable-energy', 'net-zero'],
  },
  {
    slug: 'ai-training-faq',
    title: 'AI Training FAQ — How to Train Models Efficiently',
    category: 'ai',
    shortDesc: 'AI training FAQ: distributed training, frameworks, costs, time. How to train LLMs, computer vision models, and more.',
    metaDescription: 'AI training FAQ: distributed training, frameworks (PyTorch, Megatron-LM, DeepSpeed), costs, time, optimization. Train models faster and cheaper.',
    keywords: ['ai training faq', 'llm training', 'distributed training', 'model training cost', 'gpu training'],
    faqs: [
      {
        question: 'How long does it take to train a large language model?',
        answer: 'LLM training time (with H100 GPUs): (1) 7B model: 1-2 days on 64 GPUs (~$5K), (2) 13B model: 3-5 days on 128 GPUs (~$20K), (3) 70B model: 2-4 weeks on 256-512 GPUs (~$200K-500K), (4) 175B model: 4-8 weeks on 1,024+ GPUs (~$2M-5M). Time depends on dataset size, sequence length, and hyperparameters.',
      },
      {
        question: 'What is distributed training and why is it needed?',
        answer: 'Distributed training splits model training across multiple GPUs because: (1) Models too large for single GPU (70B model = 140GB+ in FP16), (2) Faster training (8 GPUs = ~8x speedup), (3) Larger batch sizes for stability. Approaches: (1) Data parallelism, (2) Tensor parallelism, (3) Pipeline parallelism. Frameworks: Megatron-LM, DeepSpeed, FSDP.',
      },
      {
        question: 'What is the best framework for distributed LLM training?',
        answer: 'Top distributed training frameworks: (1) Megatron-LM (NVIDIA) — best for very large models, (2) DeepSpeed (Microsoft) — ZeRO optimization, (3) PyTorch FSDP — native PyTorch, (4) Ray Train — distributed scaling, (5) HuggingFace Accelerate — easy to use. For 70B+ models, use Megatron-LM or DeepSpeed. For 7B-13B, FSDP is sufficient.',
      },
      {
        question: 'How much does it cost to train a GPT-4 sized model?',
        answer: 'GPT-4 training cost estimate: $80-100M (OpenAI). Breakdown: (1) ~25,000 A100 GPUs for 90 days, (2) ~$0.8M/day in GPU costs, (3) Plus research, experimentation, failed runs. With H100 GPUs and better efficiency, today it would cost ~$30-50M. Harch Corp can provide the GPU infrastructure for such projects.',
      },
      {
        question: 'What is mixed precision training?',
        answer: 'Mixed precision training uses FP16 or BF16 for forward/backward passes (faster, less memory) while keeping FP32 master weights (accuracy). Benefits: 2x speedup, 50% memory reduction, no accuracy loss. H100 also supports FP8 (8-bit) for 4x speedup with minimal accuracy loss. Enable with `torch.cuda.amp` in PyTorch.',
      },
      {
        question: 'What is gradient checkpointing and when should I use it?',
        answer: 'Gradient checkpointing trades compute for memory: instead of storing all activations for backprop, recompute them when needed. Benefits: 3-5x larger models on same GPU. Cost: 20-30% slower training. Use when GPU memory is the bottleneck (large models, long sequences). Enable with `model.gradient_checkpointing_enable()` in HuggingFace.',
      },
      {
        question: 'How do I choose the right batch size for training?',
        answer: 'Batch size selection: (1) Start with 32-64 per GPU, (2) Increase until GPU memory is 90% full, (3) Use gradient accumulation for effective larger batch, (4) Larger batch = faster but may need learning rate adjustment, (5) For LLMs: 4M tokens global batch size is common. Monitor loss stability — if loss diverges, reduce batch size.',
      },
      {
        question: 'What is learning rate warmup and why is it important?',
        answer: 'Learning rate warmup gradually increases learning rate from 0 to target over first N steps (e.g., 2,000). Benefits: (1) Prevents early training instability, (2) Allows optimizer state to stabilize, (3) Critical for large batch training. Typical: linear warmup over 2K-10K steps, then cosine decay. Use `transformers.get_cosine_schedule_with_warmup`.',
      },
      {
        question: 'How do I prevent overfitting during training?',
        answer: 'Prevent overfitting: (1) Use more training data, (2) Data augmentation (text: back-translation, paraphrasing), (3) Dropout (0.1 for LLMs), (4) Weight decay (0.01-0.1), (5) Early stopping on validation loss, (6) Regularization techniques, (7) Smaller model (if data is limited), (8) Transfer learning (fine-tune pre-trained model).',
      },
      {
        question: 'What is LoRA and when should I use it?',
        answer: 'LoRA (Low-Rank Adaptation) freezes pre-trained weights and trains small adapter layers (rank 8-64). Benefits: (1) 10x less memory (train 7B model on 1 GPU), (2) 5x faster training, (3) Adapters are small (50MB vs 14GB). Use LoRA for: fine-tuning on specific tasks/domains. Use full fine-tuning for: major capability changes. QLoRA = LoRA + 4-bit quantization for even less memory.',
      },
    ],
    relatedGlossary: ['training', 'distributed-training', 'fine-tuning', 'llm', 'transformer'],
  },
];

// Calculators data
export type Calculator = {
  slug: string;
  title: string;
  category: 'cost' | 'performance' | 'sustainability';
  shortDesc: string;
  metaDescription: string;
  keywords: string[];
  type: 'gpu-cost' | 'tco' | 'pue' | 'carbon' | 'training-time' | 'inference-throughput';
};

export const calculators: Calculator[] = [
  {
    slug: 'gpu-cloud-cost-calculator',
    title: 'GPU Cloud Cost Calculator',
    category: 'cost',
    shortDesc: 'Calculate your GPU cloud costs. Compare H100, H200, A100 pricing for training and inference workloads.',
    metaDescription: 'Free GPU cloud cost calculator. Estimate H100, H200, A100 costs for AI training and inference. Compare providers and optimize spending.',
    keywords: ['gpu cost calculator', 'gpu cloud pricing calculator', 'h100 cost calculator', 'ai training cost'],
    type: 'gpu-cost',
  },
  {
    slug: 'gpu-vs-on-premises-tco-calculator',
    title: 'GPU Cloud vs On-Premises TCO Calculator',
    category: 'cost',
    shortDesc: 'Compare 5-year total cost of GPU cloud vs on-premises. Find the right model for your AI workloads.',
    metaDescription: 'TCO calculator: GPU cloud vs on-premises. Compare hardware, power, cooling, staff costs over 5 years. Make informed infrastructure decisions.',
    keywords: ['tco calculator', 'gpu cloud vs on premises', 'infrastructure cost comparison', 'ai infrastructure tco'],
    type: 'tco',
  },
  {
    slug: 'datacenter-pue-calculator',
    title: 'Datacenter PUE Calculator',
    category: 'sustainability',
    shortDesc: 'Calculate your datacenter PUE (Power Usage Effectiveness). Measure efficiency and find optimization opportunities.',
    metaDescription: 'Free PUE calculator. Calculate Power Usage Effectiveness for your datacenter. Compare to industry benchmarks and optimize efficiency.',
    keywords: ['pue calculator', 'power usage effectiveness calculator', 'datacenter efficiency', 'datacenter pue'],
    type: 'pue',
  },
  {
    slug: 'ai-carbon-footprint-calculator',
    title: 'AI Carbon Footprint Calculator',
    category: 'sustainability',
    shortDesc: 'Calculate the carbon footprint of your AI training and inference. Compare providers and reduce emissions.',
    metaDescription: 'Free AI carbon footprint calculator. Estimate CO2 emissions from GPU training and inference. Compare cloud providers and reduce your AI carbon.',
    keywords: ['ai carbon calculator', 'gpu carbon footprint', 'ai emissions calculator', 'carbon footprint ai'],
    type: 'carbon',
  },
  {
    slug: 'llm-training-time-calculator',
    title: 'LLM Training Time Calculator',
    category: 'performance',
    shortDesc: 'Estimate training time for large language models based on GPU count, model size, and dataset.',
    metaDescription: 'Free LLM training time calculator. Estimate how long it takes to train GPT, LLaMA, and other LLMs based on GPUs, model size, and tokens.',
    keywords: ['llm training time calculator', 'ai training time estimator', 'gpu training calculator'],
    type: 'training-time',
  },
  {
    slug: 'llm-inference-throughput-calculator',
    title: 'LLM Inference Throughput Calculator',
    category: 'performance',
    shortDesc: 'Calculate LLM inference throughput (tokens/second) for different GPUs and model sizes.',
    metaDescription: 'Free LLM inference throughput calculator. Estimate tokens/second for GPT, LLaMA on H100, H200, A100. Plan your inference infrastructure.',
    keywords: ['llm inference calculator', 'tokens per second calculator', 'llm throughput', 'inference performance'],
    type: 'inference-throughput',
  },
];
