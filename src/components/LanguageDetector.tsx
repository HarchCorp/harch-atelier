'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, X, ArrowRight, Languages, Sparkles } from 'lucide-react';
import { routing } from '@/i18n/routing';

const SUPPORTED_LOCALES: Record<string, { name: string; code: string; flag: string }> = {
  fr: { name: 'Français', code: 'fr', flag: '🇲🇦' },
  ar: { name: 'العربية', code: 'ar', flag: '🇪🇬' },
  es: { name: 'Español', code: 'es', flag: '🇪🇸' },
  pt: { name: 'Português', code: 'pt', flag: '🇵🇹' },
};

const COUNTRY_LANGUAGE: Record<string, string> = {
  MA: 'fr',
  SN: 'fr',
  CI: 'fr',
  ML: 'fr',
  BF: 'fr',
  GN: 'fr',
  NE: 'fr',
  BJ: 'fr',
  TG: 'fr',
  GM: 'en',
  NG: 'en',
  GH: 'en',
  KE: 'en',
  EG: 'ar',
  TN: 'ar',
  DZ: 'ar',
  MR: 'ar',
  LY: 'ar',
  SD: 'ar',
};

function getPathForLocale(pathname: string, currentLocale: string, targetLocale: string): string {
  if (targetLocale === 'fr') {
    if (currentLocale === 'en') {
      if (pathname === '/') return '/fr';
      return `/fr${pathname}`;
    }
    return pathname;
  }
  return pathname;
}

export function LanguageDetector() {
  const [showBanner, setShowBanner] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const locale = useLocale();
  const t = useTranslations('languageDetector');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (locale === 'fr') return;

    const dismissedAt = sessionStorage.getItem('lang-banner-dismissed');
    if (dismissedAt) {
      setDismissed(true);
      return;
    }

    if (document.cookie.includes('googtrans=/en/')) {
      return;
    }

    const browserLang = navigator.language.split('-')[0];
    const browserRegion = navigator.language.split('-')[1];

    let targetLang: string | null = null;

    if (browserRegion && COUNTRY_LANGUAGE[browserRegion]) {
      targetLang = COUNTRY_LANGUAGE[browserRegion];
    } else if (SUPPORTED_LOCALES[browserLang]) {
      targetLang = browserLang;
    }

    if (targetLang && targetLang !== 'en') {
      setDetectedLang(targetLang);
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [locale]);

  const handleSwitch = useCallback(() => {
    if (!detectedLang) return;

    if (detectedLang === 'fr') {
      const targetPath = getPathForLocale(pathname, locale, 'fr');
      setIsLeaving(true);
      setTimeout(() => {
        router.push(targetPath);
      }, 400);
    } else {
      document.cookie = `/en/${detectedLang}; path=/; domain=.harchcorp.com; max-age=31536000`;
      document.cookie = `/en/${detectedLang}; path=/; max-age=31536000`;
      window.location.reload();
    }
  }, [detectedLang, pathname, locale, router]);

  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setShowBanner(false);
      setDismissed(true);
      sessionStorage.setItem('lang-banner-dismissed', 'true');
    }, 300);
  }, []);

  if (!showBanner || dismissed || !detectedLang) return null;

  const langInfo = SUPPORTED_LOCALES[detectedLang];
  const isFrench = detectedLang === 'fr';

  return (
    <div
      className={`fixed bottom-6 left-6 z-[100] transition-all duration-400 ease-out ${
        isLeaving
          ? 'opacity-0 translate-y-6 scale-[0.96]'
          : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <div className="relative max-w-[380px]">
        {/* Multi-layer ambient glow */}
        <div className="absolute -inset-[2px] bg-gradient-to-br from-[#4A7B5F]/25 via-emerald-900/10 to-[#4A7B5F]/15 rounded-2xl blur-md" />
        <div className="absolute -inset-[1px] bg-gradient-to-tl from-[#4A7B5F]/10 via-transparent to-emerald-800/10 rounded-2xl blur-sm" />

        {/* Main card */}
        <div className="relative bg-[#0C0C0C]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
          {/* Top gradient accent bar */}
          <div className="relative h-[2px] w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4A7B5F] to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent animate-pulse" />
          </div>

          <div className="p-5">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.05] transition-all duration-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Language icon with glow */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4A7B5F]/20 to-emerald-900/20 border border-[#4A7B5F]/25 flex items-center justify-center">
                    <Languages className="h-5 w-5 text-[#4A7B5F]" />
                  </div>
                  {/* Subtle glow dot */}
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#4A7B5F] shadow-[0_0_8px_rgba(74,123,95,0.6)]" />
                </div>
              </div>

              <div className="flex-1 min-w-0 pr-6">
                {/* Main message */}
                <p className="text-[14px] text-white/90 font-medium leading-snug tracking-tight">
                  {t('availableIn')}{' '}
                  <span className="text-[#6AAF8B] font-semibold">
                    {langInfo?.name || detectedLang.toUpperCase()}
                  </span>
                </p>

                {/* Subtitle with quality indicator */}
                <div className="flex items-center gap-1.5 mt-2">
                  {isFrench ? (
                    <>
                      <Sparkles className="h-3 w-3 text-[#4A7B5F]/70" />
                      <span className="text-[11px] text-white/35 leading-relaxed">
                        {t('nativeTranslation')}
                      </span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-3 w-3 text-white/25" />
                      <span className="text-[11px] text-white/35 leading-relaxed">
                        {t('autoTranslation')}
                      </span>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2.5 mt-4">
                  <button
                    onClick={handleSwitch}
                    className="group relative flex items-center gap-2 px-4 py-2.5 bg-[#4A7B5F] hover:bg-[#5A9B7F] text-white text-[12px] font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_24px_rgba(74,123,95,0.35)] active:scale-[0.97]"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>{t('viewIn')} {langInfo?.name || detectedLang.toUpperCase()}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3.5 py-2.5 text-white/25 hover:text-white/50 text-[12px] font-medium rounded-xl hover:bg-white/[0.04] transition-all duration-200 border border-transparent hover:border-white/[0.06]"
                  >
                    {t('dismiss')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom subtle gradient line */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        </div>
      </div>
    </div>
  );
}
