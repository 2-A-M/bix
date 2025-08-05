// Centralized cache utilities for the application
export const CACHE_KEYS = {
  TRANSACTIONS: 'bix_transactions_cache',
  FILTERS: 'bix_filters',
  AUTH_TOKEN: 'bix_auth_token',
} as const;

export const CACHE_DURATIONS = {
  TRANSACTIONS: 5 * 60 * 1000, // 5 minutes
  FILTERS: 24 * 60 * 60 * 1000, // 24 hours
  AUTH_TOKEN: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Generic interface for cached data
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
  version?: string;
}

// Utility function to check if cache is valid
export const isCacheValid = (entry: CacheEntry<any>, duration: number): boolean => {
  const now = Date.now();
  return (now - entry.timestamp) < duration;
};

// Function to clean expired caches
export const cleanExpiredCaches = (): void => {
  if (typeof window === 'undefined') return;

  Object.entries(CACHE_KEYS).forEach(([key, cacheKey]) => {
    try {
      // Skip AUTH_TOKEN as it has its own expiration logic
      if (cacheKey === CACHE_KEYS.AUTH_TOKEN) {
        return;
      }

      const cached = localStorage.getItem(cacheKey);
      if (!cached) return;

      const entry: CacheEntry<any> = JSON.parse(cached);
      const duration = CACHE_DURATIONS[key as keyof typeof CACHE_DURATIONS];
      
      if (!isCacheValid(entry, duration)) {
        localStorage.removeItem(cacheKey);
      }
    } catch (err) {
      console.warn(`Error checking cache ${cacheKey}:`, err);
      // Only remove non-auth tokens on error
      if (cacheKey !== CACHE_KEYS.AUTH_TOKEN) {
        localStorage.removeItem(cacheKey);
      }
    }
  });
};

// Function to clear all caches
export const clearAllCaches = (): void => {
  if (typeof window === 'undefined') return;

  Object.values(CACHE_KEYS).forEach(cacheKey => {
    localStorage.removeItem(cacheKey);
  });
};

// Function to get total cache size
export const getCacheSize = (): number => {
  if (typeof window === 'undefined') return 0;

  let totalSize = 0;
  Object.values(CACHE_KEYS).forEach(cacheKey => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      totalSize += new Blob([cached]).size;
    }
  });

  return totalSize;
};

// Hook for automatic cache cleanup on initialization
export const initializeCache = (): void => {
  if (typeof window === 'undefined') return;

  // Clean expired caches on initialization
  cleanExpiredCaches();

  // Set up periodic cleanup (every 30 minutes)
  setInterval(cleanExpiredCaches, 30 * 60 * 1000);
};