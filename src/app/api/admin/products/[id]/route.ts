/**
 * @file route.ts
 * @route GET /api/admin/products/[id], PUT /api/admin/products/[id], DELETE /api/admin/products/[id]
 * @access Admin only per Section 2 & 7
 * @description Product CRUD update, retrieval, and deletion operations for administrators.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Handles GET requests to retrieve an individual product for the admin editor.
 * @param {NextRequest} req - Incoming HTTP request
 * @param {RouteContext} ctx - Route parameters containing id
 * @returns {Promise<NextResponse>} Product JSON
 */
export async function GET(
  req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
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

    const product = await Product.findById(id).populate('category');
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: unknown) {
    console.error('Error fetching admin product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve product' },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update an existing catalog product.
 * @param {NextRequest} req - Incoming HTTP request with updated fields
 * @param {RouteContext} ctx - Route parameters containing id
 * @returns {Promise<NextResponse>} Updated product JSON
 */
export async function PUT(
  req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    // Admin role authorization guard
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

    // Find and update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          name: body.name,
          slug: body.slug,
          category: body.category,
          brand: body.brand,
          description: body.description,
          specs: body.specs,
          imageUrl: body.imageUrl || null,
          price: body.price !== undefined ? parseFloat(body.price) : undefined,
          stockStatus: body.stockStatus,
          featured: Boolean(body.featured),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error: unknown) {
    console.error('Error updating admin product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * Handles DELETE requests to remove a product from the catalog.
 * @param {NextRequest} req - Incoming HTTP request
 * @param {RouteContext} ctx - Route parameters containing id
 * @returns {Promise<NextResponse>} Deletion confirmation
 */
export async function DELETE(
  req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    // Admin role authorization guard
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }

    const { id } = await ctx.params;
    await connectToDatabase();

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
