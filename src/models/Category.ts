/**
 * @file Category.ts
 * @description Mongoose model for product categories with hierarchical nesting support.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  parentCategory?: mongoose.Types.ObjectId | null;
  placeholderImage?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    // Category display name (e.g., 'Hand & Power Tools') - Required for customer navigation
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    // URL-friendly unique identifier (e.g., 'hand-power-tools') - Required for routing
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Reference to parent category for nested subcategories - Optional (null for top-level categories)
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    // Local placeholder image path per Section 5 (e.g., '/images/products/category-tools.png') - Optional
    placeholderImage: {
      type: String,
      default: '/images/products/default-product.png',
    },
    // Short category overview for SEO and banner display - Optional
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt timestamps
  }
);

// Prevent re-compilation of model in Next.js development hot-reloads
const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
