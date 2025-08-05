'use client';

import { useState, useEffect } from 'react';
import { getStoredToken } from './auth';
import { AuthToken } from './types';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<AuthToken | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);

  // First useEffect: Handle hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Second useEffect: Handle authentication after hydration
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const checkAuth = () => {
      try {
        const storedToken = getStoredToken();
        const isAuth = storedToken !== null;
        
        setToken(storedToken);
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error('useAuth: Error checking auth:', error);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure everything is ready
    const timer = setTimeout(checkAuth, 50);

    return () => clearTimeout(timer);
  }, [hydrated]);

  const refreshAuth = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const storedToken = getStoredToken();
      const isAuth = storedToken !== null;
      
      setToken(storedToken);
      setIsAuthenticated(isAuth);
    } catch (error) {
      setToken(null);
      setIsAuthenticated(false);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    token,
    refreshAuth
  };
}