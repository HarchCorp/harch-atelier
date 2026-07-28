/**
 * HarchCorp Security & Compliance Data
 * Competitive with Google Security Whitepaper, AWS Compliance
 */

export const securityData = {
  // Physical Security
  physical: {
    perimeter: [
      '3-layer perimeter security: perimeter fence + bollards + crash barriers',
      'K12-rated vehicle barriers at all entry points',
      '24/7 on-site security personnel (armed and trained)',
      'Perimeter intrusion detection system (PIDS)',
      'Thermal imaging cameras on perimeter',
    ],
    access: [
      'Multi-factor authentication: badge + biometric + PIN',
      'Mantrap entry with anti-tailgating technology',
      'Pre-registration required for all visitors',
      'Escorted access only for non-cleared personnel',
      'Role-based physical access zones (RGB clearance model)',
      'Access logs retained for 5 years',
    ],
    surveillance: [
      '300+ CCTV cameras covering all areas',
      '180-day video retention (standard)',
      'AI-powered anomaly detection on all feeds',
      'No blind spots — 100% facility coverage',
      'Infrared and low-light capable cameras',
    ],
  },

  // Network Security
  network: {
    perimeter: [
      'Multi-layered firewall architecture (edge + internal)',
      'DDoS mitigation up to 5 Tbps',
      'Web Application Firewall (WAF) for all services',
      'Network micro-segmentation (Zero Trust)',
      'Encrypted VLANs for customer isolation',
    ],
    monitoring: [
      '24/7/365 Security Operations Center (SOC)',
      'SIEM with real-time correlation and alerting',
      'Network traffic analysis and anomaly detection',
      'Threat intelligence feeds from 15+ sources',
      'Automated incident response playbooks',
    ],
    encryption: [
      'TLS 1.3 for all data in transit',
      'AES-256 for all data at rest',
      'Customer-managed encryption keys (BYOK)',
      'Hardware Security Modules (HSMs) for key management',
      'Perfect forward secrecy on all connections',
    ],
  },

  // Application Security
  application: {
    development: [
      'Secure Software Development Lifecycle (SSDLC)',
      'Automated code scanning (SAST/DAST) in CI/CD',
      'Dependency vulnerability scanning',
      'Container image scanning and signing',
      'Infrastructure-as-Code security reviews',
    ],
    operations: [
      'Kubernetes pod security policies',
      'Runtime application self-protection (RASP)',
      'API gateway with rate limiting and authentication',
      'Automated patching within 48 hours of CVE disclosure',
      'Blue/green deployments with instant rollback',
    ],
  },

  // Certifications
  certifications: [
    {
      name: 'ISO 27001:2022',
      description: 'Information Security Management System',
      scope: 'All data center operations, cloud services, and support functions',
      status: 'Certified',
      auditor: 'Bureau Veritas',
    },
    {
      name: 'ISO 22301:2019',
      description: 'Business Continuity Management System',
      scope: 'All data center operations and critical business functions',
      status: 'Certified',
      auditor: 'Bureau Veritas',
    },
    {
      name: 'ISO 14001:2015',
      description: 'Environmental Management System',
      scope: 'Data center operations and corporate facilities',
      status: 'Certified',
      auditor: 'Bureau Veritas',
    },
    {
      name: 'ISO 50001:2018',
      description: 'Energy Management System',
      scope: 'Data center power and cooling infrastructure',
      status: 'Certified',
      auditor: 'Bureau Veritas',
    },
    {
      name: 'SOC 2 Type II',
      description: 'Service Organization Controls — Security, Availability, Processing Integrity',
      scope: 'Cloud infrastructure and managed services',
      status: 'Certified',
      auditor: 'Deloitte',
    },
    {
      name: 'PCI DSS v4.0',
      description: 'Payment Card Industry Data Security Standard',
      scope: 'Cardholder data environments',
      status: 'Certified',
      auditor: 'Trustwave',
    },
    {
      name: 'GDPR',
      description: 'EU General Data Protection Regulation',
      scope: 'All personal data processing',
      status: 'Compliant',
      auditor: 'Internal + external DPO',
    },
    {
      name: 'Climate-Neutral DC Pact',
      description: 'European Climate-Neutral Data Center Pact',
      scope: 'Data center energy and emissions',
      status: 'Signatory',
      auditor: 'Self-assessed + third-party verification',
    },
  ],

  // Compliance programs
  compliance: {
    dataProtection: [
      'GDPR compliance (EU data protection)',
      'Moroccan Law 09-08 (personal data protection)',
      'EU Model Clauses for cross-border transfers',
      'Data Processing Agreements (DPA) available',
      'Data residency guarantees (Morocco-based)',
      'Right to erasure and portability supported',
    ],
    industrySpecific: [
      'HIPAA-ready infrastructure (BAA available)',
      'FinTech-ready (PCI DSS + Moroccan Bank Al-Maghrib compliance)',
      'Public sector compatible (Moroccan government standards)',
      'Aerospace & defense (ITAR-aware processes)',
    ],
  },

  // Incident response
  incidentResponse: {
    responseTime: '<15 minutes for P1 incidents',
    communication: 'Customer notification within 1 hour',
    postMortem: 'Full post-incident review within 72 hours',
    bugBounty: 'Responsible disclosure program (bug bounty)',
    penetrationTesting: 'Annual third-party penetration testing',
    redTeam: 'Quarterly internal red team exercises',
  },
};
