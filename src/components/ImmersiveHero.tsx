'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ImmersiveHeroProps {
  title: string;
  subtitle: string;
  version: string;
  accent?: string;
  metaLabel?: string;
}

export default function ImmersiveHero({
  title,
  subtitle,
  version,
  accent = '#8B9DAF',
  metaLabel,
}: ImmersiveHeroProps) {
  const t = useTranslations('immersiveHero');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Split title into individual characters for animation
  const titleChars = title.split('');

  return (
    <section
      ref={ref}
      className="relative h-[100dvh] w-full overflow-hidden flex flex-col justify-between"
      style={{ background: '#000000' }}
    >
      {/* Radial gradient at bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(139,157,175,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern opacity-60 pointer-events-none" />

      {/* SVG grid / mesh background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="hero-grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="#8B9DAF"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      {/* Subtle animated network lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <motion.line
          x1="10%"
          y1="20%"
          x2="60%"
          y2="80%"
          stroke="#8B9DAF"
          strokeWidth="0.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 0.08 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 3, delay: 1.2, ease: 'easeOut' }}
        />
        <motion.line
          x1="80%"
          y1="10%"
          x2="30%"
          y2="70%"
          stroke="#8B9DAF"
          strokeWidth="0.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 0.06 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 3.5, delay: 1.5, ease: 'easeOut' }}
        />
        <motion.line
          x1="50%"
          y1="5%"
          x2="50%"
          y2="95%"
          stroke="#8B9DAF"
          strokeWidth="0.2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 0.05 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 4, delay: 1.8, ease: 'easeOut' }}
        />
      </svg>

      {/* Version tag — top-left */}
      <div className="relative z-10 pt-24 md:pt-28 pl-6 md:pl-12">
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-[family-name:var(--font-space-mono)] text-[11px] tracking-[0.04em]"
          style={{ color: `${accent}80` }}
        >
          {version}
        </motion.span>
      </div>

      {/* Center-left content area */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12">
          {/* "YOU ARE NOW ENTERING" line */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 0.25, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-[0.2em] text-white mb-4"
          >
            {t('youAreNowEntering')}
          </motion.p>

          {/* Giant title with letter-by-letter animation */}
          <h1
            className="text-[clamp(3rem,8vw,7rem)] font-extrabold text-white tracking-tight leading-[1.05] mb-6"
            aria-label={title}
          >
            {titleChars.map((char, i) => (
              <motion.span
                key={`${char}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{
                  delay: 0.8 + i * 0.04,
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : undefined }}
                aria-hidden="true"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 0.5, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.8, delay: 0.8 + titleChars.length * 0.04 + 0.2 }}
            className="text-lg text-white/50 mb-8"
          >
            {subtitle}
          </motion.p>

          {/* Accent line — animated width */}
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: 48 } : { width: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.8 + titleChars.length * 0.04 + 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="h-[2px]"
            style={{ backgroundColor: accent }}
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 pb-8 md:pb-10 px-6 md:px-12 flex items-end justify-between">
        {/* Meta info — bottom-left */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="font-[family-name:var(--font-space-mono)] text-[9px] tracking-[0.15em] uppercase text-white/20"
        >
          <span>{metaLabel || t('harchCorp')}</span>
          <span className="mx-2">/</span>
          <span>{t('time3Mins')}</span>
          <span className="mx-2">/</span>
          <span>{t('scrollToExplore')}</span>
        </motion.div>

        {/* Chevron — bottom-right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.25 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="animate-bounce-slow"
        >
          <ChevronDown size={20} className="text-white" strokeWidth={1} />
        </motion.div>
      </div>
    </section>
  );
}
