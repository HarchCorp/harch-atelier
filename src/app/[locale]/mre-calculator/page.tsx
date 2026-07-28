import MRECalculatorClient from './MRECalculatorClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'MRE Savings Calculator — Combien perdez-vous ? | Harch Corp',
  description: 'Calculez combien vous perdez en frais de transfert chaque année. Comparez banques, Western Union, Wise et Harch MRE Services. Découvrez vos revenus locatifs potentiels.',
  keywords: ['MRE calculateur', 'transfert argent Maroc', 'frais transfert MRE', 'gestion locative Maroc', 'Harch MRE Services'],
};

export default function MRECalculatorPage() {
  return <MRECalculatorClient />;
}
