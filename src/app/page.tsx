'use client';

/**
 * @file page.tsx
 * @description Main Malik Hardware Mart homepage.
 * Apple & Google design system layout powered by Tailwind CSS and Framer Motion transitions.
 * Sequence:
 * 1. Hero Carousel (Edge-to-edge full width visual slider)
 * 2. Shop by Category (Interactive cards grid)
 * 3. Promo Banner Strip (Row 1: Banners 0-2)
 * 4. Shop by Use (Industrial application contexts)
 * 5. Promo Banner Strip (Row 2: Banners 3-5)
 * 6. Featured Products Grid (Spotlight inventory with price gate)
 * 7. Institutional Trust Signals & B2B Trade Callout
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Truck,
  FileText,
  Award,
  Building2,
  Lock,
} from 'lucide-react';
import HeroCarousel from '@/components/HeroCarousel';
import CategoryGrid from '@/components/CategoryGrid';
import PromoBannerStrip from '@/components/PromoBannerStrip';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { motion, useReducedMotion } from 'framer-motion';

export interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  price?: number;
  imageUrl?: string | null;
  stockStatus: 'in_stock' | 'out_of_stock' | 'on_request';
  category?: {
    name: string;
    slug: string;
    placeholderImage?: string;
  };
  specs?: Array<{ key: string; value: string }>;
}

export default function HomePage() {
  const { isAuthenticated, isPriceVerified } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  // Fetch featured products from server API
  useEffect(() => {
    async function loadFeatured() {
      try {
        setLoading(true);
        const prodRes = await fetch('/api/products?featured=true&limit=8');
        const prodData = await prodRes.json();
        if (prodData.success) {
          setFeaturedProducts(prodData.products || []);
        }
      } catch (err) {
        console.error('Failed to load featured products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFeatured();
  }, [isAuthenticated, isPriceVerified]);

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Full-Width Edge-To-Edge Hero Carousel */}
      <HeroCarousel />

      {/* 2. "Shop by Category" Cards Grid */}
      <CategoryGrid source="category" />

      {/* 3. Promo Banner Strip (Row 1: Banners 0-2) */}
      <PromoBannerStrip startIndex={0} limit={3} />

      {/* 4. "Shop by Use" Cards Grid */}
      <CategoryGrid source="useCase" />

      {/* 5. Promo Banner Strip (Row 2: Banners 3-5) */}
      <PromoBannerStrip startIndex={3} limit={3} />

      {/* 6. Featured Products Grid Section */}
      <motion.section
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="py-14 sm:py-16 bg-[#F8FAFC] border-y border-slate-200/80"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/80">
                  Spotlight Inventory
                </span>
                {!isAuthenticated && (
                  <span className="text-xs text-slate-400 font-medium">
                    • Trade Pricing Hidden For Guests
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                High-Demand Industrial Fasteners & Power Tools
              </h2>
              <p className="text-sm text-slate-500 max-w-xl mt-1.5 leading-relaxed">
                Certified contractor-grade inventory ready for same-day dispatch from our Central Delhi logistics hub.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-900 text-slate-800 hover:text-white border border-slate-200 text-xs font-bold transition-all duration-200 shadow-sm hover:shadow shrink-0 self-start md:self-auto"
            >
              <span>View Full Catalog</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              Loading featured inventory...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  slug={product.slug}
                  brand={product.brand}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  stockStatus={product.stockStatus}
                  category={product.category}
                  specs={product.specs}
                />
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {/* 7. Institutional Trust Signals & Contractor B2B Callout */}
      <motion.section
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="py-14 sm:py-16 bg-white"
      >
        <div className="container mx-auto px-4 sm:px-6">
          {/* Trust badges row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-apple-subtle border border-slate-200/60 hover:shadow-md transition-shadow duration-200">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                  Same-Day Site Freight
                </h4>
                <p className="text-xs text-slate-500 leading-snug">
                  Dedicated fleet dispatch across Delhi-NCR & Northern industrial corridors.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-apple-subtle border border-slate-200/60 hover:shadow-md transition-shadow duration-200">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                  100% GST ITC Invoicing
                </h4>
                <p className="text-xs text-slate-500 leading-snug">
                  Automated GSTR-2B compliance & E-Way bills generated per consignment.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-apple-subtle border border-slate-200/60 hover:shadow-md transition-shadow duration-200">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                <Award size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                  3.1 Mill Test Certificates
                </h4>
                <p className="text-xs text-slate-500 leading-snug">
                  Chemical analysis & proof-load certified for structural PEB compliance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-apple-subtle border border-slate-200/60 hover:shadow-md transition-shadow duration-200">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                <Building2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                  Direct Factory Tie-ups
                </h4>
                <p className="text-xs text-slate-500 leading-snug">
                  Authorized wholesale channels for Bosch, Tata Steel, Hilti, Fischer.
                </p>
              </div>
            </div>
          </div>

          {/* Guest B2B Trade Call-To-Action Banner */}
          {!isAuthenticated && (
            <div className="relative rounded-3xl bg-slate-900 p-8 sm:p-12 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-2xl overflow-hidden">
              {/* Subtle ambient lighting accent */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-xl">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
                  <Lock size={13} /> Commercial Trade Desk
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  Register Your Trade Account To Unlock Wholesale Rates
                </h3>
                <p className="text-sm text-slate-300 mt-2.5 leading-relaxed">
                  Institutional pricing, bulk carton discount slabs, credit terms, and project consignments are gated behind trade verification.
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-200"
                >
                  Register Commercial Account
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-bold backdrop-blur-md transition-all duration-200"
                >
                  Contractor Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}
