'use client';

import { motion } from 'framer-motion';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  version?: string;
  backgroundImage?: string;
}

export function PageHero({ title, subtitle, version }: PageHeroProps) {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a2a3a] via-[#0D0D0D] to-[#0D0D0D]">
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #8B9DAF, transparent)' }} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20"
      >
        {version && (
          <span className="version-tag mb-4 block">{version}</span>
        )}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-sm text-[rgba(255,255,255,0.5)] max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        <div className="mt-6 w-16 h-0.5 bg-white mx-auto" />
      </motion.div>
    </section>
  );
}
