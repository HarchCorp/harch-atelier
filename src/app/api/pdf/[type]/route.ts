/**
 * HarchCorp PDF Generation API Route
 * GET /api/pdf/[type]?locale=en
 *
 * Generates and returns PDF documents on demand
 */
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import type { PDFDocumentType } from '@/pdf';
import { getPDFMeta } from '@/pdf';
import { createPDFDocument } from '@/pdf/factory';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const locale = (request.nextUrl.searchParams.get('locale') || 'en') as 'en' | 'fr';

  // Validate document type
  const validTypes: PDFDocumentType[] = [
    'data-center-spec',
    'gpu-compute-datasheet',
    'infrastructure-whitepaper',
    'sustainability-report',
    'security-overview',
    'network-datasheet',
  ];

  if (!validTypes.includes(type as PDFDocumentType)) {
    return NextResponse.json(
      { error: 'Invalid PDF type', validTypes },
      { status: 400 }
    );
  }

  // Validate locale
  if (!['en', 'fr'].includes(locale)) {
    return NextResponse.json(
      { error: 'Invalid locale. Use "en" or "fr"' },
      { status: 400 }
    );
  }

  try {
    const document = await createPDFDocument(type as PDFDocumentType, locale);

    if (!document) {
      return NextResponse.json(
        { error: 'PDF document not found' },
        { status: 404 }
      );
    }

    // Render PDF to buffer
    const buffer = await renderToBuffer(document as any);

    // Get metadata for filename
    const filename = locale === 'fr'
      ? `harchcorp-${type}-fr.pdf`
      : `harchcorp-${type}-en.pdf`;

    // Return PDF with appropriate headers
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
