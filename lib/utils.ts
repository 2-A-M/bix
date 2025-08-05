import { Transaction, TransactionFilters, TransactionSummary } from './types';
import { CACHE_KEYS, CACHE_DURATIONS, CacheEntry, isCacheValid } from './cache';

// Utility function to format currency
export const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseInt(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numAmount / 100); // Assuming values are in cents
};

// Utility function to format date
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US');
};

// Filter transactions based on current filters
export const filterTransactions = (
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] => {
  return transactions.filter(transaction => {
    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      const transactionDate = new Date(transaction.date);
      if (filters.dateRange.from && transactionDate < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && transactionDate > filters.dateRange.to) {
        return false;
      }
    }

    // Account filter
    if (filters.account && transaction.account !== filters.account) {
      return false;
    }

    // Industry filter
    if (filters.industry && transaction.industry !== filters.industry) {
      return false;
    }

    // State filter
    if (filters.state && transaction.state !== filters.state) {
      return false;
    }

    return true;
  });
};

// Calculate transaction summary
export const calculateSummary = (transactions: Transaction[]): TransactionSummary => {
  const revenue = transactions
    .filter(t => t.transaction_type === 'deposit')
    .reduce((sum, t) => sum + parseInt(t.amount), 0);

  const expenses = transactions
    .filter(t => t.transaction_type === 'withdraw')
    .reduce((sum, t) => sum + parseInt(t.amount), 0);

  // Consider today's transactions as pending
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pendingTransactions = transactions.filter(
    t => new Date(t.date) >= today
  ).length;

  return {
    totalBalance: revenue - expenses,
    totalRevenue: revenue,
    totalExpenses: expenses,
    pendingTransactions
  };
};

// Get unique values for filter dropdowns
export const getUniqueValues = (transactions: Transaction[], field: keyof Transaction): string[] => {
  const uniqueSet = new Set(transactions.map(t => t[field] as string));
  const uniqueValues = Array.from(uniqueSet);
  return uniqueValues.sort();
};

// localStorage utilities with optimized cache
export const saveFiltersToStorage = (filters: TransactionFilters): void => {
  if (typeof window !== 'undefined') {
    try {
      const cacheEntry: CacheEntry<TransactionFilters> = {
        data: filters,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(CACHE_KEYS.FILTERS, JSON.stringify(cacheEntry));
    } catch (err) {
      console.warn('Error saving filters:', err);
    }
  }
};

export const loadFiltersFromStorage = (): TransactionFilters | null => {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEYS.FILTERS);
    if (!cached) return null;

    const cacheEntry: CacheEntry<TransactionFilters> = JSON.parse(cached);
    
    // Check if cache is valid
    if (!isCacheValid(cacheEntry, CACHE_DURATIONS.FILTERS)) {
      localStorage.removeItem(CACHE_KEYS.FILTERS);
      return null;
    }

    const filters = cacheEntry.data;
    // Convert date strings back to Date objects
    if (filters.dateRange.from) {
      filters.dateRange.from = new Date(filters.dateRange.from);
    }
    if (filters.dateRange.to) {
      filters.dateRange.to = new Date(filters.dateRange.to);
    }

    return filters;
  } catch (err) {
    console.warn('Error loading filters from cache:', err);
    localStorage.removeItem(CACHE_KEYS.FILTERS);
    return null;
  }
};