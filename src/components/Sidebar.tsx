'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { HarchLogo } from '@/components/HarchLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Navigation items are now built inside the component using translations
// to support the current locale dynamically.

type NavItem = { name: string; version?: string; href: string };

export function Sidebar() {
  const t = useTranslations('sidebar');
  const [isOpen, setIsOpen] = useState(false);
  const [platformsOpen, setPlatformsOpen] = useState(true);
  const [developersOpen, setDevelopersOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const pathname = usePathname();

  const platformItems: NavItem[] = [
    { name: t('platformDemo'), version: '/0.0', href: '/platform' },
    { name: t('harchos'), version: '/0.1', href: '/intelligence/harchos' },
    { name: t('harchlink'), version: '/0.2', href: '/harchlink' },
    { name: t('intelligence'), version: '/0.3', href: '/subsidiaries/intelligence' },
    { name: t('cement'), version: '/0.4', href: '/subsidiaries/cement' },
    { name: t('energy'), version: '/0.5', href: '/subsidiaries/energy' },
    { name: t('technology'), version: '/0.6', href: '/subsidiaries/technology' },
    { name: t('mining'), version: '/0.7', href: '/subsidiaries/mining' },
    { name: t('agri'), version: '/0.8', href: '/subsidiaries/agriculture' },
    { name: t('water'), version: '/0.9', href: '/subsidiaries/water' },
    { name: t('finance'), version: '/1.0', href: '/subsidiaries/finance' },
  ];

  const missionItems: NavItem[] = [
    { name: t('home'), href: '/' },
    { name: t('thesis'), href: '/thesis' },
    { name: t('about'), href: '/about' },
    { name: t('strategy'), href: '/strategy' },
    { name: t('esg'), href: '/esg' },
  ];

  const deploymentItems: NavItem[] = [
    { name: t('globalPresence'), href: '/#global-presence' },
    { name: t('caseStudies'), href: '/case-studies' },
    { name: t('careers'), href: '/careers' },
    { name: t('partners'), href: '/partners' },
    { name: t('newsroom'), href: '/newsroom' },
    { name: t('pressMedia'), href: '/press' },
  ];

  const developerItems: NavItem[] = [
    { name: t('developerCenter'), href: '/developers' },
    { name: t('apiPlayground'), href: '/developers/playground' },
    { name: t('openSource'), href: '/developers/open-source' },
    { name: t('documentation'), href: '/docs' },
    { name: t('apiReference'), href: '/docs/api' },
    { name: t('sdks'), href: '/docs/sdks' },
    { name: t('architecture'), href: '/docs/architecture' },
    { name: t('changelog'), href: '/docs/changelog' },
  ];

  const trustItems: NavItem[] = [
    { name: t('trustCenter'), href: '/trust' },
    { name: t('security'), href: '/trust/security' },
    { name: t('compliance'), href: '/trust/compliance' },
    { name: t('aiEthics'), href: '/trust/ai-ethics' },
    { name: t('vulnerabilityDisclosure'), href: '/trust/vulnerability-disclosure' },
  ];

  const resourceItems: NavItem[] = [
    { name: t('research'), href: '/research' },
    { name: t('blog'), href: '/blog' },
    { name: t('engineeringBlog'), href: '/engineering-blog' },
    { name: t('downloadCenter'), href: '/resources' },
    { name: t('community'), href: '/community' },
    { name: t('events'), href: '/events' },
    { name: t('learnCertify'), href: '/learn' },
    { name: t('glossary'), href: '/glossary' },
    { name: t('faq'), href: '/faq' },
    { name: t('status'), href: '/status' },
  ];

  const businessItems: NavItem[] = [
    { name: t('pricing'), href: '/pricing' },
    { name: t('calculator'), href: '/pricing/calculator' },
    { name: t('customers'), href: '/customers' },
    { name: t('support'), href: '/support' },
    { name: t('startupProgram'), href: '/startup-program' },
  ];

  const companyItems: NavItem[] = [
    { name: t('leadership'), href: '/company/leadership' },
    { name: t('dei'), href: '/company/dei' },
    { name: t('harchVentures'), href: '/company/ventures' },
    { name: t('hiringProcess'), href: '/careers/hiring-process' },
    { name: t('legalHub'), href: '/legal/hub' },
  ];

  const investorItems: NavItem[] = [
    { name: t('investorRelations'), href: '/investors' },
    { name: t('requestBriefing'), href: '/contact' },
  ];

  // Listen for custom toggle event from TopNavBar
  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleSidebar = useCallback(() => setIsOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.includes('#')) return false;
    return pathname.startsWith(href);
  };

  const sectionLabel = "text-[9px] font-bold tracking-[0.2em] uppercase text-[rgba(255,255,255,0.25)] mb-3 px-1 font-[family-name:var(--font-space-mono)] flex items-center gap-2";

  const navLink = (href: string, label: string, extra?: React.ReactNode) => (
    <Link
      key={href}
      href={href}
      onClick={closeSidebar}
      className={`flex items-center justify-between text-[12px] font-medium pl-4 py-[7px] border-l-2 border-transparent rounded-r-md transition-all duration-300 ${
        isActive(href)
          ? 'text-white bg-[rgba(139,157,175,0.06)] border-[rgba(139,157,175,0.3)]'
          : 'text-[#999999] hover:text-white hover:bg-[rgba(139,157,175,0.03)]'
      }`}
    >
      <span>{label}</span>
      {extra}
    </Link>
  );

  const collapsibleSection = (
    label: string,
    dotColor: string,
    items: { name: string; href: string; version?: string }[],
    isSectionOpen: boolean,
    setSectionOpen: (v: boolean) => void,
  ) => (
    <div>
      <button
        onClick={() => setSectionOpen(!isSectionOpen)}
        className={`flex items-center justify-between w-full ${sectionLabel}`}
      >
        <span className="flex items-center gap-2">
          <span className="inline-block w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
          {label}
        </span>
        <ChevronDown
          size={10}
          className={`transition-transform duration-200 text-[rgba(255,255,255,0.25)] ${isSectionOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isSectionOpen && (
        <div className="space-y-0.5 mt-1">
          {items.map((item) => navLink(item.href, item.name))}
        </div>
      )}
    </div>
  );

  return (
    <>


      {/* Overlay — when sidebar is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar drawer — slides in from left */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full z-40 w-[280px] max-w-[85vw] bg-[#0A0A0A] border-r border-[rgba(255,255,255,0.06)] overflow-y-auto overscroll-contain"
            aria-label={t('ariaLabel')}
          >
            <div className="flex flex-col h-full px-4 py-6">
              {/* Logo */}
              <div className="mb-8 px-2 pt-1">
                <HarchLogo />
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-5 overflow-y-auto">
                {collapsibleSection(t('platforms'), '#4A7B5F', platformItems, platformsOpen, setPlatformsOpen)}

                <div>
                  <p className={sectionLabel}>
                    <span className="inline-block w-1 h-1 rounded-full" style={{ backgroundColor: '#8B9DAF' }} />
                    {t('mission')}
                  </p>
                  <div className="space-y-0.5 mt-1">
                    {missionItems.map((item) => navLink(item.href, item.name))}
                  </div>
                </div>

                <div>
                  <p className={sectionLabel}>
                    <span className="inline-block w-1 h-1 rounded-full" style={{ backgroundColor: '#8B9DAF' }} />
                    {t('deployments')}
                  </p>
                  <div className="space-y-0.5 mt-1">
                    {deploymentItems.map((item) => navLink(item.href, item.name))}
                  </div>
                </div>

                {collapsibleSection(t('developers'), '#8B9DAF', developerItems, developersOpen, setDevelopersOpen)}

                <div>
                  <p className={sectionLabel}>
                    <span className="inline-block w-1 h-1 rounded-full" style={{ backgroundColor: '#8B9DAF' }} />
                    {t('trust')}
                  </p>
                  <div className="space-y-0.5 mt-1">
                    {trustItems.map((item) => navLink(item.href, item.name))}
                  </div>
                </div>

                {collapsibleSection(t('resources'), '#666666', resourceItems, resourcesOpen, setResourcesOpen)}
                {collapsibleSection(t('business'), '#666666', businessItems, businessOpen, setBusinessOpen)}
                {collapsibleSection(t('company'), '#666666', companyItems, companyOpen, setCompanyOpen)}

                <div>
                  <p className={sectionLabel}>
                    <span className="inline-block w-1 h-1 rounded-full" style={{ backgroundColor: '#666666' }} />
                    {t('investors')}
                  </p>
                  <div className="space-y-0.5 mt-1">
                    {investorItems.map((item) => navLink(item.href, item.name))}
                  </div>
                </div>
              </nav>

              {/* Bottom: CTAs */}
              <div className="mt-4 pt-5 border-t border-[rgba(139,157,175,0.08)] space-y-2">
                <Link
                  href="/quote"
                  onClick={closeSidebar}
                  className="block w-full text-center bg-white text-black text-[10px] tracking-[0.1em] uppercase px-4 py-2.5 rounded-md font-semibold hover:bg-white/90 transition-colors font-[family-name:var(--font-space-mono)]"
                >
                  {t('ctas.quote')}
                </Link>
                <Link
                  href="/contact"
                  onClick={closeSidebar}
                  className="block w-full text-center border border-[rgba(139,157,175,0.2)] bg-[rgba(139,157,175,0.04)] text-[#8B9DAF] text-[10px] tracking-[0.1em] uppercase px-4 py-2.5 rounded-md font-semibold hover:border-[rgba(139,157,175,0.3)] hover:text-white transition-colors font-[family-name:var(--font-space-mono)]"
                >
                  {t('ctas.briefing')}
                </Link>
                <Link
                  href="/careers"
                  onClick={closeSidebar}
                  className="block w-full text-center border border-[rgba(255,255,255,0.1)] bg-transparent text-[rgba(255,255,255,0.5)] text-[10px] tracking-[0.1em] uppercase px-4 py-2.5 rounded-md font-semibold hover:border-[rgba(255,255,255,0.2)] hover:text-white transition-colors font-[family-name:var(--font-space-mono)]"
                >
                  {t('joinTeam')}
                </Link>

                {/* Language Switcher — shows current locale prominently */}
                <div className="pt-2">
                  <LanguageSwitcher variant="sidebar" />
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="inline-block w-0.5 h-0.5 rounded-full bg-[#4A7B5F]" />
                  <p className="text-[9px] text-[rgba(255,255,255,0.2)] font-[family-name:var(--font-space-mono)]">
                    v0.2.0 — {t('casablanca')}
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
