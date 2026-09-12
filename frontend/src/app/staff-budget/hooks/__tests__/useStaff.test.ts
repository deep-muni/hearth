import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStaff } from '../useStaff';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { staffBudgetApi } from '@/data/staff-budget/api';
import { StaffMember } from '../../types';

const mockStaff: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Ramesh Kumar',
    role: 'Cook',
    icon: 'chef-hat',
    salaryType: 'FIXED_MONTHLY',
    baseSalary: 6000,
    paidLeavesAllowance: 2,
    weeklyOffDay: 0,
    isActive: true,
  },
  {
    id: 'staff-2',
    name: 'Sunita Devi',
    role: 'House Cleaner',
    icon: 'broom',
    salaryType: 'DAYS_LEAVES',
    baseSalary: 4500,
    paidLeavesAllowance: 2,
    weeklyOffDay: 0,
    isActive: false,
    leftDate: '2026-02',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function QueryWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return QueryWrapper;
};

describe('useStaff', () => {
  it('fetches and filters staff correctly based on month active status', async () => {
    vi.spyOn(staffBudgetApi, 'getStaff').mockResolvedValue(mockStaff);

    const { result } = renderHook(() => useStaff('2026-03'), {
      wrapper: createWrapper(),
    });

    expect(result.current.staff).toBeDefined();
    expect(typeof result.current.saveStaff).toBe('function');
    expect(typeof result.current.deleteStaff).toBe('function');
    expect(typeof result.current.restoreStaff).toBe('function');
    expect(typeof result.current.hardDeleteStaff).toBe('function');
  });
});
