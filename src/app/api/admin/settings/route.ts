/**
 * @file route.ts
 * @route GET, PUT /api/admin/settings
 * @access Admin only per docs/04-access-control.md & docs/05-routes.md
 * @description Manages global site settings, including updating the top marquee banner message.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { getAuthUser } from '@/lib/auth';

/**
 * Handles GET requests to retrieve full site settings for admin editing.
 * @param {NextRequest} req - Incoming HTTP request
 * @returns {Promise<NextResponse>} Settings JSON
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
    const settings = await SiteSettings.findOne()
      .populate('updatedBy', 'name email')
      .lean();

    return NextResponse.json({
      success: true,
      settings: settings || { marqueeMessage: '' },
    });
  } catch (error: unknown) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * Handles PUT requests to update site settings (e.g. marquee message).
 * Upserts a single document in MongoDB.
 * @param {NextRequest} req - Incoming HTTP request with { marqueeMessage }
 * @returns {Promise<NextResponse>} Updated settings JSON
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
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
    const { marqueeMessage } = body;

    if (typeof marqueeMessage !== 'string') {
      return NextResponse.json(
        { success: false, message: 'marqueeMessage must be a string' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Upsert single settings document
    const updatedSettings = await SiteSettings.findOneAndUpdate(
      {},
      {
        $set: {
          marqueeMessage: marqueeMessage.trim(),
          updatedBy: authUser.userId,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Site settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error: unknown) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
