'use client';

/**
 * @file page.tsx
 * @route /products
 * @description Catalog listing page with multi-facet filtering (category, brand, search keyword).
 * Enforces Section 7 server-side price gating: price is omitted from the API response for guests
 * and unlocked with 'Add to Cart' buttons for authenticated users.
 */

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, RotateCcw, Lock, Check } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  // PRICE GATE: do not send price to unauthenticated requests
  price?: number;
  imageUrl?: string | null;
  stockStatus: 'in_stock' | 'out_of_stock' | 'on_request';
  category?: {
    name: string;
    slug: string;
    placeholderImage?: string;
  };
  specs?: Array<{ key: string; value: string }>;
}

/**
 * Catalog Content with search parameters inspection.
 */
function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [, startTransition] = useTransition();

  // Query states
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const searchParam = searchParams.get('search') || '';

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [selectedBrand, setSelectedBrand] = useState(brandParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

  // Available brands derived from products or static list
  const availableBrands = [
    'Bosch',
    'Stanley',
    'Taparia',
    'Malik Forge',
    'Fischer',
    'Havells',
    'Polycab',
    'Supreme',
    'Zoloto',
    'Godrej',
    '3M',
    'Karam',
    'Asian Paints',
    'Bostik',
  ];

  // Synchronize state when URL query parameters change
  useEffect(() => {
    setSearchTerm(searchParam);
    setSelectedBrand(brandParam);
    setSelectedCategory(categoryParam);
  }, [searchParam, brandParam, categoryParam]);

  // Load categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch filtered products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedBrand) params.set('brand', selectedBrand);
        if (searchTerm) params.set('search', searchTerm);

        // Server-side price gate is executed inside this endpoint
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory, selectedBrand, searchTerm, isAuthenticated]);

  /**
   * Applies filters and updates the browser URL without full page reload.
   */
  const applyFilter = (newCat: string, newBrand: string, newSearch: string) => {
    const params = new URLSearchParams();
    if (newCat) params.set('category', newCat);
    if (newBrand) params.set('brand', newBrand);
    if (newSearch) params.set('search', newSearch);

    startTransition(() => {
      router.push(`/products${params.toString() ? `?${params.toString()}` : ''}`);
    });
  };

  /**
   * Clears all active filters.
   */
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('');
    setSelectedCategory('');
    startTransition(() => {
      router.push('/products');
    });
  };

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        {/* Page Title & Breadcrumb Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
            <span>Home</span>
            <span>/</span>
            <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>Wholesale Catalog</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>Commercial Hardware Catalog</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
                Browse verified industrial supplies, technical specifications, and live warehouse inventory.
              </p>
            </div>

            {/* Authentication & Price Visibility Banner */}
            {!isAuthenticated ? (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.85rem',
                }}
              >
                <Lock size={16} style={{ color: 'var(--color-amber)' }} />
                <span>Guest View: Wholesale prices are hidden.</span>
                <button
                  onClick={() => router.push('/login?redirect=/products')}
                  className="btn-outline-amber"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  Login to unlock
                </button>
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  color: 'var(--color-emerald)',
                }}
              >
                <Check size={16} />
                <span>Trade Pricing & Add-to-Cart Unlocked</span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginBottom: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Search Box */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '42px', height: '44px' }}
              placeholder="Filter by keyword (e.g. 'Bosch', 'SS-304', 'Valve')..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                applyFilter(selectedCategory, selectedBrand, e.target.value);
              }}
            />
          </div>

          {/* Category Dropdown */}
          <div style={{ flex: '0 1 220px' }}>
            <select
              className="form-select"
              style={{ height: '44px' }}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                applyFilter(e.target.value, selectedBrand, searchTerm);
              }}
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div style={{ flex: '0 1 200px' }}>
            <select
              className="form-select"
              style={{ height: '44px' }}
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                applyFilter(selectedCategory, e.target.value, searchTerm);
              }}
            >
              <option value="">All Brands</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {(selectedCategory || selectedBrand || searchTerm) && (
            <button
              onClick={handleClearFilters}
              className="btn-secondary"
              style={{ height: '44px', padding: '0 16px', fontSize: '0.85rem' }}
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Results Counter & Active Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--text-main)' }}>{products.length}</strong> products
            {selectedCategory && ` in category '${selectedCategory}'`}
            {selectedBrand && ` by '${selectedBrand}'`}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            Loading catalog specifications...
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-medium)',
            }}
          >
            <Filter size={40} style={{ color: 'var(--color-amber)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No products match your criteria</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Try adjusting your category, brand, or search filters.
            </p>
            <button onClick={handleClearFilters} className="btn-primary">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                name={product.name}
                slug={product.slug}
                brand={product.brand}
                price={product.price}
                imageUrl={product.imageUrl}
                stockStatus={product.stockStatus}
                category={product.category}
                specs={product.specs}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Root Products Page with Suspense boundary for useSearchParams.
 */
export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>Loading catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
