'use client';

/**
 * @file CategoryClientListing.tsx
 * @description Client component for category products listing.
 * Syncs with /api/products?category=... to respect Section 7 server-side price gating.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Lock, Check } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  // PRICE GATE: do not send price to unauthenticated requests
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
 * CategoryClientListing Component.
 */
export default function CategoryClientListing({
  categorySlug,
}: {
  categorySlug: string;
}) {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryProducts() {
      try {
        setLoading(true);
        // Server-side price gate is evaluated in this API call
        const res = await fetch(`/api/products?category=${categorySlug}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to load category products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCategoryProducts();
  }, [categorySlug, isAuthenticated]);

  return (
    <div>
      {/* Auth Status Notice */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--text-main)' }}>{products.length}</strong> catalog items
        </div>

        {!isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-amber)' }}>
            <Lock size={14} />
            <span>Prices are hidden for guests</span>
            <Link
              href={`/login?redirect=/category/${categorySlug}`}
              className="btn-outline-amber"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            >
              Login
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-emerald)' }}>
            <Check size={14} />
            <span>Wholesale Trade Rates Active</span>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          Loading products in this category...
        </div>
      ) : products.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-medium)',
          }}
        >
          <Package size={40} style={{ color: 'var(--color-amber)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
            No products in this category yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Check back soon or explore our other divisions.
          </p>
          <Link href="/products" className="btn-primary">
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
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
  );
}
