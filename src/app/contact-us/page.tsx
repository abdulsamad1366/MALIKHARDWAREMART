'use client';

/**
 * @file page.tsx
 * @route /contact-us
 * @access Public per docs/02-navigation.md & docs/05-routes.md
 * @description Contact Us page featuring B2B inquiry form, central warehouse coordinates,
 * direct trade desk phone numbers, and WhatsApp quick-action links.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Building,
  PhoneCall,
} from 'lucide-react';

/**
 * Contact Us Page Component.
 */
export default function ContactUsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  /**
   * Handles contact form submission to /api/contact.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name || !email || !message) {
      setErrorMsg('Please fill in your name, trade email, and inquiry message.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Your inquiry has been received. Our trade desk will contact you promptly.');
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      } else {
        setErrorMsg(data.message || 'Failed to transmit inquiry. Please call our trade desk.');
      }
    } catch {
      setErrorMsg('Network error while submitting contact request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '1080px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '24px' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>Contact Us</span>
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: '40px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--color-amber-bg)',
              color: 'var(--color-amber)',
              fontWeight: 700,
              fontSize: '0.78rem',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Direct Trade Support
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Connect with Our Industrial Desk
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '640px' }}>
            Submit an RFQ specification, request project rates, or schedule heavy freight dispatch from our central distribution hub.
          </p>
        </div>

        {/* Main 2-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '32px', alignItems: 'start' }}>
          {/* Left Column: Interactive Contact Form */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px',
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px' }}>
              Send an Inquiry or Tender Schedule
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
              Our procurement engineers review all contractor RFQs and respond within 24 business hours.
            </p>

            {successMsg && (
              <div
                style={{
                  background: 'var(--color-emerald-bg)',
                  border: '1px solid var(--color-emerald)',
                  color: 'var(--color-emerald)',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.9rem',
                }}
              >
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  background: 'var(--color-rose-bg)',
                  border: '1px solid var(--color-rose)',
                  color: 'var(--color-rose)',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.9rem',
                }}
              >
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name / Representative *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Ramesh Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Trade Contact Email *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="name@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mobile / Site Contact Number (Optional)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Inquiry Details / Material Schedule *</label>
                <textarea
                  rows={5}
                  required
                  className="form-textarea"
                  placeholder="Specify product types, quantities, technical grade, or site delivery location..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '8px' }}
              >
                <Send size={16} />
                <span>{submitting ? 'Transmitting Inquiry...' : 'Submit Inquiry to Sales Desk'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Warehouse Information & Coordinates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Primary Details Card */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>
                Distribution Hub & Office
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <MapPin size={20} style={{ color: 'var(--color-amber)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Central Distribution Facility</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginTop: '2px' }}>
                      Plot No. 44, Hardware Market, Wazirpur Industrial Area, New Delhi, Delhi 110052, India
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Phone size={20} style={{ color: 'var(--color-amber)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Direct Trade Line</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
                      +91 98765 43210 / +91 11 4500 9820
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Mail size={20} style={{ color: 'var(--color-amber)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Wholesale Sales Desk</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
                      sales@malikhardware.com / rfq@malikhardware.com
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Clock size={20} style={{ color: 'var(--color-amber)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Operating Hours</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
                      Monday – Saturday: 09:00 AM – 07:30 PM (IST)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Sunday: Closed for inventory reconciliation
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant WhatsApp Card */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '6px' }}>
                Need Immediate Stock Clearance?
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '16px' }}>
                Send your material requirement bill or photo of required fastener directly to our warehouse manager over WhatsApp.
              </p>
              <a
                href="https://wa.me/919811054321?text=Hello%20Malik%20Hardware%20Mart,%20I%20have%20an%20urgent%20inquiry%20regarding%20wholesale%20supplies."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  justifyContent: 'center',
                  padding: '10px 16px',
                  fontSize: '0.9rem',
                }}
              >
                <PhoneCall size={16} />
                <span>WhatsApp Desk: +91 98110 54321</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
