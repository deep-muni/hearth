import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StaffMember, AttendanceRecord, SalaryAdjustment } from '@/app/staff-budget/types';
import { staffBudgetApi } from './api';

export const queryKeys = {
  staff: {
    all: ['staff'] as const,
    list: (includeInactive = true) => ['staff', 'list', { includeInactive }] as const,
  },
  attendance: {
    all: ['attendance'] as const,
    byMonth: (month: string, staffId?: string) =>
      ['attendance', 'byMonth', { month, staffId }] as const,
  },
  adjustments: {
    all: ['adjustments'] as const,
    byMonth: (month: string, staffId?: string) =>
      ['adjustments', 'byMonth', { month, staffId }] as const,
  },
};

export function useGetStaff(includeInactive = true) {
  return useQuery({
    queryKey: queryKeys.staff.list(includeInactive),
    queryFn: () => staffBudgetApi.getStaff(includeInactive),
  });
}

export function useSaveStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (staff: StaffMember) => staffBudgetApi.saveStaff(staff),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      hard = false,
      leftDate,
    }: {
      id: string;
      hard?: boolean;
      leftDate?: string;
    }) => staffBudgetApi.deleteStaff(id, hard, leftDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.adjustments.all });
    },
  });
}

export function useRestoreStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffBudgetApi.restoreStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}

export function useGetAttendance(month?: string, staffId?: string) {
  return useQuery({
    queryKey: month ? queryKeys.attendance.byMonth(month, staffId) : queryKeys.attendance.all,
    queryFn: () => staffBudgetApi.getAttendance(month, staffId),
  });
}

export function useSaveAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (record: Partial<AttendanceRecord>) => staffBudgetApi.saveAttendance(record),
    onSuccess: (_data, variables) => {
      if (variables.date) {
        const month = variables.date.substring(0, 7);
        queryClient.invalidateQueries({
          queryKey: ['attendance', 'byMonth', { month }],
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, date }: { staffId: string; date: string }) =>
      staffBudgetApi.deleteAttendance(staffId, date),
    onSuccess: (_data, variables) => {
      const month = variables.date.substring(0, 7);
      queryClient.invalidateQueries({
        queryKey: ['attendance', 'byMonth', { month }],
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    },
  });
}

export function useGetAdjustments(month?: string, staffId?: string) {
  return useQuery({
    queryKey: month ? queryKeys.adjustments.byMonth(month, staffId) : queryKeys.adjustments.all,
    queryFn: () => staffBudgetApi.getAdjustments(month, staffId),
  });
}

export function useSaveAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adjustment: SalaryAdjustment) => staffBudgetApi.saveAdjustment(adjustment),
    onSuccess: (_data, variables) => {
      if (variables.month) {
        queryClient.invalidateQueries({
          queryKey: ['adjustments', 'byMonth', { month: variables.month }],
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.adjustments.all });
    },
  });
}
