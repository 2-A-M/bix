// Unit tests for authentication system
import { fakeLogin, logout, getStoredToken, isAuthenticated, DEMO_CREDENTIALS } from '@/lib/auth'

// localStorage mock
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

describe('Authentication System', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
  })

  describe('fakeLogin', () => {
    it('should login with correct credentials', async () => {
      const result = await fakeLogin(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password)
      
      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('expiresAt')
      expect(result).toHaveProperty('user')
      expect(result.user.email).toBe(DEMO_CREDENTIALS.email)
      expect(result.user.name).toBe('Admin User')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'bix_auth_token',
        expect.any(String)
      )
    })

    it('should reject incorrect credentials - wrong email', async () => {
      await expect(
        fakeLogin('wrong@email.com', DEMO_CREDENTIALS.password)
      ).rejects.toThrow('Invalid credentials')
      
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('should reject incorrect credentials - wrong password', async () => {
      await expect(
        fakeLogin(DEMO_CREDENTIALS.email, 'wrongpassword')
      ).rejects.toThrow('Invalid credentials')
      
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('should reject empty credentials', async () => {
      await expect(fakeLogin('', '')).rejects.toThrow('Invalid credentials')
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('should have simulated API delay', async () => {
      const startTime = Date.now()
      await fakeLogin(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password)
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeGreaterThan(900) // At least 900ms delay
    })
  })

  describe('logout', () => {
    it('should remove token from localStorage', () => {
      logout()
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('bix_auth_token')
    })

    it('should clear authentication state after logout', () => {
      // Setup: user is authenticated
      const validToken = {
        token: 'valid_token',
        expiresAt: Date.now() + 1000000,
        user: { id: '1', email: 'test@test.com', name: 'Test User' }
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validToken))
      expect(isAuthenticated()).toBe(true)
      
      // Perform logout
      logout()
      
      // Verify token is removed
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('bix_auth_token')
      
      // Verify authentication state is cleared
      mockLocalStorage.getItem.mockReturnValue(null)
      expect(isAuthenticated()).toBe(false)
    })
  })

  describe('getStoredToken', () => {
    it('should return null if no token is stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      const token = getStoredToken()
      expect(token).toBeNull()
    })

    it('should return valid token', () => {
      const validToken = {
        token: 'valid_token',
        expiresAt: Date.now() + 1000000, // Future
        user: { id: '1', email: 'test@test.com', name: 'Test User' }
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validToken))
      const token = getStoredToken()
      
      expect(token).toEqual(validToken)
    })

    it('should remove and return null for expired token', () => {
      const expiredToken = {
        token: 'expired_token',
        expiresAt: Date.now() - 1000, // Past
        user: { id: '1', email: 'test@test.com', name: 'Test User' }
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredToken))
      const token = getStoredToken()
      
      expect(token).toBeNull()
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('bix_auth_token')
    })

    it('should handle invalid JSON', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json')
      const token = getStoredToken()
      expect(token).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true for valid token', () => {
      const validToken = {
        token: 'valid_token',
        expiresAt: Date.now() + 1000000,
        user: { id: '1', email: 'test@test.com', name: 'Test User' }
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validToken))
      expect(isAuthenticated()).toBe(true)
    })

    it('should return false for non-existent token', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      expect(isAuthenticated()).toBe(false)
    })

    it('should return false for expired token', () => {
      const expiredToken = {
        token: 'expired_token',
        expiresAt: Date.now() - 1000,
        user: { id: '1', email: 'test@test.com', name: 'Test User' }
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredToken))
      expect(isAuthenticated()).toBe(false)
    })
  })
})