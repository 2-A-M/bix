// Unit tests for utility functions
import { formatCurrency, formatDate, filterTransactions, calculateSummary, getUniqueValues } from '@/lib/utils'
import { Transaction, TransactionFilters } from '@/lib/types'

// Mock test data
const mockTransactions: Transaction[] = [
  {
    date: 1682698259192, // 28 de abril de 2023
    amount: "5565", // $ 55,65
    transaction_type: "deposit",
    currency: "brl",
    account: "Baker Hughes",
    industry: "Oil and Gas Equipment",
    state: "TX"
  },
  {
    date: 1673216606378, // 8 de janeiro de 2023
    amount: "3716", // $ 37,16
    transaction_type: "withdraw",
    currency: "brl",
    account: "General Mills",
    industry: "Food Consumer Products",
    state: "MN"
  },
  {
    date: Date.now(), // Hoje
    amount: "10000", // $ 100,00
    transaction_type: "deposit",
    currency: "brl",
    account: "Test Company",
    industry: "Technology",
    state: "CA"
  }
]

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format string value correctly', () => {
      expect(formatCurrency("5565")).toMatch(/\$55\.65/)
      expect(formatCurrency("10000")).toMatch(/\$100\.00/)
      expect(formatCurrency("0")).toMatch(/\$0\.00/)
    })

    it('should format number correctly', () => {
      expect(formatCurrency(5565)).toMatch(/\$55\.65/)
      expect(formatCurrency(10000)).toMatch(/\$100\.00/)
      expect(formatCurrency(0)).toMatch(/\$0\.00/)
    })

    it('should handle negative values', () => {
      expect(formatCurrency(-5565)).toMatch(/-\$55\.65/)
    })
  })

  describe('formatDate', () => {
    it('should format timestamp correctly', () => {
      const timestamp = 1682698259192 // 4/28/2023
      const formatted = formatDate(timestamp)
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/) // mm/dd/yyyy format
    })

    it('should handle invalid timestamp', () => {
      const formatted = formatDate(0)
      // May vary depending on timezone, so we check format
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })
  })

  describe('filterTransactions', () => {
    const filters: TransactionFilters = {
      dateRange: { from: null, to: null },
      account: null,
      industry: null,
      state: null
    }

    it('should return all transactions without filters', () => {
      const filtered = filterTransactions(mockTransactions, filters)
      expect(filtered).toHaveLength(3)
    })

    it('should filter by specific account', () => {
      const accountFilter = { ...filters, account: "Baker Hughes" }
      const filtered = filterTransactions(mockTransactions, accountFilter)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].account).toBe("Baker Hughes")
    })

    it('should filter by specific industry', () => {
      const industryFilter = { ...filters, industry: "Technology" }
      const filtered = filterTransactions(mockTransactions, industryFilter)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].industry).toBe("Technology")
    })

    it('should filter by specific state', () => {
      const stateFilter = { ...filters, state: "TX" }
      const filtered = filterTransactions(mockTransactions, stateFilter)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].state).toBe("TX")
    })

    it('should filter by date range', () => {
      const dateFilter = {
        ...filters,
        dateRange: {
          from: new Date('2023-01-01'),
          to: new Date('2023-12-31')
        }
      }
      const filtered = filterTransactions(mockTransactions, dateFilter)
      expect(filtered.length).toBeGreaterThan(0)
    })

    it('should combine multiple filters', () => {
      const multiFilter = {
        ...filters,
        state: "TX",
        industry: "Oil and Gas Equipment"
      }
      const filtered = filterTransactions(mockTransactions, multiFilter)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].state).toBe("TX")
      expect(filtered[0].industry).toBe("Oil and Gas Equipment")
    })
  })

  describe('calculateSummary', () => {
    it('should calculate summary correctly', () => {
      const summary = calculateSummary(mockTransactions)
      
      expect(summary.totalRevenue).toBe(15565) // 5565 + 10000
      expect(summary.totalExpenses).toBe(3716)
      expect(summary.totalBalance).toBe(11849) // 15565 - 3716
      expect(summary.pendingTransactions).toBe(1) // Today's transaction
    })

    it('should handle empty array', () => {
      const summary = calculateSummary([])
      
      expect(summary.totalRevenue).toBe(0)
      expect(summary.totalExpenses).toBe(0)
      expect(summary.totalBalance).toBe(0)
      expect(summary.pendingTransactions).toBe(0)
    })

    it('should calculate only revenue', () => {
      const onlyDeposits = mockTransactions.filter(t => t.transaction_type === 'deposit')
      const summary = calculateSummary(onlyDeposits)
      
      expect(summary.totalRevenue).toBe(15565)
      expect(summary.totalExpenses).toBe(0)
      expect(summary.totalBalance).toBe(15565)
    })
  })

  describe('getUniqueValues', () => {
    it('should return unique values for accounts', () => {
      const uniqueAccounts = getUniqueValues(mockTransactions, 'account')
      expect(uniqueAccounts).toHaveLength(3)
      expect(uniqueAccounts).toContain("Baker Hughes")
      expect(uniqueAccounts).toContain("General Mills")
      expect(uniqueAccounts).toContain("Test Company")
    })

    it('should return unique values for industries', () => {
      const uniqueIndustries = getUniqueValues(mockTransactions, 'industry')
      expect(uniqueIndustries).toHaveLength(3)
      expect(uniqueIndustries).toContain("Oil and Gas Equipment")
      expect(uniqueIndustries).toContain("Food Consumer Products")
      expect(uniqueIndustries).toContain("Technology")
    })

    it('should return unique values for states', () => {
      const uniqueStates = getUniqueValues(mockTransactions, 'state')
      expect(uniqueStates).toHaveLength(3)
      expect(uniqueStates).toContain("TX")
      expect(uniqueStates).toContain("MN")
      expect(uniqueStates).toContain("CA")
    })

    it('should return empty array for empty array', () => {
      const unique = getUniqueValues([], 'account')
      expect(unique).toHaveLength(0)
    })

    it('should sort values alphabetically', () => {
      const uniqueStates = getUniqueValues(mockTransactions, 'state')
      expect(uniqueStates[0]).toBe("CA") // First alphabetically
      expect(uniqueStates).toEqual(["CA", "MN", "TX"])
    })
  })
})