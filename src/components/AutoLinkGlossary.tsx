'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type GlossaryLink = {
  term: string;
  slug: string;
  keywords: string[];
};

// Pre-computed glossary terms for internal linking
// These are the most important SEO terms to auto-link
const GLOSSARY_LINKS: GlossaryLink[] = [
  { term: 'GPU Cloud', slug: 'gpu-cloud', keywords: ['gpu cloud', 'gpu-cloud', 'gpu computing'] },
  { term: 'NVIDIA H100', slug: 'h100-gpu', keywords: ['h100', 'nvidia h100', 'h100 gpu'] },
  { term: 'NVIDIA H200', slug: 'h200-gpu', keywords: ['h200', 'nvidia h200', 'h200 gpu'] },
  { term: 'NVIDIA A100', slug: 'a100-gpu', keywords: ['a100', 'nvidia a100', 'a100 gpu'] },
  { term: 'NVIDIA B200', slug: 'b200-gpu', keywords: ['b200', 'nvidia b200', 'blackwell'] },
  { term: 'Carbon-Aware GPU', slug: 'carbon-aware-gpu', keywords: ['carbon-aware', 'carbon aware'] },
  { term: 'Sovereign AI', slug: 'sovereign-ai', keywords: ['sovereign ai', 'ai sovereignty'] },
  { term: 'Data Sovereignty', slug: 'data-sovereignty', keywords: ['data sovereignty'] },
  { term: 'PUE', slug: 'pue', keywords: ['pue', 'power usage effectiveness'] },
  { term: 'Datacenter', slug: 'datacenter', keywords: ['datacenter', 'data center'] },
  { term: 'Liquid Cooling', slug: 'liquid-cooling', keywords: ['liquid cooling'] },
  { term: 'InfiniBand', slug: 'infiniband', keywords: ['infiniband'] },
  { term: 'LLM', slug: 'llm', keywords: ['llm', 'large language model', 'large language models'] },
  { term: 'RAG', slug: 'rag', keywords: ['rag', 'retrieval augmented generation'] },
  { term: 'Kubernetes', slug: 'kubernetes', keywords: ['kubernetes', 'k8s'] },
  { term: 'PyTorch', slug: 'pytorch', keywords: ['pytorch'] },
  { term: 'TensorRT', slug: 'tensorrt', keywords: ['tensorrt', 'tensor rt'] },
  { term: 'Fine-Tuning', slug: 'fine-tuning', keywords: ['fine-tuning', 'fine tuning', 'finetuning'] },
  { term: 'Quantization', slug: 'quantization', keywords: ['quantization', 'quantized'] },
  { term: 'GDPR', slug: 'gdpr', keywords: ['gdpr'] },
  { term: 'Net Zero', slug: 'net-zero', keywords: ['net zero', 'net-zero'] },
  { term: 'Solar Energy', slug: 'solar-energy', keywords: ['solar energy', 'solar power'] },
  { term: 'Wind Energy', slug: 'wind-energy', keywords: ['wind energy', 'wind power'] },
  { term: 'Casablanca Finance City', slug: 'casablanca-finance-city', keywords: ['casablanca finance city', 'cfc'] },
  { term: 'Noor Ouarzazate', slug: 'noor-ouarzazate', keywords: ['noor ouarzazate', 'noor solar'] },
  { term: 'Morocco Tech', slug: 'morocco-tech', keywords: ['morocco tech', 'morocco technology'] },
];

/**
 * Auto-links glossary terms in text content for SEO internal linking.
 * Case-insensitive matching, avoids linking inside existing links or code blocks.
 */
export function AutoLinkGlossary({ children }: { children: React.ReactNode }) {
  const content = typeof children === 'string' ? children : '';

  const linkedContent = useMemo(() => {
    if (!content) return children;

    // Sort by length (longest first) to avoid partial matches
    const sortedLinks = [...GLOSSARY_LINKS].sort((a, b) => {
      const aLen = Math.max(a.term.length, ...a.keywords.map(k => k.length));
      const bLen = Math.max(b.term.length, ...b.keywords.map(k => k.length));
      return bLen - aLen;
    });

    let result: (string | React.ReactElement)[] = [content];
    let linkCounter = 0;

    for (const link of sortedLinks) {
      const allTerms = [link.term, ...link.keywords];
      const newResult: (string | React.ReactElement)[] = [];

      for (const part of result) {
        if (typeof part !== 'string') {
          newResult.push(part);
          continue;
        }

        let remaining = part;
        const parts: (string | React.ReactElement)[] = [];
        let changed = false;

        for (const term of allTerms) {
          const regex = new RegExp(`\\b(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
          let lastIndex = 0;
          let match;

          while ((match = regex.exec(remaining)) !== null) {
            // Check if we're inside a code block or link
            const before = remaining.slice(Math.max(0, match.index - 50), match.index);
            if (before.includes('<code') || before.includes('<a ') || before.includes('href=')) {
              continue;
            }

            changed = true;
            if (match.index > lastIndex) {
              parts.push(remaining.slice(lastIndex, match.index));
            }
            parts.push(
              <Link
                key={`glossary-link-${linkCounter++}`}
                href={`/glossary/${link.slug}`}
                className="text-emerald-400 hover:text-emerald-300 underline decoration-emerald-400/30 hover:decoration-emerald-400 transition-colors"
              >
                {match[0]}
              </Link>
            );
            lastIndex = match.index + match[0].length;
          }

          if (changed) {
            if (lastIndex < remaining.length) {
              parts.push(remaining.slice(lastIndex));
            }
            remaining = parts.map(p => typeof p === 'string' ? p : '').join('');
            // Keep non-string parts
            for (const p of parts) {
              if (typeof p !== 'string') {
                newResult.push(p);
              }
            }
            // Re-add remaining text
            if (remaining) {
              newResult.push(remaining);
            }
            break;
          }
        }

        if (!changed) {
          newResult.push(part);
        }
      }

      result = newResult;
    }

    return result;
  }, [content, children]);

  if (typeof children !== 'string') return <>{children}</>;
  return <>{linkedContent}</>;
}

/**
 * Related Terms component — shows related glossary terms at the bottom of pages.
 */
export function RelatedTermsGrid({ terms }: { terms: { slug: string; term: string; shortDef: string }[] }) {
  if (!terms || terms.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="mb-4 text-xl font-semibold text-white">Related Terms</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {terms.map((term) => (
          <Link
            key={term.slug}
            href={`/glossary/${term.slug}`}
            className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-500/30 hover:bg-white/10 transition-all"
          >
            <div className="min-w-0">
              <div className="font-medium text-white group-hover:text-emerald-400 truncate">{term.term}</div>
              <div className="text-xs text-zinc-500 truncate">{term.shortDef}</div>
            </div>
            <svg className="h-4 w-4 flex-shrink-0 text-zinc-600 group-hover:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Breadcrumbs component with JSON-LD for SEO.
 */
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `https://www.harchcorp.com${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script type="application/ld+json" async dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500" aria-label="Breadcrumb">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
            ) : (
              <span className="text-zinc-300">{item.label}</span>
            )}
            {i < items.length - 1 && <span className="text-zinc-700">/</span>}
          </span>
        ))}
      </nav>
    </>
  );
}
