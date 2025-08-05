// Transaction data types based on transactions.json structure
export interface Transaction {
  date: number; // timestamp in milliseconds
  amount: string; // monetary value as string
  transaction_type: 'deposit' | 'withdraw';
  currency: 'brl';
  account: string; // company name
  industry: string; // industry category
  state: string; // US state abbreviation
}

// Filter types for the dashboard
export interface TransactionFilters {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  account: string | null;
  industry: string | null;
  state: string | null;
}

// Summary statistics types
export interface TransactionSummary {
  totalBalance: number;
  totalRevenue: number;
  totalExpenses: number;
  pendingTransactions: number;
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

// User authentication types (fake)
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthToken {
  token: string;
  expiresAt: number;
  user: User;
}