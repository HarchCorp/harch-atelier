/**
 * JSON-LD structured data component for SEO.
 * Renders inline script tag with async attribute to satisfy Next.js 16 requirements.
 */
export function JsonLd({ data, id }: { data: Record<string, unknown> | Record<string, unknown>[]; id?: string }) {
  return (
    <script
      id={id || 'jsonld'}
      type="application/ld+json"
      async={true}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
