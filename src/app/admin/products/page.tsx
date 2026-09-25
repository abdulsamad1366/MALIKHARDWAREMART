'use client';

/**
 * @file page.tsx
 * @route /admin/products
 * @access Admin only per Section 2 & 7
 * @description Product CRUD administration interface.
 * Enables adding new catalog items, updating specifications, pricing,
 * stock status, and managing Section 5 local image references.
 */

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  AlertCircle,
  Package,
} from 'lucide-react';
import { getProductImageUrl, handleImageError } from '@/lib/imageFallback';

interface CategoryDoc {
  _id: string;
  name: string;
  slug: string;
}

interface ProductSpec {
  key: string;
  value: string;
}

interface AdminProductItem {
  _id: string;
  name: string;
  slug: string;
  category: CategoryDoc | string;
  brand: string;
  description: string;
  specs: ProductSpec[];
  imageUrl?: string | null;
  price: number;
  stockStatus: 'in_stock' | 'out_of_stock' | 'on_request';
  featured: boolean;
}

/**
 * Admin Products CRUD Page Component.
 */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStockStatus, setFormStockStatus] = useState<'in_stock' | 'out_of_stock' | 'on_request'>('in_stock');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formSpecs, setFormSpecs] = useState<ProductSpec[]>([
    { key: 'Material', value: '' },
    { key: 'Standard', value: '' },
  ]);

  // Load products and categories from Admin API
  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/categories'),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      if (prodData.success) {
        setProducts(prodData.products || []);
      }
      if (catData.success) {
        setCategories(catData.categories || []);
      }
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Opens modal to create a new product.
   */
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormName('');
    setFormSlug('');
    setFormCategory(categories[0]?._id || '');
    setFormBrand('');
    setFormPrice('');
    setFormStockStatus('in_stock');
    setFormImageUrl('');
    setFormDescription('');
    setFormFeatured(false);
    setFormSpecs([
      { key: 'Material', value: '' },
      { key: 'Standard', value: '' },
    ]);
    setFormError('');
    setShowModal(true);
  };

  /**
   * Opens modal pre-filled to edit an existing product.
   */
  const handleOpenEdit = (product: AdminProductItem) => {
    setEditingId(product._id);
    setFormName(product.name);
    setFormSlug(product.slug);
    setFormCategory(
      typeof product.category === 'object' ? product.category._id : product.category
    );
    setFormBrand(product.brand);
    setFormPrice(product.price.toString());
    setFormStockStatus(product.stockStatus);
    setFormImageUrl(product.imageUrl || '');
    setFormDescription(product.description);
    setFormFeatured(Boolean(product.featured));
    setFormSpecs(
      product.specs && product.specs.length > 0
        ? product.specs
        : [{ key: 'Material', value: '' }]
    );
    setFormError('');
    setShowModal(true);
  };

  /**
   * Handles saving (POST for new, PUT for existing).
   */
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName || !formCategory || !formBrand || !formPrice || !formDescription) {
      setFormError('Please fill in all mandatory product fields.');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId ? 'PUT' : 'POST';

      const payload = {
        name: formName,
        slug: formSlug || undefined,
        category: formCategory,
        brand: formBrand,
        price: parseFloat(formPrice),
        stockStatus: formStockStatus,
        imageUrl: formImageUrl || null,
        description: formDescription,
        featured: formFeatured,
        specs: formSpecs.filter((s) => s.key.trim() && s.value.trim()),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowModal(false);
        setSuccessNotice(editingId ? 'Product updated successfully' : 'Product created successfully');
        setTimeout(() => setSuccessNotice(''), 3000);
        await loadData();
      } else {
        setFormError(data.message || 'Failed to save product.');
      }
    } catch {
      setFormError('Network error while saving product.');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Deletes a product by ID.
   */
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete '${name}'?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessNotice(`Deleted '${name}'`);
        setTimeout(() => setSuccessNotice(''), 3000);
        await loadData();
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Specs array helpers
  const handleAddSpecRow = () => {
    setFormSpecs([...formSpecs, { key: '', value: '' }]);
  };

  const handleUpdateSpec = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...formSpecs];
    updated[index][field] = value;
    setFormSpecs(updated);
  };

  const handleRemoveSpec = (index: number) => {
    setFormSpecs(formSpecs.filter((_, i) => i !== index));
  };

  // Filter products by keyword
  const filteredProducts = products.filter((p) => {
    const search = searchFilter.toLowerCase();
    const catName = typeof p.category === 'object' ? p.category.name : '';
    return (
      p.name.toLowerCase().includes(search) ||
      p.brand.toLowerCase().includes(search) ||
      catName.toLowerCase().includes(search)
    );
  });

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>Product Catalog CRUD</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Add, update, or remove hardware products, wholesale rates, and inventory status.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn-primary" style={{ fontSize: '0.9rem' }}>
          <Plus size={16} />
          <span>Add New Hardware Product</span>
        </button>
      </div>

      {successNotice && (
        <div
          style={{
            background: 'var(--color-emerald-bg)',
            border: '1px solid var(--color-emerald)',
            color: 'var(--color-emerald)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={16} />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px', height: '40px' }}
            placeholder="Search by title, brand, or category..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
          {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Table Card */}
      <div className="data-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Package size={40} style={{ color: 'var(--color-amber)', margin: '0 auto 12px' }} />
            <p>No products match the filter.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Image</th>
                <th>Product Name & Brand</th>
                <th>Category</th>
                <th>Trade Wholesale Price</th>
                <th>Stock Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const catObj = typeof p.category === 'object' ? p.category : null;
                const catSlug = catObj?.slug;
                const imgUrl = getProductImageUrl(p.imageUrl, catSlug);

                return (
                  <tr key={p._id}>
                    <td>
                      <img
                        src={imgUrl}
                        alt={p.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', background: '#000' }}
                        onError={handleImageError}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-amber)', fontWeight: 600 }}>
                        {p.brand} {p.featured && <span style={{ color: 'var(--color-orange)' }}>• Featured</span>}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {catObj ? catObj.name : 'General'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--color-amber)' }}>
                        ₹{p.price.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`product-badge-stock ${
                          p.stockStatus === 'in_stock'
                            ? 'stock-in'
                            : p.stockStatus === 'out_of_stock'
                            ? 'stock-out'
                            : 'stock-request'
                        }`}
                        style={{ position: 'static' }}
                      >
                        {p.stockStatus === 'in_stock'
                          ? 'In Stock'
                          : p.stockStatus === 'out_of_stock'
                          ? 'Out of Stock'
                          : 'On Request'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          title="Edit Product"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--color-rose)' }}
                          title="Delete Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
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
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {editingId ? 'Edit Hardware Product' : 'Add New Hardware Product'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  background: 'var(--color-rose-bg)',
                  border: '1px solid var(--color-rose)',
                  color: 'var(--color-rose)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">Product Name / Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Bosch Rotary Hammer Drill GBH 2-26"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Manufacturer Brand *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Bosch, Stanley, Malik Forge"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Wholesale Trade Price (₹ INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-input"
                    placeholder="e.g. 8450"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Inventory Stock Status *</label>
                  <select
                    className="form-select"
                    value={formStockStatus}
                    onChange={(e) => setFormStockStatus(e.target.value as typeof formStockStatus)}
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="on_request">On Request</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL (Optional — Falls back per Section 5 if empty)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. /images/products/my-drill.jpg (leave empty for default-product.png)"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Technical Description *</label>
                <textarea
                  rows={3}
                  required
                  className="form-textarea"
                  placeholder="Enter detailed industrial overview, applications, warranty..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Dynamic Key-Value Specs */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Technical Specifications (Key - Value)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="btn-outline-amber"
                    style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                  >
                    + Add Attribute
                  </button>
                </div>

                {formSpecs.map((spec, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Property (e.g. Material)"
                      value={spec.key}
                      onChange={(e) => handleUpdateSpec(idx, 'key', e.target.value)}
                      style={{ flex: 1, height: '36px' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Value (e.g. SS-304)"
                      value={spec.value}
                      onChange={(e) => handleUpdateSpec(idx, 'value', e.target.value)}
                      style={{ flex: 1, height: '36px' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      style={{ background: 'transparent', color: 'var(--color-rose)', padding: '4px' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="featured"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="featured" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Pin to Homepage Spotlight Grid (Featured)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
