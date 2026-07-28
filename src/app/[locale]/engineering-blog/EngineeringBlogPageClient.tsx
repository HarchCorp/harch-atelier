'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Terminal, Server, Brain, Shield, GitBranch, Network, Rss, Users, Cpu, Code2, Lock, Activity, Wind, Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FadeIn, StaggerContainer, StaggerItem, CountUp, SectionDivider } from '@/components/ui/motion';

type EngCategory = 'All' | 'Backend' | 'Infrastructure' | 'AI/ML' | 'DevOps' | 'Security';

interface EngPost {
  title: string;
  excerpt: string;
  date: string;
  category: EngCategory;
  readTime: string;
  slug: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  featured?: boolean;
  image: string;
  author?: string;
}

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.15)] text-[#22C55E]',
  Intermediate: 'bg-[rgba(234,179,8,0.08)] border-[rgba(234,179,8,0.15)] text-[#EAB308]',
  Advanced: 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.15)] text-[#EF4444]',
};

export default function EngineeringBlogPageClient() {
  const t = useTranslations('engineeringBlog');

  const engCategories: EngCategory[] = ['All', 'Backend', 'Infrastructure', 'AI/ML', 'DevOps', 'Security'];

  const catKeyMap: Record<string, string> = {
    'All': 'all',
    'Backend': 'backend',
    'Infrastructure': 'infrastructure',
    'AI/ML': 'aiMl',
    'DevOps': 'devOps',
    'Security': 'security',
  };

  const diffKeyMap: Record<string, string> = {
    'Beginner': 'beginner',
    'Intermediate': 'intermediate',
    'Advanced': 'advanced',
  };

  const engCategoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
    Backend: Server,
    Infrastructure: Network,
    'AI/ML': Brain,
    DevOps: GitBranch,
    Security: Shield,
  };

  // Engineering posts — six localized posts plus three flagship deep-dives
  // published in English (translated editions ship on the next content cycle).
  const engPosts: EngPost[] = [
    {
      title: t('posts.insideHarchos.title'),
      excerpt: t('posts.insideHarchos.excerpt'),
      date: t('posts.insideHarchos.date'),
      category: 'Infrastructure',
      readTime: t('posts.insideHarchos.readTime'),
      slug: 'inside-harchos-distributed-ai-operating-system',
      difficulty: 'Advanced',
      featured: true,
      image: '/images/intelligence/harchos-dashboard.png',
      author: 'Core Platform Team',
    },
    {
      title: 'How We Achieve PUE < 1.15: The Physics and Economics of Efficient Compute',
      excerpt: 'A Power Usage Effectiveness below 1.15 is not achieved by accident. We break down the mechanical, electrical and software decisions that let our Dakhla campus hit 1.12 annualized — and why every hundredth of a point translates directly into competitive advantage.',
      date: 'March 2026',
      category: 'Infrastructure',
      readTime: '18 min read',
      slug: 'how-we-achieve-pue-below-1-15',
      difficulty: 'Advanced',
      featured: true,
      image: '/images/intelligence/harchos-facility-night.png',
      author: 'Facilities Engineering',
    },
    {
      title: 'Carbon-Aware Scheduler Architecture: Routing Compute to the Greenest Grid',
      excerpt: 'Our carbon-aware scheduler ingests real-time grid intensity data every 30 seconds and routes workloads to whichever GPU hub runs cleanest. This deep-dive covers the data pipeline, the optimization model, and the 62% carbon intensity reduction we measured in production.',
      date: 'February 2026',
      category: 'Backend',
      readTime: '21 min read',
      slug: 'carbon-aware-scheduler-architecture',
      difficulty: 'Advanced',
      featured: true,
      image: '/images/sections/energy-solar-farm.jpg',
      author: 'Sustainability Engineering',
    },
    {
      title: t('posts.designingSenseLayer.title'),
      excerpt: t('posts.designingSenseLayer.excerpt'),
      date: t('posts.designingSenseLayer.date'),
      category: 'Backend',
      readTime: t('posts.designingSenseLayer.readTime'),
      slug: 'designing-sense-layer-real-time-ingestion',
      difficulty: 'Advanced',
      image: '/images/intelligence/harchos-ops-center.png',
      author: 'Streaming Platform Team',
    },
    {
      title: t('posts.gpuScheduling.title'),
      excerpt: t('posts.gpuScheduling.excerpt'),
      date: t('posts.gpuScheduling.date'),
      category: 'AI/ML',
      readTime: t('posts.gpuScheduling.readTime'),
      slug: 'gpu-scheduling-algorithm-throughput-fairness',
      difficulty: 'Advanced',
      image: '/images/intelligence/harchos-gpu-cluster.png',
      author: 'ML Infrastructure Team',
    },
    {
      title: 'HarchOS Technical Deep-Dive: The SENSE-THINK-ACT Pipeline',
      excerpt: 'A full architectural tour of the three-stage inference pipeline at the heart of HarchOS. How SENSE ingests, THINK reasons, and ACT automates — and why decomposing inference into independently scaling stages transformed our reliability posture.',
      date: 'January 2026',
      category: 'AI/ML',
      readTime: '17 min read',
      slug: 'harchos-sense-think-act-pipeline-deep-dive',
      difficulty: 'Advanced',
      image: '/images/intelligence/harchos-architecture.png',
      author: 'Core Platform Team',
    },
    {
      title: t('posts.zeroTrust.title'),
      excerpt: t('posts.zeroTrust.excerpt'),
      date: t('posts.zeroTrust.date'),
      category: 'Security',
      readTime: t('posts.zeroTrust.readTime'),
      slug: 'zero-trust-networking-multi-tenant-ai',
      difficulty: 'Intermediate',
      image: '/images/sections/tech-cyber.jpg',
      author: 'Security Engineering',
    },
    {
      title: t('posts.terraformToProduction.title'),
      excerpt: t('posts.terraformToProduction.excerpt'),
      date: t('posts.terraformToProduction.date'),
      category: 'DevOps',
      readTime: t('posts.terraformToProduction.readTime'),
      slug: 'terraform-to-production-iac-journey',
      difficulty: 'Intermediate',
      image: '/images/intelligence/harchos-tanger.png',
      author: 'Platform Reliability Team',
    },
    {
      title: t('posts.latencyOptimization.title'),
      excerpt: t('posts.latencyOptimization.excerpt'),
      date: t('posts.latencyOptimization.date'),
      category: 'Infrastructure',
      readTime: t('posts.latencyOptimization.readTime'),
      slug: 'latency-optimization-sub-12ms-inference-africa',
      difficulty: 'Advanced',
      image: '/images/sections/intelligence-cable.jpg',
      author: 'Edge & Network Team',
    },
  ];

  const openSourceRepos = [
    { name: 'harchos-scheduler', desc: t('openSourceRepos.harchosScheduler.desc'), stars: '1,200', lang: 'Rust' },
    { name: 'sense-ingest', desc: t('openSourceRepos.senseIngest.desc'), stars: '890', lang: 'Rust' },
    { name: 'act-sdk', desc: t('openSourceRepos.actSdk.desc'), stars: '650', lang: 'TypeScript' },
  ];

  // Engineering topics — the technical domains we publish on
  const engTopics: Array<{
    name: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    desc: string;
    posts: number;
    accent: string;
  }> = [
    { name: 'Carbon-Aware Scheduling', icon: Wind, desc: 'Routing compute to the cleanest grid in real time — grid-intensity data pipelines, workload deferral and the economics of green compute.', posts: 4, accent: '#4A7B5F' },
    { name: 'GPU Optimization', icon: Cpu, desc: 'Topology-aware placement, weighted fair queuing, speculative decoding and the math of 94% fleet utilization.', posts: 5, accent: '#8B9DAF' },
    { name: 'Sovereign Security', icon: Shield, desc: 'Zero-trust networking, SPIFFE identity, eBPF firewalls and runtime threat detection on shared GPU hardware.', posts: 3, accent: '#A87878' },
    { name: 'MLOps', icon: GitBranch, desc: 'Model lifecycle, continuous training, drift detection and the deployment pipelines that ship inference to production.', posts: 4, accent: '#6888A8' },
    { name: 'Data Center Design', icon: Server, desc: 'Mechanical, electrical and plumbing decisions — PUE below 1.15, liquid cooling, and the physics of efficient compute.', posts: 3, accent: '#C4964A' },
    { name: 'Distributed Systems', icon: Network, desc: 'Federated scheduling, gossip protocols, consensus across five hubs and the failure modes that taught us everything.', posts: 6, accent: '#6BAF6B' },
  ];

  // Engineering culture principles
  const culturePrinciples: Array<{
    title: string;
    desc: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  }> = [
    { title: 'Write It Down', desc: 'Every architecture decision, every incident, every trade-off gets documented. Institutional memory beats heroic individual knowledge.', icon: Code2 },
    { title: 'Own the Outcome', desc: 'Engineers own features from design to production to on-call. No throwing code over the wall — you ship it, you run it.', icon: Activity },
    { title: 'Sovereign by Default', desc: 'No telemetry leaves the perimeter. No third-party SaaS for core systems. We build our own observability because operational intelligence is strategic.', icon: Lock },
    { title: 'Merit Over Hierarchy', desc: 'The best argument wins, not the highest title. Engineers challenge founders in code review. Ego is the enemy of good architecture.', icon: Heart },
  ];

  const cultureStats = [
    { label: 'Engineers', value: 64, suffix: '', icon: Users },
    { label: 'Open Repos', value: 9, suffix: '', icon: GitBranch },
    { label: 'Hubs', value: 5, suffix: '', icon: Server },
    { label: 'GPUs Operated', value: 1798, suffix: '', icon: Cpu },
  ];

  const [activeCategory, setActiveCategory] = useState<EngCategory>('All');

  const filteredPosts = activeCategory === 'All'
    ? engPosts
    : engPosts.filter(p => p.category === activeCategory);

  const featuredPosts = engPosts.filter(p => p.featured).slice(0, 3);
  const gridPosts = filteredPosts
    .filter(p => !p.featured || activeCategory !== 'All')
    .slice(0, 6);

  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('title')}</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              {t('heroTitle')}
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              {t('heroDescription')}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex items-center gap-4 mt-8">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
                <Terminal size={14} className="text-[#8B9DAF]" />
                <span className="text-[11px] font-[family-name:var(--font-space-mono)] text-[#999999]">{t('articlesCount')}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
                <Activity size={14} className="text-[#8B9DAF]" />
                <span className="text-[11px] font-[family-name:var(--font-space-mono)] text-[#999999]">{t('updatedWeekly')}</span>
              </div>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
                <Code2 size={14} className="text-[#8B9DAF]" />
                <span className="text-[11px] font-[family-name:var(--font-space-mono)] text-[#999999]">Open Source</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ CATEGORY FILTER ═══ */}
      <section className="py-8 bg-[#121212] border-y border-[rgba(255,255,255,0.04)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-wrap items-center gap-2">
            {engCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold tracking-[0.08em] uppercase transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-white text-black'
                    : 'bg-[rgba(255,255,255,0.04)] text-[#999999] hover:bg-[rgba(255,255,255,0.08)] hover:text-white border border-[rgba(255,255,255,0.06)]'
                }`}
              >
                {t(`categories.${catKeyMap[cat]}`)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED TECHNICAL POSTS — three flagship deep-dives ═══ */}
      {activeCategory === 'All' && featuredPosts.length > 0 && (
        <section className="py-20 md:py-28 bg-[#121212]">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <FadeIn>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="section-label mb-3 text-[#8B9DAF]">{t('featuredTechnicalDeepDive')}</p>
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em]">Flagship Engineering Posts</h2>
                </div>
                <span className="hidden md:inline-flex items-center gap-2 text-[11px] font-[family-name:var(--font-space-mono)] text-[#666666]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B9DAF]" />
                  Start here
                </span>
              </div>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.08}>
              {featuredPosts.map((post, i) => {
                const Icon = engCategoryIcons[post.category];
                const isLead = i === 0;
                return (
                  <StaggerItem key={post.slug} className={isLead ? 'md:row-span-2' : ''}>
                    <Link href={`/engineering-blog/${post.slug}`} className="block bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden h-full flex flex-col group cursor-pointer hover:border-white/[0.12] transition-colors">
                      <div className="relative w-full aspect-video overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/85 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgba(13,13,13,0.85)] backdrop-blur-sm border border-[rgba(139,157,175,0.2)] text-[9px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">
                            {Icon ? <Icon size={10} /> : null}
                            {t(`categories.${catKeyMap[post.category]}`)}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[8px] font-bold tracking-[0.08em] uppercase backdrop-blur-sm bg-[rgba(13,13,13,0.85)] ${difficultyColors[post.difficulty]}`}>
                            {t(`difficulties.${diffKeyMap[post.difficulty]}`)}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 md:p-7 flex flex-col flex-1">
                        <h3 className={`font-bold text-white group-hover:text-[#CCCCCC] transition-colors mb-3 leading-snug ${isLead ? 'text-xl md:text-2xl' : 'text-[15px] md:text-[16px]'}`}>
                          {post.title}
                        </h3>
                        <p className="text-[13px] text-[#999999] leading-relaxed mb-5 line-clamp-3">{post.excerpt}</p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[rgba(255,255,255,0.04)]">
                          <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)] flex items-center gap-1">
                            <Clock size={9} />{post.readTime}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">
                            {t('readTechnicalDeepDive')} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ═══ RECENT ENGINEERING POSTS GRID ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="section-label mb-3">{t('allTechnicalPosts')}</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em]">
                  {activeCategory === 'All' ? t('engineeringArchive') : t(`categories.${catKeyMap[activeCategory]}`)}
                </h2>
              </div>
              <span className="hidden md:inline-flex items-center gap-2 text-[11px] font-[family-name:var(--font-space-mono)] text-[#666666]">
                <Terminal size={12} />
                {gridPosts.length} posts
              </span>
            </div>
          </FadeIn>

          <div className="space-y-2">
            {gridPosts.map((post, i) => {
              const Icon = engCategoryIcons[post.category];
              return (
                <FadeIn key={post.slug} delay={i * 0.04}>
                  <Link href={`/engineering-blog/${post.slug}`} className="block vertical-row group p-6 md:p-8 cursor-pointer">
                    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                      {/* Thumbnail */}
                      {post.image && (
                        <div className="relative w-full md:w-48 lg:w-56 shrink-0 aspect-video rounded-lg overflow-hidden border border-[rgba(255,255,255,0.06)]">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 224px"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[rgba(139,157,175,0.06)] border border-[rgba(139,157,175,0.1)] text-[9px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">
                            {Icon ? <Icon size={10} /> : null}
                            {t(`categories.${catKeyMap[post.category]}`)}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded-md border text-[8px] font-bold tracking-[0.08em] uppercase ${difficultyColors[post.difficulty]}`}>{t(`difficulties.${diffKeyMap[post.difficulty]}`)}</span>
                          <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">{post.readTime}</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-[#CCCCCC] transition-colors mt-1 leading-snug">{post.title}</h3>
                        <p className="text-[14px] text-[#999999] leading-relaxed mt-2 line-clamp-2">{post.excerpt}</p>
                      </div>
                      <ArrowRight size={16} className="vertical-arrow text-[rgba(255,255,255,0.1)] group-hover:text-white transition-all shrink-0 mt-2 md:mt-8" />
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider className="max-w-[1400px] mx-auto" />

      {/* ═══ TOPICS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-3 text-[#8B9DAF]">Topics</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-4">
              Engineering Domains
            </h2>
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              The technical territories our engineers publish on. From carbon-aware scheduling to sovereign security, each topic collects the architecture decisions and war stories that shaped how HarchOS actually runs in production.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.07}>
            {engTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <StaggerItem key={topic.name}>
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 md:p-7 h-full group hover:border-white/[0.12] hover:bg-white/[0.03] transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: `${topic.accent}1a`, border: `1px solid ${topic.accent}33` }}>
                        <span style={{ color: topic.accent, display: 'inline-flex' }}><Icon size={18} strokeWidth={1.5} /></span>
                      </div>
                      <span className="text-[11px] font-[family-name:var(--font-space-mono)] text-[#666666]">
                        {topic.posts} posts
                      </span>
                    </div>
                    <h3 className="text-[16px] font-bold text-white mb-2 group-hover:text-[#CCCCCC] transition-colors">{topic.name}</h3>
                    <p className="text-[13px] text-[#999999] leading-relaxed">{topic.desc}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ OPEN SOURCE CONTRIBUTIONS ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">{t('openSource')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-6">{t('builtInTheOpen')}</h2>
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              {t('openSourceDescription')}
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {openSourceRepos.map((repo, i) => (
              <FadeIn key={repo.name} delay={i * 0.08}>
                <Link href="/developers/open-source" className="block">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 h-full group hover:border-white/[0.12] transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <GitBranch size={14} className="text-[#8B9DAF]" strokeWidth={1.5} />
                        <span className="text-[12px] font-[family-name:var(--font-space-mono)] text-[#8B9DAF]">{repo.name}</span>
                      </div>
                      <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">{repo.lang}</span>
                    </div>
                    <p className="text-[13px] text-[#999999] leading-relaxed mb-4">{repo.desc}</p>
                    <div className="flex items-center gap-1 text-[11px] text-[#666666]">
                      <span className="text-[#EAB308]">★</span>
                      <span className="font-[family-name:var(--font-space-mono)]">{repo.stars}</span>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div className="mt-8 text-center">
              <Link href="/developers/open-source" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] hover:text-white transition-colors">
                {t('viewAllOpenSourceProjects')} <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ ENGINEERING CULTURE ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-3 text-[#8B9DAF]">Engineering Culture</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-4">
              How We Build
            </h2>
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              The principles that shape every architecture decision, every code review and every on-call rotation at Harch Intelligence. We operate like an engineering team — discipline, autonomy and accountability. No bureaucracy, no committees, no endless email threads.
            </p>
          </FadeIn>

          {/* Culture stats */}
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mb-12">
              {cultureStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-5">
                    <Icon size={16} className="text-[#8B9DAF] mb-2" strokeWidth={1.5} />
                    <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                      <CountUp to={stat.value} suffix={stat.suffix} duration={1.8} />
                    </p>
                    <p className="text-[10px] text-[#666666] uppercase tracking-[0.1em] mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </FadeIn>

          {/* Principles grid */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.08}>
            {culturePrinciples.map((principle) => {
              const Icon = principle.icon;
              return (
                <StaggerItem key={principle.title}>
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 md:p-7 h-full flex items-start gap-5 hover:border-white/[0.12] transition-colors">
                    <div className="w-11 h-11 rounded-lg bg-[rgba(139,157,175,0.08)] border border-[rgba(139,157,175,0.15)] flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-[#8B9DAF]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-white mb-2">{principle.title}</h3>
                      <p className="text-[13px] text-[#999999] leading-relaxed">{principle.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ CTA: Join Engineering / RSS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-8 md:p-10 h-full group cursor-pointer hover:border-white/[0.12] transition-colors">
                <Users size={20} className="text-[#8B9DAF] mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-white mb-3">{t('joinEngineeringTeam')}</h3>
                <p className="text-[14px] text-[#999999] leading-relaxed mb-6">
                  {t('joinEngineeringDescription')}
                </p>
                <Link href="/careers" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">
                  {t('viewOpenRoles')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-8 md:p-10 h-full group cursor-pointer hover:border-white/[0.12] transition-colors">
                <Rss size={20} className="text-[#8B9DAF] mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-white mb-3">{t('engineeringRssFeed')}</h3>
                <p className="text-[14px] text-[#999999] leading-relaxed mb-6">
                  {t('engineeringRssFeedDescription')}
                </p>
                <a href="/feed.xml" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">
                  {t('copyFeedUrl')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
