/**
 * @file Cart.ts
 * @description Mongoose model for persistent user shopping carts.
 * Persisted server-side against the user so items survive device switches per Section 4.3.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICartItem {
  _id?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  priceAtAdd: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema(
  {
    // Reference to selected catalog product - Required
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // Desired quantity of items - Required (must be at least 1)
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    // Snapshot of the trade price when added to cart - Required
    priceAtAdd: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const CartSchema: Schema<ICart> = new Schema(
  {
    // Reference to authenticated customer who owns this cart - Required (unique per user)
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    // Array of cart line items - Optional (defaults to empty array)
    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt timestamps
  }
);

// Prevent re-compilation of model in Next.js development hot-reloads
const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
