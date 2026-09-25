/**
 * @file page.tsx
 * @route /blog
 * @access Public per docs/04-access-control.md & docs/05-routes.md
 * @description Public blog listing page showcasing technical guides, fastener specifications,
 * brand reviews (Bosch, Hilti, Tata Steel), and contractor procurement advice.
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { Calendar, User, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { connectToDatabase } from '@/lib/db';
import BlogPost, { IBlogPost } from '@/models/BlogPost';

export const metadata: Metadata = {
  title: 'Contractor Blog & Technical Hardware Guides — Malik Hardware Mart',
  description:
    'Explore authoritative technical guides on high-tensile fasteners, power tool engineering, masonry anchors, and bulk hardware procurement standards.',
};

// Revalidate every 60 seconds or on-demand
export const revalidate = 60;

/**
 * Server component that fetches all published blog posts directly from MongoDB.
 */
async function getPublishedPosts(): Promise<IBlogPost[]> {
  try {
    await connectToDatabase();
    const posts = await BlogPost.find({ isPublished: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to load published blog posts:', error);
    return [];
  }
}

/**
 * Blog index page component.
 */
export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div style={{ padding: '40px 0 80px', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '1120px' }}>
        {/* Breadcrumb Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: 'var(--text-dim)',
            marginBottom: '24px',
          }}
        >
          <Link href="/" style={{ color: 'var(--text-muted)' }}>
            Home
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>
            Blog & Technical Guides
          </span>
        </div>

        {/* Page Header */}
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
            <BookOpen size={13} />
            Contractor Insights & Field Engineering
          </span>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: '16px',
              color: 'var(--text-main)',
            }}
          >
            Technical Hardware & Procurement Guides
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '1.1rem',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Field-tested knowledge on fastener grades, structural anchoring, power tool maintenance, and GST compliance for fabrication & building contractors.
          </p>
        </div>

        {/* Blog Post Grid */}
        {posts.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '60px 24px',
              textAlign: 'center',
            }}
          >
            <BookOpen size={48} style={{ color: 'var(--border-medium)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              No Articles Published Yet
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
              Our engineering desk is compiling comprehensive technical guides. Check back soon!
            </p>
            <Link href="/products" className="btn btn-primary">
              Browse Industrial Catalog
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '28px',
            }}
          >
            {posts.map((post) => {
              const formattedDate = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Recently Added';

              return (
                <article
                  key={post._id.toString()}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  className="blog-card-hover"
                >
                  {/* Article Thumbnail */}
                  <Link
                    href={`/blog/${post.slug}`}
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '210px',
                      background: 'var(--bg-secondary)',
                      display: 'block',
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={post.coverImage || '/images/products/default-product.png'}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </Link>

                  {/* Card Content */}
                  <div
                    style={{
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                    }}
                  >
                    {/* Meta info */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: '0.8rem',
                        color: 'var(--text-dim)',
                        marginBottom: '12px',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={13} style={{ color: 'var(--color-amber)' }} />
                        {formattedDate}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <User size={13} style={{ color: 'var(--text-muted)' }} />
                        {post.authorName || 'Trade Desk'}
                      </span>
                    </div>

                    {/* Headline */}
                    <h2
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        lineHeight: 1.35,
                        marginBottom: '12px',
                      }}
                    >
                      <Link
                        href={`/blog/${post.slug}`}
                        style={{
                          color: 'var(--text-main)',
                          textDecoration: 'none',
                        }}
                      >
                        {post.title}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    <p
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.92rem',
                        lineHeight: 1.55,
                        marginBottom: '20px',
                        flex: 1,
                      }}
                    >
                      {post.excerpt}
                    </p>

                    {/* Action link */}
                    <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                      <Link
                        href={`/blog/${post.slug}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'var(--color-amber)',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          textDecoration: 'none',
                        }}
                      >
                        Read Technical Guide
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
