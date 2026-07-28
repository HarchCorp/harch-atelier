'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Leaf, Users, Shield, Droplets, Zap, Sun, Heart, Recycle, TreePine } from 'lucide-react';
import { FadeIn, AnimatedCounter } from '@/components/ui/motion';
import { ESGRadarChart } from '@/components/charts/ESGRadarChart';
import { CarbonIntensityChart } from '@/components/charts/CarbonIntensityChart';
import { PDFQuickDownload } from '@/components/PDFQuickDownload';
import { useTranslations, useLocale } from 'next-intl';

export default function ESGPageClient() {
  const t = useTranslations('esg');
  const locale = useLocale();

  const envCommitments = [
    { icon: Sun, title: t('environmental.items.0.title'), desc: t('environmental.items.0.desc') },
    { icon: Droplets, title: t('environmental.items.1.title'), desc: t('environmental.items.1.desc') },
    { icon: TreePine, title: t('environmental.items.2.title'), desc: t('environmental.items.2.desc') },
    { icon: Recycle, title: t('environmental.items.3.title'), desc: t('environmental.items.3.desc') },
  ];

  const socialImpact = [
    { stat: 3200, prefix: '', suffix: '+', label: t('social.items.0.label'), desc: t('social.items.0.desc') },
    { stat: 10, prefix: '', suffix: 'K+', label: t('social.items.1.label'), desc: t('social.items.1.desc') },
    { stat: 50, prefix: '', suffix: 'M+', label: t('social.items.2.label'), desc: t('social.items.2.desc') },
    { stat: 5, prefix: '', suffix: '', label: t('social.items.3.label'), desc: t('social.items.3.desc') },
  ];

  const governanceTable = [
    { standard: 'ISO 14001', scope: t('governance.rows.0.scope'), status: t('governance.rows.0.status'), vertical: t('governance.rows.0.vertical') },
    { standard: 'ISO 45001', scope: t('governance.rows.1.scope'), status: t('governance.rows.1.status'), vertical: t('governance.rows.1.vertical') },
    { standard: 'GRI Standards', scope: t('governance.rows.2.scope'), status: t('governance.rows.2.status'), vertical: t('governance.rows.2.vertical') },
    { standard: 'TCFD', scope: t('governance.rows.3.scope'), status: t('governance.rows.3.status'), vertical: t('governance.rows.3.vertical') },
    { standard: 'UN SDGs', scope: t('governance.rows.4.scope'), status: t('governance.rows.4.status'), vertical: t('governance.rows.4.vertical') },
    { standard: 'IFC Performance', scope: t('governance.rows.5.scope'), status: t('governance.rows.5.status'), vertical: t('governance.rows.5.vertical') },
  ];

  const socialPrograms = [
    { title: t('programs.items.0.title'), desc: t('programs.items.0.desc') },
    { title: t('programs.items.1.title'), desc: t('programs.items.1.desc') },
    { title: t('programs.items.2.title'), desc: t('programs.items.2.desc') },
  ];

  const universityStats = [
    { label: t('university.stats.0.label'), value: t('university.stats.0.value') },
    { label: t('university.stats.1.label'), value: t('university.stats.1.value') },
    { label: t('university.stats.2.label'), value: t('university.stats.2.value') },
    { label: t('university.stats.3.label'), value: t('university.stats.3.value') },
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
        </div>
      </section>

      {/* Environmental Commitments */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('environmental.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              {t('environmental.title')}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {envCommitments.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
                    <item.icon size={20} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ESG Performance Dashboard */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('metrics.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-12">
              {t('metrics.title')}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FadeIn delay={0.1}>
              <ESGRadarChart />
            </FadeIn>
            <FadeIn delay={0.2}>
              <CarbonIntensityChart />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Photo Section - Energy */}
      <section className="photo-section relative min-h-[60vh] flex items-center">
        <Image src="/images/hero-energy.jpg" alt={t('photo.alt')} fill className="object-cover" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 py-24">
          <FadeIn>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D0D0D]/10 border border-white/10 backdrop-blur-sm mb-6">
              <Leaf size={12} className="text-white/60" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/70">{t('photo.badge')}</span>
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-[56px] font-extrabold text-white leading-[1.05] tracking-[-0.02em] mb-6 max-w-2xl">
              {t('photo.title')}
            </h2>
            <p className="max-w-lg text-[15px] text-white/60 leading-relaxed">
              {t('photo.description')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Social Impact */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('social.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              {t('social.title')}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {socialImpact.map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.1}>
                <div className="card p-6">
                  <p className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-none mb-2">
                    <AnimatedCounter value={item.stat} prefix={item.prefix} suffix={item.suffix} />
                  </p>
                  <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-white mb-2">{item.label}</p>
                  <p className="text-[12px] text-[#666666] leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Social Programs */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('programs.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              {t('programs.title')}
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {socialPrograms.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="card p-8 h-full">
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Governance */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('governance.label')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              {t('governance.title')}
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-12">{t('governance.description')}</p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="bg-[#121212] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('governance.tableHeaders.standard')}</th>
                      <th>{t('governance.tableHeaders.scope')}</th>
                      <th>{t('governance.tableHeaders.status')}</th>
                      <th>{t('governance.tableHeaders.vertical')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {governanceTable.map((row) => (
                      <tr key={row.standard}>
                        <td className="font-semibold">{row.standard}</td>
                        <td>{row.scope}</td>
                        <td>
                          <span className={`status-badge ${row.status === t('governance.statusAdopted') || row.status === t('governance.statusAligned') ? 'status-badge-active' : 'status-badge-engineering'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />{row.status}
                          </span>
                        </td>
                        <td>{row.vertical}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 data-grid-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">{t('cta.title')}</h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">{t('cta.description')}</p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">{t('cta.getInvolved')} <ArrowRight size={14} /></Link>
              <Link href="/investors" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">{t('cta.viewInvestment')}</Link>
              <PDFQuickDownload pdfType="sustainability-report" locale={locale as 'en' | 'fr'} label={locale === 'fr' ? 'Rapport Durabilité PDF' : 'Sustainability Report PDF'} variant="outline" />
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
