'use client';

import { HarchLogo } from '@/components/HarchLogo';

type PageSkeletonVariant = 'default' | 'hero' | 'data' | 'text';

interface PageSkeletonProps {
  variant?: PageSkeletonVariant;
}

/* ── Shimmer block ── */
function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-[rgba(255,255,255,0.04)] ${className ?? ''}`}
    >
      {/* Moving highlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 60%, transparent 100%)',
          animation: 'shimmerSlide 2s ease-in-out infinite',
        }}
      />
    </div>
  );
}

/* ── Inline keyframes (injected once) ── */
function ShimmerStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmerSlide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes fadeInSkeleton {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `,
      }}
    />
  );
}

/* ── Hero variant ── */
function HeroSkeleton() {
  return (
    <div className="space-y-8">
      <ShimmerBlock className="h-[50vh] min-h-[300px] w-full rounded-xl" />
      <div className="max-w-3xl space-y-4 px-4 md:px-0">
        <ShimmerBlock className="h-10 w-3/4" />
        <ShimmerBlock className="h-5 w-full" />
        <ShimmerBlock className="h-5 w-5/6" />
      </div>
    </div>
  );
}

/* ── Data variant ── */
function DataSkeleton() {
  return (
    <div className="space-y-6">
      {/* Chart / dashboard area */}
      <ShimmerBlock className="h-[300px] w-full rounded-xl" />
      {/* Table header */}
      <div className="space-y-3">
        <ShimmerBlock className="h-4 w-1/4" />
        <div className="grid grid-cols-4 gap-4">
          <ShimmerBlock className="h-10 w-full" />
          <ShimmerBlock className="h-10 w-full" />
          <ShimmerBlock className="h-10 w-full" />
          <ShimmerBlock className="h-10 w-full" />
        </div>
        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            <ShimmerBlock className="h-8 w-full" />
            <ShimmerBlock className="h-8 w-full" />
            <ShimmerBlock className="h-8 w-full" />
            <ShimmerBlock className="h-8 w-full" />
          </div>
        ))}
      </div>
      {/* Small stats row */}
      <div className="grid grid-cols-3 gap-4">
        <ShimmerBlock className="h-24 rounded-xl" />
        <ShimmerBlock className="h-24 rounded-xl" />
        <ShimmerBlock className="h-24 rounded-xl" />
      </div>
    </div>
  );
}

/* ── Text variant ── */
function TextSkeleton() {
  return (
    <div className="max-w-3xl space-y-6 px-4 md:px-0">
      {/* Title */}
      <ShimmerBlock className="h-10 w-3/4" />
      {/* Meta line */}
      <ShimmerBlock className="h-4 w-1/3" />
      {/* Divider */}
      <div className="h-px w-full bg-[rgba(255,255,255,0.06)]" />
      {/* Paragraphs */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <ShimmerBlock className={`h-4 w-full`} />
          <ShimmerBlock className={`h-4 w-${i % 2 === 0 ? '5/6' : 'full'}`} />
        </div>
      ))}
      {/* Subheading */}
      <ShimmerBlock className="h-7 w-1/2" />
      {/* More paragraphs */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={`b-${i}`} className="space-y-2">
          <ShimmerBlock className="h-4 w-full" />
          <ShimmerBlock className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

/* ── Default variant ── */
function DefaultSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero block */}
      <HeroSkeleton />
      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-0">
        <div className="space-y-4">
          <ShimmerBlock className="h-48 rounded-xl" />
          <ShimmerBlock className="h-4 w-3/4" />
          <ShimmerBlock className="h-4 w-1/2" />
        </div>
        <div className="space-y-4">
          <ShimmerBlock className="h-48 rounded-xl" />
          <ShimmerBlock className="h-4 w-3/4" />
          <ShimmerBlock className="h-4 w-1/2" />
        </div>
      </div>
      {/* Text lines */}
      <div className="max-w-3xl space-y-3 px-4 md:px-0">
        <ShimmerBlock className="h-4 w-full" />
        <ShimmerBlock className="h-4 w-5/6" />
        <ShimmerBlock className="h-4 w-4/5" />
      </div>
    </div>
  );
}

/* ── Main component ── */
export function PageSkeleton({ variant = 'default' }: PageSkeletonProps) {
  return (
    <div
      className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-start pt-24 pb-16 px-4 md:px-12"
      style={{ animation: 'fadeInSkeleton 0.5s ease forwards' }}
    >
      <ShimmerStyles />

      {/* Centered pulsing H logo */}
      <div className="mb-12 animate-pulse">
        <div className="flex items-center gap-0">
          <span className="text-2xl font-bold tracking-[0.25em] text-white/20 uppercase">
            HARCH
          </span>
          <span className="text-[rgba(255,255,255,0.08)] mx-2 text-2xl font-light">|</span>
          <span className="text-2xl font-light tracking-[0.25em] text-[rgba(255,255,255,0.12)] uppercase">
            CORP
          </span>
        </div>
      </div>

      {/* Variant skeleton */}
      <div className="w-full max-w-6xl">
        {variant === 'default' && <DefaultSkeleton />}
        {variant === 'hero' && <HeroSkeleton />}
        {variant === 'data' && <DataSkeleton />}
        {variant === 'text' && <TextSkeleton />}
      </div>
    </div>
  );
}
