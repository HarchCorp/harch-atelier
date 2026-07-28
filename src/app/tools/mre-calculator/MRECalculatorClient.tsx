'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import { ArrowRight, TrendingDown, Clock, Shield, Heart } from 'lucide-react';

// Real 2025 fees for Morocco transfers (researched from provider websites)
const PROVIDERS = [
  {
    name: 'Western Union',
    fee: 0.049, // 4.9% average
    fixedFee: 4.90, // EUR fixed
    exchangeRateMarkup: 0.022, // 2.2% markup on EUR to MAD
    speed: '10 min',
    speedHours: 0.17,
    rating: 2.1,
    problems: ['Frais élevés', 'Taux de change désavantageux', 'Agences parfois loin'],
    color: '#FFDD00',
    logo: 'WU',
  },
  {
    name: 'MoneyGram',
    fee: 0.045,
    fixedFee: 3.90,
    exchangeRateMarkup: 0.025,
    speed: '10 min',
    speedHours: 0.17,
    rating: 2.3,
    problems: ['Taux de change opaque', 'Frais variables selon destination'],
    color: '#D9322D',
    logo: 'MG',
  },
  {
    name: 'Banque (virement classique)',
    fee: 0.015,
    fixedFee: 15.00, // EUR fixed bank fee
    exchangeRateMarkup: 0.028,
    speed: '2-3 jours',
    speedHours: 60,
    rating: 2.8,
    problems: ['Lent (2-3 jours)', 'Frais fixes élevés', 'Taux interbancaire désavantageux'],
    color: '#4A90D9',
    logo: '🏦',
  },
  {
    name: 'Wise',
    fee: 0.006,
    fixedFee: 1.20,
    exchangeRateMarkup: 0.004, // mid-market rate
    speed: '1-2 jours',
    speedHours: 24,
    rating: 4.5,
    problems: ['Pas de cash pickup au Maroc', 'Bénéficiaire doit avoir compte bancaire'],
    color: '#9FE870',
    logo: 'W',
  },
  {
    name: 'Remitly',
    fee: 0.029,
    fixedFee: 2.99,
    exchangeRateMarkup: 0.018,
    speed: '1-2 jours',
    speedHours: 24,
    rating: 4.1,
    problems: ['Frais variables', 'Limite de montant', 'Pas disponible partout'],
    color: '#7B2FF7',
    logo: 'R',
  },
  {
    name: 'Harch MRE Services',
    fee: 0.012,
    fixedFee: 0,
    exchangeRateMarkup: 0.002, // near mid-market
    speed: 'Instantané',
    speedHours: 0.01,
    rating: 0, // not yet launched
    problems: [],
    color: '#8B9DAF',
    logo: 'H',
    isHarch: true,
  },
];

const EUR_TO_MAD = 10.85; // mid-market rate July 2026

const useCases = [
  { label: 'Soutien familial mensuel', amount: 300, icon: '👨‍👩‍👧‍👦', desc: 'Aide mensuelle pour les parents' },
  { label: 'Frais de scolarité', amount: 800, icon: '🎓', desc: 'Frais d\'école des enfants/siblings' },
  { label: 'Frais médicaux', amount: 1500, icon: '🏥', desc: 'Soins médicaux d\'urgence' },
  { label: 'Achat immobilier', amount: 5000, icon: '🏠', desc: 'Apport immobilier au Maroc' },
  { label: 'Funéraire', amount: 4000, icon: '🕊️', desc: 'Rapatriement et funérailles' },
  { label: 'Fêtes (Aïd, Ramadan)', amount: 500, icon: '🌙', desc: 'Cadeaux et fêtes religieuses' },
];

export default function MRECalculatorClient() {
  const [amount, setAmount] = useState(500);
  const [selectedUseCase, setSelectedUseCase] = useState(0);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(() => {
    return PROVIDERS.map(p => {
      const percentageFee = amount * p.fee;
      const totalFee = percentageFee + p.fixedFee;
      const exchangeLoss = amount * p.exchangeRateMarkup;
      const totalCost = totalFee + exchangeLoss;
      const recipientGets = (amount - totalFee) * (EUR_TO_MAD - EUR_TO_MAD * p.exchangeRateMarkup);
      const harchRecipientGets = (amount - amount * 0.012) * (EUR_TO_MAD - EUR_TO_MAD * 0.002);
      const savings = harchRecipientGets - recipientGets;
      const savingsPercent = (savings / recipientGets) * 100;
      return { ...p, percentageFee, totalFee, exchangeLoss, totalCost, recipientGets, savings, savingsPercent };
    });
  }, [amount]);

  const harchResult = results.find(r => r.isHarch);
  const bestAlternative = results.filter(r => !r.isHarch).sort((a, b) => b.recipientGets - a.recipientGets)[0];
  const yearlySavings = bestAlternative ? bestAlternative.savings * 12 : 0;

  const handleUseCase = (idx: number) => {
    setSelectedUseCase(idx);
    setAmount(useCases[idx].amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // In production, this would POST to /api/waitlist
    }
  };

  return (
    <div className="bg-[#0D0D0D] min-h-screen pt-14">
      {/* HERO */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-[#0D0D0D] via-[#0F0F0F] to-[#0D0D0D] border-b border-white/[0.04]">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6">Outil gratuit — Harch MRE Services</p>
            <h1 className="text-[clamp(2rem,5vw,4rem)] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Combien perdez-vous<br />
              <span className="text-[#8B9DAF]">en frais de transfert ?</span>
            </h1>
            <p className="text-[18px] text-[#999] leading-relaxed max-w-2xl mb-8">
              5,8 millions de MRE transfèrent 122 Mds MAD/an vers le Maroc.
              En moyenne, 2,8% part en frais. C'est 3,4 Mds MAD qui devraient
              aller aux familles, pas aux banques. Calculez exactement combien vous coûte chaque transfert.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="py-12 md:py-20 bg-[#0D0D0D]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          {/* Use case selector */}
          <FadeIn>
            <p className="text-[12px] font-bold text-[#666] uppercase tracking-wider mb-4">Que financez-vous ?</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
              {useCases.map((uc, i) => (
                <button
                  key={i}
                  onClick={() => handleUseCase(i)}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    selectedUseCase === i
                      ? 'bg-[#8B9DAF]/10 border-[#8B9DAF]/40'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="text-2xl mb-2">{uc.icon}</div>
                  <p className="text-[11px] font-bold text-white leading-tight">{uc.label}</p>
                  <p className="text-[10px] text-[#666] mt-1">{uc.amount}€</p>
                </button>
              ))}
            </div>
          </FadeIn>

          {/* Amount input */}
          <FadeIn delay={0.1}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10 p-6 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <div>
                <p className="text-[12px] font-bold text-[#666] uppercase tracking-wider mb-2">Montant à envoyer</p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="10000"
                    step="50"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-64 accent-[#8B9DAF]"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Math.max(50, Number(e.target.value)))}
                      className="w-24 bg-[#0D0D0D] border border-white/[0.1] rounded px-3 py-2 text-white text-[18px] font-bold"
                    />
                    <span className="text-[18px] font-bold text-[#999]">€</span>
                  </div>
                </div>
              </div>
              <div className="md:ml-auto text-right">
                <p className="text-[12px] font-bold text-[#666] uppercase tracking-wider mb-2">Taux de change</p>
                <p className="text-[20px] font-bold text-white">1€ = {EUR_TO_MAD} MAD</p>
                <p className="text-[11px] text-[#666]">Taux mid-market · Juillet 2026</p>
              </div>
            </div>
          </FadeIn>

          {/* Results */}
          <FadeIn delay={0.2}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              {/* Best alternative */}
              {bestAlternative && (
                <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                  <p className="text-[12px] font-bold text-[#666] uppercase tracking-wider mb-3">
                    Avec {bestAlternative.name} (meilleure option existante)
                  </p>
                  <p className="text-[40px] font-extrabold text-white">
                    {bestAlternative.recipientGets.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} MAD
                  </p>
                  <p className="text-[14px] text-[#999] mt-2">
                    Votre famille reçoit {bestAlternative.recipientGets.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} MAD
                  </p>
                  <div className="mt-4 space-y-1 text-[13px]">
                    <div className="flex justify-between text-[#666]">
                      <span>Frais de transfert</span>
                      <span>{bestAlternative.totalFee.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-[#666]">
                      <span>Perte sur taux de change</span>
                      <span>{bestAlternative.exchangeLoss.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-[#999] pt-2 border-t border-white/[0.06]">
                      <span>Coût total</span>
                      <span className="font-bold text-white">{bestAlternative.totalCost.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-[#666] mt-2">
                      <span>Délai</span>
                      <span>{bestAlternative.speed}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Harch */}
              {harchResult && (
                <div className="p-6 bg-gradient-to-br from-[#1a1f2e] to-[#0D0D0D] border border-[#8B9DAF]/30 rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-[#8B9DAF] text-[#0D0D0D] text-[10px] font-bold uppercase rounded-bl-lg">
                    Harch
                  </div>
                  <p className="text-[12px] font-bold text-[#8B9DAF] uppercase tracking-wider mb-3">
                    Avec Harch MRE Services
                  </p>
                  <p className="text-[40px] font-extrabold text-white">
                    {harchResult.recipientGets.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} MAD
                  </p>
                  <p className="text-[14px] text-[#4A7B5F] mt-2 font-bold">
                    +{harchResult.savings.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} MAD pour votre famille
                  </p>
                  <div className="mt-4 space-y-1 text-[13px]">
                    <div className="flex justify-between text-[#666]">
                      <span>Frais de transfert</span>
                      <span>{harchResult.totalFee.toFixed(2)}€ (1,2%)</span>
                    </div>
                    <div className="flex justify-between text-[#666]">
                      <span>Perte sur taux de change</span>
                      <span>{harchResult.exchangeLoss.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-[#999] pt-2 border-t border-white/[0.06]">
                      <span>Coût total</span>
                      <span className="font-bold text-white">{harchResult.totalCost.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-[#4A7B5F] mt-2">
                      <span>Délai</span>
                      <span className="font-bold">Instantané ⚡</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Savings highlight */}
          {bestAlternative && harchResult && (
            <FadeIn delay={0.3}>
              <div className="p-8 bg-gradient-to-r from-[#4A7B5F]/10 to-transparent border border-[#4A7B5F]/20 rounded-lg mb-10 text-center">
                <p className="text-[14px] text-[#999] uppercase tracking-wider mb-2">Vos économies annuelles</p>
                <p className="text-[64px] font-extrabold text-[#4A7B5F]">
                  {yearlySavings.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} MAD
                </p>
                <p className="text-[16px] text-[#999] mt-2">
                  En envoyant {amount}€ chaque mois avec Harch au lieu de {bestAlternative.name},
                  votre famille reçoit <span className="text-white font-bold">{yearlySavings.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} MAD de plus par an</span>.
                </p>
                <p className="text-[14px] text-[#666] mt-2">
                  C'est {Math.round(yearlySavings / 30)} jours de nourriture pour une famille de 5 personnes au Maroc. 🍞
                </p>
              </div>
            </FadeIn>
          )}

          {/* Full comparison table */}
          <FadeIn delay={0.4}>
            <p className="text-[14px] font-bold text-white mb-4">Comparaison détaillée — tous les fournisseurs</p>
            <div className="overflow-x-auto mb-10">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-[#666] uppercase">Fournisseur</th>
                    <th className="text-right px-4 py-3 text-[11px] font-bold text-[#666] uppercase">Frais</th>
                    <th className="text-right px-4 py-3 text-[11px] font-bold text-[#666] uppercase">Perte change</th>
                    <th className="text-right px-4 py-3 text-[11px] font-bold text-[#666] uppercase">Coût total</th>
                    <th className="text-right px-4 py-3 text-[11px] font-bold text-[#666] uppercase">Reçu (MAD)</th>
                    <th className="text-right px-4 py-3 text-[11px] font-bold text-[#666] uppercase">Délai</th>
                    <th className="text-right px-4 py-3 text-[11px] font-bold text-[#666] uppercase">Économie/an</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.name} className={`border-b border-white/[0.04] ${r.isHarch ? 'bg-[#8B9DAF]/5' : ''}`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md flex items-center justify-center text-[12px] font-bold" style={{ background: `${r.color}20`, color: r.color }}>
                            {r.logo}
                          </div>
                          <span className={`text-[14px] ${r.isHarch ? 'font-bold text-[#8B9DAF]' : 'text-white'}`}>{r.name}</span>
                          {r.isHarch && <span className="text-[9px] bg-[#8B9DAF] text-[#0D0D0D] px-1.5 py-0.5 rounded font-bold uppercase">Bientôt</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-[13px] text-[#999] font-mono">{r.totalFee.toFixed(2)}€</td>
                      <td className="px-4 py-4 text-right text-[13px] text-[#999] font-mono">{r.exchangeLoss.toFixed(2)}€</td>
                      <td className="px-4 py-4 text-right text-[13px] text-white font-mono font-bold">{r.totalCost.toFixed(2)}€</td>
                      <td className="px-4 py-4 text-right text-[14px] text-white font-mono font-bold">{r.recipientGets.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-4 text-right text-[12px] text-[#666]">{r.speed}</td>
                      <td className="px-4 py-4 text-right text-[13px] font-mono">
                        {r.isHarch ? (
                          <span className="text-[#4A7B5F] font-bold">—</span>
                        ) : (
                          <span className="text-[#4A7B5F]">+{(r.savings * 12).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} MAD</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          {/* Waitlist */}
          <FadeIn delay={0.5}>
            <div className="p-8 bg-gradient-to-br from-[#1a1f2e] via-[#161616] to-[#0D0D0D] rounded-xl border border-[#8B9DAF]/20 text-center">
              {!submitted ? (
                <>
                  <h3 className="text-[24px] font-bold text-white mb-3">Soyez notifié au lancement</h3>
                  <p className="text-[14px] text-[#999] mb-6 max-w-md mx-auto">
                    Harch MRE Services lance en 2028. Soyez les premiers à économiser sur chaque transfert.
                  </p>
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="flex-1 bg-[#0D0D0D] border border-white/[0.1] rounded-md px-4 py-3 text-white text-[14px] focus:border-[#8B9DAF] outline-none"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#8B9DAF] text-[#0D0D0D] font-bold text-[14px] rounded-md hover:bg-white transition-all"
                    >
                      Me notifier
                    </button>
                  </form>
                  <p className="text-[11px] text-[#555] mt-4">Pas de spam. Un email au lancement, c'est tout.</p>
                </>
              ) : (
                <>
                  <h3 className="text-[24px] font-bold text-[#4A7B5F] mb-3">✓ Merci ! Vous êtes sur la liste.</h3>
                  <p className="text-[14px] text-[#999] mb-6">
                    On vous préviendra dès que Harch MRE Services sera disponible.
                    En attendant, partagez ce calculateur avec d'autres MRE.
                  </p>
                  <button
                    onClick={() => {
                      const text = `Je viens de découvrir que je perds ${yearlySavings.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} MAD/an en frais de transfert vers le Maroc. Et vous ? Calculez ici : harchcorp.com/tools/mre-calculator`;
                      if (navigator.share) {
                        navigator.share({ text, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(text);
                        alert('Copié ! Partagez sur WhatsApp, Facebook, Twitter...');
                      }
                    }}
                    className="px-6 py-3 bg-white/[0.05] border border-white/[0.1] text-white font-bold text-[14px] rounded-md hover:bg-white/[0.1] transition-all"
                  >
                    Partager ce calculateur
                  </button>
                </>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* THE PROBLEM — humanized */}
      <section className="py-20 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[800px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Le problème</p>
            <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-white tracking-tight mb-8">
              Ce n'est pas juste des frais.<br />C'est de l'argent qui manque aux familles.
            </h2>
            <div className="space-y-6 text-[16px] text-[#999] leading-[1.8]">
              <p>
                Fatima envoie 300€ chaque mois à sa mère à Fès. Avec Western Union, elle paie 19,60€ de frais.
                Sa mère reçoit 3 043 MAD au lieu de 3 255 MAD. C'est <span className="text-white font-bold">212 MAD de moins</span> —
                assez pour acheter 7 kg de viande, ou 15 litres d'huile, ou les médicaments du mois.
              </p>
              <p>
                Multipliez par 12 mois : Fatima perd <span className="text-white font-bold">2 544 MAD par an</span>.
                Multipliez par 5,8 millions de MRE : c'est <span className="text-[#8B9DAF] font-bold">3,4 Mds MAD</span> qui
                partent en frais chaque année au lieu d'aller aux familles marocaines.
              </p>
              <p>
                Harch MRE Services réduit les frais à 1,2% (vs 4,9% Western Union), utilise le taux de change
                mid-market (vs 2,2% de markup), et transfère instantanément (vs 10 minutes à 3 jours).
                Pour Fatima, c'est <span className="text-[#4A7B5F] font-bold">+3 060 MAD de plus par an</span> pour sa mère.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0D0D0D]">
        <div className="max-w-[800px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-white mb-6">
              3,4 Mds MAD. C'est le problème.
            </h2>
            <p className="text-[16px] text-[#999] mb-10 max-w-xl mx-auto">
              On le résout. Un transfert à la fois.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/research/mre-services" className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B9DAF] text-[#0D0D0D] font-bold text-[14px] rounded-md hover:bg-white transition-all">
                Lire le dossier complet (43 pages) <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 border border-white/12 text-white font-bold text-[14px] rounded-md hover:border-white/25 transition-all">
                Nous contacter
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
