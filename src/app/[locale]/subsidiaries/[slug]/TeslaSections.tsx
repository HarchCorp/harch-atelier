'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Phone,
  CheckCircle2,
  ChevronDown,
  FileText,
  Download,
  Quote,
  MapPin,
  Shield,
  Zap,
  Clock,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Shared Tesla-style section components used by all subsidiary pages.
   This keeps the per-subsidiary file small while ensuring visual
   consistency.
   ═══════════════════════════════════════════════════════════════ */

export interface StatItem { num: string; label: string }
export interface StepItem { n: string; t: string; d: string; time: string }
export interface TitledItem { t: string; d: string }
export interface TestimonialItem { quote: string; author: string; role: string }
export interface FaqItem { q: string; a: string }
export interface ResourceItem { t: string; d: string; type: string }
export interface PlanItem {
  name: string; tagline: string; price: string; size: string;
  features: string[]; cta: string; featured?: boolean;
}
export interface CityItem { name: string; type: string; plants: string }

/* ────────── HERO ────────── */
export function TeslaHero({
  badge, title, stats, ctaLabel, ctaHref, image,
}: {
  badge: string;
  title: string;
  stats: StatItem[];
  ctaLabel: string;
  ctaHref: string;
  image: string;
}) {
  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
      <Image src={image} alt={title} fill priority className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-12 flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 backdrop-blur-md"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">{badge}</span>
        </motion.div>

        <div className="flex flex-1 items-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-8xl"
          >
            {title}
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-5xl"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-4">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-white sm:text-4xl md:text-6xl">{s.num}</div>
                <div className="mt-2 text-sm text-white/70 md:text-base">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center md:justify-end">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 border border-white/50 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10"
            >
              {ctaLabel}<ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────── OVERVIEW (two-col) ────────── */
export function TeslaOverview({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 md:grid-cols-2 md:gap-16">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <p className="mb-3 text-sm font-medium text-neutral-400">{label}</p>
          <h2 className="text-2xl font-bold leading-tight tracking-tight md:text-5xl">{title}</h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <p className="text-base leading-relaxed text-neutral-600 md:text-lg">{body}</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────── IMAGE + STATS OVERLAY ────────── */
export function TeslaImageStats({
  image, label, title, body, learnMoreLabel, learnMoreHref, stats,
}: {
  image: string;
  label: string;
  title: string;
  body: string;
  learnMoreLabel?: string;
  learnMoreHref?: string;
  stats: StatItem[];
}) {
  return (
    <section>
      <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        <Image src={image} alt={title} fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full items-center justify-center px-6">
          <div className="grid w-full max-w-5xl grid-cols-1 gap-12 md:grid-cols-3 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">{s.num}</div>
                <div className="mt-3 text-xs text-white/70 sm:text-sm md:text-base">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="py-20 md:py-32">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 md:grid-cols-2 md:gap-16">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="mb-3 text-sm font-medium text-neutral-400">{label}</p>
            <h2 className="text-2xl font-bold leading-tight tracking-tight md:text-5xl">{title}</h2>
            {learnMoreLabel && learnMoreHref && (
              <Link href={learnMoreHref} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline">
                {learnMoreLabel}<ArrowRight size={14} />
              </Link>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-base leading-relaxed text-neutral-600 md:text-lg">{body}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ────────── RELIABILITY (image + centered body) ────────── */
export function TeslaReliability({ image, label, title, body }: { image: string; label: string; title: string; body: string }) {
  return (
    <section>
      <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        <Image src={image} alt={title} fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20" />
        <div className="relative z-10 flex h-full items-center px-6 md:px-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl">
            <p className="mb-3 text-sm font-medium text-white/60">{label}</p>
            <h2 className="text-2xl font-bold leading-tight tracking-tight text-white md:text-5xl">{title}</h2>
          </motion.div>
        </div>
      </div>
      <div className="py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center text-base leading-relaxed text-neutral-600 md:text-xl">
            {body}
          </motion.p>
        </div>
      </div>
    </section>
  );
}

/* ────────── SOFTWARE (dashboard mockup + 3 cards) ────────── */
export function TeslaSoftware({
  label, title, brandLabel, plantLabel,
  metrics, products,
}: {
  label: string;
  title: string;
  brandLabel: string;
  plantLabel: string;
  metrics: { label: string; value: string; color: string; bg: string }[];
  products: TitledItem[];
}) {
  return (
    <section className="bg-neutral-50 py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-3 text-sm font-medium text-neutral-400">{label}</p>
        <h2 className="mb-12 text-2xl font-bold leading-tight tracking-tight md:text-5xl">{title}</h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 overflow-hidden rounded-2xl border border-neutral-200 shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b border-white/10 bg-neutral-900 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
            </div>
            <div className="ml-4 text-xs text-neutral-500">harch-corp.ma/dashboard</div>
          </div>
          <div className="aspect-[16/9] bg-neutral-900 p-4 md:p-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-neutral-500">{brandLabel}</div>
                <div className="text-sm font-bold text-white">{plantLabel}</div>
              </div>
              <div className="flex gap-2">
                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">● Live</div>
                <div className="rounded-full bg-white/5 px-3 py-1 text-xs text-neutral-400">Today</div>
              </div>
            </div>
            <div className="grid h-[calc(100%-3rem)] grid-cols-2 gap-3 md:grid-cols-4">
              {metrics.map((m, i) => (
                <div key={i} className="rounded-xl bg-white/5 p-3 md:p-4">
                  <div className="text-xs text-neutral-400">{m.label}</div>
                  <div className={`mt-2 text-lg font-bold md:text-2xl ${m.color}`}>{m.value}</div>
                  <div className="mt-3 h-16 rounded bg-white/5">
                    <div className={`h-full w-3/4 rounded opacity-30 ${m.bg}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {products.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="border-l-2 border-neutral-200 pl-6">
              <h3 className="text-lg font-bold md:text-xl">{p.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{p.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────── EPC (image + features + stats) ────────── */
export function TeslaEpc({
  image, label, title, body, features, stats, accent = 'emerald-600', ctaHref = '/quote',
}: {
  image: string;
  label: string;
  title: string;
  body: string;
  features: string[];
  stats: StatItem[];
  accent?: string;
  ctaHref?: string;
}) {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-20 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative aspect-[4/3] overflow-hidden">
          <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-${accent}`}>{label}</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{title}</h2>
          <div className="mt-6 h-px w-12 bg-neutral-300" />
          <p className="mt-6 text-lg leading-relaxed text-neutral-600">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {features.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-700">
                <CheckCircle2 size={14} className="text-emerald-500" />
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="rounded-xl bg-neutral-50 p-4 text-center">
                <div className="text-xl font-bold text-neutral-900">{s.num}</div>
                <div className="text-xs text-neutral-500">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────── PPA / Service (image left + text right) ────────── */
export function TeslaService({
  image, label, title, body, stats, accent = 'amber-600', ctaHref = '/quote', reverse = true,
}: {
  image: string;
  label: string;
  title: string;
  body: string;
  stats: StatItem[];
  accent?: string;
  ctaHref?: string;
  reverse?: boolean;
}) {
  return (
    <section className="bg-neutral-50 py-20 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:gap-20 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className={`order-2 ${reverse ? 'lg:order-1' : ''}`}>
          <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-${accent}`}>{label}</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{title}</h2>
          <div className="mt-6 h-px w-12 bg-neutral-300" />
          <p className="mt-6 text-lg leading-relaxed text-neutral-600">{body}</p>
          <div className={`mt-8 grid grid-cols-${stats.length} gap-4`}>
            {stats.map((s, i) => (
              <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
                <div className={`text-2xl font-bold ${i === 0 ? 'text-neutral-900' : 'text-emerald-600'}`}>{s.num}</div>
                <div className="text-sm text-neutral-500">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className={`relative aspect-[4/3] overflow-hidden ${reverse ? 'order-1 lg:order-2' : ''}`}>
          <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        </motion.div>
      </div>
    </section>
  );
}

/* ────────── CALCULATOR (interactive) ────────── */
export function TeslaCalculator({
  label, title, subtitle, billLabel, monthlyLabel, yearlyLabel, save25Label, disclaimer,
  minValue = 50000, maxValue = 2000000, step = 50000, defaultValue = 500000, savingsPercent = 0.5,
}: {
  label: string;
  title: string;
  subtitle: string;
  billLabel: string;
  monthlyLabel: string;
  yearlyLabel: string;
  save25Label: string;
  disclaimer: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  defaultValue?: number;
  savingsPercent?: number;
}) {
  const [conso, setConso] = useState(defaultValue);
  const monthlySave = Math.round(conso * savingsPercent);
  const yearlySave = monthlySave * 12;
  const save25yr = Math.round((yearlySave * 25) / 1000000);

  return (
    <section className="bg-neutral-950 py-24 md:py-32 text-white">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">{label}</p>
        <h2 className="text-3xl font-bold tracking-tight md:text-6xl">{title}</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-400">{subtitle}</p>

        <div className="mx-auto mt-12 max-w-md">
          <div className="mb-2 text-left text-sm text-neutral-400">{billLabel}</div>
          <input
            type="range"
            min={minValue}
            max={maxValue}
            step={step}
            value={conso}
            onChange={(e) => setConso(parseInt(e.target.value))}
            className="w-full accent-emerald-400"
          />
          <div className="mt-3 text-left text-3xl font-bold text-white">{conso.toLocaleString('fr-FR')} MAD/mois</div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-6 transition-colors hover:bg-white/10">
            <div className="text-3xl font-bold text-emerald-400 md:text-4xl">{monthlySave.toLocaleString('fr-FR')}</div>
            <div className="mt-1 text-sm text-neutral-400">{monthlyLabel}</div>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 transition-colors hover:bg-white/10">
            <div className="text-3xl font-bold text-emerald-400 md:text-4xl">{yearlySave.toLocaleString('fr-FR')}</div>
            <div className="mt-1 text-sm text-neutral-400">{yearlyLabel}</div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-6 ring-1 ring-amber-500/20">
            <div className="text-3xl font-bold text-amber-400 md:text-4xl">{save25yr}M</div>
            <div className="mt-1 text-sm text-neutral-400">{save25Label}</div>
          </div>
        </div>

        <p className="mt-6 text-xs text-neutral-600">{disclaimer}</p>
      </div>
    </section>
  );
}

/* ────────── PROCESS TIMELINE ────────── */
export function TeslaProcess({ label, title, steps }: { label: string; title: string; steps: StepItem[] }) {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{label}</p>
        <h2 className="mb-16 text-center text-3xl font-bold tracking-tight md:text-6xl">{title}</h2>
        <div>
          {steps.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-8 border-b border-neutral-100 py-8 last:border-0"
            >
              <div className="flex-shrink-0 text-4xl font-bold text-neutral-200 md:text-5xl">{item.n}</div>
              <div className="flex-1">
                <div className="flex items-baseline gap-4">
                  <h3 className="text-xl font-bold md:text-2xl">{item.t}</h3>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">{item.time}</span>
                </div>
                <p className="mt-2 text-neutral-600 md:text-lg">{item.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────── APPLICATIONS (dark + bg image) ────────── */
export function TeslaApplications({ image, label, title, body, items }: { image: string; label: string; title: string; body: string; items: TitledItem[] }) {
  return (
    <section className="relative overflow-hidden bg-neutral-950 py-20 md:py-32 text-white">
      <div className="absolute inset-0">
        <Image src={image} alt="" fill className="object-cover opacity-20" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-neutral-950/50" />
      </div>
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-2 md:gap-16">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <p className="mb-3 text-sm font-medium text-neutral-500">{label}</p>
          <h2 className="text-2xl font-bold leading-tight tracking-tight md:text-5xl">{title}</h2>
          <p className="mt-6 text-base leading-relaxed text-neutral-400 md:text-lg">{body}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
          {items.map((item, i) => (
            <div key={i} className="border-b border-white/10 pb-6 last:border-0">
              <h3 className="text-base font-bold text-white md:text-lg">{item.t}</h3>
              <p className="mt-2 text-sm text-neutral-400">{item.d}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ────────── WHY HARCH (dark + icon cards) ────────── */
export function TeslaWhyHarch({ label, title, items }: { label: string; title: string; items: TitledItem[] }) {
  const icons = [Shield, Zap, CheckCircle2, Clock];
  return (
    <section className="bg-neutral-900 py-24 md:py-32 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">{label}</p>
        <h2 className="mb-16 text-3xl font-bold tracking-tight md:text-6xl">{title}</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
          {items.map((item, i) => {
            const Icon = icons[i] || Shield;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5 rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center border border-white/20 bg-emerald-500/10">
                    <Icon size={20} className="text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{item.t}</h3>
                  <p className="mt-2 text-neutral-400">{item.d}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────── COMPARISON TABLE ────────── */
export function TeslaComparison({ label, title, headers, rows }: { label: string; title: string; headers: string[]; rows: string[][] }) {
  return (
    <section className="bg-neutral-950 py-24 md:py-32 text-white">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">{label}</p>
        <h2 className="mb-16 text-3xl font-bold tracking-tight md:text-6xl">{title}</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-left text-neutral-400 md:text-base">{headers[0]}</th>
                <th className="p-4 text-center text-emerald-400 md:text-base">{headers[1]}</th>
                <th className="p-4 text-center text-neutral-500 md:text-base">{headers[2]}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-white/5 transition-colors hover:bg-white/5">
                  <td className="p-4 text-neutral-400">{row[0]}</td>
                  <td className="p-4 text-center font-mono text-emerald-400">{row[1]}</td>
                  <td className="p-4 text-center font-mono text-neutral-500">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ────────── CASE STUDIES (full-bleed image) ────────── */
export function TeslaCaseStudies({ image, label, title, body }: { image: string; label: string; title: string; body: string }) {
  return (
    <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
      <Image src={image} alt={title} fill className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl">
          <p className="mb-4 text-sm font-medium text-white/60">{label}</p>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">{title}</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/70">{body}</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────── SECTORS (icon grid) ────────── */
export function TeslaSectors({ label, title, items, icons }: { label: string; title: string; items: string[]; icons: React.ComponentType<{ size?: number; className?: string }>[] }) {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{label}</p>
        <h2 className="mb-16 text-center text-3xl font-bold tracking-tight md:text-6xl">{title}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {items.map((s, i) => {
            const Icon = icons[i] || icons[0];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border border-neutral-200 p-8 text-center transition-all hover:border-emerald-500 hover:shadow-lg"
              >
                <Icon size={36} className="mx-auto mb-4 text-emerald-500 transition-transform group-hover:scale-110" />
                <div className="font-semibold md:text-lg">{s}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────── DUAL CTA (2 cards) ────────── */
export function TeslaDualCta({
  quoteTitle, quoteBody, quoteCta, callTitle, callBody, callCta, ctaHref = '/quote', callHref = 'tel:+212684440682',
}: {
  quoteTitle: string;
  quoteBody: string;
  quoteCta: string;
  callTitle: string;
  callBody: string;
  callCta: string;
  ctaHref?: string;
  callHref?: string;
}) {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link href={ctaHref} className="group block bg-neutral-100 p-10 transition-colors hover:bg-neutral-200 md:p-14">
            <h3 className="text-xl font-bold md:text-2xl">{quoteTitle}</h3>
            <p className="mt-2 text-neutral-500">{quoteBody}</p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-neutral-900">
              {quoteCta}<ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
          <a href={callHref} className="group block bg-neutral-900 p-10 text-white transition-colors hover:bg-neutral-800 md:p-14">
            <h3 className="text-xl font-bold md:text-2xl">{callTitle}</h3>
            <p className="mt-2 text-neutral-400">{callBody}</p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-white">
              {callCta}<ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ────────── PRICING PLANS ────────── */
export function TeslaPricing({ label, title, subtitle, plans }: { label: string; title: string; subtitle: string; plans: PlanItem[] }) {
  return (
    <section className="bg-neutral-50 py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{label}</p>
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-6xl">{title}</h2>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-neutral-600">{subtitle}</p>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col rounded-2xl p-8 ${
                plan.featured
                  ? 'bg-neutral-900 text-white shadow-2xl ring-2 ring-emerald-500 md:-mt-4 md:mb-4'
                  : 'bg-white text-neutral-900 shadow-lg ring-1 ring-neutral-200'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  ★ Best value
                </div>
              )}
              <div className={`text-xs font-semibold uppercase tracking-wider ${plan.featured ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {plan.tagline}
              </div>
              <h3 className="mt-2 text-2xl font-bold">{plan.name}</h3>
              <div className="mt-4 text-3xl font-bold">{plan.price}</div>
              <div className={`text-sm ${plan.featured ? 'text-neutral-400' : 'text-neutral-500'}`}>{plan.size}</div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 size={16} className={`mt-0.5 flex-shrink-0 ${plan.featured ? 'text-emerald-400' : 'text-emerald-500'}`} />
                    <span className={plan.featured ? 'text-neutral-300' : 'text-neutral-700'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/quote"
                className={`mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                  plan.featured
                    ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                    : 'border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                {plan.cta}<ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────── INNOVATION (dark + bg + cards) ────────── */
export function TeslaInnovation({
  image, label, title, subtitle, items, icons,
}: {
  image: string;
  label: string;
  title: string;
  subtitle: string;
  items: TitledItem[];
  icons: React.ComponentType<{ size?: number; className?: string }>[];
}) {
  return (
    <section className="relative overflow-hidden bg-neutral-950 py-24 md:py-32 text-white">
      <div className="absolute inset-0">
        <Image src={image} alt="" fill className="object-cover opacity-30" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/70 to-neutral-950/90" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">{label}</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-6xl">{title}</h2>
          <p className="mt-6 text-lg text-neutral-300 md:text-xl">{subtitle}</p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          {items.map((item, i) => {
            const Icon = icons[i] || icons[0];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
                  <Icon size={20} className="text-emerald-400" />
                </div>
                <h3 className="mt-5 text-xl font-bold">{item.t}</h3>
                <p className="mt-3 text-neutral-400">{item.d}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────── GEOGRAPHY (city cards) ────────── */
export function TeslaGeography({ label, title, subtitle, cities }: { label: string; title: string; subtitle: string; cities: CityItem[] }) {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{label}</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-6xl">{title}</h2>
          <p className="mt-6 text-lg text-neutral-600">{subtitle}</p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="group flex items-center gap-4 rounded-xl border border-neutral-200 p-5 transition-all hover:border-emerald-500 hover:shadow-md"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <MapPin size={18} />
              </div>
              <div>
                <div className="font-bold">{c.name}</div>
                <div className="text-xs text-neutral-500">{c.type}</div>
                <div className="mt-1 text-xs font-medium text-emerald-600">{c.plants}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────── TESTIMONIALS ────────── */
export function TeslaTestimonials({ label, title, items }: { label: string; title: string; items: TestimonialItem[] }) {
  return (
    <section className="bg-neutral-50 py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{label}</p>
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-6xl">{title}</h2>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {items.map((tm, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col rounded-2xl bg-white p-8 shadow-lg ring-1 ring-neutral-200"
            >
              <Quote className="h-8 w-8 text-emerald-500/40" />
              <p className="mt-4 flex-1 text-neutral-700 leading-relaxed">"{tm.quote}"</p>
              <div className="mt-6 border-t border-neutral-100 pt-4">
                <div className="font-bold text-neutral-900">{tm.author}</div>
                <div className="text-sm text-neutral-500">{tm.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────── FAQ (accordion) ────────── */
export function TeslaFaq({ label, title, items }: { label: string; title: string; items: FaqItem[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{label}</p>
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-6xl">{title}</h2>
        <div className="mt-12 space-y-3">
          {items.map((item, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-neutral-200">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-neutral-50"
                aria-expanded={openFaq === i}
              >
                <span className="font-semibold text-neutral-900">{item.q}</span>
                <ChevronDown size={20} className={`flex-shrink-0 text-neutral-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-neutral-600 leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────── RESOURCES ────────── */
export function TeslaResources({ label, title, subtitle, items, downloadLabel }: { label: string; title: string; subtitle: string; items: ResourceItem[]; downloadLabel: string }) {
  return (
    <section className="bg-neutral-50 py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">{label}</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{title}</h2>
          <p className="mt-4 text-lg text-neutral-600">{subtitle}</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex items-start gap-5 rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:shadow-lg"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileText size={22} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{r.t}</h3>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">{r.type}</span>
                </div>
                <p className="mt-2 text-sm text-neutral-600">{r.d}</p>
                <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                  <Download size={14} />
                  {downloadLabel}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────── FINAL CTA (full-bleed dark) ────────── */
export function TeslaFinalCta({ image, title, subtitle, primaryLabel, secondaryLabel }: { image: string; title: string; subtitle: string; primaryLabel: string; secondaryLabel: string }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src={image} alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/60" />
      </div>
      <div className="relative mx-auto max-w-5xl px-6 py-24 md:py-40 text-white">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl">
          <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-6xl">{title}</h2>
          <p className="mt-6 text-lg text-neutral-300 md:text-xl">{subtitle}</p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/quote" className="inline-flex items-center justify-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400">
              {primaryLabel}<ArrowRight size={16} />
            </Link>
            <a href="tel:+212684440682" className="inline-flex items-center justify-center gap-2 border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10">
              <Phone size={16} />
              {secondaryLabel}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────── Optional spacer / children wrapper ────────── */
export function TeslaSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={className}>{children}</section>;
}
