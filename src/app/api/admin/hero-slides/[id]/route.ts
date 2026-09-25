/**
 * @file route.ts
 * @route GET, PUT, DELETE /api/admin/hero-slides/[id]
 * @access Admin only per docs/04-access-control.md & docs/05-routes.md
 * @description Admin endpoint to view, update, or remove a specific hero carousel slide.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import HeroSlide from '@/models/HeroSlide';
import { getAuthUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Handles GET requests to retrieve a single hero slide for editing.
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

    const slide = await HeroSlide.findById(id).lean();
    if (!slide) {
      return NextResponse.json(
        { success: false, message: 'Hero slide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, slide });
  } catch (error: unknown) {
    console.error('Error fetching hero slide:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch hero slide' },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update a hero slide.
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

    const updatedSlide = await HeroSlide.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedSlide) {
      return NextResponse.json(
        { success: false, message: 'Hero slide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hero slide updated successfully',
      slide: updatedSlide,
    });
  } catch (error: unknown) {
    console.error('Error updating hero slide:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update hero slide' },
      { status: 500 }
    );
  }
}

/**
 * Handles DELETE requests to remove a hero slide.
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

    const deleted = await HeroSlide.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Hero slide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hero slide deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting hero slide:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete hero slide' },
      { status: 500 }
    );
  }
}
