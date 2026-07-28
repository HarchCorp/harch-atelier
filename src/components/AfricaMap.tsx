'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

/* ═══════════════════════════════════════════════════════════════
   COORDINATE PROJECTION
   ViewBox: 0 0 800 900
   Longitude -20 → 60  maps to x: 0 → 800
   Latitude  40 → -40 maps to y: 0 → 900  (inverted so north is up)
   This gives a simple equirectangular projection centred on Africa.
   ═══════════════════════════════════════════════════════════════ */

const VW = 800;
const VH = 900;

function geo(lat: number, lon: number): [number, number] {
  const x = ((lon + 20) / 80) * VW;
  const y = ((40 - lat) / 80) * VH;
  return [+(x.toFixed(1)), +(y.toFixed(1))];
}

/* ═══════════════════════════════════════════════════════════════
   AFRICA OUTLINE — [lon, lat] pairs, clockwise from Gibraltar
   Simplified but recognisable: key features preserved —
   West-African bulge, Horn of Africa, Cape, Gulf of Guinea.
   ═══════════════════════════════════════════════════════════════ */

const AFRICA: [number, number][] = [
  // ── NW coast (Morocco → Western Sahara) ──
  [-5.8, 35.8], [-6.5, 34], [-8, 33], [-10, 31.5],
  [-13, 28], [-16, 24], [-17, 21], [-17.1, 18],
  [-17, 15], [-16.7, 13.5],
  // ── Upper Guinea (Senegal → Sierra Leone) ──
  [-16.5, 12], [-15, 10.5], [-14, 9], [-12.5, 7.5],
  [-10.5, 6], [-8, 5], [-5, 4.5],
  // ── Lower Guinea / Gulf of Guinea (Ghana → Cameroon) ──
  [-2, 5], [0, 5.5], [2.5, 6], [4, 4.5],
  [7, 4.5], [9.5, 3.5], [10, 2], [9.5, 0.5],
  // ── SW coast (Gabon → Namibia) ──
  [10, -2], [12, -5], [12, -8],
  [12.5, -12], [13, -17], [12, -22],
  // ── South Africa ──
  [15, -28], [17, -32], [18, -34],
  [18.5, -34.8], [20, -35], [22, -34.5],
  [25, -33], [27, -32], [28, -31],
  // ── SE coast (Mozambique → Kenya) ──
  [30, -29], [32, -27], [35, -23],
  [38, -17], [40, -13], [40, -8],
  [42, -4], [44, -1], [45.5, 1],
  // ── Horn of Africa (Somalia) ──
  [48, 3], [50, 5], [51.5, 8],
  [51.5, 11], [50, 12], [48, 11],
  [46, 10.5], [44, 10], [43, 11.5],
  // ── Red Sea coast (Djibouti → Egypt) ──
  [43, 14], [42, 15.5], [40, 18],
  [37, 20], [35, 22],
  [33, 24], [32.5, 27], [32, 30],
  [34, 31.5], [30, 31],
  // ── Mediterranean coast (Libya → Morocco) ──
  [25, 32], [20, 32.5], [15, 33],
  [12, 34], [10, 34.5], [8, 37],
  [7, 37.5], [2, 36.5], [-2, 35.5],
  [-5, 35],
];

const MADAGASCAR: [number, number][] = [
  [44, -12.5], [47, -14], [49, -16], [50, -20],
  [49, -24], [47, -25.5], [44, -24],
  [43, -20], [43.5, -16],
];

/* Iberian Peninsula hint — just the southern tip for context near Gibraltar */
const IBERIA: [number, number][] = [
  [-9.5, 37], [-7, 37.5], [-6.5, 36.8], [-6, 36.2], [-5.6, 36],
  [-7, 37], [-8.5, 37.5], [-9.5, 38],
];

function toPath(coords: [number, number][]): string {
  return (
    coords
      .map((c, i) => {
        const [x, y] = geo(c[1], c[0]); // c[0]=lon, c[1]=lat
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ') + ' Z'
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOCATIONS — real lat/lon, projected at render time
   ═══════════════════════════════════════════════════════════════ */

interface MapLocation {
  id: string;
  name: string;
  vertical: string;
  version: string;
  stat: string;
  desc: string;
  lat: number;
  lon: number;
  status: 'active' | 'engineering' | 'permitted' | 'design';
  /** SVG label offsets so nearby names don't overlap */
  labelDx: number;
  labelDy: number;
}

const locations: MapLocation[] = [
  {
    id: 'casa', name: 'Casablanca', vertical: 'HQ', version: '/0.0',
    stat: '', desc: '',
    lat: 33.57, lon: -7.59, status: 'active',
    labelDx: 16, labelDy: -4,
  },
  {
    id: 'dakhla', name: 'Dakhla', vertical: 'Intelligence', version: '/0.1',
    stat: '', desc: '',
    lat: 23.68, lon: -15.96, status: 'engineering',
    labelDx: 16, labelDy: 5,
  },
  {
    id: 'banjul', name: 'Banjul', vertical: 'Cement', version: '/0.2',
    stat: '', desc: '',
    lat: 13.45, lon: -16.57, status: 'permitted',
    labelDx: 16, labelDy: 12,
  },
  {
    id: 'nouakchott', name: 'Nouakchott', vertical: 'Mining', version: '/0.5',
    stat: '', desc: '',
    lat: 18.07, lon: -15.98, status: 'engineering',
    labelDx: 16, labelDy: -4,
  },
  {
    id: 'dakar', name: 'Dakar', vertical: 'Agri', version: '/0.6',
    stat: '', desc: '',
    lat: 14.69, lon: -17.44, status: 'design',
    labelDx: 16, labelDy: -6,
  },
  {
    id: 'bamako', name: 'Bamako', vertical: 'Water', version: '/0.7',
    stat: '', desc: '',
    lat: 12.64, lon: -8.00, status: 'design',
    labelDx: 16, labelDy: 5,
  },
  {
    id: 'sahel', name: 'Sahel', vertical: 'Energy', version: '/0.3',
    stat: '', desc: '',
    lat: 15.0, lon: 0, status: 'active',
    labelDx: 16, labelDy: 5,
  },
];

const connections = [
  { from: 'casa', to: 'dakhla', label: '' },
  { from: 'casa', to: 'banjul', label: '' },
  { from: 'casa', to: 'sahel', label: '' },
  { from: 'dakhla', to: 'nouakchott', label: '' },
  { from: 'banjul', to: 'dakar', label: '' },
  { from: 'sahel', to: 'bamako', label: '' },
];

function getLoc(id: string) {
  return locations.find((l) => l.id === id)!;
}

const STATUS_COLORS: Record<string, string> = {
  active: '#4A7B5F',
  engineering: '#8B9DAF',
  permitted: '#999999',
  design: '#666666',
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function AfricaMap() {
  const t = useTranslations('africaMap');
  const [hovered, setHovered] = useState<string | null>(null);

  /* Pre-compute paths and positions so we don't recalc on every render */
  const africaPath = useMemo(() => toPath(AFRICA), []);
  const madagascarPath = useMemo(() => toPath(MADAGASCAR), []);
  const iberiaPath = useMemo(() => toPath(IBERIA), []);

  const locPos = useMemo(() => {
    const m = new Map<string, [number, number]>();
    locations.forEach((l) => m.set(l.id, geo(l.lat, l.lon)));
    return m;
  }, []);

  return (
    <div className="relative w-full max-w-[680px] mx-auto">
      {/* ── Header ── */}
      <motion.div
        className="flex items-center justify-between mb-4 px-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-[rgba(139,157,175,0.3)]" />
            <div className="w-2 h-2 rounded-full bg-[rgba(139,157,175,0.2)]" />
            <div className="w-2 h-2 rounded-full bg-[rgba(139,157,175,0.1)]" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[rgba(255,255,255,0.25)] font-[family-name:var(--font-space-mono)]">
            {t('deploymentsRealTime')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4A7B5F] opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A7B5F]" style={{ boxShadow: '0 0 6px rgba(74,123,95,0.7)' }} />
          </span>
          <span className="text-[9px] text-[rgba(255,255,255,0.5)] font-[family-name:var(--font-space-mono)]">
            {t('liveActive', { count: locations.filter((l) => l.status === 'active').length })}
          </span>
        </div>
      </motion.div>

      {/* ── Map Container ── */}
      <motion.div
        className="relative rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#0D0D0D] overflow-hidden"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="relative w-full" style={{ aspectRatio: '800 / 550' }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={`0 0 ${VW} ${VH}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <radialGradient id="africaFill" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="rgba(139,157,175,0.08)" />
                <stop offset="100%" stopColor="rgba(139,157,175,0.02)" />
              </radialGradient>
              <radialGradient id="opsGlow" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="rgba(74,123,95,0.07)" />
                <stop offset="100%" stopColor="rgba(74,123,95,0)" />
              </radialGradient>
            </defs>

            {/* ── Subtle grid lines ── */}
            {Array.from({ length: 19 }, (_, i) => (
              <line
                key={`gh-${i}`}
                x1="0" y1={i * 50} x2={VW} y2={i * 50}
                stroke="rgba(255,255,255,0.018)" strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: 17 }, (_, i) => (
              <line
                key={`gv-${i}`}
                x1={i * 50} y1="0" x2={i * 50} y2={VH}
                stroke="rgba(255,255,255,0.018)" strokeWidth="0.5"
              />
            ))}

            {/* ── Operations-area glow (NW Africa) ── */}
            <rect x="0" y="50" width="280" height="300" fill="url(#opsGlow)" />

            {/* ── Iberian Peninsula hint ── */}
            <path
              d={iberiaPath}
              fill="rgba(139,157,175,0.03)"
              stroke="rgba(139,157,175,0.06)"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />

            {/* ── Africa continent outline ── */}
            <motion.path
              d={africaPath}
              fill="url(#africaFill)"
              stroke="rgba(139,157,175,0.18)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
            />

            {/* ── Madagascar ── */}
            <motion.path
              d={madagascarPath}
              fill="url(#africaFill)"
              stroke="rgba(139,157,175,0.12)"
              strokeWidth="1"
              strokeLinejoin="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
            />

            {/* ── Connection lines ── */}
            {connections.map((conn, i) => {
              const from = locPos.get(conn.from)!;
              const to = locPos.get(conn.to)!;
              const midX = (from[0] + to[0]) / 2;
              const midY = (from[1] + to[1]) / 2 - 18;
              const isHighlighted = hovered === conn.from || hovered === conn.to;
              const pathD = `M${from[0]},${from[1]} Q${midX},${midY} ${to[0]},${to[1]}`;

              return (
                <motion.g
                  key={`conn-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 + i * 0.08 }}
                >
                  {/* Base dashed line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHighlighted ? 'rgba(139,157,175,0.4)' : 'rgba(139,157,175,0.1)'}
                    strokeWidth={isHighlighted ? 1.5 : 0.8}
                    strokeDasharray="4,6"
                    className="transition-all duration-500"
                  />
                  {/* Animated data packets on hover */}
                  {isHighlighted && (
                    <>
                      <circle r="2.5" fill="#8B9DAF" opacity="0.85" filter="url(#dot-glow)">
                        <animateMotion dur="3s" repeatCount="indefinite" path={pathD} />
                      </circle>
                      <circle r="1.5" fill="#FFFFFF" opacity="0.5">
                        <animateMotion dur="3s" repeatCount="indefinite" path={pathD} begin="1.5s" />
                      </circle>
                    </>
                  )}
                </motion.g>
              );
            })}

            {/* ── Location dots ── */}
            {locations.map((loc, idx) => {
              const [x, y] = locPos.get(loc.id)!;
              const isHovered = hovered === loc.id;
              const color = STATUS_COLORS[loc.status];

              return (
                <motion.g
                  key={loc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + idx * 0.08 }}
                  onMouseEnter={() => setHovered(loc.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                >
                  {/* Pulse ring 1 */}
                  <circle cx={x} cy={y} r="6" fill="none" stroke={color} strokeWidth="1" opacity="0">
                    <animate attributeName="r" values="6;30;6" dur="2.5s" repeatCount="indefinite" begin={`${idx * 0.35}s`} />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" begin={`${idx * 0.35}s`} />
                    <animate attributeName="stroke-width" values="1;0.2;1" dur="2.5s" repeatCount="indefinite" begin={`${idx * 0.35}s`} />
                  </circle>

                  {/* Pulse ring 2 */}
                  <circle cx={x} cy={y} r="6" fill="none" stroke={color} strokeWidth="0.6" opacity="0">
                    <animate attributeName="r" values="6;22;6" dur="2.5s" repeatCount="indefinite" begin={`${idx * 0.35 + 0.8}s`} />
                    <animate attributeName="opacity" values="0.25;0;0.25" dur="2.5s" repeatCount="indefinite" begin={`${idx * 0.35 + 0.8}s`} />
                  </circle>

                  {/* Main dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 7 : 5}
                    fill={color}
                    opacity={isHovered ? 1 : 0.85}
                    filter="url(#dot-glow)"
                    className="transition-all duration-300"
                  />

                  {/* Inner bright core */}
                  <circle
                    cx={x}
                    cy={y}
                    r="1.8"
                    fill="#FFFFFF"
                    opacity={isHovered ? 1 : 0.8}
                    className="transition-opacity duration-300"
                  />

                  {/* Name label */}
                  <text
                    x={x + loc.labelDx}
                    y={y + loc.labelDy}
                    fontSize="11"
                    fontWeight="600"
                    fill={isHovered ? '#8B9DAF' : 'rgba(255,255,255,0.5)'}
                    letterSpacing="0.08em"
                    className="transition-all duration-300 font-[family-name:var(--font-space-mono)]"
                  >
                    {t(`locations.${loc.id}.name`).toUpperCase()}
                  </text>
                </motion.g>
              );
            })}
          </svg>

          {/* ── HTML Tooltip overlays (positioned as % over SVG) ── */}
          <AnimatePresence>
            {hovered &&
              (() => {
                const loc = getLoc(hovered);
                const locName = t(`locations.${loc.id}.name`);
                const locVertical = t(`locations.${loc.id}.vertical`);
                const locStat = t(`locations.${loc.id}.stat`);
                const locDesc = t(`locations.${loc.id}.desc`);
                const [x, y] = locPos.get(loc.id)!;
                const color = STATUS_COLORS[loc.status];
                const leftPct = (x / VW) * 100;
                const topPct = (y / VH) * 100;
                const flipLeft = leftPct > 50;

                return (
                  <motion.div
                    key={`tooltip-${loc.id}`}
                    initial={{ opacity: 0, scale: 0.92, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -6 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute z-20 pointer-events-none"
                    style={{
                      left: flipLeft ? `${leftPct - 25}%` : `${leftPct + 4}%`,
                      top: `${topPct - 2}%`,
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <div className="bg-[#0D0D0D]/95 backdrop-blur-md border border-[rgba(139,157,175,0.2)] rounded-lg p-3 sm:p-4 min-w-[160px] sm:min-w-[200px] max-w-[220px] sm:max-w-[260px] shadow-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
                        />
                        <span
                          className="text-[10px] font-bold tracking-[0.15em] uppercase font-[family-name:var(--font-space-mono)]"
                          style={{ color }}
                        >
                          {locVertical} {loc.version}
                        </span>
                      </div>
                      <p className="text-[13px] font-semibold text-white mb-1">{locStat}</p>
                      <p className="text-[11px] text-[rgba(255,255,255,0.5)] leading-relaxed">
                        {locDesc}
                      </p>
                    </div>
                  </motion.div>
                );
              })()}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Legend ── */}
      <motion.div
        className="flex items-center justify-center gap-6 mt-4 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
      >
        {[
          { color: '#4A7B5F', label: t('legend.active'), key: 'active' },
          { color: '#8B9DAF', label: t('legend.engineering'), key: 'engineering' },
          { color: '#999999', label: t('legend.permitted'), key: 'permitted' },
          { color: '#666666', label: t('legend.design'), key: 'design' },
        ].map(({ color, label, key }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}60` }}
            />
            <span className="text-[9px] text-[rgba(255,255,255,0.25)] font-[family-name:var(--font-space-mono)]">
              {label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
