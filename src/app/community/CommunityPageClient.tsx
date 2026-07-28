'use client';

import Link from 'next/link';
import { ArrowRight, MessageSquare, Github, BookOpen, Users, Globe, Code2, Star, Calendar, Award, Heart, Shield, ExternalLink, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const communityChannels = [
  {
    name: 'Discord',
    desc: 'Official Harch Discord server. Real-time discussions, Q&A, and community support for builders on sovereign infrastructure.',
    members: '2,500+',
    icon: MessageSquare,
    accent: '#5865F2',
    channels: ['#general', '#engineering', '#help', '#showcase'],
    cta: 'Join Discord',
    href: '#',
  },
  {
    name: 'GitHub',
    desc: 'Open source repositories, issue tracking, and contribution guides. Star our repos, file bugs, and submit pull requests.',
    members: '2,300+ stars',
    icon: Github,
    accent: '#FFFFFF',
    channels: ['15 repos', '120+ contributors', 'MIT licensed'],
    cta: 'View on GitHub',
    href: '#', // GitHub org not yet created — replace with real URL when available
  },
  {
    name: 'Stack Overflow',
    desc: 'Ask technical questions, share solutions, and build a knowledge base around HarchOS, SENSE, and ACT.',
    members: '450+ questions',
    icon: BookOpen,
    accent: '#F48024',
    channels: ['#harchos', '#sense-layer', '#act-sdk'],
    cta: 'Browse Questions',
    href: '#',
  },
  {
    name: 'Community Forum',
    desc: 'Long-form discussions, architecture reviews, and project showcases. The place for asynchronous deep conversations.',
    members: '1,800+ threads',
    icon: Users,
    accent: '#8B9DAF',
    channels: ['Community Forum', 'RFCs', 'Show & Tell'],
    cta: 'Visit Forum',
    href: '/community',
  },
];

const communityStats = [
  { label: 'Community Members', value: '5,200+', icon: Users },
  { label: 'Countries', value: '47', icon: Globe },
  { label: 'Contributions', value: '12,000+', icon: Code2 },
  { label: 'Open Source Repos', value: '15', icon: Github },
];

const upcomingEvents = [
  {
    name: 'Harch Community Meetup — Casablanca',
    desc: 'Monthly in-person meetup at the Harch Corp HQ. Lightning talks, networking, and live demos of HarchOS features.',
    date: 'April 15, 2026',
    type: 'Meetup',
    typeColor: 'bg-[rgba(139,157,175,0.08)] border-[rgba(139,157,175,0.15)] text-[#8B9DAF]',
  },
  {
    name: 'Sovereign AI Hackathon',
    desc: '48-hour hackathon: Build an application on HarchOS. $10,000 in prizes. Open to developers across Africa and beyond.',
    date: 'May 22–24, 2026',
    type: 'Hackathon',
    typeColor: 'bg-[rgba(168,85,247,0.08)] border-[rgba(168,85,247,0.15)] text-[#A855F7]',
  },
  {
    name: 'Engineering Office Hours',
    desc: 'Bi-weekly virtual session with the HarchOS core team. Bring your questions about architecture, deployment, and scaling.',
    date: 'Every other Thursday',
    type: 'Office Hours',
    typeColor: 'bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.15)] text-[#22C55E]',
  },
];

export default function CommunityPageClient() {
  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Community</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Build Together.
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Join 5,200+ developers, operators, and infrastructure engineers building the future of sovereign compute. Ask questions, share projects, and shape the platform.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ COMMUNITY CHANNELS ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Channels</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">Where We Connect</h2>
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
            <p className="section-label mb-4">By the Numbers</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">Growing Every Day</h2>
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
            <p className="section-label mb-4 text-[#8B9DAF]">Events</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-12">Upcoming Community Events</h2>
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
                <p className="section-label mb-4 text-[#8B9DAF]">Guidelines</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-6">Community Code of Conduct</h2>
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">
                  We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Our community guidelines apply across all Harch Corp community spaces — Discord, GitHub, forums, and events.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    'Be respectful and constructive in all interactions',
                    'Prioritize learning and knowledge sharing',
                    'Report violations to conduct@harchcorp.com',
                    'Zero tolerance for harassment, discrimination, or spam',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Shield size={14} className="text-[#8B9DAF] shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-[13px] text-[#999999]">{item}</span>
                    </div>
                  ))}
                </div>
                <Link href="/legal/code-of-conduct" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] hover:text-white transition-colors">
                  Read Full Code of Conduct <ArrowRight size={14} />
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div>
                <p className="section-label mb-4 text-[#8B9DAF]">Champions</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-6">Community Champions</h2>
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-6">
                  The Harch Community Champions program recognizes members who go above and beyond — answering questions, contributing code, writing tutorials, and mentoring newcomers.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    'Exclusive access to early product previews and beta features',
                    'Direct communication channel with the engineering team',
                    'Invitation to the annual Champions Summit at Harch HQ',
                    'Harch Corp swag, conference tickets, and recognition',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Award size={14} className="text-[#EAB308] shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-[13px] text-[#999999]">{item}</span>
                    </div>
                  ))}
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] hover:text-white transition-colors cursor-pointer">
                  Apply to Become a Champion <ArrowRight size={14} />
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
                <h3 className="text-xl font-bold text-white mb-3">Join the Discord</h3>
                <p className="text-[14px] text-[#999999] leading-relaxed mb-6">
                  2,500+ members. Real-time help, engineering discussions, and a community that ships. The fastest way to get answers and connect with the team.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#5865F2] group-hover:text-white transition-colors">
                  Join Harch Discord <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card p-8 md:p-10 h-full group cursor-pointer">
                <Star size={20} className="text-[#EAB308] mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-white mb-3">Star on GitHub</h3>
                <p className="text-[14px] text-[#999999] leading-relaxed mb-6">
                  15 open source repositories. 2,300+ stars. Help us build sovereign infrastructure in the open — star our repos, file issues, and submit PRs.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#EAB308] group-hover:text-white transition-colors">
                  Star on GitHub <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
