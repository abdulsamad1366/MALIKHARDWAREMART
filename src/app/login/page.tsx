'use client';

/**
 * @file page.tsx
 * @route /login
 * @access Public (Guest) per Section 2 & 3
 * @description Wholesale trade account sign-in page.
 * Unlocks trade pricing and persistent shopping cart across the site upon success.
 */

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * Login Form Component.
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/products';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  /**
   * Handles user sign-in.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(email, password);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setErrorMsg(res.message || 'Invalid credentials. Please verify your email and password.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred during login.');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Quick-fill demo credentials for tester convenience.
   */
  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-amber-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              color: 'var(--color-amber)',
            }}
          >
            <Lock size={24} />
          </div>
          <h1 className="auth-title">Wholesale Trade Sign In</h1>
          <p className="auth-subtitle">
            Sign in to unlock wholesale trade pricing, volume discounts, and cart orders.
          </p>
        </div>

        {/* Demo Credentials Quick Selector */}
        <div className="demo-account-hint">
          <div style={{ fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} />
            <span>Demo Test Credentials (Click to pre-fill):</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillCredentials('customer@sharmabuilders.com', 'CustomerPass#2026')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Contractor Demo Login
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@malikhardware.com', 'AdminMalikHardware#2026')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Store Admin Login
            </button>
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'var(--color-rose-bg)',
              border: '1px solid var(--color-rose)',
              color: 'var(--color-rose)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Trade Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="name@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              />
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '8px' }}
          >
            <span>{submitting ? 'Verifying Credentials...' : 'Sign In to Trade Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don&apos;t have a wholesale account?{' '}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectUrl)}`}
            style={{ color: 'var(--color-amber)', fontWeight: 600 }}
          >
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Root Login Page with Suspense wrapper.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>Loading sign-in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
