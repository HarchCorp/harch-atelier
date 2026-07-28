'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sun, Zap, TrendingDown, Shield, Clock, CheckCircle2, ArrowRight,
  Phone, Mail, Building2, Factory, Hotel, Wheat, Server,
  Calculator, FileText, Award, Leaf, MapPin, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function EnergyCommercialClient() {
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    facility: '',
    consumption: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden border-b border-white/8">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 border-amber-500/30 text-amber-400">
              <Sun className="mr-1.5 h-3 w-3" />
              Harch Energy — Division Solaire B2B
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
              Réduisez votre facture électrique<br />
              <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                de 40 à 60%
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-zinc-400 md:text-xl">
              Installation solaire clé-en-main pour entreprises au Maroc.
              EPC ou PPA — sans investissement initial. Devis gratuit en 48h.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#contact">
                <Button size="lg" className="bg-amber-500 text-black hover:bg-amber-400">
                  Demander un devis gratuit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="#solutions">
                <Button size="lg" variant="outline">
                  Voir nos solutions
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {[
              { icon: TrendingDown, value: '40-60%', label: 'Réduction facture', color: 'text-emerald-400' },
              { icon: Clock, value: '6-8 mois', label: 'Délai de livraison', color: 'text-amber-400' },
              { icon: Shield, value: '10 ans', label: 'Garantie installation', color: 'text-cyan-400' },
              { icon: Leaf, value: '100%', label: 'Énergie renouvelable', color: 'text-violet-400' },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-sm">
                <stat.icon className={`mx-auto mb-2 h-6 w-6 ${stat.color}`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SOLUTIONS ═══ */}
      <section id="solutions" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Deux modèles, un objectif : votre indépendance énergétique</h2>
          <p className="mt-3 text-zinc-400 max-w-2xl mx-auto">
            Choisissez le modèle qui correspond à votre stratégie financière et votre profil de risque.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* EPC */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent p-8"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
                <Building2 className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">EPC — Clé-en-main</h3>
                <p className="text-sm text-cyan-400">Vous achetez, on installe</p>
              </div>
            </div>
            <p className="mb-6 text-zinc-400">
              Vous achetez votre centrale solaire. Harch Energy conçoit, construit et livre
              une installation complète. Vous êtes propriétaire et profitez de 25+ ans d'énergie gratuite.
            </p>

            <div className="mb-6 space-y-3">
              {[
                'Paiement échelonné : 30% signature, 30% démarrage, 30% mi-chantier, 10% réception',
                'Centrale 100% vôtre à la livraison',
                'Subventions FDE jusqu\'à 1,5M MAD',
                'IS 0% en TFZ (Tanger Free Zone)',
                'Amortissement matériel sur 5-7 ans',
                'Garantie 10 ans sur l\'installation, 25 ans sur les panneaux',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>

            <div className="mb-6 rounded-xl bg-white/5 p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Exemple — Centrale 6 MWp</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-zinc-500">CAPEX total</span>
                  <div className="font-mono text-white">~31M MAD</div>
                </div>
                <div>
                  <span className="text-zinc-500">Subvention FDE</span>
                  <div className="font-mono text-emerald-400">-1,5M MAD</div>
                </div>
                <div>
                  <span className="text-zinc-500">Économie annuelle</span>
                  <div className="font-mono text-emerald-400">~8-12M MAD</div>
                </div>
                <div>
                  <span className="text-zinc-500">ROI</span>
                  <div className="font-mono text-emerald-400">3-4 ans</div>
                </div>
              </div>
            </div>

            <a href="#contact">
              <Button className="w-full bg-cyan-500 text-black hover:bg-cyan-400">
                Demander un devis EPC
              </Button>
            </a>
          </motion.div>

          {/* PPA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-8"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Sun className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">PPA — Sans investissement</h3>
                <p className="text-sm text-amber-400">On finance, vous économisez</p>
              </div>
            </div>
            <p className="mb-6 text-zinc-400">
              Harch Energy finance, construit et exploite la centrale sur votre site.
              Vous achetez l'électricité à un tarif inférieur à ONEE. 0 MAD à investir.
            </p>

            <div className="mb-6 space-y-3">
              {[
                '0 MAD d\'investissement initial',
                'Tarif kWh garanti 20-30% moins cher que ONEE',
                'Contrat 15-20 ans avec prix fixe ou indexé',
                'Maintenance et assurance incluses',
                'Monitoring temps réel de votre production',
                'Option d\'achat de la centrale en fin de contrat',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>

            <div className="mb-6 rounded-xl bg-white/5 p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Exemple — Centrale 6 MWp</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-zinc-500">Investissement</span>
                  <div className="font-mono text-emerald-400">0 MAD</div>
                </div>
                <div>
                  <span className="text-zinc-500">Tarif kWh</span>
                  <div className="font-mono text-amber-400">~0,72 MAD</div>
                </div>
                <div>
                  <span className="text-zinc-500">Économie annuelle</span>
                  <div className="font-mono text-emerald-400">~3-5M MAD</div>
                </div>
                <div>
                  <span className="text-zinc-500">Durée contrat</span>
                  <div className="font-mono text-white">20 ans</div>
                </div>
              </div>
            </div>

            <a href="#contact">
              <Button className="w-full bg-amber-500 text-black hover:bg-amber-400">
                Demander un devis PPA
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTEURS ═══ */}
      <section className="border-y border-white/8 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Solutions par secteur</h2>
            <p className="mt-3 text-zinc-400">Adaptées aux contraintes de votre industrie</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Factory, title: 'Industriel', desc: 'Cimenteries, agroalimentaire, textile, sidérurgie',
                desc2: 'Autoconsommation 1-20 MWp', color: 'text-cyan-400', bg: 'bg-cyan-500/10',
              },
              {
                icon: Hotel, title: 'Hôtellerie', desc: 'Hôtels, resorts, complexes touristiques',
                desc2: 'Toiture + parking solaire 100kWp-2MWp', color: 'text-amber-400', bg: 'bg-amber-500/10',
              },
              {
                icon: Wheat, title: 'Agriculture', desc: 'Pompage irrigation, serres, coopératives',
                desc2: 'Pompage solaire 5-500 kWp', color: 'text-emerald-400', bg: 'bg-emerald-500/10',
              },
              {
                icon: Server, title: 'Datacenter', desc: 'Centres de données, télécoms',
                desc2: 'Alimentation 1-100 MWp PPA', color: 'text-violet-400', bg: 'bg-violet-500/10',
              },
            ].map((sector, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20 transition-all"
              >
                <div className={`mb-4 inline-flex rounded-xl ${sector.bg} p-3`}>
                  <sector.icon className={`h-6 w-6 ${sector.color}`} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{sector.title}</h3>
                <p className="text-sm text-zinc-400">{sector.desc}</p>
                <p className={`mt-2 text-xs font-mono ${sector.color}`}>{sector.desc2}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROCESS ═══ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Comment ça marche</h2>
          <p className="mt-3 text-zinc-400">De premier contact à la mise en service en 6-8 mois</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {[
            { num: '01', title: 'Audit & Devis', desc: 'Visite site, analyse consommation, étude technique. Devis détaillé sous 48h.', duration: '1-2 semaines' },
            { num: '02', title: 'Financement', desc: 'Dépôt dossier FDE, banque, TFZ. Nous gérons 100% des démarches administratives.', duration: '4-8 semaines' },
            { num: '03', title: 'Construction', desc: 'Génie civil, structures, pose panneaux, raccordement ONEE. Supervision hebdomadaire.', duration: '4-6 mois' },
            { num: '04', title: 'Mise en service', desc: 'Tests, commissioning, formation équipe. Centrale opérationnelle et garantie 10 ans.', duration: '2 semaines' },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-3 text-4xl font-bold text-white/10">{step.num}</div>
              <h3 className="mb-2 text-lg font-bold text-white">{step.title}</h3>
              <p className="text-sm text-zinc-400">{step.desc}</p>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3 text-amber-400" />
                <span className="font-mono text-amber-400">{step.duration}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ POURQUOI HARCH ═══ */}
      <section className="border-y border-white/8 bg-gradient-to-br from-amber-500/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-white md:text-4xl">Pourquoi Harch Energy ?</h2>
              <p className="mt-4 text-zinc-400">
                Nous ne sommes pas un installateur de plus. Nous sommes une division de Harch Corp,
                conglomérat industriel marocain. Notre réputation est notre garantie.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { icon: Award, title: 'Marque Harch Corp', desc: 'Backing d\'un conglomérat industriel — pas un petit installateur' },
                  { icon: Shield, title: 'Garantie 10 ans', desc: 'Garantie décennale sur installation + 25 ans sur panneaux Tier-1' },
                  { icon: Zap, title: 'Subventions gérées', desc: 'FDE, Innov Invest, Intelika — nous montons 100% des dossiers' },
                  { icon: FileText, title: '100% administratif', desc: 'Permis ONEE, raccordement, TFZ — tout est inclus' },
                  { icon: Calculator, title: 'Financement assisté', desc: 'Partenariat banques marocaines : crédit à 5,5% sur 10 ans' },
                  { icon: MapPin, title: 'Présence nationale', desc: 'Équipes à Casablanca, Tanger, Marrakech, Dakhla' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/5">
                      <item.icon className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{item.title}</div>
                      <div className="text-sm text-zinc-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <h3 className="mb-6 text-xl font-bold text-white">Comparaison Harch Energy vs Installateur local</h3>
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="p-3 text-left text-zinc-400">Critère</th>
                        <th className="p-3 text-center text-amber-400">Harch Energy</th>
                        <th className="p-3 text-center text-zinc-500">Installateur local</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Garantie installation', '10 ans', '1-2 ans'],
                        ['Subventions FDE', 'Gérées (1,5M MAD)', 'Non inclus'],
                        ['Permis ONEE', 'Inclus', '+200K MAD'],
                        ['Financement banque', 'Assisté (5,5%)', 'Vous gérez'],
                        ['Panneaux', 'Tier-1 (Jinko/LONGi)', 'Variable'],
                        ['Monitoring', 'App mobile inclus', 'Non inclus'],
                        ['SAV', '24/7 équipe nationale', 'Variable'],
                        ['Backing financier', 'Harch Corp', 'Auto-entrepreneur'],
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="p-3 text-zinc-400">{row[0]}</td>
                          <td className="p-3 text-center font-mono text-emerald-400">{row[1]}</td>
                          <td className="p-3 text-center font-mono text-zinc-500">{row[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTACT FORM ═══ */}
      <section id="contact" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Demandez votre devis gratuit</h2>
          <p className="mt-3 text-zinc-400">Réponse sous 48h. Étude technique offerte. Sans engagement.</p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-12 text-center"
          >
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-400" />
            <h3 className="mb-2 text-2xl font-bold text-white">Demande envoyée !</h3>
            <p className="text-zinc-400">
              Notre équipe vous contacte sous 48h pour planifier une visite technique gratuite.
            </p>
            <p className="mt-4 text-sm text-zinc-500">
              Email : energy@harchcorp.com · Tél : +212 684 440 682
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-zinc-400">Nom de l'entreprise *</label>
                <input
                  required
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none"
                  placeholder="Votre entreprise"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400">Votre nom *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none"
                  placeholder="Nom complet"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400">Email *</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none"
                  placeholder="email@entreprise.ma"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400">Téléphone *</label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none"
                  placeholder="+212 6 XX XX XX XX"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400">Type d'établissement</label>
                <select
                  value={formData.facility}
                  onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-500/50 focus:outline-none"
                >
                  <option value="" className="bg-zinc-900">Sélectionner...</option>
                  <option value="industriel" className="bg-zinc-900">Industriel (usine, cimenterie)</option>
                  <option value="hotel" className="bg-zinc-900">Hôtel / Resort</option>
                  <option value="agricole" className="bg-zinc-900">Agriculture / Coopérative</option>
                  <option value="datacenter" className="bg-zinc-900">Datacenter / Télécom</option>
                  <option value="autre" className="bg-zinc-900">Autre</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-zinc-400">Consommation mensuelle (MAD)</label>
                <input
                  type="text"
                  value={formData.consumption}
                  onChange={(e) => setFormData({ ...formData, consumption: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none"
                  placeholder="ex: 500000 MAD/mois"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm text-zinc-400">Message (optionnel)</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none"
                placeholder="Parlez-nous de votre projet..."
              />
            </div>
            <div className="mt-6">
              <Button type="submit" size="lg" className="w-full bg-amber-500 text-black hover:bg-amber-400">
                Envoyer ma demande
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="mt-4 text-center text-xs text-zinc-600">
              En soumettant ce formulaire, vous acceptez d'être contacté par Harch Energy.
              Vos données ne sont jamais partagées avec des tiers.
            </p>
          </form>
        )}
      </section>

      {/* ═══ FOOTER CTA ═══ */}
      <section className="border-t border-white/8 bg-gradient-to-br from-amber-500/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h3 className="text-2xl font-bold text-white">Prêt à réduire votre facture ?</h3>
              <p className="text-zinc-400">Contactez-nous dès aujourd'hui. Devis gratuit sous 48h.</p>
            </div>
            <div className="flex gap-4">
              <a href="tel:+212684440682" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">
                <Phone className="h-4 w-4 text-amber-400" />
                +212 684 440 682
              </a>
              <a href="mailto:energy@harchcorp.com" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">
                <Mail className="h-4 w-4 text-amber-400" />
                energy@harchcorp.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
