'use client';

import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueExpensesChartProps {
  transactions: Transaction[];
}

export default function RevenueExpensesChart({ transactions }: RevenueExpensesChartProps) {
  const chartData = useMemo(() => {
    // Group transactions by month
    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { revenue: 0, expenses: 0 };
      }
      
      const amount = parseInt(transaction.amount);
      if (transaction.transaction_type === 'deposit') {
        acc[monthKey].revenue += amount;
      } else {
        acc[monthKey].expenses += amount;
      }
      
      return acc;
    }, {} as Record<string, { revenue: number; expenses: number }>);

    // Sort months and create chart data
    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    });

    const revenueData = sortedMonths.map(month => monthlyData[month].revenue / 100);
    const expensesData = sortedMonths.map(month => monthlyData[month].expenses / 100);

    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenueData,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
        },
        {
          label: 'Expenses',
          data: expensesData,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [transactions]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: window.innerWidth < 768 ? 11 : 12,
          },
          padding: window.innerWidth < 768 ? 12 : 20,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y * 100)}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
          maxTicksLimit: window.innerWidth < 768 ? 4 : 8,
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          maxTicksLimit: window.innerWidth < 768 ? 5 : 8,
          callback: function(value: any) {
            return formatCurrency(value * 100);
          },
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          }
        }
      },
    },
  };

  return (
    <div style={{ height: window.innerWidth < 768 ? '250px' : '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}