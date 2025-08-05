'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction } from './types';

const CACHE_KEY = 'bix_transactions_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CachedData {
  data: Transaction[];
  timestamp: number;
  etag?: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to check local cache
  const getCachedData = useCallback((): CachedData | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const cachedData: CachedData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - cachedData.timestamp < CACHE_DURATION) {
        return cachedData;
      }
      
      // Cache expired, remove it
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (err) {
      console.warn('Error reading cache:', err);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, []);

  // Function to save to cache
  const setCachedData = useCallback((data: Transaction[], etag?: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheData: CachedData = {
        data,
        timestamp: Date.now(),
        etag
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.warn('Error saving cache:', err);
    }
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        
        // First, try to use cached data
        const cachedData = getCachedData();
        if (cachedData) {
          setTransactions(cachedData.data);
          setError(null);
          setIsLoading(false);
          
          // Make background request to check for updates
          try {
            const headers: HeadersInit = {};
            if (cachedData.etag) {
              headers['If-None-Match'] = cachedData.etag;
            }
            
            const response = await fetch('/transactions.json', {
              cache: 'no-cache', // Force server verification
              headers
            });
            
            // If received 304 (Not Modified), data is up to date
            if (response.status === 304) {
              // Update cache timestamp
              setCachedData(cachedData.data, cachedData.etag);
              return;
            }
            
            if (response.ok) {
              const newData: Transaction[] = await response.json();
              const etag = response.headers.get('etag');
              
              setTransactions(newData);
              setCachedData(newData, etag || undefined);
            }
          } catch (bgErr) {
            // Background request error doesn't affect UI
            console.warn('Error in background update:', bgErr);
          }
          
          return;
        }
        
        // No cache, make normal request
        const response = await fetch('/transactions.json', {
          cache: 'default', // Use browser HTTP cache
        });
        
        if (!response.ok) {
          throw new Error('Failed to load transactions');
        }
        
        const data: Transaction[] = await response.json();
        const etag = response.headers.get('etag');
        
        setTransactions(data);
        setCachedData(data, etag || undefined);
        setError(null);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [getCachedData, setCachedData]);

  // Function to force reload
  const refresh = useCallback(async () => {
    localStorage.removeItem(CACHE_KEY);
    setIsLoading(true);
    
    try {
      const response = await fetch('/transactions.json', {
        cache: 'reload', // Force complete reload
      });
      
      if (!response.ok) {
        throw new Error('Failed to load transactions');
      }
      
      const data: Transaction[] = await response.json();
      const etag = response.headers.get('etag');
      
      setTransactions(data);
      setCachedData(data, etag || undefined);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [setCachedData]);

  return { transactions, isLoading, error, refresh };
};