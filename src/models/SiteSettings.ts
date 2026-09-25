/**
 * @file SiteSettings.ts
 * @description Mongoose model for global site configuration, including the admin-editable
 * top marquee ticker text. Stored as a single-document collection.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSettings extends Document {
  marqueeMessage: string;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema: Schema<ISiteSettings> = new Schema(
  {
    // Content displayed in the full-width scrolling header marquee - Optional (empty string collapses banner)
    marqueeMessage: {
      type: String,
      default: '',
      trim: true,
    },
    // Reference to administrator who last updated settings - Optional
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Prevent re-compilation of model across Next.js serverless invocations
const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
