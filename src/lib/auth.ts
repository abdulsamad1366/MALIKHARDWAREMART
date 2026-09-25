/**
 * @file auth.ts
 * @description Authentication utilities for password hashing, JWT generation,
 * verification, and session extraction from httpOnly cookies with live price verification checks.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

// Secret key for cryptographic signing of JSON Web Tokens
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_malik_hardware_jwt_key_928374829103847291028374910';

// Cookie name used for storing the session JWT
export const AUTH_COOKIE_NAME = 'mhm_auth_token';

// JWT expiration time in seconds (7 days = 7 * 24 * 60 * 60)
export const TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

/**
 * Payload encoded inside the authenticated JWT token.
 */
export interface AuthUserPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
  name: string;
  isPriceVerified?: boolean;
}

/**
 * Hashes a plaintext password using bcrypt with 10 salt rounds.
 * @param {string} password - Raw plaintext password
 * @returns {Promise<string>} Salted bcrypt hash
 */
export async function hashPassword(password: string): Promise<string> {
  // 10 rounds provides strong security vs hashing speed trade-off for trade login
  const SALT_ROUNDS = 10;
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a raw plaintext password against a stored bcrypt hash.
 * @param {string} password - Plaintext password entered by user
 * @param {string} hash - Salted hash stored in MongoDB
 * @returns {Promise<boolean>} True if match, false otherwise
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generates and signs a JSON Web Token for the authenticated user.
 * @param {AuthUserPayload} payload - User identity and role data
 * @returns {string} Signed JWT token string
 */
export function signToken(payload: AuthUserPayload): string {
  // Signs payload with secret and 7-day expiration
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY_SECONDS,
  });
}

/**
 * Verifies a JWT token string and returns the decoded payload.
 * @param {string} token - Raw JWT token string
 * @returns {AuthUserPayload | null} Decoded user payload or null if invalid/expired
 */
export function verifyToken(token: string): AuthUserPayload | null {
  try {
    // Verify token cryptographic signature against server secret
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    return decoded;
  } catch {
    // Token is expired, forged, or malformed
    return null;
  }
}

/**
 * Extracts and verifies authenticated user session from NextRequest.
 * Checks httpOnly cookie first, then falls back to Authorization Bearer header.
 * Real-time checks MongoDB so admin verification takes effect immediately without requiring re-login.
 * @param {NextRequest} req - Incoming Next.js HTTP request
 * @returns {Promise<AuthUserPayload | null>} Authenticated user payload or null for guests
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUserPayload | null> {
  let tokenString: string | null = null;

  // 1. Check for token stored in secure httpOnly cookie
  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (cookieToken) {
    tokenString = cookieToken;
  } else {
    // 2. Check for token in standard Authorization header for API clients
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      tokenString = authHeader.substring(7);
    }
  }

  // If no token was found, user is an unauthenticated guest
  if (!tokenString) {
    return null;
  }

  const decoded = verifyToken(tokenString);
  if (!decoded) {
    return null;
  }

  // Admin users always have price verification privileges
  if (decoded.role === 'admin') {
    return {
      ...decoded,
      isPriceVerified: true,
    };
  }

  // Real-time DB lookup so when an admin verifies an account, price unlocks immediately
  try {
    await connectToDatabase();
    const userDoc = await User.findById(decoded.userId)
      .select('isPriceVerified role name email')
      .lean();

    if (userDoc) {
      return {
        userId: userDoc._id.toString(),
        email: userDoc.email,
        role: userDoc.role,
        name: userDoc.name,
        isPriceVerified: Boolean(userDoc.isPriceVerified),
      };
    }
  } catch (err) {
    console.error('Error fetching live user verification in getAuthUser:', err);
  }

  // Fallback to decoded token values if database is unreachable
  return {
    ...decoded,
    isPriceVerified: Boolean(decoded.isPriceVerified),
  };
}
