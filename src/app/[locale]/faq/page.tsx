import type { Metadata } from 'next';
import FaqPageClient from './FaqPageClient';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Common questions about Harch Corp — our verticals, investment pipeline, technology, and how to partner with us.',
  alternates: {
    canonical: 'https://www.harchcorp.com/faq',
    languages: {
      en: 'https://www.harchcorp.com/faq',
      fr: 'https://www.harchcorp.com/fr/faq',
      'x-default': 'https://www.harchcorp.com/faq',
    },
  },
  openGraph: {
    title: 'FAQ',
    description: 'Common questions about Harch Corp — our verticals, investment pipeline, technology, and how to partner with us.',
    url: 'https://www.harchcorp.com/faq',
  },
};

// FAQ Schema for Google Rich Results
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Harch Corp?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Harch Corp is a Moroccan multi-sector industrial conglomerate and holding company founded in 2024 in Casablanca. We operate across 7 industrial verticals — AI data centers (Harch Intelligence), renewable energy (Harch Energy), cement manufacturing (Harch Cement), sovereign technology (Harch Technology), strategic mining (Harch Mining), precision agriculture (Harch Agri), and water infrastructure (Harch Water). Our $2.37B investment pipeline makes us one of the most ambitious industrial platforms in Africa, with operations spanning Morocco, Gambia, Senegal, and the broader Sahel region."
      }
    },
    {
      "@type": "Question",
      "name": "What makes Harch Corp different from other African conglomerates?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Three differentiators set Harch Corp apart: First, vertical integration — we control energy, raw materials, and logistics across our verticals, creating 30-50% structural cost advantages versus non-integrated competitors. Second, technology leverage — we apply AI across all operations, from carbon-aware GPU scheduling in data centers to precision agriculture and AI-optimized water distribution. Third, sovereign by design — every asset is built under African ownership, with local compliance and international standards, ensuring that Africa's infrastructure serves Africa's interests."
      }
    },
    {
      "@type": "Question",
      "name": "What is Harch Intelligence and HarchOS?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Harch Intelligence is our AI infrastructure vertical, operating 1,798 carbon-optimized GPUs across 5 hubs in Morocco at 48.2 gCO2/kWh average carbon intensity — 89% below the industry average. HarchOS is our proprietary platform that provides carbon-aware scheduling, routing compute workloads to the greenest hub in real time. This is our #1 differentiator: no competitor offers real-time carbon-aware GPU scheduling. Our 500MW pipeline in Dakhla positions Morocco as the gateway for AI compute between Europe and Africa, with direct submarine cable connectivity providing 8ms latency to European financial centers."
      }
    },
    {
      "@type": "Question",
      "name": "How much is Harch Corp investing and where?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Harch Corp has a $2.37 billion investment pipeline across 7 verticals: Intelligence ($800M for 500MW AI data center capacity), Energy ($600M for 2GW+ renewable pipeline), Technology ($400M for sovereign tech stack), Cement ($200M for 500kT/yr production in Gambia), Mining ($200M for phosphates, cobalt, and rare earths), Agri ($150M for precision agriculture), and Water ($150M for 200M m³/yr desalination). Operations span Morocco (5 GPU hubs, Dakhla hyperscale, energy farms), Gambia (cement plant), and the broader Sahel region."
      }
    },
    {
      "@type": "Question",
      "name": "What is the Dakhla Data Center project?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Dakhla Data Center is Harch Intelligence's flagship project — a 500MW hyperscale AI compute facility in Dakhla, Morocco. Dakhla offers exceptional conditions: wind speeds of 8.5 m/s (top 5% globally), solar irradiance of 2,800 kWh/m²/year, energy costs of $0.018/kWh (72% lower than EU), and direct connection to 3 submarine cable systems providing >80 Tbps capacity and <30ms latency to European financial centers. The facility targets a PUE of 1.10 (vs global average 1.58), with free cooling available ~8,500 hours per year. Phase 1 (100MW) goes live in Q3 2027, scaling to 500MW by Q4 2028."
      }
    },
    {
      "@type": "Question",
      "name": "How does Harch Corp's carbon-aware scheduling work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HarchOS carbon-aware scheduling monitors real-time carbon intensity data from Electricity Maps API across all 5 GPU hubs. When a compute workload is submitted, the scheduler evaluates the current renewable energy mix at each hub and routes the job to the greenest available location. For example, Ouarzazate runs at 97.2% renewable energy (18 gCO2/kWh) while Casablanca runs at 45% (210 gCO2/kWh). The scheduler also supports 24h and 72h carbon intensity forecasting, allowing deferrable workloads to be scheduled during green energy windows. This is the only carbon-aware GPU scheduling system operating in Africa — and one of very few globally."
      }
    },
    {
      "@type": "Question",
      "name": "How can I invest in Harch Corp or partner with the company?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Harch Corp welcomes partnerships across multiple structures: strategic equity investments (we are currently raising from DFIs, sovereign wealth funds, and strategic industrial partners), offtake agreements for cement and energy products, GPU-as-a-Service contracts for AI compute, joint venture structures for specific verticals or geographies, and government partnerships for public infrastructure projects. Contact our team at support@harchcorp.com or visit our Contact page for partnership inquiries."
      }
    },
    {
      "@type": "Question",
      "name": "What is Harch Corp's ESG and sustainability approach?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sustainability is embedded in every Harch Corp operation, not added as an afterthought. Harch Intelligence targets 100% renewable energy by Year 5, with carbon intensity reaching 0.00 tCO2/MWh. Harch Energy produces zero-carbon electricity from solar, wind, and green hydrogen. Harch Cement uses green formulations with clinker factors below 85%, targeting LC3 below 70% by 2029. Harch Water deploys AI-optimized desalination powered by renewable energy. Waste heat from data centers is captured for greenhouse agriculture (10 hectares) and desalination (50,000 m³/day). We target 40% women in tech roles by Year 5 and 70% local employment across all operations."
      }
    },
    {
      "@type": "Question",
      "name": "What is the Harch Cement project in Gambia?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Harch Cement is building a 500,000 T/yr cement grinding station in Gambia — the country's first domestic cement production facility. The project has an IRR of 38.2%, payback period of 2.8 years, and 5-year ROI of 265%. Gambia currently imports 100% of its cement (~640,000 T/yr), and new 500% import duties on bagged cement give local producers a massive competitive advantage. The facility creates 85-120 permanent direct jobs and 200-300 indirect jobs, with 80% Gambian staff target. Total CAPEX is $10.5M, with commercial production starting in Q1 2028."
      }
    },
    {
      "@type": "Question",
      "name": "What is sovereign AI infrastructure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sovereign AI infrastructure refers to AI compute, data storage, and model training capabilities that are owned and operated within a nation's borders, subject to its laws and governance. This means GPUs, data centers, and networking infrastructure are physically located in-country, data never leaves national jurisdiction, and AI models can be trained on local data without foreign access. For Africa, sovereign AI infrastructure is critical because the continent currently hosts less than 1% of global data center capacity, meaning most African data is processed in US or European facilities subject to foreign laws like the US CLOUD Act. Harch Intelligence is building Africa's first sovereign AI GPU cloud across 5 Moroccan hubs with 1,798 GPUs and a 500MW pipeline in Dakhla."
      }
    },
    {
      "@type": "Question",
      "name": "Why is Morocco ideal for data center infrastructure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Morocco offers four strategic advantages for data center infrastructure. First, renewable energy: Morocco's grid is 82.3% renewable, enabling carbon intensity as low as 18 gCO2/kWh at Ouarzazate — 96% below the industry average. Second, connectivity: Morocco is a submarine cable hub with 14+ cable systems (ACE, EIG, SAEx, Med Cable, 2Africa) providing direct links to Europe at 8-14ms latency and to West Africa. Third, climate: Dakhla's coastal location enables free cooling for 8,500+ hours per year, dramatically reducing cooling energy. Fourth, proximity: Morocco is the closest African nation to European markets, with submarine cable latency under 14ms to Madrid and under 30ms to London, making it ideal for serving both African and European AI workloads."
      }
    },
    {
      "@type": "Question",
      "name": "What is carbon-aware computing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Carbon-aware computing is an approach to IT infrastructure that dynamically shifts computational workloads to times and locations where the electrical grid has the lowest carbon intensity. Unlike carbon-neutral strategies that purchase offsets after emissions occur, carbon-aware computing prevents emissions from being generated in the first place. HarchOS implements carbon-aware scheduling across 5 Moroccan GPU hubs by monitoring real-time carbon intensity data from electricityMap and Morocco's grid operator ONEE, then routing workloads to the greenest available hub. This achieves an average carbon intensity of 48.2 gCO2/kWh — 89% lower than the industry average of 450 gCO2/kWh."
      }
    },
    {
      "@type": "Question",
      "name": "How is Morocco addressing water scarcity?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Morocco faces severe water stress with per-capita water availability below 600 cubic meters per year, well below the 1,000 m3 scarcity threshold. The government is investing heavily in desalination, with 15+ plants planned or under construction including the 300M m3/year Casablanca plant and the 150M m3/year Tangier facility. Harch Water deploys AI-optimized reverse osmosis desalination powered by renewable energy, targeting 200M m3/year capacity. The integration of AI reduces energy consumption by 15-23% through real-time membrane monitoring, pressure optimization, and predictive maintenance. Renewable-powered desalination breaks the energy-water cost cycle, making water production economically sustainable."
      }
    },
    {
      "@type": "Question",
      "name": "What is green hydrogen and why is Morocco investing in it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Green hydrogen is hydrogen produced through electrolysis powered by renewable electricity, resulting in zero carbon emissions. Morocco is uniquely positioned for green hydrogen production due to its world-class solar irradiance (2,800+ kWh/m2/year in the south), consistent wind resources (7-9 m/s Atlantic trade winds), and geographic proximity to European markets seeking clean energy imports. The Moroccan government has allocated 1 million hectares for green hydrogen projects and signed agreements with EU nations for hydrogen export. Harch Energy's 2GW+ renewable pipeline includes green hydrogen production capacity, positioning the company at the intersection of energy transition and industrial sovereignty."
      }
    },
    {
      "@type": "Question",
      "name": "What precision agriculture technologies does Harch Agri use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Harch Agri deploys a full-stack precision agriculture system including IoT soil sensors for real-time moisture, pH, and nutrient monitoring; multispectral drone surveys for crop health assessment; AI-driven yield prediction models trained on local African agricultural data; automated irrigation systems that reduce water usage by 30-40%; and vertical farming installations for urban food production. Our Senegal 5,000-hectare precision farming project demonstrates a 35% yield increase while reducing water consumption by 30% and fertilizer usage by 25%. Africa holds 60% of the world's uncultivated arable land yet imports $35 billion in food annually — precision agriculture is the solution to closing this gap."
      }
    },

  ]
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqPageClient />
    </>
  );
}
