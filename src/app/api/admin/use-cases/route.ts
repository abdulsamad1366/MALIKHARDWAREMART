/**
 * @file route.ts
 * @route GET, POST /api/admin/use-cases
 * @access Admin only per docs/04-access-control.md & docs/05-routes.md
 * @description Admin management endpoint for listing all use cases and creating new application categories.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import UseCase from '@/models/UseCase';
import { getAuthUser } from '@/lib/auth';

/**
 * Handles GET requests to retrieve all use cases for admin management.
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
    const useCases = await UseCase.find().sort({ displayOrder: 1, createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      useCases,
    });
  } catch (error: unknown) {
    console.error('Error fetching admin use cases:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch use cases' },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to create a new use case.
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
    const { name, slug, image, description, displayOrder } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, message: 'Name and slug are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await UseCase.findOne({ slug: slug.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A use case with this slug already exists' },
        { status: 409 }
      );
    }

    const newUseCase = await UseCase.create({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      image: image?.trim() || '/images/products/default-product.png',
      description: description?.trim() || '',
      displayOrder: Number(displayOrder) || 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Use case created successfully',
        useCase: newUseCase,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating use case:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create use case' },
      { status: 500 }
    );
  }
}
