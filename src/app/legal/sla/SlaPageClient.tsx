'use client';

import { motion } from 'framer-motion';

import { FadeIn } from '@/components/ui/motion';

const serviceCredits = [
  { uptime: '99.95% – 99.99%', credit: '10%', description: 'Monthly service fee credit' },
  { uptime: '99.90% – 99.94%', credit: '25%', description: 'Monthly service fee credit' },
  { uptime: '99.50% – 99.89%', credit: '50%', description: 'Monthly service fee credit' },
  { uptime: 'Below 99.50%', credit: '75%', description: 'Monthly service fee credit' },
];

const exclusions = [
  'Scheduled maintenance windows as communicated in advance',
  'Issues caused by factors outside our reasonable control (force majeure events, natural disasters, government actions)',
  'Downtime resulting from client misconfiguration, unauthorized modifications, or misuse of the services',
  'Failures of client-provided equipment, software, or network connectivity',
  'Issues arising from third-party services or integrations not managed by Harch Corp',
  'Temporary interruptions during emergency security patching or critical vulnerability remediation',
  'Degradation of service performance due to client exceeding allocated resource quotas',
];

export default function SlaPageClient() {
  return (
    <div className="bg-[#0D0D0D]">
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0D0D0D]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="section-label mb-4">Legal</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-[-0.02em] leading-[1.05] mb-6">Service Level Agreement</h1>
            <div className="accent-line mb-8" />
            <p className="text-[14px] text-[#999999] leading-relaxed mb-8">Last updated: January 2026</p>
          </FadeIn>

          <div className="space-y-10">
            <FadeIn delay={0.05}>
              <h2 className="text-lg font-bold text-white mb-3">Service Availability Target</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                Harch Corp is committed to providing highly available and reliable services to our clients. Our Service Level Agreement guarantees a monthly uptime target of{' '}
                <span className="text-white font-semibold">99.95%</span> for all covered services, including our digital platform, API endpoints, and managed infrastructure. This commitment reflects our investment in enterprise-grade infrastructure, redundant systems, and 24/7 operations monitoring across our data centers and service delivery platforms.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="text-lg font-bold text-white mb-3">Measurement Methodology</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                Service availability is measured on a monthly basis using the following methodology:
              </p>
              <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <div className="space-y-3">
                  <p className="text-[14px] text-[#999999] leading-[1.8]">
                    <span className="text-white font-medium">Uptime Percentage</span> is calculated as: (Total Minutes in Month − Downtime Minutes) ÷ Total Minutes in Month × 100
                  </p>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">
                    <span className="text-white font-medium">Downtime</span> is defined as the period during which the covered service is unavailable and responds with errors or does not respond to valid requests for more than 5 consecutive minutes.
                  </p>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">
                    <span className="text-white font-medium">Monitoring</span> is performed by independent third-party monitoring services from at least three geographically distributed locations. A service is considered down only when confirmed by at least two monitoring locations simultaneously.
                  </p>
                  <p className="text-[14px] text-[#999999] leading-[1.8]">
                    <span className="text-white font-medium">Measurement Period</span> runs from 00:00 UTC on the first day of each calendar month to 23:59 UTC on the last day of the month.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-lg font-bold text-white mb-3">Scheduled Maintenance</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                To ensure the continued reliability and security of our services, we perform scheduled maintenance windows. Maintenance windows are typically scheduled on the first Saturday of each month between 02:00 UTC and 06:00 UTC. We provide at least 72 hours advance notice for planned maintenance through our status page and email notifications to registered contacts. Emergency maintenance may be performed without advance notice when necessary to address critical security vulnerabilities or service-threatening conditions. Scheduled maintenance downtime is excluded from availability calculations.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-lg font-bold text-white mb-3">Service Credits</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                If we fail to meet the service availability target in a given month, affected clients are entitled to service credits as follows:
              </p>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Monthly Uptime</th>
                      <th>Service Credit</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceCredits.map((row) => (
                      <tr key={row.uptime}>
                        <td className="text-[13px]">{row.uptime}</td>
                        <td className="text-[13px] font-semibold">{row.credit}</td>
                        <td className="text-[13px] text-[#999999] font-normal">{row.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[14px] text-[#999999] leading-[1.8] mt-4">
                Service credits are the sole and exclusive remedy for any failure to meet the SLA target. Credits are applied automatically to the next billing cycle and are not refundable in cash. The maximum aggregate credit for a single month shall not exceed 75% of the monthly service fee. To receive credits, clients must continue to be current on their payment obligations.
              </p>
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="text-lg font-bold text-white mb-3">Exclusions</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                The SLA does not apply to downtime or performance issues resulting from the following:
              </p>
              <ul className="space-y-2">
                {exclusions.map((exclusion) => (
                  <li key={exclusion} className="flex items-start gap-3 text-[14px] text-[#999999] leading-[1.8]">
                    <span className="text-[#666666] mt-1.5 shrink-0">—</span>
                    {exclusion}
                  </li>
                ))}
              </ul>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h2 className="text-lg font-bold text-white mb-3">SLA Claims Process</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8] mb-4">
                To submit an SLA claim, clients must follow the process outlined below:
              </p>
              <div className="space-y-4">
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">01</span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">Submit a Claim</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.8]">Submit a claim to support@harchcorp.com within 30 calendar days of the end of the month in which the downtime occurred. Claims must include the affected service, dates and times of downtime, and any supporting evidence or logs.</p>
                    </div>
                  </div>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">02</span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">Review and Verification</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.8]">Our team will review the claim against our monitoring data and system logs within 15 business days. We may request additional information from the client during this review period.</p>
                    </div>
                  </div>
                </div>
                <div className="border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                  <div className="flex items-start gap-4">
                    <span className="text-white font-bold text-[15px] shrink-0">03</span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">Credit Application</h3>
                      <p className="text-[14px] text-[#999999] leading-[1.8]">If the claim is validated, the applicable service credit will be applied to the client&apos;s next invoice. We will provide written confirmation of the credit amount and the billing period to which it applies.</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.35}>
              <h2 className="text-lg font-bold text-white mb-3">Contact</h2>
              <p className="text-[14px] text-[#999999] leading-[1.8]">
                For SLA-related inquiries, claims, or support requests, please contact our support team:
              </p>
              <div className="mt-4 border border-[rgba(255,255,255,0.06)] rounded-lg p-5 bg-[#1E1E1E]">
                <p className="text-[14px] text-white font-medium mb-2">Harch Corp Support</p>
                <p className="text-[14px] text-[#999999]">Email: <a href="mailto:support@harchcorp.com" className="text-white hover:underline">support@harchcorp.com</a></p>
                <p className="text-[14px] text-[#999999]">Status Page: status.harchcorp.com</p>
                <p className="text-[14px] text-[#999999]">Address: Harch Corp, 123 Boulevard Mohammed V, Casablanca 20000, Morocco</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[12px] text-[#666666]">Last updated: January 2026 | This SLA is governed by the laws of the Kingdom of Morocco.</p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
