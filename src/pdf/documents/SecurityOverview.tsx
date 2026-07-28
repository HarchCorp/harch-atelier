/**
 * HarchCorp Security & Compliance Overview
 * 4-page document matching Google Security Whitepaper format
 */
import React from 'react';
import { Document, Page, Text, View, Font } from '@react-pdf/renderer';
import { CoverPage, PageHeaderBar, PDFFooter, SectionLabel, DataTable, BulletList, BadgeGroup, Callout, CTABox, SectionDivider, TwoColumn, SpecRow } from '../templates/components';
import { pdfStyles as s } from '../templates/styles';
import { HarchTheme as t } from '../templates/theme';
import { securityData as sec } from '../data/security';

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

interface SecurityOverviewProps {
  locale?: 'en' | 'fr';
}

export const SecurityOverview: React.FC<SecurityOverviewProps> = ({ locale = 'en' }) => {
  const isFr = locale === 'fr';

  return (
    <Document
      title={isFr ? 'Sécurité & Conformité — HarchCorp' : 'Security & Compliance — HarchCorp'}
      author="HarchCorp SARL"
      subject={isFr ? 'Aperçu de la sécurité et de la conformité' : 'Security and Compliance Overview'}
      creator="HarchCorp PDF Generator"
    >
      {/* COVER */}
      <Page size="A4" style={s.page}>
        <CoverPage
          type={isFr ? 'SÉCURITÉ & CONFORMITÉ' : 'SECURITY & COMPLIANCE'}
          title={isFr ? 'Sécurité & Conformité' : 'Security & Compliance'}
          subtitle={isFr
            ? 'Présentation complète de notre approche de sécurité multicouche, certifications et conformité réglementaire'
            : 'Comprehensive overview of our multi-layered security approach, certifications, and regulatory compliance'}
          locale={locale}
          version="1.0"
        />
      </Page>

      {/* PAGE 2: PHYSICAL + NETWORK SECURITY */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Sécurité Physique & Réseau' : 'Physical & Network Security'} />

        <SectionLabel>{isFr ? 'SÉCURITÉ PHYSIQUE' : 'PHYSICAL SECURITY'}</SectionLabel>
        <Text style={s.h4}>{isFr ? 'Périmètre & Accès' : 'Perimeter & Access'}</Text>
        <BulletList items={sec.physical.perimeter} />

        <Text style={s.h4}>{isFr ? 'Contrôle d\'Accès' : 'Access Control'}</Text>
        <BulletList items={sec.physical.access} />

        <Text style={s.h4}>{isFr ? 'Surveillance' : 'Surveillance'}</Text>
        <BulletList items={sec.physical.surveillance} />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'SÉCURITÉ RÉSEAU' : 'NETWORK SECURITY'}</SectionLabel>
        <TwoColumn
          left={
            <View>
              <Text style={s.h4}>{isFr ? 'Protection Périmétrique' : 'Perimeter Protection'}</Text>
              <BulletList items={sec.network.perimeter} />
            </View>
          }
          right={
            <View>
              <Text style={s.h4}>{isFr ? 'Surveillance & Détection' : 'Monitoring & Detection'}</Text>
              <BulletList items={sec.network.monitoring} />
            </View>
          }
        />

        <Text style={s.h4}>{isFr ? 'Chiffrement' : 'Encryption'}</Text>
        <BulletList items={sec.network.encryption} />

        <PDFFooter pageNumber={2} locale={locale} />
      </Page>

      {/* PAGE 3: APPLICATION SECURITY + CERTIFICATIONS */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Sécurité Applicative & Certifications' : 'Application Security & Certifications'} />

        <SectionLabel>{isFr ? 'SÉCURITÉ APPLICATIVE' : 'APPLICATION SECURITY'}</SectionLabel>
        <TwoColumn
          left={
            <View>
              <Text style={s.h4}>{isFr ? 'Développement' : 'Development'}</Text>
              <BulletList items={sec.application.development} />
            </View>
          }
          right={
            <View>
              <Text style={s.h4}>{isFr ? 'Opérations' : 'Operations'}</Text>
              <BulletList items={sec.application.operations} />
            </View>
          }
        />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'CERTIFICATIONS' : 'CERTIFICATIONS'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Certification' : 'Certification', isFr ? 'Description' : 'Description', isFr ? 'Statut' : 'Status', isFr ? 'Auditeur' : 'Auditor']}
          rows={sec.certifications.map(c => [
            c.name,
            c.description.substring(0, 50),
            c.status,
            c.auditor,
          ])}
          colWidths={[22, 30, 15, 33]}
        />

        <SectionDivider />

        <SectionLabel>{isFr ? 'RÉPONSE AUX INCIDENTS' : 'INCIDENT RESPONSE'}</SectionLabel>
        <View style={{ marginBottom: t.spacing.md }}>
          <SpecRow label={isFr ? 'Temps de Réponse P1' : 'P1 Response Time'} value={sec.incidentResponse.responseTime} highlight />
          <SpecRow label={isFr ? 'Notification Client' : 'Customer Notification'} value={sec.incidentResponse.communication} />
          <SpecRow label={isFr ? 'Post-Mortem' : 'Post-Mortem'} value={sec.incidentResponse.postMortem} />
          <SpecRow label={isFr ? 'Bug Bounty' : 'Bug Bounty'} value={sec.incidentResponse.bugBounty} />
          <SpecRow label={isFr ? 'Tests de Pénétration' : 'Penetration Testing'} value={sec.incidentResponse.penetrationTesting} />
          <SpecRow label={isFr ? 'Exercices Red Team' : 'Red Team Exercises'} value={sec.incidentResponse.redTeam} />
        </View>

        <PDFFooter pageNumber={3} locale={locale} />
      </Page>

      {/* PAGE 4: COMPLIANCE + CTA */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Conformité Réglementaire' : 'Regulatory Compliance'} />

        <SectionLabel>{isFr ? 'PROTECTION DES DONNÉES' : 'DATA PROTECTION'}</SectionLabel>
        <BulletList items={sec.compliance.dataProtection} />

        <SectionDivider />

        <SectionLabel>{isFr ? 'CONFORMITÉ SECTORIELLE' : 'INDUSTRY COMPLIANCE'}</SectionLabel>
        <BulletList items={sec.compliance.industrySpecific} />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'RÉSUMÉ DES CERTIFICATIONS' : 'CERTIFICATION SUMMARY'}</SectionLabel>
        <BadgeGroup badges={sec.certifications.map(c => c.name)} />
        <BadgeGroup badges={[
          'Zero Trust Architecture',
          'SSDLC',
          'SOC 2 Type II',
          '24/7/365 SOC',
        ]} outline />

        <Callout>
          {isFr
            ? 'Souveraineté des données garantie — Toutes les données sont traitées et stockées au Maroc, avec conformité RGPD et loi 09-08. Clauses contractuelles types UE disponibles pour les transferts.'
            : 'Guaranteed data sovereignty — All data is processed and stored in Morocco, with GDPR and Law 09-08 compliance. EU Model Clauses available for transfers.'}
        </Callout>

        <CTABox
          title={isFr ? 'Besoin d\'un audit de sécurité ?' : 'Need a security audit?'}
          text={isFr
            ? 'Notre équipe sécurité peut vous fournir des rapports de conformité, des DPA et organiser des visites de notre centre de données.'
            : 'Our security team can provide compliance reports, DPAs, and arrange data center tours.'}
          locale={locale}
        />

        <PDFFooter pageNumber={4} locale={locale} />
      </Page>
    </Document>
  );
};
