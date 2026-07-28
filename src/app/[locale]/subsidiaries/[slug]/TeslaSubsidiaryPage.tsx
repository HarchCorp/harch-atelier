'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Building2,
  Hotel,
  Wheat,
  Server,
  Factory,
  Zap,
  Hospital,
  GraduationCap,
  Shield,
  CheckCircle2,
  Clock,
  Cpu,
  Battery,
  Wind,
  Sparkles,
  Sun,
  Globe,
  Leaf,
  TrendingDown,
  MapPin,
  Droplets,
  Mountain,
  Radio,
  Satellite,
  Lock,
  Cloud,
  DollarSign,
  Banknote,
  PieChart,
} from 'lucide-react';

import {
  TeslaHero,
  TeslaOverview,
  TeslaImageStats,
  TeslaReliability,
  TeslaSoftware,
  TeslaEpc,
  TeslaService,
  TeslaCalculator,
  TeslaProcess,
  TeslaApplications,
  TeslaWhyHarch,
  TeslaComparison,
  TeslaCaseStudies,
  TeslaSectors,
  TeslaDualCta,
  TeslaPricing,
  TeslaInnovation,
  TeslaGeography,
  TeslaTestimonials,
  TeslaFaq,
  TeslaResources,
  TeslaFinalCta,
  type StatItem,
  type StepItem,
  type TitledItem,
  type TestimonialItem,
  type FaqItem,
  type ResourceItem,
  type PlanItem,
  type CityItem,
} from './TeslaSections';

/* ═══════════════════════════════════════════════════════════════
   Image + icon mapping per subsidiary slug.
   All images are real photos from /public/images/ (no AI-generated images).
   ═══════════════════════════════════════════════════════════════ */

interface SubsidiaryAssets {
  namespace: string;
  images: {
    hero: string;
    hardware: string;
    reliability: string;
    epc: string;
    service: string;
    applications: string;
    caseStudies: string;
    innovation: string;
    finalCta: string;
  };
  sectorIcons: React.ComponentType<{ size?: number; className?: string }>[];
  innovationIcons: React.ComponentType<{ size?: number; className?: string }>[];
  accentColor: string;
}

const ASSETS: Record<string, SubsidiaryAssets> = {
  cement: {
    namespace: 'cementTesla',
    images: {
      hero: '/images/sections/comp-cement-mixer.jpg',
      hardware: '/images/sections/cement-quarry-aerial.jpg',
      reliability: '/images/newsroom/cement-permits-gambia.jpg',
      epc: '/images/sections/cement-industrial.jpg',
      service: '/images/sections/cement-factory.jpg',
      applications: '/images/sections/cement-kiln.jpg',
      caseStudies: '/images/sections/cement-quarry.jpg',
      innovation: '/images/sections/overview-casablanca.jpg',
      finalCta: '/images/company/industrial-portfolio.jpg',
    },
    sectorIcons: [Building2, Factory, Server, Zap, Globe, Building2, Mountain, Wheat],
    innovationIcons: [Leaf, Cpu, Sparkles, Wind],
    accentColor: 'amber-600',
  },
  mining: {
    namespace: 'miningTesla',
    images: {
      hero: '/images/sections/comp-mining-excavator.jpg',
      hardware: '/images/sections/mining-lab.jpg',
      reliability: '/images/sections/mining-open-pit.jpg',
      epc: '/images/sections/mining-phosphate.jpg',
      service: '/images/sections/mining-processing.jpg',
      applications: '/images/sections/mining-smelter.jpg',
      caseStudies: '/images/sections/comp-mining-site.jpg',
      innovation: '/images/sections/comp-mining-heavy.jpg',
      finalCta: '/images/blog/african-mineral-processing.jpg',
    },
    sectorIcons: [Mountain, Zap, Sparkles, Battery, Globe, Cpu, Wind, Leaf],
    innovationIcons: [Leaf, Cpu, Sparkles, Globe],
    accentColor: 'amber-600',
  },
  agriculture: {
    namespace: 'agriTesla',
    images: {
      hero: '/images/sections/agri-green-crops-aerial.jpg',
      hardware: '/images/sections/agri-drone-hightech.jpg',
      reliability: '/images/sections/agri-iot-sensor.jpg',
      epc: '/images/sections/agri-apollo-harvest.jpg',
      service: '/images/sections/comp-agri-green.jpg',
      applications: '/images/sections/agri-vertical-interior.jpg',
      caseStudies: '/images/sections/comp-agri-aerial.jpg',
      innovation: '/images/sections/agri-aerofarms-interior.jpg',
      finalCta: '/images/blog/precision-agriculture-senegal.jpg',
    },
    sectorIcons: [Wheat, Factory, Leaf, Droplets, Sun, Cpu, MapPin, Globe],
    innovationIcons: [Cpu, Sun, Leaf, Wind],
    accentColor: 'emerald-600',
  },
  water: {
    namespace: 'waterTesla',
    images: {
      hero: '/images/sections/water-desal-plant.jpg',
      hardware: '/images/sections/water-treatment.jpg',
      reliability: '/images/sections/water-control-room.jpg',
      epc: '/images/sections/comp-water-plant.jpg',
      service: '/images/sections/comp-water-pipes.jpg',
      applications: '/images/sections/water-dam.jpg',
      caseStudies: '/images/sections/water-desal.jpg',
      innovation: '/images/sections/water-control.jpg',
      finalCta: '/images/blog/desalination-ai-optimization.jpg',
    },
    sectorIcons: [Factory, Building2, Wheat, Mountain, Hotel, Zap, Server, Cpu],
    innovationIcons: [Sparkles, Sun, Droplets, Cpu],
    accentColor: 'blue-600',
  },
  intelligence: {
    namespace: 'intelTesla',
    images: {
      hero: '/images/intelligence/harchos-hero.png',
      hardware: '/images/intelligence/harchos-gpu-cluster.png',
      reliability: '/images/intelligence/harchos-ops-center.png',
      epc: '/images/intelligence/harchos-architecture.png',
      service: '/images/intelligence/harchos-dashboard.png',
      applications: '/images/intelligence/harchos-fibre.png',
      caseStudies: '/images/intelligence/harchos-facility-night.png',
      innovation: '/images/intelligence/harchos-energy-mix.png',
      finalCta: '/images/intelligence/harchos-mesh-map.png',
    },
    sectorIcons: [Banknote, Hospital, Wheat, Building2, Cpu, Globe, Radio, Shield],
    innovationIcons: [Cpu, Sparkles, Cloud, Satellite],
    accentColor: 'violet-600',
  },
  technology: {
    namespace: 'techTesla',
    images: {
      hero: '/images/sections/comp-tech-ai.jpg',
      hardware: '/images/sections/tech-satellite.jpg',
      reliability: '/images/sections/tech-cyber.jpg',
      epc: '/images/sections/tech-soc.jpg',
      service: '/images/sections/tech-ground-station.jpg',
      applications: '/images/sections/tech-infrastructure.jpg',
      caseStudies: '/images/sections/comp-tech-dish.jpg',
      innovation: '/images/company/innovation-lab.jpg',
      finalCta: '/images/blog/satellite-connectivity-rural-africa.jpg',
    },
    sectorIcons: [Building2, Banknote, Shield, Hospital, GraduationCap, Radio, Zap, Globe],
    innovationIcons: [Lock, Cpu, Sparkles, Satellite],
    accentColor: 'emerald-600',
  },
  finance: {
    namespace: 'financeTesla',
    images: {
      hero: '/images/sections/finance-district.jpg',
      hardware: '/images/sections/finance-trading.jpg',
      reliability: '/images/sections/finance-corporate.jpg',
      epc: '/images/sections/finance-business.jpg',
      service: '/images/sections/finance-stock.jpg',
      applications: '/images/company/leadership-team.jpg',
      caseStudies: '/images/company/hq-casablanca.jpg',
      innovation: '/images/sections/overview-casablanca.jpg',
      finalCta: '/images/blog/islamic-finance-african-infrastructure.jpg',
    },
    sectorIcons: [Zap, Globe, Server, Droplets, Wheat, Mountain, Factory, Building2],
    innovationIcons: [Leaf, PieChart, Cpu, DollarSign],
    accentColor: 'emerald-600',
  },
};

/* ═══════════════════════════════════════════════════════════════
   Main component — renders any subsidiary Tesla page from i18n.
   ═══════════════════════════════════════════════════════════════ */

export default function TeslaSubsidiaryPage({ slug }: { slug: string }) {
  const assets = ASSETS[slug];
  if (!assets) {
    return <div className="pt-40 pb-20 text-center"><h1 className="text-2xl font-bold">Page not found</h1></div>;
  }

  const t = useTranslations(assets.namespace);

  // Cast translation arrays
  const heroStats = t.raw('hero.stats') as StatItem[];
  const hardwareStats = t.raw('hardware.stats') as StatItem[];
  const epcStats = t.raw('epc.stats') as StatItem[];
  const serviceStats = t.raw('service.stats') as StatItem[];
  const softwareProducts = t.raw('software.products') as TitledItem[];
  const dashboardMetrics = (t.raw('software.metrics') as { label: string; value: string; color: string; bg: string }[]).map(m => ({
    label: m.label,
    value: m.value,
    color: m.color,
    bg: m.bg,
  }));
  const processSteps = t.raw('process.steps') as StepItem[];
  const applicationItems = t.raw('applications.items') as TitledItem[];
  const whyItems = t.raw('whyHarch.items') as TitledItem[];
  const comparisonRows = t.raw('comparison.rows') as string[][];
  const comparisonHeaders = t.raw('comparison.headers') as string[];
  const sectorItems = t.raw('sectors.items') as string[];
  const pricingPlans = t.raw('pricing.plans') as PlanItem[];
  const innoItems = t.raw('innovation.items') as TitledItem[];
  const geoCities = t.raw('geography.cities') as CityItem[];
  const testimonials = t.raw('testimonials.items') as TestimonialItem[];
  const faqItems = t.raw('faq.items') as FaqItem[];
  const resourceItems = t.raw('resources.items') as ResourceItem[];

  return (
    <div className="bg-white text-neutral-900">

      {/* 1. HERO */}
      <TeslaHero
        badge={t('hero.badge')}
        title={t('hero.title')}
        stats={heroStats}
        ctaLabel={t('hero.cta')}
        ctaHref="/quote"
        image={assets.images.hero}
      />

      {/* 2. OVERVIEW */}
      <TeslaOverview
        label={t('overview.label')}
        title={t('overview.title')}
        body={t('overview.body')}
      />

      {/* 3. HARDWARE (image + stats overlay) */}
      <TeslaImageStats
        image={assets.images.hardware}
        label={t('hardware.label')}
        title={t('hardware.title')}
        body={t('hardware.body')}
        learnMoreLabel={t('hardware.learnMore')}
        learnMoreHref="/quote"
        stats={hardwareStats}
      />

      {/* 4. RELIABILITY */}
      <TeslaReliability
        image={assets.images.reliability}
        label={t('reliability.label')}
        title={t('reliability.title')}
        body={t('reliability.body')}
      />

      {/* 5. SOFTWARE (dashboard + 3 products) */}
      <TeslaSoftware
        label={t('software.label')}
        title={t('software.title')}
        brandLabel={t('software.brandLabel')}
        plantLabel={t('software.plantLabel')}
        metrics={dashboardMetrics}
        products={softwareProducts}
      />

      {/* 6. EPC */}
      <TeslaEpc
        image={assets.images.epc}
        label={t('epc.label')}
        title={t('epc.title')}
        body={t('epc.body')}
        features={t.raw('epc.features') as string[]}
        stats={epcStats}
        accent={assets.accentColor}
        ctaHref="/quote"
      />

      {/* 7. SERVICE / Offtake / Distribution / Cloud / Investment */}
      <TeslaService
        image={assets.images.service}
        label={t('service.label')}
        title={t('service.title')}
        body={t('service.body')}
        stats={serviceStats}
        accent={assets.accentColor}
        ctaHref="/quote"
        reverse={true}
      />

      {/* 8. CALCULATOR */}
      <TeslaCalculator
        label={t('calculator.label')}
        title={t('calculator.title')}
        subtitle={t('calculator.subtitle')}
        billLabel={t('calculator.billLabel')}
        monthlyLabel={t('calculator.monthlyLabel')}
        yearlyLabel={t('calculator.yearlyLabel')}
        save25Label={t('calculator.save25Label')}
        disclaimer={t('calculator.disclaimer')}
      />

      {/* 9. PROCESS */}
      <TeslaProcess
        label={t('process.label')}
        title={t('process.title')}
        steps={processSteps}
      />

      {/* 10. APPLICATIONS */}
      <TeslaApplications
        image={assets.images.applications}
        label={t('applications.label')}
        title={t('applications.title')}
        body={t('applications.body')}
        items={applicationItems}
      />

      {/* 11. WHY HARCH */}
      <TeslaWhyHarch
        label={t('whyHarch.label')}
        title={t('whyHarch.title')}
        items={whyItems}
      />

      {/* 12. COMPARISON */}
      <TeslaComparison
        label={t('comparison.label')}
        title={t('comparison.title')}
        headers={comparisonHeaders}
        rows={comparisonRows}
      />

      {/* 13. CASE STUDIES */}
      <TeslaCaseStudies
        image={assets.images.caseStudies}
        label={t('caseStudies.label')}
        title={t('caseStudies.title')}
        body={t('caseStudies.body')}
      />

      {/* 14. SECTORS */}
      <TeslaSectors
        label={t('sectors.label')}
        title={t('sectors.title')}
        items={sectorItems}
        icons={assets.sectorIcons}
      />

      {/* 15. DUAL CTA */}
      <TeslaDualCta
        quoteTitle={t('ctaSection.quoteTitle')}
        quoteBody={t('ctaSection.quoteBody')}
        quoteCta={t('ctaSection.quoteCta')}
        callTitle={t('ctaSection.callTitle')}
        callBody={t('ctaSection.callBody')}
        callCta={t('ctaSection.callCta')}
        ctaHref="/quote"
        callHref="tel:+212684440682"
      />

      {/* 16. PRICING */}
      <TeslaPricing
        label={t('pricing.label')}
        title={t('pricing.title')}
        subtitle={t('pricing.subtitle')}
        plans={pricingPlans}
      />

      {/* 17. INNOVATION */}
      <TeslaInnovation
        image={assets.images.innovation}
        label={t('innovation.label')}
        title={t('innovation.title')}
        subtitle={t('innovation.subtitle')}
        items={innoItems}
        icons={assets.innovationIcons}
      />

      {/* 18. GEOGRAPHY */}
      <TeslaGeography
        label={t('geography.label')}
        title={t('geography.title')}
        subtitle={t('geography.subtitle')}
        cities={geoCities}
      />

      {/* 19. TESTIMONIALS */}
      <TeslaTestimonials
        label={t('testimonials.label')}
        title={t('testimonials.title')}
        items={testimonials}
      />

      {/* 20. FAQ */}
      <TeslaFaq
        label={t('faq.label')}
        title={t('faq.title')}
        items={faqItems}
      />

      {/* 21. RESOURCES */}
      <TeslaResources
        label={t('resources.label')}
        title={t('resources.title')}
        subtitle={t('resources.subtitle')}
        items={resourceItems}
        downloadLabel={t('resources.download')}
      />

      {/* 22. FINAL CTA */}
      <TeslaFinalCta
        image={assets.images.finalCta}
        title={t('finalCta.title')}
        subtitle={t('finalCta.subtitle')}
        primaryLabel={t('finalCta.primary')}
        secondaryLabel={t('finalCta.secondary')}
      />
    </div>
  );
}
