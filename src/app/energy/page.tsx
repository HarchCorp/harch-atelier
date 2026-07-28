import { Metadata } from 'next';
import EnergyLanding from './EnergyLanding';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Harch Energy — Coupez votre facture ONEE de 40 à 60% | Solaire B2B Maroc',
  description: 'Installation solaire EPC ou PPA pour entreprises au Maroc. 0 MAD à investir en PPA. Subventions FDE 1,5M MAD. Garantie 10 ans. Devis gratuit 48h.',
  keywords: ['installation solaire entreprise maroc', 'epc solaire maroc', 'ppa solaire maroc', 'autoconsommation solaire', 'harch energy'],
  alternates: { canonical: 'https://www.harchcorp.com/energy' },
  openGraph: {
    title: 'Harch Energy — Solaire B2B Maroc',
    description: 'Coupez votre facture ONEE de 40 à 60%. EPC ou PPA. Devis gratuit 48h.',
    url: 'https://www.harchcorp.com/energy',
  },
};

export default function EnergyPage() {
  return <EnergyLanding />;
}
