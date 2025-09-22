// Health monitoring and system diagnostics

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  message?: string;
  timestamp: number;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  lastUpdated: number;
}

export class HealthMonitor {
  private checks: Map<string, () => Promise<HealthCheck>> = new Map();
  private healthHistory: HealthCheck[] = [];
  private maxHistorySize = 100;

  constructor() {
    this.initializeDefaultChecks();
  }

  private initializeDefaultChecks() {
    // Database health check
    this.addCheck('database', async () => {
      const start = Date.now();
      try {
        // Check database connectivity - use a simple server-side check
        const { db } = await import('@/lib/db');
        await db.$queryRaw`SELECT 1`;
        
        return {
          name: 'database',
          status: 'healthy',
          responseTime: Date.now() - start,
          timestamp: Date.now(),
        };
      } catch (error) {
        return {
          name: 'database',
          status: 'unhealthy',
          responseTime: Date.now() - start,
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        };
      }
    });

    // API health check (server-side)
    this.addCheck('api', async () => {
      const start = Date.now();
      try {
        // Check if we can access the API routes by testing imports
        const { db } = await import('@/lib/db');
        await db.product.findFirst({ take: 1 });
        
        return {
          name: 'api',
          status: 'healthy',
          responseTime: Date.now() - start,
          timestamp: Date.now(),
        };
      } catch (error) {
        return {
          name: 'api',
          status: 'degraded',
          responseTime: Date.now() - start,
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        };
      }
    });

    // Authentication health check
    this.addCheck('authentication', async () => {
      const start = Date.now();
      try {
        // Check if we can access user authentication
        const { db } = await import('@/lib/db');
        await db.user.findFirst({ take: 1 });
        
        return {
          name: 'authentication',
          status: 'healthy',
          responseTime: Date.now() - start,
          timestamp: Date.now(),
        };
      } catch (error) {
        return {
          name: 'authentication',
          status: 'unhealthy',
          responseTime: Date.now() - start,
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        };
      }
    });

    // Bitcoin service health check
    this.addCheck('bitcoin-service', async () => {
      const start = Date.now();
      try {
        // Check if we can access the bitcoin service
        const { BitcoinService } = await import('@/lib/bitcoin-service');
        const service = new BitcoinService();
        await service.getBitcoinPrice();
        
        return {
          name: 'bitcoin-service',
          status: 'healthy',
          responseTime: Date.now() - start,
          timestamp: Date.now(),
        };
      } catch (error) {
        return {
          name: 'bitcoin-service',
          status: 'degraded',
          responseTime: Date.now() - start,
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        };
      }
    });
  }

  addCheck(name: string, checkFunction: () => Promise<HealthCheck>) {
    this.checks.set(name, checkFunction);
  }

  async runChecks(): Promise<SystemHealth> {
    const checkPromises = Array.from(this.checks.values()).map(check => check());
    const results = await Promise.allSettled(checkPromises);
    
    const checks: HealthCheck[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: `check-${index}`,
          status: 'unhealthy',
          responseTime: 0,
          message: result.reason instanceof Error ? result.reason.message : 'Unknown error',
          timestamp: Date.now(),
        };
      }
    });

    // Store in history
    this.healthHistory.push(...checks);
    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory = this.healthHistory.slice(-this.maxHistorySize);
    }

    // Calculate overall health
    const overallStatus = this.calculateOverallStatus(checks);
    
    // Get system metrics
    const memory = this.getMemoryUsage();
    const cpu = this.getCPUUsage();

    return {
      overall: overallStatus,
      checks,
      uptime: process.uptime() * 1000,
      memory,
      cpu,
      lastUpdated: Date.now(),
    };
  }

  private calculateOverallStatus(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;
    const totalChecks = checks.length;

    if (unhealthyCount > 0) {
      return 'unhealthy';
    } else if (degradedCount > totalChecks * 0.3) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  private getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      const used = usage.heapUsed;
      const total = usage.heapTotal;
      return {
        used,
        total,
        percentage: (used / total) * 100,
      };
    }
    return { used: 0, total: 0, percentage: 0 };
  }

  private getCPUUsage() {
    // This is a simplified CPU usage calculation
    // In a real application, you'd use a proper CPU monitoring library
    return {
      usage: Math.random() * 100, // Placeholder
    };
  }

  getHealthHistory(): HealthCheck[] {
    return [...this.healthHistory];
  }

  getAverageResponseTime(serviceName: string): number {
    const serviceChecks = this.healthHistory.filter(c => c.name === serviceName);
    if (serviceChecks.length === 0) return 0;
    
    const totalResponseTime = serviceChecks.reduce((sum, check) => sum + check.responseTime, 0);
    return totalResponseTime / serviceChecks.length;
  }

  getUptimePercentage(): number {
    if (this.healthHistory.length === 0) return 100;
    
    const totalChecks = this.healthHistory.length;
    const healthyChecks = this.healthHistory.filter(c => c.status === 'healthy').length;
    
    return (healthyChecks / totalChecks) * 100;
  }
}

// Error tracking and reporting
export class ErrorTracker {
  private errors: Array<{
    error: Error;
    timestamp: number;
    context: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> = [];
  private maxErrors = 1000;

  trackError(error: Error, context: Record<string, any> = {}, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    this.errors.push({
      error,
      timestamp: Date.now(),
      context,
      severity,
    });

    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${severity.toUpperCase()}]`, error, context);
    }

    // Send to error tracking service if available
    this.sendToErrorService(error, context, severity);
  }

  private sendToErrorService(error: Error, context: Record<string, any>, severity: string) {
    // This could integrate with Sentry, LogRocket, etc.
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: context,
        tags: { severity },
      });
    }
  }

  getErrors(severity?: 'low' | 'medium' | 'high' | 'critical'): Array<{
    error: Error;
    timestamp: number;
    context: Record<string, any>;
    severity: string;
  }> {
    if (severity) {
      return this.errors.filter(e => e.severity === severity);
    }
    return [...this.errors];
  }

  getErrorCount(severity?: 'low' | 'medium' | 'high' | 'critical'): number {
    return this.getErrors(severity).length;
  }

  clearErrors() {
    this.errors = [];
  }
}

// Global instances
export const healthMonitor = new HealthMonitor();
export const errorTracker = new ErrorTracker();

// Initialize global error handling
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorTracker.trackError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      message: event.message,
    }, 'high');
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.trackError(
      new Error(event.reason),
      { type: 'unhandledrejection' },
      'critical'
    );
  });
}