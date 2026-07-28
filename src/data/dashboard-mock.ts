/**
 * Harch Intelligence — Dashboard mock data
 * ----------------------------------------
 * Realistic demo dataset used to power the investor "Try Platform"
 * console. All numbers reflect Harch Corp's public 2026 figures:
 * 1,798 GPUs across 5 hubs, 47 gCO2/kWh blended carbon intensity,
 * ~$12,450 monthly tenant cost for a mid-tier inference workload.
 */

export type HubStatus = 'online' | 'degraded' | 'maintenance'
export type JobStatus = 'running' | 'queued' | 'completed' | 'failed'
export type DeploymentStatus = 'running' | 'queued' | 'completed'
export type InvoiceStatus = 'paid' | 'pending' | 'failed'
export type GpuType = 'H100' | 'H200' | 'A100' | 'L40S'
export type Framework = 'PyTorch' | 'TensorFlow' | 'JAX' | 'vLLM'

export interface Hub {
  id: string
  name: string
  region: string
  city: string
  coordinates: { lat: number; lng: number }
  totalGpus: number
  usedGpus: number
  carbonIntensity: number // gCO2/kWh — blended, real-time
  pue: number
  energyMix: { solar: number; wind: number; grid: number }
  status: HubStatus
  uptime: number // percent over trailing 30 days
}

export interface Job {
  id: string
  name: string
  hub: string
  gpuType: GpuType
  gpuCount: number
  status: JobStatus
  progress: number // 0–100
  durationMin: number
  costUsd: number
  startedAt: string
}

export interface Deployment {
  id: string
  name: string
  framework: Framework
  gpuType: GpuType
  replicas: number
  status: DeploymentStatus
  durationMin: number
  costUsd: number
  endpoint: string
  region: string
}

export interface Invoice {
  id: string
  number: string
  period: string
  amountUsd: number
  status: InvoiceStatus
  issuedAt: string
}

export interface BillingLine {
  label: string
  detail: string
  amountUsd: number
}

/* -------------------------------------------------------------------------- */
/*                                    Hubs                                    */
/* -------------------------------------------------------------------------- */

export const hubs: Hub[] = [
  {
    id: 'hub-dakhla',
    name: 'Dakhla Atlas-01',
    region: 'Dakhla-Oued Ed-Dahab',
    city: 'Dakhla',
    coordinates: { lat: 23.6848, lng: -15.958 },
    totalGpus: 500,
    usedGpus: 462,
    carbonIntensity: 18,
    pue: 1.08,
    energyMix: { solar: 72, wind: 24, grid: 4 },
    status: 'online',
    uptime: 99.98,
  },
  {
    id: 'hub-ouarzazate',
    name: 'Ouarzazate Noor-02',
    region: 'Drâa-Tafilalet',
    city: 'Ouarzazate',
    coordinates: { lat: 30.9189, lng: -6.8934 },
    totalGpus: 420,
    usedGpus: 388,
    carbonIntensity: 24,
    pue: 1.11,
    energyMix: { solar: 84, wind: 8, grid: 8 },
    status: 'online',
    uptime: 99.95,
  },
  {
    id: 'hub-benguerir',
    name: 'Benguerir Green-03',
    region: 'Marrakech-Safi',
    city: 'Benguerir',
    coordinates: { lat: 32.2217, lng: -7.9486 },
    totalGpus: 384,
    usedGpus: 351,
    carbonIntensity: 32,
    pue: 1.13,
    energyMix: { solar: 68, wind: 18, grid: 14 },
    status: 'online',
    uptime: 99.92,
  },
  {
    id: 'hub-tanger',
    name: 'Tanger Med-04',
    region: 'Tanger-Tétouan-Al Hoceïma',
    city: 'Tanger',
    coordinates: { lat: 35.7595, lng: -5.834 },
    totalGpus: 272,
    usedGpus: 244,
    carbonIntensity: 58,
    pue: 1.19,
    energyMix: { solar: 38, wind: 41, grid: 21 },
    status: 'online',
    uptime: 99.89,
  },
  {
    id: 'hub-casablanca',
    name: 'Casablanca Tech-05',
    region: 'Casablanca-Settat',
    city: 'Casablanca',
    coordinates: { lat: 33.5731, lng: -7.5898 },
    totalGpus: 222,
    usedGpus: 208,
    carbonIntensity: 96,
    pue: 1.24,
    energyMix: { solar: 22, wind: 16, grid: 62 },
    status: 'online',
    uptime: 99.81,
  },
]

/* -------------------------------------------------------------------------- */
/*                              Aggregate stats                               */
/* -------------------------------------------------------------------------- */

export const aggregateStats = {
  totalGpus: hubs.reduce((acc, h) => acc + h.totalGpus, 0), // 1,798
  usedGpus: hubs.reduce((acc, h) => acc + h.usedGpus, 0), // 1,653
  runningJobs: 47,
  blendedCarbonIntensity: 47, // gCO2/kWh
  monthlyCostUsd: 12450,
  monthlySavingsUsd: 28650, // vs. EU-West baseline
  avgPue: 1.13,
  uptimePercent: 99.92,
}

/* GPU utilization series — last 24h, hourly buckets (0–100%) */
export const gpuUtilizationSeries: { hour: string; value: number }[] = [
  { hour: '00:00', value: 62 },
  { hour: '01:00', value: 58 },
  { hour: '02:00', value: 54 },
  { hour: '03:00', value: 49 },
  { hour: '04:00', value: 52 },
  { hour: '05:00', value: 61 },
  { hour: '06:00', value: 68 },
  { hour: '07:00', value: 74 },
  { hour: '08:00', value: 81 },
  { hour: '09:00', value: 86 },
  { hour: '10:00', value: 91 },
  { hour: '11:00', value: 88 },
  { hour: '12:00', value: 84 },
  { hour: '13:00', value: 79 },
  { hour: '14:00', value: 83 },
  { hour: '15:00', value: 87 },
  { hour: '16:00', value: 89 },
  { hour: '17:00', value: 92 },
  { hour: '18:00', value: 86 },
  { hour: '19:00', value: 78 },
  { hour: '20:00', value: 71 },
  { hour: '21:00', value: 67 },
  { hour: '22:00', value: 64 },
  { hour: '23:00', value: 60 },
]

/* -------------------------------------------------------------------------- */
/*                                    Jobs                                    */
/* -------------------------------------------------------------------------- */

export const recentJobs: Job[] = [
  {
    id: 'job-8fa3',
    name: 'GPT-finetune-v3',
    hub: 'Dakhla Atlas-01',
    gpuType: 'H100',
    gpuCount: 64,
    status: 'running',
    progress: 68,
    durationMin: 412,
    costUsd: 2841.6,
    startedAt: '2h 14m ago',
  },
  {
    id: 'job-2c91',
    name: 'BERT-classification-ar',
    hub: 'Benguerir Green-03',
    gpuType: 'A100',
    gpuCount: 8,
    status: 'running',
    progress: 41,
    durationMin: 96,
    costUsd: 312.4,
    startedAt: '38m ago',
  },
  {
    id: 'job-5d12',
    name: 'Llama3-70b-instruct-rlhf',
    hub: 'Ouarzazate Noor-02',
    gpuType: 'H200',
    gpuCount: 128,
    status: 'running',
    progress: 23,
    durationMin: 894,
    costUsd: 8124.0,
    startedAt: '6h 02m ago',
  },
  {
    id: 'job-7e44',
    name: 'Stable-Diffusion-xl-distill',
    hub: 'Tanger Med-04',
    gpuType: 'L40S',
    gpuCount: 16,
    status: 'queued',
    progress: 0,
    durationMin: 0,
    costUsd: 0,
    startedAt: 'queued 4m ago',
  },
  {
    id: 'job-9b07',
    name: 'Whisper-v3-batch-transcribe',
    hub: 'Dakhla Atlas-01',
    gpuType: 'H100',
    gpuCount: 4,
    status: 'completed',
    progress: 100,
    durationMin: 184,
    costUsd: 218.2,
    startedAt: 'completed 1h ago',
  },
]

/* -------------------------------------------------------------------------- */
/*                                Deployments                                 */
/* -------------------------------------------------------------------------- */

export const deployments: Deployment[] = [
  {
    id: 'dep-001',
    name: 'harchlink-orchestrator-prod',
    framework: 'vLLM',
    gpuType: 'H200',
    replicas: 4,
    status: 'running',
    durationMin: 18720,
    costUsd: 9842.5,
    endpoint: 'llm.harchos.io',
    region: 'Dakhla Atlas-01',
  },
  {
    id: 'dep-002',
    name: 'argus-vision-pipeline',
    framework: 'PyTorch',
    gpuType: 'H100',
    replicas: 2,
    status: 'running',
    durationMin: 11280,
    costUsd: 4218.0,
    endpoint: 'vision.harchos.io',
    region: 'Benguerir Green-03',
  },
  {
    id: 'dep-003',
    name: 'titan-forecast-net',
    framework: 'TensorFlow',
    gpuType: 'A100',
    replicas: 1,
    status: 'running',
    durationMin: 5640,
    costUsd: 1184.2,
    endpoint: 'forecast.harchos.io',
    region: 'Ouarzazate Noor-02',
  },
  {
    id: 'dep-004',
    name: 'sas-rag-retriever-v2',
    framework: 'PyTorch',
    gpuType: 'H100',
    replicas: 2,
    status: 'queued',
    durationMin: 0,
    costUsd: 0,
    endpoint: 'rag.harchos.io',
    region: 'Dakhla Atlas-01',
  },
  {
    id: 'dep-005',
    name: 'apollo-yield-regressor',
    framework: 'JAX',
    gpuType: 'L40S',
    replicas: 1,
    status: 'completed',
    durationMin: 720,
    costUsd: 312.8,
    endpoint: 'yield.harchos.io',
    region: 'Tanger Med-04',
  },
]

/* -------------------------------------------------------------------------- */
/*                                  Billing                                   */
/* -------------------------------------------------------------------------- */

export const currentMonthBilling: BillingLine[] = [
  {
    label: 'GPU compute',
    detail: '1,653 GPU-hours × $6.42 / hr',
    amountUsd: 10611.26,
  },
  {
    label: 'Object storage',
    detail: '8.4 TB · Harch Atlas Storage',
    amountUsd: 472.5,
  },
  {
    label: 'Egress bandwidth',
    detail: '3.1 TB · region-aware routing',
    amountUsd: 286.7,
  },
  {
    label: 'Carbon-aware scheduler',
    detail: 'Included · -38% carbon vs baseline',
    amountUsd: 0,
  },
  {
    label: 'Support — Scale tier',
    detail: '24/7 · dedicated SRE',
    amountUsd: 1079.54,
  },
]

export const invoices: Invoice[] = [
  {
    id: 'inv-2026-06',
    number: 'HAR-2026-06-0083',
    period: 'June 2026',
    amountUsd: 11890.4,
    status: 'paid',
    issuedAt: '2026-07-01',
  },
  {
    id: 'inv-2026-05',
    number: 'HAR-2026-05-0079',
    period: 'May 2026',
    amountUsd: 11320.1,
    status: 'paid',
    issuedAt: '2026-06-01',
  },
  {
    id: 'inv-2026-04',
    number: 'HAR-2026-04-0074',
    period: 'April 2026',
    amountUsd: 10950.8,
    status: 'paid',
    issuedAt: '2026-05-01',
  },
]

export const paymentMethod = {
  brand: 'Visa',
  last4: '4083',
  expMonth: 11,
  expYear: 2028,
  holder: 'Harch Intelligence — Treasury',
}

/* -------------------------------------------------------------------------- */
/*                              Sidebar navigation                            */
/* -------------------------------------------------------------------------- */

export type SectionId = 'overview' | 'clusters' | 'deployments' | 'billing' | 'settings'

export const navSections: { id: SectionId; label: string; description: string }[] = [
  { id: 'overview', label: 'Overview', description: 'Live fleet snapshot & cost' },
  { id: 'clusters', label: 'GPU Clusters', description: 'Five-hub distributed fleet' },
  { id: 'deployments', label: 'Deployments', description: 'Models in production' },
  { id: 'billing', label: 'Billing', description: 'Usage, invoices, payment' },
  { id: 'settings', label: 'Settings', description: 'Workspace & API keys' },
]
