'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Calendar, Building2, MapPin, Factory, Filter, Menu, X } from 'lucide-react';
import { TransactionFilters } from '@/lib/types';

const HeaderContainer = styled.header`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 900;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #374151;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: flex-start;
  }
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    white-space: nowrap;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    
    label {
      min-width: 80px;
      font-size: 0.8rem;
    }
  }
  
  @media (max-width: 480px) {
    label {
      min-width: 70px;
      font-size: 0.75rem;
    }
  }
`;

const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  min-width: 140px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  @media (max-width: 768px) {
    flex: 1;
    min-width: 0;
  }
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  min-width: 140px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  @media (max-width: 768px) {
    flex: 1;
    min-width: 0;
  }
`;

const ApplyButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
  
  &:hover {
    background: #2563eb;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

interface HeaderProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  accounts: string[];
  industries: string[];
  states: string[];
  onMobileMenuToggle: () => void;
}

export default function Header({
  filters,
  onFiltersChange,
  accounts,
  industries,
  states,
  onMobileMenuToggle
}: HeaderProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleInputChange = (field: keyof TransactionFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value ? new Date(value) : null
      }
    }));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <MobileMenuButton onClick={onMobileMenuToggle}>
          <Menu size={24} />
        </MobileMenuButton>
        
        <FilterSection>
          <FilterGroup>
            <Calendar size={16} />
            <label>From:</label>
            <Input
              type="date"
              value={localFilters.dateRange.from ? localFilters.dateRange.from.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange('from', e.target.value)}
            />
          </FilterGroup>
          
          <FilterGroup>
            <Calendar size={16} />
            <label>To:</label>
            <Input
              type="date"
              value={localFilters.dateRange.to ? localFilters.dateRange.to.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange('to', e.target.value)}
            />
          </FilterGroup>
          
          <FilterGroup>
            <Building2 size={16} />
            <label>Account:</label>
            <Select
              value={localFilters.account || ''}
              onChange={(e) => handleInputChange('account', e.target.value || null)}
            >
              <option value="">All Accounts</option>
              {accounts.map(account => (
                <option key={account} value={account}>{account}</option>
              ))}
            </Select>
          </FilterGroup>
          
          <FilterGroup>
            <Factory size={16} />
            <label>Industry:</label>
            <Select
              value={localFilters.industry || ''}
              onChange={(e) => handleInputChange('industry', e.target.value || null)}
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </Select>
          </FilterGroup>
          
          <FilterGroup>
            <MapPin size={16} />
            <label>State:</label>
            <Select
              value={localFilters.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value || null)}
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </Select>
          </FilterGroup>
          
          <ApplyButton onClick={applyFilters}>
            <Filter size={16} />
            Apply Filters
          </ApplyButton>
        </FilterSection>
      </HeaderContent>
    </HeaderContainer>
  );
}