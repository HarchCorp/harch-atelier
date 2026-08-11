/**
 * HarchCorp Board-Ready Report — Quarterly Synthesis
 * 6-page report: cover, executive synthesis, quarterly KPIs, risk mapping, compliance status, recommendations
 * Generated from the EnterpriseDashboard "Board PDF Template Gallery" section.
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

interface BoardReportProps {
  locale?: 'en' | 'fr';
}

export const BoardReport: React.FC<BoardReportProps> = ({ locale = 'fr' }) => {
  const isFr = locale === 'fr';

  return (
    <Document
      title={isFr ? 'Rapport Board-Ready — HarchCorp' : 'Board-Ready Report — HarchCorp'}
      author="HarchCorp SARL"
      subject={isFr ? 'Synthèse trimestrielle pour le COMEX' : 'Quarterly synthesis for the board'}
      creator="HarchCorp PDF Generator"
    >
      {/* COVER */}
      <Page size="A4" style={s.page}>
        <CoverPage
          type={isFr ? 'RAPPORT BOARD-READY' : 'BOARD-READY REPORT'}
          title={isFr ? 'Synthèse Trimestrielle' : 'Quarterly Synthesis'}
          subtitle={isFr
            ? 'Rapport multi-sections : synthèse exécutive, KPI trimestriels, cartographie des risques, statut conformité et recommandations'
            : 'Multi-section report: executive synthesis, quarterly KPIs, risk mapping, compliance status and recommendations'}
          locale={locale}
          version="1.0"
        />
      </Page>

      {/* PAGE 2: EXECUTIVE SYNTHESIS */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Synthèse Exécutive' : 'Executive Synthesis'} type={isFr ? 'PAGE 2' : 'PAGE 2'} />

        <SectionLabel>{isFr ? 'POINTS CLÉS DU TRIMESTRE' : 'QUARTER HIGHLIGHTS'}</SectionLabel>
        <MetricRow
          metrics={[
            { value: '78', label: isFr ? 'Score de réputation' : 'Reputation score', unit: '/100' },
            { value: '74', label: isFr ? 'Score ESG global' : 'Global ESG score', unit: '/100' },
            { value: '32', label: isFr ? 'Risque conformité' : 'Compliance risk', unit: '/100' },
            { value: '+4,2 %', label: isFr ? 'Croissance CA' : 'Revenue growth', unit: isFr ? 'vs N-1' : 'vs YoY' },
          ]}
        />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'RÉSUMÉ EXÉCUTIF' : 'EXECUTIVE SUMMARY'}</SectionLabel>
        <Text style={s.body}>
          {isFr
            ? 'Le trimestre écoulé confirme la trajectoire de croissance d\'HarchCorp, portée par la montée en charge du datacenter de Dakhla et l\'extension de l\'offre GPU compute. Le score de réputation progresse de 4 points à 78/100, avec une perception institutionnelle solide (88/100) et une légère érosion B2B à surveiller (-2 pts).'
            : 'The past quarter confirms HarchCorp\'s growth trajectory, driven by the ramp-up of the Dakhla data center and the expansion of the GPU compute offering. The reputation score increased by 4 points to 78/100, with strong institutional perception (88/100) and slight B2B erosion to monitor (-2 pts).'}
        </Text>

        <Text style={s.body}>
          {isFr
            ? 'Sur le front extra-financier, le score ESG global atteint 74/100 — au-dessus du benchmark sectoriel (71/100). Les piliers Environnement (+6) et Social (+6) portent la performance, tandis que le pilier Gouvernance (-4) nécessite une attention particulière, notamment sur l\'indépendance des administrateurs.'
            : 'On the extra-financial front, the global ESG score reaches 74/100 — above the sector benchmark (71/100). The Environmental (+6) and Social (+6) pillars drive performance, while the Governance pillar (-4) requires particular attention, especially on board independence.'}
        </Text>

        <Callout accentColor={t.colors.success}>
          {isFr
            ? 'Décisions stratégiques du trimestre : (1) approbation du câble 2Africa (CAPEX 4,2 M€), (2) extension du contrat GPU stratégique à 36 mois, (3) lancement du programme ESG 2026 (budget 1,8 M€).'
            : 'Quarter strategic decisions: (1) 2Africa cable approval (CAPEX 4.2 M€), (2) 36-month extension of the strategic GPU contract, (3) launch of the 2026 ESG program (budget 1.8 M€).'}
        </Callout>

        <PDFFooter pageNumber={2} locale={locale} />
      </Page>

      {/* PAGE 3: QUARTERLY KPIs */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'KPI Trimestriels' : 'Quarterly KPIs'} type={isFr ? 'PAGE 3' : 'PAGE 3'} />

        <SectionLabel>{isFr ? 'INDICATEURS FINANCIERS' : 'FINANCIAL INDICATORS'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Indicateur' : 'Indicator', isFr ? 'T' : 'Q', isFr ? 'N-1' : 'YoY', isFr ? 'Variation' : 'Change', isFr ? 'Cible' : 'Target']}
          rows={[
            [isFr ? 'Chiffre d\'affaires (M€)' : 'Revenue (M€)', '14,2', '13,6', '+4,2 %', '15,0'],
            [isFr ? 'Marge brute' : 'Gross margin', '62 %', '60 %', '+2 pts', '63 %'],
            [isFr ? 'EBITDA (M€)' : 'EBITDA (M€)', '4,8', '4,1', '+17,1 %', '5,2'],
            [isFr ? 'Cash-flow opérationnel (M€)' : 'Operating cash flow (M€)', '3,9', '3,3', '+18,2 %', '4,2'],
            [isFr ? 'CAPEX (M€)' : 'CAPEX (M€)', '2,1', '1,8', '+16,7 %', '2,4'],
          ]}
          colWidths={[40, 14, 14, 16, 16]}
        />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'INDICATEURS NON-FINANCIERS' : 'NON-FINANCIAL INDICATORS'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Indicateur' : 'Indicator', isFr ? 'T' : 'Q', isFr ? 'N-1' : 'YoY', isFr ? 'Variation' : 'Change', isFr ? 'Cible' : 'Target']}
          rows={[
            [isFr ? 'Clients actifs GPU' : 'Active GPU clients', '47', '38', '+23,7 %', '55'],
            [isFr ? 'Taux d\'utilisation GPU' : 'GPU utilization rate', '78 %', '72 %', '+6 pts', '80 %'],
            [isFr ? 'Score de réputation' : 'Reputation score', '78', '74', '+4 pts', '80'],
            [isFr ? 'Score ESG global' : 'Global ESG score', '74', '69', '+5 pts', '78'],
            [isFr ? 'Effectif total' : 'Total headcount', '142', '128', '+10,9 %', '150'],
          ]}
          colWidths={[40, 14, 14, 16, 16]}
        />

        <SectionDivider />

        <SectionLabel>{isFr ? 'ÉVÉNEMENTS MARQUANTS DU TRIMESTRE' : 'QUARTER HIGHLIGHTS'}</SectionLabel>
        <BulletList
          items={isFr
            ? [
                'Mise en service phase 2 du datacenter de Dakhla (capacité +40 %)',
                'Signature de 9 nouveaux clients GPU compute (cible 55 atteinte à 85 %)',
                'Certification ISO 27001:2022 recertifiée sans non-conformité majeure',
                'Lancement du programme ESG 2026 (budget 1,8 M€ validé par le COMEX)',
              ]
            : [
                'Phase 2 commissioning of the Dakhla data center (capacity +40%)',
                '9 new GPU compute clients signed (target 55 reached at 85%)',
                'ISO 27001:2022 certification recertified without major non-compliance',
                'Launch of the 2026 ESG program (budget 1.8 M€ validated by the board)',
              ]}
        />

        <PDFFooter pageNumber={3} locale={locale} />
      </Page>

      {/* PAGE 4: RISK MAPPING */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Cartographie des Risques' : 'Risk Mapping'} type={isFr ? 'PAGE 4' : 'PAGE 4'} />

        <SectionLabel>{isFr ? 'MATRICE DES RISQUES — IMPACT × PROBABILITÉ' : 'RISK MATRIX — IMPACT × PROBABILITY'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Risque' : 'Risk', isFr ? 'Catégorie' : 'Category', isFr ? 'Impact' : 'Impact', isFr ? 'Probabilité' : 'Probability', isFr ? 'Priorité' : 'Priority']}
          rows={[
            [isFr ? 'Exposition géopolitique (câbles)' : 'Geopolitical exposure (cables)', isFr ? 'Opérationnel' : 'Operational', 'Élevé', 'Moyen', 'P1'],
            [isFr ? 'Concentration client GPU' : 'GPU client concentration', isFr ? 'Commercial' : 'Commercial', 'Élevé', 'Élevé', 'P1'],
            [isFr ? 'Conformité CNDP' : 'CNDP compliance', isFr ? 'Réglementaire' : 'Regulatory', 'Moyen', 'Élevé', 'P2'],
            [isFr ? 'Tension marché talents' : 'Tight talent market', isFr ? 'Ressources humaines' : 'HR', 'Moyen', 'Élevé', 'P2'],
            [isFr ? 'Cybersécurité (ransomware)' : 'Cybersecurity (ransomware)', isFr ? 'Sécurité' : 'Security', 'Élevé', 'Faible', 'P2'],
            [isFr ? 'Dépendance fournisseur GPU' : 'GPU supplier dependency', isFr ? 'Opérationnel' : 'Operational', 'Moyen', 'Moyen', 'P3'],
            [isFr ? 'Évolution réglementaire UE' : 'EU regulatory evolution', isFr ? 'Réglementaire' : 'Regulatory', 'Moyen', 'Moyen', 'P3'],
          ]}
          colWidths={[36, 22, 14, 16, 12]}
        />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'RISQUES P1 — PLANS D\'ACTION' : 'P1 RISKS — ACTION PLANS'}</SectionLabel>
        <TwoColumn
          left={
            <View>
              <Text style={s.h4}>{isFr ? 'Exposition géopolitique' : 'Geopolitical exposure'}</Text>
              <BulletList
                items={isFr
                  ? [
                      'Signature câble 2Africa (décision COMEX)',
                      'Diversification 2e opérateur sous-marin (T2 2026)',
                      'Plan de continuité revu trimestriellement',
                    ]
                  : [
                      '2Africa cable signature (board decision)',
                      'Diversification of 2nd submarine operator (Q2 2026)',
                      'Continuity plan reviewed quarterly',
                    ]}
              />
            </View>
          }
          right={
            <View>
              <Text style={s.h4}>{isFr ? 'Concentration client GPU' : 'GPU client concentration'}</Text>
              <BulletList
                items={isFr
                  ? [
                      'Négociation anticipée contrat stratégique',
                      'Extension à 36 mois (vs 12 actuellement)',
                      'Développement pipeline SMB (8 prospects)',
                    ]
                  : [
                      'Early strategic contract negotiation',
                      '36-month extension (vs 12 currently)',
                      'SMB pipeline development (8 prospects)',
                    ]}
              />
            </View>
          }
        />

        <PDFFooter pageNumber={4} locale={locale} />
      </Page>

      {/* PAGE 5: COMPLIANCE STATUS */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Statut Conformité' : 'Compliance Status'} type={isFr ? 'PAGE 5' : 'PAGE 5'} />

        <SectionLabel>{isFr ? 'TABLEAU DE BORD RÉGULATEURS' : 'REGULATOR DASHBOARD'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Régulateur' : 'Regulator', isFr ? 'Référence' : 'Reference', isFr ? 'Statut' : 'Status', isFr ? 'Risque' : 'Risk', isFr ? 'Prochaine échéance' : 'Next deadline']}
          rows={[
            ['AMMC', isFr ? 'Loi 43-12' : 'Law 43-12', isFr ? 'Conforme' : 'Compliant', '18/100', isFr ? '15 mars 2026' : 'March 15, 2026'],
            ['BAM', isFr ? 'Circ. 04/W/2022' : 'Circular 04/W/2022', isFr ? 'Conforme' : 'Compliant', '22/100', isFr ? '30 juin 2026' : 'June 30, 2026'],
            ['CNDP', isFr ? 'Loi 09-08' : 'Law 09-08', isFr ? 'Surveillance' : 'Watchlist', '38/100', isFr ? '30 du mois' : '30th of month'],
            ['RGPD', isFr ? 'Règlement UE 2016/679' : 'EU Regulation 2016/679', isFr ? 'Surveillance' : 'Watchlist', '41/100', isFr ? 'Continu' : 'Continuous'],
            [isFr ? 'CCPA' : 'CCPA', isFr ? 'Cal. Civil Code §1798' : 'Cal. Civil Code §1798', isFr ? 'Conforme' : 'Compliant', '14/100', isFr ? '1 janvier 2026' : 'January 1, 2026'],
          ]}
          colWidths={[16, 24, 18, 14, 28]}
        />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'SCORE ESG — VUE D\'ENSEMBLE' : 'ESG SCORE — OVERVIEW'}</SectionLabel>
        <View style={{ marginBottom: t.spacing.md }}>
          <SpecRow label={isFr ? 'Pilier Environnement (E)' : 'Environmental pillar (E)'} value="78/100 — benchmark 72 (+6)" highlight />
          <SpecRow label={isFr ? 'Pilier Social (S)' : 'Social pillar (S)'} value="76/100 — benchmark 70 (+6)" highlight />
          <SpecRow label={isFr ? 'Pilier Gouvernance (G)' : 'Governance pillar (G)'} value="68/100 — benchmark 72 (-4)" highlight />
          <SpecRow label={isFr ? 'Score ESG global pondéré' : 'Weighted global ESG score'} value="74/100 — benchmark 71 (+3)" highlight />
        </View>

        <SectionDivider />

        <SectionLabel>{isFr ? 'CERTIFICATIONS ACTIVES' : 'ACTIVE CERTIFICATIONS'}</SectionLabel>
        <BadgeGroup
          badges={[
            'ISO 27001:2022',
            'SOC 2 Type II',
            'PCI DSS Level 1',
            'ISO 9001:2015',
            'ISO 14001:2015',
            'ISO 45001:2018',
            'CNDP — Agrément',
            'GRI Standards 2021',
          ]}
        />

        <PDFFooter pageNumber={5} locale={locale} />
      </Page>

      {/* PAGE 6: RECOMMENDATIONS + CTA */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Recommandations & Prochaines Étapes' : 'Recommendations & Next Steps'} type={isFr ? 'PAGE 6' : 'PAGE 6'} />

        <SectionLabel>{isFr ? 'RECOMMANDATIONS STRATÉGIQUES' : 'STRATEGIC RECOMMENDATIONS'}</SectionLabel>
        <DataTable
          headers={[isFr ? '#' : '#', isFr ? 'Recommandation' : 'Recommendation', isFr ? 'Horizon' : 'Horizon', isFr ? 'Décision' : 'Decision']}
          rows={[
            ['1', isFr ? 'Approuver signature câble 2Africa (CAPEX 4,2 M€)' : 'Approve 2Africa cable signature (CAPEX 4.2 M€)', isFr ? '30 jours' : '30 days', isFr ? 'COMEX' : 'Board'],
            ['2', isFr ? 'Mandater négociation extension contrat GPU (36 mois)' : 'Mandate GPU contract extension negotiation (36 months)', isFr ? '60 jours' : '60 days', isFr ? 'COMEX' : 'Board'],
            ['3', isFr ? 'Recruter 2 administrateurs indépendants (ESG G)' : 'Recruit 2 independent directors (ESG G)', isFr ? 'T1 2026' : 'Q1 2026', isFr ? 'COMEX' : 'Board'],
            ['4', isFr ? 'Valider programme ESG 2026 (budget 1,8 M€)' : 'Validate 2026 ESG program (budget 1.8 M€)', isFr ? '30 jours' : '30 days', isFr ? 'COMEX' : 'Board'],
            ['5', isFr ? 'Finaliser déclarations CNDP en retard (3)' : 'Finalize late CNDP declarations (3)', isFr ? '30 du mois' : '30th of month', isFr ? 'Direction' : 'Management'],
            ['6', isFr ? 'Lancer audit ESG externe (tierce partie)' : 'Launch external ESG audit (third party)', isFr ? 'T3 2026' : 'Q3 2026', isFr ? 'Direction' : 'Management'],
          ]}
          colWidths={[6, 56, 18, 20]}
        />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'PROCHAINES ÉTAPES — COMEX' : 'NEXT STEPS — BOARD'}</SectionLabel>
        <TwoColumn
          left={
            <View>
              <Text style={s.h4}>{isFr ? 'À 30 jours' : 'Within 30 days'}</Text>
              <BulletList
                items={isFr
                  ? [
                      'Finaliser déclarations CNDP',
                      'Lancer due diligence câble 2Africa',
                      'Briefing investisseurs Q4',
                    ]
                  : [
                      'Finalize CNDP declarations',
                      'Launch 2Africa cable due diligence',
                      'Q4 investor briefing',
                    ]}
              />
            </View>
          }
          right={
            <View>
              <Text style={s.h4}>{isFr ? 'À 90 jours' : 'Within 90 days'}</Text>
              <BulletList
                items={isFr
                  ? [
                      'Négociation contrat GPU (36 mois)',
                      'Recrutement administrateurs indépendants',
                      'Validation programme ESG 2026',
                    ]
                  : [
                      'GPU contract negotiation (36 months)',
                      'Independent directors recruitment',
                      '2026 ESG program validation',
                    ]}
              />
            </View>
          }
        />

        <SectionDivider />

        <Callout accentColor={t.colors.success}>
          {isFr
            ? 'Le trimestre confirme la trajectoire de croissance et la solidité de la posture de conformité. Les 6 recommandations ci-dessus sont priorisées par impact financier et risque réglementaire. Le COMEX est invité à approuver les décisions 1, 2, 3 et 4 lors de la prochaine séance.'
            : 'The quarter confirms the growth trajectory and the solidity of the compliance posture. The 6 recommendations above are prioritized by financial impact and regulatory risk. The board is invited to approve decisions 1, 2, 3 and 4 at the next session.'}
        </Callout>

        <CTABox
          title={isFr ? 'Documents complémentaires disponibles' : 'Additional documents available'}
          text={isFr
            ? 'Le briefing COMEX one-page, le rapport ESG détaillé (4 pages) et le rapport conformité (4 pages) sont disponibles dans la galerie de modèles PDF board-ready.'
            : 'The one-page COMEX briefing, the detailed ESG report (4 pages) and the compliance report (4 pages) are available in the board-ready PDF template gallery.'}
          locale={locale}
        />

        <PDFFooter pageNumber={6} locale={locale} />
      </Page>
    </Document>
  );
};
