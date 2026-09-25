'use client';

/**
 * @file page.tsx
 * @route /admin/settings
 * @access Admin only per docs/02-navigation.md & docs/04-access-control.md
 * @description Admin management page for site-wide settings, specifically the real-time
 * editable header marquee banner.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Info,
  Clock,
  UserCheck,
} from 'lucide-react';

interface SettingsData {
  marqueeMessage: string;
  updatedAt?: string | null;
  updatedBy?: {
    name?: string;
    email?: string;
  } | null;
}

/**
 * Admin Site Settings Page.
 */
export default function AdminSettingsPage() {
  const [marqueeMessage, setMarqueeMessage] = useState('');
  const [originalMessage, setOriginalMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [metaInfo, setMetaInfo] = useState<{ updatedAt?: string; updatedBy?: string } | null>(null);

  // Suggested preset alerts for quick copy/insertion
  const presetAlerts = [
    '⚡ Wholesale Dispatch Alert: Direct factory shipments active across Delhi-NCR & Northern India. GST Input Tax Credit (ITC) invoices issued with every consignment. Contact Trade Desk: +91 98765 43210.',
    '🔨 Brand Spotlight: Authorized wholesale supplier for Bosch Heavy-Duty Rotary Hammers, Tata High-Tensile Threaded Rods & Fischer Nylon Anchors.',
    '📦 Special Project Notice: Same-day warehouse pickup available for verified contractors at Central Delhi Logistics Hub.',
  ];

  /**
   * Fetch current site settings from backend on component mount.
   */
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setMarqueeMessage(data.settings.marqueeMessage || '');
            setOriginalMessage(data.settings.marqueeMessage || '');
            setMetaInfo({
              updatedAt: data.settings.updatedAt,
              updatedBy: data.settings.updatedBy?.name || data.settings.updatedBy?.email,
            });
          }
        } else {
          setStatusMsg({ type: 'error', text: 'Failed to load existing settings from server.' });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setStatusMsg({ type: 'error', text: 'Network error loading settings.' });
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  /**
   * Saves updated marquee message to the server via PUT /api/admin/settings.
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marqueeMessage }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOriginalMessage(marqueeMessage);
        setStatusMsg({
          type: 'success',
          text: marqueeMessage.trim()
            ? 'Marquee message saved! Live banner updated across the storefront.'
            : 'Marquee banner cleared! Header banner is now hidden on all pages.',
        });
        if (data.settings?.updatedAt) {
          setMetaInfo((prev) => ({
            ...prev,
            updatedAt: data.settings.updatedAt,
          }));
        }
      } else {
        setStatusMsg({
          type: 'error',
          text: data.message || 'Failed to update site settings.',
        });
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      setStatusMsg({ type: 'error', text: 'Network error saving settings.' });
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = marqueeMessage !== originalMessage;

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
          <Link href="/admin" style={{ color: 'var(--text-muted)' }}>Admin</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>Site Settings</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px' }}>
          Storefront Settings & Announcements
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
          Manage global storefront features without code deploys. Changes apply instantly across the site.
        </p>
      </div>

      {/* Status Alert Notification */}
      {statusMsg && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: statusMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${statusMsg.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            color: statusMsg.type === 'success' ? 'var(--color-emerald)' : 'var(--color-rose)',
          }}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>{statusMsg.text}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading site settings...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Main Card: Header Marquee Banner */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-amber-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-amber)',
                }}
              >
                <Megaphone size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 2px' }}>
                  Top Header Marquee Bar
                </h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: 0 }}>
                  Part 1 of the header navigation strip. Full-width ticker displayed on all public pages.
                </p>
              </div>
            </div>

            {/* Explanatory Info Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                fontSize: '0.86rem',
                color: 'var(--text-muted)',
                marginBottom: '20px',
              }}
            >
              <Info size={16} style={{ color: 'var(--color-amber)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Visibility Rule:</strong> When this field contains text, the ticker scrolls continuously across the top of every page. If left blank, the marquee strip automatically collapses to <strong>0 height</strong> with no blank gap.
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="marquee-input"
                  style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}
                >
                  Announcement Message
                </label>
                <textarea
                  id="marquee-input"
                  rows={3}
                  value={marqueeMessage}
                  onChange={(e) => setMarqueeMessage(e.target.value)}
                  placeholder="Enter important trade announcements, holiday delivery schedules, or GST notice..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '0.95rem',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-main)',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  <span>{marqueeMessage.length} characters</span>
                  {marqueeMessage && (
                    <button
                      type="button"
                      onClick={() => setMarqueeMessage('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-rose)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      Clear message (Hide banner)
                    </button>
                  )}
                </div>
              </div>

              {/* Preset Quick Actions */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Quick Preset Suggestions:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {presetAlerts.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMarqueeMessage(preset)}
                      style={{
                        textAlign: 'left',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px 12px',
                        fontSize: '0.84rem',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                    >
                      <span style={{ color: 'var(--color-amber)', fontWeight: 700, marginRight: '6px' }}>+ Use:</span>
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Band */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  <Eye size={15} style={{ color: 'var(--color-amber)' }} />
                  Live Preview:
                </div>
                {marqueeMessage.trim() ? (
                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      borderTop: '1px solid var(--border-subtle)',
                      borderBottom: '1px solid var(--border-subtle)',
                      padding: '8px 16px',
                      overflow: 'hidden',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-main)' }}>
                      <span style={{ color: 'var(--color-amber)', fontWeight: 700 }}>[PREVIEW]</span>
                      {marqueeMessage}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '12px 16px',
                      background: 'var(--bg-secondary)',
                      border: '1px dashed var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      color: 'var(--text-dim)',
                      textAlign: 'center',
                    }}
                  >
                    Banner is empty — marquee band will collapse to 0px height on the storefront.
                  </div>
                )}
              </div>

              {/* Actions & Meta */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {metaInfo?.updatedAt && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      Last updated: {new Date(metaInfo.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {metaInfo?.updatedBy && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <UserCheck size={13} />
                      By: {metaInfo.updatedBy}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {hasUnsavedChanges && (
                    <button
                      type="button"
                      onClick={() => setMarqueeMessage(originalMessage)}
                      className="btn btn-outline"
                      style={{ fontSize: '0.88rem', padding: '8px 14px' }}
                    >
                      <RotateCcw size={14} style={{ marginRight: '5px' }} />
                      Reset
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saving || !hasUnsavedChanges}
                    className="btn btn-primary"
                    style={{
                      fontSize: '0.88rem',
                      padding: '8px 18px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: saving || !hasUnsavedChanges ? 0.6 : 1,
                      cursor: saving || !hasUnsavedChanges ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Save size={15} />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
