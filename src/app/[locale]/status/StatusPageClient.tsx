'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
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

type ServiceStatus = 'operational' | 'degraded' | 'outage';

interface Service {
  nameKey: string;
  status: ServiceStatus;
  uptime: number;
  descriptionKey: string;
}

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

function StatusLabel({ status, t }: { status: ServiceStatus; t: (key: string) => string }) {
  const labels = {
    operational: t('operational'),
    degraded: t('degradedPerformance'),
    outage: t('serviceOutage'),
  };
  const textColors = {
    operational: 'text-[#4A7B5F]',
    degraded: 'text-[#FFAA00]',
    outage: 'text-[#FF4444]',
  };
  return <span className={`text-[13px] font-medium ${textColors[status]}`}>{labels[status]}</span>;
}

function UptimeBar({ uptime, t }: { uptime: number; t: (key: string, params?: Record<string, string | number>) => string }) {
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
      blocks.push({ status: 'operational', day: i });
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
          title={t('dayTooltip', { day: block.day + 1, status: block.status === 'operational' ? t('operational') : block.status === 'degraded' ? t('degraded') : t('outage') })}
        />
      ))}
    </div>
  );
}

export default function StatusPageClient() {
  const t = useTranslations('status');
  const locale = useLocale();
  const [lastChecked, setLastChecked] = useState('');

  useEffect(() => {
    const update = () => {
      setLastChecked(new Date().toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }) + ' ' + t('utc'));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const services: Service[] = [
    { nameKey: 'services.harchosCoreApi.name', status: 'operational', uptime: 99.99, descriptionKey: 'services.harchosCoreApi.description' },
    { nameKey: 'services.senseDataPipeline.name', status: 'operational', uptime: 99.98, descriptionKey: 'services.senseDataPipeline.description' },
    { nameKey: 'services.thinkAiEngine.name', status: 'operational', uptime: 99.97, descriptionKey: 'services.thinkAiEngine.description' },
    { nameKey: 'services.actExecutionLayer.name', status: 'operational', uptime: 99.99, descriptionKey: 'services.actExecutionLayer.description' },
    { nameKey: 'services.developerPortal.name', status: 'operational', uptime: 99.99, descriptionKey: 'services.developerPortal.description' },
    { nameKey: 'services.cliSdkServices.name', status: 'operational', uptime: 99.98, descriptionKey: 'services.cliSdkServices.description' },
    { nameKey: 'services.managementConsole.name', status: 'operational', uptime: 99.99, descriptionKey: 'services.managementConsole.description' },
    { nameKey: 'services.authenticationService.name', status: 'operational', uptime: 99.99, descriptionKey: 'services.authenticationService.description' },
  ];

  const overallUptime = 99.98;
  const allOperational = services.every((s) => s.status === 'operational');

  return (
    <div className="bg-[#121212]">
      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('heroLabel')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('heroTitle')}
            </h1>
            <div className="accent-line mb-6" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('heroDescription')}
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
                      {allOperational ? t('allSystemsOperational') : t('partialServiceDisruption')}
                    </h2>
                    <p className="text-[14px] text-[#999999] mt-1">
                      {allOperational
                        ? t('allSystemsOperationalDesc')
                        : t('partialServiceDisruptionDesc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="stat-mono text-3xl md:text-4xl font-bold text-white">{overallUptime}%</p>
                    <p className="text-[12px] text-[#666666]">{t('uptime90Days')}</p>
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
            <p className="section-label mb-4">{t('servicesLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              {t('serviceStatusTitle')}
            </h2>
          </FadeIn>

          <div className="space-y-4">
            {services.map((service, i) => (
              <FadeIn key={service.nameKey} delay={i * 0.05}>
                <div className="card p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                    <div className="flex items-center gap-3 lg:w-[320px] flex-shrink-0">
                      <StatusDot status={service.status} />
                      <div>
                        <p className="text-[15px] font-semibold text-white">{t(service.nameKey)}</p>
                        <p className="text-[11px] text-[#666666]">{t(service.descriptionKey)}</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <UptimeBar uptime={service.uptime} t={t} />
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <StatusLabel status={service.status} t={t} />
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
                <span className="text-[11px] text-[#666666]">{t('operational')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[2px] bg-[#FFAA00]/60" />
                <span className="text-[11px] text-[#666666]">{t('degraded')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[2px] bg-[#FF4444]/60" />
                <span className="text-[11px] text-[#666666]">{t('outage')}</span>
              </div>
              <span className="text-[11px] text-[#444444] ml-auto">{t('daysAgoToToday')}</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ RECENT INCIDENTS ═══ */}
      <section className="py-28 md:py-36 bg-[#121212] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('incidentsLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              {t('recentIncidentsTitle')}
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="card p-12 text-center">
              <CheckCircle2 size={32} className="text-[#4A7B5F]/40 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-[16px] font-semibold text-white mb-2">{t('noIncidentsTitle')}</p>
              <p className="text-[13px] text-[#666666]">
                {t('noIncidentsDescription')}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SCHEDULED MAINTENANCE ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D] border-t border-[rgba(255,255,255,0.06)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('maintenanceLabel')}</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              {t('scheduledMaintenanceTitle')}
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
                    <h3 className="text-[15px] font-bold text-white">{t('maintenanceName')}</h3>
                    <p className="text-[12px] text-[#666666]">{t('maintenanceServices')}</p>
                  </div>
                </div>
                <div className="md:ml-auto flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[13px] text-white">{t('maintenanceDate')}</p>
                    <p className="text-[11px] text-[#666666]">{t('maintenanceTime')}</p>
                  </div>
                  <span className="status-badge status-badge-engineering">
                    <Clock size={10} />
                    {t('maintenanceBadge')}
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.04)]">
                <p className="text-[13px] text-[#999999] leading-relaxed">
                  {t('maintenanceDescription')}
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
                <p className="section-label mb-4">{t('notificationsLabel')}</p>
                <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
                  {t('stayInformedTitle')}
                </h2>
                <div className="accent-line mb-6" />
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-8">
                  {t('stayInformedDescription')}
                </p>
              </FadeIn>
            </div>
            <div className="lg:w-1/2">
              <FadeIn delay={0.1}>
                <div className="card p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-2">{t('emailNotifications')}</label>
                      <div className="flex gap-3">
                        <input
                          type="email"
                          placeholder={t('emailPlaceholder')}
                          className="flex-1 bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-[#444444] focus:border-white/20 focus:outline-none transition-colors"
                        />
                        <button className="inline-flex items-center gap-2 bg-white text-black px-5 py-3 rounded-lg text-[13px] font-semibold hover:bg-white/90 transition-all">
                          <Mail size={14} />
                          {t('subscribe')}
                        </button>
                      </div>
                    </div>

                    <div className="divider" />

                    <div>
                      <label className="block text-[12px] font-semibold text-[#999999] uppercase tracking-wider mb-3">{t('slackIntegration')}</label>
                      <button className="inline-flex items-center gap-2 border border-[rgba(255,255,255,0.12)] text-white px-5 py-3 rounded-lg text-[13px] font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                        <Bell size={14} />
                        {t('addToSlack')}
                      </button>
                    </div>

                    <div className="divider" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Rss size={16} className="text-[#666666]" />
                        <div>
                          <p className="text-[13px] text-white">{t('rssFeed')}</p>
                          <p className="text-[11px] text-[#666666]">{t('rssFeedDescription')}</p>
                        </div>
                      </div>
                      <button className="inline-flex items-center gap-1.5 text-[12px] text-[#666666] hover:text-white transition-colors">
                        {t('copyUrl')}
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
                {t('lastChecked')} {lastChecked}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/support" className="text-[12px] text-[#666666] hover:text-white transition-colors">
                {t('supportHub')}
              </Link>
              <Link href="/trust/security" className="text-[12px] text-[#666666] hover:text-white transition-colors">
                {t('security')}
              </Link>
              <Link href="/trust/compliance" className="text-[12px] text-[#666666] hover:text-white transition-colors">
                {t('compliance')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
