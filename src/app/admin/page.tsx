'use client';

/**
 * @file page.tsx
 * @route /admin
 * @access Admin only per Section 2 & 7
 * @description Administrative dashboard overview displaying platform analytics,
 * revenue statistics, pending orders alert, and recent customer activity.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  ClipboardList,
  IndianRupee,
  Users,
  Clock,
  ArrowRight,
  PlusCircle,
  Truck,
  CheckCircle,
} from 'lucide-react';

interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalCategories: number;
  totalRevenue: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  recentOrders: Array<{
    _id: string;
    createdAt: string;
    totalAmount: number;
    status: string;
    userId?: {
      name: string;
      email: string;
    };
  }>;
}

/**
 * Admin Dashboard Page Component.
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch admin stats from /api/admin/stats
  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
        Loading business metrics...
      </div>
    );
  }

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>Operations Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Real-time catalog metrics, inventory overview, and customer orders fulfillment.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/products" className="btn-primary" style={{ fontSize: '0.88rem' }}>
            <PlusCircle size={16} />
            <span>Manage Products</span>
          </Link>
          <Link href="/admin/orders" className="btn-secondary" style={{ fontSize: '0.88rem' }}>
            <ClipboardList size={16} />
            <span>Process Orders</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '36px',
        }}
      >
        {/* Gross Revenue */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-dim)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Total B2B Revenue</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--color-amber-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-amber)' }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-amber)' }}>
            ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Excluding cancelled orders
          </div>
        </div>

        {/* Total Orders */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-dim)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Total Orders</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--color-blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-blue)' }}>
              <ClipboardList size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>
            {stats?.totalOrders || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {stats?.pendingOrders || 0} pending dispatch verification
          </div>
        </div>

        {/* Active Products */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-dim)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Catalog SKUs</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7' }}>
              <Boxes size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>
            {stats?.totalProducts || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across {stats?.totalCategories || 0} categories
          </div>
        </div>

        {/* Registered Trade Accounts */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-dim)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Trade Accounts</span>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--color-emerald-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-emerald)' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>
            {stats?.totalCustomers || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Verified wholesale buyers
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="data-table-card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Recent Customer Orders</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Latest purchase orders submitted by contractors</p>
          </div>
          <Link href="/admin/orders" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
            <span>View All Orders</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No recent orders available.
                </td>
              </tr>
            ) : (
              stats.recentOrders.map((ord) => (
                <tr key={ord._id}>
                  <td style={{ fontWeight: 700, color: 'var(--color-amber)' }}>
                    #MHM-{ord._id.slice(-8).toUpperCase()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ord.userId?.name || 'Trade Customer'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{ord.userId?.email || 'N/A'}</div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-amber)' }}>
                    ₹{ord.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
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
                      }}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/orders/${ord._id}`}
                      className="btn-outline-amber"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
