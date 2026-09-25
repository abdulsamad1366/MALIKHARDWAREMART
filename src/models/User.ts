/**
 * @file User.ts
 * @description Mongoose model for customer and administrator accounts.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  isPriceVerified: boolean;
  phone?: string;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema(
  {
    // Contact name for shipping recipient - Required
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    // Direct mobile contact for courier and freight delivery - Required
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    // Street line, industrial plot or warehouse address - Required
    street: {
      type: String,
      required: true,
      trim: true,
    },
    // Municipality or city - Required
    city: {
      type: String,
      required: true,
      trim: true,
    },
    // State / province - Required
    state: {
      type: String,
      required: true,
      trim: true,
    },
    // Postal / PIN code for delivery routing - Required
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    // Country of dispatch - Required (defaults to India)
    country: {
      type: String,
      required: true,
      default: 'India',
      trim: true,
    },
    // Primary address flag for rapid checkout pre-fill - Optional
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const UserSchema: Schema<IUser> = new Schema(
  {
    // User or trade business representative full name - Required
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    // Unique contact and authentication email - Required
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Bcrypt salted password hash (never stored plain) - Required
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    // Authorization role controlling catalog pricing access & admin dashboard - Required ('customer' | 'admin')
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
      required: true,
    },
    // Administrative trade verification flag granting access to wholesale rates - Required (defaults to false for customers, true for admins)
    isPriceVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Contact telephone / mobile number for trade billing - Optional
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    // List of saved delivery and warehouse shipping addresses - Optional (defaults to empty array)
    addresses: {
      type: [AddressSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt timestamps
  }
);

// Prevent re-compilation of model in Next.js development hot-reloads
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
