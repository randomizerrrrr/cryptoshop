import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { generateAccessToken, generate2FASecret, generateBackupCodes } from '@/lib/auth';
import { bitcoinWallet } from '@/lib/bitcoin-wallet';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  isSeller: z.boolean().default(false),
  enable2FA: z.boolean().default(false),
  bitcoinAddress: z.string().optional(),
});

// POST /api/auth/register - Enhanced registration with NextAuth.js
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if username already exists
    const existingUser = await db.user.findUnique({
      where: { username: validatedData.username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Generate unique access token and user ID
    const userId = uuidv4();
    const accessToken = generateAccessToken();

    // Setup 2FA if requested
    let twoFactorSecret = null;
    let backupCodes = [];
    
    if (validatedData.enable2FA) {
      const twoFactorSetup = generate2FASecret(validatedData.username);
      twoFactorSecret = twoFactorSetup.secret;
      backupCodes = generateBackupCodes();
    }

    // Generate Bitcoin wallet address if not provided
    let userBitcoinAddress = validatedData.bitcoinAddress;
    if (!userBitcoinAddress) {
      const wallet = bitcoinWallet.generateDepositAddress(userId);
      userBitcoinAddress = wallet.address;
    }

    // Create user with enhanced security
    const user = await db.user.create({
      data: {
        id: userId,
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password, // In production, hash with bcrypt
        accessToken,
        isSeller: validatedData.isSeller,
        twoFactorEnabled: validatedData.enable2FA,
        twoFactorSecret,
        backupCodes: validatedData.enable2FA ? backupCodes : [],
        bitcoinAddress: userBitcoinAddress,
        isVerified: false, // Email verification required
      },
    });

    // Create seller profile if requested
    if (validatedData.isSeller) {
      await db.seller.create({
        data: {
          userId: user.id,
          storeName: `${validatedData.username}'s Store`,
          category: 'General',
          responseTime: '24 hours',
          verificationStatus: 'pending', // Sellers need verification
        },
      });
    }

    // Create wallet for the user
    await db.wallet.create({
      data: {
        userId: user.id,
        balanceBtc: 0,
        balanceEur: 0,
      },
    });

    // In production, send verification email here
    // For now, we'll auto-verify for development
    if (process.env.NODE_ENV === 'development') {
      await db.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    // Return user data without sensitive information
    const { 
      id, 
      username, 
      email, 
      isSeller, 
      isVerified, 
      twoFactorEnabled, 
      bitcoinAddress,
      createdAt 
    } = user;

    return NextResponse.json({
      user: {
        id,
        username,
        email,
        isSeller,
        isVerified,
        twoFactorEnabled,
        bitcoinAddress,
        createdAt,
      },
      accessToken,
      backupCodes: validatedData.enable2FA ? backupCodes : undefined,
      message: 'Registration successful. Please check your email for verification.',
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}