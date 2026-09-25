/**
 * @file route.ts
 * @route GET /api/admin/stats
 * @access Admin only per Section 2 & 7
 * @description Provides high-level business analytics (orders, revenue, catalog count, customer metrics)
 * for the administrative dashboard overview.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import User from '@/models/User';
import Category from '@/models/Category';
import { getAuthUser } from '@/lib/auth';

/**
 * Handles GET requests to calculate summary metrics for the admin overview dashboard.
 * @param {NextRequest} req - Incoming HTTP request with admin auth cookie
 * @returns {Promise<NextResponse>} JSON response with KPI stats
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

    // Query aggregate counts in parallel
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      totalCategories,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments({}),
      Order.countDocuments({}),
      User.countDocuments({ role: 'customer' }),
      Category.countDocuments({}),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.find({}).sort({ createdAt: -1 }).limit(5).populate('userId', 'name email').lean(),
    ]);

    // Aggregate total gross order revenue
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalCategories,
        totalRevenue,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        recentOrders,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve admin stats' },
      { status: 500 }
    );
  }
}
