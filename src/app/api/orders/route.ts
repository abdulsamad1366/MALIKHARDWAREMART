/**
 * @file route.ts
 * @route GET /api/orders
 * @access Registered user, Admin (Auth required) per Section 2 & 7
 * @description Retrieves order history for the currently authenticated customer.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';

/**
 * Handles GET requests to retrieve the authenticated user's order history.
 * @param {NextRequest} req - Incoming HTTP request with auth cookie
 * @returns {Promise<NextResponse>} JSON response with customer orders
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user session
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to view orders' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Query user's orders sorted by most recent first
    const orders = await Order.find({ userId: authUser.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: unknown) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve order history' },
      { status: 500 }
    );
  }
}
