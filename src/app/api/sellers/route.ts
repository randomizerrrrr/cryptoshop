import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for seller validation
const createSellerSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  responseTime: z.string().optional(),
});

const updateSellerSchema = createSellerSchema.partial();

// GET /api/sellers - Get all sellers with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (category && category !== 'All') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { storeName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (verifiedOnly) {
      where.user = {
        isVerified: true,
      };
    }

    const orderBy: any = {};
    switch (sortBy) {
      case 'rating':
        orderBy.rating = sortOrder;
        break;
      case 'sales':
        orderBy.totalSales = sortOrder;
        break;
      case 'products':
        orderBy._count = {
          products: sortOrder,
        };
        break;
      case 'revenue':
        orderBy.totalRevenue = sortOrder;
        break;
      case 'reviews':
        orderBy.reviewCount = sortOrder;
        break;
      case 'joined':
        orderBy.joinedAt = sortOrder;
        break;
      default:
        orderBy.rating = sortOrder;
    }

    const [sellers, total] = await Promise.all([
      db.seller.findMany({
        where,
        include: {
          user: {
            select: {
              username: true,
              avatar: true,
              isVerified: true,
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.seller.count({ where }),
    ]);

    // Calculate global statistics
    const globalStats = await db.seller.aggregate({
      _count: {
        id: true,
      },
      _sum: {
        totalSales: true,
        totalRevenue: true,
      },
      _avg: {
        rating: true,
      },
      where: {
        user: {
          isVerified: true,
        },
      },
    });

    const activeSellers = await db.seller.count({
      where: {
        isOnline: true,
      },
    });

    return NextResponse.json({
      sellers,
      globalStats: {
        totalSellers: globalStats._count.id,
        activeSellers,
        totalProducts: sellers.reduce((acc, seller) => acc + seller._count.products, 0),
        totalSales: globalStats._sum.totalSales || 0,
        averageRating: globalStats._avg.rating || 0,
        totalRevenue: globalStats._sum.totalRevenue || 0,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sellers' },
      { status: 500 }
    );
  }
}

// POST /api/sellers - Create a new seller profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createSellerSchema.parse(body);

    // Check if user is authenticated
    const userId = body.userId; // This should come from authentication
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user already has a seller profile
    const existingSeller = await db.seller.findUnique({
      where: { userId },
    });

    if (existingSeller) {
      return NextResponse.json(
        { error: 'Seller profile already exists' },
        { status: 400 }
      );
    }

    // Update user to be a seller
    await db.user.update({
      where: { id: userId },
      data: { isSeller: true },
    });

    const seller = await db.seller.create({
      data: {
        ...validatedData,
        userId,
      },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
    });

    return NextResponse.json(seller, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating seller:', error);
    return NextResponse.json(
      { error: 'Failed to create seller profile' },
      { status: 500 }
    );
  }
}