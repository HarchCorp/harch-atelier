import { Metadata } from 'next';
import { caseStudies } from '@/data/case-studies';
import CaseStudyPageClient from './CaseStudyPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cs = caseStudies.find(c => c.slug === slug);

  if (!cs) {
    return {
      title: 'Case Study Not Found',
    };
  }

  return {
    title: `${cs.title} | Harch Corp Case Studies`,
    description: cs.subtitle,
    alternates: {
      canonical: `https://www.harchcorp.com/case-studies/${slug}`,
      languages: {
        en: `https://www.harchcorp.com/case-studies/${slug}`,
        fr: `https://www.harchcorp.com/fr/etudes-de-cas/${slug}`,
        'x-default': `https://www.harchcorp.com/case-studies/${slug}`,
      },
    },
    openGraph: {
      title: cs.title,
      description: cs.subtitle,
      type: 'article',
      url: `https://www.harchcorp.com/case-studies/${slug}`,
      siteName: 'Harch Corp',
      images: [
        {
          url: cs.heroImage,
          width: 1200,
          height: 630,
          alt: cs.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: cs.title,
      description: cs.subtitle,
      images: [cs.heroImage],
    },
  };
}

export function generateStaticParams() {
  return caseStudies.map((cs) => ({
    slug: cs.slug,
  }));
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const cs = caseStudies.find(c => c.slug === slug);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.harchcorp.com' },
      { '@type': 'ListItem', position: 2, name: 'Case Studies', item: 'https://www.harchcorp.com/case-studies' },
      { '@type': 'ListItem', position: 3, name: cs?.title || 'Case Study', item: `https://www.harchcorp.com/case-studies/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json" async={true}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CaseStudyPageClient slug={slug} />
    </>
  );
}
