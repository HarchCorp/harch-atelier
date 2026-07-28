'use client';

import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import {
  ArrowRight, ArrowLeft, Github, Star, GitFork, GitBranch,
  Scale, Users, Eye, Heart, Code2, ExternalLink,
  CheckCircle2, Shield, BookOpen, MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── DATA ─── */
const projects = [
  {
    name: 'harchos-sdk-python',
    githubUrl: '',
    description: 'Official Python SDK for HarchOS. Full async/await support with automatic retry logic, streaming responses, and Pydantic models for type-safe API interactions. Works with Python 3.9+.',
    language: 'Python',
    languageColor: '#3572A5',
    defaultStars: 0,
    defaultForks: 0,
    license: 'Apache 2.0',
    comingSoon: true,
  },
  {
    name: 'harchos-sdk-js',
    githubUrl: '',
    description: 'TypeScript/JavaScript SDK with full IntelliSense support, tree-shakeable exports, and automatic type inference. Works seamlessly in Node.js, Deno, and modern browsers. Zero runtime dependencies.',
    language: 'TypeScript',
    languageColor: '#2B7489',
    defaultStars: 0,
    defaultForks: 0,
    license: 'Apache 2.0',
    comingSoon: true,
  },
  {
    name: 'harchos-cli',
    githubUrl: '',
    description: 'Command-line interface for deploying, managing, and monitoring HarchOS workloads. Supports shell completions, configuration profiles, and piped output for CI/CD integration. Written in Go.',
    language: 'Go',
    languageColor: '#00ADD8',
    defaultStars: 0,
    defaultForks: 0,
    license: 'Apache 2.0',
    comingSoon: true,
  },
  {
    name: 'harchos-terraform-provider',
    githubUrl: '',
    description: 'Terraform provider for managing HarchOS infrastructure as code. Full resource lifecycle management, data sources for queries, and plan/apply support for all compute, storage, and networking resources.',
    language: 'Go',
    languageColor: '#00ADD8',
    defaultStars: 0,
    defaultForks: 0,
    license: 'Apache 2.0',
    comingSoon: true,
  },
  {
    name: 'harchos-grafana-plugins',
    githubUrl: '',
    description: 'Grafana dashboard plugins for HarchOS observability. Pre-built panels for GPU utilization, carbon metrics, hub health, and workload distribution. Drag-and-drop integration with existing Grafana instances.',
    language: 'TypeScript',
    languageColor: '#2B7489',
    defaultStars: 0,
    defaultForks: 0,
    license: 'Apache 2.0',
    comingSoon: true,
  },
  {
    name: 'harchos-examples',
    githubUrl: '',
    description: 'Starter templates and example projects for common HarchOS workflows. Includes PyTorch training, LLM inference, data pipelines, and multi-hub deployment patterns. Copy-paste ready.',
    language: 'Python',
    languageColor: '#3572A5',
    defaultStars: 0,
    defaultForks: 0,
    license: 'Apache 2.0',
    comingSoon: true,
  },
];

const contributingSteps = [
  {
    step: '01',
    title: 'Find an Issue',
    description: 'Browse issues labeled "good first issue" or "help wanted" across our repositories. We maintain a curated list of beginner-friendly contributions.',
    icon: Eye,
    color: '#8B9DAF',
  },
  {
    step: '02',
    title: 'Fork & Branch',
    description: 'Fork the repository, create a feature branch from main, and write your code. Follow our code style guide and include tests for new functionality.',
    icon: GitBranch,
    color: '#8B5CF6',
  },
  {
    step: '03',
    title: 'Submit a PR',
    description: 'Open a pull request with a clear description of changes. Our maintainers review PRs within 48 hours. All contributions require a CLA signature.',
    icon: GitFork,
    color: '#10B981',
  },
  {
    step: '04',
    title: 'Ship It',
    description: 'After review and approval, your code ships. Contributors are credited in release notes and our annual contributors report. Welcome to the team.',
    icon: CheckCircle2,
    color: '#F59E0B',
  },
];

const communityValues = [
  {
    icon: Eye,
    title: 'Open by Default',
    description: 'Every feature, bug fix, and architectural decision is discussed in the open. Our roadmap is public. Our issue tracker is public. No hidden priorities — transparency is the default.',
  },
  {
    icon: Shield,
    title: 'Transparent Development',
    description: 'All development happens on GitHub. No internal forks, no private branches. Every commit is visible. RFCs and design docs are published before implementation begins.',
  },
  {
    icon: Heart,
    title: 'Community-First',
    description: 'Community feedback shapes our priorities. Feature requests with strong community support get fast-tracked. Our developer advocates are active daily in Discord and GitHub Discussions.',
  },
];

/* ─── MAIN COMPONENT ─── */
export default function OpenSourcePageClient() {
  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-[#8B5CF6]/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <Link href="/developers" className="inline-flex items-center gap-2 text-[13px] text-[#666666] hover:text-white transition-colors mb-8">
              <ArrowLeft size={14} /> Developer Center
            </Link>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="section-label mb-6 text-[#8B5CF6]">Open Source /0.4</p>
            <h1 className="text-5xl md:text-7xl lg:text-[88px] font-extrabold text-white tracking-[-0.03em] leading-[0.95] mb-6">
              Open Source<br/>at Harch<span className="text-[#8B5CF6]">.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-[#CCCCCC] max-w-2xl leading-relaxed mb-4">
              Sovereign infrastructure demands transparent software.
            </p>
            <p className="text-[15px] text-[#999999] max-w-xl leading-[1.7] mb-10">
              All our SDKs, tooling, and integrations are open source under Apache 2.0. Audit every line, contribute features, and build with confidence on code you can verify.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <Link href="/developers" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all">
              <Github size={16} /> Coming Soon to GitHub
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          OUR PROJECTS
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B5CF6]">Our Projects</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Built in the<br/>Open<span className="text-[#8B5CF6]">.</span>
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Six active open source projects powering the HarchOS ecosystem. Every repository is maintained by our core team with community contributions welcome.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => {
              return (
                <FadeIn key={project.name} delay={i * 0.08}>
                  {project.comingSoon ? (
                    <div className="block card p-8 h-full group">
                      <div className="flex items-center gap-3 mb-4">
                        <Github size={20} className="text-[#8B5CF6]" />
                        <h3 className="text-lg font-bold text-white">{project.name}</h3>
                        <span className="ml-auto px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/20">Coming Soon</span>
                      </div>
                      <p className="text-[14px] text-[#999999] leading-[1.7] mb-6">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.languageColor }} />
                            <span className="text-[11px] text-[#999999] font-[family-name:var(--font-space-mono)]">{project.language}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">{project.license}</span>
                      </div>
                    </div>
                  ) : (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="block card p-8 h-full group cursor-pointer hover:border-[#8B5CF6]/30 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <Github size={20} className="text-[#8B5CF6]" />
                        <h3 className="text-lg font-bold text-white group-hover:text-[#8B5CF6] transition-colors">{project.name}</h3>
                        <ExternalLink size={14} className="text-[#666666] group-hover:text-[#8B5CF6] transition-colors ml-auto" />
                      </div>
                      <p className="text-[14px] text-[#999999] leading-[1.7] mb-6">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.languageColor }} />
                            <span className="text-[11px] text-[#999999] font-[family-name:var(--font-space-mono)]">{project.language}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#999999]">
                            <Star size={13} />
                            <span className="text-[11px] stat-mono">{project.defaultStars.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#666666]">
                            <GitFork size={13} />
                            <span className="text-[11px] stat-mono">{project.defaultForks.toLocaleString()}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">{project.license}</span>
                      </div>
                    </a>
                  )}
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CONTRIBUTING GUIDELINES
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B5CF6]">Contributing</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              How to<br/>Contribute<span className="text-[#8B5CF6]">.</span>
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              We welcome contributions from developers of all experience levels. Every pull request is reviewed, every issue is triaged, and every contributor is valued.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contributingSteps.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${step.color}12` }}>
                      <step.icon size={22} style={{ color: step.color }} />
                    </div>
                    <span className="text-[11px] font-bold font-[family-name:var(--font-space-mono)] text-[#666666]">STEP {step.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Additional Guidelines */}
          <FadeIn>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen size={18} className="text-[#8B5CF6]" />
                  <h4 className="text-[14px] font-bold text-white">Code of Conduct</h4>
                </div>
                <p className="text-[13px] text-[#999999] leading-[1.7]">
                  We follow the Contributor Covenant Code of Conduct. Harassment, discrimination, and toxic behavior are not tolerated. Be respectful, be constructive, be inclusive.
                </p>
              </div>
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Scale size={18} className="text-[#8B5CF6]" />
                  <h4 className="text-[14px] font-bold text-white">CLA Agreement</h4>
                </div>
                <p className="text-[13px] text-[#999999] leading-[1.7]">
                  All contributions require a Contributor License Agreement. This protects both contributors and users by ensuring code can be distributed under the Apache 2.0 license.
                </p>
              </div>
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Code2 size={18} className="text-[#8B5CF6]" />
                  <h4 className="text-[14px] font-bold text-white">Style Guide</h4>
                </div>
                <p className="text-[13px] text-[#999999] leading-[1.7]">
                  Each repository includes a style guide and linter configuration. Run <code className="px-1 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[#8B5CF6] text-[11px] font-[family-name:var(--font-space-mono)]">make lint</code> before submitting PRs. Automated CI checks enforce consistency.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COMMUNITY VALUES
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B5CF6]">Community Values</p>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.02em] leading-[1.05] mb-4">
              Our Principles<span className="text-[#8B5CF6]">.</span>
            </h2>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-16">
              Sovereign infrastructure cannot be built behind closed doors. Our open source philosophy is a commitment, not a marketing strategy.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {communityValues.map((value, i) => (
              <FadeIn key={value.title} delay={i * 0.1}>
                <div className="card p-8 h-full">
                  <div className="w-12 h-12 rounded-lg bg-[rgba(139,92,246,0.08)] flex items-center justify-center mb-6">
                    <value.icon size={22} className="text-[#8B5CF6]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                  <div className="accent-line mb-4" />
                  <p className="text-[14px] text-[#999999] leading-[1.7]">{value.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          GITHUB CTA
          ═══════════════════════════════════════════ */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B5CF6]/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-[900px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <p className="section-label mb-6 text-[#8B5CF6]">Get Involved</p>
            <h2 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Star. Fork.<br/>Contribute<span className="text-[#8B5CF6]">.</span>
            </h2>
            <p className="text-[16px] text-[#999999] max-w-lg mx-auto leading-[1.7] mb-10">
              Join 5,000+ developers building the future of sovereign AI infrastructure. Every contribution makes a difference.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/developers" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all">
                <Github size={16} /> Coming Soon to GitHub
              </Link>
              <Link href="/developers" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                <ArrowLeft size={14} /> Developer Center
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
