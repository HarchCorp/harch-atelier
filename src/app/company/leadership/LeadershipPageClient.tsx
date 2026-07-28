'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
} from 'lucide-react';

import { FadeIn } from '@/components/ui/motion';

const executives = [
  {
    name: 'Amine Harch El Korane',
    title: 'Founder & CEO',
    bio: 'Founder of Harch Corp. Launched the venture in 2026 with a 100-year vision: build Africa\'s sovereign industrial backbone, one filiale at a time. Currently the sole operator, chaque étape documentée. Senior co-founders, operators, and advisors will be announced publicly as each filiale reaches its activation phase (Phase 1: Harch Research — publications; Phase 2: Harch Intelligence — carbon-aware GPU cloud; Phase 3: Harch Energy — solar EPC). –2050: 30 filiales, 40 pays, $50B+ revenue target.',
    image: '',
    linkedin: '#',
  },
];

const teamInFormationNote =
  'Team planned. Harch Corp is currently a solo founder venture. As each filiale reaches its activation phase, senior co-founders, operators, and advisors will be announced publicly. No executives, board members, or advisors are currently retained beyond the founder.';

const advisoryInFormationNote =
  'Advisory Board planned. Previously listed advisor names (Dr. Hassan Bennani, Sarah Okonkwo, General Jean-Pierre Ndiaye, Prof. Amira El-Sayed) were aspirational personas and have been removed. Real advisors will be announced here as they are formally retained.';

export default function LeadershipPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Leadership</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              The Team Behind<br />the Mission
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Building in Public. Harch Corp is currently a solo founder venture led by Amine Harch El Korane. Senior co-founders, operators, and advisors will be announced publicly as each filiale reaches its activation phase. The mission is unchanged: Africa must own its industrial infrastructure.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Executive Team */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Executive Team</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-16">
              Leadership
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {executives.map((exec, i) => (
              <FadeIn key={exec.name} delay={i * 0.06}>
                <div className="card p-8 h-full group">
                  <div className="relative w-20 h-20 rounded-full bg-[rgba(255,255,255,0.04)] border border-white/[0.08] overflow-hidden mb-5">
                    <Image
                      src={exec.image}
                      alt={exec.name}
                      fill
                      className="object-cover industrial-image"
                      sizes="80px"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{exec.name}</h3>
                  <p className="text-[12px] font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-4">{exec.title}</p>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-5">{exec.bio}</p>
                  {/* LinkedIn link removed — no verified profiles exist yet */}
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.2}>
            <div className="mt-10 max-w-3xl border-l-2 border-[rgba(139,157,175,0.4)] bg-[rgba(139,157,175,0.06)] px-6 py-4 rounded-r-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF] mb-2 font-[family-name:var(--font-space-mono)]">Building in Public</p>
              <p className="text-[14px] text-[#CCCCCC] leading-[1.7]">{teamInFormationNote}</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Board of Advisors — planned */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Advisory Board</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Strategic Advisors
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              The advisory board is planned. Advisors will be announced publicly as they are formally retained for each filiale activation phase.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="max-w-3xl border-l-2 border-[rgba(139,157,175,0.4)] bg-[rgba(139,157,175,0.06)] px-6 py-4 rounded-r-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF] mb-2 font-[family-name:var(--font-space-mono)]">In Formation</p>
              <p className="text-[14px] text-[#CCCCCC] leading-[1.7]">{advisoryInFormationNote}</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Join Our Team CTA */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">
              Join Our Team
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              Building the impossible requires the best minds. If you share our conviction that Africa must own its infrastructure, we want to hear from you.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/careers" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                View Open Positions <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Contact Us
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
