'use client';

import { useEffect, useState } from 'react';

export function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);
    
    // Add classes to body based on online status
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (online) {
        document.body.classList.add('online');
        document.body.classList.remove('offline');
      } else {
        document.body.classList.add('offline');
        document.body.classList.remove('online');
      }
    };

    // Initialize
    updateOnlineStatus();

    // Add event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Cleanup
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return null; // This component doesn't render anything
}