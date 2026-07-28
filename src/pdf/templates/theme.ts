/**
 * HarchCorp PDF Design System
 * Consistent branding, colors, fonts, and spacing for all PDFs
 */

export const HarchTheme = {
  // Brand Colors
  colors: {
    // Primary brand palette
    accent: '#8B9DAF',        // Slate blue - primary brand accent
    accentDark: '#4A5D6E',    // Darker accent
    accentLight: '#B3C4D4',   // Lighter accent

    // Backgrounds
    bgDark: '#0A0A0A',        // Deepest background
    bgMedium: '#1A1A1A',      // Secondary background
    bgLight: '#252525',       // Tertiary background
    bgCard: '#141414',        // Card background

    // Text
    textPrimary: '#FFFFFF',   // Primary text
    textSecondary: '#999999', // Secondary text
    textDim: '#666666',       // Dim text
    textOnAccent: '#000000',  // Text on accent bg

    // Status
    success: '#4A7B5F',       // Sage green
    warning: '#4A5D6E',       // Warning
    error: '#A0524B',         // Muted red

    // Chart colors
    chart1: '#8B9DAF',
    chart2: '#999999',
    chart3: '#666666',
    chart4: '#4A5D6E',
    chart5: '#1E1E1E',

    // PDF-specific (print-friendly)
    pdfBg: '#FFFFFF',         // White background for PDF pages
    pdfText: '#1A1A1A',       // Dark text for PDF
    pdfTextSecondary: '#4A5D6E', // Secondary text for PDF
    pdfBorder: '#E0E0E0',     // Light borders for PDF
    pdfCardBg: '#F8F9FA',     // Light card background for PDF
    pdfHeaderBg: '#0A0A0A',   // Dark header for PDF
    pdfAccentBg: '#8B9DAF',   // Accent background for PDF
    pdfTableHeader: '#1A1A1A',// Table header bg
    pdfTableStripe: '#F5F5F5',// Alternating row
    pdfSuccessBg: '#E8F5E9',  // Light green bg
    pdfWarningBg: '#FFF3E0',  // Light orange bg
  },

  // Typography
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'SpaceMono',
  },

  // Font sizes
  fontSize: {
    xs: 7,
    sm: 8,
    base: 9,
    md: 10,
    lg: 12,
    xl: 14,
    '2xl': 18,
    '3xl': 24,
    '4xl': 32,
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    '3xl': 32,
    '4xl': 48,
  },

  // Page dimensions
  page: {
    width: 595.28,  // A4 width in points
    height: 841.89, // A4 height in points
    marginH: 40,    // Horizontal margin
    marginV: 50,    // Vertical margin (top/bottom)
    contentWidth: 515.28, // width - 2*marginH
  },

  // Border radius
  radius: {
    sm: 2,
    md: 4,
    lg: 8,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
} as const;

export type HarchThemeType = typeof HarchTheme;
