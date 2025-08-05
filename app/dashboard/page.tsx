'use client';

import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import Header from '@/components/Header';
import SummaryCards from './cards/SummaryCards';
import RevenueExpensesChart from './charts/RevenueExpensesChart';
import BalanceEvolutionChart from './charts/BalanceEvolutionChart';
import TransactionTable from './components/TransactionTable';
import { useTransactions } from '@/lib/hooks';
import { TransactionFilters } from '@/lib/types';
import { 
  filterTransactions, 
  calculateSummary, 
  getUniqueValues,
  loadFiltersFromStorage,
  saveFiltersToStorage
} from '@/lib/utils';
import { useMobileMenu } from '@/lib/context';



const DashboardContent = styled.div`
  min-height: 100vh;
`;

const ContentArea = styled.div`
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.125rem;
  color: #6b7280;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  flex-direction: column;
  gap: 1rem;
  
  h2 {
    color: #dc2626;
    margin: 0;
  }
  
  p {
    color: #6b7280;
    margin: 0;
    text-align: center;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  
  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 10px;
    
    h3 {
      font-size: 1rem;
      margin-bottom: 0.75rem;
    }
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 8px;
    
    h3 {
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
  }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  
  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }
`;



export default function DashboardPage() {
  const { transactions, isLoading, error } = useTransactions();
  const { toggleMobileMenu } = useMobileMenu();
  
  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: { from: null, to: null },
    account: null,
    industry: null,
    state: null
  });

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = loadFiltersFromStorage();
    if (savedFilters) {
      setFilters(savedFilters);
    }
  }, []);

  // Save filters to localStorage when they change
  useEffect(() => {
    saveFiltersToStorage(filters);
  }, [filters]);

  // Memoized computations
  const { filteredTransactions, uniqueAccounts, uniqueIndustries, uniqueStates, summary } = useMemo(() => {
    const filtered = filterTransactions(transactions, filters);
    
    return {
      filteredTransactions: filtered,
      uniqueAccounts: getUniqueValues(transactions, 'account'),
      uniqueIndustries: getUniqueValues(transactions, 'industry'),
      uniqueStates: getUniqueValues(transactions, 'state'),
      summary: calculateSummary(filtered)
    };
  }, [transactions, filters]);



  if (isLoading) {
    return (
      <DashboardContent>
        <LoadingContainer>
          Loading financial data...
        </LoadingContainer>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent>
        <ErrorContainer>
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <p>Make sure the transactions.json file is available and try refreshing the page.</p>
        </ErrorContainer>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Header
        filters={filters}
        onFiltersChange={setFilters}
        accounts={uniqueAccounts}
        industries={uniqueIndustries}
        states={uniqueStates}
        onMobileMenuToggle={toggleMobileMenu}
      />
      
      <ContentArea>
        <SummaryCards summary={summary} />
        
        <ChartsGrid>
          <ChartCard>
            <h3>Revenue vs Expenses</h3>
            <RevenueExpensesChart transactions={filteredTransactions} />
          </ChartCard>
          
          <ChartCard>
            <h3>Balance Evolution</h3>
            <BalanceEvolutionChart transactions={filteredTransactions} />
          </ChartCard>
        </ChartsGrid>
        
        <TransactionTable transactions={filteredTransactions} />
      </ContentArea>
      

    </DashboardContent>
  );
}