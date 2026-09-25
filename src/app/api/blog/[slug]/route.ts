/**
 * @file route.ts
 * @route GET /api/blog/[slug]
 * @access Public per docs/04-access-control.md & docs/05-routes.md
 * @description Retrieves a single published blog article by its unique URL slug.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import BlogPost from '@/models/BlogPost';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Handles GET requests to retrieve a single published blog post by slug.
 * @param {NextRequest} req - Incoming HTTP request
 * @param {RouteContext} ctx - Context containing dynamic slug parameter
 * @returns {Promise<NextResponse>} Blog post JSON or 404
 */
export async function GET(
  req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    const { slug } = await ctx.params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Slug is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Query published article by unique slug
    const post = await BlogPost.findOne({ slug, isPublished: true }).lean();

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Blog article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error: unknown) {
    console.error('Error fetching blog post by slug:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}
