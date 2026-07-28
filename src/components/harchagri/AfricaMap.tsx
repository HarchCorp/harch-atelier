'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useTranslations } from 'next-intl'

interface HubData {
  name: string
  country: string
  lat: number
  lon: number
  sensors: number
  hectares: number
  type: string
}

export default function AfricaMap() {
  const t = useTranslations('harchagri.africaMap')
  const svgRef = useRef<SVGSVGElement>(null)
  const [activeHub, setActiveHub] = useState<HubData | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const hubs: HubData[] = [
    { name: t('hubs.casablanca.name'), country: t('hubs.casablanca.country'), lat: 33.57, lon: -7.59, sensors: 2400, hectares: 5000, type: t('hubs.casablanca.type') },
    { name: t('hubs.dakar.name'), country: t('hubs.dakar.country'), lat: 14.69, lon: -17.44, sensors: 1800, hectares: 3500, type: t('hubs.dakar.type') },
    { name: t('hubs.nairobi.name'), country: t('hubs.nairobi.country'), lat: -1.29, lon: 36.82, sensors: 3200, hectares: 8000, type: t('hubs.nairobi.type') },
    { name: t('hubs.accra.name'), country: t('hubs.accra.country'), lat: 5.56, lon: -0.19, sensors: 1500, hectares: 2500, type: t('hubs.accra.type') },
    { name: t('hubs.lagos.name'), country: t('hubs.lagos.country'), lat: 6.52, lon: 3.38, sensors: 2100, hectares: 6000, type: t('hubs.lagos.type') },
  ]

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    // Africa projection
    const projection = d3.geoMercator()
      .center([20, 5])
      .scale(width * 0.22)
      .translate([width / 2, height / 2])

    const path = d3.geoPath().projection(projection)

    const g = svg.append('g')

    // Draw grid lines — white/muted style
    const gridGroup = g.append('g').attr('class', 'grid')

    // Longitude lines
    for (let lon = -20; lon <= 55; lon += 10) {
      const lineData: [number, number][] = []
      for (let lat = -35; lat <= 38; lat += 2) {
        lineData.push([lon, lat])
      }
      gridGroup.append('path')
        .datum({ type: 'LineString', coordinates: lineData })
        .attr('d', path as any)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255, 255, 255, 0.04)')
        .attr('stroke-width', 0.5)
    }

    // Latitude lines
    for (let lat = -35; lat <= 38; lat += 10) {
      const lineData: [number, number][] = []
      for (let lon = -20; lon <= 55; lon += 2) {
        lineData.push([lon, lat])
      }
      gridGroup.append('path')
        .datum({ type: 'LineString', coordinates: lineData })
        .attr('d', path as any)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255, 255, 255, 0.04)')
        .attr('stroke-width', 0.5)
    }

    // Draw coverage circles (pulsing) — white style
    hubs.forEach((hub) => {
      const pos = projection([hub.lon, hub.lat])
      if (!pos) return

      // Coverage area
      g.append('circle')
        .attr('cx', pos[0])
        .attr('cy', pos[1])
        .attr('r', 0)
        .attr('fill', 'rgba(255, 255, 255, 0.03)')
        .attr('stroke', 'rgba(255, 255, 255, 0.1)')
        .attr('stroke-width', 1)
        .transition()
        .duration(2000)
        .attr('r', 40)

      // Pulse ring
      g.append('circle')
        .attr('cx', pos[0])
        .attr('cy', pos[1])
        .attr('r', 5)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255, 255, 255, 0.4)')
        .attr('stroke-width', 1.5)
        .call(pulseAnimation)
    })

    function pulseAnimation(selection: d3.Selection<SVGCircleElement, unknown, null, undefined>) {
      function repeat() {
        selection
          .attr('r', 5)
          .attr('stroke-opacity', 0.4)
          .transition()
          .duration(2000)
          .attr('r', 30)
          .attr('stroke-opacity', 0)
          .on('end', repeat)
      }
      repeat()
    }

    // Draw connection lines between hubs — white/muted style
    const connections = [
      [0, 1], [0, 4], [1, 3], [3, 4], [4, 2]
    ]

    // Gradient definition for connection lines
    const defs = svg.append('defs')
    const gradient = defs.append('linearGradient')
      .attr('id', 'lineGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%')
    gradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(255,255,255,0.2)')
    gradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(255,255,255,0.05)')

    connections.forEach(([from, to]) => {
      const fromPos = projection([hubs[from].lon, hubs[from].lat])
      const toPos = projection([hubs[to].lon, hubs[to].lat])
      if (!fromPos || !toPos) return

      const midX = (fromPos[0] + toPos[0]) / 2
      const midY = (fromPos[1] + toPos[1]) / 2 - 20

      g.append('path')
        .attr('d', `M ${fromPos[0]} ${fromPos[1]} Q ${midX} ${midY} ${toPos[0]} ${toPos[1]}`)
        .attr('fill', 'none')
        .attr('stroke', 'url(#lineGradient)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4 4')
        .attr('opacity', 0.4)

      // Animated data packet
      g.append('circle')
        .attr('r', 2)
        .attr('fill', 'rgba(255, 255, 255, 0.6)')
        .attr('opacity', 0.8)
        .append('animateMotion')
        .attr('dur', `${3 + Math.random() * 2}s`)
        .attr('repeatCount', 'indefinite')
        .attr('path', `M ${fromPos[0]} ${fromPos[1]} Q ${midX} ${midY} ${toPos[0]} ${toPos[1]}`)
    })

    // Draw hub markers (interactive) — white/muted style
    const hubGroup = g.append('g').attr('class', 'hubs')

    hubs.forEach((hub) => {
      const pos = projection([hub.lon, hub.lat])
      if (!pos) return

      const group = hubGroup.append('g')
        .attr('transform', `translate(${pos[0]}, ${pos[1]})`)
        .style('cursor', 'pointer')

      // Outer glow
      group.append('circle')
        .attr('r', 8)
        .attr('fill', 'rgba(255, 255, 255, 0.08)')
        .attr('stroke', 'rgba(255, 255, 255, 0.25)')
        .attr('stroke-width', 1)

      // Inner dot
      group.append('circle')
        .attr('r', 4)
        .attr('fill', 'rgba(255, 255, 255, 0.6)')

      // Label
      group.append('text')
        .attr('x', 12)
        .attr('y', 4)
        .attr('fill', 'rgba(255, 255, 255, 0.7)')
        .attr('font-size', '10px')
        .attr('font-family', 'var(--font-space-mono), monospace')
        .attr('font-weight', '600')
        .text(hub.name)

      // Hover interaction
      group.on('mouseenter', (event) => {
        setActiveHub(hub)
        setTooltipPos({ x: event.offsetX, y: event.offsetY })
        d3.select(group.node())
          .select('circle:first-child')
          .transition()
          .duration(200)
          .attr('r', 14)
          .attr('fill-opacity', 0.15)
      })
      group.on('mouseleave', () => {
        setActiveHub(null)
        d3.select(group.node())
          .select('circle:first-child')
          .transition()
          .duration(200)
          .attr('r', 8)
          .attr('fill-opacity', 0.08)
      })
    })

  }, [hubs, t])

  return (
    <div className="relative w-full h-full bg-[#0A0A0A]">
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
      />
      {/* Top-left live indicator */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
        <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/40 font-[family-name:var(--font-space-mono)]">{t('live')}</span>
      </div>
      {activeHub && (
        <div
          className="absolute pointer-events-none z-10 card p-4"
          style={{
            left: Math.min(tooltipPos.x + 20, 600),
            top: tooltipPos.y - 60,
            transition: 'all 0.15s ease-out',
          }}
        >
          <p className="text-[13px] font-bold text-white">
            {activeHub.name}
          </p>
          <p className="text-[11px] text-[#666666] mt-0.5">{activeHub.country} — {activeHub.type}</p>
          <div className="flex gap-4 mt-2">
            <div>
              <p className="text-lg font-bold text-white stat-mono">{activeHub.sensors.toLocaleString()}</p>
              <p className="text-[9px] text-[#666666] uppercase tracking-wider">{t('iotSensors')}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white stat-mono">{activeHub.hectares.toLocaleString()}</p>
              <p className="text-[9px] text-[#666666] uppercase tracking-wider">{t('hectares')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
