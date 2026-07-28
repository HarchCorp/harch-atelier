'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 30

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Particle system — subtle white/muted nodes
    const particleCount = 2000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    // Muted white palette
    const whiteColor = new THREE.Color('#FFFFFF')
    const grayColor = new THREE.Color('#999999')
    const dimColor = new THREE.Color('#666666')
    const colorPalette = [whiteColor, grayColor, dimColor, whiteColor]

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      // Distribute in a sphere shape
      const radius = 15 + Math.random() * 15
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      sizes[i] = Math.random() * 2 + 0.5
    }

    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)

    // Connection lines between nearby particles — white/muted
    const linePositions: number[] = []
    const lineColors: number[] = []
    const posArray = particleGeometry.attributes.position.array

    for (let i = 0; i < Math.min(200, particleCount); i++) {
      for (let j = i + 1; j < Math.min(200, particleCount); j++) {
        const dx = posArray[i * 3] - posArray[j * 3]
        const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1]
        const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (dist < 4) {
          linePositions.push(posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2])
          linePositions.push(posArray[j * 3], posArray[j * 3 + 1], posArray[j * 3 + 2])
          lineColors.push(0.6, 0.6, 0.6, 0.4, 0.4, 0.4)
        }
      }
    }

    if (linePositions.length > 0) {
      const lineGeometry = new THREE.BufferGeometry()
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
      lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3))
      const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
      })
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
      scene.add(lines)
    }

    // Ring — white/muted style
    const ringGeometry = new THREE.TorusGeometry(12, 0.02, 16, 100)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.12,
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = Math.PI / 2
    scene.add(ring)

    // Inner ring
    const innerRingGeometry = new THREE.TorusGeometry(8, 0.015, 16, 100)
    const innerRingMaterial = new THREE.MeshBasicMaterial({
      color: 0x999999,
      transparent: true,
      opacity: 0.08,
    })
    const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial)
    innerRing.rotation.x = Math.PI / 2
    scene.add(innerRing)

    // Hub markers — 5 HarchAgri hubs (white dots)
    const hubLocations = [
      { name: 'Morocco', lat: 31.79, lon: -7.09 },
      { name: 'Senegal', lat: 14.49, lon: -14.45 },
      { name: 'Kenya', lat: -0.02, lon: 37.91 },
      { name: 'Ghana', lat: 7.95, lon: -1.02 },
      { name: 'Nigeria', lat: 9.08, lon: 8.68 },
    ]

    const hubMarkers: THREE.Mesh[] = []
    hubLocations.forEach((hub) => {
      const markerGeom = new THREE.SphereGeometry(0.2, 16, 16)
      const markerMat = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.6,
      })
      const marker = new THREE.Mesh(markerGeom, markerMat)

      // Position on the ring
      const angle = ((hub.lon + 180) / 360) * Math.PI * 2
      marker.position.x = Math.cos(angle) * 12
      marker.position.z = Math.sin(angle) * 12
      marker.position.y = (hub.lat / 90) * 6

      hubMarkers.push(marker)
      scene.add(marker)
    })

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Animation
    let animationId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Rotate particles
      particles.rotation.y = elapsed * 0.05 + mouseRef.current.x * 0.3
      particles.rotation.x = Math.sin(elapsed * 0.02) * 0.1 + mouseRef.current.y * 0.2

      // Pulse the rings
      ring.rotation.z = elapsed * 0.1
      ring.material.opacity = 0.08 + Math.sin(elapsed) * 0.04

      innerRing.rotation.z = -elapsed * 0.15
      innerRing.material.opacity = 0.06 + Math.sin(elapsed * 1.5) * 0.02

      // Hub marker pulsing
      hubMarkers.forEach((marker, i) => {
        const scale = 1 + Math.sin(elapsed * 2 + i * 1.2) * 0.3
        marker.scale.set(scale, scale, scale)
      })

      // Animate particle positions slightly
      const posAttr = particleGeometry.attributes.position
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        posAttr.array[i3 + 1] += Math.sin(elapsed + i * 0.01) * 0.001
      }
      posAttr.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: 'auto' }}
    />
  )
}
