'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Server,
  Factory,
  Zap,
  Cpu,
  Mountain,
  Wheat,
  Droplets,
  Landmark,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OntologyNode {
  id: string;
  label: string;
  x: number;
  y: number;
  icon?: React.ElementType;
  accent?: string;
}

interface OntologyConnection {
  from: string;
  to: string;
}

interface NetworkOntologyProps {
  nodes?: OntologyNode[];
  connections?: OntologyConnection[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  Server,
  Factory,
  Zap,
  Cpu,
  Mountain,
  Wheat,
  Droplets,
  Landmark,
};

const DEFAULT_NODES: OntologyNode[] = (() => {
  const cx = 400;
  const cy = 300;
  const radius = 200;

  // These will be overridden at render time with translations
  const verticals = [
    { id: 'intelligence', label: 'Intelligence', icon: 'Server', accent: '#8B9DAF' },
    { id: 'cement', label: 'Cement', icon: 'Factory', accent: '#8B9DAF' },
    { id: 'energy', label: 'Energy', icon: 'Zap', accent: '#4A7B5F' },
    { id: 'technology', label: 'Technology', icon: 'Cpu', accent: '#7888A8' },
    { id: 'mining', label: 'Mining', icon: 'Mountain', accent: '#A87878' },
    { id: 'agri', label: 'Agri', icon: 'Wheat', accent: '#6BAF6B' },
    { id: 'water', label: 'Water', icon: 'Droplets', accent: '#6888A8' },
    { id: 'finance', label: 'Finance', icon: 'Landmark', accent: '#8B9DAF' },
  ];

  const surrounding = verticals.map((v, i) => {
    const angle = (i * 45 - 90) * (Math.PI / 180);
    return {
      id: v.id,
      label: v.label,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      icon: ICON_MAP[v.icon],
      accent: v.accent,
    };
  });

  return [
    {
      id: 'core',
      label: 'HARCH CORP',
      x: cx,
      y: cy,
      accent: '#8B9DAF',
    },
    ...surrounding,
  ];
})();

const DEFAULT_CONNECTIONS: OntologyConnection[] = [
  { from: 'core', to: 'intelligence' },
  { from: 'core', to: 'cement' },
  { from: 'core', to: 'energy' },
  { from: 'core', to: 'technology' },
  { from: 'core', to: 'mining' },
  { from: 'core', to: 'agri' },
  { from: 'core', to: 'water' },
  { from: 'core', to: 'finance' },
  // Cross-connections
  { from: 'energy', to: 'intelligence' },
  { from: 'mining', to: 'cement' },
  { from: 'water', to: 'agri' },
  { from: 'finance', to: 'intelligence' },
  { from: 'finance', to: 'energy' },
  { from: 'finance', to: 'mining' },
  { from: 'finance', to: 'agri' },
];

export default function NetworkOntology({
  nodes = DEFAULT_NODES,
  connections = DEFAULT_CONNECTIONS,
}: NetworkOntologyProps) {
  const t = useTranslations('networkOntology');
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleHoverStart = useCallback((id: string) => setHoveredId(id), []);
  const handleHoverEnd = useCallback(() => setHoveredId(null), []);

  // Resolve icon components and translate labels
  const resolvedNodes = nodes.map((n) => ({
    ...n,
    label: n.id === 'core'
      ? t('harchCorp')
      : t(`verticals.${n.id}` as any),
    IconComponent: n.icon || ICON_MAP[n.label] || null,
  }));

  // Determine which connections are "highlighted" when a node is hovered
  const isConnectionHighlighted = (from: string, to: string) => {
    if (!hoveredId) return false;
    return from === hoveredId || to === hoveredId;
  };

  // Determine if a node is "dimmed" when another is hovered
  const isNodeDimmed = (nodeId: string) => {
    if (!hoveredId) return false;
    if (nodeId === hoveredId) return false;
    // Check if connected to hovered
    const connected = connections.some(
      (c) =>
        (c.from === hoveredId && c.to === nodeId) ||
        (c.to === hoveredId && c.from === nodeId)
    );
    return !connected;
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden"
    >
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-[0.2em] text-white/25">
            {t('networkOntology')}
          </span>
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.04)]" />
          <span className="font-[family-name:var(--font-space-mono)] text-[9px] uppercase tracking-[0.15em] text-white/15">
            {t('eightVerticals')}
          </span>
        </div>

        {/* SVG Graph */}
        <div className="w-full aspect-[4/3] max-h-[600px] mx-auto">
          <svg
            viewBox="0 0 800 600"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label={t('ariaLabel')}
          >
            <defs>
              {/* Glow filter for hovered nodes */}
              <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Pulse rings for center */}
              <radialGradient id="center-pulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8B9DAF" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#8B9DAF" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Connection lines */}
            {connections.map((conn, i) => {
              const fromNode = resolvedNodes.find((n) => n.id === conn.from);
              const toNode = resolvedNodes.find((n) => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const highlighted = isConnectionHighlighted(conn.from, conn.to);
              const baseOpacity = hoveredId ? (highlighted ? 0.5 : 0.06) : 0.12;

              return (
                <motion.line
                  key={`conn-${conn.from}-${conn.to}`}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#8B9DAF"
                  strokeWidth={highlighted ? 1.2 : 0.5}
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={
                    isInView
                      ? {
                          pathLength: 1,
                          opacity: baseOpacity,
                        }
                      : { pathLength: 0, opacity: 0 }
                  }
                  transition={{
                    pathLength: { duration: 1.5, delay: 0.3 + i * 0.05, ease: 'easeOut' },
                    opacity: { duration: 0.5, delay: 0.3 + i * 0.05 },
                  }}
                />
              );
            })}

            {/* Center pulse rings */}
            {resolvedNodes
              .filter((n) => n.id === 'core')
              .map((node) => (
                <g key={`pulse-${node.id}`}>
                  {[60, 45, 30].map((r, i) => (
                    <motion.circle
                      key={`ring-${r}`}
                      cx={node.x}
                      cy={node.y}
                      r={r}
                      fill="none"
                      stroke="#8B9DAF"
                      strokeWidth="0.3"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={
                        isInView
                          ? {
                              opacity: 0.06 - i * 0.015,
                              scale: [1, 1.05, 1],
                            }
                          : { opacity: 0, scale: 0.8 }
                      }
                      transition={{
                        opacity: { duration: 1, delay: 1 + i * 0.2 },
                        scale: {
                          duration: 4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: i * 0.5,
                        },
                      }}
                    />
                  ))}
                </g>
              ))}

            {/* Nodes */}
            {resolvedNodes.map((node, i) => {
              const isCenter = node.id === 'core';
              const nodeRadius = isCenter ? 32 : 24;
              const dimmed = isNodeDimmed(node.id);
              const isHovered = hoveredId === node.id;
              const opacity = dimmed ? 0.2 : 1;

              return (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={
                    isInView
                      ? { opacity, y: [0, -3, 0] }
                      : { opacity: 0, y: 10 }
                  }
                  transition={{
                    opacity: { duration: 0.3 },
                    y: {
                      duration: 5 + i * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.3,
                    },
                  }}
                  onPointerEnter={() => handleHoverStart(node.id)}
                  onPointerLeave={handleHoverEnd}
                  style={{ cursor: 'pointer' }}
                  filter={isHovered ? 'url(#node-glow)' : undefined}
                >
                  {/* Node circle */}
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius}
                    fill={isCenter ? '#0D0D0D' : '#0A0A0A'}
                    stroke={node.accent || '#8B9DAF'}
                    strokeWidth={isCenter ? 2 : 1}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={
                      isInView
                        ? {
                            opacity: 1,
                            scale: 1,
                          }
                        : { opacity: 0, scale: 0 }
                    }
                    transition={{
                      duration: 0.6,
                      delay: 0.8 + i * 0.08,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  />

                  {/* Node icon or letter */}
                  {isCenter ? (
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#8B9DAF"
                      fontSize="8"
                      fontWeight="700"
                      letterSpacing="0.1em"
                      fontFamily="var(--font-space-mono), monospace"
                    >
                      HARCH
                    </text>
                  ) : (
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={node.accent || '#8B9DAF'}
                      fontSize="14"
                      fontWeight="600"
                      fontFamily="var(--font-space-mono), monospace"
                    >
                      {node.label.charAt(0)}
                    </text>
                  )}

                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y + nodeRadius + 14}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.5)"
                    fontSize={isCenter ? '9' : '8'}
                    fontWeight={isCenter ? '700' : '500'}
                    letterSpacing={isCenter ? '0.12em' : '0.05em'}
                    fontFamily="var(--font-space-mono), monospace"
                  >
                    {node.label}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
