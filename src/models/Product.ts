/**
 * @file Product.ts
 * @description Mongoose model for catalog products.
 * Note: The 'price' field is sensitive B2B trade pricing and must never be exposed to guests.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductSpec {
  key: string;
  value: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: mongoose.Types.ObjectId;
  brand: string;
  description: string;
  specs: IProductSpec[];
  imageUrl?: string | null;
  // PRICE GATE: do not send price to unauthenticated requests
  price: number;
  stockStatus: 'in_stock' | 'out_of_stock' | 'on_request';
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSpecSchema = new Schema(
  {
    // Technical attribute key (e.g., 'Material', 'Thread Size', 'Grade') - Required
    key: {
      type: String,
      required: true,
      trim: true,
    },
    // Technical attribute value (e.g., 'Stainless Steel 316', 'M12 x 1.75') - Required
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const ProductSchema: Schema<IProduct> = new Schema(
  {
    // Product commercial title (e.g., 'Heavy Duty Brass Gate Valve 1 inch') - Required
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    // URL-friendly unique slug (e.g., 'heavy-duty-brass-gate-valve-1-inch') - Required
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Reference to parent category - Required
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
      index: true,
    },
    // Manufacturer or trade brand name (e.g., 'Bosch', 'Stanley', 'Malik Forge') - Required
    brand: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      index: true,
    },
    // Comprehensive technical and usage product description - Required
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    // Key-value specifications array for technical comparison - Optional (defaults to empty array)
    specs: {
      type: [ProductSpecSchema],
      default: [],
    },
    // Relative image URL or null; falls back per Section 5 policy to default-product.png - Optional
    imageUrl: {
      type: String,
      default: null,
    },
    // PRICE GATE: do not send price to unauthenticated requests
    // Wholesale trade price in INR - Required on product creation, stripped on guest queries
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    // Inventory and dispatch status - Required (in_stock | out_of_stock | on_request)
    stockStatus: {
      type: String,
      enum: ['in_stock', 'out_of_stock', 'on_request'],
      default: 'in_stock',
      required: true,
    },
    // Flag to highlight item on homepage featured grid - Optional
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt timestamps
  }
);

// Prevent re-compilation of model in Next.js development hot-reloads
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
