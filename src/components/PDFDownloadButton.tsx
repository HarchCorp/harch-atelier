'use client';

import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import type { PDFDocumentType } from '@/pdf';

interface PDFDownloadButtonProps {
  pdfType: PDFDocumentType;
  locale?: 'en' | 'fr';
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PDFDownloadButton({
  pdfType,
  locale = 'en',
  label,
  variant = 'primary',
  size = 'md',
  className = '',
}: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const url = `/api/pdf/${pdfType}?locale=${locale}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

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

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-[#8B9DAF] text-black hover:bg-[#B3C4D4] font-semibold',
    secondary: 'bg-[#1A1A1A] text-white border border-white/10 hover:border-[#8B9DAF]/50 font-medium',
    ghost: 'bg-transparent text-[#8B9DAF] hover:text-white hover:bg-white/5 font-medium',
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      {label || (loading ? 'Generating...' : 'Download PDF')}
    </button>
  );
}
