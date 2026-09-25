/**
 * @file route.ts
 * @route PUT /api/cart/[itemId], DELETE /api/cart/[itemId]
 * @access Registered user, Admin (Auth required) per Section 2 & 7
 * @description Updates quantity or removes individual line items from the persistent cart.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Cart from '@/models/Cart';
import { getAuthUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{
    itemId: string;
  }>;
}

/**
 * Handles PUT requests to update an item's quantity in the cart.
 * @param {NextRequest} req - Incoming HTTP request with new quantity
 * @param {RouteContext} ctx - Next.js route parameters containing itemId
 * @returns {Promise<NextResponse>} Updated cart status
 */
export async function PUT(
  req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    // 1. Authenticate user session
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { itemId } = await ctx.params;
    const body = await req.json();
    const { quantity } = body;

    const newQty = parseInt(quantity, 10);

    // Connect to database
    await connectToDatabase();

    const cart = await Cart.findOne({ userId: authUser.userId });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    // Locate item in cart array
    const itemIndex = cart.items.findIndex(
      (item) => item._id?.toString() === itemId
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Item not found in cart' },
        { status: 404 }
      );
    }

    // If new quantity is 0 or negative, remove the item
    if (newQty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = newQty;
    }

    await cart.save();

    return NextResponse.json({
      success: true,
      message: 'Cart updated',
      itemCount: cart.items.reduce((acc, curr) => acc + curr.quantity, 0),
    });
  } catch (error: unknown) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update item quantity' },
      { status: 500 }
    );
  }
}

/**
 * Handles DELETE requests to remove an item from the cart.
 * @param {NextRequest} req - Incoming HTTP request
 * @param {RouteContext} ctx - Next.js route parameters containing itemId
 * @returns {Promise<NextResponse>} Deletion status
 */
export async function DELETE(
  req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    // Authenticate user session
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { itemId } = await ctx.params;

    // Connect to database
    await connectToDatabase();

    const cart = await Cart.findOne({ userId: authUser.userId });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    // Filter out target item
    const initialCount = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item._id?.toString() !== itemId
    ) as typeof cart.items;

    if (cart.items.length === initialCount) {
      return NextResponse.json(
        { success: false, message: 'Item not found in cart' },
        { status: 404 }
      );
    }

    await cart.save();

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
      itemCount: cart.items.reduce((acc, curr) => acc + curr.quantity, 0),
    });
  } catch (error: unknown) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to remove item' },
      { status: 500 }
    );
  }
}
