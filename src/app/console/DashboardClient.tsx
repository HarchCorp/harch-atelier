'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';

type Section = 'overview' | 'clusters' | 'deployments' | 'billing';

export default function DashboardClient() {
  const [section, setSection] = useState<Section>('overview');

  const navItems: { id: Section; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'clusters', label: 'GPU Clusters' },
    { id: 'deployments', label: 'Deployments' },
    { id: 'billing', label: 'Billing' },
  ];

  const stats = [
    { label: 'Active GPUs', value: '1,798' },
    { label: 'Running Jobs', value: '47' },
    { label: 'Carbon Intensity', value: '47 gCO₂/kWh' },
    { label: 'Monthly Cost', value: '$12,450' },
  ];

  const hubs = [
    { name: 'Dakhla', gpus: 500, carbon: 18, status: 'Online' },
    { name: 'Ouarzazate', gpus: 450, carbon: 18, status: 'Online' },
    { name: 'Benguerir', gpus: 350, carbon: 55, status: 'Online' },
    { name: 'Tanger', gpus: 200, carbon: 95, status: 'Online' },
    { name: 'Casablanca', gpus: 298, carbon: 210, status: 'Online' },
  ];

  const jobs = [
    { name: 'GPT-finetune-v3', status: 'Running', gpu: 'H100', duration: '4h 23m', cost: '$284' },
    { name: 'BERT-classification-ar', status: 'Running', gpu: 'H100', duration: '1h 15m', cost: '$87' },
    { name: 'Llama3-70b-rlhf', status: 'Queued', gpu: 'H200', duration: '—', cost: '—' },
    { name: 'SDXL-distill', status: 'Completed', gpu: 'A100', duration: '2h 45m', cost: '$156' },
    { name: 'Whisper-v3-batch', status: 'Running', gpu: 'H100', duration: '6h 02m', cost: '$412' },
  ];

  return (
    <div className="bg-[#0D0D0D] min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] border-r border-white/[0.06] p-6 flex flex-col gap-6 shrink-0 hidden md:flex">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-[0.2em] text-white uppercase">HARCH</span>
          <span className="text-lg font-light tracking-[0.2em] text-[#999] uppercase">CORP</span>
        </Link>
        <div className="px-2.5 py-1 rounded border border-[#4A7B5F]/30 bg-[#4A7B5F]/5 inline-flex items-center gap-1.5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4A7B5F] animate-pulse" />
          <span className="text-[9px] font-mono uppercase text-[#4A7B5F]">Demo Mode</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`text-left px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                section === item.id ? 'bg-[#8B9DAF]/10 text-[#8B9DAF]' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white capitalize">{section}</h1>
          <p className="text-[14px] text-[#666] mt-1">Harch Intelligence Console — Investor Demo</p>
        </div>

        {section === 'overview' && (
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                  <p className="text-[10px] text-[#666] uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <h2 className="text-[16px] font-bold text-white mb-4">Active Hubs</h2>
            <div className="space-y-2 mb-8">
              {hubs.map((hub) => (
                <div key={hub.name} className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-[#4A7B5F]" />
                  <span className="text-[14px] font-bold text-white w-32">{hub.name}</span>
                  <span className="text-[13px] text-[#8B9DAF] font-mono">{hub.gpus} GPUs</span>
                  <span className="text-[13px] text-[#666] font-mono">{hub.carbon} gCO₂/kWh</span>
                  <span className="text-[12px] text-[#4A7B5F] ml-auto">{hub.status}</span>
                </div>
              ))}
            </div>

            <h2 className="text-[16px] font-bold text-white mb-4">Recent Jobs</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-2 text-[11px] font-bold text-[#666] uppercase">Name</th>
                    <th className="text-left px-4 py-2 text-[11px] font-bold text-[#666] uppercase">Status</th>
                    <th className="text-left px-4 py-2 text-[11px] font-bold text-[#666] uppercase">GPU</th>
                    <th className="text-left px-4 py-2 text-[11px] font-bold text-[#666] uppercase">Duration</th>
                    <th className="text-right px-4 py-2 text-[11px] font-bold text-[#666] uppercase">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.name} className="border-b border-white/[0.04]">
                      <td className="px-4 py-3 text-[13px] text-white font-mono">{job.name}</td>
                      <td className="px-4 py-3 text-[13px]">
                        <span className={job.status === 'Running' ? 'text-[#4A7B5F]' : job.status === 'Queued' ? 'text-[#C4964A]' : 'text-[#666]'}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#8B9DAF] font-mono">{job.gpu}</td>
                      <td className="px-4 py-3 text-[13px] text-[#999] font-mono">{job.duration}</td>
                      <td className="px-4 py-3 text-[13px] text-white font-mono text-right">{job.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        )}

        {section === 'clusters' && (
          <FadeIn>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-2 text-[11px] font-bold text-[#666] uppercase">Hub</th>
                    <th className="text-left px-4 py-2 text-[11px] font-bold text-[#666] uppercase">GPUs</th>
                    <th className="text-left px-4 py-2 text-[11px] font-bold text-[#666] uppercase">Carbon</th>
                    <th className="text-left px-4 py-2 text-[11px] font-bold text-[#666] uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hubs.map((hub) => (
                    <tr key={hub.name} className="border-b border-white/[0.04]">
                      <td className="px-4 py-3 text-[14px] font-bold text-white">{hub.name}</td>
                      <td className="px-4 py-3 text-[13px] text-[#8B9DAF] font-mono">{hub.gpus}</td>
                      <td className="px-4 py-3 text-[13px] text-[#999] font-mono">{hub.carbon} gCO₂/kWh</td>
                      <td className="px-4 py-3 text-[12px] text-[#4A7B5F]">{hub.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        )}

        {section === 'deployments' && (
          <FadeIn>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.name} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg flex items-center gap-4">
                  <span className="text-[14px] font-bold text-white font-mono">{job.name}</span>
                  <span className="text-[12px] text-[#8B9DAF]">{job.gpu}</span>
                  <span className="text-[12px] text-[#999]">{job.duration}</span>
                  <span className="text-[12px] text-white ml-auto">{job.cost}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {section === 'billing' && (
          <FadeIn>
            <div className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-lg mb-6">
              <h2 className="text-[16px] font-bold text-white mb-4">Current Month (July 2026)</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-[14px]"><span className="text-[#999]">GPU Compute</span><span className="text-white font-mono">$10,847</span></div>
                <div className="flex justify-between text-[14px]"><span className="text-[#999]">Storage</span><span className="text-white font-mono">$847</span></div>
                <div className="flex justify-between text-[14px]"><span className="text-[#999]">Egress</span><span className="text-white font-mono">$456</span></div>
                <div className="flex justify-between text-[14px]"><span className="text-[#999]">Carbon Scheduler</span><span className="text-[#4A7B5F]">Included</span></div>
                <div className="flex justify-between text-[16px] font-bold pt-2 border-t border-white/[0.06]"><span className="text-white">Total</span><span className="text-[#8B9DAF] font-mono">$12,150</span></div>
              </div>
            </div>
          </FadeIn>
        )}
      </main>
    </div>
  );
}
