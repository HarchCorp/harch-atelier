'use client';

import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import { ArrowRight, Download, FileText, TrendingUp, Clock, Target } from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';

const dossiers = [
  { slug: 'solaire-epc-b2b', title: 'Solaire EPC B2B au Maroc', tri: '24-28%', payback: '3,2 ans', score: '8,5/10', pages: 36, phase: 'Phase 3', capex: '2 M MAD', accent: '#4A7B5F' },
  { slug: 'mre-services', title: 'Plateforme MRE Services', tri: '31%', payback: '2,4 ans', score: '8,1/10', pages: 43, phase: 'Phase 2', capex: '1,5 M MAD', accent: '#8B9DAF' },
  { slug: 'retreat-yoga-essaouira', title: 'Retreat Yoga & Wellness Essaouira', tri: '19-28%', payback: '4 ans', score: '7,0/10', pages: 45, phase: 'Phase 4', capex: '5 M MAD', accent: '#C4964A' },
  { slug: 'conchyliculture-dakhla', title: 'Conchyliculture Dakhla', tri: '-8% à +26%', payback: '3-4 ans', score: '6,1/10', pages: 41, phase: 'Phase 5', capex: '3 M MAD', accent: '#6888A8' },
  { slug: 'cosmetique-argan-cbd', title: 'Cosmétique Argan + CBD + Figuier', tri: '30-40%', payback: '2-3 ans', score: '6,5/10', pages: 51, phase: 'Phase 2+', capex: '2 M MAD', accent: '#A87878' },
  { slug: 'mro-industriel', title: 'MRO Industriel', tri: '18-25%', payback: '2-3 ans', score: '7,5/10', pages: 51, phase: 'Phase 6+', capex: '5 M MAD', accent: '#666666' },
  { slug: 'export-artisanat-terroir', title: 'Export Artisanat Multi-Terroir', tri: '14-18%', payback: '4,5-5 ans', score: '6,5/10', pages: 50, phase: 'Phase 2+', capex: '2,5 M MAD', accent: '#6BAF6B' },
];

export default function InvestorsResearchClient() {
  return (
    <div className="bg-[#0D0D0D] min-h-screen pt-14">
      {/* HERO */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-[#0D0D0D] via-[#0F0F0F] to-[#0D0D0D] border-b border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6">Harch Research</p>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              7 Investment Dossiers.<br />
              <span className="text-[#8B9DAF]">309 Pages</span> of Analysis.
            </h1>
            <p className="text-[18px] text-[#999] max-w-2xl leading-relaxed mb-10">
              Open-data business opportunity analysis for Morocco and Africa. Each dossier covers market
              analysis, financial models, public subsidies, ROI, risks, and execution plans.
              Free download — CC BY-NC-SA 4.0.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
              {[
                { label: 'Dossiers', value: '7', icon: FileText },
                { label: 'Total Pages', value: '309', icon: FileText },
                { label: 'Charts', value: '47', icon: TrendingUp },
                { label: 'Avg Score', value: '7.2/10', icon: Target },
              ].map((m) => (
                <div key={m.label} className="border border-white/[0.06] rounded-lg p-5 bg-white/[0.02]">
                  <m.icon className="w-5 h-5 text-[#8B9DAF] mb-3" />
                  <p className="text-2xl font-extrabold text-white">{m.value}</p>
                  <p className="text-[11px] text-[#666] uppercase tracking-wider mt-1">{m.label}</p>
                </div>
              ))}
            </div>

            <FadeIn delay={0.3}>
              <div className="mt-10 flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 bg-[#0F0F0F] border border-[rgba(139,157,175,0.18)] rounded-lg max-w-3xl">
                <div className="w-full md:w-64 h-36 shrink-0">
                  <VideoPlayer
                    src="/videos/v3_transparency.mp4"
                    variant="modal-trigger"
                    label="Watch: Building in Public (40s)"
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2">Building in Public</p>
                  <p className="text-[15px] text-white/80 leading-relaxed">
                    We publish our investment analyses in open data. Total transparency for investors, partners,
                    and talents. Watch the 40-second brief on the Building in Public doctrine.
                  </p>
                </div>
              </div>
            </FadeIn>
          </FadeIn>
        </div>
      </section>

      {/* DOSSIERS GRID */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Published Dossiers</p>
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold text-white tracking-tight mb-4">
              7 Sector Investment Analyses
            </h2>
            <p className="text-[14px] text-[#999] mb-12 max-w-2xl leading-relaxed">
              Each dossier is a complete business analysis: market size, competitors, public subsidies,
              5-year financial model (IRR, payback, sensitivity), risks with mitigations, execution plan,
              and ESG impact. 47 charts integrated.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dossiers.map((d, i) => (
              <FadeIn key={d.slug} delay={i * 0.05}>
                <Link
                  href={`/research/${d.slug}`}
                  className="group block p-6 bg-white/[0.02] border border-white/[0.06] rounded-lg hover:bg-white/[0.04] hover:border-white/[0.15] transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-12 rounded-full" style={{ background: d.accent }} />
                      <div>
                        <h3 className="text-[15px] font-bold text-white mb-1">{d.title}</h3>
                        <p className="text-[10px] text-[#666] font-mono uppercase tracking-wider">{d.phase} · {d.pages} pages</p>
                      </div>
                    </div>
                    <span className="text-[14px] font-bold" style={{ color: d.accent }}>{d.score}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-white/[0.06]">
                    <div>
                      <p className="text-[9px] text-[#666] uppercase tracking-wider mb-1">CAPEX</p>
                      <p className="text-[13px] font-bold text-white">{d.capex}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#666] uppercase tracking-wider mb-1">TRI</p>
                      <p className="text-[13px] font-bold text-white">{d.tri}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#666] uppercase tracking-wider mb-1">Payback</p>
                      <p className="text-[13px] font-bold text-white">{d.payback}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                    <span className="text-[12px] text-[#8B9DAF] group-hover:text-white transition-colors flex items-center gap-1.5">
                      View detail
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <a
                      href={`/dossiers/${d.slug}.pdf`}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-md transition-all hover:scale-105"
                      style={{ background: d.accent, color: '#0D0D0D' }}
                    >
                      <Download className="w-3 h-3" />
                      PDF
                    </a>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>

          {/* Portfolio banner */}
          <FadeIn delay={0.3}>
            <div className="mt-12 p-8 bg-gradient-to-br from-[#1a1f2e] via-[#161616] to-[#0D0D0D] rounded-xl border border-[#8B9DAF]/30">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-[#8B9DAF] text-[#0D0D0D] text-[10px] font-bold uppercase tracking-wider rounded">Executive Brochure</span>
                    <span className="text-[11px] text-[#666] font-mono">v2 · 35 pages · 25 charts</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Harch Research Portfolio 2026</h3>
                  <p className="text-[13px] text-[#999] leading-relaxed">
                    Executive synthesis of all 7 dossiers. Comparative matrix, capital allocation,
                    deployment calendar, stress tests. For investors.
                  </p>
                </div>
                <div className="flex justify-end">
                  <a
                    href="/dossiers/portfolio-2026.pdf"
                    download
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B9DAF] text-[#0D0D0D] font-bold text-[13px] rounded-md hover:bg-white transition-all hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    Download (1.3 MB)
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Building in Public
            </h2>
            <p className="text-[15px] text-[#999] mb-10 max-w-xl mx-auto leading-relaxed">
              We publish our investment analyses in open data. Total transparency for investors, partners,
              and talents. License CC BY-NC-SA 4.0.
            </p>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#8B9DAF] text-[#0D0D0D] font-bold text-[14px] rounded-md hover:bg-white transition-all hover:scale-105"
            >
              Browse Public Research Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
