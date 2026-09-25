/**
 * @file page.tsx
 * @route /blog/[slug]
 * @access Public per docs/04-access-control.md & docs/05-routes.md
 * @description Single blog article view presenting technical hardware specifications,
 * contractor installation guidelines, and procurement best practices.
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Calendar, User, ArrowLeft, Clock, Share2, Tag, ShieldCheck, PhoneCall, Building2 } from 'lucide-react';
import { connectToDatabase } from '@/lib/db';
import BlogPost, { IBlogPost } from '@/models/BlogPost';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Dynamic SEO metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  const post = await BlogPost.findOne({ slug, isPublished: true }).lean();

  if (!post) {
    return {
      title: 'Article Not Found — Malik Hardware Mart',
    };
  }

  return {
    title: `${post.title} — Malik Hardware Mart`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : ['/images/products/default-product.png'],
    },
  };
}

/**
 * Fetches a single published post by slug.
 */
async function getPost(slug: string): Promise<IBlogPost | null> {
  try {
    await connectToDatabase();
    const post = await BlogPost.findOne({ slug, isPublished: true }).lean();
    return post ? JSON.parse(JSON.stringify(post)) : null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

/**
 * Single blog post article component.
 */
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Recently Published';

  // Approximate reading time (200 words per minute)
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div style={{ padding: '40px 0 80px', minHeight: '80vh' }}>
      <article className="container" style={{ maxWidth: '840px' }}>
        {/* Breadcrumb Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: 'var(--text-dim)',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/" style={{ color: 'var(--text-muted)' }}>
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" style={{ color: 'var(--text-muted)' }}>
            Blog
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--color-amber)', fontWeight: 600, maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {post.title}
          </span>
        </div>

        {/* Back Link */}
        <Link
          href="/blog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontSize: '0.88rem',
            marginBottom: '24px',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={15} />
          Back to all guides
        </Link>

        {/* Article Header */}
        <header style={{ marginBottom: '32px' }}>
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
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Technical Guide
          </span>

          <h1
            style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
              marginBottom: '18px',
              color: 'var(--text-main)',
            }}
          >
            {post.title}
          </h1>

          {/* Author & Meta Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '20px',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '0.88rem',
              color: 'var(--text-dim)',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-main)' }}>
                <User size={15} style={{ color: 'var(--color-amber)' }} />
                {post.authorName || 'Malik Technical Desk'}
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} />
                {formattedDate}
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} />
                {readingTime} min read
              </span>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} style={{ color: 'var(--color-emerald)' }} />
              Verified Technical Content
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        {post.coverImage && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '380px',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              marginBottom: '36px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Lead Excerpt Banner */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderLeft: '4px solid var(--color-amber)',
            padding: '20px 24px',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            marginBottom: '36px',
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: 'var(--text-main)',
            fontWeight: 500,
          }}
        >
          {post.excerpt}
        </div>

        {/* Article Body Content */}
        <div
          style={{
            lineHeight: 1.8,
            fontSize: '1.05rem',
            color: 'var(--text-main)',
          }}
          className="blog-content-body"
        >
          {post.content.includes('<') && post.content.includes('>') ? (
            // Render HTML if content contains HTML tags
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            // Plain text or markdown paragraphs
            post.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} style={{ marginBottom: '20px' }}>
                {paragraph}
              </p>
            ))
          )}
        </div>

        {/* Contractor B2B Callout Box */}
        <div
          style={{
            marginTop: '56px',
            padding: '32px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '280px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--color-amber)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
              }}
            >
              <Building2 size={13} /> Direct Wholesale Fulfillment
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>
              Procuring for an Active Industrial Project?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
              Get mill test certificates, volume discount slabs, and GST ITC invoices delivered with scheduled freight.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/contact-us" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <PhoneCall size={15} />
              Submit RFQ
            </Link>
            <Link href="/products" className="btn btn-outline">
              Browse Products
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
