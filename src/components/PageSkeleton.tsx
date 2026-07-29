'use client';

import { HarchLogo } from '@/components/HarchLogo';

// ═══════════════════════════════════════════════════════════════
//  PAGE SKELETON — Harch Atelier (light theme)
//
//  Per Design System V2: Atelier is light mode (bg-white / neutral-50).
//  The previous version used dark mode (#0A0A0A) inherited from
//  harch-corp — wrong theme.
// ═══════════════════════════════════════════════════════════════

type PageSkeletonVariant = 'default' | 'hero' | 'data' | 'text';

interface PageSkeletonProps {
  variant?: PageSkeletonVariant;
}

/* ── Shimmer block (light theme) ── */
function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-neutral-200 ${className ?? ''}`}
    >
      {/* Moving highlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.04) 40%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.04) 60%, transparent 100%)',
          animation: 'shimmerSlide 2s ease-in-out infinite',
        }}
      />
    </div>
  );
}

/* ── Inline keyframes (injected once) ── */
function ShimmerStyles() {
  return (
    <style>{`
      @keyframes shimmerSlide {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes fadeInSkeleton {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `}</style>
  );
}

export function PageSkeleton({ variant = 'default' }: PageSkeletonProps) {
  return (
    <div
      className="min-h-screen bg-white flex flex-col items-center justify-start pt-24 pb-16 px-4 md:px-12"
      style={{ animation: 'fadeInSkeleton 0.5s ease forwards' }}
    >
      <ShimmerStyles />

      {/* Logo */}
      <div className="mb-12">
        <HarchLogo variant="mark" className="opacity-60" />
      </div>

      {/* Hero skeleton */}
      {variant === 'hero' || variant === 'default' ? (
        <div className="w-full max-w-4xl space-y-6">
          <ShimmerBlock className="h-4 w-32" />
          <ShimmerBlock className="h-12 w-full" />
          <ShimmerBlock className="h-12 w-3/4" />
          <ShimmerBlock className="h-6 w-full mt-8" />
          <ShimmerBlock className="h-6 w-5/6" />
          <div className="flex gap-4 mt-8">
            <ShimmerBlock className="h-12 w-40 rounded-lg" />
            <ShimmerBlock className="h-12 w-40 rounded-lg" />
          </div>
        </div>
      ) : null}

      {/* Stats grid skeleton */}
      {variant === 'data' || variant === 'default' ? (
        <div className="w-full max-w-6xl mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-3">
              <ShimmerBlock className="h-8 w-16" />
              <ShimmerBlock className="h-4 w-24" />
            </div>
          ))}
        </div>
      ) : null}

      {/* Text skeleton */}
      {variant === 'text' ? (
        <div className="w-full max-w-3xl space-y-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <ShimmerBlock key={i} className="h-4 w-full" />
          ))}
        </div>
      ) : null}

      {/* Footer divider */}
      <div className="h-px w-full bg-neutral-200 mt-16" />
    </div>
  );
}

export default PageSkeleton;
