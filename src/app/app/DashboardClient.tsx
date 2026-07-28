'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Server,
  Rocket,
  CreditCard,
  Settings,
  Menu,
  X,
  Cpu,
  Activity,
  Leaf,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Bell,
  ChevronRight,
  CircleDot,
  Clock,
  Zap,
  MapPin,
  RefreshCw,
  Download,
  ExternalLink,
  TrendingUp,
  Gauge,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { FadeIn, StaggerContainer, StaggerItem, CountUp } from '@/components/ui/motion'

import {
  aggregateStats,
  currentMonthBilling,
  deployments,
  gpuUtilizationSeries,
  hubs,
  invoices,
  navSections,
  paymentMethod,
  recentJobs,
  type DeploymentStatus,
  type Deployment,
  type Hub,
  type JobStatus,
  type SectionId,
} from '@/data/dashboard-mock'

/* -------------------------------------------------------------------------- */
/*                            shared small helpers                            */
/* -------------------------------------------------------------------------- */

function formatUsd(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  })
}

function formatDuration(min: number): string {
  if (min === 0) return '—'
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function StatusDot({ status }: { status: 'online' | 'degraded' | 'maintenance' }) {
  const color =
    status === 'online'
      ? 'bg-emerald-400'
      : status === 'degraded'
      ? 'bg-amber-400'
      : 'bg-zinc-400'
  return (
    <span className="relative flex h-2 w-2">
      {status === 'online' && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
      )}
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', color)} />
    </span>
  )
}

function JobStatusBadge({ status }: { status: JobStatus }) {
  const map: Record<JobStatus, { label: string; cls: string }> = {
    running: {
      label: 'Running',
      cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },
    queued: {
      label: 'Queued',
      cls: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    },
    completed: {
      label: 'Completed',
      cls: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    },
    failed: {
      label: 'Failed',
      cls: 'border-red-500/30 bg-red-500/10 text-red-300',
    },
  }
  const m = map[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        m.cls
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {m.label}
    </span>
  )
}

function DeploymentStatusBadge({ status }: { status: DeploymentStatus }) {
  const map: Record<DeploymentStatus, { label: string; cls: string }> = {
    running: {
      label: 'Running',
      cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },
    queued: {
      label: 'Queued',
      cls: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    },
    completed: {
      label: 'Completed',
      cls: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    },
  }
  const m = map[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        m.cls
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {m.label}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Stat Card                                   */
/* -------------------------------------------------------------------------- */

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  delta?: { value: string; positive: boolean }
  caption: string
  accent?: boolean
}

function StatCard({
  icon: Icon,
  label,
  value,
  decimals = 0,
  prefix,
  suffix,
  delta,
  caption,
  accent = false,
}: StatCardProps) {
  return (
    <StaggerItem>
      <Card
        className={cn(
          'relative overflow-hidden border-white/8 bg-[#131316] py-5',
          accent && 'border-[#8B9DAF]/40'
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl',
            accent ? 'bg-[#8B9DAF]/20' : 'bg-white/5'
          )}
        />
        <CardContent className="relative z-10 px-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              {label}
            </span>
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                accent ? 'bg-[#8B9DAF]/15' : 'bg-white/5'
              )}
            >
              <Icon className={cn('h-4 w-4', accent ? 'text-[#8B9DAF]' : 'text-zinc-300')} />
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold tracking-tight text-white tabular-nums">
              <CountUp
                to={value}
                decimals={decimals}
                prefix={prefix}
                suffix={suffix}
                duration={1.6}
              />
            </span>
            {delta && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-medium',
                  delta.positive ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {delta.positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {delta.value}
              </span>
            )}
          </div>

          <p className="mt-2 text-xs text-zinc-500">{caption}</p>
        </CardContent>
      </Card>
    </StaggerItem>
  )
}

/* -------------------------------------------------------------------------- */
/*                            GPU Utilization Chart                           */
/* -------------------------------------------------------------------------- */

function GpuUtilizationChart() {
  const max = 100
  return (
    <Card className="border-white/8 bg-[#131316]">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-white">
            GPU utilization · 24h
          </CardTitle>
          <CardDescription className="text-zinc-500">
            Hourly average across all five hubs
          </CardDescription>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#8B9DAF]" /> Utilization %
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-emerald-400/60" /> Solar hours
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-48 items-end gap-[3px]">
          {gpuUtilizationSeries.map((point, i) => {
            const isSolar = i >= 6 && i <= 18
            return (
              <div
                key={point.hour}
                className="group relative flex flex-1 flex-col items-center justify-end"
              >
                <div
                  className={cn(
                    'w-full rounded-t-[3px] transition-all duration-300',
                    isSolar ? 'bg-emerald-400/60' : 'bg-[#8B9DAF]',
                    'group-hover:opacity-90'
                  )}
                  style={{ height: `${(point.value / max) * 100}%` }}
                />
                <div className="pointer-events-none absolute -top-7 hidden rounded-md border border-white/10 bg-[#0D0D0D] px-2 py-1 text-[10px] font-medium text-white shadow-lg group-hover:block">
                  {point.value}%
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-zinc-500">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Active Hubs List                              */
/* -------------------------------------------------------------------------- */

function ActiveHubsList() {
  return (
    <Card className="border-white/8 bg-[#131316]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-white">Active hubs</CardTitle>
            <CardDescription className="text-zinc-500">
              {hubs.length} production clusters · live status
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          >
            <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            All online
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {hubs.map((hub) => {
            const utilPct = Math.round((hub.usedGpus / hub.totalGpus) * 100)
            return (
              <li
                key={hub.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <StatusDot status={hub.status} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{hub.name}</p>
                    <p className="flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="h-3 w-3" />
                      {hub.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden text-right sm:block">
                    <p className="font-mono text-sm font-medium text-white">
                      {hub.usedGpus}
                      <span className="text-zinc-500">/{hub.totalGpus}</span>
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">GPUs</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-medium text-emerald-300">
                      {hub.carbonIntensity}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">gCO₂/kWh</p>
                  </div>
                  <div className="hidden w-24 md:block">
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>util</span>
                      <span className="font-mono text-zinc-300">{utilPct}%</span>
                    </div>
                    <Progress value={utilPct} className="mt-1 h-1.5 bg-white/10" />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                             Recent Jobs Table                              */
/* -------------------------------------------------------------------------- */

function RecentJobsTable() {
  return (
    <Card className="border-white/8 bg-[#131316]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-white">Recent jobs</CardTitle>
          <CardDescription className="text-zinc-500">
            Latest training & inference tasks
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white"
          onClick={() => alert('Coming soon — full job log viewer is part of the GA release.')}
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="pl-6 text-xs uppercase tracking-wider text-zinc-500">Job</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-zinc-500">Status</TableHead>
              <TableHead className="hidden text-xs uppercase tracking-wider text-zinc-500 sm:table-cell">GPU</TableHead>
              <TableHead className="hidden text-xs uppercase tracking-wider text-zinc-500 md:table-cell">Duration</TableHead>
              <TableHead className="pr-6 text-right text-xs uppercase tracking-wider text-zinc-500">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentJobs.map((job) => (
              <TableRow
                key={job.id}
                className="border-white/5 hover:bg-white/[0.02] data-[state=selected]:bg-white/[0.04]"
              >
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5">
                      <Cpu className="h-3.5 w-3.5 text-[#8B9DAF]" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{job.name}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {job.gpuCount}× {job.gpuType} · {job.hub}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <JobStatusBadge status={job.status} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="font-mono text-xs text-zinc-300">{job.gpuType}</span>
                </TableCell>
                <TableCell className="hidden text-xs text-zinc-400 md:table-cell">
                  {formatDuration(job.durationMin)}
                </TableCell>
                <TableCell className="pr-6 text-right font-mono text-sm text-zinc-200">
                  {job.costUsd === 0 ? '—' : formatUsd(job.costUsd)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Overview Section                              */
/* -------------------------------------------------------------------------- */

function OverviewSection() {
  return (
    <div className="space-y-6">
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" stagger={0.06}>
        <StatCard
          icon={Cpu}
          label="Active GPUs"
          value={aggregateStats.totalGpus}
          caption={`1,653 in use · ${Math.round((aggregateStats.usedGpus / aggregateStats.totalGpus) * 100)}% utilization`}
          delta={{ value: '+12', positive: true }}
          accent
        />
        <StatCard
          icon={Activity}
          label="Running Jobs"
          value={aggregateStats.runningJobs}
          caption="5 hubs · 64 jobs in queue"
          delta={{ value: '+8', positive: true }}
        />
        <StatCard
          icon={Leaf}
          label="Carbon Intensity"
          value={aggregateStats.blendedCarbonIntensity}
          suffix=" gCO₂/kWh"
          caption="−72% vs EU-West baseline"
          delta={{ value: '−4', positive: true }}
        />
        <StatCard
          icon={DollarSign}
          label="Monthly Cost"
          value={aggregateStats.monthlyCostUsd}
          prefix="$"
          decimals={0}
          caption="$28,650 saved vs on-prem"
          delta={{ value: '−3.1%', positive: true }}
        />
      </StaggerContainer>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FadeIn>
            <GpuUtilizationChart />
          </FadeIn>
        </div>
        <FadeIn delay={0.1}>
          <ActiveHubsList />
        </FadeIn>
      </div>

      <FadeIn delay={0.15}>
        <RecentJobsTable />
      </FadeIn>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                             Clusters Section                               */
/* -------------------------------------------------------------------------- */

function ClustersSection() {
  return (
    <FadeIn className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Distributed GPU fleet</h2>
          <p className="mt-1 text-sm text-zinc-400">
            1,798 GPUs across 5 carbon-aware hubs in Morocco — all PUE ≤ 1.24
          </p>
        </div>
        <Button
          className="bg-[#8B9DAF] text-[#0D0D0D] hover:bg-[#8B9DAF]/85"
          onClick={() => alert('Coming soon — cluster provisioning will be available post-Series A.')}
        >
          <Plus className="h-4 w-4" />
          Deploy New Cluster
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerContainer className="contents" stagger={0.05}>
          <StatCard
            icon={Server}
            label="Total Hubs"
            value={hubs.length}
            caption="2 under construction (Tantan, Laâyoune)"
          />
          <StatCard
            icon={Cpu}
            label="Total GPUs"
            value={aggregateStats.totalGpus}
            caption="92% in active use"
            accent
          />
          <StatCard
            icon={Gauge}
            label="Avg PUE"
            value={aggregateStats.avgPue}
            decimals={2}
            caption="1.08 best (Dakhla) · 1.24 worst (Casa)"
          />
          <StatCard
            icon={Leaf}
            label="Blended Carbon"
            value={aggregateStats.blendedCarbonIntensity}
            suffix=" gCO₂/kWh"
            caption="Real-time grid + solar mix"
          />
        </StaggerContainer>
      </div>

      <Card className="border-white/8 bg-[#131316]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">Hub inventory</CardTitle>
          <CardDescription className="text-zinc-500">
            Real-time GPU availability & carbon intensity per region
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="pl-6 text-xs uppercase tracking-wider text-zinc-500">Hub</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-zinc-500">Available</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-zinc-500">Used</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-zinc-500">Utilization</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-zinc-500">Carbon gCO₂/kWh</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-zinc-500">Status</TableHead>
                <TableHead className="pr-6 text-right text-xs uppercase tracking-wider text-zinc-500">Uptime</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hubs.map((hub) => {
                const available = hub.totalGpus - hub.usedGpus
                const utilPct = Math.round((hub.usedGpus / hub.totalGpus) * 100)
                return (
                  <TableRow
                    key={hub.id}
                    className="border-white/5 hover:bg-white/[0.02]"
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#8B9DAF]/10">
                          <Server className="h-4 w-4 text-[#8B9DAF]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{hub.name}</p>
                          <p className="flex items-center gap-1 text-xs text-zinc-500">
                            <MapPin className="h-3 w-3" />
                            {hub.city} · PUE {hub.pue.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-emerald-300">
                      {available}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-zinc-300">{hub.usedGpus}</TableCell>
                    <TableCell className="min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <Progress value={utilPct} className="h-1.5 w-20 bg-white/10" />
                        <span className="font-mono text-xs text-zinc-400">{utilPct}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-medium text-emerald-300">
                        {hub.carbonIntensity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                        <StatusDot status={hub.status} />
                        <span className="capitalize">{hub.status}</span>
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-right font-mono text-xs text-zinc-400">
                      {hub.uptime}%
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-white/8 bg-[#131316]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">Energy mix — Dakhla Atlas-01</CardTitle>
            <CardDescription className="text-zinc-500">Lowest-carbon hub</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-3 overflow-hidden rounded-full">
              <div className="bg-amber-400" style={{ width: '72%' }} title="Solar 72%" />
              <div className="bg-sky-400" style={{ width: '24%' }} title="Wind 24%" />
              <div className="bg-zinc-500" style={{ width: '4%' }} title="Grid 4%" />
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-zinc-300">
                <span className="h-2 w-2 rounded-sm bg-amber-400" /> Solar 72%
              </span>
              <span className="inline-flex items-center gap-1.5 text-zinc-300">
                <span className="h-2 w-2 rounded-sm bg-sky-400" /> Wind 24%
              </span>
              <span className="inline-flex items-center gap-1.5 text-zinc-300">
                <span className="h-2 w-2 rounded-sm bg-zinc-500" /> Grid 4%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/8 bg-[#131316]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">Carbon-aware scheduler</CardTitle>
            <CardDescription className="text-zinc-500">Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-semibold text-emerald-300">−38%</span>
              <span className="text-xs text-zinc-500">vs. grid-only routing</span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Jobs were automatically deferred to solar-peak hours (10:00–16:00 local) and routed
              through Dakhla Atlas-01 when grid carbon exceeded 90 gCO₂/kWh.
            </p>
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  )
}

/* -------------------------------------------------------------------------- */
/*                            Deployments Section                             */
/* -------------------------------------------------------------------------- */

function DeploymentsSection() {
  const totalRunning = deployments.filter((d) => d.status === 'running').length
  return (
    <FadeIn className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Production deployments</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {totalRunning} live endpoints · {deployments.length} total
          </p>
        </div>
        <Button
          className="bg-[#8B9DAF] text-[#0D0D0D] hover:bg-[#8B9DAF]/85"
          onClick={() => alert('Coming soon — deployment wizard lands with the GA release.')}
        >
          <Rocket className="h-4 w-4" />
          New Deployment
        </Button>
      </div>

      <StaggerContainer className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" stagger={0.06}>
        {deployments.map((dep) => (
          <DeploymentCard key={dep.id} dep={dep} />
        ))}
      </StaggerContainer>
    </FadeIn>
  )
}

function DeploymentCard({ dep }: { dep: Deployment }) {
  return (
    <StaggerItem>
      <Card className="group h-full border-white/8 bg-[#131316] py-5 transition-colors hover:border-[#8B9DAF]/30">
        <CardContent className="space-y-4 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#8B9DAF]/10">
                <Rocket className="h-4 w-4 text-[#8B9DAF]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{dep.name}</p>
                <p className="text-xs text-zinc-500">{dep.region}</p>
              </div>
            </div>
            <DeploymentStatusBadge status={dep.status} />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2">
              <p className="text-zinc-500">Framework</p>
              <p className="mt-0.5 font-medium text-zinc-200">{dep.framework}</p>
            </div>
            <div className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2">
              <p className="text-zinc-500">GPU type</p>
              <p className="mt-0.5 font-mono font-medium text-zinc-200">{dep.gpuType}</p>
            </div>
            <div className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2">
              <p className="text-zinc-500">Replicas</p>
              <p className="mt-0.5 font-mono font-medium text-zinc-200">{dep.replicas}</p>
            </div>
            <div className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2">
              <p className="text-zinc-500">Duration</p>
              <p className="mt-0.5 font-medium text-zinc-200">{formatDuration(dep.durationMin)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Endpoint</p>
              <p className="flex items-center gap-1 text-xs font-medium text-[#8B9DAF]">
                {dep.endpoint}
                <ExternalLink className="h-3 w-3" />
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Spend</p>
              <p className="font-mono text-sm font-medium text-white">
                {dep.costUsd === 0 ? '—' : formatUsd(dep.costUsd)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </StaggerItem>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Billing Section                               */
/* -------------------------------------------------------------------------- */

function BillingSection() {
  const total = currentMonthBilling.reduce((acc, l) => acc + l.amountUsd, 0)
  return (
    <FadeIn className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Billing & usage</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Current billing period · July 2026 · USD
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-white/8 bg-[#131316] lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-white">
                Current month summary
              </CardTitle>
              <CardDescription className="text-zinc-500">
                July 1–31 · auto-renews Aug 1
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white"
              onClick={() => alert('Coming soon — invoice PDF export lands with the GA release.')}
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentMonthBilling.map((line) => (
              <div
                key={line.label}
                className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{line.label}</p>
                  <p className="truncate text-xs text-zinc-500">{line.detail}</p>
                </div>
                <p className="ml-4 shrink-0 font-mono text-sm text-zinc-200">
                  {line.amountUsd === 0 ? (
                    <span className="text-emerald-300">Included</span>
                  ) : (
                    formatUsd(line.amountUsd)
                  )}
                </p>
              </div>
            ))}
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-semibold text-white">Total due</p>
                <p className="text-xs text-zinc-500">Net 30 · auto-charged Aug 1</p>
              </div>
              <p className="font-mono text-2xl font-semibold text-white">
                <CountUp to={total} prefix="$" duration={1.8} />
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/8 bg-[#131316]">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white">Payment method</CardTitle>
              <CardDescription className="text-zinc-500">Auto-renew enabled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-gradient-to-br from-[#8B9DAF]/15 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-300">
                    {paymentMethod.brand}
                  </span>
                  <CreditCard className="h-4 w-4 text-zinc-300" />
                </div>
                <p className="mt-4 font-mono text-lg tracking-widest text-white">
                  •••• •••• •••• {paymentMethod.last4}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                  <span className="truncate">{paymentMethod.holder}</span>
                  <span className="font-mono">
                    {String(paymentMethod.expMonth).padStart(2, '0')}/{paymentMethod.expYear}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white"
                onClick={() => alert('Coming soon — payment management lands with the GA release.')}
              >
                Update payment method
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-[#131316]">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white">Savings vs. on-prem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold text-emerald-300">
                  <CountUp to={aggregateStats.monthlySavingsUsd} prefix="$" duration={1.8} />
                </span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Compared to equivalent EU-West capacity with carbon offsets.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-white/8 bg-[#131316]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">Invoice history</CardTitle>
          <CardDescription className="text-zinc-500">
            All invoices paid on time · net-30 terms
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="pl-6 text-xs uppercase tracking-wider text-zinc-500">Invoice #</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-zinc-500">Period</TableHead>
                <TableHead className="hidden text-xs uppercase tracking-wider text-zinc-500 sm:table-cell">Issued</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-zinc-500">Status</TableHead>
                <TableHead className="pr-6 text-right text-xs uppercase tracking-wider text-zinc-500">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} className="border-white/5 hover:bg-white/[0.02]">
                  <TableCell className="pl-6 font-mono text-xs text-zinc-300">{inv.number}</TableCell>
                  <TableCell className="text-sm text-white">{inv.period}</TableCell>
                  <TableCell className="hidden text-xs text-zinc-400 sm:table-cell">{inv.issuedAt}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        inv.status === 'paid'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : inv.status === 'pending'
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                          : 'border-red-500/30 bg-red-500/10 text-red-300'
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                      <span className="capitalize">{inv.status}</span>
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-right font-mono text-sm text-zinc-200">
                    {formatUsd(inv.amountUsd)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </FadeIn>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Settings Section                              */
/* -------------------------------------------------------------------------- */

function SettingsSection() {
  return (
    <FadeIn className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Workspace settings</h2>
        <p className="mt-1 text-sm text-zinc-400">Demo mode · changes are not persisted</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-white/8 bg-[#131316]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">Organization</CardTitle>
            <CardDescription className="text-zinc-500">
              Investor demo workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Workspace" value="harch-intelligence-demo" />
            <Row label="Plan" value="Scale (annual)" />
            <Row label="Region" value="Morocco · multi-hub" />
            <Row label="Created" value="2026-01-12" />
            <Row label="Tenant ID" value="tan_4f8a92e1d3" mono />
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-[#131316]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white">API keys</CardTitle>
            <CardDescription className="text-zinc-500">
              Read-only in demo mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Production · read-only</p>
                  <p className="mt-1 font-mono text-xs text-zinc-400">
                    harch_live_••••••••••••3a9c
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-[#8B9DAF]/40 bg-[#8B9DAF]/10 text-[#8B9DAF]"
                >
                  Active
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white"
              onClick={() => alert('Coming soon — API key rotation lands with the GA release.')}
            >
              <Plus className="h-3.5 w-3.5" />
              Generate new key
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/8 bg-[#131316]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white">Sustainability commitments</CardTitle>
          <CardDescription className="text-zinc-500">
            Carbon-aware defaults applied to every job
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: 'Max carbon intensity', value: '120 gCO₂/kWh', icon: Leaf },
            { label: 'Preferred energy', value: 'Solar + Wind', icon: Zap },
            { label: 'Peak deferral', value: '10:00–16:00 local', icon: Clock },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
            >
              <item.icon className="h-4 w-4 text-[#8B9DAF]" />
              <p className="mt-2 text-xs uppercase tracking-wider text-zinc-500">
                {item.label}
              </p>
              <p className="mt-0.5 text-sm font-medium text-white">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </FadeIn>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
      <span className="text-zinc-500">{label}</span>
      <span className={cn('text-zinc-200', mono && 'font-mono text-xs')}>{value}</span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Sidebar                                   */
/* -------------------------------------------------------------------------- */

interface SidebarProps {
  active: SectionId
  onSelect: (id: SectionId) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

const navIcon: Record<SectionId, React.ElementType> = {
  overview: LayoutDashboard,
  clusters: Server,
  deployments: Rocket,
  billing: CreditCard,
  settings: Settings,
}

function Sidebar({ active, onSelect, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/8 bg-[#0A0A0A] transition-transform duration-300 lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/8 px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#8B9DAF] text-[#0D0D0D]">
              <span className="font-mono text-sm font-bold">H</span>
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-white">Harch Corp</p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Intelligence</p>
            </div>
          </Link>
          <button
            onClick={onMobileClose}
            className="rounded-md p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scroll-thin">
          <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Console
          </p>
          {navSections.map((section) => {
            const Icon = navIcon[section.id]
            const isActive = active === section.id
            return (
              <button
                key={section.id}
                onClick={() => {
                  onSelect(section.id)
                  onMobileClose()
                }}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all',
                  isActive
                    ? 'bg-[#8B9DAF]/12 text-white'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    isActive ? 'text-[#8B9DAF]' : 'text-zinc-500 group-hover:text-zinc-300'
                  )}
                />
                <span className="flex-1 text-sm font-medium">{section.label}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8B9DAF]" />
                )}
              </button>
            )
          })}

          <div className="px-3 pt-6 pb-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Resources
            </p>
          </div>
          {[
            { label: 'Documentation', icon: ExternalLink },
            { label: 'API reference', icon: ExternalLink },
            { label: 'Status page', icon: CircleDot },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => alert('Coming soon — these resources are part of the GA release.')}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <item.icon className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300" />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Demo Mode badge */}
        <div className="border-t border-white/8 p-4">
          <div className="rounded-lg border border-[#8B9DAF]/25 bg-[#8B9DAF]/[0.06] p-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8B9DAF] opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8B9DAF]" />
              </span>
              <span className="text-xs font-semibold text-[#8B9DAF]">Demo Mode</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
              Investor sandbox. Data is illustrative — no real workloads are executed.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Topbar                                    */
/* -------------------------------------------------------------------------- */

function Topbar({
  active,
  onOpenMobile,
}: {
  active: SectionId
  onOpenMobile: () => void
}) {
  const section = navSections.find((s) => s.id === active)!
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/8 bg-[#0D0D0D]/80 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onOpenMobile}
        className="rounded-md p-1.5 text-zinc-300 hover:bg-white/5 hover:text-white lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 items-center gap-2 text-sm">
        <span className="text-zinc-500">Console</span>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
        <span className="truncate font-medium text-white">{section.label}</span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search jobs, hubs, deployments…"
            className="h-9 w-64 rounded-md border border-white/8 bg-white/5 pl-8 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-[#8B9DAF]/40 focus:outline-none focus:ring-1 focus:ring-[#8B9DAF]/30"
            aria-label="Search"
          />
        </div>
        <button
          className="relative rounded-md p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#8B9DAF]" />
        </button>
        <div className="flex items-center gap-2 rounded-md border border-white/8 bg-white/5 px-2.5 py-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8B9DAF] text-[10px] font-bold text-[#0D0D0D]">
            IV
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-medium leading-tight text-white">Investor Demo</p>
            <p className="text-[10px] leading-tight text-zinc-500">demo@harchcorp.io</p>
          </div>
        </div>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*                          Live indicator (top of main)                      */
/* -------------------------------------------------------------------------- */

function LiveStrip() {
  const [time, setTime] = React.useState<string>('')
  React.useEffect(() => {
    const tick = () => {
      const d = new Date()
      setTime(
        d.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' GMT+1'
      )
    }
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-white/8 bg-[#131316] px-4 py-2.5 text-xs">
      <span className="inline-flex items-center gap-2 font-medium text-emerald-300">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        Live
      </span>
      <span className="text-zinc-500">Casablanca · {time}</span>
      <Separator orientation="vertical" className="hidden h-3 bg-white/10 sm:block" />
      <span className="inline-flex items-center gap-1.5 text-zinc-400">
        <TrendingUp className="h-3 w-3 text-[#8B9DAF]" />
        Fleet utilization 92%
      </span>
      <span className="inline-flex items-center gap-1.5 text-zinc-400">
        <Leaf className="h-3 w-3 text-emerald-400" />
        47 gCO₂/kWh blended
      </span>
      <span className="ml-auto inline-flex items-center gap-1.5 text-zinc-500">
        <RefreshCw className="h-3 w-3" />
        Auto-refresh 30s
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Page root                                   */
/* -------------------------------------------------------------------------- */

export default function DashboardClient() {
  const [active, setActive] = React.useState<SectionId>('overview')
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const sectionLabel = navSections.find((s) => s.id === active)!

  return (
    <div className="flex min-h-screen bg-[#0D0D0D] text-zinc-100">
      <Sidebar
        active={active}
        onSelect={setActive}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar active={active} onOpenMobile={() => setMobileOpen(true)} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Section heading */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  {sectionLabel.label}
                </h1>
                <p className="mt-1 text-sm text-zinc-400">{sectionLabel.description}</p>
              </div>
              <LiveStrip />
            </div>

            {active === 'overview' && <OverviewSection />}
            {active === 'clusters' && <ClustersSection />}
            {active === 'deployments' && <DeploymentsSection />}
            {active === 'billing' && <BillingSection />}
            {active === 'settings' && <SettingsSection />}
          </div>
        </main>

        <footer className="border-t border-white/8 px-4 py-4 text-center text-xs text-zinc-600 sm:px-6">
          Harch Intelligence Console · Demo Mode · © 2026 Harch Corp · Powered by solar & wind
        </footer>
      </div>
    </div>
  )
}
