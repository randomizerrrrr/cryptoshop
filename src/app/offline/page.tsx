'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  WifiOff, 
  RefreshCw, 
  ShoppingCart, 
  Bitcoin, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { FadeIn } from '@/components/ui/motion-wrapper';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed'>('idle');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    
    try {
      // Trigger background sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-orders');
        await registration.sync.register('sync-messages');
      }
      
      // Simulate sync completion
      setTimeout(() => {
        setSyncStatus('completed');
        setTimeout(() => setSyncStatus('idle'), 2000);
      }, 2000);
    } catch (error) {
      console.error('Failed to trigger sync:', error);
      setSyncStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <FadeIn>
        <div className="max-w-md w-full space-y-6">
          {/* Offline Status Card */}
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <WifiOff className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">You're Offline</CardTitle>
              <CardDescription>
                {isOnline 
                  ? "Connection restored! You can now sync your data."
                  : "No internet connection. Some features may be limited."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Badge variant={isOnline ? "default" : "secondary"}>
                  {isOnline ? "Online" : "Offline"}
                </Badge>
                {syncStatus === 'syncing' && (
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    Syncing...
                  </Badge>
                )}
                {syncStatus === 'completed' && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Synced
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleRefresh} 
                  className="w-full"
                  disabled={!isOnline}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                
                {isOnline && (
                  <Button 
                    onClick={handleSync} 
                    variant="outline" 
                    className="w-full"
                    disabled={syncStatus === 'syncing'}
                  >
                    {syncStatus === 'syncing' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Syncing Data...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Offline Data
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Offline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>View cached products</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Browse marketplace</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Access saved wallet info</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>View order history</span>
              </div>
            </CardContent>
          </Card>

          {/* Limited Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Limited Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span>New orders require internet</span>
              </div>
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span>Bitcoin payments offline</span>
              </div>
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span>Real-time updates paused</span>
              </div>
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span>Support messages delayed</span>
              </div>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-center">
                <Bitcoin className="w-5 h-5 mr-2" />
                CryptoShop
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Anonymous Bitcoin Marketplace
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <ShoppingCart className="w-3 h-3" />
                  <span>PWA Ready</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Bitcoin className="w-3 h-3" />
                  <span>Bitcoin Powered</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </div>
  );
}