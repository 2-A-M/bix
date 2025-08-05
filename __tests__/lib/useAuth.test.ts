import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from '@/lib/useAuth';
import * as auth from '@/lib/auth';

// Mock the auth module
jest.mock('@/lib/auth');

const mockAuth = auth as jest.Mocked<typeof auth>;

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return authenticated state when token exists', async () => {
    const mockToken = {
      token: 'test-token',
      expiresAt: Date.now() + 1000000,
      user: { id: '1', email: 'test@test.com', name: 'Test User' }
    };

    mockAuth.getStoredToken.mockReturnValue(mockToken);

    const { result } = renderHook(() => useAuth());

    // Fast-forward timers to trigger useEffect
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toEqual(mockToken);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return unauthenticated state when no token exists', async () => {
    mockAuth.getStoredToken.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    mockAuth.getStoredToken.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useAuth());

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it('should refresh auth state when refreshAuth is called', async () => {
    const mockToken = {
      token: 'test-token',
      expiresAt: Date.now() + 1000000,
      user: { id: '1', email: 'test@test.com', name: 'Test User' }
    };

    // Initially no token
    mockAuth.getStoredToken.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isAuthenticated).toBe(false);

    // Now mock token exists
    mockAuth.getStoredToken.mockReturnValue(mockToken);

    // Call refreshAuth
    act(() => {
      result.current.refreshAuth();
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toEqual(mockToken);
  });

  it('should handle refreshAuth errors gracefully', async () => {
    mockAuth.getStoredToken.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Mock error on refresh
    mockAuth.getStoredToken.mockImplementation(() => {
      throw new Error('Refresh error');
    });

    act(() => {
      result.current.refreshAuth();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBe(null);
  });

  it('should not run on server side', async () => {
    // Mock server-side environment
    const originalWindow = global.window;
    delete (global as any).window;

    mockAuth.getStoredToken.mockClear();

    const { result } = renderHook(() => useAuth());

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBe(null);
    expect(result.current.isLoading).toBe(false);

    // Restore window
    global.window = originalWindow;
  });

  it('should handle refreshAuth when window is undefined', async () => {
    mockAuth.getStoredToken.mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Mock server-side environment for refreshAuth
    const originalWindow = global.window;
    delete (global as any).window;

    // Call refreshAuth - should handle undefined window gracefully
    act(() => {
      result.current.refreshAuth();
    });

    // Should not crash
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBe(null);

    // Restore window
    global.window = originalWindow;
  });
});