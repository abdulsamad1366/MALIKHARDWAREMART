/**
 * @file route.ts
 * @route PUT /api/admin/customers/[id]
 * @access Admin only per Section 2 & 7
 * @description Updates customer wholesale price verification status (approve or revoke rates).
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Handles PUT requests to update customer verification status.
 * @param {NextRequest} req - Incoming HTTP request with isPriceVerified
 * @param {RouteContext} ctx - Route parameters containing customer id
 * @returns {Promise<NextResponse>} Updated user JSON
 */
export async function PUT(
  req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    // Admin authorization guard
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }

    const { id } = await ctx.params;
    const body = await req.json();
    const { isPriceVerified } = body;

    if (typeof isPriceVerified !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'isPriceVerified must be a boolean' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { isPriceVerified } },
      { new: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Customer account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isPriceVerified
        ? `Account for ${updatedUser.name} has been verified. Wholesale prices are unlocked.`
        : `Wholesale pricing access revoked for ${updatedUser.name}.`,
      user: updatedUser,
      customer: updatedUser,
    });
  } catch (error: unknown) {
    console.error('Error updating customer verification:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update customer verification' },
      { status: 500 }
    );
  }
}
