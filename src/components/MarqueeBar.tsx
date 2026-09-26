'use client';

/**
 * @file MarqueeBar.tsx
 * @description Part 1 of 3-part header navigation.
 * Full-width scrolling marquee banner styled completely with Tailwind CSS.
 * Features vibrant engineered red gradient, live radar beacon, tech star separators,
 * edge gradient mask fades, and pause-on-hover.
 * Dynamically fetched from SiteSettings.marqueeMessage.
 */

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface MarqueeBarProps {
  initialMessage?: string;
}

export default function MarqueeBar({ initialMessage = '' }: MarqueeBarProps) {
  const [message, setMessage] = useState<string>(initialMessage);
  const [loading, setLoading] = useState<boolean>(!initialMessage);

  useEffect(() => {
    let isMounted = true;

    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (isMounted && data.success && data.settings?.marqueeMessage) {
          setMessage(data.settings.marqueeMessage);
        }
      } catch (err) {
        console.error('Failed to load marquee settings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  // Collapse band to 0 height if no announcement message is active
  if (!loading && (!message || message.trim() === '')) {
    return null;
  }

  const displayMessage = message.trim();

  /**
   * Intelligently parses announcement message into structured tech components with Tailwind CSS.
   * If prefixed e.g. "⚡ Wholesale Dispatch Alert: Direct factory shipments..."
   * it formats the title with an amber live beacon pill and the rest with high contrast.
   */
  const renderMessageContent = (text: string) => {
    const colonIndex = text.indexOf(':');
    if (colonIndex !== -1 && colonIndex < 45) {
      const prefix = text.slice(0, colonIndex).replace(/^[⚡\s]+/, '').trim();
      const body = text.slice(colonIndex + 1).trim();

      return (
        <span className="inline-flex items-center gap-2.5 font-semibold text-white tracking-wide text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/25 border border-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-amber-200 shadow-sm">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300 shadow-[0_0_6px_#FCD34D]" />
            </span>
            <span>{prefix}</span>
          </span>
          <span className="font-semibold text-white text-xs tracking-wide">{body}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2.5 font-semibold text-white tracking-wide text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300 shadow-[0_0_6px_#FCD34D]" />
        </span>
        <span className="font-semibold text-white text-xs tracking-wide">{text}</span>
      </span>
    );
  };

  const separator = (
    <span className="inline-flex items-center gap-1 mx-7 text-amber-200 text-xs font-bold opacity-90 drop-shadow-[0_0_6px_rgba(254,240,138,0.6)]" aria-hidden="true">
      <Sparkles size={11} className="inline-block" />
      <span>✦</span>
    </span>
  );

  return (
    <div
      className="relative w-full overflow-hidden select-none bg-gradient-to-r from-red-900 via-red-600 to-red-900 py-2 border-b border-red-950/20 shadow-[0_2px_10px_rgba(220,38,38,0.25)] text-xs text-white"
      role="region"
      aria-label="Store Announcement"
    >
      {/* Top subtle sheen highlight line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      {/* Edge gradient fade mask for smooth entrance & exit */}
      <div className="relative w-full overflow-hidden whitespace-nowrap flex [mask-image:linear-gradient(to_right,transparent,black_48px,black_calc(100%-48px),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_48px,black_calc(100%-48px),transparent)]">
        <div className="marquee-track inline-flex items-center whitespace-nowrap will-change-transform animate-marquee hover:[animation-play-state:paused] cursor-default">
          {/* Loop segment 1 */}
          {renderMessageContent(displayMessage)}
          {separator}
          {renderMessageContent(displayMessage)}
          {separator}
          {renderMessageContent(displayMessage)}
          {separator}
          {renderMessageContent(displayMessage)}
          {separator}

          {/* Loop segment 2 (identical duplicate for seamless 50% translation) */}
          <span aria-hidden="true" className="inline-flex items-center">
            {renderMessageContent(displayMessage)}
            {separator}
            {renderMessageContent(displayMessage)}
            {separator}
            {renderMessageContent(displayMessage)}
            {separator}
            {renderMessageContent(displayMessage)}
            {separator}
          </span>
        </div>
      </div>
    </div>
  );
}
