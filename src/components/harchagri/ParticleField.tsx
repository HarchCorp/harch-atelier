'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
  maxLife: number
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()

    const particles: Particle[] = []
    const maxParticles = 50

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.offsetWidth,
      y: canvas.offsetHeight + 10,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.8 - 0.3,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
      life: 0,
      maxLife: 300 + Math.random() * 300,
    })

    for (let i = 0; i < maxParticles; i++) {
      const p = createParticle()
      p.y = Math.random() * canvas.offsetHeight
      p.life = Math.random() * p.maxLife
      particles.push(p)
    }

    let animId: number

    const animate = () => {
      animId = requestAnimationFrame(animate)
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.life++

        const lifeRatio = p.life / p.maxLife
        const alpha = p.opacity * (1 - lifeRatio)

        if (p.life >= p.maxLife) {
          particles[i] = createParticle()
          return
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fill()

        // Subtle trail
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - p.vx * 4, p.y - p.vy * 4)
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`
        ctx.lineWidth = p.size * 0.4
        ctx.stroke()
      })

      // Draw connections between nearby particles — white/muted
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.04
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    animate()

    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
