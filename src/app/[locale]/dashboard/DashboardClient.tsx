'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardClient() {
  const [section, setSection] = useState('overview');
  
  return (
    <div className="bg-[#0D0D0D] min-h-screen p-8">
      <div className="flex gap-4 mb-8">
        <Link href="/" className="text-white font-bold">HARCH CORP</Link>
        <span className="px-2 py-1 text-[10px] bg-[#4A7B5F]/20 text-[#4A7B5F] rounded">Demo Mode</span>
      </div>
      
      <div className="flex gap-2 mb-6">
        {['overview', 'clusters', 'deployments', 'billing'].map((s) => (
          <button key={s} onClick={() => setSection(s)} className={`px-4 py-2 text-[13px] rounded ${section === s ? 'bg-[#8B9DAF]/20 text-[#8B9DAF]' : 'text-white/50 hover:text-white'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      
      {section === 'overview' && (
        <div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded"><p className="text-[10px] text-[#666] uppercase">Active GPUs</p><p className="text-2xl font-bold text-white">1,798</p></div>
            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded"><p className="text-[10px] text-[#666] uppercase">Running Jobs</p><p className="text-2xl font-bold text-white">47</p></div>
            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded"><p className="text-[10px] text-[#666] uppercase">Carbon</p><p className="text-2xl font-bold text-[#8B9DAF]">47 gCO2</p></div>
            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded"><p className="text-[10px] text-[#666] uppercase">Monthly</p><p className="text-2xl font-bold text-white">$12,450</p></div>
          </div>
          <h2 className="text-[16px] font-bold text-white mb-4">Active Hubs</h2>
          <div className="space-y-2">
            {[{n:'Dakhla',g:500,c:18},{n:'Ouarzazate',g:450,c:18},{n:'Benguerir',g:350,c:55},{n:'Tanger',g:200,c:95},{n:'Casablanca',g:298,c:210}].map((h) => (
              <div key={h.n} className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/[0.06] rounded">
                <span className="w-2 h-2 rounded-full bg-[#4A7B5F]" />
                <span className="text-[14px] font-bold text-white">{h.n}</span>
                <span className="text-[13px] text-[#8B9DAF]">{h.g} GPUs</span>
                <span className="text-[13px] text-[#666]">{h.c} gCO2/kWh</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {section === 'clusters' && <div className="text-white/60">GPU Clusters - 5 hubs operational</div>}
      {section === 'deployments' && <div className="text-white/60">Deployments - 5 active jobs</div>}
      {section === 'billing' && <div className="text-white/60">Billing - $12,150 this month</div>}
    </div>
  );
}
