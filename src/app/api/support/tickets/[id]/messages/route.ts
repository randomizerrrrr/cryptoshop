import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(2000, 'Message must be less than 2000 characters'),
});

// GET /api/support/tickets/[id]/messages - Get messages for a ticket
export async function GET(
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

    // Check if ticket exists and user has access
    const ticket = await db.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Check if user owns the ticket or is staff (in real implementation, check staff role)
    if (ticket.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to access this ticket' },
        { status: 403 }
      );
    }

    const messages = await db.message.findMany({
      where: { ticketId: params.id },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Error fetching ticket messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/support/tickets/[id]/messages - Add a message to a ticket
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
    const validatedData = messageSchema.parse(body);

    // Check if ticket exists and user has access
    const ticket = await db.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Check if user owns the ticket or is staff
    const isStaff = false; // In real implementation, check if user is staff
    if (ticket.userId !== user.id && !isStaff) {
      return NextResponse.json(
        { error: 'Unauthorized to message this ticket' },
        { status: 403 }
      );
    }

    // Check if ticket is open
    if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
      return NextResponse.json(
        { error: 'Cannot add messages to a closed or resolved ticket' },
        { status: 400 }
      );
    }

    // Create message
    const message = await db.message.create({
      data: {
        ticketId: params.id,
        userId: user.id,
        content: validatedData.content,
        isStaff,
      },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Update ticket status if it was resolved and user is adding a message
    if (ticket.status === 'RESOLVED' && !isStaff) {
      await db.supportTicket.update({
        where: { id: params.id },
        data: { status: 'OPEN' },
      });
    }

    // Update ticket status to IN_PROGRESS if staff is responding
    if (isStaff && ticket.status === 'OPEN') {
      await db.supportTicket.update({
        where: { id: params.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return NextResponse.json(message, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}