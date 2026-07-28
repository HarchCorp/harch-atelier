'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Download, FileText, Palette, Type, Layout, Box } from 'lucide-react';
import { FadeIn } from '@/components/ui/motion';

export default function StyleGuidePage() {
  return (
    <div className="bg-[#0D0D0D] min-h-screen">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-14">
          <Link href="/" className="font-bold text-white text-lg">HARCH<span className="text-[#8B9DAF]"> CORP</span></Link>
          <Link href="/" className="text-[12px] text-white/50 hover:text-white">← Retour au site</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 mb-4">
              <FileText size={14} className="text-[#8B9DAF]" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] font-mono">Style Guide · Public · Pour journalistes et partenaires</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Guide de Style<br />
              <span className="text-[#8B9DAF]">Harch Corp.</span>
            </h1>
            <p className="max-w-2xl text-[16px] text-white/50 leading-[1.7] mb-8">
              Tous les formats, couleurs, typographies, et templates utilisés sur harchcorp.com.
              Cette page est publique — les journalistes, designers et partenaires peuvent s'y référer
              pour aligner leurs créations avec notre identité visuelle.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* PALETTE */}
      <section className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 mb-2">
              <Palette size={16} className="text-[#8B9DAF]" />
              <p className="section-label text-[#8B9DAF]">Palette · 6 couleurs</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-12">Couleurs</h2>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Ink', hex: '#0A0A0A', rgb: '10, 10, 10', use: 'Fond principal, texte' },
              { name: 'Surface Dark', hex: '#0D0D0D', rgb: '245, 241, 232', use: 'Fonds alternatifs, covers PDF' },
              { name: 'Bleu Acier', hex: '#8B9DAF', rgb: '200, 70, 43', use: 'Accent principal, CTAs, liens' },
              { name: 'Bleu Acier', hex: '#8B9DAF', rgb: '139, 157, 175', use: 'Accent secondaire, Intelligence' },
              { name: 'Bleu Acier', hex: '#8B9DAF', rgb: '74, 123, 95', use: 'Succès, Energy, ESG' },
              { name: 'Bleu Acier', hex: '#8B9DAF', rgb: '196, 150, 74', use: 'Premium, Finance, warnings' },
            ].map((c) => (
              <div key={c.name} className="border border-white/[0.06] rounded-lg overflow-hidden">
                <div style={{ background: c.hex, height: '120px' }} />
                <div className="p-4 bg-[#111]">
                  <p className="text-[14px] font-bold text-white">{c.name}</p>
                  <p className="text-[11px] text-white/40 font-mono">{c.hex}</p>
                  <p className="text-[10px] text-white/30 font-mono">rgb({c.rgb})</p>
                  <p className="text-[10px] text-white/40 mt-2">{c.use}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Couleurs filiales */}
          <div className="mt-8">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-4 font-mono">Couleurs filiales</p>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'Intelligence /0.1', color: '#8B9DAF' },
                { name: 'Cement /0.2', color: '#8B9DAF' },
                { name: 'Energy /0.3', color: '#8B9DAF' },
                { name: 'Technology /0.4', color: '#8B9DAF' },
                { name: 'Mining /0.5', color: '#8B9DAF' },
                { name: 'Agri /0.6', color: '#8B9DAF' },
                { name: 'Water /0.7', color: '#8B9DAF' },
                { name: 'Finance /0.8', color: '#8B9DAF' },
              ].map((s) => (
                <div key={s.name} className="flex items-center gap-2 px-3 py-2 border border-white/[0.06] rounded-md">
                  <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  <span className="text-[11px] text-white/60 font-mono">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TYPOGRAPHY */}
      <section className="py-16 px-6 border-t border-white/[0.04] bg-[#0D0D0D]">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 mb-2">
              <Type size={16} className="text-[#8B9DAF]" />
              <p className="section-label text-[#8B9DAF]">Typographie</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-12">Fonts & Échelle</h2>
          </FadeIn>
          <div className="space-y-8">
            <div className="border border-white/[0.06] rounded-lg p-8 bg-[#0D0D0D]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2 font-mono">Display · Inter Bold/Extrabold</p>
              <p className="text-[48px] font-extrabold text-white tracking-[-0.02em] leading-[1.02]">L'Afrique n'hérite pas de son infrastructure.</p>
            </div>
            <div className="border border-white/[0.06] rounded-lg p-8 bg-[#0D0D0D]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2 font-mono">Heading · Inter Bold 28px</p>
              <p className="text-[28px] font-bold text-white">Section Heading</p>
            </div>
            <div className="border border-white/[0.06] rounded-lg p-8 bg-[#0D0D0D]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2 font-mono">Body · Inter Regular 16px / 1.7</p>
              <p className="text-[16px] text-white/60 leading-[1.7] max-w-2xl">Harch Corp est une venture marocaine — pas un conglomérat, pas encore — fondée en 2026 par Amine Harch El Korane. Fondateur solo. Aucun client signé. Honnête à ce sujet.</p>
            </div>
            <div className="border border-white/[0.06] rounded-lg p-8 bg-[#0D0D0D]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2 font-mono">Monospace · Space Mono 12px</p>
              <p className="text-[12px] text-[#8B9DAF] font-mono">RESEARCH · DOSSIER 01 · 2026-06-15</p>
            </div>
            <div className="border border-white/[0.06] rounded-lg p-8 bg-[#0D0D0D]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2 font-mono">Label · 10px Bold Uppercase Tracking 0.2em</p>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 font-mono">BUILDING IN PUBLIC · PHASE 1 · ACTIVE</p>
            </div>
          </div>
        </div>
      </section>

      {/* BUTTONS */}
      <section className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 mb-2">
              <Box size={16} className="text-[#8B9DAF]" />
              <p className="section-label text-[#8B9DAF]">Boutons & CTAs</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-12">Composants interactifs</h2>
          </FadeIn>
          <div className="flex flex-wrap gap-4">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B9DAF] text-white text-[14px] font-bold rounded-md hover:bg-[#8B9DAF] transition-all">Primary · Ocre</button>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-[14px] font-bold rounded-md hover:bg-white/90 transition-all">Secondary · White</button>
            <button className="inline-flex items-center gap-2 px-6 py-3 border border-white/15 text-white text-[14px] font-bold rounded-md hover:border-white/30 hover:bg-white/[0.03] transition-all">Tertiary · Outline</button>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B9DAF] text-black text-[14px] font-bold rounded-md hover:bg-white transition-all">Accent · Bleu Acier</button>
            <a href="#" className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B9DAF] text-white text-[14px] font-bold rounded-md hover:bg-[#8B9DAF] transition-all">PDF Download</a>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#8B9DAF] text-white rounded">Badge · Active</span>
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#8B9DAF] text-white rounded">Badge · Planned</span>
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#8B9DAF]/15 border border-[#8B9DAF]/30 text-[#8B9DAF] rounded">Badge · Coming Soon</span>
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#8B9DAF]/15 border border-[#8B9DAF]/30 text-[#8B9DAF] rounded">Badge · Mining</span>
          </div>
        </div>
      </section>

      {/* PDF TEMPLATE */}
      <section className="py-16 px-6 border-t border-white/[0.04] bg-[#0D0D0D]">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 mb-2">
              <Layout size={16} className="text-[#8B9DAF]" />
              <p className="section-label text-[#8B9DAF]">Template PDF</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Format PDF — réutilisé à l'infini</h2>
            <p className="max-w-2xl text-[14px] text-white/50 leading-[1.7] mb-12">
              Chaque PDF Harch Corp suit ce template exact. Même palette, même layout, même structure.
              9 pages par dossier : Cover → Executive Summary → Market Analysis → Financial Model →
              Subsidies → Risks → Execution Plan → Contacts → Disclaimer.
            </p>
          </FadeIn>

          {/* Mock PDF Cover */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-3 font-mono">Page 1 · Cover</p>
              <div style={{ background: '#0D0D0D', aspectRatio: '210/297' }} className="rounded-lg overflow-hidden relative">
                <div style={{ background: '#8B9DAF', height: '10px' }} />
                {/* Diagonal cut */}
                <div style={{
                  background: '#8B9DAF',
                  clipPath: 'polygon(0 62%, 35% 62%, 20% 52%, 0 52%)',
                  position: 'absolute', top: 0, left: 0, right: 0, height: '62%',
                }} />
                <div className="p-8 relative z-10">
                  <p className="text-[14px] font-bold text-black">HARCH <span style={{ color: '#8B9DAF' }}>CORP</span></p>
                  <p className="text-[8px] text-black/60 font-mono mt-1">RESEARCH · DOSSIER 01</p>
                  <div style={{ marginTop: '60%' }}>
                    <p className="text-[24px] font-bold text-black leading-tight">Solaire EPC B2B au Maroc</p>
                    <p className="text-[11px] text-black/60 mt-2 italic">Autoconsommation solaire pour PME industrielles</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between text-[8px] text-black/40 font-mono">
                  <span>harchcorp.com/research</span>
                  <span>Free download · Building in Public</span>
                </div>
              </div>
            </div>

            {/* Mock PDF Content */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-3 font-mono">Page 2 · Content</p>
              <div style={{ background: '#0D0D0D', aspectRatio: '210/297' }} className="rounded-lg overflow-hidden relative">
                <div style={{ background: '#0A0A0A', height: '8px' }} />
                <div className="p-8">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[8px] font-bold text-black/80 font-mono">HARCH CORP · RESEARCH</p>
                    <p className="text-[8px] font-bold font-mono" style={{ color: '#8B9DAF' }}>DOSSIER 01</p>
                  </div>
                  <p className="text-[14px] font-bold mb-3" style={{ color: '#8B9DAF' }}>Executive Summary</p>
                  <div className="space-y-1.5">
                    <div style={{ background: 'rgba(0,0,0,0.06)', height: '4px', borderRadius: '2px' }} />
                    <div style={{ background: 'rgba(0,0,0,0.06)', height: '4px', borderRadius: '2px', width: '95%' }} />
                    <div style={{ background: 'rgba(0,0,0,0.06)', height: '4px', borderRadius: '2px', width: '88%' }} />
                    <div style={{ background: 'rgba(0,0,0,0.06)', height: '4px', borderRadius: '2px', width: '92%' }} />
                    <div style={{ background: 'rgba(0,0,0,0.06)', height: '4px', borderRadius: '2px', width: '78%' }} />
                    <div style={{ background: 'rgba(0,0,0,0.06)', height: '4px', borderRadius: '2px', width: '85%' }} />
                    <div style={{ background: 'rgba(0,0,0,0.06)', height: '4px', borderRadius: '2px', width: '90%' }} />
                    <div style={{ background: 'rgba(0,0,0,0.06)', height: '4px', borderRadius: '2px', width: '65%' }} />
                  </div>
                  <p className="text-[14px] font-bold mt-6 mb-3" style={{ color: '#8B9DAF' }}>Market Analysis</p>
                  <div className="space-y-1.5">
                    <div style={{ background: 'rgba(0,0,0,0.06)', height: '4px', borderRadius: '2px' }} />
                    <div style={{ background: 'rgba(0,0,0,0.06)', height: '4px', borderRadius: '2px', width: '82%' }} />
                    <div style={{ background: 'rgba(0,0,0,0.06)', height: '4px', borderRadius: '2px', width: '95%' }} />
                    <div style={{ background: 'rgba(0,0,0,0.06)', height: '4px', borderRadius: '2px', width: '70%' }} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between text-[7px] text-black/30 font-mono border-t border-black/5">
                  <span>harchcorp.com/research</span>
                  <span>Building in Public</span>
                  <span>Page 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Structure PDF */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { page: '01', title: 'Cover', desc: 'Palette Karim, diagonal cut, metrics' },
              { page: '02', title: 'Executive Summary', desc: 'Résumé + tableau key metrics' },
              { page: '03', title: 'Market Analysis', desc: 'Taille, croissance, concurrents' },
              { page: '04', title: 'Financial Model', desc: 'CAPEX, revenus, EBITDA, TRI' },
              { page: '05', title: 'Subsidies', desc: 'FDE, Tamwilcom, GIZ, aides' },
              { page: '06', title: 'Risks', desc: '5 risques + mitigations' },
              { page: '07', title: 'Execution Plan', desc: 'Timeline trimestriel' },
              { page: '08', title: 'Contacts', desc: 'Institutions + organismes' },
              { page: '09', title: 'Disclaimer', desc: 'Sources, méthodologie, licence' },
            ].map((p) => (
              <div key={p.page} className="border border-white/[0.06] rounded-md p-4 bg-[#0D0D0D]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[20px] font-bold font-mono" style={{ color: '#8B9DAF' }}>{p.page}</span>
                  <span className="text-[14px] font-bold text-white">{p.title}</span>
                </div>
                <p className="text-[11px] text-white/40">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LAYOUT PATTERNS */}
      <section className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 mb-2">
              <Layout size={16} className="text-[#8B9DAF]" />
              <p className="section-label text-[#8B9DAF]">Layouts</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-12">Patterns de layout</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hero pattern */}
            <div className="border border-white/[0.06] rounded-lg p-6 bg-[#111]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-3 font-mono">Hero · Plein écran</p>
              <div className="bg-[#0A0A0A] rounded-md p-8 relative overflow-hidden" style={{ minHeight: '200px' }}>
                <div className="absolute top-0 right-0 w-2/3 h-full" style={{ background: '#8B9DAF', clipPath: 'polygon(100% 0, 100% 100%, 0 30%, 0 0)', opacity: 0.9 }} />
                <div className="relative z-10">
                  <p className="text-[8px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] font-mono mb-2">LABEL</p>
                  <p className="text-[20px] font-extrabold text-white leading-tight">Heading principal</p>
                  <p className="text-[10px] text-white/50 mt-2">Sous-titre descriptif</p>
                  <div className="mt-4 flex gap-2">
                    <span className="px-3 py-1 bg-[#8B9DAF] text-white text-[8px] font-bold rounded">CTA Primary</span>
                    <span className="px-3 py-1 border border-white/20 text-white text-[8px] font-bold rounded">CTA Secondary</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Card grid pattern */}
            <div className="border border-white/[0.06] rounded-lg p-6 bg-[#111]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-3 font-mono">Card Grid · 3 colonnes</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-[#0A0A0A] rounded-md p-3 border border-white/[0.06]">
                    <div className="w-6 h-6 rounded-md bg-[#8B9DAF]/20 border border-[#8B9DAF]/30 mb-2" />
                    <div className="h-2 bg-white/10 rounded mb-1" />
                    <div className="h-2 bg-white/5 rounded w-2/3" />
                  </div>
                ))}
              </div>
            </div>
            {/* Table pattern */}
            <div className="border border-white/[0.06] rounded-lg p-6 bg-[#111]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-3 font-mono">Tableau · Données</p>
              <div className="bg-[#0A0A0A] rounded-md overflow-hidden">
                <div className="flex gap-2 p-2 bg-[#0A0A0A] border-b border-white/10">
                  <div className="flex-1 h-2 bg-white/10 rounded" />
                  <div className="flex-1 h-2 bg-[#8B9DAF]/30 rounded" />
                  <div className="flex-1 h-2 bg-white/5 rounded" />
                </div>
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-2 p-2 border-b border-white/[0.03]">
                    <div className="flex-1 h-2 bg-white/5 rounded" />
                    <div className="flex-1 h-2 bg-[#8B9DAF]/20 rounded" />
                    <div className="flex-1 h-2 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            </div>
            {/* Timeline pattern */}
            <div className="border border-white/[0.06] rounded-lg p-6 bg-[#111]">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-3 font-mono">Timeline · Jalons</p>
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: n === 1 ? '#8B9DAF' : '#8B9DAF' }} />
                    <div className="flex-1 h-2 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION DIVIDER */}
      <section className="py-16 px-6 border-t border-white/[0.04] bg-[#0D0D0D]">
        <div className="max-w-[1200px] mx-auto text-center">
          <FadeIn>
            <p className="section-label text-[#8B9DAF] mb-4">Réutilisation</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Ce guide est la référence.</h2>
            <p className="max-w-2xl mx-auto text-[14px] text-white/50 leading-[1.7] mb-8">
              Tous les PDFs, pages web, présentations, et communications Harch Corp utilisent ces formats.
              Si une création ne respecte pas ce guide, elle n'est pas publiable.
              URL permanente : harchcorp.com/style-guide
            </p>
            <Link href="/research" className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B9DAF] text-white text-[14px] font-bold rounded-md hover:bg-[#8B9DAF] transition-all">
              <Download size={14} />
              Voir les PDFs (template appliqué)
              <ArrowRight size={14} />
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
// v2
// Cache bust 1783192929
