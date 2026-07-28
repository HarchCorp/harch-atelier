'use client';
import { useEffect } from 'react';
import Link from 'next/link';
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Dashboard error:', error); }, [error]);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Dashboard Error</h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>The dashboard encountered an error.</p>
        <details style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Error details</summary>
          <pre style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#dc2626', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {error?.message || 'Unknown error'}{error?.digest ? `\nDigest: ${error.digest}` : ''}{error?.stack ? `\n\n${error.stack}` : ''}
          </pre>
        </details>
        <button onClick={() => reset()} style={{ padding: '0.5rem 1.25rem', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.875rem', fontWeight: 600, borderRadius: '0.375rem', border: 'none', cursor: 'pointer', marginRight: '0.75rem' }}>Retry</button>
        <a href="/login" style={{ padding: '0.5rem 1.25rem', backgroundColor: '#fff', color: '#475569', fontSize: '0.875rem', fontWeight: 600, borderRadius: '0.375rem', border: '1px solid #e2e8f0', textDecoration: 'none' }}>Back to Login</a>
      </div>
    </div>
  );
}
