// Light/dark section alternation tokens for atelier pages
// Pattern: dark hero → light problem → dark solution → light comparison → dark pricing → light FAQ → dark CTA

export const LIGHT = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  borderDark: "#D4D4D8",
  textPrimary: "#0A0A0A",
  textSecondary: "#525252",
  textDim: "#71717A",
  textMuted: "rgba(0,0,0,0.60)",
  accent: "#4A5D6E",  // darker slate for contrast on white
  sage: "#3D6650",    // darker sage for contrast on white
  sageBright: "#4A7B5F",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
} as const;

export const DARK = {
  bg: "#0A0A0A",
  surface1: "#0D0D0D",
  surface2: "#121212",
  surface3: "#141414",
  surface4: "#1A1A1A",
  surface5: "#1E1E1E",
  border: "#1E1E1E",
  textPrimary: "#FFFFFF",
  textSecondary: "#999999",
  textDim: "#666666",
  textMuted: "rgba(255,255,255,0.62)",
  accent: "#8B9DAF",
  sage: "#4A7B5F",
  sageBright: "#6FA386",
} as const;

// Alternation pattern: sections alternate dark/light/dark/light...
// This creates visual rhythm and prevents "wall of black" fatigue
export const SECTION_THEMES = [
  "dark",   // Hero
  "dark",   // Logo wall
  "light",  // Problem / market stat
  "dark",   // Solution / features
  "light",  // Use cases teaser
  "dark",   // Process
  "light",  // Comparison landscape
  "dark",   // Benchmark table
  "light",  // Proof / testimonials
  "dark",   // Mid CTA
  "light",  // Pricing
  "dark",   // FAQ
  "dark",   // Final CTA
  "dark",   // Footer
] as const;
