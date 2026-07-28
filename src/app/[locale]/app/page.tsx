import type { Metadata } from 'next'
import DashboardClient from '@/app/app/DashboardClient'

export const metadata: Metadata = {
  title: 'Harch Intelligence Console — Demo | Harch Corp',
  description:
    'Live investor demo of the Harch Intelligence platform. Explore 1,798 GPUs across 5 carbon-aware hubs in Morocco.',
  robots: { index: false, follow: false },
}

export default function LocaleAppPage() {
  return <DashboardClient />
}
