/**
 * @file rateLimit.ts
 * @description In-memory sliding-window rate limiter to protect sensitive auth endpoints (login/register)
 * against brute-force and credential stuffing attacks per Section 9.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory record store keyed by client IP or identifier
const ipStore = new Map<string, RateLimitRecord>();

/**
 * Checks if a given identifier exceeds the allowed requests within a timeframe.
 * @param {string} identifier - Unique client key (IP address or email)
 * @param {number} limit - Maximum allowed requests in the time window (e.g. 10 requests)
 * @param {number} windowMs - Time window in milliseconds (e.g. 60,000ms = 1 minute)
 * @returns {{ success: boolean; remaining: number; resetTime: number }} Rate limit status
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const existing = ipStore.get(identifier);

  // If no record exists or window expired, initialize fresh counter
  if (!existing || now > existing.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    ipStore.set(identifier, newRecord);
    return {
      success: true,
      remaining: limit - 1,
      resetTime: newRecord.resetTime,
    };
  }

  // If counter is within the limit, increment request count
  if (existing.count < limit) {
    existing.count += 1;
    return {
      success: true,
      remaining: limit - existing.count,
      resetTime: existing.resetTime,
    };
  }

  // Threshold exceeded; block request until window reset
  return {
    success: false,
    remaining: 0,
    resetTime: existing.resetTime,
  };
}
