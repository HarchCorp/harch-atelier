'use client';

import { useRef, useEffect, useState } from 'react';

interface MarqueeProps {
  items: string[];
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
}

export function Marquee({ items, speed = 30, direction = 'left', className = '' }: MarqueeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const doubled = [...items, ...items, ...items, ...items];

  const animDirection = direction === 'left' ? 'normal' : 'reverse';

  return (
    <div
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={scrollerRef}
        className="flex gap-8 whitespace-nowrap"
        style={{
          animation: `marquee-scroll ${speed}s linear infinite`,
          animationDirection: animDirection as 'normal' | 'reverse',
          animationPlayState: isHovered ? 'paused' : 'running',
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="text-[14px] font-semibold text-[#8B9DAF]/40 uppercase tracking-[0.15em] font-[family-name:var(--font-space-mono)] px-4"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
