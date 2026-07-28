import { Metadata } from 'next';
import CustomersPageClient from './CustomersPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Customer Stories  | Harch Corp',
  description: 'How African organizations are transforming with Harch Corp — case studies from finance, energy, agriculture, mining, water, and government sectors.',
  alternates: {
    canonical: 'https://www.harchcorp.com/customers',
    languages: {
      en: 'https://www.harchcorp.com/customers',
      fr: 'https://www.harchcorp.com/fr/clients',
      'x-default': 'https://www.harchcorp.com/customers',
    },
  },
};

export default function CustomersPage() {
  return <CustomersPageClient />;
}
