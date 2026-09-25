/**
 * @file route.ts
 * @route POST /api/checkout
 * @access Registered user, Admin (Auth required) per Section 2 & 7
 * @description Places an order from the user's persistent cart, locks item pricing,
 * clears the cart, and records a 'pending' Cash on Delivery / Trade Credit order per Section 4.3.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Cart from '@/models/Cart';
import Order, { IOrderItem } from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

/**
 * Handles POST requests to execute trade order checkout.
 * @param {NextRequest} req - Incoming HTTP request with shipping address
 * @returns {Promise<NextResponse>} JSON response with created order details
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authenticate user and verify wholesale pricing permission
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to checkout' },
        { status: 401 }
      );
    }

    if (authUser.role !== 'admin' && !authUser.isPriceVerified) {
      return NextResponse.json(
        { success: false, message: 'Your trade account is pending admin verification before you can checkout.' },
        { status: 403 }
      );
    }

    // 2. Parse request payload
    const body = await req.json();
    const { shippingAddress, notes = '', saveAddress = true } = body;

    // Validate required address fields
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      return NextResponse.json(
        { success: false, message: 'Please provide complete shipping address details' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Fetch user's persistent cart
    const cart = await Cart.findOne({ userId: authUser.userId });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Your cart is empty. Please add products before checking out.' },
        { status: 400 }
      );
    }

    // Prepare line item snapshots and verify product pricing from database
    const orderItems: IOrderItem[] = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: 'One or more products in your cart are no longer available.' },
          { status: 400 }
        );
      }

      // PRICE GATE: lock current trade wholesale price in order snapshot
      const priceAtOrder = product.price;
      const lineTotal = priceAtOrder * item.quantity;
      totalAmount += lineTotal;

      orderItems.push({
        productId: product._id as unknown as import('mongoose').Types.ObjectId,
        name: product.name,
        quantity: item.quantity,
        priceAtOrder,
      });
    }

    // Create and persist Order
    const newOrder = await Order.create({
      userId: authUser.userId,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        postalCode: shippingAddress.postalCode.trim(),
        country: shippingAddress.country?.trim() || 'India',
      },
      status: 'pending',
      totalAmount,
      paymentMethod: 'Cash on Delivery / Offline Trade Credit',
      paymentStatus: 'pending',
      notes: notes.trim(),
    });

    // Clear user's persistent cart now that order is confirmed
    cart.items = [] as typeof cart.items;
    await cart.save();

    // Optionally save address to user's profile if requested
    if (saveAddress) {
      const user = await User.findById(authUser.userId);
      if (user) {
        const addressExists = user.addresses.some(
          (addr) =>
            addr.street.toLowerCase() === shippingAddress.street.toLowerCase() &&
            addr.postalCode === shippingAddress.postalCode
        );

        if (!addressExists) {
          user.addresses.push({
            fullName: shippingAddress.fullName.trim(),
            phone: shippingAddress.phone.trim(),
            street: shippingAddress.street.trim(),
            city: shippingAddress.city.trim(),
            state: shippingAddress.state.trim(),
            postalCode: shippingAddress.postalCode.trim(),
            country: shippingAddress.country?.trim() || 'India',
            isDefault: user.addresses.length === 0,
          });
          await user.save();
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      orderId: newOrder._id.toString(),
      order: newOrder,
    });
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, message: 'Checkout failed due to a server error' },
      { status: 500 }
    );
  }
}
