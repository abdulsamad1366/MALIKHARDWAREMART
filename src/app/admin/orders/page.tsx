'use client';

/**
 * @file page.tsx
 * @route /admin/orders
 * @access Admin only per Section 2 & 7
 * @description Administrative order management interface.
 * Tracks incoming B2B purchase orders and enables real-time status transitions
 * (pending -> confirmed -> shipped -> delivered -> cancelled).
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Search,
  Check,
  ExternalLink,
  Filter,
} from 'lucide-react';

interface OrderUser {
  name: string;
  email: string;
  phone?: string;
}

interface AdminOrderRecord {
  _id: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  items: Array<{
    name: string;
    quantity: number;
    priceAtOrder: number;
  }>;
  shippingAddress: {
    fullName: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };
  userId?: OrderUser;
}

/**
 * Admin Orders Management Page Component.
 */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState('');

  // Load all orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /**
   * Updates fulfillment status for a specific order.
   */
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessNotice(`Order status changed to ${newStatus.toUpperCase()}`);
        setTimeout(() => setSuccessNotice(''), 3000);
        await loadOrders();
      } else {
        alert(data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = statusFilter ? ord.status === statusFilter : true;
    const search = searchFilter.toLowerCase();
    const customer = ord.userId?.name?.toLowerCase() || '';
    const email = ord.userId?.email?.toLowerCase() || '';
    const id = ord._id.toLowerCase();
    const matchesSearch =
      customer.includes(search) || email.includes(search) || id.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>Customer Order Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Review incoming contractor purchase orders, update shipping and carrier fulfillment.
          </p>
        </div>
      </div>

      {successNotice && (
        <div
          style={{
            background: 'var(--color-emerald-bg)',
            border: '1px solid var(--color-emerald)',
            color: 'var(--color-emerald)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={16} />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px', height: '40px' }}
            placeholder="Search by customer name, email, or order ID..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>

        <div style={{ flex: '0 1 200px' }}>
          <select
            className="form-select"
            style={{ height: '40px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses ({orders.length})</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Showing {filteredOrders.length} orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="data-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            Loading orders list...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Filter size={40} style={{ color: 'var(--color-amber)', margin: '0 auto 12px' }} />
            <p>No orders match the current filter criteria.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Contractor Customer</th>
                <th>Destination</th>
                <th>Amount</th>
                <th>Fulfillment Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr key={ord._id}>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--color-amber)' }}>
                      #MHM-{ord._id.slice(-8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 700 }}>
                      {ord.userId?.name || ord.shippingAddress.fullName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {ord.userId?.email || 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Ph: {ord.shippingAddress.phone}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {ord.shippingAddress.city}, {ord.shippingAddress.state}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      PIN: {ord.shippingAddress.postalCode}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--color-amber)', fontSize: '1rem' }}>
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {ord.items.length} Line Item(s)
                    </div>
                  </td>

                  <td>
                    <select
                      className="form-select"
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.8rem',
                        height: '32px',
                        fontWeight: 700,
                        background:
                          ord.status === 'delivered'
                            ? 'var(--color-emerald-bg)'
                            : ord.status === 'shipped'
                            ? 'rgba(168, 85, 247, 0.12)'
                            : 'var(--color-amber-bg)',
                        color:
                          ord.status === 'delivered'
                            ? 'var(--color-emerald)'
                            : ord.status === 'shipped'
                            ? '#A855F7'
                            : 'var(--color-amber)',
                        borderColor: 'transparent',
                      }}
                      value={ord.status}
                      disabled={updatingId === ord._id}
                      onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <Link
                      href={`/orders/${ord._id}`}
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      title="Inspect full invoice"
                    >
                      <span>Invoice</span>
                      <ExternalLink size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
