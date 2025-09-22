import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for order validation
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1, 'At least one item is required'),
});

const updateOrderSchema = z.object({
  status: z.enum(['PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
  paymentHash: z.string().optional(),
  paymentConfirmed: z.boolean().optional(),
});

// GET /api/orders - Get all orders
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
      where.buyerId = userId;
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
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
          escrowTransaction: true,
          reviews: {
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
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Check if user is authenticated
    const userId = body.userId; // This should come from authentication
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get product details and calculate totals
    const productIds = validatedData.items.map(item => item.productId);
    const products = await db.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isActive: true,
        inStock: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'One or more products are not available' },
        { status: 400 }
      );
    }

    // Check stock quantities
    for (const item of validatedData.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${product?.name || item.productId}` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    let totalBtc = 0;
    let totalEur = 0;
    const orderItems = validatedData.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const itemBtc = product!.priceBtc * item.quantity;
      const itemEur = product!.priceEur * item.quantity;
      totalBtc += itemBtc;
      totalEur += itemEur;
      
      return {
        productId: item.productId,
        quantity: item.quantity,
        priceBtc: itemBtc,
        priceEur: itemEur,
      };
    });

    // Create order
    const order = await db.order.create({
      data: {
        buyerId: userId,
        totalBtc,
        totalEur,
        orderItems: {
          create: orderItems,
        },
      },
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
    });

    // Update product stock quantities
    await Promise.all(
      validatedData.items.map(item =>
        db.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
            salesCount: {
              increment: item.quantity,
            },
          },
        })
      )
    );

    // Update seller statistics
    const sellerUpdates = new Map();
    for (const item of validatedData.items) {
      const product = products.find(p => p.id === item.productId);
      const sellerId = product!.sellerId;
      const itemRevenue = product!.priceEur * item.quantity;
      
      if (!sellerUpdates.has(sellerId)) {
        sellerUpdates.set(sellerId, { revenue: 0, sales: 0 });
      }
      sellerUpdates.get(sellerId).revenue += itemRevenue;
      sellerUpdates.get(sellerId).sales += item.quantity;
    }

    await Promise.all(
      Array.from(sellerUpdates.entries()).map(([sellerId, updates]) =>
        db.seller.update({
          where: { id: sellerId },
          data: {
            totalSales: {
              increment: updates.sales,
            },
            totalRevenue: {
              increment: updates.revenue,
            },
          },
        })
      )
    );

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}