'use client';

/**
 * @file PromoBannerStrip.tsx
 * @description Promotional banner strip component featuring 2-3 prominent rectangular tiles.
 * Sourced from PromoBanner model. Reusable before and after "Shop by Use" per docs/08-homepage-layout.md section 3.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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

/**
 * PromoBannerStrip Component.
 */
export default function PromoBannerStrip({
  banners: initialBanners,
  startIndex = 0,
  limit = 3,
}: PromoBannerStripProps) {
  const [banners, setBanners] = useState<PromoBannerItem[]>(initialBanners || []);
  const [loading, setLoading] = useState(!initialBanners || initialBanners.length === 0);

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
    <section style={{ padding: '24px 0 36px', background: 'var(--bg-primary)' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(290px, 1fr))`,
            gap: '20px',
          }}
        >
          {slicedBanners.map((banner) => (
            <motion.div
              key={banner._id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={banner.linkUrl}
                className="promo-tile"
                style={{
                  position: 'relative',
                  height: '180px',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '24px 28px',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  transition: 'box-shadow var(--transition-fast), border-color var(--transition-fast)',
                }}
              >
              {/* Background Product Image */}
              <div
                style={{
                  position: 'absolute',
                  right: '-10px',
                  bottom: '-10px',
                  width: '180px',
                  height: '180px',
                  opacity: 0.88,
                  zIndex: 1,
                  transition: 'transform 0.3s ease',
                }}
                className="promo-image-wrapper"
              >
                <Image
                  src={banner.image || '/images/products/default-product.png'}
                  alt={banner.title}
                  fill
                  sizes="180px"
                  style={{ objectFit: 'contain' }}
                />
              </div>

              {/* Gradient Overlay for Text Readability */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.85) 55%, rgba(255,255,255,0.2) 100%)',
                  zIndex: 2,
                }}
              />

              {/* Text & CTA */}
              <div style={{ position: 'relative', zIndex: 3, maxWidth: '62%' }}>
                {banner.badge && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'var(--color-amber-bg)',
                      color: 'var(--color-amber)',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: '8px',
                    }}
                  >
                    <Sparkles size={11} />
                    {banner.badge}
                  </span>
                )}

                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    lineHeight: 1.25,
                    marginBottom: '4px',
                  }}
                >
                  {banner.title}
                </h3>

                {banner.subtitle && (
                  <p
                    style={{
                      fontSize: '0.84rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.4,
                      marginBottom: '12px',
                    }}
                  >
                    {banner.subtitle}
                  </p>
                )}

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--color-amber)',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                  }}
                  className="promo-cta"
                >
                  <span>Shop Now</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .promo-tile:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--border-medium);
        }
        .promo-tile:hover .promo-image-wrapper {
          transform: scale(1.06) rotate(2deg);
        }
        .promo-tile:hover .promo-cta {
          gap: 9px;
        }
      `}</style>
    </section>
  );
}
