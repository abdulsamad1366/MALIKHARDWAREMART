/**
 * @file route.ts
 * @route GET /api/cart, POST /api/cart
 * @access Registered user, Admin (Auth required) per Section 2 & 7
 * @description Manages persistent user shopping cart stored in MongoDB per Section 4.3.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

/**
 * Handles GET requests to retrieve the current user's persistent cart.
 * @param {NextRequest} req - Incoming HTTP request with auth cookie
 * @returns {Promise<NextResponse>} JSON response with cart items and subtotal
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify authenticated user session
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to view cart' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find or create cart for user
    let cart = await Cart.findOne({ userId: authUser.userId })
      .populate({
        path: 'items.productId',
        select: 'name slug brand price imageUrl stockStatus category',
        populate: {
          path: 'category',
          select: 'name slug placeholderImage',
        },
      })
      .lean();

    if (!cart) {
      cart = {
        userId: authUser.userId as unknown as import('mongoose').Types.ObjectId,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as typeof cart;
    }

    // Calculate subtotal from line items
    let subtotal = 0;
    const items = (cart?.items || []).map((item) => {
      // Use current product price if available, otherwise fallback to priceAtAdd
      const product = item.productId as unknown as { price?: number; name?: string };
      const unitPrice = typeof product?.price === 'number' ? product.price : item.priceAtAdd;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      return {
        _id: item._id?.toString(),
        product: item.productId,
        quantity: item.quantity,
        priceAtAdd: item.priceAtAdd,
        unitPrice,
        lineTotal,
      };
    });

    return NextResponse.json({
      success: true,
      cart: {
        _id: cart?._id?.toString() || null,
        items,
        subtotal,
        itemCount: items.reduce((acc, curr) => acc + curr.quantity, 0),
      },
    });
  } catch (error: unknown) {
    // Log unexpected errors
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve cart' },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to add an item to the persistent cart.
 * @param {NextRequest} req - Incoming HTTP request with productId and quantity
 * @returns {Promise<NextResponse>} JSON response with updated cart
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify authenticated user session
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Please login to add items to your trade cart' },
        { status: 401 }
      );
    }

    // Parse JSON payload
    const body = await req.json();
    const { productId, quantity = 1 } = body;

    // Validate inputs
    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    // Connect to database
    await connectToDatabase();

    // Verify product exists in catalog
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if out of stock
    if (product.stockStatus === 'out_of_stock') {
      return NextResponse.json(
        { success: false, message: 'Product is currently out of stock' },
        { status: 400 }
      );
    }

    // Find user's cart or create new one
    let cart = await Cart.findOne({ userId: authUser.userId });
    if (!cart) {
      cart = new Cart({
        userId: authUser.userId,
        items: [],
      });
    }

    // Check if item is already in the cart
    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (existingIndex > -1) {
      // Increment existing quantity
      cart.items[existingIndex].quantity += qty;
      cart.items[existingIndex].priceAtAdd = product.price;
    } else {
      // Push new line item with current trade price
      cart.items.push({
        productId: product._id,
        quantity: qty,
        priceAtAdd: product.price,
      });
    }

    // Persist cart to MongoDB
    await cart.save();

    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      itemCount: cart.items.reduce((acc, curr) => acc + curr.quantity, 0),
    });
  } catch (error: unknown) {
    // Log unexpected errors
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update cart' },
      { status: 500 }
    );
  }
}
