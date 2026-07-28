import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ResearchDetailClient from './ResearchDetailClient';

// Static params for the 7 published dossiers
const dossierSlugs = [
  'solaire-epc-b2b',
  'mre-services',
  'retreat-yoga-essaouira',
  'conchyliculture-dakhla',
  'cosmetique-argan-cbd',
  'mro-industriel',
  'export-artisanat-terroir',
];

export function generateStaticParams() {
  return dossierSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const dossier = dossierSlugs.find((s) => s === slug);
  if (!dossier) return { title: 'Dossier not found — Harch Research' };
  return {
    title: `${dossier.replace(/-/g, ' ')} — Harch Research`,
    description: 'Analytical dossier: market, financial model, public subsidies, ROI, risks, execution plan.',
  };
}

export default async function ResearchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!dossierSlugs.includes(slug)) {
    notFound();
  }
  return <ResearchDetailClient slug={slug} />;
}
