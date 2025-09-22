import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for product validation
const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  priceBtc: z.number().positive('BTC price must be positive'),
  priceEur: z.number().positive('EUR price must be positive'),
  images: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.string().optional(),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().positive().default(1),
  deliveryTime: z.string().min(1, 'Delivery time is required'),
  digitalProduct: z.boolean().default(true),
  downloadUrl: z.string().optional(),
  specifications: z.record(z.string()).optional(),
});

const updateProductSchema = createProductSchema.partial();

// GET /api/products - Get all products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const sellerId = searchParams.get('sellerId');

    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
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
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // Check if user is authenticated and is a seller
    // This would typically come from a session or JWT token
    const userId = body.userId; // This should come from authentication
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has a seller profile
    const seller = await db.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      );
    }

    // Parse images and tags if they are JSON strings
    let parsedImages = [];
    let parsedTags = [];
    
    if (validatedData.images) {
      try {
        parsedImages = JSON.parse(validatedData.images);
      } catch {
        parsedImages = [validatedData.images];
      }
    }
    
    if (validatedData.tags) {
      try {
        parsedTags = JSON.parse(validatedData.tags);
      } catch {
        parsedTags = [validatedData.tags];
      }
    }

    const product = await db.product.create({
      data: {
        ...validatedData,
        sellerId: seller.id,
        images: JSON.stringify(parsedImages),
        tags: JSON.stringify(parsedTags),
      },
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
    });

    // Create product specifications if provided
    if (validatedData.specifications) {
      await Promise.all(
        Object.entries(validatedData.specifications).map(([key, value]) =>
          db.productSpecification.create({
            data: {
              productId: product.id,
              key,
              value,
            },
          })
        )
      );
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}