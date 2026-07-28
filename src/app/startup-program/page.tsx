import { Metadata } from 'next';
import StartupProgramPageClient from './StartupProgramPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Startup Program  | Harch Corp',
  description: 'Empowering African startups with $50,000 in HarchOS credits, technical mentorship, and go-to-market support. Build on sovereign infrastructure.',
  alternates: {
    canonical: 'https://www.harchcorp.com/startup-program',
    languages: {
      en: 'https://www.harchcorp.com/startup-program',
      fr: 'https://www.harchcorp.com/fr/programme-startup',
      'x-default': 'https://www.harchcorp.com/startup-program',
    },
  },
};

export default function StartupProgramPage() {
  return <StartupProgramPageClient />;
}
