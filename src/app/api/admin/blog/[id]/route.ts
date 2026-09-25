/**
 * @file route.ts
 * @route GET, PUT, DELETE /api/admin/blog/[id]
 * @access Admin only per docs/04-access-control.md & docs/05-routes.md
 * @description Provides administrative inspection, updates, and deletion of individual blog articles.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import { getAuthUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Handles GET requests to retrieve a single blog article for administrative editing.
 */
export async function GET(
  req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin authorization required' }, { status: 403 });
    }

    const { id } = await ctx.params;
    await connectToDatabase();
    const post = await BlogPost.findById(id).lean();

    if (!post) {
      return NextResponse.json({ success: false, message: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (error: unknown) {
    console.error('Error fetching admin blog post:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch blog post' }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update an existing blog article.
 */
export async function PUT(
  req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin authorization required' }, { status: 403 });
    }

    const { id } = await ctx.params;
    const body = await req.json();
    const { title, slug, excerpt, content, coverImage, authorName, isPublished } = body;

    await connectToDatabase();

    const existing = await BlogPost.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Blog post not found' }, { status: 404 });
    }

    // Check slug collision if slug changed
    if (slug && slug.trim().toLowerCase() !== existing.slug) {
      const slugConflict = await BlogPost.findOne({
        slug: slug.trim().toLowerCase(),
        _id: { $ne: id },
      });
      if (slugConflict) {
        return NextResponse.json({ success: false, message: 'Slug is already used by another post' }, { status: 409 });
      }
      existing.slug = slug.trim().toLowerCase();
    }

    if (title) existing.title = title.trim();
    if (excerpt) existing.excerpt = excerpt.trim();
    if (content) existing.content = content;
    if (coverImage) existing.coverImage = coverImage.trim();
    if (authorName) existing.authorName = authorName.trim();

    if (typeof isPublished === 'boolean') {
      // If newly publishing, record publishedAt
      if (isPublished && !existing.isPublished) {
        existing.publishedAt = new Date();
      }
      existing.isPublished = isPublished;
    }

    await existing.save();

    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully',
      post: existing,
    });
  } catch (error: unknown) {
    console.error('Error updating admin blog post:', error);
    return NextResponse.json({ success: false, message: 'Failed to update blog post' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to remove a blog article.
 */
export async function DELETE(
  req: NextRequest,
  ctx: RouteContext
): Promise<NextResponse> {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin authorization required' }, { status: 403 });
    }

    const { id } = await ctx.params;
    await connectToDatabase();

    const deleted = await BlogPost.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting admin blog post:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete blog post' }, { status: 500 });
  }
}
