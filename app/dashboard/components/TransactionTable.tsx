'use client';

import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  
  h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* Fix table layout to prevent size changes */
  
  th, td {
    text-align: left;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f3f4f6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Define fixed widths for each column */
  th:nth-child(1), td:nth-child(1) { width: 12%; } /* Date */
  th:nth-child(2), td:nth-child(2) { width: 10%; } /* Type */
  th:nth-child(3), td:nth-child(3) { width: 25%; } /* Account */
  th:nth-child(4), td:nth-child(4) { width: 15%; } /* Amount */
  th:nth-child(5), td:nth-child(5) { width: 8%; }  /* State */
  th:nth-child(6), td:nth-child(6) { width: 30%; } /* Industry */
  
  th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
    position: sticky;
    top: 0;
    cursor: pointer;
    user-select: none;
    
    &:hover {
      background: #f3f4f6;
    }
  }
  
  td {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  tr:hover {
    background: #f9fafb;
  }
`;

const TransactionType = styled.span<{ $type: 'deposit' | 'withdraw' }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  white-space: nowrap;
  
  background: ${props => props.$type === 'deposit' ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.$type === 'deposit' ? '#166534' : '#991b1b'};
`;

const Amount = styled.span<{ $type: 'deposit' | 'withdraw' }>`
  font-weight: 600;
  color: ${props => props.$type === 'deposit' ? '#059669' : '#dc2626'};
  display: inline-flex;
  align-items: center;
  font-family: 'Courier New', monospace; /* Monospace font for better alignment */
  min-width: 80px; /* Fixed minimum width for alignment */
`;

const Pagination = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const PaginationInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  flex: 1;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageSelect = styled.select`
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const SortHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ResponsiveTable = styled.div`
  overflow-x: auto;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    
    th, td {
      padding: 0.5rem;
    }
    
    /* Ajustar larguras em mobile mantendo proporções */
    table {
      min-width: 700px; /* Garantir largura mínima para scroll horizontal */
    }
  }
`;

const MobileCardList = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MobileCardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MobileCardLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const MobileCardValue = styled.span`
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
`;

const DesktopTable = styled.div`
  display: block;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

interface TransactionTableProps {
  transactions: Transaction[];
  pageSize?: number;
}

type SortField = keyof Transaction;
type SortDirection = 'asc' | 'desc';

export default function TransactionTable({ transactions, pageSize = 10 }: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Convert to numbers for amount and date
      if (sortField === 'amount') {
        aVal = parseInt(a.amount);
        bVal = parseInt(b.amount);
      } else if (sortField === 'date') {
        aVal = a.date;
        bVal = b.date;
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [transactions, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedTransactions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTransactions = sortedTransactions.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  return (
    <TableContainer>
      <TableHeader>
        <h3>Transaction History ({transactions.length} transactions)</h3>
      </TableHeader>
      
      {/* Desktop Table View */}
      <DesktopTable>
        <ResponsiveTable>
          <Table>
            <thead>
              <tr>
                <th onClick={() => handleSort('date')}>
                  <SortHeader>
                    Date <ArrowUpDown size={14} />
                  </SortHeader>
                </th>
                <th onClick={() => handleSort('transaction_type')}>
                  <SortHeader>
                    Type <ArrowUpDown size={14} />
                  </SortHeader>
                </th>
                <th onClick={() => handleSort('account')}>
                  <SortHeader>
                    Account <ArrowUpDown size={14} />
                  </SortHeader>
                </th>
                <th onClick={() => handleSort('amount')}>
                  <SortHeader>
                    Amount <ArrowUpDown size={14} />
                  </SortHeader>
                </th>
                <th onClick={() => handleSort('state')}>
                  <SortHeader>
                    State <ArrowUpDown size={14} />
                  </SortHeader>
                </th>
                <th onClick={() => handleSort('industry')}>
                  <SortHeader>
                    Industry <ArrowUpDown size={14} />
                  </SortHeader>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map((transaction, index) => (
                <tr key={`${transaction.date}-${index}`}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>
                    <TransactionType $type={transaction.transaction_type}>
                      {transaction.transaction_type === 'deposit' ? 'deposit' : 'withdraw'}
                    </TransactionType>
                  </td>
                  <td title={transaction.account}>{transaction.account}</td>
                  <td>
                    <Amount $type={transaction.transaction_type}>
                      <span style={{ width: '12px', textAlign: 'center' }}>
                        {transaction.transaction_type === 'deposit' ? '+' : '−'}
                      </span>
                      <span>{formatCurrency(transaction.amount).replace('$', '')}</span>
                    </Amount>
                  </td>
                  <td>{transaction.state}</td>
                  <td title={transaction.industry}>{transaction.industry}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ResponsiveTable>
      </DesktopTable>

      {/* Mobile Card View */}
      <MobileCardList>
        {currentTransactions.map((transaction, index) => (
          <MobileCard key={`${transaction.date}-${index}`}>
            <MobileCardRow>
              <MobileCardLabel>Date</MobileCardLabel>
              <MobileCardValue>{formatDate(transaction.date)}</MobileCardValue>
            </MobileCardRow>
            <MobileCardRow>
              <MobileCardLabel>Type</MobileCardLabel>
              <TransactionType $type={transaction.transaction_type}>
                {transaction.transaction_type === 'deposit' ? 'deposit' : 'withdraw'}
              </TransactionType>
            </MobileCardRow>
            <MobileCardRow>
              <MobileCardLabel>Amount</MobileCardLabel>
              <Amount $type={transaction.transaction_type}>
                <span style={{ width: '12px', textAlign: 'center' }}>
                  {transaction.transaction_type === 'deposit' ? '+' : '−'}
                </span>
                <span>{formatCurrency(transaction.amount).replace('$', '')}</span>
              </Amount>
            </MobileCardRow>
            <MobileCardRow>
              <MobileCardLabel>Account</MobileCardLabel>
              <MobileCardValue>{transaction.account}</MobileCardValue>
            </MobileCardRow>
            <MobileCardRow>
              <MobileCardLabel>State</MobileCardLabel>
              <MobileCardValue>{transaction.state}</MobileCardValue>
            </MobileCardRow>
            <MobileCardRow>
              <MobileCardLabel>Industry</MobileCardLabel>
              <MobileCardValue>{transaction.industry}</MobileCardValue>
            </MobileCardRow>
          </MobileCard>
        ))}
      </MobileCardList>
      
      <Pagination>
        <PaginationInfo>
          Showing {startIndex + 1}-{Math.min(endIndex, transactions.length)} of {transactions.length} transactions
        </PaginationInfo>
        
        <PaginationControls>
          <PaginationButton 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </PaginationButton>
          
          <PageSelect 
            value={currentPage} 
            onChange={(e) => handlePageChange(parseInt(e.target.value))}
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Page {i + 1}
              </option>
            ))}
          </PageSelect>
          
          <PaginationButton 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </PaginationButton>
        </PaginationControls>
      </Pagination>
    </TableContainer>
  );
}