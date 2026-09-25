/**
 * @file page.tsx
 * @route /our-story
 * @access Public per docs/05-routes.md
 * @description Editorial story page narrating the heritage, industrial evolution,
 * and contracting commitments of Malik Hardware Mart.
 */

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, Award, Factory, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Story — Malik Hardware Mart',
  description:
    'Discover the heritage and industrial mission of Malik Hardware Mart, supplying India’s largest infrastructure projects and manufacturing facilities since 1994.',
};

/**
 * Our Story Page Component.
 */
export default function OurStoryPage() {
  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '24px' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>Our Story</span>
        </div>

        {/* Hero Header */}
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
            Decades of Industrial Reliability
          </span>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '16px' }}>
            Built on Rigor, Precision & Contractor Trust
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
            From our founding warehouse in Delhi’s industrial hardware quarter to supplying high-speed rail corridors, power grids, and fabrication workshops nationwide.
          </p>
        </div>

        {/* Narrative Section 1: The Origin */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '40px',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-amber-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-amber)',
              }}
            >
              <Factory size={22} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>The Roots in Industrial Delhi</h2>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '16px' }}>
            Malik Hardware Mart was established with a singular focus: to bridge the gap between heavy industrial manufacturers and on-site EPC contractors who demand verified metallurgy, consistent threading, and zero-defect fasteners.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.8 }}>
            Beginning as an authorized distributor for structural bolts and industrial abrasives, we quickly recognized that commercial builders faced crippling delays due to adulterated trade supplies and missing test certificates. Malik Hardware Mart instituted a 100% batch-inspection policy, partnering directly with primary steel rollers and certified OEMs.
          </p>
        </div>

        {/* Key Milestones Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-amber)', marginBottom: '6px' }}>1994</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>Founded in Delhi</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Established primary trade hub for industrial fasteners</div>
          </div>

          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-amber)', marginBottom: '6px' }}>10,000+</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>Cataloged SKUs</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>From high-tensile anchors to industrial demolition hammers</div>
          </div>

          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-amber)', marginBottom: '6px' }}>100%</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>ITC Tax Compliant</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Verified GST e-way bills with every consignment</div>
          </div>
        </div>

        {/* Narrative Section 2: Why B2B Verification Matters */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '40px',
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-amber-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-amber)',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>The Contractor Protection Model</h2>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '20px' }}>
            Unlike retail e-commerce stores, Malik Hardware Mart does not publish open rates to the public. Wholesale pricing is reserved exclusively for registered builders, trade fabricators, and certified industrial procurement managers. This protects our contractors&apos; bidding margins and ensures institutional quantity rates remain confidential.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-emerald)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Direct factory billing with Input Tax Credit (ITC)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-emerald)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Mill Test Certificates (MTC) provided upon dispatch</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-emerald)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Consolidated freight delivery directly to job sites</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--color-emerald)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Dedicated account managers for large tender quotations</span>
            </div>
          </div>
        </div>

        {/* Call to Action Bar */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>Ready to Partner on Your Next Build?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Register your trade entity to unlock wholesale contract pricing and delivery dispatch.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
              <span>Register Trade Account</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/contact-us" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
              <span>Contact Sales Desk</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
