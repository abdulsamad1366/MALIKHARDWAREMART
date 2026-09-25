/**
 * @file route.ts
 * @route GET, POST /api/admin/blog
 * @access Admin only per docs/04-access-control.md & docs/05-routes.md
 * @description Admin management endpoint to list all blog posts (published & draft)
 * and author new articles.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import { getAuthUser } from '@/lib/auth';

/**
 * Handles GET requests to retrieve all blog posts for administrative management.
 * @param {NextRequest} req - Incoming HTTP request
 * @returns {Promise<NextResponse>} List of all blog posts
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Admin authorization guard
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const posts = await BlogPost.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error: unknown) {
    console.error('Error fetching admin blog posts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to create a new blog article.
 * @param {NextRequest} req - Incoming HTTP request containing post payload
 * @returns {Promise<NextResponse>} Newly created article
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Admin authorization guard
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, slug, excerpt, content, coverImage, authorName, isPublished } = body;

    // Validate required fields
    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json(
        { success: false, message: 'Title, slug, excerpt, and content are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check slug uniqueness
    const existing = await BlogPost.findOne({ slug: slug.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A blog post with this slug already exists' },
        { status: 409 }
      );
    }

    const newPost = await BlogPost.create({
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      excerpt: excerpt.trim(),
      content,
      coverImage: coverImage?.trim() || '/images/products/default-product.png',
      authorName: authorName?.trim() || authUser.name || 'Malik Technical Team',
      isPublished: Boolean(isPublished),
      publishedAt: isPublished ? new Date() : null,
    });

    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      post: newPost,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
