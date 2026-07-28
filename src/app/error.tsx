'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
      {/* Fade-in animation styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes errorFadeIn {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .error-animate {
              animation: errorFadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              opacity: 0;
            }
            .error-animate-delay-1 { animation-delay: 0.1s; }
            .error-animate-delay-2 { animation-delay: 0.2s; }
            .error-animate-delay-3 { animation-delay: 0.35s; }
            .error-animate-delay-4 { animation-delay: 0.5s; }
          `,
        }}
      />

      {/* Error icon — warning triangle */}
      <div className="error-animate mb-6">
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#A0524B"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      {/* Header */}
      <h1
        className="error-animate error-animate-delay-1 text-3xl sm:text-4xl font-bold tracking-tight"
        style={{ color: '#A0524B' }}
      >
        SYSTEM ERROR
      </h1>

      {/* Error message */}
      <p className="error-animate error-animate-delay-2 mt-6 text-sm text-[#999999] text-center max-w-md">
        A critical system fault has been detected. The operation could not be completed.
      </p>

      {/* Digest / error detail */}
      {error?.message && (
        <div className="error-animate error-animate-delay-3 mt-4 px-4 py-3 rounded-lg bg-[rgba(160,82,75,0.08)] border border-[rgba(160,82,75,0.15)] max-w-lg">
          <p className="text-xs font-mono text-[#A0524B] break-words">
            {error.message}
          </p>
        </div>
      )}

      {error?.digest && (
        <p className="error-animate error-animate-delay-3 mt-2 text-xs font-mono text-[rgba(255,255,255,0.2)]">
          Digest: {error.digest}
        </p>
      )}

      {/* Actions */}
      <div className="error-animate error-animate-delay-4 mt-10 flex flex-col sm:flex-row gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center h-12 px-8 bg-white text-black text-sm font-semibold rounded-lg transition-all duration-200 hover:bg-[#e0e0e0] active:scale-[0.98] cursor-pointer"
        >
          Retry
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-12 px-8 border border-[rgba(255,255,255,0.12)] text-white text-sm font-medium rounded-lg transition-all duration-200 hover:border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.04)] active:scale-[0.98]"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
