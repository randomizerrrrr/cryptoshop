// Global chunk error handler
(function() {
  'use strict';
  
  // Track chunk loading attempts
  const chunkLoadAttempts = new Map();
  const MAX_RETRIES = 3;
  
  // Override webpack's chunk loading function
  if (typeof __webpack_require__ !== 'undefined') {
    const originalEnsure = __webpack_require__.f.ensure;
    
    if (originalEnsure) {
      __webpack_require__.f.ensure = function(chunkIds, callback, errback) {
        const chunkId = Array.isArray(chunkIds) ? chunkIds.join(',') : chunkIds;
        
        // Track attempts
        if (!chunkLoadAttempts.has(chunkId)) {
          chunkLoadAttempts.set(chunkId, 0);
        }
        
        const attempts = chunkLoadAttempts.get(chunkId);
        
        // Custom error handler
        const customErrback = function(error) {
          console.error(`Chunk load failed for ${chunkId} (attempt ${attempts + 1}):`, error);
          
          if (attempts < MAX_RETRIES) {
            chunkLoadAttempts.set(chunkId, attempts + 1);
            
            // Retry with exponential backoff
            const delay = Math.pow(2, attempts) * 1000;
            console.log(`Retrying chunk ${chunkId} in ${delay}ms...`);
            
            setTimeout(() => {
              __webpack_require__.f.ensure(chunkIds, callback, customErrback);
            }, delay);
          } else {
            console.error(`Max retries reached for chunk ${chunkId}`);
            
            // Show user-friendly error
            showChunkLoadError();
            
            // Call original errback if exists
            if (errback) {
              errback(error);
            }
          }
        };
        
        return originalEnsure.call(this, chunkIds, callback, customErrback);
      };
    }
  }
  
  // Handle unhandled chunk loading errors
  window.addEventListener('error', function(event) {
    if (event.message && (
        event.message.includes('ChunkLoadError') || 
        event.message.includes('Loading chunk') ||
        event.message.includes('Failed to fetch dynamically imported module')
    )) {
      console.error('Chunk loading error detected:', event.message);
      showChunkLoadError();
      event.preventDefault();
    }
  });
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && (
        event.reason.message?.includes('ChunkLoadError') || 
        event.reason.message?.includes('Loading chunk') ||
        event.reason.message?.includes('Failed to fetch dynamically imported module')
    )) {
      console.error('Chunk loading promise rejection:', event.reason);
      showChunkLoadError();
      event.preventDefault();
    }
  });
  
  // Show user-friendly error message
  function showChunkLoadError() {
    // Remove existing error overlay if any
    const existingOverlay = document.getElementById('chunk-error-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    
    // Create error overlay
    const overlay = document.createElement('div');
    overlay.id = 'chunk-error-overlay';
    overlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 0.5rem;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        ">
          <div style="
            width: 48px;
            height: 48px;
            background: #fbbf24;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 style="margin: 0 0 1rem 0; color: #1f2937; font-size: 1.25rem; font-weight: 600;">
            Loading Error
          </h3>
          <p style="margin: 0 0 1.5rem 0; color: #6b7280; font-size: 0.875rem; line-height: 1.5;">
            There was a problem loading the application. This usually happens when the browser cache is outdated.
          </p>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <button onclick="window.location.reload()" style="
              background: #3b82f6;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.375rem;
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.2s;
            " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
              Reload Page
            </button>
            <button onclick="clearCacheAndReload()" style="
              background: transparent;
              color: #3b82f6;
              border: 1px solid #d1d5db;
              padding: 0.75rem 1.5rem;
              border-radius: 0.375rem;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            " onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='transparent'">
              Clear Cache & Reload
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }
  
  // Function to clear cache and reload
  window.clearCacheAndReload = function() {
    // Clear service worker cache
    if ('caches' in window) {
      caches.keys().then(function(names) {
        return Promise.all(names.map(function(name) {
          return caches.delete(name);
        }));
      }).then(function() {
        console.log('Cache cleared successfully');
        window.location.reload(true);
      });
    } else {
      window.location.reload(true);
    }
  };
  
  // Clear cache on page load if there was a previous error
  if (sessionStorage.getItem('chunkLoadError')) {
    sessionStorage.removeItem('chunkLoadError');
    if ('caches' in window) {
      caches.keys().then(function(names) {
        return Promise.all(names.map(function(name) {
          return caches.delete(name);
        }));
      });
    }
  }
  
  console.log('Chunk error handler initialized');
})();