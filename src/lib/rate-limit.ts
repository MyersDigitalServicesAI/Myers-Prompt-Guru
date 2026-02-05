/**
 * Rate Limiting Implementation for API Routes
 * 
 * This provides a simple in-memory rate limiter for development.
 * For production with multiple instances, consider using:
 * - Vercel Edge Config
 * - Redis (Upstash)
 * - Rate limiting middleware (next-rate-limit)
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store (will reset on server restart)
// For production, use Redis or similar distributed cache
const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;
  
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  
  /**
   * Custom identifier function (defaults to IP address)
   */
  identifier?: (req: NextRequest) => string;
  
  /**
   * Custom error message
   */
  message?: string;
}

/**
 * Default rate limit configurations for different endpoint types
 */
export const RateLimitPresets = {
  // Strict limit for webhook endpoints
  webhook: {
    maxRequests: 100,
    windowMs: 60000, // 100 requests per minute
    message: 'Too many webhook requests',
  },
  
  // Standard limit for authenticated API endpoints
  api: {
    maxRequests: 30,
    windowMs: 60000, // 30 requests per minute
    message: 'Too many requests. Please try again later.',
  },
  
  // Stricter limit for payment-related endpoints
  payment: {
    maxRequests: 10,
    windowMs: 60000, // 10 requests per minute
    message: 'Too many payment requests. Please try again later.',
  },
  
  // Very strict limit for authentication endpoints
  auth: {
    maxRequests: 5,
    windowMs: 60000, // 5 requests per minute
    message: 'Too many authentication attempts. Please try again later.',
  },
};

/**
 * Get identifier for rate limiting (IP address by default)
 */
function getIdentifier(req: NextRequest): string {
  // Try to get real IP from headers (for proxied requests)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to connection IP (may not work in serverless)
  return req.ip || 'unknown';
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // No record or expired record - allow and create new
  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(identifier, newRecord);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newRecord.resetAt,
    };
  }

  // Existing record - check if limit exceeded
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  // Increment count and allow
  record.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Middleware wrapper for rate limiting
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<Response>,
  config: RateLimitConfig
) {
  return async (req: NextRequest): Promise<Response> => {
    // Get identifier
    const identifier = config.identifier 
      ? config.identifier(req) 
      : getIdentifier(req);

    // Check rate limit
    const { allowed, remaining, resetAt } = checkRateLimit(identifier, config);

    // Add rate limit headers to response
    const addRateLimitHeaders = (response: Response): Response => {
      const headers = new Headers(response.headers);
      headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      headers.set('X-RateLimit-Remaining', remaining.toString());
      headers.set('X-RateLimit-Reset', new Date(resetAt).toISOString());
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    };

    // If rate limited, return 429
    if (!allowed) {
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
      
      return new Response(
        JSON.stringify({
          error: config.message || 'Too many requests',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(resetAt).toISOString(),
          },
        }
      );
    }

    // Execute handler and add rate limit headers
    try {
      const response = await handler(req);
      return addRateLimitHeaders(response);
    } catch (error) {
      // If handler throws, still add rate limit headers
      const errorResponse = new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
      return addRateLimitHeaders(errorResponse);
    }
  };
}

/**
 * Cleanup old rate limit records (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitStore.forEach((record, key) => {
    if (now > record.resetAt) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
