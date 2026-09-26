'use client';

/**
 * @file NavBottom.tsx
 * @description Part 3 of 3-part header navigation per docs/02-navigation.md.
 * Apple & Google clean navigation bar with Tailwind CSS and Framer Motion dropdown.
 * Single row, horizontally centered with touch-scroll fallback:
 * [ Home | Categories ▾ | Our Story | About Us | Contact Us | Blog ]
 */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ArrowRight, Grid } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

export default function NavBottom() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

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

  const navItems = [
    { label: 'Home', href: '/', isActive: pathname === '/' },
    { label: 'Our Story', href: '/our-story', isActive: pathname === '/our-story' },
    { label: 'About Us', href: '/about-us', isActive: pathname === '/about-us' },
    { label: 'Contact Us', href: '/contact-us', isActive: pathname === '/contact-us' },
    { label: 'Blog', href: '/blog', isActive: pathname.startsWith('/blog') },
  ];

  return (
    <nav className="w-full bg-white/95 backdrop-blur-md border-b border-black/[0.05]" aria-label="Main Navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-1 sm:gap-2 py-2 overflow-x-auto no-scrollbar">
          
          {/* Home Link */}
          <Link
            href="/"
            className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 ${
              pathname === '/'
                ? 'text-red-600 bg-red-50/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            Home
          </Link>

          {/* Categories Dropdown */}
          <div
            ref={dropdownRef}
            className="relative shrink-0"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isCategoryActive
                  ? 'text-red-600 bg-red-50/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <Grid size={14} className="opacity-80" />
              <span>Categories</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 opacity-70 ${
                  dropdownOpen ? 'rotate-180 text-red-600' : ''
                }`}
              />
            </button>

            {/* Invisible hover bridge */}
            <div className="absolute top-full left-0 w-full h-2 pointer-events-auto" />

            {/* Frosted Glass Dropdown Panel */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-[300px] sm:w-[340px] bg-white/95 backdrop-blur-2xl border border-black/[0.08] shadow-2xl rounded-2xl p-2.5 z-[1100]"
                  role="menu"
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Industrial Hardware Divisions
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat._id}
                        href={`/category/${cat.slug}`}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          pathname === `/category/${cat.slug}`
                            ? 'bg-red-50 text-red-600 font-bold'
                            : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                        }`}
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span>{cat.name}</span>
                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 px-1">
                    <Link
                      href="/products"
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-red-600 text-white text-xs font-bold transition-colors duration-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span>View All Catalog Products</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Remaining Nav Links */}
          {navItems.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 ${
                item.isActive
                  ? 'text-red-600 bg-red-50/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
