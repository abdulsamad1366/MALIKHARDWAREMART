'use client';

/**
 * @file NavBottom.tsx
 * @description Part 3 of 3-part header navigation per docs/02-navigation.md.
 * Apple & Google clean navigation bar with Tailwind CSS, Framer Motion, and GSAP.
 * Single row, horizontally centered with zero scrollbar clipping:
 * [ Home | Categories ▾ | Our Story | About Us | Contact Us | Blog ]
 */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ArrowRight, Grid } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';

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
  const dropdownPanelRef = useRef<HTMLDivElement>(null);
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
    }, 240); // 240ms grace period ensures smooth diagonal mouse movement without closing
  };

  // GSAP micro-stagger animation on dropdown items when menu opens
  useEffect(() => {
    if (dropdownOpen && dropdownPanelRef.current && !shouldReduceMotion) {
      const rows = dropdownPanelRef.current.querySelectorAll('.category-dropdown-row');
      if (rows.length > 0) {
        gsap.fromTo(
          rows,
          { opacity: 0, x: -8 },
          { opacity: 1, x: 0, duration: 0.22, stagger: 0.025, ease: 'power2.out' }
        );
      }
    }
  }, [dropdownOpen, shouldReduceMotion]);

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
    <nav className="w-full bg-white/95 backdrop-blur-md border-b border-black/5 relative z-40" aria-label="Main Navigation">
      <div className="container mx-auto px-4 overflow-visible">
        <div className="flex items-center justify-center gap-1 sm:gap-2.5 py-2 overflow-visible">
          
          {/* Home Link */}
          <Link
            href="/"
            className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 ${
              pathname === '/'
                ? 'text-red-600 bg-red-50/90 font-bold shadow-xs'
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
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isCategoryActive
                  ? 'text-red-600 bg-red-50/90 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <Grid size={14} className={isCategoryActive ? 'text-red-600' : 'opacity-70'} />
              <span>Categories</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-red-600' : 'opacity-60'
                }`}
              />
            </button>

            {/* Seamless hover bridge: Fills the gap between button and floating panel */}
            <div className="absolute top-full left-0 w-full h-3 pointer-events-auto" />

            {/* Frosted Glass Dropdown Panel */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  ref={dropdownPanelRef}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-76 sm:w-84 bg-white/98 backdrop-blur-2xl border border-slate-200/90 shadow-2xl rounded-2xl p-2.5 z-50 mt-1"
                  role="menu"
                >
                  <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Industrial Divisions</span>
                    {categories.length > 0 && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-semibold">
                        {categories.length}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {categories.map((cat) => {
                      const isSelected = pathname === `/category/${cat.slug}`;
                      return (
                        <Link
                          key={cat._id}
                          href={`/category/${cat.slug}`}
                          className={`category-dropdown-row group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                            isSelected
                              ? 'bg-red-50 text-red-600 font-bold'
                              : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                          }`}
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                            {cat.name}
                          </span>
                          <ArrowRight
                            size={12}
                            className={`transition-all duration-150 ${
                              isSelected
                                ? 'text-red-600 opacity-100'
                                : 'text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                            }`}
                          />
                        </Link>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 px-1">
                    <Link
                      href="/products"
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-red-600 text-white text-xs font-bold transition-colors duration-200 shadow-xs"
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
                  ? 'text-red-600 bg-red-50/90 font-bold shadow-xs'
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
