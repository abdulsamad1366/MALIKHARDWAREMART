/**
 * @file route.ts
 * @route POST /api/auth/logout
 * @access Public / Authenticated per Section 2
 * @description Clears the authenticated session cookie to return user to guest state.
 */

import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

/**
 * Handles POST requests to log out the user.
 * @returns {NextResponse} Response clearing the authentication cookie
 */
export async function POST(): Promise<NextResponse> {
  // Construct success response
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully. Reverted to guest catalog view.',
  });

  // Expire the auth cookie immediately
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Immediately invalidates cookie
  });

  return response;
}
