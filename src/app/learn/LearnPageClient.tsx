'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Award,
  Monitor,
  Code,
  Server,
  Shield,
  Database,
  GraduationCap,
  Building2,
  Users,
  Play,
  FileCheck,
  Cpu,
  Cloud,
  Clock,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const learningPaths = [
  {
    icon: Cpu,
    title: 'HarchOS Fundamentals',
    level: 'Beginner',
    hours: 20,
    price: 'Free',
    description: 'Get started with HarchOS, the sovereign infrastructure operating system. Learn core concepts, deployment basics, and the HarchOS command-line interface.',
    topics: ['HarchOS Architecture Overview', 'CLI Fundamentals', 'Resource Management', 'Basic Deployments', 'Monitoring & Logging'],
    color: 'rgba(139, 157, 175, 0.7)',
  },
  {
    icon: Server,
    title: 'AI Infrastructure Engineer',
    level: 'Intermediate',
    hours: 40,
    price: '$299',
    description: 'Design and operate GPU clusters, manage AI workloads, and optimize sovereign compute infrastructure on HarchOS at scale.',
    topics: ['GPU Cluster Management', 'AI Workload Orchestration', 'Performance Optimization', 'Network Architecture', 'Storage for AI'],
    color: 'rgba(0, 255, 136, 0.7)',
  },
  {
    icon: Cloud,
    title: 'HarchOS Solutions Architect',
    level: 'Advanced',
    hours: 60,
    price: '$499',
    description: 'Architect multi-vertical solutions spanning AI, energy, and industrial systems. Master complex HarchOS deployments across sovereign regions.',
    topics: ['Multi-Region Architecture', 'Hybrid Cloud Design', 'Sovereign Compliance Patterns', 'Industrial IoT Integration', 'Cost Optimization'],
    color: 'rgba(255, 200, 0, 0.7)',
  },
  {
    icon: Shield,
    title: 'Sovereign Cloud Professional',
    level: 'Expert',
    hours: 80,
    price: '$699',
    description: 'Lead sovereign cloud transformations. Design data residency strategies, implement zero-trust security, and ensure regulatory compliance across African jurisdictions.',
    topics: ['Data Sovereignty Frameworks', 'Zero-Trust Architecture', 'Regulatory Compliance (GDPR, CNDP)', 'Incident Response', 'Sovereign Cloud Migration'],
    color: 'rgba(255, 100, 100, 0.7)',
  },
];

const certifications = [
  {
    icon: Code,
    title: 'HarchOS Certified Developer',
    price: '$199',
    description: 'Prove your ability to build, deploy, and manage applications on HarchOS. Validates proficiency in HarchOS APIs, SDKs, and development patterns.',
    format: 'Online proctored exam',
    duration: '90 minutes',
    prerequisites: 'HarchOS Fundamentals path recommended',
  },
  {
    icon: Cloud,
    title: 'HarchOS Certified Architect',
    price: '$299',
    description: 'Demonstrate expertise in designing scalable, resilient, and sovereign architectures on HarchOS. Validates multi-system design and optimization skills.',
    format: 'Online proctored exam + case study',
    duration: '120 minutes',
    prerequisites: 'Solutions Architect path recommended',
  },
  {
    icon: Shield,
    title: 'HarchOS Certified Security Specialist',
    price: '$299',
    description: 'Validate your expertise in securing HarchOS deployments, implementing zero-trust architectures, and managing sovereign data compliance.',
    format: 'Online proctored exam + practical',
    duration: '150 minutes',
    prerequisites: 'Sovereign Cloud Professional path recommended',
  },
  {
    icon: Database,
    title: 'HarchOS Certified Data Engineer',
    price: '$199',
    description: 'Certify your skills in building data pipelines, managing sovereign data lakes, and implementing real-time analytics on HarchOS infrastructure.',
    format: 'Online proctored exam',
    duration: '90 minutes',
    prerequisites: 'AI Infrastructure Engineer path recommended',
  },
];

const freeResources = [
  {
    icon: BookOpen,
    title: 'Self-Paced Modules',
    description: 'Over 50 free modules covering HarchOS basics, AI infrastructure, and sovereign computing concepts. Learn at your own pace with interactive exercises.',
    count: '50+ modules',
  },
  {
    icon: Monitor,
    title: 'Hands-On Labs',
    description: 'Access real HarchOS environments for hands-on practice. Deploy applications, manage GPU clusters, and configure sovereign infrastructure — no credit card required.',
    count: '20+ labs',
  },
  {
    icon: Play,
    title: 'Video Courses',
    description: 'Expert-led video series covering everything from HarchOS fundamentals to advanced sovereign architecture patterns. New content added monthly.',
    count: '100+ hours',
  },
];

export default function LearnPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Learn</p>
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">
              Master HarchOS &<br />Sovereign AI
            </h1>
            <div className="accent-line mb-6" />
            <p className="max-w-2xl text-[16px] text-[#999999] leading-[1.7]">
              From fundamentals to expert-level certifications, build the skills to design, deploy, and operate Africa&apos;s sovereign infrastructure. Hands-on labs, self-paced modules, and industry-recognized credentials.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-start gap-4 mt-8">
              <Link href="#learning-paths" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Start Learning Free <ArrowRight size={14} />
              </Link>
              <Link href="#certifications" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                View Certifications
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Learning Paths */}
      <section id="learning-paths" className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Learning Paths</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Structured Paths to Mastery
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Follow a guided curriculum from beginner to expert. Each path includes hands-on labs, assessments, and preparation for industry certifications.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningPaths.map((path, i) => (
              <FadeIn key={path.title} delay={i * 0.08}>
                <div className="card p-8 h-full group">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                      <path.icon size={22} style={{ color: path.color }} strokeWidth={1.5} />
                    </div>
                    <span className="px-3 py-1 rounded-md bg-[rgba(255,255,255,0.04)] text-[10px] font-semibold text-[#999999] tracking-wide uppercase">
                      {path.level}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{path.title}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-5">{path.description}</p>
                  <div className="flex items-center gap-4 mb-5 text-[12px]">
                    <span className="flex items-center gap-1.5 text-[#999999]">
                      <Clock size={12} /> {path.hours} hours
                    </span>
                    <span className="flex items-center gap-1.5 text-[#999999]">
                      <DollarSign size={12} /> {path.price}
                    </span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-5">
                    <p className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider mb-3">What you&apos;ll learn</p>
                    <ul className="space-y-2">
                      {path.topics.map((topic) => (
                        <li key={topic} className="flex items-start gap-2 text-[13px] text-[#999999]">
                          <CheckCircle size={12} className="mt-0.5 shrink-0 text-white/30" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section id="certifications" className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Certifications</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Industry-Recognized Credentials
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Validate your expertise with HarchOS certifications recognized across Africa&apos;s technology sector. Prove your skills to employers and clients.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications.map((cert, i) => (
              <FadeIn key={cert.title} delay={i * 0.08}>
                <div className="card p-8 h-full">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full bg-[rgba(255,255,255,0.04)] border border-white/[0.08] flex items-center justify-center shrink-0">
                      <Award size={22} className="text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{cert.title}</h3>
                      <p className="text-[13px] text-[#999999] leading-[1.6]">{cert.description}</p>
                    </div>
                  </div>
                  <div className="border-t border-white/[0.06] pt-5 space-y-3">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#666666]">Exam Price</span>
                      <span className="text-white font-semibold">{cert.price}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#666666]">Format</span>
                      <span className="text-[#999999]">{cert.format}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#666666]">Duration</span>
                      <span className="text-[#999999]">{cert.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#666666]">Prerequisites</span>
                      <span className="text-[#999999]">{cert.prerequisites}</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Free Training Resources */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Free Resources</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Start Learning at No Cost
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Access comprehensive free training materials to build your HarchOS skills. No credit card required — just start learning.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {freeResources.map((resource, i) => (
              <FadeIn key={resource.title} delay={i * 0.1}>
                <div className="card p-8 h-full text-center">
                  <div className="w-14 h-14 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mx-auto mb-5">
                    <resource.icon size={24} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{resource.title}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-4">{resource.description}</p>
                  <span className="inline-block px-4 py-1.5 rounded-full bg-[rgba(255,255,255,0.04)] text-[11px] font-semibold text-white tracking-wide">
                    {resource.count}
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* For Universities */}
      <section className="py-28 md:py-36 bg-[#0D0D0D]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <p className="section-label mb-4">Academic Program</p>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-6">
                For Universities
              </h2>
              <div className="accent-line mb-6" />
              <p className="text-[16px] text-[#999999] leading-[1.7] mb-8">
                Partner with Harch Corp to bring sovereign infrastructure education to your campus. We provide free credits, curriculum support, and direct access to HarchOS infrastructure for teaching and research.
              </p>
              <div className="space-y-5">
                {[
                  { title: 'Free HarchOS Credits', desc: 'Up to $10,000 in compute credits per institution per year for teaching and research.' },
                  { title: 'Curriculum Support', desc: 'Ready-to-use course modules, lab exercises, and teaching materials designed with academic partners.' },
                  { title: 'Research Access', desc: 'Priority access to HarchOS GPU clusters for AI and infrastructure research projects.' },
                  { title: 'Guest Lectures', desc: 'Harch engineers and architects available for guest lectures and industry perspectives.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-white/50 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[14px] font-semibold text-white">{item.title}</p>
                      <p className="text-[13px] text-[#999999] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <GraduationCap size={24} className="text-white" strokeWidth={1.5} />
                  <h3 className="text-lg font-bold text-white">Academic Partnership</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Active University Partners', value: '12' },
                    { label: 'Students Enrolled', value: '2,400+' },
                    { label: 'Countries', value: '5' },
                    { label: 'Free Credits Granted', value: '$480K+' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                      <span className="text-[13px] text-[#999999]">{stat.label}</span>
                      <span className="text-[14px] font-bold text-white stat-mono">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <p className="text-[12px] text-[#666666]">
                    Open to accredited universities and research institutions across Africa and the Middle East.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Corporate Training */}
      <section className="py-28 md:py-36 bg-[#121212]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Enterprise</p>
            <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-[-0.01em] mb-4">
              Corporate Training
            </h2>
            <p className="max-w-xl text-[15px] text-[#999999] leading-relaxed mb-16">
              Upskill your team on HarchOS and sovereign infrastructure. Custom programs designed for enterprise teams migrating to or operating on HarchOS.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'Team Training Packages',
                description: 'Bulk enrollment discounts for teams of 5 or more. Progress tracking dashboards, completion reports, and skill assessments for managers.',
                detail: 'Up to 40% off per seat',
              },
              {
                icon: Building2,
                title: 'Custom Programs',
                description: 'Tailored curricula designed around your organization\'s specific HarchOS deployment, industry vertical, and compliance requirements.',
                detail: 'Dedicated curriculum designer',
              },
              {
                icon: FileCheck,
                title: 'Certification Vouchers',
                description: 'Volume pricing on HarchOS certification exam vouchers. Team-wide certification programs with group study sessions and practice exams.',
                detail: 'Volume discounts available',
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="card p-8 h-full">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
                    <item.icon size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.7] mb-4">{item.description}</p>
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">{item.detail}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 md:py-36 bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-100" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-[52px] font-bold text-white tracking-[-0.01em] mb-6">
              Start Building Your Skills
            </h2>
            <p className="max-w-xl mx-auto text-[15px] text-white/30 leading-relaxed mb-12">
              Join thousands of engineers mastering sovereign infrastructure on HarchOS. Free modules, hands-on labs, and industry certifications — start today.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="#learning-paths" className="inline-flex items-center gap-2.5 bg-white text-black px-8 py-4 rounded-lg text-sm font-semibold border border-white/15 hover:bg-white/90 transition-all">
                Start Learning Free <ArrowRight size={14} />
              </Link>
              <Link href="#certifications" className="inline-flex items-center gap-2.5 border border-white/12 text-white px-8 py-4 rounded-lg text-sm font-semibold hover:border-white/25 hover:bg-white/[0.03] transition-all">
                View Certifications
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
