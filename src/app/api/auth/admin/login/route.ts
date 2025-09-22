import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verify2FAToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, twoFactorToken } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
      include: {
        sellerProfile: true,
        wallet: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Verify password (in production, use bcrypt)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!twoFactorToken) {
        return NextResponse.json(
          { error: '2FA token required' },
          { status: 400 }
        );
      }
      
      if (!verify2FAToken(twoFactorToken, user.twoFactorSecret)) {
        return NextResponse.json(
          { error: 'Invalid 2FA token' },
          { status: 401 }
        );
      }
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Return success response with user data
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      accessToken: user.accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
        isVerified: user.isVerified,
        bitcoinAddress: user.bitcoinAddress,
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}