'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  Key, Shield, Globe, Zap, Server, Database, Brain, Activity,
  Monitor, Lock, ChevronRight, ArrowRight, Code2, Terminal,
  FileText, AlertTriangle, CheckCircle2, Copy, Wifi, Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── DATA ─── */
const authMethods = [
  {
    icon: Key,
    name: 'API Keys',
    description: 'Simple key-based authentication for server-to-server communication. Pass your API key via the X-API-Key header or Authorization Bearer token.',
    example: 'X-API-Key: hrch_live_sk_abc123def456',
    useCase: 'Backend services, CLI tools, automation scripts',
  },
  {
    icon: Shield,
    name: 'OAuth 2.0',
    description: 'Industry-standard authorization framework for third-party integrations. Supports Authorization Code, Client Credentials, and Device Code flows.',
    example: 'Authorization: Bearer eyJhbGciOiJSUzI1NiIs...',
    useCase: 'Third-party integrations, user-facing applications',
  },
  {
    icon: Lock,
    name: 'JWT Tokens',
    description: 'JSON Web Tokens for stateless session management. Tokens are signed with RSA-4096 and include sovereignty claims for data residency enforcement.',
    example: 'Authorization: Bearer <jwt_token>',
    useCase: 'Session management, service mesh authentication',
  },
];

const restEndpoints = [
  {
    resource: 'Compute',
    icon: Server,
    endpoints: [
      { method: 'POST', path: '/v1/compute/workloads', desc: 'Create a new compute workload' },
      { method: 'GET', path: '/v1/compute/workloads', desc: 'List all workloads with filters' },
      { method: 'GET', path: '/v1/compute/workloads/:id', desc: 'Get workload details and status' },
      { method: 'PATCH', path: '/v1/compute/workloads/:id', desc: 'Update workload configuration' },
      { method: 'DELETE', path: '/v1/compute/workloads/:id', desc: 'Terminate and remove a workload' },
      { method: 'POST', path: '/v1/compute/workloads/:id/scale', desc: 'Scale workload GPU allocation' },
      { method: 'POST', path: '/v1/compute/workloads/:id/migrate', desc: 'Migrate workload to another hub' },
    ],
  },
  {
    resource: 'Carbon-Aware Scheduling',
    icon: Leaf,
    endpoints: [
      { method: 'GET', path: '/v1/carbon/intensity', desc: 'Get real-time carbon intensity by zone' },
      { method: 'GET', path: '/v1/carbon/optimal-hub', desc: 'Find the hub with lowest carbon intensity for a workload' },
      { method: 'POST', path: '/v1/carbon/optimize', desc: 'Optimize workload placement for carbon efficiency' },
      { method: 'GET', path: '/v1/carbon/forecast', desc: 'Get carbon intensity forecast with green window detection' },
      { method: 'GET', path: '/v1/carbon/metrics', desc: 'Get aggregate carbon metrics across the platform' },
      { method: 'GET', path: '/v1/carbon/dashboard', desc: 'Full carbon-aware dashboard data' },
    ],
  },
  {
    resource: 'Data',
    icon: Database,
    endpoints: [
      { method: 'POST', path: '/v1/data/pipelines', desc: 'Create a data ingestion pipeline' },
      { method: 'GET', path: '/v1/data/pipelines', desc: 'List all data pipelines' },
      { method: 'POST', path: '/v1/data/pipelines/:id/ingest', desc: 'Trigger data ingestion run' },
      { method: 'GET', path: '/v1/data/lakes', desc: 'List data lake storage volumes' },
      { method: 'POST', path: '/v1/data/lakes/:id/snapshot', desc: 'Create a point-in-time snapshot' },
    ],
  },
  {
    resource: 'Models',
    icon: Brain,
    endpoints: [
      { method: 'POST', path: '/v1/models', desc: 'Register a new AI model' },
      { method: 'GET', path: '/v1/models', desc: 'List registered models' },
      { method: 'POST', path: '/v1/models/:id/deploy', desc: 'Deploy model to inference endpoint' },
      { method: 'POST', path: '/v1/models/:id/train', desc: 'Start model training job' },
      { method: 'GET', path: '/v1/models/:id/metrics', desc: 'Get model performance metrics' },
      { method: 'POST', path: '/v1/inference', desc: 'Run inference on a deployed model' },
    ],
  },
  {
    resource: 'Pricing',
    icon: Monitor,
    endpoints: [
      { method: 'GET', path: '/v1/pricing/plans', desc: 'List pricing plans with GPU type, tier, and region filters' },
      { method: 'GET', path: '/v1/pricing/plans/:id', desc: 'Get specific pricing plan details' },
      { method: 'GET', path: '/v1/pricing/estimate', desc: 'Calculate cost estimate for a workload configuration' },
      { method: 'GET', path: '/v1/pricing/billing/records', desc: 'List user billing records (auth required)' },
      { method: 'GET', path: '/v1/pricing/billing/records/:id', desc: 'Get specific billing record details' },
    ],
  },
  {
    resource: 'Regions',
    icon: Globe,
    endpoints: [
      { method: 'GET', path: '/v1/regions', desc: 'List all regions with hub count, GPUs, renewable %, and carbon intensity' },
      { method: 'GET', path: '/v1/regions/:code', desc: 'Get specific region with compliance frameworks and latency data' },
    ],
  },
  {
    resource: 'Operations',
    icon: Zap,
    endpoints: [
      { method: 'GET', path: '/v1/operations/hubs', desc: 'List all compute hubs and status' },
      { method: 'GET', path: '/v1/operations/hubs/:id', desc: 'Get hub details and capacity' },
      { method: 'POST', path: '/v1/operations/failover', desc: 'Initiate hub failover procedure' },
      { method: 'GET', path: '/v1/operations/energy', desc: 'Get energy consumption and source data' },
      { method: 'POST', path: '/v1/operations/schedule', desc: 'Create carbon-aware schedule policy' },
    ],
  },
  {
    resource: 'Monitoring',
    icon: Activity,
    endpoints: [
      { method: 'GET', path: '/v1/monitoring/metrics', desc: 'Platform-wide metrics: GPUs, utilization, carbon, energy, CO2 saved' },
      { method: 'GET', path: '/v1/monitoring/health/detailed', desc: 'Detailed health check: DB status, API version, uptime, connections' },
      { method: 'GET', path: '/v1/monitoring/alerts', desc: 'List active alerts across the mesh' },
      { method: 'POST', path: '/v1/monitoring/alerts/rules', desc: 'Create alert rule' },
      { method: 'GET', path: '/v1/monitoring/traces', desc: 'Query distributed traces' },
      { method: 'GET', path: '/v1/monitoring/logs', desc: 'Search structured logs' },
    ],
  },
];

const grpcServices = [
  { name: 'ComputeService', desc: 'Manage workloads, scaling, and GPU allocation across the mesh', methods: ['CreateWorkload', 'GetWorkload', 'ListWorkloads', 'ScaleWorkload', 'MigrateWorkload', 'StreamWorkloadEvents'] },
  { name: 'DataService', desc: 'Data pipeline management, ingestion, and lake operations', methods: ['CreatePipeline', 'IngestData', 'GetSnapshot', 'StreamData'] },
  { name: 'ModelService', desc: 'Model registration, training, and inference endpoints', methods: ['RegisterModel', 'DeployModel', 'TrainModel', 'StreamInference'] },
  { name: 'MeshService', desc: 'Hub topology, health monitoring, and mesh orchestration', methods: ['GetHubStatus', 'StreamMetrics', 'InitiateFailover', 'GetEnergyReport'] },
  { name: 'IdentityService', desc: 'Authentication, authorization, and audit logging', methods: ['Authenticate', 'Authorize', 'StreamAuditEvents', 'RevokeToken'] },
];

const wsEndpoints = [
  { path: '/v1/ws/workloads/:id/events', desc: 'Real-time workload state changes, logs, and metrics', protocol: 'JSON over WebSocket' },
  { path: '/v1/ws/metrics/stream', desc: 'Live platform metrics with configurable granularity', protocol: 'JSON over WebSocket' },
  { path: '/v1/ws/models/:id/inference', desc: 'Streaming inference for real-time model predictions', protocol: 'JSON over WebSocket' },
  { path: '/v1/ws/audit/events', desc: 'Real-time audit event stream for compliance monitoring', protocol: 'JSON over WebSocket' },
  { path: '/v1/ws/hubs/:id/telemetry', desc: 'Live hub telemetry data including power, thermal, and network', protocol: 'Protobuf over WebSocket' },
];

const rateLimits = [
  { tier: 'Free', requests: '100 req/min', burst: '50 req', compute: '10 GPU-hours/month free tier', data: '5 GB/month' },
  { tier: 'Developer', requests: '1,000 req/min', burst: '500 req', compute: '10 GPU-hours/day', data: '50 GB/month' },
  { tier: 'Professional', requests: '10,000 req/min', burst: '5,000 req', compute: '100 GPU-hours/day', data: '500 GB/month' },
  { tier: 'Enterprise', requests: 'Custom', burst: 'Custom', compute: 'Unlimited', data: 'Unlimited' },
  { tier: 'Sovereign', requests: 'Custom', burst: 'Custom', compute: 'Dedicated', data: 'Dedicated' },
];

const errorCodes = [
  { code: '400', name: 'Bad Request', desc: 'Invalid request body, missing required fields, or malformed parameters.' },
  { code: '401', name: 'Unauthorized', desc: 'Missing or invalid authentication credentials. Check API key or JWT token.' },
  { code: '403', name: 'Forbidden', desc: 'Insufficient permissions or sovereignty constraint violation. Data cannot leave the designated jurisdiction.' },
  { code: '404', name: 'Not Found', desc: 'The requested resource does not exist or has been decommissioned.' },
  { code: '409', name: 'Conflict', desc: 'Resource state conflict, such as attempting to deploy a model that is already deployed.' },
  { code: '429', name: 'Rate Limited', desc: 'Request rate exceeds your tier limit. Retry after the time specified in Retry-After header.' },
  { code: '500', name: 'Internal Error', desc: 'Unexpected server error. HarchOS operations team is automatically notified.' },
  { code: '503', name: 'Service Unavailable', desc: 'Hub is temporarily offline for maintenance. Traffic is rerouted to the nearest available hub.' },
];

const codeExamples = [
  {
    lang: 'curl',
    label: 'cURL',
    code: `curl -X POST https://api.harchos.ai/v1/compute/workloads \\
  -H "Authorization: Bearer hrch_live_sk_abc123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "llama-inference-prod",
    "gpu": "H100",
    "count": 8,
    "region": "morocco-dakhla",
    "sovereignty": "strict",
    "carbonAware": true,
    "schedule": "carbon-optimal"
  }'`,
  },
  {
    lang: 'python',
    label: 'Python',
    code: `import harchos

client = harchos.Client(
    api_key="hrch_live_sk_abc123",
    region="morocco",
    sovereignty="strict",
    carbon_aware=True,
)

workload = client.compute.create_workload(
    name="llama-inference-prod",
    gpu="H100",
    count=8,
    hub="dakhla",
    schedule="carbon-optimal",
)

print(f"Workload {workload.id} deployed on {workload.hub}")
print(f"Energy source: {workload.energy_source}")`,
  },
  {
    lang: 'typescript',
    label: 'TypeScript',
    code: `import { HarchOS } from '@harchos/sdk';

const client = await HarchOS.create({
  apiKey: 'hrch_live_sk_abc123',
  region: 'morocco',
  sovereignty: 'strict',
  carbonAware: true,
});

const workload = await client.compute.createWorkload({
  name: 'llama-inference-prod',
  gpu: 'H100',
  count: 8,
  hub: 'dakhla',
  schedule: 'carbon-optimal',
});

console.log(\`Workload \${workload.id} deployed on \${workload.hub}\`);
console.log(\`Energy source: \${workload.energySource}\`);`,
  },
];

const methodColors: Record<string, string> = {
  GET: '#10B981',
  POST: '#8B9DAF',
  PATCH: '#F59E0B',
  DELETE: '#EF4444',
};

/* ─── MAIN COMPONENT ─── */
export default function ApiDocsPageClient() {
  const [activeCodeTab, setActiveCodeTab] = useState('curl');
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#000000] overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#000000]/95 to-[#0D0D0D]" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-6 text-[#8B9DAF]">HarchOS API /0.1</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              API Reference
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-8">
              Complete reference for HarchOS REST, gRPC, and WebSocket APIs. Authenticate, create workloads, deploy models, and monitor your infrastructure.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap gap-3">
              <Link href="/docs/sdks" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                View SDKs <ArrowRight size={14} />
              </Link>
              <Link href="/docs/quickstarts" className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                Quickstart Guide
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="mt-8 font-[family-name:var(--font-space-mono)] text-[13px] bg-[#121212] border border-white/[0.06] rounded-lg px-5 py-3 max-w-xl">
              <span className="text-[#666666]">Base URL:</span>{' '}
              <span className="text-[#8B9DAF]">https://api.harchos.ai</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          AUTHENTICATION
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Authentication</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              Authenticate Your Requests
            </h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {authMethods.map((method, i) => (
              <FadeIn key={method.name} delay={i * 0.08}>
                <div className="card p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-[rgba(139,157,175,0.08)] flex items-center justify-center">
                      <method.icon size={16} className="text-[#8B9DAF]" />
                    </div>
                    <h3 className="text-base font-bold text-white">{method.name}</h3>
                  </div>
                  <p className="text-[13px] text-[#999999] leading-[1.7] mb-4">{method.description}</p>
                  <div className="bg-[#121212] border border-white/[0.06] rounded-lg px-4 py-3 mb-4">
                    <code className="text-[12px] text-[#8B9DAF] font-[family-name:var(--font-space-mono)] break-all">{method.example}</code>
                  </div>
                  <p className="text-[11px] text-[#666666]">
                    <span className="text-[#999999] font-semibold">Use case:</span> {method.useCase}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          REST API
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">REST API</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              REST Endpoints
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              The HarchOS REST API provides comprehensive access to compute, data, model, and operations resources. All endpoints use JSON for request and response bodies, follow OpenAPI 3.1 specification, and support pagination, filtering, and field selection.
            </p>
          </FadeIn>

          <div className="space-y-8">
            {restEndpoints.map((group, gi) => (
              <FadeIn key={group.resource} delay={gi * 0.06}>
                <div className="card overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
                    <group.icon size={16} className="text-[#8B9DAF]" />
                    <h3 className="text-base font-bold text-white">{group.resource}</h3>
                    <span className="ml-auto text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">{group.endpoints.length} endpoints</span>
                  </div>
                  <div className="divide-y divide-white/[0.03]">
                    {group.endpoints.map((ep) => (
                      <div key={ep.path} className="flex items-center gap-4 px-6 py-3 hover:bg-white/[0.01] transition-colors">
                        <span className="text-[11px] font-bold font-[family-name:var(--font-space-mono)] w-12 shrink-0" style={{ color: methodColors[ep.method] || '#999999' }}>{ep.method}</span>
                        <code className="text-[13px] text-white font-[family-name:var(--font-space-mono)] shrink-0 min-w-0">{ep.path}</code>
                        <span className="text-[12px] text-[#666666] ml-auto hidden md:block">{ep.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          gRPC API
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">gRPC API</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              gRPC Service Definitions
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              High-performance gRPC services for latency-sensitive workloads and streaming operations. Uses Protocol Buffers v3 for schema definition and supports bi-directional streaming for real-time data flows.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grpcServices.map((service, i) => (
              <FadeIn key={service.name} delay={i * 0.08}>
                <div className="card p-6 h-full">
                  <h3 className="text-base font-bold text-white mb-1 font-[family-name:var(--font-space-mono)]">{service.name}</h3>
                  <p className="text-[12px] text-[#666666] mb-4 leading-[1.5]">{service.desc}</p>
                  <div className="space-y-0">
                    {service.methods.map((method) => (
                      <div key={method} className="flex items-center gap-2 py-1.5 border-b border-white/[0.03] last:border-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shrink-0" />
                        <code className="text-[12px] text-[#999999] font-[family-name:var(--font-space-mono)]">{method}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WEBSOCKET API
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">WebSocket API</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              Real-Time Streaming
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              WebSocket endpoints for real-time event streaming. Connect once, receive continuous updates for workload state changes, metrics, inference results, and audit events.
            </p>
          </FadeIn>

          <div className="card overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
              <Wifi size={16} className="text-[#8B9DAF]" />
              <h3 className="text-base font-bold text-white">Streaming Endpoints</h3>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {wsEndpoints.map((ep) => (
                <div key={ep.path} className="px-6 py-4 hover:bg-white/[0.01] transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <code className="text-[13px] text-[#10B981] font-[family-name:var(--font-space-mono)] shrink-0">{ep.path}</code>
                    <span className="text-[12px] text-[#666666] flex-1">{ep.desc}</span>
                    <span className="text-[10px] text-[#999999] font-[family-name:var(--font-space-mono)] px-2 py-1 bg-[rgba(255,255,255,0.03)] rounded shrink-0">{ep.protocol}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          RATE LIMITS
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Rate Limits</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              API Rate Limits
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              Rate limits protect the platform and ensure fair resource allocation. Headers include X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset for real-time tracking.
            </p>
          </FadeIn>

          <FadeIn>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tier</th>
                      <th>Requests</th>
                      <th>Burst</th>
                      <th>Compute</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rateLimits.map((tier) => (
                      <tr key={tier.tier}>
                        <td className="font-semibold text-white">{tier.tier}</td>
                        <td className="font-[family-name:var(--font-space-mono)]">{tier.requests}</td>
                        <td className="font-[family-name:var(--font-space-mono)]">{tier.burst}</td>
                        <td className="font-[family-name:var(--font-space-mono)]">{tier.compute}</td>
                        <td className="font-[family-name:var(--font-space-mono)]">{tier.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ERROR CODES
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Error Handling</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              Error Codes
            </h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {errorCodes.map((err, i) => (
              <FadeIn key={err.code} delay={i * 0.05}>
                <div className="card p-5 h-full">
                  <div className="flex items-start gap-3">
                    <span className="text-[13px] font-bold font-[family-name:var(--font-space-mono)] px-2.5 py-1 rounded bg-[rgba(255,255,255,0.04)] text-white shrink-0">{err.code}</span>
                    <div>
                      <h4 className="text-[14px] font-semibold text-white mb-1">{err.name}</h4>
                      <p className="text-[12px] text-[#999999] leading-[1.6]">{err.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CODE EXAMPLES
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Code Examples</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              Quick Code Samples
            </h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <FadeIn>
            <div className="card overflow-hidden">
              {/* Tab buttons */}
              <div className="flex items-center gap-0 border-b border-white/[0.06]">
                {codeExamples.map((ex) => (
                  <button
                    key={ex.lang}
                    onClick={() => setActiveCodeTab(ex.lang)}
                    className={`px-6 py-3 text-[13px] font-semibold transition-colors border-b-2 ${
                      activeCodeTab === ex.lang
                        ? 'text-[#8B9DAF] border-[#8B9DAF] bg-[rgba(139,157,175,0.04)]'
                        : 'text-[#666666] border-transparent hover:text-white'
                    }`}
                  >
                    {ex.label}
                  </button>
                ))}
                <button
                  onClick={() => handleCopy(codeExamples.find(e => e.lang === activeCodeTab)?.code || '')}
                  className="ml-auto mr-4 flex items-center gap-1.5 text-[12px] text-[#666666] hover:text-white transition-colors"
                >
                  {copied ? <CheckCircle2 size={12} className="text-[#10B981]" /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              {/* Code content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCodeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 bg-[#0D0D0D]"
                >
                  <pre className="font-mono text-[13px] leading-[1.8] text-[#CCCCCC] overflow-x-auto whitespace-pre">
                    {codeExamples.find(e => e.lang === activeCodeTab)?.code}
                  </pre>
                </motion.div>
              </AnimatePresence>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/docs/sdks" className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#8B9DAF] hover:text-white transition-colors">
                View full SDK documentation <ArrowRight size={14} />
              </Link>
              <Link href="/docs/quickstarts" className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#999999] hover:text-white transition-colors">
                Try the quickstart guide <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
