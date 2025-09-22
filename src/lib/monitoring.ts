import { NextRequest } from 'next/server';

interface TraceData {
  traceId: string;
  spanId: string;
  parentId?: string;
  timestamp: number;
  duration: number;
  name: string;
  tags: Record<string, string>;
  logs: Array<{
    timestamp: number;
    message: string;
    level: string;
    fields?: Record<string, any>;
  }>;
}

interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
}

interface ErrorData {
  message: string;
  stack?: string;
  timestamp: number;
  context: Record<string, any>;
  level: 'error' | 'warning' | 'info';
}

export class MonitoringService {
  private traces: TraceData[] = [];
  private metrics: MetricData[] = [];
  private errors: ErrorData[] = [];
  private activeSpans = new Map<string, { startTime: number; traceId: string }>();

  // Configuration
  private config = {
    maxTraces: 1000,
    maxMetrics: 5000,
    maxErrors: 1000,
    sampleRate: 1.0, // 100% sampling for development
    flushInterval: 30000, // 30 seconds
    endpoint: process.env.APM_ENDPOINT || '/api/monitoring'
  };

  constructor() {
    // Start periodic flush
    setInterval(() => this.flush(), this.config.flushInterval);
    
    // Handle process errors
    process.on('uncaughtException', (error) => {
      this.captureError(error, { source: 'uncaughtException' });
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      this.captureError(new Error(`Unhandled Rejection: ${reason}`), {
        source: 'unhandledRejection',
        promise: promise
      });
    });
  }

  /**
   * Start a new trace span
   */
  startSpan(name: string, parentId?: string, tags: Record<string, string> = {}): string {
    const traceId = parentId ? this.getTraceId(parentId) : this.generateId();
    const spanId = this.generateId();
    
    this.activeSpans.set(spanId, {
      startTime: Date.now(),
      traceId
    });

    return spanId;
  }

  /**
   * End a trace span
   */
  endSpan(spanId: string, tags: Record<string, string> = {}) {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    const duration = Date.now() - span.startTime;
    
    const trace: TraceData = {
      traceId: span.traceId,
      spanId,
      parentId: this.getParentId(spanId),
      timestamp: span.startTime,
      duration,
      name: this.getSpanName(spanId),
      tags: { ...tags },
      logs: []
    };

    this.addTrace(trace);
    this.activeSpans.delete(spanId);
  }

  /**
   * Record a metric
   */
  recordMetric(name: string, value: number, tags: Record<string, string> = {}) {
    const metric: MetricData = {
      name,
      value,
      timestamp: Date.now(),
      tags
    };

    this.addMetric(metric);
  }

  /**
   * Capture an error
   */
  captureError(error: Error | string, context: Record<string, any> = {}) {
    const errorData: ErrorData = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      timestamp: Date.now(),
      context,
      level: 'error'
    };

    this.addError(errorData);
  }

  /**
   * Capture a warning
   */
  captureWarning(message: string, context: Record<string, any> = {}) {
    const errorData: ErrorData = {
      message,
      timestamp: Date.now(),
      context,
      level: 'warning'
    };

    this.addError(errorData);
  }

  /**
   * Add log to active span
   */
  addLogToSpan(spanId: string, message: string, level: string = 'info', fields?: Record<string, any>) {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    // Find the trace and add log
    const trace = this.traces.find(t => t.spanId === spanId);
    if (trace) {
      trace.logs.push({
        timestamp: Date.now(),
        message,
        level,
        fields
      });
    }
  }

  /**
   * HTTP request middleware wrapper
   */
  static traceRequest(handler: (req: NextRequest, ...args: any[]) => Promise<Response>) {
    return async (req: NextRequest, ...args: any[]): Promise<Response> => {
      const monitoring = new MonitoringService();
      const spanId = monitoring.startSpan(`HTTP ${req.method} ${req.nextUrl.pathname}`, undefined, {
        method: req.method,
        path: req.nextUrl.pathname,
        userAgent: req.headers.get('user-agent') || 'unknown'
      });

      try {
        const response = await handler(req, ...args);
        
        monitoring.endSpan(spanId, {
          status: response.status.toString(),
          contentType: response.headers.get('content-type') || 'unknown'
        });

        // Record response time metric
        monitoring.recordMetric('http.response_time', Date.now() - parseInt(spanId.substring(0, 8), 16), {
          method: req.method,
          path: req.nextUrl.pathname,
          status: response.status.toString()
        });

        return response;
      } catch (error) {
        monitoring.endSpan(spanId, { error: 'true' });
        monitoring.captureError(error as Error, {
          request: {
            method: req.method,
            path: req.nextUrl.pathname
          }
        });

        throw error;
      }
    };
  }

  /**
   * Performance monitoring wrapper
   */
  static monitorPerformance<T>(name: string, fn: () => T, tags: Record<string, string> = {}): T {
    const monitoring = new MonitoringService();
    const spanId = monitoring.startSpan(name, undefined, tags);

    try {
      const result = fn();
      monitoring.endSpan(spanId);
      return result;
    } catch (error) {
      monitoring.endSpan(spanId, { error: 'true' });
      monitoring.captureError(error as Error, { operation: name });
      throw error;
    }
  }

  /**
   * Get monitoring statistics
   */
  getStats() {
    return {
      traces: this.traces.length,
      metrics: this.metrics.length,
      errors: this.errors.length,
      activeSpans: this.activeSpans.size,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
  }

  /**
   * Flush data to external monitoring service
   */
  private async flush() {
    if (this.traces.length === 0 && this.metrics.length === 0 && this.errors.length === 0) {
      return;
    }

    try {
      // In production, send to APM service like New Relic, DataDog, or custom endpoint
      if (process.env.NODE_ENV === 'production' && this.config.endpoint) {
        const payload = {
          traces: this.traces.slice(),
          metrics: this.metrics.slice(),
          errors: this.errors.slice(),
          stats: this.getStats(),
          timestamp: Date.now()
        };

        // Send to monitoring service
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(err => {
          console.error('Failed to flush monitoring data:', err);
        });
      }

      // Clear data
      this.traces = [];
      this.metrics = [];
      this.errors = [];
    } catch (error) {
      console.error('Error flushing monitoring data:', error);
    }
  }

  // Helper methods
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private getTraceId(spanId: string): string {
    const trace = this.traces.find(t => t.spanId === spanId);
    return trace?.traceId || spanId;
  }

  private getParentId(spanId: string): string | undefined {
    // Simple implementation - in real distributed tracing, this would be more sophisticated
    return undefined;
  }

  private getSpanName(spanId: string): string {
    // Extract name from span data or use default
    return 'operation';
  }

  private addTrace(trace: TraceData) {
    if (this.traces.length >= this.config.maxTraces) {
      this.traces = this.traces.slice(-this.config.maxTraces / 2);
    }
    this.traces.push(trace);
  }

  private addMetric(metric: MetricData) {
    if (this.metrics.length >= this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics / 2);
    }
    this.metrics.push(metric);
  }

  private addError(error: ErrorData) {
    if (this.errors.length >= this.config.maxErrors) {
      this.errors = this.errors.slice(-this.config.maxErrors / 2);
    }
    this.errors.push(error);
  }
}

// Global monitoring instance
export const monitoring = new MonitoringService();

// Utility functions
export function traceRequest(handler: (req: NextRequest, ...args: any[]) => Promise<Response>) {
  return MonitoringService.traceRequest(handler);
}

export function monitorPerformance<T>(name: string, fn: () => T, tags?: Record<string, string>): T {
  return MonitoringService.monitorPerformance(name, fn, tags);
}

export function captureError(error: Error | string, context?: Record<string, any>) {
  monitoring.captureError(error, context);
}

export function captureWarning(message: string, context?: Record<string, any>) {
  monitoring.captureWarning(message, context);
}

export function recordMetric(name: string, value: number, tags?: Record<string, string>) {
  monitoring.recordMetric(name, value, tags);
}