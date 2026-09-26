'use client';

/**
 * @file PromoBannerStrip.tsx
 * @description Promotional banner strip component featuring Apple & Google styled cards.
 * Sourced from PromoBanner model. Reusable before and after "Shop by Use" per docs/08-homepage-layout.md.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export interface PromoBannerItem {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  linkUrl: string;
  badge?: string;
  displayOrder: number;
}

interface PromoBannerStripProps {
  banners?: PromoBannerItem[];
  startIndex?: number;
  limit?: number;
}

export default function PromoBannerStrip({
  banners: initialBanners,
  startIndex = 0,
  limit = 3,
}: PromoBannerStripProps) {
  const [banners, setBanners] = useState<PromoBannerItem[]>(initialBanners || []);
  const [loading, setLoading] = useState(!initialBanners || initialBanners.length === 0);
  const shouldReduceMotion = useReducedMotion();

  // Fallback banners if none in DB
  const defaultBanners: PromoBannerItem[] = [
    {
      _id: 'banner-1',
      title: 'High-Tensile Fasteners',
      subtitle: 'Grade 8.8 & 10.9 Structural Bolts',
      image: '/images/products/category-fasteners.png',
      linkUrl: '/category/fasteners-fixings',
      badge: 'Certified 3.1 MTC',
      displayOrder: 0,
    },
    {
      _id: 'banner-2',
      title: 'Bosch Power Tools',
      subtitle: 'Heavy-Duty SDS Rotary & Demolition',
      image: '/images/products/category-tools.png',
      linkUrl: '/category/hand-power-tools',
      badge: 'Authorized Center',
      displayOrder: 1,
    },
    {
      _id: 'banner-3',
      title: 'Chemical Anchors',
      subtitle: 'Pure Epoxy & Vinylester Cartridges',
      image: '/images/products/category-hardware.png',
      linkUrl: '/use/heavy-construction',
      badge: 'Seismic Approved',
      displayOrder: 2,
    },
  ];

  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) {
      setBanners(initialBanners);
      setLoading(false);
      return;
    }

    async function loadBanners() {
      try {
        setLoading(true);
        const res = await fetch('/api/promo-banners');
        if (res.ok) {
          const data = await res.json();
          if (data.banners && data.banners.length > 0) {
            setBanners(data.banners);
          } else {
            setBanners(defaultBanners);
          }
        } else {
          setBanners(defaultBanners);
        }
      } catch (err) {
        console.error('Failed to load promo banners:', err);
        setBanners(defaultBanners);
      } finally {
        setLoading(false);
      }
    }

    loadBanners();
  }, [initialBanners]);

  const rawList = banners.length > 0 ? banners : defaultBanners;
  const slicedBanners = rawList.slice(startIndex, startIndex + limit);

  if (slicedBanners.length === 0) return null;

  return (
    <motion.section
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="py-6 sm:py-8 bg-white"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {slicedBanners.map((banner, idx) => (
            <motion.div
              key={banner._id}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.35,
                delay: shouldReduceMotion ? 0 : idx * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={shouldReduceMotion ? undefined : { y: -4 }}
              className="flex"
            >
              <Link
                href={banner.linkUrl}
                className="group relative w-full h-[180px] rounded-2xl overflow-hidden bg-[#F5F5F7] hover:bg-white border border-slate-200/80 hover:border-red-500/40 p-6 flex items-center shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {/* Background Product Illustration */}
                <div className="absolute right-0 bottom-0 w-36 h-36 opacity-85 z-[1] group-hover:scale-108 transition-transform duration-500 ease-out pointer-events-none">
                  <Image
                    src={banner.image || '/images/products/default-product.png'}
                    alt={banner.title}
                    fill
                    sizes="144px"
                    className="object-contain"
                  />
                </div>

                {/* Soft gradient mask for clean typography */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#F5F5F7] via-[#F5F5F7]/90 to-transparent group-hover:from-white group-hover:via-white/90 z-[2] transition-colors duration-300 pointer-events-none" />

                {/* Text & Callout */}
                <div className="relative z-[3] max-w-[65%]">
                  {banner.badge && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/70 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2">
                      <Sparkles size={10} />
                      {banner.badge}
                    </span>
                  )}

                  <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-red-600 leading-tight mb-1 transition-colors duration-200">
                    {banner.title}
                  </h3>

                  {banner.subtitle && (
                    <p className="text-xs text-slate-500 line-clamp-1 mb-3 leading-snug">
                      {banner.subtitle}
                    </p>
                  )}

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 group-hover:text-red-600 transition-colors duration-200">
                    <span>Shop Division</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
