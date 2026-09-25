'use client';

/**
 * @file Header.tsx
 * @description Global sticky navigation header.
 * Displays brand identity, live catalog search, quick category bar,
 * cart counter, and dynamic user/admin profile actions.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Wrench,
  Search,
  ShoppingCart,
  User,
  ShieldAlert,
  LogOut,
  Phone,
  Package,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface CategoryNav {
  _id: string;
  name: string;
  slug: string;
}

/**
 * Global Header component.
 */
export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryNav[]>([]);

  // Fetch top categories for the sub-navigation strip
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to load header categories:', err);
      }
    }
    loadCategories();
  }, []);

  /**
   * Handles search form submission.
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Top B2B Trade Announcement Bar */}
      <div className="top-notice-bar">
        <div className="container top-notice-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="top-notice-badge">B2B Trade Wholesale</span>
            <span>Wholesale pricing is reserved for verified trade accounts</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={13} style={{ color: 'var(--color-amber)' }} />
              Trade Desk: +91 98765 43210
            </span>
            <span>GST Invoicing Available</span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <header className="main-header">
        <div className="container header-inner">
          {/* Brand Logo */}
          <Link href="/" className="brand-logo">
            <div className="brand-icon-wrapper">
              <Wrench size={24} />
            </div>
            <div className="brand-text">
              <span className="brand-name">MALIK</span>
              <span className="brand-sub">HARDWARE MART</span>
            </div>
          </Link>

          {/* Catalog Search Bar */}
          <div className="header-search">
            <form onSubmit={handleSearch} className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Search tools, fasteners, pipes, electricals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Action Links */}
          <div className="header-actions">
            <Link
              href="/products"
              className={`nav-link ${pathname === '/products' ? 'active' : ''}`}
            >
              <Layers size={18} />
              <span>Catalog</span>
            </Link>

            {/* Cart Button (Always visible; links to /cart which guards guests) */}
            <Link href="/cart" className="cart-button">
              <ShoppingCart size={19} style={{ color: 'var(--color-amber)' }} />
              <span>Cart</span>
              {isAuthenticated && itemCount > 0 && (
                <span className="cart-badge">{itemCount}</span>
              )}
            </Link>

            {/* Conditional Auth Navigation */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="btn-outline-amber"
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    <ShieldAlert size={14} />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <Link
                  href="/orders"
                  className="nav-link"
                  title="My Orders"
                >
                  <Package size={18} />
                  <span>Orders</span>
                </Link>

                <Link
                  href="/account"
                  className="nav-link"
                  title="Account Profile"
                >
                  <User size={18} />
                  <span>{user?.name.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={() => logout()}
                  className="nav-link"
                  title="Sign Out"
                  style={{ background: 'transparent' }}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link href="/login" className="btn-secondary" style={{ padding: '8px 16px' }}>
                  Login
                </Link>
                <Link href="/register" className="btn-primary" style={{ padding: '8px 16px' }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Categories Horizontal Navigation Bar */}
      <nav className="category-nav-strip">
        <div className="container">
          <ul className="category-nav-list">
            <li>
              <Link
                href="/products"
                className={`category-nav-item ${pathname === '/products' ? 'active' : ''}`}
              >
                All Products
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat._id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className={`category-nav-item ${
                    pathname === `/category/${cat.slug}` ? 'active' : ''
                  }`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
