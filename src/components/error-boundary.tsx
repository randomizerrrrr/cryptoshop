'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [state, setState] = useState<ErrorBoundaryState>({
    hasError: false,
  });

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by boundary:', event.error);
      
      // Check if it's a chunk loading error
      if (event.error?.message?.includes('ChunkLoadError') || 
          event.error?.message?.includes('Loading chunk')) {
        setState({
          hasError: true,
          error: event.error,
          errorId: 'chunk-load-error',
        });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Check if it's a chunk loading error
      if (event.reason?.message?.includes('ChunkLoadError') || 
          event.reason?.message?.includes('Loading chunk')) {
        setState({
          hasError: true,
          error: new Error(event.reason.message),
          errorId: 'chunk-load-error',
        });
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (state.hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (state.errorId === 'chunk-load-error') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Loading Error</CardTitle>
              <CardDescription>
                There was a problem loading the application. This usually happens when the browser cache is outdated or there's a temporary network issue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Page
                </Button>
                <Button 
                  onClick={() => {
                    // Clear browser cache and reload
                    if ('caches' in window) {
                      caches.keys().then(names => {
                        names.forEach(name => {
                          caches.delete(name);
                        });
                      });
                    }
                    window.location.reload();
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  Clear Cache & Reload
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="ghost" 
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Button>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                <p>If the problem persists, try:</p>
                <ul className="mt-1 space-y-1">
                  <li>• Clearing your browser cache completely</li>
                  <li>• Disabling browser extensions temporarily</li>
                  <li>• Trying a different browser</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Something went wrong</CardTitle>
            <CardDescription>
              An unexpected error occurred. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline" 
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer">Error details</summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                  {state.error?.stack || state.error?.message}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook for handling chunk loading errors
export function useChunkErrorHandler() {
  const [retryCount, setRetryCount] = useState(0);

  const handleChunkError = (error: Error) => {
    console.error('Chunk loading error:', error);
    
    // Retry up to 3 times
    if (retryCount < 3) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        window.location.reload();
      }, 1000 * (retryCount + 1)); // Exponential backoff
    } else {
      // After 3 retries, redirect to a safe page
      window.location.href = '/';
    }
  };

  return { handleChunkError, retryCount };
}