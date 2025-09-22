import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Schema for product validation
const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  priceBtc: z.number().positive().optional(),
  priceEur: z.number().positive().optional(),
  images: z.string().optional(),
  category: z.string().min(1).optional(),
  tags: z.string().optional(),
  inStock: z.boolean().optional(),
  stockQuantity: z.number().int().positive().optional(),
  deliveryTime: z.string().min(1).optional(),
  digitalProduct: z.boolean().optional(),
  downloadUrl: z.string().optional(),
  specifications: z.record(z.string()).optional(),
});

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.product.findUnique({
      where: { id: params.id },
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
        specifications: true,
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
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db.product.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);

    // Check if user is authenticated
    const userId = body.userId; // This should come from authentication
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if product exists and user owns it
    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (existingProduct.seller.user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this product' },
        { status: 403 }
      );
    }

    // Parse images and tags if they are JSON strings
    let updateData: any = { ...validatedData };
    
    if (validatedData.images) {
      try {
        const parsedImages = JSON.parse(validatedData.images);
        updateData.images = JSON.stringify(parsedImages);
      } catch {
        updateData.images = JSON.stringify([validatedData.images]);
      }
    }
    
    if (validatedData.tags) {
      try {
        const parsedTags = JSON.parse(validatedData.tags);
        updateData.tags = JSON.stringify(parsedTags);
      } catch {
        updateData.tags = JSON.stringify([validatedData.tags]);
      }
    }

    const product = await db.product.update({
      where: { id: params.id },
      data: updateData,
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
        specifications: true,
      },
    });

    // Update specifications if provided
    if (validatedData.specifications) {
      // Remove existing specifications
      await db.productSpecification.deleteMany({
        where: { productId: params.id },
      });

      // Create new specifications
      await Promise.all(
        Object.entries(validatedData.specifications).map(([key, value]) =>
          db.productSpecification.create({
            data: {
              productId: params.id,
              key,
              value,
            },
          })
        )
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
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

    // Check if product exists and user owns it
    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (existingProduct.seller.user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this product' },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    await db.product.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}