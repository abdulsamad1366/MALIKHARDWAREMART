'use client';

/**
 * @file NavBottom.tsx
 * @description Part 3 of 3-part header navigation per docs/02-navigation.md.
 * Single row, horizontally scrollable on mobile:
 * [ Home | Categories ▾ | Our Story | About Us | Contact Us | Blog ]
 * Includes interactive hover/click dropdown for all 7 industrial hardware divisions.
 */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ArrowRight, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

/**
 * NavBottom component.
 */
export default function NavBottom() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch categories for dropdown
  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (isMounted && data.success && data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories for NavBottom:', err);
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 180);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(false);
  }, [pathname]);

  const isCategoryActive = pathname.startsWith('/category') || pathname === '/products';

  return (
    <nav className="nav-bottom-band" aria-label="Main Navigation">
      <div className="container nav-bottom-inner">
        {/* Navigation Item: Home */}
        <Link
          href="/"
          className={`nav-bottom-link ${pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>

        {/* Navigation Item: Categories with Dropdown Menu */}
        <div
          ref={dropdownRef}
          className="nav-dropdown-wrapper"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            className={`nav-bottom-link nav-dropdown-trigger ${isCategoryActive ? 'active' : ''}`}
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <Grid size={15} style={{ marginRight: '6px' }} />
            <span>Categories</span>
            <ChevronDown
              size={14}
              className={`dropdown-chevron ${dropdownOpen ? 'rotated' : ''}`}
            />
          </button>

          {/* Dropdown Menu Panel with Framer Motion */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="categories-dropdown-menu"
                role="menu"
              >
                <div className="categories-dropdown-header">
                  Industrial Hardware Divisions
                </div>
                <div className="categories-dropdown-grid">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      href={`/category/${cat.slug}`}
                      className="category-dropdown-item"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
                <div className="categories-dropdown-footer">
                  <Link
                    href="/products"
                    className="view-all-products-link"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span>View All Catalog Products</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Item: Our Story */}
        <Link
          href="/our-story"
          className={`nav-bottom-link ${pathname === '/our-story' ? 'active' : ''}`}
        >
          Our Story
        </Link>

        {/* Navigation Item: About Us */}
        <Link
          href="/about-us"
          className={`nav-bottom-link ${pathname === '/about-us' ? 'active' : ''}`}
        >
          About Us
        </Link>

        {/* Navigation Item: Contact Us */}
        <Link
          href="/contact-us"
          className={`nav-bottom-link ${pathname === '/contact-us' ? 'active' : ''}`}
        >
          Contact Us
        </Link>

        {/* Navigation Item: Blog */}
        <Link
          href="/blog"
          className={`nav-bottom-link ${pathname.startsWith('/blog') ? 'active' : ''}`}
        >
          Blog
        </Link>
      </div>
    </nav>
  );
}
