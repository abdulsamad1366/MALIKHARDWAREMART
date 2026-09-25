/**
 * @file HeroSlide.ts
 * @description Mongoose model for full-width homepage hero carousel slides.
 * Per docs/03-data-models.md & docs/08-homepage-layout.md.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHeroSlide extends Document {
  imageUrl: string;
  headline?: string;
  subheadline?: string;
  linkUrl?: string;
  buttonText?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSlideSchema: Schema<IHeroSlide> = new Schema(
  {
    // Background banner image URL (falls back to /images/hero-banner.jpg)
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      default: '/images/hero-banner.jpg',
      trim: true,
    },
    // Optional headline text overlay
    headline: {
      type: String,
      trim: true,
    },
    // Optional subheadline / explanatory text
    subheadline: {
      type: String,
      trim: true,
    },
    // Link destination when slide or CTA button is clicked
    linkUrl: {
      type: String,
      trim: true,
      default: '/products',
    },
    // CTA button text (e.g. 'Explore Catalog', 'View Fasteners')
    buttonText: {
      type: String,
      trim: true,
      default: 'Explore Products',
    },
    // Display sorting order on the carousel (ascending)
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    // Active flag allowing admins to disable slides without deleting
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

const HeroSlide: Model<IHeroSlide> =
  mongoose.models.HeroSlide || mongoose.model<IHeroSlide>('HeroSlide', HeroSlideSchema);

export default HeroSlide;
