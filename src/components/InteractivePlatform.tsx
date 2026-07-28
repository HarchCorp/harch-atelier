'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Server,
  Shield,
  Globe,
  Activity,
  Factory,
  Flame,
  Leaf,
  Truck,
  Sun,
  Wind,
  Zap,
  Battery,
  Satellite,
  Lock,
  Wifi,
  Radio,
  Mountain,
  Cpu,
  FlaskConical,
  Ship,
  Map,
  Drone,
  BarChart3,
  FileText,
  MessageCircle,
  Droplets,
  TestTube,
  Waves,
  CloudRain,
  Landmark,
  TrendingUp,
  Banknote,
  FileCheck,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   HARCH OS — Subsidiary-Specific Platform Modules

   Each subsidiary gets UNIQUE modules relevant to its business.
   No two pages look alike. Professional dark palette.
   Inspired by Palantir's numbered-module layout.
   No fake data. No game aesthetics. No fluorescent colors.
   ═══════════════════════════════════════════════════════════════ */

interface InteractivePlatformProps {
  slug: string;
  accent?: string;
}

// Professional dark palette — no fluorescent, no game
const DIVIDER = 'rgba(255,255,255,0.06)';
const SUBTLE_BORDER = 'rgba(255,255,255,0.08)';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════
interface Capability {
  title: string;
  description: string;
}

interface ModuleConfig {
  label: string;
  name: string;
  description: string;
  capabilities: Capability[];
  cta: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

interface SubsidiaryConfig {
  headerLabel: string;
  headerTitle: string;
  headerDescription: string;
  modules: ModuleConfig[];
}

// ═══════════════════════════════════════════════════════════════
// SUBSIDIARY-SPECIFIC MODULE CONFIGURATIONS
// Each subsidiary has completely different modules, content,
// and capabilities — no two pages are alike.
// All text comes from i18n via the t() function.
// ═══════════════════════════════════════════════════════════════

function getSubsidiaryConfigs(t: (key: string) => string): Record<string, SubsidiaryConfig> {
  // Icon mapping stays in code (React components, not translatable text)
  const moduleIcons: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>[]> = {
    intelligence: [Server, Shield, Globe, Activity],
    cement: [Mountain, Flame, Leaf, Truck],
    energy: [Sun, Wind, Zap, Battery],
    technology: [Satellite, Lock, Wifi, Radio],
    mining: [Mountain, Cpu, FlaskConical, Ship],
    agriculture: [Map, Drone, FileText, Leaf],
    water: [Droplets, TestTube, Waves, CloudRain],
    finance: [Landmark, TrendingUp, Banknote, FileCheck],
  };

  const subsidiaries = ['intelligence', 'cement', 'energy', 'technology', 'mining', 'agriculture', 'water', 'finance'] as const;

  const configs: Record<string, SubsidiaryConfig> = {};

  for (const slug of subsidiaries) {
    const icons = moduleIcons[slug] || [];
    configs[slug] = {
      headerLabel: t(`platforms.${slug}.headerLabel`),
      headerTitle: t(`platforms.${slug}.headerTitle`),
      headerDescription: t(`platforms.${slug}.headerDescription`),
      modules: [0, 1, 2, 3].map((modIdx) => ({
        label: t(`platforms.${slug}.modules.${modIdx}.label`),
        name: t(`platforms.${slug}.modules.${modIdx}.name`),
        description: t(`platforms.${slug}.modules.${modIdx}.description`),
        capabilities: [0, 1, 2, 3].map((capIdx) => ({
          title: t(`platforms.${slug}.modules.${modIdx}.capabilities.${capIdx}.title`),
          description: t(`platforms.${slug}.modules.${modIdx}.capabilities.${capIdx}.description`),
        })),
        cta: t(`platforms.${slug}.modules.${modIdx}.cta`),
        icon: icons[modIdx] || Activity,
      })),
    };
  }

  return configs;
}

// ═══════════════════════════════════════════════════════════════
// Capability Card — Palantir-style numbered, bordered, text-driven
// ═══════════════════════════════════════════════════════════════
function CapabilityCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className="border-b pb-5"
      style={{ borderColor: DIVIDER }}
    >
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-[11px] font-mono text-white/20 tracking-wider">{number}</span>
        <h4 className="text-[15px] font-semibold text-white/85 leading-snug">{title}</h4>
      </div>
      <p className="text-[13px] text-white/35 leading-relaxed pl-7">{description}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Module Section — one product per section, Palantir-style
// ═══════════════════════════════════════════════════════════════
function ModuleSection({
  moduleConfig,
  index,
  accent,
}: {
  moduleConfig: ModuleConfig;
  index: number;
  accent: string;
}) {
  const t = useTranslations('interactivePlatform');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const IconComponent = moduleConfig.icon;

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="py-16 md:py-24"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Left column: Product header */}
        <div className="md:col-span-5">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}30` }}
            >
              <IconComponent size={16} className="opacity-70" />
            </div>
            <span className="text-[11px] font-mono text-white/20 tracking-[0.15em] uppercase">
              {String(index + 1).padStart(2, '0')} — {moduleConfig.label}
            </span>
          </div>
          <h3 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-white tracking-tight mb-4 leading-[1.1]">
            {moduleConfig.name}
          </h3>
          <p className="text-[14px] text-white/45 leading-[1.7] mb-6">
            {moduleConfig.description}
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-[13px] font-medium hover:text-white/90 transition-colors group"
            style={{ color: `${accent}CC` }}
          >
            {moduleConfig.cta}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Right column: Capabilities */}
        <div className="md:col-span-7">
          <span className="text-[11px] font-mono text-white/20 tracking-[0.15em] uppercase block mb-5">
            {t('capabilities')}
          </span>
          <div className="space-y-5">
            {moduleConfig.capabilities.map((cap, i) => (
              <CapabilityCard
                key={i}
                number={String(i + 1).padStart(2, '0')}
                title={cap.title}
                description={cap.description}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════════
// WhatsApp Integration Button — for agriculture module
// ═══════════════════════════════════════════════════════════════
function WhatsAppCTA() {
  const t = useTranslations('interactivePlatform');
  const handleClick = useCallback(() => {
    const message = encodeURIComponent(t('whatsappMessage'));
    window.open(`https://wa.me/?text=${message}`, '_blank');
  }, [t]);

  return (
    <button
      onClick={handleClick}
      className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded text-[13px] font-medium transition-all hover:opacity-90"
      style={{
        backgroundColor: 'rgba(37, 211, 102, 0.12)',
        border: '1px solid rgba(37, 211, 102, 0.25)',
        color: 'rgba(37, 211, 102, 0.85)',
      }}
    >
      <MessageCircle size={15} />
      {t('whatsappButton')}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// PDF Quote Generation Button — for agriculture module
// ═══════════════════════════════════════════════════════════════
function PDFQuoteCTA() {
  const t = useTranslations('interactivePlatform');
  const locale = useLocale();
  const [generating, setGenerating] = useState(false);

  const handleClick = useCallback(async () => {
    setGenerating(true);
    try {
      const url = `/api/pdf/data-center-spec?locale=${locale}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to generate PDF');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `harchcorp-data-center-spec-${locale}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('PDF download error:', error);
    } finally {
      setGenerating(false);
    }
  }, [locale]);

  return (
    <button
      onClick={handleClick}
      className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded text-[13px] font-medium transition-all hover:opacity-90"
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: 'rgba(255,255,255,0.7)',
      }}
      disabled={generating}
    >
      <FileText size={15} />
      {generating ? t('generatingPdf') : t('generatePdf')}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export function InteractivePlatform({ slug, accent }: InteractivePlatformProps) {
  const t = useTranslations('interactivePlatform');
  const configs = getSubsidiaryConfigs(t);
  const config = configs[slug];

  // Fallback: if no specific config exists, use a generic one
  if (!config) {
    return (
      <div className="w-full bg-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-20">
          <p className="text-white/40 text-[14px]">{t('modulesConfiguring')}</p>
        </div>
      </div>
    );
  }

  // Professional accent color per subsidiary (muted, not fluorescent)
  const accentColor = accent || '#8B9DAF';

  return (
    <div className="w-full bg-[#0A0A0A]">
      {/* Section header */}
      <div className="border-b" style={{ borderColor: DIVIDER }}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-20">
          <span className="text-[11px] font-mono text-white/20 tracking-[0.2em] uppercase block mb-4">
            {config.headerLabel}
          </span>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold text-white tracking-tight leading-[1.05] mb-5 max-w-3xl">
            {config.headerTitle}
          </h2>
          <p className="text-[15px] text-white/40 leading-[1.7] max-w-2xl">
            {config.headerDescription}
          </p>
        </div>
      </div>

      {/* Product modules */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {config.modules.map((moduleConfig, index) => (
          <React.Fragment key={moduleConfig.name}>
            {index > 0 && (
              <div className="h-[1px] w-full" style={{ backgroundColor: DIVIDER }} />
            )}
            <ModuleSection
              moduleConfig={moduleConfig}
              index={index}
              accent={accentColor}
            />
          </React.Fragment>
        ))}

        {/* Agriculture-specific action buttons */}
        {slug === 'agriculture' && (
          <div className="pb-16 flex flex-wrap gap-3">
            <PDFQuoteCTA />
            <WhatsAppCTA />
          </div>
        )}
      </div>

      {/* Bottom border */}
      <div className="h-[1px] w-full" style={{ backgroundColor: DIVIDER }} />
    </div>
  );
}
