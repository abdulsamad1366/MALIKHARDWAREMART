/**
 * @file page.tsx
 * @route /about-us
 * @access Public per docs/05-routes.md
 * @description Corporate About Us page detailing distribution infrastructure,
 * brand partnerships (Bosch, Tata Steel, Hilti, Fischer), and operational standards.
 */

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  ShieldCheck,
  Truck,
  Award,
  Users,
  Building2,
  FileCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us — Malik Hardware Mart',
  description:
    'Learn about Malik Hardware Mart’s distribution network, certified brand partnerships, and institutional supply solutions for builders and industrial plants.',
};

/**
 * About Us Page Component.
 */
export default function AboutUsPage() {
  const brandPartners = [
    { name: 'Bosch Power Tools', category: 'Heavy Duty Drilling & Demolition' },
    { name: 'Tata Steel', category: 'High-Tensile Threaded Rods & Structural Wire' },
    { name: 'Hilti India', category: 'Chemical Anchors & Direct Fasteners' },
    { name: 'Fischer Fixings', category: 'Nylon & Steel Anchor Systems' },
    { name: 'Finolex Cables', category: 'Industrial Armoured Electricals' },
    { name: 'Supreme Industries', category: 'CPVC & Industrial Pressure Piping' },
  ];

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '24px' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>About Us</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
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
              marginBottom: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Direct Industrial Distribution
          </span>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '16px' }}>
            Powering Infrastructure & Industrial Manufacturing
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
            Malik Hardware Mart is a specialized B2B hardware distributor headquartered in Delhi, delivering certified industrial components with complete tax and metallurgical compliance.
          </p>
        </div>

        {/* Pillars of Operations */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-amber-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-amber)',
                marginBottom: '16px',
              }}
            >
              <Building2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Centralized Hub</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              30,000+ sq. ft. primary warehouse in Delhi housing over 10,000 SKUs with computerized batch tracking.
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-amber-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-amber)',
                marginBottom: '16px',
              }}
            >
              <Truck size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Express Freight</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Scheduled site dispatches across Delhi-NCR within 24 hours, and national surface cargo for multi-state contracts.
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-amber-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-amber)',
                marginBottom: '16px',
              }}
            >
              <FileCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Full Compliance</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Rigorous adherence to Indian Standards (IS), DIN specifications, and 100% legal GST invoicing for full input tax recovery.
            </p>
          </div>
        </div>

        {/* Brand Portfolio Showcase */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            marginBottom: '40px',
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
              Authorized Brand Partnerships
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              We deal directly with manufacturers to ensure zero counterfeit risk and backed warranties.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {brandPartners.map((bp, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>{bp.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>{bp.category}</div>
                </div>
                <Award size={18} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Leadership & Contact Footnote */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
              Direct Quotations & Institutional Tender Bids
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Have an active BOQ or tender specification? Submit your schedule directly to our engineering desk.
            </p>
          </div>
          <Link href="/contact-us" className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
            <span>Submit RFQ Schedule</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
