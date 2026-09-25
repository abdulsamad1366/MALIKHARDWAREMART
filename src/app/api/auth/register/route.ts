/**
 * @file route.ts
 * @route POST /api/auth/register
 * @access Public (Guest) per Section 2
 * @description Registers a new customer account, hashes password, generates JWT,
 * and sets a secure httpOnly cookie session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { hashPassword, signToken, AUTH_COOKIE_NAME, TOKEN_EXPIRY_SECONDS } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

/**
 * Handles POST requests for customer registration.
 * @param {NextRequest} req - Incoming HTTP request containing user details
 * @returns {Promise<NextResponse>} JSON response with user profile and auth cookie
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Enforce rate limiting to prevent automated account spam (Section 9)
    const clientIp = req.headers.get('x-forwarded-for') || 'local-client';
    const rateCheck = checkRateLimit(`register_${clientIp}`, 10, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, message: 'Too many registration attempts. Please try again in 1 minute.' },
        { status: 429 }
      );
    }

    // 2. Parse request JSON body
    const body = await req.json();
    const { name, email, password, phone } = body;

    // Validate presence of required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt salt rounds
    const passwordHash = await hashPassword(password);

    // Create new customer account in MongoDB (pricing access requires admin verification per B2B policy)
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'customer',
      isPriceVerified: false,
      phone: phone ? phone.trim() : '',
      addresses: [],
    });

    // Create JWT authentication payload
    const tokenPayload = {
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      isPriceVerified: false,
    };

    // Generate signed JWT
    const token = signToken(tokenPayload);

    // Prepare response object
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully. Wholesale pricing is pending admin verification.',
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isPriceVerified: false,
        phone: newUser.phone,
      },
    });

    // Attach httpOnly cookie to response
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
    // Log unexpected errors
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed due to a server error' },
      { status: 500 }
    );
  }
}
