/**
 * HarchCorp Board Briefing — Executive Synthesis
 * 3-page board-ready briefing: cover, executive synthesis, decisions & next steps
 * Generated dynamically from the EnterpriseDashboard "Generateur Briefing Board-Ready" section.
 */
import React from 'react';
import { Document, Page, Text, View, Font } from '@react-pdf/renderer';
import {
  CoverPage,
  PageHeaderBar,
  PDFFooter,
  SectionLabel,
  MetricRow,
  BulletList,
  Callout,
  CTABox,
  SectionDivider,
  TwoColumn,
  SpecRow,
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

interface BoardBriefingProps {
  locale?: 'en' | 'fr';
}

export const BoardBriefing: React.FC<BoardBriefingProps> = ({ locale = 'fr' }) => {
  const isFr = locale === 'fr';

  return (
    <Document
      title={isFr ? 'Briefing Board-Ready — HarchCorp' : 'Board Briefing — HarchCorp'}
      author="HarchCorp SARL"
      subject={isFr ? 'Synthèse exécutive pour le COMEX' : 'Executive synthesis for the board'}
      creator="HarchCorp PDF Generator"
    >
      {/* COVER */}
      <Page size="A4" style={s.page}>
        <CoverPage
          type={isFr ? 'BRIEFING BOARD-READY' : 'BOARD BRIEFING'}
          title={isFr ? 'Synthèse Exécutive' : 'Executive Synthesis'}
          subtitle={isFr
            ? 'Document stratégique hebdomadaire — réputation, risques clés, décisions attendues par le COMEX'
            : 'Weekly strategic document — reputation, key risks, decisions required by the board'}
          locale={locale}
          version="1.0"
        />
      </Page>

      {/* PAGE 2: SCORE + RISKS */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Score de Réputation & Risques Clés' : 'Reputation Score & Key Risks'} type={isFr ? 'PAGE 2' : 'PAGE 2'} />

        <SectionLabel>{isFr ? 'INDICATEURS PRINCIPAUX' : 'KEY INDICATORS'}</SectionLabel>
        <MetricRow
          metrics={[
            { value: '78', label: isFr ? 'Score de réputation' : 'Reputation score', unit: '/100' },
            { value: '+4', label: isFr ? 'Variation 30 jours' : '30-day change', unit: 'pts' },
            { value: '12', label: isFr ? 'Risques actifs' : 'Active risks', unit: isFr ? 'suivis' : 'tracked' },
            { value: '3', label: isFr ? 'Risques critiques' : 'Critical risks', unit: 'P1' },
          ]}
        />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'RISQUES CLÉS — ORDRE DE PRIORITÉ' : 'KEY RISKS — PRIORITY ORDER'}</SectionLabel>
        <Text style={s.h4}>{isFr ? 'Risque #1 — Exposition géopolitique' : 'Risk #1 — Geopolitical exposure'}</Text>
        <BulletList
          items={isFr
            ? [
                'Souveraineté des câbles sous-marins : dépendance 38 % à un opérateur tiers',
                'Évolution réglementaire UE sur les transferts de données extra-UE',
                'Recommandation : accélérer la signature du câble 2Africa pour diversification',
              ]
            : [
                'Submarine cable sovereignty: 38% dependency on a single third-party operator',
                'EU regulatory evolution on extra-EU data transfers',
                'Recommendation: accelerate 2Africa cable signature for diversification',
              ]}
        />

        <Text style={s.h4}>{isFr ? 'Risque #2 — Concentration client GPU' : 'Risk #2 — GPU client concentration'}</Text>
        <BulletList
          items={isFr
            ? [
                'Top-3 clients = 61 % du chiffre d\'affaires GPU compute',
                'Renouvellement Q4 d\'un contrat stratégique (24 % du CA)',
                'Recommandation : négociation anticipée + extension à 36 mois',
              ]
            : [
                'Top-3 clients = 61% of GPU compute revenue',
                'Q4 renewal of a strategic contract (24% of revenue)',
                'Recommendation: early negotiation + 36-month extension',
              ]}
        />

        <Text style={s.h4}>{isFr ? 'Risque #3 — Conformité CNDP' : 'Risk #3 — CNDP compliance'}</Text>
        <BulletList
          items={isFr
            ? [
                'Déclaration des traitements : 3 traitements en retard de déclaration',
                'Audit interne CNDP programmé le 30 du mois courant',
                'Recommandation : finaliser les déclarations avant l\'audit',
              ]
            : [
                'Processing declarations: 3 declarations late',
                'Internal CNDP audit scheduled for the 30th of this month',
                'Recommendation: finalize declarations before the audit',
              ]}
        />

        <Callout accentColor={t.colors.success}>
          {isFr
            ? 'Le score de réputation progresse de 4 points sur 30 jours, porté par la couverture média du nouveau datacenter de Dakhla. La perception institutionnelle reste solide (88/100), mais la perception B2B affiche une légère érosion (−2 pts) à surveiller.'
            : 'Reputation score increased by 4 points over 30 days, driven by media coverage of the new Dakhla data center. Institutional perception remains strong (88/100), but B2B perception shows slight erosion (-2 pts) to monitor.'}
        </Callout>

        <PDFFooter pageNumber={2} locale={locale} />
      </Page>

      {/* PAGE 3: DECISIONS + NEXT STEPS */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Décisions Attendues & Prochaines Étapes' : 'Decisions Required & Next Steps'} type={isFr ? 'PAGE 3' : 'PAGE 3'} />

        <SectionLabel>{isFr ? 'DÉCISIONS ATTENDUES DU COMEX' : 'BOARD DECISIONS REQUIRED'}</SectionLabel>
        <View style={{ marginBottom: t.spacing.md }}>
          <SpecRow label={isFr ? 'DÉCISION 1 — Câble 2Africa' : 'DECISION 1 — 2Africa cable'} value={isFr ? 'Approbation signature (CAPEX 4,2 M€)' : 'Signature approval (CAPEX 4.2 M€)'} highlight />
          <SpecRow label={isFr ? 'DÉCISION 2 — Contrat GPU stratégique' : 'DECISION 2 — Strategic GPU contract'} value={isFr ? 'Mandat négociation 36 mois' : '36-month negotiation mandate'} highlight />
          <SpecRow label={isFr ? 'DÉCISION 3 — Programme ESG 2026' : 'DECISION 3 — 2026 ESG program'} value={isFr ? 'Allocation budget 1,8 M€' : 'Budget allocation 1.8 M€'} highlight />
        </View>

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'PROCHAINES ÉTAPES — 30 JOURS' : 'NEXT STEPS — 30 DAYS'}</SectionLabel>
        <TwoColumn
          left={
            <View>
              <Text style={s.h4}>{isFr ? 'Semaine 1-2' : 'Week 1-2'}</Text>
              <BulletList
                items={isFr
                  ? [
                      'Finaliser les déclarations CNDP en retard',
                      'Lancer la due diligence câble 2Africa',
                      'Briefing équipe investisseurs (Q4 roadmap)',
                    ]
                  : [
                      'Finalize late CNDP declarations',
                      'Launch 2Africa cable due diligence',
                      'Investor team briefing (Q4 roadmap)',
                    ]}
              />
            </View>
          }
          right={
            <View>
              <Text style={s.h4}>{isFr ? 'Semaine 3-4' : 'Week 3-4'}</Text>
              <BulletList
                items={isFr
                  ? [
                      'Audit interne CNDP (30 du mois)',
                      'Négociation contrat GPU stratégique',
                      'Validation programme ESG 2026',
                    ]
                  : [
                      'Internal CNDP audit (30th of month)',
                      'Strategic GPU contract negotiation',
                      '2026 ESG program validation',
                    ]}
              />
            </View>
          }
        />

        <SectionDivider />

        <SectionLabel>{isFr ? 'CONTACT & SUIVI' : 'CONTACT & FOLLOW-UP'}</SectionLabel>
        <Text style={s.body}>
          {isFr
            ? 'Ce briefing est généré automatiquement chaque lundi à 06h00 (heure de Casablanca) à partir des données consolidées du tableau de bord entreprise. Pour toute question, contacter le secrétariat du COMEX.'
            : 'This briefing is automatically generated every Monday at 06:00 (Casablanca time) from the consolidated enterprise dashboard data. For any question, contact the board secretariat.'}
        </Text>

        <CTABox
          title={isFr ? 'Briefing détaillé disponible' : 'Detailed briefing available'}
          text={isFr
            ? 'Le rapport trimestriel complet (12 pages) et la cartographie géopolitique sont disponibles dans la galerie de modèles PDF board-ready.'
            : 'The full quarterly report (12 pages) and the geopolitical mapping are available in the board-ready PDF template gallery.'}
          locale={locale}
        />

        <PDFFooter pageNumber={3} locale={locale} />
      </Page>
    </Document>
  );
};
