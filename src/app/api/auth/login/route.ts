/**
 * @file route.ts
 * @route POST /api/auth/login
 * @access Public (Guest) per Section 2
 * @description Verifies customer or admin credentials, sets an httpOnly session cookie,
 * and unlocks access to wholesale trade prices per Section 4.2.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { comparePassword, signToken, AUTH_COOKIE_NAME, TOKEN_EXPIRY_SECONDS } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

/**
 * Handles POST requests for user authentication.
 * @param {NextRequest} req - Incoming HTTP request with email and password
 * @returns {Promise<NextResponse>} JSON response with user profile and session cookie
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Enforce rate limiting to block brute force credential attacks (Section 9)
    const clientIp = req.headers.get('x-forwarded-for') || 'local-client';
    const rateCheck = checkRateLimit(`login_${clientIp}`, 15, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, message: 'Too many login attempts. Please wait 1 minute before trying again.' },
        { status: 429 }
      );
    }

    // 2. Parse request JSON body
    const body = await req.json();
    const { email, password } = body;

    // Validate input fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Query user record by email
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Return generic invalid credentials error to prevent user enumeration
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Compare entered password with stored bcrypt hash
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Construct JWT authentication payload with price verification status
    const isPriceVerified = user.role === 'admin' || Boolean(user.isPriceVerified);
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      isPriceVerified,
    };

    // Generate signed JWT
    const token = signToken(tokenPayload);

    // Prepare response JSON
    const response = NextResponse.json({
      success: true,
      message: isPriceVerified
        ? 'Login successful. Wholesale trade pricing unlocked.'
        : 'Login successful. Trade pricing pending admin verification.',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isPriceVerified,
        phone: user.phone,
      },
    });

    // Set secure httpOnly cookie with token
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: TOKEN_EXPIRY_SECONDS,
    });

    return response;
  } catch (error: unknown) {
    // Log unexpected server errors
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed due to a server error' },
      { status: 500 }
    );
  }
}
