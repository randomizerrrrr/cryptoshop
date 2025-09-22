import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (req: NextRequest) => void;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory rate limit store (for production, consider Redis)
const rateLimitStore: RateLimitStore = {};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 60000); // Clean up every minute

export class SecurityMiddleware {
  /**
   * Rate limiting middleware for API routes
   */
  static rateLimit(config: RateLimitConfig) {
    const {
      windowMs,
      max,
      keyGenerator = (req: NextRequest) => {
        // Use IP address as default key
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';
        return ip;
      },
      skipSuccessfulRequests = false,
      skipFailedRequests = false,
      onLimitReached
    } = config;

    return async (req: NextRequest): Promise<NextResponse | null> => {
      const key = keyGenerator(req);
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean up old entries for this key
      if (rateLimitStore[key] && rateLimitStore[key].resetTime < windowStart) {
        delete rateLimitStore[key];
      }

      // Initialize or update rate limit entry
      if (!rateLimitStore[key]) {
        rateLimitStore[key] = {
          count: 1,
          resetTime: now + windowMs
        };
      } else {
        rateLimitStore[key].count++;
      }

      const { count, resetTime } = rateLimitStore[key];

      // Add rate limit headers to response
      const headers = {
        'X-RateLimit-Limit': max.toString(),
        'X-RateLimit-Remaining': Math.max(0, max - count).toString(),
        'X-RateLimit-Reset': resetTime.toString(),
        'Retry-After': Math.ceil((resetTime - now) / 1000).toString()
      };

      // Check if limit exceeded
      if (count > max) {
        if (onLimitReached) {
          onLimitReached(req);
        }

        return new NextResponse(
          JSON.stringify({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: headers['Retry-After']
          }),
          {
            status: 429,
            headers: {
              ...headers,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Return null to continue processing
      return null;
    };
  }

  /**
   * CSRF protection middleware
   */
  static csrfProtection() {
    const csrfTokens = new Map<string, { token: string; expires: number }>();

    // Clean up expired tokens
    setInterval(() => {
      const now = Date.now();
      csrfTokens.forEach((value, key) => {
        if (value.expires < now) {
          csrfTokens.delete(key);
        }
      });
    }, 300000); // Clean up every 5 minutes

    return {
      generateToken: (sessionId: string): string => {
        const token = createHash('sha256')
          .update(sessionId + Date.now() + Math.random())
          .digest('hex');
        
        csrfTokens.set(sessionId, {
          token,
          expires: Date.now() + 3600000 // 1 hour expiry
        });

        return token;
      },

      validateToken: (sessionId: string, token: string): boolean => {
        const stored = csrfTokens.get(sessionId);
        if (!stored || stored.token !== token || stored.expires < Date.now()) {
          return false;
        }
        return true;
      },

      middleware: async (req: NextRequest): Promise<NextResponse | null> => {
        // Skip CSRF for GET, HEAD, OPTIONS
        const method = req.method.toUpperCase();
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
          return null;
        }

        // Check CSRF token for state-changing requests
        const csrfToken = req.headers.get('x-csrf-token') || 
                         req.headers.get('x-xsrf-token') ||
                         (await req.formData?.().then(form => form.get('csrf_token')) as string);

        const sessionId = req.headers.get('authorization')?.replace('Bearer ', '') || 'anonymous';

        if (!csrfToken || !this.validateToken(sessionId, csrfToken)) {
          return new NextResponse(
            JSON.stringify({
              error: 'Forbidden',
              message: 'Invalid CSRF token'
            }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }

        return null;
      }
    };
  }

  /**
   * Security headers middleware
   */
  static securityHeaders() {
    const headers = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
        "connect-src 'self' wss: https:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'"
      ].join('; ')
    };

    return (response: NextResponse): NextResponse => {
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    };
  }

  /**
   * Input validation and sanitization
   */
  static validateInput(input: any, schema: any): { isValid: boolean; sanitized: any; errors: string[] } {
    const errors: string[] = [];
    let sanitized = { ...input };

    // Basic sanitization
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        // Remove potentially dangerous characters
        sanitized[key] = sanitized[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });

    // Schema validation (basic implementation)
    if (schema.required) {
      schema.required.forEach((field: string) => {
        if (sanitized[field] === undefined || sanitized[field] === null || sanitized[field] === '') {
          errors.push(`${field} is required`);
        }
      });
    }

    if (schema.types) {
      Object.entries(schema.types).forEach(([field, type]: [string, string]) => {
        if (sanitized[field] !== undefined) {
          switch (type) {
            case 'email':
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized[field])) {
                errors.push(`${field} must be a valid email`);
              }
              break;
            case 'username':
              if (!/^[a-zA-Z0-9_]{3,20}$/.test(sanitized[field])) {
                errors.push(`${field} must be 3-20 characters, alphanumeric and underscore only`);
              }
              break;
            case 'password':
              if (sanitized[field].length < 8) {
                errors.push(`${field} must be at least 8 characters`);
              }
              break;
            case 'number':
              if (isNaN(Number(sanitized[field]))) {
                errors.push(`${field} must be a number`);
              }
              break;
          }
        }
      });
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }

  /**
   * DDoS protection basic implementation
   */
  static ddosProtection() {
    const ipRequestCounts = new Map<string, { count: number; startTime: number }>();
    const blockedIPs = new Set<string>();

    // Clean up old entries
    setInterval(() => {
      const now = Date.now();
      ipRequestCounts.forEach((value, ip) => {
        if (now - value.startTime > 60000) { // 1 minute window
          ipRequestCounts.delete(ip);
        }
      });

      // Unblock IPs after 5 minutes
      blockedIPs.forEach(ip => {
        // Simple unblock logic - in production, use a more sophisticated system
        if (Math.random() < 0.1) { // 10% chance to unblock each check
          blockedIPs.delete(ip);
        }
      });
    }, 10000); // Check every 10 seconds

    return (req: NextRequest): NextResponse | null => {
      const forwarded = req.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';

      // Check if IP is blocked
      if (blockedIPs.has(ip)) {
        return new NextResponse(
          JSON.stringify({
            error: 'Forbidden',
            message: 'Access denied'
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Track request count
      const now = Date.now();
      const record = ipRequestCounts.get(ip);

      if (!record) {
        ipRequestCounts.set(ip, { count: 1, startTime: now });
      } else {
        record.count++;

        // Block if too many requests (100+ per minute)
        if (record.count > 100) {
          blockedIPs.add(ip);
          ipRequestCounts.delete(ip);

          return new NextResponse(
            JSON.stringify({
              error: 'Too Many Requests',
              message: 'Access temporarily blocked due to suspicious activity'
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': '300'
              }
            }
          );
        }
      }

      return null;
    };
  }
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // General API rate limiting (100 requests per minute)
  api: SecurityMiddleware.rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    skipSuccessfulRequests: false
  }),

  // Authentication rate limiting (5 attempts per minute)
  auth: SecurityMiddleware.rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    skipSuccessfulRequests: true,
    onLimitReached: (req) => {
      console.log(`Auth rate limit exceeded for IP: ${req.ip}`);
    }
  }),

  // File upload rate limiting (10 uploads per minute)
  upload: SecurityMiddleware.rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    skipSuccessfulRequests: false
  }),

  // Bitcoin operations rate limiting (20 operations per minute)
  bitcoin: SecurityMiddleware.rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    skipSuccessfulRequests: false
  })
};

// CSRF protection instance
export const csrfProtection = SecurityMiddleware.csrfProtection();

// Security headers middleware
export const securityHeaders = SecurityMiddleware.securityHeaders();

// DDoS protection
export const ddosProtection = SecurityMiddleware.ddosProtection();