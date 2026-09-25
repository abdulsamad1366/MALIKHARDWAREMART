/**
 * @file UseCase.ts
 * @description Mongoose model for the "Shop by Use" application taxonomy.
 * Represents functional usage contexts (e.g. Structural Steel, Heavy Construction, Industrial Plumbing).
 * Per docs/03-data-models.md & docs/08-homepage-layout.md.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUseCase extends Document {
  name: string;
  slug: string;
  image: string;
  description?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const UseCaseSchema: Schema<IUseCase> = new Schema(
  {
    // Application title (e.g. 'Structural Steel Fabrication', 'Commercial Electrical')
    name: {
      type: String,
      required: [true, 'Use case name is required'],
      trim: true,
    },
    // URL-friendly slug for routing /use/[slug]
    slug: {
      type: String,
      required: [true, 'Use case slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Circular thumbnail image URL (falls back to default-product.png)
    image: {
      type: String,
      required: [true, 'Use case thumbnail image is required'],
      default: '/images/products/default-product.png',
      trim: true,
    },
    // Brief technical description of the use case context
    description: {
      type: String,
      trim: true,
    },
    // Display sorting order on the circular grid
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const UseCase: Model<IUseCase> =
  mongoose.models.UseCase || mongoose.model<IUseCase>('UseCase', UseCaseSchema);

export default UseCase;
