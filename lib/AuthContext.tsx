'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { AuthToken } from './types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: AuthToken | null;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authState = useAuth();

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}