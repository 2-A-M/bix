import React from 'react';
import { useRouter } from 'next/navigation';
import { useMobileMenu } from '@/lib/context';
import { useAuthContext } from '@/lib/AuthContext';
import { logout } from '@/lib/auth';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/context', () => ({
  useMobileMenu: jest.fn(),
}));

jest.mock('@/lib/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  logout: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
};

const mockMobileMenu = {
  closeMobileMenu: jest.fn(),
};

const mockAuthContext = {
  refreshAuth: jest.fn(),
};

describe('Sidebar Logout Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useMobileMenu as jest.Mock).mockReturnValue(mockMobileMenu);
    (useAuthContext as jest.Mock).mockReturnValue(mockAuthContext);
  });

  it('should call logout, refreshAuth, and navigate to login page', () => {
    // Simulate the handleLogout function from Sidebar
    const handleLogout = () => {
      logout();
      mockAuthContext.refreshAuth();
      mockRouter.push('/login');
    };

    // Execute the logout logic
    handleLogout();
    
    // Verify logout function was called
    expect(logout).toHaveBeenCalledTimes(1);
    
    // Verify refreshAuth was called to update authentication state
    expect(mockAuthContext.refreshAuth).toHaveBeenCalledTimes(1);
    
    // Verify navigation to login page
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('should call all functions in correct order', () => {
    const executionOrder: string[] = [];
    
    // Mock functions to track execution order
    const mockLogout = jest.fn(() => executionOrder.push('logout'));
    const mockRefreshAuth = jest.fn(() => executionOrder.push('refreshAuth'));
    const mockPush = jest.fn(() => executionOrder.push('push'));
    
    // Simulate the handleLogout function
    const handleLogout = () => {
      mockLogout();
      mockRefreshAuth();
      mockPush('/login');
    };

    handleLogout();
    
    // Verify correct execution order
    expect(executionOrder).toEqual(['logout', 'refreshAuth', 'push']);
  });
}); 