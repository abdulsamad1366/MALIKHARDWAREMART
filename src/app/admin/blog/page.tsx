'use client';

/**
 * @file page.tsx
 * @route /admin/blog
 * @access Admin only per docs/04-access-control.md & docs/05-routes.md
 * @description Admin management dashboard for writing, editing, publishing,
 * and deleting technical articles and contractor guides.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  User,
  X,
  Save,
  ExternalLink,
} from 'lucide-react';

interface BlogPostItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorName: string;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Admin Blog Management Page Component.
 */
export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal / Form state for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formAuthorName, setFormAuthorName] = useState('Malik Technical Desk');
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Fetch all blog posts including drafts from GET /api/admin/blog.
   */
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/blog');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      } else {
        setError('Failed to fetch blog posts from server.');
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Network error fetching blog posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  /**
   * Opens modal in Create mode.
   */
  const handleOpenCreate = () => {
    setEditingPostId(null);
    setFormTitle('');
    setFormSlug('');
    setFormExcerpt('');
    setFormContent('');
    setFormCoverImage('/images/products/default-product.png');
    setFormAuthorName('Malik Technical Desk');
    setFormIsPublished(true);
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  /**
   * Opens modal in Edit mode.
   */
  const handleOpenEdit = (post: BlogPostItem) => {
    setEditingPostId(post._id);
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormExcerpt(post.excerpt);
    setFormContent(post.content);
    setFormCoverImage(post.coverImage || '/images/products/default-product.png');
    setFormAuthorName(post.authorName || 'Malik Technical Desk');
    setFormIsPublished(post.isPublished);
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  /**
   * Helper to auto-generate URL slug from title if in create mode.
   */
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingPostId) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormSlug(generated);
    }
  };

  /**
   * Saves post (Create via POST /api/admin/blog or Update via PUT /api/admin/blog/[id]).
   */
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formTitle || !formSlug || !formExcerpt || !formContent) {
      setError('Title, slug, excerpt, and content are required.');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingPostId ? `/api/admin/blog/${editingPostId}` : '/api/admin/blog';
      const method = editingPostId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          slug: formSlug,
          excerpt: formExcerpt,
          content: formContent,
          coverImage: formCoverImage,
          authorName: formAuthorName,
          isPublished: formIsPublished,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(editingPostId ? 'Article updated successfully!' : 'New article created successfully!');
        setIsModalOpen(false);
        fetchPosts();
      } else {
        setError(data.message || 'Failed to save blog post.');
      }
    } catch (err) {
      console.error('Error saving post:', err);
      setError('Network error saving blog post.');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Deletes an article via DELETE /api/admin/blog/[id].
   */
  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Article deleted successfully.');
        fetchPosts();
      } else {
        setError(data.message || 'Failed to delete article.');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Network error deleting article.');
    }
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
            <Link href="/admin" style={{ color: 'var(--text-muted)' }}>Admin</Link>
            <span>/</span>
            <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>Blog & Technical Guides</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px' }}>
            Technical Articles & Contractor Publications
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Author, edit, and publish technical guides, fastener specifications, and brand spotlights.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}
        >
          <Plus size={16} />
          Write New Guide
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div style={{ padding: '12px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', color: 'var(--color-emerald)', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
          <CheckCircle2 size={16} /> {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', color: 'var(--color-rose)', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Posts Table */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading blog articles...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <BookOpen size={44} style={{ color: 'var(--border-medium)', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px' }}>No Blog Articles Yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Create your first technical contractor guide or brand spotlight.
            </p>
            <button onClick={handleOpenCreate} className="btn btn-primary" style={{ fontSize: '0.88rem' }}>
              Write First Article
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Article</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700 }}>Author</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 16px', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post._id}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background var(--transition-fast)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                        {post.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <code>/blog/{post.slug}</code>
                        {post.isPublished && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            style={{ color: 'var(--color-amber)', display: 'inline-flex', alignItems: 'center' }}
                            title="View live post"
                          >
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '16px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {post.authorName || 'Trade Desk'}
                    </td>

                    <td style={{ padding: '16px 16px' }}>
                      {post.isPublished ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#ECFDF5',
                            color: 'var(--color-emerald)',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid #A7F3D0',
                          }}
                        >
                          <CheckCircle2 size={12} /> Published
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-dim)',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            padding: '3px 9px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--border-medium)',
                          }}
                        >
                          <Clock size={12} /> Draft
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '16px 16px', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="btn btn-outline"
                          style={{ padding: '6px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="Edit article"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id, post.title)}
                          style={{
                            background: 'none',
                            border: '1px solid #FECACA',
                            color: 'var(--color-rose)',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                          }}
                          title="Delete article"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-medium)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {editingPostId ? 'Edit Technical Article' : 'Write New Technical Guide'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePost} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Article Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Fastener Grades: 8.8 vs 10.9 for Heavy Fabrication"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '0.92rem',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                </div>

                {/* Slug */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    URL Slug * (Unique)
                  </label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="e.g. fastener-grades-8-8-vs-10-9"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '0.92rem',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                {/* Author & Cover Image Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={formAuthorName}
                      onChange={(e) => setFormAuthorName(e.target.value)}
                      placeholder="Malik Technical Desk"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '0.92rem',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      Cover Image Path
                    </label>
                    <input
                      type="text"
                      value={formCoverImage}
                      onChange={(e) => setFormCoverImage(e.target.value)}
                      placeholder="/images/products/default-product.png"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '0.92rem',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Excerpt / Short Summary * (Displays on cards)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    placeholder="A concise summary of technical specifications and application guidance..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '0.92rem',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Content */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    Full Article Body * (Plain text or HTML)
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Write detailed technical guidance, contractor procedures, torque values, or product comparisons..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '0.92rem',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      lineHeight: 1.5,
                    }}
                  />
                </div>

                {/* Publication Status Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                  <input
                    type="checkbox"
                    id="isPublishedCheck"
                    checked={formIsPublished}
                    onChange={(e) => setFormIsPublished(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-amber)', cursor: 'pointer' }}
                  />
                  <label htmlFor="isPublishedCheck" style={{ fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                    Publish live immediately (visible to all customers on /blog)
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.88rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}
                >
                  <Save size={15} />
                  {submitting ? 'Saving...' : editingPostId ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
