/**
 * HarchCorp Data Center Specifications - Dakhla Facility
 * Competitive data matching/exceeding Equinix IBX specs
 */

export const dakhlaDataCenter = {
  name: 'HarchCorp Dakhla DC-1',
  code: 'DKH-1',
  type: 'Tier IV Design Certified',
  status: 'Operational',

  // Location
  location: {
    city: 'Dakhla',
    region: 'Oued Ed-Dahab, Southern Provinces',
    country: 'Morocco',
    coordinates: '23.6847°N, 15.9575°W',
    timezone: 'UTC+1 (CET)',
    elevation: '12m above sea level',
    coastalAccess: 'Atlantic Ocean — 200m',
  },

  // Overview
  overview: {
    totalArea: '12,000 m²',
    totalRacks: '600+',
    totalCapacity: '24 MW',
    yearOpened: '2025',
    certifications: [
      'ISO 27001', 'ISO 22301', 'ISO 14001', 'ISO 50001',
      'SOC 2 Type II', 'PCI DSS v4.0', 'GDPR Compliant',
      'Climate-Neutral Data Center Pact',
    ],
  },

  // Electrical
  electrical: {
    totalPower: '24 MW',
    redundancy: '2N (Tier IV)',
    upsSystems: '2N redundant UPS, rotary + static',
    upsRuntime: '15 minutes at full load (N+1 battery strings)',
    generators: '8 × 3.5 MW diesel generators (N+2)',
    generatorFuel: '72-hour on-site fuel storage',
    pduConfig: 'Dual A+B power feeds per cabinet',
    powerDensityStandard: '8 kW per rack',
    powerDensityHigh: 'Up to 140 kW per rack (AI/GPU zones)',
    voltage: '230V / 400V AC, 48V DC option',
    transformer: 'Dedicated 36 MVA substation',
    pue: '1.12 (trailing 12 months)',
  },

  // Cooling
  cooling: {
    primarySystem: 'Seawater-cooled chillers + free cooling',
    secondarySystem: 'Direct airside free cooling (economizer)',
    coolingCapacityStandard: '8 kW per rack',
    coolingCapacityHigh: '140 kW per rack (liquid cooling zones)',
    freeCoolingHours: '7,200+ hours/year',
    raisedFloor: '900mm raised floor',
    temperature: '18–27°C (ASHRAE A1)',
    humidity: '20–80% RH',
    coolingRedundancy: 'N+1 chiller plants',
    liquidCooling: 'Direct-to-chip liquid cooling for GPU zones',
    seawaterIntake: 'Atlantic Ocean — filtered, non-contact heat exchange',
    wue: '0.18 L/kWh (closed-loop seawater)',
  },

  // Fire & Safety
  fire: {
    detection: 'VESDA very early smoke detection',
    suppression: 'Novec 1230 clean agent',
    zones: 'Multi-zone detection and suppression',
    fireRated: '2-hour fire-rated compartments',
    gasMonitoring: 'Continuous air quality monitoring',
  },

  // Security
  security: {
    physicalSecurity: '24/7 on-site security personnel',
    accessControl: 'Multi-factor: badge + biometric + PIN',
    surveillance: '300+ CCTV cameras, 180-day retention',
    mantrap: 'Mantrap entry with anti-tailgating',
    perimeter: '3-layer perimeter: fence + bollards + crash barriers',
    vehicleBarriers: 'K12-rated crash barriers',
    visitorPolicy: 'Pre-registration + escorted access only',
    cctvAi: 'AI-powered anomaly detection on CCTV feeds',
  },

  // Network
  network: {
    carriers: '40+ network service providers',
    submarineCables: [
      'Africa Coast to Europe (ACE)',
      'Marion (planned)',
      'Dakhla Express (planned)',
    ],
    backboneCapacity: '8 Tbps backbone (expandable to 20 Tbps)',
    internetExchange: 'Direct peering at Morocco-IX, France-IX',
    cloudOnRamps: 'AWS Direct Connect, Azure ExpressRoute, GCP Interconnect',
    crossConnects: 'Dedicated cross-connect fabric',
    fiberRoutes: '4 diverse fiber routes (2 terrestrial, 2 submarine)',
  },

  // Sustainability
  sustainability: {
    pue: '1.12',
    wue: '0.18 L/kWh',
    cue: '0.045 kgCO₂/kWh (Morocco grid 2025)',
    renewableEnergy: '100% renewable energy matching',
    renewableSources: 'Solar (60%), Wind (25%), Grid RECs (15%)',
    carbonIntensity: '0.045 kgCO₂/kWh (vs. 0.258 EU average)',
    freeCooling: '7,200+ hours/year (82% of the year)',
    waterRecycling: 'Closed-loop seawater — zero freshwater consumption',
    solarCapacity: '12 MW on-site solar PV (under construction)',
    greenBuilding: 'LEED Gold target',
    sbtiAlignment: 'Science-Based Targets initiative aligned',
    climatePact: 'Climate-Neutral Data Center Pact signatory',
    netZeroTarget: '2030',
  },

  // Latency (from Dakhla)
  latency: [
    { destination: 'Casablanca, Morocco', latency: '8 ms' },
    { destination: 'Lisbon, Portugal', latency: '18 ms' },
    { destination: 'Madrid, Spain', latency: '22 ms' },
    { destination: 'Paris, France', latency: '30 ms' },
    { destination: 'London, UK', latency: '35 ms' },
    { destination: 'Lagos, Nigeria', latency: '28 ms' },
    { destination: 'Accra, Ghana', latency: '32 ms' },
    { destination: 'Nairobi, Kenya', latency: '48 ms' },
    { destination: 'Johannesburg, SA', latency: '42 ms' },
    { destination: 'Dubai, UAE', latency: '45 ms' },
  ],

  // SLA
  sla: {
    uptime: '99.999%',
    power: '100% power uptime SLA',
    cooling: '100% cooling uptime SLA',
    network: '99.99% network availability',
    support: '24/7/365 NOC and on-site support',
    responseTime: '15-minute remote response, 1-hour on-site',
  },
};
