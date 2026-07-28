'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ManifestoClient() {
  const t = useTranslations('manifesto');
  return (
    <div className="bg-neutral-950 text-white min-h-screen">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950" />
        <div className="relative z-10 max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-4 py-1.5"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/80">{t('badge')}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
          >
            {t('headline')}<br />
            <span className="text-emerald-400">{t('headlineHighlight')}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-8 max-w-2xl text-lg text-neutral-300"
          >
            {t('description')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex justify-center gap-4"
          >
            <Link href="/" className="inline-flex items-center gap-2 bg-emerald-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-emerald-400">
              {t('backToHarch')} <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
