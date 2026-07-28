import type { Metadata } from 'next'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: 'Harch Intelligence Console — Demo | Harch Corp',
  description:
    'Live investor demo of the Harch Intelligence platform. Explore 1,798 GPUs across 5 carbon-aware hubs in Morocco, real-time utilization, deployments, and billing.',
  keywords: [
    'Harch Intelligence',
    'Harch Corp',
    'GPU cloud',
    'carbon-aware compute',
    'Morocco datacenter',
    'AI inference',
    'investor demo',
  ],
  authors: [{ name: 'Harch Corp' }],
  openGraph: {
    title: 'Harch Intelligence Console — Demo',
    description:
      'Live investor demo: 1,798 GPUs · 5 hubs · 47 gCO2/kWh blended carbon intensity.',
    siteName: 'Harch Corp',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harch Intelligence Console — Demo',
    description:
      'Live investor demo: 1,798 GPUs · 5 hubs · 47 gCO2/kWh blended carbon intensity.',
  },
  robots: { index: false, follow: false },
}

export default function AppPage() {
  return <DashboardClient />
}
