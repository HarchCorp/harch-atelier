import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  pathnames: {
    '/': {
      en: '/',
      fr: '/',
    },
    '/about': {
      en: '/about',
      fr: '/a-propos',
    },
    '/subsidiaries': {
      en: '/subsidiaries',
      fr: '/filiales',
    },
    '/quote': {
      en: '/quote',
      fr: '/devis',
    },
    '/quote/received': {
      en: '/quote/received',
      fr: '/devis/recu',
    },
    '/contact': {
      en: '/contact',
      fr: '/contact',
    },
    '/thesis': {
      en: '/thesis',
      fr: '/these',
    },
    '/platform': {
      en: '/platform',
      fr: '/plateforme',
    },
    '/investors': {
      en: '/investors',
      fr: '/investisseurs',
    },
    '/careers': {
      en: '/careers',
      fr: '/carrieres',
    },
    '/careers/hiring-process': {
      en: '/careers/hiring-process',
      fr: '/carrieres/processus-de-recrutement',
    },
    '/pricing': {
      en: '/pricing',
      fr: '/tarifs',
    },
    '/pricing/calculator': {
      en: '/pricing/calculator',
      fr: '/tarifs/calculateur',
    },
    '/intelligence': {
      en: '/intelligence',
      fr: '/intelligence',
    },
    '/intelligence/harchos': {
      en: '/intelligence/harchos',
      fr: '/intelligence/harchos',
    },
    '/harchos': {
      en: '/harchos',
      fr: '/harchos',
    },
    '/press': {
      en: '/press',
      fr: '/presse',
    },
    '/partners': {
      en: '/partners',
      fr: '/partenaires',
    },
    '/support': {
      en: '/support',
      fr: '/support',
    },
    '/faq': {
      en: '/faq',
      fr: '/faq',
    },
    '/strategy': {
      en: '/strategy',
      fr: '/strategie',
    },
    '/esg': {
      en: '/esg',
      fr: '/rse',
    },
    '/community': {
      en: '/community',
      fr: '/communaute',
    },
    '/newsroom': {
      en: '/newsroom',
      fr: '/actualites',
    },
    '/blog': {
      en: '/blog',
      fr: '/blog',
    },
    '/docs': {
      en: '/docs',
      fr: '/docs',
    },
    '/trust': {
      en: '/trust',
      fr: '/confiance',
    },
    '/trust/security': {
      en: '/trust/security',
      fr: '/confiance/securite',
    },
    '/trust/compliance': {
      en: '/trust/compliance',
      fr: '/confiance/conformite',
    },
    '/privacy': {
      en: '/privacy',
      fr: '/confidentialite',
    },
    '/terms': {
      en: '/terms',
      fr: '/conditions',
    },
    '/status': {
      en: '/status',
      fr: '/statut',
    },
    '/company/leadership': {
      en: '/company/leadership',
      fr: '/entreprise/direction',
    },
    '/company/dei': {
      en: '/company/dei',
      fr: '/entreprise/diversite',
    },
    '/company/ventures': {
      en: '/company/ventures',
      fr: '/entreprise/ventures',
    },
    '/customers': {
      en: '/customers',
      fr: '/clients',
    },
    '/startup-program': {
      en: '/startup-program',
      fr: '/programme-startup',
    },
    '/developers': {
      en: '/developers',
      fr: '/developpeurs',
    },
    '/developers/open-source': {
      en: '/developers/open-source',
      fr: '/developpeurs/open-source',
    },
    '/developers/playground': {
      en: '/developers/playground',
      fr: '/developpeurs/bac-a-sable',
    },
    '/legal/hub': {
      en: '/legal/hub',
      fr: '/juridique/centre',
    },
    '/legal/cookies': {
      en: '/legal/cookies',
      fr: '/juridique/cookies',
    },
    '/legal/gdpr': {
      en: '/legal/gdpr',
      fr: '/juridique/rgpd',
    },
    '/legal/sla': {
      en: '/legal/sla',
      fr: '/juridique/sla',
    },
    '/case-studies': {
      en: '/case-studies',
      fr: '/etudes-de-cas',
    },
    '/glossary': {
      en: '/glossary',
      fr: '/glossaire',
    },
    '/events': {
      en: '/events',
      fr: '/evenements',
    },
    '/learn': {
      en: '/learn',
      fr: '/apprendre',
    },
  },
});

export type Locale = (typeof routing.locales)[number];
