'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Menu, ChevronDown } from 'lucide-react';
import { HarchLogo } from '@/components/HarchLogo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useState, useRef, useEffect } from 'react';

interface TopNavBarProps {
  onToggleSidebar: () => void;
}

export function TopNavBar({ onToggleSidebar }: TopNavBarProps) {
  const t = useTranslations('topNav');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const subsidiaries = [
    { label: 'Intelligence', href: '/subsidiaries/intelligence', version: '/0.1', accent: '#8B9DAF' },
    { label: 'Cement', href: '/subsidiaries/cement', version: '/0.2', accent: '#A08878' },
    { label: 'Energy', href: '/subsidiaries/energy', version: '/0.3', accent: '#6B9F6B' },
    { label: 'Technology', href: '/subsidiaries/technology', version: '/0.4', accent: '#7888A8' },
    { label: 'Mining', href: '/subsidiaries/mining', version: '/0.5', accent: '#A87878' },
    { label: 'Agri', href: '/subsidiaries/agriculture', version: '/0.6', accent: '#6BAF6B' },
    { label: 'Water', href: '/subsidiaries/water', version: '/0.7', accent: '#6888A8' },
    { label: 'Finance', href: '/subsidiaries/finance', version: '/0.8', accent: '#C4964A' },
  ];

  const centerLinks = [
    { label: t('platform'), href: '/platform' },
    { label: t('research'), href: '/research' },
    { label: 'Manifesto', href: '/manifesto' },
    { label: t('about'), href: '/about' },
    { label: t('pricing'), href: '/pricing' },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-white/[0.06]"
      aria-label={t('ariaPrimaryNav')}
    >
      {/* Layout en 3 colonnes égales pour un centrage parfait */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 grid grid-cols-3 items-center h-14">

        {/* === COLONNE GAUCHE : Menu + Logo === */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.15] transition-colors shrink-0"
            aria-label={t('ariaToggleMenu')}
          >
            <Menu size={16} strokeWidth={1.5} className="text-white/60" />
          </button>
          <div className="flex items-center h-9">
            <HarchLogo />
          </div>
        </div>

        {/* === COLONNE CENTRE : Links (réellement centrée grâce à grid-cols-3) === */}
        <div className="hidden lg:flex items-center justify-center gap-7">
          {/* Subsidiaries dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 h-9 text-[12px] font-medium text-white/50 hover:text-white transition-colors nav-link"
            >
              {t('subsidiaries')}
              <ChevronDown size={12} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-[#0F0F0F] border border-white/[0.08] rounded-lg shadow-2xl overflow-hidden">
                <Link
                  href="/subsidiaries"
                  className="block px-4 py-2.5 text-[12px] font-bold text-white/80 hover:bg-white/[0.04] border-b border-white/[0.04] transition-colors"
                >
                  All Subsidiaries →
                </Link>
                {subsidiaries.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="flex items-center justify-between px-4 py-2.5 text-[12px] text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.accent }} />
                      {s.label}
                    </span>
                    <span className="text-[9px] font-mono text-white/30">{s.version}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {centerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center h-9 text-[12px] font-medium text-white/50 hover:text-white transition-colors nav-link"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* === COLONNE DROITE : Indicateur + Language + Contact === */}
        <div className="flex items-center justify-end gap-2.5 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 h-7 px-2.5 rounded border border-[#4A7B5F]/30 bg-[#4A7B5F]/5">
            <span className="pulse-dot" style={{ background: '#4A7B5F', color: '#4A7B5F' }} />
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#4A7B5F] leading-none">Building in Public</span>
          </div>
          <LanguageSwitcher variant="navbar" />
          <Link
            href="/contact"
            className="hidden md:inline-flex items-center h-7 px-4 rounded border border-white/[0.12] text-white text-[11px] font-semibold hover:border-white/25 hover:bg-white/[0.04] transition-colors"
          >
            {t('contact')}
          </Link>
        </div>
      </div>
    </nav>
  );
}
