/**
 * HarchCorp Network & Connectivity Datasheet
 * 2-page datasheet matching Equinix/Microsoft network specs
 */
import React from 'react';
import { Document, Page, Text, View, Font } from '@react-pdf/renderer';
import { CoverPage, PageHeaderBar, PDFFooter, SectionLabel, MetricRow, DataTable, BulletList, SpecRow, Callout, CTABox, SectionDivider, TwoColumn, BadgeGroup } from '../templates/components';
import { pdfStyles as s } from '../templates/styles';
import { HarchTheme as t } from '../templates/theme';
import { networkData as net } from '../data/network';

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

interface NetworkDatasheetProps {
  locale?: 'en' | 'fr';
}

export const NetworkDatasheet: React.FC<NetworkDatasheetProps> = ({ locale = 'en' }) => {
  const isFr = locale === 'fr';

  return (
    <Document
      title={isFr ? 'Réseau & Connectivité — HarchCorp' : 'Network & Connectivity — HarchCorp'}
      author="HarchCorp SARL"
      subject={isFr ? 'Fiche technique réseau et connectivité' : 'Network and Connectivity Datasheet'}
      creator="HarchCorp PDF Generator"
    >
      {/* COVER */}
      <Page size="A4" style={s.page}>
        <CoverPage
          type={isFr ? 'FICHE TECHNIQUE' : 'DATASHEET'}
          title={isFr ? 'Réseau & Connectivité' : 'Network & Connectivity'}
          subtitle={isFr
            ? 'Passerelle sous-marine Europe-Afrique — Backbone 8 Tbps — Peering direct dans 5+ IX'
            : 'Europe-Africa Submarine Gateway — 8 Tbps Backbone — Direct Peering at 5+ IX'}
          locale={locale}
          version="1.0"
        />
      </Page>

      {/* PAGE 2: BACKBONE + SUBMARINE + LATENCY */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Infrastructure Réseau' : 'Network Infrastructure'} />

        <SectionLabel>{isFr ? 'BACKBONE' : 'BACKBONE'}</SectionLabel>
        <View style={{ marginBottom: t.spacing.lg }}>
          <SpecRow label={isFr ? 'Capacité Totale' : 'Total Capacity'} value={net.backbone.totalCapacity} highlight />
          <SpecRow label={isFr ? 'Technologie' : 'Technology'} value={net.backbone.technology} />
          <SpecRow label={isFr ? 'Topologie' : 'Topology'} value={net.backbone.topology} />
          <SpecRow label={isFr ? 'Fibre' : 'Fiber'} value={net.backbone.fiber} />
          <SpecRow label={isFr ? 'Latence Intra-DC' : 'Intra-DC Latency'} value={net.backbone.latency} />
        </View>

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'CÂBLES SOUS-MARINS' : 'SUBMARINE CABLES'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Câble' : 'Cable', isFr ? 'Longueur' : 'Length', isFr ? 'Capacité' : 'Capacity', isFr ? 'Statut' : 'Status']}
          rows={net.submarineCables.map(c => [c.name, c.length, c.capacity, c.status])}
          colWidths={[30, 20, 25, 25]}
        />

        <SectionDivider />

        <SectionLabel>{isFr ? 'LATENCE DEPUIS DAKHLA' : 'LATENCY FROM DAKHLA'}</SectionLabel>
        <TwoColumn
          left={
            <View>
              <Text style={s.h4}>{isFr ? 'Afrique' : 'Africa'}</Text>
              {net.latencyTable.filter(l =>
                ['Dakar', 'Lagos', 'Accra', 'Abidjan', 'Nairobi', 'Johannesburg'].some(d => l.destination.includes(d))
              ).map((l, i) => (
                <SpecRow key={i} label={l.destination} value={l.latency} highlight={l.latency.includes('15')} />
              ))}
            </View>
          }
          right={
            <View>
              <Text style={s.h4}>{isFr ? 'Europe' : 'Europe'}</Text>
              {net.latencyTable.filter(l =>
                ['Casablanca', 'Lisbon', 'Madrid', 'Paris', 'London', 'Frankfurt'].some(d => l.destination.includes(d))
              ).map((l, i) => (
                <SpecRow key={i} label={l.destination} value={l.latency} highlight={l.latency.includes('8')} />
              ))}
            </View>
          }
        />

        <PDFFooter pageNumber={2} locale={locale} />
      </Page>

      {/* PAGE 3: PEERING + FEATURES */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Peering & Caractéristiques' : 'Peering & Features'} />

        <SectionLabel>{isFr ? 'POINTS D\'ÉCHANGE INTERNET' : 'INTERNET EXCHANGE POINTS'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'IX' : 'IX', isFr ? 'Localisation' : 'Location', isFr ? 'Pairs' : 'Peers']}
          rows={net.peering.ixPoints.map(ix => [ix.name, ix.location, ix.peers])}
          colWidths={[35, 35, 30]}
        />

        <SectionDivider />

        <SectionLabel>{isFr ? 'CLOUD ON-RAMPS' : 'CLOUD ON-RAMPS'}</SectionLabel>
        <BadgeGroup badges={net.peering.cloudOnRamps} />

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'ROUTES TERRESTRES' : 'TERRESTRIAL ROUTES'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Route' : 'Route', isFr ? 'Technologie' : 'Technology', isFr ? 'Capacité' : 'Capacity', isFr ? 'Latence' : 'Latency']}
          rows={net.terrestrialRoutes.map(r => [r.route, r.technology, r.capacity, r.latency])}
          colWidths={[30, 30, 20, 20]}
        />

        <SectionDivider />

        <SectionLabel>{isFr ? 'CARACTÉRISTIQUES RÉSEAU' : 'NETWORK FEATURES'}</SectionLabel>
        <BulletList items={net.features} />

        <Callout>
          {isFr
            ? 'Position stratégique unique — Dakhla est le seul point de présence au monde offrant un accès direct aux câbles sous-marins ACE, avec une latence sub-35ms vers les 5 principaux hubs européens ET les 6 principaux marchés ouest-africains.'
            : 'Unique strategic position — Dakhla is the only point of presence in the world offering direct access to ACE submarine cables, with sub-35ms latency to the 5 major European hubs AND 6 major West African markets.'}
        </Callout>

        <CTABox
          title={isFr ? 'Connectez votre infrastructure' : 'Connect your infrastructure'}
          text={isFr
            ? 'Cross-connects, interconnexions cloud et liens dédiés disponibles. Contactez notre équipe réseau.'
            : 'Cross-connects, cloud interconnects, and dedicated links available. Contact our network team.'}
          locale={locale}
        />

        <PDFFooter pageNumber={3} locale={locale} />
      </Page>
    </Document>
  );
};
