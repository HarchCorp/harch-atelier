/**
 * HarchCorp PDF Reusable Components
 * Shared UI components for all PDF documents
 */
import React from 'react';
import {
  View,
  Text,
  Link,
  Image,
  Font,
} from '@react-pdf/renderer';
import { HarchTheme as t } from './theme';
import { pdfStyles as s } from './styles';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiA.woff2', fontWeight: 700 },
  ],
});

Font.register({
  family: 'SpaceMono',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/spacemono/v12/i7dPIFZifjKcF5UAWdDRYE98RWq7.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/spacemono/v12/i7dMIFZifjKcF5UAWdDRaPpZUFqwH4MP.woff2', fontWeight: 700 },
  ],
});

// ============================================================
// HEADER COMPONENT
// ============================================================
interface PDFHeaderProps {
  title: string;
  subtitle?: string;
  type?: string;
  locale?: string;
}

export const PDFHeader: React.FC<PDFHeaderProps> = ({ title, subtitle, type, locale = 'en' }) => (
  <View style={{ marginBottom: t.spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: t.spacing.sm }}>
        <View style={{ width: 32, height: 32, backgroundColor: t.colors.accent, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: t.spacing.md }}>
          <Text style={{ color: t.colors.textOnAccent, fontSize: 16, fontWeight: 700, fontFamily: t.fonts.heading }}>H</Text>
        </View>
        <Text style={{ fontSize: t.fontSize.lg, fontWeight: 700, fontFamily: t.fonts.heading, color: t.colors.pdfText }}>
          HARCHCORP
        </Text>
      </View>
      {type && (
        <Text style={[s.sectionLabel, { marginBottom: 2 }]}>{type}</Text>
      )}
      <Text style={s.h2}>{title}</Text>
      {subtitle && (
        <Text style={s.bodySmall}>{subtitle}</Text>
      )}
    </View>
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={s.mono}>{locale === 'fr' ? 'www.harchcorp.com/fr' : 'www.harchcorp.com'}</Text>
      <Text style={s.caption}>{new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long' })}</Text>
    </View>
  </View>
);

// ============================================================
// FOOTER COMPONENT
// ============================================================
interface PDFFooterProps {
  pageNumber: number;
  totalPages?: number;
  locale?: string;
}

export const PDFFooter: React.FC<PDFFooterProps> = ({ pageNumber, totalPages, locale = 'en' }) => (
  <View style={{ position: 'absolute', bottom: 20, left: t.spacing['2xl'], right: t.spacing['2xl'], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} fixed>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 16, height: 16, backgroundColor: t.colors.accent, borderRadius: 3, justifyContent: 'center', alignItems: 'center', marginRight: t.spacing.sm }}>
        <Text style={{ color: t.colors.textOnAccent, fontSize: 8, fontWeight: 700 }}>H</Text>
      </View>
      <Text style={{ fontSize: t.fontSize.xs, color: t.colors.textDim }}>
        HarchCorp {locale === 'fr' ? 'SARL' : 'LLC'} — {locale === 'fr' ? 'Tous droits réservés' : 'All rights reserved'} © {new Date().getFullYear()}
      </Text>
    </View>
    <Text style={{ fontSize: t.fontSize.xs, color: t.colors.textDim }}>
      {pageNumber}{totalPages ? ` / ${totalPages}` : ''}
    </Text>
  </View>
);

// ============================================================
// COVER PAGE COMPONENT
// ============================================================
interface CoverPageProps {
  title: string;
  subtitle: string;
  type: string;
  locale?: string;
  version?: string;
}

export const CoverPage: React.FC<CoverPageProps> = ({ title, subtitle, type, locale = 'en', version = '1.0' }) => (
  <View style={s.coverPage}>
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: t.spacing['3xl'] }}>
        <View style={{ width: 40, height: 40, backgroundColor: t.colors.accent, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: t.spacing.md }}>
          <Text style={{ color: t.colors.textOnAccent, fontSize: 20, fontWeight: 700, fontFamily: t.fonts.heading }}>H</Text>
        </View>
        <Text style={{ fontSize: t.fontSize.xl, fontWeight: 700, fontFamily: t.fonts.heading, color: t.colors.textPrimary }}>
          HARCHCORP
        </Text>
      </View>

      <Text style={[s.sectionLabel, { color: t.colors.accentLight }]}>{type}</Text>
      <View style={s.coverAccent} />
      <Text style={s.coverTitle}>{title}</Text>
      <Text style={s.coverSubtitle}>{subtitle}</Text>
    </View>

    <View style={s.coverFooter}>
      <View>
        <Text style={s.coverMeta}>{locale === 'fr' ? 'Version' : 'Version'} {version}</Text>
        <Text style={s.coverMeta}>{new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long' })}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={s.coverMeta}>HarchCorp SARL</Text>
        <Text style={s.coverMeta}>Dakhla, Morocco</Text>
        <Text style={s.coverMeta}>www.harchcorp.com</Text>
      </View>
    </View>
  </View>
);

// ============================================================
// SECTION LABEL COMPONENT
// ============================================================
interface SectionLabelProps {
  children: React.ReactNode;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ children }) => (
  <Text style={s.sectionLabel}>{children}</Text>
);

// ============================================================
// METRIC CARD COMPONENT
// ============================================================
interface MetricCardProps {
  value: string;
  label: string;
  unit?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ value, label, unit }) => (
  <View style={s.metricCard}>
    <Text style={s.metricValue}>{value}</Text>
    {unit && <Text style={{ fontSize: t.fontSize.xs, color: t.colors.accent, marginTop: 2 }}>{unit}</Text>}
    <Text style={s.metricLabel}>{label}</Text>
  </View>
);

// ============================================================
// METRIC ROW COMPONENT (full-width inline metrics)
// ============================================================
interface MetricRowProps {
  metrics: Array<{ value: string; label: string; unit?: string }>;
}

export const MetricRow: React.FC<MetricRowProps> = ({ metrics }) => (
  <View style={s.metricGrid}>
    {metrics.map((m, i) => (
      <MetricCard key={i} value={m.value} label={m.label} unit={m.unit} />
    ))}
  </View>
);

// ============================================================
// DATA TABLE COMPONENT
// ============================================================
interface DataTableProps {
  headers: string[];
  rows: string[][];
  colWidths?: number[];
}

export const DataTable: React.FC<DataTableProps> = ({ headers, rows, colWidths }) => (
  <View style={s.table}>
    <View style={s.tableHeader}>
      {headers.map((h, i) => (
        <Text key={i} style={[s.tableHeaderText, colWidths ? { width: `${colWidths[i]}%` } : {}]}>{h}</Text>
      ))}
    </View>
    {rows.map((row, ri) => (
      <View key={ri} style={ri % 2 === 0 ? s.tableRow : s.tableRowAlt}>
        {row.map((cell, ci) => (
          <Text key={ci} style={[ci === 0 ? s.tableCellBold : s.tableCell, colWidths ? { width: `${colWidths[ci]}%` } : {}]}>{cell}</Text>
        ))}
      </View>
    ))}
  </View>
);

// ============================================================
// BULLET LIST COMPONENT
// ============================================================
interface BulletListProps {
  items: string[];
}

export const BulletList: React.FC<BulletListProps> = ({ items }) => (
  <View style={s.bulletList}>
    {items.map((item, i) => (
      <View key={i} style={s.bulletItem}>
        <Text style={s.bullet}>{'\u2022'}</Text>
        <Text style={s.bulletText}>{item}</Text>
      </View>
    ))}
  </View>
);

// ============================================================
// CALLOUT COMPONENT
// ============================================================
interface CalloutProps {
  children: React.ReactNode;
  accentColor?: string;
}

export const Callout: React.FC<CalloutProps> = ({ children, accentColor }) => (
  <View style={[s.callout, accentColor ? { borderLeftColor: accentColor } : {}]}>
    <Text style={s.calloutText}>{children}</Text>
  </View>
);

// ============================================================
// BADGE GROUP COMPONENT
// ============================================================
interface BadgeGroupProps {
  badges: string[];
  outline?: boolean;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({ badges, outline }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: t.spacing.md }}>
    {badges.map((badge, i) => (
      <View key={i} style={outline ? s.badgeOutline : s.badge}>
        <Text style={outline ? s.badgeOutlineText : s.badgeText}>{badge}</Text>
      </View>
    ))}
  </View>
);

// ============================================================
// SECTION DIVIDER COMPONENT
// ============================================================
interface SectionDividerProps {
  accent?: boolean;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ accent }) => (
  <View style={accent ? s.dividerAccent : s.divider} />
);

// ============================================================
// TWO COLUMN LAYOUT
// ============================================================
interface TwoColumnProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth?: number;
}

export const TwoColumn: React.FC<TwoColumnProps> = ({ left, right, leftWidth = 50 }) => (
  <View style={{ flexDirection: 'row', marginBottom: t.spacing.lg }}>
    <View style={{ width: `${leftWidth}%`, paddingRight: t.spacing.md }}>{left}</View>
    <View style={{ width: `${100 - leftWidth}%`, paddingLeft: t.spacing.md }}>{right}</View>
  </View>
);

// ============================================================
// SPEC ROW COMPONENT (label-value pairs)
// ============================================================
interface SpecRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export const SpecRow: React.FC<SpecRowProps> = ({ label, value, highlight }) => (
  <View style={{ flexDirection: 'row', paddingVertical: t.spacing.xs, borderBottomWidth: 1, borderBottomColor: t.colors.pdfBorder }}>
    <Text style={{ width: '40%', fontSize: t.fontSize.sm, color: t.colors.pdfTextSecondary, fontWeight: 500 }}>{label}</Text>
    <Text style={{ width: '60%', fontSize: t.fontSize.sm, color: highlight ? t.colors.accentDark : t.colors.pdfText, fontWeight: highlight ? 700 : 400 }}>{value}</Text>
  </View>
);

// ============================================================
// CTA BOX COMPONENT
// ============================================================
interface CTABoxProps {
  title: string;
  text: string;
  locale?: string;
}

export const CTABox: React.FC<CTABoxProps> = ({ title, text, locale = 'en' }) => (
  <View style={s.ctaBox}>
    <Text style={s.ctaTitle}>{title}</Text>
    <Text style={s.ctaText}>{text}</Text>
    <Text style={{ fontSize: t.fontSize.sm, color: t.colors.textOnAccent, marginTop: t.spacing.md, fontFamily: t.fonts.mono }}>
      www.harchcorp.com{locale === 'fr' ? '/fr' : ''}/contact
    </Text>
  </View>
);

// ============================================================
// PAGE HEADER BAR (for non-cover pages)
// ============================================================
interface PageHeaderBarProps {
  title: string;
  type?: string;
}

export const PageHeaderBar: React.FC<PageHeaderBarProps> = ({ title, type }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: t.spacing.lg, paddingBottom: t.spacing.sm, borderBottomWidth: 2, borderBottomColor: t.colors.accent }}>
    <View style={{ width: 20, height: 20, backgroundColor: t.colors.accent, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginRight: t.spacing.sm }}>
      <Text style={{ color: t.colors.textOnAccent, fontSize: 10, fontWeight: 700 }}>H</Text>
    </View>
    {type && <Text style={[s.sectionLabel, { marginBottom: 0, marginRight: t.spacing.md }]}>{type}</Text>}
    <Text style={{ fontSize: t.fontSize.lg, fontWeight: 700, fontFamily: t.fonts.heading, color: t.colors.pdfText }}>{title}</Text>
  </View>
);
