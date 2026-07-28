'use client';

import React, { useState } from 'react';
import { FileDown, Loader2, FileText, BookOpen, Shield, BarChart3, Globe, Server } from 'lucide-react';
import type { PDFDocumentType, PDFDocumentMeta } from '@/pdf';

interface PDFResourceCardProps {
  pdf: PDFDocumentMeta;
  locale?: 'en' | 'fr';
}

const categoryIcons: Record<string, React.ReactNode> = {
  infrastructure: <Server className="w-5 h-5" />,
  compute: <BarChart3 className="w-5 h-5" />,
  sustainability: <Globe className="w-5 h-5" />,
  security: <Shield className="w-5 h-5" />,
  network: <Globe className="w-5 h-5" />,
};

const typeLabels: Record<string, { en: string; fr: string }> = {
  datasheet: { en: 'Data Sheet', fr: 'Fiche Technique' },
  whitepaper: { en: 'Whitepaper', fr: 'Livre Blanc' },
  report: { en: 'Report', fr: 'Rapport' },
  overview: { en: 'Overview', fr: 'Aperçu' },
};

const typeBadgeColors: Record<string, string> = {
  datasheet: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  whitepaper: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  report: 'bg-green-500/10 text-green-400 border-green-500/20',
  overview: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export function PDFResourceCard({ pdf, locale = 'en' }: PDFResourceCardProps) {
  const [loading, setLoading] = useState(false);
  const isFr = locale === 'fr';

  const title = isFr ? pdf.titleFr : pdf.titleEn;
  const description = isFr ? pdf.descriptionFr : pdf.descriptionEn;
  const typeLabel = typeLabels[pdf.type]?.[locale] || pdf.type;

  const handleDownload = async () => {
    setLoading(true);
    try {
      const url = `/api/pdf/${pdf.id}?locale=${locale}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `harchcorp-${pdf.id}-${locale}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('PDF download error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative bg-[#141414] border border-white/6 rounded-xl p-6 hover:border-[#8B9DAF]/30 transition-all duration-300">
      {/* Type Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${typeBadgeColors[pdf.type] || 'bg-white/5 text-white/60 border-white/10'}`}>
          {typeLabel}
        </span>
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
          {pdf.pages} {isFr ? 'pages' : 'pages'}
        </span>
      </div>

      {/* Icon + Title */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#8B9DAF]/10 text-[#8B9DAF] flex items-center justify-center">
          {categoryIcons[pdf.category] || <FileText className="w-5 h-5" />}
        </div>
        <h3 className="text-sm font-semibold text-white leading-tight group-hover:text-[#8B9DAF] transition-colors">
          {title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-xs text-white/50 leading-relaxed mb-5 line-clamp-3">
        {description}
      </p>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#8B9DAF]/10 text-[#8B9DAF] hover:bg-[#8B9DAF] hover:text-black font-semibold text-xs transition-all duration-200 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {isFr ? 'Génération...' : 'Generating...'}
          </>
        ) : (
          <>
            <FileDown className="w-3.5 h-3.5" />
            {isFr ? 'Télécharger PDF' : 'Download PDF'}
          </>
        )}
      </button>
    </div>
  );
}
