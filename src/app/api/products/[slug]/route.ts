/**
 * @file route.ts
 * @route GET /api/products/[slug]
 * @access Public (Guest, Registered User, Admin) per Section 2
 * @description Retrieves full product detail by slug with technical specs.
 * Includes server-side price gating: pricing is strictly omitted for unauthenticated guests.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Handles GET requests to retrieve a single product by its unique slug.
 * @param {NextRequest} req - Incoming HTTP request
 * @param {RouteContext} ctx - Next.js route parameters context
 * @returns {Promise<NextResponse>} JSON response with sanitized product details
 */
export async function GET(
  req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    // Await params promise in accordance with Next.js 15+ asynchronous route conventions
    const { slug } = await ctx.params;

    // Validate presence of slug
    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Product slug is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check user authentication and price verification to determine pricing visibility
    const authUser = await getAuthUser(req);
    const isAuthenticated = Boolean(authUser);
    const isPriceVerified = Boolean(authUser && (authUser.role === 'admin' || authUser.isPriceVerified));

    // Retrieve product and populate associated category details
    const rawProduct = await Product.findOne({ slug })
      .populate('category', 'name slug placeholderImage')
      .lean();

    // Return 404 if product not found
    if (!rawProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Clone product document to sanitize
    const product: Record<string, unknown> = { ...rawProduct };

    // PRICE GATE: do not send price to unauthenticated requests
    if (!isPriceVerified) {
      delete product.price;
    }

    // Return product detail payload
    return NextResponse.json({
      success: true,
      product,
      isAuthenticated,
      isPriceVerified,
      userRole: authUser?.role || null,
    });
  } catch (error: unknown) {
    // Log unexpected errors
    console.error('Error fetching product by slug:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch product details' },
      { status: 500 }
    );
  }
}
