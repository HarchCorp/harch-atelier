import { Metadata } from 'next';
import TrademarkPageClient from './TrademarkPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Trademark Guidelines  | Harch Corp',
  description: 'Guidelines for the proper use of Harch Corp trademarks, logos, and brand assets.',
  alternates: {
    canonical: 'https://www.harchcorp.com/legal/trademark',
    languages: {
      en: 'https://www.harchcorp.com/legal/trademark',
      fr: 'https://www.harchcorp.com/fr/juridique/trademark',
      'x-default': 'https://www.harchcorp.com/legal/trademark',
    },
  },
};

export default function TrademarkPage() {
  return <TrademarkPageClient />;
}
