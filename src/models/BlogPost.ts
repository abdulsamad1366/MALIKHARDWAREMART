/**
 * @file BlogPost.ts
 * @description Mongoose model for trade hardware articles, contractor guides,
 * and technical blog publications. Supports draft vs published states.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorName: string;
  isPublished: boolean;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema: Schema<IBlogPost> = new Schema(
  {
    // Article headline (e.g. 'Guide to High-Tensile Fasteners') - Required for readers and SEO
    title: {
      type: String,
      required: [true, 'Blog post title is required'],
      trim: true,
    },
    // URL-friendly unique identifier - Required for routing at /blog/[slug]
    slug: {
      type: String,
      required: [true, 'Blog post slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Short summary displayed in blog index cards - Required for list presentation
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
    },
    // Full post body content (supports HTML/Markdown) - Required for single article view
    content: {
      type: String,
      required: [true, 'Post content is required'],
    },
    // Cover image path (falls back to local placeholder) - Optional
    coverImage: {
      type: String,
      default: '/images/products/default-product.png',
    },
    // Author name or technical editor - Required for editorial transparency
    authorName: {
      type: String,
      required: [true, 'Author name is required'],
      default: 'Malik Technical Team',
      trim: true,
    },
    // Publication flag (draft vs published) - Required: only true posts are public
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Timestamp when article went live - Optional (set when isPublished becomes true)
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Prevent re-compilation of model across Next.js serverless invocations
const BlogPost: Model<IBlogPost> =
  mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);

export default BlogPost;
