import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const releaseSchema = z.object({
  releaseCode: z.string().min(1, 'Release code is required'),
});

const disputeSchema = z.object({
  reason: z.string().min(1, 'Dispute reason is required'),
});

const resolveSchema = z.object({
  resolution: z.enum(['RELEASE', 'REFUND']),
  resolutionNote: z.string().optional(),
});

// POST /api/escrow/[id]/actions/release - Release funds from escrow
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = releaseSchema.parse(body);

    // Get escrow transaction
    const escrow = await db.escrowTransaction.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            buyer: true,
            orderItems: {
              include: {
                product: {
                  include: {
                    seller: true,
                  },
                },
              },
            },
          },
        },
        participants: true,
      },
    });

    if (!escrow) {
      return NextResponse.json(
        { error: 'Escrow transaction not found' },
        { status: 404 }
      );
    }

    // Check if user is a participant
    const isParticipant = escrow.participants.some(p => p.userId === user.id);
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Unauthorized to release funds' },
        { status: 403 }
      );
    }

    // Check if escrow can be released
    if (escrow.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Escrow funds cannot be released at this time' },
        { status: 400 }
      );
    }

    // Verify release code
    if (escrow.releaseCode !== validatedData.releaseCode) {
      return NextResponse.json(
        { error: 'Invalid release code' },
        { status: 400 }
      );
    }

    // Get seller from order items
    const seller = escrow.order.orderItems[0]?.product.seller;
    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Release funds to seller's wallet
    await db.$transaction(async (tx) => {
      // Update escrow status
      await tx.escrowTransaction.update({
        where: { id: params.id },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
        },
      });

      // Add funds to seller's wallet
      await tx.wallet.upsert({
        where: { userId: seller.userId },
        update: {
          balanceBtc: {
            increment: escrow.amountBtc,
          },
          balanceEur: {
            increment: escrow.amountEur,
          },
        },
        create: {
          userId: seller.userId,
          balanceBtc: escrow.amountBtc,
          balanceEur: escrow.amountEur,
        },
      });

      // Create wallet transaction for seller
      await tx.walletTransaction.create({
        data: {
          walletId: seller.userId,
          type: 'ESCROW_RELEASE',
          amountBtc: escrow.amountBtc,
          amountEur: escrow.amountEur,
          description: `Escrow release from order #${escrow.orderId}`,
          status: 'CONFIRMED',
        },
      });

      // Update order status
      await tx.order.update({
        where: { id: escrow.orderId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      message: 'Funds released successfully',
      escrowId: params.id,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error releasing escrow funds:', error);
    return NextResponse.json(
      { error: 'Failed to release funds' },
      { status: 500 }
    );
  }
}

// PUT /api/escrow/[id]/actions/dispute - Raise a dispute
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = disputeSchema.parse(body);

    // Get escrow transaction
    const escrow = await db.escrowTransaction.findUnique({
      where: { id: params.id },
      include: {
        participants: true,
      },
    });

    if (!escrow) {
      return NextResponse.json(
        { error: 'Escrow transaction not found' },
        { status: 404 }
      );
    }

    // Check if user is a participant
    const isParticipant = escrow.participants.some(p => p.userId === user.id);
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Unauthorized to raise dispute' },
        { status: 403 }
      );
    }

    // Check if dispute can be raised
    if (escrow.status !== 'CONFIRMED' || escrow.disputeRaised) {
      return NextResponse.json(
        { error: 'Dispute cannot be raised at this time' },
        { status: 400 }
      );
    }

    // Update escrow with dispute
    await db.escrowTransaction.update({
      where: { id: params.id },
      data: {
        status: 'DISPUTED',
        disputeRaised: true,
        disputeReason: validatedData.reason,
      },
    });

    return NextResponse.json({
      message: 'Dispute raised successfully',
      escrowId: params.id,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error raising dispute:', error);
    return NextResponse.json(
      { error: 'Failed to raise dispute' },
      { status: 500 }
    );
  }
}

// PATCH /api/escrow/[id]/actions/resolve - Resolve a dispute (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // In a real implementation, you would check if user is admin
    // For now, we'll allow any authenticated user (for demo purposes)
    
    const body = await request.json();
    const validatedData = resolveSchema.parse(body);

    // Get escrow transaction
    const escrow = await db.escrowTransaction.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            buyer: true,
            orderItems: {
              include: {
                product: {
                  include: {
                    seller: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!escrow) {
      return NextResponse.json(
        { error: 'Escrow transaction not found' },
        { status: 404 }
      );
    }

    // Check if dispute can be resolved
    if (!escrow.disputeRaised || escrow.disputeResolved) {
      return NextResponse.json(
        { error: 'Dispute cannot be resolved at this time' },
        { status: 400 }
      );
    }

    await db.$transaction(async (tx) => {
      if (validatedData.resolution === 'RELEASE') {
        // Release funds to seller
        const seller = escrow.order.orderItems[0]?.product.seller;
        if (seller) {
          await tx.wallet.upsert({
            where: { userId: seller.userId },
            update: {
              balanceBtc: {
                increment: escrow.amountBtc,
              },
              balanceEur: {
                increment: escrow.amountEur,
              },
            },
            create: {
              userId: seller.userId,
              balanceBtc: escrow.amountBtc,
              balanceEur: escrow.amountEur,
            },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: seller.userId,
              type: 'ESCROW_RELEASE',
              amountBtc: escrow.amountBtc,
              amountEur: escrow.amountEur,
              description: `Escrow release from disputed order #${escrow.orderId}`,
              status: 'CONFIRMED',
            },
          });
        }

        await tx.escrowTransaction.update({
          where: { id: params.id },
          data: {
            status: 'RELEASED',
            releasedAt: new Date(),
            disputeResolved: true,
          },
        });
      } else {
        // Refund funds to buyer
        await tx.wallet.upsert({
          where: { userId: escrow.order.buyerId },
          update: {
            balanceBtc: {
              increment: escrow.amountBtc,
            },
            balanceEur: {
              increment: escrow.amountEur,
            },
          },
          create: {
            userId: escrow.order.buyerId,
            balanceBtc: escrow.amountBtc,
            balanceEur: escrow.amountEur,
          },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: escrow.order.buyerId,
            type: 'ESCROW_REFUND',
            amountBtc: escrow.amountBtc,
            amountEur: escrow.amountEur,
            description: `Escrow refund from disputed order #${escrow.orderId}`,
            status: 'CONFIRMED',
          },
        });

        await tx.escrowTransaction.update({
          where: { id: params.id },
          data: {
            status: 'REFUNDED',
            refundedAt: new Date(),
            disputeResolved: true,
          },
        });
      }

      // Update order status
      await tx.order.update({
        where: { id: escrow.orderId },
        data: {
          status: validatedData.resolution === 'RELEASE' ? 'COMPLETED' : 'REFUNDED',
          completedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      message: `Dispute resolved: ${validatedData.resolution}`,
      escrowId: params.id,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error resolving dispute:', error);
    return NextResponse.json(
      { error: 'Failed to resolve dispute' },
      { status: 500 }
    );
  }
}