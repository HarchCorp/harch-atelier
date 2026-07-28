'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import { ArrowRight, AlertCircle, TrendingDown, Home, Wallet } from 'lucide-react';

// Real transfer fee data (verified sources: lesmre.com, marocains-du-monde.org, 2026)
const PROVIDERS = [
  { 
    name: 'Banque classique', 
    feePct: 2.8, 
    fixedFee: 5, 
    exchangeMargin: 1.2,
    color: '#666666',
    note: 'BMCE, Attijariwafa, BP, CIH — virement SWIFT'
  },
  { 
    name: 'Western Union', 
    feePct: 5.2, 
    fixedFee: 4.9, 
    exchangeMargin: 2.5,
    color: '#C4964A',
    note: 'Agent physique — rapide mais cher'
  },
  { 
    name: 'MoneyGram', 
    feePct: 4.8, 
    fixedFee: 4.5, 
    exchangeMargin: 2.0,
    color: '#A87878',
    note: 'Agent physique — similaire à WU'
  },
  { 
    name: 'Wise', 
    feePct: 1.5, 
    fixedFee: 0.5, 
    exchangeMargin: 0.0,
    color: '#4A7B5F',
    note: 'Taux mid-market — le moins cher des existants'
  },
  { 
    name: 'Harch MRE Services', 
    feePct: 1.2, 
    fixedFee: 0, 
    exchangeMargin: 0.0,
    color: '#8B9DAF',
    note: 'Tarif Harch — wallet intégré, transferts programmés'
  },
];

const COUNTRIES = [
  { code: 'FR', name: 'France', flag: '🇫🇷', avgMonthly: 850 },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸', avgMonthly: 720 },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪', avgMonthly: 780 },
  { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱', avgMonthly: 820 },
  { code: 'IT', name: 'Italie', flag: '🇮🇹', avgMonthly: 650 },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪', avgMonthly: 750 },
  { code: 'US', name: 'USA', flag: '🇺🇸', avgMonthly: 1200 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', avgMonthly: 1100 },
];

// Real rental data (Mubawab 2025 averages)
const RENTAL_RATES = {
  'Casablanca': { studio: 4500, t2: 6500, t3: 9000, t4: 13000, villa: 18000 },
  'Rabat': { studio: 4000, t2: 6000, t3: 8500, t4: 12000, villa: 16000 },
  'Tanger': { studio: 3500, t2: 5500, t3: 7500, t4: 10000, villa: 14000 },
  'Marrakech': { studio: 3500, t2: 5000, t3: 7000, t4: 9500, villa: 15000 },
  'Fès': { studio: 2500, t2: 4000, t3: 5500, t4: 7500, villa: 10000 },
  'Agadir': { studio: 3000, t2: 4500, t3: 6000, t4: 8000, villa: 12000 },
};

export default function MRECalculatorClient() {
  const [country, setCountry] = useState('FR');
  const [monthlyTransfer, setMonthlyTransfer] = useState(850);
  const [hasProperty, setHasProperty] = useState(false);
  const [city, setCity] = useState('Casablanca');
  const [propertyType, setPropertyType] = useState<'studio' | 't2' | 't3' | 't4' | 'villa'>('t3');
  const [occupiedMonths, setOccupiedMonths] = useState(0);

  // Calculate transfer costs
  const transferCalc = useMemo(() => {
    return PROVIDERS.map(p => {
      const monthlyFee = (monthlyTransfer * p.feePct / 100) + p.fixedFee + (monthlyTransfer * p.exchangeMargin / 100);
      const yearlyFee = monthlyFee * 12;
      const tenYearFee = yearlyFee * 10;
      const yearlyLoss = monthlyTransfer * 12 * (p.feePct + p.exchangeMargin) / 100 + p.fixedFee * 12;
      return { ...p, monthlyFee, yearlyFee, tenYearFee, yearlyLoss };
    });
  }, [monthlyTransfer]);

  const harchSavings = useMemo(() => {
    const bank = transferCalc[0];
    const harch = transferCalc[4];
    return {
      monthly: bank.monthlyFee - harch.monthlyFee,
      yearly: bank.yearlyFee - harch.yearlyFee,
      tenYear: bank.tenYearFee - harch.tenYearFee,
    };
  }, [transferCalc]);

  // Calculate rental income
  const rentalCalc = useMemo(() => {
    if (!hasProperty) return null;
    const monthlyRent = RENTAL_RATES[city as keyof typeof RENTAL_RATES]?.[propertyType] || 0;
    const availableMonths = 12 - occupiedMonths;
    const yearlyIncome = monthlyRent * availableMonths;
    const harchCommission = yearlyIncome * 0.12;
    const netIncome = yearlyIncome - harchCommission;
    const tenYearIncome = netIncome * 10;
    return { monthlyRent, availableMonths, yearlyIncome, harchCommission, netIncome, tenYearIncome };
  }, [hasProperty, city, propertyType, occupiedMonths]);

  // Total impact
  const totalYearlyImpact = useMemo(() => {
    const transferSaving = harchSavings.yearly;
    const rentalIncome = rentalCalc?.netIncome || 0;
    return transferSaving + rentalIncome;
  }, [harchSavings, rentalCalc]);

  return (
    <div className="bg-[#0D0D0D] min-h-screen pt-14">
      {/* HERO */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-[#0D0D0D] via-[#0F0F0F] to-[#0D0D0D] border-b border-white/[0.04]">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6">MRE Savings Calculator</p>
            <h1 className="text-[clamp(2rem,5vw,4rem)] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Combien perdez-vous<br />
              <span className="text-[#8B9DAF]">chaque année ?</span>
            </h1>
            <p className="text-[18px] text-[#999] max-w-2xl leading-relaxed mb-8">
              5,8 millions de MRE transfèrent 122 Mds MAD/an. La plupart perdent
              entre 60€ et 1 800€ en frais cachés. Calculez votre perte réelle
              et découvrez combien vous pourriez économiser + gagner avec votre bien vacant.
            </p>
            <div className="flex items-center gap-3 p-4 bg-[rgba(196,150,74,0.05)] border border-[rgba(196,150,74,0.15)] rounded-lg max-w-2xl">
              <AlertCircle className="w-5 h-5 text-[#C4964A] shrink-0" />
              <p className="text-[13px] text-[#999] leading-snug">
                <span className="text-[#C4964A] font-bold">Données réelles 2026.</span> Frais vérifiés sur lesmre.com, marocains-du-monde.org, et sites officiels des providers.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="py-12 bg-[#0D0D0D]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LEFT: INPUTS */}
            <FadeIn>
              <div className="p-6 md:p-8 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <h2 className="text-[20px] font-bold text-white mb-6 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#8B9DAF]" />
                  Vos transferts
                </h2>

                {/* Country selector */}
                <div className="mb-6">
                  <label className="text-[12px] font-bold text-[#666] uppercase tracking-wider mb-3 block">
                    Pays de résidence
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {COUNTRIES.map(c => (
                      <button
                        key={c.code}
                        onClick={() => { setCountry(c.code); setMonthlyTransfer(c.avgMonthly); }}
                        className={`p-3 rounded-lg text-center transition-all ${
                          country === c.code
                            ? 'bg-[#8B9DAF]/20 border border-[#8B9DAF]/40'
                            : 'bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15]'
                        }`}
                      >
                        <span className="text-[24px] block">{c.flag}</span>
                        <span className="text-[10px] text-[#999] mt-1 block">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly transfer amount */}
                <div className="mb-6">
                  <label className="text-[12px] font-bold text-[#666] uppercase tracking-wider mb-3 block">
                    Montant mensuel transféré
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="50"
                      max="3000"
                      step="50"
                      value={monthlyTransfer}
                      onChange={(e) => setMonthlyTransfer(Number(e.target.value))}
                      className="flex-1 accent-[#8B9DAF]"
                    />
                    <div className="flex items-center gap-1 min-w-[120px]">
                      <input
                        type="number"
                        value={monthlyTransfer}
                        onChange={(e) => setMonthlyTransfer(Number(e.target.value))}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-[16px] font-bold text-white text-right"
                      />
                      <span className="text-[14px] text-[#666]">€</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#555] mt-2">
                    Moyenne {COUNTRIES.find(c => c.code === country)?.name}: {COUNTRIES.find(c => c.code === country)?.avgMonthly}€/mois
                  </p>
                </div>

                {/* Property toggle */}
                <div className="mb-6">
                  <button
                    onClick={() => setHasProperty(!hasProperty)}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      hasProperty ? 'bg-[#8B9DAF]/10 border border-[#8B9DAF]/30' : 'bg-white/[0.02] border border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-[#8B9DAF]" />
                      <div className="flex-1">
                        <p className="text-[14px] font-bold text-white">
                          J'ai un bien immobilier au Maroc
                        </p>
                        <p className="text-[12px] text-[#666] mt-0.5">
                          {hasProperty ? 'Calculez vos revenus locatifs potentiels' : '38% des biens MRE sont inoccupés 10+ mois/an'}
                        </p>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-all ${hasProperty ? 'bg-[#8B9DAF]' : 'bg-white/[0.1]'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full m-1 transition-all ${hasProperty ? 'translate-x-4' : ''}`} />
                      </div>
                    </div>
                  </button>
                </div>

                {/* Property details */}
                {hasProperty && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div>
                      <label className="text-[12px] font-bold text-[#666] uppercase tracking-wider mb-2 block">Ville</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-[14px] text-white"
                      >
                        {Object.keys(RENTAL_RATES).map(c => <option key={c} value={c} className="bg-[#0D0D0D]">{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-[#666] uppercase tracking-wider mb-2 block">Type de bien</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { id: 'studio', label: 'Studio' },
                          { id: 't2', label: 'T2' },
                          { id: 't3', label: 'T3' },
                          { id: 't4', label: 'T4' },
                          { id: 'villa', label: 'Villa' },
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => setPropertyType(t.id as any)}
                            className={`py-2 px-1 text-[11px] font-bold rounded transition-all ${
                              propertyType === t.id ? 'bg-[#8B9DAF] text-[#0D0D0D]' : 'bg-white/[0.02] text-[#666] border border-white/[0.06]'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[12px] font-bold text-[#666] uppercase tracking-wider mb-2 block">
                        Mois d'occupation par an (vos visites): {occupiedMonths}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        step="1"
                        value={occupiedMonths}
                        onChange={(e) => setOccupiedMonths(Number(e.target.value))}
                        className="w-full accent-[#8B9DAF]"
                      />
                      <div className="flex justify-between text-[10px] text-[#555] mt-1">
                        <span>0 (tout vide)</span>
                        <span>1 mois</span>
                        <span>2 mois</span>
                        <span>3 mois</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>

            {/* RIGHT: RESULTS */}
            <FadeIn delay={0.2}>
              <div className="space-y-4">
                {/* Big number */}
                <div className="p-6 md:p-8 bg-gradient-to-br from-[#1a1f2e] via-[#161616] to-[#0D0D0D] border border-[#8B9DAF]/20 rounded-xl">
                  <p className="text-[12px] font-bold text-[#8B9DAF] uppercase tracking-wider mb-3">
                    Impact total annuel avec Harch
                  </p>
                  <p className="text-[56px] md:text-[72px] font-extrabold text-white tracking-[-0.04em] leading-none">
                    +{totalYearlyImpact.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€
                  </p>
                  <p className="text-[14px] text-[#999] mt-2">
                    Économies transferts {harchSavings.yearly > 0 && `(${harchSavings.yearly.toFixed(0)}€)`}
                    {rentalCalc && ` + revenus locatifs (${rentalCalc.netIncome.toLocaleString('fr-FR')} MAD)`}
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <p className="text-[12px] text-[#666]">Sur 10 ans: <span className="text-[#8B9DAF] font-bold">+{(totalYearlyImpact * 10).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</span></p>
                  </div>
                </div>

                {/* Transfer comparison */}
                <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                  <h3 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-[#8B9DAF]" />
                    Frais de transfert — comparatif annuel
                  </h3>
                  <div className="space-y-2">
                    {transferCalc.map((p) => {
                      const maxFee = Math.max(...transferCalc.map(x => x.yearlyFee));
                      const widthPct = (p.yearlyFee / maxFee) * 100;
                      return (
                        <div key={p.name} className="flex items-center gap-3">
                          <span className="text-[12px] text-[#999] w-28 truncate">{p.name}</span>
                          <div className="flex-1 h-6 bg-white/[0.02] rounded overflow-hidden relative">
                            <div
                              className="h-full rounded transition-all duration-500"
                              style={{ width: `${widthPct}%`, background: p.color }}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white">
                              {p.yearlyFee.toFixed(0)}€/an
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-[#555] mt-3">
                    Harch: {harchSavings.yearly.toFixed(0)}€/an d'économies vs banque classique
                  </p>
                </div>

                {/* Rental income */}
                {rentalCalc && (
                  <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                    <h3 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2">
                      <Home className="w-4 h-4 text-[#8B9DAF]" />
                      Revenus locatifs — {city} {propertyType.toUpperCase()}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-[10px] text-[#666] uppercase">Loyer mensuel</p>
                        <p className="text-[20px] font-bold text-white">{rentalCalc.monthlyRent.toLocaleString('fr-FR')} MAD</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#666] uppercase">Mois location/an</p>
                        <p className="text-[20px] font-bold text-white">{rentalCalc.availableMonths} mois</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#666] uppercase">Revenu brut/an</p>
                        <p className="text-[20px] font-bold text-white">{rentalCalc.yearlyIncome.toLocaleString('fr-FR')} MAD</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#666] uppercase">Net après Harch (12%)</p>
                        <p className="text-[20px] font-bold text-[#8B9DAF]">{rentalCalc.netIncome.toLocaleString('fr-FR')} MAD</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#555]">
                      Sur 10 ans: {rentalCalc.tenYearIncome.toLocaleString('fr-FR')} MAD nets
                    </p>
                  </div>
                )}

                {/* CTA */}
                <div className="p-5 bg-[#8B9DAF]/5 border border-[#8B9DAF]/20 rounded-xl">
                  <p className="text-[14px] text-white font-bold mb-2">
                    Prêt à économiser {harchSavings.yearly.toFixed(0)}€/an ?
                  </p>
                  <p className="text-[12px] text-[#999] mb-4">
                    Harch MRE Services — lancement 2028. Inscrivez-vous pour un accès prioritaire.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B9DAF] text-[#0D0D0D] font-bold text-[13px] rounded-md hover:bg-white transition-all"
                  >
                    Demander un accès prioritaire
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SOURCES */}
      <section className="py-12 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12">
          <p className="text-[11px] text-[#555] leading-relaxed">
            <span className="font-bold text-[#666]">Sources des données:</span> lesmre.com (comparatif transferts 2026),
            marocains-du-monde.org (guide transferts MRE), Mubawab (loyers moyens 2025),
            Bank Al-Maghrib (volume transferts MRE 2024), INSEE (revenus diaspora).
            Frais calculés: pourcentage + frais fixes + marge de change.
            Les résultats sont des estimations basées sur des données publiques.
          </p>
        </div>
      </section>
    </div>
  );
}
