'use client';

/**
 * @file page.tsx
 * @route /account
 * @access Registered user, Admin (Auth required) per Section 2 & 3
 * @description Customer account profile and saved shipping destination address manager.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Shield,
  MapPin,
  Package,
  ShoppingCart,
  LogOut,
  Plus,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * AccountPage Component.
 */
export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout, refreshUser } = useAuth();

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrForm, setAddrForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: 'Delhi',
    postalCode: '',
    country: 'India',
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Auth Guard: redirect unauthenticated visitors
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/account');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0', color: 'var(--text-muted)' }}>
        Loading account details...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  /**
   * Adds new shipping address to user profile.
   */
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      // We can post to a profile address endpoint or direct checkout save
      // For now we update user profile in MongoDB
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addrForm }),
      });

      // Alternatively refresh user
      await refreshUser();
      setShowAddAddress(false);
      setSuccessMsg('Address saved successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error saving address:', err);
    } finally {
      setSaving(false);
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
            <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>Account Profile</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>Trade Account Profile</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Manage company billing information, site delivery destinations, and purchase history.
          </p>
        </div>

        {successMsg && (
          <div
            style={{
              background: 'var(--color-emerald-bg)',
              border: '1px solid var(--color-emerald)',
              color: 'var(--color-emerald)',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '32px' }}>
          {/* Profile Overview Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-amber-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-amber)',
                  }}
                >
                  <User size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{user.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <span
                      style={{
                        background: user.role === 'admin' ? 'rgba(234, 88, 12, 0.15)' : 'var(--color-amber-bg)',
                        color: user.role === 'admin' ? 'var(--color-orange)' : 'var(--color-amber)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {user.role === 'admin' ? 'Store Administrator' : 'Verified Trade Account'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                  <Mail size={16} style={{ color: 'var(--color-amber)' }} />
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{user.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                  <Phone size={16} style={{ color: 'var(--color-amber)' }} />
                  <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{user.phone || 'No phone provided'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                  <Shield size={16} style={{ color: 'var(--color-amber)' }} />
                  <span>Trade Price Access: Active</span>
                </div>
              </div>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => logout()}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '10px' }}
                >
                  <LogOut size={16} />
                  <span>Sign Out of Session</span>
                </button>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <Link
                href="/orders"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Package size={18} style={{ color: 'var(--color-amber)' }} />
                  <span>View All Purchase Orders</span>
                </div>
                <span style={{ color: 'var(--text-dim)' }}>→</span>
              </Link>

              <Link
                href="/cart"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShoppingCart size={18} style={{ color: 'var(--color-amber)' }} />
                  <span>Active Trade Cart</span>
                </div>
                <span style={{ color: 'var(--text-dim)' }}>→</span>
              </Link>

              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(234, 88, 12, 0.1)',
                    border: '1px solid rgba(234, 88, 12, 0.3)',
                    color: 'var(--color-orange)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={18} />
                    <span>Administrator Management Portal</span>
                  </div>
                  <span>→</span>
                </Link>
              )}
            </div>
          </div>

          {/* Saved Addresses Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={22} style={{ color: 'var(--color-amber)' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Saved Dispatch Destinations</h2>
              </div>
            </div>

            {(!user.addresses || user.addresses.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <MapPin size={36} style={{ color: 'var(--text-dim)', margin: '0 auto 12px' }} />
                <p style={{ fontSize: '0.9rem' }}>No delivery addresses saved yet.</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Addresses are automatically saved when you place purchase orders at checkout.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {user.addresses.map((addr, idx) => (
                  <div
                    key={addr._id || idx}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: addr.isDefault ? '1px solid var(--color-amber)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '18px 20px',
                      position: 'relative',
                    }}
                  >
                    {addr.isDefault && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '14px',
                          right: '16px',
                          background: 'var(--color-amber-bg)',
                          color: 'var(--color-amber)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Default Address
                      </span>
                    )}
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                      {addr.fullName}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                      {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                      Contact Mobile: {addr.phone}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
