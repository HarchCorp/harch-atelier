'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface MapLocation {
  name: string;
  vertical: string;
  stat: string;
  cx: number;
  cy: number;
  delay: string;
}

export function WorldMap() {
  const t = useTranslations('worldMap');
  const [hovered, setHovered] = useState<string | null>(null);

  const locations: MapLocation[] = [
    { name: t('locations.casablanca.name'), vertical: t('locations.casablanca.vertical'), stat: t('locations.casablanca.stat'), cx: 295, cy: 140, delay: 'blink-dot-delay-0' },
    { name: t('locations.dakhla.name'), vertical: t('locations.dakhla.vertical'), stat: t('locations.dakhla.stat'), cx: 260, cy: 215, delay: 'blink-dot-delay-1' },
    { name: t('locations.gambia.name'), vertical: t('locations.gambia.vertical'), stat: t('locations.gambia.stat'), cx: 290, cy: 175, delay: 'blink-dot-delay-2' },
    { name: t('locations.sahel.name'), vertical: t('locations.sahel.vertical'), stat: t('locations.sahel.stat'), cx: 340, cy: 165, delay: 'blink-dot-delay-3' },
    { name: t('locations.mauritania.name'), vertical: t('locations.mauritania.vertical'), stat: t('locations.mauritania.stat'), cx: 275, cy: 155, delay: 'blink-dot-delay-4' },
    { name: t('locations.senegal.name'), vertical: t('locations.senegal.vertical'), stat: t('locations.senegal.stat'), cx: 285, cy: 178, delay: 'blink-dot-delay-5' },
    { name: t('locations.mali.name'), vertical: t('locations.mali.vertical'), stat: t('locations.mali.stat'), cx: 310, cy: 180, delay: 'blink-dot-delay-6' },
  ];

  return (
    <div className="map-container">
      <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* Africa outline - simplified */}
        <path
          d="M280,80 L310,75 L340,85 L360,100 L370,120 L380,140 L375,160 L380,180 L385,200 L390,220 L385,240 L375,260 L360,280 L345,300 L330,320 L310,335 L290,340 L270,335 L255,320 L240,300 L230,280 L225,260 L220,240 L225,220 L230,200 L235,180 L240,160 L245,140 L250,120 L260,100 L270,85 Z"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />

        {/* Morocco region */}
        <path
          d="M250,80 L280,75 L300,85 L310,100 L305,115 L290,125 L270,130 L255,120 L248,105 Z"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />

        {/* West Africa region */}
        <path
          d="M260,130 L300,125 L330,135 L345,155 L340,175 L320,185 L290,180 L270,170 L258,155 Z"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.5"
        />

        {/* Grid lines for style */}
        {[100, 150, 200, 250, 300, 350].map((y) => (
          <line key={`h-${y}`} x1="200" y1={y} x2="420" y2={y} stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
        ))}
        {[250, 300, 350, 400].map((x) => (
          <line key={`v-${x}`} x1={x} y1="60" x2={x} y2="380" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
        ))}

        {/* Location dots */}
        {locations.map((loc) => (
          <g
            key={loc.name}
            onMouseEnter={() => setHovered(loc.name)}
            onMouseLeave={() => setHovered(null)}
            className="cursor-pointer"
          >
            {/* Pulse ring */}
            <circle
              cx={loc.cx}
              cy={loc.cy}
              r="8"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="0.5"
              opacity="0.3"
              className={`blink-dot ${loc.delay}`}
            />

            {/* Main dot */}
            <circle
              cx={loc.cx}
              cy={loc.cy}
              r="3"
              fill="#FFFFFF"
              opacity="0.8"
            />

            {/* Inner bright dot */}
            <circle
              cx={loc.cx}
              cy={loc.cy}
              r="1.5"
              fill="#FFFFFF"
            />

            {/* Tooltip */}
            {hovered === loc.name && (
              <g>
                <rect
                  x={loc.cx + 12}
                  y={loc.cy - 24}
                  width="140"
                  height="40"
                  rx="4"
                  fill="#1E1E1E"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="0.5"
                  filter="url(#shadow)"
                />
                <text
                  x={loc.cx + 20}
                  y={loc.cy - 10}
                  fontSize="8"
                  fontWeight="700"
                  fill="#FFFFFF"
                  letterSpacing="0.1em"
                >
                  {loc.vertical.toUpperCase()}
                </text>
                <text
                  x={loc.cx + 20}
                  y={loc.cy + 4}
                  fontSize="7"
                  fill="#999999"
                >
                  {loc.name}
                </text>
                <text
                  x={loc.cx + 20}
                  y={loc.cy + 14}
                  fontSize="6"
                  fill="#666666"
                >
                  {loc.stat}
                </text>
              </g>
            )}
          </g>
        ))}

        {/* Shadow filter */}
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Label: Africa */}
        <text x="350" y="260" fontSize="36" fontWeight="800" fill="rgba(255,255,255,0.03)" letterSpacing="0.1em">
          {t('africa')}
        </text>
      </svg>
    </div>
  );
}
