/**
 * @file route.ts
 * @route POST /api/contact
 * @access Public per docs/02-navigation.md & docs/05-routes.md
 * @description Processes incoming customer inquiries, RFQs, and feedback from the /contact-us page.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles POST requests for general trade inquiries and contact submissions.
 * @param {NextRequest} req - Incoming HTTP request with { name, email, phone, message }
 * @returns {Promise<NextResponse>} Confirmation response
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    // Validate essential fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    // In a production environment with SMTP / SendGrid, trigger notification email here
    console.log(`[CONTACT INQUIRY RECEIVED] From: ${name} (${email}, ${phone || 'N/A'}) - Message: ${message}`);

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out to Malik Hardware Mart. Our trade desk will respond to your inquiry within 24 business hours.',
    });
  } catch (error: unknown) {
    console.error('Error handling contact submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process contact message. Please call our trade desk directly.' },
      { status: 500 }
    );
  }
}
