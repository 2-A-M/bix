import { renderHook, waitFor, act } from '@testing-library/react';
import { useTransactions } from '@/lib/hooks';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock console.warn to avoid noise in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

describe('useTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockFetch.mockClear();
  });

  it('should return initial state', async () => {
    const { result } = renderHook(() => useTransactions());
    
    expect(result.current.transactions).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.refresh).toBe('function');
    
    // Wait for the initial effect to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should load transactions successfully', async () => {
    const mockTransactions = [
      { id: '1', date: 1640995200000, amount: '1000', transaction_type: 'deposit', account: 'Test Account', state: 'CA', industry: 'Technology' },
      { id: '2', date: 1640995200000, amount: '500', transaction_type: 'withdraw', account: 'Test Account 2', state: 'NY', industry: 'Finance' }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTransactions,
      headers: new Map([['etag', 'test-etag']])
    });

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions).toEqual(mockTransactions);
    expect(result.current.error).toBe(null);
    expect(mockFetch).toHaveBeenCalledWith('/transactions.json', {
      cache: 'default',
    });
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it('should handle fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });

  it('should handle non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions).toEqual([]);
    expect(result.current.error).toBe('Failed to load transactions');
  });

  it('should use cached data when available and valid', async () => {
    const mockCachedData = {
      data: [{ id: '1', date: 1640995200000, amount: '1000', transaction_type: 'deposit', account: 'Test', state: 'CA', industry: 'Tech' }],
      timestamp: Date.now() - 1000, // 1 second ago (within 5 minute cache)
      etag: 'cached-etag'
    };

    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockCachedData));

    // Mock the background request that returns 304 (Not Modified)
    mockFetch.mockResolvedValueOnce({
      status: 304,
      ok: true,
    });

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions).toEqual(mockCachedData.data);
    expect(result.current.error).toBe(null);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('bix_transactions_cache');
  });

  it('should handle expired cache', async () => {
    const mockCachedData = {
      data: [{ id: '1', date: 1640995200000, amount: '1000', transaction_type: 'deposit', account: 'Test', state: 'CA', industry: 'Tech' }],
      timestamp: Date.now() - (6 * 60 * 1000), // 6 minutes ago (expired)
      etag: 'cached-etag'
    };

    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockCachedData));

    const mockTransactions = [
      { id: '2', date: 1640995200000, amount: '2000', transaction_type: 'deposit', account: 'New Account', state: 'NY', industry: 'Finance' }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTransactions,
      headers: new Map([['etag', 'new-etag']])
    });

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions).toEqual(mockTransactions);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('bix_transactions_cache');
  });

  it('should handle invalid cache data', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce('invalid-json');

    const mockTransactions = [
      { id: '1', date: 1640995200000, amount: '1000', transaction_type: 'deposit', account: 'Test', state: 'CA', industry: 'Tech' }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTransactions,
      headers: new Map([['etag', 'test-etag']])
    });

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions).toEqual(mockTransactions);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('bix_transactions_cache');
  });

  it('should handle localStorage errors gracefully', async () => {
    mockLocalStorage.getItem.mockImplementationOnce(() => {
      throw new Error('localStorage error');
    });

    const mockTransactions = [
      { id: '1', date: 1640995200000, amount: '1000', transaction_type: 'deposit', account: 'Test', state: 'CA', industry: 'Tech' }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTransactions,
      headers: new Map([['etag', 'test-etag']])
    });

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions).toEqual(mockTransactions);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('bix_transactions_cache');
  });

  it('should refresh data when refresh function is called', async () => {
    const initialTransactions = [
      { id: '1', date: 1640995200000, amount: '1000', transaction_type: 'deposit', account: 'Test', state: 'CA', industry: 'Tech' }
    ];

    const refreshedTransactions = [
      { id: '2', date: 1640995200000, amount: '2000', transaction_type: 'withdraw', account: 'New Test', state: 'NY', industry: 'Finance' }
    ];

    // Initial load
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => initialTransactions,
      headers: new Map([['etag', 'initial-etag']])
    });

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions).toEqual(initialTransactions);

    // Refresh
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => refreshedTransactions,
      headers: new Map([['etag', 'refreshed-etag']])
    });

    act(() => {
      result.current.refresh();
    });

    expect(result.current.isLoading).toBe(true);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('bix_transactions_cache');

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions).toEqual(refreshedTransactions);
    expect(mockFetch).toHaveBeenCalledWith('/transactions.json', {
      cache: 'reload',
    });
  });

  it('should handle refresh error', async () => {
    // Initial successful load
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: '1', date: 1640995200000, amount: '1000', transaction_type: 'deposit', account: 'Test', state: 'CA', industry: 'Tech' }],
      headers: new Map([['etag', 'initial-etag']])
    });

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Refresh with error
    mockFetch.mockRejectedValueOnce(new Error('Refresh failed'));

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Refresh failed');
  });

  it('should handle background update with 304 response', async () => {
    const mockCachedData = {
      data: [{ id: '1', date: 1640995200000, amount: '1000', transaction_type: 'deposit', account: 'Test', state: 'CA', industry: 'Tech' }],
      timestamp: Date.now() - 1000,
      etag: 'cached-etag'
    };

    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockCachedData));

    // Background request returns 304 (Not Modified)
    mockFetch.mockResolvedValueOnce({
      status: 304,
      ok: true,
    });

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.transactions).toEqual(mockCachedData.data);
    expect(mockFetch).toHaveBeenCalledWith('/transactions.json', {
      cache: 'no-cache',
      headers: { 'If-None-Match': 'cached-etag' }
    });
  });

  it('should handle background update with new data', async () => {
    const mockCachedData = {
      data: [{ id: '1', date: 1640995200000, amount: '1000', transaction_type: 'deposit', account: 'Test', state: 'CA', industry: 'Tech' }],
      timestamp: Date.now() - 1000,
      etag: 'cached-etag'
    };

    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockCachedData));

    const newTransactions = [
      { id: '2', date: 1640995200000, amount: '2000', transaction_type: 'withdraw', account: 'Updated', state: 'NY', industry: 'Finance' }
    ];

    // Background request returns new data
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => newTransactions,
      headers: new Map([['etag', 'new-etag']])
    });

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // The hook should show cached data initially, then update with new data
    // We need to wait for the background update to complete
    await waitFor(() => {
      expect(result.current.transactions).toEqual(newTransactions);
    }, { timeout: 3000 });
  });

  it('should handle background update error gracefully', async () => {
    const mockCachedData = {
      data: [{ id: '1', date: 1640995200000, amount: '1000', transaction_type: 'deposit', account: 'Test', state: 'CA', industry: 'Tech' }],
      timestamp: Date.now() - 1000,
      etag: 'cached-etag'
    };

    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockCachedData));

    // Background request fails
    mockFetch.mockRejectedValueOnce(new Error('Background update failed'));

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should still show cached data despite background error
    expect(result.current.transactions).toEqual(mockCachedData.data);
    expect(result.current.error).toBe(null);
  });
}); 