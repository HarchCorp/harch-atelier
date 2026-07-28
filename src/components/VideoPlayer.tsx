'use client';

import { useState, useRef } from 'react';
import { Play, X } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  variant?: 'hero' | 'embedded' | 'modal-trigger';
  label?: string;
}

/**
 * Reusable video player for Harch Corp.
 * 
 * Variants:
 * - 'hero': Background video (autoplay, muted, loop) for hero sections
 * - 'embedded': Inline video with controls
 * - 'modal-trigger': Shows a play button, opens fullscreen modal on click
 */
export function VideoPlayer({
  src,
  poster,
  className = '',
  autoPlay = false,
  muted = true,
  loop = false,
  variant = 'embedded',
  label,
}: VideoPlayerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Hero variant — background video, no controls
  if (variant === 'hero') {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={poster}
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
    );
  }

  // Modal trigger variant — play button overlay
  if (variant === 'modal-trigger') {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className={`group relative overflow-hidden rounded-lg ${className}`}
          aria-label={label || 'Play video'}
        >
          {poster && (
            <img
              src={poster}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#8B9DAF] flex items-center justify-center transition-transform group-hover:scale-110">
              <Play className="w-7 h-7 text-[#0D0D0D] ml-1" fill="currentColor" />
            </div>
          </div>
          {label && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-[12px] font-bold text-white uppercase tracking-wider">{label}</p>
            </div>
          )}
        </button>

        {modalOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <button
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              onClick={() => setModalOpen(false)}
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <video
              autoPlay
              controls
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <source src={src} type="video/mp4" />
            </video>
          </div>
        )}
      </>
    );
  }

  // Embedded variant — inline video with controls
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <video
        ref={videoRef}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={!autoPlay}
        playsInline
        className="w-full h-full object-cover"
        poster={poster}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}

/**
 * Compact video badge for cards/sections.
 * Shows a small play icon + label, opens modal on click.
 */
export function VideoBadge({ src, label }: { src: string; label: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold bg-[#8B9DAF]/10 border border-[#8B9DAF]/20 text-[#8B9DAF] hover:bg-[#8B9DAF]/20 transition-all"
      >
        <Play className="w-3 h-3" fill="currentColor" />
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={() => setOpen(false)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <video
            autoPlay
            controls
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <source src={src} type="video/mp4" />
          </video>
        </div>
      )}
    </>
  );
}
