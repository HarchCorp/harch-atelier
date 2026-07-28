/**
 * HarchCorp GPU Compute Datasheet
 * 2-page datasheet matching Scaleway/AWS format
 */
import React from 'react';
import { Document, Page, Text, View, Font } from '@react-pdf/renderer';
import { CoverPage, PageHeaderBar, PDFFooter, SectionLabel, MetricRow, DataTable, BulletList, SpecRow, BadgeGroup, Callout, CTABox, SectionDivider, TwoColumn } from '../templates/components';
import { pdfStyles as s } from '../templates/styles';
import { HarchTheme as t } from '../templates/theme';
import { gpuOfferings as gpu } from '../data/gpu-compute';

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiA.woff2', fontWeight: 700 },
  ],
});
Font.register({
  family: 'SpaceMono',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/spacemono/v12/i7dPIFZifjKcF5UAWdDRYE98RWq7.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/spacemono/v12/i7dMIFZifjKcF5UAWdDRaPpZUFqwH4MP.woff2', fontWeight: 700 },
  ],
});

interface GPUComputeDatasheetProps {
  locale?: 'en' | 'fr';
}

export const GPUComputeDatasheet: React.FC<GPUComputeDatasheetProps> = ({ locale = 'en' }) => {
  const isFr = locale === 'fr';

  return (
    <Document
      title={isFr ? 'Fiche GPU Compute — HarchCorp' : 'GPU Compute Datasheet — HarchCorp'}
      author="HarchCorp SARL"
      subject={isFr ? 'Fiche technique GPU Compute' : 'GPU Compute Technical Datasheet'}
      creator="HarchCorp PDF Generator"
    >
      {/* ====== COVER PAGE ====== */}
      <Page size="A4" style={s.page}>
        <CoverPage
          type={isFr ? 'FICHE TECHNIQUE' : 'DATASHEET'}
          title={isFr ? 'GPU Compute Cloud' : 'GPU Compute Cloud'}
          subtitle={isFr
            ? 'Infrastructure GPU haute performance — 100% neutre en carbone — Hébergée en Afrique du Nord'
            : 'High-performance GPU infrastructure — 100% carbon-neutral — Hosted in North Africa'}
          locale={locale}
          version="1.0"
        />
      </Page>

      {/* ====== PAGE 2: INSTANCES + PRICING ====== */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar
          type={isFr ? 'FICHE TECHNIQUE' : 'DATASHEET'}
          title={isFr ? 'Configurations GPU & Tarification' : 'GPU Configurations & Pricing'}
        />

        {/* Key Metrics */}
        <MetricRow metrics={[
          { value: '6', label: isFr ? 'Configurations GPU' : 'GPU Configs' },
          { value: 'H100–B200', label: isFr ? 'Gamme GPU' : 'GPU Range' },
          { value: '€3.20', label: isFr ? 'À partir de/GPU/hr' : 'Starting/GPU/hr' },
          { value: '99.99%', label: isFr ? 'SLA Disponibilité' : 'Availability SLA' },
        ]} />

        <SectionDivider accent />

        {/* Instance Table */}
        <SectionLabel>{isFr ? 'CONFIGURATIONS GPU' : 'GPU CONFIGURATIONS'}</SectionLabel>
        <DataTable
          headers={[
            isFr ? 'Instance' : 'Instance',
            isFr ? 'GPU' : 'GPU',
            isFr ? 'VRAM' : 'VRAM',
            isFr ? 'CPU/RAM' : 'CPU/RAM',
            isFr ? 'Réseau' : 'Network',
            isFr ? 'Prix/GPU/hr' : 'Price/GPU/hr',
          ]}
          rows={gpu.instances.map(inst => [
            inst.name,
            `${inst.gpuCount}× ${inst.gpu.split(' ').slice(-1)}`,
            inst.vram.split(' per')[0],
            `${inst.cpu.split(' ')[0]}/${inst.ram}`,
            inst.network,
            inst.priceOnDemand.split('/')[0],
          ])}
          colWidths={[14, 16, 18, 18, 16, 18]}
        />

        <SectionDivider />

        {/* Pricing Table */}
        <SectionLabel>{isFr ? 'TARIFICATION DÉTAILLÉE' : 'PRICING DETAIL'}</SectionLabel>
        <DataTable
          headers={[
            isFr ? 'Configuration' : 'Config',
            isFr ? 'À la demande' : 'On-Demand',
            isFr ? 'Réservé (1 an)' : 'Reserved (1yr)',
            isFr ? 'Spot' : 'Spot',
          ]}
          rows={gpu.instances.map(inst => [
            inst.name,
            inst.priceOnDemand,
            inst.priceReserved,
            inst.priceSpot,
          ])}
          colWidths={[25, 25, 25, 25]}
        />

        <Callout>
          {isFr
            ? 'Tarification à la minute, sans engagement minimum. Toutes les instances GPU sont 100% neutres en carbone avec souveraineté des données au Maroc.'
            : 'Per-minute billing, no minimum commitment. All GPU instances are 100% carbon-neutral with data sovereignty in Morocco.'}
        </Callout>

        {/* Competitive Comparison */}
        <SectionLabel>{isFr ? 'COMPARAISON CONCURRENTIELLE' : 'COMPETITIVE COMPARISON'}</SectionLabel>
        <DataTable
          headers={[
            isFr ? 'Métrique' : 'Metric',
            'HarchCorp',
            'AWS',
            'GCP',
            'Scaleway',
            'CoreWeave',
          ]}
          rows={gpu.comparison.map(c => [
            c.metric,
            c.harchcorp,
            c.aws,
            c.gcp,
            c.scaleway,
            c.coreweave,
          ])}
          colWidths={[22, 16, 16, 16, 16, 14]}
        />

        <PDFFooter pageNumber={2} locale={locale} />
      </Page>

      {/* ====== PAGE 3: FEATURES + USE CASES ====== */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar
          type={isFr ? 'FICHE TECHNIQUE' : 'DATASHEET'}
          title={isFr ? 'Caractéristiques & Cas d\'Usage' : 'Features & Use Cases'}
        />

        {/* Platform Features */}
        <SectionLabel>{isFr ? 'CARACTÉRISTIQUES PLATEFORME' : 'PLATFORM FEATURES'}</SectionLabel>
        <TwoColumn
          left={
            <View>
              <BulletList items={[
                gpu.features.sla,
                gpu.features.billing,
                gpu.features.provisioning,
                gpu.features.networking,
                gpu.features.storage,
              ]} />
            </View>
          }
          right={
            <View>
              <BulletList items={[
                gpu.features.stack,
                gpu.features.orchestration,
                gpu.features.monitoring,
                gpu.features.security,
                gpu.features.sustainability,
              ]} />
            </View>
          }
        />

        <SectionDivider accent />

        {/* Use Cases per Instance */}
        <SectionLabel>{isFr ? 'CAS D\'USAGE' : 'USE CASES'}</SectionLabel>
        {gpu.instances.slice(0, 4).map((inst, idx) => (
          <View key={idx} style={{ marginBottom: t.spacing.sm }}>
            <Text style={s.h4}>{inst.name} — {inst.fullName}</Text>
            <BadgeGroup badges={inst.useCases} outline />
          </View>
        ))}

        <SectionDivider />

        {/* Sustainability Callout */}
        <SectionLabel>{isFr ? 'ENGAGEMENT DURABLE' : 'SUSTAINABILITY COMMITMENT'}</SectionLabel>
        <View style={[s.card, { borderLeftWidth: 3, borderLeftColor: t.colors.success }]}>
          <Text style={[s.body, { fontWeight: 600, color: t.colors.success }]}>
            {isFr ? '100% Compute GPU Neutre en Carbone' : '100% Carbon-Neutral GPU Compute'}
          </Text>
          <Text style={s.body}>
            {isFr
              ? 'Toutes les instances GPU fonctionnent dans notre centre de données Dakhla DC-1 alimenté à 100% par des énergies renouvelables. PUE de 1.12 — parmi les meilleurs au monde. Intensité carbone de 0.045 kgCO₂/kWh, soit 5× inférieure à la moyenne européenne.'
              : 'All GPU instances run in our Dakhla DC-1 data center powered by 100% renewable energy. PUE of 1.12 — among the best in the world. Carbon intensity of 0.045 kgCO₂/kWh, 5× lower than the EU average.'}
          </Text>
        </View>

        <View style={[s.card, { borderLeftWidth: 3, borderLeftColor: t.colors.accent }]}>
          <Text style={[s.body, { fontWeight: 600 }]}>
            {isFr ? 'Souveraineté des Données' : 'Data Sovereignty'}
          </Text>
          <Text style={s.body}>
            {isFr
              ? 'Vos données restent au Maroc — conforme au RGPD et à la loi 09-08 marocaine. Clauses contractuelles types UE disponibles pour les transferts transfrontaliers.'
              : 'Your data stays in Morocco — GDPR and Moroccan Law 09-08 compliant. EU Model Clauses available for cross-border transfers.'}
          </Text>
        </View>

        <CTABox
          title={isFr ? 'Commencez à entraîner vos modèles' : 'Start training your models'}
          text={isFr
            ? 'Démarrez en moins de 90 secondes. Aucune carte de crédit requise pour l\'essai gratuit.'
            : 'Launch in under 90 seconds. No credit card required for free trial.'}
          locale={locale}
        />

        <PDFFooter pageNumber={3} locale={locale} />
      </Page>
    </Document>
  );
};
