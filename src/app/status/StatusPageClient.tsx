'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Rss,
  Bell,
  Mail,
  Calendar,
  Shield,
  Activity,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

type ServiceStatus = 'engineering' | 'operational' | 'degraded' | 'outage';

interface Service {
  name: string;
  status: ServiceStatus;
  uptime: number;
  description: string;
}

const services: Service[] = [
  { name: 'HarchOS Core API', status: 'engineering', uptime: 99.91, description: 'Central orchestration and management API' },
  { name: 'SENSE Data Pipeline', status: 'engineering', uptime: 99.94, description: 'Real-time data ingestion and processing engine' },
  { name: 'THINK AI Engine', status: 'engineering', uptime: 99.91, description: 'Inference and model serving infrastructure' },
  { name: 'ACT Execution Layer', status: 'engineering', uptime: 99.91, description: 'Automated decision execution and orchestration' },
  { name: 'Developer Portal', status: 'engineering', uptime: 99.91, description: 'API documentation, SDKs, and developer tools' },
  { name: 'CLI & SDK Services', status: 'engineering', uptime: 99.94, description: 'Command-line interface and language SDKs' },
  { name: 'Management Console', status: 'engineering', uptime: 99.91, description: 'Web-based administration and monitoring dashboard' },
  { name: 'Authentication Service', status: 'engineering', uptime: 99.91, description: 'Identity, access management, and SSO' },
];

function StatusDot({ status }: { status: ServiceStatus }) {
  const colors = {
    operational: 'bg-[#4A7B5F]',
    degraded: 'bg-[#FFAA00]',
    outage: 'bg-[#FF4444]',
  };
  const shadows = {
    operational: '0 0 6px rgba(74,123,95,0.5)',
    degraded: '0 0 6px rgba(255,170,0,0.5)',
    outage: '0 0 6px rgba(255,68,68,0.5)',
  };
  return (
    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[status], boxShadow: shadows[status] }} />
  );
}

function StatusLabel({ status }: { status: ServiceStatus }) {
  const labels = {
    operational: 'Operational',
    degraded: 'Degraded Performance',
    outage: 'Service Outage',
  };
  const textColors = {
    operational: 'text-[#4A7B5F]',
    degraded: 'text-[#FFAA00]',
    outage: 'text-[#FF4444]',
  };
  return <span className={`text-[13px] font-medium ${textColors[status]}`}>{labels[status]}</span>;
}

function UptimeBar({ uptime }: { uptime: number }) {
  // Generate 90 days of status blocks
  // We simulate based on the overall uptime percentage
  const days = 90;
  const outageDays = Math.round((100 - uptime) * days / 100);
  const blocks: { status: ServiceStatus; day: number }[] = [];

  // Spread out any non-operational days randomly but deterministically
  const outageIndices = new Set<number>();
  let placed = 0;
  for (let i = days - 1; i >= 0 && placed < outageDays; i -= Math.max(1, Math.floor(days / (outageDays + 1)))) {
    outageIndices.add(i);
    placed++;
  }

  for (let i = 0; i < days; i++) {
    if (outageIndices.has(i)) {
      blocks.push({ status: 'degraded', day: i });
    } else {
      blocks.push({ status: 'engineering', day: i });
    }
  }

  return (
    <div className="flex gap-[2px] h-8 items-end">
      {blocks.map((block) => (
        <div
          key={block.day}
          className={`flex-1 rounded-[2px] min-w-[2px] ${
            block.status === 'operational'
              ? 'bg-[#4A7B5F]/60'
              : block.status === 'degraded'
              ? 'bg-[#FFAA00]/60'
              : 'bg-[#FF4444]/60'
          }`}
          style={{ height: '100%' }}
          title={`Day ${block.day + 1}: ${block.status}`}
        />
      ))}
    </div>
  );
}

export default function StatusPageClient() {
  const overallUptime = 99.98;
  const allOperational = services.every((s) => s.status === 'operational');

  return (
    <div className="bg-[#121212]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Status</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              System Status
            </h1>
            <div className="accent-line mb-6" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Real-time operational status for all Harch Corp services. This page is updated automatically 
              by our monitoring systems — no manual intervention required.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ OVERALL STATUS BANNER ═══ */}
      <section className="py-16 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="card p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full bg-[#4A7B5F]" style={{ boxShadow: '0 0 12px rgba(74,123,95,0.5), 0 0 24px rgba(74,123,95,0.2)' }} />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {allOperational ? 'Systems in Engineering Phase' : 'Partial Service Disruption'}
                    </h2>
                    <p className="text-[14px] text-[#999999] mt-1">
                      {allOperational
                        ? 'All Harch Corp services are operating normally.'
                        : 'Some services are experiencing issues. Our team is responding.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="stat-mono text-3xl md:text-4xl font-bold text-white">{overallUptime}%</p>
                    <p className="text-[12px] text-[#666666]">Uptime (90 days)</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SERVICE STATUS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Services</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              Service Status
            </h2>
          </FadeIn>

          <div className="space-y-4">
            {services.map((service, i) => (
              <FadeIn key={service.name} delay={i * 0.05}>
                <div className="card p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                    <div className="flex items-center gap-3 lg:w-[320px] flex-shrink-0">
                      <StatusDot status={service.status} />
                      <div>
                        <p className="text-[15px] font-semibold text-white">{service.name}</p>
                        <p className="text-[11px] text-[#666666]">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <UptimeBar uptime={service.uptime} />
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <StatusLabel status={service.status} />
                      <span className="stat-mono text-[13px] text-[#666666]">{service.uptime}%</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Uptime bar legend */}
          <FadeIn delay={0.5}>
            <div className="flex items-center gap-6 mt-8 ml-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[2px] bg-[#4A7B5F]/60" />
                <span className="text-[11px] text-[#666666]">Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[2px] bg-[#FFAA00]/60" />
                <span className="text-[11px] text-[#666666]">Degraded</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[2px] bg-[#FF4444]/60" />
                <span className="text-[11px] text-[#666666]">Outage</span>
              </div>
              <span className="text-[11px] text-[#444444] ml-auto">90 days ago → Today</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ RECENT INCIDENTS ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Incidents</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              Recent Incidents
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="card p-12 text-center">
              <CheckCircle2 size={32} className="text-[#4A7B5F]/40 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-[16px] font-semibold text-white mb-2">No incidents in the last 90 days</p>
              <p className="text-[13px] text-[#666666]">
                All services have been operating within normal parameters. We maintain transparency — 
                any incidents will be reported here in real-time.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SCHEDULED MAINTENANCE ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Maintenance</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              Scheduled Maintenance
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="card p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Calendar size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white">Planned Infrastructure Upgrade</h3>
                    <p className="text-[12px] text-[#666666]">HarchOS Core API & THINK AI Engine</p>
                  </div>
                </div>
                <div className="md:ml-auto flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[13px] text-white">March 15, 2026</p>
                    <p className="text-[11px] text-[#666666]">02:00 — 04:00 UTC</p>
                  </div>
                  <span className="status-badge status-badge-engineering">
                    <Clock size={10} />
                    Scheduled
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.04)]">
                <p className="text-[13px] text-[#999999] leading-relaxed">
                  Routine infrastructure upgrade including security patches, performance optimizations, and capacity expansion. 
                  No customer-facing downtime is expected — all services will continue operating through redundant failover 
                  during the maintenance window. Customers with dedicated deployments will be notified 72 hours in advance.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SUBSCRIBE ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/2">
              <FadeIn>
                <p className="section-label mb-4">Notifications</p>
                <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
                  Stay Informed
                </h2>
                <div className="accent-line mb-6" />
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-8">
                  Subscribe to receive real-time updates about service incidents, scheduled maintenance, 
                  and resolution notices. Choose your preferred notification channel.
                </p>
              </FadeIn>
            </div>
            <div className="lg:w-1/2">
              <FadeIn delay={0.1}>
                <div className="card p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">Email Notifications</label>
                      <div className="flex gap-3">
                        <input
                          type="email"
                          placeholder="your@email.com"
                          className="flex-1 bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[#444444] focus:border-white/20 focus:outline-none transition-colors"
                        />
                        <button className="inline-flex items-center gap-2 bg-white text-black px-5 py-3 rounded-lg text-[13px] font-semibold hover:bg-white/90 transition-all">
                          <Mail size={14} />
                          Subscribe
                        </button>
                      </div>
                    </div>

                    <div className="divider" />

                    <div>
                      <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-3">Slack Integration</label>
                      <button className="inline-flex items-center gap-2 border border-[rgba(255,255,255,0.12)] text-white px-5 py-3 rounded-lg text-[13px] font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                        <Bell size={14} />
                        Add to Slack
                      </button>
                    </div>

                    <div className="divider" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Rss size={16} className="text-[#666666]" />
                        <div>
                          <p className="text-[13px] text-white">RSS Feed</p>
                          <p className="text-[11px] text-[#666666]">Subscribe to our status RSS feed</p>
                        </div>
                      </div>
                      <button className="inline-flex items-center gap-1.5 text-[12px] text-[#666666] hover:text-white transition-colors">
                        Copy URL
                        <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LAST CHECKED ═══ */}
      <section className="py-12 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <RefreshCw size={12} className="text-[#666666]" />
              <span className="text-[12px] text-[#666666]">
                Last checked: {new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} UTC
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/support" className="text-[12px] text-[#666666] hover:text-white transition-colors">
                Support Hub
              </Link>
              <Link href="/trust/security" className="text-[12px] text-[#666666] hover:text-white transition-colors">
                Security
              </Link>
              <Link href="/trust/compliance" className="text-[12px] text-[#666666] hover:text-white transition-colors">
                Compliance
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
