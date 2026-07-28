'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Clock, Mail, Rss, PenLine, Code2, Brain, Building2, Zap, Wheat, Cpu, Landmark, Leaf, TrendingUp, Globe2, Users } from 'lucide-react';
import { blogArticles } from '@/data/blog-articles';
import { seoArticles } from '@/data/seo-articles';

import { FadeIn, StaggerContainer, StaggerItem, CountUp, SectionDivider } from '@/components/ui/motion';
import { VideoPlayer } from '@/components/VideoPlayer';

type Category = 'All' | 'Engineering' | 'AI & ML' | 'Infrastructure' | 'Energy' | 'Agriculture' | 'Company' | 'Finance' | 'Industry' | 'Technology' | 'Mining';

const categories: Category[] = ['All', 'Engineering', 'AI & ML', 'Infrastructure', 'Energy', 'Agriculture', 'Industry', 'Mining', 'Technology', 'Finance', 'Company'];

const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  Engineering: Code2,
  'AI & ML': Brain,
  Infrastructure: Building2,
  Energy: Zap,
  Agriculture: Wheat,
  Industry: Building2,
  Mining: Landmark,
  Technology: Cpu,
  Company: Cpu,
  Finance: Landmark,
};

interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  category: Category;
  readTime: string;
  slug: string;
  featured?: boolean;
  image: string;
  imageAlt?: string;
  author: string;
}

const allBlogData = [...blogArticles, ...seoArticles];

// Derive blog posts from the centralized data source
const blogPosts: BlogPost[] = allBlogData.map((a, i) => ({
  title: a.title,
  excerpt: a.excerpt,
  date: a.date,
  category: a.category as Category,
  readTime: a.readTime,
  slug: a.slug,
  featured: i < 3,
  image: a.image,
  imageAlt: a.imageAlt,
  author: a.author || 'Harch Corp Editorial',
}));

// Thematic category showcase — six pillars of Harch Corp coverage
const categoryShowcase: Array<{
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  desc: string;
  count: number;
  accent: string;
}> = [
  { name: 'Energy', icon: Zap, desc: 'Solar B2B, green hydrogen, Loi 82-21 and the 4.4 GW pipeline reshaping Morocco\'s grid.', count: 14, accent: '#4A7B5F' },
  { name: 'AI & Intelligence', icon: Brain, desc: 'HarchOS, sovereign compute, and the SENSE-THINK-ACT pipeline for African markets.', count: 11, accent: '#8B9DAF' },
  { name: 'Mining', icon: Landmark, desc: 'Cobalt, phosphate, rare earths — building African mineral sovereignty beyond extraction.', count: 8, accent: '#A87878' },
  { name: 'Agriculture', icon: Wheat, desc: 'Smart farming, Dakhla aquaculture, argan value chains and the $35B food import gap.', count: 9, accent: '#6BAF6B' },
  { name: 'Finance', icon: TrendingUp, desc: 'MRE diaspora flows of 122 Mds MAD, blended capital and Series A trajectory.', count: 7, accent: '#C4964A' },
  { name: 'Sustainability', icon: Leaf, desc: 'Carbon-aware scheduling, PUE < 1.15, and the path to net-positive infrastructure.', count: 6, accent: '#6888A8' },
];

const heroStats = [
  { label: 'Articles Published', value: 40, suffix: '+', icon: PenLine },
  { label: 'Countries Covered', value: 5, suffix: '', icon: Globe2 },
  { label: 'Monthly Readers', value: 14, suffix: 'K', icon: Users },
  { label: 'Contributors', value: 18, suffix: '', icon: Code2 },
];

export default function BlogPageClient() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const filteredPosts = activeCategory === 'All'
    ? blogPosts
    : blogPosts.filter(p => p.category === activeCategory);

  // Top three featured posts (always shown when category is All)
  const featuredPosts = blogPosts.filter(p => p.featured).slice(0, 3);
  const recentPosts = filteredPosts
    .filter(p => !p.featured || activeCategory !== 'All')
    .slice(0, 9);

  return (
    <div className="bg-[#0D0D0D]">

      {/* ═══ HERO ═══ */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4 text-[#8B9DAF]">Harch Corp Blog</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Insights on Africa&apos;s<br/>Industrial Sovereignty
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              Deep technical writing, strategic analysis, and operational learnings from the teams building Morocco and Africa&apos;s sovereign industrial infrastructure. No marketing fluff — just signal on energy, intelligence, mining, agriculture, and the capital that funds them.
            </p>
          </FadeIn>

          {/* Hero stats strip */}
          <FadeIn delay={0.15}>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
              {heroStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
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
        </div>
      </section>

      {/* ═══ CATEGORY FILTER ═══ */}
      <section className="py-8 bg-[#121212] border-y border-[rgba(255,255,255,0.04)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold tracking-[0.08em] uppercase transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-white text-black'
                    : 'bg-[rgba(255,255,255,0.04)] text-[#999999] hover:bg-[rgba(255,255,255,0.08)] hover:text-white border border-[rgba(255,255,255,0.06)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED POSTS — Three flagship articles ═══ */}
      {activeCategory === 'All' && featuredPosts.length > 0 && (
        <section className="py-20 md:py-28 bg-[#121212]">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <FadeIn>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="section-label mb-3 text-[#8B9DAF]">Featured</p>
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em]">
                    Flagship Analysis
                  </h2>
                </div>
                <span className="hidden md:inline-flex items-center gap-2 text-[11px] font-[family-name:var(--font-space-mono)] text-[#666666]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B9DAF]" />
                  Editor&apos;s picks
                </span>
              </div>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.08}>
              {featuredPosts.map((post, i) => {
                const Icon = categoryIcons[post.category];
                const isLead = i === 0;
                return (
                  <StaggerItem key={post.slug} className={isLead ? 'md:row-span-2' : ''}>
                    <Link href={`/blog/${post.slug}`} className="block bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden h-full flex flex-col group cursor-pointer hover:border-white/[0.12] transition-colors">
                      <div className="relative w-full aspect-video overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.imageAlt || post.title}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/80 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[rgba(13,13,13,0.85)] backdrop-blur-sm border border-[rgba(139,157,175,0.2)] text-[9px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">
                            {Icon ? <Icon size={10} /> : null}
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 md:p-7 flex flex-col flex-1">
                        <h3 className={`font-bold text-white group-hover:text-[#CCCCCC] transition-colors mb-3 leading-snug ${isLead ? 'text-xl md:text-2xl' : 'text-[16px] md:text-[17px]'}`}>
                          {post.title}
                        </h3>
                        <p className="text-[13px] text-[#999999] leading-relaxed mb-5 line-clamp-3">{post.excerpt}</p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[rgba(255,255,255,0.04)]">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[rgba(139,157,175,0.12)] border border-[rgba(139,157,175,0.2)] flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-bold text-[#8B9DAF]">{post.author.slice(0, 1)}</span>
                            </div>
                            <span className="text-[10px] text-[#999999] truncate max-w-[120px]">{post.author}</span>
                          </div>
                          <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)] flex items-center gap-1">
                            <Clock size={9} />{post.readTime}
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

      {/* ═══ RECENT POSTS GRID ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="section-label mb-3">Recent Posts</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em]">
                  {activeCategory === 'All' ? 'Latest Dispatches' : `${activeCategory}`}
                </h2>
              </div>
              <span className="hidden md:inline-flex items-center gap-2 text-[11px] font-[family-name:var(--font-space-mono)] text-[#666666]">
                <Calendar size={12} />
                {recentPosts.length} articles
              </span>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post, i) => {
              const Icon = categoryIcons[post.category];
              return (
                <FadeIn key={post.slug} delay={(i % 3) * 0.06}>
                  <Link href={`/blog/${post.slug}`} className="block bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden h-full flex flex-col group cursor-pointer hover:border-white/[0.12] transition-colors">
                    {/* Thumbnail */}
                    {post.image && (
                      <div className="relative w-full aspect-video overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.imageAlt || post.title}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[rgba(139,157,175,0.06)] border border-[rgba(139,157,175,0.1)] text-[9px] font-bold tracking-[0.12em] uppercase text-[#8B9DAF]">
                          {Icon ? <Icon size={10} /> : null}
                          {post.category}
                        </span>
                        <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)]">{post.readTime}</span>
                      </div>
                      <h3 className="text-[16px] md:text-[18px] font-bold text-white group-hover:text-[#CCCCCC] transition-colors mb-3 leading-snug flex-1">
                        {post.title}
                      </h3>
                      <p className="text-[13px] text-[#999999] leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[rgba(255,255,255,0.04)]">
                        <span className="text-[10px] text-[#666666] font-[family-name:var(--font-space-mono)] flex items-center gap-1">
                          <Calendar size={9} />{post.date}
                        </span>
                        <ArrowRight size={14} className="text-[rgba(255,255,255,0.15)] group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <SectionDivider className="max-w-[1400px] mx-auto" />

      {/* ═══ CATEGORIES SHOWCASE ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-3 text-[#8B9DAF]">Categories</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-4">
              Six Pillars of Coverage
            </h2>
            <p className="max-w-2xl text-[15px] text-[#999999] leading-[1.7] mb-12">
              Every article maps to one of the verticals Harch Corp operates across. Browse by theme to follow the build-out of sovereign industrial infrastructure — from solar kilowatts to sovereign compute.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.07}>
            {categoryShowcase.map((cat) => {
              const Icon = cat.icon;
              return (
                <StaggerItem key={cat.name}>
                  <button
                    onClick={() => {
                      const mapped = cat.name === 'AI & Intelligence' ? 'AI & ML' : (cat.name === 'Sustainability' ? 'Technology' : (cat.name === 'Energy' ? 'Energy' : cat.name));
                      setActiveCategory(mapped as Category);
                      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full text-left bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 md:p-7 h-full group hover:border-white/[0.12] hover:bg-white/[0.03] transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: `${cat.accent}1a`, border: `1px solid ${cat.accent}33` }}>
                        <span style={{ color: cat.accent, display: 'inline-flex' }}><Icon size={18} strokeWidth={1.5} /></span>
                      </div>
                      <span className="text-[11px] font-[family-name:var(--font-space-mono)] text-[#666666]">
                        {cat.count} posts
                      </span>
                    </div>
                    <h3 className="text-[16px] font-bold text-white mb-2 group-hover:text-[#CCCCCC] transition-colors">{cat.name}</h3>
                    <p className="text-[13px] text-[#999999] leading-relaxed mb-4">{cat.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">
                      Browse {cat.name}
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ ABOUT HARCH CORP — Brand Film ═══ */}
      <section className="py-20 md:py-28 bg-[#121212] border-t border-[rgba(255,255,255,0.04)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 p-6 md:p-8 bg-[#0D0D0D] border border-[rgba(139,157,175,0.18)] rounded-lg">
              <div className="w-full md:w-80 h-44 shrink-0">
                <VideoPlayer
                  src="/videos/v1_brand.mp4"
                  variant="modal-trigger"
                  label="Watch: Harch Corp Brand Film"
                  className="w-full h-full"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2">About Harch Corp</p>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">Building Africa&apos;s Industrial Backbone</h3>
                <p className="text-[15px] text-[#999999] leading-[1.7] mb-4">
                  Harch Corp is a Casablanca-headquartered sovereign infrastructure company. Founded 2024
                  with a 100-year vision — vertically integrated industrial backbone, owned and operated by
                  Africans. Watch the brand film to understand the trajectory behind every article on this blog.
                </p>
                <Link href="/about" className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#8B9DAF] hover:text-white transition-colors">
                  Read the full story <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ NEWSLETTER SIGNUP ═══ */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="max-w-2xl mx-auto text-center">
            <FadeIn>
              <Mail size={32} className="text-[#8B9DAF] mx-auto mb-6" strokeWidth={1.5} />
              <p className="section-label mb-4 text-[#8B9DAF]">Newsletter</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.01em] mb-4">Stay in the Loop</h2>
              <p className="text-[15px] text-[#999999] leading-[1.7] mb-8">
                Get engineering insights, strategic analysis, and dispatches from Morocco&apos;s industrial build-out delivered to your inbox. Roughly one email per week. No spam. Unsubscribe anytime.
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              {subscribed ? (
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-6 text-center">
                  <p className="text-white font-semibold">You&apos;re subscribed.</p>
                  <p className="text-[13px] text-[#999999] mt-1">Look for our next dispatch in your inbox.</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="flex-1 px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-white text-[14px] placeholder-[#666666] focus:outline-none focus:border-[rgba(139,157,175,0.3)] transition-colors font-[family-name:var(--font-space-mono)]"
                  />
                  <button
                    onClick={() => { if (email) setSubscribed(true); }}
                    className="px-6 py-3 rounded-lg bg-white text-black text-[12px] font-bold tracking-[0.06em] uppercase hover:bg-[#CCCCCC] transition-colors shrink-0"
                  >
                    Subscribe
                  </button>
                </div>
              )}
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ CTA: Write for Us / RSS ═══ */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-8 md:p-10 h-full group cursor-pointer hover:border-white/[0.12] transition-colors">
                <PenLine size={20} className="text-[#8B9DAF] mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-white mb-3">Write for Us</h3>
                <p className="text-[14px] text-[#999999] leading-relaxed mb-6">
                  Have a technical perspective on sovereign infrastructure, distributed systems, or African industrial development? We accept guest contributions from engineers, researchers, and operators building on the continent.
                </p>
                <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">
                  Submit a Pitch <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-8 md:p-10 h-full group cursor-pointer hover:border-white/[0.12] transition-colors">
                <Rss size={20} className="text-[#8B9DAF] mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-white mb-3">RSS Feed</h3>
                <p className="text-[14px] text-[#999999] leading-relaxed mb-6">
                  Prefer a reader? Subscribe to our RSS feed and never miss a post. Full content, no tracking, no middleman — the way the web was meant to work.
                </p>
                <a href="/feed.xml" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B9DAF] group-hover:text-white transition-colors">
                  Copy Feed URL <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
