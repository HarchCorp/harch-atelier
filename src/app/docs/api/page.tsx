import type { Metadata } from 'next';
import ApiDocsPageClient from './ApiDocsPageClient';

export const metadata: Metadata = {
  title: 'API Reference — HarchOS',
  description: 'Complete API reference for HarchOS. REST API, gRPC services, WebSocket endpoints, authentication, rate limits, and error codes.',
  keywords: [
    'HarchOS API',
    'REST API reference',
    'gRPC API',
    'WebSocket API',
    'authentication',
    'rate limits',
    'API error codes',
  ],
  openGraph: {
    title: 'API Reference — HarchOS',
    description: 'Complete API reference for HarchOS platform. REST, gRPC, WebSocket endpoints with authentication and rate limiting.',
    url: 'https://www.harchcorp.com/docs/api',
    siteName: 'Harch Corp',
    type: 'website',
  },
  alternates: { canonical: 'https://www.harchcorp.com/docs/api' },
};

export default function ApiDocsPage() {
  return <ApiDocsPageClient />;
}
