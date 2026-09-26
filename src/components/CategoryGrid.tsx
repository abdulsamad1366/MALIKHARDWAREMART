'use client';

/**
 * @file CategoryGrid.tsx
 * @description Apple & Google design system card grid component with Tailwind CSS & Framer Motion.
 * Reusable for both "Shop by Category" and "Shop by Application" (Use Cases)
 * per docs/08-homepage-layout.md and docs/09-design-motion-guidelines.md.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export interface GridItem {
  _id: string;
  name: string;
  slug: string;
  placeholderImage?: string;
  image?: string;
  description?: string;
}

interface CategoryGridProps {
  source?: 'category' | 'useCase';
  title?: string;
  subtitle?: string;
  items?: GridItem[];
}

export default function CategoryGrid({
  source = 'category',
  title,
  subtitle,
  items: initialItems,
}: CategoryGridProps) {
  const [items, setItems] = useState<GridItem[]>(initialItems || []);
  const [loading, setLoading] = useState(!initialItems || initialItems.length === 0);
  const shouldReduceMotion = useReducedMotion();

  const defaultTitle = source === 'category' ? 'SHOP BY CATEGORY' : 'SHOP BY APPLICATION';

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const endpoint = source === 'category' ? '/api/categories' : '/api/use-cases';
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          const list = source === 'category' ? data.categories : data.useCases;
          setItems(list || []);
        }
      } catch (err) {
        console.error(`Failed to load ${source} items:`, err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [source, initialItems]);

  const getHref = (item: GridItem) => {
    return source === 'category' ? `/category/${item.slug}` : `/use/${item.slug}`;
  };

  const getImageSrc = (item: GridItem) => {
    return item.placeholderImage || item.image || '/images/products/default-product.png';
  };

  return (
    <motion.section
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="py-12 sm:py-14 bg-white"
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase inline-block relative">
            {title || defaultTitle}
            <span className="block w-12 h-1 bg-red-600 rounded-full mx-auto mt-2.5" />
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-500 max-w-xl mx-auto mt-3 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Loading {source === 'category' ? 'categories' : 'applications'}...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 w-full">
            {items.map((item, idx) => {
              const href = getHref(item);
              const imgSrc = getImageSrc(item);

              return (
                <motion.div
                  key={item._id}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: shouldReduceMotion ? 0 : Math.min(idx * 0.04, 0.28),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                  className="flex"
                >
                  <Link
                    href={href}
                    className="group flex flex-col justify-between w-full bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.08)] hover:border-red-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all duration-300"
                    aria-label={`Explore ${item.name}`}
                  >
                    {/* Media frame */}
                    <div className="relative w-full aspect-16/11 rounded-xl overflow-hidden bg-slate-900 shadow-inner">
                      <Image
                        src={imgSrc}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
                        className="object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-between flex-1 pt-3 pb-1 text-center">
                      <h3 className="text-xs sm:text-[13px] font-bold text-slate-800 group-hover:text-red-600 line-clamp-2 leading-snug transition-colors duration-200">
                        {item.name}
                      </h3>
                      <div className="inline-flex items-center justify-center gap-1 mt-2 text-[11px] font-semibold text-slate-400 group-hover:text-red-600 transition-colors duration-200">
                        <span>Explore</span>
                        <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.section>
  );
}
