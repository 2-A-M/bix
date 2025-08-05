'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface BalanceEvolutionChartProps {
  transactions: Transaction[];
}

export default function BalanceEvolutionChart({ transactions }: BalanceEvolutionChartProps) {
  const chartData = useMemo(() => {
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => a.date - b.date);
    
    // Calculate running balance
    let balance = 0;
    const balanceHistory: { date: Date; balance: number }[] = [];
    
    // Group by day for cleaner chart
    const dailyBalances = new Map<string, number>();
    
    sortedTransactions.forEach(transaction => {
      const amount = parseInt(transaction.amount);
      if (transaction.transaction_type === 'deposit') {
        balance += amount;
      } else {
        balance -= amount;
      }
      
      const date = new Date(transaction.date);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      dailyBalances.set(dayKey, balance);
    });

    // Convert to arrays for chart
    const sortedDays = Array.from(dailyBalances.keys()).sort();
    const labels = sortedDays.map(day => {
      const date = new Date(day);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: sortedDays.length > 30 ? 'numeric' : undefined 
      });
    });
    
    const balanceData = sortedDays.map(day => dailyBalances.get(day)! / 100);

    return {
      labels,
      datasets: [
        {
          label: 'Balance',
          data: balanceData,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [transactions]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Balance: ${formatCurrency(context.parsed.y * 100)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: false, // Remove redundant X-axis label
        },
        ticks: {
          maxTicksLimit: window.innerWidth < 768 ? 6 : 10, // Fewer labels on mobile
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          }
        }
      },
      y: {
        beginAtZero: false,
        title: {
          display: false, // Remove redundant Y-axis label
        },
        ticks: {
          maxTicksLimit: window.innerWidth < 768 ? 5 : 8, // Fewer Y-axis labels on mobile
          callback: function(value: any) {
            return formatCurrency(value * 100);
          },
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          }
        }
      },
    },
    elements: {
      point: {
        hoverRadius: window.innerWidth < 768 ? 6 : 8,
        radius: window.innerWidth < 768 ? 2 : 3,
      }
    }
  };

  return (
    <div style={{ height: window.innerWidth < 768 ? '250px' : '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}