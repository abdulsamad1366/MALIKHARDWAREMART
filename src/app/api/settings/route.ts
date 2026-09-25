/**
 * @file route.ts
 * @route GET /api/settings
 * @access Public per Section 5 & docs/05-routes.md
 * @description Public endpoint to retrieve global site configuration,
 * including the live header marquee notification message.
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';

/**
 * Handles GET requests to retrieve site-wide settings.
 * @returns {Promise<NextResponse>} JSON containing public site settings
 */
export async function GET(): Promise<NextResponse> {
  try {
    await connectToDatabase();

    // Fetch existing single settings document or return empty fallback
    const settings = await SiteSettings.findOne().lean();

    return NextResponse.json({
      success: true,
      settings: {
        marqueeMessage: settings?.marqueeMessage || '',
        updatedAt: settings?.updatedAt || null,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch settings',
        settings: { marqueeMessage: '' },
      },
      { status: 500 }
    );
  }
}
