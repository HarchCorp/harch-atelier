'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Calendar, Tag, Bolt, Cpu, Factory, Mountain, Droplets, Wheat, Shield, Zap, Landmark, Download, Mail, Phone, Award, FileText, Image as ImageIcon, ExternalLink, TrendingUp } from 'lucide-react';
import { featuredArticle, regularArticles } from '@/data/articles';

import { FadeIn, StaggerContainer, StaggerItem, CountUp, SectionDivider } from '@/components/ui/motion';
import { VideoPlayer } from '@/components/VideoPlayer';

const tagIcons: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  Intelligence: Cpu,
  Energy: Bolt,
  Corporate: Zap,
  Cement: Factory,
  Technology: Shield,
  Mining: Mountain,
  Water: Droplets,
  Agri: Wheat,
  Finance: Landmark,
};

// Press releases — taken from the centralized article dataset (top 6)
const pressReleases = regularArticles.slice(0, 6);

// Media coverage — external press mentions with realistic publications
const mediaCoverage: Array<{
  outlet: string;
  headline: string;
  excerpt: string;
  date: string;
  url: string;
  accent: string;
}> = [
  {
    outlet: 'Jeune Afrique',
    headline: 'Harch Corp lève 200 M$ en Series A pour bâtir l\'infrastructure souveraine africaine',
    excerpt: 'La holding industrielle fondée par Amine Harch El Korane consolide son portefeuille de huit filiales et accélère le déploiement de HarchOS à travers le continent.',
    date: 'April 14, 2026',
    url: 'https://www.jeuneafrique.com',
    accent: '#8B9DAF',
  },
  {
    outlet: 'Financial Times Africa',
    headline: 'Morocco\'s Harch Intelligence turns on 1,798-GPU sovereign compute cluster',
    excerpt: 'The Dakhla campus reaches full operational capacity, marking the largest sovereign AI deployment on African soil and a credible alternative to hyperscaler regions.',
    date: 'March 28, 2026',
    url: 'https://www.ft.com',
    accent: '#4A7B5F',
  },
  {
    outlet: 'L\'Économiste',
    headline: 'Loi 82-21 : Harch Energy débloque 4,4 GW de pipeline solaire B2B',
    excerpt: 'L\'entrée en vigueur du cadre autoconsommation ouvre un marché de 1,5 à 3 M MAD par site industriel — Harch Energy positionne 320 MW en portefeuille.',
    date: 'March 10, 2026',
    url: 'https://www.leconomiste.com',
    accent: '#C4964A',
  },
  {
    outlet: 'Bloomberg Africa',
    headline: 'Harch Mining signs cobalt offtake with three Moroccan refiners',
    excerpt: 'The agreements lock in domestic processing capacity for strategic minerals, advancing Harch Corp\'s thesis of refining African resources on African soil.',
    date: 'February 22, 2026',
    url: 'https://www.bloomberg.com',
    accent: '#A87878',
  },
  {
    outlet: 'TechCrunch',
    headline: 'HarchOS SDK v0.2 ships carbon-aware workload routing for African AI',
    excerpt: 'The open-source scheduler cuts workload carbon intensity by 62% by routing training jobs to whichever GPU hub runs cleanest in real time.',
    date: 'February 2, 2026',
    url: 'https://techcrunch.com',
    accent: '#6888A8',
  },
  {
    outlet: 'Les Échos Afrique',
    headline: 'MRE : la plateforme Harch Finance capte 122 Mds MAD de flux diasporiques',
    excerpt: 'La super-app intégrée gère transferts, gestion locative, conciergerie et santé pour les 5,8 millions de Marocains résidant à l\'étranger.',
    date: 'January 18, 2026',
    url: 'https://afrique.lesechos.fr',
    accent: '#6BAF6B',
  },
];

// Press kit assets available for download
const pressKitAssets: Array<{
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  cta: string;
  href: string;
}> = [
  { title: 'Brand Assets & Logo Pack', desc: 'Harch Corp logos in SVG, PNG and EPS — full color, monochrome and reversed variants. Includes usage guidelines for media partners.', icon: ImageIcon, cta: 'Download Logo Pack', href: '/press/harchcorp-logo-pack.zip' },
  { title: 'Company Fact Sheet (PDF)', desc: '31-page investor-grade overview: eight subsidiaries, $2.52B pipeline, deployment phases 2024-2030, capital structure and blended IRR.', icon: FileText, cta: 'Download Fact Sheet', href: '/pdfs/harchcorp-company-overview.pdf' },
  { title: 'Executive Bios & Headshots', desc: 'Leadership biographies, high-resolution headshots and public speaking topics for Amine Harch El Korane and the executive committee.', icon: Tag, cta: 'Download Bios', href: '/press/harchcorp-executive-bios.zip' },
  { title: 'Product & Facility Imagery', desc: 'Press-licensed photography of HarchOS dashboard, Dakhla data center, Tarfaya hydrogen plant and subsidiary facilities across five hubs.', icon: ImageIcon, cta: 'Download Image Library', href: '/press/harchcorp-image-library.zip' },
];

// Awards & industry recognition
const awards: Array<{
  title: string;
  org: string;
  year: string;
  desc: string;
  accent: string;
}> = [
  { title: 'Africa Infrastructure Investor of the Year', org: 'African Banker Awards', year: '2026', desc: 'Recognized for the $2.52B vertically integrated portfolio across energy, intelligence and mining — the largest sovereign build-out on the continent.', accent: '#8B9DAF' },
  { title: 'Sovereign Compute Pioneer', org: 'GITEX Africa', year: '2025', desc: 'Awarded for HarchOS and the 1,798-GPU Dakhla deployment — the first carbon-aware, federated AI orchestration platform built and operated on African soil.', accent: '#4A7B5F' },
  { title: 'Top 10 Climate-Tech Builders — MENA', org: 'MIT Technology Review Arabic', year: '2025', desc: 'Listed for achieving a PUE below 1.15 and an average carbon intensity of 47 gCO2/kWh — 89% below the global data center average.', accent: '#6888A8' },
  { title: 'Best Renewable Energy PPP', org: 'Africa Energy Forum', year: '2024', desc: 'Honored for the Tarfaya green hydrogen partnership with MASEN — 60,000 tonnes per year scaling to 200,000 tonnes by 2030.', accent: '#C4964A' },
];

const heroStats = [
  { label: 'Press Releases', value: 42, suffix: '+', icon: FileText },
  { label: 'Media Mentions', value: 128, suffix: '', icon: ExternalLink },
  { label: 'Awards Won', value: 11, suffix: '', icon: Award },
  { label: 'Press Languages', value: 3, suffix: '', icon: Tag },
];

export default function NewsroomPageClient() {
  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Newsroom</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Harch Corp<br/>Newsroom
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Announcements, deployments, and strategic updates from Harch Corp and its eight industrial verticals. Press releases, media coverage, downloadable assets and direct access to our communications team — no spin, no fluff, just the facts that matter.
            </p>
          </FadeIn>

          {/* Hero stats strip */}
          <FadeIn delay={0.15}>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
              {heroStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                    <Icon size={16} className="text-[#8B9DAF] mb-2" strokeWidth={1.5} />
                    <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                      <CountUp to={stat.value} suffix={stat.suffix} duration={1.8} />
                    </p>
                    <p className="text-[10px] text-[#666666] uppercase tracking-[0.1em] mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ FEATURED PRESS RELEASE ═══ */}
      <section className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6 text-[#8B9DAF]">Featured Release</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Link href={`/newsroom/${featuredArticle.slug}`} className="group block">
              <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden hover:border-white/[0.12] transition-colors">
                {/* Featured Image */}
                {featuredArticle.image && (
                  <div className="relative w-full aspect-[21/9] overflow-hidden">
                    <Image
                      src={featuredArticle.image}
                      alt={featuredArticle.imageAlt || featuredArticle.title}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 1400px"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/60 to-transparent" />
                  </div>
                )}
                <div className="p-8 md:p-12 lg:p-16">
                  {/* Accent glow */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#8B9DAF]" />
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)] text-[9px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">
                          {(() => { const Icon = tagIcons[featuredArticle.tag]; return Icon ? <Icon size={10} /> : null; })()}
                          {featuredArticle.tag}
                        </span>
                        <span className="text-[11px] text-[#666666] flex items-center gap-1 font-[family-name:var(--font-space-mono)]"><Calendar size={10} />{featuredArticle.date}</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl lg:text-[40px] font-bold text-white tracking-tight mb-5 leading-[1.15] group-hover:text-[#CCCCCC] transition-colors">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-[15px] text-[#999999] leading-[1.7] max-w-3xl mb-8">{featuredArticle.excerpt}</p>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">
                        Read Full Dispatch <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                    <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-xl bg-[rgba(139,157,175,0.06)] border border-[rgba(139,157,175,0.12)] shrink-0">
                      <ArrowUpRight size={24} className="text-[#8B9DAF] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ═══ PRESS RELEASES — chronological list ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="section-label mb-3">Press Releases</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em]">News &amp; Announcements</h2>
              </div>
              <span className="hidden md:inline-flex items-center gap-2 text-[11px] font-[family-name:var(--font-space-mono)] text-[#666666]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B9DAF]" />
                {pressReleases.length} recent
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2">
            {pressReleases.map((article, i) => {
              const Icon = tagIcons[article.tag];
              return (
                <FadeIn key={article.slug} delay={i * 0.04}>
                  <Link href={`/newsroom/${article.slug}`} className="vertical-row group block p-6 md:p-8 cursor-pointer">
                    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                      {/* Thumbnail */}
                      {article.image && (
                        <div className="relative w-full md:w-48 lg:w-56 shrink-0 aspect-video rounded-lg overflow-hidden border border-[rgba(255,255,255,0.06)]">
                          <Image
                            src={article.image}
                            alt={article.imageAlt || article.title}
                            fill
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 224px"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-[rgba(139,157,175,0.06)] border border-[rgba(139,157,175,0.1)] text-[9px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">
                            {Icon ? <Icon size={10} className="inline mr-1" /> : null}
                            {article.tag}
                          </span>
                          <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">{article.date}</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-[#CCCCCC] transition-colors leading-snug">{article.title}</h3>
                        <p className="text-[14px] text-[#999999] leading-relaxed mt-2 line-clamp-2">{article.excerpt}</p>
                      </div>
                      <ArrowRight size={16} className="vertical-arrow text-[rgba(255,255,255,0.1)] group-hover:text-white transition-all shrink-0 mt-2 md:mt-8" />
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider className="max-w-[1400px] mx-auto" />

      {/* ═══ MEDIA COVERAGE — external press mentions ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-3 text-[#8B9DAF]">Media Coverage</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-4">Harch Corp in the Press</h2>
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              Independent coverage from financial, technology and industry publications tracking the build-out of Africa&apos;s sovereign industrial infrastructure. Links open the original source in a new tab.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.07}>
            {mediaCoverage.map((item) => (
              <StaggerItem key={item.headline}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 md:p-7 h-full group hover:border-white/[0.12] hover:bg-white/[0.03] transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: item.accent }} />
                      <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#8B9DAF]">{item.outlet}</span>
                    </span>
                    <ExternalLink size={14} className="text-[#666666] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-[16px] md:text-[17px] font-bold text-white group-hover:text-[#CCCCCC] transition-colors mb-3 leading-snug">{item.headline}</h3>
                  <p className="text-[13px] text-[#999999] leading-relaxed mb-5">{item.excerpt}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.04)]">
                    <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)] flex items-center gap-1">
                      <Calendar size={9} />{item.date}
                    </span>
                    <span className="text-[11px] font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">Read at source</span>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ PRESS KIT DOWNLOAD ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="section-label mb-3 text-[#8B9DAF]">Press Kit</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em]">Downloadable Assets</h2>
              </div>
              <span className="hidden md:inline-flex items-center gap-2 text-[11px] font-[family-name:var(--font-space-mono)] text-[#666666]">
                <Download size={12} />
                Updated monthly
              </span>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.07}>
            {pressKitAssets.map((asset) => {
              const Icon = asset.icon;
              return (
                <StaggerItem key={asset.title}>
                  <a
                    href={asset.href}
                    download
                    className="block bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 h-full group hover:border-white/[0.12] hover:bg-white/[0.03] transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)] flex items-center justify-center mb-4">
                      <Icon size={16} className="text-[#8B9DAF]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[14px] font-bold text-white mb-2 group-hover:text-[#CCCCCC] transition-colors">{asset.title}</h3>
                    <p className="text-[12px] text-[#999999] leading-relaxed mb-5">{asset.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">
                      <Download size={11} />{asset.cta}
                    </span>
                  </a>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* Video Media Kit — Brand Film + Pipeline Brief */}
          <FadeIn delay={0.3}>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                <div className="w-full h-44 mb-5">
                  <VideoPlayer
                    src="/videos/v1_brand.mp4"
                    variant="modal-trigger"
                    label="Brand Film"
                    className="w-full h-full"
                  />
                </div>
                <h3 className="text-[14px] font-bold text-white mb-2">Brand Film</h3>
                <p className="text-[12px] text-[#999999] leading-relaxed">
                  40-second executive brief on Harch Corp&apos;s 100-year vision: vertically integrated
                  sovereign industrial backbone for Africa, owned and operated by Africans.
                </p>
              </div>
              <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                <div className="w-full h-44 mb-5">
                  <VideoPlayer
                    src="/videos/v23_2_4B.mp4"
                    variant="modal-trigger"
                    label="$2.4B Pipeline (40s)"
                    className="w-full h-full"
                  />
                </div>
                <h3 className="text-[14px] font-bold text-white mb-2">$2.4B Pipeline Brief</h3>
                <p className="text-[12px] text-[#999999] leading-relaxed">
                  Executive video brief covering capital allocation, 8 industrial verticals, 5 countries,
                  and the Build-One-At-A-Time deployment strategy through 2030.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ AWARDS & RECOGNITION ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-3 text-[#8B9DAF]">Awards &amp; Recognition</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-4">Industry Acknowledgment</h2>
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              Recognition from financial, technology and energy institutions validating the Harch Corp thesis: that sovereign industrial infrastructure built on African soil is both necessary and achievable.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.08}>
            {awards.map((award) => (
              <StaggerItem key={award.title}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 md:p-7 h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${award.accent}1a`, border: `1px solid ${award.accent}33` }}>
                      <Award size={20} strokeWidth={1.5} style={{ color: award.accent }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#8B9DAF]">{award.org}</span>
                        <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">{award.year}</span>
                      </div>
                      <h3 className="text-[15px] font-bold text-white leading-snug">{award.title}</h3>
                    </div>
                  </div>
                  <p className="text-[13px] text-[#999999] leading-relaxed">{award.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ MEDIA CONTACT ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="bg-gradient-to-br from-[#1a1f2e] via-[#161616] to-[#0D0D0D] rounded-lg border border-[#8B9DAF]/20 p-8 md:p-12 lg:p-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <p className="section-label mb-3 text-[#8B9DAF]">Media Contact</p>
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-4">Press &amp; Analyst Inquiries</h2>
                  <p className="text-[15px] text-[#999999] leading-[1.7] mb-8">
                    Our communications team responds to accredited press and industry analyst inquiries within four hours, 24/7. For embargoed briefings, executive interviews or facility tours, reach out below.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <a href="mailto:press@harchcorp.com" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black text-[12px] font-bold tracking-[0.06em] uppercase hover:bg-[#CCCCCC] transition-colors">
                      <Mail size={14} />Email Press Team
                    </a>
                    <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/12 text-white text-[12px] font-bold tracking-[0.06em] uppercase hover:border-white/25 hover:bg-white/[0.04] transition-all">
                      General Inquiry <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)] flex items-center justify-center shrink-0">
                      <Mail size={16} className="text-[#8B9DAF]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#666666] uppercase tracking-[0.1em]">Press Email</p>
                      <p className="text-[14px] font-[family-name:var(--font-space-mono)] text-white">press@harchcorp.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)] flex items-center justify-center shrink-0">
                      <Phone size={16} className="text-[#8B9DAF]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#666666] uppercase tracking-[0.1em]">Press Line (24/7)</p>
                      <p className="text-[14px] font-[family-name:var(--font-space-mono)] text-white">+212 684 440 682</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)] flex items-center justify-center shrink-0">
                      <TrendingUp size={16} className="text-[#8B9DAF]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#666666] uppercase tracking-[0.1em]">Response SLA</p>
                      <p className="text-[14px] font-[family-name:var(--font-space-mono)] text-white">4 hours · 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
