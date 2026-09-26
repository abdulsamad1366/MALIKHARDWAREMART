'use client';

/**
 * @file Header.tsx
 * @description Composed 3-Part Navigation Header per docs/02-navigation.md:
 * - Part 1: MarqueeBar (Full-width dynamic admin announcement banner)
 * - Part 2: HeaderMiddle (3 columns: Logo, Live Search, Cart with badge & Profile)
 * - Part 3: NavBottom (Horizontally scrollable: Home | Categories ▾ | Our Story | About Us | Contact Us | Blog)
 */

import React from 'react';
import MarqueeBar from '@/components/MarqueeBar';
import HeaderMiddle from '@/components/HeaderMiddle';
import NavBottom from '@/components/NavBottom';

/**
 * Global Header component composing the 3 distinct bands.
 */
export default function Header() {
  return (
    <header className="site-header-root sticky top-0 z-50 w-full">
      {/* Part 1: Top Marquee Notice Band */}
      <MarqueeBar />

      {/* Part 2: Middle Brand, Search & Cart/Profile Band */}
      <HeaderMiddle />

      {/* Part 3: Bottom Navigation Row */}
      <NavBottom />
    </header>
  );
}
