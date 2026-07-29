import Link from "next/link";

// ═══════════════════════════════════════════════════════════════
//  HARCH LOGO — Atelier variant (light theme)
//
//  Per Design System V2: Atelier uses light mode (text-neutral-950).
//  The previous version was hardcoded "HARCH | CORP" in dark mode
//  (text-white) — wrong product, wrong theme.
//
//  Usage:
//    <HarchLogo />                       // default — full logo
//    <HarchLogo variant="mark" />        // just "H" mark
//    <HarchLogo className="..." />       // custom classes
// ═══════════════════════════════════════════════════════════════

interface HarchLogoProps {
  variant?: "full" | "mark";
  className?: string;
}

export function HarchLogo({ variant = "full", className = "" }: HarchLogoProps) {
  if (variant === "mark") {
    return (
      <Link
        href="/atelier"
        className={`flex items-center justify-center w-9 h-9 rounded-md bg-neutral-950 text-white font-bold text-base ${className}`}
        aria-label="Harch Atelier — Home"
      >
        H
      </Link>
    );
  }

  return (
    <Link
      href="/atelier"
      className={`flex items-center gap-2 group min-w-0 h-9 ${className}`}
      aria-label="Harch Atelier — Home"
    >
      <span className="text-base sm:text-lg font-bold tracking-[0.2em] text-neutral-950 uppercase truncate leading-none">
        HARCH
      </span>
      <span className="text-base sm:text-lg font-light leading-none text-neutral-300">
        |
      </span>
      <span className="text-base sm:text-lg font-light tracking-[0.2em] text-stone-500 uppercase truncate leading-none">
        ATELIER
      </span>
    </Link>
  );
}

export default HarchLogo;
