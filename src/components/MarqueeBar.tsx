'use client';

/**
 * @file MarqueeBar.tsx
 * @description Part 1 of 3-part header navigation.
 * Full-width scrolling marquee banner with rich red finish, live radar beacons,
 * tech separators, and edge mask fades.
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
   * Intelligently parses announcement message into structured tech components.
   * If prefixed e.g. "⚡ Wholesale Dispatch Alert: Direct factory shipments..."
   * it formats the title with an amber live beacon pill and the rest with high contrast.
   */
  const renderMessageContent = (text: string) => {
    const colonIndex = text.indexOf(':');
    if (colonIndex !== -1 && colonIndex < 45) {
      const prefix = text.slice(0, colonIndex).replace(/^[⚡\s]+/, '').trim();
      const body = text.slice(colonIndex + 1).trim();

      return (
        <span className="marquee-item">
          <span className="marquee-alert-pill">
            <span className="marquee-beacon">
              <span className="beacon-ping" />
              <span className="beacon-dot" />
            </span>
            <span>{prefix}</span>
          </span>
          <span className="marquee-text-body">{body}</span>
        </span>
      );
    }

    return (
      <span className="marquee-item">
        <span className="marquee-beacon">
          <span className="beacon-ping" />
          <span className="beacon-dot" />
        </span>
        <span className="marquee-text-body">{text}</span>
      </span>
    );
  };

  const separator = (
    <span className="marquee-separator" aria-hidden="true">
      <Sparkles size={11} className="mr-1 inline-block" />
      <span>✦</span>
    </span>
  );

  return (
    <div className="marquee-band" role="region" aria-label="Store Announcement">
      <div className="marquee-scroll-window">
        <div className="marquee-track">
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
          <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center' }}>
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
