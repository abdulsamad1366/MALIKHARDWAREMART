'use client';

/**
 * @file CategoryGrid.tsx
 * @description Circular icon/thumbnail grid component for homepage.
 * Reusable for both "Shop by Category" and "Shop by Use" per docs/08-homepage-layout.md sections 2 & 4.
 * Links to /category/[slug] or /use/[slug].
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Layers, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

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
 */
export default function CategoryGrid({
  source = 'category',
  title,
  subtitle,
  items: initialItems,
}: CategoryGridProps) {
  const [items, setItems] = useState<GridItem[]>(initialItems || []);
  const [loading, setLoading] = useState(!initialItems || initialItems.length === 0);

  const defaultTitle = source === 'category' ? 'SHOP BY CATEGORY' : 'SHOP BY APPLICATION';
  const defaultSubtitle =
    source === 'category'
      ? 'Direct warehouse access to all 7 primary industrial hardware & tooling divisions'
      : 'Browse fasteners, tools, and hardware engineered for specific site and engineering environments';

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
    <section style={{ padding: '48px 0', background: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Section Heading */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--color-amber)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '8px',
            }}
          >
            {source === 'category' ? <Layers size={13} /> : <Compass size={13} />}
            <span>{source === 'category' ? 'Hardware Taxonomy' : 'Application Contexts'}</span>
          </div>

          <h2
            style={{
              fontSize: '1.9rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: 'var(--text-main)',
              margin: '0 0 8px',
              textTransform: 'uppercase',
            }}
          >
            {title || defaultTitle}
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.96rem',
              maxWidth: '640px',
              margin: '0 auto',
              lineHeight: 1.5,
            }}
          >
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {/* Circular Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
            Loading {source === 'category' ? 'categories' : 'use cases'}...
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '24px 32px',
              padding: '8px 0',
            }}
          >
            {items.map((item) => {
              const href = getHref(item);
              const imgSrc = getImageSrc(item);

              return (
                <motion.div
                  key={item._id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={href}
                    className="category-circle-item"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textDecoration: 'none',
                      width: '136px',
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Circle Image Frame */}
                    <div
                      style={{
                        width: '110px',
                        height: '110px',
                        borderRadius: '50%',
                        background: 'var(--bg-secondary)',
                        border: '2px solid var(--border-medium)',
                        padding: '4px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.25s ease',
                      }}
                      className="circle-frame"
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          background: '#FFFFFF',
                        }}
                      >
                        <Image
                          src={imgSrc}
                          alt={item.name}
                          fill
                          sizes="110px"
                          style={{
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                          }}
                          className="circle-img"
                        />
                      </div>
                    </div>

                    {/* Label Centered Below */}
                    <span
                      style={{
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        transition: 'color var(--transition-fast)',
                      }}
                      className="circle-label"
                    >
                      {item.name}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .category-circle-item:hover .circle-frame {
          border-color: var(--color-amber);
          box-shadow: 0 6px 16px rgba(217, 119, 6, 0.2);
        }
        .category-circle-item:hover .circle-img {
          transform: scale(1.08);
        }
        .category-circle-item:hover .circle-label {
          color: var(--color-amber);
        }
      `}</style>
    </section>
  );
}
