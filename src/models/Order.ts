/**
 * @file Order.ts
 * @description Mongoose model for customer trade orders.
 * Captures historical product snapshots (priceAtOrder, name) and shipping details.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  priceAtOrder: number;
}

export interface IOrderShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IOrderShippingAddress;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    // Product identifier reference - Required
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // Product name snapshot at time of order placement - Required
    name: {
      type: String,
      required: true,
    },
    // Purchased quantity - Required
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    // Locked trade price per unit at moment of checkout - Required
    priceAtOrder: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const OrderShippingAddressSchema = new Schema(
  {
    // Full recipient name - Required
    fullName: { type: String, required: true },
    // Recipient mobile phone - Required
    phone: { type: String, required: true },
    // Street line address - Required
    street: { type: String, required: true },
    // City - Required
    city: { type: String, required: true },
    // State - Required
    state: { type: String, required: true },
    // Postal / PIN code - Required
    postalCode: { type: String, required: true },
    // Country - Required (defaults to India)
    country: { type: String, required: true, default: 'India' },
  },
  { _id: false }
);

const OrderSchema: Schema<IOrder> = new Schema(
  {
    // Reference to purchasing customer user ID - Required
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Snapshot list of purchased line items - Required
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    // Destination delivery address snapshot - Required
    shippingAddress: {
      type: OrderShippingAddressSchema,
      required: true,
    },
    // Fulfillment tracking status - Required (pending | confirmed | shipped | delivered | cancelled)
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      required: true,
    },
    // Calculated total order value in INR - Required
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Selected payment approach (e.g. 'Cash on Delivery / Trade Credit') - Required
    paymentMethod: {
      type: String,
      default: 'Cash on Delivery / Offline Trade Credit',
      required: true,
    },
    // Payment settlement state - Required
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      required: true,
    },
    // Optional delivery or invoice instructions from customer - Optional
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt timestamps
  }
);

// Prevent re-compilation of model in Next.js development hot-reloads
const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
