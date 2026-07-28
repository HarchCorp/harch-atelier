import { Metadata } from 'next';
import HiringProcessPageClient from './HiringProcessPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Hiring Process  | Harch Corp',
  description: 'Our transparent, fair hiring process. Learn how we hire at Harch Corp — from application to offer in 6 clear steps.',
  alternates: {
    canonical: 'https://www.harchcorp.com/careers/hiring-process',
    languages: {
      en: 'https://www.harchcorp.com/careers/hiring-process',
      fr: 'https://www.harchcorp.com/fr/carrieres/hiring-process',
      'x-default': 'https://www.harchcorp.com/careers/hiring-process',
    },
  },
};

export default function HiringProcessPage() {
  return <HiringProcessPageClient />;
}
