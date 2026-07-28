'use client';

import React from 'react';
import { PDFResourceCard } from '@/components/PDFResourceCard';
import { PDF_CATALOG, type PDFDocumentMeta } from '@/pdf';

interface ResourcesPageClientProps {
  locale: string;
}

export function ResourcesPageClient({ locale }: ResourcesPageClientProps) {
  const isFr = locale === 'fr';

  // Group PDFs by category
  const categories = [
    {
      id: 'infrastructure',
      label: isFr ? 'Infrastructure' : 'Infrastructure',
      description: isFr
        ? 'Spécifications techniques et livres blancs sur nos centres de données'
        : 'Technical specifications and whitepapers on our data centers',
    },
    {
      id: 'compute',
      label: isFr ? 'GPU Compute' : 'GPU Compute',
      description: isFr
        ? 'Fiches techniques et tarification de nos instances GPU'
        : 'Datasheets and pricing for our GPU instances',
    },
    {
      id: 'sustainability',
      label: isFr ? 'Durabilité' : 'Sustainability',
      description: isFr
        ? 'Rapports sur notre performance environnementale et notre impact'
        : 'Reports on our environmental performance and impact',
    },
    {
      id: 'security',
      label: isFr ? 'Sécurité & Conformité' : 'Security & Compliance',
      description: isFr
        ? 'Aperçus de notre approche de sécurité et de nos certifications'
        : 'Overviews of our security approach and certifications',
    },
    {
      id: 'network',
      label: isFr ? 'Réseau & Connectivité' : 'Network & Connectivity',
      description: isFr
        ? 'Spécifications de notre backbone et connectivité sous-marine'
        : 'Backbone specifications and submarine connectivity',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-4 font-mono">
            {isFr ? 'RESSOURCES' : 'RESOURCES'}
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            {isFr ? 'Documentation & Ressources' : 'Documentation & Resources'}
          </h1>
          <p className="text-lg text-white/60 max-w-2xl leading-relaxed">
            {isFr
              ? 'Téléchargez nos fiches techniques, livres blancs et rapports. Tous les documents sont disponibles en anglais et en français.'
              : 'Download our datasheets, whitepapers, and reports. All documents are available in English and French.'}
          </p>
        </div>
      </section>

      {/* Featured PDFs */}
      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-6 font-mono">
            {isFr ? 'EN VEDETTE' : 'FEATURED'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PDF_CATALOG.filter(p => p.featured).map(pdf => (
              <PDFResourceCard key={pdf.id} pdf={pdf} locale={locale as 'en' | 'fr'} />
            ))}
          </div>
        </div>
      </section>

      {/* All PDFs by Category */}
      {categories.map(cat => {
        const pdfs = PDF_CATALOG.filter(p => p.category === cat.id);
        if (pdfs.length === 0) return null;

        return (
          <section key={cat.id} className="px-6 pb-12">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#8B9DAF] mb-2 font-mono">
                {cat.label}
              </h2>
              <p className="text-sm text-white/40 mb-6">{cat.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pdfs.map(pdf => (
                  <PDFResourceCard key={pdf.id} pdf={pdf} locale={locale as 'en' | 'fr'} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#8B9DAF] rounded-2xl p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">
              {isFr ? 'Besoin d\'informations personnalisées ?' : 'Need personalized information?'}
            </h2>
            <p className="text-black/70 mb-8 max-w-lg mx-auto">
              {isFr
                ? 'Notre équipe peut vous fournir des devis détaillés, des visites virtuelles ou des données spécifiques à votre projet.'
                : 'Our team can provide detailed quotes, virtual tours, or project-specific data.'}
            </p>
            <a
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-black/80 transition-colors"
            >
              {isFr ? 'Contactez-nous' : 'Contact us'}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
