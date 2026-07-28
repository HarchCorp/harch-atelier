'use client';

import Link from 'next/link';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CountUp,
  SectionDivider,
  Card3D,
} from '@/components/ui/motion';
import {
  ArrowRight,
  Shield,
  Leaf,
  Award,
  Zap,
  Target,
  Eye,
  Heart,
  Scale,
  Sparkles,
  Users,
  Briefcase,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const heroStats = [
  { value: 2024, label: 'Founded', suffix: '' },
  { value: 8, label: 'Verticals Planned', suffix: '' },
  { value: 2400, label: '$M Pipeline', suffix: '' },
  { value: 25, label: 'Countries by 2050', suffix: '+' },
];

const missionPillars = [
  {
    icon: Shield,
    title: 'Sovereignty',
    tag: 'Pillar 01',
    desc: 'Building infrastructure that Africa will own, operate, and control. No dependency, no extraction — just self-reliance. Every data center, every watt of energy, every line of code under African ownership.',
  },
  {
    icon: Leaf,
    title: 'Sustainability',
    tag: 'Pillar 02',
    desc: 'Carbon-first by architecture, not by offset. 48.2 gCO₂/kWh average across our GPU mesh — 89% below the hyperscaler average. Net-zero operations by 2030, not 2050.',
  },
  {
    icon: Award,
    title: 'Excellence',
    tag: 'Pillar 03',
    desc: 'World-class engineering, governance, and execution. International certifications across all verticals. We accept nothing less than the best — because the continent cannot afford mediocrity.',
  },
];

const values = [
  { icon: Shield, title: 'Sovereignty', desc: 'Africa owns what Africa builds. No foreign control, no value extraction, no dependency. Self-reliance as the only acceptable end state.' },
  { icon: Zap, title: 'Speed', desc: 'The continent cannot wait. We move with urgency — executing projects with precision and pace that matches the scale of the opportunity.' },
  { icon: Target, title: 'Integration', desc: 'Vertically integrated from raw materials to finished infrastructure. We control every link in the chain for structural cost advantages of 30-50%.' },
  { icon: Eye, title: 'Transparency', desc: 'Build in Public. Every milestone documented, every metric published, every failure admitted. Trust through radical transparency.' },
  { icon: Heart, title: 'Stewardship', desc: 'We are custodians, not extractors. The infrastructure we build will outlive us — designed for the next century, not the next quarter.' },
  { icon: Scale, title: 'Discipline', desc: 'Build One At A Time. Each filiale reaches profitability before the next activates. Disciplined capital allocation over growth-at-all-costs.' },
];

const leadership = [
  {
    name: 'Amine Harch El Korane',
    title: 'Founder & CEO',
    desc: 'Founded Harch Corp in 2024 with a 100-year vision: build Africa\'s sovereign industrial backbone, one filiale at a time. Currently the sole operator — every milestone documented publicly. Senior co-founders and advisors will be announced as each filiale is activated.',
    initials: 'AHK',
  },
  {
    name: 'Team — Phase 2',
    title: 'Harch Intelligence',
    desc: 'VP Engineering, VP Infrastructure, VP Sales. To be announced when Harch Intelligence reaches activation phase (2027-2028). No executives currently retained beyond the founder.',
    initials: '—',
  },
  {
    name: 'Team — Phase 3',
    title: 'Harch Energy',
    desc: 'VP Engineering (Solar EPC), VP Project Finance, VP Operations. To be announced when Harch Energy reaches activation phase (2028-2030). Recruitment begins at filiale activation.',
    initials: '—',
  },
  {
    name: 'Advisory Board',
    title: 'In Formation',
    desc: 'Industry veterans in energy, AI infrastructure, sovereign finance, and African public policy. Advisory board structure to be announced publicly as members are confirmed.',
    initials: '—',
  },
];

const timeline = [
  {
    year: '2024',
    title: 'Vision & Site Public',
    status: 'Done',
    desc: 'Harch Corp public vision published by founder Amine Harch El Korane. The 2024-2050 trajectory is documented publicly. Building in Public begins.',
  },
  {
    year: '2026',
    title: 'Harch Research — Phase 1',
    status: 'Planned',
    desc: 'Launch of Harch Research: think tank, analytical publications, newsletter, consulting. First revenue target. Establishing the brand and the analytical foundation.',
  },
  {
    year: '2028',
    title: 'Harch Intelligence — Phase 2',
    status: 'Planned',
    desc: 'Carbon-aware GPU cloud launched in reseller + orchestration mode. First paying customers. 1,798 GPUs deployed across 5 Moroccan hubs.',
  },
  {
    year: '2030',
    title: 'Harch Energy — Phase 3',
    status: 'Planned',
    desc: 'Solar EPC B2B operations begin. 5 filiales targeted by 2033. $2.4B pipeline in deployment. Net-zero operations across all active verticals.',
  },
  {
    year: '2035',
    title: 'Continental Scale',
    status: 'Vision',
    desc: 'Operations expanded beyond Morocco into 5+ African countries. Mining, water, and agriculture verticals at full capacity. 25,000+ jobs created.',
  },
  {
    year: '2050',
    title: '30 Filiales, 40 Pays',
    status: 'Vision',
    desc: '30 filiales operating across 40 countries. $50B+ revenue target. Africa\'s sovereign industrial backbone — built, owned, operated by Africans.',
  },
];

const buildInPublicPrinciples = [
  { title: 'Public Roadmap', desc: 'Every milestone, every filiale activation, every revenue target — published before execution, updated after.' },
  { title: 'Open Metrics', desc: 'Live dashboard with operational metrics: GPU utilization, carbon intensity, energy mix, customer count.' },
  { title: 'Honest Failures', desc: 'When a phase slips or a target is missed, we say so publicly. No silent revisions, no retroactive edits.' },
  { title: 'No Vapor Partnerships', desc: 'Partnerships are announced when signed, not when discussed. No aspirational logos on the website.' },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function AboutPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 data-grid-pattern opacity-20" />
        <div className="absolute top-0 left-1/4 w-[700px] h-[500px] bg-[#8B9DAF]/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6">About Harch Corp</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[88px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              Building Africa&apos;s<br />Industrial Backbone<span className="text-[#8B9DAF]">.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-4">
              Harch Corp is a Casablanca-headquartered sovereign infrastructure company.
            </p>
            <p className="text-[15px] text-[#999999] max-w-xl leading-[1.7]">
              Founded in 2024 by Amine Harch El Korane with a 100-year vision: build the vertically integrated industrial backbone that Africa has always deserved — one filiale at a time, owned and operated by Africans.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-16 bg-white/[0.06] border border-white/[0.06] rounded-lg overflow-hidden">
              {heroStats.map((stat) => (
                <div key={stat.label} className="bg-[#0D0D0D] p-6 md:p-8">
                  <p className="text-3xl md:text-4xl font-extrabold text-white stat-mono mb-2">
                    <CountUp to={stat.value} suffix={stat.suffix} duration={2} />
                  </p>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666]">{stat.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="mt-10 flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 bg-[#0F0F0F] border border-[rgba(139,157,175,0.18)] rounded-lg max-w-3xl">
              <div className="w-full md:w-72 h-40 shrink-0">
                <VideoPlayer
                  src="/videos/v1_brand.mp4"
                  variant="modal-trigger"
                  label="Watch: Brand Film"
                  className="w-full h-full"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2">Our Story</p>
                <p className="text-[15px] text-white/80 leading-relaxed">
                  Founded 2024 in Casablanca by Amine Harch El Korane with a 100-year vision: build the
                  vertically integrated industrial backbone that Africa has always deserved — one filiale
                  at a time, owned and operated by Africans. Watch the brand film.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ MISSION STATEMENT ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="border-l-2 border-[rgba(139,157,175,0.4)] pl-8 md:pl-12 mb-8 pb-8 border-b border-[rgba(255,255,255,0.04)]">
              <p className="text-[20px] md:text-[28px] text-white leading-[1.5] font-light">
                &ldquo;Africa does not need aid. It needs infrastructure — owned, operated, and controlled by Africans. That is the only path to sovereignty.&rdquo;
              </p>
              <p className="text-[12px] text-[#8B9DAF] font-bold tracking-[0.15em] uppercase mt-6">
                — Amine Harch El Korane, Founder
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="space-y-6 max-w-2xl">
              <p className="text-[15px] text-[#999999] leading-[1.8]">
                Africa holds 30% of the world&apos;s mineral reserves, 60% of its uncultivated arable land, and the youngest population on Earth. Yet the continent captures only a fraction of this value — because the infrastructure to convert potential into power does not exist.
              </p>
              <p className="text-[15px] text-[#999999] leading-[1.8]">
                Harch Corp exists to build that infrastructure. Not through aid or extraction, but through sovereign, vertically integrated industrial development. We own the entire value chain — from the energy that powers our operations to the technology that optimizes them.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ NOTRE HISTOIRE ═══════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <FadeIn>
              <p className="section-label mb-4">Notre Histoire</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-6">
                Founded 2024.<br />Built for 2124.
              </h2>
              <div className="accent-line mb-6" />
              <div className="space-y-5 text-[15px] text-[#999999] leading-[1.8]">
                <p>
                  Harch Corp was founded in 2024 by Amine Harch El Korane in Casablanca, Morocco. The founding conviction was simple: Africa&apos;s industrial sovereignty is the defining opportunity of this century, and it can only be seized by building — not by importing, not by extracting, not by waiting.
                </p>
                <p>
                  The company is structured as a holding (Harch Corp) with eight planned subsidiaries (filiales), each activated in sequence under the <span className="text-white font-semibold">Build One At A Time</span> methodology. No filiale is launched until the previous one reaches profitability. Disciplined capital allocation over growth-at-all-costs.
                </p>
                <p>
                  The 100-year vision: by 2050, 30 filiales operating across 40 countries, generating $50B+ in annual revenue. By 2124, Harch Corp intends to be Africa&apos;s largest industrial conglomerate — owned, operated, and controlled by Africans.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '2024', label: 'Founded' },
                  { value: 'Casablanca', label: 'Headquarters' },
                  { value: '8', label: 'Planned Verticals' },
                  { value: '$2.4B', label: 'Investment Pipeline' },
                  { value: '5', label: 'Countries by 2030' },
                  { value: '25,000+', label: 'Jobs by 2030' },
                  { value: '100', label: 'Year Vision' },
                  { value: 'Solo', label: 'Founder-Led' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-5">
                    <p className="text-2xl font-bold text-white stat-mono mb-1">{stat.value}</p>
                    <p className="text-[10px] text-[#666666] uppercase tracking-[0.1em] font-bold">{stat.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════ MISSION & VISION — 3 PILIERS ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Mission &amp; Vision</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Three Pillars.<br />One Conviction.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Every decision we make is anchored to three pillars. When they conflict with short-term profit, the pillars win — every time.
            </p>
          </FadeIn>
          <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {missionPillars.map((pillar) => (
              <StaggerItem key={pillar.title}>
                <Card3D className="p-8 h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(139,157,175,0.08)] border border-[#8B9DAF]/15 flex items-center justify-center">
                      <pillar.icon size={20} className="text-[#8B9DAF]" strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] font-bold text-[#666666] font-[family-name:var(--font-space-mono)] tracking-[0.15em]">{pillar.tag}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{pillar.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{pillar.desc}</p>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <SectionDivider className="max-w-[1400px] mx-auto" />

      {/* ═══════ VALEURS — 6 VALUES ═══════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Our Values</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              What We Stand For.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Six values that govern every hiring decision, every capital allocation, every partnership. Non-negotiable.
            </p>
          </FadeIn>
          <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 h-full hover:border-[#8B9DAF]/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[#8B9DAF]/15 flex items-center justify-center mb-4">
                    <value.icon size={18} className="text-[#8B9DAF]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-[13px] text-[#999999] leading-[1.7]">{value.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════ LEADERSHIP ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Leadership</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              The Team.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Currently a solo-founder venture. Senior leadership is announced as each filiale reaches its activation phase — not before.
            </p>
          </FadeIn>
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((person) => (
              <StaggerItem key={person.name}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden h-full flex flex-col">
                  <div className="aspect-square bg-[rgba(139,157,175,0.06)] flex items-center justify-center border-b border-white/[0.06]">
                    <span className="text-4xl font-extrabold text-[#8B9DAF]/30 stat-mono">{person.initials}</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-white mb-1">{person.name}</h3>
                    <p className="text-[11px] font-bold text-[#8B9DAF] uppercase tracking-[0.1em] mb-3">{person.title}</p>
                    <div className="accent-line mb-3" />
                    <p className="text-[13px] text-[#999999] leading-[1.7] flex-1">{person.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <FadeIn delay={0.2}>
            <div className="mt-10 max-w-3xl border-l-2 border-[rgba(139,157,175,0.4)] bg-[rgba(139,157,175,0.06)] px-6 py-4 rounded-r-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF] mb-2 font-[family-name:var(--font-space-mono)]">Building in Public</p>
              <p className="text-[14px] text-[#CCCCCC] leading-[1.7]">
                Harch Corp is currently a solo-founder venture. As each filiale reaches its activation phase, senior co-founders, operators, and advisors will be announced publicly. No executives, board members, or advisors are currently retained beyond the founder.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════ BUILD IN PUBLIC ═══════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Build in Public</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Radical Transparency.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Building in Public is not a marketing strategy — it is a governance discipline. Every milestone is published before execution, every metric is live, every failure is admitted. Trust through verifiable transparency.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {buildInPublicPrinciples.map((principle, i) => (
              <FadeIn key={principle.title} delay={i * 0.08}>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-8 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[11px] font-bold text-[rgba(255,255,255,0.2)] font-[family-name:var(--font-space-mono)]">0{i + 1}</span>
                    <h3 className="text-lg font-bold text-white">{principle.title}</h3>
                  </div>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{principle.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TIMELINE 2024-2030 ═══════ */}
      <section className="py-20 md:py-28 bg-[#0F0F0F] border-t border-white/[0.04]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Our Journey</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              From Vision to Reality.
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              A 26-year trajectory, executed one filiale at a time. Every milestone documented, every slip admitted, every success verifiable.
            </p>
          </FadeIn>
          <div className="relative">
            <div className="absolute left-5 md:left-10 top-0 bottom-0 w-px bg-[rgba(255,255,255,0.06)]" />
            <div className="space-y-10">
              {timeline.map((item, i) => (
                <FadeIn key={item.year} delay={i * 0.06}>
                  <div className="flex gap-6 md:gap-12 relative">
                    <div className="relative z-10 shrink-0 w-10 md:w-20 flex justify-center">
                      <div className={`w-3.5 h-3.5 rounded-full mt-1.5 border-2 ${
                        item.status === 'Done' ? 'bg-[#4A7B5F] border-[#4A7B5F]' :
                        item.status === 'Planned' ? 'bg-[#0D0D0D] border-[#8B9DAF]' :
                        'bg-[#0D0D0D] border-[#666666]'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white font-[family-name:var(--font-space-mono)]">{item.year}</span>
                        <span className={`text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded-full ${
                          item.status === 'Done' ? 'bg-[rgba(74,123,95,0.15)] text-[#4A7B5F]' :
                          item.status === 'Planned' ? 'bg-[rgba(139,157,175,0.15)] text-[#8B9DAF]' :
                          'bg-[rgba(255,255,255,0.05)] text-[#666666]'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-[13px] text-[#999999] leading-relaxed max-w-lg">{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CARRIÈRES CTA ═══════ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 data-grid-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <p className="section-label mb-4">Careers</p>
              <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-6">
                Build Africa&apos;s<br />Industrial Sovereignty.
              </h2>
              <p className="text-[15px] text-white/40 leading-relaxed mb-8 max-w-lg">
                We are not hiring yet — but we will be. When each filiale reaches activation, we will need engineers, operators, financiers, and builders who share our conviction. Leave your details and we will reach out when the time comes.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link href="/careers" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                  View Careers <ArrowRight size={14} />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                  Express Interest
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Briefcase, label: 'Open Roles', value: '0', note: 'Currently solo' },
                  { icon: Users, label: 'Planned by 2030', value: '3,200', note: 'Across 5 filiales' },
                  { icon: TrendingUp, label: 'Pipeline', value: '$2.4B', note: 'Capital deployed' },
                  { icon: Building2, label: 'Filiales', value: '8', note: 'Planned by 2033' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6">
                    <stat.icon size={18} className="text-[#8B9DAF] mb-3" strokeWidth={1.5} />
                    <p className="text-2xl font-bold text-white stat-mono mb-1">{stat.value}</p>
                    <p className="text-[10px] text-[#666666] uppercase tracking-[0.1em] font-bold mb-1">{stat.label}</p>
                    <p className="text-[11px] text-[#999999]">{stat.note}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
