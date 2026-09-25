'use client';

/**
 * @file page.tsx
 * @route /
 * @description Homepage of Malik Hardware Mart.
 * Displays the hero banner, trust signals, featured categories grid,
 * and featured hardware products with Section 7 server-side price gating.
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
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import { useAuth } from '@/context/AuthContext';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  placeholderImage?: string;
}

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
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories and featured products from server API
  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        // Load categories
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catData.success) {
          setCategories(catData.categories || []);
        }

        // Load featured products (PRICE GATE enforced server-side inside /api/products)
        const prodRes = await fetch('/api/products?featured=true&limit=8');
        const prodData = await prodRes.json();
        if (prodData.success) {
          setFeaturedProducts(prodData.products || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, [isAuthenticated]); // Re-fetch when auth state changes so prices unlock instantly

  return (
    <div>
      {/* Hero Banner Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-pill">
              <Shield size={14} />
              <span>Direct Wholesale Distributor</span>
            </div>

            <h1 className="hero-title">
              Heavy Duty <span>Industrial Hardware</span> & Power Tools
            </h1>

            <p className="hero-description">
              India’s trusted supplier for high tensile fasteners, structural fittings,
              commercial electrical switchgear, CPVC piping, and contractor equipment.
              Trade pricing reserved for verified builders and industrial buyers.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '8px' }}>
              <Link href="/products" className="btn-primary" style={{ padding: '12px 26px', fontSize: '1rem' }}>
                <span>Explore Catalog</span>
                <ArrowRight size={18} />
              </Link>
              {!isAuthenticated && (
                <Link href="/login" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                  <Lock size={16} style={{ color: 'var(--color-amber)' }} />
                  <span>Login to View Pricing</span>
                </Link>
              )}
            </div>

            {/* Trust Points */}
            <div className="hero-features">
              <div className="hero-feature-item">
                <CheckCircle size={16} className="hero-feature-icon" />
                <span>GST Tax Invoicing</span>
              </div>
              <div className="hero-feature-item">
                <Truck size={16} className="hero-feature-icon" />
                <span>Nationwide Bulk Dispatch</span>
              </div>
              <div className="hero-feature-item">
                <FileText size={16} className="hero-feature-icon" />
                <span>OEM Test Certificates</span>
              </div>
            </div>
          </div>

          {/* Hero Warehouse Display Image */}
          <div className="hero-image-wrapper">
            <img
              src="/images/products/default-product.jpg"
              alt="Malik Hardware Mart Warehouse"
              className="hero-image"
              onError={(e) => {
                e.currentTarget.src = '/images/products/default-product.png';
              }}
            />
            <div className="hero-image-overlay">
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-amber)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Stock Hub Delhi
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Ready Dispatch Inventory</div>
              </div>
              <span className="stock-in" style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                10,000+ SKUs Active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Wholesale Hardware Categories</h2>
              <p className="section-subtitle">
                Select a division to inspect specs, technical standards, and available stock
              </p>
            </div>
            <Link href="/products" className="btn-outline-amber" style={{ fontSize: '0.85rem' }}>
              <span>View All Categories</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <CategoryCard
                key={category._id}
                id={category._id}
                name={category.name}
                slug={category.slug}
                description={category.description}
                placeholderImage={category.placeholderImage}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Grid Section */}
      <section style={{ padding: '60px 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="top-notice-badge">Featured Dispatch</span>
                {!isAuthenticated && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-amber)', fontWeight: 600 }}>
                    • Trade Pricing Hidden For Guests
                  </span>
                )}
              </div>
              <h2 className="section-title">Spotlight Trade Inventory</h2>
              <p className="section-subtitle">
                High-demand industrial tools and structural hardware ready for instant site delivery
              </p>
            </div>
            <Link href="/products" className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              <span>Full Catalog ({featuredProducts.length} Items)</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              Loading wholesale inventory...
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

      {/* B2B Trade Call-To-Action Banner */}
      {!isAuthenticated && (
        <section style={{ padding: '70px 0' }}>
          <div className="container">
            <div
              style={{
                background: 'linear-gradient(135deg, #131D31 0%, #1A2642 100%)',
                border: '1px solid var(--color-amber)',
                borderRadius: 'var(--radius-lg)',
                padding: '48px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '28px',
                boxShadow: 'var(--shadow-amber)',
              }}
            >
              <div style={{ maxWidth: '640px' }}>
                <div style={{ color: 'var(--color-amber)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Trade Account Benefits
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
                  Register Your Business To Unlock Wholesale Pricing
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Direct access to tiered contractor discounts, GST compliant invoices,
                  custom bulk delivery scheduling, and persistent trade cart management.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link href="/register" className="btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
                  Create Account
                </Link>
                <Link href="/login" className="btn-secondary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
