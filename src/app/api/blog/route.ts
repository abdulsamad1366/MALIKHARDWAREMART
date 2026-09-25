/**
 * @file route.ts
 * @route GET /api/blog
 * @access Public per docs/04-access-control.md & docs/05-routes.md
 * @description Retrieves published articles, contractor guides, and technical publications.
 * Only posts with isPublished: true are returned to the public.
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import BlogPost from '@/models/BlogPost';

/**
 * Handles GET requests to retrieve published blog posts.
 * @returns {Promise<NextResponse>} List of published blog posts
 */
export async function GET(): Promise<NextResponse> {
  try {
    await connectToDatabase();

    // Query only published posts, sorted by newest publication date first
    const posts = await BlogPost.find({ isPublished: true })
      .select('title slug excerpt coverImage authorName publishedAt createdAt')
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error: unknown) {
    console.error('Error fetching published blog posts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
