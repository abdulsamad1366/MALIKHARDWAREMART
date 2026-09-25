/**
 * @file Footer.tsx
 * @description Global B2B industrial footer.
 * Outlines corporate trade services, physical distribution hub,
 * category links, and legal trade credentials.
 */

import React from 'react';
import Link from 'next/link';
import { Wrench, Phone, Mail, MapPin, ShieldCheck, Truck, CreditCard, Award } from 'lucide-react';

/**
 * Global Footer component.
 */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        {/* Value Proposition Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            paddingBottom: '40px',
            marginBottom: '40px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Award size={32} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>100% Genuine Brands</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Direct from authorized OEM plants</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ShieldCheck size={32} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>B2B Wholesale Rates</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Tiered trade volume discounts</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Truck size={32} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Express Site Freight</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Direct warehouse & site logistics</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <CreditCard size={32} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Trade Credit & COD</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Flexible contractor billing</div>
            </div>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="footer-grid">
          {/* Brand & Warehouse Info */}
          <div>
            <div className="brand-logo" style={{ marginBottom: '14px' }}>
              <div className="brand-icon-wrapper" style={{ width: '36px', height: '36px' }}>
                <Wrench size={20} />
              </div>
              <div className="brand-text">
                <span className="brand-name" style={{ fontSize: '1rem' }}>MALIK</span>
                <span className="brand-sub" style={{ fontSize: '0.6rem' }}>HARDWARE MART</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Premier B2B distributor of industrial power tools, high tensile fasteners,
              architectural ironmongery, electrical switchgear, and plumbing assemblies.
              Serving contractors and fabricators across India.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
                <span>124 G.T. Road, Industrial Hardware Hub, Delhi 110006, India</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
                <span>+91 98765 43210 / 011-23948572</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
                <span>trade@malikhardware.com</span>
              </div>
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="footer-col-title">Product Catalog</h4>
            <ul className="footer-links">
              <li><Link href="/category/hand-power-tools">Hand & Power Tools</Link></li>
              <li><Link href="/category/fasteners-fixings">Fasteners & Fixings</Link></li>
              <li><Link href="/category/electrical-lighting">Electrical & Lighting</Link></li>
              <li><Link href="/category/plumbing-pipes">Plumbing & Valves</Link></li>
              <li><Link href="/category/architectural-hardware">Architectural Hardware</Link></li>
              <li><Link href="/category/safety-workwear">Safety & Workwear</Link></li>
              <li><Link href="/category/paints-chemicals">Paints & Sealants</Link></li>
            </ul>
          </div>

          {/* Trade Accounts */}
          <div>
            <h4 className="footer-col-title">Trade Accounts</h4>
            <ul className="footer-links">
              <li><Link href="/login">Wholesale Login</Link></li>
              <li><Link href="/register">Create Trade Account</Link></li>
              <li><Link href="/cart">Trade Cart</Link></li>
              <li><Link href="/orders">Order Tracking</Link></li>
              <li><Link href="/account">Billing & Addresses</Link></li>
              <li><Link href="/admin">Staff Admin Portal</Link></li>
            </ul>
          </div>

          {/* Wholesale Help */}
          <div>
            <h4 className="footer-col-title">Contractor Support</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px', lineHeight: 1.5 }}>
              Need bulk quotations, project tenders, or test certificates (MTC)?
              Speak directly with our dedicated hardware engineers.
            </p>
            <div
              style={{
                background: 'var(--bg-primary)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Wholesale Inquiry Desk
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-amber)', marginTop: '4px' }}>
                +91 98765 43210
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Mon - Sat: 9:00 AM - 7:30 PM IST
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} Malik Hardware Mart. All Rights Reserved. (Inspiration: hardwaremartindia.com)
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>GST Registered B2B Distributor</span>
            <span>CIN: U28999DL2018PTC328900</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
