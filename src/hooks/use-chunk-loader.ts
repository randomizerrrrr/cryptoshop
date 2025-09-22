'use client';

import { useEffect, useState } from 'react';

interface ChunkLoaderOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
}

export function useChunkLoader(options: ChunkLoaderOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError = (error) => console.error('Chunk loading error:', error)
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadChunk = async (chunkLoader: () => Promise<any>): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await chunkLoader();
      setIsLoading(false);
      setRetryCount(0);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown chunk loading error');
      
      if (retryCount < maxRetries) {
        console.log(`Retrying chunk load (attempt ${retryCount + 1}/${maxRetries})...`);
        setRetryCount(prev => prev + 1);
        
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return loadChunk(chunkLoader);
      } else {
        setError(error);
        setIsLoading(false);
        onError(error);
        throw error;
      }
    }
  };

  const reset = () => {
    setError(null);
    setRetryCount(0);
    setIsLoading(false);
  };

  return {
    isLoading,
    error,
    retryCount,
    loadChunk,
    reset
  };
}

// Utility function to dynamically import components with error handling
export function dynamicImport<T>(
  importFn: () => Promise<T>,
  options: ChunkLoaderOptions = {}
): () => Promise<T> {
  return async () => {
    const { maxRetries = 3, retryDelay = 1000 } = options;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Import failed');
        
        if (attempt < maxRetries - 1) {
          const delay = retryDelay * Math.pow(2, attempt);
          console.log(`Import attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('All import attempts failed');
  };
}