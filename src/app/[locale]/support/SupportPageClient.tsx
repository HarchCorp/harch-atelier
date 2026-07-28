'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FadeIn } from '@/components/ui/motion';
import {
  ArrowRight,
  MessageSquare,
  BookOpen,
  Activity,
  Phone,
  Mail,
  FileText,
  Shield,
  Code,
  CreditCard,
  Lock,
  HelpCircle,
  Users,
  CheckCircle2,
  Clock,
  Headphones,
  Star,
  ChevronRight,
  AlertCircle,
  Paperclip,
  Send,
  ExternalLink,
  Zap,
  HeartHandshake,
} from 'lucide-react';

export default function SupportPageClient() {
  const t = useTranslations('support');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPriority, setTicketPriority] = useState(t('ticketSystem.priorities.medium'));
  const [ticketDescription, setTicketDescription] = useState('');

  const supportTiers = [
    {
      name: t('tiers.community.name'),
      price: t('tiers.community.price'),
      priceNote: t('tiers.community.priceNote'),
      description: t('tiers.community.description'),
      features: [
        { label: t('tiers.community.features.0'), included: true },
        { label: t('tiers.community.features.1'), included: true },
        { label: t('tiers.community.features.2'), included: true },
        { label: t('tiers.community.features.3'), included: true },
        { label: t('tiers.community.features.4'), included: false },
        { label: t('tiers.community.features.5'), included: false },
        { label: t('tiers.community.features.6'), included: false },
      ],
      cta: t('tiers.community.cta'),
      highlight: false,
    },
    {
      name: t('tiers.professional.name'),
      price: t('tiers.professional.price'),
      priceNote: t('tiers.professional.priceNote'),
      description: t('tiers.professional.description'),
      features: [
        { label: t('tiers.professional.features.0'), included: true },
        { label: t('tiers.professional.features.1'), included: true },
        { label: t('tiers.professional.features.2'), included: true },
        { label: t('tiers.professional.features.3'), included: true },
        { label: t('tiers.professional.features.4'), included: true },
        { label: t('tiers.professional.features.5'), included: false },
        { label: t('tiers.professional.features.6'), included: false },
      ],
      cta: t('tiers.professional.cta'),
      highlight: true,
    },
    {
      name: t('tiers.enterprise.name'),
      price: t('tiers.enterprise.price'),
      priceNote: t('tiers.enterprise.priceNote'),
      description: t('tiers.enterprise.description'),
      features: [
        { label: t('tiers.enterprise.features.0'), included: true },
        { label: t('tiers.enterprise.features.1'), included: true },
        { label: t('tiers.enterprise.features.2'), included: true },
        { label: t('tiers.enterprise.features.3'), included: true },
        { label: t('tiers.enterprise.features.4'), included: true },
        { label: t('tiers.enterprise.features.5'), included: true },
        { label: t('tiers.enterprise.features.6'), included: true },
      ],
      cta: t('tiers.enterprise.cta'),
      highlight: false,
    },
  ];

  const quickActions = [
    { icon: MessageSquare, title: t('quickActions.0.title'), desc: t('quickActions.0.desc'), href: '#submit-ticket' },
    { icon: BookOpen, title: t('quickActions.1.title'), desc: t('quickActions.1.desc'), href: '#knowledge-base' },
    { icon: Activity, title: t('quickActions.2.title'), desc: t('quickActions.2.desc'), href: '/status' },
    { icon: Phone, title: t('quickActions.3.title'), desc: t('quickActions.3.desc'), href: '/contact' },
  ];

  const knowledgeCategories = [
    { icon: HelpCircle, title: t('knowledgeCategories.0.title'), articles: 47, desc: t('knowledgeCategories.0.desc') },
    { icon: Users, title: t('knowledgeCategories.1.title'), articles: 32, desc: t('knowledgeCategories.1.desc') },
    { icon: AlertCircle, title: t('knowledgeCategories.2.title'), articles: 89, desc: t('knowledgeCategories.2.desc') },
    { icon: CreditCard, title: t('knowledgeCategories.3.title'), articles: 24, desc: t('knowledgeCategories.3.desc') },
    { icon: Shield, title: t('knowledgeCategories.4.title'), articles: 38, desc: t('knowledgeCategories.4.desc') },
    { icon: Code, title: t('knowledgeCategories.5.title'), articles: 63, desc: t('knowledgeCategories.5.desc') },
  ];

  const successItems = [
    { icon: Headphones, label: t('customerSuccess.items.0.label'), desc: t('customerSuccess.items.0.desc') },
    { icon: Zap, label: t('customerSuccess.items.1.label'), desc: t('customerSuccess.items.1.desc') },
    { icon: FileText, label: t('customerSuccess.items.2.label'), desc: t('customerSuccess.items.2.desc') },
    { icon: HeartHandshake, label: t('customerSuccess.items.3.label'), desc: t('customerSuccess.items.3.desc') },
  ];

  return (
    <div className="bg-[#121212]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('hero.label')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('hero.title')}
            </h1>
            <div className="accent-line mb-6" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('hero.description')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SUPPORT TIERS ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('tiers.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('tiers.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('tiers.description')}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportTiers.map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 0.1}>
                <div className={`card p-8 h-full flex flex-col ${tier.highlight ? 'border-white/20' : ''}`}>
                  {tier.highlight && (
                    <div className="flex items-center gap-2 mb-6">
                      <Star size={12} className="text-white" fill="currentColor" />
                      <span className="text-[11px] font-bold text-white tracking-wider uppercase">{t('tiers.mostPopular')}</span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-1">{tier.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="stat-mono text-3xl font-bold text-white">{tier.price}</span>
                      {tier.priceNote && <span className="text-[14px] text-[#666666]">{tier.priceNote}</span>}
                    </div>
                  </div>
                  <p className="text-[13px] text-[#999999] leading-relaxed mb-8">{tier.description}</p>
                  <div className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <div key={feature.label} className="flex items-center gap-3">
                        <CheckCircle2 size={14} className={feature.included ? 'text-white/60' : 'text-white/15'} strokeWidth={1.5} />
                        <span className={`text-[13px] ${feature.included ? 'text-[#999999]' : 'text-[#444444]'}`}>{feature.label}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={tier.name === t('tiers.community.name') ? '/docs' : '/contact'}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                      tier.highlight
                        ? 'bg-white text-black hover:bg-white/90'
                        : 'border border-[rgba(255,255,255,0.12)] text-white hover:border-white/25 hover:bg-white/[0.03]'
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ QUICK ACTIONS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('quickActions.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              {t('quickActions.title')}
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, i) => (
              <FadeIn key={action.title} delay={i * 0.08}>
                <Link href={action.href} className="card p-6 h-full block hover:border-[rgba(255,255,255,0.15)] group">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
                    <action.icon size={20} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[15px] font-bold text-white mb-2 group-hover:text-white">{action.title}</h3>
                  <p className="text-[12px] text-[#666666] leading-relaxed">{action.desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-[12px] text-[#666666] group-hover:text-white transition-colors">
                    <span>{t('quickActions.go')}</span>
                    <ChevronRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ KNOWLEDGE BASE ═══ */}
      <section id="knowledge-base" className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('knowledgeBase.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('knowledgeBase.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('knowledgeBase.description')}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {knowledgeCategories.map((category, i) => (
              <FadeIn key={category.title} delay={i * 0.06}>
                <div className="card p-6 h-full cursor-pointer hover:border-[rgba(255,255,255,0.15)] group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                      <category.icon size={18} className="text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[15px] font-bold text-white">{category.title}</h3>
                    </div>
                    <span className="stat-mono text-[12px] text-[#666666]">{category.articles} {t('knowledgeBase.articles')}</span>
                  </div>
                  <p className="text-[12px] text-[#666666] leading-relaxed">{category.desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-[12px] text-[#666666] group-hover:text-white transition-colors">
                    <span>{t('knowledgeBase.browseArticles')}</span>
                    <ChevronRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SUBMIT A TICKET ═══ */}
      <section id="submit-ticket" className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('ticketSystem.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('ticketSystem.createTicket')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('ticketSystem.description')}
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="card p-8 md:p-10 max-w-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">{t('ticketSystem.subject')}</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder={t('ticketSystem.subjectPlaceholder')}
                    className="w-full bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[#444444] focus:border-white/20 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">{t('ticketSystem.priority')}</label>
                  <div className="flex gap-3">
                    {[t('ticketSystem.priorities.low'), t('ticketSystem.priorities.medium'), t('ticketSystem.priorities.high'), t('ticketSystem.priorities.critical')].map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setTicketPriority(priority)}
                        className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-all ${
                          ticketPriority === priority
                            ? 'bg-white text-black'
                            : 'border border-[rgba(255,255,255,0.08)] text-[#999999] hover:border-white/15 hover:text-white'
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">{t('ticketSystem.descriptionLabel')}</label>
                  <textarea
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    placeholder={t('ticketSystem.descriptionPlaceholder')}
                    rows={6}
                    className="w-full bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[#444444] focus:border-white/20 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">{t('ticketSystem.attachmentLabel')}</label>
                  <div className="border border-dashed border-[rgba(255,255,255,0.12)] rounded-lg p-8 text-center hover:border-white/20 transition-colors cursor-pointer">
                    <Paperclip size={20} className="text-[#444444] mx-auto mb-2" />
                    <p className="text-[13px] text-[#666666]">{t('ticketSystem.attachmentDropText')}</p>
                    <p className="text-[11px] text-[#444444] mt-1">{t('ticketSystem.attachmentHint')}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all">
                    <Send size={14} />
                    {t('ticketSystem.submitTicket')}
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CUSTOMER SUCCESS ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('customerSuccess.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('customerSuccess.title')}
            </h2>
            <div className="accent-line mb-6" />
          </FadeIn>
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="lg:w-1/2">
              <FadeIn delay={0.05}>
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">
                  {t('customerSuccess.description1')}
                </p>
                <p className="text-[15px] text-[#999999] leading-[1.7]">
                  {t('customerSuccess.description2')}
                </p>
              </FadeIn>
            </div>
            <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {successItems.map((item, i) => (
                <FadeIn key={item.label} delay={i * 0.08}>
                  <div className="card p-6 h-full">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
                      <item.icon size={18} className="text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[14px] font-bold text-white mb-1">{item.label}</h3>
                    <p className="text-[12px] text-[#666666] leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SYSTEM STATUS LINK ═══ */}
      <section className="py-20 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <Link href="/status" className="card p-6 flex items-center justify-between group hover:border-[rgba(255,255,255,0.15)]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00FF88]" style={{ boxShadow: '0 0 6px rgba(0,255,136,0.5)' }} />
                  <span className="text-[14px] font-semibold text-white">{t('systemStatus.allOperational')}</span>
                </div>
                <span className="text-[12px] text-[#666666]">{t('systemStatus.uptimeText')}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#666666] group-hover:text-white transition-colors">
                <span>{t('systemStatus.viewStatusPage')}</span>
                <ExternalLink size={12} />
              </div>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden border-t border-[rgba(255,255,255,0.06)]">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">
              {t('cta.title')}
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              {t('cta.description')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all"
              >
                {t('cta.contactSupport')} <ArrowRight size={14} />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all"
              >
                {t('cta.browseDocumentation')} <BookOpen size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
