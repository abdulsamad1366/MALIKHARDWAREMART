'use client';

/**
 * @file page.tsx
 * @route /
 * @description Homepage of Malik Hardware Mart.
 * Structured per docs/08-homepage-layout.md:
 * 1. Full-width Hero Carousel
 * 2. "Shop by Category" Circular Grid
 * 3. Promo Banner Strip (Row 1)
 * 4. "Shop by Use" Circular Grid
 * 5. Promo Banner Strip (Row 2)
 * 6. Featured Products Grid (with Section 7 server-side price gating)
 * 7. Institutional Contractor Trust Signals & B2B Trade Callout
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  Truck,
  CheckCircle,
  FileText,
  Lock,
  Sparkles,
  Building2,
  Clock,
  Award,
} from 'lucide-react';
import HeroCarousel from '@/components/HeroCarousel';
import CategoryGrid from '@/components/CategoryGrid';
import PromoBannerStrip from '@/components/PromoBannerStrip';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';

interface ProductItem {
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

/**
 * Homepage Component.
 */
export default function HomePage() {
  const { isAuthenticated, isPriceVerified } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured products from server API
  useEffect(() => {
    async function loadFeatured() {
      try {
        setLoading(true);
        // Server-side price gate is evaluated in this API call
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
    <div style={{ background: 'var(--bg-primary)' }}>
      {/* 1. Full-Width Edge-To-Edge Hero Carousel */}
      <HeroCarousel />

      {/* 2. "Shop by Category" Circular Grid */}
      <CategoryGrid source="category" />

      {/* 3. Promo Banner Strip (Row 1: Banners 0-2) */}
      <PromoBannerStrip startIndex={0} limit={3} />

      {/* 4. "Shop by Use" Circular Grid */}
      <CategoryGrid source="useCase" />

      {/* 5. Promo Banner Strip (Row 2: Banners 3-5) */}
      <PromoBannerStrip startIndex={3} limit={3} />

      {/* 6. Featured Products Grid Section */}
      <section
        style={{
          padding: '60px 0',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div className="section-header" style={{ marginBottom: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    background: 'var(--color-amber-bg)',
                    color: 'var(--color-amber)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-full)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Spotlight Inventory
                </span>
                {!isAuthenticated && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                    • Trade Pricing Hidden For Guests
                  </span>
                )}
              </div>
              <h2 className="section-title" style={{ fontSize: '2rem', fontWeight: 900 }}>
                High-Demand Industrial Fasteners & Power Tools
              </h2>
              <p className="section-subtitle" style={{ color: 'var(--text-muted)' }}>
                Certified contractor-grade inventory ready for same-day dispatch from our Central Delhi logistics hub.
              </p>
            </div>
            <Link href="/products" className="btn btn-outline" style={{ fontSize: '0.86rem' }}>
              <span>View Full Catalog</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              Loading featured inventory...
            </div>
          ) : (
            <div className="products-grid">
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
      </section>

      {/* 7. Institutional Trust Signals & Contractor B2B Callout */}
      <section style={{ padding: '56px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          {/* Trust badges row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              marginBottom: '48px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-amber)', flexShrink: 0 }}>
                <Truck size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-main)' }}>
                  Same-Day Site Freight
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Dedicated fleet dispatch across Delhi-NCR & Northern industrial corridors.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-amber)', flexShrink: 0 }}>
                <FileText size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-main)' }}>
                  100% GST ITC Invoicing
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Automated GSTR-2B compliance & E-Way bills generated per consignment.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-amber)', flexShrink: 0 }}>
                <Award size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-main)' }}>
                  3.1 Mill Test Certificates
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Chemical analysis & proof-load certified for structural PEB compliance.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-amber)', flexShrink: 0 }}>
                <Building2 size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-main)' }}>
                  Direct Factory Tie-ups
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Authorized wholesale channels for Bosch, Tata Steel, Hilti, Fischer.
                </p>
              </div>
            </div>
          </div>

          {/* Guest B2B Trade Call-To-Action Banner */}
          {!isAuthenticated && (
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '40px 48px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '24px',
              }}
            >
              <div style={{ maxWidth: '640px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--color-amber)',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '8px',
                  }}
                >
                  <Lock size={12} /> Commercial Trade Desk
                </span>
                <h3 style={{ fontSize: '1.65rem', fontWeight: 900, marginBottom: '8px', color: 'var(--text-main)' }}>
                  Register Your Trade Account To Unlock Wholesale Rates
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.6, margin: 0 }}>
                  Institutional pricing, bulk carton discount slabs, credit terms, and project consignments are gated behind trade verification.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link href="/register" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
                  Register Commercial Account
                </Link>
                <Link href="/login" className="btn btn-outline" style={{ padding: '12px 20px', fontSize: '0.95rem' }}>
                  Contractor Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
