"use client";

// ═══════════════════════════════════════════════════════════════
//  SkeletonLoader.tsx — Reusable loading skeleton
//
//  Renders a pulsing placeholder that matches the offer's accent
//  color. Used while API data is being fetched.
//
//  Usage:
//    <SkeletonLoader accent="#059669" lines={3} />
//    <SkeletonLoader accent="#0891b2" lines={1} height={36} />
// ═══════════════════════════════════════════════════════════════

export function SkeletonLoader({
  accent,
  lines = 3,
  height = 16,
  width = "100%",
  dark = false,
}: {
  accent: string;
  lines?: number;
  height?: number;
  width?: string;
  dark?: boolean;
}) {
  // NOTE: `dark` prop is retained for API backward-compatibility but is a
  // no-op — the console is a corporate light theme only (white/green/blue).
  // Skeletons always render as light gray on white, like Stripe/Notion.
  void dark;
  const bgColor = "#f4f4f5";
  const pulseColor = "#e5e5e5";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === lines - 1 ? "60%" : width,
            height: `${height}px`,
            background: `linear-gradient(90deg, ${bgColor} 0%, ${pulseColor} 50%, ${bgColor} 100%)`,
            backgroundSize: "200% 100%",
            borderRadius: "4px",
            animation: "skeleton-pulse 1.5s ease-in-out infinite",
          }}
        />
      ))}
      <style>{`
        @keyframes skeleton-pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// Error state — graceful degradation when API fails
export function ErrorState({
  accent,
  message = "Signal lost — reconnecting to sources…",
  dark = false,
}: {
  accent: string;
  message?: string;
  dark?: boolean;
}) {
  // NOTE: `dark` prop is retained for API backward-compatibility but is a
  // no-op — the console is a corporate light theme only.
  void dark;
  return (
    <div
      style={{
        padding: "32px 24px",
        textAlign: "center",
        borderRadius: "8px",
        border: `1px dashed ${accent}40`,
        background: `${accent}08`,
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: accent,
          margin: "0 auto 12px",
          animation: "error-pulse 1s ease-in-out infinite",
        }}
      />
      <div
        style={{
          fontSize: "13px",
          fontFamily: "'Space Mono', monospace",
          color: "#525252",
          lineHeight: 1.5,
        }}
      >
        {message}
      </div>
      <style>{`
        @keyframes error-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
