/**
 * @file page.tsx
 * @route /use/[slug]
 * @description Application/Use-Case filtered catalog listing page.
 * Per docs/05-routes.md & docs/08-homepage-layout.md.
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Compass } from 'lucide-react';
import { connectToDatabase } from '@/lib/db';
import UseCase from '@/models/UseCase';
import UseCaseClientListing from './UseCaseClientListing';

interface UseCasePageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generates SEO metadata for the use case page.
 */
export async function generateMetadata(
  props: UseCasePageProps
): Promise<Metadata> {
  const { slug } = await props.params;

  try {
    await connectToDatabase();
    const useCase = await UseCase.findOne({ slug }).select('name description');

    if (!useCase) {
      return {
        title: 'Application Not Found — Malik Hardware Mart',
      };
    }

    return {
      title: `${useCase.name} Hardware & Tools — Malik Hardware Mart`,
      description: useCase.description || `Industrial hardware, fasteners, and power tools specified for ${useCase.name}.`,
    };
  } catch {
    return {
      title: 'Shop by Application — Malik Hardware Mart',
    };
  }
}

/**
 * Server Component wrapper for Use Case Page.
 */
export default async function UseCasePage(props: UseCasePageProps) {
  const { slug } = await props.params;

  await connectToDatabase();
  const useCaseDoc = await UseCase.findOne({ slug }).lean();

  if (!useCaseDoc) {
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
          <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>{useCaseDoc.name}</span>
        </div>

        {/* Use Case Header Hero */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: '1fr 220px',
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
              <span>Back to Catalog</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  background: 'var(--color-amber-bg)',
                  color: 'var(--color-amber)',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Application Focus
              </span>
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '12px' }}>
              {useCaseDoc.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '680px' }}>
              {useCaseDoc.description || 'Specialized hardware grades, fixings, and commercial tools optimized for this site environment.'}
            </p>
          </div>

          <div
            style={{
              height: '180px',
              width: '180px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid var(--border-medium)',
              background: '#000',
              justifySelf: 'center',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <img
              src={useCaseDoc.image || '/images/products/default-product.png'}
              alt={useCaseDoc.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Client filtered product list */}
        <UseCaseClientListing useCaseSlug={slug} />
      </div>
    </div>
  );
}
