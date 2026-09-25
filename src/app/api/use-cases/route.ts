/**
 * @file route.ts
 * @route GET /api/use-cases
 * @access Public per docs/05-routes.md & docs/08-homepage-layout.md
 * @description Retrieves all use case application contexts for "Shop by Use" circular grid.
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import UseCase from '@/models/UseCase';

export const revalidate = 60;

/**
 * Handles GET requests to retrieve use cases sorted by displayOrder.
 */
export async function GET(): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const useCases = await UseCase.find()
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      useCases,
    });
  } catch (error: unknown) {
    console.error('Error fetching use cases:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch use cases' },
      { status: 500 }
    );
  }
}
