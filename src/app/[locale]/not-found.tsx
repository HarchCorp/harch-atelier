'use client';

import Link from 'next/link';
import { HarchLogo } from '@/components/HarchLogo';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
      {/* Fade-in animation styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes notFoundFadeIn {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .not-found-animate {
              animation: notFoundFadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              opacity: 0;
            }
            .not-found-animate-delay-1 { animation-delay: 0.1s; }
            .not-found-animate-delay-2 { animation-delay: 0.2s; }
            .not-found-animate-delay-3 { animation-delay: 0.35s; }
            .not-found-animate-delay-4 { animation-delay: 0.5s; }
          `,
        }}
      />

      {/* Harch bar logo */}
      <div className="not-found-animate mb-16">
        <HarchLogo />
      </div>

      {/* Large 404 */}
      <h1
        className="not-found-animate not-found-animate-delay-1 text-[8rem] sm:text-[12rem] md:text-[16rem] font-bold leading-none tracking-tight"
        style={{ color: '#8B9DAF', opacity: 0.25 }}
      >
        404
      </h1>

      {/* Message */}
      <p className="not-found-animate not-found-animate-delay-2 mt-8 text-lg sm:text-xl font-medium text-white text-center max-w-lg">
        {t('notFoundTitle')}
      </p>

      <p className="not-found-animate not-found-animate-delay-3 mt-3 text-sm text-[#999999] text-center max-w-md">
        {t('notFoundDescription')}
      </p>

      {/* CTAs */}
      <div className="not-found-animate not-found-animate-delay-4 mt-10 flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center h-12 px-8 bg-white text-black text-sm font-semibold rounded-lg transition-all duration-200 hover:bg-[#e0e0e0] active:scale-[0.98]"
        >
          {t('backToHome')}
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center h-12 px-8 border border-[rgba(255,255,255,0.12)] text-white text-sm font-medium rounded-lg transition-all duration-200 hover:border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.04)] active:scale-[0.98]"
        >
          {t('notFoundRequestBriefing')}
        </Link>
      </div>
    </div>
  );
}
