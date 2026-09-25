/**
 * @file route.ts
 * @route GET, PUT, DELETE /api/admin/promo-banners/[id]
 * @access Admin only per docs/04-access-control.md & docs/05-routes.md
 * @description Admin endpoint to view, update, or delete a promotional banner tile.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import PromoBanner from '@/models/PromoBanner';
import { getAuthUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Handles GET requests to retrieve a single promo banner for editing.
 */
export async function GET(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
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

    const banner = await PromoBanner.findById(id).lean();
    if (!banner) {
      return NextResponse.json(
        { success: false, message: 'Promo banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, banner });
  } catch (error: unknown) {
    console.error('Error fetching promo banner:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch promo banner' },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update a promo banner.
 */
export async function PUT(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
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

    await connectToDatabase();

    const updatedBanner = await PromoBanner.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedBanner) {
      return NextResponse.json(
        { success: false, message: 'Promo banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promo banner updated successfully',
      banner: updatedBanner,
    });
  } catch (error: unknown) {
    console.error('Error updating promo banner:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update promo banner' },
      { status: 500 }
    );
  }
}

/**
 * Handles DELETE requests to remove a promo banner.
 */
export async function DELETE(req: NextRequest, ctx: RouteContext): Promise<NextResponse> {
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

    const deleted = await PromoBanner.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Promo banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promo banner deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting promo banner:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete promo banner' },
      { status: 500 }
    );
  }
}
