'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sun, Zap, Shield, TrendingDown, Clock, CheckCircle2, Phone } from 'lucide-react';

export default function EnergyLanding() {
  const [consumption, setConsumption] = useState('500000');
  const numConso = parseInt(consumption) || 0;
  const monthlySavings = Math.round(numConso * 0.5);
  const yearlySavings = monthlySavings * 12;

  return (
    <div className="bg-white text-neutral-900">

      {/* ═══ 1. HERO — Tesla-style full-bleed ═══ */}
      <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/sections/energy-solar-farm.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Harch Energy /0.3
            </p>
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-7xl lg:text-8xl">
              Votre toiture<br />produit de l'argent.<br />
              <span className="text-emerald-400">Pas des factures.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-white/70 md:text-xl">
              Coupez votre facture ONEE de 40 à 60%. EPC ou PPA — 0 MAD à investir.
              Plus de 500 entreprises marocaines ont déjà basculé.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/quote?vertical=energy"
                className="inline-flex items-center gap-2 bg-white px-8 py-4 text-sm font-semibold uppercase tracking-wider text-neutral-900 transition-colors hover:bg-neutral-100"
              >
                Devis gratuit 48h
                <ArrowRight size={16} />
              </Link>
              <a
                href="tel:+212684440682"
                className="inline-flex items-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
              >
                <Phone size={16} />
                +212 684 440 682
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 2. STATS — Tesla-style 3 columns ═══ */}
      <section className="bg-neutral-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 text-center">
            {[
              { value: '60%', label: 'Réduction facture ONEE max' },
              { value: '3 ans', label: 'ROI modèle EPC' },
              { value: '500+', label: 'Entreprises équipées' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-5xl font-bold tracking-tight text-emerald-400 md:text-6xl">{stat.value}</div>
                <div className="mt-3 text-sm text-neutral-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. SECTION 1 — Image left, text right (Tesla-style) ═══ */}
      <section className="py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-[4/3] overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/sections/energy-wind-farm.jpg')" }}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">EPC</p>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Vous achetez.<br />On s'occupe de tout.
            </h2>
            <div className="mt-6 h-px w-12 bg-neutral-300" />
            <p className="mt-6 text-lg leading-relaxed text-neutral-600">
              Étude, permis ONEE, génie civil, pose panneaux Tier-1, raccordement, commissioning.
              Paiement 30/30/30/10. Subventions FDE 1,5M MAD déduites. IS 0% TFZ.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-neutral-600">
              La centrale est 100% vôtre à la livraison. Électricité gratuite pendant 25 ans.
              ROI 3-4 ans. Actif sur votre bilan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['Subventions FDE gérées', 'Permis ONEE inclus', 'Garantie 10 ans', 'Monitoring 24/7'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-700">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 4. SECTION 2 — Text left, image right (alternance Tesla) ═══ */}
      <section className="bg-neutral-50 py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">PPA</p>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              0 MAD.<br />Basculez aujourd'hui.
            </h2>
            <div className="mt-6 h-px w-12 bg-neutral-300" />
            <p className="mt-6 text-lg leading-relaxed text-neutral-600">
              On finance. On construit. On exploite. Vous payez 0,60-0,80 MAD/kWh
              (vs 1,20-1,50 ONEE). Contrat 15-20 ans. 0 risque.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-neutral-600">
              Maintenance, assurance, monitoring — tout inclus.
              Économisez 20-30% dès le jour 1, sans débourser 1 dirham.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <div className="text-2xl font-bold text-neutral-900">0 MAD</div>
                <div className="text-sm text-neutral-500">À investir</div>
              </div>
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <div className="text-2xl font-bold text-emerald-600">-30%</div>
                <div className="text-sm text-neutral-500">vs facture ONEE</div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative order-1 aspect-[4/3] overflow-hidden lg:order-2"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/sections/energy-hydrogen.jpg')" }}
            />
          </motion.div>
        </div>
      </section>

      {/* ═══ 5. CALCULATOR — Tesla-style interactive ═══ */}
      <section className="bg-neutral-900 py-24 md:py-32 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Simulateur</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            Voyez combien vous économisez
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-400">
            Entrez votre facture ONEE mensuelle. Calcul instantané.
          </p>

          <div className="mx-auto mt-12 max-w-md">
            <div className="mb-2 text-left text-sm text-neutral-400">Facture ONEE mensuelle (MAD)</div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="50000"
                max="2000000"
                step="50000"
                value={consumption}
                onChange={(e) => setConsumption(e.target.value)}
                className="w-full accent-emerald-400"
              />
            </div>
            <div className="mt-2 text-left text-2xl font-bold text-white">
              {parseInt(consumption).toLocaleString('fr-FR')} MAD/mois
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-6">
              <div className="text-3xl font-bold text-emerald-400">{monthlySavings.toLocaleString('fr-FR')}</div>
              <div className="mt-1 text-sm text-neutral-400">MAD économisés / mois</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-6">
              <div className="text-3xl font-bold text-emerald-400">{yearlySavings.toLocaleString('fr-FR')}</div>
              <div className="mt-1 text-sm text-neutral-400">MAD économisés / an</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-6">
              <div className="text-3xl font-bold text-amber-400">{(yearlySavings * 25 / 1000000).toFixed(1)}M</div>
              <div className="mt-1 text-sm text-neutral-400">MAD sur 25 ans</div>
            </div>
          </div>

          <div className="mt-8 text-sm text-neutral-500">
            Estimation basée sur 50% d'économie. Devis personnalisé gratuit sous 48h.
          </div>
        </div>
      </section>

      {/* ═══ 6. PROCESS — Tesla-style timeline ═══ */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Process</p>
          <h2 className="mb-16 text-center text-3xl font-bold tracking-tight md:text-5xl">
            De l'appel à l'économie
          </h2>

          <div className="space-y-0">
            {[
              { step: '01', title: 'Appelez', desc: 'On vous dit combien vous économisez en 10 min. Aucun engagement.', time: 'Jour 1' },
              { step: '02', title: 'Audit gratuit', desc: 'Visite technique gratuite. Devis détaillé sous 48h avec chiffres précis.', time: '48h' },
              { step: '03', title: 'On s\'occupe de tout', desc: 'FDE, banque, permis ONEE, TFZ. Vous n\'avez aucun paperwork.', time: 'Semaines 3-8' },
              { step: '04', title: 'Construction', desc: 'Génie civil, panneaux Tier-1, raccordement. Photos hebdo. Prix fixe.', time: 'Mois 3-7' },
              { step: '05', title: 'Vous économisez', desc: 'Centrale opérationnelle. Facture ONEE baisse de 40-60%. Immédiatement.', time: 'Mois 8' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-8 border-b border-neutral-100 py-8 last:border-0"
              >
                <div className="flex-shrink-0">
                  <div className="text-4xl font-bold text-neutral-200">{item.step}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-4">
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">{item.time}</span>
                  </div>
                  <p className="mt-2 text-neutral-600">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 7. DARK SECTION — Why Harch (Tesla product showcase style) ═══ */}
      <section className="bg-neutral-900 py-24 md:py-32 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Pourquoi Harch</p>
          <h2 className="mb-16 text-3xl font-bold tracking-tight md:text-5xl">
            La différence Harch Energy
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              { icon: Shield, title: 'Backing Harch Corp', desc: "Pas un petit installateur — un conglomérat industriel. On sera là dans 25 ans." },
              { icon: Zap, title: 'Subventions FDE — 90% réussite', desc: '1,5M MAD récupérés pour vous. 100% du paperwork géré. Un installateur local ne fait pas ça.' },
              { icon: CheckCircle2, title: 'Prix fixe garanti', desc: 'Pas de frais cachés. Permis ONEE inclus. Le prix du devis est le prix final.' },
              { icon: Clock, title: 'Monitoring 24/7', desc: 'App mobile offerte. SAV 24/7 équipe nationale. Intervention 48h dans tout le Maroc.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center border border-white/20">
                    <item.icon size={20} className="text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-neutral-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8. FINAL CTA — Tesla-style asymmetric ═══ */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link
              href="/quote?vertical=energy"
              className="block bg-emerald-500 p-10 text-white transition-colors hover:bg-emerald-600 md:col-span-2 md:p-14"
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/70">Harch Energy</p>
              <h3 className="text-2xl font-bold md:text-4xl">Devis gratuit sous 48h</h3>
              <p className="mt-4 text-white/80">Audit technique gratuit. Chiffres précis. Sans engagement.</p>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold">
                Demander mon devis <ArrowRight size={16} />
              </div>
            </Link>
            <a
              href="tel:+212684440682"
              className="block bg-neutral-900 p-10 text-white transition-colors hover:bg-neutral-800 md:p-14"
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-emerald-400">Appel direct</p>
              <h3 className="text-2xl font-bold">Appelez</h3>
              <p className="mt-4 text-neutral-400">On vous dit combien vous économisez en 10 min.</p>
              <div className="mt-6 font-mono text-sm font-semibold text-emerald-400">
                +212 684 440 682
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
