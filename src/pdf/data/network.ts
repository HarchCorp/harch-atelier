/**
 * HarchCorp Network & Connectivity Data
 * Competitive with Equinix, Microsoft, Google network specs
 */

export const networkData = {
  // Backbone
  backbone: {
    totalCapacity: '8 Tbps (expandable to 20 Tbps)',
    technology: '400G coherent optics, DWDM',
    topology: 'Mesh with 4 diverse paths',
    fiber: 'Dark fiber on all backbone segments',
    latency: 'Sub-millisecond intra-facility',
  },

  // Submarine Cables
  submarineCables: [
    {
      name: 'Africa Coast to Europe (ACE)',
      length: '17,000 km',
      landing: 'Dakhla + 20+ African/European landing points',
      capacity: '1.92 Tbps design capacity',
      status: 'Operational',
      reach: 'France, Portugal, Spain, Canary Islands, Mauritania, Senegal, Gambia, Guinea, Sierra Leone, Liberia, Côte d\'Ivoire, Ghana, Nigeria, Equatorial Guinea, Gabon, Cameroon, Namibia, South Africa',
    },
    {
      name: 'Dakhla Express (HarchCorp)',
      length: '2,800 km',
      landing: 'Dakhla — Lisbon — Madrid',
      capacity: '4.8 Tbps design capacity',
      status: 'Planned (2027)',
      reach: 'Direct low-latency path to Iberian Peninsula',
    },
    {
      name: 'Marion Cable System',
      length: '9,800 km',
      landing: 'Dakhla — Lagos — Cape Town — Mumbai',
      capacity: '3.2 Tbps design capacity',
      status: 'Planned (2028)',
      reach: 'West Africa, Southern Africa, India',
    },
  ],

  // Terrestrial Routes
  terrestrialRoutes: [
    {
      route: 'Dakhla — Casablanca',
      technology: 'Dual diverse fiber paths',
      capacity: '2 × 400 Gbps',
      latency: '8 ms',
    },
    {
      route: 'Dakhla — Marrakech',
      technology: 'Dual diverse fiber paths',
      capacity: '2 × 400 Gbps',
      latency: '5 ms',
    },
    {
      route: 'Casablanca — Europe (via ACE)',
      technology: 'Submarine + terrestrial hybrid',
      capacity: 'Multiple Tbps',
      latency: '22–35 ms to major European hubs',
    },
  ],

  // Peering
  peering: {
    ixPoints: [
      { name: 'Morocco-IX', location: 'Casablanca', peers: '120+' },
      { name: 'France-IX', location: 'Paris', peers: '800+' },
      { name: 'DE-CIX', location: 'Frankfurt', peers: '1,100+' },
      { name: 'LINX', location: 'London', peers: '900+' },
      { name: 'AMS-IX', location: 'Amsterdam', peers: '850+' },
    ],
    totalPeers: '40+ NSPs',
    cloudOnRamps: ['AWS Direct Connect', 'Azure ExpressRoute', 'Google Cloud Interconnect', 'Oracle FastConnect'],
  },

  // Latency table
  latencyTable: [
    { destination: 'Dakhla (intra-DC)', latency: '<1 ms' },
    { destination: 'Casablanca', latency: '8 ms' },
    { destination: 'Marrakech', latency: '5 ms' },
    { destination: 'Lisbon', latency: '18 ms' },
    { destination: 'Madrid', latency: '22 ms' },
    { destination: 'Paris', latency: '30 ms' },
    { destination: 'London', latency: '35 ms' },
    { destination: 'Frankfurt', latency: '38 ms' },
    { destination: 'Amsterdam', latency: '36 ms' },
    { destination: 'Lagos', latency: '28 ms' },
    { destination: 'Accra', latency: '32 ms' },
    { destination: 'Abidjan', latency: '30 ms' },
    { destination: 'Dakar', latency: '15 ms' },
    { destination: 'Nairobi', latency: '48 ms' },
    { destination: 'Johannesburg', latency: '42 ms' },
    { destination: 'Dubai', latency: '45 ms' },
    { destination: 'Mumbai', latency: '85 ms' },
  ],

  // Features
  features: [
    '4 diverse fiber routes (2 terrestrial + 2 submarine)',
    '8 Tbps backbone capacity, expandable to 20 Tbps',
    'Direct peering at 5+ Internet Exchange Points',
    'Cloud on-ramps for AWS, Azure, GCP, Oracle',
    '400G coherent optics with DWDM multiplexing',
    'DDoS protection up to 5 Tbps scrubbing capacity',
    'Anycast DNS and global load balancing',
    'SD-WAN and dedicated interconnects available',
  ],
};
