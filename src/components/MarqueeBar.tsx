'use client';

/**
 * @file MarqueeBar.tsx
 * @description Part 1 of 3-part header navigation.
 * High-performance edge-to-edge luxury announcement marquee inspired directly by Velisqa.com:
 * - Red background gradient: from-red-800 via-red-600 to-red-800
 * - Uppercase typography with wide letter-spacing: tracking-[0.18em]
 * - Gold ✦ star separators
 * - Exact 200% width dual-span track for seamless 50% translation
 * - Pause on hover
 * - Edge fade masks
 * Dynamically populated from SiteSettings.marqueeMessage.
 */

import React, { useState, useEffect } from 'react';

interface MarqueeBarProps {
  initialMessage?: string;
}

interface MarqueeItem {
  text: string;
  isHighlight?: boolean;
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

  const rawMessage = message.trim();

  // Parse announcement into luxury Velisqa-style items
  const parseItems = (text: string): MarqueeItem[] => {
    const clean = text.replace(/^[⚡\s]+/, '').trim();

    // Default trade propositions for the seeded Malik Hardware Mart alert
    if (clean.includes('Wholesale Dispatch Alert')) {
      return [
        { text: 'WHOLESALE DISPATCH ALERT: DIRECT FACTORY SHIPMENTS ACTIVE', isHighlight: true },
        { text: '100% GST ITC INVOICING ON EVERY CONSIGNMENT' },
        { text: 'SAME-DAY SITE FREIGHT ACROSS DELHI-NCR' },
        { text: 'AUTHORIZED DISTRIBUTOR: BOSCH • FISCHER • HILTI • TATA' },
        { text: 'TRADE DESK: +91 98765 43210' },
        { text: '50,000+ SATISFIED CONTRACTORS & FABRICATORS' },
      ];
    }

    // Split any custom text by period or semicolon
    const parts = clean.split(/[.;•|]+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 1) {
      return parts.map((part, idx) => ({
        text: part.toUpperCase(),
        isHighlight: idx === 0,
      }));
    }

    return [
      { text: clean.toUpperCase(), isHighlight: true },
      { text: '100% GST ITC INVOICING' },
      { text: 'EXPRESS SITE FREIGHT' },
      { text: 'TRADE INQUIRY: +91 98765 43210' },
      { text: '50,000+ SATISFIED CONTRACTORS' },
    ];
  };

  const items = parseItems(rawMessage);

  return (
    <div
      className="marquee-band relative flex h-9 w-full items-center overflow-hidden bg-gradient-to-r from-red-800 via-red-600 to-red-800 border-b border-red-700/50 shadow-sm"
      role="region"
      aria-label="Store highlights"
    >
      <div className="promo-marquee-viewport relative flex h-full w-full items-center overflow-hidden">
        <div className="promo-marquee-track promo-marquee-animate flex min-w-full items-center whitespace-nowrap cursor-default">
          {[0, 1].map((loopIdx) => (
            <span
              key={loopIdx}
              className="flex shrink-0 items-center px-6 text-[10px] leading-none sm:text-[11px] font-semibold tracking-[0.18em] uppercase text-white/95 sm:px-8"
              aria-hidden={loopIdx === 1}
            >
              {items.map((item, itemIdx) => (
                <React.Fragment key={itemIdx}>
                  <span className={item.isHighlight ? 'font-bold text-[#FDE68A] drop-shadow-[0_0_6px_rgba(253,230,138,0.5)]' : undefined}>
                    {item.text}
                  </span>
                  <span className="px-5 sm:px-6 text-[#FDE68A]/70 select-none text-[12px]" aria-hidden="true">
                    ✦
                  </span>
                </React.Fragment>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
