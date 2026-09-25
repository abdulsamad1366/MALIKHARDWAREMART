/**
 * @file route.ts
 * @route GET /api/promo-banners
 * @access Public per docs/05-routes.md & docs/08-homepage-layout.md
 * @description Retrieves active rectangular promotional banners sorted by displayOrder.
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import PromoBanner from '@/models/PromoBanner';

export const revalidate = 60;

/**
 * Handles GET requests to retrieve active promo banners.
 */
export async function GET(): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const banners = await PromoBanner.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      banners,
    });
  } catch (error: unknown) {
    console.error('Error fetching promo banners:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch promo banners' },
      { status: 500 }
    );
  }
}
