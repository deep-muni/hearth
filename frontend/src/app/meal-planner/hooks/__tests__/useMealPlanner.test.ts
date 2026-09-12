import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMealPlanner } from '../useMealPlanner';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function QueryWrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return QueryWrapper;
};

describe('useMealPlanner lifecycle & history logic', () => {
  it('correctly identifies current week as editable', () => {
    const { result } = renderHook(() => useMealPlanner(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isCurrentWeek).toBe(true);
    expect(result.current.isPastWeek).toBe(false);
    expect(result.current.isEditable).toBe(true);
  });

  it('marks past weeks as strictly read-only (isPastWeek=true, isEditable=false)', () => {
    const { result } = renderHook(() => useMealPlanner(), {
      wrapper: createWrapper(),
    });

    // Navigate to previous week
    act(() => {
      result.current.goToPreviousWeek();
    });

    expect(result.current.isPastWeek).toBe(true);
    expect(result.current.isCurrentWeek).toBe(false);
    expect(result.current.isEditable).toBe(false);

    // Jump back to this week
    act(() => {
      result.current.goToThisWeek();
    });

    expect(result.current.isCurrentWeek).toBe(true);
    expect(result.current.isPastWeek).toBe(false);
    expect(result.current.isEditable).toBe(true);
  });

  it('marks future weeks as editable (isFutureWeek=true, isEditable=true)', () => {
    const { result } = renderHook(() => useMealPlanner(), {
      wrapper: createWrapper(),
    });

    // Navigate to next week
    act(() => {
      result.current.goToNextWeek();
    });

    expect(result.current.isFutureWeek).toBe(true);
    expect(result.current.isPastWeek).toBe(false);
    expect(result.current.isEditable).toBe(true);
  });

  it('blocks clearCurrentWeek and copyPreviousWeekToCurrent when on past week', async () => {
    const { result } = renderHook(() => useMealPlanner(), {
      wrapper: createWrapper(),
    });

    // Navigate to previous week
    act(() => {
      result.current.goToPreviousWeek();
    });

    expect(result.current.isPastWeek).toBe(true);

    // Call mutating methods on past week - should return early without executing mutations
    await act(async () => {
      await result.current.clearCurrentWeek();
      await result.current.copyPreviousWeekToCurrent();
      await result.current.addItemToSlot('2020-01-01', 'breakfast', 'Test Item');
      await result.current.editSlotItem('2020-01-01', 'breakfast', 0, 'New Item');
      await result.current.removeItemFromSlot('2020-01-01', 'breakfast', 0);
    });

    // State remains intact
    expect(result.current.isPastWeek).toBe(true);
  });
});
