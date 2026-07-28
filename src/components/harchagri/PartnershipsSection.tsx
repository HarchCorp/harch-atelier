'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Building2, Globe, FlaskConical, Network } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Partner {
  name: string
  type: string
  country: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  status: string
}

export default function PartnershipsSection() {
  const t = useTranslations('harchagri.partnerships')
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const partners: Partner[] = [
    {
      name: 'OCP Group',
      type: t('partners.ocp.type'),
      country: t('partners.ocp.country'),
      description: t('partners.ocp.description'),
      icon: Building2,
      status: t('statusActive'),
    },
    {
      name: 'Plan Vert Maroc',
      type: t('partners.planVert.type'),
      country: t('partners.planVert.country'),
      description: t('partners.planVert.description'),
      icon: Globe,
      status: t('statusActive'),
    },
    {
      name: 'FAO Morocco',
      type: t('partners.fao.type'),
      country: t('partners.fao.country'),
      description: t('partners.fao.description'),
      icon: Globe,
      status: t('statusNegotiation'),
    },
    {
      name: 'ISRA',
      type: t('partners.isra.type'),
      country: t('partners.isra.country'),
      description: t('partners.isra.description'),
      icon: FlaskConical,
      status: t('statusActive'),
    },
    {
      name: 'AgTech Kenya',
      type: t('partners.agtechKenya.type'),
      country: t('partners.agtechKenya.country'),
      description: t('partners.agtechKenya.description'),
      icon: Network,
      status: t('statusActive'),
    },
    {
      name: 'Ghana MoFA',
      type: t('partners.ghanaMofa.type'),
      country: t('partners.ghanaMofa.country'),
      description: t('partners.ghanaMofa.description'),
      icon: Globe,
      status: t('statusNegotiation'),
    },
  ]

  return (
    <div ref={ref}>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map((partner, index) => {
          const Icon = partner.icon
          return (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="card p-6 h-full group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Icon size={14} className="text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[13px] text-white">{partner.name}</h4>
                    <p className="text-[10px] text-[#666666]">{partner.type} — {partner.country}</p>
                  </div>
                </div>
                <span
                  className={`status-badge ${
                    partner.status === t('statusActive') ? 'status-badge-active' : 'status-badge-engineering'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {partner.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-[11px] text-[#999999] leading-relaxed">
                {partner.description}
              </p>

              {/* Bottom */}
              <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.04)]">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-[9px] text-[#666666] uppercase tracking-wider font-[family-name:var(--font-space-mono)]">{t('partnerLabel')}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
