'use client';

import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  Rocket, Database, BarChart3, Shield, ArrowRight, ChevronRight,
  Terminal, CheckCircle2, Copy, Code2, Cpu, Globe, Zap,
  Monitor, Eye, Brain, Key, Clock, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── DATA ─── */
const quickstarts = [
  {
    icon: Cpu,
    title: 'Deploy an AI Model',
    description: 'Deploy your first inference endpoint on the sovereign AI mesh with carbon-aware scheduling.',
    time: '5 min',
    href: '#deploy-model',
    accent: '#8B9DAF',
  },
  {
    icon: Database,
    title: 'Set Up a Data Pipeline',
    description: 'Ingest streaming IoT data through the SENSE layer and store it in your data lake.',
    time: '5 min',
    href: '/docs/guides',
    accent: '#8B5CF6',
  },
  {
    icon: BarChart3,
    title: 'Create a Monitoring Dashboard',
    description: 'Set up Grafana dashboards with real-time metrics for GPU utilization and energy consumption.',
    time: '5 min',
    href: '/docs/guides',
    accent: '#10B981',
  },
  {
    icon: Shield,
    title: 'Configure Access Control',
    description: 'Set up RBAC policies, service accounts, and zero-trust network segmentation.',
    time: '5 min',
    href: '/docs/guides',
    accent: '#F59E0B',
  },
];

const deploySteps = [
  {
    step: 1,
    title: 'Install the HarchOS SDK',
    description: 'Install the HarchOS TypeScript SDK using npm. This gives you access to all platform APIs including compute, data, and monitoring.',
    code: `npm install @harchos/sdk`,
    language: 'bash',
  },
  {
    step: 2,
    title: 'Initialize the Client',
    description: 'Create a HarchOS client with your API key and configuration. Set sovereignty to "strict" to ensure your data stays within the Morocco jurisdiction. Enable carbon-aware scheduling for optimal energy efficiency.',
    code: `import { HarchOS } from '@harchos/sdk';

const client = await HarchOS.create({
  apiKey: process.env.HARCHOS_API_KEY,
  region: 'morocco',
  sovereignty: 'strict',
  carbonAware: true,
});`,
    language: 'typescript',
  },
  {
    step: 3,
    title: 'Register Your Model',
    description: 'Upload and register your model artifact. HarchOS supports PyTorch, TensorFlow, and ONNX formats. The platform automatically validates the model, generates metadata, and prepares it for deployment.',
    code: `const model = await client.models.register({
  name: 'my-llama-model',
  framework: 'pytorch',
  artifact: './model.pt',
  sovereignty: 'strict',
});

console.log(\`Model registered: \${model.id}\`);`,
    language: 'typescript',
  },
  {
    step: 4,
    title: 'Deploy to an Inference Endpoint',
    description: 'Deploy your model as a scalable inference endpoint. Specify GPU type, count, and scheduling strategy. HarchOS will automatically select the optimal hub based on carbon intensity, latency requirements, and resource availability.',
    code: `const endpoint = await client.models.deploy(model.id, {
  gpu: 'H100',
  count: 2,
  hub: 'auto',           // Let THINK choose the optimal hub
  schedule: 'carbon-optimal',
  autoScale: {
    min: 1,
    max: 8,
    targetLatency: '100ms',
  },
});

console.log(\`Endpoint live at: \${endpoint.url}\`);`,
    language: 'typescript',
  },
  {
    step: 5,
    title: 'Run Inference',
    description: 'Send inference requests to your deployed endpoint. The SDK handles load balancing, retry logic, and automatic failover between hubs. Monitor response times and energy consumption in real time.',
    code: `const result = await client.inference.run(endpoint.id, {
  input: 'Explain the HarchOS SENSE-THINK-ACT architecture',
  maxTokens: 512,
  temperature: 0.7,
});

console.log(result.output);
console.log(\`Latency: \${result.latencyMs}ms\`);
console.log(\`Energy: \${result.energyWh}Wh (source: \${result.energySource})\`);`,
    language: 'typescript',
  },
];

const nextSteps = [
  { title: 'Configure Auto-Scaling', desc: 'Set up intelligent scaling policies for your inference endpoints', href: '/docs/guides', icon: Zap },
  { title: 'Set Up Monitoring', desc: 'Create Grafana dashboards and alerting for your workloads', href: '/docs/guides', icon: Monitor },
  { title: 'Explore the API Reference', desc: 'Full reference for all REST, gRPC, and WebSocket endpoints', href: '/docs/api', icon: Code2 },
  { title: 'Understand the Architecture', desc: 'Deep dive into the SENSE-THINK-ACT layers', href: '/docs/architecture', icon: Brain },
];

/* ─── MAIN COMPONENT ─── */
export default function QuickstartsPageClient() {
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
            <p className="section-label mb-6 text-[#8B9DAF]">Quickstart /0.1</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              Quickstart Guides
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed">
              Go from zero to a running workload in under 5 minutes. Each quickstart includes copy-paste code and step-by-step instructions.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5-MINUTE QUICKSTARTS
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">5-Minute Quickstarts</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              Start in Minutes
            </h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickstarts.map((qs, i) => (
              <FadeIn key={qs.title} delay={i * 0.08}>
                <Link href={qs.href} className="card p-6 h-full block group hover:border-white/15">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5" style={{ backgroundColor: `${qs.accent}12` }}>
                    <qs.icon size={18} style={{ color: qs.accent }} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#8B9DAF] transition-colors">{qs.title}</h3>
                  <p className="text-[13px] text-[#999999] leading-[1.6] mb-4">{qs.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] text-[#666666]">
                      <Clock size={10} /> {qs.time}
                    </span>
                    <ArrowRight size={14} className="text-[#333333] group-hover:text-[#8B9DAF] group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          STEP-BY-STEP TUTORIAL: DEPLOY YOUR FIRST AI MODEL
          ═══════════════════════════════════════════ */}
      <section id="deploy-model" className="py-20 md:py-28 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Tutorial</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              Deploy Your First AI Model on HarchOS
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-3xl text-[15px] text-[#999999] leading-[1.7] mb-4">
              This tutorial walks you through deploying an AI model as a production inference endpoint on the HarchOS sovereign AI mesh. You will install the SDK, register a model, deploy it with carbon-aware scheduling, and run your first inference request.
            </p>
            <div className="flex items-center gap-4 text-[12px] text-[#666666] mb-16">
              <span className="flex items-center gap-1.5"><Clock size={12} /> 5 minutes</span>
              <span className="flex items-center gap-1.5"><Code2 size={12} /> TypeScript SDK</span>
              <span className="flex items-center gap-1.5"><Cpu size={12} /> H100 GPU</span>
            </div>
          </FadeIn>

          <div className="space-y-12">
            {deploySteps.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.06}>
                <div className="grid grid-cols-1 lg:grid-cols-[60px_1fr] gap-6 lg:gap-8">
                  {/* Step Number */}
                  <div className="hidden lg:flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.2)] flex items-center justify-center">
                      <span className="text-[14px] font-bold text-[#8B9DAF] font-[family-name:var(--font-space-mono)]">{step.step}</span>
                    </div>
                    {i < deploySteps.length - 1 && (
                      <div className="w-px flex-1 bg-white/[0.06] mt-2" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="card p-6">
                    <div className="flex items-center gap-3 mb-3 lg:hidden">
                      <span className="w-7 h-7 rounded-full bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.2)] flex items-center justify-center text-[12px] font-bold text-[#8B9DAF] font-[family-name:var(--font-space-mono)]">{step.step}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.7] mb-4">{step.description}</p>
                    <div className="relative">
                      <div className="bg-[#0D0D0D] border border-white/[0.06] rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04]">
                          <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">{step.language}</span>
                        </div>
                        <pre className="p-4 font-mono text-[12px] leading-[1.8] text-[#CCCCCC] overflow-x-auto whitespace-pre">
                          {step.code}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Success Banner */}
          <FadeIn>
            <div className="mt-12 card p-6 border-[rgba(139,157,175,0.2)]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[rgba(139,157,175,0.08)] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} className="text-[#8B9DAF]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">You did it!</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.7]">
                    Your first AI model is now running on the HarchOS sovereign AI mesh. It is deployed with carbon-aware scheduling, 
                    meaning HarchOS automatically routes inference requests to the hub with the lowest carbon intensity while maintaining 
                    your latency requirements. You can monitor your endpoint in the HarchOS dashboard or via the monitoring API.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          NEXT STEPS
          ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Continue Learning</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.02em] mb-4">
              Next Steps
            </h2>
            <div className="accent-line mb-12" />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nextSteps.map((ns, i) => (
              <FadeIn key={ns.title} delay={i * 0.08}>
                <Link href={ns.href} className="card p-6 h-full block group hover:border-white/15">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-[rgba(139,157,175,0.08)] flex items-center justify-center shrink-0">
                      <ns.icon size={16} className="text-[#8B9DAF]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white mb-1 group-hover:text-[#8B9DAF] transition-colors">{ns.title}</h3>
                      <p className="text-[13px] text-[#999999] leading-[1.6]">{ns.desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-[#333333] group-hover:text-[#8B9DAF] shrink-0 mt-1 ml-auto group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
