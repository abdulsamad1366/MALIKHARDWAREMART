/**
 * @file route.ts
 * @route GET /api/admin/orders
 * @access Admin only per Section 2 & 7
 * @description Retrieves all customer orders across the platform for administrative fulfillment tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';

/**
 * Handles GET requests to list all orders for the admin dashboard.
 * @param {NextRequest} req - Incoming HTTP request with admin auth cookie
 * @returns {Promise<NextResponse>} JSON response with all customer orders
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Admin authorization guard
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Query all orders with customer profile populated
    const orders = await Order.find({})
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: unknown) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}
