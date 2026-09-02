'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { queryKeys } from './keys';
import { AttendanceRecord } from '@/types';

export function useAttendanceQuery(month?: string, helperId?: string) {
  return useQuery({
    queryKey: queryKeys.attendance.byMonth(month || '', helperId),
    queryFn: () => apiClient.getAttendance(month, helperId),
  });
}

export function useSetAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (record: Partial<AttendanceRecord>) => apiClient.saveAttendance(record),
    onMutate: async (newRecord) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.attendance.all });

      const month = newRecord.date ? newRecord.date.substring(0, 7) : '';
      const previousRecords = queryClient.getQueryData<AttendanceRecord[]>(
        queryKeys.attendance.byMonth(month, newRecord.helperId)
      );

      if (previousRecords) {
        const updated = previousRecords.filter(
          (r) => !(r.helperId === newRecord.helperId && r.date === newRecord.date)
        );
        updated.push({
          id: newRecord.id || `temp_${Date.now()}`,
          helperId: newRecord.helperId!,
          date: newRecord.date!,
          status: newRecord.status,
          itemCount: newRecord.itemCount,
          customRate: newRecord.customRate,
          note: newRecord.note,
          updatedAt: new Date().toISOString(),
        });
        queryClient.setQueryData(queryKeys.attendance.byMonth(month, newRecord.helperId), updated);
      }

      return { previousRecords, month, helperId: newRecord.helperId };
    },
    onError: (_err, _newRecord, context) => {
      if (context?.previousRecords) {
        queryClient.setQueryData(
          queryKeys.attendance.byMonth(context.month, context.helperId),
          context.previousRecords
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    },
  });
}

export function useRemoveAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ helperId, date }: { helperId: string; date: string }) =>
      apiClient.deleteAttendance(helperId, date),
    onMutate: async ({ helperId, date }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.attendance.all });

      const month = date.substring(0, 7);
      const previousRecords = queryClient.getQueryData<AttendanceRecord[]>(
        queryKeys.attendance.byMonth(month, helperId)
      );

      if (previousRecords) {
        const filtered = previousRecords.filter(
          (r) => !(r.helperId === helperId && r.date === date)
        );
        queryClient.setQueryData(queryKeys.attendance.byMonth(month, helperId), filtered);
      }

      return { previousRecords, month, helperId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousRecords) {
        queryClient.setQueryData(
          queryKeys.attendance.byMonth(context.month, context.helperId),
          context.previousRecords
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    },
  });
}
