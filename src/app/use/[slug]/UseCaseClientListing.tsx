'use client';

/**
 * @file UseCaseClientListing.tsx
 * @description Client component for use case products listing.
 * Syncs with /api/products?useCase=... to respect Section 7 server-side price gating.
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
 * UseCaseClientListing Component.
 */
export default function UseCaseClientListing({
  useCaseSlug,
}: {
  useCaseSlug: string;
}) {
  const { isAuthenticated, isPriceVerified } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUseCaseProducts() {
      try {
        setLoading(true);
        // Server-side price gate is evaluated in this API call
        const res = await fetch(`/api/products?useCase=${useCaseSlug}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to load use case products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUseCaseProducts();
  }, [useCaseSlug, isAuthenticated, isPriceVerified]);

  return (
    <div>
      {/* Notice Banner */}
      {!isAuthenticated && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={18} style={{ color: 'var(--color-amber)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Wholesale pricing and bulk checkout are reserved for registered commercial contractors.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/login" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              Apply for Account
            </Link>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          Loading products for this application...
        </div>
      ) : products.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Package size={48} style={{ color: 'var(--border-medium)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
            No Products Currently Listed
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
            Our hardware desk is expanding items tagged for this specific application.
          </p>
          <Link href="/products" className="btn btn-primary">
            Browse Full Catalog
          </Link>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '18px', fontSize: '0.88rem', color: 'var(--text-dim)' }}>
            Showing <strong>{products.length}</strong> items engineered for this application
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
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
        </div>
      )}
    </div>
  );
}
