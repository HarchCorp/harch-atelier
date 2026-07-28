'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface Competitor {
  name: string
  country: string
  revenue: string
  funding: string
  product: string
  model: string
  harchAdvantage: string
}

export default function CompetitorComparison() {
  const t = useTranslations('harchagri.competitorComparison')
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const competitors: Competitor[] = [
    {
      name: 'Twiga Foods',
      country: t('competitors.twiga.country'),
      revenue: '$120M',
      funding: '$110M',
      product: t('competitors.twiga.product'),
      model: t('competitors.twiga.model'),
      harchAdvantage: t('competitors.twiga.advantage'),
    },
    {
      name: 'Apollo Agriculture',
      country: t('competitors.apollo.country'),
      revenue: '$50M',
      funding: '$40M',
      product: t('competitors.apollo.product'),
      model: t('competitors.apollo.model'),
      harchAdvantage: t('competitors.apollo.advantage'),
    },
    {
      name: 'Aerofarms',
      country: t('competitors.aerofarms.country'),
      revenue: '$30M',
      funding: '$250M',
      product: t('competitors.aerofarms.product'),
      model: t('competitors.aerofarms.model'),
      harchAdvantage: t('competitors.aerofarms.advantage'),
    },
    {
      name: 'Climate Corp',
      country: t('competitors.climate.country'),
      revenue: '$500M',
      funding: 'Acquired $1.1B',
      product: t('competitors.climate.product'),
      model: t('competitors.climate.model'),
      harchAdvantage: t('competitors.climate.advantage'),
    },
    {
      name: 'OCP Group',
      country: t('competitors.ocp.country'),
      revenue: '$7.2B',
      funding: 'State-owned',
      product: t('competitors.ocp.product'),
      model: t('competitors.ocp.model'),
      harchAdvantage: t('competitors.ocp.advantage'),
    },
  ]

  return (
    <div ref={ref}>
      {/* Main data table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
        className="bg-[#1E1E1E] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('headers.company')}</th>
                <th>{t('headers.country')}</th>
                <th>{t('headers.revenue')}</th>
                <th>{t('headers.funding')}</th>
                <th>{t('headers.product')}</th>
                <th>{t('headers.model')}</th>
                <th>{t('headers.harchAdvantage')}</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((comp, index) => (
                <motion.tr
                  key={comp.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                >
                  <td className="font-semibold text-white">{comp.name}</td>
                  <td className="text-[#999999]">{comp.country}</td>
                  <td className="text-white">{comp.revenue}</td>
                  <td className="text-[#999999]">{comp.funding}</td>
                  <td className="text-[#999999]">{comp.product}</td>
                  <td className="text-[#999999]">{comp.model}</td>
                  <td>
                    <div className="flex items-start gap-2">
                      <div className="mt-1.5 w-1 h-1 rounded-full bg-white/40 flex-shrink-0" />
                      <span className="text-[12px] text-[#999999]">{comp.harchAdvantage}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
          <p className="text-[11px] text-[#666666]">{t('footnote')}</p>
        </div>
      </motion.div>

      {/* HarchAgri highlight row */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-6 card p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
            <span className="text-[10px] font-bold tracking-[0.15em] text-white font-[family-name:var(--font-space-mono)]">/0.6</span>
          </div>
          <div>
            <h4 className="font-bold text-white text-lg">{t('harchAgri.title')}</h4>
            <p className="text-[11px] text-[#666666]">{t('harchAgri.subtitle')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-[10px] text-[#666666] uppercase tracking-wider">{t('harchAgri.year2Target')}</p>
            <p className="text-lg font-bold text-white stat-mono">$8.5M</p>
          </div>
          <div>
            <p className="text-[10px] text-[#666666] uppercase tracking-wider">{t('harchAgri.investment')}</p>
            <p className="text-lg font-bold text-white stat-mono">$2.1M</p>
          </div>
          <div>
            <p className="text-[10px] text-[#666666] uppercase tracking-wider">{t('harchAgri.modelLabel')}</p>
            <p className="text-lg font-bold text-white">{t('harchAgri.modelValue')}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#666666] uppercase tracking-wider">{t('harchAgri.differentiator')}</p>
            <p className="text-[13px] text-white leading-snug">{t('harchAgri.differentiatorValue')}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
