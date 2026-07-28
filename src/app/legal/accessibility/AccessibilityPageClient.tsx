'use client';

import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const accessibilityFeatures = [
  {
    feature: 'Keyboard Navigation',
    description: 'Our website is fully navigable using keyboard controls. All interactive elements, including menus, forms, links, and buttons, can be accessed and operated using standard keyboard shortcuts and the Tab key.',
  },
  {
    feature: 'Screen Reader Compatibility',
    description: 'We have designed our website to be compatible with leading screen readers, including JAWS, NVDA, and VoiceOver. We use semantic HTML, ARIA landmarks, and descriptive labels to ensure screen reader users can effectively navigate and understand our content.',
  },
  {
    feature: 'Contrast and Readability',
    description: 'We maintain color contrast ratios that meet WCAG 2.1 Level AA requirements (minimum 4.5:1 for normal text and 3:1 for large text). Our typography is designed for optimal readability, with appropriate line heights, letter spacing, and font sizes.',
  },
  {
    feature: 'Responsive Design',
    description: 'Our website is fully responsive and adapts to different screen sizes and devices. Content remains accessible and usable whether viewed on desktop, tablet, or mobile devices, with no loss of information or functionality.',
  },
  {
    feature: 'Alt Text for Images',
    description: 'All meaningful images on our website include descriptive alternative text that conveys the purpose and content of the image. Decorative images are hidden from assistive technologies using appropriate ARIA attributes.',
  },
  {
    feature: 'Form Accessibility',
    description: 'All form fields have associated labels, clear instructions, and meaningful error messages. Required fields are clearly indicated, and form validation provides specific, actionable feedback to help users correct errors.',
  },
  {
    feature: 'Focus Indicators',
    description: 'Visible focus indicators are provided for all interactive elements to help keyboard users track their position on the page. Focus order follows a logical sequence that matches the visual layout of the content.',
  },
  {
    feature: 'Skip Navigation Links',
    description: 'We provide skip navigation links that allow keyboard users to bypass repetitive navigation elements and jump directly to the main content area of each page.',
  },
];

const knownLimitations = [
  {
    limitation: 'Third-Party Content',
    description: 'Some third-party content embedded on our website, such as interactive maps and video players, may not fully conform to WCAG 2.1 Level AA standards. We are working with our third-party providers to improve the accessibility of this content.',
  },
  {
    limitation: 'Document Formats',
    description: 'Some older PDF documents and downloadable resources may not be fully accessible to screen readers. We are in the process of converting these documents to accessible formats and ensuring all new documents are published in accessible formats.',
  },
  {
    limitation: 'Live Content',
    description: 'Real-time data visualizations and live operational dashboards may present challenges for some assistive technologies. We are developing alternative text-based representations for these dynamic content areas.',
  },
  {
    limitation: 'Legacy Content',
    description: 'Archived content published before our accessibility initiative may not meet current standards. We are prioritizing the remediation of high-traffic and critical content while maintaining an ongoing remediation schedule for the remaining archive.',
  },
];

export default function AccessibilityPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">Accessibility Statement</h1>
            <div className="accent-line mb-8" />
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">Last updated: January 2026</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">Our Commitment to Accessibility</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                Harch Corp is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards to ensure our website and digital services are perceivable, operable, understandable, and robust for all users. Accessibility is not just a compliance obligation for us — it is a core principle that aligns with our values as a responsible corporate citizen and our mission to serve diverse communities across Africa and beyond. We invest in accessibility because we believe everyone should have equal access to information about our company, services, and opportunities.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">Standards We Follow</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                Our website is designed and developed to conform to the{' '}
                <span className="text-white font-medium">Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</span>, as published by the World Wide Web Consortium (W3C) Web Accessibility Initiative (WAI). These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone. We also reference additional accessibility standards and frameworks, including Section 508 of the Rehabilitation Act (United States), the European Standard EN 301 549, and the Kingdom of Morocco&apos;s accessibility requirements under the framework of the National Initiative for People with Disabilities.
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">Accessibility Features</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                We have implemented the following accessibility features across our website:
              </p>
              <div className="space-y-4">
                {accessibilityFeatures.map((feature) => (
                  <div key={feature.feature} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <h3 className="text-[15px] font-semibold text-white mb-2">{feature.feature}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">{feature.description}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">Known Limitations</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                Despite our best efforts, some accessibility limitations may exist on our website. We are actively working to address these:
              </p>
              <div className="space-y-4">
                {knownLimitations.map((item) => (
                  <div key={item.limitation} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                    <h3 className="text-[15px] font-semibold text-white mb-2">{item.limitation}</h3>
                    <p className="text-[14px] text-[#999999] leading-[1.8]">{item.description}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">Feedback and Contact</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                We welcome your feedback on the accessibility of our website. If you encounter any accessibility barriers or have suggestions for improvement, please let us know. We take all feedback seriously and will make reasonable efforts to address accessibility issues promptly.
              </p>
              <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <p className="text-[14px] text-white font-medium mb-2">Accessibility Team</p>
                <p className="text-[14px] text-[#999999]">Email: <a href="mailto:accessibility@harchcorp.com" className="text-white hover:underline">accessibility@harchcorp.com</a></p>
                <p className="text-[14px] text-[#999999]">Address: Harch Corp, 123 Boulevard Mohammed V, Casablanca 20000, Morocco</p>
                <p className="text-[14px] text-[#999999] mt-2">We aim to respond to accessibility feedback within 3 business days and to propose a resolution within 10 business days.</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.3}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">Last updated: January 2026 | This statement is reviewed quarterly and governed by the laws of the Kingdom of Morocco.</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
