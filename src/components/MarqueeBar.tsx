'use client';

/**
 * @file MarqueeBar.tsx
 * @description Part 1 of 3-part header navigation.
 * Full-width scrolling marquee banner dynamically fetched from SiteSettings.marqueeMessage.
 * Collapses to 0 height if message is empty. Styled with minimal light theme.
 */

import React, { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';

interface MarqueeBarProps {
  initialMessage?: string;
}

/**
 * MarqueeBar component.
 * Displays dynamic administrative announcements across all site pages.
 */
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

  return (
    <div className="marquee-band" role="region" aria-label="Store Announcement">
      <div className="marquee-content-container">
        <div className="marquee-badge">
          <Megaphone size={13} className="marquee-badge-icon" />
          <span>Notice</span>
        </div>
        <div className="marquee-scroll-window">
          <div className="marquee-track">
            <span className="marquee-item">{displayMessage}</span>
            <span className="marquee-separator">•</span>
            <span className="marquee-item">{displayMessage}</span>
            <span className="marquee-separator">•</span>
            <span className="marquee-item">{displayMessage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
