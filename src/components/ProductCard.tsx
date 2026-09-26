'use client';

/**
 * @file ProductCard.tsx
 * @description Catalog product card with Apple & Google design system, Tailwind CSS, and Framer Motion.
 * Supports Section 5 image fallbacks and Section 7 B2B price gating.
 * When guest: renders locked pricing indicator with CTA redirecting to /login?redirect=...
 * When authenticated: renders wholesale trade price and instant Add to Cart action.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, ShoppingCart, Check, ArrowRight, Clock } from 'lucide-react';
import { getProductImageUrl, handleImageError } from '@/lib/imageFallback';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { motion, useReducedMotion } from 'framer-motion';

export interface ProductCardProps {
  id: string;
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

export default function ProductCard({
  id,
  name,
  slug,
  brand,
  price,
  imageUrl,
  stockStatus,
  category,
  specs = [],
}: ProductCardProps) {
  const { isAuthenticated, isPriceVerified } = useAuth();
  const { addToCart } = useCart();
  const shouldReduceMotion = useReducedMotion();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Compute image fallback per Section 5 policy
  const resolvedImageUrl = getProductImageUrl(
    imageUrl,
    category?.slug,
    category?.placeholderImage
  );

  /**
   * Handles authenticated Add to Cart action.
   */
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) return;

    setAdding(true);
    const res = await addToCart(id, 1);
    setAdding(false);

    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  // Stock status styling helper
  const getStockBadge = () => {
    switch (stockStatus) {
      case 'in_stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            In Stock
          </span>
        );
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200/80">
            Out of Stock
          </span>
        );
      case 'on_request':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
            On Request
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            In Stock
          </span>
        );
    }
  };

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col justify-between bg-white border border-slate-200/80 hover:border-red-500/40 rounded-2xl p-3 sm:p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300"
    >
      <div>
        {/* Product Image Frame */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#F5F5F7] p-3 flex items-center justify-center">
          <Link href={`/products/${slug}`} className="w-full h-full flex items-center justify-center">
            <img
              src={resolvedImageUrl}
              alt={name}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
              onError={handleImageError}
              loading="lazy"
            />
          </Link>
          <div className="absolute top-2 left-2 z-10">
            {getStockBadge()}
          </div>
        </div>

        {/* Card Body */}
        <div className="pt-3">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
            {brand}
          </span>

          <h3 className="mt-1 text-sm font-bold text-slate-900 group-hover:text-red-600 line-clamp-2 leading-snug transition-colors duration-200 min-h-[40px]">
            <Link href={`/products/${slug}`} title={name}>
              {name}
            </Link>
          </h3>

          {/* Technical Specs Preview */}
          {specs && specs.length > 0 && (
            <div className="mt-2.5 p-2 bg-[#F8FAFC] rounded-lg text-[11px] text-slate-500 flex flex-col gap-1">
              {specs.slice(0, 2).map((sp, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-slate-400">{sp.key}:</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[120px]">{sp.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer with Price Gate */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        {isAuthenticated && typeof price === 'number' ? (
          // Logged-in & Verified: Reveal price & Add to Cart button
          <div className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trade Wholesale</span>
                <span className="text-lg font-black text-slate-900 tracking-tight">₹{price.toLocaleString('en-IN')}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">+ 18% GST</span>
            </div>

            <motion.button
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={adding || stockStatus === 'out_of_stock'}
              className="w-full h-9 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-red-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors duration-200 shadow-sm"
            >
              {added ? (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-1 text-emerald-400"
                >
                  <Check size={14} className="stroke-[3]" />
                  <span>Added to Cart</span>
                </motion.span>
              ) : (
                <>
                  <ShoppingCart size={14} />
                  <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                </>
              )}
            </motion.button>
          </div>
        ) : isAuthenticated && !isPriceVerified ? (
          // Logged-in BUT Pending Verification: Show approval pending notice
          <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-2.5 flex items-center gap-2 text-xs">
            <Clock size={16} className="text-amber-600 shrink-0" />
            <div>
              <div className="font-bold text-amber-900 text-[11px]">Rates Pending Approval</div>
              <div className="text-amber-700 text-[10px]">Awaiting admin verification</div>
            </div>
          </div>
        ) : (
          // Guest state: Price locked; redirect on click to Login per Section 2 & 4.1
          <div className="flex items-center justify-between gap-2 p-2 bg-[#F5F5F7] rounded-xl border border-slate-200/60">
            <div className="flex flex-col">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800">
                <Lock size={12} className="text-amber-600" />
                <span>Wholesale Rates</span>
              </div>
              <span className="text-[10px] text-slate-400">Sign in to unlock</span>
            </div>

            <Link
              href={`/login?redirect=/products/${slug}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-red-500 hover:text-red-600 text-slate-700 text-[11px] font-bold shadow-sm transition-all duration-200"
            >
              <span>Login</span>
              <ArrowRight size={11} />
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
