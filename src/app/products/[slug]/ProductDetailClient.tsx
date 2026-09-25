'use client';

/**
 * @file ProductDetailClient.tsx
 * @description Interactive client view for product detail page.
 * Re-queries /api/products/[slug] with active session cookies so price unlocks
 * seamlessly when user logs in, while strictly keeping price hidden from guests.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  ArrowRight,
  Plus,
  Minus,
  FileCheck,
  Clock,
  PhoneCall,
} from 'lucide-react';
import { getProductImageUrl, handleImageError } from '@/lib/imageFallback';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface ProductSpec {
  key: string;
  value: string;
}

interface ProductData {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  specs: ProductSpec[];
  imageUrl?: string | null;
  // PRICE GATE: do not send price to unauthenticated requests
  price?: number;
  stockStatus: 'in_stock' | 'out_of_stock' | 'on_request';
  category?: {
    name: string;
    slug: string;
    placeholderImage?: string;
  };
}

interface ProductDetailClientProps {
  slug: string;
  initialProduct: ProductData;
}

/**
 * ProductDetailClient Component.
 */
export default function ProductDetailClient({
  slug,
  initialProduct,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { isAuthenticated, isPriceVerified } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductData>(initialProduct);
  const [quantity, setQuantity] = useState<number>(1);
  const [adding, setAdding] = useState<boolean>(false);
  const [added, setAdded] = useState<boolean>(false);

  // Fetch product from /api/products/[slug] to apply server-side price gate based on auth & verification
  useEffect(() => {
    async function syncProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
        }
      } catch (err) {
        console.error('Failed to sync product data:', err);
      }
    }

    syncProduct();
  }, [slug, isAuthenticated, isPriceVerified]);

  // Compute fallback image per Section 5 policy
  const resolvedImageUrl = getProductImageUrl(
    product.imageUrl,
    product.category?.slug,
    product.category?.placeholderImage
  );

  /**
   * Handles Add to Cart action.
   */
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${slug}`);
      return;
    }
    if (!isPriceVerified) {
      alert('Your contractor trade account is pending administrator verification. Rates and purchasing will activate upon verification.');
      return;
    }

    setAdding(true);
    const res = await addToCart(product._id, quantity);
    setAdding(false);

    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  };

  /**
   * Handles Instant Checkout ("Buy Now").
   */
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${slug}`);
      return;
    }
    if (!isPriceVerified) {
      alert('Your contractor trade account is pending administrator verification. Rates and purchasing will activate upon verification.');
      return;
    }

    setAdding(true);
    await addToCart(product._id, quantity);
    setAdding(false);
    router.push('/cart');
  };

  return (
    <div className="product-detail-layout">
      {/* Product Image Gallery Column */}
      <div className="product-gallery">
        <div className="product-main-image-wrap">
          <img
            src={resolvedImageUrl}
            alt={product.name}
            className="product-main-image"
            onError={handleImageError}
          />
        </div>

        {/* OEM Quality Guarantee Box */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            textAlign: 'center',
          }}
        >
          <div>
            <ShieldCheck size={20} style={{ color: 'var(--color-amber)', margin: '0 auto 4px' }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>100% Original</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Genuine Manufacturer</div>
          </div>
          <div>
            <Truck size={20} style={{ color: 'var(--color-amber)', margin: '0 auto 4px' }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Heavy Freight</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Site Delivery Available</div>
          </div>
          <div>
            <FileCheck size={20} style={{ color: 'var(--color-amber)', margin: '0 auto 4px' }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Test Certificate</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>MTC on Request</div>
          </div>
        </div>
      </div>

      {/* Product Information & Price Gate Column */}
      <div className="product-info-panel">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="product-brand" style={{ fontSize: '0.85rem' }}>{product.brand}</span>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              SKU: MHM-{product._id.slice(-6).toUpperCase()}
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.25, marginBottom: '14px' }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              className={`product-badge-stock ${
                product.stockStatus === 'in_stock'
                  ? 'stock-in'
                  : product.stockStatus === 'out_of_stock'
                  ? 'stock-out'
                  : 'stock-request'
              }`}
              style={{ position: 'static' }}
            >
              {product.stockStatus === 'in_stock'
                ? 'In Stock — Ready to Dispatch'
                : product.stockStatus === 'out_of_stock'
                ? 'Temporarily Out of Stock'
                : 'Available on Order'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Delhi Central Warehouse
            </span>
          </div>
        </div>

        {/* PRICE GATE: Locked vs Unlocked Presentation per Section 4.1, 4.2 & 7 */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
          }}
        >
          {/* PRICE GATE: Locked vs Pending vs Verified Presentation per Section 4.1, 4.2 & 7 */}
          {isAuthenticated && isPriceVerified && typeof product.price === 'number' ? (
            // Authenticated & Verified Trade Account: Price Unlocked
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <span className="price-label">Wholesale Trade Price (Excl. Tax)</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '4px' }}>
                  <div className="price-val" style={{ fontSize: '2.4rem' }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </div>
                  <span className="tax-badge" style={{ fontSize: '0.85rem' }}>
                    + 18% GST Applicable (Input Tax Credit)
                  </span>
                </div>
              </div>

              {/* Quantity Selector and Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Quantity</span>
                  <div className="qty-control">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      className="qty-input"
                      value={quantity}
                      min="1"
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    />
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setQuantity((q) => q + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flex: 1, paddingTop: '20px', minWidth: '240px' }}>
                  <button
                    onClick={handleAddToCart}
                    disabled={adding || product.stockStatus === 'out_of_stock'}
                    className="btn-primary"
                    style={{ flex: 1, padding: '12px 20px', fontSize: '1rem' }}
                  >
                    {added ? (
                      <>
                        <Check size={18} />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} />
                        <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={adding || product.stockStatus === 'out_of_stock'}
                    className="btn-secondary"
                    style={{ padding: '12px 20px', fontSize: '1rem' }}
                  >
                    <span>Instant Checkout</span>
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} style={{ color: 'var(--color-emerald)' }} />
                <span>Line total: ₹{(product.price * quantity).toLocaleString('en-IN')} (Saved to persistent cart)</span>
              </div>
            </div>
          ) : isAuthenticated && !isPriceVerified ? (
            // Authenticated but Pending Verification: Price Pending Admin Review
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-amber-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-amber)',
                    flexShrink: 0,
                  }}
                >
                  <Clock size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-amber)', marginBottom: '4px' }}>
                    Pricing Pending Admin Approval
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Your contractor trade account is active, but wholesale pricing privileges are awaiting administrator approval. We verify business credentials and GSTIN to maintain wholesale integrity.
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Need urgent pricing for an ongoing project quotation?
                </div>
                <a
                  href="https://wa.me/919811054321?text=Hello%20Malik%20Hardware%20Mart,%20please%20approve%20my%20wholesale%20trade%20account."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <PhoneCall size={14} />
                  <span>WhatsApp: +91 98110 54321</span>
                </a>
              </div>
            </div>
          ) : (
            // Guest User: Price Gate Locked
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-amber-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-amber)',
                    flexShrink: 0,
                  }}
                >
                  <Lock size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-amber)', marginBottom: '4px' }}>
                    Wholesale Trade Pricing Locked
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Malik Hardware Mart operates on a B2B contractor model.
                    To view volume discounts, net trade prices, and place purchase orders,
                    please sign in to your registered trade account.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '8px' }}>
                <Link
                  href={`/login?redirect=/products/${slug}`}
                  className="btn-primary"
                  style={{ padding: '10px 22px', fontSize: '0.9rem' }}
                >
                  <span>Login to View Price & Order</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/register"
                  className="btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                >
                  <span>Register Trade Account</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Technical Description */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>
            Product Overview & Application
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            {product.description}
          </p>
        </div>

        {/* Detailed Technical Specifications Table */}
        {product.specs && product.specs.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>
              Technical Specifications
            </h3>
            <table className="specs-table">
              <tbody>
                <tr>
                  <th>Manufacturer Brand</th>
                  <td>{product.brand}</td>
                </tr>
                {product.category && (
                  <tr>
                    <th>Category Division</th>
                    <td>{product.category.name}</td>
                  </tr>
                )}
                {product.specs.map((sp, idx) => (
                  <tr key={idx}>
                    <th>{sp.key}</th>
                    <td>{sp.value}</td>
                  </tr>
                ))}
                <tr>
                  <th>Compliance & Inspection</th>
                  <td>Standard Indian / International Industrial Norms</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
