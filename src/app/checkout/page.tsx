'use client';

/**
 * @file page.tsx
 * @route /checkout
 * @access Registered user, Admin (Auth required) per Section 2 & 3
 * @description Checkout view collecting shipping destination, reviewing line items,
 * and generating an offline Trade Credit / COD order per Section 4.3.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface ShippingForm {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
}

/**
 * CheckoutPage Component.
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isPriceVerified, loading: authLoading } = useAuth();
  const { items, subtotal, refreshCart } = useCart();

  const [formData, setFormData] = useState<ShippingForm>({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: 'Delhi',
    postalCode: '',
    country: 'India',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auth Guard: redirect unauthenticated guests
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [authLoading, isAuthenticated, router]);

  // Pre-fill user details and default address if available
  useEffect(() => {
    if (user) {
      const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      setFormData((prev) => ({
        ...prev,
        fullName: defaultAddr?.fullName || user.name || '',
        phone: defaultAddr?.phone || user.phone || '',
        street: defaultAddr?.street || '',
        city: defaultAddr?.city || '',
        state: defaultAddr?.state || 'Delhi',
        postalCode: defaultAddr?.postalCode || '',
        country: defaultAddr?.country || 'India',
      }));
    }
  }, [user]);

  // Handle form field change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Submits the checkout order to /api/checkout.
   */
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName || !formData.phone || !formData.street || !formData.city || !formData.postalCode) {
      setErrorMsg('Please fill in all required shipping address fields.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          notes: formData.notes,
          saveAddress: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh local cart state to zero
        await refreshCart();
        // Redirect to single order detail confirmation page
        router.push(`/orders/${data.orderId}`);
      } else {
        setErrorMsg(data.message || 'Failed to place order. Please review details.');
      }
    } catch {
      setErrorMsg('Network error while processing your order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0', color: 'var(--text-muted)' }}>
        Loading checkout session...
      </div>
    );
  }

  // Pending Trade Verification Screen: prevent unverified orders
  if (isAuthenticated && !isPriceVerified) {
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
          Your wholesale trade account is awaiting administrator approval before purchase orders can be placed. We verify contractor credentials and GSTIN.
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

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>
          Your cart is empty
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Please add products to your cart before proceeding to checkout.
        </p>
        <Link href="/products" className="btn-primary">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const estimatedTax = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + estimatedTax;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
            <Link href="/cart" style={{ color: 'var(--text-muted)' }}>Cart</Link>
            <span>/</span>
            <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>Checkout</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>Place Purchase Order</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Provide delivery destination for official freight dispatch and tax billing.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'var(--color-rose-bg)',
              border: '1px solid var(--color-rose)',
              color: 'var(--color-rose)',
              padding: '14px 20px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'start' }}>
            {/* Left: Shipping & Billing Form */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                <MapPin size={22} style={{ color: 'var(--color-amber)' }} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Consignee & Site Address</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name / Contact Person *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="form-input"
                    placeholder="e.g. Rajesh Sharma"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number (Site Contact) *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="form-input"
                    placeholder="e.g. +91 98111 22334"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse / Site Street Address *</label>
                <input
                  type="text"
                  name="street"
                  required
                  className="form-input"
                  placeholder="Plot No., Industrial Area, Road Name"
                  value={formData.street}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    className="form-input"
                    placeholder="City / District"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    className="form-input"
                    placeholder="e.g. Delhi"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PIN / Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    className="form-input"
                    placeholder="e.g. 110020"
                    value={formData.postalCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Special Delivery / PO Number Notes (Optional)</label>
                <textarea
                  name="notes"
                  rows={3}
                  className="form-textarea"
                  placeholder="Enter PO reference, gate entry requirements, or unloading notes..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              {/* Payment Method Section */}
              <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <CreditCard size={20} style={{ color: 'var(--color-amber)' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Payment Terms</h3>
                </div>

                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--color-amber)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <CheckCircle2 size={20} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      Cash on Delivery / Offline Trade Credit
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Order created as &apos;Pending&apos;. Our dispatch desk will confirm freight and invoicing.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Review & Placement */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                position: 'sticky',
                top: '100px',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                Order Summary ({items.length} Products)
              </h2>

              <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '20px', paddingRight: '8px' }}>
                {items.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: '0.88rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {item.product.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--color-amber)' }}>
                      ₹{item.lineTotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Taxable Subtotal</span>
                  <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST (18% ITC Eligible)</span>
                  <span style={{ fontWeight: 600 }}>₹{estimatedTax.toLocaleString('en-IN')}</span>
                </div>
                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Total Payable</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-amber)' }}>
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ width: '100%', padding: '14px 20px', fontSize: '1rem', marginBottom: '16px' }}
              >
                <span>{submitting ? 'Generating Order...' : 'Confirm & Place Order'}</span>
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--color-amber)' }} />
                  <span>GST invoice copy will be emailed upon confirmation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={14} style={{ color: 'var(--color-amber)' }} />
                  <span>Carrier docket tracking will be updated under /orders</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
