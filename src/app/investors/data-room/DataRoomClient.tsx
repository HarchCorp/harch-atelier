'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Shield,
  Lock,
  FileText,
  Building2,
  LineChart,
  Target,
  Cpu,
  Leaf,
  Scale,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  CircleDashed,
  AlertCircle,
  ArrowUpRight,
  FolderOpen,
  KeyRound,
  Eye,
  ChevronRight,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion'

/* -------------------------------------------------------------------------- */
/*                                  Types                                     */
/* -------------------------------------------------------------------------- */

type DocStatus = 'available' | 'on-request' | 'in-preparation'

interface DocCategory {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  docCount: number
  status: DocStatus
  documents: string[]
  accent: string
}

interface DDItem {
  id: string
  category: 'Financial' | 'Legal' | 'Commercial' | 'Technical' | 'Market' | 'ESG'
  title: string
  status: DocStatus
  owner: string
}

/* -------------------------------------------------------------------------- */
/*                              Static content                                */
/* -------------------------------------------------------------------------- */

const heroStats = [
  { value: '6', label: 'Document categories' },
  { value: '32', label: 'DD checklist items' },
  { value: '$200M', label: 'Series A target' },
  { value: '2029', label: 'Round close' },
] as const

const categories: DocCategory[] = [
  {
    id: 'company-overview',
    title: 'Company Overview',
    description:
      'Founding documents, corporate structure, ownership and registrations for Harch Corp and its 8 subsidiaries.',
    icon: Building2,
    docCount: 7,
    status: 'available',
    documents: [
      'Company overview presentation (PDF, 32 pages)',
      'Cap table — fully diluted, post-SAFEs',
      'Organizational chart (HQ + 8 subsidiaries)',
      'Bylaws & articles of association',
      'Business registrations (RC, ICE, IF, CNSS)',
      'Tax filings 2023 — 2025',
      'Insurance certificates (D&O, cyber, property)',
    ],
    accent: 'border-[#8B9DAF]/30 bg-[#8B9DAF]/8',
  },
  {
    id: 'financial',
    title: 'Financial',
    description:
      'Historical financials, 5-year projections, unit economics, burn rate and funding history for the consolidated group.',
    icon: LineChart,
    docCount: 6,
    status: 'available',
    documents: [
      '5-year P&L projections (2026 — 2030), consolidated',
      'Historical financials 2023 — 2025 (audited)',
      'Unit economics — per-GPU, per-MW, per-ton',
      'Burn rate & runway analysis (monthly, 24 months)',
      'Funding history — SAFE, convertible, equity rounds',
      'Bank statements (last 12 months, all entities)',
    ],
    accent: 'border-emerald-400/30 bg-emerald-400/8',
  },
  {
    id: 'market-strategy',
    title: 'Market & Strategy',
    description:
      'TAM/SAM/SOM analysis, competitive landscape, go-to-market motion, pricing strategy and regulatory framework across Morocco and Africa.',
    icon: Target,
    docCount: 5,
    status: 'on-request',
    documents: [
      'Market analysis — sovereign AI + renewable energy in Africa',
      'Competitive landscape — AWS, Google Cloud, ACWA, Nareva',
      'Go-to-market plan — 2026 to 2030',
      'Pricing strategy — PPAs, GPU hours, EPC contracts',
      'Regulatory framework — Morocco, EU, AU, AfCFTA',
    ],
    accent: 'border-amber-400/30 bg-amber-400/8',
  },
  {
    id: 'technical',
    title: 'Technical',
    description:
      'HarchOS architecture whitepaper, system specifications, security audits, compliance certifications and intellectual property portfolio.',
    icon: Cpu,
    docCount: 5,
    status: 'on-request',
    documents: [
      'HarchOS architecture whitepaper (PDF, 64 pages)',
      'HarchOS technical specifications — scheduler, APIs, billing',
      'Security audit report — SOC 2 Type II readiness',
      'Compliance certifications — ISO 27001, GDPR, Loi 09-08',
      'IP portfolio — patents, trade secrets, trademarks',
    ],
    accent: 'border-[#8B9DAF]/30 bg-[#8B9DAF]/8',
  },
  {
    id: 'esg',
    title: 'ESG',
    description:
      'Carbon lifecycle assessment, sustainability report, SBTi commitment and community impact metrics across our operational hubs.',
    icon: Leaf,
    docCount: 4,
    status: 'in-preparation',
    documents: [
      'Carbon lifecycle assessment — Scope 1, 2, 3 (third-party)',
      'Sustainability report 2025 (GRI + TCFD aligned)',
      'SBTi commitment letter — 1.5°C pathway',
      'Community impact report — Dakhla, Laâyoune, Essaouira',
    ],
    accent: 'border-lime-400/30 bg-lime-400/8',
  },
  {
    id: 'legal',
    title: 'Legal',
    description:
      'Term sheet template, shareholders agreement template, due diligence checklist, subsidiary agreements and key employment contracts.',
    icon: Scale,
    docCount: 5,
    status: 'available',
    documents: [
      'Term sheet template — Series A preferred shares',
      'Shareholders agreement (SHA) template',
      'Due diligence checklist — investor-side (this document)',
      'Subsidiary agreements — 8 inter-company contracts',
      'Employment contracts — C-suite and key personnel',
    ],
    accent: 'border-zinc-400/30 bg-zinc-400/8',
  },
]

const ddChecklist: DDItem[] = [
  // Financial (8)
  { id: 'fin-01', category: 'Financial', title: 'Audited financial statements 2023 — 2025 (consolidated)', status: 'available', owner: 'CFO' },
  { id: 'fin-02', category: 'Financial', title: '5-year P&L projections (2026 — 2030)', status: 'available', owner: 'CFO' },
  { id: 'fin-03', category: 'Financial', title: 'Cash flow projections (monthly, 24 months)', status: 'available', owner: 'CFO' },
  { id: 'fin-04', category: 'Financial', title: 'Unit economics — per-GPU, per-MW, per-ton', status: 'available', owner: 'FP&A' },
  { id: 'fin-05', category: 'Financial', title: 'Burn rate and runway analysis', status: 'available', owner: 'CFO' },
  { id: 'fin-06', category: 'Financial', title: 'Banking relationships and debt facilities', status: 'available', owner: 'Treasurer' },
  { id: 'fin-07', category: 'Financial', title: 'Debt schedule — all facilities, all entities', status: 'on-request', owner: 'Treasurer' },
  { id: 'fin-08', category: 'Financial', title: 'Currency exposure analysis (MAD / USD / EUR)', status: 'on-request', owner: 'CFO' },
  // Legal (6)
  { id: 'leg-01', category: 'Legal', title: 'Corporate structure and entity org chart', status: 'available', owner: 'General Counsel' },
  { id: 'leg-02', category: 'Legal', title: 'Bylaws & articles of association (all entities)', status: 'available', owner: 'General Counsel' },
  { id: 'leg-03', category: 'Legal', title: 'Cap table — fully diluted', status: 'available', owner: 'CFO' },
  { id: 'leg-04', category: 'Legal', title: 'IP assignment agreements (all engineers)', status: 'available', owner: 'General Counsel' },
  { id: 'leg-05', category: 'Legal', title: 'Key employment contracts (C-suite + critical roles)', status: 'on-request', owner: 'CHRO' },
  { id: 'leg-06', category: 'Legal', title: 'Litigation register (pending and threatened)', status: 'available', owner: 'General Counsel' },
  // Commercial (5)
  { id: 'com-01', category: 'Commercial', title: 'Customer pipeline (CRM export, weighted)', status: 'on-request', owner: 'VP Sales' },
  { id: 'com-02', category: 'Commercial', title: 'Top 20 customers — ARR, NRR, churn', status: 'on-request', owner: 'VP Sales' },
  { id: 'com-03', category: 'Commercial', title: 'Multi-year contracts (>$1M ARR)', status: 'on-request', owner: 'General Counsel' },
  { id: 'com-04', category: 'Commercial', title: 'Pricing strategy and discount matrix', status: 'in-preparation', owner: 'VP Pricing' },
  { id: 'com-05', category: 'Commercial', title: 'Channel partners and reseller agreements', status: 'in-preparation', owner: 'VP Partnerships' },
  // Technical (5)
  { id: 'tec-01', category: 'Technical', title: 'HarchOS architecture diagrams (latest)', status: 'on-request', owner: 'CTO' },
  { id: 'tec-02', category: 'Technical', title: 'HarchOS source code access (read-only, NDA)', status: 'on-request', owner: 'CTO' },
  { id: 'tec-03', category: 'Technical', title: 'Security audits (SOC 2, ISO 27001, penetration tests)', status: 'on-request', owner: 'CISO' },
  { id: 'tec-04', category: 'Technical', title: 'Performance benchmarks (GPU, scheduler, billing)', status: 'on-request', owner: 'Head of Platform' },
  { id: 'tec-05', category: 'Technical', title: 'Compliance certifications (current and planned)', status: 'on-request', owner: 'CISO' },
  // Market (4)
  { id: 'mkt-01', category: 'Market', title: 'TAM / SAM / SOM analysis (Africa + EU sovereign)', status: 'available', owner: 'Head of Strategy' },
  { id: 'mkt-02', category: 'Market', title: 'Competitive landscape (hyperscalers, IPPs, sovereign clouds)', status: 'available', owner: 'Head of Strategy' },
  { id: 'mkt-03', category: 'Market', title: 'Regulatory framework (Morocco, EU, AU, AfCFTA)', status: 'available', owner: 'Head of Regulatory' },
  { id: 'mkt-04', category: 'Market', title: 'Customer reference calls (3 — under NDA)', status: 'on-request', owner: 'VP Sales' },
  // ESG (4)
  { id: 'esg-01', category: 'ESG', title: 'Carbon lifecycle assessment — Scope 1, 2, 3', status: 'in-preparation', owner: 'ESG Director' },
  { id: 'esg-02', category: 'ESG', title: 'Sustainability report 2025 (GRI + TCFD)', status: 'in-preparation', owner: 'ESG Director' },
  { id: 'esg-03', category: 'ESG', title: 'SBTi commitment letter — 1.5°C pathway', status: 'in-preparation', owner: 'ESG Director' },
  { id: 'esg-04', category: 'ESG', title: 'Community impact metrics (Dakhla, Laâyoune, Essaouira)', status: 'in-preparation', owner: 'ESG Director' },
]

/* -------------------------------------------------------------------------- */
/*                              Helpers / UI                                  */
/* -------------------------------------------------------------------------- */

function statusMeta(status: DocStatus) {
  switch (status) {
    case 'available':
      return {
        label: 'Available',
        className:
          'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
        dot: 'bg-emerald-400',
      }
    case 'on-request':
      return {
        label: 'On request',
        className:
          'border-amber-400/30 bg-amber-400/10 text-amber-300',
        dot: 'bg-amber-400',
      }
    case 'in-preparation':
      return {
        label: 'In preparation',
        className:
          'border-zinc-400/30 bg-zinc-400/10 text-zinc-300',
        dot: 'bg-zinc-400',
      }
  }
}

function buildMailto(categoryTitle: string, documentList: string[]): string {
  const subject = `Investor Data Room — Access request: ${categoryTitle}`
  const body = `Hello Harch Corp Investor Relations team,

I would like to request access to the following document category in the Investor Data Room:

Category: ${categoryTitle}

Documents requested:
${documentList.map((d) => `  - ${d}`).join('\n')}

Investor / fund information:
- Name:
- Firm:
- Role:
- AUM:
- Stage of interest:
- NDA signed (yes/no):

Please send credentials and access instructions at your earliest convenience.

Best regards,
`
  return `mailto:ir@harchcorp.com?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`
}

function StatusIconRender({
  status,
  className,
}: {
  status: DocStatus
  className?: string
}) {
  switch (status) {
    case 'available':
      return <CheckCircle2 className={className} />
    case 'on-request':
      return <CircleDashed className={className} />
    case 'in-preparation':
      return <AlertCircle className={className} />
  }
}

function CategoryCard({ category }: { category: DocCategory }) {
  const meta = statusMeta(category.status)
  return (
    <div
      className={cn(
        'group relative flex h-full flex-col rounded-xl border bg-[#131316] p-6 transition-colors hover:border-white/15',
        category.accent
      )}
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#8B9DAF]">
          <category.icon className="h-5 w-5" />
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
            meta.className
          )}
        >
          <StatusIconRender status={category.status} className="h-3 w-3" />
          {meta.label}
        </span>
      </div>

      <h3 className="mt-5 text-base font-bold text-white">
        {category.title}
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
        {category.description}
      </p>

      <div className="mt-5 flex items-center gap-2 border-t border-white/6 pt-4 text-[11px] text-zinc-500">
        <FolderOpen className="h-3.5 w-3.5" />
        <span className="font-mono font-semibold text-zinc-300">
          {category.docCount}
        </span>{' '}
        documents
      </div>

      {/* Document list */}
      <ul className="mt-4 max-h-44 space-y-1.5 overflow-y-auto scroll-thin pr-1">
        {category.documents.map((doc, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 text-[12px] leading-relaxed text-zinc-400"
          >
            <FileText className="mt-0.5 h-3 w-3 shrink-0 text-[#8B9DAF]/60" />
            <span>{doc}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-auto pt-6">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="w-full justify-between border-white/15 bg-transparent text-white hover:bg-white/5"
        >
          <a href={buildMailto(category.title, category.documents)}>
            <span className="inline-flex items-center gap-2">
              <KeyRound className="h-3.5 w-3.5 text-[#8B9DAF]" />
              Request access
            </span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </div>
  )
}

function DDStatusPill({ status }: { status: DocStatus }) {
  const meta = statusMeta(status)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        meta.className
      )}
    >
      <StatusIconRender status={status} className="h-3 w-3" />
      {meta.label}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Page body                                   */
/* -------------------------------------------------------------------------- */

export default function DataRoomClient() {
  const [activeFilter, setActiveFilter] = React.useState<
    'All' | DDItem['category']
  >('All')

  const filterKeys = React.useMemo(
    () =>
      ['All', 'Financial', 'Legal', 'Commercial', 'Technical', 'Market', 'ESG'] as const,
    []
  )

  const filteredItems = React.useMemo(() => {
    if (activeFilter === 'All') return ddChecklist
    return ddChecklist.filter((item) => item.category === activeFilter)
  }, [activeFilter])

  const summary = React.useMemo(() => {
    const total = ddChecklist.length
    const available = ddChecklist.filter((i) => i.status === 'available').length
    const onRequest = ddChecklist.filter((i) => i.status === 'on-request').length
    const inPrep = ddChecklist.filter((i) => i.status === 'in-preparation').length
    const pct = Math.round((available / total) * 100)
    return { total, available, onRequest, inPrep, pct }
  }, [])

  return (
    <main className="flex min-h-screen flex-col bg-[#0D0D0D] text-zinc-100">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-white/6 bg-[#0D0D0D] pb-20 pt-32 md:pb-28 md:pt-40">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[#8B9DAF]/8 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Badge
              variant="outline"
              className="mb-6 border-[#8B9DAF]/30 bg-[#8B9DAF]/10 text-[#8B9DAF]"
            >
              <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-[#8B9DAF]" />
              Investor Data Room · Access controlled
            </Badge>
            <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[64px]">
              Investor Data Room.
              <br />
              <span className="text-[#8B9DAF]">Series A 2029.</span>
            </h1>
            <div className="mt-6 h-px w-16 bg-[#8B9DAF]" />
            <p className="mt-6 max-w-2xl text-base leading-[1.7] text-zinc-400 sm:text-lg">
              The complete document repository for our $200M Series A round.
              6 categories, 32 due diligence items, audited financials, technical
              whitepapers and full legal pack — organized for fast investor
              review.
            </p>
          </FadeIn>

          {/* Hero stats */}
          <StaggerContainer
            className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4"
            stagger={0.07}
          >
            {heroStats.map((s) => (
              <StaggerItem key={s.label}>
                <div className="rounded-xl border border-white/8 bg-[#131316] p-5">
                  <p className="font-mono text-3xl font-semibold tracking-tight text-white tabular-nums">
                    {s.value}
                  </p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    {s.label}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Access notice                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-white/6 bg-[#0F0F0F] py-12">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex flex-col gap-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-300">
                  <Lock className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[14px] font-bold text-white">
                    This data room is access-controlled.
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
                    Documents are not downloadable from this page. Contact{' '}
                    <a
                      href="mailto:ir@harchcorp.com"
                      className="text-[#8B9DAF] underline-offset-4 hover:underline"
                    >
                      ir@harchcorp.com
                    </a>{' '}
                    for credentials, NDA execution and secure portal access.
                  </p>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                className="shrink-0 bg-[#8B9DAF] text-[#0D0D0D] hover:bg-[#8B9DAF]/85"
              >
                <a href="mailto:ir@harchcorp.com?subject=Investor Data Room — Access request">
                  Request credentials
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Document categories                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-white/6 bg-[#0D0D0D] py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF]">
              Document categories
            </p>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white md:text-4xl">
              6 categories. 32 documents. One secure portal.
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-400">
              Each category contains a list of available documents. Click
              &quot;Request access&quot; to email our IR team — we typically
              respond within 24 hours with NDA and portal credentials.
            </p>
          </FadeIn>

          <StaggerContainer
            className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
            stagger={0.06}
          >
            {categories.map((c) => (
              <StaggerItem key={c.id}>
                <CategoryCard category={c} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Due diligence checklist                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-white/6 bg-[#0F0F0F] py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF]">
              Due diligence checklist
            </p>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl">
                32 items. Tracked. Owned. Status visible.
              </h2>
              <p className="max-w-md text-[14px] leading-relaxed text-zinc-400">
                Use this table to plan your DD. Filter by category, see status,
                identify the owner on our side, and request access per item.
              </p>
            </div>
          </FadeIn>

          {/* Summary bar */}
          <FadeIn delay={0.05}>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-white/8 bg-[#131316] p-4">
                <p className="font-mono text-2xl font-bold text-white tabular-nums">
                  {summary.total}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Total items
                </p>
              </div>
              <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-4">
                <p className="font-mono text-2xl font-bold text-emerald-300 tabular-nums">
                  {summary.available}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Available
                </p>
              </div>
              <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.04] p-4">
                <p className="font-mono text-2xl font-bold text-amber-300 tabular-nums">
                  {summary.onRequest}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  On request
                </p>
              </div>
              <div className="rounded-lg border border-zinc-400/20 bg-zinc-400/[0.04] p-4">
                <p className="font-mono text-2xl font-bold text-zinc-300 tabular-nums">
                  {summary.inPrep}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  In preparation
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Filter bar */}
          <FadeIn delay={0.1}>
            <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-white/6 pb-6">
              <span className="mr-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                <Eye className="h-3.5 w-3.5" /> Filter
              </span>
              {filterKeys.map((c) => {
                const isActive = activeFilter === c
                const count =
                  c === 'All'
                    ? ddChecklist.length
                    : ddChecklist.filter((i) => i.category === c).length
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveFilter(c)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors',
                      isActive
                        ? 'border-[#8B9DAF]/30 bg-[#8B9DAF]/12 text-[#8B9DAF]'
                        : 'border-white/6 bg-transparent text-zinc-500 hover:border-white/12 hover:text-zinc-300'
                    )}
                  >
                    {c}
                    <span
                      className={cn(
                        'rounded px-1 text-[9px] tabular-nums',
                        isActive
                          ? 'bg-[#8B9DAF]/20 text-[#8B9DAF]'
                          : 'bg-white/5 text-zinc-500'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </FadeIn>

          {/* DD table */}
          <FadeIn delay={0.12}>
            <div className="mt-6 overflow-hidden rounded-xl border border-white/8 bg-[#131316]">
              <div className="max-h-[640px] overflow-y-auto scroll-thin">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-[#131316]">
                    <TableRow className="border-white/8 hover:bg-transparent">
                      <TableHead className="w-[60px] font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        #
                      </TableHead>
                      <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        Category
                      </TableHead>
                      <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        Item
                      </TableHead>
                      <TableHead className="w-[120px] font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        Status
                      </TableHead>
                      <TableHead className="w-[140px] font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        Owner
                      </TableHead>
                      <TableHead className="w-[110px] text-right font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item, idx) => (
                      <TableRow
                        key={item.id}
                        className="border-white/6 hover:bg-white/[0.02]"
                      >
                        <TableCell className="font-mono text-[11px] text-zinc-500 tabular-nums">
                          {String(idx + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
                            {item.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-[13px] text-zinc-200">
                          {item.title}
                        </TableCell>
                        <TableCell>
                          <DDStatusPill status={item.status} />
                        </TableCell>
                        <TableCell className="text-[12px] text-zinc-400">
                          {item.owner}
                        </TableCell>
                        <TableCell className="text-right">
                          <a
                            href={buildMailto(item.title, [item.title])}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B9DAF] transition-colors hover:text-[#8B9DAF]/80"
                          >
                            Request
                            <ChevronRight className="h-3 w-3" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="mt-4 text-[12px] text-zinc-500">
              <Clock className="mr-1 inline h-3 w-3" />
              IR response SLA: 24 business hours for &quot;Available&quot;
              items, 72 hours for &quot;On request&quot; items (NDA may be
              required). &quot;In preparation&quot; items have a target
              completion date in Q1 2029.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Contact section                                                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-b border-white/6 bg-[#0D0D0D] py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B9DAF]">
              Contact investor relations
            </p>
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl">
              One team. One inbox. One phone number.
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-zinc-400">
              All investor communications during the Series A round go through
              our Investor Relations desk. We respond within 24 business hours.
            </p>
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            <FadeIn>
              <a
                href="mailto:ir@harchcorp.com?subject=Investor Data Room — Series A 2029"
                className="group block h-full rounded-xl border border-white/8 bg-[#131316] p-7 transition-colors hover:border-[#8B9DAF]/30"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#8B9DAF]/15 bg-[#8B9DAF]/8 text-[#8B9DAF]">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                      Email
                    </p>
                    <p className="mt-0.5 text-base font-bold text-white">
                      ir@harchcorp.com
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-[13px] leading-relaxed text-zinc-400">
                  For NDA execution, data room credentials, technical questions
                  on financials, and scheduling calls with the executive team.
                </p>
                <p className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#8B9DAF]">
                  Send email
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </p>
              </a>
            </FadeIn>

            <FadeIn delay={0.08}>
              <a
                href="tel:+212522000002"
                className="group block h-full rounded-xl border border-white/8 bg-[#131316] p-7 transition-colors hover:border-[#8B9DAF]/30"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#8B9DAF]/15 bg-[#8B9DAF]/8 text-[#8B9DAF]">
                    <Phone className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                      Phone — Casablanca HQ
                    </p>
                    <p className="mt-0.5 text-base font-bold text-white">
                      +212 5 22 00 00 02
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-[13px] leading-relaxed text-zinc-400">
                  Monday — Friday, 09:00 — 18:00 GMT+1. Ask for the Investor
                  Relations desk. Out-of-hours: please email, we monitor
                  continuously during active DD.
                </p>
                <p className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#8B9DAF]">
                  Call now
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </p>
              </a>
            </FadeIn>
          </div>

          {/* Compliance & trust strip */}
          <FadeIn delay={0.12}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-xl border border-white/8 bg-[#0F0F0F] p-6 text-center">
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-zinc-400">
                <Shield className="h-3.5 w-3.5 text-[#8B9DAF]" />
                NDA enforced
              </span>
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-zinc-400">
                <Lock className="h-3.5 w-3.5 text-[#8B9DAF]" />
                Watermarked documents
              </span>
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-zinc-400">
                <Eye className="h-3.5 w-3.5 text-[#8B9DAF]" />
                Access logged & audited
              </span>
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-zinc-400">
                <Scale className="h-3.5 w-3.5 text-[#8B9DAF]" />
                GDPR & Loi 09-08 compliant
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CTA                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#000000] py-24 md:py-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,157,175,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,157,175,0.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-[900px] px-4 text-center sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              Ready to dig in?
              <br />
              <span className="text-[#8B9DAF]">Request access.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-zinc-500">
              We will execute an NDA, provision a secure portal account, and
              walk you through the data room in a 60-minute session with the
              CFO and CTO.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-[#8B9DAF] text-[#0D0D0D] hover:bg-[#8B9DAF]/85"
              >
                <a href="mailto:ir@harchcorp.com?subject=Series A 2029 — Data room access request">
                  Request data room access
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/15 bg-transparent text-white hover:bg-white/5"
              >
                <Link href="/">
                  Back to Harch Corp
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Footer                                                           */}
      {/* ---------------------------------------------------------------- */}
      <footer className="mt-auto border-t border-white/8 bg-[#0D0D0D] px-4 py-8 text-center text-xs text-zinc-600 sm:px-6">
        <div className="mx-auto max-w-[1200px]">
          © 2029 Harch Corp · Investor Relations · Casablanca, Morocco ·
          ir@harchcorp.com · +212 5 22 00 00 02
        </div>
      </footer>
    </main>
  )
}
