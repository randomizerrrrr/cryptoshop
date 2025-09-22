import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for escrow validation
const createEscrowSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  releaseCode: z.string().min(6, 'Release code must be at least 6 characters'),
});

const updateEscrowSchema = z.object({
  status: z.enum(['FUNDED', 'CONFIRMED', 'RELEASED', 'REFUNDED', 'DISPUTED']).optional(),
  releaseCode: z.string().min(6).optional(),
  disputeReason: z.string().optional(),
  disputeRaised: z.boolean().optional(),
  disputeResolved: z.boolean().optional(),
});

// GET /api/escrow - Get all escrow transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.OR = [
        { userId: userId },
        { participants: { some: { userId: userId } } },
      ];
    }

    const [escrowTransactions, total] = await Promise.all([
      db.escrowTransaction.findMany({
        where,
        include: {
          order: {
            include: {
              buyer: {
                select: {
                  username: true,
                  avatar: true,
                },
              },
              orderItems: {
                include: {
                  product: {
                    include: {
                      seller: {
                        include: {
                          user: {
                            select: {
                              username: true,
                              avatar: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      db.escrowTransaction.count({ where }),
    ]);

    return NextResponse.json({
      escrowTransactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching escrow transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch escrow transactions' },
      { status: 500 }
    );
  }
}

// POST /api/escrow - Create a new escrow transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createEscrowSchema.parse(body);

    // Check if user is authenticated
    const userId = body.userId; // This should come from authentication
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if order exists and belongs to the user
    const order = await db.order.findUnique({
      where: { id: validatedData.orderId },
      include: {
        buyer: true,
        escrowTransaction: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.buyer.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to create escrow for this order' },
        { status: 403 }
      );
    }

    if (order.escrowTransaction) {
      return NextResponse.json(
        { error: 'Escrow transaction already exists for this order' },
        { status: 400 }
      );
    }

    // Create escrow transaction
    const escrowTransaction = await db.escrowTransaction.create({
      data: {
        ...validatedData,
        amountBtc: order.totalBtc,
        amountEur: order.totalEur,
        userId,
        participants: {
          create: [
            {
              userId,
              role: 'BUYER',
              agreedAt: new Date(),
            },
          ],
        },
      },
      include: {
        order: {
          include: {
            buyer: {
              select: {
                username: true,
                avatar: true,
              },
            },
            orderItems: {
              include: {
                product: {
                  include: {
                    seller: {
                      include: {
                        user: {
                          select: {
                            username: true,
                            avatar: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: {
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(escrowTransaction, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating escrow transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create escrow transaction' },
      { status: 500 }
    );
  }
}