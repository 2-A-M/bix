'use client';

import styled from 'styled-components';
import { TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { TransactionSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 8px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CardIcon = styled.div<{ $variant: 'success' | 'danger' | 'primary' | 'warning' }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.$variant) {
      case 'success': return 'linear-gradient(135deg, #10b981, #065f46)';
      case 'danger': return 'linear-gradient(135deg, #ef4444, #b91c1c)';
      case 'primary': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'warning': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      default: return 'linear-gradient(135deg, #6b7280, #374151)';
    }
  }};
  color: white;
`;

const CardValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.875rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.625rem;
  }
`;

const CardSubtitle = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const BalanceCard = styled(Card)<{ $isPositive: boolean }>`
  background: ${props => props.$isPositive 
    ? 'linear-gradient(135deg, #ecfdf5, #f0fdf4)' 
    : 'linear-gradient(135deg, #fef2f2, #fef2f2)'};
  border-color: ${props => props.$isPositive ? '#bbf7d0' : '#fecaca'};
`;

interface SummaryCardsProps {
  summary: TransactionSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const isPositiveBalance = summary.totalBalance >= 0;

  return (
    <CardsGrid>
      <BalanceCard $isPositive={isPositiveBalance}>
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
          <CardIcon $variant={isPositiveBalance ? 'success' : 'danger'}>
            <DollarSign size={20} />
          </CardIcon>
        </CardHeader>
        <CardValue style={{ color: isPositiveBalance ? '#059669' : '#dc2626' }}>
          {formatCurrency(summary.totalBalance)}
        </CardValue>
        <CardSubtitle>
          Current financial position
        </CardSubtitle>
      </BalanceCard>

      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
          <CardIcon $variant="success">
            <TrendingUp size={20} />
          </CardIcon>
        </CardHeader>
        <CardValue style={{ color: '#059669' }}>
          {formatCurrency(summary.totalRevenue)}
        </CardValue>
        <CardSubtitle>
          All received deposits
        </CardSubtitle>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
          <CardIcon $variant="danger">
            <TrendingDown size={20} />
          </CardIcon>
        </CardHeader>
        <CardValue style={{ color: '#dc2626' }}>
          {formatCurrency(summary.totalExpenses)}
        </CardValue>
        <CardSubtitle>
          All withdrawals made
        </CardSubtitle>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Transactions</CardTitle>
          <CardIcon $variant="warning">
            <Clock size={20} />
          </CardIcon>
        </CardHeader>
        <CardValue style={{ color: '#d97706' }}>
          {summary.pendingTransactions}
        </CardValue>
        <CardSubtitle>
          Today&apos;s transactions
        </CardSubtitle>
      </Card>
    </CardsGrid>
  );
}