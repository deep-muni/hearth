import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStaffBudget } from '../useStaffBudget';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function QueryWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return QueryWrapper;
};

describe('useStaffBudget', () => {
  it('initializes with default month and tab', () => {
    const { result } = renderHook(() => useStaffBudget('2026-03'), {
      wrapper: createWrapper(),
    });
    expect(result.current.currentMonth).toBe('2026-03');
    expect(result.current.activeTab).toBe('calendar');
  });

  it('updates tab correctly', () => {
    const { result } = renderHook(() => useStaffBudget('2026-03'), {
      wrapper: createWrapper(),
    });
    act(() => {
      result.current.setActiveTab('summary');
    });
    expect(result.current.activeTab).toBe('summary');
  });
});
