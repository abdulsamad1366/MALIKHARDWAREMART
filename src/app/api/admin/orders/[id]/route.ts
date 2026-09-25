/**
 * @file route.ts
 * @route GET /api/admin/orders/[id], PUT /api/admin/orders/[id]
 * @access Admin only per Section 2 & 7
 * @description Admin order management for updating fulfillment status and viewing full order specs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Handles GET requests to fetch an individual order for admin review.
 * @param {NextRequest} req - Incoming HTTP request
 * @param {RouteContext} ctx - Route parameters containing id
 * @returns {Promise<NextResponse>} Order JSON
 */
export async function GET(
  req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }

    const { id } = await ctx.params;
    await connectToDatabase();

    const order = await Order.findById(id)
      .populate('userId', 'name email phone')
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: unknown) {
    console.error('Error fetching admin order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve order' },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update an order's status and payment tracking.
 * @param {NextRequest} req - Incoming HTTP request with updated status
 * @param {RouteContext} ctx - Route parameters containing id
 * @returns {Promise<NextResponse>} Updated order JSON
 */
export async function PUT(
  req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }

    const { id } = await ctx.params;
    const body = await req.json();
    const { status, paymentStatus, notes } = body;

    await connectToDatabase();

    const updateFields: Record<string, unknown> = {};
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (notes !== undefined) updateFields.notes = notes;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error: unknown) {
    console.error('Error updating admin order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    );
  }
}
