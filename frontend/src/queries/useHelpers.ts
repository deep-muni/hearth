'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { queryKeys } from './keys';
import { HouseHelp } from '@/types';

export function useHelpersQuery(includeInactive = true) {
  return useQuery({
    queryKey: queryKeys.helpers.list(includeInactive),
    queryFn: () => apiClient.getHelpers(includeInactive),
  });
}

export function useSaveHelperMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (helper: HouseHelp) => apiClient.saveHelper(helper),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.helpers.all });
    },
  });
}

export function useDeleteHelperMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, hard, leftDate }: { id: string; hard?: boolean; leftDate?: string }) =>
      apiClient.deleteHelper(id, hard, leftDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.helpers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.adjustments.all });
    },
  });
}

export function useRestoreHelperMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.restoreHelper(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.helpers.all });
    },
  });
}
