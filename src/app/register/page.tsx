'use client';

/**
 * @file page.tsx
 * @route /register
 * @access Public (Guest) per Section 2 & 3
 * @description Customer registration page for contractor trade accounts.
 * Hashes password via bcrypt, establishes JWT cookie, and unlocks price access.
 */

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * Register Form Component.
 */
function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/products';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  /**
   * Handles customer registration.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await register(name, email, password, phone);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setErrorMsg(res.message || 'Registration failed. Please check inputs.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred during account creation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
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
            <ShieldCheck size={24} />
          </div>
          <h1 className="auth-title">Register Trade Account</h1>
          <p className="auth-subtitle">
            Create your contractor account to access B2B pricing, volume deals, and GST billing.
          </p>
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
            <label className="form-label">Full Name / Business Representative *</label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              />
              <input
                type="text"
                required
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="e.g. Ramesh Patel (Patel Fabricators)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Trade Contact Email *</label>
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
            <label className="form-label">Mobile / Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              />
              <input
                type="tel"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password (Min. 6 Characters) *</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              />
              <input
                type="password"
                required
                minLength={6}
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
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '10px' }}
          >
            <span>{submitting ? 'Creating Account...' : 'Submit Trade Registration'}</span>
            <ArrowRight size={16} />
          </button>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '10px' }}>
            Trade accounts undergo admin review before wholesale pricing is activated.
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
            style={{ color: 'var(--color-amber)', fontWeight: 600 }}
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Root Register Page with Suspense wrapper.
 */
export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
