/**
 * HarchCorp PDF Document Factory
 * Creates PDF documents without JSX (for use in API routes)
 */
import React from 'react';
import type { PDFDocumentType } from '@/pdf';

export async function createPDFDocument(type: PDFDocumentType, locale: 'en' | 'fr'): Promise<React.ReactElement> {
  switch (type) {
    case 'data-center-spec': {
      const { DataCenterSpecSheet } = await import('@/pdf/documents/DataCenterSpecSheet');
      return React.createElement(DataCenterSpecSheet, { locale });
    }
    case 'gpu-compute-datasheet': {
      const { GPUComputeDatasheet } = await import('@/pdf/documents/GPUComputeDatasheet');
      return React.createElement(GPUComputeDatasheet, { locale });
    }
    case 'infrastructure-whitepaper': {
      const { InfrastructureWhitepaper } = await import('@/pdf/documents/InfrastructureWhitepaper');
      return React.createElement(InfrastructureWhitepaper, { locale });
    }
    case 'sustainability-report': {
      const { SustainabilityReport } = await import('@/pdf/documents/SustainabilityReport');
      return React.createElement(SustainabilityReport, { locale });
    }
    case 'security-overview': {
      const { SecurityOverview } = await import('@/pdf/documents/SecurityOverview');
      return React.createElement(SecurityOverview, { locale });
    }
    case 'network-datasheet': {
      const { NetworkDatasheet } = await import('@/pdf/documents/NetworkDatasheet');
      return React.createElement(NetworkDatasheet, { locale });
    }
    case 'board-briefing': {
      const { BoardBriefing } = await import('@/pdf/documents/BoardBriefing');
      return React.createElement(BoardBriefing, { locale });
    }
    case 'compliance-report': {
      const { ComplianceReport } = await import('@/pdf/documents/ComplianceReport');
      return React.createElement(ComplianceReport, { locale });
    }
    case 'esg-report': {
      const { EsgReport } = await import('@/pdf/documents/EsgReport');
      return React.createElement(EsgReport, { locale });
    }
    case 'board-report': {
      const { BoardReport } = await import('@/pdf/documents/BoardReport');
      return React.createElement(BoardReport, { locale });
    }
    default:
      throw new Error(`Unknown PDF type: ${type}`);
  }
}
