import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const payOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});

// POST /api/orders/pay - Pay for an order using wallet balance
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
    const validatedData = payOrderSchema.parse(body);

    // Get order details
    const order = await db.order.findUnique({
      where: { id: validatedData.orderId },
      include: {
        buyer: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user owns the order
    if (order.buyerId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to pay for this order' },
        { status: 403 }
      );
    }

    // Check if order is already paid
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Order is already paid or cannot be paid' },
        { status: 400 }
      );
    }

    // Get user's wallet
    const wallet = await db.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Check if user has sufficient balance
    if (wallet.balanceEur < order.totalEur) {
      return NextResponse.json(
        { 
          error: 'Insufficient balance',
          required: order.totalEur,
          available: wallet.balanceEur,
          difference: order.totalEur - wallet.balanceEur
        },
        { status: 400 }
      );
    }

    // Process payment using wallet pay API
    const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/wallet/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({
        amountEur: order.totalEur,
        description: `Payment for order #${order.id}`,
        orderId: order.id,
      }),
    });

    if (!paymentResponse.ok) {
      const paymentError = await paymentResponse.json();
      return NextResponse.json(
        { error: paymentError.error || 'Payment failed' },
        { status: paymentResponse.status }
      );
    }

    // Create escrow transaction for digital products
    if (order.orderItems.some(item => item.product.digitalProduct)) {
      await db.escrowTransaction.create({
        data: {
          orderId: order.id,
          userId: user.id,
          amountBtc: order.totalBtc,
          amountEur: order.totalEur,
          status: 'CONFIRMED',
          fundedAt: new Date(),
          confirmedAt: new Date(),
        },
      });
    }

    // For digital products, mark as confirmed immediately
    if (order.orderItems.every(item => item.product.digitalProduct)) {
      await db.order.update({
        where: { id: order.id },
        data: {
          status: 'CONFIRMED',
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: 'Payment successful',
      order: {
        id: order.id,
        status: order.orderItems.every(item => item.product.digitalProduct) ? 'CONFIRMED' : 'PAID',
        totalEur: order.totalEur,
        totalBtc: order.totalBtc,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error processing order payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}