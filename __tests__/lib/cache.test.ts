// Unit tests for cache system
import { 
  isCacheValid, 
  cleanExpiredCaches, 
  clearAllCaches, 
  getCacheSize,
  CACHE_KEYS,
  CACHE_DURATIONS,
  CacheEntry 
} from '@/lib/cache'

// Mock do localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  key: jest.fn(),
  length: 0,
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// Console mock for cleaner tests
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
}

describe('Cache System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
    consoleSpy.log.mockClear()
    consoleSpy.warn.mockClear()
  })

  afterAll(() => {
    consoleSpy.log.mockRestore()
    consoleSpy.warn.mockRestore()
  })

  describe('isCacheValid', () => {
    it('should return true for valid cache', () => {
      const validEntry: CacheEntry<any> = {
        data: {},
        timestamp: Date.now() - 1000, // 1 segundo atrás
      }
      
      const isValid = isCacheValid(validEntry, 5000) // 5 seconds duration
      expect(isValid).toBe(true)
    })

    it('should return false for expired cache', () => {
      const expiredEntry: CacheEntry<any> = {
        data: {},
        timestamp: Date.now() - 10000, // 10 segundos atrás
      }
      
      const isValid = isCacheValid(expiredEntry, 5000) // 5 seconds duration
      expect(isValid).toBe(false)
    })

    it('should return false for cache at exact limit', () => {
      const exactEntry: CacheEntry<any> = {
        data: {},
        timestamp: Date.now() - 5000, // Exatamente 5 segundos atrás
      }
      
      const isValid = isCacheValid(exactEntry, 5000)
      expect(isValid).toBe(false)
    })
  })

  describe('cleanExpiredCaches', () => {
    it('should remove expired caches', () => {
      // Setup: expired cache
      const expiredCache = JSON.stringify({
        data: {},
        timestamp: Date.now() - CACHE_DURATIONS.TRANSACTIONS - 1000
      })
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === CACHE_KEYS.TRANSACTIONS) return expiredCache
        return null
      })

      cleanExpiredCaches()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(CACHE_KEYS.TRANSACTIONS)
    })

    it('should keep valid caches', () => {
      // Setup: valid cache
      const validCache = JSON.stringify({
        data: {},
        timestamp: Date.now() - 1000 // Only 1 second ago
      })
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === CACHE_KEYS.TRANSACTIONS) return validCache
        return null
      })

      cleanExpiredCaches()
      
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
    })

    it('should handle invalid JSON', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === CACHE_KEYS.TRANSACTIONS) return 'invalid-json'
        return null
      })

      cleanExpiredCaches()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(CACHE_KEYS.TRANSACTIONS)
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('Error checking cache'),
        expect.any(Error)
      )
    })

    it('should process all cache types', () => {
      cleanExpiredCaches()
      
      // Check if it tried to access cache types (AUTH_TOKEN is now skipped)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(CACHE_KEYS.TRANSACTIONS)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(CACHE_KEYS.FILTERS)
      // AUTH_TOKEN is now skipped in cleanExpiredCaches
    })
  })

  describe('clearAllCaches', () => {
    it('should clear all caches', () => {
      clearAllCaches()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(CACHE_KEYS.TRANSACTIONS)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(CACHE_KEYS.FILTERS)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(CACHE_KEYS.AUTH_TOKEN)
    })
  })

  describe('getCacheSize', () => {
    it('should calculate total cache size', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === CACHE_KEYS.TRANSACTIONS) return 'data1'
        if (key === CACHE_KEYS.FILTERS) return 'data2'
        return null
      })

      const size = getCacheSize()
      expect(size).toBeGreaterThan(0)
    })

    it('should return 0 for empty cache', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const size = getCacheSize()
      expect(size).toBe(0)
    })
  })

  describe('CACHE_KEYS', () => {
    it('should have all necessary keys', () => {
      expect(CACHE_KEYS.TRANSACTIONS).toBe('bix_transactions_cache')
      expect(CACHE_KEYS.FILTERS).toBe('bix_filters')
      expect(CACHE_KEYS.AUTH_TOKEN).toBe('bix_auth_token')
    })
  })

  describe('CACHE_DURATIONS', () => {
    it('should have appropriate durations', () => {
      expect(CACHE_DURATIONS.TRANSACTIONS).toBe(5 * 60 * 1000) // 5 minutes
      expect(CACHE_DURATIONS.FILTERS).toBe(24 * 60 * 60 * 1000) // 24 hours
      expect(CACHE_DURATIONS.AUTH_TOKEN).toBe(24 * 60 * 60 * 1000) // 24 hours
    })
  })
})