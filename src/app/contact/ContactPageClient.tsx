'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Shield, Lock, Eye, Building2, Users, Landmark, Cpu, CheckCircle2, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const inquiryTypes = [
  {
    id: 'government',
    label: 'Government / Defense',
    code: 'GOV',
    icon: Landmark,
    desc: 'Sovereign data infrastructure, national security platforms, intelligence systems, and government partnerships.',
  },
  {
    id: 'industrial',
    label: 'Industrial Partner',
    code: 'IND',
    icon: Building2,
    desc: 'Predictive maintenance, AI optimization, cement, energy, mining, and agricultural technology deployments.',
  },
  {
    id: 'investor',
    label: 'Investor',
    code: 'INV',
    icon: Cpu,
    desc: 'Institutional investment, co-investment opportunities, and strategic capital allocation across 8 verticals.',
  },
  {
    id: 'talent',
    label: 'Talent',
    code: 'TLN',
    icon: Users,
    desc: 'Engineering, research, operations, and leadership roles. We recruit builders, not employees.',
  },
];

function EncryptedConnectionIndicator() {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-lg">
      <Lock size={12} className="text-[#8B9DAF]" />
      <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">Encrypted</span>
      <div className="w-px h-3 bg-[rgba(255,255,255,0.06)]" />
      <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">AES-256</span>
      <div className="w-px h-3 bg-[rgba(255,255,255,0.06)]" />
      <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">{formatTime(uptime)}</span>
    </div>
  );
}

export default function ContactPageClient() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    organization: '',
    designation: '',
    country: '',
    message: '',
    nda: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [transmitStep, setTransmitStep] = useState(0);
  const router = useRouter();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;
    setSubmitError(null);

    setTransmitStep(1);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          inquiryType: selectedType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setTransmitStep(2);
      setTimeout(() => setTransmitStep(3), 600);
      setTimeout(() => {
        setSubmitted(true);
        setTransmitStep(0);
        router.push(`/quote/received?ref=${data.reference || ''}`);
      }, 1400);
    } catch (err) {
      setTransmitStep(0);
      setSubmitError(err instanceof Error ? err.message : 'An error occurred. Please try again or email amine@harchcorp.com directly.');
    }
  };

  const selectedInquiry = inquiryTypes.find(t => t.id === selectedType);

  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-center gap-3 mb-6">
              <Shield size={14} className="text-[#8B9DAF]" />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8B9DAF]">Secure Channel</span>
            </div>
            <EncryptedConnectionIndicator />
            <div className="mt-6" />
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Request a Briefing
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Harch Corp operates on a need-to-know basis. Select your inquiry type, and your request will be routed through our secure intake system. All transmissions are encrypted end-to-end.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Inquiry Type Selector — Pattern 2: Vertical List Rows */}
      <section className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-8">Select Inquiry Type</p>
          </FadeIn>

          {/* 1px white divider between header and list */}
          <div className="h-px bg-[rgba(255,255,255,0.06)] mb-2" />

          <div>
            {inquiryTypes.map((type, i) => (
              <FadeIn key={type.id} delay={i * 0.06}>
                <button
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full text-left py-5 px-4 md:px-6 border-b border-[rgba(255,255,255,0.04)] transition-all duration-300 flex items-center gap-4 md:gap-6 ${
                    selectedType === type.id
                      ? 'border-l-2 border-l-[#8B9DAF] bg-[rgba(255,255,255,0.02)]'
                      : 'border-l-2 border-l-transparent hover:bg-[rgba(255,255,255,0.02)]'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedType === type.id
                      ? 'bg-[rgba(139,157,175,0.08)]'
                      : 'bg-[rgba(255,255,255,0.04)]'
                  }`}>
                    <type.icon size={18} className={selectedType === type.id ? 'text-[#8B9DAF]' : 'text-[#666666]'} strokeWidth={1.5} />
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`text-[15px] font-bold ${selectedType === type.id ? 'text-white' : 'text-[#999999]'}`}>
                        {type.label}
                      </h3>
                    </div>
                    <p className="text-[12px] text-[#666666] leading-relaxed">{type.desc}</p>
                  </div>
                  {/* Code tag */}
                  <span className="text-[9px] font-bold tracking-[0.12em] text-[#666666] font-[family-name:var(--font-space-mono)] shrink-0">[{type.code}]</span>
                </button>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Secure Briefing Form — Pattern 3: Clean Form */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form — 3 columns */}
            <div className="lg:col-span-3">
              {!selectedType ? (
                <FadeIn>
                  <div className="card p-12 text-center">
                    <div className="w-16 h-16 rounded-xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center mx-auto mb-4">
                      <Eye size={24} className="text-[#666666]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Select Inquiry Type</h3>
                    <p className="text-[14px] text-[#666666]">Choose your inquiry type above to access the secure briefing form.</p>
                  </div>
                </FadeIn>
              ) : submitted ? (
                <FadeIn>
                  <div className="card p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-[rgba(74,123,95,0.08)] flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={28} className="text-[#4A7B5F]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Briefing Request Transmitted</h3>
                    <p className="text-[14px] text-[#999999] max-w-md mx-auto mb-6">
                      Your encrypted briefing request has been received. Our team will respond within 24 hours through a secure channel.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg">
                      <Lock size={12} className="text-[#8B9DAF]" />
                      <span className="text-[11px] text-[#8B9DAF] font-[family-name:var(--font-space-mono)]">REF-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
                    </div>
                  </div>
                </FadeIn>
              ) : (
                <FadeIn>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Radio size={14} className={transmitStep > 0 ? 'text-[#8B9DAF] animate-pulse' : 'text-[#666666]'} />
                      <p className="section-label">{selectedInquiry?.label} Briefing Request</p>
                    </div>
                    <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">[{selectedInquiry?.code}]</span>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section: Personal Information */}
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">Personal Information</p>
                      <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                            Full Name <span className="text-[#A0524B]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formState.name}
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                            className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors placeholder:text-[#333333]"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                            Email Address <span className="text-[#A0524B]">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={formState.email}
                            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                            className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors placeholder:text-[#333333]"
                            placeholder="secure@domain.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section: Organization */}
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">Organization</p>
                      <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                            Organization <span className="text-[#A0524B]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formState.organization}
                            onChange={(e) => setFormState({ ...formState, organization: e.target.value })}
                            className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors placeholder:text-[#333333]"
                            placeholder="Organization name"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                            Designation
                          </label>
                          <input
                            type="text"
                            value={formState.designation}
                            onChange={(e) => setFormState({ ...formState, designation: e.target.value })}
                            className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors placeholder:text-[#333333]"
                            placeholder="Title / Role"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section: Details */}
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-4">Briefing Details</p>
                      <div className="h-px bg-[rgba(255,255,255,0.06)] mb-6" />
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                            Country
                          </label>
                          <input
                            type="text"
                            value={formState.country}
                            onChange={(e) => setFormState({ ...formState, country: e.target.value })}
                            className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors placeholder:text-[#333333]"
                            placeholder="Country of operation"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-[#666666] mb-3">
                            Briefing Description <span className="text-[#A0524B]">*</span>
                          </label>
                          <textarea
                            required
                            rows={5}
                            value={formState.message}
                            onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                            className="w-full px-0 py-3 bg-transparent border-0 border-b border-[rgba(255,255,255,0.06)] rounded-none text-[14px] text-white focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors resize-none placeholder:text-[#333333]"
                            placeholder="Describe the nature of your inquiry. Be as specific as possible."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-2">
                      <input
                        type="checkbox"
                        checked={formState.nda}
                        onChange={(e) => setFormState({ ...formState, nda: e.target.checked })}
                        className="mt-1 accent-[#8B9DAF]"
                        id="nda-check"
                      />
                      <label htmlFor="nda-check" className="text-[12px] text-[#666666] leading-relaxed">
                        I understand that Harch Corp may share confidential information during the briefing process. I agree to treat all disclosed materials as confidential.
                      </label>
                    </div>

                    {transmitStep > 0 && (
                      <div className="px-4 py-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-lg">
                        <div className="flex items-center gap-3">
                          <Radio size={12} className="text-[#8B9DAF] animate-pulse" />
                          <span className="text-[11px] text-[#8B9DAF] font-[family-name:var(--font-space-mono)]">
                            {transmitStep === 1 && 'Encrypting payload...'}
                            {transmitStep === 2 && 'Routing through secure channel...'}
                            {transmitStep === 3 && 'Transmitting to secure intake...'}
                          </span>
                        </div>
                        <div className="mt-2 w-full h-1 rounded-full bg-[rgba(255,255,255,0.06)]">
                          <div
                            className="h-full rounded-full bg-[#8B9DAF] transition-all duration-700"
                            style={{ width: `${transmitStep * 33}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-2">
                      <button
                        type="submit"
                        disabled={transmitStep > 0}
                        className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold hover:bg-[#CCCCCC] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Transmit Request <ArrowRight size={14} />
                      </button>
                      <div className="flex items-center gap-2">
                        <Lock size={10} className="text-[#666666]" />
                        <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">End-to-end encrypted</span>
                      </div>
                    </div>
                    {submitError && (
                      <div className="mt-4 p-4 bg-[rgba(200,70,43,0.1)] border border-[#C8462B]/30 rounded-lg">
                        <p className="text-[13px] text-[#C8462B]">{submitError}</p>
                        <a href="mailto:amine@harchcorp.com" className="text-[12px] text-[#8B9DAF] hover:text-white mt-2 inline-block">
                          Or email us directly: amine@harchcorp.com
                        </a>
                      </div>
                    )}
                  </form>
                </FadeIn>
              )}
            </div>

            {/* Right sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <FadeIn delay={0.1}>
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={14} className="text-[#8B9DAF]" />
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8B9DAF]">Data Sovereignty</span>
                  </div>
                  <p className="text-[13px] text-[#999999] leading-relaxed">
                    Your data is processed on sovereign infrastructure within Moroccan borders. We do not share your information with third parties. All communications are encrypted with AES-256 at rest and TLS 1.3 in transit.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.15}>
                <div className="card p-6">
                  <p className="section-label mb-4">Intake Process</p>
                  <div className="space-y-4">
                    {[
                      { step: '01', title: 'Submission', desc: 'Your encrypted request enters our secure intake queue.' },
                      { step: '02', title: 'Verification', desc: 'Our team verifies identity and organizational credentials.' },
                      { step: '03', title: 'Classification', desc: 'Request is classified and routed to the appropriate division.' },
                      { step: '04', title: 'Briefing', desc: 'A secure briefing channel is established within 24 hours.' },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded bg-[rgba(255,255,255,0.04)] flex items-center justify-center text-[9px] font-bold text-[#666666] font-[family-name:var(--font-space-mono)]">
                          {item.step}
                        </span>
                        <div>
                          <h4 className="text-[13px] font-bold text-white">{item.title}</h4>
                          <p className="text-[12px] text-[#666666] leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="card p-6">
                  <p className="section-label mb-4">Compliance</p>
                  <div className="flex flex-wrap gap-2">
                    {['SOC 2 Type II', 'ISO 27001', 'GDPR', 'Moroccan DPA', 'AES-256', 'TLS 1.3'].map((badge) => (
                      <span key={badge} className="px-3 py-1.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded text-[10px] font-semibold text-[#999999] tracking-wide">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Sovereign Infrastructure Disclaimer */}
      <section className="py-16 bg-[#121212] border-t border-[rgba(255,255,255,0.04)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-start gap-4 max-w-3xl">
              <Lock size={16} className="text-[#8B9DAF] shrink-0 mt-1" strokeWidth={1.5} />
              <div>
                <p className="text-[14px] text-[#999999] leading-[1.7] mb-3">
                  Your data is processed on sovereign infrastructure. We do not share with third parties. All briefing requests are encrypted end-to-end and stored within Moroccan jurisdiction under Law 09-08.
                </p>
                <div className="flex items-center gap-4">
                  <Link href="/trust/security" className="text-[12px] text-[#8B9DAF] hover:text-white transition-colors flex items-center gap-1">Security Overview <ArrowRight size={10} /></Link>
                  <Link href="/trust/compliance" className="text-[12px] text-[#8B9DAF] hover:text-white transition-colors flex items-center gap-1">Compliance <ArrowRight size={10} /></Link>
                  <Link href="/privacy" className="text-[12px] text-[#8B9DAF] hover:text-white transition-colors flex items-center gap-1">Privacy Policy <ArrowRight size={10} /></Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
