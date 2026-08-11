/**
 * HarchCorp Compliance Cockpit — Regulatory Report
 * 4-page report: cover, regulator panels, audit trail, risk score + remediation roadmap
 * Generated from the EnterpriseDashboard "Compliance Cockpit" section.
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

interface ComplianceReportProps {
  locale?: 'en' | 'fr';
}

export const ComplianceReport: React.FC<ComplianceReportProps> = ({ locale = 'fr' }) => {
  const isFr = locale === 'fr';

  return (
    <Document
      title={isFr ? 'Compliance Cockpit — HarchCorp' : 'Compliance Cockpit — HarchCorp'}
      author="HarchCorp SARL"
      subject={isFr ? 'Rapport réglementaire — conformité multi-régulateurs' : 'Regulatory report — multi-regulator compliance'}
      creator="HarchCorp PDF Generator"
    >
      {/* COVER */}
      <Page size="A4" style={s.page}>
        <CoverPage
          type={isFr ? 'COMPLIANCE COCKPIT' : 'COMPLIANCE COCKPIT'}
          title={isFr ? 'Rapport Réglementaire' : 'Regulatory Report'}
          subtitle={isFr
            ? 'Statut conformité multi-régulateurs, piste d\'audit, score de risque et feuille de route de remédiation'
            : 'Multi-regulator compliance status, audit trail, risk score and remediation roadmap'}
          locale={locale}
          version="1.0"
        />
      </Page>

      {/* PAGE 2: REGULATOR PANELS */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Statut Conformité — Régulateurs' : 'Compliance Status — Regulators'} type={isFr ? 'PAGE 2' : 'PAGE 2'} />

        <SectionLabel>{isFr ? 'INDICATEURS GLOBAUX' : 'GLOBAL INDICATORS'}</SectionLabel>
        <MetricRow
          metrics={[
            { value: '32', label: isFr ? 'Risque global' : 'Global risk', unit: '/100' },
            { value: '5', label: isFr ? 'Régulateurs suivis' : 'Regulators tracked', unit: isFr ? 'actifs' : 'active' },
            { value: '1', label: isFr ? 'Non-conformités' : 'Non-compliances', unit: 'P1' },
            { value: '2', label: isFr ? 'Surveillance' : 'Watchlist', unit: isFr ? 'à surveiller' : 'to monitor' },
          ]}
        />

        <SectionDivider accent />

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

        <SectionDivider />

        <SectionLabel>{isFr ? 'CERTIFICATIONS ACTIVES' : 'ACTIVE CERTIFICATIONS'}</SectionLabel>
        <BadgeGroup
          badges={[
            'ISO 27001:2022',
            'SOC 2 Type II',
            'PCI DSS Level 1',
            'ISO 9001:2015',
            'CNDP — Agrément',
            isFr ? 'Hébergeur de données de santé' : 'Health data host',
          ]}
        />

        <PDFFooter pageNumber={2} locale={locale} />
      </Page>

      {/* PAGE 3: AUDIT TRAIL */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Piste d\'Audit — 30 Derniers Jours' : 'Audit Trail — Last 30 Days'} type={isFr ? 'PAGE 3' : 'PAGE 3'} />

        <SectionLabel>{isFr ? 'ÉVÉNEMENTS DE CONFORMITÉ' : 'COMPLIANCE EVENTS'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Date' : 'Date', isFr ? 'Utilisateur' : 'User', isFr ? 'Action' : 'Action', isFr ? 'Section' : 'Section']}
          rows={[
            [isFr ? 'Aujourd\'hui −4h' : 'Today -4h', 'Karim B.', isFr ? 'Connexion dashboard entreprise' : 'Enterprise dashboard login', 'Session'],
            [isFr ? 'Aujourd\'hui −5h' : 'Today -5h', 'Salma E.', isFr ? 'Statut AMMC → Surveillance' : 'AMMC status → Watchlist', 'Compliance Cockpit'],
            [isFr ? 'Aujourd\'hui −8h' : 'Today -8h', 'Karim B.', isFr ? 'Export PDF briefing COMEX' : 'COMEX briefing PDF export', 'Board Briefing'],
            [isFr ? 'Hier' : 'Yesterday', 'Younes T.', isFr ? 'Approbation revue risques critiques' : 'Critical risks review approval', 'Risk Heatmap'],
            [isFr ? 'Hier −3h' : 'Yesterday -3h', 'Aicha L.', isFr ? 'Ajout échéance CNDP (30 novembre)' : 'Added CNDP deadline (Nov 30)', 'Regulatory Calendar'],
            [isFr ? 'Il y a 3 jours' : '3 days ago', 'Sophie M.', isFr ? 'Génération clé API (intégration)' : 'API key generation (integration)', 'API Keys'],
            [isFr ? 'Il y a 5 jours' : '5 days ago', 'Salma E.', isFr ? 'Mise à jour sections briefing COMEX' : 'Updated COMEX briefing sections', 'Board PDF Templates'],
          ]}
          colWidths={[14, 14, 48, 24]}
        />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'MESURES CORRECTIVES EN COURS' : 'CORRECTIVE ACTIONS IN PROGRESS'}</SectionLabel>
        <BulletList
          items={isFr
            ? [
                'CNDP : finalisation des 3 déclarations de traitement en retard (propriétaire : Salma E., échéance : 30 du mois)',
                'RGPD : revue des mentions de consentement collecte B2C (propriétaire : Sophie M., échéance : 15 du mois prochain)',
                'Audit interne BAM : préparation des pièces justificatives (propriétaire : Karim B., échéance : 20 du mois prochain)',
              ]
            : [
                'CNDP: finalization of 3 late processing declarations (owner: Salma E., deadline: 30th of month)',
                'GDPR: review of B2C collection consent notices (owner: Sophie M., deadline: 15th of next month)',
                'BAM internal audit: preparation of supporting documents (owner: Karim B., deadline: 20th of next month)',
              ]}
        />

        <PDFFooter pageNumber={3} locale={locale} />
      </Page>

      {/* PAGE 4: RISK SCORE + ROADMAP + CTA */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Score de Risque & Feuille de Route' : 'Risk Score & Roadmap'} type={isFr ? 'PAGE 4' : 'PAGE 4'} />

        <SectionLabel>{isFr ? 'DÉCOMPOSITION DU SCORE DE RISQUE' : 'RISK SCORE BREAKDOWN'}</SectionLabel>
        <View style={{ marginBottom: t.spacing.md }}>
          <SpecRow label={isFr ? 'Risque AMMC' : 'AMMC risk'} value="18/100" highlight />
          <SpecRow label={isFr ? 'Risque BAM' : 'BAM risk'} value="22/100" />
          <SpecRow label={isFr ? 'Risque CNDP' : 'CNDP risk'} value="38/100" highlight />
          <SpecRow label={isFr ? 'Risque RGPD' : 'GDPR risk'} value="41/100" highlight />
          <SpecRow label={isFr ? 'Risque CCPA' : 'CCPA risk'} value="14/100" />
          <SpecRow label={isFr ? 'Score global pondéré' : 'Weighted global score'} value="32/100" highlight />
        </View>

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'FEUILLE DE ROUTE — 90 JOURS' : 'ROADMAP — 90 DAYS'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Échéance' : 'Deadline', isFr ? 'Action' : 'Action', isFr ? 'Propriétaire' : 'Owner', isFr ? 'Priorité' : 'Priority']}
          rows={[
            [isFr ? '30 du mois' : '30th of month', isFr ? 'Déclarations CNDP en retard' : 'Late CNDP declarations', 'Salma E.', 'P1'],
            [isFr ? '15 mois +1' : '15th next month', isFr ? 'Revue mentions consentement RGPD' : 'GDPR consent review', 'Sophie M.', 'P2'],
            [isFr ? '20 mois +1' : '20th next month', isFr ? 'Préparation audit BAM' : 'BAM audit preparation', 'Karim B.', 'P2'],
            [isFr ? 'Fin Q1 2026' : 'End Q1 2026', isFr ? 'Recertification ISO 27001' : 'ISO 27001 recertification', 'Salma E.', 'P1'],
            [isFr ? 'Fin Q2 2026' : 'End Q2 2026', isFr ? 'Audit externe SOC 2 Type II' : 'SOC 2 Type II external audit', 'Karim B.', 'P2'],
          ]}
          colWidths={[18, 42, 22, 18]}
        />

        <SectionDivider />

        <Callout accentColor={t.colors.success}>
          {isFr
            ? 'HarchCorp maintient une posture de conformité solide avec un score global pondéré de 32/100 — sous le seuil de surveillance (40/100). Les 2 régulateurs en statut surveillance (CNDP, RGPD) disposent de plans de remédiation à échéance 30 jours.'
            : 'HarchCorp maintains a solid compliance posture with a weighted global score of 32/100 — below the watchlist threshold (40/100). The 2 regulators in watchlist status (CNDP, GDPR) have 30-day remediation plans.'}
        </Callout>

        <CTABox
          title={isFr ? 'Besoin du dossier d\'audit complet ?' : 'Need the full audit file?'}
          text={isFr
            ? 'Le dossier d\'audit incluant les pièces justificatives, les rapports d\'inspection et les DPA est disponible sur demande auprès du pôle conformité.'
            : 'The audit file including supporting documents, inspection reports and DPAs is available on request from the compliance team.'}
          locale={locale}
        />

        <PDFFooter pageNumber={4} locale={locale} />
      </Page>
    </Document>
  );
};
