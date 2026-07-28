'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Calendar, Users, Clock, Video, Mic, Building2, Globe, Zap, MonitorPlay, ChevronRight, Send, Presentation } from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const upcomingEvents = [
  {
    name: 'Harch Summit 2026',
    desc: 'Our annual flagship conference brings together 2,000+ engineers, operators, and policy leaders for three days of keynotes, workshops, and networking. Featuring 50+ sessions on sovereign AI, green infrastructure, and African industrial development.',
    date: 'November 10–12, 2026',
    location: 'Casablanca, Morocco',
    type: 'Annual Conference',
    typeColor: 'bg-[rgba(139,157,175,0.08)] border-[rgba(139,157,175,0.15)] text-[#8B9DAF]',
    attendees: '2,000+',
    sessions: '50+',
    featured: true,
  },
  {
    name: 'Sovereign AI Workshop',
    desc: 'A hands-on, half-day workshop covering HarchOS fundamentals, GPU scheduling, and deploying your first inference workload on sovereign infrastructure. Bring your laptop.',
    date: 'April 22, 2026',
    location: 'Virtual',
    type: 'Workshop',
    typeColor: 'bg-[rgba(168,85,247,0.08)] border-[rgba(168,85,247,0.15)] text-[#A855F7]',
    attendees: '500',
    sessions: '1',
  },
  {
    name: 'Green Data Center Summit',
    desc: 'One day of talks and panels on renewable-powered compute, cooling innovation, and the economics of green data centers in North and West Africa. Co-hosted with Senegal\'s Ministry of Energy.',
    date: 'June 18, 2026',
    location: 'Dakar, Senegal',
    type: 'Summit',
    typeColor: 'bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.15)] text-[#22C55E]',
    attendees: '800+',
    sessions: '20+',
  },
  {
    name: 'Developer Day',
    desc: 'A free, virtual event for developers. SDK deep-dives, live coding sessions, and the official launch of HarchOS v2.0. Open to all skill levels.',
    date: 'July 15, 2026',
    location: 'Virtual',
    type: 'Developer Day',
    typeColor: 'bg-[rgba(234,179,8,0.08)] border-[rgba(234,179,8,0.15)] text-[#EAB308]',
    attendees: '3,000+',
    sessions: '12',
  },
];

const webinars = [
  {
    name: 'Introduction to Sovereign Compute on HarchOS',
    desc: 'Get started with HarchOS — from account setup to your first GPU workload. Live demo and Q&A with the core engineering team.',
    date: 'March 26, 2026',
    time: '14:00 UTC',
    speaker: 'Youssef Benali, Principal Engineer',
  },
  {
    name: 'Building Resilient AI Pipelines with SENSE and THINK',
    desc: 'Learn how to chain the SENSE ingestion layer with the THINK inference engine for production-grade AI pipelines with automatic failover.',
    date: 'April 9, 2026',
    time: '15:00 UTC',
    speaker: 'Fatima Zahra El Idrissi, ML Platform Lead',
  },
  {
    name: 'Zero-Trust Security for Multi-Tenant Infrastructure',
    desc: 'A deep-dive into our SPIFFE-based identity framework, eBPF firewall, and how we achieve tenant isolation on shared GPU clusters.',
    date: 'April 23, 2026',
    time: '14:00 UTC',
    speaker: 'Karim Oujdi, Security Architect',
  },
];

const pastEvents = [
  {
    name: 'Harch Summit 2025',
    desc: '1,200 attendees. 30 sessions. Keynote on the SENSE layer launch and the HarchOS 1.0 roadmap.',
    date: 'November 2025',
    location: 'Casablanca, Morocco',
    type: 'Conference',
  },
  {
    name: 'African AI Infrastructure Roundtable',
    desc: 'Closed-door session with 15 African telecom operators on sovereign compute requirements and deployment models.',
    date: 'September 2025',
    location: 'Tunis, Tunisia',
    type: 'Roundtable',
  },
  {
    name: 'Renewable Energy & Data Centers Symposium',
    desc: 'Joint event with IRENA on the intersection of green energy and hyperscale compute in the MENA region.',
    date: 'June 2025',
    location: 'Abu Dhabi, UAE',
    type: 'Symposium',
  },
];

export default function EventsPageClient() {
  const [speakerForm, setSpeakerForm] = useState({
    name: '',
    email: '',
    organization: '',
    event: '',
    topic: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Events</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Where Infrastructure<br/>Meets Community
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Summits, workshops, webinars, and developer days. Join us in person across Africa or online from anywhere in the world. Learn, build, and connect.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ ANNUAL CONFERENCE — Featured ═══ */}
      <section className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6 text-[#8B9DAF]">Flagship Event</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="relative card p-8 md:p-12 lg:p-16 overflow-hidden group cursor-pointer">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#8B9DAF]" />
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)] text-[9px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">
                      <Presentation size={10} />Annual Conference
                    </span>
                    <span className="text-[11px] text-[#666666] flex items-center gap-1 font-[family-name:var(--font-space-mono)]">
                      <Calendar size={10} />November 10–12, 2026
                    </span>
                    <span className="text-[11px] text-[#666666] flex items-center gap-1 font-[family-name:var(--font-space-mono)]">
                      <MapPin size={10} />Casablanca, Morocco
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-[40px] font-bold text-white tracking-tight mb-5 leading-[1.15] group-hover:text-[#CCCCCC] transition-colors">
                    Harch Summit 2026
                  </h2>
                  <p className="text-[15px] text-[#999999] leading-[1.7] max-w-3xl mb-8">
                    Three days. 2,000+ attendees. 50+ sessions. The definitive conference on sovereign AI infrastructure, green compute, and Africa&apos;s industrial future. Keynotes from Harch leadership, hands-on workshops, and networking with operators across the continent.
                  </p>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#8B9DAF]" strokeWidth={1.5} />
                      <span className="text-[13px] text-[#999999]">2,000+ Attendees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-[#8B9DAF]" strokeWidth={1.5} />
                      <span className="text-[13px] text-[#999999]">50+ Sessions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-[#8B9DAF]" strokeWidth={1.5} />
                      <span className="text-[13px] text-[#999999]">3 Days</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">
                    Register Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
                <div className="hidden md:flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-[rgba(139,157,175,0.06)] border border-[rgba(139,157,175,0.12)] shrink-0">
                  <span className="text-[10px] font-bold text-[#8B9DAF] tracking-[0.1em] uppercase">2026</span>
                  <span className="text-xl font-bold text-white">NOV</span>
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
            <p className="section-label mb-4">Upcoming</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">Events Calendar</h2>
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
                            <Users size={10} />{event.attendees} attendees
                          </span>
                          {event.sessions && (
                            <span className="text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)] flex items-center gap-1">
                              <Zap size={10} />{event.sessions} sessions
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
            <p className="section-label mb-4 text-[#8B9DAF]">Webinars</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">Upcoming Webinars</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {webinars.map((webinar, i) => (
              <FadeIn key={webinar.name} delay={i * 0.08}>
                <div className="card p-6 h-full flex flex-col group cursor-pointer">
                  <div className="flex items-center gap-2 mb-4">
                    <MonitorPlay size={16} className="text-[#8B9DAF]" strokeWidth={1.5} />
                    <span className="text-[10px] font-[family-name:var(--font-space-mono)] text-[#666666]">Webinar</span>
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
                    Register
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
            <p className="section-label mb-4">Archive</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">Past Events</h2>
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
              <p className="section-label mb-4 text-[#8B9DAF]">Speaker Request</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-4">Request a Harch Corp Speaker</h2>
              <p className="text-[15px] text-[#999999] leading-[1.7] mb-10">
                Looking for a speaker on sovereign AI, African industrial development, renewable energy, or distributed systems? Our leadership and engineering team regularly keynotes at conferences, corporate events, and academic institutions worldwide.
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              {submitted ? (
                <div className="card p-8 text-center">
                  <p className="text-white font-semibold text-lg">Request Submitted</p>
                  <p className="text-[14px] text-[#999999] mt-2">We&apos;ll review your request and respond within 2 business days.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={speakerForm.name}
                      onChange={(e) => setSpeakerForm(prev => ({ ...prev, name: e.target.value }))}
                      className="px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-[14px] placeholder-[#666666] focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={speakerForm.email}
                      onChange={(e) => setSpeakerForm(prev => ({ ...prev, email: e.target.value }))}
                      className="px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-[14px] placeholder-[#666666] focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Organization"
                      value={speakerForm.organization}
                      onChange={(e) => setSpeakerForm(prev => ({ ...prev, organization: e.target.value }))}
                      className="px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-[14px] placeholder-[#666666] focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Event Name"
                      value={speakerForm.event}
                      onChange={(e) => setSpeakerForm(prev => ({ ...prev, event: e.target.value }))}
                      className="px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-[14px] placeholder-[#666666] focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Requested Topic"
                    value={speakerForm.topic}
                    onChange={(e) => setSpeakerForm(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-[14px] placeholder-[#666666] focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors"
                  />
                  <textarea
                    placeholder="Additional details about the event, audience, and format..."
                    rows={4}
                    value={speakerForm.message}
                    onChange={(e) => setSpeakerForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-[14px] placeholder-[#666666] focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors resize-none"
                  />
                  <button
                    onClick={() => setSubmitted(true)}
                    className="px-8 py-3 rounded-lg bg-white text-black text-[12px] font-bold tracking-[0.06em] uppercase hover:bg-[#CCCCCC] transition-colors flex items-center gap-2"
                  >
                    <Send size={14} />Submit Request
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
                <h3 className="text-xl font-bold text-white mb-3">Register for Harch Summit 2026</h3>
                <p className="text-[14px] text-[#999999] leading-relaxed mb-6">
                  Early bird pricing available until June 2026. Academic and community discounts available. Join 2,000+ attendees in Casablanca this November.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">
                  Register Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card p-8 md:p-10 h-full group cursor-pointer">
                <Building2 size={20} className="text-[#8B9DAF] mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-white mb-3">Sponsor an Event</h3>
                <p className="text-[14px] text-[#999999] leading-relaxed mb-6">
                  Partner with Harch Corp to reach decision-makers in AI infrastructure, renewable energy, and industrial development across Africa. Sponsorship packages start at $5,000.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">
                  Learn About Sponsorship <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
