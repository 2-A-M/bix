import { AuthToken, User } from './types';
import { CACHE_KEYS } from './cache';

const AUTH_TOKEN_KEY = CACHE_KEYS.AUTH_TOKEN;

// Valid credentials for demo
export const DEMO_CREDENTIALS = {
  email: 'admin@bix.tech',
  password: 'bix2025'
};

const FAKE_USER: User = {
  id: '1',
  email: DEMO_CREDENTIALS.email,
  name: 'Admin User'
};

// Fake authentication functions
export const fakeLogin = async (email: string, password: string): Promise<AuthToken> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Specific credential validation
  if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
    const token: AuthToken = {
      token: `fake_token_${Date.now()}`,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      user: FAKE_USER
    };
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(token));
    }
    
    return token;
  }
  
  throw new Error('Invalid credentials. Use the correct credentials to access the system.');
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

export const getStoredToken = (): AuthToken | null => {
  // Ensure we're on client side
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    // Additional check for localStorage availability
    if (!window.localStorage) {
      console.warn('localStorage not available');
      return null;
    }

    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!storedToken) return null;
    
    const token: AuthToken = JSON.parse(storedToken);
    
    // Validate token structure
    if (!token || !token.token || !token.expiresAt || !token.user) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return null;
    }
    
    // Check if token has expired
    if (token.expiresAt < Date.now()) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Error reading stored token:', error);
    // Clean up corrupted token
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (cleanupError) {
      console.error('Error cleaning up corrupted token:', cleanupError);
    }
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    
    const token = getStoredToken();
    return token !== null;
  } catch (error) {
    console.error('Authentication check error:', error);
    return false;
  }
};