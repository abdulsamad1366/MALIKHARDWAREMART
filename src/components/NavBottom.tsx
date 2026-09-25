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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
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
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button
            type="button"
            className={`nav-bottom-link nav-dropdown-trigger ${isCategoryActive ? 'active' : ''}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
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

          {/* Dropdown Menu Panel */}
          {dropdownOpen && (
            <div className="categories-dropdown-menu" role="menu">
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
            </div>
          )}
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
