/**
 * HarchCorp Sustainability & Impact Data
 * Competitive with OVHcloud, Digital Realty, Equinix ESG reports
 */

export const sustainabilityData = {
  // Environmental
  environmental: {
    pue: {
      current: 1.12,
      target2026: 1.08,
      target2028: 1.05,
      industry: 1.56,
      google: 1.09,
      equinix: 1.35,
      ovhcloud: 1.20,
      history: [
        { year: '2025 H1', pue: 1.14 },
        { year: '2025 H2', pue: 1.12 },
      ],
    },
    wue: {
      current: 0.18,
      target2026: 0.12,
      unit: 'L/kWh',
      note: 'Closed-loop seawater — zero freshwater consumption for cooling',
    },
    cue: {
      current: 0.045,
      target2026: 0.030,
      unit: 'kgCO₂/kWh',
      euAverage: 0.258,
      franceAverage: 0.085,
      moroccoAverage: 0.545,
      note: 'With 100% renewable matching, operational CUE = 0.000',
    },
    renewable: {
      currentPercent: 100,
      breakdown: {
        solar: 60,
        wind: 25,
        gridRecs: 15,
      },
      solarCapacity: '12 MW on-site PV (under construction)',
      windPpa: '50 MW wind PPA (Southern Morocco)',
      matchingType: '100% renewable energy matching (GO certificates)',
    },
    carbon: {
      scope1: '842 tCO₂e (diesel generators — emergency testing only)',
      scope2: '0 tCO₂e (100% renewable matching)',
      scope2Location: '13,080 tCO₂e (location-based)',
      scope3: '24,500 tCO₂e (embodied carbon, supply chain)',
      totalOperational: '842 tCO₂e (market-based)',
      netZeroTarget: '2030',
      carbonNegativeTarget: '2035',
    },
    freeCooling: {
      hoursPerYear: 7200,
      percentOfYear: '82%',
      vsNordic: '7,000–8,000 hrs (comparable)',
      vsFrankfurt: '4,500 hrs',
      vsParis: '3,800 hrs',
      mechanism: 'Atlantic coastal breeze + desert night cooling',
    },
    water: {
      freshwaterConsumption: '0 L (seawater cooling, closed-loop)',
      potableWater: 'Only for staff facilities',
      recycling: '100% cooling water recycled in closed loop',
    },
  },

  // Social
  social: {
    employees: {
      total: 87,
      morocco: 62,
      france: 15,
      remote: 10,
      diversity: '38% women in technical roles',
      retention: '94% retention rate',
    },
    training: {
      budgetPerEmployee: '€3,500/year',
      hoursPerYear: '80 hours average',
      certifications: 'AWS, GCP, NVIDIA certified engineers',
    },
    community: {
      investment: '€250,000 community investment (2025)',
      stemPrograms: '3 active STEM programs in Dakhla schools',
      localHiring: '85% local hiring target',
    },
  },

  // Governance
  governance: {
    certifications: [
      'ISO 27001 (Information Security)',
      'ISO 22301 (Business Continuity)',
      'ISO 14001 (Environmental Management)',
      'ISO 50001 (Energy Management)',
      'SOC 2 Type II',
      'PCI DSS v4.0',
      'GDPR Compliant',
    ],
    commitments: [
      'Science-Based Targets initiative (SBTi) aligned',
      'Climate-Neutral Data Center Pact signatory',
      'UN Global Compact participant',
      'Moroccan Data Protection Law 09-08 compliant',
    ],
    dataSovereignty: {
      jurisdiction: 'Morocco (EU-adequate data protection)',
      gdpr: 'Full GDPR compliance',
      moroccanLaw: 'Law 09-08 compliant',
      crossBorder: 'EU model clauses available',
    },
  },

  // Impact metrics (for visual display)
  impactMetrics: [
    { value: '1.12', label: 'PUE (Trailing 12 Months)', unit: '' },
    { value: '0.18', label: 'WUE (L/kWh)', unit: '' },
    { value: '100%', label: 'Renewable Energy Matching', unit: '' },
    { value: '7,200+', label: 'Free Cooling Hours/Year', unit: '' },
    { value: '0', label: 'Freshwater for Cooling', unit: 'Liters' },
    { value: '0.045', label: 'Carbon Intensity', unit: 'kgCO₂/kWh' },
  ],

  // Emissions reduction roadmap
  roadmap: [
    { year: '2025', milestone: '100% renewable energy matching achieved', status: 'completed' },
    { year: '2025', milestone: 'PUE 1.12 achieved', status: 'completed' },
    { year: '2026', milestone: '12 MW on-site solar PV operational', status: 'in-progress' },
    { year: '2026', milestone: 'PUE target: 1.08', status: 'target' },
    { year: '2027', milestone: '50 MW wind PPA fully operational', status: 'target' },
    { year: '2028', milestone: 'PUE target: 1.05', status: 'target' },
    { year: '2030', milestone: 'Net-zero operational emissions', status: 'target' },
    { year: '2035', milestone: 'Carbon negative (including Scope 3)', status: 'target' },
  ],
};
