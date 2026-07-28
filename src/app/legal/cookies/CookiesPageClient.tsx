'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const cookieTypes = [
  {
    category: 'Strictly Necessary Cookies',
    description: 'These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt out of these cookies as the website cannot function without them.',
    examples: 'Session authentication tokens, CSRF protection cookies, load balancing cookies, cookie consent preferences',
    duration: 'Session / Up to 1 year',
  },
  {
    category: 'Performance Cookies',
    description: 'These cookies collect information about how visitors use our website, such as which pages are visited most often and whether users receive error messages. All data collected by these cookies is aggregated and anonymized.',
    examples: 'Google Analytics (_ga, _gid), page load timing metrics, error tracking identifiers',
    duration: 'Up to 2 years',
  },
  {
    category: 'Functionality Cookies',
    description: 'These cookies allow the website to remember choices you make, such as your preferred language, region, or display settings. They provide enhanced, personalized features and can also be used to remember changes you have made to text size, fonts, and other customizable elements of the website.',
    examples: 'Language preference, region settings, display preferences, accessibility settings',
    duration: 'Up to 1 year',
  },
  {
    category: 'Targeting / Advertising Cookies',
    description: 'These cookies are used to deliver advertisements more relevant to you and your interests. They are also used to limit the number of times you see an advertisement and to help measure the effectiveness of advertising campaigns. They are usually placed by advertising networks with our permission.',
    examples: 'LinkedIn Insight Tag, retargeting pixels, conversion tracking cookies',
    duration: 'Up to 2 years',
  },
];

const cookieTable = [
  { name: '_ga', purpose: 'Google Analytics — distinguishes unique visitors', category: 'Performance', duration: '2 years' },
  { name: '_gid', purpose: 'Google Analytics — distinguishes unique visitors per day', category: 'Performance', duration: '24 hours' },
  { name: '_gat', purpose: 'Google Analytics — throttles request rate', category: 'Performance', duration: '1 minute' },
  { name: 'harch_session', purpose: 'Maintains authenticated user session', category: 'Strictly Necessary', duration: 'Session' },
  { name: 'harch_csrf', purpose: 'Cross-site request forgery protection', category: 'Strictly Necessary', duration: 'Session' },
  { name: 'cookie_consent', purpose: 'Records your cookie consent preferences', category: 'Strictly Necessary', duration: '1 year' },
  { name: 'lang_pref', purpose: 'Stores your preferred language setting', category: 'Functionality', duration: '1 year' },
  { name: 'region_pref', purpose: 'Stores your regional preferences', category: 'Functionality', duration: '1 year' },
  { name: 'li_sugr', purpose: 'LinkedIn Insight Tag — visitor identification', category: 'Targeting', duration: '3 months' },
  { name: '_fbp', purpose: 'Meta Pixel — advertisement conversion tracking', category: 'Targeting', duration: '3 months' },
];

export default function CookiesPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">Cookie Policy</h1>
            <div className="accent-line mb-8" />
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">Last updated: January 2026</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">1. What Are Cookies</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, to provide a better browsing experience, and to supply information to the owners of the site. Cookies allow websites to recognize your device and remember information about your visit, such as your preferred language and other settings. Similar technologies such as web beacons (also known as pixel tags or clear GIFs), local storage, and session storage operate in similar ways and are covered by this policy.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">2. How We Use Cookies</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-6">
                Harch Corp uses cookies and similar technologies for a variety of purposes. We categorize the cookies we use into four types, each serving a distinct purpose:
              </p>
              <div className="space-y-6">
                {cookieTypes.map((cookie, i) => (
                  <div key={cookie.category} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <h3 className="text-[15px] font-semibold text-white mb-2">{cookie.category}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.8] mb-3">{cookie.description}</p>
                    <p className="text-[13px] text-[#666666]"><span className="text-white font-medium">Examples:</span> {cookie.examples}</p>
                    <p className="text-[13px] text-[#666666] mt-1"><span className="text-white font-medium">Duration:</span> {cookie.duration}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">3. Third-Party Cookies</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                In addition to our own cookies, we may use cookies from third-party service providers who operate on our behalf. These third parties include: Google LLC (Google Analytics for website analytics), LinkedIn Corporation (Insight Tag for professional audience insights), Meta Platforms, Inc. (Pixel for conversion tracking on our careers and investment pages), and Cloudflare, Inc. (security and performance optimization). These third-party cookies are subject to the respective privacy policies of these organizations. We do not control the setting of these cookies and recommend you consult the respective third-party websites for more information on their cookies and how to manage them.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">4. Managing Cookie Preferences</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                You have the right to decide whether to accept or reject cookies. When you first visit our website, you will be presented with a cookie consent banner that allows you to select which categories of cookies you wish to accept. You may update your preferences at any time by accessing our Cookie Preferences Center.
              </p>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                Additionally, you can manage cookies through your browser settings. Most browsers allow you to view, manage, and delete cookies. Please note that if you delete or reject cookies, you may not be able to use certain features of our website, and your user experience may be diminished. Below are links to cookie management instructions for popular browsers:
              </p>
              <ul className="list-disc list-inside text-[14px] text-[#999999] leading-[2] ml-2">
                <li>Google Chrome: Settings → Privacy and security → Cookies and other site data</li>
                <li>Mozilla Firefox: Settings → Privacy & Security → Cookies and Site Data</li>
                <li>Apple Safari: Preferences → Privacy → Manage Website Data</li>
                <li>Microsoft Edge: Settings → Cookies and site permissions → Manage and delete cookies</li>
              </ul>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">5. Cookie Duration Table</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                The following table lists the specific cookies used on our website, their purpose, category, and duration:
              </p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Cookie Name</th>
                      <th>Purpose</th>
                      <th>Category</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cookieTable.map((cookie) => (
                      <tr key={cookie.name}>
                        <td className="font-mono text-[13px]">{cookie.name}</td>
                        <td className="text-[13px] text-[#999999] font-normal">{cookie.purpose}</td>
                        <td className="text-[13px] font-normal">{cookie.category}</td>
                        <td className="text-[13px] text-[#999999] font-normal">{cookie.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h2 className="text-lg font-bold text-white mb-3">6. Updates to This Policy</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                We may update this Cookie Policy from time to time to reflect changes in the cookies we use or for other operational, legal, or regulatory reasons. Any changes will be posted on this page with an updated revision date. We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies. If we make material changes to this policy, we will notify you through a prominent notice on our website or by other means as required by applicable law.
              </p>
            </FadeIn>

            <FadeIn delay={0.35}>
              <h2 className="text-lg font-bold text-white mb-3">7. Contact</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us at:{' '}
                <a href="mailto:privacy@harchcorp.com" className="text-white hover:underline">privacy@harchcorp.com</a>{' '}
                or write to us at Harch Corp, 123 Boulevard Mohammed V, Casablanca 20000, Morocco.
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">Last updated: January 2026 | This policy is governed by the laws of the Kingdom of Morocco.</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
