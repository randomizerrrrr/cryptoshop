import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for seller validation
const updateSellerSchema = z.object({
  storeName: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  responseTime: z.string().optional(),
  isOnline: z.boolean().optional(),
});

// GET /api/sellers/[id] - Get a single seller
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const seller = await db.seller.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
            isVerified: true,
          },
        },
        products: {
          where: {
            isActive: true,
          },
          include: {
            reviews: {
              select: {
                rating: true,
              },
            },
          },
          take: 6, // Limit to 6 products for preview
        },
        reviews: {
          include: {
            user: {
              select: {
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Limit to 5 recent reviews
        },
      },
    });

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Calculate average rating for products
    const productsWithRating = seller.products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
        : 0,
    }));

    return NextResponse.json({
      ...seller,
      products: productsWithRating,
    });
  } catch (error) {
    console.error('Error fetching seller:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seller' },
      { status: 500 }
    );
  }
}

// PUT /api/sellers/[id] - Update a seller profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateSellerSchema.parse(body);

    // Check if user is authenticated
    const userId = body.userId; // This should come from authentication
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if seller exists and user owns it
    const existingSeller = await db.seller.findUnique({
      where: { id: params.id },
      include: {
        user: true,
      },
    });

    if (!existingSeller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    if (existingSeller.user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this seller profile' },
        { status: 403 }
      );
    }

    const seller = await db.seller.update({
      where: { id: params.id },
      data: validatedData,
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

    return NextResponse.json(seller);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating seller:', error);
    return NextResponse.json(
      { error: 'Failed to update seller profile' },
      { status: 500 }
    );
  }
}

// DELETE /api/sellers/[id] - Delete a seller profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const userId = body.userId; // This should come from authentication

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if seller exists and user owns it
    const existingSeller = await db.seller.findUnique({
      where: { id: params.id },
      include: {
        user: true,
      },
    });

    if (!existingSeller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    if (existingSeller.user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this seller profile' },
        { status: 403 }
      );
    }

    // Check if seller has active products
    const activeProducts = await db.product.count({
      where: {
        sellerId: params.id,
        isActive: true,
      },
    });

    if (activeProducts > 0) {
      return NextResponse.json(
        { error: 'Cannot delete seller profile with active products' },
        { status: 400 }
      );
    }

    // Update user to not be a seller
    await db.user.update({
      where: { id: userId },
      data: { isSeller: false },
    });

    // Delete seller profile
    await db.seller.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Seller profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting seller:', error);
    return NextResponse.json(
      { error: 'Failed to delete seller profile' },
      { status: 500 }
    );
  }
}