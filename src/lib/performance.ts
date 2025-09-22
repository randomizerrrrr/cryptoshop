// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  pageLoad: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMetrics();
    }
  }

  private initializeMetrics() {
    // Page load timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.pageLoad = navigation.loadEventEnd - navigation.loadEventStart;
      }
    });

    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics.firstContentfulPaint = fcpEntry.startTime;
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcpEntry = entries[entries.length - 1];
        if (lcpEntry) {
          this.metrics.largestContentfulPaint = lcpEntry.startTime;
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    }

    // Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let clsValue = 0;
        entries.forEach(entry => {
          if (entry instanceof LayoutShift) {
            clsValue += entry.value;
          }
        });
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }

    // First Input Delay
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fidEntry = entries[0];
        if (fidEntry) {
          this.metrics.firstInputDelay = fidEntry.processingStart - fidEntry.startTime;
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    }
  }

  getMetrics(): PerformanceMetrics {
    return {
      pageLoad: this.metrics.pageLoad || 0,
      firstContentfulPaint: this.metrics.firstContentfulPaint || 0,
      largestContentfulPaint: this.metrics.largestContentfulPaint || 0,
      cumulativeLayoutShift: this.metrics.cumulativeLayoutShift || 0,
      firstInputDelay: this.metrics.firstInputDelay || 0,
      timeToInteractive: this.calculateTimeToInteractive(),
    };
  }

  private calculateTimeToInteractive(): number {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const domInteractive = navigation.domInteractive - navigation.fetchStart;
      const firstContentfulPaint = this.metrics.firstContentfulPaint || 0;
      return Math.max(domInteractive, firstContentfulPaint);
    }
    return 0;
  }

  logMetrics() {
    const metrics = this.getMetrics();
    console.log('Performance Metrics:', {
      pageLoad: `${metrics.pageLoad.toFixed(2)}ms`,
      fcp: `${metrics.firstContentfulPaint.toFixed(2)}ms`,
      lcp: `${metrics.largestContentfulPaint.toFixed(2)}ms`,
      cls: metrics.cumulativeLayoutShift.toFixed(3),
      fid: `${metrics.firstInputDelay.toFixed(2)}ms`,
      tti: `${metrics.timeToInteractive.toFixed(2)}ms`,
    });

    // Send metrics to analytics service if available
    this.sendToAnalytics(metrics);
  }

  private sendToAnalytics(metrics: PerformanceMetrics) {
    // This could be integrated with Google Analytics, New Relic, etc.
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metrics', {
        custom_parameters: metrics,
      });
    }
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Resource loading optimization
export class ResourceOptimizer {
  private preloadedResources = new Set<string>();
  private prefetchedResources = new Set<string>();

  preloadResource(url: string, as: string = 'script') {
    if (this.preloadedResources.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    document.head.appendChild(link);
    this.preloadedResources.add(url);
  }

  prefetchResource(url: string) {
    if (this.prefetchedResources.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
    this.prefetchedResources.add(url);
  }

  preloadCriticalResources() {
    // Preload critical chunks
    const criticalChunks = [
      '/_next/static/chunks/main-app.js',
      '/_next/static/chunks/common.js',
      '/_next/static/chunks/vendors.js',
    ];

    criticalChunks.forEach(chunk => {
      this.preloadResource(chunk, 'script');
    });
  }

  prefetchLikelyRoutes() {
    // Prefetch likely routes based on user behavior
    const likelyRoutes = [
      '/market',
      '/cart',
      '/wallet',
      '/admin',
    ];

    likelyRoutes.forEach(route => {
      this.prefetchResource(route);
    });
  }
}

// Image optimization utilities
export class ImageOptimizer {
  private intersectionObserver: IntersectionObserver | null = null;
  private loadedImages = new WeakSet<HTMLImageElement>();

  constructor() {
    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px',
          threshold: 0.1,
        }
      );
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        this.loadImage(img);
        this.intersectionObserver?.unobserve(img);
      }
    });
  }

  private loadImage(img: HTMLImageElement) {
    if (this.loadedImages.has(img)) return;

    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.onload = () => {
        img.classList.add('loaded');
        this.loadedImages.add(img);
      };
      img.onerror = () => {
        img.classList.add('error');
      };
    }
  }

  observe(img: HTMLImageElement) {
    if (this.intersectionObserver && img.dataset.src) {
      this.intersectionObserver.observe(img);
    }
  }

  disconnect() {
    this.intersectionObserver?.disconnect();
  }
}

// Initialize performance monitoring
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  const monitor = new PerformanceMonitor();
  const optimizer = new ResourceOptimizer();
  const imageOptimizer = new ImageOptimizer();

  // Initialize resource optimization
  if (document.readyState === 'complete') {
    optimizer.preloadCriticalResources();
    optimizer.prefetchLikelyRoutes();
  } else {
    window.addEventListener('load', () => {
      optimizer.preloadCriticalResources();
      optimizer.prefetchLikelyRoutes();
    });
  }

  // Log metrics when page is fully loaded
  window.addEventListener('load', () => {
    setTimeout(() => {
      monitor.logMetrics();
    }, 1000);
  });

  // Setup image lazy loading
  document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      imageOptimizer.observe(img as HTMLImageElement);
    });
  });

  return {
    monitor,
    optimizer,
    imageOptimizer,
  };
}

// Alias for backward compatibility
export const initializePerformanceMonitor = initializePerformanceMonitoring;

// Utility functions
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}