'use client';

/**
 * @file HeaderMiddle.tsx
 * @description Part 2 of 3-part header navigation.
 * Modern Apple & Google design system search & action bar with Tailwind CSS, Framer Motion, and GSAP.
 * - Left: Logo + 'Malik Hardware Mart' wordmark (links to /)
 * - Middle: Apple-style capsule search input (sequential flex layout preventing any overlap)
 * - Right: Cart button (with spring badge count) + Profile action (avatar initials or sign-in)
 */

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Search,
  ShoppingCart,
  User as UserIcon,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';

export default function HeaderMiddle() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const shouldReduceMotion = useReducedMotion();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const wrenchRef = useRef<HTMLDivElement>(null);

  /**
   * Handles search form submission.
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  /**
   * GSAP subtle glow/pulse on search input focus
   */
  const handleSearchFocus = () => {
    if (!shouldReduceMotion && searchContainerRef.current) {
      gsap.to(searchContainerRef.current, {
        scale: 1.01,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  };

  const handleSearchBlur = () => {
    if (!shouldReduceMotion && searchContainerRef.current) {
      gsap.to(searchContainerRef.current, {
        scale: 1,
        duration: 0.25,
        ease: 'power2.out',
      });
    }
  };

  /**
   * Computes user initials for the authenticated avatar circle.
   */
  const getUserInitials = (name?: string): string => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-b border-black/6 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3 sm:gap-4 md:gap-8">
        
        {/* Column 1: Brand Wordmark Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg p-1 shrink-0"
          aria-label="Malik Hardware Mart Home"
        >
          <motion.div
            ref={wrenchRef}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.06, rotate: 6 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm shadow-slate-900/10 group-hover:bg-red-600 transition-colors duration-300 shrink-0"
          >
            <Wrench size={20} className="stroke-[2.2]" />
          </motion.div>
          <div className="flex flex-col shrink-0">
            <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-red-600 transition-colors duration-200">
              MALIK
            </span>
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.14em] uppercase -mt-0.5">
              HARDWARE MART
            </span>
          </div>
        </Link>

        {/* Column 2: Search Input (Desktop) - Bulletproof Sequential Flex Capsule */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-auto min-w-0" role="search">
          <div
            ref={searchContainerRef}
            className="w-full flex items-center gap-3 px-4 h-11 rounded-full bg-apple-subtle hover:bg-[#EBEBEF] focus-within:bg-white focus-within:border-red-500/40 focus-within:ring-4 focus-within:ring-red-500/10 border border-slate-200/60 shadow-xs transition-all duration-200 group"
          >
            <Search
              size={18}
              className="text-slate-400 group-focus-within:text-red-600 transition-colors duration-200 shrink-0 pointer-events-none"
            />
            <input
              type="text"
              className="w-full h-full bg-transparent border-0 outline-none text-slate-900 placeholder:text-slate-500 text-sm font-medium focus:ring-0 p-0"
              placeholder="Search fasteners, power tools, electricals, CPVC pipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              aria-label="Search catalog products"
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full shrink-0 transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </motion.button>
            )}
          </div>
        </form>

        {/* Column 3: Actions (Mobile Search, Admin, Cart, Account) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Toggle search input"
          >
            {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>

          {/* Admin Dashboard Quick Access (Admin Only) */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold tracking-wide border border-slate-200/60 transition-all duration-200 shrink-0 whitespace-nowrap"
              title="Open Admin Management Portal"
            >
              <ShieldCheck size={14} className="text-amber-600 shrink-0" />
              <span>Admin</span>
            </Link>
          )}

          {/* Cart Button with Spring Badge */}
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 px-3.5 py-1.5 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200/90 text-slate-800 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shrink-0 whitespace-nowrap"
            aria-label={`Shopping Cart with ${itemCount} items`}
          >
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { scale: 1.1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="relative flex items-center shrink-0"
            >
              <ShoppingCart size={18} className="stroke-2 shrink-0" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute -top-2.5 -right-3 min-w-4.5 h-4.5 px-1 bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center rounded-full shadow-xs"
                  aria-label={`${itemCount} items in cart`}
                >
                  {itemCount}
                </motion.span>
              )}
            </motion.div>
            <span className="hidden sm:inline text-xs font-bold tracking-tight">Cart</span>
          </Link>

          {/* User Profile / Login Action */}
          {isAuthenticated && user ? (
            <Link
              href="/account"
              className="inline-flex items-center gap-2 pl-1.5 pr-3.5 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200/90 text-slate-800 transition-colors duration-200 shrink-0 whitespace-nowrap"
              title={`Logged in as ${user.name} (${user.role})`}
              aria-label="My Account"
            >
              <div className="w-6.5 h-6.5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {getUserInitials(user.name)}
              </div>
              <span className="hidden lg:inline text-xs font-semibold max-w-20 truncate">
                {user.name.split(' ')[0]}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-slate-900 hover:bg-red-600 text-white text-xs font-bold tracking-wide shadow-xs hover:shadow-md transition-all duration-200 shrink-0 whitespace-nowrap"
              aria-label="Trade Account Sign In"
            >
              <UserIcon size={14} className="stroke-2 shrink-0" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search Dropdown Drawer */}
      {mobileSearchOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden border-t border-slate-100 bg-apple-subtle px-4 py-3"
        >
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              autoFocus
              className="flex-1 h-10 px-4 bg-white text-slate-900 placeholder:text-slate-500 text-sm rounded-full border border-slate-200 focus:outline-none focus:border-red-500"
              placeholder="Search tools, fasteners, pipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-full hover:bg-red-600 transition-colors"
            >
              Search
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
