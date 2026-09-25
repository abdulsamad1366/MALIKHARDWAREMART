/**
 * @file route.ts
 * @route GET /api/admin/customers
 * @access Admin only per Section 2 & 7
 * @description Retrieves customer accounts along with their wholesale price verification status
 * and total order volume for admin approval.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';

/**
 * Handles GET requests to list trade customer accounts for verification.
 * @param {NextRequest} req - Incoming HTTP request with admin session cookie
 * @returns {Promise<NextResponse>} JSON response with customer list
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

    // Query customer accounts sorted by newest registration
    const customers = await User.find({ role: 'customer' })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    // Attach order counts for each customer
    const customerIds = customers.map((c) => c._id);
    const orderCounts = await Order.aggregate([
      { $match: { userId: { $in: customerIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } },
    ]);

    const orderMap = new Map();
    for (const item of orderCounts) {
      orderMap.set(item._id.toString(), {
        orderCount: item.count,
        totalSpent: item.totalSpent,
      });
    }

    const enhancedCustomers = customers.map((c) => {
      const stats = orderMap.get(c._id.toString()) || { orderCount: 0, totalSpent: 0 };
      return {
        ...c,
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent,
      };
    });

    return NextResponse.json({
      success: true,
      customers: enhancedCustomers,
    });
  } catch (error: unknown) {
    console.error('Error fetching admin customers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve customers' },
      { status: 500 }
    );
  }
}
