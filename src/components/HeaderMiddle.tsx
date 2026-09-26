'use client';

/**
 * @file HeaderMiddle.tsx
 * @description Part 2 of 3-part header navigation.
 * Modern Apple & Google design system search & action bar with Tailwind CSS and Framer Motion.
 * - Left: Logo + 'Malik Hardware Mart' wordmark (links to /)
 * - Middle: Apple-style capsule search input (submits to /products?search=<query>)
 * - Right: Cart button (with spring badge count) + Profile action (avatar initials or sign-in)
 */

import React, { useState } from 'react';
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

export default function HeaderMiddle() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const shouldReduceMotion = useReducedMotion();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
    <div className="w-full bg-white/95 backdrop-blur-md border-b border-black/[0.06] transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-4 md:gap-8">
        
        {/* Column 1: Brand Wordmark Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg p-1"
          aria-label="Malik Hardware Mart Home"
        >
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { scale: 1.05, rotate: 5 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm shadow-slate-900/10 group-hover:bg-red-600 transition-colors duration-300"
          >
            <Wrench size={20} className="stroke-[2.2]" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-red-600 transition-colors duration-200">
              MALIK
            </span>
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.14em] uppercase -mt-0.5">
              HARDWARE MART
            </span>
          </div>
        </Link>

        {/* Column 2: Search Input (Desktop) - Apple Capsule Style */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-auto" role="search">
          <div className="relative w-full flex items-center group">
            <Search
              size={18}
              className="absolute left-4 text-slate-400 group-focus-within:text-red-600 transition-colors duration-200 pointer-events-none"
            />
            <input
              type="text"
              className="w-full h-11 pl-11 pr-4 bg-[#F5F5F7] hover:bg-[#EBEBEF] focus:bg-white text-slate-900 placeholder:text-slate-500 text-sm font-medium rounded-full border border-transparent focus:border-red-500/30 focus:ring-4 focus:ring-red-500/10 outline-none transition-all duration-200"
              placeholder="Search fasteners, power tools, electricals, CPVC pipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search catalog products"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 rounded-full"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </form>

        {/* Column 3: Actions (Mobile Search, Admin, Cart, Account) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Toggle search input"
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Admin Dashboard Quick Access (Admin Only) */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold tracking-wide border border-slate-200/60 transition-all duration-200"
              title="Open Admin Management Portal"
            >
              <ShieldCheck size={14} className="text-amber-600" />
              <span>Admin</span>
            </Link>
          )}

          {/* Cart Button with Spring Badge */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-full hover:bg-slate-100 text-slate-800 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label={`Shopping Cart with ${itemCount} items`}
          >
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { scale: 1.1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <ShoppingCart size={20} className="stroke-[2]" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[11px] font-extrabold flex items-center justify-center rounded-full shadow-sm shadow-red-600/30"
                  aria-label={`${itemCount} items in cart`}
                >
                  {itemCount}
                </motion.span>
              )}
            </motion.div>
            <span className="hidden sm:inline text-xs font-semibold tracking-tight">Cart</span>
          </Link>

          {/* User Profile / Login Action */}
          {isAuthenticated && user ? (
            <Link
              href="/account"
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full hover:bg-slate-100 text-slate-800 transition-colors duration-200"
              title={`Logged in as ${user.name} (${user.role})`}
              aria-label="My Account"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {getUserInitials(user.name)}
              </div>
              <span className="hidden lg:inline text-xs font-semibold max-w-[80px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-red-600 text-white text-xs font-bold tracking-tight shadow-sm hover:shadow transition-all duration-200"
              aria-label="Trade Account Sign In"
            >
              <UserIcon size={14} className="stroke-[2.5]" />
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
          className="md:hidden border-t border-slate-100 bg-[#F5F5F7] px-4 py-3"
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
