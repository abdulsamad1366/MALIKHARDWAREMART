/**
 * @file route.ts
 * @route GET, POST /api/admin/hero-slides
 * @access Admin only per docs/04-access-control.md & docs/05-routes.md
 * @description Admin management endpoint for listing all hero slides and creating new slides.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import HeroSlide from '@/models/HeroSlide';
import { getAuthUser } from '@/lib/auth';

/**
 * Handles GET requests to retrieve all hero slides for admin management.
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
    const slides = await HeroSlide.find().sort({ displayOrder: 1, createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      slides,
    });
  } catch (error: unknown) {
    console.error('Error fetching admin hero slides:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch hero slides' },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to create a new hero slide.
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
    const { imageUrl, headline, subheadline, linkUrl, buttonText, displayOrder, isActive } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: 'imageUrl is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newSlide = await HeroSlide.create({
      imageUrl: imageUrl.trim(),
      headline: headline?.trim() || '',
      subheadline: subheadline?.trim() || '',
      linkUrl: linkUrl?.trim() || '/products',
      buttonText: buttonText?.trim() || 'Explore Products',
      displayOrder: Number(displayOrder) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Hero slide created successfully',
        slide: newSlide,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating hero slide:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create hero slide' },
      { status: 500 }
    );
  }
}
