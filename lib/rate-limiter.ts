import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-memory rate limiter
 * In production, use Redis or similar
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Cleanup old entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, timestamps] of this.requests.entries()) {
        const validTimestamps = timestamps.filter((t) => now - t < this.windowMs);
        if (validTimestamps.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, validTimestamps);
        }
      }
    }, 5 * 60 * 1000);
  }

  isLimited(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Remove old requests outside the window
    const validTimestamps = timestamps.filter((t) => now - t < this.windowMs);

    // Check if limit exceeded
    if (validTimestamps.length >= this.maxRequests) {
      return true;
    }

    // Add current request
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);

    return false;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter((t) => now - t < this.windowMs);
    return Math.max(0, this.maxRequests - validTimestamps.length);
  }

  getResetTime(key: string): number {
    const timestamps = this.requests.get(key) || [];
    if (timestamps.length === 0) return Date.now();
    return timestamps[0] + this.windowMs;
  }
}

// Create limiters for different endpoints
const loginLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
const mfaLimiter = new RateLimiter(3, 10 * 60 * 1000); // 3 attempts per 10 minutes
const invitationLimiter = new RateLimiter(10, 60 * 60 * 1000); // 10 invitations per hour
const checkoutLimiter = new RateLimiter(20, 60 * 60 * 1000); // 20 checkouts per hour

/**
 * Rate limit middleware for login endpoint
 */
export function rateLimitLogin(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  if (loginLimiter.isLimited(`login:${ip}`)) {
    const resetTime = loginLimiter.getResetTime(`login:${ip}`);
    const secondsUntilReset = Math.ceil((resetTime - Date.now()) / 1000);

    return {
      limited: true,
      response: NextResponse.json(
        {
          success: false,
          message: `Too many login attempts. Please try again in ${secondsUntilReset} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": secondsUntilReset.toString(),
          },
        }
      ),
    };
  }

  return {
    limited: false,
    remaining: loginLimiter.getRemainingRequests(`login:${ip}`),
  };
}

/**
 * Rate limit middleware for MFA endpoint
 */
export function rateLimitMFA(request: NextRequest, adminId: string) {
  const key = `mfa:${adminId}`;

  if (mfaLimiter.isLimited(key)) {
    const resetTime = mfaLimiter.getResetTime(key);
    const secondsUntilReset = Math.ceil((resetTime - Date.now()) / 1000);

    return {
      limited: true,
      response: NextResponse.json(
        {
          success: false,
          message: `Too many MFA attempts. Please try again in ${secondsUntilReset} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": secondsUntilReset.toString(),
          },
        }
      ),
    };
  }

  return {
    limited: false,
    remaining: mfaLimiter.getRemainingRequests(key),
  };
}

/**
 * Rate limit middleware for invitation endpoint
 */
export function rateLimitInvitation(request: NextRequest, adminId: string) {
  const key = `invitation:${adminId}`;

  if (invitationLimiter.isLimited(key)) {
    const resetTime = invitationLimiter.getResetTime(key);
    const secondsUntilReset = Math.ceil((resetTime - Date.now()) / 1000);

    return {
      limited: true,
      response: NextResponse.json(
        {
          success: false,
          message: `Too many invitations sent. Please try again in ${secondsUntilReset} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": secondsUntilReset.toString(),
          },
        }
      ),
    };
  }

  return {
    limited: false,
    remaining: invitationLimiter.getRemainingRequests(key),
  };
}

/**
 * Rate limit middleware for checkout endpoint
 */
export function rateLimitCheckout(request: NextRequest, userId?: string) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const key = userId ? `checkout:${userId}` : `checkout:${ip}`;

  if (checkoutLimiter.isLimited(key)) {
    const resetTime = checkoutLimiter.getResetTime(key);
    const secondsUntilReset = Math.ceil((resetTime - Date.now()) / 1000);

    return {
      limited: true,
      response: NextResponse.json(
        {
          success: false,
          message: `Too many checkout attempts. Please try again in ${secondsUntilReset} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": secondsUntilReset.toString(),
          },
        }
      ),
    };
  }

  return {
    limited: false,
    remaining: checkoutLimiter.getRemainingRequests(key),
  };
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  total: number
): NextResponse {
  response.headers.set("X-RateLimit-Limit", total.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", new Date(Date.now() + 60 * 1000).toISOString());
  return response;
}
