import MRECalculatorClient from './MRECalculatorClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'MRE Savings Calculator — Combien perdez-vous ? | Harch Corp',
  description: 'Calculez combien vous perdez en frais de transfert chaque année.',
};

export default function Page() {
  return <MRECalculatorClient />;
}
