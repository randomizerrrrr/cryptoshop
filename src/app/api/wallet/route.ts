import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

// Mock Bitcoin price - in real app, this would come from an API
const BTC_TO_EUR_RATE = 36000; // 1 BTC = 36,000 EUR

const depositSchema = z.object({
  amountBtc: z.number().positive('BTC amount must be positive'),
  txid: z.string().min(1, 'Transaction ID is required'),
});

const withdrawalSchema = z.object({
  amountBtc: z.number().positive('BTC amount must be positive'),
  address: z.string().min(1, 'Bitcoin address is required'),
});

// Helper function to convert BTC to EUR
function btcToEur(amountBtc: number): number {
  return amountBtc * BTC_TO_EUR_RATE;
}

// Helper function to convert EUR to BTC
function eurToBtc(amountEur: number): number {
  return amountEur / BTC_TO_EUR_RATE;
}

// GET /api/wallet - Get wallet information and transactions
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get wallet information
    const wallet = await db.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Get recent transactions
    const transactions = await db.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Calculate statistics
    const stats = {
      totalBalance: { 
        btc: wallet.balanceBtc, 
        eur: wallet.balanceEur 
      },
      availableBalance: { 
        btc: wallet.balanceBtc, 
        eur: wallet.balanceEur 
      },
      pendingDeposits: { 
        btc: 0, 
        eur: 0 
      }, // Would calculate from pending transactions
      totalTransactions: transactions.length,
    };

    // Calculate pending deposits from transactions
    const pendingTransactions = transactions.filter(t => t.status === 'PENDING' && t.type === 'DEPOSIT');
    stats.pendingDeposits.btc = pendingTransactions.reduce((sum, t) => sum + t.amountBtc, 0);
    stats.pendingDeposits.eur = pendingTransactions.reduce((sum, t) => sum + t.amountEur, 0);

    return NextResponse.json({
      wallet: {
        balanceBtc: wallet.balanceBtc,
        balanceEur: wallet.balanceEur,
        address: wallet.address,
      },
      stats,
      transactions,
      btcToEurRate: BTC_TO_EUR_RATE,
    });

  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet information' },
      { status: 500 }
    );
  }
}

// POST /api/wallet/deposit - Deposit Bitcoin to wallet
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
    const validatedData = depositSchema.parse(body);

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

    // Convert BTC to EUR
    const amountEur = btcToEur(validatedData.amountBtc);

    // Create deposit transaction
    const transaction = await db.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'DEPOSIT',
        amountBtc: validatedData.amountBtc,
        amountEur,
        description: `Bitcoin deposit: ${validatedData.amountBtc} BTC`,
        hash: validatedData.txid,
        status: 'PENDING',
      },
    });

    // In a real implementation, you would verify the Bitcoin transaction
    // on the blockchain before confirming the deposit
    // For now, we'll simulate confirmation after 3 confirmations
    // This would typically be handled by a background job

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
      message: 'Deposit initiated. Waiting for blockchain confirmations.',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error processing deposit:', error);
    return NextResponse.json(
      { error: 'Failed to process deposit' },
      { status: 500 }
    );
  }
}

// POST /api/wallet/withdraw - Withdraw Bitcoin from wallet
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
    const validatedData = withdrawalSchema.parse(body);

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

    // Check if user has enough balance
    if (wallet.balanceBtc < validatedData.amountBtc) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Minimum withdrawal check
    if (validatedData.amountBtc < 0.001) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is 0.001 BTC' },
        { status: 400 }
      );
    }

    const amountEur = btcToEur(validatedData.amountBtc);

    // Create withdrawal transaction
    const transaction = await db.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'WITHDRAWAL',
        amountBtc: validatedData.amountBtc,
        amountEur,
        description: `Bitcoin withdrawal to ${validatedData.address}`,
        status: 'PENDING',
      },
    });

    // Deduct from wallet balance (in real app, this would happen after blockchain confirmation)
    await db.wallet.update({
      where: { id: wallet.id },
      data: {
        balanceBtc: wallet.balanceBtc - validatedData.amountBtc,
        balanceEur: wallet.balanceEur - amountEur,
      },
    });

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
      message: 'Withdrawal initiated. Bitcoin will be sent to your address.',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}