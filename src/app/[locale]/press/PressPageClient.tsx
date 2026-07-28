'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Download, Mail, Phone, Calendar, FileText, Image as ImageIcon, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

export default function PressPageClient() {
  const t = useTranslations('press');

  const pressReleases = [
    {
      date: t('releases.0.date'),
      title: t('releases.0.title'),
      excerpt: t('releases.0.excerpt'),
      category: t('releases.0.category'),
      image: '/images/finance/green-bonds-africa.jpg',
    },
    {
      date: t('releases.1.date'),
      title: t('releases.1.title'),
      excerpt: t('releases.1.excerpt'),
      category: t('releases.1.category'),
      image: '/images/blog/dakhla-data-center-construction.jpg',
    },
    {
      date: t('releases.2.date'),
      title: t('releases.2.title'),
      excerpt: t('releases.2.excerpt'),
      category: t('releases.2.category'),
      image: '/images/case-studies/gambia-cement-operations.jpg',
    },
    {
      date: t('releases.3.date'),
      title: t('releases.3.title'),
      excerpt: t('releases.3.excerpt'),
      category: t('releases.3.category'),
      image: '/images/company/hq-casablanca.jpg',
    },
    {
      date: t('releases.4.date'),
      title: t('releases.4.title'),
      excerpt: t('releases.4.excerpt'),
      category: t('releases.4.category'),
      image: '/images/esg/esg-report-2025.jpg',
    },
    {
      date: t('releases.5.date'),
      title: t('releases.5.title'),
      excerpt: t('releases.5.excerpt'),
      category: t('releases.5.category'),
      image: '/images/blog/energy-2gw-pipeline.jpg',
    },
    {
      date: t('releases.6.date'),
      title: t('releases.6.title'),
      excerpt: t('releases.6.excerpt'),
      category: t('releases.6.category'),
      image: '/images/blog/carbon-aware-gpu-cloud.jpg',
    },
  ];

  const brandAssets = [
    { name: t('brandAssets.items.0.name'), format: t('brandAssets.items.0.format'), desc: t('brandAssets.items.0.desc') },
    { name: t('brandAssets.items.1.name'), format: t('brandAssets.items.1.format'), desc: t('brandAssets.items.1.desc') },
    { name: t('brandAssets.items.2.name'), format: t('brandAssets.items.2.format'), desc: t('brandAssets.items.2.desc') },
    { name: t('brandAssets.items.3.name'), format: t('brandAssets.items.3.format'), desc: t('brandAssets.items.3.desc') },
    { name: t('brandAssets.items.4.name'), format: t('brandAssets.items.4.format'), desc: t('brandAssets.items.4.desc') },
    { name: t('brandAssets.items.5.name'), format: t('brandAssets.items.5.format'), desc: t('brandAssets.items.5.desc') },
  ];

  const factSheet = [
    { label: t('factSheet.items.0.label'), value: t('factSheet.items.0.value') },
    { label: t('factSheet.items.1.label'), value: t('factSheet.items.1.value') },
    { label: t('factSheet.items.2.label'), value: t('factSheet.items.2.value') },
    { label: t('factSheet.items.3.label'), value: t('factSheet.items.3.value') },
    { label: t('factSheet.items.4.label'), value: t('factSheet.items.4.value') },
    { label: t('factSheet.items.5.label'), value: t('factSheet.items.5.value') },
    { label: t('factSheet.items.6.label'), value: t('factSheet.items.6.value') },
    { label: t('factSheet.items.7.label'), value: t('factSheet.items.7.value') },
    { label: t('factSheet.items.8.label'), value: t('factSheet.items.8.value') },
    { label: t('factSheet.items.9.label'), value: t('factSheet.items.9.value') },
    { label: t('factSheet.items.10.label'), value: t('factSheet.items.10.value') },
    { label: t('factSheet.items.11.label'), value: t('factSheet.items.11.value') },
    { label: t('factSheet.items.12.label'), value: t('factSheet.items.12.value') },
    { label: t('factSheet.items.13.label'), value: t('factSheet.items.13.value') },
  ];

  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('hero.label')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('hero.title')}
            </h1>
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('hero.description')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.04)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('newsroom.sectionLabel')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">{t('newsroom.latestReleases')}</h2>
          </FadeIn>

          <div className="space-y-6">
            {pressReleases.map((release, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="card p-6 md:p-8">
                  {/* Image */}
                  {release.image && (
                    <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden mb-6 border border-[rgba(255,255,255,0.06)]">
                      <Image
                        src={release.image}
                        alt={release.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 900px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-transparent to-transparent" />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)] text-[9px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">
                      {release.category}
                    </span>
                    <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)] flex items-center gap-1">
                      <Calendar size={10} /> {release.date}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-3 leading-snug">{release.title}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{release.excerpt}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Fact Sheet */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.04)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('factSheet.title')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">{t('factSheet.subtitle')}</h2>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="bg-[#1E1E1E] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('factSheet.attributeHeader')}</th>
                      <th>{t('factSheet.detailsHeader')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {factSheet.map((item) => (
                      <tr key={item.label}>
                        <td className="font-semibold">{item.label}</td>
                        <td>{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Brand Assets */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.04)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('brandAssets.title')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">{t('brandAssets.subtitle')}</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandAssets.map((asset, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {asset.format === 'SVG' || asset.format === 'PNG' ? (
                      <ImageIcon size={18} className="text-[#8B9DAF]" />
                    ) : asset.format === 'PDF' ? (
                      <FileText size={18} className="text-[#8B9DAF]" />
                    ) : (
                      <Globe size={18} className="text-[#8B9DAF]" />
                    )}
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-[0.1em] uppercase bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)] text-[#8B9DAF] font-[family-name:var(--font-space-mono)]">
                      {asset.format}
                    </span>
                  </div>
                  <h3 className="text-[14px] font-bold text-white mb-1">{asset.name}</h3>
                  <p className="text-[12px] text-[#666666] mb-4">{asset.desc}</p>
                  <button className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8B9DAF] hover:text-white transition-colors">
                    <Download size={12} /> {t('brandAssets.download')}
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Media Contact */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.04)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('mediaContact.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">{t('mediaContact.title')}</h2>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-8">
                <h3 className="text-lg font-bold text-white mb-4">{t('mediaContact.pressInquiries')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-[#8B9DAF]" />
                    <div>
                      <p className="text-[12px] text-[#666666]">{t('mediaContact.emailLabel')}</p>
                      <a href="mailto:press@harchcorp.com" className="text-[14px] text-white hover:text-[#8B9DAF] transition-colors">press@harchcorp.com</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-[#8B9DAF]" />
                    <div>
                      <p className="text-[12px] text-[#666666]">{t('mediaContact.phoneLabel')}</p>
                      <p className="text-[14px] text-white">{t('mediaContact.phone')}</p>
                    </div>
                  </div>
                </div>
                <p className="text-[13px] text-[#666666] leading-relaxed mt-4">
                  {t('mediaContact.pressDescription')}
                </p>
              </div>

              <div className="card p-8">
                <h3 className="text-lg font-bold text-white mb-4">{t('mediaContact.interviewRequests')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-[#8B9DAF]" />
                    <div>
                      <p className="text-[12px] text-[#666666]">{t('mediaContact.emailLabel')}</p>
                      <a href="mailto:press@harchcorp.com" className="text-[14px] text-white hover:text-[#8B9DAF] transition-colors">press@harchcorp.com</a>
                    </div>
                  </div>
                </div>
                <p className="text-[13px] text-[#666666] leading-relaxed mt-4">
                  {t('mediaContact.interviewDescription')}
                </p>
                <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] hover:text-white transition-colors">
                    {t('mediaContact.generalContact')} <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
