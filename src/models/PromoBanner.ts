/**
 * @file PromoBanner.ts
 * @description Mongoose model for rectangular promotional tiles featured on the homepage.
 * Per docs/03-data-models.md & docs/08-homepage-layout.md.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPromoBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  linkUrl: string;
  badge?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PromoBannerSchema: Schema<IPromoBanner> = new Schema(
  {
    // Promotional heading (e.g. 'High-Tensile Fasteners', 'Bosch Heavy Rotary Hammers')
    title: {
      type: String,
      required: [true, 'Promo banner title is required'],
      trim: true,
    },
    // Supporting text or category highlight
    subtitle: {
      type: String,
      trim: true,
    },
    // Background card image URL
    image: {
      type: String,
      required: [true, 'Promo banner image is required'],
      default: '/images/products/default-product.png',
      trim: true,
    },
    // Target destination link (e.g. /category/fasteners-fixings or /use/heavy-construction)
    linkUrl: {
      type: String,
      required: [true, 'Link URL is required'],
      trim: true,
      default: '/products',
    },
    // Optional badge (e.g. 'HOT', 'NEW', 'WHOLESALE')
    badge: {
      type: String,
      trim: true,
    },
    // Display sorting order on the banner strip
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    // Active flag
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const PromoBanner: Model<IPromoBanner> =
  mongoose.models.PromoBanner || mongoose.model<IPromoBanner>('PromoBanner', PromoBannerSchema);

export default PromoBanner;
