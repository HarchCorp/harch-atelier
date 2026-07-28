import Link from "next/link";

/**
 * BrandBadge — Reusable navbar logo for Harch subsidiaries.
 *
 * Pattern: "HARCH | <subsidiary>"
 * - Keeps the Harch Corp brand mark (the | separator)
 * - Replaces "CORP" with the subsidiary name
 * - Maintains brand attachment ("faut pas perdre le nord")
 *
 * Usage:
 *   <BrandBadge subsidiary="Atelier" href="/" />
 *   <BrandBadge subsidiary="Energy" />
 *   <BrandBadge subsidiary="Cement" />
 */

interface BrandBadgeProps {
  /** Subsidiary name (replaces "CORP") */
  subsidiary: string;
  /** Optional link target. If not provided, renders as non-link */
  href?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Optional accent color override (defaults to Harch slate) */
  accentColor?: string;
  /** Theme variant — "dark" (default) for dark backgrounds, "light" for white backgrounds */
  theme?: "dark" | "light";
}

const SIZE_MAP = {
  sm: {
    harch: "text-xs",
    pipe: "text-xs",
    sub: "text-xs",
    height: "h-7",
    gap: "gap-1.5",
  },
  md: {
    harch: "text-sm sm:text-base",
    pipe: "text-sm sm:text-base",
    sub: "text-sm sm:text-base",
    height: "h-9",
    gap: "gap-2",
  },
  lg: {
    harch: "text-lg sm:text-xl",
    pipe: "text-lg sm:text-xl",
    sub: "text-lg sm:text-xl",
    height: "h-12",
    gap: "gap-2.5",
  },
};

export function BrandBadge({
  subsidiary,
  href,
  size = "md",
  accentColor,
  theme = "dark",
}: BrandBadgeProps) {
  const sizes = SIZE_MAP[size];
  const accent =
    accentColor || (theme === "light" ? "#4A5D6E" : "var(--accent, #8B9DAF)");
  const textColor = theme === "light" ? "#0A0A0A" : "#FFFFFF";
  const pipeColor =
    theme === "light" ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)";

  const content = (
    <span
      className={`flex items-center ${sizes.gap} ${sizes.height} group min-w-0`}
      aria-label={`Harch ${subsidiary}`}
    >
      {/* Brand mark — small square with accent border (visual identity) */}
      <span
        className="relative inline-block w-3.5 h-3.5 flex-shrink-0 border border-current"
        style={{ color: accent }}
        aria-hidden
      >
        <span
          className="absolute inset-[3px]"
          style={{ background: accent, opacity: 0.6 }}
        />
      </span>
      {/* HARCH — bold */}
      <span
        className={`${sizes.harch} font-bold tracking-[0.2em] uppercase truncate leading-none`}
        style={{ color: textColor }}
      >
        HARCH
      </span>
      {/* Pipe separator */}
      <span
        className={`${sizes.pipe} font-light leading-none`}
        style={{ color: pipeColor }}
        aria-hidden
      >
        |
      </span>
      {/* Subsidiary name — accent color, lighter weight */}
      <span
        className={`${sizes.sub} font-light tracking-[0.2em] uppercase truncate leading-none`}
        style={{ color: accent }}
      >
        {subsidiary}
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex group-hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

export default BrandBadge;
