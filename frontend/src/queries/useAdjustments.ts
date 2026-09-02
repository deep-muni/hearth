'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { queryKeys } from './keys';
import { MonthlyAdjustment } from '@/types';

export function useAdjustmentsQuery(month?: string, helperId?: string) {
  return useQuery({
    queryKey: queryKeys.adjustments.byMonth(month || '', helperId),
    queryFn: () => apiClient.getAdjustments(month, helperId),
  });
}

export function useUpdateAdjustmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adj: MonthlyAdjustment) => apiClient.saveAdjustment(adj),
    onMutate: async (newAdj) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.adjustments.all });

      const previousAdjustments = queryClient.getQueryData<MonthlyAdjustment[]>(
        queryKeys.adjustments.byMonth(newAdj.month, newAdj.helperId)
      );

      if (previousAdjustments) {
        const updated = previousAdjustments.filter(
          (a) => !(a.helperId === newAdj.helperId && a.month === newAdj.month)
        );
        updated.push(newAdj);
        queryClient.setQueryData(
          queryKeys.adjustments.byMonth(newAdj.month, newAdj.helperId),
          updated
        );
      }

      return { previousAdjustments, month: newAdj.month, helperId: newAdj.helperId };
    },
    onError: (_err, _newAdj, context) => {
      if (context?.previousAdjustments) {
        queryClient.setQueryData(
          queryKeys.adjustments.byMonth(context.month, context.helperId),
          context.previousAdjustments
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adjustments.all });
    },
  });
}
