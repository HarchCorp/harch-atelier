'use client';

import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import type { PDFDocumentType } from '@/pdf';

interface PDFQuickDownloadProps {
  pdfType: PDFDocumentType;
  locale?: 'en' | 'fr';
  label: string;
  variant?: 'white' | 'accent' | 'outline';
  className?: string;
}

export function PDFQuickDownload({
  pdfType,
  locale = 'en',
  label,
  variant = 'outline',
  className = '',
}: PDFQuickDownloadProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const url = `/api/pdf/${pdfType}?locale=${locale}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to generate PDF');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `harchcorp-${pdfType}-${locale}.pdf`;
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

  const variantClasses = {
    white: 'bg-white text-black hover:bg-white/90 border border-white/15',
    accent: 'bg-[#8B9DAF] text-black hover:bg-[#B3C4D4]',
    outline: 'border border-white/12 text-white/70 hover:border-[#8B9DAF]/40 hover:text-white hover:bg-white/[0.03]',
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      {loading ? 'Generating...' : label}
    </button>
  );
}
