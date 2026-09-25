'use client';

/**
 * @file page.tsx
 * @route /orders
 * @access Registered user, Admin (Auth required) per Section 2 & 3
 * @description Customer order history list displaying previous trade purchases,
 * fulfillment status, and deep links to individual order invoices.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface OrderItemSummary {
  productId: string;
  name: string;
  quantity: number;
  priceAtOrder: number;
}

interface OrderRecord {
  _id: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItemSummary[];
  shippingAddress: {
    fullName: string;
    city: string;
    state: string;
  };
}

/**
 * OrdersPage Component.
 */
export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth Guard: redirect unauthenticated guests
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/orders');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch orders from API
  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0', color: 'var(--text-muted)' }}>
        Loading order history...
      </div>
    );
  }

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-amber-bg)', color: 'var(--color-amber)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Clock size={12} /> Pending Verification
          </span>
        );
      case 'confirmed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-blue-bg)', color: 'var(--color-blue)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <CheckCircle size={12} /> Order Confirmed
          </span>
        );
      case 'shipped':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(168, 85, 247, 0.12)', color: '#A855F7', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Truck size={12} /> In Transit / Shipped
          </span>
        );
      case 'delivered':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-emerald-bg)', color: 'var(--color-emerald)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <CheckCircle size={12} /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-rose-bg)', color: 'var(--color-rose)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <AlertCircle size={12} /> Cancelled
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
            <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
            <span>/</span>
            <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>Purchase Orders</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>Trade Purchase Orders</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Track the status of your material dispatches, freight carriers, and invoices.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            Retrieving purchase history...
          </div>
        ) : orders.length === 0 ? (
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
            <Package size={48} style={{ color: 'var(--color-amber)', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px' }}>
              No purchase orders found
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              You have not placed any trade orders yet. Explore our hardware catalog to begin.
            </p>
            <Link href="/products" className="btn-primary">
              <span>Browse Catalog</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => (
              <div
                key={order._id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr 1fr auto',
                  gap: '24px',
                  alignItems: 'center',
                }}
              >
                {/* Order Identification & Date */}
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Order ID
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-amber)', marginTop: '2px' }}>
                    #MHM-{order._id.slice(-8).toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <Calendar size={13} />
                    <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Items & Shipping Destination */}
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {order.items.length} Product Line(s)
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Destination: {order.shippingAddress.city}, {order.shippingAddress.state}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {order.paymentMethod}
                  </div>
                </div>

                {/* Status & Amount */}
                <div>
                  <div>{getStatusBadge(order.status)}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-amber)', marginTop: '8px' }}>
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Action Link */}
                <div>
                  <Link
                    href={`/orders/${order._id}`}
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '10px 18px', whiteSpace: 'nowrap' }}
                  >
                    <span>View Invoice</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
