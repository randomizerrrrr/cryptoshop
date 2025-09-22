import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { requireAuth, generate2FASecret, generateBackupCodes, verify2FAToken } from '@/lib/auth';

const setup2FASchema = z.object({
  totpCode: z.string().min(6, 'TOTP code must be 6 digits').max(6, 'TOTP code must be 6 digits'),
  secret: z.string().min(1, 'Secret is required'),
});

const verify2FASchema = z.object({
  totpCode: z.string().min(6, 'TOTP code must be 6 digits').max(6, 'TOTP code must be 6 digits'),
});

const disable2FASchema = z.object({
  totpCode: z.string().min(6, 'TOTP code must be 6 digits').max(6, 'TOTP code must be 6 digits'),
});

// GET /api/auth/2fa/setup - Get 2FA setup information
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      );
    }

    // Generate 2FA secret
    const { secret, qrCodeUrl } = generate2FASecret(user.username);
    const backupCodes = generateBackupCodes();

    return NextResponse.json({
      secret,
      qrCodeUrl,
      backupCodes,
      message: 'Scan the QR code with your authenticator app and save the backup codes securely.',
    });

  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}

// POST /api/auth/2fa/setup - Enable 2FA
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = setup2FASchema.parse(body);

    // Verify the TOTP code
    const isValid = verify2FAToken(validatedData.totpCode, validatedData.secret);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid TOTP code' },
        { status: 400 }
      );
    }

    // Enable 2FA for the user
    await db.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: validatedData.secret,
        twoFactorEnabled: true,
      },
    });

    // Store backup codes (in a real implementation, you'd hash these)
    // For now, we'll just return them to the user to save
    const backupCodes = generateBackupCodes();

    return NextResponse.json({
      message: '2FA enabled successfully',
      backupCodes,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error enabling 2FA:', error);
    return NextResponse.json(
      { error: 'Failed to enable 2FA' },
      { status: 500 }
    );
  }
}

// PUT /api/auth/2fa/verify - Verify 2FA code (for testing)
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = verify2FASchema.parse(body);

    // Verify the TOTP code
    const isValid = verify2FAToken(validatedData.totpCode, user.twoFactorSecret!);
    
    return NextResponse.json({
      valid: isValid,
      message: isValid ? '2FA code is valid' : 'Invalid 2FA code',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error verifying 2FA:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/2fa - Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = disable2FASchema.parse(body);

    // Verify the TOTP code before disabling
    const isValid = verify2FAToken(validatedData.totpCode, user.twoFactorSecret!);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid TOTP code' },
        { status: 400 }
      );
    }

    // Disable 2FA for the user
    await db.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
      },
    });

    return NextResponse.json({
      message: '2FA disabled successfully',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error disabling 2FA:', error);
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}