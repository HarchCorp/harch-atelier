'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import { Plane, Radio, Building2, Leaf } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Product {
  id: string
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  name: string
  tagline: string
  price: string
  unit: string
  description: string
  features: string[]
  stats: { label: string; value: string }[]
}

function useProducts(): Product[] {
  const t = useTranslations('harchagri.productCards')

  const products: Product[] = [
    {
      id: 'drone',
      icon: Plane,
      name: t('products.drone.name'),
      tagline: t('products.drone.tagline'),
      price: '$15,000',
      unit: t('units.perUnit'),
      description: t('products.drone.description'),
      features: [
        t('products.drone.features.0'),
        t('products.drone.features.1'),
        t('products.drone.features.2'),
        t('products.drone.features.3'),
        t('products.drone.features.4'),
      ],
      stats: [
        { label: t('products.drone.stats.accuracy'), value: '97.3%' },
        { label: t('products.drone.stats.coveragePerDay'), value: '800 ha' },
        { label: t('products.drone.stats.roi'), value: '3.2x' },
      ],
    },
    {
      id: 'iot',
      icon: Radio,
      name: t('products.iot.name'),
      tagline: t('products.iot.tagline'),
      price: '$500',
      unit: t('units.perHectareYear'),
      description: t('products.iot.description'),
      features: [
        t('products.iot.features.0'),
        t('products.iot.features.1'),
        t('products.iot.features.2'),
        t('products.iot.features.3'),
        t('products.iot.features.4'),
      ],
      stats: [
        { label: t('products.iot.stats.sensors'), value: '11,800+' },
        { label: t('products.iot.stats.soilAccuracy'), value: '±2%' },
        { label: t('products.iot.stats.waterSavings'), value: '35%' },
      ],
    },
    {
      id: 'vertical',
      icon: Building2,
      name: t('products.vertical.name'),
      tagline: t('products.vertical.tagline'),
      price: '$50,000',
      unit: t('units.perModule'),
      description: t('products.vertical.description'),
      features: [
        t('products.vertical.features.0'),
        t('products.vertical.features.1'),
        t('products.vertical.features.2'),
        t('products.vertical.features.3'),
        t('products.vertical.features.4'),
      ],
      stats: [
        { label: t('products.vertical.stats.yieldPerM2'), value: '10x' },
        { label: t('products.vertical.stats.waterSavings'), value: '95%' },
        { label: t('products.vertical.stats.daysPerYear'), value: '365' },
      ],
    },
    {
      id: 'carbon',
      icon: Leaf,
      name: t('products.carbon.name'),
      tagline: t('products.carbon.tagline'),
      price: '2%',
      unit: t('units.carbonRevenue'),
      description: t('products.carbon.description'),
      features: [
        t('products.carbon.features.0'),
        t('products.carbon.features.1'),
        t('products.carbon.features.2'),
        t('products.carbon.features.3'),
        t('products.carbon.features.4'),
      ],
      stats: [
        { label: t('products.carbon.stats.creditsPerYear'), value: '2,350 tCO₂' },
        { label: t('products.carbon.stats.avgRevenue'), value: '$47/ha' },
        { label: t('products.carbon.stats.verification'), value: 'ISO 14064' },
      ],
    },
  ]

  return products
}

function ProductCard({ product, index, requestDemoLabel }: { product: Product; index: number; requestDemoLabel: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const controls = useAnimation()
  const [isHovered, setIsHovered] = useState(false)
  const Icon = product.icon

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    }
  }, [isInView, controls])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants: any = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <motion.div
        className="card p-6 h-full relative overflow-hidden"
        animate={{
          borderColor: isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Subtle top line on hover */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'rgba(255,255,255,0.3)' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center">
              <Icon size={18} className="text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-[14px] text-white">{product.name}</h3>
              <p className="text-[11px] text-[#666666]">{product.tagline}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white stat-mono">{product.price}</p>
            <p className="text-[10px] text-[#666666]">{product.unit}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-[12px] text-[#999999] leading-relaxed mb-4">
          {product.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {product.stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.5 + index * 0.15 + i * 0.1 }}
              className="text-center p-2 rounded-lg bg-[rgba(255,255,255,0.03)]"
            >
              <p className="text-sm font-bold text-white stat-mono">{stat.value}</p>
              <p className="text-[9px] text-[#666666] uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <div className="space-y-2">
          {product.features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ delay: 0.7 + index * 0.15 + i * 0.06 }}
              className="flex items-start gap-2"
            >
              <div className="mt-1.5 w-1 h-1 rounded-full bg-white/30 flex-shrink-0" />
              <span className="text-[11px] text-[#999999]">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="mt-5 w-full py-2.5 rounded-lg text-[12px] font-semibold transition-all duration-300 border border-[rgba(255,255,255,0.12)] text-white hover:bg-white hover:text-black"
        >
          {requestDemoLabel}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default function ProductCards() {
  const products = useProducts()
  const t = useTranslations('harchagri.productCards')

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} requestDemoLabel={t('requestDemo')} />
      ))}
    </div>
  )
}
