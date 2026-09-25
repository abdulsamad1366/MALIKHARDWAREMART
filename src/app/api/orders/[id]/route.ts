/**
 * @file route.ts
 * @route GET /api/orders/[id]
 * @access Registered user, Admin (Auth required) per Section 2 & 7
 * @description Retrieves full detail of an individual order, ensuring customers
 * can only view their own orders while admins can view any order.
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
 * Handles GET requests to retrieve an order by its unique ID.
 * @param {NextRequest} req - Incoming HTTP request
 * @param {RouteContext} ctx - Next.js route parameters containing order id
 * @returns {Promise<NextResponse>} JSON response with order details
 */
export async function GET(
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

    const { id } = await ctx.params;

    // Connect to database
    await connectToDatabase();

    // Query order by ID
    const order = await Order.findById(id).lean();
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Role-based access control: customer can only view their own orders
    if (authUser.role !== 'admin' && order.userId.toString() !== authUser.userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied to this order' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: unknown) {
    console.error('Error fetching order by ID:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve order' },
      { status: 500 }
    );
  }
}
