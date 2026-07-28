'use client';

import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const trademarks = [
  { mark: 'Harch', status: 'Registered', registration: 'MA-2024-001', description: 'Primary corporate mark for Harch Corp and its consolidated entities' },
  { mark: 'Harch Corp', status: 'Registered', registration: 'MA-2024-002', description: 'Full corporate name trademark used in formal business contexts' },
  { mark: 'HarchOS', status: 'Registered', registration: 'MA-2024-003', description: 'Operating system platform for AI data center management and infrastructure orchestration' },
  { mark: 'Harch Intelligence', status: 'Registered', registration: 'MA-2024-004', description: 'Intelligence and data center infrastructure vertical brand' },
  { mark: 'Harch Energy', status: 'Registered', registration: 'MA-2024-005', description: 'Renewable energy generation and distribution vertical brand' },
  { mark: 'Harch Cement', status: 'Registered', registration: 'MA-2024-006', description: 'Cement and construction materials manufacturing vertical brand' },
  { mark: 'Harch Mining', status: 'Registered', registration: 'MA-2024-007', description: 'Strategic mining and minerals extraction vertical brand' },
  { mark: 'Harch Agri', status: 'Registered', registration: 'MA-2024-008', description: 'Precision agriculture and vertical farming vertical brand' },
  { mark: 'Harch Water', status: 'Registered', registration: 'MA-2024-009', description: 'Water infrastructure and desalination vertical brand' },
  { mark: 'Harch Tech', status: 'Registered', registration: 'MA-2024-010', description: 'Sovereign technology and cybersecurity vertical brand' },
  { mark: 'Harch Shield', status: 'Pending', registration: 'MA-2025-P001', description: 'Cybersecurity and threat intelligence product line' },
  { mark: 'Harch Mesh', status: 'Pending', registration: 'MA-2025-P002', description: 'Distributed network infrastructure and connectivity platform' },
];

const notAllowed = [
  'Using Harch Corp trademarks in a way that implies endorsement, partnership, or sponsorship without written authorization from Harch Corp',
  'Modifying, distorting, or altering the Harch Corp logo or any trademark in any way, including changing colors, proportions, or adding effects.',
  'Using Harch Corp trademarks as part of your own company name, product name, domain name, or social media handle.',
  'Displaying the Harch Corp logo alongside competitor trademarks or in contexts that could create confusion about the source of products or services.',
  'Using Harch Corp trademarks on merchandise, promotional items, or commercial products without explicit written permission.',
  'Incorporating Harch Corp trademarks into your own logos, icons, or brand identifiers.',
  'Using Harch Corp trademarks in any manner that is misleading, defamatory, obscene, or otherwise objectionable.',
  'Registering or attempting to register any Harch Corp trademark or confusingly similar marks as domain names, social media handles, or trade names.',
  'Using Harch Corp trademarks in metadata, hidden text, or keyword advertising (including Google Ads) to divert traffic from Harch Corp\'s own digital properties.',
  'Creating derivative works based on Harch Corp trademarks, including parodies that could dilute the brand or tarnish its reputation.',
];

export default function TrademarkPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">Trademark Guidelines</h1>
            <div className="accent-line mb-8" />
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">Last updated: January 2026</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">Harch Corp Trademarks</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                The following are trademarks and service marks owned by Harch Corp This list is not exhaustive and may be updated from time to time. The absence of a mark from this list does not mean it is not a trademark of Harch Corp:
              </p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mark</th>
                      <th>Status</th>
                      <th>Registration</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trademarks.map((tm) => (
                      <tr key={tm.mark}>
                        <td className="text-[13px] font-semibold">{tm.mark}</td>
                        <td className="text-[13px] font-normal">
                          <span className={tm.status === 'Registered' ? 'text-white' : 'text-[#999999]'}>{tm.status}</span>
                        </td>
                        <td className="text-[13px] text-[#999999] font-normal font-mono-tag">{tm.registration}</td>
                        <td className="text-[13px] text-[#999999] font-normal">{tm.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">Proper Usage Guidelines</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                Proper use of Harch Corp trademarks is essential to maintaining their legal protection and the strength of our brand. Please follow these guidelines when referring to Harch Corp trademarks:
              </p>
              <div className="space-y-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Use the Appropriate Symbol</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">Use the ® symbol for registered trademarks and the ™ symbol for trademarks pending registration or unregistered marks. The symbol should appear in superscript immediately after the trademark, on its first and most prominent use in any document or webpage. Example: HarchOS® or Harch Shield™.</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Use Trademarks as Adjectives</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">Always use Harch Corp trademarks as adjectives, never as nouns or verbs. They should be followed by the generic term for the product or service. Correct: &ldquo;the HarchOS platform&rdquo;; Incorrect: &ldquo;powered by HarchOS&rdquo; without a following generic term. This preserves the distinctiveness of the mark.</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Distinguish from Surrounding Text</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">Make Harch Corp trademarks visually distinct from surrounding text through capitalization, bold or italic formatting, or quotation marks. Never use all lowercase for our trademarks. Example: &ldquo;Harch Energy&rdquo; or <strong>Harch Energy</strong>, never &ldquo;harch energy.&rdquo;</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Acknowledge Ownership</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">Include a trademark attribution notice in all materials that use Harch Corp trademarks. The attribution should appear in a footnote or at the end of the document. Example: &ldquo;Harch, HarchOS, and Harch Intelligence are registered trademarks of Harch Corp All rights reserved.&rdquo;</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Do Not Abbreviate or Shorten</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">Do not abbreviate, shorten, or create acronyms from Harch Corp trademarks. Always use the full, proper form of the trademark. Example: use &ldquo;Harch Intelligence,&rdquo; not &ldquo;HI&rdquo; or &ldquo;Harch Intel.&rdquo;</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">Logo Usage Rules</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                The Harch Corp logo is a critical element of our brand identity. When authorized to use our logo, you must adhere to the following rules:
              </p>
              <div className="space-y-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Clear Space</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">The logo must have a minimum clear space equal to the height of the &ldquo;H&rdquo; in &ldquo;Harch&rdquo; on all sides. No other graphic elements, text, or visual elements may encroach on this clear space area.</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Minimum Size</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">The logo must not be reproduced smaller than 24 pixels in height for digital applications or 8mm in height for print applications. This ensures legibility and preserves the integrity of the mark.</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Approved Versions</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">Use only approved versions of the Harch Corp logo as provided by our brand team. Do not recreate, redraw, or modify the logo. Approved versions include the full-color version (white on dark backgrounds), the monochrome version, and the icon-only version for specific applications.</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Background Requirements</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">The logo must only be placed on backgrounds that provide sufficient contrast. The white version is for dark backgrounds, and the dark version is for light backgrounds. Do not place the logo over busy images, patterns, or backgrounds that compromise readability.</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">Color and Typography Standards</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                The Harch Corp brand uses a carefully defined color palette and typography system. When producing materials that reference our brand:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Primary Colors</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">White (#FFFFFF) is the primary brand color, used for the logo and key typographic elements. Dark background (#0D0D0D) serves as the foundation of our visual identity, reflecting our industrial precision and technological sophistication.</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Typography</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">Inter is our primary typeface for body text and user interfaces. Space Mono is our secondary typeface used for data, labels, and technical notation. Do not substitute these typefaces with alternatives without written approval.</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Accent Colors</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">Our accent colors include muted gray tones (#999999 for secondary text, #666666 for tertiary elements). These are used sparingly and must not dominate or compete with the primary palette.</p>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <h3 className="text-[15px] font-semibold text-white mb-2">Prohibited Colors</h3>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">Do not apply unauthorized colors to the Harch Corp logo or brand materials. The logo must only appear in its approved color versions (white on dark, dark on light). Gradient or multi-color treatments are strictly prohibited.</p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">What Is Not Allowed</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                The following uses of Harch Corp trademarks are strictly prohibited without prior written authorization:
              </p>
              <ul className="space-y-2">
                {notAllowed.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                    <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h2 className="text-lg font-bold text-white mb-3">Requesting Permission</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                If you wish to use any Harch Corp trademark or logo in a manner not expressly covered by these guidelines, you must obtain prior written permission from our brand team. Permission requests should include:
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                  <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                  The specific trademark(s) you wish to use
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                  <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                  A detailed description of the intended use, context, and distribution
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                  <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                  Visual mockups or samples of how the trademark will appear
                </li>
                <li className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                  <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                  The intended duration and geographic scope of use
                </li>
              </ul>
              <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <p className="text-[14px] text-white font-medium mb-2">Brand Permissions Team</p>
                <p className="text-[14px] text-[#999999]">Email: <a href="mailto:brand@harchcorp.com" className="text-white hover:underline">brand@harchcorp.com</a></p>
                <p className="text-[14px] text-[#999999]">Address: Harch Corp, 123 Boulevard Mohammed V, Casablanca 20000, Morocco</p>
                <p className="text-[14px] text-[#999999] mt-2">We aim to respond to all permission requests within 10 business days.</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.35}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">Last updated: January 2026 | All trademarks are the property of Harch Corp and are protected under the laws of the Kingdom of Morocco and international trademark conventions.</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
