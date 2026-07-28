'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, HelpCircle, Mail, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

function FaqAccordionItem({ item, isOpen, onToggle, index }: { item: FaqItem; isOpen: boolean; onToggle: () => void; index: number }) {
  const t = useTranslations('faq');

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
  const t = useTranslations('faq');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState(t('categories.all'));

  const faqItems: FaqItem[] = [
    {
      category: t('items.q1.category'),
      question: t('items.q1.question'),
      answer: t('items.q1.answer'),
    },
    {
      category: t('items.q2.category'),
      question: t('items.q2.question'),
      answer: t('items.q2.answer'),
    },
    {
      category: t('items.q3.category'),
      question: t('items.q3.question'),
      answer: t('items.q3.answer'),
    },
    {
      category: t('items.q4.category'),
      question: t('items.q4.question'),
      answer: t('items.q4.answer'),
    },
    {
      category: t('items.q5.category'),
      question: t('items.q5.question'),
      answer: t('items.q5.answer'),
    },
    {
      category: t('items.q6.category'),
      question: t('items.q6.question'),
      answer: t('items.q6.answer'),
    },
    {
      category: t('items.q7.category'),
      question: t('items.q7.question'),
      answer: t('items.q7.answer'),
    },
    {
      category: t('items.q8.category'),
      question: t('items.q8.question'),
      answer: t('items.q8.answer'),
    },
    {
      category: t('items.q9.category'),
      question: t('items.q9.question'),
      answer: t('items.q9.answer'),
    },
  ];

  const categories = [
    t('categories.all'),
    t('categories.company'),
    t('categories.technology'),
    t('categories.investment'),
    t('categories.infrastructure'),
    t('categories.esg'),
  ];

  const filteredItems = activeCategory === t('categories.all')
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
                {t('breadcrumbs.home')}
              </Link>
              <span className="text-[#333333]">/</span>
              <span className="text-[#8B9DAF] font-[family-name:var(--font-space-mono)]">{t('breadcrumbs.faq')}</span>
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
              <p className="section-label text-[#8B9DAF]">{t('hero.label')}</p>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('hero.title')}
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('hero.description')}
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
              {filteredItems.length} {filteredItems.length === 1 ? t('questionSingular') : t('questionPlural')}
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
              <p className="section-label mb-4 text-[#8B9DAF]">{t('contact.label')}</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-4">
                {t('contact.title')}
              </h2>
              <p className="text-[15px] text-[#999999] leading-[1.7] mb-8">
                {t('contact.description')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="px-8 py-3 rounded-lg bg-white text-black text-[12px] font-bold tracking-[0.06em] uppercase hover:bg-[#CCCCCC] transition-colors inline-flex items-center gap-2"
                >
                  {t('contact.cta')} <ArrowRight size={14} />
                </Link>
                <a
                  href="mailto:support@harchcorp.com"
                  className="px-8 py-3 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.25)] text-[#8B9DAF] text-[12px] font-bold tracking-[0.06em] uppercase hover:bg-[rgba(139,157,175,0.15)] hover:border-[rgba(139,157,175,0.4)] transition-colors inline-flex items-center gap-2"
                >
                  <Mail size={14} />
                  support@harchcorp.com
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
