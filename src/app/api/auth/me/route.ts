/**
 * @file route.ts
 * @route GET /api/auth/me
 * @access Public / Authenticated per Section 2
 * @description Returns current user session data and address records for authenticated users,
 * or { authenticated: false } for guests.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

/**
 * Handles GET requests to check current authentication session.
 * @param {NextRequest} req - Incoming HTTP request with cookie
 * @returns {Promise<NextResponse>} JSON response with authentication state and user profile
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Extract session from JWT cookie
    const authUser = await getAuthUser(req);

    // If no valid session token exists, report guest status
    if (!authUser) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    // Connect to database to fetch up-to-date user profile and saved addresses
    await connectToDatabase();
    const userDoc = await User.findById(authUser.userId)
      .select('-passwordHash')
      .lean();

    // If user document was deleted from DB, treat as unauthenticated
    if (!userDoc) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    // Return authenticated profile
    return NextResponse.json({
      authenticated: true,
      user: {
        id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role,
        phone: userDoc.phone || '',
        addresses: userDoc.addresses || [],
      },
    });
  } catch (error: unknown) {
    // Log unexpected errors
    console.error('Session check error:', error);
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: 'Failed to verify session',
    });
  }
}
