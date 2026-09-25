/**
 * @file route.ts
 * @route GET /api/products
 * @access Public (Guest, Registered User, Admin) per Section 2
 * @description Retrieves a paginated and filtered list of catalog products.
 * Includes server-side price gating: pricing is strictly omitted for unauthenticated guests.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import UseCase from '@/models/UseCase';
import { getAuthUser } from '@/lib/auth';

/**
 * Handles GET requests to list products with filtering, search, and server-side price gating.
 * @param {NextRequest} req - Incoming HTTP request with query parameters
 * @returns {Promise<NextResponse>} JSON response containing products and pagination info
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Establish connection to MongoDB
    await connectToDatabase();

    // Extract query parameters from request URL
    const searchParams = req.nextUrl.searchParams;
    const categorySlug = searchParams.get('category');
    const useCaseSlug = searchParams.get('useCase');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    // Check authentication and price verification status to determine if price should be exposed
    const authUser = await getAuthUser(req);
    const isAuthenticated = Boolean(authUser);
    const isPriceVerified = Boolean(authUser && (authUser.role === 'admin' || authUser.isPriceVerified));

    // Build Mongoose filter query
    const filterQuery: Record<string, unknown> = {};

    // Filter by category slug if provided
    if (categorySlug) {
      const categoryDoc = await Category.findOne({ slug: categorySlug }).select('_id');
      if (categoryDoc) {
        filterQuery.category = categoryDoc._id;
      } else {
        // Return empty result set if category slug does not exist
        return NextResponse.json({
          success: true,
          products: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
          isAuthenticated,
          isPriceVerified,
        });
      }
    }

    // Filter by useCase slug if provided (docs/08-homepage-layout.md)
    if (useCaseSlug) {
      const useCaseDoc = await UseCase.findOne({ slug: useCaseSlug }).select('_id');
      if (useCaseDoc) {
        filterQuery.useCases = useCaseDoc._id;
      } else {
        return NextResponse.json({
          success: true,
          products: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
          isAuthenticated,
          isPriceVerified,
        });
      }
    }

    // Filter by specific brand name
    if (brand) {
      filterQuery.brand = brand;
    }

    // Filter by featured flag if requested for homepage
    if (featured === 'true') {
      filterQuery.featured = true;
    }

    // Full text search across product name, brand, and description
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filterQuery.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { description: searchRegex },
      ];
    }

    // Count total matching documents for pagination metadata
    const total = await Product.countDocuments(filterQuery);

    // Query database for matching products
    const rawProducts = await Product.find(filterQuery)
      .populate('category', 'name slug placeholderImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Process products with strict server-side price gating
    const products = rawProducts.map((p) => {
      // Create a shallow copy of product document
      const productObj: Record<string, unknown> = { ...p };

      // PRICE GATE: do not send price to unauthenticated requests
      if (!isPriceVerified) {
        delete productObj.price;
      }

      return productObj;
    });

    // Return sanitized products to client
    return NextResponse.json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      // Inform client of session verification state for UI rendering
      isAuthenticated,
      isPriceVerified,
      userRole: authUser?.role || null,
    });
  } catch (error: unknown) {
    // Log unexpected errors
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
