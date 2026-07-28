'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Cpu, Landmark, Building, Globe, Handshake, Puzzle, Users, Globe2, TrendingUp, Cpu as TechTransfer, Leaf, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

export default function PartnersPageClient() {
  const t = useTranslations('partners');

  const partnerCategories = [
    {
      icon: Cpu,
      title: t('categories.technology.title'),
      description: t('categories.technology.description'),
      partners: [
        t('categories.technology.partners.0'),
        t('categories.technology.partners.1'),
        t('categories.technology.partners.2'),
        t('categories.technology.partners.3'),
        t('categories.technology.partners.4'),
      ],
    },
    {
      icon: Landmark,
      title: t('categories.financial.title'),
      description: t('categories.financial.description'),
      partners: [
        t('categories.financial.partners.0'),
        t('categories.financial.partners.1'),
        t('categories.financial.partners.2'),
        t('categories.financial.partners.3'),
        t('categories.financial.partners.4'),
      ],
    },
    {
      icon: Building,
      title: t('categories.industrial.title'),
      description: t('categories.industrial.description'),
      partners: [
        t('categories.industrial.partners.0'),
        t('categories.industrial.partners.1'),
        t('categories.industrial.partners.2'),
        t('categories.industrial.partners.3'),
        t('categories.industrial.partners.4'),
      ],
    },
    {
      icon: Globe,
      title: t('categories.government.title'),
      description: t('categories.government.description'),
      partners: [
        t('categories.government.partners.0'),
        t('categories.government.partners.1'),
        t('categories.government.partners.2'),
        t('categories.government.partners.3'),
        t('categories.government.partners.4'),
      ],
    },
  ];

  const partnershipModels = [
    {
      icon: Handshake,
      title: t('models.items.strategicAlliance.title'),
      description: t('models.items.strategicAlliance.description'),
    },
    {
      icon: Puzzle,
      title: t('models.items.technologyIntegration.title'),
      description: t('models.items.technologyIntegration.description'),
    },
    {
      icon: Users,
      title: t('models.items.jointVenture.title'),
      description: t('models.items.jointVenture.description'),
    },
  ];

  const partnershipBenefits = [
    {
      icon: TrendingUp,
      title: t('benefits.items.marketAccess.title'),
      description: t('benefits.items.marketAccess.description'),
    },
    {
      icon: TechTransfer,
      title: t('benefits.items.technologyTransfer.title'),
      description: t('benefits.items.technologyTransfer.description'),
    },
    {
      icon: Leaf,
      title: t('benefits.items.esgAlignment.title'),
      description: t('benefits.items.esgAlignment.description'),
    },
    {
      icon: Shield,
      title: t('benefits.items.sovereignInfrastructure.title'),
      description: t('benefits.items.sovereignInfrastructure.description'),
    },
  ];

  const partnershipProcess = [
    {
      step: t('process.items.initialConsultation.step'),
      title: t('process.items.initialConsultation.title'),
      description: t('process.items.initialConsultation.description'),
    },
    {
      step: t('process.items.dueDiligence.step'),
      title: t('process.items.dueDiligence.title'),
      description: t('process.items.dueDiligence.description'),
    },
    {
      step: t('process.items.agreementFramework.step'),
      title: t('process.items.agreementFramework.title'),
      description: t('process.items.agreementFramework.description'),
    },
    {
      step: t('process.items.jointExecution.step'),
      title: t('process.items.jointExecution.title'),
      description: t('process.items.jointExecution.description'),
    },
  ];

  const statsItems = [
    { value: t('stats.items.countries.value'), label: t('stats.items.countries.label') },
    { value: t('stats.items.partners.value'), label: t('stats.items.partners.label') },
    { value: t('stats.items.jointVentures.value'), label: t('stats.items.jointVentures.label') },
    { value: t('stats.items.pipeline.value'), label: t('stats.items.pipeline.label') },
  ];

  return (
    <div className="bg-[#121212]">
      {/* Hero */}
      <section className="pt-32 pb-24 md:pt-40 md:pb-32 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6">{t('hero.label')}</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-[-0.01em] mb-8">
              {t('hero.title')}
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="max-w-2xl text-base md:text-lg text-[#999999] leading-relaxed">
              {t('hero.description')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Partner Categories */}
      <section className="py-24 border-t border-[rgba(255,255,255,0.06)] bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="space-y-20">
            {partnerCategories.map((category, i) => (
              <FadeIn key={category.title} delay={i * 0.15}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <category.icon size={18} className="text-white" strokeWidth={1.5} />
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-[-0.01em]">
                      {category.title}
                    </h2>
                  </div>
                  <p className="text-sm text-[#999999] leading-relaxed mb-8 max-w-2xl">
                    {category.description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {category.partners.map((partner) => (
                      <span
                        key={partner}
                        className="px-4 py-2 border border-[rgba(255,255,255,0.06)] rounded-xl text-xs text-[#999999]"
                      >
                        {partner}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Models */}
      <section className="py-24 border-t border-[rgba(255,255,255,0.06)] bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('models.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">
              {t('models.title')}
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {partnershipModels.map((model, i) => (
              <FadeIn key={model.title} delay={i * 0.1}>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 bg-[#121212] h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <model.icon size={18} className="text-white" strokeWidth={1.5} />
                    <h3 className="text-lg font-semibold text-white">{model.title}</h3>
                  </div>
                  <p className="text-sm text-[#999999] leading-relaxed">{model.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-24 border-t border-[rgba(255,255,255,0.06)] bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('benefits.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">
              {t('benefits.title')}
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-8">
            {partnershipBenefits.map((benefit, i) => (
              <FadeIn key={benefit.title} delay={i * 0.1}>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 bg-[#0D0D0D] h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <benefit.icon size={18} className="text-white" strokeWidth={1.5} />
                    <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                  </div>
                  <p className="text-sm text-[#999999] leading-relaxed">{benefit.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Process */}
      <section className="py-24 border-t border-[rgba(255,255,255,0.06)] bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('process.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">
              {t('process.title')}
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-4 gap-8">
            {partnershipProcess.map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.1}>
                <div className="relative">
                  <span className="text-5xl font-bold text-[rgba(255,255,255,0.04)] absolute -top-4 -left-2">
                    {step.step}
                  </span>
                  <div className="relative pt-8">
                    <h3 className="text-base font-semibold text-white mb-3">{step.title}</h3>
                    <p className="text-sm text-[#999999] leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 border-t border-[rgba(255,255,255,0.06)] bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('stats.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">
              {t('stats.title')}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsItems.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div className="text-center md:text-left">
                  <p className="text-4xl md:text-5xl font-bold text-white tracking-[-0.01em] mb-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-[#999999]">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-[rgba(255,255,255,0.06)] bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-6">
              {t('becomePartner.title')}
            </h2>
            <p className="max-w-xl mx-auto text-base text-[#666666] mb-10">
              {t('becomePartner.description')}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#0A0F1A] text-white px-8 py-4 rounded-xl text-sm font-medium hover:bg-[#0A0F1A]/90 transition-colors"
            >
              {t('becomePartner.cta')}
              <ArrowRight size={14} />
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
