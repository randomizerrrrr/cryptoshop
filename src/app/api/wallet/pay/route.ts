import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

// Mock Bitcoin price - in real app, this would come from an API
const BTC_TO_EUR_RATE = 36000; // 1 BTC = 36,000 EUR

const paymentSchema = z.object({
  amountEur: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  orderId: z.string().optional(),
});

// Helper function to convert EUR to BTC
function eurToBtc(amountEur: number): number {
  return amountEur / BTC_TO_EUR_RATE;
}

// POST /api/wallet/pay - Make a payment from wallet (in EUR)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    // Get wallet
    const wallet = await db.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Check if user has enough balance in EUR
    if (wallet.balanceEur < validatedData.amountEur) {
      return NextResponse.json(
        { 
          error: 'Insufficient balance',
          required: validatedData.amountEur,
          available: wallet.balanceEur,
          difference: validatedData.amountEur - wallet.balanceEur
        },
        { status: 400 }
      );
    }

    // Convert EUR amount to BTC for accounting
    const amountBtc = eurToBtc(validatedData.amountEur);

    // Create payment transaction
    const transaction = await db.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'PAYMENT',
        amountBtc,
        amountEur: validatedData.amountEur,
        description: validatedData.description,
        status: 'CONFIRMED',
      },
    });

    // Deduct from wallet balance
    await db.wallet.update({
      where: { id: wallet.id },
      data: {
        balanceBtc: wallet.balanceBtc - amountBtc,
        balanceEur: wallet.balanceEur - validatedData.amountEur,
      },
    });

    // If this is an order payment, update the order status
    if (validatedData.orderId) {
      await db.order.update({
        where: { id: validatedData.orderId },
        data: {
          status: 'PAID',
          paymentConfirmed: true,
          totalBtc: amountBtc,
          totalEur: validatedData.amountEur,
        },
      });
    }

    return NextResponse.json({
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amountBtc: transaction.amountBtc,
        amountEur: transaction.amountEur,
        status: transaction.status,
        description: transaction.description,
        createdAt: transaction.createdAt,
      },
      wallet: {
        balanceBtc: wallet.balanceBtc - amountBtc,
        balanceEur: wallet.balanceEur - validatedData.amountEur,
      },
      message: 'Payment successful',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

// PUT /api/wallet/check-balance - Check if user has sufficient balance for a purchase
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amountEur } = body;

    if (typeof amountEur !== 'number' || amountEur <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get wallet
    const wallet = await db.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    const hasSufficientBalance = wallet.balanceEur >= amountEur;
    const difference = amountEur - wallet.balanceEur;

    return NextResponse.json({
      hasSufficientBalance,
      availableBalance: wallet.balanceEur,
      requiredAmount: amountEur,
      difference: difference > 0 ? difference : 0,
      btcToEurRate: BTC_TO_EUR_RATE,
    });

  } catch (error) {
    console.error('Error checking balance:', error);
    return NextResponse.json(
      { error: 'Failed to check balance' },
      { status: 500 }
    );
  }
}