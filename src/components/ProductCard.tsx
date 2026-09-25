'use client';

/**
 * @file ProductCard.tsx
 * @description Catalog product card with Section 5 image fallback and Section 7 price gating.
 * When guest: renders locked pricing indicator with CTA redirecting to /login?redirect=...
 * When authenticated: renders wholesale trade price and instant Add to Cart action.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, ShoppingCart, Check, ArrowRight, Clock } from 'lucide-react';
import { getProductImageUrl, handleImageError } from '@/lib/imageFallback';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  brand: string;
  // PRICE GATE: do not send price to unauthenticated requests
  // Server-side stripped on unauthenticated requests; will be undefined for guests
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
 * ProductCard component for catalog and category grids.
 */
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

  // Stock status pill styling helper
  const getStockClass = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'product-badge-stock stock-in';
      case 'out_of_stock':
        return 'product-badge-stock stock-out';
      case 'on_request':
        return 'product-badge-stock stock-request';
      default:
        return 'product-badge-stock stock-in';
    }
  };

  const getStockLabel = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'In Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      case 'on_request':
        return 'On Request';
      default:
        return 'In Stock';
    }
  };

  return (
    <div className="product-card">
      {/* Product Image with Fallback */}
      <div className="product-card-image-wrap">
        <Link href={`/products/${slug}`}>
          <img
            src={resolvedImageUrl}
            alt={name}
            className="product-card-image"
            onError={handleImageError}
            loading="lazy"
          />
        </Link>
        <span className={getStockClass(stockStatus)}>
          {getStockLabel(stockStatus)}
        </span>
      </div>

      {/* Card Content Body */}
      <div className="product-card-content">
        <span className="product-brand">{brand}</span>

        <h3 className="product-title">
          <Link href={`/products/${slug}`} title={name}>
            {name}
          </Link>
        </h3>

        {/* Short Specs Preview (Top 2 attributes) */}
        {specs && specs.length > 0 && (
          <div className="product-specs-preview">
            {specs.slice(0, 2).map((sp, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{sp.key}:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{sp.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Card Footer with Price Gate */}
        <div className="product-card-footer">
          {/* PRICE GATE: do not send price to unauthenticated requests */}
          {isAuthenticated && typeof price === 'number' ? (
            // Logged-in & Verified: Reveal price & Add to Cart button
            <>
              <div className="price-unlocked-row">
                <div className="price-val-wrapper">
                  <span className="price-label">Trade Wholesale</span>
                  <div className="price-val">₹{price.toLocaleString('en-IN')}</div>
                </div>
                <span className="tax-badge">+ 18% GST</span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || stockStatus === 'out_of_stock'}
                className="btn-primary"
                style={{ width: '100%', padding: '8px 14px' }}
              >
                {added ? (
                  <>
                    <Check size={15} />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={15} />
                    <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                  </>
                )}
              </button>
            </>
          ) : isAuthenticated && !isPriceVerified ? (
            // Logged-in BUT Pending Verification: Show approval pending notice
            <div
              style={{
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                borderRadius: 'var(--radius-md)',
                padding: '9px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.78rem',
              }}
            >
              <Clock size={15} style={{ color: '#B45309', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#92400E' }}>Rates Pending Approval</div>
                <div style={{ color: '#B45309', fontSize: '0.7rem' }}>Awaiting admin verification</div>
              </div>
            </div>
          ) : (
            // Guest state: Price locked; redirect on click to Login per Section 2 & 4.1
            <div className="price-locked-box">
              <div className="price-locked-text">
                <div className="price-locked-heading">
                  <Lock size={13} />
                  <span>Wholesale Rates Locked</span>
                </div>
                <span className="price-locked-sub">Sign in to view pricing</span>
              </div>

              <Link
                href={`/login?redirect=/products/${slug}`}
                className="btn-outline-amber"
                style={{ fontSize: '0.75rem', padding: '5px 10px', whiteSpace: 'nowrap' }}
              >
                <span>Login</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
