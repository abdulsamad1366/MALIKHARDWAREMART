'use client';

/**
 * @file page.tsx
 * @route /admin/customers
 * @access Admin only per Section 2 & 7
 * @description Customer verification administration view.
 * Enables store owner/admin to approve customer accounts to unlock wholesale trade pricing.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  CheckCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface CustomerRecord {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isPriceVerified: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  addresses?: Array<{
    city: string;
    state: string;
  }>;
}

/**
 * Admin Customers Verification Page Component.
 */
export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  // Load customer accounts
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  /**
   * Toggles customer price verification status.
   */
  const handleToggleVerification = async (customerId: string, newStatus: boolean) => {
    try {
      setUpdatingId(customerId);
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPriceVerified: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotice(data.message);
        setTimeout(() => setNotice(''), 3500);
        await loadCustomers();
      } else {
        alert(data.message || 'Failed to update verification status');
      }
    } catch (err) {
      console.error('Error updating customer status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter customers by status and search keyword
  const filteredCustomers = customers.filter((c) => {
    if (statusFilter === 'pending' && c.isPriceVerified) return false;
    if (statusFilter === 'verified' && !c.isPriceVerified) return false;

    const term = searchFilter.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term))
    );
  });

  const pendingCount = customers.filter((c) => !c.isPriceVerified).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>Customer Rate Approvals</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Verify contractor and wholesale trade accounts to grant access to catalog pricing.
          </p>
        </div>

        {pendingCount > 0 && (
          <div
            style={{
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              color: '#92400E',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Clock size={16} />
            <span>{pendingCount} Trade Account(s) Awaiting Approval</span>
          </div>
        )}
      </div>

      {notice && (
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
          <CheckCircle size={16} />
          <span>{notice}</span>
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
            placeholder="Search by customer name, email, or phone..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
          >
            All Accounts ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={statusFilter === 'pending' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('verified')}
            className={statusFilter === 'verified' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
          >
            Verified ({customers.length - pendingCount})
          </button>
        </div>
      </div>

      {/* Customer List Table */}
      <div className="data-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            Loading customer accounts...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Filter size={40} style={{ color: 'var(--color-brand)', margin: '0 auto 12px' }} />
            <p>No customer accounts match the current filter.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer / Trade Entity</th>
                <th>Contact</th>
                <th>Registered</th>
                <th>Total Orders</th>
                <th>Rate Access Status</th>
                <th style={{ textAlign: 'right' }}>Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cust) => (
                <tr key={cust._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cust.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      ID: {cust._id.slice(-8).toUpperCase()}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{cust.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {cust.phone || 'No phone recorded'}
                    </div>
                  </td>

                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {new Date(cust.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      {cust.orderCount} Order(s)
                    </div>
                    {cust.totalSpent > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-brand)', fontWeight: 600 }}>
                        ₹{cust.totalSpent.toLocaleString('en-IN')}
                      </div>
                    )}
                  </td>

                  <td>
                    {cust.isPriceVerified ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'var(--color-emerald-bg)',
                          color: 'var(--color-emerald)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                      >
                        <ShieldCheck size={14} />
                        <span>Verified Account</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#FEF3C7',
                          color: '#B45309',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                      >
                        <Clock size={14} />
                        <span>Pending Approval</span>
                      </span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    {cust.isPriceVerified ? (
                      <button
                        onClick={() => handleToggleVerification(cust._id, false)}
                        disabled={updatingId === cust._id}
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '6px 12px', color: 'var(--color-rose)' }}
                      >
                        Revoke Access
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleVerification(cust._id, true)}
                        disabled={updatingId === cust._id}
                        className="btn-primary"
                        style={{ fontSize: '0.75rem', padding: '6px 14px' }}
                      >
                        <ShieldCheck size={14} />
                        <span>Approve Rates</span>
                      </button>
                    )}
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
