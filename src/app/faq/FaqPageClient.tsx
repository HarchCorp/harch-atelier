'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, HelpCircle, Mail, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FaqItem[] = [
  {
    category: 'Company',
    question: 'What is Harch Corp?',
    answer: 'Harch Corp is a Moroccan multi-sector industrial conglomerate and holding company founded in 2024 in Casablanca. We operate across 7 industrial verticals — AI data centers (Harch Intelligence), renewable energy (Harch Energy), cement manufacturing (Harch Cement), sovereign technology (Harch Technology), strategic mining (Harch Mining), precision agriculture (Harch Agri), and water infrastructure (Harch Water). Our $2.37B investment pipeline makes us one of the most ambitious industrial platforms in Africa, with operations spanning Morocco, Gambia, Senegal, and the broader Sahel region.',
  },
  {
    category: 'Company',
    question: 'What makes Harch Corp different from other African conglomerates?',
    answer: 'Three differentiators set Harch Corp apart: First, vertical integration — we control energy, raw materials, and logistics across our verticals, creating 30-50% structural cost advantages versus non-integrated competitors. Second, technology leverage — we apply AI across all operations, from carbon-aware GPU scheduling in data centers to precision agriculture and AI-optimized water distribution. Third, sovereign by design — every asset is built under African ownership, with local compliance and international standards, ensuring that Africa\'s infrastructure serves Africa\'s interests.',
  },
  {
    category: 'Technology',
    question: 'What is Harch Intelligence and HarchOS?',
    answer: 'Harch Intelligence is our AI infrastructure vertical, operating 1,798 carbon-optimized GPUs across 5 hubs in Morocco at 48.2 gCO2/kWh average carbon intensity — 89% below the industry average. HarchOS is our proprietary platform that provides carbon-aware scheduling, routing compute workloads to the greenest hub in real time. This is our #1 differentiator: no competitor offers real-time carbon-aware GPU scheduling. Our 500MW pipeline in Dakhla positions Morocco as the gateway for AI compute between Europe and Africa, with direct submarine cable connectivity providing 8ms latency to European financial centers.',
  },
  {
    category: 'Investment',
    question: 'How much is Harch Corp investing and where?',
    answer: 'Harch Corp has a $2.37 billion investment pipeline across 7 verticals: Intelligence ($800M for 500MW AI data center capacity), Energy ($600M for 2GW+ renewable pipeline), Technology ($400M for sovereign tech stack), Cement ($200M for 500kT/yr production in Gambia), Mining ($200M for phosphates, cobalt, and rare earths), Agri ($150M for precision agriculture), and Water ($150M for 200M m³/yr desalination). Operations span Morocco (5 GPU hubs, Dakhla hyperscale, energy farms), Gambia (cement plant), and the broader Sahel region.',
  },
  {
    category: 'Infrastructure',
    question: 'What is the Dakhla Data Center project?',
    answer: 'The Dakhla Data Center is Harch Intelligence\'s flagship project — a 500MW hyperscale AI compute facility in Dakhla, Morocco. Dakhla offers exceptional conditions: wind speeds of 8.5 m/s (top 5% globally), solar irradiance of 2,800 kWh/m²/year, energy costs of $0.018/kWh (72% lower than EU), and direct connection to 3 submarine cable systems providing >80 Tbps capacity and <30ms latency to European financial centers. The facility targets a PUE of 1.10 (vs global average 1.58), with free cooling available ~8,500 hours per year. Phase 1 (100MW) goes live in Q3 2027, scaling to 500MW by Q4 2028.',
  },
  {
    category: 'Technology',
    question: 'How does Harch Corp\'s carbon-aware scheduling work?',
    answer: 'HarchOS carbon-aware scheduling monitors real-time carbon intensity data from Electricity Maps API across all 5 GPU hubs. When a compute workload is submitted, the scheduler evaluates the current renewable energy mix at each hub and routes the job to the greenest available location. For example, Ouarzazate runs at 97.2% renewable energy (18 gCO2/kWh) while Casablanca runs at 45% (210 gCO2/kWh). The scheduler also supports 24h and 72h carbon intensity forecasting, allowing deferrable workloads to be scheduled during green energy windows. This is the only carbon-aware GPU scheduling system operating in Africa — and one of very few globally.',
  },
  {
    category: 'Investment',
    question: 'How can I invest in Harch Corp or partner with the company?',
    answer: 'Harch Corp welcomes partnerships across multiple structures: strategic equity investments (we are currently raising from DFIs, sovereign wealth funds, and strategic industrial partners), offtake agreements for cement and energy products, GPU-as-a-Service contracts for AI compute, joint venture structures for specific verticals or geographies, and government partnerships for public infrastructure projects. Contact our investor relations team at ir@harchcorp.com or visit our Contact page for partnership inquiries.',
  },
  {
    category: 'ESG',
    question: 'What is Harch Corp\'s ESG and sustainability approach?',
    answer: 'Sustainability is embedded in every Harch Corp operation, not added as an afterthought. Harch Intelligence targets 100% renewable energy by Year 5, with carbon intensity reaching 0.00 tCO2/MWh. Harch Energy produces zero-carbon electricity from solar, wind, and green hydrogen. Harch Cement uses green formulations with clinker factors below 85%, targeting LC3 below 70% by 2029. Harch Water deploys AI-optimized desalination powered by renewable energy. Waste heat from data centers is captured for greenhouse agriculture (10 hectares) and desalination (50,000 m³/day). We target 40% women in tech roles by Year 5 and 70% local employment across all operations.',
  },
  {
    category: 'Infrastructure',
    question: 'What is the Harch Cement project in Gambia?',
    answer: 'Harch Cement is building a 500,000 T/yr cement grinding station in Gambia — the country\'s first domestic cement production facility. The project has an IRR of 38.2%, payback period of 2.8 years, and 5-year ROI of 265%. Gambia currently imports 100% of its cement (~640,000 T/yr), and new 500% import duties on bagged cement give local producers a massive competitive advantage. The facility creates 85-120 permanent direct jobs and 200-300 indirect jobs, with 80% Gambian staff target. Total CAPEX is $10.5M, with commercial production starting in Q1 2028.',
  },
  {
    category: 'Company',
    question: 'What is Harch Research?',
    answer: 'Harch Research is Phase 1 of our Build One At A Time strategy — a free open business analysis library publishing detailed dossiers on opportunities in Morocco and Africa. Each dossier covers market analysis, financial models, public subsidies, ROI calculations, risk assessments, and execution plans. 7 dossiers are currently published (Solaire EPC B2B, MRE Services, Retreat Yoga Essaouira, Conchyliculture Dakhla, Cosmétique Argan+CBD, MRO Industriel, Export Artisanat), with 15+ in production. Visit /research to download them for free.',
  },
  {
    category: 'Company',
    question: 'What does "Building in Public" mean?',
    answer: 'Building in Public means we document every step of our journey transparently — from vision to execution. We publish our research, our analysis, our progress, and our learnings openly. The /launch page is an interactive presentation of our thesis. The /research section contains our analytical work. As each filiale reaches its activation phase, we share updates publicly. This transparency is our competitive advantage — it builds trust with partners, investors, and the communities we serve.',
  },

];

const categories = ['All', 'Company', 'Technology', 'Investment', 'Infrastructure', 'ESG'];

function FaqAccordionItem({ item, isOpen, onToggle, index }: { item: FaqItem; isOpen: boolean; onToggle: () => void; index: number }) {
  return (
    <FadeIn delay={index * 0.04}>
      <div
        className={`card overflow-hidden transition-all duration-300 ${
          isOpen ? 'border-[rgba(139,157,175,0.25)]' : 'hover:border-[rgba(255,255,255,0.12)]'
        }`}
      >
        <button
          onClick={onToggle}
          className="w-full text-left p-6 md:p-8 flex items-start gap-4 group"
          aria-expanded={isOpen}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${
            isOpen
              ? 'bg-[rgba(139,157,175,0.15)] border border-[rgba(139,157,175,0.3)]'
              : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]'
          }`}>
            <span className={`text-[11px] font-bold font-[family-name:var(--font-space-mono)] transition-colors duration-300 ${
              isOpen ? 'text-[#8B9DAF]' : 'text-[#666666]'
            }`}>
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className={`text-[9px] font-bold tracking-[0.2em] uppercase font-[family-name:var(--font-space-mono)] transition-colors duration-300 ${
                isOpen ? 'text-[#8B9DAF]' : 'text-[#555555]'
              }`}>
                {item.category}
              </span>
            </div>
            <h3 className={`text-[15px] md:text-[16px] font-bold transition-colors duration-300 leading-snug ${
              isOpen ? 'text-white' : 'text-[#CCCCCC] group-hover:text-white'
            }`}>
              {item.question}
            </h3>
          </div>
          <div className={`shrink-0 mt-1 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? 'bg-[rgba(139,157,175,0.15)] rotate-180'
              : 'bg-[rgba(255,255,255,0.04)] group-hover:bg-[rgba(255,255,255,0.06)]'
          }`}>
            <ChevronDown
              size={16}
              className={`transition-colors duration-300 ${isOpen ? 'text-[#8B9DAF]' : 'text-[#666666]'}`}
              strokeWidth={1.5}
            />
          </div>
        </button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="px-6 md:px-8 pb-6 md:pb-8 pl-[4.5rem] md:pl-[5.5rem]">
                <div className="w-8 h-px bg-[rgba(139,157,175,0.25)] mb-4" />
                <p className="text-[14px] text-[#999999] leading-[1.8]">
                  {item.answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FadeIn>
  );
}

export default function FaqPageClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = activeCategory === 'All'
    ? faqItems
    : faqItems.filter(item => item.category === activeCategory);

  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══ BREADCRUMBS ═══ */}
      <section className="pt-24 pb-0 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12px]">
              <Link
                href="/"
                className="text-[#666666] hover:text-white transition-colors font-[family-name:var(--font-space-mono)]"
              >
                Home
              </Link>
              <span className="text-[#333333]">/</span>
              <span className="text-[#8B9DAF] font-[family-name:var(--font-space-mono)]">FAQ</span>
            </nav>
          </FadeIn>
        </div>
      </section>

      {/* ═══ HERO ═══ */}
      <section className="pt-12 pb-20 md:pt-16 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle size={18} className="text-[#8B9DAF]" strokeWidth={1.5} />
              <p className="section-label text-[#8B9DAF]">Frequently Asked Questions</p>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Answers to the<br />Questions That Matter
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Common questions about Harch Corp — our verticals, investment pipeline, technology, and how to partner with us. Can&apos;t find what you&apos;re looking for? Reach out directly.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CATEGORY FILTER ═══ */}
      <section className="py-6 bg-[#121212] border-y border-[rgba(255,255,255,0.04)] sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => { setActiveCategory(category); setOpenIndex(0); }}
                className={`px-4 py-1.5 rounded-md text-[11px] font-bold tracking-[0.08em] uppercase transition-all duration-300 shrink-0 font-[family-name:var(--font-space-mono)] ${
                  activeCategory === category
                    ? 'bg-[rgba(139,157,175,0.15)] text-[#8B9DAF] border border-[rgba(139,157,175,0.3)]'
                    : 'bg-[rgba(255,255,255,0.04)] text-[#999999] hover:bg-[rgba(255,255,255,0.08)] hover:text-white border border-transparent'
                }`}
              >
                {category}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-[#555555] font-[family-name:var(--font-space-mono)] shrink-0 pl-4">
              {filteredItems.length} {filteredItems.length === 1 ? 'question' : 'questions'}
            </span>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ITEMS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <div className="space-y-4">
            {filteredItems.map((item, i) => (
              <FaqAccordionItem
                key={item.question}
                item={item}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STILL HAVE QUESTIONS CTA ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="max-w-2xl mx-auto text-center">
              <MessageSquare size={32} className="text-[#8B9DAF] mx-auto mb-6" strokeWidth={1.5} />
              <p className="section-label mb-4 text-[#8B9DAF]">Request a Briefing</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-4">
                Still Have Questions?
              </h2>
              <p className="text-[15px] text-[#999999] leading-[1.7] mb-8">
                Our team is ready to answer any questions about our verticals, investment opportunities, technology stack, or partnership structures. No question is too detailed.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="px-8 py-3 rounded-lg bg-white text-black text-[12px] font-bold tracking-[0.06em] uppercase hover:bg-[#CCCCCC] transition-colors inline-flex items-center gap-2"
                >
                  Request Briefing <ArrowRight size={14} />
                </Link>
                <a
                  href="mailto:ir@harchcorp.com"
                  className="px-8 py-3 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.25)] text-[#8B9DAF] text-[12px] font-bold tracking-[0.06em] uppercase hover:bg-[rgba(139,157,175,0.15)] hover:border-[rgba(139,157,175,0.4)] transition-colors inline-flex items-center gap-2"
                >
                  <Mail size={14} />
                  ir@harchcorp.com
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
