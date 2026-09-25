'use client';

/**
 * @file page.tsx
 * @route /cart
 * @access Registered user, Admin (Auth required) per Section 2 & 3
 * @description Persistent trade shopping cart view.
 * Redirects guests to /login?redirect=/cart per Section 3.
 * Enables quantity adjustments and line-item removals synced to MongoDB.
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getProductImageUrl, handleImageError } from '@/lib/imageFallback';

/**
 * CartPage Component.
 */
export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isPriceVerified, loading: authLoading } = useAuth();
  const { items, subtotal, updateQuantity, removeFromCart, loading: cartLoading } = useCart();

  // Auth Guard: redirect unauthenticated guests per Section 3
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/cart');
    }
  }, [authLoading, isAuthenticated, router]);

  // Show loading spinner while determining session
  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0', color: 'var(--text-muted)' }}>
        Verifying trade session...
      </div>
    );
  }

  // If unauthenticated, show redirection placeholder
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0', color: 'var(--text-muted)' }}>
        Redirecting to trade login...
      </div>
    );
  }

  // Pending Trade Verification Screen: prevent unverified carts
  if (!isPriceVerified) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', maxWidth: '560px', margin: '0 auto' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-amber-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--color-amber)',
          }}
        >
          <Clock size={28} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>
          Trade Account Verification Pending
        </h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
          Your contractor trade account is registered, but wholesale rates and cart purchasing require administrator approval. Contact our sales desk for immediate project clearance.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a
            href="https://wa.me/919811054321?text=Hello%20Malik%20Hardware%20Mart,%20please%20approve%20my%20wholesale%20trade%20account."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            WhatsApp Support: +91 98110 54321
          </a>
          <Link href="/products" className="btn-secondary">
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Calculate estimated 18% GST and gross order total
  const estimatedTax = Math.round(subtotal * 0.18);
  const estimatedTotal = subtotal + estimatedTax;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
            <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
            <span>/</span>
            <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>Trade Cart</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>Wholesale Purchase Cart</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Review selected hardware items, adjust quantities, and generate delivery order.
          </p>
        </div>

        {items.length === 0 ? (
          // Empty Cart State
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-medium)',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-amber-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                color: 'var(--color-amber)',
              }}
            >
              <ShoppingCart size={32} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
              Your trade cart is currently empty
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Browse our catalog of power tools, structural fasteners, and commercial fittings to add items.
            </p>
            <Link href="/products" className="btn-primary" style={{ padding: '12px 28px' }}>
              <span>Explore Wholesale Catalog</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          // Cart Items and Summary Grid
          <div className="cart-layout">
            {/* Items List Card */}
            <div className="cart-items-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  Line Items ({items.reduce((acc, curr) => acc + curr.quantity, 0)})
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Server Synced
                </span>
              </div>

              {items.map((item) => {
                const product = item.product || {};
                const imageUrl = getProductImageUrl(
                  product.imageUrl,
                  product.category?.slug,
                  product.category?.placeholderImage
                );

                return (
                  <div key={item._id} className="cart-item-row">
                    {/* Item Image */}
                    <Link href={`/products/${product.slug}`}>
                      <img
                        src={imageUrl}
                        alt={product.name || 'Hardware Product'}
                        className="cart-item-image"
                        onError={handleImageError}
                      />
                    </Link>

                    {/* Item Info */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-amber)', textTransform: 'uppercase' }}>
                        {product.brand}
                      </div>
                      <Link
                        href={`/products/${product.slug}`}
                        style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', margin: '2px 0 6px' }}
                      >
                        {product.name}
                      </Link>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        Unit Price: ₹{item.unitPrice.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="qty-control">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateQuantity(item._id, Math.max(0, item.quantity - 1))}
                        disabled={cartLoading}
                      >
                        <Minus size={13} />
                      </button>
                      <span className="qty-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={cartLoading}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Line Total & Remove Action */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-amber)' }}>
                        ₹{item.lineTotal.toLocaleString('en-IN')}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id)}
                        disabled={cartLoading}
                        style={{
                          background: 'transparent',
                          color: 'var(--color-rose)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px' }}>
                <Link
                  href="/products"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Continue Shopping</span>
                </Link>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Cart is saved to your account across sessions
                </div>
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="cart-summary-card">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>
                Trade Invoice Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Net Taxable Value</span>
                  <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated GST (18%)</span>
                  <span style={{ fontWeight: 600 }}>₹{estimatedTax.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Freight & Handling</span>
                  <span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>To be calculated at dispatch</span>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Estimated Total</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-amber)' }}>
                      ₹{estimatedTotal.toLocaleString('en-IN')}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Inclusive of all taxes</span>
                  </div>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="btn-primary"
                style={{ width: '100%', padding: '14px 20px', fontSize: '1rem', marginBottom: '16px' }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </Link>

              {/* Assurance Badges */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--color-amber)' }} />
                  <span>GST Invoice generated with your GSTIN</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  <Truck size={16} style={{ color: 'var(--color-amber)' }} />
                  <span>Dispatched via verified freight partners</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
