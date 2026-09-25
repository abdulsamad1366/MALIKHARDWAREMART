/**
 * @file page.tsx
 * @route /category/[category-slug]
 * @description Category-filtered catalog listing page with Section 5 fallback image
 * and Section 7 server-side price gating.
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { connectToDatabase } from '@/lib/db';
import Category from '@/models/Category';
import CategoryClientListing from './CategoryClientListing';

interface CategoryPageProps {
  params: Promise<{
    'category-slug': string;
  }>;
}

/**
 * Generates SEO metadata for the category page per Section 9.
 */
export async function generateMetadata(
  props: CategoryPageProps
): Promise<Metadata> {
  const { 'category-slug': categorySlug } = await props.params;

  try {
    await connectToDatabase();
    const category = await Category.findOne({ slug: categorySlug }).select('name description');

    if (!category) {
      return {
        title: 'Category Not Found — Malik Hardware Mart',
      };
    }

    return {
      title: `${category.name} Wholesale Catalog — Malik Hardware Mart`,
      description: category.description || `Browse wholesale ${category.name} supplies, tools, and contractor hardware.`,
    };
  } catch {
    return {
      title: 'Wholesale Category — Malik Hardware Mart',
    };
  }
}

/**
 * Server Component wrapper for Category Page.
 */
export default async function CategoryPage(props: CategoryPageProps) {
  const { 'category-slug': categorySlug } = await props.params;

  await connectToDatabase();

  const categoryDoc = await Category.findOne({ slug: categorySlug }).lean();
  if (!categoryDoc) {
    notFound();
  }

  return (
    <div style={{ padding: '36px 0 60px' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '24px' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <span>/</span>
          <Link href="/products" style={{ color: 'var(--text-muted)' }}>Catalog</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>{categoryDoc.name}</span>
        </div>

        {/* Category Header Hero */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: '1fr 280px',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          <div>
            <Link
              href="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                color: 'var(--color-amber)',
                marginBottom: '12px',
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to All Categories</span>
            </Link>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '12px' }}>
              {categoryDoc.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '680px' }}>
              {categoryDoc.description || 'Full range of commercial specifications, wholesale packs, and site deliveries.'}
            </p>
          </div>

          <div
            style={{
              height: '180px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              background: '#000',
            }}
          >
            <img
              src={categoryDoc.placeholderImage || '/images/products/default-product.png'}
              alt={categoryDoc.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Client filtered product list */}
        <CategoryClientListing categorySlug={categorySlug} />
      </div>
    </div>
  );
}
