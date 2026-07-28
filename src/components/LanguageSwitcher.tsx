'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const locales = [
  { code: 'en' as const, labelEn: 'English', labelFr: 'Anglais', flag: 'EN' },
  { code: 'fr' as const, labelEn: 'French', labelFr: 'Français', flag: 'FR' },
];

/**
 * Palantir-style language switcher — premium, minimal, dark aesthetic.
 * A refined pill button showing the active locale with a smooth dropdown.
 * Designed to feel like a native part of the interface.
 */
export function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'sidebar' | 'navbar' }) {
  const locale = useLocale();
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const switchLocale = useCallback((newLocale: 'en' | 'fr') => {
    if (newLocale !== locale) {
      router.replace(pathname, { locale: newLocale });
    }
    setOpen(false);
  }, [locale, pathname, router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  // Sidebar variant — shows current locale with switch option
  if (variant === 'sidebar') {
    const nextLocale = locale === 'en' ? 'fr' : 'en';
    const nextLabel = nextLocale === 'en' ? 'EN' : 'FR';
    return (
      <button
        onClick={() => switchLocale(nextLocale)}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-[11px] font-medium text-[rgba(255,255,255,0.45)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] rounded-md transition-all duration-200 group"
        aria-label={t('switchLanguage')}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        <span className="flex items-center gap-2">
          {/* Current locale — prominent */}
          <span className="font-[family-name:var(--font-space-mono)] tracking-[0.14em] uppercase text-white/70 font-semibold">
            {locale.toUpperCase()}
          </span>
          <span className="text-white/20">→</span>
          {/* Target locale */}
          <span className="font-[family-name:var(--font-space-mono)] tracking-[0.14em] uppercase text-white/35 group-hover:text-white/60 transition-colors">
            {nextLabel}
          </span>
        </span>
      </button>
    );
  }

  // Navbar variant — compact inline switcher for TopNavBar
  // Visually distinct from menu button: text-only, no border, globe+locale pill
  if (variant === 'navbar') {
    const nextLocale = locale === 'en' ? 'fr' : 'en';
    return (
      <button
        onClick={() => switchLocale(nextLocale)}
        className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors font-[family-name:var(--font-space-mono)] tracking-[0.1em] uppercase border border-white/[0.08] hover:border-white/[0.15]"
        aria-label={t('switchLanguage')}
        title={locale === 'en' ? 'Switch to French' : 'Passer en anglais'}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 opacity-60"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        <span className="font-semibold">{locale.toUpperCase()}</span>
      </button>
    );
  }

  // Default variant — premium Palantir-style switcher
  return (
    <div ref={ref} className="fixed top-5 right-5 z-50">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={`
          flex items-center gap-2 px-3 py-1.5
          text-[11px] font-medium tracking-[0.1em] uppercase
          font-[family-name:var(--font-space-mono)]
          rounded-full
          transition-all duration-300 ease-out
          border
          ${open
            ? 'bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.15)] text-white shadow-lg shadow-black/20'
            : 'bg-[#0A0A0A]/80 border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.45)] hover:text-[rgba(255,255,255,0.8)] hover:border-[rgba(255,255,255,0.1)] hover:bg-[#0A0A0A]/95'
          }
          backdrop-blur-xl
        `}
        aria-label={t('switchLanguage')}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {/* Globe icon */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        <span>{locale.toUpperCase()}</span>
        {/* Chevron indicator */}
        <motion.svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 opacity-40"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-full right-0 mt-2 w-[160px] origin-top-right"
          >
            <div className="bg-[#111111]/95 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-lg shadow-2xl shadow-black/40 overflow-hidden">
              <div className="py-1">
                {locales.map((loc) => {
                  const isActive = loc.code === locale;
                  return (
                    <button
                      key={loc.code}
                      onClick={() => switchLocale(loc.code)}
                      className={`
                        flex items-center gap-3 w-full px-3.5 py-2.5
                        text-[12px] font-medium
                        transition-all duration-150
                        ${isActive
                          ? 'text-white bg-[rgba(255,255,255,0.06)]'
                          : 'text-[rgba(255,255,255,0.45)] hover:text-white hover:bg-[rgba(255,255,255,0.04)]'
                        }
                      `}
                      role="option"
                      aria-selected={isActive}
                    >
                      {/* Language code badge */}
                      <span
                        className={`
                          inline-flex items-center justify-center
                          w-7 h-5 rounded text-[9px] font-bold tracking-wider
                          font-[family-name:var(--font-space-mono)]
                          transition-colors duration-150
                          ${isActive
                            ? 'bg-[rgba(255,255,255,0.1)] text-white'
                            : 'bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.35)]'
                          }
                        `}
                      >
                        {loc.flag}
                      </span>

                      {/* Language name — show in its own language */}
                      <span className="flex-1 text-left">{loc.code === 'en' ? loc.labelEn : loc.labelFr}</span>

                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2, type: 'spring', stiffness: 500, damping: 30 }}
                          className="w-1.5 h-1.5 rounded-full bg-[#4A7B5F]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Subtle separator and current indicator */}
              <div className="border-t border-[rgba(255,255,255,0.04)] px-3.5 py-2">
                <p className="text-[9px] text-[rgba(255,255,255,0.2)] tracking-[0.08em] uppercase font-[family-name:var(--font-space-mono)]">
                  {t('language')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
