/**
 * HarchCorp ESG Scorecard — Extra-Financial Report
 * 4-page report: cover, pillar scores (E/S/G), sub-metrics + benchmark, improvement roadmap
 * Generated from the EnterpriseDashboard "ESG Scorecard" section.
 */
import React from 'react';
import { Document, Page, Text, View, Font } from '@react-pdf/renderer';
import {
  CoverPage,
  PageHeaderBar,
  PDFFooter,
  SectionLabel,
  MetricRow,
  DataTable,
  BulletList,
  Callout,
  CTABox,
  SectionDivider,
  SpecRow,
  TwoColumn,
  BadgeGroup,
} from '../templates/components';
import { pdfStyles as s } from '../templates/styles';
import { HarchTheme as t } from '../templates/theme';

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

interface EsgReportProps {
  locale?: 'en' | 'fr';
}

export const EsgReport: React.FC<EsgReportProps> = ({ locale = 'fr' }) => {
  const isFr = locale === 'fr';

  return (
    <Document
      title={isFr ? 'Scorecard ESG — HarchCorp' : 'ESG Scorecard — HarchCorp'}
      author="HarchCorp SARL"
      subject={isFr ? 'Rapport extra-financier — Environnement, Social, Gouvernance' : 'Extra-financial report — Environmental, Social, Governance'}
      creator="HarchCorp PDF Generator"
    >
      {/* COVER */}
      <Page size="A4" style={s.page}>
        <CoverPage
          type={isFr ? 'SCORECARD ESG' : 'ESG SCORECARD'}
          title={isFr ? 'Rapport Extra-Financier' : 'Extra-Financial Report'}
          subtitle={isFr
            ? 'Scorecard Environnement, Social, Gouvernance — scores par pilier, benchmark sectoriel et feuille de route d\'amélioration'
            : 'Environmental, Social, Governance scorecard — per-pillar scores, sector benchmark and improvement roadmap'}
          locale={locale}
          version="1.0"
        />
      </Page>

      {/* PAGE 2: PILLAR SCORES */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Scores par Pilier — E / S / G' : 'Per-Pillar Scores — E / S / G'} type={isFr ? 'PAGE 2' : 'PAGE 2'} />

        <SectionLabel>{isFr ? 'SCORE GLOBAL' : 'GLOBAL SCORE'}</SectionLabel>
        <MetricRow
          metrics={[
            { value: '74', label: isFr ? 'Score ESG global' : 'Global ESG score', unit: '/100' },
            { value: '71', label: isFr ? 'Benchmark sectoriel' : 'Sector benchmark', unit: '/100' },
            { value: '+3', label: isFr ? 'Écart vs benchmark' : 'Gap vs benchmark', unit: 'pts' },
            { value: '+5', label: isFr ? 'Variation 12 mois' : '12-month change', unit: 'pts' },
          ]}
        />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'DÉCOMPOSITION PAR PILIER' : 'PILLAR BREAKDOWN'}</SectionLabel>
        <View style={{ marginBottom: t.spacing.md }}>
          <SpecRow label={isFr ? 'Environnement (E)' : 'Environmental (E)'} value={isFr ? '78/100 — benchmark 72 (+6)' : '78/100 — benchmark 72 (+6)'} highlight />
          <SpecRow label={isFr ? 'Social (S)' : 'Social (S)'} value={isFr ? '76/100 — benchmark 70 (+6)' : '76/100 — benchmark 70 (+6)'} highlight />
          <SpecRow label={isFr ? 'Gouvernance (G)' : 'Governance (G)'} value={isFr ? '68/100 — benchmark 72 (−4)' : '68/100 — benchmark 72 (-4)'} highlight />
          <SpecRow label={isFr ? 'Score ESG global pondéré' : 'Weighted global ESG score'} value="74/100 — benchmark 71 (+3)" highlight />
        </View>

        <SectionDivider />

        <SectionLabel>{isFr ? 'FORCES IDENTIFIÉES' : 'IDENTIFIED STRENGTHS'}</SectionLabel>
        <BulletList
          items={isFr
            ? [
                'Environnement : PUE 1.12 — meilleur que la moyenne sectorielle (1.35)',
                'Social : marque employeur solide (88 % taux de rétention)',
                'Gouvernance : conformité AMMC/BAM satisfaisante',
                'Mix énergétique : 64 % renouvelable (objectif 100 % en 2027)',
              ]
            : [
                'Environmental: PUE 1.12 — better than sector average (1.35)',
                'Social: strong employer brand (88% retention rate)',
                'Governance: satisfactory AMMC/BAM compliance',
                'Energy mix: 64% renewable (100% target by 2027)',
              ]}
        />

        <Callout accentColor={t.colors.success}>
          {isFr
            ? 'Le pilier Environnement porte le score global, grâce à la performance énergétique du datacenter de Dakhla (PUE 1.12) et au mix énergétique majoritairement renouvelable (64 %).'
            : 'The Environmental pillar drives the global score, thanks to the energy performance of the Dakhla data center (PUE 1.12) and the majority renewable energy mix (64%).'}
        </Callout>

        <PDFFooter pageNumber={2} locale={locale} />
      </Page>

      {/* PAGE 3: SUB-METRICS + BENCHMARK */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Sous-Métriques & Benchmark Sectoriel' : 'Sub-Metrics & Sector Benchmark'} type={isFr ? 'PAGE 3' : 'PAGE 3'} />

        <SectionLabel>{isFr ? 'SOUS-MÉTRIQUES ENVIRONNEMENT (E)' : 'ENVIRONMENTAL SUB-METRICS (E)'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Indicateur' : 'Indicator', isFr ? 'Score' : 'Score', isFr ? 'Benchmark' : 'Benchmark', isFr ? 'Écart' : 'Gap']}
          rows={[
            [isFr ? 'PUE datacenter' : 'Data center PUE', '92', '85', '+7'],
            [isFr ? 'Mix énergétique renouvelable' : 'Renewable energy mix', '78', '65', '+13'],
            [isFr ? 'Empreinte carbone par unité compute' : 'Carbon footprint per compute unit', '81', '74', '+7'],
            [isFr ? 'Efficacité refroidissement' : 'Cooling efficiency', '88', '70', '+18'],
            [isFr ? 'Programme recyclage matériel' : 'Hardware recycling program', '68', '62', '+6'],
          ]}
          colWidths={[46, 16, 20, 18]}
        />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'SOUS-MÉTRIQUES SOCIAL (S)' : 'SOCIAL SUB-METRICS (S)'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Indicateur' : 'Indicator', isFr ? 'Score' : 'Score', isFr ? 'Benchmark' : 'Benchmark', isFr ? 'Écart' : 'Gap']}
          rows={[
            [isFr ? 'Taux de rétention employés' : 'Employee retention rate', '88', '75', '+13'],
            [isFr ? 'Diversité & inclusion' : 'Diversity & inclusion', '74', '70', '+4'],
            [isFr ? 'Formation continue (heures/an)' : 'Continuous training (hours/year)', '72', '68', '+4'],
            [isFr ? 'Santé & sécurité au travail' : 'Workplace health & safety', '82', '78', '+4'],
            [isFr ? 'Engagement communautaire local' : 'Local community engagement', '64', '60', '+4'],
          ]}
          colWidths={[46, 16, 20, 18]}
        />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'SOUS-MÉTRIQUES GOUVERNANCE (G)' : 'GOVERNANCE SUB-METRICS (G)'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Indicateur' : 'Indicator', isFr ? 'Score' : 'Score', isFr ? 'Benchmark' : 'Benchmark', isFr ? 'Écart' : 'Gap']}
          rows={[
            [isFr ? 'Indépendance des administrateurs' : 'Board independence', '62', '74', '−12'],
            [isFr ? 'Transparence financière' : 'Financial transparency', '78', '76', '+2'],
            [isFr ? 'Conformité réglementaire' : 'Regulatory compliance', '74', '78', '−4'],
            [isFr ? 'Politique anti-corruption' : 'Anti-corruption policy', '70', '68', '+2'],
            [isFr ? 'Audit interne & contrôle' : 'Internal audit & control', '66', '64', '+2'],
          ]}
          colWidths={[46, 16, 20, 18]}
        />

        <PDFFooter pageNumber={3} locale={locale} />
      </Page>

      {/* PAGE 4: ROADMAP + CERTIFICATIONS + CTA */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Feuille de Route & Certifications' : 'Roadmap & Certifications'} type={isFr ? 'PAGE 4' : 'PAGE 4'} />

        <SectionLabel>{isFr ? 'FAIBLESSES IDENTIFIÉES' : 'IDENTIFIED WEAKNESSES'}</SectionLabel>
        <BulletList
          items={isFr
            ? [
                'Gouvernance : indépendance des administrateurs (62/100, écart −12 vs benchmark) — action prioritaire',
                'Gouvernance : conformité réglementaire (74/100, écart −4) — surveillance continue',
                'Environnement : programme de recyclage matériel (68/100) — renforcement nécessaire',
              ]
            : [
                'Governance: board independence (62/100, gap -12 vs benchmark) — priority action',
                'Governance: regulatory compliance (74/100, gap -4) — continuous monitoring',
                'Environmental: hardware recycling program (68/100) — reinforcement needed',
              ]}
        />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'FEUILLE DE ROUTE 2026' : '2026 ROADMAP'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Échéance' : 'Deadline', isFr ? 'Action' : 'Action', isFr ? 'Pilier' : 'Pillar', isFr ? 'Propriétaire' : 'Owner']}
          rows={[
            [isFr ? 'T1 2026' : 'Q1 2026', isFr ? 'Recrutement 2 administrateurs indépendants' : 'Recruit 2 independent directors', 'G', 'Karim B.'],
            [isFr ? 'T1 2026' : 'Q1 2026', isFr ? 'Lancement programme recyclage matériel étendu' : 'Launch extended hardware recycling program', 'E', 'Salma E.'],
            [isFr ? 'T2 2026' : 'Q2 2026', isFr ? 'Mix énergétique 75 % renouvelable' : '75% renewable energy mix', 'E', 'Younes T.'],
            [isFr ? 'T2 2026' : 'Q2 2026', isFr ? 'Plan d\'action diversité & inclusion' : 'Diversity & inclusion action plan', 'S', 'Aicha L.'],
            [isFr ? 'T3 2026' : 'Q3 2026', isFr ? 'Audit ESG externe (tierce partie)' : 'External ESG audit (third party)', 'E/S/G', 'Sophie M.'],
            [isFr ? 'T4 2026' : 'Q4 2026', isFr ? 'Publication rapport ESG annuel' : 'Annual ESG report publication', 'E/S/G', 'Karim B.'],
          ]}
          colWidths={[16, 48, 12, 24]}
        />

        <SectionDivider />

        <SectionLabel>{isFr ? 'CERTIFICATIONS & CADRES DE RÉFÉRENCE' : 'CERTIFICATIONS & FRAMEWORKS'}</SectionLabel>
        <BadgeGroup
          badges={[
            'ISO 14001:2015',
            'ISO 45001:2018',
            'GRI Standards 2021',
            'SASB — Technology & Communications',
            'TCFD (alignement)',
            'UN Global Compact',
          ]}
        />

        <Callout accentColor={t.colors.success}>
          {isFr
            ? 'HarchCorp se positionne au-dessus du benchmark sectoriel sur les piliers Environnement (+6 pts) et Social (+6 pts). Le pilier Gouvernance (−4 pts) est le principal axe d\'amélioration, avec un plan d\'action à 12 mois centré sur l\'indépendance du conseil.'
            : 'HarchCorp positions above the sector benchmark on the Environmental (+6 pts) and Social (+6 pts) pillars. The Governance pillar (-4 pts) is the main improvement axis, with a 12-month action plan focused on board independence.'}
        </Callout>

        <CTABox
          title={isFr ? 'Rapport ESG détaillé ?' : 'Detailed ESG report?'}
          text={isFr
            ? 'Le rapport ESG complet (méthodologie, données brutes, assurance tierce partie) est disponible sur demande pour les investisseurs et partenaires.'
            : 'The full ESG report (methodology, raw data, third-party assurance) is available on request for investors and partners.'}
          locale={locale}
        />

        <PDFFooter pageNumber={4} locale={locale} />
      </Page>
    </Document>
  );
};
