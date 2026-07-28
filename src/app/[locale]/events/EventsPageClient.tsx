'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Calendar, Users, Clock, Video, Mic, Building2, Globe, Zap, MonitorPlay, ChevronRight, Send, Presentation } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { FadeIn } from '@/components/ui/motion';

export default function EventsPageClient() {
  const t = useTranslations('events');

  const [speakerForm, setSpeakerForm] = useState({
    name: '',
    email: '',
    organization: '',
    event: '',
    topic: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const upcomingEvents = [
    {
      name: t('upcoming.items.0.name'),
      desc: t('upcoming.items.0.desc'),
      date: t('upcoming.items.0.date'),
      location: t('upcoming.items.0.location'),
      type: t('upcoming.items.0.type'),
      typeColor: 'bg-[rgba(139,157,175,0.08)] border-[rgba(139,157,175,0.15)] text-[#8B9DAF]',
      attendees: t('upcoming.items.0.attendees'),
      sessions: t('upcoming.items.0.sessions'),
      featured: true,
    },
    {
      name: t('upcoming.items.1.name'),
      desc: t('upcoming.items.1.desc'),
      date: t('upcoming.items.1.date'),
      location: t('upcoming.items.1.location'),
      type: t('upcoming.items.1.type'),
      typeColor: 'bg-[rgba(168,85,247,0.08)] border-[rgba(168,85,247,0.15)] text-[#A855F7]',
      attendees: t('upcoming.items.1.attendees'),
      sessions: t('upcoming.items.1.sessions'),
    },
    {
      name: t('upcoming.items.2.name'),
      desc: t('upcoming.items.2.desc'),
      date: t('upcoming.items.2.date'),
      location: t('upcoming.items.2.location'),
      type: t('upcoming.items.2.type'),
      typeColor: 'bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.15)] text-[#22C55E]',
      attendees: t('upcoming.items.2.attendees'),
      sessions: t('upcoming.items.2.sessions'),
    },
    {
      name: t('upcoming.items.3.name'),
      desc: t('upcoming.items.3.desc'),
      date: t('upcoming.items.3.date'),
      location: t('upcoming.items.3.location'),
      type: t('upcoming.items.3.type'),
      typeColor: 'bg-[rgba(234,179,8,0.08)] border-[rgba(234,179,8,0.15)] text-[#EAB308]',
      attendees: t('upcoming.items.3.attendees'),
      sessions: t('upcoming.items.3.sessions'),
    },
  ];

  const webinars = [
    {
      name: t('webinars.items.0.name'),
      desc: t('webinars.items.0.desc'),
      date: t('webinars.items.0.date'),
      time: t('webinars.items.0.time'),
      speaker: t('webinars.items.0.speaker'),
    },
    {
      name: t('webinars.items.1.name'),
      desc: t('webinars.items.1.desc'),
      date: t('webinars.items.1.date'),
      time: t('webinars.items.1.time'),
      speaker: t('webinars.items.1.speaker'),
    },
    {
      name: t('webinars.items.2.name'),
      desc: t('webinars.items.2.desc'),
      date: t('webinars.items.2.date'),
      time: t('webinars.items.2.time'),
      speaker: t('webinars.items.2.speaker'),
    },
  ];

  const pastEvents = [
    {
      name: t('past.items.0.name'),
      desc: t('past.items.0.desc'),
      date: t('past.items.0.date'),
      location: t('past.items.0.location'),
      type: t('past.items.0.type'),
    },
    {
      name: t('past.items.1.name'),
      desc: t('past.items.1.desc'),
      date: t('past.items.1.date'),
      location: t('past.items.1.location'),
      type: t('past.items.1.type'),
    },
    {
      name: t('past.items.2.name'),
      desc: t('past.items.2.desc'),
      date: t('past.items.2.date'),
      location: t('past.items.2.location'),
      type: t('past.items.2.type'),
    },
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

      {/* ═══ ANNUAL CONFERENCE — Featured ═══ */}
      <section className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6 text-[#8B9DAF]">{t('flagship.label')}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="relative card p-8 md:p-12 lg:p-16 overflow-hidden group cursor-pointer">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#8B9DAF]" />
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)] text-[9px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">
                      <Presentation size={10} />{t('flagship.conferenceType')}
                    </span>
                    <span className="text-[11px] text-[#666666] flex items-center gap-1 font-[family-name:var(--font-space-mono)]">
                      <Calendar size={10} />{t('flagship.date')}
                    </span>
                    <span className="text-[11px] text-[#666666] flex items-center gap-1 font-[family-name:var(--font-space-mono)]">
                      <MapPin size={10} />{t('flagship.location')}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-[40px] font-bold text-white tracking-tight mb-5 leading-[1.15] group-hover:text-[#CCCCCC] transition-colors">
                    {t('flagship.title')}
                  </h2>
                  <p className="text-[15px] text-[#999999] leading-[1.7] max-w-3xl mb-8">
                    {t('flagship.description')}
                  </p>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#8B9DAF]" strokeWidth={1.5} />
                      <span className="text-[13px] text-[#999999]">{t('flagship.attendees')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-[#8B9DAF]" strokeWidth={1.5} />
                      <span className="text-[13px] text-[#999999]">{t('flagship.sessions')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-[#8B9DAF]" strokeWidth={1.5} />
                      <span className="text-[13px] text-[#999999]">{t('flagship.days')}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">
                    {t('flagship.registerNow')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
                <div className="hidden md:flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-[rgba(139,157,175,0.06)] border border-[rgba(139,157,175,0.12)] shrink-0">
                  <span className="text-[10px] font-bold text-[#8B9DAF] tracking-[0.1em] uppercase">{t('flagship.year')}</span>
                  <span className="text-xl font-bold text-white">{t('flagship.month')}</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ UPCOMING EVENTS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('upcoming.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">{t('upcoming.title')}</h2>
          </FadeIn>

          <div className="space-y-4">
            {upcomingEvents.map((event, i) => (
              <FadeIn key={event.name} delay={i * 0.06}>
                <div className="vertical-row group block p-6 md:p-8 cursor-pointer">
                  <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                    <div className="shrink-0 md:w-48">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-[9px] font-bold tracking-[0.12em] uppercase ${event.typeColor}`}>
                          {event.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)] flex items-center gap-1">
                        <Calendar size={9} />{event.date}
                      </span>
                      <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)] flex items-center gap-1 mt-1">
                        <MapPin size={9} />{event.location}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-[#CCCCCC] transition-colors mb-2">{event.name}</h3>
                      <p className="text-[14px] text-[#999999] leading-relaxed">{event.desc}</p>
                      {event.attendees && (
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)] flex items-center gap-1">
                            <Users size={10} />{event.attendees} {t('upcoming.attendeesLabel')}
                          </span>
                          {event.sessions && (
                            <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)] flex items-center gap-1">
                              <Zap size={10} />{event.sessions} {t('upcoming.sessionsLabel')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={16} className="vertical-arrow text-[rgba(255,255,255,0.1)] group-hover:text-white transition-all shrink-0 mt-2 md:mt-4" />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WEBINARS ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('webinars.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">{t('webinars.title')}</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {webinars.map((webinar, i) => (
              <FadeIn key={webinar.name} delay={i * 0.08}>
                <div className="card p-6 h-full flex flex-col group cursor-pointer">
                  <div className="flex items-center gap-2 mb-4">
                    <MonitorPlay size={16} className="text-[#8B9DAF]" strokeWidth={1.5} />
                    <span className="text-[10px] font-[family-name:var(--font-space-mono)] text-[#666666]">{t('webinars.typeLabel')}</span>
                  </div>
                  <h3 className="text-[16px] font-bold text-white group-hover:text-[#CCCCCC] transition-colors mb-3 leading-snug flex-1">
                    {webinar.name}
                  </h3>
                  <p className="text-[13px] text-[#999999] leading-relaxed mb-4">{webinar.desc}</p>
                  <div className="space-y-1.5 mb-5">
                    <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)] flex items-center gap-1.5">
                      <Calendar size={9} />{webinar.date} — {webinar.time}
                    </span>
                    <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)] flex items-center gap-1.5">
                      <Mic size={9} />{webinar.speaker}
                    </span>
                  </div>
                  <button className="w-full px-4 py-2.5 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)] text-[11px] font-bold tracking-[0.08em] uppercase text-[#8B9DAF] hover:bg-[rgba(139,157,175,0.15)] hover:text-white transition-all">
                    {t('webinars.register')}
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PAST EVENTS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">{t('past.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">{t('past.title')}</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastEvents.map((event, i) => (
              <FadeIn key={event.name} delay={i * 0.08}>
                <div className="card p-6 h-full group cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-[9px] font-bold tracking-[0.1em] uppercase text-[#666666]">
                      {event.type}
                    </span>
                    <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">{event.date}</span>
                  </div>
                  <h3 className="text-[16px] font-bold text-white mb-3 leading-snug">{event.name}</h3>
                  <p className="text-[13px] text-[#999999] leading-relaxed mb-3">{event.desc}</p>
                  <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)] flex items-center gap-1">
                    <MapPin size={9} />{event.location}
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REQUEST A SPEAKER ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <p className="section-label mb-4 text-[#8B9DAF]">{t('speaker.label')}</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-4">{t('speaker.title')}</h2>
              <p className="text-[15px] text-[#999999] leading-[1.7] mb-10">
                {t('speaker.description')}
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              {submitted ? (
                <div className="card p-8 text-center">
                  <p className="text-white font-semibold text-lg">{t('speaker.submittedTitle')}</p>
                  <p className="text-[14px] text-[#999999] mt-2">{t('speaker.submittedDescription')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t('speaker.form.name')}
                      value={speakerForm.name}
                      onChange={(e) => setSpeakerForm(prev => ({ ...prev, name: e.target.value }))}
                      className="px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-[14px] placeholder-[#666666] focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors"
                    />
                    <input
                      type="email"
                      placeholder={t('speaker.form.email')}
                      value={speakerForm.email}
                      onChange={(e) => setSpeakerForm(prev => ({ ...prev, email: e.target.value }))}
                      className="px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-[14px] placeholder-[#666666] focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t('speaker.form.organization')}
                      value={speakerForm.organization}
                      onChange={(e) => setSpeakerForm(prev => ({ ...prev, organization: e.target.value }))}
                      className="px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-[14px] placeholder-[#666666] focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors"
                    />
                    <input
                      type="text"
                      placeholder={t('speaker.form.eventName')}
                      value={speakerForm.event}
                      onChange={(e) => setSpeakerForm(prev => ({ ...prev, event: e.target.value }))}
                      className="px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-[14px] placeholder-[#666666] focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder={t('speaker.form.topic')}
                    value={speakerForm.topic}
                    onChange={(e) => setSpeakerForm(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-[14px] placeholder-[#666666] focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors"
                  />
                  <textarea
                    placeholder={t('speaker.form.messagePlaceholder')}
                    rows={4}
                    value={speakerForm.message}
                    onChange={(e) => setSpeakerForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-[14px] placeholder-[#666666] focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors resize-none"
                  />
                  <button
                    onClick={() => setSubmitted(true)}
                    className="px-8 py-3 rounded-lg bg-white text-black text-[12px] font-bold tracking-[0.06em] uppercase hover:bg-[#CCCCCC] transition-colors flex items-center gap-2"
                  >
                    <Send size={14} />{t('speaker.form.submit')}
                  </button>
                </div>
              )}
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ CTA: Register / Sponsor ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn>
              <div className="card p-8 md:p-10 h-full group cursor-pointer">
                <Calendar size={20} className="text-[#8B9DAF] mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-white mb-3">{t('cta.register.title')}</h3>
                <p className="text-[14px] text-[#999999] leading-relaxed mb-6">
                  {t('cta.register.description')}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">
                  {t('cta.register.cta')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card p-8 md:p-10 h-full group cursor-pointer">
                <Building2 size={20} className="text-[#8B9DAF] mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-white mb-3">{t('cta.sponsor.title')}</h3>
                <p className="text-[14px] text-[#999999] leading-relaxed mb-6">
                  {t('cta.sponsor.description')}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">
                  {t('cta.sponsor.cta')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
