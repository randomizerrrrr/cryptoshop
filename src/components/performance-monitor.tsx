'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Zap, 
  Timer, 
  TrendingUp, 
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { initializePerformanceMonitoring, PerformanceMetrics } from '@/lib/performance';

interface PerformanceData extends PerformanceMetrics {
  status: 'good' | 'warning' | 'poor';
  score: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [monitor, setMonitor] = useState<any>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const perfMonitor = initializePerformanceMonitoring();
      setMonitor(perfMonitor);
      
      // Update metrics every 5 seconds
      const interval = setInterval(() => {
        if (perfMonitor.monitor) {
          const rawMetrics = perfMonitor.monitor.getMetrics();
          const processedMetrics = processMetrics(rawMetrics);
          setMetrics(processedMetrics);
        }
      }, 5000);

      return () => {
        clearInterval(interval);
        if (perfMonitor.monitor) {
          perfMonitor.monitor.disconnect();
        }
      };
    }
  }, []);

  const processMetrics = (raw: PerformanceMetrics): PerformanceData => {
    // Calculate performance score (0-100)
    let score = 100;
    
    // Deduct points for poor metrics
    if (raw.pageLoad > 3000) score -= 20;
    else if (raw.pageLoad > 1500) score -= 10;
    
    if (raw.firstContentfulPaint > 2000) score -= 15;
    else if (raw.firstContentfulPaint > 1000) score -= 8;
    
    if (raw.largestContentfulPaint > 4000) score -= 20;
    else if (raw.largestContentfulPaint > 2500) score -= 10;
    
    if (raw.cumulativeLayoutShift > 0.25) score -= 15;
    else if (raw.cumulativeLayoutShift > 0.1) score -= 8;
    
    if (raw.firstInputDelay > 300) score -= 15;
    else if (raw.firstInputDelay > 100) score -= 8;
    
    if (raw.timeToInteractive > 5000) score -= 20;
    else if (raw.timeToInteractive > 3000) score -= 10;
    
    score = Math.max(0, Math.min(100, score));
    
    // Determine status
    let status: 'good' | 'warning' | 'poor' = 'good';
    if (score < 70) status = 'poor';
    else if (score < 85) status = 'warning';
    
    return {
      ...raw,
      status,
      score,
    };
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'poor': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatMetric = (value: number, unit: string = 'ms') => {
    if (unit === 'ms') {
      return `${value.toFixed(0)}ms`;
    }
    return value.toFixed(3);
  };

  const refreshMetrics = () => {
    if (monitor?.monitor) {
      const rawMetrics = monitor.monitor.getMetrics();
      const processedMetrics = processMetrics(rawMetrics);
      setMetrics(processedMetrics);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2"
      >
        <Activity className="h-4 w-4 mr-2" />
        Performance
      </Button>
      
      {isVisible && metrics && (
        <Card className="w-80 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Performance Metrics</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={
                    metrics.status === 'good' ? 'default' : 
                    metrics.status === 'warning' ? 'secondary' : 'destructive'
                  }
                >
                  {getStatusIcon(metrics.status)}
                  <span className="ml-1">{metrics.score}%</span>
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshMetrics}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-xs">
              Real-time performance monitoring
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Timer className="h-3 w-3 mr-1" />
                  Page Load
                </div>
                <div className="text-sm font-medium">
                  {formatMetric(metrics.pageLoad)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Zap className="h-3 w-3 mr-1" />
                  FCP
                </div>
                <div className="text-sm font-medium">
                  {formatMetric(metrics.firstContentfulPaint)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  LCP
                </div>
                <div className="text-sm font-medium">
                  {formatMetric(metrics.largestContentfulPaint)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Activity className="h-3 w-3 mr-1" />
                  CLS
                </div>
                <div className="text-sm font-medium">
                  {formatMetric(metrics.cumulativeLayoutShift, '')}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Timer className="h-3 w-3 mr-1" />
                  FID
                </div>
                <div className="text-sm font-medium">
                  {formatMetric(metrics.firstInputDelay)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Zap className="h-3 w-3 mr-1" />
                  TTI
                </div>
                <div className="text-sm font-medium">
                  {formatMetric(metrics.timeToInteractive)}
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center justify-between mb-1">
                  <span>Performance Status</span>
                  <span className={`font-medium ${
                    metrics.status === 'good' ? 'text-green-600' :
                    metrics.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metrics.status.toUpperCase()}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      metrics.status === 'good' ? 'bg-green-500' :
                      metrics.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metrics.score}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}