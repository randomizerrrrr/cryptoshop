const CACHE_NAME = 'cryptoshop-v1';
const STATIC_CACHE_NAME = 'cryptoshop-static-v1';
const API_CACHE_NAME = 'cryptoshop-api-v1';
const IMAGE_CACHE_NAME = 'cryptoshop-images-v1';

// Cache URLs
const STATIC_URLS = [
  '/',
  '/manifest.json',
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

const API_URLS = [
  '/api/health',
  '/api/health/detailed'
];

// Cache strategies
const cacheStrategies = {
  // Cache first, then network
  cacheFirst: async (request) => {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    try {
      const network = await fetch(request);
      if (network.ok) {
        cache.put(request, network.clone());
      }
      return network;
    } catch (error) {
      console.error('Cache first strategy failed:', error);
      throw error;
    }
  },

  // Network first, then cache
  networkFirst: async (request) => {
    try {
      const network = await fetch(request);
      if (network.ok) {
        const cache = await caches.open(API_CACHE_NAME);
        cache.put(request, network.clone());
      }
      return network;
    } catch (error) {
      const cache = await caches.open(API_CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      throw error;
    }
  },

  // Stale while revalidate
  staleWhileRevalidate: async (request) => {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cached = await cache.match(request);
    
    const networkFetch = fetch(request).then(network => {
      if (network.ok) {
        cache.put(request, network.clone());
      }
      return network;
    }).catch(() => cached);
    
    return cached || networkFetch;
  },

  // Cache only
  cacheOnly: async (request) => {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cached = await cache.match(request);
    if (!cached) {
      throw new Error('Resource not in cache');
    }
    return cached;
  }
};

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => cache.addAll(STATIC_URLS)),
      caches.open(API_CACHE_NAME).then(cache => cache.addAll(API_URLS))
    ])
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== API_CACHE_NAME && 
              cacheName !== IMAGE_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle different request types
  if (event.request.method === 'GET') {
    if (url.origin === self.location.origin) {
      // Static assets
      if (url.pathname.startsWith('/_next/static/') ||
          url.pathname.startsWith('/icons/') ||
          url.pathname.endsWith('.png') ||
          url.pathname.endsWith('.jpg') ||
          url.pathname.endsWith('.svg') ||
          url.pathname.endsWith('.css') ||
          url.pathname.endsWith('.js')) {
        
        if (url.pathname.match(/\.(png|jpg|jpeg|svg|webp)$/)) {
          // Images - cache first with long TTL
          event.respondWith(cacheStrategies.cacheFirst(event.request));
        } else {
          // Static assets - stale while revalidate
          event.respondWith(cacheStrategies.staleWhileRevalidate(event.request));
        }
        return;
      }
      
      // API routes
      if (url.pathname.startsWith('/api/')) {
        // Health check endpoints - cache first
        if (url.pathname.includes('/health')) {
          event.respondWith(cacheStrategies.cacheFirst(event.request));
        } else {
          // Other API endpoints - network first
          event.respondWith(cacheStrategies.networkFirst(event.request));
        }
        return;
      }
      
      // Page routes - network first, fallback to offline
      event.respondWith(
        cacheStrategies.networkFirst(event.request)
          .catch(() => caches.match('/offline'))
      );
      return;
    }
    
    // External requests - network only
    event.respondWith(fetch(event.request));
  } else {
    // POST/PUT/DELETE requests - network only
    event.respondWith(fetch(event.request));
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOfflineOrders());
  } else if (event.tag === 'sync-messages') {
    event.waitUntil(syncOfflineMessages());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data?.text() || 'New notification from CryptoShop',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: self.location.origin,
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('CryptoShop', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Handle offline orders sync
async function syncOfflineOrders() {
  try {
    const offlineOrders = await getOfflineData('offline-orders');
    
    for (const order of offlineOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${order.token}`
          },
          body: JSON.stringify(order.data)
        });
        
        if (response.ok) {
          await removeOfflineData('offline-orders', order.id);
        }
      } catch (error) {
        console.error('Failed to sync order:', order.id, error);
      }
    }
  } catch (error) {
    console.error('Error syncing offline orders:', error);
  }
}

// Handle offline messages sync
async function syncOfflineMessages() {
  try {
    const offlineMessages = await getOfflineData('offline-messages');
    
    for (const message of offlineMessages) {
      try {
        const response = await fetch(`/api/support/tickets/${message.ticketId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${message.token}`
          },
          body: JSON.stringify(message.data)
        });
        
        if (response.ok) {
          await removeOfflineData('offline-messages', message.id);
        }
      } catch (error) {
        console.error('Failed to sync message:', message.id, error);
      }
    }
  } catch (error) {
    console.error('Error syncing offline messages:', error);
  }
}

// Helper functions for offline storage
async function getOfflineData(key) {
  return new Promise((resolve) => {
    const request = indexedDB.open('CryptoShopOfflineDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction([key], 'readonly');
      const store = transaction.objectStore(key);
      const getAll = store.getAll();
      
      getAll.onsuccess = () => resolve(getAll.result);
      getAll.onerror = () => resolve([]);
    };
    
    request.onerror = () => resolve([]);
  });
}

async function removeOfflineData(key, id) {
  return new Promise((resolve) => {
    const request = indexedDB.open('CryptoShopOfflineDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction([key], 'readwrite');
      const store = transaction.objectStore(key);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve(true);
      deleteRequest.onerror = () => resolve(false);
    };
    
    request.onerror = () => resolve(false);
  });
}

// Initialize IndexedDB
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INIT_OFFLINE_DB') {
    initOfflineDB();
  }
});

function initOfflineDB() {
  const request = indexedDB.open('CryptoShopOfflineDB', 1);
  
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    
    // Create object stores for offline data
    if (!db.objectStoreNames.contains('offline-orders')) {
      db.createObjectStore('offline-orders', { keyPath: 'id' });
    }
    
    if (!db.objectStoreNames.contains('offline-messages')) {
      db.createObjectStore('offline-messages', { keyPath: 'id' });
    }
    
    if (!db.objectStoreNames.contains('offline-products')) {
      db.createObjectStore('offline-products', { keyPath: 'id' });
    }
  };
  
  request.onsuccess = () => {
    console.log('Offline database initialized');
  };
  
  request.onerror = (error) => {
    console.error('Failed to initialize offline database:', error);
  };
}