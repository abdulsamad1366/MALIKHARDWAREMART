/**
 * @file page.tsx
 * @route /products/[slug]
 * @description Product detail page rendering full technical specifications, description,
 * and Section 5 placeholder fallback.
 * PRICE GATE: Strictly relies on /api/products/[slug] server-side gating to ensure guests
 * never receive price data in the initial or client response.
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import ProductDetailClient from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generates SEO metadata dynamically for product pages per Section 9.
 */
export async function generateMetadata(
  props: ProductPageProps
): Promise<Metadata> {
  const { slug } = await props.params;

  try {
    await connectToDatabase();
    const product = await Product.findOne({ slug }).select('name description brand');

    if (!product) {
      return {
        title: 'Product Not Found — Malik Hardware Mart',
      };
    }

    return {
      title: `${product.name} — ${product.brand} | Malik Hardware Mart`,
      description: `${product.description.slice(0, 160)}... Buy authentic ${product.brand} wholesale hardware.`,
      openGraph: {
        title: `${product.name} — Malik Hardware Mart`,
        description: product.description.slice(0, 160),
      },
    };
  } catch {
    return {
      title: 'Industrial Hardware Catalog — Malik Hardware Mart',
    };
  }
}

/**
 * Server Component wrapper for Product Detail Page.
 */
export default async function ProductDetailPage(props: ProductPageProps) {
  // Await asynchronous params per Next.js 15+ convention
  const { slug } = await props.params;

  await connectToDatabase();

  // Fetch initial product document to verify existence
  const productDoc = await Product.findOne({ slug })
    .populate('category', 'name slug placeholderImage')
    .lean();

  if (!productDoc) {
    notFound();
  }

  return (
    <div style={{ padding: '32px 0 60px' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '24px' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <span>/</span>
          <Link href="/products" style={{ color: 'var(--text-muted)' }}>Catalog</Link>
          <span>/</span>
          {productDoc.category && (
            <>
              <Link
                href={`/category/${(productDoc.category as unknown as { slug: string }).slug}`}
                style={{ color: 'var(--text-muted)' }}
              >
                {(productDoc.category as unknown as { name: string }).name}
              </Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>{productDoc.name}</span>
        </div>

        {/* Client interactive detail container */}
        <ProductDetailClient slug={slug} initialProduct={JSON.parse(JSON.stringify(productDoc))} />
      </div>
    </div>
  );
}
