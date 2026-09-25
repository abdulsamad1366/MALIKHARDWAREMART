'use client';

/**
 * @file layout.tsx
 * @route /admin/*
 * @access Admin only per Section 2 & 7
 * @description Administrative portal layout with role authentication guard,
 * dedicated admin sidebar, and quick storefront navigation.
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Store,
  ShieldAlert,
  ArrowLeft,
  Sliders,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * Admin Layout Component.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  // Guard: Ensure user is logged in AND has role === 'admin'
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin');
      } else if (!isAdmin) {
        router.push('/products');
      }
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '140px 0', color: 'var(--text-muted)' }}>
        Verifying administrator permissions...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 20px' }}>
        <ShieldAlert size={48} style={{ color: 'var(--color-rose)', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>
          This portal requires Administrator authorization.
        </p>
        <Link href="/" className="btn-primary">
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Admin Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div style={{ padding: '0 8px 18px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-amber)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Management Portal
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
            Malik Admin
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Logged as: {user?.name.split(' ')[0]}
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <Link
            href="/admin"
            className={`admin-nav-item ${pathname === '/admin' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/products"
            className={`admin-nav-item ${pathname === '/admin/products' ? 'active' : ''}`}
          >
            <Boxes size={18} />
            <span>Products CRUD</span>
          </Link>

          <Link
            href="/admin/orders"
            className={`admin-nav-item ${pathname === '/admin/orders' ? 'active' : ''}`}
          >
            <ClipboardList size={18} />
            <span>Orders Management</span>
          </Link>

          <Link
            href="/admin/customers"
            className={`admin-nav-item ${pathname === '/admin/customers' ? 'active' : ''}`}
          >
            <ShieldAlert size={18} />
            <span>Customer Approvals</span>
          </Link>

          <Link
            href="/admin/settings"
            className={`admin-nav-item ${pathname === '/admin/settings' ? 'active' : ''}`}
          >
            <Sliders size={18} />
            <span>Site Settings</span>
          </Link>

          <Link
            href="/admin/blog"
            className={`admin-nav-item ${pathname === '/admin/blog' ? 'active' : ''}`}
          >
            <BookOpen size={18} />
            <span>Blog & Guides</span>
          </Link>
        </nav>

        {/* Exit Admin to Storefront */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Store size={16} />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Working Canvas */}
      <main className="admin-content">{children}</main>
    </div>
  );
}
