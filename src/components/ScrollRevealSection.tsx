'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';

type ScrollVariant = 'diagonal-left' | 'diagonal-right' | 'chevron' | 'inset';

interface ScrollRevealSectionProps {
  imageSrc: string;
  imageAlt: string;
  heading: string;
  description: string;
  variant?: ScrollVariant;
}

const CLIP_CONFIGS: Record<
  ScrollVariant,
  { initial: number[]; final: number[]; type: 'polygon' | 'inset' }
> = {
  'diagonal-left': {
    type: 'polygon',
    initial: [55, 0, 77, 0, 45, 100, 25, 100],
    final: [0, 0, 100, 0, 100, 100, 0, 100],
  },
  'diagonal-right': {
    type: 'polygon',
    initial: [23, 0, 45, 0, 75, 100, 55, 100],
    final: [0, 0, 100, 0, 100, 100, 0, 100],
  },
  chevron: {
    type: 'polygon',
    initial: [100, 30, 100, 50, 50, 70, 0, 50, 0, 30, 50, 50],
    final: [0, 0, 100, 0, 100, 100, 0, 100, 0, 0, 100, 0],
  },
  inset: {
    type: 'inset',
    initial: [10, 22, 75, 21], // top right bottom left
    final: [0, 0, 0, 0],
  },
};

function interpolateValues(from: number[], to: number[], t: number): number[] {
  return from.map((v, i) => v + (to[i] - v) * t);
}

export default function ScrollRevealSection({
  imageSrc,
  imageAlt,
  heading,
  description,
  variant = 'diagonal-left',
}: ScrollRevealSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const [progress, setProgress] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    // Map scroll range [0.15, 0.55] to progress [0, 1]
    const mapped = Math.max(0, Math.min(1, (v - 0.15) / 0.4));
    setProgress(mapped);
  });

  const config = CLIP_CONFIGS[variant];
  const isTextRight =
    variant === 'diagonal-left' || variant === 'chevron';

  // Compute clip-path string
  let clipPath: string;
  if (config.type === 'polygon') {
    const vals = interpolateValues(config.initial, config.final, progress);
    const points: string[] = [];
    for (let i = 0; i < vals.length; i += 2) {
      points.push(`${vals[i]}% ${vals[i + 1]}%`);
    }
    clipPath = `polygon(${points.join(', ')})`;
  } else {
    const vals = interpolateValues(config.initial, config.final, progress);
    clipPath = `inset(${vals[0]}% ${vals[1]}% ${vals[2]}% ${vals[3]}%)`;
  }

  // Text opacity and y based on progress
  const textOpacity = Math.max(0, Math.min(1, (progress - 0.1) / 0.6));
  const textY = (1 - textOpacity) * 30;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[60vh] flex items-center bg-[#0A0A0A] overflow-hidden"
    >
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Image side */}
          <div className={`${isTextRight ? 'lg:order-1' : 'lg:order-2'}`}>
            <div
              className="relative w-full aspect-[4/3] overflow-hidden rounded-xl"
              style={{ clipPath, WebkitClipPath: clipPath, transition: 'clip-path 0.05s linear' }}
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />
            </div>
          </div>

          {/* Text side */}
          <div
            className={`${isTextRight ? 'lg:order-2' : 'lg:order-1'}`}
            style={{
              opacity: textOpacity,
              transform: `translateY(${textY}px)`,
              transition: 'opacity 0.1s linear, transform 0.1s linear',
            }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-[36px] font-bold text-white tracking-[-0.01em] leading-[1.15] mb-6">
              {heading}
            </h2>
            <div className="w-12 h-[2px] bg-[#8B9DAF] mb-6" />
            <p className="text-[15px] text-[#999999] leading-[1.7]">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
