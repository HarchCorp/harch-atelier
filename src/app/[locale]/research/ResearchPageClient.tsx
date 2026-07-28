'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FadeIn } from '@/components/ui/motion';
import { ArrowRight, FileText, Download, Mail, TrendingUp, Clock, MapPin, AlertTriangle, CheckCircle2, BarChart3, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef } from 'react';

const dossiers = [
  {
    slug: 'solaire-epc-b2b',
    title: 'Solaire EPC B2B au Maroc',
    subtitle: 'Installation de panneaux solaires pour PME industrielles',
    capex: '1,5-3 M MAD',
    tri: '24-28%',
    payback: '3,2 ans',
    score: '8,5/10',
    status: 'Phase 3 (2030-2033)',
    tags: ['Énergie', 'B2B', 'Casablanca', 'Tanger'],
    image: '/images/sections/energy-solar-farm.jpg',
    accent: '#4A7B5F',
    description: 'Autoconsommation solaire pour PME industrielles. Loi 82-21 effective juin 2026. Pipeline 4,4 GW à installer d\'ici 2030.',
  },
  {
    slug: 'mre-services',
    title: 'Plateforme MRE Services',
    subtitle: 'Super-app pour Marocains Résidant à l\'Étranger',
    capex: '1-3 M MAD',
    tri: '31%',
    payback: '2,4 ans',
    score: '8,1/10',
    status: 'Phase 2 (2028-2030)',
    tags: ['Digital', 'Diaspora', 'Casablanca'],
    image: '/images/blog/african-data-sovereignty.jpg',
    accent: '#8B9DAF',
    description: '5,8M MRE transfèrent 122 Mds MAD/an. Plateforme intégrée : gestion locative, conciergerie, admin, santé, funéraire.',
  },
  {
    slug: 'retreat-yoga-essaouira',
    title: 'Retreat Yoga & Wellness Essaouira',
    subtitle: 'Modèle hybride B2C/B2B/silver — Capex 5M MAD',
    capex: '4-6 M MAD',
    tri: '19%',
    payback: '4 ans',
    score: '7,0/10',
    status: 'Phase 4 (2033-2036)',
    tags: ['Tourisme', 'Wellness', 'Essaouira'],
    image: '/images/sections/overview-casablanca.jpg',
    accent: '#C4964A',
    description: 'Tourisme Maroc 19,8M arrivées 2025 (record). Wellness tourism mondial 990 Mds$. Modèle hybride anti-saisonnalité.',
  },
  {
    slug: 'conchyliculture-dakhla',
    title: 'Conchyliculture Dakhla',
    subtitle: 'Moules + huîtres — baie de Dakhla',
    capex: '1,5-4 M MAD',
    tri: '-8% à +26%',
    payback: '36-48 mois',
    score: '6,0/10',
    status: 'Phase 5 (2036-2040)',
    tags: ['Aquaculture', 'Export', 'Dakhla'],
    image: '/images/sections/water-desal.jpg',
    accent: '#6888A8',
    description: 'Dakhla = 50% production aquacole nationale. Objectif Maroc 7 600T huîtres (vs 600T actuelle). Immunité crise hydrique.',
  },
  {
    slug: 'cosmetique-argan-cbd',
    title: 'Cosmétique Argan + CBD + Figuier',
    subtitle: 'Marque premium export — combo unique au monde',
    capex: '1-3 M MAD',
    tri: '30-40%',
    payback: '24-36 mois',
    score: '6,5/10',
    status: 'Phase 2+',
    tags: ['Cosmétique', 'Export', 'Souss-Massa'],
    image: '/images/sections/agri-aerial-drone.jpg',
    accent: '#A87878',
    description: 'Combo 3 actifs unique : argan (exclusivité Maroc) + CBD (légal 2021) + figuier barbarie. Marché CBD cosmétique 25 Mds$ 2032.',
  },
  {
    slug: 'mro-industriel',
    title: 'MRO Industriel',
    subtitle: 'Maintenance industrielle multi-sectorielle',
    capex: '1,5-4 M MAD',
    tri: '18-25%',
    payback: '18-30 mois',
    score: '7,5/10',
    status: 'Phase 6+',
    tags: ['Industrie', 'B2B', 'Casablanca', 'Tanger'],
    image: '/images/sections/cement-kiln.jpg',
    accent: '#666666',
    description: 'Maintenance pour zones franches Tanger Med, AFZ, Midparc. Évolutivité MRO 4.0 prédictif (IA, IoT).',
  },
  {
    slug: 'export-artisanat-terroir',
    title: 'Export Artisanat Multi-Terroir',
    subtitle: 'Argan + safran + dattes + eau de rose vers UE/USA',
    capex: '1,5-3,5 M MAD',
    tri: '14-18%',
    payback: '24-36 mois',
    score: '6,5/10',
    status: 'Phase 2+',
    tags: ['Export', 'Artisanat', 'TFZ'],
    image: '/images/blog/carbon-credit-markets-africa.jpg',
    accent: '#6BAF6B',
    description: 'Safran 5-8€/g Maroc vs 15-30€/g retail UE. TFZ 0% IS 5 ans. EUDR non applicable. Distribution épiceries fines + DTC.',
  },
];

const plannedDossiers = [
  'Hydrogène vert Maroc',
  'Cimenterie vert-carbon Gambie',
  'Smart farming Souss-Massa',
  'Dessalement modulaire',
  'Cybersécurité MSSP',
  'Tourisme médical Maroc',
  'Plateforme logistique Tanger Med',
  'Assurance souveraine',
  'Banque digitale néobanque',
  'Acier vert hydrogène',
  'Mining baryte Anti-Atlas',
  'Éducation technique privée',
  'Immobilier industriel',
  'Écotourisme Atlas',
  'Cold chain agroalimentaire',
];

const heroStats = [
  { value: '7', label: 'Dossiers publiés', icon: FileText },
  { value: '15+', label: 'En production', icon: Target },
  { value: '30', label: 'Vision 2050', icon: BarChart3 },
];

export default function ResearchPageClient() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-[#0D0D0D] min-h-screen">
      {/* ═══ HERO avec vidéo de fond ═══ */}
      <section ref={heroRef} className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          poster="/images/sections/intelligence-rack.jpg"
        >
          <source src="/videos/infrastructure.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D]/60 via-[#0D0D0D]/70 to-[#0D0D0D]" />
        <div className="absolute inset-0 dot-pattern opacity-10" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#4A7B5F] text-white rounded mb-6">
              Phase 1 — Active
            </span>
            <h1 className="text-[clamp(2rem,6vw,4.5rem)] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Harch Research
            </h1>
            <p className="text-[clamp(1rem,2vw,1.5rem)] font-light text-[rgba(255,255,255,0.6)] mb-2">
              Open Business Analysis for Morocco & Africa
            </p>
            <div className="w-16 h-0.5 bg-[#8B9DAF] mx-auto mb-8" />
            <p className="text-[15px] text-[rgba(255,255,255,0.5)] leading-[1.7] max-w-2xl mx-auto mb-10">
              Free analytical dossiers on business opportunities in Morocco and Africa. Each dossier covers market analysis, financial models, public subsidies, ROI, risks, and execution plans. One dossier published per week
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              {heroStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="w-5 h-5 text-[#8B9DAF] mx-auto mb-2" />
                  <p className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-[11px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ SECTION INTRO ═══ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D] relative">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="section-label mb-4">Méthodologie</p>
                <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-white tracking-tight mb-6">
                  Chaque dossier est une analyse<br />complète de A à Z
                </h2>
                <div className="accent-line mb-6" />
                <p className="text-[15px] text-[#999999] leading-[1.8] mb-8">
                  Nous analysons chaque opportunité business avec la rigueur d'un cabinet d'avocats fiscalistes. Données vérifiées, modèles financiers détaillés, aides publiques précises, risques identifiés avec plans de mitigation, et plans d'exécution mois par mois. Tout est sourcé. Tout est gratuit.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[rgba(74,123,95,0.15)] border border-[rgba(74,123,95,0.3)] flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-[#4A7B5F]" />
                    </div>
                    <span className="text-[13px] text-white/70">Modèle financier 5 ans</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[rgba(139,157,175,0.15)] border border-[rgba(139,157,175,0.3)] flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-[#8B9DAF]" />
                    </div>
                    <span className="text-[13px] text-white/70">TRI, payback, sensibilité</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[rgba(196,150,74,0.15)] border border-[rgba(196,150,74,0.3)] flex items-center justify-center">
                      <Target className="w-4 h-4 text-[#C4964A]" />
                    </div>
                    <span className="text-[13px] text-white/70">Aides publiques détaillées</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[rgba(168,120,120,0.15)] border border-[rgba(168,120,120,0.3)] flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-[#A87878]" />
                    </div>
                    <span className="text-[13px] text-white/70">Risques & mitigations</span>
                  </div>
                </div>
              </div>
              <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
                <Image
                  src="/images/sections/intelligence-server-room.jpg"
                  alt="Harch Research"
                  fill
                  className="object-cover industrial-image"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-transparent to-transparent" />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ DOSSIERS PUBLIÉS ═══ */}
      <section className="py-20 md:py-28 bg-[#111111]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Dossiers publiés</p>
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold text-white tracking-tight mb-4">
              7 dossiers analytiques disponibles
            </h2>
            <p className="text-[14px] text-[#999999] mb-16 max-w-2xl leading-relaxed">
              Chaque dossier est une analyse business complète : taille de marché, concurrents, aides publiques mobilisables, modèle financier sur 5 ans (TRI, payback, sensibilité), risques avec mitigations, plan d'exécution mois par mois, et contacts utiles. Téléchargement gratuit.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dossiers.map((dossier, i) => (
              <FadeIn key={dossier.slug} delay={i * 0.05}>
                <Link href={`/research/${dossier.slug}`} className="block group">
                  <div className="relative rounded-lg overflow-hidden border border-white/[0.06] bg-[#161616] h-full transition-all duration-300 group-hover:border-white/[0.15] group-hover:shadow-2xl">
                    {/* Image avec overlay */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={dossier.image}
                        alt={dossier.title}
                        fill
                        className="object-cover industrial-image transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-[#161616]/60 to-transparent" />
                      {/* Accent bar */}
                      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: dossier.accent }} />
                      {/* Status badge */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded text-[10px] text-white/80 font-mono uppercase tracking-wider">
                        {dossier.status}
                      </div>
                      {/* Title on image */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-[16px] font-bold text-white leading-tight mb-1">
                          {dossier.title}
                        </h3>
                        <p className="text-[12px] text-white/60 leading-snug">
                          {dossier.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Description */}
                      <p className="text-[12px] text-[#888] leading-relaxed mb-4 line-clamp-2">
                        {dossier.description}
                      </p>

                      {/* Metrics */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="text-center">
                          <p className="text-[9px] text-[#666] uppercase tracking-wider mb-0.5">Capex</p>
                          <p className="text-[11px] font-bold text-white">{dossier.capex}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-[#666] uppercase tracking-wider mb-0.5">TRI</p>
                          <p className="text-[11px] font-bold text-white">{dossier.tri}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-[#666] uppercase tracking-wider mb-0.5">Payback</p>
                          <p className="text-[11px] font-bold text-white">{dossier.payback}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-[#666] uppercase tracking-wider mb-0.5">Score</p>
                          <p className="text-[11px] font-bold" style={{ color: dossier.accent }}>{dossier.score}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {dossier.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-[10px] bg-white/[0.04] text-[#888] rounded border border-white/[0.06]">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* CTA — deux boutons: détail + PDF direct */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                        <Link
                          href={`/research/${dossier.slug}`}
                          className="flex items-center gap-1.5 text-[12px] text-[#8B9DAF] group-hover:text-white transition-colors"
                        >
                          Voir le détail
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                          href={`/dossiers/${dossier.slug}.pdf`}
                          download
                          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-md transition-all hover:scale-105"
                          style={{ background: dossier.accent, color: '#0D0D0D' }}
                        >
                          <Download className="w-3 h-3" />
                          PDF
                        </a>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PIPELINE ═══ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D] relative overflow-hidden">
        {/* Background image parallax-like */}
        <div className="absolute inset-0 opacity-5">
          <Image
            src="/images/sections/energy-wind-farm.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <FadeIn>
            <p className="section-label mb-4">Pipeline</p>
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold text-white tracking-tight mb-4">
              15+ dossiers en production
            </h2>
            <p className="text-[14px] text-[#999999] mb-16 max-w-2xl leading-relaxed">
              Un nouveau dossier publié chaque semaine. Les sujets couvrent les 30 filiales de la vision Harch Corp 2050, plus les opportunités adjacentes. Abonnez-vous pour recevoir chaque nouveau dossier directement.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {plannedDossiers.map((topic, i) => (
              <FadeIn key={topic} delay={i * 0.03}>
                <div className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-md flex items-center gap-3 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all">
                  <div className="w-6 h-6 rounded-full bg-[#8B9DAF]/10 border border-[#8B9DAF]/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-[#8B9DAF] font-mono">{String(i + 8).padStart(2, '0')}</span>
                  </div>
                  <span className="text-[13px] text-[#999]">{topic}</span>
                  <Clock className="w-3 h-3 text-[#555] ml-auto shrink-0" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER CTA avec image de fond ═══ */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <Image
          src="/images/sections/overview-construction.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0D0D0D]/85" />
        <div className="absolute inset-0 dot-pattern opacity-10" />

        <div className="relative z-10 max-w-[800px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <div className="w-14 h-14 mx-auto rounded-xl bg-[rgba(139,157,175,0.1)] border border-[rgba(139,157,175,0.2)] flex items-center justify-center mb-8 backdrop-blur-sm">
              <Mail className="w-7 h-7 text-[#8B9DAF]" />
            </div>
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold text-white mb-4 tracking-tight">
              Un dossier par semaine
            </h2>
            <p className="text-[16px] text-[rgba(255,255,255,0.5)] mb-10 max-w-xl mx-auto leading-relaxed">
              Abonnez-vous pour recevoir chaque nouveau dossier analytique directement dans votre boîte mail. Gratuit, sans spam, désabonnement à tout moment
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#8B9DAF] text-[#0D0D0D] font-bold text-[14px] rounded-md hover:bg-white transition-all hover:scale-105"
            >
              S'abonner — Gratuit
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="mt-6 text-[12px] text-[rgba(255,255,255,0.3)]">
              + 50 000 entrepreneurs concernés · Maroc · Afrique · Diaspora MRE
            </p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
