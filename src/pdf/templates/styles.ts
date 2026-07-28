/**
 * HarchCorp PDF Shared Styles
 * Reusable style definitions for all PDF documents
 */
import { HarchTheme as t } from './theme';
import { StyleSheet } from '@react-pdf/renderer';

export const pdfStyles = StyleSheet.create({
  // === PAGE ===
  page: {
    backgroundColor: t.colors.pdfBg,
    color: t.colors.pdfText,
    fontFamily: t.fonts.body,
    fontSize: t.fontSize.base,
    lineHeight: t.lineHeight.normal,
    paddingVertical: t.spacing['3xl'],
    paddingHorizontal: t.spacing['2xl'],
  },

  // === HEADERS ===
  h1: {
    fontSize: t.fontSize['3xl'],
    fontFamily: t.fonts.heading,
    fontWeight: 700,
    color: t.colors.pdfText,
    marginBottom: t.spacing.lg,
    lineHeight: t.lineHeight.tight,
  },
  h2: {
    fontSize: t.fontSize['2xl'],
    fontFamily: t.fonts.heading,
    fontWeight: 700,
    color: t.colors.pdfText,
    marginBottom: t.spacing.md,
    marginTop: t.spacing.xl,
    lineHeight: t.lineHeight.tight,
  },
  h3: {
    fontSize: t.fontSize.xl,
    fontFamily: t.fonts.heading,
    fontWeight: 600,
    color: t.colors.pdfText,
    marginBottom: t.spacing.sm,
    marginTop: t.spacing.lg,
    lineHeight: t.lineHeight.tight,
  },
  h4: {
    fontSize: t.fontSize.lg,
    fontFamily: t.fonts.heading,
    fontWeight: 600,
    color: t.colors.accentDark,
    marginBottom: t.spacing.sm,
    marginTop: t.spacing.md,
    lineHeight: t.lineHeight.tight,
  },

  // === TEXT ===
  body: {
    fontSize: t.fontSize.base,
    lineHeight: t.lineHeight.relaxed,
    color: t.colors.pdfText,
    marginBottom: t.spacing.sm,
  },
  bodySmall: {
    fontSize: t.fontSize.sm,
    lineHeight: t.lineHeight.relaxed,
    color: t.colors.pdfTextSecondary,
    marginBottom: t.spacing.xs,
  },
  caption: {
    fontSize: t.fontSize.xs,
    color: t.colors.textDim,
    lineHeight: t.lineHeight.normal,
  },
  mono: {
    fontFamily: t.fonts.mono,
    fontSize: t.fontSize.sm,
  },

  // === LAYOUT ===
  section: {
    marginBottom: t.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    marginBottom: t.spacing.md,
  },
  col: {
    flexDirection: 'column',
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flex3: { flex: 3 },

  // === CARDS ===
  card: {
    backgroundColor: t.colors.pdfCardBg,
    borderRadius: t.radius.lg,
    padding: t.spacing.lg,
    marginBottom: t.spacing.md,
  },
  cardAccent: {
    backgroundColor: t.colors.accent,
    borderRadius: t.radius.lg,
    padding: t.spacing.lg,
    marginBottom: t.spacing.md,
  },
  cardDark: {
    backgroundColor: t.colors.pdfHeaderBg,
    borderRadius: t.radius.lg,
    padding: t.spacing.lg,
    marginBottom: t.spacing.md,
  },

  // === DIVIDERS ===
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: t.colors.pdfBorder,
    marginBottom: t.spacing.lg,
    paddingBottom: t.spacing.lg,
  },
  dividerAccent: {
    borderBottomWidth: 2,
    borderBottomColor: t.colors.accent,
    marginBottom: t.spacing.lg,
    paddingBottom: t.spacing.lg,
  },

  // === TABLES ===
  table: {
    marginBottom: t.spacing.lg,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: t.colors.pdfTableHeader,
    borderRadius: t.radius.md,
    paddingVertical: t.spacing.sm,
    paddingHorizontal: t.spacing.md,
  },
  tableHeaderText: {
    fontSize: t.fontSize.sm,
    fontFamily: t.fonts.heading,
    fontWeight: 600,
    color: t.colors.textPrimary,
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: t.spacing.sm,
    paddingHorizontal: t.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.pdfBorder,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: t.spacing.sm,
    paddingHorizontal: t.spacing.md,
    backgroundColor: t.colors.pdfTableStripe,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.pdfBorder,
  },
  tableCell: {
    fontSize: t.fontSize.sm,
    flex: 1,
    color: t.colors.pdfText,
  },
  tableCellBold: {
    fontSize: t.fontSize.sm,
    flex: 1,
    fontWeight: 600,
    color: t.colors.pdfText,
  },

  // === METRICS / KPI ===
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: t.spacing.lg,
  },
  metricCard: {
    width: '23%',
    backgroundColor: t.colors.pdfCardBg,
    borderRadius: t.radius.lg,
    padding: t.spacing.md,
    marginRight: '2%',
    marginBottom: t.spacing.sm,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: t.fontSize['2xl'],
    fontWeight: 700,
    color: t.colors.accent,
    fontFamily: t.fonts.heading,
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: t.fontSize.xs,
    color: t.colors.pdfTextSecondary,
    textAlign: 'center',
    marginTop: t.spacing.xs,
  },

  // === BADGES ===
  badge: {
    backgroundColor: t.colors.accent,
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing.sm,
    paddingVertical: t.spacing.xs,
    marginRight: t.spacing.xs,
    marginBottom: t.spacing.xs,
  },
  badgeText: {
    color: t.colors.textOnAccent,
    fontSize: t.fontSize.xs,
    fontWeight: 600,
  },
  badgeOutline: {
    borderWidth: 1,
    borderColor: t.colors.accent,
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing.sm,
    paddingVertical: t.spacing.xs,
    marginRight: t.spacing.xs,
    marginBottom: t.spacing.xs,
  },
  badgeOutlineText: {
    color: t.colors.accent,
    fontSize: t.fontSize.xs,
    fontWeight: 600,
  },

  // === LISTS ===
  bulletList: {
    marginBottom: t.spacing.md,
    paddingLeft: t.spacing.md,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: t.spacing.xs,
  },
  bullet: {
    width: t.spacing.md,
    color: t.colors.accent,
    fontSize: t.fontSize.base,
  },
  bulletText: {
    flex: 1,
    fontSize: t.fontSize.base,
    lineHeight: t.lineHeight.relaxed,
    color: t.colors.pdfText,
  },

  // === COVER PAGE ===
  coverPage: {
    backgroundColor: t.colors.pdfHeaderBg,
    color: t.colors.textPrimary,
    paddingVertical: t.spacing['4xl'],
    paddingHorizontal: t.spacing['3xl'],
    justifyContent: 'space-between',
  },
  coverTitle: {
    fontSize: 42,
    fontFamily: t.fonts.heading,
    fontWeight: 700,
    color: t.colors.textPrimary,
    lineHeight: 1.1,
    marginBottom: t.spacing.lg,
  },
  coverSubtitle: {
    fontSize: t.fontSize.xl,
    color: t.colors.accent,
    fontFamily: t.fonts.heading,
    fontWeight: 400,
    lineHeight: t.lineHeight.normal,
    marginBottom: t.spacing['2xl'],
  },
  coverAccent: {
    width: 60,
    height: 4,
    backgroundColor: t.colors.accent,
    marginBottom: t.spacing.xl,
  },
  coverFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  coverMeta: {
    fontSize: t.fontSize.sm,
    color: t.colors.textSecondary,
  },

  // === SECTION LABEL ===
  sectionLabel: {
    fontSize: t.fontSize.xs,
    fontFamily: t.fonts.mono,
    fontWeight: 700,
    color: t.colors.accent,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: t.spacing.sm,
  },

  // === CALLOUT ===
  callout: {
    backgroundColor: t.colors.pdfCardBg,
    borderLeftWidth: 3,
    borderLeftColor: t.colors.accent,
    padding: t.spacing.lg,
    marginBottom: t.spacing.lg,
  },
  calloutText: {
    fontSize: t.fontSize.md,
    color: t.colors.pdfText,
    lineHeight: t.lineHeight.relaxed,
  },

  // === CTA ===
  ctaBox: {
    backgroundColor: t.colors.accent,
    borderRadius: t.radius.lg,
    padding: t.spacing.xl,
    alignItems: 'center',
    marginTop: t.spacing['3xl'],
  },
  ctaTitle: {
    fontSize: t.fontSize.xl,
    fontWeight: 700,
    color: t.colors.textOnAccent,
    marginBottom: t.spacing.sm,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: t.fontSize.md,
    color: t.colors.textOnAccent,
    textAlign: 'center',
    opacity: 0.9,
  },

  // === PAGE NUMBER ===
  pageNumber: {
    position: 'absolute',
    fontSize: t.fontSize.xs,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: t.colors.textDim,
  },
});
