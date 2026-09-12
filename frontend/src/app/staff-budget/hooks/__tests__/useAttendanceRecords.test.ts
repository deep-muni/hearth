import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAttendanceRecords } from '../useAttendanceRecords';
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

describe('useAttendanceRecords', () => {
  it('provides attendance operations', async () => {
    vi.spyOn(staffBudgetApi, 'getAttendance').mockResolvedValue([]);

    const { result } = renderHook(() => useAttendanceRecords('2026-03'), {
      wrapper: createWrapper(),
    });

    expect(result.current.attendance).toEqual([]);
    expect(typeof result.current.setAttendance).toBe('function');
    expect(typeof result.current.setItemCount).toBe('function');
    expect(typeof result.current.removeAttendance).toBe('function');
  });
});
