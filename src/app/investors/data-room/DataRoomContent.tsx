'use client';

import { useState } from 'react';

const categories = [
  { name: 'Company Overview', docs: ['Company Overview PDF', 'Cap Table', 'Org Chart', 'Bylaws', 'Tax Filings', 'Insurance'], status: 'Available', color: '#8B9DAF' },
  { name: 'Financial', docs: ['5-Year P&L Projections', 'Historical Financials', 'Unit Economics', 'Burn Rate', 'Funding History', 'Bank Statements'], status: 'Available', color: '#4A7B5F' },
  { name: 'Market & Strategy', docs: ['Market Analysis', 'Competitive Landscape', 'Go-to-Market', 'Pricing Strategy', 'Regulatory Framework'], status: 'Available', color: '#C4964A' },
  { name: 'Technical', docs: ['Architecture Whitepaper', 'HarchOS Specs', 'Security Audit', 'Compliance Certs', 'IP Portfolio'], status: 'On Request', color: '#A87878' },
  { name: 'ESG', docs: ['Carbon Assessment', 'Sustainability Report', 'SBTi Commitment', 'Community Impact'], status: 'Available', color: '#6BAF6B' },
  { name: 'Legal', docs: ['Term Sheet', 'SHA Template', 'DD Checklist', 'Subsidiary Agreements', 'Employment Contracts'], status: 'In Preparation', color: '#666666' },
];

const ddItems = [
  { cat: 'Corporate', item: 'Company registration verified', done: true },
  { cat: 'Corporate', item: 'Cap table confirmed', done: true },
  { cat: 'Corporate', item: 'Board resolutions', done: true },
  { cat: 'Financial', item: '5-year projections validated', done: true },
  { cat: 'Financial', item: 'Historical P&L reviewed', done: true },
  { cat: 'Financial', item: 'Bank statements verified', done: true },
  { cat: 'Financial', item: 'Tax filings checked', done: true },
  { cat: 'Financial', item: 'Auditor letter', done: false },
  { cat: 'Market', item: 'Market size validated', done: true },
  { cat: 'Market', item: 'Competitive analysis', done: true },
  { cat: 'Market', item: 'Customer references', done: false },
  { cat: 'Market', item: 'Regulatory framework', done: true },
  { cat: 'Technical', item: 'Architecture reviewed', done: true },
  { cat: 'Technical', item: 'Security audit', done: false },
  { cat: 'Technical', item: 'Scalability assessment', done: false },
  { cat: 'Technical', item: 'IP portfolio verified', done: true },
  { cat: 'ESG', item: 'Carbon assessment', done: true },
  { cat: 'ESG', item: 'SBTi commitment', done: true },
  { cat: 'ESG', item: 'Social impact metrics', done: true },
  { cat: 'Legal', item: 'Term sheet drafted', done: true },
  { cat: 'Legal', item: 'SHA template ready', done: true },
  { cat: 'Legal', item: 'Subsidiary agreements', done: false },
  { cat: 'Legal', item: 'Employment contracts', done: false },
  { cat: 'Legal', item: 'Data protection compliance', done: true },
];

export default function DataRoomContent() {
  const [filter, setFilter] = useState('All');
  const cats = ['All', 'Corporate', 'Financial', 'Market', 'Technical', 'ESG', 'Legal'];
  const filtered = filter === 'All' ? ddItems : ddItems.filter(d => d.cat === filter);

  return (
    <div className="bg-[#0D0D0D] min-h-screen pt-14">
      <section className="py-20 md:py-32 bg-gradient-to-b from-[#0D0D0D] to-[#0F0F0F] border-b border-white/[0.04]">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12">
          <p className="text-[11px] font-bold text-[#8B9DAF] uppercase tracking-wider mb-6">Investor Data Room</p>
          <h1 className="text-[clamp(2rem,5vw,4rem)] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
            Series A 2029<br /><span className="text-[#8B9DAF]">Due Diligence</span>
          </h1>
          <p className="text-[18px] text-[#999] max-w-2xl leading-relaxed mb-8">
            24 documents across 6 categories. Access-controlled. Contact ir@harchcorp.com for credentials.
          </p>
          <div className="flex items-center gap-3 p-4 bg-[rgba(196,150,74,0.05)] border border-[rgba(196,150,74,0.15)] rounded-lg max-w-2xl">
            <span className="text-[#C4964A] text-[20px]">🔒</span>
            <p className="text-[13px] text-[#999]"><span className="text-[#C4964A] font-bold">Access-controlled.</span> NDA required. Request via ir@harchcorp.com.</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0D0D0D]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <h2 className="text-[24px] font-bold text-white mb-8">Document Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {categories.map((cat) => (
              <div key={cat.name} className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}40` }}>
                    <span className="text-[16px]" style={{ color: cat.color }}>📄</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: `${cat.color}15`, color: cat.color }}>{cat.status}</span>
                </div>
                <h3 className="text-[15px] font-bold text-white mb-3">{cat.name}</h3>
                <ul className="space-y-1.5 mb-4">
                  {cat.docs.map(doc => (
                    <li key={doc} className="text-[12px] text-[#999]">• {doc}</li>
                  ))}
                </ul>
                <a href={`mailto:ir@harchcorp.com?subject=Access — ${cat.name}`} className="text-[12px] font-bold" style={{ color: cat.color }}>
                  Request Access →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <h2 className="text-[24px] font-bold text-white mb-4">DD Checklist — {ddItems.filter(d => d.done).length}/{ddItems.length} completed</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {cats.map(c => (
              <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 text-[11px] font-bold rounded-md ${filter === c ? 'bg-[#8B9DAF] text-[#0D0D0D]' : 'bg-white/[0.02] text-white/50 border border-white/[0.06]'}`}>{c}</button>
            ))}
          </div>
          <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
            <table className="w-full">
              <thead><tr className="bg-white/[0.02] border-b border-white/[0.06]">
                <th className="px-4 py-3 text-left text-[11px] font-bold text-[#555] uppercase">#</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-[#555] uppercase">Category</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-[#555] uppercase">Item</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold text-[#555] uppercase">Status</th>
              </tr></thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td className="px-4 py-3 text-[12px] text-[#555] font-mono">{i + 1}</td>
                    <td className="px-4 py-3 text-[12px] text-[#8B9DAF] font-bold">{item.cat}</td>
                    <td className="px-4 py-3 text-[13px] text-white">{item.item}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold ${item.done ? 'text-[#4A7B5F]' : 'text-[#C4964A]'}`}>
                        {item.done ? '✓ Done' : '⏳ Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0D0D0D] border-t border-white/[0.04]">
        <div className="max-w-[800px] mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Request Access</h2>
          <p className="text-[15px] text-[#999] mb-8">Contact our Investor Relations team. NDA required.</p>
          <a href="mailto:ir@harchcorp.com?subject=Data Room Access" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#8B9DAF] text-[#0D0D0D] font-bold text-[14px] rounded-md hover:bg-white transition-all">
            ✉ ir@harchcorp.com
          </a>
          <p className="text-[12px] text-[#555] mt-4">+212 5 22 00 00 02</p>
        </div>
      </section>
    </div>
  );
}
