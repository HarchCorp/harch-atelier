/**
 * HarchCorp Sustainability & Impact Report
 * 6-page report matching OVHcloud/Digital Realty format
 */
import React from 'react';
import { Document, Page, Text, View, Font } from '@react-pdf/renderer';
import { CoverPage, PageHeaderBar, PDFFooter, SectionLabel, MetricRow, DataTable, BulletList, SpecRow, BadgeGroup, Callout, CTABox, SectionDivider, TwoColumn } from '../templates/components';
import { pdfStyles as s } from '../templates/styles';
import { HarchTheme as t } from '../templates/theme';
import { sustainabilityData as sus } from '../data/sustainability';

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

interface SustainabilityReportProps {
  locale?: 'en' | 'fr';
}

export const SustainabilityReport: React.FC<SustainabilityReportProps> = ({ locale = 'en' }) => {
  const isFr = locale === 'fr';

  return (
    <Document
      title={isFr ? 'Rapport Durabilité — HarchCorp 2025' : 'Sustainability Report — HarchCorp 2025'}
      author="HarchCorp SARL"
      subject={isFr ? 'Rapport annuel de durabilité et d\'impact' : 'Annual Sustainability and Impact Report'}
      creator="HarchCorp PDF Generator"
    >
      {/* COVER */}
      <Page size="A4" style={s.page}>
        <CoverPage
          type={isFr ? 'RAPPORT DURABILITÉ' : 'SUSTAINABILITY REPORT'}
          title={isFr ? 'Durabilité & Impact 2025' : 'Sustainability & Impact 2025'}
          subtitle={isFr
            ? 'Notre engagement pour une infrastructure AI neutre en carbone — Du centre de données au cloud GPU'
            : 'Our commitment to carbon-neutral AI infrastructure — From the data center to the GPU cloud'}
          locale={locale}
          version="1.0"
        />
      </Page>

      {/* PAGE 2: CEO LETTER + ENVIRONMENTAL OVERVIEW */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Lettre & Performance Environnementale' : 'Letter & Environmental Performance'} />

        <Text style={s.h3}>{isFr ? 'Notre vision' : 'Our vision'}</Text>
        <Text style={s.body}>
          {isFr
            ? 'Chez HarchCorp, nous croyons que l\'infrastructure de l\'intelligence artificielle doit être aussi intelligente que les modèles qu\'elle supporte. Cela signifie concevoir des centres de données qui minimisent leur impact environnemental tout en maximisant la performance compute. Notre installation de Dakhla démontre qu\'il est possible d\'atteindre un PUE de 1.12 — comparable aux meilleures installations nordiques — tout en servant les marchés africains et européens depuis une position stratégique unique.'
            : 'At HarchCorp, we believe AI infrastructure should be as intelligent as the models it supports. This means designing data centers that minimize their environmental impact while maximizing compute performance. Our Dakhla facility demonstrates it\'s possible to achieve a PUE of 1.12 — comparable to the best Nordic installations — while serving African and European markets from a unique strategic position.'}
        </Text>

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'MÉTRIQUES ENVIRONNEMENTALES CLÉS' : 'KEY ENVIRONMENTAL METRICS'}</SectionLabel>
        <MetricRow metrics={sus.impactMetrics.slice(0, 4)} />
        <MetricRow metrics={sus.impactMetrics.slice(4)} />

        <SectionDivider />

        <SectionLabel>{isFr ? 'PUE — TENDANCE & OBJECTIFS' : 'PUE — TREND & TARGETS'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Période / Objectif' : 'Period / Target', 'PUE', isFr ? 'Comparaison' : 'Comparison']}
          rows={[
            [isFr ? '2025 H1 (actuel)' : '2025 H1 (current)', String(sus.environmental.pue.history[0].pue), isFr ? 'Déjà meilleur qu\'Equinix (1.35)' : 'Already better than Equinix (1.35)'],
            [isFr ? '2025 H2 (actuel)' : '2025 H2 (current)', String(sus.environmental.pue.current), isFr ? 'Approche Google (1.09)' : 'Approaching Google (1.09)'],
            [isFr ? 'Objectif 2026' : 'Target 2026', String(sus.environmental.pue.target2026), isFr ? 'Niveau Google actuel' : 'Current Google level'],
            [isFr ? 'Objectif 2028' : 'Target 2028', String(sus.environmental.pue.target2028), isFr ? 'Meilleur au monde' : 'World-best'],
            [isFr ? 'Moyenne Industrie' : 'Industry Average', String(sus.environmental.pue.industry), '—'],
          ]}
          colWidths={[35, 15, 50]}
        />

        <PDFFooter pageNumber={2} locale={locale} />
      </Page>

      {/* PAGE 3: ENERGY & CARBON */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Énergie & Carbone' : 'Energy & Carbon'} />

        <SectionLabel>{isFr ? 'MIX ÉNERGÉTIQUE RENOUVELABLE' : 'RENEWABLE ENERGY MIX'}</SectionLabel>
        <TwoColumn
          left={
            <View>
              <SpecRow label={isFr ? 'Matching Renouvelable' : 'Renewable Matching'} value={`${sus.environmental.renewable.currentPercent}%`} highlight />
              <SpecRow label={isFr ? 'Solaire' : 'Solar'} value={`${sus.environmental.renewable.breakdown.solar}%`} />
              <SpecRow label={isFr ? 'Éolien' : 'Wind'} value={`${sus.environmental.renewable.breakdown.wind}%`} />
              <SpecRow label={isFr ? 'Certificats (RECs)' : 'Grid RECs'} value={`${sus.environmental.renewable.breakdown.gridRecs}%`} />
            </View>
          }
          right={
            <View>
              <SpecRow label={isFr ? 'Capacité Solaire' : 'Solar Capacity'} value={sus.environmental.renewable.solarCapacity} />
              <SpecRow label={isFr ? 'PPA Éolien' : 'Wind PPA'} value={sus.environmental.renewable.windPpa} />
              <SpecRow label={isFr ? 'Type' : 'Type'} value={sus.environmental.renewable.matchingType} />
            </View>
          }
        />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'ÉMISSIONS DE CARBONE' : 'CARBON EMISSIONS'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Scope' : 'Scope', isFr ? 'Émissions (marché)' : 'Emissions (market)', isFr ? 'Émissions (localisation)' : 'Emissions (location)', isFr ? 'Détail' : 'Detail']}
          rows={[
            ['Scope 1', sus.environmental.carbon.scope1, sus.environmental.carbon.scope1, isFr ? 'Générateurs diesel uniquement' : 'Diesel generators only'],
            ['Scope 2', sus.environmental.carbon.scope2, sus.environmental.carbon.scope2Location, isFr ? '100% matching renouvelable' : '100% renewable matching'],
            ['Scope 3', sus.environmental.carbon.scope3, sus.environmental.carbon.scope3, isFr ? 'Carbone incorporé + chaîne d\'approvisionnement' : 'Embodied + supply chain'],
            [isFr ? 'Total Opérationnel' : 'Total Operational', sus.environmental.carbon.totalOperational, '—', isFr ? 'Net-zero opérationnel (marché)' : 'Net-zero operational (market)'],
          ]}
          colWidths={[15, 22, 22, 41]}
        />

        <Callout>
          {isFr
            ? 'CUE Opérationnel = 0.000 kgCO₂/kWh — Notre matching 100% renouvelable signifie que nos opérations sont neutres en carbone du point de vue du marché. Nous visons le carbone négatif d\'ici 2035 en incluant le Scope 3.'
            : 'Operational CUE = 0.000 kgCO₂/kWh — Our 100% renewable matching means our operations are carbon-neutral from a market perspective. We target carbon-negative by 2035 including Scope 3.'}
        </Callout>

        <SectionDivider />

        <SectionLabel>{isFr ? 'EAU & REFROIDISSEMENT' : 'WATER & COOLING'}</SectionLabel>
        <TwoColumn
          left={
            <View>
              <Text style={s.h4}>{isFr ? 'Consommation d\'eau' : 'Water Consumption'}</Text>
              <SpecRow label="WUE" value={`${sus.environmental.wue.current} L/kWh`} highlight />
              <SpecRow label={isFr ? 'Objectif 2026' : 'Target 2026'} value={`${sus.environmental.wue.target2026} L/kWh`} />
              <SpecRow label={isFr ? 'Eau Douce' : 'Freshwater'} value={sus.environmental.water.freshwaterConsumption} highlight />
            </View>
          }
          right={
            <View>
              <Text style={s.h4}>{isFr ? 'Air Gratuit' : 'Free Cooling'}</Text>
              <SpecRow label={isFr ? 'Heures/An' : 'Hours/Year'} value={`${sus.environmental.freeCooling.hoursPerYear}+`} highlight />
              <SpecRow label={isFr ? '% de l\'année' : '% of Year'} value={sus.environmental.freeCooling.percentOfYear} />
              <SpecRow label={isFr ? 'vs. Nordique' : 'vs. Nordic'} value={sus.environmental.freeCooling.vsNordic} />
            </View>
          }
        />

        <PDFFooter pageNumber={3} locale={locale} />
      </Page>

      {/* PAGE 4: SOCIAL & GOVERNANCE */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Social & Gouvernance' : 'Social & Governance'} />

        <SectionLabel>{isFr ? 'IMPACT SOCIAL' : 'SOCIAL IMPACT'}</SectionLabel>
        <MetricRow metrics={[
          { value: String(sus.social.employees.total), label: isFr ? 'Employés' : 'Employees' },
          { value: sus.social.employees.diversity, label: isFr ? 'Femmes (tech)' : 'Women (tech)' },
          { value: sus.social.employees.retention, label: isFr ? 'Rétention' : 'Retention' },
          { value: `€${sus.social.training.budgetPerEmployee}`, label: isFr ? 'Formation/employé' : 'Training/employee' },
        ]} />

        <SectionDivider />

        <Text style={s.h3}>{isFr ? 'Équipe' : 'Team'}</Text>
        <DataTable
          headers={[isFr ? 'Lieu' : 'Location', isFr ? 'Effectif' : 'Headcount', isFr ? 'Part' : 'Share']}
          rows={[
            [isFr ? 'Maroc' : 'Morocco', String(sus.social.employees.morocco), `${Math.round(sus.social.employees.morocco / sus.social.employees.total * 100)}%`],
            [isFr ? 'France' : 'France', String(sus.social.employees.france), `${Math.round(sus.social.employees.france / sus.social.employees.total * 100)}%`],
            [isFr ? 'Télétravail' : 'Remote', String(sus.social.employees.remote), `${Math.round(sus.social.employees.remote / sus.social.employees.total * 100)}%`],
            [isFr ? 'Total' : 'Total', String(sus.social.employees.total), '100%'],
          ]}
          colWidths={[40, 30, 30]}
        />

        <SectionDivider />

        <Text style={s.h3}>{isFr ? 'Engagement communautaire' : 'Community Engagement'}</Text>
        <BulletList items={[
          `${isFr ? 'Investissement communautaire' : 'Community investment'}: ${sus.social.community.investment}`,
          `${isFr ? 'Programmes STEM' : 'STEM programs'}: ${sus.social.community.stemPrograms}`,
          `${isFr ? 'Emploi local' : 'Local hiring target'}: ${sus.social.community.localHiring}`,
        ]} />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'GOUVERNANCE & CERTIFICATIONS' : 'GOVERNANCE & CERTIFICATIONS'}</SectionLabel>
        <BadgeGroup badges={sus.governance.certifications} />
        <Text style={s.h4}>{isFr ? 'Engagements' : 'Commitments'}</Text>
        <BadgeGroup badges={sus.governance.commitments} outline />

        <SectionDivider />

        <Text style={s.h3}>{isFr ? 'Souveraineté des données' : 'Data Sovereignty'}</Text>
        <BulletList items={isFr ? [
          `Juridiction: ${sus.governance.dataSovereignty.jurisdiction}`,
          `Conformité RGPD: ${sus.governance.dataSovereignty.gdpr}`,
          `Loi marocaine: ${sus.governance.dataSovereignty.moroccanLaw}`,
          `Transferts: ${sus.governance.dataSovereignty.crossBorder}`,
        ] : [
          `Jurisdiction: ${sus.governance.dataSovereignty.jurisdiction}`,
          `GDPR compliance: ${sus.governance.dataSovereignty.gdpr}`,
          `Moroccan law: ${sus.governance.dataSovereignty.moroccanLaw}`,
          `Cross-border: ${sus.governance.dataSovereignty.crossBorder}`,
        ]} />

        <PDFFooter pageNumber={4} locale={locale} />
      </Page>

      {/* PAGE 5: ROADMAP */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Feuille de Route & Objectifs' : 'Roadmap & Targets'} />

        <SectionLabel>{isFr ? 'FEUILLE DE ROUTE DURABILITÉ' : 'SUSTAINABILITY ROADMAP'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Année' : 'Year', isFr ? 'Jalon' : 'Milestone', isFr ? 'Statut' : 'Status']}
          rows={sus.roadmap.map(r => [
            r.year,
            r.milestone,
            r.status === 'completed' ? (isFr ? '✓ Atteint' : '✓ Achieved') :
              r.status === 'in-progress' ? (isFr ? '→ En cours' : '→ In Progress') :
                (isFr ? '○ Objectif' : '○ Target'),
          ])}
          colWidths={[15, 55, 30]}
        />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'COMPARAISON DE L\'INTENSITÉ CARBONE' : 'CARBON INTENSITY COMPARISON'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Source' : 'Source', isFr ? 'kgCO₂/kWh' : 'kgCO₂/kWh', isFr ? 'vs HarchCorp' : 'vs HarchCorp']}
          rows={[
            ['HarchCorp (Morocco, 100% RE)', '0.000', '—'],
            ['HarchCorp (Morocco grid)', '0.045', '1×'],
            ['France grid average', '0.085', '1.9×'],
            ['Scaleway (France, 100% RE)', '0.000', '—'],
            ['Google Cloud (EU, CFE)', '0.095', '2.1×'],
            ['AWS (EU average)', '0.180', '4.0×'],
            ['EU grid average', '0.258', '5.7×'],
            ['CoreWeave (US average)', '0.220', '4.9×'],
          ]}
          colWidths={[40, 25, 35]}
        />

        <Callout>
          {isFr
            ? 'L\'avantage marocain : Avec une intensité carbone du réseau de 0.045 kgCO₂/kWh (vs 0.258 moyenne UE), même avant le matching renouvelable, notre grille est déjà 5.7× plus propre que la moyenne européenne. Combiné avec 100% d\'énergie renouvelable, nous offrons le GPU compute le plus propre au monde.'
            : 'The Morocco advantage: With a grid carbon intensity of 0.045 kgCO₂/kWh (vs 0.258 EU average), even before renewable matching, our grid is already 5.7× cleaner than the European average. Combined with 100% renewable energy, we offer the cleanest GPU compute in the world.'}
        </Callout>

        <CTABox
          title={isFr ? 'Construisez un futur durable' : 'Build a sustainable future'}
          text={isFr
            ? 'Rejoignez les entreprises qui choisissent l\'infrastructure AI neutre en carbone. Contactez-nous pour calculer votre empreinte carbone potentielle.'
            : 'Join the companies choosing carbon-neutral AI infrastructure. Contact us to calculate your potential carbon footprint.'}
          locale={locale}
        />

        <PDFFooter pageNumber={5} locale={locale} />
      </Page>
    </Document>
  );
};
