'use client';

/**
 * @file HeaderMiddle.tsx
 * @description Part 2 of 3-part header navigation.
 * 3-column middle band containing:
 * - Left: Logo + 'Malik Hardware Mart' wordmark (links to /)
 * - Middle: Search input (submits to /products?search=<query>)
 * - Right: Cart button (with badge count from CartContext) + Profile action
 *   (shows initials avatar when authenticated, outline icon for guest).
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
import { motion } from 'framer-motion';

/**
 * HeaderMiddle component.
 */
export default function HeaderMiddle() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();

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
    <div className="header-middle-band">
      <div className="container header-middle-inner">
        {/* Column 1: Brand Wordmark Logo */}
        <Link href="/" className="brand-logo" aria-label="Malik Hardware Mart Home">
          <div className="brand-icon-wrapper">
            <Wrench size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-name">MALIK</span>
            <span className="brand-sub">HARDWARE MART</span>
          </div>
        </Link>

        {/* Column 2: Search Input (Desktop) */}
        <form onSubmit={handleSearch} className="header-search-form" role="search">
          <div className="header-search-input-wrap">
            <Search size={17} className="header-search-icon" />
            <input
              type="text"
              className="header-search-input"
              placeholder="Search fasteners, power tools, electricals, CPVC pipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search catalog products"
            />
          </div>
        </form>

        {/* Column 3: Actions (Cart & Profile) */}
        <div className="header-middle-actions">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            className="mobile-search-toggle"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Toggle search input"
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Admin Dashboard Quick Access (Admin Only) */}
          {isAdmin && (
            <Link
              href="/admin"
              className="admin-badge-btn"
              title="Open Admin Management Portal"
            >
              <ShieldCheck size={16} />
              <span className="admin-btn-text">Admin</span>
            </Link>
          )}

          {/* Cart Button */}
          <Link
            href="/cart"
            className="cart-action-btn"
            aria-label={`Shopping Cart with ${itemCount} items`}
          >
            <ShoppingCart size={20} />
            <span className="cart-action-label">Cart</span>
            {itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                className="cart-badge-pill"
                aria-label={`${itemCount} items in cart`}
              >
                {itemCount}
              </motion.span>
            )}
          </Link>

          {/* User Profile / Login Action */}
          {isAuthenticated && user ? (
            <Link
              href="/account"
              className="profile-avatar-btn"
              title={`Logged in as ${user.name} (${user.role})`}
              aria-label="My Account"
            >
              <div className="avatar-circle">
                {getUserInitials(user.name)}
              </div>
              <span className="avatar-name-label">
                {user.name.split(' ')[0]}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="profile-guest-btn"
              aria-label="Trade Account Sign In"
            >
              <UserIcon size={19} />
              <span className="guest-login-label">Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search Dropdown Drawer */}
      {mobileSearchOpen && (
        <div className="mobile-search-drawer">
          <div className="container">
            <form onSubmit={handleSearch} className="mobile-search-form">
              <input
                type="text"
                autoFocus
                className="mobile-search-input"
                placeholder="Search tools, fasteners, pipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Search
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
