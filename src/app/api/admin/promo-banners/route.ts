/**
 * @file route.ts
 * @route GET, POST /api/admin/promo-banners
 * @access Admin only per docs/04-access-control.md & docs/05-routes.md
 * @description Admin management endpoint for listing and creating promotional tiles.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import PromoBanner from '@/models/PromoBanner';
import { getAuthUser } from '@/lib/auth';

/**
 * Handles GET requests to retrieve all promo banners for admin management.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const banners = await PromoBanner.find().sort({ displayOrder: 1, createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      banners,
    });
  } catch (error: unknown) {
    console.error('Error fetching admin promo banners:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch promo banners' },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to create a new promo banner.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, subtitle, image, linkUrl, badge, displayOrder, isActive } = body;

    if (!title || !linkUrl) {
      return NextResponse.json(
        { success: false, message: 'Title and linkUrl are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newBanner = await PromoBanner.create({
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      image: image?.trim() || '/images/products/default-product.png',
      linkUrl: linkUrl.trim(),
      badge: badge?.trim() || '',
      displayOrder: Number(displayOrder) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Promo banner created successfully',
        banner: newBanner,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating promo banner:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create promo banner' },
      { status: 500 }
    );
  }
}
