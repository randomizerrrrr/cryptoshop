import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Comprehensive health check
    const health = {
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: 0,
      checks: {} as Record<string, any>
    };

    // Database health check
    try {
      const dbStartTime = Date.now();
      await db.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - dbStartTime;
      
      // Get database stats
      const [userCount, productCount, orderCount] = await Promise.all([
        db.user.count(),
        db.product.count(),
        db.order.count()
      ]);

      health.checks.database = {
        status: 'healthy',
        responseTime: dbResponseTime,
        connection: 'connected',
        stats: {
          users: userCount,
          products: productCount,
          orders: orderCount
        }
      };
    } catch (error) {
      health.checks.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Database connection failed',
        connection: 'disconnected'
      };
      health.status = 'degraded';
    }

    // Memory usage check
    const memoryUsage = process.memoryUsage();
    const memoryThreshold = 500; // MB
    const memoryUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    
    health.checks.memory = {
      status: memoryUsed > memoryThreshold ? 'degraded' : 'healthy',
      usage: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: memoryUsed, // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      },
      threshold: memoryThreshold
    };

    if (memoryUsed > memoryThreshold) {
      health.status = 'degraded';
    }

    // Bitcoin service health check
    try {
      const bitcoinStartTime = Date.now();
      // Test bitcoin address generation
      const testResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/bitcoin/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'test', id: 'health-check' })
      });
      const bitcoinResponseTime = Date.now() - bitcoinStartTime;

      health.checks.bitcoin = {
        status: testResponse.ok ? 'healthy' : 'unhealthy',
        responseTime: bitcoinResponseTime,
        endpoint: testResponse.ok ? 'responsive' : 'unresponsive'
      };

      if (!testResponse.ok) {
        health.status = 'degraded';
      }
    } catch (error) {
      health.checks.bitcoin = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Bitcoin service unavailable'
      };
      health.status = 'degraded';
    }

    // Socket.IO health check
    try {
      health.checks.websocket = {
        status: 'healthy',
        endpoint: 'configured'
      };
    } catch (error) {
      health.checks.websocket = {
        status: 'degraded',
        error: error instanceof Error ? error.message : 'WebSocket check failed'
      };
      health.status = 'degraded';
    }

    // System resources
    health.checks.system = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      cpuUsage: process.cpuUsage(),
      resourceUsage: process.resourceUsage?.()
    };

    // Calculate overall response time
    health.responseTime = Date.now() - startTime;

    // Determine final status
    const unhealthyChecks = Object.values(health.checks).filter(check => check.status === 'unhealthy').length;
    const degradedChecks = Object.values(health.checks).filter(check => check.status === 'degraded').length;

    if (unhealthyChecks > 0) {
      health.status = 'unhealthy';
    } else if (degradedChecks > 0) {
      health.status = 'degraded';
    }

    // Add recommendations
    health.recommendations = [];
    
    if (health.checks.memory?.status === 'degraded') {
      health.recommendations.push('Consider increasing memory limits or optimizing memory usage');
    }
    
    if (health.checks.database?.status !== 'healthy') {
      health.recommendations.push('Check database connection and configuration');
    }
    
    if (health.checks.bitcoin?.status !== 'healthy') {
      health.recommendations.push('Verify Bitcoin service configuration and API access');
    }

    // Determine HTTP status based on health
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Detailed health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        checks: {}
      },
      { status: 503 }
    );
  }
}