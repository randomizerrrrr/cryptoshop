import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verify2FAToken } from '@/lib/auth';
import { SecurityMiddleware, rateLimiters } from '@/lib/security';
import { traceRequest, captureError, recordMetric } from '@/lib/monitoring';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  twoFactorToken: z.string().optional(),
  bitcoinSignature: z.string().optional(),
});

// POST /api/auth/login - Enhanced login with NextAuth.js
export const POST = traceRequest(async (request: NextRequest) => {
  const startTime = Date.now();
  
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimiters.auth(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    
    // Input validation and sanitization
    const validationResult = SecurityMiddleware.validateInput(body, {
      required: ['email', 'password'],
      types: {
        email: 'email',
        password: 'password'
      }
    });

    if (!validationResult.isValid) {
      recordMetric('auth.validation_error', 1, { type: 'login' });
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.errors },
        { status: 400 }
      );
    }

    const validatedData = loginSchema.parse(validationResult.sanitized);

    // Check if user exists first
    const user = await db.user.findUnique({
      where: { email: validatedData.email },
      include: {
        seller: true,
        wallet: true,
      },
    });

    if (!user) {
      recordMetric('auth.failed_login', 1, { reason: 'invalid_credentials' });
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled and token is provided
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!validatedData.twoFactorToken) {
        recordMetric('auth.2fa_required', 1);
        return NextResponse.json({
          requires2FA: true,
          message: 'Two-factor authentication is required',
          email: user.email,
        }, { status: 200 });
      }

      const isValid = verify2FAToken(validatedData.twoFactorToken, user.twoFactorSecret);
      if (!isValid) {
        recordMetric('auth.failed_2fa', 1);
        return NextResponse.json(
          { error: 'Invalid 2FA code' },
          { status: 401 }
        );
      }
    }

    // Verify Bitcoin signature if provided (for enhanced security)
    if (validatedData.bitcoinSignature && user.bitcoinAddress) {
      // In production, implement proper Bitcoin signature verification
      console.log('Bitcoin signature verification for:', user.bitcoinAddress);
      recordMetric('auth.bitcoin_signature', 1);
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Return user data for client-side session management
    const { id, username, email, isSeller, isVerified, twoFactorEnabled, seller, wallet, bitcoinAddress } = user;

    recordMetric('auth.successful_login', 1);
    recordMetric('auth.login_response_time', Date.now() - startTime, { user_id: id });

    return NextResponse.json({
      user: {
        id,
        username,
        email,
        isSeller,
        isVerified,
        twoFactorEnabled,
        bitcoinAddress,
        seller: seller ? {
          id: seller.id,
          storeName: seller.storeName,
          category: seller.category,
          rating: seller.rating,
          isOnline: seller.isOnline,
        } : null,
        wallet: wallet ? {
          balanceBtc: wallet.balanceBtc,
          balanceEur: wallet.balanceEur,
        } : null,
      },
      message: 'Login successful',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      recordMetric('auth.validation_error', 1, { type: 'zod_error' });
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    captureError(error as Error, { endpoint: '/api/auth/login', method: 'POST' });
    recordMetric('auth.login_error', 1);
    
    console.error('Error logging in user:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
});

// GET /api/auth/login - Check current session
export const GET = traceRequest(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      recordMetric('auth.no_session', 1);
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Get full user data from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        seller: true,
        wallet: true,
      },
    });

    if (!user) {
      recordMetric('auth.user_not_found', 1);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    recordMetric('auth.session_check', 1, { user_id: user.id });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isSeller: user.isSeller,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        bitcoinAddress: user.bitcoinAddress,
        seller: user.seller ? {
          id: user.seller.id,
          storeName: user.seller.storeName,
          category: user.seller.category,
          rating: user.seller.rating,
          isOnline: user.seller.isOnline,
        } : null,
        wallet: user.wallet ? {
          balanceBtc: user.wallet.balanceBtc,
          balanceEur: user.wallet.balanceEur,
        } : null,
      },
      message: 'Session active',
    });

  } catch (error) {
    captureError(error as Error, { endpoint: '/api/auth/login', method: 'GET' });
    recordMetric('auth.session_check_error', 1);
    
    console.error('Error checking session:', error);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
});