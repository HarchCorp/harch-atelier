import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Harch Intelligence Console — Demo | Harch Corp',
  description: 'Live investor demo of the Harch Intelligence platform.',
  robots: { index: false, follow: false },
};

export default function AppPage() {
  return <DashboardClient />;
}
