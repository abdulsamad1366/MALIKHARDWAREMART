/**
 * @file route.ts
 * @route GET /api/categories
 * @access Public (Guest, Registered User, Admin) per Section 2
 * @description Retrieves all product categories for navigation and catalog filtering.
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Category from '@/models/Category';

/**
 * Handles GET requests to list all categories.
 * @returns {Promise<NextResponse>} JSON response with categories list
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Establish database connection
    await connectToDatabase();

    // Query all categories sorted alphabetically by name
    const categories = await Category.find({})
      .populate('parentCategory', 'name slug')
      .sort({ name: 1 })
      .lean();

    // Return category list to caller
    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error: unknown) {
    // Log unexpected database error
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
