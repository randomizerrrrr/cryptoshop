import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters, csrfProtection, securityHeaders, ddosProtection } from '@/lib/security';

export async function middleware(req: NextRequest) {
  // Apply DDoS protection first
  const ddosResponse = ddosProtection(req);
  if (ddosResponse) {
    return ddosResponse;
  }

  // Apply rate limiting based on route
  let rateLimitResponse = null;
  
  if (req.nextUrl.pathname.startsWith('/api/auth/')) {
    rateLimitResponse = await rateLimiters.auth(req);
  } else if (req.nextUrl.pathname.startsWith('/api/bitcoin/')) {
    rateLimitResponse = await rateLimiters.bitcoin(req);
  } else if (req.nextUrl.pathname.startsWith('/api/upload')) {
    rateLimitResponse = await rateLimiters.upload(req);
  } else if (req.nextUrl.pathname.startsWith('/api/')) {
    rateLimitResponse = await rateLimiters.api(req);
  }

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Apply CSRF protection for API routes
  if (req.nextUrl.pathname.startsWith('/api/') && !req.nextUrl.pathname.startsWith('/api/health')) {
    const csrfResponse = await csrfProtection.middleware(req);
    if (csrfResponse) {
      return csrfResponse;
    }
  }

  // Continue with the request
  const response = NextResponse.next();

  // Apply security headers
  return securityHeaders(response);
}

export const config = {
  matcher: [
    // Apply to all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};