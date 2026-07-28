'use client';

import Link from 'next/link';
import { ArrowRight, MessageSquare, Github, BookOpen, Users, Globe, Code2, Star, Calendar, Award, Heart, Shield, ExternalLink, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

export default function CommunityPageClient() {
  const t = useTranslations('community');

  const communityChannels = [
    {
      name: t('channels.items.0.name'),
      desc: t('channels.items.0.desc'),
      members: t('channels.items.0.members'),
      icon: MessageSquare,
      accent: '#5865F2',
      channels: [t('channels.items.0.channels.0'), t('channels.items.0.channels.1'), t('channels.items.0.channels.2'), t('channels.items.0.channels.3')],
      cta: t('channels.items.0.cta'),
      href: '#',
    },
    {
      name: t('channels.items.1.name'),
      desc: t('channels.items.1.desc'),
      members: t('channels.items.1.members'),
      icon: Github,
      accent: '#FFFFFF',
      channels: [t('channels.items.1.channels.0'), t('channels.items.1.channels.1'), t('channels.items.1.channels.2')],
      cta: t('channels.items.1.cta'),
      href: '#', // GitHub org not yet created — replace with real URL when available
    },
    {
      name: t('channels.items.2.name'),
      desc: t('channels.items.2.desc'),
      members: t('channels.items.2.members'),
      icon: BookOpen,
      accent: '#F48024',
      channels: [t('channels.items.2.channels.0'), t('channels.items.2.channels.1'), t('channels.items.2.channels.2')],
      cta: t('channels.items.2.cta'),
      href: '#',
    },
    {
      name: t('channels.items.3.name'),
      desc: t('channels.items.3.desc'),
      members: t('channels.items.3.members'),
      icon: Users,
      accent: '#8B9DAF',
      channels: [t('channels.items.3.channels.0'), t('channels.items.3.channels.1'), t('channels.items.3.channels.2')],
      cta: t('channels.items.3.cta'),
      href: '/community',
    },
  ];

  const communityStats = [
    { label: t('stats.items.0.label'), value: t('stats.items.0.value'), icon: Users },
    { label: t('stats.items.1.label'), value: t('stats.items.1.value'), icon: Globe },
    { label: t('stats.items.2.label'), value: t('stats.items.2.value'), icon: Code2 },
    { label: t('stats.items.3.label'), value: t('stats.items.3.value'), icon: Github },
  ];

  const upcomingEvents = [
    {
      name: t('events.items.0.name'),
      desc: t('events.items.0.desc'),
      date: t('events.items.0.date'),
      type: t('events.items.0.type'),
      typeColor: 'bg-[rgba(139,157,175,0.08)] border-[rgba(139,157,175,0.15)] text-[#8B9DAF]',
    },
    {
      name: t('events.items.1.name'),
      desc: t('events.items.1.desc'),
      date: t('events.items.1.date'),
      type: t('events.items.1.type'),
      typeColor: 'bg-[rgba(168,85,247,0.08)] border-[rgba(168,85,247,0.15)] text-[#A855F7]',
    },
    {
      name: t('events.items.2.name'),
      desc: t('events.items.2.desc'),
      date: t('events.items.2.date'),
      type: t('events.items.2.type'),
      typeColor: 'bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.15)] text-[#22C55E]',
    },
  ];

  const conductItems = [
    t('guidelines.conduct.0'),
    t('guidelines.conduct.1'),
    t('guidelines.conduct.2'),
    t('guidelines.conduct.3'),
  ];

  const championPerks = [
    t('champions.perks.0'),
    t('champions.perks.1'),
    t('champions.perks.2'),
    t('champions.perks.3'),
  ];

  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('hero.label')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('hero.title')}
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('hero.description')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ COMMUNITY CHANNELS ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('channels.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">{t('channels.title')}</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {communityChannels.map((channel, i) => {
              const Icon = channel.icon;
              return (
                <FadeIn key={channel.name} delay={i * 0.08}>
                  <div className="card p-6 md:p-8 h-full group cursor-pointer">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                          <Icon size={20} className="text-white" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{channel.name}</h3>
                          <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">{channel.members}</span>
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-[rgba(255,255,255,0.15)] group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-[14px] text-[#999999] leading-relaxed mb-5">{channel.desc}</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {channel.channels.map((ch) => (
                        <span key={ch} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-[10px] font-[family-name:var(--font-space-mono)] text-[#999999]">
                          <Hash size={8} />{ch}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">
                      {channel.cta} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ COMMUNITY STATS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('stats.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">{t('stats.title')}</h2>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {communityStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <FadeIn key={stat.label} delay={i * 0.08}>
                  <div className="card p-6 text-center">
                    <Icon size={20} className="text-[#8B9DAF] mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-3xl md:text-4xl font-bold text-white stat-mono mb-2">{stat.value}</p>
                    <p className="text-[12px] text-[#999999] leading-relaxed">{stat.label}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ UPCOMING EVENTS ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('events.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">{t('events.title')}</h2>
          </FadeIn>

          <div className="space-y-4">
            {upcomingEvents.map((event, i) => (
              <FadeIn key={event.name} delay={i * 0.06}>
                <div className="vertical-row group block p-6 md:p-8 cursor-pointer">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                    <div className="shrink-0">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-[#8B9DAF]" strokeWidth={1.5} />
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[9px] font-bold tracking-[0.12em] uppercase ${event.typeColor}`}>
                          {event.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)] mt-2 block">{event.date}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-[#CCCCCC] transition-colors mb-1">{event.name}</h3>
                      <p className="text-[14px] text-[#999999] leading-relaxed">{event.desc}</p>
                    </div>
                    <ArrowRight size={16} className="vertical-arrow text-[rgba(255,255,255,0.1)] group-hover:text-white transition-all shrink-0" />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMMUNITY GUIDELINES ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
            <FadeIn>
              <div>
                <p className="section-label mb-4 text-[#8B9DAF]">{t('guidelines.label')}</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-6">{t('guidelines.title')}</h2>
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">
                  {t('guidelines.description')}
                </p>
                <div className="space-y-3 mb-8">
                  {conductItems.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Shield size={14} className="text-[#8B9DAF] shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-[13px] text-[#999999]">{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/legal/code-of-conduct" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] hover:text-white transition-colors">
                  {t('guidelines.readFull')} <ArrowRight size={14} />
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div>
                <p className="section-label mb-4 text-[#8B9DAF]">{t('champions.label')}</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-6">{t('champions.title')}</h2>
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">
                  {t('champions.description')}
                </p>
                <div className="space-y-3 mb-8">
                  {championPerks.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Award size={14} className="text-[#EAB308] shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-[13px] text-[#999999]">{item}</span>
                    </div>
                  ))}
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] hover:text-white transition-colors cursor-pointer">
                  {t('champions.apply')} <ArrowRight size={14} />
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ CTA: Join Discord / Star on GitHub ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn>
              <div className="card p-8 md:p-10 h-full group cursor-pointer">
                <MessageSquare size={20} className="text-[#5865F2] mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-white mb-3">{t('cta.discord.title')}</h3>
                <p className="text-[14px] text-[#999999] leading-relaxed mb-6">
                  {t('cta.discord.description')}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#5865F2] group-hover:text-white transition-colors">
                  {t('cta.discord.cta')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card p-8 md:p-10 h-full group cursor-pointer">
                <Star size={20} className="text-[#EAB308] mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-white mb-3">{t('cta.github.title')}</h3>
                <p className="text-[14px] text-[#999999] leading-relaxed mb-6">
                  {t('cta.github.description')}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#EAB308] group-hover:text-white transition-colors">
                  {t('cta.github.cta')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
