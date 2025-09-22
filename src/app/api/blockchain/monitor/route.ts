import { NextRequest, NextResponse } from 'next/server';
import { blockchainMonitor } from '@/lib/blockchain-monitor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, address, expectedAmount, orderId } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'start':
        blockchainMonitor.start();
        return NextResponse.json({
          success: true,
          message: 'Blockchain monitor started',
        });

      case 'stop':
        blockchainMonitor.stop();
        return NextResponse.json({
          success: true,
          message: 'Blockchain monitor stopped',
        });

      case 'add':
        if (!address || !expectedAmount || !orderId) {
          return NextResponse.json(
            { error: 'Address, expectedAmount, and orderId are required for add action' },
            { status: 400 }
          );
        }

        blockchainMonitor.addMonitor({
          address,
          expectedAmount,
          orderId,
          status: 'pending',
          createdAt: new Date(),
          requiredConfirmations: 3,
        });

        return NextResponse.json({
          success: true,
          message: 'Address added to monitoring',
          address,
        });

      case 'remove':
        if (!address) {
          return NextResponse.json(
            { error: 'Address is required for remove action' },
            { status: 400 }
          );
        }

        blockchainMonitor.removeMonitor(address);
        return NextResponse.json({
          success: true,
          message: 'Address removed from monitoring',
          address,
        });

      case 'wait':
        if (!address || !expectedAmount || !orderId) {
          return NextResponse.json(
            { error: 'Address, expectedAmount, and orderId are required for wait action' },
            { status: 400 }
          );
        }

        // Start monitoring if not already running
        if (!blockchainMonitor.getStats().isRunning) {
          blockchainMonitor.start();
        }

        // Wait for payment (with timeout)
        const timeout = body.timeout || 15 * 60 * 1000; // 15 minutes default
        const result = await blockchainMonitor.waitForPayment(
          address, 
          expectedAmount, 
          orderId, 
          timeout
        );

        return NextResponse.json({
          success: true,
          result,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in blockchain monitor API:', error);
    return NextResponse.json(
      { error: 'Failed to process blockchain monitor request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (address) {
      // Get specific monitor
      const monitor = blockchainMonitor.getMonitor(address);
      if (!monitor) {
        return NextResponse.json(
          { error: 'Monitor not found for this address' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        monitor,
      });
    } else {
      // Get all monitors and stats
      const monitors = blockchainMonitor.getAllMonitors();
      const stats = blockchainMonitor.getStats();

      return NextResponse.json({
        success: true,
        monitors,
        stats,
      });
    }

  } catch (error) {
    console.error('Error fetching blockchain monitor data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blockchain monitor data' },
      { status: 500 }
    );
  }
}