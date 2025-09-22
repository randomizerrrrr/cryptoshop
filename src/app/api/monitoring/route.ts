import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Log monitoring data (in production, send to APM service)
    console.log('Monitoring Data:', {
      timestamp: new Date().toISOString(),
      tracesCount: data.traces?.length || 0,
      metricsCount: data.metrics?.length || 0,
      errorsCount: data.errors?.length || 0,
      stats: data.stats
    });

    // Process traces
    if (data.traces && Array.isArray(data.traces)) {
      data.traces.forEach((trace: any) => {
        // Log slow requests (>1000ms)
        if (trace.duration > 1000) {
          console.warn(`Slow request detected: ${trace.name} took ${trace.duration}ms`);
        }
      });
    }

    // Process metrics
    if (data.metrics && Array.isArray(data.metrics)) {
      data.metrics.forEach((metric: any) => {
        // Log high response times
        if (metric.name === 'http.response_time' && metric.value > 1000) {
          console.warn(`High response time: ${metric.value}ms for ${metric.tags.path}`);
        }
      });
    }

    // Process errors
    if (data.errors && Array.isArray(data.errors)) {
      data.errors.forEach((error: any) => {
        console.error(`Captured error: ${error.message}`, {
          context: error.context,
          level: error.level,
          timestamp: error.timestamp
        });
      });
    }

    // In production, integrate with APM services
    if (process.env.NODE_ENV === 'production') {
      // Send to New Relic
      if (process.env.NEW_RELIC_LICENSE_KEY) {
        // await sendToNewRelic(data);
      }
      
      // Send to DataDog
      if (process.env.DATADOG_API_KEY) {
        // await sendToDataDog(data);
      }
      
      // Send to custom monitoring service
      // await sendToCustomMonitoringService(data);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Monitoring data received',
      processed: {
        traces: data.traces?.length || 0,
        metrics: data.metrics?.length || 0,
        errors: data.errors?.length || 0
      }
    });
  } catch (error) {
    console.error('Error processing monitoring data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process monitoring data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return monitoring statistics
  const stats = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    platform: process.platform
  };

  return NextResponse.json(stats);
}