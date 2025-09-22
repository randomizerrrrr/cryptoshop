'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TouchSwipeProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  className?: string;
}

export function TouchSwipe({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className
}: TouchSwipeProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = threshold;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      if (distanceX > minSwipeDistance && onSwipeLeft) {
        onSwipeLeft();
      } else if (distanceX < -minSwipeDistance && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      if (distanceY > minSwipeDistance && onSwipeUp) {
        onSwipeUp();
      } else if (distanceY < -minSwipeDistance && onSwipeDown) {
        onSwipeDown();
      }
    }
  };

  return (
    <div
      className={cn("touch-manipulation", className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  );
}

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  const onTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY === 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    
    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
      e.preventDefault();
    }
  };

  const onTouchEnd = async () => {
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setStartY(0);
  };

  const refreshOpacity = Math.min(pullDistance / threshold, 1);
  const refreshScale = 0.5 + (refreshOpacity * 0.5);

  return (
    <div className={cn("relative", className)}>
      <div
        className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none transition-all duration-200"
        style={{
          height: pullDistance,
          opacity: refreshOpacity,
          transform: `scale(${refreshScale})`
        }}
      >
        <div className="flex flex-col items-center space-y-2">
          <div className={cn(
            "w-8 h-8 border-2 border-primary rounded-full",
            isRefreshing && "animate-spin"
          )}>
            <div className="w-full h-full border-t-transparent border-r-transparent rounded-full animate-spin"></div>
          </div>
          <span className="text-sm text-muted-foreground">
            {isRefreshing ? "Refreshing..." : "Pull to refresh"}
          </span>
        </div>
      </div>
      
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="transition-transform duration-200"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        {children}
      </div>
    </div>
  );
}

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  longPressDelay?: number;
}

export function MobileCard({
  children,
  className,
  onPress,
  onLongPress,
  longPressDelay = 500
}: MobileCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    setIsPressed(true);
    
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress();
        setIsPressed(false);
      }, longPressDelay);
      setPressTimer(timer);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    
    if (onPress) {
      onPress();
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 active:scale-[0.98] active:bg-accent/50",
        isPressed && "scale-[0.98] bg-accent/50",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
}

interface MobileButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  onPress?: () => void;
  onLongPress?: () => void;
  hapticFeedback?: boolean;
}

export function MobileButton({
  children,
  className,
  variant = "default",
  size = "default",
  onPress,
  onLongPress,
  hapticFeedback = true
}: MobileButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(type === 'light' ? 10 : type === 'medium' ? 20 : 30);
    }
  };

  const handleTouchStart = () => {
    setIsPressed(true);
    triggerHaptic('light');
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (onPress) {
      triggerHaptic('medium');
      onPress();
    }
  };

  return (
    <Button
      className={cn(
        "transition-all duration-150 active:scale-[0.95]",
        isPressed && "scale-[0.95]",
        className
      )}
      variant={variant}
      size={size}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => setIsPressed(false)}
    >
      {children}
    </Button>
  );
}

interface SwipeableActionsProps {
  children: React.ReactNode;
  leftActions?: Array<{
    icon: React.ReactNode;
    label: string;
    color: string;
    action: () => void;
  }>;
  rightActions?: Array<{
    icon: React.ReactNode;
    label: string;
    color: string;
    action: () => void;
  }>;
  className?: string;
}

export function SwipeableActions({
  children,
  leftActions = [],
  rightActions = [],
  className
}: SwipeableActionsProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const maxSwipe = 120;

  const onTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    
    // Limit swipe distance
    const newTranslateX = Math.max(-maxSwipe, Math.min(maxSwipe, diffX));
    setTranslateX(newTranslateX);
  };

  const onTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Determine if swipe was far enough to trigger action
    if (Math.abs(translateX) > maxSwipe * 0.6) {
      if (translateX > 0 && leftActions.length > 0) {
        leftActions[0].action();
      } else if (translateX < 0 && rightActions.length > 0) {
        rightActions[0].action();
      }
    }
    
    // Reset position
    setTranslateX(0);
  };

  const getActionOpacity = (side: 'left' | 'right') => {
    const opacity = Math.abs(translateX) / maxSwipe;
    return side === 'left' ? 
      (translateX > 0 ? opacity : 0) : 
      (translateX < 0 ? opacity : 0);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Left Actions */}
      <div className="absolute inset-y-0 left-0 flex items-center space-x-2 pl-4 pointer-events-none">
        {leftActions.map((action, index) => (
          <div
            key={index}
            className="flex flex-col items-center space-y-1 transition-opacity duration-200"
            style={{ opacity: getActionOpacity('left') }}
          >
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", action.color)}>
              {action.icon}
            </div>
            <span className="text-xs text-muted-foreground">{action.label}</span>
          </div>
        ))}
      </div>

      {/* Right Actions */}
      <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-4 pointer-events-none">
        {rightActions.map((action, index) => (
          <div
            key={index}
            className="flex flex-col items-center space-y-1 transition-opacity duration-200"
            style={{ opacity: getActionOpacity('right') }}
          >
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", action.color)}>
              {action.icon}
            </div>
            <span className="text-xs text-muted-foreground">{action.label}</span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div
        className="transition-transform duration-200 will-change-transform"
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// Mobile-specific utilities
export const mobileUtils = {
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  isiOS: () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  isAndroid: () => {
    return /Android/.test(navigator.userAgent);
  },

  getViewportHeight: () => {
    return window.visualViewport?.height || window.innerHeight;
  },

  getViewportWidth: () => {
    return window.visualViewport?.width || window.innerWidth;
  },

  preventZoom: () => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    document.head.appendChild(meta);
  },

  enableHapticFeedback: () => {
    return 'vibrate' in navigator;
  },

  triggerHaptic: (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if ('vibrate' in navigator) {
      const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 30;
      navigator.vibrate(duration);
    }
  }
};

// Hook for mobile detection
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(mobileUtils.isMobile());
  }, []);

  return { isMobile };
}

// Hook for online/offline status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  return { isOnline };
}

// Hook for viewport dimensions
export function useViewport() {
  const [dimensions, setDimensions] = useState({
    width: mobileUtils.getViewportWidth(),
    height: mobileUtils.getViewportHeight()
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: mobileUtils.getViewportWidth(),
        height: mobileUtils.getViewportHeight()
      });
    };

    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);

  return dimensions;
}