import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSalarySummary } from '../useSalarySummary';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { staffBudgetApi } from '@/data/staff-budget/api';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function QueryWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return QueryWrapper;
};

describe('useSalarySummary', () => {
  it('computes budget totals and provides adjustment updates', async () => {
    vi.spyOn(staffBudgetApi, 'getStaff').mockResolvedValue([]);
    vi.spyOn(staffBudgetApi, 'getAttendance').mockResolvedValue([]);
    vi.spyOn(staffBudgetApi, 'getAdjustments').mockResolvedValue([]);

    const { result } = renderHook(() => useSalarySummary('2026-03'), {
      wrapper: createWrapper(),
    });

    expect(result.current.totalMonthlyBudget).toBe(0);
    expect(result.current.totalPaid).toBe(0);
    expect(result.current.totalPending).toBe(0);
    expect(typeof result.current.updateAdjustment).toBe('function');
  });
});
