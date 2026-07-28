/**
 * HarchCorp Data Center Technical Specification Sheet
 * 4-page spec sheet matching Equinix IBX format
 */
import React from 'react';
import { Document, Page, Text, View, Font } from '@react-pdf/renderer';
import { CoverPage, PageHeaderBar, PDFFooter, SectionLabel, MetricRow, DataTable, BulletList, SpecRow, BadgeGroup, Callout, CTABox, SectionDivider } from '../templates/components';
import { pdfStyles as s } from '../templates/styles';
import { HarchTheme as t } from '../templates/theme';
import { dakhlaDataCenter as dc } from '../data/dakhla-datacenter';

// Register fonts
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

interface DataCenterSpecSheetProps {
  locale?: 'en' | 'fr';
}

export const DataCenterSpecSheet: React.FC<DataCenterSpecSheetProps> = ({ locale = 'en' }) => {
  const isFr = locale === 'fr';

  return (
    <Document
      title={isFr ? `Fiche Technique — ${dc.name}` : `Technical Specification — ${dc.name}`}
      author="HarchCorp SARL"
      subject={isFr ? 'Fiche technique du centre de données' : 'Data Center Technical Specification'}
      creator="HarchCorp PDF Generator"
    >
      {/* ====== PAGE 1: COVER ====== */}
      <Page size="A4" style={s.page}>
        <CoverPage
          type={isFr ? 'FICHE TECHNIQUE' : 'TECHNICAL SPECIFICATION'}
          title={isFr ? 'Centre de Données Dakhla DC-1' : 'Data Center Dakhla DC-1'}
          subtitle={isFr
            ? 'Infrastructure Tier IV — Spécifications techniques complètes du premier centre de données de classe mondiale en Afrique du Nord'
            : 'Tier IV Infrastructure — Complete technical specifications for North Africa\'s first world-class data center'}
          locale={locale}
          version="1.0"
        />
      </Page>

      {/* ====== PAGE 2: OVERVIEW + ELECTRICAL ====== */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar
          type={dc.code}
          title={isFr ? 'Vue d\'ensemble & Électricité' : 'Overview & Electrical'}
        />

        {/* Overview Metrics */}
        <SectionLabel>{isFr ? 'VUE D\'ENSEMBLE' : 'OVERVIEW'}</SectionLabel>
        <MetricRow metrics={[
          { value: dc.overview.totalCapacity, label: isFr ? 'Puissance Totale' : 'Total Capacity' },
          { value: dc.overview.totalRacks, label: isFr ? 'Baies Serveurs' : 'Server Racks' },
          { value: dc.overview.totalArea, label: isFr ? 'Surface Totale' : 'Total Area' },
          { value: dc.type, label: isFr ? 'Certification' : 'Certification' },
        ]} />

        <SectionDivider accent />

        {/* Location */}
        <SectionLabel>{isFr ? 'LOCALISATION' : 'LOCATION'}</SectionLabel>
        <View style={{ flexDirection: 'row', marginBottom: t.spacing.lg }}>
          <View style={{ flex: 1 }}>
            <SpecRow label={isFr ? 'Ville' : 'City'} value={dc.location.city} />
            <SpecRow label={isFr ? 'Région' : 'Region'} value={dc.location.region} />
            <SpecRow label={isFr ? 'Pays' : 'Country'} value={dc.location.country} />
          </View>
          <View style={{ flex: 1 }}>
            <SpecRow label={isFr ? 'Coordonnées' : 'Coordinates'} value={dc.location.coordinates} />
            <SpecRow label={isFr ? 'Fuseau Horaire' : 'Timezone'} value={dc.location.timezone} />
            <SpecRow label={isFr ? 'Accès Côtier' : 'Coastal Access'} value={dc.location.coastalAccess} />
          </View>
        </View>

        <SectionDivider />

        {/* Electrical Specifications */}
        <SectionLabel>{isFr ? 'SPÉCIFICATIONS ÉLECTRIQUES' : 'ELECTRICAL SPECIFICATIONS'}</SectionLabel>
        <View style={{ marginBottom: t.spacing.lg }}>
          <SpecRow label={isFr ? 'Puissance Totale' : 'Total Power'} value={dc.electrical.totalPower} highlight />
          <SpecRow label={isFr ? 'Redondance' : 'Redundancy'} value={dc.electrical.redundancy} highlight />
          <SpecRow label={isFr ? 'Systèmes UPS' : 'UPS Systems'} value={dc.electrical.upsSystems} />
          <SpecRow label={isFr ? 'Autonomie UPS' : 'UPS Runtime'} value={dc.electrical.upsRuntime} />
          <SpecRow label={isFr ? 'Générateurs' : 'Generators'} value={dc.electrical.generators} />
          <SpecRow label={isFr ? 'Stockage Carburant' : 'Fuel Storage'} value={dc.electrical.generatorFuel} />
          <SpecRow label={isFr ? 'Configuration PDU' : 'PDU Config'} value={dc.electrical.pduConfig} />
          <SpecRow label={isFr ? 'Densité Standard' : 'Standard Density'} value={dc.electrical.powerDensityStandard} />
          <SpecRow label={isFr ? 'Densité Haute (AI/GPU)' : 'High Density (AI/GPU)'} value={dc.electrical.powerDensityHigh} highlight />
          <SpecRow label={isFr ? 'Sous-station' : 'Substation'} value={dc.electrical.transformer} />
        </View>

        <Callout>
          {isFr
            ? `PUE: ${dc.electrical.pue} — Le refroidissement par eau de mer et l'air gratuit permettent d'atteindre un PUE parmi les meilleurs au monde, comparable aux installations nordiques.`
            : `PUE: ${dc.electrical.pue} — Seawater cooling and free cooling achieve a PUE among the best in the world, comparable to Nordic installations.`}
        </Callout>

        <PDFFooter pageNumber={2} locale={locale} />
      </Page>

      {/* ====== PAGE 3: COOLING + FIRE + SECURITY ====== */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar
          type={dc.code}
          title={isFr ? 'Refroidissement & Sécurité' : 'Cooling & Security'}
        />

        {/* Cooling */}
        <SectionLabel>{isFr ? 'REFROIDISSEMENT' : 'COOLING'}</SectionLabel>
        <View style={{ marginBottom: t.spacing.lg }}>
          <SpecRow label={isFr ? 'Système Principal' : 'Primary System'} value={dc.cooling.primarySystem} highlight />
          <SpecRow label={isFr ? 'Système Secondaire' : 'Secondary System'} value={dc.cooling.secondarySystem} />
          <SpecRow label={isFr ? 'Capacité Standard' : 'Standard Capacity'} value={dc.cooling.coolingCapacityStandard} />
          <SpecRow label={isFr ? 'Capacité Haute (Liquid)' : 'High Capacity (Liquid)'} value={dc.cooling.coolingCapacityHigh} highlight />
          <SpecRow label={isFr ? 'Heures Air Gratuit' : 'Free Cooling Hours'} value={`${dc.cooling.freeCoolingHours}+ ${isFr ? 'heures/an' : 'hrs/year'}`} highlight />
          <SpecRow label={isFr ? 'Plancher Surélevé' : 'Raised Floor'} value={dc.cooling.raisedFloor} />
          <SpecRow label={isFr ? 'Température' : 'Temperature'} value={dc.cooling.temperature} />
          <SpecRow label={isFr ? 'Humidité' : 'Humidity'} value={dc.cooling.humidity} />
          <SpecRow label={isFr ? 'Redondance' : 'Redundancy'} value={dc.cooling.coolingRedundancy} />
          <SpecRow label={isFr ? 'Refroidissement Liquide' : 'Liquid Cooling'} value={dc.cooling.liquidCooling} />
          <SpecRow label={isFr ? 'Prise d\'Eau de Mer' : 'Seawater Intake'} value={dc.cooling.seawaterIntake} />
          <SpecRow label={isFr ? 'WUE' : 'WUE'} value={`${dc.cooling.wue} L/kWh`} highlight />
        </View>

        <SectionDivider />

        {/* Fire Prevention */}
        <SectionLabel>{isFr ? 'PRÉVENTION INCENDIE' : 'FIRE PREVENTION'}</SectionLabel>
        <BulletList items={[
          dc.fire.detection,
          dc.fire.suppression,
          dc.fire.zones,
          dc.fire.fireRated,
          dc.fire.gasMonitoring,
        ]} />

        <SectionDivider />

        {/* Physical Security */}
        <SectionLabel>{isFr ? 'SÉCURITÉ PHYSIQUE' : 'PHYSICAL SECURITY'}</SectionLabel>
        <BulletList items={[
          dc.security.physicalSecurity,
          dc.security.accessControl,
          dc.security.surveillance,
          dc.security.mantrap,
          dc.security.perimeter,
          dc.security.vehicleBarriers,
          dc.security.visitorPolicy,
          dc.security.cctvAi,
        ]} />

        <PDFFooter pageNumber={3} locale={locale} />
      </Page>

      {/* ====== PAGE 4: SUSTAINABILITY + NETWORK + CONTACT ====== */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar
          type={dc.code}
          title={isFr ? 'Durabilité & Connectivité' : 'Sustainability & Connectivity'}
        />

        {/* Sustainability Metrics */}
        <SectionLabel>{isFr ? 'DURABILITÉ' : 'SUSTAINABILITY'}</SectionLabel>
        <MetricRow metrics={[
          { value: dc.sustainability.pue, label: 'PUE' },
          { value: dc.sustainability.wue, label: `WUE (${isFr ? 'L/kWh' : 'L/kWh'})` },
          { value: dc.sustainability.renewableEnergy, label: isFr ? 'Énergie Renouvelable' : 'Renewable Energy' },
          { value: `${dc.sustainability.freeCooling}`, label: isFr ? 'Heures Air Gratuit' : 'Free Cooling Hrs' },
        ]} />

        <View style={{ marginBottom: t.spacing.md }}>
          <SpecRow label={isFr ? 'Sources Renouvelables' : 'Renewable Sources'} value={dc.sustainability.renewableSources} />
          <SpecRow label={isFr ? 'Intensité Carbone' : 'Carbon Intensity'} value={`${dc.sustainability.carbonIntensity} kgCO₂/kWh`} />
          <SpecRow label={isFr ? 'Cible Net-Zéro' : 'Net-Zero Target'} value={dc.sustainability.netZeroTarget} />
        </View>

        {/* Certifications */}
        <SectionLabel>{isFr ? 'CERTIFICATIONS' : 'CERTIFICATIONS'}</SectionLabel>
        <BadgeGroup badges={dc.overview.certifications} />
        <BadgeGroup badges={[dc.sustainability.climatePact, dc.sustainability.sbtiAlignment]} outline />

        <SectionDivider accent />

        {/* Network & Connectivity */}
        <SectionLabel>{isFr ? 'RÉSEAU & CONNECTIVITÉ' : 'NETWORK & CONNECTIVITY'}</SectionLabel>
        <MetricRow metrics={[
          { value: dc.network.carriers, label: isFr ? 'Opérateurs Réseau' : 'Network Carriers' },
          { value: dc.network.backboneCapacity, label: isFr ? 'Capacité Backbone' : 'Backbone Capacity' },
          { value: `${dc.network.submarineCables.length}`, label: isFr ? 'Câbles Sous-Marins' : 'Submarine Cables' },
          { value: `${dc.network.fiberRoutes}`, label: isFr ? 'Routes Fibre' : 'Fiber Routes' },
        ]} />

        {/* Latency Table */}
        <Text style={[s.h4, { marginTop: t.spacing.sm }]}>{isFr ? 'Latence depuis Dakhla' : 'Latency from Dakhla'}</Text>
        <DataTable
          headers={[isFr ? 'Destination' : 'Destination', isFr ? 'Latence' : 'Latency']}
          rows={dc.latency.map(l => [l.destination, l.latency])}
          colWidths={[60, 40]}
        />

        {/* SLA */}
        <SectionLabel>{isFr ? 'SLA' : 'SLA'}</SectionLabel>
        <View style={{ flexDirection: 'row', marginBottom: t.spacing.md }}>
          <View style={{ flex: 1 }}>
            <SpecRow label={isFr ? 'Disponibilité' : 'Uptime'} value={dc.sla.uptime} highlight />
            <SpecRow label={isFr ? 'Électricité' : 'Power'} value={dc.sla.power} />
          </View>
          <View style={{ flex: 1 }}>
            <SpecRow label={isFr ? 'Réseau' : 'Network'} value={dc.sla.network} />
            <SpecRow label={isFr ? 'Réponse' : 'Response'} value={dc.sla.responseTime} />
          </View>
        </View>

        <CTABox
          title={isFr ? 'Prêt à déployer ?' : 'Ready to deploy?'}
          text={isFr
            ? 'Contactez notre équipe pour une visite virtuelle ou un devis personnalisé.'
            : 'Contact our team for a virtual tour or custom quote.'}
          locale={locale}
        />

        <PDFFooter pageNumber={4} locale={locale} />
      </Page>
    </Document>
  );
};
