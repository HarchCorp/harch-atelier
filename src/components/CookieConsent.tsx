'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function CookieConsent() {
  const t = useTranslations('cookieConsent');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('harch-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('harch-cookie-consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('harch-cookie-consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto bg-[#1E1E1E] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xl shadow-black/30">
        <div className="flex items-start gap-3 flex-1">
          <Shield size={18} className="text-[#666666] shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-[13px] text-[#999999] leading-relaxed">
            {t('description')}{' '}
            <Link href="/privacy" className="text-white font-medium underline underline-offset-2 hover:text-white/80 transition-colors">
              {t('privacyPolicy')}
            </Link>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={decline} className="px-5 py-2 text-[11px] font-semibold tracking-[0.05em] text-[#999999] hover:text-white border border-[rgba(255,255,255,0.06)] rounded-lg transition-colors">
            {t('reject')}
          </button>
          <button onClick={accept} className="px-5 py-2 text-[11px] font-semibold tracking-[0.05em] bg-white text-black rounded-lg hover:bg-white/90 transition-colors">
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
