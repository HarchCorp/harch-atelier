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
import { useTranslations } from 'next-intl';

/* ─── MAIN COMPONENT ─── */
export default function ApiDocsPageClient() {
  const t = useTranslations('docs');
  const [activeCodeTab, setActiveCodeTab] = useState('curl');
  const [copied, setCopied] = useState(false);

  const authMethods = [
    {
      icon: Key,
      name: t('api.authMethods.0.name'),
      description: t('api.authMethods.0.description'),
      example: 'X-API-Key: hrch_live_sk_abc123def456',
      useCase: t('api.authMethods.0.useCase'),
    },
    {
      icon: Shield,
      name: t('api.authMethods.1.name'),
      description: t('api.authMethods.1.description'),
      example: 'Authorization: Bearer eyJhbGciOiJSUzI1NiIs...',
      useCase: t('api.authMethods.1.useCase'),
    },
    {
      icon: Lock,
      name: t('api.authMethods.2.name'),
      description: t('api.authMethods.2.description'),
      example: 'Authorization: Bearer <jwt_token>',
      useCase: t('api.authMethods.2.useCase'),
    },
  ];

  const restEndpoints = [
    {
      resource: t('api.restEndpoints.0.resource'),
      icon: Server,
      endpoints: [
        { method: 'POST', path: '/v1/compute/workloads', desc: t('api.restEndpoints.0.endpoints.0.desc') },
        { method: 'GET', path: '/v1/compute/workloads', desc: t('api.restEndpoints.0.endpoints.1.desc') },
        { method: 'GET', path: '/v1/compute/workloads/:id', desc: t('api.restEndpoints.0.endpoints.2.desc') },
        { method: 'PATCH', path: '/v1/compute/workloads/:id', desc: t('api.restEndpoints.0.endpoints.3.desc') },
        { method: 'DELETE', path: '/v1/compute/workloads/:id', desc: t('api.restEndpoints.0.endpoints.4.desc') },
        { method: 'POST', path: '/v1/compute/workloads/:id/scale', desc: t('api.restEndpoints.0.endpoints.5.desc') },
        { method: 'POST', path: '/v1/compute/workloads/:id/migrate', desc: t('api.restEndpoints.0.endpoints.6.desc') },
      ],
    },
    {
      resource: t('api.restEndpoints.1.resource'),
      icon: Leaf,
      endpoints: [
        { method: 'GET', path: '/v1/carbon/intensity', desc: t('api.restEndpoints.1.endpoints.0.desc') },
        { method: 'GET', path: '/v1/carbon/optimal-hub', desc: t('api.restEndpoints.1.endpoints.1.desc') },
        { method: 'POST', path: '/v1/carbon/optimize', desc: t('api.restEndpoints.1.endpoints.2.desc') },
        { method: 'GET', path: '/v1/carbon/forecast', desc: t('api.restEndpoints.1.endpoints.3.desc') },
        { method: 'GET', path: '/v1/carbon/metrics', desc: t('api.restEndpoints.1.endpoints.4.desc') },
        { method: 'GET', path: '/v1/carbon/dashboard', desc: t('api.restEndpoints.1.endpoints.5.desc') },
      ],
    },
    {
      resource: t('api.restEndpoints.2.resource'),
      icon: Database,
      endpoints: [
        { method: 'POST', path: '/v1/data/pipelines', desc: t('api.restEndpoints.2.endpoints.0.desc') },
        { method: 'GET', path: '/v1/data/pipelines', desc: t('api.restEndpoints.2.endpoints.1.desc') },
        { method: 'POST', path: '/v1/data/pipelines/:id/ingest', desc: t('api.restEndpoints.2.endpoints.2.desc') },
        { method: 'GET', path: '/v1/data/lakes', desc: t('api.restEndpoints.2.endpoints.3.desc') },
        { method: 'POST', path: '/v1/data/lakes/:id/snapshot', desc: t('api.restEndpoints.2.endpoints.4.desc') },
      ],
    },
    {
      resource: t('api.restEndpoints.3.resource'),
      icon: Brain,
      endpoints: [
        { method: 'POST', path: '/v1/models', desc: t('api.restEndpoints.3.endpoints.0.desc') },
        { method: 'GET', path: '/v1/models', desc: t('api.restEndpoints.3.endpoints.1.desc') },
        { method: 'POST', path: '/v1/models/:id/deploy', desc: t('api.restEndpoints.3.endpoints.2.desc') },
        { method: 'POST', path: '/v1/models/:id/train', desc: t('api.restEndpoints.3.endpoints.3.desc') },
        { method: 'GET', path: '/v1/models/:id/metrics', desc: t('api.restEndpoints.3.endpoints.4.desc') },
        { method: 'POST', path: '/v1/inference', desc: t('api.restEndpoints.3.endpoints.5.desc') },
      ],
    },
    {
      resource: t('api.restEndpoints.4.resource'),
      icon: Monitor,
      endpoints: [
        { method: 'GET', path: '/v1/pricing/plans', desc: t('api.restEndpoints.4.endpoints.0.desc') },
        { method: 'GET', path: '/v1/pricing/plans/:id', desc: t('api.restEndpoints.4.endpoints.1.desc') },
        { method: 'GET', path: '/v1/pricing/estimate', desc: t('api.restEndpoints.4.endpoints.2.desc') },
        { method: 'GET', path: '/v1/pricing/billing/records', desc: t('api.restEndpoints.4.endpoints.3.desc') },
        { method: 'GET', path: '/v1/pricing/billing/records/:id', desc: t('api.restEndpoints.4.endpoints.4.desc') },
      ],
    },
    {
      resource: t('api.restEndpoints.5.resource'),
      icon: Globe,
      endpoints: [
        { method: 'GET', path: '/v1/regions', desc: t('api.restEndpoints.5.endpoints.0.desc') },
        { method: 'GET', path: '/v1/regions/:code', desc: t('api.restEndpoints.5.endpoints.1.desc') },
      ],
    },
    {
      resource: t('api.restEndpoints.6.resource'),
      icon: Zap,
      endpoints: [
        { method: 'GET', path: '/v1/operations/hubs', desc: t('api.restEndpoints.6.endpoints.0.desc') },
        { method: 'GET', path: '/v1/operations/hubs/:id', desc: t('api.restEndpoints.6.endpoints.1.desc') },
        { method: 'POST', path: '/v1/operations/failover', desc: t('api.restEndpoints.6.endpoints.2.desc') },
        { method: 'GET', path: '/v1/operations/energy', desc: t('api.restEndpoints.6.endpoints.3.desc') },
        { method: 'POST', path: '/v1/operations/schedule', desc: t('api.restEndpoints.6.endpoints.4.desc') },
      ],
    },
    {
      resource: t('api.restEndpoints.7.resource'),
      icon: Activity,
      endpoints: [
        { method: 'GET', path: '/v1/monitoring/metrics', desc: t('api.restEndpoints.7.endpoints.0.desc') },
        { method: 'GET', path: '/v1/monitoring/health/detailed', desc: t('api.restEndpoints.7.endpoints.1.desc') },
        { method: 'GET', path: '/v1/monitoring/alerts', desc: t('api.restEndpoints.7.endpoints.2.desc') },
        { method: 'POST', path: '/v1/monitoring/alerts/rules', desc: t('api.restEndpoints.7.endpoints.3.desc') },
        { method: 'GET', path: '/v1/monitoring/traces', desc: t('api.restEndpoints.7.endpoints.4.desc') },
        { method: 'GET', path: '/v1/monitoring/logs', desc: t('api.restEndpoints.7.endpoints.5.desc') },
      ],
    },
  ];

  const grpcServices = [
    { name: 'ComputeService', desc: t('api.grpcServices.0.desc'), methods: ['CreateWorkload', 'GetWorkload', 'ListWorkloads', 'ScaleWorkload', 'MigrateWorkload', 'StreamWorkloadEvents'] },
    { name: 'DataService', desc: t('api.grpcServices.1.desc'), methods: ['CreatePipeline', 'IngestData', 'GetSnapshot', 'StreamData'] },
    { name: 'ModelService', desc: t('api.grpcServices.2.desc'), methods: ['RegisterModel', 'DeployModel', 'TrainModel', 'StreamInference'] },
    { name: 'MeshService', desc: t('api.grpcServices.3.desc'), methods: ['GetHubStatus', 'StreamMetrics', 'InitiateFailover', 'GetEnergyReport'] },
    { name: 'IdentityService', desc: t('api.grpcServices.4.desc'), methods: ['Authenticate', 'Authorize', 'StreamAuditEvents', 'RevokeToken'] },
  ];

  const wsEndpoints = [
    { path: '/v1/ws/workloads/:id/events', desc: t('api.wsEndpoints.0.desc'), protocol: 'JSON over WebSocket' },
    { path: '/v1/ws/metrics/stream', desc: t('api.wsEndpoints.1.desc'), protocol: 'JSON over WebSocket' },
    { path: '/v1/ws/models/:id/inference', desc: t('api.wsEndpoints.2.desc'), protocol: 'JSON over WebSocket' },
    { path: '/v1/ws/audit/events', desc: t('api.wsEndpoints.3.desc'), protocol: 'JSON over WebSocket' },
    { path: '/v1/ws/hubs/:id/telemetry', desc: t('api.wsEndpoints.4.desc'), protocol: 'Protobuf over WebSocket' },
  ];

  const rateLimits = [
    { tier: t('api.rateLimits.0.tier'), requests: '100 req/min', burst: '50 req', compute: t('api.rateLimits.0.compute'), data: '5 GB/month' },
    { tier: t('api.rateLimits.1.tier'), requests: '1,000 req/min', burst: '500 req', compute: t('api.rateLimits.1.compute'), data: '50 GB/month' },
    { tier: t('api.rateLimits.2.tier'), requests: '10,000 req/min', burst: '5,000 req', compute: t('api.rateLimits.2.compute'), data: '500 GB/month' },
    { tier: t('api.rateLimits.3.tier'), requests: t('api.rateLimits.3.requests'), burst: t('api.rateLimits.3.burst'), compute: t('api.rateLimits.3.compute'), data: t('api.rateLimits.3.data') },
    { tier: t('api.rateLimits.4.tier'), requests: t('api.rateLimits.4.requests'), burst: t('api.rateLimits.4.burst'), compute: t('api.rateLimits.4.compute'), data: t('api.rateLimits.4.data') },
  ];

  const errorCodes = [
    { code: '400', name: t('api.errorCodes.0.name'), desc: t('api.errorCodes.0.desc') },
    { code: '401', name: t('api.errorCodes.1.name'), desc: t('api.errorCodes.1.desc') },
    { code: '403', name: t('api.errorCodes.2.name'), desc: t('api.errorCodes.2.desc') },
    { code: '404', name: t('api.errorCodes.3.name'), desc: t('api.errorCodes.3.desc') },
    { code: '409', name: t('api.errorCodes.4.name'), desc: t('api.errorCodes.4.desc') },
    { code: '429', name: t('api.errorCodes.5.name'), desc: t('api.errorCodes.5.desc') },
    { code: '500', name: t('api.errorCodes.6.name'), desc: t('api.errorCodes.6.desc') },
    { code: '503', name: t('api.errorCodes.7.name'), desc: t('api.errorCodes.7.desc') },
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
            <p className="section-label mb-6 text-[#8B9DAF]">{t('api.hero.label')}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              {t('api.title')}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-8">
              {t('api.description')}
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="flex flex-wrap gap-3">
              <Link href="/docs/sdks" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                {t('api.viewSdks')} <ArrowRight size={14} />
              </Link>
              <Link href="/docs/quickstarts" className="inline-flex items-center gap-2 border border-white/12 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                {t('api.quickstartGuide')}
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="mt-8 font-[family-name:var(--font-space-mono)] text-[13px] bg-[#121212] border border-white/[0.06] rounded-lg px-5 py-3 max-w-xl">
              <span className="text-[#666666]">{t('api.baseUrlLabel')}</span>{' '}
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('api.auth.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('api.auth.title')}
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
                    <span className="text-[#999999] font-semibold">{t('api.auth.useCase')}</span> {method.useCase}
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('api.rest.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('api.rest.title')}
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              {t('api.rest.description')}
            </p>
          </FadeIn>

          <div className="space-y-8">
            {restEndpoints.map((group, gi) => (
              <FadeIn key={group.resource} delay={gi * 0.06}>
                <div className="card overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
                    <group.icon size={16} className="text-[#8B9DAF]" />
                    <h3 className="text-base font-bold text-white">{group.resource}</h3>
                    <span className="ml-auto text-[11px] text-[#666666] font-[family-name:var(--font-space-mono)]">{group.endpoints.length} {t('api.rest.endpoints')}</span>
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('api.grpc.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('api.grpc.title')}
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              {t('api.grpc.description')}
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('api.websocket.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('api.websocket.title')}
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              {t('api.websocket.description')}
            </p>
          </FadeIn>

          <div className="card overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
              <Wifi size={16} className="text-[#8B9DAF]" />
              <h3 className="text-base font-bold text-white">{t('api.websocket.streamingEndpoints')}</h3>
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('api.rateLimits.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('api.rateLimits.title')}
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              {t('api.rateLimits.description')}
            </p>
          </FadeIn>

          <FadeIn>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('api.rateLimits.table.tier')}</th>
                      <th>{t('api.rateLimits.table.requests')}</th>
                      <th>{t('api.rateLimits.table.burst')}</th>
                      <th>{t('api.rateLimits.table.compute')}</th>
                      <th>{t('api.rateLimits.table.data')}</th>
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('api.errorHandling.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('api.errorHandling.title')}
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
            <p className="section-label mb-4 text-[#8B9DAF]">{t('api.codeExamples.label')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              {t('api.codeExamples.title')}
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
                  {copied ? t('api.codeExamples.copied') : t('api.codeExamples.copy')}
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
                {t('api.codeExamples.viewSdks')} <ArrowRight size={14} />
              </Link>
              <Link href="/docs/quickstarts" className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#999999] hover:text-white transition-colors">
                {t('api.codeExamples.tryQuickstart')} <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
