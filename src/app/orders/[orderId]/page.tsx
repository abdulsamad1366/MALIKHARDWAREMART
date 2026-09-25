'use client';

/**
 * @file page.tsx
 * @route /orders/[orderId]
 * @access Registered user, Admin (Auth required) per Section 2 & 3
 * @description Single order status and official tax invoice view.
 * Verifies customer ownership or admin role.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  ShieldCheck,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  priceAtOrder: number;
}

interface OrderData {
  _id: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Single Order Detail Page Component.
 */
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const orderId = params?.orderId as string;

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/orders/${orderId}`);
    }
  }, [authLoading, isAuthenticated, router, orderId]);

  // Fetch single order data from API
  useEffect(() => {
    async function loadOrder() {
      if (!orderId || !isAuthenticated) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setOrder(data.order);
        } else {
          setErrorMsg(data.message || 'Order could not be found or access is restricted.');
        }
      } catch {
        setErrorMsg('Network error while retrieving order details.');
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0', color: 'var(--text-muted)' }}>
        Retrieving order specifications...
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <AlertCircle size={44} style={{ color: 'var(--color-rose)', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
          Unable to display order
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{errorMsg}</p>
        <Link href="/orders" className="btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  // Calculate tax breakdown
  const taxableAmount = Math.round(order.totalAmount / 1.18);
  const gstAmount = order.totalAmount - taxableAmount;

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Navigation & Action Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <Link
            href="/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              color: 'var(--color-amber)',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to All Orders</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            <Printer size={15} />
            <span>Print Commercial Invoice</span>
          </button>
        </div>

        {/* Invoice Container Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            maxWidth: '960px',
            margin: '0 auto',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Invoice Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '24px', marginBottom: '28px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.02em', color: 'var(--text-main)' }}>
                MALIK HARDWARE MART
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-amber)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                Official Trade Delivery Invoice
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4 }}>
                124 G.T. Road, Industrial Hardware Hub, Delhi 110006<br />
                GSTIN: 07AAACM9981K1ZZ • Phone: +91 98765 43210
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Order Reference
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-amber)', marginTop: '2px' }}>
                #MHM-{order._id.slice(-8).toUpperCase()}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Placed: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Status Tracker Strip */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              marginBottom: '28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Fulfillment Tracking
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {order.status === 'delivered' ? (
                  <CheckCircle size={18} style={{ color: 'var(--color-emerald)' }} />
                ) : (
                  <Clock size={18} style={{ color: 'var(--color-amber)' }} />
                )}
                <span>Status: {order.status.toUpperCase()}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Payment Method
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-amber)', marginTop: '2px' }}>
                {order.paymentMethod}
              </div>
            </div>
          </div>

          {/* Consignee Address */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} style={{ color: 'var(--color-amber)' }} />
              <span>Consignee & Site Delivery Destination</span>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{order.shippingAddress.fullName}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                <Phone size={12} />
                <span>Contact: {order.shippingAddress.phone}</span>
              </div>
              {order.notes && (
                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-amber)' }}>
                  Delivery Instructions: {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div style={{ marginBottom: '28px' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price (INR)</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        SKU Snapshot Ref: {item.productId}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>₹{item.priceAtOrder.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-amber)' }}>
                      ₹{(item.quantity * item.priceAtOrder).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Calculation */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>Taxable Amount</span>
                <span>₹{taxableAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span>CGST (9%) + SGST (9%)</span>
                <span>₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-medium)',
                  paddingTop: '10px',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: 'var(--color-amber)',
                }}
              >
                <span>Grand Total</span>
                <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '32px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} style={{ color: 'var(--color-amber)' }} />
              <span>Certified authentic hardware dispatch • Input Tax Credit eligible</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={14} style={{ color: 'var(--color-amber)' }} />
              <span>Goods once sold subject to standard manufacturer warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
