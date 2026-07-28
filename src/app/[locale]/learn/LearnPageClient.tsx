'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Award,
  Monitor,
  Code,
  Server,
  Shield,
  Database,
  GraduationCap,
  Building2,
  Users,
  Play,
  FileCheck,
  Cpu,
  Cloud,
  Clock,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

export default function LearnPageClient() {
  const t = useTranslations('learn');

  const learningPaths = [
    {
      icon: Cpu,
      title: t('paths.items.0.title'),
      level: t('paths.items.0.level'),
      hours: t('paths.items.0.hours'),
      price: t('paths.items.0.price'),
      description: t('paths.items.0.description'),
      topics: [t('paths.items.0.topics.0'), t('paths.items.0.topics.1'), t('paths.items.0.topics.2'), t('paths.items.0.topics.3'), t('paths.items.0.topics.4')],
      color: 'rgba(139, 157, 175, 0.7)',
    },
    {
      icon: Server,
      title: t('paths.items.1.title'),
      level: t('paths.items.1.level'),
      hours: t('paths.items.1.hours'),
      price: t('paths.items.1.price'),
      description: t('paths.items.1.description'),
      topics: [t('paths.items.1.topics.0'), t('paths.items.1.topics.1'), t('paths.items.1.topics.2'), t('paths.items.1.topics.3'), t('paths.items.1.topics.4')],
      color: 'rgba(0, 255, 136, 0.7)',
    },
    {
      icon: Cloud,
      title: t('paths.items.2.title'),
      level: t('paths.items.2.level'),
      hours: t('paths.items.2.hours'),
      price: t('paths.items.2.price'),
      description: t('paths.items.2.description'),
      topics: [t('paths.items.2.topics.0'), t('paths.items.2.topics.1'), t('paths.items.2.topics.2'), t('paths.items.2.topics.3'), t('paths.items.2.topics.4')],
      color: 'rgba(255, 200, 0, 0.7)',
    },
    {
      icon: Shield,
      title: t('paths.items.3.title'),
      level: t('paths.items.3.level'),
      hours: t('paths.items.3.hours'),
      price: t('paths.items.3.price'),
      description: t('paths.items.3.description'),
      topics: [t('paths.items.3.topics.0'), t('paths.items.3.topics.1'), t('paths.items.3.topics.2'), t('paths.items.3.topics.3'), t('paths.items.3.topics.4')],
      color: 'rgba(255, 100, 100, 0.7)',
    },
  ];

  const certifications = [
    {
      icon: Code,
      title: t('certifications.items.0.title'),
      price: t('certifications.items.0.price'),
      description: t('certifications.items.0.description'),
      format: t('certifications.items.0.format'),
      duration: t('certifications.items.0.duration'),
      prerequisites: t('certifications.items.0.prerequisites'),
    },
    {
      icon: Cloud,
      title: t('certifications.items.1.title'),
      price: t('certifications.items.1.price'),
      description: t('certifications.items.1.description'),
      format: t('certifications.items.1.format'),
      duration: t('certifications.items.1.duration'),
      prerequisites: t('certifications.items.1.prerequisites'),
    },
    {
      icon: Shield,
      title: t('certifications.items.2.title'),
      price: t('certifications.items.2.price'),
      description: t('certifications.items.2.description'),
      format: t('certifications.items.2.format'),
      duration: t('certifications.items.2.duration'),
      prerequisites: t('certifications.items.2.prerequisites'),
    },
    {
      icon: Database,
      title: t('certifications.items.3.title'),
      price: t('certifications.items.3.price'),
      description: t('certifications.items.3.description'),
      format: t('certifications.items.3.format'),
      duration: t('certifications.items.3.duration'),
      prerequisites: t('certifications.items.3.prerequisites'),
    },
  ];

  const freeResources = [
    {
      icon: BookOpen,
      title: t('freeResources.items.0.title'),
      description: t('freeResources.items.0.description'),
      count: t('freeResources.items.0.count'),
    },
    {
      icon: Monitor,
      title: t('freeResources.items.1.title'),
      description: t('freeResources.items.1.description'),
      count: t('freeResources.items.1.count'),
    },
    {
      icon: Play,
      title: t('freeResources.items.2.title'),
      description: t('freeResources.items.2.description'),
      count: t('freeResources.items.2.count'),
    },
  ];

  const universityBenefits = [
    { title: t('university.benefits.0.title'), desc: t('university.benefits.0.desc') },
    { title: t('university.benefits.1.title'), desc: t('university.benefits.1.desc') },
    { title: t('university.benefits.2.title'), desc: t('university.benefits.2.desc') },
    { title: t('university.benefits.3.title'), desc: t('university.benefits.3.desc') },
  ];

  const universityStats = [
    { label: t('university.stats.0.label'), value: t('university.stats.0.value') },
    { label: t('university.stats.1.label'), value: t('university.stats.1.value') },
    { label: t('university.stats.2.label'), value: t('university.stats.2.value') },
    { label: t('university.stats.3.label'), value: t('university.stats.3.value') },
  ];

  const corporateTraining = [
    {
      icon: Users,
      title: t('corporate.items.0.title'),
      description: t('corporate.items.0.description'),
      detail: t('corporate.items.0.detail'),
    },
    {
      icon: Building2,
      title: t('corporate.items.1.title'),
      description: t('corporate.items.1.description'),
      detail: t('corporate.items.1.detail'),
    },
    {
      icon: FileCheck,
      title: t('corporate.items.2.title'),
      description: t('corporate.items.2.description'),
      detail: t('corporate.items.2.detail'),
    },
  ];

  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('hero.label')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('hero.title')}
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('hero.description')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-start gap-4 mt-8">
              <Link href="#learning-paths" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                {t('hero.ctaPrimary')} <ArrowRight size={14} />
              </Link>
              <Link href="#certifications" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Learning Paths */}
      <section id="learning-paths" className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('paths.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('paths.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('paths.description')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningPaths.map((path, i) => (
              <FadeIn key={path.title} delay={i * 0.08}>
                <div className="card p-8 h-full group">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                      <path.icon size={22} style={{ color: path.color }} strokeWidth={1.5} />
                    </div>
                    <span className="px-3 py-1 rounded-md bg-[rgba(255,255,255,0.04)] text-[10px] font-semibold text-[#999999] tracking-wide uppercase">
                      {path.level}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{path.title}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-5">{path.description}</p>
                  <div className="flex items-center gap-4 mb-5 text-[12px]">
                    <span className="flex items-center gap-1.5 text-[#999999]">
                      <Clock size={12} /> {path.hours} {t('paths.hoursLabel')}
                    </span>
                    <span className="flex items-center gap-1.5 text-[#999999]">
                      <DollarSign size={12} /> {path.price}
                    </span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-5">
                    <p className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider mb-3">{t('paths.whatYouWillLearn')}</p>
                    <ul className="space-y-2">
                      {path.topics.map((topic) => (
                        <li key={topic} className="flex items-start gap-2 text-[13px] text-[#999999]">
                          <CheckCircle size={12} className="mt-0.5 shrink-0 text-white/30" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section id="certifications" className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('certifications.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('certifications.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('certifications.description')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications.map((cert, i) => (
              <FadeIn key={cert.title} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full bg-[rgba(255,255,255,0.04)] border border-white/[0.08] flex items-center justify-center shrink-0">
                      <Award size={22} className="text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{cert.title}</h3>
                      <p className="text-[13px] text-[#999999] leading-[1.6]">{cert.description}</p>
                    </div>
                  </div>
                  <div className="border-t border-white/[0.06] pt-5 space-y-3">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#666666]">{t('certifications.examPrice')}</span>
                      <span className="text-white font-semibold">{cert.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#666666]">{t('certifications.formatLabel')}</span>
                      <span className="text-[#999999]">{cert.format}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#666666]">{t('certifications.durationLabel')}</span>
                      <span className="text-[#999999]">{cert.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#666666]">{t('certifications.prerequisitesLabel')}</span>
                      <span className="text-[#999999]">{cert.prerequisites}</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Free Training Resources */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('freeResources.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('freeResources.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('freeResources.description')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {freeResources.map((resource, i) => (
              <FadeIn key={resource.title} delay={i * 0.1}>
                <div className="card p-8 h-full text-center">
                  <div className="w-14 h-14 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mx-auto mb-5">
                    <resource.icon size={24} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{resource.title}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-4">{resource.description}</p>
                  <span className="inline-block px-4 py-1.5 rounded-full bg-[rgba(255,255,255,0.04)] text-[11px] font-semibold text-white tracking-wide">
                    {resource.count}
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* For Universities */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="section-label mb-4">{t('university.label')}</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-6">
                {t('university.title')}
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[16px] text-[#999999] leading-[1.7] mb-8">
                {t('university.description')}
              </p>
              <div className="space-y-5">
                {universityBenefits.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-white/50 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[14px] font-semibold text-white">{item.title}</p>
                      <p className="text-[13px] text-[#999999] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <GraduationCap size={24} className="text-white" strokeWidth={1.5} />
                  <h3 className="text-lg font-bold text-white">{t('university.partnershipTitle')}</h3>
                </div>
                <div className="space-y-4">
                  {universityStats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                      <span className="text-[13px] text-[#999999]">{stat.label}</span>
                      <span className="text-[14px] font-bold text-white stat-mono">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <p className="text-[12px] text-[#666666]">
                    {t('university.eligibilityNote')}
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Corporate Training */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('corporate.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('corporate.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              {t('corporate.description')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {corporateTraining.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="card p-8 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
                    <item.icon size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-4">{item.description}</p>
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">{item.detail}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
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
              <Link href="#learning-paths" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                {t('cta.ctaPrimary')} <ArrowRight size={14} />
              </Link>
              <Link href="#certifications" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('cta.ctaSecondary')}
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
