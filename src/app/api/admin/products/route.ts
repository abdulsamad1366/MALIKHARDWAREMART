/**
 * @file route.ts
 * @route GET /api/admin/products, POST /api/admin/products
 * @access Admin only per Section 2 & 7
 * @description Admin management endpoint for product listing and creation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

/**
 * Handles GET requests to list all products for the administrative dashboard.
 * @param {NextRequest} req - Incoming HTTP request with admin auth cookie
 * @returns {Promise<NextResponse>} JSON response with full product data
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Admin role authorization guard
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Query all products with category details populated
    const products = await Product.find({})
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: unknown) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve products' },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to create a new product in the catalog.
 * @param {NextRequest} req - Incoming HTTP request with product payload
 * @returns {Promise<NextResponse>} JSON response with created product
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Admin role authorization guard
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }

    // Parse JSON body
    const body = await req.json();
    const {
      name,
      slug,
      category,
      brand,
      description,
      specs = [],
      imageUrl = null,
      price,
      stockStatus = 'in_stock',
      featured = false,
    } = body;

    // Validate required fields
    if (!name || !category || !brand || !description || price === undefined) {
      return NextResponse.json(
        { success: false, message: 'Name, category, brand, description, and price are required' },
        { status: 400 }
      );
    }

    // Generate slug from name if not provided
    const productSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Connect to database
    await connectToDatabase();

    // Check slug uniqueness
    const existing = await Product.findOne({ slug: productSlug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A product with this slug already exists' },
        { status: 409 }
      );
    }

    // Create new product
    const product = await Product.create({
      name: name.trim(),
      slug: productSlug,
      category,
      brand: brand.trim(),
      description: description.trim(),
      specs,
      imageUrl: imageUrl?.trim() || null,
      price: parseFloat(price),
      stockStatus,
      featured: Boolean(featured),
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    );
  }
}
