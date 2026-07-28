'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MRECalculatorPage() {
  const [amount, setAmount] = useState(850);
  const [country, setCountry] = useState('FR');
  
  const providers = [
    { name: 'Banque', feePct: 2.8, fixed: 5, margin: 1.2, color: '#666' },
    { name: 'Western Union', feePct: 5.2, fixed: 4.9, margin: 2.5, color: '#C4964A' },
    { name: 'Wise', feePct: 1.5, fixed: 0.5, margin: 0, color: '#4A7B5F' },
    { name: 'Harch MRE', feePct: 1.2, fixed: 0, margin: 0, color: '#8B9DAF' },
  ];
  
  const calc = providers.map(p => ({
    ...p,
    monthly: amount * p.feePct / 100 + p.fixed + amount * p.margin / 100,
    yearly: 0,
  })).map(p => ({ ...p, yearly: p.monthly * 12 }));
  
  const bankYearly = calc[0].yearly;
  const harchYearly = calc[3].yearly;
  const savings = bankYearly - harchYearly;
  
  return (
    <div className="bg-[#0D0D0D] min-h-screen pt-20 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <p className="text-[11px] font-bold text-[#8B9DAF] uppercase tracking-wider mb-4">MRE Savings Calculator</p>
        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-white tracking-tight mb-4">
          Combien perdez-vous<br /><span className="text-[#8B9DAF]">chaque année ?</span>
        </h1>
        <p className="text-[16px] text-[#999] mb-10 max-w-xl">
          5,8M MRE transfèrent 122 Mds MAD/an. La plupart perdent 60€ à 1 800€ en frais cachés.
        </p>

        <div className="mb-8">
          <label className="text-[12px] font-bold text-[#666] uppercase mb-3 block">Montant mensuel transféré</label>
          <input type="range" min="50" max="3000" step="50" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full accent-[#8B9DAF]" />
          <p className="text-2xl font-bold text-white mt-2">{amount} € /mois</p>
        </div>

        <div className="space-y-3 mb-8">
          {calc.map(p => (
            <div key={p.name} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <div className="w-3 h-8 rounded-full" style={{ background: p.color }} />
              <span className="text-[14px] font-bold text-white w-32">{p.name}</span>
              <div className="flex-1 h-6 bg-white/[0.02] rounded overflow-hidden relative">
                <div className="h-full rounded" style={{ width: `${(p.yearly / calc[1].yearly) * 100}%`, background: p.color }} />
              </div>
              <span className="text-[14px] font-bold text-white w-20 text-right">{p.yearly.toFixed(0)}€/an</span>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gradient-to-br from-[#1a1f2e] to-[#0D0D0D] border border-[#8B9DAF]/20 rounded-xl mb-8">
          <p className="text-[12px] text-[#8B9DAF] uppercase font-bold mb-2">Vos économies avec Harch MRE</p>
          <p className="text-5xl font-extrabold text-white">{savings.toFixed(0)} €/an</p>
          <p className="text-[14px] text-[#999] mt-2">Sur 10 ans: {(savings * 10).toFixed(0)} €</p>
        </div>

        <div className="p-4 bg-[#8B9DAF]/5 border border-[#8B9DAF]/20 rounded-lg">
          <p className="text-[14px] text-white font-bold mb-2">Prêt à économiser {savings.toFixed(0)}€/an ?</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B9DAF] text-[#0D0D0D] font-bold text-[13px] rounded-md hover:bg-white transition-all">
            Demander un accès prioritaire
          </Link>
        </div>

        <p className="text-[11px] text-[#555] mt-8">
          Sources: lesmre.com, marocains-du-monde.org, Bank Al-Maghrib. Frais: % + fixe + marge de change.
        </p>
      </div>
    </div>
  );
}
