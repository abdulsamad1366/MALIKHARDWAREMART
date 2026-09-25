/**
 * @file route.ts
 * @route GET /api/hero-slides
 * @access Public per docs/05-routes.md & docs/08-homepage-layout.md
 * @description Retrieves active full-width hero carousel slides ordered by displayOrder.
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import HeroSlide from '@/models/HeroSlide';

export const revalidate = 60;

/**
 * Handles GET requests to fetch active hero slides.
 */
export async function GET(): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const slides = await HeroSlide.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      slides,
    });
  } catch (error: unknown) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch hero slides' },
      { status: 500 }
    );
  }
}
