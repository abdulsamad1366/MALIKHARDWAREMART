'use client';

/**
 * @file page.tsx
 * @route /products
 * @description Catalog listing page with multi-facet filtering (category, brand, search keyword).
 * Styled with Apple & Google design system using Tailwind CSS and Framer Motion.
 * Enforces Section 7 server-side price gating: price is omitted from the API response for guests
 * and unlocked with 'Add to Cart' buttons for authenticated users.
 */

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, RotateCcw, Lock, Check } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { motion, useReducedMotion } from 'framer-motion';

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

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [, startTransition] = useTransition();
  const shouldReduceMotion = useReducedMotion();

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

  useEffect(() => {
    setSearchTerm(searchParam);
    setSelectedBrand(brandParam);
    setSelectedCategory(categoryParam);
  }, [searchParam, brandParam, categoryParam]);

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

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedBrand) params.set('brand', selectedBrand);
        if (searchTerm) params.set('search', searchTerm);

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

  const applyFilter = (cat: string, brd: string, q: string) => {
    const params = new URLSearchParams();
    if (cat) params.set('category', cat);
    if (brd) params.set('brand', brd);
    if (q) params.set('search', q);

    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('');
    setSelectedCategory('');
    startTransition(() => {
      router.push('/products');
    });
  };

  return (
    <div className="py-10 sm:py-12 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Page Title & Breadcrumb Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <span>Home</span>
            <span>/</span>
            <span className="text-red-600 font-bold">Wholesale Catalog</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Commercial Hardware Catalog
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Browse verified industrial supplies, technical specifications, and live warehouse inventory.
              </p>
            </div>

            {/* Authentication & Price Visibility Banner */}
            {!isAuthenticated ? (
              <div className="inline-flex items-center gap-3 p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-900">
                <Lock size={15} className="text-amber-600 shrink-0" />
                <span className="font-medium">Guest View: Wholesale prices are hidden.</span>
                <button
                  onClick={() => router.push('/login?redirect=/products')}
                  className="px-3 py-1 rounded-full bg-slate-900 hover:bg-red-600 text-white font-bold text-[11px] transition-colors"
                >
                  Login to unlock
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs font-bold text-emerald-800">
                <Check size={16} className="text-emerald-600 stroke-[3]" />
                <span>Trade Pricing & Add-to-Cart Unlocked</span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="bg-[#F5F5F7] border border-slate-200/80 rounded-2xl p-4 mb-8 flex flex-wrap gap-3 items-center justify-between shadow-sm">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              className="w-full h-11 pl-10 pr-4 bg-white rounded-xl text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200/80 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all"
              placeholder="Filter by keyword (e.g. 'Bosch', 'SS-304', 'Valve')..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                applyFilter(selectedCategory, selectedBrand, e.target.value);
              }}
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <select
              className="w-full h-11 px-4 bg-white rounded-xl text-sm font-medium text-slate-800 border border-slate-200/80 focus:outline-none focus:border-red-500"
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
          <div className="w-full sm:w-auto sm:min-w-[180px]">
            <select
              className="w-full h-11 px-4 bg-white rounded-xl text-sm font-medium text-slate-800 border border-slate-200/80 focus:outline-none focus:border-red-500"
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
              className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Results Counter */}
        <div className="text-xs font-semibold text-slate-500 mb-6">
          Showing <span className="font-bold text-slate-900">{products.length}</span> products
          {selectedCategory && ` in category '${selectedCategory}'`}
          {selectedBrand && ` by '${selectedBrand}'`}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            Loading catalog specifications...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#F5F5F7] rounded-3xl border border-dashed border-slate-300 max-w-lg mx-auto">
            <Filter size={36} className="text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No products match your criteria</h3>
            <p className="text-xs text-slate-500 mb-4">
              Try adjusting your category, brand, or search filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400 text-sm">Loading catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
