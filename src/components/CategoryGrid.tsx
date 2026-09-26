'use client';

/**
 * @file CategoryGrid.tsx
 * @description Modern responsive card grid component for homepage.
 * Reusable for both "Shop by Category" and "Shop by Application" (Use Cases)
 * per docs/08-homepage-layout.md and docs/09-design-motion-guidelines.md.
 * Links to /category/[slug] or /use/[slug].
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

/**
 * CategoryGrid Component.
 * Displays interactive cards for categories or application use-cases.
 */
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

  const gridCols = Math.min(items.length || 7, 7);

  return (
    <section className="category-grid-section">
      <div className="container">
        {/* Section Heading */}
        <div className="category-section-header">
          <h2 className="category-section-title">
            {title || defaultTitle}
          </h2>
          {subtitle && (
            <p className="category-section-subtitle">{subtitle}</p>
          )}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="category-loading-state">
            Loading {source === 'category' ? 'categories' : 'applications'}...
          </div>
        ) : (
          <div
            className="category-cards-grid"
            style={{ '--cards-cols': gridCols } as React.CSSProperties}
          >
            {items.map((item) => {
              const href = getHref(item);
              const imgSrc = getImageSrc(item);

              return (
                <motion.div
                  key={item._id}
                  className="category-card-col"
                  whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={href}
                    className="home-category-card"
                    aria-label={`Explore ${item.name}`}
                  >
                    {/* Card Media / Image Frame */}
                    <div className="category-card-media">
                      <Image
                        src={imgSrc}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1180px) 25vw, 15vw"
                        style={{
                          objectFit: 'cover',
                          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                        className="category-card-img"
                      />
                      <div className="category-card-media-overlay" />
                    </div>

                    {/* Card Body */}
                    <div className="category-card-body">
                      <h3 className="category-card-name">
                        {item.name}
                      </h3>
                      <span className="category-card-cta">
                        <span>Explore</span>
                        <ArrowRight size={13} className="category-card-arrow" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .category-grid-section {
          padding: 52px 0;
          background: var(--bg-primary, #FFFFFF);
        }

        .category-section-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .category-section-title {
          font-size: clamp(1.6rem, 2.8vw, 2.1rem);
          font-weight: 900;
          letter-spacing: -0.025em;
          color: var(--text-main, #0F172A);
          text-transform: uppercase;
          margin: 0;
          display: inline-block;
          position: relative;
        }

        .category-section-title::after {
          content: '';
          display: block;
          width: 48px;
          height: 3px;
          background: #DC2626;
          margin: 10px auto 0;
          border-radius: 2px;
        }

        .category-section-subtitle {
          color: var(--text-muted, #475569);
          font-size: 0.95rem;
          max-width: 640px;
          margin: 12px auto 0;
          line-height: 1.5;
        }

        .category-loading-state {
          text-align: center;
          padding: 48px 0;
          color: var(--text-dim, #94A3B8);
          font-size: 0.95rem;
        }

        .category-cards-grid {
          display: grid;
          grid-template-columns: repeat(var(--cards-cols, 7), 1fr);
          gap: 16px;
          width: 100%;
        }

        .category-card-col {
          display: flex;
          min-width: 0;
        }

        .home-category-card {
          display: flex;
          flex-direction: column;
          width: 100%;
          background: var(--bg-card, #FFFFFF);
          border: 1px solid var(--border-subtle, #E2E8F0);
          border-radius: 12px;
          padding: 10px;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          overflow: hidden;
        }

        .home-category-card:hover {
          border-color: #DC2626;
          box-shadow: 0 10px 25px -5px rgba(220, 38, 38, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
        }

        .home-category-card:focus-visible {
          outline: 2px solid #DC2626;
          outline-offset: 2px;
        }

        .category-card-media {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 11;
          border-radius: 8px;
          overflow: hidden;
          background: #0F172A;
        }

        .home-category-card:hover :global(.category-card-img) {
          transform: scale(1.06);
        }

        .category-card-media-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.35) 100%);
          pointer-events: none;
        }

        .category-card-body {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
          padding: 12px 4px 4px;
          text-align: center;
        }

        .category-card-name {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-main, #0F172A);
          line-height: 1.35;
          margin: 0 0 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.2s ease;
        }

        .home-category-card:hover .category-card-name {
          color: #DC2626;
        }

        .category-card-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted, #64748B);
          transition: color 0.2s ease;
        }

        :global(.category-card-arrow) {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .home-category-card:hover :global(.category-card-arrow) {
          transform: translateX(4px);
        }

        .home-category-card:hover .category-card-cta {
          color: #DC2626;
        }

        @media (max-width: 1180px) {
          .category-cards-grid {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 14px;
          }
        }

        @media (max-width: 640px) {
          .category-cards-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .category-card-name {
            font-size: 0.82rem;
          }
          .category-section-title {
            font-size: 1.5rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .home-category-card:hover :global(.category-card-img),
          .home-category-card:hover :global(.category-card-arrow) {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
