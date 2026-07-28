'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { glossaryTerms, glossaryCategories } from '@/data/glossary-terms';
import { FadeIn } from '@/components/ui/motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function GlossaryPageClient() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    return glossaryTerms
      .filter((t) => {
        if (activeCategory && t.category !== activeCategory) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            t.term.toLowerCase().includes(q) ||
            t.shortDef.toLowerCase().includes(q) ||
            t.keywords.some((k) => k.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [search, activeCategory]);

  const groupedTerms = useMemo(() => {
    const groups: Record<string, typeof glossaryTerms> = {};
    filteredTerms.forEach((t) => {
      const letter = t.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(t);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTerms]);

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-zinc-100">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <FadeIn>
            <Badge variant="outline" className="mb-4 border-emerald-500/30 text-emerald-400">
              <BookOpen className="mr-1.5 h-3 w-3" />
              {glossaryTerms.length} terms · Updated 2025
            </Badge>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">
              Glossary: Sovereign AI, Carbon-Aware Computing & African Infrastructure
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-zinc-400">
              The complete reference for GPU cloud, datacenter, AI, energy, and sovereignty terms.
              Every concept behind Harch Corp&apos;s infrastructure, explained clearly.
            </p>
          </FadeIn>

          {/* Search */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search terms, keywords, definitions..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Category filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                activeCategory === null
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              All ({glossaryTerms.length})
            </button>
            {glossaryCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  activeCategory === cat.slug
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {filteredTerms.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">
            No terms found. Try a different search.
          </div>
        ) : (
          <div className="space-y-12">
            {groupedTerms.map(([letter, terms]) => (
              <div key={letter}>
                <h2 className="mb-4 text-2xl font-bold text-emerald-400">{letter}</h2>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {terms.map((term) => {
                    const cat = glossaryCategories.find((c) => c.slug === term.category);
                    return (
                      <Link
                        key={term.slug}
                        href={`/glossary/${term.slug}`}
                        className="group rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:border-emerald-500/30 hover:bg-white/10"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-semibold text-white group-hover:text-emerald-400">
                            {term.term}
                          </h3>
                          <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400" />
                        </div>
                        <p className="text-sm text-zinc-400 line-clamp-2">{term.shortDef}</p>
                        <div className="mt-3">
                          <Badge variant="outline" className="border-white/10 text-[10px] text-zinc-500">
                            {cat?.label}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-white/8 bg-gradient-to-br from-emerald-500/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Ready to build on carbon-aware infrastructure?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-zinc-400">
            Harch Corp provides sovereign GPU cloud, datacenter, and AI infrastructure in Morocco.
            Powered by 100% renewable energy. 47 gCO2/kWh carbon intensity.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/intelligence">
              <Button size="lg">Explore Platform</Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">View Pricing</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="ghost">Contact Sales</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
