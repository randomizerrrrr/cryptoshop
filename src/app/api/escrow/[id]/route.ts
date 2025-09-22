import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for escrow validation
const updateEscrowSchema = z.object({
  status: z.enum(['FUNDED', 'CONFIRMED', 'RELEASED', 'REFUNDED', 'DISPUTED']).optional(),
  releaseCode: z.string().min(6).optional(),
  disputeReason: z.string().optional(),
  disputeRaised: z.boolean().optional(),
  disputeResolved: z.boolean().optional(),
});

// GET /api/escrow/[id] - Get a single escrow transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const escrowTransaction = await db.escrowTransaction.findUnique({
      where: { id: params.id },
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

    if (!escrowTransaction) {
      return NextResponse.json(
        { error: 'Escrow transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(escrowTransaction);
  } catch (error) {
    console.error('Error fetching escrow transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch escrow transaction' },
      { status: 500 }
    );
  }
}

// PUT /api/escrow/[id] - Update an escrow transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateEscrowSchema.parse(body);

    // Check if user is authenticated
    const userId = body.userId; // This should come from authentication
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if escrow transaction exists
    const existingEscrow = await db.escrowTransaction.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            buyer: true,
            orderItems: {
              include: {
                product: {
                  include: {
                    seller: {
                      include: {
                        user: true,
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
            user: true,
          },
        },
      },
    });

    if (!existingEscrow) {
      return NextResponse.json(
        { error: 'Escrow transaction not found' },
        { status: 404 }
      );
    }

    // Check if user is a participant in the escrow
    const isParticipant = existingEscrow.participants.some(p => p.user.id === userId);
    const isBuyer = existingEscrow.order.buyer.id === userId;
    const isSeller = existingEscrow.order.orderItems[0]?.product.seller.user.id === userId;

    if (!isParticipant && !isBuyer && !isSeller) {
      return NextResponse.json(
        { error: 'Unauthorized to update this escrow transaction' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = { ...validatedData };
    
    // Update timestamps based on status
    if (validatedData.status) {
      switch (validatedData.status) {
        case 'FUNDED':
          updateData.fundedAt = new Date();
          break;
        case 'CONFIRMED':
          updateData.confirmedAt = new Date();
          break;
        case 'RELEASED':
          updateData.releasedAt = new Date();
          break;
        case 'REFUNDED':
          updateData.refundedAt = new Date();
          break;
      }
    }

    // Handle dispute
    if (validatedData.disputeRaised) {
      updateData.status = 'DISPUTED';
    }

    // Handle release code verification
    if (validatedData.releaseCode && validatedData.status === 'RELEASED') {
      if (existingEscrow.releaseCode !== validatedData.releaseCode) {
        return NextResponse.json(
          { error: 'Invalid release code' },
          { status: 400 }
        );
      }
    }

    const escrowTransaction = await db.escrowTransaction.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(escrowTransaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating escrow transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update escrow transaction' },
      { status: 500 }
    );
  }
}

// POST /api/escrow/[id]/release - Release funds from escrow
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { releaseCode, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!releaseCode) {
      return NextResponse.json(
        { error: 'Release code is required' },
        { status: 400 }
      );
    }

    // Check if escrow transaction exists
    const existingEscrow = await db.escrowTransaction.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            buyer: true,
          },
        },
      },
    });

    if (!existingEscrow) {
      return NextResponse.json(
        { error: 'Escrow transaction not found' },
        { status: 404 }
      );
    }

    // Verify release code
    if (existingEscrow.releaseCode !== releaseCode) {
      return NextResponse.json(
        { error: 'Invalid release code' },
        { status: 400 }
      );
    }

    // Check if user is authorized to release funds
    if (existingEscrow.order.buyer.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to release funds' },
        { status: 403 }
      );
    }

    // Update escrow status
    const escrowTransaction = await db.escrowTransaction.update({
      where: { id: params.id },
      data: {
        status: 'RELEASED',
        releasedAt: new Date(),
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

    return NextResponse.json(escrowTransaction);
  } catch (error) {
    console.error('Error releasing escrow funds:', error);
    return NextResponse.json(
      { error: 'Failed to release escrow funds' },
      { status: 500 }
    );
  }
}

// POST /api/escrow/[id]/dispute - Raise a dispute
export async function PUT_DISPUTE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { disputeReason, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!disputeReason) {
      return NextResponse.json(
        { error: 'Dispute reason is required' },
        { status: 400 }
      );
    }

    // Check if escrow transaction exists
    const existingEscrow = await db.escrowTransaction.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            buyer: true,
            orderItems: {
              include: {
                product: {
                  include: {
                    seller: {
                      include: {
                        user: true,
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
            user: true,
          },
        },
      },
    });

    if (!existingEscrow) {
      return NextResponse.json(
        { error: 'Escrow transaction not found' },
        { status: 404 }
      );
    }

    // Check if user is a participant
    const isParticipant = existingEscrow.participants.some(p => p.user.id === userId);
    const isBuyer = existingEscrow.order.buyer.id === userId;
    const isSeller = existingEscrow.order.orderItems[0]?.product.seller.user.id === userId;

    if (!isParticipant && !isBuyer && !isSeller) {
      return NextResponse.json(
        { error: 'Unauthorized to raise dispute' },
        { status: 403 }
      );
    }

    // Update escrow with dispute
    const escrowTransaction = await db.escrowTransaction.update({
      where: { id: params.id },
      data: {
        status: 'DISPUTED',
        disputeRaised: true,
        disputeReason,
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

    return NextResponse.json(escrowTransaction);
  } catch (error) {
    console.error('Error raising dispute:', error);
    return NextResponse.json(
      { error: 'Failed to raise dispute' },
      { status: 500 }
    );
  }
}