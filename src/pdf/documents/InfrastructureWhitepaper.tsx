/**
 * HarchCorp Infrastructure Whitepaper
 * 8-page whitepaper matching CoreWeave/AWS format
 */
import React from 'react';
import { Document, Page, Text, View, Font } from '@react-pdf/renderer';
import { CoverPage, PageHeaderBar, PDFFooter, SectionLabel, MetricRow, DataTable, BulletList, SpecRow, BadgeGroup, Callout, CTABox, SectionDivider, TwoColumn } from '../templates/components';
import { pdfStyles as s } from '../templates/styles';
import { HarchTheme as t } from '../templates/theme';
import { dakhlaDataCenter as dc } from '../data/dakhla-datacenter';
import { gpuOfferings as gpu } from '../data/gpu-compute';
import { networkData as net } from '../data/network';
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

interface InfrastructureWhitepaperProps {
  locale?: 'en' | 'fr';
}

export const InfrastructureWhitepaper: React.FC<InfrastructureWhitepaperProps> = ({ locale = 'en' }) => {
  const isFr = locale === 'fr';

  return (
    <Document
      title={isFr ? 'Livre Blanc Infrastructure — HarchCorp' : 'Infrastructure Whitepaper — HarchCorp'}
      author="HarchCorp SARL"
      subject={isFr ? 'Livre blanc sur l\'infrastructure AI-native' : 'AI-Native Infrastructure Whitepaper'}
      creator="HarchCorp PDF Generator"
    >
      {/* ====== COVER PAGE ====== */}
      <Page size="A4" style={s.page}>
        <CoverPage
          type={isFr ? 'LIVRE BLANC' : 'WHITEPAPER'}
          title={isFr ? 'L\'Infrastructure AI-Native pour l\'Afrique et l\'Europe' : 'AI-Native Infrastructure for Africa and Europe'}
          subtitle={isFr
            ? 'Comment HarchCorp construit la plateforme GPU la plus durable et la mieux connectée au monde — une passerelle entre l\'Europe et l\'Afrique'
            : 'How HarchCorp is building the world\'s most sustainable and well-connected GPU platform — a gateway between Europe and Africa'}
          locale={locale}
          version="1.0"
        />
      </Page>

      {/* ====== PAGE 2: EXECUTIVE SUMMARY ====== */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Résumé Exécutif' : 'Executive Summary'} />

        <Text style={s.body}>
          {isFr
            ? 'L\'intelligence artificielle transforme chaque industrie, mais l\'infrastructure qui la soutient reste concentrée dans quelques régions du monde. L\'Afrique — un continent de 1,4 milliard d\'habitants avec une économie numérique en croissance exponentielle — manque cruellement d\'infrastructure GPU locale. Les entreprises africaines doivent envoyer leurs données en Europe ou en Amérique du Nord pour entraîner leurs modèles, avec des conséquences sur la latence, la souveraineté des données et les coûts.'
            : 'Artificial intelligence is transforming every industry, but the infrastructure that supports it remains concentrated in a few regions of the world. Africa — a continent of 1.4 billion people with an exponentially growing digital economy — critically lacks local GPU infrastructure. African companies must send their data to Europe or North America to train their models, with consequences for latency, data sovereignty, and costs.'}
        </Text>

        <Text style={s.body}>
          {isFr
            ? 'HarchCorp résout ce problème en construisant une plateforme GPU AI-native à Dakhla, au Maroc — stratégiquement positionnée comme passerelle entre l\'Europe et l\'Afrique. Notre centre de données Tier IV offre une capacité de 24 MW avec une densité allant jusqu\'à 140 kW par baie pour les charges AI/GPU, alimenté à 100% par des énergies renouvelables avec un PUE de 1.12 — parmi les meilleurs au monde.'
            : 'HarchCorp solves this problem by building an AI-native GPU platform in Dakhla, Morocco — strategically positioned as a gateway between Europe and Africa. Our Tier IV data center offers 24 MW capacity with density up to 140 kW per rack for AI/GPU workloads, powered by 100% renewable energy with a PUE of 1.12 — among the best in the world.'}
        </Text>

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'CHIFFRES CLÉS' : 'KEY FIGURES'}</SectionLabel>
        <MetricRow metrics={[
          { value: '24 MW', label: isFr ? 'Capacité Totale' : 'Total Capacity' },
          { value: '1.12', label: 'PUE' },
          { value: '100%', label: isFr ? 'Énergie Renouvelable' : 'Renewable Energy' },
          { value: '140 kW', label: isFr ? 'Densité/Baie AI' : 'AI Rack Density' },
        ]} />
        <MetricRow metrics={[
          { value: '8 Tbps', label: isFr ? 'Backbone Réseau' : 'Network Backbone' },
          { value: '30 ms', label: isFr ? 'Latence Paris' : 'Paris Latency' },
          { value: '99.999%', label: isFr ? 'SLA Disponibilité' : 'Uptime SLA' },
          { value: '€3.20', label: isFr ? 'GPU/hr (spot)' : 'GPU/hr (spot)' },
        ]} />

        <SectionDivider />

        <SectionLabel>{isFr ? 'AVANTAGES COMPÉTITIFS' : 'COMPETITIVE ADVANTAGES'}</SectionLabel>
        <BulletList items={isFr ? [
          'Position géographique unique — passerelle Europe-Afrique avec latence sub-35ms vers Paris, Londres, Francfort',
          'Durabilité de classe mondiale — PUE 1.12, refroidissement par eau de mer, zéro eau douce pour le refroidissement',
          'Intensité carbone 5× inférieure à la moyenne européenne (0.045 vs 0.258 kgCO₂/kWh)',
          'Souveraineté des données — données hébergées au Maroc, conforme RGPD et loi 09-08',
          'Tarification GPU compétitive — jusqu\'à 33% moins cher que les hyperscalers',
          'Connectivité sous-marine — accès direct à ACE et câbles planifiés vers l\'Europe et l\'Afrique de l\'Ouest',
          'Densité AI-ready — jusqu\'à 140 kW/baie avec refroidissement liquide direct-to-chip',
        ] : [
          'Unique geographic position — Europe-Africa gateway with sub-35ms latency to Paris, London, Frankfurt',
          'World-class sustainability — PUE 1.12, seawater cooling, zero freshwater for cooling',
          'Carbon intensity 5× lower than EU average (0.045 vs 0.258 kgCO₂/kWh)',
          'Data sovereignty — data hosted in Morocco, GDPR and Law 09-08 compliant',
          'Competitive GPU pricing — up to 33% cheaper than hyperscalers',
          'Submarine connectivity — direct access to ACE and planned cables to Europe and West Africa',
          'AI-ready density — up to 140 kW/rack with direct-to-chip liquid cooling',
        ]} />

        <PDFFooter pageNumber={2} locale={locale} />
      </Page>

      {/* ====== PAGE 3: THE PROBLEM ====== */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Le Problème de l\'Infrastructure AI' : 'The AI Infrastructure Problem'} />

        <Text style={s.h3}>{isFr ? 'La concentration de l\'infrastructure AI' : 'The concentration of AI infrastructure'}</Text>
        <Text style={s.body}>
          {isFr
            ? 'En 2025, plus de 95% de la capacité GPU cloud mondiale est située aux États-Unis, en Europe de l\'Ouest et en Asie de l\'Est. L\'Afrique — qui représente 17% de la population mondiale et connaît la croissance numérique la plus rapide — dispose de moins de 0,5% de la capacité GPU cloud mondiale. Ce déséquilibre crée des barrières significatives pour les entreprises africaines : latence élevée, coûts de transfert de données, absence de souveraineté numérique, et dépendance à des juridictions étrangères pour le traitement des données sensibles.'
            : 'In 2025, over 95% of global cloud GPU capacity is located in the United States, Western Europe, and East Asia. Africa — representing 17% of the world\'s population and experiencing the fastest digital growth — has less than 0.5% of global cloud GPU capacity. This imbalance creates significant barriers for African companies: high latency, data transfer costs, lack of digital sovereignty, and dependence on foreign jurisdictions for processing sensitive data.'}
        </Text>

        <Text style={s.h3}>{isFr ? 'Le défi de la durabilité' : 'The sustainability challenge'}</Text>
        <Text style={s.body}>
          {isFr
            ? 'L\'entraînement des modèles AI de grande taille consomme des quantités massives d\'énergie. GPT-4 aurait nécessité plus de 50 GWh pour son entraînement. Avec une intensité carbone européenne moyenne de 0,258 kgCO₂/kWh, cela représente plus de 12 900 tonnes de CO₂ — l\'équivalent de 2 800 voitures pendant un an. La pression s\'accentue pour rendre l\'AI plus durable, mais la plupart des fournisseurs cloud ne proposent pas de vraies solutions bas-carbone pour les charges GPU intensives.'
            : 'Training large AI models consumes massive amounts of energy. GPT-4 reportedly required over 50 GWh for its training. With a European average carbon intensity of 0.258 kgCO₂/kWh, this represents over 12,900 tonnes of CO₂ — the equivalent of 2,800 cars for a year. Pressure is mounting to make AI more sustainable, but most cloud providers don\'t offer true low-carbon solutions for intensive GPU workloads.'}
        </Text>

        <Callout>
          {isFr
            ? 'Le coût énergétique de l\'AI double tous les 3,4 mois (OpenAI, 2024). D\'ici 2030, l\'AI pourrait représenter 10% de la consommation électrique mondiale. L\'infrastructure durable n\'est plus une option — c\'est une nécessité.'
            : 'The energy cost of AI doubles every 3.4 months (OpenAI, 2024). By 2030, AI could represent 10% of global electricity consumption. Sustainable infrastructure is no longer an option — it\'s a necessity.'}
        </Callout>

        <Text style={s.h3}>{isFr ? 'Le fossé de la souveraineté des données' : 'The data sovereignty gap'}</Text>
        <Text style={s.body}>
          {isFr
            ? 'Le RGPD européen impose des contraintes strictes sur le transfert de données hors UE. Pour les entreprises africaines, le Cloud Act américain et les lois similaires créent un risque juridique lorsque les données transitent par des serveurs américains. Le Maroc, avec sa loi 09-08 sur la protection des données et son statut d\'adéquation EU, offre un cadre unique : souveraineté des données africaine avec conformité RGPD européenne. C\'est cette combinaison que HarchCorp exploite.'
            : 'The European GDPR imposes strict constraints on data transfers outside the EU. For African companies, the US CLOUD Act and similar laws create legal risk when data transits through US servers. Morocco, with its Law 09-08 on data protection and EU adequacy status, offers a unique framework: African data sovereignty with European GDPR compliance. This is the combination HarchCorp leverages.'}
        </Text>

        <PDFFooter pageNumber={3} locale={locale} />
      </Page>

      {/* ====== PAGE 4: THE SOLUTION ====== */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'La Solution HarchCorp' : 'The HarchCorp Solution'} />

        <Text style={s.h3}>{isFr ? 'Dakhla : la position stratégique idéale' : 'Dakhla: the ideal strategic position'}</Text>
        <Text style={s.body}>
          {isFr
            ? 'Dakhla, située sur la côte atlantique du Sahara marocain à 23°N, offre une combinaison unique d\'avantages naturels et stratégiques. La brise atlantique constante fournit des milliers d\'heures de refroidissement gratuit — comparable aux pays nordiques. Le désert environnant offre un ensoleillement parmi les plus élevés au monde (3 000+ heures/an), idéal pour l\'énergie solaire. Et la position géographique, à égale distance de l\'Europe et de l\'Afrique de l\'Ouest, en fait un nœud naturel pour la connectivité sous-marine.'
            : 'Dakhla, located on the Atlantic coast of the Moroccan Sahara at 23°N, offers a unique combination of natural and strategic advantages. The constant Atlantic breeze provides thousands of hours of free cooling — comparable to Nordic countries. The surrounding desert offers some of the highest sunshine in the world (3,000+ hours/year), ideal for solar energy. And the geographic position, equidistant from Europe and West Africa, makes it a natural hub for submarine connectivity.'}
        </Text>

        <SectionDivider />

        <Text style={s.h3}>{isFr ? 'Architecture de refroidissement innovante' : 'Innovative cooling architecture'}</Text>
        <Text style={s.body}>
          {isFr
            ? 'Notre centre de données utilise un système de refroidissement hybride à trois niveaux qui exploite les conditions climatiques uniques de Dakhla. Le premier niveau utilise l\'air gratuit (free cooling) alimenté par la brise atlantique, actif pendant plus de 7 200 heures par an (82% du temps). Le deuxième niveau utilise des refroidisseurs à eau de mer en circuit fermé — l\'eau de mer ne jamais entre en contact avec les équipements ou l\'atmosphère interne. Le troisième niveau utilise le refroidissement liquide direct-to-chip pour les zones GPU haute densité (jusqu\'à 140 kW/baie). Cette architecture nous permet d\'atteindre un PUE de 1.12 — comparable aux meilleures installations au monde.'
            : 'Our data center uses a three-tier hybrid cooling system that leverages Dakhla\'s unique climate conditions. The first tier uses free cooling powered by the Atlantic breeze, active for over 7,200 hours per year (82% of the time). The second tier uses closed-loop seawater chillers — seawater never comes into contact with equipment or the internal atmosphere. The third tier uses direct-to-chip liquid cooling for high-density GPU zones (up to 140 kW/rack). This architecture enables us to achieve a PUE of 1.12 — comparable to the best installations in the world.'}
        </Text>

        <SectionLabel>{isFr ? 'COMPARAISON PUE' : 'PUE COMPARISON'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Fournisseur' : 'Provider', isFr ? 'PUE' : 'PUE', isFr ? 'Lieu' : 'Location', isFr ? 'Méthode de Refroidissement' : 'Cooling Method']}
          rows={[
            ['Google (fleet avg)', '1.09', 'Global', 'Custom DC design + AI optimization'],
            ['HarchCorp Dakhla', '1.12', 'Dakhla, Morocco', 'Seawater + free cooling + liquid'],
            ['AWS (est.)', '1.15', 'Global', 'Evaporative + free cooling'],
            ['OVHcloud', '1.20', 'France', 'Custom air + water cooling'],
            ['Scaleway DC5', '1.25', 'Paris', 'Evaporative cooling'],
            ['CoreWeave (est.)', '1.20', 'US/EU', 'Air + liquid cooling'],
            [isFr ? 'Moyenne Industrie' : 'Industry Average', '1.56', 'Global', isFr ? 'Mixte' : 'Mixed'],
          ]}
          colWidths={[25, 10, 25, 40]}
        />

        <PDFFooter pageNumber={4} locale={locale} />
      </Page>

      {/* ====== PAGE 5: GPU PLATFORM ====== */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Plateforme GPU AI-Native' : 'AI-Native GPU Platform'} />

        <Text style={s.body}>
          {isFr
            ? 'HarchCorp propose une gamme complète d\'instances GPU couvrant tous les cas d\'usage AI, du développement à la production à grande échelle. Notre plateforme est conçue pour être AI-native dès la conception — pas un cloud générique adapté aux charges GPU, mais une infrastructure construite spécifiquement pour les workloads d\'entraînement et d\'inférence.'
            : 'HarchCorp offers a comprehensive range of GPU instances covering all AI use cases, from development to large-scale production. Our platform is designed to be AI-native from the ground up — not a generic cloud adapted for GPU workloads, but infrastructure built specifically for training and inference workloads.'}
        </Text>

        <SectionLabel>{isFr ? 'GAMME D\'INSTANCES' : 'INSTANCE RANGE'}</SectionLabel>
        <DataTable
          headers={[
            isFr ? 'Instance' : 'Instance',
            isFr ? 'GPU' : 'GPU',
            isFr ? 'VRAM Total' : 'Total VRAM',
            isFr ? 'Interconnect' : 'Interconnect',
            isFr ? 'À la demande' : 'On-Demand',
          ]}
          rows={gpu.instances.map(inst => [
            inst.name,
            `${inst.gpuCount}× ${inst.gpu.split(' ').slice(-1)}`,
            inst.vram.split(' per')[0].split(' ').slice(-2).join(' '),
            inst.interconnect.split(' ')[0],
            inst.priceOnDemand,
          ])}
          colWidths={[18, 20, 22, 20, 20]}
        />

        <SectionDivider />

        <Text style={s.h3}>{isFr ? 'Architecture réseau pour l\'entraînement distribué' : 'Network architecture for distributed training'}</Text>
        <Text style={s.body}>
          {isFr
            ? 'L\'entraînement distribué de modèles AI de grande taille nécessite une interconnexion GPU à très haut débit et très faible latence. Notre plateforme utilise InfiniBand NDR 400 Gbps entre les nœuds, avec NVLink/NVSwitch à 900 GB/s au sein de chaque serveur. Cette architecture permet de mettre en cluster des milliers de GPU avec une efficacité de scaling supérieure à 95% — comparable aux installations de recherche les plus avancées.'
            : 'Distributed training of large AI models requires very high bandwidth, very low latency GPU interconnection. Our platform uses InfiniBand NDR 400 Gbps between nodes, with NVLink/NVSwitch at 900 GB/s within each server. This architecture enables clustering thousands of GPUs with scaling efficiency above 95% — comparable to the most advanced research installations.'}
        </Text>

        <SectionLabel>{isFr ? 'SPÉCIFICATIONS RÉSEAU' : 'NETWORK SPECIFICATIONS'}</SectionLabel>
        <TwoColumn
          left={
            <View>
              <SpecRow label={isFr ? 'InfiniBand' : 'InfiniBand'} value="400 Gbps NDR" />
              <SpecRow label="NVLink" value="900 GB/s" />
              <SpecRow label={isFr ? 'Topologie' : 'Topology'} value="Fat-tree, non-blocking" />
            </View>
          }
          right={
            <View>
              <SpecRow label={isFr ? 'Efficacité Scaling' : 'Scaling Efficiency'} value=">95% (256+ GPUs)" />
              <SpecRow label={isFr ? 'Latence Intra-rack' : 'Intra-rack Latency'} value="<1 μs" />
              <SpecRow label={isFr ? 'Latence Inter-rack' : 'Inter-rack Latency'} value="<5 μs" />
            </View>
          }
        />

        <SectionDivider accent />

        <Text style={s.h3}>{isFr ? 'Souveraineté et conformité des données' : 'Data sovereignty and compliance'}</Text>
        <Text style={s.body}>
          {isFr
            ? 'Contrairement aux hyperscalers qui peuvent transférer vos données vers des juridictions étrangères, HarchCorp garantit que toutes les données restent au Maroc. Le Maroc bénéficie d\'une décision d\'adéquation de l\'UE, ce qui signifie que les données personnelles peuvent circuler librement entre l\'UE et le Maroc au même titre qu\'entre pays membres de l\'UE. Notre infrastructure est conforme au RGPD, à la loi marocaine 09-08, et nous proposons des DPA et des clauses contractuelles types UE pour tous les clients.'
            : 'Unlike hyperscalers who may transfer your data to foreign jurisdictions, HarchCorp guarantees all data stays in Morocco. Morocco benefits from an EU adequacy decision, meaning personal data can flow freely between the EU and Morocco just as between EU member states. Our infrastructure is GDPR-compliant, Moroccan Law 09-08 compliant, and we offer DPAs and EU Model Clauses for all clients.'}
        </Text>

        <PDFFooter pageNumber={5} locale={locale} />
      </Page>

      {/* ====== PAGE 6: CONNECTIVITY ====== */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Connectivité & Réseau' : 'Connectivity & Network'} />

        <Text style={s.body}>
          {isFr
            ? 'Dakhla est un nœud sous-marin stratégique reliant l\'Europe à l\'Afrique de l\'Ouest et au-delà. Notre infrastructure réseau exploite cette position avec des câbles sous-marins existants et planifiés, un backbone de 8 Tbps, et du peering direct dans les principaux points d\'échange Internet.'
            : 'Dakhla is a strategic submarine hub connecting Europe to West Africa and beyond. Our network infrastructure leverages this position with existing and planned submarine cables, an 8 Tbps backbone, and direct peering at major Internet Exchange Points.'}
        </Text>

        <SectionLabel>{isFr ? 'CÂBLES SOUS-MARINS' : 'SUBMARINE CABLES'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Câble' : 'Cable', isFr ? 'Longueur' : 'Length', isFr ? 'Capacité' : 'Capacity', isFr ? 'Statut' : 'Status', isFr ? 'Reach' : 'Reach']}
          rows={net.submarineCables.map(c => [
            c.name,
            c.length,
            c.capacity,
            c.status,
            c.landing.split(' — ')[1]?.substring(0, 40) || c.landing.substring(0, 40),
          ])}
          colWidths={[22, 14, 16, 16, 32]}
        />

        <SectionDivider />

        <SectionLabel>{isFr ? 'LATENCE DEPUIS DAKHLA' : 'LATENCY FROM DAKHLA'}</SectionLabel>
        <TwoColumn
          left={
            <View>
              <Text style={s.h4}>{isFr ? 'Afrique' : 'Africa'}</Text>
              <SpecRow label="Dakar" value="15 ms" highlight />
              <SpecRow label="Lagos" value="28 ms" />
              <SpecRow label="Accra" value="32 ms" />
              <SpecRow label="Abidjan" value="30 ms" />
              <SpecRow label="Nairobi" value="48 ms" />
              <SpecRow label="Johannesburg" value="42 ms" />
            </View>
          }
          right={
            <View>
              <Text style={s.h4}>{isFr ? 'Europe' : 'Europe'}</Text>
              <SpecRow label="Casablanca" value="8 ms" highlight />
              <SpecRow label="Lisbon" value="18 ms" />
              <SpecRow label="Madrid" value="22 ms" />
              <SpecRow label="Paris" value="30 ms" />
              <SpecRow label="London" value="35 ms" />
              <SpecRow label="Frankfurt" value="38 ms" />
            </View>
          }
        />

        <SectionDivider />

        <SectionLabel>{isFr ? 'POINTS D\'ÉCHANGE' : 'INTERNET EXCHANGE POINTS'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'IX' : 'IX', isFr ? 'Localisation' : 'Location', isFr ? 'Pairs' : 'Peers']}
          rows={net.peering.ixPoints.map(ix => [ix.name, ix.location, ix.peers])}
          colWidths={[35, 35, 30]}
        />

        <Callout>
          {isFr
            ? 'Cloud On-Ramps: Connexions directes vers AWS Direct Connect, Azure ExpressRoute, Google Cloud Interconnect et Oracle FastConnect disponibles.'
            : 'Cloud On-Ramps: Direct connections to AWS Direct Connect, Azure ExpressRoute, Google Cloud Interconnect, and Oracle FastConnect available.'}
        </Callout>

        <PDFFooter pageNumber={6} locale={locale} />
      </Page>

      {/* ====== PAGE 7: SUSTAINABILITY ====== */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Durabilité & Impact' : 'Sustainability & Impact'} />

        <Text style={s.body}>
          {isFr
            ? 'La durabilité n\'est pas une après-pensée chez HarchCorp — c\'est le fondement de notre conception. Notre centre de données de Dakhla a été conçu dès le départ pour minimiser l\'impact environnemental tout en maximisant la performance. Le résultat est une infrastructure qui offre les meilleures performances GPU avec l\'une des empreintes carbone les plus faibles au monde.'
            : 'Sustainability is not an afterthought at HarchCorp — it\'s the foundation of our design. Our Dakhla data center was designed from the ground up to minimize environmental impact while maximizing performance. The result is infrastructure that delivers the best GPU performance with one of the lowest carbon footprints in the world.'}
        </Text>

        <MetricRow metrics={sus.impactMetrics.slice(0, 4)} />
        <MetricRow metrics={sus.impactMetrics.slice(4)} />

        <SectionDivider accent />

        <Text style={s.h3}>{isFr ? 'Mix énergétique renouvelable' : 'Renewable energy mix'}</Text>
        <TwoColumn
          left={
            <View>
              <SpecRow label={isFr ? 'Solaire' : 'Solar'} value="60%" highlight />
              <SpecRow label={isFr ? 'Éolien' : 'Wind'} value="25%" />
              <SpecRow label={isFr ? 'Certificats RECs' : 'Grid RECs'} value="15%" />
              <SpecRow label={isFr ? 'Matching Renouvelable' : 'Renewable Matching'} value="100%" highlight />
            </View>
          }
          right={
            <View>
              <SpecRow label={isFr ? 'Solaire On-site' : 'On-site Solar'} value={sus.environmental.renewable.solarCapacity} />
              <SpecRow label={isFr ? 'PPA Éolien' : 'Wind PPA'} value={sus.environmental.renewable.windPpa} />
              <SpecRow label={isFr ? 'Type de Matching' : 'Matching Type'} value={sus.environmental.renewable.matchingType} />
            </View>
          }
        />

        <SectionDivider />

        <Text style={s.h3}>{isFr ? 'Feuille de route carbone' : 'Carbon roadmap'}</Text>
        <DataTable
          headers={[isFr ? 'Année' : 'Year', isFr ? 'Jalon' : 'Milestone', isFr ? 'Statut' : 'Status']}
          rows={sus.roadmap.map(r => [
            r.year,
            r.milestone,
            r.status === 'completed' ? '✓' : r.status === 'in-progress' ? '→' : '○',
          ])}
          colWidths={[15, 60, 25]}
        />

        <Callout>
          {isFr
            ? 'Zéro eau douce pour le refroidissement — Notre système en circuit fermé utilise uniquement l\'eau de mer de l\'Atlantique, sans aucune consommation d\'eau douce potable pour le refroidissement.'
            : 'Zero freshwater for cooling — Our closed-loop system uses only Atlantic seawater, with zero potable freshwater consumption for cooling.'}
        </Callout>

        <PDFFooter pageNumber={7} locale={locale} />
      </Page>

      {/* ====== PAGE 8: CONCLUSION & CTA ====== */}
      <Page size="A4" style={s.page}>
        <PageHeaderBar title={isFr ? 'Conclusion' : 'Conclusion'} />

        <Text style={s.body}>
          {isFr
            ? 'HarchCorp représente un changement de paradigme dans l\'infrastructure AI. En construisant dans des lieux stratégiquement positionnés avec des avantages naturels uniques, nous démontrons qu\'il est possible d\'offrir des performances GPU de classe mondiale avec une empreinte environnementale minimale.'
            : 'HarchCorp represents a paradigm shift in AI infrastructure. By building in strategically positioned locations with unique natural advantages, we demonstrate that it\'s possible to deliver world-class GPU performance with minimal environmental footprint.'}
        </Text>

        <Text style={s.body}>
          {isFr
            ? 'Notre centre de données de Dakhla combine la durabilité des installations nordiques, la connectivité des hubs européens, et la proximité avec les marchés africains en croissance. C\'est la première infrastructure conçue spécifiquement pour servir les deux continents — une véritable passerelle Europe-Afrique pour l\'AI du 21e siècle.'
            : 'Our Dakhla data center combines the sustainability of Nordic facilities, the connectivity of European hubs, and proximity to growing African markets. It\'s the first infrastructure designed specifically to serve both continents — a true Europe-Africa gateway for 21st century AI.'}
        </Text>

        <SectionDivider accent />

        <SectionLabel>{isFr ? 'POURQUOI HARCHCORP' : 'WHY HARCHCORP'}</SectionLabel>
        <DataTable
          headers={[isFr ? 'Critère' : 'Criteria', 'HarchCorp', isFr ? 'Hyperscalers' : 'Hyperscalers', isFr ? 'Néo-clouds' : 'Neo-clouds']}
          rows={[
            [
              isFr ? 'Position géographique' : 'Geographic Position',
              isFr ? 'Passerelle EU-AF' : 'EU-AF Gateway',
              isFr ? 'US/EU uniquement' : 'US/EU only',
              isFr ? 'US uniquement' : 'US only',
            ],
            [
              isFr ? 'Intensité carbone' : 'Carbon Intensity',
              '0.045 kgCO₂/kWh',
              '0.095–0.180',
              '0.180–0.220',
            ],
            [
              'PUE',
              '1.12',
              '1.10–1.20',
              '1.15–1.25',
            ],
            [
              isFr ? 'Souveraineté données' : 'Data Sovereignty',
              isFr ? 'Maroc + RGPD' : 'Morocco + GDPR',
              isFr ? 'Variable par région' : 'Varies by region',
              isFr ? 'États-Unis' : 'United States',
            ],
            [
              isFr ? 'Latence vers Afrique' : 'Latency to Africa',
              '<50 ms',
              '80–200 ms',
              '100–250 ms',
            ],
            [
              isFr ? 'Prix GPU H100' : 'H100 GPU Price',
              '€18.90/hr',
              '€26–28/hr',
              '€19–20/hr',
            ],
          ]}
          colWidths={[25, 25, 25, 25]}
        />

        <CTABox
          title={isFr ? 'Rejoignez l\'infrastructure AI du futur' : 'Join the future of AI infrastructure'}
          text={isFr
            ? 'Démarrez votre premier workload GPU en moins de 90 secondes. Contactez notre équipe pour un devis personnalisé ou un essai gratuit.'
            : 'Launch your first GPU workload in under 90 seconds. Contact our team for a custom quote or free trial.'}
          locale={locale}
        />

        <PDFFooter pageNumber={8} locale={locale} />
      </Page>
    </Document>
  );
};
