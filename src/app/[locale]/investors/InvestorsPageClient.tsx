'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function InvestorsPageClient() {
  return (
    <div className="bg-white text-neutral-950">
      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/images/sections/finance-district.jpg"
          alt="Harch Finance"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        <div className="relative z-10 max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">HARCH CORP · INVESTORS</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            African Infrastructure<br />
            <span className="text-emerald-400">Capital</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-8 max-w-2xl text-lg text-white/80"
          >
            $2.4B pipeline across 8 projects. 14.2% actual IRR. 0 defaults. Harch Corp bridges Africa's $130B annual infrastructure gap with project finance, Islamic finance, and green bonds.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex justify-center gap-4"
          >
            <Link href="/contact" className="inline-flex items-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400">
              Contact IR <ArrowRight size={16} />
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10">
              Back to Harch Corp
            </Link>
          </motion.div>
        </div>
      </section>

      {/* KEY METRICS */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-5xl">Track Record</h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { num: '$2.4B', label: 'Project Finance Pipeline' },
              { num: '14.2%', label: 'Actual IRR (vs 15% target)' },
              { num: '0', label: 'Defaults in 24 months' },
              { num: '8', label: 'Projects Financed' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-neutral-950 md:text-5xl">{s.num}</div>
                <div className="mt-2 text-sm text-neutral-500">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INVESTMENT THESIS */}
      <section className="bg-neutral-50 py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-8 text-3xl font-bold tracking-tight md:text-5xl">Investment Thesis</h2>
          <p className="text-lg leading-relaxed text-neutral-600">
            Africa needs $130B annually in infrastructure investment through 2030. Traditional banks fund 15% of this. Harch Corp bridges the gap — project finance, Islamic finance, green bonds, and blended capital structures for African infrastructure. We invest 5-20% equity alongside clients, aligning incentives for long-term success. Our risk models use 15 years of African infrastructure project data (300+ projects), with default rates predicted within 2% accuracy.
          </p>
        </div>
      </section>

      {/* ENGAGEMENT MODELS */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-5xl">Engagement Models</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { name: 'Advisory Only', price: '2% of debt raised', desc: 'Project finance advisory for $5M-$50M projects. Feasibility, financial model, lender selection, term sheet negotiation.' },
              { name: 'Advisory + Equity', price: '1.5% + 5% equity', desc: 'Most popular. For $50M-$500M projects. Harch Corp commits 5% equity. Performance fee above 12% IRR.', featured: true },
              { name: 'Lead Arranger', price: 'Custom + 10-20% equity', desc: 'For $500M+ projects. Lead arranger role, Lazard Africa partnership, sovereign wealth introductions.' },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex flex-col rounded-2xl p-8 ${
                  plan.featured
                    ? 'bg-neutral-950 text-white shadow-2xl ring-2 ring-emerald-500'
                    : 'bg-white text-neutral-950 shadow-lg ring-1 ring-neutral-200'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                    ★ Best Value
                  </div>
                )}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-4 font-mono text-xl font-bold">{plan.price}</div>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600">{plan.desc}</p>
                <Link
                  href="/contact"
                  className={`mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                    plan.featured
                      ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                      : 'border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  Get a quote <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/sections/overview-casablanca.jpg" alt="" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/60" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 py-24 md:py-40 text-white">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl">
            <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-6xl">Ready to finance your infrastructure project?</h2>
            <p className="mt-6 text-lg text-neutral-300">Custom proposal within 5 business days. Harch Corp equity participation available.</p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400">
                Get a free quote <ArrowRight size={16} />
              </Link>
              <Link href="/" className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10">
                ← Back to Harch Corp
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
